import React from 'react';
import { Home, List, Settings, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';

const SidebarItem = ({ icon: Icon, to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group relative",
        isActive 
          ? "bg-white text-black shadow-lg shadow-white/10" 
          : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
      )
    }
  >
    <Icon size={20} />
    <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
      {label}
    </span>
  </NavLink>
);

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-20 h-screen bg-[#0A0A0A] border-r border-gray-800/50 flex flex-col items-center py-8 gap-8 fixed left-0 top-0 justify-between">
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">
        <div className="grid grid-cols-2 gap-1 rotate-45">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      <nav className="flex flex-col gap-4">
        <SidebarItem icon={Home} to="/dashboard" label="Dashboard" />
        {user?.role !== 'viewer' && (
          <SidebarItem icon={List} to="/records" label="Records" />
        )}
      </nav>

      <div className="flex flex-col gap-4">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center w-12 h-12 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 group relative"
        >
          <LogOut size={20} />
          <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
