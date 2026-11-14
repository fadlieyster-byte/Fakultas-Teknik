import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Cpu,
  Users,
  Monitor,
  Network,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  BellRing,
  CalendarClock,
  ClipboardCheck,
  Copy,
  FileText,
  X,
  Plus,
  Minus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { RuanganLab, JadwalKuliah, ProgramStudiInfo } from '../types/index';
import { isJadwalSedangBerlangsung } from '../utils/timeHelper';
import {
  buildIabeeCalibrationReportText,
  buildLabEquipmentAuditReport,
  CATEGORY_LABELS,
  EquipmentCategory,
  EquipmentOverrideState
} from '../utils/labEquipmentAuditHelper';

interface LaboratoriumViewProps {
  ruanganList: RuanganLab[];
  jadwalList: JadwalKuliah[];
  selectedProdi: ProgramStudiInfo;
  currentDay: string;
  currentTimeStr: string;
  onShowToast?: (msg: string) => void;
}

export const LaboratoriumView: React.FC<LaboratoriumViewProps> = ({
  ruanganList,
  jadwalList,
  selectedProdi,
  currentDay,
  currentTimeStr,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'okupansi' | 'inventaris_audit' | 'iabee_kalibrasi'>(
    'okupansi'
  );
  const [filterScope, setFilterScope] = useState<string>('current');
  const [tipeRuangFilter, setTipeRuangFilter] = useState<'ALL' | 'LAB_WORKSHOP' | 'TEORI'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | EquipmentCategory>('ALL');
  const [scheduleAuditFilter, setScheduleAuditFilter] = useState<'ALL' | 'WARNINGS'>('ALL');
  const [equipmentOverrides, setEquipmentOverrides] = useState<
    Record<string, EquipmentOverrideState>
  >({});
  const [dismissedAlertKey, setDismissedAlertKey] = useState<string | null>(null);
  const [showAutoReportModal, setShowAutoReportModal] = useState(false);

  const lastToastKeyRef = useRef<string>('');

  const scopedRuanganForAudit = useMemo(() => {
    return ruanganList.filter(r => {
      if (filterScope === 'all') return true;
      if (filterScope === 'current') {
        return !r.prodiId || r.prodiId === selectedProdi.id || r.prodiId === 'UMUM';
      }
      return r.prodiId === filterScope;
    });
  }, [ruanganList, filterScope, selectedProdi.id]);

  const filteredRuangan = useMemo(() => {
    return scopedRuanganForAudit.filter(r => {
      if (tipeRuangFilter === 'ALL') return true;
      if (tipeRuangFilter === 'LAB_WORKSHOP') {
        return r.tipe === 'Laboratorium' || r.tipe === 'Workshop' || r.tipe === 'Studio';
      }
      return r.tipe === 'Ruang Teori' || r.tipe === 'Auditorium';
    });
  }, [scopedRuanganForAudit, tipeRuangFilter]);

  const auditReport = useMemo(() => {
    return buildLabEquipmentAuditReport({
      ruanganList: scopedRuanganForAudit,
      jadwalList,
      overrides: equipmentOverrides
    });
  }, [scopedRuanganForAudit, jadwalList, equipmentOverrides]);

  const scopeAlertKey = `${selectedProdi.id}:${filterScope}:${auditReport.criticalScheduleAlerts.length}:${auditReport.urgentCalibrationCount}`;

  // Trigger real-time Toast alert when schedule shortages/repair conflicts or urgent calibrations exist
  useEffect(() => {
    if (!onShowToast) return;
    if (
      auditReport.criticalScheduleAlerts.length === 0 &&
      auditReport.urgentCalibrationCount === 0
    ) {
      return;
    }
    if (lastToastKeyRef.current === scopeAlertKey) return;
    lastToastKeyRef.current = scopeAlertKey;

    const firstSched = auditReport.criticalScheduleAlerts[0];
    if (firstSched && auditReport.urgentCalibrationCount > 0) {
      onShowToast(
        `Peringatan Lab ${selectedProdi.singkatan}: ${auditReport.criticalScheduleAlerts.length} jadwal praktikum terdampak alat perbaikan/kurang unit (${firstSched.ruanganKode}) & ${auditReport.urgentCalibrationCount} alat mendekati/lewat batas kalibrasi.`
      );
    } else if (firstSched) {
      onShowToast(
        `Audit Lab ${selectedProdi.singkatan}: ${auditReport.criticalScheduleAlerts.length} sesi jadwal di ${firstSched.ruanganKode} terkendala ketersediaan perangkat (${firstSched.auditStatusLabel}).`
      );
    } else {
      onShowToast(
        `Maintenance Trigger: ${auditReport.urgentCalibrationCount} perangkat teknik memerlukan kalibrasi segera.`
      );
    }
  }, [
    auditReport.criticalScheduleAlerts,
    auditReport.urgentCalibrationCount,
    onShowToast,
    scopeAlertKey,
    selectedProdi.singkatan
  ]);

  // Compute weekly utilization rate for each room (40 operational hours per week)
  const roomUtilizationData = useMemo(() => {
    return filteredRuangan
      .map(ruang => {
        const roomSchedules = jadwalList.filter(j => j.ruanganId === ruang.id);

        const weeklyHours = roomSchedules.reduce((acc, curr) => {
          const sksHours = (curr.sks || 3) * 0.9;
          return acc + sksHours;
        }, 0);

        const operationalHours = 40;
        const researchProjectHours =
          ruang.tipe === 'Laboratorium' || ruang.tipe === 'Workshop' ? 10 : 4;
        const totalUsedHours = Math.min(
          operationalHours,
          parseFloat((weeklyHours + researchProjectHours).toFixed(1))
        );
        const utilitasPersen = Math.min(
          100,
          Math.round((totalUsedHours / operationalHours) * 100)
        );

        const shortName = ruang.nama
          .replace('FT UNBARI', '')
          .replace('Laboratorium', 'Lab')
          .replace('Workshop', 'WS')
          .replace('Universitas Batanghari', '')
          .trim();

        return {
          id: ruang.id,
          kode: ruang.kode,
          namaSingkat: shortName.length > 22 ? shortName.slice(0, 22) + '...' : shortName,
          namaLengkap: ruang.nama,
          tipe: ruang.tipe,
          kapasitas: ruang.kapasitas,
          jamTerpakai: totalUsedHours,
          jamOperasional: operationalHours,
          utilitasPersen,
          statusEfisiensi:
            utilitasPersen >= 75
              ? 'Optimal Tinggi'
              : utilitasPersen >= 50
              ? 'Cukup Efisien'
              : 'Kurang Optimal'
        };
      })
      .sort((a, b) => b.utilitasPersen - a.utilitasPersen);
  }, [filteredRuangan, jadwalList]);

  const rataRataUtilitas = useMemo(() => {
    if (roomUtilizationData.length === 0) return 0;
    const sum = roomUtilizationData.reduce((acc, r) => acc + r.utilitasPersen, 0);
    return Math.round(sum / roomUtilizationData.length);
  }, [roomUtilizationData]);

  const iabeeByRoomId = useMemo(() => {
    const map = new Map<string, (typeof auditReport.iabeeResults)[number]>();
    auditReport.iabeeResults.forEach(item => map.set(item.ruangan.id, item));
    return map;
  }, [auditReport.iabeeResults]);

  const displayedEquipments = useMemo(() => {
    return auditReport.allEquipments.filter(eq =>
      categoryFilter === 'ALL' ? true : eq.kategori === categoryFilter
    );
  }, [auditReport.allEquipments, categoryFilter]);

  const displayedScheduleFindings = useMemo(() => {
    return auditReport.scheduleFindings.filter(f =>
      scheduleAuditFilter === 'ALL' ? true : f.auditStatus !== 'SIAP_PRAKTIKUM'
    );
  }, [auditReport.scheduleFindings, scheduleAuditFilter]);

  const prodiScopeLabel =
    filterScope === 'all'
      ? 'Semua Ruang Fakultas Teknik'
      : filterScope === 'SIPIL'
      ? 'S1 Teknik Sipil'
      : filterScope === 'LINGKUNGAN'
      ? 'S1 Teknik Lingkungan'
      : filterScope === 'LISTRIK_D3'
      ? 'D3 Teknik Listrik'
      : selectedProdi.singkatan;

  const autoReportText = useMemo(
    () => buildIabeeCalibrationReportText(auditReport, prodiScopeLabel),
    [auditReport, prodiScopeLabel]
  );

  const handleAdjustRepairUnit = (equipmentId: string, deltaRepair: number) => {
    const target = auditReport.allEquipments.find(e => e.id === equipmentId);
    if (!target) return;
    const nextRepair = Math.max(0, Math.min(target.unitTotal, target.unitDalamPerbaikan + deltaRepair));
    const nextAvail = Math.max(0, target.unitTotal - nextRepair);

    setEquipmentOverrides(prev => ({
      ...prev,
      [equipmentId]: {
        ...prev[equipmentId],
        unitDalamPerbaikan: nextRepair,
        unitTersedia: nextAvail
      }
    }));

    if (onShowToast) {
      if (deltaRepair < 0 && nextRepair === 0) {
        onShowToast(
          `Status diperbarui: Seluruh ${target.unitTotal} unit ${target.namaAlat} kembali Siap Pakai.`
        );
      } else {
        onShowToast(
          `Inventaris ${target.namaAlat}: ${nextAvail} Siap, ${nextRepair} Dalam Perbaikan.`
        );
      }
    }
  };

  const handleScheduleCalibration = (equipmentId: string, namaAlat: string) => {
    setEquipmentOverrides(prev => ({
      ...prev,
      [equipmentId]: {
        ...prev[equipmentId],
        statusKalibrasiDijadwalkan: true
      }
    }));
    if (onShowToast) {
      onShowToast(
        `Maintenance Trigger: Kalibrasi ulang untuk "${namaAlat}" berhasil dijadwalkan ke vendor KAN & Teknisi Lab.`
      );
    }
  };

  const handleCopyAutoReport = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(autoReportText).catch(() => {});
    }
    if (onShowToast) {
      onShowToast(
        'Laporan Otomatis Audit IABEE & Kalibrasi Peralatan disalin ke clipboard siap lampirkan ke GPMF/Dekan.'
      );
    }
  };

  const hasCriticalSystemAlert =
    auditReport.criticalScheduleAlerts.length > 0 || auditReport.urgentCalibrationCount > 0;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Laboratorium, Audit Inventaris Peralatan &amp; Kelayakan IABEE
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Pemantauan okupansi ruang praktikum {selectedProdi.singkatan}, audit jadwal riil vs PC/Jaringan/Alat Teknik, serta sistem Maintenance Trigger kalibrasi IABEE.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterScope}
              onChange={e => setFilterScope(e.target.value)}
              aria-label="Filter cakupan fasilitas prodi"
              className="text-xs font-medium border border-blue-200 rounded-lg px-2.5 py-1.5 bg-blue-50/60 text-blue-900"
            >
              <option value="current">Lab &amp; Bengkel: {selectedProdi.singkatan}</option>
              <option value="all">Semua Ruang Fakultas Teknik</option>
              <option value="SIPIL">Fasilitas S1 Teknik Sipil</option>
              <option value="LINGKUNGAN">Fasilitas S1 Teknik Lingkungan</option>
              <option value="LISTRIK_D3">Bengkel D3 Teknik Listrik</option>
            </select>

            <span className="text-xs font-mono tabular-nums text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0">
              Skor IABEE: {auditReport.avgIabeeScore}/100
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-3 border-t border-slate-100 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('okupansi')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'okupansi'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Okupansi &amp; Jadwal Harian</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventaris_audit')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'inventaris_audit'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Audit Inventaris (PC, Jaringan, Alat Teknik)</span>
            {auditReport.criticalScheduleAlerts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-rose-100 text-rose-800 border border-rose-200 tabular-nums">
                {auditReport.criticalScheduleAlerts.length} Peringatan
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('iabee_kalibrasi')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'iabee_kalibrasi'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Kelayakan IABEE (1–100) &amp; Maintenance Trigger</span>
            {auditReport.urgentCalibrationCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 tabular-nums">
                {auditReport.urgentCalibrationCount} Kalibrasi
              </span>
            )}
          </button>
        </div>
      </div>

      {/* AUTOMATIC REAL-TIME ALERT BANNER */}
      {hasCriticalSystemAlert && dismissedAlertKey !== scopeAlertKey && (
        <div
          role="alert"
          className="bg-rose-50/90 border border-rose-300 rounded-xl p-4 sm:p-5 space-y-3 shadow-xs"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 shrink-0 mt-0.5">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-rose-900">
                    Peringatan Otomatis Ketersediaan Perangkat &amp; Maintenance Trigger
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-200/70 text-rose-900 tabular-nums">
                    {auditReport.criticalScheduleAlerts.length} Jadwal Terdampak &bull;{' '}
                    {auditReport.urgentCalibrationCount} Alat Perlu Kalibrasi
                  </span>
                </div>
                <p className="text-xs text-rose-950 leading-relaxed">
                  Audit silang jadwal perkuliahan riil terhadap inventaris perangkat mendeteksi penurunan unit siap di bawah rasio peserta kelas atau perangkat berstatus <strong>Dalam Perbaikan</strong> serta instrumen teknik yang melewati/mendekati jatuh tempo kalibrasi tahunan.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('inventaris_audit')}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Periksa Audit Jadwal vs Alat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('iabee_kalibrasi')}
                className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Jadwalkan Kalibrasi
              </button>
              <button
                type="button"
                onClick={() => setDismissedAlertKey(scopeAlertKey)}
                aria-label="Tutup banner peringatan laboratorium"
                className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: OKUPANSI & JADWAL HARIAN */}
      {activeTab === 'okupansi' && (
        <div className="space-y-6">
          {/* BarChart Utilitas */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 mt-0.5">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tingkat Utilitas Penggunaan Laboratorium &amp; Fasilitas Praktik per Minggu
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluasi efisiensi operasional ruang praktikum, bengkel kerja vokasi, dan studio per minggu (Standar 40 Jam Operasional/Minggu).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setTipeRuangFilter('ALL')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tipeRuangFilter === 'ALL'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua Ruang
                </button>
                <button
                  type="button"
                  onClick={() => setTipeRuangFilter('LAB_WORKSHOP')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tipeRuangFilter === 'LAB_WORKSHOP'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lab &amp; Workshop Saja
                </button>
                <button
                  type="button"
                  onClick={() => setTipeRuangFilter('TEORI')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tipeRuangFilter === 'TEORI'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ruang Teori
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] font-medium block">
                  Rata-rata Utilitas Mingguan
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5 block">
                  {rataRataUtilitas}%
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  Standar Operasional &ge;65%
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] font-medium block">
                  Kesiapan Perangkat Lab
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5 block">
                  {auditReport.overallAvailabilityPercent}% Siap
                </span>
                <span className="text-[10px] text-rose-700 font-semibold">
                  {auditReport.totalRepairUnits} Unit Dalam Perbaikan
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] font-medium block">
                  Skor Kelayakan IABEE Rata-rata
                </span>
                <span className="text-base sm:text-lg font-bold text-blue-700 font-mono tabular-nums mt-0.5 block">
                  {auditReport.avgIabeeScore} / 100
                </span>
                <span className="text-[10px] text-slate-500">
                  {auditReport.iabeeResults.length} Lab/Bengkel Terukur
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] font-medium block">
                  Maintenance Trigger Kalibrasi
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-700 font-mono tabular-nums mt-0.5 block">
                  {auditReport.urgentCalibrationCount} Alat
                </span>
                <span className="text-[10px] text-slate-500">
                  Kadaluarsa / &le;30 Hari Lagi
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={roomUtilizationData}
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
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={v => `${v}%`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, _name: any, item: any) => [
                      `${val}% (${item.payload.jamTerpakai} dari 40 Jam/Minggu)`,
                      'Tingkat Utilitas'
                    ]}
                    labelFormatter={(label, payload) => {
                      const item = payload && payload[0] && payload[0].payload;
                      return item ? `${item.kode} - ${item.namaLengkap}` : label;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <ReferenceLine
                    y={70}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{
                      value: 'Target LAM-Teknik: 70%',
                      fill: '#10b981',
                      fontSize: 10,
                      position: 'insideTopLeft'
                    }}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{
                      value: 'Batas Minimum Efisiensi: 50%',
                      fill: '#f59e0b',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />
                  <Bar
                    dataKey="utilitasPersen"
                    name="Persentase Utilitas Mingguan (%)"
                    radius={[5, 5, 0, 0]}
                  >
                    {roomUtilizationData.map(entry => (
                      <Cell
                        key={entry.id}
                        fill={
                          entry.utilitasPersen >= 75
                            ? '#2563eb'
                            : entry.utilitasPersen >= 50
                            ? '#059669'
                            : '#f59e0b'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRuangan.map(ruang => {
              const activeClass = jadwalList.find(
                j => j.ruanganId === ruang.id && isJadwalSedangBerlangsung(j, currentDay, currentTimeStr)
              );
              const todayClasses = jadwalList.filter(
                j => j.ruanganId === ruang.id && j.hari === currentDay
              );
              const isOccupied = !!activeClass || ruang.statusSaatIni === 'Terpakai';
              const iabeeInfo = iabeeByRoomId.get(ruang.id);

              return (
                <div
                  key={ruang.id}
                  className={`bg-white rounded-xl border p-5 flex flex-col justify-between transition-colors shadow-xs ${
                    isOccupied ? 'border-blue-300' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                          {ruang.kode} &bull; {ruang.gedung} Lt. {ruang.lantai}
                        </span>
                        <h2 className="text-sm font-bold text-slate-900 mt-0.5">{ruang.nama}</h2>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${
                          isOccupied
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOccupied ? 'Sedang Terpakai' : 'Tersedia'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Kapasitas {ruang.kapasitas} Kursi</span>
                      </span>
                      <span>&bull;</span>
                      <span className="text-slate-500">{ruang.tipe}</span>
                      {iabeeInfo && (
                        <>
                          <span>&bull;</span>
                          <span
                            className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border ${
                              iabeeInfo.score >= 85
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : iabeeInfo.score >= 70
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            IABEE {iabeeInfo.score}/100
                          </span>
                        </>
                      )}
                    </div>

                    {activeClass ? (
                      <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
                        <div className="font-semibold text-blue-900">
                          {activeClass.namaMK} ({activeClass.kelas})
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          Dosen: <span className="font-medium text-slate-800">{activeClass.dosenNama}</span>
                        </div>
                        <div className="font-mono text-[11px] text-blue-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {activeClass.jamMulai} - {activeClass.jamSelesai} WIB
                          </span>
                        </div>
                      </div>
                    ) : ruang.jadwalAktifSaatIni ? (
                      <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
                        <div className="font-semibold text-blue-900">
                          {ruang.jadwalAktifSaatIni.matakuliah} ({ruang.jadwalAktifSaatIni.kelas})
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          Dosen:{' '}
                          <span className="font-medium text-slate-800">
                            {ruang.jadwalAktifSaatIni.dosen}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-blue-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{ruang.jadwalAktifSaatIni.jam} WIB</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                        Tidak ada perkuliahan aktif saat ini. Fasilitas siap digunakan untuk praktikum &amp; penelitian.
                      </div>
                    )}

                    <div className="mt-3.5">
                      <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                        Fasilitas &amp; Instrumen:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ruang.fasilitas.map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Agenda Hari {currentDay} ({todayClasses.length} Sesi):
                    </span>
                    {todayClasses.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">
                        Tidak ada jadwal reguler hari ini.
                      </span>
                    ) : (
                      <div className="space-y-1 mt-1 text-[11px]">
                        {todayClasses.map(c => (
                          <div key={c.id} className="flex items-center justify-between text-slate-600">
                            <span className="truncate max-w-[170px]">
                              {c.namaMK} ({c.kelas})
                            </span>
                            <span className="font-mono text-slate-500 shrink-0">{c.jamMulai}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT INVENTARIS (PC, JARINGAN, ALAT TEKNIK) VS JADWAL RIIL */}
      {activeTab === 'inventaris_audit' && (
        <div className="space-y-6">
          {/* 3-Category Inventory Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {auditReport.categorySummaries.map(cat => {
              const IconComp =
                cat.kategori === 'PC' ? Monitor : cat.kategori === 'JARINGAN' ? Network : Wrench;
              const isSelected = categoryFilter === cat.kategori;

              return (
                <div
                  key={cat.kategori}
                  className={`bg-white border rounded-xl p-4 shadow-xs transition-colors ${
                    isSelected ? 'border-blue-500 ring-1 ring-blue-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{cat.label}</div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {cat.jenisAlatCount} Jenis Perangkat
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCategoryFilter(isSelected ? 'ALL' : cat.kategori)
                      }
                      className="text-[11px] font-semibold px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isSelected ? 'Tampilkan Semua' : 'Filter Kategori'}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-3">
                    <div>
                      <div className="text-[10px] text-slate-500">Siap Pakai</div>
                      <div className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
                        {cat.availableUnits}/{cat.totalUnits}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Perbaikan</div>
                      <div
                        className={`text-sm font-bold font-mono tabular-nums ${
                          cat.repairUnits > 0 ? 'text-rose-700' : 'text-slate-700'
                        }`}
                      >
                        {cat.repairUnits} Unit
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Rasio Siap</div>
                      <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                        {cat.availabilityPercent}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table 1: Real Schedule vs Inventory Availability */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Audit Pemanfaatan Lab: Jadwal Penggunaan Riil vs Ketersediaan Perangkat
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Memeriksa jumlah peserta tiap sesi praktikum terhadap unit siap pakai, status perbaikan, dan potensi bentrok jadwal maintenance.
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setScheduleAuditFilter('ALL')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    scheduleAuditFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Semua Jadwal ({auditReport.scheduleFindings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleAuditFilter('WARNINGS')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    scheduleAuditFilter === 'WARNINGS'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Bermasalah Saja ({auditReport.criticalScheduleAlerts.length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Sesi Praktikum / MK</th>
                    <th className="py-3 px-3 font-semibold">Ruang &amp; Waktu</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Peserta</th>
                    <th className="py-3 px-3 font-semibold">Temuan Ketersediaan Perangkat</th>
                    <th className="py-3 px-3 font-semibold">Status Audit</th>
                    <th className="py-3 px-4 font-semibold">Rekomendasi Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedScheduleFindings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Tidak ada jadwal praktikum bermasalah pada cakupan {prodiScopeLabel}.
                      </td>
                    </tr>
                  ) : (
                    displayedScheduleFindings.map(item => (
                      <tr
                        key={item.id}
                        className={
                          item.auditStatus === 'BENTROK_MAINTENANCE' ||
                          item.auditStatus === 'PERBAIKAN_KRITIS'
                            ? 'bg-rose-50/35 hover:bg-rose-50/60'
                            : item.auditStatus === 'UNIT_KURANG'
                            ? 'bg-amber-50/35 hover:bg-amber-50/60'
                            : 'hover:bg-slate-50/80'
                        }
                      >
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-900">
                            {item.namaMK} ({item.kelas})
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.kodeMK} &bull; {item.dosenNama}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 align-top">
                          <div className="font-semibold text-slate-800">{item.ruanganKode}</div>
                          <div className="font-mono text-[11px] text-slate-500 mt-0.5 tabular-nums">
                            {item.hari}, {item.jam}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums align-top">
                          <div className="font-bold text-slate-900">{item.pesertaTotal} mhs</div>
                          <div className="text-[10px] text-slate-500">
                            Kap: {item.kapasitasRuang}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 align-top">
                          {item.equipmentDeficits.length === 0 &&
                          item.maintenanceBentrokItems.length === 0 ? (
                            <span className="text-emerald-700 font-medium">
                              Semua unit siap &amp; tidak bentrok servis.
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {item.equipmentDeficits.map(def => (
                                <div key={def.equipmentId} className="text-[11px] text-rose-800">
                                  <span className="font-semibold">{def.namaAlat}:</span> {def.alasan}
                                </div>
                              ))}
                              {item.maintenanceBentrokItems.map((m, idx) => (
                                <div key={idx} className="text-[11px] text-amber-900 font-medium">
                                  Bentrok Servis: {m}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 align-top">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold whitespace-nowrap ${
                              item.auditStatus === 'SIAP_PRAKTIKUM'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : item.auditStatus === 'UNIT_KURANG'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {item.auditStatus === 'SIAP_PRAKTIKUM' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            <span>{item.auditStatusLabel}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          <p className="text-[11px] text-slate-700 leading-snug">
                            {item.rekomendasi}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Live Equipment Inventory Controls */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Data Inventaris Peralatan Laboratorium &amp; Simulasi Status Perbaikan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbarui status perbaikan unit (PC, Perangkat Jaringan, Alat Teknik) secara langsung untuk menguji dampak pada jadwal &amp; skor IABEE.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-600 tabular-nums">
                Menampilkan {displayedEquipments.length} item perangkat
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Perangkat &amp; Kode BMN</th>
                    <th className="py-3 px-3 font-semibold">Kategori</th>
                    <th className="py-3 px-3 font-semibold">Lokasi Lab</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Unit Siap</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Dalam Perbaikan</th>
                    <th className="py-3 px-3 font-semibold">Status Kondisi</th>
                    <th className="py-3 px-4 font-semibold text-right">Ubah Status Perbaikan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedEquipments.map(eq => (
                    <tr key={eq.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{eq.namaAlat}</div>
                        <div className="text-[11px] text-slate-500">
                          <span className="font-mono">{eq.kodeAsetBmn}</span> &bull;{' '}
                          {eq.spesifikasiRingkas}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                          {CATEGORY_LABELS[eq.kategori]}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                        {eq.ruanganId}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-emerald-700">
                        {eq.unitTersedia} / {eq.unitTotal}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-rose-700">
                        {eq.unitDalamPerbaikan}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded border whitespace-nowrap ${
                            eq.unitDalamPerbaikan > 0
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : eq.kondisi === 'KALIBRASI_TERLAMBAT'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {eq.unitDalamPerbaikan > 0
                            ? 'Dalam Perbaikan'
                            : eq.kondisi === 'KALIBRASI_TERLAMBAT'
                            ? 'Perlu Kalibrasi'
                            : 'Operasional Baik'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustRepairUnit(eq.id, -1)}
                            disabled={eq.unitDalamPerbaikan === 0}
                            title="Kurangi 1 unit perbaikan (Tandai selesai diperbaiki)"
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Minus className="w-3 h-3" />
                            <span>Selesai Servis</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustRepairUnit(eq.id, 1)}
                            disabled={eq.unitDalamPerbaikan >= eq.unitTotal}
                            title="Tambah 1 unit dalam perbaikan"
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Rusak</span>
                          </button>
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

      {/* TAB 3: AUDIT KELAYAKAN FASILITAS IABEE (1-100) & MAINTENANCE TRIGGER KALIBRASI */}
      {activeTab === 'iabee_kalibrasi' && (
        <div className="space-y-6">
          {/* Header Action Bar for Automated IABEE Report */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Audit Kelayakan Fasilitas Standar IABEE (Skor 1–100) &amp; Laporan Kalibrasi Otomatis
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Penilaian objektif berbasis ketersediaan unit praktik, kepatuhan kalibrasi alat ukur, kesesuaian jadwal riil, dan logbook K3 laboratorium.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyAutoReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Laporan Kalibrasi</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAutoReportModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lihat Laporan Otomatis IABEE</span>
              </button>
            </div>
          </div>

          {/* Per-Lab IABEE Scorecards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {auditReport.iabeeResults.map(res => (
              <div
                key={res.ruangan.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[11px] font-bold text-slate-500">
                      {res.ruangan.kode} &bull; {res.ruangan.tipe}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{res.ruangan.nama}</h3>
                    <div className="text-[11px] font-semibold mt-1 text-slate-600">
                      {res.predikat}
                    </div>
                  </div>

                  <div
                    className={`px-3 py-2 rounded-xl border text-center shrink-0 ${
                      res.score >= 85
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : res.score >= 70
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-semibold">Skor IABEE</div>
                    <div className="text-xl font-bold font-mono tabular-nums leading-tight">
                      {res.score}
                      <span className="text-xs font-normal text-slate-500">/100</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      res.score >= 85
                        ? 'bg-emerald-600'
                        : res.score >= 70
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                    style={{ width: `${res.score}%` }}
                  />
                </div>

                {/* 4 IABEE Checklist Items */}
                <div className="space-y-2 pt-1">
                  {res.checklist.map(chk => (
                    <div
                      key={chk.kode}
                      className="flex items-start justify-between gap-3 text-xs border border-slate-100 bg-slate-50/70 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-start gap-2">
                        {chk.terpenuhi ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-800">{chk.label}</div>
                          <div className="text-[11px] text-slate-500">{chk.catatan}</div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">
                        {chk.kode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Maintenance Trigger: Calibration Monitoring Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CalendarClock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Maintenance Trigger: Pemindaian Jadwal Kalibrasi Perangkat Teknik
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tanggal Referensi Audit: <span className="font-mono">{auditReport.referenceDate}</span> &bull; Memberikan peringatan otomatis jika instrumen teknik mendekati atau melewati masa berlaku sertifikat kalibrasi.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Instrumen Teknik &amp; Kode BMN</th>
                    <th className="py-3 px-3 font-semibold">Laboratorium</th>
                    <th className="py-3 px-3 font-semibold font-mono">Kalibrasi Terakhir</th>
                    <th className="py-3 px-3 font-semibold font-mono">Jatuh Tempo</th>
                    <th className="py-3 px-3 font-semibold">Status Trigger</th>
                    <th className="py-3 px-3 font-semibold">Tindakan Otomatis Disarankan</th>
                    <th className="py-3 px-4 font-semibold text-right">Aksi Prodi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditReport.maintenanceTriggers.map(trig => (
                    <tr
                      key={trig.equipmentId}
                      className={
                        trig.urgency === 'KADALUARSA'
                          ? 'bg-rose-50/40'
                          : trig.urgency === 'KRITIS_14_HARI'
                          ? 'bg-amber-50/45'
                          : 'hover:bg-slate-50/80'
                      }
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{trig.namaAlat}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {trig.kodeAsetBmn}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{trig.ruanganKode}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {trig.ruanganNama}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono tabular-nums text-slate-600">
                        {trig.terakhirKalibrasi}
                      </td>
                      <td className="py-3.5 px-3 font-mono tabular-nums font-semibold text-slate-900">
                        {trig.jatuhTempoKalibrasi}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded border whitespace-nowrap ${
                            trig.urgency === 'KADALUARSA'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : trig.urgency === 'KRITIS_14_HARI'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : trig.urgency === 'PERINGATAN_30_HARI'
                              ? 'bg-yellow-50 text-yellow-900 border-yellow-300'
                              : trig.urgency === 'TERJADWAL'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {trig.urgencyLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-slate-700 leading-snug max-w-xs">
                        {trig.tindakanSaran}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {trig.statusKalibrasiDijadwalkan || trig.urgency === 'AMAN' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {trig.statusKalibrasiDijadwalkan ? 'Terjadwal' : 'Belum Mendesak'}
                            </span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleScheduleCalibration(trig.equipmentId, trig.namaAlat)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <CalendarClock className="w-3.5 h-3.5" />
                            <span>Jadwalkan Kalibrasi</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LAPORAN OTOMATIS KALIBRASI & IABEE */}
      {showAutoReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-slate-300 uppercase">
                  Dokumen Audit Otomatis IABEE &amp; Maintenance Trigger
                </div>
                <h3 className="text-base font-bold mt-0.5">
                  Laporan Kelayakan Fasilitas Lab &amp; Alat Perlu Kalibrasi ({prodiScopeLabel})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAutoReportModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Tutup modal laporan otomatis"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-4 leading-relaxed">
                {autoReportText}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAutoReportModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleCopyAutoReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Laporan ke Clipboard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
