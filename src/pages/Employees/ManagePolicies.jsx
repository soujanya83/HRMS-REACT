import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosClient from "../../axiosClient";
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaTimes,
  FaSearch,
  FaBook,
  FaExternalLinkAlt,
  FaSpinner,
} from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortablePolicyItem = ({ policy, index, onView, onEdit, onDelete, dragDisabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: policy.id, disabled: dragDisabled });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition || "transform 200ms ease, shadow-md 200ms ease",
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 px-6 py-4 transition-all bg-white border-b border-gray-200 relative ${
        isDragging
          ? "border-blue-400 shadow-xl scale-[1.01] ring-4 ring-blue-50/50 cursor-grabbing z-10 animate-pulse bg-blue-50/10"
          : "hover:bg-gray-50/50"
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 flex items-center justify-center select-none shrink-0 w-10"
        title="Drag to reorder"
      >
        <svg
          className="w-4 h-4 text-gray-400 hover:text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      {/* Sr. No */}
      <div className="w-16 shrink-0 text-sm font-medium text-gray-900 select-none">
        {index + 1}
      </div>

      {/* Policy Name */}
      <div className="flex-1 min-w-[200px] text-sm font-semibold text-gray-800 break-words pr-2">
        {policy.policy_name}
      </div>

      {/* Policy Link */}
      <div className="flex-1 min-w-[250px] text-sm text-blue-600 break-all pr-2">
        {policy.description ? (
          <a
            href={policy.description}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1.5 inline-flex"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate max-w-[280px]">{policy.description}</span>
            <FaExternalLinkAlt size={11} className="text-blue-500 shrink-0" />
          </a>
        ) : (
          <span className="text-gray-400 italic">No URL provided</span>
        )}
      </div>

      {/* Actions */}
      <div className="w-36 shrink-0 flex justify-center items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {policy.description && (
          <a
            href={policy.description}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
            title="View Link"
          >
            <FaEye size={14} />
          </a>
        )}
        <button
          onClick={() => onEdit(policy)}
          className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
          title="Edit"
        >
          <FaEdit size={14} />
        </button>
        <button
          onClick={() => onDelete(policy.id, policy.policy_name)}
          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <FaTrash size={14} />
        </button>
      </div>
    </div>
  );
};

const ManagePolicies = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    link: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // URL format helper validation
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // Fetch policies from backend
  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/policy-masters");
      if (response.data && response.data.data) {
        const sorted = [...response.data.data].sort((a, b) => a.sort_order - b.sort_order);
        setPolicies(sorted);
      } else if (response.data && Array.isArray(response.data)) {
        const sorted = [...response.data].sort((a, b) => a.sort_order - b.sort_order);
        setPolicies(sorted);
      } else {
        setPolicies([]);
      }
    } catch (err) {
      console.error("Error fetching policies:", err);
      toast.error("Failed to load policies from server");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const oldIndex = policies.findIndex((item) => item.id === active.id);
      const newIndex = policies.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(policies, oldIndex, newIndex);
      setPolicies(newOrder);

      const payload = {
        policies: newOrder.map((policy, index) => ({
          id: policy.id,
          sort_order: index + 1,
        })),
      };

      try {
        const response = await axiosClient.post("/policy-masters/update-order", payload);
        if (response.data && response.data.status) {
          toast.success(response.data.message || "Order Updated");
        } else {
          toast.error("Failed to update policy order");
        }
      } catch (err) {
        console.error("Error updating policy order:", err);
        toast.error("Failed to save policy order on server");
        fetchPolicies();
      }
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ title: "", link: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (policy) => {
    setModalMode("edit");
    setSelectedPolicy(policy);
    setFormData({ title: policy.policy_name || "", link: policy.description || "" });
    setIsModalOpen(true);
  };

  const handleDeletePolicy = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the policy "${title}"?`)) {
      try {
        const response = await axiosClient.delete(`/policy-masters/${id}`);
        if (response.data && response.data.status) {
          toast.success(response.data.message || "Deleted Successfully");
          fetchPolicies();
        } else {
          toast.error("Failed to delete policy");
        }
      } catch (err) {
        console.error("Error deleting policy:", err);
        toast.error("Failed to delete policy on server");
      }
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    
    // Strict Validation:
    const trimmedTitle = formData.title.trim();
    const trimmedLink = formData.link.trim();

    if (!trimmedTitle) {
      toast.error("Policy Name is required");
      return;
    }

    if (!trimmedLink) {
      toast.error("Policy Link / URL is required");
      return;
    }

    if (!isValidUrl(trimmedLink)) {
      toast.error("Please enter a valid URL (starting with http:// or https://)");
      return;
    }

    const generatedSlug = trimmedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    setSubmitting(true);
    try {
      if (modalMode === "add") {
        const payload = {
          policy_name: trimmedTitle,
          description: trimmedLink, // Link goes into description field
          slug: generatedSlug,
        };

        const response = await axiosClient.post("/policy-masters", payload);
        if (response.data && response.data.status) {
          toast.success(response.data.message || "Policy Created");
          fetchPolicies();
          setIsModalOpen(false);
        } else {
          toast.error(response.data?.message || "Failed to create policy");
        }
      } else {
        const payload = {
          policy_name: trimmedTitle,
          description: trimmedLink, // Link goes into description field
          slug: generatedSlug,
          is_required: 1,
        };

        const response = await axiosClient.put(`/policy-masters/${selectedPolicy.id}`, payload);
        if (response.data && response.data.status) {
          toast.success(response.data.message || "Updated Successfully");
          fetchPolicies();
          setIsModalOpen(false);
        } else {
          toast.error(response.data?.message || "Failed to update policy");
        }
      }
    } catch (err) {
      console.error("Error saving policy:", err);
      toast.error(err.response?.data?.message || "Failed to save policy on server");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPolicies = policies.filter((policy) =>
    (policy.policy_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-6xl mx-auto">
        {/* Back Button and Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard/employees")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors mb-4 focus:outline-none"
          >
            <FaArrowLeft size={14} /> Back to Employees
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Manage Onboarding Policies
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Create, read, update, and delete company policies completed by employees during onboarding.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none"
            >
              <FaPlus size={14} />
              Add Policy
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="relative max-w-md w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Search policies by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Table / List */}
          <div className="overflow-x-auto min-w-[700px]">
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-500 bg-white">
                <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="font-semibold text-gray-700">Loading policies from server...</p>
              </div>
            ) : filteredPolicies.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500 bg-white">
                <FaBook size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-700">No policies found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchTerm ? "No match for your search criteria." : "Create a policy to get started."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="flex items-center gap-4 px-6 py-3.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider select-none">
                  <div className="w-10 shrink-0"></div>
                  <div className="w-16 shrink-0">Sr. No.</div>
                  <div className="flex-1 min-w-[200px]">Policy Name</div>
                  <div className="flex-1 min-w-[250px]">Policy Link / Document URL</div>
                  <div className="w-36 shrink-0 text-center">Actions</div>
                </div>

                {/* Table Body - Sortable */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredPolicies.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col bg-white">
                      {filteredPolicies.map((policy, index) => (
                        <SortablePolicyItem
                          key={policy.id}
                          policy={policy}
                          index={index}
                          onView={(p) => window.open(p.description, "_blank")}
                          onEdit={openEditModal}
                          onDelete={handleDeletePolicy}
                          dragDisabled={!!searchTerm}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          {/* Table Footer */}
          {!loading && filteredPolicies.length > 0 && (
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200">
              <span className="text-xs text-gray-600">
                Showing <span className="font-semibold">{filteredPolicies.length}</span> of{" "}
                <span className="font-semibold">{policies.length}</span> policies
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {modalMode === "add" ? "Add New Policy" : "Edit Policy"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                disabled={submitting}
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
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white"
                    disabled={submitting}
                  />
                </div>

                {/* Link Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Policy Link / URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="Enter policy URL (starting with http:// or https://)..."
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow flex items-center gap-1.5"
                  disabled={submitting}
                >
                  {submitting && <FaSpinner className="animate-spin text-xs" />}
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

export default ManagePolicies;
