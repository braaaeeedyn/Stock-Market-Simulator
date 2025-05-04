import React, { useState, useEffect } from 'react';
import './EarningsReport.css';

function EarningsReport({ portfolio, day, onClose }) {
  // Add state for timer
  const [timeRemaining, setTimeRemaining] = useState(10); // Match weekly report at 10 seconds
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
  
  // Calculate monthly earnings and portfolio performance
  const calculateMonthlyPerformance = () => {
    const transactions = portfolio.transactions || [];
    // Filter transactions from the past 30 days
    const monthStartDay = Math.max(1, day - 29); // Ensure we don't go below day 1
    const monthTransactions = transactions.filter(t => 
      t.day >= monthStartDay && t.day <= day
    );
    
    // Initialize counters
    let totalSpent = 0;
    let totalEarned = 0;
    let buyTransactions = 0;
    let sellTransactions = 0;
    let bestStock = null;
    let bestReturn = 0;
    let worstStock = null;
    let worstReturn = 0;
    
    // Process each transaction
    monthTransactions.forEach(transaction => {
      if (transaction.type === 'buy') {
        const amount = transaction.quantity * transaction.price;
        totalSpent += amount;
        buyTransactions++;
      } 
      else if (transaction.type === 'sell') {
        const amount = transaction.quantity * transaction.price;
        totalEarned += amount;
        sellTransactions++;
      }
    });
    
    // Calculate net profit/loss from trades
    const netTradeProfit = totalEarned - totalSpent;
    
    // Calculate current portfolio value and compare with beginning of month
    // This would require historical data which we don't have in this component
    // So we'll estimate based on transactions
    
    return {
      totalSpent,
      totalEarned,
      netTradeProfit,
      buyTransactions,
      sellTransactions,
      bestStock,
      bestReturn,
      worstStock,
      worstReturn,
      monthStartDay
    };
  };
  
  const monthlyData = calculateMonthlyPerformance();
  
  // Handle close button click
  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };
  
  return (
    <div className="earnings-report-overlay">
      <div className="earnings-report">
        <div className="report-header">
          <div className="header-content">
            <h2>Monthly Earnings Report</h2>
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
            Monthly Summary - Day {monthlyData.monthStartDay} to Day {day}
          </div>
          
          <div className="performance-summary">
            <h3>Trading Performance</h3>
            
            <div className="summary-container">
              <div className="summary-item">
                <span className="label">Total Invested:</span>
                <span className="value">${monthlyData.totalSpent.toFixed(2)}</span>
              </div>
              
              <div className="summary-item">
                <span className="label">Total Returns:</span>
                <span className="value">${monthlyData.totalEarned.toFixed(2)}</span>
              </div>
              
              <div className="summary-item">
                <span className="label">Net Trading Profit/Loss:</span>
                <span className={`value ${monthlyData.netTradeProfit >= 0 ? 'positive' : 'negative'}`}>
                  ${Math.abs(monthlyData.netTradeProfit).toFixed(2)} 
                  {monthlyData.netTradeProfit >= 0 ? '(profit)' : '(loss)'}
                </span>
              </div>
              
              <div className="summary-item">
                <span className="label">Total Transactions:</span>
                <span className="value">{monthlyData.buyTransactions + monthlyData.sellTransactions}</span>
              </div>
            </div>
          </div>
          
          <div className="portfolio-analysis">
            <h3>Portfolio Analysis</h3>
            <p>Your current portfolio contains {Object.keys(portfolio.stocks || {}).length} different stocks.</p>
            
            {Object.keys(portfolio.stocks || {}).length > 0 ? (
              <div className="stocks-table">
                <table>
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Shares</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(portfolio.stocks || {}).map(([symbol, quantity]) => (
                      <tr key={symbol}>
                        <td>{symbol}</td>
                        <td>{quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>You don't currently have any stocks in your portfolio.</p>
            )}
          </div>
          
          <div className="monthly-advice">
            <h3>Monthly Insights</h3>
            {monthlyData.netTradeProfit < 0 ? (
              <p>This month resulted in a net trading loss. Consider reviewing your trading strategy and looking for longer-term investment opportunities.</p>
            ) : monthlyData.totalSpent === 0 && monthlyData.totalEarned === 0 ? (
              <p>No trading activity this month. The market offers many opportunities - consider being more active in your trading strategy.</p>
            ) : (
              <p>You had a profitable month! Continue your disciplined approach to trading and consider reinvesting some profits to compound your growth.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EarningsReport; 