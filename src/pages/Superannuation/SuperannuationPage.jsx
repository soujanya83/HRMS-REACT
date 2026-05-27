import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionA from "./components/SectionA";
import SectionB from "./components/SectionB";
import SectionC from "./components/SectionC";
import SectionD from "./components/SectionD";

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
  const [selectedSection, setSelectedSection] = useState(null);

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

  const handleSelectSection = (section) => {
    setSelectedSection((prev) => (prev === section ? null : section));
  };

  const updateCharArray = (
    arr,
    index,
    value
  ) => {
    const next = [...arr];
    next[index] = value.slice(-1);
    return next;
  };

  return (
    <div className="min-h-screen bg-gray-200 py-10 px-4">
      <div className="flex flex-col items-center gap-0">
        {/* Page 1 - always visible */}
        <SectionA
          selectedSection={selectedSection}
          onSelectSection={handleSelectSection}
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

        {/* Dynamic section based on selection */}
        <AnimatePresence mode="wait">
          {selectedSection === "B" && (
            <motion.div
              key="section-b"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-6"
            >
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
              />
            </motion.div>
          )}
          {selectedSection === "C" && (
            <motion.div
              key="section-c"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-6"
            >
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
              />
            </motion.div>
          )}
          {selectedSection === "D" && (
            <motion.div
              key="section-d"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-6"
            >
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
                onEsaChange={(esa) =>
                  setSectionD((prev) => ({ ...prev, esa }))
                }
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
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint text when nothing is selected */}
        {!selectedSection && (
          <div className="mt-4 text-center text-gray-500 text-[12px]">
            Select a section above to continue filling out the form.
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperannuationPage;
