import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { ExamDate } from '../types';
import { SRI_LANKAN_HOLIDAYS } from '../constants';

const Timetable: React.FC = () => {
  const [dates, setDates] = useState<ExamDate[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    supabase.from('exam_dates').select('*').order('date', {ascending: true}).then(({ data }) => {
        if(data) setDates(data);
    });
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  return (
    <div className="max-w-6xl mx-auto animate__animated animate__fadeIn">
      <div className="text-center mb-10">
         <h2 className="text-4xl font-bold text-white mb-4">Schedules & Calendar</h2>
         <p className="text-gray-400">Sri Lankan Official Holidays & Exam Dates (2025-2028)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Exam List */}
        <div className="glass rounded-[2.5rem] p-10 border border-white/10 bg-black/40">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <i className="fas fa-list-ul text-emerald-500"></i> Upcoming Exams
            </h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {dates.length > 0 ? dates.map((d) => (
                    <div key={d.id} className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/10">
                        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-white shadow-inner border border-white/5 ${d.type === 'Exam' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}`}>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{new Date(d.date).toLocaleString('default', {month: 'short'})}</span>
                            <span className="text-2xl font-bold leading-none mt-1">{new Date(d.date).getDate()}</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-100 text-lg">{d.details}</h4>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border mt-2 inline-block ${d.type === 'Exam' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{d.type}</span>
                        </div>
                    </div>
                )) : <p className="text-gray-500">No specific exams scheduled.</p>}
            </div>
        </div>

        {/* Calendar Widget */}
        <div className="glass rounded-[2.5rem] p-8 border border-white/10 bg-black/40">
             <div className="flex justify-between items-center mb-8">
                <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"><i className="fas fa-chevron-left"></i></button>
                <h3 className="text-2xl font-bold text-white">
                    <span className="text-emerald-400">{monthName}</span> {year}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"><i className="fas fa-chevron-right"></i></button>
            </div>

            <div className="grid grid-cols-7 gap-3 mb-4 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <span key={d} className="text-xs font-bold text-gray-500 uppercase tracking-wider">{d}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
                {blanks.map((_, i) => <div key={`blank-${i}`} className="aspect-square" />)}
                {days.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const holiday = SRI_LANKAN_HOLIDAYS[dateStr];
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                    return (
                        <div 
                            key={day} 
                            className={`
                                aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 border group
                                ${isToday ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg border-transparent' : 'bg-white/5 text-gray-300 border-white/5'}
                                ${holiday?.type === 'poya' ? 'border-yellow-500/50 bg-yellow-900/10' : ''}
                                ${holiday?.type === 'public' ? 'border-red-500/50 bg-red-900/10' : ''}
                                ${!holiday && !isToday ? 'hover:bg-white/10' : ''}
                            `}
                            title={holiday?.name}
                        >
                            <span className="text-sm font-bold">{day}</span>
                            {holiday && (
                                <>
                                    <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full shadow-sm ${holiday.type === 'poya' ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[10px] px-2 py-1 rounded-lg pointer-events-none z-10 border border-white/10">
                                        {holiday.name}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex gap-4 justify-center text-xs text-gray-400">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Poya Day</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Public Holiday</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;