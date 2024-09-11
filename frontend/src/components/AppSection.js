// src/components/AppSection.js
import React from 'react';
import '../assets/css/style.css';
import googlePlay from '../assets/images/googleplay.png';
import appStore from '../assets/images/appstore.png';
import appBanner from '../assets/images/app-banner.png';

const AppSection = () => {
  return (
    <section className="section app" aria-label="app" data-section>
      <div className="container">
        <div className="app-content">
          <h2 className="h2 section-title">Free Your Money & Invest With Confidence</h2>
          <p className="section-text">With Cryptex, you can be sure your trading skills are matched</p>

          <ul className="section-list">
            <li className="section-item">
              <div className="title-wrapper">
                <ion-icon name="checkmark-circle" aria-hidden="true"></ion-icon>
                <h3 className="h3 item-title">Buy, Sell, And Trade On The Go</h3>
              </div>
              <p className="item-text">Manage Your Holdings From Your Mobile Device</p>
            </li>
            <li className="section-item">
              <div className="title-wrapper">
                <ion-icon name="checkmark-circle" aria-hidden="true"></ion-icon>
                <h3 className="h3 item-title">Take Control Of Your Wealth</h3>
              </div>
              <p className="item-text">Rest Assured You (And Only You) Have Access To Your Funds</p>
            </li>
          </ul>

          <div className="app-wrapper">
            <a href="#">
              <img src={googlePlay} width="135" height="40" loading="lazy" alt="get it on google play" />
            </a>
            <a href="#">
              <img src={appStore} width="120" height="40" loading="lazy" alt="download on the app store" />
            </a>
          </div>
        </div>

        <div className="app-banner">
          <img src={appBanner} width="618" height="526" loading="lazy" alt="app banner" className="w-100" />
          <span className="span">Scan To Download</span>
        </div>
      </div>
    </section>
  );
};

export default AppSection;
