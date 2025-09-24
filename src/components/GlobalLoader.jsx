import React from 'react';

const GlobalLoader = () => {
  return (
    // This creates a semi-transparent overlay that covers the whole screen
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
      {/* This is the blue spinning circle */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
    </div>
  );
};

export default GlobalLoader;