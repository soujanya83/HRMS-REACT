// src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const DEFAULT_SIDEBAR_COLOR = '#1a4d4d';
const DEFAULT_BG_COLOR = '#F5F5F5';

export const ThemeProvider = ({ children }) => {
  const [sidebarColor, setSidebarColor] = useState(() => {
    const saved = localStorage.getItem('sidebarColor');
    return saved || DEFAULT_SIDEBAR_COLOR;
  });
  
  const [backgroundColor, setBackgroundColor] = useState(() => {
    const saved = localStorage.getItem('backgroundColor');
    return saved || DEFAULT_BG_COLOR;
  });

  // Force update function
  const forceUpdate = useCallback(() => {
    setSidebarColor(prev => {
      console.log("Force update - current color:", prev);
      return prev;
    });
  }, []);

  useEffect(() => {
    console.log("💾 Saving sidebar color to localStorage:", sidebarColor);
    localStorage.setItem('sidebarColor', sidebarColor);
    // Dispatch a custom event for other components to listen
    window.dispatchEvent(new CustomEvent('sidebarColorChange', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  useEffect(() => {
    console.log("💾 Saving background color to localStorage:", backgroundColor);
    localStorage.setItem('backgroundColor', backgroundColor);
    window.dispatchEvent(new CustomEvent('backgroundColorChange', { detail: { color: backgroundColor } }));
  }, [backgroundColor]);

  const updateSidebarColor = useCallback((color) => {
    console.log("🔄 Updating sidebar color to:", color);
    setSidebarColor(color);
  }, []);

  const updateBackgroundColor = useCallback((color) => {
    console.log("🔄 Updating background color to:", color);
    setBackgroundColor(color);
  }, []);

  return (
    <ThemeContext.Provider value={{
      sidebarColor,
      setSidebarColor: updateSidebarColor,
      backgroundColor,
      setBackgroundColor: updateBackgroundColor,
      forceUpdate
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};