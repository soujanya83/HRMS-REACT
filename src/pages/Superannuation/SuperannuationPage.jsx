import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionA from "./components/SectionA";
import SectionB from "./components/SectionB";
import SectionC from "./components/SectionC";
import SectionD from "./components/SectionD";
import axiosClient from "../../axiosClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
};

const createCharArray = (length, initial = "") => {
  const chars = initial.split("").slice(0, length);
  while (chars.length < length) chars.push("");
  return chars;
};

const SuperannuationPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [formId, setFormId] = useState(null);

  const [sectionA, setSectionA] = useState({
    fullName: "",
    employeeNumber: createCharArray(16),
    tfn: createCharArray(9),
  });

  const [sectionB, setSectionB] = useState({
    fundName: "",
    fundAbn: createCharArray(11),
    usi: createCharArray(16),
    memberNumber: createCharArray(16),
    nameOnAccount: "",
    hasComplianceLetter: false,
    signature: "",
    date: createCharArray(8),
  });

  const [sectionC, setSectionC] = useState({
    businessName: "",
    employerAbn: createCharArray(11),
    superFundName: "",
    superFundAbn: createCharArray(11),
    usi: createCharArray(16),
    employeeChoosesDefaultFund: false,
    signature: "",
    date: createCharArray(8),
  });

  const [sectionD, setSectionD] = useState({
    smsfName: "",
    smsfAbn: createCharArray(11),
    esa: "",
    fullNameOnAccount: "",
    bankAccountName: "",
    bsb: createCharArray(6),
    accountNumber: createCharArray(9),
    hasSmsfEvidence: false,
    signature: "",
    date: createCharArray(8),
  });

  const [selectedChoice, setSelectedChoice] = useState(null);

  const handleSelectChoice = (choice) => {
    setSelectedChoice(choice);
  };

  const updateCharArray = (arr, index, value) => {
    const next = [...arr];
    next[index] = value.slice(-1);
    return next;
  };

  const joinCharArray = (arr) => arr.join("");

  const formatDate = (dateArray) => {
    const dateStr = dateArray.join("");
    if (dateStr.length === 8) {
      return `${dateStr.slice(4, 8)}-${dateStr.slice(2, 4)}-${dateStr.slice(0, 2)}`;
    }
    return dateStr;
  };

  const formatDateFromAPI = (dateString) => {
    if (!dateString) return createCharArray(8);
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return (day + month + year).split("");
  };

  const stringToCharArray = (str, length) => {
    const chars = str ? str.split("") : [];
    while (chars.length < length) chars.push("");
    return chars.slice(0, length);
  };

  // Fetch existing form data
  useEffect(() => {
    const fetchExistingData = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      let employeeId = queryParams.get("employeeId");

      if (!employeeId) {
        const employeeStr = localStorage.getItem("employee");
        const userStr = localStorage.getItem("user");

        if (employeeStr) {
          const employee = JSON.parse(employeeStr);
          employeeId = employee.id;
        } else if (userStr) {
          const user = JSON.parse(userStr);
          employeeId = user.id;
        }
      }

      if (employeeId) {
        try {
          const response = await axiosClient.get(
            `/superannuation-forms/employee/${employeeId}`,
          );
          if (response.data && response.data.id) {
            const data = response.data;
            setExistingData(data);
            setFormId(data.id);
            setSelectedChoice(
              data.super_choice_type === "existing_fund"
                ? "B"
                : data.super_choice_type === "default_fund"
                  ? "C"
                  : "D",
            );

            // Populate Section A
            setSectionA({
              fullName: data.Employee_name || "",
              employeeNumber: stringToCharArray(data.Employee_number || "", 16),
              tfn: stringToCharArray(data.Tax_file_number || "", 9),
            });

            // Populate Section B
            setSectionB({
              fundName: data.b_super_fund_name || "",
              fundAbn: stringToCharArray(data.b_super_fund_abn || "", 11),
              usi: stringToCharArray(data.b_usi || "", 16),
              memberNumber: stringToCharArray(
                data.b_member_account_number || "",
                16,
              ),
              nameOnAccount: data.b_account_name || "",
              hasComplianceLetter:
                data.b_letter_of_compliance_attached || false,
              signature: data.signature_url || "",
              date: formatDateFromAPI(data.declaration_date),
            });

            // Populate Section C
            setSectionC({
              businessName: data.c_business_name || "",
              employerAbn: stringToCharArray(data.c_business_abn || "", 11),
              superFundName: data.c_super_fund_name || "",
              superFundAbn: stringToCharArray(data.c_super_fund_abn || "", 11),
              usi: stringToCharArray(data.c_usi || "", 16),
              employeeChoosesDefaultFund:
                data.c_choose_default_fund_checkbox || false,
              signature: data.signature_url || "",
              date: formatDateFromAPI(data.declaration_date),
            });

            // Populate Section D
            setSectionD({
              smsfName: data.d_smsf_name || "",
              smsfAbn: stringToCharArray(data.d_smsf_abn || "", 11),
              esa: data.d_smsf_esa || "",
              fullNameOnAccount: data.d_account_name || "",
              bankAccountName: data.d_bank_account_name || "",
              bsb: stringToCharArray(data.d_bsb_code || "", 6),
              accountNumber: stringToCharArray(data.d_account_number || "", 9),
              hasSmsfEvidence: data.d_provided_evidence_ato || false,
              signature: data.signature_url || "",
              date: formatDateFromAPI(data.declaration_date),
            });
          }
        } catch (error) {
          console.log("No existing superannuation form found");
        }
      }
    };

    fetchExistingData();
  }, []);

  const handleSubmit = async () => {
    // Validate required fields
    if (!sectionA.fullName.trim()) {
      toast.error("Employee name is required");
      return;
    }

    const employeeNumber = joinCharArray(sectionA.employeeNumber);
    if (!employeeNumber.trim()) {
      toast.error("Employee number is required");
      return;
    }

    const tfn = joinCharArray(sectionA.tfn);
    if (!tfn.trim()) {
      toast.error("Tax file number is required");
      return;
    }

    if (!selectedChoice) {
      toast.error("Please select a super choice type");
      return;
    }

    // Get employee and organization data from localStorage
    const queryParams = new URLSearchParams(window.location.search);
    let employeeId = queryParams.get("employeeId");
    let organizationId = null;

    const employeeStr = localStorage.getItem("employee");
    const userStr = localStorage.getItem("user");

    if (employeeStr) {
      const employee = JSON.parse(employeeStr);
      if (!employeeId) employeeId = employee.id;
      organizationId = employee.organization_id;
    } else if (userStr) {
      const user = JSON.parse(userStr);
      if (!employeeId) employeeId = user.id;
      organizationId = user.organization_id;
    }

    if (!employeeId || !organizationId) {
      toast.error("Employee or organization information not found");
      return;
    }

    // Validate section-specific fields based on selected choice
    if (selectedChoice === "B") {
      if (!sectionB.fundName.trim()) {
        toast.error("Super fund name is required");
        return;
      }
      const fundAbn = joinCharArray(sectionB.fundAbn);
      if (!fundAbn.trim()) {
        toast.error("Super fund ABN is required");
        return;
      }
      const usi = joinCharArray(sectionB.usi);
      if (!usi.trim()) {
        toast.error("USI is required");
        return;
      }
      const memberNumber = joinCharArray(sectionB.memberNumber);
      if (!memberNumber.trim()) {
        toast.error("Member account number is required");
        return;
      }
      if (!sectionB.nameOnAccount.trim()) {
        toast.error("Account name is required");
        return;
      }
      if (!sectionB.hasComplianceLetter) {
        toast.error("Letter of compliance attachment is required");
        return;
      }
      if (!sectionB.signature) {
        toast.error("Signature is required");
        return;
      }
      const dateStr = joinCharArray(sectionB.date);
      if (dateStr.length !== 8) {
        toast.error("Declaration date is required");
        return;
      }
    } else if (selectedChoice === "C") {
      if (!sectionC.businessName.trim()) {
        toast.error("Business name is required");
        return;
      }
      const employerAbn = joinCharArray(sectionC.employerAbn);
      if (!employerAbn.trim()) {
        toast.error("Employer ABN is required");
        return;
      }
      if (!sectionC.superFundName.trim()) {
        toast.error("Super fund name is required");
        return;
      }
      const superFundAbn = joinCharArray(sectionC.superFundAbn);
      if (!superFundAbn.trim()) {
        toast.error("Super fund ABN is required");
        return;
      }
      const usi = joinCharArray(sectionC.usi);
      if (!usi.trim()) {
        toast.error("USI is required");
        return;
      }
      if (!sectionC.signature) {
        toast.error("Signature is required");
        return;
      }
      const dateStr = joinCharArray(sectionC.date);
      if (dateStr.length !== 8) {
        toast.error("Declaration date is required");
        return;
      }
    } else if (selectedChoice === "D") {
      if (!sectionD.smsfName.trim()) {
        toast.error("SMSF name is required");
        return;
      }
      const smsfAbn = joinCharArray(sectionD.smsfAbn);
      if (!smsfAbn.trim()) {
        toast.error("SMSF ABN is required");
        return;
      }
      if (!sectionD.esa.trim()) {
        toast.error("SMSF electronic service address is required");
        return;
      }
      if (!sectionD.fullNameOnAccount.trim()) {
        toast.error("Account name is required");
        return;
      }
      if (!sectionD.bankAccountName.trim()) {
        toast.error("Bank account name is required");
        return;
      }
      const bsb = joinCharArray(sectionD.bsb);
      if (!bsb.trim()) {
        toast.error("BSB code is required");
        return;
      }
      const accountNumber = joinCharArray(sectionD.accountNumber);
      if (!accountNumber.trim()) {
        toast.error("Account number is required");
        return;
      }
      if (!sectionD.hasSmsfEvidence) {
        toast.error("ATO evidence is required");
        return;
      }
      if (!sectionD.signature) {
        toast.error("Signature is required");
        return;
      }
      const dateStr = joinCharArray(sectionD.date);
      if (dateStr.length !== 8) {
        toast.error("Declaration date is required");
        return;
      }
    }

    // Map super_choice_type based on selected choice
    const superChoiceTypeMap = {
      B: "existing_fund",
      C: "default_fund",
      D: "smsf",
    };
    const super_choice_type = superChoiceTypeMap[selectedChoice];

    // Build payload with all sections
    const payload = {
      employee_id: employeeId,
      organization_id: organizationId,
      Employee_name: sectionA.fullName,
      Employee_number: joinCharArray(sectionA.employeeNumber),
      Tax_file_number: joinCharArray(sectionA.tfn),
      super_choice_type: super_choice_type,

      // Section B fields (existing_fund)
      b_super_fund_name: sectionB.fundName,
      b_super_fund_abn: joinCharArray(sectionB.fundAbn),
      b_usi: joinCharArray(sectionB.usi),
      b_member_account_number: joinCharArray(sectionB.memberNumber),
      b_account_name: sectionB.nameOnAccount,
      b_letter_of_compliance_attached: sectionB.hasComplianceLetter,

      // Section C fields (default_fund)
      c_business_name: sectionC.businessName,
      c_business_abn: joinCharArray(sectionC.employerAbn),
      c_super_fund_name: sectionC.superFundName,
      c_super_fund_abn: joinCharArray(sectionC.superFundAbn),
      c_usi: joinCharArray(sectionC.usi),
      c_choose_default_fund_checkbox: sectionC.employeeChoosesDefaultFund,

      // Section D fields (smsf)
      d_smsf_name: sectionD.smsfName,
      d_smsf_abn: joinCharArray(sectionD.smsfAbn),
      d_smsf_esa: sectionD.esa,
      d_account_name: sectionD.fullNameOnAccount,
      d_bank_account_name: sectionD.bankAccountName,
      d_bsb_code: joinCharArray(sectionD.bsb),
      d_account_number: joinCharArray(sectionD.accountNumber),
      d_provided_evidence_ato: sectionD.hasSmsfEvidence,

      // Global fields - use signature and date from selected choice section
      signature_base64:
        selectedChoice === "B"
          ? sectionB.signature
          : selectedChoice === "C"
            ? sectionC.signature
            : sectionD.signature,
      declaration_date:
        selectedChoice === "B"
          ? formatDate(sectionB.date)
          : selectedChoice === "C"
            ? formatDate(sectionC.date)
            : formatDate(sectionD.date),
    };

    setSubmitting(true);
    try {
      let response;
      if (formId) {
        // Update existing form
        response = await axiosClient.put(
          `/superannuation-forms/${formId}`,
          payload,
        );
        if (response.data?.success || response.status === 200) {
          toast.success("Superannuation form updated successfully!");
        } else {
          toast.error(response.data?.message || "Failed to update form");
        }
      } else {
        // Create new form
        response = await axiosClient.post("/superannuation-forms", payload);
        if (response.data?.success || response.status === 200) {
          toast.success("Superannuation form created successfully!");
          setFormId(response.data.id);
          setExistingData(response.data);
        } else {
          toast.error(response.data?.message || "Failed to create form");
        }
      }
    } catch (error) {
      console.error("Error submitting superannuation form:", error);
      toast.error(error.response?.data?.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 py-10 px-4">
      <div className="flex flex-col items-center gap-6">
        {/* Page 1 - Section A */}
        <SectionA
          selectedSection={selectedChoice}
          onSelectSection={handleSelectChoice}
          fullName={sectionA.fullName}
          onFullNameChange={(fullName) =>
            setSectionA((prev) => ({ ...prev, fullName }))
          }
          employeeNumber={sectionA.employeeNumber}
          onEmployeeNumberChange={(idx, val) =>
            setSectionA((prev) => ({
              ...prev,
              employeeNumber: updateCharArray(prev.employeeNumber, idx, val),
            }))
          }
          tfn={sectionA.tfn}
          onTfnChange={(idx, val) =>
            setSectionA((prev) => ({
              ...prev,
              tfn: updateCharArray(prev.tfn, idx, val),
            }))
          }
        />

        {/* Show section based on selected choice */}
        {selectedChoice === "B" && (
          <SectionB
            fundName={sectionB.fundName}
            onFundNameChange={(fundName) =>
              setSectionB((prev) => ({ ...prev, fundName }))
            }
            fundAbn={sectionB.fundAbn}
            onFundAbnChange={(idx, val) =>
              setSectionB((prev) => ({
                ...prev,
                fundAbn: updateCharArray(prev.fundAbn, idx, val),
              }))
            }
            usi={sectionB.usi}
            onUsiChange={(idx, val) =>
              setSectionB((prev) => ({
                ...prev,
                usi: updateCharArray(prev.usi, idx, val),
              }))
            }
            memberNumber={sectionB.memberNumber}
            onMemberNumberChange={(idx, val) =>
              setSectionB((prev) => ({
                ...prev,
                memberNumber: updateCharArray(prev.memberNumber, idx, val),
              }))
            }
            nameOnAccount={sectionB.nameOnAccount}
            onNameOnAccountChange={(nameOnAccount) =>
              setSectionB((prev) => ({ ...prev, nameOnAccount }))
            }
            hasComplianceLetter={sectionB.hasComplianceLetter}
            onHasComplianceLetterChange={(hasComplianceLetter) =>
              setSectionB((prev) => ({ ...prev, hasComplianceLetter }))
            }
            signature={sectionB.signature}
            onSignatureChange={(signature) =>
              setSectionB((prev) => ({ ...prev, signature }))
            }
            date={sectionB.date}
            onDateChange={(idx, val) =>
              setSectionB((prev) => ({
                ...prev,
                date: updateCharArray(prev.date, idx, val),
              }))
            }
            readOnly={!!formId}
          />
        )}
        {selectedChoice === "C" && (
          <SectionC
            businessName={sectionC.businessName}
            onBusinessNameChange={(businessName) =>
              setSectionC((prev) => ({ ...prev, businessName }))
            }
            employerAbn={sectionC.employerAbn}
            onEmployerAbnChange={(idx, val) =>
              setSectionC((prev) => ({
                ...prev,
                employerAbn: updateCharArray(prev.employerAbn, idx, val),
              }))
            }
            superFundName={sectionC.superFundName}
            onSuperFundNameChange={(superFundName) =>
              setSectionC((prev) => ({ ...prev, superFundName }))
            }
            superFundAbn={sectionC.superFundAbn}
            onSuperFundAbnChange={(idx, val) =>
              setSectionC((prev) => ({
                ...prev,
                superFundAbn: updateCharArray(prev.superFundAbn, idx, val),
              }))
            }
            usi={sectionC.usi}
            onUsiChange={(idx, val) =>
              setSectionC((prev) => ({
                ...prev,
                usi: updateCharArray(prev.usi, idx, val),
              }))
            }
            employeeChoosesDefaultFund={sectionC.employeeChoosesDefaultFund}
            onEmployeeChoosesDefaultFundChange={(employeeChoosesDefaultFund) =>
              setSectionC((prev) => ({ ...prev, employeeChoosesDefaultFund }))
            }
            signature={sectionC.signature}
            onSignatureChange={(signature) =>
              setSectionC((prev) => ({ ...prev, signature }))
            }
            date={sectionC.date}
            onDateChange={(idx, val) =>
              setSectionC((prev) => ({
                ...prev,
                date: updateCharArray(prev.date, idx, val),
              }))
            }
            readOnly={!!formId}
          />
        )}
        {selectedChoice === "D" && (
          <SectionD
            smsfName={sectionD.smsfName}
            onSmsfNameChange={(smsfName) =>
              setSectionD((prev) => ({ ...prev, smsfName }))
            }
            smsfAbn={sectionD.smsfAbn}
            onSmsfAbnChange={(idx, val) =>
              setSectionD((prev) => ({
                ...prev,
                smsfAbn: updateCharArray(prev.smsfAbn, idx, val),
              }))
            }
            esa={sectionD.esa}
            onEsaChange={(esa) => setSectionD((prev) => ({ ...prev, esa }))}
            fullNameOnAccount={sectionD.fullNameOnAccount}
            onFullNameOnAccountChange={(fullNameOnAccount) =>
              setSectionD((prev) => ({ ...prev, fullNameOnAccount }))
            }
            bankAccountName={sectionD.bankAccountName}
            onBankAccountNameChange={(bankAccountName) =>
              setSectionD((prev) => ({ ...prev, bankAccountName }))
            }
            bsb={sectionD.bsb}
            onBsbChange={(idx, val) =>
              setSectionD((prev) => ({
                ...prev,
                bsb: updateCharArray(prev.bsb, idx, val),
              }))
            }
            accountNumber={sectionD.accountNumber}
            onAccountNumberChange={(idx, val) =>
              setSectionD((prev) => ({
                ...prev,
                accountNumber: updateCharArray(prev.accountNumber, idx, val),
              }))
            }
            hasSmsfEvidence={sectionD.hasSmsfEvidence}
            onHasSmsfEvidenceChange={(hasSmsfEvidence) =>
              setSectionD((prev) => ({ ...prev, hasSmsfEvidence }))
            }
            signature={sectionD.signature}
            onSignatureChange={(signature) =>
              setSectionD((prev) => ({ ...prev, signature }))
            }
            date={sectionD.date}
            onDateChange={(idx, val) =>
              setSectionD((prev) => ({
                ...prev,
                date: updateCharArray(prev.date, idx, val),
              }))
            }
            readOnly={!!formId}
          />
        )}

        {/* Hint text when nothing is selected */}
        {!selectedChoice && (
          <div className="mt-4 text-center text-gray-500 text-[12px]">
            Select a super choice type above to continue filling out the form.
          </div>
        )}

        {/* Submit button */}
        {selectedChoice && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Form"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperannuationPage;
