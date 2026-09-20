import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { DashboardView } from './components/DashboardView';
import { ClassesView } from './components/ClassesView';
import { StudentsView } from './components/StudentsView';
import { AssignmentsView } from './components/AssignmentsView';
import { GradesView } from './components/GradesView';
import { ProgressView } from './components/ProgressView';
import { AttendanceView } from './components/AttendanceView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab, teacherProfile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'classes':
        return <ClassesView />;
      case 'students':
        return <StudentsView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'grades':
        return <GradesView />;
      case 'progress':
        return <ProgressView />;
      case 'attendance':
        return <AttendanceView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Top Navigation Bar */}
      <Navbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Main Body */}
      <div className="flex-1 flex flex-row">
        {/* Left Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Bottom Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 <strong>TRỢ LÝ QUẢN TRỊ HỌC TẬP – THẦY KIỀU CAO LONG</strong>
          </span>
          <span>
            {teacherProfile.subject} THCS • {teacherProfile.schoolName} – {teacherProfile.branch}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
