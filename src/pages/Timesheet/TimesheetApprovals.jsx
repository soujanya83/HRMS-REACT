// components/TimesheetApprovals.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaSearch, 
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaDownload,
  FaThumbsUp,
  FaThumbsDown,
  FaSave,
  FaTimes,
  FaSpinner,
  FaUserTie,
  FaChartBar,
  FaFileInvoiceDollar,
  FaPaperPlane,
  FaSyncAlt,
  FaFilter,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { useOrganizations } from '../../contexts/OrganizationContext';
import { timesheetService } from '../../services/timesheetService';

const TimesheetApprovals = () => {
  const { selectedOrganization } = useOrganizations();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    employee: 'all',
    date: '',
    search: ''
  });
  const [pushToXeroLoading, setPushToXeroLoading] = useState(false);
  const [selectedTimesheetIds, setSelectedTimesheetIds] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pushResults, setPushResults] = useState(null);
  const [showPushResults, setShowPushResults] = useState(false);

  useEffect(() => {
    fetchTimesheets();
  }, [selectedOrganization, refreshTrigger]);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      if (selectedOrganization?.id) {
        const response = await timesheetService.getTimesheets(selectedOrganization.id);
        console.log('📋 Timesheets API response for Approvals:', response);
        
        if (response?.status && Array.isArray(response.data)) {
          const submittedTimesheets = response.data.filter(t => 
            t.status === 'submitted' || t.status === 'approved'
          );
          console.log('✅ Filtered timesheets for approvals:', submittedTimesheets);
          setTimesheets(submittedTimesheets);
        }
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this timesheet?')) {
      try {
        // Call API to approve
        await timesheetService.approveTimesheet(id);
        
        // Update local state
        setTimesheets(prev => prev.map(ts => 
          ts.id === id ? { 
            ...ts, 
            status: 'approved',
            approved_by: 'You',
            approved_at: new Date().toISOString()
          } : ts
        ));
        
        alert('Timesheet approved successfully!');
        
        // Refresh data
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 1000);
      } catch (error) {
        console.error('Error approving timesheet:', error);
        alert('Failed to approve timesheet. Please try again.');
      }
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      try {
        // Call API to reject
        await timesheetService.rejectTimesheet(id, reason);
        
        // Update local state
        setTimesheets(prev => prev.map(ts => 
          ts.id === id ? { 
            ...ts, 
            status: 'rejected',
            rejected_by: 'You',
            rejected_date: new Date().toISOString(),
            rejection_reason: reason
          } : ts
        ));
        
        alert('Timesheet rejected successfully!');
        
        // Refresh data
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 1000);
      } catch (error) {
        console.error('Error rejecting timesheet:', error);
        alert('Failed to reject timesheet. Please try again.');
      }
    }
  };

  const handleViewDetails = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setShowDetailModal(true);
  };

  // Bulk push to Xero (Selected timesheets)
  const handlePushToXero = async () => {
    if (!selectedOrganization?.id) {
      alert('Please select an organization first');
      return;
    }

    if (selectedTimesheetIds.length === 0) {
      alert('Please select timesheets to push to Xero');
      return;
    }

    // Get unique employee IDs from selected timesheets
    const selectedTimesheets = timesheets.filter(t => selectedTimesheetIds.includes(t.id));
    const employeeIds = [...new Set(selectedTimesheets.map(t => t.employee_id || t.employee?.id).filter(id => id))];
    
    if (employeeIds.length === 0) {
      alert('No valid employee IDs found in selected timesheets');
      return;
    }

    if (window.confirm(`Push ${employeeIds.length} employee(s) to Xero?\n\nThis will push timesheets for ${employeeIds.length} employee(s) to Xero.`)) {
      setPushToXeroLoading(true);
      setPushResults(null);
      setShowPushResults(false);
      
      try {
        console.log('📤 Pushing SELECTED employees to Xero:', {
          organizationId: selectedOrganization.id,
          employeeIds,
          selectedTimesheetIds,
          selectedTimesheetCount: selectedTimesheets.length
        });
        
        // Push all employees
        const results = await timesheetService.pushEmployeesToXero(selectedOrganization.id, employeeIds);
        console.log('✅ Push results:', results);
        
        setPushResults(results);
        
        // Count successes and failures
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;
        
        // Update UI for successful pushes
        const successfulEmployeeIds = results.filter(r => r.success).map(r => r.employeeId);
        setTimesheets(prev => prev.map(ts => {
          const employeeId = ts.employee_id || ts.employee?.id;
          if (selectedTimesheetIds.includes(ts.id) && successfulEmployeeIds.includes(employeeId)) {
            return {
              ...ts,
              xero_status: 'pushed',
              xero_synced_at: new Date().toISOString(),
              status: 'approved'
            };
          }
          return ts;
        }));
        
        // Clear selection
        setSelectedTimesheetIds([]);
        
        // Show results
        if (failureCount === 0) {
          alert(`✅ Successfully pushed ${successCount} employee(s) to Xero!`);
        } else {
          setShowPushResults(true);
          alert(`⚠️ Push completed with ${successCount} successes and ${failureCount} failures. Click "View Results" for details.`);
        }
        
        // Refresh data
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 2000);
        
      } catch (error) {
        console.error('Error pushing to Xero:', error);
        alert('Failed to push to Xero. Please check console for details.');
      } finally {
        setPushToXeroLoading(false);
      }
    }
  };

  // Push ALL timesheets to Xero
  const handlePushAllToXero = async () => {
    if (!selectedOrganization?.id) {
      alert('Please select an organization first');
      return;
    }

    // Get ALL employee IDs with submitted timesheets
    const allEmployeeIds = [...new Set(
      timesheets
        .filter(t => 
          t.status === 'submitted' && 
          (t.xero_status === null || t.xero_status !== 'pushed')
        )
        .map(t => t.employee_id || t.employee?.id)
        .filter(id => id) // Remove undefined/null
    )];
    
    if (allEmployeeIds.length === 0) {
      alert('No timesheets ready for Xero push');
      return;
    }

    if (window.confirm(`Push ALL ${allEmployeeIds.length} employee(s) to Xero?\n\nThis will push all submitted timesheets to Xero.`)) {
      setPushToXeroLoading(true);
      setPushResults(null);
      setShowPushResults(false);
      
      try {
        console.log('📤 Pushing ALL employees to Xero:', {
          organizationId: selectedOrganization.id,
          employeeIds: allEmployeeIds,
          count: allEmployeeIds.length
        });
        
        // Push all employees
        const results = await timesheetService.pushEmployeesToXero(selectedOrganization.id, allEmployeeIds);
        console.log('✅ Push ALL results:', results);
        
        setPushResults(results);
        
        // Count successes and failures
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;
        
        // Update UI for successful pushes
        const successfulEmployeeIds = results.filter(r => r.success).map(r => r.employeeId);
        setTimesheets(prev => prev.map(ts => {
          const employeeId = ts.employee_id || ts.employee?.id;
          if (ts.status === 'submitted' && successfulEmployeeIds.includes(employeeId)) {
            return {
              ...ts,
              xero_status: 'pushed',
              xero_synced_at: new Date().toISOString(),
              status: 'approved'
            };
          }
          return ts;
        }));
        
        // Clear selection
        setSelectedTimesheetIds([]);
        
        // Show results
        if (failureCount === 0) {
          alert(`✅ Successfully pushed ALL ${successCount} employee(s) to Xero!`);
        } else {
          setShowPushResults(true);
          alert(`⚠️ Push completed with ${successCount} successes and ${failureCount} failures. Click "View Results" for details.`);
        }
        
        // Refresh data
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 2000);
        
      } catch (error) {
        console.error('Error pushing ALL to Xero:', error);
        alert('Failed to push ALL to Xero. Please check console for details.');
      } finally {
        setPushToXeroLoading(false);
      }
    }
  };

  // Single push to Xero
  const handlePushSingleToXero = async (timesheetId) => {
    const timesheet = timesheets.find(t => t.id === timesheetId);
    if (!timesheet) {
      alert('Timesheet not found');
      return;
    }

    const employeeId = timesheet.employee_id || timesheet.employee?.id;
    if (!employeeId) {
      alert('Employee ID not found for this timesheet');
      return;
    }

    // Check if timesheet has hours
    const hasHours = parseFloat(timesheet.regular_hours || 0) > 0;
    if (!hasHours) {
      if (!window.confirm(`⚠️ Warning: This timesheet has 0.00 hours. Still push to Xero?`)) {
        return;
      }
    }

    if (window.confirm(`Push timesheet for ${timesheet.employee?.first_name || 'Employee'} (ID: ${employeeId}) to Xero?`)) {
      setPushToXeroLoading(true);
      try {
        console.log('📤 Pushing single timesheet to Xero:', {
          organizationId: selectedOrganization.id,
          employeeId,
          timesheetId,
          timesheetDetails: {
            employeeName: `${timesheet.employee?.first_name} ${timesheet.employee?.last_name}`,
            period: `${formatDate(timesheet.from_date)} - ${formatDate(timesheet.to_date)}`,
            hours: timesheet.regular_hours,
            status: timesheet.status
          }
        });
        
        const response = await timesheetService.pushEmployeeToXero(selectedOrganization.id, employeeId);
        console.log('✅ Push response:', response);
        
        if (response.success || response.status === 'success') {
          alert(`✅ Successfully pushed ${timesheet.employee?.first_name}'s timesheet to Xero!`);
          
          // Update the specific timesheet
          setTimesheets(prev => prev.map(ts => 
            ts.id === timesheetId 
              ? { 
                  ...ts, 
                  xero_status: 'pushed', 
                  xero_synced_at: new Date().toISOString(),
                  status: 'approved'
                } 
              : ts
          ));
          
          // Remove from selection if present
          setSelectedTimesheetIds(prev => prev.filter(id => id !== timesheetId));
          
          // Refresh data
          setTimeout(() => {
            setRefreshTrigger(prev => prev + 1);
          }, 1000);
        } else {
          alert(`❌ Failed: ${response.message || 'Unable to push to Xero'}`);
        }
      } catch (error) {
        console.error('Error pushing single timesheet to Xero:', error);
        console.error('Error response data:', error.response?.data);
        
        // Show specific error message
        let errorMessage = 'Failed to push timesheet to Xero.';
        if (error.response?.data?.message) {
          errorMessage += `\n\nError: ${error.response.data.message}`;
        }
        if (error.response?.data?.errors) {
          errorMessage += `\n\nDetails: ${JSON.stringify(error.response.data.errors)}`;
        }
        
        alert(errorMessage);
      } finally {
        setPushToXeroLoading(false);
      }
    }
  };

  const toggleTimesheetSelection = (timesheetId) => {
    setSelectedTimesheetIds(prev => 
      prev.includes(timesheetId)
        ? prev.filter(id => id !== timesheetId)
        : [...prev, timesheetId]
    );
  };

  const selectAllTimesheets = () => {
    const allIds = timesheets
      .filter(t => 
        t.status === 'submitted' && 
        (t.xero_status === null || t.xero_status !== 'pushed')
      )
      .map(t => t.id);
    
    if (selectedTimesheetIds.length === allIds.length && allIds.length > 0) {
      setSelectedTimesheetIds([]);
    } else {
      setSelectedTimesheetIds(allIds);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      submitted: 'bg-blue-100 text-blue-800 border border-blue-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200'
    };
    return `px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${styles[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="mr-1" />;
      case 'rejected': return <FaTimesCircle className="mr-1" />;
      case 'submitted': return <FaPaperPlane className="mr-1" />;
      default: return <FaClock className="mr-1" />;
    }
  };

  const filteredTimesheets = timesheets.filter(ts => {
    if (filters.status !== 'all' && ts.status !== filters.status) return false;
    if (filters.search && !`${ts.employee?.first_name || ''} ${ts.employee?.last_name || ''}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    submitted: timesheets.filter(ts => ts.status === 'submitted').length,
    approved: timesheets.filter(ts => ts.status === 'approved').length,
    rejected: timesheets.filter(ts => ts.status === 'rejected').length,
    total: timesheets.length,
    readyForXero: timesheets.filter(ts => 
      ts.status === 'submitted' && 
      (ts.xero_status === null || ts.xero_status !== 'pushed')
    ).length
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date' (error);
    }
  };

  // Push Results Modal
  const PushResultsModal = () => {
    if (!pushResults || !showPushResults) return null;

    const successCount = pushResults.filter(r => r.success).length;
    const failureCount = pushResults.filter(r => !r.success).length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Xero Push Results</h2>
            <button
              onClick={() => setShowPushResults(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${successCount > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                <div className="text-3xl font-bold text-green-600 mb-1">{successCount}</div>
                <div className="text-sm font-medium text-green-800">Successful</div>
              </div>
              <div className={`p-4 rounded-lg ${failureCount > 0 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                <div className="text-3xl font-bold text-red-600 mb-1">{failureCount}</div>
                <div className="text-sm font-medium text-red-800">Failed</div>
              </div>
            </div>

            {failureCount > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <FaExclamationTriangle /> Failed Pushes
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pushResults.filter(r => !r.success).map((result, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm font-medium text-red-800">
                        Employee ID: {result.employeeId}
                      </div>
                      <div className="text-sm text-red-600 mt-1">
                        {typeof result.error === 'object' ? 
                          (result.error.message || JSON.stringify(result.error)) : 
                          result.error}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {successCount > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <FaCheckCircle /> Successful Pushes
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pushResults.filter(r => r.success).map((result, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        Employee ID: {result.employeeId}
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Successfully pushed to Xero
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPushResults(false)}
                className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading timesheets data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Push Results Modal */}
        <PushResultsModal />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Timesheet Approvals</h1>
          <p className="text-gray-600">Review, approve, and push timesheets to Xero</p>
          {selectedOrganization && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
              <FaUserTie className="mr-2 text-xs" />
              {selectedOrganization.name}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <FaCalendarAlt className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.submitted}</p>
              </div>
              <FaPaperPlane className="text-yellow-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.approved}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.rejected}</p>
              </div>
              <FaTimesCircle className="text-red-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Xero</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.readyForXero}</p>
              </div>
              <FaSyncAlt className="text-purple-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {/* Push ALL button */}
            <button
              onClick={handlePushAllToXero}
              disabled={stats.readyForXero === 0 || pushToXeroLoading}
              className={`px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                stats.readyForXero > 0 && !pushToXeroLoading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaSyncAlt className={pushToXeroLoading ? 'animate-spin' : ''} />
              {pushToXeroLoading ? 'Pushing All...' : `Push All (${stats.readyForXero})`}
            </button>
            
            {/* Push SELECTED button */}
            <button
              onClick={handlePushToXero}
              disabled={selectedTimesheetIds.length === 0 || pushToXeroLoading}
              className={`px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                selectedTimesheetIds.length > 0 && !pushToXeroLoading
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaSyncAlt className={pushToXeroLoading ? 'animate-spin' : ''} />
              {pushToXeroLoading ? 'Pushing...' : `Push Selected (${selectedTimesheetIds.length})`}
            </button>
            
            {/* View Results button */}
            {pushResults && (
              <button
                onClick={() => setShowPushResults(true)}
                className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaInfoCircle /> View Results
              </button>
            )}
            
            {/* Refresh button */}
            <button 
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaSyncAlt /> Refresh
            </button>
          </div>

          {selectedTimesheetIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-blue-600 font-medium">
                {selectedTimesheetIds.length} timesheet(s) selected
              </span>
              <button
                onClick={selectAllTimesheets}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {selectedTimesheetIds.length === stats.readyForXero && stats.readyForXero > 0 ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => setSelectedTimesheetIds([])}
                className="text-sm text-red-600 hover:text-red-800 hover:underline"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search employees..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                />
              </div>
            </div>
            
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Date
              </label>
              <input 
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        {/* Timesheets Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                    {stats.readyForXero > 0 && (
                      <input
                        type="checkbox"
                        checked={selectedTimesheetIds.length === stats.readyForXero && stats.readyForXero > 0}
                        onChange={selectAllTimesheets}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Xero Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTimesheets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaClock className="text-4xl text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900 mb-1">No timesheets found</p>
                        <p className="text-gray-500">No timesheets match the current filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTimesheets.map((timesheet) => (
                    <tr key={timesheet.id} className="hover:bg-gray-50 transition-colors">
                      {/* Checkbox for Xero Push */}
                      <td className="px-4 py-3">
                        {timesheet.status === 'submitted' && 
                         (timesheet.xero_status === null || timesheet.xero_status !== 'pushed') && (
                          <input
                            type="checkbox"
                            checked={selectedTimesheetIds.includes(timesheet.id)}
                            onChange={() => toggleTimesheetSelection(timesheet.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}
                      </td>

                      {/* Employee */}
                      <td className="px-4 py-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {`${timesheet.employee?.first_name?.[0] || ''}${timesheet.employee?.last_name?.[0] || ''}`}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {timesheet.employee?.first_name || 'N/A'} {timesheet.employee?.last_name || ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              {timesheet.employee?.employee_code || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {timesheet.employee_id || timesheet.employee?.id || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Period */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {formatDate(timesheet.from_date)} - {formatDate(timesheet.to_date)}
                        </div>
                      </td>

                      {/* Hours */}
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900 mb-1">
                            {parseFloat(timesheet.regular_hours || 0).toFixed(2)}h
                          </div>
                          {parseFloat(timesheet.overtime_hours || 0) > 0 && (
                            <div className="text-xs text-orange-600">
                              +{parseFloat(timesheet.overtime_hours).toFixed(2)} overtime
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col space-y-1">
                          <span className={getStatusBadge(timesheet.status)}>
                            {getStatusIcon(timesheet.status)}
                            {timesheet.status?.charAt(0).toUpperCase() + (timesheet.status?.slice(1) || '')}
                          </span>
                          {timesheet.approved_by && (
                            <div className="text-xs text-gray-500">
                              Approved by: {timesheet.approved_by}
                            </div>
                          )}
                          {timesheet.approved_at && (
                            <div className="text-xs text-gray-500">
                              On: {formatDate(timesheet.approved_at)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Xero Status */}
                      <td className="px-4 py-3">
                        {timesheet.xero_status ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            timesheet.xero_status === 'pushed' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            <FaCheckCircle className="mr-1" />
                            {timesheet.xero_status.charAt(0).toUpperCase() + timesheet.xero_status.slice(1)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            Not Pushed
                          </span>
                        )}
                        {timesheet.xero_synced_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(timesheet.xero_synced_at)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewDetails(timesheet)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
                            title="View Details"
                          >
                            <FaEye /> Details
                          </button>
                          
                          {/* Single Push to Xero Button */}
                          {timesheet.status === 'submitted' && 
                           (timesheet.xero_status === null || timesheet.xero_status !== 'pushed') && (
                            <button
                              onClick={() => handlePushSingleToXero(timesheet.id)}
                              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1"
                              title="Push to Xero"
                            >
                              <FaSyncAlt /> Push
                            </button>
                          )}
                          
                          {timesheet.status === 'submitted' && (
                            <>
                              <button
                                onClick={() => handleApprove(timesheet.id)}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                                title="Approve"
                              >
                                <FaThumbsUp />
                              </button>
                              <button
                                onClick={() => handleReject(timesheet.id)}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1"
                                title="Reject"
                              >
                                <FaThumbsDown />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {filteredTimesheets.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredTimesheets.length} of {timesheets.length} timesheets
              </div>
              <div className="text-sm font-semibold text-gray-800">
                Ready for Xero push:{" "}
                <span className="text-purple-600">{stats.readyForXero}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timesheet Detail Modal */}
        {showDetailModal && selectedTimesheet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Timesheet Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                {/* Employee Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Employee Information</h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0 h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-base">
                        {`${selectedTimesheet.employee?.first_name?.[0] || ''}${selectedTimesheet.employee?.last_name?.[0] || ''}`}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {selectedTimesheet.employee?.first_name || 'N/A'} {selectedTimesheet.employee?.last_name || ''}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedTimesheet.employee?.employee_code || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Employee ID: {selectedTimesheet.employee_id || selectedTimesheet.employee?.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Submitted:</span> {formatDate(selectedTimesheet.created_at)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Hours Summary</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-gray-800">
                          {parseFloat(selectedTimesheet.regular_hours || 0).toFixed(2)}h
                        </div>
                        <div className="text-xs text-gray-600">Total Hours</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-green-600">
                          {parseFloat(selectedTimesheet.regular_hours || 0).toFixed(2)}h
                        </div>
                        <div className="text-xs text-gray-600">Regular Hours</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-orange-600">
                          {parseFloat(selectedTimesheet.overtime_hours || 0).toFixed(2)}h
                        </div>
                        <div className="text-xs text-gray-600">Overtime Hours</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {selectedTimesheet.xero_status === 'pushed' ? 'Pushed' : 'Not Pushed'}
                        </div>
                        <div className="text-xs text-gray-600">Xero Status</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Period */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Period</h3>
                  <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {formatDate(selectedTimesheet.from_date)} - {formatDate(selectedTimesheet.to_date)}
                  </div>
                </div>

                {/* Daily Breakdown */}
                {selectedTimesheet.daily_breakdown && typeof selectedTimesheet.daily_breakdown === 'object' && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Daily Breakdown</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedTimesheet.daily_breakdown).map(([date, hours]) => (
                        <div key={date} className="flex justify-between items-center text-sm border-b pb-2">
                          <div className="text-gray-700">{formatDate(date)}</div>
                          <div className="font-medium text-gray-900">
                            {parseFloat(hours).toFixed(2)} hours
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedTimesheet.status === 'submitted' && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handlePushSingleToXero(selectedTimesheet.id)}
                      className="px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <FaSyncAlt /> Push to Xero
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedTimesheet.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedTimesheet.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <FaSave /> Approve Timesheet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {pushToXeroLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                <div>
                  <div className="text-lg font-medium text-gray-900">Pushing to Xero...</div>
                  <div className="text-sm text-gray-600">Please wait while we sync with Xero</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetApprovals;