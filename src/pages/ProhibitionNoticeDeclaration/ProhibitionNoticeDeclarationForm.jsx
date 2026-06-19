import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../../axiosClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSave, FaTrash, FaSpinner, FaPrint } from "react-icons/fa";
import { SignaturePad } from "../Superannuation/components/SharedComponents";
import { SignatureModal } from "../TfnDeclaration/components/TfnFormComponents";

export const initialProhibitionNoticeDeclarationState = {
  title: "",
  firstName: "",
  lastName: "",
  mobileNumber: "",
  phoneNumber: "",
  dateOfBirth: "",
  email: "",
  address: "",
  addressLine2: "",
  suburbTown: "",
  stateTerritory: "",
  postcode: "",
  formerNames: "",
  subjectToProhibitionNotice: "",
  prohibitedUnderOtherLaw: "",
  declarationFullName: "",
  declarationSignature: "",
  signedPlace: "",
  signedDate: "",
  witnessSignature: "",
  witnessName: "",
};

const lineInputClass =
  "h-[20px] border-0 border-b border-dotted border-black bg-transparent px-1 text-[13px] leading-none outline-none focus:bg-blue-50/40";
const solidInputClass =
  "h-[20px] border-0 border-b-2 border-black bg-transparent px-1 text-[13px] leading-none outline-none focus:bg-blue-50/40";
const checkboxClass =
  "h-[18px] w-[18px] shrink-0 appearance-none border-2 border-black bg-white checked:bg-gray-700";

const LineInput = ({ value, onChange, className = "", ariaLabel }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`${lineInputClass} ${className}`}
    aria-label={ariaLabel}
  />
);

const SolidInput = ({ value, onChange, className = "", ariaLabel }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`${solidInputClass} ${className}`}
    aria-label={ariaLabel}
  />
);

const YesNoChoice = ({ value, onChange, name }) => {
  const toggle = (next) => onChange(value === next ? "" : next);
  return (
    <div className="flex items-center gap-4 text-[14px] text-black">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value === "yes"}
          onChange={() => toggle("yes")}
          className={checkboxClass}
          aria-label={`${name} yes`}
        />
        <span>Yes</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value === "no"}
          onChange={() => toggle("no")}
          className={checkboxClass}
          aria-label={`${name} no`}
        />
        <span>No</span>
      </label>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main form
───────────────────────────────────────────── */
const ProhibitionNoticeDeclarationForm = () => {
  const [formData, setFormData] = useState(
    initialProhibitionNoticeDeclarationState,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [declarationId, setDeclarationId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [showDeclarationSigModal, setShowDeclarationSigModal] = useState(false);
  const [showWitnessSigModal, setShowWitnessSigModal] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let empId = queryParams.get("employeeId");

    const emp = localStorage.getItem("employee");
    const usr = localStorage.getItem("user");
    if (emp) {
      const e = JSON.parse(emp);
      setEmployeeId(empId || e.id);
      if (e.organization_id) setOrganizationId(e.organization_id);
    } else if (usr) {
      const u = JSON.parse(usr);
      setEmployeeId(empId || u.id);
      if (u.organization_id) setOrganizationId(u.organization_id);
    } else if (empId) {
      setEmployeeId(empId);
    }
  }, []);

  useEffect(() => {
    if (employeeId) fetchDeclaration();
  }, [employeeId]);

  const fmtDate = (s) => (s ? new Date(s).toISOString().split("T")[0] : "");

  const fetchDeclaration = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get(
        `/declarations/employee/${employeeId}`,
      );
      if (data) {
        setDeclarationId(data.id);
        setFormData({
          title: data.title || "",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          mobileNumber: data.mobile_number || "",
          phoneNumber: data.phone_number || "",
          dateOfBirth: fmtDate(data.dob),
          email: data.email || "",
          address: data.address || "",
          addressLine2: "",
          suburbTown: data.suburb || "",
          stateTerritory: data.state || "",
          postcode: data.postcode || "",
          formerNames: data.former_names || "",
          subjectToProhibitionNotice: data.is_subject_to_prohibition
            ? "yes"
            : "no",
          prohibitedUnderOtherLaw: data.is_prohibited_other_law ? "yes" : "no",
          declarationFullName: data.declaration_person_name || "",
          declarationSignature: data.declaration_person_signature_url || "",
          signedPlace: data.declaration_place || "",
          signedDate: fmtDate(data.declaration_date),
          witnessSignature: data.witness_signature_url || "",
          witnessName: data.witness_name || "",
        });
      }
    } catch (err) {
      if (err.response?.status !== 404)
        toast.error("Failed to load declaration data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = "First name is required";
    if (!formData.lastName.trim()) e.lastName = "Last name is required";
    if (!formData.subjectToProhibitionNotice)
      e.subjectToProhibitionNotice = "This field is required";
    if (!formData.prohibitedUnderOtherLaw)
      e.prohibitedUnderOtherLaw = "This field is required";
    if (!formData.declarationFullName.trim())
      e.declarationFullName = "Declaration full name is required";
    if (!formData.signedPlace.trim())
      e.signedPlace = "Signed place is required";
    if (!formData.signedDate) e.signedDate = "Signed date is required";
    if (!formData.witnessName.trim())
      e.witnessName = "Witness name is required";
    if (!formData.declarationSignature)
      e.declarationSignature = "Declaration signature is required";
    console.log("errors", e);
    if (!formData.witnessSignature)
      e.witnessSignature = "Witness signature is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
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
      const payload = {
        employee_id: employeeId,
        organization_id: organizationId || 15,
        title: formData.title,
        last_name: formData.lastName,
        first_name: formData.firstName,
        mobile_number: formData.mobileNumber,
        phone_number: formData.phoneNumber,
        dob: formData.dateOfBirth,
        email: formData.email,
        address: formData.address,
        suburb: formData.suburbTown,
        state: formData.stateTerritory,
        postcode: formData.postcode,
        former_names: formData.formerNames,
        is_subject_to_prohibition:
          formData.subjectToProhibitionNotice === "yes",
        is_prohibited_other_law: formData.prohibitedUnderOtherLaw === "yes",
        declaration_place: formData.signedPlace,
        declaration_date: formData.signedDate,
        witness_name: formData.witnessName,
        declaration_person_name: formData.declarationFullName,
        declaration_person_signature_base64: formData.declarationSignature,
        witness_signature_base64: formData.witnessSignature,
      };

      let response;
      if (declarationId) {
        // Update existing declaration
        response = await axiosClient.put(
          `/declarations/${declarationId}`,
          payload,
        );
        if (response.data) {
          toast.success("Declaration updated successfully!");
        }
      } else {
        // Create new declaration
        response = await axiosClient.post("/declarations", payload);
        if (response.data) {
          setDeclarationId(response.data.id);
          toast.success("Declaration created successfully!");
        }
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const fe = {};
        Object.keys(err.response.data.errors).forEach(
          (k) => (fe[k] = err.response.data.errors[k][0]),
        );
        setErrors(fe);
        toast.error(err.response.data.message || "Failed to save declaration");
      } else {
        toast.error("Failed to save declaration");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!declarationId) {
      toast.error("No declaration to delete");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this declaration?"))
      return;
    try {
      setSaving(true);
      await axiosClient.delete(`/declarations/${declarationId}`);
      setDeclarationId(null);
      setFormData(initialProhibitionNoticeDeclarationState);
      toast.success("Declaration deleted successfully!");
    } catch {
      toast.error("Failed to delete declaration");
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
            <span>Loading…</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="mx-auto min-h-[1260px] w-[794px] bg-white px-[32px] py-[28px] text-black shadow-lg print:shadow-none"
      >
        <h1 className="border-b-2 border-black pb-2 text-[29px] font-normal leading-tight tracking-wide">
          Prohibition notice declaration for prospective staff members
        </h1>

        <ul className="mt-2 list-disc space-y-[3px] pl-6 text-[13px] leading-[1.18]">
          <li>
            The declaration may be completed by any prospective staff member
            seeking employment or engagement with an education and care service
          </li>
          <li>
            This form is designed to support approved providers to ensure they
            do not engage or employ a person who is prohibited from working in
            an education and care service, in line with Section 188 of the
            Education and Care Services National Law
          </li>
          <li>
            Completed forms should be retained and stored by the approved
            provider to support compliance with Section 188 of the Education and
            Care Services National Law
          </li>
          <li>
            <strong>
              Please note this form does not need to be lodged with the
              regulatory authority
            </strong>
          </li>
        </ul>

        <h2 className="mt-6 text-[23px] leading-tight">
          Part A: <strong>Personal details</strong>
        </h2>

        <div className="mt-5 grid grid-cols-[28px_1fr] gap-x-3 text-[13px]">
          <div className="font-bold">1.</div>
          <div>
            <p className="mb-5 font-bold">Please complete the following:</p>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <label className="grid grid-cols-[92px_1fr] items-end">
                <span>Title:</span>
                <LineInput
                  value={formData.title}
                  onChange={(v) => updateField("title", v)}
                  ariaLabel="Title"
                />
              </label>
              <label className="grid grid-cols-[82px_1fr] items-end">
                <span>First name:</span>
                <div>
                  <LineInput
                    value={formData.firstName}
                    onChange={(v) => updateField("firstName", v)}
                    ariaLabel="First name"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
              </label>
              <label className="grid grid-cols-[92px_1fr] items-end">
                <span>Last name:</span>
                <div>
                  <LineInput
                    value={formData.lastName}
                    onChange={(v) => updateField("lastName", v)}
                    ariaLabel="Last name"
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </label>
              <label className="grid grid-cols-[100px_1fr] items-end">
                <span>Mobile number:</span>
                <LineInput
                  value={formData.mobileNumber}
                  onChange={(v) => updateField("mobileNumber", v)}
                  ariaLabel="Mobile number"
                />
              </label>
              <label className="grid grid-cols-[92px_1fr] items-end">
                <span>Phone number:</span>
                <LineInput
                  value={formData.phoneNumber}
                  onChange={(v) => updateField("phoneNumber", v)}
                  ariaLabel="Phone number"
                />
              </label>
              <label className="grid grid-cols-[100px_1fr] items-end">
                <span className="leading-tight">
                  Date of birth:
                  <br />
                  DD/MM/YYYY
                </span>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(v) => updateField("dateOfBirth", v.target.value)}
                  className="h-[20px] border-0 border-b-2 border-black bg-transparent px-1 text-[13px] leading-none outline-none focus:bg-blue-50/40"
                  aria-label="Date of birth"
                />
              </label>
            </div>

            <label className="mt-4 grid grid-cols-[92px_1fr] items-end">
              <span>Email:</span>
              <LineInput
                value={formData.email}
                onChange={(v) => updateField("email", v)}
                ariaLabel="Email"
              />
            </label>
            <label className="mt-4 grid grid-cols-[92px_1fr] items-end">
              <span>Address:</span>
              <LineInput
                value={formData.address}
                onChange={(v) => updateField("address", v)}
                ariaLabel="Address"
              />
            </label>
            <LineInput
              value={formData.addressLine2}
              onChange={(v) => updateField("addressLine2", v)}
              className="ml-[92px] mt-4 block w-[410px]"
              ariaLabel="Address line 2"
            />
            <label className="mt-4 grid grid-cols-[92px_1fr] items-end">
              <span>Suburb/Town:</span>
              <LineInput
                value={formData.suburbTown}
                onChange={(v) => updateField("suburbTown", v)}
                ariaLabel="Suburb or town"
              />
            </label>
            <div className="mt-4 grid grid-cols-[220px_220px] gap-x-12">
              <label className="grid grid-cols-[105px_1fr] items-end">
                <span>State/Territory:</span>
                <LineInput
                  value={formData.stateTerritory}
                  onChange={(v) => updateField("stateTerritory", v)}
                  ariaLabel="State or territory"
                />
              </label>
              <label className="grid grid-cols-[70px_1fr] items-end">
                <span>Postcode:</span>
                <LineInput
                  value={formData.postcode}
                  onChange={(v) => updateField("postcode", v)}
                  ariaLabel="Postcode"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-[28px_218px_1fr] gap-x-3 text-[13px]">
          <div className="font-bold">2.</div>
          <p className="font-bold leading-tight">
            Please provide details of any former names or other names you may be
            known by:
          </p>
          <LineInput
            value={formData.formerNames}
            onChange={(v) => updateField("formerNames", v)}
            className="w-full"
            aria-label="Former names or other names"
          />
        </div>

        <div className="mt-6 grid grid-cols-[28px_1fr_auto] items-center gap-x-3 text-[13px]">
          <div className="font-bold">3.</div>
          <p className="font-bold">
            Are you currently subject to a prohibition notice under the
            Education and Care Services National Law?
          </p>
          <div>
            <YesNoChoice
              name="Subject to prohibition notice"
              value={formData.subjectToProhibitionNotice}
              onChange={(v) => updateField("subjectToProhibitionNotice", v)}
            />
            {errors.subjectToProhibitionNotice && (
              <p className="text-red-500 text-xs mt-1">
                {errors.subjectToProhibitionNotice}
              </p>
            )}
          </div>
        </div>

        <p className="ml-[58px] mt-5 max-w-[520px] text-[15px] font-bold italic leading-tight">
          Please note that under section 187 of the Education and Care Services
          National Law, a person who is subject to a prohibition notice is not
          allowed to work for or be engaged by an education and care service or
          carry out any other related activity.
        </p>

        <div className="mt-3 grid grid-cols-[28px_1fr_auto] items-center gap-x-3 text-[13px]">
          <div className="font-bold">4.</div>
          <p className="font-bold">
            Are you currently prohibited or restricted from working with
            children under any other law?
          </p>
          <div>
            <YesNoChoice
              name="Prohibited under other law"
              value={formData.prohibitedUnderOtherLaw}
              onChange={(v) => updateField("prohibitedUnderOtherLaw", v)}
            />
            {errors.prohibitedUnderOtherLaw && (
              <p className="text-red-500 text-xs mt-1">
                {errors.prohibitedUnderOtherLaw}
              </p>
            )}
          </div>
        </div>

        <h2 className="mt-8 text-[23px] leading-tight">
          Part B: <strong>Declaration</strong>
        </h2>

        <div className="mt-5 text-[13px] leading-snug">
          <div className="flex items-end">
            <span>I,</span>
            <div>
              <LineInput
                value={formData.declarationFullName}
                onChange={(v) => updateField("declarationFullName", v)}
                className={`mx-1 w-[300px] ${errors.declarationFullName ? "border-red-500" : ""}`}
                ariaLabel="Full name of person signing declaration"
              />
              {errors.declarationFullName && (
                <p className="text-red-500 text-xs">
                  {errors.declarationFullName}
                </p>
              )}
            </div>
            <span>
              [insert full name of person signing the declaration] declare that:
            </span>
          </div>

          <ol className="mt-4 list-decimal space-y-2 pl-9">
            <li>
              the information provided on this form is true, complete and
              correct
            </li>
            <li>
              the approved provider or a representative of the approved provider
              is authorised to verify any information provided in this form
            </li>
            <li>
              I am aware that under the Education and Care Services National Law
              penalties apply if false or misleading information is provided.
            </li>
          </ol>

          {/* Declaration signature */}
          <label className="mt-5 grid grid-cols-[275px_1fr] items-start">
            <span>Signature of person making the declaration:</span>
            <div>
              <div className="w-full border border-gray-400 bg-white relative">
                {formData.declarationSignature ? (
                  <img
                    src={formData.declarationSignature}
                    alt="Declaration signature"
                    className="h-[64px] w-full object-contain"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeclarationSigModal(true)}
                    className="h-[64px] w-full flex items-center justify-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    <span className="text-[14px]">✍️</span> Click to Sign Here
                  </button>
                )}
              </div>
              {formData.declarationSignature && (
                <button
                  type="button"
                  onClick={() => setShowDeclarationSigModal(true)}
                  className="mt-1 px-3 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors"
                >
                  ✏️ Update Signature
                </button>
              )}
            </div>
          </label>
          {errors.declarationSignature && (
            <p className="text-red-500 text-xs ml-[303px]">
              {errors.declarationSignature}
            </p>
          )}
          <SignatureModal
            isOpen={showDeclarationSigModal}
            onClose={() => setShowDeclarationSigModal(false)}
            onSave={(v) => updateField("declarationSignature", v)}
            existingSignature={formData.declarationSignature}
          />

          <div className="mt-4 grid grid-cols-[68px_1fr_55px_1fr] items-end gap-x-3">
            <span>Signed at:</span>
            <div>
              <LineInput
                value={formData.signedPlace}
                onChange={(v) => updateField("signedPlace", v)}
                className={`w-full ${errors.signedPlace ? "border-red-500" : ""}`}
                ariaLabel="Signed at place"
              />
              <p className="text-center text-[12px] leading-none">[place]</p>
              {errors.signedPlace && (
                <p className="text-red-500 text-xs">{errors.signedPlace}</p>
              )}
            </div>
            <span>on the</span>
            <div>
              <input
                type="date"
                value={formData.signedDate}
                onChange={(e) => updateField("signedDate", e.target.value)}
                className={`h-[20px] border-0 border-b-2 border-black bg-transparent px-1 text-[13px] leading-none outline-none focus:bg-blue-50/40 ${errors.signedDate ? "border-red-500" : ""}`}
                aria-label="Signed date"
              />
              <p className="text-center text-[12px] leading-none">[date]</p>
              {errors.signedDate && (
                <p className="text-red-500 text-xs">{errors.signedDate}</p>
              )}
            </div>
          </div>

          {/* Witness signature */}
          <div className="mt-3 grid grid-cols-[135px_1fr_130px_1fr] items-start gap-x-5">
            <span className="mt-2">Signature of witness:</span>
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
                    onClick={() => setShowWitnessSigModal(true)}
                    className="h-[64px] w-full flex items-center justify-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    <span className="text-[14px]">✍️</span> Click to Sign Here
                  </button>
                )}
              </div>
              {formData.witnessSignature && (
                <button
                  type="button"
                  onClick={() => setShowWitnessSigModal(true)}
                  className="mt-1 px-3 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors"
                >
                  ✏️ Update Signature
                </button>
              )}
            </div>
            <span className="mt-2">Name of witness:</span>
            <div>
              <SolidInput
                value={formData.witnessName}
                onChange={(v) => updateField("witnessName", v)}
                className={errors.witnessName ? "border-red-500" : ""}
                ariaLabel="Name of witness"
              />
              {errors.witnessName && (
                <p className="text-red-500 text-xs">{errors.witnessName}</p>
              )}
            </div>
          </div>
          {errors.witnessSignature && (
            <p className="text-red-500 text-xs ml-[163px]">
              {errors.witnessSignature}
            </p>
          )}
          <SignatureModal
            isOpen={showWitnessSigModal}
            onClose={() => setShowWitnessSigModal(false)}
            onSave={(v) => updateField("witnessSignature", v)}
            existingSignature={formData.witnessSignature}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4 border-t-2 border-black pt-6 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
          >
            <FaPrint /> Print Form
          </button>
          {declarationId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              <FaTrash /> Delete
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? "Saving…" : "Save Declaration"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProhibitionNoticeDeclarationForm;
