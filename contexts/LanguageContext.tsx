import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'si' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Sidebar
    'nav.home': 'Home',
    'nav.papers': 'Past Papers',
    'nav.results': 'Exam Results',
    'nav.schedules': 'Schedules',
    'nav.aitools': 'AI Tools',
    'nav.aitutor': 'AI Tutor',
    'nav.codelab': 'Code Lab',
    'nav.updates': 'Updates',
    'nav.notices': 'Notices',
    'nav.mobileapp': 'Mobile App',
    // Home
    'home.official': "Official Platform",
    'home.hero_title_1': "Master Your",
    'home.hero_title_2': "Advanced Level",
    'home.hero_desc': "The complete ecosystem for Sri Lankan students. Past papers, real-time results, and AI-powered tutoring in one place.",
    'home.btn_start': "Start Studying",
    'home.btn_ai': "AI Tutor",
    'home.updates_title': "Latest Updates",
    'home.view_all': "View All",
    'home.no_updates': "No recent updates",
    'home.system_alert': "System Alert",
    'home.quick_access': "Quick Access",
    'home.nav_papers': "Past Papers",
    'home.nav_papers_desc': "Full Archive",
    'home.nav_results': "Results",
    'home.nav_results_desc': "Check Online",
    'home.nav_timetable': "Time Table",
    'home.nav_timetable_desc': "Exam Dates",
    'home.nav_app': "Mobile App",
    'home.nav_app_desc': "Download",
  },
  si: {
    // Sidebar
    'nav.home': 'මුල් පිටුව',
    'nav.papers': 'පසුගිය ප්‍රශ්න පත්‍ර',
    'nav.results': 'විභාග ප්‍රතිඵල',
    'nav.schedules': 'කාලසටහන්',
    'nav.aitools': 'AI මෙවලම්',
    'nav.aitutor': 'AI ගුරුතුමා',
    'nav.codelab': 'කේත රසායනාගාරය',
    'nav.updates': 'යාවත්කාලීන',
    'nav.notices': 'දැනුම්දීම්',
    'nav.mobileapp': 'ජංගම යෙදුම',
    // Home
    'home.official': "නිල වේදිකාව",
    'home.hero_title_1': "ඔබේ උසස් පෙළ",
    'home.hero_title_2': "ජයගන්න",
    'home.hero_desc': "ශ්‍රී ලාංකික සිසුන් සඳහා වූ සම්පූර්ණ පරිසර පද්ධතිය. පසුගිය ප්‍රශ්න පත්‍ර, ප්‍රතිඵල සහ AI උපකාරක පන්ති එකම තැනකින්.",
    'home.btn_start': "පාඩම් කරන්න",
    'home.btn_ai': "AI ගුරුතුමා",
    'home.updates_title': "නව තොරතුරු",
    'home.view_all': "සියල්ල බලන්න",
    'home.no_updates': "නව තොරතුරු නොමැත",
    'home.system_alert': "පද්ධති පණිවිඩය",
    'home.quick_access': "ඉක්මන් පිවිසුම",
    'home.nav_papers': "පසුගිය ප්‍රශ්න පත්‍ර",
    'home.nav_papers_desc': "සම්පූර්ණ ලේඛනාගාරය",
    'home.nav_results': "ප්‍රතිඵල",
    'home.nav_results_desc': "මාර්ගගතව බලන්න",
    'home.nav_timetable': "විභාග කාලසටහන්",
    'home.nav_timetable_desc': "විභාග දින",
    'home.nav_app': "ජංගම යෙදුම",
    'home.nav_app_desc': "බාගත කරන්න",
  },
  ta: {
    // Sidebar
    'nav.home': 'முகப்பு',
    'nav.papers': 'கடந்த கால தாள்கள்',
    'nav.results': 'பரீட்சை பெறுபேறுகள்',
    'nav.schedules': 'கால அட்டவணைகள்',
    'nav.aitools': 'AI கருவிகள்',
    'nav.aitutor': 'AI ஆசிரியர்',
    'nav.codelab': 'குறியீடு ஆய்வகம்',
    'nav.updates': 'புதுப்பிப்புகள்',
    'nav.notices': 'அறிவிப்புகள்',
    'nav.mobileapp': 'மொபைல் செயலி',
    // Home
    'home.official': "அதிகாரப்பூர்வ தளம்",
    'home.hero_title_1': "உங்கள் உயர்தர பரீட்சையில்",
    'home.hero_title_2': "வெற்றி பெறுங்கள்",
    'home.hero_desc': "இலங்கை மாணவர்களுக்கான முழுமையான தளம். கடந்த கால வினாத்தாள்கள், முடிவுகள் மற்றும் AI கல்வி உதவி அனைத்தும் ஒரே இடத்தில்.",
    'home.btn_start': "கற்கத் தொடங்குங்கள்",
    'home.btn_ai': "AI ஆசிரியர்",
    'home.updates_title': "சமீபத்திய அறிவிப்புகள்",
    'home.view_all': "எல்லாவற்றையும் பார்",
    'home.no_updates': "சமீபத்திய அறிவிப்புகள் இல்லை",
    'home.system_alert': "முறைமை எச்சரிக்கை",
    'home.quick_access': "விரைவு அணுகல்",
    'home.nav_papers': "கடந்த கால தாள்கள்",
    'home.nav_papers_desc': "முழு ஆவணக்காப்பகம்",
    'home.nav_results': "பெறுபேறுகள்",
    'home.nav_results_desc': "ஆன்லைனில் சரிபார்க்கவும்",
    'home.nav_timetable': "கால அட்டவணை",
    'home.nav_timetable_desc': "பரீட்சை திகதிகள்",
    'home.nav_app': "மொபைல் செயலி",
    'home.nav_app_desc': "பதிவிறக்க",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
