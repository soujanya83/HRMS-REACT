import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSave, FaSpinner, FaPrint, FaArrowLeft } from "react-icons/fa";
import axiosClient from "../../axiosClient";
import { useOrganizations } from "../../contexts/OrganizationContext";


// Import images
import topImage from "../../assets/common_form_images/img9.jpg";
import bottomImage from "../../assets/common_form_images/img11.jpg";
import logo1 from "../../assets/logo1.png";

// Import standard pages (2 to 10)
import page2Img from "../../assets/Employement Contract Template/Employement Contract Template 2026_page-0002.jpg";
import page3Img from "../../assets/Employement Contract Template/Employement Contract Template 2026_page-0003.jpg";
import page4Img from "../../assets/Employement Contract Template/Employement Contract Template 2026_page-0004.jpg";
import page5Img from "../../assets/Employement Contract Template/Employement Contract Template 2026_page-0005.jpg";
import page6Img from "../../assets/Employement Contract Template/Employement Contract Template 2026_page-0006.jpg";
import page7Img from "../../assets/Employement Contract Template/Employement Contract Template 2026_page-0007.jpg";
import page8Img from "../../assets/Employement Contract Template/Employement Contract Template 2026_page-0008.jpg";
import page9Img from "../../assets/Employement Contract Template/Employement Contract Template 2026_page-0009.jpg";
import page10Img from "../../assets/Employement Contract Template/Employement Contract Template 2026_page-0010.jpg";

import { SignaturePad } from "../Superannuation/components/SharedComponents";

// ─── Signature Modal ──────────────────────────────────────────────────────────
const SignatureModal = ({
  isOpen,
  onClose,
  onSave,
  existingSignature = "",
}) => {
  const [tempSignature, setTempSignature] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTempSignature(existingSignature);
    }
  }, [isOpen, existingSignature]);

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
          <h3 className="text-sm font-semibold text-gray-900 font-sans">
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
          <p className="text-xs text-gray-500 mb-3 font-sans">
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
            className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 font-sans"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!tempSignature}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  );
};

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
  return {
    educatorName: "",
    educatorAddress: "",
    letterDate: today,
    position: "Co-Educator",
    employmentType: "Full-time",
    hoursPerWeek: "38",
    commencementDate: "2026-10-01",
    awardClassification: "3.4",
    remuneration:
      "Salary of $31.66 per hour (plus any applicable wage subsidy)",
    deeptiSignature: "",
    deeptiDate: today,
    disclosureName: "",
    disclosureChoice: "", // 'none', 'pre-existing', 'recurring'
    disclosureDetails: "",
    disclosureSignature: "",
    disclosureDate: today,
    scheduleSignature: "",
    scheduleDate: today,
  };
};

const BORDER_SOLID = "1px solid #000";
const BORDER_LIGHT = "1px solid #d1d5db";

// Standard Page Template wrapper
const A4PageWrapper = ({ children, pageNumber }) => (
  <div
    className="employment-contract-page page-break"
    style={{
      position: "relative",
      width: "794px",
      height: "1123px",
      backgroundColor: "#fff",
      boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
      marginBottom: "24px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Top border graphic overlay */}
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
        zIndex: 10,
      }}
      draggable={false}
    />
    {/* Bottom border graphic overlay */}
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
        zIndex: 10,
      }}
      draggable={false}
    />

    {/* Main content body inside border padding */}
    <div
      style={{
        paddingTop: "126px",
        paddingBottom: "90px",
        paddingLeft: "50px",
        paddingRight: "50px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 5,
      }}
    >
      {children}

      {/* Footnote address and page number */}
      <div
        style={{
          position: "absolute",
          bottom: "35px",
          left: "50px",
          right: "50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "9px",
          color: "#6b7280",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "4px",
          fontFamily: "sans-serif",
        }}
      >
        <span>
          1 Capricorn Road, Truganina, VIC 3029 | 8488 8080 |
          nextgenmontessori.com.au
        </span>
        <span className="font-semibold">Page {pageNumber}</span>
      </div>
    </div>
  </div>
);

// Full page Image renderer for pages 2 to 10
const A4ImagePage = ({ src, pageNumber }) => (
  <div
    className="employment-contract-page page-break"
    style={{
      position: "relative",
      width: "794px",
      height: "1123px",
      backgroundColor: "#fff",
      boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
      marginBottom: "24px",
      overflow: "hidden",
    }}
  >
    <img
      src={src}
      alt={`Contract Page ${pageNumber}`}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "fill",
      }}
      draggable={false}
    />
  </div>
);

const EmploymentContractForm = () => {
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganizations();
  const [formData, setFormData] = useState(buildInitialState());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [contractId, setContractId] = useState(null);

  const [signatureModal, setSignatureModal] = useState({
    open: false,
    field: null,
  });

  const formatToInputDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("T")) {
      return dateStr.split("T")[0];
    }
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
      const date = new Date(parsed);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return dateStr;
  };

  const fetchContractDetails = async (empId) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/employment-contract/employee/${empId}`);
      if (res.data && res.data.id) {
        const contract = res.data;
        setContractId(contract.id);
        
        let hpw = contract.hours_per_week || "";
        if (hpw.endsWith(" hours")) {
          hpw = hpw.replace(" hours", "");
        }

        setFormData({
          educatorName: contract.educator_name || "",
          educatorAddress: contract.address || "",
          letterDate: formatToInputDate(contract.contract_date),
          position: contract.position || "Co-Educator",
          employmentType: contract.employment_type || "Full-time",
          hoursPerWeek: hpw,
          commencementDate: formatToInputDate(contract.commencement_date),
          awardClassification: contract.award_classification || "",
          remuneration: contract.remuneration || "",
          deeptiSignature: "",
          deeptiDate: formatToInputDate(contract.contract_date),
          disclosureName: contract.educator_name || "",
          disclosureChoice: contract.disclosure_choice || "",
          disclosureDetails: contract.disclosure_details || "",
          disclosureSignature: contract.disclosure_signature_url || "",
          disclosureDate: formatToInputDate(contract.disclosure_date),
          scheduleSignature: contract.contract_signature_url || "",
          scheduleDate: formatToInputDate(contract.contract_signature_date),
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error fetching contract details:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/employeedata/${id}`);
      if (response.data?.success && response.data?.data) {
        const empData = response.data.data;
        const name =
          `${empData.first_name || ""} ${empData.last_name || ""}`.trim();
        const address =
          `${empData.address || ""} ${empData.suburb || ""} ${empData.state || ""} ${empData.postcode || ""}`.trim();

        setFormData((prev) => {
          const storageKey = `employment_contract_${id}`;
          if (localStorage.getItem(storageKey)) return prev;

          return {
            ...prev,
            educatorName: prev.educatorName || name,
            disclosureName: prev.disclosureName || name,
            educatorAddress: prev.educatorAddress || address,
          };
        });
      }
    } catch (err) {
      console.error(
        "Error fetching employee details for contract pre-fill:",
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let empId = queryParams.get("employeeId");
    const employeeStr = localStorage.getItem("employee");
    const userStr = localStorage.getItem("user");

    let resolvedEmployeeId = null;
    let fallbackStaffName = "";
    let fallbackAddress = "";

    if (employeeStr) {
      const employee = JSON.parse(employeeStr);
      resolvedEmployeeId = empId || employee.id;
      if (!empId) {
        fallbackStaffName =
          `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
        fallbackAddress = employee.address || "";
      }
    } else if (userStr) {
      const user = JSON.parse(userStr);
      resolvedEmployeeId = empId || user.id;
    } else if (empId) {
      resolvedEmployeeId = empId;
    }

    setEmployeeId(resolvedEmployeeId);

    if (resolvedEmployeeId) {
      // First try to load from backend
      fetchContractDetails(resolvedEmployeeId).then((loaded) => {
        if (!loaded) {
          // Fallback to local storage
          const storageKey = `employment_contract_${resolvedEmployeeId}`;
          const localData = localStorage.getItem(storageKey);
          if (localData) {
            try {
              setFormData(JSON.parse(localData));
            } catch (e) {
              console.error("Error loading cached contract data", e);
            }
          } else {
            if (fallbackStaffName) {
              setFormData((prev) => ({
                ...prev,
                educatorName: fallbackStaffName,
                disclosureName: fallbackStaffName,
                educatorAddress: fallbackAddress,
              }));
            }
            fetchEmployeeDetails(resolvedEmployeeId);
          }
        }
      });
    }
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getOrganizationId = () => {
    if (selectedOrganization?.id) {
      return selectedOrganization.id;
    }
    const localOrgId = localStorage.getItem('CURRENT_ORG_ID');
    if (localOrgId) return Number(localOrgId);

    const employeeStr = localStorage.getItem("employee");
    if (employeeStr) {
      try {
        const emp = JSON.parse(employeeStr);
        if (emp.organization_id) return Number(emp.organization_id);
      } catch (e) {
        console.error(e);
      }
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const usr = JSON.parse(userStr);
        if (usr.organization_id) return Number(usr.organization_id);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!employeeId) {
      toast.error("Employee ID is missing.");
      return;
    }
    const orgId = getOrganizationId();
    if (!orgId) {
      toast.error("Organization ID is missing.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee_id: Number(employeeId),
        organization_id: Number(orgId),
        contract_date: formData.letterDate,
        educator_name: formData.educatorName,
        address: formData.educatorAddress,
        disclosure_date: formData.disclosureDate,
        position: formData.position,
        employment_type: formData.employmentType,
        hours_per_week: formData.hoursPerWeek ? `${formData.hoursPerWeek} hours` : "",
        commencement_date: formData.commencementDate,
        award_classification: formData.awardClassification,
        remuneration: formData.remuneration,
        acceptance_name: formData.educatorName,
        contract_signature_date: formData.scheduleDate,
      };

      if (formData.disclosureSignature && formData.disclosureSignature.startsWith("data:image/")) {
        payload.disclosure_signature_base64 = formData.disclosureSignature;
      }

      if (formData.scheduleSignature && formData.scheduleSignature.startsWith("data:image/")) {
        payload.contract_signature_base64 = formData.scheduleSignature;
      }

      let response;
      if (contractId) {
        response = await axiosClient.put(`/employment-contract/${contractId}`, payload);
      } else {
        response = await axiosClient.post("/employment-contract", payload);
      }

      if (response.data && (response.data.id || response.data.status || response.data.success)) {
        const savedContract = response.data.data || response.data;
        if (savedContract.id) {
          setContractId(savedContract.id);
        }
        
        // Clean up local progress
        const storageKey = `employment_contract_${employeeId}`;
        localStorage.removeItem(storageKey);

        toast.success("Employment Contract saved successfully!");
      } else {
        toast.error("Failed to save Employment Contract.");
      }
    } catch (error) {
      console.error("Error saving contract progress:", error);
      toast.error(error.response?.data?.message || "Failed to save progress to database");
    } finally {
      setSaving(false);
    }
  };

  const openSignatureModal = (field) => {
    setSignatureModal({ open: true, field });
  };

  const handleSignatureSave = (signatureData) => {
    updateField(signatureModal.field, signatureData);
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <style>
        {`
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
            .employment-contract-print-area,
            .employment-contract-print-area * { visibility: visible; }
            .employment-contract-print-area {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              overflow: visible !important;
            }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
          }
        `}
      </style>

      <ToastContainer position="top-right" />

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <FaSpinner className="animate-spin text-blue-600" size={24} />
            <span className="font-sans font-medium text-gray-800">
              Prefilling details...
            </span>
          </div>
        </div>
      )}

      {/* Pages Container */}
      <div className="min-h-screen bg-gray-200 py-8 px-4 flex flex-col items-center print:bg-white print:py-0 print:px-0">
        <div className="employment-contract-print-area flex flex-col items-center">
          {/* ══════════════ PAGE 1 ══════════════ */}
          <A4PageWrapper pageNumber={1}>
            <div className="text-right text-xs font-sans text-gray-800 font-medium mb-2">
              Date: {formatDateLabel(formData.letterDate)}
            </div>

            <div className="text-xs font-sans text-gray-800 font-semibold mb-2 leading-normal text-left w-full">
              <div className="text-black font-semibold flex items-center gap-2 mb-1 w-full">
                <span className="shrink-0">Educator's Name:</span>
                <input
                  type="text"
                  value={formData.educatorName}
                  onChange={(e) => updateField("educatorName", e.target.value)}
                  placeholder="Enter name"
                  className="no-print border-b border-gray-300 bg-transparent px-2 py-0.5 text-xs outline-none max-w-[200px] w-full font-sans font-semibold text-black"
                />
                <span className="print:inline hidden font-bold text-black border-b border-black max-w-[200px] w-full pb-0.5">
                  {formData.educatorName || ""}
                </span>
              </div>
              <div className="text-black font-semibold flex items-start gap-2 w-full">
                <span className="shrink-0">Address:</span>
                <input
                  type="text"
                  value={formData.educatorAddress}
                  onChange={(e) =>
                    updateField("educatorAddress", e.target.value)
                  }
                  placeholder="Enter address"
                  className="no-print border-b border-gray-300 bg-transparent px-2 py-0.5 text-xs outline-none max-w-[320px] w-full font-sans font-semibold text-black"
                />
                <span className="print:inline hidden font-bold text-black border-b border-black max-w-[320px] w-full pb-0.5">
                  {formData.educatorAddress || ""}
                </span>
              </div>
            </div>

            <div className="text-center font-bold font-sans text-[12.5px] border-b border-black pb-1.5 mb-2.5 uppercase tracking-wide">
              Sub: Offer of employment as{" "}
              <span className="text-red-600 font-extrabold">
                {formData.position}
              </span>
            </div>

            <div
              className="text-[13.5px] leading-[1.5] text-gray-800 text-left font-normal"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <p className="mb-2">
                Dear{" "}
                <span className="text-black font-bold">
                  {formData.educatorName.split(" ")[0] || "educator"}
                </span>
                ,
              </p>
              <p className="mb-2">
                Nextgen International Group Pty Ltd Trading as NextGen
                Montessori (ABN: 64 601 844 697) (“Us”, “We”, “Our”) is pleased
                to offer you employment in the Position set out in item 1 of the
                Schedule on a{" "}
                <span className="font-bold">
                  {formData.employmentType.toLowerCase()}
                </span>{" "}
                basis.
              </p>
              <p className="mb-2">
                The Position is a broad role which includes a wide variety of
                tasks, responsibilities, and duties which may vary from time to
                time at our discretion.
              </p>
              <p className="mb-2">
                Your employment will be covered by the Children’s Services Award
                2010 (the Award) and the National Employment Standards under the
                Fair Work Act 2009 (Cth) (NES).
              </p>
              <p className="mb-2.5">
                A copy of this Agreement is enclosed for your reference, along
                with the Fair Work Information Statement and Position
                Description.
              </p>

              <h4 className="font-bold text-[12.5px] text-blue-900 mb-0.5 mt-1.5">
                1. Condition Precedent
              </h4>
              <p className="mb-2">
                It is a condition of your employment that you are required to
                provide Us with evidence of your identity, certifications,
                current Working with Children Check, National Police check not
                more than 6 months old, and the legal right to work in
                Australia, at your own expense.
              </p>
              <p className="mb-2">
                Your employment will not be confirmed until you have done so.
                The loss of your legal right to work in Australia during your
                employment with Us will result in your employment terminating.
              </p>
              <p className="mb-2.5">
                Your offer of employment with Us is also subject on the
                satisfactory outcome of reference checks.
              </p>

              <h4 className="font-bold text-[12.5px] text-blue-900 mb-0.5 mt-1.5">
                2. Commencement Date
              </h4>
              <p className="mb-2.5">
                Your start date is set out in item 4 of the Schedule.
              </p>

              <h4 className="font-bold text-[12.5px] text-blue-900 mb-0.5 mt-1.5">
                3. Reporting Line
              </h4>
              <p className="mb-2.5 font-bold text-gray-800">
                You will report to the person holding the position as outlined
                at item 6 of the Schedule.
              </p>

              <h4 className="font-bold text-[12.5px] text-blue-900 mb-0.5 mt-1.5">
                4. Position
              </h4>
              <p className="mb-2">
                Your offer of employment includes a Position Description that
                details the duties and responsibilities of your role. It’s
                important that you understand and perform these duties and
                responsibilities, as well as any others, that We may assign to
                you.
              </p>
              <p className="mb-2">
                You acknowledge and agree to undertake the duties set out in
                your Position and that they may vary at the employer's
                discretion from time to time.
              </p>
              <p className="mb-1 font-bold text-gray-800">
                During the tenure of your employment with Us, you are expected
                to:
              </p>
              <ul className="list-alpha pl-5 space-y-1 font-semibold">
                <li>
                  a. undertake the duties to the best of your abilities at all
                  times;
                </li>
                <li>b. undertake all duties in a safe manner;</li>
                <li>
                  c. undertake duties for Our related entities from time to
                  time;
                </li>
                <li>
                  d. follow all reasonable and lawful instructions and
                  directions given to you by Us;
                </li>
              </ul>
            </div>
          </A4PageWrapper>

          {/* ══════════════ PAGES 2 to 10 (IMAGE TEMPLATES) ══════════════ */}
          <A4ImagePage src={page2Img} pageNumber={2} />
          <A4ImagePage src={page3Img} pageNumber={3} />
          <A4ImagePage src={page4Img} pageNumber={4} />
          <A4ImagePage src={page5Img} pageNumber={5} />
          <A4ImagePage src={page6Img} pageNumber={6} />
          <A4ImagePage src={page7Img} pageNumber={7} />
          <A4ImagePage src={page8Img} pageNumber={8} />
          <A4ImagePage src={page9Img} pageNumber={9} />
          <A4ImagePage src={page10Img} pageNumber={10} />

          {/* ══════════════ PAGE 11 ══════════════ */}
          <A4PageWrapper pageNumber={11}>
            <div
              className="text-[13.5px] leading-[1.5] text-gray-800 text-left font-normal"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <p className="mb-2">
                This Agreement is governed by and is to be construed in
                accordance with the Fair Work Act 2009 (Cth) and the laws of
                Victoria, Australia.
              </p>

              <h4 className="font-bold text-[12.5px] text-blue-900 mb-0.5 mt-1.5">
                34. Acceptance
              </h4>
              <p className="mb-1.5">
                If you accept the terms and conditions of this offer of
                employment, please complete, sign and return the following
                documents in the next 7 days:
              </p>
              <ul className="list-disc pl-5 mb-2.5 space-y-1 font-semibold">
                <li>A copy of this Agreement;</li>
                <li>Disclosure of conviction for serious offence;</li>
                <li>Position Description;</li>
                <li>Evidence of Working Rights;</li>
                <li>
                  Evidence of Valid Checks, Qualifications, Registrations and
                  Certificates;
                </li>
                <li>
                  Onboarding forms; TFN and Superannuation Standard Choice Form.
                </li>
              </ul>

              <h4 className="font-bold text-[12.5px] text-blue-900 mb-0.5 mt-1.5">
                35. Execution
              </h4>
              <p className="mb-3 font-semibold">
                We look forward to work with you.
              </p>

              <p className="mb-2 font-bold text-gray-800">
                SIGNED for and on behalf of{" "}
                <span className="text-blue-950 font-extrabold text-[12px]">
                  Nextgen International Group PTY LTD.
                </span>{" "}
                trading as{" "}
                <span className="text-blue-950 font-extrabold text-[12px]">
                  Nextgen Montessori
                </span>
              </p>

              {/* Head of Operations signature block */}
              <div className="mt-4 grid grid-cols-2 gap-8 border-t border-gray-300 pt-3">
                <div>
                  <div className="text-xs font-sans text-gray-800 font-bold mb-0.5">
                    Deepti Sharma
                  </div>
                  <div className="text-[10px] text-gray-500 font-sans">
                    [Head of Operations]
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-sans text-gray-700 block mb-0.5 font-bold">
                      Signed Date:
                    </span>
                    <input
                      type="date"
                      value={formData.deeptiDate}
                      onChange={(e) =>
                        updateField("deeptiDate", e.target.value)
                      }
                      className="border border-gray-400 rounded px-2 py-0.5 text-xs outline-none bg-transparent w-full max-w-[160px]"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-sans text-gray-700 block mb-0.5 font-bold">
                    Signature:
                  </span>
                  <div className="border border-gray-400 bg-white relative w-full h-[60px] rounded-lg overflow-hidden">
                    {formData.deeptiSignature ? (
                      <img
                        src={formData.deeptiSignature}
                        alt="Deepti signature"
                        className="h-[60px] w-full object-contain"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => openSignatureModal("deeptiSignature")}
                        className="no-print h-[60px] w-full flex items-center justify-center gap-1 text-[11px] text-blue-600 hover:bg-blue-50/50 cursor-pointer"
                      >
                        ✍️ Click to Sign
                      </button>
                    )}
                  </div>
                  {formData.deeptiSignature && (
                    <button
                      type="button"
                      onClick={() => openSignatureModal("deeptiSignature")}
                      className="no-print mt-0.5 text-[10px] font-sans text-blue-600 hover:underline cursor-pointer"
                    >
                      ✏️ Edit Signature
                    </button>
                  )}
                </div>
              </div>
            </div>
          </A4PageWrapper>

          {/* ══════════════ PAGE 12 ══════════════ */}
          <A4PageWrapper pageNumber={12}>
            <div className="text-left font-bold text-center text-blue-900 border-b border-black pb-1 mb-2 text-[13px] font-sans uppercase tracking-wide">
              DISCLOSURE OF PRE-EXISTING INJURIES
            </div>

            <div
              className="text-[13px] leading-[1.4] text-gray-800 text-left font-normal font-serif"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <p className="mb-1 font-bold text-gray-800 text-[12px]">
                Section 41 of the Workplace Injury Rehabilitation and
                Compensation Act 2013 (Vic) (WIRC Act)
              </p>
              <p className="mb-1">
                NextGen Montessori is committed to providing a safe working
                environment for all employees. As part of this commitment, it is
                NextGen’s objective to ensure that employees are fit to perform
                the inherent requirements of their job, and are not required to
                perform tasks which they are not able to perform safely.
              </p>
              <p className="mb-1">
                In applying for employment with NextGen Montessori, it is
                important that you understand the tasks you will be required to
                perform, and the physical demands that are required in the role
                for which you have applied. Please read this document and the
                attachment(s) carefully and if you have any questions about the
                work required, raise them with us before continuing with your
                employment application.
              </p>
              <p className="mb-1">
                As a pre-requisite of employment with NextGen Montessori, that
                you are requested to disclose any pre-existing injury or disease
                that you have suffered, about which you are aware, and that you
                could reasonably be expected to foresee as potentially being
                affected by the nature of the proposed employment, set out in
                the job advertisement and position description.
              </p>
              <p className="mb-2">
                If you do have a pre-existing injury or disease and fail to make
                such a disclosure, or if you make a false or misleading
                disclosure about a pre-existing injury or disease, s.41(2) of
                the WIRC Act will apply. The effect of s.41(2) is that you will
                not be entitled to compensation if you suffer any recurrence,
                aggravation, acceleration, exacerbation, or deterioration of the
                pre-existing injury or disease arising out of, or in the course
                of, or due to the nature of your employment with NextGen
                Montessori.
              </p>

              <div className="bg-gray-50 border border-gray-300 p-2 rounded-lg mb-2">
                <h4 className="font-bold text-[11.5px] font-sans mb-1.5 uppercase tracking-wider text-blue-900">
                  DISCLOSURE
                </h4>

                <div className="flex items-center gap-1.5 mb-1.5 w-full">
                  <span className="font-sans shrink-0 font-bold">I,</span>
                  <input
                    type="text"
                    value={formData.educatorName}
                    onChange={(e) =>
                      updateField("educatorName", e.target.value)
                    }
                    placeholder="Full name"
                    className="border-b border-gray-400 bg-transparent px-1.5 py-0.5 text-xs outline-none flex-1 font-sans font-bold text-black"
                  />
                  <span className="font-sans shrink-0 font-bold">
                    acknowledge that I am required to disclose all pre-existing
                    injuries.
                  </span>
                </div>

                <div className="font-bold text-[10.5px] text-gray-700 font-sans mb-1 mt-1.5">
                  AND (select whichever is applicable):
                </div>
                <div className="space-y-1.5 text-xs font-sans text-gray-800 font-semibold">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="disclosureChoice"
                      value="none"
                      checked={formData.disclosureChoice === "none"}
                      onChange={() => updateField("disclosureChoice", "none")}
                      className="mt-0.5 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-[11px] leading-tight font-medium">
                      I do not have an injury or disease that I am aware and one
                      could reasonably be expected to foresee could affect the
                      nature of the proposed employment.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="disclosureChoice"
                      value="pre-existing"
                      checked={formData.disclosureChoice === "pre-existing"}
                      onChange={() =>
                        updateField("disclosureChoice", "pre-existing")
                      }
                      className="mt-0.5 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-[11px] leading-tight font-medium">
                      I have suffered the below listed injuries and/or disease
                      that one could not be reasonably expected to foresee
                      affecting the nature of the proposed employment.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="disclosureChoice"
                      value="recurring"
                      checked={formData.disclosureChoice === "recurring"}
                      onChange={() =>
                        updateField("disclosureChoice", "recurring")
                      }
                      className="mt-0.5 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-[11px] leading-tight font-medium">
                      I have suffered the below listed injuries and/or disease
                      that may recur, deteriorate, accelerate, be exacerbated,
                      or aggravated by the duties described in the position
                      description.
                    </span>
                  </label>
                </div>

                {(formData.disclosureChoice === "pre-existing" ||
                  formData.disclosureChoice === "recurring") && (
                  <div className="mt-2">
                    <label className="block text-[10px] font-bold text-gray-600 font-sans mb-0.5">
                      Details of pre-existing injuries or diseases:
                    </label>
                    <textarea
                      value={formData.disclosureDetails}
                      onChange={(e) =>
                        updateField("disclosureDetails", e.target.value)
                      }
                      placeholder="Please detail injuries, dates, and work restrictions..."
                      className="border border-gray-400 rounded p-1.5 text-xs w-full h-[50px] resize-none outline-none font-sans bg-white"
                    />
                  </div>
                )}
              </div>

              <p className="mb-2 font-bold font-sans text-[11px] text-gray-900">
                In so declaring I understand the obligation on me to make an
                honest disclosure to this extent.
              </p>

              {/* Employee signature block page 12 */}
              <div className="grid grid-cols-2 gap-8 border-t border-gray-300 pt-2.5 mt-1">
                <div>
                  <div className="mt-1">
                    <span className="text-xs font-sans text-gray-700 block mb-0.5 font-bold">
                      Dated:
                    </span>
                    <input
                      type="date"
                      value={formData.disclosureDate}
                      onChange={(e) =>
                        updateField("disclosureDate", e.target.value)
                      }
                      className="border border-gray-400 rounded px-2 py-0.5 text-xs font-semibold outline-none bg-transparent w-full max-w-[180px] font-sans"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-sans text-gray-700 block mb-0.5 font-bold">
                    Signed:
                  </span>
                  <div className="border border-gray-400 bg-white relative w-full h-[55px] rounded-lg overflow-hidden">
                    {formData.disclosureSignature ? (
                      <img
                        src={formData.disclosureSignature}
                        alt="Employee disclosure signature"
                        className="h-[55px] w-full object-contain"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          openSignatureModal("disclosureSignature")
                        }
                        className="no-print h-[55px] w-full flex items-center justify-center gap-1 text-[11px] text-blue-600 hover:bg-blue-50/50 cursor-pointer font-sans"
                      >
                        ✍️ Click to Sign
                      </button>
                    )}
                  </div>
                  {formData.disclosureSignature && (
                    <button
                      type="button"
                      onClick={() => openSignatureModal("disclosureSignature")}
                      className="no-print mt-0.5 text-[10px] font-sans text-blue-600 hover:underline cursor-pointer"
                    >
                      ✏️ Edit Signature
                    </button>
                  )}
                </div>
              </div>
            </div>
          </A4PageWrapper>

          {/* ══════════════ PAGE 13 ══════════════ */}
          <A4PageWrapper pageNumber={13}>
            <div className="text-left font-bold text-blue-900 border-b border-black pb-0.5 mb-1.5 text-[13px] font-sans">
              Schedule
            </div>

            {/* Key Terms Table */}
            <div className="mb-2 overflow-hidden border border-gray-400 rounded-lg">
              <table className="w-full text-[11px] font-sans border-collapse text-left">
                <thead>
                  <tr className="bg-blue-600 text-white font-bold">
                    <th
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        width: "40px",
                        textAlign: "center",
                      }}
                    >
                      Item
                    </th>
                    <th
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        width: "160px",
                      }}
                    >
                      Subject
                    </th>
                    <th style={{ border: BORDER_SOLID, padding: "4px 8px" }}>
                      Key Terms
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      1
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Position
                    </td>
                    <td style={{ border: BORDER_SOLID, padding: "3px 8px" }}>
                      <select
                        value={formData.position}
                        onChange={(e) =>
                          updateField("position", e.target.value)
                        }
                        className="no-print border border-gray-400 rounded px-2 py-0.5 text-xs w-full max-w-[200px] focus:ring-1 focus:ring-blue-500 font-sans cursor-pointer bg-white"
                      >
                        <option value="Co-Educator">Co-Educator</option>
                        <option value="Educator">Educator</option>
                        <option value="Room Leader">Room Leader</option>
                        <option value="Assistant Manager">
                          Assistant Manager
                        </option>
                        <option value="Cook">Cook</option>
                      </select>
                      <span className="print:inline hidden font-bold text-black text-xs">
                        {formData.position}
                      </span>
                    </td>
                  </tr>

                  <tr className="bg-gray-50/50">
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      2
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Employment Type
                    </td>
                    <td style={{ border: BORDER_SOLID, padding: "3px 8px" }}>
                      <select
                        value={formData.employmentType}
                        onChange={(e) =>
                          updateField("employmentType", e.target.value)
                        }
                        className="no-print border border-gray-400 rounded px-2 py-0.5 text-xs w-full max-w-[200px] focus:ring-1 focus:ring-blue-500 font-sans cursor-pointer bg-white"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Casual">Casual</option>
                        <option value="Fixed term">Fixed term</option>
                      </select>
                      <span className="print:inline hidden font-bold text-black text-xs">
                        {formData.employmentType}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      3
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Hours of work per week
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                        color: "#000",
                        fontSize: "11px",
                      }}
                    >
                      {formData.hoursPerWeek} hours
                    </td>
                  </tr>

                  <tr className="bg-gray-50/50">
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      4
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Commencement Date
                    </td>
                    <td style={{ border: BORDER_SOLID, padding: "3px 8px" }}>
                      <input
                        type="date"
                        value={formData.commencementDate}
                        onChange={(e) =>
                          updateField("commencementDate", e.target.value)
                        }
                        className="no-print border border-gray-400 rounded px-2 py-0.5 text-xs outline-none bg-white font-sans cursor-pointer"
                      />
                      <span className="print:inline hidden font-bold text-black text-xs">
                        {formatDateLabel(formData.commencementDate)}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      5
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Location
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      1 Capricorn Road, Truganina
                    </td>
                  </tr>

                  <tr className="bg-gray-50/50">
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      6
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Reports Into
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Deepti Sharma
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      7
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Probationary Period
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      6 months
                    </td>
                  </tr>

                  <tr className="bg-gray-50/50">
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      8
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Notice during Probation
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      1 week
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      9
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Award
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Children's Services Award 2010
                    </td>
                  </tr>

                  <tr className="bg-gray-50/50">
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      10
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Award Classification
                    </td>
                    <td style={{ border: BORDER_SOLID, padding: "3px 8px" }}>
                      <select
                        value={formData.awardClassification}
                        onChange={(e) =>
                          updateField("awardClassification", e.target.value)
                        }
                        className="no-print border border-gray-400 rounded px-2 py-0.5 text-xs w-full max-w-[140px] focus:ring-1 focus:ring-blue-500 font-sans cursor-pointer bg-white"
                      >
                        <option value="1.1">Level 1.1</option>
                        <option value="1.2">Level 1.2</option>
                        <option value="2.1">Level 2.1</option>
                        <option value="2.2">Level 2.2</option>
                        <option value="3.1">Level 3.1</option>
                        <option value="3.2">Level 3.2</option>
                        <option value="3.3">Level 3.3</option>
                        <option value="3.4">Level 3.4</option>
                        <option value="4.1">Level 4.1</option>
                        <option value="4.2">Level 4.2</option>
                        <option value="4.3">Level 4.3</option>
                        <option value="5.1">Level 5.1</option>
                        <option value="5.2">Level 5.2</option>
                        <option value="5.3">Level 5.3</option>
                        <option value="5.4">Level 5.4</option>
                      </select>
                      <span className="print:inline hidden font-bold text-black text-xs">
                        {formData.awardClassification}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      11
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Remuneration
                    </td>
                    <td style={{ border: BORDER_SOLID, padding: "3px 8px" }}>
                      <select
                        value={formData.remuneration}
                        onChange={(e) =>
                          updateField("remuneration", e.target.value)
                        }
                        className="no-print border border-gray-400 rounded px-2 py-0.5 text-xs w-full max-w-[280px] focus:ring-1 focus:ring-blue-500 font-sans cursor-pointer bg-white"
                      >
                        <option value="Salary of $26.12 per hour (plus any applicable wage subsidy)">
                          Salary of $26.12 per hour
                        </option>
                        <option value="Salary of $28.50 per hour (plus any applicable wage subsidy)">
                          Salary of $28.50 per hour
                        </option>
                        <option value="Salary of $31.66 per hour (plus any applicable wage subsidy)">
                          Salary of $31.66 per hour
                        </option>
                        <option value="Salary of $35.00 per hour (plus any applicable wage subsidy)">
                          Salary of $35.00 per hour
                        </option>
                        <option value="Salary of $38.50 per hour (plus any applicable wage subsidy)">
                          Salary of $38.50 per hour
                        </option>
                      </select>
                      <span className="print:inline hidden font-bold text-black text-xs">
                        {formData.remuneration}
                      </span>
                    </td>
                  </tr>

                  <tr className="bg-gray-50/50">
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      12
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Pay Frequency
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Fortnightly
                    </td>
                  </tr>

                  <tr>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      13
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Termination Notice
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      In accordance with the Award
                    </td>
                  </tr>

                  <tr className="bg-gray-50/50">
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      14
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "bold",
                      }}
                    >
                      Resignation Notice
                    </td>
                    <td
                      style={{
                        border: BORDER_SOLID,
                        padding: "4px 8px",
                        fontWeight: "normal",
                      }}
                    >
                      <div className="grid grid-cols-[140px_1fr] border-b border-gray-200 pb-0.5">
                        <span>• Not more than 1 year:</span>
                        <span className="font-bold">1 Week</span>
                      </div>
                      <div className="grid grid-cols-[140px_1fr] border-b border-gray-200 py-0.5">
                        <span>• 1 year but less than 3 years:</span>
                        <span className="font-bold">2 Weeks</span>
                      </div>
                      <div className="grid grid-cols-[140px_1fr] border-b border-gray-200 py-0.5">
                        <span>• 3 years but less than 5 years:</span>
                        <span className="font-bold">3 Weeks</span>
                      </div>
                      <div className="grid grid-cols-[140px_1fr] pt-0.5">
                        <span>• More than 5 years:</span>
                        <span className="font-bold">4 Weeks</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className="text-[13px] leading-[1.4] text-gray-800 text-left font-serif mb-2 font-normal"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <p className="mb-1">
                I,{" "}
                <span className="text-black font-bold font-sans underline">
                  {formData.educatorName || "___________________"}
                </span>{" "}
                hereby acknowledge and accept the offer of{" "}
                <span className="font-bold font-sans">
                  {formData.employmentType}
                </span>{" "}
                employment on the terms and conditions detailed herein for the
                Position outlined in item 1 of the Schedule.
              </p>
              <p className="mb-1">
                I acknowledge receipt of the Fair Work Information Statement
                enclosed with this letter of offer for {formData.employmentType}{" "}
                employment.
              </p>
            </div>

            {/* Employee Signature Block */}
            <div className="grid grid-cols-2 gap-8 border-t border-gray-300 pt-2 mt-1">
              <div>
                <div className="mt-1">
                  <span className="text-xs font-sans text-gray-700 block mb-0.5 font-bold">
                    Date:
                  </span>
                  <input
                    type="date"
                    value={formData.scheduleDate}
                    onChange={(e) =>
                      updateField("scheduleDate", e.target.value)
                    }
                    className="border border-gray-400 rounded px-2 py-0.5 text-xs font-semibold outline-none bg-transparent w-full max-w-[180px] font-sans"
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-sans text-gray-700 block mb-0.5 font-bold">
                  Signed:
                </span>
                <div className="border border-gray-400 bg-white relative w-full h-[50px] rounded-lg overflow-hidden">
                  {formData.scheduleSignature ? (
                    <img
                      src={formData.scheduleSignature}
                      alt="Employee schedule signature"
                      className="h-[50px] w-full object-contain"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => openSignatureModal("scheduleSignature")}
                      className="no-print h-[50px] w-full flex items-center justify-center gap-1 text-[11px] text-blue-600 hover:bg-blue-50/50 cursor-pointer font-sans"
                    >
                      ✍️ Click to Sign
                    </button>
                  )}
                </div>
                {formData.scheduleSignature && (
                  <button
                    type="button"
                    onClick={() => openSignatureModal("scheduleSignature")}
                    className="no-print mt-0.5 text-[10px] font-sans text-blue-600 hover:underline cursor-pointer"
                  >
                    ✏️ Edit Signature
                  </button>
                )}
              </div>
            </div>
          </A4PageWrapper>
        </div>

        {/* Action Buttons (at the bottom, hidden on print) */}
        <div className="no-print w-full max-w-[794px] mt-6 mb-12 flex justify-end gap-4 border-t border-gray-300 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer font-sans"
          >
            <FaArrowLeft size={12} /> Back
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer font-sans"
          >
            <FaPrint /> Print Contract
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer font-sans"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? "Saving..." : "Save Progress"}
          </button>
        </div>
      </div>

      {/* Signature drawing canvas modal */}
      <SignatureModal
        isOpen={signatureModal.open}
        onClose={() => setSignatureModal({ open: false, field: null })}
        onSave={handleSignatureSave}
        existingSignature={
          signatureModal.open && signatureModal.field
            ? formData[signatureModal.field]
            : ""
        }
      />
    </>
  );
};

export default EmploymentContractForm;
