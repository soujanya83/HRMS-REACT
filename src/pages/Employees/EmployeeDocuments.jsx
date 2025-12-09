import React, { useState, useEffect } from 'react';
import {
  FaUpload, FaFile, FaTrash, FaDownload, FaPlus,
  FaSearch, FaFilter, FaEye, FaEdit, FaFolder,
  FaFilePdf, FaFileWord, FaFileExcel, FaFileImage,
  FaFileArchive, FaCloudUploadAlt, FaTimes
} from 'react-icons/fa';
import { createEmployeeDocument, deleteEmployeeDocument, getDocumentsByEmployee } from '../../services/employeeDocumentService';

const DocumentCard = ({ document, onView, onDownload, onDelete }) => {
  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FaFilePdf className="h-8 w-8 text-red-500" />;
    if (type.includes('word') || type.includes('doc')) return <FaFileWord className="h-8 w-8 text-blue-500" />;
    if (type.includes('excel') || type.includes('sheet')) return <FaFileExcel className="h-8 w-8 text-green-500" />;
    if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg')) 
      return <FaFileImage className="h-8 w-8 text-purple-500" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) 
      return <FaFileArchive className="h-8 w-8 text-yellow-500" />;
    return <FaFile className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {getFileIcon(document.document_type)}
          <div>
            <h4 className="font-medium text-gray-800 truncate max-w-xs">{document.document_name}</h4>
            <p className="text-xs text-gray-500">
              {document.document_type} • {formatFileSize(document.file_size)}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {document.file_url && (
            <>
              <button
                onClick={() => onView(document)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="View"
              >
                <FaEye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDownload(document)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                title="Download"
              >
                <FaDownload className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(document)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between">
          <span>Uploaded: {document.created_at ? new Date(document.created_at).toLocaleDateString() : 'N/A'}</span>
          {document.updated_at && document.updated_at !== document.created_at && (
            <span>Updated: {new Date(document.updated_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const UploadModal = ({ isOpen, onClose, onUpload, employeeName }) => {
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!documentName) {
        setDocumentName(selectedFile.name);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      await onUpload(file, documentName || file.name);
      setFile(null);
      setDocumentName('');
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Upload Document</h2>
              <p className="text-sm text-gray-600 mt-1">For: {employeeName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Name
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FaCloudUploadAlt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">
                  {file ? file.name : 'Click to select a file'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports: PDF, Word, Excel, Images, Text files
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Max file size: 10MB
                </p>
              </label>
            </div>
            {file && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-blue-700">{file.name}</span>
                <span className="text-xs text-blue-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={uploading || !file}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="inline mr-2" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeDocuments = ({ employeeId, employeeName }) => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await getDocumentsByEmployee(employeeId);
      setDocuments(response.data?.data || []);
      setFilteredDocuments(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchDocuments();
    }
  }, [employeeId]);

  // Filter documents
  useEffect(() => {
    let filtered = documents;
    
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.document_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(doc => {
        if (fileTypeFilter === 'pdf') return doc.document_type?.includes('pdf');
        if (fileTypeFilter === 'image') return doc.document_type?.includes('image');
        if (fileTypeFilter === 'document') return doc.document_type?.includes('word') || doc.document_type?.includes('doc');
        if (fileTypeFilter === 'spreadsheet') return doc.document_type?.includes('excel') || doc.document_type?.includes('sheet');
        return true;
      });
    }
    
    setFilteredDocuments(filtered);
  }, [searchTerm, fileTypeFilter, documents]);

  const handleUpload = async (file, documentName) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('employee_id', employeeId);
      formData.append('document_name', documentName);
      formData.append('document_type', file.type);
      
      await createEmployeeDocument(formData);
      await fetchDocuments();
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (document) => {
    if (!window.confirm(`Are you sure you want to delete "${document.document_name}"?`)) return;
    
    try {
      await deleteEmployeeDocument(document.id);
      await fetchDocuments();
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const handleView = (document) => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    } else {
      alert('Document URL not available');
    }
  };

  const handleDownload = (document) => {
    if (document.file_url) {
      const link = document.createElement('a');
      link.href = document.file_url;
      link.download = document.document_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Document URL not available');
    }
  };

  const fileTypeOptions = [
    { value: 'all', label: 'All File Types' },
    { value: 'pdf', label: 'PDF Files' },
    { value: 'image', label: 'Images' },
    { value: 'document', label: 'Word Documents' },
    { value: 'spreadsheet', label: 'Excel Files' }
  ];

  const documentStats = {
    total: documents.length,
    pdf: documents.filter(d => d.document_type?.includes('pdf')).length,
    images: documents.filter(d => d.document_type?.includes('image')).length,
    recent: documents.filter(d => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(d.created_at) > weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        employeeName={employeeName}
      />

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Employee Documents</h2>
            <p className="text-gray-600 mt-1">
              {employeeName ? `For: ${employeeName}` : 'Manage employee documents'}
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FaUpload /> Upload New Document
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FaFolder className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Total: {documentStats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaFilePdf className="text-red-500" />
            <span className="text-sm text-gray-600">PDF: {documentStats.pdf}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaFileImage className="text-purple-500" />
            <span className="text-sm text-gray-600">Images: {documentStats.images}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaFile className="text-blue-500" />
            <span className="text-sm text-gray-600">Last 7 days: {documentStats.recent}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fileTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchDocuments}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <FaFilter className="inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FaFile className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {searchTerm || fileTypeFilter !== 'all' ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || fileTypeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaUpload className="inline mr-2" />
              Upload First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onView={() => handleView(document)}
                onDownload={() => handleDownload(document)}
                onDelete={() => handleDelete(document)}
              />
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading document...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredDocuments.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {filteredDocuments.length} of {documents.length} documents
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;