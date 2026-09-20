import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Printer,
  FileSpreadsheet,
  Download,
  School,
  Award,
  Users,
  AlertCircle,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    teacherProfile,
    classes,
    students,
    grades,
    assignments,
    studentAssignments,
    attendance,
    overallStats,
    getStudentProgress,
    exportToCSV,
    exportDataJSON,
  } = useApp();

  const [selectedClassReport, setSelectedClassReport] = useState<string>('all');

  const handlePrint = () => {
    window.print();
  };

  const reportStudents =
    selectedClassReport === 'all'
      ? students
      : students.filter((s) => s.classId === selectedClassReport);

  const incompleteStudents = reportStudents
    .map((s) => ({
      student: s,
      prog: getStudentProgress(s),
    }))
    .filter((item) => item.prog.status === 'Chưa hoàn thành' || item.prog.completionRate < 60);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Export/Print Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Báo Cáo & Thống Kê Học Tập</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Tổng hợp kết quả môn Toán cho Ban Giám Hiệu, giáo viên chủ nhiệm và phụ huynh học sinh
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => exportToCSV('summary')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất CSV</span>
          </button>
          <button
            onClick={exportDataJSON}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Sao lưu JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Class Filter for Report */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <span className="text-xs font-bold text-slate-600">Xem báo cáo cho:</span>
        <select
          value={selectedClassReport}
          onChange={(e) => setSelectedClassReport(e.target.value)}
          className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Toàn bộ các lớp ({classes.length} lớp - {students.length} HS)</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              Lớp {c.name} ({students.filter((s) => s.classId === c.id).length} HS)
            </option>
          ))}
        </select>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Formal School Header */}
        <div className="border-b-2 border-slate-900/10 pb-6 text-center space-y-1">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
            SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI – TRƯỜNG THCS THẠCH THẤT 2
          </div>
          <div className="text-xs text-slate-500 font-medium">PHÂN HIỆU CẨM YÊN – BỘ MÔN TOÁN HỌC</div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 pt-3">
            BÁO CÁO TỔNG KẾT KẾT QUẢ HỌC TẬP MÔN TOÁN
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Giáo viên phụ trách: <strong className="text-slate-900">{teacherProfile.name}</strong> • Môn: <strong className="text-slate-900">{teacherProfile.subject}</strong>
          </p>
          <p className="text-[11px] text-slate-400">
            Thời điểm trích xuất dữ liệu: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        {/* 4 Summary Highlight Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-xs text-slate-500 font-medium block">Sĩ số theo dõi</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {reportStudents.length} học sinh
            </span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-xs text-slate-500 font-medium block">Điểm trung bình môn</span>
            <span className="text-2xl font-black text-indigo-700 mt-1 block">
              {overallStats.averageScore} / 10
            </span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-xs text-slate-500 font-medium block">Tỷ lệ hoàn thành bài tập</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {overallStats.completionRate}%
            </span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-xs text-slate-500 font-medium block">Tỷ lệ chuyên cần</span>
            <span className="text-2xl font-black text-teal-600 mt-1 block">
              {overallStats.attendanceRate}%
            </span>
          </div>
        </div>

        {/* Section 1: Class Performance Comparison */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-600" />
            <span>1. Kết Quả Theo Từng Lớp Học</span>
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4">Khối</th>
                  <th className="py-3 px-4">Sĩ số</th>
                  <th className="py-3 px-4">GV Phụ trách</th>
                  <th className="py-3 px-4">Điểm TB môn Toán</th>
                  <th className="py-3 px-4">Hoàn thành BT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((cls) => {
                  const clsStudents = students.filter((s) => s.classId === cls.id);
                  const clsGrades = grades.filter((g) => g.classId === cls.id);
                  const avg =
                    clsGrades.length > 0
                      ? Math.round((clsGrades.reduce((a, b) => a + b.score, 0) / clsGrades.length) * 10) / 10
                      : null;

                  let totalAssigned = 0;
                  let totalDone = 0;
                  clsStudents.forEach((st) => {
                    const p = getStudentProgress(st);
                    totalAssigned += p.totalAssigned;
                    totalDone += p.totalCompleted;
                  });
                  const compRate = totalAssigned > 0 ? Math.round((totalDone / totalAssigned) * 100) : 100;

                  return (
                    <tr key={cls.id}>
                      <td className="py-3 px-4 font-bold text-slate-900">Lớp {cls.name}</td>
                      <td className="py-3 px-4 text-slate-600">Khối {cls.grade}</td>
                      <td className="py-3 px-4 text-slate-700">{clsStudents.length} HS</td>
                      <td className="py-3 px-4 text-slate-700">{cls.homeroomTeacher}</td>
                      <td className="py-3 px-4 font-bold text-indigo-700 text-sm">
                        {avg !== null ? avg : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                            compRate >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {compRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Students with Low Completion / Attention Needed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>2. Danh Sách Học Sinh Chưa Hoàn Thành Bài Tập Hoặc Cần Bồi Dưỡng</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Tổng số: {incompleteStudents.length} học sinh
            </span>
          </div>

          {incompleteStudents.length === 0 ? (
            <p className="p-4 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium">
              Không có học sinh nào bị chậm tiến độ nộp bài tập môn Toán.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Mã HS</th>
                    <th className="py-2.5 px-4">Họ và tên</th>
                    <th className="py-2.5 px-4">Lớp</th>
                    <th className="py-2.5 px-4">Điểm TB môn Toán</th>
                    <th className="py-2.5 px-4">Số bài chưa hoàn thành</th>
                    <th className="py-2.5 px-4">Tỷ lệ hoàn thành</th>
                    <th className="py-2.5 px-4">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incompleteStudents.map(({ student, prog }) => (
                    <tr key={student.id}>
                      <td className="py-2.5 px-4 font-mono text-slate-500 font-bold">{student.code}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{student.name}</td>
                      <td className="py-2.5 px-4">{student.className}</td>
                      <td className="py-2.5 px-4 font-bold text-rose-600">
                        {prog.averageScore !== null ? prog.averageScore : 'Chưa có'}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-rose-700">
                        {prog.totalAssigned - prog.totalCompleted} bài
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-rose-700 font-bold">{prog.completionRate}%</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 italic">
                        {student.notes || 'Cần đôn đốc nộp bài'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Full Student Academic Roster */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>3. Bảng Điểm & Tiến Độ Chi Tiết Toàn Bộ Học Sinh</span>
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Mã HS</th>
                  <th className="py-2.5 px-4">Họ và tên</th>
                  <th className="py-2.5 px-4">Lớp</th>
                  <th className="py-2.5 px-4">Điểm TB Toán</th>
                  <th className="py-2.5 px-4">Tiến độ bài tập</th>
                  <th className="py-2.5 px-4">Đánh giá chung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportStudents.map((s) => {
                  const prog = getStudentProgress(s);
                  return (
                    <tr key={s.id}>
                      <td className="py-2.5 px-4 font-mono text-slate-500 font-bold">{s.code}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-4">{s.className}</td>
                      <td className="py-2.5 px-4 font-bold text-indigo-700">
                        {prog.averageScore !== null ? prog.averageScore : '—'}
                      </td>
                      <td className="py-2.5 px-4">
                        {prog.completionRate}% ({prog.totalCompleted}/{prog.totalAssigned})
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-700">
                        {prog.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature & Confirmation area for formal printing */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-600">
          <div className="space-y-16">
            <p className="font-bold text-slate-800">BAN GIÁM HIỆU DUYỆT</p>
            <p className="text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
          </div>
          <div className="space-y-16">
            <div>
              <p className="italic text-slate-500">Cẩm Yên, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
              <p className="font-bold text-slate-800 mt-1">GIÁO VIÊN BỘ MÔN TOÁN</p>
            </div>
            <p className="font-bold text-slate-900 text-sm">{teacherProfile.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
