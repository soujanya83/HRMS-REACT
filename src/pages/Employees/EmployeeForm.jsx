import React, { useEffect, useState } from "react";
import {
  createEmployee,
  getEmployee,
  updateEmployee,
  getEmployees,
} from "../../services/employeeService.js";
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
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaSpinner,
} from "react-icons/fa";
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
  placeholder = "",
  disabled = false,
}) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-lg border ${
        error ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
    />
    {error && (
      <div className="mt-1 flex items-center text-red-600 text-sm">
        <FaTimes className="mr-1 text-xs" />
        {error[0]}
      </div>
    )}
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
  placeholder = "-- Select --",
  disabled = false,
  loading = false,
}) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      disabled={disabled || loading}
      className={`w-full px-4 py-2.5 rounded-lg border ${
        error ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white`}
    >
      <option value="">{loading ? "Loading..." : placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <div className="mt-1 flex items-center text-red-600 text-sm">
        <FaTimes className="mr-1 text-xs" />
        {error[0]}
      </div>
    )}
  </div>
);

// Reusable TextArea Component
const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
  rows = 3,
}) => (
  <div className="w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-4 py-2.5 rounded-lg border ${
        error ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none`}
    />
    {error && (
      <div className="mt-1 flex items-center text-red-600 text-sm">
        <FaTimes className="mr-1 text-xs" />
        {error[0]}
      </div>
    )}
  </div>
);

// Tab Component
const TabButton = ({ active, onClick, icon, label, step, completed }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-3 px-6 py-4 w-full rounded-lg transition-all duration-300 ${
      active
        ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
    }`}
  >
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
      active ? "bg-blue-100 text-blue-600" : completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
    }`}>
      {completed && !active ? <FaCheck className="text-sm" /> : icon}
    </div>
    <div className="flex flex-col items-start">
      <span className={`text-sm font-medium ${active ? "text-blue-700" : completed ? "text-green-700" : "text-gray-600"}`}>
        {label}
      </span>
      <span className={`text-xs ${active ? "text-blue-500" : "text-gray-400"}`}>
        Step {step}
      </span>
    </div>
  </button>
);

// Section Header Component
const SectionHeader = ({ title, description }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
    {description && <p className="text-gray-600">{description}</p>}
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
  const [completedTabs, setCompletedTabs] = useState(new Set());
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [designationsLoading, setDesignationsLoading] = useState(false);
  const [managersLoading, setManagersLoading] = useState(false);

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
    employment_type: "",
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

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

  const tabs = [
    { id: "personal", label: "Personal Info", icon: <FaUser />, step: 1 },
    { id: "employment", label: "Employment", icon: <FaBriefcase />, step: 2 },
    { id: "financial", label: "Financial", icon: <FaUniversity />, step: 3 },
    { id: "emergency", label: "Emergency", icon: <FaExclamationTriangle />, step: 4 },
  ];

  // Tab descriptions
  const tabDescriptions = {
    personal: "Basic personal details about the employee",
    employment: "Employment details and work information",
    financial: "Financial and legal information (AU specific)",
    emergency: "Emergency contact details",
  };

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getEmployee(id)
        .then((response) => {
          console.log('Employee API response:', response);
          if (response.data && response.data.success === true) {
            const employeeData = response.data.data;
            console.log('Employee data for edit:', employeeData);
            setFormData(employeeData);
            setCompletedTabs(new Set(["personal", "employment", "financial", "emergency"]));
            
            // If department_id exists, fetch designations for that department
            if (employeeData.department_id) {
              setDesignationsLoading(true);
              getDesignationsByDeptId(employeeData.department_id)
                .then((res) => {
                  console.log('Designations response for edit:', res);
                  if (res && res.success === true) {
                    const designationsData = res.data || [];
                    setDesignations(
                      designationsData.map((d) => ({ 
                        value: d.id, 
                        label: d.title 
                      }))
                    );
                  }
                })
                .catch((err) => {
                  console.error("Failed to fetch designations for edit:", err);
                  setDesignations([]);
                })
                .finally(() => setDesignationsLoading(false));
            }
          } else {
            console.error("Failed to fetch employee:", response);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch employee", err);
          console.error("Error details:", err.response?.data);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // Fetch dynamic data when organization changes
  useEffect(() => {
    if (organizationId) {
      console.log('Fetching data for organization ID:', organizationId);
      
      // Fetch departments
      setDepartmentsLoading(true);
      getDepartmentsByOrgId(organizationId)
        .then((res) => {
          console.log('Departments API response:', res);
          if (res && res.success === true) {
            const departmentsData = res.data || [];
            console.log('Departments data:', departmentsData);
            setDepartments(
              departmentsData.map((d) => ({ 
                value: d.id, 
                label: d.name 
              }))
            );
          } else {
            console.error("Failed to fetch departments - response structure:", res);
            setDepartments([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching departments:", err);
          console.error("Error details:", err.response?.data);
          setDepartments([]);
        })
        .finally(() => setDepartmentsLoading(false));

      // Fetch managers (existing employees)
      setManagersLoading(true);
      getEmployees({ organization_id: organizationId })
        .then((response) => {
          console.log('Managers API response:', response);
          if (response.data && response.data.success === true) {
            const employeesData = response.data.data || [];
            console.log('Managers data:', employeesData);
            setManagers(
              employeesData.map((e) => ({
                value: e.id,
                label: `${e.first_name} ${e.last_name}`,
              }))
            );
          } else {
            console.error("Failed to fetch managers:", response);
            setManagers([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching managers:", err);
          setManagers([]);
        })
        .finally(() => setManagersLoading(false));
    } else {
      console.log('No organization ID selected');
      setDepartments([]);
      setManagers([]);
    }
  }, [organizationId]);

  // Fetch designations when department changes
  useEffect(() => {
    if (formData.department_id) {
      console.log('Fetching designations for department ID:', formData.department_id);
      
      // Reset designation when department changes
      setFormData((prev) => ({ ...prev, designation_id: "" }));
      
      setDesignationsLoading(true);
      getDesignationsByDeptId(formData.department_id)
        .then((res) => {
          console.log('Designations API response:', res);
          if (res && res.success === true) {
            const designationsData = res.data || [];
            console.log('Designations data:', designationsData);
            setDesignations(
              designationsData.map((d) => ({ 
                value: d.id, 
                label: d.title 
              }))
            );
          } else {
            console.error("Failed to fetch designations:", res);
            setDesignations([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching designations:", err);
          setDesignations([]);
        })
        .finally(() => setDesignationsLoading(false));
    } else {
      console.log('No department selected');
      setDesignations([]);
    }
  }, [formData.department_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate current tab
  const validateCurrentTab = () => {
    const errors = {};

    if (activeTab === "personal") {
      if (!formData.first_name.trim())
        errors.first_name = ["First Name is required"];
      if (!formData.last_name.trim())
        errors.last_name = ["Last Name is required"];
      if (!formData.personal_email.trim())
        errors.personal_email = ["Personal Email is required"];
      else if (!/^\S+@\S+\.\S+$/.test(formData.personal_email))
        errors.personal_email = ["Please enter a valid email address"];
      if (!formData.phone_number.trim())
        errors.phone_number = ["Phone Number is required"];
      if (!formData.date_of_birth)
        errors.date_of_birth = ["Date of Birth is required"];
      if (!formData.gender)
        errors.gender = ["Gender is required"];
      if (!formData.address.trim())
        errors.address = ["Address is required"];
    } else if (activeTab === "employment") {
      if (!formData.employee_code.trim())
        errors.employee_code = ["Employee Code is required"];
      if (!formData.joining_date)
        errors.joining_date = ["Joining Date is required"];
      if (!formData.department_id)
        errors.department_id = ["Department is required"];
      if (!formData.designation_id)
        errors.designation_id = ["Designation is required"];
      if (!formData.employment_type)
        errors.employment_type = ["Employment Type is required"];
      if (!formData.status)
        errors.status = ["Status is required"];
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }, 100);
      }
      return false;
    }
    return true;
  };

  const goToNextTab = () => {
    if (validateCurrentTab()) {
      // Mark current tab as completed
      setCompletedTabs(prev => new Set([...prev, activeTab]));
      
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all tabs before submission
    let isValid = true;
    const allErrors = {};
    
    // Validate personal tab
    if (!formData.first_name.trim()) {
      allErrors.first_name = ["First Name is required"];
      isValid = false;
    }
    if (!formData.last_name.trim()) {
      allErrors.last_name = ["Last Name is required"];
      isValid = false;
    }
    if (!formData.personal_email.trim()) {
      allErrors.personal_email = ["Personal Email is required"];
      isValid = false;
    }
    
    // Validate employment tab
    if (!formData.employee_code.trim()) {
      allErrors.employee_code = ["Employee Code is required"];
      isValid = false;
    }
    if (!formData.department_id) {
      allErrors.department_id = ["Department is required"];
      isValid = false;
    }
    
    if (!isValid) {
      setFormErrors(allErrors);
      setActiveTab("personal");
      alert("Please fill in all required fields marked with *");
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    }
    if (organizationId) {
      data.append("organization_id", organizationId);
    }

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
        // Find the first tab with errors and switch to it
        const errorFields = Object.keys(error.response.data.errors);
        for (const tab of tabs) {
          const tabHasError = errorFields.some(field => 
            document.querySelector(`[name="${field}"]`)?.closest(`.tab-${tab.id}`)
          );
          if (tabHasError) {
            setActiveTab(tab.id);
            break;
          }
        }
        alert("Please correct the validation errors below.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFirstTab = activeTab === tabs[0].id;
  const isLastTab = activeTab === tabs[tabs.length - 1].id;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Debug Info Panel - Remove after testing */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Info</h3>
          <div className="text-sm grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Organization ID:</span> {organizationId || "None"}
            </div>
            <div>
              <span className="font-medium">Departments:</span> {departments.length}
              {departmentsLoading && <FaSpinner className="ml-2 animate-spin inline" />}
            </div>
            <div>
              <span className="font-medium">Current Dept:</span> {formData.department_id || "None"}
            </div>
            <div>
              <span className="font-medium">Designations:</span> {designations.length}
              {designationsLoading && <FaSpinner className="ml-2 animate-spin inline" />}
            </div>
            <div>
              <span className="font-medium">Managers:</span> {managers.length}
              {managersLoading && <FaSpinner className="ml-2 animate-spin inline" />}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard/employees")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            Back to Employees
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isEdit ? "Edit Employee" : "Add New Employee"}
          </h1>
          <p className="text-gray-600">
            {isEdit 
              ? "Update employee information" 
              : "Fill in the details to add a new employee to your organization"}
          </p>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  icon={tab.icon}
                  label={tab.label}
                  step={tab.step}
                  completed={completedTabs.has(tab.id)}
                />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {/* Tab Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600">
                {tabDescriptions[activeTab]}
              </p>
            </div>

            {/* Personal Information Tab */}
            <div className={`space-y-8 ${activeTab === "personal" ? "block" : "hidden"} tab-personal`}>
              <SectionHeader 
                title="Personal Information" 
                description="Basic personal details about the employee"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={formErrors.first_name}
                  required
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
                  placeholder="employee@company.com"
                />
                
                <InputField
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  error={formErrors.phone_number}
                  required
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
                  placeholder="-- Select --"
                />
                
                <div className="md:col-span-2">
                  <TextAreaField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={formErrors.address}
                    required
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Employment Tab */}
            <div className={`space-y-8 ${activeTab === "employment" ? "block" : "hidden"} tab-employment`}>
              <SectionHeader 
                title="Employment Details" 
                description="Employment information and work details"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Employee Code"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  error={formErrors.employee_code}
                  required
                  placeholder="e.g., EMP-001"
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
                  placeholder={departmentsLoading ? "Loading departments..." : "-- Select Department --"}
                  disabled={departmentsLoading || departments.length === 0}
                  loading={departmentsLoading}
                />
                
                <SelectField
                  label="Designation"
                  name="designation_id"
                  value={formData.designation_id}
                  onChange={handleChange}
                  options={designations}
                  error={formErrors.designation_id}
                  required
                  placeholder={
                    !formData.department_id 
                      ? "Select department first" 
                      : designationsLoading 
                        ? "Loading designations..." 
                        : "-- Select Designation --"
                  }
                  disabled={!formData.department_id || designationsLoading || designations.length === 0}
                  loading={designationsLoading}
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
                  placeholder="-- Select Type --"
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
                    { value: "Inactive", label: "Inactive" },
                  ]}
                  error={formErrors.status}
                  required
                  placeholder="-- Select Status --"
                />
                
                <div className="md:col-span-2">
                  <SelectField
                    label="Reporting Manager (Optional)"
                    name="reporting_manager_id"
                    value={formData.reporting_manager_id}
                    onChange={handleChange}
                    options={managers}
                    error={formErrors.reporting_manager_id}
                    placeholder={managersLoading ? "Loading managers..." : "-- Select Reporting Manager --"}
                    disabled={managersLoading}
                    loading={managersLoading}
                  />
                </div>
              </div>
            </div>

            {/* Financial Tab */}
            <div className={`space-y-8 ${activeTab === "financial" ? "block" : "hidden"} tab-financial`}>
              <SectionHeader 
                title="Financial & Legal Details" 
                description="Financial information and legal details (AU specific)"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Tax File Number (TFN)"
                  name="tax_file_number"
                  value={formData.tax_file_number}
                  onChange={handleChange}
                  error={formErrors.tax_file_number}
                  placeholder="Enter TFN"
                />
                
                <InputField
                  label="Superannuation Fund Name"
                  name="superannuation_fund_name"
                  value={formData.superannuation_fund_name}
                  onChange={handleChange}
                  error={formErrors.superannuation_fund_name}
                  placeholder="e.g., AustralianSuper"
                />
                
                <InputField
                  label="Superannuation Member Number"
                  name="superannuation_member_number"
                  value={formData.superannuation_member_number}
                  onChange={handleChange}
                  error={formErrors.superannuation_member_number}
                  placeholder="Enter member number"
                />
                
                <InputField
                  label="Bank BSB"
                  name="bank_bsb"
                  value={formData.bank_bsb}
                  onChange={handleChange}
                  error={formErrors.bank_bsb}
                  placeholder="000-000"
                />
                
                <InputField
                  label="Bank Account Number"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  error={formErrors.bank_account_number}
                  placeholder="Enter account number"
                />
                
                <InputField
                  label="Visa Type"
                  name="visa_type"
                  value={formData.visa_type}
                  onChange={handleChange}
                  error={formErrors.visa_type}
                  placeholder="e.g., Permanent Residency"
                />
                
                <div className="md:col-span-2">
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
            </div>

            {/* Emergency Contact Tab */}
            <div className={`space-y-8 ${activeTab === "emergency" ? "block" : "hidden"} tab-emergency`}>
              <SectionHeader 
                title="Emergency Contact" 
                description="Emergency contact details"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Emergency Contact Name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  error={formErrors.emergency_contact_name}
                  placeholder="Enter contact name"
                />
                
                <InputField
                  label="Emergency Contact Phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  error={formErrors.emergency_contact_phone}
                  placeholder="Enter contact phone number"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                {!isFirstTab && (
                  <button
                    type="button"
                    onClick={goToPreviousTab}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                  >
                    <FaArrowLeft className="text-sm" />
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/employees")}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                
                {!isLastTab ? (
                  <button
                    type="button"
                    onClick={goToNextTab}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    Next
                    <FaArrowLeft className="text-sm rotate-180" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isEdit ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <FaCheck className="text-sm" />
                        {isEdit ? "Update Employee" : "Create Employee"}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Required Fields Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <FaInfoCircle className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Note:</span> Fields marked with <span className="text-red-500">*</span> are required.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Please ensure all required fields are filled before submitting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}