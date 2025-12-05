import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { LoadingScreen } from '../components/LoadingScreen';
import { Notice } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [sysUpdate, setSysUpdate] = useState<any>(null);
  
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch System Update
      const { data: sysData } = await supabase.from('system_settings').select('value').eq('key', 'system_update').single();
      if (sysData?.value?.active) setSysUpdate(sysData.value);

      // Fetch Latest Notices
      const { data: noticeData } = await supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(3);
      if (noticeData) setRecentNotices(noticeData);

      // Simulate a bit of loading for animation showcase
      setTimeout(() => setLoading(false), 800);
    };
    fetchData();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate__animated animate__fadeIn">
      
      {/* Language Switcher */}
      <div className="flex justify-end mb-6">
        <div className="glass rounded-xl p-1 flex gap-1 border border-white/10">
            <button 
                onClick={() => setLanguage('si')} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'si' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                සිංහල
            </button>
            <button 
                onClick={() => setLanguage('ta')} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'ta' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                தமிழ்
            </button>
            <button 
                onClick={() => setLanguage('en')} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                English
            </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Hero Section - Spans 2 cols */}
        <div className="lg:col-span-2 relative bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-white/5 rounded-[2rem] p-8 md:p-12 overflow-hidden group shadow-2xl">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
           
           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">v2.0 Beta</span>
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                <span className="text-gray-400 text-xs font-medium">{t('home.official')}</span>
             </div>
             
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
               {t('home.hero_title_1')} <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-glow">{t('home.hero_title_2')}</span>
             </h1>
             
             <p className={`text-gray-400 text-lg mb-8 max-w-lg leading-relaxed ${language === 'si' ? 'font-sinhala' : ''}`}>
               {t('home.hero_desc')}
             </p>
             
             <div className="flex flex-wrap gap-4">
               <Link to="/papers" className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2">
                 <span>{t('home.btn_start')}</span> <i className="fas fa-arrow-right text-sm"></i>
               </Link>
               <Link to="/ai-tutor" className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 hover:border-emerald-500/30 transition-all flex items-center gap-2">
                 <i className="fas fa-brain text-emerald-400"></i> <span>{t('home.btn_ai')}</span>
               </Link>
             </div>
           </div>
        </div>

        {/* Notices / Updates Panel */}
        <div className="glass rounded-[2rem] p-6 border border-white/5 flex flex-col relative overflow-hidden">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <i className="fas fa-bolt text-yellow-400"></i> {t('home.updates_title')}
             </h3>
             <Link to="/notices" className="text-xs text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-wide">{t('home.view_all')}</Link>
           </div>
           
           <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar max-h-[300px] lg:max-h-none">
             {recentNotices.length > 0 ? recentNotices.map((n) => (
               <div key={n.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-default">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      n.type === 'important' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      n.type === 'opportunity' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>{n.type}</span>
                    <span className="text-[10px] text-gray-500">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-200 group-hover:text-white mb-1 line-clamp-2">{n.title}</h4>
               </div>
             )) : (
               <div className="text-center text-gray-500 my-auto text-sm">{t('home.no_updates')}</div>
             )}
           </div>

           {sysUpdate && (
             <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-900/20 to-transparent border border-amber-500/20 flex items-start gap-3">
               <i className="fas fa-exclamation-triangle text-amber-500 mt-1"></i>
               <div>
                 <p className="text-xs font-bold text-amber-500 uppercase mb-1">{t('home.system_alert')}</p>
                 <p className="text-xs text-gray-300">{sysUpdate.message}</p>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Feature Navigation Grid */}
      <h3 className="text-lg font-bold text-gray-400 mb-6 px-2">{t('home.quick_access')}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { to: '/papers', label: t('home.nav_papers'), icon: 'fa-book-open', desc: t('home.nav_papers_desc'), color: 'emerald' },
           { to: '/results', label: t('home.nav_results'), icon: 'fa-poll', desc: t('home.nav_results_desc'), color: 'blue' },
           { to: '/timetables', label: t('home.nav_timetable'), icon: 'fa-calendar-alt', desc: t('home.nav_timetable_desc'), color: 'purple' },
           { to: '/apps', label: t('home.nav_app'), icon: 'fa-mobile-android', desc: t('home.nav_app_desc'), color: 'pink' },
         ].map((item, i) => (
           <Link key={i} to={item.to} className={`group relative p-6 glass rounded-2xl border border-white/5 hover:border-${item.color}-500/30 transition-all duration-300 hover:-translate-y-1`}>
              <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-400 mb-4 group-hover:scale-110 transition-transform`}>
                <i className={`fas ${item.icon} text-xl`}></i>
              </div>
              <h4 className="text-lg font-bold text-white mb-1">{item.label}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
              
              <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-${item.color}-500`}>
                <i className="fas fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
              </div>
           </Link>
         ))}
      </div>
    </div>
  );
};

export default Home;