import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopBar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-transparent sticky top-0 z-10 backdrop-blur-sm">
      <h1 className="text-2xl font-semibold text-white tracking-tight">{title}</h1>

      <div className="flex items-center gap-6 flex-1 justify-end">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-2 border-l border-gray-800">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-white leading-tight">{user?.name}</span>
              <span className="text-[11px] text-gray-500 leading-tight uppercase tracking-widest">{user?.role}</span>
            </div>
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-gray-800 group-hover:border-gray-600 transition-colors">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name}&background=1a1a1a&color=fff`}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center">
                <ChevronDown size={10} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
