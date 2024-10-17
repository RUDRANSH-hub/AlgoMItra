// src/components/IntervalSelector.js

import React from 'react';

const IntervalSelector = ({ interval, setInterval }) => {
    return (
        <div className="interval-selector">
            <label htmlFor="interval">Select Interval: </label>
            <select
                id="interval"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
            >
                <option value="1">1 Minute</option>
                <option value="5">5 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="1440">1 Day</option>
            </select>
        </div>
    );
};

export default IntervalSelector;
