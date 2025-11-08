import React from 'react';
import { useParams } from 'react-router-dom';
import EmployeeDocuments from './EmployeeDocuments';

const EmployeeDocumentsPage = () => {
  const { id } = useParams();
  
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Employee Documents</h1>
        <EmployeeDocuments employeeId={id} />
      </div>
    </div>
  );
};

export default EmployeeDocumentsPage;