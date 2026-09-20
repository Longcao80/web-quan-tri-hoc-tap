import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment, Student } from '../types';
import { ConfirmModal } from './ConfirmModal';
import {
  BookOpenCheck,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  CheckSquare,
  Square,
  Users,
  Eye,
} from 'lucide-react';

export const AssignmentsView: React.FC = () => {
  const {
    assignments,
    classes,
    students,
    studentAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentCompletion,
    teacherProfile,
  } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Đang giao' | 'Đã hoàn thành' | 'Đã đóng'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: teacherProfile.subject || 'Toán',
    content: '',
    classIds: [] as string[],
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'Đang giao' as 'Đang giao' | 'Đã hoàn thành' | 'Đã đóng',
    maxScore: 10,
  });

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesClass = filterClass === 'all' || a.classIds.includes(filterClass);
    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setFormData({
      title: '',
      subject: teacherProfile.subject || 'Toán',
      content: '',
      classIds: classes.length > 0 ? [classes[0].id] : [],
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Đang giao',
      maxScore: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setFormData({
      title: asg.title,
      subject: asg.subject,
      content: asg.content,
      classIds: asg.classIds,
      assignedDate: asg.assignedDate,
      dueDate: asg.dueDate,
      status: asg.status,
      maxScore: asg.maxScore,
    });
    setIsModalOpen(true);
  };

  const handleToggleClassSelection = (classId: string) => {
    setFormData((prev) => {
      const exists = prev.classIds.includes(classId);
      if (exists) {
        return { ...prev, classIds: prev.classIds.filter((id) => id !== classId) };
      } else {
        return { ...prev, classIds: [...prev.classIds, classId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.classIds.length === 0) return;

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, {
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        content: formData.content.trim(),
        classIds: formData.classIds,
        assignedDate: formData.assignedDate,
        dueDate: formData.dueDate,
        status: formData.status,
        maxScore: formData.maxScore,
      });
    } else {
      addAssignment({
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        content: formData.content.trim(),
        classIds: formData.classIds,
        assignedDate: formData.assignedDate,
        dueDate: formData.dueDate,
        status: formData.status,
        maxScore: formData.maxScore,
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (assignmentToDelete) {
      deleteAssignment(assignmentToDelete.id);
      setAssignmentToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Quản Lý Bài Tập Môn Toán</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Giao phiếu bài tập, theo dõi hạn nộp và kiểm tra tình trạng hoàn thành của học sinh
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Giao bài tập mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
            <option value="Đã đóng">Đã đóng</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
          >
            <option value="all">Tất cả lớp áp dụng</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments List Cards */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <BookOpenCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-medium">Không tìm thấy bài tập nào phù hợp.</p>
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const asgClasses = classes.filter((c) => asg.classIds.includes(c.id));
            const relevantStudents = students.filter((s) => asg.classIds.includes(s.classId));
            const completedCount = studentAssignments.filter(
              (sa) => sa.assignmentId === asg.id && sa.isCompleted
            ).length;
            const pendingCount = relevantStudents.length - completedCount;
            const completionPercent =
              relevantStudents.length > 0 ? Math.round((completedCount / relevantStudents.length) * 100) : 0;

            const isPastDue = new Date(asg.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {asgClasses.map((c) => (
                      <span
                        key={c.id}
                        className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        Lớp {c.name}
                      </span>
                    ))}
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        asg.status === 'Đang giao'
                          ? 'bg-amber-100 text-amber-800'
                          : asg.status === 'Đã hoàn thành'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {asg.status}
                    </span>
                    {isPastDue && asg.status === 'Đang giao' && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Đã quá hạn nộp
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">{asg.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {asg.content || 'Không có ghi chú nội dung thêm.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Giao ngày: <strong className="text-slate-700">{asg.assignedDate}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Hạn nộp: <strong className="text-slate-700">{asg.dueDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Right side: Stats & Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 lg:border-l lg:border-slate-100 lg:pl-6">
                  <div className="space-y-1 text-left sm:text-right w-full sm:w-auto">
                    <div className="flex items-center sm:justify-end gap-2">
                      <span className="text-xs text-slate-500">Tiến độ nộp bài:</span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {completedCount}/{relevantStudents.length} HS ({completionPercent}%)
                      </span>
                    </div>

                    <div className="w-full sm:w-44 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          completionPercent >= 80
                            ? 'bg-emerald-500'
                            : completionPercent >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Chưa hoàn thành: <strong className="text-rose-600">{pendingCount} học sinh</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    <button
                      onClick={() => setViewingAssignment(asg)}
                      className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem & Chấm bài</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(asg)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Sửa bài tập"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAssignmentToDelete(asg)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Xóa bài tập"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-indigo-600" />
                <span>{editingAssignment ? 'Sửa thông tin bài tập' : 'Tạo bài tập môn Toán mới'}</span>
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
                  Tên bài tập môn Toán <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phiếu bài tập số 09: Hình chóp tam giác đều..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lớp áp dụng <span className="text-rose-500">*</span> (chọn 1 hoặc nhiều lớp)
                </label>
                <div className="flex flex-wrap gap-2">
                  {classes.map((c) => {
                    const isSelected = formData.classIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleToggleClassSelection(c.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Lớp {c.name}
                      </button>
                    );
                  })}
                </div>
                {formData.classIds.length === 0 && (
                  <p className="text-[11px] text-rose-500 mt-1">Vui lòng chọn ít nhất một lớp học.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung / Yêu cầu bài tập</label>
                <textarea
                  rows={3}
                  placeholder="Ghi rõ số trang, câu hỏi hoặc yêu cầu làm bài cho học sinh..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày giao</label>
                  <input
                    type="date"
                    required
                    value={formData.assignedDate}
                    onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hạn nộp bài</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái bài tập</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    <option value="Đang giao">Đang giao</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                    <option value="Đã đóng">Đã đóng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thang điểm tối đa</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
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
                  disabled={formData.classIds.length === 0}
                  className="px-5 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingAssignment ? 'Lưu cập nhật' : 'Giao bài tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Detail & Interactive Submission Checklist Modal */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{viewingAssignment.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>Hạn nộp: <strong className="text-slate-800">{viewingAssignment.dueDate}</strong></span>
                  <span>•</span>
                  <span>
                    Các lớp:{' '}
                    {classes
                      .filter((c) => viewingAssignment.classIds.includes(c.id))
                      .map((c) => c.name)
                      .join(', ')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setViewingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold block text-slate-900 mb-1">Nội dung bài tập:</span>
                {viewingAssignment.content || 'Không có nội dung mô tả chi tiết.'}
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Danh Sách Học Sinh & Tình Trạng Nộp Bài</span>
                </h4>
                <span className="text-xs text-slate-500 italic">
                  (Thầy có thể bấm trực tiếp vào ô để ghi nhận hoàn thành)
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {students
                  .filter((s) => viewingAssignment.classIds.includes(s.classId))
                  .map((student) => {
                    const sa = studentAssignments.find(
                      (item) => item.assignmentId === viewingAssignment.id && item.studentId === student.id
                    );
                    const isCompleted = sa ? sa.isCompleted : false;

                    return (
                      <div
                        key={student.id}
                        onClick={() =>
                          toggleAssignmentCompletion(viewingAssignment.id, student.id, !isCompleted)
                        }
                        className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className={`p-1 rounded-md transition-colors ${
                              isCompleted ? 'text-emerald-600' : 'text-slate-300'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckSquare className="w-5 h-5 fill-emerald-100" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                            <span className="text-xs text-slate-500 ml-2">({student.code} - Lớp {student.className})</span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                onClick={() => setViewingAssignment(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(assignmentToDelete)}
        title="Xác nhận xóa bài tập"
        message={`Thầy có chắc chắn muốn xóa bài tập "${assignmentToDelete?.title || ''}"? Toàn bộ trạng thái làm bài của học sinh đối với bài này sẽ bị xóa.`}
        confirmText="Xóa bài tập"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setAssignmentToDelete(null)}
      />
    </div>
  );
};
