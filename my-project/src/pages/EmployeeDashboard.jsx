import { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeDashboard = ({ onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errors, setErrors] = useState({});

  // Transaction form data
  const [transactionData, setTransactionData] = useState({
    employee_id: 'EMP-1025',
    employee_name: 'Rohan Mehta',
    department: 'Marketing',
    expense_date: '',
    category: '',
    description: '',
    amount: '',
    currency: 'INR',
    ocr_data: {},
    attachment: null,
    status: 'Pending',
    submitted_at: new Date().toISOString()
  });

  // OCR data from Gemini API
  const [ocrData, setOcrData] = useState({
    vendor: '',
    date: '',
    total_amount: '',
    expense_type: ''
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

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
    // Set employee details from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setTransactionData(prev => ({
      ...prev,
      employee_id: `EMP-${Date.now()}`,
      employee_name: user.name || 'Employee Name',
      department: user.department || 'Technology'
    }));
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      // Simulate API call with dummy data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy transactions data
      const dummyTransactions = [
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
          status: 'Approved',
          submitted_at: '2025-10-04T11:22:00Z'
        },
        {
          id: 2,
          employee_id: 'EMP-1025',
          employee_name: 'Rohan Mehta',
          department: 'Marketing',
          expense_date: '2025-10-03',
          category: 'Travel',
          description: 'Taxi fare to client meeting',
          amount: 450,
          currency: 'INR',
          attachment: 'taxi_receipt.pdf',
          status: 'Pending',
          submitted_at: '2025-10-03T14:30:00Z'
        },
        {
          id: 3,
          employee_id: 'EMP-1025',
          employee_name: 'Rohan Mehta',
          department: 'Marketing',
          expense_date: '2025-10-02',
          category: 'Office Supplies',
          description: 'Stationery items for office',
          amount: 1200,
          currency: 'INR',
          attachment: 'stationery_receipt.pdf',
          status: 'Rejected',
          submitted_at: '2025-10-02T09:15:00Z'
        }
      ];
      
      setTransactions(dummyTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Expense date validation
    if (!transactionData.expense_date.trim()) {
      newErrors.expense_date = 'Expense date is required';
    } else {
      const selectedDate = new Date(transactionData.expense_date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.expense_date = 'Expense date cannot be in the future';
      }
    }

    // Category validation
    if (!transactionData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    // Description validation
    if (!transactionData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (transactionData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    }

    // Amount validation
    if (!transactionData.amount || transactionData.amount <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0';
    } else if (transactionData.amount > 100000) {
      newErrors.amount = 'Amount cannot exceed ₹1,00,000';
    }

    // Currency validation
    if (!transactionData.currency.trim()) {
      newErrors.currency = 'Currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionData({
      ...transactionData,
      [name]: value
    });
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // File upload handler with real Gemini API
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsScanning(true);
    setError('');

    try {
      // Convert file to base64
      const base64 = await convertToBase64(file);
      
      // Call Gemini API for OCR
      const ocrResult = await callGeminiAPI(base64, file.type);
      
      setOcrData(ocrResult);
      
      // Auto-fill form with OCR data
      setTransactionData(prev => ({
        ...prev,
        expense_date: ocrResult.date || '',
        amount: ocrResult.total_amount || '',
        description: ocrResult.description || `${ocrResult.expense_type} at ${ocrResult.vendor}`,
        category: mapExpenseTypeToCategory(ocrResult.expense_type),
        attachment: file.name,
        ocr_data: {
          vendor: ocrResult.vendor || '',
          date: ocrResult.date || '',
          total_amount: ocrResult.total_amount || '',
          expense_type: ocrResult.expense_type || ''
        }
      }));

      setSuccess('Receipt scanned successfully! Form auto-filled with extracted data.');
    } catch (error) {
      console.error('OCR Error:', error);
      if (error.message.includes('API key not found') || error.message.includes('not configured')) {
        setError('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
      } else {
        setError('Failed to scan receipt. Please fill the form manually.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };


  // Call Gemini API for OCR
  const callGeminiAPI = async (base64Data, mimeType) => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Fallback: Return mock data for testing
      console.warn('Gemini API key not configured. Using mock data for testing.');
      return {
        vendor: 'Sample Vendor',
        date: new Date().toISOString().split('T')[0],
        total_amount: 1500,
        expense_type: 'Food & Beverage',
        description: 'Mock receipt data - please configure API key for real OCR'
      };
    }

    // Using gemini-2.0-flash model for OCR

    const prompt = `
    Analyze this receipt image and extract the following information in JSON format:
    {
      "vendor": "Name of the business/vendor",
      "date": "Date from receipt in YYYY-MM-DD format",
      "total_amount": "Total amount as a number",
      "expense_type": "Type of expense (Food & Beverage, Travel, Office Supplies, etc.)",
      "description": "Brief description of the expense"
    }
    
    If any information is not clear or not found, use null for that field.
    Return only the JSON object, no additional text.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const extractedText = data.candidates[0].content.parts[0].text;
    
    try {
      // Clean the response text - remove markdown code blocks if present
      let cleanText = extractedText.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Parse the JSON response
      const ocrData = JSON.parse(cleanText);
      return {
        vendor: ocrData.vendor || '',
        date: ocrData.date || '',
        total_amount: ocrData.total_amount || '',
        expense_type: ocrData.expense_type || '',
        description: ocrData.description || ''
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', extractedText);
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse OCR results');
    }
  };

  // Map expense type to category
  const mapExpenseTypeToCategory = (expenseType) => {
    const mapping = {
      'Food & Beverage': 'Meal',
      'Travel': 'Travel',
      'Transportation': 'Transportation',
      'Office Supplies': 'Office Supplies',
      'Accommodation': 'Accommodation'
    };
    return mapping[expenseType] || 'Other';
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new transaction to dummy data
      const newTransaction = {
        id: Date.now(),
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        submitted_at: new Date().toISOString()
      };
      
      setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
      setSuccess('Transaction submitted successfully!');
      setShowAddTransaction(false);
      
      // Reset form
      setTransactionData({
        employee_id: transactionData.employee_id,
        employee_name: transactionData.employee_name,
        department: transactionData.department,
        expense_date: '',
        category: '',
        description: '',
        amount: '',
        currency: 'INR',
        attachment: null,
        status: 'Pending',
        submitted_at: new Date().toISOString()
      });
      setOcrData({
        vendor: '',
        date: '',
        total_amount: '',
        expense_type: ''
      });
    } catch (error) {
      console.error('Error submitting transaction:', error);
      setError('Failed to submit transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Pending':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'Rejected':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
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
              <h1 className="text-2xl font-bold text-white">Employee Dashboard</h1>
              <p className="text-sm text-white opacity-90">Submit and track your expense transactions</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddTransaction(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold transition-all hover:bg-gray-100 hover:shadow-lg focus:outline-none"
              >
                Add Transaction
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md">
            {success}
            <button
              onClick={() => setSuccess('')}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-300 text-gray-800 rounded-md">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
            <p className="text-sm text-gray-600">View all your submitted expense transactions</p>
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
                      Employee ID
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
                      Attachment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.employee_id}
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
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a href="#" className="text-blue-600 hover:text-blue-800">
                          {transaction.attachment}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Transaction Detail</h3>
                  <button
                    onClick={() => {
                      setShowAddTransaction(false);
                      setTransactionData({
                        employee_id: transactionData.employee_id,
                        employee_name: transactionData.employee_name,
                        department: transactionData.department,
                        expense_date: '',
                        category: '',
                        description: '',
                        amount: '',
                        currency: 'INR',
                        ocr_data: {},
                        attachment: null,
                        status: 'Pending',
                        submitted_at: new Date().toISOString()
                      });
                      setErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleSubmitTransaction} className="space-y-6">
                  {/* Receipt Upload Section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-800 font-medium">
                            {isScanning ? 'Scanning receipt...' : 'Scan Receipt (PDF/Image)'}
                          </span>
                          <input
                            id="file-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isScanning}
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                          Upload receipt to auto-fill form fields
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* OCR Data Display */}
                  {ocrData.vendor && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Extracted Data:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Vendor:</span> {ocrData.vendor}</div>
                        <div><span className="font-medium">Date:</span> {ocrData.date}</div>
                        <div><span className="font-medium">Amount:</span> ₹{ocrData.total_amount}</div>
                        <div><span className="font-medium">Type:</span> {ocrData.expense_type}</div>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Employee Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                      <input
                        type="text"
                        name="employee_id"
                        value={transactionData.employee_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employee Name</label>
                      <input
                        type="text"
                        name="employee_name"
                        value={transactionData.employee_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={transactionData.department}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Currency</label>
                      <select
                        name="currency"
                        value={transactionData.currency}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expense Date</label>
                      <input
                        type="date"
                        name="expense_date"
                        value={transactionData.expense_date}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.expense_date ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.expense_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.expense_date}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        name="category"
                        value={transactionData.category}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.category ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Meal">Meal</option>
                        <option value="Travel">Travel</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Accommodation">Accommodation</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input
                        type="number"
                        name="amount"
                        value={transactionData.amount}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.amount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Currency</label>
                      <select
                        name="currency"
                        value={transactionData.currency}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.currency ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                      {errors.currency && (
                        <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={transactionData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter expense description..."
                      required
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddTransaction(false);
                        setTransactionData({
                          employee_id: transactionData.employee_id,
                          employee_name: transactionData.employee_name,
                          department: transactionData.department,
                          expense_date: '',
                          category: '',
                          description: '',
                          amount: '',
                          currency: 'INR',
                          attachment: null,
                          status: 'Pending',
                          submitted_at: new Date().toISOString()
                        });
                        setErrors({});
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      {isLoading ? 'Submitting...' : 'Submit Transaction'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
