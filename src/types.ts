export type GradeType = 'TX' | 'BT' | 'GK' | 'CK';

export interface TeacherProfile {
  name: string;
  subject: string;
  schoolLevel: string;
  schoolName: string;
  branch: string;
  phone?: string;
  email?: string;
  themeColor: 'blue' | 'indigo' | 'teal' | 'emerald';
  soundEnabled: boolean;
  gradingWeights: {
    TX: number; // Hệ số Kiểm tra thường xuyên (e.g. 1)
    BT: number; // Hệ số Bài tập (e.g. 1)
    GK: number; // Hệ số Giữa kỳ (e.g. 2)
    CK: number; // Hệ số Cuối kỳ (e.g. 3)
  };
}

export interface ClassItem {
  id: string;
  name: string;
  grade: number; // 6, 7, 8, 9
  room?: string;
  homeroomTeacher: string;
  academicYear: string;
  notes?: string;
}

export interface Student {
  id: string;
  code: string; // Mã học sinh
  name: string;
  gender: 'Nam' | 'Nữ';
  classId: string;
  className: string;
  birthDate?: string;
  notes?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  content: string;
  classIds: string[]; // Các lớp áp dụng
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: 'Đang giao' | 'Đã hoàn thành' | 'Đã đóng';
  maxScore: number;
}

export interface StudentAssignmentStatus {
  assignmentId: string;
  studentId: string;
  isCompleted: boolean;
  completedAt?: string;
  note?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  classId: string;
  assignmentId?: string;
  examType: GradeType;
  title: string;
  score: number; // 0 - 10
  date: string;
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
}

export type ProgressStatus = 'Hoàn thành tốt' | 'Đang thực hiện' | 'Chưa hoàn thành';

export interface StudentProgressSummary {
  student: Student;
  totalAssigned: number;
  totalCompleted: number;
  completionRate: number; // 0 - 100%
  averageScore: number | null;
  status: ProgressStatus;
}

export type TabType =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'assignments'
  | 'grades'
  | 'progress'
  | 'attendance'
  | 'reports'
  | 'settings';
