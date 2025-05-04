import React from 'react';
import './TradeOffer.css';

function TradeOffer({ offer, onAccept, onDecline }) {
  if (!offer) return null;

  const { theirOffer, yourOffer } = offer;

  // Format the trade offer details
  const formatOfferItem = (item) => {
    if (item.type === 'cash') {
      return `$${item.amount.toFixed(2)}`;
    } else {
      return `${item.quantity} shares of ${item.symbol}`;
    }
  };

  const theirOfferItems = theirOffer.map((item, index) => (
    <li key={`their-${index}`} className="offer-item">
      {formatOfferItem(item)}
    </li>
  ));

  const yourOfferItems = yourOffer.map((item, index) => (
    <li key={`your-${index}`} className="offer-item">
      {formatOfferItem(item)}
    </li>
  ));

  return (
    <div className="trade-offer-overlay">
      <div className="trade-offer-modal">
        <h2>Trade Offer</h2>
        <div className="trade-offer-details">
          <div className="offer-section">
            <h3>You Give:</h3>
            <ul className="offer-list">
              {yourOfferItems}
            </ul>
          </div>
          
          <div className="offer-divider">
            <div className="trade-arrow">↔️</div>
          </div>
          
          <div className="offer-section">
            <h3>You Receive:</h3>
            <ul className="offer-list">
              {theirOfferItems}
            </ul>
          </div>
        </div>
        
        <div className="trade-offer-actions">
          <button className="accept-button" onClick={onAccept}>
            Accept Trade
          </button>
          <button className="decline-button" onClick={onDecline}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

export default TradeOffer; 