// // pages/Employees/EmployeeDocuments.jsx
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   FaArrowLeft,
//   FaPlus,
//   FaTrash,
//   FaEye,
//   FaDownload,
//   FaFilePdf,
//   FaFileWord,
//   FaFileImage,
//   FaFileAlt,
//   FaSpinner,
//   FaExclamationTriangle,
//   FaTimes,
//   FaCheck,
//   FaUpload,
//   FaEdit
// } from 'react-icons/fa';
// import {
//   getEmployeeDocuments,
//   uploadEmployeeDocument,
//   deleteEmployeeDocument,
//   updateEmployeeDocument,
//   getEmployee
// } from '../../services/employeeService';

// // Document Type Options
// const DOCUMENT_TYPES = [
//   'Aadhaar Card',
//   'PAN Card',
//   'Passport',
//   'Driving License',
//   'Visa',
//   'Work Permit',
//   'Employment Contract',
//   'Offer Letter',
//   'Experience Letter',
//   'Salary Slip',
//   'Bank Statement',
//   'Tax Document',
//   'Education Certificate',
//   'Professional Certificate',
//   'Working with Children Check',
//   'First Aid Certificate',
//   'CPR Certificate',
//   'Police Check',
//   'Other'
// ];

// // Document Upload Modal
// const DocumentUploadModal = ({ isOpen, onClose, employeeId, onUploadSuccess, documentToEdit }) => {
//   const [formData, setFormData] = useState({
//     document_type: '',
//     file_name: '',
//     issue_date: '',
//     expiry_date: '',
//     file: null
//   });
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (isOpen) {
//       if (documentToEdit) {
//         setFormData({
//           document_type: documentToEdit.document_type || '',
//           file_name: documentToEdit.file_name || '',
//           issue_date: documentToEdit.issue_date || '',
//           expiry_date: documentToEdit.expiry_date || '',
//           file: null
//         });
//       } else {
//         setFormData({
//           document_type: '',
//           file_name: '',
//           issue_date: '',
//           expiry_date: '',
//           file: null
//         });
//       }
//       setError('');
//     }
//   }, [isOpen, documentToEdit]);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      
//       setFormData(prev => ({
//         ...prev,
//         file,
//         file_name: prev.file_name || fileNameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!documentToEdit && !formData.file) {
//       setError('Please select a file to upload');
//       return;
//     }

//     if (!formData.document_type) {
//       setError('Please select a document type');
//       return;
//     }

//     if (!formData.file_name) {
//       setError('Please enter a file name');
//       return;
//     }

//     setUploading(true);
//     setError('');

//     try {
//       const data = new FormData();
      
//       // CORRECT FIELDS FOR /employee-documents ENDPOINT
//       data.append('document_type', formData.document_type);
//       data.append('file_name', formData.file_name);
      
//       if (formData.file) {
//         data.append('file', formData.file);
//       }
      
//       if (formData.issue_date) {
//         data.append('issue_date', formData.issue_date);
//       }
//       if (formData.expiry_date) {
//         data.append('expiry_date', formData.expiry_date);
//       }

//       if (documentToEdit) {
//         data.append('_method', 'PUT');
//         await updateEmployeeDocument(documentToEdit.id, data);
//       } else {
//         await uploadEmployeeDocument(data);
//       }
      
//       onUploadSuccess();
//       onClose();
//     } catch (err) {
//       console.error('Upload error:', err);
//       if (err.response?.status === 422) {
//         const errors = err.response.data?.errors || {};
//         const errorMessages = Object.values(errors).flat();
//         setError(errorMessages.join(', ') || 'Validation failed');
//       } else {
//         setError(err.response?.data?.message || 'Failed to upload document');
//       }
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6 border-b border-gray-200 flex justify-between items-center">
//           <h2 className="text-2xl font-bold text-gray-800">
//             {documentToEdit ? 'Edit Document' : 'Upload New Document'}
//           </h2>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
//             <FaTimes />
//           </button>
//         </div>
        
//         <form onSubmit={handleSubmit} className="p-6">
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           <div className="space-y-6">
//             {/* Document Type */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Document Type <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={formData.document_type}
//                 onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
//                 required
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select Document Type</option>
//                 {DOCUMENT_TYPES.map(type => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>

//             {/* File Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 File Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.file_name}
//                 onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
//                 placeholder="Enter a descriptive file name"
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 This will be the name shown in the documents list
//               </p>
//             </div>

//             {/* Dates Row */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Issue Date
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.issue_date}
//                   onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Expiry Date
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.expiry_date}
//                   onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             {/* File Upload */}
//             {!documentToEdit && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Document File <span className="text-red-500">*</span>
//                 </label>
//                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//                   <input
//                     type="file"
//                     onChange={handleFileChange}
//                     className="hidden"
//                     id="file-upload"
//                     accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                     required={!documentToEdit}
//                   />
//                   <label htmlFor="file-upload" className="cursor-pointer">
//                     {formData.file ? (
//                       <div className="text-green-600">
//                         <FaCheck className="h-8 w-8 mx-auto mb-2" />
//                         <p className="font-medium">{formData.file.name}</p>
//                         <p className="text-sm text-gray-500">
//                           {(formData.file.size / 1024 / 1024).toFixed(2)} MB
//                         </p>
//                       </div>
//                     ) : (
//                       <div className="text-gray-500">
//                         <FaUpload className="h-8 w-8 mx-auto mb-2" />
//                         <p className="font-medium">Click to select file</p>
//                         <p className="text-sm">PDF, DOC, JPG, PNG up to 10MB</p>
//                       </div>
//                     )}
//                   </label>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
//               disabled={uploading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={uploading}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//             >
//               {uploading && <FaSpinner className="animate-spin" />}
//               {documentToEdit ? 'Update Document' : 'Upload Document'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Document Card Component
// const DocumentCard = ({ document, onDelete, onEdit }) => {
//   const today = new Date();
//   const expiryDate = document.expiry_date ? new Date(document.expiry_date) : null;
  
//   let statusColor = "bg-green-100 text-green-800";
//   let statusText = "Valid";
  
//   if (expiryDate) {
//     const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
//     if (daysRemaining < 0) {
//       statusColor = "bg-red-100 text-red-800";
//       statusText = "Expired";
//     } else if (daysRemaining <= 30) {
//       statusColor = "bg-yellow-100 text-yellow-800";
//       statusText = `Expires in ${daysRemaining} days`;
//     }
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString('en-AU', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//       });
//     } catch {
//       return dateString;
//     }
//   };

//   const getFileIcon = (fileName) => {
//     if (!fileName) return <FaFileAlt className="text-gray-400 text-2xl" />;
//     const ext = fileName.split('.').pop()?.toLowerCase();
    
//     if (ext === 'pdf') return <FaFilePdf className="text-red-500 text-2xl" />;
//     if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-blue-500 text-2xl" />;
//     if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return <FaFileImage className="text-green-500 text-2xl" />;
//     return <FaFileAlt className="text-gray-500 text-2xl" />;
//   };

//   const baseUrl = 'https://api.chrispp.com';

//   return (
//     <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center gap-3">
//           {getFileIcon(document.file_name)}
//           <div>
//             <h4 className="font-semibold text-gray-900">{document.document_type || 'Document'}</h4>
//             <p className="text-sm text-gray-500">{document.file_name}</p>
//           </div>
//         </div>
//         {expiryDate && (
//           <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
//             {statusText}
//           </span>
//         )}
//       </div>
      
//       <div className="grid grid-cols-2 gap-4 mb-4">
//         {document.issue_date && (
//           <div>
//             <p className="text-xs text-gray-500">Issue Date</p>
//             <p className="text-sm font-medium">{formatDate(document.issue_date)}</p>
//           </div>
//         )}
//         {document.expiry_date && (
//           <div>
//             <p className="text-xs text-gray-500">Expiry Date</p>
//             <p className="text-sm font-medium">{formatDate(document.expiry_date)}</p>
//           </div>
//         )}
//       </div>
      
//       <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
//         {document.file_url && (
//           <>
//             <a
//               href={`${baseUrl}${document.file_url}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm"
//             >
//               <FaEye />
//               View
//             </a>
//             <a
//               href={`${baseUrl}${document.file_url}`}
//               download
//               className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors text-sm"
//             >
//               <FaDownload />
//               Download
//             </a>
//           </>
//         )}
//         <button
//           onClick={() => onEdit(document)}
//           className="flex items-center gap-2 px-3 py-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors text-sm"
//         >
//           <FaEdit />
//           Edit
//         </button>
//         <button
//           onClick={() => onDelete(document.id)}
//           className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm"
//         >
//           <FaTrash />
//           Delete
//         </button>
//       </div>
      
//       <div className="mt-3 text-xs text-gray-400">
//         Uploaded: {formatDate(document.created_at)}
//       </div>
//     </div>
//   );
// };

// // Confirmation Modal
// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
//         <div className="text-center">
//           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
//             <FaTrash className="h-6 w-6 text-red-600" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
//           <p className="text-sm text-gray-500 mb-6">{message}</p>
//         </div>
//         <div className="flex justify-center gap-3">
//           <button
//             onClick={onClose}
//             className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex-1"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex-1"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function EmployeeDocuments() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [documents, setDocuments] = useState([]);
//   const [employee, setEmployee] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [uploadModalOpen, setUploadModalOpen] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [documentToDelete, setDocumentToDelete] = useState(null);
//   const [documentToEdit, setDocumentToEdit] = useState(null);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchData();
//   }, [id]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [employeeRes, docsRes] = await Promise.all([
//         getEmployee(id),
//         getEmployeeDocuments(id)
//       ]);
      
//       setEmployee(employeeRes.data.data);
      
//       let documentsData = [];
//       if (docsRes.data) {
//         if (docsRes.data.success === true && docsRes.data.data) {
//           documentsData = docsRes.data.data;
//         } else if (Array.isArray(docsRes.data)) {
//           documentsData = docsRes.data;
//         } else if (docsRes.data.data && Array.isArray(docsRes.data.data)) {
//           documentsData = docsRes.data.data;
//         }
//       }
//       setDocuments(Array.isArray(documentsData) ? documentsData : []);
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteDocument = async () => {
//     if (!documentToDelete) return;
    
//     try {
//       await deleteEmployeeDocument(documentToDelete);
//       await fetchData();
//       setDeleteModalOpen(false);
//       setDocumentToDelete(null);
//     } catch (err) {
//       console.error('Error deleting document:', err);
//       setError('Failed to delete document');
//     }
//   };

//   const handleUploadSuccess = () => {
//     fetchData();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading documents...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <DocumentUploadModal
//         isOpen={uploadModalOpen}
//         onClose={() => {
//           setUploadModalOpen(false);
//           setDocumentToEdit(null);
//         }}
//         employeeId={id}
//         onUploadSuccess={handleUploadSuccess}
//         documentToEdit={documentToEdit}
//       />

//       <ConfirmationModal
//         isOpen={deleteModalOpen}
//         onClose={() => {
//           setDeleteModalOpen(false);
//           setDocumentToDelete(null);
//         }}
//         onConfirm={handleDeleteDocument}
//         title="Delete Document"
//         message="Are you sure you want to delete this document? This action cannot be undone."
//       />

//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <button
//             onClick={() => navigate(`/dashboard/employees/profile/${id}`)}
//             className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
//           >
//             <FaArrowLeft className="text-sm" />
//             Back to Profile
//           </button>
          
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800 mb-2">
//                 Employee Documents
//               </h1>
//               {employee && (
//                 <p className="text-gray-600">
//                   Managing documents for {employee.first_name} {employee.last_name}
//                 </p>
//               )}
//             </div>
            
//             <button
//               onClick={() => {
//                 setDocumentToEdit(null);
//                 setUploadModalOpen(true);
//               }}
//               className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <FaPlus /> Upload Document
//             </button>
//           </div>
//         </div>

//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
//             <FaExclamationTriangle className="text-red-500" />
//             <p className="text-red-700">{error}</p>
//           </div>
//         )}

//         {/* Documents Grid */}
//         {documents.length > 0 ? (
//           <>
//             <div className="mb-4 flex items-center gap-3">
//               <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
//                 {documents.length} {documents.length === 1 ? 'document' : 'documents'} total
//               </span>
//             </div>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//               {documents.map((doc) => (
//                 <DocumentCard
//                   key={doc.id}
//                   document={doc}
//                   onDelete={(id) => {
//                     setDocumentToDelete(id);
//                     setDeleteModalOpen(true);
//                   }}
//                   onEdit={(doc) => {
//                     setDocumentToEdit(doc);
//                     setUploadModalOpen(true);
//                   }}
//                 />
//               ))}
//             </div>
//           </>
//         ) : (
//           <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
//             <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gray-100 rounded-full">
//               <FaFileAlt className="text-4xl text-gray-400" />
//             </div>
//             <h4 className="text-xl font-semibold text-gray-700 mb-3">No documents found</h4>
//             <p className="text-gray-500 mb-8 max-w-md mx-auto">
//               Upload important documents like IDs, contracts, certificates, etc.
//             </p>
//             <button
//               onClick={() => {
//                 setDocumentToEdit(null);
//                 setUploadModalOpen(true);
//               }}
//               className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
//             >
//               <FaUpload /> Upload First Document
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }