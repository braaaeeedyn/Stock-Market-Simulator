import React, { useState, useEffect } from 'react';
import './WeeklySpendingReport.css';

function WeeklySpendingReport({ portfolio, day, onClose }) {
  // Add state for timer
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [canClose, setCanClose] = useState(false);
  
  // Set up timer effect
  useEffect(() => {
    // Don't start timer if already can close
    if (canClose) return;
    
    // Start countdown
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clean up timer on unmount
    return () => clearInterval(timer);
  }, [canClose]);
  
  // Calculate weekly spending and earnings
  const calculateWeeklyFinances = () => {
    const transactions = portfolio.transactions || [];
    // Filter transactions from the past 7 days
    const weekStartDay = Math.max(1, day - 6); // Ensure we don't go below day 1
    const weekTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      // If transaction has a day property, use that
      if (t.day) {
        return t.day >= weekStartDay && t.day <= day;
      }
      // Otherwise try to estimate based on date (this is a fallback)
      return transactionDate && transactionDate.getTime() >= new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
    });
    
    // Initialize counters
    let totalSpent = 0;
    let totalEarned = 0;
    let buyTransactions = 0;
    let sellTransactions = 0;
    let stocksBought = {};
    let stocksSold = {};
    
    // Process each transaction
    weekTransactions.forEach(transaction => {
      if (transaction.type === 'buy') {
        const amount = transaction.quantity * transaction.price;
        totalSpent += amount;
        buyTransactions++;
        
        // Track stocks bought
        stocksBought[transaction.symbol] = (stocksBought[transaction.symbol] || 0) + transaction.quantity;
      } 
      else if (transaction.type === 'sell') {
        const amount = transaction.quantity * transaction.price;
        totalEarned += amount;
        sellTransactions++;
        
        // Track stocks sold
        stocksSold[transaction.symbol] = (stocksSold[transaction.symbol] || 0) + transaction.quantity;
      }
      // We could add handling for trade offers here too
    });
    
    // Calculate net change
    const netChange = totalEarned - totalSpent;
    
    // Calculate most traded stock (bought + sold)
    const allStockTransactions = {};
    Object.entries(stocksBought).forEach(([symbol, quantity]) => {
      allStockTransactions[symbol] = (allStockTransactions[symbol] || 0) + quantity;
    });
    Object.entries(stocksSold).forEach(([symbol, quantity]) => {
      allStockTransactions[symbol] = (allStockTransactions[symbol] || 0) + quantity;
    });
    
    let mostTradedStock = null;
    let mostTradedQuantity = 0;
    
    Object.entries(allStockTransactions).forEach(([symbol, quantity]) => {
      if (quantity > mostTradedQuantity) {
        mostTradedQuantity = quantity;
        mostTradedStock = symbol;
      }
    });
    
    return {
      totalSpent,
      totalEarned,
      netChange,
      buyTransactions,
      sellTransactions,
      mostTradedStock,
      mostTradedQuantity,
      weekStartDay
    };
  };
  
  const weeklyData = calculateWeeklyFinances();
  
  // Handle close button click
  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };
  
  return (
    <div className="weekly-report-overlay">
      <div className="weekly-report">
        <div className="report-header">
          <div className="header-content">
            <h2>Weekly Spending Report</h2>
            {!canClose && (
              <span className="timer-indicator">
                ({timeRemaining}s)
              </span>
            )}
          </div>
          <span 
            className={`close-button ${!canClose ? 'disabled' : ''}`} 
            onClick={handleClose}
            title={canClose ? "Close report" : `Please wait ${timeRemaining} seconds`}
          >
            Exit
          </span>
        </div>
        
        <div className="report-content">
          <div className="report-period">
            Day {weeklyData.weekStartDay} to Day {day} 
          </div>
          
          <div className="summary-container">
            <div className="summary-row">
              <div className="summary-item">
                <span className="label">Total Spent:</span>
                <span className="value spending">${weeklyData.totalSpent.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Earned:</span>
                <span className="value earning">${weeklyData.totalEarned.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="summary-row">
              <div className="summary-item">
                <span className="label">Net Change:</span>
                <span className={`value ${weeklyData.netChange >= 0 ? 'positive' : 'negative'}`}>
                  ${Math.abs(weeklyData.netChange).toFixed(2)} {weeklyData.netChange >= 0 ? '(profit)' : '(loss)'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="transaction-stats">
            <h3>Transaction Statistics</h3>
            
            <div className="stats-grid">
              <div className="stat-item">
                <span className="label">Buy Transactions:</span>
                <span className="value">{weeklyData.buyTransactions}</span>
              </div>
              
              <div className="stat-item">
                <span className="label">Sell Transactions:</span>
                <span className="value">{weeklyData.sellTransactions}</span>
              </div>
              
              <div className="stat-item">
                <span className="label">Total Transactions:</span>
                <span className="value">{weeklyData.buyTransactions + weeklyData.sellTransactions}</span>
              </div>
              
              <div className="stat-item">
                <span className="label">Most Traded Stock:</span>
                <span className="value">
                  {weeklyData.mostTradedStock ? 
                    `${weeklyData.mostTradedStock} (${weeklyData.mostTradedQuantity} shares)` : 
                    'None'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="weekly-advice">
            <h3>Financial Advice</h3>
            {weeklyData.netChange < 0 ? (
              <p>You spent more than you earned this week. Consider focusing on selling some stocks for profit.</p>
            ) : weeklyData.totalSpent === 0 && weeklyData.totalEarned === 0 ? (
              <p>No trading activity this week. Stay active in the market to maximize potential gains!</p>
            ) : (
              <p>Good job balancing your finances this week! Keep diversifying your portfolio for optimal results.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklySpendingReport; 