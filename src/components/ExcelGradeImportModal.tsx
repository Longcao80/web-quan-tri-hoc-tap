import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student, ClassItem, GradeRecord, GradeType } from '../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Award,
  Check,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface ExcelGradeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  students: Student[];
  onImport: (grades: Omit<GradeRecord, 'id'>[], updateExisting: boolean) => void;
}

interface ParsedGradeRow {
  studentCode: string;
  studentName: string;
  matchedStudent?: Student;
  className: string;
  score: number | null;
  examType: GradeType;
  title: string;
  date: string;
  notes: string;
  isValid: boolean;
  validationError?: string;
}

export const ExcelGradeImportModal: React.FC<ExcelGradeImportModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedGradeRow[]>([]);
  const [defaultClassId, setDefaultClassId] = useState<string>(classes[0]?.id || 'all');
  const [defaultExamType, setDefaultExamType] = useState<GradeType>('TX');
  const [defaultExamTitle, setDefaultExamTitle] = useState<string>('Kiểm tra 15 phút Toán');
  const [defaultDate, setDefaultDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'guide'>('preview');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Clean string for header matching
  const cleanHeader = (h: any): string => {
    if (!h) return '';
    return String(h)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  const parseExcelDate = (val: any): string => {
    if (!val) return defaultDate;
    if (val instanceof Date) {
      return val.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    if (typeof val === 'number') {
      const date = new Date((val - (25567 + 2)) * 86400 * 1000);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    return defaultDate;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (fileToProcess: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    setFile(fileToProcess);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse into json array with header row
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          setErrorMsg('File Excel không có dữ liệu hoặc không đúng định dạng bảng.');
          setIsProcessing(false);
          return;
        }

        // Find header row (the row that has keywords like 'ma', 'ten', 'diem', etc.)
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rawJson.length, 10); i++) {
          const rowStr = (rawJson[i] || []).map((c: any) => cleanHeader(c)).join(' ');
          if (
            (rowStr.includes('ma') || rowStr.includes('hocsinh') || rowStr.includes('ten')) &&
            (rowStr.includes('diem') || rowStr.includes('score'))
          ) {
            headerRowIndex = i;
            break;
          }
        }

        // If not found, default to row 0 if it contains headers, or row 1
        if (headerRowIndex === -1) {
          headerRowIndex = 0;
        }

        const headerRow = rawJson[headerRowIndex] || [];
        const colIndices = {
          code: -1,
          name: -1,
          className: -1,
          score: -1,
          examType: -1,
          title: -1,
          date: -1,
          notes: -1,
        };

        headerRow.forEach((cell: any, idx: number) => {
          const cleaned = cleanHeader(cell);
          if (cleaned.includes('mahs') || cleaned.includes('mahocsinh') || cleaned === 'ma' || cleaned.includes('code')) {
            if (colIndices.code === -1) colIndices.code = idx;
          } else if (
            cleaned.includes('hoten') ||
            cleaned.includes('tenhs') ||
            cleaned.includes('hovaten') ||
            cleaned.includes('tenhocsinh') ||
            cleaned === 'ten' ||
            cleaned.includes('name')
          ) {
            if (colIndices.name === -1) colIndices.name = idx;
          } else if (cleaned.includes('lop') || cleaned.includes('class')) {
            if (colIndices.className === -1) colIndices.className = idx;
          } else if (cleaned.includes('diem') || cleaned.includes('score') || cleaned.includes('grade')) {
            if (colIndices.score === -1) colIndices.score = idx;
          } else if (cleaned.includes('loai') || cleaned.includes('type')) {
            if (colIndices.examType === -1) colIndices.examType = idx;
          } else if (cleaned.includes('tenbai') || cleaned.includes('tieude') || cleaned.includes('baikt') || cleaned.includes('title')) {
            if (colIndices.title === -1) colIndices.title = idx;
          } else if (cleaned.includes('ngay') || cleaned.includes('date')) {
            if (colIndices.date === -1) colIndices.date = idx;
          } else if (cleaned.includes('ghichu') || cleaned.includes('nhanxet') || cleaned.includes('note')) {
            if (colIndices.notes === -1) colIndices.notes = idx;
          }
        });

        // Fallbacks if columns weren't matched by exact names
        if (colIndices.code === -1 && colIndices.name === -1) {
          colIndices.code = 1;
          colIndices.name = 2;
        }
        if (colIndices.score === -1) {
          // Look for any header with 'diem' or default to column 4
          colIndices.score = 4;
        }

        const parsedList: ParsedGradeRow[] = [];

        for (let r = headerRowIndex + 1; r < rawJson.length; r++) {
          const row = rawJson[r];
          if (!row || row.length === 0) continue;

          // Extract values
          const rawCode = colIndices.code >= 0 && row[colIndices.code] !== undefined ? String(row[colIndices.code]).trim() : '';
          const rawName = colIndices.name >= 0 && row[colIndices.name] !== undefined ? String(row[colIndices.name]).trim() : '';
          const rawClass = colIndices.className >= 0 && row[colIndices.className] !== undefined ? String(row[colIndices.className]).trim() : '';
          const rawScoreVal = colIndices.score >= 0 && row[colIndices.score] !== undefined ? row[colIndices.score] : '';
          const rawType = colIndices.examType >= 0 && row[colIndices.examType] !== undefined ? String(row[colIndices.examType]).trim().toUpperCase() : '';
          const rawTitle = colIndices.title >= 0 && row[colIndices.title] !== undefined ? String(row[colIndices.title]).trim() : '';
          const rawDate = colIndices.date >= 0 && row[colIndices.date] !== undefined ? row[colIndices.date] : '';
          const rawNotes = colIndices.notes >= 0 && row[colIndices.notes] !== undefined ? String(row[colIndices.notes]).trim() : '';

          // Skip completely empty rows
          if (!rawCode && !rawName && rawScoreVal === '') continue;

          // Match student
          let matchedStudent: Student | undefined;
          if (rawCode) {
            matchedStudent = students.find(
              (s) => s.code.toLowerCase().trim() === rawCode.toLowerCase().trim()
            );
          }
          if (!matchedStudent && rawName) {
            matchedStudent = students.find(
              (s) => s.name.toLowerCase().trim() === rawName.toLowerCase().trim()
            );
          }

          // Parse score
          let parsedScore: number | null = null;
          let isValid = true;
          let validationError = '';

          const normalizedScoreStr = String(rawScoreVal).replace(',', '.').trim();
          const numericScore = parseFloat(normalizedScoreStr);

          if (rawScoreVal === '' || isNaN(numericScore)) {
            isValid = false;
            validationError = 'Điểm số trống hoặc không phải số hợp lệ';
          } else if (numericScore < 0 || numericScore > 10) {
            isValid = false;
            validationError = `Điểm số (${numericScore}) ngoài khoảng 0 - 10`;
          } else {
            parsedScore = Math.round(numericScore * 10) / 10;
          }

          if (!matchedStudent) {
            isValid = false;
            validationError = validationError
              ? `${validationError} & Không tìm thấy học sinh với mã "${rawCode || rawName}"`
              : `Không tìm thấy học sinh "${rawCode || rawName}" trong hệ thống`;
          }

          // Exam type normalization
          let finalExamType: GradeType = defaultExamType;
          if (['TX', 'BT', 'GK', 'CK'].includes(rawType)) {
            finalExamType = rawType as GradeType;
          } else if (rawType.includes('THUONG') || rawType.includes('TX')) {
            finalExamType = 'TX';
          } else if (rawType.includes('BAI TAP') || rawType.includes('BT')) {
            finalExamType = 'BT';
          } else if (rawType.includes('GIUA') || rawType.includes('GK')) {
            finalExamType = 'GK';
          } else if (rawType.includes('CUOI') || rawType.includes('CK')) {
            finalExamType = 'CK';
          }

          parsedList.push({
            studentCode: matchedStudent ? matchedStudent.code : rawCode,
            studentName: matchedStudent ? matchedStudent.name : rawName || 'Chưa rõ',
            matchedStudent,
            className: matchedStudent ? matchedStudent.className : rawClass || 'Chưa rõ',
            score: parsedScore,
            examType: finalExamType,
            title: rawTitle || defaultExamTitle,
            date: parseExcelDate(rawDate),
            notes: rawNotes,
            isValid,
            validationError,
          });
        }

        setParsedRows(parsedList);
      } catch (err: any) {
        setErrorMsg('Không thể đọc file Excel. Vui lòng kiểm tra lại file (.xlsx, .xls, .csv).');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Đã xảy ra lỗi khi đọc tập tin.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(fileToProcess);
  };

  const handleDownloadTemplate = () => {
    // Filter students by selected class for template
    const templateStudents =
      defaultClassId === 'all'
        ? students
        : students.filter((s) => s.classId === defaultClassId);

    const rows = [
      ['BẢNG ĐIỂM HỌC SINH MÔN TOÁN - THẦY KIỀU CAO LONG'],
      [`Trường THCS Thạch Thất 2 - Phân hiệu Cẩm Yên | Loại điểm mặc định: ${defaultExamType} - ${defaultExamTitle}`],
      [
        'STT',
        'Mã học sinh (*)',
        'Họ và tên (*)',
        'Lớp (*)',
        'Điểm số (0-10) (*)',
        'Loại điểm (TX/BT/GK/CK)',
        'Tên bài kiểm tra',
        'Ngày kiểm tra (YYYY-MM-DD)',
        'Ghi chú',
      ],
    ];

    if (templateStudents.length > 0) {
      templateStudents.forEach((st, idx) => {
        rows.push([
          String(idx + 1),
          st.code,
          st.name,
          st.className,
          '', // Điểm số để trống cho thầy nhập
          defaultExamType,
          defaultExamTitle,
          defaultDate,
          '',
        ]);
      });
    } else {
      // Sample mock row
      rows.push([
        '1',
        'HS8A01',
        'Kiều Tuấn Anh',
        '8A',
        '8.5',
        'TX',
        defaultExamTitle,
        defaultDate,
        'Làm bài tốt',
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 18 },
      { wch: 24 },
      { wch: 28 },
      { wch: 25 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BangDiem');

    const classNameTag =
      defaultClassId === 'all'
        ? 'TatCaCacLop'
        : `Lop_${classes.find((c) => c.id === defaultClassId)?.name || defaultClassId}`;

    XLSX.writeFile(
      wb,
      `Mau_nhap_diem_Toan_${classNameTag}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const validRows = parsedRows.filter((r) => r.isValid && r.matchedStudent && r.score !== null);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleConfirmImport = () => {
    if (validRows.length === 0) return;

    const gradesToImport: Omit<GradeRecord, 'id'>[] = validRows.map((r) => ({
      studentId: r.matchedStudent!.id,
      classId: r.matchedStudent!.classId,
      examType: r.examType,
      title: r.title,
      score: r.score!,
      date: r.date,
      notes: r.notes,
    }));

    onImport(gradesToImport, updateExisting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Nhập Điểm Số Học Sinh Bằng Excel
              </h3>
              <p className="text-xs text-slate-500">
                Tải lên bảng điểm từ file .xlsx, .xls hoặc tải file mẫu đã điền sẵn danh sách học sinh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Config & Template Card */}
          <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/60 p-4 rounded-2xl border border-emerald-100/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Bước 1: Thiết lập & Tải file mẫu Excel (tùy chọn)</span>
                </h4>
                <p className="text-xs text-emerald-800/80 mt-0.5">
                  File mẫu sẽ tự động điền sẵn Họ tên & Mã học sinh theo lớp, thầy chỉ cần gõ điểm số.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải file Excel mẫu</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-emerald-100/80 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn lớp mẫu</label>
                <select
                  value={defaultClassId}
                  onChange={(e) => setDefaultClassId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Tất cả các lớp ({students.length} HS)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name} ({students.filter((s) => s.classId === c.id).length} HS)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Loại điểm mặc định</label>
                <select
                  value={defaultExamType}
                  onChange={(e) => setDefaultExamType(e.target.value as GradeType)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="TX">Thường xuyên (TX)</option>
                  <option value="BT">Bài tập (BT)</option>
                  <option value="GK">Giữa kỳ (GK)</option>
                  <option value="CK">Cuối kỳ (CK)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên bài kiểm tra</label>
                <input
                  type="text"
                  value={defaultExamTitle}
                  onChange={(e) => setDefaultExamTitle(e.target.value)}
                  placeholder="VD: Kiểm tra 15 phút..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày kiểm tra</label>
                <input
                  type="date"
                  value={defaultDate}
                  onChange={(e) => setDefaultDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Bước 2: Chọn tập tin Excel (.xlsx, .xls, .csv) đã có điểm</span>
            </h4>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/60 hover:bg-emerald-50/20 transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="mx-auto w-12 h-12 bg-white rounded-2xl shadow-2xs border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>

              {file ? (
                <div>
                  <p className="text-sm font-bold text-emerald-700">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(file.size / 1024).toFixed(1)} KB — Bấm để chọn tập tin khác
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Kéo thả file Excel vào đây hoặc <span className="text-emerald-600 underline">bấm để duyệt file</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Hỗ trợ định dạng .xlsx, .xls, .csv (Tối đa 10MB)
                  </p>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Import Settings & Parsed Result Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hợp lệ: {validRows.length} điểm</span>
                  </div>

                  {invalidRows.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-xl text-xs font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Không hợp lệ: {invalidRows.length} dòng</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={updateExisting}
                      onChange={(e) => setUpdateExisting(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                    <span>Ghi đè nếu học sinh đã có điểm cùng tên bài kiểm tra</span>
                  </label>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Mã HS</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Lớp</th>
                      <th className="py-2.5 px-3">Điểm số</th>
                      <th className="py-2.5 px-3">Loại điểm</th>
                      <th className="py-2.5 px-3">Tên bài kiểm tra</th>
                      <th className="py-2.5 px-3">Ngày</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          row.isValid ? 'hover:bg-slate-50/80' : 'bg-rose-50/40 hover:bg-rose-50/70'
                        }
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">
                          {row.studentCode || '—'}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {row.studentName}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{row.className}</td>
                        <td className="py-2 px-3 font-bold">
                          {row.score !== null ? (
                            <span
                              className={`text-sm ${
                                row.score >= 8.0
                                  ? 'text-emerald-600'
                                  : row.score >= 6.5
                                  ? 'text-blue-600'
                                  : row.score >= 5.0
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {row.score}
                            </span>
                          ) : (
                            <span className="text-rose-500 italic">Lỗi</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700">
                            {row.examType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700 truncate max-w-xs">{row.title}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{row.date}</td>
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Sẵn sàng</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-rose-600 font-medium text-[11px]"
                              title={row.validationError}
                            >
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[140px]">{row.validationError}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setParsedRows([]);
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chọn lại file</span>
              </button>
            )}

            <button
              type="button"
              disabled={validRows.length === 0 || isProcessing}
              onClick={handleConfirmImport}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                validRows.length > 0 && !isProcessing
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {validRows.length > 0
                  ? `Nhập ${validRows.length} điểm số vào hệ thống`
                  : 'Chưa có điểm hợp lệ'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
