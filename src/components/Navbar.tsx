import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Volume2,
  VolumeX,
  Printer,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const { teacherProfile, updateTeacherProfile } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const toggleSound = () => {
    updateTeacherProfile({ soundEnabled: !teacherProfile.soundEnabled });
  };

  // Vietnamese formatted date
  const today = new Date();
  const dateString = today.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  // Capitalize first letter (thứ ...)
  const formattedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Mobile hamburger & Teacher Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-100 shrink-0">
                ∑
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                    Hệ thống quản trị
                  </span>
                  <span className="hidden sm:inline-block text-xs text-slate-600 font-medium">
                    TRỢ LÝ QUẢN TRỊ HỌC TẬP
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                  {teacherProfile.name}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-700 truncate flex items-center gap-1.5">
                  <span className="font-semibold text-indigo-700">{teacherProfile.subject}</span>
                  <span className="text-slate-400">•</span>
                  <span>{teacherProfile.schoolName} – {teacherProfile.branch}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Calendar Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-xl text-xs font-medium text-slate-600 border border-slate-200/60">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{formattedDate}</span>
            </div>

            {/* Quick sound toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={teacherProfile.soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
              className={`p-2.5 rounded-xl border transition-all text-sm font-medium flex items-center gap-1.5 cursor-pointer ${
                teacherProfile.soundEnabled
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {teacherProfile.soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden xl:inline text-xs">Âm thanh: Bật</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden xl:inline text-xs">Âm thanh: Tắt</span>
                </>
              )}
            </button>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              title="In trang hiện tại"
              className="p-2.5 sm:px-3.5 sm:py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline text-xs font-semibold">In trang</span>
            </button>

            {/* Quick Math Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Năm học 2026 - 2027</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
