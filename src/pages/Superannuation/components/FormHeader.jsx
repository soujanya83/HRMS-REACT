import React from "react";
import ato_white_logo from "../../../assets/ato_logo_white.svg"
const FormHeader = () => {
  return (
    <div className="bg-[#3d3d8f] w-full">
      {/* Top bar */}
      <div className="bg-[#2d2d7a] text-right px-6 py-1">
        <span className="text-white text-[11px] font-bold italic">
          For employers and employees
        </span>
      </div>

      {/* Logo + Title area */}
      <div className="px-8 pt-5 pb-6">
        {/* Government logo row */}
        <div className="flex items-center gap-3 mb-4">
          <img src={ato_white_logo} alt="ATO" className="w-48 h-auto" />
        </div>

        {/* Main title */}
        <h1 className="text-white text-[34px] font-black leading-tight tracking-tight">
          Superannuation
          <br />
          standard choice form
        </h1>
      </div>
    </div>
  );
};

export default FormHeader;
