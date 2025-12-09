/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaUser, FaBriefcase, FaBuilding, FaPhone, FaEnvelope,
  FaBirthdayCake, FaMapMarkerAlt, FaFileContract, FaUniversity,
  FaExclamationTriangle, FaArrowLeft, FaDollarSign, FaShieldAlt,
  FaPassport, FaCalendarAlt, FaSave, FaTimes, FaUpload,
  FaCheck, FaArrowRight, FaArrowLeft as FaArrowLeftIcon
} from 'react-icons/fa';
import {
  createEmployee,
  updateEmployee,
  getEmployee,
  getDepartmentsByOrganization
} from '../../services/employeeService';
import { useOrganizations } from '../../contexts/OrganizationContext';
import { getDesignationsByDeptId } from '../../services/organizationService';

// Reusable Input Component
const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  placeholder = "",
  icon = null,
  disabled = false
}) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 bg-white border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

// Reusable Select Component
const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  placeholder = "-- Select --",
  icon = null
}) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
          {icon}
        </div>
      )}
      <select
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-8 py-2.5 bg-white border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

// Tab Button Component
const TabButton = ({ tab, isActive, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(tab.id)}
    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {tab.icon}
    <span className="hidden sm:inline">{tab.label}</span>
  </button>
);

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('personal');
  const { selectedOrganization } = useOrganizations();
  
  // Form data state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    personal_email: "",
    date_of_birth: "",
    gender: "",
    phone_number: "",
    address: "",
    department_id: "",
    designation_id: "",
    reporting_manager_id: "",
    employee_code: "",
    joining_date: "",
    employment_type: "Full-time",
    status: "Active",
    tax_file_number: "",
    superannuation_fund_name: "",
    superannuation_member_number: "",
    bank_bsb: "",
    bank_account_number: "",
    visa_type: "",
    visa_expiry_date: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  // Dropdown data
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

  // Tab configuration
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <FaUser className="h-4 w-4" /> },
    { id: 'employment', label: 'Employment', icon: <FaBriefcase className="h-4 w-4" /> },
    { id: 'financial', label: 'Financial', icon: <FaDollarSign className="h-4 w-4" /> },
    { id: 'emergency', label: 'Emergency', icon: <FaExclamationTriangle className="h-4 w-4" /> }
  ];

  // Fetch employee data for edit
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getEmployee(id)
        .then(({ data }) => {
          if (data.data) {
            setFormData(data.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching employee:', error);
          alert('Failed to load employee data');
          navigate('/dashboard/employees');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  // Fetch departments
  useEffect(() => {
    if (selectedOrganization?.id) {
      getDepartmentsByOrganization(selectedOrganization.id)
        .then((response) => {
          const deptOptions = response.data.data?.map(dept => ({
            value: dept.id,
            label: dept.name
          })) || [];
          setDepartments(deptOptions);
        })
        .catch((error) => console.error('Error fetching departments:', error));
    }
  }, [selectedOrganization]);

  // Fetch designations when department changes
  useEffect(() => {
    if (formData.department_id) {
      getDesignationsByDeptId(formData.department_id)
        .then((response) => {
          const desigOptions = response.data.data?.map(desig => ({
            value: desig.id,
            label: desig.title
          })) || [];
          setDesignations(desigOptions);
        })
        .catch((error) => console.error('Error fetching designations:', error));
    } else {
      setDesignations([]);
    }
  }, [formData.department_id]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate current tab
  const validateCurrentTab = () => {
    const errors = {};
    
    switch (activeTab) {
      case 'personal':
        if (!formData.first_name.trim()) errors.first_name = 'First name is required';
        if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
        if (!formData.personal_email.trim()) errors.personal_email = 'Email is required';
        if (!formData.phone_number.trim()) errors.phone_number = 'Phone number is required';
        if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
        if (!formData.gender) errors.gender = 'Gender is required';
        break;
        
      case 'employment':
        if (!formData.employee_code.trim()) errors.employee_code = 'Employee code is required';
        if (!formData.joining_date) errors.joining_date = 'Joining date is required';
        if (!formData.department_id) errors.department_id = 'Department is required';
        if (!formData.designation_id) errors.designation_id = 'Designation is required';
        if (!formData.employment_type) errors.employment_type = 'Employment type is required';
        break;
        
      case 'financial':
        // Financial fields are optional
        break;
        
      case 'emergency':
        // Emergency fields are optional
        break;
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentTab()) {
      alert('Please fix the errors before submitting');
      return;
    }
    
    setSubmitting(true);
    setFormErrors({});
    
    const formDataObj = new FormData();
    
    // Append all form data
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        formDataObj.append(key, formData[key]);
      }
    });
    
    // Add organization ID
    if (selectedOrganization?.id) {
      formDataObj.append('organization_id', selectedOrganization.id);
    }
    
    try {
      if (isEdit) {
        await updateEmployee(id, formDataObj);
        alert('Employee updated successfully!');
      } else {
        await createEmployee(formDataObj);
        alert('Employee created successfully!');
      }
      navigate('/dashboard/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        alert('Please fix the validation errors');
      } else {
        alert(`Failed to ${isEdit ? 'update' : 'create'} employee: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Navigate between tabs
  const nextTab = () => {
    if (validateCurrentTab()) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      }
    }
  };

  const prevTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const isFirstTab = activeTab === 'personal';
  const isLastTab = activeTab === 'emergency';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/dashboard/employees')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft /> Back to Employees
            </button>
            
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800">
                {isEdit ? 'Edit Employee' : 'Add New Employee'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isEdit 
                  ? 'Update employee information and details'
                  : 'Fill in the details to add a new employee to your organization'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="flex flex-col items-center flex-1 relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 ${
                  tabs.findIndex(t => t.id === activeTab) >= index
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {tab.icon}
                </div>
                <span className={`text-xs font-medium hidden md:block ${
                  tabs.findIndex(t => t.id === activeTab) >= index
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}>
                  {tab.label}
                </span>
                {index < tabs.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                    tabs.findIndex(t => t.id === activeTab) > index
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Tab Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={setActiveTab}
              />
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaUser className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                    <p className="text-gray-600">Basic personal details about the employee</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    error={formErrors.first_name}
                    required
                    icon={<FaUser className="h-4 w-4" />}
                    placeholder="Enter first name"
                  />
                  
                  <InputField
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={formErrors.last_name}
                    required
                    placeholder="Enter last name"
                  />
                  
                  <InputField
                    label="Email Address"
                    name="personal_email"
                    type="email"
                    value={formData.personal_email}
                    onChange={handleChange}
                    error={formErrors.personal_email}
                    required
                    icon={<FaEnvelope className="h-4 w-4" />}
                    placeholder="employee@company.com"
                  />
                  
                  <InputField
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    error={formErrors.phone_number}
                    required
                    icon={<FaPhone className="h-4 w-4" />}
                    placeholder="+61 123 456 789"
                  />
                  
                  <InputField
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    error={formErrors.date_of_birth}
                    required
                    icon={<FaBirthdayCake className="h-4 w-4" />}
                  />
                  
                  <SelectField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    error={formErrors.gender}
                    required
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' },
                      { value: 'Prefer not to say', label: 'Prefer not to say' }
                    ]}
                  />
                  
                  <div className="md:col-span-2">
                    <InputField
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      error={formErrors.address}
                      required
                      icon={<FaMapMarkerAlt className="h-4 w-4" />}
                      placeholder="Full residential address"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === 'employment' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaBriefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Employment Details</h2>
                    <p className="text-gray-600">Job and organizational information</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Employee Code"
                    name="employee_code"
                    value={formData.employee_code}
                    onChange={handleChange}
                    error={formErrors.employee_code}
                    required
                    placeholder="EMP-001"
                  />
                  
                  <InputField
                    label="Joining Date"
                    name="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    error={formErrors.joining_date}
                    required
                    icon={<FaCalendarAlt className="h-4 w-4" />}
                  />
                  
                  <SelectField
                    label="Department"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    options={departments}
                    error={formErrors.department_id}
                    required
                    icon={<FaBuilding className="h-4 w-4" />}
                    placeholder="Select department"
                  />
                  
                  <SelectField
                    label="Designation"
                    name="designation_id"
                    value={formData.designation_id}
                    onChange={handleChange}
                    options={designations}
                    error={formErrors.designation_id}
                    required
                    disabled={!formData.department_id}
                    icon={<FaBriefcase className="h-4 w-4" />}
                    placeholder={formData.department_id ? "Select designation" : "Select department first"}
                  />
                  
                  <SelectField
                    label="Employment Type"
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleChange}
                    options={[
                      { value: 'Full-time', label: 'Full-time' },
                      { value: 'Part-time', label: 'Part-time' },
                      { value: 'Contract', label: 'Contract' },
                      { value: 'Casual', label: 'Casual' },
                      { value: 'Internship', label: 'Internship' }
                    ]}
                    error={formErrors.employment_type}
                    required
                  />
                  
                  <SelectField
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Inactive', label: 'Inactive' },
                      { value: 'On Leave', label: 'On Leave' },
                      { value: 'On Probation', label: 'On Probation' },
                      { value: 'Terminated', label: 'Terminated' }
                    ]}
                    required
                  />
                  
                  <div className="md:col-span-2">
                    <SelectField
                      label="Reporting Manager"
                      name="reporting_manager_id"
                      value={formData.reporting_manager_id}
                      onChange={handleChange}
                      options={managers}
                      placeholder="Select manager (optional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaDollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Financial & Legal Information (Australia)</h2>
                    <p className="text-gray-600">This information is securely stored and used for payroll and compliance purposes.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Tax File Number (TFN)"
                    name="tax_file_number"
                    value={formData.tax_file_number}
                    onChange={handleChange}
                    icon={<FaShieldAlt className="h-4 w-4" />}
                    placeholder="123 456 789"
                  />
                  
                  <InputField
                    label="Superannuation Fund"
                    name="superannuation_fund_name"
                    value={formData.superannuation_fund_name}
                    onChange={handleChange}
                    icon={<FaUniversity className="h-4 w-4" />}
                    placeholder="e.g., AustralianSuper"
                  />
                  
                  <InputField
                    label="Superannuation Member Number"
                    name="superannuation_member_number"
                    value={formData.superannuation_member_number}
                    onChange={handleChange}
                    placeholder="SUPER12345"
                  />
                  
                  <InputField
                    label="Bank BSB"
                    name="bank_bsb"
                    value={formData.bank_bsb}
                    onChange={handleChange}
                    icon={<FaDollarSign className="h-4 w-4" />}
                    placeholder="123-456"
                  />
                  
                  <InputField
                    label="Bank Account Number"
                    name="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleChange}
                    placeholder="987654321"
                  />
                  
                  <InputField
                    label="Visa Type"
                    name="visa_type"
                    value={formData.visa_type}
                    onChange={handleChange}
                    icon={<FaPassport className="h-4 w-4" />}
                    placeholder="e.g., Permanent Residency"
                  />
                  
                  <InputField
                    label="Visa Expiry Date"
                    name="visa_expiry_date"
                    type="date"
                    value={formData.visa_expiry_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Emergency Contact Tab */}
            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaExclamationTriangle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Emergency Contact Information</h2>
                    <p className="text-gray-600">Please provide contact details for emergency situations.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Emergency Contact Name"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    icon={<FaUser className="h-4 w-4" />}
                    placeholder="Contact person's name"
                  />
                  
                  <InputField
                    label="Emergency Contact Phone"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    icon={<FaPhone className="h-4 w-4" />}
                    placeholder="+61 123 456 789"
                  />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-3 w-full sm:w-auto">
                  {!isFirstTab && (
                    <button
                      type="button"
                      onClick={prevTab}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors w-full sm:w-auto justify-center"
                    >
                      <FaArrowLeftIcon className="h-4 w-4" />
                      Previous
                    </button>
                  )}
                  
                  {isFirstTab && (
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/employees')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors w-full sm:w-auto justify-center"
                    >
                      <FaTimes className="h-4 w-4" />
                      Cancel
                    </button>
                  )}
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  {!isLastTab ? (
                    <button
                      type="button"
                      onClick={nextTab}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors w-full sm:w-auto justify-center"
                    >
                      Next
                      <FaArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {isEdit ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <FaSave className="h-4 w-4" />
                          {isEdit ? 'Update Employee' : 'Create Employee'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Form Validation Summary */}
        {Object.keys(formErrors).length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-red-800 font-medium">Please fix the following errors:</h3>
            </div>
            <ul className="text-red-700 text-sm list-disc pl-5 space-y-1">
              {Object.entries(formErrors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}