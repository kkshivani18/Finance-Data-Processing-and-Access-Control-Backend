import React from 'react';
import Sidebar from './dashboard/Sidebar';
import TopBar from './dashboard/TopBar';

const Layout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      <Sidebar />
      
      <main className="flex-1 ml-20">
        <TopBar title={title} />
        
        <div className="p-8 w-full max-w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
