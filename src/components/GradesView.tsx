import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GradeRecord, GradeType, Student } from '../types';
import { ConfirmModal } from './ConfirmModal';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Search,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const GradesView: React.FC = () => {
  const {
    grades,
    students,
    classes,
    addGrade,
    updateGrade,
    deleteGrade,
    teacherProfile,
    updateTeacherProfile,
    getStudentProgress,
  } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [gradeToDelete, setGradeToDelete] = useState<GradeRecord | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    examType: 'TX' as GradeType,
    title: 'Kiểm tra 15 phút',
    score: 8.0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Grading weights form state
  const [weightsForm, setWeightsForm] = useState(teacherProfile.gradingWeights);

  const filteredGrades = grades.filter((g) => {
    const student = students.find((s) => s.id === g.studentId);
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student && student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student && student.code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesClass = selectedClassId === 'all' || g.classId === selectedClassId;
    const matchesType = selectedType === 'all' || g.examType === selectedType;
    return matchesSearch && matchesClass && matchesType;
  });

  // Type labels
  const examTypeLabels: Record<GradeType, { label: string; bg: string; text: string }> = {
    TX: { label: 'Thường xuyên', bg: 'bg-blue-50', text: 'text-blue-700' },
    BT: { label: 'Bài tập', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    GK: { label: 'Giữa kỳ', bg: 'bg-amber-50', text: 'text-amber-800' },
    CK: { label: 'Cuối kỳ', bg: 'bg-purple-50', text: 'text-purple-700' },
  };

  const handleOpenAdd = () => {
    setEditingGrade(null);
    const targetClass = classes.find((c) => c.id === selectedClassId) || classes[0];
    const classStudents = students.filter((s) => s.classId === (targetClass?.id || ''));
    const defaultStudent = classStudents[0] || students[0];

    setFormData({
      studentId: defaultStudent ? defaultStudent.id : '',
      classId: defaultStudent ? defaultStudent.classId : (targetClass?.id || ''),
      examType: 'TX',
      title: 'Kiểm tra thường xuyên môn Toán',
      score: 8.0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (grade: GradeRecord) => {
    setEditingGrade(grade);
    setFormData({
      studentId: grade.studentId,
      classId: grade.classId,
      examType: grade.examType,
      title: grade.title,
      score: grade.score,
      date: grade.date,
      notes: grade.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleStudentSelect = (studentId: string) => {
    const s = students.find((item) => item.id === studentId);
    setFormData((prev) => ({
      ...prev,
      studentId,
      classId: s ? s.classId : prev.classId,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.title.trim()) return;

    if (editingGrade) {
      updateGrade(editingGrade.id, {
        studentId: formData.studentId,
        classId: formData.classId,
        examType: formData.examType,
        title: formData.title.trim(),
        score: Number(formData.score),
        date: formData.date,
        notes: formData.notes.trim(),
      });
    } else {
      addGrade({
        studentId: formData.studentId,
        classId: formData.classId,
        examType: formData.examType,
        title: formData.title.trim(),
        score: Number(formData.score),
        date: formData.date,
        notes: formData.notes.trim(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (gradeToDelete) {
      deleteGrade(gradeToDelete.id);
      setGradeToDelete(null);
    }
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeacherProfile({ gradingWeights: weightsForm });
    setShowFormulaModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Quản Lý Điểm Số Môn Toán</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Ghi nhận và tính toán điểm kiểm tra thường xuyên, bài tập, giữa kỳ và cuối kỳ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setWeightsForm(teacherProfile.gradingWeights);
              setShowFormulaModal(true);
            }}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Công thức tính ĐTB</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nhập điểm số</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, bài kiểm tra..."
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="all">Tất cả loại bài</option>
            <option value="TX">Kiểm tra thường xuyên (Hệ số {teacherProfile.gradingWeights.TX})</option>
            <option value="BT">Bài tập (Hệ số {teacherProfile.gradingWeights.BT})</option>
            <option value="GK">Giữa kỳ (Hệ số {teacherProfile.gradingWeights.GK})</option>
            <option value="CK">Cuối kỳ (Hệ số {teacherProfile.gradingWeights.CK})</option>
          </select>
        </div>
      </div>

      {/* Grade Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">Mã HS</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Loại bài kiểm tra</th>
                <th className="py-3.5 px-4">Tên bài kiểm tra</th>
                <th className="py-3.5 px-4">Điểm số</th>
                <th className="py-3.5 px-4">Ngày vào điểm</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                    Không tìm thấy bản ghi điểm số nào.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => {
                  const student = students.find((s) => s.id === grade.studentId);
                  const cls = classes.find((c) => c.id === grade.classId);
                  const typeInfo = examTypeLabels[grade.examType] || {
                    label: grade.examType,
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                  };

                  return (
                    <tr key={grade.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-md">
                          {cls?.name || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-bold">
                        {student?.code || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {student?.name || 'Học sinh đã xóa'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold ${typeInfo.bg} ${typeInfo.text}`}
                        >
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {grade.title}
                        {grade.notes && (
                          <span className="block text-[11px] text-slate-400 italic">{grade.notes}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-black text-sm ${
                            grade.score >= 8.0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : grade.score >= 6.5
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : grade.score >= 5.0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {grade.score}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">{grade.date}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(grade)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Sửa điểm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setGradeToDelete(grade)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa điểm"
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
            Tổng cộng: <strong className="text-slate-800">{filteredGrades.length}</strong> đầu điểm
          </span>
          <span>Công thức tính: [TX×{teacherProfile.gradingWeights.TX} + BT×{teacherProfile.gradingWeights.BT} + GK×{teacherProfile.gradingWeights.GK} + CK×{teacherProfile.gradingWeights.CK}] / Tổng hệ số</span>
        </div>
      </div>

      {/* Add / Edit Grade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>{editingGrade ? 'Sửa điểm số' : 'Nhập điểm môn Toán'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn học sinh <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-800"
                >
                  <option value="">-- Chọn học sinh --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} - Lớp {s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loại kiểm tra</label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value as GradeType })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    <option value="TX">Thường xuyên (Hệ số {teacherProfile.gradingWeights.TX})</option>
                    <option value="BT">Bài tập (Hệ số {teacherProfile.gradingWeights.BT})</option>
                    <option value="GK">Giữa kỳ (Hệ số {teacherProfile.gradingWeights.GK})</option>
                    <option value="CK">Cuối kỳ (Hệ số {teacherProfile.gradingWeights.CK})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Điểm số (0 - 10) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.25"
                    min="0"
                    max="10"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-black text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên bài kiểm tra <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kiểm tra 15 phút Số học, Khảo sát..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kiểm tra</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú thêm</label>
                  <input
                    type="text"
                    placeholder="VD: Bài làm tốt, thiếu hình..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
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
                  {editingGrade ? 'Lưu cập nhật' : 'Lưu điểm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formula Settings Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <span>Cấu Hình Hệ Số Tính Điểm Trung Bình</span>
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeights} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Thầy Kiều Cao Long có thể linh hoạt thiết lập hệ số tính điểm trung bình môn Toán theo quy định của Bộ GD&ĐT hoặc phân hiệu:
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
                  <span className="text-xs font-bold text-slate-800">Kiểm tra Giữa kỳ (GK):</span>
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
                  <span className="text-xs font-bold text-slate-800">Kiểm tra Cuối kỳ (CK):</span>
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Áp dụng công thức
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(gradeToDelete)}
        title="Xác nhận xóa điểm số"
        message={`Thầy có chắc chắn muốn xóa điểm ${gradeToDelete?.score} (${gradeToDelete?.title}) của học sinh này?`}
        confirmText="Xóa điểm"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setGradeToDelete(null)}
      />
    </div>
  );
};
