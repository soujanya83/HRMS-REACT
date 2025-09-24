import React, { useState } from 'react';
import { HiPlus, HiChevronLeft, HiChevronRight, HiOutlineCalendar, HiOutlineClock, HiOutlineUser, HiOutlineVideoCamera, HiX } from 'react-icons/hi';

// --- Mock Data (Simulates API responses) ---
const mockInterviews = [
    { id: 1, applicant_name: 'Sarah Johnson', job_title: 'Senior Frontend Developer', interview_type: 'Technical Interview', date: '2025-09-20T10:00:00', interviewers: ['Dilnawaz Khan'] },
    { id: 2, applicant_name: 'Michael Chen', job_title: 'UX Designer', interview_type: 'Phone Screen', date: '2025-09-20T14:30:00', interviewers: ['Farhan Ansari'] },
    { id: 3, applicant_name: 'Jessica Williams', job_title: 'Product Manager', interview_type: 'Final Interview', date: '2025-09-22T11:00:00', interviewers: ['Tabrej Khan', 'HR Manager'] },
    { id: 4, applicant_name: 'David Martinez', job_title: 'Senior Frontend Developer', interview_type: 'HR Round', date: '2025-10-02T16:00:00', interviewers: ['HR Manager'] },
];

const mockApplicants = [
    { id: 1, name: 'Sarah Johnson' },
    { id: 2, name: 'Michael Chen' },
    { id: 3, name: 'Jessica Williams' },
];

const mockInterviewers = [
    { id: 1, name: 'aftab khan' },
    { id: 2, name: 'rizwan dizel' },
    { id: 3, name: 'raju dizel' },
    { id: 4, name: 'deepak' },
];

// --- Main Page Component ---
const InterviewSchedulingPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Default to Sep 2025
    const [interviews, setInterviews] = useState(mockInterviews);
    const [isSlideOverOpen, setSlideOverOpen] = useState(false);
    
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const handleSaveInterview = (interviewData) => {
        const newInterview = {
            id: Date.now(),
            ...interviewData,
        };
        setInterviews([...interviews, newInterview]);
        setSlideOverOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Interview Scheduling</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage and schedule interviews for all job applicants.
                        </p>
                    </div>
                    <button 
                        onClick={() => setSlideOverOpen(true)}
                        className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:opacity-90 self-start sm:self-center"
                    >
                        <HiPlus className="h-5 w-5" /> Schedule Interview
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-md lg:flex">
                    {/* Calendar View */}
                    <div className="lg:flex-1">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100"><HiChevronLeft className="h-5 w-5 text-gray-600" /></button>
                                    <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100"><HiChevronRight className="h-5 w-5 text-gray-600" /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-semibold">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1 mt-1">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border rounded-lg"></div>)}
                                {Array.from({ length: daysInMonth }).map((_, day) => {
                                    const date = day + 1;
                                    const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
                                    const interviewsForDay = interviews.filter(i => new Date(i.date).toDateString() === fullDate.toDateString());
                                    return (
                                        <div key={date} className="border rounded-lg p-2 h-24 flex flex-col">
                                            <span className="font-semibold">{date}</span>
                                            <div className="mt-1 overflow-y-auto text-xs space-y-1">
                                                {interviewsForDay.map(interview => (
                                                    <div key={interview.id} className="bg-blue-100 text-blue-800 p-1 rounded">
                                                        {interview.applicant_name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Interviews Sidebar */}
                    <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Interviews</h3>
                            <div className="space-y-4">
                                {interviews.sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 4).map(interview => (
                                    <div key={interview.id} className="flex items-start gap-4">
                                        <div className="bg-gray-100 p-3 rounded-lg">
                                            <HiOutlineCalendar className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{interview.applicant_name}</p>
                                            <p className="text-sm text-gray-600">{interview.job_title}</p>
                                            <p className="text-sm text-gray-500">{new Date(interview.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <InterviewFormSlideOver 
                isOpen={isSlideOverOpen}
                onClose={() => setSlideOverOpen(false)}
                onSave={handleSaveInterview}
            />
        </div>
    );
};

// --- Slide-Over Panel for Scheduling an Interview ---
const InterviewFormSlideOver = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        applicant_name: '',
        job_title: '',
        interview_type: 'Phone Screen',
        date: '',
        interviewers: [],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className={`fixed inset-0 overflow-hidden z-30 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                    <div className="w-screen max-w-md">
                        <form onSubmit={handleSubmit} className="h-full flex flex-col bg-white shadow-xl">
                            <div className="p-6 bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <h2 className="text-lg font-medium text-gray-900">Schedule New Interview</h2>
                                    <div className="ml-3 h-7 flex items-center">
                                        <button type="button" onClick={onClose} className="bg-white rounded-md text-gray-400 hover:text-gray-500">
                                            <HiX className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                <FormSelect label="Applicant" name="applicant_name" value={formData.applicant_name} onChange={handleChange}>
                                    <option value="">Select Applicant</option>
                                    {mockApplicants.map(app => <option key={app.id} value={app.name}>{app.name}</option>)}
                                </FormSelect>
                                <FormInput label="Job Title" name="job_title" value={formData.job_title} onChange={handleChange} />
                                <FormInput type="datetime-local" label="Date & Time" name="date" value={formData.date} onChange={handleChange} />
                                <FormSelect label="Interview Type" name="interview_type" value={formData.interview_type} onChange={handleChange}>
                                    <option>Phone Screen</option>
                                    <option>Technical Interview</option>
                                    <option>HR Round</option>
                                    <option>Final Interview</option>
                                </FormSelect>
                                <FormSelect label="Interviewer(s)" name="interviewers" value={formData.interviewers} onChange={handleChange} multiple>
                                    {mockInterviewers.map(interviewer => <option key={interviewer.id} value={interviewer.name}>{interviewer.name}</option>)}
                                </FormSelect>
                            </div>
                            <div className="flex-shrink-0 px-4 py-4 flex justify-end gap-4 border-t">
                                <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:opacity-90">Schedule</button>
                            </div>
                        </form>
                    </div>
                </section>
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
const FormSelect = ({ label, name, children, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select id={name} name={name} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm">
            {children}
        </select>
    </div>
);


export default InterviewSchedulingPage;
