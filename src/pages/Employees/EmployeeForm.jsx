/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  createEmployee,
  getEmployee,
  updateEmployee,
  getEmployees,
} from "../../services/employeeService.js";
// THE FIX: Import department/designation functions from the correct service
import {
  getDepartmentsByOrgId,
  getDesignationsByDeptId,
} from "../../services/organizationService.js";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaUser,
  FaBriefcase,
  FaUniversity,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
// THE FIX: Corrected the import path for the context
import { useOrganizations } from "../../contexts/OrganizationContext";

// Reusable Input Component
const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required = false,
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      className={`mt-1 block w-full px-3 py-2 bg-white border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
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
  ...props
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      {...props}
      className={`mt-1 block w-full px-3 py-2 bg-white border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
    >
      <option value="">-- Select --</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formErrors, setFormErrors] = useState({});

  // THE FIX: Get organization from context
  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id;

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
    status: "On Probation",
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

  // THE FIX: State for dynamic dropdown data
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

  const tabs = [
    { id: "personal", label: "Personal Information", icon: <FaUser /> },
    { id: "job", label: "Employment Details", icon: <FaBriefcase /> },
    { id: "financial", label: "Financial & Legal", icon: <FaUniversity /> },
    {
      id: "emergency",
      label: "Emergency Contact",
      icon: <FaExclamationTriangle />,
    },
  ];

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getEmployee(id)
        .then(({ data }) => setFormData(data.data))
        .catch((err) => console.error("Failed to fetch employee", err))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // THE FIX: Fetch dynamic data for dropdowns based on selected organization
  useEffect(() => {
    if (organizationId) {
      getDepartmentsByOrgId(organizationId)
        .then((res) =>
          setDepartments(
            res.data.data.map((d) => ({ value: d.id, label: d.name }))
          )
        )
        .catch((err) => console.error("Failed to fetch departments", err));
      getEmployees({ organization_id: organizationId })
        .then((res) =>
          setManagers(
            res.data.data.map((e) => ({
              value: e.id,
              label: `${e.first_name} ${e.last_name}`,
            }))
          )
        )
        .catch((err) => console.error("Failed to fetch managers", err));
    }
  }, [organizationId]);

  // THE FIX: Fetch designations when department changes
  useEffect(() => {
    if (formData.department_id) {
      // Don't reset designation if we are editing and it already has a value
      if (isEdit && formData.designation_id && !designations.length) {
        // just fetch
      } else {
        setFormData((prev) => ({ ...prev, designation_id: "" }));
      }

      getDesignationsByDeptId(formData.department_id)
        .then((res) =>
          setDesignations(
            res.data.data.map((d) => ({ value: d.id, label: d.title }))
          )
        )
        .catch((err) => console.error("Failed to fetch designations", err));
    } else {
      setDesignations([]);
    }
  }, [formData.department_id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentTab()) {
      alert("Please correct the errors on the current tab.");
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key] === null ? "" : formData[key]);
    }
    data.append("organization_id", organizationId);

    try {
      if (isEdit) {
        await updateEmployee(id, data);
      } else {
        await createEmployee(data);
      }
      navigate("/dashboard/employees");
    } catch (error) {
      console.error("Failed to save employee", error);
      if (error.response && error.response.status === 422) {
        setFormErrors(error.response.data.errors);
        alert("Please correct the validation errors.");
      } else {
        alert("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to validate current tab fields
  const validateCurrentTab = () => {
    const errors = {};

    if (activeTab === "personal") {
      if (!formData.first_name.trim())
        errors.first_name = "First Name is required";
      if (!formData.last_name.trim())
        errors.last_name = "Last Name is required";
      if (!formData.personal_email.trim())
        errors.personal_email = "Personal Email is required";
      if (!formData.phone_number.trim())
        errors.phone_number = "Phone Number is required";
      if (!formData.date_of_birth)
        errors.date_of_birth = "Date of Birth is required";
      if (!formData.gender) errors.gender = "Gender is required";
      if (!formData.address.trim()) errors.address = "Address is required";
    } else if (activeTab === "job") {
      if (!formData.employee_code.trim())
        errors.employee_code = "Employee Code is required";
      if (!formData.joining_date)
        errors.joining_date = "Joining Date is required";
      if (!formData.department_id)
        errors.department_id = "Department is required";
      if (!formData.designation_id)
        errors.designation_id = "Designation is required";
      if (!formData.employment_type)
        errors.employment_type = "Employment Type is required";
      if (!formData.status) errors.status = "Status is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return false;
    }
    return true;
  };

  const goToNextTab = () => {
    if (validateCurrentTab()) {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      }
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const isFirstTab = activeTab === tabs[0].id;
  const isLastTab = activeTab === tabs[tabs.length - 1].id;

  if (loading)
    return <div className="p-8 text-center">Loading employee data...</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-full font-sans">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          <FaArrowLeft /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isEdit ? "Edit Employee" : "Add New Employee"}
        </h1>
        <p className="text-gray-600 mb-6">
          Fill in the details below. Required fields are marked with *
        </p>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    tabs.findIndex((t) => t.id === activeTab) >= index
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1 text-gray-600 hidden md:inline">
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((tabs.findIndex((t) => t.id === activeTab) + 1) /
                    tabs.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Main container with blue border */}
        <div className="relative bg-white rounded-xl shadow-lg">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 rounded-l-xl"></div>
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px p-2" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button" // Add type="button" to prevent form submission
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 w-1/4 justify-center py-4 px-1 border-b-2 font-medium text-sm transition-all
                                        ${
                                          activeTab === tab.id
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                >
                  {tab.icon}{" "}
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6 ml-3">
            {/* Personal */}
            <div className={activeTab === "personal" ? "block" : "hidden"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={formErrors.first_name}
                  required
                />
                <InputField
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={formErrors.last_name}
                  required
                />
                <InputField
                  label="Personal Email"
                  name="personal_email"
                  type="email"
                  value={formData.personal_email}
                  onChange={handleChange}
                  error={formErrors.personal_email}
                  required
                />
                <InputField
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={formErrors.phone_number}
                  required
                />
                <InputField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  error={formErrors.date_of_birth}
                  required
                />
                <SelectField
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                  error={formErrors.gender}
                  required
                />
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address*
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address || ""}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full px-3 py-2 bg-white border ${
                      formErrors.address ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  ></textarea>
                  {formErrors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.address[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Job */}
            <div className={activeTab === "job" ? "block" : "hidden"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Employee Code"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  error={formErrors.employee_code}
                  required
                />
                <InputField
                  label="Joining Date"
                  name="joining_date"
                  type="date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  error={formErrors.joining_date}
                  required
                />
                <SelectField
                  label="Department"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  options={departments}
                  error={formErrors.department_id}
                  required
                />
                <SelectField
                  label="Designation"
                  name="designation_id"
                  value={formData.designation_id}
                  onChange={handleChange}
                  options={designations}
                  error={formErrors.designation_id}
                  required
                  disabled={
                    !formData.department_id || designations.length === 0
                  }
                />
                <SelectField
                  label="Employment Type"
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  options={[
                    { value: "Full-time", label: "Full-time" },
                    { value: "Part-time", label: "Part-time" },
                    { value: "Contract", label: "Contract" },
                    { value: "Internship", label: "Internship" },
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
                    { value: "Active", label: "Active" },
                    { value: "On Probation", label: "On Probation" },
                    { value: "On Leave", label: "On Leave" },
                    { value: "Terminated", label: "Terminated" },
                  ]}
                  error={formErrors.status}
                  required
                />
                <div className="md:col-span-2">
                  <SelectField
                    label="Reporting Manager"
                    name="reporting_manager_id"
                    value={formData.reporting_manager_id}
                    onChange={handleChange}
                    options={managers}
                    error={formErrors.reporting_manager_id}
                  />
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className={activeTab === "financial" ? "block" : "hidden"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Tax File Number (TFN)"
                  name="tax_file_number"
                  value={formData.tax_file_number}
                  onChange={handleChange}
                  error={formErrors.tax_file_number}
                />
                <InputField
                  label="Superannuation Fund Name"
                  name="superannuation_fund_name"
                  value={formData.superannuation_fund_name}
                  onChange={handleChange}
                  error={formErrors.superannuation_fund_name}
                />
                <InputField
                  label="Superannuation Member #"
                  name="superannuation_member_number"
                  value={formData.superannuation_member_number}
                  onChange={handleChange}
                  error={formErrors.superannuation_member_number}
                />
                <InputField
                  label="Bank BSB"
                  name="bank_bsb"
                  value={formData.bank_bsb}
                  onChange={handleChange}
                  error={formErrors.bank_bsb}
                />
                <InputField
                  label="Bank Account #"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  error={formErrors.bank_account_number}
                />
                <InputField
                  label="Visa Type"
                  name="visa_type"
                  value={formData.visa_type}
                  onChange={handleChange}
                  error={formErrors.visa_type}
                />
                <InputField
                  label="Visa Expiry Date"
                  name="visa_expiry_date"
                  type="date"
                  value={formData.visa_expiry_date}
                  onChange={handleChange}
                  error={formErrors.visa_expiry_date}
                />
              </div>
            </div>

            {/* Emergency */}
            <div className={activeTab === "emergency" ? "block" : "hidden"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Emergency Contact Name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  error={formErrors.emergency_contact_name}
                />
                <InputField
                  label="Emergency Contact Phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  error={formErrors.emergency_contact_phone}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-200 mt-6 flex justify-between gap-4">
              <div>
                {!isFirstTab && (
                  <button
                    type="button"
                    onClick={goToPreviousTab}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                {isFirstTab && (
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/employees")}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                )}

                {!isLastTab ? (
                  <button
                    type="button"
                    onClick={goToNextTab}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-all"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 transition-all"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : isEdit
                      ? "Update Employee"
                      : "Create Employee"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
