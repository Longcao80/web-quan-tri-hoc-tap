import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  collection,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, User } from '../firebase';
import {
  TeacherProfile,
  ClassItem,
  Student,
  Assignment,
  StudentAssignmentStatus,
  GradeRecord,
  AttendanceRecord,
} from '../types';

export interface FullSyncData {
  teacherProfile: TeacherProfile;
  classes: ClassItem[];
  students: Student[];
  assignments: Assignment[];
  studentAssignments: StudentAssignmentStatus[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
}

export function sanitizeDocId(id: string): string {
  // Ensure document ID conforms to ^[a-zA-Z0-9_\-]+$
  return id.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 128);
}

// 1. Save Teacher Profile
export async function saveTeacherProfileToCloud(user: User, profile: TeacherProfile) {
  const teacherId = sanitizeDocId(user.uid);
  const path = `teachers/${teacherId}`;
  try {
    const data = {
      id: teacherId,
      name: profile.name.slice(0, 100),
      subject: profile.subject.slice(0, 100),
      schoolName: profile.schoolName.slice(0, 150),
      schoolLevel: (profile.schoolLevel || 'THCS').slice(0, 100),
      branch: (profile.branch || '').slice(0, 100),
      phone: (profile.phone || '').slice(0, 30),
      email: (user.email || profile.email || 'teacher@school.edu.vn').slice(0, 150),
      themeColor: profile.themeColor || 'indigo',
      soundEnabled: Boolean(profile.soundEnabled),
      gradingWeights: profile.gradingWeights || { TX: 1, BT: 1, GK: 2, CK: 3 },
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'teachers', teacherId), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. Classes
export async function saveClassToCloud(user: User, item: ClassItem) {
  const teacherId = sanitizeDocId(user.uid);
  const classId = sanitizeDocId(item.id);
  const path = `teachers/${teacherId}/classes/${classId}`;
  try {
    const data = {
      id: classId,
      teacherId,
      name: item.name.slice(0, 50),
      grade: Number(item.grade) || 6,
      room: (item.room || '').slice(0, 50),
      homeroomTeacher: (item.homeroomTeacher || 'Chưa phân công').slice(0, 100),
      academicYear: (item.academicYear || '2026 - 2027').slice(0, 30),
      notes: (item.notes || '').slice(0, 500),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'teachers', teacherId, 'classes', classId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClassFromCloud(user: User, rawClassId: string) {
  const teacherId = sanitizeDocId(user.uid);
  const classId = sanitizeDocId(rawClassId);
  const path = `teachers/${teacherId}/classes/${classId}`;
  try {
    await deleteDoc(doc(db, 'teachers', teacherId, 'classes', classId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Students
export async function saveStudentToCloud(user: User, item: Student) {
  const teacherId = sanitizeDocId(user.uid);
  const studentId = sanitizeDocId(item.id);
  const path = `teachers/${teacherId}/students/${studentId}`;
  try {
    const data = {
      id: studentId,
      teacherId,
      code: item.code.slice(0, 50),
      name: item.name.slice(0, 100),
      gender: item.gender === 'Nữ' ? 'Nữ' : 'Nam',
      classId: sanitizeDocId(item.classId),
      className: item.className.slice(0, 50),
      birthDate: (item.birthDate || '').slice(0, 30),
      notes: (item.notes || '').slice(0, 500),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'teachers', teacherId, 'students', studentId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStudentFromCloud(user: User, rawStudentId: string) {
  const teacherId = sanitizeDocId(user.uid);
  const studentId = sanitizeDocId(rawStudentId);
  const path = `teachers/${teacherId}/students/${studentId}`;
  try {
    await deleteDoc(doc(db, 'teachers', teacherId, 'students', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 4. Assignments
export async function saveAssignmentToCloud(user: User, item: Assignment) {
  const teacherId = sanitizeDocId(user.uid);
  const asgId = sanitizeDocId(item.id);
  const path = `teachers/${teacherId}/assignments/${asgId}`;
  try {
    const data = {
      id: asgId,
      teacherId,
      title: item.title.slice(0, 200),
      subject: item.subject.slice(0, 100),
      content: (item.content || '').slice(0, 2000),
      classIds: item.classIds.map((c) => sanitizeDocId(c)),
      assignedDate: (item.assignedDate || '').slice(0, 30),
      dueDate: (item.dueDate || '').slice(0, 30),
      status: ['Đang giao', 'Đã hoàn thành', 'Đã đóng'].includes(item.status)
        ? item.status
        : 'Đang giao',
      maxScore: Number(item.maxScore) || 10,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'teachers', teacherId, 'assignments', asgId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAssignmentFromCloud(user: User, rawAsgId: string) {
  const teacherId = sanitizeDocId(user.uid);
  const asgId = sanitizeDocId(rawAsgId);
  const path = `teachers/${teacherId}/assignments/${asgId}`;
  try {
    await deleteDoc(doc(db, 'teachers', teacherId, 'assignments', asgId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 5. Grades
export async function saveGradeToCloud(user: User, item: GradeRecord) {
  const teacherId = sanitizeDocId(user.uid);
  const gradeId = sanitizeDocId(item.id);
  const path = `teachers/${teacherId}/grades/${gradeId}`;
  try {
    const data = {
      id: gradeId,
      teacherId,
      studentId: sanitizeDocId(item.studentId),
      classId: sanitizeDocId(item.classId),
      assignmentId: item.assignmentId ? sanitizeDocId(item.assignmentId) : '',
      examType: ['TX', 'BT', 'GK', 'CK'].includes(item.examType) ? item.examType : 'TX',
      title: item.title.slice(0, 150),
      score: Math.max(0, Math.min(10, Number(item.score) || 0)),
      date: (item.date || '').slice(0, 30),
      notes: (item.notes || '').slice(0, 500),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'teachers', teacherId, 'grades', gradeId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGradeFromCloud(user: User, rawGradeId: string) {
  const teacherId = sanitizeDocId(user.uid);
  const gradeId = sanitizeDocId(rawGradeId);
  const path = `teachers/${teacherId}/grades/${gradeId}`;
  try {
    await deleteDoc(doc(db, 'teachers', teacherId, 'grades', gradeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 6. Attendance
export async function saveAttendanceToCloud(user: User, item: AttendanceRecord) {
  const teacherId = sanitizeDocId(user.uid);
  const attId = sanitizeDocId(item.id);
  const path = `teachers/${teacherId}/attendance/${attId}`;
  try {
    const data = {
      id: attId,
      teacherId,
      studentId: sanitizeDocId(item.studentId),
      classId: sanitizeDocId(item.classId),
      date: (item.date || '').slice(0, 30),
      status: ['present', 'absent_excused', 'absent_unexcused'].includes(item.status)
        ? item.status
        : 'present',
      note: (item.note || '').slice(0, 300),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'teachers', teacherId, 'attendance', attId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAttendanceFromCloud(user: User, rawAttId: string) {
  const teacherId = sanitizeDocId(user.uid);
  const attId = sanitizeDocId(rawAttId);
  const path = `teachers/${teacherId}/attendance/${attId}`;
  try {
    await deleteDoc(doc(db, 'teachers', teacherId, 'attendance', attId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 7. StudentAssignmentStatus
export async function saveStudentAssignmentToCloud(user: User, item: StudentAssignmentStatus) {
  const teacherId = sanitizeDocId(user.uid);
  const statusId = sanitizeDocId(`${item.assignmentId}_${item.studentId}`);
  const path = `teachers/${teacherId}/studentAssignments/${statusId}`;
  try {
    const data = {
      id: statusId,
      teacherId,
      assignmentId: sanitizeDocId(item.assignmentId),
      studentId: sanitizeDocId(item.studentId),
      isCompleted: Boolean(item.isCompleted),
      completedAt: (item.completedAt || '').slice(0, 50),
      note: (item.note || '').slice(0, 300),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'teachers', teacherId, 'studentAssignments', statusId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 8. Bulk upload everything to cloud
export async function uploadFullDataToCloud(user: User, data: FullSyncData) {
  const teacherId = sanitizeDocId(user.uid);
  // 1. Profile
  await saveTeacherProfileToCloud(user, data.teacherProfile);

  // 2. Classes
  for (const c of data.classes) {
    await saveClassToCloud(user, c);
  }

  // 3. Students
  for (const s of data.students) {
    await saveStudentToCloud(user, s);
  }

  // 4. Assignments
  for (const a of data.assignments) {
    await saveAssignmentToCloud(user, a);
  }

  // 5. Grades
  for (const g of data.grades) {
    await saveGradeToCloud(user, g);
  }

  // 6. Attendance
  for (const att of data.attendance) {
    await saveAttendanceToCloud(user, att);
  }

  // 7. Student Assignment Statuses
  for (const sa of data.studentAssignments) {
    await saveStudentAssignmentToCloud(user, sa);
  }
}

// 9. Fetch all from cloud
export async function fetchFullDataFromCloud(user: User): Promise<FullSyncData | null> {
  const teacherId = sanitizeDocId(user.uid);
  const profilePath = `teachers/${teacherId}`;
  try {
    const profileSnap = await getDoc(doc(db, 'teachers', teacherId));
    if (!profileSnap.exists()) {
      return null;
    }
    const profileData = profileSnap.data();

    // Fetch classes
    const classesSnap = await getDocs(collection(db, 'teachers', teacherId, 'classes'));
    const classes: ClassItem[] = classesSnap.docs.map((d) => d.data() as ClassItem);

    // Fetch students
    const studentsSnap = await getDocs(collection(db, 'teachers', teacherId, 'students'));
    const students: Student[] = studentsSnap.docs.map((d) => d.data() as Student);

    // Fetch assignments
    const asgSnap = await getDocs(collection(db, 'teachers', teacherId, 'assignments'));
    const assignments: Assignment[] = asgSnap.docs.map((d) => d.data() as Assignment);

    // Fetch grades
    const gradesSnap = await getDocs(collection(db, 'teachers', teacherId, 'grades'));
    const grades: GradeRecord[] = gradesSnap.docs.map((d) => d.data() as GradeRecord);

    // Fetch attendance
    const attSnap = await getDocs(collection(db, 'teachers', teacherId, 'attendance'));
    const attendance: AttendanceRecord[] = attSnap.docs.map((d) => d.data() as AttendanceRecord);

    // Fetch studentAssignments
    const saSnap = await getDocs(collection(db, 'teachers', teacherId, 'studentAssignments'));
    const studentAssignments: StudentAssignmentStatus[] = saSnap.docs.map(
      (d) => d.data() as StudentAssignmentStatus
    );

    const teacherProfile: TeacherProfile = {
      name: profileData.name || 'Thầy Kiều Cao Long',
      subject: profileData.subject || 'Toán học',
      schoolName: profileData.schoolName || 'THCS Thạch Thất 2',
      schoolLevel: profileData.schoolLevel || 'THCS',
      branch: profileData.branch || 'Tổ Tự Nhiên',
      phone: profileData.phone || '',
      email: profileData.email || user.email || '',
      themeColor: profileData.themeColor || 'indigo',
      soundEnabled: profileData.soundEnabled ?? true,
      gradingWeights: profileData.gradingWeights || { TX: 1, BT: 1, GK: 2, CK: 3 },
    };

    return {
      teacherProfile,
      classes,
      students,
      assignments,
      studentAssignments,
      grades,
      attendance,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, profilePath);
    return null;
  }
}
