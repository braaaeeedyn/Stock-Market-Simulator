from .stock import Stock
import json
from typing import Dict

class Market:
    def __init__(self):
        self.stocks: Dict[str, Stock] = {}
        self.sectors = {}
        self.current_day = 0
        
    def initialize_market(self, stocks_data_path: str, sectors_data_path: str):
        """Load stocks and sectors from JSON files"""
        with open(stocks_data_path) as f:
            stocks_data = json.load(f)
        
        with open(sectors_data_path) as f:
            self.sectors = json.load(f)
            
        for stock_data in stocks_data:
            stock = Stock(
                symbol=stock_data['symbol'],
                name=stock_data['name'],
                sector=stock_data['sector'],
                initial_price=stock_data['initial_price'],
                volatility=stock_data['volatility']
            )
            self.stocks[stock.symbol] = stock
            
    def advance_day(self):
        """Move the market forward one day"""
        self.current_day += 1
        # Price updates will be handled by the price movement system