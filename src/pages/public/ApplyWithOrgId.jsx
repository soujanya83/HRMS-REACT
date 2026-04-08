// src/pages/Public/ApplyWithOrgId.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../axiosClient';
import {
  FaSave,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBuilding,
  FaSpinner,
  FaCheck,
  FaArrowLeft,
  FaIdCard,
  FaShieldAlt,
  FaUniversity,
  FaPassport,
  FaHeart,
  FaExclamationTriangle
} from 'react-icons/fa';

const ApplyWithOrgId = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    tax_file_number: '',
    superannuation_fund_name: '',
    superannuation_member_number: '',
    bank_bsb: '',
    bank_account_number: '',
    citizenship_status: '',
    is_australian_citizen: false,
    is_pr: false,
    visa_type: '',
  });
  
  const [errors, setErrors] = useState({});

  // Fetch employee data when component mounts
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!organizationId) {
        toast.error('Invalid organization ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosClient.get(`/employeedata/${organizationId}`);
        
        if (response.data?.success && response.data?.data) {
          const employee = response.data.data;
          setEmployeeData(employee);
          
          // Pre-fill form with existing data
          setFormData({
            employee_id: employee.id || '',
            first_name: employee.first_name || '',
            middle_name: employee.middle_name || '',
            last_name: employee.last_name || '',
            email: employee.personal_email || '',
            phone_number: employee.phone_number || '',
            date_of_birth: employee.date_of_birth || '',
            gender: employee.gender || '',
            address: employee.address || '',
            emergency_contact_name: employee.emergency_contact_name || '',
            emergency_contact_phone: employee.emergency_contact_phone || '',
            emergency_contact_relationship: employee.emergency_contact_relationship || '',
            tax_file_number: '',
            superannuation_fund_name: employee.superannuation_fund_name || '',
            superannuation_member_number: employee.superannuation_member_number || '',
            bank_bsb: employee.bank_bsb || '',
            bank_account_number: employee.bank_account_number || '',
            citizenship_status: employee.citizenship_status || '',
            is_australian_citizen: employee.is_australian_citizen === '1' || employee.is_australian_citizen === true,
            is_pr: employee.is_pr === '1' || employee.is_pr === true,
            visa_type: employee.visa_type || '',
          });
        } else {
          toast.error('Employee not found');
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        toast.error(error.response?.data?.message || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [organizationId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone_number?.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.emergency_contact_name?.trim()) newErrors.emergency_contact_name = 'Emergency contact name is required';
    if (!formData.emergency_contact_phone?.trim()) newErrors.emergency_contact_phone = 'Emergency contact phone is required';
    if (!formData.emergency_contact_relationship?.trim()) newErrors.emergency_contact_relationship = 'Emergency contact relationship is required';
    if (!formData.tax_file_number?.trim()) newErrors.tax_file_number = 'Tax File Number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const payload = {
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        tax_file_number: formData.tax_file_number,
        superannuation_fund_name: formData.superannuation_fund_name,
        superannuation_member_number: formData.superannuation_member_number,
        bank_bsb: formData.bank_bsb,
        bank_account_number: formData.bank_account_number,
        citizenship_status: formData.citizenship_status,
        is_australian_citizen: formData.is_australian_citizen,
        is_pr: formData.is_pr,
        visa_type: formData.visa_type,
      };
      
      const response = await axiosClient.post('/employee/update-profile', payload);
      
      if (response.data?.status) {
        setFormSubmitted(true);
        toast.success('Profile updated successfully!');
        
        // Redirect to certificates page after 2 seconds
        setTimeout(() => {
          navigate(`/apply/certificates/${organizationId}`);
        }, 2000);
      } else {
        toast.error(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please correct the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Please fill in your details to complete your employee profile
          </p>
          {employeeData?.organization && (
            <p className="text-sm text-blue-600 mt-1">
              Organization: {employeeData.organization.name}
            </p>
          )}
        </div>

        {/* Success Message */}
        {formSubmitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FaCheck className="text-green-500 text-xl" />
              <div>
                <p className="font-semibold text-green-800">Profile Updated Successfully!</p>
                <p className="text-sm text-green-700">
                  Redirecting to certificates upload page...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          {/* Read-only Employee Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-md font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <FaUser /> Employee Information (Read Only)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-blue-700">First Name</label>
                <p className="text-sm text-gray-800 font-medium">{formData.first_name || '-'}</p>
              </div>
              {formData.middle_name && (
                <div>
                  <label className="block text-xs font-medium text-blue-700">Middle Name</label>
                  <p className="text-sm text-gray-800 font-medium">{formData.middle_name}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-blue-700">Last Name</label>
                <p className="text-sm text-gray-800 font-medium">{formData.last_name || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-700">Email</label>
                <p className="text-sm text-gray-800 font-medium">{formData.email || '-'}</p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              <FaExclamationTriangle className="inline mr-1" /> These details cannot be edited. Contact HR for changes.
            </p>
          </div>

          {/* Personal Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FaUser className="text-blue-600" /> Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.phone_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+61 123 456 789"
                  />
                </div>
                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="2"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full address"
                  />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FaHeart className="text-red-500" /> Emergency Contact
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.emergency_contact_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Full name"
                />
                {errors.emergency_contact_name && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.emergency_contact_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+61 123 456 789"
                />
                {errors.emergency_contact_phone && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_phone}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.emergency_contact_relationship ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
                {errors.emergency_contact_relationship && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact_relationship}</p>}
              </div>
            </div>
          </div>

          {/* Tax & Financial Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FaShieldAlt className="text-green-600" /> Tax & Financial Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax File Number (TFN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tax_file_number"
                  value={formData.tax_file_number}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.tax_file_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your TFN"
                />
                {errors.tax_file_number && <p className="text-red-500 text-xs mt-1">{errors.tax_file_number}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Superannuation Fund Name
                </label>
                <input
                  type="text"
                  name="superannuation_fund_name"
                  value={formData.superannuation_fund_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AustralianSuper"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Superannuation Member Number
                </label>
                <input
                  type="text"
                  name="superannuation_member_number"
                  value={formData.superannuation_member_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter member number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank BSB
                </label>
                <input
                  type="text"
                  name="bank_bsb"
                  value={formData.bank_bsb}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="000-000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account number"
                />
              </div>
            </div>
          </div>

          {/* Visa & Citizenship */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <FaPassport className="text-purple-600" /> Visa & Citizenship
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Citizenship Status
                </label>
                <select
                  name="citizenship_status"
                  value={formData.citizenship_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Citizen">Australian Citizen</option>
                  <option value="PR">Permanent Resident</option>
                  <option value="Visa">Visa Holder</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visa Type
                </label>
                <input
                  type="text"
                  name="visa_type"
                  value={formData.visa_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Student Visa, Work Visa"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_australian_citizen"
                    checked={formData.is_australian_citizen}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Australian Citizen</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_pr"
                    checked={formData.is_pr}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Permanent Resident</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting || formSubmitted}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {submitting ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Your information is secure and will be used only for employment purposes.</p>
        </div>
      </div>
    </div>
  );
};

export default ApplyWithOrgId;