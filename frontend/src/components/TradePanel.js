import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TradePanel.css';

function TradePanel({ stockSymbol, onTrade, currentDay }) {
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('buy'); // 'buy' or 'sell'

  const fetchStockPrice = async () => {
    try {
      // Fetch the current market price from API
      const response = await axios.get('/market/status');
      if (response.data && response.data.stocks && response.data.stocks[stockSymbol]) {
        setCurrentPrice(response.data.stocks[stockSymbol].current_price);
      }
    } catch (error) {
      console.error("Error fetching stock price:", error);
    }
  };

  // Effect for initial load and when stock symbol changes
  useEffect(() => {
    if (stockSymbol) {
      fetchStockPrice();
    }
  }, [stockSymbol]);

  // Effect to refresh price when day changes
  useEffect(() => {
    if (stockSymbol && currentDay > 0) {
      fetchStockPrice();
    }
  }, [currentDay, stockSymbol]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleActionChange = (newAction) => {
    setAction(newAction);
  };

  const handleTrade = () => {
    setLoading(true);
    
    // Execute the trade
    onTrade(stockSymbol, quantity, currentPrice, action === 'buy');
    
    // Reset form
    setQuantity(1);
    setLoading(false);
  };

  return (
    <div className="trade-panel">
      <h3>Trade {stockSymbol}</h3>
      
      <div className="current-price">
        Current Price: <span className="price">${parseFloat(currentPrice).toFixed(2)}</span>
      </div>
      
      <div className="trade-options">
        <div className="action-buttons">
          <button 
            className={`action-btn ${action === 'buy' ? 'active' : ''}`}
            onClick={() => handleActionChange('buy')}
          >
            Buy
          </button>
          <button 
            className={`action-btn ${action === 'sell' ? 'active' : ''}`}
            onClick={() => handleActionChange('sell')}
          >
            Sell
          </button>
        </div>
        
        <div className="quantity-input">
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
          />
        </div>
        
        <div className="trade-summary">
          <div className="trade-total">
            Total: <span>${(quantity * currentPrice).toFixed(2)}</span>
          </div>
          
          <button 
            className={`trade-button ${action}`}
            onClick={handleTrade}
            disabled={loading}
          >
            {loading ? 'Processing...' : `${action === 'buy' ? 'Buy' : 'Sell'} ${quantity} Share${quantity !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TradePanel; 