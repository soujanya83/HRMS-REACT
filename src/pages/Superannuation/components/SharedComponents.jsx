import React, { useRef, useCallback, useEffect } from "react";

// ─── Section Header ───────────────────────────────────────────────────────────

export const SectionHeader = ({
  label,
  title,
  color = "purple",
}) => {
  const colorMap = {
    purple: "bg-[#7B2D8B]",
    teal: "bg-[#1B7A6E]",
    navy: "bg-[#1e3a5f]",
    maroon: "bg-[#7B1E3A]",
  };

  return (
    <div className={`${colorMap[color]} px-5 py-[7px] flex items-center gap-3`}>
      <span className="text-white text-[13px] font-black">Section {label}</span>
      <span className="text-white text-[13px] font-normal">{title}</span>
    </div>
  );
};

// ─── Info Box ─────────────────────────────────────────────────────────────────

export const InfoBox = ({
  children,
  className = "",
  borderColor = "border-[#3d3d8f]",
}) => (
  <div
    className={`border ${borderColor} rounded-sm p-3 bg-[#f0f4ff] text-[11px] text-gray-700 ${className}`}
  >
    {children}
  </div>
);

// ─── Input Field ──────────────────────────────────────────────────────────────

export const InputField = ({
  label,
  value = "",
  onChange,
  className = "",
  readOnly = false,
}) => (
  <div className={`${className}`}>
    <label className="block text-[11px] text-gray-700 mb-[3px]">{label}</label>
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full border border-gray-400 px-2 py-1 text-[12px] text-gray-900 focus:outline-none focus:border-[#3d3d8f] h-[26px] ${readOnly ? "bg-gray-50" : "bg-white"}`}
    />
  </div>
);

// ─── Segmented Input (auto-advance between boxes) ─────────────────────────────

export const SegmentedInput = ({
  label,
  segments,
  values = [],
  onChange,
  className = "",
  readOnly = false,
}) => {
  const totalLength = segments.reduce((a, b) => a + b, 0);
  const inputRefs = useRef([]);

  const focusInput = useCallback(
    (index) => {
      if (readOnly || index < 0 || index >= totalLength) return;
      requestAnimationFrame(() => {
        inputRefs.current[index]?.focus();
        inputRefs.current[index]?.select();
      });
    },
    [readOnly, totalLength]
  );

  const handleChange = (index, rawValue) => {
    if (readOnly || !onChange) return;

    const cleaned = rawValue.replace(/\s/g, "");

    if (cleaned.length > 1) {
      const chars = cleaned.split("").slice(0, totalLength - index);
      chars.forEach((char, i) => {
        onChange(index + i, char.slice(-1));
      });
      focusInput(Math.min(index + chars.length, totalLength - 1));
      return;
    }

    const char = cleaned.slice(-1);
    onChange(index, char);
    if (char && index < totalLength - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (
    index,
    e
  ) => {
    if (readOnly) return;

    const current = values[index] ?? "";

    if (e.key === "Backspace") {
      if (!current && index > 0) {
        e.preventDefault();
        onChange?.(index - 1, "");
        focusInput(index - 1);
      } else if (current) {
        onChange?.(index, "");
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (e.key === "ArrowRight" && index < totalLength - 1) {
      e.preventDefault();
      focusInput(index + 1);
      return;
    }

    if (e.key === "Delete") {
      onChange?.(index, "");
    }
  };

  const setRef = (index) => (el) => {
    inputRefs.current[index] = el;
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-[11px] text-gray-700 mb-[3px]">
          {label}
        </label>
      )}
      <div className="flex items-center gap-[4px]">
        {segments.map((count, segIdx) => {
          const offset = segments.slice(0, segIdx).reduce((a, b) => a + b, 0);
          return (
            <React.Fragment key={segIdx}>
              {segIdx > 0 && (
                <span className="text-gray-500 text-[11px] mx-[1px]" />
              )}
              <div className="flex gap-[1px]">
                {Array.from({ length: count }).map((_, i) => {
                  const charIdx = offset + i;
                  return (
                    <input
                      key={charIdx}
                      ref={setRef(charIdx)}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={values[charIdx] ?? ""}
                      readOnly={readOnly}
                      onChange={(e) => handleChange(charIdx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(charIdx, e)}
                      onFocus={(e) => e.target.select()}
                      className={`w-[18px] h-[22px] border border-gray-400 text-center text-[11px] font-mono text-gray-900 focus:outline-none focus:border-[#3d3d8f] ${readOnly ? "bg-gray-50" : "bg-white"}`}
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

// ─── Date Input (DD / MM / YYYY) with auto-advance ───────────────────────────

export const DateInput = ({
  label,
  className = "",
  values = [],
  onChange,
  readOnly = false,
}) => (
  <SegmentedInput
    label={label}
    className={className}
    segments={[2, 2, 4]}
    values={values}
    onChange={onChange}
    readOnly={readOnly}
  />
);

// Custom layout wrapper to show Day/Month/Year labels like the PDF
export const DateInputLabeled = ({
  label,
  className = "",
  values = [],
  onChange,
  readOnly = false,
}) => {
  const totalLength = 8;
  const inputRefs = useRef([]);

  const focusInput = useCallback(
    (index) => {
      if (readOnly || index < 0 || index >= totalLength) return;
      requestAnimationFrame(() => {
        inputRefs.current[index]?.focus();
        inputRefs.current[index]?.select();
      });
    },
    [readOnly]
  );

  const handleChange = (index, rawValue) => {
    if (readOnly || !onChange) return;
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

  const handleKeyDown = (
    index,
    e
  ) => {
    if (readOnly) return;
    const current = values[index] ?? "";
    if (e.key === "Backspace") {
      if (!current && index > 0) {
        e.preventDefault();
        onChange?.(index - 1, "");
        focusInput(index - 1);
      } else if (current) {
        onChange?.(index, "");
      }
      return;
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

  const renderBoxes = (startIdx, count) =>
    Array.from({ length: count }).map((_, i) => {
      const idx = startIdx + i;
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
          readOnly={readOnly}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          className={`w-[18px] h-[22px] border border-gray-400 text-center text-[11px] font-mono text-gray-900 focus:outline-none focus:border-[#3d3d8f] ${readOnly ? "bg-gray-50" : "bg-white"}`}
        />
      );
    });

  return (
    <div className={className}>
      {label && (
        <label className="block text-[11px] text-gray-700 mb-[3px]">{label}</label>
      )}
      <div className="flex items-center gap-[2px] text-[10px] text-gray-500">
        <div>
          <div className="text-[9px] text-gray-500 mb-[1px]">Day</div>
          <div className="flex gap-[1px]">{renderBoxes(0, 2)}</div>
        </div>
        <span className="text-gray-500 mt-3 mx-[2px]">/</span>
        <div>
          <div className="text-[9px] text-gray-500 mb-[1px]">Month</div>
          <div className="flex gap-[1px]">{renderBoxes(2, 2)}</div>
        </div>
        <span className="text-gray-500 mt-3 mx-[2px]">/</span>
        <div>
          <div className="text-[9px] text-gray-500 mb-[1px]">Year</div>
          <div className="flex gap-[1px]">{renderBoxes(4, 4)}</div>
        </div>
      </div>
    </div>
  );
};

// ─── Signature Pad (mouse / touch drawing) ─────────────────────────────────────

export const SignaturePad = ({
  value = "",
  onChange,
  className = "",
  height = 70,
}) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);

  const getCoords = (
    e
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0] ?? e.changedTouches[0];
      if (!touch) return null;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawLine = (from, to) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onChange) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const startDraw = (
    e
  ) => {
    e.preventDefault();
    const point = getCoords(e);
    if (!point) return;
    isDrawing.current = true;
    lastPoint.current = point;
  };

  const draw = (
    e
  ) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const point = getCoords(e);
    if (!point || !lastPoint.current) return;
    drawLine(lastPoint.current, point);
    lastPoint.current = point;
  };

  const endDraw = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      lastPoint.current = null;
      saveSignature();
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    onChange?.("");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (value) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, rect.width, rect.height);
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = value;
      }
    };

    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full border border-gray-400 bg-white cursor-crosshair touch-none block"
        style={{ height }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <button
        type="button"
        onClick={clear}
        className="absolute top-1 right-1 text-[9px] text-gray-500 hover:text-gray-800 bg-white/90 px-1 py-[1px] border border-gray-300 rounded"
      >
        Clear
      </button>
    </div>
  );
};

// ─── Signature Box ────────────────────────────────────────────────────────────

export const SignatureBox = ({
  label = "Signature",
  className = "",
  withDate = true,
  signature = "",
  onSignatureChange,
  dateValues = [],
  onDateChange,
  readOnly = false,
}) => (
  <div className={`flex items-end gap-4 ${className}`}>
    <div className="flex-1">
      <label className="block text-[11px] text-gray-700 mb-[3px]">
        {label}
      </label>
      {readOnly && signature && signature.startsWith('http') ? (
        <img
          src={signature}
          alt="Signature"
          className="h-[70px] border border-gray-300 bg-white"
        />
      ) : (
        <SignaturePad
          value={signature}
          onChange={onSignatureChange}
          height={70}
        />
      )}
    </div>
    {withDate && (
      <DateInputLabeled
        label="Date"
        values={dateValues}
        onChange={onDateChange}
        readOnly={readOnly}
      />
    )}
  </div>
);

// ─── Form Checkbox ────────────────────────────────────────────────────────────

export const FormCheckbox = ({
  label,
  checked = false,
  onChange,
  className = "",
}) => (
  <div className={`flex items-start gap-2 ${className}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      className="mt-[2px] w-[13px] h-[13px] border border-gray-400 cursor-pointer flex-shrink-0"
    />
    <span className="text-[11px] text-gray-700">{label}</span>
  </div>
);

// ─── Info Note (blue i icon) ──────────────────────────────────────────────────

export const InfoNote = ({
  children,
  className = "",
}) => (
  <div className={`flex items-start gap-2 ${className}`}>
    <div className="flex-shrink-0 w-[14px] h-[14px] rounded-full bg-[#3d3d8f] flex items-center justify-center mt-[1px]">
      <span className="text-white text-[9px] font-bold leading-none">i</span>
    </div>
    <p className="text-[10.5px] text-gray-700 leading-snug">{children}</p>
  </div>
);

// ─── Page Footer ──────────────────────────────────────────────────────────────

export const PageFooter = ({ page }) => (
  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
    <span className="text-[10px] text-gray-500">NAT 13080-03.2023</span>
    <span className="text-[11px] text-gray-800">
      <strong>OFFICIAL: Sensitive</strong>{" "}
      <span className="font-normal">(when completed)</span>
    </span>
    <span className="text-[10px] text-gray-500">Page {page}</span>
  </div>
);
