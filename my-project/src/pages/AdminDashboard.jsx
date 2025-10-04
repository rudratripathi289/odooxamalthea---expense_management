import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showManageDepartments, setShowManageDepartments] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newDepartment, setNewDepartment] = useState('');
  const [newDepartmentBudget, setNewDepartmentBudget] = useState('');
  const [showBudgetOverview, setShowBudgetOverview] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editBudgetValue, setEditBudgetValue] = useState('');
  const [userErrors, setUserErrors] = useState({});
  const [departmentErrors, setDepartmentErrors] = useState({});

  // New user form data
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    managerId: '',
    department: ''
  });

  // API Configuration
  const API_BASE_URL = 'http://localhost:3000/api';
  
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''}`
    },
    timeout: 10000,
  });

  // Fetch users and departments on component mount
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.get(`/users?company_code=${userData.company_code || 'TEST'}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Fetching departments for company_code:', userData.company_code || 'TEST');
      const response = await api.get(`/departments?company_code=${userData.company_code || 'TEST'}`);
      console.log('Departments response:', response.data);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to fetch departments');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateUserForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userPayload = {
        ...newUser,
        company_code: userData.company_code || 'TEST'
      };
      console.log('Creating user with payload:', userPayload);
      const response = await api.post('/users', userPayload);
      console.log('User created:', response.data);
      setUsers(prevUsers => [...prevUsers, response.data]);
      setSuccess('User created successfully!');
      setShowAddUser(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        managerId: '',
        department: ''
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.error || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setSuccess('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      managerId: user.managerId || '',
      department: user.department || ''
    });
    setShowAddUser(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.put(`/users/${editingUser.id}`, newUser);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === editingUser.id 
            ? response.data
            : user
        )
      );
      
      setSuccess('User updated successfully!');
      setShowAddUser(false);
      setEditingUser(null);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        managerId: '',
        department: ''
      });
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.error || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUserForm = () => {
    const newErrors = {};

    // Name validation
    if (!newUser.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (newUser.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!newUser.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(newUser.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (only for new users)
    if (!editingUser && !newUser.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (newUser.password && newUser.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Role validation
    if (!newUser.role) {
      newErrors.role = 'Role is required';
    }

    // Department validation
    if (!newUser.department) {
      newErrors.department = 'Department is required';
    }

    setUserErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDepartmentForm = () => {
    const newErrors = {};

    if (!newDepartment.trim()) {
      newErrors.department = 'Department name is required';
    } else if (newDepartment.trim().length < 2) {
      newErrors.department = 'Department name must be at least 2 characters';
    } else if (departments.some(dept => dept.name.toLowerCase() === newDepartment.trim().toLowerCase())) {
      newErrors.department = 'Department already exists';
    }

    if (!newDepartmentBudget.trim()) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(parseFloat(newDepartmentBudget)) || parseFloat(newDepartmentBudget) <= 0) {
      newErrors.budget = 'Budget must be a positive number';
    } else if (parseFloat(newDepartmentBudget) < 1000) {
      newErrors.budget = 'Budget must be at least ₹1,000';
    }

    setDepartmentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Budget editing functions
  const handleEditBudget = (departmentId, currentBudget) => {
    setEditingBudget(departmentId);
    setEditBudgetValue(currentBudget.toString());
  };

  const handleSaveBudget = async (departmentId) => {
    if (!editBudgetValue.trim() || isNaN(parseFloat(editBudgetValue)) || parseFloat(editBudgetValue) <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.put(`/departments/${departmentId}/budget`, { 
        budget: parseFloat(editBudgetValue) 
      });
      
      setDepartments(prevDepartments => 
        prevDepartments.map(dept => 
          dept.id === departmentId 
            ? response.data
            : dept
        )
      );
      
      setEditingBudget(null);
      setEditBudgetValue('');
      setSuccess('Budget updated successfully!');
    } catch (error) {
      console.error('Error updating budget:', error);
      setError(error.response?.data?.error || 'Failed to update budget');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEditBudget = () => {
    setEditingBudget(null);
    setEditBudgetValue('');
  };

  // Department management functions
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateDepartmentForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Creating department with company_code:', userData.company_code || 'TEST');
      const response = await api.post('/departments', {
        name: newDepartment.trim(),
        budget: parseFloat(newDepartmentBudget),
        company_code: userData.company_code || 'TEST'
      });
      
      console.log('Department created:', response.data);
      setDepartments(prevDepartments => [...prevDepartments, response.data]);
      setNewDepartment('');
      setNewDepartmentBudget('');
      setSuccess('Department added successfully!');
    } catch (error) {
      console.error('Error adding department:', error);
      setError(error.response?.data?.error || 'Failed to add department');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department? This will affect all users in this department.')) {
      return;
    }

    try {
      await api.delete(`/departments/${departmentId}`);
      setDepartments(prevDepartments => 
        prevDepartments.filter(dept => dept.id !== departmentId)
      );
      setSuccess('Department deleted successfully!');
    } catch (error) {
      console.error('Error deleting department:', error);
      setError(error.response?.data?.error || 'Failed to delete department');
    }
  };

  // Get available roles for a department
  const getAvailableRoles = (departmentName) => {
    const department = departments.find(dept => dept.name === departmentName);
    return department ? department.roles : ['employee', 'manager'];
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'employee':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'finance':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
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
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-white opacity-90">Manage your company users and settings</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold transition-all hover:bg-gray-100 hover:shadow-lg focus:outline-none"
              >
                Add New User
              </button>
              <button
                onClick={() => setShowManageDepartments(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold transition-all hover:bg-gray-100 hover:shadow-lg focus:outline-none"
              >
                Manage Departments
              </button>
              <button
                onClick={() => setShowBudgetOverview(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold transition-all hover:bg-gray-100 hover:shadow-lg focus:outline-none"
              >
                Budget Overview
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

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg" style={{
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Company Users</h2>
            <p className="text-sm text-gray-600">Manage employees, managers, and finance users</p>
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.managerName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Delete
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

        {/* Add/Edit User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddUser(false);
                      setEditingUser(null);
                      setNewUser({
                        name: '',
                        email: '',
                        password: '',
                        role: 'employee',
                        managerId: '',
                        department: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => {
                        setNewUser({...newUser, name: e.target.value});
                        if (userErrors.name) {
                          setUserErrors({...userErrors, name: ''});
                        }
                      }}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        userErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {userErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{userErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => {
                        setNewUser({...newUser, email: e.target.value});
                        if (userErrors.email) {
                          setUserErrors({...userErrors, email: ''});
                        }
                      }}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        userErrors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {userErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{userErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => {
                        setNewUser({...newUser, password: e.target.value});
                        if (userErrors.password) {
                          setUserErrors({...userErrors, password: ''});
                        }
                      }}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        userErrors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={editingUser ? "Leave empty to keep current password" : ""}
                      required={!editingUser}
                    />
                    {userErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{userErrors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => {
                        setNewUser({...newUser, role: e.target.value});
                        if (userErrors.role) {
                          setUserErrors({...userErrors, role: ''});
                        }
                      }}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        userErrors.role ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={!newUser.department}
                    >
                      <option value="">Select Role</option>
                      {newUser.department && getAvailableRoles(newUser.department).map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                    {userErrors.role && (
                      <p className="mt-1 text-sm text-red-600">{userErrors.role}</p>
                    )}
                    {!newUser.department && !userErrors.role && (
                      <p className="mt-1 text-sm text-gray-500">Please select a department first</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      value={newUser.department}
                      onChange={(e) => {
                        const selectedDept = e.target.value;
                        setNewUser({
                          ...newUser, 
                          department: selectedDept,
                          role: 'employee' // Reset role when department changes
                        });
                        if (userErrors.department) {
                          setUserErrors({...userErrors, department: ''});
                        }
                      }}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        userErrors.department ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {userErrors.department && (
                      <p className="mt-1 text-sm text-red-600">{userErrors.department}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddUser(false);
                        setEditingUser(null);
                        setNewUser({
                          name: '',
                          email: '',
                          password: '',
                          role: 'employee',
                          managerId: '',
                          department: ''
                        });
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
                      {isLoading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Department Management Modal */}
        {showManageDepartments && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Departments</h3>
                  <button
                    onClick={() => {
                      setShowManageDepartments(false);
                      setNewDepartment('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                {/* Add Department Form */}
                <form onSubmit={handleAddDepartment} className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                      <input
                        type="text"
                        value={newDepartment}
                        onChange={(e) => {
                          setNewDepartment(e.target.value);
                          if (departmentErrors.department) {
                            setDepartmentErrors({...departmentErrors, department: ''});
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          departmentErrors.department ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter department name"
                        required
                      />
                      {departmentErrors.department && (
                        <p className="mt-1 text-sm text-red-600">{departmentErrors.department}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                      <input
                        type="number"
                        value={newDepartmentBudget}
                        onChange={(e) => {
                          setNewDepartmentBudget(e.target.value);
                          if (departmentErrors.budget) {
                            setDepartmentErrors({...departmentErrors, budget: ''});
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          departmentErrors.budget ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter budget amount"
                        min="1000"
                        step="1000"
                        required
                      />
                      {departmentErrors.budget && (
                        <p className="mt-1 text-sm text-red-600">{departmentErrors.budget}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      {isLoading ? 'Adding...' : 'Add Department'}
                    </button>
                  </div>
                </form>

                {/* Departments List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Existing Departments:</h4>
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <div className="font-medium text-gray-900">{dept.name}</div>
                        <div className="text-sm text-gray-500">
                          Budget: ₹{dept.budget?.toLocaleString() || 'Not set'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Available roles: {dept.roles.join(', ')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowManageDepartments(false);
                      setNewDepartment('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Overview Dialog */}
        {showBudgetOverview && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Department Budget Overview</h3>
                  <button
                    onClick={() => setShowBudgetOverview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                {/* Budget Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">T</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Departments</p>
                        <p className="text-2xl font-semibold text-gray-900">{departments.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold">₹</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Budget</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          ₹{departments.reduce((sum, dept) => sum + (dept.budget || 0), 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">A</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Average Budget</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          ₹{departments.length > 0 ? Math.round(departments.reduce((sum, dept) => sum + (dept.budget || 0), 0) / departments.length).toLocaleString() : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Department Budget Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Budget
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage of Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available Roles
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departments.map((dept) => {
                        const totalBudget = departments.reduce((sum, d) => sum + (d.budget || 0), 0);
                        const percentage = totalBudget > 0 ? ((dept.budget || 0) / totalBudget * 100).toFixed(1) : 0;
                        
                        return (
                          <tr key={dept.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingBudget === dept.id ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    value={editBudgetValue}
                                    onChange={(e) => setEditBudgetValue(e.target.value)}
                                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1000"
                                    step="1000"
                                  />
                                  <button
                                    onClick={() => handleSaveBudget(dept.id)}
                                    className="text-green-600 hover:text-green-800 text-sm"
                                    disabled={isLoading}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={handleCancelEditBudget}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm text-gray-900">
                                    ₹{(dept.budget || 0).toLocaleString()}
                                  </div>
                                  <button
                                    onClick={() => handleEditBudget(dept.id, dept.budget || 0)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    ✏️
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{percentage}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {dept.roles.join(', ')}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    onClick={() => setShowBudgetOverview(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
