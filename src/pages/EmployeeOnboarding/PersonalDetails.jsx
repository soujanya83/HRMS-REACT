import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaSave,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHeart,
  FaShieldAlt,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa';
import axiosClient from '../../axiosClient';
import EncryptedInput from '../public/EncryptedInput';

const PersonalDetails = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
    bank_name: '',
    account_name: '',
    bank_bsb: '',
    bank_account_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [employeeId, setEmployeeId] = useState(null);
  const [showSuperFundSuggestions, setShowSuperFundSuggestions] = useState(false);
  const [superFundSuggestions, setSuperFundSuggestions] = useState([]);
  const [isSearchingSuperFund, setIsSearchingSuperFund] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Get logged in employee from localStorage
      const employeeStr = localStorage.getItem('employee');
      if (!employeeStr) {
        // Fallback to user if employee not found
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          toast.error('User session not found');
          return;
        }
        const user = JSON.parse(userStr);
        const response = await axiosClient.get(`/employeedata/${user.id}`);
        if (response.data?.success && response.data?.data) {
          populateFormData(response.data.data);
        }
        return;
      }

      const employee = JSON.parse(employeeStr);
      setEmployeeId(employee.id);

      // Use the employeedata endpoint with employee.id
      const response = await axiosClient.get(`/employeedata/${employee.id}`);

      if (response.data?.success && response.data?.data) {
        populateFormData(response.data.data);
      } else {
        toast.error('Profile not found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (employee) => {
    setFormData({
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
      tax_file_number: employee.tax_file_number || '',
      superannuation_fund_name: employee.superannuation_fund_name || '',
      superannuation_member_number: employee.superannuation_member_number || '',
      bank_name: employee.bank_name || '',
      account_name: employee.account_name || '',
      bank_bsb: employee.bank_bsb || '',
      bank_account_number: employee.bank_account_number || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.emergency_contact_name.trim()) newErrors.emergency_contact_name = 'Emergency contact name is required';
    if (!formData.emergency_contact_phone.trim()) newErrors.emergency_contact_phone = 'Emergency contact phone is required';
    if (!formData.emergency_contact_relationship.trim()) newErrors.emergency_contact_relationship = 'Relationship is required';
    if (!formData.tax_file_number.trim()) newErrors.tax_file_number = 'TFN is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        employee_id: employeeId,
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
        bank_name: formData.bank_name,
        account_name: formData.account_name,
        bank_bsb: formData.bank_bsb,
        bank_account_number: formData.bank_account_number,
      };

      const response = await axiosClient.post('/employee/update-profile', payload);

      if (response.data?.status) {
        toast.success('Profile updated successfully!');
        navigate('/dashboard/employee-onboarding/certificates');
      } else {
        toast.error(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving personal details:', error);
      toast.error('Failed to save personal details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuperFundSearch = async (query) => {
    if (query.length < 2) {
      setSuperFundSuggestions([]);
      return;
    }

    try {
      setIsSearchingSuperFund(true);
      const funds = await searchSuperFunds(query);
      setSuperFundSuggestions(funds);
    } catch (error) {
      console.error('Error searching super funds:', error);
    } finally {
      setIsSearchingSuperFund(false);
    }
  };

  useEffect(() => {
    if (showSuperFundSuggestions && formData.superannuation_fund_name) {
      handleSuperFundSearch(formData.superannuation_fund_name);
    }
  }, [formData.superannuation_fund_name, showSuperFundSuggestions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personal Details</h1>
        <p className="text-gray-600">Complete your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
        {/* Employee Information (Read Only) */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-md font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <FaUser /> Employee Information (Read Only)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-blue-700">Full Name</label>
              <p className="text-sm text-gray-800 font-medium">
                {formData.first_name} {formData.middle_name} {formData.last_name}
              </p>
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
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border ${errors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                placeholder="+61 123 456 789"
              />
              {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
              />
              {errors.date_of_birth && <p className="text-xs text-red-500 mt-1">{errors.date_of_birth}</p>}
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
                className={`w-full px-4 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="2"
                className={`w-full px-4 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your full address"
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
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
                placeholder="Contact Name"
                className={`w-full px-4 py-2 border ${errors.emergency_contact_name ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
              />
              {errors.emergency_contact_name && <p className="text-xs text-red-500 mt-1">{errors.emergency_contact_name}</p>}
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
                placeholder="Contact Phone"
                className={`w-full px-4 py-2 border ${errors.emergency_contact_phone ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
              />
              {errors.emergency_contact_phone && <p className="text-xs text-red-500 mt-1">{errors.emergency_contact_phone}</p>}
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
                placeholder="Relationship"
                className={`w-full px-4 py-2 border ${errors.emergency_contact_relationship ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
              />
              {errors.emergency_contact_relationship && <p className="text-xs text-red-500 mt-1">{errors.emergency_contact_relationship}</p>}
            </div>
          </div>
        </div>

        {/* Tax & Financial Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <FaShieldAlt className="text-green-600" /> Tax & Financial Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EncryptedInput
              label="Tax File Number (TFN)"
              name="tax_file_number"
              value={formData.tax_file_number}
              onChange={handleChange}
              required={true}
              placeholder="XXX XXX XXX"
              error={errors.tax_file_number}
            />

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Superannuation Fund Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="superannuation_fund_name"
                  value={formData.superannuation_fund_name}
                  onChange={handleChange}
                  onFocus={() => setShowSuperFundSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowSuperFundSuggestions(false), 200);
                  }}
                  placeholder="e.g., AustralianSuper, REST, Hostplus"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  autoComplete="off"
                />
                {isSearchingSuperFund && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <FaSpinner className="animate-spin text-gray-400" />
                  </div>
                )}
              </div>

              {showSuperFundSuggestions && superFundSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {superFundSuggestions.map((fund, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          superannuation_fund_name: fund
                        }));
                        setSuperFundSuggestions([]);
                        setShowSuperFundSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                    >
                      {fund}
                    </button>
                  ))}
                </div>
              )}
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
                placeholder="Your superannuation member number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="e.g., Commonwealth Bank, ANZ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                placeholder="Name on the bank account"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                placeholder="XXX XXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <EncryptedInput
              label="Bank Account Number"
              name="bank_account_number"
              value={formData.bank_account_number}
              onChange={handleChange}
              required={false}
              placeholder="Your bank account number"
              error={errors.bank_account_number}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {submitting ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default PersonalDetails;
