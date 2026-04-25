// src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

const DEFAULT_SIDEBAR_COLOR = '#1a4d4d';
const DEFAULT_BG_COLOR = '#F5F5F5';

export const ThemeProvider = ({ children }) => {
  // Load from localStorage with proper initialization
  const [sidebarColor, setSidebarColor] = useState(DEFAULT_SIDEBAR_COLOR);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BG_COLOR);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSidebar = localStorage.getItem('sidebarColor');
    const savedBackground = localStorage.getItem('backgroundColor');

    //console.log("📦 Loading from localStorage - Sidebar:", savedSidebar, "Background:", savedBackground);

    if (savedSidebar && savedSidebar !== 'undefined') {
      setSidebarColor(savedSidebar);
    }
    if (savedBackground && savedBackground !== 'undefined') {
      setBackgroundColor(savedBackground);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever colors change
  useEffect(() => {
    if (isLoaded && sidebarColor) {
      //console.log("💾 Saving sidebar color:", sidebarColor);
      localStorage.setItem('sidebarColor', sidebarColor);
      // Dispatch event for Sidebar component
      window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
    }
  }, [sidebarColor, isLoaded]);

  useEffect(() => {
    if (isLoaded && backgroundColor) {
      //console.log("💾 Saving background color:", backgroundColor);
      localStorage.setItem('backgroundColor', backgroundColor);
    }
  }, [backgroundColor, isLoaded]);

  const updateSidebarColor = (color) => {
    //console.log("🔄 Updating sidebar color to:", color);
    setSidebarColor(color);
  };

  const updateBackgroundColor = (color) => {
    // console.log("🔄 Updating background color to:", color);
    setBackgroundColor(color);
  };

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={{
      sidebarColor,
      setSidebarColor: updateSidebarColor,
      backgroundColor,
      setBackgroundColor: updateBackgroundColor,
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