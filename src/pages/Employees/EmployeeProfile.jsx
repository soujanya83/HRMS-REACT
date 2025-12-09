/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaUser, FaBriefcase, FaBuilding, FaPhone, FaEnvelope,
  FaBirthdayCake, FaMapMarkerAlt, FaFileContract, FaUniversity,
  FaExclamationTriangle, FaArrowLeft, FaDollarSign, FaShieldAlt,
  FaPassport, FaCalendarAlt, FaEdit, FaFileAlt, FaHistory,
  FaPrint, FaShare, FaQrcode, FaIdCard, FaTasks, FaChartLine,
  FaDownload, FaCopy, FaExternalLinkAlt, FaEllipsisH
} from 'react-icons/fa';
import { HiOutlineDocumentReport, HiOutlineUserGroup } from 'react-icons/hi';
import { getEmployee } from '../../services/employeeService';

// Detail Field Component
const DetailField = ({ icon, label, value, className = '' }) => (
  <div className={`flex items-start py-3 ${className}`}>
    <div className="text-gray-500 mr-4 mt-1 flex-shrink-0">{icon}</div>
    <div className="flex-grow">
      <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-md text-gray-900 break-words">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </p>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, label, value, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-lg font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ icon, label, onClick, color = 'bg-blue-600 hover:bg-blue-700' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${color}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getEmployee(id);
        if (response.data?.data) {
          setEmployee(response.data.data);
        } else {
          throw new Error('Employee not found');
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError(err.response?.data?.message || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployee();
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Calculate tenure
  const calculateTenure = (joiningDate) => {
    if (!joiningDate) return null;
    const join = new Date(joiningDate);
    const now = new Date();
    const years = now.getFullYear() - join.getFullYear();
    const months = now.getMonth() - join.getMonth();
    const totalMonths = years * 12 + months;
    
    if (totalMonths >= 12) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
    }
  };

  // Generate employee stats
  const employeeStats = employee ? [
    { icon: <FaCalendarAlt className="h-5 w-5" />, label: 'Tenure', value: calculateTenure(employee.joining_date) || 'N/A', color: 'blue' },
    { icon: <FaBriefcase className="h-5 w-5" />, label: 'Employment Type', value: employee.employment_type || 'N/A', color: 'green' },
    { icon: <HiOutlineUserGroup className="h-5 w-5" />, label: 'Department', value: employee.department?.name || 'N/A', color: 'purple' },
    { icon: <FaUser className="h-5 w-5" />, label: 'Reports To', value: employee.manager ? `${employee.manager.first_name} ${employee.manager.last_name}` : 'N/A', color: 'orange' }
  ] : [];

  // Quick actions
  const quickActions = [
    { label: 'Edit Profile', icon: <FaEdit className="h-4 w-4" />, action: () => navigate(`/dashboard/employees/edit/${id}`), color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Documents', icon: <FaFileAlt className="h-4 w-4" />, action: () => navigate(`/dashboard/employees/${id}/documents`), color: 'bg-green-600 hover:bg-green-700' },
    { label: 'History', icon: <FaHistory className="h-4 w-4" />, action: () => navigate(`/dashboard/employees/${id}/history`), color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Performance', icon: <FaChartLine className="h-4 w-4" />, action: () => navigate(`/dashboard/employees/${id}/performance`), color: 'bg-orange-600 hover:bg-orange-700' }
  ];

  // Secondary actions
  const secondaryActions = [
    { label: 'Print', icon: <FaPrint className="h-4 w-4" />, action: () => window.print(), color: 'bg-gray-600 hover:bg-gray-700' },
    { label: 'Export', icon: <FaDownload className="h-4 w-4" />, action: () => exportProfile(), color: 'bg-gray-600 hover:bg-gray-700' },
    { label: 'Share', icon: <FaShare className="h-4 w-4" />, action: () => shareProfile(), color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  const exportProfile = () => {
    alert('Export feature coming soon!');
  };

  const shareProfile = () => {
    alert('Share feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The requested employee could not be found.'}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/dashboard/employees')}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Employee List
              </button>
              <button
                onClick={() => navigate('/dashboard/employees/new')}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Add New Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/dashboard/employees')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft /> Back to Employees
            </button>
            
            <div className="flex items-center gap-2">
              {secondaryActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`p-2.5 ${action.color} text-white rounded-lg transition-colors`}
                  title={action.label}
                >
                  {action.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Employee Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white border-opacity-30">
                {employee.first_name?.[0]}{employee.last_name?.[0]}
              </div>
              <span className={`absolute bottom-0 right-0 px-3 py-1 rounded-full text-xs font-bold ${
                employee.status === 'Active' 
                  ? 'bg-green-500 text-white' 
                  : employee.status === 'On Leave'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {employee.status}
              </span>
            </div>
            
            {/* Basic Info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {employee.first_name} {employee.last_name}
                  </h1>
                  <p className="text-xl text-blue-100 opacity-90 mb-3">
                    {employee.designation?.title || 'No Designation'}
                    {employee.department?.name && ` • ${employee.department.name}`}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-blue-200" />
                      <span>{employee.personal_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-blue-200" />
                      <span>{employee.phone_number || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaIdCard className="text-blue-200" />
                      <span>{employee.employee_code}</span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex-shrink-0">
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action, index) => (
                      <ActionButton
                        key={index}
                        icon={action.icon}
                        label={action.label}
                        onClick={action.action}
                        color={action.color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {employeeStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {['overview', 'employment', 'financial', 'documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaUser className="h-5 w-5 text-blue-600" />
                    </div>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField
                      icon={<FaEnvelope className="h-4 w-4" />}
                      label="Email Address"
                      value={employee.personal_email}
                    />
                    <DetailField
                      icon={<FaPhone className="h-4 w-4" />}
                      label="Phone Number"
                      value={employee.phone_number}
                    />
                    <DetailField
                      icon={<FaBirthdayCake className="h-4 w-4" />}
                      label="Date of Birth"
                      value={formatDate(employee.date_of_birth)}
                    />
                    <DetailField
                      icon={<FaUser className="h-4 w-4" />}
                      label="Gender"
                      value={employee.gender}
                    />
                    <DetailField
                      icon={<FaMapMarkerAlt className="h-4 w-4" />}
                      label="Address"
                      value={employee.address}
                      className="md:col-span-2"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField
                      icon={<FaUser className="h-4 w-4" />}
                      label="Contact Name"
                      value={employee.emergency_contact_name}
                    />
                    <DetailField
                      icon={<FaPhone className="h-4 w-4" />}
                      label="Contact Phone"
                      value={employee.emergency_contact_phone}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === 'employment' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaBriefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField
                      icon={<FaIdCard className="h-4 w-4" />}
                      label="Employee Code"
                      value={employee.employee_code}
                    />
                    <DetailField
                      icon={<FaCalendarAlt className="h-4 w-4" />}
                      label="Joining Date"
                      value={formatDate(employee.joining_date)}
                    />
                    <DetailField
                      icon={<FaBuilding className="h-4 w-4" />}
                      label="Department"
                      value={employee.department?.name}
                    />
                    <DetailField
                      icon={<FaBriefcase className="h-4 w-4" />}
                      label="Designation"
                      value={employee.designation?.title}
                    />
                    <DetailField
                      icon={<FaFileContract className="h-4 w-4" />}
                      label="Employment Type"
                      value={employee.employment_type}
                    />
                    <DetailField
                      icon={<FaUser className="h-4 w-4" />}
                      label="Reporting Manager"
                      value={employee.manager ? `${employee.manager.first_name} ${employee.manager.last_name}` : 'Not assigned'}
                    />
                  </div>
                </div>

                {/* Organizational Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaBuilding className="h-5 w-5 text-purple-600" />
                    </div>
                    Organizational Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField
                      icon={<FaUser className="h-4 w-4" />}
                      label="Organization"
                      value={employee.organization?.name}
                    />
                    <DetailField
                      icon={<FaCalendarAlt className="h-4 w-4" />}
                      label="Date Added"
                      value={formatDate(employee.created_at)}
                    />
                    {employee.applicant && (
                      <DetailField
                        icon={<FaUser className="h-4 w-4" />}
                        label="Applicant Source"
                        value={employee.applicant.source || 'N/A'}
                        className="md:col-span-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="h-5 w-5 text-yellow-600" />
                    <p className="text-yellow-800 text-sm">
                      Financial information is securely stored and used only for payroll and compliance purposes.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaDollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    Financial Information (AU)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField
                      icon={<FaShieldAlt className="h-4 w-4" />}
                      label="Tax File Number (TFN)"
                      value={employee.tax_file_number ? '•••• •••• ' + employee.tax_file_number.slice(-3) : null}
                    />
                    <DetailField
                      icon={<FaUniversity className="h-4 w-4" />}
                      label="Superannuation Fund"
                      value={employee.superannuation_fund_name}
                    />
                    <DetailField
                      icon={<FaUniversity className="h-4 w-4" />}
                      label="Superannuation Member #"
                      value={employee.superannuation_member_number ? '•••• ' + employee.superannuation_member_number.slice(-4) : null}
                    />
                    <DetailField
                      icon={<FaDollarSign className="h-4 w-4" />}
                      label="Bank BSB"
                      value={employee.bank_bsb ? '•••-' + employee.bank_bsb.slice(-3) : null}
                    />
                    <DetailField
                      icon={<FaDollarSign className="h-4 w-4" />}
                      label="Bank Account #"
                      value={employee.bank_account_number ? '•••• ' + employee.bank_account_number.slice(-4) : null}
                    />
                    <DetailField
                      icon={<FaPassport className="h-4 w-4" />}
                      label="Visa Type"
                      value={employee.visa_type}
                    />
                    <DetailField
                      icon={<FaCalendarAlt className="h-4 w-4" />}
                      label="Visa Expiry Date"
                      value={formatDate(employee.visa_expiry_date)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <FaFileAlt className="h-16 w-16 text-gray-300 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Employee Documents</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Employee documents are managed separately. Click the Documents button to view and manage all documents.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate(`/dashboard/employees/${id}/documents`)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    <FaFileAlt className="inline mr-2" />
                    Go to Documents Management
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/employees/edit/${id}`)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    <FaEdit className="inline mr-2" />
                    Edit Employee Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaQrcode className="h-5 w-5 text-blue-600" />
              Employee ID Card
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
              <div className="bg-white p-6 rounded-lg shadow-md inline-block">
                <div className="text-2xl font-bold text-gray-800 mb-2">{employee.employee_code}</div>
                <div className="text-lg font-semibold text-gray-700">{employee.first_name} {employee.last_name}</div>
                <div className="text-sm text-gray-600 mt-2">{employee.designation?.title}</div>
              </div>
              <button 
                onClick={() => window.print()}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <FaPrint className="inline mr-2" />
                Print ID Card
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaShare className="h-5 w-5 text-green-600" />
              Share Profile
            </h3>
            <p className="text-gray-600 mb-4">Share this employee profile with team members.</p>
            <div className="space-y-3">
              <button className="w-full px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors">
                Share via Email
              </button>
              <button className="w-full px-4 py-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors">
                Generate Shareable Link
              </button>
              <button className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors">
                Export as PDF
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineDocumentReport className="h-5 w-5 text-purple-600" />
              Quick Reports
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                <div className="font-medium">Employment Summary</div>
                <div className="text-sm text-gray-500">View detailed employment history</div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                <div className="font-medium">Performance Review</div>
                <div className="text-sm text-gray-500">View performance metrics</div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                <div className="font-medium">Document Checklist</div>
                <div className="text-sm text-gray-500">Check required documents</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}