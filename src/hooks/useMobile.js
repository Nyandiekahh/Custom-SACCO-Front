import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../utils/constants';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      
      setIsMobile(width < BREAKPOINTS.md);
      setIsTablet(width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg);
      
      if (width < BREAKPOINTS.sm) {
        setScreenSize('mobile');
      } else if (width < BREAKPOINTS.md) {
        setScreenSize('tablet');
      } else if (width < BREAKPOINTS.lg) {
        setScreenSize('desktop');
      } else {
        setScreenSize('large');
      }
    };

    // Initial check
    checkDevice();

    // Add event listener
    window.addEventListener('resize', checkDevice);

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenSize,
    breakpoint: {
      xs: screenSize === 'mobile',
      sm: screenSize === 'tablet',
      md: screenSize === 'desktop',
      lg: screenSize === 'large'
    }
  };
};