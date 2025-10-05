import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEmployee } from '../../services/employeeService.js';
import { FaUser, FaBriefcase, FaBuilding, FaPhone, FaEnvelope, FaBirthdayCake, FaMapMarkerAlt, FaFileContract, FaUniversity, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

// Helper component for displaying a detail field
const DetailField = ({ icon, label, value, className = '' }) => (
  <div className={`flex items-start py-2 ${className}`}>
    <div className="text-gray-500 mr-4 mt-1 text-lg">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
      <p className="text-md text-gray-900">{value || <span className="text-gray-400">Not Provided</span>}</p>
    </div>
  </div>
);

// Helper component for section cards
const ProfileSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-100 pb-2">{title}</h2>
        {children}
    </div>
);

export default function EmployeeProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            setLoading(true);
            try {
                const { data } = await getEmployee(id);
                setEmployee(data.data); // API response is nested under 'data'
            } catch (error) {
                console.error("Failed to fetch employee", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployeeData();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-lg">Loading employee profile...</div>;
    if (!employee) return <div className="p-8 text-center text-lg text-red-500">Employee not found.</div>;

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-full font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                 <button onClick={() => navigate('/dashboard/employees')} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-semibold">
                    <FaArrowLeft /> Back to Employee List
                </button>
            
                {/* Header Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 text-4xl font-bold">
                        {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-gray-900">{employee.first_name} {employee.last_name}</h1>
                        <p className="text-lg text-gray-600 mt-1">{employee.designation?.name} | {employee.department?.name}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <Link to={`/dashboard/employees/edit/${id}`} className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all">Edit Profile</Link>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <ProfileSection title="Personal Information">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                <DetailField icon={<FaEnvelope />} label="Email Address" value={employee.personal_email} />
                                <DetailField icon={<FaPhone />} label="Phone Number" value={employee.phone_number} />
                                <DetailField icon={<FaBirthdayCake />} label="Date of Birth" value={employee.date_of_birth} />
                                <DetailField icon={<FaUser />} label="Gender" value={employee.gender} />
                                <DetailField icon={<FaMapMarkerAlt />} label="Address" value={employee.address} className="sm:col-span-2" />
                            </div>
                        </ProfileSection>

                        <ProfileSection title="Financial & Legal Details (AU)">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                <DetailField icon={<FaUniversity />} label="Tax File Number (TFN)" value={employee.tax_file_number} />
                                <DetailField icon={<FaUniversity />} label="Superannuation Fund" value={employee.superannuation_fund_name} />
                                <DetailField icon={<FaUniversity />} label="Super Member #" value={employee.superannuation_member_number} />
                                <DetailField icon={<FaUniversity />} label="Bank BSB" value={employee.bank_bsb} />
                                <DetailField icon={<FaUniversity />} label="Bank Account #" value={employee.bank_account_number} />
                                <DetailField icon={<FaUniversity />} label="Visa Type" value={employee.visa_type} />
                                <DetailField icon={<FaUniversity />} label="Visa Expiry" value={employee.visa_expiry_date} />
                            </div>
                        </ProfileSection>
                    </div>
                    
                    <div className="space-y-8">
                        <ProfileSection title="Employment Details">
                            <DetailField icon={<FaBuilding />} label="Department" value={employee.department?.name} />
                            <DetailField icon={<FaBriefcase />} label="Designation" value={employee.designation?.name} />
                            <DetailField icon={<FaUser />} label="Reporting Manager" value={employee.reporting_manager ? `${employee.reporting_manager.first_name} ${employee.reporting_manager.last_name}`: null} />
                            <DetailField icon={<FaFileContract />} label="Joining Date" value={employee.joining_date} />
                            <DetailField icon={<FaFileContract />} label="Employment Type" value={employee.employment_type} />
                             <div className="pt-2">
                                <p className="text-sm font-semibold text-gray-600 mb-2">Status</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {employee.status}
                                </span>
                             </div>
                        </ProfileSection>

                        <ProfileSection title="Emergency Contact">
                            <DetailField icon={<FaExclamationTriangle />} label="Contact Name" value={employee.emergency_contact_name} />
                            <DetailField icon={<FaPhone />} label="Contact Phone" value={employee.emergency_contact_phone} />
                        </ProfileSection>
                    </div>
                </div>
            </div>
        </div>
    );
}

