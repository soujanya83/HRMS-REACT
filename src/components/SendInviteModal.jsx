// src/components/SendInviteModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaEnvelope, FaCheck, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosClient from '../axiosClient';
import { useOrganizations } from '../contexts/OrganizationContext';

const SendInviteModal = ({ isOpen, onClose, onSuccess }) => {
  const { organizations, selectedOrganization } = useOrganizations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization_id: selectedOrganization?.id || '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && selectedOrganization) {
      setFormData(prev => ({
        ...prev,
        organization_id: selectedOrganization.id
      }));
    }
  }, [isOpen, selectedOrganization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organization_id) newErrors.organization_id = 'Organization is required';
    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axiosClient.post('/send-invite', {
        name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.email,
        organization_id: formData.organization_id
      });

      if (response.data?.status) {
        toast.success('Invite sent successfully!');
        onSuccess?.(response.data);
        onClose();
        setFormData({
          organization_id: selectedOrganization?.id || '',
          first_name: '',
          middle_name: '',
          last_name: '',
          email: ''
        });
      } else {
        toast.error(response.data?.message || 'Failed to send invite');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'Failed to send invite');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaEnvelope className="text-blue-600 text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Send Invite Email</h2>
              <p className="text-sm text-gray-500">Invite employee to complete their profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Organization Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                name="organization_id"
                value={formData.organization_id}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.organization_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            {errors.organization_id && (
              <p className="text-red-500 text-xs mt-1">{errors.organization_id}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter first name"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.first_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
            )}
          </div>

          {/* Middle Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              placeholder="Enter middle name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter last name"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.last_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="employee@company.com"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
            <FaCheck className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              An email will be sent to the employee with a link to complete their profile.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 font-medium"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendInviteModal;