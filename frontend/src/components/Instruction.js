// src/components/Instruction.js
import React from 'react';
import '../assets/css/style.css';
import instruction1 from '../assets/images/instruction-1.png';
import instruction2 from '../assets/images/instruction-2.png';
import instruction3 from '../assets/images/instruction-3.png';

const Instruction = () => {
  const steps = [
    {
      img: instruction1,
      subtitle: 'Step 1',
      title: 'Login and Search for Stock',
      text: 'Login to Algomitra and search for the stock you need to trade on. Explore various stocks and market data available.',
    },
    {
      img: instruction2,
      subtitle: 'Step 2',
      title: 'Choose Subscription or Strategy',
      text: 'Take a subscription for candle detection or choose a trading strategy from Algomitra’s offerings.',
    },
    {
      img: instruction3,
      subtitle: 'Step 3',
      title: 'Trade Smartly',
      text: 'With the right strategy or candle detection, execute your trades and monitor performance smartly.',
    },
  ];

  return (
    <section className="section instruction" aria-label="instruction" data-section>
      <div className="container">
        <h2 className="h2 section-title">How Algomitra Works</h2>
        {/* <p className="section-text">Follow these easy steps to start trading smartly on Algomitra.</p> */}
        <ul className="instruction-list">
          {steps.map((step, index) => (
            <li key={index}>
              <div className="instruction-card">
                <figure className="card-banner">
                  <img src={step.img} width="96" height="96" loading="lazy" alt={step.subtitle} className="img" />
                </figure>
                <p className="card-subtitle">{step.subtitle}</p>
                <h3 className="h3 card-title">{step.title}</h3>
                <p className="card-text">{step.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Instruction;
