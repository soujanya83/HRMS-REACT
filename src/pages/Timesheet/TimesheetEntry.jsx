import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaCalculator,
  FaPaperPlane,
  FaSearch,
  FaFilter,
  FaUser,
  FaCalendar,
  FaFileAlt,
  FaCheckCircle,
  FaSyncAlt,
  FaUsers,
  FaSync
} from 'react-icons/fa';
import { useOrganizations } from '../../contexts/OrganizationContext';
import { timesheetService } from '../../services/timesheetService';

const TimesheetEntry = () => {
  const { selectedOrganization } = useOrganizations();
  const [timesheetEntries, setTimesheetEntries] = useState([]);
  const [payPeriods, setPayPeriods] = useState([]);
  const [allTimesheets, setAllTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTimesheetIds, setSelectedTimesheetIds] = useState([]);
  
  // New state for generate timesheet modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [fortnightlyPeriods, setFortnightlyPeriods] = useState([]);
  const [selectedFortnightlyPeriod, setSelectedFortnightlyPeriod] = useState(null);
  const [generatingTimesheet, setGeneratingTimesheet] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchAllData();
    }
  }, [selectedOrganization]);

  // Fetch all required data from API
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPayPeriods(),
        fetchAllOrganizationTimesheets()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pay periods from API - Only get fortnightly periods
  const fetchPayPeriods = async () => {
    if (!selectedOrganization?.id) return;
    
    try {
      const response = await timesheetService.getPayPeriods(selectedOrganization.id);
      if (response?.status && Array.isArray(response.data)) {
        // Filter only FORTNIGHTLY pay periods
        const fortnightlyPeriods = response.data.filter(period => 
          period.calendar_type === 'FORTNIGHTLY'
        );
        setPayPeriods(fortnightlyPeriods);
        
        // Find current fortnightly pay period
        const currentPayPeriod = fortnightlyPeriods.find(period => period.is_current === true);
        if (currentPayPeriod) {
          setSelectedPayPeriod(currentPayPeriod);
          // Set selected date to start of current pay period
          if (currentPayPeriod.start_date) {
            setSelectedDate(currentPayPeriod.start_date.split('T')[0]);
          }
        } else if (fortnightlyPeriods.length > 0) {
          // If no current period, select the first one
          setSelectedPayPeriod(fortnightlyPeriods[0]);
          if (fortnightlyPeriods[0].start_date) {
            setSelectedDate(fortnightlyPeriods[0].start_date.split('T')[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching pay periods:', error);
    }
  };

  // Fetch all timesheets for organization from API
  const fetchAllOrganizationTimesheets = async () => {
    if (!selectedOrganization?.id) return;
    
    try {
      const response = await timesheetService.getTimesheets(selectedOrganization.id);
      if (response?.status && Array.isArray(response.data)) {
        setAllTimesheets(response.data);
        
        // Convert API timesheets to entries format for display
        const entries = convertTimesheetsToEntries(response.data);
        setTimesheetEntries(entries);
      }
    } catch (error) {
      console.error('Error fetching organization timesheets:', error);
    }
  };

  // Convert API timesheets data to entries format
  const convertTimesheetsToEntries = (timesheets) => {
    if (!Array.isArray(timesheets)) return [];
    
    return timesheets.flatMap(timesheet => {
      const entries = [];
      const employeeName = `${timesheet.employee?.first_name || ''} ${timesheet.employee?.last_name || ''}`.trim();
      
      // If there's daily breakdown data, create entries for each day
      if (timesheet.daily_breakdown && typeof timesheet.daily_breakdown === 'object') {
        Object.entries(timesheet.daily_breakdown).forEach(([date, hours]) => {
          const hoursNum = parseFloat(hours);
          if (!isNaN(hoursNum) && hoursNum > 0) {
            entries.push({
              id: `timesheet-${timesheet.id}-${date}`,
              timesheet_id: timesheet.id,
              project: timesheet.project_name || 'General Work',
              project_code: timesheet.project_id ? `PROJ-${timesheet.project_id}` : 'GEN',
              task: timesheet.task_description || 'Regular Work',
              date: date,
              hours: hoursNum,
              description: `Timesheet for ${employeeName}`,
              billable: true,
              status: timesheet.status || 'pending',
              employee: timesheet.employee,
              timesheetData: timesheet
            });
          }
        });
      } else if (timesheet.regular_hours) {
        const hoursNum = parseFloat(timesheet.regular_hours);
        if (!isNaN(hoursNum) && hoursNum > 0) {
          // If no daily breakdown, create a single entry
          entries.push({
            id: `timesheet-${timesheet.id}`,
            timesheet_id: timesheet.id,
            project: timesheet.project_name || 'General Work',
            project_code: timesheet.project_id ? `PROJ-${timesheet.project_id}` : 'GEN',
            task: timesheet.task_description || 'Regular Work',
            date: timesheet.from_date || new Date().toISOString().split('T')[0],
            hours: hoursNum,
            description: `Timesheet for ${employeeName} (${timesheet.from_date || ''} to ${timesheet.to_date || ''})`,
            billable: true,
            status: timesheet.status || 'pending',
            employee: timesheet.employee,
            timesheetData: timesheet
          });
        }
      }
      
      return entries;
    });
  };

  // Calculate stats from entries - Only for pending/draft timesheets
  const calculateStats = (entries) => {
    if (!Array.isArray(entries)) {
      return {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        entriesCount: 0
      };
    }
    
    const pendingEntries = entries.filter(entry => 
      entry.status === 'pending' || entry.status === 'draft'
    );
    
    const totalHours = pendingEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
    const billableHours = pendingEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + (entry.hours || 0), 0);
    
    return {
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      entriesCount: pendingEntries.length
    };
  };

  // Get stats for selected date - Only for pending/draft timesheets
  const stats = calculateStats(
    timesheetEntries.filter(entry => entry.date === selectedDate)
  );

  const handleSubmitTimesheet = async () => {
    if (selectedTimesheetIds.length === 0) {
      alert('Please select timesheets to submit');
      return;
    }

    if (window.confirm(`Submit ${selectedTimesheetIds.length} timesheet(s) for approval?`)) {
      setApiLoading(true);
      try {
        const response = await timesheetService.submitTimesheets(selectedTimesheetIds);
        
        if (response.status) {
          alert('Timesheets submitted successfully for approval!');
          // Refresh data
          fetchAllOrganizationTimesheets();
          setSelectedTimesheetIds([]);
        } else {
          alert(response.message || 'Failed to submit timesheets');
        }
      } catch (error) {
        console.error('Error submitting timesheet:', error);
        alert('Failed to submit timesheet. Please try again.');
      } finally {
        setApiLoading(false);
      }
    }
  };

  // Open generate timesheet modal
  const handleOpenGenerateModal = async () => {
    if (!selectedOrganization?.id) {
      alert('Please select an organization first');
      return;
    }

    try {
      // Fetch pay periods again to get latest data
      const response = await timesheetService.getPayPeriods(selectedOrganization.id);
      if (response?.status && Array.isArray(response.data)) {
        // Filter only fortnightly periods
        const fortnightly = response.data.filter(p => p.calendar_type === 'FORTNIGHTLY');
        setFortnightlyPeriods(fortnightly);
        
        if (fortnightly.length > 0) {
          // Select the current fortnightly period if available
          const currentFortnightly = fortnightly.find(p => p.is_current === true);
          setSelectedFortnightlyPeriod(currentFortnightly || fortnightly[0]);
        }
        
        setShowGenerateModal(true);
      }
    } catch (error) {
      console.error('Error fetching pay periods for modal:', error);
      alert('Failed to load pay periods. Please try again.');
    }
  };

  // Generate timesheets for selected fortnightly period
  const handleGenerateTimesheets = async () => {
    if (!selectedFortnightlyPeriod) {
      alert('Please select a fortnightly period');
      return;
    }

    if (!window.confirm(`Generate timesheets for period: ${formatDate(selectedFortnightlyPeriod.start_date)} to ${formatDate(selectedFortnightlyPeriod.end_date)}?`)) {
      return;
    }

    setGeneratingTimesheet(true);
    try {
      const response = await timesheetService.generateTimesheets(
        selectedFortnightlyPeriod.start_date.split('T')[0],
        selectedFortnightlyPeriod.end_date.split('T')[0]
      );
      
      if (response.status) {
        alert(`Successfully generated ${response.created} timesheets for the selected period!`);
        // Refresh data
        fetchAllOrganizationTimesheets();
        setShowGenerateModal(false);
      } else {
        alert(response.message || 'Failed to generate timesheets');
      }
    } catch (error) {
      console.error('Error generating timesheets:', error);
      alert('Failed to generate timesheets. Please try again.');
    } finally {
      setGeneratingTimesheet(false);
    }
  };

  // Filter timesheets - Only show pending/draft timesheets (not submitted/approved/pushed)
  const getPendingTimesheets = () => {
    return allTimesheets.filter(timesheet => 
      timesheet.status === 'pending' || timesheet.status === 'draft'
    );
  };

  // Filter timesheets based on search and filter
  const filteredTimesheets = getPendingTimesheets().filter(timesheet => {
    const matchesSearch = searchQuery === '' || 
      `${timesheet.employee?.first_name || ''} ${timesheet.employee?.last_name || ''}`
        .toLowerCase().includes(searchQuery.toLowerCase()) ||
      timesheet.employee?.employee_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || timesheet.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Toggle timesheet selection
  const toggleTimesheetSelection = (timesheetId) => {
    setSelectedTimesheetIds(prev => 
      prev.includes(timesheetId)
        ? prev.filter(id => id !== timesheetId)
        : [...prev, timesheetId]
    );
  };

  // Select all timesheets
  const selectAllTimesheets = () => {
    const allIds = getPendingTimesheets().map(t => t.id);
    
    if (selectedTimesheetIds.length === allIds.length) {
      setSelectedTimesheetIds([]);
    } else {
      setSelectedTimesheetIds(allIds);
    }
  };

  // Calculate organization stats - Only for pending/draft
  const orgStats = {
    totalTimesheets: allTimesheets.length,
    pendingTimesheets: allTimesheets.filter(t => t.status === 'pending' || t.status === 'draft').length,
    submittedTimesheets: allTimesheets.filter(t => t.status === 'submitted').length,
    approvedTimesheets: allTimesheets.filter(t => t.status === 'approved').length,
    pushedToXero: allTimesheets.filter(t => t.xero_status === 'pushed').length
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Timesheet Management</h1>
            <p className="text-gray-600 text-sm md:text-base">Manage and submit employee timesheets</p>
            {selectedOrganization && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                <FaUsers className="mr-2 text-xs" />
                {selectedOrganization.name}
              </div>
            )}
          </div>
          
          {/* Organization Stats */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-2 font-medium">Organization Stats</div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{orgStats.pendingTimesheets}</div>
                <div className="text-xs text-gray-500">Pending Timesheets</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {orgStats.submittedTimesheets}
                </div>
                <div className="text-xs text-gray-500">Submitted</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {orgStats.pushedToXero}
                </div>
                <div className="text-xs text-gray-500">Pushed to Xero</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid - Only for pending/draft timesheets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Hours</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalHours.toFixed(2)}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <FaClock className="text-blue-500 text-lg" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">{stats.entriesCount} pending entries</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Billable Hours</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.billableHours.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <FaCalculator className="text-green-500 text-lg" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">Revenue generating hours</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {orgStats.pendingTimesheets}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <FaFileAlt className="text-orange-500 text-lg" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">Timesheets awaiting submission</div>
          </div>
        </div>

        {/* Fortnightly Pay Periods Section */}
        {payPeriods.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Fortnightly Pay Periods</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Current:</span>
                {selectedPayPeriod && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {selectedPayPeriod.calendar_name}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                Select Fortnightly Period
              </h4>
              <div className="space-y-2">
                {payPeriods.slice(0, 5).map((period, index) => (
                  <div 
                    key={`fortnightly-${period.id}-${index}`}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      period.is_current 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (period.start_date) {
                        setSelectedDate(period.start_date.split('T')[0]);
                      }
                      setSelectedPayPeriod(period);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${
                        period.is_current ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{period.calendar_name}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(period.start_date)} - {formatDate(period.end_date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-700">{period.number_of_days} days</div>
                      {period.is_current && (
                        <div className="text-xs text-green-600 font-medium mt-1">• Current</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Timesheet Actions</h3>
              <p className="text-sm text-gray-600">Generate and submit timesheets</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleOpenGenerateModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
                disabled={apiLoading}
              >
                <FaSync className={apiLoading ? 'animate-spin' : ''} />
                Generate Timesheets
              </button>
              
              <button
                onClick={handleSubmitTimesheet}
                disabled={selectedTimesheetIds.length === 0 || apiLoading}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                  selectedTimesheetIds.length > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaPaperPlane />
                Submit Selected ({selectedTimesheetIds.length})
              </button>
            </div>
          </div>
        </div>

        {/* Main Timesheets Table - Only shows pending/draft timesheets */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pending Timesheets</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {getPendingTimesheets().length} pending/draft timesheets
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {/* Search */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full md:w-48"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-400 text-sm" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selection Summary */}
            {selectedTimesheetIds.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {selectedTimesheetIds.length} timesheet(s) selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllTimesheets}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedTimesheetIds.length === getPendingTimesheets().length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={() => setSelectedTimesheetIds([])}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timesheets Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    {getPendingTimesheets().length > 0 && (
                      <input
                        type="checkbox"
                        checked={selectedTimesheetIds.length === getPendingTimesheets().length}
                        onChange={selectAllTimesheets}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {getPendingTimesheets().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FaFileAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pending Timesheets</h3>
                      <p className="text-gray-600 mb-4">
                        Generate timesheets to get started
                      </p>
                      <button
                        onClick={handleOpenGenerateModal}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Generate Timesheets
                      </button>
                    </td>
                  </tr>
                ) : filteredTimesheets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FaSearch className="mx-auto text-4xl text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No matching timesheets</h3>
                      <p className="text-gray-600">
                        Try adjusting your search or filter
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTimesheets.map((timesheet) => (
                    <tr key={timesheet.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTimesheetIds.includes(timesheet.id)}
                          onChange={() => toggleTimesheetSelection(timesheet.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <FaUser className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {timesheet.employee?.first_name} {timesheet.employee?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{timesheet.employee?.employee_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-lg mr-3">
                            <FaCalendar className="text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(timesheet.from_date)} - {formatDate(timesheet.to_date)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {timesheet.from_date && timesheet.to_date 
                                ? Math.round((new Date(timesheet.to_date) - new Date(timesheet.from_date)) / (1000 * 60 * 60 * 24)) + 1 + ' days'
                                : 'N/A'
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-gray-900">
                          {parseFloat(timesheet.regular_hours || 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Regular hours</div>
                        {parseFloat(timesheet.overtime_hours || 0) > 0 && (
                          <div className="text-xs text-orange-600 mt-1">
                            +{parseFloat(timesheet.overtime_hours).toFixed(2)} overtime
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          timesheet.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                            : timesheet.status === 'draft'
                            ? 'bg-gray-100 text-gray-800 border border-gray-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {timesheet.status?.charAt(0).toUpperCase() + (timesheet.status?.slice(1) || '')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // View timesheet details
                              alert(`Timesheet Details:\nEmployee: ${timesheet.employee?.first_name} ${timesheet.employee?.last_name}\nPeriod: ${timesheet.from_date} to ${timesheet.to_date}\nHours: ${timesheet.regular_hours}\nStatus: ${timesheet.status}`);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaSearch size={14} />
                          </button>
                          <button
                            onClick={() => toggleTimesheetSelection(timesheet.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              selectedTimesheetIds.includes(timesheet.id)
                                ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                            title="Select for Submission"
                          >
                            <FaCheckCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generate Timesheet Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Generate Timesheets
                </h2>
                <button
                  onClick={() => {
                    setShowGenerateModal(false);
                    setSelectedFortnightlyPeriod(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                  disabled={generatingTimesheet}
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Select a fortnightly pay period to generate timesheets for all employees.
                </p>
                
                {fortnightlyPeriods.length === 0 ? (
                  <div className="text-center py-8">
                    <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Fortnightly Periods Found</h3>
                    <p className="text-gray-600">
                      No fortnightly pay periods available for this organization.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Fortnightly Period
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {fortnightlyPeriods.map((period) => (
                        <div
                          key={period.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                            selectedFortnightlyPeriod?.id === period.id
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedFortnightlyPeriod(period)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{period.calendar_name}</div>
                              <div className="text-sm text-gray-500">
                                {formatDate(period.start_date)} - {formatDate(period.end_date)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-medium text-gray-700">{period.number_of_days} days</div>
                              {period.is_current && (
                                <div className="text-xs text-green-600 font-medium mt-1">• Current</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedFortnightlyPeriod && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Period Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Start Date</div>
                      <div className="text-sm font-medium">{formatDate(selectedFortnightlyPeriod.start_date)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">End Date</div>
                      <div className="text-sm font-medium">{formatDate(selectedFortnightlyPeriod.end_date)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Period Name</div>
                      <div className="text-sm font-medium">{selectedFortnightlyPeriod.calendar_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="text-sm font-medium">{selectedFortnightlyPeriod.number_of_days} days</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateModal(false);
                    setSelectedFortnightlyPeriod(null);
                  }}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  disabled={generatingTimesheet}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateTimesheets}
                  disabled={!selectedFortnightlyPeriod || generatingTimesheet}
                  className={`px-5 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                    selectedFortnightlyPeriod && !generatingTimesheet
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {generatingTimesheet ? (
                    <>
                      <FaSync className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaSync />
                      Generate Timesheets
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {(apiLoading || generatingTimesheet) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <div>
                  <div className="text-lg font-medium text-gray-900">
                    {generatingTimesheet ? 'Generating Timesheets...' : 'Processing...'}
                  </div>
                  <div className="text-sm text-gray-600">Please wait while we complete your request</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetEntry;