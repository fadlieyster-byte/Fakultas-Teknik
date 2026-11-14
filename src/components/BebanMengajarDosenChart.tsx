import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  Users,
  Award,
  BookOpen,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Dosen, JadwalKuliah, ProgramStudiInfo, KetersediaanJadwalDosen } from '../types/index';

interface BebanMengajarDosenChartProps {
  dosenList: Dosen[];
  selectedProdi: ProgramStudiInfo;
  jadwalKuliahList?: JadwalKuliah[];
  ketersediaanList?: KetersediaanJadwalDosen[];
  prodiFilter?: string;
}

export type StatusBebanDosen = 'all' | 'overload' | 'ideal' | 'underload';

export interface DosenBebanData {
  id: string;
  nidn: string;
  namaLengkap: string;
  shortName: string;
  prodiId: string;
  jabatanFungsional: string;
  sks: number;
  statusBeban: 'Overload' | 'Ideal' | 'Underload';
  color: string;
  kelasCount: number;
  matakuliahNames: string[];
}

export const BebanMengajarDosenChart: React.FC<BebanMengajarDosenChartProps> = ({
  dosenList,
  selectedProdi,
  jadwalKuliahList = [],
  ketersediaanList = [],
  prodiFilter = 'current'
}) => {
  const [filterStatus, setFilterStatus] = useState<StatusBebanDosen>('all');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter dosen based on prodi scope
  const targetDosen = useMemo(() => {
    return dosenList.filter(d => {
      if (prodiFilter === 'current') return d.prodiId === selectedProdi.id;
      if (prodiFilter === 'all') return true;
      return d.prodiId === prodiFilter;
    });
  }, [dosenList, selectedProdi.id, prodiFilter]);

  // Compute teaching load for each lecturer
  const bebanData: DosenBebanData[] = useMemo(() => {
    return targetDosen.map(d => {
      // Find classes taught
      const classes = jadwalKuliahList.filter(j => 
        j.dosenNidn === d.nidn || j.dosenNama.toLowerCase().includes(d.namaLengkap.toLowerCase().split(',')[0])
      );

      const calculatedSks = classes.reduce((sum, c) => sum + (c.sks || 0), 0);
      // Fallback to dosen.totalSksMengajar if no classes explicitly mapped in timetable
      const finalSks = calculatedSks > 0 ? calculatedSks : (d.totalSksMengajar || 12);

      let statusBeban: 'Overload' | 'Ideal' | 'Underload' = 'Ideal';
      let color = '#10b981'; // Emerald 500 for Ideal

      if (finalSks > 16) {
        statusBeban = 'Overload';
        color = '#ef4444'; // Red 500
      } else if (finalSks < 12) {
        statusBeban = 'Underload';
        color = '#f59e0b'; // Amber 500
      }

      // Generate a clean short name for the X-axis label
      const nameParts = d.namaLengkap.replace(/^(Ir\.|Dr\.|Drs\.|Prof\.)\s*/i, '').split(',')[0].trim().split(' ');
      const shortName = nameParts.length > 2 
        ? `${nameParts[0]} ${nameParts[1].charAt(0)}.` 
        : nameParts.join(' ');

      const matakuliahNames = Array.from(new Set(classes.map(c => c.namaMK)));

      return {
        id: d.id,
        nidn: d.nidn,
        namaLengkap: d.namaLengkap,
        shortName,
        prodiId: d.prodiId,
        jabatanFungsional: d.jabatanFungsional,
        sks: finalSks,
        statusBeban,
        color,
        kelasCount: classes.length || Math.ceil(finalSks / 3),
        matakuliahNames: matakuliahNames.length > 0 ? matakuliahNames : ['Mata Kuliah Keahlian Prodi']
      };
    }).sort((a, b) => b.sks - a.sks);
  }, [targetDosen, jadwalKuliahList]);

  // Filtered by status (all / overload / ideal / underload)
  const displayBebanData = useMemo(() => {
    if (filterStatus === 'all') return bebanData;
    if (filterStatus === 'overload') return bebanData.filter(d => d.statusBeban === 'Overload');
    if (filterStatus === 'ideal') return bebanData.filter(d => d.statusBeban === 'Ideal');
    if (filterStatus === 'underload') return bebanData.filter(d => d.statusBeban === 'Underload');
    return bebanData;
  }, [bebanData, filterStatus]);

  // Aggregate Metrics
  const totalDosen = bebanData.length;
  const overloadCount = bebanData.filter(d => d.statusBeban === 'Overload').length;
  const idealCount = bebanData.filter(d => d.statusBeban === 'Ideal').length;
  const underloadCount = bebanData.filter(d => d.statusBeban === 'Underload').length;

  const rataRataSks = totalDosen > 0 
    ? (bebanData.reduce((sum, d) => sum + d.sks, 0) / totalDosen).toFixed(1)
    : '0';

  // Pie chart data
  const pieData = [
    { name: 'Ideal (12-16 SKS)', value: idealCount, color: '#10b981' },
    { name: 'Overload (>16 SKS)', value: overloadCount, color: '#ef4444' },
    { name: 'Underload (<12 SKS)', value: underloadCount, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  // Custom Tooltip
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DosenBebanData = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs animate-in fade-in">
          <div className="font-bold text-white text-sm">{data.namaLengkap}</div>
          <div className="text-slate-400 font-mono text-[11px] mt-0.5">
            NIDN: {data.nidn} &bull; {data.jabatanFungsional}
          </div>
          
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Total Beban Mengajar:</span>
            <span className="font-extrabold text-base font-mono" style={{ color: data.color }}>
              {data.sks} SKS
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Status Beban:</span>
            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
              data.statusBeban === 'Overload' 
                ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                : data.statusBeban === 'Ideal'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {data.statusBeban === 'Overload' ? '⚠️ Overload (>16 SKS)' : data.statusBeban === 'Ideal' ? '✓ Ideal (12-16 SKS)' : '⚡ Underload (<12 SKS)'}
            </span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[10.5px]">
            <span className="text-slate-400 block mb-0.5">Mata Kuliah Diampu ({data.kelasCount} Kelas):</span>
            <ul className="text-slate-300 list-disc list-inside space-y-0.5 line-clamp-3">
              {data.matakuliahNames.map((mk, i) => (
                <li key={i} className="truncate">{mk}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/40">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-blue-600 text-white shadow-2xs">
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Distribusi &amp; Analisis Beban Mengajar Dosen
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                Standar BKD 12 - 16 SKS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pemantauan dosen beban berlebih (*Overload*) dan kurang (*Underload*) untuk optimasi alokasi penguji Seminar KP &amp; Sidang TA
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Chart Toggle: Bar vs Donut */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-white text-blue-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grafik Batang Distribusi Beban"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('pie')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'pie' ? 'bg-white text-blue-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grafik Lingkaran Proporsi Beban"
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Expand/Collapse Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title={isExpanded ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Rata-rata SKS */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Rata-rata Beban
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {rataRataSks}
                </span>
                <span className="text-xs text-slate-500 font-medium">SKS / Dosen</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Total {totalDosen} Dosen Tetap
              </span>
            </div>

            {/* Card 2: Beban Ideal */}
            <div 
              onClick={() => setFilterStatus(filterStatus === 'ideal' ? 'all' : 'ideal')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                filterStatus === 'ideal' ? 'bg-emerald-100/70 border-emerald-500 ring-2 ring-emerald-400' : 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Ideal (12 - 16 SKS)
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                  {idealCount}
                </span>
                <span className="text-xs text-emerald-800 font-medium">
                  ({totalDosen > 0 ? Math.round((idealCount / totalDosen) * 100) : 0}%)
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                ✓ Sesuai Standar BKD Nasional
              </span>
            </div>

            {/* Card 3: Overload */}
            <div 
              onClick={() => setFilterStatus(filterStatus === 'overload' ? 'all' : 'overload')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                filterStatus === 'overload' ? 'bg-red-100/70 border-red-500 ring-2 ring-red-400' : 'bg-red-50/60 border-red-200 hover:bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-900">
                  Overload (&gt; 16 SKS)
                </span>
                <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-black text-red-700 font-mono">
                  {overloadCount}
                </span>
                <span className="text-xs text-red-800 font-medium">
                  ({totalDosen > 0 ? Math.round((overloadCount / totalDosen) * 100) : 0}%)
                </span>
              </div>
              <span className="text-[10px] text-red-700 font-medium mt-1 block">
                ⚠️ Batasi Jadwal Sidang Beruntun
              </span>
            </div>

            {/* Card 4: Underload */}
            <div 
              onClick={() => setFilterStatus(filterStatus === 'underload' ? 'all' : 'underload')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                filterStatus === 'underload' ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-400' : 'bg-amber-50/60 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  Underload (&lt; 12 SKS)
                </span>
                <TrendingDown className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
                  {underloadCount}
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  ({totalDosen > 0 ? Math.round((underloadCount / totalDosen) * 100) : 0}%)
                </span>
              </div>
              <span className="text-[10px] text-amber-800 font-medium mt-1 block">
                ⚡ Prioritas Ditugaskan Penguji TA
              </span>
            </div>
          </div>

          {/* Filter Status Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1 text-[11px] mr-1">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Filter Tampilan:</span>
              </span>
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({bebanData.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('ideal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'ideal'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <span>Ideal (12-16 SKS)</span>
                <span className="text-[10px] font-mono px-1 rounded bg-white/30">{idealCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('overload')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'overload'
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                }`}
              >
                <span>Overload (&gt;16 SKS)</span>
                <span className="text-[10px] font-mono px-1 rounded bg-white/30">{overloadCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('underload')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  filterStatus === 'underload'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>Underload (&lt;12 SKS)</span>
                <span className="text-[10px] font-mono px-1 rounded bg-white/30">{underloadCount}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Ideal (12-16)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span>Overload (&gt;16)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Underload (&lt;12)</span>
              </span>
            </div>
          </div>

          {/* Chart Rendering Area */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 sm:p-4">
            {chartType === 'bar' ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={displayBebanData}
                    margin={{ top: 20, right: 15, left: -10, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.6} />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      domain={[0, 24]}
                      ticks={[0, 4, 8, 12, 16, 20, 24]}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      label={{ 
                        value: 'Beban SKS Mengajar', 
                        angle: -90, 
                        position: 'insideLeft', 
                        fontSize: 10, 
                        fill: '#64748b',
                        offset: 15
                      }}
                    />
                    <Tooltip content={<CustomBarTooltip />} />

                    {/* Minimum and Maximum Ideal Load Reference Lines */}
                    <ReferenceLine
                      y={12}
                      stroke="#d97706"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Min Ideal: 12 SKS',
                        position: 'insideTopLeft',
                        fill: '#b45309',
                        fontSize: 10,
                        fontWeight: 'bold'
                      }}
                    />
                    <ReferenceLine
                      y={16}
                      stroke="#dc2626"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Maks Ideal: 16 SKS',
                        position: 'insideTopLeft',
                        fill: '#b91c1c',
                        fontSize: 10,
                        fontWeight: 'bold'
                      }}
                    />

                    <Bar dataKey="sks" radius={[6, 6, 0, 0]} maxBarSize={45}>
                      {displayBebanData.map((entry) => (
                        <Cell 
                          key={entry.id} 
                          fill={entry.color} 
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* Donut Proportion View */
              <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 py-2">
                <div className="md:col-span-6 h-64 flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="md:col-span-6 space-y-3 text-xs pr-2">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between font-bold text-emerald-950">
                      <span>Dosen Beban Ideal (12 - 16 SKS)</span>
                      <span>{idealCount} Orang</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Memenuhi rasio Tridharma ideal. Siap ditugaskan sebagai pembimbing dan penguji sidang secara merata.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-center justify-between font-bold text-red-950">
                      <span>Dosen Overload (&gt; 16 SKS)</span>
                      <span>{overloadCount} Orang</span>
                    </div>
                    <p className="text-[11px] text-red-800 mt-0.5">
                      Beban mengajar tinggi. Hindari penjadwalan lebih dari 3 sesi sidang per hari untuk mencegah kejenuhan akademik.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center justify-between font-bold text-amber-950">
                      <span>Dosen Underload (&lt; 12 SKS)</span>
                      <span>{underloadCount} Orang</span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Memiliki kuota waktu lebih banyak. Direkomendasikan sebagai ketua dewan sidang atau pembahas seminar KP.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Practical Kaprodi Advisory Box */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 leading-relaxed text-blue-950">
              <strong>Rekomendasi Penjadwalan Sidang untuk Kaprodi:</strong>
              <p className="text-[11px] text-blue-900 mt-0.5">
                Gunakan korelasi antara grafik beban mengajar di atas dengan <strong>Tabel Kesesuaian Jadwal Dosen</strong> di bawah. Dosen berstatus <em>Underload</em> ({underloadCount} dosen) yang memiliki ketersediaan penuh (✔) diprioritaskan mengisi posisi Dosen Penguji 1 &amp; Penguji 2 untuk menyeimbangkan beban BKD semester ini.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
