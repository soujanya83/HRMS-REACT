import React from "react";
import {
  SectionHeader,
  InputField,
  SegmentedInput,
  InfoNote,
  SignatureBox,
  FormCheckbox,
  PageFooter,
} from "./SharedComponents";
import AtoLink from "../../../components/common/AtoLink";


const SectionD = ({
  smsfName,
  onSmsfNameChange,
  smsfAbn,
  onSmsfAbnChange,
  esa,
  onEsaChange,
  fullNameOnAccount,
  onFullNameOnAccountChange,
  bankAccountName,
  onBankAccountNameChange,
  bsb,
  onBsbChange,
  accountNumber,
  onAccountNumberChange,
  hasSmsfEvidence,
  onHasSmsfEvidenceChange,
  signature,
  onSignatureChange,
  date,
  onDateChange,
  readOnly = false,
}) => {
  return (
    <div className="w-[794px] min-h-[1123px] bg-white mx-auto shadow-lg flex flex-col">
      {/* Section header */}
      <SectionHeader
        label="D"
        title="My private self-managed super fund (SMSF)"
        color="maroon"
      />

      <div className="px-8 pt-6 pb-6 flex-1 flex flex-col gap-4">
        {/* SMSF details heading */}
        <h2 className="text-[14px] font-bold text-gray-900">SMSF details</h2>

        {/* SMSF name */}
        <InputField
          label="SMSF name"
          value={smsfName}
          onChange={onSmsfNameChange}
        />

        {/* SMSF ABN */}
        <SegmentedInput
          label="SMSF Australian business number (ABN)"
          segments={[2, 3, 3, 3]}
          values={smsfAbn}
          onChange={onSmsfAbnChange}
        />

        {/* ESA */}
        <div>
          <InputField
            label="SMSF electronic service address (ESA)"
            value={esa}
            onChange={onEsaChange}
          />
          <div className="mt-1">
            <InfoNote>
              An ESA is used so the fund can receive electronic messages and
              payments from your employer using SuperStream. You can find your
              ESA by contacting your SMSF messaging provider or through your
              SMSF administrator, tax agent, accountant or bank.
            </InfoNote>
          </div>
        </div>

        {/* Full name on account */}
        <div>
          <InputField
            label="Your full name as it appears on your account"
            value={fullNameOnAccount}
            onChange={onFullNameOnAccountChange}
          />
          <div className="mt-1">
            <InfoNote>
              This must match the name shown on your super account. This may be
              your current name, or a previous name.
            </InfoNote>
          </div>
        </div>

        {/* SMSF bank account details heading */}
        <h2 className="text-[14px] font-bold text-gray-900">
          SMSF bank account details
        </h2>

        {/* Bank account name */}
        <InputField
          label="Bank account name"
          value={bankAccountName}
          onChange={onBankAccountNameChange}
        />

        {/* BSB code */}
        <SegmentedInput
          label="BSB code (please include all six numbers)"
          segments={[6]}
          values={bsb}
          onChange={onBsbChange}
        />

        {/* Account number */}
        <SegmentedInput
          label="Account number"
          segments={[9]}
          values={accountNumber}
          onChange={onAccountNumberChange}
        />

        {/* Required documentation */}
        <div>
          <h2 className="text-[14px] font-bold text-gray-900 mb-1">
            Required documentation
          </h2>
          <p className="text-[11px] text-gray-700 mb-2">
            You need to{" "}
            <strong>attach a document</strong> confirming the SMSF is an ATO
            regulated super fund. You can find a copy of the compliance status
            for your SMSF at <AtoLink href="superfundlookup.gov.au" />
          </p>
          <FormCheckbox
            label="I have provided evidence from the ATO this is a regulated SMSF"
            checked={hasSmsfEvidence}
            onChange={onHasSmsfEvidenceChange}
          />
        </div>

        {/* Declaration */}
        <div>
          <p className="text-[11px] text-gray-700 italic mb-3">
            I hereby declare that the information I have provided in relation to
            the nominated super fund is true and correct and I am authorised to
            provide the information requested
          </p>
          <SignatureBox
            signature={signature}
            onSignatureChange={onSignatureChange}
            dateValues={date}
            onDateChange={onDateChange}
            readOnly={readOnly}
          />
        </div>

        {/* End note */}
        <div className="border border-[#3d3d8f] rounded-sm p-3 bg-[#f0f4ff]">
          <InfoNote>
            If you have completed this section, this is the end of the form.
            Return this form to your employer as soon as possible.
          </InfoNote>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Page footer */}
        <PageFooter page={4} />
      </div>
    </div>
  );
};

export default SectionD;
