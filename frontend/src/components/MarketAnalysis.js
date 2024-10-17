import React, { useEffect, Suspense } from 'react';
import '../assets/css/style.css';
import TradingViewChart from './TradingViewChart';

// import Trend from'./Trend' // Importing CSS
import CustomLoader from './CustomLoader';
// const Trend = React.lazy(() => import('./Trend'));

const MarketAnalysis = () => {
  useEffect(() => {
    // Dynamically loading the external JS script from the public folder
    const script = document.createElement('script');
    script.src = `${process.env.PUBLIC_URL}/assets/js/script.js`; // Corrected the quotes here
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Clean up the script when the component unmounts
    };
  }, []);
  return (
    <Suspense fallback={<CustomLoader />}>
    <main>
    <div>
      <h1>Stock Dashboard</h1>
      <TradingViewChart /> {/* Replace 'ZOMATO' with any stock symbol */}
    </div>
    </main>
  </Suspense>

  );
};

export default MarketAnalysis;
