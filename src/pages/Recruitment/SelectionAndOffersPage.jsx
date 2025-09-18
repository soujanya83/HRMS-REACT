import React, { useState } from 'react';
import { HiPlus, HiOutlineBriefcase, HiOutlineUser, HiOutlineCalendar, HiOutlineCurrencyDollar, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlinePencil } from 'react-icons/hi';

// --- Mock Data (Simulates API responses) ---
const mockFinalCandidates = {
    '101': [ // Candidates for "Senior Frontend Developer"
        { id: 1, name: 'Sarah Johnson', avatar: 'SJ', feedback_score: 4.8, status: 'Awaiting Decision' },
        { id: 4, name: 'David Martinez', avatar: 'DM', feedback_score: 4.5, status: 'Awaiting Decision' },
        { id: 5, name: 'Emily White', avatar: 'EW', feedback_score: 4.2, status: 'Rejected' },
    ],
    '103': [ // Candidates for "Product Manager"
        { id: 3, name: 'Jessica Williams', avatar: 'JW', feedback_score: 4.9, status: 'Offer Extended' },
        { id: 6, name: 'Daniel Brown', avatar: 'DB', feedback_score: 4.6, status: 'Awaiting Decision' },
    ],
};
const mockOffers = [
    { id: 1, applicant_name: 'Jessica Williams', job_title: 'Product Manager', offer_date: '2025-09-15', status: 'Accepted' },
    { id: 2, applicant_name: 'Another Candidate', job_title: 'Backend Engineer', offer_date: '2025-09-16', status: 'Sent' },
    { id: 3, applicant_name: 'Third Person', job_title: 'UX Designer', offer_date: '2025-09-12', status: 'Declined' },
];
const mockJobOpenings = [
    { id: 101, title: 'Senior Frontend Developer' },
    { id: 103, title: 'Product Manager' },
];

// --- Main Page Component ---
const SelectionAndOffersPage = () => {
    const [selectedJobId, setSelectedJobId] = useState(mockJobOpenings[0]?.id || '');
    const [candidates, setCandidates] = useState(mockFinalCandidates[selectedJobId] || []);
    const [offers, setOffers] = useState(mockOffers);
    const [isOfferModalOpen, setOfferModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const handleJobChange = (e) => {
        const jobId = e.target.value;
        setSelectedJobId(jobId);
        setCandidates(mockFinalCandidates[jobId] || []);
    };

    const handleMakeOffer = (candidate) => {
        setSelectedCandidate(candidate);
        setOfferModalOpen(true);
    };

    const offerStatusClasses = {
        Sent: 'bg-blue-100 text-blue-800',
        Accepted: 'bg-green-100 text-green-800',
        Declined: 'bg-red-100 text-red-800',
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Selection & Offers</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Compare final candidates and manage job offers.
                        </p>
                    </div>
                    <div className="self-start sm:self-center">
                        <select
                            value={selectedJobId}
                            onChange={handleJobChange}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 font-semibold text-gray-800"
                        >
                            <option value="">Filter by Job Opening...</option>
                            {mockJobOpenings.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
                        </select>
                    </div>
                </div>

                {/* Candidate Comparison Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Final Candidates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {candidates.map(candidate => (
                            <CandidateCard key={candidate.id} candidate={candidate} onMakeOffer={handleMakeOffer} />
                        ))}
                    </div>
                </div>

                {/* Extended Offers Table */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Extended Offers</h2>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {offers.map(offer => (
                                        <tr key={offer.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{offer.applicant_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.job_title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{offer.offer_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offerStatusClasses[offer.status] || 'bg-gray-100'}`}>{offer.status}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-indigo-600 hover:text-indigo-900">View Offer</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <OfferFormModal 
                isOpen={isOfferModalOpen}
                onClose={() => setOfferModalOpen(false)}
                candidate={selectedCandidate}
            />
        </div>
    );
};

// --- Child Components ---
const CandidateCard = ({ candidate, onMakeOffer }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
        <div>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-800 font-bold text-lg">{candidate.avatar}</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-500">Feedback Score: <span className="font-semibold text-gray-700">{candidate.feedback_score} / 5.0</span></p>
                </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">Current Status: <span className="font-semibold">{candidate.status}</span></p>
        </div>
        <div className="mt-6 flex gap-2">
            <button
                onClick={() => onMakeOffer(candidate)}
                className="w-full flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:opacity-90"
            >
                <HiOutlineCheckCircle className="mr-2 h-5 w-5" /> Make Offer
            </button>
            <button className="w-full flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <HiOutlineXCircle className="mr-2 h-5 w-5" /> Reject
            </button>
        </div>
    </div>
);

const OfferFormModal = ({ isOpen, onClose, candidate }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Create Job Offer for {candidate.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><HiX size={24} /></button>
                </div>
                <form className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Salary / Compensation ($)" name="salary" type="number" placeholder="e.g., 80000" />
                        <FormInput label="Proposed Start Date" name="start_date" type="date" />
                    </div>
                    <FormInput label="Offer Expiration Date" name="expiration_date" type="date" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes / Custom Message</label>
                        <textarea rows="4" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:opacity-90">Send Offer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Helper Form Components ---
const FormInput = ({ label, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input id={name} name={name} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" />
    </div>
);

export default SelectionAndOffersPage;