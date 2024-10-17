import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.svg';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to toggle the mobile navbar
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close the navbar when a link is clicked
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Function to add sticky header behavior on scroll
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (window.scrollY > 50) {
        header.classList.add('active');
      } else {
        header.classList.remove('active');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isMenuOpen ? 'menu-open' : ''}`} data-header>
      <div className="container">
        <Link to="/Home" className="logo">
          <img src={logo} width="32" height="32" alt="AlgoMitra" />
          AlgoMitra
        </Link>

        <nav className={`navbar ${isMenuOpen ? 'active' : ''}`} data-navbar>
          <ul className="navbar-list">
            <li className="navbar-item">
              <Link to="/Home" className="navbar-link" data-nav-link onClick={handleLinkClick}>Homepage</Link>
            </li>
            <li className="navbar-item">
              <Link to="/market_analysis" className="navbar-link" data-nav-link onClick={handleLinkClick}>Market Analysis</Link> {/* Link to Market Analysis */}
            </li>
            {/* <li className="navbar-item">
              <Link to="/strategy" className="navbar-link" data-nav-link onClick={handleLinkClick}>Strategy</Link>
            </li> */}
            <li className="navbar-item">
              <Link to="/algorithmic-lab" className="navbar-link" data-nav-link onClick={handleLinkClick}>Algorithmic Lab</Link>
            </li>
            <li className="navbar-item">
              <Link to="/News" className="navbar-link" data-nav-link onClick={handleLinkClick}>News Analysis</Link>
            </li>
            <li className="navbar-item">
              <Link to="/about" className="navbar-link" data-nav-link onClick={handleLinkClick}>About</Link>
            </li>
          </ul>
        </nav>

        <button className="nav-toggle-btn" aria-label="Toggle menu" data-nav-toggler onClick={toggleMenu}>
          <span className="line line-1"></span>
          <span className="line line-2"></span>
          <span className="line line-3"></span>
        </button>

        <a href="#" className="btn btn-outline">Login</a>
      </div>
    </header>
  );
};

export default Header;
