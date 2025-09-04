import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiChevronDown, HiArrowLeft, HiOutlineOfficeBuilding } from 'react-icons/hi';

// --- Mock Data ---
// In a real app, this data would come from your API.
let MOCK_ORGANIZATIONS = [
    { id: 1, name: 'Khan Innovations', registration_number: 'ABN 111222333', address: '123 Innovation Dr, Lucknow', contact_email: 'khaninnovations.com' },
    { id: 2, name: 'Tabrej Tech', registration_number: 'ACN 444555666', address: '456 Tech Park, Mumbai', contact_email: 'gmail@tech.com' },
    { id: 3, name: 'Farhan Solutions', registration_number: 'ACN 777888999', address: '789 Silicon Ave, Bangalore', contact_email: 'gmail@solutions.com' },
];
let MOCK_DEPARTMENTS = {
    1: [
        { id: 101, organization_id: 1, name: 'Software Development', description: 'Core product engineering and architecture.' },
        { id: 102, organization_id: 1, name: 'Human Resources', description: 'Manages company culture and personnel.' },
    ],
    2: [ { id: 103, organization_id: 2, name: 'Cloud Services', description: 'Manages all cloud infrastructure.' }, ],
    3: [],
};
let MOCK_DESIGNATIONS = {
    101: [
        { id: 1001, department_id: 101, title: 'Lead Software Developer', level: 'Senior' },
        { id: 1002, department_id: 101, title: 'Jr. Software Developer', level: 'Junior' },
    ],
    102: [ { id: 1003, department_id: 102, title: 'HR Manager', level: 'Manager' } ],
    103: [],
};
let nextOrgId = 4;
let nextDeptId = 104;
let nextDesigId = 1004;

// --- Main Page Component ---
function OrganizationsPage() {
    const [organizations, setOrganizations] = useState(MOCK_ORGANIZATIONS);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);

    const handleSave = (orgData) => {
        if (editingOrg) {
            const updated = organizations.map(o => o.id === editingOrg.id ? {...o, ...orgData} : o);
            setOrganizations(updated);
            MOCK_ORGANIZATIONS = updated;
        } else {
            const newOrg = { ...orgData, id: nextOrgId++ };
            const updated = [...organizations, newOrg];
            setOrganizations(updated);
            MOCK_ORGANIZATIONS = updated;
        }
        setIsModalOpen(false);
        setEditingOrg(null);
    };
    
    if (selectedOrg) {
        return <OrganizationDetailView organization={selectedOrg} onBack={() => setSelectedOrg(null)} />;
    }

    return (
        <>
            <OrganizationListView 
                organizations={organizations} 
                onSelectOrg={setSelectedOrg}
                onAdd={() => { setEditingOrg(null); setIsModalOpen(true); }}
                onEdit={(org) => { setEditingOrg(org); setIsModalOpen(true); }}
            />
            <OrganizationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} organization={editingOrg} />
        </>
    );
}

// --- View 1: List of all organizations ---
function OrganizationListView({ organizations, onSelectOrg, onAdd, onEdit }) {
    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Organizations</h1>
                    <button onClick={onAdd} className="flex items-center gap-2 bg-brand-blue text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition self-start sm:self-center">
                        <HiPlus /> Add Organization
                    </button>
                </div>
                {organizations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {organizations.map(org => (
                             <div key={org.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition transform hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between">
                                <div onClick={() => onSelectOrg(org)} className="block p-6 cursor-pointer">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2 truncate">{org.name}</h2>
                                    <p className="text-gray-600 mb-1">{org.registration_number}</p>
                                    <p className="text-sm text-gray-500 truncate">{org.contact_email}</p>
                                </div>
                                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-brand-blue">View Details &rarr;</span>
                                    <button onClick={() => onEdit(org)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <HiPencil />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <HiOutlineOfficeBuilding className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new organization.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- View 2: Detailed view for a single organization ---
function OrganizationDetailView({ organization, onBack }) {
    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto">
                <button onClick={onBack} className="flex items-center gap-2 text-brand-blue hover:underline mb-4 font-semibold">
                    <HiArrowLeft /> Back to Organizations
                </button>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{organization.name}</h1>
                            <p className="text-gray-500 mt-1">{organization.registration_number}</p>
                            <p className="text-gray-500">{organization.address}</p>
                            <p className="text-gray-500">{organization.contact_email}</p>
                        </div>
                        <button className="flex-shrink-0 flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition self-start sm:self-auto">
                            <HiPencil /> Edit Details
                        </button>
                    </div>
                </div>
                <DepartmentsManager orgId={organization.id} />
            </div>
        </div>
    );
}

// --- Component to manage Departments ---
function DepartmentsManager({ orgId }) {
    const [departments, setDepartments] = useState(MOCK_DEPARTMENTS[orgId] || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [deptToDelete, setDeptToDelete] = useState(null);

    const handleSave = (deptData) => {
        let updatedDepts;
        if (editingDept) {
            updatedDepts = departments.map(d => d.id === editingDept.id ? {...d, ...deptData} : d);
        } else {
            const newDept = { ...deptData, id: nextDeptId++, organization_id: orgId };
            updatedDepts = [...departments, newDept];
        }
        setDepartments(updatedDepts);
        MOCK_DEPARTMENTS[orgId] = updatedDepts;
        setIsModalOpen(false);
        setEditingDept(null);
    };

    const handleDelete = () => {
        if (deptToDelete) {
            const updatedDepts = departments.filter(d => d.id !== deptToDelete.id);
            setDepartments(updatedDepts);
            MOCK_DEPARTMENTS[orgId] = updatedDepts;
            setIsConfirmOpen(false);
            setDeptToDelete(null);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
                <button onClick={() => { setEditingDept(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition">
                    <HiPlus /> Add Department
                </button>
            </div>
            <div className="space-y-4">
                {departments.map(dept => (
                    <DepartmentItem 
                        key={dept.id} 
                        department={dept} 
                        onEdit={() => { setEditingDept(dept); setIsModalOpen(true); }} 
                        onDelete={() => { setDeptToDelete(dept); setIsConfirmOpen(true); }}
                    />
                ))}
            </div>
            <DepartmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} department={editingDept} />
            <ConfirmationModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)} 
                onConfirm={handleDelete}
                title="Delete Department"
                message={`Are you sure you want to delete the "${deptToDelete?.name}" department?`}
            />
        </div>
    );
}

// --- Individual Department Item ---
function DepartmentItem({ department, onEdit, onDelete }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white rounded-xl shadow-lg">
            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{department.name}</h3>
                    <p className="text-gray-600 text-sm">{department.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800"><HiPencil /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600"><HiTrash /></button>
                    <HiChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && <DesignationsList departmentId={department.id} />}
        </div>
    );
}

// --- List of Designations within a Department ---
function DesignationsList({ departmentId }) {
    const [designations, setDesignations] = useState(MOCK_DESIGNATIONS[departmentId] || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDesig, setEditingDesig] = useState(null);

    const handleSave = (desigData) => {
        let updatedDesigs;
        if (editingDesig) {
            updatedDesigs = designations.map(d => d.id === editingDesig.id ? {...d, ...desigData} : d);
        } else {
            const newDesig = { ...desigData, id: nextDesigId++, department_id: departmentId };
            updatedDesigs = [...designations, newDesig];
        }
        setDesignations(updatedDesigs);
        MOCK_DESIGNATIONS[departmentId] = updatedDesigs;
        setIsModalOpen(false);
        setEditingDesig(null);
    };

    return (
        <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-semibold text-gray-700">Designations</h4>
                <button onClick={() => { setEditingDesig(null); setIsModalOpen(true); }} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-800 font-semibold py-1 px-3 rounded-full hover:bg-blue-200 transition">
                    <HiPlus /> Add
                </button>
            </div>
            <ul className="space-y-2">
                {designations.map(desig => (
                    <li key={desig.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-800">{desig.title}</p>
                            <p className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full inline-block">{desig.level}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => { setEditingDesig(desig); setIsModalOpen(true); }} className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700"><HiPencil /></button>
                            <button className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500"><HiTrash /></button>
                        </div>
                    </li>
                ))}
                {designations.length === 0 && <p className="text-sm text-gray-500">No designations found.</p>}
            </ul>
            <DesignationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} designation={editingDesig} />
        </div>
    );
}

// --- Modals for Forms and Confirmations ---
function OrganizationModal({ isOpen, onClose, onSave, organization }) {
    const [formData, setFormData] = useState({});
    useEffect(() => {
        setFormData(organization || { name: '', registration_number: '', address: '', contact_email: '' });
    }, [organization, isOpen]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{organization ? 'Edit Organization' : 'Add New Organization'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Organization Name" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                        <input name="registration_number" value={formData.registration_number || ''} onChange={handleChange} placeholder="Registration Number" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                        <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                        <input type="email" name="contact_email" value={formData.contact_email || ''} onChange={handleChange} placeholder="Contact Email" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-brand-blue text-white rounded-lg hover:opacity-90 transition">{organization ? 'Save Changes' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function DepartmentModal({ isOpen, onClose, onSave, department }) {
    const [formData, setFormData] = useState({});
    useEffect(() => {
        setFormData(department || { name: '', description: '' });
    }, [department, isOpen]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{department ? 'Edit Department' : 'Add New Department'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Department Name" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" rows="3"></textarea>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-green-600 text-white rounded-lg hover:opacity-90 transition">{department ? 'Save Changes' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DesignationModal({ isOpen, onClose, onSave, designation }) {
    const [formData, setFormData] = useState({});
    useEffect(() => {
        setFormData(designation || { title: '', level: 'Entry' });
    }, [designation, isOpen]);
    
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{designation ? 'Edit Designation' : 'Add New Designation'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input name="title" value={formData.title || ''} onChange={handleChange} placeholder="Designation Title" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                        <select name="level" value={formData.level || 'Entry'} onChange={handleChange} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue">
                            <option>Entry</option>
                            <option>Junior</option>
                            <option>Senior</option>
                            <option>Manager</option>
                        </select>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:opacity-90 transition">{designation ? 'Save Changes' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                    <button onClick={onConfirm} className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default OrganizationsPage;

