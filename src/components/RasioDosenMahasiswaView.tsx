import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  Users,
  UserPlus,
  RotateCcw,
  Download,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { Dosen, Mahasiswa, ProgramStudiInfo } from '../types/index';
import {
  AngkatanRasioItem,
  RasioStatusTier,
  buildRasioDosenProyeksiReport
} from '../utils/rasioDosenProyeksiHelper';

interface RasioDosenMahasiswaViewProps {
  selectedProdi: ProgramStudiInfo;
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  onShowToast?: (msg: string) => void;
}

const DEFAULT_SIM_PARAMS = {
  targetRasioMax: 20,
  pertumbuhanIntakePersen: 8,
  estimasiKelulusanPersen: 82,
  dosenPensiunAtauStudiS3: 1,
  rencanaRekrutmenDosen: 0,
  includeDosenLintasMku: false
};

function getTierStyles(tier: RasioStatusTier) {
  if (tier === 'IDEAL') {
    return {
      text: 'text-emerald-700',
      surface: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      barColor: '#059669'
    };
  }
  if (tier === 'WASPADA') {
    return {
      text: 'text-amber-700',
      surface: 'bg-amber-50 text-amber-800 border-amber-200',
      barColor: '#d97706'
    };
  }
  return {
    text: 'text-rose-700',
    surface: 'bg-rose-50 text-rose-800 border-rose-200',
    barColor: '#dc2626'
  };
}

export const RasioDosenMahasiswaView: React.FC<RasioDosenMahasiswaViewProps> = ({
  selectedProdi,
  mahasiswaList,
  dosenList,
  onShowToast
}) => {
  const [targetRasioMax, setTargetRasioMax] = useState<number>(DEFAULT_SIM_PARAMS.targetRasioMax);
  const [pertumbuhanIntakePersen, setPertumbuhanIntakePersen] = useState<number>(
    DEFAULT_SIM_PARAMS.pertumbuhanIntakePersen
  );
  const [estimasiKelulusanPersen, setEstimasiKelulusanPersen] = useState<number>(
    DEFAULT_SIM_PARAMS.estimasiKelulusanPersen
  );
  const [dosenPensiunAtauStudiS3, setDosenPensiunAtauStudiS3] = useState<number>(
    DEFAULT_SIM_PARAMS.dosenPensiunAtauStudiS3
  );
  const [rencanaRekrutmenDosen, setRencanaRekrutmenDosen] = useState<number>(
    DEFAULT_SIM_PARAMS.rencanaRekrutmenDosen
  );
  const [includeDosenLintasMku, setIncludeDosenLintasMku] = useState<boolean>(
    DEFAULT_SIM_PARAMS.includeDosenLintasMku
  );

  const [cohortScope, setCohortScope] = useState<'ACTIVE_ONLY' | 'ALL'>('ACTIVE_ONLY');
  const [selectedAngkatanYear, setSelectedAngkatanYear] = useState<number | null>(null);
  const [chartBreakdownMode, setChartBreakdownMode] = useState<'AKTIF_STATUS' | 'TOTAL_STATUS'>(
    'AKTIF_STATUS'
  );
  const [basisDataMahasiswa, setBasisDataMahasiswa] = useState<'AUTO' | 'DATABASE' | 'PDDIKTI_SCALE'>(
    'AUTO'
  );

  const report = useMemo(
    () =>
      buildRasioDosenProyeksiReport({
        prodi: selectedProdi,
        mahasiswaList,
        dosenList,
        targetRasioMax,
        pertumbuhanIntakePersen,
        estimasiKelulusanPersen,
        dosenPensiunAtauStudiS3,
        rencanaRekrutmenDosen,
        includeDosenLintasMku,
        basisDataMahasiswa
      }),
    [
      selectedProdi,
      mahasiswaList,
      dosenList,
      targetRasioMax,
      pertumbuhanIntakePersen,
      estimasiKelulusanPersen,
      dosenPensiunAtauStudiS3,
      rencanaRekrutmenDosen,
      includeDosenLintasMku,
      basisDataMahasiswa
    ]
  );

  const displayedAngkatanRows = useMemo(() => {
    const base =
      cohortScope === 'ACTIVE_ONLY'
        ? report.angkatanItems.filter(a => a.mahasiswaAktif > 0)
        : report.angkatanItems;
    return base;
  }, [report.angkatanItems, cohortScope]);

  const selectedCohortDetail: AngkatanRasioItem | null = useMemo(() => {
    if (displayedAngkatanRows.length === 0) return null;
    if (selectedAngkatanYear !== null) {
      const found = displayedAngkatanRows.find(a => a.angkatan === selectedAngkatanYear);
      if (found) return found;
    }
    return report.dominantAngkatan || displayedAngkatanRows[displayedAngkatanRows.length - 1];
  }, [displayedAngkatanRows, selectedAngkatanYear, report.dominantAngkatan]);

  const handleResetSimulation = () => {
    setTargetRasioMax(DEFAULT_SIM_PARAMS.targetRasioMax);
    setPertumbuhanIntakePersen(DEFAULT_SIM_PARAMS.pertumbuhanIntakePersen);
    setEstimasiKelulusanPersen(DEFAULT_SIM_PARAMS.estimasiKelulusanPersen);
    setDosenPensiunAtauStudiS3(DEFAULT_SIM_PARAMS.dosenPensiunAtauStudiS3);
    setRencanaRekrutmenDosen(DEFAULT_SIM_PARAMS.rencanaRekrutmenDosen);
    setIncludeDosenLintasMku(DEFAULT_SIM_PARAMS.includeDosenLintasMku);
    setBasisDataMahasiswa('AUTO');
    setSelectedAngkatanYear(null);
    if (onShowToast) {
      onShowToast('Parameter simulasi rasio dan proyeksi kebutuhan dosen dikembalikan ke standar awal.');
    }
  };

  const handleExportCsv = () => {
    const headerAngkatan = [
      'Angkatan',
      'Semester',
      'Mahasiswa Aktif',
      'Aktif Reguler',
      'Tugas Akhir',
      'Berisiko',
      'Lulus',
      'Cuti/Non-Aktif',
      'Proporsi (%)',
      'Beban per 1 Dosen',
      'Kebutuhan Dosen Proporsional (FTE)'
    ];
    const rowsAngkatan = report.angkatanItems.map(a =>
      [
        a.angkatan,
        a.semesterBerjalan,
        a.mahasiswaAktif,
        a.aktifReguler,
        a.tugasAkhir,
        a.berisiko,
        a.lulus,
        a.cutiAtauNonAktif,
        a.proporsiAktifPersen.toFixed(1),
        a.rasioPerDosen.toFixed(1),
        a.kebutuhanDosenFte.toFixed(1)
      ].join(',')
    );

    const headerProyeksi = [
      '',
      'PROYEKSI TAHUNAN (2026-2030)',
      'Tahun,Proyeksi Intake Baru,Estimasi Lulus,Total Mahasiswa Aktif,DTPS Efektif,Kapasitas Ideal,Rasio (1:X),Total Kebutuhan DTPS,Tambahan Dosen Baru,Status'
    ];
    const rowsProyeksi = report.proyeksiTahunan.map(p =>
      [
        p.tahun,
        p.proyeksiIntakeBaru,
        p.estimasiLulusKeluar,
        p.proyeksiMahasiswaAktif,
        p.dtpsTersediaEfektif,
        p.kapasitasIdealMahasiswa,
        p.rasioProyeksi.toFixed(1),
        p.kebutuhanTotalDtps,
        p.kebutuhanTambahDosen,
        `"${p.statusLabel}"`
      ].join(',')
    );

    const csvContent = [
      `Laporan Komparasi Mahasiswa Aktif & Proyeksi Kebutuhan Dosen - ${selectedProdi.nama}`,
      `Basis Dosen,${includeDosenLintasMku ? 'DTPS + Lintas/MKU' : 'DTPS Homebase'},Jumlah Dosen,${report.dosenEfektifDipakai},Target Rasio Maks,1:${report.targetRasioMax}`,
      '',
      headerAngkatan.join(','),
      ...rowsAngkatan,
      ...headerProyeksi,
      ...rowsProyeksi
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Proyeksi_Rasio_Dosen_${selectedProdi.id}_Target_1_${report.targetRasioMax}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onShowToast) {
      onShowToast(`Laporan komparasi angkatan & proyeksi kebutuhan dosen ${selectedProdi.singkatan} diunduh (CSV).`);
    }
  };

  const statusStyle = getTierStyles(report.rasioStatus);

  const isSimulationModified =
    targetRasioMax !== DEFAULT_SIM_PARAMS.targetRasioMax ||
    pertumbuhanIntakePersen !== DEFAULT_SIM_PARAMS.pertumbuhanIntakePersen ||
    estimasiKelulusanPersen !== DEFAULT_SIM_PARAMS.estimasiKelulusanPersen ||
    dosenPensiunAtauStudiS3 !== DEFAULT_SIM_PARAMS.dosenPensiunAtauStudiS3 ||
    rencanaRekrutmenDosen !== DEFAULT_SIM_PARAMS.rencanaRekrutmenDosen ||
    includeDosenLintasMku !== DEFAULT_SIM_PARAMS.includeDosenLintasMku ||
    basisDataMahasiswa !== 'AUTO';

  return (
    <div className="space-y-6">
      {/* Header & Top Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Komparasi Mahasiswa Aktif per Angkatan &amp; Proyeksi Kebutuhan Dosen Tetap
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{selectedProdi.nama}</span>
            <span aria-hidden="true">·</span>
            <span>Kriteria 4 SDM LAM-Teknik</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Standar Target 1:{report.targetRasioMax}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Basis {includeDosenLintasMku ? 'Seluruh Dosen Pengampu' : 'DTPS Homebase Prodi'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setBasisDataMahasiswa('DATABASE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                report.effectiveDataBasis === 'DATABASE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Data Terdaftar ({report.rawMahasiswaAktifDatabase})
            </button>
            <button
              type="button"
              onClick={() => setBasisDataMahasiswa('PDDIKTI_SCALE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                report.effectiveDataBasis === 'PDDIKTI_SCALE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agregat PDDIKTI ({selectedProdi.totalMahasiswa})
            </button>
          </div>

          <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setIncludeDosenLintasMku(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !includeDosenLintasMku
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              DTPS Homebase ({report.totalDtpsHomebase})
            </button>
            <button
              type="button"
              onClick={() => setIncludeDosenLintasMku(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                includeDosenLintasMku
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Pengampu ({report.totalDtpsHomebase + report.totalDosenLintasMku})
            </button>
          </div>

          {isSimulationModified && (
            <button
              type="button"
              onClick={handleResetSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Parameter</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Analisis CSV</span>
          </button>
        </div>
      </div>

      {/* Unified KPI Strip (Single Elevation, Hairline Divide-X) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-4">
            <div className="text-[11px] font-semibold text-slate-500">
              {report.effectiveDataBasis === 'PDDIKTI_SCALE'
                ? 'Mahasiswa Aktif (Skala PDDIKTI)'
                : 'Mahasiswa Aktif Terdata'}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {report.totalMahasiswaAktif}
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {report.effectiveDataBasis === 'PDDIKTI_SCALE'
                  ? `(${report.rawMahasiswaAktifDatabase} sampel terinput)`
                  : `/ ${report.totalMahasiswaDatabase} total`}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {report.dominantAngkatan
                ? `Terbesar: Angkatan ${report.dominantAngkatan.angkatan} (${report.dominantAngkatan.mahasiswaAktif} mhs)`
                : 'Belum ada angkatan aktif'}
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold text-slate-500">
              {includeDosenLintasMku ? 'Total Dosen Pengampu' : 'Dosen Tetap Prodi (DTPS)'}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {report.dosenEfektifDipakai}
              </span>
              <span className="text-xs text-slate-500">Dosen</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
              Kapasitas ideal {report.dosenEfektifDipakai * report.targetRasioMax} mhs (1:{report.targetRasioMax})
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold text-slate-500">
              Rasio Aktual Dosen : Mahasiswa
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono tabular-nums ${statusStyle.text}`}>
                1 : {report.rasioAktual.toFixed(1)}
              </span>
            </div>
            <div className={`mt-1 text-[11px] font-semibold flex items-center gap-1 ${statusStyle.text}`}>
              {report.rasioStatus === 'IDEAL' ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : report.rasioStatus === 'WASPADA' ? (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{report.rasioStatusLabel}</span>
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold text-slate-500">
              Prediksi Kebutuhan (2026–2030)
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  report.puncakKebutuhanTambahDosen > 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {report.puncakKebutuhanTambahDosen > 0
                  ? `+${report.puncakKebutuhanTambahDosen}`
                  : '0'}
              </span>
              <span className="text-xs text-slate-500">DTPS Baru</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
              {report.tahunPemicuDefisit
                ? `Mulai defisit tahun ${report.tahunPemicuDefisit} (saat ini +${report.defisitDosenSaatIni})`
                : `Kapasitas aman hingga proyeksi 2030`}
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold text-slate-500">
              Proyeksi Skor K4 SDM (2030)
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {report.estimasiSkorK4Skala4.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">/ 4.00</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
              Rasio 2030 est. 1 : {report.rasioAkhirProyeksi2030.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Controls Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700" />
            <h4 className="text-sm font-bold text-slate-900">
              Simulator Skenario Rasio &amp; Proyeksi Kebutuhan Rekrutmen Dosen
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1">Target Rasio LAM-Teknik:</span>
            {[15, 20, 25, 30].map(ratio => (
              <button
                key={ratio}
                type="button"
                onClick={() => setTargetRasioMax(ratio)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  targetRasioMax === ratio
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                1:{ratio}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="sim-intake-growth" className="font-semibold text-slate-700">
                Pertumbuhan Intake Maba / Thn
              </label>
              <span className="font-mono tabular-nums font-bold text-blue-700">
                {pertumbuhanIntakePersen > 0 ? `+${pertumbuhanIntakePersen}%` : `${pertumbuhanIntakePersen}%`}
              </span>
            </div>
            <input
              id="sim-intake-growth"
              type="range"
              min={-10}
              max={30}
              step={1}
              value={pertumbuhanIntakePersen}
              onChange={e => setPertumbuhanIntakePersen(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
              <span>-10%</span>
              <span>+8% (Baseline)</span>
              <span>+30%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="sim-grad-rate" className="font-semibold text-slate-700">
                Tingkat Kelulusan Tepat Waktu
              </label>
              <span className="font-mono tabular-nums font-bold text-slate-900">
                {estimasiKelulusanPersen}%
              </span>
            </div>
            <input
              id="sim-grad-rate"
              type="range"
              min={60}
              max={95}
              step={1}
              value={estimasiKelulusanPersen}
              onChange={e => setEstimasiKelulusanPersen(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
              <span>60%</span>
              <span>82%</span>
              <span>95%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="sim-attrition" className="font-semibold text-slate-700">
                Dosen Pensiun / Tugas Belajar S3
              </label>
              <span className="font-mono tabular-nums font-bold text-amber-700">
                -{dosenPensiunAtauStudiS3} Dosen
              </span>
            </div>
            <input
              id="sim-attrition"
              type="range"
              min={0}
              max={4}
              step={1}
              value={dosenPensiunAtauStudiS3}
              onChange={e => setDosenPensiunAtauStudiS3(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
              <span>0</span>
              <span>1–2 Dosen</span>
              <span>4 Dosen</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="sim-recruit" className="font-semibold text-slate-700">
                Simulasi Rencana Rekrutmen DTPS
              </label>
              <span className="font-mono tabular-nums font-bold text-emerald-700">
                +{rencanaRekrutmenDosen} Dosen
              </span>
            </div>
            <input
              id="sim-recruit"
              type="range"
              min={0}
              max={10}
              step={1}
              value={rencanaRekrutmenDosen}
              onChange={e => setRencanaRekrutmenDosen(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
              <span>0 (Status Quo)</span>
              <span>+5</span>
              <span>+10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Check */}
      {report.totalMahasiswaDatabase === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-900">
            Belum Ada Data Mahasiswa pada Program Studi Ini
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Tambahkan data mahasiswa per angkatan terlebih dahulu untuk menampilkan komparasi rasio dosen tetap dan proyeksi rekrutmen.
          </p>
        </div>
      ) : (
        <>
          {/* Two Comparative Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Chart 1: Komparatif Jumlah Mahasiswa Aktif per Angkatan vs Rasio Beban per Dosen */}
            <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Komparasi Mahasiswa Aktif per Angkatan vs Beban Rasio DTPS
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Batang: sebaran mahasiswa per angkatan · Garis: rasio mahasiswa angkatan per 1 dosen ({report.dosenEfektifDipakai} dosen)
                  </p>
                </div>

                <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setChartBreakdownMode('AKTIF_STATUS')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chartBreakdownMode === 'AKTIF_STATUS'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Rincian Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartBreakdownMode('TOTAL_STATUS')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      chartBreakdownMode === 'TOTAL_STATUS'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Aktif vs Lulus/Non-Aktif
                  </button>
                </div>
              </div>

              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={displayedAngkatanRows}
                    margin={{ top: 10, right: 12, left: -8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="labelAngkatan"
                      tickFormatter={(val: string) => val.replace('Angkatan ', '')}
                      tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: 'Mahasiswa',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 16,
                        style: { fontSize: 11, fill: '#64748b' }
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#0f172a' }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: 'Mhs / 1 Dosen',
                        angle: 90,
                        position: 'insideRight',
                        offset: 12,
                        style: { fontSize: 11, fill: '#0f172a' }
                      }}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null;
                        const row = payload[0].payload as AngkatanRasioItem;
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-xs space-y-1.5 min-w-[210px]">
                            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                              <span>Angkatan {row.angkatan}</span>
                              <span className="font-mono text-[11px] text-slate-500">
                                Sem {row.semesterBerjalan}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Mahasiswa Aktif Total:</span>
                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                {row.mahasiswaAktif} mhs ({row.proporsiAktifPersen}%)
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>Aktif / TA / Berisiko:</span>
                              <span className="font-mono tabular-nums">
                                {row.aktifReguler} / {row.tugasAkhir} / {row.berisiko}
                              </span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-100">
                              <span className="text-slate-600">Beban per 1 DTPS:</span>
                              <span className="font-mono font-bold text-indigo-700 tabular-nums">
                                {row.rasioPerDosen.toFixed(1)} mhs/dosen
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Kebutuhan Proporsional:</span>
                              <span className="font-mono font-semibold text-slate-800 tabular-nums">
                                {row.kebutuhanDosenFte.toFixed(1)} DTPS
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                    {chartBreakdownMode === 'AKTIF_STATUS' ? (
                      <>
                        <Bar
                          yAxisId="left"
                          dataKey="aktifReguler"
                          name="Aktif Reguler"
                          stackId="mhs"
                          fill="#2563eb"
                          radius={[0, 0, 0, 0]}
                          maxBarSize={40}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="tugasAkhir"
                          name="Tugas Akhir"
                          stackId="mhs"
                          fill="#0ea5e9"
                          maxBarSize={40}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="berisiko"
                          name="Berisiko Akademik"
                          stackId="mhs"
                          fill="#d97706"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      </>
                    ) : (
                      <>
                        <Bar
                          yAxisId="left"
                          dataKey="mahasiswaAktif"
                          name="Total Aktif"
                          stackId="all"
                          fill="#2563eb"
                          maxBarSize={40}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="lulus"
                          name="Lulus Yudisium"
                          stackId="all"
                          fill="#10b981"
                          maxBarSize={40}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="cutiAtauNonAktif"
                          name="Cuti / Non-Aktif"
                          stackId="all"
                          fill="#cbd5e1"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={40}
                        />
                      </>
                    )}

                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="rasioPerDosen"
                      name="Beban Rasio per 1 Dosen"
                      stroke="#0f172a"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0f172a', stroke: '#ffffff', strokeWidth: 1.5 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Proyeksi 2026-2030 vs Kapasitas Ideal DTPS */}
            <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
              <div className="mb-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Proyeksi Mahasiswa vs Daya Tampung Ideal DTPS (2026–2030)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Memprediksi tahun defisit dan jumlah tambahan dosen saat proyeksi mahasiswa melampaui kapasitas 1:{report.targetRasioMax}.
                </p>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={report.proyeksiTahunan}
                    margin={{ top: 10, right: 12, left: -12, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null;
                        const p = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-xs space-y-1.5 min-w-[220px]">
                            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                              Proyeksi Tahun {p.tahun}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Est. Mahasiswa Aktif:</span>
                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                {p.proyeksiMahasiswaAktif} mhs
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Kapasitas Ideal DTPS ({p.dtpsTersediaEfektif}):</span>
                              <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                                {p.kapasitasIdealMahasiswa} mhs
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Rasio Proyeksi:</span>
                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                1 : {p.rasioProyeksi.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-100">
                              <span className="text-slate-600">Kebutuhan Tambah Dosen:</span>
                              <span
                                className={`font-mono font-bold tabular-nums ${
                                  p.kebutuhanTambahDosen > 0 ? 'text-rose-700' : 'text-emerald-700'
                                }`}
                              >
                                {p.kebutuhanTambahDosen > 0 ? `+${p.kebutuhanTambahDosen} DTPS` : 'Memenuhi (0)'}
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <ReferenceLine
                      y={report.dosenEfektifDipakai * report.targetRasioMax}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                    />
                    <Bar
                      dataKey="proyeksiMahasiswaAktif"
                      name="Proyeksi Mhs Aktif"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                    >
                      {report.proyeksiTahunan.map(entry => (
                        <Cell
                          key={`cell-${entry.tahun}`}
                          fill={getTierStyles(entry.statusRasio).barColor}
                        />
                      ))}
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="kapasitasIdealMahasiswa"
                      name={`Daya Tampung Ideal (1:${report.targetRasioMax})`}
                      stroke="#0f172a"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Compact Annual Recruitment Delta Strip */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-600 mb-2">
                  Estimasi Tambahan Kebutuhan Dosen per Tahun (Target 1:{report.targetRasioMax})
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {report.proyeksiTahunan.map(item => (
                    <div
                      key={item.tahun}
                      className="border border-slate-200 rounded-lg px-2 py-2 text-center bg-slate-50/70"
                    >
                      <div className="text-[11px] font-mono font-semibold text-slate-600">
                        {item.tahun}
                      </div>
                      <div
                        className={`text-sm font-mono font-bold tabular-nums mt-0.5 ${
                          item.kebutuhanTambahDosen > 0 ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {item.kebutuhanTambahDosen > 0 ? `+${item.kebutuhanTambahDosen}` : '0'}
                      </div>
                      <div className="text-[10px] font-mono tabular-nums text-slate-500">
                        1:{item.rasioProyeksi.toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Data Tables & Cohort Inspector */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Table: Per Angkatan Breakdown */}
            <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Rincian Beban Rasio per Angkatan
                  </h4>
                  <p className="text-xs text-slate-500">
                    Klik baris angkatan untuk melihat rincian komposisi status mahasiswa dan porsi kebutuhan dosen.
                  </p>
                </div>

                <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCohortScope('ACTIVE_ONLY')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      cohortScope === 'ACTIVE_ONLY'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Angkatan Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setCohortScope('ALL')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      cohortScope === 'ALL'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua Angkatan ({report.angkatanItems.length})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                      <th className="py-2.5 px-4">Angkatan</th>
                      <th className="py-2.5 px-3 text-right">Aktif</th>
                      <th className="py-2.5 px-3 text-right">TA / Skripsi</th>
                      <th className="py-2.5 px-3 text-right">Berisiko</th>
                      <th className="py-2.5 px-3 text-right">Porsi</th>
                      <th className="py-2.5 px-3 text-right">Mhs / Dosen</th>
                      <th className="py-2.5 px-4 text-right">Kebutuhan FTE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {displayedAngkatanRows.map(row => {
                      const isSelected = selectedCohortDetail?.angkatan === row.angkatan;
                      return (
                        <tr
                          key={row.angkatan}
                          onClick={() => setSelectedAngkatanYear(row.angkatan)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-4 font-semibold text-slate-900">
                            <div>Angkatan {row.angkatan}</div>
                            <div className="text-[11px] font-normal text-slate-500 font-mono tabular-nums">
                              Sem {row.semesterBerjalan} · {row.totalTerdaftar} terdata
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                            {row.mahasiswaAktif}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sky-700">
                            {row.tugasAkhir}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-700">
                            {row.berisiko}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                            {row.proporsiAktifPersen.toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                            {row.rasioPerDosen.toFixed(1)} : 1
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-indigo-700">
                            {row.kebutuhanDosenFte.toFixed(1)} dosen
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50 text-xs font-bold text-slate-900">
                      <td className="py-2.5 px-4">Total Keseluruhan Prodi</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {report.totalMahasiswaAktif}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sky-700">
                        {report.angkatanItems.reduce((s, r) => s + r.tugasAkhir, 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-700">
                        {report.angkatanItems.reduce((s, r) => s + r.berisiko, 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">100.0%</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {report.rasioAktual.toFixed(1)} : 1
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-indigo-700">
                        {report.kebutuhanDosenSaatIni} DTPS
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedCohortDetail && (
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <GraduationCap className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>
                      Sorotan <strong className="text-slate-900">Angkatan {selectedCohortDetail.angkatan}</strong>: {selectedCohortDetail.aktifReguler} aktif reguler · {selectedCohortDetail.tugasAkhir} tugas akhir · {selectedCohortDetail.lulus} lulus · {selectedCohortDetail.cutiAtauNonAktif} non-aktif/cuti
                    </span>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-slate-800 whitespace-nowrap shrink-0">
                    Beban {selectedCohortDetail.kebutuhanDosenFte.toFixed(1)} FTE DTPS
                  </span>
                </div>
              )}
            </div>

            {/* Right Panel: Proyeksi Tabel 2026-2030 & Rekomendasi Keahlian */}
            <div className="xl:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900">
                    Proyeksi Kebutuhan Penambahan Dosen (2026–2030)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Simulasi arus masuk Maba ({pertumbuhanIntakePersen > 0 ? `+${pertumbuhanIntakePersen}%` : `${pertumbuhanIntakePersen}%`}/thn), kelulusan ({estimasiKelulusanPersen}%), &amp; pensiun (-{dosenPensiunAtauStudiS3} dosen).
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                        <th className="py-2.5 px-4">Tahun</th>
                        <th className="py-2.5 px-2 text-right">Intake</th>
                        <th className="py-2.5 px-2 text-right">Lulus</th>
                        <th className="py-2.5 px-2 text-right">Aktif</th>
                        <th className="py-2.5 px-2 text-right">DTPS</th>
                        <th className="py-2.5 px-2 text-right">Rasio</th>
                        <th className="py-2.5 px-4 text-right">Tambah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {report.proyeksiTahunan.map(p => {
                        const tStyle = getTierStyles(p.statusRasio);
                        return (
                          <tr key={p.tahun} className={p.isBaseline ? 'bg-slate-50/70 font-semibold' : ''}>
                            <td className="py-2.5 px-4 text-slate-900 font-mono tabular-nums">
                              {p.tahun}
                              {p.isBaseline ? ' (Aktual)' : '*'}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">
                              +{p.proyeksiIntakeBaru}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono tabular-nums text-emerald-700">
                              -{p.estimasiLulusKeluar}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-slate-900">
                              {p.proyeksiMahasiswaAktif}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-700">
                              {p.dtpsTersediaEfektif}
                            </td>
                            <td className={`py-2.5 px-2 text-right font-mono tabular-nums font-semibold ${tStyle.text}`}>
                              1:{p.rasioProyeksi.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                              {p.kebutuhanTambahDosen > 0 ? (
                                <span className="font-bold text-rose-700">
                                  +{p.kebutuhanTambahDosen} DTPS
                                </span>
                              ) : (
                                <span className="font-semibold text-emerald-700">Aman (0)</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Keahlian DTPS & Prioritas Rekrutmen */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-700" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Peta Bidang Keahlian DTPS Saat Ini
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500">
                    {report.keahlianDistribution.length} Rumpun Ilmu
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {report.keahlianDistribution.slice(0, 6).map(item => (
                    <div
                      key={item.bidangKeahlian}
                      className="py-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-slate-700 truncate">{item.bidangKeahlian}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-[11px] font-semibold ${
                            item.prioritasRekrutmen === 'Prioritas Tinggi'
                              ? 'text-rose-700'
                              : item.prioritasRekrutmen === 'Perlu Penguatan'
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {item.prioritasRekrutmen}
                        </span>
                        <span className="font-mono tabular-nums font-bold text-slate-900 w-14 text-right">
                          {item.jumlahDtpsSaatIni} dosen
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <UserPlus className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-900">
                Rekomendasi Rencana Penambahan &amp; Pemerataan Dosen Tetap Prodi
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {report.rekomendasiStrategis.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span
                      className={`font-bold ${
                        rec.prioritas === 'Tinggi'
                          ? 'text-rose-700'
                          : rec.prioritas === 'Sedang'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      Prioritas {rec.prioritas}
                    </span>
                    <span className="font-mono text-slate-500">{rec.targetWaktu}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{rec.judul}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
