import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomLoader from './components/CustomLoader'; // Loading component
import './assets/css/style.css';  // Importing CSS

// Lazy loading components
const Home = lazy(() => import('./components/Home'));
const MarketAnalysis = lazy(() => import('./components/MarketAnalysis'));
const About = lazy(() => import('./components/About'));
const SeeAllStock = lazy(() => import('./components/SeeAllStock'));
const NotFound = lazy(() => import('./components/NotFound'));

const App = () => {
  useEffect(() => {
    // Dynamically loading the external JS script from public folder only once
    const script = document.createElement('script');
    script.src = `${process.env.PUBLIC_URL}/assets/js/script.js`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Clean up the script when the component unmounts
    };
  }, []);

  return (
    <Router>
      <Header />
      <Suspense fallback={<CustomLoader />}>
        <Routes>
          {/* Route for Homepage */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          {/* Route for Market Analysis */}
          <Route path="/market_analysis" element={<MarketAnalysis />} />

          {/* Other routes */}
          <Route path="/about" element={<About />} />
          <Route path="/SeeAllStock" element={<SeeAllStock />} />

          {/* Fallback Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </Router>
  );
};

export default App;
