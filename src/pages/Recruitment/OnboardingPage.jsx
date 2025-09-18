import React, { useState, useMemo } from 'react';
import { HiPlus, HiOutlineUser, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';

// --- Mock Data (Simulates API responses) ---
const mockNewHires = [
    { 
        id: 1, 
        name: 'Priya Sharma', 
        job_title: 'Senior Frontend Developer', 
        start_date: '2025-10-01', 
        manager: 'Dilnawaz Khan',
        tasks: [
            { id: 101, title: 'Sign Employment Contract', completed: true, category: 'Paperwork' },
            { id: 102, title: 'Submit ID and Bank Details', completed: true, category: 'Paperwork' },
            { id: 103, title: 'Setup Company Email Account', completed: true, category: 'IT Setup' },
            { id: 104, title: 'Assign Laptop & Assets', completed: false, category: 'IT Setup' },
            { id: 105, title: 'Introduction meeting with team', completed: false, category: 'Team Integration' },
        ]
    },
    { 
        id: 2, 
        name: 'Amit Singh', 
        job_title: 'Product Manager', 
        start_date: '2025-09-25',
        manager: 'Farhan Ansari',
        tasks: [
            { id: 201, title: 'Sign Employment Contract', completed: true, category: 'Paperwork' },
            { id: 202, title: 'Submit ID and Bank Details', completed: false, category: 'Paperwork' },
            { id: 203, title: 'Setup Company Email Account', completed: false, category: 'IT Setup' },
            { id: 204, title: 'Assign Laptop & Assets', completed: false, category: 'IT Setup' },
        ]
    },
];

// --- Main Page Component ---
const OnboardingPage = () => {
    const [newHires, setNewHires] = useState(mockNewHires);
    const [selectedHire, setSelectedHire] = useState(mockNewHires[0]);

    const handleSelectHire = (hire) => {
        setSelectedHire(hire);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">New Hire Onboarding</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Track and manage the onboarding process for new employees.
                        </p>
                    </div>
                    <button className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:opacity-90 self-start sm:self-center">
                        <HiPlus className="h-5 w-5" /> Start Onboarding
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: List of New Hires */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md">
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold">Onboarding Employees</h2>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {newHires.map(hire => (
                                    <NewHireListItem 
                                        key={hire.id} 
                                        hire={hire} 
                                        isSelected={selectedHire?.id === hire.id}
                                        onSelect={() => handleSelectHire(hire)}
                                    />
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Selected Hire's Checklist */}
                    <div className="lg:col-span-2">
                        {selectedHire ? (
                            <OnboardingChecklist hire={selectedHire} />
                        ) : (
                            <div className="bg-white rounded-xl shadow-md p-16 text-center">
                                <HiOutlineUser className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Select an Employee</h3>
                                <p className="mt-1 text-sm text-gray-500">Choose an employee from the list to view their onboarding checklist.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Child Components ---

const NewHireListItem = ({ hire, isSelected, onSelect }) => {
    const progress = useMemo(() => {
        const totalTasks = hire.tasks.length;
        if (totalTasks === 0) return 0;
        const completedTasks = hire.tasks.filter(t => t.completed).length;
        return Math.round((completedTasks / totalTasks) * 100);
    }, [hire.tasks]);

    return (
        <li onClick={onSelect} className={`p-4 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-indigo-50' : ''}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-gray-900">{hire.name}</p>
                    <p className="text-sm text-gray-500">{hire.job_title}</p>
                </div>
                <span className="text-sm font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </li>
    );
};

const OnboardingChecklist = ({ hire }) => {
    const tasksByCategory = useMemo(() => {
        return hire.tasks.reduce((acc, task) => {
            (acc[task.category] = acc[task.category] || []).push(task);
            return acc;
        }, {});
    }, [hire.tasks]);

    return (
        <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">{hire.name}</h2>
                <p className="text-sm text-gray-600">{hire.job_title} • Starts on {hire.start_date}</p>
            </div>
            <div className="p-6 space-y-6">
                {Object.entries(tasksByCategory).map(([category, tasks]) => (
                    <div key={category}>
                        <h3 className="text-md font-semibold text-gray-700 mb-2">{category}</h3>
                        <ul className="space-y-3">
                            {tasks.map(task => (
                                <li key={task.id} className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={task.completed} 
                                        readOnly 
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label className={`ml-3 text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                        {task.title}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OnboardingPage;