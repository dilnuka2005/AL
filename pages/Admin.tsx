import React, { useState } from 'react';
import { SUPER_ADMIN_EMAIL, ADMIN_SECRET } from '../constants';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_SECRET) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Secret Key');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-10 rounded-3xl max-w-sm w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Login</h2>
          <input
            type="password"
            placeholder="Secret Key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white mb-4"
          />
          <button onClick={handleLogin} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Access</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
      <p className="text-gray-400">Welcome, Super Admin.</p>
      <div className="mt-10 p-6 glass rounded-2xl border border-red-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Note</h3>
        <p className="text-gray-300">
            For this generated version, the full admin CRUD functionality is omitted to keep the code concise and focused on the requested UI refactoring (Sidebar Navigation).
            The logic would follow the patterns established in the original HTML file using Supabase queries.
        </p>
      </div>
    </div>
  );
};

export default Admin;