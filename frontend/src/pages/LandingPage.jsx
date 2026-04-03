import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!loginData.email || !loginData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      const result = await login(loginData.email, loginData.password);
      
      if (!result.success) {
        setError(result.error || 'Invalid credentials');
        setLoading(false);
        return;
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!registerData.email || !registerData.name || !registerData.password) {
        setError('Email, name, and password are required');
        setLoading(false);
        return;
      }

      if (registerData.password !== registerData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const result = await register(
        registerData.email,
        registerData.name,
        registerData.password
      );
      
      if (!result.success) {
        setError(result.error || 'Registration failed');
        setLoading(false);
        return;
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center py-12 px-4 font-sans selection:bg-indigo-500/30">
      <div className="w-full max-w-lg bg-[#0D0D0D] border border-gray-800/50 rounded-[40px] p-12 shadow-2xl relative overflow-hidden group">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>

        {/* Header */}
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">Finance Dashboard</h1>
          <p className="text-gray-500 text-sm font-medium">Manage financial records with role-based access</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-900/40 p-1.5 rounded-2xl border border-gray-800/50 mb-8 relative z-10">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={cn(
              "flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all duration-300",
              activeTab === 'login'
                ? "bg-white text-black shadow-lg shadow-white/5"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            Login
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
            className={cn(
              "flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all duration-300",
              activeTab === 'register'
                ? "bg-white text-black shadow-lg shadow-white/5"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-500 relative z-10">
            {error}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label htmlFor="login-email" className="block text-[11px] text-gray-500 font-black uppercase tracking-[0.25em] ml-1 text-left">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full h-14 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-6 text-base text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all placeholder:text-gray-700"
                placeholder="you@example.com"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="login-password" className="block text-[11px] text-gray-500 font-black uppercase tracking-[0.25em] ml-1 text-left">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full h-14 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-6 text-base text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all placeholder:text-gray-700"
                placeholder="••••••"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full bg-indigo-600 border border-indigo-500/50 rounded-2xl text-white hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 active:scale-[0.98] text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : 'Login'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label htmlFor="reg-name" className="block text-[11px] text-gray-500 font-black uppercase tracking-[0.25em] ml-1 text-left">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className="w-full h-14 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-6 text-base text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all placeholder:text-gray-700"
                placeholder="John Doe"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="reg-email" className="block text-[11px] text-gray-500 font-black uppercase tracking-[0.25em] ml-1 text-left">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full h-14 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-6 text-base text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all placeholder:text-gray-700"
                placeholder="you@example.com"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="reg-password" className="block text-[11px] text-gray-500 font-black uppercase tracking-[0.25em] ml-1 text-left">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="w-full h-14 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-6 text-base text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all placeholder:text-gray-700"
                placeholder="••••••"
                disabled={loading}
                required
              />
              <p className="text-[11px] text-gray-600 font-bold ml-1">Min 8 chars, uppercase, lowercase, number & special char (!@#$%^&*)</p>
            </div>

            <div className="space-y-3">
              <label htmlFor="reg-confirm-password" className="block text-[11px] text-gray-500 font-black uppercase tracking-[0.25em] ml-1 text-left">
                Confirm Password
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                className="w-full h-14 bg-gray-900/40 border border-gray-800/50 rounded-2xl px-6 text-base text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition-all placeholder:text-gray-700"
                placeholder="••••••"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full bg-indigo-600 border border-indigo-500/50 rounded-2xl text-white hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 active:scale-[0.98] text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
