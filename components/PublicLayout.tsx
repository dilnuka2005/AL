import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto w-full relative">
        <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12 max-w-7xl">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PublicLayout;