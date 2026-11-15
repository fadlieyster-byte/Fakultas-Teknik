import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Flame,
  LineChart as LineChartIcon,
  Mail,
  Pencil,
  Printer,
  Radar as RadarIcon,
  Save,
  Send,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  X
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import * as XLSX from 'xlsx';
import { ProgramStudiInfo } from '../types/index';
import { StandardKopSurat } from './StandardKopSurat';
import { printDocumentElement } from '../utils/printHelper';
import { logKaprodiActivity } from '../utils/activityLogHelper';
import {
  getWorkspaceSession,
  sendEmailViaGmailApi,
  subscribeWorkspaceSession,
  WorkspaceAuthSession
} from '../utils/googleWorkspaceService';
import { WorkspaceMutationConfirmDialog } from './GoogleWorkspaceSignInCard';

interface IkuMetricRecord {
  kode: 'IKU-1' | 'IKU-2' | 'IKU-3' | 'IKU-4' | 'IKU-5' | 'IKU-6' | 'IKU-7' | 'IKU-8';
  nama: string;
  satuan: string;
  target: number;
  realisasi: number;
  y2024: number;
  y2025: number;
  y2026: number;
  pic: string;
  semesterValues: number[]; // 6 semesters: 23/24 Gjl, 23/24 Gnp, 24/25 Gjl, 24/25 Gnp, 25/26 Gjl, 25/26 Gnp
  monthlyValues: number[]; // 12 months: Jan..Des
  drillDownItems: Array<{
    judul: string;
    kategori: 'Mata Kuliah' | 'Program MBKM' | 'Laboratorium / Riset' | 'Kemitraan DUDI';
    capaian: string;
    penanggungJawab: string;
  }>;
}

const STORAGE_TARGETS_KEY = 'sikaprodi_v15_iku_targets';
const STORAGE_AUTO_REPORT_KEY = 'sikaprodi_v15_iku_auto_report';

const SEMESTER_LABELS = [
  '23/24 Gjl',
  '23/24 Gnp',
  '24/25 Gjl',
  '24/25 Gnp',
  '25/26 Gjl',
  '25/26 Gnp'
];

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agt',
  'Sep',
  'Okt',
  'Nov',
  'Des'
];

function buildInitialIkuData(prodiId: string): IkuMetricRecord[] {
  const offset =
    prodiId === 'LINGKUNGAN' ? -2 : prodiId === 'LISTRIK_D3' ? 2 : 0;

  return [
    {
      kode: 'IKU-1',
      nama: 'Lulusan Mendapat Pekerjaan Layak',
      satuan: '%',
      target: 82,
      realisasi: Math.min(98, 86 + offset),
      y2024: 79 + offset,
      y2025: 83 + offset,
      y2026: 86 + offset,
      pic: 'Koordinator Tracer Study & Kemahasiswaan',
      semesterValues: [74, 77, 79, 82, 84, 86 + offset],
      monthlyValues: [78, 80, 81, 82, 83, 84, 85, 85, 86, 86, 87, 86 + offset],
      drillDownItems: [
        { judul: 'Rekrutmen Campus Hiring PT Waskita & Adhi Karya', kategori: 'Kemitraan DUDI', capaian: '28 Lulusan Terserap < 4 Bulan', penanggungJawab: 'Ir. Rioni Rizki Aldiansyah, MT' },
        { judul: 'Sertifikasi SKK Konstruksi Jenjang 7 LPJK', kategori: 'Program MBKM', capaian: '91% Lulus Uji Kompetensi', penanggungJawab: 'Tim Sertifikasi Profesi FT' },
        { judul: 'Tracer Study Cohort 2025/2026 (Gaji >= 1.2x UMP)', kategori: 'Kemitraan DUDI', capaian: '86% Pekerjaan Layak', penanggungJawab: 'GPMF & Koordinator Alumni' }
      ]
    },
    {
      kode: 'IKU-2',
      nama: 'Mahasiswa Pengalaman Luar Kampus (MBKM)',
      satuan: '%',
      target: 45,
      realisasi: 42 + offset,
      y2024: 36,
      y2025: 40,
      y2026: 42 + offset,
      pic: 'Koordinator Kerja Praktek & MBKM',
      semesterValues: [31, 34, 36, 38, 40, 42 + offset],
      monthlyValues: [34, 36, 38, 39, 41, 40, 38, 42, 43, 44, 42 + offset, 43 + offset],
      drillDownItems: [
        { judul: 'Magang Bersertifikat MSIB Batch 7 Proyek Jalan Tol', kategori: 'Program MBKM', capaian: '34 Mahasiswa Konversi 20 SKS', penanggungJawab: 'Koordinator KP & MBKM' },
        { judul: 'KKN Tematik Infrastruktur Desa & Sanitasi Jambi', kategori: 'Program MBKM', capaian: '46 Mahasiswa Terlibat', penanggungJawab: 'LPPM & FT UNBARI' },
        { judul: 'Mata Kuliah Kerja Praktek Industri (TKP-401)', kategori: 'Mata Kuliah', capaian: '100% Terintegrasi Logbook DUDI', penanggungJawab: 'Dosen Pembimbing Lapangan' }
      ]
    },
    {
      kode: 'IKU-3',
      nama: 'Dosen Berkegiatan Tridharma di Luar Kampus',
      satuan: '%',
      target: 35,
      realisasi: 28,
      y2024: 34,
      y2025: 31,
      y2026: 28, // Tren turun 3 tahun beruntun -> highlight merah
      pic: 'Wakil Dekan I & Ketua KBK',
      semesterValues: [36, 35, 34, 32, 30, 28],
      monthlyValues: [33, 32, 31, 30, 29, 29, 28, 27, 28, 27, 28, 28],
      drillDownItems: [
        { judul: 'Tenaga Ahli Konsultansi Drainase Kota Jambi', kategori: 'Kemitraan DUDI', capaian: '4 Dosen Praktisi Terlibat', penanggungJawab: 'Ir. Ahmad Ridwan, ST., MT' },
        { judul: 'Dosen Pendamping Proyek Bangunan Air PU PR', kategori: 'Laboratorium / Riset', capaian: '3 Kontrak Swakelola Tipe II', penanggungJawab: 'Lab Hidrolika FT UNBARI' }
      ]
    },
    {
      kode: 'IKU-4',
      nama: 'Praktisi Mengajar & Sertifikasi Profesi Dosen',
      satuan: '%',
      target: 50,
      realisasi: 54 + offset,
      y2024: 44,
      y2025: 49,
      y2026: 54 + offset,
      pic: 'Kaprodi & Koordinator Praktisi Mengajar',
      semesterValues: [40, 43, 45, 48, 51, 54 + offset],
      monthlyValues: [45, 46, 48, 50, 52, 51, 50, 52, 54, 55, 54 + offset, 56],
      drillDownItems: [
        { judul: 'Program Praktisi Mengajar Kemendikbudristek (BIM & K3)', kategori: 'Mata Kuliah', capaian: '12 Pertemuan Kolaboratif Industri', penanggungJawab: 'Ir. Yulianto, ST., MT' },
        { judul: 'Sertifikasi Insinyur Profesional Madya (IPM PII)', kategori: 'Program MBKM', capaian: '9 Dosen Tetap Bersertifikat Aktif', penanggungJawab: 'Senat Fakultas Teknik' }
      ]
    },
    {
      kode: 'IKU-5',
      nama: 'Hasil Kerja Dosen Digunakan Masyarakat / HKI',
      satuan: '%',
      target: 40,
      realisasi: 46,
      y2024: 35,
      y2025: 41,
      y2026: 46,
      pic: 'Kepala Pusat Penelitian & Pengabdian FT',
      semesterValues: [32, 34, 36, 40, 43, 46],
      monthlyValues: [36, 37, 39, 41, 42, 43, 44, 44, 45, 46, 46, 47],
      drillDownItems: [
        { judul: 'Paten Sederhana: Beton Geopolimer Abu Sawit Jambi', kategori: 'Laboratorium / Riset', capaian: 'Terdaftar DJKI & Uji Lab Bahan', penanggungJawab: 'Lab Bahan & Konstruksi' },
        { judul: 'Modul IPAL Komunal Ramah Lingkungan Sungai Batanghari', kategori: 'Laboratorium / Riset', capaian: 'Diadopsi 3 Desa Mitra Muaro Jambi', penanggungJawab: 'Lab Kualitas Air & Lingkungan' }
      ]
    },
    {
      kode: 'IKU-6',
      nama: 'Kemitraan Program Studi dengan DUDI/Kampus Top',
      satuan: '%',
      target: 70,
      realisasi: 74 + offset,
      y2024: 58,
      y2025: 67,
      y2026: 74 + offset,
      pic: 'Unit Kerjasama & Urusan Internasional',
      semesterValues: [52, 56, 61, 66, 70, 74 + offset],
      monthlyValues: [60, 62, 65, 67, 68, 70, 71, 72, 73, 74, 74 + offset, 75],
      drillDownItems: [
        { judul: 'MoA Implementatif PT PLN (Persero) UP3 Jambi & BWS VI', kategori: 'Kemitraan DUDI', capaian: '12 IA Aktif & Magang Terjadwal', penanggungJawab: 'Kaprodi & WD III' },
        { judul: 'Joint Research Smart Microgrid dengan UGM & Unja', kategori: 'Laboratorium / Riset', capaian: '2 Publikasi SINTA 2 & Scopus Q3', penanggungJawab: 'Lab Konversi Energi' }
      ]
    },
    {
      kode: 'IKU-7',
      nama: 'Kelas Kolaboratif & Partisipatif (PjBL / Case Method)',
      satuan: '%',
      target: 75,
      realisasi: 78,
      y2024: 66,
      y2025: 72,
      y2026: 78,
      pic: 'Gugus Kendali Mutu Prodi (GKMP)',
      semesterValues: [60, 64, 68, 71, 75, 78],
      monthlyValues: [68, 70, 72, 74, 75, 73, 71, 75, 77, 78, 78, 79],
      drillDownItems: [
        { judul: 'Perancangan Struktur Gedung Tahan Gempa (PjBL)', kategori: 'Mata Kuliah', capaian: 'Bobot Evaluasi PjBL 55% di RPS', penanggungJawab: 'Tim Pengampu Struktur' },
        { judul: 'Studio Pengolahan Limbah Cair Industri Sawit', kategori: 'Mata Kuliah', capaian: 'Case Method Lapangan Terverifikasi AMI', penanggungJawab: 'Dr. Ir. Sri Wahyuni, MT' }
      ]
    },
    {
      kode: 'IKU-8',
      nama: 'Program Studi Berstandar / Akreditasi Internasional',
      satuan: '%',
      target: 60,
      realisasi: 52,
      y2024: 59,
      y2025: 55,
      y2026: 52, // Tren turun 3 tahun beruntun -> highlight merah
      pic: 'Tim Akreditasi IABEE & LAM-Teknik',
      semesterValues: [61, 60, 58, 56, 54, 52],
      monthlyValues: [58, 57, 56, 55, 55, 54, 53, 53, 52, 52, 52, 51],
      drillDownItems: [
        { judul: 'Penyelarasan Student Outcomes IABEE (a–k) di Matriks CPL', kategori: 'Mata Kuliah', capaian: '78% RPS Sudah Bilingual & OBE', penanggungJawab: 'Tim Taskforce Akreditasi' },
        { judul: 'Benchmarked Curriculum Review dengan UTM Malaysia', kategori: 'Kemitraan DUDI', capaian: 'Draf MoU Visiting Lecturer Selesai', penanggungJawab: 'Dekanat FT UNBARI' }
      ]
    }
  ];
}

function getIkuStatus(realisasi: number, target: number): {
  label: 'Tercapai' | 'Perlu Perhatian' | 'Kritis';
  badgeClass: string;
  dotColor: string;
  barColor: string;
} {
  if (realisasi >= target) {
    return {
      label: 'Tercapai',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      dotColor: 'bg-emerald-600',
      barColor: 'bg-emerald-600'
    };
  }
  if (realisasi >= target - 6) {
    return {
      label: 'Perlu Perhatian',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      dotColor: 'bg-amber-500',
      barColor: 'bg-amber-500'
    };
  }
  return {
    label: 'Kritis',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    dotColor: 'bg-rose-600',
    barColor: 'bg-rose-600'
  };
}

function getHeatmapCellStyle(val: number, target: number): string {
  const ratio = target > 0 ? val / target : 1;
  if (ratio >= 1.05) return 'bg-emerald-700 text-white border-emerald-800';
  if (ratio >= 0.98) return 'bg-emerald-500 text-white border-emerald-600';
  if (ratio >= 0.9) return 'bg-emerald-200 text-emerald-950 border-emerald-300';
  if (ratio >= 0.82) return 'bg-amber-200 text-amber-950 border-amber-300';
  return 'bg-rose-200 text-rose-950 border-rose-300';
}

interface IkuCommandCenterProps {
  selectedProdi: ProgramStudiInfo;
  scopeFilter: 'prodi' | 'all';
  onShowToast?: (msg: string) => void;
}

export const IkuCommandCenter: React.FC<IkuCommandCenterProps> = ({
  selectedProdi,
  scopeFilter,
  onShowToast
}) => {
  const [selectedTahunAkademik, setSelectedTahunAkademik] = useState<'2024/2025' | '2025/2026' | '2026/2027'>('2026/2027');
  const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [scorecardStatusFilter, setScorecardStatusFilter] = useState<'ALL' | 'Tercapai' | 'Perlu Perhatian' | 'Kritis'>('ALL');
  const [heatmapMode, setHeatmapMode] = useState<'monthly' | 'semester'>('monthly');
  const [activeHeatmapTooltip, setActiveHeatmapTooltip] = useState<{
    kode: string;
    periode: string;
    nilai: number;
    target: number;
  } | null>(null);

  const [ikuRecords, setIkuRecords] = useState<IkuMetricRecord[]>(() => {
    const base = buildInitialIkuData(selectedProdi.id);
    try {
      const saved = localStorage.getItem(STORAGE_TARGETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, Record<string, number>>;
        const prodiTargets = parsed[selectedProdi.id];
        if (prodiTargets) {
          return base.map(item => ({
            ...item,
            target: typeof prodiTargets[item.kode] === 'number' ? prodiTargets[item.kode] : item.target
          }));
        }
      }
    } catch {
      // ignore storage errors
    }
    return base;
  });

  // Sync base when prodi switches while keeping persisted custom targets
  useEffect(() => {
    const base = buildInitialIkuData(selectedProdi.id);
    try {
      const saved = localStorage.getItem(STORAGE_TARGETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, Record<string, number>>;
        const prodiTargets = parsed[selectedProdi.id];
        if (prodiTargets) {
          setIkuRecords(
            base.map(item => ({
              ...item,
              target: typeof prodiTargets[item.kode] === 'number' ? prodiTargets[item.kode] : item.target
            }))
          );
          return;
        }
      }
    } catch {
      // ignore
    }
    setIkuRecords(base);
  }, [selectedProdi.id]);

  // Inline target editor state
  const [editingKode, setEditingKode] = useState<string | null>(null);
  const [editTargetValue, setEditTargetValue] = useState<string>('');

  // Radar drill-down modal
  const [drillDownIku, setDrillDownIku] = useState<IkuMetricRecord | null>(null);

  // Full IKU PDF report modal
  const [showIkuPdfModal, setShowIkuPdfModal] = useState<boolean>(false);
  const ikuPdfRef = useRef<HTMLDivElement>(null);
  const drillPdfRef = useRef<HTMLDivElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Automated IKU Reporting (Gmail 1st of month / on-demand dispatch)
  const [workspaceSession, setWorkspaceSession] = useState<WorkspaceAuthSession | null>(() =>
    getWorkspaceSession()
  );
  const [autoReportConfig, setAutoReportConfig] = useState<{
    enabled: boolean;
    recipients: string;
    lastDispatched: string;
  }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTO_REPORT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      enabled: true,
      recipients: 'fadlieyster@gmail.com, ftunbari.tpa@gmail.com',
      lastDispatched: '01 Nov 2026, 08:00 WIB'
    };
  });
  const [showSendGmailConfirm, setShowSendGmailConfirm] = useState<boolean>(false);
  const [isSendingGmail, setIsSendingGmail] = useState<boolean>(false);

  useEffect(() => {
    return subscribeWorkspaceSession(setWorkspaceSession);
  }, []);

  const adjustedIkuRecords = useMemo(() => {
    const yearDelta =
      selectedTahunAkademik === '2024/2025' ? -5 : selectedTahunAkademik === '2025/2026' ? -2 : 0;
    const semDelta = selectedSemester === 'Genap' ? 1 : 0;
    const scopeDelta = scopeFilter === 'all' ? 1 : 0;

    return ikuRecords.map(item => {
      const realisasiAdjusted = Math.max(10, Math.min(100, item.realisasi + yearDelta + semDelta + scopeDelta));
      return {
        ...item,
        displayRealisasi: realisasiAdjusted,
        status: getIkuStatus(realisasiAdjusted, item.target),
        isThreeYearDownward: item.y2024 > item.y2025 && item.y2025 > item.y2026
      };
    });
  }, [ikuRecords, selectedTahunAkademik, selectedSemester, scopeFilter]);

  const summaryCounts = useMemo(() => {
    const tercapai = adjustedIkuRecords.filter(r => r.status.label === 'Tercapai').length;
    const perhatian = adjustedIkuRecords.filter(r => r.status.label === 'Perlu Perhatian').length;
    const kritis = adjustedIkuRecords.filter(r => r.status.label === 'Kritis').length;
    const downward = adjustedIkuRecords.filter(r => r.isThreeYearDownward).length;
    const avgCap =
      adjustedIkuRecords.reduce((acc, r) => acc + r.displayRealisasi, 0) /
      Math.max(1, adjustedIkuRecords.length);
    return { tercapai, perhatian, kritis, downward, avgCap };
  }, [adjustedIkuRecords]);

  const filteredScorecards = useMemo(() => {
    if (scorecardStatusFilter === 'ALL') return adjustedIkuRecords;
    return adjustedIkuRecords.filter(r => r.status.label === scorecardStatusFilter);
  }, [adjustedIkuRecords, scorecardStatusFilter]);

  const radarChartData = useMemo(() => {
    return adjustedIkuRecords.map(item => ({
      kode: item.kode,
      subjek: `${item.kode} (${item.realisasi}%)`,
      Realisasi: item.displayRealisasi,
      Target: item.target
    }));
  }, [adjustedIkuRecords]);

  const threeYearTrendData = useMemo(() => {
    return [
      {
        tahun: '2024 (TS-2)',
        ...Object.fromEntries(ikuRecords.map(r => [r.kode, r.y2024]))
      },
      {
        tahun: '2025 (TS-1)',
        ...Object.fromEntries(ikuRecords.map(r => [r.kode, r.y2025]))
      },
      {
        tahun: '2026 (TS)',
        ...Object.fromEntries(ikuRecords.map(r => [r.kode, r.y2026]))
      }
    ];
  }, [ikuRecords]);

  const persistTargets = (updated: IkuMetricRecord[]) => {
    try {
      const saved = localStorage.getItem(STORAGE_TARGETS_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      parsed[selectedProdi.id] = Object.fromEntries(updated.map(r => [r.kode, r.target]));
      localStorage.setItem(STORAGE_TARGETS_KEY, JSON.stringify(parsed));
    } catch {
      // ignore
    }
  };

  const handleSaveInlineTarget = (kode: string) => {
    const val = Number(editTargetValue);
    if (isNaN(val) || val < 1 || val > 100) {
      onShowToast?.('Nilai target IKU harus antara 1% hingga 100%.');
      return;
    }
    const prevItem = ikuRecords.find(r => r.kode === kode);
    const updated = ikuRecords.map(r => (r.kode === kode ? { ...r, target: val } : r));
    setIkuRecords(updated);
    persistTargets(updated);
    setEditingKode(null);

    logKaprodiActivity({
      actor: selectedProdi.kaprodi,
      role: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      category: 'PERUBAHAN_IKU',
      actionTitle: `Pembaruan Target ${kode} (${selectedProdi.singkatan})`,
      detail: `Mengubah target ${kode} (${prevItem?.nama || ''}) dari ${prevItem?.target ?? '-'}% menjadi ${val}%.`,
      severity: 'warning'
    });
    onShowToast?.(`Target ${kode} berhasil diperbarui menjadi ${val}% dan dicatat pada Log Aktivitas Kaprodi.`);
  };

  const handleCsvBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = String(ev.target?.result || '');
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      let appliedCount = 0;
      const targetMap: Record<string, number> = {};

      lines.forEach(line => {
        const parts = line.split(/[;,]/).map(s => s.trim());
        if (parts.length >= 2) {
          const code = parts[0].toUpperCase();
          const num = Number(parts[1]);
          if (code.startsWith('IKU-') && !isNaN(num) && num >= 1 && num <= 100) {
            targetMap[code] = num;
            appliedCount++;
          }
        }
      });

      if (appliedCount === 0) {
        onShowToast?.('Format CSV tidak dikenali. Gunakan format: IKU-1,85 per baris.');
        return;
      }

      const updated = ikuRecords.map(r =>
        typeof targetMap[r.kode] === 'number' ? { ...r, target: targetMap[r.kode] } : r
      );
      setIkuRecords(updated);
      persistTargets(updated);

      logKaprodiActivity({
        actor: selectedProdi.kaprodi,
        role: `Kaprodi ${selectedProdi.singkatan}`,
        prodiId: selectedProdi.id,
        category: 'PERUBAHAN_IKU',
        actionTitle: `Impor Massal CSV Target IKU (${appliedCount} Indikator)`,
        detail: `Memperbarui ${appliedCount} target IKU prodi ${selectedProdi.singkatan} melalui file CSV (${file.name}).`,
        severity: 'warning'
      });
      onShowToast?.(`Berhasil mengimpor ${appliedCount} target IKU dari ${file.name}.`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = [
      'kode,target',
      ...ikuRecords.map(r => `${r.kode},${r.target}`)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Template_Target_IKU_${selectedProdi.singkatan}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const rows = adjustedIkuRecords.map(r => ({
      'Kode IKU': r.kode,
      'Indikator Kinerja Utama': r.nama,
      'Target (%)': r.target,
      'Realisasi (%)': r.displayRealisasi,
      'Status Capaian': r.status.label,
      'Tren 2024 (%)': r.y2024,
      'Tren 2025 (%)': r.y2025,
      'Tren 2026 (%)': r.y2026,
      'Peringatan Tren': r.isThreeYearDownward ? 'MENURUN 3 TAHUN' : 'Stabil / Meningkat',
      'Penanggung Jawab': r.pic
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Capaian_IKU_${selectedProdi.singkatan}`);
    XLSX.writeFile(wb, `Laporan_IKU_${selectedProdi.singkatan}_${selectedTahunAkademik.replace('/', '-')}.xlsx`);

    logKaprodiActivity({
      actor: selectedProdi.kaprodi,
      role: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      category: 'EXPORT_DOKUMEN',
      actionTitle: `Ekspor Excel Capaian 8 IKU (${selectedProdi.singkatan})`,
      detail: `Mengunduh rekapitulasi target & realisasi 8 IKU dalam format Excel (.xlsx).`,
      severity: 'info'
    });
    onShowToast?.('File Excel rekapitulasi 8 IKU berhasil diunduh.');
  };

  const handlePrintIkuPdf = () => {
    if (!ikuPdfRef.current) return;
    printDocumentElement(ikuPdfRef.current, {
      documentTitle: `Laporan_Capaian_IKU_${selectedProdi.singkatan}_${selectedTahunAkademik.replace('/', '-')}`,
      orientation: 'portrait'
    });
    logKaprodiActivity({
      actor: selectedProdi.kaprodi,
      role: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      category: 'EXPORT_DOKUMEN',
      actionTitle: `Ekspor PDF Laporan Capaian IKU (${selectedProdi.singkatan})`,
      detail: `Mencetak Laporan Eksekutif Capaian 8 IKU ber-Kop Surat resmi UNBARI untuk evaluasi tahunan.`,
      severity: 'info'
    });
    onShowToast?.('Dokumen Laporan Capaian IKU siap cetak / simpan sebagai PDF.');
  };

  const handlePrintDrillDownPdf = () => {
    if (!drillPdfRef.current || !drillDownIku) return;
    printDocumentElement(drillPdfRef.current, {
      documentTitle: `Audit_DrillDown_${drillDownIku.kode}_${selectedProdi.singkatan}`,
      orientation: 'portrait'
    });
    logKaprodiActivity({
      actor: selectedProdi.kaprodi,
      role: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      category: 'EXPORT_DOKUMEN',
      actionTitle: `Ekspor Audit Kontributor ${drillDownIku.kode}`,
      detail: `Mencetak rincian mata kuliah, laboratorium & mitra penyumbang capaian ${drillDownIku.kode}.`,
      severity: 'info'
    });
  };

  const handleToggleAutoReport = () => {
    const next = { ...autoReportConfig, enabled: !autoReportConfig.enabled };
    setAutoReportConfig(next);
    try {
      localStorage.setItem(STORAGE_AUTO_REPORT_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    onShowToast?.(
      next.enabled
        ? 'Automated IKU Reporting (Setiap Tanggal 1) diaktifkan.'
        : 'Automated IKU Reporting dinonaktifkan.'
    );
  };

  const handleExecuteGmailDispatch = async () => {
    setShowSendGmailConfirm(false);
    const recipients = autoReportConfig.recipients
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      onShowToast?.('Masukkan minimal satu alamat email penerima.');
      return;
    }

    const summaryLines = adjustedIkuRecords
      .map(
        r =>
          `- ${r.kode} (${r.nama}): Realisasi ${r.displayRealisasi}% / Target ${r.target}% [${r.status.label}]${
            r.isThreeYearDownward ? ' *TREN MENURUN 3 TAHUN*' : ''
          }`
      )
      .join('\n');

    const subject = `[SiKaprodi FT UNBARI] Laporan Otomatis Capaian 8 IKU — ${selectedProdi.nama} (${selectedTahunAkademik})`;
    const bodyText = [
      `Yth. Pimpinan Fakultas Teknik Universitas Batanghari & Tim GPMF,`,
      '',
      `Berikut ringkasan otomatis capaian 8 Indikator Kinerja Utama (IKU) Program Studi ${selectedProdi.nama} periode ${selectedTahunAkademik} (${selectedSemester}):`,
      '',
      `Rata-rata Capaian Prodi: ${summaryCounts.avgCap.toFixed(1)}% | Tercapai: ${summaryCounts.tercapai}/8 | Perlu Perhatian: ${summaryCounts.perhatian} | Kritis: ${summaryCounts.kritis}`,
      '',
      summaryLines,
      '',
      `Laporan ini dikirim otomatis melalui SiKaprodi FT UNBARI.`,
      `Kaprodi: ${selectedProdi.kaprodi}`
    ].join('\n');

    if (workspaceSession) {
      setIsSendingGmail(true);
      try {
        await sendEmailViaGmailApi(workspaceSession.accessToken, {
          to: recipients,
          subject,
          bodyText
        });
        const timestampLabel =
          new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ', ' +
          new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
          ' WIB';
        const nextCfg = { ...autoReportConfig, lastDispatched: timestampLabel };
        setAutoReportConfig(nextCfg);
        try {
          localStorage.setItem(STORAGE_AUTO_REPORT_KEY, JSON.stringify(nextCfg));
        } catch {
          // ignore
        }
        logKaprodiActivity({
          actor: selectedProdi.kaprodi,
          role: `Kaprodi ${selectedProdi.singkatan}`,
          prodiId: selectedProdi.id,
          category: 'SYNC_WORKSPACE',
          actionTitle: `Pengiriman Gmail Automated IKU Report`,
          detail: `Mengirim rekapitulasi 8 IKU prodi ${selectedProdi.singkatan} via Gmail API ke ${recipients.join(', ')}.`,
          severity: 'info'
        });
        onShowToast?.(`Laporan 8 IKU berhasil dikirim via Gmail API ke ${recipients.join(', ')}.`);
      } catch (err) {
        onShowToast?.(err instanceof Error ? err.message : 'Gagal mengirim email via Gmail API.');
      } finally {
        setIsSendingGmail(false);
      }
    } else {
      const mailtoLink = `mailto:${encodeURIComponent(recipients.join(','))}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(bodyText)}`;
      const a = document.createElement('a');
      a.href = mailtoLink;
      a.click();
      onShowToast?.('Membuka aplikasi email default (hubungkan Google Workspace untuk pengiriman langsung Gmail API).');
    }
  };

  return (
    <section className="space-y-6">
      {/* Header Banner Command Center IKU */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#065f46] text-white flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Dashboard Eksekutif IKU &amp; Komando Kinerja 8 Indikator Utama
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#ecfdf5] text-[#065f46] border border-emerald-200 text-[11px] font-bold">
                  {scopeFilter === 'prodi' ? selectedProdi.singkatan : 'Seluruh FT UNBARI'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Pemantauan strategis 8 IKU Kemendikbudristek, analisis heatmap musiman &amp; semesteran, radar drill-down kontributor, serta manajemen target tahunan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTahunAkademik}
              onChange={e => setSelectedTahunAkademik(e.target.value as '2024/2025' | '2025/2026' | '2026/2027')}
              className="px-3 py-1.5 bg-[#fafaf5] border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              aria-label="Filter Tahun Akademik IKU"
            >
              <option value="2026/2027">TA 2026/2027</option>
              <option value="2025/2026">TA 2025/2026</option>
              <option value="2024/2025">TA 2024/2025</option>
            </select>

            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value as 'Ganjil' | 'Genap')}
              className="px-3 py-1.5 bg-[#fafaf5] border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              aria-label="Filter Semester IKU"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 hover:bg-[#ecfdf5] text-[#065f46] font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowIkuPdfModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#065f46] hover:bg-emerald-900 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Ekspor Laporan Capaian IKU</span>
            </button>
          </div>
        </div>

        {/* Summary Strip + Scorecard Filter */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-[#fafaf5] border border-slate-200 font-semibold text-slate-800">
              Rata-rata Capaian: <span className="font-mono font-bold text-[#065f46] tabular-nums">{summaryCounts.avgCap.toFixed(1)}%</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 font-semibold text-emerald-900">
              Hijau (Tercapai): <span className="font-mono font-bold tabular-nums">{summaryCounts.tercapai}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 font-semibold text-amber-900">
              Kuning (Perlu Perhatian): <span className="font-mono font-bold tabular-nums">{summaryCounts.perhatian}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 font-semibold text-rose-900">
              Merah (Kritis): <span className="font-mono font-bold tabular-nums">{summaryCounts.kritis}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start">
            {(['ALL', 'Tercapai', 'Perlu Perhatian', 'Kritis'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setScorecardStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  scorecardStatusFilter === st
                    ? 'bg-white text-[#065f46] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'Semua 8 IKU' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive 8 IKU Scorecard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mt-4">
          {filteredScorecards.map(item => {
            const delta = item.displayRealisasi - item.target;
            const pct = Math.min(100, Math.round((item.displayRealisasi / Math.max(1, item.target)) * 100));
            return (
              <div
                key={item.kode}
                onClick={() => setDrillDownIku(item)}
                className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                  item.status.label === 'Kritis'
                    ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                    : item.status.label === 'Perlu Perhatian'
                    ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                    : 'bg-[#fafaf5] border-emerald-200 hover:border-[#065f46]'
                }`}
                title="Klik untuk membuka rincian mata kuliah, program MBKM & lab penyumbang IKU"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-extrabold text-slate-900">{item.kode}</span>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold inline-flex items-center gap-1 ${item.status.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status.dotColor}`} />
                    {item.status.label}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2 min-h-[2rem]">
                  {item.nama}
                </h3>

                <div className="mt-3 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold font-mono text-slate-950 tabular-nums">
                      {item.displayRealisasi}%
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      / {item.target}%
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold tabular-nums inline-flex items-center gap-0.5 ${
                      delta >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {delta >= 0 ? `+${delta}%` : `${delta}%`}
                  </span>
                </div>

                <div className="mt-2 h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.status.barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate">{item.pic}</span>
                  <span className="font-semibold text-[#065f46] shrink-0">Drill-down →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Visualisasi Kinerja Prodi (Target vs Actual Bar) + Monitoring Pencapaian IKU Real-time */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#065f46]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Visualisasi Kinerja Prodi ({selectedTahunAkademik} · {selectedSemester})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Perbandingan Target IKU vs Realisasi Aktual Program Studi {selectedProdi.singkatan}.
                </p>
              </div>
            </div>
          </div>
          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adjustedIkuRecords} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="kode" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} unit="%" />
                <Tooltip
                  formatter={(value) => [`${value ?? 0}%`, 'Capaian']}
                  contentStyle={{ borderRadius: 10, borderColor: '#cbd5e1', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="target" name="Target IKU (%)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="displayRealisasi" name="Realisasi Aktual (%)" fill="#065f46" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monitoring Pencapaian IKU Real-time */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#065f46]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monitoring Pencapaian IKU Real-time
                </h3>
                <p className="text-[11px] text-slate-500">
                  Indikator progres dinamis &amp; status kendali mutu prodi.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
            {adjustedIkuRecords.map(item => {
              const isOnTrack = item.displayRealisasi >= item.target - 3;
              const pct = Math.min(100, Math.round((item.displayRealisasi / Math.max(1, item.target)) * 100));
              return (
                <div key={item.kode} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-800 truncate">
                      <span className="font-mono font-bold text-[#065f46] mr-1.5">{item.kode}</span>
                      {item.nama}
                    </span>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isOnTrack
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {isOnTrack ? 'On Track' : 'Perlu Intervensi'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOnTrack ? 'bg-[#065f46]' : 'bg-rose-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-700 tabular-nums w-20 text-right">
                      {item.displayRealisasi}% / {item.target}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Visualisasi Peta Panas (Heatmap) Pencapaian IKU — Semesteran & Bulanan (Jan-Des) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Visualisasi Peta Panas (Heatmap) Pencapaian 8 IKU Universitas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Analisis intensitas capaian musiman per bulan (Jan–Des) dan fluktuasi performa antar-semester untuk deteksi dini tren penurunan prodi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start">
            <button
              type="button"
              onClick={() => setHeatmapMode('monthly')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                heatmapMode === 'monthly'
                  ? 'bg-[#065f46] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Peta Panas Bulanan (Jan–Des)
            </button>
            <button
              type="button"
              onClick={() => setHeatmapMode('semester')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                heatmapMode === 'semester'
                  ? 'bg-[#065f46] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fluktuasi Semesteran (6 Semester)
            </button>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 my-3 text-[11px] text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">Skala Intensitas vs Target:</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-700 inline-block" /> &ge; 105% Target</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> 98–104%</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 inline-block border border-emerald-300" /> 90–97%</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200 inline-block border border-amber-300" /> 82–89%</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-200 inline-block border border-rose-300" /> &lt; 82% (Kritis)</span>
          </div>
          {activeHeatmapTooltip && (
            <div className="px-2.5 py-1 rounded bg-[#ecfdf5] border border-emerald-300 text-[#065f46] font-mono font-bold">
              {activeHeatmapTooltip.kode} · {activeHeatmapTooltip.periode}: {activeHeatmapTooltip.nilai}% (Target {activeHeatmapTooltip.target}%)
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#fafaf5] text-slate-700 border-b border-slate-200">
                <th className="py-2 px-2.5 text-left font-bold min-w-[200px]">Indikator Kinerja</th>
                <th className="py-2 px-2 text-center font-mono font-bold w-16">Target</th>
                {(heatmapMode === 'monthly' ? MONTH_LABELS : SEMESTER_LABELS).map(col => (
                  <th key={col} className="py-2 px-1.5 text-center font-mono font-bold whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adjustedIkuRecords.map(item => {
                const cols = heatmapMode === 'monthly' ? item.monthlyValues : item.semesterValues;
                const colNames = heatmapMode === 'monthly' ? MONTH_LABELS : SEMESTER_LABELS;
                return (
                  <tr key={item.kode} className="hover:bg-slate-50/70">
                    <td className="py-2 px-2.5">
                      <div className="font-mono font-bold text-[#065f46] text-[11px]">{item.kode}</div>
                      <div className="text-[11px] text-slate-700 truncate max-w-[220px]">{item.nama}</div>
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-slate-700 tabular-nums">
                      {item.target}%
                    </td>
                    {cols.map((val, idx) => (
                      <td key={`${item.kode}-${colNames[idx]}`} className="p-1">
                        <button
                          type="button"
                          onMouseEnter={() =>
                            setActiveHeatmapTooltip({
                              kode: item.kode,
                              periode: colNames[idx],
                              nilai: val,
                              target: item.target
                            })
                          }
                          onClick={() => setDrillDownIku(item)}
                          className={`w-full py-1.5 px-1 rounded border text-[11px] font-mono font-bold tabular-nums transition-transform hover:scale-105 cursor-pointer ${getHeatmapCellStyle(
                            val,
                            item.target
                          )}`}
                          title={`${item.kode} (${colNames[idx]}): ${val}% vs Target ${item.target}%`}
                        >
                          {val}%
                        </button>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Interactive RadarChart Drill-Down + 3-Year 8 IKU LineChart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Radar Chart + Click Drill-Down */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <RadarIcon className="w-4 h-4 text-[#065f46]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Analisis Pencapaian IKU Tahunan (Radar)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Klik tombol IKU di bawah grafik untuk inspeksi drill-down MK &amp; program.
                </p>
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="74%" data={radarChartData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="kode" tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                <Radar
                  name="Target (%)"
                  dataKey="Target"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Capaian Prodi (%)"
                  dataKey="Realisasi"
                  stroke="#065f46"
                  fill="#10b981"
                  fillOpacity={0.38}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-600 mb-2">
              Klik IKU untuk Drill-Down Kontributor &amp; Ekspor PDF:
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {adjustedIkuRecords.map(item => (
                <button
                  key={item.kode}
                  type="button"
                  onClick={() => setDrillDownIku(item)}
                  className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-[#fafaf5] hover:bg-[#ecfdf5] hover:border-[#065f46] text-[11px] font-mono font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  {item.kode}: {item.displayRealisasi}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analisis Tren 8 IKU 3 Tahun Terakhir */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-[#065f46]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Analisis Tren IKU Prodi (3 Tahun Terakhir: 2024–2026)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pelacakan lintasan historis 8 IKU guna mendeteksi penurunan konsisten sebelum audit mutu.
                </p>
              </div>
            </div>
          </div>

          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={threeYearTrendData} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <YAxis domain={[20, 100]} unit="%" tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="IKU-1" stroke="#065f46" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="IKU-2" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU-3" stroke="#dc2626" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="IKU-4" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU-5" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU-6" stroke="#d97706" strokeWidth={2.2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU-7" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="IKU-8" stroke="#e11d48" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 5: Manajemen Target IKU (Inline Edit, Red 3-Yr Decline, CSV Import, Excel/PDF & Automated Gmail Reporting) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Manajemen Target IKU Tahunan &amp; Deteksi Tren Penurunan 3 Tahun
              </h3>
              {summaryCounts.downward > 0 && (
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-bold inline-flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  {summaryCounts.downward} IKU Tren Turun 3 Tahun Beruntun
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap pembaruan target disimpan otomatis &amp; dicatat pada Log Aktivitas Kaprodi. Baris merah menandakan penurunan berturut-turut 2024 &rarr; 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvBulkImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Template CSV</span>
            </button>
            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-[#ecfdf5] hover:bg-emerald-100 text-xs font-bold text-[#065f46] cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Impor Target CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fafaf5] text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-bold">Kode</th>
                <th className="py-2.5 px-3 font-bold">Indikator Kinerja Utama</th>
                <th className="py-2.5 px-3 font-bold text-center">2024</th>
                <th className="py-2.5 px-3 font-bold text-center">2025</th>
                <th className="py-2.5 px-3 font-bold text-center">2026</th>
                <th className="py-2.5 px-3 font-bold text-center">Target (%)</th>
                <th className="py-2.5 px-3 font-bold text-center">Status</th>
                <th className="py-2.5 px-3 font-bold text-right">Aksi Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adjustedIkuRecords.map(item => (
                <tr
                  key={item.kode}
                  className={
                    item.isThreeYearDownward
                      ? 'bg-rose-50/80 hover:bg-rose-100/70'
                      : 'hover:bg-slate-50/70'
                  }
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {item.kode}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{item.nama}</div>
                    {item.isThreeYearDownward && (
                      <div className="text-[10px] font-bold text-rose-700 flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Peringatan: Penurunan berturut-turut 3 tahun ({item.y2024}% &rarr; {item.y2025}% &rarr; {item.y2026}%)</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700">{item.y2024}%</td>
                  <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700">{item.y2025}%</td>
                  <td className={`py-2.5 px-3 text-center font-mono font-bold tabular-nums ${
                    item.isThreeYearDownward ? 'text-rose-700' : 'text-emerald-800'
                  }`}>
                    {item.y2026}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {editingKode === item.kode ? (
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={editTargetValue}
                        onChange={e => setEditTargetValue(e.target.value)}
                        className="w-16 px-2 py-1 border border-emerald-400 rounded text-center font-mono font-bold"
                      />
                    ) : (
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{item.target}%</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${item.status.badgeClass}`}>
                      {item.status.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {editingKode === item.kode ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSaveInlineTarget(item.kode)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#065f46] text-white rounded text-[11px] font-bold cursor-pointer"
                        >
                          <Save className="w-3 h-3" /> Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingKode(null)}
                          className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Batal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingKode(item.kode);
                          setEditTargetValue(String(item.target));
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" /> Edit Target
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Automated IKU Reporting via Gmail */}
        <div className="bg-[#fafaf5] border border-emerald-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#ecfdf5] text-[#065f46] border border-emerald-200 shrink-0">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Automated IKU Reporting (Jadwal Tanggal 1 Setiap Bulan via Gmail)
                </h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  autoReportConfig.enabled
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {autoReportConfig.enabled ? 'Jadwal Bulanan Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Pengiriman otomatis setiap tanggal 1 pukul 08.00 WIB ke Pimpinan FT &amp; GPMF. Terakhir terkirim: <span className="font-mono font-semibold text-slate-800">{autoReportConfig.lastDispatched}</span>.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="text-[11px] font-semibold text-slate-700">Email Penerima:</label>
                <input
                  type="text"
                  value={autoReportConfig.recipients}
                  onChange={e => {
                    const next = { ...autoReportConfig, recipients: e.target.value };
                    setAutoReportConfig(next);
                    try {
                      localStorage.setItem(STORAGE_AUTO_REPORT_KEY, JSON.stringify(next));
                    } catch {
                      // ignore
                    }
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-mono w-full sm:w-80"
                  placeholder="dekan@unbari.ac.id, gpmf@unbari.ac.id"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleAutoReport}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              {autoReportConfig.enabled ? 'Jeda Jadwal Otomatis' : 'Aktifkan Jadwal Tgl 1'}
            </button>
            <button
              type="button"
              onClick={() => setShowSendGmailConfirm(true)}
              disabled={isSendingGmail}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              {workspaceSession ? <Send className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
              <span>{isSendingGmail ? 'Mengirim...' : 'Kirim Laporan via Gmail Sekarang'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before Gmail Send */}
      <WorkspaceMutationConfirmDialog
        isOpen={showSendGmailConfirm}
        title="Konfirmasi Pengiriman Laporan IKU via Gmail"
        description={`Laporan ringkasan capaian 8 IKU Program Studi ${selectedProdi.nama} (${selectedTahunAkademik}) akan dikirimkan ke: ${autoReportConfig.recipients}. Lanjutkan pengiriman?`}
        actionLabel={workspaceSession ? 'Kirim via Gmail API' : 'Buka Email Draft'}
        onConfirm={handleExecuteGmailDispatch}
        onCancel={() => setShowSendGmailConfirm(false)}
      />

      {/* Drill-Down Modal when clicking RadarChart / IKU Scorecard */}
      {drillDownIku && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-[#065f46] text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">
                  Drill-Down Kontributor {drillDownIku.kode}: {drillDownIku.nama}
                </h4>
                <p className="text-[11px] text-emerald-100">
                  Program Studi {selectedProdi.nama} · Realisasi {drillDownIku.realisasi}% (Target {drillDownIku.target}%)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintDrillDownPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#065f46] rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrillDownIku(null)}
                  className="p-1.5 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100">
              <div ref={drillPdfRef} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
                <StandardKopSurat
                  prodiName={selectedProdi.nama}
                  subTitle={`Laporan Drill-Down Kontributor ${drillDownIku.kode}`}
                  showQrCode={true}
                  qrCodeUrl={`https://sikaprodi.ft.unbari.ac.id/verify/iku/${drillDownIku.kode}/${selectedProdi.id}`}
                  qrBadgeText={drillDownIku.kode}
                />

                <div className="grid grid-cols-3 gap-3 text-xs bg-[#fafaf5] border border-emerald-200 rounded-lg p-3">
                  <div>
                    <div className="text-slate-500">Kode &amp; Nama Indikator</div>
                    <div className="font-bold text-slate-900 mt-0.5">{drillDownIku.kode} — {drillDownIku.nama}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Realisasi vs Target</div>
                    <div className="font-mono font-bold text-[#065f46] mt-0.5">{drillDownIku.realisasi}% / {drillDownIku.target}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Penanggung Jawab Utama</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{drillDownIku.pic}</div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                    Daftar Mata Kuliah, Program &amp; Mitra Penyumbang Poin {drillDownIku.kode}
                  </h5>
                  <table className="w-full text-left border-collapse text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="py-2 px-3 font-bold border-r border-slate-300">Kategori</th>
                        <th className="py-2 px-3 font-bold border-r border-slate-300">Program / Mata Kuliah / Riset</th>
                        <th className="py-2 px-3 font-bold border-r border-slate-300">Bukti Capaian Terverifikasi</th>
                        <th className="py-2 px-3 font-bold">Penanggung Jawab</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {drillDownIku.drillDownItems.map((dItem, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-semibold text-[#065f46] border-r border-slate-200">{dItem.kategori}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">{dItem.judul}</td>
                          <td className="py-2 px-3 text-slate-700 border-r border-slate-200">{dItem.capaian}</td>
                          <td className="py-2 px-3 text-slate-700">{dItem.penanggungJawab}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full A4 Kop Surat UNBARI PDF Modal — Ekspor Laporan Capaian IKU */}
      {showIkuPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-[#065f46] text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">
                  Pratinjau Cetak PDF — Laporan Capaian 8 IKU {selectedProdi.nama}
                </h4>
                <p className="text-[11px] text-emerald-100">
                  Format A4 resmi ber-Kop Surat Universitas Batanghari untuk evaluasi tahunan &amp; audit mutu.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintIkuPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#065f46] rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowIkuPdfModal(false)}
                  className="p-1.5 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100">
              <div ref={ikuPdfRef} className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs space-y-6 text-slate-900">
                <StandardKopSurat
                  prodiName={selectedProdi.nama}
                  subTitle={`Laporan Evaluasi Tahunan Pencapaian 8 IKU — TA ${selectedTahunAkademik} (${selectedSemester})`}
                  showQrCode={true}
                  qrCodeUrl={`https://sikaprodi.ft.unbari.ac.id/verify/laporan-iku/${selectedProdi.id}/${selectedTahunAkademik}`}
                  qrBadgeText="SAH IKU FT"
                />

                <div className="text-center space-y-1">
                  <h2 className="text-base font-bold uppercase tracking-wide underline">
                    LAPORAN EKSEKUTIF CAPAIAN 8 INDIKATOR KINERJA UTAMA (IKU)
                  </h2>
                  <p className="text-xs text-slate-600">
                    Program Studi {selectedProdi.nama} · Fakultas Teknik Universitas Batanghari Jambi
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3 text-xs border border-slate-300 rounded-lg p-3 bg-slate-50">
                  <div>
                    <div className="text-slate-500">Rata-rata Capaian</div>
                    <div className="font-mono font-bold text-sm text-[#065f46]">{summaryCounts.avgCap.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Tercapai (Hijau)</div>
                    <div className="font-mono font-bold text-sm text-emerald-700">{summaryCounts.tercapai} / 8 IKU</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Perlu Perhatian (Kuning)</div>
                    <div className="font-mono font-bold text-sm text-amber-700">{summaryCounts.perhatian} IKU</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Status Kritis (Merah)</div>
                    <div className="font-mono font-bold text-sm text-rose-700">{summaryCounts.kritis} IKU</div>
                  </div>
                </div>

                <table className="w-full text-left border-collapse text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="py-2 px-2.5 font-bold border-r border-slate-300">Kode</th>
                      <th className="py-2 px-2.5 font-bold border-r border-slate-300">Indikator Kinerja Utama</th>
                      <th className="py-2 px-2.5 font-bold text-center border-r border-slate-300">Target</th>
                      <th className="py-2 px-2.5 font-bold text-center border-r border-slate-300">Realisasi</th>
                      <th className="py-2 px-2.5 font-bold text-center border-r border-slate-300">Tren 3 Thn</th>
                      <th className="py-2 px-2.5 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {adjustedIkuRecords.map(r => (
                      <tr key={r.kode}>
                        <td className="py-2 px-2.5 font-mono font-bold border-r border-slate-200">{r.kode}</td>
                        <td className="py-2 px-2.5 border-r border-slate-200">
                          <div className="font-semibold">{r.nama}</div>
                          <div className="text-[10px] text-slate-500">PIC: {r.pic}</div>
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono border-r border-slate-200">{r.target}%</td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold border-r border-slate-200">{r.displayRealisasi}%</td>
                        <td className="py-2 px-2.5 text-center font-mono text-[10px] border-r border-slate-200">
                          {r.y2024}% &rarr; {r.y2025}% &rarr; {r.y2026}%
                        </td>
                        <td className="py-2 px-2.5 text-center font-bold">
                          {r.status.label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pt-4 grid grid-cols-2 gap-8 text-xs">
                  <div className="space-y-12">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Dekan Fakultas Teknik UNBARI</p>
                    </div>
                    <div>
                      <p className="font-bold underline">Fadli Eka Yandra, ST., MT</p>
                      <p className="text-[11px] font-mono text-slate-600">NIDN. 1015048501</p>
                    </div>
                  </div>
                  <div className="space-y-12 text-right">
                    <div>
                      <p>Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-bold">Ketua Program Studi {selectedProdi.singkatan}</p>
                    </div>
                    <div>
                      <p className="font-bold underline">{selectedProdi.kaprodi}</p>
                      <p className="text-[11px] font-mono text-slate-600">NIP. {selectedProdi.nipKaprodi}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
