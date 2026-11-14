import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  Users,
  UserCheck,
  Building,
  GraduationCap,
  CalendarX2,
  Clock,
  PieChart as PieChartIcon,
  BarChart2,
  MapPin,
  Phone,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { Dosen, ProgramStudiInfo, StatusKehadiranDosen } from '../types/index';

interface DosenPresenceChartProps {
  dosenList: Dosen[];
  selectedProdi: ProgramStudiInfo;
  currentDay: string;
  currentTimeStr: string;
  onNavigateTab?: (tab: string) => void;
  onUpdateDosenStatus?: (dosenId: string, status: StatusKehadiranDosen, lokasi?: string) => void;
}

interface StatusCategoryConfig {
  key: StatusKehadiranDosen;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const STATUS_CONFIGS: Record<StatusKehadiranDosen, StatusCategoryConfig> = {
  'Sedang Mengajar': {
    key: 'Sedang Mengajar',
    label: 'Sedang Mengajar',
    shortLabel: 'Mengajar',
    color: '#10b981', // emerald-500
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    icon: UserCheck,
    description: 'Aktif tatap muka di ruang kuliah teori, laboratorium, atau studio'
  },
  'Ada di Ruang Dosen': {
    key: 'Ada di Ruang Dosen',
    label: 'Ada di Ruang Dosen',
    shortLabel: 'Ruang Dosen',
    color: '#3b82f6', // blue-500
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    icon: Building,
    description: 'Tersedia di meja kerja prodi untuk konsultasi dan urusan akademik'
  },
  'Bimbingan Mahasiswa': {
    key: 'Bimbingan Mahasiswa',
    label: 'Bimbingan Mahasiswa',
    shortLabel: 'Bimbingan',
    color: '#8b5cf6', // purple-500
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    icon: GraduationCap,
    description: 'Sedang asistensi Tugas Akhir / Skripsi, Kerja Praktek, atau Konseling PA'
  },
  'Izin / Tugas Luar': {
    key: 'Izin / Tugas Luar',
    label: 'Izin / Tugas Luar',
    shortLabel: 'Izin / Tugas',
    color: '#f59e0b', // amber-500
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    icon: CalendarX2,
    description: 'Penugasan luar kampus, riset lapangan, dinas dekanat, seminar, atau izin'
  },
  'Belum Hadir': {
    key: 'Belum Hadir',
    label: 'Belum Hadir',
    shortLabel: 'Belum Hadir',
    color: '#94a3b8', // slate-400
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    icon: Clock,
    description: 'Belum melakukan presensi tap/kehadiran sesi dinas hari ini'
  }
};

export const DosenPresenceChart: React.FC<DosenPresenceChartProps> = ({
  dosenList,
  selectedProdi,
  currentDay,
  currentTimeStr,
  onNavigateTab,
  onUpdateDosenStatus
}) => {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [scope, setScope] = useState<'prodi' | 'fakultas'>('prodi');
  const [viewDimension, setViewDimension] = useState<'presensi' | 'beban_mengajar'>('presensi');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Animation & transition tracking for data updates
  const [transitionKey, setTransitionKey] = useState<number>(0);
  const [showUpdateNotice, setShowUpdateNotice] = useState<boolean>(false);
  const [lastShiftDetail, setLastShiftDetail] = useState<string>('');
  const prevStatusesRef = useRef<string>('');

  // Filter dosen based on scope
  const targetDosenList = useMemo(() => {
    if (scope === 'prodi') {
      return dosenList.filter(d => d.prodiId === selectedProdi.id);
    }
    return dosenList;
  }, [dosenList, scope, selectedProdi.id]);

  // Compute status signature to trigger transition animations on updates
  const currentStatusSignature = useMemo(() => {
    return targetDosenList.map(d => `${d.id}:${d.statusRealTime}`).join('|');
  }, [targetDosenList]);

  // Detect status shifts and trigger smooth fade-in animation & notification
  useEffect(() => {
    if (prevStatusesRef.current && prevStatusesRef.current !== currentStatusSignature) {
      setTransitionKey(prev => prev + 1);
      setShowUpdateNotice(true);
      setLastShiftDetail(`Perubahan status kehadiran dosen terdeteksi pada ${currentTimeStr} WIB`);
      const timer = setTimeout(() => {
        setShowUpdateNotice(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
    prevStatusesRef.current = currentStatusSignature;
  }, [currentStatusSignature, currentTimeStr]);

  // Group counts by status
  const statsData = useMemo(() => {
    const counts: Record<StatusKehadiranDosen, number> = {
      'Sedang Mengajar': 0,
      'Ada di Ruang Dosen': 0,
      'Bimbingan Mahasiswa': 0,
      'Izin / Tugas Luar': 0,
      'Belum Hadir': 0
    };

    targetDosenList.forEach(d => {
      if (counts[d.statusRealTime] !== undefined) {
        counts[d.statusRealTime]++;
      } else {
        counts['Belum Hadir']++;
      }
    });

    const total = targetDosenList.length;

    const chartData = (Object.keys(STATUS_CONFIGS) as StatusKehadiranDosen[]).map(statusKey => {
      const cfg = STATUS_CONFIGS[statusKey];
      const count = counts[statusKey] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
      return {
        name: cfg.label,
        shortName: cfg.shortLabel,
        statusKey,
        count,
        percentage,
        color: cfg.color
      };
    });

    const hadirDiKampusCount = (counts['Sedang Mengajar'] || 0) + (counts['Ada di Ruang Dosen'] || 0) + (counts['Bimbingan Mahasiswa'] || 0);
    const persentaseHadir = total > 0 ? Math.round((hadirDiKampusCount / total) * 100) : 0;

    return {
      total,
      hadirDiKampusCount,
      persentaseHadir,
      counts,
      chartData
    };
  }, [targetDosenList]);

  // Compute teaching load (BKD) distribution: <12 SKS (below), 12-16 SKS (normal), >16 SKS (above)
  const bebanMengajarStats = useMemo(() => {
    const below = targetDosenList.filter(d => (d.totalSksMengajar || 12) < 12);
    const normal = targetDosenList.filter(d => (d.totalSksMengajar || 12) >= 12 && (d.totalSksMengajar || 12) <= 16);
    const above = targetDosenList.filter(d => (d.totalSksMengajar || 12) > 16);
    const total = targetDosenList.length || 1;
    const totalSks = targetDosenList.reduce((acc, d) => acc + (d.totalSksMengajar || 12), 0);
    const rataRataSks = targetDosenList.length > 0 ? (totalSks / targetDosenList.length).toFixed(1) : '0';

    const chartData = [
      {
        key: 'normal',
        statusKey: 'normal',
        name: 'Sesuai Normal (12–16 SKS)',
        shortName: '12–16 SKS',
        label: 'Sesuai Beban Normal (12–16 SKS)',
        count: normal.length,
        percentage: Math.round((normal.length / total) * 100),
        color: '#10b981',
        description: 'Beban mengajar ideal sesuai SN-Dikti & Pedoman BKD',
        dosen: normal
      },
      {
        key: 'above',
        statusKey: 'above',
        name: 'Di Atas Normal (>16 SKS)',
        shortName: '>16 SKS',
        label: 'Di Atas Beban Normal (>16 SKS)',
        count: above.length,
        percentage: Math.round((above.length / total) * 100),
        color: '#f59e0b',
        description: 'Beban berlebih, perlu redistribusi atau tim teaching',
        dosen: above
      },
      {
        key: 'below',
        statusKey: 'below',
        name: 'Di Bawah Normal (<12 SKS)',
        shortName: '<12 SKS',
        label: 'Di Bawah Beban Normal (<12 SKS)',
        count: below.length,
        percentage: Math.round((below.length / total) * 100),
        color: '#94a3b8',
        description: 'Di bawah beban minimum (tugas riset / tugas dekanat / studi lanjut)',
        dosen: below
      }
    ];

    return {
      total: targetDosenList.length,
      normalCount: normal.length,
      aboveCount: above.length,
      belowCount: below.length,
      normalPct: Math.round((normal.length / total) * 100),
      abovePct: Math.round((above.length / total) * 100),
      belowPct: Math.round((below.length / total) * 100),
      totalSks,
      rataRataSks,
      chartData
    };
  }, [targetDosenList]);

  // Filtered lecturers for the roster list
  const filteredRoster = useMemo(() => {
    if (viewDimension === 'beban_mengajar') {
      if (selectedStatusFilter === 'all') return targetDosenList;
      if (selectedStatusFilter === 'normal') {
        return targetDosenList.filter(d => (d.totalSksMengajar || 12) >= 12 && (d.totalSksMengajar || 12) <= 16);
      }
      if (selectedStatusFilter === 'above') {
        return targetDosenList.filter(d => (d.totalSksMengajar || 12) > 16);
      }
      if (selectedStatusFilter === 'below') {
        return targetDosenList.filter(d => (d.totalSksMengajar || 12) < 12);
      }
      return targetDosenList;
    }
    if (selectedStatusFilter === 'all') {
      return targetDosenList;
    }
    return targetDosenList.filter(d => d.statusRealTime === selectedStatusFilter);
  }, [targetDosenList, selectedStatusFilter, viewDimension]);

  // Enhanced Dynamic Tooltip for Recharts with lecturer previews and smooth fade-in
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      if (viewDimension === 'beban_mengajar') {
        const dosenListGroup = data.dosen || [];
        return (
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs max-w-xs sm:max-w-sm animate-in fade-in zoom-in-95 duration-200 transition-all z-50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-xs shrink-0"
                  style={{ backgroundColor: data.color }}
                />
                <span className="font-bold text-white text-sm">{data.label}</span>
              </div>
              <span className="font-mono text-emerald-400 font-extrabold text-xs bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                {data.percentage}%
              </span>
            </div>

            <div className="mt-2.5 space-y-1.5">
              <div className="flex justify-between items-center text-slate-300 text-xs">
                <span>Jumlah Dosen:</span>
                <span className="font-bold text-white font-mono">
                  {data.count} dari {bebanMengajarStats.total} Dosen
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${data.percentage}%`,
                    backgroundColor: data.color
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400 italic pt-1">
                {data.description}
              </p>
            </div>

            {dosenListGroup.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                  <span>Dosen ({dosenListGroup.length})</span>
                  <span className="text-[9px] text-slate-500 font-normal">Beban SKS</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {dosenListGroup.slice(0, 4).map((d: Dosen) => (
                    <div key={d.id} className="flex items-center justify-between gap-2 text-[11px] py-0.5">
                      <span className="font-medium text-slate-200 truncate">{d.namaLengkap}</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {d.totalSksMengajar} SKS
                      </span>
                    </div>
                  ))}
                  {dosenListGroup.length > 4 && (
                    <div className="text-[10px] text-blue-400 italic pt-0.5">
                      + {dosenListGroup.length - 4} dosen lainnya
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      const cfg = STATUS_CONFIGS[data.statusKey as StatusKehadiranDosen] || STATUS_CONFIGS['Belum Hadir'];
      const StatusIcon = cfg.icon;

      // Find lecturers currently in this status
      const lecturersInStatus = targetDosenList.filter(d => d.statusRealTime === data.statusKey);

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs max-w-xs sm:max-w-sm animate-in fade-in zoom-in-95 duration-200 transition-all z-50">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shadow-xs shrink-0"
                style={{ backgroundColor: data.color }}
              />
              <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                <StatusIcon className="w-4 h-4 text-slate-300" />
                <span>{data.name}</span>
              </div>
            </div>
            <span className="font-mono text-emerald-400 font-extrabold text-xs bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              {data.percentage}%
            </span>
          </div>

          {/* Counts & Progress bar */}
          <div className="mt-2.5 space-y-1.5">
            <div className="flex justify-between items-center text-slate-300 text-xs">
              <span>Populasi Dosen:</span>
              <span className="font-bold text-white font-mono">
                {data.count} dari {statsData.total} Dosen
              </span>
            </div>

            {/* Visual Mini Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${data.percentage}%`,
                  backgroundColor: data.color
                }}
              />
            </div>

            <p className="text-[11px] text-slate-400 italic pt-1">
              {cfg.description}
            </p>
          </div>

          {/* Lecturers in this status preview */}
          {lecturersInStatus.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                <span>Dosen ({lecturersInStatus.length})</span>
                <span className="text-[9px] text-slate-500 font-normal">Lokasi Terkini</span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {lecturersInStatus.slice(0, 4).map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-2 text-[11px] py-0.5">
                    <span className="font-medium text-slate-200 truncate">{d.namaLengkap}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px] font-mono">
                      {d.lokasiTerkini}
                    </span>
                  </div>
                ))}
                {lecturersInStatus.length > 4 && (
                  <div className="text-[10px] text-blue-400 italic pt-0.5">
                    + {lecturersInStatus.length - 4} dosen lainnya dalam status ini
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-2.5 pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center gap-1 justify-center">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Klik segmen untuk menyaring daftar dosen di bawah</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5 transition-all">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="uppercase tracking-wider">Live Real-Time Tracker</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-normal">
              {currentDay}, {currentTimeStr} WIB
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 tracking-tight">
            {viewDimension === 'presensi' 
              ? 'Visualisasi Proporsi Kehadiran Dosen Real-Time' 
              : 'Distribusi Persentase Jam Mengajar Dosen (Donut BKD)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewDimension === 'presensi'
              ? 'Monitoring langsung proporsi dosen yang sedang mengajar, siaga di ruang dosen, membimbing mahasiswa, atau izin dinas luar.'
              : 'Visualisasi donat distribusi jam mengajar dosen: di bawah normal (<12 SKS), sesuai beban normal (12–16 SKS), dan di atas normal (>16 SKS).'}
          </p>
        </div>

        {/* Action Controls: Dimension, Scope Filter & Chart Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dimension Selector: Presensi vs Beban Mengajar */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setViewDimension('presensi');
                setSelectedStatusFilter('all');
                setTransitionKey(prev => prev + 1);
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewDimension === 'presensi'
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Presensi Real-Time
            </button>
            <button
              type="button"
              onClick={() => {
                setViewDimension('beban_mengajar');
                setSelectedStatusFilter('all');
                setTransitionKey(prev => prev + 1);
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewDimension === 'beban_mengajar'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Beban Mengajar (Donut BKD)
            </button>
          </div>

          {/* Scope Selector */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setScope('prodi');
                setTransitionKey(prev => prev + 1);
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                scope === 'prodi'
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prodi {selectedProdi.singkatan}
            </button>
            <button
              type="button"
              onClick={() => {
                setScope('fakultas');
                setTransitionKey(prev => prev + 1);
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                scope === 'fakultas'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Prodi FT ({dosenList.length})
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setChartType('donut');
                setTransitionKey(prev => prev + 1);
              }}
              title="Tampilan Donut Chart"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                chartType === 'donut'
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Donut</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setChartType('bar');
                setTransitionKey(prev => prev + 1);
              }}
              title="Tampilan Bar Chart"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Batang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Update Banner when data shift occurs */}
      {showUpdateNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-2 rounded-lg text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-300 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{lastShiftDetail}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
            Transisi Aktif
          </span>
        </div>
      )}

      {/* KPI Cards Strip */}
      {viewDimension === 'presensi' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* KPI 1: Mengajar */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Sedang Mengajar' ? 'all' : 'Sedang Mengajar')}
            className={`cursor-pointer rounded-xl p-3 border transition-all duration-300 ${
              selectedStatusFilter === 'Sedang Mengajar'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-xs'
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-emerald-800">Sedang Mengajar</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono transition-all duration-500">
                {statsData.counts['Sedang Mengajar'] || 0}
              </span>
              <span className="text-xs text-slate-500">Dosen</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {statsData.total > 0
                ? Math.round(((statsData.counts['Sedang Mengajar'] || 0) / statsData.total) * 100)
                : 0}
              % dari total
            </div>
          </div>

          {/* KPI 2: Di Ruang Dosen */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Ada di Ruang Dosen' ? 'all' : 'Ada di Ruang Dosen')}
            className={`cursor-pointer rounded-xl p-3 border transition-all duration-300 ${
              selectedStatusFilter === 'Ada di Ruang Dosen'
                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 shadow-xs'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-blue-800">Ruang Dosen</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono transition-all duration-500">
                {statsData.counts['Ada di Ruang Dosen'] || 0}
              </span>
              <span className="text-xs text-slate-500">Dosen</span>
            </div>
            <div className="text-[11px] text-blue-700 font-medium mt-1">
              {statsData.total > 0
                ? Math.round(((statsData.counts['Ada di Ruang Dosen'] || 0) / statsData.total) * 100)
                : 0}
              % siap konsultasi
            </div>
          </div>

          {/* KPI 3: Bimbingan Mahasiswa */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Bimbingan Mahasiswa' ? 'all' : 'Bimbingan Mahasiswa')}
            className={`cursor-pointer rounded-xl p-3 border transition-all duration-300 ${
              selectedStatusFilter === 'Bimbingan Mahasiswa'
                ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200 shadow-xs'
                : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-purple-800">Bimbingan TA/KP</span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono transition-all duration-500">
                {statsData.counts['Bimbingan Mahasiswa'] || 0}
              </span>
              <span className="text-xs text-slate-500">Dosen</span>
            </div>
            <div className="text-[11px] text-purple-700 font-medium mt-1">
              {statsData.total > 0
                ? Math.round(((statsData.counts['Bimbingan Mahasiswa'] || 0) / statsData.total) * 100)
                : 0}
              % asistensi aktif
            </div>
          </div>

          {/* KPI 4: Izin / Tugas Luar */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Izin / Tugas Luar' ? 'all' : 'Izin / Tugas Luar')}
            className={`cursor-pointer rounded-xl p-3 border transition-all duration-300 ${
              selectedStatusFilter === 'Izin / Tugas Luar'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-xs'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-amber-800">Izin / Tugas Luar</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono transition-all duration-500">
                {statsData.counts['Izin / Tugas Luar'] || 0}
              </span>
              <span className="text-xs text-slate-500">Dosen</span>
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">
              {statsData.total > 0
                ? Math.round(((statsData.counts['Izin / Tugas Luar'] || 0) / statsData.total) * 100)
                : 0}
              % dinas luar/izin
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* BKD KPI 1: Beban Normal (12-16 SKS) */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'normal' ? 'all' : 'normal')}
            className={`cursor-pointer rounded-xl p-3 border transition-all duration-300 ${
              selectedStatusFilter === 'normal'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-xs'
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-emerald-800">Normal (12–16 SKS)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono transition-all duration-500">
                {bebanMengajarStats.normalCount}
              </span>
              <span className="text-xs text-slate-500">Dosen</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {bebanMengajarStats.normalPct}% ideal SN-Dikti
            </div>
          </div>

          {/* BKD KPI 2: Di Atas Beban Normal (>16 SKS) */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'above' ? 'all' : 'above')}
            className={`cursor-pointer rounded-xl p-3 border transition-all duration-300 ${
              selectedStatusFilter === 'above'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-xs'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-amber-800">Di Atas (&gt;16 SKS)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono transition-all duration-500">
                {bebanMengajarStats.aboveCount}
              </span>
              <span className="text-xs text-slate-500">Dosen</span>
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">
              {bebanMengajarStats.abovePct}% beban tinggi
            </div>
          </div>

          {/* BKD KPI 3: Di Bawah Beban Normal (<12 SKS) */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'below' ? 'all' : 'below')}
            className={`cursor-pointer rounded-xl p-3 border transition-all duration-300 ${
              selectedStatusFilter === 'below'
                ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-200 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-800">Di Bawah (&lt;12 SKS)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono transition-all duration-500">
                {bebanMengajarStats.belowCount}
              </span>
              <span className="text-xs text-slate-500">Dosen</span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium mt-1">
              {bebanMengajarStats.belowPct}% tugas riset/khusus
            </div>
          </div>

          {/* BKD KPI 4: Rata-Rata Beban Prodi */}
          <div className="rounded-xl p-3 border bg-blue-50/50 border-blue-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-blue-900">Rata-Rata Beban</span>
              <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-blue-900 font-mono">
                {bebanMengajarStats.rataRataSks}
              </span>
              <span className="text-xs text-blue-700 font-semibold">SKS / Dosen</span>
            </div>
            <div className="text-[11px] text-blue-800 font-medium mt-1">
              Total {bebanMengajarStats.totalSks} SKS terjadwal
            </div>
          </div>
        </div>
      )}

      {/* Main Visual Section: Chart + Interactive Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Chart Column (7 cols) with Fade-In Animation Wrapper */}
        <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200 rounded-xl p-4 transition-all duration-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>
                {viewDimension === 'presensi'
                  ? chartType === 'donut'
                    ? 'Diagram Proporsi Donut Real-Time'
                    : 'Grafik Batang Jumlah Dosen'
                  : chartType === 'donut'
                  ? 'Visualisasi Donut Beban Mengajar (BKD)'
                  : 'Grafik Batang Distribusi Beban Mengajar (BKD)'}
              </span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {viewDimension === 'presensi'
                ? `Total: ${statsData.total} Dosen · Kehadiran: ${statsData.persentaseHadir}%`
                : `Total: ${bebanMengajarStats.total} Dosen · Sesuai BKD: ${bebanMengajarStats.normalPct}%`}
            </span>
          </div>

          {/* Fade-in animated container keyed to transitionKey to ensure silky transition between status updates */}
          <div
            key={`${transitionKey}-${viewDimension}`}
            className="h-64 sm:h-72 w-full relative animate-in fade-in zoom-in-[0.98] duration-700 transition-all ease-out"
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {chartType === 'donut' ? (
                <PieChart>
                  <Tooltip
                    content={<CustomTooltip />}
                    isAnimationActive={true}
                    animationDuration={200}
                    animationEasing="ease-out"
                  />
                  <Pie
                    data={(viewDimension === 'presensi' ? statsData.chartData : bebanMengajarStats.chartData) as any}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                    onMouseEnter={(entry: any) => setHoveredSegment(entry?.statusKey || entry?.payload?.statusKey || null)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onClick={(entry: any) => {
                      const key = entry?.statusKey || entry?.payload?.statusKey || entry?.key;
                      if (key) {
                        setSelectedStatusFilter(selectedStatusFilter === key ? 'all' : key);
                      }
                    }}
                    cursor="pointer"
                  >
                    {(viewDimension === 'presensi' ? statsData.chartData : bebanMengajarStats.chartData).map((entry, index) => (
                      <Cell
                        key={`cell-${entry.statusKey}-${index}`}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                        className="transition-all duration-300"
                        opacity={
                          selectedStatusFilter === 'all' || selectedStatusFilter === entry.statusKey || selectedStatusFilter === (entry as any).key
                            ? 1
                            : 0.3
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <BarChart
                  data={(viewDimension === 'presensi' ? statsData.chartData : bebanMengajarStats.chartData) as any}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  onClick={(state: any) => {
                    const key = state?.activePayload?.[0]?.payload?.statusKey || state?.activePayload?.[0]?.payload?.key;
                    if (key) {
                      setSelectedStatusFilter(selectedStatusFilter === key ? 'all' : key);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    isAnimationActive={true}
                    animationDuration={200}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {(viewDimension === 'presensi' ? statsData.chartData : bebanMengajarStats.chartData).map((entry, index) => (
                      <Cell
                        key={`bar-cell-${entry.statusKey}-${index}`}
                        fill={entry.color}
                        className="transition-all duration-300"
                        opacity={
                          selectedStatusFilter === 'all' || selectedStatusFilter === entry.statusKey || selectedStatusFilter === (entry as any).key
                            ? 1
                            : 0.3
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>

            {/* Center Label for Donut Chart with live fade-in */}
            {chartType === 'donut' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-500">
                {viewDimension === 'presensi' ? (
                  <>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight transition-all duration-500">
                      {statsData.hadirDiKampusCount}/{statsData.total}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      Hadir di Kampus
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 font-mono">
                      ({statsData.persentaseHadir}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-extrabold text-emerald-700 font-mono tracking-tight transition-all duration-500">
                      {bebanMengajarStats.normalPct}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-800 tracking-wider">
                      Sesuai BKD
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 font-mono">
                      ({bebanMengajarStats.normalCount}/{bebanMengajarStats.total} Dosen)
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="text-center text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            <span>
              {viewDimension === 'presensi'
                ? 'Arahkan kursor untuk melihat daftar dosen per status · Klik segmen untuk memfilter'
                : 'Arahkan kursor untuk rincian BKD dosen · Klik segmen untuk menyaring daftar dosen'}
            </span>
          </div>
        </div>

        {/* Breakdown Legend & Quick Filter (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              {viewDimension === 'presensi' ? 'Rincian Proporsi Status' : 'Distribusi Jam Mengajar (BKD)'}
            </span>
            {selectedStatusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedStatusFilter('all')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="space-y-2">
            {viewDimension === 'presensi' ? (
              statsData.chartData.map((item) => {
                const cfg = STATUS_CONFIGS[item.statusKey as StatusKehadiranDosen];
                const Icon = cfg.icon;
                const isSelected = selectedStatusFilter === item.statusKey;
                return (
                  <div
                    key={item.statusKey}
                    onClick={() =>
                      setSelectedStatusFilter(isSelected ? 'all' : item.statusKey)
                    }
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? `${cfg.bgColor} ${cfg.borderColor} ring-2 ${cfg.borderColor} shadow-xs scale-[1.01]`
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 transition-transform duration-300"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {cfg.description}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <div className="text-xs font-bold font-mono text-slate-900">
                        {item.count} Dosen
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {item.percentage}%
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              bebanMengajarStats.chartData.map((item) => {
                const isSelected = selectedStatusFilter === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() =>
                      setSelectedStatusFilter(isSelected ? 'all' : item.key)
                    }
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300 shadow-xs scale-[1.01]'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 transition-transform duration-300"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-900 truncate block">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {item.description}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <div className="text-xs font-bold font-mono text-slate-900">
                        {item.count} Dosen
                      </div>
                      <div className="text-[11px] font-mono font-bold text-emerald-700">
                        {item.percentage}%
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Filtered Dosen Roster Strip with Quick Status Shift Control */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-slate-900">
              {viewDimension === 'presensi' ? 'Daftar Presensi Dosen' : 'Daftar Beban Mengajar (BKD) Dosen'}
              {selectedStatusFilter !== 'all' && (
                <span className="ml-1 text-blue-700 font-semibold">
                  · Filter: {
                    selectedStatusFilter === 'normal'
                      ? 'Normal (12–16 SKS)'
                      : selectedStatusFilter === 'above'
                      ? 'Di Atas (>16 SKS)'
                      : selectedStatusFilter === 'below'
                      ? 'Di Bawah (<12 SKS)'
                      : selectedStatusFilter
                  }
                </span>
              )}
              <span className="ml-1.5 text-slate-500 font-mono font-normal">
                ({filteredRoster.length} Dosen)
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {viewDimension === 'presensi'
                ? '* Ubah status langsung pada kartu untuk menguji animasi transisi'
                : '* Standar BKD SN-Dikti: 12 – 16 SKS per semester'}
            </span>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab(viewDimension === 'presensi' ? 'jadwal' : 'bkd')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
              >
                {viewDimension === 'presensi' ? 'Jadwal & Presensi Lengkap →' : 'Modul Evaluasi BKD Lengkap →'}
              </button>
            )}
          </div>
        </div>

        {filteredRoster.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            Tidak ada dosen dengan kriteria <strong>{selectedStatusFilter}</strong> pada scope ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRoster.map((dosen) => {
              const cfg = STATUS_CONFIGS[dosen.statusRealTime] || STATUS_CONFIGS['Belum Hadir'];
              const sks = dosen.totalSksMengajar || 12;
              const isNormal = sks >= 12 && sks <= 16;
              const isAbove = sks > 16;
              const bkdBadgeColor = isNormal
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : isAbove
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-100 text-slate-700 border-slate-300';
              const bkdLabel = isNormal ? 'Ideal BKD' : isAbove ? 'Beban Lebih' : 'Di Bawah Min';

              return (
                <div
                  key={dosen.id}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-blue-300 transition-all duration-300 shadow-2xs hover:shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate" title={dosen.namaLengkap}>
                          {dosen.namaLengkap}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          NIDN: {dosen.nidn} · {dosen.jabatanFungsional}
                        </div>
                      </div>

                      {/* Header right badge: either status switcher or BKD SKS badge */}
                      {viewDimension === 'presensi' ? (
                        onUpdateDosenStatus ? (
                          <select
                            value={dosen.statusRealTime}
                            onChange={(e) => {
                              const newStatus = e.target.value as StatusKehadiranDosen;
                              onUpdateDosenStatus(dosen.id, newStatus);
                            }}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer border transition-colors outline-hidden ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}
                            title="Klik untuk mengubah status kehadiran dosen ini"
                          >
                            <option value="Sedang Mengajar">Mengajar</option>
                            <option value="Ada di Ruang Dosen">Ruang Dosen</option>
                            <option value="Bimbingan Mahasiswa">Bimbingan</option>
                            <option value="Izin / Tugas Luar">Izin / Tugas</option>
                            <option value="Belum Hadir">Belum Hadir</option>
                          </select>
                        ) : (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${cfg.bgColor} ${cfg.textColor} border ${cfg.borderColor}`}
                          >
                            {dosen.statusRealTime}
                          </span>
                        )
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 border ${bkdBadgeColor}`}
                          title={`Beban: ${sks} SKS (${bkdLabel})`}
                        >
                          {sks} SKS · {bkdLabel}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={dosen.lokasiTerkini}>
                        {dosen.lokasiTerkini}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">
                      Beban: <strong className={isNormal ? 'text-emerald-700' : isAbove ? 'text-amber-700' : 'text-slate-700'}>{sks} SKS</strong> · BAP: <strong>{dosen.kehadiranBapPersen}%</strong>
                    </span>
                    <a
                      href={`https://wa.me/62${dosen.noHp?.replace(/\D/g, '').replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium text-[10px] bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors"
                      title={`Hubungi WhatsApp: ${dosen.noHp}`}
                    >
                      <Phone className="w-2.5 h-2.5" />
                      <span>Kontak</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
