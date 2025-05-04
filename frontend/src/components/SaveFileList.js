import React from 'react';
import './SaveFileList.css';

function SaveFileList({ saveSlots, onLoad, onDelete, onBack }) {
  const formatDate = (date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="save-file-list">
      <h2>Select Save File</h2>
      
      <div className="save-slots">
        {saveSlots.map((slot) => (
          <div 
            key={slot.slot} 
            className={`save-slot ${slot.isEmpty ? 'empty' : ''}`}
          >
            {slot.isEmpty ? (
              <div className="empty-slot">
                <h3>SAVE {slot.slot} - EMPTY</h3>
                {slot.error && <p className="error-message">{slot.error}</p>}
              </div>
            ) : (
              <>
                <div className="save-info">
                  <h3>SAVE {slot.slot}</h3>
                  <div className="save-details">
                    <span className="day">Day {slot.day}</span>
                    <span className="cash">{formatCurrency(slot.cash)}</span>
                    <span className="timestamp">{formatDate(slot.timestamp)}</span>
                  </div>
                  {slot.holdings && <p className="holdings">Holdings: {slot.holdings}</p>}
                </div>
                <div className="save-actions">
                  <button 
                    className="load-button"
                    onClick={() => onLoad(slot.slot)}
                  >
                    Load
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => onDelete(slot.slot)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      <button className="back-button" onClick={onBack}>
        Back to Menu
      </button>
    </div>
  );
}

export default SaveFileList; 