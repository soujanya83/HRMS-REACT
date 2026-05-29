import React from "react";
import FormHeader from "./FormHeader";
import AtoLink from "../../../components/common/AtoLink";
import {
  InputField,
  SegmentedInput,
  InfoNote,
  PageFooter,
} from "./SharedComponents";

import ato_black_logo from "../../../assets/ato_logo_black.png"


const ChoiceCard = ({
  label,
  sectionTag,
  description,
  color,
  bgColor,
  borderColor,
  selected,
  onSelect,
}) => (
  <button
    onClick={onSelect}
    className={`w-full text-left flex items-start gap-3 p-[10px] border transition-all duration-150 ${
      selected
        ? `${bgColor} ${borderColor} border-2`
        : `bg-[#f5f6ff] border-[#d0d4e8] hover:${bgColor} hover:${borderColor}`
    }`}
  >
    {/* Checkbox */}
    <div
      className={`mt-[2px] w-[13px] h-[13px] border-2 flex-shrink-0 flex items-center justify-center ${
        selected ? `${borderColor} bg-white` : "border-gray-400 bg-white"
      }`}
    >
      {selected && (
        <div className={`w-[7px] h-[7px] ${color}`} />
      )}
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <p className="text-[14px] font-semibold text-gray-900">{label}</p>
      <p className="text-[12px] text-gray-600 mt-[1px] leading-snug">
        {description}
      </p>
    </div>

    {/* Arrow + Section badge */}
    <div className="flex items-center gap-1 flex-shrink-0 mt-[1px]">
      <span className="text-gray-500 text-[14px]">→</span>
      <span
        className={`text-white text-[10px] font-bold px-[8px] py-[2px] ${color.replace("bg-", "bg-")}`}
        style={{
          backgroundColor:
            sectionTag === "B"
              ? "#7B2D8B"
              : sectionTag === "C"
              ? "#1B7A6E"
              : "#7B1E3A",
        }}
      >
        Section {sectionTag}
      </span>
    </div>
  </button>
);

const SectionA = ({
  selectedSection,
  onSelectSection,
  fullName,
  onFullNameChange,
  employeeNumber,
  onEmployeeNumberChange,
  tfn,
  onTfnChange,
}) => {
  return (
    <div className="w-[794px] min-h-[1123px] bg-white mx-auto shadow-lg flex flex-col">
      {/* Header */}
      <FormHeader />

      {/* Body */}
      <div className="px-8 pt-5 pb-6 flex-1 flex flex-col">
        {/* Intro text */}
        <div className="text-[12px] text-gray-700 leading-snug mb-3">
          <p>
            Use this form to choose the super fund your employer will pay your
            super into. Your choice of super fund is an important decision for
            your future.
          </p>
          <p className="mt-2">
            <strong>If you don't complete this form</strong>, your employer can
            pay your super into your existing fund identified by the ATO. If you
            don't have one, your employer can pay into a new account in their
            default super fund. You can find more information on{" "}
            <strong>page 5.</strong>
          </p>
        </div>

        {/* Two column layout */}
        <div className="flex gap-5 flex-1">
          {/* Left column */}
          <div className="w-[290px] flex-shrink-0 flex flex-col gap-4">
            {/* How to complete online box */}
            <div className=" bg-[#f0f4ff] rounded-sm">
              <div className="bg-[#3d3d8f] px-3 py-[5px]">
                <span className="text-white text-[11px] font-semibold">
                  How to complete online
                </span>
              </div>
              <div className="p-3">
                <p className="text-[#3d3d8f] text-[11px] font-bold mb-2">
                  Save time: use the online form
                </p>
                {/* myGov + ATO logos */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-2 py-1">
                    <span className="text-black text-[18px] font-black  leading-none">
                      my
                    </span>
                    <br />
                    <span className="text-black text-[18px]  font-black leading-none">
                      Gov
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={ato_black_logo} alt="ATO" className="w-48 h-auto" co />
                  </div>
                </div>
                <p className="text-[11px] text-gray-700 mb-2">
                  Use the online form in myGov to choose your super fund. Your
                  super account details will automatically be filled in for you.
                </p>
                <ol className="text-[11px] text-gray-700 space-y-1 list-none">
                  <li>
                    <strong>1</strong> Sign into <em>myGov</em> and select ATO
                    in your services
                  </li>
                  <li>
                    <strong>2</strong> In the menu select <em>Employment</em>,
                    and then <em>New employment</em>. You'll need your
                    employer's information on <strong>page 3</strong> to
                    complete this form.
                  </li>
                  <li>
                    <strong>3</strong> Select your preferred fund and give a
                    copy to your employer.
                  </li>
                </ol>
              </div>
            </div>

            {/* Information box */}
            <div className="rounded-sm bg-[#f0f4ff]">
              <div className="bg-[#3d3d8f] px-3 py-[5px]">
                <span className="text-white text-[11px] font-semibold">
                  Information
                </span>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-[#3d3d8f] text-[11px] font-bold mb-1">
                    For employees
                  </p>
                  <p className="text-[11px] text-gray-700">
                    Additional information about super is located at the end of
                    this form. You can also visit{" "}
                    <AtoLink href="ato.gov.au/individuals/super" />
                  </p>
                </div>
                <div>
                  <p className="text-[#3d3d8f] text-[11px] font-bold mb-1">
                    For employers
                  </p>
                  <p className="text-[11px] text-gray-700">
                    Use the form to offer employees their choice of super fund.
                    You must fill in the details of your nominated super fund,
                    also known as your default fund, on <strong>page 3</strong>{" "}
                    before giving the form to an employee.
                  </p>
                  <p className="text-[11px] text-gray-700 mt-1">
                    For more information on super, offering an employee a choice
                    of fund or paying super contributions, visit{" "}
                    <AtoLink href="ato.gov.au/employersuper" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Section A header */}
            <div className="bg-[#3d3d8f] px-4 py-[6px] flex items-center gap-3">
              <span className="text-white text-[13px] font-black">
                Section A
              </span>
              <span className="text-white text-[13px]">Your details</span>
            </div>

            {/* Full name */}
            <InputField
              label="Full name"
              value={fullName}
              onChange={onFullNameChange}
            />

            {/* Employee number */}
            <SegmentedInput
              label="Employee number (if known)"
              segments={[16]}
              values={employeeNumber}
              onChange={onEmployeeNumberChange}
            />

            {/* TFN */}
            <div>
              <SegmentedInput
                label="Tax file number (TFN)"
                segments={[3, 3, 3]}
                values={tfn}
                onChange={onTfnChange}
              />
              <div className="mt-1">
                <InfoNote>
                  You don't need to provide your TFN but if you don't, there
                  may be consequences such as your contributions being taxed at
                  a higher rate. See <strong>page 5</strong> for more
                  information.
                </InfoNote>
              </div>
            </div>

            {/* I choose for my super to be paid into */}
            <div>
              <p className="text-[13px] font-bold text-gray-900 mb-1">
                I choose for my super to be paid into
              </p>
              <p className="text-[11px] text-gray-600 mb-3">
                Select one of the options below and complete relevant section.
              </p>

              <div className="flex flex-col gap-[16px]">
                <ChoiceCard
                  label="My existing super fund"
                  sectionTag="B"
                  description="I want my employer to pay into a super account I have already opened."
                  color="bg-[#7B2D8B]"
                  bgColor="bg-purple-50"
                  borderColor="border-[#7B2D8B]"
                  selected={selectedSection === "B"}
                  onSelect={() => onSelectSection("B")}
                />
                <ChoiceCard
                  label="My employer's default super fund"
                  sectionTag="C"
                  description="I want my employer to open a new account for me in their default fund."
                  color="bg-[#1B7A6E]"
                  bgColor="bg-teal-50"
                  borderColor="border-[#1B7A6E]"
                  selected={selectedSection === "C"}
                  onSelect={() => onSelectSection("C")}
                />
                <ChoiceCard
                  label="My private self-managed super fund (SMSF)"
                  sectionTag="D"
                  description={
                    "I am a member and a trustee responsible for managing the fund.\nI may have up to 6 members in the fund."
                  }
                  color="bg-[#7B1E3A]"
                  bgColor="bg-rose-50"
                  borderColor="border-[#7B1E3A]"
                  selected={selectedSection === "D"}
                  onSelect={() => onSelectSection("D")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Page footer */}
        <PageFooter page={1} />
      </div>
    </div>
  );
};

export default SectionA;
