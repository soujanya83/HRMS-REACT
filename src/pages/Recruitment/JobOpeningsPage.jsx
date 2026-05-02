import React, { useState, useEffect, useCallback } from "react";
import usePermissions from "../../hooks/usePermissions";
import {
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiArrowLeft,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiX,
} from "react-icons/hi";
import { useOrganizations } from "../../contexts/OrganizationContext";
import {
  getJobOpenings,
  createJobOpening,
  updateJobOpening,
  deleteJobOpening,
  getJobOpeningById,
  getDepartmentsByOrgId,
  getDesignationsByOrgId,
} from "../../services/recruitmentService";

// ============================================
// COLOR PALETTE ICON (Same as Dashboard)
// ============================================
const ColorPaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z" fill="white" />
    <circle cx="7.5" cy="10.5" r="1.5" fill="#2D7BE5" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="#2D7BE5" />
    <circle cx="16.5" cy="11.5" r="1.5" fill="#2D7BE5" />
  </svg>
);

// ============================================
// COLOR PALETTE MODAL (Same as Dashboard)
// ============================================
const ColorPaletteModal = ({
  isOpen,
  onClose,
  onSidebarColorSelect,
  onBackgroundColorSelect,
  currentSidebarColor,
  currentBgColor
}) => {
  if (!isOpen) return null;

  const sidebarColors = [
    { name: 'Dark Navy', value: '#0B1A2E' },
    { name: 'Charcoal', value: '#2C2C2C' },
    { name: 'Teal', value: '#008080' },
    { name: 'Deep Purple', value: '#4B0082' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Slate Blue', value: '#5B7B9A' },
  ];

  const backgroundColors = [
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'Snow', value: '#FFFAFA' },
    { name: 'Ivory', value: '#FFFFF0' },
    { name: 'Pearl', value: '#F8F6F0' },
    { name: 'Whisper', value: '#F5F5F5' },
    { name: 'Silver Mist', value: '#E5E7EB' },
    { name: 'Ash', value: '#D1D5DB' },
    { name: 'Pewter', value: '#9CA3AF' },
    { name: 'Stone', value: '#6B7280' },
    { name: 'Graphite', value: '#4B5563' },
    { name: 'Slate', value: '#374151' },
    { name: 'Charcoal', value: '#1F2937' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={onClose} />
      <div className="fixed right-6 bottom-24 w-[340px] bg-white rounded-2xl shadow-2xl z-[70] p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Customize Colors</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Sidebar Color</h2>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {sidebarColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onSidebarColorSelect(c.value)}
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${currentSidebarColor === c.value ? "ring-2 ring-blue-500" : ""
                }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <h2 className="text-md font-semibold text-gray-800 mb-3">Background Color</h2>
        <div className="grid grid-cols-3 gap-3">
          {backgroundColors.map((c) => (
            <button
              key={c.name}
              onClick={() => onBackgroundColorSelect(c.value)}
              className={`p-3 rounded-xl text-sm font-medium border ${currentBgColor === c.value ? "ring-2 ring-blue-500" : ""
                }`}
              style={{ backgroundColor: c.value }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const FormInput = ({ label, name, error, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={name}
      name={name}
      {...props}
      className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? "border-red-500" : "border-gray-300"
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
      className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? "border-red-500" : "border-gray-300"
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
      className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm`}
    ></textarea>
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

function JobOpeningsPage() {
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || '#1a4d4d';
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || '#f9fafb';
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  // Save sidebar color to localStorage and dispatch event
  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
    window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem('backgroundColor', backgroundColor);
  }, [backgroundColor]);

  return (
    <>
      {/* Color Palette Button - Same as Dashboard */}
      <button
        onClick={() => setIsColorPaletteOpen(true)}
        className="fixed right-6 bottom-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all z-50"
      >
        <ColorPaletteIcon />
      </button>

      {/* Color Palette Modal */}
      <ColorPaletteModal
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
        onSidebarColorSelect={(color) => {
          //console.log('Setting sidebar color to:', color);
          setSidebarColor(color);
          localStorage.setItem('sidebarColor', color);
        }}
        onBackgroundColorSelect={(color) => {
          //console.log('Setting background color to:', color);
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
        }}
        currentSidebarColor={sidebarColor}
        currentBgColor={backgroundColor}
      />

      <Routes>
        <Route index element={<Navigate to="jobs" replace />} />
        <Route path="jobs" element={<JobOpeningListPage backgroundColor={backgroundColor} />} />
        <Route path="jobs/:jobId" element={<JobOpeningDetailPage backgroundColor={backgroundColor} />} />
      </Routes>
    </>
  );
}

function JobOpeningListPage({ backgroundColor }) {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const { selectedOrganization } = useOrganizations();
  const [modalErrors, setModalErrors] = useState(null);
  const { canAdd, canEdit, canDelete } = usePermissions('recruitment.job_openings');

  const fetchJobs = useCallback(async () => {
    if (!selectedOrganization) {
      setIsLoading(false);
      setJobs([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await getJobOpenings();
      const allJobs = response.data.data || [];

      const filteredJobs = allJobs.filter(
        (job) => job.organization_id === selectedOrganization.id
      );

      setJobs(filteredJobs);
    } catch (error) {
      console.error("Failed to fetch job openings:", error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSave = async (jobData) => {
    try {
      setModalErrors(null);
      const payload = { ...jobData, organization_id: selectedOrganization.id };
      if (editingJob) {
        await updateJobOpening(editingJob.id, payload);
      } else {
        await createJobOpening(payload);
      }
      fetchJobs();
      setIsModalOpen(false);
      setEditingJob(null);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setModalErrors(err.response.data.errors);
      } else {
        console.error("Failed to save job opening:", err);
      }
    }
  };

  const handleDelete = async () => {
    if (jobToDelete) {
      try {
        await deleteJobOpening(jobToDelete.id);
        fetchJobs();
        setIsConfirmOpen(false);
        setJobToDelete(null);
      } catch (err) {
        console.error("Failed to delete job opening:", err);
      }
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 font-sans min-h-full transition-colors duration-300"
      style={{ backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Job Openings</h1>
          {canAdd && (
            <button
              onClick={() => {
                setEditingJob(null);
                setModalErrors(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-brand-blue text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition self-start sm:self-center"
            >
              <HiPlus /> Create Job Opening
            </button>
          )}
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={() => {
                  setEditingJob(job);
                  setModalErrors(null);
                  setIsModalOpen(true);
                }}
                onDelete={() => {
                  setJobToDelete(job);
                  setIsConfirmOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <HiOutlineBriefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No job openings found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no jobs for the selected organization:{" "}
              <span className="font-bold">{selectedOrganization?.name}</span>.
            </p>
          </div>
        )}
      </div>
      <JobOpeningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        job={editingJob}
        errors={modalErrors}
      />
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Job Opening"
        message={`Are you sure you want to delete "${jobToDelete?.title}"?`}
      />
    </div>
  );
}

function JobCard({ job, onEdit, onDelete, canEdit = true, canDelete = true }) {
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'open':
        return { text: 'Open', color: 'bg-brand-blue text-white', badgeColor: 'bg-brand-blue' };
      case 'closed':
        return { text: 'Closed', color: 'bg-red-100 text-red-800', badgeColor: 'bg-red-500' };
      case 'draft':
        return { text: 'Draft', color: 'bg-gray-100 text-gray-800', badgeColor: 'bg-gray-500' };
      case 'on-hold':
        return { text: 'On Hold', color: 'bg-yellow-100 text-yellow-800', badgeColor: 'bg-yellow-500' };
      default:
        return { text: status || 'Unknown', color: 'bg-gray-100 text-gray-800', badgeColor: 'bg-gray-500' };
    }
  };

  const statusConfig = getStatusConfig(job.status);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg group relative">
      <div className={`absolute top-0 left-0 w-2 h-full ${statusConfig.badgeColor}`}></div>

      <div className="p-6 pl-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div className="flex-1">
            <Link
              to={`${job.id}`}
              state={{ jobTitle: job.title }}
              className="block"
            >
              <h2 className="text-xl font-bold text-gray-900 hover:text-brand-blue transition truncate">
                {job.title}
              </h2>
            </Link>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <HiOutlineOfficeBuilding />
                {job.organization?.name || 'No organization'}
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineLocationMarker />
                {job.location || 'Remote'}
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineClock />
                {job.employment_type || 'Full-time'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}
            >
              {statusConfig.text}
            </span>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              {canEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
                >
                  <HiPencil />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full"
                >
                  <HiTrash />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobOpeningDetailPage({ backgroundColor }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { canEdit } = usePermissions('recruitment.job_openings');

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await getJobOpeningById(jobId);
        setJob(response.data.data);
      } catch (error) {
        console.error("Failed to fetch job details", error);
        setError('Failed to load job details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'open':
        return { text: 'Open', color: 'bg-brand-blue text-white', badgeColor: 'bg-brand-blue' };
      case 'closed':
        return { text: 'Closed', color: 'bg-red-100 text-red-800', badgeColor: 'bg-red-500' };
      case 'draft':
        return { text: 'Draft', color: 'bg-gray-100 text-gray-800', badgeColor: 'bg-gray-500' };
      case 'on-hold':
        return { text: 'On Hold', color: 'bg-yellow-100 text-yellow-800', badgeColor: 'bg-yellow-500' };
      default:
        return { text: status || 'Unknown', color: 'bg-gray-100 text-gray-800', badgeColor: 'bg-gray-500' };
    }
  };

  const statusConfig = job ? getStatusConfig(job.status) : null;

  if (isLoading) {
    return (
      <div
        className="p-8 min-h-full flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div
        className="p-4 sm:p-6 lg:p-8 font-sans min-h-full transition-colors duration-300"
        style={{ backgroundColor }}
      >
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-brand-blue hover:underline mb-4 font-semibold"
          >
            <HiArrowLeft /> Back to Job Openings
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <HiOutlineBriefcase className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Not Found</h2>
            <p className="text-gray-600">{error || 'The requested job opening could not be found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 font-sans min-h-full transition-colors duration-300"
      style={{ backgroundColor }}
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-blue hover:underline mb-4 font-semibold"
        >
          <HiArrowLeft /> Back to Job Openings
        </button>
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
          {statusConfig && (
            <div className={`absolute top-0 left-0 w-2 h-full ${statusConfig.badgeColor}`}></div>
          )}

          <div className="pl-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
                <div className="flex items-center flex-wrap gap-x-6 gap-y-2 mt-2 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <HiOutlineOfficeBuilding />
                    {job.organization?.name || 'No organization'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HiOutlineLocationMarker />
                    {job.location || 'Remote'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HiOutlineClock />
                    {job.employment_type || 'Full-time'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {statusConfig && (
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusConfig.color}`}>
                    {statusConfig.text}
                  </span>
                )}
                {canEdit && (
                  <button className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition">
                    <HiPencil /> Edit
                  </button>
                )}
              </div>
            </div>
            <hr className="my-6" />
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Description
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {job.description || 'No description provided.'}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Requirements
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {job.requirements || 'No requirements provided.'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold">Posting Date:</span>{' '}
                {job.posting_date ? new Date(job.posting_date).toLocaleDateString() : 'Not specified'}
              </div>
              <div>
                <span className="font-semibold">Closing Date:</span>{' '}
                {job.closing_date ? new Date(job.closing_date).toLocaleDateString() : 'Not specified'}
              </div>
              <div>
                <span className="font-semibold">Room:</span>{' '}
                {job.department?.name || 'Not specified'}
              </div>
              <div>
                <span className="font-semibold">Designation:</span>{' '}
                {job.designation?.title || 'Not specified'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobOpeningModal({ isOpen, onClose, onSave, job, errors }) {
  const [formData, setFormData] = useState({});
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const { selectedOrganization } = useOrganizations();
  console.log("SELECTED ORGANIZATION IS ", selectedOrganization)

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const initialData = job ? {
      ...job,
      posting_date: formatDateForInput(job.posting_date),
      closing_date: formatDateForInput(job.closing_date),
      department_id: job.department_id || "",
      designation_id: job.designation_id || "",
      status: job.status?.toLowerCase() || "open",
      employment_type: job.employment_type?.toLowerCase() || "full-time"
    } : {
      title: "",
      location: selectedOrganization?.address,
      employment_type: "full-time",
      status: "open",
      description: "",
      requirements: "",
      posting_date: formatDateForInput(new Date()),
      closing_date: "",
      department_id: "",
      designation_id: "",
    };

    setFormData(initialData);

    if (isOpen && selectedOrganization) {
      getDepartmentsByOrgId(selectedOrganization.id)
        .then((res) => {
          setDepartments(res.data.data || []);
        })
        .catch(err => {
          console.error("Failed to load Rooms:", err);
          setDepartments([]);
        });

      getDesignationsByOrgId(selectedOrganization.id)
        .then((res) => {
          setDesignations(res.data.data || []);
        })
        .catch(err => {
          console.error("Failed to load designations:", err);
          setDesignations([]);
        });
    }
  }, [job, isOpen, selectedOrganization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department_id' || name === 'designation_id') {
      setFormData((prev) => ({ ...prev, [name]: value ? parseInt(value, 10) : '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    //console.log('📤 Submitting job opening:', formData);

    if (!formData.title) {
      alert('Job Title is required');
      return;
    }
    if (!formData.department_id) {
      alert('Please select a Room/Department');
      return;
    }
    if (!formData.designation_id) {
      alert('Please select a Designation');
      return;
    }
    if (!formData.location) {
      alert('Location is required');
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {job ? "Edit Job Opening" : "Create New Job Opening"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <HiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <FormInput
                  label="Job Title"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  error={errors?.title}
                  required
                />
              </div>

              <FormSelect
                label="Room / Department"
                name="department_id"
                value={formData.department_id || ""}
                onChange={handleChange}
                error={errors?.department_id}
                required
              >
                <option value="">Select a Room</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Designation"
                name="designation_id"
                value={formData.designation_id || ""}
                onChange={handleChange}
                error={errors?.designation_id}
                required
              >
                <option value="">Select a Designation</option>
                {designations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.title}
                  </option>
                ))}
              </FormSelect>

              <FormInput
                label="Location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                error={errors?.location}
                required
              />

              <FormSelect
                label="Employment Type"
                name="employment_type"
                value={formData.employment_type || "full-time"}
                onChange={handleChange}
                error={errors?.employment_type}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract / Casual</option>
                <option value="fixed-term">Fixed Term</option>
                <option value="trainee">Trainee</option>
              </FormSelect>

              <div className="sm:col-span-2">
                <FormTextarea
                  label="Description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  error={errors?.description}
                  rows="4"
                  placeholder="Describe the role, responsibilities, and what the job entails..."
                />
              </div>

              <div className="sm:col-span-2">
                <FormTextarea
                  label="Requirements"
                  name="requirements"
                  value={formData.requirements || ""}
                  onChange={handleChange}
                  error={errors?.requirements}
                  rows="4"
                  placeholder="List the qualifications, skills, and experience required..."
                />
              </div>

              <FormInput
                type="date"
                label="Posting Date"
                name="posting_date"
                value={formData.posting_date || ""}
                onChange={handleChange}
                error={errors?.posting_date}
              />

              <FormInput
                type="date"
                label="Closing Date"
                name="closing_date"
                value={formData.closing_date || ""}
                onChange={handleChange}
                error={errors?.closing_date}
              />

              <div className="sm:col-span-2">
                <FormSelect
                  label="Status"
                  name="status"
                  value={formData.status || "open"}
                  onChange={handleChange}
                  error={errors?.status}
                >
                  <option value="open">Open</option>
                  <option value="on-hold">On Hold</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </FormSelect>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              {job ? "Save Changes" : "Create Job"}
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
            className="py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
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

export default JobOpeningsPage;