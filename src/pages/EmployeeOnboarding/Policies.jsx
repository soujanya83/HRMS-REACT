import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosClient from "../../axiosClient";
import {
  FaCheck,
  FaBook,
  FaSpinner,
  FaSearch,
  FaSortAlphaDown,
  FaSortAlphaDownAlt,
  FaTimes,
} from "react-icons/fa";

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState(null); // null | "asc" | "desc"

  // Setup employee and organization context
  useEffect(() => {
    const fetchEmployeeData = async () => {
      setLoading(true);
      try {
        let currentEmployeeId = null;
        let currentOrgId = null;

        const employeeStr = localStorage.getItem("employee");
        if (employeeStr) {
          const emp = JSON.parse(employeeStr);
          currentEmployeeId = emp.id;
          currentOrgId = emp.organization_id;
        } else {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            currentEmployeeId = user.id;
            currentOrgId = user.organization_id;
          }
        }

        if (currentEmployeeId) {
          // Fetch profile details to ensure we have the most accurate/current IDs
          try {
            const response = await axiosClient.get(`/employeedata/${currentEmployeeId}`);
            if (response.data?.success && response.data?.data) {
              const empData = response.data.data;
              setEmployeeId(empData.id);
              setOrganizationId(empData.organization_id);
              await loadEmployeePolicies(empData.id);
            } else {
              setEmployeeId(currentEmployeeId);
              setOrganizationId(currentOrgId);
              await loadEmployeePolicies(currentEmployeeId);
            }
          } catch (e) {
            console.error("Failed to fetch profile from employeedata endpoint, using fallback:", e);
            setEmployeeId(currentEmployeeId);
            setOrganizationId(currentOrgId);
            await loadEmployeePolicies(currentEmployeeId);
          }
        } else {
          toast.error("Employee session not found");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error setting up employee context:", err);
        toast.error("Failed to load employee details");
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const loadEmployeePolicies = async (empId) => {
    try {
      const response = await axiosClient.get("/employee/policies", {
        params: { employee_id: empId }
      });
      let policyList = [];
      if (Array.isArray(response.data)) {
        policyList = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        policyList = response.data.data;
      }
      setPolicies(policyList);
    } catch (err) {
      console.error("Error loading employee policies:", err);
      toast.error("Failed to load onboarding policies status");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAndAcknowledge = async (policy) => {
    // Open policy link
    const targetLink = policy.link || policy.description;
    if (targetLink && targetLink !== "#") {
      window.open(targetLink, "_blank");
    } else {
      toast.info("No policy link available to display");
    }

    try {
      const response = await axiosClient.post(`/employee/policies/${policy.id}/view`, {
        employee_id: employeeId,
        organization_id: organizationId
      });
      if (response.status === 200 || response.data) {
        toast.success(`Viewed: "${policy.policy_name}"`);
        // Refresh policies list to update Viewed status
        if (employeeId) {
          await loadEmployeePolicies(employeeId);
        }
      }
    } catch (err) {
      console.error("Error updating policy view status:", err);
      toast.error("Failed to update policy view status on server");
    }
  };

  const isPolicyViewed = (policy) => {
    return (
      policy.viewed === true ||
      policy.viewed === 1 ||
      String(policy.viewed).toLowerCase() === "true"
    );
  };

  const isPolicyAcknowledged = (policy) => {
    return (
      policy.acknowledged === true ||
      policy.acknowledged === 1 ||
      String(policy.acknowledged).toLowerCase() === "true"
    );
  };

  const handleAcknowledge = async (policy) => {
    try {
      const response = await axiosClient.post(`/employee/policies/${policy.id}/acknowledge`, {
        employee_id: employeeId,
        organization_id: organizationId
      });
      if (response.status === 200 || response.data) {
        toast.success(`Acknowledged: "${policy.policy_name}"`);
        if (employeeId) {
          await loadEmployeePolicies(employeeId);
        }
      }
    } catch (err) {
      console.error("Error acknowledging policy:", err);
      toast.error("Failed to acknowledge policy on server");
    }
  };

  const completedCount = policies.filter((p) => isPolicyAcknowledged(p)).length;

  const progressPercent = policies.length
    ? Math.round((completedCount / policies.length) * 100)
    : 0;

  // Derive filtered + sorted list from frontend state only
  const filteredPolicies = policies
    .filter((p) =>
      p.policy_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const nameA = (a.policy_name || "").toLowerCase();
      const nameB = (b.policy_name || "").toLowerCase();
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-2">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Company Policies</h1>
        <p className="text-gray-600 mt-1">
          Please click on each policy name to open and read the policy. Once viewed, select the checkbox to acknowledge it.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Acknowledge Progress
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
      </div>

      {/* Search + Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>

        {/* Sort Toggle */}
        <button
          onClick={() =>
            setSortOrder((prev) =>
              prev === null ? "asc" : prev === "asc" ? "desc" : null
            )
          }
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border shadow-sm transition-all ${
            sortOrder
              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          {sortOrder === "desc" ? (
            <FaSortAlphaDownAlt size={15} />
          ) : (
            <FaSortAlphaDown size={15} />
          )}
          {sortOrder === "asc" ? "A → Z" : sortOrder === "desc" ? "Z → A" : "Sort A–Z"}
        </button>
      </div>

      {/* Policies List Container */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <FaSpinner className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading onboarding policies...</p>
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <FaBook size={48} className="text-gray-300 mb-3" />
            <p className="text-lg font-medium">
              {searchQuery ? `No policies matching "${searchQuery}"` : "No onboarding policies found"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-blue-500 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Table Header */}
            <div className="flex items-center gap-4 px-6 py-3.5 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 select-none">
              <div className="w-16 shrink-0">Sr. No.</div>
              <div className="flex-1">Policy Name</div>
              <div className="w-24 shrink-0 text-center">Viewed</div>
              <div className="w-32 shrink-0 text-center">Acknowledged</div>
            </div>

            {/* Table Rows */}
            {filteredPolicies.map((policy, index) => {
              const isViewed = isPolicyViewed(policy);
              const isAcknowledged = isPolicyAcknowledged(policy);
              return (
                <div
                  key={policy.id}
                  onClick={() => handleOpenAndAcknowledge(policy)}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-blue-50/20 transition-all cursor-pointer select-none border-b border-gray-100 ${
                    isAcknowledged ? "bg-gray-50/40" : "bg-white"
                  }`}
                >
                  {/* Sr. No */}
                  <div className="w-16 shrink-0 text-sm font-semibold text-gray-400">
                    {index + 1}
                  </div>

                  {/* Policy Name */}
                  <div className="flex-1 min-w-0 pr-4 flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold break-words transition-all ${
                        isAcknowledged
                          ? "text-gray-400 line-through decoration-gray-300"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      {policy.policy_name}
                    </span>
                    {policy.is_required === 1 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800 shrink-0">
                        Required
                      </span>
                    )}
                  </div>

                  {/* Viewed (Yes / No) */}
                  <div className="w-24 shrink-0 flex items-center justify-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${
                        isViewed
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {isViewed ? (
                        <>
                          <FaCheck size={10} className="shrink-0" />
                          Yes
                        </>
                      ) : (
                        "No"
                      )}
                    </span>
                  </div>

                  {/* Acknowledged Checkbox */}
                  <div
                    className="w-32 shrink-0 flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isViewed ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`ack-${policy.id}`}
                          checked={isAcknowledged}
                          disabled={isAcknowledged}
                          onChange={() => handleAcknowledge(policy)}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <label
                          htmlFor={`ack-${policy.id}`}
                          className={`text-xs font-bold ${
                            isAcknowledged ? "text-green-700" : "text-gray-600"
                          }`}
                        >
                          {isAcknowledged ? "Acknowledged" : "Acknowledge"}
                        </label>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">View policy first</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Policies;

