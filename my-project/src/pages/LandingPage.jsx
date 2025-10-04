import { useState } from 'react';
import axios from 'axios';

const LandingPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    companyCode: '',
    country: 'India',
    adminName: '',
    role: 'admin'
  });

  const [errors, setErrors] = useState({});

  // API Configuration
  const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your backend URL
  
  // Create axios instance with default config
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
  });

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      console.log('Making API request:', config.method?.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      console.log('API response received:', response.status, response.data);
      return response;
    },
    (error) => {
      console.error('API response error:', error.response?.status, error.response?.data);
      return Promise.reject(error);
    }
  );

  // Country options for dropdown
  const countries = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 
    'Germany', 'France', 'Japan', 'Singapore', 'United Arab Emirates',
    'Brazil', 'Mexico', 'South Africa', 'Nigeria', 'Egypt'
  ];

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Register form validations
    if (!isLogin) {
      // Company name validation
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      } else if (formData.companyName.trim().length < 2) {
        newErrors.companyName = 'Company name must be at least 2 characters';
      }

      // Company code validation
      if (!formData.companyCode.trim()) {
        newErrors.companyCode = 'Company code is required';
      } else if (!/^[A-Z]{4}$/.test(formData.companyCode)) {
        newErrors.companyCode = 'Company code must be 4 uppercase letters';
      }

      // Admin name validation
      if (!formData.adminName.trim()) {
        newErrors.adminName = 'Admin name is required';
      } else if (formData.adminName.trim().length < 2) {
        newErrors.adminName = 'Admin name must be at least 2 characters';
      }

      // Country validation
      if (!formData.country.trim()) {
        newErrors.country = 'Country is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear general error
    if (error) setError('');
  };

  // API Functions using Axios
  const loginUser = async (loginData) => {
    try {
      const response = await api.post('/auth/login', loginData);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Login failed');
      }
    }
  };

  const registerCompany = async (registerData) => {
    try {
      const response = await api.post('/auth/register', registerData);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Registration failed');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Ensure role is always 'admin' for registration
      const submitData = {
        ...formData,
        role: isLogin ? formData.role : 'admin'
      };

      let response;
      if (isLogin) {
        // Make login API call to backend
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: submitData.email,
            password: submitData.password,
            role: submitData.role
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Login failed');
        }
        
        setSuccess('Login successful! Redirecting to dashboard...');
        
        // Store user data in localStorage with company_code
        const userData = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          company_code: result.user.company_code,
          company_name: result.user.company_name,
          token: 'jwt-token-' + Date.now()
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Call the login callback to update app state
        setTimeout(() => {
          onLogin(userData);
        }, 1500);
        
      } else {
        // Make register API call to backend
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            company_name: submitData.companyName,
            company_code: submitData.companyCode,
            country: submitData.country,
            admin_name: submitData.adminName,
            admin_email: submitData.email,
            password: submitData.password,
            role: 'admin'
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Registration failed');
        }
        
        setSuccess('Company registered successfully! You can now login.');
        
        // Switch to login form after successful registration
        setTimeout(() => {
          setIsLogin(true);
        setFormData({
          email: submitData.email,
          password: '',
          companyName: '',
          companyCode: '',
          adminName: '',
          country: 'India',
          role: 'admin'
        });
        }, 2000);
      }
      
    } catch (error) {
      console.error('API Error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{
      background: 'linear-gradient(135deg, #C0E6F7 0%, #F0F8FF 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'fadeIn 0.5s ease'
        }}>
          <div className="text-center py-10 px-8" style={{
            background: 'linear-gradient(135deg, #7AC1E4 0%, #36A9E1 100%)'
          }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'white' }}>
              {isLogin ? 'Welcome Back' : 'Register Company'}
            </h1>
            <p className="text-sm opacity-90" style={{ color: 'white' }}>
              {isLogin ? 'Sign in to your account' : 'Create your company account'}
            </p>
          </div>

          <div className="p-8">
            {/* Toggle Buttons */}
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md ${
                isLogin
                  ? 'text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              style={isLogin ? {
                background: 'linear-gradient(135deg, #7AC1E4 0%, #36A9E1 100%)'
              } : {
                background: '#f8f9fa'
              }}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md ${
                !isLogin
                  ? 'text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              style={!isLogin ? {
                background: 'linear-gradient(135deg, #7AC1E4 0%, #36A9E1 100%)'
              } : {
                background: '#f8f9fa'
              }}
            >
              Register
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-400 transition-all ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    style={{
                      fontSize: '15px',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="Enter company name"
                    required
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-600">{errors.companyName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Company Code (4 letters)
                  </label>
                  <input
                    type="text"
                    name="companyCode"
                    value={formData.companyCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-400 transition-all ${
                      errors.companyCode ? 'border-red-300' : 'border-gray-300'
                    }`}
                    style={{
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase'
                    }}
                    placeholder="ABCD"
                    maxLength="4"
                    required
                  />
                  {errors.companyCode && (
                    <p className="text-sm text-red-600">{errors.companyCode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-400 transition-all ${
                      errors.adminName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    style={{
                      fontSize: '15px',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="Enter admin name"
                    required
                  />
                  {errors.adminName && (
                    <p className="text-sm text-red-600">{errors.adminName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-400 transition-all ${
                      errors.country ? 'border-red-300' : 'border-gray-300'
                    }`}
                    style={{
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                      color: '#333'
                    }}
                    required
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-sm text-red-600">{errors.country}</p>
                  )}
                </div>
              </>
            )}

            {isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-400 transition-all"
                  style={{
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    color: '#333'
                  }}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="cfo">CFO</option>
                  <option value="ceo">CEO</option>
                </select>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Role
                </label>
                <div className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-md text-slate-600">
                  Admin (Company Owner)
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-400 transition-all ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                style={{
                  fontSize: '15px',
                  transition: 'all 0.3s ease'
                }}
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-400 transition-all ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                style={{
                  fontSize: '15px',
                  transition: 'all 0.3s ease'
                }}
                placeholder="Enter your password"
                required
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-4 rounded-lg focus:outline-none focus:ring-0 transition-all font-semibold ${
                  isLoading
                    ? 'cursor-not-allowed opacity-70'
                    : 'hover:transform hover:-translate-y-1 hover:shadow-lg'
                }`}
                style={{
                  background: isLoading 
                    ? 'linear-gradient(135deg, #7AC1E4 0%, #36A9E1 100%)'
                    : 'linear-gradient(135deg, #7AC1E4 0%, #36A9E1 100%)',
                  color: 'white',
                  fontSize: '16px',
                  transition: 'all 0.3s ease'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Logging in...' : 'Registering...'}
                  </div>
                ) : (
                  isLogin ? 'Login' : 'Register'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 font-semibold transition-colors"
                style={{
                  color: '#007BFF',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#1E90FF'}
                onMouseLeave={(e) => e.target.style.color = '#007BFF'}
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default LandingPage;
