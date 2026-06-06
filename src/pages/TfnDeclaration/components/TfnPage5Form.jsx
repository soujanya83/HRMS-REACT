import React from "react";
import atoBlackLogo from "../../../assets/ato_logo_black.png";
import {
  TfnPage,
  CompactSegmentedInput,
  TfnCheckOption,
  TfnRadioGroup,
  QuestionBlock,
  AtoLink,
  TfnFormSection,
  TfnPenaltyBar,
  TfnSectionBridge,
  TfnQ1InfoBox,
  TfnDeclarationBlock,
  TfnFormFooterActions,
  TfnStateSelect,
  TfnFormDateInput,
  FormCornerMark,
  BlueArrowIcon,
  OrangeAlertIcon,
} from "./TfnFormComponents";

const BOX = "w-[13px] h-[18px]";
const EMAIL_BOX = "w-[10px] h-[18px]";
/** ATO NAT 3092 — long name/address rows */
const ROW_LONG = 19;
/** Shorter rows (given names, suburb, contact) */
const ROW_SHORT = 15;
const EMAIL_LEN = 19;

const TfnPage5Form = ({ form, onUpdate, errors = {}, onSave, declarationId = null }) => {
  const a = form.sectionA;
  const b = form.sectionB;

  const setA = (key, value) =>
    onUpdate({ ...form, sectionA: { ...a, [key]: value } });
  const setB = (key, value) =>
    onUpdate({ ...form, sectionB: { ...b, [key]: value } });

  const setAChars = (key, idx, val) => {
    const arr = [...a[key]];
    arr[idx] = val.slice(-1);
    setA(key, arr);
  };

  const setBChars = (key, idx, val) => {
    const arr = [...b[key]];
    arr[idx] = val.slice(-1);
    setB(key, arr);
  };

  const stateCode = a.state.join("").trim();
  const setStateCode = (code) => {
    const chars = createCharArray(3, code);
    setA("state", chars);
  };

  const payerStateCode = b.state.join("").trim();
  const setPayerStateCode = (code) => {
    setB("state", createCharArray(3, code));
  };

  const sectionALeft = (
    <>
      <QuestionBlock number="1" title="What is your tax file number (TFN)? *">
        <div className="flex gap-1.5 items-start mb-1">
          <CompactSegmentedInput
            segments={[3, 3, 3]}
            values={a.tfn}
            onChange={(idx, val) => setAChars("tfn", idx, val)}
            boxClass={BOX}
            groupSeparator
          />
          <TfnQ1InfoBox>
            For more information, see question 1 on page 2 of the instructions.
          </TfnQ1InfoBox>
        </div>
        {errors.tfn_number && <p className="text-red-500 text-xs mt-1">{errors.tfn_number}</p>}
        <div className="space-y-[3px]">
          <TfnCheckOption
            label="OR I have made a separate application/enquiry to the ATO for a new or existing TFN."
            checked={a.tfnApplied}
            onChange={(v) => setA("tfnApplied", v)}
          />
          <TfnCheckOption
            label="OR I am claiming an exemption because I am under 18 years of age and do not earn enough to pay tax."
            checked={a.tfnUnder18}
            onChange={(v) => setA("tfnUnder18", v)}
          />
          <TfnCheckOption
            label="OR I am claiming an exemption because I am in receipt of a pension, benefit or allowance."
            checked={a.tfnPensioner}
            onChange={(v) => setA("tfnPensioner", v)}
          />
        </div>
      </QuestionBlock>

      <QuestionBlock number="2" title="What is your name? *">
        <div className="flex gap-4 mb-1.5 flex-wrap">
          {["Mr", "Mrs", "Miss", "Ms"].map((t) => (
            <TfnCheckOption
              key={t}
              label={t}
              checked={a.title === t}
              onChange={() => setA("title", a.title === t ? "" : t)}
              className="!items-center"
            />
          ))}
        </div>
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        <CompactSegmentedInput
          label="Surname or family name"
          segments={[ROW_LONG]}
          values={a.surname}
          onChange={(idx, val) => setAChars("surname", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname}</p>}
        <CompactSegmentedInput
          segments={[ROW_LONG]}
          values={a.surnameLine2}
          onChange={(idx, val) => setAChars("surnameLine2", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        <CompactSegmentedInput
          label="First given name"
          segments={[ROW_SHORT]}
          values={a.firstName}
          onChange={(idx, val) => setAChars("firstName", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
        <CompactSegmentedInput
          label="Other given names"
          segments={[ROW_SHORT]}
          values={a.otherNames}
          onChange={(idx, val) => setAChars("otherNames", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        {errors.other_names && <p className="text-red-500 text-xs mt-1">{errors.other_names}</p>}
        <CompactSegmentedInput
          segments={[ROW_SHORT]}
          values={a.otherNamesLine2}
          onChange={(idx, val) => setAChars("otherNamesLine2", idx, val)}
          boxClass={BOX}
        />
      </QuestionBlock>

      <QuestionBlock number="3" title="What is your home address in Australia? *">
        <CompactSegmentedInput
          segments={[ROW_LONG]}
          values={a.addressLine1}
          onChange={(idx, val) => setAChars("addressLine1", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        <CompactSegmentedInput
          segments={[ROW_LONG]}
          values={a.addressLine2}
          onChange={(idx, val) => setAChars("addressLine2", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        <CompactSegmentedInput
          label="Suburb/town/locality"
          segments={[ROW_SHORT]}
          values={a.suburb}
          onChange={(idx, val) => setAChars("suburb", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        <div className="flex gap-4 items-end">
          <TfnStateSelect value={stateCode} onChange={setStateCode} boxClass={BOX} />
          <CompactSegmentedInput
            label="Postcode"
            segments={[4]}
            values={a.postcode}
            onChange={(idx, val) => setAChars("postcode", idx, val)}
            boxClass={BOX}
          />
        </div>
      </QuestionBlock>

      <QuestionBlock
        number="4"
        title="If you have changed your name since you last dealt with the ATO, provide your previous family name."
      >
        <CompactSegmentedInput
          segments={[ROW_LONG]}
          values={a.previousName}
          onChange={(idx, val) => setAChars("previousName", idx, val)}
          boxClass={BOX}
        />
      </QuestionBlock>
    </>
  );

  const sectionARight = (
    <>
      <QuestionBlock number="5" title="What is your primary e-mail address?">
        <CompactSegmentedInput
          segments={[EMAIL_LEN]}
          values={a.emailLine1}
          onChange={(idx, val) => setAChars("emailLine1", idx, val)}
          boxClass={EMAIL_BOX}
          className="mb-[3px]"
        />
        <CompactSegmentedInput
          segments={[EMAIL_LEN]}
          values={a.emailLine2}
          onChange={(idx, val) => setAChars("emailLine2", idx, val)}
          boxClass={EMAIL_BOX}
        />
      </QuestionBlock>

      <QuestionBlock number="6" title="What is your date of birth? *">
        <TfnFormDateInput
          label=""
          values={a.dob}
          onChange={(idx, val) =>
            setAChars("dob", idx, val.replace(/\D/g, "").slice(-1))
          }
        />
        {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
      </QuestionBlock>

      <QuestionBlock number="7" title="On what basis are you paid? (select only one) *">
        <TfnRadioGroup
          value={a.paymentBasis}
          onChange={(v) => setA("paymentBasis", v)}
          options={[
            { value: "full_time", label: "Full-time employment" },
            { value: "part_time", label: "Part-time employment" },
            { value: "labour_hire", label: "Labour hire" },
            {
              value: "superannuation",
              label: "Superannuation or annuity income stream",
            },
            { value: "casual", label: "Casual employment" },
          ]}
        />
        {errors.employment_basis && <p className="text-red-500 text-xs mt-1">{errors.employment_basis}</p>}
      </QuestionBlock>

      <QuestionBlock number="8" title="Are you: (select only one) *">
        <TfnRadioGroup
          value={a.residency}
          onChange={(v) => setA("residency", v)}
          options={[
            { value: "resident", label: "An Australian resident for tax purposes" },
            { value: "foreign", label: "A foreign resident for tax purposes" },
            { value: "whm", label: "A working holiday maker" },
          ]}
        />
        {errors.residency_status && <p className="text-red-500 text-xs mt-1">{errors.residency_status}</p>}
      </QuestionBlock>

      <QuestionBlock
        number="9"
        title="Do you want to claim the tax-free threshold from this payer? *"
      >
        <p className="text-[9px] text-gray-900 mb-1 leading-[1.3]">
          Only claim the tax-free threshold from one payer at a time, unless your
          total income from all sources for the financial year will be less than
          the tax-free threshold.
        </p>
        <div className="flex gap-5 mb-[2px]">
          <TfnCheckOption
            label="Yes"
            checked={a.taxFreeThreshold === "yes"}
            onChange={() => setA("taxFreeThreshold", "yes")}
          />
          <TfnCheckOption
            label="No"
            checked={a.taxFreeThreshold === "no"}
            onChange={() => setA("taxFreeThreshold", "no")}
          />
        </div>
        {errors.claim_tax_free_threshold && <p className="text-red-500 text-xs mt-1">{errors.claim_tax_free_threshold}</p>}
        <p className="text-[8px] text-gray-800 leading-[1.3]">
          Answer no here if you are a foreign resident or working holiday maker,
          except if you are a foreign resident in receipt of an Australian
          Government pension and allowance.
        </p>
      </QuestionBlock>

      <QuestionBlock
        number="10"
        title="Do you have a Higher Education Loan Program (HELP), VET Student Loan (VSL), Financial Supplement (FS), Student Start-up Loan (SSL) or Trade Support Loan (TSL) debt? *"
      >
        <div className="flex gap-5 mb-[2px]">
          <TfnCheckOption
            label="Yes"
            checked={a.studentLoan === "yes"}
            onChange={() => setA("studentLoan", "yes")}
          />
          <TfnCheckOption
            label="No"
            checked={a.studentLoan === "no"}
            onChange={() => setA("studentLoan", "no")}
          />
        </div>
        {errors.has_help_debt && <p className="text-red-500 text-xs mt-1">{errors.has_help_debt}</p>}
        <p className="text-[8px] text-gray-800 leading-[1.3]">
          Your payer will withhold additional amounts to cover any compulsory
          repayment that may be raised on your notice of assessment.
        </p>
      </QuestionBlock>

      <TfnDeclarationBlock
        role="payee"
        signature={a.signature}
        onSignatureChange={(v) => setA("signature", v)}
        dateValues={a.signatureDate}
        onDateChange={(idx, val) =>
          setAChars("signatureDate", idx, val.replace(/\D/g, "").slice(-1))
        }
        readOnly={!!declarationId}
      />
      {errors.payee_signature_base64 && <p className="text-red-500 text-xs mt-1">{errors.payee_signature_base64}</p>}
      {errors.payee_declaration_date && <p className="text-red-500 text-xs mt-1">{errors.payee_declaration_date}</p>}

      <TfnPenaltyBar>
        There are penalties for deliberately making a false or misleading statement.
      </TfnPenaltyBar>
    </>
  );

  const sectionBLeft = (
    <>
      <QuestionBlock
        number="1"
        title="What is your Australian business number (ABN) or withholding payer number? *"
      >
        <CompactSegmentedInput
          segments={[2, 3, 3, 3]}
          values={b.abn}
          onChange={(idx, val) => setBChars("abn", idx, val)}
          boxClass={BOX}
          groupSeparator
        />
        {errors.payer_abn && <p className="text-red-500 text-xs mt-1">{errors.payer_abn}</p>}
        <CompactSegmentedInput
          label="Branch number (if applicable)"
          segments={[3]}
          values={b.branchNumber}
          onChange={(idx, val) => setBChars("branchNumber", idx, val)}
          boxClass={BOX}
          className="mt-[3px]"
        />
        {errors.payer_branch_number && <p className="text-red-500 text-xs mt-1">{errors.payer_branch_number}</p>}
      </QuestionBlock>

      <QuestionBlock
        number="2"
        title="If you don't have an ABN or withholding payer number, have you applied for one?"
      >
        <div className="flex gap-5">
          <TfnCheckOption
            label="Yes"
            checked={b.abnApplied === "yes"}
            onChange={() => setB("abnApplied", "yes")}
          />
          <TfnCheckOption
            label="No"
            checked={b.abnApplied === "no"}
            onChange={() => setB("abnApplied", "no")}
          />
        </div>
      </QuestionBlock>

      <QuestionBlock number="3" title="What is your legal name or registered business name? *">
        <CompactSegmentedInput
          segments={[ROW_LONG]}
          values={b.legalName1}
          onChange={(idx, val) => setBChars("legalName1", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        {errors.payer_legal_name && <p className="text-red-500 text-xs mt-1">{errors.payer_legal_name}</p>}
        <CompactSegmentedInput
          segments={[ROW_LONG]}
          values={b.legalName2}
          onChange={(idx, val) => setBChars("legalName2", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        <CompactSegmentedInput
          segments={[ROW_LONG]}
          values={b.legalName3}
          onChange={(idx, val) => setBChars("legalName3", idx, val)}
          boxClass={BOX}
        />
      </QuestionBlock>

      <QuestionBlock number="4" title="What is your business address in Australia?">
        <CompactSegmentedInput
          segments={[ROW_LONG]}
          values={b.addressLine1}
          onChange={(idx, val) => setBChars("addressLine1", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        <CompactSegmentedInput
          segments={[ROW_LONG]}
          values={b.addressLine2}
          onChange={(idx, val) => setBChars("addressLine2", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        <CompactSegmentedInput
          label="Suburb/town/locality"
          segments={[ROW_SHORT]}
          values={b.suburb}
          onChange={(idx, val) => setBChars("suburb", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        <div className="flex gap-4 items-end">
          <TfnStateSelect value={payerStateCode} onChange={setPayerStateCode} boxClass={BOX} />
          <CompactSegmentedInput
            label="Postcode"
            segments={[4]}
            values={b.postcode}
            onChange={(idx, val) => setBChars("postcode", idx, val)}
            boxClass={BOX}
          />
        </div>
      </QuestionBlock>
    </>
  );

  const sectionBRight = (
    <>
      <QuestionBlock number="5" title="What is your primary e-mail address?">
        <CompactSegmentedInput
          segments={[EMAIL_LEN]}
          values={b.emailLine1}
          onChange={(idx, val) => setBChars("emailLine1", idx, val)}
          boxClass={EMAIL_BOX}
          className="mb-[3px]"
        />
        <CompactSegmentedInput
          segments={[EMAIL_LEN]}
          values={b.emailLine2}
          onChange={(idx, val) => setBChars("emailLine2", idx, val)}
          boxClass={EMAIL_BOX}
        />
      </QuestionBlock>

      <QuestionBlock number="6" title="Who is your contact person regarding this form? *">
        <CompactSegmentedInput
          label="Contact person"
          segments={[ROW_SHORT]}
          values={b.contactName}
          onChange={(idx, val) => setBChars("contactName", idx, val)}
          boxClass={BOX}
          className="mb-[3px]"
        />
        {errors.payer_contact_person && <p className="text-red-500 text-xs mt-1">{errors.payer_contact_person}</p>}
        <CompactSegmentedInput
          label="Business phone number"
          segments={[2, 4, 4]}
          values={b.phone}
          onChange={(idx, val) => setBChars("phone", idx, val.replace(/\D/g, "").slice(-1))}
          boxClass={BOX}
          groupSeparator
        />
        {errors.payer_phone && <p className="text-red-500 text-xs mt-1">{errors.payer_phone}</p>}
      </QuestionBlock>

      <QuestionBlock
        number="7"
        title="If you no longer make payments to this payee, print X in this box."
      >
        <TfnCheckOption
          label=""
          checked={b.ceasingPayments}
          onChange={(v) => setB("ceasingPayments", v)}
        />
      </QuestionBlock>

      <TfnDeclarationBlock
        role="payer"
        signature={b.signature}
        onSignatureChange={(v) => setB("signature", v)}
        dateValues={b.signatureDate}
        onDateChange={(idx, val) =>
          setBChars("signatureDate", idx, val.replace(/\D/g, "").slice(-1))
        }
        readOnly={!!declarationId}
      />
      {errors.payer_signature_base64 && <p className="text-red-500 text-xs mt-1">{errors.payer_signature_base64}</p>}
      {errors.payer_declaration_date && <p className="text-red-500 text-xs mt-1">{errors.payer_declaration_date}</p>}

      <TfnPenaltyBar>
        There are penalties for deliberately making a false or misleading statement.
      </TfnPenaltyBar>

      <div className="grid grid-cols-2 gap-1">
        <div className="border border-[#666] bg-[#f8f8f8] p-[5px] flex gap-1">
          <BlueArrowIcon />
          <p className="text-[8px] text-gray-900 leading-[1.3]">
            Return the completed original ATO copy to:
            <br />
            Australian Taxation Office
            <br />
            PO Box 9004
            <br />
            PENRITH NSW 2740
          </p>
        </div>
        <div className="border border-[#666] bg-[#f8f8f8] p-[5px] flex gap-1">
          <OrangeAlertIcon />
          <p className="text-[8px] text-gray-900 leading-[1.3]">
            <strong>IMPORTANT</strong>
            <br />
            See next page for: payer obligations, lodging online.
          </p>
        </div>
      </div>
    </>
  );

  return (
    <TfnPage className="relative text-gray-900 overflow-hidden">
      {/* ── ato.gov.au on top border (NAT 3092) ── */}
      <div className="relative border-t border-[#333]">
        <FormCornerMark corner="tl" />
        <div className="px-4 py-[3px] border-b-2 border-[#333] pl-5">
          <AtoLink
            href="ato.gov.au"
            className="text-gray-900 font-bold text-[10px] hover:text-[#009FDA]"
          >
            ato.gov.au
          </AtoLink>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="relative px-4 pt-3 pb-2 border-b-2 border-[#333]">
        <FormCornerMark corner="tr" />
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <img src={atoBlackLogo} alt="Australian Taxation Office" className="h-[42px] w-auto" />
          </div>
          <div className="flex-1 pt-1 min-w-0">
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight tracking-tight">
              Tax file number declaration
            </h1>
            <p className="text-[10px] font-bold text-gray-900 mt-[3px] leading-snug">
              This declaration is NOT an application for a tax file number.
            </p>
            <ul className="mt-2 space-y-[2px]">
              <li className="flex items-start gap-2 text-[10px] text-gray-900 leading-snug">
                <span
                  className="w-[5px] h-[5px] bg-[#888] mt-[4px] flex-shrink-0"
                  aria-hidden
                />
                <span>
                  Use a black or blue pen and print clearly in BLOCK LETTERS.
                </span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-gray-900 leading-snug">
                <span
                  className="w-[5px] h-[5px] bg-[#888] mt-[4px] flex-shrink-0"
                  aria-hidden
                />
                <span>
                  Print <strong>X</strong> in the appropriate boxes.
                </span>
              </li>
              <li className="flex items-start gap-2 text-[10px] text-gray-900 leading-snug">
                <span
                  className="w-[5px] h-[5px] bg-[#888] mt-[4px] flex-shrink-0"
                  aria-hidden
                />
                <span>
                  Read all the instructions including the privacy statement before
                  you complete this declaration.
                </span>
              </li>
            </ul>
          </div>
        </div>
       
      </div>

      <div className="px-3 py-2 flex-1">
        <TfnFormSection
          title="Section A:"
          subtitle="To be completed by the PAYEE"
          left={sectionALeft}
          right={sectionARight}
        />

        <TfnSectionBridge>
          Once section A is completed and signed, give it to your payer to complete
          section B.
        </TfnSectionBridge>

        <TfnFormSection
          title="Section B:"
          subtitle="To be completed by the PAYER (if you are not lodging online)"
          left={sectionBLeft}
          right={sectionBRight}
        />
      </div>

      <TfnFormFooterActions
        onPrint={() => window.print()}
        onReset={() => onUpdate(initialFormState())}
        onSave={onSave}
      />
    </TfnPage>
  );
};

export const createCharArray = (length, initial = "") => {
  const chars = String(initial).split("").slice(0, length);
  while (chars.length < length) chars.push("");
  return chars;
};

export const initialFormState = () => ({
  sectionA: {
    tfn: createCharArray(9),
    tfnApplied: false,
    tfnUnder18: false,
    tfnPensioner: false,
    title: "",
    surname: createCharArray(ROW_LONG),
    surnameLine2: createCharArray(ROW_LONG),
    firstName: createCharArray(ROW_SHORT),
    otherNames: createCharArray(ROW_SHORT),
    otherNamesLine2: createCharArray(ROW_SHORT),
    addressLine1: createCharArray(ROW_LONG),
    addressLine2: createCharArray(ROW_LONG),
    suburb: createCharArray(ROW_SHORT),
    state: createCharArray(3),
    postcode: createCharArray(4),
    previousName: createCharArray(ROW_LONG),
    emailLine1: createCharArray(EMAIL_LEN),
    emailLine2: createCharArray(EMAIL_LEN),
    dob: createCharArray(8),
    paymentBasis: "",
    residency: "",
    taxFreeThreshold: "",
    studentLoan: "",
    signature: "",
    signatureDate: createCharArray(8),
  },
  sectionB: {
    abn: createCharArray(11),
    branchNumber: createCharArray(3),
    abnApplied: "",
    legalName1: createCharArray(ROW_LONG),
    legalName2: createCharArray(ROW_LONG),
    legalName3: createCharArray(ROW_LONG),
    addressLine1: createCharArray(ROW_LONG),
    addressLine2: createCharArray(ROW_LONG),
    suburb: createCharArray(ROW_SHORT),
    state: createCharArray(3),
    postcode: createCharArray(4),
    emailLine1: createCharArray(EMAIL_LEN),
    emailLine2: createCharArray(EMAIL_LEN),
    contactName: createCharArray(ROW_SHORT),
    phone: createCharArray(10),
    ceasingPayments: false,
    signature: "",
    signatureDate: createCharArray(8),
  },
});

export default TfnPage5Form;
