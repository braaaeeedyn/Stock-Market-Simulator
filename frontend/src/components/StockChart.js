import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './StockChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function StockChart({ stockSymbol, currentDay }) {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/market/stock/${stockSymbol}/history`);
      setStockData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when stock symbol changes
  useEffect(() => {
    if (stockSymbol) {
      fetchStockData();
    }
  }, [stockSymbol]);

  // Refresh data when the day advances
  useEffect(() => {
    if (stockSymbol && currentDay > 0) {
      fetchStockData();
    }
  }, [currentDay, stockSymbol]);

  if (loading) return <div className="stock-chart-loading">Loading stock data...</div>;
  if (error) return <div className="stock-chart-error">{error}</div>;
  if (!stockData) return <div className="stock-chart-placeholder">Select a stock to view its chart</div>;

  const chartData = {
    labels: stockData.day_range ? stockData.day_range.map(day => `Day ${day}`) : [],
    datasets: [
      {
        label: stockSymbol,
        data: stockData.history || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${stockSymbol} Price History`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="stock-chart">
      <h3>{stockSymbol} Price Chart</h3>
      <div className="chart-container">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}

export default StockChart; 