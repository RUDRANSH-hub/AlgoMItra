// src/components/About.js
// import React from 'react';
// import '../assets/css/style.css';
import aboutBanner from '../assets/images/about-banner.png';


import React, { useEffect, Suspense } from 'react';
import '../assets/css/style.css';
// import Trend from'./Trend' // Importing CSS
import CustomLoader from './CustomLoader';
// const Trend = React.lazy(() => import('./Trend'));

const About = () => {
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
    
    <section className="section about" aria-label="about" data-section>
      <div className="container">
        <figure className="about-banner">
          <img src={aboutBanner} width="748" height="436" loading="lazy" alt="about banner" className="w-100" />
        </figure>

        <div className="about-content">
          <h2 className="h2 section-title">What Is AlgoMitra</h2>
          <p className="section-text">
          At AlgoMitra, we provide advanced stock predictions using candlestick patterns, statistical analysis, and news sentiment evaluation. Our platform also features an algorithmic trading system with customizable, pre-built algorithms tailored to your trading strategies. Beyond trading, we offer a range of financial services, including loan assistance, expert ITR filing consulting, and comprehensive financial planning support. At AlgoMitra, we are committed to empowering your financial decisions with cutting-edge technology and professional expertise.
          </p>

          <ul className="section-list">
            <li className="section-item">
              <div className="title-wrapper">
                <ion-icon name="checkmark-circle" aria-hidden="true"></ion-icon>
                <h3 className="h3 list-title">View real-time Stocks prices</h3>
              </div>
              <p className="item-text">
              You can utilize a variety of charts detected by our platform in real-time, complete with trend analysis to assist in your stock buying and selling decisions
</p>
            </li>
            <li className="section-item">
              <div className="title-wrapper">
                <ion-icon name="checkmark-circle" aria-hidden="true"></ion-icon>
                <h3 className="h3 list-title">Buy and sell algorithmic(strategies based)</h3>
              </div>
              <p className="item-text">
                Experience a variety of trading strategies on Stock Market. You can use various types of Algo strategies like MOving Average for buy and sell stocks with new sentiment prediction. 
              </p>
            </li>
          </ul>

          <a href="#" className="btn btn-primary">Explore More</a>
        </div>
      </div>
    </section>



  </Suspense>

  );
};

export default About;



// const About = () => {
//   return (
//     <section className="section about" aria-label="about" data-section>
//       <div className="container">
//         <figure className="about-banner">
//           <img src={aboutBanner} width="748" height="436" loading="lazy" alt="about banner" className="w-100" />
//         </figure>

//         <div className="about-content">
//           <h2 className="h2 section-title">What Is AlgoMitra</h2>
//           <p className="section-text">
//           At AlgoMitra, we provide advanced stock predictions using candlestick patterns, statistical analysis, and news sentiment evaluation. Our platform also features an algorithmic trading system with customizable, pre-built algorithms tailored to your trading strategies. Beyond trading, we offer a range of financial services, including loan assistance, expert ITR filing consulting, and comprehensive financial planning support. At AlgoMitra, we are committed to empowering your financial decisions with cutting-edge technology and professional expertise.
//           </p>

//           <ul className="section-list">
//             <li className="section-item">
//               <div className="title-wrapper">
//                 <ion-icon name="checkmark-circle" aria-hidden="true"></ion-icon>
//                 <h3 className="h3 list-title">View real-time Stocks prices</h3>
//               </div>
//               <p className="item-text">
//               You can utilize a variety of charts detected by our platform in real-time, complete with trend analysis to assist in your stock buying and selling decisions
// </p>
//             </li>
//             <li className="section-item">
//               <div className="title-wrapper">
//                 <ion-icon name="checkmark-circle" aria-hidden="true"></ion-icon>
//                 <h3 className="h3 list-title">Buy and sell algorithmic(strategies based)</h3>
//               </div>
//               <p className="item-text">
//                 Experience a variety of trading strategies on Stock Market. You can use various types of Algo strategies like MOving Average for buy and sell stocks with new sentiment prediction. 
//               </p>
//             </li>
//           </ul>

//           <a href="#" className="btn btn-primary">Explore More</a>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default About;
