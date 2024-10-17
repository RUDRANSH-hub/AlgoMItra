import React, { useEffect, useState } from 'react';
import '../assets/css/style.css'; // Assuming your original CSS is applied here
import stock1 from '../assets/images/zomato.svg';
import stock2 from '../assets/images/hdfc.svg';
import stock3 from '../assets/images/infosys.svg';
import stock4 from '../assets/images/bajaj.svg'; // Stock logos
import '../assets/css/loader.css'; // Loader CSS for spinner

const Trend = () => {
  const trendTabs = ['Top Stocks'];

  // Array of stock symbols and details
  const trendStocks = [
    { name: 'Zomato', symbol: 'ZOMATO', imgSrc: stock1, altText: 'Zomato Logo' },
    { name: 'HDFC Bank', symbol: 'HDFCBANK', imgSrc: stock2, altText: 'HDFC Bank Logo' },
    { name: 'Infosys', symbol: 'INFY', imgSrc: stock3, altText: 'Infosys Logo' },
    { name: 'Bajaj Finance', symbol: 'BAJFINANCE', imgSrc: stock4, altText: 'Bajaj Finance Logo' }
  ];

  const [stockData, setStockData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Track initial loading

  // Function to check if the market is open
  const isMarketOpen = () => {
    const currentTime = new Date();
    const startTime = new Date();
    startTime.setHours(9, 15, 0);
    const endTime = new Date();
    endTime.setHours(15, 29, 0);
    return currentTime >= startTime && currentTime <= endTime;
  };

  // Fetch stock data with caching
  const fetchStockData = async (symbol) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/stocks/${symbol}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  };

  // Fetch all stock data and update the state
  const fetchAllStockData = async () => {
    setIsLoading(true);
    const dataPromises = trendStocks.map(stock => fetchStockData(stock.symbol));
    const fetchedData = await Promise.all(dataPromises);

    const stockDataMap = trendStocks.reduce((acc, stock, index) => {
      acc[stock.symbol] = fetchedData[index] || {};
      return acc;
    }, {});

    setStockData(stockDataMap);
    setIsLoading(false);
    setInitialLoad(false); // Mark that the initial load is complete
  };

  useEffect(() => {
    // Fetch fresh stock data if the market is open
    fetchAllStockData();

    // Fetch fresh data every 6 seconds if the market is open
    if (isMarketOpen()) {
      const intervalId = setInterval(() => {
        fetchAllStockData();
      }, 6000); // 6 seconds

      // Cleanup the interval on unmount
      return () => clearInterval(intervalId);
    }
  }, []);

  return (
    <section className="section trend" aria-label="top stocks trend" data-section>
      <div className="container">
        <div className="trend-tab">
          <ul className="tab-nav">
            {trendTabs.map((tab) => (
              <li key={tab}>
                <button className="tab-btn active">{tab}</button>
              </li>
            ))}
          </ul>

          <ul className="tab-content">
            {trendStocks.map((stock, index) => (
              <li key={index} className="trend-card-container">
                <div className="trend-card">
                  <div className="card-title-wrapper">
                    <img src={stock.imgSrc} width="32" height="32" alt={stock.altText} />
                    <a href="#" className="card-title">
                      {stock.name} <span className="span">{stock.symbol}</span>
                    </a>
                  </div>

                  {/* Loader or stock value */}
                  {initialLoad ? (
                    <div className="spinner-container">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <div className="card-content">
                      <data className="card-value" value={stockData[stock.symbol]?.into || '-'}>
                        INR {stockData[stock.symbol]?.into || '-'}
                      </data>

                      <div className="card-analytics">
                        <data className="current-price" value={stockData[stock.symbol]?.intc || '-'}>
                          {stockData[stock.symbol]?.intc || '-'}
                        </data>
                        <div className={`badge ${stockData[stock.symbol]?.intc < stockData[stock.symbol]?.into ? 'red' : 'green'}`}>
                          {((stockData[stock.symbol]?.intc - stockData[stock.symbol]?.into) / stockData[stock.symbol]?.into * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Trend;
