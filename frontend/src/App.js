import React, { useState, useEffect } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import MarketDisplay from './components/MarketDisplay';
import StockChart from './components/StockChart';
import Portfolio from './components/Portfolio';
import EventNotifications from './components/EventNotifications';
import TradePanel from './components/TradePanel';
import SaveDialog from './components/SaveDialog';
import GameService from './services/GameService';
import AchievementPanel from './components/AchievementPanel';
import AchievementNotification from './components/AchievementNotification';
import AchievementService from './services/AchievementService';
import TradeOfferService from './services/TradeOfferService';
import TradeOffersPanel from './components/TradeOffersPanel';
import EconomicIndicators from './components/EconomicIndicators';
import WeeklySpendingReport from './components/WeeklySpendingReport';
import EarningsReport from './components/EarningsReport';
import AudioSettings from './components/AudioSettings';
import audioService from './services/AudioService';
import StockSpotlight from './components/StockSpotlight';
import axios from 'axios';

function App() {
  // Main states
  const [gameState, setGameState] = useState('menu'); // 'menu', 'game'
  const [currentSaveSlot, setCurrentSaveSlot] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Achievement states
  const [showAchievementPanel, setShowAchievementPanel] = useState(false);
  const [achievementNotifications, setAchievementNotifications] = useState([]);
  const [initialAchievements, setInitialAchievements] = useState([]);
  
  // Economic indicators state
  const [showEconomicIndicators, setShowEconomicIndicators] = useState(false);
  
  // Trade offers state
  const [showTradeOffersPanel, setShowTradeOffersPanel] = useState(false);
  const [availableTradeOffers, setAvailableTradeOffers] = useState([]);
  const [hasTakenOfferToday, setHasTakenOfferToday] = useState(false);
  
  // Weekly spending report state
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [weeklyReportsShown, setWeeklyReportsShown] = useState(new Set());
  
  // Monthly earnings report state
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [monthlyReportsShown, setMonthlyReportsShown] = useState(new Set());
  
  // Report sound tracking state
  const [reportSoundPlayedForDay, setReportSoundPlayedForDay] = useState(-1);
  
  // Game states
  const [selectedStock, setSelectedStock] = useState(null);
  const [portfolio, setPortfolio] = useState({
    cash: 500,
    stocks: {},
    transactions: [],
    lastTradeOfferDay: null
  });
  const [events, setEvents] = useState([]);
  const [currentDay, setCurrentDay] = useState(0);
  
  // Market data state
  const [marketData, setMarketData] = useState({});
  
  // Add state for settings modal
  const [showSettings, setShowSettings] = useState(false);
  
  // Initialize audio service on component mount
  useEffect(() => {
    audioService.init();
  }, []);
  
  // Start playing background music when the game starts
  useEffect(() => {
    if (gameState === 'game') {
      audioService.playMusic();
    } else {
      audioService.pauseMusic();
    }
  }, [gameState]);
  
  // Fetch market data
  useEffect(() => {
    if (gameState !== 'game') return;
    
    const fetchMarketData = async () => {
      try {
        const response = await axios.get('/market/status');
        if (response.data && response.data.stocks) {
          setMarketData(response.data.stocks);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };
    
    // Initial fetch when game starts
    fetchMarketData();
    
    // Update market data only once per minute instead of every 30 seconds
    // This reduces the number of API calls and console logs
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Create a game state snapshot for saving
  const createGameSnapshot = () => {
    // Convert Set objects to Arrays of numbers for safe serialization
    const weeklyReportsArray = Array.from(weeklyReportsShown).map(Number);
    const monthlyReportsArray = Array.from(monthlyReportsShown).map(Number);
    
    return {
      day: currentDay,
      cash: portfolio.cash,
      portfolio: {
        ...portfolio,
        lastTradeOfferDay: portfolio.lastTradeOfferDay
      },
      selectedStock: selectedStock,
      events: events,
      tradeOffers: availableTradeOffers,
      weeklyReportsShown: weeklyReportsArray,
      monthlyReportsShown: monthlyReportsArray
    };
  };

  // Save the current game state
  const saveCurrentGame = () => {
    // Play button click sound
    audioService.playSound('buttonClick');
    
    // Open save dialog instead of saving immediately
    setShowSaveDialog(true);
  };

  // Handle save to specific slot
  const handleSaveToSlot = (saveSlot) => {
    // Play button click sound
    audioService.playSound('buttonClick');
    
    const snapshot = createGameSnapshot();
    GameService.saveGame(saveSlot, snapshot);
    // Update current save slot if it's changed
    setCurrentSaveSlot(saveSlot);
    setShowSaveDialog(false);
    alert(`Game saved to slot ${saveSlot}`);
  };

  // Auto-save on day advance
  useEffect(() => {
    if (gameState === 'game' && currentDay > 0 && currentDay % 5 === 0) {
      const snapshot = createGameSnapshot();
      GameService.autoSave(snapshot);
    }
  }, [currentDay, gameState]);

  // Track already unlocked achievements when a new game starts or an existing game loads
  useEffect(() => {
    // Only run once when the component mounts
    setInitialAchievements(AchievementService.getUnlockedAchievements());
  }, []);

  // Handle starting a new game
  const handleNewGame = (saveSlot) => {
    // Play button click sound
    audioService.playSound('buttonClick');
    
    setCurrentSaveSlot(saveSlot);
    
    // Reset game state for a new game
    setPortfolio({
      cash: 500,
      stocks: {},
      transactions: [],
      lastTradeOfferDay: null
    });
    setSelectedStock(null);
    setEvents([]);
    setCurrentDay(0);
    setAvailableTradeOffers([]);
    setWeeklyReportsShown(new Set());
    setMonthlyReportsShown(new Set());
    
    // Clear any pending achievement notifications
    setAchievementNotifications([]);

    // Update the list of already unlocked achievements to prevent re-showing notifications
    setInitialAchievements(AchievementService.getUnlockedAchievements());
    
    // Reset backend day counter by calling the API to initialize a new game
    fetch('/api/reset-market', { method: 'POST' })
      .catch(error => console.error("Could not reset market:", error));
      
    setGameState('game');
  };

  // Handle loading a game
  const handleLoadGame = (saveSlot) => {
    // Play button click sound
    audioService.playSound('buttonClick');
    
    const savedGame = GameService.loadGame(saveSlot);
    if (savedGame) {
      // Clear any pending achievement notifications
      setAchievementNotifications([]);
      
      // Update the list of already unlocked achievements to prevent re-showing notifications
      setInitialAchievements(AchievementService.getUnlockedAchievements());
      
      setCurrentSaveSlot(saveSlot);
      setCurrentDay(savedGame.day || 0);
      setPortfolio(savedGame.portfolio || {
        cash: savedGame.cash || 500,
        stocks: savedGame.stocks || {},
        transactions: savedGame.transactions || [],
        lastTradeOfferDay: savedGame.lastTradeOfferDay || null
      });
      setSelectedStock(savedGame.selectedStock || null);
      setEvents(savedGame.events || []);
      
      // Restore trade offers if they exist
      if (savedGame.tradeOffers && savedGame.tradeOffers.length > 0) {
        setAvailableTradeOffers(savedGame.tradeOffers);
      } else {
        setAvailableTradeOffers([]);
      }
      
      // Restore weekly reports shown tracking
      if (savedGame.weeklyReportsShown && Array.isArray(savedGame.weeklyReportsShown)) {
        // Ensure we have valid numbers in the array
        const validReportDays = savedGame.weeklyReportsShown
          .filter(day => typeof day === 'number' || !isNaN(parseInt(day)))
          .map(day => typeof day === 'number' ? day : parseInt(day));
        
        setWeeklyReportsShown(new Set(validReportDays));
        console.log("Loaded weekly reports shown:", validReportDays);
      } else {
        setWeeklyReportsShown(new Set());
      }
      
      // Restore monthly reports shown tracking
      if (savedGame.monthlyReportsShown && Array.isArray(savedGame.monthlyReportsShown)) {
        // Ensure we have valid numbers in the array
        const validReportDays = savedGame.monthlyReportsShown
          .filter(day => typeof day === 'number' || !isNaN(parseInt(day)))
          .map(day => typeof day === 'number' ? day : parseInt(day));
        
        setMonthlyReportsShown(new Set(validReportDays));
        console.log("Loaded monthly reports shown:", validReportDays);
      } else {
        setMonthlyReportsShown(new Set());
      }
      
      setGameState('game');
    } else {
      alert("Failed to load game");
    }
  };

  // Return to main menu
  const handleReturnToMenu = () => {
    // Play button click sound
    audioService.playSound('buttonClick');
    
    if (window.confirm('Return to main menu? Make sure to save your game first.')) {
      setGameState('menu');
    }
  };

  const handleStockSelect = (stockSymbol) => {
    // Play button click sound
    audioService.playSound('buttonClick');
    
    setSelectedStock(stockSymbol);
  };

  // Handle advancing to a new day
  const handleDayAdvance = (day) => {
    // Only proceed if the day actually changed to avoid multiple triggers for the same day
    if (day === currentDay) {
      return;
    }
    
    setCurrentDay(day);
    
    // Reset trade offer selection for the new day
    setHasTakenOfferToday(false);
    
    // Generate new trade offers for the day only if we don't already have them
    // or if the last trade offer day is different from the current day
    if (availableTradeOffers.length === 0 || portfolio.lastTradeOfferDay !== day) {
      generateDailyTradeOffers();
      
      // Update portfolio with the last trade offer day
      setPortfolio(prevPortfolio => ({
        ...prevPortfolio,
        lastTradeOfferDay: day
      }));
    }
    
    // Check if this day should have reports and if we haven't shown them yet
    // Convert Set to Array for easy checking
    const weeklyReportsArray = Array.from(weeklyReportsShown);
    const monthlyReportsArray = Array.from(monthlyReportsShown);
    
    // Important: First determine what type of report should be shown
    const isMonthlyReportDay = day > 0 && day % 30 === 0 && !monthlyReportsArray.includes(day);
    const isWeeklyReportDay = day > 0 && day % 7 === 0 && day % 30 !== 0 && !weeklyReportsArray.includes(day);
    
    // Now set the report visibility based on the conditions determined above
    if (isMonthlyReportDay) {
      setShowMonthlyReport(true);
      setShowWeeklyReport(false); // Ensure weekly report is closed
    } else if (isWeeklyReportDay) {
      setShowWeeklyReport(true);
      setShowMonthlyReport(false); // Ensure monthly report is closed
    }
  };
  
  // Handle closing the weekly report
  const handleCloseWeeklyReport = () => {
    // Play button click sound
    audioService.playSound('buttonClick');
    
    // Get the current day from state
    const dayToTrack = currentDay;
    
    // Close the report
    setShowWeeklyReport(false);
    
    // Add current day to the set of days for which we've shown the report
    setWeeklyReportsShown(prev => {
      const newSet = new Set(prev);
      newSet.add(dayToTrack);
      return newSet;
    });
    
    // Ensure this state change is included in the next auto-save
    setTimeout(() => {
      const snapshot = createGameSnapshot();
      GameService.autoSave(snapshot);
    }, 100);
  };
  
  // Handle closing the monthly report
  const handleCloseMonthlyReport = () => {
    // Play button click sound
    audioService.playSound('buttonClick');
    
    // Get the current day from state
    const dayToTrack = currentDay;
    
    // Close the report
    setShowMonthlyReport(false);
    
    // Add current day to the set of days for which we've shown the report
    setMonthlyReportsShown(prev => {
      const newSet = new Set(prev);
      newSet.add(dayToTrack);
      return newSet;
    });
    
    // Ensure this state change is included in the next auto-save
    setTimeout(() => {
      const snapshot = createGameSnapshot();
      GameService.autoSave(snapshot);
    }, 100);
  };
  
  // Generate 3 daily trade offers
  const generateDailyTradeOffers = async () => {
    try {
      // Fetch current market data if not already available
      let currentMarketData = marketData;
      if (Object.keys(currentMarketData).length === 0) {
        const response = await axios.get('/market/status');
        if (response.data && response.data.stocks) {
          currentMarketData = response.data.stocks;
          setMarketData(response.data.stocks);
        }
      }
      
      // Only generate new offers if we don't have any
      if (availableTradeOffers.length === 0) {
        // Generate 3 trade offers
        const offers = [];
        for (let i = 0; i < 3; i++) {
          const offer = TradeOfferService.generateTradeOffer(portfolio, currentMarketData);
          if (offer) {
            offers.push(offer);
          }
        }
        
        // Update available trade offers
        setAvailableTradeOffers(offers.filter(Boolean)); // Filter out any null offers
      }
    } catch (error) {
      console.error("Error generating trade offers:", error);
    }
  };
  
  // Handle accepting a trade offer
  const handleAcceptTradeOffer = (offerIndex) => {
    // Play trade sound immediately
    audioService.playSound('trade');
    
    const selectedOffer = availableTradeOffers[offerIndex];
    if (!selectedOffer) return;
    
    // Execute the trade
    const updatedPortfolio = TradeOfferService.executeTrade(
      selectedOffer,
      portfolio
    );
    
    // Update portfolio state
    setPortfolio(updatedPortfolio);
    
    // Clear available trade offers and close the panel
    setAvailableTradeOffers([]);
    setShowTradeOffersPanel(false);
    
    // Auto-save after trading
    setTimeout(() => {
      const snapshot = createGameSnapshot();
      GameService.autoSave(snapshot);
    }, 500);
  };
  
  // Handle declining a specific trade offer
  const handleDeclineTradeOffer = (offerIndex) => {
    // Play button click sound
    audioService.playSound('buttonClick');
    
    // Remove the declined offer from the available offers
    setAvailableTradeOffers(prev => prev.filter((_, index) => index !== offerIndex));
    
    // If no offers left, close the panel
    if (availableTradeOffers.length <= 1) {
      setShowTradeOffersPanel(false);
    }
  };

  const handleTrade = (stockSymbol, quantity, price, isBuy) => {
    const tradeAmount = quantity * price;
    
    // Play trade sound immediately at the start of the function
    audioService.playSound('trade');
    
    if (isBuy) {
      // Check if we have enough cash
      if (portfolio.cash < tradeAmount) {
        alert("Not enough cash for this trade!");
        return;
      }
      
      // Add to portfolio
      setPortfolio(prevPortfolio => {
        const currentShares = prevPortfolio.stocks[stockSymbol] || 0;
        
        return {
          cash: prevPortfolio.cash - tradeAmount,
          stocks: {
            ...prevPortfolio.stocks,
            [stockSymbol]: currentShares + quantity
          },
          transactions: [
            ...prevPortfolio.transactions,
            {
              type: 'buy',
              symbol: stockSymbol,
              quantity,
              price,
              date: new Date().toISOString(),
              day: currentDay
            }
          ]
        };
      });
      
      // Auto-save after large trades (over $5000)
      if (tradeAmount > 5000) {
        setTimeout(() => {
          const snapshot = createGameSnapshot();
          GameService.autoSave(snapshot);
        }, 500); // Small delay to ensure state is updated
      }
    } else {
      // Check if we have enough shares
      const currentShares = portfolio.stocks[stockSymbol] || 0;
      if (currentShares < quantity) {
        alert("Not enough shares to sell!");
        return;
      }
      
      // Remove from portfolio
      setPortfolio(prevPortfolio => {
        const updatedStocks = { ...prevPortfolio.stocks };
        
        updatedStocks[stockSymbol] = currentShares - quantity;
        if (updatedStocks[stockSymbol] === 0) {
          delete updatedStocks[stockSymbol];
        }
        
        return {
          cash: prevPortfolio.cash + tradeAmount,
          stocks: updatedStocks,
          transactions: [
            ...prevPortfolio.transactions,
            {
              type: 'sell',
              symbol: stockSymbol,
              quantity,
              price,
              date: new Date().toISOString(),
              day: currentDay
            }
          ]
        };
      });
      
      // Auto-save after large trades (over $5000)
      if (tradeAmount > 5000) {
        setTimeout(() => {
          const snapshot = createGameSnapshot();
          GameService.autoSave(snapshot);
        }, 500); // Small delay to ensure state is updated
      }
    }
  };

  // Check for achievements when relevant game state changes
  useEffect(() => {
    if (gameState !== 'game') return;
    
    // Create current game state for achievement checks
    const currentState = {
      portfolio: portfolio,
      transactions: portfolio.transactions,
      day: currentDay,
      // Other relevant game state...
    };
    
    // Check for newly unlocked achievements
    const newAchievements = AchievementService.checkAchievements(currentState);
    
    // Only show notifications for truly new achievements (not previously unlocked before game start)
    if (newAchievements.length > 0) {
      const trulyNewAchievements = AchievementService.filterNewAchievements(
        newAchievements, 
        initialAchievements
      );
      
      if (trulyNewAchievements.length > 0) {
        setAchievementNotifications(prev => [...prev, ...trulyNewAchievements]);
      }
    }
  }, [portfolio, currentDay, gameState, initialAchievements]);

  // Helper to dismiss an achievement notification
  const dismissNotification = (index) => {
    setAchievementNotifications(prev => 
      prev.filter((_, i) => i !== index)
    );
  };

  // Render main menu if in menu state
  if (gameState === 'menu') {
    return <MainMenu onNewGame={handleNewGame} onLoadGame={handleLoadGame} />;
  }

  // Otherwise render the game
  return (
    <div className="app">
      {showSaveDialog && (
        <SaveDialog 
          currentSlot={currentSaveSlot}
          onSave={handleSaveToSlot}
          onCancel={() => {
            audioService.playSound('buttonClick');
            setShowSaveDialog(false);
          }}
        />
      )}
      
      {/* Achievement Panel */}
      {showAchievementPanel && (
        <AchievementPanel 
          isOpen={showAchievementPanel} 
          onClose={() => {
            audioService.playSound('buttonClick');
            setShowAchievementPanel(false);
          }} 
        />
      )}
      
      {/* Trade Offers Panel */}
      {showTradeOffersPanel && (
        <TradeOffersPanel
          isOpen={showTradeOffersPanel}
          onClose={() => {
            audioService.playSound('buttonClick');
            setShowTradeOffersPanel(false);
          }}
          offers={availableTradeOffers}
          onAcceptOffer={handleAcceptTradeOffer}
          onDeclineOffer={handleDeclineTradeOffer}
        />
      )}
      
      {/* Weekly Spending Report */}
      {showWeeklyReport && (
        <WeeklySpendingReport
          portfolio={portfolio}
          day={currentDay}
          onClose={handleCloseWeeklyReport}
        />
      )}
      
      {/* Monthly Earnings Report */}
      {showMonthlyReport && (
        <EarningsReport
          portfolio={portfolio}
          day={currentDay}
          onClose={handleCloseMonthlyReport}
        />
      )}
      
      {/* Achievement Notifications */}
      {achievementNotifications.map((achievement, index) => (
        <AchievementNotification 
          key={`${achievement.id}-${index}`} 
          achievement={achievement} 
          onClose={() => dismissNotification(index)} 
        />
      ))}
      
      <header className="app-header">
        <h1>Stock Market Simulator</h1>
        <div className="game-controls">
          <button 
            className="achievement-button" 
            onClick={() => {
              audioService.playSound('buttonClick');
              setShowAchievementPanel(true);
            }} 
            title="Achievements"
          >
            🏆
          </button>
          <button 
            className="economic-button" 
            onClick={() => {
              audioService.playSound('buttonClick');
              setShowEconomicIndicators(true);
            }} 
            title="Economic Indicators"
          >
            📊
          </button>
          <button 
            className="trade-offers-button" 
            onClick={() => {
              audioService.playSound('buttonClick');
              setShowTradeOffersPanel(true);
            }} 
            title="Trade Offers"
          >
            💼
          </button>
          <button 
            className="settings-button" 
            onClick={() => {
              audioService.playSound('buttonClick');
              setShowSettings(true);
            }} 
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </header>
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal-overlay" onClick={() => {
          audioService.playSound('buttonClick');
          setShowSettings(false);
        }}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <div>Settings</div>
              <span 
                className="close-button" 
                onClick={() => {
                  audioService.playSound('buttonClick');
                  setShowSettings(false);
                }}
              >
                ×
              </span>
            </div>
            <div className="settings-modal-content">
              <AudioSettings />
              <div className="settings-buttons">
                <button onClick={() => {
                  saveCurrentGame();
                  setShowSettings(false);
                }}>
                  💾 Save Game
                </button>
                <button onClick={() => {
                  handleReturnToMenu();
                  setShowSettings(false);
                }}>
                  🏠 Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Economic Indicators Dashboard */}
      {showEconomicIndicators && (
        <div className="overlay">
          <div className="indicators-container">
            <div className="close-container">
              <span 
                className="close-button" 
                onClick={() => {
                  audioService.playSound('buttonClick');
                  setShowEconomicIndicators(false);
                }}
              >
                ×
              </span>
            </div>
            <EconomicIndicators 
              day={currentDay} 
              marketData={marketData}
            />
          </div>
        </div>
      )}
      
      {/* Stock Spotlight */}
      <StockSpotlight 
        marketData={marketData} 
        onStockSelect={handleStockSelect} 
        currentDay={currentDay}
      />
      
      <div className="dashboard">
        <div className="left-panel">
          <MarketDisplay 
            onStockSelect={handleStockSelect} 
            setEvents={setEvents}
            onDayAdvance={handleDayAdvance}
            onMarketDataUpdate={setMarketData}
          />
          <Portfolio portfolio={portfolio} />
        </div>
        
        <div className="right-panel">
          {selectedStock && (
            <>
              <StockChart 
                stockSymbol={selectedStock} 
                currentDay={currentDay}
              />
              <TradePanel 
                stockSymbol={selectedStock}
                onTrade={handleTrade}
                currentDay={currentDay}
              />
            </>
          )}
          <EventNotifications events={events} />
        </div>
      </div>
    </div>
  );
}

export default App;
