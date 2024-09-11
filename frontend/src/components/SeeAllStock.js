import React, { useEffect, useState } from 'react';
import '../assets/css/SeeAllStock.css';
// Helper function to check if the market is open
const isMarketOpen = () => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  start.setHours(9, 15, 0);
  end.setHours(15, 29, 0);

  return now >= start && now <= end;
};

const SeeAllStock = () => {
  const [allStocks, setAllStocks] = useState([]); // List of all stocks
  const [searchTerm, setSearchTerm] = useState(''); // User's search input
  const [selectedStock, setSelectedStock] = useState(null); // Currently selected stock
  const [stockDetails, setStockDetails] = useState({}); // Stock details

  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/stocks/');
        const data = await response.json();
        setAllStocks(data.stocks || []); // Set the list of stocks
      } catch (error) {
        console.error('Error fetching all stocks:', error);
      }
    };

    fetchAllStocks();
  }, []);

  // Fetch details of the selected stock
  const fetchStockDetails = async (symbol) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/stocks/${symbol}`);
      const data = await response.json();

      if (data && data.stat === 'Ok') {
        setStockDetails({
          intervalOpen: data.into || '-',
          intervalClose: data.intc || '-',
          intervalHigh: data.inth || '-',
          intervalLow: data.intl || '-',
          volume: data.vol || '-',
          priceChange: data.priceChange || '-',
        });
        setSelectedStock(symbol); // Set selected stock symbol
      }
    } catch (error) {
      console.error('Error fetching stock details:', error);
    }
  };

  // Handle search input change
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter stocks based on search term
  const filteredStocks = allStocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="see-all-stock-container">
      <div className="search-bar-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search for a stock..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="stock-list">
        <ul>
          {filteredStocks.map((stock) => (
            <li
              key={stock.symbol}
              onClick={() => fetchStockDetails(stock.symbol)}
              className={`stock-item ${selectedStock === stock.symbol ? 'selected' : ''}`}
            >
              {stock.name} ({stock.symbol})
            </li>
          ))}
        </ul>
      </div>

      {selectedStock && (
        <div className="stock-details">
          <h3>Stock Details: {selectedStock}</h3>
          <table className="stock-details-table">
            <thead>
              <tr>
                <th>Interval Open</th>
                <th>Interval Close</th>
                <th>Interval High</th>
                <th>Interval Low</th>
                <th>Volume</th>
                <th>Price Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{stockDetails.intervalOpen}</td>
                <td>{stockDetails.intervalClose}</td>
                <td>{stockDetails.intervalHigh}</td>
                <td>{stockDetails.intervalLow}</td>
                <td>{stockDetails.volume}</td>
                <td>{stockDetails.priceChange}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SeeAllStock;
