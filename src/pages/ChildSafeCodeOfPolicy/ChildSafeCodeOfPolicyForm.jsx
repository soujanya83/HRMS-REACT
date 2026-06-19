import React, { useEffect, useState } from "react";
import axiosClient from "../../axiosClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPrint, FaSave, FaSpinner } from "react-icons/fa";
import { SignatureModal } from "../TfnDeclaration/components/TfnFormComponents";

import page1 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0001.jpg";
import page2 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0002.jpg";
import page3 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0003.jpg";
import page4 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0004.jpg";
import page5 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0005.jpg";
import page6 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0006.jpg";
import page7 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0007.jpg";
import page8 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0008.jpg";
import page9 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0009.jpg";
import page10 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0010.jpg";
import page11 from "../../assets/child_safe_code_of_policy/Child Safe Code of Conduct Policy_page-0011.jpg";

const policyPages = [
  page1,
  page2,
  page3,
  page4,
  page5,
  page6,
  page7,
  page8,
  page9,
  page10,
  page11,
];

const fieldInputClass =
  "h-[22px] border-0 border-b border-black bg-white/80 px-2 text-[14px] leading-none outline-none focus:bg-blue-50/90 print:bg-transparent";
const errorInputClass = "border-red-500 bg-red-50/80";

const formatDateForInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const PolicyImagePage = ({ src, pageNumber }) => (
  <section className="w-full max-w-[794px] overflow-hidden bg-white shadow-lg print:h-auto print:max-w-none print:break-after-page print:shadow-none">
    <img
      src={src}
      alt={`Child Safe Code of Conduct Policy page ${pageNumber}`}
      className="block h-auto w-full select-none print:w-full"
      draggable="false"
    />
  </section>
);

const PageTenSignatureField = ({ signature, onOpenSignature }) => (
  <div className="w-full">
    <div className="relative h-[42px] w-full border border-gray-500 bg-white/90 print:border-0 print:bg-transparent">
      {signature ? (
        <>
          <img
            src={signature}
            alt="Signature"
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            onClick={onOpenSignature}
            className="absolute right-2 top-2 rounded border border-blue-200 bg-white/95 px-2 py-0.5 text-[10px] font-medium text-blue-600 shadow-sm hover:bg-blue-50 print:hidden"
          >
            Update Signature
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onOpenSignature}
          className="flex h-full w-full items-center justify-center text-[12px] font-medium text-blue-600 hover:bg-blue-50/80 print:hidden"
        >
          Click to Sign Here
        </button>
      )}
    </div>
  </div>
);

const PolicyAgreementPage = ({
  name,
  signature,
  date,
  onNameChange,
  onDateChange,
  onOpenSignature,
  errors,
}) => (
  <section className="relative w-full max-w-[794px] overflow-hidden bg-white shadow-lg print:h-auto print:max-w-none print:break-after-page print:shadow-none">
    <img
      src={page10}
      alt="Child Safe Code of Conduct Policy page 10"
      className="block h-auto w-full select-none print:w-full"
      draggable="false"
    />

    <div className="absolute left-[17.2%] top-[80.45%] w-[56%]">
      <input
        type="text"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        className={`${fieldInputClass} w-full ${
          errors.name ? errorInputClass : ""
        }`}
        aria-label="Name"
      />
    </div>

    <div className="absolute left-[20.6%] top-[84.55%] w-[40%]">
      <PageTenSignatureField
        signature={signature}
        onOpenSignature={onOpenSignature}
      />
      {errors.signature && (
        <p className="mt-1 text-[10px] leading-none text-red-600 print:hidden">
          {errors.signature}
        </p>
      )}
    </div>

    <div className="absolute left-[20.6%] top-[87.85%] w-[28%]">
      <input
        type="date"
        value={date}
        onChange={(event) => onDateChange(event.target.value)}
        className={`${fieldInputClass} w-full ${
          errors.date ? errorInputClass : ""
        }`}
        aria-label="Date"
      />
    </div>
  </section>
);

const ChildSafeCodeOfPolicyForm = () => {
  const [agreementData, setAgreementData] = useState({
    name: "",
    signature: "",
    date: "",
  });
  const [errors, setErrors] = useState({});
  const [recordId, setRecordId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const updateAgreementField = (field, value) => {
    setAgreementData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const queryEmployeeId = queryParams.get("employeeId");
    const storedEmployee = localStorage.getItem("employee");
    const storedUser = localStorage.getItem("user");

    if (storedEmployee) {
      const employee = JSON.parse(storedEmployee);
      setEmployeeId(queryEmployeeId || employee.id);
      if (employee.organization_id) setOrganizationId(employee.organization_id);
      return;
    }

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmployeeId(queryEmployeeId || user.id);
      if (user.organization_id) setOrganizationId(user.organization_id);
      return;
    }

    if (queryEmployeeId) setEmployeeId(queryEmployeeId);
  }, []);

  useEffect(() => {
    if (!employeeId) return;

    const fetchChildSafeConduct = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(
          `/child-safe-conduct/employee/${employeeId}`,
        );

        if (data) {
          setRecordId(data.id);
          setOrganizationId(data.organization_id || organizationId);
          setAgreementData({
            name: data.name || "",
            signature: data.signature_url || "",
            date: formatDateForInput(data.signature_date),
          });
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error("Failed to load child safe conduct data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChildSafeConduct();
  }, [employeeId]);

  const validateForm = () => {
    const nextErrors = {};
    if (!employeeId) nextErrors.employeeId = "Employee ID not found";
    if (!organizationId)
      nextErrors.organizationId = "Organization ID not found";
    if (!agreementData.name.trim()) nextErrors.name = "Name is required";
    if (!agreementData.signature)
      nextErrors.signature = "Signature is required";
    if (!agreementData.date) nextErrors.date = "Date is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      employee_id: Number(employeeId),
      organization_id: Number(organizationId),
      name: agreementData.name,
      signature_date: agreementData.date,
    };

    if (agreementData.signature?.startsWith("data:")) {
      payload.signature_base64 = agreementData.signature;
    }

    try {
      setSaving(true);
      const response = recordId
        ? await axiosClient.put(`/child-safe-conduct/${recordId}`, payload)
        : await axiosClient.post("/child-safe-conduct", payload);

      if (response.data) {
        setRecordId(response.data.id);
        setAgreementData({
          name: response.data.name || "",
          signature: response.data.signature_url || agreementData.signature,
          date: formatDateForInput(response.data.signature_date),
        });
      }

      toast.success(
        recordId
          ? "Child safe conduct updated successfully!"
          : "Child safe conduct saved successfully!",
      );
    } catch (error) {
      if (error.response?.data?.errors) {
        const apiErrors = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          const fieldMap = {
            name: "name",
            signature_base64: "signature",
            signature_date: "date",
            employee_id: "employeeId",
            organization_id: "organizationId",
          };
          apiErrors[fieldMap[key] || key] = error.response.data.errors[key][0];
        });
        setErrors(apiErrors);
        toast.error(error.response.data.message || "Failed to save form");
      } else {
        toast.error("Failed to save form");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="min-h-screen bg-gray-200 px-4 py-10 print:bg-white print:p-0"
    >
      <ToastContainer position="top-right" />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center gap-3 rounded-lg bg-white p-6">
            <FaSpinner className="animate-spin text-blue-600" size={24} />
            <span>Loading...</span>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full flex-col items-center gap-6 print:block print:w-full">
        {policyPages.map((page, index) => {
          const pageNumber = index + 1;

          if (pageNumber === 10) {
            return (
              <PolicyAgreementPage
                key={page}
                name={agreementData.name}
                signature={agreementData.signature}
                date={agreementData.date}
                onNameChange={(value) => updateAgreementField("name", value)}
                onDateChange={(value) => updateAgreementField("date", value)}
                onOpenSignature={() => setShowSignatureModal(true)}
                errors={errors}
              />
            );
          }

          return (
            <PolicyImagePage key={page} src={page} pageNumber={pageNumber} />
          );
        })}

        <div className="flex justify-center gap-4 py-4 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={saving}
            className="flex items-center gap-2 rounded bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <FaPrint />
            Print Form
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? "Saving..." : recordId ? "Update Form" : "Save Form"}
          </button>
        </div>
      </div>

      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={(value) => updateAgreementField("signature", value)}
        existingSignature={agreementData.signature}
      />
    </form>
  );
};

export default ChildSafeCodeOfPolicyForm;
