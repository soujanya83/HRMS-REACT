import React, { useState, useEffect } from 'react';
import { 
    FaChartBar, 
    FaPrint,
    FaFileExcel,
    FaFilePdf,
    FaMoneyBillWave,
    FaUsers,
    FaCalculator,
    FaBuilding,
    FaUserTie,
    FaChartLine,
    FaChartPie,
    FaTable
} from 'react-icons/fa';

const PayrollReports = () => {
    const [reportPeriod, setReportPeriod] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });
    const [selectedReport, setSelectedReport] = useState('summary');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    // Report types
    const reportTypes = [
        { id: 'summary', name: 'Payroll Summary', icon: FaChartBar },
        { id: 'department', name: 'Department-wise', icon: FaBuilding },
        { id: 'employee', name: 'Employee Details', icon: FaUserTie },
        { id: 'tax', name: 'Tax Summary', icon: FaCalculator },
        { id: 'deductions', name: 'Deductions Report', icon: FaChartLine },
        { id: 'bonus', name: 'Bonus & Incentives', icon: FaChartPie }
    ];

    // Sample report data
    const sampleReportData = {
        summary: {
            title: 'Payroll Summary Report',
            period: 'February 2024',
            generated_date: new Date().toISOString().split('T')[0],
            stats: {
                total_employees: 45,
                total_basic_salary: 2450000,
                total_earnings: 3120000,
                total_deductions: 520000,
                net_payout: 2600000,
                average_salary: 57778,
                tax_amount: 285000
            },
            departments: [
                { name: 'Engineering', employees: 15, total_salary: 950000, avg_salary: 63333 },
                { name: 'Sales', employees: 8, total_salary: 480000, avg_salary: 60000 },
                { name: 'Marketing', employees: 6, total_salary: 340000, avg_salary: 56667 },
                { name: 'Design', employees: 5, total_salary: 260000, avg_salary: 52000 },
                { name: 'HR', employees: 4, total_salary: 220000, avg_salary: 55000 },
                { name: 'Finance', employees: 4, total_salary: 240000, avg_salary: 60000 },
                { name: 'Operations', employees: 3, total_salary: 160000, avg_salary: 53333 }
            ]
        },
        department: {
            title: 'Department-wise Payroll Report',
            period: 'February 2024',
            departments: [
                {
                    name: 'Engineering',
                    employees: 15,
                    basic_salary: 900000,
                    allowances: 300000,
                    deductions: 180000,
                    net_salary: 1020000,
                    tax: 120000
                },
                {
                    name: 'Sales',
                    employees: 8,
                    basic_salary: 384000,
                    allowances: 144000,
                    deductions: 72000,
                    net_salary: 456000,
                    tax: 48000
                },
                {
                    name: 'Marketing',
                    employees: 6,
                    basic_salary: 288000,
                    allowances: 108000,
                    deductions: 54000,
                    net_salary: 342000,
                    tax: 36000
                }
            ]
        },
        employee: {
            title: 'Employee Payroll Details',
            period: 'February 2024',
            employees: [
                {
                    id: 'EMP001',
                    name: 'John Smith',
                    department: 'Engineering',
                    basic_salary: 60000,
                    hra: 12000,
                    da: 9000,
                    other_allowances: 3000,
                    total_earnings: 84000,
                    pf: 7200,
                    esi: 1800,
                    tax: 9000,
                    other_deductions: 1000,
                    net_salary: 65000
                },
                {
                    id: 'EMP002',
                    name: 'Sarah Johnson',
                    department: 'Marketing',
                    basic_salary: 55000,
                    hra: 11000,
                    da: 8250,
                    other_allowances: 2750,
                    total_earnings: 77000,
                    pf: 6600,
                    esi: 1650,
                    tax: 7500,
                    other_deductions: 750,
                    net_salary: 60500
                }
            ]
        }
    };

    useEffect(() => {
        // Simulate loading report data
        setLoading(true);
        setTimeout(() => {
            setReportData(sampleReportData[selectedReport]);
            setLoading(false);
        }, 1000);
    }, [selectedReport]);

    const handleGenerateReport = () => {
        setLoading(true);
        setTimeout(() => {
            setReportData(sampleReportData[selectedReport]);
            setLoading(false);
        }, 1000);
    };

    const handleExport = (format) => {
        alert(`Exporting ${selectedReport} report in ${format.toUpperCase()} format`);
        // In real app, this would trigger download
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-IN').format(number);
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        <FaChartBar className="mr-3 text-blue-600" />
                        Payroll Reports
                    </h1>
                    <p className="text-gray-600">Generate and analyze payroll reports and analytics</p>
                </div>

                {/* Report Controls */}
                <div className="mb-6 p-4 bg-white shadow-lg rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={reportPeriod.start_date}
                                onChange={(e) => setReportPeriod(prev => ({ ...prev, start_date: e.target.value }))}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={reportPeriod.end_date}
                                onChange={(e) => setReportPeriod(prev => ({ ...prev, end_date: e.target.value }))}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Report Type
                            </label>
                            <select
                                value={selectedReport}
                                onChange={(e) => setSelectedReport(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {reportTypes.map(report => (
                                    <option key={report.id} value={report.id}>{report.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleGenerateReport}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                <FaChartBar /> {loading ? 'Generating...' : 'Generate Report'}
                            </button>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => handleExport('pdf')}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <FaFilePdf /> PDF
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <FaFileExcel /> Excel
                        </button>
                        <button
                            onClick={() => handleExport('print')}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <FaPrint /> Print
                        </button>
                    </div>
                </div>

                {/* Report Types Navigation */}
                <div className="mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {reportTypes.map((report) => {
                            const ReportIcon = report.icon;
                            return (
                                <button
                                    key={report.id}
                                    onClick={() => setSelectedReport(report.id)}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        selectedReport === report.id
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <ReportIcon className="mx-auto text-2xl mb-2" />
                                    <div className="text-sm font-medium text-center">{report.name}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Report Content */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto mb-8"></div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-24 bg-gray-300 rounded"></div>
                                ))}
                            </div>
                            <div className="h-64 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                ) : reportData ? (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Report Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{reportData.title}</h2>
                                    <p className="text-gray-600">
                                        Period: {reportData.period} | Generated: {new Date(reportData.generated_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {new Date(reportPeriod.start_date).toLocaleDateString()} - {new Date(reportPeriod.end_date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Report Body */}
                        <div className="p-6">
                            {selectedReport === 'summary' && (
                                <div>
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-blue-600">Total Employees</p>
                                                    <p className="text-2xl font-bold text-blue-800">{reportData.stats.total_employees}</p>
                                                </div>
                                                <FaUsers className="text-blue-500 text-xl" />
                                            </div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-green-600">Total Payout</p>
                                                    <p className="text-2xl font-bold text-green-800">{formatCurrency(reportData.stats.net_payout)}</p>
                                                </div>
                                                <FaMoneyBillWave className="text-green-500 text-xl" />
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-purple-600">Avg Salary</p>
                                                    <p className="text-2xl font-bold text-purple-800">{formatCurrency(reportData.stats.average_salary)}</p>
                                                </div>
                                                <FaCalculator className="text-purple-500 text-xl" />
                                            </div>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-orange-600">Total Tax</p>
                                                    <p className="text-2xl font-bold text-orange-800">{formatCurrency(reportData.stats.tax_amount)}</p>
                                                </div>
                                                <FaChartBar className="text-orange-500 text-xl" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Department Breakdown */}
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Breakdown</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Department</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employees</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Salary</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Avg Salary</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">% of Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {reportData.departments.map((dept, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{dept.employees}</td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(dept.total_salary)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(dept.avg_salary)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {((dept.total_salary / reportData.stats.total_basic_salary) * 100).toFixed(1)}%
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50 font-semibold">
                                                <tr>
                                                    <td className="px-4 py-3 text-sm text-gray-900">Total</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{reportData.stats.total_employees}</td>
                                                    <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(reportData.stats.total_basic_salary)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(reportData.stats.average_salary)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">100%</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {selectedReport === 'department' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Payroll Details</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Department</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employees</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Basic Salary</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Allowances</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Deductions</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tax</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Net Salary</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {reportData.departments.map((dept, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{dept.employees}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(dept.basic_salary)}</td>
                                                        <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(dept.allowances)}</td>
                                                        <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(dept.deductions)}</td>
                                                        <td className="px-4 py-3 text-sm text-orange-600">{formatCurrency(dept.tax)}</td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-blue-600">{formatCurrency(dept.net_salary)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {selectedReport === 'employee' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee Payroll Details</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Employee</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Department</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Basic Salary</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Earnings</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Deductions</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Net Salary</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {reportData.employees.map((emp, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                                            <div className="text-sm text-gray-500">{emp.id}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{emp.department}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(emp.basic_salary)}</td>
                                                        <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(emp.total_earnings)}</td>
                                                        <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(emp.pf + emp.esi + emp.tax + emp.other_deductions)}</td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-blue-600">{formatCurrency(emp.net_salary)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Placeholder for other report types */}
                            {!['summary', 'department', 'employee'].includes(selectedReport) && (
                                <div className="text-center py-12">
                                    <FaTable className="mx-auto text-4xl text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Report Preview</h3>
                                    <p className="text-gray-500">
                                        {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} report would be displayed here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <FaChartBar className="mx-auto text-4xl text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Report Generated</h3>
                        <p className="text-gray-500">Select a report type and generate to view the report.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayrollReports;