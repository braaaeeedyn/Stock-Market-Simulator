/**
 * Trade Offer Service - Handles generating random trade offers
 */

export const TradeOfferService = {
  /**
   * Generate a random trade offer based on the current portfolio and market data
   * @param {object} portfolio - The player's current portfolio
   * @param {object} marketData - Current market data with stock prices
   * @returns {object|null} A trade offer object or null if no offer could be generated
   */
  generateTradeOffer: (portfolio, marketData) => {
    // Check if we have the necessary data
    if (!portfolio || !marketData || Object.keys(marketData).length === 0) {
      return null;
    }

    const { cash, stocks } = portfolio;
    
    // Determine what kind of trade to generate (1-4)
    // 1: Player gives cash for stocks
    // 2: Player gives stocks for cash
    // 3: Player gives stocks for different stocks
    // 4: Player gives mix of cash and stocks for mix of cash and stocks
    const tradeType = Math.floor(Math.random() * 4) + 1;
    
    // Choose random values within reasonable ranges based on player's portfolio
    const maxCashOffer = cash * 0.6; // Don't ask for too much cash
    const minCashOffer = Math.min(cash * 0.1, 50); // Reasonable minimum
    
    // Get available stocks (from market and player's portfolio)
    const availableMarketStocks = Object.entries(marketData)
      .map(([symbol, data]) => ({
        symbol,
        price: typeof data === 'object' ? data.current_price : data
      }));
      
    const playerStocks = Object.entries(stocks)
      .filter(([_, quantity]) => quantity > 0)
      .map(([symbol, quantity]) => {
        const stockData = marketData[symbol];
        const price = typeof stockData === 'object' 
          ? stockData.current_price 
          : (stockData || 100); // Fallback price
          
        return {
          symbol,
          quantity,
          price
        };
      });
      
    let yourOffer = [];
    let theirOffer = [];
    
    // If player has no stocks, default to cash for stocks trade
    const effectiveTradeType = playerStocks.length === 0 ? 1 : tradeType;
    
    // Helper function to add slight variance (-5% to +10%)
    const addFairVariance = (value) => {
      // Random number between -5% and +10%
      const variance = (Math.random() * 0.15) - 0.05;
      return value * (1 + variance);
    };
    
    // Helper function to ensure a value is within a specific percentage range of a target
    const ensureWithinRange = (value, target, percentage = 0.1) => {
      const min = target * (1 - percentage);
      const max = target * (1 + percentage);
      return Math.max(min, Math.min(max, value));
    };
    
    switch (effectiveTradeType) {
      case 1: // Player gives cash for stocks
        if (cash < minCashOffer) return null; // Not enough cash
        
        // First select 1-2 random stocks to offer
        const numStocksToOffer = Math.floor(Math.random() * 2) + 1;
        let totalStockValue = 0;
        
        // Choose the stocks first to determine their value
        for (let i = 0; i < numStocksToOffer; i++) {
          if (availableMarketStocks.length === 0) break;
          
          // Pick a random stock
          const stockIndex = Math.floor(Math.random() * availableMarketStocks.length);
          const stock = availableMarketStocks[stockIndex];
          
          // Determine a reasonable quantity based on player's cash
          const stockValue = stock.price || 100;
          // Calculate how many shares would be approximately fair for the player's cash
          const maxAffordableQuantity = Math.floor(maxCashOffer / stockValue);
          // Don't offer too many of a single stock - between 1 and 10 shares with a cap
          const quantity = Math.min(maxAffordableQuantity, Math.max(1, Math.floor(Math.random() * 5) + 1));
          
          // Skip if quantity is zero (too expensive stock)
          if (quantity <= 0) continue;
          
          const stockTotalValue = quantity * stockValue;
          totalStockValue += stockTotalValue;
          
          theirOffer.push({ 
            type: 'stock', 
            symbol: stock.symbol, 
            quantity,
            price: stockValue 
          });
          
          // Remove this stock from available list to avoid duplicates
          availableMarketStocks.splice(stockIndex, 1);
        }
        
        // If no stocks were selected or total value is excessive, return null
        if (theirOffer.length === 0 || totalStockValue > maxCashOffer * 1.5) return null;
        
        // Now set the cash amount to be within 10% of stock value
        // Random variance between -10% and +10%
        const variance = (Math.random() * 0.2) - 0.1;
        let cashAmount = totalStockValue * (1 + variance);
        
        // Add additional safeguards against extreme values
        // If the calculated amount is more than 50% of player's cash, cap it
        if (cashAmount > cash * 0.5) {
          cashAmount = Math.min(cashAmount, cash * 0.5);
        }
        
        // Ensure the cash amount is within reasonable range
        const finalCashAmount = Math.max(
          Math.min(cashAmount, maxCashOffer),
          Math.min(minCashOffer, totalStockValue * 0.9) // At least 90% of stock value but not less than min offer
        );
        
        // Verify the trade is reasonable - cash shouldn't be more than 15% off from stock value
        if (Math.abs(finalCashAmount - totalStockValue) / totalStockValue > 0.15) {
          // If we're asking too much relative to stock value, adjust it
          const adjustedCashAmount = Math.min(
            totalStockValue * 1.1, // Max 10% above stock value
            Math.max(totalStockValue * 0.9, minCashOffer) // Min 10% below stock value but not less than min offer
          );
          
          yourOffer.push({ type: 'cash', amount: Math.round(adjustedCashAmount * 100) / 100 });
        } else {
          yourOffer.push({ type: 'cash', amount: Math.round(finalCashAmount * 100) / 100 });
        }
        
        // One last check - log if the ratio is too extreme for debugging
        const cashOffered = yourOffer[0].amount;
        if (Math.abs(cashOffered - totalStockValue) / totalStockValue > 0.15) {
          console.warn(`WARNING: Trade imbalance - Cash: $${cashOffered.toFixed(2)}, Stocks: $${totalStockValue.toFixed(2)}, Ratio: ${(cashOffered/totalStockValue).toFixed(2)}`);
        }
        
        break;
        
      case 2: // Player gives stocks for cash
        if (playerStocks.length === 0) return null; // No stocks to trade
        
        // Choose 1-2 random stocks from player's portfolio
        const numPlayerStocksToTrade = Math.min(playerStocks.length, Math.floor(Math.random() * 2) + 1);
        let totalValue = 0;
        
        for (let i = 0; i < numPlayerStocksToTrade; i++) {
          // Pick a random stock
          const stockIndex = Math.floor(Math.random() * playerStocks.length);
          const playerStock = playerStocks[stockIndex];
          
          // Request some portion of their holdings
          const maxQuantity = playerStock.quantity;
          const requestedQuantity = Math.max(1, Math.floor(maxQuantity * (0.3 + Math.random() * 0.4)));
          
          yourOffer.push({
            type: 'stock',
            symbol: playerStock.symbol,
            quantity: requestedQuantity,
            price: playerStock.price
          });
          
          totalValue += requestedQuantity * playerStock.price;
          
          // Remove this stock from available list to avoid duplicates
          playerStocks.splice(stockIndex, 1);
        }
        
        // If total value is too small, offer might not be compelling
        if (totalValue < 10) return null;
        
        // Offer cash with a slight variance, but ensure it's within 10% of stock value
        const fairCashAmount = ensureWithinRange(addFairVariance(totalValue), totalValue, 0.1);
        theirOffer.push({ 
          type: 'cash', 
          amount: Math.round(fairCashAmount * 100) / 100 
        });
        
        // Verify the trade is reasonable
        const cashReceived = theirOffer[0].amount;
        if (Math.abs(cashReceived - totalValue) / totalValue > 0.15) {
          console.warn(`WARNING: Stocks-for-cash imbalance - Stocks: $${totalValue.toFixed(2)}, Cash: $${cashReceived.toFixed(2)}, Ratio: ${(cashReceived/totalValue).toFixed(2)}`);
        }
        
        break;
        
      case 3: // Player gives stocks for different stocks
        if (playerStocks.length === 0) return null; // No stocks to trade
        
        // Choose 1-2 random stocks from player's portfolio
        const numStocksToTrade = Math.min(playerStocks.length, Math.floor(Math.random() * 2) + 1);
        let playerTotalValue = 0;
        
        for (let i = 0; i < numStocksToTrade; i++) {
          // Pick a random stock
          const stockIndex = Math.floor(Math.random() * playerStocks.length);
          const playerStock = playerStocks[stockIndex];
          
          // Request some portion of their holdings
          const maxQuantity = playerStock.quantity;
          const requestedQuantity = Math.max(1, Math.floor(maxQuantity * (0.3 + Math.random() * 0.4)));
          
          yourOffer.push({
            type: 'stock',
            symbol: playerStock.symbol,
            quantity: requestedQuantity,
            price: playerStock.price
          });
          
          playerTotalValue += requestedQuantity * playerStock.price;
          
          // Remove this stock from available list to avoid duplicates
          playerStocks.splice(stockIndex, 1);
        }
        
        // If player value is too small, not worth offering
        if (playerTotalValue < 10) return null;
        
        // Offer different stocks of similar value using our range helper
        const targetOfferValue = ensureWithinRange(addFairVariance(playerTotalValue), playerTotalValue, 0.1);
        let currentOfferValue = 0;
        
        // Offer 1-2 different stocks
        const numDifferentStocks = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numDifferentStocks; i++) {
          if (availableMarketStocks.length === 0) break;
          
          // Pick a random stock
          const stockIndex = Math.floor(Math.random() * availableMarketStocks.length);
          const stock = availableMarketStocks[stockIndex];
          
          // Calculate quantity based on value to offer
          const valuePerStock = targetOfferValue / numDifferentStocks;
          const stockValue = stock.price || 100;
          const quantity = Math.max(1, Math.floor(valuePerStock / stockValue));
          
          // Skip if quantity is zero
          if (quantity <= 0) continue;
          
          theirOffer.push({ 
            type: 'stock', 
            symbol: stock.symbol, 
            quantity,
            price: stockValue 
          });
          
          currentOfferValue += quantity * stockValue;
          
          // Remove this stock from available list to avoid duplicates
          availableMarketStocks.splice(stockIndex, 1);
        }
        
        // If we couldn't add any stocks, return null
        if (theirOffer.length === 0) return null;
        
        // If the trade is too unbalanced, adjust the quantity of the last stock
        if (Math.abs(currentOfferValue - playerTotalValue) / playerTotalValue > 0.1) {
          const lastStock = theirOffer[theirOffer.length - 1];
          const singleStockValue = lastStock.price;
          
          // Add or subtract units to get closer to the target value
          if (currentOfferValue < playerTotalValue * 0.9) {
            // Need to add units
            const unitsToAdd = Math.ceil((playerTotalValue * 0.9 - currentOfferValue) / singleStockValue);
            lastStock.quantity += unitsToAdd;
            currentOfferValue += unitsToAdd * singleStockValue;
          } else if (currentOfferValue > playerTotalValue * 1.1 && lastStock.quantity > 1) {
            // Need to remove units
            const unitsToRemove = Math.min(
              lastStock.quantity - 1,
              Math.ceil((currentOfferValue - playerTotalValue * 1.1) / singleStockValue)
            );
            lastStock.quantity -= unitsToRemove;
            currentOfferValue -= unitsToRemove * singleStockValue;
          }
        }
        
        // Final check - if still too unbalanced, log it
        if (Math.abs(currentOfferValue - playerTotalValue) / playerTotalValue > 0.15) {
          console.warn(`WARNING: Stocks-for-stocks imbalance - Your stocks: $${playerTotalValue.toFixed(2)}, Their stocks: $${currentOfferValue.toFixed(2)}, Ratio: ${(currentOfferValue/playerTotalValue).toFixed(2)}`);
        }
        
        break;
        
      case 4: // Mix of cash and stocks for mix of cash and stocks
        // First, determine what to ask from the player
        let playerOfferValue = 0;
        
        // Maybe ask for some cash
        if (cash >= minCashOffer && Math.random() > 0.4) {
          const cashAmount = Math.random() * (maxCashOffer * 0.4 - minCashOffer) + minCashOffer;
          const limitedCashAmount = Math.min(cashAmount, cash * 0.4); // Don't ask for too much cash
          yourOffer.push({ type: 'cash', amount: Math.round(limitedCashAmount * 100) / 100 });
          playerOfferValue += limitedCashAmount;
        }
        
        // Maybe ask for some stocks
        if (playerStocks.length > 0 && Math.random() > 0.3) {
          // Pick a random stock
          const stockIndex = Math.floor(Math.random() * playerStocks.length);
          const playerStock = playerStocks[stockIndex];
          
          // Request some portion of their holdings
          const maxQuantity = playerStock.quantity;
          const requestedQuantity = Math.max(1, Math.floor(maxQuantity * (0.2 + Math.random() * 0.3)));
          
          yourOffer.push({
            type: 'stock',
            symbol: playerStock.symbol,
            quantity: requestedQuantity,
            price: playerStock.price
          });
          
          playerOfferValue += requestedQuantity * playerStock.price;
          
          // Remove this stock from available list to avoid duplicates
          playerStocks.splice(stockIndex, 1);
        }
        
        // If nothing was requested or value is too small, return null
        if (yourOffer.length === 0 || playerOfferValue < 10) return null;
        
        // Now determine what to offer in return - ensure it's within 10% of player offer value
        const returnOfferValue = ensureWithinRange(addFairVariance(playerOfferValue), playerOfferValue, 0.1);
        
        // Decide whether to offer cash, stocks, or both based on the total value
        const offerCashPortion = Math.random(); // 0 to 1, representing what portion to offer as cash
        
        // Calculate how much to offer as cash
        const cashOfferAmount = returnOfferValue * offerCashPortion;
        
        // If cash portion is significant, add it to the offer
        if (cashOfferAmount >= 10) {
          theirOffer.push({ 
            type: 'cash', 
            amount: Math.round(cashOfferAmount * 100) / 100 
          });
        }
        
        // Calculate remaining value to offer as stocks
        const remainingStockValue = returnOfferValue - cashOfferAmount;
        
        // If there's significant value left and we have stocks available, offer some stocks
        if (remainingStockValue >= 10 && availableMarketStocks.length > 0) {
          // Pick a random stock
          const stockIndex = Math.floor(Math.random() * availableMarketStocks.length);
          const stock = availableMarketStocks[stockIndex];
          
          // Calculate quantity
          const stockValue = stock.price || 100;
          const quantity = Math.max(1, Math.floor(remainingStockValue / stockValue));
          
          if (quantity > 0) {
            theirOffer.push({ 
              type: 'stock', 
              symbol: stock.symbol, 
              quantity,
              price: stockValue 
            });
          }
        }
        
        // If no offers were generated, add a cash offer equal to the fair value
        if (theirOffer.length === 0) {
          theirOffer.push({ 
            type: 'cash', 
            amount: Math.round(returnOfferValue * 100) / 100 
          });
        }
        
        // Calculate the final offer value from their side
        const finalOfferValue = theirOffer.reduce((sum, item) => {
          if (item.type === 'cash') return sum + item.amount;
          return sum + (item.quantity * item.price);
        }, 0);
        
        // Log if the trade is unbalanced
        if (Math.abs(finalOfferValue - playerOfferValue) / playerOfferValue > 0.15) {
          console.warn(`WARNING: Mixed trade imbalance - Your offer: $${playerOfferValue.toFixed(2)}, Their offer: $${finalOfferValue.toFixed(2)}, Ratio: ${(finalOfferValue/playerOfferValue).toFixed(2)}`);
        }
        
        break;
    }
    
    // Ensure we have something to offer and something to receive
    if (yourOffer.length === 0 || theirOffer.length === 0) {
      return null;
    }
    
    // Calculate and log the total values for debugging
    const yourTotal = yourOffer.reduce((sum, item) => {
      if (item.type === 'cash') return sum + item.amount;
      return sum + (item.quantity * item.price);
    }, 0);
    
    const theirTotal = theirOffer.reduce((sum, item) => {
      if (item.type === 'cash') return sum + item.amount;
      return sum + (item.quantity * item.price);
    }, 0);
    
    console.log(`Trade offer - You give: $${yourTotal.toFixed(2)}, You get: $${theirTotal.toFixed(2)}, Ratio: ${(theirTotal/yourTotal).toFixed(2)}`);
    
    return {
      yourOffer,
      theirOffer
    };
  },
  
  /**
   * Check if a trade offer should be generated (1 in 15 chance per day)
   * @param {object} gameState - The current game state to check if a trade was already offered today
   * @returns {boolean} Whether a trade offer should be generated
   */
  shouldGenerateOffer: (gameState) => {
    // If a trade was already offered today, don't offer another one
    if (gameState && gameState.lastTradeOfferDay === gameState.currentDay) {
      return false;
    }
    
    // 1 in 15 chance (approximately 6.67%)
    return Math.random() < 0.0667;
  },
  
  /**
   * Execute a trade based on the accepted offer
   * @param {object} offer - The trade offer that was accepted
   * @param {object} portfolio - The player's current portfolio
   * @returns {object} The updated portfolio after the trade
   */
  executeTrade: (offer, portfolio) => {
    if (!offer || !portfolio) return portfolio;
    
    const { yourOffer, theirOffer } = offer;
    const updatedPortfolio = { ...portfolio };
    const { cash, stocks } = updatedPortfolio;
    
    // Process what the player is giving up
    yourOffer.forEach(item => {
      if (item.type === 'cash') {
        // Deduct cash
        updatedPortfolio.cash = cash - item.amount;
      } else {
        // Remove stocks
        const currentQuantity = stocks[item.symbol] || 0;
        if (currentQuantity >= item.quantity) {
          if (currentQuantity === item.quantity) {
            // Remove the stock entirely if 0 shares remain
            delete updatedPortfolio.stocks[item.symbol];
          } else {
            // Reduce the quantity
            updatedPortfolio.stocks[item.symbol] = currentQuantity - item.quantity;
          }
        }
      }
    });
    
    // Process what the player is receiving
    theirOffer.forEach(item => {
      if (item.type === 'cash') {
        // Add cash
        updatedPortfolio.cash = (updatedPortfolio.cash || 0) + item.amount;
      } else {
        // Add stocks
        const currentQuantity = updatedPortfolio.stocks[item.symbol] || 0;
        updatedPortfolio.stocks[item.symbol] = currentQuantity + item.quantity;
      }
    });
    
    // Add a transaction record
    const transaction = {
      type: 'trade',
      yourOffer,
      theirOffer,
      date: new Date().toISOString()
    };
    
    updatedPortfolio.transactions = [
      ...(updatedPortfolio.transactions || []),
      transaction
    ];
    
    return updatedPortfolio;
  }
};

export default TradeOfferService; 