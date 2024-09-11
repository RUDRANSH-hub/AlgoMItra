import React from 'react';
import heroBanner from '../assets/images/hero-banner.png'; // Ensure the image path is correct

const Hero = () => {

  return (
    
    <section className="section hero" aria-label="hero" data-section>
      <div className="container">
        <div className="hero-content">
          <h1 className="h1 hero-title">Buy & Sell Stocks In The AlgoMitra</h1>
          <p className="hero-text">
            AlgoMitra is the platform where you can check the trendency of candles and trade algo.
          </p>
          <a href="#" className="btn btn-primary">Get started now</a>
        </div>
        <figure className="hero-banner">
          <img src={heroBanner} width="570" height="448" alt="hero banner" className="w-100" />
        </figure>
      </div>
    </section>
  );
};

export default Hero;
