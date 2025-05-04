from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from market_simulation.market import Market
from market_simulation.event_generator import EventGenerator
from market_simulation.price_movement import PriceMovementEngine
from market_simulation.sector import SectorManager
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

market = Market()
event_generator = EventGenerator()
price_engine = PriceMovementEngine()
sector_manager = SectorManager()

@app.on_event("startup")
async def startup_event():
    # Get the current directory of the script
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # Construct the absolute paths to the data files
    stocks_path = os.path.join(base_dir, "data", "stocks.json")
    sectors_path = os.path.join(base_dir, "data", "sectors.json")
    
    market.initialize_market(stocks_path, sectors_path)
    sector_manager.load_sectors(market.sectors)

@app.get("/market/status")
async def get_market_status():
    return {
        "day": market.current_day,
        "stocks": {
            symbol: {
                "current_price": stock.current_price,
                "previous_price": stock.history[-2] if len(stock.history) > 1 else stock.current_price,
                "initial_price": stock.history[0] if stock.history else stock.current_price,
                "sector": stock.sector
            } for symbol, stock in market.stocks.items()
        }
    }

@app.post("/market/advance-day")
async def advance_day():
    # Use optimized processing to make day advancement faster
    
    # Generate today's events - limit to max 3 events for performance
    events = event_generator.generate_daily_events()[:3]
    
    # Get sector trends with reduced computations
    sector_trends = sector_manager.get_sector_trends()
    
    # Apply price changes in optimized way
    price_engine.update_all_prices(market, sector_trends)
    
    # Advance day counter
    market.advance_day()
    
    # Return minimal data to improve response time
    return {
        "message": f"Advanced to day {market.current_day}",
        "events": events,
        "day": market.current_day
    }

@app.get("/market/stock/{symbol}/history")
async def get_stock_history(symbol: str):
    if symbol not in market.stocks:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    stock = market.stocks[symbol]
    history = stock.get_price_history()
    
    return {
        "symbol": symbol,
        "name": stock.name,
        "sector": stock.sector,
        "current_price": stock.current_price,
        "history": history,
        "day_range": list(range(market.current_day - len(history) + 1, market.current_day + 1))
    }

@app.post("/api/reset-market")
async def reset_market():
    """Reset the market for a new game"""
    # Reset the day counter
    market.current_day = 0
    
    # Reset stock prices to initial values
    for symbol, stock in market.stocks.items():
        # Reset the price to the initial price from when the market was created
        initial_price = stock.history[0] if stock.history else stock.current_price
        stock.current_price = initial_price
        # Clear price history except for the initial price
        stock.history = [initial_price]
    
    return {"message": "Market reset successfully", "day": market.current_day}