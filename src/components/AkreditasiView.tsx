import React, { useState } from 'react';
import { 
  Award, 
  FileCheck2, 
  CheckCircle2, 
  TrendingUp, 
  BookOpen, 
  Layers, 
  Printer, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  Target,
  FileText,
  Save,
  Sliders,
  BarChart3,
  Edit3,
  Table,
  Download,
  X,
  Filter,
  AlertTriangle,
  Search,
  RotateCcw,
  ClipboardCheck,
  Copy,
  Wrench,
  GraduationCap,
  Activity,
  FileSearch,
  Upload,
  Plus,
  Check,
  Send,
  Mail,
  BellRing,
  Users,
  Sparkles,
  Grid3X3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  ProgramStudiInfo,
  BorangAkreditasiProdi,
  MataKuliahCplMatrixRecord,
  Mahasiswa,
  Dosen,
  JadwalKuliah,
  LogPresensiDosen
} from '../types/index';
import { INITIAL_MAHASISWA, INITIAL_DOSEN, INITIAL_JADWAL } from '../data/mockData';
import { MOCK_BORANG_AKREDITASI } from '../data/mockAkreditasiData';
import { AkreditasiPrintModal } from './AkreditasiPrintModal';
import { MatriksCplCpmkView } from './MatriksCplCpmkView';
import { CplSpiderChartAngkatanView } from './CplSpiderChartAngkatanView';
import { RasioDosenMahasiswaView } from './RasioDosenMahasiswaView';
import { RpsUploadProdiProgressView } from './RpsUploadProdiProgressView';
import { AiRpsEvaluatorPanel } from './AiRpsEvaluatorPanel';
import { MatriksKualitasRpsHeatmap } from './MatriksKualitasRpsHeatmap';
import { PrintableReport } from './PrintableReport';
import { exportMatriksCplToExcel } from '../utils/exportHelper';
import {
  buildAkreditasiMatrixPdfMeta,
  computeCplGapAnalysis,
  exportMatriksCplToPdf,
  OFFICIAL_FT_UNBARI_LOGO_URL
} from '../utils/akreditasiPdfExport';
import {
  CPL_DEFINITIONS_PRODI,
  INITIAL_CPL_CPMK_MATRIX_DATA,
  getKontribusiBadgeStyle
} from '../data/mockCplCpmkMatrixData';
import {
  auditCoursesCplContribution,
  CourseCplAuditResult,
  MIN_CPL_COURSE_STANDARD_PERCENT
} from '../utils/cplRpsAuditHelper';
import {
  computeAccreditationProjection,
  ProjectionScenarioAdjustments,
  SCORE_THRESHOLD_BAIK_SEKALI,
  SCORE_THRESHOLD_UNGGUL
} from '../utils/akreditasiProjectionHelper';
import {
  buildRpsPerformanceAuditReport,
  RpsPerformanceStatus
} from '../utils/rpsPerformanceAuditHelper';
import {
  auditCoursesRpsQuality,
  CourseRpsQualityResult,
  QualityStatus
} from '../utils/rpsQualityAuditHelper';
import {
  runSmartRpsAudit,
  SmartRpsDocumentOverride,
  SmartRpsValidationStatus,
  OBE_ASSESSMENT_CATEGORIES,
  AssessmentCategoryId
} from '../utils/smartRpsAuditHelper';
import {
  CURRENT_RPS_ACADEMIC_TERM,
  LecturerPendingRpsGroup,
  RpsCourseUploadAuditItem,
  RpsReminderDispatchRecord,
  UploadedRpsFileRecord,
  buildRpsReminderMessage,
  scanCoursesRpsUploadCompliance
} from '../utils/rpsUploadAuditHelper';
import { buildRasioDosenProyeksiReport } from '../utils/rasioDosenProyeksiHelper';
import {
  buildCplCompletenessAuditReport,
  CourseCplCompletenessItem
} from '../utils/cplCompletenessAuditHelper';
import {
  buildAssessmentQualityAuditReport,
  buildBapCompletenessAuditReport
} from '../utils/bapAndAssessmentAuditHelper';
import { buildObeQualityHeatmapReport } from '../utils/obeQualityHeatmapHelper';

interface AkreditasiViewProps {
  selectedProdi: ProgramStudiInfo;
  mahasiswaList?: Mahasiswa[];
  dosenList?: Dosen[];
  jadwalList?: JadwalKuliah[];
  logPresensiList?: LogPresensiDosen[];
  requestedSubTab?: string | null;
  onConsumeRequestedSubTab?: () => void;
  onShowToast?: (msg: string) => void;
}

const MATRIX_STORAGE_KEY = 'sikaprodi_v15_matriks_cpl_cpmk';
const COURSE_TARGETS_STORAGE_KEY = 'sikaprodi_v15_course_cpl_targets';
const RPS_PERF_TARGETS_STORAGE_KEY = 'sikaprodi_v15_rps_perf_targets';
const SMART_RPS_DOCS_STORAGE_KEY = 'sikaprodi_v15_smart_rps_docs';
const RPS_LATEST_UPLOADS_STORAGE_KEY = 'sikaprodi_v15_rps_latest_uploads';
const RPS_REMINDERS_STORAGE_KEY = 'sikaprodi_v15_rps_reminders';

const DEFAULT_COURSE_TARGETS: Record<string, Array<{
  cplKode: string;
  namaCpl: string;
  targetPersen: number;
  realisasiNilaiMhs: number;
}>> = {
  'SIPIL-MK1': [
    { cplKode: 'CPL-01', namaCpl: 'Sains & Matematika Rekayasa', targetPersen: 75, realisasiNilaiMhs: 82.4 },
    { cplKode: 'CPL-02', namaCpl: 'Analisis & Perancangan Struktur', targetPersen: 75, realisasiNilaiMhs: 78.5 },
    { cplKode: 'CPL-03', namaCpl: 'Eksperimen & Uji Laboratorium', targetPersen: 70, realisasiNilaiMhs: 74.2 },
    { cplKode: 'CPL-04', namaCpl: 'Penggunaan Software BIM & CAD', targetPersen: 80, realisasiNilaiMhs: 86.0 },
    { cplKode: 'CPL-05', namaCpl: 'Tanggung Jawab Profesional & Etika', targetPersen: 80, realisasiNilaiMhs: 88.5 },
  ],
  'SIPIL-MK2': [
    { cplKode: 'CPL-01', namaCpl: 'Sains & Matematika Rekayasa', targetPersen: 80, realisasiNilaiMhs: 84.0 },
    { cplKode: 'CPL-02', namaCpl: 'Analisis & Perancangan Struktur', targetPersen: 80, realisasiNilaiMhs: 81.2 },
    { cplKode: 'CPL-06', namaCpl: 'Komunikasi Teknis & Laporan', targetPersen: 75, realisasiNilaiMhs: 79.0 },
    { cplKode: 'CPL-07', namaCpl: 'K3 Konstruksi & Keberlanjutan', targetPersen: 85, realisasiNilaiMhs: 87.5 },
  ],
  'LINGKUNGAN-MK1': [
    { cplKode: 'CPL-01', namaCpl: 'Prinsip Rekayasa Lingkungan', targetPersen: 75, realisasiNilaiMhs: 83.2 },
    { cplKode: 'CPL-02', namaCpl: 'Desain IPAL Industri Kelapa Sawit', targetPersen: 80, realisasiNilaiMhs: 85.0 },
    { cplKode: 'CPL-03', namaCpl: 'Analisis Kualitas Air Sungai', targetPersen: 75, realisasiNilaiMhs: 79.5 },
    { cplKode: 'CPL-04', namaCpl: 'Kepatuhan Regulasi Baku Mutu', targetPersen: 80, realisasiNilaiMhs: 86.4 },
  ],
  'LISTRIK-MK1': [
    { cplKode: 'CPL-01', namaCpl: 'Teori Rangkaian & Mesin Listrik', targetPersen: 75, realisasiNilaiMhs: 84.8 },
    { cplKode: 'CPL-02', namaCpl: 'Pemrograman PLC & SCADA', targetPersen: 80, realisasiNilaiMhs: 88.2 },
    { cplKode: 'CPL-03', namaCpl: 'Pengujian Transformator & Motor', targetPersen: 75, realisasiNilaiMhs: 79.0 },
    { cplKode: 'CPL-05', namaCpl: 'K3 Ketenagalistrikan & PUIL', targetPersen: 85, realisasiNilaiMhs: 91.0 },
  ],
};

export const AkreditasiView: React.FC<AkreditasiViewProps> = ({
  selectedProdi,
  mahasiswaList = INITIAL_MAHASISWA,
  dosenList = INITIAL_DOSEN,
  jadwalList = INITIAL_JADWAL,
  logPresensiList = [],
  requestedSubTab,
  onConsumeRequestedSubTab,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'kriteria'
    | 'proyeksi_akreditasi'
    | 'rasio_dosen_angkatan'
    | 'cpl_obe'
    | 'audit_rps'
    | 'audit_kinerja_rps'
    | 'audit_kualitas_rps'
    | 'matriks_kualitas_rps'
    | 'ai_rps_evaluator'
    | 'audit_asesmen_obe'
    | 'audit_bap_mk'
    | 'smart_rps_audit'
    | 'audit_unggah_rps'
    | 'progres_rps_prodi'
    | 'audit_kelengkapan_cpl'
    | 'matriks_cpl_cpmk'
    | 'spider_cpl_angkatan'
    | 'target_matakuliah'
    | 'analisis_iabee'
    | 'dokumen_borang'
  >('spider_cpl_angkatan');

  React.useEffect(() => {
    if (!requestedSubTab) return;
    setActiveSubTab(requestedSubTab as typeof activeSubTab);
    onConsumeRequestedSubTab?.();
  }, [requestedSubTab, onConsumeRequestedSubTab]);

  const [cplCompletenessFilter, setCplCompletenessFilter] = useState<
    'ALL' | 'Incomplete' | 'Complete'
  >('Incomplete');
  const [cplCompletenessSearch, setCplCompletenessSearch] = useState<string>('');
  const [cplComponentFilter, setCplComponentFilter] = useState<string | null>(null);
  const [notifiedIncompleteCourses, setNotifiedIncompleteCourses] = useState<Record<string, boolean>>({});
  const [bapAuditFilter, setBapAuditFilter] = useState<
    'ALL' | 'Perlu Investigasi Audit' | 'Menunggu Verifikasi' | 'Konsisten & Lengkap'
  >('ALL');
  const [assessmentAuditFilter, setAssessmentAuditFilter] = useState<
    'ALL' | 'NEEDS_REBALANCE' | 'OPTIMAL'
  >('ALL');
  const [assessmentSearch, setAssessmentSearch] = useState<string>('');
  const rasioDosenQuickSummary = React.useMemo(
    () =>
      buildRasioDosenProyeksiReport({
        prodi: selectedProdi,
        mahasiswaList,
        dosenList
      }),
    [selectedProdi, mahasiswaList, dosenList]
  );
  const [selectedKriteriaId, setSelectedKriteriaId] = useState<string>('K6');
  const [auditStatusFilter, setAuditStatusFilter] = useState<
    'FLAGGED' | 'KRITIS_BAWAH_70' | 'PENGUATAN_BUTIR_70' | 'MEMENUHI_STANDAR' | 'ALL'
  >('FLAGGED');
  const [selectedAuditCourse, setSelectedAuditCourse] = useState<CourseCplAuditResult | null>(null);
  const [qualityStatusFilter, setQualityStatusFilter] = useState<
    'ALL' | 'NEEDS_REVISION' | QualityStatus
  >('ALL');
  const [qualitySearchQuery, setQualitySearchQuery] = useState<string>('');
  const [qualitySemFilter, setQualitySemFilter] = useState<string>('ALL');
  const [selectedQualityCourse, setSelectedQualityCourse] = useState<CourseRpsQualityResult | null>(null);
  const [smartRpsStatusFilter, setSmartRpsStatusFilter] = useState<
    'ALL' | 'ISSUE_ONLY' | SmartRpsValidationStatus
  >('ALL');
  const [smartRpsSearchQuery, setSmartRpsSearchQuery] = useState<string>('');
  const [smartRpsSemFilter, setSmartRpsSemFilter] = useState<string>('ALL');
  const [selectedSmartRpsCourseId, setSelectedSmartRpsCourseId] = useState<string | null>(null);
  const [smartRpsDocDraftText, setSmartRpsDocDraftText] = useState<string>('');
  const [isScanningSmartRps, setIsScanningSmartRps] = useState<boolean>(false);
  const [lastSmartScanTime, setLastSmartScanTime] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
  const [smartRpsDocOverrides, setSmartRpsDocOverrides] = useState<
    Record<string, SmartRpsDocumentOverride>
  >(() => {
    try {
      const saved = localStorage.getItem(SMART_RPS_DOCS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });
  const [uploadedRpsFilesMap, setUploadedRpsFilesMap] = useState<
    Record<string, UploadedRpsFileRecord>
  >(() => {
    try {
      const saved = localStorage.getItem(RPS_LATEST_UPLOADS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });
  const [rpsRemindersMap, setRpsRemindersMap] = useState<
    Record<string, RpsReminderDispatchRecord>
  >(() => {
    try {
      const saved = localStorage.getItem(RPS_REMINDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });
  const [uploadAuditStatusFilter, setUploadAuditStatusFilter] = useState<
    'MISSING_LATEST' | 'BELUM_UNGGAH' | 'PERLU_PEMBARUAN_VERSI' | 'SUDAH_UNGGAH_TERBARU' | 'ALL'
  >('MISSING_LATEST');
  const [uploadAuditSemFilter, setUploadAuditSemFilter] = useState<string>('ALL');
  const [uploadAuditSearchQuery, setUploadAuditSearchQuery] = useState<string>('');
  const [isScanningUploadAudit, setIsScanningUploadAudit] = useState<boolean>(false);
  const [lastUploadScanTime, setLastUploadScanTime] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
  const [selectedReminderCourseId, setSelectedReminderCourseId] = useState<string | null>(null);
  const [reminderDraftSubject, setReminderDraftSubject] = useState<string>('');
  const [reminderDraftBody, setReminderDraftBody] = useState<string>('');
  const [perfRadarMode, setPerfRadarMode] = useState<'prodi_cpl' | 'per_mk'>('prodi_cpl');
  const [selectedPerfCourseId, setSelectedPerfCourseId] = useState<string>('');
  const [perfStatusFilter, setPerfStatusFilter] = useState<
    'ALL' | 'NEEDS_ADJUSTMENT' | 'PRIORITAS_REVISI' | 'SELARAS' | 'GAP_ONLY'
  >('ALL');
  const [perfSortMode, setPerfSortMode] = useState<'SCORE_ASC' | 'SCORE_DESC' | 'GAP_ASC'>('SCORE_ASC');
  const [perfSearchQuery, setPerfSearchQuery] = useState<string>('');
  const [expandedCrossScanCourseId, setExpandedCrossScanCourseId] = useState<string | null>(null);
  const [isRunningCrossScan, setIsRunningCrossScan] = useState<boolean>(false);
  const [lastCrossScanTime, setLastCrossScanTime] = useState<string>(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
  const [rpsTargetOverridesByProdi, setRpsTargetOverridesByProdi] = useState<
    Record<string, Record<string, number>>
  >(() => {
    try {
      const saved = localStorage.getItem(RPS_PERF_TARGETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });
  const [projectionScenario, setProjectionScenario] = useState<ProjectionScenarioAdjustments>({
    deltaCplPersen: 0,
    deltaKtwPersen: 0,
    deltaAuditRpsPersen: 0
  });
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isMatrixPdfModalOpen, setIsMatrixPdfModalOpen] = useState(false);
  const [matrixSemesterFilter, setMatrixSemesterFilter] = useState<string>('ALL');
  const [matrixKelompokFilter, setMatrixKelompokFilter] = useState<'ALL' | 'Wajib' | 'Pilihan'>('ALL');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState<string>('');
  const [pdfOrientation, setPdfOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [matrixRefreshTick, setMatrixRefreshTick] = useState(0);
  const matrixPdfAreaRef = React.useRef<HTMLDivElement>(null);
  const perfRadarRef = React.useRef<HTMLDivElement>(null);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const [courseTargets, setCourseTargets] = useState<typeof DEFAULT_COURSE_TARGETS>(() => {
    try {
      const saved = localStorage.getItem(COURSE_TARGETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_COURSE_TARGETS, ...parsed };
      }
    } catch {}
    return DEFAULT_COURSE_TARGETS;
  });

  const [selectedCourseKey, setSelectedCourseKey] = useState<string>(
    selectedProdi.id === 'SIPIL' ? 'SIPIL-MK1' : selectedProdi.id === 'LINGKUNGAN' ? 'LINGKUNGAN-MK1' : 'LISTRIK-MK1'
  );

  React.useEffect(() => {
    setSelectedCourseKey(
      selectedProdi.id === 'SIPIL' ? 'SIPIL-MK1' : selectedProdi.id === 'LINGKUNGAN' ? 'LINGKUNGAN-MK1' : 'LISTRIK-MK1'
    );
    setSelectedPerfCourseId('');
    setPerfSearchQuery('');
    setExpandedCrossScanCourseId(null);
    setSelectedQualityCourse(null);
    setQualitySearchQuery('');
    setSelectedSmartRpsCourseId(null);
    setSmartRpsSearchQuery('');
    setSelectedReminderCourseId(null);
    setUploadAuditSearchQuery('');
    setCplComponentFilter(null);
    setProjectionScenario({ deltaCplPersen: 0, deltaKtwPersen: 0, deltaAuditRpsPersen: 0 });
  }, [selectedProdi.id]);

  const activeCplList = courseTargets[selectedCourseKey] || courseTargets['SIPIL-MK1'];

  const handleUpdateTargetPersen = (cplKode: string, newTarget: number) => {
    setCourseTargets(prev => ({
      ...prev,
      [selectedCourseKey]: (prev[selectedCourseKey] || []).map(c =>
        c.cplKode === cplKode ? { ...c, targetPersen: newTarget } : c
      )
    }));
  };

  const handleSaveCourseTarget = () => {
    try {
      localStorage.setItem(COURSE_TARGETS_STORAGE_KEY, JSON.stringify(courseTargets));
    } catch {}
    const msg = 'Target capaian CPL mata kuliah berhasil disimpan ke kurikulum OBE program studi.';
    setSavedNotification(msg);
    if (onShowToast) onShowToast(msg);
    setTimeout(() => setSavedNotification(null), 3500);
  };

  const handleResetCourseTargets = () => {
    setCourseTargets(DEFAULT_COURSE_TARGETS);
    try {
      localStorage.removeItem(COURSE_TARGETS_STORAGE_KEY);
    } catch {}
    const msg = 'Target capaian CPL mata kuliah dikembalikan ke standar kurikulum OBE awal.';
    setSavedNotification(msg);
    if (onShowToast) onShowToast(msg);
    setTimeout(() => setSavedNotification(null), 3500);
  };

  // Retrieve borang data for current prodi, fallback to SIPIL
  const borang: BorangAkreditasiProdi = MOCK_BORANG_AKREDITASI[selectedProdi.id] || MOCK_BORANG_AKREDITASI.SIPIL;

  const totalDokTersedia = borang.kriteriaList.reduce((acc, k) => acc + k.dokumenTersedia, 0);
  const totalDokDibutuhkan = borang.kriteriaList.reduce((acc, k) => acc + k.dokumenDibutuhkan, 0);
  const persenDokumen = totalDokDibutuhkan > 0 ? Math.round((totalDokTersedia / totalDokDibutuhkan) * 100) : 0;

  const selectedKriteria = borang.kriteriaList.find(k => k.id === selectedKriteriaId) || borang.kriteriaList[0];

  const loadAllMatrixCourses = React.useCallback((): MataKuliahCplMatrixRecord[] => {
    const matrixSaved = localStorage.getItem(MATRIX_STORAGE_KEY);
    let matrixList = INITIAL_CPL_CPMK_MATRIX_DATA;
    if (matrixSaved) {
      try {
        const parsed = JSON.parse(matrixSaved);
        if (Array.isArray(parsed) && parsed.length > 0) matrixList = parsed;
      } catch {}
    }
    return matrixList;
  }, []);

  const allMatrixCourses = React.useMemo(
    () => loadAllMatrixCourses(),
    [loadAllMatrixCourses, activeSubTab, isMatrixPdfModalOpen, matrixRefreshTick]
  );

  const prodiMatrixCourses = React.useMemo(
    () => allMatrixCourses.filter(m => m.prodiId === selectedProdi.id),
    [allMatrixCourses, selectedProdi.id]
  );

  const facultyRpsProgressQuick = React.useMemo(
    () =>
      scanCoursesRpsUploadCompliance({
        courses: allMatrixCourses,
        uploadedFilesMap: uploadedRpsFilesMap,
        smartRpsOverridesMap: smartRpsDocOverrides,
        remindersMap: rpsRemindersMap
      }),
    [allMatrixCourses, uploadedRpsFilesMap, smartRpsDocOverrides, rpsRemindersMap]
  );

  const activeCplsObe = React.useMemo(
    () => CPL_DEFINITIONS_PRODI[selectedProdi.id] || CPL_DEFINITIONS_PRODI.SIPIL,
    [selectedProdi.id]
  );

  const gapAnalysisRows = React.useMemo(
    () => computeCplGapAnalysis(activeCplsObe, borang.cplList, prodiMatrixCourses),
    [activeCplsObe, borang.cplList, prodiMatrixCourses]
  );

  const cplCompletenessReport = React.useMemo(
    () =>
      buildCplCompletenessAuditReport({
        courses: prodiMatrixCourses,
        prodiCpls: activeCplsObe
      }),
    [prodiMatrixCourses, activeCplsObe]
  );

  const bapAuditReport = React.useMemo(
    () =>
      buildBapCompletenessAuditReport({
        jadwalList: jadwalList.filter(j => j.prodiId === selectedProdi.id),
        logPresensiList: logPresensiList.filter(l => l.prodiId === selectedProdi.id)
      }),
    [jadwalList, logPresensiList, selectedProdi.id]
  );

  const assessmentAuditReport = React.useMemo(
    () =>
      buildAssessmentQualityAuditReport({
        courses: prodiMatrixCourses,
        prodiCpls: activeCplsObe
      }),
    [prodiMatrixCourses, activeCplsObe]
  );

  const obeHeatmapSummary = React.useMemo(
    () =>
      buildObeQualityHeatmapReport({
        courses: prodiMatrixCourses,
        prodiCpls: activeCplsObe
      }),
    [prodiMatrixCourses, activeCplsObe]
  );

  const filteredBapAuditItems = React.useMemo(() => {
    return bapAuditReport.items.filter(item =>
      bapAuditFilter === 'ALL' ? true : item.statusAudit === bapAuditFilter
    );
  }, [bapAuditReport.items, bapAuditFilter]);

  const filteredAssessmentItems = React.useMemo(() => {
    const q = assessmentSearch.trim().toLowerCase();
    return assessmentAuditReport.items.filter(item => {
      const matchStatus =
        assessmentAuditFilter === 'ALL'
          ? true
          : assessmentAuditFilter === 'NEEDS_REBALANCE'
          ? item.status !== 'Layak OBE (Optimal)'
          : item.status === 'Layak OBE (Optimal)';
      const matchSearch =
        !q ||
        item.course.kodeMK.toLowerCase().includes(q) ||
        item.course.namaMK.toLowerCase().includes(q) ||
        item.course.dosenPengampu.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [assessmentAuditReport.items, assessmentAuditFilter, assessmentSearch]);

  const filteredCompletenessItems = React.useMemo(() => {
    const q = cplCompletenessSearch.trim().toLowerCase();
    return cplCompletenessReport.items.filter(item => {
      const matchStatus =
        cplCompletenessFilter === 'ALL' ? true : item.status === cplCompletenessFilter;
      const matchCplComponent =
        !cplComponentFilter ||
        item.missingCplToCpmk.includes(cplComponentFilter) ||
        item.explicitCplInCpmk.includes(cplComponentFilter) ||
        item.mappedCplInMatrix.includes(cplComponentFilter);
      const matchSearch =
        !q ||
        item.course.kodeMK.toLowerCase().includes(q) ||
        item.course.namaMK.toLowerCase().includes(q) ||
        item.course.dosenPengampu.toLowerCase().includes(q);
      return matchStatus && matchCplComponent && matchSearch;
    });
  }, [cplCompletenessReport.items, cplCompletenessFilter, cplComponentFilter, cplCompletenessSearch]);

  const handleAutoCompleteCplMapping = (item: CourseCplCompletenessItem) => {
    const targetCpls =
      item.missingCplToCpmk.length > 0
        ? item.missingCplToCpmk
        : activeCplsObe.slice(0, 2).map(c => c.kode);

    const updatedMatrix = allMatrixCourses.map(mk => {
      if (mk.id !== item.course.id) return mk;
      const nextPemetaan = { ...(mk.pemetaanCpl || {}) };
      targetCpls.forEach(code => {
        if (!nextPemetaan[code]) nextPemetaan[code] = 'Medium';
      });

      const baseCpmks =
        mk.cpmkList && mk.cpmkList.length > 0
          ? mk.cpmkList.map(c => ({ ...c, cplTerkait: [...(c.cplTerkait || [])] }))
          : [
              {
                kode: 'CPMK-1',
                deskripsi: `Mampu menerapkan konsep inti dan analisis rekayasa pada mata kuliah ${mk.namaMK} (C3).`,
                levelBloom: 'C3 - Penerapan',
                cplTerkait: [...targetCpls],
                metodeAsesmen: 'Tugas & UTS',
                bobotPersen: 50
              },
              {
                kode: 'CPMK-2',
                deskripsi: `Mampu mengevaluasi dan menyusun rancangan solusi berbasis ${mk.namaMK} secara terukur (C4).`,
                levelBloom: 'C4 - Analisis',
                cplTerkait: [...targetCpls],
                metodeAsesmen: 'Case Method / UAS',
                bobotPersen: 50
              }
            ];

      if (mk.cpmkList && mk.cpmkList.length > 0) {
        targetCpls.forEach((code, idx) => {
          const slot = baseCpmks[idx % baseCpmks.length];
          if (!slot.cplTerkait.includes(code)) {
            slot.cplTerkait.push(code);
          }
        });
      }

      return {
        ...mk,
        pemetaanCpl: nextPemetaan,
        cpmkList: baseCpmks
      };
    });

    try {
      localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(updatedMatrix));
    } catch {}
    setMatrixRefreshTick(t => t + 1);
    if (onShowToast) {
      onShowToast(
        `Pemetaan CPL → CPMK untuk ${item.course.kodeMK} (${item.course.namaMK}) dilengkapi otomatis. Status diperbarui menjadi Complete.`
      );
    }
  };

  const gapSummary = React.useMemo(() => {
    if (gapAnalysisRows.length === 0) {
      return { avgCurrent: 0, avgTarget: 0, avgGap: 0, meetingCount: 0 };
    }
    const avgCurrent = gapAnalysisRows.reduce((s, r) => s + r.capaianSaatIni, 0) / gapAnalysisRows.length;
    const avgTarget = gapAnalysisRows.reduce((s, r) => s + r.targetKurikulum, 0) / gapAnalysisRows.length;
    const avgGap = gapAnalysisRows.reduce((s, r) => s + r.gap, 0) / gapAnalysisRows.length;
    const meetingCount = gapAnalysisRows.filter(r => r.gap >= 0).length;
    return { avgCurrent, avgTarget, avgGap, meetingCount };
  }, [gapAnalysisRows]);

  // Audit Otomatis Kontribusi CPL < 70% per Mata Kuliah & Saran Perbaikan RPS
  const courseAuditResults = React.useMemo(
    () => auditCoursesCplContribution(prodiMatrixCourses, activeCplsObe),
    [prodiMatrixCourses, activeCplsObe]
  );

  const courseAuditById = React.useMemo(() => {
    const map = new Map<string, CourseCplAuditResult>();
    courseAuditResults.forEach(item => map.set(item.course.id, item));
    return map;
  }, [courseAuditResults]);

  const auditSummary = React.useMemo(() => {
    const criticalCount = courseAuditResults.filter(
      r => r.auditStatus === 'KRITIS_BAWAH_70'
    ).length;
    const strengthenCount = courseAuditResults.filter(
      r => r.auditStatus === 'PENGUATAN_BUTIR_70'
    ).length;
    const passingCount = courseAuditResults.filter(
      r => r.auditStatus === 'MEMENUHI_STANDAR'
    ).length;
    return {
      totalCourses: courseAuditResults.length,
      criticalCount,
      strengthenCount,
      passingCount,
      totalFlagged: criticalCount + strengthenCount
    };
  }, [courseAuditResults]);

  const activeRpsTargetOverrides = React.useMemo(
    () => rpsTargetOverridesByProdi[selectedProdi.id] || {},
    [rpsTargetOverridesByProdi, selectedProdi.id]
  );

  const perfCrossScanTableRef = React.useRef<HTMLDivElement>(null);

  const rpsPerfReport = React.useMemo(
    () =>
      buildRpsPerformanceAuditReport({
        prodiId: selectedProdi.id,
        cplsObe: activeCplsObe,
        borangCplList: borang.cplList,
        courses: prodiMatrixCourses,
        courseAuditResults,
        courseTargets,
        rpsTargetOverrides: activeRpsTargetOverrides,
        smartRpsDocOverrides
      }),
    [
      selectedProdi.id,
      activeCplsObe,
      borang.cplList,
      prodiMatrixCourses,
      courseAuditResults,
      courseTargets,
      activeRpsTargetOverrides,
      smartRpsDocOverrides
    ]
  );

  const selectedPerfCourse = React.useMemo(() => {
    if (rpsPerfReport.courseItems.length === 0) return null;
    if (selectedPerfCourseId) {
      const match = rpsPerfReport.courseItems.find(
        item => item.course.id === selectedPerfCourseId
      );
      if (match) return match;
    }
    return (
      [...rpsPerfReport.courseItems].sort((a, b) => a.gapPersen - b.gapPersen)[0] ||
      rpsPerfReport.courseItems[0]
    );
  }, [rpsPerfReport.courseItems, selectedPerfCourseId]);

  const filteredPerfCourses = React.useMemo(() => {
    const q = perfSearchQuery.trim().toLowerCase();
    return rpsPerfReport.courseItems
      .filter(item => {
        const matchStatus =
          perfStatusFilter === 'ALL'
            ? true
            : perfStatusFilter === 'NEEDS_ADJUSTMENT'
            ? item.butuhPenyesuaian
            : perfStatusFilter === 'PRIORITAS_REVISI'
            ? item.statusPenyesuaian === 'PRIORITAS_REVISI'
            : perfStatusFilter === 'SELARAS'
            ? item.statusPenyesuaian === 'SELARAS'
            : item.gapPersen < 0;
        const matchSearch =
          !q ||
          item.course.kodeMK.toLowerCase().includes(q) ||
          item.course.namaMK.toLowerCase().includes(q) ||
          item.course.dosenPengampu.toLowerCase().includes(q) ||
          item.detectedInstrumentLabels.some(lbl => lbl.toLowerCase().includes(q)) ||
          item.mismatchedCplCodes.some(code => code.toLowerCase().includes(q));
        return matchStatus && matchSearch;
      })
      .sort((a, b) => {
        if (perfSortMode === 'SCORE_DESC') {
          return b.keselarasanSkor - a.keselarasanSkor || a.gapPersen - b.gapPersen;
        }
        if (perfSortMode === 'GAP_ASC') {
          return a.gapPersen - b.gapPersen || a.keselarasanSkor - b.keselarasanSkor;
        }
        return a.keselarasanSkor - b.keselarasanSkor || a.gapPersen - b.gapPersen;
      });
  }, [rpsPerfReport.courseItems, perfStatusFilter, perfSearchQuery, perfSortMode]);

  const handleRunCrossScan = () => {
    setIsRunningCrossScan(true);
    window.setTimeout(() => {
      setIsRunningCrossScan(false);
      const nowStr = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setLastCrossScanTime(nowStr);
      if (rpsPerfReport.needsAdjustmentCourseCount > 0) {
        setPerfStatusFilter('NEEDS_ADJUSTMENT');
      }
      perfCrossScanTableRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      if (onShowToast) {
        onShowToast(
          `Pemindaian silang Target CPL Prodi × Asesmen RPS selesai (${rpsPerfReport.courseItems.length} MK, rata-rata skor ${rpsPerfReport.avgKeselarasanSkor}/100 · ${rpsPerfReport.needsAdjustmentCourseCount} MK perlu penyesuaian).`
        );
      }
    }, 280);
  };

  const handleUpdateRpsTargetOverride = (cplKode: string, newTarget: number) => {
    setRpsTargetOverridesByProdi(prev => {
      const updated = {
        ...prev,
        [selectedProdi.id]: {
          ...(prev[selectedProdi.id] || {}),
          [cplKode]: newTarget
        }
      };
      try {
        localStorage.setItem(RPS_PERF_TARGETS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleResetRpsTargetOverrides = () => {
    setRpsTargetOverridesByProdi(prev => {
      const next = { ...prev };
      delete next[selectedProdi.id];
      try {
        localStorage.setItem(RPS_PERF_TARGETS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (onShowToast) {
      onShowToast(`Target RPS ${selectedProdi.singkatan} dikembalikan ke standar kurikulum OBE awal.`);
    }
  };

  // Audit Kualitas RPS berbasis Constructive Alignment OBE
  const rpsQualitySummary = React.useMemo(
    () => auditCoursesRpsQuality(prodiMatrixCourses, activeCplsObe),
    [prodiMatrixCourses, activeCplsObe]
  );

  const filteredQualityCourses = React.useMemo(() => {
    const q = qualitySearchQuery.trim().toLowerCase();
    return rpsQualitySummary.items
      .filter(item => {
        const matchStatus =
          qualityStatusFilter === 'ALL'
            ? true
            : qualityStatusFilter === 'NEEDS_REVISION'
            ? item.totalScore < 75
            : item.status === qualityStatusFilter;
        const matchSem =
          qualitySemFilter === 'ALL'
            ? true
            : String(item.course.semester) === qualitySemFilter;
        const matchSearch =
          !q ||
          item.course.kodeMK.toLowerCase().includes(q) ||
          item.course.namaMK.toLowerCase().includes(q) ||
          item.course.dosenPengampu.toLowerCase().includes(q);
        return matchStatus && matchSem && matchSearch;
      })
      .sort((a, b) => a.totalScore - b.totalScore);
  }, [rpsQualitySummary.items, qualityStatusFilter, qualitySemFilter, qualitySearchQuery]);

  const handleCopyQualityRecommendations = async (item: CourseRpsQualityResult) => {
    const text = [
      `AUDIT KUALITAS RPS BERBASIS OBE — ${selectedProdi.nama}`,
      `Mata Kuliah: ${item.course.kodeMK} - ${item.course.namaMK} (${item.course.sks} SKS)`,
      `Dosen Pengampu: ${item.course.dosenPengampu}`,
      `Skor Kualitas RPS: ${item.totalScore}/100 (Grade ${item.grade} - ${item.statusLabel})`,
      `Metode Terdeteksi: ${item.detectedMethods.join(', ')}`,
      '',
      'Rekomendasi Perbaikan Spesifik OBE:',
      ...item.recommendations.map(
        (r, i) => `${i + 1}. [${r.aspek} | Prioritas ${r.prioritas}] ${r.tindakanRps}`
      )
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      if (onShowToast) {
        onShowToast(
          `Rekomendasi Audit Kualitas RPS ${item.course.kodeMK} berhasil disalin ke clipboard.`
        );
      }
    } catch {
      if (onShowToast) {
        onShowToast(
          `Rekomendasi OBE untuk ${item.course.kodeMK} siap ditinjau pada panel detail.`
        );
      }
    }
  };

  // Smart RPS Audit: Pemindai Dokumen RPS & Validasi Minimal 3 Jenis Asesmen OBE Pendukung CPL
  const smartRpsSummary = React.useMemo(
    () => runSmartRpsAudit(prodiMatrixCourses, activeCplsObe, smartRpsDocOverrides),
    [prodiMatrixCourses, activeCplsObe, smartRpsDocOverrides]
  );

  const selectedSmartRpsCourse = React.useMemo(() => {
    if (!selectedSmartRpsCourseId) return null;
    return smartRpsSummary.items.find(i => i.course.id === selectedSmartRpsCourseId) || null;
  }, [smartRpsSummary.items, selectedSmartRpsCourseId]);

  const filteredSmartRpsCourses = React.useMemo(() => {
    const q = smartRpsSearchQuery.trim().toLowerCase();
    const rank = (st: SmartRpsValidationStatus) =>
      st === 'TIDAK_MEMENUHI' ? 0 : st === 'PERLU_PENGUATAN_CPL' ? 1 : 2;

    return smartRpsSummary.items
      .filter(item => {
        const matchStatus =
          smartRpsStatusFilter === 'ALL'
            ? true
            : smartRpsStatusFilter === 'ISSUE_ONLY'
            ? item.validationStatus !== 'MEMENUHI_MIN_3_OBE'
            : item.validationStatus === smartRpsStatusFilter;
        const matchSem =
          smartRpsSemFilter === 'ALL'
            ? true
            : String(item.course.semester) === smartRpsSemFilter;
        const matchSearch =
          !q ||
          item.course.kodeMK.toLowerCase().includes(q) ||
          item.course.namaMK.toLowerCase().includes(q) ||
          item.course.dosenPengampu.toLowerCase().includes(q) ||
          item.documentCode.toLowerCase().includes(q);
        return matchStatus && matchSem && matchSearch;
      })
      .sort((a, b) => {
        const rDiff = rank(a.validationStatus) - rank(b.validationStatus);
        if (rDiff !== 0) return rDiff;
        return a.cplSupportingCount - b.cplSupportingCount;
      });
  }, [smartRpsSummary.items, smartRpsStatusFilter, smartRpsSemFilter, smartRpsSearchQuery]);

  const persistSmartRpsOverrides = (next: Record<string, SmartRpsDocumentOverride>) => {
    setSmartRpsDocOverrides(next);
    try {
      localStorage.setItem(SMART_RPS_DOCS_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleOpenSmartRpsScanner = (courseId: string) => {
    const found = smartRpsSummary.items.find(i => i.course.id === courseId);
    setSelectedSmartRpsCourseId(courseId);
    setSmartRpsDocDraftText(found?.scannedRawText || '');
  };

  const handleRunMassSmartRpsScan = () => {
    setIsScanningSmartRps(true);
    setTimeout(() => {
      setIsScanningSmartRps(false);
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastSmartScanTime(nowStr);
      if (onShowToast) {
        onShowToast(
          `Smart RPS Audit selesai memindai ${smartRpsSummary.totalCourses} dokumen RPS (${smartRpsSummary.compliantCount} memenuhi ≥3 asesmen OBE, ${smartRpsSummary.nonCompliantCount + smartRpsSummary.needsStrengtheningCount} perlu penguatan/revisi).`
        );
      }
    }, 420);
  };

  const handleToggleQuickAssessmentInRps = (courseId: string, catId: AssessmentCategoryId) => {
    const prevOverride = smartRpsDocOverrides[courseId];
    const currentAdded = prevOverride?.addedAssessmentIds || [];
    const exists = currentAdded.includes(catId);
    const nextAdded = exists ? currentAdded.filter(id => id !== catId) : [...currentAdded, catId];
    const nextOverrides: Record<string, SmartRpsDocumentOverride> = {
      ...smartRpsDocOverrides,
      [courseId]: {
        fileName: prevOverride?.fileName,
        customRpsText: prevOverride?.customRpsText || '',
        addedAssessmentIds: nextAdded,
        updatedAt: new Date().toISOString()
      }
    };
    persistSmartRpsOverrides(nextOverrides);
    const label = OBE_ASSESSMENT_CATEGORIES.find(c => c.id === catId)?.shortLabel || catId;
    if (onShowToast) {
      onShowToast(
        exists
          ? `Instrumen asesmen ${label} dihapus dari simulasi RPS.`
          : `Instrumen asesmen ${label} ditambahkan & divalidasi ulang pada RPS.`
      );
    }
  };

  const handleSaveCustomRpsText = (courseId: string, rawText: string, fileName?: string) => {
    const prevOverride = smartRpsDocOverrides[courseId];
    const nextOverrides: Record<string, SmartRpsDocumentOverride> = {
      ...smartRpsDocOverrides,
      [courseId]: {
        fileName: fileName ?? prevOverride?.fileName,
        customRpsText: rawText,
        addedAssessmentIds: prevOverride?.addedAssessmentIds || [],
        updatedAt: new Date().toISOString()
      }
    };
    persistSmartRpsOverrides(nextOverrides);
    setSmartRpsDocDraftText(rawText);
    if (onShowToast) {
      onShowToast('Dokumen RPS berhasil dipindai ulang dan divalidasi terhadap standar minimal 3 asesmen OBE.');
    }
  };

  const handleUploadRpsDocumentFile = async (courseId: string, file: File) => {
    try {
      let extractedText = '';
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const buf = await file.arrayBuffer();
        const decoded = new TextDecoder('latin1').decode(buf);
        const readableChunks = decoded.match(/[A-Za-z0-9\s.,:;()/%&-]{5,}/g) || [];
        const joined = readableChunks
          .filter(chunk => /[a-zA-Z]{3,}/.test(chunk))
          .slice(0, 140)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        extractedText =
          joined.length >= 40
            ? `[Hasil Ekstraksi PDF: ${file.name}]\n${joined}`
            : `[Dokumen PDF Terunggah: ${file.name} (${Math.round(file.size / 1024)} KB)]\nSilakan verifikasi/lengkapi klausul metode penilaian RPS (mis. Kuis, Tugas Terstruktur, UTS, Studi Kasus, Proyek/Tugas Besar, Praktikum, UAS).`;
      } else {
        extractedText = await file.text();
      }
      handleSaveCustomRpsText(courseId, extractedText, file.name);
    } catch {
      if (onShowToast) {
        onShowToast('Gagal membaca berkas RPS. Gunakan format .txt, .md, .csv, atau .pdf.');
      }
    }
  };

  const handleResetCourseRpsOverride = (courseId: string) => {
    const next = { ...smartRpsDocOverrides };
    delete next[courseId];
    persistSmartRpsOverrides(next);
    const originalCourse = prodiMatrixCourses.find(c => c.id === courseId);
    if (originalCourse) {
      const freshReport = runSmartRpsAudit([originalCourse], activeCplsObe, {});
      setSmartRpsDocDraftText(freshReport.items[0]?.scannedRawText || '');
    }
    if (onShowToast) {
      onShowToast('Dokumen RPS mata kuliah dikembalikan ke data repositori kurikulum awal.');
    }
  };

  // Audit Unggah File RPS Terbaru & Pengingat Dosen Pengampu
  const rpsUploadAuditSummary = React.useMemo(
    () =>
      scanCoursesRpsUploadCompliance({
        courses: prodiMatrixCourses,
        uploadedFilesMap: uploadedRpsFilesMap,
        smartRpsOverridesMap: smartRpsDocOverrides,
        remindersMap: rpsRemindersMap
      }),
    [prodiMatrixCourses, uploadedRpsFilesMap, smartRpsDocOverrides, rpsRemindersMap]
  );

  const selectedReminderCourse = React.useMemo(() => {
    if (!selectedReminderCourseId) return null;
    return rpsUploadAuditSummary.items.find(i => i.course.id === selectedReminderCourseId) || null;
  }, [rpsUploadAuditSummary.items, selectedReminderCourseId]);

  const filteredUploadAuditCourses = React.useMemo(() => {
    const q = uploadAuditSearchQuery.trim().toLowerCase();
    const statusOrder = (st: RpsCourseUploadAuditItem['status']) =>
      st === 'BELUM_UNGGAH' ? 0 : st === 'PERLU_PEMBARUAN_VERSI' ? 1 : 2;

    return rpsUploadAuditSummary.items
      .filter(item => {
        const matchStatus =
          uploadAuditStatusFilter === 'ALL'
            ? true
            : uploadAuditStatusFilter === 'MISSING_LATEST'
            ? item.isMissingLatest
            : item.status === uploadAuditStatusFilter;
        const matchSem =
          uploadAuditSemFilter === 'ALL'
            ? true
            : String(item.course.semester) === uploadAuditSemFilter;
        const matchSearch =
          !q ||
          item.course.kodeMK.toLowerCase().includes(q) ||
          item.course.namaMK.toLowerCase().includes(q) ||
          item.dosenNama.toLowerCase().includes(q) ||
          item.dosenEmail.toLowerCase().includes(q);
        return matchStatus && matchSem && matchSearch;
      })
      .sort((a, b) => {
        const diff = statusOrder(a.status) - statusOrder(b.status);
        if (diff !== 0) return diff;
        return a.course.semester - b.course.semester;
      });
  }, [
    rpsUploadAuditSummary.items,
    uploadAuditStatusFilter,
    uploadAuditSemFilter,
    uploadAuditSearchQuery
  ]);

  const persistUploadedRpsFiles = (next: Record<string, UploadedRpsFileRecord>) => {
    setUploadedRpsFilesMap(next);
    try {
      localStorage.setItem(RPS_LATEST_UPLOADS_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const persistRpsReminders = (next: Record<string, RpsReminderDispatchRecord>) => {
    setRpsRemindersMap(next);
    try {
      localStorage.setItem(RPS_REMINDERS_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleRunUploadComplianceScan = () => {
    setIsScanningUploadAudit(true);
    setTimeout(() => {
      setIsScanningUploadAudit(false);
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastUploadScanTime(nowStr);
      if (onShowToast) {
        onShowToast(
          `Audit Dokumen RPS selesai memindai ${rpsUploadAuditSummary.totalCourses} MK: ${rpsUploadAuditSummary.missingLatestCount} MK belum mengunggah file RPS terbaru (${CURRENT_RPS_ACADEMIC_TERM}).`
        );
      }
    }, 420);
  };

  const handleSendQuickCourseReminder = (
    item: RpsCourseUploadAuditItem,
    channel: RpsReminderDispatchRecord['channel'] = 'Sistem & Email Prodi',
    customPreview?: string
  ) => {
    const sentAt = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    const record: RpsReminderDispatchRecord = {
      courseId: item.course.id,
      kodeMK: item.course.kodeMK,
      namaMK: item.course.namaMK,
      dosenNama: item.dosenNama,
      dosenEmail: item.dosenEmail,
      channel,
      sentAt,
      messagePreview: customPreview || buildRpsReminderMessage(item)
    };
    const next = {
      ...rpsRemindersMap,
      [item.course.id]: record
    };
    persistRpsReminders(next);
    if (onShowToast) {
      onShowToast(
        `Pengingat unggah RPS ${item.course.kodeMK} (${item.course.namaMK}) terkirim ke ${item.dosenNama} (${item.dosenEmail}).`
      );
    }
  };

  const handleSendLecturerBatchReminder = (group: LecturerPendingRpsGroup) => {
    const sentAt = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    const next = { ...rpsRemindersMap };
    group.pendingCourses.forEach(item => {
      next[item.course.id] = {
        courseId: item.course.id,
        kodeMK: item.course.kodeMK,
        namaMK: item.course.namaMK,
        dosenNama: item.dosenNama,
        dosenEmail: item.dosenEmail,
        channel: 'Sistem & Email Prodi',
        sentAt,
        messagePreview: buildRpsReminderMessage(item)
      };
    });
    persistRpsReminders(next);
    if (onShowToast) {
      onShowToast(
        `Pengingat kolektif untuk ${group.pendingCourses.length} mata kuliah terkirim kepada ${group.dosenNama}.`
      );
    }
  };

  const handleSendAllPendingReminders = () => {
    const pendingItems = rpsUploadAuditSummary.items.filter(i => i.isMissingLatest);
    if (pendingItems.length === 0) {
      if (onShowToast) {
        onShowToast('Seluruh mata kuliah pada program studi ini sudah mengunggah file RPS terbaru.');
      }
      return;
    }
    const sentAt = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    const next = { ...rpsRemindersMap };
    pendingItems.forEach(item => {
      next[item.course.id] = {
        courseId: item.course.id,
        kodeMK: item.course.kodeMK,
        namaMK: item.course.namaMK,
        dosenNama: item.dosenNama,
        dosenEmail: item.dosenEmail,
        channel: 'Pengingat Massal Prodi',
        sentAt,
        messagePreview: buildRpsReminderMessage(item)
      };
    });
    persistRpsReminders(next);
    if (onShowToast) {
      onShowToast(
        `Pengingat massal berhasil dikirim untuk ${pendingItems.length} mata kuliah ke ${rpsUploadAuditSummary.lecturerPendingGroups.length} dosen pengampu.`
      );
    }
  };

  const handleOpenReminderComposer = (item: RpsCourseUploadAuditItem) => {
    setSelectedReminderCourseId(item.course.id);
    setReminderDraftSubject(
      `[Pengingat Unggah RPS ${CURRENT_RPS_ACADEMIC_TERM}] ${item.course.kodeMK} - ${item.course.namaMK}`
    );
    setReminderDraftBody(buildRpsReminderMessage(item));
  };

  const handleCopyReminderText = async () => {
    const fullText = `${reminderDraftSubject}\n\n${reminderDraftBody}`;
    try {
      await navigator.clipboard.writeText(fullText);
      if (onShowToast) {
        onShowToast('Teks pesan pengingat dosen berhasil disalin ke clipboard (siap tempel ke WhatsApp/Email).');
      }
    } catch {
      if (onShowToast) {
        onShowToast('Teks pesan pengingat siap disalin dari kotak editor.');
      }
    }
  };

  const handleDispatchCrossProdiRpsReminders = (
    items: RpsCourseUploadAuditItem[],
    channel: RpsReminderDispatchRecord['channel'],
    toastMessage: string
  ) => {
    if (items.length > 0) {
      const sentAt = new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      const next = { ...rpsRemindersMap };
      items.forEach(item => {
        next[item.course.id] = {
          courseId: item.course.id,
          kodeMK: item.course.kodeMK,
          namaMK: item.course.namaMK,
          dosenNama: item.dosenNama,
          dosenEmail: item.dosenEmail,
          channel,
          sentAt,
          messagePreview: buildRpsReminderMessage(item)
        };
      });
      persistRpsReminders(next);
    }
    if (onShowToast) {
      onShowToast(toastMessage);
    }
  };

  const handleDirectUploadLatestRps = (courseId: string, file: File) => {
    const course = allMatrixCourses.find(c => c.id === courseId);
    const nextUploads: Record<string, UploadedRpsFileRecord> = {
      ...uploadedRpsFilesMap,
      [courseId]: {
        fileName: file.name,
        fileSizeKb: Math.max(12, Math.round(file.size / 1024)),
        uploadedAt: new Date().toISOString(),
        uploadedBy: course?.dosenPengampu || 'Dosen Pengampu',
        academicTerm: CURRENT_RPS_ACADEMIC_TERM
      }
    };
    persistUploadedRpsFiles(nextUploads);
    if (onShowToast) {
      onShowToast(
        `Berkas "${file.name}" terverifikasi untuk ${course?.kodeMK || 'MK'} (${CURRENT_RPS_ACADEMIC_TERM}). Status diperbarui otomatis.`
      );
    }
  };

  const filteredAuditResults = React.useMemo(() => {
    const q = matrixSearchQuery.trim().toLowerCase();
    return courseAuditResults
      .filter(item => {
        const c = item.course;
        const matchAuditStatus =
          auditStatusFilter === 'ALL'
            ? true
            : auditStatusFilter === 'FLAGGED'
            ? item.auditStatus !== 'MEMENUHI_STANDAR'
            : item.auditStatus === auditStatusFilter;
        const matchSem =
          matrixSemesterFilter === 'ALL'
            ? true
            : matrixSemesterFilter === 'B' || matrixSemesterFilter === 'K'
            ? c.semesterLabel === matrixSemesterFilter
            : matrixSemesterFilter === 'LAINNYA'
            ? c.semester === 0 && c.semesterLabel !== 'B' && c.semesterLabel !== 'K'
            : String(c.semester) === matrixSemesterFilter;
        const kelompok = c.kelompokKurikulum || (c.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib');
        const matchKelompok = matrixKelompokFilter === 'ALL' || kelompok === matrixKelompokFilter;
        const matchSearch =
          !q ||
          c.kodeMK.toLowerCase().includes(q) ||
          c.namaMK.toLowerCase().includes(q) ||
          c.dosenPengampu.toLowerCase().includes(q);
        return matchAuditStatus && matchSem && matchKelompok && matchSearch;
      })
      .sort((a, b) => a.avgContributionPercent - b.avgContributionPercent);
  }, [
    courseAuditResults,
    auditStatusFilter,
    matrixSemesterFilter,
    matrixKelompokFilter,
    matrixSearchQuery
  ]);

  const handleCopyRpsSuggestions = async (auditItem: CourseCplAuditResult) => {
    const text = [
      `AUDIT OTOMATIS CPL & SARAN PERBAIKAN RPS — ${selectedProdi.nama}`,
      `Mata Kuliah: ${auditItem.course.kodeMK} - ${auditItem.course.namaMK} (${auditItem.course.sks} SKS)`,
      `Dosen Pengampu: ${auditItem.course.dosenPengampu}`,
      `Skor Kontribusi CPL: ${auditItem.avgContributionPercent.toFixed(1)}% (Standar Min: ${MIN_CPL_COURSE_STANDARD_PERCENT}%)`,
      `Status Audit: ${auditItem.statusLabel}`,
      '',
      'Saran Perbaikan RPS:',
      ...auditItem.suggestions.map((s, idx) => `${idx + 1}. [${s.kategori} - Prioritas ${s.prioritas}] ${s.rekomendasi}`)
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      if (onShowToast) {
        onShowToast(`Saran perbaikan RPS untuk ${auditItem.course.kodeMK} berhasil disalin ke clipboard.`);
      }
    } catch {
      if (onShowToast) {
        onShowToast(`Saran perbaikan RPS ${auditItem.course.kodeMK} siap ditinjau pada panel detail.`);
      }
    }
  };

  const getGapConditionalStyle = (gapPercent: number) => {
    if (gapPercent > 10) {
      return {
        tier: 'red' as const,
        label: 'Kritis (> 10%)',
        shortLabel: '> 10%',
        valueClass: 'text-red-700',
        surfaceClass: 'bg-red-50/80 border-red-200',
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        barClass: 'bg-red-600'
      };
    }
    if (gapPercent >= 5) {
      return {
        tier: 'yellow' as const,
        label: 'Perhatian (5–10%)',
        shortLabel: '5–10%',
        valueClass: 'text-amber-700',
        surfaceClass: 'bg-amber-50/80 border-amber-200',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        barClass: 'bg-amber-500'
      };
    }
    return {
      tier: 'green' as const,
      label: 'Terkendali (< 5%)',
      shortLabel: '< 5%',
      valueClass: 'text-emerald-700',
      surfaceClass: 'bg-emerald-50/80 border-emerald-200',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      barClass: 'bg-emerald-600'
    };
  };

  // Ringkasan Eksekutif: Gap antara rata-rata CPL mata kuliah vs Target Prodi
  const executiveGapSummary = React.useMemo(() => {
    const prodiPrefix =
      selectedProdi.id === 'SIPIL' ? 'SIPIL-' : selectedProdi.id === 'LINGKUNGAN' ? 'LINGKUNGAN-' : 'LISTRIK-';
    const matchingCourseTargetEntries = Object.entries(courseTargets)
      .filter(([key]) => key.startsWith(prodiPrefix))
      .flatMap(([, items]) => items);

    const perCpl = activeCplsObe.map((cplDef, idx) => {
      const borangMatch = borang.cplList.find(b => b.kode === cplDef.kode);
      const targetProdi = borangMatch?.targetPersen ?? cplDef.targetKetercapaianMinimal;

      const mappedCourseScores: number[] = [];
      prodiMatrixCourses.forEach(course => {
        const level = course.pemetaanCpl[cplDef.kode];
        if (!level || level === 'None') return;
        const baseScore = level === 'Strong' ? 77.5 : level === 'Medium' ? 68.5 : 61.5;
        const bloomBonus = Math.min(2.5, (course.cpmkList?.length || 2) * 0.6) + (course.sks >= 3 ? 0.8 : 0);
        mappedCourseScores.push(baseScore + bloomBonus);
      });

      matchingCourseTargetEntries
        .filter(item => item.cplKode === cplDef.kode)
        .forEach(item => {
          mappedCourseScores.push(item.realisasiNilaiMhs);
        });

      const avgMkCpl =
        mappedCourseScores.length > 0
          ? Math.round((mappedCourseScores.reduce((sum, v) => sum + v, 0) / mappedCourseScores.length) * 10) / 10
          : Math.round((62.0 + (idx % 3) * 1.1) * 10) / 10;

      const gapPercent = Math.max(0, Math.round((targetProdi - avgMkCpl) * 10) / 10);
      const signedDiff = Math.round((avgMkCpl - targetProdi) * 10) / 10;

      return {
        kode: cplDef.kode,
        judul: cplDef.judul,
        ranah: cplDef.ranah,
        mappedCourseCount: mappedCourseScores.length,
        avgMkCpl,
        targetProdi,
        gapPercent,
        signedDiff,
        style: getGapConditionalStyle(gapPercent)
      };
    });

    const avgCourseCpl =
      perCpl.length > 0
        ? Math.round((perCpl.reduce((s, c) => s + c.avgMkCpl, 0) / perCpl.length) * 10) / 10
        : 0;
    const avgTargetProdi =
      perCpl.length > 0
        ? Math.round((perCpl.reduce((s, c) => s + c.targetProdi, 0) / perCpl.length) * 10) / 10
        : 0;
    const overallGapPercent = Math.max(0, Math.round((avgTargetProdi - avgCourseCpl) * 10) / 10);
    const overallStyle = getGapConditionalStyle(overallGapPercent);

    const redCount = perCpl.filter(c => c.style.tier === 'red').length;
    const yellowCount = perCpl.filter(c => c.style.tier === 'yellow').length;
    const greenCount = perCpl.filter(c => c.style.tier === 'green').length;

    return {
      perCpl,
      avgCourseCpl,
      avgTargetProdi,
      overallGapPercent,
      overallStyle,
      redCount,
      yellowCount,
      greenCount
    };
  }, [activeCplsObe, borang.cplList, prodiMatrixCourses, courseTargets, selectedProdi.id]);

  const rpsAuditPassRate = React.useMemo(() => {
    if (auditSummary.totalCourses === 0) return 100;
    return Math.round((auditSummary.passingCount / auditSummary.totalCourses) * 100);
  }, [auditSummary]);

  const baselineProjection = React.useMemo(
    () =>
      computeAccreditationProjection({
        prodi: selectedProdi,
        borang,
        gapRows: gapAnalysisRows,
        avgCourseCplPercent: executiveGapSummary.avgCourseCpl,
        rpsAuditPassRate
      }),
    [selectedProdi, borang, gapAnalysisRows, executiveGapSummary.avgCourseCpl, rpsAuditPassRate]
  );

  const simulatedProjection = React.useMemo(
    () =>
      computeAccreditationProjection({
        prodi: selectedProdi,
        borang,
        gapRows: gapAnalysisRows,
        avgCourseCplPercent: executiveGapSummary.avgCourseCpl,
        rpsAuditPassRate,
        scenarios: projectionScenario
      }),
    [selectedProdi, borang, gapAnalysisRows, executiveGapSummary.avgCourseCpl, rpsAuditPassRate, projectionScenario]
  );

  const filteredMatrixCourses = React.useMemo(() => {
    const q = matrixSearchQuery.trim().toLowerCase();
    return prodiMatrixCourses.filter(course => {
      const matchSem =
        matrixSemesterFilter === 'ALL'
          ? true
          : matrixSemesterFilter === 'B' || matrixSemesterFilter === 'K'
          ? course.semesterLabel === matrixSemesterFilter
          : matrixSemesterFilter === 'LAINNYA'
          ? course.semester === 0 && course.semesterLabel !== 'B' && course.semesterLabel !== 'K'
          : String(course.semester) === matrixSemesterFilter;
      const kelompok = course.kelompokKurikulum || (course.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib');
      const matchKelompok = matrixKelompokFilter === 'ALL' || kelompok === matrixKelompokFilter;
      const matchSearch =
        !q ||
        course.kodeMK.toLowerCase().includes(q) ||
        course.namaMK.toLowerCase().includes(q) ||
        course.dosenPengampu.toLowerCase().includes(q);
      return matchSem && matchKelompok && matchSearch;
    });
  }, [prodiMatrixCourses, matrixSemesterFilter, matrixKelompokFilter, matrixSearchQuery]);

  const hasMatrixFilter =
    matrixSemesterFilter !== 'ALL' || matrixKelompokFilter !== 'ALL' || matrixSearchQuery.trim().length > 0;

  const matrixScopeLabel = React.useMemo(() => {
    const parts: string[] = [];
    if (matrixSemesterFilter !== 'ALL') {
      parts.push(
        matrixSemesterFilter === 'B'
          ? 'Semester B (Khusus)'
          : matrixSemesterFilter === 'K'
          ? 'Semester K (Konversi)'
          : matrixSemesterFilter === 'LAINNYA'
          ? 'Lintas Kurikulum (-)'
          : `Semester ${matrixSemesterFilter.padStart(2, '0')}`
      );
    }
    if (matrixKelompokFilter !== 'ALL') {
      parts.push(`Kelompok ${matrixKelompokFilter}`);
    }
    if (matrixSearchQuery.trim()) {
      parts.push(`Pencarian "${matrixSearchQuery.trim()}"`);
    }
    return parts.length > 0 ? parts.join(' · ') : 'Seluruh Semester & Kelompok Kurikulum (Wajib & Pilihan)';
  }, [matrixSemesterFilter, matrixKelompokFilter, matrixSearchQuery]);

  const reportGenerationDate = React.useMemo(
    () => new Date(),
    [selectedProdi.id, isMatrixPdfModalOpen, matrixSemesterFilter, matrixKelompokFilter]
  );

  const matrixPdfMeta = React.useMemo(
    () =>
      buildAkreditasiMatrixPdfMeta(
        selectedProdi,
        filteredMatrixCourses,
        matrixScopeLabel,
        reportGenerationDate
      ),
    [selectedProdi, filteredMatrixCourses, matrixScopeLabel, reportGenerationDate]
  );

  const handleExportMatrixExcel = () => {
    if (filteredMatrixCourses.length === 0) {
      if (onShowToast) {
        onShowToast('Tidak ada mata kuliah yang cocok dengan filter aktif untuk diekspor. Reset filter atau pilih cakupan lain.');
      }
      return;
    }
    exportMatriksCplToExcel(filteredMatrixCourses, activeCplsObe, selectedProdi, 'xlsx', {
      filterContextLabel: hasMatrixFilter ? matrixScopeLabel : undefined,
      gapAnalysisRows,
      executiveGapPerCpl: executiveGapSummary.perCpl.map(item => ({
        kode: item.kode,
        avgMkCpl: item.avgMkCpl,
        targetProdi: item.targetProdi,
        gapPercent: item.gapPercent,
        signedDiff: item.signedDiff,
        statusLabel: item.style.label
      })),
      executiveOverall: {
        avgCourseCpl: executiveGapSummary.avgCourseCpl,
        avgTargetProdi: executiveGapSummary.avgTargetProdi,
        overallGapPercent: executiveGapSummary.overallGapPercent,
        statusLabel: executiveGapSummary.overallStyle.label
      }
    });
    if (onShowToast) {
      onShowToast(
        `File Excel Matriks Kontribusi CPL (${filteredMatrixCourses.length} MK) & persentase Gap ${selectedProdi.nama} berhasil diunduh (.xlsx).`
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6 akreditasi-screen-only print:hidden">
      {/* Hero Banner: Status Akreditasi & Target LAM-Teknik */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-blue-300 font-medium tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gugus Penjaminan Mutu Fakultas (GPMF) FT UNBARI</span>
              <span aria-hidden="true">·</span>
              <span>Instrumen 9 Kriteria</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Kesiapan Akreditasi LAM-Teknik &amp; Kurikulum OBE
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitoring instrumen Laporan Evaluasi Diri (LED), Laporan Kinerja Program Studi (LKPS), dan pemetaan Capaian Pembelajaran Lulusan (CPL) berbasis Outcome-Based Education untuk {selectedProdi.nama}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportMatrixExcel}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
              title="Unduh Laporan Matriks Kontribusi CPL & Gap Analysis format Excel (.xlsx) untuk Borang Akreditasi"
            >
              <Download className="w-4 h-4 text-emerald-950" />
              <span>Unduh Matriks CPL (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMatrixPdfModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
              title="Ekspor Laporan Matriks Kontribusi CPL per Mata Kuliah ke PDF dengan Kop Surat Resmi FT UNBARI"
            >
              <FileText className="w-4 h-4" />
              <span>Ekspor PDF Matriks CPL</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>Cetak Laporan 9 Kriteria (PDF)</span>
            </button>
          </div>
        </div>

        {/* KPI Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 text-slate-100">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Peringkat Saat Ini</span>
            <span className="text-base sm:text-lg font-bold text-white block mt-0.5">{borang.peringkatSaatIni}</span>
            <span className="text-[10px] text-slate-400">Berlaku s.d {borang.tanggalKadaluarsa}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Target Re-Akreditasi</span>
            <span className="text-base sm:text-lg font-bold text-blue-400 block mt-0.5">{borang.targetPeringkat}</span>
            <span className="text-[10px] text-slate-400">Instrumen LAM-Teknik V2</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Proyeksi Skor Akreditasi (CPL + KTW)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
                {baselineProjection.skorProyeksiAkhir.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 400</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('proyeksi_akreditasi')}
              className="text-[10px] text-emerald-300 hover:text-emerald-200 font-semibold inline-flex items-center gap-1 mt-0.5 cursor-pointer hover:underline"
            >
              <span>
                {baselineProjection.peringkatProyeksi} · {baselineProjection.unggulTrack.statusLabel}
              </span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Kesiapan Berkas LKPS &amp; LED</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {persenDokumen}%
              </span>
              <span className="text-xs text-slate-400 font-mono">({totalDokTersedia}/{totalDokDibutuhkan})</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${persenDokumen}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PANEL RINGKASAN EKSEKUTIF: GAP RATA-RATA CPL MATA KULIAH VS TARGET PRODI */}
      <section
        aria-label="Ringkasan Eksekutif Gap CPL Mata Kuliah vs Target Prodi"
        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Ringkasan Eksekutif Ketercapaian Kurikulum</span>
              <span aria-hidden="true">·</span>
              <span>{selectedProdi.nama}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{prodiMatrixCourses.length} Mata Kuliah</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Gap Rata-rata CPL Mata Kuliah terhadap Target Program Studi
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" aria-hidden="true" />
              <span>Hijau: Gap &lt; 5%</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" aria-hidden="true" />
              <span>Kuning: Gap 5% – 10%</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-600" aria-hidden="true" />
              <span>Merah: Gap &gt; 10%</span>
            </span>
          </div>
        </div>

        {/* Top Aggregate Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200">
          <div className="p-4 sm:p-5">
            <span className="text-xs text-slate-500 block">Rata-rata CPL Mata Kuliah</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {executiveGapSummary.avgCourseCpl.toFixed(1)}%
              </span>
              <span className="text-[11px] text-slate-500 tabular-nums">
                dari {prodiMatrixCourses.length} MK
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-xs text-slate-500 block">Rata-rata Target Prodi (OBE)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-blue-700">
                {executiveGapSummary.avgTargetProdi.toFixed(1)}%
              </span>
              <span className="text-[11px] text-slate-500">
                {executiveGapSummary.perCpl.length} Butir CPL
              </span>
            </div>
          </div>

          <div className={`p-4 sm:p-5 ${executiveGapSummary.overallStyle.surfaceClass}`}>
            <span className="text-xs text-slate-700 font-medium block">
              Persentase Gap Agregat
            </span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className={`text-2xl font-bold font-mono tabular-nums ${executiveGapSummary.overallStyle.valueClass}`}>
                {executiveGapSummary.overallGapPercent.toFixed(1)}%
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${executiveGapSummary.overallStyle.badgeClass}`}>
                {executiveGapSummary.overallStyle.tier === 'green' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertTriangle className="w-3 h-3" />
                )}
                <span>{executiveGapSummary.overallStyle.label}</span>
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-xs text-slate-500 block">Distribusi Zona Gap per CPL</span>
            <div className="flex items-center gap-3 mt-1.5 font-mono text-xs tabular-nums">
              <span className="text-emerald-700 font-bold">{executiveGapSummary.greenCount} Hijau</span>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="text-amber-700 font-bold">{executiveGapSummary.yellowCount} Kuning</span>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="text-red-700 font-bold">{executiveGapSummary.redCount} Merah</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('proyeksi_akreditasi')}
                className="text-left text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
              >
                <span>Proyeksi Peringkat ({baselineProjection.peringkatProyeksi})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('cpl_obe')}
                className="text-left text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
              >
                <span>Detail Gap Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('audit_rps')}
                className="text-left text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
              >
                <span>Audit RPS &lt;70% ({auditSummary.totalFlagged} MK)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('audit_kinerja_rps')}
                className="text-left text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
              >
                <span>Audit Kinerja RPS &amp; Radar CPL</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('audit_kualitas_rps')}
                className="text-left text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
              >
                <span>Audit Kualitas RPS (Skor {rpsQualitySummary.avgQualityScore.toFixed(0)}/100)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('smart_rps_audit')}
                className="text-left text-[11px] font-semibold text-sky-700 hover:text-sky-900 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
              >
                <span>
                  Smart RPS Audit ({smartRpsSummary.compliantCount}/{smartRpsSummary.totalCourses} &ge;3 Asesmen)
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('audit_unggah_rps')}
                className="text-left text-[11px] font-semibold text-amber-700 hover:text-amber-900 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
              >
                <span>
                  Audit Unggah RPS ({rpsUploadAuditSummary.missingLatestCount} Belum Terbaru)
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('audit_kelengkapan_cpl')}
                className="text-left text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
              >
                <span>
                  Audit Kelengkapan CPL ({cplCompletenessReport.incompleteCount} Incomplete)
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('ai_rps_evaluator')}
                className="text-left text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
              >
                <span>AI RPS Evaluator (5 Komponen OBE · 1–100)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('matriks_kualitas_rps')}
                className="text-left text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
              >
                <span>
                  Matriks Analisis Kualitas RPS ({obeHeatmapSummary.below70Count} Skor &lt;70)
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Per-CPL Conditional Formatting Breakdown */}
        <div className="p-4 sm:p-5 bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {executiveGapSummary.perCpl.map(item => (
              <button
                key={item.kode}
                type="button"
                onClick={() => setActiveSubTab('target_matakuliah')}
                className={`p-3 rounded-lg border text-left transition-colors hover:brightness-97 cursor-pointer flex flex-col justify-between gap-2 ${item.style.surfaceClass}`}
                title={`${item.kode} — ${item.judul}: Rata-rata MK ${item.avgMkCpl.toFixed(1)}% vs Target Prodi ${item.targetProdi}% (Gap ${item.gapPercent.toFixed(1)}%)`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold text-slate-900">{item.kode}</span>
                    <span className={`font-mono text-xs font-bold tabular-nums ${item.style.valueClass}`}>
                      {item.gapPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-700 truncate mt-0.5">
                    {item.judul}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden border border-slate-200/70">
                    <div
                      className={`h-full rounded-full ${item.style.barClass}`}
                      style={{ width: `${Math.min(100, Math.max(8, (item.avgMkCpl / item.targetProdi) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-600">
                    <span>MK {item.avgMkCpl.toFixed(1)}%</span>
                    <span>Tgt {item.targetProdi}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('kriteria')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'kriteria'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>9 Kriteria LAM-Teknik</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('proyeksi_akreditasi')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'proyeksi_akreditasi'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Proyeksi Skor &amp; Peringkat ({baselineProjection.peringkatProyeksi})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('cpl_obe')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'cpl_obe'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Pemetaan CPL Kurikulum OBE ({borang.cplList.length} Butir)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit_rps')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'audit_rps'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-rose-600" />
            <span>Audit CPL &lt;70% &amp; Saran RPS</span>
            {auditSummary.totalFlagged > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-mono text-[10px] font-bold tabular-nums">
                {auditSummary.totalFlagged}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit_kinerja_rps')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'audit_kinerja_rps'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Audit Kinerja RPS &amp; Pemindaian Silang</span>
            <span
              className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold tabular-nums ${
                rpsPerfReport.needsAdjustmentCourseCount > 0
                  ? 'bg-amber-100 text-amber-900 border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {rpsPerfReport.avgKeselarasanSkor}/100
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit_kualitas_rps')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'audit_kualitas_rps'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Audit Kualitas RPS (OBE)</span>
            <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200 font-mono text-[10px] font-bold tabular-nums">
              {rpsQualitySummary.avgQualityScore.toFixed(0)}/100
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('matriks_kualitas_rps')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'matriks_kualitas_rps'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Grid3X3 className="w-4 h-4 text-rose-600" />
            <span>Matriks Analisis Kualitas RPS</span>
            <span
              className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold tabular-nums ${
                obeHeatmapSummary.below70Count > 0
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {obeHeatmapSummary.below70Count > 0
                ? `${obeHeatmapSummary.below70Count} <70`
                : 'Optimal'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ai_rps_evaluator')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'ai_rps_evaluator'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI RPS Evaluator</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono text-[10px] font-bold tabular-nums">
              1–100
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('smart_rps_audit')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'smart_rps_audit'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileSearch className="w-4 h-4 text-sky-600" />
            <span>Smart RPS Audit (Min. 3 Asesmen)</span>
            <span
              className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold tabular-nums ${
                smartRpsSummary.nonCompliantCount > 0
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : smartRpsSummary.needsStrengtheningCount > 0
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {smartRpsSummary.nonCompliantCount > 0
                ? `${smartRpsSummary.nonCompliantCount} Gagal`
                : `${smartRpsSummary.complianceRatePercent}% OBE`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit_unggah_rps')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'audit_unggah_rps'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BellRing className="w-4 h-4 text-amber-600" />
            <span>Audit Unggah RPS &amp; Pengingat Dosen</span>
            <span
              className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold tabular-nums ${
                rpsUploadAuditSummary.missingLatestCount > 0
                  ? 'bg-amber-100 text-amber-900 border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {rpsUploadAuditSummary.missingLatestCount > 0
                ? `${rpsUploadAuditSummary.missingLatestCount} Belum`
                : '100% Lengkap'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('progres_rps_prodi')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'progres_rps_prodi'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Progres Unggah RPS per Prodi</span>
            <span
              className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold tabular-nums ${
                facultyRpsProgressQuick.complianceRatePercent >= 85
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : facultyRpsProgressQuick.complianceRatePercent >= 60
                  ? 'bg-amber-100 text-amber-900 border-amber-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}
            >
              {facultyRpsProgressQuick.complianceRatePercent}% FT
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit_bap_mk')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'audit_bap_mk'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-rose-600" />
            <span>Audit Kelengkapan BAP per MK</span>
            {bapAuditReport.investigasiCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-mono text-[10px] font-bold tabular-nums">
                {bapAuditReport.investigasiCount} Investigasi
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit_asesmen_obe')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'audit_asesmen_obe'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Audit Kualitas Asesmen (Tugas/UTS/UAS)</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono text-[10px] font-bold tabular-nums">
              {assessmentAuditReport.avgObeScore}/100
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('audit_kelengkapan_cpl')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'audit_kelengkapan_cpl'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-rose-600" />
            <span>Audit Kelengkapan CPL (Status Incomplete)</span>
            <span
              className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold tabular-nums ${
                cplCompletenessReport.incompleteCount > 0
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {cplCompletenessReport.incompleteCount > 0
                ? `${cplCompletenessReport.incompleteCount} Incomplete`
                : '100% Complete'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('matriks_cpl_cpmk')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'matriks_cpl_cpmk'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Table className="w-4 h-4 text-emerald-600" />
            <span>Matriks Relasi MK - CPMK - CPL (S/M/L)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('spider_cpl_angkatan')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'spider_cpl_angkatan'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Spider-Chart CPL Angkatan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('rasio_dosen_angkatan')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'rasio_dosen_angkatan'
                ? 'border-blue-600 text-blue-700 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Rasio Dosen &amp; Angkatan</span>
            <span
              className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold tabular-nums ${
                rasioDosenQuickSummary.puncakKebutuhanTambahDosen > 0
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              1:{rasioDosenQuickSummary.rasioAktual.toFixed(1)}
              {rasioDosenQuickSummary.puncakKebutuhanTambahDosen > 0
                ? ` (+${rasioDosenQuickSummary.puncakKebutuhanTambahDosen})`
                : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('target_matakuliah')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeSubTab === 'target_matakuliah'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Target CPL per Mata Kuliah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('analisis_iabee')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeSubTab === 'analisis_iabee'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analisis CPL Standar IABEE (OBE)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('dokumen_borang')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeSubTab === 'dokumen_borang'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Checklist Bukti Dokumen Borang</span>
          </button>
        </nav>
      </div>

      {/* SUB-TAB 1: 9 KRITERIA LAM-TEKNIK */}
      {activeSubTab === 'kriteria' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 9 Kriteria List */}
          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Daftar Kriteria Standar
            </h3>
            {borang.kriteriaList.map((k) => {
              const isSelected = k.id === selectedKriteriaId;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setSelectedKriteriaId(k.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {k.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {k.nama.split(':')[1]?.trim() || k.nama}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                      <span>Bobot: {k.bobotPersen}%</span>
                      <span>·</span>
                      <span>Dokumen: {k.dokumenTersedia}/{k.dokumenDibutuhkan}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-sm text-slate-900 block tabular-nums">
                      {k.skorSkala4.toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-medium block ${
                      k.status === 'Memenuhi Unggul' ? 'text-emerald-700' : 'text-blue-700'
                    }`}>
                      {k.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Criteria Inspector */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-700 uppercase">
                  {selectedKriteria.id} · Bobot Penilaian {selectedKriteria.bobotPersen}%
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  {selectedKriteria.nama}
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedKriteria.deskripsi}
                </p>
              </div>

              <div className="text-right shrink-0 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Skor Asesor</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                  {selectedKriteria.skorSkala4.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                  {selectedKriteria.status}
                </span>
              </div>
            </div>

            {/* Indikator Kunci */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Indikator Kunci Penilaian LAM-Teknik:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedKriteria.indikatorKunci.map((ind, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Catatan Asesor & Tindak Lanjut */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
                  <Info className="w-3.5 h-3.5 text-blue-700" />
                  <span>Catatan Asesor Penjaminan Mutu Internal (GPMF):</span>
                </div>
                <p className="text-xs text-blue-950 leading-relaxed">
                  {selectedKriteria.catatanAsesorInternal}
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rekomendasi Tindak Lanjut Pemenuhan:</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {selectedKriteria.rekomendasiPerbaikan}
                </p>
              </div>
            </div>

            {/* Status Dokumen Kriteria */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Kelengkapan Berkas Bukti Kriteria:</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedKriteria.dokumenTersedia} dari {selectedKriteria.dokumenDibutuhkan} Dokumen Lengkap ({Math.round((selectedKriteria.dokumenTersedia / selectedKriteria.dokumenDibutuhkan) * 100)}%)
              </span>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB: PROYEKSI SKOR AKREDITASI BERDASARKAN DATA CPL & TREN KELULUSAN 3 TAHUN */}
      {activeSubTab === 'proyeksi_akreditasi' && (
        <div className="space-y-6">
          {/* Top Trajectory Verdict & 4 KPI Strip */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Proyeksi Peringkat LAM-Teknik</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedProdi.nama}</span>
                  <span aria-hidden="true">·</span>
                  <span>Basis CPL OBE &amp; Tren Kelulusan 3 Tahun (2023/24 – 2025/26)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Estimasi Jalur Peringkat Akreditasi: &lsquo;Baik Sekali&rsquo; vs &lsquo;Unggul&rsquo;
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {simulatedProjection.unggulTrack.ringkasan}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <div
                  className={`px-3.5 py-2.5 rounded-lg border text-xs ${
                    simulatedProjection.baikSekaliTrack.onTrack
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <span className="text-[11px] text-slate-600 block">Jalur Mempertahankan Baik Sekali (≥301)</span>
                  <span className="font-bold inline-flex items-center gap-1.5 mt-0.5">
                    {simulatedProjection.baikSekaliTrack.onTrack ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                    )}
                    <span className="whitespace-nowrap">
                      {simulatedProjection.baikSekaliTrack.statusLabel} (
                      {simulatedProjection.baikSekaliTrack.marginDariAmbang >= 0 ? '+' : ''}
                      {simulatedProjection.baikSekaliTrack.marginDariAmbang.toFixed(1)})
                    </span>
                  </span>
                </div>

                <div
                  className={`px-3.5 py-2.5 rounded-lg border text-xs ${
                    simulatedProjection.unggulTrack.onTrack
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : simulatedProjection.unggulTrack.approaching
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                >
                  <span className="text-[11px] text-slate-600 block">Jalur Peringkat Unggul (≥361)</span>
                  <span className="font-bold inline-flex items-center gap-1.5 mt-0.5">
                    {simulatedProjection.unggulTrack.onTrack ? (
                      <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    )}
                    <span className="whitespace-nowrap">
                      {simulatedProjection.unggulTrack.statusLabel} (
                      {simulatedProjection.unggulTrack.marginDariAmbang >= 0 ? '+' : ''}
                      {simulatedProjection.unggulTrack.marginDariAmbang.toFixed(1)})
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* 4 KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 text-xs">
              <div className="p-4 sm:p-5">
                <span className="text-[11px] text-slate-500 block">Skor Aktual Terintegrasi</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {simulatedProjection.skorAktualTerintegrasi.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ 400</span>
                </div>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  Predikat: <strong>{simulatedProjection.peringkatAktualEstimasi}</strong>
                </span>
              </div>

              <div className="p-4 sm:p-5 bg-slate-50/60">
                <span className="text-[11px] text-slate-500 block">Proyeksi Skor Re-Akreditasi (2027/28)</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span
                    className={`text-2xl font-bold font-mono tabular-nums ${
                      simulatedProjection.skorProyeksiAkhir >= SCORE_THRESHOLD_UNGGUL
                        ? 'text-emerald-700'
                        : simulatedProjection.skorProyeksiAkhir >= SCORE_THRESHOLD_BAIK_SEKALI
                        ? 'text-blue-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {simulatedProjection.skorProyeksiAkhir.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ 400</span>
                </div>
                <span className="text-[11px] text-slate-700 font-semibold block mt-0.5">
                  Estimasi: {simulatedProjection.peringkatProyeksi}
                </span>
              </div>

              <div className="p-4 sm:p-5">
                <span className="text-[11px] text-slate-500 block">Indeks Ketercapaian CPL OBE</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono tabular-nums text-blue-700">
                    {simulatedProjection.avgCplRealization.toFixed(1)}%
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500">
                    ({simulatedProjection.rpsAuditPassRate}% MK ≥70%)
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  Skor K6 OBE: <strong className="font-mono">{simulatedProjection.skorK6Proyeksi.toFixed(2)} / 4.00</strong>
                </span>
              </div>

              <div className="p-4 sm:p-5">
                <span className="text-[11px] text-slate-500 block">Tren Kelulusan Tepat Waktu (3 Thn)</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
                    {simulatedProjection.latestKtwPersen.toFixed(1)}%
                  </span>
                  <span className="text-[11px] font-mono tabular-nums font-semibold text-emerald-700">
                    {simulatedProjection.ktwSlopePerYear >= 0 ? '+' : ''}
                    {simulatedProjection.ktwSlopePerYear.toFixed(1)}%/thn
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  IPK {simulatedProjection.latestIpkRata.toFixed(2)} · Tunggu {simulatedProjection.latestMasaTungguBulan.toFixed(1)} bln (K9: <strong className="font-mono">{simulatedProjection.skorK9Proyeksi.toFixed(2)}</strong>)
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Analytics: Trajectory Chart & 3-Year Graduation Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Multi-Year Score Projection Chart */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-700" />
                    <span>Lintasan Proyeksi Skor Akreditasi (Skala 400 LAM-Teknik)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Perbandingan progres historis (2023–2026) dan proyeksi re-akreditasi terhadap batas Baik Sekali (301) &amp; Unggul (361).
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
                  <span>Unggul ≥ {SCORE_THRESHOLD_UNGGUL}</span>
                  <span aria-hidden="true">·</span>
                  <span>Baik Sekali ≥ {SCORE_THRESHOLD_BAIK_SEKALI}</span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ComposedChart
                    data={simulatedProjection.timelineSeries}
                    margin={{ top: 18, right: 20, left: -5, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="scoreProjFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="periode" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} />
                    <YAxis
                      domain={[280, 400]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.96)',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(value: any, name: any) => [
                        name.includes('Skor') ? `${Number(value).toFixed(1)} / 400` : `${Number(value).toFixed(1)}%`,
                        name
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <ReferenceLine
                      y={SCORE_THRESHOLD_UNGGUL}
                      stroke="#059669"
                      strokeDasharray="5 4"
                      label={{
                        value: 'Batas Unggul (361)',
                        fill: '#059669',
                        fontSize: 10,
                        fontWeight: 700,
                        position: 'insideTopRight'
                      }}
                    />
                    <ReferenceLine
                      y={SCORE_THRESHOLD_BAIK_SEKALI}
                      stroke="#2563eb"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Batas Baik Sekali (301)',
                        fill: '#2563eb',
                        fontSize: 10,
                        fontWeight: 700,
                        position: 'insideBottomRight'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="skorProyeksi"
                      name="Skor Akreditasi (0-400)"
                      stroke="#1d4ed8"
                      strokeWidth={3}
                      fill="url(#scoreProjFill)"
                      dot={{ r: 4.5, fill: '#1d4ed8', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: 3-Year Graduation Trend (KTW + Graduates + Employment) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>Tren Kelulusan 3 Tahun Terakhir</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rasio Kelulusan Tepat Waktu (KTW), jumlah lulusan yudisium, dan IPK rata-rata penopang Kriteria 9.
                </p>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ComposedChart
                    data={simulatedProjection.graduationTrends3Years}
                    margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="tahunAkademik" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} />
                    <YAxis yAxisId="left" domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.96)',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                    <Bar
                      yAxisId="right"
                      dataKey="jumlahLulusan"
                      name="Jumlah Lulusan (Mhs)"
                      fill="#bfdbfe"
                      radius={[4, 4, 0, 0]}
                      barSize={26}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="lulusTepatWaktuPersen"
                      name="KTW (%)"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#059669' }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="serapanKerjaPersen"
                      name="Serapan Kerja (%)"
                      stroke="#2563eb"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      dot={{ r: 3.5, fill: '#2563eb' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto border-t border-slate-100 pt-3">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                      <th className="py-1.5 font-semibold">Tahun</th>
                      <th className="py-1.5 text-right font-semibold">Lulusan</th>
                      <th className="py-1.5 text-right font-semibold">KTW (%)</th>
                      <th className="py-1.5 text-right font-semibold">IPK</th>
                      <th className="py-1.5 text-right font-semibold">Tunggu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {simulatedProjection.graduationTrends3Years.map(row => (
                      <tr key={row.tahunAkademik} className="hover:bg-slate-50">
                        <td className="py-2 font-semibold text-slate-900">{row.tahunAkademik}</td>
                        <td className="py-2 text-right text-slate-700">{row.jumlahLulusan} mhs</td>
                        <td className="py-2 text-right font-bold text-emerald-700">
                          {row.lulusTepatWaktuPersen.toFixed(1)}%
                        </td>
                        <td className="py-2 text-right text-slate-800">{row.ipkRataRata.toFixed(2)}</td>
                        <td className="py-2 text-right text-slate-600">{row.masaTungguBulan.toFixed(1)} bln</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2-Column Section: Interactive What-If Simulator & 5-Point Syarat Unggul Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive What-If Scenario Simulator */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-700" />
                    <span>Simulasi Target Peningkatan (What-If)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Uji dampak perbaikan capaian CPL, revisi RPS &lt;70%, dan percepatan KTW terhadap skor akhir akreditasi.
                  </p>
                </div>
                {(projectionScenario.deltaCplPersen !== 0 ||
                  projectionScenario.deltaKtwPersen !== 0 ||
                  projectionScenario.deltaAuditRpsPersen !== 0) && (
                  <button
                    type="button"
                    onClick={() =>
                      setProjectionScenario({
                        deltaCplPersen: 0,
                        deltaKtwPersen: 0,
                        deltaAuditRpsPersen: 0
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="sim-cpl" className="font-semibold text-slate-800">
                      Peningkatan Rata-rata CPL Prodi
                    </label>
                    <span className="font-mono font-bold tabular-nums text-blue-700">
                      {projectionScenario.deltaCplPersen >= 0 ? '+' : ''}
                      {projectionScenario.deltaCplPersen.toFixed(1)}% (→ {simulatedProjection.avgCplRealization.toFixed(1)}%)
                    </span>
                  </div>
                  <input
                    id="sim-cpl"
                    type="range"
                    min={-4}
                    max={8}
                    step={0.5}
                    value={projectionScenario.deltaCplPersen}
                    onChange={e =>
                      setProjectionScenario(prev => ({
                        ...prev,
                        deltaCplPersen: parseFloat(e.target.value)
                      }))
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="sim-ktw" className="font-semibold text-slate-800">
                      Perubahan Tren Kelulusan Tepat Waktu (KTW)
                    </label>
                    <span className="font-mono font-bold tabular-nums text-emerald-700">
                      {projectionScenario.deltaKtwPersen >= 0 ? '+' : ''}
                      {projectionScenario.deltaKtwPersen.toFixed(1)}% (→ {simulatedProjection.latestKtwPersen.toFixed(1)}%)
                    </span>
                  </div>
                  <input
                    id="sim-ktw"
                    type="range"
                    min={-5}
                    max={8}
                    step={0.5}
                    value={projectionScenario.deltaKtwPersen}
                    onChange={e =>
                      setProjectionScenario(prev => ({
                        ...prev,
                        deltaKtwPersen: parseFloat(e.target.value)
                      }))
                    }
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="sim-rps" className="font-semibold text-slate-800">
                      Kepatuhan Audit RPS MK (≥70%)
                    </label>
                    <span className="font-mono font-bold tabular-nums text-slate-800">
                      +{projectionScenario.deltaAuditRpsPersen}% (→ {simulatedProjection.rpsAuditPassRate}%)
                    </span>
                  </div>
                  <input
                    id="sim-rps"
                    type="range"
                    min={0}
                    max={25}
                    step={1}
                    value={projectionScenario.deltaAuditRpsPersen}
                    onChange={e =>
                      setProjectionScenario(prev => ({
                        ...prev,
                        deltaAuditRpsPersen: parseInt(e.target.value, 10)
                      }))
                    }
                    className="w-full accent-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Hasil Simulasi Proyeksi</span>
                  <span className="font-bold text-slate-900">
                    Predikat {simulatedProjection.peringkatProyeksi}
                  </span>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <span className="text-lg font-bold text-blue-700">
                    {simulatedProjection.skorProyeksiAkhir.toFixed(1)}
                  </span>
                  <span className="text-slate-500 text-xs"> / 400</span>
                  <span className="block text-[10px] text-slate-500">
                    Delta aktual:{' '}
                    {simulatedProjection.skorProyeksiAkhir - baselineProjection.skorProyeksiAkhir >= 0 ? '+' : ''}
                    {(simulatedProjection.skorProyeksiAkhir - baselineProjection.skorProyeksiAkhir).toFixed(1)} poin
                  </span>
                </div>
              </div>
            </div>

            {/* Right: 5-Point Syarat Perlu Unggul Checklist */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Evaluasi Syarat Perlu &amp; Ambang Peringkat Unggul</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selain skor total ≥ 361.0, LAM-Teknik mensyaratkan pemenuhan indikator mutu pembelajaran &amp; luaran lulusan.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold tabular-nums text-slate-800">
                  {simulatedProjection.unggulTrack.jumlahSyaratTerpenuhi} /{' '}
                  {simulatedProjection.unggulTrack.syaratUnggulChecklist.length} Terpenuhi
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {simulatedProjection.unggulTrack.syaratUnggulChecklist.map(chk => (
                  <div key={chk.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-semibold text-slate-900">
                        {chk.terpenuhi ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span>{chk.indikator}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-6">{chk.catatan}</p>
                    </div>

                    <div className="flex items-center gap-3 pl-6 sm:pl-0 shrink-0 font-mono tabular-nums">
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">{chk.nilaiAktual}</span>
                        <span className="text-[10px] text-slate-500">Ambang: {chk.ambangUnggul}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                          chk.terpenuhi
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {chk.terpenuhi ? 'Memenuhi' : 'Perlu Penguatan'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Rencana Aksi Pengawalan Peringkat Akreditasi ({selectedProdi.nama})
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekomendasi prioritas berbasis selisih CPL kurikulum, hasil audit RPS &lt;70%, dan profil 9 kriteria borang.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('audit_rps')}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Tindak Lanjuti Audit RPS ({auditSummary.totalFlagged} MK)
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Laporan 9 Kriteria</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold w-28">Prioritas</th>
                    <th className="py-2.5 px-3 font-bold min-w-[210px]">Fokus Intervensi</th>
                    <th className="py-2.5 px-3 font-bold w-40">Dampak Estimasi</th>
                    <th className="py-2.5 px-3 font-bold">Langkah Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simulatedProjection.strategicRecommendations.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 align-top">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border whitespace-nowrap ${
                            rec.prioritas === 'Tinggi'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : rec.prioritas === 'Sedang'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {rec.prioritas}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 align-top">{rec.fokus}</td>
                      <td className="py-3 px-3 font-mono text-[11px] font-bold text-blue-700 align-top whitespace-nowrap">
                        {rec.dampakEstimasi}
                      </td>
                      <td className="py-3 px-3 text-slate-600 leading-relaxed align-top">{rec.aksi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PEMETAAN CPL KURIKULUM OBE */}
      {activeSubTab === 'cpl_obe' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Capaian Pembelajaran Lulusan (CPL) Program Studi {selectedProdi.nama}
              </h3>
              <p className="text-xs text-slate-500">
                Standar Kurikulum Outcome-Based Education (OBE) mengacu pada standar KKNI Level 6 dan kriteria internasional IABEE / LAM-Teknik.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 block">Rata-rata Ketercapaian CPL</span>
              <span className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
                {(borang.cplList.reduce((acc, c) => acc + c.realisasiPersen, 0) / borang.cplList.length).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* GAP ANALYSIS COMPARISON TABLE: CAPAIAN SAAT INI VS TARGET KURIKULUM OBE */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/70">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Gap Analysis Capaian CPL Saat Ini vs Target Kurikulum OBE
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tabel perbandingan realisasi ketercapaian kompetensi lulusan terhadap ambang target kurikulum {selectedProdi.nama} ({prodiMatrixCourses.length} mata kuliah terpetakan).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportMatrixExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMatrixPdfModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Ekspor PDF Resmi</span>
                </button>
              </div>
            </div>

            {/* Summary KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 bg-white text-xs">
              <div className="p-3.5">
                <span className="text-[11px] text-slate-500 block">Rata-rata Capaian Saat Ini</span>
                <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {gapSummary.avgCurrent.toFixed(1)}%
                </span>
              </div>
              <div className="p-3.5">
                <span className="text-[11px] text-slate-500 block">Rata-rata Target Kurikulum</span>
                <span className="text-lg font-bold font-mono tabular-nums text-blue-700">
                  {gapSummary.avgTarget.toFixed(1)}%
                </span>
              </div>
              <div className="p-3.5">
                <span className="text-[11px] text-slate-500 block">Selisih / Gap Rata-rata</span>
                <span className={`text-lg font-bold font-mono tabular-nums ${
                  gapSummary.avgGap >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {gapSummary.avgGap >= 0 ? '+' : ''}{gapSummary.avgGap.toFixed(1)}%
                </span>
              </div>
              <div className="p-3.5">
                <span className="text-[11px] text-slate-500 block">Butir CPL Memenuhi Target</span>
                <span className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                  {gapSummary.meetingCount} / {gapAnalysisRows.length} CPL
                </span>
              </div>
            </div>

            {/* Gap Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold w-20">Kode CPL</th>
                    <th className="py-2.5 px-3 font-bold min-w-[200px]">Ranah &amp; Kompetensi Lulusan</th>
                    <th className="py-2.5 px-3 font-bold text-right w-28">Capaian Saat Ini</th>
                    <th className="py-2.5 px-3 font-bold text-right w-28">Target OBE</th>
                    <th className="py-2.5 px-3 font-bold text-right w-24">Gap / Selisih</th>
                    <th className="py-2.5 px-3 font-bold text-center w-28">Cakupan MK</th>
                    <th className="py-2.5 px-3 font-bold text-center w-36">Status</th>
                    <th className="py-2.5 px-3 font-bold min-w-[220px]">Rekomendasi Tindak Lanjut (CQI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gapAnalysisRows.map(row => (
                    <tr key={row.kode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {row.kode}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{row.judul}</div>
                        <div className="text-[10px] text-slate-500">{row.ranah}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                        {row.capaianSaatIni.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-600">
                        {row.targetKurikulum.toFixed(1)}%
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold tabular-nums ${
                        row.gap >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {row.gap >= 0 ? '+' : ''}{row.gap.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] tabular-nums text-slate-700 whitespace-nowrap">
                        {row.strongCount}S · {row.mediumCount}M · {row.lowCount}L
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          row.statusVariant === 'exceed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : row.statusVariant === 'meet'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600 leading-relaxed">
                        {row.rekomendasiCqi}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
                    <td className="py-2.5 px-3 font-mono text-[11px]">RATA-RATA</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      Evaluasi {gapAnalysisRows.length} Butir CPL Kurikulum OBE
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {gapSummary.avgCurrent.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-blue-700">
                      {gapSummary.avgTarget.toFixed(1)}%
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono tabular-nums ${
                      gapSummary.avgGap >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {gapSummary.avgGap >= 0 ? '+' : ''}{gapSummary.avgGap.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] tabular-nums text-slate-700 whitespace-nowrap">
                      {gapAnalysisRows.reduce((s, r) => s + r.strongCount, 0)}S ·{' '}
                      {gapAnalysisRows.reduce((s, r) => s + r.mediumCount, 0)}M ·{' '}
                      {gapAnalysisRows.reduce((s, r) => s + r.lowCount, 0)}L
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] tabular-nums text-emerald-700">
                      {gapSummary.meetingCount}/{gapAnalysisRows.length} Memenuhi
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500 font-normal">
                      Siklus Penjaminan Mutu Internal GPMF FT UNBARI
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {borang.cplList.map((cpl) => (
              <div 
                key={cpl.kode}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                      {cpl.kode}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium ml-2">
                      {cpl.ranah}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {cpl.status}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {cpl.deskripsi}
                </p>

                {/* Progress bar Target vs Realisasi */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Target: {cpl.targetPersen}%</span>
                    <span className="font-bold text-emerald-700">Realisasi: {cpl.realisasiPersen}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                    {/* Target line indicator */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10" 
                      style={{ left: `${cpl.targetPersen}%` }}
                      title={`Target ${cpl.targetPersen}%`}
                    />
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(cpl.realisasiPersen, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Mata Kuliah Pendukung */}
                <div className="pt-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Mata Kuliah Pengukur CPMK:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-600">
                    {cpl.mataKuliahPendukung.map((mk, i) => (
                      <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded">
                        {mk}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Spider-Chart Sebaran Capaian CPL Agregat per Angkatan Mahasiswa */}
          <CplSpiderChartAngkatanView
            selectedProdi={selectedProdi}
            onShowToast={onShowToast}
          />

          {/* MATRIKS KONTRIBUSI CPL PER MATA KULIAH (FILTER PER BAGIAN BORANG) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3 bg-slate-50/70">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Matriks Kontribusi CPL per Mata Kuliah (Filter Bagian Borang)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Saring mata kuliah berdasarkan Semester (1–8) atau Kelompok (Wajib vs Pilihan) sebelum mengekspor bagian borang akreditasi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('matriks_cpl_cpmk')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit Relasi S/M/L</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMatrixExcel}
                    disabled={filteredMatrixCourses.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMatrixPdfModalOpen(true)}
                    disabled={filteredMatrixCourses.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Ekspor PDF Bagian Ini</span>
                  </button>
                </div>
              </div>

              {/* Filter Controls: Search, Kelompok (Wajib vs Pilihan) & Semester (1-8, B, K, Lintas) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
                {/* Segmented Kelompok Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                    {([
                      { id: 'ALL', label: `Semua (${prodiMatrixCourses.length})` },
                      {
                        id: 'Wajib',
                        label: `Wajib (${prodiMatrixCourses.filter(c => (c.kelompokKurikulum || (c.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib')) === 'Wajib').length})`
                      },
                      {
                        id: 'Pilihan',
                        label: `Pilihan (${prodiMatrixCourses.filter(c => (c.kelompokKurikulum || (c.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib')) === 'Pilihan').length})`
                      }
                    ] as const).map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMatrixKelompokFilter(opt.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          matrixKelompokFilter === opt.id
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={matrixSearchQuery}
                      onChange={(e) => setMatrixSearchQuery(e.target.value)}
                      placeholder="Cari kode / nama MK..."
                      aria-label="Cari mata kuliah pada filter matriks CPL"
                      className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                  </div>
                </div>

                {/* Semester 1-8 Buttons + Full Dropdown */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex flex-wrap items-center gap-1">
                    {['ALL', '1', '2', '3', '4', '5', '6', '7', '8'].map(sem => (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => setMatrixSemesterFilter(sem)}
                        className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          matrixSemesterFilter === sem
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sem === 'ALL' ? 'Semua Sem' : `S${sem}`}
                      </button>
                    ))}
                  </div>

                  <select
                    value={matrixSemesterFilter}
                    onChange={(e) => setMatrixSemesterFilter(e.target.value)}
                    aria-label="Filter semester matriks kontribusi CPL"
                    className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <option value="LAINNYA">Lintas (-)</option>
                  </select>

                  {hasMatrixFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setMatrixSemesterFilter('ALL');
                        setMatrixKelompokFilter('ALL');
                        setMatrixSearchQuery('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>
                  Cakupan aktif: <strong className="text-slate-800">{matrixScopeLabel}</strong>
                </span>
                <span className="font-mono tabular-nums text-slate-700 font-semibold">
                  {filteredMatrixCourses.length} dari {prodiMatrixCourses.length} MK · {filteredMatrixCourses.reduce((s, c) => s + c.sks, 0)} SKS
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3 text-center w-10 font-bold">No</th>
                    <th className="py-2.5 px-3 w-24 font-bold">Kode</th>
                    <th className="py-2.5 px-3 min-w-[200px] font-bold">Nama Mata Kuliah</th>
                    <th className="py-2.5 px-2 text-center w-12 font-bold">SKS</th>
                    <th className="py-2.5 px-2 text-center w-12 font-bold">Sem</th>
                    <th className="py-2.5 px-3 text-center w-24 font-bold">Kelompok</th>
                    {activeCplsObe.map(cpl => (
                      <th key={cpl.kode} className="py-2.5 px-2 text-center w-14 font-bold border-l border-slate-200" title={cpl.judul}>
                        {cpl.kode}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMatrixCourses.length === 0 ? (
                    <tr>
                      <td colSpan={6 + activeCplsObe.length} className="py-10 text-center text-slate-500">
                        <div>Tidak ada mata kuliah yang sesuai dengan filter semester / kelompok yang dipilih.</div>
                        {hasMatrixFilter && (
                          <button
                            type="button"
                            onClick={() => {
                              setMatrixSemesterFilter('ALL');
                              setMatrixKelompokFilter('ALL');
                              setMatrixSearchQuery('');
                            }}
                            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Tampilkan Seluruh Mata Kuliah</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredMatrixCourses.map((course, idx) => {
                      const semDisplay = course.semesterLabel || (course.semester > 0 ? String(course.semester).padStart(2, '0') : '-');
                      const kelompok = course.kelompokKurikulum || (course.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib');
                      const courseAudit = courseAuditById.get(course.id);
                      const isFlaggedBelow70 = courseAudit && courseAudit.auditStatus !== 'MEMENUHI_STANDAR';
                      return (
                        <tr
                          key={course.id}
                          className={`transition-colors ${
                            courseAudit?.auditStatus === 'KRITIS_BAWAH_70'
                              ? 'bg-rose-50/45 hover:bg-rose-50/80'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono tabular-nums text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">{course.kodeMK}</td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-900">{course.namaMK}</div>
                            {isFlaggedBelow70 && courseAudit && (
                              <button
                                type="button"
                                onClick={() => setSelectedAuditCourse(courseAudit)}
                                className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                  courseAudit.auditStatus === 'KRITIS_BAWAH_70'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                }`}
                                title="Klik untuk melihat detail audit CPL <70% dan saran perbaikan RPS"
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>
                                  Audit: {courseAudit.avgContributionPercent.toFixed(1)}% ({courseAudit.statusLabel}) — Lihat Saran RPS
                                </span>
                              </button>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-700">{course.sks}</td>
                          <td className="py-2 px-2 text-center font-mono tabular-nums text-slate-700">{semDisplay}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                              kelompok === 'Pilihan'
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              {kelompok}
                            </span>
                          </td>
                          {activeCplsObe.map(cpl => {
                            const lvl = course.pemetaanCpl[cpl.kode] || 'None';
                            const style = getKontribusiBadgeStyle(lvl);
                            return (
                              <td key={cpl.kode} className="py-2 px-1 text-center border-l border-slate-100">
                                <span className={`inline-flex items-center justify-center w-7 h-6 rounded text-[11px] font-bold ${style.bgClass}`}>
                                  {style.short}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {filteredMatrixCourses.length > 0 && (
                  <tfoot className="sticky bottom-0 z-10">
                    <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                      <td colSpan={3} className="py-2 px-3 text-right text-[11px]">
                        Rekap Bagian Terfilter ({filteredMatrixCourses.length} MK) — Sebaran S / M / L:
                      </td>
                      <td className="py-2 px-2 text-center font-mono tabular-nums text-blue-800">
                        {filteredMatrixCourses.reduce((s, c) => s + c.sks, 0)}
                      </td>
                      <td colSpan={2} className="py-2 px-2 text-center text-[10px] text-slate-500">
                        S / M / L
                      </td>
                      {activeCplsObe.map(cpl => {
                        const s = filteredMatrixCourses.filter(m => m.pemetaanCpl[cpl.kode] === 'Strong').length;
                        const m = filteredMatrixCourses.filter(m => m.pemetaanCpl[cpl.kode] === 'Medium').length;
                        const l = filteredMatrixCourses.filter(m => m.pemetaanCpl[cpl.kode] === 'Low').length;
                        return (
                          <td
                            key={cpl.kode}
                            className="py-2 px-1 text-center font-mono tabular-nums text-[10px] border-l border-slate-200 text-slate-700"
                            title={`${cpl.kode}: ${s} Strong, ${m} Medium, ${l} Low`}
                          >
                            {s}/{m}/{l}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Quick CTA to Full Interactive Matrix */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-blue-950 uppercase tracking-wide">
                  Tabel Matriks Kontribusi Mata Kuliah &amp; CPMK (S / M / L)
                </h4>
                <p className="text-[11px] text-blue-700">
                  Lakukan pemetaan derajat kontribusi Strong, Medium, dan Low antar-mata kuliah dengan indikator gap kurikulum LAM-Teknik.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('matriks_cpl_cpmk')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Buka Editor Matriks Interaktif</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB: AUDIT OTOMATIS KONTRIBUSI CPL < 70% & SARAN PERBAIKAN RPS */}
      {activeSubTab === 'audit_rps' && (
        <div className="space-y-5">
          {/* Header Audit Summary */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Audit Otomatis Kontribusi CPL (&lt; {MIN_CPL_COURSE_STANDARD_PERCENT}%) &amp; Rekomendasi Perbaikan RPS
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Sistem mengevaluasi seluruh mata kuliah pada {selectedProdi.nama} terhadap ambang batas minimum kontribusi CPL{' '}
                    <strong>{MIN_CPL_COURSE_STANDARD_PERCENT}%</strong>, menandai mata kuliah atau butir CPL di bawah standar, serta menyusun saran revisi RPS per CPMK dan metode asesmen.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab('matriks_cpl_cpmk')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Perbaiki Pemetaan Matriks CPL</span>
              </button>
            </div>

            {/* 4 Hairline Audit KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white text-xs">
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Total Mata Kuliah Diaudit</span>
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
                  {auditSummary.totalCourses} MK
                </span>
                <span className="text-[10px] text-slate-500">Kurikulum aktif {selectedProdi.singkatan}</span>
              </div>

              <button
                type="button"
                onClick={() => setAuditStatusFilter('KRITIS_BAWAH_70')}
                className="p-4 text-left bg-rose-50/60 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-rose-800 font-medium block">
                  Rata-rata MK &lt; 70% (Kritis)
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-0.5 block">
                  {auditSummary.criticalCount} MK
                </span>
                <span className="text-[10px] text-rose-700 font-semibold">
                  Wajib revisi RPS &amp; bobot asesmen
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAuditStatusFilter('PENGUATAN_BUTIR_70')}
                className="p-4 text-left bg-amber-50/60 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-amber-800 font-medium block">
                  Memiliki Butir CPL &lt; 70%
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-amber-700 mt-0.5 block">
                  {auditSummary.strengthenCount} MK
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">
                  Rata-rata ≥70%, ada butir lemah
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAuditStatusFilter('MEMENUHI_STANDAR')}
                className="p-4 text-left bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-emerald-800 font-medium block">
                  Lulus Audit Standar (≥ 70%)
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
                  {auditSummary.passingCount} MK
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  {Math.round(
                    (auditSummary.passingCount / Math.max(1, auditSummary.totalCourses)) * 100
                  )}
                  % memenuhi seluruh butir
                </span>
              </button>
            </div>
          </div>

          {/* Audit Filters & Result Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {([
                  { id: 'FLAGGED', label: `Terkena Audit <70% (${auditSummary.totalFlagged})` },
                  { id: 'KRITIS_BAWAH_70', label: `Rata-rata <70% (${auditSummary.criticalCount})` },
                  { id: 'PENGUATAN_BUTIR_70', label: `Butir <70% (${auditSummary.strengthenCount})` },
                  { id: 'MEMENUHI_STANDAR', label: `Memenuhi ≥70% (${auditSummary.passingCount})` },
                  { id: 'ALL', label: `Semua (${auditSummary.totalCourses})` }
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAuditStatusFilter(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      auditStatusFilter === opt.id
                        ? opt.id === 'KRITIS_BAWAH_70' || opt.id === 'FLAGGED'
                          ? 'bg-rose-700 text-white border-rose-700'
                          : 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={matrixSemesterFilter}
                  onChange={e => setMatrixSemesterFilter(e.target.value)}
                  aria-label="Filter semester audit RPS"
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
                >
                  <option value="ALL">Semua Sem</option>
                  {['1', '2', '3', '4', '5', '6', '7', '8'].map(s => (
                    <option key={s} value={s}>
                      Sem 0{s}
                    </option>
                  ))}
                </select>

                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={matrixSearchQuery}
                    onChange={e => setMatrixSearchQuery(e.target.value)}
                    placeholder="Cari kode / nama MK..."
                    aria-label="Cari mata kuliah pada tabel audit CPL"
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center font-bold">No</th>
                    <th className="py-2.5 px-3 min-w-[220px] font-bold">Mata Kuliah &amp; Pengampu</th>
                    <th className="py-2.5 px-3 w-36 font-bold">Skor CPL (Min 70%)</th>
                    <th className="py-2.5 px-3 min-w-[160px] font-bold">Butir CPL &lt; 70%</th>
                    <th className="py-2.5 px-3 w-32 font-bold">Status Audit</th>
                    <th className="py-2.5 px-3 min-w-[260px] font-bold">Saran Perbaikan RPS Utama</th>
                    <th className="py-2.5 px-3 w-32 text-center font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        Tidak ada mata kuliah pada kategori filter audit saat ini.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditResults.map((item, idx) => {
                      const c = item.course;
                      const isCritical = item.auditStatus === 'KRITIS_BAWAH_70';
                      const isWarn = item.auditStatus === 'PENGUATAN_BUTIR_70';
                      const semDisplay =
                        c.semesterLabel || (c.semester > 0 ? String(c.semester).padStart(2, '0') : '-');
                      const primarySuggestion = item.suggestions[0];

                      return (
                        <tr
                          key={c.id}
                          className={`transition-colors ${
                            isCritical
                              ? 'bg-rose-50/45 hover:bg-rose-50/80'
                              : isWarn
                              ? 'bg-amber-50/35 hover:bg-amber-50/70'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-blue-900">{c.kodeMK}</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                · Sem {semDisplay} · {c.sks} SKS
                              </span>
                            </div>
                            <div className="font-bold text-slate-900 mt-0.5">{c.namaMK}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {c.dosenPengampu} · Bloom Maks: <strong>{item.highestBloomLabel}</strong>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center justify-between font-mono tabular-nums text-xs mb-1">
                              <span
                                className={`font-bold ${
                                  item.avgContributionPercent < 70
                                    ? 'text-rose-700'
                                    : isWarn
                                    ? 'text-amber-700'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {item.avgContributionPercent.toFixed(1)}%
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {item.strongCount}S/{item.mediumCount}M/{item.lowCount}L
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                                style={{ left: '70%' }}
                                title="Standar Minimum 70%"
                              />
                              <div
                                className={`h-full rounded-full ${
                                  item.avgContributionPercent < 70
                                    ? 'bg-rose-600'
                                    : isWarn
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-600'
                                }`}
                                style={{ width: `${Math.min(100, item.avgContributionPercent)}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            {item.belowMinimumCpls.length === 0 ? (
                              <span className="text-[11px] text-emerald-700 font-medium">
                                Semua butir ≥ 70%
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {item.belowMinimumCpls.map(b => (
                                  <span
                                    key={b.kode}
                                    className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-mono text-[10px] font-bold tabular-nums"
                                    title={`${b.judul}: ${b.scorePercent}% (-${b.deficitFrom70}% di bawah 70%)`}
                                  >
                                    {b.kode} ({b.scorePercent.toFixed(1)}%)
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
                                isCritical
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : isWarn
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              {item.auditStatus === 'MEMENUHI_STANDAR' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              <span>{item.statusLabel}</span>
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            {primarySuggestion && (
                              <div className="text-[11px] text-slate-700 leading-relaxed">
                                <span className="font-bold text-slate-900">
                                  [{primarySuggestion.kategori}]
                                </span>{' '}
                                {primarySuggestion.rekomendasi}
                                {item.suggestions.length > 1 && (
                                  <span className="text-blue-700 font-semibold ml-1">
                                    (+{item.suggestions.length - 1} saran RPS)
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedAuditCourse(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Saran RPS</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: AUDIT KINERJA RPS (CAPAIAN CPL VS TARGET RPS & RADAR CHART KESENJANGAN) */}
      {activeSubTab === 'audit_kinerja_rps' && (
        <div className="space-y-5">
          {/* Header & KPI Strip */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Audit Kinerja RPS: Pemindaian Silang Target CPL Prodi × Metode Asesmen &amp; Radar Kesenjangan
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Pemindaian silang otomatis antara <strong>Target CPL Prodi</strong>, <strong>Metode Asesmen pada RPS Mata Kuliah</strong>, dan <strong>Realisasi Lapangan</strong> di {selectedProdi.nama} menjadi <strong>Skor Kualitas (1–100)</strong> (dipindai pukul <span className="font-mono tabular-nums">{lastCrossScanTime}</span>).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRunCrossScan}
                  disabled={isRunningCrossScan}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileSearch className={`w-3.5 h-3.5 ${isRunningCrossScan ? 'animate-spin' : ''}`} />
                  <span>{isRunningCrossScan ? 'Memindai Silang...' : 'Pindai Silang CPL × Asesmen'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem(
                        RPS_PERF_TARGETS_STORAGE_KEY,
                        JSON.stringify(rpsTargetOverridesByProdi)
                      );
                    } catch {}
                    if (onShowToast) {
                      onShowToast(
                        `Kalibrasi target RPS ${selectedProdi.singkatan} tersimpan & disinkronkan ke Audit Kinerja.`
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Target RPS</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetRpsTargetOverrides}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* 4 Hairline Summary KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white text-xs">
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Rata-rata Realisasi vs Target RPS</span>
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
                  {rpsPerfReport.avgRealisasiLapangan.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                  Target RPS {rpsPerfReport.avgTargetRps.toFixed(1)}% · Kurikulum {rpsPerfReport.avgTargetKurikulum.toFixed(1)}%
                </span>
              </div>

              <div
                className={`p-4 ${
                  rpsPerfReport.avgGapVsTargetRps < 0 ? 'bg-rose-50/50' : 'bg-emerald-50/40'
                }`}
              >
                <span className="text-[11px] text-slate-600 font-medium block">
                  Kesenjangan (Realisasi vs RPS)
                </span>
                <span
                  className={`text-xl font-bold font-mono tabular-nums mt-0.5 block ${
                    rpsPerfReport.avgGapVsTargetRps >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {rpsPerfReport.avgGapVsTargetRps >= 0 ? '+' : ''}
                  {rpsPerfReport.avgGapVsTargetRps.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-600 font-mono tabular-nums">
                  {rpsPerfReport.compliantCplCount}/{rpsPerfReport.cplItems.length} CPL memenuhi target
                </span>
              </div>

              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">
                  Skor Kualitas Keselarasan (1–100)
                </span>
                <span
                  className={`text-xl font-bold font-mono tabular-nums mt-0.5 block ${
                    rpsPerfReport.avgKeselarasanSkor >= 75
                      ? 'text-indigo-800'
                      : rpsPerfReport.avgKeselarasanSkor >= 60
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {rpsPerfReport.avgKeselarasanSkor}
                  <span className="text-xs font-normal text-slate-500">/100</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                  {rpsPerfReport.alignedAlignmentCourseCount} dari {rpsPerfReport.courseItems.length} MK selaras OBE (≥75)
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPerfStatusFilter('NEEDS_ADJUSTMENT');
                  perfCrossScanTableRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
                className={`p-4 text-left transition-colors cursor-pointer ${
                  rpsPerfReport.criticalAdjustmentCourseCount > 0
                    ? 'bg-rose-50/55 hover:bg-rose-50'
                    : rpsPerfReport.needsAdjustmentCourseCount > 0
                    ? 'bg-amber-50/55 hover:bg-amber-50'
                    : 'bg-emerald-50/40 hover:bg-emerald-50'
                }`}
              >
                <span className="text-[11px] text-slate-600 font-medium flex items-center justify-between gap-2">
                  <span>Sorotan Perlu Penyesuaian</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </span>
                <span
                  className={`text-xl font-bold font-mono tabular-nums mt-0.5 block ${
                    rpsPerfReport.criticalAdjustmentCourseCount > 0
                      ? 'text-rose-700'
                      : rpsPerfReport.needsAdjustmentCourseCount > 0
                      ? 'text-amber-800'
                      : 'text-emerald-700'
                  }`}
                >
                  {rpsPerfReport.needsAdjustmentCourseCount} MK
                </span>
                <span className="text-[10px] text-slate-600 font-mono tabular-nums">
                  {rpsPerfReport.criticalAdjustmentCourseCount} prioritas revisi (&lt;60) · Klik untuk sorot
                </span>
              </button>
            </div>
          </div>

          {/* Radar Chart Kesenjangan + Inspector & Target Calibrator */}
          <div ref={perfRadarRef} className="grid grid-cols-1 lg:grid-cols-12 gap-5 scroll-mt-4">
            {/* Radar Chart Canvas */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-700" />
                    <span>Radar Chart Kesenjangan Target Kurikulum vs Realisasi Lapangan</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {perfRadarMode === 'prodi_cpl'
                      ? `Perbandingan poligon Target Kurikulum OBE, Target RPS, dan Realisasi Lapangan di ${selectedProdi.singkatan}.`
                      : `Target CPL Kurikulum vs Realisasi Asesmen RPS pada mata kuliah ${selectedPerfCourse?.course.kodeMK || ''} (${selectedPerfCourse?.course.namaMK || ''}).`}
                  </p>
                </div>

                {/* Mode Switch: Agregat Prodi vs Per Mata Kuliah */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setPerfRadarMode('prodi_cpl')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      perfRadarMode === 'prodi_cpl'
                        ? 'bg-white text-indigo-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Agregat Prodi
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerfRadarMode('per_mk')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      perfRadarMode === 'per_mk'
                        ? 'bg-white text-indigo-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Per Mata Kuliah
                  </button>
                </div>
              </div>

              {perfRadarMode === 'per_mk' && rpsPerfReport.courseItems.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                  <label
                    htmlFor="select-perf-course-radar"
                    className="font-semibold text-slate-700 whitespace-nowrap"
                  >
                    Pilih Mata Kuliah / RPS:
                  </label>
                  <select
                    id="select-perf-course-radar"
                    value={selectedPerfCourse?.course.id || ''}
                    onChange={e => setSelectedPerfCourseId(e.target.value)}
                    className="w-full sm:max-w-md px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                  >
                    {rpsPerfReport.courseItems.map(item => (
                      <option key={item.course.id} value={item.course.id}>
                        {item.course.kodeMK} - {item.course.namaMK} (Gap {item.gapPersen >= 0 ? '+' : ''}
                        {item.gapPersen.toFixed(1)}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="h-[340px] sm:h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="74%"
                    data={
                      perfRadarMode === 'prodi_cpl'
                        ? rpsPerfReport.cplItems.map(item => ({
                            subject: item.kode,
                            fullJudul: item.judul,
                            targetKurikulum: item.targetKurikulumPersen,
                            targetRps: item.targetRpsPersen,
                            realisasiLapangan: item.realisasiLapanganPersen,
                            gap: item.gapVsTargetRps
                          }))
                        : (selectedPerfCourse?.radarPoints || []).map(pt => ({
                            subject: pt.cplKode,
                            fullJudul: pt.judul,
                            targetKurikulum: pt.targetKurikulum,
                            targetRps: pt.targetRps,
                            realisasiLapangan: pt.realisasiLapangan,
                            gap: pt.gapVsTargetRps
                          }))
                    }
                  >
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[45, 100]}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickFormatter={v => `${v}%`}
                    />
                    <Radar
                      name="Target Kurikulum OBE (%)"
                      dataKey="targetKurikulum"
                      stroke="#64748b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fill="#94a3b8"
                      fillOpacity={0.12}
                    />
                    <Radar
                      name="Target RPS (%)"
                      dataKey="targetRps"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fill="#3b82f6"
                      fillOpacity={0.18}
                    />
                    <Radar
                      name="Realisasi CPL di Lapangan (%)"
                      dataKey="realisasiLapangan"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fill="#10b981"
                      fillOpacity={0.35}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null;
                        const row = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white rounded-xl shadow-xl p-3 text-xs space-y-1.5 border border-slate-700 min-w-[230px]">
                            <div className="font-bold border-b border-slate-700 pb-1">
                              {row.subject}: {row.fullJudul}
                            </div>
                            <div className="flex justify-between gap-4 text-slate-300">
                              <span>Target Kurikulum OBE:</span>
                              <strong className="font-mono tabular-nums">{row.targetKurikulum}%</strong>
                            </div>
                            <div className="flex justify-between gap-4 text-blue-300">
                              <span>Target RPS:</span>
                              <strong className="font-mono tabular-nums">{row.targetRps}%</strong>
                            </div>
                            <div className="flex justify-between gap-4 text-emerald-300">
                              <span>Realisasi di Lapangan:</span>
                              <strong className="font-mono tabular-nums">{row.realisasiLapangan}%</strong>
                            </div>
                            <div className="pt-1 border-t border-slate-700 flex justify-between gap-4">
                              <span className="text-slate-300">Kesenjangan vs Target RPS:</span>
                              <strong
                                className={`font-mono tabular-nums ${
                                  row.gap >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {row.gap >= 0 ? '+' : ''}
                                {Number(row.gap).toFixed(1)}%
                              </strong>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Column: Gap Analysis Insights & Live RPS Target Calibration */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="pb-2 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">
                    Diagnosa Kesenjangan &amp; Kalibrasi Target RPS
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sesuaikan target RPS per butir CPL untuk melihat perubahan kesenjangan pada grafik radar secara real-time.
                  </p>
                </div>

                {/* Strongest & Weakest Gap Highlights */}
                {rpsPerfReport.weakestCpl && (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      rpsPerfReport.weakestCpl.gapVsTargetRps < 0
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-emerald-50/60 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {rpsPerfReport.weakestCpl.gapVsTargetRps < 0
                          ? 'Prioritas Penutupan Kesenjangan'
                          : 'Butir CPL Terketat'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold tabular-nums ${
                          rpsPerfReport.weakestCpl.gapVsTargetRps < 0
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {rpsPerfReport.weakestCpl.kode}:{' '}
                        {rpsPerfReport.weakestCpl.gapVsTargetRps >= 0 ? '+' : ''}
                        {rpsPerfReport.weakestCpl.gapVsTargetRps.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-800">
                      {rpsPerfReport.weakestCpl.judul}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {rpsPerfReport.weakestCpl.rekomendasiCqi}
                    </p>
                  </div>
                )}

                {/* Per-CPL Target RPS Interactive Calibration Sliders */}
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {rpsPerfReport.cplItems.map(item => {
                    const isDeficit = item.gapVsTargetRps < 0;
                    return (
                      <div
                        key={item.kode}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-blue-900">{item.kode}</span>
                            <span className="text-slate-700 font-medium ml-1.5 truncate">
                              {item.judul}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-[11px] font-bold tabular-nums shrink-0 ${
                              isDeficit ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            {item.gapVsTargetRps >= 0 ? '+' : ''}
                            {item.gapVsTargetRps.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono tabular-nums">
                            Target RPS: <strong className="text-blue-800">{item.targetRpsPersen}%</strong>
                          </span>
                          <input
                            type="range"
                            min={60}
                            max={95}
                            step={1}
                            value={Math.round(item.targetRpsPersen)}
                            aria-label={`Target RPS ${item.kode}`}
                            onChange={e =>
                              handleUpdateRpsTargetOverride(item.kode, Number(e.target.value))
                            }
                            className="w-full accent-blue-600 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-600 whitespace-nowrap font-mono tabular-nums">
                            Riil: <strong className="text-emerald-700">{item.realisasiLapanganPersen}%</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Per-CPL Performance Audit Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Matriks Perbandingan Capaian CPL Lapangan vs Target RPS per Butir CPL
                </h4>
                <p className="text-[11px] text-slate-500">
                  Evaluasi tingkat ketercapaian masing-masing butir CPL terhadap target RPS dan kurikulum {selectedProdi.nama}.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-600 font-semibold">
                {rpsPerfReport.cplItems.length} Butir CPL Aktif
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold w-24">Kode CPL</th>
                    <th className="py-2.5 px-3 font-bold min-w-[200px]">Kompetensi &amp; Ranah</th>
                    <th className="py-2.5 px-3 font-bold text-center w-28">Target Kurikulum</th>
                    <th className="py-2.5 px-3 font-bold text-center w-24">Target RPS</th>
                    <th className="py-2.5 px-3 font-bold text-center w-28">Realisasi Lapangan</th>
                    <th className="py-2.5 px-3 font-bold text-center w-28">Kesenjangan (Gap)</th>
                    <th className="py-2.5 px-3 font-bold w-36">Status Kinerja</th>
                    <th className="py-2.5 px-3 font-bold min-w-[260px]">Rekomendasi CQI Lapangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rpsPerfReport.cplItems.map(item => {
                    const statusBadgeClass: Record<RpsPerformanceStatus, string> = {
                      MELAMPAUI_TARGET: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                      SESUAI_TARGET: 'bg-blue-100 text-blue-800 border-blue-300',
                      PERHATIAN: 'bg-amber-100 text-amber-800 border-amber-300',
                      KESENJANGAN_KRITIS: 'bg-rose-100 text-rose-800 border-rose-300'
                    };
                    return (
                      <tr
                        key={item.kode}
                        className={
                          item.statusKinerja === 'KESENJANGAN_KRITIS'
                            ? 'bg-rose-50/40'
                            : item.statusKinerja === 'PERHATIAN'
                            ? 'bg-amber-50/30'
                            : 'hover:bg-slate-50/80'
                        }
                      >
                        <td className="py-3 px-3 font-mono font-bold text-blue-900">
                          {item.kode}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{item.judul}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.ranah} · {item.supportingCourseCount} MK ({item.strongSupportCount} Strong)
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold text-slate-700">
                          {item.targetKurikulumPersen.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-blue-700">
                          {item.targetRpsPersen.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-emerald-700">
                          {item.realisasiLapanganPersen.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-mono tabular-nums font-bold ${
                              item.gapVsTargetRps >= 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {item.gapVsTargetRps >= 0 ? '+' : ''}
                            {item.gapVsTargetRps.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
                              statusBadgeClass[item.statusKinerja]
                            }`}
                          >
                            {item.statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-700 leading-relaxed">
                          {item.rekomendasiCqi}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Skor Kualitas Keselarasan (1-100): Pemindaian Silang Target CPL Prodi × Metode Asesmen RPS */}
          <div
            ref={perfCrossScanTableRef}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs scroll-mt-4"
          >
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-700" />
                    <span>
                      Tabel Skor Kualitas Keselarasan CPL Prodi × Metode Asesmen RPS (1–100)
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Hasil pemindaian silang keselarasan target CPL prodi terhadap instrumen asesmen tiap RPS. Baris tersorot menandakan mata kuliah yang <strong>memerlukan penyesuaian</strong> metode asesmen atau tautan CPMK.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="relative min-w-[210px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={perfSearchQuery}
                      onChange={e => setPerfSearchQuery(e.target.value)}
                      placeholder="Cari MK, dosen, CPL, asesmen..."
                      aria-label="Cari mata kuliah pada pemindaian silang RPS"
                      className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    />
                  </div>
                  <select
                    value={perfSortMode}
                    onChange={e =>
                      setPerfSortMode(e.target.value as 'SCORE_ASC' | 'SCORE_DESC' | 'GAP_ASC')
                    }
                    aria-label="Urutkan tabel skor kualitas keselarasan"
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
                  >
                    <option value="SCORE_ASC">Urut: Skor Terendah (Sorotan)</option>
                    <option value="SCORE_DESC">Urut: Skor Tertinggi</option>
                    <option value="GAP_ASC">Urut: Kesenjangan Terbesar</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                <div className="flex flex-wrap items-center gap-1.5">
                  {([
                    {
                      id: 'ALL',
                      label: `Semua MK (${rpsPerfReport.courseItems.length})`
                    },
                    {
                      id: 'NEEDS_ADJUSTMENT',
                      label: `Perlu Penyesuaian (${rpsPerfReport.needsAdjustmentCourseCount})`
                    },
                    {
                      id: 'PRIORITAS_REVISI',
                      label: `Prioritas Revisi <60 (${rpsPerfReport.criticalAdjustmentCourseCount})`
                    },
                    {
                      id: 'SELARAS',
                      label: `Selaras OBE ≥75 (${rpsPerfReport.alignedAlignmentCourseCount})`
                    },
                    {
                      id: 'GAP_ONLY',
                      label: `Gap Realisasi <0 (${rpsPerfReport.gapCourseCount})`
                    }
                  ] as const).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPerfStatusFilter(opt.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        perfStatusFilter === opt.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : opt.id === 'NEEDS_ADJUSTMENT' || opt.id === 'PRIORITAS_REVISI'
                          ? 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100/80'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-mono tabular-nums text-slate-500">
                  Menampilkan {filteredPerfCourses.length} dari {rpsPerfReport.courseItems.length} MK
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold min-w-[220px]">Mata Kuliah &amp; Pengampu</th>
                    <th className="py-2.5 px-3 font-bold min-w-[155px]">Cakupan CPL × Asesmen</th>
                    <th className="py-2.5 px-3 font-bold min-w-[175px]">Instrumen Asesmen RPS</th>
                    <th className="py-2.5 px-3 font-bold text-center w-28">Capaian vs Target</th>
                    <th className="py-2.5 px-3 font-bold w-40">Skor Kualitas (1–100)</th>
                    <th className="py-2.5 px-3 font-bold min-w-[230px]">Rekomendasi Penyesuaian</th>
                    <th className="py-2.5 px-3 font-bold text-right w-40">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {filteredPerfCourses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        Tidak ada mata kuliah yang sesuai dengan filter pemindaian silang saat ini.
                      </td>
                    </tr>
                  ) : (
                    filteredPerfCourses.map(item => {
                      const isExpanded = expandedCrossScanCourseId === item.course.id;
                      const isCritical = item.statusPenyesuaian === 'PRIORITAS_REVISI';
                      const isNeedsAdj = item.statusPenyesuaian === 'PERLU_PENYESUAIAN';
                      const rowSurfaceClass = isExpanded
                        ? 'bg-indigo-50/60'
                        : isCritical
                        ? 'bg-rose-50/55 hover:bg-rose-50/80'
                        : isNeedsAdj
                        ? 'bg-amber-50/45 hover:bg-amber-50/75'
                        : 'hover:bg-slate-50/80';

                      const meterColor = isCritical
                        ? 'bg-rose-600'
                        : isNeedsAdj
                        ? 'bg-amber-500'
                        : 'bg-emerald-600';

                      return (
                        <React.Fragment key={item.course.id}>
                          <tr className={`transition-colors ${rowSurfaceClass}`}>
                            <td className="py-3 px-3 align-top">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-bold text-blue-900">
                                  {item.course.kodeMK}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                                  · Sem {item.course.semesterLabel || item.course.semester} · {item.course.sks} SKS
                                </span>
                                {item.butuhPenyesuaian && (
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wide ${
                                      isCritical ? 'text-rose-700' : 'text-amber-800'
                                    }`}
                                  >
                                    · Sorotan Audit
                                  </span>
                                )}
                              </div>
                              <div className="font-semibold text-slate-900 mt-0.5">
                                {item.course.namaMK}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {item.course.dosenPengampu}
                              </div>
                            </td>

                            <td className="py-3 px-3 align-top">
                              <div className="font-mono tabular-nums text-xs font-bold text-slate-900">
                                {item.alignedCplCount}/{item.totalMappedCplCount} CPL Selaras
                              </div>
                              {item.mismatchedCplCodes.length > 0 ? (
                                <div className="text-[11px] mt-0.5 text-rose-700 font-medium">
                                  Perlu penyesuaian: {item.mismatchedCplCodes.join(', ')}
                                </div>
                              ) : (
                                <div className="text-[11px] mt-0.5 text-emerald-700 font-medium">
                                  Semua CPL utama terukur
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-3 align-top">
                              <div className="text-[11px] text-slate-800 font-medium leading-snug">
                                {item.detectedInstrumentLabels.length > 0
                                  ? item.detectedInstrumentLabels.join(' · ')
                                  : 'Belum teridentifikasi di CPMK'}
                              </div>
                              <div className="text-[10px] font-mono tabular-nums text-slate-500 mt-1">
                                Total bobot RPS: {item.totalBobotCpmkPersen}%
                                {Math.abs(item.totalBobotCpmkPersen - 100) > 2 && (
                                  <span className="text-rose-700 font-bold"> (≠100%)</span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-3 align-top text-center">
                              <div className="font-mono tabular-nums text-xs font-bold text-slate-900">
                                {item.realisasiCplPersen.toFixed(1)}%
                                <span className="text-[10px] font-normal text-slate-500">
                                  {' '}
                                  / {item.targetRpsPersen.toFixed(0)}%
                                </span>
                              </div>
                              <div
                                className={`font-mono tabular-nums text-[11px] font-bold mt-0.5 ${
                                  item.gapPersen >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                Gap {item.gapPersen >= 0 ? '+' : ''}
                                {item.gapPersen.toFixed(1)}%
                              </div>
                            </td>

                            <td className="py-3 px-3 align-top">
                              <div className="flex items-baseline justify-between gap-2">
                                <span
                                  className={`text-base font-extrabold font-mono tabular-nums ${
                                    isCritical
                                      ? 'text-rose-700'
                                      : isNeedsAdj
                                      ? 'text-amber-800'
                                      : 'text-emerald-700'
                                  }`}
                                >
                                  {item.keselarasanSkor}
                                  <span className="text-[10px] font-normal text-slate-500">/100</span>
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold whitespace-nowrap ${
                                    isCritical
                                      ? 'text-rose-700'
                                      : isNeedsAdj
                                      ? 'text-amber-800'
                                      : 'text-emerald-700'
                                  }`}
                                >
                                  {item.butuhPenyesuaian ? (
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                                  )}
                                  <span>{item.statusPenyesuaianLabel}</span>
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mt-1.5">
                                <div
                                  className={`h-full rounded-full transition-all ${meterColor}`}
                                  style={{ width: `${item.keselarasanSkor}%` }}
                                />
                              </div>
                            </td>

                            <td className="py-3 px-3 align-top text-[11px] text-slate-700 leading-relaxed">
                              {item.saranPenyesuaian}
                            </td>

                            <td className="py-3 px-3 align-top text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedCrossScanCourseId(prev =>
                                      prev === item.course.id ? null : item.course.id
                                    )
                                  }
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                    isExpanded
                                      ? 'bg-slate-900 text-white border-slate-900'
                                      : item.butuhPenyesuaian
                                      ? 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <FileSearch className="w-3 h-3" />
                                  <span>{isExpanded ? 'Tutup Matriks' : 'Detail Silang'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPerfCourseId(item.course.id);
                                    setPerfRadarMode('per_mk');
                                    perfRadarRef.current?.scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'start'
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                >
                                  <Target className="w-3 h-3" />
                                  <span>Lihat Radar MK</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-slate-50/90">
                              <td colSpan={7} className="p-4 border-t border-b border-indigo-200/80">
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                      <h5 className="text-xs font-bold text-slate-900">
                                        Hasil Pemindaian Silang Butir CPL Prodi × Asesmen RPS — {item.course.kodeMK} ({item.course.namaMK})
                                      </h5>
                                      <p className="text-[11px] text-slate-500">
                                        Memverifikasi setiap target CPL prodi terhadap tautan CPMK, bobot persen, dan kesesuaian instrumen asesmen pada RPS.
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedSmartRpsCourseId(item.course.id);
                                          setActiveSubTab('smart_rps_audit');
                                        }}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                      >
                                        <Wrench className="w-3 h-3" />
                                        <span>Sesuaikan Asesmen di Smart RPS</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setActiveSubTab('matriks_cpl_cpmk')}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        <span>Buka Matriks CPL-CPMK</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[11px] border-collapse">
                                      <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                                        <tr>
                                          <th className="py-2 px-3 font-bold w-24">Target CPL</th>
                                          <th className="py-2 px-3 font-bold min-w-[170px]">Ranah &amp; Kontribusi</th>
                                          <th className="py-2 px-3 font-bold w-32">Tautan CPMK</th>
                                          <th className="py-2 px-3 font-bold min-w-[170px]">Asesmen RPS vs Ideal</th>
                                          <th className="py-2 px-3 font-bold text-center w-24">Skor Butir</th>
                                          <th className="py-2 px-3 font-bold min-w-[220px]">Diagnosa Keselarasan</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {item.crossScanFindings.map(finding => {
                                          const isMisaligned = finding.statusKeselarasanButir !== 'SELARAS';
                                          return (
                                            <tr
                                              key={finding.cplKode}
                                              className={
                                                finding.statusKeselarasanButir === 'TIDAK_SELARAS'
                                                  ? 'bg-rose-50/45'
                                                  : finding.statusKeselarasanButir === 'PARSIAL'
                                                  ? 'bg-amber-50/40'
                                                  : ''
                                              }
                                            >
                                              <td className="py-2.5 px-3 font-mono font-bold text-blue-900 align-top">
                                                <div>{finding.cplKode}</div>
                                                <div className="text-[10px] font-normal text-slate-500 tabular-nums">
                                                  Tgt {finding.targetCplProdiPersen.toFixed(0)}%
                                                </div>
                                              </td>
                                              <td className="py-2.5 px-3 align-top">
                                                <div className="font-semibold text-slate-900">
                                                  {finding.cplJudul}
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                  {finding.ranah} · Kontribusi {finding.levelKontribusi}
                                                </div>
                                              </td>
                                              <td className="py-2.5 px-3 align-top font-mono tabular-nums">
                                                {finding.terhubungCpmk ? (
                                                  <div>
                                                    <span className="font-bold text-slate-800">
                                                      {finding.cpmkPendukung.join(', ')}
                                                    </span>
                                                    <div className="text-[10px] text-slate-500">
                                                      Bobot {finding.bobotAsesmenPersen}%
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <span className="text-rose-700 font-bold font-sans">
                                                    Belum tertaut CPMK
                                                  </span>
                                                )}
                                              </td>
                                              <td className="py-2.5 px-3 align-top">
                                                <div className="text-slate-800 font-medium">
                                                  RPS: {finding.metodeAsesmenTerkait.join(', ') || '-'}
                                                </div>
                                                <div className="text-[10px] text-indigo-700 mt-0.5">
                                                  Standar: {finding.instrumenIdeal}
                                                </div>
                                              </td>
                                              <td className="py-2.5 px-3 text-center align-top">
                                                <span
                                                  className={`font-mono tabular-nums font-bold ${
                                                    finding.statusKeselarasanButir === 'SELARAS'
                                                      ? 'text-emerald-700'
                                                      : finding.statusKeselarasanButir === 'PARSIAL'
                                                      ? 'text-amber-800'
                                                      : 'text-rose-700'
                                                  }`}
                                                >
                                                  {finding.skorButir}/100
                                                </span>
                                                <div
                                                  className={`text-[10px] font-bold mt-0.5 ${
                                                    isMisaligned ? 'text-rose-700' : 'text-emerald-700'
                                                  }`}
                                                >
                                                  {finding.statusKeselarasanButir === 'SELARAS'
                                                    ? 'Selaras'
                                                    : finding.statusKeselarasanButir === 'PARSIAL'
                                                    ? 'Parsial'
                                                    : 'Tidak Selaras'}
                                                </div>
                                              </td>
                                              <td className="py-2.5 px-3 align-top text-slate-700 leading-relaxed">
                                                {finding.catatanPemindaian}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: AUDIT KUALITAS RPS (KESELARASAN METODE PEMBELAJARAN VS CPL & SKOR OBE) */}
      {activeSubTab === 'audit_kualitas_rps' && (
        <div className="space-y-5">
          {/* Header & 4 KPI Strip */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Audit Kualitas RPS Berbasis Standar Outcome Based Education (OBE)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Verifikasi otomatis <em>Constructive Alignment</em> antara metode pembelajaran/asesmen pada RPS dengan ranah capaian CPL di {selectedProdi.nama}, lengkap dengan skor mutu visual (1–100) dan rekomendasi revisi spesifik.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('audit_kinerja_rps')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Radar Kinerja CPL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('matriks_cpl_cpmk')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Matriks CPMK &amp; Metode</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white text-xs">
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Skor Rata-rata Kualitas RPS</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold font-mono tabular-nums text-teal-700">
                    {rpsQualitySummary.avgQualityScore.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">/ 100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      rpsQualitySummary.avgQualityScore >= 85
                        ? 'bg-emerald-600'
                        : rpsQualitySummary.avgQualityScore >= 75
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, rpsQualitySummary.avgQualityScore)}%` }}
                  />
                </div>
              </div>

              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">RPS Selaras OBE (Skor &ge; 75)</span>
                <span className="text-xl font-bold font-mono tabular-nums text-blue-800 mt-0.5 block">
                  {rpsQualitySummary.alignedCourseRatePersen}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                  {rpsQualitySummary.unggulCount + rpsQualitySummary.selarasCount} dari{' '}
                  {rpsQualitySummary.totalCourses} MK
                </span>
              </div>

              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Adopsi Case Method / Project (IKU-7)</span>
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
                  {rpsQualitySummary.iku7AdoptionRatePersen}%
                </span>
                <span className="text-[10px] text-slate-500">
                  Pembelajaran berbasis kasus/proyek
                </span>
              </div>

              <button
                type="button"
                onClick={() => setQualityStatusFilter('NEEDS_REVISION')}
                className="p-4 text-left bg-amber-50/60 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-amber-800 font-medium block">
                  RPS Perlu Revisi Metode (&lt; 75)
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-amber-800 mt-0.5 block">
                  {rpsQualitySummary.revisiCount + rpsQualitySummary.kritisCount} MK
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">
                  Klik untuk menyaring MK bermasalah
                </span>
              </button>
            </div>
          </div>

          {/* 2-Column Visual Quality Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: 4 Pilar Skor OBE */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Skor Rata-rata 4 Pilar Kualitas RPS (OBE)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Capaian aktual program studi dibanding bobot maksimal standar OBE (total 100 poin)
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
                  4 Pilar OBE
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={[
                      {
                        pilar: 'Metode vs CPL',
                        capaian: Math.round(
                          (rpsQualitySummary.pillarAverages.metodeAlignment / 40) * 100
                        ),
                        skorAsli: `${rpsQualitySummary.pillarAverages.metodeAlignment}/40`
                      },
                      {
                        pilar: 'Taksonomi Bloom',
                        capaian: Math.round(
                          (rpsQualitySummary.pillarAverages.bloomAlignment / 25) * 100
                        ),
                        skorAsli: `${rpsQualitySummary.pillarAverages.bloomAlignment}/25`
                      },
                      {
                        pilar: 'Relasi CPMK–CPL',
                        capaian: Math.round(
                          (rpsQualitySummary.pillarAverages.cpmkMappingBalance / 20) * 100
                        ),
                        skorAsli: `${rpsQualitySummary.pillarAverages.cpmkMappingBalance}/20`
                      },
                      {
                        pilar: 'Instrumen OBE',
                        capaian: Math.round(
                          (rpsQualitySummary.pillarAverages.obeDocumentation / 15) * 100
                        ),
                        skorAsli: `${rpsQualitySummary.pillarAverages.obeDocumentation}/15`
                      }
                    ]}
                    margin={{ top: 12, right: 16, left: -12, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="pilar"
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickFormatter={v => `${v}%`}
                    />
                    <ReferenceLine
                      y={75}
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Standar Min OBE: 75%',
                        fill: '#dc2626',
                        fontSize: 10,
                        position: 'insideTopLeft'
                      }}
                    />
                    <RechartsTooltip
                      formatter={(val: any, _name: any, props: any) => [
                        `${val}% (Skor ${props?.payload?.skorAsli || ''})`,
                        'Pemenuhan Pilar'
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '10px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="capaian" name="Persentase Pemenuhan (%)" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {[
                        rpsQualitySummary.pillarAverages.metodeAlignment / 40,
                        rpsQualitySummary.pillarAverages.bloomAlignment / 25,
                        rpsQualitySummary.pillarAverages.cpmkMappingBalance / 20,
                        rpsQualitySummary.pillarAverages.obeDocumentation / 15
                      ].map((ratio, idx) => (
                        <Cell
                          key={`pillar-${idx}`}
                          fill={ratio >= 0.85 ? '#059669' : ratio >= 0.75 ? '#2563eb' : '#d97706'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Distribusi Grade Kualitas RPS */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Distribusi Predikat Mutu Kualitas RPS ({rpsQualitySummary.totalCourses} MK)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sebaran jumlah mata kuliah berdasarkan skor verifikasi metode pembelajaran vs CPL
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                  Skala 1–100
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={[
                      {
                        kategori: 'A: Unggul (≥85)',
                        jumlah: rpsQualitySummary.unggulCount,
                        fill: '#059669'
                      },
                      {
                        kategori: 'B: Selaras (75–84)',
                        jumlah: rpsQualitySummary.selarasCount,
                        fill: '#2563eb'
                      },
                      {
                        kategori: 'C: Revisi (60–74)',
                        jumlah: rpsQualitySummary.revisiCount,
                        fill: '#d97706'
                      },
                      {
                        kategori: 'D: Kritis (<60)',
                        jumlah: rpsQualitySummary.kritisCount,
                        fill: '#dc2626'
                      }
                    ]}
                    margin={{ top: 12, right: 16, left: -12, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="kategori"
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <RechartsTooltip
                      formatter={(val: any) => [`${val} Mata Kuliah`, 'Jumlah']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '10px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="jumlah" name="Jumlah MK" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {[
                        '#059669',
                        '#2563eb',
                        '#d97706',
                        '#dc2626'
                      ].map((color, idx) => (
                        <Cell key={`grade-${idx}`} fill={color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filter Bar & Verification Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {([
                  { id: 'ALL', label: `Semua (${rpsQualitySummary.totalCourses})` },
                  {
                    id: 'NEEDS_REVISION',
                    label: `Perlu Revisi <75 (${rpsQualitySummary.revisiCount + rpsQualitySummary.kritisCount})`
                  },
                  { id: 'UNGGUL_OBE', label: `Unggul ≥85 (${rpsQualitySummary.unggulCount})` },
                  { id: 'SELARAS_OBE', label: `Selaras 75–84 (${rpsQualitySummary.selarasCount})` }
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setQualityStatusFilter(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      qualityStatusFilter === opt.id
                        ? opt.id === 'NEEDS_REVISION'
                          ? 'bg-amber-700 text-white border-amber-700'
                          : 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={qualitySemFilter}
                  onChange={e => setQualitySemFilter(e.target.value)}
                  aria-label="Filter semester audit kualitas RPS"
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
                >
                  <option value="ALL">Semua Sem</option>
                  {['1', '2', '3', '4', '5', '6', '7', '8'].map(s => (
                    <option key={s} value={s}>
                      Sem 0{s}
                    </option>
                  ))}
                </select>

                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={qualitySearchQuery}
                    onChange={e => setQualitySearchQuery(e.target.value)}
                    placeholder="Cari kode / nama MK..."
                    aria-label="Cari mata kuliah pada audit kualitas RPS"
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold w-10 text-center">No</th>
                    <th className="py-2.5 px-3 font-bold min-w-[210px]">Mata Kuliah &amp; Pengampu</th>
                    <th className="py-2.5 px-3 font-bold min-w-[180px]">Metode Pembelajaran RPS</th>
                    <th className="py-2.5 px-3 font-bold w-40">Skor Kualitas Visual</th>
                    <th className="py-2.5 px-3 font-bold w-40">Verifikasi Metode vs CPL</th>
                    <th className="py-2.5 px-3 font-bold min-w-[250px]">Rekomendasi OBE Spesifik</th>
                    <th className="py-2.5 px-3 font-bold text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQualityCourses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        Tidak ada mata kuliah yang sesuai dengan filter Audit Kualitas RPS saat ini.
                      </td>
                    </tr>
                  ) : (
                    filteredQualityCourses.map((item, idx) => {
                      const c = item.course;
                      const primaryRec = item.recommendations[0];
                      const barColor =
                        item.totalScore >= 85
                          ? 'bg-emerald-600'
                          : item.totalScore >= 75
                          ? 'bg-blue-600'
                          : item.totalScore >= 60
                          ? 'bg-amber-500'
                          : 'bg-rose-600';
                      const gradeBadgeColor =
                        item.totalScore >= 85
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : item.totalScore >= 75
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : item.totalScore >= 60
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300';

                      return (
                        <tr
                          key={c.id}
                          className={`transition-colors ${
                            item.totalScore < 60
                              ? 'bg-rose-50/40 hover:bg-rose-50/70'
                              : item.totalScore < 75
                              ? 'bg-amber-50/30 hover:bg-amber-50/60'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-blue-900">
                              {c.kodeMK}{' '}
                              <span className="text-[10px] font-normal text-slate-500">
                                · Sem {c.semesterLabel || c.semester} · {c.sks} SKS
                              </span>
                            </div>
                            <div className="font-bold text-slate-900 mt-0.5">{c.namaMK}</div>
                            <div className="text-[11px] text-slate-500">
                              {c.dosenPengampu} · {item.highestBloom}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {item.detectedMethods.slice(0, 3).map(m => (
                                <span
                                  key={m}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                            {item.hasIku7Method ? (
                              <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700">
                                ✓ Sesuai IKU-7 (Case/Project)
                              </span>
                            ) : (
                              <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700">
                                ! Belum ada Case/Project IKU-7
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                {item.totalScore}/100
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${gradeBadgeColor}`}
                              >
                                {item.grade} · {item.statusLabel}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${barColor}`}
                                style={{ width: `${item.totalScore}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                                <span className="text-emerald-700 font-bold">
                                  {item.alignedCplCount} Selaras
                                </span>
                                {item.misalignedCplCount > 0 && (
                                  <span className="text-rose-700 font-bold">
                                    {item.misalignedCplCount} Mismatch
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {item.weakAlignedCplCount > 0
                                  ? `${item.weakAlignedCplCount} perlu tautan CPMK`
                                  : 'Terpetakan di CPMK RPS'}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-[11px] text-slate-700 leading-relaxed">
                            {primaryRec && (
                              <div>
                                <span className="font-bold text-slate-900">
                                  [{primaryRec.aspek}]
                                </span>{' '}
                                {primaryRec.tindakanRps}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedQualityCourse(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <ClipboardCheck className="w-3 h-3" />
                              <span>Detail Audit OBE</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: MATRIKS ANALISIS KUALITAS RPS (HEATMAP KORELASI CPL-CPMK-SUBCPMK) */}
      {activeSubTab === 'matriks_kualitas_rps' && (
        <MatriksKualitasRpsHeatmap
          selectedProdi={selectedProdi}
          prodiCourses={prodiMatrixCourses}
          allMatrixCourses={allMatrixCourses}
          prodiCpls={activeCplsObe}
          onMatrixUpdated={() => setMatrixRefreshTick(t => t + 1)}
          onOpenCplMatrixTab={() => setActiveSubTab('matriks_cpl_cpmk')}
          onShowToast={onShowToast}
        />
      )}

      {/* SUB-TAB: AI RPS QUALITY EVALUATOR (GEMINI SERVER-SIDE OBE TEXT ANALYZER) */}
      {activeSubTab === 'ai_rps_evaluator' && (
        <AiRpsEvaluatorPanel
          selectedProdi={selectedProdi}
          courses={prodiMatrixCourses}
          prodiCpls={activeCplsObe}
          onShowToast={onShowToast}
        />
      )}

      {/* SUB-TAB: SMART RPS AUDIT (PEMINDAIAN DOKUMEN RPS & VALIDASI MINIMAL 3 JENIS ASESMEN OBE) */}
      {activeSubTab === 'smart_rps_audit' && (
        <div className="space-y-5">
          {/* Header & 4 KPI Strip */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Pemindaian Otomatis Dokumen RPS</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedProdi.nama}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Pemindaian terakhir {lastSmartScanTime}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                    Smart RPS Audit: Validasi Minimal 3 Jenis Asesmen Pendukung CPL (Standar OBE)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Memindai seluruh dokumen RPS mata kuliah untuk mendeteksi ragam instrumen penilaian (Kuis, Tugas, UTS, UAS, Studi Kasus, Proyek/Tugas Besar, Praktikum, Presentasi) serta memastikan minimal <strong>3 jenis asesmen berbeda</strong> selaras mendukung capaian CPL.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRunMassSmartRpsScan}
                  disabled={isScanningSmartRps}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileSearch className={`w-3.5 h-3.5 ${isScanningSmartRps ? 'animate-spin' : ''}`} />
                  <span>{isScanningSmartRps ? 'Memindai RPS...' : `Pindai ${smartRpsSummary.totalCourses} Dokumen RPS`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const firstTarget = filteredSmartRpsCourses[0] || smartRpsSummary.items[0];
                    if (firstTarget) handleOpenSmartRpsScanner(firstTarget.course.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Uji / Unggah RPS MK</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('audit_unggah_rps')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-700" />
                  <span>Cek Belum Unggah ({rpsUploadAuditSummary.missingLatestCount})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white text-xs">
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Dokumen RPS Dipindai</span>
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
                  {smartRpsSummary.totalCourses} MK
                </span>
                <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                  Rerata {smartRpsSummary.avgAssessmentTypesPerCourse.toFixed(1)} jenis asesmen / MK
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSmartRpsStatusFilter('MEMENUHI_MIN_3_OBE')}
                className="p-4 text-left hover:bg-emerald-50/40 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-slate-500 block">Memenuhi &ge;3 Asesmen OBE</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                    {smartRpsSummary.compliantCount} MK
                  </span>
                  <span className="text-xs font-mono tabular-nums font-bold text-emerald-600">
                    ({smartRpsSummary.complianceRatePercent}%)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">Tervalidasi dukung CPL</span>
              </button>

              <button
                type="button"
                onClick={() => setSmartRpsStatusFilter('PERLU_PENGUATAN_CPL')}
                className="p-4 text-left bg-amber-50/40 hover:bg-amber-50/80 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-amber-800 font-medium block">
                  Perlu Penguatan Asesmen CPL
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-amber-800 mt-0.5 block">
                  {smartRpsSummary.needsStrengtheningCount} MK
                </span>
                <span className="text-[10px] text-amber-700">
                  Asesmen belum mengcover seluruh CPL Strong
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSmartRpsStatusFilter('TIDAK_MEMENUHI')}
                className="p-4 text-left bg-rose-50/50 hover:bg-rose-50/90 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-rose-800 font-medium block">
                  Tidak Memenuhi (&lt; 3 Asesmen)
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-0.5 block">
                  {smartRpsSummary.nonCompliantCount} MK
                </span>
                <span className="text-[10px] text-rose-700 font-semibold">
                  Klik untuk menyaring MK gagal
                </span>
              </button>
            </div>
          </div>

          {/* 2-Column Visual Assessment Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Frekuensi 8 Jenis Asesmen OBE */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Peta Jenis Asesmen Terdeteksi di Dokumen RPS
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Jumlah mata kuliah per kategori asesmen (Hijau: Autentik OBE / IKU-7 · Biru: Evaluasi Tertulis)
                  </p>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-slate-600">
                  8 Kategori
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={smartRpsSummary.categoryFrequency}
                    margin={{ top: 10, right: 16, left: -12, bottom: 18 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="shortLabel"
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <RechartsTooltip
                      formatter={(val: any, _name: any, props: any) => [
                        `${val} Mata Kuliah`,
                        props?.payload?.label || 'Asesmen'
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '10px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="courseCount" name="Jumlah MK" radius={[6, 6, 0, 0]} maxBarSize={44}>
                      {smartRpsSummary.categoryFrequency.map((entry, idx) => (
                        <Cell
                          key={`cat-${idx}`}
                          fill={entry.obeAuthentic ? '#059669' : '#2563eb'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Kepatuhan per Kelompok Semester */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Kepatuhan Standar Min. 3 Asesmen per Kelompok Semester
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Perbandingan status validasi dokumen RPS lintas semester pada {selectedProdi.singkatan}
                  </p>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-slate-600">
                  {smartRpsSummary.totalCourses} MK
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={smartRpsSummary.semesterBreakdown}
                    margin={{ top: 10, right: 16, left: -12, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="semesterGroup"
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '10px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="memenuhi" stackId="a" name="Memenuhi (≥3 OBE)" fill="#059669" maxBarSize={48} />
                    <Bar dataKey="perluPenguatan" stackId="a" name="Perlu Penguatan CPL" fill="#d97706" maxBarSize={48} />
                    <Bar dataKey="tidakMemenuhi" stackId="a" name="Gagal (<3 Asesmen)" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filter Bar & Smart RPS Verification Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                {([
                  { id: 'ALL', label: `Semua (${smartRpsSummary.totalCourses})` },
                  {
                    id: 'ISSUE_ONLY',
                    label: `Perlu Tindak Lanjut (${smartRpsSummary.nonCompliantCount + smartRpsSummary.needsStrengtheningCount})`
                  },
                  {
                    id: 'TIDAK_MEMENUHI',
                    label: `Gagal <3 Asesmen (${smartRpsSummary.nonCompliantCount})`
                  },
                  {
                    id: 'MEMENUHI_MIN_3_OBE',
                    label: `Memenuhi OBE (${smartRpsSummary.compliantCount})`
                  }
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSmartRpsStatusFilter(opt.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      smartRpsStatusFilter === opt.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={smartRpsSemFilter}
                  onChange={e => setSmartRpsSemFilter(e.target.value)}
                  aria-label="Filter semester Smart RPS Audit"
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
                >
                  <option value="ALL">Semua Sem</option>
                  {['1', '2', '3', '4', '5', '6', '7', '8'].map(s => (
                    <option key={s} value={s}>
                      Sem 0{s}
                    </option>
                  ))}
                </select>

                <div className="relative min-w-[210px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={smartRpsSearchQuery}
                    onChange={e => setSmartRpsSearchQuery(e.target.value)}
                    placeholder="Cari kode MK, dosen, atau file RPS..."
                    aria-label="Cari dokumen RPS mata kuliah"
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 w-full"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[540px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold w-10 text-center">No</th>
                    <th className="py-2.5 px-3 font-bold min-w-[230px]">Dokumen RPS &amp; Mata Kuliah</th>
                    <th className="py-2.5 px-3 font-bold min-w-[230px]">Jenis Asesmen Terdeteksi (Min. 3)</th>
                    <th className="py-2.5 px-3 font-bold w-48">Validasi Dukungan CPL</th>
                    <th className="py-2.5 px-3 font-bold w-44">Status Validasi OBE</th>
                    <th className="py-2.5 px-3 font-bold text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSmartRpsCourses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        <div>Tidak ada dokumen RPS mata kuliah yang cocok dengan filter aktif.</div>
                        <button
                          type="button"
                          onClick={() => {
                            setSmartRpsStatusFilter('ALL');
                            setSmartRpsSemFilter('ALL');
                            setSmartRpsSearchQuery('');
                          }}
                          className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Tampilkan Semua RPS</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredSmartRpsCourses.map((item, idx) => {
                      const c = item.course;
                      return (
                        <tr
                          key={c.id}
                          className={`transition-colors ${
                            item.validationStatus === 'TIDAK_MEMENUHI'
                              ? 'bg-rose-50/45 hover:bg-rose-50/80'
                              : item.validationStatus === 'PERLU_PENGUATAN_CPL'
                              ? 'bg-amber-50/30 hover:bg-amber-50/60'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-500">
                            {idx + 1}
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                              <span className="font-bold text-blue-900">{c.kodeMK}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">Sem {c.semesterLabel || c.semester}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{c.sks} SKS</span>
                            </div>
                            <div className="font-bold text-slate-900 mt-0.5">{c.namaMK}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]" title={item.documentCode}>
                                {item.documentCode}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{item.documentSourceType}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[11px] font-semibold text-slate-700">
                                Terdeteksi:{' '}
                                <strong className="font-mono tabular-nums text-slate-900">
                                  {item.totalDetectedCount} jenis
                                </strong>
                              </span>
                              <span
                                className={`font-mono text-[11px] font-bold tabular-nums ${
                                  item.cplSupportingCount >= 3
                                    ? 'text-emerald-700'
                                    : item.cplSupportingCount === 2
                                    ? 'text-amber-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {item.cplSupportingCount}/3 dukung CPL
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 leading-snug">
                              {item.detectedAssessments
                                .map(a => a.category.shortLabel)
                                .join(' · ') || 'Belum ada asesmen terdeteksi'}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                                <span className="text-slate-700 font-semibold">
                                  {item.coveredCplCount}/{item.totalMappedCplCount} CPL Terukur
                                </span>
                                <span
                                  className={
                                    Math.abs(item.totalCpmkWeightPercent - 100) <= 1
                                      ? 'text-emerald-700 font-bold'
                                      : 'text-amber-700 font-bold'
                                  }
                                >
                                  Bobot {item.totalCpmkWeightPercent}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.totalMappedCplCount > 0 &&
                                    item.coveredCplCount === item.totalMappedCplCount
                                      ? 'bg-emerald-600'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{
                                    width: `${
                                      item.totalMappedCplCount > 0
                                        ? Math.round(
                                            (item.coveredCplCount / item.totalMappedCplCount) * 100
                                          )
                                        : 0
                                    }%`
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border whitespace-nowrap ${
                                item.validationStatus === 'MEMENUHI_MIN_3_OBE'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : item.validationStatus === 'PERLU_PENGUATAN_CPL'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {item.validationStatus === 'MEMENUHI_MIN_3_OBE' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span>{item.validationLabel}</span>
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenSmartRpsScanner(c.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <FileSearch className="w-3.5 h-3.5" />
                              <span>Pindai &amp; Validasi</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: AUDIT UNGGAH FILE RPS TERBARU & PENGINGAT DOSEN PENGAMPU */}
      {activeSubTab === 'audit_unggah_rps' && (
        <div className="space-y-5">
          {/* Header & 4 KPI Summary Strip */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Audit Kelengkapan Berkas RPS Terbaru</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedProdi.nama}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-semibold text-slate-700">
                      Target {CURRENT_RPS_ACADEMIC_TERM}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Dipindai {lastUploadScanTime}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                    Pemindai Kepatuhan Unggah RPS Terbaru &amp; Akses Cepat Pengingat Dosen Pengampu
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Memindai seluruh berkas RPS di repositori kurikulum dan LMS prodi untuk menemukan mata kuliah yang belum mengunggah file RPS edisi terbaru atau masih memakai versi tahun akademik lama, lengkap dengan tombol kirim pengingat cepat kepada dosen pengampu.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRunUploadComplianceScan}
                  disabled={isScanningUploadAudit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileSearch className={`w-3.5 h-3.5 ${isScanningUploadAudit ? 'animate-spin' : ''}`} />
                  <span>
                    {isScanningUploadAudit
                      ? 'Memindai Repositori...'
                      : `Pindai Ulang ${rpsUploadAuditSummary.totalCourses} RPS`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSendAllPendingReminders}
                  disabled={rpsUploadAuditSummary.missingLatestCount === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    Kirim Pengingat Massal ({rpsUploadAuditSummary.missingLatestCount} MK)
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white text-xs">
              <button
                type="button"
                onClick={() => setUploadAuditStatusFilter('ALL')}
                className="p-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-slate-500 block">Total MK Kurikulum Dipindai</span>
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
                  {rpsUploadAuditSummary.totalCourses} MK
                </span>
                <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                  Terkirim pengingat: {rpsUploadAuditSummary.remindedPendingCount}/{rpsUploadAuditSummary.missingLatestCount} MK
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUploadAuditStatusFilter('SUDAH_UNGGAH_TERBARU')}
                className="p-4 text-left hover:bg-emerald-50/40 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-slate-500 block">Sudah Unggah RPS Terbaru</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                    {rpsUploadAuditSummary.uploadedLatestCount} MK
                  </span>
                  <span className="text-xs font-mono tabular-nums font-bold text-emerald-600">
                    ({rpsUploadAuditSummary.complianceRatePercent}%)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">Siap validasi OBE TA 2026/2027</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadAuditStatusFilter('BELUM_UNGGAH')}
                className="p-4 text-left bg-rose-50/50 hover:bg-rose-50/80 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-rose-800 font-medium block">
                  Belum Mengunggah File RPS
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-0.5 block">
                  {rpsUploadAuditSummary.missingOnlyCount} MK
                </span>
                <span className="text-[10px] text-rose-700 font-semibold">
                  Klik untuk saring yang kosong
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUploadAuditStatusFilter('PERLU_PEMBARUAN_VERSI')}
                className="p-4 text-left bg-amber-50/50 hover:bg-amber-50/80 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-amber-800 font-medium block">
                  Versi Lama / Perlu Pembaruan
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-amber-800 mt-0.5 block">
                  {rpsUploadAuditSummary.outdatedCount} MK
                </span>
                <span className="text-[10px] text-amber-800">
                  Masih file edisi TA sebelumnya
                </span>
              </button>
            </div>
          </div>

          {/* Akses Cepat Pengingat Kolektif per Dosen Pengampu */}
          {rpsUploadAuditSummary.lecturerPendingGroups.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Ringkasan Tanggungan per Dosen Pengampu ({rpsUploadAuditSummary.lecturerPendingGroups.length} Dosen)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Kirim pengingat kolektif satu klik untuk seluruh mata kuliah yang belum mengunggah RPS terbaru dari dosen bersangkutan.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-slate-500">
                  {rpsUploadAuditSummary.missingLatestCount} MK perlu tindak lanjut
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {rpsUploadAuditSummary.lecturerPendingGroups.map(group => (
                  <div
                    key={group.dosenNama}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate" title={group.dosenNama}>
                            {group.dosenNama}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {group.dosenJabatan} · {group.dosenEmail}
                          </div>
                        </div>
                        <span className="font-mono tabular-nums text-[11px] font-bold text-rose-700 shrink-0">
                          {group.pendingCourses.length} MK
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 leading-snug pt-1">
                        {group.pendingCourses
                          .map(pc => `${pc.course.kodeMK} (${pc.course.namaMK})`)
                          .join(' · ')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                      <span className="text-[10px] font-mono tabular-nums text-slate-500">
                        {group.missingCount > 0 ? `${group.missingCount} belum` : ''}
                        {group.missingCount > 0 && group.outdatedCount > 0 ? ' · ' : ''}
                        {group.outdatedCount > 0 ? `${group.outdatedCount} lama` : ''}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleSendLecturerBatchReminder(group)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          group.allReminded
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        {group.allReminded ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Terkirim · Ingatkan Lagi</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Kirim Pengingat Dosen</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Toolbar + Daftar Mata Kuliah Belum Unggah File RPS Terbaru */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: 'MISSING_LATEST', label: `Belum Unggah Terbaru (${rpsUploadAuditSummary.missingLatestCount})` },
                    { id: 'BELUM_UNGGAH', label: `Belum Ada File (${rpsUploadAuditSummary.missingOnlyCount})` },
                    { id: 'PERLU_PEMBARUAN_VERSI', label: `Versi Lama (${rpsUploadAuditSummary.outdatedCount})` },
                    { id: 'SUDAH_UNGGAH_TERBARU', label: `Sudah Terbaru (${rpsUploadAuditSummary.uploadedLatestCount})` },
                    { id: 'ALL', label: `Semua MK (${rpsUploadAuditSummary.totalCourses})` }
                  ] as const
                ).map(btn => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setUploadAuditStatusFilter(btn.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      uploadAuditStatusFilter === btn.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={uploadAuditSemFilter}
                  onChange={e => setUploadAuditSemFilter(e.target.value)}
                  aria-label="Filter semester audit unggah RPS"
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  <option value="ALL">Semua Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={String(s)}>
                      Semester {s}
                    </option>
                  ))}
                  <option value="0">Lintas / MKDU</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={uploadAuditSearchQuery}
                    onChange={e => setUploadAuditSearchQuery(e.target.value)}
                    placeholder="Cari kode MK, nama MK, atau dosen..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-56 sm:w-64 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3 px-3 text-center w-10">No</th>
                    <th className="py-3 px-3 min-w-[230px]">Mata Kuliah &amp; Berkas Sasaran</th>
                    <th className="py-3 px-3 min-w-[190px]">Dosen Pengampu &amp; Kontak</th>
                    <th className="py-3 px-3 min-w-[210px]">Status Dokumen RPS Terbaru</th>
                    <th className="py-3 px-3 text-center min-w-[270px]">Akses Cepat Pengingat &amp; Unggah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUploadAuditCourses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 px-4 text-center text-slate-500">
                        {uploadAuditStatusFilter === 'MISSING_LATEST' && rpsUploadAuditSummary.missingLatestCount === 0
                          ? `Seluruh mata kuliah pada ${selectedProdi.nama} telah mengunggah file RPS terbaru (${CURRENT_RPS_ACADEMIC_TERM}).`
                          : 'Tidak ada mata kuliah yang cocok dengan filter atau kata kunci pencarian saat ini.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUploadAuditCourses.map((item, idx) => {
                      const c = item.course;
                      return (
                        <tr
                          key={c.id}
                          className={`transition-colors ${
                            item.status === 'BELUM_UNGGAH'
                              ? 'bg-rose-50/25 hover:bg-rose-50/50'
                              : item.status === 'PERLU_PEMBARUAN_VERSI'
                              ? 'bg-amber-50/25 hover:bg-amber-50/50'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-500">
                            {idx + 1}
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                              <span className="font-bold text-blue-900">{c.kodeMK}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">Sem {c.semesterLabel || c.semester}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{c.sks} SKS</span>
                              <span aria-hidden="true">·</span>
                              <span>{c.kategori}</span>
                            </div>
                            <div className="font-bold text-slate-900 mt-0.5">{c.namaMK}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-mono truncate max-w-[230px]" title={item.currentFileName || item.expectedFileName}>
                                {item.currentFileName ? item.currentFileName : `Sasaran: ${item.expectedFileName}`}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">{item.dosenNama}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {item.dosenEmail}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                              {item.dosenJabatan} · {item.dosenNoHp}
                            </div>
                          </td>

                          <td className="py-3 px-3 space-y-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border whitespace-nowrap ${
                                item.status === 'SUDAH_UNGGAH_TERBARU'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : item.status === 'PERLU_PEMBARUAN_VERSI'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {item.status === 'SUDAH_UNGGAH_TERBARU' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span>{item.statusLabel}</span>
                            </span>
                            <div className="text-[11px] text-slate-600 leading-snug">
                              {item.reasonDetail}
                            </div>
                            <div className="text-[10px] font-mono tabular-nums text-slate-500">
                              Update: {item.lastUpdatedLabel}
                              {item.latestReminder && (
                                <>
                                  {' · '}
                                  <span className="text-emerald-700 font-semibold">
                                    Diingatkan {item.latestReminder.sentAt}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                              {item.isMissingLatest ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleSendQuickCourseReminder(item)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                      item.latestReminder
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                                    }`}
                                    title={`Kirim pengingat instan ke ${item.dosenNama} (${item.dosenEmail})`}
                                  >
                                    {item.latestReminder ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Kirim Ulang</span>
                                      </>
                                    ) : (
                                      <>
                                        <Send className="w-3 h-3" />
                                        <span>Kirim Pengingat</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenReminderComposer(item)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                    title="Sesuaikan isi pesan atau buka email"
                                  >
                                    <Mail className="w-3 h-3" />
                                    <span>Pesan</span>
                                  </button>

                                  <label className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                                    <Upload className="w-3 h-3" />
                                    <span>Unggah RPS</span>
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.txt,.md"
                                      className="hidden"
                                      onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleDirectUploadLatestRps(c.id, file);
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>
                                </>
                              ) : (
                                <label className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                                  <Upload className="w-3 h-3" />
                                  <span>Ganti Berkas Terbaru</span>
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt,.md"
                                    className="hidden"
                                    onChange={e => {
                                      const file = e.target.files?.[0];
                                      if (file) handleDirectUploadLatestRps(c.id, file);
                                      e.target.value = '';
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: PROGRES UNGGAH RPS TERBARU LINTAS PRODI (CLICKABLE PROGRESS BAR) */}
      {activeSubTab === 'progres_rps_prodi' && (
        <RpsUploadProdiProgressView
          selectedProdi={selectedProdi}
          allMatrixCourses={allMatrixCourses}
          uploadedRpsFilesMap={uploadedRpsFilesMap}
          smartRpsOverridesMap={smartRpsDocOverrides}
          rpsRemindersMap={rpsRemindersMap}
          onDispatchReminders={handleDispatchCrossProdiRpsReminders}
          onUploadLatestRps={handleDirectUploadLatestRps}
          onOpenDetailedAudit={() => setActiveSubTab('audit_unggah_rps')}
        />
      )}

      {/* SUB-TAB: AUDIT KELENGKAPAN BAP PER MK (KONSISTENSI KEHADIRAN BAP VS SIAKAD) */}
      {activeSubTab === 'audit_bap_mk' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Audit Kelengkapan BAP per Mata Kuliah (BAP vs Daftar Hadir SIAKAD)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Pemeriksaan konsistensi otomatis jumlah kehadiran mahasiswa pada Berita Acara Perkuliahan (BAP) terhadap daftar hadir resmi di Sistem Informasi Akademik (SIAKAD) {selectedProdi.nama}. Ketidaksesuaian data signifikan (&ge;15% atau &ge;5 mahasiswa) atau BAP kosong ditandai sebagai <strong>Perlu Investigasi Audit</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onShowToast) {
                    onShowToast(
                      `Audit BAP per MK selesai: ${bapAuditReport.investigasiCount} kelas ditandai Perlu Investigasi Audit dari ${bapAuditReport.totalMk} kelas aktif.`
                    );
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Jalankan Audit BAP Ulang</span>
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white text-xs">
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Total MK / Kelas Diaudit</span>
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
                  {bapAuditReport.totalMk} Kelas
                </span>
                <span className="text-[10px] text-slate-500">Semester berjalan {selectedProdi.singkatan}</span>
              </div>
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Rata-rata Konsistensi Data</span>
                <span className="text-xl font-bold font-mono tabular-nums text-blue-800 mt-0.5 block">
                  {bapAuditReport.avgConsistencyPercent}%
                </span>
                <span className="text-[10px] text-slate-500">Keselarasan hadir BAP vs SIAKAD</span>
              </div>
              <button
                type="button"
                onClick={() => setBapAuditFilter('Perlu Investigasi Audit')}
                className="p-4 text-left bg-rose-50/70 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-rose-800 font-medium block">
                  Perlu Investigasi Audit
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-0.5 block">
                  {bapAuditReport.investigasiCount} MK
                </span>
                <span className="text-[10px] text-rose-700 font-semibold">
                  Klik untuk menyaring deviasi &ge;15%
                </span>
              </button>
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Konsisten &amp; Terverifikasi</span>
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
                  {bapAuditReport.lengkapCount} MK
                </span>
                <span className="text-[10px] text-slate-500">
                  +{bapAuditReport.menungguCount} menunggu verifikasi Kaprodi
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
              {(['ALL', 'Perlu Investigasi Audit', 'Menunggu Verifikasi', 'Konsisten & Lengkap'] as const).map(
                st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setBapAuditFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      bapAuditFilter === st
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'ALL' ? `Semua Kelas (${bapAuditReport.totalMk})` : st}
                  </button>
                )
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Mata Kuliah &amp; Dosen</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Hadir BAP</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Hadir SIAKAD</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Selisih</th>
                    <th className="py-3 px-3 font-semibold">Status Audit BAP</th>
                    <th className="py-3 px-4 font-semibold">Catatan Temuan &amp; Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBapAuditItems.map(item => (
                    <tr
                      key={item.id}
                      className={
                        item.statusAudit === 'Perlu Investigasi Audit'
                          ? 'bg-rose-50/35 hover:bg-rose-50/60'
                          : 'hover:bg-slate-50/75'
                      }
                    >
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900">
                          {item.kodeMK} &mdash; {item.namaMK} ({item.kelas})
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.dosenNama} &bull; Pertemuan ke-{item.pertemuanKe} ({item.bapStatus})
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 align-top">
                        {item.bapHadirCount} mhs
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 align-top">
                        {item.siakadHadirCount} / {item.siakadTotalPeserta} mhs
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums align-top">
                        <span
                          className={`font-bold ${
                            item.selisihPersen >= 15 ? 'text-rose-700' : 'text-slate-700'
                          }`}
                        >
                          {item.selisihJumlah} mhs ({item.selisihPersen}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold whitespace-nowrap ${
                            item.statusAudit === 'Perlu Investigasi Audit'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : item.statusAudit === 'Menunggu Verifikasi'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {item.statusAudit === 'Konsisten & Lengkap' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          <span>{item.statusAudit}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 align-top max-w-sm">
                        <p className="text-[11px] text-slate-800 font-medium leading-snug">
                          {item.alasanTemuan}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">{item.tindakanSaran}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: AUDIT KUALITAS ASESMEN (BOBOT TUGAS, UTS, UAS VS CPL & SKOR OBE 1-100) */}
      {activeSubTab === 'audit_asesmen_obe' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Audit Kualitas Asesmen RPS (Tugas/Proyek, UTS &amp; UAS vs Kriteria CPL)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Membandingkan distribusi bobot penilaian antara Tugas/Proyek, UTS, dan UAS pada RPS terhadap tuntutan capaian CPL {selectedProdi.nama}, serta memberikan <strong>Skor Kelayakan OBE (1–100)</strong> dan saran penyeimbangan bobot.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab('matriks_cpl_cpmk')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sesuaikan Bobot di Matriks</span>
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white text-xs">
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Rata-rata Skor Kelayakan OBE</span>
                <span className="text-xl font-bold font-mono tabular-nums text-indigo-800 mt-0.5 block">
                  {assessmentAuditReport.avgObeScore} / 100
                </span>
                <span className="text-[10px] text-slate-500">Skala penilaian 1–100</span>
              </div>
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Rerata Komposisi Bobot RPS</span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                  Tugas {assessmentAuditReport.avgTugasPersen}% &bull; UTS {assessmentAuditReport.avgUtsPersen}% &bull; UAS {assessmentAuditReport.avgUasPersen}%
                </span>
                <span className="text-[10px] text-slate-500">Rata-rata seluruh MK {selectedProdi.singkatan}</span>
              </div>
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Asesmen Layak OBE (&ge;82)</span>
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
                  {assessmentAuditReport.optimalCount} MK
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  Proporsi formatif-sumatif seimbang
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAssessmentAuditFilter('NEEDS_REBALANCE')}
                className="p-4 text-left bg-amber-50/60 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-amber-800 font-medium block">
                  Perlu Penyesuaian Bobot (&lt;82)
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-amber-800 mt-0.5 block">
                  {assessmentAuditReport.revisiCount + assessmentAuditReport.kritisCount} MK
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">
                  Klik untuk menyaring MK perlu revisi
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setAssessmentAuditFilter('ALL')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    assessmentAuditFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Semua MK ({assessmentAuditReport.totalCourses})
                </button>
                <button
                  type="button"
                  onClick={() => setAssessmentAuditFilter('NEEDS_REBALANCE')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    assessmentAuditFilter === 'NEEDS_REBALANCE'
                      ? 'bg-white text-amber-800 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Perlu Penyesuaian ({assessmentAuditReport.revisiCount + assessmentAuditReport.kritisCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAssessmentAuditFilter('OPTIMAL')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    assessmentAuditFilter === 'OPTIMAL'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Layak OBE ({assessmentAuditReport.optimalCount})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={assessmentSearch}
                  onChange={e => setAssessmentSearch(e.target.value)}
                  placeholder="Cari MK atau dosen pengampu..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Mata Kuliah &amp; Fokus CPL</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Tugas / Proyek</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">UTS</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">UAS</th>
                    <th className="py-3 px-3 font-semibold text-center font-mono">Skor OBE (1–100)</th>
                    <th className="py-3 px-4 font-semibold">Analisis Kesesuaian &amp; Rekomendasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssessmentItems.map(item => (
                    <tr
                      key={item.course.id}
                      className={
                        item.status === 'Tidak Seimbang (Kritis)'
                          ? 'bg-rose-50/35'
                          : item.status === 'Perlu Penyesuaian Bobot'
                          ? 'bg-amber-50/30'
                          : 'hover:bg-slate-50/75'
                      }
                    >
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900">
                          {item.course.kodeMK} &mdash; {item.course.namaMK}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.cplDomainFocus} &bull; Benchmark Tugas: {item.idealTugasRange}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums text-blue-800 align-top">
                        {item.bobotTugasPersen}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-800 align-top">
                        {item.bobotUtsPersen}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-800 align-top">
                        {item.bobotUasPersen}%
                      </td>
                      <td className="py-3.5 px-3 text-center align-top">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg border font-mono font-bold tabular-nums ${
                            item.skorKelayakanObe >= 82
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : item.skorKelayakanObe >= 65
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {item.skorKelayakanObe}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 align-top max-w-md">
                        <div className="text-[11px] font-semibold text-slate-800">
                          {item.analisisKesesuaian}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          Saran: {item.rekomendasiBobot}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: AUDIT KELENGKAPAN CPL (STATUS INCOMPLETE BAGI MK TANPA PEMETAAN EKSPLISIT CPL->CPMK) */}
      {activeSubTab === 'audit_kelengkapan_cpl' && (
        <div className="space-y-5">
          {/* Header & 4 KPI Strip */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Audit Kelengkapan Pemetaan CPL ke CPMK (Dashboard Status Incomplete)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Memindai seluruh mata kuliah dan RPS {selectedProdi.nama} untuk memverifikasi apakah minimal satu CPL serta seluruh komponen CPL inti (Strong/Medium) telah dipetakan secara eksplisit ke butir CPMK. Mata kuliah yang belum lengkap ditandai <strong>Incomplete</strong> untuk segera diperbaiki dosen pengampu.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {cplCompletenessReport.incompleteCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextMap: Record<string, boolean> = { ...notifiedIncompleteCourses };
                      cplCompletenessReport.incompleteItems.forEach(it => {
                        nextMap[it.course.id] = true;
                      });
                      setNotifiedIncompleteCourses(nextMap);
                      onShowToast?.(
                        `Pengingat perbaikan pemetaan CPL → CPMK dikirim ke seluruh dosen pengampu (${cplCompletenessReport.incompleteCount} MK Incomplete).`
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ingatkan Dosen ({cplCompletenessReport.incompleteCount} MK)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMatrixRefreshTick(t => t + 1);
                    if (onShowToast) {
                      onShowToast(
                        `Pemindaian kelengkapan CPL selesai: ${cplCompletenessReport.completeCount} Complete, ${cplCompletenessReport.incompleteCount} Incomplete pada ${selectedProdi.singkatan}.`
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pindai Ulang RPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('matriks_cpl_cpmk')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Buka Matriks CPL–CPMK</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white text-xs">
              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Total MK Dipindai</span>
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
                  {cplCompletenessReport.totalCourses} MK
                </span>
                <span className="text-[10px] text-slate-500">Kurikulum aktif {selectedProdi.singkatan}</span>
              </div>

              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Status Complete (Eksplisit)</span>
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
                  {cplCompletenessReport.completeCount} MK ({cplCompletenessReport.completenessRatePercent}%)
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  Seluruh CPL inti terpetakan ke CPMK
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCplCompletenessFilter('Incomplete')}
                className="p-4 text-left bg-rose-50/70 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-rose-800 font-medium block">
                  Status Incomplete (Wajib Diperbaiki)
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-0.5 block">
                  {cplCompletenessReport.incompleteCount} MK
                </span>
                <span className="text-[10px] text-rose-700 font-semibold">
                  Klik untuk menyaring MK Incomplete
                </span>
              </button>

              <div className="p-4">
                <span className="text-[11px] text-slate-500 block">Cakupan Komponen CPL Prodi</span>
                <span className="text-xl font-bold font-mono tabular-nums text-blue-800 mt-0.5 block">
                  {cplCompletenessReport.cplComponentCoverage.length - cplCompletenessReport.uncoveredProdiCplCount} /{' '}
                  {cplCompletenessReport.cplComponentCoverage.length} CPL
                </span>
                <span className="text-[10px] text-slate-500">
                  Terdistribusi di minimal 1 CPMK
                </span>
              </div>
            </div>
          </div>

          {/* Prodi CPL Component Coverage Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                Peta Keterisian Komponen CPL Program Studi ({cplCompletenessReport.cplComponentCoverage.length} Butir CPL)
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>Klik butir CPL untuk menyaring mata kuliah terkait</span>
                {cplComponentFilter && (
                  <button
                    type="button"
                    onClick={() => setCplComponentFilter(null)}
                    className="px-2 py-0.5 rounded border border-slate-300 bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 cursor-pointer"
                  >
                    Reset ({cplComponentFilter})
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {cplCompletenessReport.cplComponentCoverage.map(cov => {
                const isSelected = cplComponentFilter === cov.cpl.kode;
                return (
                  <button
                    key={cov.cpl.kode}
                    type="button"
                    onClick={() =>
                      setCplComponentFilter(prev =>
                        prev === cov.cpl.kode ? null : cov.cpl.kode
                      )
                    }
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                        : cov.isCoveredByProdi
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-rose-50 border-rose-300 hover:border-rose-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-900">{cov.cpl.kode}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          cov.isCoveredByProdi
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {cov.isCoveredByProdi ? 'Terpetakan' : 'Kosong'}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-700 line-clamp-1 mt-1">
                      {cov.cpl.judul}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 mt-1.5 tabular-nums">
                      {cov.cpmkExplicitCount} MK eksplisit di CPMK &bull; {cov.mappedCourseCount} di matriks
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Course Table: Status Incomplete vs Complete */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setCplCompletenessFilter('Incomplete')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cplCompletenessFilter === 'Incomplete'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Incomplete ({cplCompletenessReport.incompleteCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCplCompletenessFilter('Complete')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cplCompletenessFilter === 'Complete'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Complete ({cplCompletenessReport.completeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCplCompletenessFilter('ALL')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cplCompletenessFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Semua MK ({cplCompletenessReport.totalCourses})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cplCompletenessSearch}
                  onChange={e => setCplCompletenessSearch(e.target.value)}
                  placeholder="Cari kode MK, nama MK, atau dosen..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Mata Kuliah &amp; Pengampu</th>
                    <th className="py-3 px-3 font-semibold text-center">Smt</th>
                    <th className="py-3 px-3 font-semibold">CPL Eksplisit di CPMK</th>
                    <th className="py-3 px-3 font-semibold">CPL Belum Terhubung CPMK</th>
                    <th className="py-3 px-3 font-semibold">Status Audit</th>
                    <th className="py-3 px-4 font-semibold text-right">Aksi Perbaikan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompletenessItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Tidak ada mata kuliah pada filter status ini.
                      </td>
                    </tr>
                  ) : (
                    filteredCompletenessItems.map(item => (
                      <tr
                        key={item.course.id}
                        className={
                          item.status === 'Incomplete'
                            ? 'bg-rose-50/35 hover:bg-rose-50/60'
                            : 'hover:bg-slate-50/75'
                        }
                      >
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-900">
                            {item.course.kodeMK} &mdash; {item.course.namaMK}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Pengampu: {item.course.dosenPengampu} &bull;{' '}
                            {(item.course.cpmkList || []).length} CPMK
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono tabular-nums align-top font-semibold text-slate-700">
                          {item.course.semester}
                        </td>
                        <td className="py-3.5 px-3 align-top">
                          {item.explicitCplInCpmk.length === 0 ? (
                            <span className="text-[11px] font-semibold text-rose-700">
                              Belum ada CPL eksplisit
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {item.explicitCplInCpmk.map(k => (
                                <span
                                  key={k}
                                  className="px-1.5 py-0.5 font-mono text-[10px] font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 align-top max-w-xs">
                          {item.missingCplToCpmk.length > 0 ? (
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-1">
                                {item.missingCplToCpmk.map(k => (
                                  <span
                                    key={k}
                                    className="px-1.5 py-0.5 font-mono text-[10px] font-bold rounded bg-rose-100 text-rose-800 border border-rose-300"
                                  >
                                    {k}
                                  </span>
                                ))}
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug">
                                {item.issueSummary}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              Lengkap ({item.completenessPercent}%)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 align-top">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold whitespace-nowrap ${
                              item.status === 'Incomplete'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {item.status === 'Incomplete' ? (
                              <AlertTriangle className="w-3 h-3" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            <span>{item.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="inline-flex flex-wrap justify-end items-center gap-1.5">
                            {item.status === 'Incomplete' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAutoCompleteCplMapping(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Lengkapi Otomatis</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNotifiedIncompleteCourses(prev => ({
                                      ...prev,
                                      [item.course.id]: true
                                    }));
                                    onShowToast?.(
                                      `Notifikasi perbaikan pemetaan CPL (${
                                        item.missingCplToCpmk.join(', ') || 'CPL ke CPMK'
                                      }) dikirim ke dosen pengampu ${item.course.dosenPengampu} untuk MK ${item.course.kodeMK}.`
                                    );
                                  }}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                    notifiedIncompleteCourses[item.course.id]
                                      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                      : 'text-rose-800 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                  }`}
                                >
                                  <BellRing className="w-3 h-3" />
                                  <span>
                                    {notifiedIncompleteCourses[item.course.id]
                                      ? 'Terkirim ke Dosen'
                                      : 'Ingatkan Dosen'}
                                  </span>
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setActiveSubTab('matriks_cpl_cpmk')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit di Matriks</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: MATRIKS INTERAKTIF RELASI MK - CPMK - CPL (STRONG, MEDIUM, LOW) */}
      {activeSubTab === 'matriks_cpl_cpmk' && (
        <MatriksCplCpmkView
          selectedProdi={selectedProdi}
          onShowToast={onShowToast}
          semesterFilter={matrixSemesterFilter}
          onSemesterFilterChange={setMatrixSemesterFilter}
          kelompokFilter={matrixKelompokFilter}
          onKelompokFilterChange={setMatrixKelompokFilter}
          onMatrixChange={() => setMatrixRefreshTick(t => t + 1)}
        />
      )}

      {/* SUB-TAB: SPIDER-CHART SEBARAN TINGKAT CAPAIAN CPL AGREGAT PER ANGKATAN */}
      {activeSubTab === 'spider_cpl_angkatan' && (
        <CplSpiderChartAngkatanView
          selectedProdi={selectedProdi}
          onShowToast={onShowToast}
        />
      )}

      {/* SUB-TAB: KOMPARASI MAHASISWA AKTIF PER ANGKATAN VS RASIO DOSEN & PROYEKSI KEBUTUHAN SDM */}
      {activeSubTab === 'rasio_dosen_angkatan' && (
        <RasioDosenMahasiswaView
          selectedProdi={selectedProdi}
          mahasiswaList={mahasiswaList}
          dosenList={dosenList}
          onShowToast={onShowToast}
        />
      )}

      {/* SUB-TAB: PENETAPAN TARGET CPL PER MATA KULIAH & KOMPARASI BARCHART */}
      {activeSubTab === 'target_matakuliah' && (
        <div className="space-y-5">
          {savedNotification && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{savedNotification}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSavedNotification(null)}
                className="text-emerald-700 hover:text-emerald-900 text-[11px] underline"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Top Control: Select Course */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 mt-0.5">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Penetapan Target Capaian CPL per Mata Kuliah (OBE Framework)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kaprodi dapat menetapkan standar target capaian kompetensi per mata kuliah dan membandingkannya secara visual dengan rata-rata nilai riil mahasiswa.
                  </p>
                </div>
              </div>

              {/* Course Selector Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600 font-semibold whitespace-nowrap">Mata Kuliah:</label>
                <select
                  value={selectedCourseKey}
                  onChange={(e) => setSelectedCourseKey(e.target.value)}
                  className="text-xs font-bold border border-blue-300 rounded-lg px-3 py-1.5 bg-blue-50/70 text-blue-900"
                >
                  {selectedProdi.id === 'SIPIL' ? (
                    <>
                      <option value="SIPIL-MK1">TKS-301: Mekanika Rekayasa II (Sem 3 · 3 SKS)</option>
                      <option value="SIPIL-MK2">TKS-502: Struktur Beton Bertulang (Sem 5 · 4 SKS)</option>
                    </>
                  ) : selectedProdi.id === 'LINGKUNGAN' ? (
                    <>
                      <option value="LINGKUNGAN-MK1">TKL-401: Pengolahan Air Buangan &amp; Limbah Sawit (Sem 4 · 3 SKS)</option>
                    </>
                  ) : (
                    <>
                      <option value="LISTRIK-MK1">TEL-301: Teori Rangkaian &amp; Mesin Listrik Industri (Sem 3 · 3 SKS)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Visual Recharts BarChart: Target vs Rata-rata Nilai Mahasiswa */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Komparasi Target CPL vs Rata-rata Nilai Riil Mahasiswa (Recharts BarChart)
                </span>
                <span className="text-[11px] text-slate-500">
                  Data nilai berbasis asesmen tugas, kuis, UTS, dan UAS semester terbaru
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={activeCplList}
                    margin={{ top: 15, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="cplKode" 
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(val: any, name: any) => [`${val}%`, name]}
                      labelFormatter={(label, payload) => {
                        const item = payload && payload[0] && payload[0].payload;
                        return item ? `${item.cplKode}: ${item.namaCpl}` : label;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <ReferenceLine 
                      y={75} 
                      stroke="#dc2626" 
                      strokeDasharray="4 4" 
                      label={{ value: 'Batas Lulus CPL: 75%', fill: '#dc2626', fontSize: 10, position: 'insideTopLeft' }} 
                    />
                    <Bar 
                      dataKey="targetPersen" 
                      name="Target Standar CPL (%)" 
                      fill="#2563eb" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="realisasiNilaiMhs" 
                      name="Rata-rata Nilai Mahasiswa (%)" 
                      fill="#059669" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target Editing Sliders / Inputs */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Atur Persentase Target Capaian per Butir CPL
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Geser slider atau masukkan angka persentase target capaian (minimal kelulusan akreditasi 70%).
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetCourseTargets}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Standar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCourseTarget}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Target CPL</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activeCplList.map((c) => {
                  const isAchieved = c.realisasiNilaiMhs >= c.targetPersen;
                  const delta = (c.realisasiNilaiMhs - c.targetPersen).toFixed(1);

                  return (
                    <div 
                      key={c.cplKode} 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded">
                            {c.cplKode}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 ml-2">
                            {c.namaCpl}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isAchieved 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isAchieved ? `Tercapai (+${delta}%)` : `Di Bawah Target (${delta}%)`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="50"
                          max="100"
                          step="1"
                          value={c.targetPersen}
                          onChange={(e) => handleUpdateTargetPersen(c.cplKode, parseInt(e.target.value) || 75)}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                        <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-900 w-16 justify-end">
                          <span>{c.targetPersen}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                        <span>Target: <strong className="text-blue-800">{c.targetPersen}%</strong></span>
                        <span>Nilai Riil: <strong className="text-emerald-700">{c.realisasiNilaiMhs}%</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB: ANALISIS CAPAIAN PEMBELAJARAN LULUSAN (CPL) - STANDAR IABEE (OBE) */}
      {activeSubTab === 'analisis_iabee' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Analisis Capaian Pembelajaran Lulusan (CPL) - Standar IABEE
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    OBE Full Compliance
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluasi ketercapaian 9 Kriteria IABEE (Indonesian Accreditation Board for Engineering Education) berdasarkan rerata nilai riil mahasiswa {selectedProdi.nama}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Standar Threshold IABEE</span>
                  <span className="text-sm font-black text-blue-900">75.0% (Kategori Memuaskan)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-700/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Laporan CPL (A4)</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Rata-rata Capaian CPL:</span>
                <span className="text-xl font-black text-emerald-700">82.8%</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">+7.8% di atas standar IABEE</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Kriteria Memenuhi Syarat:</span>
                <span className="text-xl font-black text-blue-900">9 dari 9 (100%)</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Semua kriteria &ge; 75%</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Capaian Tertinggi:</span>
                <span className="text-xl font-black text-purple-700">88.3%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Kriteria [f] Etika &amp; Tanggung Jawab</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Area Peningkatan (CQI):</span>
                <span className="text-xl font-black text-amber-700">78.6%</span>
                <span className="text-[10px] text-amber-600 block mt-0.5">Kriteria [e] Analisis Struktur Kompleks</span>
              </div>
            </div>
          </div>

          {/* Visual Charts: Radar & Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart: IABEE Criteria Profile */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                  <span>Profil Capaian 9 Kriteria IABEE vs Target 75%</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Radar Chart OBE</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                    { subject: '[a] Matematika & Sains', skor: 79.8, target: 75, fullMark: 100 },
                    { subject: '[b] Eksperimen Lab', skor: 82.8, target: 75, fullMark: 100 },
                    { subject: '[c] Desain Rekayasa', skor: 80.8, target: 75, fullMark: 100 },
                    { subject: '[d] Tim Multidisiplin', skor: 86.3, target: 75, fullMark: 100 },
                    { subject: '[e] Solusi Masalah', skor: 78.6, target: 75, fullMark: 100 },
                    { subject: '[f] Etika Profesi', skor: 88.3, target: 75, fullMark: 100 },
                    { subject: '[g] Komunikasi', skor: 83.1, target: 75, fullMark: 100 },
                    { subject: '[h] Dampak Sosial', skor: 82.5, target: 75, fullMark: 100 },
                    { subject: '[i] Belajar Mandiri', skor: 83.8, target: 75, fullMark: 100 },
                  ]}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Radar name="Capaian Mahasiswa" dataKey="skor" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.45} />
                    <Radar name="Standar IABEE (75%)" dataKey="target" stroke="#ef4444" fill="#f87171" fillOpacity={0.15} strokeDasharray="3 3" />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <RechartsTooltip formatter={(val: any) => [`${val}%`, '']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Comparison Against 75% Standard */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-700" />
                  <span>Distribusi Nilai Rata-rata per Kriteria IABEE</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Threshold = 75%</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart 
                    data={[
                      { code: '[a] Sains', nilai: 79.8, target: 75 },
                      { code: '[b] Lab', nilai: 82.8, target: 75 },
                      { code: '[c] Desain', nilai: 80.8, target: 75 },
                      { code: '[d] Tim', nilai: 86.3, target: 75 },
                      { code: '[e] Masalah', nilai: 78.6, target: 75 },
                      { code: '[f] Etika', nilai: 88.3, target: 75 },
                      { code: '[g] Komunikasi', nilai: 83.1, target: 75 },
                      { code: '[h] Dampak', nilai: 82.5, target: 75 },
                      { code: '[i] Mandiri', nilai: 83.8, target: 75 },
                    ]}
                    margin={{ top: 15, right: 15, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="code" tick={{ fill: '#334155', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <RechartsTooltip formatter={(val: any) => [`${val}%`, 'Nilai']} />
                    <ReferenceLine y={75} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Standar IABEE 75%', fill: '#dc2626', fontSize: 9, position: 'top' }} />
                    <Bar dataKey="nilai" name="Capaian Mahasiswa (%)" radius={[4, 4, 0, 0]}>
                      {[79.8, 82.8, 80.8, 86.3, 78.6, 88.3, 83.1, 82.5, 83.8].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry >= 80 ? '#10b981' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Evaluation Table & Continuous Quality Improvement (CQI) Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Matriks Evaluasi Ketercapaian IABEE &amp; Rencana Tindak Lanjut (CQI)
                </h4>
                <p className="text-xs text-slate-500">
                  Pemetaan mata kuliah pengukur CPMK, rata-rata nilai riil mahasiswa, dan tindak lanjut perbaikan mutu berkelanjutan
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                Siklus Evaluasi: Ganjil 2026/2027
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-200 p-2.5 w-16 text-center">Kode</th>
                    <th className="border border-slate-200 p-2.5">Kriteria IABEE &amp; Deskripsi Kemampuan</th>
                    <th className="border border-slate-200 p-2.5">Mata Kuliah Pengukur CPMK</th>
                    <th className="border border-slate-200 p-2.5 text-center w-24">Rerata Nilai</th>
                    <th className="border border-slate-200 p-2.5 text-center w-24">Target</th>
                    <th className="border border-slate-200 p-2.5 text-center w-32">Status</th>
                    <th className="border border-slate-200 p-2.5">Rencana Peningkatan (CQI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-blue-900 font-mono">[a]</td>
                    <td className="border border-slate-200 p-2.5">
                      <strong className="text-slate-900 block">Engineering Knowledge</strong>
                      <span className="text-slate-600">Penerapan matematika, ilmu alam dasar, dan prinsip dasar rekayasa.</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-700">Kalkulus Rekayasa, Fisika Terapan, Mekanika Fluida</td>
                    <td className="border border-slate-200 p-2.5 text-center font-black text-slate-900 font-mono">79.8%</td>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-600 font-mono">75.0%</td>
                    <td className="border border-slate-200 p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Memenuhi Standar</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-600">Pertahankan modul tutorial kalkulus dan asistensi mandiri.</td>
                  </tr>

                  <tr>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-blue-900 font-mono">[b]</td>
                    <td className="border border-slate-200 p-2.5">
                      <strong className="text-slate-900 block">Experiments &amp; Data Analysis</strong>
                      <span className="text-slate-600">Perancangan &amp; pelaksanaan eksperimen laboratorium serta interpretasi data.</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-700">Praktikum Mekanika Tanah, Uji Bahan Konstruksi / Lab Lingkungan</td>
                    <td className="border border-slate-200 p-2.5 text-center font-black text-slate-900 font-mono">82.8%</td>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-600 font-mono">75.0%</td>
                    <td className="border border-slate-200 p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Memenuhi Standar</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-600">Peremajaan sensor digital alat uji kuat tekan dan triaksial.</td>
                  </tr>

                  <tr>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-blue-900 font-mono">[c]</td>
                    <td className="border border-slate-200 p-2.5">
                      <strong className="text-slate-900 block">Design of Engineering Solutions</strong>
                      <span className="text-slate-600">Perancangan sistem/komponen rekayasa sesuai batasan teknis, ekonomi, dan keselamatan.</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-700">Desain Struktur Beton Bertulang, Desain Pondasi, Desain Geometrik</td>
                    <td className="border border-slate-200 p-2.5 text-center font-black text-slate-900 font-mono">80.8%</td>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-600 font-mono">75.0%</td>
                    <td className="border border-slate-200 p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Memenuhi Standar</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-600">Integrasi studi kasus proyek riil konstruksi di Provinsi Jambi.</td>
                  </tr>

                  <tr>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-blue-900 font-mono">[d]</td>
                    <td className="border border-slate-200 p-2.5">
                      <strong className="text-slate-900 block">Multidisciplinary Teamwork</strong>
                      <span className="text-slate-600">Kemampuan berfungsi efektif dalam tim kerja multidisiplin dan kepemimpinan.</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-700">Kerja Praktik Lapangan (KP), Manajemen Rekayasa Konstruksi</td>
                    <td className="border border-slate-200 p-2.5 text-center font-black text-slate-900 font-mono">86.3%</td>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-600 font-mono">75.0%</td>
                    <td className="border border-slate-200 p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Sangat Memuaskan</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-600">Perluas kemitraan magang bersertifikat BUMN dan industri regional.</td>
                  </tr>

                  <tr>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-blue-900 font-mono">[e]</td>
                    <td className="border border-slate-200 p-2.5">
                      <strong className="text-slate-900 block">Engineering Problem Solving</strong>
                      <span className="text-slate-600">Identifikasi, formulasi, dan penyelesaian masalah rekayasa kompleks.</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-700">Analisis Struktur Statis Tak Tentu, Hidrologi Terapan</td>
                    <td className="border border-slate-200 p-2.5 text-center font-black text-slate-900 font-mono">78.6%</td>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-600 font-mono">75.0%</td>
                    <td className="border border-slate-200 p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">Memenuhi Standar</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-amber-700 font-medium">Fokus perbaikan: latihan pemodelan komputer software SAP2000.</td>
                  </tr>

                  <tr>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-blue-900 font-mono">[f]</td>
                    <td className="border border-slate-200 p-2.5">
                      <strong className="text-slate-900 block">Professional Ethics &amp; Integrity</strong>
                      <span className="text-slate-600">Pemahaman etika profesi keinsinyuran dan komitmen terhadap norma moral.</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-700">Etika Profesi Keinsinyuran, K3 Konstruksi &amp; Ketenagalistrikan</td>
                    <td className="border border-slate-200 p-2.5 text-center font-black text-slate-900 font-mono">88.3%</td>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-600 font-mono">75.0%</td>
                    <td className="border border-slate-200 p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Sangat Memuaskan</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-600">Keterlibatan praktisi PII (Persatuan Insinyur Indonesia) dalam kuliah tamu.</td>
                  </tr>

                  <tr>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-blue-900 font-mono">[g]</td>
                    <td className="border border-slate-200 p-2.5">
                      <strong className="text-slate-900 block">Effective Communication</strong>
                      <span className="text-slate-600">Komunikasi tertulis dan lisan secara efektif di depan forum ilmiah.</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-700">Seminar Proposal, Seminar Hasil Penelitian, Bahasa Indonesia Ilmiah</td>
                    <td className="border border-slate-200 p-2.5 text-center font-black text-slate-900 font-mono">83.1%</td>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-600 font-mono">75.0%</td>
                    <td className="border border-slate-200 p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Memenuhi Standar</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-600">Standarisasi format presentasi slide dan rubrik penilaian dewan penguji.</td>
                  </tr>

                  <tr>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-blue-900 font-mono">[h]</td>
                    <td className="border border-slate-200 p-2.5">
                      <strong className="text-slate-900 block">Environmental &amp; Societal Impact</strong>
                      <span className="text-slate-600">Kesadaran dampak solusi rekayasa terhadap ekologi dan pembangunan berkelanjutan.</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-700">AMDAL Rekayasa, Drainase &amp; Konservasi Air, Ekonomi Sirkular</td>
                    <td className="border border-slate-200 p-2.5 text-center font-black text-slate-900 font-mono">82.5%</td>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-600 font-mono">75.0%</td>
                    <td className="border border-slate-200 p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Memenuhi Standar</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-600">Pengayaan materi Green Building dan mitigasi risiko perubahan iklim.</td>
                  </tr>

                  <tr>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-blue-900 font-mono">[i]</td>
                    <td className="border border-slate-200 p-2.5">
                      <strong className="text-slate-900 block">Lifelong Learning</strong>
                      <span className="text-slate-600">Kemampuan penelusuran pustaka mutakhir dan pembelajaran mandiri sepanjang hayat.</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-700">Tugas Akhir / Skripsi, Metodologi Penelitian Rekayasa</td>
                    <td className="border border-slate-200 p-2.5 text-center font-black text-slate-900 font-mono">83.8%</td>
                    <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-600 font-mono">75.0%</td>
                    <td className="border border-slate-200 p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Memenuhi Standar</span>
                    </td>
                    <td className="border border-slate-200 p-2.5 text-slate-600">Akses langganan database jurnal internasional ScienceDirect dan IEEE.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Kurikulum OBE CPL Gap Analysis Comparison Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Tabel Perbandingan Gap Analysis Capaian CPL Kurikulum OBE ({selectedProdi.nama})
                </h4>
                <p className="text-xs text-slate-500">
                  Rekapitulasi kesenjangan (Gap) capaian saat ini terhadap target minimal kurikulum OBE dan dukungan S/M/L mata kuliah
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('cpl_obe')}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                >
                  Lihat Detail Butir CPL
                </button>
                <button
                  type="button"
                  onClick={() => setIsMatrixPdfModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Ekspor PDF Matriks</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-200 p-2 w-20">Kode CPL</th>
                    <th className="border border-slate-200 p-2">Kompetensi Lulusan</th>
                    <th className="border border-slate-200 p-2 text-right w-24">Capaian (%)</th>
                    <th className="border border-slate-200 p-2 text-right w-24">Target (%)</th>
                    <th className="border border-slate-200 p-2 text-right w-24">Gap (%)</th>
                    <th className="border border-slate-200 p-2 text-center w-28">Dukungan MK</th>
                    <th className="border border-slate-200 p-2 text-center w-32">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {gapAnalysisRows.map(row => (
                    <tr key={row.kode} className="hover:bg-slate-50">
                      <td className="border border-slate-200 p-2 font-mono font-bold text-blue-900">{row.kode}</td>
                      <td className="border border-slate-200 p-2 font-semibold text-slate-800">{row.judul}</td>
                      <td className="border border-slate-200 p-2 text-right font-mono tabular-nums font-bold text-slate-900">
                        {row.capaianSaatIni.toFixed(1)}%
                      </td>
                      <td className="border border-slate-200 p-2 text-right font-mono tabular-nums text-slate-600">
                        {row.targetKurikulum.toFixed(1)}%
                      </td>
                      <td className={`border border-slate-200 p-2 text-right font-mono tabular-nums font-bold ${
                        row.gap >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {row.gap >= 0 ? '+' : ''}{row.gap.toFixed(1)}%
                      </td>
                      <td className="border border-slate-200 p-2 text-center font-mono tabular-nums text-slate-700">
                        {row.strongCount}S · {row.mediumCount}M · {row.lowCount}L
                      </td>
                      <td className="border border-slate-200 p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.statusVariant === 'exceed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.statusVariant === 'meet'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CHECKLIST DOKUMEN BORANG */}
      {activeSubTab === 'dokumen_borang' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Inventarisasi Berkas Bukti Fisik &amp; Digital (LKPS &amp; LED)
              </h3>
              <p className="text-xs text-slate-500">
                Dokumen pendukung siap audit asesor akreditasi LAM-Teknik di Google Drive / Repository FT UNBARI.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200">
              {totalDokTersedia} dari {totalDokDibutuhkan} Berkas Lengkap ({persenDokumen}%)
            </span>
          </div>

          <div className="space-y-3">
            {borang.kriteriaList.map((k) => (
              <div 
                key={k.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-4 h-4 ${
                    k.dokumenTersedia === k.dokumenDibutuhkan ? 'text-emerald-600' : 'text-blue-600'
                  }`} />
                  <div>
                    <span className="font-bold text-slate-900">{k.id} - {k.nama}</span>
                    <span className="text-[11px] text-slate-500 block">
                      Catatan: {k.rekomendasiPerbaikan}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-slate-700">
                    {k.dokumenTersedia} / {k.dokumenDibutuhkan} Berkas
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    k.dokumenTersedia === k.dokumenDibutuhkan
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {k.dokumenTersedia === k.dokumenDibutuhkan ? 'Lengkap' : 'Dalam Verifikasi'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      </div>

      {/* Automatic @media print report wrapper when printing directly from AkreditasiView */}
      {!isPrintModalOpen && !isMatrixPdfModalOpen && (
        <PrintableReport
          mode="print-only"
          orientation={pdfOrientation}
          prodi={selectedProdi}
          cpls={activeCplsObe}
          courses={filteredMatrixCourses}
          gapAnalysisRows={gapAnalysisRows}
          meta={matrixPdfMeta}
          facultyLogoUrl={OFFICIAL_FT_UNBARI_LOGO_URL}
          reportDate={reportGenerationDate}
        />
      )}

      {/* Modal Detail Audit CPL <70% & Saran Perbaikan RPS */}
      {selectedAuditCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                  Audit Otomatis Kontribusi CPL &amp; Panduan Revisi RPS (Min {MIN_CPL_COURSE_STANDARD_PERCENT}%)
                </div>
                <h3 className="text-base font-bold mt-0.5">
                  {selectedAuditCourse.course.kodeMK} — {selectedAuditCourse.course.namaMK}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedAuditCourse.course.dosenPengampu} · {selectedAuditCourse.course.sks} SKS · Bloom Maks:{' '}
                  {selectedAuditCourse.highestBloomLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditCourse(null)}
                aria-label="Tutup detail saran RPS"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Audit Score Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`p-3 rounded-xl border ${
                    selectedAuditCourse.avgContributionPercent < 70
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <span className="text-[11px] text-slate-600 block">Rata-rata Kontribusi CPL</span>
                  <span
                    className={`text-xl font-bold font-mono tabular-nums ${
                      selectedAuditCourse.avgContributionPercent < 70 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {selectedAuditCourse.avgContributionPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-600 block">Butir CPL Di Bawah 70%</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-amber-700">
                    {selectedAuditCourse.belowMinimumCpls.length} / {selectedAuditCourse.mappedDetails.length} CPL
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-600 block">Sebaran Kontribusi</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
                    {selectedAuditCourse.strongCount}S · {selectedAuditCourse.mediumCount}M ·{' '}
                    {selectedAuditCourse.lowCount}L
                  </span>
                </div>
              </div>

              {/* Per-CPL Breakdown vs 70% Threshold */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                  Skor Kontribusi per Butir CPL vs Batas Minimum {MIN_CPL_COURSE_STANDARD_PERCENT}%:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedAuditCourse.mappedDetails.map(d => (
                    <div
                      key={d.kode}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                        d.isBelowMinimum
                          ? 'bg-rose-50/70 border-rose-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">{d.kode}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 font-semibold">
                            {d.level}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 truncate mt-0.5">{d.judul}</div>
                      </div>
                      <div className="text-right shrink-0 font-mono tabular-nums">
                        <div
                          className={`font-bold ${
                            d.isBelowMinimum ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {d.scorePercent.toFixed(1)}%
                        </div>
                        {d.isBelowMinimum && (
                          <div className="text-[10px] text-rose-600">-{d.deficitFrom70.toFixed(1)}%</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable RPS Suggestions */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                  Rekomendasi Tindakan Perbaikan RPS (Rencana Pembelajaran Semester):
                </h4>
                <div className="space-y-2">
                  {selectedAuditCourse.suggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex items-start gap-2.5"
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                          sug.prioritas === 'Tinggi'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {sug.prioritas}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{sug.kategori}</div>
                        <p className="text-slate-700 leading-relaxed mt-0.5">{sug.rekomendasi}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCopyRpsSuggestions(selectedAuditCourse)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Saran Perbaikan RPS</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAuditCourse(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAuditCourse(null);
                    setActiveSubTab('matriks_cpl_cpmk');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Perbaiki Matriks S/M/L</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Audit Kualitas RPS Berbasis Standar OBE */}
      {selectedQualityCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-teal-300 font-semibold uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verifikasi Constructive Alignment OBE</span>
                  <span>·</span>
                  <span className="font-mono">{selectedQualityCourse.course.kodeMK}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold mt-1">
                  {selectedQualityCourse.course.namaMK}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedQualityCourse.course.dosenPengampu} · Sem{' '}
                  {selectedQualityCourse.course.semesterLabel ||
                    selectedQualityCourse.course.semester}{' '}
                  · {selectedQualityCourse.course.sks} SKS · {selectedQualityCourse.highestBloom}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQualityCourse(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Tutup modal detail audit kualitas RPS"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Visual Score Summary & 4 OBE Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="sm:col-span-4 text-center sm:border-r sm:border-slate-200 sm:pr-4">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Skor Kualitas RPS
                  </span>
                  <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {selectedQualityCourse.totalScore}
                    <span className="text-sm text-slate-400 font-normal">/100</span>
                  </div>
                  <span
                    className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      selectedQualityCourse.totalScore >= 85
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : selectedQualityCourse.totalScore >= 75
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : selectedQualityCourse.totalScore >= 60
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    Grade {selectedQualityCourse.grade} · {selectedQualityCourse.statusLabel}
                  </span>
                </div>

                <div className="sm:col-span-8 space-y-2">
                  {[
                    {
                      label: 'Keselarasan Metode Pembelajaran–CPL',
                      val: selectedQualityCourse.pillarScores.metodeAlignment,
                      max: 40
                    },
                    {
                      label: 'Kesesuaian Taksonomi Bloom CPMK',
                      val: selectedQualityCourse.pillarScores.bloomAlignment,
                      max: 25
                    },
                    {
                      label: 'Ketuntasan Relasi CPL–CPMK & Bobot 100%',
                      val: selectedQualityCourse.pillarScores.cpmkMappingBalance,
                      max: 20
                    },
                    {
                      label: 'Kelengkapan Instrumen & Dokumentasi OBE',
                      val: selectedQualityCourse.pillarScores.obeDocumentation,
                      max: 15
                    }
                  ].map(p => (
                    <div key={p.label} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-slate-700">{p.label}</span>
                        <span className="font-mono font-bold tabular-nums text-slate-900">
                          {p.val}/{p.max}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${Math.round((p.val / p.max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-CPL Alignment Verification Matrix */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                  Verifikasi Metode Pembelajaran terhadap Setiap Butir CPL:
                </h4>
                <div className="space-y-2">
                  {selectedQualityCourse.cplChecks.map(chk => (
                    <div
                      key={chk.cplKode}
                      className={`p-3 rounded-xl border ${
                        chk.status === 'TIDAK_SELARAS'
                          ? 'bg-rose-50/70 border-rose-200'
                          : chk.status === 'PERLU_PENGUATAN'
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-blue-900">{chk.cplKode}</span>
                          <span className="font-bold text-slate-900 ml-1.5">{chk.cplJudul}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5">
                            ({chk.ranah} · {chk.level})
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            chk.status === 'TIDAK_SELARAS'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : chk.status === 'PERLU_PENGUATAN'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {chk.status === 'SELARAS'
                            ? 'Selaras OBE'
                            : chk.status === 'PERLU_PENGUATAN'
                            ? 'Perlu Penguatan'
                            : 'Tidak Selaras'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-1">{chk.reason}</p>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Metode OBE disarankan: <strong>{chk.expectedMethods.join(', ')}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specific OBE Recommendations */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                  Rekomendasi Perbaikan Spesifik Berbasis Standar OBE:
                </h4>
                <div className="space-y-2">
                  {selectedQualityCourse.recommendations.map(rec => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex items-start gap-2.5"
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                          rec.prioritas === 'Tinggi'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : rec.prioritas === 'Sedang'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {rec.prioritas}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{rec.aspek}</div>
                        <p className="text-slate-700 leading-relaxed mt-0.5">{rec.tindakanRps}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCopyQualityRecommendations(selectedQualityCourse)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Rekomendasi OBE</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQualityCourse(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQualityCourse(null);
                    setActiveSubTab('matriks_cpl_cpmk');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Perbaiki CPMK &amp; Metode RPS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Smart RPS Audit Scanner & Validator */}
      {selectedSmartRpsCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-sky-300 font-semibold">
                  <FileSearch className="w-4 h-4" />
                  <span>Smart RPS Audit Scanner</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{selectedSmartRpsCourse.course.kodeMK}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{selectedSmartRpsCourse.documentCode}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold mt-1">
                  {selectedSmartRpsCourse.course.namaMK}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedSmartRpsCourse.course.dosenPengampu} · Sem{' '}
                  {selectedSmartRpsCourse.course.semesterLabel ||
                    selectedSmartRpsCourse.course.semester}{' '}
                  · {selectedSmartRpsCourse.course.sks} SKS · {selectedSmartRpsCourse.documentSourceType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSmartRpsCourseId(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Tutup modal pemindai Smart RPS Audit"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Validation Banner & Quick Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="p-3.5">
                  <span className="text-[11px] text-slate-500 block">Status Standar Min. 3 OBE</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold">
                    {selectedSmartRpsCourse.validationStatus === 'MEMENUHI_MIN_3_OBE' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 ${
                          selectedSmartRpsCourse.validationStatus === 'TIDAK_MEMENUHI'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      />
                    )}
                    <span
                      className={
                        selectedSmartRpsCourse.validationStatus === 'MEMENUHI_MIN_3_OBE'
                          ? 'text-emerald-800'
                          : selectedSmartRpsCourse.validationStatus === 'TIDAK_MEMENUHI'
                          ? 'text-rose-800'
                          : 'text-amber-800'
                      }
                    >
                      {selectedSmartRpsCourse.validationLabel}
                    </span>
                  </div>
                </div>

                <div className="p-3.5">
                  <span className="text-[11px] text-slate-500 block">Jenis Asesmen Dukung CPL</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
                    {selectedSmartRpsCourse.cplSupportingCount} / min. 3
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                    Total terdeteksi: {selectedSmartRpsCourse.totalDetectedCount} jenis
                  </span>
                </div>

                <div className="p-3.5">
                  <span className="text-[11px] text-slate-500 block">Cakupan CPL (Strong/Med)</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-blue-800 mt-0.5 block">
                    {selectedSmartRpsCourse.coveredCplCount} /{' '}
                    {selectedSmartRpsCourse.totalMappedCplCount} CPL
                  </span>
                  <span className="text-[10px] text-slate-500">Terukur melalui instrumen RPS</span>
                </div>

                <div className="p-3.5">
                  <span className="text-[11px] text-slate-500 block">Akumulasi Bobot RPS</span>
                  <span
                    className={`text-lg font-bold font-mono tabular-nums mt-0.5 block ${
                      Math.abs(selectedSmartRpsCourse.totalCpmkWeightPercent - 100) <= 1
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {selectedSmartRpsCourse.totalCpmkWeightPercent}%
                  </span>
                  <span className="text-[10px] text-slate-500">Target ideal 100%</span>
                </div>
              </div>

              {/* Interactive Document Uploader & Live Clause Scanner */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Pemindai Konten Dokumen RPS ({selectedSmartRpsCourse.documentCode})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Unggah berkas RPS (.txt / .md / .csv / .pdf) atau sunting klausul penilaian di bawah untuk memvalidasi kecukupan ≥ 3 jenis asesmen secara langsung.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg cursor-pointer whitespace-nowrap shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Dokumen RPS</span>
                    <input
                      type="file"
                      accept=".txt,.md,.csv,.pdf"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadRpsDocumentFile(selectedSmartRpsCourse.course.id, file);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <textarea
                  rows={5}
                  value={smartRpsDocDraftText}
                  onChange={e => setSmartRpsDocDraftText(e.target.value)}
                  aria-label="Konten dokumen RPS yang dipindai"
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 mr-1">
                      Tambahkan Cepat Asesmen OBE:
                    </span>
                    {OBE_ASSESSMENT_CATEGORIES.filter(c =>
                      ['CASE_METHOD', 'PROJECT', 'PRAKTIKUM', 'PRESENTASI', 'KUIS', 'TUGAS'].includes(c.id)
                    ).map(cat => {
                      const alreadyInBase = selectedSmartRpsCourse.detectedAssessments.some(
                        d =>
                          d.category.id === cat.id &&
                          !(selectedSmartRpsCourse.customOverride?.addedAssessmentIds || []).includes(
                            cat.id
                          )
                      );
                      const isAddedOverride = (
                        selectedSmartRpsCourse.customOverride?.addedAssessmentIds || []
                      ).includes(cat.id);

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          disabled={alreadyInBase}
                          onClick={() =>
                            handleToggleQuickAssessmentInRps(selectedSmartRpsCourse.course.id, cat.id)
                          }
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                            alreadyInBase
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 opacity-80 cursor-default'
                              : isAddedOverride
                              ? 'bg-sky-700 text-white border-sky-700 cursor-pointer'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer'
                          }`}
                        >
                          {alreadyInBase || isAddedOverride ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                          <span>{cat.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {selectedSmartRpsCourse.customOverride && (
                      <button
                        type="button"
                        onClick={() =>
                          handleResetCourseRpsOverride(selectedSmartRpsCourse.course.id)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset RPS</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleSaveCustomRpsText(
                          selectedSmartRpsCourse.course.id,
                          smartRpsDocDraftText
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                      <span>Pindai Ulang Teks RPS</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2-Column Breakdown: Detected Assessments & Mapped CPL Verification */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-2">
                    Hasil Ekstraksi Jenis Asesmen ({selectedSmartRpsCourse.totalDetectedCount} Ditemukan)
                  </h4>
                  <div className="space-y-2">
                    {selectedSmartRpsCourse.detectedAssessments.length === 0 ? (
                      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800">
                        Belum ditemukan metode penilaian standar OBE pada dokumen RPS ini.
                      </div>
                    ) : (
                      selectedSmartRpsCourse.detectedAssessments.map(det => (
                        <div
                          key={det.category.id}
                          className={`p-3 rounded-xl border ${
                            det.supportsMappedCpl
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-amber-50/50 border-amber-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{det.category.label}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                                det.supportsMappedCpl
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              {det.supportsMappedCpl ? 'Mendukung CPL (OBE)' : 'Perlu Tautan CPL'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            Sumber klausul: <span className="font-mono">{det.sourceClause}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono tabular-nums">
                            CPL Tervalidasi: {det.supportedCplCodes.join(', ') || 'Belum selaras ranah'} · Estimasi bobot ~{det.estimatedWeightPercent}%
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-2">
                      Verifikasi Asesmen per Capaian CPL (Strong / Medium)
                    </h4>
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {selectedSmartRpsCourse.mappedStrongMediumCpls.map(entry => (
                        <div
                          key={entry.cpl.kode}
                          className="p-2.5 flex items-center justify-between gap-2 text-[11px]"
                        >
                          <div>
                            <span className="font-mono font-bold text-blue-900">
                              {entry.cpl.kode}
                            </span>
                            <span className="font-semibold text-slate-800 ml-1.5">
                              {entry.cpl.judul}
                            </span>
                            <span className="text-slate-500 block text-[10px]">
                              {entry.cpl.ranah} · {entry.level}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            {entry.isSupportedByAssessment ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{entry.supportingAssessmentLabels.join(', ')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Belum ada asesmen cocok</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedSmartRpsCourse.missingAssessmentSuggestions.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs mb-2">
                        Rekomendasi Penambahan Jenis Asesmen OBE
                      </h4>
                      <div className="space-y-2">
                        {selectedSmartRpsCourse.missingAssessmentSuggestions.map(sug => (
                          <div
                            key={sug.category.id}
                            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-2"
                          >
                            <div>
                              <div className="font-bold text-slate-900 text-[11px]">
                                + {sug.category.label} (Saran bobot {sug.recommendedWeightPercent}%)
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">{sug.reason}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleQuickAssessmentInRps(
                                  selectedSmartRpsCourse.course.id,
                                  sug.category.id
                                )
                              }
                              className="px-2.5 py-1 text-[11px] font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Terapkan
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                Perubahan simulasi &amp; dokumen RPS tersimpan otomatis pada browser lokal prodi.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSmartRpsCourseId(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSmartRpsCourseId(null);
                    setActiveSubTab('matriks_cpl_cpmk');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Buka Editor CPMK Kurikulum</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Composer Pengingat Dosen Pengampu RPS */}
      {selectedReminderCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-amber-300 font-mono">
                  <span>{selectedReminderCourse.course.kodeMK}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedReminderCourse.statusLabel}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold mt-0.5">
                  Kirim Pengingat Unggah File RPS Terbaru
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Kepada: <strong className="text-white">{selectedReminderCourse.dosenNama}</strong> · {selectedReminderCourse.dosenEmail} · {selectedReminderCourse.dosenNoHp}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReminderCourseId(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                aria-label="Tutup modal pengingat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Subjek Pengingat Email / Notifikasi Prodi
                </label>
                <input
                  type="text"
                  value={reminderDraftSubject}
                  onChange={e => setReminderDraftSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Isi Pesan Pengingat Resmi
                </label>
                <textarea
                  rows={10}
                  value={reminderDraftBody}
                  onChange={e => setReminderDraftBody(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-mono leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReminderText}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks (WhatsApp/WA)</span>
                </button>
                <a
                  href={`mailto:${encodeURIComponent(selectedReminderCourse.dosenEmail)}?subject=${encodeURIComponent(reminderDraftSubject)}&body=${encodeURIComponent(reminderDraftBody)}`}
                  onClick={() =>
                    handleSendQuickCourseReminder(
                      selectedReminderCourse,
                      'Sistem & Email Prodi',
                      reminderDraftBody
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold whitespace-nowrap shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Buka Email Dosen</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReminderCourseId(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSendQuickCourseReminder(
                      selectedReminderCourse,
                      'Sistem & Email Prodi',
                      reminderDraftBody
                    );
                    setSelectedReminderCourseId(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pengingat Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal: 9 Kriteria LED/LKPS */}
      <AkreditasiPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        borangData={borang}
        selectedProdi={selectedProdi}
      />

      {/* Dedicated Modal: Ekspor PDF Matriks Kontribusi CPL per Mata Kuliah (Kop Surat Resmi FT UNBARI) */}
      {isMatrixPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Dialog Header */}
            <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold">
                    Ekspor Laporan PDF Matriks Kontribusi CPL per Mata Kuliah
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Kop Surat Resmi Fakultas Teknik UNBARI · {selectedProdi.nama}
                  </p>
                </div>
              </div>

              {/* Filter Cakupan Borang langsung di Modal PDF */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-blue-400" />
                  <select
                    value={matrixSemesterFilter}
                    onChange={(e) => setMatrixSemesterFilter(e.target.value)}
                    aria-label="Filter semester ekspor PDF"
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
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
                    <option value="B">Semester B</option>
                    <option value="K">Semester K</option>
                    <option value="LAINNYA">Lintas (-)</option>
                  </select>

                  <select
                    value={matrixKelompokFilter}
                    onChange={(e) => setMatrixKelompokFilter(e.target.value as 'ALL' | 'Wajib' | 'Pilihan')}
                    aria-label="Filter kelompok Wajib atau Pilihan ekspor PDF"
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="ALL">Wajib &amp; Pilihan</option>
                    <option value="Wajib">Kelompok Wajib</option>
                    <option value="Pilihan">Kelompok Pilihan</option>
                  </select>

                  <div className="inline-flex items-center p-0.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPdfOrientation('landscape')}
                      className={`px-2 py-1 rounded font-semibold transition-colors cursor-pointer ${
                        pdfOrientation === 'landscape'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      A4 Landscape
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfOrientation('portrait')}
                      className={`px-2 py-1 rounded font-semibold transition-colors cursor-pointer ${
                        pdfOrientation === 'portrait'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      A4 Portrait
                    </button>
                  </div>

                  {hasMatrixFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setMatrixSemesterFilter('ALL');
                        setMatrixKelompokFilter('ALL');
                        setMatrixSearchQuery('');
                      }}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 cursor-pointer"
                      title="Reset filter cakupan dokumen"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={filteredMatrixCourses.length === 0}
                  onClick={() =>
                    exportMatriksCplToPdf(matrixPdfAreaRef.current, selectedProdi, {
                      filterLabel: hasMatrixFilter ? matrixScopeLabel : undefined,
                      orientation: pdfOrientation
                    })
                  }
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Simpan PDF / Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMatrixPdfModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area rendered via PrintableReport wrapper */}
            <div className="p-6 overflow-y-auto bg-slate-100/80 flex justify-center">
              <PrintableReport
                ref={matrixPdfAreaRef}
                mode="preview"
                orientation={pdfOrientation}
                prodi={selectedProdi}
                cpls={activeCplsObe}
                courses={filteredMatrixCourses}
                gapAnalysisRows={gapAnalysisRows}
                meta={matrixPdfMeta}
                facultyLogoUrl={OFFICIAL_FT_UNBARI_LOGO_URL}
                reportDate={reportGenerationDate}
              />
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                disabled={filteredMatrixCourses.length === 0}
                onClick={handleExportMatrixExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Excel (.xlsx) Cakupan Ini</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMatrixPdfModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={filteredMatrixCourses.length === 0}
                  onClick={() =>
                    exportMatriksCplToPdf(matrixPdfAreaRef.current, selectedProdi, {
                      filterLabel: hasMatrixFilter ? matrixScopeLabel : undefined,
                      orientation: pdfOrientation
                    })
                  }
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Ekspor PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
