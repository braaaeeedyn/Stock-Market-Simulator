class Stock:
    def __init__(self, symbol, name, sector, initial_price, volatility):
        self.symbol = symbol
        self.name = name
        self.sector = sector
        self.current_price = initial_price
        self.history = [initial_price]
        self.volatility = volatility  # Float between 0-1 representing price fluctuation tendency
        
    def update_price(self, new_price):
        """Update the stock's current price and add to history"""
        self.current_price = new_price
        self.history.append(new_price)
        
    def get_price_history(self, length=30):
        """Return the most recent price history"""
        return self.history[-length:]