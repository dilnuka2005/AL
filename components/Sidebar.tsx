import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const NavItem: React.FC<{ to: string; icon: string; label: string; expanded: boolean; onClick?: () => void }> = ({ to, icon, label, expanded, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `relative flex items-center h-12 px-3 my-1 mx-2 rounded-xl transition-all duration-300 group overflow-hidden
      ${isActive 
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
        : 'text-gray-500 hover:text-gray-200 hover:bg-white/5 border border-transparent'
      }`
    }
  >
    <div className="min-w-[24px] flex items-center justify-center">
        <i className={`${icon} text-lg transition-transform group-hover:scale-110`}></i>
    </div>
    
    <span className={`ml-4 whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out
      ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-10 pointer-events-none'}
    `}>
        {label}
    </span>
    
    {!expanded && (
        <div className="absolute left-14 bg-[#111] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-xl">
            {label}
        </div>
    )}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-black/80 border border-white/10 rounded-xl text-white backdrop-blur-md shadow-2xl active:scale-95 transition-transform"
      >
        <i className="fas fa-bars text-xl"></i>
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar Container */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-[#080808] border-r border-white/5 backdrop-blur-xl
          flex flex-col py-6
          transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${isHovered ? 'lg:w-64 lg:shadow-[20px_0_50px_rgba(0,0,0,0.5)]' : 'lg:w-[4.5rem]'}
        `}
      >
        {/* Mobile Close Button (Inside Drawer) */}
        <div className="lg:hidden absolute top-4 right-4">
             <button onClick={() => setIsMobileOpen(false)} className="p-2 text-gray-400 hover:text-white">
                <i className="fas fa-times text-xl"></i>
             </button>
        </div>

        {/* Logo */}
        <div className="px-3 mb-8 flex items-center justify-start h-10 overflow-hidden shrink-0">
          <div className="w-10 h-10 min-w-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            DE
          </div>
          <div className={`ml-4 transition-all duration-300 ${isHovered || isMobileOpen ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="font-bold text-white text-lg leading-none tracking-tight">DE Edu<span className="text-emerald-500">.lk</span></h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1">
          <NavItem to="/" icon="fas fa-home" label={t('nav.home')} expanded={isHovered || isMobileOpen} onClick={() => setIsMobileOpen(false)} />
          <NavItem to="/papers" icon="fas fa-layer-group" label={t('nav.papers')} expanded={isHovered || isMobileOpen} onClick={() => setIsMobileOpen(false)} />
          <NavItem to="/results" icon="fas fa-medal" label={t('nav.results')} expanded={isHovered || isMobileOpen} onClick={() => setIsMobileOpen(false)} />
          <NavItem to="/timetables" icon="fas fa-clock" label={t('nav.schedules')} expanded={isHovered || isMobileOpen} onClick={() => setIsMobileOpen(false)} />
          
          <div className={`mt-6 mb-2 px-5 text-[10px] font-bold text-gray-600 uppercase tracking-widest transition-opacity duration-300 ${isHovered || isMobileOpen ? 'opacity-100' : 'opacity-0'}`}>
            {t('nav.aitools')}
          </div>
          
          <NavItem to="/ai-tutor" icon="fas fa-brain" label={t('nav.aitutor')} expanded={isHovered || isMobileOpen} onClick={() => setIsMobileOpen(false)} />
          <NavItem to="/code-gen" icon="fas fa-code" label={t('nav.codelab')} expanded={isHovered || isMobileOpen} onClick={() => setIsMobileOpen(false)} />
          
          <div className={`mt-6 mb-2 px-5 text-[10px] font-bold text-gray-600 uppercase tracking-widest transition-opacity duration-300 ${isHovered || isMobileOpen ? 'opacity-100' : 'opacity-0'}`}>
            {t('nav.updates')}
          </div>

          <NavItem to="/notices" icon="fas fa-bell" label={t('nav.notices')} expanded={isHovered || isMobileOpen} onClick={() => setIsMobileOpen(false)} />
          <NavItem to="/apps" icon="fas fa-mobile-android" label={t('nav.mobileapp')} expanded={isHovered || isMobileOpen} onClick={() => setIsMobileOpen(false)} />
        </nav>

        {/* Minimal Footer indicator */}
        <div className="mt-auto px-4 flex justify-center lg:justify-start shrink-0">
             <div className={`w-2 h-2 rounded-full ${isHovered ? 'bg-emerald-500' : 'bg-gray-700'} transition-colors duration-500`}></div>
        </div>
      </aside>
    </>
  );
};