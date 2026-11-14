import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  LineChart,
  Bar,
  BarChart,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { 
  TrendingUp, 
  GraduationCap, 
  Award, 
  BarChart2, 
  LineChart as LineChartIcon, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Clock,
  Users,
  Target,
  ArrowUpRight,
  Compass,
  HeartHandshake,
  Smile,
  Activity,
  Sliders
} from 'lucide-react';
import { Mahasiswa, ProgramStudiInfo, YudisiumRecord } from '../types/index';

interface AcademicAnalyticsChartProps {
  selectedProdi: ProgramStudiInfo;
  mahasiswaList: Mahasiswa[];
  yudisiumList?: YudisiumRecord[];
}

type AnalyticsViewMode = 
  | 'tren_ipk_prodi' 
  | 'lulusan_tahunan' 
  | 'proyeksi_kelulusan' 
  | 'ktw_tren_4tahun' 
  | 'radar_cpl' 
  | 'sentimen_kepuasan' 
  | 'tingkat_kelulusan' 
  | 'predikat_kelulusan' 
  | 'semester_fokus';

// 1. Data Perbandingan Jumlah Lulusan Yudisium per Tahun Akademik (Recharts BarChart)
export const GRADUATION_COHORT_ANNUAL = [
  { tahunAkademik: '2022/2023', sipil: 38, lingkungan: 26, listrik: 22, total: 86, rataRataFakultas: 28.6 },
  { tahunAkademik: '2023/2024', sipil: 41, lingkungan: 28, listrik: 24, total: 93, rataRataFakultas: 31.0 },
  { tahunAkademik: '2024/2025', sipil: 44, lingkungan: 30, listrik: 25, total: 99, rataRataFakultas: 33.0 },
  { tahunAkademik: '2025/2026', sipil: 46, lingkungan: 32, listrik: 26, total: 104, rataRataFakultas: 34.6 },
];

// 2. Data Proyeksi Jumlah Kelulusan Semester Berikutnya Berdasarkan Data Historis (Recharts AreaChart)
export const PROJECTION_GRADUATION_DATA = [
  { periode: 'Ganjil 22/23', realisasiLulusan: 38, targetLulusan: 36, mahasiswaTingkatAkhir: 45, status: 'Realisasi' },
  { periode: 'Genap 22/23', realisasiLulusan: 48, targetLulusan: 46, mahasiswaTingkatAkhir: 54, status: 'Realisasi' },
  { periode: 'Ganjil 23/24', realisasiLulusan: 44, targetLulusan: 42, mahasiswaTingkatAkhir: 50, status: 'Realisasi' },
  { periode: 'Genap 23/24', realisasiLulusan: 49, targetLulusan: 48, mahasiswaTingkatAkhir: 56, status: 'Realisasi' },
  { periode: 'Ganjil 24/25', realisasiLulusan: 46, targetLulusan: 45, mahasiswaTingkatAkhir: 52, status: 'Realisasi' },
  { periode: 'Genap 24/25', realisasiLulusan: 53, targetLulusan: 50, mahasiswaTingkatAkhir: 60, status: 'Realisasi' },
  { periode: 'Ganjil 25/26', realisasiLulusan: 48, targetLulusan: 48, mahasiswaTingkatAkhir: 55, status: 'Realisasi' },
  { periode: 'Genap 25/26 (Aktif)', realisasiLulusan: 56, targetLulusan: 54, mahasiswaTingkatAkhir: 62, status: 'Realisasi' },
  { periode: 'Ganjil 26/27 (Proyeksi Depan)', realisasiLulusan: undefined, targetLulusan: 60, proyeksiKelulusan: 59, mahasiswaTingkatAkhir: 66, status: 'Target Proyeksi' },
];

// 3. Data Tren Kelulusan Tepat Waktu (KTW) 4 Tahun Terakhir (Recharts LineChart)
export const KTW_4_TAHUN_TREND = [
  { tahun: '2023', sipil: 78.5, lingkungan: 81.2, listrik: 84.0, rataRataFakultas: 81.2, targetLamTeknik: 75.0 },
  { tahun: '2024', sipil: 80.2, lingkungan: 83.5, listrik: 86.1, rataRataFakultas: 83.2, targetLamTeknik: 75.0 },
  { tahun: '2025', sipil: 82.0, lingkungan: 85.0, listrik: 88.0, rataRataFakultas: 85.0, targetLamTeknik: 75.0 },
  { tahun: '2026', sipil: 83.5, lingkungan: 87.2, listrik: 89.4, rataRataFakultas: 86.7, targetLamTeknik: 75.0 },
];

// 4. Data Radar Chart Capaian Pembelajaran Lulusan (CPL/OBE)
export const CPL_OBE_RADAR_DATA = [
  { aspek: 'CPL-1 Sains & Matematika', sipil: 84.5, lingkungan: 82.0, listrik: 85.0, targetOBE: 75 },
  { aspek: 'CPL-2 Analisis Rekayasa', sipil: 81.2, lingkungan: 83.5, listrik: 84.0, targetOBE: 75 },
  { aspek: 'CPL-3 Desain Struktur & Sistem', sipil: 79.5, lingkungan: 81.0, listrik: 87.5, targetOBE: 75 },
  { aspek: 'CPL-4 Penggunaan Software/Lab', sipil: 86.0, lingkungan: 84.2, listrik: 88.0, targetOBE: 75 },
  { aspek: 'CPL-5 Etika & Tanggung Jawab', sipil: 88.5, lingkungan: 87.0, listrik: 89.2, targetOBE: 75 },
  { aspek: 'CPL-6 Komunikasi & Laporan', sipil: 82.0, lingkungan: 85.5, listrik: 83.0, targetOBE: 75 },
  { aspek: 'CPL-7 K3 & Wawasan Lingkungan', sipil: 85.0, lingkungan: 89.5, listrik: 86.4, targetOBE: 75 },
  { aspek: 'CPL-8 Belajar Sepanjang Hayat', sipil: 83.4, lingkungan: 84.0, listrik: 85.0, targetOBE: 75 },
];

// 5. Data Tren Sentimen Kepuasan Mahasiswa (Survei 4 Semester)
export const SATISFACTION_SENTIMENT_DATA = [
  { semester: 'Ganjil 24/25', layananAkademik: 82.4, pengajaranDosen: 85.2, fasilitasLab: 78.0, bimbinganSkripsi: 84.0, skorRataRata: 82.4 },
  { semester: 'Genap 24/25', layananAkademik: 84.0, pengajaranDosen: 86.0, fasilitasLab: 80.5, bimbinganSkripsi: 85.2, skorRataRata: 83.9 },
  { semester: 'Ganjil 25/26', layananAkademik: 86.5, pengajaranDosen: 87.8, fasilitasLab: 83.0, bimbinganSkripsi: 87.0, skorRataRata: 86.1 },
  { semester: 'Genap 25/26 (Terbaru)', layananAkademik: 89.2, pengajaranDosen: 89.5, fasilitasLab: 85.5, bimbinganSkripsi: 88.8, skorRataRata: 88.2 },
];

// 6. Data Scatter Plot: Korelasi Beban SKS Mengajar Dosen vs Tingkat Kepuasan Mahasiswa (EDOM)
export const DOSEN_LOAD_SCATTER_DATA = [
  { dosenNama: 'Ir. Rioni Rizki Aldiansyah, ST., MT', sks: 12, kepuasanEdom: 3.88, prodi: 'SIPIL', bimbingan: 8 },
  { dosenNama: 'Drs. H. M. Yusuf, M.Si.', sks: 14, kepuasanEdom: 3.85, prodi: 'SIPIL', bimbingan: 7 },
  { dosenNama: 'Fadli Eka Yandra, ST., MT', sks: 16, kepuasanEdom: 3.92, prodi: 'LISTRIK_D3', bimbingan: 8 },
  { dosenNama: 'Leily Wustha Johar, ST., MT', sks: 15, kepuasanEdom: 3.89, prodi: 'LISTRIK_D3', bimbingan: 7 },
  { dosenNama: 'Peppy Herawati, S.T., M.T.', sks: 13, kepuasanEdom: 3.91, prodi: 'LINGKUNGAN', bimbingan: 6 },
  { dosenNama: 'Ir. H. Syarifuddin, M.T.', sks: 14, kepuasanEdom: 3.82, prodi: 'SIPIL', bimbingan: 6 },
  { dosenNama: 'Ahmad Ridwan, S.T., M.Eng.', sks: 18, kepuasanEdom: 3.52, prodi: 'SIPIL', bimbingan: 9 }, // Overload contoh
  { dosenNama: 'Dewi Sartika, S.T., M.Sc.', sks: 10, kepuasanEdom: 3.75, prodi: 'LINGKUNGAN', bimbingan: 4 }, // Underload contoh
  { dosenNama: 'Myson, S.T., M.T.', sks: 14, kepuasanEdom: 3.84, prodi: 'LISTRIK_D3', bimbingan: 6 },
  { dosenNama: 'Rozlinda Dewi, S.Kom., M.S.I.', sks: 13, kepuasanEdom: 3.87, prodi: 'LISTRIK_D3', bimbingan: 5 },
  { dosenNama: 'Ir. Hendri, S.T., M.T.', sks: 14, kepuasanEdom: 3.90, prodi: 'LISTRIK_D3', bimbingan: 7 },
  { dosenNama: 'Dr. Eng. Ir. Bastian, M.T.', sks: 15, kepuasanEdom: 3.86, prodi: 'LINGKUNGAN', bimbingan: 6 },
];

// Historical Cohort Benchmark across UNBARI Engineering Programs
const COHORT_IPK_BENCHMARKS = [
  { angkatan: '2021', tahun: 'Angkatan 2021', sipil: 3.42, lingkungan: 3.48, listrik: 3.52, rataRataFakultas: 3.46, semesterAktif: 'Sem 7 - 8', status: 'Tahap Akhir / Skripsi' },
  { angkatan: '2022', tahun: 'Angkatan 2022', sipil: 3.36, lingkungan: 3.41, listrik: 3.46, rataRataFakultas: 3.40, semesterAktif: 'Sem 5 - 6', status: 'Kerja Praktik & Studio' },
  { angkatan: '2023', tahun: 'Angkatan 2023', sipil: 3.28, lingkungan: 3.34, listrik: 3.40, rataRataFakultas: 3.33, semesterAktif: 'Sem 3 - 4', status: 'Mata Kuliah Keahlian' },
  { angkatan: '2024', tahun: 'Angkatan 2024', sipil: 3.22, lingkungan: 3.29, listrik: 3.35, rataRataFakultas: 3.28, semesterAktif: 'Sem 2 - 3', status: 'Dasar Keteknikan' },
  { angkatan: '2025', tahun: 'Angkatan 2025', sipil: 3.16, lingkungan: 3.21, listrik: 3.28, rataRataFakultas: 3.21, semesterAktif: 'Sem 1 - 2', status: 'Sains Dasar & Kalkulus' },
  { angkatan: '2026', tahun: 'Angkatan 2026', sipil: 3.24, lingkungan: 3.30, listrik: 3.32, rataRataFakultas: 3.28, semesterAktif: 'Maba Sem 1', status: 'Matrikulasi & Pengenalan' },
];

// Graduation and Timeliness (KTW) data for all 3 Prodi
const GRADUATION_STATISTICS = [
  {
    prodiId: 'SIPIL',
    namaSingkat: 'S1 Sipil',
    namaLengkap: 'S1 Teknik Sipil',
    color: '#2563eb',
    ktwPersen: 83.5, // Kelulusan Tepat Waktu <= 8 Semester
    terlambatPersen: 16.5,
    masaStudiTahun: 4.1,
    totalLulusan: 46,
    cumLaude: 18,
    sangatMemuaskan: 24,
    memuaskan: 4,
    targetAkreditasiKTW: 75
  },
  {
    prodiId: 'LINGKUNGAN',
    namaSingkat: 'S1 Lingkungan',
    namaLengkap: 'S1 Teknik Lingkungan',
    color: '#059669',
    ktwPersen: 87.2, // Kelulusan Tepat Waktu <= 8 Semester
    terlambatPersen: 12.8,
    masaStudiTahun: 4.0,
    totalLulusan: 32,
    cumLaude: 14,
    sangatMemuaskan: 16,
    memuaskan: 2,
    targetAkreditasiKTW: 75
  },
  {
    prodiId: 'LISTRIK_D3',
    namaSingkat: 'D3 Listrik',
    namaLengkap: 'D3 Teknik Listrik',
    color: '#d97706',
    ktwPersen: 89.4, // Kelulusan Tepat Waktu <= 6 Semester
    terlambatPersen: 10.6,
    masaStudiTahun: 2.9,
    totalLulusan: 26,
    cumLaude: 11,
    sangatMemuaskan: 13,
    memuaskan: 2,
    targetAkreditasiKTW: 75
  }
];

// Semester progression benchmark (Preserving deep curriculum analysis)
const PRODI_SEMESTER_DATA: Record<string, Array<{
  semesterLabel: string;
  semesterNum: number;
  rataRataIPK: number;
  presensiRataRata: number;
  targetStandar: number;
  fokusKurikulum: string;
  jumlahMahasiswaSample: number;
}>> = {
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

export const AcademicAnalyticsChart: React.FC<AcademicAnalyticsChartProps> = ({
  selectedProdi,
  mahasiswaList,
  yudisiumList = []
}) => {
  const [viewMode, setViewMode] = useState<AnalyticsViewMode>('tren_ipk_prodi');
  const [prodiFilter, setProdiFilter] = useState<'ALL' | 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3'>('ALL');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Compute live averages blended from students database
  const liveStats = useMemo(() => {
    const sipilMhs = mahasiswaList.filter(m => m.prodiId === 'SIPIL' && (m.status === 'Aktif' || m.status === 'Tugas Akhir'));
    const lingMhs = mahasiswaList.filter(m => m.prodiId === 'LINGKUNGAN' && (m.status === 'Aktif' || m.status === 'Tugas Akhir'));
    const lstMhs = mahasiswaList.filter(m => m.prodiId === 'LISTRIK_D3' && (m.status === 'Aktif' || m.status === 'Tugas Akhir'));

    const calcAvg = (arr: Mahasiswa[]) => {
      if (arr.length === 0) return 3.35;
      const sum = arr.reduce((acc, m) => acc + (m.ipk || 0), 0);
      return parseFloat((sum / arr.length).toFixed(2));
    };

    const avgSipil = calcAvg(sipilMhs);
    const avgLing = calcAvg(lingMhs);
    const avgLst = calcAvg(lstMhs);
    const avgFakultas = parseFloat(((avgSipil + avgLing + avgLst) / 3).toFixed(2));

    // Live Yudisium counts
    const totalGraduates = yudisiumList.length > 0 ? yudisiumList.length : 104;
    const cumLaudeGraduates = yudisiumList.length > 0 
      ? yudisiumList.filter(y => y.predikat === 'Dengan Pujian (Cum Laude)').length
      : 43;
    const cumLaudePersen = Math.round((cumLaudeGraduates / totalGraduates) * 100);

    return {
      avgSipil,
      avgLing,
      avgLst,
      avgFakultas,
      totalGraduates,
      cumLaudePersen
    };
  }, [mahasiswaList, yudisiumList]);

  // Compute per-semester chart data for the focused prodi view
  const semesterFocusedData = useMemo(() => {
    const targetProdiId = prodiFilter === 'ALL' ? selectedProdi.id : prodiFilter;
    const rawBenchmark = PRODI_SEMESTER_DATA[targetProdiId] || PRODI_SEMESTER_DATA.SIPIL;
    const prodiStudents = mahasiswaList.filter(m => m.prodiId === targetProdiId);

    return rawBenchmark.map(item => {
      const matchingMhs = prodiStudents.filter(m => m.semester === item.semesterNum);
      let blendedIPK = item.rataRataIPK;
      let blendedPresensi = item.presensiRataRata;

      if (matchingMhs.length > 0) {
        const activeMhs = matchingMhs.filter(m => m.status === 'Aktif' || m.status === 'Tugas Akhir');
        const calcMhs = activeMhs.length > 0 ? activeMhs : matchingMhs;
        const liveIpkSum = calcMhs.reduce((acc, curr) => acc + (curr.ipk || 0), 0);
        const livePresensiSum = calcMhs.reduce((acc, curr) => acc + (curr.kehadiranPersen || 0), 0);
        blendedIPK = parseFloat(((item.rataRataIPK * 3 + (liveIpkSum / calcMhs.length)) / 4).toFixed(2));
        blendedPresensi = parseFloat(((item.presensiRataRata * 3 + (livePresensiSum / calcMhs.length)) / 4).toFixed(1));
      }

      return {
        ...item,
        rataRataIPK: blendedIPK,
        presensiRataRata: blendedPresensi
      };
    });
  }, [prodiFilter, selectedProdi.id, mahasiswaList]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      
      {/* Top Header & Visual Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Visualisasi Tren IPK &amp; Analisis Kelulusan Program Studi
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Recharts · LAM-TEKNIK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi komparatif indeks prestasi kumulatif (IPK), tingkat kelulusan tepat waktu (KTW), dan predikat yudisium Fakultas Teknik UNBARI.
          </p>
        </div>

        {/* Action Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* View Mode Tab Buttons */}
          <div className="flex flex-wrap items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode('tren_ipk_prodi')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'tren_ipk_prodi' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tren IPK
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lulusan_tahunan')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'lulusan_tahunan' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lulusan 4 Tahun (Bar)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('proyeksi_kelulusan')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'proyeksi_kelulusan' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Proyeksi Kelulusan (Area)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('ktw_tren_4tahun')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'ktw_tren_4tahun' 
                  ? 'bg-white text-emerald-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tren KTW 4 Tahun (Line)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('radar_cpl')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'radar_cpl' 
                  ? 'bg-white text-purple-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Radar CPL/OBE
            </button>
            <button
              type="button"
              onClick={() => setViewMode('sentimen_kepuasan')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'sentimen_kepuasan' 
                  ? 'bg-white text-amber-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sentimen &amp; Scatter SKS
            </button>
            <button
              type="button"
              onClick={() => setViewMode('predikat_kelulusan')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'predikat_kelulusan' 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Predikat
            </button>
            <button
              type="button"
              onClick={() => setViewMode('semester_fokus')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMode === 'semester_fokus' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Perkembangan Sem
            </button>
          </div>

          {/* Prodi Filter Selector */}
          <select
            value={prodiFilter}
            onChange={(e) => setProdiFilter(e.target.value as any)}
            className="text-xs font-semibold border border-slate-200 rounded-lg py-1 px-2.5 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">🏛️ Semua Prodi (Fakultas)</option>
            <option value="SIPIL">🏗️ S1 Teknik Sipil</option>
            <option value="LINGKUNGAN">🌿 S1 Teknik Lingkungan</option>
            <option value="LISTRIK_D3">⚡ D3 Teknik Listrik</option>
          </select>

          {/* Chart Style Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Tampilan Area / Garis"
              aria-label="Area Chart"
              className={`p-1.5 rounded-md transition-colors ${
                chartType === 'area' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              title="Tampilan Diagram Batang"
              aria-label="Bar Chart"
              className={`p-1.5 rounded-md transition-colors ${
                chartType === 'bar' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: TREN IPK KOMPARATIF ANTAR PROGRAM STUDI                 */}
      {/* ============================================================== */}
      {viewMode === 'tren_ipk_prodi' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Legenda Program Studi:</span>
              <span className="inline-flex items-center gap-1.5 text-blue-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                S1 Teknik Sipil (Rata-rata: {liveStats.avgSipil})
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                S1 Teknik Lingkungan (Rata-rata: {liveStats.avgLing})
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                D3 Teknik Listrik (Rata-rata: {liveStats.avgLst})
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Skala: 2.50 - 4.00 · Target LAM-Teknik: 3.25
            </span>
          </div>

          <div className="w-full h-[290px] sm:h-[330px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {chartType === 'area' ? (
                <AreaChart data={COHORT_IPK_BENCHMARKS} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSipil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorLingkungan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorListrik" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis 
                    domain={[2.8, 3.8]} 
                    ticks={[2.8, 3.0, 3.2, 3.4, 3.6, 3.8]} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    stroke="#cbd5e1"
                    tickFormatter={(val: number) => val.toFixed(2)}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white rounded-xl shadow-xl p-3 text-xs space-y-2 border border-slate-700 min-w-[230px]">
                            <div className="font-bold border-b border-slate-700 pb-1 flex items-center justify-between">
                              <span>{label}</span>
                              <span className="text-[10px] font-mono text-slate-400">{data.semesterAktif}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-blue-300">
                                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                  S1 Teknik Sipil:
                                </span>
                                <strong className="font-mono text-white text-sm">{data.sipil.toFixed(2)}</strong>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-emerald-300">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  S1 Teknik Lingkungan:
                                </span>
                                <strong className="font-mono text-white text-sm">{data.lingkungan.toFixed(2)}</strong>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-amber-300">
                                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                  D3 Teknik Listrik:
                                </span>
                                <strong className="font-mono text-white text-sm">{data.listrik.toFixed(2)}</strong>
                              </div>
                            </div>
                            <div className="pt-1.5 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-300">
                              <span>Rata-Rata FT UNBARI:</span>
                              <strong className="font-mono text-indigo-300">{data.rataRataFakultas.toFixed(2)}</strong>
                            </div>
                            <div className="text-[10px] text-slate-400 italic bg-slate-800/80 p-1.5 rounded">
                              Tahapan: {data.status}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine 
                    y={3.25} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Standar Mutu LAM-Teknik (3.25)', position: 'insideTopLeft', fill: '#059669', fontSize: 10, fontWeight: 700 }} 
                  />
                  {(prodiFilter === 'ALL' || prodiFilter === 'SIPIL') && (
                    <Area 
                      type="monotone" 
                      dataKey="sipil" 
                      name="S1 Teknik Sipil" 
                      stroke="#2563eb" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorSipil)" 
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {(prodiFilter === 'ALL' || prodiFilter === 'LINGKUNGAN') && (
                    <Area 
                      type="monotone" 
                      dataKey="lingkungan" 
                      name="S1 Teknik Lingkungan" 
                      stroke="#059669" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorLingkungan)" 
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {(prodiFilter === 'ALL' || prodiFilter === 'LISTRIK_D3') && (
                    <Area 
                      type="monotone" 
                      dataKey="listrik" 
                      name="D3 Teknik Listrik" 
                      stroke="#d97706" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorListrik)" 
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {prodiFilter === 'ALL' && (
                    <Line 
                      type="monotone" 
                      dataKey="rataRataFakultas" 
                      name="Rata-rata Fakultas" 
                      stroke="#7c3aed" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: '#7c3aed' }}
                    />
                  )}
                  <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </AreaChart>
              ) : (
                <ComposedChart data={COHORT_IPK_BENCHMARKS} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis 
                    domain={[2.8, 3.8]} 
                    ticks={[2.8, 3.0, 3.2, 3.4, 3.6, 3.8]} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    stroke="#cbd5e1"
                    tickFormatter={(val: number) => val.toFixed(2)}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1.5 min-w-[210px]">
                            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                              {label} ({data.semesterAktif})
                            </div>
                            <div className="flex items-center justify-between text-blue-700">
                              <span>S1 Teknik Sipil:</span>
                              <strong>{data.sipil.toFixed(2)}</strong>
                            </div>
                            <div className="flex items-center justify-between text-emerald-700">
                              <span>S1 Teknik Lingkungan:</span>
                              <strong>{data.lingkungan.toFixed(2)}</strong>
                            </div>
                            <div className="flex items-center justify-between text-amber-700">
                              <span>D3 Teknik Listrik:</span>
                              <strong>{data.listrik.toFixed(2)}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={3.25} stroke="#10b981" strokeDasharray="4 4" />
                  {(prodiFilter === 'ALL' || prodiFilter === 'SIPIL') && (
                    <Bar dataKey="sipil" name="S1 Teknik Sipil" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                  )}
                  {(prodiFilter === 'ALL' || prodiFilter === 'LINGKUNGAN') && (
                    <Bar dataKey="lingkungan" name="S1 Teknik Lingkungan" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                  )}
                  {(prodiFilter === 'ALL' || prodiFilter === 'LISTRIK_D3') && (
                    <Bar dataKey="listrik" name="D3 Teknik Listrik" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
                  )}
                  <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: PERBANDINGAN JUMLAH LULUSAN YUDISIUM 4 TAHUN (BARCHART)  */}
      {/* ============================================================== */}
      {viewMode === 'lulusan_tahunan' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Perbandingan Jumlah Lulusan Yudisium per Tahun Akademik (4 Tahun Terakhir)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Diagram batang komparatif output sarjana &amp; ahli madya prodi S1 Sipil, S1 Lingkungan, dan D3 Listrik FT UNBARI.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Pertumbuhan: +20.9% (86 &rarr; 104 Lulusan)
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Total Lulusan TA 2025/2026</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">104 Orang</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Tertinggi dalam 4 tahun</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Lulusan S1 Teknik Sipil</span>
              <span className="text-xl font-bold font-mono text-blue-700 mt-0.5 block">46 Orang</span>
              <span className="text-[10px] text-slate-500">44.2% dari total fakultas</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Lulusan S1 Lingkungan</span>
              <span className="text-xl font-bold font-mono text-emerald-700 mt-0.5 block">32 Orang</span>
              <span className="text-[10px] text-slate-500">30.8% dari total fakultas</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Lulusan D3 Teknik Listrik</span>
              <span className="text-xl font-bold font-mono text-amber-700 mt-0.5 block">26 Orang</span>
              <span className="text-[10px] text-slate-500">25.0% lulusan vokasi</span>
            </div>
          </div>

          <div className="w-full h-[300px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={GRADUATION_COHORT_ANNUAL} margin={{ top: 15, right: 15, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="tahunAkademik" tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `${v} Mhs`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '0.75rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(val: any, name: any) => [`${val} Orang Lulusan`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {(prodiFilter === 'ALL' || prodiFilter === 'SIPIL') && (
                  <Bar dataKey="sipil" name="S1 Teknik Sipil" fill="#2563eb" radius={[5, 5, 0, 0]} />
                )}
                {(prodiFilter === 'ALL' || prodiFilter === 'LINGKUNGAN') && (
                  <Bar dataKey="lingkungan" name="S1 Teknik Lingkungan" fill="#059669" radius={[5, 5, 0, 0]} />
                )}
                {(prodiFilter === 'ALL' || prodiFilter === 'LISTRIK_D3') && (
                  <Bar dataKey="listrik" name="D3 Teknik Listrik" fill="#d97706" radius={[5, 5, 0, 0]} />
                )}
                {prodiFilter === 'ALL' && (
                  <Bar dataKey="total" name="Total Lulusan FT UNBARI" fill="#1e293b" radius={[5, 5, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: PROYEKSI JUMLAH KELULUSAN SEMESTER BERIKUTNYA (AREACHART) */}
      {/* ============================================================== */}
      {viewMode === 'proyeksi_kelulusan' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Proyeksi Kelulusan Mahasiswa Semester Berikutnya (Recharts AreaChart)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Model estimasi kelulusan berbasis data historis mahasiswa tingkat akhir (Sem 7, 8, dan 9+) yang sedang mengambil Skripsi/TA.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-indigo-800 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Target Semester Berikutnya: 60 Lulusan
              </span>
            </div>
          </div>

          {/* Projection Indicator Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
              <span className="text-indigo-900 text-[11px] font-bold block">Target Lulusan Sem Depan</span>
              <span className="text-2xl font-bold font-mono text-indigo-950 mt-0.5 block">60 Calon</span>
              <span className="text-[10px] text-indigo-700">Proyeksi Model: 59 Orang (98.3%)</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Mhs Tingkat Akhir Aktif</span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-0.5 block">66 Mahasiswa</span>
              <span className="text-[10px] text-slate-500">Sem 7-8 &amp; Skripsi Terdaftar</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Estimasi Tepat Waktu</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 mt-0.5 block">52 Mahasiswa</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Tingkat KTW Proyeksi: 86.6%</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Perlu Intervensi Pembimbing</span>
              <span className="text-2xl font-bold font-mono text-amber-600 mt-0.5 block">7 Mahasiswa</span>
              <span className="text-[10px] text-amber-700">Monitoring bab 4 &amp; 5 Skripsi</span>
            </div>
          </div>

          <div className="w-full h-[300px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={PROJECTION_GRADUATION_DATA} margin={{ top: 15, right: 15, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRealisasiLulus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorProyeksiLulus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="periode" tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }} stroke="#cbd5e1" />
                <YAxis domain={[20, 75]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `${v} Mhs`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '0.75rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(val: any, name: any) => [`${val || 0} Mahasiswa`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="realisasiLulusan" 
                  name="Realisasi Jumlah Lulusan" 
                  stroke="#2563eb" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRealisasiLulus)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="proyeksiKelulusan" 
                  name="Proyeksi Kelulusan Semester Depan" 
                  stroke="#f59e0b" 
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#colorProyeksiLulus)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="targetLulusan" 
                  name="Target Kelulusan Kaprodi" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="3 3" 
                  dot={{ r: 4 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: TREN KELULUSAN TEPAT WAKTU 4 TAHUN TERAKHIR (LINECHART)    */}
      {/* ============================================================== */}
      {viewMode === 'ktw_tren_4tahun' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <LineChartIcon className="w-4 h-4 text-emerald-600" />
                Tren Kelulusan Tepat Waktu (KTW) 4 Tahun Terakhir (Recharts LineChart)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Memantau efisiensi program studi dalam memenuhi target akreditasi LAM-Teknik (&ge;75% mahasiswa lulus tepat waktu).
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Target LAM-Teknik: &ge; 75.0%
              </span>
            </div>
          </div>

          <div className="w-full h-[300px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={KTW_4_TAHUN_TREND} margin={{ top: 15, right: 20, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }} stroke="#cbd5e1" />
                <YAxis domain={[70, 95]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '0.75rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <ReferenceLine 
                  y={75} 
                  stroke="#dc2626" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Standar Minimum LAM-Teknik: 75%', fill: '#dc2626', fontSize: 10, position: 'insideTopLeft' }} 
                />
                <Line type="monotone" dataKey="sipil" name="S1 Teknik Sipil" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="lingkungan" name="S1 Teknik Lingkungan" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="listrik" name="D3 Teknik Listrik" stroke="#d97706" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="rataRataFakultas" name="Rata-rata FT UNBARI" stroke="#4f46e5" strokeWidth={3} strokeDasharray="3 3" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: RADAR CHART CAPAIAN PEMBELAJARAN (CPL/OBE) MAHASISWA      */}
      {/* ============================================================== */}
      {viewMode === 'radar_cpl' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                Pemetaan Capaian Pembelajaran Lulusan (CPL/OBE) Mahasiswa (Radar Chart)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sebaran kompetensi mahasiswa berdasarkan data nilai akademik terbaru pada 8 butir standar CPL KKNI Level 6 / LAM-Teknik.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Standar OBE: 75.0%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-8 w-full h-[320px] sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RadarChart data={CPL_OBE_RADAR_DATA}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="aspek" 
                    tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} 
                  />
                  <PolarRadiusAxis domain={[60, 100]} stroke="#cbd5e1" tick={{ fontSize: 9 }} />
                  <Radar 
                    name="S1 Teknik Sipil" 
                    dataKey="sipil" 
                    stroke="#2563eb" 
                    fill="#2563eb" 
                    fillOpacity={0.25} 
                  />
                  <Radar 
                    name="S1 Teknik Lingkungan" 
                    dataKey="lingkungan" 
                    stroke="#059669" 
                    fill="#059669" 
                    fillOpacity={0.25} 
                  />
                  <Radar 
                    name="D3 Teknik Listrik" 
                    dataKey="listrik" 
                    stroke="#d97706" 
                    fill="#d97706" 
                    fillOpacity={0.25} 
                  />
                  <Radar 
                    name="Batas Minimal OBE (75%)" 
                    dataKey="targetOBE" 
                    stroke="#dc2626" 
                    strokeDasharray="3 3" 
                    fill="none" 
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-4 space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Kompetensi Paling Unggul</span>
                <div className="font-bold text-slate-900">CPL-5: Etika &amp; Tanggung Jawab (88.5%)</div>
                <div className="font-bold text-slate-900">CPL-7: K3 &amp; Wawasan Lingkungan (89.5%)</div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Mahasiswa memiliki pemahaman keselamatan kerja konstruksi dan kelestarian DAS Batanghari yang sangat baik.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-blue-700 uppercase">Fokus Penguatan Kurikulum</span>
                <div className="font-bold text-blue-950">CPL-3: Desain Struktur &amp; Eksperimen Lab</div>
                <p className="text-[11px] text-blue-900/80 pt-1">
                  Perlu penambahan jam praktikum uji tanah pondasi dan perancangan perkerasan lentur pada semester genap.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: TREN SENTIMEN MAHASISWA & SCATTER SKS VS KEPUASAN        */}
      {/* ============================================================== */}
      {viewMode === 'sentimen_kepuasan' && (
        <div className="space-y-6">
          
          {/* SECTION A: TREN SENTIMEN KEPUASAN MAHASISWA (AREACHART) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-emerald-600" />
                  Visualisasi Tren Sentimen Mahasiswa terhadap Layanan Akademik Prodi
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Berdasarkan hasil survei kepuasan mahasiswa per semester (Layanan TU, Pengajaran, Sarana Lab, Bimbingan Skripsi).
                </p>
              </div>
              <span className="font-mono text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Skor Sentimen Terkini: 88.2% (Sangat Puas)
              </span>
            </div>

            <div className="w-full h-[250px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={SATISFACTION_SENTIMENT_DATA} margin={{ top: 15, right: 15, left: -5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSentimenAkademik" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="semester" tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }} stroke="#cbd5e1" />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="layananAkademik" name="Pelayanan Loket &amp; TU" stroke="#2563eb" fillOpacity={0.15} fill="#2563eb" />
                  <Area type="monotone" dataKey="pengajaranDosen" name="Kualitas Pengajaran Dosen" stroke="#10b981" fillOpacity={0.3} fill="url(#colorSentimenAkademik)" />
                  <Area type="monotone" dataKey="fasilitasLab" name="Fasilitas Lab &amp; Bengkel" stroke="#f59e0b" fillOpacity={0.1} fill="#f59e0b" />
                  <Area type="monotone" dataKey="bimbinganSkripsi" name="Bimbingan Tugas Akhir" stroke="#8b5cf6" fillOpacity={0.15} fill="#8b5cf6" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECTION B: SCATTER PLOT KORELASI SKS DOSEN VS KEPUASAN MAHASISWA */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Scatter Plot: Korelasi Beban SKS Mengajar Dosen vs Tingkat Kepuasan Mahasiswa (EDOM)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Membantu Kaprodi mengidentifikasi beban kerja dosen yang optimal (sweet spot 12–16 SKS) bagi kualitas pengajaran.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Zona Optimal BKD: 12 – 16 SKS
                </span>
              </div>
            </div>

            <div className="w-full h-[280px] sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    dataKey="sks" 
                    name="Beban SKS Mengajar" 
                    domain={[8, 20]} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    stroke="#cbd5e1"
                    tickFormatter={(v) => `${v} SKS`}
                    label={{ value: 'Beban SKS Mengajar Dosen per Semester', position: 'bottom', offset: 0, fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="kepuasanEdom" 
                    name="Skor EDOM Mahasiswa" 
                    domain={[3.2, 4.0]} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    stroke="#cbd5e1"
                    tickFormatter={(v) => v.toFixed(2)}
                    label={{ value: 'Kepuasan Mahasiswa (Skala 4.00)', angle: -90, position: 'left', offset: 10, fontSize: 11, fill: '#64748b' }}
                  />
                  <ZAxis range={[70, 70]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white rounded-xl shadow-xl p-3 text-xs space-y-1.5 border border-slate-700 min-w-[210px]">
                            <div className="font-bold text-white border-b border-slate-700 pb-1">
                              {data.dosenNama}
                            </div>
                            <div className="flex justify-between text-blue-300">
                              <span>Beban Mengajar:</span>
                              <strong>{data.sks} SKS</strong>
                            </div>
                            <div className="flex justify-between text-emerald-300">
                              <span>Skor Kepuasan EDOM:</span>
                              <strong>{data.kepuasanEdom.toFixed(2)} / 4.00</strong>
                            </div>
                            <div className="flex justify-between text-amber-300">
                              <span>Mahasiswa Bimbingan:</span>
                              <strong>{data.bimbingan} Mhs</strong>
                            </div>
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                              {data.sks > 16 
                                ? '⚠️ Beban berlebih berpotensi menurunkan responsivitas feedback' 
                                : data.sks < 12 
                                  ? 'ℹ️ Beban di bawah standar SN-Dikti' 
                                  : '✅ Beban kerja ideal (Standar SN-Dikti 12–16 SKS)'}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={12} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Min BKD (12 SKS)', fill: '#10b981', fontSize: 10, position: 'top' }} />
                  <ReferenceLine x={16} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Maks BKD (16 SKS)', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                  <ReferenceLine y={3.5} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Batas Puas: 3.50', fill: '#dc2626', fontSize: 10, position: 'right' }} />
                  <Scatter 
                    name="Dosen Fakultas Teknik" 
                    data={DOSEN_LOAD_SCATTER_DATA} 
                    fill="#2563eb"
                  >
                    {DOSEN_LOAD_SCATTER_DATA.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.sks > 16 ? '#f59e0b' : entry.sks < 12 ? '#94a3b8' : '#2563eb'} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: TINGKAT KELULUSAN TEPAT WAKTU (KTW)                     */}
      {/* ============================================================== */}
      {viewMode === 'tingkat_kelulusan' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700">
              Evaluasi Kelulusan Tepat Waktu (KTW: &le; 4 Thn S1, &le; 3 Thn D3) vs Masa Tempuh Studi
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-emerald-700 font-bold">🟢 Target KTW: &ge; 75%</span>
              <span className="text-slate-500">·</span>
              <span className="text-blue-700 font-bold">📊 Rata-rata KTW FT: 86.7%</span>
            </div>
          </div>

          <div className="w-full h-[290px] sm:h-[330px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={GRADUATION_STATISTICS} margin={{ top: 12, right: 20, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="namaSingkat" tick={{ fontSize: 12, fontWeight: 600, fill: '#334155' }} stroke="#cbd5e1" />
                <YAxis 
                  yAxisId="left"
                  domain={[60, 100]} 
                  ticks={[60, 70, 80, 90, 100]} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  stroke="#cbd5e1"
                  tickFormatter={(val: number) => `${val}%`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[2.0, 5.0]} 
                  ticks={[2.0, 3.0, 4.0, 5.0]} 
                  tick={{ fontSize: 11, fill: '#6366f1' }} 
                  stroke="#c7d2fe"
                  tickFormatter={(val: number) => `${val} Thn`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white rounded-xl shadow-xl p-3 text-xs space-y-2 border border-slate-700 min-w-[240px]">
                          <div className="font-bold border-b border-slate-700 pb-1 flex items-center justify-between">
                            <span>{data.namaLengkap}</span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                              {data.totalLulusan} Lulusan
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Kelulusan Tepat Waktu (KTW):</span>
                              <strong className="font-mono text-emerald-400 text-sm">{data.ktwPersen}%</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Rata-rata Masa Studi:</span>
                              <strong className="font-mono text-indigo-300 text-sm">{data.masaStudiTahun} Tahun</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Lulusan Cum Laude:</span>
                              <strong className="font-mono text-amber-300">{data.cumLaude} Orang ({Math.round((data.cumLaude / data.totalLulusan) * 100)}%)</strong>
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-slate-700/80 text-[10px] text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Memenuhi Standar Akreditasi Unggul LAM-Teknik (&ge;75%)</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine 
                  yAxisId="left" 
                  y={75} 
                  stroke="#10b981" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Batas Minimal KTW Akreditasi (75%)', position: 'insideTopLeft', fill: '#059669', fontSize: 10, fontWeight: 700 }} 
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="ktwPersen" 
                  name="Kelulusan Tepat Waktu (%)" 
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                >
                  {GRADUATION_STATISTICS.map((entry) => (
                    <Cell key={entry.prodiId} fill={entry.color} />
                  ))}
                </Bar>
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="masaStudiTahun" 
                  name="Rata-rata Masa Studi (Tahun)" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: DISTRIBUSI PREDIKAT KELULUSAN YUDISIUM                  */}
      {/* ============================================================== */}
      {viewMode === 'predikat_kelulusan' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700">
              Sebaran Predikat Kelulusan Mahasiswa (Cum Laude, Sangat Memuaskan, Memuaskan)
            </span>
            <span className="font-mono text-[11px] text-purple-700 font-bold">
              Total Lulusan Terdokumentasi: {liveStats.totalGraduates} Wisudawan
            </span>
          </div>

          <div className="w-full h-[290px] sm:h-[330px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={GRADUATION_STATISTICS} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="namaSingkat" tick={{ fontSize: 12, fontWeight: 600, fill: '#334155' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1.5 min-w-[210px]">
                          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                            <span>{data.namaLengkap}</span>
                            <span className="text-[10px] font-mono text-slate-500">{data.totalLulusan} Lulusan</span>
                          </div>
                          <div className="flex items-center justify-between text-amber-700 font-semibold">
                            <span>🏆 Dengan Pujian (Cum Laude):</span>
                            <span>{data.cumLaude} Orang</span>
                          </div>
                          <div className="flex items-center justify-between text-blue-700 font-semibold">
                            <span>🎖️ Sangat Memuaskan:</span>
                            <span>{data.sangatMemuaskan} Orang</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 font-semibold">
                            <span>📜 Memuaskan:</span>
                            <span>{data.memuaskan} Orang</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="cumLaude" name="Dengan Pujian (Cum Laude)" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="sangatMemuaskan" name="Sangat Memuaskan" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="memuaskan" name="Memuaskan" fill="#94a3b8" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 4: PERKEMBANGAN PER SEMESTER (FOKUS PRODI)                 */}
      {/* ============================================================== */}
      {viewMode === 'semester_fokus' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700">
              Progresi Semester 1 s.d. 8 Prodi {prodiFilter === 'ALL' ? selectedProdi.nama : prodiFilter} (IPK &amp; Presensi)
            </span>
            <span className="font-mono text-[11px] text-blue-700 font-semibold">
              Korelasi Presensi Kuliah &amp; Indeks Prestasi
            </span>
          </div>

          <div className="w-full h-[290px] sm:h-[330px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={semesterFocusedData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFocusIpk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="semesterLabel" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis 
                  yAxisId="left"
                  domain={[2.5, 4.0]} 
                  ticks={[2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0]} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  stroke="#cbd5e1"
                  tickFormatter={(val: number) => val.toFixed(2)}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[80, 100]} 
                  ticks={[80, 85, 90, 95, 100]} 
                  tick={{ fontSize: 10, fill: '#10b981' }} 
                  stroke="#a7f3d0"
                  tickFormatter={(val: number) => `${val}%`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1.5 min-w-[210px]">
                          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                            <span>{label}</span>
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-1 rounded">
                              {data.jumlahMahasiswaSample} Mhs
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-blue-700 font-semibold">
                            <span>Rata-rata IPK:</span>
                            <span className="font-mono text-sm">{data.rataRataIPK.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-700 font-semibold">
                            <span>Tingkat Presensi:</span>
                            <span className="font-mono text-sm">{data.presensiRataRata}%</span>
                          </div>
                          <div className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-1 rounded">
                            Fokus: {data.fokusKurikulum}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine yAxisId="left" y={3.25} stroke="#10b981" strokeDasharray="4 4" />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="rataRataIPK" 
                  name="Rata-rata IPK" 
                  stroke="#2563eb" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorFocusIpk)" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="presensiRataRata" 
                  name="Presensi Kuliah (%)" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }}
                />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* KPI METRIC STRIP (4 COLS)                                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
        
        {/* KPI 1: Rata-Rata IPK Fakultas */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Rata-Rata IPK FT</span>
            <Target className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900">
              {liveStats.avgFakultas}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
              +0.18
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Sipil: {liveStats.avgSipil} · Lingk: {liveStats.avgLing} · Listrik: {liveStats.avgLst}
          </div>
        </div>

        {/* KPI 2: Kelulusan Tepat Waktu (KTW) */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Kelulusan Tepat Waktu</span>
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-700">86.7%</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1 rounded">
              Unggul
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Batas Minimal LAM-Teknik &ge; 75%
          </div>
        </div>

        {/* KPI 3: Lulusan Cum Laude */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Lulusan Cum Laude</span>
            <Award className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-700">{liveStats.cumLaudePersen}%</span>
            <span className="text-[10px] font-medium text-slate-500">
              ({liveStats.totalGraduates} Wisudawan)
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            IPK &ge; 3.51 &amp; Selesai Tepat Waktu
          </div>
        </div>

        {/* KPI 4: Rata-Rata Masa Tempuh Studi */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Rata-Rata Masa Studi</span>
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900">3.9 Thn</span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1 rounded font-semibold">
              Efisien
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            S1: 4.0 - 4.1 Thn · D3: 2.9 Thn
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* ACADEMIC INSIGHT & RECOMMENDATION STRIP                        */}
      {/* ============================================================== */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/80 text-xs text-slate-700 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-blue-950 flex items-center gap-2">
            <span>Telaah Akademik &amp; Strategi Ketua Program Studi</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-600 font-normal">Dekan: <strong>Fadli Eka Yandra, ST., MT</strong></span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Data Recharts memperlihatkan tren positif konsisten di ketiga program studi. <strong>D3 Teknik Listrik</strong> mencatatkan persentase KTW tertinggi (89.4%) dengan rata-rata masa studi tercepat (2.9 tahun), disusul <strong>S1 Teknik Lingkungan</strong> (87.2%) dan <strong>S1 Teknik Sipil</strong> (83.5%). Seluruh program studi berhasil melampaui standar mutu LAM-Teknik (&ge; 75%). Rekomendasi Kaprodi: percepatan bimbingan bab 4 skripsi pada semester 7 untuk memastikan mahasiswa tidak memperpanjang masa studi ke semester 9.
          </p>
        </div>
      </div>

    </div>
  );
};
