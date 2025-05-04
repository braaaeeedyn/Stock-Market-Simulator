import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MarketDisplay.css';
import audioService from '../services/AudioService';

function MarketDisplay({ onStockSelect, setEvents, onDayAdvance, onMarketDataUpdate }) {
    const [marketData, setMarketData] = useState({});
    const [day, setDay] = useState(0);
    const [loading, setLoading] = useState(false);
    const [cooldownActive, setCooldownActive] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);
    
    // Sorting states
    const [sortColumn, setSortColumn] = useState('symbol');
    const [sortDirection, setSortDirection] = useState('asc');
    
    const fetchMarketData = async () => {
        try {
            const response = await axios.get('/market/status');
            const newMarketData = response.data.stocks;
            setMarketData(newMarketData);
            setDay(response.data.day);
            
            // Notify parent component about market data update
            if (onMarketDataUpdate) {
                onMarketDataUpdate(newMarketData);
            }
            
            // Notify parent component about day change
            if (onDayAdvance) {
                onDayAdvance(response.data.day);
            }
        } catch (error) {
            console.error("Error fetching market data:", error);
        }
    };
    
    const advanceDay = async () => {
        // Play day advance sound immediately when button is clicked
        audioService.playSound('dayAdvance');
        
        setLoading(true);
        try {
            // Start advancing the day right away
            const advancePromise = axios.post('/market/advance-day');
            
            // Pre-fetch stock data for faster processing
            setTimeout(async () => {
                try {
                    // This pre-fetch helps the backend complete processing without waiting for frontend request
                    await axios.get('/market/status');
                } catch (e) {
                    // Ignore errors on pre-fetch attempt
                }
            }, 300);
            
            // Wait for advance-day to complete
            const response = await advancePromise;
            console.log("Day advanced:", response.data);
            
            // Don't wait for fetchMarketData to complete before updating UI state
            fetchMarketData();
            
            // Set any events that occurred
            if (response.data.events && response.data.events.length > 0) {
                setEvents(response.data.events);
            }
            
            // Start cooldown timer
            startCooldown();
        } catch (error) {
            console.error("Error advancing day:", error);
        } finally {
            setLoading(false);
        }
    };
    
    // Function to start the cooldown timer
    const startCooldown = () => {
        setCooldownActive(true);
        setCooldownTime(10); // Changed back to 10 seconds as requested
    };
    
    // Cooldown timer effect
    useEffect(() => {
        if (!cooldownActive || cooldownTime <= 0) return;
        
        const timer = setInterval(() => {
            setCooldownTime(prevTime => {
                if (prevTime <= 1) {
                    setCooldownActive(false);
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [cooldownActive, cooldownTime]);
    
    useEffect(() => {
        fetchMarketData();
        // Reduce polling frequency from 30 seconds to 60 seconds to reduce server load
        const interval = setInterval(fetchMarketData, 60000);
        return () => clearInterval(interval);
    }, [onDayAdvance]);
    
    const handleStockClick = (symbol) => {
        onStockSelect(symbol);
    };
    
    // Function to calculate percentage change
    const calculatePercentChange = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };
    
    // Function to render change with appropriate icon
    const renderChangeWithIcon = (percentChange) => {
        if (percentChange === 0) {
            return <span className="neutral">→ 0.00%</span>;
        }
        
        const icon = percentChange > 0 ? '↑' : '↓';
        const className = percentChange > 0 ? 'positive' : 'negative';
        
        return (
            <span className={className}>
                {icon} {Math.abs(percentChange).toFixed(2)}%
            </span>
        );
    };
    
    // Handle column header click for sorting
    const handleSort = (column) => {
        // If clicking the same column, toggle direction
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // If clicking a new column, set it as sort column with ascending order
            setSortColumn(column);
            setSortDirection('asc');
        }
    };
    
    // Function to render sort indicator
    const renderSortIndicator = (column) => {
        if (sortColumn !== column) {
            // Default neutral state (gray)
            return (
                <span className="sort-indicator neutral-indicator">
                    ↕
                </span>
            );
        }
        
        // Active state - either ascending (green) or descending (red)
        const indicatorClass = sortDirection === 'asc' ? 'ascending-indicator' : 'descending-indicator';
        
        return (
            <span className={`sort-indicator ${indicatorClass}`}>
                ↕
            </span>
        );
    };
    
    // Function to capitalize the first letter of each word in the sector name
    const formatSector = (sector) => {
        if (!sector) return '';
        return sector.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    
    // Sort the stocks based on current sort settings
    const getSortedStocks = () => {
        const stockEntries = Object.entries(marketData);
        
        return stockEntries.sort((a, b) => {
            const [symbolA, dataA] = a;
            const [symbolB, dataB] = b;
            
            // Default sorting by symbol
            if (sortColumn === 'symbol') {
                return sortDirection === 'asc' 
                    ? symbolA.localeCompare(symbolB) 
                    : symbolB.localeCompare(symbolA);
            }
            
            // Price sorting
            if (sortColumn === 'price') {
                const priceA = dataA.current_price;
                const priceB = dataB.current_price;
                return sortDirection === 'asc' 
                    ? priceA - priceB 
                    : priceB - priceA;
            }
            
            // Daily change sorting
            if (sortColumn === 'dailyChange') {
                const dailyChangeA = calculatePercentChange(dataA.current_price, dataA.previous_price);
                const dailyChangeB = calculatePercentChange(dataB.current_price, dataB.previous_price);
                return sortDirection === 'asc' 
                    ? dailyChangeA - dailyChangeB 
                    : dailyChangeB - dailyChangeA;
            }
            
            // Overall change sorting
            if (sortColumn === 'overallChange') {
                const overallChangeA = calculatePercentChange(dataA.current_price, dataA.initial_price);
                const overallChangeB = calculatePercentChange(dataB.current_price, dataB.initial_price);
                return sortDirection === 'asc' 
                    ? overallChangeA - overallChangeB 
                    : overallChangeB - overallChangeA;
            }
            
            // Sector sorting
            if (sortColumn === 'sector') {
                const sectorA = dataA.sector || '';
                const sectorB = dataB.sector || '';
                return sortDirection === 'asc' 
                    ? sectorA.localeCompare(sectorB) 
                    : sectorB.localeCompare(sectorA);
            }
            
            return 0;
        });
    };
    
    return (
        <div className="market-display">
            <div className="market-header">
                <h2>Market Overview (Day {day})</h2>
                <div className="day-advance-controls">
                    {cooldownActive && (
                        <div className="cooldown-timer">
                            Next day in <span className="time-remaining">{cooldownTime}s</span>
                        </div>
                    )}
                    <button 
                        onClick={advanceDay} 
                        disabled={loading || cooldownActive}
                        className="advance-day-btn"
                    >
                        {loading ? 'Processing...' : 'Advance Day'}
                    </button>
                </div>
            </div>
            
            <div className="stocks-list">
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('symbol')} className="sortable-header">
                                Symbol {renderSortIndicator('symbol')}
                            </th>
                            <th onClick={() => handleSort('sector')} className="sortable-header">
                                Sector {renderSortIndicator('sector')}
                            </th>
                            <th onClick={() => handleSort('price')} className="sortable-header">
                                Price {renderSortIndicator('price')} <span className="static-indicator">$</span>
                            </th>
                            <th onClick={() => handleSort('dailyChange')} className="sortable-header">
                                Daily Change (%) {renderSortIndicator('dailyChange')} <span className="static-indicator">24h</span>
                            </th>
                            <th onClick={() => handleSort('overallChange')} className="sortable-header">
                                Overall Change (%) {renderSortIndicator('overallChange')} <span className="static-indicator">All</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {getSortedStocks().map(([symbol, stockData]) => {
                            const currentPrice = stockData.current_price;
                            const previousPrice = stockData.previous_price;
                            const initialPrice = stockData.initial_price;
                            const sector = stockData.sector;
                            
                            const dailyChange = calculatePercentChange(currentPrice, previousPrice);
                            const overallChange = calculatePercentChange(currentPrice, initialPrice);
                            
                            return (
                                <tr 
                                    key={symbol} 
                                    onClick={() => handleStockClick(symbol)}
                                    className="stock-row"
                                >
                                    <td>{symbol}</td>
                                    <td className="sector-cell">{formatSector(sector)}</td>
                                    <td>${parseFloat(currentPrice).toFixed(2)}</td>
                                    <td className={`change ${dailyChange > 0 ? 'positive' : dailyChange < 0 ? 'negative' : ''}`}>
                                        {renderChangeWithIcon(dailyChange)}
                                    </td>
                                    <td className={`change ${overallChange > 0 ? 'positive' : overallChange < 0 ? 'negative' : ''}`}>
                                        {renderChangeWithIcon(overallChange)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MarketDisplay;