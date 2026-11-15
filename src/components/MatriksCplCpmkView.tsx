import React, { useState, useMemo } from 'react';
import {
  Table,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sliders,
  Filter,
  Search,
  RotateCcw,
  Printer,
  ChevronRight,
  BookOpen,
  Award,
  HelpCircle,
  FileText,
  Eye,
  Plus,
  Trash2,
  Edit,
  X,
  Sparkles,
  ShieldCheck,
  Download
} from 'lucide-react';
import { ProgramStudiInfo, LevelKontribusiCpl, MataKuliahCplMatrixRecord, CplItemObe } from '../types/index';
import {
  CPL_DEFINITIONS_PRODI,
  INITIAL_CPL_CPMK_MATRIX_DATA,
  getKontribusiBadgeStyle
} from '../data/mockCplCpmkMatrixData';
import { PRODI_LIST } from '../data/mockData';
import { MOCK_BORANG_AKREDITASI } from '../data/mockAkreditasiData';
import { exportMatriksCplToExcel } from '../utils/exportHelper';
import {
  buildAkreditasiMatrixPdfMeta,
  computeCplGapAnalysis,
  exportMatriksCplToPdf
} from '../utils/akreditasiPdfExport';
import { StandardKopSurat } from './StandardKopSurat';

interface MatriksCplCpmkViewProps {
  selectedProdi: ProgramStudiInfo;
  onShowToast?: (msg: string) => void;
  semesterFilter?: string;
  onSemesterFilterChange?: (val: string) => void;
  kelompokFilter?: 'ALL' | 'Wajib' | 'Pilihan';
  onKelompokFilterChange?: (val: 'ALL' | 'Wajib' | 'Pilihan') => void;
  onMatrixChange?: () => void;
}

const MATRIX_STORAGE_KEY = 'sikaprodi_v15_matriks_cpl_cpmk';

export const MatriksCplCpmkView: React.FC<MatriksCplCpmkViewProps> = ({
  selectedProdi,
  onShowToast,
  semesterFilter: controlledSemesterFilter,
  onSemesterFilterChange,
  kelompokFilter: controlledKelompokFilter,
  onKelompokFilterChange,
  onMatrixChange
}) => {
  // Prodi Filter (syncs with selectedProdi or allows user to inspect other departments)
  const [currentProdiId, setCurrentProdiId] = useState<'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3'>(selectedProdi.id);

  // Persistent Matrix State (v15 includes complete 133 Sipil + 21 Listrik D3 courses)
  const [matrixData, setMatrixData] = useState<MataKuliahCplMatrixRecord[]>(() => {
    const saved = localStorage.getItem(MATRIX_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_CPL_CPMK_MATRIX_DATA;
  });

  // Filter States (controlled when props are supplied, otherwise local)
  const [searchQuery, setSearchQuery] = useState('');
  const [internalSemesterFilter, setInternalSemesterFilter] = useState<string>('ALL');
  const [internalKelompokFilter, setInternalKelompokFilter] = useState<'ALL' | 'Wajib' | 'Pilihan'>('ALL');
  const [kategoriFilter, setKategoriFilter] = useState<string>('ALL');
  const [activeCplFilter, setActiveCplFilter] = useState<string>('ALL');
  const [standardMode, setStandardMode] = useState<'LAM_TEKNIK' | 'IABEE'>('LAM_TEKNIK');
  const [isConfirmReset, setIsConfirmReset] = useState(false);

  const semesterFilter = controlledSemesterFilter ?? internalSemesterFilter;
  const setSemesterFilter = (val: string) => {
    if (onSemesterFilterChange) onSemesterFilterChange(val);
    setInternalSemesterFilter(val);
  };

  const kelompokFilter = controlledKelompokFilter ?? internalKelompokFilter;
  const setKelompokFilter = (val: 'ALL' | 'Wajib' | 'Pilihan') => {
    if (onKelompokFilterChange) onKelompokFilterChange(val);
    setInternalKelompokFilter(val);
  };

  // Detail Modal for CPMK
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<MataKuliahCplMatrixRecord | null>(null);

  // Cell Level Quick Picker Popover
  const [quickPickerCell, setQuickPickerCell] = useState<{
    courseId: string;
    cplKode: string;
  } | null>(null);

  // Print Preview Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const printAreaRef = React.useRef<HTMLDivElement>(null);

  // Keep prodi in sync when parent selectedProdi changes
  React.useEffect(() => {
    setCurrentProdiId(selectedProdi.id);
  }, [selectedProdi.id]);

  // Dismiss quick picker popover on Escape key
  React.useEffect(() => {
    if (!quickPickerCell) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickPickerCell(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickPickerCell]);

  // Active Prodi Info synced with currentProdiId
  const activeProdiInfo: ProgramStudiInfo = useMemo(() => {
    return PRODI_LIST.find(p => p.id === currentProdiId) || selectedProdi;
  }, [currentProdiId, selectedProdi]);

  // Active CPL definitions for current prodi
  const activeCpls: CplItemObe[] = useMemo(() => {
    return CPL_DEFINITIONS_PRODI[currentProdiId] || CPL_DEFINITIONS_PRODI.SIPIL;
  }, [currentProdiId]);

  // Filtered course rows for the current prodi
  const prodiCourses = useMemo(() => {
    return matrixData.filter(m => m.prodiId === currentProdiId);
  }, [matrixData, currentProdiId]);

  // Search and filtered rows (supports Semester 01-08, B, K, Lainnya, Wajib vs Pilihan, Kategori, CPL)
  const filteredCourses = useMemo(() => {
    return prodiCourses.filter(course => {
      const matchSearch =
        course.namaMK.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.kodeMK.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.dosenPengampu.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSemester =
        semesterFilter === 'ALL'
          ? true
          : semesterFilter === 'B' || semesterFilter === 'K'
          ? course.semesterLabel === semesterFilter
          : semesterFilter === 'LAINNYA'
          ? course.semester === 0 && course.semesterLabel !== 'B' && course.semesterLabel !== 'K'
          : String(course.semester) === semesterFilter;

      const courseKelompok = course.kelompokKurikulum || (course.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib');
      const matchKelompok = kelompokFilter === 'ALL' || courseKelompok === kelompokFilter;
      const matchKategori = kategoriFilter === 'ALL' || course.kategori === kategoriFilter;
      const matchCpl =
        activeCplFilter === 'ALL' ||
        (course.pemetaanCpl[activeCplFilter] && course.pemetaanCpl[activeCplFilter] !== 'None');

      return matchSearch && matchSemester && matchKelompok && matchKategori && matchCpl;
    });
  }, [prodiCourses, searchQuery, semesterFilter, kelompokFilter, kategoriFilter, activeCplFilter]);

  const hasActiveFilters =
    semesterFilter !== 'ALL' ||
    kelompokFilter !== 'ALL' ||
    kategoriFilter !== 'ALL' ||
    activeCplFilter !== 'ALL' ||
    searchQuery.trim().length > 0;

  const filterContextLabel = useMemo(() => {
    const parts: string[] = [];
    if (semesterFilter !== 'ALL') {
      parts.push(
        semesterFilter === 'B'
          ? 'Semester B (Khusus)'
          : semesterFilter === 'K'
          ? 'Semester K (Konversi)'
          : semesterFilter === 'LAINNYA'
          ? 'Lintas Kurikulum (-)'
          : `Semester ${semesterFilter.padStart(2, '0')}`
      );
    }
    if (kelompokFilter !== 'ALL') {
      parts.push(`Kelompok ${kelompokFilter}`);
    }
    if (kategoriFilter !== 'ALL') {
      parts.push(`Kategori ${kategoriFilter}`);
    }
    if (activeCplFilter !== 'ALL') {
      parts.push(`Fokus ${activeCplFilter}`);
    }
    if (searchQuery.trim()) {
      parts.push(`Pencarian "${searchQuery.trim()}"`);
    }
    return parts.length > 0 ? parts.join(' · ') : 'Seluruh Semester & Kelompok Kurikulum (Wajib & Pilihan)';
  }, [semesterFilter, kelompokFilter, kategoriFilter, activeCplFilter, searchQuery]);

  const gapAnalysisRows = useMemo(() => {
    const borangCpls = (MOCK_BORANG_AKREDITASI[currentProdiId] || MOCK_BORANG_AKREDITASI.SIPIL).cplList;
    return computeCplGapAnalysis(activeCpls, borangCpls, prodiCourses);
  }, [activeCpls, currentProdiId, prodiCourses]);

  // Calculate CPL Coverage Statistics (Gap Analysis)
  const cplCoverageStats = useMemo(() => {
    const stats: Record<string, { strong: number; medium: number; low: number; totalMapped: number; totalScore: number }> = {};
    
    activeCpls.forEach(cpl => {
      stats[cpl.kode] = { strong: 0, medium: 0, low: 0, totalMapped: 0, totalScore: 0 };
    });

    prodiCourses.forEach(course => {
      activeCpls.forEach(cpl => {
        const level = course.pemetaanCpl[cpl.kode] || 'None';
        if (level === 'Strong') {
          stats[cpl.kode].strong += 1;
          stats[cpl.kode].totalMapped += 1;
          stats[cpl.kode].totalScore += 3;
        } else if (level === 'Medium') {
          stats[cpl.kode].medium += 1;
          stats[cpl.kode].totalMapped += 1;
          stats[cpl.kode].totalScore += 2;
        } else if (level === 'Low') {
          stats[cpl.kode].low += 1;
          stats[cpl.kode].totalMapped += 1;
          stats[cpl.kode].totalScore += 1;
        }
      });
    });

    return stats;
  }, [activeCpls, prodiCourses]);

  // Save changes to localStorage
  const saveMatrixChanges = (updated: MataKuliahCplMatrixRecord[]) => {
    setMatrixData(updated);
    try {
      localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    if (onMatrixChange) {
      onMatrixChange();
    }
  };

  // Toggle cell contribution level cycle: None -> Strong -> Medium -> Low -> None
  const handleToggleCellContribution = (courseId: string, cplKode: string) => {
    const nextLevelMap: Record<LevelKontribusiCpl, LevelKontribusiCpl> = {
      None: 'Strong',
      Strong: 'Medium',
      Medium: 'Low',
      Low: 'None'
    };

    const updated = matrixData.map(course => {
      if (course.id === courseId) {
        const currentLevel = course.pemetaanCpl[cplKode] || 'None';
        const nextLevel = nextLevelMap[currentLevel];
        return {
          ...course,
          pemetaanCpl: {
            ...course.pemetaanCpl,
            [cplKode]: nextLevel
          }
        };
      }
      return course;
    });

    saveMatrixChanges(updated);
    if (onShowToast) {
      onShowToast(`Matriks diperbarui: ${cplKode} berhasil diubah.`);
    }
  };

  // Explicit set cell contribution level
  const handleSetCellContribution = (courseId: string, cplKode: string, level: LevelKontribusiCpl) => {
    const updated = matrixData.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          pemetaanCpl: {
            ...course.pemetaanCpl,
            [cplKode]: level
          }
        };
      }
      return course;
    });

    saveMatrixChanges(updated);
    setQuickPickerCell(null);
    if (onShowToast) {
      onShowToast(`Relasi ${cplKode} diset ke ${level}.`);
    }
  };

  // Reset to default (inline confirmation without window.confirm)
  const handleConfirmResetToDefault = () => {
    setMatrixData(INITIAL_CPL_CPMK_MATRIX_DATA);
    try {
      localStorage.removeItem(MATRIX_STORAGE_KEY);
    } catch {}
    setIsConfirmReset(false);
    if (onMatrixChange) {
      onMatrixChange();
    }
    if (onShowToast) {
      onShowToast('Matriks CPL dan CPMK telah direset ke kurikulum OBE baku.');
    }
  };

  // Print PDF Handler
  const handlePrintDocument = () => {
    if (filteredCourses.length === 0) {
      if (onShowToast) {
        onShowToast('Tidak ada mata kuliah yang cocok dengan filter aktif untuk dicetak. Reset filter terlebih dahulu.');
      }
      return;
    }
    exportMatriksCplToPdf(printAreaRef.current, activeProdiInfo, {
      filterLabel: hasActiveFilters ? filterContextLabel : undefined
    });
  };

  // Export to Excel (.xlsx / .csv) Handler — exports active filtered section for borang
  const handleExportExcel = (format: 'xlsx' | 'csv' = 'xlsx') => {
    if (filteredCourses.length === 0) {
      if (onShowToast) {
        onShowToast('Tidak ada mata kuliah yang cocok dengan filter aktif untuk diekspor. Reset filter atau pilih cakupan lain.');
      }
      return;
    }
    exportMatriksCplToExcel(filteredCourses, activeCpls, activeProdiInfo, format, {
      filterContextLabel: hasActiveFilters ? filterContextLabel : undefined,
      gapAnalysisRows
    });
    if (onShowToast) {
      onShowToast(
        `Laporan matriks CPL (${filteredCourses.length} MK) format ${format === 'xlsx' ? 'Excel (.xlsx)' : 'CSV'} berhasil diunduh untuk borang akreditasi.`
      );
    }
  };

  const printMeta = useMemo(
    () => buildAkreditasiMatrixPdfMeta(activeProdiInfo, filteredCourses, filterContextLabel),
    [activeProdiInfo, filteredCourses, filterContextLabel]
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header & Context Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-blue-300 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instrumen Akreditasi LAM-Teknik &amp; Standar IABEE</span>
              <span aria-hidden="true">·</span>
              <span>Kurikulum OBE 2024/2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5 flex-wrap">
              <span>Matriks Pemetaan Relasi Mata Kuliah, CPMK &amp; CPL</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                Interaktif (S / M / L)
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Pemetaan kontribusi Mata Kuliah terhadap Capaian Pembelajaran Lulusan (CPL) melalui Capaian Pembelajaran Mata Kuliah (CPMK) berstandar Taksonomi Bloom. Klik langsung pada sel tabel untuk mengubah derajat kontribusi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleExportExcel('xlsx')}
              disabled={filteredCourses.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all cursor-pointer"
              title="Unduh laporan matriks CPL, Gap Analysis, dan CPMK format Microsoft Excel (.xlsx) untuk borang akreditasi"
            >
              <Download className="w-4 h-4 text-emerald-950" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportExcel('csv')}
              disabled={filteredCourses.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-colors cursor-pointer"
              title="Unduh format CSV UTF-8"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              disabled={filteredCourses.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Ekspor PDF Resmi</span>
            </button>
            {!isConfirmReset ? (
              <button
                type="button"
                onClick={() => setIsConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors cursor-pointer"
                title="Reset ke pengaturan kurikulum default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-slate-800 border border-amber-400/50 rounded-xl px-2 py-1">
                <span className="text-[11px] text-amber-200 font-semibold px-1">Reset data?</span>
                <button
                  type="button"
                  onClick={handleConfirmResetToDefault}
                  className="px-2 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg cursor-pointer"
                >
                  Ya
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmReset(false)}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white rounded-lg cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Legend Indicator, Accreditation Standard Mode Switcher & Department Selector */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Prodi Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setCurrentProdiId('SIPIL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currentProdiId === 'SIPIL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                S1 Teknik Sipil
              </button>
              <button
                type="button"
                onClick={() => setCurrentProdiId('LINGKUNGAN')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currentProdiId === 'LINGKUNGAN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                S1 Teknik Lingkungan
              </button>
              <button
                type="button"
                onClick={() => setCurrentProdiId('LISTRIK_D3')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currentProdiId === 'LISTRIK_D3'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                D3 Teknik Listrik
              </button>
            </div>

            {/* Interactive Accreditation Standard Mode Switcher: LAM-Teknik vs IABEE */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-emerald-500/40 text-xs">
              <button
                type="button"
                onClick={() => setStandardMode('LAM_TEKNIK')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  standardMode === 'LAM_TEKNIK'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Standar LAM-Teknik
              </button>
              <button
                type="button"
                onClick={() => setStandardMode('IABEE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  standardMode === 'IABEE'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Standar IABEE (SO a–k)
              </button>
            </div>
          </div>

          {/* Level Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Skala Kontribusi:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[11px] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span>Strong (S) - Bobot &ge;40%</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[11px] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span>Medium (M) - Bobot 20-39%</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500 text-white font-bold text-[11px] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span>Low (L) - Bobot &lt;20%</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-[11px] border border-slate-700">
              <span>None (-)</span>
            </span>
          </div>
        </div>
      </div>

      {/* CPL Coverage & Curriculum Gap Analysis Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Analisis Ketercakupan CPL (Curriculum Gap Analysis LAM-Teknik)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemantauan distribusi mata kuliah pembina CPL pada kurikulum {currentProdiId === 'SIPIL' ? 'S1 Teknik Sipil' : currentProdiId === 'LINGKUNGAN' ? 'S1 Teknik Lingkungan' : 'D3 Teknik Listrik'}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
            Total {prodiCourses.length} Mata Kuliah Terpetakan
          </span>
        </div>

        {/* CPL Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {activeCpls.map((cpl, idx) => {
            const stat = cplCoverageStats[cpl.kode] || { strong: 0, medium: 0, low: 0, totalMapped: 0, totalScore: 0 };
            const isOptimal = stat.strong >= 2;
            const isSelected = activeCplFilter === cpl.kode;
            const iabeeRef = `IABEE SO-${String.fromCharCode(97 + idx)}`;

            return (
              <button
                key={cpl.kode}
                type="button"
                onClick={() => setActiveCplFilter(isSelected ? 'ALL' : cpl.kode)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
                title={cpl.deskripsi}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">
                      {standardMode === 'IABEE' ? `SO-${String.fromCharCode(65 + idx)}` : cpl.kode}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isOptimal ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 mt-0.5 line-clamp-1">
                    {cpl.judul}
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-tight mt-0.5">
                    {standardMode === 'IABEE' ? `${cpl.kode} · ${iabeeRef}` : cpl.ranah}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-emerald-700 font-extrabold" title="Jumlah MK Strong">
                    {stat.strong}S
                  </span>
                  <span className="font-mono text-amber-700 font-bold" title="Jumlah MK Medium">
                    {stat.medium}M
                  </span>
                  <span className="font-mono text-sky-700 font-bold" title="Jumlah MK Low">
                    {stat.low}L
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Quick Segmented Filter: Kelompok Wajib vs Pilihan */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/70">
            {([
              { id: 'ALL', label: `Semua Kelompok (${prodiCourses.length})` },
              {
                id: 'Wajib',
                label: `Wajib (${prodiCourses.filter(c => (c.kelompokKurikulum || (c.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib')) === 'Wajib').length})`
              },
              {
                id: 'Pilihan',
                label: `Pilihan (${prodiCourses.filter(c => (c.kelompokKurikulum || (c.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib')) === 'Pilihan').length})`
              }
            ] as const).map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setKelompokFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  kelompokFilter === opt.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Quick Semester 1-8 Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Semester:</span>
            {['ALL', '1', '2', '3', '4', '5', '6', '7', '8'].map(sem => (
              <button
                key={sem}
                type="button"
                onClick={() => setSemesterFilter(sem)}
                className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  semesterFilter === sem
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sem === 'ALL' ? 'Semua' : `S${sem}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari mata kuliah, kode, atau dosen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
            />
          </div>

          {/* Semester Filter Dropdown (includes 01-08, B, K, and unallocated) */}
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            aria-label="Filter berdasarkan semester penyajian"
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Semester</option>
            <option value="1">Semester 01</option>
            <option value="2">Semester 02</option>
            <option value="3">Semester 03</option>
            <option value="4">Semester 04</option>
            <option value="5">Semester 05</option>
            <option value="6">Semester 06</option>
            <option value="7">Semester 07</option>
            <option value="8">Semester 08</option>
            <option value="B">Semester B (Khusus)</option>
            <option value="K">Semester K (Konversi)</option>
            <option value="LAINNYA">Lintas / Belum Terjadwal (-)</option>
          </select>

          {/* Kategori Filter */}
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            aria-label="Filter berdasarkan kategori mata kuliah"
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Wajib Prodi">Wajib Prodi</option>
            <option value="Wajib Fakultas">Wajib Fakultas</option>
            <option value="Studio/Praktikum">Studio / Praktikum</option>
            <option value="Pilihan">Pilihan</option>
            <option value="Tugas Akhir">Tugas Akhir</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSemesterFilter('ALL');
                setKelompokFilter('ALL');
                setKategoriFilter('ALL');
                setActiveCplFilter('ALL');
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Cakupan Borang Aktif: <strong className="text-slate-800">{filterContextLabel}</strong></span>
            {activeCplFilter !== 'ALL' && (
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-flex items-center gap-1">
                <span>Fokus: <strong>{activeCplFilter}</strong></span>
                <button
                  type="button"
                  onClick={() => setActiveCplFilter('ALL')}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <div className="font-mono tabular-nums text-slate-600">
            {filteredCourses.length} MK · {filteredCourses.reduce((s, c) => s + c.sks, 0)} SKS
          </div>
        </div>
      </div>

      {/* INTERACTIVE MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Tabel Matriks Kontribusi Mata Kuliah terhadap CPL
            </h4>
            <span className="text-[11px] text-slate-500 tabular-nums">
              (Menampilkan {filteredCourses.length} dari {prodiCourses.length} Mata Kuliah)
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Klik langsung pada sel kontribusi untuk mengubah tingkat relasi (S &rarr; M &rarr; L &rarr; -)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3 w-10 text-center font-bold">No</th>
                <th className="py-3 px-3 w-24 font-bold">Kode</th>
                <th className="py-3 px-4 min-w-[220px] font-bold">Nama Mata Kuliah</th>
                <th className="py-3 px-2 text-center w-12 font-bold">SKS</th>
                <th className="py-3 px-2 text-center w-12 font-bold">Sem</th>
                <th className="py-3 px-3 w-36 font-bold">Kelompok / Kategori</th>
                {/* 8 CPL Columns */}
                {activeCpls.map(cpl => (
                  <th
                    key={cpl.kode}
                    className="py-3 px-2 text-center font-extrabold w-14 border-l border-slate-200 bg-slate-100/90"
                    title={`${cpl.kode}: ${cpl.judul}\n${cpl.deskripsi}`}
                  >
                    <div className="text-slate-900">{cpl.kode}</div>
                    <div className="text-[9px] font-normal text-slate-500 truncate max-w-[56px]">
                      {cpl.judul}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-3 text-center w-28 font-bold border-l border-slate-200">CPMK &amp; Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6 + activeCpls.length + 1} className="py-12 text-center text-slate-500">
                    <div>Tidak ada mata kuliah yang cocok dengan filter pencarian atau cakupan semester/kelompok.</div>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSemesterFilter('ALL');
                          setKelompokFilter('ALL');
                          setKategoriFilter('ALL');
                          setActiveCplFilter('ALL');
                        }}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Semua Filter</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course, idx) => {
                  const semDisplay = course.semesterLabel || (course.semester > 0 ? String(course.semester).padStart(2, '0') : '-');
                  const kelompok = course.kelompokKurikulum || (course.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib');
                  return (
                    <tr key={course.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {course.kodeMK}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {course.namaMK}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Dosen: <span className="font-semibold text-slate-700">{course.dosenPengampu}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono tabular-nums font-bold text-slate-700">
                        {course.sks}
                      </td>
                      <td className="py-3 px-2 text-center font-mono tabular-nums font-bold text-slate-700">
                        {semDisplay}
                      </td>
                      <td className="py-3 px-3 space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          kelompok === 'Pilihan'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {kelompok}
                        </span>
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            course.kategori === 'Tugas Akhir' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            course.kategori === 'Studio/Praktikum' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            course.kategori === 'Wajib Fakultas' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            course.kategori === 'Pilihan' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {course.kategori}
                          </span>
                        </div>
                      </td>

                      {/* 8 CPL Interactive Cells */}
                      {activeCpls.map(cpl => {
                        const level: LevelKontribusiCpl = course.pemetaanCpl[cpl.kode] || 'None';
                        const style = getKontribusiBadgeStyle(level);
                        const isQuickOpen = quickPickerCell?.courseId === course.id && quickPickerCell?.cplKode === cpl.kode;

                        return (
                          <td
                            key={cpl.kode}
                            className="py-2 px-1 text-center border-l border-slate-100 relative"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleCellContribution(course.id, cpl.kode)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setQuickPickerCell(isQuickOpen ? null : { courseId: course.id, cplKode: cpl.kode });
                              }}
                              className={`w-9 h-7 mx-auto rounded-lg font-black text-xs transition-all flex items-center justify-center cursor-pointer shadow-2xs ${style.bgClass} hover:scale-105 active:scale-95`}
                              title={`Klik untuk rotasi nilai: ${cpl.kode} - ${cpl.judul}\nStatus Saat Ini: ${style.label}\n(Klik kanan untuk memilih langsung)`}
                            >
                              {style.short}
                            </button>

                            {/* Quick Context Menu Popover on Right Click */}
                            {isQuickOpen && (
                              <div className="absolute z-30 left-1/2 -translate-x-1/2 top-10 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 w-36 flex flex-col gap-1 text-left animate-in fade-in zoom-in-95">
                                <div className="flex items-center justify-between px-2 py-0.5">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    Pilih Nilai:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setQuickPickerCell(null)}
                                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                    aria-label="Tutup pemilih level"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSetCellContribution(course.id, cpl.kode, 'Strong')}
                                  className="px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-50 rounded flex items-center justify-between cursor-pointer"
                                >
                                  <span>Strong (S)</span>
                                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetCellContribution(course.id, cpl.kode, 'Medium')}
                                  className="px-2 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-50 rounded flex items-center justify-between cursor-pointer"
                                >
                                  <span>Medium (M)</span>
                                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetCellContribution(course.id, cpl.kode, 'Low')}
                                  className="px-2 py-1 text-[11px] font-bold text-sky-800 hover:bg-sky-50 rounded flex items-center justify-between cursor-pointer"
                                >
                                  <span>Low (L)</span>
                                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetCellContribution(course.id, cpl.kode, 'None')}
                                  className="px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded flex items-center justify-between cursor-pointer"
                                >
                                  <span>None (-)</span>
                                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Action & CPMK Detail Button */}
                      <td className="py-2 px-3 text-center border-l border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedCourseForDetail(course)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          title="Lihat rincian CPMK dan taksonomi Bloom"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{course.cpmkList.length} CPMK</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredCourses.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                  <td colSpan={3} className="py-2.5 px-4 text-right text-[11px]">
                    Total Cakupan ({filteredCourses.length} MK) — Distribusi S / M / L:
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono tabular-nums text-blue-800">
                    {filteredCourses.reduce((s, c) => s + c.sks, 0)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 text-center text-[10px] text-slate-500">
                    S / M / L
                  </td>
                  {activeCpls.map(cpl => {
                    const s = filteredCourses.filter(m => m.pemetaanCpl[cpl.kode] === 'Strong').length;
                    const m = filteredCourses.filter(m => m.pemetaanCpl[cpl.kode] === 'Medium').length;
                    const l = filteredCourses.filter(m => m.pemetaanCpl[cpl.kode] === 'Low').length;
                    return (
                      <td
                        key={cpl.kode}
                        className="py-2.5 px-1 text-center font-mono tabular-nums text-[10px] border-l border-slate-200 text-slate-700"
                        title={`${cpl.kode}: ${s} Strong, ${m} Medium, ${l} Low`}
                      >
                        {s}/{m}/{l}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-center font-mono tabular-nums text-[11px] border-l border-slate-200 text-slate-700">
                    {filteredCourses.reduce((sum, c) => sum + c.cpmkList.length, 0)} CPMK
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer Summary note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Perubahan pemetaan matriks otomatis disimpan secara lokal (localStorage) dan tersinkronisasi dengan instrumen Borang Akreditasi LAM-Teknik FT UNBARI.
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono font-semibold text-slate-700">
            <span>S: Strong (3)</span>
            <span>·</span>
            <span>M: Medium (2)</span>
            <span>·</span>
            <span>L: Low (1)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RINCIAN CPMK (COURSE LEARNING OUTCOMES)                          */}
      {/* ========================================================================= */}
      {selectedCourseForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-blue-200 font-semibold uppercase tracking-wider">
                  <span>Rincian Capaian Pembelajaran Mata Kuliah (CPMK)</span>
                  <span>·</span>
                  <span>Semester {selectedCourseForDetail.semester}</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedCourseForDetail.kodeMK} - {selectedCourseForDetail.namaMK} ({selectedCourseForDetail.sks} SKS)
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Dosen Pengampu: <strong>{selectedCourseForDetail.dosenPengampu}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCourseForDetail(null)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Kurikulum Note */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Deskripsi Peran Mata Kuliah:</div>
                  <div className="mt-0.5 text-blue-800">{selectedCourseForDetail.catatanKurikulum || 'Mata kuliah pembentuk kompetensi utama program studi.'}</div>
                </div>
              </div>

              {/* CPMK Breakdown List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Daftar Butir CPMK &amp; Taksonomi Bloom</span>
                  <span className="text-xs font-bold text-slate-500">
                    Total Bobot: {selectedCourseForDetail.cpmkList.reduce((acc, c) => acc + c.bobotPersen, 0)}%
                  </span>
                </h4>

                {selectedCourseForDetail.cpmkList.map((cpmk, idx) => (
                  <div key={cpmk.kode} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs">
                          {cpmk.kode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {cpmk.levelBloom}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        Bobot {cpmk.bobotPersen}%
                      </span>
                    </div>

                    <p className="text-slate-800 font-medium leading-relaxed">
                      {cpmk.deskripsi}
                    </p>

                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div>
                        Metode Asesmen: <strong className="text-slate-700">{cpmk.metodeAsesmen}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>Mendukung CPL:</span>
                        {cpmk.cplTerkait.map(cplK => (
                          <span key={cplK} className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                            {cplK}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pemetaan CPL Summary for this Course */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-extrabold text-sm text-slate-900 mb-2">
                  Ringkasan Pemetaan CPL Mata Kuliah Ini
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeCpls.map(cpl => {
                    const level = selectedCourseForDetail.pemetaanCpl[cpl.kode] || 'None';
                    const style = getKontribusiBadgeStyle(level);
                    return (
                      <div key={cpl.kode} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-black text-xs text-slate-800">{cpl.kode}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[90px]">{cpl.judul}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${style.bgClass}`}>
                          {style.short}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedCourseForDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EKSPOR PDF RESMI MATRIKS CPL-CPMK (KOP SURAT FT UNBARI)          */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Header Dialog */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">
                  Pratinjau Ekspor PDF Matriks Kontribusi CPL (Kop Surat Resmi FT UNBARI)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Simpan PDF / Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Area Preview */}
            <div className="p-6 overflow-y-auto bg-slate-100/70 flex justify-center">
              <div
                ref={printAreaRef}
                className="printable-document bg-white p-8 rounded-lg shadow-sm w-full max-w-4xl text-slate-900 font-serif border border-slate-300"
                style={{ minHeight: '600px' }}
              >
                {/* Official FT UNBARI Kop Surat */}
                <StandardKopSurat
                  prodiName={`PROGRAM STUDI ${activeProdiInfo.nama.toUpperCase()}`}
                  subTitle="Gugus Penjaminan Mutu Fakultas (GPMF) · Instrumen Borang Akreditasi LAM-Teknik"
                  showQrCode={true}
                  qrCodeUrl={`https://ft.unbari.ac.id/verifikasi/borang-cpl?prodi=${currentProdiId}&doc=${encodeURIComponent(printMeta.nomorDokumen)}`}
                  qrBadgeText="GPMF FT"
                />

                {/* Document Title & Metadata */}
                <div className="text-center mb-5">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 underline">
                    {printMeta.judulDokumen}
                  </h2>
                  <p className="text-[11px] font-sans font-semibold text-slate-700 mt-1">
                    {printMeta.subJudulDokumen}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-sans bg-slate-50 border border-slate-300 rounded p-2.5 mb-4">
                  <div><span className="text-slate-500">Nomor Dokumen:</span> <strong className="font-mono">{printMeta.nomorDokumen}</strong></div>
                  <div><span className="text-slate-500">Tanggal Pembuatan:</span> <strong>{printMeta.tanggalPembuatan}</strong></div>
                  <div><span className="text-slate-500">Cakupan Borang:</span> <strong>{printMeta.filterScopeLabel}</strong></div>
                  <div><span className="text-slate-500">Rekap Data:</span> <strong className="font-mono tabular-nums">{printMeta.totalMataKuliah} Mata Kuliah ({printMeta.totalSks} SKS)</strong></div>
                </div>

                {/* Print Table */}
                <table className="w-full text-[9.5px] font-sans border-collapse border border-black mb-5">
                  <thead>
                    <tr className="bg-slate-100 border border-black">
                      <th className="border border-black p-1 text-center w-6">No</th>
                      <th className="border border-black p-1 text-center w-16">Kode</th>
                      <th className="border border-black p-1 text-left">Nama Mata Kuliah</th>
                      <th className="border border-black p-1 text-center w-8">SKS</th>
                      <th className="border border-black p-1 text-center w-8">Sem</th>
                      <th className="border border-black p-1 text-center w-14">Kelompok</th>
                      {activeCpls.map(cpl => (
                        <th key={cpl.kode} className="border border-black p-1 text-center w-9">
                          {cpl.kode}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={6 + activeCpls.length} className="border border-black p-4 text-center text-slate-500">
                          Tidak ada mata kuliah pada filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((c, i) => {
                        const semDisplay = c.semesterLabel || (c.semester > 0 ? String(c.semester).padStart(2, '0') : '-');
                        const kelompok = c.kelompokKurikulum || (c.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib');
                        return (
                          <tr key={c.id} className="border border-black">
                            <td className="border border-black p-1 text-center tabular-nums">{i + 1}</td>
                            <td className="border border-black p-1 font-mono">{c.kodeMK}</td>
                            <td className="border border-black p-1 font-semibold">{c.namaMK}</td>
                            <td className="border border-black p-1 text-center tabular-nums">{c.sks}</td>
                            <td className="border border-black p-1 text-center tabular-nums">{semDisplay}</td>
                            <td className="border border-black p-1 text-center">{kelompok}</td>
                            {activeCpls.map(cpl => {
                              const lvl = c.pemetaanCpl[cpl.kode] || 'None';
                              const shortLvl = lvl === 'Strong' ? 'S' : lvl === 'Medium' ? 'M' : lvl === 'Low' ? 'L' : '-';
                              const cellBg = lvl === 'Strong' ? 'bg-emerald-100 font-bold' : lvl === 'Medium' ? 'bg-amber-100' : '';
                              return (
                                <td key={cpl.kode} className={`border border-black p-1 text-center ${cellBg}`}>
                                  {shortLvl}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 border border-black font-bold">
                      <td colSpan={3} className="border border-black p-1 text-right">Total SKS / Sebaran (S/M/L):</td>
                      <td className="border border-black p-1 text-center tabular-nums">{printMeta.totalSks}</td>
                      <td colSpan={2} className="border border-black p-1 text-center">-</td>
                      {activeCpls.map(cpl => {
                        const s = filteredCourses.filter(m => m.pemetaanCpl[cpl.kode] === 'Strong').length;
                        const m = filteredCourses.filter(m => m.pemetaanCpl[cpl.kode] === 'Medium').length;
                        const l = filteredCourses.filter(m => m.pemetaanCpl[cpl.kode] === 'Low').length;
                        return (
                          <td key={cpl.kode} className="border border-black p-1 text-center text-[8px] font-mono">
                            {s}/{m}/{l}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>

                {/* Compact Gap Analysis Table inside PDF */}
                <div className="mb-4 font-sans">
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-slate-900">
                    Ringkasan Gap Analysis Capaian CPL vs Target Kurikulum OBE:
                  </div>
                  <table className="w-full text-[9px] border-collapse border border-black">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-black p-1 text-center w-14">Kode</th>
                        <th className="border border-black p-1 text-left">Kompetensi Lulusan</th>
                        <th className="border border-black p-1 text-right w-16">Capaian</th>
                        <th className="border border-black p-1 text-right w-16">Target</th>
                        <th className="border border-black p-1 text-right w-14">Gap</th>
                        <th className="border border-black p-1 text-center w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gapAnalysisRows.map(row => (
                        <tr key={row.kode}>
                          <td className="border border-black p-1 text-center font-mono font-bold">{row.kode}</td>
                          <td className="border border-black p-1">{row.judul} ({row.ranah})</td>
                          <td className="border border-black p-1 text-right font-mono tabular-nums">{row.capaianSaatIni.toFixed(1)}%</td>
                          <td className="border border-black p-1 text-right font-mono tabular-nums">{row.targetKurikulum.toFixed(1)}%</td>
                          <td className="border border-black p-1 text-right font-mono tabular-nums font-bold">
                            {row.gap >= 0 ? '+' : ''}{row.gap.toFixed(1)}%
                          </td>
                          <td className="border border-black p-1 text-center">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CPL Descriptions Box */}
                <div className="border border-slate-400 p-3 rounded text-[9px] font-sans mb-6 bg-slate-50">
                  <div className="font-bold mb-1 uppercase">Keterangan Rumusan Capaian Pembelajaran Lulusan (CPL) &amp; Skala Kontribusi (S/M/L):</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {activeCpls.map(cpl => (
                      <div key={cpl.kode}>
                        <strong>{cpl.kode} ({cpl.ranah}):</strong> {cpl.judul} — Target &ge; {cpl.targetKetercapaianMinimal}%
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signatures Block */}
                <div className="signature-block grid grid-cols-2 gap-12 text-center text-xs mt-6 pt-3">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-bold">Ketua Program Studi {activeProdiInfo.nama}</div>
                    <div className="h-16"></div>
                    <div className="font-bold underline">{activeProdiInfo.kaprodi}</div>
                    <div className="text-[10px] text-slate-600">NIDN / NUPTK: {activeProdiInfo.nipKaprodi}</div>
                  </div>

                  <div>
                    <div>Jambi, {printMeta.tanggalPembuatan}</div>
                    <div className="font-bold">Dekan Fakultas Teknik UNBARI</div>
                    <div className="h-16"></div>
                    <div className="font-bold underline">{printMeta.dekanNama}</div>
                    <div className="text-[10px] text-slate-600">NIDN: {printMeta.dekanNidn}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportExcel('xlsx')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Format Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportExcel('csv')}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Ekspor PDF / Cetak Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
