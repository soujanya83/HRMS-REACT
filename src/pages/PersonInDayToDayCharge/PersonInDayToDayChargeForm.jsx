import React, { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSave, FaSpinner } from "react-icons/fa";
import topImage from "../../assets/common_form_images/img9.jpg";
import bottomImage from "../../assets/common_form_images/img11.jpg";
import { SignatureModal } from "../TfnDeclaration/components/TfnFormComponents";

const checklistItems = [
  "Alarm system operation and troubleshooting",
  "Responsible Person name tag placement on the wall at the reception",
  "Sign in the Responsible Person's logbook next to the staff sign in tablet",
  "Ensuring all heating/cooling systems are on / off",
  "Location of medication folder for any medication to be administered",
  "Visitor's book location",
  "Checking WWCC and storing photocopies",
  "ID photocopying and storage procedures",
  "Professional phone answering protocol",
  "Opening and closing procedures",
  "Medical conditions and daily medication protocols for staff and children",
  "Administering medication procedures",
  "Location of Epi-Pen, Panadol, and Ventolin",
  "iCheckIn system for signing in and out children",
  "Court order's location and breach protocols",
  "Educator-to-child ratio awareness",
  "Familiarity with supply areas (kitchen, staff room, laundry, toilets)",
  "Morning educator absence protocol",
  "Procedures during local emergencies or serious incidents",
  "Handling shopping deliveries",
  "UV level monitoring and hallway display",
  "Knowledge of policies and procedures and its location",
  "Location of National Law, Regulations, and NQS documentation",
  "Understanding the complaints and grievance process",
  "Emergency contact numbers awareness",
  "Emergency evacuation and lockdown procedures",
  "Understanding of Child Safe Standards and child protection processes",
  "Procedure when DET officers conduct a spot check",
];

export const initialPersonInDayToDayChargeState = {
  appointeeName: "",
  appointeeSignature: "",
  appointeeSignatureDate: "",
  nominatedSupervisorName: "",
  nominatedSupervisorConfirmName: "",
  nominatedSupervisorSignature: "",
  nominatedSupervisorSignatureDate: "",
  complianceActionsDetails: "",
  hasSuspendedCertificate: false,
  suspendedCertificateDetails: "",
  hasProhibitionNotice: false,
  prohibitionNoticeDetails: "",
  hasRefusedLicence: false,
  refusedLicenceDetails: "",
  declarantFullName: "",
  declarantAddress: "",
  declarantDateOfBirth: "",
  declarantSignature: "",
  declarantSignatureDate: "",
  witnessName: "",
  witnessSignature: "",
  employeeName: "",
  checklistDates: checklistItems.reduce((acc, item) => {
    acc[item] = "";
    return acc;
  }, {}),
  comments: "",
  checklistNsSignature: "",
  checklistNsSignatureDate: "",
  checklistRpSignature: "",
  checklistRpSignatureDate: "",
};

const textClass = "text-[14px] leading-[1.42] text-black";
const headingClass = "text-[17px] font-bold leading-tight text-black";
const inputLineClass =
  "h-[24px] min-w-0 flex-1 border-0 border-b border-black bg-transparent px-1 text-[14px] outline-none focus:bg-blue-50/40";
const checkboxClass =
  "h-[13px] w-[13px] shrink-0 appearance-none border border-black bg-white checked:bg-gray-700";

const Page = ({ children }) => (
  <section className="relative h-[1300px] w-[794px] overflow-hidden bg-white shadow-lg print:shadow-none">
    <img
      src={topImage}
      alt=""
      className="absolute left-0 top-0 h-[90px] w-full object-cover"
      draggable={false}
    />
    <img
      src={bottomImage}
      alt=""
      className="absolute bottom-0 left-0 h-[96px] w-full object-cover"
      draggable={false}
    />
    <div className="absolute left-[82px] top-[106px] w-[650px]">{children}</div>
  </section>
);

const InlineInput = ({ value, onChange, className = "", ariaLabel }) => (
  <input
    type="text"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`${inputLineClass} ${className}`}
    aria-label={ariaLabel}
  />
);

const DetailLine = ({ value, onChange, ariaLabel }) => (
  <input
    type="text"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="mt-2 block h-[26px] w-[170px] border-0 border-b border-dotted border-black bg-transparent px-1 text-[14px] outline-none focus:bg-blue-50/40"
    aria-label={ariaLabel}
  />
);

const Choice = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center gap-1.5">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={checkboxClass}
    />
    <span>{label}</span>
  </label>
);

const PersonInDayToDayChargeForm = () => {
  const [formData, setFormData] = useState(initialPersonInDayToDayChargeState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formId, setFormId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [sigModalConfig, setSigModalConfig] = useState({
    isOpen: false,
    field: null,
    existingValue: null,
  });

  // Fetch employee data from localStorage
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let empId = queryParams.get("employeeId");

    const employeeStr = localStorage.getItem("employee");
    const userStr = localStorage.getItem("user");

    if (employeeStr) {
      const employee = JSON.parse(employeeStr);
      setEmployeeId(empId || employee.id);
      if (employee.organization_id) {
        setOrganizationId(employee.organization_id);
      }
    } else if (userStr) {
      const user = JSON.parse(userStr);
      setEmployeeId(empId || user.id);
      if (user.organization_id) {
        setOrganizationId(user.organization_id);
      }
    } else if (empId) {
      setEmployeeId(empId);
    }
  }, []);

  // Fetch existing PIDTDC form on load
  useEffect(() => {
    if (employeeId) {
      fetchPidtdcForm();
    }
  }, [employeeId]);

  const fetchPidtdcForm = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(
        `/pidtdc-forms/employee/${employeeId}`,
      );
      if (response.data) {
        const data = response.data;
        setFormId(data.id);

        // Map API response to form state
        // Reverse map checklist data from API keys to form item names
        const checklistDataMap = {
          alarm_system_operation: "Alarm system operation and troubleshooting",
          responsible_person_nametag:
            "Responsible Person name tag placement on the wall at the reception",
          logbook_signing:
            "Sign in the Responsible Person's logbook next to the staff sign in tablet",
          heating_cooling: "Ensuring all heating/cooling systems are on / off",
          medication_folder_location:
            "Location of medication folder for any medication to be administered",
          visitors_book_location: "Visitor's book location",
          checking_wwcc: "Checking WWCC and storing photocopies",
          id_photocopying: "ID photocopying and storage procedures",
          professional_phone_answering: "Professional phone answering protocol",
          opening_closing_procedures: "Opening and closing procedures",
          medical_conditions_protocols:
            "Medical conditions and daily medication protocols for staff and children",
          administering_medication: "Administering medication procedures",
          location_epipen_panadol_ventolin:
            "Location of Epi-Pen, Panadol, and Ventolin",
          icheckin_system: "iCheckIn system for signing in and out children",
          court_orders_protocols: "Court order's location and breach protocols",
          educator_ratio_awareness: "Educator-to-child ratio awareness",
          familiarity_supply_areas:
            "Familiarity with supply areas (kitchen, staff room, laundry, toilets)",
          morning_educator_absence: "Morning educator absence protocol",
          procedures_emergencies:
            "Procedures during local emergencies or serious incidents",
          handling_shopping_deliveries: "Handling shopping deliveries",
          uv_level_monitoring: "UV level monitoring and hallway display",
          knowledge_policies:
            "Knowledge of policies and procedures and its location",
          location_of_national_law:
            "Location of National Law, Regulations, and NQS documentation",
          understanding_complaints:
            "Understanding the complaints and grievance process",
          emergency_contact_numbers: "Emergency contact numbers awareness",
          emergency_evacuation_lockdown:
            "Emergency evacuation and lockdown procedures",
          understanding_child_safe_standards:
            "Understanding of Child Safe Standards and child protection processes",
          procedure_det_officers:
            "Procedure when DET officers conduct a spot check",
        };

        const checklistDates = checklistItems.reduce((acc, item) => {
          acc[item] = "";
          return acc;
        }, {});

        // Map API checklist data back to form format
        if (data.checklist_data) {
          Object.keys(data.checklist_data).forEach((apiKey) => {
            const formItemName = checklistDataMap[apiKey];
            if (formItemName && data.checklist_data[apiKey]) {
              checklistDates[formItemName] = data.checklist_data[apiKey];
            }
          });
        }

        const updatedForm = {
          appointeeName: data.appointee_name || "",
          appointeeSignature: data.appointee_signature_url || "",
          appointeeSignatureDate: data.appointee_signature_date
            ? data.appointee_signature_date.split("T")[0]
            : "",
          nominatedSupervisorName: data.nominated_supervisor_name || "",
          nominatedSupervisorConfirmName: data.nominated_supervisor_name || "",
          nominatedSupervisorSignature:
            data.nominated_supervisor_signature_url || "",
          nominatedSupervisorSignatureDate:
            data.nominated_supervisor_signature_date
              ? data.nominated_supervisor_signature_date.split("T")[0]
              : "",
          complianceActionsDetails: data.compliance_actions_details || "",
          hasSuspendedCertificate: data.has_suspended_certificate || false,
          suspendedCertificateDetails: data.suspended_certificate_details || "",
          hasProhibitionNotice: data.has_prohibition_notice || false,
          prohibitionNoticeDetails: data.prohibition_notice_details || "",
          hasRefusedLicence: data.has_refused_licence || false,
          refusedLicenceDetails: data.refused_licence_details || "",
          declarantFullName: data.declarant_full_name || "",
          declarantAddress: data.declarant_address || "",
          declarantDateOfBirth: data.declarant_dob
            ? data.declarant_dob.split("T")[0]
            : "",
          declarantSignature: data.declarant_signature_url || "",
          declarantSignatureDate: data.declarant_signature_date
            ? data.declarant_signature_date.split("T")[0]
            : "",
          witnessName: data.witness_name || "",
          witnessSignature: data.witness_signature_url || "",
          employeeName: data.checklist_employee_name || "",
          checklistDates: checklistDates,
          comments: data.checklist_comments || "",
          checklistNsSignature: data.checklist_ns_signature_url || "",
          checklistNsSignatureDate: data.checklist_ns_signature_date
            ? data.checklist_ns_signature_date.split("T")[0]
            : "",
          checklistRpSignature: data.checklist_rp_signature_url || "",
          checklistRpSignatureDate: data.checklist_rp_signature_date
            ? data.checklist_rp_signature_date.split("T")[0]
            : "",
        };
        setFormData(updatedForm);
      }
    } catch (error) {
      console.error("Error fetching PIDTDC form:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load PIDTDC form data");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateChecklistDate = (item, value) => {
    setFormData((prev) => ({
      ...prev,
      checklistDates: {
        ...prev.checklistDates,
        [item]: value,
      },
    }));
  };

  const setChoice = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] === value ? "" : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.appointeeName) {
      newErrors.appointee_name = "Appointee name is required";
    }
    if (!formData.appointeeSignature) {
      newErrors.appointee_signature_base64 = "Appointee signature is required";
    }
    if (!formData.appointeeSignatureDate) {
      newErrors.appointee_signature_date =
        "Appointee signature date is required";
    }
    if (!formData.nominatedSupervisorName) {
      newErrors.nominated_supervisor_name =
        "Nominated supervisor name is required";
    }
    if (!formData.nominatedSupervisorSignature) {
      newErrors.nominated_supervisor_signature_base64 =
        "Nominated supervisor signature is required";
    }
    if (!formData.nominatedSupervisorSignatureDate) {
      newErrors.nominated_supervisor_signature_date =
        "Nominated supervisor signature date is required";
    }
    if (!formData.declarantFullName) {
      newErrors.declarant_full_name = "Declarant full name is required";
    }
    if (!formData.declarantAddress) {
      newErrors.declarant_address = "Declarant address is required";
    }
    if (!formData.declarantDateOfBirth) {
      newErrors.declarant_dob = "Declarant date of birth is required";
    }
    if (!formData.declarantSignature) {
      newErrors.declarant_signature_base64 = "Declarant signature is required";
    }
    if (!formData.declarantSignatureDate) {
      newErrors.declarant_signature_date =
        "Declarant signature date is required";
    }
    if (!formData.witnessName) {
      newErrors.witness_name = "Witness name is required";
    }
    if (!formData.witnessSignature) {
      newErrors.witness_signature_base64 = "Witness signature is required";
    }
    if (!formData.employeeName) {
      newErrors.checklist_employee_name = "Employee name is required";
    }
    if (!formData.checklistNsSignature) {
      newErrors.checklist_ns_signature_base64 =
        "Nominated supervisor signature is required";
    }
    if (!formData.checklistNsSignatureDate) {
      newErrors.checklist_ns_signature_date =
        "Nominated supervisor signature date is required";
    }
    if (!formData.checklistRpSignature) {
      newErrors.checklist_rp_signature_base64 =
        "Responsible person signature is required";
    }
    if (!formData.checklistRpSignatureDate) {
      newErrors.checklist_rp_signature_date =
        "Responsible person signature date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!employeeId) {
      toast.error("Employee ID not found");
      return;
    }

    try {
      setSaving(true);

      // Map checklist items to API format
      const checklistDataMap = {
        "Alarm system operation and troubleshooting": "alarm_system_operation",
        "Responsible Person name tag placement on the wall at the reception":
          "responsible_person_nametag",
        "Sign in the Responsible Person's logbook next to the staff sign in tablet":
          "logbook_signing",
        "Ensuring all heating/cooling systems are on / off": "heating_cooling",
        "Location of medication folder for any medication to be administered":
          "medication_folder_location",
        "Visitor's book location": "visitors_book_location",
        "Checking WWCC and storing photocopies": "checking_wwcc",
        "ID photocopying and storage procedures": "id_photocopying",
        "Professional phone answering protocol": "professional_phone_answering",
        "Opening and closing procedures": "opening_closing_procedures",
        "Medical conditions and daily medication protocols for staff and children":
          "medical_conditions_protocols",
        "Administering medication procedures": "administering_medication",
        "Location of Epi-Pen, Panadol, and Ventolin":
          "location_epipen_panadol_ventolin",
        "iCheckIn system for signing in and out children": "icheckin_system",
        "Court order's location and breach protocols": "court_orders_protocols",
        "Educator-to-child ratio awareness": "educator_ratio_awareness",
        "Familiarity with supply areas (kitchen, staff room, laundry, toilets)":
          "familiarity_supply_areas",
        "Morning educator absence protocol": "morning_educator_absence",
        "Procedures during local emergencies or serious incidents":
          "procedures_emergencies",
        "Handling shopping deliveries": "handling_shopping_deliveries",
        "UV level monitoring and hallway display": "uv_level_monitoring",
        "Knowledge of policies and procedures and its location":
          "knowledge_policies",
        "Location of National Law, Regulations, and NQS documentation":
          "location_of_national_law",
        "Understanding the complaints and grievance process":
          "understanding_complaints",
        "Emergency contact numbers awareness": "emergency_contact_numbers",
        "Emergency evacuation and lockdown procedures":
          "emergency_evacuation_lockdown",
        "Understanding of Child Safe Standards and child protection processes":
          "understanding_child_safe_standards",
        "Procedure when DET officers conduct a spot check":
          "procedure_det_officers",
      };

      const checklistData = {};
      Object.keys(formData.checklistDates).forEach((item) => {
        const apiKey = checklistDataMap[item];
        if (apiKey) {
          checklistData[apiKey] = formData.checklistDates[item] || null;
        }
      });

      const payload = {
        employee_id: employeeId,
        organization_id: organizationId || 15,
        appointee_name: formData.appointeeName,
        appointee_signature_base64: formData.appointeeSignature,
        appointee_signature_date: formData.appointeeSignatureDate,
        nominated_supervisor_name: formData.nominatedSupervisorName,
        nominated_supervisor_signature_base64:
          formData.nominatedSupervisorSignature,
        nominated_supervisor_signature_date:
          formData.nominatedSupervisorSignatureDate,
        compliance_actions_details: formData.complianceActionsDetails,
        has_suspended_certificate: formData.hasSuspendedCertificate,
        suspended_certificate_details:
          formData.suspendedCertificateDetails || null,
        has_prohibition_notice: formData.hasProhibitionNotice,
        prohibition_notice_details: formData.prohibitionNoticeDetails || null,
        has_refused_licence: formData.hasRefusedLicence,
        refused_licence_details: formData.refusedLicenceDetails || null,
        declarant_full_name: formData.declarantFullName,
        declarant_address: formData.declarantAddress,
        declarant_dob: formData.declarantDateOfBirth,
        declarant_signature_base64: formData.declarantSignature,
        declarant_signature_date: formData.declarantSignatureDate,
        witness_name: formData.witnessName,
        witness_signature_base64: formData.witnessSignature,
        checklist_employee_name: formData.employeeName,
        checklist_data: checklistData,
        checklist_comments: formData.comments,
        checklist_ns_signature_base64: formData.checklistNsSignature,
        checklist_ns_signature_date: formData.checklistNsSignatureDate,
        checklist_rp_signature_base64: formData.checklistRpSignature,
        checklist_rp_signature_date: formData.checklistRpSignatureDate,
      };

      let response;
      if (formId) {
        // Update existing form
        response = await axiosClient.put(`/pidtdc-forms/${formId}`, payload);
        if (response.data) {
          toast.success("PIDTDC form updated successfully!");
        }
      } else {
        // Create new form
        response = await axiosClient.post("/pidtdc-forms", payload);
        if (response.data) {
          setFormId(response.data.id);
          toast.success("PIDTDC form created successfully!");
        }
      }
    } catch (error) {
      console.error("Error saving PIDTDC form:", error);
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const formattedErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          formattedErrors[key] = apiErrors[key][0];
        });
        setErrors(formattedErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error("Failed to save PIDTDC form");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-10 print:bg-white print:py-0">
      <ToastContainer position="top-right" />
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <FaSpinner className="animate-spin text-blue-600" size={24} />
            <span>Loading...</span>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSave}
        className="flex flex-col items-center gap-6 print:gap-0"
      >
        <Page>
          <h1 className="mb-6 text-center text-[18px] font-bold leading-tight text-black">
            Person in Day-to-Day Charge (PIDTDC) or Nominated Supervisor
          </h1>

          <h2 className="mb-4 text-[17px] font-bold leading-tight text-black">
            Consent Form for Appointment as a Person in Day-to-Day Charge
            (PIDTDC)
          </h2>

          <div className={`${textClass} space-y-4`}>
            <div>
              <p className="font-bold">
                Requirements of a Person in Day-to-Day Charge (PIDTDC):
              </p>
              <ul className="ml-6 list-disc space-y-1.5">
                <li>Must be at least 18 years of age.</li>
                <li>
                  Ensure the name and position of the Responsible Person
                  currently in charge of the service is clearly displayed and
                  visible at the main entrance.
                </li>
                <li>
                  Maintain an up-to-date "Responsible Person Record" to document
                  who is currently in charge.
                </li>
                <li>
                  Possess sound knowledge and understanding of the Education and
                  Care Services National Law and Regulations, the National
                  Quality Standard, all approved learning frameworks, and the
                  assessment and rating process.
                </li>
                <li>
                  Demonstrate the ability to effectively supervise, lead, and
                  manage the operations of a NEXTGEN Montessori Centre.
                </li>
                <li>
                  Must not have any prior non-compliance history under the
                  relevant legislation.
                </li>
                <li>
                  Must hold a recognised Child Protection qualification -
                  Mandatory reporting Certificate.
                </li>
                <li>
                  Must hold a current and valid Working with Children Check.
                </li>
                <li>
                  Notify the Nominated Supervisor within 7 days of any changes
                  to personal circumstances that may affect fitness to hold the
                  role.
                </li>
              </ul>
            </div>

            <div>
              <p className="font-bold">Obligations to NEXTGEN Montessori:</p>
              <ul className="ml-6 list-disc space-y-1.5">
                <li>
                  Hold qualifications and/or experience as required by the
                  Approved Provider.
                </li>
                <li>
                  Accept responsibility for the daily management of the centre
                  during the absence of the Nominated Supervisor.
                </li>
                <li>
                  Assume supervisory and leadership responsibilities as required
                  throughout the day.
                </li>
                <li>
                  Ensure compliance with all service policies and procedures
                  established by the Approved Provider.
                </li>
                <li>Adhere strictly to the National Law and Regulations.</li>
                <li>
                  Ensure the health, safety, and well-being of all children in
                  attendance at all times.
                </li>
              </ul>
            </div>

            <p className="flex flex-wrap items-end gap-x-1.5">
              I
              <InlineInput
                value={formData.appointeeName}
                onChange={(value) => updateField("appointeeName", value)}
                className="max-w-[210px]"
                ariaLabel="Appointee name"
              />
              acknowledge and accept the responsibilities and obligations
              associated with being appointed as a Person in Day-to-Day Charge
              of the NEXTGEN Montessori Centre and supporting the children under
              our care.
            </p>

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-[14px]">Signature:</span>
                {errors.appointee_signature_base64 && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="w-full border border-gray-400 bg-white relative">
                    {formData.appointeeSignature ? (
                      <img
                        src={formData.appointeeSignature}
                        alt="Appointee signature"
                        className="h-[64px] w-full object-contain"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSigModalConfig({
                            isOpen: true,
                            field: "appointeeSignature",
                            existingValue: formData.appointeeSignature,
                          })
                        }
                        className="h-[64px] w-full flex items-center justify-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors cursor-pointer"
                      >
                        <span className="text-[14px]">✍️</span> Click to Sign
                        Here
                      </button>
                    )}
                  </div>
                  {formData.appointeeSignature && (
                    <button
                      type="button"
                      onClick={() =>
                        setSigModalConfig({
                          isOpen: true,
                          field: "appointeeSignature",
                          existingValue: formData.appointeeSignature,
                        })
                      }
                      className="mt-1 px-3 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                      ✏️ Update Signature
                    </button>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px]">Date:</span>
                    {errors.appointee_signature_date && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={formData.appointeeSignatureDate}
                    onChange={(e) =>
                      updateField("appointeeSignatureDate", e.target.value)
                    }
                    className="h-[24px] border border-gray-300 bg-white px-2 text-[14px] focus:outline-none focus:border-blue-500"
                    aria-label="Appointee signature date"
                  />
                </div>
              </div>
            </div>

            <p className="flex flex-wrap items-end gap-x-1.5">
              I
              <InlineInput
                value={formData.nominatedSupervisorName}
                onChange={(value) =>
                  updateField("nominatedSupervisorName", value)
                }
                className="max-w-[190px]"
                ariaLabel="Nominated supervisor name"
              />
              as the Nominated Supervisor, confirm that
              <InlineInput
                value={formData.nominatedSupervisorConfirmName}
                onChange={(value) =>
                  updateField("nominatedSupervisorConfirmName", value)
                }
                className="max-w-[190px]"
                ariaLabel="Confirmed appointee name"
              />
              understands and accepts the responsibilities and obligations
              associated with being appointed as a Person in Day-to-Day Charge
              in my absence.
            </p>

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-[14px]">Signature:</span>
                {errors.nominated_supervisor_signature_base64 && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="w-full border border-gray-400 bg-white relative">
                    {formData.nominatedSupervisorSignature ? (
                      <img
                        src={formData.nominatedSupervisorSignature}
                        alt="Nominated supervisor signature"
                        className="h-[64px] w-full object-contain"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSigModalConfig({
                            isOpen: true,
                            field: "nominatedSupervisorSignature",
                            existingValue:
                              formData.nominatedSupervisorSignature,
                          })
                        }
                        className="h-[64px] w-full flex items-center justify-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors cursor-pointer"
                      >
                        <span className="text-[14px]">✍️</span> Click to Sign
                        Here
                      </button>
                    )}
                  </div>
                  {formData.nominatedSupervisorSignature && (
                    <button
                      type="button"
                      onClick={() =>
                        setSigModalConfig({
                          isOpen: true,
                          field: "nominatedSupervisorSignature",
                          existingValue: formData.nominatedSupervisorSignature,
                        })
                      }
                      className="mt-1 px-3 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                      ✏️ Update Signature
                    </button>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px]">Date:</span>
                    {errors.nominated_supervisor_signature_date && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={formData.nominatedSupervisorSignatureDate}
                    onChange={(e) =>
                      updateField(
                        "nominatedSupervisorSignatureDate",
                        e.target.value,
                      )
                    }
                    className="h-[24px] border border-gray-300 bg-white px-2 text-[14px] focus:outline-none focus:border-blue-500"
                    aria-label="Nominated supervisor signature date"
                  />
                </div>
              </div>
            </div>
          </div>
        </Page>

        <Page>
          <h1 className={`${headingClass} mb-2`}>
            Compliance History Statement for Appointment as PIDTDC or Nominated
            Supervisor
          </h1>

          <div className={`${textClass} space-y-4`}>
            <div>
              <p>
                1. Please provide details of any compliance actions or
                disciplinary proceedings taken against you under:
              </p>
              <p className="mt-5">
                - The Education and Care Services National Law and Regulations
              </p>
              <p className="mt-4">
                - Any other applicable laws in any Australian state or territory
              </p>
              <DetailLine
                value={formData.complianceActionsDetails}
                onChange={(value) =>
                  updateField("complianceActionsDetails", value)
                }
                ariaLabel="Compliance action details"
              />
            </div>

            <div>
              <p>
                2. Have you ever held a supervisor certificate that was subject
                to conditions, or was suspended or cancelled by a regulatory
                authority?
              </p>
              <div className="mt-4 flex gap-8">
                <Choice
                  label="Yes - Please provide details below"
                  checked={formData.hasSuspendedCertificate}
                  onChange={() =>
                    updateField(
                      "hasSuspendedCertificate",
                      !formData.hasSuspendedCertificate,
                    )
                  }
                />
                <Choice
                  label="No"
                  checked={!formData.hasSuspendedCertificate}
                  onChange={() => updateField("hasSuspendedCertificate", false)}
                />
              </div>
              {formData.hasSuspendedCertificate && (
                <DetailLine
                  value={formData.suspendedCertificateDetails}
                  onChange={(value) =>
                    updateField("suspendedCertificateDetails", value)
                  }
                  ariaLabel="Supervisor certificate details"
                />
              )}
            </div>

            <div>
              <p>
                Have you ever been issued with a prohibition notice under the
                Education and Care Services National Law?
              </p>
              <div className="mt-4 flex gap-8">
                <Choice
                  label="Yes - Please provide details below"
                  checked={formData.hasProhibitionNotice}
                  onChange={() =>
                    updateField(
                      "hasProhibitionNotice",
                      !formData.hasProhibitionNotice,
                    )
                  }
                />
                <Choice
                  label="No"
                  checked={!formData.hasProhibitionNotice}
                  onChange={() => updateField("hasProhibitionNotice", false)}
                />
              </div>
              {formData.hasProhibitionNotice && (
                <DetailLine
                  value={formData.prohibitionNoticeDetails}
                  onChange={(value) =>
                    updateField("prohibitionNoticeDetails", value)
                  }
                  ariaLabel="Prohibition notice details"
                />
              )}
            </div>

            <div>
              <p>
                3. Have you ever had a licence, approval, registration,
                certification, or any other authorisation refused, not renewed,
                suspended, or cancelled under the National Law?
              </p>
              <div className="mt-4 flex gap-8">
                <Choice
                  label="Yes - Please provide details below"
                  checked={formData.hasRefusedLicence}
                  onChange={() =>
                    updateField(
                      "hasRefusedLicence",
                      !formData.hasRefusedLicence,
                    )
                  }
                />
                <Choice
                  label="No"
                  checked={!formData.hasRefusedLicence}
                  onChange={() => updateField("hasRefusedLicence", false)}
                />
              </div>
              {formData.hasRefusedLicence && (
                <DetailLine
                  value={formData.refusedLicenceDetails}
                  onChange={(value) =>
                    updateField("refusedLicenceDetails", value)
                  }
                  ariaLabel="Authorisation refused details"
                />
              )}
            </div>

            <div className="space-y-4 pt-1">
              <p className="flex items-end gap-2">
                I, [Full Name]
                <InlineInput
                  value={formData.declarantFullName}
                  onChange={(value) => updateField("declarantFullName", value)}
                  className="max-w-[260px]"
                  ariaLabel="Declarant full name"
                />
              </p>
              <p className="flex items-end gap-2">
                of [Address]
                <InlineInput
                  value={formData.declarantAddress}
                  onChange={(value) => updateField("declarantAddress", value)}
                  className="max-w-[290px]"
                  ariaLabel="Declarant address"
                />
              </p>
              <p className="flex items-end gap-2">
                Born on [Date of Birth]
                <input
                  type="date"
                  value={formData.declarantDateOfBirth}
                  onChange={(e) =>
                    updateField("declarantDateOfBirth", e.target.value)
                  }
                  className="h-[24px] border-0 border-b border-black bg-transparent px-1 text-[14px] outline-none focus:bg-blue-50/40 max-w-[185px]"
                  ariaLabel="Declarant date of birth"
                />
              </p>
            </div>

            <div className="space-y-3">
              <p>Hereby declare:</p>
              <p>
                1. That all information provided in this statement is true and
                complete.
              </p>
              <p>
                2. I understand that providing false or misleading information
                may result in penalties under relevant Commonwealth, State, or
                Territory legislation.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px]">Signature of Declarant:</span>
                {errors.declarant_signature_base64 && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="w-full border border-gray-400 bg-white relative">
                    {formData.declarantSignature ? (
                      <img
                        src={formData.declarantSignature}
                        alt="Declarant signature"
                        className="h-[64px] w-full object-contain"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSigModalConfig({
                            isOpen: true,
                            field: "declarantSignature",
                            existingValue: formData.declarantSignature,
                          })
                        }
                        className="h-[64px] w-full flex items-center justify-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors cursor-pointer"
                      >
                        <span className="text-[14px]">✍️</span> Click to Sign
                        Here
                      </button>
                    )}
                  </div>
                  {formData.declarantSignature && (
                    <button
                      type="button"
                      onClick={() =>
                        setSigModalConfig({
                          isOpen: true,
                          field: "declarantSignature",
                          existingValue: formData.declarantSignature,
                        })
                      }
                      className="mt-1 px-3 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                      ✏️ Update Signature
                    </button>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px]">Date:</span>
                    {errors.declarant_signature_date && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={formData.declarantSignatureDate}
                    onChange={(e) =>
                      updateField("declarantSignatureDate", e.target.value)
                    }
                    className="h-[24px] border border-gray-300 bg-white px-2 text-[14px] focus:outline-none focus:border-blue-500"
                    aria-label="Declarant signature date"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[14px]">Witness Name:</span>
                {errors.witness_name && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </div>
              <InlineInput
                value={formData.witnessName}
                onChange={(value) => updateField("witnessName", value)}
                className="max-w-[300px]"
                ariaLabel="Witness name"
              />
              <div className="flex items-center gap-2">
                <span className="text-[14px]">Witness Signature:</span>
                {errors.witness_signature_base64 && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </div>
              <div>
                <div className="w-full border border-gray-400 bg-white relative">
                  {formData.witnessSignature ? (
                    <img
                      src={formData.witnessSignature}
                      alt="Witness signature"
                      className="h-[64px] w-full object-contain"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setSigModalConfig({
                          isOpen: true,
                          field: "witnessSignature",
                          existingValue: formData.witnessSignature,
                        })
                      }
                      className="h-[64px] w-full flex items-center justify-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors cursor-pointer"
                    >
                      <span className="text-[14px]">✍️</span> Click to Sign Here
                    </button>
                  )}
                </div>
                {formData.witnessSignature && (
                  <button
                    type="button"
                    onClick={() =>
                      setSigModalConfig({
                        isOpen: true,
                        field: "witnessSignature",
                        existingValue: formData.witnessSignature,
                      })
                    }
                    className="mt-1 px-3 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors"
                  >
                    ✏️ Update Signature
                  </button>
                )}
              </div>
            </div>
          </div>
        </Page>

        <Page>
          <h1 className={`${headingClass} mb-2`}>
            Checklist for Responsible Persons
          </h1>
          <div className={`${textClass} mb-5 flex items-end gap-2`}>
            <span>Employee Name:</span>
            <InlineInput
              value={formData.employeeName}
              onChange={(value) => updateField("employeeName", value)}
              className="max-w-[310px]"
              ariaLabel="Employee name"
            />
          </div>

          <p className={`${textClass} mb-5`}>
            This checklist must be completed with all Responsible Persons and
            returned to the Nominated Supervisor prior to assuming the role.
          </p>

          <div className="w-full border border-gray-500 text-[13px] text-black">
            <div className="grid grid-cols-[1fr_165px] bg-[#3ea0d1] font-bold text-white">
              <div className="border-r border-gray-500 px-2 py-1">
                Items to Cover
              </div>
              <div className="px-2 py-1">Date Completed</div>
            </div>
            {checklistItems.map((item) => (
              <div
                key={item}
                className="grid min-h-[22px] grid-cols-[1fr_165px] border-t border-gray-400"
              >
                <div className="border-r border-gray-400 px-2 py-[2px] leading-tight">
                  {item}
                </div>
                <input
                  type="date"
                  value={formData.checklistDates[item]}
                  onChange={(event) =>
                    updateChecklistDate(item, event.target.value)
                  }
                  className="h-full bg-transparent px-2 text-[13px] outline-none focus:bg-blue-50/40"
                  aria-label={`${item} date completed`}
                />
              </div>
            ))}
            <div className="grid min-h-[60px] grid-cols-1 border-t border-gray-400">
              <label className="px-2 py-1">
                <span className="block text-[14px]">Comments:</span>
                <textarea
                  value={formData.comments}
                  onChange={(event) =>
                    updateField("comments", event.target.value)
                  }
                  className="h-[42px] w-full resize-none bg-transparent text-[13px] outline-none focus:bg-blue-50/40"
                  aria-label="Comments"
                />
              </label>
            </div>
          </div>

          <div className={`${textClass} mt-7 space-y-5`}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span>Nominated Supervisor Signature:</span>
                {errors.checklist_ns_signature_base64 && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="w-full border border-gray-400 bg-white relative">
                    {formData.checklistNsSignature ? (
                      <img
                        src={formData.checklistNsSignature}
                        alt="Nominated supervisor signature"
                        className="h-[64px] w-full object-contain"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSigModalConfig({
                            isOpen: true,
                            field: "checklistNsSignature",
                            existingValue: formData.checklistNsSignature,
                          })
                        }
                        className="h-[64px] w-full flex items-center justify-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors cursor-pointer"
                      >
                        <span className="text-[14px]">✍️</span> Click to Sign
                        Here
                      </button>
                    )}
                  </div>
                  {formData.checklistNsSignature && (
                    <button
                      type="button"
                      onClick={() =>
                        setSigModalConfig({
                          isOpen: true,
                          field: "checklistNsSignature",
                          existingValue: formData.checklistNsSignature,
                        })
                      }
                      className="mt-1 px-3 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                      ✏️ Update Signature
                    </button>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px]">Date:</span>
                    {errors.checklist_ns_signature_date && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={formData.checklistNsSignatureDate}
                    onChange={(e) =>
                      updateField("checklistNsSignatureDate", e.target.value)
                    }
                    className="h-[24px] border border-gray-300 bg-white px-2 text-[14px] focus:outline-none focus:border-blue-500"
                    aria-label="Nominated supervisor signature date"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span>Responsible Person Signature:</span>
                {errors.checklist_rp_signature_base64 && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="w-full border border-gray-400 bg-white relative">
                    {formData.checklistRpSignature ? (
                      <img
                        src={formData.checklistRpSignature}
                        alt="Responsible person signature"
                        className="h-[64px] w-full object-contain"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSigModalConfig({
                            isOpen: true,
                            field: "checklistRpSignature",
                            existingValue: formData.checklistRpSignature,
                          })
                        }
                        className="h-[64px] w-full flex items-center justify-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors cursor-pointer"
                      >
                        <span className="text-[14px]">✍️</span> Click to Sign
                        Here
                      </button>
                    )}
                  </div>
                  {formData.checklistRpSignature && (
                    <button
                      type="button"
                      onClick={() =>
                        setSigModalConfig({
                          isOpen: true,
                          field: "checklistRpSignature",
                          existingValue: formData.checklistRpSignature,
                        })
                      }
                      className="mt-1 px-3 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                      ✏️ Update Signature
                    </button>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px]">Date:</span>
                    {errors.checklist_rp_signature_date && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={formData.checklistRpSignatureDate}
                    onChange={(e) =>
                      updateField("checklistRpSignatureDate", e.target.value)
                    }
                    className="h-[24px] border border-gray-300 bg-white px-2 text-[14px] focus:outline-none focus:border-blue-500"
                    aria-label="Responsible person signature date"
                  />
                </div>
              </div>
            </div>
          </div>
        </Page>
        <div className="flex justify-center gap-4 py-4 print:hidden">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>Save Form</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <span>Print Form</span>
          </button>
        </div>
      </form>
      <SignatureModal
        isOpen={sigModalConfig.isOpen}
        onClose={() =>
          setSigModalConfig({ isOpen: false, field: null, existingValue: null })
        }
        onSave={(val) => {
          updateField(sigModalConfig.field, val);
          setSigModalConfig({
            isOpen: false,
            field: null,
            existingValue: null,
          });
        }}
        existingSignature={sigModalConfig.existingValue}
      />
    </div>
  );
};

export default PersonInDayToDayChargeForm;
