import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaExternalLinkAlt,
  FaTimes,
  FaBook,
  FaCheckDouble,
} from "react-icons/fa";

const INITIAL_POLICIES = [
  {
    id: 1,
    title: "Acceptance and Refusal of Authorisations Policy",
    link: "https://example.com/policy/acceptance-and-refusal",
    checked: false,
  },
  {
    id: 2,
    title: "Behaviour Guidance Policy",
    link: "https://example.com/policy/behaviour-guidance",
    checked: false,
  },
  {
    id: 3,
    title: "Child Safe Environment Policy",
    link: "https://example.com/policy/child-safe-environment",
    checked: false,
  },
  {
    id: 4,
    title: "Child Safe Standards and Child Safe Culture",
    link: "https://example.com/policy/child-safe-standards",
    checked: false,
  },
  {
    id: 5,
    title: "Child Safe Code of Conduct Policy",
    link: "https://example.com/policy/child-safe-code-of-conduct",
    checked: false,
  },
  {
    id: 6,
    title: "Collection of children procedure",
    link: "https://example.com/policy/collection-of-children",
    checked: false,
  },
  {
    id: 7,
    title: "Conflict of Interest and Fraud Prevention Policy",
    link: "https://example.com/policy/conflict-of-interest",
    checked: false,
  },
  {
    id: 8,
    title: "Educational Program and Planning Policy",
    link: "https://example.com/policy/educational-program",
    checked: false,
  },
  {
    id: 9,
    title: "Emergency and Evacuation Policy",
    link: "https://example.com/policy/emergency-and-evacuation",
    checked: false,
  },
  {
    id: 10,
    title: "Families and Visitors Code of Conduct Policy",
    link: "https://example.com/policy/families-and-visitors-conduct",
    checked: false,
  },
  {
    id: 11,
    title: "Governance and Management Policy",
    link: "https://example.com/policy/governance-and-management",
    checked: false,
  },
  {
    id: 12,
    title: "Grievance and Complaints Policy",
    link: "https://example.com/policy/grievance-and-complaints",
    checked: false,
  },
  {
    id: 13,
    title: "Inclusion & Anti Bias Policy",
    link: "https://example.com/policy/inclusion-anti-bias",
    checked: false,
  },
  {
    id: 14,
    title: "Leave policies (annual leave, personal leave)",
    link: "https://example.com/policy/leave-policies",
    checked: false,
  },
  {
    id: 15,
    title: "Medical Conditions Policy (Anaphylaxis, Asthma etc.)",
    link: "https://example.com/policy/medical-conditions",
    checked: false,
  },
  {
    id: 16,
    title: "Privacy and Confidentiality Policy",
    link: "https://example.com/policy/privacy-and-confidentiality",
    checked: false,
  },
  {
    id: 17,
    title: "Sleep and Rest Policy",
    link: "https://example.com/policy/sleep-and-rest",
    checked: false,
  },
  {
    id: 18,
    title: "Safe arrival of children policy",
    link: "https://example.com/policy/safe-arrival",
    checked: false,
  },
  {
    id: 19,
    title: "Staff code of Conduct Policy",
    link: "https://example.com/policy/staff-code-of-conduct",
    checked: false,
  },
  {
    id: 20,
    title: "Sun Safety and protection Policy",
    link: "https://example.com/policy/sun-safety",
    checked: false,
  },
  {
    id: 21,
    title: "Technology and Device Usage Policy",
    link: "https://example.com/policy/technology-and-devices",
    checked: false,
  },
  {
    id: 22,
    title: "Uniform policy",
    link: "https://example.com/policy/uniform-policy",
    checked: false,
  },
  {
    id: 23,
    title: "Work Health and Safety policy",
    link: "https://example.com/policy/work-health-and-safety",
    checked: false,
  },
];

const Policies = () => {
  const [policies, setPolicies] = useState(INITIAL_POLICIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    link: "",
  });

  const handleTogglePolicy = (id) => {
    setPolicies(
      policies.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p))
    );
  };

  const handleSelectAll = () => {
    const allChecked = policies.every((p) => p.checked);
    setPolicies(policies.map((p) => ({ ...p, checked: !allChecked })));
    toast.info(allChecked ? "Deselected all policies" : "Selected all policies");
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ title: "", link: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (policy) => {
    setModalMode("edit");
    setSelectedPolicy(policy);
    setFormData({ title: policy.title, link: policy.link });
    setIsModalOpen(true);
  };

  const handleDeletePolicy = (id) => {
    setPolicies(policies.filter((p) => p.id !== id));
    toast.success("Policy deleted successfully!");
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Policy title is required");
      return;
    }

    const formattedLink = formData.link.trim() || "#";

    if (modalMode === "add") {
      const newPolicy = {
        id: Date.now(),
        title: formData.title.trim(),
        link: formattedLink,
        checked: false,
      };
      setPolicies([...policies, newPolicy]);
      toast.success("Policy added successfully!");
    } else {
      setPolicies(
        policies.map((p) =>
          p.id === selectedPolicy.id
            ? { ...p, title: formData.title.trim(), link: formattedLink }
            : p
        )
      );
      toast.success("Policy updated successfully!");
    }

    setIsModalOpen(false);
  };

  const completedCount = policies.filter((p) => p.checked).length;
  const progressPercent = policies.length
    ? Math.round((completedCount / policies.length) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-2">
      <ToastContainer position="top-right" />

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Company Policies</h1>
          <p className="text-gray-600 mt-1">
            Please read and acknowledge the onboarding policies
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none"
        >
          <FaPlus size={14} />
          Add Policy
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Read & Acknowledged Progress
          </span>
          <span className="text-sm font-bold text-blue-600">
            {completedCount} of {policies.length} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-200"
          >
            <FaCheckDouble size={12} className="text-gray-500" />
            {policies.every((p) => p.checked)
              ? "Deselect All Policies"
              : "Acknowledge All Policies"}
          </button>
        </div>
      </div>

      {/* Policies List Container */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <FaBook size={48} className="text-gray-300 mb-3" />
            <p className="text-lg font-medium">No policies found</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Add Policy" to start adding documents.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className={`flex items-center justify-between p-4 hover:bg-blue-50/30 transition-colors ${
                  policy.checked ? "bg-gray-50/30" : ""
                }`}
              >
                {/* Left side: Custom Checkbox + Policy Name */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                  <button
                    type="button"
                    onClick={() => handleTogglePolicy(policy.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      policy.checked
                        ? "bg-white border-green-500 text-green-600 shadow-sm"
                        : "bg-white border-gray-300 hover:border-green-500 text-transparent"
                    }`}
                    title={
                      policy.checked ? "Mark as unread" : "Mark as read"
                    }
                  >
                    <FaCheck
                      size={10}
                      className={`transition-opacity ${
                        policy.checked ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                  <span
                    onClick={() => handleTogglePolicy(policy.id)}
                    className={`text-sm font-medium select-none cursor-pointer truncate ${
                      policy.checked
                        ? "text-gray-400 line-through decoration-gray-300"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    {policy.title}
                  </span>
                </div>

                {/* Right side: Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={policy.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Policy link"
                  >
                    <FaExternalLinkAlt size={13} />
                  </a>
                  <button
                    onClick={() => openEditModal(policy)}
                    className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Edit Policy"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Policy"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {modalMode === "add" ? "Add New Policy" : "Edit Policy"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit}>
              <div className="px-6 py-5 space-y-4">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Policy Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter policy title..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>

                {/* Link Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Policy Link / URL
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="Enter policy URL (optional)..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow"
                >
                  {modalMode === "add" ? "Add Policy" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
