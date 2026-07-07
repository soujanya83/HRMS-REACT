import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSave, FaSpinner, FaPrint, FaTimes } from "react-icons/fa";
import topImage from "../../assets/common_form_images/img9.jpg";
import bottomImage from "../../assets/common_form_images/img11.jpg";
import { SignaturePad } from "../Superannuation/components/SharedComponents";
import {
  closeFlutterWebView,
  getOnboardingCancelPath,
  notifyFlutterSaveSuccess,
} from "../../utils/onboardingFormNavigation";

// ─── Signature Modal ──────────────────────────────────────────────────────────
const SignatureModal = ({
  isOpen,
  onClose,
  onSave,
  existingSignature = "",
}) => {
  const [tempSignature, setTempSignature] = useState("");
  if (!isOpen) return null;
  const handleSave = () => {
    if (tempSignature) onSave(tempSignature);
    setTempSignature("");
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            {existingSignature ? "Update Signature" : "Add Signature"}
          </h3>
          <button
            type="button"
            onClick={() => {
              setTempSignature("");
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-500 mb-3">
            Draw your signature below:
          </p>
          <SignaturePad
            value={tempSignature}
            onChange={setTempSignature}
            height={120}
          />
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setTempSignature("");
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!tempSignature}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── SECTION DATA ─────────────────────────────────────────────────────────────

const SECTIONS_DATA = [
  {
    id: "hr_orientation",
    title: "Human Resources & Orientation",
    color: "#4A90D9",
    items: [
      "Acknowledgement of Country and commitment to Aboriginal and Torres Strait Islander peoples",
      "Overview of Nextgen Montessori philosophy and values",
      "Introduction to Montessori approach and classroom practices",
      "Contract/ Confirmation of Employment",
      "Job Description",
      "Staff Handbook",
      "Probation process & Performance review process",
      "Zoho Mail set-up",
      "Zoho People/Kiosk Check-in and out",
      "Staff communication channels – Cliq (professional) and Whatsapp group",
      "MyDairee account set-up",
    ],
    hasSublist: true,
    sublistTitle: "All required certificates provided",
    sublistItems: [
      "Qualification Certificate",
      "Working with Children's Check (Renew Every 5 years)",
      "CPR Certificate (Full course – every 3 years)",
      "First-aid Certificate (Refresher Annually)",
      "Anaphylaxis (Refresher Annually)",
      "Protecting Children - Mandatory Reporting (Annually)",
      "Staff Record – Template attached",
      "Do Food Safety Certificate (Annually)",
      "Allergens for Children's (CEC) Certificate",
      "SunSmart Certificate (Every 2 years)",
      "Red nose – Sleep Safe (under 3 years old)",
    ],
    additionalItems: [
      "Responsible Person process explained & form signed",
      "Attendance expectations",
      "Leave notification process",
      "Payroll and timesheet procedures",
      "Cultural competence and inclusive practice discussion",
      "Management structure explained",
    ],
    hasSignature: true,
  },
  {
    id: "policies_procedures",
    title: "Policies & Procedures (Regulation 168)",
    color: "#4A90D9",
    items: [
      "Behaviour Guidance Policy",
      "Child Safe Environment Policy",
      "Child Safe Standards and Child Safe Culture",
      "Child Safe Code of Conduct Policy",
      "Collection of children procedure",
      "Conflict of Interest and Fraud Prevention Policy",
      "Educational Program and Planning Policy",
      "Emergency and Evacuation Policy",
      "Governance and Management Policy",
      "Grievance and Complaints Policy",
      "Inclusion & Anti Bias Policy",
      "Leave policies (annual leave, personal leave)",
      "Medical Conditions Policy (Anaphylaxis, Asthma etc.)",
      "Privacy and Confidentiality Policy",
      "Sleep and Rest Policy",
      "Technology and Device Usage Policy",
      "Uniform policy",
      "Work Health and Safety policy",
    ],
    hasSignature: true,
  },
  {
    id: "child_safe",
    title: "Child safe culture & child protection",
    color: "#4A90D9",
    items: [
      "Child Safe Standards overview",
      "Child Safe Code of Conduct & Children's rights explained",
      "Cultural safety for Aboriginal children",
      "Cultural safety for children from diverse backgrounds",
      "Identifying indicators of abuse and neglect",
      "Failure to Protect offence & Failure to Disclose offence",
      "Inclusion and safety for children with disability",
      "Reportable Conduct Scheme obligations",
      "Responding to disclosures from children",
      "Record keeping requirements",
    ],
    hasSignature: true,
  },
  {
    id: "work_health_safety",
    title: "Work Health & Safety Induction (NQS QA2 & QA7)",
    color: "#4A90D9",
    items: [
      "Hazard and incident reporting procedures",
      "Incident, injury and near miss reporting & exclusion requirements",
      "Location of fire equipment and emergency exits",
      "Emergency evacuation procedures and assembly points",
      "Location of MSDS for hazardous materials",
      "Security procedures and access codes",
      "Location of first aid kits",
      "Safe lifting of children",
      "Safe lifting of furniture and equipment",
      "Safe use of nappy change facilities",
      "WorkCover and Return to Work procedures",
      "Manual Handling",
      "Allergy management",
      "Sun protection & Sunscreen application procedure",
    ],
    hasSignature: true,
  },
  {
    id: "key_people",
    title: "Introduction to Key People",
    color: "#4A90D9",
    items: [
      "Approved Provider",
      "Nominated Supervisor",
      "2IC / Assistant manager",
      "Educational Leader",
      "Work Health & Safety Representative / First Aid Officer",
      "Room Leader",
      "Rap representative",
      "Sap representative",
      "Team members and co-educators",
    ],
    hasSignature: true,
  },
  {
    id: "centre_base",
    title: "Centre Base Induction",
    color: "#4A90D9",
    items: [
      "Service access procedures",
      "Tour of the entire service/ Introduction to bathroom, staff room, planning room and facilities",
      "Overview of Education and Care Services National Law and Regulations",
      "Introduction to National Quality Standard (NQS) and Early Years Learning Framework (EYLF)",
      "Locker allocation",
      "Rosters, breaks, leave requests and sick notification process",
      "Parking arrangements",
      "Staff Uniform Orders",
      "Centre menu and food procedures / dietary/allergy lists explained",
      "Display of medical and dietary management plans",
      "Court orders Procedures and display",
      "Phone use and professional communication",
    ],
    hasSublist: true,
    sublistTitle: "Checklists",
    sublistItems: [
      "Opening Checklist",
      "Closing Checklist",
      "OH&S Checklist",
      "First-aid Checklist",
      "Cleaning Checklist",
    ],
    subSubItems: ["Staff room cleaning", "Room Cleaning", "Toilet Cleaning"],
    additionalItems: [
      "How to use – Dishwasher/washing machine/dryer",
      "Consumable storage – Laundry – Chemical",
    ],
    hasSignature: true,
  },
  {
    id: "montessori_environment",
    title: "Montessori prepared environment & Planning",
    color: "#4A90D9",
    items: [
      "Grace and Courtesy & Daily Routines",
      "Prepared Environment expectations",
      "Care of environment",
      "Family input process",
      "Material presentation standards",
      "Classroom maintenance responsibilities",
      "Role modelling and professionalism",
      "Mixed age group expectations",
      "Program evaluation",
      "Observation procedure & Documentation expectations",
      "Individual planning cycle & Child portfolios",
      "Confidential storage of records",
      "Excursion & Incursion procedures, parent permissions",
      "Risk assessments",
      "Emergency procedures offsite & Emergency contacts",
    ],
    hasSignature: true,
  },
  {
    id: "active_supervision",
    title: "Active supervision & child safety practices",
    color: "#4A90D9",
    items: [
      "Active supervision expectations",
      "Positioning and scanning",
      "Supervision of high-risk areas",
      "Toileting supervision",
      "Water play supervision",
      "Outdoor supervision",
      "Sleep and rest supervision",
      "Head count procedure",
      "Transition procedure",
    ],
    hasSignature: true,
  },
  {
    id: "family_communication",
    title: "Family communication & confidentiality",
    color: "#4A90D9",
    items: [
      "Family communication expectations",
      "Confidential discussions",
      "Handling complaints and concerns",
    ],
    hasSignature: true,
  },
  {
    id: "team_collaboration",
    title: "Team collaboration & professional expectations",
    color: "#4A90D9",
    items: [
      "Staff meeting expectations",
      "Professional conduct & Team collaboration",
      "Reflective practice",
      "Conflict resolution",
      "Professional learning expectations",
    ],
    hasSignature: true,
  },
];

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const buildInitialState = () => {
  const today = getTodayDate();
  const state = {
    staffName: "",
    supervisorName: "",
    commencementDate: today,
    position: "",
  };
  SECTIONS_DATA.forEach((section) => {
    state[section.id] = {};
    section.items.forEach((_, i) => {
      state[section.id][`item_${i}`] = false;
    });
    if (section.hasSublist) {
      section.sublistItems.forEach((_, i) => {
        state[section.id][`sub_${i}`] = false;
      });
    }
    if (section.subSubItems) {
      section.subSubItems.forEach((_, i) => {
        state[section.id][`subsub_${i}`] = false;
      });
    }
    if (section.additionalItems) {
      section.additionalItems.forEach((_, i) => {
        state[section.id][`add_${i}`] = false;
      });
    }
    if (section.hasSignature) {
      state[section.id].educatorSign = "";
      state[section.id].supervisorSign = "";
    }
  });
  state.declaration = {
    employeeName: "",
    employeeSignature: "",
    employeeDate: today,
    supervisorName: "",
    supervisorSignature: "",
    supervisorDate: today,
  };
  return state;
};

// ─── PRINT STYLES ─────────────────────────────────────────────────────────────

const PRINT_STYLES = `
  @media print {
    @page {
      size: A4 portrait;
      margin: 0mm;
    }
    html, body {
      width: 210mm;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
    }
    body > * { visibility: hidden; }
    .staff-induction-print-area,
    .staff-induction-print-area * { visibility: visible; }
    .staff-induction-print-area {
      position: relative !important;
      width: 210mm !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      overflow: visible !important;
    }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
    input[type="checkbox"] {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;

// ─── STYLE CONSTANTS ──────────────────────────────────────────────────────────

const BORDER = "1px solid #3f3f3f";
const BORDER_LIGHT = "1px solid #d1d5db";

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const StaffInductionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(buildInitialState());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [inductionId, setInductionId] = useState(null);
  const [signatureModal, setSignatureModal] = useState({
    open: false,
    field: null,
    section: null,
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let empId = queryParams.get("employeeId");
    const employeeStr = localStorage.getItem("employee");
    const userStr = localStorage.getItem("user");

    let resolvedEmployeeId = null;
    let resolvedOrgId = null;
    let fallbackStaffName = "";

    if (employeeStr) {
      const employee = JSON.parse(employeeStr);
      resolvedEmployeeId = empId || employee.id;
      resolvedOrgId = employee.organization_id;
      // Only prefill staff name with local storage name if we are loading our own form
      if (!empId) {
        fallbackStaffName =
          `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
      }
    } else if (userStr) {
      const user = JSON.parse(userStr);
      resolvedEmployeeId = empId || user.id;
      resolvedOrgId = user.organization_id;
    } else if (empId) {
      resolvedEmployeeId = empId;
    }

    setEmployeeId(resolvedEmployeeId);
    if (resolvedOrgId) setOrganizationId(resolvedOrgId);
    if (fallbackStaffName) {
      setFormData((prev) => ({
        ...prev,
        staffName: fallbackStaffName,
      }));
    }
  }, []);

  useEffect(() => {
    if (employeeId) fetchInduction();
  }, [employeeId]);

  const fetchInduction = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(
        `/staff-inductions/employee/${employeeId}`,
      );
      if (response.data) {
        setInductionId(response.data.id);
        if (response.data.form_data) {
          setFormData((prev) => ({ ...prev, ...response.data.form_data }));
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Fetch employee details to pre-fill staff name on new induction form
        try {
          const empResponse = await axiosClient.get(
            `/employeedata/${employeeId}`,
          );
          if (empResponse.data?.success && empResponse.data?.data) {
            const empData = empResponse.data.data;
            setFormData((prev) => ({
              ...prev,
              staffName:
                `${empData.first_name || ""} ${empData.last_name || ""}`.trim(),
            }));
          }
        } catch (empError) {
          console.error("Error fetching employee name:", empError);
        }
      } else {
        console.error("Error fetching staff induction:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (path, value) => {
    setFormData((prev) => {
      const keys = path.split(".");
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const handleSelectAll = (sectionId, section) => {
    const sectionData = formData[sectionId] || {};
    // Count all checkable items
    let allKeys = [];
    section.items.forEach((_, i) => allKeys.push(`item_${i}`));
    if (section.hasSublist) {
      section.sublistItems.forEach((_, i) => allKeys.push(`sub_${i}`));
    }
    if (section.subSubItems) {
      section.subSubItems.forEach((_, i) => allKeys.push(`subsub_${i}`));
    }
    if (section.additionalItems) {
      section.additionalItems.forEach((_, i) => allKeys.push(`add_${i}`));
    }
    const allChecked = allKeys.every((k) => sectionData[k]);
    const newSectionData = { ...sectionData };
    allKeys.forEach((k) => {
      newSectionData[k] = !allChecked;
    });
    setFormData((prev) => ({ ...prev, [sectionId]: newSectionData }));
  };

  const isAllSelected = (sectionId, section) => {
    const sectionData = formData[sectionId] || {};
    let allKeys = [];
    section.items.forEach((_, i) => allKeys.push(`item_${i}`));
    if (section.hasSublist) {
      section.sublistItems.forEach((_, i) => allKeys.push(`sub_${i}`));
    }
    if (section.subSubItems) {
      section.subSubItems.forEach((_, i) => allKeys.push(`subsub_${i}`));
    }
    if (section.additionalItems) {
      section.additionalItems.forEach((_, i) => allKeys.push(`add_${i}`));
    }
    return allKeys.length > 0 && allKeys.every((k) => sectionData[k]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error("Employee ID not found");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        employee_id: employeeId,
        organization_id: organizationId || 15,
        form_data: formData,
      };
      let response;
      if (inductionId) {
        response = await axiosClient.put(
          `/staff-inductions/${inductionId}`,
          payload,
        );
        if (response.data) {
          if (response.data.form_data) {
            setFormData((prev) => ({ ...prev, ...response.data.form_data }));
          }
          toast.success("Staff induction updated successfully!");
          notifyFlutterSaveSuccess();
        }
      } else {
        response = await axiosClient.post("/staff-inductions", payload);
        if (response.data) {
          setInductionId(response.data.id);
          if (response.data.form_data) {
            setFormData((prev) => ({ ...prev, ...response.data.form_data }));
          }
          toast.success("Staff induction saved successfully!");
          notifyFlutterSaveSuccess();
        }
      }
    } catch (error) {
      console.error("Error saving staff induction:", error);
      toast.error("Failed to save staff induction");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!closeFlutterWebView()) {
      navigate(getOnboardingCancelPath(employeeId));
    }
  };

  const openSignatureModal = (section, field) => {
    setSignatureModal({ open: true, section, field });
  };

  const handleSignatureSave = (signatureData) => {
    if (signatureModal.section === "declaration") {
      updateField(`declaration.${signatureModal.field}`, signatureData);
    } else {
      updateField(
        `${signatureModal.section}.${signatureModal.field}`,
        signatureData,
      );
    }
  };

  // ─── Custom Checkbox component with ✓ ───
  const CustomCheckbox = ({ checked, onChange }) => (
    <div
      onClick={onChange}
      style={{
        width: "18px",
        height: "18px",
        flexShrink: 0,
        border: BORDER,
        backgroundColor: "white",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {checked && (
        <span
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            color: "#16a34a",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          ✓
        </span>
      )}
    </div>
  );

  // ─── Render a section header bar ───
  const SectionHeader = ({ title, sectionId, section }) => (
    <div
      style={{
        background: "linear-gradient(135deg, #4A90D9 0%, #357ABD 100%)",
        padding: "7px 10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: BORDER,
      }}
    >
      <span style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>
        {title}
      </span>
      <label
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          fontSize: "11px",
          fontWeight: "600",
          color: "#fff",
          background: "rgba(255,255,255,0.15)",
          padding: "3px 10px",
          borderRadius: "4px",
        }}
      >
        <input
          type="checkbox"
          checked={isAllSelected(sectionId, section)}
          onChange={() => handleSelectAll(sectionId, section)}
          style={{
            width: "14px",
            height: "14px",
            cursor: "pointer",
            accentColor: "#fff",
          }}
        />
        Select All
      </label>
    </div>
  );

  // ─── Render a checklist row ───
  const ChecklistRow = ({
    text,
    checked,
    onChange,
    isLast = false,
    indent = 0,
  }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: isLast ? "none" : BORDER_LIGHT,
        padding: "6px 10px",
        paddingLeft: `${10 + indent}px`,
        minHeight: "32px",
        backgroundColor: checked ? "#f0fdf4" : "#fff",
        transition: "background-color 0.15s",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          color: "#1f2937",
          flex: 1,
          lineHeight: "1.4",
        }}
      >
        {text}
      </span>
      <CustomCheckbox checked={checked} onChange={onChange} />
    </div>
  );

  // ─── Render signature row ───
  const SignatureRow = ({ sectionId }) => {
    const sectionData = formData[sectionId] || {};
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderTop: BORDER,
        }}
      >
        {/* Educator's Sign */}
        <div style={{ borderRight: BORDER_LIGHT, padding: "8px 10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <span
              style={{ fontSize: "11px", fontWeight: "600", color: "#374151" }}
            >
              Educator's Sign
            </span>
          </div>
          {sectionData.educatorSign ? (
            <div>
              <img
                src={sectionData.educatorSign}
                alt="Educator signature"
                style={{ height: "40px", objectFit: "contain" }}
              />
              <button
                type="button"
                onClick={() => openSignatureModal(sectionId, "educatorSign")}
                className="no-print"
                style={{
                  fontSize: "10px",
                  color: "#2563eb",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: "2px 0",
                }}
              >
                ✏️ Update
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openSignatureModal(sectionId, "educatorSign")}
              className="no-print"
              style={{
                height: "40px",
                width: "100%",
                border: "1px dashed #9ca3af",
                borderRadius: "4px",
                backgroundColor: "#f9fafb",
                color: "#6b7280",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              ✍️ Click to Sign
            </button>
          )}
        </div>
        {/* Nominated Supervisor Sign */}
        <div style={{ padding: "8px 10px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <span
              style={{ fontSize: "11px", fontWeight: "600", color: "#374151" }}
            >
              Nominated Supervisor Sign
            </span>
          </div>
          {sectionData.supervisorSign ? (
            <div>
              <img
                src={sectionData.supervisorSign}
                alt="Supervisor signature"
                style={{ height: "40px", objectFit: "contain" }}
              />
              <button
                type="button"
                onClick={() => openSignatureModal(sectionId, "supervisorSign")}
                className="no-print"
                style={{
                  fontSize: "10px",
                  color: "#2563eb",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: "2px 0",
                }}
              >
                ✏️ Update
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openSignatureModal(sectionId, "supervisorSign")}
              className="no-print"
              style={{
                height: "40px",
                width: "100%",
                border: "1px dashed #9ca3af",
                borderRadius: "4px",
                backgroundColor: "#f9fafb",
                color: "#6b7280",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              ✍️ Click to Sign
            </button>
          )}
        </div>
      </div>
    );
  };

  // ─── Render a complete section ───
  const renderSection = (section, pageBreak = false) => {
    const sectionData = formData[section.id] || {};
    let itemIndex = 0;
    const totalItems =
      section.items.length +
      (section.sublistItems?.length || 0) +
      (section.subSubItems?.length || 0) +
      (section.additionalItems?.length || 0);

    return (
      <div
        key={section.id}
        className={pageBreak ? "page-break" : ""}
        style={{ marginBottom: "0px" }}
      >
        <div style={{ border: BORDER, overflow: "hidden" }}>
          <SectionHeader
            title={section.title}
            sectionId={section.id}
            section={section}
          />

          {/* Task to complete header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: BORDER_LIGHT,
              padding: "4px 10px",
              backgroundColor: "#f3f4f6",
            }}
          >
            <span
              style={{ fontSize: "11px", fontWeight: "600", color: "#374151" }}
            >
              Task to complete
            </span>
            <span
              style={{ fontSize: "10px", fontWeight: "600", color: "#374151" }}
            >
              Please ✓
            </span>
          </div>

          {/* Main items */}
          {section.items.map((item, i) => (
            <ChecklistRow
              key={`item_${i}`}
              text={item}
              checked={sectionData[`item_${i}`] || false}
              onChange={() =>
                updateField(
                  `${section.id}.item_${i}`,
                  !sectionData[`item_${i}`],
                )
              }
              isLast={
                !section.hasSublist &&
                !section.additionalItems &&
                i === section.items.length - 1
              }
            />
          ))}

          {/* Sublist */}
          {section.hasSublist && (
            <>
              <div
                style={{
                  padding: "6px 10px",
                  borderBottom: BORDER_LIGHT,
                  backgroundColor: "#f9fafb",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#1f2937",
                    textDecoration: "underline",
                  }}
                >
                  {section.sublistTitle}
                </span>
              </div>
              {section.sublistItems.map((item, i) => (
                <ChecklistRow
                  key={`sub_${i}`}
                  text={`${i + 1}. ${item}`}
                  checked={sectionData[`sub_${i}`] || false}
                  onChange={() =>
                    updateField(
                      `${section.id}.sub_${i}`,
                      !sectionData[`sub_${i}`],
                    )
                  }
                  indent={16}
                  isLast={
                    !section.subSubItems &&
                    !section.additionalItems &&
                    i === section.sublistItems.length - 1
                  }
                />
              ))}
            </>
          )}

          {/* Sub-sub items (like cleaning sub-items) */}
          {section.subSubItems &&
            section.subSubItems.map((item, i) => (
              <ChecklistRow
                key={`subsub_${i}`}
                text={`• ${item}`}
                checked={sectionData[`subsub_${i}`] || false}
                onChange={() =>
                  updateField(
                    `${section.id}.subsub_${i}`,
                    !sectionData[`subsub_${i}`],
                  )
                }
                indent={36}
                isLast={
                  !section.additionalItems &&
                  i === section.subSubItems.length - 1
                }
              />
            ))}

          {/* Additional items (after sublist) */}
          {section.additionalItems &&
            section.additionalItems.map((item, i) => (
              <ChecklistRow
                key={`add_${i}`}
                text={item}
                checked={sectionData[`add_${i}`] || false}
                onChange={() =>
                  updateField(
                    `${section.id}.add_${i}`,
                    !sectionData[`add_${i}`],
                  )
                }
                isLast={i === section.additionalItems.length - 1}
              />
            ))}

          {/* Signature row */}
          {section.hasSignature && <SignatureRow sectionId={section.id} />}
        </div>
      </div>
    );
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  // Split sections across A4 pages
  // Page 1: Info + HR & Orientation + start of Policies
  // Page 2: Policies continued + Child Safe + Work H&S + Key People start
  // Page 3: Key People continued + Centre Base + Montessori
  // Page 4: Active Supervision + Family + Team + Declaration

  return (
    <>
      <style>{PRINT_STYLES}</style>
      <div className="min-h-screen bg-gray-200 py-8 flex flex-col items-center">
        <ToastContainer position="top-right" />

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center no-print">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <FaSpinner className="animate-spin text-blue-600" size={24} />
              <span>Loading...</span>
            </div>
          </div>
        )}

        {/* ══════════════ PAGE 1 ══════════════ */}
        <div
          className="staff-induction-print-area"
          style={{
            position: "relative",
            width: "794px",
            minHeight: "1123px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            marginBottom: "24px",
          }}
        >
          {/* Top header image */}
          <img
            src={topImage}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "118px",
              objectFit: "cover",
              display: "block",
            }}
            draggable={false}
          />
          {/* Bottom footer image */}
          <img
            src={bottomImage}
            alt=""
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "80px",
              objectFit: "cover",
              display: "block",
            }}
            draggable={false}
          />

          {/* Content area */}
          <div
            style={{
              paddingTop: "126px",
              paddingBottom: "90px",
              paddingLeft: "38px",
              paddingRight: "38px",
            }}
          >
            {/* Title */}
            <h1
              style={{
                textAlign: "center",
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#000",
                letterSpacing: "0.5px",
              }}
            >
              Staff Induction Checklist
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: "11px",
                color: "#374151",
                lineHeight: "1.6",
                marginBottom: "14px",
                textAlign: "justify",
              }}
            >
              This induction checklist supports Quality Area 7: Governance and
              Leadership under the National Quality Standard. The checklist
              should be completed within the first week of employment. Both the
              supervisor and new staff member should initial each section once
              the orientation has been completed. The completed document will be
              stored in the employee's staff file and a copy may be provided to
              the staff member.
            </p>

            {/* Staff Info Table */}
            <div style={{ border: BORDER, marginBottom: "14px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  borderBottom: BORDER,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRight: BORDER,
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #4A90D9, #357ABD)",
                      padding: "7px 10px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Staff Name
                  </div>
                  <input
                    type="text"
                    value={formData.staffName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        staffName: e.target.value,
                      }))
                    }
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      padding: "7px 10px",
                      fontSize: "12px",
                      backgroundColor: "#fafbff",
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #4A90D9, #357ABD)",
                      padding: "7px 10px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Nominated Supervisor Name
                  </div>
                  <input
                    type="text"
                    value={formData.supervisorName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        supervisorName: e.target.value,
                      }))
                    }
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      padding: "7px 10px",
                      fontSize: "12px",
                      backgroundColor: "#fafbff",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRight: BORDER,
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #4A90D9, #357ABD)",
                      padding: "7px 10px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Commencement Date
                  </div>
                  <input
                    type="date"
                    value={formData.commencementDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        commencementDate: e.target.value,
                      }))
                    }
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      padding: "7px 10px",
                      fontSize: "12px",
                      backgroundColor: "#fafbff",
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #4A90D9, #357ABD)",
                      padding: "7px 10px",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Position
                  </div>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      padding: "7px 10px",
                      fontSize: "12px",
                      backgroundColor: "#fafbff",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 1: HR & Orientation */}
            {renderSection(SECTIONS_DATA[0])}
          </div>
        </div>

        {/* ══════════════ PAGE 2 ══════════════ */}
        <div
          className="staff-induction-print-area page-break"
          style={{
            position: "relative",
            width: "794px",
            minHeight: "1123px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            marginBottom: "24px",
          }}
        >
          <img
            src={topImage}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "118px",
              objectFit: "cover",
              display: "block",
            }}
            draggable={false}
          />
          <img
            src={bottomImage}
            alt=""
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "80px",
              objectFit: "cover",
              display: "block",
            }}
            draggable={false}
          />
          <div
            style={{
              paddingTop: "126px",
              paddingBottom: "90px",
              paddingLeft: "38px",
              paddingRight: "38px",
            }}
          >
            {renderSection(SECTIONS_DATA[1])}
            <div style={{ marginTop: "8px" }}>
              {renderSection(SECTIONS_DATA[2])}
            </div>
            <div style={{ marginTop: "8px" }}>
              {renderSection(SECTIONS_DATA[3])}
            </div>
          </div>
        </div>

        {/* ══════════════ PAGE 3 ══════════════ */}
        <div
          className="staff-induction-print-area page-break"
          style={{
            position: "relative",
            width: "794px",
            minHeight: "1123px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            marginBottom: "24px",
          }}
        >
          <img
            src={topImage}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "118px",
              objectFit: "cover",
              display: "block",
            }}
            draggable={false}
          />
          <img
            src={bottomImage}
            alt=""
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "80px",
              objectFit: "cover",
              display: "block",
            }}
            draggable={false}
          />
          <div
            style={{
              paddingTop: "126px",
              paddingBottom: "90px",
              paddingLeft: "38px",
              paddingRight: "38px",
            }}
          >
            {renderSection(SECTIONS_DATA[4])}
            <div style={{ marginTop: "8px" }}>
              {renderSection(SECTIONS_DATA[5])}
            </div>
            <div style={{ marginTop: "8px" }}>
              {renderSection(SECTIONS_DATA[6])}
            </div>
          </div>
        </div>

        {/* ══════════════ PAGE 4 ══════════════ */}
        <div
          className="staff-induction-print-area page-break"
          style={{
            position: "relative",
            width: "794px",
            minHeight: "1123px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            marginBottom: "24px",
          }}
        >
          <img
            src={topImage}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "118px",
              objectFit: "cover",
              display: "block",
            }}
            draggable={false}
          />
          <img
            src={bottomImage}
            alt=""
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "80px",
              objectFit: "cover",
              display: "block",
            }}
            draggable={false}
          />
          <div
            style={{
              paddingTop: "126px",
              paddingBottom: "90px",
              paddingLeft: "38px",
              paddingRight: "38px",
            }}
          >
            {renderSection(SECTIONS_DATA[7])}
            <div style={{ marginTop: "8px" }}>
              {renderSection(SECTIONS_DATA[8])}
            </div>
            <div style={{ marginTop: "8px" }}>
              {renderSection(SECTIONS_DATA[9])}
            </div>

            {/* ─── DECLARATION ───────────────────────────── */}
            <div style={{ marginTop: "20px" }}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#000",
                  marginBottom: "10px",
                }}
              >
                DECLARATION
              </h2>

              {/* Employee Declaration */}
              <div style={{ marginBottom: "16px" }}>
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#000",
                    marginBottom: "6px",
                  }}
                >
                  Employee Declaration
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#374151",
                    lineHeight: "1.6",
                    marginBottom: "12px",
                  }}
                >
                  I acknowledge that I have completed the induction process and
                  understand my responsibilities in maintaining a child-safe
                  environment where the safety, wellbeing and best interests of
                  children are paramount.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr",
                    gap: "8px",
                    marginBottom: "8px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Employee Name:
                  </span>
                  <input
                    type="text"
                    value={formData.declaration.employeeName}
                    onChange={(e) =>
                      updateField("declaration.employeeName", e.target.value)
                    }
                    style={{
                      border: "none",
                      borderBottom: "1px solid #9ca3af",
                      outline: "none",
                      padding: "4px 8px",
                      fontSize: "12px",
                      backgroundColor: "transparent",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr",
                    gap: "8px",
                    marginBottom: "8px",
                    alignItems: "start",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                      paddingTop: "4px",
                    }}
                  >
                    Signature:
                  </span>
                  <div>
                    {formData.declaration.employeeSignature ? (
                      <div>
                        <img
                          src={formData.declaration.employeeSignature}
                          alt="Employee signature"
                          style={{ height: "50px", objectFit: "contain" }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            openSignatureModal(
                              "declaration",
                              "employeeSignature",
                            )
                          }
                          className="no-print"
                          style={{
                            fontSize: "10px",
                            color: "#2563eb",
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            padding: "2px 0",
                          }}
                        >
                          ✏️ Update
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          openSignatureModal("declaration", "employeeSignature")
                        }
                        className="no-print"
                        style={{
                          height: "50px",
                          width: "250px",
                          border: "1px dashed #9ca3af",
                          borderRadius: "4px",
                          backgroundColor: "#f9fafb",
                          color: "#6b7280",
                          fontSize: "11px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                        }}
                      >
                        ✍️ Click to Sign
                      </button>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Date:
                  </span>
                  <input
                    type="date"
                    value={formData.declaration.employeeDate}
                    onChange={(e) =>
                      updateField("declaration.employeeDate", e.target.value)
                    }
                    style={{
                      border: "none",
                      borderBottom: "1px solid #9ca3af",
                      outline: "none",
                      padding: "4px 8px",
                      fontSize: "12px",
                      backgroundColor: "transparent",
                      width: "200px",
                    }}
                  />
                </div>
              </div>

              {/* Supervisor Declaration */}
              <div>
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#000",
                    marginBottom: "6px",
                  }}
                >
                  Supervisor Declaration
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#374151",
                    lineHeight: "1.6",
                    marginBottom: "12px",
                  }}
                >
                  I confirm that the above induction has been completed and
                  discussed with the employee.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: "8px",
                    marginBottom: "8px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Supervisor Name:
                  </span>
                  <input
                    type="text"
                    value={formData.declaration.supervisorName}
                    onChange={(e) =>
                      updateField("declaration.supervisorName", e.target.value)
                    }
                    style={{
                      border: "none",
                      borderBottom: "1px solid #9ca3af",
                      outline: "none",
                      padding: "4px 8px",
                      fontSize: "12px",
                      backgroundColor: "transparent",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: "8px",
                    marginBottom: "8px",
                    alignItems: "start",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                      paddingTop: "4px",
                    }}
                  >
                    Signature:
                  </span>
                  <div>
                    {formData.declaration.supervisorSignature ? (
                      <div>
                        <img
                          src={formData.declaration.supervisorSignature}
                          alt="Supervisor signature"
                          style={{ height: "50px", objectFit: "contain" }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            openSignatureModal(
                              "declaration",
                              "supervisorSignature",
                            )
                          }
                          className="no-print"
                          style={{
                            fontSize: "10px",
                            color: "#2563eb",
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            padding: "2px 0",
                          }}
                        >
                          ✏️ Update
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          openSignatureModal(
                            "declaration",
                            "supervisorSignature",
                          )
                        }
                        className="no-print"
                        style={{
                          height: "50px",
                          width: "250px",
                          border: "1px dashed #9ca3af",
                          borderRadius: "4px",
                          backgroundColor: "#f9fafb",
                          color: "#6b7280",
                          fontSize: "11px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                        }}
                      >
                        ✍️ Click to Sign
                      </button>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Date:
                  </span>
                  <input
                    type="date"
                    value={formData.declaration.supervisorDate}
                    onChange={(e) =>
                      updateField("declaration.supervisorDate", e.target.value)
                    }
                    style={{
                      border: "none",
                      borderBottom: "1px solid #9ca3af",
                      outline: "none",
                      padding: "4px 8px",
                      fontSize: "12px",
                      backgroundColor: "transparent",
                      width: "200px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons (hidden on print) ── */}
        <form
          onSubmit={handleSave}
          className="no-print"
          style={{ width: "794px", marginTop: "0px", paddingBottom: "40px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 22px",
                backgroundColor: "#6b7280",
                color: "#fff",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              <FaTimes />
              Cancel
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 22px",
                backgroundColor: "#4b5563",
                color: "#fff",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              <FaPrint /> Print Form
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 22px",
                backgroundColor: saving ? "#93c5fd" : "#2563eb",
                color: "#fff",
                borderRadius: "8px",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {saving ? "Saving..." : "Save Induction"}
            </button>
          </div>
        </form>

        {/* Signature Modal */}
        <SignatureModal
          isOpen={signatureModal.open}
          onClose={() =>
            setSignatureModal({ open: false, field: null, section: null })
          }
          onSave={handleSignatureSave}
          existingSignature={
            signatureModal.open &&
            signatureModal.section &&
            signatureModal.field
              ? signatureModal.section === "declaration"
                ? formData.declaration[signatureModal.field]
                : formData[signatureModal.section]?.[signatureModal.field]
              : ""
          }
        />
      </div>
    </>
  );
};

export default StaffInductionForm;
