import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  Line
} from 'recharts';
import {
  Users,
  GraduationCap,
  AlertTriangle,
  Calendar,
  Layers,
  BarChart2,
  TrendingUp,
  Percent,
  CheckCircle2,
  Info,
  ArrowUpRight,
  UserX,
  UserCheck,
  Clock
} from 'lucide-react';
import { Mahasiswa, ProgramStudiInfo } from '../types/index';

interface StudentCohortStatusChartProps {
  mahasiswaList: Mahasiswa[];
  selectedProdi: ProgramStudiInfo;
  onNavigateTab?: (tab: string) => void;
  onSelectMahasiswa?: (mhs: Mahasiswa) => void;
}

type ChartDisplayMode = 'stacked' | 'grouped' | 'percent' | 'trend';

export const StudentCohortStatusChart: React.FC<StudentCohortStatusChartProps> = ({
  mahasiswaList,
  selectedProdi,
  onNavigateTab,
  onSelectMahasiswa
}) => {
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('stacked');
  const [filterScope, setFilterScope] = useState<'prodi' | 'all'>('prodi');
  const [selectedCohort, setSelectedCohort] = useState<number | null>(null);

  // Filter dataset based on selected scope
  const targetMhsList = useMemo(() => {
    if (filterScope === 'all') {
      return mahasiswaList;
    }
    return mahasiswaList.filter(m => m.prodiId === selectedProdi.id);
  }, [mahasiswaList, selectedProdi.id, filterScope]);

  // Aggregate student status per angkatan
  const cohortData = useMemo(() => {
    const map = new Map<number, {
      angkatan: number;
      label: string;
      aktif: number;
      nonAktif: number;
      lulus: number;
      cuti: number;
      total: number;
      avgIpk: number;
      totalIpk: number;
      mhsList: Mahasiswa[];
    }>();

    targetMhsList.forEach(m => {
      const ang = m.angkatan || 2021;
      if (!map.has(ang)) {
        map.set(ang, {
          angkatan: ang,
          label: `Angk. ${ang}`,
          aktif: 0,
          nonAktif: 0,
          lulus: 0,
          cuti: 0,
          total: 0,
          avgIpk: 0,
          totalIpk: 0,
          mhsList: []
        });
      }

      const item = map.get(ang)!;
      item.total++;
      item.totalIpk += (m.ipk || 0);
      item.mhsList.push(m);

      if (m.status === 'Aktif' || m.status === 'Tugas Akhir') {
        item.aktif++;
      } else if (m.status === 'Non-Aktif' || m.status === 'Berisiko' || m.status === 'Pindah') {
        item.nonAktif++;
      } else if (m.status === 'Lulus') {
        item.lulus++;
      } else if (m.status === 'Cuti') {
        item.cuti++;
      } else {
        item.aktif++;
      }
    });

    // Sort cohorts chronologically ascending
    const sorted = Array.from(map.values()).sort((a, b) => a.angkatan - b.angkatan);

    return sorted.map(item => {
      const avg = item.total > 0 ? Number((item.totalIpk / item.total).toFixed(2)) : 0;
      const pctAktif = item.total > 0 ? Number(((item.aktif / item.total) * 100).toFixed(1)) : 0;
      const pctNonAktif = item.total > 0 ? Number(((item.nonAktif / item.total) * 100).toFixed(1)) : 0;
      const pctLulus = item.total > 0 ? Number(((item.lulus / item.total) * 100).toFixed(1)) : 0;
      const pctCuti = item.total > 0 ? Number(((item.cuti / item.total) * 100).toFixed(1)) : 0;

      return {
        ...item,
        avgIpk: avg,
        pctAktif,
        pctNonAktif,
        pctLulus,
        pctCuti
      };
    });
  }, [targetMhsList]);

  // Overall totals for KPI badges
  const totals = useMemo(() => {
    let aktif = 0;
    let nonAktif = 0;
    let lulus = 0;
    let cuti = 0;
    let total = 0;

    cohortData.forEach(c => {
      aktif += c.aktif;
      nonAktif += c.nonAktif;
      lulus += c.lulus;
      cuti += c.cuti;
      total += c.total;
    });

    const pctAktif = total > 0 ? Math.round((aktif / total) * 100) : 0;
    const pctNonAktif = total > 0 ? Math.round((nonAktif / total) * 100) : 0;

    return { aktif, nonAktif, lulus, cuti, total, pctAktif, pctNonAktif };
  }, [cohortData]);

  // Selected cohort detail for drilldown inspection
  const selectedCohortDetails = useMemo(() => {
    if (!selectedCohort) return null;
    return cohortData.find(c => c.angkatan === selectedCohort) || null;
  }, [selectedCohort, cohortData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const cohortItem = cohortData.find(c => c.label === label || `${c.angkatan}` === label);
      return (
        <div className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[220px] animate-in fade-in-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/80">
            <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Angkatan {cohortItem?.angkatan || label}
            </span>
            <span className="bg-blue-900/60 text-blue-300 font-mono text-[11px] px-2 py-0.5 rounded-full border border-blue-700/50">
              Total {cohortItem?.total || 0} Mhs
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-blue-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                Mahasiswa Aktif:
              </span>
              <span className="font-semibold font-mono text-slate-100">
                {cohortItem?.aktif || 0} <span className="text-[10px] text-blue-400 font-normal">({cohortItem?.pctAktif}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                Non-Aktif / Evaluasi:
              </span>
              <span className="font-semibold font-mono text-slate-100">
                {cohortItem?.nonAktif || 0} <span className="text-[10px] text-rose-400 font-normal">({cohortItem?.pctNonAktif}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                Lulus / Wisuda:
              </span>
              <span className="font-semibold font-mono text-slate-100">
                {cohortItem?.lulus || 0} <span className="text-[10px] text-emerald-400 font-normal">({cohortItem?.pctLulus}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                Cuti Akademik:
              </span>
              <span className="font-semibold font-mono text-slate-100">
                {cohortItem?.cuti || 0} <span className="text-[10px] text-amber-400 font-normal">({cohortItem?.pctCuti}%)</span>
              </span>
            </div>

            {cohortItem?.avgIpk ? (
              <div className="pt-2 mt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-300">
                <span>Rata-rata IPK Angkatan:</span>
                <span className="font-bold text-amber-300 font-mono">{cohortItem.avgIpk.toFixed(2)}</span>
              </div>
            ) : null}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 italic">
            Klik batang untuk melihat rincian mahasiswa
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all space-y-5">
      {/* Header & Controls Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Distribusi Status Mahasiswa per Angkatan
                <span className="text-[11px] font-normal px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  {filterScope === 'prodi' ? selectedProdi.nama : 'Semua Program Studi FT'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualisasi tren kohort mahasiswa (Aktif, Non-Aktif, Lulus, Cuti) untuk evaluasi retensi dan masa studi kritis.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterScope('prodi')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterScope === 'prodi'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prodi {selectedProdi.singkatan}
            </button>
            <button
              type="button"
              onClick={() => setFilterScope('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterScope === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Prodi FT
            </button>
          </div>

          {/* Chart Display Mode Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setDisplayMode('stacked')}
              title="Grafik Batang Bertumpuk (Total Komposisi)"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                displayMode === 'stacked'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bertumpuk</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('grouped')}
              title="Grafik Batang Berdampingan"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                displayMode === 'grouped'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Berdampingan</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('percent')}
              title="Proporsi Persentase (100% Stacked)"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                displayMode === 'percent'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Proporsi %</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode('trend')}
              title="Tren Garis & Area Evolusi"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                displayMode === 'trend'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tren</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Aktif */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Mahasiswa Aktif
            </span>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono">
              {totals.pctAktif}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-blue-900 font-mono">
            {totals.aktif.toLocaleString('id-ID')}
          </div>
          <p className="text-[10px] text-blue-600 mt-0.5">
            Registrasi KRS & Tugas Akhir
          </p>
        </div>

        {/* Total Non-Aktif */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5" />
              Non-Aktif / Evaluasi
            </span>
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-mono">
              {totals.pctNonAktif}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-rose-900 font-mono">
            {totals.nonAktif.toLocaleString('id-ID')}
          </div>
          <p className="text-[10px] text-rose-600 mt-0.5">
            Perlu pemanggilan DPA / EWS
          </p>
        </div>

        {/* Total Lulus */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Lulusan / Alumni
            </span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
              {totals.total > 0 ? Math.round((totals.lulus / totals.total) * 100) : 0}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-900 font-mono">
            {totals.lulus.toLocaleString('id-ID')}
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5">
            Telah Yudisium & Wisuda
          </p>
        </div>

        {/* Total Cuti */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Cuti Akademik
            </span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">
              {totals.total > 0 ? Math.round((totals.cuti / totals.total) * 100) : 0}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-amber-900 font-mono">
            {totals.cuti.toLocaleString('id-ID')}
          </div>
          <p className="text-[10px] text-amber-600 mt-0.5">
            Izin Cuti Resmi Fakultas
          </p>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {displayMode === 'trend' ? (
            <AreaChart data={cohortData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorAktif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorNonAktif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorLulus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="aktif" name="Aktif" stroke="#2563eb" fillOpacity={1} fill="url(#colorAktif)" strokeWidth={2} />
              <Area type="monotone" dataKey="nonAktif" name="Non-Aktif" stroke="#dc2626" fillOpacity={1} fill="url(#colorNonAktif)" strokeWidth={2} />
              <Area type="monotone" dataKey="lulus" name="Lulus" stroke="#059669" fillOpacity={1} fill="url(#colorLulus)" strokeWidth={2} />
              <Line type="monotone" dataKey="cuti" name="Cuti" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          ) : displayMode === 'percent' ? (
            <BarChart data={cohortData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }} stackOffset="expand">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tickFormatter={(val) => `${Math.round(val * 100)}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Bar dataKey="aktif" name="Aktif" stackId="a" fill="#3b82f6" />
              <Bar dataKey="nonAktif" name="Non-Aktif" stackId="a" fill="#ef4444" />
              <Bar dataKey="lulus" name="Lulus" stackId="a" fill="#10b981" />
              <Bar dataKey="cuti" name="Cuti" stackId="a" fill="#f59e0b" />
            </BarChart>
          ) : (
            <BarChart
              data={cohortData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const ang = e.activePayload[0].payload.angkatan;
                  setSelectedCohort(prev => (prev === ang ? null : ang));
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Bar
                dataKey="aktif"
                name="Mahasiswa Aktif"
                stackId={displayMode === 'stacked' ? 'a' : undefined}
                fill="#3b82f6"
                radius={displayMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                cursor="pointer"
              />
              <Bar
                dataKey="nonAktif"
                name="Non-Aktif / Evaluasi"
                stackId={displayMode === 'stacked' ? 'a' : undefined}
                fill="#ef4444"
                radius={displayMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                cursor="pointer"
              />
              <Bar
                dataKey="lulus"
                name="Lulus / Wisuda"
                stackId={displayMode === 'stacked' ? 'a' : undefined}
                fill="#10b981"
                radius={displayMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                cursor="pointer"
              />
              <Bar
                dataKey="cuti"
                name="Cuti Akademik"
                stackId={displayMode === 'stacked' ? 'a' : undefined}
                fill="#f59e0b"
                radius={displayMode === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insight & Recommendation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* Insight 1: Retensi Baru */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Kohort Baru 2024–2026</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Tingkat keaktifan mencapai <strong>97.8%</strong> dengan kepatuhan KRS tepat waktu. Tidak ditemukan risiko putus studi di semester awal.
            </p>
          </div>
        </div>

        {/* Insight 2: Masa Studi Senior */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
          <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900">Kohort 2019 & 2021 (Masa Studi Kritis)</h4>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              Tercatat <strong>{totals.nonAktif}</strong> mahasiswa non-aktif pada angkatan 2019 dan 2021. Diperlukan koordinasi pemanggilan orang tua dan bimbingan DPA intensif.
            </p>
          </div>
        </div>

        {/* Action Button: Jump to Mahasiswa View with Filter */}
        <div className="flex flex-col justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-200/80">
          <div>
            <h4 className="font-semibold text-blue-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-700" />
              Kelola & Tindak Lanjut Mahasiswa
            </h4>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Buka modul Mahasiswa untuk mencetak surat peringatan, verifikasi KRS, atau filter per angkatan.
            </p>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('mahasiswa')}
              className="mt-2.5 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors self-start"
            >
              <span>Buka Modul Mahasiswa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Drilldown Details (if cohort is selected) */}
      {selectedCohortDetails && (
        <div className="p-4 bg-slate-900 text-white rounded-xl shadow-inner space-y-3 animate-in fade-in zoom-in-98 duration-150 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <h4 className="font-bold text-sm text-slate-100">
                Rincian Analitik Angkatan {selectedCohortDetails.angkatan} ({selectedCohortDetails.total} Mahasiswa)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCohort(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
              <span className="text-blue-400 block font-medium">Aktif Perkuliahan</span>
              <span className="text-lg font-bold text-white font-mono">{selectedCohortDetails.aktif}</span>
              <span className="text-slate-400 block text-[10px]">{selectedCohortDetails.pctAktif}% dari total</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
              <span className="text-rose-400 block font-medium">Non-Aktif / Terkendala</span>
              <span className="text-lg font-bold text-white font-mono">{selectedCohortDetails.nonAktif}</span>
              <span className="text-slate-400 block text-[10px]">{selectedCohortDetails.pctNonAktif}% dari total</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
              <span className="text-emerald-400 block font-medium">Lulus / Selesai</span>
              <span className="text-lg font-bold text-white font-mono">{selectedCohortDetails.lulus}</span>
              <span className="text-slate-400 block text-[10px]">{selectedCohortDetails.pctLulus}% dari total</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
              <span className="text-amber-400 block font-medium">Rata-rata IPK</span>
              <span className="text-lg font-bold text-amber-300 font-mono">
                {selectedCohortDetails.avgIpk.toFixed(2)}
              </span>
              <span className="text-slate-400 block text-[10px]">Indeks Prestasi Kumulatif</span>
            </div>
          </div>

          {/* Quick list of sample students */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
              Daftar Mahasiswa Angkatan {selectedCohortDetails.angkatan} (Menampilkan 6 mahasiswa pertama):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {selectedCohortDetails.mhsList.slice(0, 6).map(m => (
                <div
                  key={m.id}
                  onClick={() => onSelectMahasiswa && onSelectMahasiswa(m)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-100 truncate text-[11px]">{m.nama}</p>
                    <p className="text-slate-400 font-mono text-[10px]">{m.nim}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono shrink-0 ${
                    m.status === 'Aktif'
                      ? 'bg-blue-900/60 text-blue-300 border border-blue-700'
                      : m.status === 'Lulus'
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                        : 'bg-rose-900/60 text-rose-300 border border-rose-700'
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
