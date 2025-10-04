import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CFODashboard = ({ onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalAction, setApprovalAction] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [approvalStats, setApprovalStats] = useState({});

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

  // Dummy data for CFO transactions
  const dummyTransactions = [
    {
      id: 1,
      employee_id: 'EMP-1025',
      employee_name: 'Rohan Mehta',
      department: 'Marketing',
      manager_name: 'Sarah Johnson',
      manager_approved: true,
      manager_comment: 'Approved - Valid business expense',
      expense_date: '2025-10-04',
      category: 'Meal',
      description: 'Client meeting lunch at Café Metro',
      amount: 2350,
      currency: 'INR',
      attachment: 'receipt_oct04.pdf',
      status: 'Pending CFO Approval',
      submitted_at: '2025-10-04T11:22:00Z',
      manager_approved_at: '2025-10-04T14:30:00Z',
      ocr_data: {
        vendor: 'Café Metro',
        date: '2025-10-04',
        total_amount: 2350,
        expense_type: 'Food & Beverage'
      }
    },
    {
      id: 2,
      employee_id: 'EMP-1026',
      employee_name: 'Priya Sharma',
      department: 'Technology',
      manager_name: 'Mike Chen',
      manager_approved: true,
      manager_comment: 'Approved - Conference attendance',
      expense_date: '2025-10-03',
      category: 'Travel',
      description: 'Tech conference registration',
      amount: 15000,
      currency: 'INR',
      attachment: 'conference_receipt.pdf',
      status: 'Pending CFO Approval',
      submitted_at: '2025-10-03T09:15:00Z',
      manager_approved_at: '2025-10-03T11:45:00Z',
      ocr_data: {
        vendor: 'TechConf 2025',
        date: '2025-10-03',
        total_amount: 15000,
        expense_type: 'Professional Development'
      }
    },
    {
      id: 3,
      employee_id: 'EMP-1027',
      employee_name: 'Amit Kumar',
      department: 'Operations',
      manager_name: 'Lisa Wang',
      manager_approved: false,
      manager_comment: 'Rejected - Insufficient documentation',
      expense_date: '2025-10-02',
      category: 'Office Supplies',
      description: 'Stationery for office',
      amount: 1200,
      currency: 'INR',
      attachment: 'stationery_receipt.jpg',
      status: 'Rejected by Manager - CFO Review',
      submitted_at: '2025-10-02T16:45:00Z',
      manager_approved_at: null,
      ocr_data: {
        vendor: 'Office Depot',
        date: '2025-10-02',
        total_amount: 1200,
        expense_type: 'Office Supplies'
      }
    },
    {
      id: 4,
      employee_id: 'EMP-1028',
      employee_name: 'Deepa Singh',
      department: 'Finance',
      manager_name: 'John Smith',
      manager_approved: true,
      manager_comment: 'Approved - Training expense',
      expense_date: '2025-10-01',
      category: 'Training',
      description: 'Financial modeling course',
      amount: 25000,
      currency: 'INR',
      attachment: 'course_receipt.pdf',
      status: 'Pending CFO Approval',
      submitted_at: '2025-10-01T10:30:00Z',
      manager_approved_at: '2025-10-01T15:20:00Z',
      ocr_data: {
        vendor: 'Finance Academy',
        date: '2025-10-01',
        total_amount: 25000,
        expense_type: 'Professional Development'
      }
    },
    {
      id: 5,
      employee_id: 'EMP-1029',
      employee_name: 'Raj Patel',
      department: 'Human Resources',
      manager_name: 'Emily Davis',
      manager_approved: true,
      manager_comment: 'Approved - Team building event',
      expense_date: '2025-09-30',
      category: 'Team Building',
      description: 'Team lunch for department',
      amount: 5000,
      currency: 'INR',
      attachment: 'team_lunch_receipt.pdf',
      status: 'Pending CFO Approval',
      submitted_at: '2025-09-30T12:00:00Z',
      manager_approved_at: '2025-09-30T14:15:00Z',
      ocr_data: {
        vendor: 'Restaurant ABC',
        date: '2025-09-30',
        total_amount: 5000,
        expense_type: 'Team Building'
      }
    },
    {
      id: 6,
      employee_id: 'EMP-1030',
      employee_name: 'Sneha Gupta',
      department: 'Marketing',
      manager_name: 'Sarah Johnson',
      manager_approved: false,
      manager_comment: 'Rejected - Budget constraints',
      expense_date: '2025-09-29',
      category: 'Marketing',
      description: 'Social media advertising campaign',
      amount: 25000,
      currency: 'INR',
      attachment: 'advertising_quote.pdf',
      status: 'Rejected by Manager - CFO Review',
      submitted_at: '2025-09-29T10:30:00Z',
      manager_approved_at: null,
      ocr_data: {
        vendor: 'Digital Marketing Pro',
        date: '2025-09-29',
        total_amount: 25000,
        expense_type: 'Marketing Campaign'
      }
    }
  ];

  // Fetch transactions
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(dummyTransactions);
      calculateApprovalStats(dummyTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate approval statistics
  const calculateApprovalStats = (transactions) => {
    const stats = {
      total: transactions.length,
      managerApproved: transactions.filter(t => t.manager_approved).length,
      managerRejected: transactions.filter(t => !t.manager_approved).length,
      pendingCFO: transactions.filter(t => t.status === 'Pending CFO Approval').length,
      cfoReview: transactions.filter(t => t.status === 'Rejected by Manager - CFO Review').length,
      rejected: transactions.filter(t => t.status.includes('Rejected') && !t.status.includes('CFO Review')).length,
      approved: transactions.filter(t => t.status === 'Approved by CFO').length
    };
    
    stats.managerApprovalRate = stats.total > 0 ? ((stats.managerApproved / stats.total) * 100).toFixed(1) : 0;
    stats.cfoApprovalRate = (stats.pendingCFO + stats.cfoReview) > 0 ? ((stats.approved / (stats.approved + stats.pendingCFO + stats.cfoReview)) * 100).toFixed(1) : 0;
    
    setApprovalStats(stats);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle CFO approval/rejection
  const handleCFOApproval = async (transactionId, action) => {
    setSelectedTransaction(transactionId);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const submitCFOApproval = async () => {
    if (!approvalComment.trim()) {
      setError('Please provide a comment for your decision');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update transaction status
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === selectedTransaction 
            ? { 
                ...transaction, 
                status: approvalAction === 'approve' ? 'Approved by CFO' : 'Rejected by CFO',
                cfo_comment: approvalComment,
                cfo_approved_at: new Date().toISOString(),
                final_approval: approvalAction === 'approve',
                cfo_override: approvalAction === 'approve' && !transaction.manager_approved // Mark if CFO overrode manager rejection
              }
            : transaction
        )
      );

      setSuccess(`Transaction ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      setApprovalComment('');
      setSelectedTransaction(null);
      setApprovalAction('');
      
      // Recalculate stats
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === selectedTransaction 
          ? { 
              ...transaction, 
              status: approvalAction === 'approve' ? 'Approved by CFO' : 'Rejected by CFO',
              cfo_comment: approvalComment,
              cfo_approved_at: new Date().toISOString(),
              final_approval: approvalAction === 'approve'
            }
          : transaction
      );
      calculateApprovalStats(updatedTransactions);
    } catch (error) {
      console.error('Error processing CFO approval:', error);
      setError('Failed to process approval');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter transactions by department
  const filteredTransactions = selectedDepartment === 'all' 
    ? transactions 
    : transactions.filter(t => t.department.toLowerCase() === selectedDepartment.toLowerCase());

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
      case 'Pending CFO Approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved by CFO':
        return 'bg-green-100 text-green-800';
      case 'Rejected by CFO':
        return 'bg-red-100 text-red-800';
      case 'Rejected by Manager':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get manager approval badge color
  const getManagerApprovalBadgeColor = (managerApproved) => {
    return managerApproved 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
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
              <h1 className="text-2xl font-bold text-white">CFO Dashboard</h1>
              <p className="text-sm text-white opacity-90">Oversee all departmental expense approvals and final decisions</p>
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

        {/* Approval Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">T</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{approvalStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">M</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Manager Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{approvalStats.managerApproved}</p>
                <p className="text-xs text-gray-500">{approvalStats.managerApprovalRate}%</p>
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
                <p className="text-sm font-medium text-gray-500">Pending CFO</p>
                <p className="text-2xl font-semibold text-gray-900">{approvalStats.pendingCFO}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold">R</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{approvalStats.rejected}</p>
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
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
              <option value="technology">Technology</option>
              <option value="marketing">Marketing</option>
              <option value="human resources">Human Resources</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Expense Approvals</h2>
            <p className="text-sm text-gray-600">Review and approve expense requests from all departments</p>
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
                      Manager Status
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getManagerApprovalBadgeColor(transaction.manager_approved)}`}>
                          {transaction.manager_approved ? 'Approved' : 'Rejected'}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          by {transaction.manager_name}
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
                        {(transaction.status === 'Pending CFO Approval' || transaction.status === 'Rejected by Manager - CFO Review') && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCFOApproval(transaction.id, 'approve')}
                              className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md hover:bg-green-100 transition-colors"
                            >
                              {!transaction.manager_approved ? 'Override & Approve' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleCFOApproval(transaction.id, 'reject')}
                              className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {transaction.status !== 'Pending CFO Approval' && transaction.status !== 'Rejected by Manager - CFO Review' && (
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

      {/* CFO Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  CFO {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
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
                  CFO Comments (Required)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder={`Enter your CFO-level comments for ${approvalAction === 'approve' ? 'approval' : 'rejection'}...`}
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
                  onClick={submitCFOApproval}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  CFO {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CFODashboard;
