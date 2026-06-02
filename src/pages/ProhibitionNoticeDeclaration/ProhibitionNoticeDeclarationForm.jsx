import React, { useState } from "react";

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
    onChange={(event) => onChange(event.target.value)}
    className={`${lineInputClass} ${className}`}
    aria-label={ariaLabel}
  />
);

const SolidInput = ({ value, onChange, className = "", ariaLabel }) => (
  <input
    type="text"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`${solidInputClass} ${className}`}
    aria-label={ariaLabel}
  />
);

const YesNoChoice = ({ value, onChange, name }) => {
  const toggle = (nextValue) => {
    onChange(value === nextValue ? "" : nextValue);
  };

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

const ProhibitionNoticeDeclarationForm = () => {
  const [formData, setFormData] = useState(initialProhibitionNoticeDeclarationState);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-10 print:bg-white print:py-0">
      <form className="mx-auto min-h-[1260px] w-[794px] bg-white px-[32px] py-[28px] text-black shadow-lg print:shadow-none">
        <h1 className="border-b-2 border-black pb-2 text-[29px] font-normal leading-tight tracking-wide">
          Prohibition notice declaration for prospective staff members
        </h1>

        <ul className="mt-2 list-disc space-y-[3px] pl-6 text-[13px] leading-[1.18]">
          <li>
            The declaration may be completed by any prospective staff member seeking
            employment or engagement with an education and care service
          </li>
          <li>
            This form is designed to support approved providers to ensure they do not
            engage or employ a person who is prohibited from working in an education
            and care service, in line with Section 188 of the Education and Care
            Services National Law
          </li>
          <li>
            Completed forms should be retained and stored by the approved provider to
            support compliance with Section 188 of the Education and Care Services
            National Law
          </li>
          <li>
            <strong>
              Please note this form does not need to be lodged with the regulatory
              authority
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
                  onChange={(value) => updateField("title", value)}
                  ariaLabel="Title"
                />
              </label>
              <label className="grid grid-cols-[82px_1fr] items-end">
                <span>First name:</span>
                <LineInput
                  value={formData.firstName}
                  onChange={(value) => updateField("firstName", value)}
                  ariaLabel="First name"
                />
              </label>

              <label className="grid grid-cols-[92px_1fr] items-end">
                <span>Last name:</span>
                <LineInput
                  value={formData.lastName}
                  onChange={(value) => updateField("lastName", value)}
                  ariaLabel="Last name"
                />
              </label>
              <label className="grid grid-cols-[100px_1fr] items-end">
                <span>Mobile number:</span>
                <LineInput
                  value={formData.mobileNumber}
                  onChange={(value) => updateField("mobileNumber", value)}
                  ariaLabel="Mobile number"
                />
              </label>

              <label className="grid grid-cols-[92px_1fr] items-end">
                <span>Phone number:</span>
                <LineInput
                  value={formData.phoneNumber}
                  onChange={(value) => updateField("phoneNumber", value)}
                  ariaLabel="Phone number"
                />
              </label>
              <label className="grid grid-cols-[100px_1fr] items-end">
                <span className="leading-tight">
                  Date of birth:
                  <br />
                  DD/MM/YYYY
                </span>
                <LineInput
                  value={formData.dateOfBirth}
                  onChange={(value) => updateField("dateOfBirth", value)}
                  ariaLabel="Date of birth"
                />
              </label>
            </div>

            <label className="mt-4 grid grid-cols-[92px_1fr] items-end">
              <span>Email:</span>
              <LineInput
                value={formData.email}
                onChange={(value) => updateField("email", value)}
                ariaLabel="Email"
              />
            </label>

            <label className="mt-4 grid grid-cols-[92px_1fr] items-end">
              <span>Address:</span>
              <LineInput
                value={formData.address}
                onChange={(value) => updateField("address", value)}
                ariaLabel="Address"
              />
            </label>
            <LineInput
              value={formData.addressLine2}
              onChange={(value) => updateField("addressLine2", value)}
              className="ml-[92px] mt-4 block w-[410px]"
              ariaLabel="Address line 2"
            />

            <label className="mt-4 grid grid-cols-[92px_1fr] items-end">
              <span>Suburb/Town:</span>
              <LineInput
                value={formData.suburbTown}
                onChange={(value) => updateField("suburbTown", value)}
                ariaLabel="Suburb or town"
              />
            </label>

            <div className="mt-4 grid grid-cols-[220px_220px] gap-x-12">
              <label className="grid grid-cols-[105px_1fr] items-end">
                <span>State/Territory:</span>
                <LineInput
                  value={formData.stateTerritory}
                  onChange={(value) => updateField("stateTerritory", value)}
                  ariaLabel="State or territory"
                />
              </label>
              <label className="grid grid-cols-[70px_1fr] items-end">
                <span>Postcode:</span>
                <LineInput
                  value={formData.postcode}
                  onChange={(value) => updateField("postcode", value)}
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
          <textarea
            value={formData.formerNames}
            onChange={(event) => updateField("formerNames", event.target.value)}
            className="h-[58px] resize-none border-0 border-y border-black bg-transparent px-2 text-[13px] outline-none focus:bg-blue-50/40"
            aria-label="Former names or other names"
          />
        </div>

        <div className="mt-6 grid grid-cols-[28px_1fr_auto] items-center gap-x-3 text-[13px]">
          <div className="font-bold">3.</div>
          <p className="font-bold">
            Are you currently subject to a prohibition notice under the Education
            and Care Services National Law?
          </p>
          <YesNoChoice
            name="Subject to prohibition notice"
            value={formData.subjectToProhibitionNotice}
            onChange={(value) => updateField("subjectToProhibitionNotice", value)}
          />
        </div>

        <p className="ml-[58px] mt-5 max-w-[520px] text-[15px] font-bold italic leading-tight">
          Please note that under section 187 of the Education and Care Services
          National Law, a person who is subject to a prohibition notice is not
          allowed to work for or be engaged by an education and care service or carry
          out any other related activity.
        </p>

        <div className="mt-3 grid grid-cols-[28px_1fr_auto] items-center gap-x-3 text-[13px]">
          <div className="font-bold">4.</div>
          <p className="font-bold">
            Are you currently prohibited or restricted from working with children
            under any other law?
          </p>
          <YesNoChoice
            name="Prohibited under other law"
            value={formData.prohibitedUnderOtherLaw}
            onChange={(value) => updateField("prohibitedUnderOtherLaw", value)}
          />
        </div>

        <h2 className="mt-8 text-[23px] leading-tight">
          Part B: <strong>Declaration</strong>
        </h2>

        <div className="mt-5 text-[13px] leading-snug">
          <div className="flex items-end">
            <span>I,</span>
            <LineInput
              value={formData.declarationFullName}
              onChange={(value) => updateField("declarationFullName", value)}
              className="mx-1 w-[300px]"
              ariaLabel="Full name of person signing declaration"
            />
            <span>
              [insert full name of person signing the declaration] declare that:
            </span>
          </div>

          <ol className="mt-4 list-decimal space-y-2 pl-9">
            <li>the information provided on this form is true, complete and correct</li>
            <li>
              the approved provider or a representative of the approved provider is
              authorised to verify any information provided in this form
            </li>
            <li>
              I am aware that under the Education and Care Services National Law
              penalties apply if false or misleading information is provided.
            </li>
          </ol>

          <label className="mt-5 grid grid-cols-[275px_1fr] items-end">
            <span>Signature of person making the declaration:</span>
            <LineInput
              value={formData.declarationSignature}
              onChange={(value) => updateField("declarationSignature", value)}
              ariaLabel="Signature of person making the declaration"
            />
          </label>

          <div className="mt-4 grid grid-cols-[68px_1fr_55px_1fr] items-end gap-x-3">
            <span>Signed at:</span>
            <div>
              <LineInput
                value={formData.signedPlace}
                onChange={(value) => updateField("signedPlace", value)}
                className="w-full"
                ariaLabel="Signed at place"
              />
              <p className="text-center text-[12px] leading-none">[place]</p>
            </div>
            <span>on the</span>
            <div>
              <LineInput
                value={formData.signedDate}
                onChange={(value) => updateField("signedDate", value)}
                className="w-full"
                ariaLabel="Signed date"
              />
              <p className="text-center text-[12px] leading-none">[date]</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[135px_1fr_130px_1fr] items-end gap-x-5">
            <span>Signature of witness:</span>
            <SolidInput
              value={formData.witnessSignature}
              onChange={(value) => updateField("witnessSignature", value)}
              ariaLabel="Signature of witness"
            />
            <span>Name of witness:</span>
            <SolidInput
              value={formData.witnessName}
              onChange={(value) => updateField("witnessName", value)}
              ariaLabel="Name of witness"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProhibitionNoticeDeclarationForm;
