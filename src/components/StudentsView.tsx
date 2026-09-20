import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { ExcelImportModal } from './ExcelImportModal';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  Award,
  BookOpenCheck,
  CalendarCheck,
  FileText,
  UserCheck,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react';

export const StudentsView: React.FC = () => {
  const {
    students,
    classes,
    addStudent,
    addStudentsBatch,
    updateStudent,
    deleteStudent,
    getStudentProgress,
    grades,
    attendance,
    assignments,
    studentAssignments,
  } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    gender: 'Nam' as 'Nam' | 'Nữ',
    classId: classes[0]?.id || '',
    birthDate: '',
    notes: '',
  });

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesClass = selectedClassId === 'all' || s.classId === selectedClassId;
    const matchesGender = selectedGender === 'all' || s.gender === selectedGender;
    return matchesSearch && matchesClass && matchesGender;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const targetClass = classes.find((c) => c.id === selectedClassId) || classes[0];
    const newCode = `HS${targetClass ? targetClass.name : '01'}${String(students.length + 1).padStart(2, '0')}`;

    setFormData({
      code: newCode,
      name: '',
      gender: 'Nam',
      classId: targetClass ? targetClass.id : '',
      birthDate: '2013-01-01',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      code: student.code,
      name: student.name,
      gender: student.gender,
      classId: student.classId,
      birthDate: student.birthDate || '',
      notes: student.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const matchedClass = classes.find((c) => c.id === formData.classId);
    const className = matchedClass ? matchedClass.name : 'Chưa phân lớp';

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        code: formData.code.trim(),
        name: formData.name.trim(),
        gender: formData.gender,
        classId: formData.classId,
        className,
        birthDate: formData.birthDate,
        notes: formData.notes.trim(),
      });
    } else {
      addStudent({
        code: formData.code.trim(),
        name: formData.name.trim(),
        gender: formData.gender,
        classId: formData.classId,
        className,
        birthDate: formData.birthDate,
        notes: formData.notes.trim(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = [
      ['DANH SÁCH HỌC SINH MÔN TOÁN - THẦY KIỀU CAO LONG'],
      [`Trường THCS Thạch Thất 2 - Phân hiệu Cẩm Yên | Thời gian xuất: ${new Date().toLocaleDateString('vi-VN')}`],
      ['STT', 'Mã HS', 'Họ và tên', 'Lớp', 'Giới tính', 'Ngày sinh', 'Điểm TB Toán', 'Tiến độ bài tập', 'Trạng thái', 'Ghi chú'],
      ...filteredStudents.map((s, idx) => {
        const prog = getStudentProgress(s);
        return [
          idx + 1,
          s.code,
          s.name,
          s.className,
          s.gender,
          s.birthDate || '',
          prog.averageScore !== null ? prog.averageScore : 'Chưa có',
          `${prog.completionRate}% (${prog.totalCompleted}/${prog.totalAssigned})`,
          prog.status,
          s.notes || '',
        ];
      }),
    ];

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 25 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 20 },
      { wch: 18 },
      { wch: 30 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HocSinh');
    const classLabel = selectedClassId === 'all' ? 'TatCaCacLop' : `Lop_${selectedClassId}`;
    XLSX.writeFile(wb, `Danh_sach_hoc_sinh_${classLabel}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Quản Lý Danh Sách Học Sinh</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Tổng số: <strong className="text-indigo-600 font-bold">{students.length}</strong> học sinh trong các lớp bộ môn Toán
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Nút Thêm bằng Excel */}
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            title="Nhập danh sách học sinh từ file Excel (.xlsx, .xls, .csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Thêm bằng Excel</span>
          </button>

          {/* Nút Xuất Excel */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            title="Xuất danh sách học sinh ra file Excel"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          {/* Nút Thêm học sinh thủ công */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã học sinh (VD: Kiều Tuấn Anh, HS8A01)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filter by Class */}
        <div className="sm:col-span-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="all">Tất cả các lớp ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} ({students.filter((s) => s.classId === c.id).length} HS)
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Gender */}
        <div className="sm:col-span-3">
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-3.5 px-4">Mã HS</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">Giới tính</th>
                <th className="py-3.5 px-4">Điểm TB Toán</th>
                <th className="py-3.5 px-4">Tiến độ bài tập</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const prog = getStudentProgress(student);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600">
                        {student.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {student.name}
                        {student.notes && (
                          <span className="block text-[11px] font-normal text-slate-500 italic truncate max-w-xs">
                            {student.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-lg">
                          {student.className}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {student.gender}
                      </td>
                      <td className="py-3.5 px-4">
                        {prog.averageScore !== null ? (
                          <span
                            className={`font-black text-sm ${
                              prog.averageScore >= 8.0
                                ? 'text-emerald-600'
                                : prog.averageScore >= 6.5
                                ? 'text-blue-600'
                                : prog.averageScore >= 5.0
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {prog.averageScore}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa có</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                prog.completionRate >= 80
                                  ? 'bg-emerald-500'
                                  : prog.completionRate >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${prog.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {prog.completionRate}%
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({prog.totalCompleted}/{prog.totalAssigned})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            prog.status === 'Hoàn thành tốt'
                              ? 'bg-emerald-100 text-emerald-800'
                              : prog.status === 'Đang thực hiện'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {prog.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingProfile(student)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Xem hồ sơ học tập"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị <strong className="text-slate-800">{filteredStudents.length}</strong> / {students.length} học sinh
          </span>
          <span className="hidden sm:inline">Trường THCS Thạch Thất 2 – Phân hiệu Cẩm Yên</span>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>{editingStudent ? 'Sửa thông tin học sinh' : 'Thêm học sinh mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp học <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Kiều Tuấn Anh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Nam' | 'Nữ' })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú của thầy Kiều Cao Long</label>
                <textarea
                  rows={2}
                  placeholder="VD: Học lực tốt, cần rèn luyện thêm bài toán hình học..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingStudent ? 'Lưu cập nhật' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Academic Detail Profile Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {viewingProfile.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-lg">{viewingProfile.name}</h3>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-black rounded-md">
                      Lớp {viewingProfile.className}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Mã HS: <span className="font-mono font-bold text-slate-700">{viewingProfile.code}</span> • Giới tính: {viewingProfile.gender}
                    {viewingProfile.birthDate ? ` • Sinh: ${viewingProfile.birthDate}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingProfile(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Stat summary cards */}
              {(() => {
                const prog = getStudentProgress(viewingProfile);
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-xs text-slate-500 font-medium block">Điểm TB môn Toán</span>
                      <span className="text-2xl font-black text-indigo-700 mt-1 block">
                        {prog.averageScore !== null ? prog.averageScore : '—'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-xs text-slate-500 font-medium block">Hoàn thành bài tập</span>
                      <span className="text-2xl font-black text-emerald-600 mt-1 block">
                        {prog.completionRate}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {prog.totalCompleted}/{prog.totalAssigned} bài
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-xs text-slate-500 font-medium block">Trạng thái</span>
                      <span
                        className={`inline-block mt-2 px-2.5 py-1 text-xs font-bold rounded-lg ${
                          prog.status === 'Hoàn thành tốt'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prog.status === 'Đang thực hiện'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prog.status}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Teacher's Note */}
              {viewingProfile.notes && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                  <span className="font-bold block mb-1">Ghi chú của thầy Kiều Cao Long:</span>
                  <p>{viewingProfile.notes}</p>
                </div>
              )}

              {/* Grades History */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Bảng Điểm Môn Toán</span>
                </h4>
                {grades.filter((g) => g.studentId === viewingProfile.id).length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">Chưa có điểm kiểm tra nào được nhập cho học sinh này.</p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Loại điểm</th>
                          <th className="py-2.5 px-3">Nội dung bài kiểm tra</th>
                          <th className="py-2.5 px-3">Điểm số</th>
                          <th className="py-2.5 px-3">Ngày</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {grades
                          .filter((g) => g.studentId === viewingProfile.id)
                          .map((grade) => (
                            <tr key={grade.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-semibold text-slate-700">
                                {grade.examType === 'TX'
                                  ? 'Thường xuyên'
                                  : grade.examType === 'BT'
                                  ? 'Bài tập'
                                  : grade.examType === 'GK'
                                  ? 'Giữa kỳ'
                                  : 'Cuối kỳ'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-900 font-medium">{grade.title}</td>
                              <td className="py-2.5 px-3 font-bold text-indigo-700 text-sm">{grade.score}</td>
                              <td className="py-2.5 px-3 text-slate-500">{grade.date}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Assignments status */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-indigo-600" />
                  <span>Tiến Độ Bài Tập Đã Giao</span>
                </h4>
                <div className="space-y-2">
                  {assignments
                    .filter((a) => a.classIds.includes(viewingProfile.classId))
                    .map((asg) => {
                      const sa = studentAssignments.find(
                        (s) => s.assignmentId === asg.id && s.studentId === viewingProfile.id
                      );
                      const isDone = sa ? sa.isCompleted : false;
                      return (
                        <div
                          key={asg.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100"
                        >
                          <span className="font-medium text-slate-800 truncate mr-2">{asg.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                              isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isDone ? 'Đã hoàn thành' : 'Chưa nộp'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                onClick={() => setViewingProfile(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(studentToDelete)}
        title="Xác nhận xóa học sinh"
        message={`Thầy có chắc chắn muốn xóa học sinh "${studentToDelete?.name || ''}" (${studentToDelete?.code || ''}) khỏi danh sách? Toàn bộ điểm số liên quan cũng sẽ bị xóa.`}
        confirmText="Xóa học sinh"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setStudentToDelete(null)}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        classes={classes}
        existingStudents={students}
        onImport={(newStudents, updateExisting) => {
          addStudentsBatch(newStudents, updateExisting);
        }}
      />
    </div>
  );
};
