import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Users,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Copy,
  ChevronDown,
  ChevronUp,
  Sliders,
  BellRing,
  Search,
  Send,
  X
} from 'lucide-react';
import {
  Dosen,
  JadwalKerjaPraktek,
  JadwalSidangTA,
  Mahasiswa
} from '../types/index';
import {
  AppliedBimbinganRotation,
  BimbinganLoadBand,
  BimbinganRotationProposal,
  DosenBimbinganMetric,
  buildBimbinganAnalysisReport,
  getDefaultBimbinganStandardByProdi
} from '../utils/bkdBimbinganAnalysisHelper';

interface BkdBimbinganSectionProps {
  dosenList: Dosen[];
  mahasiswaList: Mahasiswa[];
  sidangList: JadwalSidangTA[];
  kpList: JadwalKerjaPraktek[];
  prodiId?: string;
  prodiLabel: string;
  onShowToast?: (msg: string) => void;
}

const HEATMAP_CELL_CLASSES = {
  extreme: 'bg-rose-600 text-white border-rose-700',
  high: 'bg-rose-100 text-rose-900 border-rose-200',
  warm: 'bg-amber-100 text-amber-900 border-amber-200',
  balanced: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  cool: 'bg-sky-100 text-sky-900 border-sky-200'
};

function getHeatCellStyle(ratioPersen: number): string {
  if (ratioPersen >= 125) return HEATMAP_CELL_CLASSES.extreme;
  if (ratioPersen > 100) return HEATMAP_CELL_CLASSES.high;
  if (ratioPersen >= 80) return HEATMAP_CELL_CLASSES.warm;
  if (ratioPersen >= 45) return HEATMAP_CELL_CLASSES.balanced;
  return HEATMAP_CELL_CLASSES.cool;
}

function getBandStatusLabelStyle(band: BimbinganLoadBand): string {
  switch (band) {
    case 'OVERLOAD':
      return 'text-rose-700 font-bold';
    case 'NEAR_LIMIT':
      return 'text-amber-800 font-bold';
    case 'IDEAL':
      return 'text-emerald-700 font-semibold';
    case 'LOW_CAPACITY':
      return 'text-sky-700 font-semibold';
  }
}

export const BkdBimbinganSection: React.FC<BkdBimbinganSectionProps> = ({
  dosenList,
  mahasiswaList,
  sidangList,
  kpList,
  prodiId,
  prodiLabel,
  onShowToast
}) => {
  const prodiDefaultLimit = getDefaultBimbinganStandardByProdi(prodiId);
  const [batasMaksimal, setBatasMaksimal] = useState<number>(prodiDefaultLimit);
  const [appliedRotations, setAppliedRotations] = useState<AppliedBimbinganRotation[]>([]);
  const [expandedDosenId, setExpandedDosenId] = useState<string | null>(null);
  const [bandFilter, setBandFilter] = useState<'ALL' | 'OVERLOAD' | 'IDEAL' | 'LOW_CAPACITY'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllOverloadedBanner, setShowAllOverloadedBanner] = useState<boolean>(false);
  const [dismissedWarningKey, setDismissedWarningKey] = useState<string | null>(null);
  const [notifiedDosenIds, setNotifiedDosenIds] = useState<Record<string, string>>({});

  const lastWarnedScopeKeyRef = useRef<string>('');

  useEffect(() => {
    setBatasMaksimal(getDefaultBimbinganStandardByProdi(prodiId));
    setExpandedDosenId(null);
    setShowAllOverloadedBanner(false);
  }, [prodiId]);

  const report = useMemo(
    () =>
      buildBimbinganAnalysisReport({
        dosenList,
        mahasiswaList,
        sidangList,
        kpList,
        batasMaksimal,
        appliedRotations
      }),
    [dosenList, mahasiswaList, sidangList, kpList, batasMaksimal, appliedRotations]
  );

  const warningScopeKey = `${prodiId || prodiLabel}:${batasMaksimal}`;

  useEffect(() => {
    if (report.overloadedCount <= 0) return;
    if (lastWarnedScopeKeyRef.current === warningScopeKey) return;
    lastWarnedScopeKeyRef.current = warningScopeKey;

    if (onShowToast && report.highestLoadDosen) {
      onShowToast(
        `Peringatan Beban Pembimbingan (${prodiLabel}): ${report.overloadedCount} dosen melampaui standar maks ${batasMaksimal} mhs/dosen (tertinggi: ${report.highestLoadDosen.dosen.namaLengkap}, ${report.highestLoadDosen.totalBimbingan} mhs / ${report.highestLoadDosen.rasioTerhadapMaksPersen}%).`
      );
    }
  }, [
    warningScopeKey,
    report.overloadedCount,
    report.highestLoadDosen,
    prodiLabel,
    batasMaksimal,
    onShowToast
  ]);

  const visibleMetrics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return report.sortedMetrics.filter(m => {
      const matchBand =
        bandFilter === 'ALL'
          ? true
          : bandFilter === 'OVERLOAD'
          ? m.isExceedingProdiMax
          : bandFilter === 'IDEAL'
          ? !m.isExceedingProdiMax && m.statusBand !== 'LOW_CAPACITY'
          : m.statusBand === 'LOW_CAPACITY' || m.totalBimbingan < batasMaksimal;

      const matchQuery =
        !q ||
        m.dosen.namaLengkap.toLowerCase().includes(q) ||
        m.dosen.nidn.toLowerCase().includes(q) ||
        m.dosen.keahlian.toLowerCase().includes(q) ||
        m.dosen.jabatanFungsional.toLowerCase().includes(q);

      return matchBand && matchQuery;
    });
  }, [report.sortedMetrics, bandFilter, searchQuery, batasMaksimal]);

  const pendingProposals = report.rotationProposals.filter(p => !p.isApplied);
  const idealCount = report.sortedMetrics.filter(
    m => !m.isExceedingProdiMax && m.statusBand !== 'LOW_CAPACITY'
  ).length;

  const handleSendSingleWarning = (metric: DosenBimbinganMetric) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setNotifiedDosenIds(prev => ({
      ...prev,
      [metric.dosen.id]: timestamp
    }));
    if (onShowToast) {
      onShowToast(
        `Peringatan rasio pembimbingan (${metric.totalBimbingan} mhs / ${metric.rasioTerhadapMaksPersen}% vs standar maks ${batasMaksimal} mhs) dikirim kepada ${metric.dosen.namaLengkap} & Kaprodi.`
      );
    }
  };

  const handleSendBulkWarnings = () => {
    if (report.overloadedMetrics.length === 0) return;
    const timestamp = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const updates: Record<string, string> = {};
    report.overloadedMetrics.forEach(m => {
      updates[m.dosen.id] = timestamp;
    });
    setNotifiedDosenIds(prev => ({ ...prev, ...updates }));
    if (onShowToast) {
      onShowToast(
        `Nota peringatan rasio pembimbingan dikirim ke ${report.overloadedMetrics.length} dosen yang melampaui standar beban maksimal ${prodiLabel} (>${batasMaksimal} mhs/dosen).`
      );
    }
  };

  const handleApplyRotation = (proposal: BimbinganRotationProposal) => {
    if (proposal.isApplied) {
      setAppliedRotations(prev => prev.filter(r => r.id !== proposal.id));
      if (onShowToast) {
        onShowToast(
          `Simulasi rotasi ${proposal.fromDosen.namaLengkap} → ${proposal.toDosen.namaLengkap} dibatalkan.`
        );
      }
      return;
    }

    const nowStr = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setAppliedRotations(prev => [
      ...prev,
      {
        id: proposal.id,
        fromDosenId: proposal.fromDosen.id,
        toDosenId: proposal.toDosen.id,
        count: proposal.transferCount,
        jenis: proposal.jenisBimbingan,
        appliedAt: nowStr
      }
    ]);
    if (onShowToast) {
      onShowToast(
        `Rotasi ${proposal.transferCount} mhs (${proposal.jenisBimbingan}) dari ${proposal.fromDosen.namaLengkap} ke ${proposal.toDosen.namaLengkap} diterapkan pada simulasi beban BKD.`
      );
    }
  };

  const handleApplyAllRotations = () => {
    if (pendingProposals.length === 0) return;
    const nowStr = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const batch: AppliedBimbinganRotation[] = pendingProposals.map(p => ({
      id: p.id,
      fromDosenId: p.fromDosen.id,
      toDosenId: p.toDosen.id,
      count: p.transferCount,
      jenis: p.jenisBimbingan,
      appliedAt: nowStr
    }));
    setAppliedRotations(prev => [...prev, ...batch]);
    if (onShowToast) {
      onShowToast(
        `${batch.length} usulan rotasi bimbingan TA/KP berhasil diterapkan untuk menyeimbangkan rasio pembimbingan prodi.`
      );
    }
  };

  const handleCopyRotationMemo = async () => {
    const lines = [
      `MONITORING BEBAN PEMBIMBINGAN TA / KP — ${prodiLabel}`,
      `Standar Beban Maksimal Prodi: ${batasMaksimal} Mahasiswa / Dosen (100%)`,
      `Dosen Melampaui Standar: ${report.overloadedCount} Dosen`,
      `Dosen Tertinggi: ${report.highestLoadDosen?.dosen.namaLengkap || '-'} (${report.highestLoadDosen?.totalBimbingan || 0} mhs / ${report.highestLoadDosen?.rasioTerhadapMaksPersen || 0}%)`,
      `Dosen Terendah: ${report.lowestLoadDosen?.dosen.namaLengkap || '-'} (${report.lowestLoadDosen?.totalBimbingan || 0} mhs / ${report.lowestLoadDosen?.rasioTerhadapMaksPersen || 0}%)`,
      '',
      'Daftar Usulan Pemerataan & Rotasi Bimbingan:',
      ...report.rotationProposals.map(
        (p, i) =>
          `${i + 1}. Alihkan ${p.transferCount} Mhs (${p.jenisBimbingan}) | Dari: ${p.fromDosen.namaLengkap} (${p.fromCurrentTotal} → ${p.fromProjectedTotal}) | Ke: ${p.toDosen.namaLengkap} (${p.toCurrentTotal} → ${p.toProjectedTotal}) | Alasan: ${p.alasanKeahlian}`
      )
    ].join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      if (onShowToast) {
        onShowToast('Nota monitoring & usulan rotasi pembimbingan TA/KP berhasil disalin ke clipboard.');
      }
    } catch {
      if (onShowToast) {
        onShowToast('Ringkasan usulan rotasi siap ditinjau pada daftar rekomendasi.');
      }
    }
  };

  const displayedOverloadAlerts = showAllOverloadedBanner
    ? report.overloadedMetrics
    : report.overloadedMetrics.slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Header & Standar Beban Maksimal Controls */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Monitoring Beban Pembimbingan TA / KP &amp; Peringatan Rasio Maksimal Prodi
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Distribusi dosen pembimbing Tugas Akhir &amp; Kerja Praktek pada <strong>{prodiLabel}</strong> dengan deteksi otomatis apabila rasio bimbingan melebihi standar beban kerja maksimal prodi ({batasMaksimal} Mhs / Dosen).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label htmlFor="batas-maks-bimbingan" className="font-semibold text-slate-700 whitespace-nowrap">
                Standar Maks Prodi:
              </label>
              <select
                id="batas-maks-bimbingan"
                value={batasMaksimal}
                onChange={e => setBatasMaksimal(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 font-mono tabular-nums font-bold text-blue-900 cursor-pointer"
              >
                <option value={6}>6 Mhs / Dosen (Vokasi/Padat)</option>
                <option value={8}>8 Mhs / Dosen (Standar S1)</option>
                <option value={10}>10 Mhs / Dosen</option>
                <option value={12}>12 Mhs / Dosen</option>
              </select>
            </div>

            {appliedRotations.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setAppliedRotations([]);
                  if (onShowToast) onShowToast('Simulasi rotasi pembimbingan dikembalikan ke data awal.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Rotasi ({appliedRotations.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Hairline Summary KPI Cells */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white text-xs">
          <div className="p-4">
            <span className="text-[11px] text-slate-500 block">Total Mahasiswa Bimbingan (TA + KP)</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
              {report.totalBimbinganAll} Mhs
            </span>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              {report.totalTaAll} Tugas Akhir · {report.totalKpAll} Kerja Praktek
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] text-slate-500 block">Rasio Rata-rata vs Standar Maks Prodi</span>
            <span className="text-xl font-bold font-mono tabular-nums text-blue-800 mt-0.5 block">
              {report.avgBimbinganPerDosen.toFixed(1)} Mhs
            </span>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              {report.avgRatioPersen.toFixed(1)}% dari standar {batasMaksimal} mhs/dosen
            </span>
          </div>

          <button
            type="button"
            onClick={() => setBandFilter(prev => (prev === 'OVERLOAD' ? 'ALL' : 'OVERLOAD'))}
            className={`p-4 text-left transition-colors cursor-pointer ${
              report.overloadedCount > 0 ? 'bg-rose-50/55 hover:bg-rose-50' : 'hover:bg-slate-50'
            }`}
          >
            <span className="text-[11px] text-slate-600 font-medium block">
              Dosen Melampaui Standar (&gt;{batasMaksimal} Mhs)
            </span>
            <span
              className={`text-xl font-bold font-mono tabular-nums mt-0.5 block ${
                report.overloadedCount > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              {report.overloadedCount} Dosen
            </span>
            <span className="text-[11px] text-slate-600">
              {report.overloadedCount > 0
                ? 'Klik untuk menyaring dosen melampaui standar'
                : 'Seluruh dosen memenuhi standar prodi'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setBandFilter(prev => (prev === 'LOW_CAPACITY' ? 'ALL' : 'LOW_CAPACITY'))}
            className="p-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 block">Dosen Berkapasitas Penerima Rotasi</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
              {report.lowCapacityCount} Dosen
            </span>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              {pendingProposals.length} usulan pemerataan tersedia
            </span>
          </button>
        </div>
      </div>

      {/* LOGIKA PERINGATAN RASIO BIMBINGAN MELAMPAUI STANDAR MAKSIMAL PRODI */}
      {report.overloadedCount > 0 && dismissedWarningKey !== warningScopeKey ? (
        <div
          role="alert"
          className="bg-rose-50/75 border border-rose-300 rounded-xl p-4 sm:p-5 space-y-3"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 shrink-0 mt-0.5">
                <BellRing className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-rose-950">
                  Peringatan Rasio Pembimbingan: {report.overloadedCount} Dosen Melampaui Standar Maksimal {prodiLabel} (&gt;{batasMaksimal} Mhs / &gt;100%)
                </h3>
                <p className="text-xs text-rose-900 leading-relaxed">
                  {report.standarKeterangan}. Terdeteksi kelebihan beban bimbingan TA/KP yang berisiko menurunkan mutu pembimbingan dan melampaui ambang BKD dosen.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSendBulkWarnings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Peringatan ({report.overloadedCount})</span>
              </button>

              {pendingProposals.length > 0 && (
                <button
                  type="button"
                  onClick={handleApplyAllRotations}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Terapkan Rotasi ({pendingProposals.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setDismissedWarningKey(warningScopeKey)}
                aria-label="Tutup peringatan sementara"
                className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Daftar Dosen dengan Peringatan Rasio Berlebih */}
          <div className="divide-y divide-rose-200/80 border border-rose-200 bg-white rounded-lg overflow-hidden">
            {displayedOverloadAlerts.map(m => {
              const sentAt = notifiedDosenIds[m.dosen.id];
              return (
                <div
                  key={m.dosen.id}
                  className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="font-bold text-slate-900">{m.dosen.namaLengkap}</span>
                      <span className="text-slate-400" aria-hidden="true">·</span>
                      <span className="text-[11px] text-slate-600">{m.dosen.keahlian}</span>
                    </div>
                    <div className="text-[11px] text-rose-800 mt-0.5 pl-5 font-mono tabular-nums">
                      {m.taCount} TA + {m.kpCount} KP = <strong>{m.totalBimbingan} Mhs</strong> · Rasio{' '}
                      <strong>{m.rasioTerhadapMaksPersen}%</strong> (Kelebihan +{m.selisihDariMaks} Mhs ·{' '}
                      {m.ekuivalenSksBimbingan} SKS BKD)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-5 sm:pl-0">
                    <button
                      type="button"
                      onClick={() => handleSendSingleWarning(m)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        sentAt
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border-rose-200'
                      }`}
                    >
                      {sentAt ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Terkirim ({sentAt})</span>
                        </>
                      ) : (
                        <>
                          <BellRing className="w-3 h-3" />
                          <span>Kirim Peringatan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {report.overloadedMetrics.length > 4 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAllOverloadedBanner(prev => !prev)}
                className="text-xs font-semibold text-rose-800 hover:text-rose-950 underline cursor-pointer"
              >
                {showAllOverloadedBanner
                  ? 'Tampilkan ringkas (4 dosen teratas)'
                  : `Lihat semua ${report.overloadedMetrics.length} dosen yang melampaui standar`}
              </button>
            </div>
          )}
        </div>
      ) : report.overloadedCount === 0 ? (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Status Rasio Pembimbingan Aman:</strong> Tidak ada dosen pada {prodiLabel} yang melampaui standar beban maksimal {batasMaksimal} mahasiswa/dosen (&le;100%).
            </span>
          </div>
          <span className="font-mono tabular-nums font-semibold text-emerald-800 whitespace-nowrap shrink-0">
            0 Pelanggaran
          </span>
        </div>
      ) : null}

      {/* Spotlight: Beban Tertinggi vs Beban Terendah */}
      {report.highestLoadDosen && report.lowestLoadDosen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-rose-50/45 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>Beban Pembimbingan Tertinggi</span>
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {report.highestLoadDosen.dosen.namaLengkap}
              </div>
              <div className="text-[11px] text-slate-600">
                {report.highestLoadDosen.dosen.keahlian} ·{' '}
                <span className="font-mono tabular-nums">
                  {report.highestLoadDosen.taCount} TA + {report.highestLoadDosen.kpCount} KP
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-extrabold font-mono tabular-nums text-rose-700">
                {report.highestLoadDosen.totalBimbingan} Mhs
              </div>
              <div className="text-[11px] font-mono tabular-nums font-bold text-rose-700">
                {report.highestLoadDosen.rasioTerhadapMaksPersen}% standar
              </div>
            </div>
          </div>

          <div className="bg-sky-50/55 border border-sky-200 rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                <TrendingDown className="w-4 h-4 shrink-0" />
                <span>Beban Pembimbingan Terendah (Siap Menerima Rotasi)</span>
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {report.lowestLoadDosen.dosen.namaLengkap}
              </div>
              <div className="text-[11px] text-slate-600">
                {report.lowestLoadDosen.dosen.keahlian} ·{' '}
                <span className="font-mono tabular-nums">
                  {report.lowestLoadDosen.taCount} TA + {report.lowestLoadDosen.kpCount} KP
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-extrabold font-mono tabular-nums text-sky-800">
                {report.lowestLoadDosen.totalBimbingan} Mhs
              </div>
              <div className="text-[11px] font-mono tabular-nums font-bold text-sky-800">
                {report.lowestLoadDosen.rasioTerhadapMaksPersen}% standar
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABEL DISTRIBUSI DOSEN PEMBIMBING TA / KP & HEATMAP RASIO */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tabel Distribusi Dosen Pembimbing TA / KP &amp; Peta Rasio Beban
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Menampilkan {visibleMetrics.length} dari {report.sortedMetrics.length} dosen (diurutkan dari rasio tertinggi ke terendah terhadap standar {batasMaksimal} mahasiswa/dosen). Klik baris dosen untuk melihat daftar mahasiswa bimbingan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-600 inline-block" />
                <span>&ge;125% Kritis</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-200 border border-rose-300 inline-block" />
                <span>&gt;100% Melampaui</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-200 border border-amber-300 inline-block" />
                <span>80–100% Penuh</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 border border-emerald-300 inline-block" />
                <span>45–79% Ideal</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-200 border border-sky-300 inline-block" />
                <span>&lt;45% Luang</span>
              </span>
            </div>
          </div>

          {/* Search & Segmented Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama dosen, NIDN, atau keahlian..."
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setBandFilter('ALL')}
                className={`px-3 py-1.5 font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  bandFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({report.sortedMetrics.length})
              </button>
              <button
                type="button"
                onClick={() => setBandFilter('OVERLOAD')}
                className={`px-3 py-1.5 font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  bandFilter === 'OVERLOAD'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-rose-800'
                }`}
              >
                Melampaui Standar ({report.overloadedCount})
              </button>
              <button
                type="button"
                onClick={() => setBandFilter('IDEAL')}
                className={`px-3 py-1.5 font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  bandFilter === 'IDEAL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ideal / Penuh ({idealCount})
              </button>
              <button
                type="button"
                onClick={() => setBandFilter('LOW_CAPACITY')}
                className={`px-3 py-1.5 font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  bandFilter === 'LOW_CAPACITY'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kapasitas Luang ({report.lowCapacityCount})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-bold w-10 text-center">#</th>
                <th className="py-2.5 px-3 font-bold min-w-[230px]">Dosen Pembimbing &amp; Keahlian</th>
                <th className="py-2.5 px-2.5 font-bold text-center w-22">Bimb. TA</th>
                <th className="py-2.5 px-2.5 font-bold text-center w-22">Bimb. KP</th>
                <th className="py-2.5 px-2.5 font-bold text-center w-28">Total TA + KP</th>
                <th className="py-2.5 px-2.5 font-bold text-center w-32">Rasio vs Maks ({batasMaksimal})</th>
                <th className="py-2.5 px-3 font-bold text-center w-24">Ekuiv. SKS</th>
                <th className="py-2.5 px-3 font-bold min-w-[190px]">Peringatan &amp; Indikator</th>
                <th className="py-2.5 px-3 font-bold text-right w-36">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleMetrics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 px-4 text-center text-slate-500">
                    <p className="text-sm font-semibold text-slate-700">
                      Tidak ada dosen pembimbing yang sesuai dengan pencarian atau filter aktif.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setBandFilter('ALL');
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Tampilkan Semua Dosen</span>
                    </button>
                  </td>
                </tr>
              ) : (
                visibleMetrics.map((m, idx) => {
                  const isExpanded = expandedDosenId === m.dosen.id;
                  const taHeat = getHeatCellStyle((m.taCount / Math.max(1, batasMaksimal * 0.7)) * 100);
                  const kpHeat = getHeatCellStyle((m.kpCount / Math.max(1, batasMaksimal * 0.35)) * 100);
                  const totalHeat = getHeatCellStyle(m.rasioTerhadapMaksPersen);
                  const sentAt = notifiedDosenIds[m.dosen.id];
                  const barFill =
                    m.statusBand === 'OVERLOAD'
                      ? 'bg-rose-600'
                      : m.statusBand === 'NEAR_LIMIT'
                      ? 'bg-amber-500'
                      : m.statusBand === 'IDEAL'
                      ? 'bg-emerald-600'
                      : 'bg-sky-500';

                  return (
                    <React.Fragment key={m.dosen.id}>
                      <tr
                        onClick={() =>
                          setExpandedDosenId(prev => (prev === m.dosen.id ? null : m.dosen.id))
                        }
                        className={`cursor-pointer transition-colors ${
                          m.isExceedingProdiMax
                            ? 'bg-rose-50/40 hover:bg-rose-50/75'
                            : 'hover:bg-slate-50/90'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-500 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span>{m.dosen.namaLengkap}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {m.dosen.jabatanFungsional} · {m.dosen.keahlian}
                          </div>
                        </td>

                        <td className="py-2 px-2 text-center">
                          <div
                            className={`py-1.5 px-2 rounded border font-mono tabular-nums font-bold ${taHeat}`}
                          >
                            {m.taCount}
                          </div>
                        </td>

                        <td className="py-2 px-2 text-center">
                          <div
                            className={`py-1.5 px-2 rounded border font-mono tabular-nums font-bold ${kpHeat}`}
                          >
                            {m.kpCount}
                          </div>
                        </td>

                        <td className="py-2 px-2 text-center">
                          <div
                            className={`py-1.5 px-2 rounded border font-mono tabular-nums font-extrabold ${totalHeat}`}
                          >
                            {m.totalBimbingan} Mhs
                          </div>
                        </td>

                        <td className="py-2 px-2 text-center">
                          <div
                            className={`py-1.5 px-2 rounded border font-mono tabular-nums font-bold ${totalHeat}`}
                          >
                            {m.rasioTerhadapMaksPersen}%
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono tabular-nums font-semibold text-slate-800">
                          {m.ekuivalenSksBimbingan} SKS
                        </td>

                        <td className="py-2.5 px-3">
                          <div className={`text-[11px] flex items-center gap-1 ${getBandStatusLabelStyle(m.statusBand)}`}>
                            {m.isExceedingProdiMax && (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            <span>
                              {m.statusLabel}
                              {m.selisihDariMaks > 0
                                ? ` (+${m.selisihDariMaks} Mhs)`
                                : m.selisihDariMaks < 0
                                ? ` (Sisa ${Math.abs(m.selisihDariMaks)} Mhs)`
                                : ' (100%)'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={`h-full rounded-full ${barFill}`}
                              style={{ width: `${Math.min(100, m.rasioTerhadapMaksPersen)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={e => e.stopPropagation()}
                          >
                            {m.isExceedingProdiMax ? (
                              <button
                                type="button"
                                onClick={() => handleSendSingleWarning(m)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  sentAt
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-100 text-rose-900 hover:bg-rose-200 border-rose-300'
                                }`}
                              >
                                {sentAt ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Terkirim</span>
                                  </>
                                ) : (
                                  <>
                                    <BellRing className="w-3 h-3" />
                                    <span>Peringatan</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedDosenId(prev =>
                                    prev === m.dosen.id ? null : m.dosen.id
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <span>{isExpanded ? 'Tutup' : 'Detail Mhs'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={9} className="px-4 py-3 border-t border-b border-slate-200">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="text-[11px] font-bold text-slate-800">
                                Daftar Sampel Mahasiswa Bimbingan TA &amp; KP ({m.dosen.namaLengkap}):
                              </div>
                              {m.warningMessage && (
                                <span className="text-[11px] font-semibold text-rose-700">
                                  {m.warningMessage}
                                </span>
                              )}
                            </div>
                            {m.studentSamples.length === 0 ? (
                              <p className="text-[11px] text-slate-500 italic">
                                Rekap agregat dari pangkalan data BKD ({m.taCount} TA + {m.kpCount} KP aktif semester berjalan).
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {m.studentSamples.map(st => (
                                  <div
                                    key={`${st.nim}-${st.jenis}`}
                                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-mono font-bold text-blue-900">{st.nim}</span>
                                      <span
                                        className={`font-bold ${
                                          st.jenis === 'TA' ? 'text-indigo-700' : 'text-teal-700'
                                        }`}
                                      >
                                        {st.jenis === 'TA' ? 'Tugas Akhir' : 'Kerja Praktek'}
                                      </span>
                                    </div>
                                    <div className="font-semibold text-slate-900 mt-0.5">{st.nama}</div>
                                    <div className="text-slate-500 line-clamp-1 mt-0.5">
                                      {st.judulAtauLokasi}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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

      {/* USULAN ROTASI BIMBINGAN BAGI DOSEN MELAMPAUI STANDAR MAKSIMAL */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-700" />
              <span>Rekomendasi Rotasi Bimbingan TA / KP Otomatis</span>
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Mengalihkan kelebihan beban dosen di atas standar maksimal {batasMaksimal} mahasiswa kepada dosen seprodi dengan kesesuaian rumpun keahlian &amp; kapasitas luang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyRotationMemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Nota Rotasi</span>
            </button>
            {pendingProposals.length > 0 && (
              <button
                type="button"
                onClick={handleApplyAllRotations}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Terapkan Semua Usulan ({pendingProposals.length})</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {report.rotationProposals.length === 0 ? (
            <div className="p-6 text-center bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="font-bold">Distribusi Beban Pembimbingan Sudah Merata</div>
              <p className="text-emerald-800">
                Tidak ada dosen pada cakupan ini yang melebihi standar beban maksimal {batasMaksimal} mahasiswa bimbingan TA/KP.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.rotationProposals.map(proposal => (
                <div
                  key={proposal.id}
                  className={`p-4 rounded-xl border transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    proposal.isApplied
                      ? 'bg-emerald-50/55 border-emerald-200'
                      : 'bg-rose-50/35 border-rose-200'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {proposal.isApplied ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Rotasi Diterapkan</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>
                            Usulan Alih Bimbingan · {proposal.transferCount} Mahasiswa ({proposal.jenisBimbingan})
                          </span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">· {proposal.alasanKeahlian}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="bg-white/90 border border-slate-200 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block">Dosen Asal (Melampaui Standar)</span>
                        <span className="font-bold text-slate-900 block truncate">
                          {proposal.fromDosen.namaLengkap}
                        </span>
                        <span className="font-mono tabular-nums text-[11px] text-rose-700 font-bold">
                          {proposal.isApplied
                            ? `Beban terkini: ${proposal.fromCurrentTotal} Mhs`
                            : `${proposal.fromCurrentTotal} Mhs → ${proposal.fromProjectedTotal} Mhs`}
                        </span>
                      </div>

                      <div className="bg-white/90 border border-slate-200 rounded-lg p-2.5">
                        <span className="text-[10px] text-slate-500 block">Dosen Tujuan (Kapasitas Luang)</span>
                        <span className="font-bold text-slate-900 block truncate">
                          {proposal.toDosen.namaLengkap}
                        </span>
                        <span className="font-mono tabular-nums text-[11px] text-emerald-700 font-bold">
                          {proposal.isApplied
                            ? `Beban terkini: ${proposal.toCurrentTotal} Mhs`
                            : `${proposal.toCurrentTotal} Mhs → ${proposal.toProjectedTotal} Mhs`}
                        </span>
                      </div>
                    </div>

                    {proposal.kandidatMahasiswa.length > 0 && (
                      <div className="text-[11px] text-slate-600 pt-0.5">
                        Kandidat alih bimbingan:{' '}
                        <span className="font-medium text-slate-800">
                          {proposal.kandidatMahasiswa
                            .map(m => `${m.nama} (${m.nim})`)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-start lg:self-center">
                    <button
                      type="button"
                      onClick={() => handleApplyRotation(proposal)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        proposal.isApplied
                          ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          : 'bg-indigo-700 text-white border-indigo-700 hover:bg-indigo-800'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{proposal.isApplied ? 'Batalkan Simulasi' : 'Terapkan Rotasi'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
