import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  School,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { loginWithCredentials, registerAccount, teacherProfile } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register extra states
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'login') {
      if (!username.trim() || !password) {
        setErrorMessage('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.');
        return;
      }
      setIsLoading(true);
      const res = await loginWithCredentials(username.trim(), password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } else {
      // Register
      if (!fullName.trim()) {
        setErrorMessage('Vui lòng nhập họ và tên của bạn.');
        return;
      }
      if (!username.trim() || username.trim().length < 3) {
        setErrorMessage('Tên đăng nhập phải có ít nhất 3 ký tự (không dấu, viết liền).');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Mật khẩu cần tối thiểu 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
        return;
      }

      setIsLoading(true);
      const res = await registerAccount(
        username.trim(),
        password,
        fullName.trim()
      );
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md my-auto">
        {/* Top Header & Branding */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-500/20 border border-indigo-400/20 mb-2">
            <span className="text-3xl font-black font-serif">∑</span>
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 inline-block">
              Hệ Thống Quản Trị Học Tập
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {teacherProfile.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium flex items-center justify-center gap-1.5">
              <School className="w-3.5 h-3.5 text-indigo-400" />
              <span>{teacherProfile.schoolName}</span>
              <span className="text-slate-600">•</span>
              <span>{teacherProfile.branch}</span>
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 border border-white/20 text-slate-800 space-y-6">
          {/* Tab Selector: Đăng nhập vs Đăng ký */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng Ký Tài Khoản</span>
            </button>
          </div>

          {/* Error notification banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* If Register: Full Name */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="block text-xs font-bold text-slate-700">
                  Họ và tên giáo viên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Thầy Kiều Cao Long"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Tên đăng nhập <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'login' ? 'Nhập tên đăng nhập của bạn' : 'Ví dụ: thaylong (viết liền không dấu)'}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Tối thiểu 6 ký tự' : 'Nhập mật khẩu'}
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* If Register: Confirm Password */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="block text-xs font-bold text-slate-700">
                  Xác nhận lại mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu vừa tạo"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập Vào Hệ Thống</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Tạo Tài Khoản Mới</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security & System Info Footer */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dữ liệu được bảo mật và mã hóa an toàn</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Hệ thống quản trị học tập dành riêng cho giáo viên môn Toán
          </p>
        </div>
      </div>
    </div>
  );
};
