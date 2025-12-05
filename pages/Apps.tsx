import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { AppDownload } from '../types';

const Apps: React.FC = () => {
  const [apps, setApps] = useState<AppDownload[]>([]);

  useEffect(() => {
    supabase.from('app_downloads').select('*').then(({ data }) => {
        if(data) setApps(data);
    });
  }, []);

  const androidApp = apps.find(a => a.platform === 'android');
  const pcApp = apps.find(a => a.platform === 'pc');

  return (
    <div className="max-w-5xl mx-auto animate__animated animate__fadeIn">
         <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-glow">Download Our Apps</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Get the best experience with our dedicated applications for Android and Windows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4 mb-16">
            {/* Android */}
            <div className="glass p-10 rounded-[3rem] border border-white/10 hover:border-emerald-500/50 transition-all duration-500 group relative overflow-hidden bg-black/40 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)]">
                 <div className="relative z-10 flex flex-col items-center text-center h-full">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl flex items-center justify-center text-emerald-400 mb-8 border border-emerald-500/30 shadow-lg group-hover:scale-110 transition-transform">
                        <i className="fab fa-android text-5xl"></i>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Android App</h3>
                    {androidApp ? (
                        <div className="mt-auto w-full space-y-4">
                            <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">v{androidApp.version}</div>
                            <a href={androidApp.download_link} target="_blank" rel="noreferrer" className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg">Download APK</a>
                        </div>
                    ) : <p className="text-gray-500 mt-4">Coming Soon</p>}
                 </div>
            </div>

            {/* PC */}
            <div className="glass p-10 rounded-[3rem] border border-white/10 hover:border-blue-500/50 transition-all duration-500 group relative overflow-hidden bg-black/40 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)]">
                 <div className="relative z-10 flex flex-col items-center text-center h-full">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center text-blue-400 mb-8 border border-blue-500/30 shadow-lg group-hover:scale-110 transition-transform">
                        <i className="fab fa-windows text-5xl"></i>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Desktop App</h3>
                    {pcApp ? (
                        <div className="mt-auto w-full space-y-4">
                            <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-2">v{pcApp.version}</div>
                            <a href={pcApp.download_link} target="_blank" rel="noreferrer" className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg">Download EXE</a>
                        </div>
                    ) : <p className="text-gray-500 mt-4">Coming Soon</p>}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Apps;