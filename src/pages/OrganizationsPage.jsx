import React, { useState, useEffect, useCallback } from "react";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronDown,
  HiArrowLeft,
  HiOutlineOfficeBuilding,
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

// --- Main Page Component ---
function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);

  // organization modals / edit state
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
        // update selectedOrg immediately if we're viewing it
        if (selectedOrg && selectedOrg.id === editingOrg.id) {
          setSelectedOrg(response?.data?.data || { ...selectedOrg, ...orgData });
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
        // if currently viewing that org, go back
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
          {/* show either list or detail - but DO NOT return early so modals render below */}
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
              onEdit={handleOpenEditModal} // pass handler directly
            />
          )}
        </div>
      </div>

      {/* Modals always rendered at top level so they work from either view */}
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

// --- View 1: List of all organizations ---
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

      {isLoading && <p>Loading organizations...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && organizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition transform hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 truncate">
                  {org.name}
                </h2>
                <p className="text-gray-600 mb-1">{org.registration_number}</p>
                <p className="text-sm text-gray-500 truncate">{org.contact_email}</p>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(org)}
                    className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
                  >
                    <HiPencil />
                  </button>
                  <button
                    onClick={() => onDelete(org)}
                    className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full"
                  >
                    <HiTrash />
                  </button>
                </div>
                <button
                  onClick={() => onSelectOrg(org)}
                  className="text-sm font-semibold text-brand-blue hover:underline"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <HiOutlineOfficeBuilding className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new organization.</p>
          </div>
        )
      )}
    </div>
  );
}

// --- View 2: Detailed view for a single organization ---
function OrganizationDetailView({ organization, onBack, onEdit }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-brand-blue hover:underline mb-4 font-semibold"
      >
        <HiArrowLeft /> Back to Organizations
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{organization.name}</h1>
            <p className="text-gray-500 mt-1"><strong>Reg. Number:</strong> {organization.registration_number}</p>
            <p className="text-gray-500"><strong>Address:</strong> {organization.address}</p>
            <p className="text-gray-500"><strong>Email:</strong> {organization.contact_email}</p>
            <p className="text-gray-500"><strong>Phone:</strong> {organization.contact_phone}</p>
            <p className="text-gray-500"><strong>Industry:</strong> {organization.industry_type}</p>
          </div>

          {/* IMPORTANT: call onEdit with the current org so the top-level modal opens */}
          <button
            onClick={() => onEdit(organization)}
            className="flex-shrink-0 flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition self-start sm:self-auto"
          >
            <HiPencil /> Edit Details
          </button>
        </div>
      </div>

      <DepartmentsManager orgId={organization.id} />
    </div>
  );
}

// --- Component to manage Departments (unchanged logic) ---
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
        <button
          onClick={() => {
            setEditingDept(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition"
        >
          <HiPlus /> Add Department
        </button>
      </div>

      {isLoading ? (
        <p>Loading departments...</p>
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

// --- Individual Department Item ---
function DepartmentItem({ department, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-bold text-gray-900">{department.name}</h3>
          <p className="text-gray-600 text-sm">{department.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800"
            >
              <HiPencil />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600"
            >
              <HiTrash />
            </button>
          </div>
          <HiChevronDown className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>
      {isOpen && <DesignationsList departmentId={department.id} />}
    </div>
  );
}

// --- List of Designations within a Department ---
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
    <div className="border-t border-gray-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-md font-semibold text-gray-700">Designations</h4>
        <button
          onClick={() => {
            setEditingDesig(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 text-sm bg-blue-100 text-blue-800 font-semibold py-1 px-3 rounded-full hover:bg-blue-200 transition"
        >
          <HiPlus /> Add
        </button>
      </div>

      {isLoading ? (
        <p>Loading designations...</p>
      ) : (
        <ul className="space-y-2">
          {designations.map((desig) => (
            <li key={desig.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
              <div>
                <p className="font-semibold text-gray-800">{desig.title}</p>
                <p className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full inline-block">{desig.level}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingDesig(desig);
                    setIsModalOpen(true);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                >
                  <HiPencil />
                </button>
                <button
                  onClick={() => {
                    setDesigToDelete(desig);
                    setIsConfirmOpen(true);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500"
                >
                  <HiTrash />
                </button>
              </div>
            </li>
          ))}
          {designations.length === 0 && <p className="text-sm text-gray-500">No designations found.</p>}
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

// --- Modals ---
function OrganizationModal({ isOpen, onClose, onSave, organization, isSubmitting }) {
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

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{organization ? "Edit Workspace" : "Add New Organization"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" value={formData.name || ""} onChange={handleChange} placeholder="Organization Name" className="w-full p-3 border rounded-lg" required />
            <input name="registration_number" value={formData.registration_number || ""} onChange={handleChange} placeholder="Registration Number" className="w-full p-3 border rounded-lg" />
            <input type="email" name="contact_email" value={formData.contact_email || ""} onChange={handleChange} placeholder="Contact Email" className="w-full p-3 border rounded-lg" required />
            <input name="contact_phone" value={formData.contact_phone || ""} onChange={handleChange} placeholder="Contact Phone" className="w-full p-3 border rounded-lg" />
            <input name="industry_type" value={formData.industry_type || ""} onChange={handleChange} placeholder="Industry Type" className="w-full p-3 border rounded-lg" />
            <input name="timezone" value={formData.timezone || ""} onChange={handleChange} placeholder="Timezone" className="w-full p-3 border rounded-lg" />
            <input name="address" value={formData.address || ""} onChange={handleChange} placeholder="Address" className="sm:col-span-2 w-full p-3 border rounded-lg" />
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-brand-blue text-white rounded-lg">
              {isSubmitting ? (organization ? "Saving..." : "Creating...") : (organization ? "Save Changes" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function DepartmentModal({ isOpen, onClose, onSave, department, isSubmitting }) {
  const [formData, setFormData] = useState({});
  useEffect(() => {
    setFormData(department || { name: "", description: "" });
  }, [department, isOpen]);
  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{department ? "Edit Department" : "Add New Department"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input name="name" value={formData.name || ""} onChange={handleChange} placeholder="Department Name" className="w-full p-3 border rounded-lg" required />
            <textarea name="description" value={formData.description || ""} onChange={handleChange} placeholder="Description" className="w-full p-3 border rounded-lg" rows="3"></textarea>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-green-600 text-white rounded-lg">
              {isSubmitting ? (department ? "Saving..." : "Creating...") : (department ? "Save Changes" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function DesignationModal({ isOpen, onClose, onSave, designation, isSubmitting }) {
  const [formData, setFormData] = useState({});
  useEffect(() => {
    setFormData(designation || { title: "", level: "Junior" });
  }, [designation, isOpen]);
  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{designation ? "Edit Designation" : "Add New Designation"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input name="title" value={formData.title || ""} onChange={handleChange} placeholder="Designation Title" className="w-full p-3 border rounded-lg" required />
            <select name="level" value={formData.level || "Junior"} onChange={handleChange} className="w-full p-3 border rounded-lg">
              <option>Junior</option>
              <option>Mid</option>
              <option>Senior</option>
            </select>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-blue-600 text-white rounded-lg">
              {isSubmitting ? (designation ? "Saving..." : "Creating...") : (designation ? "Save Changes" : "Create")}
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
          <button onClick={onClose} className="py-2 px-4 bg-gray-200 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="py-2 px-4 bg-red-600 text-white rounded-lg">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default OrganizationsPage;
