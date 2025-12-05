import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Paper, Subject } from '../types';
import { LoadingScreen } from '../components/LoadingScreen';

const Papers: React.FC = () => {
  const [stream, setStream] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSubjects = async (selectedStream: string) => {
    setLoading(true);
    setStream(selectedStream);
    const { data } = await supabase.from('past_papers').select('subject_name, subject_code').eq('stream', selectedStream);
    
    if (data) {
      const uniqueMap = new Map();
      data.forEach((item: any) => {
        if(!uniqueMap.has(item.subject_name)){
          uniqueMap.set(item.subject_name, { name: item.subject_name, code: item.subject_code, stream: selectedStream });
        }
      });
      setSubjects(Array.from(uniqueMap.values()));
    }
    setLoading(false);
  };

  const loadPapers = async (selectedSubject: Subject) => {
    setLoading(true);
    setSubject(selectedSubject);
    const { data } = await supabase.from('past_papers').select('*')
        .eq('stream', selectedSubject.stream)
        .eq('subject_name', selectedSubject.name)
        .order('year', {ascending: false});
    if(data) setPapers(data);
    setLoading(false);
  };

  const resetStream = () => {
    setStream(null);
    setSubject(null);
    setSubjects([]);
    setPapers([]);
  };

  const resetSubject = () => {
    setSubject(null);
    setPapers([]);
  };

  const filteredPapers = papers.filter(p => p.year.toString().includes(searchQuery));

  if (!stream) {
    return (
      <div className="animate__animated animate__fadeIn max-w-6xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Study Resources</h2>
            <p className="text-gray-400">Select your academic stream to access past papers and marking schemes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { id: 'science', color: 'blue', icon: 'microscope', label: 'Physical Science', desc: 'Physics, Chemistry, Combined Maths' },
                { id: 'commerce', color: 'emerald', icon: 'chart-pie', label: 'Commerce', desc: 'Accounting, Business, Econ' },
                { id: 'arts', color: 'amber', icon: 'theater-masks', label: 'Arts', desc: 'History, Sinhala, Logic' },
                { id: 'technology', color: 'violet', icon: 'microchip', label: 'Technology', desc: 'ET, SFT, ICT' }
            ].map((s) => (
                <div 
                    key={s.id} 
                    onClick={() => loadSubjects(s.id)}
                    className={`group relative p-8 glass rounded-[2rem] border border-white/5 cursor-pointer hover:border-${s.color}-500/30 bg-gradient-to-b from-white/[0.02] to-transparent hover:-translate-y-2 transition-all duration-300`}
                >
                    <div className={`w-16 h-16 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                        <i className={`fas fa-${s.icon} text-2xl`}></i>
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">{s.label}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
            ))}
        </div>
      </div>
    );
  }

  if (loading) return <LoadingScreen />;

  if (!subject) {
    return (
      <div className="animate__animated animate__fadeIn max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={resetStream} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <i className="fas fa-arrow-left"></i>
            </button>
            <h2 className="text-3xl font-bold text-white capitalize">{stream} <span className="text-gray-500">Subjects</span></h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub, idx) => (
              <div 
                key={idx}
                onClick={() => loadPapers(sub)}
                className="group flex items-center justify-between p-6 glass rounded-2xl border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all hover:bg-white/5"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <span className="font-bold text-lg">{sub.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{sub.name}</h3>
                        {sub.code && <p className="text-xs text-gray-500 font-mono">{sub.code}</p>}
                    </div>
                 </div>
                 <i className="fas fa-chevron-right text-gray-600 group-hover:text-emerald-500 transition-colors"></i>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeIn max-w-6xl mx-auto">
      <div className="glass sticky top-0 z-30 p-4 mb-8 rounded-2xl border border-white/10 backdrop-blur-xl flex flex-wrap gap-4 justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
            <button onClick={resetSubject} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"><i className="fas fa-arrow-left"></i></button>
            <div>
                <h3 className="text-lg font-bold text-white leading-none">{subject.name}</h3>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Archive Access</span>
            </div>
        </div>
        
        <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
            <input 
                type="text" 
                placeholder="Filter by Year..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-white/10 text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-emerald-500 outline-none w-48 transition-all focus:w-64"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPapers.map((p) => (
            <div key={p.id} className="glass border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl font-bold text-white">{p.year}</span>
                </div>
                
                <div className="relative z-10">
                    <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-4 border border-emerald-500/20">
                        {p.year} Exam
                    </div>
                    <h4 className="text-xl font-bold text-white mb-6">General Certificate of Education (Adv. Level)</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {p.paper_link ? (
                            <a href={p.paper_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-emerald-600 hover:text-white text-gray-300 text-sm font-medium transition-all border border-white/5">
                                <i className="fas fa-file-alt"></i> Paper
                            </a>
                        ) : <div className="text-center py-2.5 text-gray-600 text-xs uppercase font-bold">No Paper</div>}
                        
                        {p.marking_scheme_link ? (
                            <a href={p.marking_scheme_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-blue-600 hover:text-white text-gray-300 text-sm font-medium transition-all border border-white/5">
                                <i className="fas fa-check-circle"></i> Marking
                            </a>
                        ) : <div className="text-center py-2.5 text-gray-600 text-xs uppercase font-bold">No Marking</div>}
                    </div>
                </div>
            </div>
        ))}
        {filteredPapers.length === 0 && (
            <div className="col-span-full py-20 text-center">
                <div className="inline-block p-6 rounded-full bg-white/5 mb-4">
                    <i className="fas fa-search text-gray-600 text-2xl"></i>
                </div>
                <p className="text-gray-500">No resources found matching your criteria.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Papers;