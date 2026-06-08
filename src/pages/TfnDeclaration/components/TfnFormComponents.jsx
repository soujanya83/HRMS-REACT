import React, { useRef, useCallback, useState } from "react";

import {

  SegmentedInput,

  SignatureBox,

  SignaturePad,

} from "../../Superannuation/components/SharedComponents";

import AtoLink from "../../../components/common/AtoLink";



export { AtoLink };



export { SegmentedInput, SignatureBox };



/** Signature Modal — used for both create and update */

export const SignatureModal = ({ isOpen, onClose, onSave, existingSignature = "" }) => {

  const [tempSignature, setTempSignature] = useState("");



  if (!isOpen) return null;



  const handleSave = () => {

    if (tempSignature) {

      onSave(tempSignature);

    }

    setTempSignature("");

    onClose();

  };



  const handleClose = () => {

    setTempSignature("");

    onClose();

  };



  return (

    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">

        {/* Modal Header */}

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">

          <h3 className="text-sm font-semibold text-gray-900">

            {existingSignature ? "Update Signature" : "Add Signature"}

          </h3>

          <button

            type="button"

            onClick={handleClose}

            className="text-gray-400 hover:text-gray-600 text-lg leading-none"

          >

            ×

          </button>

        </div>



        {/* Modal Body */}

        <div className="px-5 py-4">

          <p className="text-xs text-gray-500 mb-3">Draw your signature below:</p>

          <SignaturePad

            value={tempSignature}

            onChange={setTempSignature}

            height={120}

            className="[&_canvas]:border-gray-300 [&_canvas]:rounded"

          />

        </div>



        {/* Modal Footer */}

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200">

          <button

            type="button"

            onClick={handleClose}

            className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"

          >

            Cancel

          </button>

          <button

            type="button"

            onClick={handleSave}

            disabled={!tempSignature}

            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"

          >

            Save Signature

          </button>

        </div>

      </div>

    </div>

  );

};



/** Signature + date — TFN form page 5 layout */

export const TfnSignatureBox = ({

  signature = "",

  onSignatureChange,

  dateValues = [],

  onDateChange,

  readOnly = false,

}) => {

  const [showModal, setShowModal] = useState(false);



  const hasSignature = !!signature;

  const isUrl = hasSignature && signature.startsWith('http');

  const isBase64 = hasSignature && signature.startsWith('data:');



  const handleSignatureSave = (newSignature) => {

    onSignatureChange?.(newSignature);

  };



  return (

    <>

      <div className="flex gap-2 items-end">

        <div className="flex-[1.35] min-w-0">

          <p className="text-[9px] text-gray-700 mb-[2px] font-semibold">Signature *</p>

          <div className="relative border border-[#666] bg-white">

            {hasSignature ? (

              <img

                src={signature}

                alt="Signature"

                className="h-[64px] w-full object-contain"

              />

            ) : (

              <button

                type="button"

                onClick={() => setShowModal(true)}

                className="h-[64px] w-full flex items-center justify-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors cursor-pointer"

              >

                <span className="text-[14px]">✍️</span> Click to Sign Here

              </button>

            )}

          </div>



          {hasSignature && (

            <button

              type="button"

              onClick={() => setShowModal(true)}

              className="mt-1 px-3 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors"

            >

              ✏️ Update Signature

            </button>

          )}

        </div>



        <div className="flex-shrink-0 pb-[1px]">

          <TfnFormDateInput values={dateValues} onChange={onDateChange} readOnly={readOnly} />

        </div>

      </div>



      {/* Signature Modal */}

      <SignatureModal

        isOpen={showModal}

        onClose={() => setShowModal(false)}

        onSave={handleSignatureSave}

        existingSignature={signature}

      />

    </>

  );

};



// ─── A4 page wrapper ──────────────────────────────────────────────────────────

export const TfnPage = ({ children, className = "" }) => (

  <div

    className={`w-[794px] min-h-[1123px] bg-white mx-auto shadow-lg flex flex-col font-sans text-gray-900 ${className}`}

  >

    {children}

  </div>

);



// ─── Green top bar (page 1) ───────────────────────────────────────────────────

export const GreenTopBar = ({ text }) => (

  <div className="bg-[#33AD5B] px-6 py-[6px]">

    <span className="text-white text-[13px] font-semibold">{text}</span>

  </div>

);



// ─── Grey section bar ───────────────────────────────────────────────────────────

export const GreySectionBar = ({ title, subtitle }) => (

  <div className="bg-[#d9d9d9] border border-gray-400 px-3 py-[5px]">

    <span className="text-[13px] font-bold text-gray-900">{title}</span>

    {subtitle && (

      <span className="text-[13px] text-gray-800 ml-1">{subtitle}</span>

    )}

  </div>

);



// ─── Icon helpers ───────────────────────────────────────────────────────────────

export const RedMinusIcon = () => (

  <div className="w-[20px] h-[20px] rounded-full bg-[#E4002B] flex items-center justify-center flex-shrink-0 mt-[1px]">

    <div className="w-[9px] h-[2px] bg-white rounded-sm" />

  </div>

);



export const OrangeAlertIcon = () => (

  <div className="w-[20px] h-[20px] rounded-full bg-[#F9A01B] flex items-center justify-center flex-shrink-0 mt-[1px]">

    <span className="text-white text-[13px] font-bold leading-none">!</span>

  </div>

);



export const BlueArrowIcon = () => (

  <div className="w-[20px] h-[20px] rounded-full bg-[#009FDA] flex items-center justify-center flex-shrink-0 mt-[1px]">

    <span className="text-white text-[12px] font-bold leading-none">›</span>

  </div>

);



export const IconRow = ({ icon, children, className = "" }) => (

  <div className={`flex items-start gap-2.5 ${className}`}>

    {icon}

    <div className="text-[13px] text-gray-800 leading-snug flex-1">{children}</div>

  </div>

);



// ─── Bulleted list ────────────────────────────────────────────────────────────

export const TfnBulletList = ({ items, className = "" }) => (

  <ul className={`space-y-[4px] ${className}`}>

    {items.map((item, i) => (

      <li key={i} className="flex items-start gap-2 text-[13px] text-gray-800 leading-snug">

        <span className="w-[5px] h-[5px] bg-gray-600 mt-[6px] flex-shrink-0" />

        <span>{item}</span>

      </li>

    ))}

  </ul>

);



// ─── Instruction page footer ──────────────────────────────────────────────────

export const InstructionFooter = ({ page, leftText = "Tax file number declaration" }) => (

  <div className="mt-auto pt-4 border-t border-gray-400 flex justify-between items-center px-8 pb-6">

    <span className="text-[12px] text-gray-700">{leftText}</span>

    <span className="text-[12px] text-gray-700">{page}</span>

  </div>

);



// ─── Corner registration marks (PDF crop marks) ─────────────────────────────

export const FormCornerMark = ({ corner = "tr" }) => {

  const pos = {

    tr: "top-2 right-2 border-t-2 border-r-2",

    tl: "top-2 left-2 border-t-2 border-l-2",

    br: "bottom-2 right-2 border-b-2 border-r-2",

    bl: "bottom-2 left-2 border-b-2 border-l-2",

  };

  return (

    <span

      className={`absolute w-[14px] h-[14px] border-black pointer-events-none ${pos[corner]}`}

      aria-hidden

    />

  );

};



// ─── DD / MM / YYYY for form page 5 ──────────────────────────────────────────

export const TfnFormDateInput = ({

  label = "Date",

  values = [],

  onChange,

  className = "",

  readOnly = false,

}) => {

  const box = "w-[13px] h-[18px] border border-[#666] text-center text-[10px] font-mono bg-white focus:outline-none focus:border-[#009FDA]";

  const inputRefs = useRef([]);

  const totalLength = 8;



  const focusInput = useCallback((index) => {

    if (index < 0 || index >= totalLength) return;

    requestAnimationFrame(() => {

      inputRefs.current[index]?.focus();

      inputRefs.current[index]?.select();

    });

  }, []);



  const handleChange = (index, rawValue) => {

    if (!onChange) return;

    const cleaned = rawValue.replace(/\D/g, "");

    if (cleaned.length > 1) {

      cleaned.split("").forEach((char, i) => onChange(index + i, char));

      focusInput(Math.min(index + cleaned.length, totalLength - 1));

      return;

    }

    onChange(index, cleaned.slice(-1));

    if (cleaned && index < totalLength - 1) focusInput(index + 1);

  };



  const renderBoxes = (start, count) =>

    Array.from({ length: count }).map((_, i) => {

      const idx = start + i;

      return (

        <input

          key={idx}

          ref={(el) => {

            inputRefs.current[idx] = el;

          }}

          type="text"

          inputMode="numeric"

          maxLength={1}

          value={values[idx] ?? ""}

          onChange={(e) => handleChange(idx, e.target.value)}

          onFocus={(e) => e.target.select()}

          readOnly={readOnly}

          className={`${box} ${readOnly ? "bg-gray-100" : ""}`}

        />

      );

    });



  return (

    <div className={className}>

      {label !== "" && (

        <p className="text-[9px] font-semibold text-gray-800 mb-[2px]">{label}</p>

      )}

      <div className="flex items-end gap-[1px] text-[8px] text-gray-500">

        <div>

          <div className="mb-[1px]">Day</div>

          <div className="flex gap-[1px]">{renderBoxes(0, 2)}</div>

        </div>

        <span className="pb-[3px] mx-[1px]">/</span>

        <div>

          <div className="mb-[1px]">Month</div>

          <div className="flex gap-[1px]">{renderBoxes(2, 2)}</div>

        </div>

        <span className="pb-[3px] mx-[1px]">/</span>

        <div>

          <div className="mb-[1px]">Year</div>

          <div className="flex gap-[1px]">{renderBoxes(4, 4)}</div>

        </div>

      </div>

    </div>

  );

};



// ─── State/territory — 3 character boxes + dropdown (PDF style) ───────────────

const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];



const padStateChars = (value) => {

  const chars = String(value).toUpperCase().split("").slice(0, 3);

  while (chars.length < 3) chars.push("");

  return chars;

};



export const TfnStateSelect = ({

  value = "",

  onChange,

  className = "",

  boxClass = "w-[13px] h-[18px]",

}) => {

  const chars = padStateChars(value);

  const inputClass = `${boxClass} border border-[#666] text-center text-[10px] font-mono uppercase bg-white focus:outline-none focus:border-[#009FDA]`;



  const setChar = (idx, raw) => {

    const next = [...chars];

    next[idx] = raw.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);

    onChange?.(next.join(""));

  };



  return (

    <div className={className}>

      <label className="block text-[10px] font-semibold text-gray-800 mb-[2px]">

        State/territory

      </label>

      <div className="flex items-end gap-[1px]">

        {chars.map((char, idx) => (

          <input

            key={idx}

            type="text"

            maxLength={1}

            value={char}

            onChange={(e) => setChar(idx, e.target.value)}

            className={inputClass}

            aria-label={`State or territory character ${idx + 1}`}

          />

        ))}

        <div

          className={`relative ${boxClass} border border-[#666] bg-[#d6eaf5] flex items-center justify-center`}

        >

          <select

            value={AU_STATES.includes(value) ? value : ""}

            onChange={(e) => onChange?.(e.target.value)}

            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"

            aria-label="Select state or territory"

          >

            <option value=""> </option>

            {AU_STATES.map((s) => (

              <option key={s} value={s}>

                {s}

              </option>

            ))}

          </select>

          <span className="pointer-events-none text-[9px] leading-none text-gray-900" aria-hidden>

            ▼

          </span>

        </div>

      </div>

    </div>

  );

};



// ─── Section wrapper (grey bar + 2 columns) ───────────────────────────────────

export const TfnFormSection = ({ title, subtitle, left, right }) => (

  <div className="border border-[#555] mb-[6px]">

    <div className="bg-[#d9d9d9] border-b border-[#555] px-2 py-[3px] leading-tight">

      <span className="text-[11px] font-bold text-gray-900">{title}</span>

      {subtitle && (

        <span className="text-[11px] text-gray-900 ml-1">{subtitle}</span>

      )}

    </div>

    <div className="grid grid-cols-2 divide-x divide-[#555]">

      <div className="p-[6px] space-y-[5px]">{left}</div>

      <div className="p-[6px] space-y-[5px]">{right}</div>

    </div>

  </div>

);



export const TfnPenaltyBar = ({ children }) => (

  <div className="flex items-center gap-2 bg-[#ebebeb] border border-[#888] px-2 py-[4px]">

    <RedMinusIcon />

    <p className="text-[9px] text-gray-900 leading-snug flex-1">{children}</p>

  </div>

);



export const TfnSectionBridge = ({ children }) => (

  <div className="flex items-stretch border border-[#555] bg-white mb-[6px] min-h-[26px]">

    <div className="flex items-center gap-2 px-2 py-[3px] flex-1 border-r border-[#555]">

      <OrangeAlertIcon />

      <span className="text-[10px] text-gray-900 leading-snug">{children}</span>

    </div>

    <div className="w-[22px] bg-black flex-shrink-0" aria-hidden />

  </div>

);



export const TfnQ1InfoBox = ({ children }) => (

  <div className="border border-[#999] bg-[#f4f4f4] p-[5px] flex gap-1.5 flex-shrink-0 w-[108px]">

    <BlueArrowIcon />

    <p className="text-[8px] text-gray-900 leading-[1.25]">{children}</p>

  </div>

);



export const TfnDeclarationBlock = ({

  role,

  signature,

  onSignatureChange,

  dateValues,

  onDateChange,

  readOnly = false,

}) => (

  <div className="border border-[#666] bg-white p-[6px]">

    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">

      Declaration by {role}:

    </p>

    <p className="text-[9px] text-gray-900 mt-[2px] mb-[4px]">

      I declare that the information I have given is true and correct.

    </p>

    <TfnSignatureBox

      signature={signature}

      onSignatureChange={onSignatureChange}

      dateValues={dateValues}

      onDateChange={onDateChange}

      readOnly={readOnly}

    />

  </div>

);



export const TfnFormFooterActions = ({ onPrint, onReset, onSave }) => (

  <div className="relative px-4 pb-3 pt-2 border-t border-[#555]">

    <FormCornerMark corner="bl" />

    <FormCornerMark corner="br" />

    <div className="flex justify-center gap-2 my-2">

      {[

        { label: "Print form", onClick: onPrint },

        { label: "Save form", onClick: onSave, type: "submit" },

        { label: "Reset form", onClick: onReset },

      ].map(({ label, onClick, type }) => (

        <button

          key={label}

          type={type || "button"}

          onClick={onClick}

          className="px-5 py-[3px] text-[11px] font-semibold text-gray-900 border border-[#666] bg-gradient-to-b from-[#f5f5f5] to-[#d0d0d0] shadow-[1px_1px_0_#333] hover:from-[#fafafa] hover:to-[#ddd]"

          style={{ borderTopColor: "#fff", borderLeftColor: "#fff" }}

        >

          {label}

        </button>

      ))}

    </div>

    <div className="flex justify-between items-end">

      <span className="text-[10px] text-gray-700">NAT 3092-06.2019 [DE-6078]</span>

      <span className="text-[10px] font-bold text-gray-800">Sensitive (when completed)</span>

      <div className="text-center">

        <div

          className="h-[36px] w-[72px] border border-[#666] bg-white"

          style={{

            backgroundImage:

              "repeating-linear-gradient(90deg,#000 0 1px,transparent 1px 3px,#000 3px 4px,transparent 4px 5px)",

          }}

        />

        <span className="text-[9px] text-gray-800 tracking-widest">30920619</span>

      </div>

    </div>

  </div>

);



// ─── Compact segmented row (15/19 char rows for form page) ───────────────────

export const CompactSegmentedInput = ({

  label,

  segments,

  values = [],

  onChange,

  className = "",

  boxClass = "w-[13px] h-[18px]",

  groupSeparator = false,

  labelClassName = "block text-[10px] text-gray-800 mb-[2px] font-semibold",

}) => {

  const totalLength = segments.reduce((a, b) => a + b, 0);

  const inputRefs = useRef([]);



  const focusInput = useCallback(

    (index) => {

      if (index < 0 || index >= totalLength) return;

      requestAnimationFrame(() => {

        inputRefs.current[index]?.focus();

        inputRefs.current[index]?.select();

      });

    },

    [totalLength]

  );



  const handleChange = (index, rawValue) => {

    if (!onChange) return;

    const cleaned = rawValue.replace(/\s/g, "");

    if (cleaned.length > 1) {

      const chars = cleaned.split("").slice(0, totalLength - index);

      chars.forEach((char, i) => onChange(index + i, char.slice(-1)));

      focusInput(Math.min(index + chars.length, totalLength - 1));

      return;

    }

    const char = cleaned.slice(-1);

    onChange(index, char);

    if (char && index < totalLength - 1) focusInput(index + 1);

  };



  const handleKeyDown = (index, e) => {

    const current = values[index] ?? "";

    if (e.key === "Backspace") {

      if (!current && index > 0) {

        e.preventDefault();

        onChange?.(index - 1, "");

        focusInput(index - 1);

      } else if (current) {

        onChange?.(index, "");

      }

    }

    if (e.key === "ArrowLeft" && index > 0) {

      e.preventDefault();

      focusInput(index - 1);

    }

    if (e.key === "ArrowRight" && index < totalLength - 1) {

      e.preventDefault();

      focusInput(index + 1);

    }

  };



  return (

    <div className={className}>

      {label && <label className={labelClassName}>{label}</label>}

      <div className="flex items-center gap-[2px] flex-wrap">

        {segments.map((count, segIdx) => {

          const offset = segments.slice(0, segIdx).reduce((a, b) => a + b, 0);

          return (

            <React.Fragment key={segIdx}>

              {segIdx > 0 &&

                (groupSeparator ? (

                  <span className="text-[11px] text-gray-700 mx-[1px] font-bold">–</span>

                ) : (

                  <span className="w-[2px]" />

                ))}

              <div className="flex gap-[1px]">

                {Array.from({ length: count }).map((_, i) => {

                  const charIdx = offset + i;

                  return (

                    <input

                      key={charIdx}

                      ref={(el) => {

                        inputRefs.current[charIdx] = el;

                      }}

                      type="text"

                      maxLength={1}

                      value={values[charIdx] ?? ""}

                      onChange={(e) => handleChange(charIdx, e.target.value)}

                      onKeyDown={(e) => handleKeyDown(charIdx, e)}

                      onFocus={(e) => e.target.select()}

                      className={`${boxClass} border border-[#666] text-center text-[10px] font-mono  focus:outline-none focus:border-[#009FDA] bg-white text-gray-900`}

                    />

                  );

                })}

              </div>

            </React.Fragment>

          );

        })}

      </div>

    </div>

  );

};



// ─── Checkbox option (print X style) ─────────────────────────────────────────

export const TfnCheckOption = ({ label, checked, onChange, className = "" }) => (

  <label className={`flex items-start gap-[5px] cursor-pointer select-none ${className}`}>

    <div

      role="checkbox"

      aria-checked={checked}

      className="w-[12px] h-[12px] border border-[#333] flex items-center justify-center flex-shrink-0 mt-[1px] bg-white"

      onClick={(e) => {

        e.preventDefault();

        onChange?.(!checked);

      }}

    >

      {checked && (

        <span className="text-[11px] font-bold leading-none text-gray-900">X</span>

      )}

    </div>

    {label ? (

      <span className="text-[10px] text-gray-900 leading-[1.3]">{label}</span>

    ) : null}

  </label>

);



// ─── Radio-style single choice from options ───────────────────────────────────

export const TfnRadioGroup = ({ options, value, onChange, className = "" }) => (

  <div className={`flex flex-col gap-[4px] ${className}`}>

    {options.map((opt) => (

      <TfnCheckOption

        key={opt.value}

        label={opt.label}

        checked={value === opt.value}

        onChange={() => onChange(opt.value)}

      />

    ))}

  </div>

);



// ─── Question block wrapper ───────────────────────────────────────────────────

export const QuestionBlock = ({ number, title, children, className = "" }) => {

  const hasAsterisk = title.includes('*');

  const displayTitle = hasAsterisk ? title.replace('*', '') : title;



  return (

    <div className={`${className}`}>

      <p className="text-[10px] font-bold text-gray-900 mb-[4px] leading-[1.3]">

        {number != null && <span>Question {number}: </span>}

        {displayTitle}

        {hasAsterisk && <span className="text-red-600 ml-1">*</span>}

      </p>

      {children}

    </div>

  );

};

