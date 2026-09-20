import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  TeacherProfile,
  ClassItem,
  Student,
  Assignment,
  StudentAssignmentStatus,
  GradeRecord,
  AttendanceRecord,
  TabType,
  StudentProgressSummary,
  ProgressStatus,
} from '../types';
import {
  initialTeacherProfile,
  initialClasses,
  initialStudents,
  initialAssignments,
  initialStudentAssignments,
  initialGrades,
  initialAttendance,
} from '../data/mockData';
import { playFeedbackSound } from '../utils/sound';
import {
  auth,
  onAuthStateChanged,
  loginWithGoogle,
  logoutUser,
  testConnection,
  User,
} from '../firebase';
import {
  saveTeacherProfileToCloud,
  saveClassToCloud,
  deleteClassFromCloud,
  saveStudentToCloud,
  deleteStudentFromCloud,
  saveAssignmentToCloud,
  deleteAssignmentFromCloud,
  saveGradeToCloud,
  deleteGradeFromCloud,
  saveAttendanceToCloud,
  deleteAttendanceFromCloud,
  saveStudentAssignmentToCloud,
  uploadFullDataToCloud,
  fetchFullDataFromCloud,
} from '../services/firestoreSync';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  teacherProfile: TeacherProfile;
  updateTeacherProfile: (profile: Partial<TeacherProfile>) => void;
  classes: ClassItem[];
  addClass: (cls: Omit<ClassItem, 'id'>) => void;
  updateClass: (id: string, cls: Partial<ClassItem>) => void;
  deleteClass: (id: string) => void;
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  addStudentsBatch: (newStudents: Omit<Student, 'id'>[], updateExisting?: boolean) => { added: number; updated: number };
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  assignments: Assignment[];
  addAssignment: (asg: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, asg: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  studentAssignments: StudentAssignmentStatus[];
  toggleAssignmentCompletion: (assignmentId: string, studentId: string, isCompleted: boolean) => void;
  grades: GradeRecord[];
  addGrade: (grade: Omit<GradeRecord, 'id'>) => void;
  updateGrade: (id: string, grade: Partial<GradeRecord>) => void;
  deleteGrade: (id: string) => void;
  attendance: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  markBatchAttendance: (classId: string, date: string, status: 'present' | 'absent_excused' | 'absent_unexcused') => void;
  // Computed helpers
  getStudentProgress: (student: Student) => StudentProgressSummary;
  overallStats: {
    totalClasses: number;
    totalStudents: number;
    activeAssignments: number;
    completedAssignments: number;
    averageScore: number;
    completionRate: number;
    attendanceRate: number;
    attentionNeededCount: number;
  };
  // System actions
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  exportToCSV: (type: 'students' | 'grades' | 'attendance' | 'summary') => void;
  // Cloud sync
  currentUser: User | null;
  cloudSyncStatus: 'disconnected' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: Date | null;
  cloudError: string | null;
  loginGoogle: () => Promise<void>;
  logoutGoogle: () => Promise<void>;
  syncNowToCloud: () => Promise<void>;
  syncNowFromCloud: () => Promise<void>;
}

const LOCAL_STORAGE_KEY = 'thay_kieu_cao_long_qlht_v1';

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Load persistent state
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_profile`);
      return saved ? JSON.parse(saved) : initialTeacherProfile;
    } catch {
      return initialTeacherProfile;
    }
  });

  const [classes, setClasses] = useState<ClassItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_classes`);
      return saved ? JSON.parse(saved) : initialClasses;
    } catch {
      return initialClasses;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_assignments`);
      return saved ? JSON.parse(saved) : initialAssignments;
    } catch {
      return initialAssignments;
    }
  });

  const [studentAssignments, setStudentAssignments] = useState<StudentAssignmentStatus[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_studentAssignments`);
      return saved ? JSON.parse(saved) : initialStudentAssignments;
    } catch {
      return initialStudentAssignments;
    }
  });

  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_grades`);
      return saved ? JSON.parse(saved) : initialGrades;
    } catch {
      return initialGrades;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_attendance`);
      return saved ? JSON.parse(saved) : initialAttendance;
    } catch {
      return initialAttendance;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_profile`, JSON.stringify(teacherProfile));
    } catch (e) {
      console.error(e);
    }
  }, [teacherProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_classes`, JSON.stringify(classes));
    } catch (e) {
      console.error(e);
    }
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_students`, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_assignments`, JSON.stringify(assignments));
    } catch (e) {
      console.error(e);
    }
  }, [assignments]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_studentAssignments`, JSON.stringify(studentAssignments));
    } catch (e) {
      console.error(e);
    }
  }, [studentAssignments]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_grades`, JSON.stringify(grades));
    } catch (e) {
      console.error(e);
    }
  }, [grades]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(attendance));
    } catch (e) {
      console.error(e);
    }
  }, [attendance]);

  // Cloud sync states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'disconnected' | 'syncing' | 'synced' | 'error'>('disconnected');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);

  // Initialize connection test and Firebase auth listener
  useEffect(() => {
    testConnection().then((ok) => {
      if (ok) {
        console.log('Firebase connection ready');
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setCloudSyncStatus('syncing');
        try {
          const cloudData = await fetchFullDataFromCloud(user);
          if (cloudData && (cloudData.classes.length > 0 || cloudData.students.length > 0)) {
            setTeacherProfile(cloudData.teacherProfile);
            setClasses(cloudData.classes);
            setStudents(cloudData.students);
            setAssignments(cloudData.assignments);
            setStudentAssignments(cloudData.studentAssignments);
            setGrades(cloudData.grades);
            setAttendance(cloudData.attendance);
            setCloudSyncStatus('synced');
            setLastSyncedAt(new Date());
            showToast(`Đã đồng bộ dữ liệu đám mây (${user.email})!`, 'success');
          } else {
            // First time cloud setup: upload current state
            await uploadFullDataToCloud(user, {
              teacherProfile,
              classes,
              students,
              assignments,
              studentAssignments,
              grades,
              attendance,
            });
            setCloudSyncStatus('synced');
            setLastSyncedAt(new Date());
            showToast(`Đã lưu toàn bộ dữ liệu ban đầu lên đám mây (${user.email})!`, 'success');
          }
        } catch (err: any) {
          console.error('Lỗi đồng bộ đám mây:', err);
          setCloudSyncStatus('error');
          setCloudError(err?.message || 'Không thể đồng bộ đám mây');
        }
      } else {
        setCloudSyncStatus('disconnected');
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper for background cloud writes
  const triggerCloudWrite = useCallback(async (writeFn: () => Promise<void>) => {
    if (!currentUser) return;
    try {
      setCloudSyncStatus('syncing');
      await writeFn();
      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Lỗi lưu đám mây:', err);
      setCloudSyncStatus('error');
      setCloudError(err?.message || 'Lỗi cập nhật dữ liệu ra đám mây');
    }
  }, [currentUser]);

  // Toast handler
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type === 'success') {
      playFeedbackSound('success', teacherProfile.soundEnabled);
    } else if (type === 'error') {
      playFeedbackSound('delete', teacherProfile.soundEnabled);
    } else {
      playFeedbackSound('notify', teacherProfile.soundEnabled);
    }
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, [teacherProfile.soundEnabled]);

  // Profile actions
  const updateTeacherProfile = (updated: Partial<TeacherProfile>) => {
    const newProfile = { ...teacherProfile, ...updated };
    setTeacherProfile(newProfile);
    showToast('Đã lưu thông tin cấu hình thành công.');
    if (currentUser) {
      triggerCloudWrite(() => saveTeacherProfileToCloud(currentUser, newProfile));
    }
  };

  // Class actions
  const addClass = (cls: Omit<ClassItem, 'id'>) => {
    const id = 'class-' + Date.now();
    const newClass: ClassItem = { ...cls, id };
    setClasses((prev) => [...prev, newClass]);
    showToast(`Đã thêm lớp ${cls.name} thành công.`);
    if (currentUser) {
      triggerCloudWrite(() => saveClassToCloud(currentUser, newClass));
    }
  };

  const updateClass = (id: string, updated: Partial<ClassItem>) => {
    let updatedClassItem: ClassItem | null = null;
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedClassItem = { ...c, ...updated };
          return updatedClassItem;
        }
        return c;
      })
    );
    // If name changed, also update students
    if (updated.name) {
      setStudents((prev) =>
        prev.map((s) => (s.classId === id ? { ...s, className: updated.name! } : s))
      );
    }
    showToast('Đã cập nhật thông tin lớp học thành công.');
    if (currentUser && updatedClassItem) {
      triggerCloudWrite(() => saveClassToCloud(currentUser, updatedClassItem!));
    }
  };

  const deleteClass = (id: string) => {
    const target = classes.find((c) => c.id === id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    // Remove students in this class
    setStudents((prev) => prev.filter((s) => s.classId !== id));
    // Remove grades in this class
    setGrades((prev) => prev.filter((g) => g.classId !== id));
    // Remove attendance
    setAttendance((prev) => prev.filter((a) => a.classId !== id));
    // Remove from assignments
    setAssignments((prev) =>
      prev.map((asg) => ({
        ...asg,
        classIds: asg.classIds.filter((cid) => cid !== id),
      }))
    );
    showToast(`Đã xóa lớp ${target?.name || ''} và dữ liệu liên quan.`, 'info');
    if (currentUser) {
      triggerCloudWrite(() => deleteClassFromCloud(currentUser, id));
    }
  };

  // Student actions
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const id = 's-' + Date.now();
    const newStudent: Student = { ...studentData, id };
    setStudents((prev) => [...prev, newStudent]);
    showToast(`Đã thêm học sinh ${studentData.name} thành công.`);
    if (currentUser) {
      triggerCloudWrite(() => saveStudentToCloud(currentUser, newStudent));
    }
  };

  const addStudentsBatch = (
    newStudentsData: Omit<Student, 'id'>[],
    updateExisting = false
  ) => {
    let addedCount = 0;
    let updatedCount = 0;
    const modifiedOrCreatedStudents: Student[] = [];

    setStudents((prev) => {
      const studentMap = new Map(prev.map((s) => [s.code.trim().toUpperCase(), s]));
      const next = [...prev];

      newStudentsData.forEach((sData, idx) => {
        const normalizedCode = sData.code.trim().toUpperCase();
        if (updateExisting && studentMap.has(normalizedCode)) {
          const existing = studentMap.get(normalizedCode)!;
          const targetIdx = next.findIndex((item) => item.id === existing.id);
          if (targetIdx !== -1) {
            const updatedStudent: Student = {
              ...existing,
              name: sData.name,
              gender: sData.gender,
              classId: sData.classId,
              className: sData.className,
              birthDate: sData.birthDate || existing.birthDate,
              notes: sData.notes || existing.notes,
            };
            next[targetIdx] = updatedStudent;
            modifiedOrCreatedStudents.push(updatedStudent);
            updatedCount++;
          }
        } else {
          const newId = `s-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
          const newStudent: Student = {
            ...sData,
            id: newId,
          };
          next.push(newStudent);
          modifiedOrCreatedStudents.push(newStudent);
          addedCount++;
        }
      });

      return next;
    });

    if (addedCount > 0 && updatedCount > 0) {
      showToast(`Đã thêm mới ${addedCount} học sinh và cập nhật ${updatedCount} học sinh từ Excel.`);
    } else if (addedCount > 0) {
      showToast(`Đã thêm thành công ${addedCount} học sinh từ file Excel.`);
    } else if (updatedCount > 0) {
      showToast(`Đã cập nhật thông tin cho ${updatedCount} học sinh từ file Excel.`);
    }

    if (currentUser && modifiedOrCreatedStudents.length > 0) {
      triggerCloudWrite(async () => {
        for (const st of modifiedOrCreatedStudents) {
          await saveStudentToCloud(currentUser, st);
        }
      });
    }

    return { added: addedCount, updated: updatedCount };
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    let updatedStudentItem: Student | null = null;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedStudentItem = { ...s, ...updated };
          return updatedStudentItem;
        }
        return s;
      })
    );
    showToast('Đã lưu thông tin học sinh thành công.');
    if (currentUser && updatedStudentItem) {
      triggerCloudWrite(() => saveStudentToCloud(currentUser, updatedStudentItem!));
    }
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setGrades((prev) => prev.filter((g) => g.studentId !== id));
    setAttendance((prev) => prev.filter((a) => a.studentId !== id));
    setStudentAssignments((prev) => prev.filter((sa) => sa.studentId !== id));
    showToast(`Đã xóa học sinh ${target?.name || ''}.`, 'info');
    if (currentUser) {
      triggerCloudWrite(() => deleteStudentFromCloud(currentUser, id));
    }
  };

  // Assignment actions
  const addAssignment = (asgData: Omit<Assignment, 'id'>) => {
    const id = 'asg-' + Date.now();
    const newAsg: Assignment = { ...asgData, id };
    setAssignments((prev) => [newAsg, ...prev]);
    showToast(`Đã tạo bài tập "${asgData.title}" thành công.`);
    if (currentUser) {
      triggerCloudWrite(() => saveAssignmentToCloud(currentUser, newAsg));
    }
  };

  const updateAssignment = (id: string, updated: Partial<Assignment>) => {
    let updatedAsgItem: Assignment | null = null;
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          updatedAsgItem = { ...a, ...updated };
          return updatedAsgItem;
        }
        return a;
      })
    );
    showToast('Đã cập nhật bài tập thành công.');
    if (currentUser && updatedAsgItem) {
      triggerCloudWrite(() => saveAssignmentToCloud(currentUser, updatedAsgItem!));
    }
  };

  const deleteAssignment = (id: string) => {
    const target = assignments.find((a) => a.id === id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setStudentAssignments((prev) => prev.filter((sa) => sa.assignmentId !== id));
    showToast(`Đã xóa bài tập "${target?.title || ''}".`, 'info');
    if (currentUser) {
      triggerCloudWrite(() => deleteAssignmentFromCloud(currentUser, id));
    }
  };

  const toggleAssignmentCompletion = (assignmentId: string, studentId: string, isCompleted: boolean) => {
    const statusRecord: StudentAssignmentStatus = {
      assignmentId,
      studentId,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString().split('T')[0] : undefined,
    };
    setStudentAssignments((prev) => {
      const exists = prev.find((sa) => sa.assignmentId === assignmentId && sa.studentId === studentId);
      if (exists) {
        return prev.map((sa) =>
          sa.assignmentId === assignmentId && sa.studentId === studentId ? statusRecord : sa
        );
      } else {
        return [...prev, statusRecord];
      }
    });
    playFeedbackSound('click', teacherProfile.soundEnabled);
    if (currentUser) {
      triggerCloudWrite(() => saveStudentAssignmentToCloud(currentUser, statusRecord));
    }
  };

  // Grade actions
  const addGrade = (gradeData: Omit<GradeRecord, 'id'>) => {
    const id = 'g-' + Date.now();
    const newGrade: GradeRecord = { ...gradeData, id };
    setGrades((prev) => [newGrade, ...prev]);
    showToast('Đã nhập điểm thành công.');
    if (currentUser) {
      triggerCloudWrite(() => saveGradeToCloud(currentUser, newGrade));
    }
  };

  const updateGrade = (id: string, updated: Partial<GradeRecord>) => {
    let updatedGradeItem: GradeRecord | null = null;
    setGrades((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          updatedGradeItem = { ...g, ...updated };
          return updatedGradeItem;
        }
        return g;
      })
    );
    showToast('Đã cập nhật điểm thành công.');
    if (currentUser && updatedGradeItem) {
      triggerCloudWrite(() => saveGradeToCloud(currentUser, updatedGradeItem!));
    }
  };

  const deleteGrade = (id: string) => {
    setGrades((prev) => prev.filter((g) => g.id !== id));
    showToast('Đã xóa điểm thành công.', 'info');
    if (currentUser) {
      triggerCloudWrite(() => deleteGradeFromCloud(currentUser, id));
    }
  };

  // Attendance actions
  const markAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    let finalRecord: AttendanceRecord;
    setAttendance((prev) => {
      const idx = prev.findIndex(
        (a) => a.studentId === record.studentId && a.date === record.date && a.classId === record.classId
      );
      if (idx >= 0) {
        const next = [...prev];
        finalRecord = { ...next[idx], ...record };
        next[idx] = finalRecord;
        return next;
      }
      finalRecord = { ...record, id: 'att-' + Date.now() + Math.random().toString(36).substring(2, 5) };
      return [...prev, finalRecord];
    });
    playFeedbackSound('click', teacherProfile.soundEnabled);
    if (currentUser) {
      triggerCloudWrite(() => saveAttendanceToCloud(currentUser, finalRecord));
    }
  };

  const markBatchAttendance = (
    classId: string,
    date: string,
    status: 'present' | 'absent_excused' | 'absent_unexcused'
  ) => {
    const classStudents = students.filter((s) => s.classId === classId);
    const additions: AttendanceRecord[] = classStudents.map((s) => ({
      id: 'att-' + Date.now() + '-' + s.id,
      studentId: s.id,
      classId,
      date,
      status,
    }));
    setAttendance((prev) => {
      const filtered = prev.filter((a) => !(a.classId === classId && a.date === date));
      return [...filtered, ...additions];
    });
    const statusText = status === 'present' ? 'Có mặt' : status === 'absent_excused' ? 'Có phép' : 'Vắng';
    showToast(`Đã ghi nhận toàn bộ lớp (${statusText}) cho ngày ${date}.`);
    if (currentUser && additions.length > 0) {
      triggerCloudWrite(async () => {
        for (const item of additions) {
          await saveAttendanceToCloud(currentUser, item);
        }
      });
    }
  };

  // Student progress calculation
  const getStudentProgress = useCallback(
    (student: Student): StudentProgressSummary => {
      // Assignments relevant to student's class
      const relevantAssignments = assignments.filter((a) => a.classIds.includes(student.classId));
      const totalAssigned = relevantAssignments.length;

      let totalCompleted = 0;
      relevantAssignments.forEach((asg) => {
        const sa = studentAssignments.find(
          (s) => s.assignmentId === asg.id && s.studentId === student.id
        );
        if (sa && sa.isCompleted) {
          totalCompleted += 1;
        }
      });

      const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 100;

      // Calculate GPA using weights
      const studentGrades = grades.filter((g) => g.studentId === student.id);
      let averageScore: number | null = null;
      if (studentGrades.length > 0) {
        let weightedSum = 0;
        let totalWeight = 0;
        studentGrades.forEach((g) => {
          const w = teacherProfile.gradingWeights[g.examType] || 1;
          weightedSum += g.score * w;
          totalWeight += w;
        });
        averageScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : null;
      }

      let status: ProgressStatus = 'Đang thực hiện';
      if (completionRate >= 80 && (averageScore === null || averageScore >= 6.5)) {
        status = 'Hoàn thành tốt';
      } else if (completionRate < 60 || (averageScore !== null && averageScore < 5.0)) {
        status = 'Chưa hoàn thành';
      } else {
        status = 'Đang thực hiện';
      }

      return {
        student,
        totalAssigned,
        totalCompleted,
        completionRate,
        averageScore,
        status,
      };
    },
    [assignments, studentAssignments, grades, teacherProfile.gradingWeights]
  );

  // Overall Statistics
  const overallStats = useMemo(() => {
    const totalClasses = classes.length;
    const totalStudents = students.length;
    const activeAssignments = assignments.filter((a) => a.status === 'Đang giao').length;
    const completedAssignments = assignments.filter((a) => a.status === 'Đã hoàn thành' || a.status === 'Đã đóng').length;

    // Average grade across all students
    const validGrades = grades.map((g) => g.score);
    const averageScore =
      validGrades.length > 0
        ? Math.round((validGrades.reduce((a, b) => a + b, 0) / validGrades.length) * 10) / 10
        : 0;

    // Overall assignment completion
    let assignedOccurrences = 0;
    let completedOccurrences = 0;

    assignments.forEach((asg) => {
      const eligibleStudentCount = students.filter((s) => asg.classIds.includes(s.classId)).length;
      assignedOccurrences += eligibleStudentCount;

      const completedForThis = studentAssignments.filter(
        (sa) => sa.assignmentId === asg.id && sa.isCompleted
      ).length;
      completedOccurrences += completedForThis;
    });

    const completionRate =
      assignedOccurrences > 0 ? Math.round((completedOccurrences / assignedOccurrences) * 100) : 100;

    // Attendance rate
    const totalAtt = attendance.length;
    const presentAtt = attendance.filter((a) => a.status === 'present').length;
    const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

    // Students needing attention
    let attentionNeededCount = 0;
    students.forEach((s) => {
      const p = getStudentProgress(s);
      if (p.status === 'Chưa hoàn thành' || (p.averageScore !== null && p.averageScore < 5.5)) {
        attentionNeededCount++;
      }
    });

    return {
      totalClasses,
      totalStudents,
      activeAssignments,
      completedAssignments,
      averageScore,
      completionRate,
      attendanceRate,
      attentionNeededCount,
    };
  }, [classes, students, assignments, grades, studentAssignments, attendance, getStudentProgress]);

  // Data management
  const resetToSampleData = () => {
    setTeacherProfile(initialTeacherProfile);
    setClasses(initialClasses);
    setStudents(initialStudents);
    setAssignments(initialAssignments);
    setStudentAssignments(initialStudentAssignments);
    setGrades(initialGrades);
    setAttendance(initialAttendance);
    showToast('Đã khôi phục dữ liệu mẫu ban đầu của Thầy Kiều Cao Long thành công.');
  };

  const clearAllData = () => {
    setClasses([]);
    setStudents([]);
    setAssignments([]);
    setStudentAssignments([]);
    setGrades([]);
    setAttendance([]);
    showToast('Đã xóa toàn bộ dữ liệu quản trị.', 'info');
  };

  const exportDataJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      teacherProfile,
      classes,
      students,
      assignments,
      studentAssignments,
      grades,
      attendance,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Du_lieu_Thay_Kieu_Cao_Long_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Đã xuất file dữ liệu JSON thành công.');
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.teacherProfile) setTeacherProfile(parsed.teacherProfile);
      if (Array.isArray(parsed.classes)) setClasses(parsed.classes);
      if (Array.isArray(parsed.students)) setStudents(parsed.students);
      if (Array.isArray(parsed.assignments)) setAssignments(parsed.assignments);
      if (Array.isArray(parsed.studentAssignments)) setStudentAssignments(parsed.studentAssignments);
      if (Array.isArray(parsed.grades)) setGrades(parsed.grades);
      if (Array.isArray(parsed.attendance)) setAttendance(parsed.attendance);
      showToast('Đã nạp và khôi phục dữ liệu từ file thành công!');
      return true;
    } catch {
      showToast('File dữ liệu không đúng định dạng. Vui lòng kiểm tra lại.', 'error');
      return false;
    }
  };

  const exportToCSV = (type: 'students' | 'grades' | 'attendance' | 'summary') => {
    let csvContent = '\uFEFF'; // BOM for Excel UTF-8 display

    if (type === 'students') {
      csvContent += 'Mã HS,Họ và Tên,Lớp,Giới tính,Ngày sinh,Điểm TB,Tỷ lệ hoàn thành,Trạng thái,Ghi chú\n';
      students.forEach((s) => {
        const prog = getStudentProgress(s);
        const row = [
          `"${s.code}"`,
          `"${s.name}"`,
          `"${s.className}"`,
          `"${s.gender}"`,
          `"${s.birthDate || ''}"`,
          `"${prog.averageScore !== null ? prog.averageScore : 'Chưa có'}"`,
          `"${prog.completionRate}%"`,
          `"${prog.status}"`,
          `"${s.notes || ''}"`,
        ];
        csvContent += row.join(',') + '\n';
      });
    } else if (type === 'grades') {
      csvContent += 'Lớp,Mã HS,Họ và Tên,Loại điểm,Tên bài kiểm tra,Điểm số,Ngày kiểm tra,Ghi chú\n';
      grades.forEach((g) => {
        const s = students.find((st) => st.id === g.studentId);
        const c = classes.find((cl) => cl.id === g.classId);
        const typeLabels: Record<string, string> = {
          TX: 'Thường xuyên',
          BT: 'Bài tập',
          GK: 'Giữa kỳ',
          CK: 'Cuối kỳ',
        };
        const row = [
          `"${c?.name || ''}"`,
          `"${s?.code || ''}"`,
          `"${s?.name || ''}"`,
          `"${typeLabels[g.examType] || g.examType}"`,
          `"${g.title}"`,
          `"${g.score}"`,
          `"${g.date}"`,
          `"${g.notes || ''}"`,
        ];
        csvContent += row.join(',') + '\n';
      });
    } else if (type === 'attendance') {
      csvContent += 'Ngày,Lớp,Mã HS,Họ và Tên,Trạng thái,Ghi chú\n';
      attendance.forEach((a) => {
        const s = students.find((st) => st.id === a.studentId);
        const c = classes.find((cl) => cl.id === a.classId);
        const statusMap = {
          present: 'Có mặt',
          absent_excused: 'Có phép',
          absent_unexcused: 'Vắng không phép',
        };
        const row = [
          `"${a.date}"`,
          `"${c?.name || ''}"`,
          `"${s?.code || ''}"`,
          `"${s?.name || ''}"`,
          `"${statusMap[a.status] || a.status}"`,
          `"${a.note || ''}"`,
        ];
        csvContent += row.join(',') + '\n';
      });
    } else {
      // Summary
      csvContent += 'Báo cáo tổng hợp môn Toán - Thầy Kiều Cao Long\n';
      csvContent += `Thời điểm xuất: ${new Date().toLocaleString('vi-VN')}\n`;
      csvContent += `Tổng số lớp: ${classes.length}, Tổng số học sinh: ${students.length}\n`;
      csvContent += `Điểm trung bình toàn bộ: ${overallStats.averageScore}, Tỷ lệ hoàn thành bài tập: ${overallStats.completionRate}%\n\n`;
      csvContent += 'Lớp,Khối,Sĩ số,GV Chủ nhiệm,Điểm TB lớp,Tỷ lệ hoàn thành BT\n';
      classes.forEach((c) => {
        const cStudents = students.filter((s) => s.classId === c.id);
        const cGrades = grades.filter((g) => g.classId === c.id);
        const avg =
          cGrades.length > 0
            ? Math.round((cGrades.reduce((acc, curr) => acc + curr.score, 0) / cGrades.length) * 10) / 10
            : 'Chưa có';
        let totalAssigned = 0;
        let totalDone = 0;
        cStudents.forEach((st) => {
          const pr = getStudentProgress(st);
          totalAssigned += pr.totalAssigned;
          totalDone += pr.totalCompleted;
        });
        const compRate = totalAssigned > 0 ? Math.round((totalDone / totalAssigned) * 100) : 100;
        csvContent += `"${c.name}","Khối ${c.grade}","${cStudents.length}","${c.homeroomTeacher}","${avg}","${compRate}%"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_cao_${type}_Thay_Kieu_Cao_Long_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Đã xuất báo cáo CSV (${type}) thành công.`);
  };

  // Cloud actions
  const loginGoogle = async () => {
    try {
      setCloudSyncStatus('syncing');
      const user = await loginWithGoogle();
      showToast(`Đăng nhập thành công với tài khoản: ${user.email}`);
    } catch (err: any) {
      setCloudSyncStatus('error');
      showToast('Đăng nhập thất bại hoặc bị hủy: ' + (err?.message || ''), 'error');
    }
  };

  const logoutGoogle = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setCloudSyncStatus('disconnected');
      showToast('Đã đăng xuất tài khoản đồng bộ đám mây.', 'info');
    } catch (err: any) {
      showToast('Lỗi khi đăng xuất: ' + (err?.message || ''), 'error');
    }
  };

  const syncNowToCloud = async () => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập tài khoản Google để tải lên đám mây.', 'error');
      return;
    }
    try {
      setCloudSyncStatus('syncing');
      await uploadFullDataToCloud(currentUser, {
        teacherProfile,
        classes,
        students,
        assignments,
        studentAssignments,
        grades,
        attendance,
      });
      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date());
      showToast('Đã đồng bộ toàn bộ dữ liệu hiện tại lên Đám mây thành công!');
    } catch (err: any) {
      setCloudSyncStatus('error');
      showToast('Lỗi đồng bộ lên đám mây: ' + (err?.message || ''), 'error');
    }
  };

  const syncNowFromCloud = async () => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập tài khoản Google để tải dữ liệu từ đám mây.', 'error');
      return;
    }
    try {
      setCloudSyncStatus('syncing');
      const data = await fetchFullDataFromCloud(currentUser);
      if (data) {
        setTeacherProfile(data.teacherProfile);
        setClasses(data.classes);
        setStudents(data.students);
        setAssignments(data.assignments);
        setStudentAssignments(data.studentAssignments);
        setGrades(data.grades);
        setAttendance(data.attendance);
        setCloudSyncStatus('synced');
        setLastSyncedAt(new Date());
        showToast('Đã tải và cập nhật toàn bộ dữ liệu mới nhất từ Đám mây!');
      } else {
        showToast('Chưa có dữ liệu nào trên đám mây cho tài khoản này.', 'info');
        setCloudSyncStatus('synced');
      }
    } catch (err: any) {
      setCloudSyncStatus('error');
      showToast('Lỗi tải dữ liệu từ đám mây: ' + (err?.message || ''), 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        teacherProfile,
        updateTeacherProfile,
        classes,
        addClass,
        updateClass,
        deleteClass,
        students,
        addStudent,
        addStudentsBatch,
        updateStudent,
        deleteStudent,
        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        studentAssignments,
        toggleAssignmentCompletion,
        grades,
        addGrade,
        updateGrade,
        deleteGrade,
        attendance,
        markAttendance,
        markBatchAttendance,
        getStudentProgress,
        overallStats,
        toasts,
        showToast,
        resetToSampleData,
        clearAllData,
        exportDataJSON,
        importDataJSON,
        exportToCSV,
        currentUser,
        cloudSyncStatus,
        lastSyncedAt,
        cloudError,
        loginGoogle,
        logoutGoogle,
        syncNowToCloud,
        syncNowFromCloud,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
