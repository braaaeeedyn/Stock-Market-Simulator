import React from 'react';
import './TradeOffersPanel.css';

function TradeOffersPanel({ isOpen, onClose, offers, onAcceptOffer, onDeclineOffer }) {
  if (!isOpen) return null;

  return (
    <div className="trade-offers-overlay" onClick={onClose}>
      <div className="trade-offers-modal" onClick={(e) => e.stopPropagation()}>
        <div className="trade-offers-header">
          <h2>Available Trade Offers</h2>
          <span className="close-button" onClick={onClose}>×</span>
        </div>
        
        <div className="trade-offers-content">
          {offers && offers.length > 0 ? (
            <>
              <p className="trade-offers-info">You can select one of the following trade offers:</p>
              
              <div className="trade-offers-list">
                {offers.map((offer, index) => (
                  <div key={index} className="trade-offer-card">
                    <div className="trade-offer-details">
                      <div className="offer-section">
                        <h3>You Give:</h3>
                        <ul className="offer-list">
                          {offer.yourOffer.map((item, itemIndex) => (
                            <li key={`your-${itemIndex}`} className="offer-item">
                              {item.type === 'cash' 
                                ? `$${item.amount.toFixed(2)}` 
                                : `${item.quantity} shares of ${item.symbol}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="offer-divider">
                        <div className="trade-arrow">↔️</div>
                      </div>
                      
                      <div className="offer-section">
                        <h3>You Receive:</h3>
                        <ul className="offer-list">
                          {offer.theirOffer.map((item, itemIndex) => (
                            <li key={`their-${itemIndex}`} className="offer-item">
                              {item.type === 'cash' 
                                ? `$${item.amount.toFixed(2)}` 
                                : `${item.quantity} shares of ${item.symbol}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="trade-actions">
                      <button 
                        className="accept-button" 
                        onClick={() => onAcceptOffer(index)}
                      >
                        Accept Trade
                      </button>
                      <button 
                        className="decline-button" 
                        onClick={() => onDeclineOffer(index)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-trades-message">
              <p>No trade offers available today.</p>
              <p className="trade-hint">New offers will be available after advancing to the next day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TradeOffersPanel; 