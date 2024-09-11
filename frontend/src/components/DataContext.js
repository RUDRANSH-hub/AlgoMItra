import React, { createContext, useState, useEffect } from 'react';

// Create a context
export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [trendData, setTrendData] = useState(() => {
      // Retrieve trend data from session storage if available, else an empty array
      const storedTrendData = sessionStorage.getItem('trendData');
      return storedTrendData ? JSON.parse(storedTrendData) : [];
    });
  
    const [marketData, setMarketData] = useState(() => {
      // Retrieve market data from session storage if available, else an empty array
      const storedMarketData = sessionStorage.getItem('marketData');
      return storedMarketData ? JSON.parse(storedMarketData) : [];
    });

  const [isMarketOpen, setIsMarketOpen] = useState(false);

  const fetchTrendData = async () => {
    // Fetch trend data logic
    const response = await fetch('http://127.0.0.1:8000/api/trend/');
    const data = await response.json();
    setTrendData(data);
    sessionStorage.setItem('trendData', JSON.stringify(data)); // Save data to session storage
  };

  const fetchMarketData = async () => {
    // Fetch market data logic
    const response = await fetch('http://127.0.0.1:8000/api/market/');
    const data = await response.json();
    setMarketData(data);
    sessionStorage.setItem('marketData', JSON.stringify(data)); // Save data to session storage
  };

  useEffect(() => {
    // Fetch fresh data if no data is available in sessionStorage
    if (Object.keys(trendData).length === 0) {
      fetchTrendData();
    }
    if (Object.keys(marketData).length === 0) {
      fetchMarketData();
    }

    const marketOpenCheck = () => {
      const currentTime = new Date();
      const startTime = new Date();
      const endTime = new Date();
      startTime.setHours(9, 15, 0);
      endTime.setHours(15, 29, 0);
      setIsMarketOpen(currentTime >= startTime && currentTime <= endTime);
    };

    // Check market open status on initial load
    marketOpenCheck();

    // Set intervals to update data every minute
    const trendInterval = setInterval(fetchTrendData, 60000); // 60 seconds
    const marketInterval = setInterval(fetchMarketData, 60000); // 60 seconds
    const marketOpenInterval = setInterval(marketOpenCheck, 10000); // Check every 10 seconds

    return () => {
      clearInterval(trendInterval);
      clearInterval(marketInterval);
      clearInterval(marketOpenInterval);
    };
  }, []);

  return (
    <DataContext.Provider value={{ trendData, marketData, isMarketOpen }}>
      {children}
    </DataContext.Provider>
  );
};
