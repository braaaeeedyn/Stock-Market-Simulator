import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './EconomicIndicators.css';

function EconomicIndicators({ day, marketData, sectorData }) {
  const [indicators, setIndicators] = useState({
    inflation: 2.0, // Base inflation rate (%)
    interestRate: 3.0, // Base interest rate (%)
    unemployment: 5.0, // Base unemployment rate (%)
    gdpGrowth: 2.5, // Base GDP growth rate (%)
    consumerConfidence: 50, // Base consumer confidence (0-100)
  });
  
  const [historicalData, setHistoricalData] = useState({
    inflation: [],
    interestRate: [],
    unemployment: [],
    gdpGrowth: [],
    consumerConfidence: [],
  });
  
  // Use a ref to track the last day for which indicators were calculated
  const lastCalculatedDay = useRef(-1);
  
  // Calculate market indicators based on current day and market data
  useEffect(() => {
    if (!marketData || Object.keys(marketData).length === 0) return;
    
    // Only recalculate indicators when the day actually changes
    // This prevents constant recalculation during UI updates
    if (day === lastCalculatedDay.current) return;
    
    // Update the last calculated day
    lastCalculatedDay.current = day;
    
    // Function to calculate market average change
    const calculateMarketAverageChange = () => {
      let totalDailyChange = 0;
      let stockCount = 0;
      
      Object.values(marketData).forEach(stock => {
        if (stock.current_price && stock.previous_price) {
          const change = ((stock.current_price - stock.previous_price) / stock.previous_price) * 100;
          totalDailyChange += change;
          stockCount++;
        }
      });
      
      return stockCount > 0 ? totalDailyChange / stockCount : 0;
    };
    
    // Function to calculate sector performance
    const calculateSectorPerformance = () => {
      const sectorPerformance = {};
      
      Object.entries(marketData).forEach(([symbol, stock]) => {
        const sector = stock.sector;
        if (!sector) return;
        
        if (!sectorPerformance[sector]) {
          sectorPerformance[sector] = { totalChange: 0, count: 0 };
        }
        
        if (stock.current_price && stock.previous_price) {
          const change = ((stock.current_price - stock.previous_price) / stock.previous_price) * 100;
          sectorPerformance[sector].totalChange += change;
          sectorPerformance[sector].count++;
        }
      });
      
      // Calculate average change per sector
      Object.keys(sectorPerformance).forEach(sector => {
        const { totalChange, count } = sectorPerformance[sector];
        sectorPerformance[sector].avgChange = count > 0 ? totalChange / count : 0;
      });
      
      return sectorPerformance;
    };
    
    // Calculate market indicators
    const calculateIndicators = () => {
      const marketChange = calculateMarketAverageChange();
      const sectorPerformance = calculateSectorPerformance();
      
      // Base indicators with random variation
      const getRandomVariation = (base, range) => {
        return base + (Math.random() * range * 2 - range);
      };
      
      // Calculate new indicators with market influence
      const newInflation = 2.0 + (marketChange * -0.05) + getRandomVariation(0, 0.1);
      const newInterestRate = 3.0 + (newInflation * 0.3) + getRandomVariation(0, 0.05);
      const newUnemployment = 5.0 + (marketChange * -0.1) + getRandomVariation(0, 0.2);
      
      // GDP is influenced by sector performance
      let gdpInfluence = 0;
      // Tech and finance have bigger impact on GDP
      if (sectorPerformance.technology) {
        gdpInfluence += sectorPerformance.technology.avgChange * 0.2;
      }
      if (sectorPerformance.finance) {
        gdpInfluence += sectorPerformance.finance.avgChange * 0.15;
      }
      // Other sectors have smaller impact
      Object.keys(sectorPerformance).forEach(sector => {
        if (sector !== 'technology' && sector !== 'finance') {
          gdpInfluence += sectorPerformance[sector].avgChange * 0.05;
        }
      });
      
      const newGdpGrowth = 2.5 + gdpInfluence + getRandomVariation(0, 0.1);
      
      // Consumer confidence is influenced by all indicators
      const newConsumerConfidence = 50 + 
        (marketChange * 2) + 
        (newGdpGrowth * 3) + 
        (newInflation * -2) + 
        (newUnemployment * -2) + 
        getRandomVariation(0, 2);
      
      return {
        inflation: Math.max(0, Math.min(10, newInflation)),
        interestRate: Math.max(0, Math.min(15, newInterestRate)),
        unemployment: Math.max(2, Math.min(15, newUnemployment)),
        gdpGrowth: Math.max(-5, Math.min(8, newGdpGrowth)),
        consumerConfidence: Math.max(0, Math.min(100, newConsumerConfidence)),
      };
    };
    
    // Update indicators based on market performance
    const newIndicators = calculateIndicators();
    setIndicators(newIndicators);
    
    // Update historical data (keep last 30 days of data)
    setHistoricalData(prev => {
      const newHistory = { ...prev };
      
      Object.keys(newIndicators).forEach(indicator => {
        // Add new value to history
        const history = [...(prev[indicator] || []), { day, value: newIndicators[indicator] }];
        
        // Keep only last 30 days
        newHistory[indicator] = history.slice(-30);
      });
      
      return newHistory;
    });
  }, [day, marketData]);
  
  // Helper function to determine indicator trend
  const getTrendIcon = (currentValue, history) => {
    if (history.length < 2) return '';
    
    const previousValue = history[history.length - 2]?.value;
    if (!previousValue) return '';
    
    const change = currentValue - previousValue;
    
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };
  
  // Helper function to get trend class
  const getTrendClass = (indicator, currentValue, history) => {
    if (history.length < 2) return '';
    
    const previousValue = history[history.length - 2]?.value;
    if (!previousValue) return '';
    
    const change = currentValue - previousValue;
    
    // Different indicators have different interpretations of good/bad
    switch (indicator) {
      case 'inflation':
      case 'interestRate':
      case 'unemployment':
        return change > 0 ? 'negative' : 'positive';
      case 'gdpGrowth':
      case 'consumerConfidence':
        return change > 0 ? 'positive' : 'negative';
      default:
        return '';
    }
  };
  
  return (
    <div className="economic-indicators">
      <h3>Economic Indicators</h3>
      
      <div className="indicators-grid">
        <div className="indicator-card">
          <div className="indicator-title">Inflation Rate</div>
          <div className="indicator-value">
            {indicators.inflation.toFixed(1)}%
            <span className={`trend-icon ${getTrendClass('inflation', indicators.inflation, historicalData.inflation)}`}>
              {getTrendIcon(indicators.inflation, historicalData.inflation)}
            </span>
          </div>
          <div className="indicator-chart">
            {/* Simple line representation of historical data */}
            <div className="mini-chart">
              {historicalData.inflation.map((data, index) => (
                <div 
                  key={index} 
                  className="chart-bar"
                  style={{ 
                    height: `${Math.min(100, data.value * 10)}%`,
                    backgroundColor: data.value > 3 ? '#e74c3c' : '#2ecc71'
                  }}
                  title={`Day ${data.day}: ${data.value.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="indicator-card">
          <div className="indicator-title">Interest Rate</div>
          <div className="indicator-value">
            {indicators.interestRate.toFixed(1)}%
            <span className={`trend-icon ${getTrendClass('interestRate', indicators.interestRate, historicalData.interestRate)}`}>
              {getTrendIcon(indicators.interestRate, historicalData.interestRate)}
            </span>
          </div>
          <div className="indicator-chart">
            <div className="mini-chart">
              {historicalData.interestRate.map((data, index) => (
                <div 
                  key={index} 
                  className="chart-bar"
                  style={{ 
                    height: `${Math.min(100, data.value * 6.67)}%`,
                    backgroundColor: data.value > 5 ? '#e74c3c' : '#3498db'
                  }}
                  title={`Day ${data.day}: ${data.value.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="indicator-card">
          <div className="indicator-title">Unemployment Rate</div>
          <div className="indicator-value">
            {indicators.unemployment.toFixed(1)}%
            <span className={`trend-icon ${getTrendClass('unemployment', indicators.unemployment, historicalData.unemployment)}`}>
              {getTrendIcon(indicators.unemployment, historicalData.unemployment)}
            </span>
          </div>
          <div className="indicator-chart">
            <div className="mini-chart">
              {historicalData.unemployment.map((data, index) => (
                <div 
                  key={index} 
                  className="chart-bar"
                  style={{ 
                    height: `${Math.min(100, data.value * 6.67)}%`,
                    backgroundColor: data.value > 6 ? '#e74c3c' : data.value > 4 ? '#f39c12' : '#2ecc71'
                  }}
                  title={`Day ${data.day}: ${data.value.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="indicator-card">
          <div className="indicator-title">GDP Growth</div>
          <div className="indicator-value">
            {indicators.gdpGrowth > 0 ? '+' : ''}{indicators.gdpGrowth.toFixed(1)}%
            <span className={`trend-icon ${getTrendClass('gdpGrowth', indicators.gdpGrowth, historicalData.gdpGrowth)}`}>
              {getTrendIcon(indicators.gdpGrowth, historicalData.gdpGrowth)}
            </span>
          </div>
          <div className="indicator-chart">
            <div className="mini-chart">
              {historicalData.gdpGrowth.map((data, index) => (
                <div 
                  key={index} 
                  className="chart-bar"
                  style={{ 
                    height: `${Math.min(100, (data.value + 5) * 7.69)}%`,
                    backgroundColor: data.value < 0 ? '#e74c3c' : data.value < 1 ? '#f39c12' : '#2ecc71'
                  }}
                  title={`Day ${data.day}: ${data.value.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="indicator-card large">
          <div className="indicator-title">Consumer Confidence</div>
          <div className="indicator-value">
            {indicators.consumerConfidence.toFixed(1)}
            <span className={`trend-icon ${getTrendClass('consumerConfidence', indicators.consumerConfidence, historicalData.consumerConfidence)}`}>
              {getTrendIcon(indicators.consumerConfidence, historicalData.consumerConfidence)}
            </span>
          </div>
          <div className="indicator-gauge">
            <div className="gauge-track">
              <div 
                className="gauge-fill" 
                style={{ 
                  width: `${indicators.consumerConfidence}%`,
                  backgroundColor: indicators.consumerConfidence < 30 ? '#e74c3c' : 
                                 indicators.consumerConfidence < 50 ? '#f39c12' : 
                                 indicators.consumerConfidence < 70 ? '#3498db' : '#2ecc71'
                }}
              />
            </div>
            <div className="gauge-labels">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="indicators-info">
        <p>
          Economic indicators reflect simulated market conditions and can influence stock performance.
        </p>
      </div>
    </div>
  );
}

export default EconomicIndicators; 