import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import SearchBarWithPopup from './SearchBarWithPopup';
import LogTable from './LogTable';
import "../assets/css/TradingViewChart.css";

function TradingViewChart() {
    // Refs for chart container and chart instances
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);

    // State variables
    const [stockSymbol, setStockSymbol] = useState('TCS');
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [companyName, setCompanyName] = useState('Tata Consultancy Services');
    const [interval, setIntervalValue] = useState(1); // Default interval: 1 minute
    const [combinedData, setCombinedData] = useState([]);
    const [dataFetched, setDataFetched] = useState(false); // Tracks successful data fetch

    // Log addition function
    const addLog = useCallback((logMessage) => {
        setLogs((prevLogs) => [
            ...prevLogs,
            { time: new Date().toLocaleTimeString('en-IN'), message: logMessage }
        ]);
    }, []);

    // Function to perform a fetch request with retry logic
    const fetchWithRetry = useCallback(async (url, options) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();  // Automatically parses response into JSON
        } catch (error) {
            console.error(`Fetch error for URL ${url}:`, error);
            addLog(`Fetch error for ${url}: ${error.message}`);
            throw error;
        }
    }, [addLog]);

    // Function to parse date-time string into UNIX timestamp
    const parseDateTime = useCallback((dateTimeStr) => {
        const [datePart, timePart] = dateTimeStr.split(' ');
        const [day, month, year] = datePart.split('-');
        const formattedDate = `${year}-${month}-${day}T${timePart}Z`;
        return Math.floor(new Date(formattedDate).getTime() / 1000);
    }, []);

    // Fetch historical data
    const fetchHistoricalData = useCallback(async (stockSymbol, interval) => {
        const apiUrl = `http://127.0.0.1:8000/api/historical/${stockSymbol}/`;
        const data = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interval }),
        });
        return data.map(item => ({
            time: parseDateTime(item.time),
            open: parseFloat(item.into),
            high: parseFloat(item.inth),
            low: parseFloat(item.intl),
            close: parseFloat(item.intc),
        })).sort((a, b) => a.time - b.time);
    }, [fetchWithRetry, parseDateTime]);

    // Fetch today's data
    const fetchTodaysData = useCallback(async (stockSymbol, interval) => {
        const apiUrl = `http://127.0.0.1:8000/api/dayStockData/${stockSymbol}/`;
        const data = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interval }),
        });
        return data.map(item => ({
            time: parseDateTime(item.time),
            open: parseFloat(item.into),
            high: parseFloat(item.inth),
            low: parseFloat(item.intl),
            close: parseFloat(item.intc),
        })).sort((a, b) => a.time - b.time);
    }, [fetchWithRetry, parseDateTime]);

    // Fetch both historical and today's data in parallel using Promise.all
    const fetchCombinedData = useCallback(async (stockSymbol, interval) => {
        try {
            const [historicalData, todaysData] = await Promise.all([
                fetchHistoricalData(stockSymbol, interval),
                fetchTodaysData(stockSymbol, interval)
            ]);
            const fetchedCompanyName = "Fetched Company Name"; // Replace with actual company name if available

            const combinedData = [...historicalData, ...todaysData]
                .filter((item, index, arr) => index === arr.findIndex(t => t.time === item.time)) // Unique timestamps
                .sort((a, b) => a.time - b.time);

            return [combinedData, fetchedCompanyName];
        } catch (error) {
            console.error('Error fetching combined data:', error);
            addLog('Error fetching combined data.');
            return [[], ''];
        }
    }, [fetchHistoricalData, fetchTodaysData, addLog]);

    // Initialize chart
    const initializeChart = useCallback(() => {
        if (!chartContainerRef.current) {
            console.warn("Chart container is not available yet.");
            return;
        }

        // Remove existing chart if it exists before creating a new one
        if (chartRef.current) {
            chartRef.current.remove(); // Safely remove any existing chart
            chartRef.current = null;   // Clear reference to avoid memory leaks
        }

        // Create a new chart
        chartRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth || 800,
            height: 600,
            layout: {
                backgroundColor: '#1e1e1e',
                textColor: '#ffffff',
            },
            grid: {
                vertLines: { color: '#3a3a3a' },
                horzLines: { color: '#3a3a3a' },
            },
            priceScale: { borderColor: '#555' },
            timeScale: {
                borderColor: '#555',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Add candlestick series
        candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#4caf50',
            downColor: '#f44336',
            borderVisible: true,
            wickUpColor: '#4caf50',
            wickDownColor: '#f44336',
        });

        // Populate chart with data if available
        if (combinedData.length > 0) {
            candlestickSeriesRef.current.setData(combinedData);
        }

        // Handle chart resize
        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup on unmount or re-initialization
        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null; // Make sure reference is cleared on removal
            }
        };
    }, [combinedData]);

    // Append live data to the chart
    const appendLiveData = useCallback((newData) => {
        if (candlestickSeriesRef.current && newData.length > 0) {
            const latestCandle = newData[newData.length - 1];
            candlestickSeriesRef.current.update({
                time: latestCandle.time,
                open: latestCandle.open,
                high: latestCandle.high,
                low: latestCandle.low,
                close: latestCandle.close
            });
            addLog(`New candle data received: ${JSON.stringify(latestCandle)}`);
        }
    }, [addLog]);

    // Fetch stock data
    const fetchStockData = useCallback(async (symbol) => {
        setLoading(true);
        const [data, fetchedCompanyName] = await fetchCombinedData(symbol, interval);
        if (data.length > 0) {
            setCombinedData(data);
            setCompanyName(fetchedCompanyName);
            addLog(`Fetched stock data for ${symbol} with ${interval}-minute interval`);
            setDataFetched(true);
        } else {
            console.error(`No data available for ${symbol}.`);
            addLog(`No data available for ${symbol}`);
            setDataFetched(false);
        }
        setLoading(false);
    }, [interval, fetchCombinedData, addLog]);

    // useEffect to fetch stock data whenever the stock symbol or interval changes
    useEffect(() => {
        fetchStockData(stockSymbol);
    }, [stockSymbol, interval, fetchStockData]);

    // useEffect to initialize the chart after data has been fetched
    useEffect(() => {
        if (dataFetched && combinedData.length > 0) {
            const cleanup = initializeChart(); // Only initialize the chart when data is fetched
            return () => {
                if (cleanup) cleanup();
            };
        }
    }, [dataFetched, combinedData, initializeChart]);

    // useEffect to set up interval for fetching live data
    useEffect(() => {
        if (!dataFetched) return;
    
        const intervalDuration = interval * 60000;
        const intervalId = setInterval(async () => {
            try {
                const liveData = await fetchTodaysData(stockSymbol, interval); // Fetch live data
                if (liveData.length > 0) {
                    appendLiveData(liveData);
                }
            } catch (error) {
                console.error('Error fetching live data:', error);
                addLog('Error fetching live data.');
            }
        }, intervalDuration);
    
        return () => clearInterval(intervalId); // Clear the interval when the component unmounts or the interval changes
    }, [stockSymbol, interval, appendLiveData, dataFetched, fetchTodaysData, addLog]);

    // Handle interval change
    const handleIntervalChange = useCallback((e) => {
        const newInterval = parseInt(e.target.value, 10);
        setIntervalValue(newInterval);
    
        // Add a small delay to avoid frequent updates
        setTimeout(() => {
            fetchStockData(stockSymbol);
        }, 300);
    }, [fetchStockData, stockSymbol]);

    return (
        <div className="trading-view-container">
            <div className="chart-section">
                <SearchBarWithPopup setStockSymbol={setStockSymbol} />

                <div className="stock-info">
                    <h1>{stockSymbol}</h1>
                    <h3>{companyName}</h3>
                </div>

                <div className="interval-selector">
                    <label htmlFor="interval">Select Interval: </label>
                    <select id="interval" value={interval} onChange={handleIntervalChange}>
                        <option value={1}>1 Minute</option>
                        <option value={5}>5 Minutes</option>
                        <option value={10}>10 Minutes</option>
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={60}>1 Hour</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loader-container">
                        <div className="loader"></div>
                        <p>Loading data...</p>
                    </div>
                ) : dataFetched ? (
                    <div className="chart-container" ref={chartContainerRef} style={{ height: '600px', width: '100%', position: 'relative' }} />
                ) : (
                    <div className="no-data-container">
                        <p>No data available for {stockSymbol}. Please try a different symbol.</p>
                    </div>
                )}
            </div>

            <div className="log-section">
                <LogTable logs={logs} />
            </div>
        </div>
    );
}

export default TradingViewChart;
