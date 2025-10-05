import React, { useEffect, useState } from "react";
import { createEmployee, getEmployee, updateEmployee } from "../../services/employeeService.js";
import { useNavigate, useParams } from "react-router-dom";
import { FaUser, FaBriefcase, FaUniversity, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

// Reusable Input Component
const InputField = ({ label, name, value, onChange, type = "text", required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <input type={type} id={name} name={name} value={value || ''} onChange={onChange} required={required}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

// Reusable Select Component
const SelectField = ({ label, name, value, onChange, options, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <select id={name} name={name} value={value || ''} onChange={onChange} required={required}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">-- Select --</option>
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
    </div>
);

export default function EmployeeForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        // IDs - In a real app, these might be set differently
        organization_id: '1', user_id: '1', applicant_id: '',
        
        // Personal Info
        first_name: '', last_name: '', personal_email: '', date_of_birth: '',
        gender: '', phone_number: '', address: '',

        // Job Details
        department_id: '', designation_id: '', reporting_manager_id: '',
        employee_code: '', joining_date: '', employment_type: '', status: 'On Probation',

        // Financial & Legal
        tax_file_number: '', superannuation_fund_name: '', superannuation_member_number: '',
        bank_bsb: '', bank_account_number: '', visa_type: '', visa_expiry_date: '',

        // Emergency Contact
        emergency_contact_name: '', emergency_contact_phone: '',
    });

    // --- DUMMY DATA for dropdowns ---
    // In a real app, you would fetch this data from your API.
    const [departments, setDepartments] = useState([
        { value: '1', label: 'Technology' },
        { value: '2', label: 'Human Resources' },
        { value: '3', label: 'Marketing' }
    ]);
    const [designations, setDesignations] = useState([
        { value: '1', label: 'Software Engineer' },
        { value: '2', label: 'HR Manager' },
        { value: '3', label: 'Digital Marketer' }
    ]);
    const [managers, setManagers] = useState([
        { value: '1', label: 'John Doe (CEO)' },
        { value: '2', label: 'Jane Smith (CTO)' }
    ]);
    // --- End of Dummy Data ---

    useEffect(() => {
        // Here you would fetch the data for the dropdowns from your API
        // e.g., getDepartments().then(res => setDepartments(res.data));
    }, []);


    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            getEmployee(id)
                .then(({ data }) => setFormData(data.data))
                .catch(err => console.error("Failed to fetch employee", err))
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({...prev, [name]: null}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormErrors({});

        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key] === null ? '' : formData[key]);
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
                alert("Please correct the form errors.");
            } else {
                alert("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    const tabs = [
        { id: 'personal', label: 'Personal Information', icon: <FaUser /> },
        { id: 'job', label: 'Employment Details', icon: <FaBriefcase /> },
        { id: 'financial', label: 'Financial & Legal', icon: <FaUniversity /> },
        { id: 'emergency', label: 'Emergency Contact', icon: <FaExclamationTriangle /> },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-full font-sans">
            <div className="max-w-5xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-semibold">
                    <FaArrowLeft /> Back
                </button>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{isEdit ? "Edit Employee" : "Add New Employee"}</h1>
                <p className="text-gray-600 mb-6">Fill in the details below. Required fields are marked with *</p>

                <div className="bg-white rounded-xl shadow-lg">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px p-2" aria-label="Tabs">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 w-1/4 justify-center py-4 px-1 border-b-2 font-medium text-sm transition-all
                                    ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    {tab.icon} <span className="hidden md:inline">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className={activeTab === 'personal' ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                <InputField label="Personal Email" name="personal_email" type="email" value={formData.personal_email} onChange={handleChange} required />
                                <InputField label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
                                <InputField label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required />
                                <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} required />
                                <div className="md:col-span-2">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address*</label>
                                    <textarea id="address" name="address" rows="3" value={formData.address} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                                </div>
                            </div>
                        </div>

                        <div className={activeTab === 'job' ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Employee Code" name="employee_code" value={formData.employee_code} onChange={handleChange} required />
                                <InputField label="Joining Date" name="joining_date" type="date" value={formData.joining_date} onChange={handleChange} required />
                                <SelectField label="Department" name="department_id" value={formData.department_id} onChange={handleChange} options={departments} required />
                                <SelectField label="Designation" name="designation_id" value={formData.designation_id} onChange={handleChange} options={designations} required />
                                <SelectField label="Employment Type" name="employment_type" value={formData.employment_type} onChange={handleChange} options={[{ value: 'Full-time', label: 'Full-time' }, { value: 'Part-time', label: 'Part-time' }, { value: 'Contract', label: 'Contract' }, { value: 'Internship', label: 'Internship' }]} required />
                                <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={[{ value: 'Active', label: 'Active' }, { value: 'On Probation', label: 'On Probation' }, { value: 'On Leave', label: 'On Leave' }, { value: 'Terminated', label: 'Terminated' }]} required />
                                <div className="md:col-span-2">
                                    <SelectField label="Reporting Manager" name="reporting_manager_id" value={formData.reporting_manager_id} onChange={handleChange} options={managers} />
                                </div>
                            </div>
                        </div>

                        <div className={activeTab === 'financial' ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <InputField label="Tax File Number (TFN)" name="tax_file_number" value={formData.tax_file_number} onChange={handleChange} />
                                 <InputField label="Superannuation Fund Name" name="superannuation_fund_name" value={formData.superannuation_fund_name} onChange={handleChange} />
                                 <InputField label="Superannuation Member #" name="superannuation_member_number" value={formData.superannuation_member_number} onChange={handleChange} />
                                 <InputField label="Bank BSB" name="bank_bsb" value={formData.bank_bsb} onChange={handleChange} />
                                 <InputField label="Bank Account #" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} />
                                 <InputField label="Visa Type" name="visa_type" value={formData.visa_type} onChange={handleChange} />
                                 <InputField label="Visa Expiry Date" name="visa_expiry_date" type="date" value={formData.visa_expiry_date} onChange={handleChange} />
                            </div>
                        </div>

                        <div className={activeTab === 'emergency' ? 'block' : 'hidden'}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <InputField label="Emergency Contact Name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
                                 <InputField label="Emergency Contact Phone" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 mt-6 flex justify-end gap-4">
                            <button type="button" onClick={() => navigate('/dashboard/employees')} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 transition-all">
                                {loading ? 'Saving...' : (isEdit ? 'Update Employee' : 'Create Employee')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

