import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useOrganizations } from '../contexts/OrganizationContext';

// Color palette component
const ColorPalette = ({ isOpen, onClose, onColorSelect }) => {
const PASTEL_COLORS = [
  { name: 'Soft Pink', value: '#FFD1DC', textColor: 'text-gray-800' },
  { name: 'Mint Green', value: '#C1E1C1', textColor: 'text-gray-800' },
  { name: 'Peach', value: '#FFDAB9', textColor: 'text-gray-800' },
  { name: 'Baby Blue', value: '#B5D8FF', textColor: 'text-gray-800' },
  { name: 'Soft Yellow', value: '#FFFACD', textColor: 'text-gray-800' },
  { name: 'Cultured White', value: '#FCFCFC', textColor: 'text-gray-800' },
  { name: 'Soft White', value: '#FDFDFE', textColor: 'text-gray-800' },
];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 transition-opacity z-40"
        onClick={onClose}
      />
      
      {/* Side panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Choose Pastel Color</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            {pastelColors.map((color, index) => (
              <button
                key={index}
                onClick={() => {
                  onColorSelect(color.value);
                  onClose();
                }}
                className="w-full p-4 rounded-lg transition-transform hover:scale-105 flex items-center justify-between"
                style={{ backgroundColor: color.value }}
              >
                <span className={`font-medium ${color.textColor}`}>{color.name}</span>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ backgroundColor: color.value }} />
              </button>
            ))}
          </div>
          
          {/* Reset to default button */}
          <button
            onClick={() => {
              onColorSelect('#f9fafb'); // Default bg-gray-50
              onClose();
            }}
            className="w-full mt-6 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ title, value, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-gray-500 font-medium">{title}</h4>
            <div className="flex items-baseline space-x-2 mt-2">
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>
            </div>
        </div>
    );
};

const DashboardContent = () => {
    const { selectedOrganization } = useOrganizations();
    const [dashboardData, setDashboardData] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
    
    // Get background color and setter from outlet context
    const { backgroundColor, setBackgroundColor } = useOutletContext();

    useEffect(() => {
        if (selectedOrganization) {
          setIsLoading(true);
          console.log(`Fetching new dashboard data for: ${selectedOrganization.name} (ID: ${selectedOrganization.id})`);
          
          setTimeout(() => {
            setDashboardData({
                totalStaff: Math.floor(Math.random() * 200) + 50,
                onsiteStaff: Math.floor(Math.random() * 150) + 50,
            });
            setIsLoading(false);
          }, 500);
        }
    }, [selectedOrganization]); 

    const handleColorSelect = (colorValue) => {
        setBackgroundColor(colorValue);
    };

    return (
        <>
            {/* Color Palette Toggle Button */}
            <button
                onClick={() => setIsColorPaletteOpen(true)}
                className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-400 to-pink-400 text-white p-3 rounded-l-lg shadow-lg hover:shadow-xl transition-all z-30 group"
                style={{ writingMode: 'vertical-rl' }}
            >
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="text-sm font-medium">Colors</span>
                </div>
            </button>

            {/* Color Palette Component */}
            <ColorPalette 
                isOpen={isColorPaletteOpen}
                onClose={() => setIsColorPaletteOpen(false)}
                onColorSelect={handleColorSelect}
            />

            {/* Main Content - Cards remain white, only background changes */}
            <div>
                <header className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Dashboard
                    </h2>
                    {selectedOrganization ? (
                        <p className="text-gray-500 mt-1">
                            Showing data for: <span className="font-semibold text-brand-blue">{selectedOrganization.name}</span>
                        </p>
                    ) : (
                        <p className="text-gray-500 mt-1">Please select an organization.</p>
                    )}
                </header>

                {isLoading ? (
                    <div>Loading dashboard data...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <StatCard title="Total Staff" value={dashboardData?.totalStaff || 0} change="+10.0%" changeType="increase" />
                            <StatCard title="Onsite Staff" value={dashboardData?.onsiteStaff || 0} change="+8.0%" changeType="increase" />
                            <StatCard title="Remote Staff" value="25" change="-1.5%" changeType="decrease" />
                            <StatCard title="On Leave" value="5" change="+2.0%" changeType="increase" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="font-bold text-lg text-gray-800">Employee Performance</h3>
                                    <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <p className="text-gray-500">Performance Chart Area</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="font-bold text-lg text-gray-800">Employee List</h3>
                                    <div className="mt-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <p className="text-gray-500">Employee Table Area</p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="font-bold text-lg text-gray-800">Gender Diversity</h3>
                                    <div className="mt-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <p className="text-gray-500">Gender Diversity Chart</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="font-bold text-lg text-gray-800">Employment Type</h3>
                                    <div className="mt-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <p className="text-gray-500">Employment Type Chart</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default DashboardContent;