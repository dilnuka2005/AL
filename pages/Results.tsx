import React from 'react';

const Results: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto text-center py-16 animate__animated animate__fadeIn">
        <div className="w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-white shadow-[0_0_60px_rgba(16,185,129,0.2)] border border-white/10 glass">
            <i className="fas fa-medal text-6xl text-emerald-400"></i>
        </div>
        <h2 className="text-5xl font-extrabold text-white mb-6 text-glow">Examination Results</h2>
        <p className="text-gray-400 mb-12 text-lg">Access the official Department of Examinations portal directly.</p>
        
        <a href="https://www.doenets.lk/examresults" target="_blank" rel="noreferrer" className="block glass p-10 rounded-[2.5rem] hover:border-emerald-500/50 transition-all group hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(16,185,129,0.2)] relative overflow-hidden bg-black/40">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center justify-between relative z-10">
                <div className="text-left flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <i className="fas fa-shield-alt text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">G.C.E. A/L Results</h4>
                        <p className="text-sm text-gray-500 mt-1">Official Government Source</p>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-emerald-500 group-hover:text-white transition-all flex items-center justify-center border border-white/5">
                    <i className="fas fa-external-link-alt"></i>
                </div>
            </div>
        </a>
    </div>
  );
};

export default Results;