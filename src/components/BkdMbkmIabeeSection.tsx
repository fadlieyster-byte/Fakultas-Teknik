import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  GraduationCap,
  Plus,
  RotateCcw,
  Send,
  Sliders,
  Trash2
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  DokumenKerjasama,
  Dosen,
  JadwalKerjaPraktek,
  JadwalKuliah
} from '../types/index';
import {
  buildBkdMbkmIabeeReport,
  DEFAULT_MBKM_CONVERSION_CONFIG,
  DosenMbkmIabeeMetric,
  JenisKegiatanMbkm,
  MbkmDosenActivity,
  MbkmRedistributionProposal,
  MbkmRedistributionTransfer,
  StatusBebanIabee
} from '../utils/bkdMbkmIabeeHelper';

interface BkdMbkmIabeeSectionProps {
  dosenList: Dosen[];
  jadwalList: JadwalKuliah[];
  kpList: JadwalKerjaPraktek[];
  kerjasamaList: DokumenKerjasama[];
  prodiLabel: string;
  onShowToast?: (msg: string) => void;
}

function getStatusTextClass(status: StatusBebanIabee): string {
  switch (status) {
    case 'MELEBIHI_BATAS_IABEE':
      return 'text-rose-700 font-bold';
    case 'MENDEKATI_BATAS_IABEE':
      return 'text-amber-700 font-semibold';
    case 'SESUAI_STANDAR_IABEE':
      return 'text-emerald-700 font-semibold';
    case 'DI_BAWAH_STANDAR':
      return 'text-sky-700 font-semibold';
  }
}

function getStatusLabel(status: StatusBebanIabee): string {
  switch (status) {
    case 'MELEBIHI_BATAS_IABEE':
      return 'Melebihi Batas IABEE';
    case 'MENDEKATI_BATAS_IABEE':
      return 'Mendekati Ambang';
    case 'SESUAI_STANDAR_IABEE':
      return 'Sesuai Standar IABEE';
    case 'DI_BAWAH_STANDAR':
      return 'Di Bawah Minimal';
  }
}

export const BkdMbkmIabeeSection: React.FC<BkdMbkmIabeeSectionProps> = ({
  dosenList,
  jadwalList,
  kpList,
  kerjasamaList,
  prodiLabel,
  onShowToast
}) => {
  const [maxIabeeSks, setMaxIabeeSks] = useState<number>(
    DEFAULT_MBKM_CONVERSION_CONFIG.maxIabeeSks
  );
  const [jamPerSksBkd, setJamPerSksBkd] = useState<number>(
    DEFAULT_MBKM_CONVERSION_CONFIG.jamPerSksBkd
  );
  const [sksPerMagang, setSksPerMagang] = useState<number>(
    DEFAULT_MBKM_CONVERSION_CONFIG.sksPerMahasiswaMagang
  );
  const [sksPerStudiIndependen, setSksPerStudiIndependen] = useState<number>(
    DEFAULT_MBKM_CONVERSION_CONFIG.sksPerMahasiswaStudiIndependen
  );
  const [includeBimbinganTa, setIncludeBimbinganTa] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | StatusBebanIabee>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDosenId, setExpandedDosenId] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<MbkmRedistributionTransfer[]>([]);
  const [customActivities, setCustomActivities] = useState<MbkmDosenActivity[]>([]);

  // Simulation Drawer State
  const [showSimForm, setShowSimForm] = useState<boolean>(false);
  const [simDosenId, setSimDosenId] = useState<string>(dosenList[0]?.id ?? '');
  const resolvedSimDosenId = useMemo(
    () => (dosenList.some(d => d.id === simDosenId) ? simDosenId : (dosenList[0]?.id ?? '')),
    [dosenList, simDosenId]
  );
  const [simJenis, setSimJenis] = useState<JenisKegiatanMbkm>('MAGANG');
  const [simProgram, setSimProgram] = useState<string>(
    'MSIB Batch Berjalan - Pendampingan Lapangan'
  );
  const [simMitra, setSimMitra] = useState<string>('Mitra DUDI / Kampus Merdeka');
  const [simJumlahMhs, setSimJumlahMhs] = useState<number>(4);
  const [simJamManual, setSimJamManual] = useState<number | null>(null);

  const computedSimHours = useMemo(() => {
    if (simJamManual !== null && simJamManual > 0) return simJamManual;
    const rate = simJenis === 'MAGANG' ? sksPerMagang : sksPerStudiIndependen;
    return Math.round(simJumlahMhs * rate * jamPerSksBkd * 10) / 10;
  }, [simJamManual, simJenis, simJumlahMhs, sksPerMagang, sksPerStudiIndependen, jamPerSksBkd]);

  const report = useMemo(
    () =>
      buildBkdMbkmIabeeReport({
        dosenList,
        jadwalList,
        kpList,
        kerjasamaList,
        customActivities,
        transfers,
        config: {
          jamPerSksBkd,
          maxIabeeSks,
          sksPerMahasiswaMagang: sksPerMagang,
          sksPerMahasiswaStudiIndependen: sksPerStudiIndependen,
          includeBimbinganTaRutin: includeBimbinganTa
        }
      }),
    [
      dosenList,
      jadwalList,
      kpList,
      kerjasamaList,
      customActivities,
      transfers,
      jamPerSksBkd,
      maxIabeeSks,
      sksPerMagang,
      sksPerStudiIndependen,
      includeBimbinganTa
    ]
  );

  const filteredMetrics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return report.metrics.filter(m => {
      const matchStatus = statusFilter === 'ALL' ? true : m.statusIabee === statusFilter;
      const matchSearch =
        !q ||
        m.dosen.namaLengkap.toLowerCase().includes(q) ||
        m.dosen.nidn.toLowerCase().includes(q) ||
        m.activities.some(
          a =>
            a.namaProgram.toLowerCase().includes(q) ||
            a.mitraInstansi.toLowerCase().includes(q)
        );
      return matchStatus && matchSearch;
    });
  }, [report.metrics, statusFilter, searchQuery]);

  const chartData = useMemo(() => {
    return report.metrics.slice(0, 14).map(m => {
      const shortName =
        m.dosen.namaLengkap
          .replace(/^(Prof\.|Dr\.|Ir\.)\s*/g, '')
          .split(',')[0]
          .split(' ')
          .slice(0, 2)
          .join(' ') || m.dosen.namaLengkap;
      return {
        id: m.dosen.id,
        namaSingkat: shortName,
        namaLengkap: m.dosen.namaLengkap,
        mengajarRutin: m.sksMengajarRutin,
        bimbinganTa: includeBimbinganTa ? m.sksBimbinganTaRutin : 0,
        mbkmMagang: m.sksMbkmMagang,
        mbkmStudiIndependen: roundPlusKoord(
          m.sksMbkmStudiIndependen,
          m.sksKoordinatorMbkm
        ),
        totalIabee: m.totalBebanKerjaIabee,
        status: m.statusIabee
      };
    });
  }, [report.metrics, includeBimbinganTa]);

  const pendingProposals = report.proposals.filter(p => !p.isApplied);

  const handleToggleProposal = (proposal: MbkmRedistributionProposal) => {
    if (proposal.isApplied) {
      setTransfers(prev => prev.filter(t => t.activityId !== proposal.activity.id));
      onShowToast?.(
        `Pengalihan DPL MBKM ${proposal.fromDosen.namaLengkap} → ${proposal.toDosen.namaLengkap} dibatalkan.`
      );
      return;
    }

    setTransfers(prev => [
      ...prev.filter(t => t.activityId !== proposal.activity.id),
      {
        activityId: proposal.activity.id,
        fromDosenId: proposal.fromDosen.id,
        toDosenId: proposal.toDosen.id,
        appliedAt: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);
    onShowToast?.(
      `Simulasi diterapkan: ${proposal.sksDipindahkan} SKS MBKM dialihkan dari ${proposal.fromDosen.namaLengkap} ke ${proposal.toDosen.namaLengkap}.`
    );
  };

  const handleApplyAllProposals = () => {
    if (pendingProposals.length === 0) return;
    const nowStr = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setTransfers(prev => {
      const next = [...prev];
      pendingProposals.forEach(p => {
        if (!next.some(t => t.activityId === p.activity.id)) {
          next.push({
            activityId: p.activity.id,
            fromDosenId: p.fromDosen.id,
            toDosenId: p.toDosen.id,
            appliedAt: nowStr
          });
        }
      });
      return next;
    });
    onShowToast?.(
      `${pendingProposals.length} rekomendasi redistribusi DPL MBKM diterapkan untuk memenuhi standar beban kerja total IABEE.`
    );
  };

  const handleResetSimulation = () => {
    setTransfers([]);
    setCustomActivities([]);
    onShowToast?.('Simulasi penugasan dan redistribusi MBKM dikembalikan ke data awal.');
  };

  const handleAddSimulationActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDosen = dosenList.find(d => d.id === resolvedSimDosenId) ?? dosenList[0];
    if (!targetDosen) return;

    const cleanQty = Math.max(1, Math.min(25, Number(simJumlahMhs) || 1));
    const cleanHours = Math.max(5, Math.min(360, Number(computedSimHours) || 22.5));
    const newAct: MbkmDosenActivity = {
      id: `SIM-MBKM-${Date.now()}`,
      dosenId: targetDosen.id,
      prodiId: targetDosen.prodiId,
      jenis: simJenis,
      namaProgram:
        simProgram.trim() ||
        (simJenis === 'MAGANG'
          ? 'Magang Industri Terkonversi 20 SKS'
          : 'Studi Independen Bersertifikat MSIB'),
      mitraInstansi: simMitra.trim() || 'Mitra Kampus Merdeka',
      jumlahMahasiswa: cleanQty,
      jamBimbingan: cleanHours,
      jamOverride: simJamManual !== null && simJamManual > 0 ? cleanHours : undefined,
      sksEkivalenMahasiswa: 20,
      sksKonversiDosen: 0, // recomputed inside helper
      sumberData: 'SIMULASI_USER',
      nomorBukti: `SIM/${targetDosen.prodiId}/2026`,
      canReassign: true
    };

    setCustomActivities(prev => [...prev, newAct]);
    setSimJamManual(null);
    setExpandedDosenId(targetDosen.id);
    setShowSimForm(false);
    const previewSks = Math.round((cleanHours / jamPerSksBkd) * 100) / 100;
    onShowToast?.(
      `Simulasi ${simJenis === 'MAGANG' ? 'Magang' : 'Studi Independen'} (${cleanHours} jam → +${previewSks} SKS) ditambahkan ke ${targetDosen.namaLengkap}.`
    );
  };

  const handleRemoveCustomActivity = (activityId: string) => {
    setCustomActivities(prev => prev.filter(a => a.id !== activityId));
    setTransfers(prev => prev.filter(t => t.activityId !== activityId));
  };

  const handleCopyAuditReport = () => {
    const lines = [
      `LAPORAN ANALISIS BEBAN KERJA DOSEN (KONVERSI MBKM & BATAS IABEE)`,
      `Unit: ${prodiLabel} | Batas Maksimal IABEE: ${maxIabeeSks} SKS | Konversi: Magang ${sksPerMagang} SKS/mhs, Studi Independen ${sksPerStudiIndependen} SKS/mhs`,
      `Ringkasan: ${report.summary.totalDosen} Dosen Teraudit | Total Konversi MBKM: ${report.summary.totalSksMbkmSeluruhDosen} SKS | Overload IABEE: ${report.summary.overloadCount} Dosen (${report.summary.persenKepatuhanIabee}% Patuh)`,
      ``,
      `DAFTAR DOSEN MELAMPAUI BATAS TOTAL IABEE (>${maxIabeeSks} SKS):`
    ];
    if (report.overloadedDosen.length === 0) {
      lines.push(`- Tidak ada dosen yang melebihi batas beban kerja total IABEE.`);
    } else {
      report.overloadedDosen.forEach((m, i) => {
        lines.push(
          `${i + 1}. ${m.dosen.namaLengkap} (${m.dosen.prodiId}) — Mengajar Rutin ${m.sksMengajarRutin} SKS + TA ${
            includeBimbinganTa ? m.sksBimbinganTaRutin : 0
          } SKS + MBKM ${m.totalSksMbkm} SKS = ${m.totalBebanKerjaIabee} SKS (Kelebihan +${m.selisihDariBatasIabee} SKS)`
        );
      });
    }
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
    onShowToast?.('Ringkasan audit beban kerja MBKM & IABEE disalin ke clipboard.');
  };

  return (
    <div className="space-y-5">
      {/* 1. 4-CELL SINGLE-SURFACE KPI STRIP */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Cakupan Dosen &amp; Peserta MBKM
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {report.summary.totalDosen}
              </span>
              <span className="text-xs text-slate-500">Dosen · {prodiLabel}</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-600 font-mono tabular-nums">
              {report.summary.totalMahasiswaMagang} Mhs Magang ·{' '}
              {report.summary.totalMahasiswaStudiIndependen} Mhs Studi Independen
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Konversi Jam Bimbingan MBKM
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-amber-700">
                {report.summary.totalSksMbkmSeluruhDosen.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">SKS Ekivalen BKD</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-600 font-mono tabular-nums">
              {report.summary.totalJamBimbinganSeluruhDosen.toFixed(1)} jam ÷ {jamPerSksBkd} jam/SKS
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Deteksi Overload Total IABEE
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  report.summary.overloadCount > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {report.summary.overloadCount}
              </span>
              <span className="text-xs text-slate-500">
                Dosen &gt; <span className="font-mono">{maxIabeeSks}</span> SKS
              </span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-600 font-mono tabular-nums">
              {report.summary.nearLimitCount} mendekati ambang ·{' '}
              {report.summary.underloadCount} di bawah 12 SKS
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Rata-rata Beban Total IABEE
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  report.summary.avgTotalBebanIabee > maxIabeeSks
                    ? 'text-rose-600'
                    : 'text-slate-900'
                }`}
              >
                {report.summary.avgTotalBebanIabee.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">SKS / Semester</span>
            </div>
            <div className="mt-1.5 text-[11px] font-medium text-emerald-700 font-mono tabular-nums">
              {report.summary.persenKepatuhanIabee}% memenuhi rentang IABEE
            </div>
          </div>
        </div>
      </div>

      {/* 2. PARAMETER KONVERSI MBKM & SIMULASI BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Sliders className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Konversi Otomatis Jam Bimbingan MBKM ke SKS &amp; Batas Maksimum 16 SKS
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengonversi jam bimbingan{' '}
                <span className="font-semibold text-slate-700">Magang Industri</span> &amp;{' '}
                <span className="font-semibold text-slate-700">Studi Independen</span> (1 SKS ={' '}
                <span className="font-mono">{jamPerSksBkd}</span> jam/smt) serta menggabungkannya dengan beban mengajar + bimbingan TA.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSimForm(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Jam Bimbingan MBKM</span>
            </button>
            <button
              type="button"
              onClick={handleCopyAuditReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Laporan</span>
            </button>
            {(transfers.length > 0 || customActivities.length > 0) && (
              <button
                type="button"
                onClick={handleResetSimulation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulasi</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Standar Jam per 1 SKS BKD
            </label>
            <select
              value={jamPerSksBkd}
              onChange={e => setJamPerSksBkd(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value={40}>40.0 Jam / SKS</option>
              <option value={45}>45.0 Jam / SKS (BKD Dikti)</option>
              <option value={48}>48.0 Jam / SKS</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Batas Maksimum Beban Total
            </label>
            <select
              value={maxIabeeSks}
              onChange={e => setMaxIabeeSks(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value={14}>14.0 SKS (Ketat Riset)</option>
              <option value={15}>15.0 SKS (Ideal OBE)</option>
              <option value={16}>16.0 SKS (Maks BKD / IABEE)</option>
              <option value={17}>17.0 SKS (Toleransi +1)</option>
              <option value={18}>18.0 SKS (Darurat)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Magang ({Math.round(sksPerMagang * jamPerSksBkd * 10) / 10} Jam / Mhs)
            </label>
            <select
              value={sksPerMagang}
              onChange={e => setSksPerMagang(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value={0.35}>0.35 SKS (~15.8 Jam/Mhs)</option>
              <option value={0.5}>0.50 SKS (~22.5 Jam/Mhs)</option>
              <option value={0.65}>0.65 SKS (~29.3 Jam/Mhs)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Studi Indep. ({Math.round(sksPerStudiIndependen * jamPerSksBkd * 10) / 10} Jam / Mhs)
            </label>
            <select
              value={sksPerStudiIndependen}
              onChange={e => setSksPerStudiIndependen(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value={0.25}>0.25 SKS (~11.3 Jam/Mhs)</option>
              <option value={0.35}>0.35 SKS (~15.8 Jam/Mhs)</option>
              <option value={0.5}>0.50 SKS (~22.5 Jam/Mhs)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Komponen Beban Total
            </label>
            <button
              type="button"
              onClick={() => setIncludeBimbinganTa(prev => !prev)}
              className={`w-full px-2.5 py-1.5 border rounded-lg text-left font-medium transition-colors cursor-pointer ${
                includeBimbinganTa
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {includeBimbinganTa
                ? 'Mengajar + Bimbingan + MBKM'
                : 'Mengajar + MBKM Saja'}
            </button>
          </div>
        </div>

        {/* INLINE SIMULATION FORM */}
        {showSimForm && (
          <form
            onSubmit={handleAddSimulationActivity}
            className="mt-3 pt-3 border-t border-slate-200 bg-slate-50 rounded-lg p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs"
          >
            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Dosen Pembimbing</label>
              <select
                value={resolvedSimDosenId}
                onChange={e => setSimDosenId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                {dosenList.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.namaLengkap} ({d.prodiId})
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Jenis MBKM</label>
              <select
                value={simJenis}
                onChange={e => {
                  setSimJenis(e.target.value as JenisKegiatanMbkm);
                  setSimJamManual(null);
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="MAGANG">Magang Industri</option>
                <option value="STUDI_INDEPENDEN">Studi Independen</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Program</label>
              <input
                type="text"
                value={simProgram}
                onChange={e => setSimProgram(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                placeholder="Mis. MSIB Magang"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Mitra / Lembaga</label>
              <input
                type="text"
                value={simMitra}
                onChange={e => setSimMitra(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
                placeholder="Nama Mitra"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">Mhs</label>
              <input
                type="number"
                min={1}
                max={25}
                value={simJumlahMhs}
                onChange={e => {
                  setSimJumlahMhs(Number(e.target.value));
                  setSimJamManual(null);
                }}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-slate-900"
              />
            </div>
            <div className="md:col-span-1">
              <label
                className="block font-semibold text-slate-700 mb-1"
                title="Total jam bimbingan per semester yang akan dikonversi ke SKS"
              >
                Jam ({Math.round((computedSimHours / jamPerSksBkd) * 100) / 100} SKS)
              </label>
              <input
                type="number"
                min={5}
                max={360}
                step={0.5}
                value={computedSimHours}
                onChange={e => setSimJamManual(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-slate-900"
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                Konversi
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. DETEKSI OVERLOAD TOTAL IABEE & REKOMENDASI REDISTRIBUSI DPL MBKM */}
      {report.overloadedDosen.length > 0 ? (
        <div className="bg-rose-50/75 border border-rose-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-950">
                  Peringatan Batas Beban Kerja Total IABEE (&gt;{maxIabeeSks} SKS):{' '}
                  <span className="font-mono tabular-nums">{report.overloadedDosen.length}</span>{' '}
                  Dosen Terdeteksi Overload
                </h4>
                <p className="text-xs text-rose-900 mt-0.5 leading-relaxed">
                  Akumulasi pengajaran rutin + konversi SKS Magang &amp; Studi Independen MBKM menyebabkan beban kerja dosen melampaui ambang IABEE. Gunakan usulan redistribusi DPL MBKM di bawah untuk menjaga rasio kecukupan pengajaran.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {pendingProposals.length > 0 && (
                <button
                  type="button"
                  onClick={handleApplyAllProposals}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Terapkan {pendingProposals.length} Redistribusi</span>
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  onShowToast?.(
                    `Notifikasi peringatan beban IABEE (> ${maxIabeeSks} SKS) dikirim ke Kaprodi ${prodiLabel} untuk ${report.overloadedDosen.length} dosen.`
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-white hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Peringatan Kaprodi</span>
              </button>
            </div>
          </div>

          {report.proposals.length > 0 && (
            <div className="bg-white border border-rose-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
              {report.proposals.map(prop => (
                <div
                  key={prop.id}
                  className="p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 font-semibold text-slate-900">
                      <span className="text-rose-700">{prop.fromDosen.namaLengkap}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-700">{prop.toDosen.namaLengkap}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono tabular-nums text-amber-800">
                        {prop.sksDipindahkan} SKS ({prop.activity.jenis === 'MAGANG' ? 'Magang' : 'Studi Independen'})
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Program: <span className="font-medium text-slate-800">{prop.activity.namaProgram}</span> · Dampak:{' '}
                      <span className="font-mono tabular-nums">
                        {prop.fromBeforeSks} → {prop.fromAfterSks} SKS
                      </span>{' '}
                      (penerima:{' '}
                      <span className="font-mono tabular-nums">
                        {prop.toBeforeSks} → {prop.toAfterSks} SKS
                      </span>
                      )
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleProposal(prop)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      prop.isApplied
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{prop.isApplied ? 'Batalkan Pengalihan' : 'Alihkan DPL MBKM'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50/75 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Seluruh dosen pada cakupan <span className="font-semibold">{prodiLabel}</span> berada di bawah batas maksimal total IABEE ({maxIabeeSks} SKS).
            </span>
          </div>
          {transfers.length > 0 && (
            <button
              type="button"
              onClick={handleResetSimulation}
              className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 font-semibold rounded-lg hover:bg-emerald-100 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset Redistribusi ({transfers.length})
            </button>
          )}
        </div>
      )}

      {/* 4. GRAFIK INTEGRASI BEBAN MENGAJAR RUTIN VS KONVERSI MBKM TERHADAP BATAS IABEE */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Visualisasi Perbandingan Beban Kerja Total (Mengajar + Bimbingan + MBKM) vs Batas Maksimum {maxIabeeSks} SKS
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik batang bertumpuk memperlihatkan proporsi Mengajar Rutin, Bimbingan TA, dan Konversi Jam Bimbingan MBKM terhadap ambang batas maksimum {maxIabeeSks} SKS.
            </p>
          </div>
          <div className="text-[11px] font-mono tabular-nums text-slate-600">
            Min BKD: 12.0 SKS · Batas Maks: {maxIabeeSks.toFixed(1)} SKS
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: -12, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="namaSingkat"
                tick={{ fontSize: 10, fill: '#475569' }}
                angle={-20}
                textAnchor="end"
                height={48}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                domain={[0, Math.max(22, maxIabeeSks + 4)]}
              />
              <RechartsTooltip
                contentStyle={{
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1'
                }}
                formatter={(value, name) => [`${value ?? 0} SKS`, String(name ?? '')]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.namaLengkap ?? ''
                }
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <ReferenceLine
                y={12}
                stroke="#d97706"
                strokeDasharray="4 4"
                label={{
                  value: 'Min 12 SKS',
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: '#b45309'
                }}
              />
              <ReferenceLine
                y={maxIabeeSks}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{
                  value: `Batas IABEE ${maxIabeeSks} SKS`,
                  position: 'insideTopRight',
                  fontSize: 10,
                  fill: '#b91c1c'
                }}
              />
              <Bar
                dataKey="mengajarRutin"
                name="Mengajar Rutin"
                stackId="a"
                fill="#334155"
              />
              {includeBimbinganTa && (
                <Bar
                  dataKey="bimbinganTa"
                  name="Bimbingan TA Rutin"
                  stackId="a"
                  fill="#0284c7"
                />
              )}
              <Bar
                dataKey="mbkmMagang"
                name="Konversi Magang MBKM"
                stackId="a"
                fill="#d97706"
              />
              <Bar
                dataKey="mbkmStudiIndependen"
                name="Konversi Studi Independen / PMM"
                stackId="a"
                fill="#0d9488"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. TABEL RINCIAN AUDIT BEBAN KERJA DOSEN (MBKM & IABEE) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(
              [
                { id: 'ALL', label: `Semua (${report.metrics.length})` },
                {
                  id: 'MELEBIHI_BATAS_IABEE',
                  label: `Melebihi Batas IABEE (${report.summary.overloadCount})`
                },
                {
                  id: 'MENDEKATI_BATAS_IABEE',
                  label: `Mendekati (${report.summary.nearLimitCount})`
                },
                {
                  id: 'SESUAI_STANDAR_IABEE',
                  label: `Sesuai Standar (${report.compliantDosen.length})`
                },
                {
                  id: 'DI_BAWAH_STANDAR',
                  label: `Di Bawah 12 SKS (${report.summary.underloadCount})`
                }
              ] as const
            ).map(btn => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setStatusFilter(btn.id)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === btn.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama dosen, NIDN, atau mitra MBKM..."
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 w-full lg:w-72 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-4">Dosen &amp; Prodi</th>
                <th className="py-2.5 px-3 text-right">Mengajar</th>
                {includeBimbinganTa && (
                  <th className="py-2.5 px-3 text-right">Bimbingan TA</th>
                )}
                <th className="py-2.5 px-3 text-right">Jam → SKS MBKM</th>
                <th className="py-2.5 px-3 min-w-[165px]">Perbandingan vs {maxIabeeSks} SKS</th>
                <th className="py-2.5 px-3 text-right">Selisih</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td
                    colSpan={includeBimbinganTa ? 8 : 7}
                    className="py-8 text-center text-slate-500"
                  >
                    Tidak ada data dosen yang sesuai dengan filter pencarian saat ini.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((m: DosenMbkmIabeeMetric) => {
                  const isExpanded = expandedDosenId === m.dosen.id;
                  const pctBar = Math.min(
                    100,
                    Math.round((m.totalBebanKerjaIabee / Math.max(1, maxIabeeSks)) * 100)
                  );
                  return (
                    <React.Fragment key={m.dosen.id}>
                      <tr
                        className={`hover:bg-slate-50/80 transition-colors ${
                          m.statusIabee === 'MELEBIHI_BATAS_IABEE'
                            ? 'bg-rose-50/35'
                            : ''
                        }`}
                      >
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {m.dosen.namaLengkap}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono">{m.dosen.nidn}</span> ·{' '}
                            {m.dosen.prodiId} · {m.dosen.jabatanFungsional}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                          {m.sksMengajarRutin.toFixed(1)} SKS
                        </td>
                        {includeBimbinganTa && (
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sky-800">
                            {m.sksBimbinganTaRutin.toFixed(1)} SKS
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {m.totalSksMbkm > 0 ? (
                            <div>
                              <div className="text-amber-800 font-semibold">
                                +{m.totalSksMbkm.toFixed(2)} SKS
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {m.totalJamBimbinganMbkm.toFixed(1)} jam bimbingan
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">0 jam · 0.00</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-1">
                            <span
                              className={`font-bold ${
                                m.statusIabee === 'MELEBIHI_BATAS_IABEE'
                                  ? 'text-rose-700'
                                  : m.statusIabee === 'MENDEKATI_BATAS_IABEE'
                                  ? 'text-amber-700'
                                  : 'text-slate-900'
                              }`}
                            >
                              {m.totalBebanKerjaIabee.toFixed(1)} / {maxIabeeSks} SKS
                            </span>
                            <span className="text-slate-500">
                              {m.persentaseTerhadapBatasIabee.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                m.statusIabee === 'MELEBIHI_BATAS_IABEE'
                                  ? 'bg-rose-600'
                                  : m.statusIabee === 'MENDEKATI_BATAS_IABEE'
                                  ? 'bg-amber-500'
                                  : m.statusIabee === 'DI_BAWAH_STANDAR'
                                  ? 'bg-sky-500'
                                  : 'bg-emerald-600'
                              }`}
                              style={{ width: `${pctBar}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {m.selisihDariBatasIabee > 0 ? (
                            <span className="text-rose-700 font-bold">
                              +{m.selisihDariBatasIabee.toFixed(1)} SKS
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              {m.selisihDariBatasIabee.toFixed(1)} SKS
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={getStatusTextClass(m.statusIabee)}>
                            {getStatusLabel(m.statusIabee)}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedDosenId(isExpanded ? null : m.dosen.id)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>
                              {m.activities.length > 0
                                ? `${m.activities.length} MBKM`
                                : 'Detail'}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={includeBimbinganTa ? 8 : 7} className="p-4">
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div className="text-slate-700">
                                  <span className="font-bold text-slate-900">
                                    Kesimpulan Audit IABEE:
                                  </span>{' '}
                                  {m.catatanAuditIabee}
                                </div>
                                <span className="font-mono tabular-nums text-[11px] text-slate-600 shrink-0">
                                  Rasio Terpakai: {m.persentaseTerhadapBatasIabee}% dari{' '}
                                  {maxIabeeSks} SKS
                                </span>
                              </div>

                              {m.activities.length === 0 ? (
                                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-slate-400" />
                                  <span>
                                    Tidak ada beban konversi kegiatan MBKM pada dosen ini. Sisa kapasitas hingga batas IABEE:{' '}
                                    <span className="font-mono font-semibold text-slate-800">
                                      {m.sisaKapasitasSks.toFixed(1)} SKS
                                    </span>
                                    .
                                  </span>
                                </div>
                              ) : (
                                <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
                                  {m.activities.map(act => (
                                    <div
                                      key={act.id}
                                      className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                                    >
                                        <div className="flex items-start gap-2.5">
                                          {act.jenis === 'MAGANG' ? (
                                            <Briefcase className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                          ) : (
                                            <GraduationCap className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                                          )}
                                          <div>
                                            <div className="font-semibold text-slate-900">
                                              {act.namaProgram}
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                              Mitra: {act.mitraInstansi} · Jenis:{' '}
                                              {act.jenis === 'MAGANG'
                                                ? 'Magang Industri'
                                                : 'Studi Independen / PMM'}{' '}
                                              {act.nomorBukti ? `· Bukti ${act.nomorBukti}` : ''}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                                          <div className="text-right">
                                            <div className="text-slate-800 font-semibold">
                                              {act.jamBimbingan.toFixed(1)} jam → +{act.sksKonversiDosen.toFixed(2)} SKS
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                              {act.jumlahMahasiswa} mhs ({act.jamBimbingan.toFixed(1)} ÷ {jamPerSksBkd} jam/SKS)
                                              {act.isKoordinatorMitra
                                                ? ` · Koord +${report.config.sksBonusKoordinatorMitra} SKS`
                                                : ''}
                                            </div>
                                          </div>
                                          {act.sumberData === 'SIMULASI_USER' && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveCustomActivity(act.id)
                                              }
                                              className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                                              title="Hapus simulasi"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                  ))}
                                </div>
                              )}
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
  );
};

function roundPlusKoord(siSks: number, koordSks: number): number {
  return Math.round((siSks + koordSks) * 100) / 100;
}
