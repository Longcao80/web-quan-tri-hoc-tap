import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student, ClassItem } from '../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Users,
  Check,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  existingStudents: Student[];
  onImport: (students: Omit<Student, 'id'>[], updateExisting: boolean) => void;
}

interface ParsedStudentRow {
  code: string;
  name: string;
  className: string;
  classId: string;
  gender: 'Nam' | 'Nữ';
  birthDate?: string;
  notes?: string;
  isValid: boolean;
  validationError?: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  classes,
  existingStudents,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [defaultClassId, setDefaultClassId] = useState<string>(classes[0]?.id || '');
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'preview' | 'guide'>('preview');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Helper to normalize string for header matching
  const cleanHeader = (h: any): string => {
    if (!h) return '';
    return String(h)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Helper to parse date
  const parseExcelDate = (val: any): string => {
    if (!val) return '';
    if (val instanceof Date) {
      return val.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    // Format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    // Format DD/MM/YYYY
    const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    // If Excel serial number date
    if (typeof val === 'number') {
      const date = new Date((val - (25567 + 2)) * 86400 * 1000);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    return str;
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
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('File Excel không có sheet dữ liệu nào.');
        }

        const sheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];

        if (!rawData || rawData.length === 0) {
          throw new Error('File Excel trống, không tìm thấy dữ liệu học sinh.');
        }

        // Find header row (search in first 8 rows)
        let headerRowIdx = -1;
        let colMap: Record<string, number> = {
          code: -1,
          name: -1,
          class: -1,
          gender: -1,
          birthDate: -1,
          notes: -1,
        };

        for (let r = 0; r < Math.min(rawData.length, 8); r++) {
          const row = rawData[r];
          if (!Array.isArray(row)) continue;

          let foundName = false;
          let tempColMap = { ...colMap };

          row.forEach((cellVal, colIdx) => {
            const h = cleanHeader(cellVal);
            if (!h) return;

            // Name
            if (
              h === 'hovaten' ||
              h === 'hoten' ||
              h === 'tenhocsinh' ||
              h === 'ten' ||
              h === 'name' ||
              h === 'fullname'
            ) {
              tempColMap.name = colIdx;
              foundName = true;
            }
            // Code
            else if (
              h === 'mahs' ||
              h === 'mahocsinh' ||
              h === 'maso' ||
              h === 'masohocsinh' ||
              h === 'code' ||
              h === 'makh'
            ) {
              tempColMap.code = colIdx;
            }
            // Class
            else if (h === 'lop' || h === 'lophoc' || h === 'tenlop' || h === 'class' || h === 'classname') {
              tempColMap.class = colIdx;
            }
            // Gender
            else if (h === 'gioitinh' || h === 'phai' || h === 'gender' || h === 'sex') {
              tempColMap.gender = colIdx;
            }
            // BirthDate
            else if (
              h === 'ngaysinh' ||
              h === 'sinhngay' ||
              h === 'dob' ||
              h === 'birthday' ||
              h === 'ngaythangnamsinh'
            ) {
              tempColMap.birthDate = colIdx;
            }
            // Notes
            else if (h === 'ghichu' || h === 'nhanxet' || h === 'notes' || h === 'note') {
              tempColMap.notes = colIdx;
            }
          });

          if (foundName) {
            headerRowIdx = r;
            colMap = tempColMap;
            break;
          }
        }

        // If no explicit header with 'hovaten' found, try row 0
        if (headerRowIdx === -1) {
          headerRowIdx = 0;
          // Heuristic fallback: col 0 = code or STT, col 1 = name...
          rawData[0]?.forEach((cellVal, colIdx) => {
            const h = cleanHeader(cellVal);
            if (h.includes('ten') || h.includes('name')) colMap.name = colIdx;
            if (h.includes('ma') || h.includes('code')) colMap.code = colIdx;
            if (h.includes('lop') || h.includes('class')) colMap.class = colIdx;
            if (h.includes('tinh') || h.includes('gender')) colMap.gender = colIdx;
            if (h.includes('sinh') || h.includes('birth')) colMap.birthDate = colIdx;
            if (h.includes('chu') || h.includes('note')) colMap.notes = colIdx;
          });

          if (colMap.name === -1 && rawData[0]?.length >= 2) {
            // Assume col 1 or 2 is name
            colMap.name = 1;
            colMap.code = 0;
          }
        }

        const selectedDefaultClass = classes.find((c) => c.id === defaultClassId) || classes[0];

        // Parse student rows
        const parsed: ParsedStudentRow[] = [];
        let autoCodeCounter = existingStudents.length + 1;

        for (let i = headerRowIdx + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue;

          // Check if row is empty
          const hasContent = row.some((c) => c !== undefined && c !== null && String(c).trim() !== '');
          if (!hasContent) continue;

          const rawName = colMap.name !== -1 && row[colMap.name] !== undefined ? String(row[colMap.name]).trim() : '';
          if (!rawName) continue; // Skip lines without a student name

          let rawCode = colMap.code !== -1 && row[colMap.code] !== undefined ? String(row[colMap.code]).trim() : '';

          // Class mapping
          let rawClass = colMap.class !== -1 && row[colMap.class] !== undefined ? String(row[colMap.class]).trim() : '';
          let matchedClass = selectedDefaultClass;

          if (rawClass) {
            const cleanClassName = rawClass.toLowerCase().replace(/^lớp\s+/i, '').trim();
            const found = classes.find(
              (c) =>
                c.name.toLowerCase() === cleanClassName ||
                c.name.toLowerCase() === rawClass.toLowerCase() ||
                rawClass.toLowerCase().includes(c.name.toLowerCase())
            );
            if (found) {
              matchedClass = found;
            }
          }

          // Generate code if missing
          if (!rawCode) {
            rawCode = `HS${matchedClass ? matchedClass.name : '01'}${String(autoCodeCounter++).padStart(2, '0')}`;
          }

          // Gender mapping
          const rawGender = colMap.gender !== -1 && row[colMap.gender] !== undefined ? String(row[colMap.gender]).trim() : 'Nam';
          let gender: 'Nam' | 'Nữ' = 'Nam';
          const gClean = rawGender.toLowerCase();
          if (gClean === 'nữ' || gClean === 'nu' || gClean === 'female' || gClean === 'f' || gClean === 'gái') {
            gender = 'Nữ';
          }

          // BirthDate
          const rawBirthDate = colMap.birthDate !== -1 ? parseExcelDate(row[colMap.birthDate]) : '';

          // Notes
          const notes = colMap.notes !== -1 && row[colMap.notes] !== undefined ? String(row[colMap.notes]).trim() : '';

          parsed.push({
            code: rawCode.toUpperCase(),
            name: rawName,
            className: matchedClass ? matchedClass.name : (rawClass || 'Chưa phân lớp'),
            classId: matchedClass ? matchedClass.id : (classes[0]?.id || ''),
            gender,
            birthDate: rawBirthDate || undefined,
            notes: notes || undefined,
            isValid: Boolean(rawName.trim()),
          });
        }

        if (parsed.length === 0) {
          throw new Error('Không đọc được danh sách học sinh hợp lệ từ file. Vui lòng kiểm tra lại định dạng file.');
        }

        setParsedRows(parsed);
      } catch (err: any) {
        setErrorMsg(err.message || 'Có lỗi xảy ra khi đọc file Excel.');
        setParsedRows([]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Không thể đọc file này. Vui lòng thử lại với file khác.');
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(fileToProcess);
  };

  const handleDownloadTemplate = () => {
    // Generate Sample Template
    const templateData = [
      ['DANH SÁCH HỌC SINH MÔN TOÁN - TRƯỜNG THCS THẠCH THẤT 2 (PHÂN HIỆU CẨM YÊN)'],
      ['(Thầy cô có thể điền thông tin vào bảng dưới đây hoặc dán danh sách lớp có sẵn)'],
      ['STT', 'Mã học sinh', 'Họ và tên', 'Lớp', 'Giới tính', 'Ngày sinh', 'Ghi chú'],
      [1, 'HS8A01', 'Nguyễn Kiều Tuấn Anh', '8A', 'Nam', '2013-03-15', 'Đội tuyển Toán 8, học lực tốt'],
      [2, 'HS8A02', 'Trần Thu Hà', '8A', 'Nữ', '2013-05-22', 'Nhiệt tình, làm bài tập đầy đủ'],
      [3, 'HS8A03', 'Lê Văn Nam', '8A', 'Nam', '2013-08-10', 'Cần rèn thêm phần hình học trực quan'],
      [4, 'HS8B01', 'Phạm Quỳnh Chi', '8B', 'Nữ', '2013-11-04', 'Chăm chỉ, tiến bộ nhanh'],
      [5, 'HS9A01', 'Đỗ Minh Quân', '9A', 'Nam', '2012-07-19', 'Lớp 9 ôn thi vào lớp 10'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 },  // STT
      { wch: 14 }, // Mã học sinh
      { wch: 26 }, // Họ và tên
      { wch: 10 }, // Lớp
      { wch: 12 }, // Giới tính
      { wch: 15 }, // Ngày sinh
      { wch: 35 }, // Ghi chú
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');

    XLSX.writeFile(workbook, 'Mau_nhap_hoc_sinh_Thay_Kieu_Cao_Long.xlsx');
  };

  const handleConfirmImport = () => {
    const validStudents = parsedRows.filter((r) => r.isValid);
    if (validStudents.length === 0) {
      setErrorMsg('Không có học sinh hợp lệ nào để thêm.');
      return;
    }

    const studentsToSave: Omit<Student, 'id'>[] = validStudents.map((r) => ({
      code: r.code,
      name: r.name,
      classId: r.classId,
      className: r.className,
      gender: r.gender,
      birthDate: r.birthDate,
      notes: r.notes,
    }));

    onImport(studentsToSave, updateExisting);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const duplicateCodesCount = parsedRows.filter((r) =>
    existingStudents.some((es) => es.code.trim().toUpperCase() === r.code.trim().toUpperCase())
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Thêm Học Sinh Bằng File Excel</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                  .xlsx / .xls / .csv
                </span>
              </h3>
              <p className="text-xs text-slate-600">
                Nhập danh sách học sinh nhanh chóng từ file bảng tính của nhà trường
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation inside modal */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeViewTab === 'preview'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xem trước dữ liệu ({parsedRows.length})
            </button>
            <button
              onClick={() => setActiveViewTab('guide')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewTab === 'guide'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hướng dẫn & Cột mẫu</span>
            </button>
          </div>

          {/* Download Template Button */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Tải về file Excel mẫu có sẵn cột tiêu đề và dữ liệu mẫu"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file Excel mẫu (.xlsx)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeViewTab === 'guide' ? (
            /* Guide Tab */
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Quy ước các cột trong file Excel</span>
                </h4>
                <p>
                  Hệ thống tự động nhận diện tên cột thông minh (không phân biệt chữ hoa, chữ thường hay dấu tiếng Việt). File Excel của thầy nên có các cột sau:
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-3">Tên cột khuyến nghị</th>
                      <th className="p-3">Các tên cột khác được hỗ trợ</th>
                      <th className="p-3">Ghi chú & Ví dụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-emerald-700">Họ và tên *</td>
                      <td className="p-3 text-slate-600">Họ tên, Tên học sinh, Name, Fullname</td>
                      <td className="p-3 text-slate-500">Bắt buộc có. VD: <code>Nguyễn Kiều Tuấn Anh</code></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-indigo-700">Mã học sinh</td>
                      <td className="p-3 text-slate-600">Mã HS, MaHS, Mã số, Code</td>
                      <td className="p-3 text-slate-500">Nếu để trống, hệ thống sẽ tự sinh mã (VD: <code>HS8A01</code>)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700">Lớp</td>
                      <td className="p-3 text-slate-600">Lớp học, Tên lớp, Class</td>
                      <td className="p-3 text-slate-500">VD: <code>8A</code>, <code>8B</code>, <code>9A</code>. Nếu để trống sẽ lấy lớp mặc định</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700">Giới tính</td>
                      <td className="p-3 text-slate-600">Phái, Gender</td>
                      <td className="p-3 text-slate-500"><code>Nam</code> hoặc <code>Nữ</code></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700">Ngày sinh</td>
                      <td className="p-3 text-slate-600">Sinh ngày, Birthday, Dob</td>
                      <td className="p-3 text-slate-500">Định dạng <code>DD/MM/YYYY</code> hoặc <code>YYYY-MM-DD</code></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700">Ghi chú</td>
                      <td className="p-3 text-slate-600">Nhận xét, Notes</td>
                      <td className="p-3 text-slate-500">VD: <code>Học lực khá, cần kèm thêm hình học</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Mẹo tiện lợi cho giáo viên:</span>
                  <span>Thầy có thể bấm nút <strong>"Tải file Excel mẫu (.xlsx)"</strong> ở góc phải phía trên để có ngay file chuẩn, chỉ cần mở ra dán tên học sinh vào là xong!</span>
                </div>
              </div>
            </div>
          ) : (
            /* Preview / Upload Tab */
            <>
              {/* File Upload Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  file
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  {isProcessing ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : file ? (
                    <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Upload className="w-6 h-6 text-emerald-600" />
                  )}
                </div>

                {file ? (
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Kích thước: {(file.size / 1024).toFixed(1)} KB • Bấm để chọn file khác
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      Kéo thả file Excel vào đây hoặc <span className="text-emerald-600 underline">bấm để chọn file</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Hỗ trợ các định dạng <strong>.xlsx</strong>, <strong>.xls</strong>, hoặc <strong>.csv</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Options Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                {/* Default Class Fallback */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lớp mặc định (nếu trong file không ghi rõ lớp):
                  </label>
                  <select
                    value={defaultClassId}
                    onChange={(e) => setDefaultClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name} ({c.homeroomTeacher})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duplicate Policy */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Trường hợp trùng Mã học sinh:
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={updateExisting}
                      onChange={(e) => setUpdateExisting(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                    />
                    <span className="text-slate-700 font-medium">
                      Cập nhật thông tin học sinh cũ (nếu trùng mã)
                    </span>
                  </label>
                </div>
              </div>

              {/* Parsed Results Overview */}
              {parsedRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 text-xs">
                        Đã nhận diện: <strong className="text-emerald-700">{validCount}</strong> học sinh hợp lệ
                      </span>
                      {duplicateCodesCount > 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold text-[11px] rounded-md">
                          {duplicateCodesCount} mã trùng lặp ({updateExisting ? 'sẽ cập nhật' : 'giữ nguyên'})
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Hiển thị tối đa 50 dòng xem trước
                    </span>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 font-bold text-slate-600">
                        <tr>
                          <th className="py-2 px-3">STT</th>
                          <th className="py-2 px-3">Mã HS</th>
                          <th className="py-2 px-3">Họ và tên</th>
                          <th className="py-2 px-3">Lớp</th>
                          <th className="py-2 px-3">Giới tính</th>
                          <th className="py-2 px-3">Ngày sinh</th>
                          <th className="py-2 px-3">Ghi chú</th>
                          <th className="py-2 px-3 text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.slice(0, 50).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-700">{row.code}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{row.name}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md">
                                {row.className}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600">{row.gender}</td>
                            <td className="py-2 px-3 text-slate-600">{row.birthDate || '—'}</td>
                            <td className="py-2 px-3 text-slate-500 max-w-xs truncate">{row.notes || '—'}</td>
                            <td className="py-2 px-3 text-right">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                                  <Check className="w-3 h-3" /> Hợp lệ
                                </span>
                              ) : (
                                <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
                                  Thiếu tên
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 && (
              <span>
                Sẵn sàng thêm <strong className="text-emerald-700 font-bold">{validCount}</strong> học sinh vào hệ thống
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleConfirmImport}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                validCount > 0 && !isProcessing
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xác nhận thêm {validCount > 0 ? `(${validCount} HS)` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
