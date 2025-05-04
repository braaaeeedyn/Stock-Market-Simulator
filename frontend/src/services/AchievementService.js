/**
 * Achievement Service - Handles tracking and managing global achievements
 */

// List of all possible achievements
const ACHIEVEMENTS = [
  // Beginner Achievements
  {
    id: 'first_trade',
    name: 'First Steps',
    description: 'Make your first trade',
    icon: '💰',
    difficulty: 'easy'
  },
  {
    id: 'first_week',
    name: 'Week One',
    description: 'Survive your first week of trading',
    icon: '📅',
    difficulty: 'easy'
  },
  {
    id: 'first_profit',
    name: 'In The Green',
    description: 'Sell a stock for profit',
    icon: '✅',
    difficulty: 'easy'
  },
  {
    id: 'first_loss',
    name: 'Lesson Learned',
    description: 'Sell a stock at a loss',
    icon: '📉',
    difficulty: 'easy'
  },
  {
    id: 'double_money',
    name: 'Double Trouble',
    description: 'Double your initial investment',
    icon: '2️⃣',
    difficulty: 'easy'
  },
  
  // Wealth Achievements
  {
    id: 'rich_investor',
    name: 'Rich Investor',
    description: 'Accumulate a portfolio worth $100,000',
    icon: '💎',
    difficulty: 'medium'
  },
  {
    id: 'very_rich_investor',
    name: 'Very Rich Investor',
    description: 'Accumulate a portfolio worth $500,000',
    icon: '💍',
    difficulty: 'hard'
  },
  {
    id: 'millionaire',
    name: 'Stock Market Millionaire',
    description: 'Reach a portfolio value of $1,000,000',
    icon: '🤑',
    difficulty: 'very_hard'
  },
  {
    id: 'multi_millionaire',
    name: 'Multi-Millionaire',
    description: 'Reach a portfolio value of $5,000,000',
    icon: '💵',
    difficulty: 'very_hard'
  },
  {
    id: 'billionaire',
    name: 'Billionaire Club',
    description: 'Reach a portfolio value of $1,000,000,000',
    icon: '🏛️',
    difficulty: 'extreme'
  },
  
  // Strategy Achievements
  {
    id: 'diversified',
    name: 'Diversification Strategy',
    description: 'Own stocks from at least 5 different sectors',
    icon: '🌐',
    difficulty: 'medium'
  },
  {
    id: 'sector_master',
    name: 'Sector Master',
    description: 'Own stocks from all available sectors',
    icon: '🌍',
    difficulty: 'medium'
  },
  {
    id: 'balanced_portfolio',
    name: 'Balanced Portfolio',
    description: 'Have investments spread evenly across at least 6 sectors',
    icon: '⚖️',
    difficulty: 'hard'
  },
  {
    id: 'tech_guru',
    name: 'Tech Guru',
    description: 'Have over 70% of your portfolio in technology stocks',
    icon: '💻',
    difficulty: 'medium'
  },
  {
    id: 'energy_baron',
    name: 'Energy Baron',
    description: 'Have over 70% of your portfolio in energy stocks',
    icon: '⚡',
    difficulty: 'medium'
  },
  {
    id: 'healthcare_tycoon',
    name: 'Healthcare Tycoon',
    description: 'Have over 70% of your portfolio in healthcare stocks',
    icon: '🏥',
    difficulty: 'medium'
  },
  {
    id: 'finance_mogul',
    name: 'Finance Mogul',
    description: 'Have over 70% of your portfolio in finance stocks',
    icon: '🏦',
    difficulty: 'medium'
  },
  {
    id: 'consumer_king',
    name: 'Consumer King',
    description: 'Have over 70% of your portfolio in consumer stocks',
    icon: '👑',
    difficulty: 'medium'
  },
  
  // Trading Behavior
  {
    id: 'day_trader',
    name: 'Day Trader',
    description: 'Make 10 trades in a single day',
    icon: '⚡',
    difficulty: 'medium'
  },
  {
    id: 'trading_addict',
    name: 'Trading Addict',
    description: 'Make 50 trades in a single day',
    icon: '🎮',
    difficulty: 'hard'
  },
  {
    id: 'long_term',
    name: 'Long-Term Investor',
    description: 'Hold a stock for more than 30 days',
    icon: '🏆',
    difficulty: 'medium'
  },
  {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    description: 'Hold a stock for more than 100 days',
    icon: '💎',
    difficulty: 'hard'
  },
  {
    id: 'centenarian',
    name: 'Centenarian Investor',
    description: 'Play for 100 days',
    icon: '🎂',
    difficulty: 'hard'
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    description: 'Play for 365 days',
    icon: '🎉',
    difficulty: 'very_hard'
  },
  
  // Market Events
  {
    id: 'market_crash',
    name: 'Survived the Crash',
    description: 'Experience a market-wide drop of more than 20%',
    icon: '🔥',
    difficulty: 'medium'
  },
  {
    id: 'bull_market',
    name: 'Bull Market Rider',
    description: 'Achieve 50% portfolio growth in a 10-day period',
    icon: '📈',
    difficulty: 'hard'
  },
  {
    id: 'bear_market',
    name: 'Bear Market Survivor',
    description: 'Maintain a positive portfolio during a 20% market downturn',
    icon: '🐻',
    difficulty: 'hard'
  },
  {
    id: 'market_genius',
    name: 'Market Genius',
    description: 'Achieve 100% portfolio growth in a single month',
    icon: '🧠',
    difficulty: 'very_hard'
  },
  {
    id: 'sector_collapse',
    name: 'Sector Collapse Survivor',
    description: 'Experience a sector drop of more than 30%',
    icon: '🏗️',
    difficulty: 'medium'
  },
  
  // Performance Achievements
  {
    id: 'perfect_timing',
    name: 'Perfect Timing',
    description: 'Buy a stock at its lowest price of the month',
    icon: '⏰',
    difficulty: 'hard'
  },
  {
    id: 'profitable_month',
    name: 'Profitable Month',
    description: 'Achieve positive returns for 30 consecutive days',
    icon: '📆',
    difficulty: 'hard'
  },
  {
    id: 'growth_streak',
    name: 'Growth Streak',
    description: 'Increase portfolio value for 10 consecutive days',
    icon: '🔄',
    difficulty: 'medium'
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Recover from a 30% portfolio loss to a new all-time high',
    icon: '🔙',
    difficulty: 'hard'
  },
  {
    id: 'market_beater',
    name: 'Market Beater',
    description: 'Outperform average market returns for 30 consecutive days',
    icon: '🏅',
    difficulty: 'hard'
  },
  
  // Trade System Achievements
  {
    id: 'first_trade_offer',
    name: 'Deal or No Deal',
    description: 'Receive your first trade offer',
    icon: '🤝',
    difficulty: 'easy'
  },
  {
    id: 'trade_accepter',
    name: 'Deal Maker',
    description: 'Accept 5 trade offers',
    icon: '📝',
    difficulty: 'medium'
  },
  {
    id: 'trade_rejecter',
    name: 'Not Interested',
    description: 'Reject 10 trade offers',
    icon: '🚫',
    difficulty: 'medium'
  },
  {
    id: 'master_negotiator',
    name: 'Master Negotiator',
    description: 'Accept 25 trade offers',
    icon: '🔨',
    difficulty: 'hard'
  },
  {
    id: 'profitable_trader',
    name: 'Profitable Trader',
    description: 'Make $50,000 in profits from trade offers',
    icon: '💱',
    difficulty: 'hard'
  },
  
  // Volume Achievements
  {
    id: 'big_spender',
    name: 'Big Spender',
    description: 'Make a single trade worth over $100,000',
    icon: '💸',
    difficulty: 'medium'
  },
  {
    id: 'volume_trader',
    name: 'Volume Trader',
    description: 'Trade more than 1,000 shares in a single day',
    icon: '📊',
    difficulty: 'medium'
  },
  {
    id: 'hundred_trades',
    name: 'Century Club',
    description: 'Complete 100 trades',
    icon: '💯',
    difficulty: 'medium'
  },
  {
    id: 'thousand_trades',
    name: 'Trade Millennium',
    description: 'Complete 1,000 trades',
    icon: '🏭',
    difficulty: 'very_hard'
  },
  {
    id: 'portfolio_giant',
    name: 'Portfolio Giant',
    description: 'Own more than 10,000 shares across all stocks',
    icon: '🌟',
    difficulty: 'hard'
  },
  
  // Special Achievements
  {
    id: 'all_in',
    name: 'All In',
    description: 'Invest 100% of your cash in a single stock',
    icon: '🎲',
    difficulty: 'medium'
  },
  {
    id: 'penny_pincher',
    name: 'Penny Pincher',
    description: 'Own 1,000 shares of a stock worth less than $10',
    icon: '🪙',
    difficulty: 'medium'
  },
  {
    id: 'stock_collector',
    name: 'Stock Collector',
    description: 'Own at least 15 different stocks simultaneously',
    icon: '🗂️',
    difficulty: 'medium'
  },
  {
    id: 'zero_cash',
    name: 'All Assets, No Cash',
    description: 'Have less than $10 in cash with a portfolio worth over $50,000',
    icon: '0️⃣',
    difficulty: 'medium'
  },
  {
    id: 'back_to_square_one',
    name: 'Back to Square One',
    description: 'Return to exactly your starting cash amount after having at least $100,000',
    icon: '🔄',
    difficulty: 'extreme'
  }
];

export const AchievementService = {
  /**
   * Get all possible achievements with their unlock status
   */
  getAllAchievements: () => {
    const unlockedAchievements = AchievementService.getUnlockedAchievements();
    
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: unlockedAchievements.includes(achievement.id)
    }));
  },
  
  /**
   * Get IDs of unlocked achievements
   */
  getUnlockedAchievements: () => {
    try {
      const achievementsString = localStorage.getItem('stocksim_achievements');
      return achievementsString ? JSON.parse(achievementsString) : [];
    } catch (error) {
      console.error('Error loading achievements:', error);
      return [];
    }
  },
  
  /**
   * Check if an achievement is unlocked
   * @param {string} achievementId - The ID of the achievement to check
   */
  isAchievementUnlocked: (achievementId) => {
    const unlockedAchievements = AchievementService.getUnlockedAchievements();
    return unlockedAchievements.includes(achievementId);
  },
  
  /**
   * Unlock a new achievement
   * @param {string} achievementId - The ID of the achievement to unlock
   */
  unlockAchievement: (achievementId) => {
    try {
      // If achievement already unlocked, do nothing
      if (AchievementService.isAchievementUnlocked(achievementId)) {
        return false;
      }
      
      // Get current achievements
      const unlockedAchievements = AchievementService.getUnlockedAchievements();
      
      // Add new achievement
      unlockedAchievements.push(achievementId);
      
      // Save updated achievements
      localStorage.setItem('stocksim_achievements', JSON.stringify(unlockedAchievements));
      
      // Find achievement details for notification
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      
      // Return achievement for notification
      return achievement || true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  },
  
  /**
   * Reset all achievements (for testing or new game)
   */
  resetAllAchievements: () => {
    localStorage.removeItem('stocksim_achievements');
  },
  
  /**
   * Check game state against achievement criteria
   * @param {object} gameState - Current game state to check
   * @returns {Array} - List of newly unlocked achievements
   */
  checkAchievements: (gameState) => {
    const newlyUnlocked = [];
    const { portfolio, transactions, day } = gameState;
    
    // Helper: Calculate total portfolio value
    const calculateTotalValue = () => {
      const { cash, stocks } = portfolio;
      let stocksValue = 0;
      
      // We need the current prices to calculate accurately
      // In a real implementation, you would pass current stock prices to this function
      // For now, we'll use a simplified approach based on last transaction prices
      
      if (transactions && transactions.length > 0) {
        // Use price data from recent transactions
        const stockPrices = {};
        
        // Get most recent price for each stock from transactions
        transactions.forEach(t => {
          stockPrices[t.symbol] = t.price;
        });
        
        // Calculate value
        Object.entries(stocks).forEach(([symbol, quantity]) => {
          if (stockPrices[symbol]) {
            stocksValue += stockPrices[symbol] * quantity;
          }
        });
      }
      
      return cash + stocksValue;
    };
    
    // Check for First Trade achievement
    if (!AchievementService.isAchievementUnlocked('first_trade') && 
        portfolio.transactions && portfolio.transactions.length > 0) {
      const result = AchievementService.unlockAchievement('first_trade');
      if (result) newlyUnlocked.push(result);
    }
    
    // Check for wealth-based achievements
    const totalValue = calculateTotalValue();
    
    if (!AchievementService.isAchievementUnlocked('double_money') && 
        totalValue >= 1000) { // Starting with $500, double is $1000
      const result = AchievementService.unlockAchievement('double_money');
      if (result) newlyUnlocked.push(result);
    }
    
    if (!AchievementService.isAchievementUnlocked('rich_investor') && 
        totalValue >= 100000) {
      const result = AchievementService.unlockAchievement('rich_investor');
      if (result) newlyUnlocked.push(result);
    }
    
    if (!AchievementService.isAchievementUnlocked('very_rich_investor') && 
        totalValue >= 500000) {
      const result = AchievementService.unlockAchievement('very_rich_investor');
      if (result) newlyUnlocked.push(result);
    }
    
    if (!AchievementService.isAchievementUnlocked('millionaire') && 
        totalValue >= 1000000) {
      const result = AchievementService.unlockAchievement('millionaire');
      if (result) newlyUnlocked.push(result);
    }
    
    if (!AchievementService.isAchievementUnlocked('multi_millionaire') && 
        totalValue >= 5000000) {
      const result = AchievementService.unlockAchievement('multi_millionaire');
      if (result) newlyUnlocked.push(result);
    }
    
    if (!AchievementService.isAchievementUnlocked('billionaire') && 
        totalValue >= 1000000000) {
      const result = AchievementService.unlockAchievement('billionaire');
      if (result) newlyUnlocked.push(result);
    }
    
    // Check for day-based achievements
    if (!AchievementService.isAchievementUnlocked('first_week') && day >= 7) {
      const result = AchievementService.unlockAchievement('first_week');
      if (result) newlyUnlocked.push(result);
    }
    
    if (!AchievementService.isAchievementUnlocked('centenarian') && day >= 100) {
      const result = AchievementService.unlockAchievement('centenarian');
      if (result) newlyUnlocked.push(result);
    }
    
    if (!AchievementService.isAchievementUnlocked('anniversary') && day >= 365) {
      const result = AchievementService.unlockAchievement('anniversary');
      if (result) newlyUnlocked.push(result);
    }
    
    // Check trades in a single day (counting today's transactions)
    if (transactions && transactions.length > 0) {
      const today = day;
      const todaysTransactions = transactions.filter(t => {
        // Check if transaction happened today
        // In a real implementation, you'd compare dates properly
        // Here we're simplifying by assuming the transactions have a day property
        return t.day === today;
      });
      
      if (!AchievementService.isAchievementUnlocked('day_trader') && 
          todaysTransactions.length >= 10) {
        const result = AchievementService.unlockAchievement('day_trader');
        if (result) newlyUnlocked.push(result);
      }
      
      if (!AchievementService.isAchievementUnlocked('trading_addict') && 
          todaysTransactions.length >= 50) {
        const result = AchievementService.unlockAchievement('trading_addict');
        if (result) newlyUnlocked.push(result);
      }
      
      // Check for first profit transaction
      const profitTransaction = transactions.find(t => 
        t.type === 'sell' && t.profit && t.profit > 0
      );
      
      if (!AchievementService.isAchievementUnlocked('first_profit') && profitTransaction) {
        const result = AchievementService.unlockAchievement('first_profit');
        if (result) newlyUnlocked.push(result);
      }
      
      // Check for first loss transaction
      const lossTransaction = transactions.find(t => 
        t.type === 'sell' && t.profit && t.profit < 0
      );
      
      if (!AchievementService.isAchievementUnlocked('first_loss') && lossTransaction) {
        const result = AchievementService.unlockAchievement('first_loss');
        if (result) newlyUnlocked.push(result);
      }
      
      // Check total number of trades for volume achievements
      if (!AchievementService.isAchievementUnlocked('hundred_trades') && 
          transactions.filter(t => t.type === 'buy' || t.type === 'sell').length >= 100) {
        const result = AchievementService.unlockAchievement('hundred_trades');
        if (result) newlyUnlocked.push(result);
      }
      
      if (!AchievementService.isAchievementUnlocked('thousand_trades') && 
          transactions.filter(t => t.type === 'buy' || t.type === 'sell').length >= 1000) {
        const result = AchievementService.unlockAchievement('thousand_trades');
        if (result) newlyUnlocked.push(result);
      }
    }
    
    // Check for trade offer achievements
    if (transactions && transactions.length > 0) {
      const tradeOffers = transactions.filter(t => t.type === 'trade');
      
      if (!AchievementService.isAchievementUnlocked('first_trade_offer') && tradeOffers.length >= 1) {
        const result = AchievementService.unlockAchievement('first_trade_offer');
        if (result) newlyUnlocked.push(result);
      }
      
      if (!AchievementService.isAchievementUnlocked('trade_accepter') && tradeOffers.length >= 5) {
        const result = AchievementService.unlockAchievement('trade_accepter');
        if (result) newlyUnlocked.push(result);
      }
      
      if (!AchievementService.isAchievementUnlocked('master_negotiator') && tradeOffers.length >= 25) {
        const result = AchievementService.unlockAchievement('master_negotiator');
        if (result) newlyUnlocked.push(result);
      }
    }
    
    // Check portfolio diversity (needs actual sector data which we'll simulate here)
    if (portfolio && portfolio.stocks && Object.keys(portfolio.stocks).length > 0) {
      // Get number of different stocks
      const numberOfDifferentStocks = Object.keys(portfolio.stocks).length;
      
      if (!AchievementService.isAchievementUnlocked('stock_collector') && 
          numberOfDifferentStocks >= 15) {
        const result = AchievementService.unlockAchievement('stock_collector');
        if (result) newlyUnlocked.push(result);
      }
      
      // Get total shares
      const totalShares = Object.values(portfolio.stocks).reduce((sum, quantity) => sum + quantity, 0);
      
      if (!AchievementService.isAchievementUnlocked('portfolio_giant') && 
          totalShares >= 10000) {
        const result = AchievementService.unlockAchievement('portfolio_giant');
        if (result) newlyUnlocked.push(result);
      }
      
      // Check for 'All Assets, No Cash' achievement
      if (!AchievementService.isAchievementUnlocked('zero_cash') && 
          portfolio.cash < 10 && totalValue > 50000) {
        const result = AchievementService.unlockAchievement('zero_cash');
        if (result) newlyUnlocked.push(result);
      }
      
      // Check for 'Back to Square One' achievement
      if (!AchievementService.isAchievementUnlocked('back_to_square_one') && 
          Math.abs(portfolio.cash - 500) < 1 && // Very close to starting cash of $500
          gameState.hadHighValue && gameState.hadHighValue >= 100000) { // Previously had $100k
        const result = AchievementService.unlockAchievement('back_to_square_one');
        if (result) newlyUnlocked.push(result);
      }
    }
    
    // More achievement checks would be added for the rest of the achievements
    
    return newlyUnlocked;
  },
  
  /**
   * Filter achievements to only those unlocked in the current session
   * @param {Array} achievements - List of achievement objects
   * @param {Array} initialAchievementIds - List of achievement IDs already unlocked at session start
   * @returns {Array} - List of truly new achievements
   */
  filterNewAchievements: (achievements, initialAchievementIds) => {
    if (!achievements || !Array.isArray(achievements)) return [];
    if (!initialAchievementIds || !Array.isArray(initialAchievementIds)) return achievements;
    
    return achievements.filter(achievement => 
      !initialAchievementIds.includes(achievement.id)
    );
  }
};

export default AchievementService; 