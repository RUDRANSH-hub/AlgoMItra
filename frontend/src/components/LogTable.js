import React, { useEffect, useState } from 'react';

function LogTable({ candleData }) {
    const [logs, setLogs] = useState([]); // Store logs for candle type

    // Function to check the candle type and log the result
    const checkCandleType = async (candle) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/candle-check/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    open: candle.open,
                    close: candle.close,
                    high: candle.high,
                    low: candle.low,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const candleType = result.candle_type || 'Unknown'; // Default to "Unknown" if not returned
            const logMessage = `Candle Type: ${candleType}`;
            
            // Add the new log to the logs array
            setLogs((prevLogs) => [...prevLogs, { time: new Date(candle.time * 1000).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
                , message: logMessage }]);
        } catch (error) {
            console.error('Error checking candle type:', error);
            setLogs((prevLogs) => [...prevLogs, { time: new Date(candle.time * 1000).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
                , message: 'Error checking candle type' }]);
        }
    };

    // useEffect to check the candle type whenever new candle data is passed in
    useEffect(() => {
        if (candleData) {
            checkCandleType(candleData); // Check the candle type when new candle data arrives
        }
    }, [candleData]);

    return (
        <div className="log-table-container">
            <h2>Logs</h2>
            <table className="log-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.time}</td>
                            <td>{log.message}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LogTable;
