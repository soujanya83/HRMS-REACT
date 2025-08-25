import React from "react";

const StatCard = ({ title, value, change, changeType }) => {
  const changeColor =
    changeType === "increase" ? "text-green-500" : "text-red-500";
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
  return (
    <div className="flex-1">
      <header className="p-6">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Welcome back, here is the information about your employees.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
        <StatCard
          title="Total Staff"
          value="125"
          change="+10.0%"
          changeType="increase"
        />
        <StatCard
          title="Onsite Staff"
          value="100"
          change="+8.0%"
          changeType="increase"
        />
        <StatCard
          title="Remote Staff"
          value="25"
          change="-1.5%"
          changeType="decrease"
        />
        <StatCard
          title="On Leave"
          value="5"
          change="+2.0%"
          changeType="increase"
        />
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg text-gray-800">
              Employee Performance
            </h3>
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
            <h3 className="font-bold text-lg text-gray-800">
              Gender Diversity
            </h3>
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
    </div>
  );
};

export default DashboardContent;
