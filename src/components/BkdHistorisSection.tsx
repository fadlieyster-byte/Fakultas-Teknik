import React, { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { BkdLldiktiDosenMetric } from './BkdLldiktiPdfModal';
import {
  BKD_HISTORICAL_SEMESTERS,
  ConsistencyStatus,
  DosenHistoricalSksSeries,
  buildBkdHistoricalReport
} from '../utils/bkdHistorisHelper';

interface BkdHistorisSectionProps {
  dosenWorkloadMetrics: BkdLldiktiDosenMetric[];
  calculationMode: 'bkd_total' | 'tatap_muka';
  prodiLabel: string;
  onShowToast?: (msg: string) => void;
}

const LINE_PALETTE = [
  '#2563eb', // Royal Blue
  '#dc2626', // Crimson
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed'  // Violet
];

const MAX_SELECTED_LINES = 5;

function getConsistencyStyle(status: ConsistencyStatus) {
  if (status === 'Sangat Konsisten') {
    return {
      textClass: 'text-emerald-700',
      Icon: CheckCircle2
    };
  }
  if (status === 'Fluktuasi Moderat') {
    return {
      textClass: 'text-amber-700',
      Icon: AlertTriangle
    };
  }
  return {
    textClass: 'text-rose-700',
    Icon: AlertCircle
  };
}

export const BkdHistorisSection: React.FC<BkdHistorisSectionProps> = ({
  dosenWorkloadMetrics,
  calculationMode,
  prodiLabel,
  onShowToast
}) => {
  const [viewMode, setViewMode] = useState<'per_dosen' | 'agregat_prodi'>('per_dosen');
  const [consistencyFilter, setConsistencyFilter] = useState<'ALL' | ConsistencyStatus>('ALL');
  const [showProdiMeanLine, setShowProdiMeanLine] = useState<boolean>(true);
  const [selectedDosenIds, setSelectedDosenIds] = useState<string[]>([]);

  const historicalReport = useMemo(
    () => buildBkdHistoricalReport(dosenWorkloadMetrics, calculationMode),
    [dosenWorkloadMetrics, calculationMode]
  );

  // Pick a balanced default set of up to 4 lecturers (most volatile + lowest/consistent) when scope changes
  const defaultSelectedIds = useMemo(() => {
    const series = historicalReport.dosenSeries;
    if (series.length === 0) return [];
    if (series.length <= 4) return series.map(s => s.dosenId);

    const byVolatilityDesc = [...series].sort(
      (a, b) => b.rentangFluktuasi - a.rentangFluktuasi || b.rataRata3Tahun - a.rataRata3Tahun
    );
    const chosen: string[] = [];
    // Take top 2 most volatile, median, and most consistent
    chosen.push(byVolatilityDesc[0].dosenId);
    if (byVolatilityDesc[1]) chosen.push(byVolatilityDesc[1].dosenId);
    const midIdx = Math.floor(byVolatilityDesc.length / 2);
    if (!chosen.includes(byVolatilityDesc[midIdx].dosenId)) {
      chosen.push(byVolatilityDesc[midIdx].dosenId);
    }
    const lastItem = byVolatilityDesc[byVolatilityDesc.length - 1];
    if (lastItem && !chosen.includes(lastItem.dosenId)) {
      chosen.push(lastItem.dosenId);
    }
    return chosen.slice(0, 4);
  }, [historicalReport.dosenSeries]);

  useEffect(() => {
    setSelectedDosenIds(defaultSelectedIds);
  }, [defaultSelectedIds]);

  const filteredDosenSeries = useMemo(() => {
    const base =
      consistencyFilter === 'ALL'
        ? historicalReport.dosenSeries
        : historicalReport.dosenSeries.filter(d => d.statusKonsistensi === consistencyFilter);
    return [...base].sort(
      (a, b) => b.rentangFluktuasi - a.rentangFluktuasi || b.rataRata3Tahun - a.rataRata3Tahun
    );
  }, [historicalReport.dosenSeries, consistencyFilter]);

  const activeLineSeries: DosenHistoricalSksSeries[] = useMemo(() => {
    const selectedSet = new Set(selectedDosenIds);
    return historicalReport.dosenSeries.filter(d => selectedSet.has(d.dosenId));
  }, [historicalReport.dosenSeries, selectedDosenIds]);

  const yDomainMax = useMemo(() => {
    const allMax = historicalReport.dosenSeries.reduce((mx, d) => Math.max(mx, d.maxSks), 18);
    return Math.max(20, Math.ceil(allMax + 2));
  }, [historicalReport.dosenSeries]);

  const handleToggleDosenLine = (dosenId: string) => {
    setSelectedDosenIds(prev => {
      if (prev.includes(dosenId)) {
        if (prev.length === 1) return prev; // Keep at least 1 visible line
        return prev.filter(id => id !== dosenId);
      }
      if (prev.length >= MAX_SELECTED_LINES) {
        return [...prev.slice(1), dosenId];
      }
      return [...prev, dosenId];
    });
    if (viewMode !== 'per_dosen') {
      setViewMode('per_dosen');
    }
  };

  const handleFocusTopVolatile = () => {
    const topIds = [...historicalReport.dosenSeries]
      .sort((a, b) => b.rentangFluktuasi - a.rentangFluktuasi || b.standarDeviasi - a.standarDeviasi)
      .slice(0, 4)
      .map(d => d.dosenId);
    setSelectedDosenIds(topIds);
    setViewMode('per_dosen');
    if (onShowToast) {
      onShowToast('Menampilkan 4 dosen dengan fluktuasi beban SKS tertinggi dalam 3 tahun terakhir.');
    }
  };

  const handleResetSelection = () => {
    setSelectedDosenIds(defaultSelectedIds);
    setConsistencyFilter('ALL');
    setShowProdiMeanLine(true);
    setViewMode('per_dosen');
  };

  const handleExportHistoricalCsv = () => {
    const header = [
      'NIDN',
      'Nama Dosen',
      'Jabatan Fungsional',
      ...BKD_HISTORICAL_SEMESTERS.map(s => s.fullLabel),
      'Rerata 3 Tahun (SKS)',
      'Min (SKS)',
      'Max (SKS)',
      'Rentang Fluktuasi (SKS)',
      'Std Deviasi',
      'Semester Di Luar 12-16 SKS',
      'Status Konsistensi'
    ];

    const rows = historicalReport.dosenSeries.map(d =>
      [
        d.nidn,
        `"${d.namaLengkap}"`,
        `"${d.jabatanFungsional}"`,
        ...BKD_HISTORICAL_SEMESTERS.map(s => d.semesterValues[s.key].toFixed(1)),
        d.rataRata3Tahun.toFixed(1),
        d.minSks.toFixed(1),
        d.maxSks.toFixed(1),
        d.rentangFluktuasi.toFixed(1),
        d.standarDeviasi.toFixed(2),
        d.jumlahSemesterPelanggaran,
        `"${d.statusKonsistensi}"`
      ].join(',')
    );

    const csv = [
      `Laporan Beban Kerja Historis 3 Tahun Terakhir - ${prodiLabel}`,
      `Basis Perhitungan,${calculationMode === 'bkd_total' ? 'BKD Total (Kuliah + Bimbingan TA)' : 'Tatap Muka Kuliah'}`,
      '',
      header.join(','),
      ...rows
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Beban_Kerja_Historis_3Tahun_${prodiLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast('Rekap fluktuasi Beban Kerja Historis 3 tahun terakhir diunduh (CSV).');
    }
  };

  if (dosenWorkloadMetrics.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Visualisasi Beban Kerja Historis 3 Tahun Terakhir"
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700 mt-0.5 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Beban Kerja Historis (3 Tahun Terakhir)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>{prodiLabel}</span>
              <span aria-hidden="true">·</span>
              <span>6 Semester (Genap 2023/2024 – Ganjil 2026/2027)</span>
              <span aria-hidden="true">·</span>
              <span>
                Basis: {calculationMode === 'bkd_total' ? 'BKD Total (Kuliah + Bimbingan TA)' : 'Tatap Muka Kuliah'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('per_dosen')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'per_dosen'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Komparasi Dosen ({activeLineSeries.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agregat_prodi')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'agregat_prodi'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rerata &amp; Rentang Prodi
            </button>
          </div>

          <button
            type="button"
            onClick={handleFocusTopVolatile}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sorot Fluktuasi Tertinggi
          </button>

          <button
            type="button"
            onClick={handleResetSelection}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Kembalikan pilihan garis dosen awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleExportHistoricalCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Consistency KPI Strip (Hairline Divide-X) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <div className="p-3.5">
            <div className="text-[11px] font-medium text-slate-500">
              Rerata SKS 3 Tahun
            </div>
            <div className="mt-0.5 text-lg font-bold text-slate-900 font-mono tabular-nums">
              {historicalReport.avg3TahunProdi} SKS
            </div>
            <div className="text-[11px] text-slate-500">
              Rentang ideal LLDIKTI 12–16 SKS
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[11px] font-medium text-slate-500">
              Rerata Fluktuasi (Δ Max–Min)
            </div>
            <div className="mt-0.5 text-lg font-bold text-slate-900 font-mono tabular-nums">
              ±{historicalReport.avgFluktuasiProdi} SKS
            </div>
            <div className="text-[11px] text-slate-500">
              {historicalReport.mostVolatileDosen
                ? `Tertinggi: ${historicalReport.mostVolatileDosen.namaSingkat} (${historicalReport.mostVolatileDosen.rentangFluktuasi} SKS)`
                : 'Semua dosen stabil'}
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[11px] font-medium text-slate-500">
              Beban Sangat Konsisten
            </div>
            <div className="mt-0.5 text-lg font-bold text-emerald-700 font-mono tabular-nums">
              {historicalReport.konsistenCount} Dosen
            </div>
            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
              Δ ≤ 2.5 SKS · Selalu di zona 12–16
            </div>
          </div>

          <div className="p-3.5">
            <div className="text-[11px] font-medium text-slate-500">
              Fluktuasi Tinggi / Perlu Peninjauan
            </div>
            <div
              className={`mt-0.5 text-lg font-bold font-mono tabular-nums ${
                historicalReport.tinggiCount > 0 ? 'text-rose-700' : 'text-slate-800'
              }`}
            >
              {historicalReport.tinggiCount} Dosen
            </div>
            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
              {historicalReport.moderatCount} dosen fluktuasi moderat
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: LineChart (Left 7 cols) + Lecturer Consistency Selector (Right 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LineChart Container */}
        <div className="xl:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700">
              {viewMode === 'per_dosen'
                ? `Tren Fluktuasi SKS (${activeLineSeries.length} Dosen Terpilih vs Batas 12–16 SKS)`
                : 'Tren Rerata, Batas Atas (Max), & Batas Bawah (Min) SKS Prodi (3 Tahun)'}
            </span>

            {viewMode === 'per_dosen' && (
              <label className="inline-flex items-center gap-1.5 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showProdiMeanLine}
                  onChange={e => setShowProdiMeanLine(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
                />
                <span>Tampilkan Garis Rerata Prodi</span>
              </label>
            )}
          </div>

          <div className="h-[310px] w-full border border-slate-100 rounded-xl p-2 bg-slate-50/30">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart
                data={historicalReport.chartPoints}
                margin={{ top: 14, right: 20, left: -6, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="semesterLabel"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[6, yDomainMax]}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}`}
                  label={{
                    value: 'SKS / Sem',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 16,
                    style: { fontSize: 11, fill: '#64748b' }
                  }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.96)',
                    borderRadius: '0.75rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val: any, name: any) => [`${val} SKS`, name]}
                  labelFormatter={(_, payload) => {
                    const pt = payload?.[0]?.payload;
                    return pt ? pt.fullLabel : '';
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                <ReferenceLine
                  y={12}
                  stroke="#059669"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Min 12 SKS',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideBottomLeft'
                  }}
                />
                <ReferenceLine
                  y={16}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Maks 16 SKS',
                    fill: '#dc2626',
                    fontSize: 10,
                    position: 'insideTopLeft'
                  }}
                />

                {viewMode === 'per_dosen' ? (
                  <>
                    {showProdiMeanLine && (
                      <Line
                        type="monotone"
                        dataKey="rataRataProdi"
                        name="Rerata Prodi"
                        stroke="#475569"
                        strokeWidth={2}
                        strokeDasharray="5 4"
                        dot={{ r: 3, fill: '#475569' }}
                      />
                    )}
                    {activeLineSeries.map((series, idx) => {
                      const color = LINE_PALETTE[idx % LINE_PALETTE.length];
                      return (
                        <Line
                          key={series.dosenId}
                          type="monotone"
                          dataKey={`dosen_${series.dosenId}`}
                          name={series.namaSingkat}
                          stroke={color}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: color, stroke: '#ffffff', strokeWidth: 1.5 }}
                          activeDot={{ r: 6 }}
                        />
                      );
                    })}
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="maxProdi"
                      name="Beban Tertinggi (Max)"
                      stroke="#dc2626"
                      strokeWidth={2.25}
                      dot={{ r: 4, fill: '#dc2626', stroke: '#ffffff', strokeWidth: 1.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rataRataProdi"
                      name="Rerata Prodi"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 4.5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 1.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="minProdi"
                      name="Beban Terendah (Min)"
                      stroke="#d97706"
                      strokeWidth={2.25}
                      dot={{ r: 4, fill: '#d97706', stroke: '#ffffff', strokeWidth: 1.5 }}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Panel: Consistency Audit List & Line Selector */}
        <div className="xl:col-span-5 border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900">
                Tinjauan Konsistensi per Dosen
              </span>
              <span className="text-[11px] font-mono tabular-nums text-slate-500">
                Pilih maks {MAX_SELECTED_LINES} garis
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {([
                { id: 'ALL', label: `Semua (${historicalReport.dosenSeries.length})` },
                { id: 'Fluktuasi Tinggi', label: `Tinggi (${historicalReport.tinggiCount})` },
                { id: 'Fluktuasi Moderat', label: `Moderat (${historicalReport.moderatCount})` },
                { id: 'Sangat Konsisten', label: `Konsisten (${historicalReport.konsistenCount})` }
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setConsistencyFilter(tab.id)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    consistencyFilter === tab.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[268px] overflow-y-auto divide-y divide-slate-100">
            {filteredDosenSeries.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-slate-500">
                Tidak ada dosen dengan kategori konsistensi ini pada cakupan terpilih.
              </div>
            ) : (
              filteredDosenSeries.map(item => {
                const activeIdx = activeLineSeries.findIndex(s => s.dosenId === item.dosenId);
                const isSelected = activeIdx !== -1;
                const lineColor = isSelected ? LINE_PALETTE[activeIdx % LINE_PALETTE.length] : null;
                const cStyle = getConsistencyStyle(item.statusKonsistensi);
                const StatusIcon = cStyle.Icon;

                return (
                  <button
                    key={item.dosenId}
                    type="button"
                    onClick={() => handleToggleDosenLine(item.dosenId)}
                    className={`w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected ? 'bg-blue-50/55 hover:bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="w-3 h-3 rounded-xs shrink-0 border border-slate-300"
                        style={{
                          backgroundColor: lineColor || '#ffffff',
                          borderColor: lineColor || '#cbd5e1'
                        }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {item.namaLengkap}
                        </div>
                        <div className={`text-[11px] font-medium flex items-center gap-1 mt-0.5 ${cStyle.textClass}`}>
                          <StatusIcon className="w-3 h-3 shrink-0" />
                          <span>{item.statusKonsistensi}</span>
                          <span className="text-slate-400" aria-hidden="true">·</span>
                          <span className="text-slate-500 font-mono tabular-nums">
                            {item.minSks.toFixed(1)}–{item.maxSks.toFixed(1)} SKS
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                        {item.rataRata3Tahun.toFixed(1)} SKS
                      </div>
                      <div className="text-[11px] font-mono tabular-nums text-slate-500">
                        Δ {item.rentangFluktuasi.toFixed(1)} SKS
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
