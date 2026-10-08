import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children, hideSidebar = false, showAuthLinks = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar showAuthLinks={showAuthLinks} />
      <div className="flex-1 flex overflow-hidden">
        {!hideSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
