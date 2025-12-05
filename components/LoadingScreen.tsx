import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate__animated animate__fadeIn">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 loader-ring w-full h-full"></div>
        <div className="absolute inset-2 border border-white/10 rounded-full"></div>
        <div className="absolute inset-4 loader-ring w-[calc(100%-32px)] h-[calc(100%-32px)]" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]"></div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-xl font-bold text-white tracking-[0.2em] uppercase">Loading</h3>
        <p className="text-xs text-emerald-500 font-mono animate-pulse">Initializing System...</p>
      </div>
    </div>
  );
};