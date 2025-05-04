import React, { useState, useEffect } from 'react';
import './TradeOfferNotification.css';

function TradeOfferNotification({ offer, onAccept, onDecline, onView }) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Show animation when component mounts
  useEffect(() => {
    // Small timeout to ensure CSS transition works
    setTimeout(() => {
      setIsVisible(true);
    }, 50);
  }, []);
  
  const handleView = () => {
    setIsVisible(false);
    // Allow animation to complete before removing from DOM
    setTimeout(() => {
      if (onView) onView();
    }, 300);
  };
  
  const handleDecline = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    
    // Allow animation to complete before removing from DOM
    setTimeout(() => {
      if (onDecline) onDecline();
    }, 300);
  };
  
  if (!offer) return null;
  
  // Function to summarize the trade offer contents
  const summarizeOffer = () => {
    const { theirOffer, yourOffer } = offer;
    
    // Format what you give
    const formatGive = yourOffer.map(item => {
      if (item.type === 'cash') {
        return `$${item.amount.toFixed(2)}`;
      } else {
        return `${item.quantity} ${item.symbol}`;
      }
    }).join(", ");
    
    // Format what you receive
    const formatReceive = theirOffer.map(item => {
      if (item.type === 'cash') {
        return `$${item.amount.toFixed(2)}`;
      } else {
        return `${item.quantity} ${item.symbol}`;
      }
    }).join(", ");
    
    return { give: formatGive, receive: formatReceive };
  };
  
  const { give, receive } = summarizeOffer();
  
  return (
    <div className={`trade-offer-notification ${isVisible ? 'visible' : ''}`} onClick={handleView}>
      <div className="trade-notification-icon">💼</div>
      <div className="trade-notification-content">
        <h3>New Trade Offer!</h3>
        <div className="trade-summary">
          <p><strong>Give:</strong> {give}</p>
          <p><strong>Receive:</strong> {receive}</p>
        </div>
        <div className="trade-notification-hint">Click to view details</div>
      </div>
      <button className="trade-notification-close" onClick={handleDecline}>×</button>
    </div>
  );
}

export default TradeOfferNotification; 