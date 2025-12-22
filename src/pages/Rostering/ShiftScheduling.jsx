/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaDownload,
  FaUser,
  FaClock,
  FaExchangeAlt,
  FaCopy,
  FaSave,
  FaTimes,
  FaUndo,
  FaRedo,
} from "react-icons/fa";
import { useOrganizations } from "../../contexts/OrganizationContext";
import shiftSchedulingService from "../../services/shiftSchedulingService";

const ShiftScheduling = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("list"); // 'list', 'calendar', 'week'
  const [showDeleted, setShowDeleted] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { selectedOrganization } = useOrganizations();
  const organizationId = selectedOrganization?.id;

  const [newShift, setNewShift] = useState({
    organization_id: organizationId,
    name: "",
    start_time: "09:00",
    end_time: "17:00",
    color_code: "#4CAF50",
    notes: "",
  });

  // Fetch shifts on component mount and when organization changes
  useEffect(() => {
    if (organizationId) {
      fetchShifts();
      setNewShift((prev) => ({ ...prev, organization_id: organizationId }));
    }
  }, [organizationId, showDeleted]);

  const fetchShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (showDeleted) {
        response = await shiftSchedulingService.getDeletedShifts();
      } else {
        response = await shiftSchedulingService.getShifts({
          organization_id: organizationId,
        });
      }
      setShifts(response.data || []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      setError("Failed to load shifts. Please try again.");
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShift((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitShift = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");

    try {
      if (editingShift) {
        // Update existing shift
        const { organization, ...updateData } = newShift;
        await shiftSchedulingService.updateShift(editingShift.id, updateData);
        setSuccessMessage("Shift updated successfully!",organization);
      } else {
        // Create new shift
        await shiftSchedulingService.createShift(newShift);
        setSuccessMessage("Shift created successfully!");
      }

      // Refresh shifts list
      await fetchShifts();

      // Reset form
      resetForm();
      setShowShiftForm(false);
      setEditingShift(null);

      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving shift:", error);
      setError(
        error.response?.data?.message ||
          "Failed to save shift. Please try again."
      );
    }
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setNewShift({
      organization_id: organizationId,
      name: shift.name,
      start_time: shift.start_time.substring(0, 5), // Convert "09:00:00" to "09:00"
      end_time: shift.end_time.substring(0, 5),
      color_code: shift.color_code,
      notes: shift.notes || "",
    });
    setShowShiftForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await shiftSchedulingService.deleteShift(id);
        setSuccessMessage("Shift deleted successfully!");
        await fetchShifts();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error deleting shift:", error);
        setError("Failed to delete shift. Please try again.");
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await shiftSchedulingService.restoreShift(id);
      setSuccessMessage("Shift restored successfully!");
      setShowDeleted(false);
      await fetchShifts();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error restoring shift:", error);
      setError("Failed to restore shift. Please try again.");
    }
  };

  const handleCopyShift = (shift) => {
    setNewShift({
      organization_id: organizationId,
      name: `${shift.name} (Copy)`,
      start_time: shift.start_time.substring(0, 5),
      end_time: shift.end_time.substring(0, 5),
      color_code: shift.color_code,
      notes: shift.notes || "",
    });
    setEditingShift(null);
    setShowShiftForm(true);
  };

  const resetForm = () => {
    setNewShift({
      organization_id: organizationId,
      name: "",
      start_time: "09:00",
      end_time: "17:00",
      color_code: "#4CAF50",
      notes: "",
    });
  };

  const calculateHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    // Handle both "09:00" and "09:00:00" formats
    const startParts = startTime.split(":");
    const endParts = endTime.split(":");

    const startHour = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
    const endHour = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;

    let diff = endHour - startHour;
    if (diff < 0) diff += 24; // Handle overnight shifts

    return Math.max(diff, 0);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    // Handle both "09:00" and "09:00:00" formats
    const time = timeString.split(":");
    const hour = parseInt(time[0]);
    const minute = time[1];
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const exportShifts = () => {
    const dataStr = JSON.stringify(shifts, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `shifts-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (loading && shifts.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Shift Management
          </h1>
          <p className="text-gray-600">Create and manage shift schedules</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shifts</p>
                <p className="text-2xl font-bold text-gray-800">
                  {shifts.length}
                </p>
              </div>
              <FaCalendarAlt className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-800">
                  {shifts.length > 0
                    ? (
                        shifts.reduce(
                          (total, shift) =>
                            total +
                            calculateHours(shift.start_time, shift.end_time),
                          0
                        ) / shifts.length
                      ).toFixed(1)
                    : "0"}
                  h
                </p>
              </div>
              <FaClock className="text-green-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coverage</p>
                <p className="text-2xl font-bold text-gray-800">
                  {shifts.length > 0 ? "Full" : "None"}
                </p>
              </div>
              <FaExchangeAlt className="text-purple-500 text-xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-2xl font-bold text-gray-800">
                  {showDeleted ? "Deleted" : "Active"}
                </p>
              </div>
              <FaUser className="text-orange-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === "calendar"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-md transition-colors ${
                view === "week"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Week View
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showDeleted
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {showDeleted ? <FaUndo /> : <FaTrash />}
              {showDeleted ? "View Active" : "View Deleted"}
            </button>
            <button
              onClick={exportShifts}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaDownload /> Export
            </button>
            <button
              onClick={() => setShowShiftForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus /> Create Shift
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search shifts by name..."
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  console.log(searchTerm)
                }}
                className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Shifts List View */}
        {view === "list" && (
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Shift Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Timing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shifts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No shifts found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {showDeleted
                          ? "No deleted shifts available"
                          : "Create your first shift to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  shifts.map((shift) => (
                    <tr
                      key={shift.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: shift.color_code }}
                          >
                            {shift.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {shift.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {shift.organization?.name || "Organization"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTime(shift.start_time)} -{" "}
                          {formatTime(shift.end_time)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {calculateHours(
                            shift.start_time,
                            shift.end_time
                          ).toFixed(1)}{" "}
                          hours
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">
                          {calculateHours(
                            shift.start_time,
                            shift.end_time
                          ).toFixed(1)}
                          h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="h-6 w-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: shift.color_code }}
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {shift.color_code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            showDeleted
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {showDeleted ? "Deleted" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {showDeleted ? (
                            <button
                              onClick={() => handleRestore(shift.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                              title="Restore"
                            >
                              <FaUndo /> Restore
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(shift)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                                title="Edit"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                onClick={() => handleCopyShift(shift)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                title="Copy"
                              >
                                <FaCopy /> Copy
                              </button>
                              <button
                                onClick={() => handleDelete(shift.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                                title="Delete"
                              >
                                <FaTrash /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Calendar View */}
        {view === "calendar" && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Calendar View</h2>
              <p className="text-gray-600">Shift schedule calendar view</p>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {/* Calendar header */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-700 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {Array.from({ length: 35 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-32 border border-gray-200 p-2 rounded" 
                >
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {index + 1}
                  </div>
                  {/* Show shifts for this day */}
                  {shifts.slice(0, 2).map((shift) => (
                    <div
                      key={shift.id}
                      className="text-xs p-1 mb-1 rounded truncate"
                      style={{
                        backgroundColor: `${shift.color_code}20`,
                        borderLeft: `3px solid ${shift.color_code}`,
                      }}
                    >
                      <div className="font-medium">{shift.name}</div>
                      <div>
                        {formatTime(shift.start_time)} -{" "}
                        {formatTime(shift.end_time)}
                      </div>
                    </div>
                  ))}
                  {shifts.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{shifts.length - 2} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Week View */}
        {view === "week" && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Week View</h2>
              <p className="text-gray-600">Weekly shift schedule</p>
            </div>
            <div className="grid grid-cols-8 border-b">
              <div className="p-4 font-semibold bg-gray-50">Time</div>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-semibold border-l bg-gray-50"
                >
                  {day}
                </div>
              ))}
            </div>
            {Array.from({ length: 12 }).map((_, hour) => {
              const time = `${(hour + 6).toString().padStart(2, "0")}:00`;
              return (
                <div key={time} className="grid grid-cols-8 border-b">
                  <div className="p-4 border-r bg-gray-50 font-medium">
                    {formatTime(time)}
                  </div>
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const shiftForTime = shifts.find((shift) => {
                      const startHour = parseInt(
                        shift.start_time.split(":")[0]
                      );
                      return startHour === hour + 6;
                    });

                    return (
                      <div key={dayIndex} className="p-2 border-l min-h-16">
                        {shiftForTime && (
                          <div
                            className="p-2 rounded border"
                            style={{
                              backgroundColor: `${shiftForTime.color_code}20`,
                              borderColor: shiftForTime.color_code,
                            }}
                          >
                            <div className="text-xs font-medium">
                              {shiftForTime.name}
                            </div>
                            <div className="text-xs">
                              {formatTime(shiftForTime.start_time)} -{" "}
                              {formatTime(shiftForTime.end_time)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Shift Form Modal */}
        {showShiftForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingShift ? "Edit Shift" : "Create New Shift"}
                </h2>
                <button
                  onClick={() => {
                    setShowShiftForm(false);
                    setEditingShift(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmitShift}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newShift.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Morning Shift, Evening Shift, Night Shift"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Code *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        name="color_code"
                        value={newShift.color_code}
                        onChange={handleInputChange}
                        required
                        className="h-10 w-16 cursor-pointer"
                      />
                      <input
                        type="text"
                        name="color_code"
                        value={newShift.color_code}
                        onChange={handleInputChange}
                        required
                        pattern="^#[0-9A-Fa-f]{6}$"
                        className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#4CAF50"
                        title="Enter a hex color code (e.g., #4CAF50)"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Click the color box or enter a hex code
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={newShift.start_time}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={newShift.end_time}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">
                        {calculateHours(
                          newShift.start_time,
                          newShift.end_time
                        ).toFixed(1)}{" "}
                        hours
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Calculated based on start and end times
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={newShift.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes about this shift..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShiftForm(false);
                      setEditingShift(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    {editingShift ? (
                      <>
                        <FaSave /> Update Shift
                      </>
                    ) : (
                      <>
                        <FaPlus /> Create Shift
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftScheduling;
