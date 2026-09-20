import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProgressStatus } from '../types';
import {
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Award,
  Filter,
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { students, classes, getStudentProgress, exportToCSV } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const summaries = students.map((s) => getStudentProgress(s));

  const filteredSummaries = summaries.filter(({ student, status }) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassId === 'all' || student.classId === selectedClassId;
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const totalGood = summaries.filter((s) => s.status === 'Hoàn thành tốt').length;
  const totalInProgress = summaries.filter((s) => s.status === 'Đang thực hiện').length;
  const totalIncomplete = summaries.filter((s) => s.status === 'Chưa hoàn thành').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Theo Dõi Tiến Độ Học Tập Môn Toán</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Tổng hợp khách quan tỷ lệ hoàn thành bài tập và kết quả kiểm tra định kỳ của từng học sinh
          </p>
        </div>

        <button
          onClick={() => exportToCSV('summary')}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Xuất báo cáo tiến độ (CSV)</span>
        </button>
      </div>

      {/* 3 Status summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'Hoàn thành tốt' ? 'all' : 'Hoàn thành tốt')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'Hoàn thành tốt'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500'
              : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Hoàn thành tốt</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-800">{totalGood} HS</div>
          <p className="text-[11px] text-slate-500 mt-1">Tỷ lệ bài tập ≥ 80%, kết quả ổn định</p>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'Đang thực hiện' ? 'all' : 'Đang thực hiện')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'Đang thực hiện'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500'
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase tracking-wider">Đang thực hiện</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-800">{totalInProgress} HS</div>
          <p className="text-[11px] text-slate-500 mt-1">Đang hoàn thành các phiếu bài tập</p>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'Chưa hoàn thành' ? 'all' : 'Chưa hoàn thành')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'Chưa hoàn thành'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500'
              : 'bg-white border-slate-200 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-bold uppercase tracking-wider">Chưa hoàn thành</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-800">{totalIncomplete} HS</div>
          <p className="text-[11px] text-slate-500 mt-1">Cần nhắc nhở nộp bài hoặc bồi dưỡng</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, mã số..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Hoàn thành tốt">Hoàn thành tốt</option>
            <option value="Đang thực hiện">Đang thực hiện</option>
            <option value="Chưa hoàn thành">Chưa hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-3.5 px-4">Mã HS</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">Số bài đã giao</th>
                <th className="py-3.5 px-4">Đã hoàn thành</th>
                <th className="py-3.5 px-4">Tỷ lệ nộp bài</th>
                <th className="py-3.5 px-4">Điểm TB Toán</th>
                <th className="py-3.5 px-4">Trạng thái học tập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                    Không tìm thấy học sinh nào theo điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map(({ student, totalAssigned, totalCompleted, completionRate, averageScore, status }) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-500">
                      {student.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{student.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-md">
                        {student.className}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{totalAssigned} bài</td>
                    <td className="py-3.5 px-4 text-slate-900 font-semibold">{totalCompleted} bài</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              completionRate >= 80
                                ? 'bg-emerald-500'
                                : completionRate >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700 text-sm">
                      {averageScore !== null ? averageScore : <span className="text-slate-400 font-normal italic">Chưa có</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          status === 'Hoàn thành tốt'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'Đang thực hiện'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            status === 'Hoàn thành tốt'
                              ? 'bg-emerald-600'
                              : status === 'Đang thực hiện'
                              ? 'bg-amber-600'
                              : 'bg-rose-600'
                          }`}
                        />
                        {status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
