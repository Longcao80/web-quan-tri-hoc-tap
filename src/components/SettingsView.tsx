import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from './ConfirmModal';
import {
  Settings,
  User,
  School,
  SlidersHorizontal,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
  Monitor,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Save,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  LogIn,
  LogOut,
  Globe,
  Database,
  ArrowRight,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    teacherProfile,
    updateTeacherProfile,
    exportDataJSON,
    importDataJSON,
    resetToSampleData,
    clearAllData,
    currentUser,
    cloudSyncStatus,
    lastSyncedAt,
    cloudError,
    loginGoogle,
    logoutGoogle,
    syncNowToCloud,
    syncNowFromCloud,
  } = useApp();

  // Teacher info form state
  const [profileForm, setProfileForm] = useState({
    name: teacherProfile.name,
    subject: teacherProfile.subject,
    schoolName: teacherProfile.schoolName,
    branch: teacherProfile.branch,
    schoolLevel: teacherProfile.schoolLevel,
    soundEnabled: teacherProfile.soundEnabled,
  });

  // Weights form state
  const [weightsForm, setWeightsForm] = useState(teacherProfile.gradingWeights);

  // Modals
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeacherProfile({
      name: profileForm.name.trim(),
      subject: profileForm.subject.trim(),
      schoolName: profileForm.schoolName.trim(),
      branch: profileForm.branch.trim(),
      schoolLevel: profileForm.schoolLevel.trim(),
      soundEnabled: profileForm.soundEnabled,
      gradingWeights: weightsForm,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataJSON(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Cài Đặt & Quản Trị Hệ Thống</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Tùy chỉnh thông tin giáo viên, cấu hình hệ số điểm, sao lưu và phục hồi dữ liệu
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã lưu thành công!</span>
          </div>
        )}
      </div>

      {/* Form: Teacher Profile & Grading Settings */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teacher Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Hồ Sơ Giáo Viên</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên giáo viên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Môn giảng dạy</label>
                <input
                  type="text"
                  required
                  value={profileForm.subject}
                  onChange={(e) => setProfileForm({ ...profileForm, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cấp học</label>
                <input
                  type="text"
                  required
                  value={profileForm.schoolLevel}
                  onChange={(e) => setProfileForm({ ...profileForm, schoolLevel: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên trường</label>
                <input
                  type="text"
                  required
                  value={profileForm.schoolName}
                  onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phân hiệu / Điểm trường</label>
                <input
                  type="text"
                  required
                  value={profileForm.branch}
                  onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={profileForm.soundEnabled}
                  onChange={(e) => setProfileForm({ ...profileForm, soundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {profileForm.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <span>Âm thanh phản hồi khi thao tác</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Phát âm thanh nhẹ khi hoàn thành tác vụ</p>
                </div>
              </label>
            </div>
          </div>

          {/* Grading Formula Weights Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Hệ Số Tính Điểm Trung Bình Môn Toán</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Điểm TB = (TX × {weightsForm.TX} + BT × {weightsForm.BT} + GK × {weightsForm.GK} + CK × {weightsForm.CK}) / ({weightsForm.TX + weightsForm.BT + weightsForm.GK + weightsForm.CK})
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-800">Kiểm tra thường xuyên (TX):</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={weightsForm.TX}
                  onChange={(e) => setWeightsForm({ ...weightsForm, TX: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-800">Bài tập định kỳ (BT):</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={weightsForm.BT}
                  onChange={(e) => setWeightsForm({ ...weightsForm, BT: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-800">Giữa kỳ (GK):</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={weightsForm.GK}
                  onChange={(e) => setWeightsForm({ ...weightsForm, GK: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-800">Cuối kỳ (CK):</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={weightsForm.CK}
                  onChange={(e) => setWeightsForm({ ...weightsForm, CK: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thông tin & Hệ số điểm</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Cloud Sync & External Data Update Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Cloud className="w-5 h-5 text-indigo-600" />
              <span>Cập Nhật Dữ Liệu Ra Ngoài & Đồng Bộ Đám Mây (Cloud Sync)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Lưu trữ dữ liệu ra cơ sở dữ liệu đám mây Firebase để sử dụng trên nhiều thiết bị (máy tính trường, máy tính ở nhà, điện thoại)
            </p>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã kết nối đám mây</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-medium">
                <CloudOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Chưa kết nối đám mây</span>
              </span>
            </div>
          )}
        </div>

        {/* User Account / Cloud Actions */}
        {currentUser ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'G'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {currentUser.displayName || 'Giáo viên'}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <div className="text-xs text-slate-500">
                  Lần đồng bộ gần nhất:
                </div>
                <div className="text-xs font-bold text-indigo-700">
                  {lastSyncedAt ? lastSyncedAt.toLocaleTimeString('vi-VN') + ' ' + lastSyncedAt.toLocaleDateString('vi-VN') : 'Vừa xong'}
                </div>
              </div>
            </div>

            {cloudError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                <strong>Thông báo:</strong> {cloudError}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => syncNowToCloud()}
                disabled={cloudSyncStatus === 'syncing'}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {cloudSyncStatus === 'syncing' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5" />
                )}
                <span>Đẩy dữ liệu hiện tại lên Đám mây (Đồng bộ ngay)</span>
              </button>

              <button
                type="button"
                onClick={() => syncNowFromCloud()}
                disabled={cloudSyncStatus === 'syncing'}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Tải dữ liệu từ Đám mây về máy này</span>
              </button>

              <button
                type="button"
                onClick={() => logoutGoogle()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  Kích hoạt cập nhật dữ liệu ra ngoài & đồng bộ trực tuyến
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hiện tại dữ liệu đang lưu trong bộ nhớ máy này. Để dữ liệu được cập nhật ra ngoài, tự động sao lưu an toàn trên đám mây và mở được trên máy tính khác hoặc điện thoại, thầy chỉ cần bấm nút đăng nhập bên dưới:
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => loginGoogle()}
                disabled={cloudSyncStatus === 'syncing'}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                {cloudSyncStatus === 'syncing' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Đăng nhập với Google để cập nhật dữ liệu ra ngoài</span>
              </button>
            </div>
          </div>
        )}

        {/* Detailed Guide Accordion */}
        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Hướng dẫn 2 cách cập nhật dữ liệu ra ngoài:</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[11px]">1</span>
                <span>Cách 1: Đồng bộ đám mây trực tuyến (Tự động)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Sau khi bấm <strong>Đăng nhập với Google</strong>, mỗi lần thầy tạo bài tập, sửa học sinh, nhập điểm hay điểm danh, dữ liệu sẽ <strong>tự động lưu ngay lập tức ra đám mây</strong>. Khi sang máy khác, thầy chỉ cần đăng nhập cùng tài khoản là có toàn bộ dữ liệu.
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[11px]">2</span>
                <span>Cách 2: Xuất file sao lưu .JSON hoặc .CSV (Thủ công)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Thầy có thể bấm <strong>"Tải file sao lưu (.json)"</strong> ở khung bên dưới để tải về máy tính file chứa toàn bộ dữ liệu. Thầy có thể lưu vào USB, gửi qua Zalo hoặc dùng nút <strong>"Phục hồi từ file JSON"</strong> trên máy tính khác.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup, Restore & Data Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sao Lưu & Phục Hồi Dữ Liệu Học Tập (Offline / LocalStorage)</span>
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          Toàn bộ dữ liệu được lưu an toàn trực tiếp trên trình duyệt của thầy mà không cần máy chủ. Để đảm bảo dữ liệu không bị thất lạc khi đổi máy tính, thầy nên định kỳ tải về file sao lưu JSON.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={exportDataJSON}
            className="p-4 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all cursor-pointer group"
          >
            <Download className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Tải file sao lưu (.json)</h4>
            <p className="text-[11px] text-slate-500 mt-1">Xuất toàn bộ học sinh, điểm số, bài tập</p>
          </button>

          {/* Import JSON */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition-all cursor-pointer group"
          >
            <Upload className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Phục hồi từ file JSON</h4>
            <p className="text-[11px] text-slate-500 mt-1">Khôi phục dữ liệu đã sao lưu trước đó</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Reset Defaults */}
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="p-4 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-200 rounded-xl text-left transition-all cursor-pointer group"
          >
            <RotateCcw className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Khôi phục dữ liệu mẫu</h4>
            <p className="text-[11px] text-slate-500 mt-1">Đặt lại các lớp Toán 8A, 8B, 9A mẫu</p>
          </button>

          {/* Clear All */}
          <button
            type="button"
            onClick={() => setIsClearConfirmOpen(true)}
            className="p-4 bg-slate-50 hover:bg-rose-50/60 border border-slate-200 hover:border-rose-200 rounded-xl text-left transition-all cursor-pointer group"
          >
            <Trash2 className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-rose-700 text-xs sm:text-sm">Xóa toàn bộ dữ liệu</h4>
            <p className="text-[11px] text-slate-500 mt-1">Xóa sạch danh sách để bắt đầu mới</p>
          </button>
        </div>
      </div>

      {/* Teacher Guide Card */}
      <div className="bg-indigo-50/60 border border-indigo-100 p-6 rounded-2xl text-xs text-indigo-950 space-y-2">
        <h4 className="font-bold text-sm flex items-center gap-2 text-indigo-900">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>Hướng Dẫn Thao Tác Nhanh Cho Thầy Kiều Cao Long</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
          <li><strong>Màn hình máy chiếu trên lớp:</strong> Có thể mở mục <em>Điểm danh</em> hoặc <em>Tiến độ học tập</em> và phóng to trình duyệt để cả lớp cùng quan sát.</li>
          <li><strong>Điểm danh nhanh:</strong> Nhấn nút "Tất cả có mặt", sau đó chỉ cần chạm vào những em vắng để đổi sang Có phép hoặc Vắng.</li>
          <li><strong>Theo dõi bài tập:</strong> Trong mục <em>Quản lý bài tập</em>, nhấn "Xem & Chấm bài" để tick nộp bài cho từng học sinh cực kỳ tiện lợi.</li>
          <li><strong>Báo cáo học kỳ:</strong> Vào mục <em>Báo cáo & Thống kê</em> để in văn bản hoàn chỉnh có tiêu đề trường THCS Thạch Thất 2 và chỗ ký duyệt.</li>
        </ul>
      </div>

      {/* Confirm Reset Defaults Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Khôi phục dữ liệu mẫu ban đầu?"
        message="Thao tác này sẽ thay thế dữ liệu hiện tại bằng dữ liệu bài tập và điểm số mẫu chuẩn cho môn Toán. Thầy có muốn tiếp tục?"
        confirmText="Khôi phục dữ liệu mẫu"
        onConfirm={() => {
          resetToSampleData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Confirm Clear All Modal */}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title="Cảnh báo: Xóa sạch toàn bộ dữ liệu?"
        message="Toàn bộ danh sách lớp học, học sinh, bài tập, điểm số và chuyên cần sẽ bị xóa sạch khỏi trình duyệt này. Thầy nên tải file sao lưu JSON trước khi thực hiện."
        confirmText="Tôi đồng ý xóa sạch"
        onConfirm={() => {
          clearAllData();
          setIsClearConfirmOpen(false);
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
};
