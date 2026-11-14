import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  BellRing,
  Printer,
  Star,
  BarChart2,
  Search,
  X,
  Send,
  FileDown,
  ShieldCheck,
  ArrowRightLeft,
  TrendingDown,
  TrendingUp,
  Users,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  DokumenKerjasama,
  Dosen,
  JadwalKerjaPraktek,
  JadwalKuliah,
  JadwalSidangTA,
  Mahasiswa,
  ProgramStudiInfo
} from '../types/index';
import {
  INITIAL_JADWAL_KP,
  INITIAL_JADWAL_SIDANG_TA,
  INITIAL_MAHASISWA
} from '../data/mockData';
import { INITIAL_KERJASAMA } from '../data/mockKerjasamaData';
import { EdomPrintModal } from './EdomPrintModal';
import { BkdLldiktiPdfModal, BkdLldiktiDosenMetric } from './BkdLldiktiPdfModal';
import { BkdHistorisSection } from './BkdHistorisSection';
import { BkdBimbinganSection } from './BkdBimbinganSection';
import { BkdMbkmIabeeSection } from './BkdMbkmIabeeSection';
import { buildBkdAuditReport, BkdAuditItem } from '../utils/bkdAuditHelper';
import { buildBkdMbkmIabeeReport } from '../utils/bkdMbkmIabeeHelper';
import {
  buildBimbinganAnalysisReport,
  getDefaultBimbinganStandardByProdi
} from '../utils/bkdBimbinganAnalysisHelper';

const LLDIKTI_MIN_SKS = 12;
const LLDIKTI_MAX_SKS = 16;
const BIMBINGAN_TA_SKS_FACTOR = 0.25;

interface BkdDosenViewProps {
  dosenList: Dosen[];
  jadwalList: JadwalKuliah[];
  selectedProdi: ProgramStudiInfo;
  mahasiswaList?: Mahasiswa[];
  sidangList?: JadwalSidangTA[];
  kpList?: JadwalKerjaPraktek[];
  kerjasamaList?: DokumenKerjasama[];
  onShowToast?: (msg: string) => void;
}

type DosenWorkloadMetric = BkdLldiktiDosenMetric;

export const BkdDosenView: React.FC<BkdDosenViewProps> = ({
  dosenList,
  jadwalList,
  selectedProdi,
  mahasiswaList = INITIAL_MAHASISWA,
  sidangList = INITIAL_JADWAL_SIDANG_TA,
  kpList = INITIAL_JADWAL_KP,
  kerjasamaList = INITIAL_KERJASAMA,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'bkd' | 'audit' | 'bimbingan' | 'mbkm_iabee' | 'edom'>('bkd');
  const [filterScope, setFilterScope] = useState<string>('current');
  const [workloadFilter, setWorkloadFilter] = useState<'ALL' | 'OVERLOAD' | 'COMPLIANT' | 'UNDERLOAD'>('ALL');
  const [auditFilter, setAuditFilter] = useState<
    'ALL' | 'VIOLATIONS' | 'OVERLOAD' | 'UNDERLOAD' | 'MISMATCH' | 'COMPLIANT'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [calculationMode, setCalculationMode] = useState<'bkd_total' | 'tatap_muka'>('bkd_total');
  const [selectedDosenForEdom, setSelectedDosenForEdom] = useState<Dosen | null>(null);
  const [selectedAuditDetail, setSelectedAuditDetail] = useState<BkdAuditItem | null>(null);
  const [isBkdPdfModalOpen, setIsBkdPdfModalOpen] = useState(false);
  const [bkdPdfInitialMode, setBkdPdfInitialMode] = useState<'individu' | 'kolektif'>('individu');
  const [bkdPdfInitialDosenId, setBkdPdfInitialDosenId] = useState<string | null>(null);
  const [dismissedBannerKey, setDismissedBannerKey] = useState<string | null>(null);
  const [notifiedAuditIds, setNotifiedAuditIds] = useState<Record<string, string>>({});
  const [chartMode, setChartMode] = useState<'komparasi_2tahun' | 'tren_3semester'>('komparasi_2tahun');

  const lastToastScopeKeyRef = useRef<string>('');

  const scopedDosen = useMemo(() => {
    return dosenList.filter(d => {
      if (filterScope === 'all') return true;
      if (filterScope === 'current') return d.prodiId === selectedProdi.id;
      return d.prodiId === filterScope;
    });
  }, [dosenList, filterScope, selectedProdi.id]);

  // Base calculation per lecturer combining scheduled regular classes + TA supervision equivalence
  const baseWorkloadMetrics = useMemo(() => {
    return scopedDosen.map(dosen => {
      const scheduledClasses = jadwalList.filter(j => {
        const matchNidn = j.dosenNidn && dosen.nidn && j.dosenNidn === dosen.nidn;
        const isKoordinatorSlot = j.dosenNama.includes('(Koord.');
        const hasStudents = j.terdaftar === undefined || j.terdaftar > 0;
        return matchNidn && !isKoordinatorSlot && hasStudents;
      });

      const scheduledSks = scheduledClasses.reduce((sum, j) => sum + j.sks, 0);
      const sksKuliah = Math.max(dosen.totalSksMengajar, scheduledSks);
      const sksBimbingan = Math.round(dosen.jumlahMahasiswaBimbingan * BIMBINGAN_TA_SKS_FACTOR * 10) / 10;
      const totalBebanSks =
        calculationMode === 'bkd_total'
          ? Math.round((sksKuliah + sksBimbingan) * 10) / 10
          : sksKuliah;

      const rasioLldiktiPersen = Math.round((totalBebanSks / LLDIKTI_MAX_SKS) * 1000) / 10;
      const kelebihanSks = Math.max(0, Math.round((totalBebanSks - LLDIKTI_MAX_SKS) * 10) / 10);
      const kekuranganSks = Math.max(0, Math.round((LLDIKTI_MIN_SKS - totalBebanSks) * 10) / 10);
      const isOverload = totalBebanSks > LLDIKTI_MAX_SKS;
      const isUnderload = totalBebanSks < LLDIKTI_MIN_SKS;
      const isNearLimit = !isOverload && totalBebanSks >= 15;
      const isCompliant = !isOverload && !isUnderload;

      return {
        dosen,
        scheduledClasses,
        scheduledSks,
        sksKuliah,
        sksBimbingan,
        totalBebanSks,
        rasioLldiktiPersen,
        kelebihanSks,
        kekuranganSks,
        isOverload,
        isNearLimit,
        isUnderload,
        isCompliant
      };
    });
  }, [scopedDosen, jadwalList, calculationMode]);

  const prodiAvgSks = useMemo(() => {
    if (baseWorkloadMetrics.length === 0) return 14.0;
    const total = baseWorkloadMetrics.reduce((acc, m) => acc + m.totalBebanSks, 0);
    return Math.round((total / baseWorkloadMetrics.length) * 10) / 10;
  }, [baseWorkloadMetrics]);

  const prodiAvgRatioPersen = useMemo(() => {
    return Math.round((prodiAvgSks / LLDIKTI_MAX_SKS) * 1000) / 10;
  }, [prodiAvgSks]);

  const dosenWorkloadMetrics: DosenWorkloadMetric[] = useMemo(() => {
    return baseWorkloadMetrics.map(item => ({
      ...item,
      rasioTerhadapProdi:
        prodiAvgSks > 0 ? Math.round((item.totalBebanSks / prodiAvgSks) * 100) / 100 : 1
    }));
  }, [baseWorkloadMetrics, prodiAvgSks]);

  const auditReport = useMemo(() => {
    return buildBkdAuditReport(dosenWorkloadMetrics, calculationMode);
  }, [dosenWorkloadMetrics, calculationMode]);

  const mbkmIabeeOverloadCount = useMemo(() => {
    return buildBkdMbkmIabeeReport({
      dosenList: scopedDosen,
      jadwalList,
      kpList,
      kerjasamaList
    }).summary.overloadCount;
  }, [scopedDosen, jadwalList, kpList, kerjasamaList]);

  const effectiveScopeProdiId = filterScope === 'current' ? selectedProdi.id : filterScope;

  const bimbinganOverloadCount = useMemo(() => {
    return buildBimbinganAnalysisReport({
      dosenList: scopedDosen,
      mahasiswaList,
      sidangList,
      kpList,
      batasMaksimal: getDefaultBimbinganStandardByProdi(effectiveScopeProdiId)
    }).overloadedCount;
  }, [scopedDosen, mahasiswaList, sidangList, kpList, effectiveScopeProdiId]);

  const auditItemByDosenId = useMemo(() => {
    const map: Record<string, BkdAuditItem> = {};
    auditReport.items.forEach(item => {
      map[item.metric.dosen.id] = item;
    });
    return map;
  }, [auditReport.items]);

  const overloadedDosenList = useMemo(() => {
    return dosenWorkloadMetrics
      .filter(m => m.isOverload)
      .sort((a, b) => b.totalBebanSks - a.totalBebanSks);
  }, [dosenWorkloadMetrics]);

  const underloadedDosenList = useMemo(() => {
    return dosenWorkloadMetrics
      .filter(m => m.isUnderload)
      .sort((a, b) => a.totalBebanSks - b.totalBebanSks);
  }, [dosenWorkloadMetrics]);

  const totalViolationCount = overloadedDosenList.length + underloadedDosenList.length;
  const scopeAlertKey = `${selectedProdi.id}:${filterScope}:${calculationMode}`;

  useEffect(() => {
    setSelectedAuditDetail(null);
  }, [selectedProdi.id, filterScope, calculationMode]);

  // Notify via Toast automatically when entering scope with BKD >16 SKS overload or <12 SKS underload violations
  useEffect(() => {
    if (activeTab !== 'bkd' && activeTab !== 'audit') return;
    if (overloadedDosenList.length === 0 && underloadedDosenList.length === 0) return;
    if (lastToastScopeKeyRef.current === scopeAlertKey) return;

    lastToastScopeKeyRef.current = scopeAlertKey;
    if (!onShowToast) return;

    if (overloadedDosenList.length > 0 && underloadedDosenList.length > 0) {
      onShowToast(
        `Audit BKD LLDIKTI: Ditemukan ${overloadedDosenList.length} dosen Beban Berlebih (>16 SKS) & ${underloadedDosenList.length} dosen Beban Kurang (<12 SKS). Segera lakukan penyeimbangan SKS.`
      );
    } else if (overloadedDosenList.length > 0) {
      const top = overloadedDosenList[0];
      onShowToast(
        `Peringatan Audit BKD (>16 SKS): ${overloadedDosenList.length} dosen melebihi batas maksimal 16 SKS/semester (tertinggi: ${top.dosen.namaLengkap} sebesar ${top.totalBebanSks} SKS).`
      );
    } else {
      const low = underloadedDosenList[0];
      onShowToast(
        `Peringatan Audit BKD (<12 SKS): ${underloadedDosenList.length} dosen memiliki beban kurang dari standar minimal 12 SKS/semester (terendah: ${low.dosen.namaLengkap} sebesar ${low.totalBebanSks} SKS).`
      );
    }
  }, [activeTab, overloadedDosenList, underloadedDosenList, scopeAlertKey, onShowToast]);

  const displayedWorkloadMetrics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dosenWorkloadMetrics.filter(m => {
      const matchStatus =
        workloadFilter === 'ALL'
          ? true
          : workloadFilter === 'OVERLOAD'
          ? m.isOverload
          : workloadFilter === 'COMPLIANT'
          ? m.isCompliant
          : m.isUnderload;
      const matchSearch =
        !q ||
        m.dosen.namaLengkap.toLowerCase().includes(q) ||
        m.dosen.nidn.toLowerCase().includes(q) ||
        m.dosen.keahlian.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [dosenWorkloadMetrics, workloadFilter, searchQuery]);

  const displayedAuditItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return auditReport.items.filter(item => {
      const d = item.metric.dosen;
      const matchStatus =
        auditFilter === 'ALL'
          ? true
          : auditFilter === 'VIOLATIONS'
          ? item.violationType !== 'SESUAI_ATURAN'
          : auditFilter === 'OVERLOAD'
          ? item.violationType === 'BEBAN_BERLEBIH'
          : auditFilter === 'UNDERLOAD'
          ? item.violationType === 'BEBAN_KURANG'
          : auditFilter === 'MISMATCH'
          ? item.hasScheduleMismatch || item.isScheduleGapUnder12 || item.isUnscheduled
          : item.violationType === 'SESUAI_ATURAN';
      const matchSearch =
        !q ||
        d.namaLengkap.toLowerCase().includes(q) ||
        d.nidn.toLowerCase().includes(q) ||
        d.keahlian.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [auditReport.items, auditFilter, searchQuery]);

  const auditChartData = useMemo(() => {
    return auditReport.items.map(item => ({
      id: item.metric.dosen.id,
      namaSingkat: item.metric.dosen.namaLengkap
        .split(',')[0]
        .replace(/(Dr\.|Prof\.|Ir\.|H\.|Hj\.)\s*/g, '')
        .trim(),
      namaLengkap: item.metric.dosen.namaLengkap,
      bebanJadwalRiil: item.bebanJadwalRiilSks,
      bebanAudit: item.bebanAuditSks,
      violationType: item.violationType
    }));
  }, [auditReport.items]);

  const dosenSksComparisonData = useMemo(() => {
    return dosenWorkloadMetrics.map(m => {
      const delta = (m.dosen.nidn ? parseInt(m.dosen.nidn.slice(-2), 10) % 3 : 1) - 1;
      const sksTahunLalu = Math.max(10, Math.min(18, Math.round((m.sksKuliah + delta) * 10) / 10));
      return {
        id: m.dosen.id,
        namaSingkat: m.dosen.namaLengkap
          .split(',')[0]
          .replace(/(Dr\.|Prof\.|Ir\.|H\.|Hj\.)\s*/g, '')
          .trim(),
        namaLengkap: m.dosen.namaLengkap,
        sksTahunIni: m.totalBebanSks,
        sksTahunLalu,
        rasioPersen: m.rasioLldiktiPersen,
        rataRataProdi: prodiAvgSks,
        isOverload: m.isOverload,
        isCompliant: m.isCompliant
      };
    });
  }, [dosenWorkloadMetrics, prodiAvgSks]);

  const maxChartDomainY = useMemo(() => {
    const highest = dosenSksComparisonData.reduce((mx, d) => Math.max(mx, d.sksTahunIni, d.sksTahunLalu), 20);
    return Math.max(22, Math.ceil(highest + 2));
  }, [dosenSksComparisonData]);

  const tren3SemesterData = [
    { semester: 'Ganjil 2025/2026', sipil: 88, lingkungan: 62, listrik: 54, totalFakultas: 204, rataRataSks: 13.6 },
    { semester: 'Genap 2025/2026', sipil: 92, lingkungan: 66, listrik: 56, totalFakultas: 214, rataRataSks: 14.1 },
    { semester: 'Ganjil 2026/2027 (Aktif)', sipil: 96, lingkungan: 68, listrik: 58, totalFakultas: 222, rataRataSks: 14.4 }
  ];

  const handleSendBkdAuditNotice = (item: BkdAuditItem) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setNotifiedAuditIds(prev => ({ ...prev, [item.metric.dosen.id]: timestamp }));
    if (!onShowToast) return;

    if (item.violationType === 'BEBAN_BERLEBIH') {
      onShowToast(
        `Notifikasi Beban Berlebih (>16 SKS) dikirim untuk ${item.metric.dosen.namaLengkap} (${item.bebanAuditSks} SKS / +${item.metric.kelebihanSks} SKS di atas batas 16 SKS).`
      );
    } else if (item.violationType === 'BEBAN_KURANG') {
      onShowToast(
        `Notifikasi Beban Kurang (<12 SKS) dikirim untuk ${item.metric.dosen.namaLengkap} (${item.bebanAuditSks} SKS / -${item.metric.kekuranganSks} SKS di bawah batas 12 SKS).`
      );
    } else {
      onShowToast(
        `Notifikasi verifikasi sinkronisasi jadwal BKD dikirim untuk ${item.metric.dosen.namaLengkap}.`
      );
    }
  };

  const handleBroadcastAllBkdViolations = () => {
    const violationItems = auditReport.items.filter(i => i.violationType !== 'SESUAI_ATURAN');
    if (violationItems.length === 0) return;
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const updated: Record<string, string> = {};
    violationItems.forEach(item => {
      updated[item.metric.dosen.id] = timestamp;
    });
    setNotifiedAuditIds(prev => ({ ...prev, ...updated }));
    if (onShowToast) {
      onShowToast(
        `Notifikasi resmi Audit BKD dikirim ke ${violationItems.length} dosen & Kaprodi (${overloadedDosenList.length} dosen >16 SKS, ${underloadedDosenList.length} dosen <12 SKS).`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <span className="font-semibold text-blue-700">{selectedProdi.nama}</span>
              <span aria-hidden="true">&bull;</span>
              <span>Gugus Penjaminan Mutu Fakultas (GPMF)</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Monitoring BKD &amp; Evaluasi Pembelajaran Dosen (EDOM)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Perhitungan rasio beban mengajar, pemenuhan standar 12–16 SKS (PO BKD LLDIKTI &amp; SN-Dikti), serta evaluasi kepuasan mahasiswa (Kriteria 4 LAM-Teknik).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterScope}
              onChange={e => setFilterScope(e.target.value)}
              aria-label="Filter cakupan dosen program studi"
              className="text-xs font-medium border border-blue-200 rounded-lg px-2.5 py-1.5 bg-blue-50/60 text-blue-900"
            >
              <option value="current">Dosen: {selectedProdi.singkatan}</option>
              <option value="all">Semua Dosen Fakultas Teknik</option>
              <option value="SIPIL">Dosen S1 Teknik Sipil</option>
              <option value="LINGKUNGAN">Dosen S1 Teknik Lingkungan</option>
              <option value="LISTRIK_D3">Dosen D3 Teknik Listrik</option>
            </select>

            <span className="text-xs font-mono tabular-nums text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0">
              {scopedDosen.length} Dosen
            </span>

            <button
              type="button"
              onClick={() => {
                setBkdPdfInitialMode('individu');
                setBkdPdfInitialDosenId(displayedWorkloadMetrics[0]?.dosen.id || scopedDosen[0]?.id || null);
                setIsBkdPdfModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Unduh Laporan Beban Mengajar Dosen Format PDF Sesuai Template LLDIKTI"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh PDF BKD (LLDIKTI)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (BKD, Audit Riil vs Aturan, EDOM) */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-3 border-t border-slate-100 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('bkd')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'bkd'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rasio Beban Mengajar &amp; Regulasi LLDIKTI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Beban SKS Riil vs Aturan BKD</span>
            {totalViolationCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-rose-100 text-rose-800 border border-rose-200 tabular-nums">
                {totalViolationCount} Pelanggaran
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bimbingan')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'bimbingan'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Monitoring Beban Pembimbingan</span>
            {bimbinganOverloadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-rose-100 text-rose-800 border border-rose-200 tabular-nums">
                {bimbinganOverloadCount} Melampaui
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mbkm_iabee')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'mbkm_iabee'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Analisis Beban MBKM</span>
            {mbkmIabeeOverloadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-rose-100 text-rose-800 border border-rose-200 tabular-nums">
                {mbkmIabeeOverloadCount} Overload
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edom')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'edom'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Evaluasi Mahasiswa (EDOM &amp; Rapor Mengajar)</span>
          </button>
        </div>
      </div>

      {/* DUAL BKD VIOLATION NOTIFICATION BANNER (>16 SKS OVERLOAD & <12 SKS UNDERLOAD) */}
      {(activeTab === 'bkd' || activeTab === 'audit') &&
        totalViolationCount > 0 &&
        dismissedBannerKey !== scopeAlertKey && (
          <div
            role="alert"
            className={`border rounded-xl p-4 sm:p-5 space-y-3 shadow-xs ${
              overloadedDosenList.length > 0
                ? 'bg-rose-50/85 border-rose-300'
                : 'bg-amber-50/90 border-amber-300'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                    overloadedDosenList.length > 0
                      ? 'bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}
                >
                  <BellRing className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      className={`text-sm font-bold ${
                        overloadedDosenList.length > 0 ? 'text-rose-950' : 'text-amber-950'
                      }`}
                    >
                      Notifikasi Audit Aturan BKD LLDIKTI (12–16 SKS):{' '}
                      {overloadedDosenList.length > 0 && `${overloadedDosenList.length} Dosen Berlebih (>16 SKS)`}
                      {overloadedDosenList.length > 0 && underloadedDosenList.length > 0 && ' · '}
                      {underloadedDosenList.length > 0 && `${underloadedDosenList.length} Dosen Kurang (<12 SKS)`}
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white uppercase">
                      PO BKD 12–16 SKS
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      overloadedDosenList.length > 0 ? 'text-rose-900' : 'text-amber-950'
                    }`}
                  >
                    Sesuai PO BKD LLDIKTI &amp; SN-Dikti, beban mengajar dosen tetap wajib berada di rentang{' '}
                    <strong>12–16 SKS/semester</strong>. Beban &gt;16 SKS berisiko menurunkan mutu ajar, sedangkan beban &lt;12 SKS dinyatakan <strong>Tidak Memenuhi Syarat (TMS)</strong> klaim BKD/Sertifikasi Dosen.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {overloadedDosenList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'audit') {
                        setAuditFilter(prev => (prev === 'OVERLOAD' ? 'ALL' : 'OVERLOAD'));
                      } else {
                        setWorkloadFilter(prev => (prev === 'OVERLOAD' ? 'ALL' : 'OVERLOAD'));
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border bg-white text-rose-800 border-rose-300 hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Filter {overloadedDosenList.length} Berlebih (&gt;16)</span>
                  </button>
                )}
                {underloadedDosenList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'audit') {
                        setAuditFilter(prev => (prev === 'UNDERLOAD' ? 'ALL' : 'UNDERLOAD'));
                      } else {
                        setWorkloadFilter(prev => (prev === 'UNDERLOAD' ? 'ALL' : 'UNDERLOAD'));
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border bg-white text-amber-900 border-amber-300 hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Filter {underloadedDosenList.length} Kurang (&lt;12)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleBroadcastAllBkdViolations}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Semua Notifikasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDismissedBannerKey(scopeAlertKey)}
                  aria-label="Tutup banner notifikasi audit BKD"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/70 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dual Violation Lecturer Cards: Overload (>16 SKS) & Underload (<12 SKS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-slate-300/60">
              {overloadedDosenList.map(m => {
                const auditItem = auditItemByDosenId[m.dosen.id];
                const sentAt = notifiedAuditIds[m.dosen.id];
                return (
                  <button
                    key={m.dosen.id}
                    type="button"
                    onClick={() => auditItem && setSelectedAuditDetail(auditItem)}
                    className="flex items-center justify-between gap-2 p-2.5 bg-white hover:bg-rose-50/70 border border-rose-200 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {m.dosen.namaLengkap}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                        {m.sksKuliah} Kuliah{calculationMode === 'bkd_total' ? ` + ${m.sksBimbingan} Bimb.` : ''}
                        {sentAt ? ` · Notif ${sentAt}` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-rose-700 tabular-nums">
                        {m.totalBebanSks} SKS
                      </div>
                      <div className="text-[10px] font-mono font-semibold text-rose-700 tabular-nums">
                        Berlebih +{m.kelebihanSks} SKS (&gt;16)
                      </div>
                    </div>
                  </button>
                );
              })}

              {underloadedDosenList.map(m => {
                const auditItem = auditItemByDosenId[m.dosen.id];
                const sentAt = notifiedAuditIds[m.dosen.id];
                return (
                  <button
                    key={m.dosen.id}
                    type="button"
                    onClick={() => auditItem && setSelectedAuditDetail(auditItem)}
                    className="flex items-center justify-between gap-2 p-2.5 bg-white hover:bg-amber-50/70 border border-amber-300 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {m.dosen.namaLengkap}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                        {m.sksKuliah} Kuliah{calculationMode === 'bkd_total' ? ` + ${m.sksBimbingan} Bimb.` : ''}
                        {sentAt ? ` · Notif ${sentAt}` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-amber-800 tabular-nums">
                        {m.totalBebanSks} SKS
                      </div>
                      <div className="text-[10px] font-mono font-semibold text-amber-700 tabular-nums">
                        Kurang -{m.kekuranganSks} SKS (&lt;12)
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      {/* TAB 1: BKD & RASIO BEBAN MENGAJAR */}
      {activeTab === 'bkd' && (
        <div className="space-y-4">

          {/* VISUALISASI EVALUASI BEBAN SKS DOSEN (RECHARTS BARCHART & AREACHART) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 mt-0.5">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Evaluasi Rasio &amp; Efisiensi Beban SKS Dosen vs Batas Maksimal LLDIKTI (16 SKS)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Perbandingan beban mengajar terhadap ambang SN-Dikti (12–16 SKS), rasio terhadap rata-rata prodi, serta tren 3 semester.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                {/* Calculation Basis Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setCalculationMode('bkd_total')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      calculationMode === 'bkd_total'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    BKD Total (Kuliah + Bimbingan TA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalculationMode('tatap_muka')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      calculationMode === 'tatap_muka'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tatap Muka Kuliah
                  </button>
                </div>

                {/* Chart Mode Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setChartMode('komparasi_2tahun')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chartMode === 'komparasi_2tahun'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Komparasi 2 Tahun
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('tren_3semester')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chartMode === 'tren_3semester'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tren 3 Semester
                  </button>
                </div>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] font-medium block">
                  Rata-rata Beban &amp; Rasio Prodi
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-base sm:text-lg font-bold text-blue-900 font-mono tabular-nums">
                    {prodiAvgSks} SKS
                  </span>
                  <span className="text-xs font-mono font-semibold text-blue-700 tabular-nums">
                    ({prodiAvgRatioPersen}% maks)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Basis: {calculationMode === 'bkd_total' ? 'Kuliah + Ekuiv. Bimbingan TA' : 'Tatap Muka Reguler'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] font-medium block">
                  Kepatuhan Regulasi LLDIKTI
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-700 font-mono tabular-nums mt-0.5 block">
                  {Math.round(
                    (dosenWorkloadMetrics.filter(m => m.isCompliant).length /
                      Math.max(1, dosenWorkloadMetrics.length)) *
                      100
                  )}
                  %
                </span>
                <span className="text-[10px] text-slate-500 tabular-nums">
                  {dosenWorkloadMetrics.filter(m => m.isCompliant).length} dari {dosenWorkloadMetrics.length} Dosen (12–16 SKS)
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setWorkloadFilter(prev => (prev === 'OVERLOAD' ? 'ALL' : 'OVERLOAD'))
                }
                className={`p-3 border rounded-xl text-left transition-colors cursor-pointer ${
                  overloadedDosenList.length > 0
                    ? 'bg-rose-50/80 border-rose-200 hover:bg-rose-100/70'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-slate-600 text-[11px] font-medium block">
                  Melebihi Batas Maks (&gt;16 SKS)
                </span>
                <span
                  className={`text-base sm:text-lg font-bold font-mono tabular-nums mt-0.5 block ${
                    overloadedDosenList.length > 0 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {overloadedDosenList.length} Dosen
                </span>
                <span className="text-[10px] text-rose-700 font-medium">
                  {overloadedDosenList.length > 0
                    ? 'Klik untuk filter & redistribusi tim teaching'
                    : 'Tidak ada pelanggaran batas 16 SKS'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setWorkloadFilter(prev => (prev === 'UNDERLOAD' ? 'ALL' : 'UNDERLOAD'))
                }
                className={`p-3 border rounded-xl text-left transition-colors cursor-pointer ${
                  underloadedDosenList.length > 0
                    ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/70'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-slate-600 text-[11px] font-medium block">
                  Di Bawah Standar (&lt;12 SKS)
                </span>
                <span
                  className={`text-base sm:text-lg font-bold font-mono tabular-nums mt-0.5 block ${
                    underloadedDosenList.length > 0 ? 'text-amber-800' : 'text-slate-800'
                  }`}
                >
                  {underloadedDosenList.length} Dosen
                </span>
                <span className={`text-[10px] font-medium ${underloadedDosenList.length > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                  {underloadedDosenList.length > 0
                    ? 'Klik untuk filter & tambah penugasan SKS'
                    : 'Tidak ada dosen di bawah 12 SKS'}
                </span>
              </button>
            </div>

            {/* Recharts Render Container */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                {chartMode === 'komparasi_2tahun' ? (
                  <BarChart
                    data={dosenSksComparisonData}
                    margin={{ top: 15, right: 20, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="namaSingkat"
                      angle={-20}
                      textAnchor="end"
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                      interval={0}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      domain={[0, maxChartDomainY]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={v => `${v} SKS`}
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
                      formatter={(val: any, name: any, props: any) => {
                        if (name === 'Beban TA 2026/2027 (Berjalan)' && props?.payload) {
                          return [`${val} SKS (${props.payload.rasioPersen}% maks LLDIKTI)`, name];
                        }
                        return [`${val} SKS`, name];
                      }}
                      labelFormatter={(label, payload) => {
                        const item = payload && payload[0] && payload[0].payload;
                        return item ? item.namaLengkap : label;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <ReferenceLine
                      y={LLDIKTI_MIN_SKS}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      label={{
                        value: 'Min BKD: 12 SKS',
                        fill: '#10b981',
                        fontSize: 10,
                        position: 'insideTopLeft'
                      }}
                    />
                    <ReferenceLine
                      y={LLDIKTI_MAX_SKS}
                      stroke="#dc2626"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      label={{
                        value: 'Batas Maks LLDIKTI: 16 SKS (100%)',
                        fill: '#dc2626',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />
                    <Bar dataKey="sksTahunIni" name="Beban TA 2026/2027 (Berjalan)" fill="#2563eb" radius={[4, 4, 0, 0]}>
                      {dosenSksComparisonData.map(entry => (
                        <Cell
                          key={entry.id}
                          fill={
                            entry.isOverload
                              ? '#dc2626'
                              : entry.sksTahunIni < LLDIKTI_MIN_SKS
                              ? '#94a3b8'
                              : '#2563eb'
                          }
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="sksTahunLalu" name="Beban TA 2025/2026 (Tahun Lalu)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart
                    data={tren3SemesterData}
                    margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorSipilBkd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorLingkBkd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorListrikBkd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="semester"
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={v => `${v} SKS`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any, name: any) => [`${val} SKS`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="sipil" name="S1 Teknik Sipil" stroke="#2563eb" fillOpacity={1} fill="url(#colorSipilBkd)" />
                    <Area type="monotone" dataKey="lingkungan" name="S1 Teknik Lingkungan" stroke="#059669" fillOpacity={1} fill="url(#colorLingkBkd)" />
                    <Area type="monotone" dataKey="listrik" name="D3 Teknik Listrik" stroke="#d97706" fillOpacity={1} fill="url(#colorListrikBkd)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* VISUALISASI BEBAN KERJA HISTORIS (3 TAHUN TERAKHIR - RECHARTS LINECHART) */}
          <BkdHistorisSection
            dosenWorkloadMetrics={dosenWorkloadMetrics}
            calculationMode={calculationMode}
            prodiLabel={
              filterScope === 'all'
                ? 'Seluruh Program Studi FT UNBARI'
                : filterScope === 'current'
                ? selectedProdi.nama
                : filterScope === 'SIPIL'
                ? 'S1 Teknik Sipil'
                : filterScope === 'LINGKUNGAN'
                ? 'S1 Teknik Lingkungan'
                : 'D3 Teknik Listrik'
            }
            onShowToast={onShowToast}
          />

          {/* LECTURER WORKLOAD RATIO TABLE */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {/* Table Toolbar: Filter Pills & Search */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {([
                  { id: 'ALL', label: `Semua (${dosenWorkloadMetrics.length})` },
                  { id: 'OVERLOAD', label: `Melebihi 16 SKS (${overloadedDosenList.length})` },
                  {
                    id: 'COMPLIANT',
                    label: `Normal 12–16 SKS (${dosenWorkloadMetrics.filter(m => m.isCompliant).length})`
                  },
                  {
                    id: 'UNDERLOAD',
                    label: `Di Bawah 12 SKS (${dosenWorkloadMetrics.filter(m => m.isUnderload).length})`
                  }
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setWorkloadFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      workloadFilter === tab.id
                        ? tab.id === 'OVERLOAD'
                          ? 'bg-rose-700 text-white border-rose-700'
                          : 'bg-slate-900 text-white border-slate-900'
                        : tab.id === 'OVERLOAD' && overloadedDosenList.length > 0
                        ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama dosen, NIDN, atau keahlian..."
                  aria-label="Cari dosen pada tabel rasio beban mengajar"
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Dosen &amp; NIDN</th>
                    <th className="py-3 px-3">Prodi &amp; Jabfung</th>
                    <th className="py-3 px-3 text-right">Beban Mengajar</th>
                    <th className="py-3 px-3 min-w-[170px]">Rasio Beban (vs 16 SKS)</th>
                    <th className="py-3 px-3 text-right">Bimbingan TA</th>
                    <th className="py-3 px-3 text-right">BAP</th>
                    <th className="py-3 px-4">Status Regulasi LLDIKTI</th>
                    <th className="py-3 px-3 text-center">Aksi &amp; Rapor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedWorkloadMetrics.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500">
                        Tidak ada data dosen yang cocok dengan filter status atau pencarian saat ini.
                      </td>
                    </tr>
                  ) : (
                    displayedWorkloadMetrics.map(metric => {
                      const { dosen, totalBebanSks, sksKuliah, sksBimbingan, rasioLldiktiPersen, rasioTerhadapProdi, kelebihanSks, kekuranganSks, isOverload, isUnderload } = metric;
                      const barWidth = Math.min(100, Math.max(6, rasioLldiktiPersen));
                      const sentTime = notifiedAuditIds[dosen.id];
                      const auditItem = auditItemByDosenId[dosen.id];

                      return (
                        <tr
                          key={dosen.id}
                          className={`transition-colors ${
                            isOverload
                              ? 'bg-rose-50/45 hover:bg-rose-50/80'
                              : isUnderload
                              ? 'bg-amber-50/45 hover:bg-amber-50/80'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Name & NIDN */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{dosen.namaLengkap}</div>
                            <div className="font-mono text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                              <span>NIDN: {dosen.nidn}</span>
                              <span aria-hidden="true">&bull;</span>
                              <span>{dosen.keahlian}</span>
                            </div>
                          </td>

                          {/* Prodi & Jabfung */}
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-slate-800">
                              {dosen.prodiId === 'SIPIL'
                                ? 'S1 Sipil'
                                : dosen.prodiId === 'LINGKUNGAN'
                                ? 'S1 Lingkungan'
                                : 'D3 Listrik'}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{dosen.jabatanFungsional}</div>
                          </td>

                          {/* Total Beban SKS + Rincian */}
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                            <div
                              className={`text-sm font-bold ${
                                isOverload
                                  ? 'text-rose-700'
                                  : isUnderload
                                  ? 'text-amber-800'
                                  : 'text-slate-900'
                              }`}
                            >
                              {totalBebanSks} SKS
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {sksKuliah} Kuliah{calculationMode === 'bkd_total' ? ` + ${sksBimbingan} Bimb.` : ''}
                            </div>
                          </td>

                          {/* Rasio Beban vs 16 SKS & Average Ratio */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums mb-1">
                              <span
                                className={`font-bold ${
                                  isOverload
                                    ? 'text-rose-700'
                                    : isUnderload
                                    ? 'text-amber-800'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {rasioLldiktiPersen}%
                              </span>
                              <span className="text-slate-500">{rasioTerhadapProdi.toFixed(2)}x rerata</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isOverload
                                    ? 'bg-rose-600'
                                    : isUnderload
                                    ? 'bg-amber-500'
                                    : metric.isNearLimit
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-600'
                                }`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                            {isOverload && (
                              <div className="text-[10px] font-mono font-semibold text-rose-700 mt-0.5 tabular-nums">
                                +{kelebihanSks} SKS di atas batas 16 SKS
                              </div>
                            )}
                            {isUnderload && (
                              <div className="text-[10px] font-mono font-semibold text-amber-800 mt-0.5 tabular-nums">
                                -{kekuranganSks} SKS di bawah batas 12 SKS
                              </div>
                            )}
                          </td>

                          {/* Mentoring count */}
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700">
                            {dosen.jumlahMahasiswaBimbingan}{' '}
                            <span className="text-[11px] text-slate-400">/ 10 Mhs</span>
                          </td>

                          {/* BAP Compliance % */}
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                            <span
                              className={`font-semibold ${
                                dosen.kehadiranBapPersen < 90 ? 'text-amber-700' : 'text-emerald-700'
                              }`}
                            >
                              {dosen.kehadiranBapPersen}%
                            </span>
                          </td>

                          {/* LLDIKTI Evaluation Badge */}
                          <td className="py-3.5 px-4">
                            {isOverload ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded whitespace-nowrap">
                                  <AlertTriangle className="w-3 h-3" />
                                  Melebihi 16 SKS (LLDIKTI)
                                </span>
                                {sentTime && (
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    Notifikasi dikirim ({sentTime})
                                  </div>
                                )}
                              </div>
                            ) : isUnderload ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded whitespace-nowrap">
                                  <AlertTriangle className="w-3 h-3" />
                                  Kurang Beban (&lt;12 SKS)
                                </span>
                                {sentTime && (
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    Notifikasi dikirim ({sentTime})
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded w-fit whitespace-nowrap">
                                <CheckCircle2 className="w-3 h-3" /> Memenuhi (12–16 SKS)
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setBkdPdfInitialMode('individu');
                                  setBkdPdfInitialDosenId(dosen.id);
                                  setIsBkdPdfModalOpen(true);
                                }}
                                title="Unduh Laporan Beban Mengajar Dosen Format PDF Template LLDIKTI"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <FileDown className="w-3 h-3 text-emerald-700" />
                                <span>PDF BKD</span>
                              </button>
                              {(isOverload || isUnderload) && auditItem && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedAuditDetail(auditItem)}
                                  title="Lihat rincian audit BKD dan kirim notifikasi LLDIKTI"
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                    isOverload
                                      ? 'text-rose-800 bg-rose-100 hover:bg-rose-200 border-rose-300'
                                      : 'text-amber-900 bg-amber-100 hover:bg-amber-200 border-amber-300'
                                  }`}
                                >
                                  <BellRing className="w-3 h-3" />
                                  <span>Peringatan</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedDosenForEdom(dosen)}
                                title="Cetak Rapor Hasil EDOM Dosen (A4)"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <Printer className="w-3 h-3 text-blue-600" />
                                <span>EDOM</span>
                              </button>
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

      {/* TAB 2: AUDIT BEBAN SKS RIIL VS ATURAN BKD (12-16 SKS) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Summary Audit KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium block">
                Kepatuhan Aturan BKD (12–16 SKS)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                  {auditReport.summary.complianceRatePersen}%
                </span>
                <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                  ({auditReport.summary.compliantCount}/{auditReport.summary.totalDosen} Dosen MS)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Rerata beban jadwal riil: {auditReport.summary.avgBebanRiilSks} SKS
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAuditFilter(prev => (prev === 'OVERLOAD' ? 'ALL' : 'OVERLOAD'))}
              className={`border rounded-xl p-4 text-left transition-colors shadow-xs cursor-pointer ${
                auditReport.summary.overloadCount > 0
                  ? 'bg-rose-50/75 border-rose-200 hover:bg-rose-100/70'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-[11px] text-slate-600 font-medium block">
                Beban Berlebih (&gt; 16 SKS)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-xl font-bold font-mono tabular-nums ${
                    auditReport.summary.overloadCount > 0 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {auditReport.summary.overloadCount} Dosen
                </span>
                {auditReport.summary.totalSurplusSks > 0 && (
                  <span className="text-[11px] font-mono font-bold text-rose-700 tabular-nums">
                    (+{auditReport.summary.totalSurplusSks} SKS)
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-600 mt-1 block">
                Status TMS-LB · Perlu pengurangan / tim teaching
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAuditFilter(prev => (prev === 'UNDERLOAD' ? 'ALL' : 'UNDERLOAD'))}
              className={`border rounded-xl p-4 text-left transition-colors shadow-xs cursor-pointer ${
                auditReport.summary.underloadCount > 0
                  ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/70'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-[11px] text-slate-600 font-medium block">
                Beban Kurang (&lt; 12 SKS)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-xl font-bold font-mono tabular-nums ${
                    auditReport.summary.underloadCount > 0 ? 'text-amber-800' : 'text-emerald-700'
                  }`}
                >
                  {auditReport.summary.underloadCount} Dosen
                </span>
                {auditReport.summary.totalDeficitSks > 0 && (
                  <span className="text-[11px] font-mono font-bold text-amber-800 tabular-nums">
                    (-{auditReport.summary.totalDeficitSks} SKS)
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-600 mt-1 block">
                Status TMS-KB · Perlu tambahan kelas / bimbingan
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAuditFilter(prev => (prev === 'MISMATCH' ? 'ALL' : 'MISMATCH'))}
              className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-4 text-left transition-colors shadow-xs cursor-pointer"
            >
              <span className="text-[11px] text-slate-500 font-medium block">
                Selisih Jadwal Riil vs Profil
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono tabular-nums text-blue-900">
                  {auditReport.summary.scheduleMismatchCount} Dosen
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Perbedaan plot SIAKAD vs data master SKS dosen
              </span>
            </button>
          </div>

          {/* Audit Comparison Chart: SKS Jadwal Riil vs Beban Audit vs Corridor 12-16 SKS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Komparasi Beban SKS Riil (Jadwal SIAKAD) vs Beban Audit Total &amp; Batas BKD (12–16 SKS)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Garis hijau menandakan batas minimal (12 SKS) dan garis merah menandakan batas maksimal (16 SKS) sesuai PO BKD LLDIKTI.
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setCalculationMode('bkd_total')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    calculationMode === 'bkd_total'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  BKD Total (Kuliah + Bimbingan TA)
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMode('tatap_muka')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    calculationMode === 'tatap_muka'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tatap Muka Kuliah
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={auditChartData} margin={{ top: 15, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="namaSingkat"
                    angle={-20}
                    textAnchor="end"
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                    interval={0}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    domain={[0, maxChartDomainY]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={v => `${v} SKS`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, name: any) => [`${val} SKS`, name]}
                    labelFormatter={(label, payload) => {
                      const item = payload && payload[0] && payload[0].payload;
                      return item ? item.namaLengkap : label;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <ReferenceLine
                    y={LLDIKTI_MIN_SKS}
                    stroke="#059669"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    label={{
                      value: 'Min BKD: 12 SKS',
                      fill: '#059669',
                      fontSize: 10,
                      position: 'insideTopLeft'
                    }}
                  />
                  <ReferenceLine
                    y={LLDIKTI_MAX_SKS}
                    stroke="#dc2626"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    label={{
                      value: 'Maks BKD: 16 SKS',
                      fill: '#dc2626',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />
                  <Bar dataKey="bebanAudit" name="Beban Audit BKD (SKS)" radius={[4, 4, 0, 0]}>
                    {auditChartData.map(entry => (
                      <Cell
                        key={entry.id}
                        fill={
                          entry.violationType === 'BEBAN_BERLEBIH'
                            ? '#dc2626'
                            : entry.violationType === 'BEBAN_KURANG'
                            ? '#d97706'
                            : '#059669'
                        }
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="bebanJadwalRiil"
                    name="SKS Jadwal SIAKAD Riil"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Redistribution / Balancing Matrix when violations exist */}
          {auditReport.summary.redistributionSuggestions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-blue-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Saran Penyeimbangan Beban Mengajar (Redistribusi &gt;16 SKS ke &lt;12 SKS)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {auditReport.summary.redistributionSuggestions.length} Pasangan Rekomendasi
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {auditReport.summary.redistributionSuggestions.map((pair, idx) => (
                  <div
                    key={`${pair.fromDosenId}-${pair.toDosenId}-${idx}`}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-rose-700 truncate">
                        {pair.fromDosenName} (+{pair.surplusSks} SKS)
                      </span>
                      <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-amber-800 truncate">
                        {pair.toDosenName} (-{pair.deficitSks} SKS)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Usulan pengalihan / <em>team teaching</em>{' '}
                      <strong className="font-mono text-slate-900">{pair.suggestedTransferSks} SKS</strong>
                      {pair.candidateCourseLabel ? ` pada MK ${pair.candidateCourseLabel}` : ''}.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {([
                  { id: 'ALL', label: `Semua (${auditReport.summary.totalDosen})` },
                  { id: 'VIOLATIONS', label: `Semua Pelanggaran (${auditReport.summary.violationCount})` },
                  { id: 'OVERLOAD', label: `Berlebih >16 SKS (${auditReport.summary.overloadCount})` },
                  { id: 'UNDERLOAD', label: `Kurang <12 SKS (${auditReport.summary.underloadCount})` },
                  { id: 'MISMATCH', label: `Selisih Jadwal (${auditReport.summary.scheduleMismatchCount})` },
                  { id: 'COMPLIANT', label: `Memenuhi 12–16 (${auditReport.summary.compliantCount})` }
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAuditFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      auditFilter === tab.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama dosen atau NIDN..."
                  aria-label="Cari dosen pada tabel audit BKD"
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Dosen &amp; Prodi</th>
                    <th className="py-3 px-3 text-right">Jadwal Riil (SIAKAD)</th>
                    <th className="py-3 px-3 text-right">Profil + Bimb. TA</th>
                    <th className="py-3 px-3 min-w-[180px]">Beban Audit vs Aturan (12–16)</th>
                    <th className="py-3 px-3 text-center">Sinkronisasi Jadwal</th>
                    <th className="py-3 px-3">Status Aturan BKD</th>
                    <th className="py-3 px-4 min-w-[220px]">Rekomendasi &amp; Notifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedAuditItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        Tidak ada data audit dosen yang cocok dengan filter saat ini.
                      </td>
                    </tr>
                  ) : (
                    displayedAuditItems.map(item => {
                      const { metric } = item;
                      const { dosen } = metric;
                      const sentTime = notifiedAuditIds[dosen.id];
                      const markerLeftPct = Math.min(96, Math.max(4, (item.bebanAuditSks / 20) * 100));

                      return (
                        <tr
                          key={dosen.id}
                          className={`transition-colors ${
                            item.violationType === 'BEBAN_BERLEBIH'
                              ? 'bg-rose-50/40 hover:bg-rose-50/75'
                              : item.violationType === 'BEBAN_KURANG'
                              ? 'bg-amber-50/40 hover:bg-amber-50/75'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{dosen.namaLengkap}</div>
                            <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                              {dosen.nidn} &bull;{' '}
                              {dosen.prodiId === 'SIPIL'
                                ? 'S1 Sipil'
                                : dosen.prodiId === 'LINGKUNGAN'
                                ? 'S1 Lingkungan'
                                : 'D3 Listrik'}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                            <div className="font-bold text-slate-900">{item.bebanJadwalRiilSks} SKS</div>
                            <div className="text-[10px] text-slate-500">
                              {metric.scheduledClasses.length} kls ({item.scheduledSks} SKS)
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                            <div className="font-semibold text-slate-800">{item.profilKuliahSks} SKS</div>
                            <div className="text-[10px] text-slate-500">
                              +{item.sksBimbinganApplied} SKS bimb.
                            </div>
                          </td>

                          {/* Corridor 12-16 SKS visual gauge */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-1">
                              <span
                                className={`font-bold ${
                                  item.violationType === 'BEBAN_BERLEBIH'
                                    ? 'text-rose-700'
                                    : item.violationType === 'BEBAN_KURANG'
                                    ? 'text-amber-800'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {item.bebanAuditSks} SKS
                              </span>
                              <span className="text-slate-500">
                                {item.selisihDariAturanSks > 0
                                  ? `+${item.selisihDariAturanSks} SKS`
                                  : item.selisihDariAturanSks < 0
                                  ? `${item.selisihDariAturanSks} SKS`
                                  : 'Dalam batas'}
                              </span>
                            </div>
                            {/* 0 - 20 SKS track with 12-16 SKS green band (60% - 80%) */}
                            <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="absolute top-0 bottom-0 bg-emerald-200/90 border-x border-emerald-500/70"
                                style={{ left: '60%', width: '20%' }}
                                title="Zona Kepatuhan BKD 12–16 SKS"
                              />
                              <div
                                className={`absolute top-0 bottom-0 w-2 -ml-1 rounded-full ${
                                  item.violationType === 'BEBAN_BERLEBIH'
                                    ? 'bg-rose-600'
                                    : item.violationType === 'BEBAN_KURANG'
                                    ? 'bg-amber-600'
                                    : 'bg-emerald-700'
                                }`}
                                style={{ left: `${markerLeftPct}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-0.5 tabular-nums">
                              <span>0</span>
                              <span>12</span>
                              <span>16</span>
                              <span>20</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                            {item.isUnscheduled ? (
                              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                Belum Terplot
                              </span>
                            ) : item.isScheduleGapUnder12 || item.hasScheduleMismatch ? (
                              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                                {item.selisihJadwalVsProfil > 0
                                  ? `+${item.selisihJadwalVsProfil}`
                                  : item.selisihJadwalVsProfil}{' '}
                                SKS Selisih
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-700">
                                Sinkron ({item.selisihJadwalVsProfil >= 0 ? `+${item.selisihJadwalVsProfil}` : item.selisihJadwalVsProfil})
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                                  item.violationType === 'BEBAN_BERLEBIH'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : item.violationType === 'BEBAN_KURANG'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                }`}
                              >
                                {item.violationType === 'SESUAI_ATURAN' ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3" />
                                )}
                                <span>{item.statusKepatuhanLabel}</span>
                              </span>
                              {sentTime && (
                                <div className="text-[10px] font-mono text-slate-500">
                                  Notif terkirim ({sentTime})
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="text-[11px] text-slate-700 leading-snug mb-2">
                              {item.rekomendasiAudit}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedAuditDetail(item)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  item.violationType === 'BEBAN_BERLEBIH'
                                    ? 'text-rose-800 bg-rose-100 hover:bg-rose-200 border-rose-300'
                                    : item.violationType === 'BEBAN_KURANG'
                                    ? 'text-amber-900 bg-amber-100 hover:bg-amber-200 border-amber-300'
                                    : 'text-slate-700 bg-white hover:bg-slate-100 border-slate-300'
                                }`}
                              >
                                <BellRing className="w-3 h-3" />
                                <span>
                                  {item.violationType === 'SESUAI_ATURAN' ? 'Detail Audit' : 'Kirim Notifikasi'}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBkdPdfInitialMode('individu');
                                  setBkdPdfInitialDosenId(dosen.id);
                                  setIsBkdPdfModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <FileDown className="w-3 h-3" />
                                <span>PDF BKD</span>
                              </button>
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

      {/* TAB 3: MONITORING BEBAN PEMBIMBINGAN TA/KP & PERINGATAN RASIO PRODI */}
      {activeTab === 'bimbingan' && (
        <BkdBimbinganSection
          dosenList={scopedDosen}
          mahasiswaList={mahasiswaList}
          sidangList={sidangList}
          kpList={kpList}
          prodiId={effectiveScopeProdiId}
          prodiLabel={
            filterScope === 'all'
              ? 'Fakultas Teknik UNBARI'
              : filterScope === 'SIPIL'
              ? 'S1 Teknik Sipil'
              : filterScope === 'LINGKUNGAN'
              ? 'S1 Teknik Lingkungan'
              : filterScope === 'LISTRIK_D3'
              ? 'D3 Teknik Listrik'
              : selectedProdi.singkatan
          }
          onShowToast={onShowToast}
        />
      )}

      {/* TAB 4: ANALISIS BEBAN KERJA DOSEN (KONVERSI SKS MBKM & DETEKSI BATAS TOTAL IABEE) */}
      {activeTab === 'mbkm_iabee' && (
        <BkdMbkmIabeeSection
          dosenList={scopedDosen}
          jadwalList={jadwalList}
          kpList={kpList}
          kerjasamaList={kerjasamaList}
          prodiLabel={
            filterScope === 'all'
              ? 'Fakultas Teknik UNBARI'
              : filterScope === 'SIPIL'
              ? 'S1 Teknik Sipil'
              : filterScope === 'LINGKUNGAN'
              ? 'S1 Teknik Lingkungan'
              : filterScope === 'LISTRIK_D3'
              ? 'D3 Teknik Listrik'
              : selectedProdi.singkatan
          }
          onShowToast={onShowToast}
        />
      )}

      {/* TAB 2: EVALUASI DOSEN OLEH MAHASISWA (EDOM) CARDS & RANKING */}
      {activeTab === 'edom' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <Star className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 fill-amber-500" />
            <div>
              <span className="font-bold block mb-0.5">
                Instrumen Evaluasi Dosen oleh Mahasiswa (EDOM) Siklus Ganjil 2025/2026:
              </span>
              <p className="leading-relaxed text-amber-950">
                Survei kepuasan mahasiswa diselenggarakan di akhir semester sebelum Ujian Akhir Semester (UAS). Hasil EDOM menjadi syarat kelayakan portofolio BKD Dosen dan dasar pertimbangan pemberian penghargaan Dosen Teladan Fakultas Teknik UNBARI.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scopedDosen.map(dosen => {
              const baseScore = 3.75 + ((parseInt(dosen.nidn.slice(-2), 10) || 20) % 20) * 0.01;
              const scorePedagogik = (baseScore + 0.04).toFixed(2);
              const scoreProfesional = (baseScore + 0.08).toFixed(2);
              const scoreKepribadian = (baseScore + 0.02).toFixed(2);
              const scoreSosial = (baseScore - 0.02).toFixed(2);
              const scoreTotal = (
                (parseFloat(scorePedagogik) +
                  parseFloat(scoreProfesional) +
                  parseFloat(scoreKepribadian) +
                  parseFloat(scoreSosial)) /
                4
              ).toFixed(2);

              return (
                <div
                  key={dosen.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:border-blue-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {dosen.namaLengkap}
                      </h3>
                      <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                        NIDN: {dosen.nidn} &bull; {dosen.jabatanFungsional}
                      </p>
                    </div>

                    <div className="text-right shrink-0 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Skor EDOM</span>
                      <span className="text-lg font-bold font-mono tabular-nums text-blue-900">
                        {scoreTotal}
                      </span>
                    </div>
                  </div>

                  {/* 4 Dimension Bar Breakdown */}
                  <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                        <span>Pedagogik</span>
                        <span className="font-mono font-bold text-slate-900">{scorePedagogik} / 4.00</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(parseFloat(scorePedagogik) / 4) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                        <span>Profesional</span>
                        <span className="font-mono font-bold text-slate-900">{scoreProfesional} / 4.00</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(parseFloat(scoreProfesional) / 4) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                        <span>Kepribadian</span>
                        <span className="font-mono font-bold text-slate-900">{scoreKepribadian} / 4.00</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${(parseFloat(scoreKepribadian) / 4) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                        <span>Sosial</span>
                        <span className="font-mono font-bold text-slate-900">{scoreSosial} / 4.00</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(parseFloat(scoreSosial) / 4) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sangat Baik
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedDosenForEdom(dosen)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Rapor A4</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Detail Audit BKD & Pengiriman Notifikasi Pelanggaran (Overload >16 SKS / Underload <12 SKS) */}
      {selectedAuditDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div
              className={`p-4 sm:p-5 text-white flex items-start justify-between gap-3 ${
                selectedAuditDetail.violationType === 'BEBAN_BERLEBIH'
                  ? 'bg-rose-900'
                  : selectedAuditDetail.violationType === 'BEBAN_KURANG'
                  ? 'bg-amber-900'
                  : 'bg-slate-900'
              }`}
            >
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-white/80">
                  {selectedAuditDetail.violationType === 'BEBAN_BERLEBIH'
                    ? 'Audit Beban Berlebih Regulasi LLDIKTI (> 16 SKS)'
                    : selectedAuditDetail.violationType === 'BEBAN_KURANG'
                    ? 'Audit Beban Kurang Regulasi LLDIKTI (< 12 SKS)'
                    : 'Audit Komparasi Beban Riil vs Aturan BKD (12–16 SKS)'}
                </div>
                <h3 className="text-base font-bold mt-0.5">
                  {selectedAuditDetail.metric.dosen.namaLengkap}
                </h3>
                <p className="text-xs text-white/85 mt-0.5 font-mono">
                  NIDN: {selectedAuditDetail.metric.dosen.nidn} · {selectedAuditDetail.metric.dosen.jabatanFungsional}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditDetail(null)}
                aria-label="Tutup modal detail audit BKD"
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`p-3 rounded-xl border ${
                    selectedAuditDetail.violationType === 'BEBAN_BERLEBIH'
                      ? 'bg-rose-50 border-rose-200'
                      : selectedAuditDetail.violationType === 'BEBAN_KURANG'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <span className="text-[11px] text-slate-700 block">Beban Audit Saat Ini</span>
                  <span
                    className={`text-xl font-bold font-mono tabular-nums ${
                      selectedAuditDetail.violationType === 'BEBAN_BERLEBIH'
                        ? 'text-rose-700'
                        : selectedAuditDetail.violationType === 'BEBAN_KURANG'
                        ? 'text-amber-800'
                        : 'text-emerald-700'
                    }`}
                  >
                    {selectedAuditDetail.bebanAuditSks} SKS
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-600 block">Beban Jadwal SIAKAD Riil</span>
                  <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {selectedAuditDetail.bebanJadwalRiilSks} SKS
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-600 block">Selisih vs Aturan (12–16)</span>
                  <span
                    className={`text-xl font-bold font-mono tabular-nums ${
                      selectedAuditDetail.selisihDariAturanSks > 0
                        ? 'text-rose-700'
                        : selectedAuditDetail.selisihDariAturanSks < 0
                        ? 'text-amber-800'
                        : 'text-emerald-700'
                    }`}
                  >
                    {selectedAuditDetail.selisihDariAturanSks > 0
                      ? `+${selectedAuditDetail.selisihDariAturanSks} SKS`
                      : selectedAuditDetail.selisihDariAturanSks < 0
                      ? `${selectedAuditDetail.selisihDariAturanSks} SKS`
                      : '0 SKS'}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/70">
                <div className="font-bold text-slate-900">Komparasi Rincian Perhitungan BKD:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="flex justify-between bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-600">Tatap Muka Profil Master:</span>
                    <strong className="text-slate-900">{selectedAuditDetail.profilKuliahSks} SKS</strong>
                  </div>
                  <div className="flex justify-between bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-600">Tatap Muka Jadwal SIAKAD:</span>
                    <strong className="text-slate-900">{selectedAuditDetail.scheduledSks} SKS</strong>
                  </div>
                  <div className="flex justify-between bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-600">
                      Ekuiv. Bimbingan TA ({selectedAuditDetail.metric.dosen.jumlahMahasiswaBimbingan} mhs):
                    </span>
                    <strong className="text-slate-900">{selectedAuditDetail.sksBimbinganApplied} SKS</strong>
                  </div>
                  <div className="flex justify-between bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-600">Status Kepatuhan:</span>
                    <strong className="text-slate-900">{selectedAuditDetail.statusKepatuhanKode}</strong>
                  </div>
                </div>
                {selectedAuditDetail.metric.scheduledClasses.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1.5">
                      Mata Kuliah Terjadwal ({selectedAuditDetail.metric.scheduledClasses.length} Kelas ·{' '}
                      {selectedAuditDetail.scheduledSks} SKS):
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {selectedAuditDetail.metric.scheduledClasses.map(cls => (
                        <div
                          key={cls.id}
                          className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200 text-[11px]"
                        >
                          <span className="truncate font-medium text-slate-800">
                            {cls.kodeMK} — {cls.namaMK} (Kelas {cls.kelas})
                          </span>
                          <span className="font-mono font-bold text-slate-700 shrink-0 ml-2">
                            {cls.sks} SKS · {cls.hari}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 leading-relaxed">
                <strong>Rekomendasi Tindak Lanjut Audit BKD:</strong> {selectedAuditDetail.rekomendasiAudit}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const id = selectedAuditDetail.metric.dosen.id;
                  setSelectedAuditDetail(null);
                  setBkdPdfInitialMode('individu');
                  setBkdPdfInitialDosenId(id);
                  setIsBkdPdfModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Unduh PDF BKD (LLDIKTI)</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAuditDetail(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSendBkdAuditNotice(selectedAuditDetail);
                    setSelectedAuditDetail(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-white font-bold rounded-xl text-xs cursor-pointer ${
                    selectedAuditDetail.violationType === 'BEBAN_BERLEBIH'
                      ? 'bg-rose-700 hover:bg-rose-800'
                      : selectedAuditDetail.violationType === 'BEBAN_KURANG'
                      ? 'bg-amber-700 hover:bg-amber-800'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {selectedAuditDetail.violationType === 'BEBAN_BERLEBIH'
                      ? 'Kirim Notifikasi Beban Berlebih (>16)'
                      : selectedAuditDetail.violationType === 'BEBAN_KURANG'
                      ? 'Kirim Notifikasi Beban Kurang (<12)'
                      : 'Kirim Notifikasi Sinkronisasi BKD'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Unduh Laporan Beban Mengajar Dosen Format PDF LLDIKTI */}
      <BkdLldiktiPdfModal
        isOpen={isBkdPdfModalOpen}
        onClose={() => setIsBkdPdfModalOpen(false)}
        metricsList={dosenWorkloadMetrics}
        initialDosenId={bkdPdfInitialDosenId}
        initialViewMode={bkdPdfInitialMode}
        calculationMode={calculationMode}
        prodiAvgSks={prodiAvgSks}
        selectedProdi={selectedProdi}
        onShowToast={onShowToast}
      />

      {/* Modal Cetak Rapor EDOM Dosen */}
      <EdomPrintModal
        isOpen={!!selectedDosenForEdom}
        onClose={() => setSelectedDosenForEdom(null)}
        dosen={selectedDosenForEdom}
        selectedProdi={selectedProdi}
      />
    </div>
  );
};
