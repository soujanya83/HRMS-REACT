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

// Timezone data with Australian timezones prioritized
const TIMEZONES = [
  // Australian timezones (prioritized)
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Perth",
  "Australia/Adelaide",
  "Australia/Canberra",
  "Australia/Hobart",
  "Australia/Darwin",
  // Other timezones
  "Pacific/Auckland",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Africa/Johannesburg",
  "Africa/Cairo",
];

// Industry types with childcare-related options prioritized
const INDUSTRY_TYPES = [
  // Childcare related (prioritized)
  "Child Care Center",
  "Preschool",
  "Daycare",
  "Early Learning Center",
  "Kindergarten",
  "Nursery School",
  "Montessori School",
  "Family Day Care",
  "After School Care",
  "Child Development Center",
  // Other related industries
  "Education",
  "Healthcare",
  "Social Assistance",
  "Youth Services",
  "Community Services",
  // Other industries
  "Technology",
  "Finance",
  "Retail",
  "Manufacturing",
  "Construction",
  "Real Estate",
  "Hospitality",
  "Transportation",
  "Agriculture",
  "Energy",
  "Telecommunications",
  "Media",
  "Entertainment",
  "Consulting",
  "Legal Services",
  "Marketing",
  "Human Resources",
  "Other",
];

// Color options for rooms
const COLOR_OPTIONS = [
  { value: "#EF4444", label: "Red", class: "bg-red-500" },
  { value: "#F97316", label: "Orange", class: "bg-orange-500" },
  { value: "#F59E0B", label: "Amber", class: "bg-amber-500" },
  { value: "#EAB308", label: "Yellow", class: "bg-yellow-500" },
  { value: "#84CC16", label: "Lime", class: "bg-lime-500" },
  { value: "#10B981", label: "Green", class: "bg-green-500" },
  { value: "#14B8A6", label: "Teal", class: "bg-teal-500" },
  { value: "#06B6D4", label: "Cyan", class: "bg-cyan-500" },
  { value: "#3B82F6", label: "Blue", class: "bg-blue-500" },
  { value: "#8B5CF6", label: "Violet", class: "bg-violet-500" },
  { value: "#A855F7", label: "Purple", class: "bg-purple-500" },
  { value: "#EC4899", label: "Pink", class: "bg-pink-500" },
  { value: "#F43F5E", label: "Rose", class: "bg-rose-500" },
];

// Age group options
const AGE_GROUPS = [
  "Infants (0-12 months)",
  "Toddlers (1-2 years)",
  "Twos (2-3 years)",
  "Preschool (3-4 years)",
  "Pre-K (4-5 years)",
  "School Age (5+ years)",
  "Mixed Age Group",
];

// Reusable Form Components
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
      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
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
      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
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
      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
    ></textarea>
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

const ColorPicker = ({ label, name, value, onChange, error }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-1 flex items-center gap-2">
      <div className="flex-1">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`block w-full px-3 py-2 bg-white border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
        >
          {COLOR_OPTIONS.map((color) => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>
      <div
        className="w-10 h-10 rounded-full border-2 border-gray-300"
        style={{ backgroundColor: value }}
        title="Selected color"
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

// Create a context for modal management
const DesignationModalContext = React.createContext();

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

  // Designation modal states
  const [isDesignationModalOpen, setIsDesignationModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [currentDepartmentId, setCurrentDepartmentId] = useState(null);
  const [isDesignationConfirmOpen, setIsDesignationConfirmOpen] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState(null);

  // Fetch organizations with proper response handling
  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    console.log('🔄 Starting to fetch organizations...');
    
    try {
      const response = await getOrganizations();
      console.log('📥 Raw GET response:', response);
      
      let organizationsData = [];
      
      if (response && response.success === true) {
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          organizationsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          organizationsData = response.data;
        } else if (Array.isArray(response)) {
          organizationsData = response;
        }
      }
      
      setOrganizations(organizationsData);
    } catch (err) {
      console.error('💥 Error fetching organizations:', err);
      setError(err.response?.data?.message || "Failed to fetch organizations.");
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Handle save organization
  const handleSave = async (orgData) => {
    setIsSubmitting(true);
    console.log('🔧 handleSave called with data:', orgData);

    try {
      let apiResponse;
      
      if (editingOrg) {
        apiResponse = await updateOrganization(editingOrg.id, orgData);
      } else {
        apiResponse = await createOrganization(orgData);
      }
      
      if (apiResponse.success !== true) {
        throw new Error(apiResponse.message || 'API returned unsuccessful');
      }
      
      await fetchOrganizations();
      
      if (selectedOrg && editingOrg && selectedOrg.id === editingOrg.id) {
        const updatedOrgData = apiResponse.data;
        setSelectedOrg(updatedOrgData);
      }
      
      setIsModalOpen(false);
      setEditingOrg(null);
      
      alert(apiResponse.message || (editingOrg ? 'Organization updated successfully!' : 'Organization created successfully!'));
      
    } catch (err) {
      console.error('💥 ERROR in handleSave:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Failed to save organization. ';
      
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        localStorage.removeItem('ACCESS_TOKEN');
        setTimeout(() => window.location.href = '/login', 1000);
      } else if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        errorMessage = 'Validation errors:\n' + 
          (errors ? Object.entries(errors).map(([field, msgs]) => 
            `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
          ).join('\n') : 'Invalid data provided.');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
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
        alert('Organization deleted successfully!');
        
      } catch (err) {
        console.error('Failed to delete organization:', err);
        alert(err.response?.data?.message || 'Failed to delete organization');
      } finally {
        setIsConfirmOpen(false);
        setOrgToDelete(null);
      }
    }
  };

  // Designation modal handlers
  const handleOpenDesignationModal = (departmentId, designation = null) => {
    setCurrentDepartmentId(departmentId);
    setEditingDesignation(designation);
    setIsDesignationModalOpen(true);
  };

  const handleCloseDesignationModal = () => {
    setIsDesignationModalOpen(false);
    setEditingDesignation(null);
    setCurrentDepartmentId(null);
  };

  const handleSaveDesignation = async (designationData) => {
    setIsSubmitting(true);
    try {
      let response;
      if (editingDesignation) {
        response = await updateDesignation(editingDesignation.id, designationData);
      } else {
        response = await createDesignation(currentDepartmentId, designationData);
      }
      
      if (response.success === true) {
        handleCloseDesignationModal();
        alert(response.message || 'Designation saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save designation');
      }
    } catch (err) {
      console.error('Failed to save designation:', err);
      alert(err.response?.data?.message || err.message || 'Failed to save designation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDesignationDeleteClick = (designation) => {
    setDesignationToDelete(designation);
    setIsDesignationConfirmOpen(true);
  };

  const handleDesignationDeleteConfirm = async () => {
    if (designationToDelete) {
      try {
        await deleteDesignation(designationToDelete.id);
        setIsDesignationConfirmOpen(false);
        setDesignationToDelete(null);
        alert('Designation deleted successfully!');
      } catch (err) {
        console.error('Failed to delete designation:', err);
        alert(err.response?.data?.message || 'Failed to delete designation');
      }
    }
  };

  // Context value for designation modal
  const designationModalContextValue = {
    openDesignationModal: handleOpenDesignationModal,
    deleteDesignation: handleDesignationDeleteClick
  };

  return (
    <DesignationModalContext.Provider value={designationModalContextValue}>
      <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto">
          {!selectedOrg ? (
            <OrganizationListView
              isLoading={isLoading}
              error={error}
              organizations={organizations}
              onSelectOrg={setSelectedOrg}
              onAdd={() => {
                setEditingOrg(null);
                setIsModalOpen(true);
              }}
              onEdit={(org) => {
                setEditingOrg(org);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteClick}
            />
          ) : (
            <OrganizationDetailView
              organization={selectedOrg}
              onBack={() => setSelectedOrg(null)}
              onEdit={(org) => {
                setEditingOrg(org);
                setIsModalOpen(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Organization Modal */}
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
        title="Delete Center"
        message={`Are you sure you want to delete "${orgToDelete?.name}"? This action cannot be undone.`}
      />

      {/* Designation Modal */}
      <DesignationModal
        isOpen={isDesignationModalOpen}
        onClose={handleCloseDesignationModal}
        onSave={handleSaveDesignation}
        designation={editingDesignation}
        isSubmitting={isSubmitting}
      />

      <ConfirmationModal
        isOpen={isDesignationConfirmOpen}
        onClose={() => {
          setIsDesignationConfirmOpen(false);
          setDesignationToDelete(null);
        }}
        onConfirm={handleDesignationDeleteConfirm}
        title="Delete Designation"
        message={`Are you sure you want to delete "${designationToDelete?.title}"?`}
      />
    </DesignationModalContext.Provider>
  );
}

// ============ Sub-Components ============

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
        <h1 className="text-3xl font-bold text-gray-800">Centers</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition self-start sm:self-center"
        >
          <HiPlus /> Add New Center
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading Centers...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 font-medium">Error:</p>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 hover:text-red-900"
          >
            Click to retry
          </button>
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
              No Centers found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new Center.
            </p>
            <button
              onClick={onAdd}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition"
            >
              <HiPlus /> Add Your First Center
            </button>
          </div>
        )
      )}
    </div>
  );
}

function OrganizationCard({ organization, onSelectOrg, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg group relative">
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
      
      <div className="p-6 pl-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h2 
              onClick={() => onSelectOrg(organization)}
              className="text-xl font-bold text-gray-900 mb-2 truncate cursor-pointer hover:text-blue-600 transition"
            >
              {organization.name}
            </h2>
            <p className="text-gray-600 mb-1 text-sm">
              <span className="font-medium">ID:</span> {organization.id}
              {organization.registration_number && ` • ${organization.registration_number}`}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {organization.contact_email}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Created: {new Date(organization.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3 self-start sm:self-center flex-shrink-0">
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(organization);
                }}
                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                title="Edit Center"
              >
                <HiPencil />
              </button>
            </div>
            
            <button
              onClick={() => onSelectOrg(organization)}
              className="text-sm font-semibold text-blue-600 hover:underline transition-colors"
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
        className="flex items-center gap-2 text-blue-600 hover:underline mb-6 font-semibold"
      >
        <HiArrowLeft /> Back to Centers
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
        
        <div className="pl-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                {organization.name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-500">Service ID</p>
                  <p className="font-medium">{organization.registration_number || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{organization.contact_email || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{organization.contact_phone || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium">{organization.industry_type || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{organization.address || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timezone</p>
                  <p className="font-medium">{organization.timezone || 'Australia/Sydney'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created Date</p>
                  <p className="font-medium">
                    {new Date(organization.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
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

      <RoomsManager orgId={organization.id} />
    </div>
  );
}

function RoomsManager({ orgId }) {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomError, setRoomError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setRoomError(null);
    
    try {
      const response = await getDepartmentsByOrgId(orgId);
      console.log('Rooms response:', response);
      
      let roomsData = [];
      
      if (response && response.success === true) {
        if (response.data && response.data.data) {
          roomsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          roomsData = response.data;
        }
      } else if (Array.isArray(response)) {
        roomsData = response;
      }
      
      setRooms(roomsData);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
      setRoomError(error.response?.data?.message || "Failed to load rooms");
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleSave = async (roomData) => {
    setIsSubmitting(true);
    try {
      let response;
      if (editingRoom) {
        response = await updateDepartment(editingRoom.id, roomData);
      } else {
        response = await createDepartment(orgId, roomData);
      }
      
      if (response.success === true) {
        await fetchRooms();
        setIsModalOpen(false);
        setEditingRoom(null);
        alert(response.message || 'Room saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save room');
      }
    } catch (error) {
      console.error("Failed to save room", error);
      alert(error.response?.data?.message || error.message || 'Failed to save room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (roomToDelete) {
      try {
        await deleteDepartment(roomToDelete.id);
        await fetchRooms();
        setIsConfirmOpen(false);
        setRoomToDelete(null);
        alert('Room deleted successfully!');
      } catch (error) {
        console.error("Failed to delete room", error);
        alert(error.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Rooms</h2>
        <button
          onClick={() => {
            setEditingRoom(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition"
        >
          <HiPlus /> Add Room
        </button>
      </div>

      {roomError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{roomError}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading Rooms...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              onEdit={() => {
                setEditingRoom(room);
                setIsModalOpen(true);
              }}
              onDelete={() => {
                setRoomToDelete(room);
                setIsConfirmOpen(true);
              }}
            />
          ))}
          {rooms.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <HiOutlineOfficeBuilding className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Rooms found</h3>
              <p className="mt-1 text-sm text-gray-500">Add a room to get started.</p>
            </div>
          )}
        </div>
      )}

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        room={editingRoom}
        isSubmitting={isSubmitting}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete "${roomToDelete?.name}"?`}
      />
    </div>
  );
}

function RoomItem({ room, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get color class from COLOR_OPTIONS
  const colorOption = COLOR_OPTIONS.find(c => c.value === room.color_code) || COLOR_OPTIONS[0];
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg group relative">
      <div 
        className="absolute top-0 left-0 w-2 h-full" 
        style={{ backgroundColor: room.color_code || '#3B82F6' }}
      ></div>
      
      <div className="p-6 pl-8">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
              <span 
                className="inline-block w-4 h-4 rounded-full" 
                style={{ backgroundColor: room.color_code || '#3B82F6' }}
                title={colorOption.label}
              />
            </div>
            {room.age_group && (
              <p className="text-gray-600 text-sm mt-1">
                <span className="font-medium">Age Group:</span> {room.age_group}
              </p>
            )}
            {room.description && (
              <p className="text-gray-500 text-sm mt-1">{room.description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                title="Edit Room"
              >
                <HiPencil />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete Room"
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
        {isOpen && <DesignationsList departmentId={room.id} />}
      </div>
    </div>
  );
}

function DesignationsList({ departmentId }) {
  const [designations, setDesignations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [desigError, setDesigError] = useState(null);
  const designationModalContext = React.useContext(DesignationModalContext);

  const fetchDesigs = useCallback(async () => {
    setIsLoading(true);
    setDesigError(null);
    
    try {
      const response = await getDesignationsByDeptId(departmentId);
      console.log('Designations response:', response);
      
      let designationsData = [];
      
      if (response && response.success === true) {
        if (response.data && response.data.data) {
          designationsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          designationsData = response.data;
        }
      } else if (Array.isArray(response)) {
        designationsData = response;
      }
      
      setDesignations(designationsData);
    } catch (error) {
      console.error("Failed to fetch designations", error);
      setDesigError(error.response?.data?.message || "Failed to load designations");
      setDesignations([]);
    } finally {
      setIsLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchDesigs();
  }, [fetchDesigs]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-md font-semibold text-gray-700">Designations</h4>
        <button
          onClick={() => designationModalContext.openDesignationModal(departmentId)}
          className="flex items-center gap-1 text-sm bg-blue-600 text-white font-semibold py-1 px-3 rounded-full hover:opacity-90 transition"
        >
          <HiPlus /> Add Designation
        </button>
      </div>

      {desigError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
          <p className="text-red-600 text-xs">{desigError}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading...</span>
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
                  onClick={() => designationModalContext.openDesignationModal(departmentId, desig)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                  title="Edit Designation"
                >
                  <HiPencil />
                </button>
                <button
                  onClick={() => designationModalContext.deleteDesignation(desig)}
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
    </div>
  );
}

// ============ Modal Components ============

function OrganizationModal({ isOpen, onClose, onSave, organization, isSubmitting }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  
  useEffect(() => {
    setFormData(
      organization || {
        name: "",
        registration_number: "",
        address: "",
        contact_email: "",
        contact_phone: "",
        industry_type: "Child Care Center",
        timezone: "Australia/Sydney",
      }
    );
    setErrors({});
    setSubmitError('');
  }, [organization, isOpen]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Modal submission error:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError('Failed to save Center. Please try again.');
      }
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {organization ? "Edit Center" : "Add New Center"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <HiX size={24} />
          </button>
        </div>
        
        {submitError && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">Error: {submitError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <FormInput
                  label="Center Name *"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Enter Center name"
                  required
                  error={errors.name}
                />
              </div>
              
              <FormInput
                label="Service ID"
                name="registration_number"
                value={formData.registration_number || ""}
                onChange={handleChange}
                placeholder="Enter Service ID"
                error={errors.registration_number}
              />
              
              <FormSelect
                label="Industry Type"
                name="industry_type"
                value={formData.industry_type || "Child Care Center"}
                onChange={handleChange}
                error={errors.industry_type}
              >
                {INDUSTRY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </FormSelect>
              
              <FormInput
                type="email"
                label="Contact Email *"
                name="contact_email"
                value={formData.contact_email || ""}
                onChange={handleChange}
                placeholder="Enter contact email"
                required
                error={errors.contact_email}
              />
              
              <FormInput
                label="Contact Phone"
                name="contact_phone"
                value={formData.contact_phone || ""}
                onChange={handleChange}
                placeholder="Enter contact phone"
                error={errors.contact_phone}
              />
              
              <FormSelect
                label="Timezone"
                name="timezone"
                value={formData.timezone || "Australia/Sydney"}
                onChange={handleChange}
                error={errors.timezone}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </option>
                ))}
              </FormSelect>
              
              <div className="sm:col-span-2">
                <FormTextarea
                  label="Address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  rows="3"
                  error={errors.address}
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
              className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {isSubmitting
                ? organization
                  ? "Saving..."
                  : "Creating..."
                : organization
                ? "Save Changes"
                : "Create Center"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoomModal({ isOpen, onClose, onSave, room, isSubmitting }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Initialize with default values including age_group and color_code
    setFormData(room || { 
      name: "", 
      description: "", 
      age_group: AGE_GROUPS[0], // Default to first age group
      color_code: COLOR_OPTIONS[0].value // Default to Red
    });
    setError('');
  }, [room, isOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
    // Log to verify values are being set
    console.log(`Setting ${name}:`, value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Log the complete form data before submitting
    console.log('Submitting room data:', {
      name: formData.name,
      description: formData.description,
      age_group: formData.age_group,
      color_code: formData.color_code
    });
    
    // Ensure all fields are included
    const submitData = {
      name: formData.name,
      description: formData.description || '',
      age_group: formData.age_group || AGE_GROUPS[0],
      color_code: formData.color_code || COLOR_OPTIONS[0].value
    };
    
    try {
      await onSave(submitData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save room');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {room ? "Edit Room" : "Add New Room"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <HiX size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-4">
              <FormInput
                label="Room Name *"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Enter room name"
                required
              />
              
              <FormSelect
                label="Age Group"
                name="age_group"
                value={formData.age_group || AGE_GROUPS[0]}
                onChange={handleChange}
              >
                {AGE_GROUPS.map((ageGroup) => (
                  <option key={ageGroup} value={ageGroup}>
                    {ageGroup}
                  </option>
                ))}
              </FormSelect>
              
              <ColorPicker
                label="Room Color"
                name="color_code"
                value={formData.color_code || COLOR_OPTIONS[0].value}
                onChange={handleChange}
              />
              
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter room description"
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
              className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              {isSubmitting
                ? room
                  ? "Saving..."
                  : "Creating..."
                : room
                ? "Save Changes"
                : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DesignationModal({ isOpen, onClose, onSave, designation, isSubmitting }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  
  useEffect(() => {
    setFormData(designation || { title: "", level: "Junior" });
    setError('');
  }, [designation, isOpen]);
  
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save designation');
    }
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
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <HiX size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-4">
              <FormInput
                label="Designation Title *"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Enter designation title"
                required
              />
              
              {/* <FormSelect
                label="Level"
                name="level"
                value={formData.level || "Junior"}
                onChange={handleChange}
              >
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Manager">Manager</option>
                <option value="Director">Director</option>
              </FormSelect> */}
            </div>
          </div>

          <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
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