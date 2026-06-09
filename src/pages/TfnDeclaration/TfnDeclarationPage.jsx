import React, { useState, useEffect } from "react";

import axiosClient from '../../axiosClient';

import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { FaSave, FaSpinner } from 'react-icons/fa';

import TfnPage1Cover from "./components/TfnPage1Cover";

import TfnPage2Instructions from "./components/TfnPage2Instructions";

import TfnPage3Instructions from "./components/TfnPage3Instructions";

import TfnPage4MoreInfo from "./components/TfnPage4MoreInfo";

import TfnPage5Form, { initialFormState, createCharArray } from "./components/TfnPage5Form";

import TfnPage6PayerInfo from "./components/TfnPage6PayerInfo";



const TfnDeclarationPage = () => {

  const [form, setForm] = useState(initialFormState);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  const [declarationId, setDeclarationId] = useState(null);

  const [employeeId, setEmployeeId] = useState(null);

  const [organizationId, setOrganizationId] = useState(null);

  const [isEmployeeUser, setIsEmployeeUser] = useState(false);



  // Fetch employee data from localStorage
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let empId = queryParams.get('employeeId');

    const employeeStr = localStorage.getItem('employee');
    const userStr = localStorage.getItem('user');
    const currentRole = localStorage.getItem('CURRENT_USER_ROLE')?.toLowerCase();
    const storedRoles = localStorage.getItem('USER_ROLES');
    const roleNames = [];

    if (currentRole) roleNames.push(currentRole);
    if (storedRoles) {
      try {
        const parsedRoles = JSON.parse(storedRoles);
        if (Array.isArray(parsedRoles)) {
          parsedRoles.forEach((role) => {
            if (role?.role_name) roleNames.push(role.role_name.toLowerCase());
            if (typeof role === 'string') roleNames.push(role.toLowerCase());
          });
        }
      } catch {
        // Ignore malformed role cache and fall back to employee storage below.
      }
    }

    const adminRoles = ['superadmin', 'organization_admin', 'hr_manager', 'payroll_manager', 'recruiter'];
    const hasAdminRole = roleNames.some((role) => adminRoles.includes(role));
    const hasEmployeeRole = roleNames.includes('employee');
    setIsEmployeeUser((hasEmployeeRole && !hasAdminRole) || (!roleNames.length && !!employeeStr));

    if (employeeStr) {
      const employee = JSON.parse(employeeStr);
      setEmployeeId(empId || employee.id);
      if (employee.organization_id) {
        setOrganizationId(employee.organization_id);
      }
    } else if (userStr) {
      const user = JSON.parse(userStr);
      setEmployeeId(empId || user.id);
      if (user.organization_id) setOrganizationId(user.organization_id);
    } else if (empId) {
      setEmployeeId(empId);
    }
  }, []);



  // Fetch existing TFN declaration on load

  useEffect(() => {

    if (employeeId) {

      fetchTfnDeclaration();

    }

  }, [employeeId]);



  const fetchTfnDeclaration = async () => {

    try {

      setLoading(true);

      const response = await axiosClient.get(`/tfn-declarations/employee/${employeeId}`);

      if (response.data) {

        const data = response.data;

        setDeclarationId(data.id);



        // Convert residency_status from API to form

        const residencyMap = {

          'australian_resident': 'resident',

          'foreign_resident': 'foreign',

          'working_holiday_maker': 'whm',

        };



        // Map API response to form state

        const updatedForm = {

          sectionA: {

            tfn: createCharArray(9, data.tfn_number),

            tfnApplied: false,

            tfnUnder18: data.tfn_exemption_type === 'under_18',

            tfnPensioner: data.tfn_exemption_type === 'pensioner',

            title: data.title || '',

            surname: createCharArray(19, data.surname),

            surnameLine2: createCharArray(19),

            firstName: createCharArray(15, data.first_name),

            otherNames: createCharArray(15, data.other_names),

            otherNamesLine2: createCharArray(15),

            addressLine1: createCharArray(19, data.payee_address),

            addressLine2: createCharArray(19),

            suburb: createCharArray(15, data.payee_suburb),

            state: createCharArray(3, data.payee_state),

            postcode: createCharArray(4, data.payee_postcode),

            previousName: createCharArray(19, data.previous_name),

            emailLine1: createCharArray(19, data.payee_email),

            emailLine2: createCharArray(19),

            dob: createCharArray(8, formatDateForInput(data.dob)),

            paymentBasis: data.employment_basis || '',

            residency: residencyMap[data.residency_status] || '',

            taxFreeThreshold: data.claim_tax_free_threshold ? 'yes' : 'no',

            studentLoan: data.has_help_debt ? 'yes' : 'no',

            signature: data.payee_signature_url || '',

            signatureDate: createCharArray(8, formatDateForInput(data.payee_declaration_date)),

          },

          sectionB: {

            abn: createCharArray(11, data.payer_abn),

            branchNumber: createCharArray(3, data.payer_branch_number),

            abnApplied: data.payer_applied_for_abn ? 'yes' : 'no',

            legalName1: createCharArray(19, data.payer_legal_name),

            legalName2: createCharArray(19),

            legalName3: createCharArray(19),

            addressLine1: createCharArray(19, data.payer_address),

            addressLine2: createCharArray(19),

            suburb: createCharArray(15, data.payer_suburb),

            state: createCharArray(3, data.payer_state),

            postcode: createCharArray(4, data.payer_postcode),

            emailLine1: createCharArray(19, data.payer_email),

            emailLine2: createCharArray(19),

            contactName: createCharArray(15, data.payer_contact_person),

            phone: createCharArray(10, data.payer_phone),

            ceasingPayments: data.no_longer_makes_payments,

            signature: data.payer_signature_url || '',

            signatureDate: createCharArray(8, formatDateForInput(data.payer_declaration_date)),

          },

        };

        setForm(updatedForm);

      }

    } catch (error) {

      console.error('Error fetching TFN declaration:', error);

      if (error.response?.status !== 404) {

        toast.error('Failed to load TFN declaration data');

      }

    } finally {

      setLoading(false);

    }

  };



  const formatDateForInput = (dateString) => {

    if (!dateString) return '';

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const year = date.getFullYear();

    return `${day}${month}${year}`;

  };



  const validateForm = () => {

    const newErrors = {};

    const a = form.sectionA;

    const b = form.sectionB;



    // Section A validation

    const tfnFilled = a.tfn.join('').trim();

    const hasExemption = a.tfnApplied || a.tfnUnder18 || a.tfnPensioner;

    if (!tfnFilled && !hasExemption) {

      newErrors.tfn_number = 'Tax File Number or exemption type is required';

    }

    if (!a.title) {

      newErrors.title = 'Title is required';

    }

    if (!a.surname.join('').trim()) {

      newErrors.surname = 'Surname is required';

    }

    if (!a.firstName.join('').trim()) {

      newErrors.first_name = 'First name is required';

    }

    if (!a.addressLine1.join('').trim()) {

      newErrors.payee_address = 'Address is required';

    }

    if (!a.suburb.join('').trim()) {

      newErrors.payee_suburb = 'Suburb is required';

    }

    if (!a.state.join('').trim()) {

      newErrors.payee_state = 'State is required';

    }

    if (!a.postcode.join('').trim()) {

      newErrors.payee_postcode = 'Postcode is required';

    }

    if (!a.emailLine1.join('').trim()) {

      newErrors.payee_email = 'Email is required';

    }

    if (!a.dob.join('').trim()) {

      newErrors.dob = 'Date of birth is required';

    }

    if (!a.paymentBasis) {

      newErrors.employment_basis = 'Payment basis is required';

    }

    if (!a.residency) {

      newErrors.residency_status = 'Residency status is required';

    }

    if (!a.taxFreeThreshold) {

      newErrors.claim_tax_free_threshold = 'Tax free threshold is required';

    }

    if (!a.studentLoan) {

      newErrors.has_help_debt = 'HELP debt status is required';

    }

    if (!a.signature) {

      newErrors.payee_signature_base64 = 'Payee signature is required';

    }

    if (!a.signatureDate.join('').trim()) {

      newErrors.payee_declaration_date = 'Payee declaration date is required';

    }



    // Section B is completed by the payer, so employees can save Section A without it.
    if (!isEmployeeUser && !b.abn.join('').trim()) {

      newErrors.payer_abn = 'ABN is required';

    }

    if (!isEmployeeUser && !b.legalName1.join('').trim()) {

      newErrors.payer_legal_name = 'Legal name is required';

    }

    if (!isEmployeeUser && !b.addressLine1.join('').trim()) {

      newErrors.payer_address = 'Payer address is required';

    }

    if (!isEmployeeUser && !b.suburb.join('').trim()) {

      newErrors.payer_suburb = 'Payer suburb is required';

    }

    if (!isEmployeeUser && !b.state.join('').trim()) {

      newErrors.payer_state = 'Payer state is required';

    }

    if (!isEmployeeUser && !b.postcode.join('').trim()) {

      newErrors.payer_postcode = 'Payer postcode is required';

    }

    if (!isEmployeeUser && !b.emailLine1.join('').trim()) {

      newErrors.payer_email = 'Payer email is required';

    }

    if (!isEmployeeUser && !b.contactName.join('').trim()) {

      newErrors.payer_contact_person = 'Contact person is required';

    }

    if (!isEmployeeUser && !b.phone.join('').trim()) {

      newErrors.payer_phone = 'Phone number is required';

    }

    if (!isEmployeeUser && !b.signature) {

      newErrors.payer_signature_base64 = 'Payer signature is required';

    }

    if (!isEmployeeUser && !b.signatureDate.join('').trim()) {

      newErrors.payer_declaration_date = 'Payer declaration date is required';

    }



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



      const a = form.sectionA;

      const b = form.sectionB;



      // Determine TFN exemption type

      let tfnExemptionType = null;

      if (a.tfnUnder18) tfnExemptionType = 'under_18';

      else if (a.tfnPensioner) tfnExemptionType = 'pensioner';



      // Convert employment_basis from form (underscores) to API (underscores)

      const employmentBasisMap = {

        'full_time': 'full_time',

        'part_time': 'part_time',

        'labour_hire': 'labour_hire',

        'superannuation': 'superannuation',

        'casual': 'casual',

      };



      // Convert residency_status from form to API

      const residencyMap = {

        'resident': 'australian_resident',

        'foreign': 'foreign_resident',

        'whm': 'working_holiday_maker',

      };



      const payload = {

        employee_id: employeeId,

        organization_id: organizationId || 15,

        tfn_number: a.tfn.join(''),

        tfn_exemption_type: tfnExemptionType,

        title: a.title,

        surname: a.surname.join(''),

        first_name: a.firstName.join(''),

        other_names: a.otherNames.join(''),

        previous_name: a.previousName.join(''),

        dob: parseDate(a.dob.join('')),

        payee_address: a.addressLine1.join(''),

        payee_suburb: a.suburb.join(''),

        payee_state: a.state.join(''),

        payee_postcode: a.postcode.join(''),

        payee_email: a.emailLine1.join(''),

        employment_basis: employmentBasisMap[a.paymentBasis] || a.paymentBasis,

        residency_status: residencyMap[a.residency] || a.residency,

        claim_tax_free_threshold: a.taxFreeThreshold === 'yes',

        has_help_debt: a.studentLoan === 'yes',

        payee_signature_base64: a.signature,

        payee_declaration_date: parseDate(a.signatureDate.join('')),

        payer_abn: b.abn.join(''),

        payer_branch_number: b.branchNumber.join(''),

        payer_applied_for_abn: b.abnApplied === 'yes',

        payer_legal_name: b.legalName1.join(''),

        payer_address: b.addressLine1.join(''),

        payer_suburb: b.suburb.join(''),

        payer_state: b.state.join(''),

        payer_postcode: b.postcode.join(''),

        payer_email: b.emailLine1.join(''),

        payer_contact_person: b.contactName.join(''),

        payer_phone: b.phone.join(''),

        no_longer_makes_payments: b.ceasingPayments,

        payer_signature_base64: b.signature,

        payer_declaration_date: parseDate(b.signatureDate.join('')),

      };



      let response;

      if (declarationId) {

        // Update existing TFN declaration

        response = await axiosClient.put(`/tfn-declarations/${declarationId}`, payload);

        if (response.data) {

          toast.success('TFN declaration updated successfully!');

        }

      } else {

        // Create new TFN declaration

        response = await axiosClient.post('/tfn-declarations', payload);

        if (response.data) {

          setDeclarationId(response.data.id);

          toast.success('TFN declaration created successfully!');

        }

      }

    } catch (error) {

      console.error('Error saving TFN declaration:', error);

      if (error.response?.data?.errors) {

        const apiErrors = error.response.data.errors;

        const formattedErrors = {};

        Object.keys(apiErrors).forEach((key) => {

          // Map API field names to user-friendly error messages

          const errorMessages = {

            employee_id: 'Employee ID is required',

            organization_id: 'Organization ID is required',

            tfn_number: 'Tax File Number is required',

            title: 'Title is required',

            surname: 'Surname is required',

            first_name: 'First name is required',

            other_names: 'Other names are required',

            previous_name: 'Previous name is required',

            dob: 'Date of birth is required',

            payee_address: 'Payee address is required',

            payee_suburb: 'Payee suburb is required',

            payee_state: 'Payee state is required',

            payee_postcode: 'Payee postcode is required',

            payee_email: 'Payee email is required',

            employment_basis: 'Employment basis is required',

            residency_status: 'Residency status is required',

            claim_tax_free_threshold: 'Tax free threshold selection is required',

            has_help_debt: 'HELP debt status is required',

            payee_signature_base64: 'Payee signature is required',

            payee_declaration_date: 'Payee declaration date is required',

            payer_abn: 'Payer ABN is required',

            payer_branch_number: 'Payer branch number is required',

            payer_applied_for_abn: 'ABN application status is required',

            payer_legal_name: 'Payer legal name is required',

            payer_address: 'Payer address is required',

            payer_suburb: 'Payer suburb is required',

            payer_state: 'Payer state is required',

            payer_postcode: 'Payer postcode is required',

            payer_email: 'Payer email is required',

            payer_contact_person: 'Contact person is required',

            payer_phone: 'Payer phone number is required',

            payer_signature_base64: 'Payer signature is required',

            payer_declaration_date: 'Payer declaration date is required',

          };

          formattedErrors[key] = errorMessages[key] || apiErrors[key][0];

        });

        setErrors(formattedErrors);

        toast.error('Please fix the validation errors');

      } else {

        toast.error('Failed to save TFN declaration');

      }

    } finally {

      setSaving(false);

    }

  };



  const parseDate = (dateString) => {

    if (!dateString || dateString.length !== 8) return '';

    const day = dateString.substring(0, 2);

    const month = dateString.substring(2, 4);

    const year = dateString.substring(4, 8);

    return `${year}-${month}-${day}`;

  };



  return (

    <div className="min-h-screen bg-gray-200 py-10 px-4 print:bg-white print:py-0">

      <ToastContainer position="top-right" />

      {loading && (

        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">

          <div className="bg-white rounded-lg p-6 flex items-center gap-3">

            <FaSpinner className="animate-spin text-blue-600" size={24} />

            <span>Loading...</span>

          </div>

        </div>

      )}

      <form onSubmit={handleSave} className="flex flex-col items-center gap-6 print:gap-0">

        {/* <TfnPage1Cover /> */}

        {/* <TfnPage2Instructions /> */}

        {/* <TfnPage3Instructions /> */}

        {/* <TfnPage4MoreInfo /> */}

        <TfnPage5Form
          form={form}
          onUpdate={setForm}
          errors={errors}
          onSave={handleSave}
          declarationId={declarationId}
          payerReadOnly={isEmployeeUser}
        />

        {/* <TfnPage6PayerInfo /> */}

      </form>

    </div>

  );

};



export default TfnDeclarationPage;

