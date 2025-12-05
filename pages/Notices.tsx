import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Notice } from '../types';

const Notices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    supabase.from('notices').select('*').order('created_at', {ascending: false}).then(({ data }) => {
        if(data) setNotices(data);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate__animated animate__fadeIn">
        <h2 className="text-4xl font-bold text-white mb-12 text-center text-glow">Announcements</h2>
        <div className="grid gap-8">
        {notices.length > 0 ? notices.map((n, idx) => (
            <div key={n.id} style={{ animationDelay: `${idx * 150}ms` }} className={`glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 animate__animated animate__fadeInUp bg-black/40 hover:bg-black/60`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${n.type === 'important' ? 'bg-red-500 shadow-[0_0_15px_red]' : n.type === 'opportunity' ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-blue-500 shadow-[0_0_15px_#3b82f6]'}`}></div>
                <div className="flex justify-between items-start mb-6 pl-4">
                    <h3 className="font-bold text-white text-2xl group-hover:text-emerald-400 transition-colors">{n.title}</h3>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-400 text-base leading-relaxed pl-4 whitespace-pre-wrap font-light">{n.body}</p>
            </div>
        )) : <div className="text-center text-gray-500 py-24 glass rounded-3xl border-dashed border border-white/10">No notices posted yet.</div>}
        </div>
    </div>
  );
};

export default Notices;