// OrganizationsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronDown,
  HiArrowLeft,
  HiOutlineOfficeBuilding,
  HiX,
  HiViewList,
  HiViewGrid,
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
  getDesignationsByOrgId,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "../services/organizationService";

// ============================================
// COLOR PALETTE ICON (Same as Dashboard)
// ============================================
const ColorPaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.03 2 11c0 3.87 3.13 7 7 7h1c.55 0 1 .45 1 1 0 1.1.9 2 2 2 4.42 0 8-3.58 8-8 0-6.08-4.92-11-11-11z" fill="white"/>
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
              className={`p-3 rounded-xl text-white text-sm font-semibold transition-all ${
                currentSidebarColor === c.value ? "ring-2 ring-blue-500" : ""
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
              className={`p-3 rounded-xl text-sm font-medium border ${
                currentBgColor === c.value ? "ring-2 ring-blue-500" : ""
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

// Timezone data with Australian timezones prioritized
const TIMEZONES = [
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Perth",
  "Australia/Adelaide",
  "Australia/Canberra",
  "Australia/Hobart",
  "Australia/Darwin",
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
  "Education",
  "Healthcare",
  "Social Assistance",
  "Youth Services",
  "Community Services",
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

// Color options for rooms - Updated with exact colors from image
const COLOR_OPTIONS = [
  { value: "#8176B7", label: "Lavender", code: "lavender" },
  { value: "#CFA5CA", label: "Light Pink", code: "light-pink" },
  { value: "#C57F9A", label: "Dusty Rose", code: "dusty-rose" },
  { value: "#3FA2DB", label: "Sky Blue", code: "sky-blue" },
  { value: "#8DBA90", label: "Sage Green", code: "sage-green" },
  { value: "#EBAF94", label: "Peach", code: "peach" },
  { value: "#CAC87F", label: "Olive Green", code: "olive-green" },
  { value: "#A4A1A2", label: "Gray", code: "gray" },
];

// Room data with names, age groups, and colors - MATCHING IMAGE
const ROOM_TEMPLATES = [
  {
    name: "Cozy Nido",
    ageGroup: "6 - 12 months",
    colorCode: "#8176B7",
    colorLabel: "Lavender",
    icon: "🍼",
    description:
      "A warm, nurturing space for our youngest learners. Focus on sensory exploration and building secure attachments.",
  },
  {
    name: "Little Sprouts",
    ageGroup: "12 - 24 Months",
    colorCode: "#CFA5CA",
    colorLabel: "Light Pink",
    icon: "🌱",
    description:
      "Toddlers discover independence through play-based learning, language development, and social interaction.",
  },
  {
    name: "Investigator's Hub",
    ageGroup: "2 - 3 Years",
    colorCode: "#C57F9A",
    colorLabel: "Dusty Rose",
    icon: "🔍",
    description:
      "Curious preschoolers explore, question, and investigate the world around them through hands-on activities.",
  },
  {
    name: "Creator's Studio",
    ageGroup: "3 - 5 Years (Non Kinder)",
    colorCode: "#3FA2DB",
    colorLabel: "Sky Blue",
    icon: "🎨",
    description:
      "Creative expression through art, music, and imaginative play. Developing fine motor skills and self-expression.",
  },
  {
    name: "Dreamer's Den",
    ageGroup: "3 Years Kinder",
    colorCode: "#8DBA90",
    colorLabel: "Sage Green",
    icon: "💭",
    description:
      "Kindergarten readiness program focusing on literacy, numeracy, and social-emotional development.",
  },
  {
    name: "Inventor's Lab",
    ageGroup: "4 Years Kinder",
    colorCode: "#EBAF94",
    colorLabel: "Peach",
    icon: "🔬",
    description:
      "STEM-focused learning with experiments, construction, and problem-solving activities.",
  },
];

// Kitchen and Management room templates
const OTHER_ROOM_TEMPLATES = [
  {
    name: "Kitchen",
    ageGroup: "All Ages",
    colorCode: "#CAC87F",
    colorLabel: "Olive Green",
    icon: "🍳",
    description:
      "Nutrition and culinary experiences. Teaching healthy eating habits and food preparation skills.",
  },
  {
    name: "Management",
    ageGroup: "Staff Only",
    colorCode: "#A4A1A2",
    colorLabel: "Gray",
    icon: "📋",
    description:
      "Administrative office for center management, parent communications, and staff coordination.",
  },
];

// All room templates combined
const ALL_ROOM_TEMPLATES = [...ROOM_TEMPLATES, ...OTHER_ROOM_TEMPLATES];

// Age group options with icons - Updated to match image
const AGE_GROUPS = [
  {
    value: "6 - 12 months",
    label: "6 - 12 months",
    icon: "🍼",
    colorHint: "#8176B7",
  },
  {
    value: "12 - 24 Months",
    label: "12 - 24 Months",
    icon: "🌱",
    colorHint: "#CFA5CA",
  },
  {
    value: "2 - 3 Years",
    label: "2 - 3 Years",
    icon: "🔍",
    colorHint: "#C57F9A",
  },
  {
    value: "3 - 5 Years (Non Kinder)",
    label: "3 - 5 Years (Non Kinder)",
    icon: "🎨",
    colorHint: "#3FA2DB",
  },
  {
    value: "3 Years Kinder",
    label: "3 Years Kinder",
    icon: "💭",
    colorHint: "#8DBA90",
  },
  {
    value: "4 Years Kinder",
    label: "4 Years Kinder",
    icon: "🔬",
    colorHint: "#EBAF94",
  },
  { value: "All Ages", label: "All Ages", icon: "👥", colorHint: "#CAC87F" },
  {
    value: "Staff Only",
    label: "Staff Only",
    icon: "👔",
    colorHint: "#A4A1A2",
  },
];

// Helper function to extract color from localStorage
const extractColorFromCode = (roomId, defaultColor = "#3FA2DB") => {
  const savedColor = localStorage.getItem(`room_color_${roomId}`);
  if (savedColor) {
    return savedColor;
  }
  return defaultColor;
};

// Save color to localStorage
const saveColorToStorage = (roomId, colorCode) => {
  const colorOption = COLOR_OPTIONS.find((c) => c.code === colorCode);
  if (colorOption) {
    localStorage.setItem(`room_color_${roomId}`, colorOption.value);
  }
};

// Get color option from localStorage
const getColorOption = (roomId) => {
  const savedColor = localStorage.getItem(`room_color_${roomId}`);
  if (savedColor) {
    const option = COLOR_OPTIONS.find((c) => c.value === savedColor);
    if (option) return option;
  }
  return COLOR_OPTIONS.find((c) => c.value === "#3FA2DB");
};

// Get color code from value
const getColorCode = (value) => {
  if (!value) return "sky-blue";

  const hexOption = COLOR_OPTIONS.find((opt) => opt.value === value);
  if (hexOption) return hexOption.code;

  const labelOption = COLOR_OPTIONS.find(
    (opt) => opt.label.toLowerCase() === value.toLowerCase(),
  );
  if (labelOption) return labelOption.code;

  const codeOption = COLOR_OPTIONS.find((opt) => opt.code === value);
  if (codeOption) return codeOption.code;

  return "sky-blue";
};

// Get age group icon
const getAgeGroupIcon = (ageGroup) => {
  if (!ageGroup) return "👶";
  const found = AGE_GROUPS.find((ag) => ag.value === ageGroup);
  return found ? found.icon : "👶";
};

// Get color for age group
const getColorForAgeGroup = (ageGroup) => {
  const found = AGE_GROUPS.find((ag) => ag.value === ageGroup);
  if (found && found.colorHint) return found.colorHint;

  // Match with room templates
  const roomTemplate = ALL_ROOM_TEMPLATES.find(
    (room) => room.ageGroup === ageGroup,
  );
  if (roomTemplate) return roomTemplate.colorCode;

  return "#3FA2DB";
};

// Helper function to get color with opacity
const getColorWithOpacity = (colorValue, opacity = 0.1) => {
  if (!colorValue) return `rgba(63, 162, 219, ${opacity})`;

  if (colorValue.startsWith("#")) {
    const r = parseInt(colorValue.slice(1, 3), 16);
    const g = parseInt(colorValue.slice(3, 5), 16);
    const b = parseInt(colorValue.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return colorValue;
};

// Color Palette Component (For Rooms - kept separate)
const RoomColorPalette = ({ isOpen, onClose, onColorSelect }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-20 transition-opacity z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Choose Room Color
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <HiX size={24} />
            </button>
          </div>

          <div className="space-y-3">
            {COLOR_OPTIONS.map((color, index) => (
              <button
                key={index}
                onClick={() => {
                  onColorSelect(color.value);
                  onClose();
                }}
                className="w-full p-3 rounded-lg transition-transform hover:scale-105 flex items-center justify-between border border-gray-200"
                style={{ backgroundColor: color.value }}
              >
                <span className="font-medium text-white drop-shadow-sm">
                  {color.label}
                </span>
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: color.value }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

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

// ColorPicker Component
const ColorPicker = ({ label, name, value, onChange, error }) => {
  const currentCode = getColorCode(value);
  const selectedColor = COLOR_OPTIONS.find((c) => c.code === currentCode);

  const handleColorChange = (e) => {
    const event = {
      target: {
        name: name,
        value: e.target.value,
      },
    };
    onChange(event);
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <div className="flex-1">
          <select
            id={name}
            name={name}
            value={currentCode}
            onChange={handleColorChange}
            className={`block w-full px-3 py-2 bg-white border ${
              error ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            {COLOR_OPTIONS.map((color) => (
              <option key={color.code} value={color.code}>
                {color.label}
              </option>
            ))}
          </select>
        </div>
        <div
          className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: selectedColor?.value || "#3FA2DB" }}
          title={selectedColor?.label || "Sky Blue"}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
    </div>
  );
};

// Create contexts for modal management
const DesignationModalContext = React.createContext();
const RoomModalContext = React.createContext();

function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [activeTab, setActiveTab] = useState("rooms");
  const [backgroundColor, setBackgroundColor] = useState("#f9fafb");
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem('sidebarColor') || '#1a4d4d';
  });
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [currentOrgId, setCurrentOrgId] = useState(null);
  const [isRoomConfirmOpen, setIsRoomConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const [isDesignationModalOpen, setIsDesignationModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [isDesignationConfirmOpen, setIsDesignationConfirmOpen] =
    useState(false);
  const [designationToDelete, setDesignationToDelete] = useState(null);

  // Save sidebar color to localStorage when changed
  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
    // Dispatch custom event to update sidebar
    window.dispatchEvent(new CustomEvent('sidebarColorUpdate', { detail: { color: sidebarColor } }));
  }, [sidebarColor]);

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getOrganizations();

      let organizationsData = [];

      if (response && response.success === true) {
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          organizationsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          organizationsData = response.data;
        } else if (Array.isArray(response)) {
          organizationsData = response;
        }
      }

      setOrganizations(organizationsData);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError(err.response?.data?.message || "Failed to fetch organizations.");
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleSave = async (orgData) => {
    setIsSubmitting(true);

    try {
      let apiResponse;

      if (editingOrg) {
        apiResponse = await updateOrganization(editingOrg.id, orgData);
      } else {
        apiResponse = await createOrganization(orgData);
      }

      if (apiResponse.success !== true) {
        throw new Error(apiResponse.message || "API returned unsuccessful");
      }

      await fetchOrganizations();

      if (selectedOrg && editingOrg && selectedOrg.id === editingOrg.id) {
        const updatedOrgData = apiResponse.data;
        setSelectedOrg(updatedOrgData);
      }

      setIsModalOpen(false);
      setEditingOrg(null);

      alert(
        apiResponse.message ||
          (editingOrg
            ? "Organization updated successfully!"
            : "Organization created successfully!"),
      );
    } catch (err) {
      console.error("Error in handleSave:", err);

      let errorMessage = "Failed to save organization. ";

      if (err.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
        localStorage.removeItem("ACCESS_TOKEN");
        setTimeout(() => (window.location.href = "/login"), 1000);
      } else if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        errorMessage =
          "Validation errors:\n" +
          (errors
            ? Object.entries(errors)
                .map(
                  ([field, msgs]) =>
                    `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`,
                )
                .join("\n")
            : "Invalid data provided.");
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
        alert("Organization deleted successfully!");
      } catch (err) {
        console.error("Failed to delete organization:", err);
        alert(err.response?.data?.message || "Failed to delete organization");
      } finally {
        setIsConfirmOpen(false);
        setOrgToDelete(null);
      }
    }
  };

  const handleOpenRoomModal = (orgId, room = null) => {
    setCurrentOrgId(orgId);
    setEditingRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleCloseRoomModal = () => {
    setIsRoomModalOpen(false);
    setEditingRoom(null);
    setCurrentOrgId(null);
  };

  const handleSaveRoom = async (roomData) => {
    setIsSubmitting(true);
    try {
      console.log("Saving room with data:", roomData);

      const apiData = {
        name: roomData.name,
        description: roomData.description || "",
      };

      let response;
      if (editingRoom) {
        response = await updateDepartment(editingRoom.id, apiData);
      } else {
        response = await createDepartment(currentOrgId, apiData);
      }

      console.log("Save room response:", response);

      if (response && response.success === true) {
        if (editingRoom) {
          saveColorToStorage(editingRoom.id, roomData.color_code);
        } else if (response.data && response.data.id) {
          saveColorToStorage(response.data.id, roomData.color_code);
        }

        handleCloseRoomModal();
        window.location.reload();
        alert(response.message || "Room saved successfully!");
      } else {
        throw new Error(response?.message || "Failed to save room");
      }
    } catch (err) {
      console.error("Failed to save room:", err);
      alert(
        err.response?.data?.message || err.message || "Failed to save room",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoomDeleteClick = (room) => {
    setRoomToDelete(room);
    setIsRoomConfirmOpen(true);
  };

  const handleRoomDeleteConfirm = async () => {
    if (roomToDelete) {
      try {
        await deleteDepartment(roomToDelete.id);
        localStorage.removeItem(`room_color_${roomToDelete.id}`);
        setIsRoomConfirmOpen(false);
        setRoomToDelete(null);
        window.location.reload();
        alert("Room deleted successfully!");
      } catch (err) {
        console.error("Failed to delete room:", err);
        alert(err.response?.data?.message || "Failed to delete room");
      }
    }
  };

  const handleOpenDesignationModal = (designation = null) => {
    setEditingDesignation(designation);
    setIsDesignationModalOpen(true);
  };

  const handleCloseDesignationModal = () => {
    setIsDesignationModalOpen(false);
    setEditingDesignation(null);
  };

  const handleSaveDesignation = async (designationData) => {
    setIsSubmitting(true);
    try {
      let response;
      if (editingDesignation) {
        response = await updateDesignation(
          editingDesignation.id,
          designationData,
        );
      } else {
        response = await createDesignation(selectedOrg.id, designationData);
      }

      if (response && response.success === true) {
        handleCloseDesignationModal();
        window.location.reload();
        alert(response.message || "Designation saved successfully!");
      } else {
        throw new Error(response?.message || "Failed to save designation");
      }
    } catch (err) {
      console.error("Failed to save designation:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to save designation",
      );
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
        window.location.reload();
        alert("Designation deleted successfully!");
      } catch (err) {
        console.error("Failed to delete designation:", err);
        alert(err.response?.data?.message || "Failed to delete designation");
      }
    }
  };

  const roomModalContextValue = {
    openRoomModal: handleOpenRoomModal,
    deleteRoom: handleRoomDeleteClick,
  };

  const designationModalContextValue = {
    openDesignationModal: handleOpenDesignationModal,
    deleteDesignation: handleDesignationDeleteClick,
  };

  return (
    <RoomModalContext.Provider value={roomModalContextValue}>
      <DesignationModalContext.Provider value={designationModalContextValue}>
        {/* Color Palette Button - Same as Dashboard */}
        <button
          onClick={() => setIsColorPaletteOpen(true)}
          className="fixed right-6 bottom-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl transition-all z-50"
        >
          <ColorPaletteIcon />
        </button>

        {/* Color Palette Modal - Same as Dashboard */}
        <ColorPaletteModal
          isOpen={isColorPaletteOpen}
          onClose={() => setIsColorPaletteOpen(false)}
          onSidebarColorSelect={(color) => {
            console.log('Setting sidebar color to:', color);
            setSidebarColor(color);
            localStorage.setItem('sidebarColor', color);
          }}
          onBackgroundColorSelect={(color) => {
            console.log('Setting background color to:', color);
            setBackgroundColor(color);
            localStorage.setItem('backgroundColor', color);
          }}
          currentSidebarColor={sidebarColor}
          currentBgColor={backgroundColor}
        />

        <div
          className="p-4 sm:p-6 lg:p-8 font-sans min-h-full transition-colors duration-300"
          style={{ backgroundColor }}
        >
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
                activeTab={activeTab}
                onTabChange={setActiveTab}
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
          title="Delete Center"
          message={`Are you sure you want to delete "${orgToDelete?.name}"? This action cannot be undone.`}
        />

        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={handleCloseRoomModal}
          onSave={handleSaveRoom}
          room={editingRoom}
          isSubmitting={isSubmitting}
        />

        <ConfirmationModal
          isOpen={isRoomConfirmOpen}
          onClose={() => {
            setIsRoomConfirmOpen(false);
            setRoomToDelete(null);
          }}
          onConfirm={handleRoomDeleteConfirm}
          title="Delete Room"
          message={`Are you sure you want to delete "${roomToDelete?.name}"? This action cannot be undone.`}
        />

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
    </RoomModalContext.Provider>
  );
}

// ============ Sub-Components (same as before) ============

function OrganizationListView({
  isLoading,
  error,
  organizations,
  onSelectOrg,
  onAdd,
  onEdit,
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Childcare Centers</h1>
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
              {organization.registration_number &&
                ` • ${organization.registration_number}`}
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

function OrganizationDetailView({
  organization,
  onBack,
  onEdit,
  activeTab,
  onTabChange,
}) {
  const roomModalContext = React.useContext(RoomModalContext);
  const designationModalContext = React.useContext(DesignationModalContext);

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
                  <p className="font-medium">
                    {organization.registration_number || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">
                    {organization.contact_email || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">
                    {organization.contact_phone || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium">
                    {organization.industry_type || "Not specified"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {organization.address || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timezone</p>
                  <p className="font-medium">
                    {organization.timezone || "Australia/Sydney"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created Date</p>
                  <p className="font-medium">
                    {new Date(organization.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
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

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => onTabChange("rooms")}
            className={`pb-4 px-1 font-medium text-sm border-b-2 transition ${
              activeTab === "rooms"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => onTabChange("designations")}
            className={`pb-4 px-1 font-medium text-sm border-b-2 transition ${
              activeTab === "designations"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Designations
          </button>
        </nav>
      </div>

      {activeTab === "rooms" ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Rooms</h2>
            <button
              onClick={() => roomModalContext.openRoomModal(organization.id)}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition"
            >
              <HiPlus /> Add New Room
            </button>
          </div>
          <RoomsList orgId={organization.id} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Designations</h2>
            <button
              onClick={() => designationModalContext.openDesignationModal()}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition"
            >
              <HiPlus /> Add New Designation
            </button>
          </div>
          <DesignationsList orgId={organization.id} />
        </div>
      )}
    </div>
  );
}

// Rooms List Component
function RoomsList({ orgId }) {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const roomModalContext = React.useContext(RoomModalContext);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDepartmentsByOrgId(orgId);
      console.log("Rooms API response:", response);

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

      console.log("Processed rooms data:", roomsData);
      setRooms(roomsData);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
      setError(error.response?.data?.message || "Failed to load rooms");
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading rooms...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <HiOutlineOfficeBuilding className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No Rooms Added Yet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Click "Add New Room" to create your first room.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {ALL_ROOM_TEMPLATES.map((template, idx) => (
            <button
              key={idx}
              onClick={() => roomModalContext.openRoomModal(orgId, null)}
              className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: template.colorCode }}
                >
                  <span className="text-lg">{template.icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{template.name}</p>
                  <p className="text-xs text-gray-500">{template.ageGroup}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <HiViewList className="inline mr-1" /> List
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <HiViewGrid className="inline mr-1" /> Grid
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="space-y-3">
          {rooms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              onEdit={() => roomModalContext.openRoomModal(orgId, room)}
              onDelete={() => roomModalContext.deleteRoom(room)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            // Find matching template for default color
            const matchingTemplate = ALL_ROOM_TEMPLATES.find(
              (t) => t.name === room.name,
            );
            const defaultColor = matchingTemplate?.colorCode || "#3FA2DB";
            const roomHexColor = extractColorFromCode(room.id, defaultColor);

            return (
              <RoomCard
                key={room.id}
                room={room}
                roomHexColor={roomHexColor}
                onEdit={() => roomModalContext.openRoomModal(orgId, room)}
                onDelete={() => roomModalContext.deleteRoom(room)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Room Item Component (List View)
function RoomItem({ room, onEdit, onDelete }) {
  const defaultColor = "#3FA2DB";
  const roomHexColor = extractColorFromCode(room.id, defaultColor);

  // Get age group icon
  const ageGroupIcon = getAgeGroupIcon(room.age_group);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
      <div className="flex">
        <div
          className="w-2 flex-shrink-0"
          style={{ backgroundColor: roomHexColor }}
        />
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                  style={{ backgroundColor: roomHexColor }}
                >
                  {room.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {room.name}
                  </h3>
                  {room.age_group && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-lg">{ageGroupIcon}</span>
                      <span className="text-sm text-gray-600">
                        {room.age_group}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {room.description && (
                <p className="text-gray-600 text-sm mt-3 bg-gray-50 p-3 rounded-lg">
                  {room.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onEdit}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                title="Edit Room"
              >
                <HiPencil size={18} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete Room"
              >
                <HiTrash size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Room Card Component (Grid View)
function RoomCard({ room, roomHexColor, onEdit, onDelete }) {
  const ageGroupIcon = getAgeGroupIcon(room.age_group);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition group">
      <div className="h-2 w-full" style={{ backgroundColor: roomHexColor }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md"
              style={{ backgroundColor: roomHexColor }}
            >
              {room.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
              title="Edit Room"
            >
              <HiPencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
              title="Delete Room"
            >
              <HiTrash size={16} />
            </button>
          </div>
        </div>

        {room.age_group && (
          <div className="mb-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: getColorWithOpacity(roomHexColor, 0.1),
                borderColor: roomHexColor,
              }}
            >
              <span className="text-2xl">{ageGroupIcon}</span>
              <div>
                <p className="text-xs text-gray-500">Age Group</p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: roomHexColor }}
                >
                  {room.age_group}
                </p>
              </div>
            </div>
          </div>
        )}

        {room.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {room.description}
          </p>
        )}
      </div>
    </div>
  );
}

// Designations List Component
function DesignationsList({ orgId }) {
  const [designations, setDesignations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const designationModalContext = React.useContext(DesignationModalContext);

  const fetchDesignations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDesignationsByOrgId(orgId);

      let designationsData = [];

      if (response && response.success === true) {
        if (Array.isArray(response.data)) {
          designationsData = response.data;
        }
      }

      setDesignations(designationsData);
    } catch (error) {
      console.error("Failed to fetch designations", error);
      setError(error.response?.data?.message || "Failed to load designations");
      setDesignations([]);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchDesignations();
  }, [fetchDesignations]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading designations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (designations.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <HiOutlineOfficeBuilding className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No Designations Added Yet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Click "Add New Designation" to create your first designation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {designations.map((desig) => (
        <div
          key={desig.id}
          className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-1 h-10 rounded-full bg-blue-500" />

            <div>
              <p className="font-semibold text-gray-800">{desig.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {desig.level && (
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    Level: {desig.level}
                  </span>
                )}
                <span className="text-xs text-gray-500">ID: {desig.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                designationModalContext.openDesignationModal(desig)
              }
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              title="Edit Designation"
            >
              <HiPencil size={14} />
            </button>
            <button
              onClick={() => designationModalContext.deleteDesignation(desig)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete Designation"
            >
              <HiTrash size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ Modal Components ============

function OrganizationModal({
  isOpen,
  onClose,
  onSave,
  organization,
  isSubmitting,
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

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
      },
    );
    setErrors({});
    setSubmitError("");
  }, [organization, isOpen]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Modal submission error:", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError("Failed to save Center. Please try again.");
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
                    {tz.replace("_", " ")}
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

// RoomModal Component
function RoomModal({ isOpen, onClose, onSave, room, isSubmitting }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  // Find matching template for default values
  const getDefaultFromTemplate = (roomName) => {
    const template = ALL_ROOM_TEMPLATES.find((t) => t.name === roomName);
    if (template) {
      return {
        age_group: template.ageGroup,
        color_code: getColorCode(template.colorCode),
        description: template.description,
      };
    }
    return null;
  };

  useEffect(() => {
    if (room) {
      const savedColor = localStorage.getItem(`room_color_${room.id}`);
      const colorCode = savedColor
        ? getColorCode(savedColor)
        : getDefaultFromTemplate(room.name)?.color_code || "sky-blue";

      setFormData({
        name: room.name || "",
        description:
          room.description ||
          getDefaultFromTemplate(room.name)?.description ||
          "",
        age_group:
          room.age_group ||
          getDefaultFromTemplate(room.name)?.age_group ||
          AGE_GROUPS[0].value,
        color_code: colorCode,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        age_group: AGE_GROUPS[0].value,
        color_code: "sky-blue",
      });
    }
    setError("");
  }, [room, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const submitData = {
      name: formData.name,
      description: formData.description || "",
      age_group: formData.age_group || AGE_GROUPS[0].value,
      color_code: formData.color_code || "sky-blue",
    };

    console.log("Submitting room data:", submitData);

    try {
      await onSave(submitData);
    } catch (err) {
      console.error("Error saving room:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save room",
      );
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
                placeholder="Enter room name (e.g., Cozy Nido)"
                required
              />

              <FormSelect
                label="Age Group"
                name="age_group"
                value={formData.age_group || AGE_GROUPS[0].value}
                onChange={handleChange}
              >
                {AGE_GROUPS.map((ageGroup) => (
                  <option key={ageGroup.value} value={ageGroup.value}>
                    {ageGroup.icon} {ageGroup.label}
                  </option>
                ))}
              </FormSelect>

              <ColorPicker
                label="Room Color"
                name="color_code"
                value={formData.color_code}
                onChange={handleChange}
              />

              <FormTextarea
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter room description (e.g., capacity, special features)"
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

function DesignationModal({
  isOpen,
  onClose,
  onSave,
  designation,
  isSubmitting,
}) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(designation || { title: "", level: "Educator" });
    setError("");
  }, [designation, isOpen]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await onSave(formData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save designation",
      );
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
                placeholder="Enter designation title (e.g., Room Leader)"
                required
              />

              <FormSelect
                label="Level"
                name="level"
                value={formData.level || "Educator"}
                onChange={handleChange}
              >
                <option value="Assistant Educator">Assistant Educator</option>
                <option value="Educator">Educator</option>
                <option value="Senior Educator">Senior Educator</option>
                <option value="Room Leader">Room Leader</option>
                <option value="Educational Leader">Educational Leader</option>
                <option value="Assistant Director">Assistant Director</option>
                <option value="Center Director">Center Director</option>
                <option value="Area Manager">Area Manager</option>
              </FormSelect>
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