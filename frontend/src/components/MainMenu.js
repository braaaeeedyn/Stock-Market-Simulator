import React, { useState, useEffect } from 'react';
import './MainMenu.css';
import SaveFileList from './SaveFileList';
import AchievementPanel from './AchievementPanel';

function MainMenu({ onNewGame, onLoadGame }) {
  const [showLoadGame, setShowLoadGame] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [saveSlots, setSaveSlots] = useState([]);

  useEffect(() => {
    // Load available save slots when component mounts
    refreshSaveSlots();
  }, []);

  const refreshSaveSlots = () => {
    const slots = getAvailableSaveSlots();
    setSaveSlots(slots);
  };

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
            holdings: Object.entries(parsedData.gameData.portfolio.stocks)
              .map(([symbol, qty]) => `${symbol} (${qty})`)
              .join(", ")
          });
        } catch (error) {
          console.error(`Error parsing save slot ${i}:`, error);
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

  const handleNewGame = () => {
    // Find the first empty slot or use slot 1
    let slotToUse = 1;
    const emptySlot = saveSlots.find(slot => slot.isEmpty);
    if (emptySlot) {
      slotToUse = emptySlot.slot;
    }
    
    onNewGame(slotToUse);
  };

  const handleLoadGame = (slot) => {
    onLoadGame(slot);
    setShowLoadGame(false);
  };

  const handleDeleteSave = (slot) => {
    if (window.confirm(`Are you sure you want to delete Save ${slot}?`)) {
      localStorage.removeItem(`stocksim_save${slot}`);
      refreshSaveSlots();
    }
  };

  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="game-title">Stock Market Simulator</h1>
        
        {showAchievements ? (
          <AchievementPanel 
            isOpen={showAchievements} 
            onClose={() => setShowAchievements(false)} 
            inMainMenu={true}
          />
        ) : !showLoadGame ? (
          <div className="menu-options">
            <button className="menu-button" onClick={handleNewGame}>
              New Game
            </button>
            <button 
              className="menu-button" 
              onClick={() => setShowLoadGame(true)}
              disabled={!saveSlots.some(slot => !slot.isEmpty)}
            >
              Load Game
            </button>
            <button 
              className="menu-button achievement-menu-button" 
              onClick={() => setShowAchievements(true)}
            >
              🏆 Achievements 🏆
            </button>
            <button className="menu-button" onClick={() => window.close()}>
              Exit
            </button>
          </div>
        ) : (
          <SaveFileList 
            saveSlots={saveSlots} 
            onLoad={handleLoadGame}
            onDelete={handleDeleteSave}
            onBack={() => setShowLoadGame(false)}
          />
        )}
      </div>
    </div>
  );
}

export default MainMenu; 