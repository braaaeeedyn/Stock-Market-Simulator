# Stock Market Simulator

A comprehensive, interactive stock market simulation game that lets players experience the thrills and challenges of trading in a risk-free environment. This application combines realistic market dynamics with educational elements to help users understand stock trading, market trends, and portfolio management strategies.

The simulator features dynamic price movements influenced by sector trends, economic indicators, and random events. Start with $500 of virtual cash and build your wealth by making strategic investment decisions across 25+ stocks in 9 different market sectors.

## Key Features

### Market Simulation
- **Dynamic Stock Market**: 25+ unique stocks across 9 distinct sectors with realistic price movements
- **Sector-Based Price Movements**: Stocks in the same sector show correlated behavior
- **Economic Indicators Dashboard**: Monitor inflation rates, interest rates, GDP growth, unemployment, and consumer confidence
- **Random Market Events**: Experience market crashes, sector booms, company news, and other surprises
- **Day Advancement System**: Progress through market days to see how your investments perform over time

### Trading & Portfolio Management
- **Interactive Trading Interface**: Buy and sell stocks with real-time pricing
- **Portfolio Tracking**: Monitor your holdings, purchase history, and performance metrics
- **Transaction History**: Review all your past trades with detailed information
- **Trade Offers System**: Receive random trade opportunities with potential advantages
- **Performance Analytics**: See daily and overall percentage changes for your investments

### User Experience
- **Interactive Dashboard**: Sortable stock tables with visual indicators for price movements
- **Detailed Stock Charts**: View price history and trends for any stock
- **Economic Reports**: Weekly spending reports and monthly earnings summaries to track your progress
- **Achievement System**: Unlock achievements by reaching financial milestones and trading goals
- **Save/Load System**: Multiple save slots with auto-save functionality
- **Main Menu Interface**: Start new games or continue existing ones

### Technical Features
- **Modern React Frontend**: Clean, responsive user interface with interactive components
- **FastAPI Backend**: High-performance Python backend for market simulation
- **Real-time Data Updates**: Continuous market data synchronization
- **Responsive Design**: Works on different screen sizes and devices
- **Sound Effects**: Audio feedback for trading, day advancement, and important events
- **Optimized Performance**: Fast processing between day advancements

## Screenshots

![Market Dashboard](screenshots/dashboard.png)
![Portfolio View](screenshots/portfolio.png)
![Trade Interface](screenshots/trading.png)

## Installation Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- npm or yarn

### Step 1: Clone the repository

```bash
git clone https://github.com/yourusername/stock-market-simulator.git
cd stock-market-simulator
```

### Step 2: Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Set up the frontend

```bash
cd frontend
npm install
```

## Running the Application

### Start the backend server

```bash
cd backend
python -m uvicorn main:app --reload
```

The backend API will be available at http://localhost:8000

### Start the frontend application

In a new terminal:

```bash
cd frontend
npm start
```

The application will be available at http://localhost:3000

## How to Play

1. Start with $500 in virtual cash
2. Browse available stocks in the market, organized by sectors
3. Click on stocks to view detailed price charts
4. Use the trading panel to buy and sell shares
5. Press "Advance Day" to progress the simulation
6. Respond to trade offers when they appear
7. Track your portfolio performance over time
8. Unlock achievements as you hit different milestones
9. View economic indicators to inform your trading decisions
10. Check weekly and monthly reports to evaluate your strategy

## Development Notes

- Windows PowerShell users should use semicolons (`;`) instead of ampersands (`&&`) when chaining commands:
  ```
  cd backend; python -m uvicorn main:app --reload
  cd frontend; npm start
  ```

## Project Structure

- **Frontend**: React application with interactive UI components
  - `src/components/`: React components for UI elements
  - `src/services/`: Service modules for game logic and API communication
  - `public/`: Static assets and resources
- **Backend**: Python FastAPI server with market simulation logic
  - `main.py`: API endpoints and server configuration
  - `market_simulation/`: Modules for market simulation and price movements
- **Data**: Configuration for stocks and market sectors
  - `data/stocks.json`: Stock definitions and properties
  - `data/sectors.json`: Sector relationships and influences

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Development Roadmap

- Phase 1: Core Market Simulation (Complete)
- Phase 2: Player Interface & Decision Systems (Complete)
- Phase 3: Progression & Replayability (Planned)
  - Computer traders with different strategies
  - Career mode with unlockable assets and tools
  - Historical market scenarios based on real events
  - Advanced analytics and prediction tools
