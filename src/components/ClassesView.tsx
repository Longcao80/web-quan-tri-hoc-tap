import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClassItem, Student } from '../types';
import { ConfirmModal } from './ConfirmModal';
import {
  School,
  Plus,
  Edit2,
  Trash2,
  Users,
  Award,
  BookOpen,
  Calendar,
  X,
  Search,
  ExternalLink,
} from 'lucide-react';

export const ClassesView: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass, students, grades, getStudentProgress, setActiveTab } = useApp();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  // Detail student roster modal
  const [viewingClassRoster, setViewingClassRoster] = useState<ClassItem | null>(null);

  // Delete confirm
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    grade: 6,
    room: '',
    homeroomTeacher: 'Thầy Kiều Cao Long',
    academicYear: '2026 - 2027',
    notes: '',
  });

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.homeroomTeacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGrade = filterGrade === 'all' || c.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      grade: 6,
      room: 'Phòng học môn Toán',
      homeroomTeacher: 'Thầy Kiều Cao Long',
      academicYear: '2026 - 2027',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade: cls.grade,
      room: cls.room || '',
      homeroomTeacher: cls.homeroomTeacher,
      academicYear: cls.academicYear,
      notes: cls.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClass) {
      updateClass(editingClass.id, {
        name: formData.name.trim(),
        grade: Number(formData.grade),
        room: formData.room.trim(),
        homeroomTeacher: formData.homeroomTeacher.trim(),
        academicYear: formData.academicYear.trim(),
        notes: formData.notes.trim(),
      });
    } else {
      addClass({
        name: formData.name.trim(),
        grade: Number(formData.grade),
        room: formData.room.trim(),
        homeroomTeacher: formData.homeroomTeacher.trim(),
        academicYear: formData.academicYear.trim(),
        notes: formData.notes.trim(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (classToDelete) {
      deleteClass(classToDelete.id);
      setClassToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Quản Lý Danh Sách Lớp Học</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Quản trị các lớp giảng dạy môn Toán tại trường THCS Thạch Thất 2 – Phân hiệu Cẩm Yên
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lớp học mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên lớp, giáo viên, phòng học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Khối lớp:</span>
          {(['all', 6, 7, 8, 9] as const).map((grade) => (
            <button
              key={grade}
              onClick={() => setFilterGrade(grade)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterGrade === grade
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {grade === 'all' ? 'Tất cả' : `Khối ${grade}`}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <School className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-medium">Không tìm thấy lớp học nào phù hợp.</p>
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const classStudents = students.filter((s) => s.classId === cls.id);
            const classGrades = grades.filter((g) => g.classId === cls.id);
            const avg =
              classGrades.length > 0
                ? Math.round((classGrades.reduce((a, b) => a + b.score, 0) / classGrades.length) * 10) / 10
                : null;

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl">
                        {cls.name}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">
                            Khối {cls.grade}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{cls.academicYear}</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mt-0.5">Lớp {cls.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Sửa thông tin lớp"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setClassToDelete(cls)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa lớp học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Giáo viên phụ trách:</span>
                      <span className="font-semibold text-slate-800">{cls.homeroomTeacher}</span>
                    </div>
                    {cls.room && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Phòng học:</span>
                        <span className="font-medium text-slate-700">{cls.room}</span>
                      </div>
                    )}
                    {cls.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-2">
                        &quot;{cls.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Stats & Roster Button */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-center">
                      <span className="text-[11px] text-slate-500 block">Sĩ số học sinh</span>
                      <strong className="text-sm font-extrabold text-slate-800 flex items-center justify-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        {classStudents.length} HS
                      </strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl text-center">
                      <span className="text-[11px] text-slate-500 block">Điểm TB môn</span>
                      <strong className="text-sm font-extrabold text-indigo-700 flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {avg !== null ? avg : '—'}
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewingClassRoster(cls)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Xem danh sách học sinh ({classStudents.length})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-600" />
                <span>{editingClass ? 'Sửa thông tin lớp học' : 'Thêm lớp học mới'}</span>
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
                    Tên lớp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 6A, 8B"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={6}>Khối 6</option>
                    <option value={7}>Khối 7</option>
                    <option value={8}>Khối 8</option>
                    <option value={9}>Khối 9</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giáo viên phụ trách / Chủ nhiệm</label>
                <input
                  type="text"
                  required
                  value={formData.homeroomTeacher}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacher: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phòng học</label>
                  <input
                    type="text"
                    placeholder="VD: Phòng 201"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Năm học</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú về lớp học</label>
                <textarea
                  rows={2}
                  placeholder="VD: Lớp ôn thi học sinh giỏi Toán, học sinh tích cực..."
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
                  {editingClass ? 'Lưu cập nhật' : 'Thêm lớp học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Class Roster Modal */}
      {viewingClassRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {viewingClassRoster.name}
                  </span>
                  <span>Danh Sách Học Sinh Lớp {viewingClassRoster.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  GV phụ trách: {viewingClassRoster.homeroomTeacher} • Sĩ số: {students.filter((s) => s.classId === viewingClassRoster.id).length} học sinh
                </p>
              </div>
              <button
                onClick={() => setViewingClassRoster(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <th className="pb-3">Mã HS</th>
                    <th className="pb-3">Họ và tên</th>
                    <th className="pb-3">Giới tính</th>
                    <th className="pb-3">Điểm TB Toán</th>
                    <th className="pb-3">Tiến độ BT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.filter((s) => s.classId === viewingClassRoster.id).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        Chưa có học sinh trong lớp này. Hãy vào mục &quot;Học sinh&quot; để thêm học sinh.
                      </td>
                    </tr>
                  ) : (
                    students
                      .filter((s) => s.classId === viewingClassRoster.id)
                      .map((student) => {
                        const prog = getStudentProgress(student);
                        return (
                          <tr key={student.id} className="hover:bg-slate-50">
                            <td className="py-3 font-mono text-xs text-slate-600">{student.code}</td>
                            <td className="py-3 font-bold text-slate-900">{student.name}</td>
                            <td className="py-3 text-xs text-slate-600">{student.gender}</td>
                            <td className="py-3 font-bold text-indigo-700">
                              {prog.averageScore !== null ? prog.averageScore : 'Chưa có'}
                            </td>
                            <td className="py-3">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                                  prog.completionRate >= 80
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {prog.completionRate}% ({prog.totalCompleted}/{prog.totalAssigned})
                              </span>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>Trường THCS Thạch Thất 2 – Phân hiệu Cẩm Yên</span>
              <button
                onClick={() => {
                  setViewingClassRoster(null);
                  setActiveTab('students');
                }}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Quản lý học sinh</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={Boolean(classToDelete)}
        title="Xác nhận xóa lớp học"
        message={`Thầy có chắc chắn muốn xóa lớp ${classToDelete?.name || ''}? Thao tác này cũng sẽ xóa toàn bộ học sinh và điểm số của lớp này.`}
        confirmText="Xóa vĩnh viễn"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setClassToDelete(null)}
      />
    </div>
  );
};
