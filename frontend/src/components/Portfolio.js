import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Portfolio.css';

function Portfolio({ portfolio }) {
  const { cash, stocks } = portfolio;
  const [marketPrices, setMarketPrices] = useState({});
  const [stockHistories, setStockHistories] = useState({});
  
  // Fetch current market prices
  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        const response = await axios.get('/market/status');
        if (response.data && response.data.stocks) {
          setMarketPrices(response.data.stocks);
        }
      } catch (error) {
        console.error('Error fetching market prices:', error);
      }
    };
    
    fetchMarketPrices();
    
    // Update prices every 30 seconds
    const interval = setInterval(fetchMarketPrices, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch 7-day history for all stocks in portfolio
  useEffect(() => {
    const fetchStockHistories = async () => {
      const symbolsToFetch = Object.keys(stocks);
      if (symbolsToFetch.length === 0) return;
      
      const histories = {};
      
      for (const symbol of symbolsToFetch) {
        try {
          const response = await axios.get(`/market/stock/${symbol}/history`);
          if (response.data && response.data.history) {
            histories[symbol] = response.data;
          }
        } catch (error) {
          console.error(`Error fetching history for ${symbol}:`, error);
        }
      }
      
      setStockHistories(histories);
    };
    
    fetchStockHistories();
  }, [stocks]); // Re-fetch when stocks in portfolio change
  
  // Calculate 7-day performance (percentage change)
  const calculate7DayPerformance = (symbol) => {
    const history = stockHistories[symbol]?.history;
    if (!history || history.length < 7) {
      return null; // Not enough data
    }
    
    const currentPrice = history[history.length - 1];
    const priceSevenDaysAgo = history[history.length - 7];
    
    return ((currentPrice - priceSevenDaysAgo) / priceSevenDaysAgo) * 100;
  };
  
  // Format percentage display with color
  const formatPercentage = (percent) => {
    if (percent === null) return "N/A";
    
    const formattedValue = percent.toFixed(2) + '%';
    
    if (percent > 0) {
      return <span className="positive-change">+{formattedValue}</span>;
    } else if (percent < 0) {
      return <span className="negative-change">{formattedValue}</span>;
    } else {
      return <span>{formattedValue}</span>;
    }
  };
  
  // Function to calculate total portfolio value (cash + stocks)
  const calculateTotalValue = () => {
    let stocksValue = 0;
    Object.entries(stocks).forEach(([symbol, quantity]) => {
      const price = marketPrices[symbol] ? marketPrices[symbol].current_price : 0;
      stocksValue += price * quantity;
    });
    
    return cash + stocksValue;
  };
  
  return (
    <div className="portfolio">
      <h2>Your Portfolio</h2>
      
      <div className="portfolio-summary">
        <div className="summary-item">
          <span className="label">Cash:</span>
          <span className="value">${cash.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Total Value:</span>
          <span className="value">${calculateTotalValue().toFixed(2)}</span>
        </div>
      </div>
      
      <div className="holdings">
        <h3>Holdings</h3>
        {Object.keys(stocks).length === 0 ? (
          <p className="no-holdings">No stocks owned yet</p>
        ) : (
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Value</th>
                <th>7-Day Performance</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stocks).map(([symbol, quantity]) => {
                const currentPrice = marketPrices[symbol] ? marketPrices[symbol].current_price : 0;
                const value = currentPrice * quantity;
                const sevenDayPerformance = calculate7DayPerformance(symbol);
                
                return (
                  <tr key={symbol}>
                    <td>{symbol}</td>
                    <td>{quantity}</td>
                    <td>${value.toFixed(2)}</td>
                    <td>{formatPercentage(sevenDayPerformance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="transaction-history">
        <h3>Recent Transactions</h3>
        {portfolio.transactions.length === 0 ? (
          <p className="no-transactions">No transactions yet</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.transactions.slice(-5).reverse().map((transaction, index) => {
                // Handle trade type transactions differently
                if (transaction.type === 'trade') {
                  return (
                    <tr key={index} className="trade">
                      <td>TRADE</td>
                      <td colSpan="3">Trade completed on {new Date(transaction.date).toLocaleDateString()}</td>
                    </tr>
                  );
                }
                
                // Handle regular buy/sell transactions
                return (
                  <tr key={index} className={transaction.type === 'buy' ? 'buy' : 'sell'}>
                    <td>{transaction.type.toUpperCase()}</td>
                    <td>{transaction.symbol}</td>
                    <td>{transaction.quantity}</td>
                    <td>${transaction.price.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Portfolio; 