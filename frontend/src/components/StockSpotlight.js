import React, { useState, useEffect } from 'react';
import './StockSpotlight.css';

function StockSpotlight({ marketData, onStockSelect, currentDay }) {
  const [spotlightStock, setSpotlightStock] = useState(null);
  
  // Function to calculate percentage change
  const calculatePercentChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Update spotlight stock when day changes or marketData updates
  useEffect(() => {
    if (!marketData || Object.keys(marketData).length === 0) return;
    
    // Filter stocks with positive daily change
    const positiveStocks = Object.entries(marketData).filter(([_, data]) => {
      const dailyChange = calculatePercentChange(data.current_price, data.previous_price);
      return dailyChange > 0;
    });
    
    if (positiveStocks.length > 0) {
      // Use the day number to select a different stock each day
      // This creates a deterministic but rotating selection
      const index = currentDay % positiveStocks.length;
      const [symbol, data] = positiveStocks[index];
      
      // Set the spotlight stock
      setSpotlightStock({
        symbol,
        price: data.current_price,
        dailyChange: calculatePercentChange(data.current_price, data.previous_price),
        overallChange: calculatePercentChange(data.current_price, data.initial_price),
        sector: data.sector || 'General'
      });
    }
  }, [currentDay, marketData]);
  
  if (!spotlightStock) return null;
  
  return (
    <div className="stock-spotlight">
      <div className="spotlight-header">
        <h3>🔍 Stock Spotlight: Hot performer</h3>
      </div>
      
      <div 
        className="spotlight-content" 
        onClick={() => onStockSelect(spotlightStock.symbol)}
      >
        <div className="spotlight-symbol">{spotlightStock.symbol}</div>
        <div className="spotlight-sector">{spotlightStock.sector}</div>
        <div className="spotlight-price">${spotlightStock.price.toFixed(2)}</div>
        <div className="spotlight-daily">
          <span className="value positive">
            ↑ {spotlightStock.dailyChange.toFixed(2)}%
          </span>
        </div>
        <div className="spotlight-overall">
          <span className={`value ${spotlightStock.overallChange >= 0 ? 'positive' : 'negative'}`}>
            {spotlightStock.overallChange >= 0 ? '↑' : '↓'} {Math.abs(spotlightStock.overallChange).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default StockSpotlight; 