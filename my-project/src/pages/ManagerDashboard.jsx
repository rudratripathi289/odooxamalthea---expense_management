import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManagerDashboard = ({ onLogout }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalAction, setApprovalAction] = useState('');
  const [expenseStats, setExpenseStats] = useState({
    totalExpenses: 0,
    approvedExpenses: 0,
    pendingExpenses: 0,
    rejectedExpenses: 0,
    totalAmount: 0,
    approvedAmount: 0,
    pendingAmount: 0
  });

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

  // Dummy data for pending requests
  const dummyPendingRequests = [
    {
      id: 1,
      employee_id: 'EMP-1025',
      employee_name: 'Rohan Mehta',
      department: 'Marketing',
      expense_date: '2025-10-04',
      category: 'Meal',
      description: 'Client meeting lunch at Café Metro',
      amount: 2350,
      currency: 'INR',
      attachment: 'receipt_oct04.pdf',
      status: 'Pending',
      submitted_at: '2025-10-04T11:22:00Z',
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
      department: 'Marketing',
      expense_date: '2025-10-03',
      category: 'Travel',
      description: 'Taxi fare to client meeting',
      amount: 850,
      currency: 'INR',
      attachment: 'taxi_receipt.pdf',
      status: 'Pending',
      submitted_at: '2025-10-03T14:30:00Z',
      ocr_data: {
        vendor: 'Uber',
        date: '2025-10-03',
        total_amount: 850,
        expense_type: 'Transportation'
      }
    },
    {
      id: 3,
      employee_id: 'EMP-1027',
      employee_name: 'Amit Kumar',
      department: 'Marketing',
      expense_date: '2025-10-02',
      category: 'Office Supplies',
      description: 'Stationery for office',
      amount: 1200,
      currency: 'INR',
      attachment: 'stationery_receipt.jpg',
      status: 'Pending',
      submitted_at: '2025-10-02T16:45:00Z',
      ocr_data: {
        vendor: 'Office Depot',
        date: '2025-10-02',
        total_amount: 1200,
        expense_type: 'Office Supplies'
      }
    }
  ];

  // Calculate expense statistics
  const calculateExpenseStats = (requests) => {
    const stats = {
      totalExpenses: requests.length,
      approvedExpenses: requests.filter(r => r.status === 'Approved by Manager').length,
      pendingExpenses: requests.filter(r => r.status === 'Pending').length,
      rejectedExpenses: requests.filter(r => r.status === 'Rejected by Manager').length,
      totalAmount: requests.reduce((sum, r) => sum + (r.amount || 0), 0),
      approvedAmount: requests.filter(r => r.status === 'Approved by Manager').reduce((sum, r) => sum + (r.amount || 0), 0),
      pendingAmount: requests.filter(r => r.status === 'Pending').reduce((sum, r) => sum + (r.amount || 0), 0)
    };
    setExpenseStats(stats);
  };

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPendingRequests(dummyPendingRequests);
      calculateExpenseStats(dummyPendingRequests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setError('Failed to load pending requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // Handle approval/rejection
  const handleApproval = async (requestId, action) => {
    setSelectedRequest(requestId);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const submitApproval = async () => {
    if (!approvalComment.trim()) {
      setError('Please provide a comment for your decision');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the request status
      setPendingRequests(prev => 
        prev.map(request => 
          request.id === selectedRequest 
            ? { 
                ...request, 
                status: approvalAction === 'approve' ? 'Approved by Manager' : 'Rejected by Manager',
                manager_comment: approvalComment,
                approved_at: new Date().toISOString()
              }
            : request
        )
      );

      setSuccess(`Request ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowApprovalModal(false);
      setApprovalComment('');
      setSelectedRequest(null);
      setApprovalAction('');
      
      // Recalculate statistics
      const updatedRequests = pendingRequests.map(request => 
        request.id === selectedRequest 
          ? { 
              ...request, 
              status: approvalAction === 'approve' ? 'Approved by Manager' : 'Rejected by Manager',
              manager_comment: approvalComment,
              approved_at: new Date().toISOString()
            }
          : request
      );
      calculateExpenseStats(updatedRequests);
    } catch (error) {
      console.error('Error processing approval:', error);
      setError('Failed to process approval');
    } finally {
      setIsLoading(false);
    }
  };

  // Download CSV report
  const downloadCSVReport = () => {
    const csvData = pendingRequests.map(request => ({
      'Employee ID': request.employee_id,
      'Employee Name': request.employee_name,
      'Department': request.department,
      'Expense Date': request.expense_date,
      'Category': request.category,
      'Description': request.description,
      'Amount': request.amount,
      'Currency': request.currency,
      'Status': request.status,
      'Submitted At': request.submitted_at,
      'Vendor': request.ocr_data?.vendor || '',
      'OCR Amount': request.ocr_data?.total_amount || '',
      'OCR Type': request.ocr_data?.expense_type || ''
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employee_expense_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccess('CSV report downloaded successfully');
  };

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
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved by Manager':
        return 'bg-green-100 text-green-800';
      case 'Rejected by Manager':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <h1 className="text-2xl font-bold text-white">Manager Dashboard</h1>
              <p className="text-sm text-white opacity-90">Review and approve employee expense requests</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={downloadCSVReport}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold transition-all hover:bg-gray-100 hover:shadow-lg focus:outline-none"
              >
                Download CSV Report
              </button>
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

        {/* Expense Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">T</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-semibold text-gray-900">{expenseStats.totalExpenses}</p>
                <p className="text-xs text-gray-500">₹{expenseStats.totalAmount.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{expenseStats.approvedExpenses}</p>
                <p className="text-xs text-gray-500">₹{expenseStats.approvedAmount.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{expenseStats.pendingExpenses}</p>
                <p className="text-xs text-gray-500">₹{expenseStats.pendingAmount.toLocaleString()}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{expenseStats.rejectedExpenses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pending Approval Requests</h2>
            <p className="text-sm text-gray-600">Review and approve expense requests from your team</p>
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
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
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.employee_name}</div>
                        <div className="text-sm text-gray-500">{request.employee_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.expense_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {request.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(request.amount, request.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(request.id, 'approve')}
                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md hover:bg-green-100 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(request.id, 'reject')}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'} Request
                </h3>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalComment('');
                    setSelectedRequest(null);
                    setApprovalAction('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Required)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder={`Enter your comments for ${approvalAction === 'approve' ? 'approval' : 'rejection'}...`}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalComment('');
                    setSelectedRequest(null);
                    setApprovalAction('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApproval}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
