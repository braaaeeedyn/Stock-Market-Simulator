import random
import numpy as np
from typing import Dict
from .stock import Stock

class PriceMovementEngine:
    def __init__(self):
        # Add cache for performance optimization
        self.volatility_cache = {}
    
    @staticmethod
    def random_walk(stock: Stock) -> float:
        """Calculate new price based on random walk with volatility"""
        change_percent = np.random.normal(0, stock.volatility/10)
        new_price = stock.current_price * (1 + change_percent)
        return max(0.01, new_price)  # Prevent negative prices
        
    @staticmethod
    def apply_sector_trend(stock: Stock, sector_trend: float) -> float:
        """Adjust price based on sector performance"""
        trend_effect = stock.current_price * (sector_trend * stock.volatility)
        return stock.current_price + trend_effect
        
    def update_all_prices(self, market, sector_trends):
        """Update prices for all stocks in the market"""
        # Process stocks in batch for performance
        updated_prices = {}
        
        for symbol, stock in market.stocks.items():
            # Cache volatility calculations for better performance
            if symbol not in self.volatility_cache:
                self.volatility_cache[symbol] = stock.volatility
                
            base_price = self.random_walk(stock)
            sector_adj_price = self.apply_sector_trend(stock, sector_trends.get(stock.sector, 0))
            
            # Use simplified calculation for better performance
            new_price = (base_price + sector_adj_price) / 2 * (0.995 + random.random() * 0.03)
            updated_prices[symbol] = max(0.01, new_price)
        
        # Batch update after calculations to improve performance
        for symbol, price in updated_prices.items():
            market.stocks[symbol].update_price(price)