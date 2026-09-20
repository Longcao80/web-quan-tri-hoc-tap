import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus, Student } from '../types';
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Search,
  Users,
  CheckCheck,
  FileSpreadsheet,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    students,
    attendance,
    markAttendance,
    markBatchAttendance,
    exportToCSV,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.classId === currentClass?.id);

  const filteredStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Map student attendance for selected date
  const getAttendanceForStudent = (studentId: string) => {
    return attendance.find(
      (a) =>
        a.studentId === studentId &&
        a.classId === currentClass?.id &&
        a.date === selectedDate
    );
  };

  // Stats for current class & date
  let presentCount = 0;
  let excusedCount = 0;
  let unexcusedCount = 0;
  let notMarkedCount = 0;

  classStudents.forEach((s) => {
    const record = getAttendanceForStudent(s.id);
    if (!record) {
      notMarkedCount++;
    } else if (record.status === 'present') {
      presentCount++;
    } else if (record.status === 'absent_excused') {
      excusedCount++;
    } else {
      unexcusedCount++;
    }
  });

  const attendanceRate =
    classStudents.length > 0 ? Math.round((presentCount / classStudents.length) * 100) : 0;

  const handleStatusChange = (
    student: Student,
    status: AttendanceStatus,
    note?: string
  ) => {
    markAttendance({
      studentId: student.id,
      classId: student.classId,
      date: selectedDate,
      status,
      note,
    });
  };

  const handleMarkAllPresent = () => {
    if (currentClass) {
      markBatchAttendance(currentClass.id, selectedDate, 'present');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Sổ Điểm Danh & Chuyên Cần</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Ghi nhận học sinh có mặt, vắng phép hoặc không phép trong các tiết học môn Toán
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportToCSV('attendance')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất file chuyên cần</span>
          </button>
          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tất cả có mặt</span>
          </button>
        </div>
      </div>

      {/* Class & Date Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Class Selection */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-bold text-slate-500 mb-1">Chọn lớp điểm danh:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-extrabold text-indigo-800"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} ({students.filter((s) => s.classId === c.id).length} học sinh)
              </option>
            ))}
          </select>
        </div>

        {/* Date Selection */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-bold text-slate-500 mb-1">Ngày học:</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
            />
          </div>
        </div>

        {/* Search Input */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-bold text-slate-500 mb-1">Tìm học sinh:</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Attendance Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block">Sĩ số lớp</span>
          <strong className="text-xl font-extrabold text-slate-900">{classStudents.length} HS</strong>
        </div>

        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-xs text-emerald-800 font-bold block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Có mặt ({attendanceRate}%)
          </span>
          <strong className="text-xl font-black text-emerald-700">{presentCount} HS</strong>
        </div>

        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-xs text-amber-800 font-bold block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Vắng có phép
          </span>
          <strong className="text-xl font-black text-amber-700">{excusedCount} HS</strong>
        </div>

        <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 shadow-2xs">
          <span className="text-xs text-rose-800 font-bold block flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Vắng không phép
          </span>
          <strong className="text-xl font-black text-rose-700">{unexcusedCount} HS</strong>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-3.5 px-4">STT</th>
                <th className="py-3.5 px-4">Mã HS</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Trạng thái điểm danh ngày {selectedDate}</th>
                <th className="py-3.5 px-4">Ghi chú chuyên cần</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                    Không có học sinh nào trong lớp này.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const record = getAttendanceForStudent(student.id);
                  const currentStatus = record ? record.status : 'present';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-500">
                        {student.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1 border border-slate-200">
                          {/* Có mặt */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student, 'present', record?.note)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            Có mặt
                          </button>

                          {/* Có phép */}
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                student,
                                'absent_excused',
                                record?.note || 'Phụ huynh xin phép'
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'absent_excused'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            Có phép
                          </button>

                          {/* Vắng */}
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                student,
                                'absent_unexcused',
                                record?.note || 'Vắng không phép'
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'absent_unexcused'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            Vắng
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Thêm lý do hoặc ghi chú..."
                          value={record?.note || ''}
                          onChange={(e) =>
                            handleStatusChange(student, currentStatus, e.target.value)
                          }
                          className="w-full max-w-xs px-2.5 py-1 text-xs bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xs focus:outline-none transition-all"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
