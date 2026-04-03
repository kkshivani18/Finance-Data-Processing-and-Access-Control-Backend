import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-400">Finance Dashboard</h1>
            
            <div className="flex gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className={`py-2 px-4 font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              
              {user?.role !== 'viewer' && (
                <button
                  onClick={() => navigate('/records')}
                  className={`py-2 px-4 font-medium transition-colors ${
                    isActive('/records')
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Financial Records
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-300">
              <span className="font-semibold">{user?.name}</span>
              <span className="text-gray-500 ml-2">({user?.role})</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
