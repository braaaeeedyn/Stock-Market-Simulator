import React, { useState, useEffect } from 'react';
import './SaveDialog.css';
import GameService from '../services/GameService';

function SaveDialog({ currentSlot, onSave, onCancel }) {
  const [saveSlots, setSaveSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(currentSlot || 1);
  
  useEffect(() => {
    // Load save slot information when the dialog opens
    const slots = getAvailableSaveSlots();
    setSaveSlots(slots);
    // Default to current slot or first slot
    setSelectedSlot(currentSlot || slots[0]?.slot || 1);
  }, [currentSlot]);
  
  const getAvailableSaveSlots = () => {
    const maxSlots = 5;
    const slots = [];
    
    for (let i = 1; i <= maxSlots; i++) {
      const saveData = localStorage.getItem(`stocksim_save${i}`);
      
      if (saveData) {
        try {
          const parsedData = JSON.parse(saveData);
          slots.push({
            slot: i,
            isEmpty: false,
            day: parsedData.gameData.day,
            cash: parsedData.gameData.cash,
            timestamp: new Date(parsedData.timestamp),
            current: i === currentSlot
          });
        } catch (error) {
          slots.push({
            slot: i,
            isEmpty: true,
            error: "Corrupted save file"
          });
        }
      } else {
        slots.push({
          slot: i,
          isEmpty: true
        });
      }
    }
    
    return slots;
  };
  
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
  
  const handleSave = () => {
    if (selectedSlot) {
      // Confirm before overwriting existing save
      const slotInfo = saveSlots.find(slot => slot.slot === selectedSlot);
      if (slotInfo && !slotInfo.isEmpty && slotInfo.slot !== currentSlot) {
        if (window.confirm(`Are you sure you want to overwrite Save ${selectedSlot}?`)) {
          onSave(selectedSlot);
        }
      } else {
        onSave(selectedSlot);
      }
    }
  };
  
  return (
    <div className="save-dialog-overlay">
      <div className="save-dialog">
        <h2>Save Game</h2>
        <p className="save-instruction">Choose a save slot:</p>
        
        <div className="save-slot-selector">
          {saveSlots.map(slot => (
            <div 
              key={slot.slot}
              className={`save-option ${selectedSlot === slot.slot ? 'selected' : ''} ${slot.isEmpty ? 'empty' : ''}`}
              onClick={() => setSelectedSlot(slot.slot)}
            >
              <div className="save-number">Slot {slot.slot}</div>
              <div className="save-details">
                {slot.isEmpty ? (
                  <span className="empty-slot-label">Empty</span>
                ) : (
                  <>
                    <span className="day-info">Day {slot.day}</span>
                    <span className="cash-info">{formatCurrency(slot.cash)}</span>
                    <span className="date-info">{formatDate(slot.timestamp)}</span>
                    {slot.current && <span className="current-badge">Current</span>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="save-actions">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveDialog; 