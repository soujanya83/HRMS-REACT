import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEmployee } from '../../services/employeeService.js';
import { FaUser, FaBriefcase, FaBuilding, FaPhone, FaEnvelope, FaBirthdayCake, FaMapMarkerAlt, FaFileContract, FaUniversity, FaExclamationTriangle, FaArrowLeft, FaDollarSign, FaShieldAlt, FaPassport, FaCalendarAlt } from 'react-icons/fa';

// Helper component for displaying a detail field
const DetailField = ({ icon, label, value, className = '' }) => (
  <div className={`flex items-start py-3 ${className}`}>
    <div className="text-gray-500 mr-4 mt-1 text-lg flex-shrink-0">{icon}</div>
    <div className="flex-grow">
      <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-md text-gray-900 break-words">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </p>
    </div>
  </div>
);

// Helper component for section cards
const ProfileSection = ({ title, children, className = '' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 ${className}`}>
    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-100 pb-2 flex items-center">
      {title}
    </h2>
    {children}
  </div>
);

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug the ID parameter
  console.log('EmployeeProfile - ID from useParams:', id);
  console.log('EmployeeProfile - Full path:', window.location.pathname);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Starting to fetch employee with ID:', id);
        
        // Check if the ID is valid (should be a number, not "manage")
        if (id === 'manage' || isNaN(parseInt(id))) {
          throw new Error(`Invalid employee ID: ${id}. Please check the URL.`);
        }
        
        const response = await getEmployee(id);
        console.log('API Response received:', response);
        
        if (response.data && response.data.data) {
          setEmployee(response.data.data);
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error("Failed to fetch employee", error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, [id]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString, error;
    }
  };

  // Format financial numbers for security
  const formatFinancialNumber = (number) => {
    if (!number) return null;
    if (typeof number === 'string' && number.length > 4) {
      return '•••• ' + number.slice(-4);
    }
    return number;
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <LoadingSpinner />
            <p className="text-center text-gray-600 mt-4">Loading employee profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Employee</h2>
            <p className="text-gray-600 mb-2">{error}</p>
            <p className="text-sm text-gray-500 mb-6">
              URL: {window.location.pathname}<br/>
              ID Parameter: {id}
            </p>
            <button 
              onClick={() => navigate('/dashboard/employees')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Back to Employee List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-500 text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Not Found</h2>
            <p className="text-gray-600 mb-6">The requested employee could not be found.</p>
            <button 
              onClick={() => navigate('/dashboard/employees')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Back to Employee List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard/employees')} 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-semibold transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
        >
          <FaArrowLeft className="text-sm" /> 
          Back to Employee List
        </button>
        
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-2xl shadow-2xl mb-8 flex flex-col md:flex-row items-center gap-6 text-white">
          <div className="w-28 h-28 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white border-opacity-30">
            {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
          </div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-4xl font-extrabold mb-2">{employee.first_name} {employee.last_name}</h1>
            <p className="text-xl text-blue-100 opacity-90">
              {employee.designation?.name || 'No Designation'} 
              {employee.department?.name && ` • ${employee.department.name}`}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                employee.status === 'Active' 
                  ? 'bg-green-500 text-white' 
                  : employee.status === 'Inactive'
                  ? 'bg-gray-500 text-white'
                  : 'bg-yellow-500 text-white'
              }`}>
                {employee.status || 'Unknown Status'}
              </span>
              {employee.employment_type && (
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                  {employee.employment_type}
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 flex gap-3">
            <Link 
              to={`/dashboard/employees/edit/${id}`} 
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <FaUser className="text-sm" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="xl:col-span-2 space-y-8">
            {/* Personal Information */}
            <ProfileSection title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailField 
                  icon={<FaEnvelope />} 
                  label="Email Address" 
                  value={employee.personal_email} 
                />
                <DetailField 
                  icon={<FaPhone />} 
                  label="Phone Number" 
                  value={employee.phone_number} 
                />
                <DetailField 
                  icon={<FaBirthdayCake />} 
                  label="Date of Birth" 
                  value={formatDate(employee.date_of_birth)} 
                />
                <DetailField 
                  icon={<FaUser />} 
                  label="Gender" 
                  value={employee.gender} 
                />
                <DetailField 
                  icon={<FaMapMarkerAlt />} 
                  label="Address" 
                  value={employee.address} 
                  className="md:col-span-2" 
                />
              </div>
            </ProfileSection>

            {/* Financial & Legal Details */}
            <ProfileSection title="Financial & Legal Details (AU)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailField 
                  icon={<FaShieldAlt />} 
                  label="Tax File Number (TFN)" 
                  value={formatFinancialNumber(employee.tax_file_number)} 
                />
                <DetailField 
                  icon={<FaUniversity />} 
                  label="Superannuation Fund" 
                  value={employee.superannuation_fund_name} 
                />
                <DetailField 
                  icon={<FaUniversity />} 
                  label="Super Member Number" 
                  value={formatFinancialNumber(employee.superannuation_member_number)} 
                />
                <DetailField 
                  icon={<FaDollarSign />} 
                  label="Bank BSB" 
                  value={formatFinancialNumber(employee.bank_bsb)} 
                />
                <DetailField 
                  icon={<FaDollarSign />} 
                  label="Bank Account Number" 
                  value={formatFinancialNumber(employee.bank_account_number)} 
                />
                <DetailField 
                  icon={<FaPassport />} 
                  label="Visa Type" 
                  value={employee.visa_type} 
                />
                <DetailField 
                  icon={<FaCalendarAlt />} 
                  label="Visa Expiry Date" 
                  value={formatDate(employee.visa_expiry_date)} 
                />
              </div>
            </ProfileSection>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Employment Details */}
            <ProfileSection title="Employment Details">
              <div className="space-y-4">
                <DetailField 
                  icon={<FaBuilding />} 
                  label="Department" 
                  value={employee.department?.name} 
                />
                <DetailField 
                  icon={<FaBriefcase />} 
                  label="Designation" 
                  value={employee.designation?.name} 
                />
                <DetailField 
                  icon={<FaUser />} 
                  label="Reporting Manager" 
                  value={employee.reporting_manager ? 
                    `${employee.reporting_manager.first_name} ${employee.reporting_manager.last_name}` : 
                    'Not assigned'
                  } 
                />
                <DetailField 
                  icon={<FaFileContract />} 
                  label="Joining Date" 
                  value={formatDate(employee.joining_date)} 
                />
                <DetailField 
                  icon={<FaFileContract />} 
                  label="Employment Type" 
                  value={employee.employment_type} 
                />
                <div className="pt-2">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Employment Status</p>
                  <span className={`px-3 py-2 rounded-lg text-sm font-semibold inline-block ${
                    employee.status === 'Active' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : employee.status === 'Inactive'
                      ? 'bg-gray-100 text-gray-800 border border-gray-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {employee.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </ProfileSection>

            {/* Emergency Contact */}
            <ProfileSection title="Emergency Contact">
              <div className="space-y-4">
                <DetailField 
                  icon={<FaExclamationTriangle />} 
                  label="Contact Name" 
                  value={employee.emergency_contact_name} 
                />
                <DetailField 
                  icon={<FaPhone />} 
                  label="Contact Phone" 
                  value={employee.emergency_contact_phone} 
                />
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  );
}