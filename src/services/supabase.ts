import { createClient } from '@supabase/supabase-js';
import {
  TeacherProfile,
  ClassItem,
  Student,
  Assignment,
  StudentAssignmentStatus,
  GradeRecord,
  AttendanceRecord,
} from '../types';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://triltbttwysuxlskidir.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_f9YtSkUW3V9bXFgm4rHb3g_TG5J_Zes';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface FullSyncData {
  teacherProfile: TeacherProfile;
  classes: ClassItem[];
  students: Student[];
  assignments: Assignment[];
  studentAssignments: StudentAssignmentStatus[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
}

export const SUPABASE_SCHEMA_SQL = `-- =================================================================
-- SCRIPT TẠO BẢNG DỮ LIỆU CHO PHẦN MỀM QUẢN TRỊ HỌC TẬP TRÊN SUPABASE
-- Thầy Kiều Cao Long - THCS Thạch Thất 2
-- =================================================================

-- 1. Bảng Hồ Sơ Giáo Viên
CREATE TABLE IF NOT EXISTS teacher_profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT,
  subject TEXT,
  school_name TEXT,
  school_level TEXT,
  branch TEXT,
  phone TEXT,
  email TEXT,
  theme_color TEXT DEFAULT 'indigo',
  sound_enabled BOOLEAN DEFAULT true,
  grading_weights JSONB DEFAULT '{"TX": 1, "BT": 1, "GK": 2, "CK": 3}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Lớp Học
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL DEFAULT 6,
  room TEXT,
  homeroom_teacher TEXT,
  academic_year TEXT DEFAULT '2026 - 2027',
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Học Sinh
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'Nam',
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  birth_date TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng Bài Tập
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  class_ids JSONB DEFAULT '[]'::jsonb,
  assigned_date TEXT,
  due_date TEXT,
  status TEXT DEFAULT 'Đang giao',
  max_score NUMERIC DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng Trạng Thái Nộp Bài Học Sinh
CREATE TABLE IF NOT EXISTS student_assignments (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TEXT,
  note TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bảng Điểm Số
CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  assignment_id TEXT,
  exam_type TEXT NOT NULL DEFAULT 'TX',
  title TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  date TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bảng Điểm Danh
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'present',
  note TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bảng Tài Khoản Đăng Nhập (Tên đăng nhập & Mật khẩu)
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'teacher',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security (RLS) để bảo mật
ALTER TABLE teacher_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Cấp quyền Đọc / Ghi cho ứng dụng web (Public Anon Key)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public access teacher_profile" ON teacher_profile;
  CREATE POLICY "Public access teacher_profile" ON teacher_profile FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access classes" ON classes;
  CREATE POLICY "Public access classes" ON classes FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access students" ON students;
  CREATE POLICY "Public access students" ON students FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access assignments" ON assignments;
  CREATE POLICY "Public access assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access student_assignments" ON student_assignments;
  CREATE POLICY "Public access student_assignments" ON student_assignments FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access grades" ON grades;
  CREATE POLICY "Public access grades" ON grades FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access attendance" ON attendance;
  CREATE POLICY "Public access attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Public access app_users" ON app_users;
  CREATE POLICY "Public access app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);
END $$;
`;

// Helper: Check connection to Supabase and detect whether tables exist
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  missingTables: string[];
  message: string;
}> {
  const requiredTables = [
    'teacher_profile',
    'classes',
    'students',
    'assignments',
    'student_assignments',
    'grades',
    'attendance',
    'app_users',
  ];

  try {
    // Test basic connectivity by pinging classes
    const { error } = await supabase.from('classes').select('id').limit(1);

    if (error) {
      // Code 42P01 in Postgres is relation does not exist
      if (error.code === '42P01' || error.message.toLowerCase().includes('relation') || error.message.toLowerCase().includes('does not exist')) {
        return {
          connected: true,
          tablesExist: false,
          missingTables: requiredTables,
          message: 'Đã kết nối được tới Supabase! Tuy nhiên các bảng dữ liệu chưa được tạo. Vui lòng chạy mã SQL tạo bảng.',
        };
      }
      return {
        connected: false,
        tablesExist: false,
        missingTables: requiredTables,
        message: `Lỗi kết nối Supabase: ${error.message} (${error.code || ''})`,
      };
    }

    // Verify remaining tables
    const missing: string[] = [];
    for (const tbl of requiredTables) {
      if (tbl === 'classes') continue;
      const { error: tblErr } = await supabase.from(tbl).select('id').limit(1);
      if (tblErr && (tblErr.code === '42P01' || tblErr.message.toLowerCase().includes('relation'))) {
        missing.push(tbl);
      }
    }

    if (missing.length > 0) {
      return {
        connected: true,
        tablesExist: false,
        missingTables: missing,
        message: `Đã kết nối Supabase, nhưng còn thiếu các bảng: ${missing.join(', ')}. Hãy chạy lại mã SQL.`,
      };
    }

    return {
      connected: true,
      tablesExist: true,
      missingTables: [],
      message: 'Kết nối Supabase thành công và toàn bộ bảng dữ liệu đã sẵn sàng!',
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      missingTables: requiredTables,
      message: `Không thể kết nối Supabase: ${err?.message || 'Lỗi mạng hoặc thông tin cấu hình chưa đúng'}`,
    };
  }
}

// 1. Save Teacher Profile
export async function saveTeacherProfileToSupabase(profile: TeacherProfile): Promise<boolean> {
  try {
    const payload = {
      id: 'default',
      name: profile.name,
      subject: profile.subject,
      school_name: profile.schoolName,
      school_level: profile.schoolLevel,
      branch: profile.branch,
      phone: profile.phone || '',
      email: profile.email || '',
      theme_color: profile.themeColor || 'indigo',
      sound_enabled: Boolean(profile.soundEnabled),
      grading_weights: profile.gradingWeights || { TX: 1, BT: 1, GK: 2, CK: 3 },
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('teacher_profile').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi lưu hồ sơ lên Supabase:', err);
    return false;
  }
}

// 2. Classes
export async function saveClassToSupabase(cls: ClassItem): Promise<boolean> {
  try {
    const payload = {
      id: cls.id,
      name: cls.name,
      grade: Number(cls.grade) || 6,
      room: cls.room || '',
      homeroom_teacher: cls.homeroomTeacher || '',
      academic_year: cls.academicYear || '2026 - 2027',
      notes: cls.notes || '',
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('classes').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi lưu lớp lên Supabase:', err);
    return false;
  }
}

export async function deleteClassFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi xóa lớp trên Supabase:', err);
    return false;
  }
}

// 3. Students
export async function saveStudentToSupabase(student: Student): Promise<boolean> {
  try {
    const payload = {
      id: student.id,
      code: student.code,
      name: student.name,
      gender: student.gender,
      class_id: student.classId,
      class_name: student.className,
      birth_date: student.birthDate || '',
      notes: student.notes || '',
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('students').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi lưu học sinh lên Supabase:', err);
    return false;
  }
}

export async function deleteStudentFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi xóa học sinh trên Supabase:', err);
    return false;
  }
}

// 4. Assignments
export async function saveAssignmentToSupabase(asg: Assignment): Promise<boolean> {
  try {
    const payload = {
      id: asg.id,
      title: asg.title,
      subject: asg.subject,
      content: asg.content || '',
      class_ids: asg.classIds || [],
      assigned_date: asg.assignedDate || '',
      due_date: asg.dueDate || '',
      status: asg.status || 'Đang giao',
      max_score: Number(asg.maxScore) || 10,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('assignments').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi lưu bài tập lên Supabase:', err);
    return false;
  }
}

export async function deleteAssignmentFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi xóa bài tập trên Supabase:', err);
    return false;
  }
}

// 5. Grades
export async function saveGradeToSupabase(grade: GradeRecord): Promise<boolean> {
  try {
    const payload = {
      id: grade.id,
      student_id: grade.studentId,
      class_id: grade.classId,
      assignment_id: grade.assignmentId || null,
      exam_type: grade.examType,
      title: grade.title,
      score: Number(grade.score) || 0,
      date: grade.date || '',
      notes: grade.notes || '',
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('grades').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi lưu điểm lên Supabase:', err);
    return false;
  }
}

export async function deleteGradeFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('grades').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi xóa điểm trên Supabase:', err);
    return false;
  }
}

// 6. Attendance
export async function saveAttendanceToSupabase(att: AttendanceRecord): Promise<boolean> {
  try {
    const payload = {
      id: att.id,
      student_id: att.studentId,
      class_id: att.classId,
      date: att.date,
      status: att.status,
      note: att.note || '',
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('attendance').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi lưu điểm danh lên Supabase:', err);
    return false;
  }
}

export async function deleteAttendanceFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('attendance').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi xóa điểm danh trên Supabase:', err);
    return false;
  }
}

// 7. Student Assignment Status
export async function saveStudentAssignmentToSupabase(
  sa: StudentAssignmentStatus
): Promise<boolean> {
  try {
    const id = `${sa.assignmentId}_${sa.studentId}`;
    const payload = {
      id,
      assignment_id: sa.assignmentId,
      student_id: sa.studentId,
      is_completed: Boolean(sa.isCompleted),
      completed_at: sa.completedAt || null,
      note: sa.note || '',
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('student_assignments')
      .upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Lỗi lưu nộp bài lên Supabase:', err);
    return false;
  }
}

// 8. Bulk upload full dataset to Supabase
export async function uploadFullDataToSupabase(data: FullSyncData): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // 1. Profile
    await saveTeacherProfileToSupabase(data.teacherProfile);

    // 2. Classes
    if (data.classes.length > 0) {
      const classRows = data.classes.map((c) => ({
        id: c.id,
        name: c.name,
        grade: Number(c.grade) || 6,
        room: c.room || '',
        homeroom_teacher: c.homeroomTeacher || '',
        academic_year: c.academicYear || '2026 - 2027',
        notes: c.notes || '',
        updated_at: new Date().toISOString(),
      }));
      const { error: cErr } = await supabase.from('classes').upsert(classRows, { onConflict: 'id' });
      if (cErr) throw cErr;
    }

    // 3. Students
    if (data.students.length > 0) {
      const studentRows = data.students.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        gender: s.gender,
        class_id: s.classId,
        class_name: s.className,
        birth_date: s.birthDate || '',
        notes: s.notes || '',
        updated_at: new Date().toISOString(),
      }));
      const { error: sErr } = await supabase.from('students').upsert(studentRows, { onConflict: 'id' });
      if (sErr) throw sErr;
    }

    // 4. Assignments
    if (data.assignments.length > 0) {
      const asgRows = data.assignments.map((a) => ({
        id: a.id,
        title: a.title,
        subject: a.subject,
        content: a.content || '',
        class_ids: a.classIds || [],
        assigned_date: a.assignedDate || '',
        due_date: a.dueDate || '',
        status: a.status || 'Đang giao',
        max_score: Number(a.maxScore) || 10,
        updated_at: new Date().toISOString(),
      }));
      const { error: aErr } = await supabase.from('assignments').upsert(asgRows, { onConflict: 'id' });
      if (aErr) throw aErr;
    }

    // 5. Student Assignments
    if (data.studentAssignments.length > 0) {
      const saRows = data.studentAssignments.map((sa) => ({
        id: `${sa.assignmentId}_${sa.studentId}`,
        assignment_id: sa.assignmentId,
        student_id: sa.studentId,
        is_completed: Boolean(sa.isCompleted),
        completed_at: sa.completedAt || null,
        note: sa.note || '',
        updated_at: new Date().toISOString(),
      }));
      const { error: saErr } = await supabase.from('student_assignments').upsert(saRows, { onConflict: 'id' });
      if (saErr) throw saErr;
    }

    // 6. Grades
    if (data.grades.length > 0) {
      const gRows = data.grades.map((g) => ({
        id: g.id,
        student_id: g.studentId,
        class_id: g.classId,
        assignment_id: g.assignmentId || null,
        exam_type: g.examType,
        title: g.title,
        score: Number(g.score) || 0,
        date: g.date || '',
        notes: g.notes || '',
        updated_at: new Date().toISOString(),
      }));
      const { error: gErr } = await supabase.from('grades').upsert(gRows, { onConflict: 'id' });
      if (gErr) throw gErr;
    }

    // 7. Attendance
    if (data.attendance.length > 0) {
      const attRows = data.attendance.map((att) => ({
        id: att.id,
        student_id: att.studentId,
        class_id: att.classId,
        date: att.date,
        status: att.status,
        note: att.note || '',
        updated_at: new Date().toISOString(),
      }));
      const { error: attErr } = await supabase.from('attendance').upsert(attRows, { onConflict: 'id' });
      if (attErr) throw attErr;
    }

    // 8. App Users (Tài khoản người dùng)
    try {
      const rawUsers = localStorage.getItem('thay_long_registered_users_v1');
      if (rawUsers) {
        const parsedUsers = JSON.parse(rawUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          const userRows = parsedUsers.map((u: any) => ({
            id: u.id,
            username: u.username,
            password_hash: u.passwordHash,
            full_name: u.fullName,
            email: u.email || null,
            role: u.role || 'teacher',
            created_at: u.createdAt || new Date().toISOString(),
          }));
          await supabase.from('app_users').upsert(userRows, { onConflict: 'id' });
        }
      }
    } catch {
      // Skip if app_users table is not yet accessible
    }

    return {
      success: true,
      message: 'Đã tải toàn bộ dữ liệu lên cơ sở dữ liệu Supabase thành công!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi đồng bộ lên Supabase: ${err?.message || err}`,
    };
  }
}

// 9. Fetch all data from Supabase
export async function fetchFullDataFromSupabase(): Promise<{
  success: boolean;
  data: FullSyncData | null;
  message: string;
}> {
  try {
    // 1. Profile
    const { data: pRows, error: pErr } = await supabase
      .from('teacher_profile')
      .select('*')
      .limit(1);
    if (pErr) throw pErr;

    // 2. Classes
    const { data: cRows, error: cErr } = await supabase.from('classes').select('*');
    if (cErr) throw cErr;

    // 3. Students
    const { data: sRows, error: sErr } = await supabase.from('students').select('*');
    if (sErr) throw sErr;

    // 4. Assignments
    const { data: aRows, error: aErr } = await supabase.from('assignments').select('*');
    if (aErr) throw aErr;

    // 5. Student Assignments
    const { data: saRows, error: saErr } = await supabase.from('student_assignments').select('*');
    if (saErr) throw saErr;

    // 6. Grades
    const { data: gRows, error: gErr } = await supabase.from('grades').select('*');
    if (gErr) throw gErr;

    // 7. Attendance
    const { data: attRows, error: attErr } = await supabase.from('attendance').select('*');
    if (attErr) throw attErr;

    // Transform back to App models
    const p = pRows?.[0];
    const teacherProfile: TeacherProfile = {
      name: p?.name || 'Thầy Kiều Cao Long',
      subject: p?.subject || 'Toán học',
      schoolName: p?.school_name || 'THCS Thạch Thất 2',
      schoolLevel: p?.school_level || 'THCS',
      branch: p?.branch || 'Tổ Tự Nhiên',
      phone: p?.phone || '',
      email: p?.email || '',
      themeColor: p?.theme_color || 'indigo',
      soundEnabled: p?.sound_enabled ?? true,
      gradingWeights: p?.grading_weights || { TX: 1, BT: 1, GK: 2, CK: 3 },
    };

    const classes: ClassItem[] = (cRows || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      grade: c.grade,
      room: c.room || '',
      homeroomTeacher: c.homeroom_teacher || '',
      academicYear: c.academic_year || '2026 - 2027',
      notes: c.notes || '',
    }));

    const students: Student[] = (sRows || []).map((s: any) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      gender: s.gender,
      classId: s.class_id,
      className: s.class_name,
      birthDate: s.birth_date || '',
      notes: s.notes || '',
    }));

    const assignments: Assignment[] = (aRows || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      subject: a.subject,
      content: a.content || '',
      classIds: Array.isArray(a.class_ids) ? a.class_ids : [],
      assignedDate: a.assigned_date || '',
      dueDate: a.due_date || '',
      status: a.status || 'Đang giao',
      maxScore: Number(a.max_score) || 10,
    }));

    const studentAssignments: StudentAssignmentStatus[] = (saRows || []).map((sa: any) => ({
      assignmentId: sa.assignment_id,
      studentId: sa.student_id,
      isCompleted: Boolean(sa.is_completed),
      completedAt: sa.completed_at || undefined,
      note: sa.note || '',
    }));

    const grades: GradeRecord[] = (gRows || []).map((g: any) => ({
      id: g.id,
      studentId: g.student_id,
      classId: g.class_id,
      assignmentId: g.assignment_id || undefined,
      examType: g.exam_type,
      title: g.title,
      score: Number(g.score) || 0,
      date: g.date || '',
      notes: g.notes || '',
    }));

    const attendance: AttendanceRecord[] = (attRows || []).map((att: any) => ({
      id: att.id,
      studentId: att.student_id,
      classId: att.class_id,
      date: att.date,
      status: att.status,
      note: att.note || '',
    }));

    // 8. Fetch App Users
    try {
      const { data: uRows } = await supabase.from('app_users').select('*');
      if (uRows && uRows.length > 0) {
        const rawLocal = localStorage.getItem('thay_long_registered_users_v1');
        const localUsers = rawLocal ? JSON.parse(rawLocal) : [];
        const userMap = new Map(localUsers.map((u: any) => [u.username, u]));
        uRows.forEach((r: any) => {
          userMap.set(r.username, {
            id: r.id,
            username: r.username,
            passwordHash: r.password_hash,
            fullName: r.full_name,
            email: r.email || undefined,
            role: r.role || 'teacher',
            createdAt: r.created_at,
          });
        });
        localStorage.setItem(
          'thay_long_registered_users_v1',
          JSON.stringify(Array.from(userMap.values()))
        );
      }
    } catch {
      // Skip if app_users table is not yet accessible
    }

    return {
      success: true,
      data: {
        teacherProfile,
        classes,
        students,
        assignments,
        studentAssignments,
        grades,
        attendance,
      },
      message: 'Đã tải dữ liệu từ Supabase về thành công!',
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      message: `Lỗi tải dữ liệu từ Supabase: ${err?.message || err}`,
    };
  }
}
