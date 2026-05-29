import React, { useState } from "react";
import TfnPage1Cover from "./components/TfnPage1Cover";
import TfnPage2Instructions from "./components/TfnPage2Instructions";
import TfnPage3Instructions from "./components/TfnPage3Instructions";
import TfnPage4MoreInfo from "./components/TfnPage4MoreInfo";
import TfnPage5Form, { initialFormState } from "./components/TfnPage5Form";
import TfnPage6PayerInfo from "./components/TfnPage6PayerInfo";

const TfnDeclarationPage = () => {
  const [form, setForm] = useState(initialFormState);

  return (
    <div className="min-h-screen bg-gray-200 py-10 px-4 print:bg-white print:py-0">
      <div className="flex flex-col items-center gap-6 print:gap-0">
        <TfnPage1Cover />
        <TfnPage2Instructions />
        <TfnPage3Instructions />
        <TfnPage4MoreInfo />
        <TfnPage5Form form={form} onUpdate={setForm} />
        <TfnPage6PayerInfo />
      </div>
    </div>
  );
};

export default TfnDeclarationPage;
