import React, { useState, useEffect, useCallback } from "react";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronDown,
  HiArrowLeft,
  HiOutlineOfficeBuilding,
  HiX,
} from "react-icons/hi";

import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getDepartmentsByOrgId,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDesignationsByDeptId,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "../services/organizationService";

// Reusable Form Components (same as JobOpeningsPage)
const FormInput = ({ label, name, error, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={name}
      name={name}
      {...props}
      className={`mt-1 block w-full px-3 py-2 bg-white border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

const FormSelect = ({ label, name, error, children, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={name}
      name={name}
      {...props}
      className={`mt-1 block w-full px-3 py-2 bg-white border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm`}
    >
      {children}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

const FormTextarea = ({ label, name, error, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      {...props}
      className={`mt-1 block w-full px-3 py-2 bg-white border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm`}
    ></textarea>
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getOrganizations();
      setOrganizations(response.data?.data || []);
    } catch (err) {
      setError("Failed to fetch organizations.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleOpenEditModal = (org) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingOrg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (orgData) => {
    setIsSubmitting(true);
    try {
      if (editingOrg) {
        const response = await updateOrganization(editingOrg.id, orgData);
        if (selectedOrg && selectedOrg.id === editingOrg.id) {
          setSelectedOrg(
            response?.data?.data || { ...selectedOrg, ...orgData }
          );
        }
      } else {
        await createOrganization(orgData);
      }
      await fetchOrganizations();
      setIsModalOpen(false);
      setEditingOrg(null);
    } catch (err) {
      console.error("Failed to save organization:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (org) => {
    setOrgToDelete(org);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (orgToDelete) {
      try {
        await deleteOrganization(orgToDelete.id);
        if (selectedOrg && selectedOrg.id === orgToDelete.id) {
          setSelectedOrg(null);
        }
        await fetchOrganizations();
        setIsConfirmOpen(false);
        setOrgToDelete(null);
      } catch (err) {
        console.error("Failed to delete organization:", err);
      }
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto">
          {!selectedOrg ? (
            <OrganizationListView
              isLoading={isLoading}
              error={error}
              organizations={organizations}
              onSelectOrg={setSelectedOrg}
              onAdd={handleOpenAddModal}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteClick}
            />
          ) : (
            <OrganizationDetailView
              organization={selectedOrg}
              onBack={() => setSelectedOrg(null)}
              onEdit={handleOpenEditModal} 
            />
          )}
        </div>
      </div>

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrg(null);
        }}
        onSave={handleSave}
        organization={editingOrg}
        isSubmitting={isSubmitting}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setOrgToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Organization"
        message={`Are you sure you want to delete "${orgToDelete?.name}"? This action cannot be undone.`}
      />
    </>
  );
}

function OrganizationListView({
  isLoading,
  error,
  organizations,
  onSelectOrg,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Organizations</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-brand-blue text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition self-start sm:self-center"
        >
          <HiPlus /> Add Workspace
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && organizations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {organizations.map((org) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onSelectOrg={onSelectOrg}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <HiOutlineOfficeBuilding className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No organizations found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new organization.
            </p>
          </div>
        )
      )}
    </div>
  );
}

function OrganizationCard({ organization, onSelectOrg, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg group relative">
      {/* Primary blue colored status bar on the LEFT side */}
      <div className="absolute top-0 left-0 w-2 h-full bg-brand-blue"></div>
      
      <div className="p-6 pl-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2 truncate cursor-pointer hover:text-brand-blue transition">
              {organization.name}
            </h2>
            <p className="text-gray-600 mb-1 text-sm">{organization.registration_number}</p>
            <p className="text-sm text-gray-500 truncate">
              {organization.contact_email}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3 self-start sm:self-center flex-shrink-0">
            {/* Edit and Delete buttons positioned above View Details */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(organization)}
                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                title="Edit Organization"
              >
                <HiPencil />
              </button>
              <button
                onClick={() => onDelete(organization)}
                className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                title="Delete Organization"
              >
                <HiTrash />
              </button>
            </div>
            
            {/* View Details button at the bottom */}
            <button
              onClick={() => onSelectOrg(organization)}
              className="text-sm font-semibold text-brand-blue hover:underline transition-colors"
            >
              View Details &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrganizationDetailView({ organization, onBack, onEdit }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-brand-blue hover:underline mb-6 font-semibold"
      >
        <HiArrowLeft /> Back to Organizations
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 relative">
        {/* Primary blue colored status bar on the LEFT side */}
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-blue"></div>
        
        <div className="pl-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                {organization.name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-gray-600">
                <p><strong>Reg. Number:</strong> {organization.registration_number || 'Not specified'}</p>
                <p><strong>Email:</strong> {organization.contact_email || 'Not specified'}</p>
                <p><strong>Phone:</strong> {organization.contact_phone || 'Not specified'}</p>
                <p><strong>Industry:</strong> {organization.industry_type || 'Not specified'}</p>
                <p className="md:col-span-2"><strong>Address:</strong> {organization.address || 'Not specified'}</p>
              </div>
            </div>
            <button
              onClick={() => onEdit(organization)}
              className="flex-shrink-0 flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition self-start sm:self-auto"
            >
              <HiPencil /> Edit Details
            </button>
          </div>
        </div>
      </div>

      <DepartmentsManager orgId={organization.id} />
    </div>
  );
}

function DepartmentsManager({ orgId }) {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getDepartmentsByOrgId(orgId);
      setDepartments(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch departments", error);
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchDepts();
  }, [fetchDepts]);

  const handleSave = async (deptData) => {
    setIsSubmitting(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, deptData);
      } else {
        await createDepartment(orgId, deptData);
      }
      await fetchDepts();
      setIsModalOpen(false);
      setEditingDept(null);
    } catch (error) {
      console.error("Failed to save department", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deptToDelete) {
      try {
        await deleteDepartment(deptToDelete.id);
        await fetchDepts();
        setIsConfirmOpen(false);
        setDeptToDelete(null);
      } catch (error) {
        console.error("Failed to delete department", error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
        <button
          onClick={() => {
            setEditingDept(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-blue text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition"
        >
          <HiPlus /> Add Department
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {departments.map((dept) => (
            <DepartmentItem
              key={dept.id}
              department={dept}
              onEdit={() => {
                setEditingDept(dept);
                setIsModalOpen(true);
              }}
              onDelete={() => {
                setDeptToDelete(dept);
                setIsConfirmOpen(true);
              }}
            />
          ))}
          {departments.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <HiOutlineOfficeBuilding className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
              <p className="mt-1 text-sm text-gray-500">Add a department to get started.</p>
            </div>
          )}
        </div>
      )}

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        department={editingDept}
        isSubmitting={isSubmitting}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${deptToDelete?.name}"?`}
      />
    </div>
  );
}

function DepartmentItem({ department, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg group relative">
      {/* Primary blue colored status bar on the LEFT side */}
      <div className="absolute top-0 left-0 w-2 h-full bg-brand-blue"></div>
      
      <div className="p-6 pl-8">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-bold text-gray-900">{department.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{department.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                title="Edit Department"
              >
                <HiPencil />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete Department"
              >
                <HiTrash />
              </button>
            </div>
            <HiChevronDown
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
        {isOpen && <DesignationsList departmentId={department.id} />}
      </div>
    </div>
  );
}

function DesignationsList({ departmentId }) {
  const [designations, setDesignations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesig, setEditingDesig] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [desigToDelete, setDesigToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDesigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getDesignationsByDeptId(departmentId);
      setDesignations(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch designations", error);
      setDesignations([]);
    } finally {
      setIsLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchDesigs();
  }, [fetchDesigs]);

  const handleSave = async (desigData) => {
    setIsSubmitting(true);
    try {
      if (editingDesig) {
        await updateDesignation(editingDesig.id, desigData);
      } else {
        await createDesignation(departmentId, desigData);
      }
      await fetchDesigs();
      setIsModalOpen(false);
      setEditingDesig(null);
    } catch (err) {
      console.error("Failed to save designation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (desigToDelete) {
      try {
        await deleteDesignation(desigToDelete.id);
        await fetchDesigs();
        setIsConfirmOpen(false);
        setDesigToDelete(null);
      } catch (err) {
        console.error("Failed to delete designation", err);
      }
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-md font-semibold text-gray-700">Designations</h4>
        <button
          onClick={() => {
            setEditingDesig(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 text-sm bg-brand-blue text-white font-semibold py-1 px-3 rounded-full hover:opacity-90 transition"
        >
          <HiPlus /> Add Designation
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
        </div>
      ) : (
        <ul className="space-y-2">
          {designations.map((desig) => (
            <li
              key={desig.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition"
            >
              <div>
                <p className="font-semibold text-gray-800">{desig.title}</p>
                <p className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full inline-block">
                  {desig.level}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingDesig(desig);
                    setIsModalOpen(true);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                  title="Edit Designation"
                >
                  <HiPencil />
                </button>
                <button
                  onClick={() => {
                    setDesigToDelete(desig);
                    setIsConfirmOpen(true);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete Designation"
                >
                  <HiTrash />
                </button>
              </div>
            </li>
          ))}
          {designations.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No designations found.</p>
          )}
        </ul>
      )}

      <DesignationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        designation={editingDesig}
        isSubmitting={isSubmitting}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Designation"
        message={`Are you sure you want to delete "${desigToDelete?.title}"?`}
      />
    </div>
  );
}

function OrganizationModal({
  isOpen,
  onClose,
  onSave,
  organization,
  isSubmitting,
}) {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    setFormData(
      organization || {
        name: "",
        registration_number: "",
        address: "",
        contact_email: "",
        contact_phone: "",
        industry_type: "",
        timezone: "Asia/Kolkata",
      }
    );
  }, [organization, isOpen]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {organization ? "Edit Organization" : "Add New Organization"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <HiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <FormInput
                  label="Organization Name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              
              <FormInput
                label="Registration Number"
                name="registration_number"
                value={formData.registration_number || ""}
                onChange={handleChange}
                placeholder="Enter registration number"
              />
              
              <FormInput
                label="Industry Type"
                name="industry_type"
                value={formData.industry_type || ""}
                onChange={handleChange}
                placeholder="Enter industry type"
              />
              
              <FormInput
                type="email"
                label="Contact Email"
                name="contact_email"
                value={formData.contact_email || ""}
                onChange={handleChange}
                placeholder="Enter contact email"
                required
              />
              
              <FormInput
                label="Contact Phone"
                name="contact_phone"
                value={formData.contact_phone || ""}
                onChange={handleChange}
                placeholder="Enter contact phone"
              />
              
              <FormInput
                label="Timezone"
                name="timezone"
                value={formData.timezone || "Asia/Kolkata"}
                onChange={handleChange}
                placeholder="Enter timezone"
              />
              
              <div className="sm:col-span-2">
                <FormTextarea
                  label="Address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              {isSubmitting
                ? organization
                  ? "Saving..."
                  : "Creating..."
                : organization
                ? "Save Changes"
                : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DepartmentModal({
  isOpen,
  onClose,
  onSave,
  department,
  isSubmitting,
}) {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    setFormData(department || { name: "", description: "" });
  }, [department, isOpen]);
  
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {department ? "Edit Department" : "Add New Department"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <HiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-4">
              <FormInput
                label="Department Name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Enter department name"
                required
              />
              
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter department description"
                rows="3"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              {isSubmitting
                ? department
                  ? "Saving..."
                  : "Creating..."
                : department
                ? "Save Changes"
                : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DesignationModal({
  isOpen,
  onClose,
  onSave,
  designation,
  isSubmitting,
}) {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    setFormData(designation || { title: "", level: "Junior" });
  }, [designation, isOpen]);
  
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {designation ? "Edit Designation" : "Add New Designation"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <HiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-4">
              <FormInput
                label="Designation Title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Enter designation title"
                required
              />
              
              <FormSelect
                label="Level"
                name="level"
                value={formData.level || "Junior"}
                onChange={handleChange}
              >
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
              </FormSelect>
            </div>
          </div>

          <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              {isSubmitting
                ? designation
                  ? "Saving..."
                  : "Creating..."
                : designation
                ? "Save Changes"
                : "Create Designation"}
            </button>
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
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrganizationsPage;