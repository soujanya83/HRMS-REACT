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


const SectionB = ({
  fundName,
  onFundNameChange,
  fundAbn,
  onFundAbnChange,
  usi,
  onUsiChange,
  memberNumber,
  onMemberNumberChange,
  nameOnAccount,
  onNameOnAccountChange,
  hasComplianceLetter,
  onHasComplianceLetterChange,
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
        label="B"
        title="My existing super fund"
        color="purple"
      />

      <div className="px-8 pt-6 pb-6 flex-1 flex flex-col gap-4">
        {/* Super fund details heading */}
        <h2 className="text-[14px] font-bold text-gray-900">
          Super fund details
        </h2>

        {/* Info box */}
        <div className="border border-[#3d3d8f] rounded-sm p-3 bg-[#f0f4ff]">
          <InfoNote>
            You can find your super fund details by:
          </InfoNote>
          <ul className="text-[11px] text-gray-700 ml-6 mt-1 space-y-[2px] list-disc">
            <li>logging into your super fund member portal or online account</li>
            <li>contacting your super fund directly</li>
            <li>through ATO online services via myGov or the ATO app.</li>
          </ul>
        </div>

        {/* Super fund name */}
        <InputField
          label="Super fund name"
          value={fundName}
          onChange={onFundNameChange}
        />

        {/* ABN */}
        <SegmentedInput
          label="Super fund Australian business number (ABN)"
          segments={[2, 3, 3, 3]}
          values={fundAbn}
          onChange={onFundAbnChange}
        />

        {/* USI */}
        <div>
          <SegmentedInput
            label="Unique superannuation identifier (USI)"
            segments={[16]}
            values={usi}
            onChange={onUsiChange}
          />
          <div className="mt-1">
            <InfoNote>
              The USI is used to identify different super funds and specific
              super fund products. It is different to your member account
              number. You can find your USI on your super fund's website or by
              contacting your super fund directly.
            </InfoNote>
          </div>
        </div>

        {/* Member account number */}
        <div>
          <SegmentedInput
            label="Your member account number"
            segments={[16]}
            values={memberNumber}
            onChange={onMemberNumberChange}
          />
          <div className="mt-1">
            <InfoNote>
              You can find your member account number on your member account
              statement, by logging into your super fund account, contacting
              your super fund directly or through ATO online services via myGov
              or the ATO app.
            </InfoNote>
          </div>
        </div>

        {/* Your name as it appears */}
        <div>
          <InputField
            label="Your name as it appears on your account"
            value={nameOnAccount}
            onChange={onNameOnAccountChange}
          />
          <div className="mt-1">
            <InfoNote>
              This must match the name shown on your super account. This may be
              your current name, or a previous name.
            </InfoNote>
          </div>
        </div>

        {/* Required documentation */}
        <div>
          <h2 className="text-[14px] font-bold text-gray-900 mb-1">
            Required documentation
          </h2>
          <p className="text-[11px] text-gray-700 mb-2">
            You need to{" "}
            <strong>
              attach a letter of compliance of your chosen super fund
            </strong>{" "}
            to confirm it is a complying fund and can accept contributions from
            your employer.
          </p>
          <p className="text-[11px] text-gray-700 mb-3">
            For most super funds you can find their letter of compliance on
            their website. For other funds, you will need to contact them for
            this information.
          </p>
          <FormCheckbox
            label="I have attached a letter of compliance from my super fund"
            checked={hasComplianceLetter}
            onChange={onHasComplianceLetterChange}
          />
        </div>

        {/* Declaration */}
        <div>
          <h2 className="text-[14px] font-bold text-gray-900 mb-1">
            Declaration
          </h2>
          <p className="text-[11px] text-gray-600 italic mb-3">
            I hereby declare that the information I have provided in relation to
            the nominated super fund is true and correct and I am authorised to
            provide the information requested.
          </p>
          <SignatureBox
            signature={signature}
            onSignatureChange={onSignatureChange}
            dateValues={date}
            onDateChange={onDateChange}
            readOnly={readOnly}
          />
        </div>

        {/* Completion note */}
        <div className="border border-[#3d3d8f] rounded-sm p-3 bg-[#f0f4ff]">
          <InfoNote>
            If you have completed this section, this is the end of the form.
            Return this form to your employer as soon as possible.
          </InfoNote>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Page footer */}
        <PageFooter page={2} />
      </div>
    </div>
  );
};

export default SectionB;
