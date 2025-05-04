/**
 * Game Service - Handles saving and loading game data
 */
export const GameService = {
  /**
   * Save the game to a specific slot
   * @param {number} saveSlot - The slot number to save to
   * @param {object} gameData - The game data to save
   */
  saveGame: (saveSlot, gameData) => {
    try {
      const saveData = {
        saveId: `save${saveSlot}`,
        timestamp: new Date().toISOString(),
        gameData: gameData
      };
      
      localStorage.setItem(`stocksim_save${saveSlot}`, JSON.stringify(saveData));
      console.log(`Game saved to slot ${saveSlot}`);
      return true;
    } catch (error) {
      console.error('Error saving game:', error);
      return false;
    }
  },
  
  /**
   * Auto-save the game
   * @param {object} gameData - The game data to save
   */
  autoSave: (gameData) => {
    try {
      const autoSaveSlot = 'auto';
      const saveData = {
        saveId: `save_${autoSaveSlot}`,
        timestamp: new Date().toISOString(),
        gameData: gameData
      };
      
      localStorage.setItem(`stocksim_save_${autoSaveSlot}`, JSON.stringify(saveData));
      console.log('Auto-save completed');
      return true;
    } catch (error) {
      console.error('Error during auto-save:', error);
      return false;
    }
  },
  
  /**
   * Load a game from a specific slot
   * @param {number} saveSlot - The slot number to load from
   * @returns {object|null} The loaded game data or null if not found
   */
  loadGame: (saveSlot) => {
    try {
      const saveDataString = localStorage.getItem(`stocksim_save${saveSlot}`);
      
      if (!saveDataString) {
        console.log(`No save file found in slot ${saveSlot}`);
        return null;
      }
      
      const saveData = JSON.parse(saveDataString);
      console.log(`Game loaded from slot ${saveSlot}`);
      return saveData.gameData;
    } catch (error) {
      console.error('Error loading game:', error);
      return null;
    }
  },
  
  /**
   * Load the auto-save if it exists
   * @returns {object|null} The loaded game data or null if not found
   */
  loadAutoSave: () => {
    try {
      const autoSaveSlot = 'auto';
      const saveDataString = localStorage.getItem(`stocksim_save_${autoSaveSlot}`);
      
      if (!saveDataString) {
        console.log('No auto-save found');
        return null;
      }
      
      const saveData = JSON.parse(saveDataString);
      console.log('Auto-save loaded');
      return saveData.gameData;
    } catch (error) {
      console.error('Error loading auto-save:', error);
      return null;
    }
  },

  /**
   * Check if a save exists in a specific slot
   * @param {number} saveSlot - The slot to check
   * @returns {boolean} Whether a save exists
   */
  saveExists: (saveSlot) => {
    const saveDataString = localStorage.getItem(`stocksim_save${saveSlot}`);
    return saveDataString !== null;
  },
  
  /**
   * Delete a save from a specific slot
   * @param {number} saveSlot - The slot to delete
   */
  deleteSave: (saveSlot) => {
    localStorage.removeItem(`stocksim_save${saveSlot}`);
    console.log(`Save ${saveSlot} deleted`);
  }
};

export default GameService; 