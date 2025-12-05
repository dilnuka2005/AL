import React from 'react';
import { Link } from 'react-router-dom';

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass p-10 rounded-[2rem] max-w-xl w-full text-center">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <i className="fas fa-tools text-4xl text-emerald-500"></i>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Under Maintenance</h1>
        <p className="text-gray-400 mb-8">We are upgrading the system. Please check back later.</p>
        <Link to="/" className="text-emerald-500 hover:underline">Check Status</Link>
      </div>
    </div>
  );
};

export default Maintenance;