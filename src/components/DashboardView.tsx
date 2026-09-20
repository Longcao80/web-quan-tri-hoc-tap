import React from 'react';
import { useApp } from '../context/AppContext';
import {
  School,
  GraduationCap,
  BookOpenCheck,
  CheckCircle2,
  Award,
  TrendingUp,
  Clock,
  AlertCircle,
  PlusCircle,
  CalendarCheck,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    teacherProfile,
    classes,
    students,
    assignments,
    studentAssignments,
    grades,
    overallStats,
    getStudentProgress,
    setActiveTab,
  } = useApp();

  // Upcoming assignments (sorted by dueDate)
  const upcomingAssignments = [...assignments]
    .filter((a) => a.status === 'Đang giao')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Students needing attention
  const studentsNeedingAttention = students
    .map((s) => ({
      student: s,
      progress: getStudentProgress(s),
    }))
    .filter((item) => item.progress.status === 'Chưa hoàn thành' || (item.progress.averageScore !== null && item.progress.averageScore < 6.0))
    .slice(0, 5);

  // Grade distributions (Giỏi >= 8.0, Khá 6.5 - 7.9, Trung bình 5.0 - 6.4, Yếu < 5.0)
  const scoreDistribution = {
    gioi: 0,
    kha: 0,
    trungBinh: 0,
    yeu: 0,
  };

  students.forEach((s) => {
    const prog = getStudentProgress(s);
    if (prog.averageScore !== null) {
      if (prog.averageScore >= 8.0) scoreDistribution.gioi++;
      else if (prog.averageScore >= 6.5) scoreDistribution.kha++;
      else if (prog.averageScore >= 5.0) scoreDistribution.trungBinh++;
      else scoreDistribution.yeu++;
    }
  });

  const totalEvaluated =
    scoreDistribution.gioi +
    scoreDistribution.kha +
    scoreDistribution.trungBinh +
    scoreDistribution.yeu || 1;

  // Class comparison data
  const classComparison = classes.map((cls) => {
    const clsStudents = students.filter((s) => s.classId === cls.id);
    const clsGrades = grades.filter((g) => g.classId === cls.id);
    const avg =
      clsGrades.length > 0
        ? Math.round((clsGrades.reduce((a, b) => a + b.score, 0) / clsGrades.length) * 10) / 10
        : 0;

    let assignedCount = 0;
    let completedCount = 0;
    clsStudents.forEach((st) => {
      const p = getStudentProgress(st);
      assignedCount += p.totalAssigned;
      completedCount += p.totalCompleted;
    });
    const completionRate = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 100;

    return {
      classItem: cls,
      studentCount: clsStudents.length,
      avgScore: avg,
      completionRate,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide text-indigo-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Năm học 2026 - 2027 • Học kỳ I</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Kính chào {teacherProfile.name}!
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
            Hôm nay thầy đang giảng dạy <span className="text-amber-300 font-bold">{classes.length} lớp học</span> với{' '}
            <span className="text-white font-bold">{students.length} học sinh</span>. Hệ thống đã đồng bộ toàn bộ bài tập và bảng điểm môn Toán.
          </p>

          <div className="pt-3 flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-slate-100 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
              <span>Điểm danh hôm nay</span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className="px-4 py-2.5 bg-indigo-700/70 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-indigo-400/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Giao bài tập mới</span>
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Nhập điểm số</span>
            </button>
          </div>
        </div>

        {/* Decorative math formula background */}
        <div className="absolute right-4 -bottom-6 text-white/5 font-mono text-8xl font-black select-none pointer-events-none hidden md:block">
          y = ax² + bx + c
        </div>
      </div>

      {/* 6 Quick Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Classes */}
        <div
          onClick={() => setActiveTab('classes')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng số lớp</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{overallStats.totalClasses}</div>
          <div className="text-[11px] text-slate-600 font-medium mt-1 flex items-center gap-1">
            <span>Khối 6, 7, 8, 9</span>
          </div>
        </div>

        {/* Total Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng học sinh</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{overallStats.totalStudents}</div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">Đang theo học</div>
        </div>

        {/* Active Assignments */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Bài tập đang giao</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <BookOpenCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{overallStats.activeAssignments}</div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">Chưa hết hạn</div>
        </div>

        {/* Completed Assignments */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Bài hoàn thành</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{overallStats.completedAssignments}</div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">Đã đóng / xong</div>
        </div>

        {/* Average Score */}
        <div
          onClick={() => setActiveTab('grades')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Điểm TB môn</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-700">{overallStats.averageScore}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Thang điểm 10</div>
        </div>

        {/* Completion Rate */}
        <div
          onClick={() => setActiveTab('progress')}
          className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tỷ lệ nộp bài</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-teal-600">{overallStats.completionRate}%</div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">Toàn trường</div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Grade Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Phân Bố Kết Quả Môn Toán</h3>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md font-medium">
              {students.length} học sinh
            </span>
          </div>

          <div className="space-y-3">
            {/* Giỏi */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Giỏi (≥ 8.0)
                </span>
                <span className="text-slate-700">
                  {scoreDistribution.gioi} HS ({Math.round((scoreDistribution.gioi / totalEvaluated) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(scoreDistribution.gioi / totalEvaluated) * 100}%` }}
                />
              </div>
            </div>

            {/* Khá */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  Khá (6.5 – 7.9)
                </span>
                <span className="text-slate-700">
                  {scoreDistribution.kha} HS ({Math.round((scoreDistribution.kha / totalEvaluated) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(scoreDistribution.kha / totalEvaluated) * 100}%` }}
                />
              </div>
            </div>

            {/* Trung bình */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Trung bình (5.0 – 6.4)
                </span>
                <span className="text-slate-700">
                  {scoreDistribution.trungBinh} HS ({Math.round((scoreDistribution.trungBinh / totalEvaluated) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(scoreDistribution.trungBinh / totalEvaluated) * 100}%` }}
                />
              </div>
            </div>

            {/* Chưa đạt / Yếu */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  Cần bồi dưỡng (&lt; 5.0)
                </span>
                <span className="text-slate-700">
                  {scoreDistribution.yeu} HS ({Math.round((scoreDistribution.yeu / totalEvaluated) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(scoreDistribution.yeu / totalEvaluated) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Tỷ lệ đạt chuẩn (≥ 5.0):</span>
            <span className="font-bold text-slate-900 text-sm">
              {Math.round(((scoreDistribution.gioi + scoreDistribution.kha + scoreDistribution.trungBinh) / totalEvaluated) * 100)}%
            </span>
          </div>
        </div>

        {/* Chart 2: Class Comparison Table & Progress */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">So Sánh Kết Quả Giữa Các Lớp</h3>
              <p className="text-xs text-slate-600 mt-0.5">Điểm trung bình và tỷ lệ hoàn thành bài tập từng lớp</p>
            </div>
            <button
              onClick={() => setActiveTab('classes')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem chi tiết lớp</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase">
                  <th className="pb-3">Lớp học</th>
                  <th className="pb-3">Sĩ số</th>
                  <th className="pb-3">Điểm TB môn</th>
                  <th className="pb-3">Tỷ lệ hoàn thành BT</th>
                  <th className="pb-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classComparison.map((item) => (
                  <tr key={item.classItem.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                        {item.classItem.name}
                      </span>
                      <span>Khối {item.classItem.grade}</span>
                    </td>
                    <td className="py-3.5 text-slate-600">{item.studentCount} HS</td>
                    <td className="py-3.5 font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-indigo-800 font-bold">
                        {item.avgScore > 0 ? item.avgScore : '—'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2 max-w-[140px]">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.completionRate >= 80
                                ? 'bg-emerald-500'
                                : item.completionRate >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-9 text-right">
                          {item.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setActiveTab('classes')}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Xem danh sách lớp"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Two columns: Upcoming Assignments & Students Needing Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Bài Tập Đang Giao & Sắp Đến Hạn</h3>
              </div>
              <button
                onClick={() => setActiveTab('assignments')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Tất cả bài tập</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingAssignments.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Hiện không có bài tập nào đang giao.</p>
              ) : (
                upcomingAssignments.map((asg) => {
                  const asgClasses = classes.filter((c) => asg.classIds.includes(c.id));
                  const classStudents = students.filter((s) => asg.classIds.includes(s.classId));
                  const completedCount = studentAssignments.filter(
                    (sa) => sa.assignmentId === asg.id && sa.isCompleted
                  ).length;
                  const percent = classStudents.length > 0 ? Math.round((completedCount / classStudents.length) * 100) : 0;

                  return (
                    <div
                      key={asg.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {asgClasses.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800"
                            >
                              Lớp {c.name}
                            </span>
                          ))}
                          <span className="text-[11px] font-medium text-slate-500">
                            Hạn nộp: <strong className="text-slate-700">{asg.dueDate}</strong>
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{asg.title}</h4>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right text-xs">
                          <span className="font-bold text-slate-800">
                            {completedCount}/{classStudents.length}
                          </span>
                          <span className="text-slate-500 block text-[10px]">đã hoàn thành</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold ${
                            percent >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {percent}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('assignments')}
              className="w-full py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Giao thêm bài tập toán mới</span>
            </button>
          </div>
        </div>

        {/* Students Needing Attention */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Học Sinh Cần Quan Tâm & Bồi Dưỡng</h3>
                  <p className="text-xs text-slate-600">Dựa trên kết quả bài kiểm tra và tiến độ làm bài tập</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('progress')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {studentsNeedingAttention.length === 0 ? (
                <p className="text-sm text-emerald-600 py-4 text-center font-medium">
                  Tất cả học sinh đều đang hoàn thành tốt và có kết quả ổn định!
                </p>
              ) : (
                studentsNeedingAttention.map(({ student, progress }) => (
                  <div
                    key={student.id}
                    className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-white hover:border-rose-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-md">
                          Lớp {student.className}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {student.notes || 'Chưa hoàn thành đủ bài tập được giao'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-rose-600">
                          {progress.averageScore !== null ? `ĐTB: ${progress.averageScore}` : 'Chưa có điểm'}
                        </div>
                        <span className="text-[10px] text-slate-600 font-medium block">
                          BT: {progress.completionRate}%
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('students')}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Hồ sơ
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Tổng cộng: <strong className="text-rose-600 font-bold">{overallStats.attentionNeededCount}</strong> học sinh cần chú ý</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Xuất danh sách bồi dưỡng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
