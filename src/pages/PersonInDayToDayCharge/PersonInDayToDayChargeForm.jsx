import React, { useState } from "react";
import topImage from "../../assets/common_form_images/img9.jpg";
import bottomImage from "../../assets/common_form_images/img11.jpg";

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
  appointeeDate: "",
  nominatedSupervisorName: "",
  nominatedSupervisorConfirmName: "",
  supervisorSignature: "",
  supervisorDate: "",
  complianceActionsDetails: "",
  supervisorCertificateStatus: "",
  supervisorCertificateDetails: "",
  prohibitionNoticeStatus: "",
  prohibitionNoticeDetails: "",
  authorisationRefusedStatus: "",
  authorisationRefusedDetails: "",
  declarantFullName: "",
  declarantAddress: "",
  declarantDateOfBirth: "",
  declarantSignature: "",
  declarantDate: "",
  witnessNameAndSignature: "",
  employeeName: "",
  checklistDates: checklistItems.reduce((acc, item) => {
    acc[item] = "";
    return acc;
  }, {}),
  comments: "",
  nominatedSupervisorSignatureDate: "",
  responsiblePersonSignatureDate: "",
};

const textClass = "text-[14px] leading-[1.42] text-black";
const headingClass = "text-[17px] font-bold leading-tight text-black";
const inputLineClass =
  "h-[24px] min-w-0 flex-1 border-0 border-b border-black bg-transparent px-1 text-[14px] outline-none focus:bg-blue-50/40";
const checkboxClass =
  "h-[13px] w-[13px] shrink-0 appearance-none border border-black bg-white checked:bg-gray-700";

const Page = ({ children }) => (
  <section className="relative h-[1123px] w-[794px] overflow-hidden bg-white shadow-lg print:shadow-none">
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

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-10 print:bg-white print:py-0">
      <form className="flex flex-col items-center gap-6 print:gap-0">
        <Page>
          <h1 className="mb-6 text-center text-[18px] font-bold leading-tight text-black">
            Person in Day-to-Day Charge (PIDTDC) or Nominated Supervisor
          </h1>

          <h2 className="mb-4 text-[17px] font-bold leading-tight text-black">
            Consent Form for Appointment as a Person in Day-to-Day Charge (PIDTDC)
          </h2>

          <div className={`${textClass} space-y-4`}>
            <div>
              <p className="font-bold">Requirements of a Person in Day-to-Day Charge (PIDTDC):</p>
              <ul className="ml-6 list-disc space-y-1.5">
                <li>Must be at least 18 years of age.</li>
                <li>Ensure the name and position of the Responsible Person currently in charge of the service is clearly displayed and visible at the main entrance.</li>
                <li>Maintain an up-to-date "Responsible Person Record" to document who is currently in charge.</li>
                <li>Possess sound knowledge and understanding of the Education and Care Services National Law and Regulations, the National Quality Standard, all approved learning frameworks, and the assessment and rating process.</li>
                <li>Demonstrate the ability to effectively supervise, lead, and manage the operations of a NEXTGEN Montessori Centre.</li>
                <li>Must not have any prior non-compliance history under the relevant legislation.</li>
                <li>Must hold a recognised Child Protection qualification - Mandatory reporting Certificate.</li>
                <li>Must hold a current and valid Working with Children Check.</li>
                <li>Notify the Nominated Supervisor within 7 days of any changes to personal circumstances that may affect fitness to hold the role.</li>
              </ul>
            </div>

            <div>
              <p className="font-bold">Obligations to NEXTGEN Montessori:</p>
              <ul className="ml-6 list-disc space-y-1.5">
                <li>Hold qualifications and/or experience as required by the Approved Provider.</li>
                <li>Accept responsibility for the daily management of the centre during the absence of the Nominated Supervisor.</li>
                <li>Assume supervisory and leadership responsibilities as required throughout the day.</li>
                <li>Ensure compliance with all service policies and procedures established by the Approved Provider.</li>
                <li>Adhere strictly to the National Law and Regulations.</li>
                <li>Ensure the health, safety, and well-being of all children in attendance at all times.</li>
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
              acknowledge and accept the responsibilities and obligations associated with being appointed as a Person in Day-to-Day Charge of the NEXTGEN Montessori Centre and supporting the children under our care.
            </p>

            <div className="flex items-end gap-3">
              <span>Signature:</span>
              <InlineInput
                value={formData.appointeeSignature}
                onChange={(value) => updateField("appointeeSignature", value)}
                className="max-w-[300px]"
                ariaLabel="Appointee signature"
              />
              <span>Date:</span>
              <InlineInput
                value={formData.appointeeDate}
                onChange={(value) => updateField("appointeeDate", value)}
                className="max-w-[170px]"
                ariaLabel="Appointee date"
              />
            </div>

            <p className="flex flex-wrap items-end gap-x-1.5">
              I
              <InlineInput
                value={formData.nominatedSupervisorName}
                onChange={(value) => updateField("nominatedSupervisorName", value)}
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
              understands and accepts the responsibilities and obligations associated with being appointed as a Person in Day-to-Day Charge in my absence.
            </p>

            <div className="flex items-end gap-3">
              <span>Signature:</span>
              <InlineInput
                value={formData.supervisorSignature}
                onChange={(value) => updateField("supervisorSignature", value)}
                className="max-w-[300px]"
                ariaLabel="Supervisor signature"
              />
            </div>
            <div className="flex items-end gap-3">
              <span>Date:</span>
              <InlineInput
                value={formData.supervisorDate}
                onChange={(value) => updateField("supervisorDate", value)}
                className="max-w-[170px]"
                ariaLabel="Supervisor date"
              />
            </div>
          </div>
        </Page>

        <Page>
          <h1 className={`${headingClass} mb-2`}>
            Compliance History Statement for Appointment as PIDTDC or Nominated Supervisor
          </h1>

          <div className={`${textClass} space-y-4`}>
            <div>
              <p>1. Please provide details of any compliance actions or disciplinary proceedings taken against you under:</p>
              <p className="mt-5">- The Education and Care Services National Law and Regulations</p>
              <p className="mt-4">- Any other applicable laws in any Australian state or territory</p>
              <DetailLine
                value={formData.complianceActionsDetails}
                onChange={(value) => updateField("complianceActionsDetails", value)}
                ariaLabel="Compliance action details"
              />
            </div>

            <div>
              <p>2. Have you ever held a supervisor certificate that was subject to conditions, or was suspended or cancelled by a regulatory authority?</p>
              <div className="mt-4 flex gap-8">
                <Choice
                  label="Yes - Please provide details below"
                  checked={formData.supervisorCertificateStatus === "yes"}
                  onChange={() => setChoice("supervisorCertificateStatus", "yes")}
                />
                <Choice
                  label="No"
                  checked={formData.supervisorCertificateStatus === "no"}
                  onChange={() => setChoice("supervisorCertificateStatus", "no")}
                />
              </div>
              <DetailLine
                value={formData.supervisorCertificateDetails}
                onChange={(value) => updateField("supervisorCertificateDetails", value)}
                ariaLabel="Supervisor certificate details"
              />
            </div>

            <div>
              <p>Have you ever been issued with a prohibition notice under the Education and Care Services National Law?</p>
              <div className="mt-4 flex gap-8">
                <Choice
                  label="Yes - Please provide details below"
                  checked={formData.prohibitionNoticeStatus === "yes"}
                  onChange={() => setChoice("prohibitionNoticeStatus", "yes")}
                />
                <Choice
                  label="No"
                  checked={formData.prohibitionNoticeStatus === "no"}
                  onChange={() => setChoice("prohibitionNoticeStatus", "no")}
                />
              </div>
              <DetailLine
                value={formData.prohibitionNoticeDetails}
                onChange={(value) => updateField("prohibitionNoticeDetails", value)}
                ariaLabel="Prohibition notice details"
              />
            </div>

            <div>
              <p>3. Have you ever had a licence, approval, registration, certification, or any other authorisation refused, not renewed, suspended, or cancelled under the National Law?</p>
              <div className="mt-4 flex gap-8">
                <Choice
                  label="Yes - Please provide details below"
                  checked={formData.authorisationRefusedStatus === "yes"}
                  onChange={() => setChoice("authorisationRefusedStatus", "yes")}
                />
                <Choice
                  label="No"
                  checked={formData.authorisationRefusedStatus === "no"}
                  onChange={() => setChoice("authorisationRefusedStatus", "no")}
                />
              </div>
              <DetailLine
                value={formData.authorisationRefusedDetails}
                onChange={(value) =>
                  updateField("authorisationRefusedDetails", value)
                }
                ariaLabel="Authorisation refused details"
              />
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
                <InlineInput
                  value={formData.declarantDateOfBirth}
                  onChange={(value) => updateField("declarantDateOfBirth", value)}
                  className="max-w-[185px]"
                  ariaLabel="Declarant date of birth"
                />
              </p>
            </div>

            <div className="space-y-3">
              <p>Hereby declare:</p>
              <p>1. That all information provided in this statement is true and complete.</p>
              <p>2. I understand that providing false or misleading information may result in penalties under relevant Commonwealth, State, or Territory legislation.</p>
            </div>

            <div className="flex items-end gap-3 pt-1">
              <span>Signature of Declarant:</span>
              <InlineInput
                value={formData.declarantSignature}
                onChange={(value) => updateField("declarantSignature", value)}
                className="max-w-[255px]"
                ariaLabel="Declarant signature"
              />
              <span>Date:</span>
              <InlineInput
                value={formData.declarantDate}
                onChange={(value) => updateField("declarantDate", value)}
                className="max-w-[145px]"
                ariaLabel="Declarant date"
              />
            </div>

            <div className="flex items-end gap-3">
              <span>Witness Name and Signature:</span>
              <InlineInput
                value={formData.witnessNameAndSignature}
                onChange={(value) =>
                  updateField("witnessNameAndSignature", value)
                }
                className="max-w-[300px]"
                ariaLabel="Witness name and signature"
              />
            </div>
          </div>
        </Page>

        <Page>
          <h1 className={`${headingClass} mb-2`}>Checklist for Responsible Persons</h1>
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
            This checklist must be completed with all Responsible Persons and returned to the Nominated Supervisor prior to assuming the role.
          </p>

          <div className="w-full border border-gray-500 text-[13px] text-black">
            <div className="grid grid-cols-[1fr_165px] bg-[#3ea0d1] font-bold text-white">
              <div className="border-r border-gray-500 px-2 py-1">Items to Cover</div>
              <div className="px-2 py-1">Date Completed</div>
            </div>
            {checklistItems.map((item) => (
              <div key={item} className="grid min-h-[22px] grid-cols-[1fr_165px] border-t border-gray-400">
                <div className="border-r border-gray-400 px-2 py-[2px] leading-tight">
                  {item}
                </div>
                <input
                  type="text"
                  value={formData.checklistDates[item]}
                  onChange={(event) => updateChecklistDate(item, event.target.value)}
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
                  onChange={(event) => updateField("comments", event.target.value)}
                  className="h-[42px] w-full resize-none bg-transparent text-[13px] outline-none focus:bg-blue-50/40"
                  aria-label="Comments"
                />
              </label>
            </div>
          </div>

          <div className={`${textClass} mt-7 space-y-5`}>
            <div className="flex items-end gap-2">
              <span>Nominated Supervisor Signature &amp; Date:</span>
              <InlineInput
                value={formData.nominatedSupervisorSignatureDate}
                onChange={(value) =>
                  updateField("nominatedSupervisorSignatureDate", value)
                }
                className="max-w-[260px]"
                ariaLabel="Nominated supervisor signature and date"
              />
            </div>
            <div className="flex items-end gap-2">
              <span>Responsible Person Signature &amp; Date:</span>
              <InlineInput
                value={formData.responsiblePersonSignatureDate}
                onChange={(value) =>
                  updateField("responsiblePersonSignatureDate", value)
                }
                className="max-w-[260px]"
                ariaLabel="Responsible person signature and date"
              />
            </div>
          </div>
        </Page>
      </form>
    </div>
  );
};

export default PersonInDayToDayChargeForm;
