import React from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import {
  LayoutDashboard,
  School,
  GraduationCap,
  BookOpenCheck,
  Award,
  TrendingUp,
  CalendarCheck,
  BarChart3,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  key: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, classes, students, assignments, overallStats } = useApp();

  const navItems: NavItem[] = [
    { key: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { key: 'classes', label: 'Lớp học', icon: School, badge: classes.length },
    { key: 'students', label: 'Học sinh', icon: GraduationCap, badge: students.length },
    {
      key: 'assignments',
      label: 'Bài tập',
      icon: BookOpenCheck,
      badge: overallStats.activeAssignments > 0 ? `${overallStats.activeAssignments} giao` : undefined,
    },
    { key: 'grades', label: 'Điểm số', icon: Award },
    { key: 'progress', label: 'Tiến độ', icon: TrendingUp },
    { key: 'attendance', label: 'Chuyên cần', icon: CalendarCheck },
    { key: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { key: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Sidebar header - mobile close */}
      <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            ∑
          </div>
          <span className="font-bold text-slate-800 text-sm">Quản Trị Học Tập</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation menu items */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-600 uppercase">
          Menu Điều Hướng
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => handleSelectTab(item.key)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-left font-medium">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-200/70 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Safety & LocalStorage Note in Footer */}
      <div className="p-4 m-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Lưu trữ nội bộ an toàn</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Dữ liệu học tập được lưu cục bộ trên thiết bị của thầy. Không truyền tải ra máy chủ bên ngoài.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200 no-print min-h-[calc(100vh-5rem)]">
        <div className="sticky top-20 h-[calc(100vh-5rem)]">{navContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
