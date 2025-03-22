import React, { useEffect, useState } from 'react';

import Navbar from './LandingPage/Navbar';
import Hero from './LandingPage/Hero';
import Features from './LandingPage/Features';
import Glow from './LandingPage/Glow';
import Feedbacks from './LandingPage/Feedbacks';
import Pricing from './LandingPage/Pricing';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "#0B1011";
    document.body.style.color = "#ffffff";
    
    const preloadImages = [
      '/chess_background.png',
      '/Group 72 (1).png',
      '/check.png'
    ];
    
    let loadedCount = 0;
    
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === preloadImages.length) {
          setTimeout(() => setIsLoaded(true), 100);
        }
      };
      img.onerror = () => {
        loadedCount++;
        console.log(`Failed to preload image: ${src}`);
        if (loadedCount === preloadImages.length) {
          setTimeout(() => setIsLoaded(true), 100);
        }
      };
    });
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    
    document.documentElement.classList.add('landing-page-html');
    
    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove('landing-page-html');
    };
  }, []);

  if (!isLoaded) {
    return (
      <div style={{ 
        backgroundColor: "#0B1011", 
        color: "#ffffff", 
        height: "100vh", 
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem"
      }}>
        <div>Loading Smart QnA...</div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <div className="relative">
        <Navbar />
        <Hero />
      </div>

      <Features />

      <Glow />

      <Feedbacks />

      <Glow />

      <Pricing />
    </div>
  );
};

export default LandingPage;