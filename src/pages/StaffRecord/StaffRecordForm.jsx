import React, { useState, useEffect } from "react";
import axiosClient from '../../axiosClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSave, FaSpinner, FaPrint } from 'react-icons/fa';
import topImage from "../../assets/common_form_images/img9.jpg";
import bottomImage from "../../assets/common_form_images/img11.jpg";

export const initialStaffRecordState = {
  name: "",
  dateOfBirth: "",
  email: "",
  mobileNumber: "",
  address: "",
  relevantQualifications: "",
  relevantQualificationsCopiesAttached: false,
  otherApprovedTraining: "",
  otherApprovedTrainingCopiesAttached: false,
  workingWithChildrenCheckNumber: "",
  certifiedSupervisorNumber: "",
  statusCheckCompletedDate: "",
};

const PRINT_STYLES = `
  @media print {
    @page {
      size: A4 portrait;
      margin: 0mm;
    }
    html, body {
      width: 210mm;
      height: 297mm;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
    }
    /* Hide everything except the print page */
    body > * { visibility: hidden; }
    #staff-record-print-area,
    #staff-record-print-area * { visibility: visible; }
    #staff-record-print-area {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      overflow: visible !important;
    }
    .no-print { display: none !important; }
    input, textarea {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color: #000 !important;
      background: transparent !important;
      border: none !important;
    }
    input[type="checkbox"] {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print-error { display: none !important; }
  }
`;

const StaffRecordForm = () => {
  const [formData, setFormData] = useState(initialStaffRecordState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [staffRecordId, setStaffRecordId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let empId = queryParams.get('employeeId');

    const employeeStr = localStorage.getItem('employee');
    const userStr = localStorage.getItem('user');
    if (employeeStr) {
      const employee = JSON.parse(employeeStr);
      setEmployeeId(empId || employee.id);
      if (employee.organization_id) setOrganizationId(employee.organization_id);
    } else if (userStr) {
      const user = JSON.parse(userStr);
      setEmployeeId(empId || user.id);
      if (user.organization_id) setOrganizationId(user.organization_id);
    } else if (empId) {
      setEmployeeId(empId);
    }
  }, []);

  useEffect(() => {
    if (employeeId) fetchStaffRecord();
  }, [employeeId]);

  const fetchStaffRecord = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/staff-records/employee/${employeeId}`);
      if (response.data) {
        const data = response.data;
        setStaffRecordId(data.id);
        setFormData({
          name: data.name || '',
          dateOfBirth: data.dob ? formatDateForInput(data.dob) : '',
          email: data.email || '',
          mobileNumber: data.mobile_number || '',
          address: data.address || '',
          relevantQualifications: data.relevant_qualifications || '',
          relevantQualificationsCopiesAttached: data.qualifications_copies_attached || false,
          otherApprovedTraining: data.other_approved_training || '',
          otherApprovedTrainingCopiesAttached: data.training_copies_attached || false,
          workingWithChildrenCheckNumber: data.wwc_wwvp_check_number || '',
          certifiedSupervisorNumber: data.certified_supervisor_number || '',
          statusCheckCompletedDate: data.status_check_date ? formatDateForInput(data.status_check_date) : '',
        });
      }
    } catch (error) {
      console.error('Error fetching staff record:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load staff record data');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.relevantQualifications.trim()) newErrors.relevantQualifications = 'Relevant qualifications are required';
    if (!formData.otherApprovedTraining.trim()) newErrors.otherApprovedTraining = 'Other approved training is required';
    if (!formData.workingWithChildrenCheckNumber.trim()) newErrors.workingWithChildrenCheckNumber = 'WWC check number is required';
    if (!formData.statusCheckCompletedDate) newErrors.statusCheckCompletedDate = 'Status check date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!employeeId) {
      toast.error('Employee ID not found');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        employee_id: employeeId,
        organization_id: organizationId || 15,
        name: formData.name,
        dob: formData.dateOfBirth,
        email: formData.email,
        mobile_number: formData.mobileNumber,
        address: formData.address,
        relevant_qualifications: formData.relevantQualifications,
        qualifications_copies_attached: formData.relevantQualificationsCopiesAttached,
        other_approved_training: formData.otherApprovedTraining,
        training_copies_attached: formData.otherApprovedTrainingCopiesAttached,
        wwc_wwvp_check_number: formData.workingWithChildrenCheckNumber,
        status_check_date: formData.statusCheckCompletedDate,
        certified_supervisor_number: formData.certifiedSupervisorNumber,
      };
      let response;
      if (staffRecordId) {
        response = await axiosClient.put(`/staff-records/${staffRecordId}`, payload);
        if (response.data) toast.success('Staff record updated successfully!');
      } else {
        response = await axiosClient.post('/staff-records', payload);
        if (response.data) {
          setStaffRecordId(response.data.id);
          toast.success('Staff record created successfully!');
        }
      }
    } catch (error) {
      console.error('Error saving staff record:', error);
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const formattedErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          formattedErrors[key] = apiErrors[key][0];
        });
        setErrors(formattedErrors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error('Failed to save staff record');
      }
    } finally {
      setSaving(false);
    }
  };

  /* ─── shared style tokens ─── */
  const inp =
    "w-full h-full bg-transparent px-2 py-1 text-[13px] text-gray-900 outline-none focus:bg-blue-50/30";
  const ta =
    "w-full h-full resize-none bg-transparent px-2 py-2 text-[13px] leading-snug text-gray-900 outline-none focus:bg-blue-50/30";
  const BORDER = "1px solid #3f3f3f";
  const labelStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#000',
    lineHeight: '1.3',
  };

  /* ─── reusable cell helpers ─── */
  const LabelCell = ({ children, style = {} }) => (
    <div
      style={{
        borderRight: BORDER,
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        ...labelStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );

  const InputCell = ({ children, borderRight = false, style = {} }) => (
    <div
      style={{
        borderRight: borderRight ? BORDER : 'none',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );

  return (
    <>
      {/* Inject print styles */}
      <style>{PRINT_STYLES}</style>

      {/* Page wrapper — hidden on print via the visibility trick in PRINT_STYLES */}
      <div className="min-h-screen bg-gray-200 py-8 flex flex-col items-center">
        <ToastContainer position="top-right" />

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center no-print">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <FaSpinner className="animate-spin text-blue-600" size={24} />
              <span>Loading...</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            A4 PORTRAIT PAPER  — 794 × 1123 px (210 × 297 mm)
            ══════════════════════════════════════════════════ */}
        <div
          id="staff-record-print-area"
          style={{
            position: 'relative',
            width: '794px',
            minHeight: '1123px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          }}
        >
          {/* Top header image */}
          <img
            src={topImage}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '118px',
              objectFit: 'cover',
              display: 'block',
            }}
            draggable={false}
          />

          {/* Bottom footer image */}
          <img
            src={bottomImage}
            alt=""
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '118px',
              objectFit: 'cover',
              display: 'block',
            }}
            draggable={false}
          />

          {/* ─── Content area (between header and footer images) ─── */}
          <div
            style={{
              paddingTop: '126px',
              paddingBottom: '130px',
              paddingLeft: '38px',
              paddingRight: '38px',
            }}
          >
            {/* Title */}
            <h1
              style={{
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '14px',
                color: '#000',
                letterSpacing: '0.5px',
              }}
            >
              Staff Record
            </h1>

            {/* ─── Main bordered table ─── */}
            <div style={{ border: BORDER, width: '100%' }}>

              {/* Section header */}
              <div
                style={{
                  borderBottom: BORDER,
                  padding: '7px 10px',
                  ...labelStyle,
                  fontSize: '14px',
                }}
              >
                Educators and other staff:
              </div>

              {/* ── Row 1: Name | Date of Birth ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 105px 140px',
                  height: '36px',
                  borderBottom: BORDER,
                }}
              >
                <LabelCell>Name</LabelCell>
                <InputCell borderRight>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={inp}
                    style={errors.name ? { borderBottom: '2px solid #ef4444' } : {}}
                    aria-label="Name"
                  />
                </InputCell>
                <LabelCell style={{ fontSize: '12px' }}>Date of birth</LabelCell>
                <InputCell>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className={inp}
                    style={errors.dateOfBirth ? { borderBottom: '2px solid #ef4444' } : {}}
                    aria-label="Date of birth"
                  />
                </InputCell>
              </div>
              {/* Row 1 errors */}
              {(errors.name || errors.dateOfBirth) && (
                <div className="print-error" style={{ display: 'flex', gap: '16px', padding: '2px 8px', fontSize: '11px', color: '#ef4444', background: '#fff5f5' }}>
                  {errors.name && <span>Name: {errors.name}</span>}
                  {errors.dateOfBirth && <span>DOB: {errors.dateOfBirth}</span>}
                </div>
              )}

              {/* ── Row 2: Email | Mobile Number ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 105px 140px',
                  height: '36px',
                  borderBottom: BORDER,
                }}
              >
                <LabelCell>Email</LabelCell>
                <InputCell borderRight>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={inp}
                    style={errors.email ? { borderBottom: '2px solid #ef4444' } : {}}
                    aria-label="Email"
                  />
                </InputCell>
                <LabelCell style={{ fontSize: '12px' }}>Mobile Number</LabelCell>
                <InputCell>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => updateField('mobileNumber', e.target.value)}
                    className={inp}
                    style={errors.mobileNumber ? { borderBottom: '2px solid #ef4444' } : {}}
                    aria-label="Mobile Number"
                  />
                </InputCell>
              </div>
              {(errors.email || errors.mobileNumber) && (
                <div className="print-error" style={{ display: 'flex', gap: '16px', padding: '2px 8px', fontSize: '11px', color: '#ef4444', background: '#fff5f5' }}>
                  {errors.email && <span>Email: {errors.email}</span>}
                  {errors.mobileNumber && <span>Mobile: {errors.mobileNumber}</span>}
                </div>
              )}

              {/* ── Row 3: Address (full width) ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr',
                  height: '36px',
                  borderBottom: BORDER,
                }}
              >
                <LabelCell>Address</LabelCell>
                <InputCell>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className={inp}
                    style={errors.address ? { borderBottom: '2px solid #ef4444' } : {}}
                    aria-label="Address"
                  />
                </InputCell>
              </div>
              {errors.address && (
                <div className="print-error" style={{ padding: '2px 8px', fontSize: '11px', color: '#ef4444', background: '#fff5f5' }}>
                  Address: {errors.address}
                </div>
              )}

              {/* ── Row 4: Relevant Qualifications ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 148px',
                  height: '95px',
                  borderBottom: BORDER,
                }}
              >
                <div
                  style={{
                    borderRight: BORDER,
                    padding: '8px',
                    ...labelStyle,
                  }}
                >
                  Relevant qualifications/s, or course enrolled in
                </div>
                <InputCell borderRight style={errors.relevantQualifications ? { borderBottom: '2px solid #ef4444' } : {}}>
                  <textarea
                    value={formData.relevantQualifications}
                    onChange={(e) => updateField('relevantQualifications', e.target.value)}
                    className={ta}
                    aria-label="Relevant qualifications"
                  />
                </InputCell>
                {/* Copies attached */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    ...labelStyle,
                    fontSize: '12px',
                  }}
                >
                  <span>Copies attached</span>
                  <input
                    type="checkbox"
                    checked={formData.relevantQualificationsCopiesAttached}
                    onChange={(e) => updateField('relevantQualificationsCopiesAttached', e.target.checked)}
                    style={{
                      width: '22px',
                      height: '22px',
                      flexShrink: 0,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      border: BORDER,
                      backgroundColor: formData.relevantQualificationsCopiesAttached ? '#4b5563' : 'white',
                      cursor: 'pointer',
                    }}
                    aria-label="Relevant qualifications copies attached"
                  />
                </div>
              </div>
              {errors.relevantQualifications && (
                <div className="print-error" style={{ padding: '2px 8px', fontSize: '11px', color: '#ef4444', background: '#fff5f5' }}>
                  {errors.relevantQualifications}
                </div>
              )}

              {/* ── Row 5: Other Approved Training ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 148px',
                  height: '95px',
                  borderBottom: BORDER,
                }}
              >
                <div
                  style={{
                    borderRight: BORDER,
                    padding: '8px',
                    ...labelStyle,
                  }}
                >
                  Other approved training completed
                </div>
                <InputCell borderRight style={errors.otherApprovedTraining ? { borderBottom: '2px solid #ef4444' } : {}}>
                  <textarea
                    value={formData.otherApprovedTraining}
                    onChange={(e) => updateField('otherApprovedTraining', e.target.value)}
                    className={ta}
                    aria-label="Other approved training"
                  />
                </InputCell>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    ...labelStyle,
                    fontSize: '12px',
                  }}
                >
                  <span>Copies attached</span>
                  <input
                    type="checkbox"
                    checked={formData.otherApprovedTrainingCopiesAttached}
                    onChange={(e) => updateField('otherApprovedTrainingCopiesAttached', e.target.checked)}
                    style={{
                      width: '22px',
                      height: '22px',
                      flexShrink: 0,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      border: BORDER,
                      backgroundColor: formData.otherApprovedTrainingCopiesAttached ? '#4b5563' : 'white',
                      cursor: 'pointer',
                    }}
                    aria-label="Other approved training copies attached"
                  />
                </div>
              </div>
              {errors.otherApprovedTraining && (
                <div className="print-error" style={{ padding: '2px 8px', fontSize: '11px', color: '#ef4444', background: '#fff5f5' }}>
                  {errors.otherApprovedTraining}
                </div>
              )}

              {/* ── Row 6: WWC Check Number + Certified Supervisor ── */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 115px 133px',
                }}
              >
                {/* Col A: WWC label */}
                <div
                  style={{
                    borderRight: BORDER,
                    padding: '8px',
                    ...labelStyle,
                  }}
                >
                  Identification number of relevant working with children check or working with vulnerable people check
                </div>

                {/* Col B: WWC textarea (top) + Date of status check (bottom) */}
                <div style={{ borderRight: BORDER }}>
                  {/* Sub-row top: WWC number */}
                  <div
                    style={{
                      height: '82px',
                      borderBottom: BORDER,
                      overflow: 'hidden',
                    }}
                  >
                    <textarea
                      value={formData.workingWithChildrenCheckNumber}
                      onChange={(e) => updateField('workingWithChildrenCheckNumber', e.target.value)}
                      className={ta}
                      aria-label="WWC check number"
                    />
                  </div>
                  {/* Sub-row bottom: Date of status check */}
                  <div
                    style={{
                      height: '82px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '4px 8px',
                      overflow: 'hidden',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '11px',
                        color: '#000',
                        fontWeight: '500',
                        lineHeight: '1.3',
                        marginBottom: '5px',
                      }}
                    >
                      Date of status check completed{' '}
                      <em style={{ fontWeight: 400 }}>(to be done monthly here after)</em>
                    </label>
                    <input
                      type="date"
                      value={formData.statusCheckCompletedDate}
                      onChange={(e) => updateField('statusCheckCompletedDate', e.target.value)}
                      className={inp}
                      style={{
                        height: '28px',
                        ...(errors.statusCheckCompletedDate ? { borderBottom: '2px solid #ef4444' } : {}),
                      }}
                      aria-label="Date of status check completed"
                    />
                  </div>
                </div>

                {/* Col C: Certified Supervisor label */}
                <div
                  style={{
                    borderRight: BORDER,
                    padding: '8px',
                    ...labelStyle,
                    fontSize: '12px',
                  }}
                >
                  Certified Supervisor number
                  <br />
                  <br />
                  <em style={{ fontWeight: 400 }}>(if applicable)</em>
                </div>

                {/* Col D: Certified Supervisor textarea */}
                <div style={{ overflow: 'hidden' }}>
                  <textarea
                    value={formData.certifiedSupervisorNumber}
                    onChange={(e) => updateField('certifiedSupervisorNumber', e.target.value)}
                    className={ta}
                    aria-label="Certified Supervisor number"
                  />
                </div>
              </div>
              {/* Row 6 errors */}
              {(errors.workingWithChildrenCheckNumber || errors.statusCheckCompletedDate) && (
                <div className="print-error" style={{ display: 'flex', gap: '16px', padding: '2px 8px', fontSize: '11px', color: '#ef4444', background: '#fff5f5' }}>
                  {errors.workingWithChildrenCheckNumber && <span>WWC#: {errors.workingWithChildrenCheckNumber}</span>}
                  {errors.statusCheckCompletedDate && <span>Status date: {errors.statusCheckCompletedDate}</span>}
                </div>
              )}

            </div>
            {/* ── end table ── */}

            {/* Footer address text */}
            <div
              style={{
                marginTop: '14px',
                textAlign: 'center',
                fontSize: '11px',
                color: '#8b8b8b',
                lineHeight: '1.7',
              }}
            >
              <p>ABN: 36 602 053 412</p>
              <p>1 Capricorn Road, Truganina, VIC 3029.</p>
            </div>
          </div>
          {/* ── end content area ── */}
        </div>
        {/* ── end A4 paper ── */}

        {/* ── Action buttons (hidden on print) ── */}
        <form
          onSubmit={handleSave}
          className="no-print"
          style={{ width: '794px', marginTop: '18px', paddingBottom: '40px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 22px',
                backgroundColor: '#4b5563',
                color: '#fff',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              <FaPrint />
              Print Form
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 22px',
                backgroundColor: saving ? '#93c5fd' : '#2563eb',
                color: '#fff',
                borderRadius: '8px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {saving ? 'Saving...' : 'Save Staff Record'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default StaffRecordForm;
