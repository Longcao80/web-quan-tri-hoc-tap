import {
  TeacherProfile,
  ClassItem,
  Student,
  Assignment,
  StudentAssignmentStatus,
  GradeRecord,
  AttendanceRecord,
} from '../types';

export const initialTeacherProfile: TeacherProfile = {
  name: 'Thầy Kiều Cao Long',
  subject: 'Toán',
  schoolLevel: 'THCS',
  schoolName: 'Trường THCS Thạch Thất 2',
  branch: 'Phân hiệu Cẩm Yên',
  phone: '0987 654 321',
  email: 'kieucaolong.toan@thcsthachthat2.edu.vn',
  themeColor: 'indigo',
  soundEnabled: true,
  gradingWeights: {
    TX: 1,
    BT: 1,
    GK: 2,
    CK: 3,
  },
};

export const initialClasses: ClassItem[] = [
  {
    id: 'class-6a',
    name: '6A',
    grade: 6,
    room: 'Phòng 201 - Tầng 2',
    homeroomTeacher: 'Thầy Kiều Cao Long',
    academicYear: '2026 - 2027',
    notes: 'Lớp tích cực môn Toán, nhiều học sinh có năng khiếu hình học trực quan.',
  },
  {
    id: 'class-7a',
    name: '7A',
    grade: 7,
    room: 'Phòng 202 - Tầng 2',
    homeroomTeacher: 'Cô Nguyễn Thị Mai',
    academicYear: '2026 - 2027',
    notes: 'Lớp học đều, cần bồi dưỡng thêm phần biểu thức đại số.',
  },
  {
    id: 'class-8a',
    name: '8A',
    grade: 8,
    room: 'Phòng 301 - Tầng 3',
    homeroomTeacher: 'Thầy Kiều Cao Long',
    academicYear: '2026 - 2027',
    notes: 'Đội tuyển Toán 8 của trường, đang ôn tập hằng đẳng thức và tam giác đồng dạng.',
  },
  {
    id: 'class-9a',
    name: '9A',
    grade: 9,
    room: 'Phòng 304 - Tầng 3',
    homeroomTeacher: 'Thầy Trần Văn Bình',
    academicYear: '2026 - 2027',
    notes: 'Lớp cuối cấp, trọng tâm ôn luyện thi vào 10 chuyên và đại trà.',
  },
];

export const initialStudents: Student[] = [
  // Lớp 6A
  { id: 's-6a-01', code: 'HS6A01', name: 'Nguyễn Kiều Tuấn Anh', gender: 'Nam', classId: 'class-6a', className: '6A', birthDate: '2014-04-12', notes: 'Chăm chỉ, tính toán nhanh' },
  { id: 's-6a-02', code: 'HS6A02', name: 'Trần Thị Thu Hà', gender: 'Nữ', classId: 'class-6a', className: '6A', birthDate: '2014-08-23', notes: 'Trình bày cẩn thận, chữ đẹp' },
  { id: 's-6a-03', code: 'HS6A03', name: 'Kiều Minh Đăng', gender: 'Nam', classId: 'class-6a', className: '6A', birthDate: '2014-01-15', notes: 'Có tư duy logic tốt' },
  { id: 's-6a-04', code: 'HS6A04', name: 'Phùng Bảo Ngọc', gender: 'Nữ', classId: 'class-6a', className: '6A', birthDate: '2014-11-05', notes: 'Cần củng cố thêm phần số học nguyên tố' },
  { id: 's-6a-05', code: 'HS6A05', name: 'Đỗ Hữu Thắng', gender: 'Nam', classId: 'class-6a', className: '6A', birthDate: '2014-06-30', notes: 'Tham gia phát biểu tích cực' },
  { id: 's-6a-06', code: 'HS6A06', name: 'Lê Ngọc Mai', gender: 'Nữ', classId: 'class-6a', className: '6A', birthDate: '2014-09-18', notes: 'Hoàn thành bài tập đầy đủ' },
  { id: 's-6a-07', code: 'HS6A07', name: 'Ngô Quang Huy', gender: 'Nam', classId: 'class-6a', className: '6A', birthDate: '2014-03-22', notes: 'Cần chú ý không bỏ sót bước vẽ hình' },

  // Lớp 7A
  { id: 's-7a-01', code: 'HS7A01', name: 'Kiều Gia Hưng', gender: 'Nam', classId: 'class-7a', className: '7A', birthDate: '2013-05-19', notes: 'Nắm chắc công thức lũy thừa' },
  { id: 's-7a-02', code: 'HS7A02', name: 'Nguyễn Thị Hải Yến', gender: 'Nữ', classId: 'class-7a', className: '7A', birthDate: '2013-02-14', notes: 'Cán sự học tập môn Toán' },
  { id: 's-7a-03', code: 'HS7A03', name: 'Vũ Đức Duy', gender: 'Nam', classId: 'class-7a', className: '7A', birthDate: '2013-10-09', notes: 'Cần tăng tốc độ làm bài trắc nghiệm' },
  { id: 's-7a-04', code: 'HS7A04', name: 'Đặng Thanh Thảo', gender: 'Nữ', classId: 'class-7a', className: '7A', birthDate: '2013-07-28', notes: 'Chăm học, hay hỏi bài thầy' },
  { id: 's-7a-05', code: 'HS7A05', name: 'Bùi Đình Khoa', gender: 'Nam', classId: 'class-7a', className: '7A', birthDate: '2013-12-03', notes: 'Học lực tiến bộ rõ rệt' },
  { id: 's-7a-06', code: 'HS7A06', name: 'Phạm Quỳnh Anh', gender: 'Nữ', classId: 'class-7a', className: '7A', birthDate: '2013-04-16', notes: 'Tỉ mỉ, điểm bài tập thường đạt điểm tối đa' },

  // Lớp 8A
  { id: 's-8a-01', code: 'HS8A01', name: 'Kiều Cao Tuấn', gender: 'Nam', classId: 'class-8a', className: '8A', birthDate: '2012-03-11', notes: 'Thành viên đội tuyển HSG Toán trường' },
  { id: 's-8a-02', code: 'HS8A02', name: 'Nguyễn Mai Phương', gender: 'Nữ', classId: 'class-8a', className: '8A', birthDate: '2012-09-25', notes: 'Giải tốt các bài hình học đồng dạng' },
  { id: 's-8a-03', code: 'HS8A03', name: 'Hoàng Quốc Việt', gender: 'Nam', classId: 'class-8a', className: '8A', birthDate: '2012-06-18', notes: 'Sáng tạo trong phương pháp chứng minh' },
  { id: 's-8a-04', code: 'HS8A04', name: 'Đỗ Thị Lan Hương', gender: 'Nữ', classId: 'class-8a', className: '8A', birthDate: '2012-11-30', notes: 'Cần rèn thêm kỹ năng biến đổi phân thức' },
  { id: 's-8a-05', code: 'HS8A05', name: 'Trần Đình Khang', gender: 'Nam', classId: 'class-8a', className: '8A', birthDate: '2012-01-27', notes: 'Điểm số ổn định, nghiêm túc' },
  { id: 's-8a-06', code: 'HS8A06', name: 'Nguyễn Thảo Nhi', gender: 'Nữ', classId: 'class-8a', className: '8A', birthDate: '2012-08-08', notes: 'Học tập năng nổ, hỗ trợ bạn học' },
  { id: 's-8a-07', code: 'HS8A07', name: 'Lê Minh Quân', gender: 'Nam', classId: 'class-8a', className: '8A', birthDate: '2012-12-15', notes: 'Đôi khi chưa làm bài tập về nhà đầy đủ' },

  // Lớp 9A
  { id: 's-9a-01', code: 'HS9A01', name: 'Kiều Phương Linh', gender: 'Nữ', classId: 'class-9a', className: '9A', birthDate: '2011-02-09', notes: 'Mục tiêu thi vào THPT Thạch Thất' },
  { id: 's-9a-02', code: 'HS9A02', name: 'Nguyễn Hữu Trí', gender: 'Nam', classId: 'class-9a', className: '9A', birthDate: '2011-05-14', notes: 'Tư duy đại số sắc bén, giải phương trình tốt' },
  { id: 's-9a-03', code: 'HS9A03', name: 'Vũ Thùy Dương', gender: 'Nữ', classId: 'class-9a', className: '9A', birthDate: '2011-10-21', notes: 'Vẽ đường tròn và chứng minh tứ giác nội tiếp tốt' },
  { id: 's-9a-04', code: 'HS9A04', name: 'Trần Quang Dũng', gender: 'Nam', classId: 'class-9a', className: '9A', birthDate: '2011-07-04', notes: 'Cần chú ý điều kiện xác định của căn thức' },
  { id: 's-9a-05', code: 'HS9A05', name: 'Đoàn Nhật Minh', gender: 'Nam', classId: 'class-9a', className: '9A', birthDate: '2011-12-29', notes: 'Tốc độ làm bài tốt, cần rèn thêm bài hình khó' },
  { id: 's-9a-06', code: 'HS9A06', name: 'Phan Thị Diệu Linh', gender: 'Nữ', classId: 'class-9a', className: '9A', birthDate: '2011-08-17', notes: 'Học sinh giỏi toàn diện, điểm Toán cao' },
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asg-01',
    title: 'Phiếu bài tập số 08: Phân tích đa thức thành nhân tử',
    subject: 'Toán',
    content: 'Làm các bài tập 1, 2, 3 trang 24 sách bài tập Toán 8. Chú ý áp dụng phương pháp nhóm hạng tử và dùng hằng đẳng thức.',
    classIds: ['class-8a'],
    assignedDate: '2026-09-12',
    dueDate: '2026-09-22',
    status: 'Đang giao',
    maxScore: 10,
  },
  {
    id: 'asg-02',
    title: 'Chuyên đề: Rút gọn biểu thức chứa căn bậc hai (Dạng 1 & 2)',
    subject: 'Toán',
    content: 'Hoàn thiện 5 câu trắc nghiệm và 3 bài tự luận trong phiếu ôn tập tuyển sinh vào lớp 10 số 04.',
    classIds: ['class-9a'],
    assignedDate: '2026-09-14',
    dueDate: '2026-09-24',
    status: 'Đang giao',
    maxScore: 10,
  },
  {
    id: 'asg-03',
    title: 'Bài tập tuần 3: Ước chung lớn nhất & Bội chung nhỏ nhất',
    subject: 'Toán',
    content: 'Ôn lại các tính chất chia hết và giải bài toán thực tế tìm số học sinh trong buổi ngoại khóa.',
    classIds: ['class-6a'],
    assignedDate: '2026-09-10',
    dueDate: '2026-09-18',
    status: 'Đang giao',
    maxScore: 10,
  },
  {
    id: 'asg-04',
    title: 'Bài tập hình học: Định lý Pythagore và ứng dụng đo chiều cao',
    subject: 'Toán',
    content: 'Thực hành tính cạnh huyền và áp dụng đo chiều cao cột cờ trường THCS Thạch Thất 2.',
    classIds: ['class-8a', 'class-7a'],
    assignedDate: '2026-09-08',
    dueDate: '2026-09-16',
    status: 'Đã hoàn thành',
    maxScore: 10,
  },
  {
    id: 'asg-05',
    title: 'Đại số 7: Các phép tính số hữu tỉ và quy tắc dấu ngoặc',
    subject: 'Toán',
    content: 'Hoàn thành 10 bài tính giá trị biểu thức và tìm x trong phiếu bài tập tự luyện tuần 2.',
    classIds: ['class-7a'],
    assignedDate: '2026-09-05',
    dueDate: '2026-09-14',
    status: 'Đã hoàn thành',
    maxScore: 10,
  },
  {
    id: 'asg-06',
    title: 'Đề khảo sát đầu năm học môn Toán - Khối 9',
    subject: 'Toán',
    content: 'Làm đề kiểm tra tổng hợp kiến thức Toán 8 và các phép biến đổi căn bậc hai Toán 9 (thời gian làm bài 90 phút).',
    classIds: ['class-9a'],
    assignedDate: '2026-09-02',
    dueDate: '2026-09-09',
    status: 'Đã hoàn thành',
    maxScore: 10,
  },
];

export const initialStudentAssignments: StudentAssignmentStatus[] = [
  // Asg-01 (8A)
  { assignmentId: 'asg-01', studentId: 's-8a-01', isCompleted: true, completedAt: '2026-09-14' },
  { assignmentId: 'asg-01', studentId: 's-8a-02', isCompleted: true, completedAt: '2026-09-15' },
  { assignmentId: 'asg-01', studentId: 's-8a-03', isCompleted: true, completedAt: '2026-09-16' },
  { assignmentId: 'asg-01', studentId: 's-8a-04', isCompleted: false },
  { assignmentId: 'asg-01', studentId: 's-8a-05', isCompleted: true, completedAt: '2026-09-17' },
  { assignmentId: 'asg-01', studentId: 's-8a-06', isCompleted: true, completedAt: '2026-09-18' },
  { assignmentId: 'asg-01', studentId: 's-8a-07', isCompleted: false },

  // Asg-02 (9A)
  { assignmentId: 'asg-02', studentId: 's-9a-01', isCompleted: true, completedAt: '2026-09-16' },
  { assignmentId: 'asg-02', studentId: 's-9a-02', isCompleted: true, completedAt: '2026-09-15' },
  { assignmentId: 'asg-02', studentId: 's-9a-03', isCompleted: true, completedAt: '2026-09-17' },
  { assignmentId: 'asg-02', studentId: 's-9a-04', isCompleted: false },
  { assignmentId: 'asg-02', studentId: 's-9a-05', isCompleted: true, completedAt: '2026-09-18' },
  { assignmentId: 'asg-02', studentId: 's-9a-06', isCompleted: true, completedAt: '2026-09-16' },

  // Asg-03 (6A)
  { assignmentId: 'asg-03', studentId: 's-6a-01', isCompleted: true, completedAt: '2026-09-13' },
  { assignmentId: 'asg-03', studentId: 's-6a-02', isCompleted: true, completedAt: '2026-09-14' },
  { assignmentId: 'asg-03', studentId: 's-6a-03', isCompleted: true, completedAt: '2026-09-14' },
  { assignmentId: 'asg-03', studentId: 's-6a-04', isCompleted: false },
  { assignmentId: 'asg-03', studentId: 's-6a-05', isCompleted: true, completedAt: '2026-09-15' },
  { assignmentId: 'asg-03', studentId: 's-6a-06', isCompleted: true, completedAt: '2026-09-16' },
  { assignmentId: 'asg-03', studentId: 's-6a-07', isCompleted: false },

  // Asg-04 (8A & 7A)
  { assignmentId: 'asg-04', studentId: 's-8a-01', isCompleted: true, completedAt: '2026-09-11' },
  { assignmentId: 'asg-04', studentId: 's-8a-02', isCompleted: true, completedAt: '2026-09-12' },
  { assignmentId: 'asg-04', studentId: 's-8a-03', isCompleted: true, completedAt: '2026-09-11' },
  { assignmentId: 'asg-04', studentId: 's-8a-04', isCompleted: true, completedAt: '2026-09-14' },
  { assignmentId: 'asg-04', studentId: 's-8a-05', isCompleted: true, completedAt: '2026-09-13' },
  { assignmentId: 'asg-04', studentId: 's-8a-06', isCompleted: true, completedAt: '2026-09-12' },
  { assignmentId: 'asg-04', studentId: 's-8a-07', isCompleted: false },
  { assignmentId: 'asg-04', studentId: 's-7a-01', isCompleted: true, completedAt: '2026-09-12' },
  { assignmentId: 'asg-04', studentId: 's-7a-02', isCompleted: true, completedAt: '2026-09-11' },
  { assignmentId: 'asg-04', studentId: 's-7a-03', isCompleted: true, completedAt: '2026-09-13' },
  { assignmentId: 'asg-04', studentId: 's-7a-04', isCompleted: true, completedAt: '2026-09-12' },
  { assignmentId: 'asg-04', studentId: 's-7a-05', isCompleted: true, completedAt: '2026-09-14' },
  { assignmentId: 'asg-04', studentId: 's-7a-06', isCompleted: true, completedAt: '2026-09-11' },

  // Asg-05 (7A)
  { assignmentId: 'asg-05', studentId: 's-7a-01', isCompleted: true, completedAt: '2026-09-08' },
  { assignmentId: 'asg-05', studentId: 's-7a-02', isCompleted: true, completedAt: '2026-09-09' },
  { assignmentId: 'asg-05', studentId: 's-7a-03', isCompleted: false },
  { assignmentId: 'asg-05', studentId: 's-7a-04', isCompleted: true, completedAt: '2026-09-10' },
  { assignmentId: 'asg-05', studentId: 's-7a-05', isCompleted: true, completedAt: '2026-09-11' },
  { assignmentId: 'asg-05', studentId: 's-7a-06', isCompleted: true, completedAt: '2026-09-08' },

  // Asg-06 (9A)
  { assignmentId: 'asg-06', studentId: 's-9a-01', isCompleted: true, completedAt: '2026-09-05' },
  { assignmentId: 'asg-06', studentId: 's-9a-02', isCompleted: true, completedAt: '2026-09-05' },
  { assignmentId: 'asg-06', studentId: 's-9a-03', isCompleted: true, completedAt: '2026-09-06' },
  { assignmentId: 'asg-06', studentId: 's-9a-04', isCompleted: true, completedAt: '2026-09-07' },
  { assignmentId: 'asg-06', studentId: 's-9a-05', isCompleted: true, completedAt: '2026-09-06' },
  { assignmentId: 'asg-06', studentId: 's-9a-06', isCompleted: true, completedAt: '2026-09-04' },
];

export const initialGrades: GradeRecord[] = [
  // 6A
  { id: 'g-6a-01', studentId: 's-6a-01', classId: 'class-6a', examType: 'TX', title: 'Kiểm tra miệng: Số nguyên tố', score: 9.0, date: '2026-09-08' },
  { id: 'g-6a-02', studentId: 's-6a-01', classId: 'class-6a', examType: 'BT', title: 'Bài tập tuần 3', score: 9.5, date: '2026-09-14' },
  { id: 'g-6a-03', studentId: 's-6a-02', classId: 'class-6a', examType: 'TX', title: 'Kiểm tra 15 phút: Tập hợp', score: 8.5, date: '2026-09-08' },
  { id: 'g-6a-04', studentId: 's-6a-03', classId: 'class-6a', examType: 'TX', title: 'Kiểm tra 15 phút: Tập hợp', score: 9.0, date: '2026-09-08' },
  { id: 'g-6a-05', studentId: 's-6a-04', classId: 'class-6a', examType: 'TX', title: 'Kiểm tra 15 phút: Tập hợp', score: 5.5, date: '2026-09-08', notes: 'Cần hỗ trợ ôn tập' },
  { id: 'g-6a-06', studentId: 's-6a-05', classId: 'class-6a', examType: 'TX', title: 'Kiểm tra 15 phút: Tập hợp', score: 7.5, date: '2026-09-08' },
  { id: 'g-6a-07', studentId: 's-6a-06', classId: 'class-6a', examType: 'TX', title: 'Kiểm tra 15 phút: Tập hợp', score: 8.0, date: '2026-09-08' },
  { id: 'g-6a-08', studentId: 's-6a-07', classId: 'class-6a', examType: 'TX', title: 'Kiểm tra 15 phút: Tập hợp', score: 6.0, date: '2026-09-08' },

  // 7A
  { id: 'g-7a-01', studentId: 's-7a-01', classId: 'class-7a', examType: 'TX', title: 'Kiểm tra 15 phút: Số hữu tỉ', score: 8.5, date: '2026-09-09' },
  { id: 'g-7a-02', studentId: 's-7a-02', classId: 'class-7a', examType: 'TX', title: 'Kiểm tra 15 phút: Số hữu tỉ', score: 9.5, date: '2026-09-09' },
  { id: 'g-7a-03', studentId: 's-7a-03', classId: 'class-7a', examType: 'TX', title: 'Kiểm tra 15 phút: Số hữu tỉ', score: 6.0, date: '2026-09-09' },
  { id: 'g-7a-04', studentId: 's-7a-04', classId: 'class-7a', examType: 'TX', title: 'Kiểm tra 15 phút: Số hữu tỉ', score: 8.0, date: '2026-09-09' },
  { id: 'g-7a-05', studentId: 's-7a-05', classId: 'class-7a', examType: 'TX', title: 'Kiểm tra 15 phút: Số hữu tỉ', score: 7.5, date: '2026-09-09' },
  { id: 'g-7a-06', studentId: 's-7a-06', classId: 'class-7a', examType: 'TX', title: 'Kiểm tra 15 phút: Số hữu tỉ', score: 9.0, date: '2026-09-09' },

  // 8A
  { id: 'g-8a-01', studentId: 's-8a-01', classId: 'class-8a', examType: 'TX', title: 'Kiểm tra miệng: Hằng đẳng thức', score: 10.0, date: '2026-09-10' },
  { id: 'g-8a-02', studentId: 's-8a-01', classId: 'class-8a', examType: 'BT', title: 'Bài tập Pythagore', score: 10.0, date: '2026-09-12' },
  { id: 'g-8a-03', studentId: 's-8a-02', classId: 'class-8a', examType: 'TX', title: 'Kiểm tra miệng: Hằng đẳng thức', score: 9.0, date: '2026-09-10' },
  { id: 'g-8a-04', studentId: 's-8a-03', classId: 'class-8a', examType: 'TX', title: 'Kiểm tra miệng: Hằng đẳng thức', score: 9.5, date: '2026-09-10' },
  { id: 'g-8a-05', studentId: 's-8a-04', classId: 'class-8a', examType: 'TX', title: 'Kiểm tra 15 phút: Phân tích đa thức', score: 7.0, date: '2026-09-15' },
  { id: 'g-8a-06', studentId: 's-8a-05', classId: 'class-8a', examType: 'TX', title: 'Kiểm tra 15 phút: Phân tích đa thức', score: 8.5, date: '2026-09-15' },
  { id: 'g-8a-07', studentId: 's-8a-06', classId: 'class-8a', examType: 'TX', title: 'Kiểm tra 15 phút: Phân tích đa thức', score: 8.0, date: '2026-09-15' },
  { id: 'g-8a-08', studentId: 's-8a-07', classId: 'class-8a', examType: 'TX', title: 'Kiểm tra 15 phút: Phân tích đa thức', score: 5.0, date: '2026-09-15', notes: 'Chưa học bài kỹ' },

  // 9A
  { id: 'g-9a-01', studentId: 's-9a-01', classId: 'class-9a', examType: 'GK', title: 'Khảo sát đầu năm', score: 8.75, date: '2026-09-08' },
  { id: 'g-9a-02', studentId: 's-9a-02', classId: 'class-9a', examType: 'GK', title: 'Khảo sát đầu năm', score: 9.25, date: '2026-09-08' },
  { id: 'g-9a-03', studentId: 's-9a-03', classId: 'class-9a', examType: 'GK', title: 'Khảo sát đầu năm', score: 8.5, date: '2026-09-08' },
  { id: 'g-9a-04', studentId: 's-9a-04', classId: 'class-9a', examType: 'GK', title: 'Khảo sát đầu năm', score: 6.25, date: '2026-09-08' },
  { id: 'g-9a-05', studentId: 's-9a-05', classId: 'class-9a', examType: 'GK', title: 'Khảo sát đầu năm', score: 8.0, date: '2026-09-08' },
  { id: 'g-9a-06', studentId: 's-9a-06', classId: 'class-9a', examType: 'GK', title: 'Khảo sát đầu năm', score: 9.75, date: '2026-09-08' },
];

export const initialAttendance: AttendanceRecord[] = [
  // Ngày 2026-09-18 (Thứ Sáu) - 8A
  { id: 'att-8a-01', studentId: 's-8a-01', classId: 'class-8a', date: '2026-09-18', status: 'present' },
  { id: 'att-8a-02', studentId: 's-8a-02', classId: 'class-8a', date: '2026-09-18', status: 'present' },
  { id: 'att-8a-03', studentId: 's-8a-03', classId: 'class-8a', date: '2026-09-18', status: 'present' },
  { id: 'att-8a-04', studentId: 's-8a-04', classId: 'class-8a', date: '2026-09-18', status: 'present' },
  { id: 'att-8a-05', studentId: 's-8a-05', classId: 'class-8a', date: '2026-09-18', status: 'present' },
  { id: 'att-8a-06', studentId: 's-8a-06', classId: 'class-8a', date: '2026-09-18', status: 'present' },
  { id: 'att-8a-07', studentId: 's-8a-07', classId: 'class-8a', date: '2026-09-18', status: 'absent_excused', note: 'Phụ huynh xin nghỉ ốm' },

  // Ngày 2026-09-18 - 6A
  { id: 'att-6a-01', studentId: 's-6a-01', classId: 'class-6a', date: '2026-09-18', status: 'present' },
  { id: 'att-6a-02', studentId: 's-6a-02', classId: 'class-6a', date: '2026-09-18', status: 'present' },
  { id: 'att-6a-03', studentId: 's-6a-03', classId: 'class-6a', date: '2026-09-18', status: 'present' },
  { id: 'att-6a-04', studentId: 's-6a-04', classId: 'class-6a', date: '2026-09-18', status: 'present' },
  { id: 'att-6a-05', studentId: 's-6a-05', classId: 'class-6a', date: '2026-09-18', status: 'present' },
  { id: 'att-6a-06', studentId: 's-6a-06', classId: 'class-6a', date: '2026-09-18', status: 'present' },
  { id: 'att-6a-07', studentId: 's-6a-07', classId: 'class-6a', date: '2026-09-18', status: 'absent_unexcused', note: 'Vắng không phép' },

  // Ngày 2026-09-19 (Hôm nay) - 9A
  { id: 'att-9a-01', studentId: 's-9a-01', classId: 'class-9a', date: '2026-09-19', status: 'present' },
  { id: 'att-9a-02', studentId: 's-9a-02', classId: 'class-9a', date: '2026-09-19', status: 'present' },
  { id: 'att-9a-03', studentId: 's-9a-03', classId: 'class-9a', date: '2026-09-19', status: 'present' },
  { id: 'att-9a-04', studentId: 's-9a-04', classId: 'class-9a', date: '2026-09-19', status: 'present' },
  { id: 'att-9a-05', studentId: 's-9a-05', classId: 'class-9a', date: '2026-09-19', status: 'present' },
  { id: 'att-9a-06', studentId: 's-9a-06', classId: 'class-9a', date: '2026-09-19', status: 'present' },
];
