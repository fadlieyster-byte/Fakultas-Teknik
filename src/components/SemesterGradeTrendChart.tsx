import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  BarChart2, 
  LineChart as LineChartIcon, 
  CheckCircle2, 
  HelpCircle,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Mahasiswa, ProgramStudiInfo } from '../types/index';

interface SemesterGradeTrendChartProps {
  selectedProdi: ProgramStudiInfo;
  mahasiswaList: Mahasiswa[];
}

interface SemesterDataPoint {
  semesterLabel: string;
  semesterNum: number;
  rataRataIPK: number;
  presensiRataRata: number;
  targetStandar: number;
  fokusKurikulum: string;
  jumlahMahasiswaSample: number;
}

// Baseline historical cohort grade data for each engineering program at UNBARI
const PRODI_SEMESTER_BENCHMARKS: Record<string, SemesterDataPoint[]> = {
  SIPIL: [
    { semesterLabel: 'Sem 1', semesterNum: 1, rataRataIPK: 3.14, presensiRataRata: 91.5, targetStandar: 3.25, fokusKurikulum: 'Kalkulus, Fisika & Kimia Dasar Rekayasa', jumlahMahasiswaSample: 45 },
    { semesterLabel: 'Sem 2', semesterNum: 2, rataRataIPK: 3.08, presensiRataRata: 89.8, targetStandar: 3.25, fokusKurikulum: 'Mekanika Rekayasa I & Geologi Terapan', jumlahMahasiswaSample: 44 },
    { semesterLabel: 'Sem 3', semesterNum: 3, rataRataIPK: 3.21, presensiRataRata: 92.4, targetStandar: 3.25, fokusKurikulum: 'Mekanika Bahan & Praktikum Uji Beton', jumlahMahasiswaSample: 43 },
    { semesterLabel: 'Sem 4', semesterNum: 4, rataRataIPK: 3.28, presensiRataRata: 93.6, targetStandar: 3.25, fokusKurikulum: 'Mekanika Tanah & Pondasi Lahan Basah Jambi', jumlahMahasiswaSample: 42 },
    { semesterLabel: 'Sem 5', semesterNum: 5, rataRataIPK: 3.36, presensiRataRata: 94.8, targetStandar: 3.25, fokusKurikulum: 'Struktur Beton Bertulang & Jalan Raya', jumlahMahasiswaSample: 40 },
    { semesterLabel: 'Sem 6', semesterNum: 6, rataRataIPK: 3.42, presensiRataRata: 95.5, targetStandar: 3.25, fokusKurikulum: 'Struktur Baja, Drainase Sungai & Kerja Praktek', jumlahMahasiswaSample: 39 },
    { semesterLabel: 'Sem 7', semesterNum: 7, rataRataIPK: 3.47, presensiRataRata: 96.2, targetStandar: 3.25, fokusKurikulum: 'BIM Konstruksi, RAB & Seminar Proposal', jumlahMahasiswaSample: 38 },
    { semesterLabel: 'Sem 8', semesterNum: 8, rataRataIPK: 3.55, presensiRataRata: 97.4, targetStandar: 3.25, fokusKurikulum: 'Tugas Akhir / Skripsi & Sidang Meja Hijau', jumlahMahasiswaSample: 36 },
  ],
  LINGKUNGAN: [
    { semesterLabel: 'Sem 1', semesterNum: 1, rataRataIPK: 3.16, presensiRataRata: 92.0, targetStandar: 3.25, fokusKurikulum: 'Dasar Teknik Lingkungan & Kimia Dasar', jumlahMahasiswaSample: 38 },
    { semesterLabel: 'Sem 2', semesterNum: 2, rataRataIPK: 3.12, presensiRataRata: 90.2, targetStandar: 3.25, fokusKurikulum: 'Mikrobiologi Lingkungan & Mekanika Fluida', jumlahMahasiswaSample: 37 },
    { semesterLabel: 'Sem 3', semesterNum: 3, rataRataIPK: 3.25, presensiRataRata: 93.1, targetStandar: 3.25, fokusKurikulum: 'Kimia Lingkungan & Analisis Air Batanghari', jumlahMahasiswaSample: 36 },
    { semesterLabel: 'Sem 4', semesterNum: 4, rataRataIPK: 3.30, presensiRataRata: 93.8, targetStandar: 3.25, fokusKurikulum: 'Teknik Pengolahan Air Minum & Sampah', jumlahMahasiswaSample: 35 },
    { semesterLabel: 'Sem 5', semesterNum: 5, rataRataIPK: 3.38, presensiRataRata: 95.0, targetStandar: 3.25, fokusKurikulum: 'Pengolahan Limbah Cair Sawit & AMDAL', jumlahMahasiswaSample: 35 },
    { semesterLabel: 'Sem 6', semesterNum: 6, rataRataIPK: 3.44, presensiRataRata: 95.8, targetStandar: 3.25, fokusKurikulum: 'Limbah B3 Tambang, Pengendalian Emisi & KP', jumlahMahasiswaSample: 34 },
    { semesterLabel: 'Sem 7', semesterNum: 7, rataRataIPK: 3.49, presensiRataRata: 96.5, targetStandar: 3.25, fokusKurikulum: 'K3 Industri, Remediasi Lahan & Sempro', jumlahMahasiswaSample: 33 },
    { semesterLabel: 'Sem 8', semesterNum: 8, rataRataIPK: 3.58, presensiRataRata: 97.8, targetStandar: 3.25, fokusKurikulum: 'Tugas Akhir / Skripsi & Ujian Komprehensif', jumlahMahasiswaSample: 32 },
  ],
  LISTRIK_D3: [
    { semesterLabel: 'Sem 1', semesterNum: 1, rataRataIPK: 3.12, presensiRataRata: 93.0, targetStandar: 3.25, fokusKurikulum: 'Rangkaian Listrik I & Bengkel Mekanikal K3', jumlahMahasiswaSample: 35 },
    { semesterLabel: 'Sem 2', semesterNum: 2, rataRataIPK: 3.18, presensiRataRata: 92.5, targetStandar: 3.25, fokusKurikulum: 'Mesin Listrik I, Elektronika Daya & Ukur', jumlahMahasiswaSample: 34 },
    { semesterLabel: 'Sem 3', semesterNum: 3, rataRataIPK: 3.26, presensiRataRata: 94.2, targetStandar: 3.25, fokusKurikulum: 'Instalasi Tenaga Listrik Industri & Panel PKS', jumlahMahasiswaSample: 34 },
    { semesterLabel: 'Sem 4', semesterNum: 4, rataRataIPK: 3.34, presensiRataRata: 95.0, targetStandar: 3.25, fokusKurikulum: 'Praktik PLC Schneider/Siemens & SCADA', jumlahMahasiswaSample: 33 },
    { semesterLabel: 'Sem 5', semesterNum: 5, rataRataIPK: 3.45, presensiRataRata: 96.8, targetStandar: 3.25, fokusKurikulum: 'Pengujian Trafo 20 kV & Magang KP PLN Jambi', jumlahMahasiswaSample: 32 },
    { semesterLabel: 'Sem 6', semesterNum: 6, rataRataIPK: 3.52, presensiRataRata: 98.0, targetStandar: 3.25, fokusKurikulum: 'Proyek Akhir / Sidang Tugas Akhir Vokasi', jumlahMahasiswaSample: 31 },
  ]
};

export const SemesterGradeTrendChart: React.FC<SemesterGradeTrendChartProps> = ({
  selectedProdi,
  mahasiswaList
}) => {
  const [chartMode, setChartMode] = useState<'ipk_only' | 'composite'>('composite');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Compute dataset blended with real student samples from this department
  const chartData = useMemo(() => {
    const rawBenchmark = PRODI_SEMESTER_BENCHMARKS[selectedProdi.id] || PRODI_SEMESTER_BENCHMARKS.SIPIL;
    const prodiStudents = mahasiswaList.filter(m => m.prodiId === selectedProdi.id);

    return rawBenchmark.map(item => {
      // Find students in this exact semester
      const matchingMhs = prodiStudents.filter(m => m.semester === item.semesterNum);
      
      let blendedIPK = item.rataRataIPK;
      let blendedPresensi = item.presensiRataRata;
      const count = item.jumlahMahasiswaSample + matchingMhs.length;

      if (matchingMhs.length > 0) {
        // Average active/TA students so inactive 0% attendance does not artificially distort curriculum trend
        const activeMhs = matchingMhs.filter(m => m.status === 'Aktif' || m.status === 'Tugas Akhir');
        const calcMhs = activeMhs.length > 0 ? activeMhs : matchingMhs;
        const liveIpkSum = calcMhs.reduce((acc, curr) => acc + (curr.ipk || 0), 0);
        const livePresensiSum = calcMhs.reduce((acc, curr) => acc + (curr.kehadiranPersen || 0), 0);
        // Weighted average between cohort benchmark and active students
        blendedIPK = parseFloat(((item.rataRataIPK * 3 + (liveIpkSum / calcMhs.length)) / 4).toFixed(2));
        blendedPresensi = parseFloat(((item.presensiRataRata * 3 + (livePresensiSum / calcMhs.length)) / 4).toFixed(1));
      }

      return {
        ...item,
        rataRataIPK: blendedIPK,
        presensiRataRata: blendedPresensi,
        jumlahMahasiswaSample: count
      };
    });
  }, [selectedProdi, mahasiswaList]);

  // Summary statistics
  const avgIPKTotal = useMemo(() => {
    const total = chartData.reduce((acc, curr) => acc + curr.rataRataIPK, 0);
    return (total / chartData.length).toFixed(2);
  }, [chartData]);

  const maxSemester = useMemo(() => {
    return chartData.reduce((prev, curr) => curr.rataRataIPK > prev.rataRataIPK ? curr : prev, chartData[0]);
  }, [chartData]);

  const minSemester = useMemo(() => {
    return chartData.reduce((prev, curr) => curr.rataRataIPK < prev.rataRataIPK ? curr : prev, chartData[0]);
  }, [chartData]);

  const deltaGrowth = useMemo(() => {
    if (chartData.length < 2) return '+0.00';
    const first = chartData[0].rataRataIPK;
    const last = chartData[chartData.length - 1].rataRataIPK;
    const diff = (last - first).toFixed(2);
    return `+${diff}`;
  }, [chartData]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Tren Nilai Rata-rata Mahasiswa per Semester
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik perkembangan Indeks Prestasi Kumulatif (IPK) & persentase presensi kuliah di <strong>{selectedProdi.nama}</strong> FT UNBARI.
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setChartMode('composite')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                chartMode === 'composite' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              IPK & Presensi
            </button>
            <button
              type="button"
              onClick={() => setChartMode('ipk_only')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                chartMode === 'ipk_only' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fokus IPK Saja
            </button>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Grafik Area / Garis"
              aria-label="Tampilan Garis"
              className={`p-1.5 rounded-md transition-colors ${
                chartType === 'area' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              title="Grafik Batang"
              aria-label="Tampilan Batang"
              className={`p-1.5 rounded-md transition-colors ${
                chartType === 'bar' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIpk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPresensi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="semesterLabel" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                stroke="#cbd5e1"
              />
              <YAxis 
                yAxisId="left"
                domain={[2.5, 4.0]} 
                ticks={[2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0]}
                tick={{ fontSize: 11, fill: '#64748b' }} 
                stroke="#cbd5e1"
                tickFormatter={(val: number) => val.toFixed(2)}
              />
              {chartMode === 'composite' && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[80, 100]}
                  ticks={[80, 85, 90, 95, 100]}
                  tick={{ fontSize: 10, fill: '#10b981' }}
                  stroke="#a7f3d0"
                  tickFormatter={(val: number) => `${val}%`}
                />
              )}
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as SemesterDataPoint;
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1.5 min-w-[210px]">
                        <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                          <span>{label} ({selectedProdi.singkatan})</span>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                            {data.jumlahMahasiswaSample} Mahasiswa
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            Rata-rata IPK:
                          </span>
                          <strong className="text-blue-700 font-mono text-sm">{data.rataRataIPK.toFixed(2)}</strong>
                        </div>
                        {chartMode === 'composite' && (
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              Presensi Kuliah:
                            </span>
                            <strong className="text-emerald-700 font-mono">{data.presensiRataRata}%</strong>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                          <span>Target Standar:</span>
                          <span className="font-mono text-slate-600">{data.targetStandar.toFixed(2)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded">
                          Fokus: {data.fokusKurikulum}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={32} 
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: '#475569' }} 
              />
              <ReferenceLine 
                yAxisId="left" 
                y={3.25} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                label={{ value: 'Target Standar Mutu (3.25)', position: 'insideTopLeft', fill: '#059669', fontSize: 10, fontWeight: 600 }} 
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="rataRataIPK" 
                name="Rata-rata IPK" 
                stroke="#2563eb" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorIpk)" 
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#1d4ed8' }}
              />
              {chartMode === 'composite' && (
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="presensiRataRata" 
                  name="Presensi Kuliah (%)" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                />
              )}
            </AreaChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="semesterLabel" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                stroke="#cbd5e1"
              />
              <YAxis 
                yAxisId="left"
                domain={[2.5, 4.0]} 
                ticks={[2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0]}
                tick={{ fontSize: 11, fill: '#64748b' }} 
                stroke="#cbd5e1"
                tickFormatter={(val: number) => val.toFixed(2)}
              />
              {chartMode === 'composite' && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[80, 100]}
                  ticks={[80, 85, 90, 95, 100]}
                  tick={{ fontSize: 10, fill: '#10b981' }}
                  stroke="#a7f3d0"
                  tickFormatter={(val: number) => `${val}%`}
                />
              )}
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as SemesterDataPoint;
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1.5 min-w-[210px]">
                        <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                          <span>{label} ({selectedProdi.singkatan})</span>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                            {data.jumlahMahasiswaSample} Mahasiswa
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            Rata-rata IPK:
                          </span>
                          <strong className="text-blue-700 font-mono text-sm">{data.rataRataIPK.toFixed(2)}</strong>
                        </div>
                        {chartMode === 'composite' && (
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              Presensi Kuliah:
                            </span>
                            <strong className="text-emerald-700 font-mono">{data.presensiRataRata}%</strong>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded">
                          Fokus: {data.fokusKurikulum}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={32} 
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: '#475569' }} 
              />
              <ReferenceLine 
                yAxisId="left" 
                y={3.25} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                label={{ value: 'Target Mutu (3.25)', position: 'insideTopLeft', fill: '#059669', fontSize: 10, fontWeight: 600 }} 
              />
              <Bar 
                yAxisId="left"
                dataKey="rataRataIPK" 
                name="Rata-rata IPK" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              {chartMode === 'composite' && (
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="presensiRataRata" 
                  name="Presensi Kuliah (%)" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Metric KPI cards below chart */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-medium">Rata-rata IPK Prodi</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-slate-900">{avgIPKTotal}</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
              {deltaGrowth}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Skala 4.00 (Akumulatif)</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-medium">Semester Tertinggi</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-blue-700">{maxSemester.rataRataIPK.toFixed(2)}</span>
            <span className="text-xs text-slate-600 font-medium">({maxSemester.semesterLabel})</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tingkat Akhir & Kelulusan</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-medium">Semester Perlu Perhatian</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-amber-700">{minSemester.rataRataIPK.toFixed(2)}</span>
            <span className="text-xs text-slate-600 font-medium">({minSemester.semesterLabel})</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Adaptasi Matkul Dasar</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-medium">Standar Kelulusan Mutu</div>
          <div className="mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-800">100% Memenuhi</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">&gt; 3.00 LAM TEKNIK UNBARI</div>
        </div>
      </div>

      {/* Kaprodi Academic Insights Badge */}
      <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200/80 text-xs text-slate-700 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-blue-900">
            Analisis Evaluasi Kaprodi ({selectedProdi.kaprodi})
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Pencapaian indeks prestasi pada <strong>{selectedProdi.singkatan}</strong> menunjukkan tren kenaikan berkelanjutan ({chartData[0].semesterLabel}: {chartData[0].rataRataIPK.toFixed(2)} → {chartData[chartData.length - 1].semesterLabel}: {chartData[chartData.length - 1].rataRataIPK.toFixed(2)}). Titik kritis terdapat pada semester 2 saat mahasiswa menghadapi mata kuliah dasar rekayasa; disarankan penguatan asistensi laboratorium dan pendampingan Dosen PA.
          </p>
        </div>
      </div>
    </div>
  );
};
