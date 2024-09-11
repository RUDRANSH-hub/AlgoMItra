// src/components/Footer.js
import React from 'react';
import '../assets/css/style.css';
import logo from '../assets/images/logo.svg';

const Footer = () => {
  const footerLinks = {
    Products: ['Spot', 'Inverse Perpetual', 'USDT Perpetual', 'Exchange', 'Launchpad', 'Binance Pay'],
    Services: ['Buy Crypto', 'Markets', 'Tranding Fee', 'Affiliate Program', 'Referral Program', 'API'],
    Support: ['Bybit Learn', 'Help Center', 'User Feedback', 'Submit a request', 'API Documentation', 'Trading Rules'],
    'About Us': ['About Bybit', 'Authenticity Check', 'Careers', 'Business Contacts', 'Blog'],
  };

  return (
    <footer className="footer">
      <div className="footer-top" data-section>
        <div className="container">
          <div className="footer-brand">
            <a href="#" className="logo">
              <img src={logo} width="50" height="50" alt="Cryptex logo" />
              Cryptex
            </a>

            <h2 className="footer-title">Let's talk! 🤙</h2>
            <a href="tel:+123456789101" className="footer-contact-link">+12 345 678 9101</a>
            <a href="mailto:hello.cryptex@gmail.com" className="footer-contact-link">hello.cryptex@gmail.com</a>
            <address className="footer-contact-link">Cecilia Chapman 711-2880 Nulla St. Mankato Mississippi 96522</address>
          </div>

          {Object.keys(footerLinks).map((section) => (
            <ul className="footer-list" key={section}>
              <li>
                <p className="footer-list-title">{section}</p>
              </li>
              {footerLinks[section].map((link) => (
                <li key={link}>
                  <a href="#" className="footer-link">{link}</a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p className="copyright">
            &copy; 2022 Cryptex All Rights Reserved by <a href="#" className="copyright-link">codewithsadee</a>
          </p>

          <ul className="social-list">
            {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
              <li key={social}>
                <a href="#" className="social-link">
                  <ion-icon name={`logo-${social}`}></ion-icon>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
