import React, { useEffect, Suspense } from 'react';
import '../assets/css/style.css'; // Importing CSS
import CustomLoader from './CustomLoader'; // Loader while lazy loading components

// Lazy loading non-critical components
const Hero = React.lazy(() => import('./Hero'));
const Trend = React.lazy(() => import('./Trend'));
const Market = React.lazy(() => import('./Market'));
const About = React.lazy(() => import('./About'));
const Instruction = React.lazy(() => import('./Instruction'));
const AppSection = React.lazy(() => import('./AppSection'));

const Home = () => {
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
    <div>
      {/* Use Suspense to show a loader while the components are being lazy-loaded */}
      <Suspense fallback={<CustomLoader />}>
        <main>
          <Hero />
          <Trend />
          <Market />
          <Instruction />
          <About />
          <AppSection />
        </main>
      </Suspense>
    </div>
  );
};

export default Home;
