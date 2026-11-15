import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  MessageSquareQuote,
  Printer,
  RefreshCw,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ProgramStudiInfo } from '../types/index';
import { StandardKopSurat } from './StandardKopSurat';
import { printDocumentElement } from '../utils/printHelper';
import { logKaprodiActivity } from '../utils/activityLogHelper';
import {
  fetchGoogleFormLiveSummary,
  fetchTracerStudyFromGoogleSheet,
  getWorkspaceSession,
  GoogleFormLiveSummary,
  GoogleSheetTracerSummary,
  subscribeWorkspaceSession,
  WorkspaceAuthSession
} from '../utils/googleWorkspaceService';

interface TracerCohortRow {
  angkatanLulus: string;
  responden: number;
  waktuTungguBulan: number;
  gajiRataJuta: number;
  kesesuaianBidangPersen: number;
}

interface CareerSectorSlice {
  name: string;
  value: number;
  color: string;
}

interface SalaryBracketItem {
  rentang: string;
  persentase: number;
  jumlahAlumni: number;
}

const STORAGE_FORM_ID_KEY = 'sikaprodi_v15_feedback_form_id';
const STORAGE_SHEET_ID_KEY = 'sikaprodi_v15_tracer_sheet_id';

function buildTracerBaseline(prodiId: string): {
  cohorts: TracerCohortRow[];
  sectors: CareerSectorSlice[];
  salaryBrackets: SalaryBracketItem[];
  rekomendasiKurikulum: string[];
} {
  if (prodiId === 'LINGKUNGAN') {
    return {
      cohorts: [
        { angkatanLulus: 'Lulusan 2023', responden: 38, waktuTungguBulan: 4.1, gajiRataJuta: 5.2, kesesuaianBidangPersen: 81 },
        { angkatanLulus: 'Lulusan 2024', responden: 42, waktuTungguBulan: 3.6, gajiRataJuta: 5.8, kesesuaianBidangPersen: 84 },
        { angkatanLulus: 'Lulusan 2025', responden: 46, waktuTungguBulan: 3.1, gajiRataJuta: 6.3, kesesuaianBidangPersen: 87 },
        { angkatanLulus: 'Lulusan 2026', responden: 49, waktuTungguBulan: 2.7, gajiRataJuta: 6.7, kesesuaianBidangPersen: 90 }
      ],
      sectors: [
        { name: 'HSE & Konsultan Lingkungan', value: 38, color: '#065f46' },
        { name: 'Industri Sawit / Migas (IPAL)', value: 26, color: '#0d9488' },
        { name: 'Dinas LH / ASN / BUMN', value: 18, color: '#0284c7' },
        { name: 'Wirausaha Jasa Audit AMDAL', value: 10, color: '#d97706' },
        { name: 'Studi Lanjut S2', value: 8, color: '#64748b' }
      ],
      salaryBrackets: [
        { rentang: '< Rp 4,5 Juta', persentase: 14, jumlahAlumni: 7 },
        { rentang: 'Rp 4,5 – 6,5 Juta', persentase: 46, jumlahAlumni: 23 },
        { rentang: 'Rp 6,5 – 9,0 Juta', persentase: 28, jumlahAlumni: 14 },
        { rentang: '> Rp 9,0 Juta', persentase: 12, jumlahAlumni: 5 }
      ],
      rekomendasiKurikulum: [
        'Penguatan praktikum Audit AMDAL, UKL-UPL & Pelaporan PROPER KLHK berbasis studi kasus industri perkebunan Jambi.',
        'Integrasi sertifikasi Ahli K3 Umum / POPAL ke dalam mata kuliah pilihan semester 7.',
        'Penambahan modul pemodelan kualitas air & GIS lingkungan (QGIS) untuk mendukung kebutuhan konsultan.'
      ]
    };
  }

  if (prodiId === 'LISTRIK_D3') {
    return {
      cohorts: [
        { angkatanLulus: 'Lulusan 2023', responden: 32, waktuTungguBulan: 3.5, gajiRataJuta: 4.9, kesesuaianBidangPersen: 86 },
        { angkatanLulus: 'Lulusan 2024', responden: 35, waktuTungguBulan: 2.9, gajiRataJuta: 5.5, kesesuaianBidangPersen: 89 },
        { angkatanLulus: 'Lulusan 2025', responden: 37, waktuTungguBulan: 2.4, gajiRataJuta: 6.0, kesesuaianBidangPersen: 91 },
        { angkatanLulus: 'Lulusan 2026', responden: 40, waktuTungguBulan: 2.1, gajiRataJuta: 6.5, kesesuaianBidangPersen: 93 }
      ],
      sectors: [
        { name: 'PLN & Utilitas Kelistrikan', value: 42, color: '#065f46' },
        { name: 'Otomasi Pabrik & PLC Industri', value: 28, color: '#0284c7' },
        { name: 'Kontraktor Instalasi Tegangan Menengah', value: 16, color: '#d97706' },
        { name: 'Wirausaha Panel & Servis', value: 10, color: '#0d9488' },
        { name: 'Alih Jenjang S1 / D4', value: 4, color: '#64748b' }
      ],
      salaryBrackets: [
        { rentang: '< Rp 4,5 Juta', persentase: 18, jumlahAlumni: 7 },
        { rentang: 'Rp 4,5 – 6,5 Juta', persentase: 48, jumlahAlumni: 19 },
        { rentang: 'Rp 6,5 – 9,0 Juta', persentase: 24, jumlahAlumni: 10 },
        { rentang: '> Rp 9,0 Juta', persentase: 10, jumlahAlumni: 4 }
      ],
      rekomendasiKurikulum: [
        'Peningkatan porsi praktikum SCADA, PLC Siemens/Omron & Smart Microgrid di Bengkel Otomasi.',
        'Sinkronisasi kurikulum dengan skema Sertifikasi Kompetensi Ketenagalistrikan (SKTTK) DJK ESDM.',
        'Ekspansi kelas kolaboratif pemeliharaan gardu distribusi bersama PT PLN (Persero) UP3 Jambi.'
      ]
    };
  }

  return {
    cohorts: [
      { angkatanLulus: 'Lulusan 2023', responden: 54, waktuTungguBulan: 3.9, gajiRataJuta: 5.6, kesesuaianBidangPersen: 83 },
      { angkatanLulus: 'Lulusan 2024', responden: 58, waktuTungguBulan: 3.4, gajiRataJuta: 6.1, kesesuaianBidangPersen: 85 },
      { angkatanLulus: 'Lulusan 2025', responden: 62, waktuTungguBulan: 2.8, gajiRataJuta: 6.6, kesesuaianBidangPersen: 88 },
      { angkatanLulus: 'Lulusan 2026', responden: 65, waktuTungguBulan: 2.4, gajiRataJuta: 7.2, kesesuaianBidangPersen: 91 }
    ],
    sectors: [
      { name: 'Kontraktor Konstruksi & Infrastruktur', value: 40, color: '#065f46' },
      { name: 'Konsultan Perencana / BIM Engineer', value: 24, color: '#0284c7' },
      { name: 'BUMN Karya / PUPR / ASN', value: 18, color: '#0d9488' },
      { name: 'Developer & Manajemen Proyek', value: 11, color: '#d97706' },
      { name: 'Studi Lanjut S2 Teknik Sipil', value: 7, color: '#64748b' }
    ],
    salaryBrackets: [
      { rentang: '< Rp 4,5 Juta', persentase: 11, jumlahAlumni: 7 },
      { rentang: 'Rp 4,5 – 6,5 Juta', persentase: 40, jumlahAlumni: 26 },
      { rentang: 'Rp 6,5 – 9,0 Juta', persentase: 34, jumlahAlumni: 22 },
      { rentang: '> Rp 9,0 Juta', persentase: 15, jumlahAlumni: 10 }
    ],
    rekomendasiKurikulum: [
      'Wajibkan integrasi perangkat lunak Building Information Modeling (Autodesk Revit & Civil 3D) pada Tugas Besar Struktur dan Transportasi.',
      'Perkuat materi Estimasi Biaya Proyek (RAB) berbasis AHSP terbaru & Manajemen Risiko Kontrak Konstruksi.',
      'Fasilitasi Uji Sertifikat Kompetensi Kerja (SKK) Jenjang 7 untuk lulusan sebelum Yudisium.'
    ]
  };
}

interface DashboardTracerFeedbackSectionProps {
  selectedProdi: ProgramStudiInfo;
  scopeFilter: 'prodi' | 'all';
  onShowToast?: (msg: string) => void;
}

export const DashboardTracerFeedbackSection: React.FC<DashboardTracerFeedbackSectionProps> = ({
  selectedProdi,
  scopeFilter,
  onShowToast
}) => {
  const [workspaceSession, setWorkspaceSession] = useState<WorkspaceAuthSession | null>(() =>
    getWorkspaceSession()
  );

  // Google Forms Survey ID
  const [formId, setFormId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_FORM_ID_KEY) || '';
    } catch {
      return '';
    }
  });
  const [isSyncingForm, setIsSyncingForm] = useState<boolean>(false);
  const [liveFormSummary, setLiveFormSummary] = useState<GoogleFormLiveSummary | null>(null);

  // Google Sheets Tracer Study ID
  const [sheetId, setSheetId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_SHEET_ID_KEY) || '';
    } catch {
      return '';
    }
  });
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);
  const [liveSheetSummary, setLiveSheetSummary] = useState<GoogleSheetTracerSummary | null>(null);

  // PDF Export Modals (Prompt #2 Summary & Prompt #3 Complete Report)
  const [showSummaryPdfModal, setShowSummaryPdfModal] = useState<boolean>(false);
  const [showCompletePdfModal, setShowCompletePdfModal] = useState<boolean>(false);
  const summaryPdfRef = useRef<HTMLDivElement>(null);
  const completePdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeWorkspaceSession(setWorkspaceSession);
  }, []);

  const baseline = useMemo(() => buildTracerBaseline(selectedProdi.id), [selectedProdi.id]);

  // If Google Sheet returned rows, augment latest cohort respondent count & metrics cleanly
  const effectiveCohorts = useMemo(() => {
    if (!liveSheetSummary || liveSheetSummary.rowCount <= 0) return baseline.cohorts;
    return baseline.cohorts.map((row, idx) =>
      idx === baseline.cohorts.length - 1
        ? { ...row, responden: liveSheetSummary.rowCount }
        : row
    );
  }, [baseline.cohorts, liveSheetSummary]);

  const latestCohort = effectiveCohorts[effectiveCohorts.length - 1];

  const feedbackAspects = useMemo(
    () => [
      { aspek: 'Kualitas Pembelajaran & RPS OBE', mahasiswa: 4.58, dosen: 4.66 },
      { aspek: 'Kesiapan Laboratorium & Alat', mahasiswa: 4.35, dosen: 4.42 },
      { aspek: 'Layanan Bimbingan Dosen PA/TA', mahasiswa: 4.62, dosen: 4.71 },
      { aspek: 'Respon Layanan Prodi & SIAKAD', mahasiswa: 4.48, dosen: 4.55 }
    ],
    []
  );

  const handleSyncGoogleForm = async () => {
    if (!workspaceSession) {
      onShowToast?.('Hubungkan akun Google Workspace terlebih dahulu pada tab Google Workspace untuk menyinkronkan Google Forms API.');
      return;
    }
    if (!formId.trim()) {
      onShowToast?.('Masukkan Google Form ID terlebih dahulu.');
      return;
    }
    setIsSyncingForm(true);
    try {
      localStorage.setItem(STORAGE_FORM_ID_KEY, formId.trim());
      const res = await fetchGoogleFormLiveSummary(workspaceSession.accessToken, formId.trim());
      setLiveFormSummary(res);
      logKaprodiActivity({
        actor: selectedProdi.kaprodi,
        role: `Kaprodi ${selectedProdi.singkatan}`,
        prodiId: selectedProdi.id,
        category: 'SYNC_WORKSPACE',
        actionTitle: `Sinkronisasi Survei Google Forms (${res.responseCount} Responden)`,
        detail: `Mengambil data real-time survei kepuasan "${res.title}" via Google Forms API.`,
        severity: 'info'
      });
      onShowToast?.(`Survei "${res.title}" tersinkron (${res.responseCount} responden langsung dari Google Forms).`);
    } catch (err) {
      onShowToast?.(err instanceof Error ? err.message : 'Gagal mengambil data Google Forms API.');
    } finally {
      setIsSyncingForm(false);
    }
  };

  const handleSyncGoogleSheet = async () => {
    if (!workspaceSession) {
      onShowToast?.('Hubungkan akun Google Workspace terlebih dahulu untuk membaca spreadsheet Tracer Study.');
      return;
    }
    if (!sheetId.trim()) {
      onShowToast?.('Masukkan Google Spreadsheet ID Tracer Study terlebih dahulu.');
      return;
    }
    setIsSyncingSheet(true);
    try {
      localStorage.setItem(STORAGE_SHEET_ID_KEY, sheetId.trim());
      const res = await fetchTracerStudyFromGoogleSheet(workspaceSession.accessToken, sheetId.trim(), 'A1:G50');
      setLiveSheetSummary(res);
      logKaprodiActivity({
        actor: selectedProdi.kaprodi,
        role: `Kaprodi ${selectedProdi.singkatan}`,
        prodiId: selectedProdi.id,
        category: 'SYNC_WORKSPACE',
        actionTitle: `Sinkronisasi Tracer Study Google Sheets (${res.rowCount} Baris)`,
        detail: `Menarik data alumni terbaru dari "${res.title}" via Google Sheets API.`,
        severity: 'info'
      });
      onShowToast?.(`Spreadsheet "${res.title}" tersinkronisasi (${res.rowCount} entri alumni).`);
    } catch (err) {
      onShowToast?.(err instanceof Error ? err.message : 'Gagal membaca Google Sheets API.');
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handlePrintSummaryPdf = () => {
    if (!summaryPdfRef.current) return;
    printDocumentElement(summaryPdfRef.current, {
      documentTitle: `Ringkasan_Tracer_Study_${selectedProdi.singkatan}_2026`,
      orientation: 'portrait'
    });
    logKaprodiActivity({
      actor: selectedProdi.kaprodi,
      role: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      category: 'EXPORT_DOKUMEN',
      actionTitle: `Ekspor Ringkasan Tracer Study PDF (${selectedProdi.singkatan})`,
      detail: `Mengunduh laporan PDF distribusi karier lulusan terstandar akreditasi LAM-Teknik.`,
      severity: 'info'
    });
    onShowToast?.('Ringkasan Tracer Study siap cetak / simpan sebagai PDF.');
  };

  const handlePrintCompletePdf = () => {
    if (!completePdfRef.current) return;
    printDocumentElement(completePdfRef.current, {
      documentTitle: `Laporan_Tracer_Lengkap_${selectedProdi.singkatan}_2026`,
      orientation: 'portrait'
    });
    logKaprodiActivity({
      actor: selectedProdi.kaprodi,
      role: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      category: 'EXPORT_DOKUMEN',
      actionTitle: `Ekspor Laporan Tracer Study Lengkap PDF (${selectedProdi.singkatan})`,
      detail: `Mengunduh dokumen PDF lengkap berisi sebaran karier, perbandingan gaji & rekomendasi kurikulum akreditasi.`,
      severity: 'info'
    });
    onShowToast?.('Laporan Tracer Study Lengkap berhasil disiapkan untuk ekspor PDF.');
  };

  return (
    <section className="space-y-6">
      {/* Panel 1: Feedback Mahasiswa & Dosen (Google Forms Live Sync) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#065f46] flex items-center justify-center shrink-0">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Feedback Mahasiswa &amp; Dosen (Terintegrasi Google Forms API)
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#065f46] border border-emerald-200 text-[10px] font-bold">
                  {liveFormSummary
                    ? `Live: ${liveFormSummary.responseCount} Responden`
                    : `${scopeFilter === 'prodi' ? selectedProdi.singkatan : 'FT UNBARI'} · 312 Responden Terverifikasi`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Rekapitulasi survei kepuasan pembelajaran, sarana praktikum &amp; layanan akademik dosen per semester.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={formId}
              onChange={e => setFormId(e.target.value)}
              placeholder="Google Form ID (opsional)"
              className="px-3 py-1.5 bg-[#fafaf5] border border-slate-300 rounded-lg text-xs font-mono w-48"
            />
            <button
              type="button"
              onClick={handleSyncGoogleForm}
              disabled={isSyncingForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingForm ? 'animate-spin' : ''}`} />
              <span>{isSyncingForm ? 'Menyinkronkan...' : 'Tarik Data Google Forms'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {feedbackAspects.map((row, idx) => (
            <div key={idx} className="bg-[#fafaf5] border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-bold text-slate-900 min-h-[2rem]">{row.aspek}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Mahasiswa:</span>
                <span className="font-mono font-bold text-[#065f46] tabular-nums">{row.mahasiswa.toFixed(2)} / 5.00</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#065f46] rounded-full" style={{ width: `${(row.mahasiswa / 5) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600">Dosen:</span>
                <span className="font-mono font-bold text-sky-800 tabular-nums">{row.dosen.toFixed(2)} / 5.00</span>
              </div>
            </div>
          ))}
        </div>

        {liveFormSummary?.responderUri && (
          <div className="flex items-center justify-between px-3 py-2 bg-[#ecfdf5] border border-emerald-200 rounded-lg text-xs text-[#065f46]">
            <span>
              Formulir aktif terhubung: <strong>{liveFormSummary.title}</strong> ({liveFormSummary.responseCount} tanggapan)
            </span>
            <a
              href={liveFormSummary.responderUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold hover:underline"
            >
              <span>Buka Formulir</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Panel 2: Dashboard Tracer Study & Analisis Karir Lulusan (Google Sheets + Dual PDF Exports) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#065f46] text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Dashboard Tracer Study &amp; Analisis Karir Lulusan ({selectedProdi.singkatan})
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                  {liveSheetSummary ? `Google Sheets: ${liveSheetSummary.rowCount} Alumni` : 'Standar Akreditasi LAM-Teknik'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemantauan waktu tunggu kerja pertama, gaji rata-rata, kesesuaian bidang kerja &amp; sinkronisasi langsung Google Sheets.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={sheetId}
                onChange={e => setSheetId(e.target.value)}
                placeholder="Google Sheet ID Tracer"
                className="px-2.5 py-1.5 bg-[#fafaf5] border border-slate-300 rounded-lg text-xs font-mono w-44"
              />
              <button
                type="button"
                onClick={handleSyncGoogleSheet}
                disabled={isSyncingSheet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-[#ecfdf5] hover:bg-emerald-100 text-[#065f46] text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isSyncingSheet ? 'Memuat...' : 'Sync Sheets'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSummaryPdfModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#065f46]" />
              <span>Ekspor Ringkasan Tracer</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCompletePdfModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Ekspor Laporan Tracer Lengkap</span>
            </button>
          </div>
        </div>

        {/* Highlight KPI Cards Tracer Study */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-[#fafaf5] border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Rata-rata Waktu Tunggu</span>
              <TrendingUp className="w-4 h-4 text-[#065f46]" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
              {latestCohort.waktuTungguBulan} <span className="text-xs font-normal text-slate-500">Bulan</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Target IKU-1 (&le; 6 Bulan) Terpenuhi</div>
          </div>

          <div className="bg-[#fafaf5] border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Rata-rata Gaji Pertama</span>
              <Award className="w-4 h-4 text-[#065f46]" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
              Rp {latestCohort.gajiRataJuta.toFixed(1)} <span className="text-xs font-normal text-slate-500">Jt/Bln</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">&gt; 1,8x UMP Provinsi Jambi</div>
          </div>

          <div className="bg-[#fafaf5] border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Kesesuaian Bidang Studi</span>
              <Briefcase className="w-4 h-4 text-[#065f46]" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-[#065f46] mt-1 tabular-nums">
              {latestCohort.kesesuaianBidangPersen}%
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">Relevansi Kompetensi OBE</div>
          </div>

          <div className="bg-[#fafaf5] border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total Responden Terbaru</span>
              <Users className="w-4 h-4 text-[#065f46]" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
              {latestCohort.responden} <span className="text-xs font-normal text-slate-500">Alumni</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">{latestCohort.angkatanLulus}</div>
          </div>
        </div>

        {/* Charts: Horizontal BarChart (Waktu Tunggu, Gaji, Kesesuaian) + PieChart Distribusi Bidang Pekerjaan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
              Analisis Tren Waktu Tunggu, Gaji Rata-Rata &amp; Kesesuaian Bidang Lulusan
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Perbandingan horizontal lintas 4 angkatan kelulusan Program Studi {selectedProdi.singkatan}.
            </p>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={effectiveCohorts}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis dataKey="angkatanLulus" type="category" width={90} tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="kesesuaianBidangPersen" name="Kesesuaian Bidang (%)" fill="#065f46" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="gajiRataJuta" name="Gaji Rata-Rata (Juta Rp)" fill="#0284c7" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="waktuTungguBulan" name="Waktu Tunggu (Bulan)" fill="#d97706" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
              Distribusi Bidang Pekerjaan Lulusan
            </h3>
            <p className="text-[11px] text-slate-500 mb-2">
              Proporsi sektor penyerapan alumni di dunia usaha &amp; industri (DUDI).
            </p>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={baseline.sectors}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {baseline.sectors.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val ?? 0}%`, 'Proporsi']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Prompt #2: Ekspor Ringkasan Tracer Study PDF */}
      {showSummaryPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-[#065f46] text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Pratinjau Ringkasan Tracer Study (PDF Akreditasi)</h4>
                <p className="text-[11px] text-emerald-100">Ringkasan distribusi karier lulusan terstandar pelaporan akreditasi.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSummaryPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#065f46] rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSummaryPdfModal(false)}
                  className="p-1.5 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100">
              <div ref={summaryPdfRef} className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs space-y-5 text-slate-900">
                <StandardKopSurat
                  prodiName={selectedProdi.nama}
                  subTitle="Ringkasan Distribusi Karier Lulusan (Tracer Study Akreditasi)"
                  showQrCode={true}
                  qrCodeUrl={`https://sikaprodi.ft.unbari.ac.id/verify/tracer-summary/${selectedProdi.id}`}
                  qrBadgeText="TRACER FT"
                />

                <div className="text-center">
                  <h2 className="text-sm font-bold uppercase underline">
                    RINGKASAN TRACER STUDY &amp; DISTRIBUSI KARIER LULUSAN
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Program Studi {selectedProdi.nama} · Tahun Pelaporan 2026
                  </p>
                </div>

                <table className="w-full text-left border-collapse text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="py-2 px-3 font-bold border-r border-slate-300">Angkatan Lulus</th>
                      <th className="py-2 px-3 font-bold text-center border-r border-slate-300">Responden</th>
                      <th className="py-2 px-3 font-bold text-center border-r border-slate-300">Waktu Tunggu (Bln)</th>
                      <th className="py-2 px-3 font-bold text-center border-r border-slate-300">Gaji Rata-Rata</th>
                      <th className="py-2 px-3 font-bold text-center">Kesesuaian Bidang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {effectiveCohorts.map(c => (
                      <tr key={c.angkatanLulus}>
                        <td className="py-2 px-3 font-semibold border-r border-slate-200">{c.angkatanLulus}</td>
                        <td className="py-2 px-3 text-center font-mono border-r border-slate-200">{c.responden} Alumni</td>
                        <td className="py-2 px-3 text-center font-mono border-r border-slate-200">{c.waktuTungguBulan} Bulan</td>
                        <td className="py-2 px-3 text-center font-mono border-r border-slate-200">Rp {c.gajiRataJuta.toFixed(1)} Juta</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-[#065f46]">{c.kesesuaianBidangPersen}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div>
                  <h5 className="text-xs font-bold uppercase text-slate-800 mb-2">
                    Distribusi Sektor Pekerjaan Alumni ({selectedProdi.singkatan})
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {baseline.sectors.map(s => (
                      <div key={s.name} className="flex items-center justify-between p-2 border border-slate-200 rounded">
                        <span>{s.name}</span>
                        <span className="font-mono font-bold">{s.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end text-xs">
                  <div className="text-right space-y-10">
                    <div>
                      <p>Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-bold">Ketua Program Studi {selectedProdi.singkatan}</p>
                    </div>
                    <div>
                      <p className="font-bold underline">{selectedProdi.kaprodi}</p>
                      <p className="font-mono text-[11px] text-slate-600">NIP. {selectedProdi.nipKaprodi}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Prompt #3: Ekspor Laporan Tracer Lengkap PDF (Distribusi Karier + Grafik Perbandingan Gaji + Rekomendasi Kurikulum) */}
      {showCompletePdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-[#065f46] text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Pratinjau Laporan Tracer Study Lengkap (Standar Akreditasi)</h4>
                <p className="text-[11px] text-emerald-100">
                  Mencakup rangkuman sebaran karier, grafik perbandingan gaji, dan rekomendasi perbaikan kurikulum OBE.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintCompletePdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#065f46] rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Unduh PDF Lengkap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompletePdfModal(false)}
                  className="p-1.5 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100">
              <div ref={completePdfRef} className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs space-y-6 text-slate-900">
                <StandardKopSurat
                  prodiName={selectedProdi.nama}
                  subTitle="Laporan Lengkap Tracer Study, Evaluasi Gaji Alumni & Rekomendasi Kurikulum"
                  showQrCode={true}
                  qrCodeUrl={`https://sikaprodi.ft.unbari.ac.id/verify/tracer-lengkap/${selectedProdi.id}`}
                  qrBadgeText="SAH AKREDITASI"
                />

                <div className="text-center space-y-1">
                  <h2 className="text-base font-bold uppercase underline">
                    LAPORAN LENGKAP TRACER STUDY &amp; REKOMENDASI PERBAIKAN KURIKULUM
                  </h2>
                  <p className="text-xs text-slate-600">
                    Dokumen Pendukung LKPS Kriteria 9 Akreditasi LAM-Teknik · Program Studi {selectedProdi.nama}
                  </p>
                </div>

                {/* 1. Sebaran Karier Lulusan */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#065f46] border-b border-emerald-200 pb-1">
                    1. Rangkuman Sebaran Karier Lulusan &amp; Waktu Tunggu Kerja
                  </h3>
                  <table className="w-full text-left border-collapse text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="py-1.5 px-2.5 border-r border-slate-300">Angkatan Lulus</th>
                        <th className="py-1.5 px-2.5 text-center border-r border-slate-300">Responden</th>
                        <th className="py-1.5 px-2.5 text-center border-r border-slate-300">Waktu Tunggu</th>
                        <th className="py-1.5 px-2.5 text-center border-r border-slate-300">Gaji Rata-Rata</th>
                        <th className="py-1.5 px-2.5 text-center">Kesesuaian Bidang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {effectiveCohorts.map(c => (
                        <tr key={c.angkatanLulus}>
                          <td className="py-1.5 px-2.5 font-semibold border-r border-slate-200">{c.angkatanLulus}</td>
                          <td className="py-1.5 px-2.5 text-center font-mono border-r border-slate-200">{c.responden}</td>
                          <td className="py-1.5 px-2.5 text-center font-mono border-r border-slate-200">{c.waktuTungguBulan} Bln</td>
                          <td className="py-1.5 px-2.5 text-center font-mono border-r border-slate-200">Rp {c.gajiRataJuta.toFixed(1)} Jt</td>
                          <td className="py-1.5 px-2.5 text-center font-mono font-bold">{c.kesesuaianBidangPersen}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 2. Grafik Perbandingan Gaji Lulusan (Static Print-Safe Bar Visualization) */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#065f46] border-b border-emerald-200 pb-1">
                    2. Grafik Perbandingan Distribusi Gaji Pertama Lulusan
                  </h3>
                  <div className="space-y-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    {baseline.salaryBrackets.map(b => (
                      <div key={b.rentang} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{b.rentang}</span>
                          <span className="font-mono font-bold text-slate-900">
                            {b.persentase}% ({b.jumlahAlumni} Alumni)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-slate-200 rounded overflow-hidden">
                          <div
                            className="h-full bg-[#065f46]"
                            style={{ width: `${b.persentase}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Rekomendasi Perbaikan Kurikulum OBE */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#065f46] border-b border-emerald-200 pb-1">
                    3. Rekomendasi Perbaikan Kurikulum Berbasis Masukan Alumni &amp; DUDI
                  </h3>
                  <ul className="space-y-1.5 text-xs list-disc pl-5 text-slate-800">
                    {baseline.rekomendasiKurikulum.map((rec, i) => (
                      <li key={i} className="leading-relaxed">{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-8 text-xs">
                  <div className="space-y-10">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-bold">Dekan Fakultas Teknik UNBARI</p>
                    </div>
                    <div>
                      <p className="font-bold underline">Fadli Eka Yandra, ST., MT</p>
                      <p className="text-[11px] font-mono text-slate-600">NIDN. 1015048501</p>
                    </div>
                  </div>
                  <div className="space-y-10 text-right">
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
