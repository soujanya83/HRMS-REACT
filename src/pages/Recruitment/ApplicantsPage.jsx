import React, { useState, useEffect, useCallback } from "react";
import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiEye,
  FiX,
  FiLoader,
  FiUploadCloud,
} from "react-icons/fi";

import { useOrganizations } from "../../contexts/OrganizationContext";

import {
  getApplicants,
  createApplicant,
  updateApplicant,
  deleteApplicant,
  updateApplicantStatus,
  getJobOpenings,
  downloadApplicantResume,
} from "../../services/recruitmentService";

const statusOptions = [
  {
    value: "Applied",
    label: "Applied",
    color: "bg-blue-100 text-blue-800",
    borderColor: "border-blue-500",
  },
  {
    value: "Screening",
    label: "Screening",
    color: "bg-purple-100 text-purple-800",
    borderColor: "border-purple-500",
  },
  {
    value: "Interviewing",
    label: "Interviewing",
    color: "bg-purple-100 text-purple-800",
    borderColor: "border-purple-500",
  },
  {
    value: "Offered",
    label: "Offered",
    color: "bg-green-100 text-green-800",
    borderColor: "border-green-500",
  },
  {
    value: "Hired",
    label: "Hired",
    color: "bg-teal-100 text-teal-800",
    borderColor: "border-teal-500",
  },
  {
    value: "Rejected",
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    borderColor: "border-red-500",
  },
  {
    value: "Withdrawn",
    label: "Withdrawn",
    color: "bg-gray-100 text-gray-800",
    borderColor: "border-gray-500",
  },
];

const sourceOptions = [
  "website",
  "linkedin",
  "referral",
  "job-board",
  "social-media",
  "direct-application",
  "recruiter",
  "other",
];

const sourceLabels = {
  website: "Website",
  linkedin: "LinkedIn",
  referral: "Referral",
  "job-board": "Job Board",
  "social-media": "Social Media",
  "direct-application": "Direct Application",
  recruiter: "Recruiter",
  other: "Other",
};

const initialFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  job_opening_id: "",
  cover_letter: "",
  source: "linkedin",
  status: "Applied", // Capitalized to match API
};

const ApplicantsPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [jobOpenings, setJobOpenings] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState(initialFormData);
  const [resumeFile, setResumeFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id;

  const fetchData = useCallback(async () => {
    if (!organizationId) {
      setApplicants([]);
      setJobOpenings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [applicantsRes, jobOpeningsRes] = await Promise.all([
        getApplicants({ organization_id: organizationId }),
        getJobOpenings(organizationId),
      ]);
      setApplicants(applicantsRes.data?.data || applicantsRes.data || []);
      setJobOpenings(jobOpeningsRes.data?.data || jobOpeningsRes.data || []);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let result = applicants;
    if (searchTerm) {
      result = result.filter(
        (applicant) =>
          `${applicant.first_name} ${applicant.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (jobFilter !== "all") {
      result = result.filter((a) => a.job_opening_id.toString() === jobFilter);
    }
    setFilteredApplicants(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, jobFilter, applicants]);

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.first_name?.trim())
      errors.first_name = ["First name is required"];
    if (!formData.last_name?.trim())
      errors.last_name = ["Last name is required"];
    if (!formData.email?.trim()) errors.email = ["Email is required"];
    if (!formData.phone?.trim()) errors.phone = ["Phone is required"]; // Added phone validation
    if (!formData.job_opening_id)
      errors.job_opening_id = ["Job opening is required"];

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = ["Please enter a valid email address"];
    }

    // Resume validation - required for new applicants
    if (!isEditMode && !resumeFile) {
      errors.resume = ["Resume is required"];
    }

    // File validation if resume is provided
    if (resumeFile) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(resumeFile.type)) {
        errors.resume = ["Resume must be PDF, DOC, or DOCX format"];
      }

      if (resumeFile.size > 5 * 1024 * 1024) {
        errors.resume = ["Resume must be less than 5MB"];
      }
    }

    // Source validation
    if (!formData.source || !sourceOptions.includes(formData.source)) {
      errors.source = ["Please select a valid source"];
    }

    // Status validation
    const validStatuses = statusOptions.map((option) => option.value);
    if (!formData.status || !validStatuses.includes(formData.status)) {
      errors.status = ["Please select a valid status"];
    }

    return errors;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormErrors((prev) => ({ ...prev, resume: null }));

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          resume: ["File size exceeds 5MB."],
        }));
        e.target.value = null;
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          resume: ["Please upload only PDF, DOC, or DOCX files."],
        }));
        e.target.value = null;
        return;
      }

      setResumeFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("=== STARTING FORM SUBMISSION ===");

    // Clear previous errors
    setFormErrors({});

    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      alert("Please fix the validation errors before submitting.");
      return;
    }

    if (!organizationId) {
      alert("No organization selected");
      return;
    }

    // Create FormData
    const formDataInstance = new FormData();

    // Append all fields with proper formatting
    formDataInstance.append("first_name", formData.first_name.trim());
    formDataInstance.append("last_name", formData.last_name.trim());
    formDataInstance.append("email", formData.email.trim());
    formDataInstance.append("phone", formData.phone?.trim() || "");
    formDataInstance.append(
      "job_opening_id",
      formData.job_opening_id.toString()
    );
    formDataInstance.append(
      "cover_letter",
      formData.cover_letter?.trim() || ""
    );
    formDataInstance.append("source", formData.source);
    formDataInstance.append("status", formData.status);
    formDataInstance.append("organization_id", organizationId.toString());

    if (!isEditMode) {
      formDataInstance.append(
        "applied_date",
        new Date().toISOString().split("T")[0]
      );
    }

    if (resumeFile) {
      formDataInstance.append("resume", resumeFile);
    }

    // Debug: Log what's being sent
    console.log("=== FORM DATA BEING SENT ===");
    for (let pair of formDataInstance.entries()) {
      console.log(pair[0] + ":", pair[1]);
    }

    try {
      if (isEditMode) {
        console.log("Editing applicant:", selectedApplicant.id);
        await updateApplicant(selectedApplicant.id, formDataInstance);
      } else {
        console.log("Creating new applicant");
        await createApplicant(formDataInstance);
      }

      console.log("=== SUCCESS ===");
      setIsFormOpen(false);
      setResumeFile(null);
      setFormData(initialFormData);
      setFormErrors({});
      fetchData();
    } catch (err) {
      console.error("=== API ERROR DETAILS ===");
      console.error("Full error:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);

      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors;
        console.error("Validation errors object:", serverErrors);

        // SPECIFICALLY LOG THE SOURCE ERROR
        if (serverErrors.source) {
          console.error("Source error details:", serverErrors.source);
        }

        // Set form errors for display
        setFormErrors(serverErrors);

        if (serverErrors && typeof serverErrors === "object") {
          const errorMessages = Object.entries(serverErrors)
            .map(
              ([field, messages]) =>
                `• ${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("\n");
          alert(`Validation Errors:\n\n${errorMessages}`);
        } else {
          alert(`Validation error: ${JSON.stringify(err.response.data)}`);
        }
      } else {
        alert(
          `Error: ${
            err.response?.data?.message || "An unexpected error occurred"
          }`
        );
      }
    }
  };

  const handleOpenAddForm = () => {
    setIsEditMode(false);
    setFormData(initialFormData);
    setResumeFile(null);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEditApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    setFormData({
      ...applicant,
      status: applicant.status || "Applied",
      source: applicant.source || "LinkedIn",
    });
    setResumeFile(null);
    setFormErrors({});
    setIsEditMode(true);
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleDeleteApplicant = async (id) => {
    if (window.confirm("Are you sure you want to delete this applicant?")) {
      try {
        await deleteApplicant(id);
        fetchData();
      } catch (err) {
        alert("Could not delete applicant.");
        console.error(err);
      }
    }
  };

  const handleStatusUpdate = async (applicantId, newStatus) => {
    try {
      await updateApplicantStatus(applicantId, newStatus);
      fetchData();
      if (selectedApplicant?.id === applicantId) {
        setSelectedApplicant((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Could not update status.");
      console.error(err);
    }
  };

  const handleResumeDownload = async (applicant) => {
    try {
      const response = await downloadApplicantResume(applicant.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers["content-disposition"];
      let filename = `resume_${applicant.first_name}_${applicant.last_name}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2)
          filename = filenameMatch[1];
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Resume download failed:", err);
      alert("Could not download resume.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplicants.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    setIsDetailOpen(true);
  };

  const getStatusInfo = (statusValue) => {
    const statusOption = statusOptions.find((o) => o.value === statusValue);
    if (statusOption) return statusOption;

    // Fallback for any status values from API that aren't in our options
    return {
      color: "bg-gray-100 text-gray-800",
      label: statusValue?.replace(/-/g, " ") || "Unknown", // Convert "interview-scheduled" to "interview scheduled"
      borderColor: "border-gray-500",
    };
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <FiLoader className="animate-spin text-indigo-600 h-12 w-12" />
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 p-8 bg-gray-50">{error}</div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Applicant Tracking
          </h1>
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            <FiPlus className="h-5 w-5" /> Add Applicant
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          {statusOptions.map((status) => (
            <div
              key={status.value}
              className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${status.borderColor}`}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 rounded-md p-3 ${status.color}`}
                  >
                    <FiUsers className="h-6 w-6 text-gray-700" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {status.label}
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900">
                        {
                          applicants.filter((a) => a.status === status.value)
                            .length
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4">
              
              <select
                className="block w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="block w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
              >
                <option value="all">All Jobs</option>
                {jobOpenings.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Applicant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Applied For
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Applied Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((applicant) => {
                    const statusInfo = getStatusInfo(applicant.status);
                    return (
                      <tr key={applicant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-700 font-medium">
                                {applicant.first_name?.[0]}
                                {applicant.last_name?.[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {applicant.first_name} {applicant.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {applicant.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {jobOpenings.find(
                              (j) => j.id === applicant.job_opening_id
                            )?.title || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {applicant.applied_date
                              ? new Date(
                                  applicant.applied_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex items-center justify-center gap-x-2">
                            <button
                              onClick={() => handleViewApplicant(applicant)}
                              className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition-colors"
                              title="View Details"
                            >
                              <FiEye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditApplicant(applicant)}
                              className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                              title="Edit Applicant"
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteApplicant(applicant.id)
                              }
                              className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                              title="Delete Applicant"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      No applicants found for the selected workspace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredApplicants.length > itemsPerPage && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              {/* Pagination can be added here */}
            </div>
          )}
        </div>
      </main>

      {/* Applicant Detail Modal */}
      {isDetailOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsDetailOpen(false)}
            ></div>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
              <div className="px-4 pt-5 pb-4 sm:p-6 flex justify-between items-start">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Applicant Details
                </h3>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Full Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {selectedApplicant.first_name}{" "}
                      {selectedApplicant.last_name}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                    <dt className="text-sm font-medium text-gray-500">
                      Email & Phone
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {selectedApplicant.email} /{" "}
                      {selectedApplicant.phone || "N/A"}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Applied For
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {jobOpenings.find(
                        (j) => j.id === selectedApplicant.job_opening_id
                      )?.title || "N/A"}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                    <dt className="text-sm font-medium text-gray-500">
                      Status
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <select
                        className="block w-40 pl-3 pr-10 py-1 border-gray-300 rounded-md"
                        value={selectedApplicant.status}
                        onChange={(e) =>
                          handleStatusUpdate(
                            selectedApplicant.id,
                            e.target.value
                          )
                        }
                      >
                        {statusOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Cover Letter
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                      {selectedApplicant.cover_letter || "N/A"}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                    <dt className="text-sm font-medium text-gray-500">
                      Resume
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {selectedApplicant.resume_url ? (
                        <button
                          onClick={() =>
                            handleResumeDownload(selectedApplicant)
                          }
                          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <FiDownload />
                          Download Resume
                        </button>
                      ) : (
                        "No resume uploaded"
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="button"
                  onClick={() => handleEditApplicant(selectedApplicant)}
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applicant Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsFormOpen(false)}
            ></div>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isEditMode ? "Edit Applicant" : "Add New Applicant"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    {/* First Name */}
                    <div>
                      <label
                        htmlFor="first_name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        required
                        className={`block w-full border ${
                          formErrors.first_name
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 transition-colors outline-none`}
                        value={formData.first_name}
                        onChange={handleInputChange}
                      />
                      {formErrors.first_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.first_name[0]}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label
                        htmlFor="last_name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        id="last_name"
                        required
                        className={`block w-full border ${
                          formErrors.last_name
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 transition-colors outline-none`}
                        value={formData.last_name}
                        onChange={handleInputChange}
                      />
                      {formErrors.last_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.last_name[0]}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className={`block w-full border ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 transition-colors outline-none`}
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.email[0]}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        className={`block w-full border ${
                          formErrors.phone
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 transition-colors outline-none`}
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.phone[0]}
                        </p>
                      )}
                    </div>

                    {/* Job Opening */}
                    <div>
                      <label
                        htmlFor="job_opening_id"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Job Opening *
                      </label>
                      <select
                        name="job_opening_id"
                        id="job_opening_id"
                        required
                        className={`block w-full border ${
                          formErrors.job_opening_id
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 transition-colors outline-none`}
                        value={formData.job_opening_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a job</option>
                        {jobOpenings.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.title}
                          </option>
                        ))}
                      </select>
                      {formErrors.job_opening_id && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.job_opening_id[0]}
                        </p>
                      )}
                    </div>

                    {/* Source */}
                    <div>
                      <label
                        htmlFor="source"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Source *
                      </label>
                      <select
                        name="source"
                        id="source"
                        className={`block w-full border ${
                          formErrors.source
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 transition-colors outline-none`}
                        value={formData.source}
                        onChange={handleInputChange}
                      >
                        {sourceOptions.map((s) => (
                          <option key={s} value={s}>
                            {sourceLabels[s] || s}
                          </option>
                        ))}
                      </select>
                      {formErrors.source && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.source[0]}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Status *
                      </label>
                      <select
                        name="status"
                        id="status"
                        className={`block w-full border ${
                          formErrors.status
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 transition-colors outline-none`}
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        {statusOptions.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.status && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.status[0]}
                        </p>
                      )}
                    </div>

                    {/* Cover Letter */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="cover_letter"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Cover Letter
                      </label>
                      <textarea
                        name="cover_letter"
                        id="cover_letter"
                        rows={4}
                        className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 transition-colors outline-none"
                        value={formData.cover_letter}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Resume */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="resume"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Resume {!isEditMode && "*"}{" "}
                        {isEditMode && "(Optional: to replace existing)"}
                      </label>
                      <div
                        className={`mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 ${
                          formErrors.resume
                            ? "border-red-500"
                            : "border-gray-300"
                        } border-dashed rounded-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition-colors`}
                      >
                        <div className="space-y-1 text-center">
                          <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="resume"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="resume"
                                name="resume"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX up to 5MB
                          </p>
                          {resumeFile && (
                            <p className="text-sm font-semibold text-green-600 pt-2">
                              Selected: {resumeFile.name}
                            </p>
                          )}
                          {formErrors.resume && (
                            <p className="text-red-500 text-xs mt-1">
                              {formErrors.resume[0]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditMode ? "Update Applicant" : "Create Applicant"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;
