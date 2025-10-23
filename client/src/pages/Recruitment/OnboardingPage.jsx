import React, { useState, useMemo } from 'react';
import { HiPlus, HiPencil, HiTrash, HiCheckCircle, HiX } from 'react-icons/hi';

 const mockTemplates = [
    { id: 1, name: 'New Developer Checklist', description: 'Standard checklist for all incoming software developers.' },
    { id: 2, name: 'Sales Team Onboarding', description: 'Tasks for new members of the sales and marketing team.' },
];
const mockTemplateTasks = {
    1: [  
        { id: 101, task_name: 'Sign Employment Contract & NDA', default_due_days: 1, default_assigned_role: 'HR' },
        { id: 102, task_name: 'Submit ID and Bank Details', default_due_days: 1, default_assigned_role: 'New Hire' },
        { id: 103, task_name: 'Setup Company Email & Slack', default_due_days: 0, default_assigned_role: 'IT Support' },
        { id: 104, task_name: 'Assign Laptop & Assets', default_due_days: 0, default_assigned_role: 'IT Support' },
        { id: 105, task_name: 'Introduction meeting with team', default_due_days: 2, default_assigned_role: 'Manager' },
    ],
    2: [  
        { id: 201, task_name: 'Sign Commission Agreement', default_due_days: 1, default_assigned_role: 'HR' },
        { id: 202, task_name: 'CRM Software Training', default_due_days: 3, default_assigned_role: 'Manager' },
    ]
};
const mockNewHires = [
    { 
        id: 1, 
        applicant: { first_name: 'Priya', last_name: 'Sharma', job_opening: { title: 'Senior Frontend Developer' } },
        start_date: '2025-10-01', 
        tasks: [
            { id: 101, task_name: 'Sign Employment Contract & NDA', due_date: '2025-10-02', status: 'completed' },
            { id: 102, task_name: 'Submit ID and Bank Details', due_date: '2025-10-02', status: 'completed' },
            { id: 103, task_name: 'Setup Company Email & Slack', due_date: '2025-10-01', status: 'in-progress' },
            { id: 104, task_name: 'Assign Laptop & Assets', due_date: '2025-10-01', status: 'pending' },
        ]
    },
    { 
        id: 2, 
        applicant: { first_name: 'Amit', last_name: 'Singh', job_opening: { title: 'Product Manager' } },
        start_date: '2025-09-25',
        tasks: [
            { id: 201, task_name: 'Sign Employment Contract', due_date: '2025-09-26', status: 'completed' },
            { id: 202, task_name: 'Submit ID and Bank Details', due_date: '2025-09-26', status: 'pending' },
        ]
    },
];

 const OnboardingPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">New Hire Onboarding</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage onboarding checklists and track new employee progress.
                        </p>
                    </div>
                </div>
                 <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('dashboard')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Onboarding Dashboard
                        </button>
                        <button onClick={() => setActiveTab('templates')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'templates' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Template Management
                        </button>
                    </nav>
                </div>

                <div className="mt-8">
                    {activeTab === 'dashboard' && <OnboardingDashboard />}
                    {activeTab === 'templates' && <TemplateManager />}
                </div>
            </div>
        </div>
    );
};

 const OnboardingDashboard = () => {
    const [newHires, setNewHires] = useState(mockNewHires);
    const [selectedHire, setSelectedHire] = useState(null);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newHires.map(hire => <NewHireCard key={hire.id} hire={hire} onSelect={() => setSelectedHire(hire)} />)}
            </div>
            {selectedHire && (
                <NewHireChecklistSlideOver 
                    hire={selectedHire}
                    isOpen={!!selectedHire}
                    onClose={() => setSelectedHire(null)}
                />
            )}
        </div>
    );
};

const NewHireCard = ({ hire, onSelect }) => {
    const progress = useMemo(() => {
        const totalTasks = hire.tasks.length;
        if (totalTasks === 0) return 0;
        const completedTasks = hire.tasks.filter(t => t.status === 'completed').length;
        return Math.round((completedTasks / totalTasks) * 100);
    }, [hire.tasks]);

    return (
        <div onClick={onSelect} className="bg-white rounded-xl shadow-md p-6 cursor-pointer transition transform hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold text-lg text-gray-900">{hire.applicant.first_name} {hire.applicant.last_name}</p>
                    <p className="text-sm text-gray-600">{hire.applicant.job_opening.title}</p>
                </div>
                <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-800 font-bold text-lg">{hire.applicant.first_name[0]}{hire.applicant.last_name[0]}</span>
                </div>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Start Date: {new Date(hire.start_date).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

 const TemplateManager = () => {
    const [templates, setTemplates] = useState(mockTemplates);
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Onboarding Templates</h2>
                <button className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition">
                    <HiPlus /> Create Template
                </button>
            </div>
            <ul className="divide-y divide-gray-200">
                {templates.map(template => (
                    <li key={template.id} className="py-4 flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-900">{template.name}</p>
                            <p className="text-sm text-gray-500">{template.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><HiPencil /></button>
                            <button className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-full"><HiTrash /></button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

 const NewHireChecklistSlideOver = ({ hire, isOpen, onClose }) => {
    const [tasks, setTasks] = useState(hire.tasks);

    const handleToggleTask = (taskId) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } : task
        ));
    };

    return (
        <div className={`fixed inset-0 overflow-hidden z-30 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                    <div className="w-screen max-w-md">
                        <div className="h-full flex flex-col bg-white shadow-xl">
                            <div className="p-6 bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">{hire.applicant.first_name}'s Onboarding</h2>
                                        <p className="text-sm text-gray-500">Due by {new Date(hire.start_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-3 h-7 flex items-center">
                                        <button type="button" onClick={onClose} className="bg-white rounded-md text-gray-400 hover:text-gray-500">
                                            <HiX className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                                {tasks.map(task => (
                                    <div key={task.id} className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id={`task-${task.id}`}
                                            checked={task.status === 'completed'}
                                            onChange={() => handleToggleTask(task.id)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor={`task-${task.id}`} className={`ml-3 text-sm ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                            {task.task_name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-shrink-0 px-4 py-4 flex justify-end gap-4 border-t">
                                <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OnboardingPage;