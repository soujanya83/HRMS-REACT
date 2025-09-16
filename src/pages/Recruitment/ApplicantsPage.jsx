import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiUsers, FiSearch, FiFilter, FiPlus, FiEdit, FiTrash2, 
  FiChevronLeft, FiChevronRight, FiDownload, FiEye, FiX, FiLoader
} from 'react-icons/fi';


import { 
    getApplicants,
    createApplicant,
    updateApplicant,
    deleteApplicant,
    updateApplicantStatus,
    getJobOpenings,
    downloadApplicantResume 
} from '../../services/recruitmentService'; 

const statusOptions = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { value: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-800' },
  { value: 'offer', label: 'Offer', color: 'bg-green-100 text-green-800' },
  { value: 'hired', label: 'Hired', color: 'bg-teal-100 text-teal-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
];

const initialFormData = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_opening_id: '',
    resume_url: '',
    cover_letter: '',
    source: '',
    status: 'applied'
};

const ApplicantsPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [jobOpenings, setJobOpenings] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState(initialFormData);

 
  const organizationId = 1; 

  const fetchData = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
        const [applicantsRes, jobOpeningsRes] = await Promise.all([
            
            getApplicants({ organization_id: organizationId }),
             getJobOpenings(organizationId)
        ]);
        
        const applicantsData = applicantsRes.data?.data || applicantsRes.data || [];
        setApplicants(applicantsData);

        const jobOpeningsData = jobOpeningsRes.data?.data || jobOpeningsRes.data || [];
        setJobOpenings(jobOpeningsData);

    } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

   useEffect(() => {
    if (!Array.isArray(applicants)) return;
    let result = applicants;
    
    if (searchTerm) {
      result = result.filter(applicant => 
        `${applicant.first_name} ${applicant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.job_opening?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(applicant => applicant.status === statusFilter);
    }
    
    if (jobFilter !== 'all') {
      result = result.filter(applicant => applicant.job_opening_id.toString() === jobFilter);
    }
    
    setFilteredApplicants(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, jobFilter, applicants]);

  const handleResumeDownload = async (applicant) => {
    try {
        const response = await downloadApplicantResume(applicant.id);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const contentDisposition = response.headers['content-disposition'];
        let filename = `resume_${applicant.first_name}_${applicant.last_name}.pdf`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch && filenameMatch.length === 2) filename = filenameMatch[1];
        }
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err) {
        console.error("Resume download failed:", err);
        alert("Could not download resume.");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    setIsDetailOpen(true);
  };

  const handleOpenAddForm = () => {
    setIsEditMode(false);
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const handleEditApplicant = (applicant) => {
    setSelectedApplicant(applicant);
    setFormData({ ...applicant });
    setIsEditMode(true);
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleDeleteApplicant = async (id) => {
    if (window.confirm('Are you sure you want to delete this applicant?')) {
      try {
        await deleteApplicant(id);
         fetchData();
      } catch (err) {
        alert("Could not delete applicant.",err);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, organization_id: organizationId };

    try {
      if (isEditMode) {
        await updateApplicant(selectedApplicant.id, payload);
      } else {
        await createApplicant(payload);
      }
      setIsFormOpen(false);
       fetchData();
    } catch (err) {
      if (err.response && err.response.data.errors) {
        alert(`Error: \n${Object.values(err.response.data.errors).flat().join('\n')}`);
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleStatusUpdate = async (applicantId, newStatus) => {
    try {
        await updateApplicantStatus(applicantId, newStatus);
        fetchData();  
        if (selectedApplicant?.id === applicantId) {
            setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
        }
    } catch (err) {
        alert("Could not update status.",err);
    }
  };

  const getStatusInfo = (statusValue) => {
    return statusOptions.find(option => option.value === statusValue) || 
           { value: statusValue, label: statusValue, color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <FiLoader className="animate-spin text-indigo-600 h-12 w-12" />
        </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Applicant Tracking</h1>
          <button onClick={handleOpenAddForm} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <FiPlus className="mr-2" /> Add Applicant
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {statusOptions.map((status) => (<div key={status.value} className="bg-white rounded-lg shadow p-4"><div className="flex items-center"><div className={`rounded-full p-3 ${status.color}`}><FiUsers className="h-6 w-6" /></div><div className="ml-4"><h2 className="text-lg font-semibold text-gray-900">{applicants.filter(a => a.status === status.value).length}</h2><p className="text-sm text-gray-500">{status.label}</p></div></div></div>))}
        </div>
        <div className="bg-white rounded-lg shadow mb-6 p-4"><div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"><div className="relative flex-1 max-w-md"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiSearch className="h-5 w-5 text-gray-400" /></div><input type="text" placeholder="Search applicants..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"><select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All Statuses</option>{statusOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}</select><select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}><option value="all">All Job Openings</option>{jobOpenings.map(job => (<option key={job.id} value={job.id}>{job.title}</option>))}</select></div></div></div>
        <div className="bg-white shadow rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied For</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{currentItems.length > 0 ? (currentItems.map((applicant) => {const statusInfo = getStatusInfo(applicant.status);return (<tr key={applicant.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center"><span className="text-indigo-800 font-medium">{applicant.first_name[0]}{applicant.last_name[0]}</span></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{applicant.first_name} {applicant.last_name}</div><div className="text-sm text-gray-500">{applicant.email}</div></div></div></td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{applicant.job_opening?.title || 'N/A'}</div></td><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{new Date(applicant.applied_date).toLocaleDateString()}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.source}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>{statusInfo.label}</span></td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div className="flex justify-end space-x-2"><button onClick={() => handleViewApplicant(applicant)} className="text-indigo-600 hover:text-indigo-900"><FiEye className="h-5 w-5" /></button><button onClick={() => handleEditApplicant(applicant)} className="text-blue-600 hover:text-blue-900"><FiEdit className="h-5 w-5" /></button><button onClick={() => handleDeleteApplicant(applicant.id)} className="text-red-600 hover:text-red-900"><FiTrash2 className="h-5 w-5" /></button></div></td></tr>);})) : (<tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No applicants found.</td></tr>)}</tbody></table></div>{filteredApplicants.length > itemsPerPage && (<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"><div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"><div><p className="text-sm text-gray-700">Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredApplicants.length)}</span> of <span className="font-medium">{filteredApplicants.length}</span> results</p></div><div><nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination"><button onClick={() => paginate(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}><FiChevronLeft className="h-5 w-5" /></button>{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (<button key={page} onClick={() => paginate(page)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>{page}</button>))}<button onClick={() => paginate(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}><FiChevronRight className="h-5 w-5" /></button></nav></div></div></div>)}</div>
      </main>

      {isDetailOpen && selectedApplicant && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true"><div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsDetailOpen(false)}></div></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center"><h3 className="text-lg leading-6 font-medium text-gray-900">Applicant Details</h3><button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-500"><FiX className="h-6 w-6" /></button></div>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><h4 className="text-sm font-medium text-gray-500">Full Name</h4><p className="mt-1 text-sm text-gray-900">{selectedApplicant.first_name} {selectedApplicant.last_name}</p></div>
                    <div><h4 className="text-sm font-medium text-gray-500">Email</h4><p className="mt-1 text-sm text-gray-900">{selectedApplicant.email}</p></div>
                    <div><h4 className="text-sm font-medium text-gray-500">Phone</h4><p className="mt-1 text-sm text-gray-900">{selectedApplicant.phone}</p></div>
                    <div><h4 className="text-sm font-medium text-gray-500">Applied For</h4><p className="mt-1 text-sm text-gray-900">{selectedApplicant.job_opening?.title || 'N/A'}</p></div>
                    <div><h4 className="text-sm font-medium text-gray-500">Applied Date</h4><p className="mt-1 text-sm text-gray-900">{new Date(selectedApplicant.applied_date).toLocaleDateString()}</p></div>
                    <div><h4 className="text-sm font-medium text-gray-500">Source</h4><p className="mt-1 text-sm text-gray-900">{selectedApplicant.source}</p></div>
                    <div className="sm:col-span-2"><h4 className="text-sm font-medium text-gray-500">Status</h4><div className="mt-1 flex items-center"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusInfo(selectedApplicant.status).color}`}>{getStatusInfo(selectedApplicant.status).label}</span><select className="ml-3 block w-40 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={selectedApplicant.status} onChange={(e) => handleStatusUpdate(selectedApplicant.id, e.target.value)}>{statusOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></div></div>
                    <div className="sm:col-span-2"><h4 className="text-sm font-medium text-gray-500">Cover Letter</h4><p className="mt-1 text-sm text-gray-900">{selectedApplicant.cover_letter}</p></div>
                    <div className="sm:col-span-2"><h4 className="text-sm font-medium text-gray-500">Resume</h4><div className="mt-2"><button onClick={() => handleResumeDownload(selectedApplicant)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><FiDownload className="-ml-1 mr-2 h-5 w-5 text-gray-500" />Download Resume</button></div></div>
                  </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" onClick={() => handleEditApplicant(selectedApplicant)} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Edit</button>
                <button type="button" onClick={() => setIsDetailOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true"><div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsFormOpen(false)}></div></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center"><h3 className="text-lg leading-6 font-medium text-gray-900">{isEditMode ? 'Edit Applicant' : 'Add New Applicant'}</h3><button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-500"><FiX className="h-6 w-6" /></button></div>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div><label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label><input type="text" name="first_name" id="first_name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.first_name} onChange={handleInputChange} /></div>
                      <div><label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label><input type="text" name="last_name" id="last_name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.last_name} onChange={handleInputChange} /></div>
                      <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" id="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.email} onChange={handleInputChange} /></div>
                      <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label><input type="tel" name="phone" id="phone" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.phone} onChange={handleInputChange} /></div>
                      <div><label htmlFor="job_opening_id" className="block text-sm font-medium text-gray-700">Job Opening</label><select name="job_opening_id" id="job_opening_id" required className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.job_opening_id} onChange={handleInputChange}><option value="">Select a job opening</option>{jobOpenings.map(job => (<option key={job.id} value={job.id}>{job.title}</option>))}</select></div>
                      <div><label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</label><input type="text" name="source" id="source" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.source} onChange={handleInputChange} /></div>
                      <div><label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label><select name="status" id="status" className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.status} onChange={handleInputChange}>{statusOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></div>
                      <div><label htmlFor="resume_url" className="block text-sm font-medium text-gray-700">Resume URL</label><input type="url" name="resume_url" id="resume_url" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.resume_url} onChange={handleInputChange} /></div>
                      <div className="sm:col-span-2"><label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700">Cover Letter</label><textarea name="cover_letter" id="cover_letter" rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={formData.cover_letter} onChange={handleInputChange} /></div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">{isEditMode ? 'Update' : 'Create'} Applicant</button>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;