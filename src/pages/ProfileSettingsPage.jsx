import React, { useState } from "react";
import { FaLock, FaEye, FaEyeSlash, FaKey, FaCheckCircle, FaUserCog } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosClient from "../axiosClient";

// PasswordField is defined OUTSIDE ProfileSettingsPage so React does not
// recreate it on every render (which would unmount/remount the <input> on
// each keystroke, causing the "disabled after 1 character" bug).
const PasswordField = ({
  label,
  name,
  showKey,
  placeholder,
  formData,
  errors,
  isSubmitting,
  showPasswords,
  togglePassword,
  handleChange,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <FaLock className="text-gray-400" size={15} />
      </div>
      <input
        type={showPasswords[showKey] ? "text" : "password"}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={isSubmitting}
        autoComplete="new-password"
        className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border rounded-xl text-gray-800 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          disabled:opacity-60 disabled:cursor-not-allowed transition-all
          ${errors[name] ? "border-red-400 bg-red-50" : "border-gray-200"}`}
      />
      <button
        type="button"
        onClick={() => togglePassword(showKey)}
        disabled={isSubmitting}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
      >
        {showPasswords[showKey] ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
      </button>
    </div>
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
        <span>⚠</span> {errors[name]}
      </p>
    )}
  </div>
);

const ProfileSettingsPage = () => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const togglePassword = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.current_password)
      newErrors.current_password = "Current password is required.";
    if (!formData.new_password)
      newErrors.new_password = "New password is required.";
    else if (formData.new_password.length < 8)
      newErrors.new_password = "Password must be at least 8 characters.";
    if (!formData.confirm_password)
      newErrors.confirm_password = "Please confirm your new password.";
    else if (formData.new_password !== formData.confirm_password)
      newErrors.confirm_password = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("current_password", formData.current_password);
      payload.append("new_password", formData.new_password);
      payload.append("confirm_password", formData.confirm_password);

      const response = await axiosClient.post("/password-change", payload);
      const data = response.data;

      if (data.status === true) {
        toast.success(data.message || "Password changed successfully!", {
          position: "top-right",
          autoClose: 3500,
        });
        setIsSuccess(true);
        setFormData({ current_password: "", new_password: "", confirm_password: "" });
      } else {
        toast.error(data.message || "Failed to change password.", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(msg, { position: "top-right", autoClose: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared props passed down to each PasswordField
  const fieldProps = { formData, errors, isSubmitting, showPasswords, togglePassword, handleChange };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ToastContainer />

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <FaUserCog className="text-indigo-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
            <p className="text-gray-500 text-sm">Manage your account security</p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-white">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FaKey className="text-indigo-600" size={16} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Change Password</h2>
            <p className="text-xs text-gray-500">Keep your account safe with a strong password</p>
          </div>
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="mx-6 mt-5 flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
            <FaCheckCircle size={16} className="shrink-0" />
            Password updated successfully!
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
          <PasswordField
            {...fieldProps}
            label="Current Password"
            name="current_password"
            showKey="current"
            placeholder="Enter your current password"
          />
          <PasswordField
            {...fieldProps}
            label="New Password"
            name="new_password"
            showKey="new"
            placeholder="Minimum 8 characters"
          />
          <PasswordField
            {...fieldProps}
            label="Confirm New Password"
            name="confirm_password"
            showKey="confirm"
            placeholder="Repeat new password"
          />

          {/* Password tips */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
            <p className="font-semibold text-blue-800 mb-1.5">Password tips:</p>
            <p>• Use at least 8 characters</p>
            <p>• Mix uppercase, lowercase, numbers &amp; symbols</p>
            <p>• Avoid using personal information</p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <FaKey size={13} />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
