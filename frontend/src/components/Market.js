import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/blink.css';

// Helper function to check if the market is open (9:15 AM - 3:29 PM)
const isMarketOpen = () => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  start.setHours(9, 15, 0);
  end.setHours(15, 29, 0);

  return now >= start && now <= end;
};

// Shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Main Market component
const Market = () => {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTime, setFetchTime] = useState('');
  const [blinkClass, setBlinkClass] = useState('');
  const [marketClosed, setMarketClosed] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      const currentTime = new Date();
      setFetchTime(currentTime.toLocaleTimeString());

      // Trigger blink animation
      setBlinkClass('blink');
      setTimeout(() => setBlinkClass(''), 1000); // Remove the blink class after 1 second

      const storedStocks = sessionStorage.getItem('selectedStocks');
      if (storedStocks) {
        setStocks(JSON.parse(storedStocks));
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/stocks/');
        const data = await response.json();

        if (data && data.stocks) {
          const stocksArray = Array.isArray(data.stocks) ? data.stocks : Object.values(data.stocks);
          const shuffledStocks = shuffleArray(stocksArray).slice(0, 5); // Select 5 random stocks
          setStocks(shuffledStocks);
          sessionStorage.setItem('selectedStocks', JSON.stringify(shuffledStocks)); // Cache selected stocks
        } else {
          console.error('Expected an array but got:', data);
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();

    if (isMarketOpen()) {
      setMarketClosed(false);
      const intervalId = setInterval(fetchStocks, 5000); // Refresh every 5 seconds

      return () => clearInterval(intervalId); // Clear interval on component unmount
    } else {
      setMarketClosed(true); // Indicate that the market is closed
    }
  }, []);

  return (
    <section className="section market" aria-label="market update" data-section>
      <div className="container">
        <div className="title-wrapper">
          <h2 className="h2 section-title">
            Market Update {marketClosed && "(Closed)"}
            <span className={`time-wrapper ${blinkClass}`}>{fetchTime}</span> {/* Time with blinking effect */}
          </h2>
          <Link to="/SeeAllStock" className="btn-link">See All Stocks</Link>
        </div>

        {isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : (
          <table className="market-table">
            <thead className="table-head">
              <tr className="table-row table-title">
                <th className="table-heading">#</th>
                <th className="table-heading">Company Name</th>
                <th className="table-heading">Symbol</th>
                <th className="table-heading">Interval Open</th>
                <th className="table-heading">Interval Close</th>
                <th className="table-heading">Interval High</th>
                <th className="table-heading">Interval Low</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {stocks.map((stock, index) => (
                <StockRow key={index} stock={stock} index={index + 1} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

// StockRow component to display each stock's information and update only the values
const StockRow = ({ stock, index }) => {
  const [stockData, setStockData] = useState({
    intervalOpen: '-',
    intervalClose: '-',
    intervalHigh: '-',
    intervalLow: '-'
  });

  const [loading, setLoading] = useState(true);

  const fetchStockDetails = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/stocks/${stock.symbol}`);
      const data = await response.json();

      if (data && data.stat === 'Ok') {
        setStockData({
          intervalOpen: data.into || '-',
          intervalClose: data.intc || '-',
          intervalHigh: data.inth || '-',
          intervalLow: data.intl || '-'
        });
      } else {
        console.error('Error in API response:', data);
      }
    } catch (error) {
      console.error('Error fetching stock details:', error);
    } finally {
      setLoading(false); // Stop loading after fetching
    }
  };

  useEffect(() => {
    fetchStockDetails();

    if (isMarketOpen()) {
      const intervalId = setInterval(fetchStockDetails, 60000); // Update every minute

      return () => clearInterval(intervalId); // Cleanup the interval on unmount
    }
  }, [stock.symbol]);

  return (
    <tr className="table-row">
      <td className="table-data">{index}</td>
      <td className="table-data">{stock.name}</td>
      <td className="table-data">{stock.symbol}</td>
      <td className="table-data">
        {loading ? <LoadingDots /> : `₹${stockData.intervalOpen}`}
      </td>
      <td className="table-data">
        {loading ? <LoadingDots /> : `₹${stockData.intervalClose}`}
      </td>
      <td className="table-data">
        {loading ? <LoadingDots /> : `₹${stockData.intervalHigh}`}
      </td>
      <td className="table-data">
        {loading ? <LoadingDots /> : `₹${stockData.intervalLow}`}
      </td>
    </tr>
  );
};

// LoadingDots component for blinking dots during loading
const LoadingDots = () => (
  <div className="loading-dots">
    <span className="dot dot1"></span>
    <span className="dot dot2"></span>
    <span className="dot dot3"></span>
  </div>
);

export default Market;
