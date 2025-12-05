import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import Papers from './pages/Papers';
import Results from './pages/Results';
import Timetable from './pages/Timetable';
import AITutor from './pages/AITutor';
import Notices from './pages/Notices';
import Apps from './pages/Apps';
import Admin from './pages/Admin';
import CodeGenerator from './pages/CodeGenerator';
import Maintenance from './pages/Maintenance';
import { BackgroundEffects } from './components/BackgroundEffects';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <HashRouter>
        <BackgroundEffects />
        <Routes>
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* Public Routes with Left Sidebar Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/results" element={<Results />} />
            <Route path="/timetables" element={<Timetable />} />
            <Route path="/ai-tutor" element={<AITutor />} />
            <Route path="/code-gen" element={<CodeGenerator />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/apps" element={<Apps />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;