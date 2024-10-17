import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/SearchBarWithPopup.css'; // Import the CSS for styling

function SearchBarWithPopup({ setStockSymbol }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const popupRef = useRef(null);  // Ref for the popup modal

    // Fetch stocks from the API when the popup is opened
    useEffect(() => {
        if (isOpen) {
            fetchStocks();
        }

        // Close popup if clicked outside
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const fetchStocks = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/stocks/', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (data && data.stocks && Array.isArray(data.stocks)) {
                setStocks(data.stocks);
                setFilteredStocks(data.stocks);
            } else {
                console.error('Unexpected API response format:', data);
                setStocks([]);
                setFilteredStocks([]);
            }
        } catch (error) {
            console.error('Error fetching stocks:', error);
            setStocks([]);
            setFilteredStocks([]);
        }
    };

    const handleSearchInputChange = (event) => {
        const input = event.target.value.toLowerCase();
        setSearchTerm(input);

        const filtered = stocks.filter(stock =>
            stock.symbol.toLowerCase().includes(input) || stock.name.toLowerCase().includes(input)
        );
        setFilteredStocks(filtered);
    };

    const handleStockSelect = (symbol) => {
        setStockSymbol(symbol);  // Set the selected stock symbol
        setIsOpen(false);        // Close the popup after selection
        setSearchTerm('');       // Clear the search term after selection
    };

    return (
        <div className="search-bar-container">
            {/* Small Search input that expands on focus */}
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onFocus={() => setIsOpen(true)}  // Open the popup on focus
                placeholder="Enter stock symbol or name..."
                className="search-input"
            />

            {/* Popup for stock list */}
            {isOpen && (
                <div className="popup-modal" ref={popupRef}>
                    <div className="popup-content">
                        <div className="popup-header">
                            <span>Select a stock</span>
                            <button onClick={() => setIsOpen(false)} className="close-button">×</button>
                        </div>
                        <div className="popup-body">
                            {filteredStocks.length > 0 ? (
                                <ul className="stock-list">
                                    {filteredStocks.map(stock => (
                                        <li
                                            key={stock.symbol}
                                            onClick={() => handleStockSelect(stock.symbol)}
                                            className="stock-item"
                                        >
                                            <span className="stock-symbol">{stock.symbol}</span> - <span className="stock-name">{stock.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No stocks found</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchBarWithPopup;
