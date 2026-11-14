import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';
import {
  TrendingUp,
  Award,
  Layers,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Printer,
  Sparkles,
  Filter,
  BarChart2,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { ProgramStudiInfo, CplItemObe } from '../types/index';
import { CPL_DEFINITIONS_PRODI } from '../data/mockCplCpmkMatrixData';
import { printDocumentElement } from '../utils/printHelper';
import { DEKAN_FAKULTAS_TEKNIK } from '../data/mockData';

export interface DataCplAngkatan {
  angkatan: number; // e.g. 2021, 2022, 2023, 2024
  labelAngkatan: string; // e.g. "Angkatan 2021 (Tingkat Akhir)"
  semester: string; // e.g. "Semester 7-8"
  totalMahasiswaAktif: number;
  warnaStroke: string;
  warnaFill: string;
  scores: Record<string, number>; // CPL-01 -> score out of 100
}

export const DATA_CPL_ANGKATAN_PRODI: Record<string, DataCplAngkatan[]> = {
  SIPIL: [
    {
      angkatan: 2021,
      labelAngkatan: 'Angkatan 2021 (Tingkat Akhir / Lulusan)',
      semester: 'Semester 7 - 8',
      totalMahasiswaAktif: 48,
      warnaStroke: '#059669', // Emerald
      warnaFill: '#10b981',
      scores: {
        'CPL-01': 88.5,
        'CPL-02': 83.2,
        'CPL-03': 85.8,
        'CPL-04': 87.4,
        'CPL-05': 89.1,
        'CPL-06': 86.5,
        'CPL-07': 84.0,
        'CPL-08': 88.0
      }
    },
    {
      angkatan: 2022,
      labelAngkatan: 'Angkatan 2022 (Tingkat 3 / Madya)',
      semester: 'Semester 5 - 6',
      totalMahasiswaAktif: 54,
      warnaStroke: '#2563eb', // Royal Blue
      warnaFill: '#3b82f6',
      scores: {
        'CPL-01': 85.0,
        'CPL-02': 81.5,
        'CPL-03': 82.4,
        'CPL-04': 84.0,
        'CPL-05': 86.2,
        'CPL-06': 84.8,
        'CPL-07': 81.5,
        'CPL-08': 85.2
      }
    },
    {
      angkatan: 2023,
      labelAngkatan: 'Angkatan 2023 (Tingkat 2 / Muda)',
      semester: 'Semester 3 - 4',
      totalMahasiswaAktif: 58,
      warnaStroke: '#d97706', // Amber
      warnaFill: '#f59e0b',
      scores: {
        'CPL-01': 83.4,
        'CPL-02': 78.6,
        'CPL-03': 79.5,
        'CPL-04': 80.2,
        'CPL-05': 82.0,
        'CPL-06': 81.4,
        'CPL-07': 78.8,
        'CPL-08': 82.5
      }
    },
    {
      angkatan: 2024,
      labelAngkatan: 'Angkatan 2024 (Tingkat 1 / Pratama)',
      semester: 'Semester 1 - 2',
      totalMahasiswaAktif: 62,
      warnaStroke: '#7c3aed', // Purple
      warnaFill: '#8b5cf6',
      scores: {
        'CPL-01': 81.2,
        'CPL-02': 76.5,
        'CPL-03': 77.0,
        'CPL-04': 78.5,
        'CPL-05': 78.0,
        'CPL-06': 76.8,
        'CPL-07': 76.2,
        'CPL-08': 80.0
      }
    }
  ],
  LINGKUNGAN: [
    {
      angkatan: 2021,
      labelAngkatan: 'Angkatan 2021 (Tingkat Akhir)',
      semester: 'Semester 7 - 8',
      totalMahasiswaAktif: 36,
      warnaStroke: '#059669',
      warnaFill: '#10b981',
      scores: {
        'CPL-01': 89.2,
        'CPL-02': 84.0,
        'CPL-03': 86.5,
        'CPL-04': 87.0,
        'CPL-05': 88.4,
        'CPL-06': 85.0,
        'CPL-07': 83.5,
        'CPL-08': 87.2
      }
    },
    {
      angkatan: 2022,
      labelAngkatan: 'Angkatan 2022 (Tingkat 3)',
      semester: 'Semester 5 - 6',
      totalMahasiswaAktif: 40,
      warnaStroke: '#2563eb',
      warnaFill: '#3b82f6',
      scores: {
        'CPL-01': 86.4,
        'CPL-02': 81.8,
        'CPL-03': 83.2,
        'CPL-04': 84.5,
        'CPL-05': 85.0,
        'CPL-06': 82.6,
        'CPL-07': 81.0,
        'CPL-08': 84.5
      }
    },
    {
      angkatan: 2023,
      labelAngkatan: 'Angkatan 2023 (Tingkat 2)',
      semester: 'Semester 3 - 4',
      totalMahasiswaAktif: 44,
      warnaStroke: '#d97706',
      warnaFill: '#f59e0b',
      scores: {
        'CPL-01': 83.5,
        'CPL-02': 79.0,
        'CPL-03': 80.4,
        'CPL-04': 81.2,
        'CPL-05': 81.8,
        'CPL-06': 80.0,
        'CPL-07': 79.2,
        'CPL-08': 82.0
      }
    },
    {
      angkatan: 2024,
      labelAngkatan: 'Angkatan 2024 (Tingkat 1)',
      semester: 'Semester 1 - 2',
      totalMahasiswaAktif: 46,
      warnaStroke: '#7c3aed',
      warnaFill: '#8b5cf6',
      scores: {
        'CPL-01': 80.8,
        'CPL-02': 77.2,
        'CPL-03': 77.8,
        'CPL-04': 78.6,
        'CPL-05': 77.5,
        'CPL-06': 76.9,
        'CPL-07': 76.0,
        'CPL-08': 79.5
      }
    }
  ],
  LISTRIK_D3: [
    {
      angkatan: 2022,
      labelAngkatan: 'Angkatan 2022 (Tingkat Akhir D3)',
      semester: 'Semester 5 - 6',
      totalMahasiswaAktif: 38,
      warnaStroke: '#059669',
      warnaFill: '#10b981',
      scores: {
        'CPL-01': 90.5,
        'CPL-02': 84.8,
        'CPL-03': 88.2,
        'CPL-04': 86.4,
        'CPL-05': 89.0,
        'CPL-06': 85.2,
        'CPL-07': 82.5,
        'CPL-08': 88.6
      }
    },
    {
      angkatan: 2023,
      labelAngkatan: 'Angkatan 2023 (Tingkat 2 D3)',
      semester: 'Semester 3 - 4',
      totalMahasiswaAktif: 42,
      warnaStroke: '#2563eb',
      warnaFill: '#3b82f6',
      scores: {
        'CPL-01': 87.0,
        'CPL-02': 81.2,
        'CPL-03': 84.5,
        'CPL-04': 83.0,
        'CPL-05': 85.4,
        'CPL-06': 82.0,
        'CPL-07': 80.0,
        'CPL-08': 85.0
      }
    },
    {
      angkatan: 2024,
      labelAngkatan: 'Angkatan 2024 (Tingkat 1 D3)',
      semester: 'Semester 1 - 2',
      totalMahasiswaAktif: 45,
      warnaStroke: '#d97706',
      warnaFill: '#f59e0b',
      scores: {
        'CPL-01': 84.2,
        'CPL-02': 78.5,
        'CPL-03': 80.0,
        'CPL-04': 79.2,
        'CPL-05': 81.0,
        'CPL-06': 78.4,
        'CPL-07': 76.8,
        'CPL-08': 81.5
      }
    }
  ]
};

interface CplSpiderChartAngkatanViewProps {
  selectedProdi: ProgramStudiInfo;
  onShowToast?: (msg: string) => void;
}

export const CplSpiderChartAngkatanView: React.FC<CplSpiderChartAngkatanViewProps> = ({
  selectedProdi,
  onShowToast
}) => {
  const currentProdiId = selectedProdi.id;

  // Active CPL definitions
  const activeCpls: CplItemObe[] = useMemo(() => {
    return CPL_DEFINITIONS_PRODI[currentProdiId] || CPL_DEFINITIONS_PRODI.SIPIL;
  }, [currentProdiId]);

  // Raw Cohort Data for current prodi
  const cohortList = useMemo(() => {
    return DATA_CPL_ANGKATAN_PRODI[currentProdiId] || DATA_CPL_ANGKATAN_PRODI.SIPIL;
  }, [currentProdiId]);

  // Selected Cohorts to display in Radar
  const [selectedCohortYears, setSelectedCohortYears] = useState<number[]>(() => {
    return cohortList.map(c => c.angkatan);
  });

  // Display target line in radar
  const [showTargetLine, setShowTargetLine] = useState(true);

  // Selected CPL for focused detail drilldown
  const [highlightedCplKode, setHighlightedCplKode] = useState<string | null>(null);

  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const printAreaRef = React.useRef<HTMLDivElement>(null);

  // Sync when prodi changes
  React.useEffect(() => {
    setSelectedCohortYears(cohortList.map(c => c.angkatan));
  }, [cohortList]);

  // Toggle cohort inclusion
  const handleToggleCohort = (year: number) => {
    setSelectedCohortYears(prev => {
      if (prev.includes(year)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(y => y !== year);
      } else {
        return [...prev, year].sort((a, b) => a - b);
      }
    });
  };

  // Select all or only latest
  const handleSelectAllCohorts = () => {
    setSelectedCohortYears(cohortList.map(c => c.angkatan));
  };

  const handleSelectOnlyLatest = () => {
    const latest = cohortList[cohortList.length - 1];
    if (latest) setSelectedCohortYears([latest.angkatan]);
  };

  // Transform data for Recharts RadarChart
  // Format: [{ subject: 'CPL-01', target: 75, '2021': 88.5, '2022': 85.0, ... }]
  const radarChartData = useMemo(() => {
    return activeCpls.map(cpl => {
      const row: Record<string, any> = {
        subject: cpl.kode,
        fullSubject: `${cpl.kode}: ${cpl.judul}`,
        target: 75.0,
        fullMark: 100
      };

      cohortList.forEach(cohort => {
        row[String(cohort.angkatan)] = cohort.scores[cpl.kode] || 0;
      });

      return row;
    });
  }, [activeCpls, cohortList]);

  // Aggregate Metrics per Cohort
  const cohortMetrics = useMemo(() => {
    return cohortList.map(cohort => {
      const scoreValues = activeCpls.map(c => cohort.scores[c.kode] || 0);
      const avg = scoreValues.reduce((a, b) => a + b, 0) / (scoreValues.length || 1);
      const aboveTargetCount = scoreValues.filter(s => s >= 75).length;
      const highestScore = Math.max(...scoreValues);
      const lowestScore = Math.min(...scoreValues);

      const bestCpl = activeCpls.find(c => cohort.scores[c.kode] === highestScore);
      const lowestCpl = activeCpls.find(c => cohort.scores[c.kode] === lowestScore);

      return {
        ...cohort,
        averageScore: avg,
        aboveTargetPercent: Math.round((aboveTargetCount / (scoreValues.length || 1)) * 100),
        bestCpl: bestCpl ? `${bestCpl.kode} (${highestScore}%)` : '-',
        lowestCpl: lowestCpl ? `${lowestCpl.kode} (${lowestScore}%)` : '-'
      };
    });
  }, [cohortList, activeCpls]);

  // Print document
  const handlePrintSpiderChart = () => {
    printDocumentElement(printAreaRef.current, {
      documentTitle: `Laporan_Spider_Chart_CPL_${currentProdiId}_FT_UNBARI`
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Evaluasi Agregat Kurikulum OBE &amp; LAM-Teknik
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              Spider-Chart Agregat
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Sebaran Tingkat Capaian CPL Agregat per Angkatan Mahasiswa
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Visualisasi radar multi-dimensi perbandingan capaian Capaian Pembelajaran Lulusan (CPL-01 s/d CPL-08) lintas angkatan mahasiswa {selectedProdi.nama} terhadap ambang batas standar akreditasi (75%).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-700" />
            <span>Cetak Spider-Chart A4</span>
          </button>
        </div>
      </div>

      {/* Cohort Pill Filters & Radar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Pilih Angkatan:</span>
          </span>

          {cohortList.map(cohort => {
            const isChecked = selectedCohortYears.includes(cohort.angkatan);
            return (
              <button
                key={cohort.angkatan}
                type="button"
                onClick={() => handleToggleCohort(cohort.angkatan)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isChecked
                    ? 'bg-white shadow-xs text-slate-900'
                    : 'bg-slate-200/60 border-transparent text-slate-500 hover:bg-slate-200'
                }`}
                style={{
                  borderColor: isChecked ? cohort.warnaStroke : undefined,
                  boxShadow: isChecked ? `0 0 0 1.5px ${cohort.warnaStroke}40` : undefined
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: cohort.warnaStroke }}
                />
                <span>Angkatan {cohort.angkatan}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowTargetLine(!showTargetLine)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showTargetLine
                ? 'bg-red-50 text-red-800 border-red-300 shadow-xs'
                : 'bg-slate-200/60 border-transparent text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
            <span>Target Standar (75%)</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 self-end sm:self-center">
          <button
            type="button"
            onClick={handleSelectAllCohorts}
            className="hover:text-blue-700 underline cursor-pointer"
          >
            Semua
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={handleSelectOnlyLatest}
            className="hover:text-blue-700 underline cursor-pointer"
          >
            Tingkat Akhir
          </button>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Cohort KPI Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Recharts RadarChart (Spider-Chart) */}
        <div className="lg:col-span-7 bg-slate-50/60 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-700" />
              <span>Profil Radar Capaian CPL Multi-Angkatan</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Skala: 50% - 100%
            </span>
          </div>

          {/* Spider Chart Canvas */}
          <div className="h-80 sm:h-96 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[50, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  unit="%"
                />

                {/* Target Baseline (75%) */}
                {showTargetLine && (
                  <Radar
                    name="Target Akreditasi (75%)"
                    dataKey="target"
                    stroke="#dc2626"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="#f87171"
                    fillOpacity={0.08}
                  />
                )}

                {/* Cohort Radars */}
                {cohortList.map(cohort => {
                  if (!selectedCohortYears.includes(cohort.angkatan)) return null;
                  return (
                    <Radar
                      key={cohort.angkatan}
                      name={`Angkatan ${cohort.angkatan}`}
                      dataKey={String(cohort.angkatan)}
                      stroke={cohort.warnaStroke}
                      strokeWidth={2.2}
                      fill={cohort.warnaFill}
                      fillOpacity={0.25}
                    />
                  );
                })}

                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '0.85rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '11px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                  }}
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                  labelFormatter={(label, payload) => {
                    const item = payload && payload[0] && payload[0].payload;
                    return item ? item.fullSubject : label;
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingTop: '12px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-500 font-medium text-center pt-2 border-t border-slate-200/80">
            Nilai dihitung dari rerata tertimbang asesmen tugas, kuis, responsi lab, UTS, dan UAS mata kuliah pembina CPL.
          </div>
        </div>

        {/* Right Column: Cohort Metric Cards & CQI Insights */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Ringkasan Kinerja per Angkatan</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Ambang 75%</span>
          </div>

          {cohortMetrics.map(cohort => {
            const isSelected = selectedCohortYears.includes(cohort.angkatan);
            const isPassing = cohort.averageScore >= 75.0;

            return (
              <div
                key={cohort.angkatan}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-white border-slate-300 shadow-sm ring-1 ring-blue-500/20'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cohort.warnaStroke }}
                    />
                    <div>
                      <h5 className="text-xs font-black text-slate-900">
                        {cohort.labelAngkatan}
                      </h5>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {cohort.semester} · {cohort.totalMahasiswaAktif} Mahasiswa
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-slate-900">
                      {cohort.averageScore.toFixed(1)}%
                    </div>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      isPassing ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isPassing ? 'Tercapai' : 'Di Bawah Target'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Capaian Tertinggi:</span>
                    <span className="font-bold text-emerald-700">{cohort.bestCpl}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Perlu Evaluasi (CQI):</span>
                    <span className="font-bold text-amber-700">{cohort.lowestCpl}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Continuous Quality Improvement (CQI) Advisory Card */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-blue-950">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Rekomendasi Tindak Lanjut CQI Gugus Penjaminan Mutu:</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Tren capaian CPL meningkat positif seiring bertambahnya tingkat semester (Angkatan 2024: 78.0% &rarr; Angkatan 2021: 86.6%). Prioritaskan penguatan modul matematika dan perancangan awal untuk angkatan muda.
            </p>
          </div>
        </div>

      </div>

      {/* Detailed Tabular Breakdown Table */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Tabel Rincian Sebaran Skor CPL Lintas Angkatan (Tolak Ukur LAM-Teknik)</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            Threshold Kelulusan Standar: <strong>75.0%</strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-16">Kode</th>
                <th className="py-2.5 px-3 min-w-[200px]">Deskripsi Rumusan CPL</th>
                <th className="py-2.5 px-2 text-center w-14">Target</th>
                {cohortList.map(cohort => (
                  <th key={cohort.angkatan} className="py-2.5 px-3 text-center border-l border-slate-200">
                    <div className="font-extrabold text-slate-900">Angk. {cohort.angkatan}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{cohort.semester}</div>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center w-28 border-l border-slate-200">Status Agregat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeCpls.map((cpl, idx) => {
                const scoresAcross = cohortList.map(c => c.scores[cpl.kode] || 0);
                const avgScore = scoresAcross.reduce((a, b) => a + b, 0) / (scoresAcross.length || 1);
                const isAllPass = scoresAcross.every(s => s >= 75);

                return (
                  <tr key={cpl.kode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                      {cpl.kode}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{cpl.judul}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{cpl.deskripsi}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-red-600 bg-red-50/40">
                      75%
                    </td>
                    {cohortList.map(cohort => {
                      const score = cohort.scores[cpl.kode] || 0;
                      const isPassing = score >= 75;
                      return (
                        <td key={cohort.angkatan} className="py-2.5 px-3 text-center font-mono border-l border-slate-100">
                          <span className={`font-bold ${isPassing ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {score.toFixed(1)}%
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-center border-l border-slate-100">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isAllPass
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isAllPass ? '✓ Memenuhi' : '⚠️ Perlu CQI'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Preview Dialog */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold">Cetak Laporan Spider-Chart Ketercapaian CPL (A4)</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintSpiderChart}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Cetak Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-2 py-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
              <div
                ref={printAreaRef}
                className="bg-white p-8 rounded shadow-sm w-full max-w-3xl text-slate-900 font-serif border border-slate-300"
              >
                {/* Official UNBARI Header */}
                <div className="border-b-2 border-black pb-3 mb-6 text-center">
                  <div className="text-xs uppercase font-bold tracking-widest text-slate-600">
                    Yayasan Pendidikan Jambi
                  </div>
                  <div className="text-base font-black uppercase tracking-wider text-slate-900">
                    UNIVERSITAS BATANGHARI (UNBARI) JAMBI
                  </div>
                  <div className="text-sm font-black uppercase text-blue-900">
                    FAKULTAS TEKNIK - GUGUS PENJAMINAN MUTU FAKULTAS (GPMF)
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    Jl. Slamet Riyadi No. 1 Broni, Telanaipura, Kota Jambi 36122 | Telp: (0741) 60103 | Website: ft.unbari.ac.id
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-sm font-bold uppercase underline">
                    LAPORAN ANALISIS SEBARAN TINGKAT CAPAIAN CPL PER ANGKATAN
                  </h3>
                  <div className="text-xs font-semibold mt-1">
                    PROGRAM STUDI: {selectedProdi.nama.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Instrumen Akreditasi LAM-Teknik &amp; Kurikulum Outcome-Based Education (OBE)
                  </div>
                </div>

                {/* Table in Print */}
                <table className="w-full text-[10px] border-collapse border border-black mb-6">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-1 text-center w-8">Kode</th>
                      <th className="border border-black p-1 text-left">Rumusan CPL</th>
                      <th className="border border-black p-1 text-center w-12">Target</th>
                      {cohortList.map(c => (
                        <th key={c.angkatan} className="border border-black p-1 text-center w-16">
                          Angk. {c.angkatan}
                        </th>
                      ))}
                      <th className="border border-black p-1 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCpls.map(cpl => {
                      return (
                        <tr key={cpl.kode}>
                          <td className="border border-black p-1 text-center font-bold">{cpl.kode}</td>
                          <td className="border border-black p-1">{cpl.judul}</td>
                          <td className="border border-black p-1 text-center">75%</td>
                          {cohortList.map(c => (
                            <td key={c.angkatan} className="border border-black p-1 text-center">
                              {c.scores[cpl.kode]}%
                            </td>
                          ))}
                          <td className="border border-black p-1 text-center font-bold">Memenuhi</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-10 text-center text-xs mt-10 pt-4">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-bold">Ketua Program Studi {selectedProdi.singkatan}</div>
                    <div className="h-16"></div>
                    <div className="font-bold underline">{selectedProdi.kaprodi}</div>
                    <div className="text-[10px] text-slate-600">NIDN: {selectedProdi.nipKaprodi}</div>
                  </div>

                  <div>
                    <div>Disahkan oleh,</div>
                    <div className="font-bold">Dekan Fakultas Teknik UNBARI</div>
                    <div className="h-16"></div>
                    <div className="font-bold underline">{DEKAN_FAKULTAS_TEKNIK.nama}</div>
                    <div className="text-[10px] text-slate-600">NIDN: {DEKAN_FAKULTAS_TEKNIK.nidn}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
