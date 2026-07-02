import React, { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaUniversity,
  FaFileAlt,
  FaGavel,
  FaUser,
  FaIdCard,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaClipboardCheck,
  FaFileContract,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import axiosClient from "../../axiosClient";

const FORM_META = {
  "staff-induction": {
    url: (empId) => `/staff-induction-form?employeeId=${empId}`,
    icon: FaClipboardCheck,
    colorBg: "bg-indigo-100 group-hover:bg-indigo-200",
    colorIcon: "text-indigo-600",
    colorBorder: "hover:border-indigo-500 hover:bg-indigo-50",
    description: "Complete or view staff induction checklist",
  },
  "pidtdc-form": {
    url: (empId) => `/person-in-day-to-day-charge-form?employeeId=${empId}`,
    icon: FaUser,
    colorBg: "bg-purple-100 group-hover:bg-purple-200",
    colorIcon: "text-purple-600",
    colorBorder: "hover:border-purple-500 hover:bg-purple-50",
    description: "Consent form for appointment as a Person in Day-to-Day Charge",
  },
  "child-safe-code-of-conduct": {
    url: (empId) => `/child-safe-code-of-policy-form?employeeId=${empId}`,
    icon: FaShieldAlt,
    colorBg: "bg-teal-100 group-hover:bg-teal-200",
    colorIcon: "text-teal-600",
    colorBorder: "hover:border-teal-500 hover:bg-teal-50",
    description: "Child safe code of conduct policy declaration",
  },
  "superannuation-form": {
    url: (empId) => `/superannuation?employeeId=${empId}`,
    icon: FaUniversity,
    colorBg: "bg-blue-100 group-hover:bg-blue-200",
    colorIcon: "text-blue-600",
    colorBorder: "hover:border-blue-500 hover:bg-blue-50",
    description: "Complete or update superannuation details",
  },
  "tfn-declaration": {
    url: (empId) => `/tfn-declaration?employeeId=${empId}`,
    icon: FaFileAlt,
    colorBg: "bg-green-100 group-hover:bg-green-200",
    colorIcon: "text-green-600",
    colorBorder: "hover:border-green-500 hover:bg-green-50",
    description: "Tax File Number declaration details",
  },
  "staff-record": {
    url: (empId) => `/staff-record-form?employeeId=${empId}`,
    icon: FaIdCard,
    colorBg: "bg-orange-100 group-hover:bg-orange-200",
    colorIcon: "text-orange-600",
    colorBorder: "hover:border-orange-500 hover:bg-orange-50",
    description: "Complete or update staff record details",
  },
  "prohibition-notice-declaration": {
    url: (empId) => `/prohibition-notice-declaration-form?employeeId=${empId}`,
    icon: FaGavel,
    colorBg: "bg-red-100 group-hover:bg-red-200",
    colorIcon: "text-red-600",
    colorBorder: "hover:border-red-500 hover:bg-red-50",
    description: "Prohibition notice declaration details",
  },
  "employment-contract-forms": {
    url: (empId) => `/employment-contract?employeeId=${empId}`,
    icon: FaFileContract,
    colorBg: "bg-pink-100 group-hover:bg-pink-200",
    colorIcon: "text-pink-600",
    colorBorder: "hover:border-pink-500 hover:bg-pink-50",
    description: "Complete employment contract terms",
  },
};

const Forms = () => {
  const [formsList, setFormsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);
  const [completedForms, setCompletedForms] = useState(0);
  const [totalForms, setTotalForms] = useState(0);

  useEffect(() => {
    const employeeStr = localStorage.getItem("employee");
    if (employeeStr) {
      try {
        const employee = JSON.parse(employeeStr);
        if (employee && employee.id) {
          setEmployeeId(employee.id);
          return;
        }
      } catch (e) {
        console.error("Error parsing employee from localStorage", e);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (employeeId) {
      const fetchForms = async () => {
        try {
          setLoading(true);
          const response = await axiosClient.get("/form-masters", {
            params: { employee_id: employeeId },
          });
          if (response.data) {
            const sorted = [...(response.data.data || [])].sort(
              (a, b) => a.sort_order - b.sort_order
            );
            setFormsList(sorted);
            setCompletedForms(response.data.completed_forms || 0);
            setTotalForms(response.data.total_forms || 0);
          }
        } catch (err) {
          console.error("Error fetching form master order:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchForms();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-blue-600 mb-3" size={32} />
        <p className="text-gray-600 font-sans font-medium">Loading onboarding forms...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Employee Forms</h1>
        <p className="text-gray-600 font-sans">Complete your required Forms</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700 font-sans">Form Completion Progress</span>
          <span className="text-sm font-bold text-blue-600 font-sans">
            {completedForms} of {totalForms} Completed
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalForms > 0 ? (completedForms / totalForms) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        {formsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formsList.map((form) => {
              const meta = FORM_META[form.slug] || {
                url: (empId) => `/dashboard?employeeId=${empId}`,
                icon: FaFileAlt,
                colorBg: "bg-gray-100 group-hover:bg-gray-200",
                colorIcon: "text-gray-600",
                colorBorder: "hover:border-gray-500 hover:bg-gray-50",
                description: "Compliance and onboarding details",
              };
              const IconComponent = meta.icon;

              return (
                <a
                  key={form.id}
                  href={meta.url(employeeId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all group cursor-pointer ${meta.colorBorder}`}
                >
                  <div className={`p-3 rounded-lg transition-colors ${meta.colorBg}`}>
                    <IconComponent className={`${meta.colorIcon} text-xl`} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-800 truncate font-sans">
                        {form.form_name}
                      </h3>
                      {form.is_required === 1 && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold rounded uppercase tracking-wider font-sans shrink-0">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate font-sans mb-2">
                      {meta.description}
                    </p>
                    {form.is_filled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 shrink-0 font-sans">
                        <FaCheck size={8} className="shrink-0" />
                        Filled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 shrink-0 font-sans">
                        Pending
                      </span>
                    )}
                  </div>
                  <FaExternalLinkAlt className="text-gray-400 group-hover:text-blue-600 ml-auto shrink-0" />
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaFileAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2 font-sans">
              No Onboarding Forms Found
            </h4>
            <p className="text-gray-500 max-w-md mx-auto font-sans">
              Please contact your administrator to configure onboarding forms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forms;
