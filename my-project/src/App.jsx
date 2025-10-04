import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CFODashboard from './pages/CFODashboard';
import CEODashboard from './pages/CEODashboard';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is logged in, show appropriate dashboard
  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard onLogout={handleLogout} />;
    }
    if (user.role === 'employee') {
      return <EmployeeDashboard onLogout={handleLogout} />;
    }
    if (user.role === 'manager') {
      return <ManagerDashboard onLogout={handleLogout} />;
    }
    if (user.role === 'cfo') {
      return <CFODashboard onLogout={handleLogout} />;
    }
    if (user.role === 'ceo') {
      return <CEODashboard onLogout={handleLogout} />;
    }
    // Add other role dashboards here (Finance, Director)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard for {user.role}</h1>
          <p className="text-gray-600 mb-4">This dashboard is under construction</p>
          <button
            onClick={handleLogout}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // If no user, show landing page
  return <LandingPage onLogin={handleLogin} />;
}

export default App
