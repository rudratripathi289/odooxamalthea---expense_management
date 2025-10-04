import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CEODashboard = ({ onLogout }) => {
  const [highValueTransactions, setHighValueTransactions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalAction, setApprovalAction] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''}`
    },
    timeout: 10000,
  });

  // Dummy departments data with budgets
  const dummyDepartments = [
    { id: 1, name: 'Technology', budget: 500000 },
    { id: 2, name: 'Marketing', budget: 300000 },
    { id: 3, name: 'Finance', budget: 200000 },
    { id: 4, name: 'Human Resources', budget: 150000 },
    { id: 5, name: 'Operations', budget: 400000 }
  ];

  // Dummy high-value transactions (greater than 30% of department budget)
  const dummyHighValueTransactions = [
    {
      id: 1,
      employee_id: 'EMP-1025',
      employee_name: 'Rohan Mehta',
      department: 'Marketing',
      manager_name: 'Sarah Johnson',
      manager_approved: true,
      manager_comment: 'Approved - Strategic marketing campaign',
      expense_date: '2025-10-04',
      category: 'Marketing Campaign',
      description: 'Digital marketing campaign for Q4 product launch',
      amount: 120000, // 40% of Marketing budget (300,000)
      currency: 'INR',
      attachment: 'campaign_proposal.pdf',
      status: 'Pending CEO Approval',
      submitted_at: '2025-10-04T11:22:00Z',
      manager_approved_at: '2025-10-04T14:30:00Z',
      budget_percentage: 40.0,
      department_budget: 300000,
      ocr_data: {
        vendor: 'Digital Marketing Agency',
        date: '2025-10-04',
        total_amount: 120000,
        expense_type: 'Marketing Campaign'
      }
    },
    {
      id: 2,
      employee_id: 'EMP-1026',
      employee_name: 'Priya Sharma',
      department: 'Technology',
      manager_name: 'Mike Chen',
      manager_approved: true,
      manager_comment: 'Approved - Critical infrastructure upgrade',
      expense_date: '2025-10-03',
      category: 'Infrastructure',
      description: 'Server infrastructure upgrade for scalability',
      amount: 200000, // 40% of Technology budget (500,000)
      currency: 'INR',
      attachment: 'infrastructure_quote.pdf',
      status: 'Pending CEO Approval',
      submitted_at: '2025-10-03T09:15:00Z',
      manager_approved_at: '2025-10-03T11:45:00Z',
      budget_percentage: 40.0,
      department_budget: 500000,
      ocr_data: {
        vendor: 'Tech Solutions Inc',
        date: '2025-10-03',
        total_amount: 200000,
        expense_type: 'Infrastructure'
      }
    },
    {
      id: 3,
      employee_id: 'EMP-1027',
      employee_name: 'Amit Kumar',
      department: 'Operations',
      manager_name: 'Lisa Wang',
      manager_approved: true,
      manager_comment: 'Approved - Major equipment purchase',
      expense_date: '2025-10-02',
      category: 'Equipment',
      description: 'Manufacturing equipment for production line',
      amount: 150000, // 37.5% of Operations budget (400,000)
      currency: 'INR',
      attachment: 'equipment_invoice.pdf',
      status: 'Pending CEO Approval',
      submitted_at: '2025-10-02T16:45:00Z',
      manager_approved_at: '2025-10-02T18:20:00Z',
      budget_percentage: 37.5,
      department_budget: 400000,
      ocr_data: {
        vendor: 'Manufacturing Solutions',
        date: '2025-10-02',
        total_amount: 150000,
        expense_type: 'Equipment'
      }
    },
    {
      id: 4,
      employee_id: 'EMP-1028',
      employee_name: 'Deepa Singh',
      department: 'Finance',
      manager_name: 'John Smith',
      manager_approved: true,
      manager_comment: 'Approved - Financial software upgrade',
      expense_date: '2025-10-01',
      category: 'Software',
      description: 'Enterprise financial management software license',
      amount: 80000, // 40% of Finance budget (200,000)
      currency: 'INR',
      attachment: 'software_license.pdf',
      status: 'Pending CEO Approval',
      submitted_at: '2025-10-01T10:30:00Z',
      manager_approved_at: '2025-10-01T15:20:00Z',
      budget_percentage: 40.0,
      department_budget: 200000,
      ocr_data: {
        vendor: 'Finance Software Corp',
        date: '2025-10-01',
        total_amount: 80000,
        expense_type: 'Software License'
      }
    }
  ];

  // Fetch high-value transactions and departments
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHighValueTransactions(dummyHighValueTransactions);
      setDepartments(dummyDepartments);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load high-value transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle CEO approval/rejection
  const handleCEOApproval = async (transactionId, action) => {
    setSelectedTransaction(transactionId);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const submitCEOApproval = async () => {
    if (!approvalComment.trim()) {
      setError('Please provide a comment for your decision');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update transaction status
      setHighValueTransactions(prev => 
        prev.map(transaction => 
          transaction.id === selectedTransaction 
            ? { 
                ...transaction, 
                status: approvalAction === 'approve' ? 'Approved by CEO' : 'Rejected by CEO',
                ceo_comment: approvalComment,
                ceo_approved_at: new Date().toISOString(),
                final_approval: approvalAction === 'approve'
              }
            : transaction
        )
      );

      setSuccess(`Transaction ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      setApprovalComment('');
      setSelectedTransaction(null);
      setApprovalAction('');
    } catch (error) {
      console.error('Error processing CEO approval:', error);
      setError('Failed to process approval');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter transactions by department
  const filteredTransactions = selectedDepartment === 'all' 
    ? highValueTransactions 
    : highValueTransactions.filter(t => t.department.toLowerCase() === selectedDepartment.toLowerCase());

  // Calculate statistics
  const totalHighValueAmount = highValueTransactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = highValueTransactions.filter(t => t.status === 'Pending CEO Approval').reduce((sum, t) => sum + t.amount, 0);
  const approvedAmount = highValueTransactions.filter(t => t.status === 'Approved by CEO').reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate overall company budget and used budget
  const totalCompanyBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
  const totalBudgetUsed = highValueTransactions
    .filter(t => t.status === 'Approved by CEO' || t.status === 'Approved by Manager')
    .reduce((sum, t) => sum + t.amount, 0);
  const budgetUtilizationPercentage = totalCompanyBudget > 0 ? (totalBudgetUsed / totalCompanyBudget * 100).toFixed(1) : 0;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending CEO Approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved by CEO':
        return 'bg-green-100 text-green-800';
      case 'Rejected by CEO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get budget percentage color
  const getBudgetPercentageColor = (percentage) => {
    if (percentage >= 50) return 'text-red-600 font-bold';
    if (percentage >= 40) return 'text-orange-600 font-semibold';
    return 'text-yellow-600 font-medium';
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #C0E6F7 0%, #F0F8FF 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Header */}
      <div className="shadow-lg" style={{
        background: 'linear-gradient(135deg, #7AC1E4 0%, #36A9E1 100%)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">CEO Dashboard</h1>
              <p className="text-sm text-white opacity-90">High-value transactions requiring CEO approval (more than 30% of department budget)</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold transition-all hover:bg-gray-100 hover:shadow-lg focus:outline-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
            <button
              onClick={() => setSuccess('')}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* High-Value Transaction Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">H</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High-Value Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{highValueTransactions.length}</p>
                <p className="text-xs text-gray-500">₹{totalHighValueAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">P</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending CEO</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {highValueTransactions.filter(t => t.status === 'Pending CEO Approval').length}
                </p>
                <p className="text-xs text-gray-500">₹{pendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">A</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">CEO Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {highValueTransactions.filter(t => t.status === 'Approved by CEO').length}
                </p>
                <p className="text-xs text-gray-500">₹{approvedAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">₹</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Company Budget</p>
                <p className="text-2xl font-semibold text-gray-900">₹{totalCompanyBudget.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total allocated</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">U</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Budget Used</p>
                <p className="text-2xl font-semibold text-gray-900">₹{totalBudgetUsed.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{budgetUtilizationPercentage}% utilized</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Department Filter</h2>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name.toLowerCase()}>
                  {dept.name} (₹{dept.budget.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* High-Value Transactions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">High-Value Transactions</h2>
            <p className="text-sm text-gray-600">Transactions exceeding 30% of department budget requiring CEO approval</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget Impact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.employee_name}</div>
                        <div className="text-sm text-gray-500">{transaction.employee_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className={`font-semibold ${getBudgetPercentageColor(transaction.budget_percentage)}`}>
                            {transaction.budget_percentage}%
                          </div>
                          <div className="text-xs text-gray-500">
                            of ₹{transaction.department_budget.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.expense_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {transaction.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {transaction.status === 'Pending CEO Approval' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCEOApproval(transaction.id, 'approve')}
                              className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md hover:bg-green-100 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleCEOApproval(transaction.id, 'reject')}
                              className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {transaction.status !== 'Pending CEO Approval' && (
                          <span className="text-gray-500 text-sm">No action needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CEO Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  CEO {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
                </h3>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalComment('');
                    setSelectedTransaction(null);
                    setApprovalAction('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEO Comments (Required)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder={`Enter your CEO-level comments for ${approvalAction === 'approve' ? 'approval' : 'rejection'}...`}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalComment('');
                    setSelectedTransaction(null);
                    setApprovalAction('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCEOApproval}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  CEO {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CEODashboard;
