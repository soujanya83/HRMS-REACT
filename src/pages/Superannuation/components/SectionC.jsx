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

const SectionC = ({
  businessName,
  onBusinessNameChange,
  employerAbn,
  onEmployerAbnChange,
  superFundName,
  onSuperFundNameChange,
  superFundAbn,
  onSuperFundAbnChange,
  usi,
  onUsiChange,
  employeeChoosesDefaultFund,
  onEmployeeChoosesDefaultFundChange,
  signature,
  onSignatureChange,
  date,
  onDateChange,
}) => {
  return (
    <div className="w-[794px] min-h-[1123px] bg-white mx-auto shadow-lg flex flex-col">
      <SectionHeader
        label="C"
        title="My employer's default super fund"
        color="teal"
      />

      <div className="px-8 pt-6 pb-6 flex-1 flex flex-col gap-5">
        <div>
          <div className="bg-[#1e3a5f] px-4 py-[6px] mb-0">
            <span className="text-white text-[12px] font-black">Employer</span>
            <span className="text-white text-[12px] font-normal">
              {" "}
              to complete
            </span>
          </div>
          <div className="bg-[#dce8f5] p-4 flex flex-col gap-4">
            <div className="border border-[#3d3d8f] rounded-sm p-3 bg-white">
              <InfoNote>
                Employers must complete this section before providing the form
                to an employee.
              </InfoNote>
            </div>

            <InputField
              label="Business name"
              value={businessName}
              onChange={onBusinessNameChange}
            />

            <SegmentedInput
              label="Australian business number (ABN)"
              segments={[2, 3, 3, 3]}
              values={employerAbn}
              onChange={onEmployerAbnChange}
            />

            <InputField
              label="Super fund name"
              value={superFundName}
              onChange={onSuperFundNameChange}
            />

            <SegmentedInput
              label="Super fund Australian business number (ABN)"
              segments={[2, 3, 3, 3]}
              values={superFundAbn}
              onChange={onSuperFundAbnChange}
            />

            <SegmentedInput
              label="Unique superannuation identifier (USI)"
              segments={[16]}
              values={usi}
              onChange={onUsiChange}
            />
          </div>
        </div>

        <div>
          <div className="bg-[#1e3a5f] px-4 py-[6px] mb-0">
            <span className="text-white text-[12px] font-black">Employee</span>
            <span className="text-white text-[12px] font-normal">
              {" "}
              to complete
            </span>
          </div>
          <div className="bg-[#dce8f5] p-4 flex flex-col gap-4">
            <div className="border border-[#3d3d8f] rounded-sm p-3 bg-white">
              <InfoNote>
                Make sure the employer default super fund details above have
                been completed by your employer before you use this form. Ask
                your employer if it hasn't been done.
              </InfoNote>
            </div>

            <FormCheckbox
              label="I choose for my employer to open a new account for me with their default super fund"
              checked={employeeChoosesDefaultFund}
              onChange={onEmployeeChoosesDefaultFundChange}
            />

            <SignatureBox
              signature={signature}
              onSignatureChange={onSignatureChange}
              dateValues={date}
              onDateChange={onDateChange}
            />
          </div>
        </div>

        <div className="border border-[#3d3d8f] rounded-sm p-3 bg-[#f0f4ff]">
          <InfoNote>
            If you have completed this section, this is the end of the form.
            Return this form to your employer as soon as possible.
          </InfoNote>
        </div>

        <div>
          <div className="bg-[#1e3a5f] px-4 py-[6px]">
            <span className="text-white text-[12px] font-normal">
              Information for{" "}
            </span>
            <span className="text-white text-[12px] font-black">Employers</span>
          </div>
          <div className="bg-[#dce8f5] p-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[12px] font-bold text-[#1B7A6E] mb-1">
                  If an employee doesn't return this form
                </p>
                <p className="text-[11px] text-gray-700 mb-2">
                  If your employee starts work on or after 1 November 2021,
                  most employers must request the employee's stapled super fund
                  details before making a super contribution.
                </p>
                <p className="text-[11px] text-gray-700 mb-2">
                  If an employee doesn't provide you with the correct details,
                  or the fund can't accept your contributions, you will need to
                  request their stapled super fund details from the ATO.
                </p>
                <p className="text-[11px] text-gray-700">
                  If the ATO advises the employee does not have a stapled super
                  fund, you can make the payment to your nominated default super
                  fund. For more information, visit{" "}
                  <strong>ato.gov.au/stapledsuperfund</strong>
                </p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#1B7A6E] mb-1">
                  Setting up and paying super for your business
                </p>
                <p className="text-[11px] text-gray-700 mb-3">
                  For more information on your super choice obligations,
                  including when you need to offer choice and setting up a
                  default super fund, visit{" "}
                  <strong>ato.gov.au/employersuper</strong>
                </p>
                <p className="text-[12px] font-bold text-[#1B7A6E] mb-1">
                  Help for employers
                </p>
                <p className="text-[11px] text-gray-700">
                  Phone <strong>13 10 20</strong> between 8am and 6pm, Monday
                  to Friday, to speak to a tax officer about employer super
                  obligations.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <PageFooter page={3} />
      </div>
    </div>
  );
};

export default SectionC;
