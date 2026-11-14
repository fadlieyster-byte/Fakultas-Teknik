import React, { useState } from 'react';
import { 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Printer, 
  FileCheck, 
  UserCheck, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Download,
  Building,
  CreditCard,
  ChevronRight,
  BarChart3,
  FileText,
  Copy,
  Check,
  Calculator
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
  Cell
} from 'recharts';
import { 
  TagihanUktMahasiswa, 
  HonorariumDosenRecord, 
  AnggaranProdiLab, 
  ProgramStudiInfo,
  StatusPembayaranUkt,
  ProyeksiKebutuhanLab
} from '../types/index';
import { WAKIL_DEKAN_2, DEKAN_FAKULTAS_TEKNIK } from '../data/mockData';
import { KeuanganPrintModal } from './KeuanganPrintModal';
import { RincianUangKuliahModal } from './RincianUangKuliahModal';
import { PerencanaanAnggaranLabView } from './PerencanaanAnggaranLabView';
import { 
  KOMPONEN_UANG_KULIAH_RESMI, 
  TOTAL_UANG_KULIAH_RESMI, 
  TERBILANG_UANG_KULIAH_RESMI,
  INITIAL_PROYEKSI_KEBUTUHAN_LAB 
} from '../data/mockKeuanganData';

interface KeuanganViewProps {
  selectedProdi: ProgramStudiInfo;
  tagihanList: TagihanUktMahasiswa[];
  onUpdateTagihanList: (newList: TagihanUktMahasiswa[]) => void;
  honorList: HonorariumDosenRecord[];
  onUpdateHonorList: (newList: HonorariumDosenRecord[]) => void;
  anggaranList: AnggaranProdiLab[];
  onShowToast?: (msg: string) => void;
}

// Historical 3-Year UKT Income Trend for FT UNBARI Programs (in Million Rupiah)
const UKT_TREND_3_TAHUN = [
  { tahunAkademik: '2024/2025', sipil: 342.5, lingkungan: 218.0, listrik: 165.2, total: 725.7, kolektibilitas: 88.4 },
  { tahunAkademik: '2025/2026', sipil: 368.0, lingkungan: 234.5, listrik: 172.0, total: 774.5, kolektibilitas: 91.2 },
  { tahunAkademik: '2026/2027 (Aktif)', sipil: 395.0, lingkungan: 252.0, listrik: 184.5, total: 831.5, kolektibilitas: 93.8 },
];

export const KeuanganView: React.FC<KeuanganViewProps> = ({
  selectedProdi,
  tagihanList,
  onUpdateTagihanList,
  honorList,
  onUpdateHonorList,
  anggaranList,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'UKT' | 'RINCIAN' | 'BEBAS_KEUANGAN' | 'HONOR' | 'ANGGARAN'>('UKT');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState<string>('ALL'); // 'ALL' or 'SIPIL', 'LINGKUNGAN', 'LISTRIK_D3'
  const [filterStatus, setFilterStatus] = useState<string>('ALL'); // 'ALL' or StatusPembayaranUkt
  const [selectedUktItem, setSelectedUktItem] = useState<TagihanUktMahasiswa | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<'KWITANSI_UKT' | 'SURAT_BEBAS_KEUANGAN' | 'REKAP_HONOR' | 'RINCIAN_UANG_KULIAH'>('KWITANSI_UKT');
  const [uktChartMode, setUktChartMode] = useState<'per_prodi' | 'total'>('per_prodi');
  const [isRincianModalOpen, setIsRincianModalOpen] = useState(false);
  const [rincianSelectedItem, setRincianSelectedItem] = useState<TagihanUktMahasiswa | null>(null);
  const [rincianFilterCategory, setRincianFilterCategory] = useState<string>('ALL');
  const [rincianSimulasiCicilan, setRincianSimulasiCicilan] = useState<'lunas' | 'cicilan_3_tahap'>('lunas');
  const [rincianCopied, setRincianCopied] = useState(false);

  // Check if lab budget projection exceeds available ceiling for global warning banner
  const [proyeksiLabList] = useState<ProyeksiKebutuhanLab[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v14_proyeksi_lab');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_PROYEKSI_KEBUTUHAN_LAB;
  });

  const totalSisaPlafonLabAll = proyeksiLabList.reduce((acc, curr) => acc + curr.sisaPlafonTersedia, 0);
  const totalProyeksiLabAll = proyeksiLabList.reduce((acc, curr) => acc + curr.proyeksiKebutuhan, 0);
  const isGlobalLabDefisit = totalProyeksiLabAll > totalSisaPlafonLabAll;

  // Filtered UKT records
  const filteredTagihan = tagihanList.filter(item => {
    const matchesQuery = 
      item.namaMahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nim.includes(searchQuery);
    const matchesProdi = filterProdi === 'ALL' || item.prodiId === filterProdi;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesQuery && matchesProdi && matchesStatus;
  });

  // Calculate high-level financial KPIs
  const totalTagihanAll = tagihanList.reduce((acc, curr) => acc + curr.nominalTagihan, 0);
  const totalTerbayarAll = tagihanList.reduce((acc, curr) => acc + curr.nominalTerbayar, 0);
  const totalTunggakanAll = tagihanList.reduce((acc, curr) => acc + curr.sisaTunggakan, 0);
  const persenPelunasan = totalTagihanAll > 0 ? Math.round((totalTerbayarAll / totalTagihanAll) * 100) : 0;
  
  const totalBebasKeuangan = tagihanList.filter(t => t.bebasKeuanganUjian).length;
  const totalMenunggak = tagihanList.filter(t => t.status === 'Menunggak').length;

  // Handler to toggle Bebas Keuangan status
  const handleToggleBebasKeuangan = (id: string) => {
    const updated = tagihanList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          bebasKeuanganUjian: !item.bebasKeuanganUjian
        };
      }
      return item;
    });
    onUpdateTagihanList(updated);
  };

  // Handler to mark as Lunas
  const handlePelunasanUkt = (id: string) => {
    const updated = tagihanList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          nominalTerbayar: item.nominalTagihan,
          sisaTunggakan: 0,
          status: 'Lunas' as StatusPembayaranUkt,
          tanggalBayarTerakhir: new Date().toISOString().split('T')[0],
          nomorTransaksiBank: `BNI-${Math.floor(100000 + Math.random() * 900000)}`,
          bebasKeuanganUjian: true
        };
      }
      return item;
    });
    onUpdateTagihanList(updated);
  };

  const handleOpenPrint = (mode: 'KWITANSI_UKT' | 'SURAT_BEBAS_KEUANGAN' | 'REKAP_HONOR' | 'RINCIAN_UANG_KULIAH', item?: TagihanUktMahasiswa) => {
    if (item) setSelectedUktItem(item);
    setPrintMode(mode);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header Banner & Leadership Callout */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 rounded-2xl text-white p-6 sm:p-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Tata Kelola Keuangan Fakultas Teknik UNBARI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Modul Administrasi Keuangan, SPP &amp; Honor Dosen
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1 leading-relaxed">
            Pengelolaan tagihan UKT/SPP mahasiswa, validasi bebas administrasi keuangan syarat seminar proposal, sidang skripsi, honorarium dosen &amp; serapan laboratorium.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRincianSelectedItem(null);
                setIsRincianModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rincian Biaya Kuliah Resmi (Rp 6.206.500)</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenPrint('RINCIAN_UANG_KULIAH')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 rounded-xl text-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Slip Tarif Baku A4</span>
            </button>
          </div>
        </div>

        {/* Leadership card - Wadek II */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-full bg-blue-100 border-2 border-emerald-400 flex items-center justify-center overflow-hidden shrink-0">
            {WAKIL_DEKAN_2.fotoUrl ? (
              <img src={WAKIL_DEKAN_2.fotoUrl} alt={WAKIL_DEKAN_2.nama} className="w-full h-full object-cover" />
            ) : (
              <UserCheck className="w-6 h-6 text-blue-900" />
            )}
          </div>
          <div className="text-left">
            <div className="text-[10px] text-blue-200 uppercase font-semibold">Penanggung Jawab Keuangan</div>
            <div className="text-xs font-bold text-white">{WAKIL_DEKAN_2.nama}</div>
            <div className="text-[11px] text-emerald-300 font-medium">Wakil Dekan II FT UNBARI</div>
          </div>
        </div>
      </div>

      {/* Alert Berbasis Logika: Proyeksi Kebutuhan Lab Melampaui Sisa Plafon Anggaran */}
      {isGlobalLabDefisit && (
        <div className="bg-linear-to-r from-red-600 via-rose-600 to-amber-700 text-white rounded-2xl p-4.5 shadow-lg border border-red-400/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-white shadow-inner">
              <AlertTriangle className="w-6 h-6 text-amber-200 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-red-700 shadow-xs">
                  Peringatan Defisit Plafon Lab
                </span>
                <span className="text-xs text-red-100 font-medium">
                  Semester Berjalan TA 2026/2027
                </span>
              </div>
              <h4 className="text-sm md:text-base font-extrabold text-white mt-1">
                Akumulasi Proyeksi Dana Operasional Lab (Rp {(totalProyeksiLabAll / 1000000).toFixed(1)} Jt) Melampaui Sisa Plafon (Rp {(totalSisaPlafonLabAll / 1000000).toFixed(1)} Jt)
              </h4>
              <p className="text-xs text-red-100/90 mt-0.5 leading-relaxed">
                Terdeteksi potensi defisit anggaran laboratorium fakultas sebesar <strong className="text-white underline">Rp {((totalProyeksiLabAll - totalSisaPlafonLabAll) / 1000000).toFixed(2)} Jt</strong> (+{totalSisaPlafonLabAll > 0 ? Math.round(((totalProyeksiLabAll - totalSisaPlafonLabAll) / totalSisaPlafonLabAll) * 100) : 0}% over-ceiling). Diperlukan rasionalisasi pos belanja atau revisi RKAF bersama Wadek II.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('ANGGARAN')}
              className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Buka Proyeksi &amp; Rasionalisasi</span>
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Penerimaan SPP/UKT</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              Rp {(totalTerbayarAll / 1000000).toFixed(1)} Jt
            </div>
            <span className="text-[11px] text-slate-500">
              dari pagu Rp {(totalTagihanAll / 1000000).toFixed(1)} Jt
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Persentase Pelunasan</span>
            <div className="text-xl font-black text-emerald-600 mt-1">
              {persenPelunasan}%
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              Sisa Tunggakan: Rp {(totalTunggakanAll / 1000000).toFixed(1)} Jt
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bebas Tunggakan Ujian</span>
            <div className="text-xl font-black text-blue-900 mt-1">
              {totalBebasKeuangan} Mahasiswa
            </div>
            <span className="text-[11px] text-blue-700">
              Terverifikasi Syarat Sempro/Sidang/Wisuda
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Menunggak &amp; Cicilan</span>
            <div className="text-xl font-black text-amber-600 mt-1">
              {totalMenunggak} Mahasiswa
            </div>
            <span className="text-[11px] text-amber-700">
              Perlu Notifikasi Dispensasi
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('UKT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'UKT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Monitoring UKT &amp; SPP Mahasiswa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('RINCIAN')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'RINCIAN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Rincian Biaya Kuliah (16 Item - Rp 6.206.500)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('BEBAS_KEUANGAN')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'BEBAS_KEUANGAN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Validasi Bebas Keuangan (Ujian &amp; Wisuda)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('HONOR')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'HONOR'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Honorarium Dosen &amp; Penguji</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ANGGARAN')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'ANGGARAN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tren Realisasi &amp; Proyeksi Anggaran Lab</span>
            {isGlobalLabDefisit && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>

        {/* Global Print Rekap Button */}
        {activeSubTab === 'HONOR' && (
          <button
            type="button"
            onClick={() => handleOpenPrint('REKAP_HONOR')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-700" />
            <span>Cetak Rekap Honor ke Printer Default</span>
          </button>
        )}
      </div>

      {/* TAB CONTENT 1: MONITORING UKT & SPP MAHASISWA */}
      {activeSubTab === 'UKT' && (
        <div className="space-y-4">
          
          {/* VISUALISASI TREN UKT MAHASISWA 3 TAHUN TERAKHIR (RECHARTS BARCHART) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 mt-0.5">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Visualisasi Tren Pendapatan UKT Mahasiswa (3 Tahun Terakhir)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      Recharts BarChart
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monitoring fluktuasi dan pertumbuhan penerimaan UKT Fakultas Teknik UNBARI (dalam Juta Rupiah).
                  </p>
                </div>
              </div>

              {/* Toggle breakdown mode */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setUktChartMode('per_prodi')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    uktChartMode === 'per_prodi'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Per Program Studi
                </button>
                <button
                  type="button"
                  onClick={() => setUktChartMode('total')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    uktChartMode === 'total'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Total Fakultas
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 text-[11px] font-medium block">Penerimaan TA 2026/2027</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 font-mono mt-0.5 block">Rp 831,5 Jt</span>
                <span className="text-[10px] text-emerald-600 font-semibold">▲ +7.4% dibanding tahun lalu</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 text-[11px] font-medium block">Rata-rata Kolektibilitas</span>
                <span className="text-base sm:text-lg font-bold text-emerald-700 font-mono mt-0.5 block">93.8%</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Tercapai &gt; Standar 90%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 text-[11px] font-medium block">Kontribusi S1 Sipil</span>
                <span className="text-base sm:text-lg font-bold text-blue-800 font-mono mt-0.5 block">47.5%</span>
                <span className="text-[10px] text-slate-500">Rp 395 Juta (TA 2026/2027)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 text-[11px] font-medium block">Kontribusi Lingkungan &amp; Listrik</span>
                <span className="text-base sm:text-lg font-bold text-indigo-900 font-mono mt-0.5 block">52.5%</span>
                <span className="text-[10px] text-slate-500">Rp 436,5 Juta Gabungan</span>
              </div>
            </div>

            {/* Recharts BarChart container */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={UKT_TREND_3_TAHUN}
                  margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="tahunAkademik" 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(v) => `Rp ${v} Jt`}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '0.75rem',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(val: any, name: any) => [`Rp ${val} Juta`, name]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  {uktChartMode === 'per_prodi' ? (
                    <>
                      <Bar dataKey="sipil" name="S1 Teknik Sipil" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="lingkungan" name="S1 Teknik Lingkungan" fill="#059669" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="listrik" name="D3 Teknik Listrik" fill="#d97706" radius={[6, 6, 0, 0]} />
                    </>
                  ) : (
                    <Bar dataKey="total" name="Total Penerimaan UKT Fakultas Teknik" fill="#1e293b" radius={[6, 6, 0, 0]}>
                      {UKT_TREND_3_TAHUN.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 2 ? '#2563eb' : '#475569'} />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama atau NIM Mahasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span>Prodi:</span>
              </div>
              <select
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Semua Program Studi FT</option>
                <option value="SIPIL">S1 Teknik Sipil</option>
                <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
                <option value="LISTRIK_D3">D3 Teknik Listrik</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Semua Status</option>
                <option value="Lunas">Lunas</option>
                <option value="Cicilan">Cicilan</option>
                <option value="Dispensasi">Dispensasi</option>
                <option value="Menunggak">Menunggak</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mahasiswa / NIM</th>
                  <th className="py-3 px-4">Program Studi</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-right">Tagihan UKT</th>
                  <th className="py-3 px-4 text-right">Terbayar</th>
                  <th className="py-3 px-4 text-right">Sisa Tunggakan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Bebas Ujian</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTagihan.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      Tidak ada data tagihan UKT mahasiswa yang cocok dengan pencarian atau filter.
                    </td>
                  </tr>
                ) : (
                  filteredTagihan.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.namaMahasiswa}</div>
                        <div className="text-[11px] font-mono text-slate-500">NIM: {item.nim} &bull; Th {item.angkatan}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {item.prodiId === 'SIPIL' ? 'S1 Teknik Sipil' :
                         item.prodiId === 'LINGKUNGAN' ? 'S1 Teknik Lingkungan' : 'D3 Teknik Listrik'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        Sem {item.semester}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        Rp {item.nominalTagihan.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                        Rp {item.nominalTerbayar.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-red-600">
                        Rp {item.sisaTunggakan.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'Cicilan' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'Dispensasi' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBebasKeuangan(item.id)}
                          className={`p-1 rounded-md transition-colors ${
                            item.bebasKeuanganUjian 
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' 
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={item.bebasKeuanganUjian ? 'Bebas Keuangan Aktif (Klik untuk ubah)' : 'Belum Bebas Keuangan (Klik untuk setujui)'}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {item.status !== 'Lunas' && (
                          <button
                            type="button"
                            onClick={() => handlePelunasanUkt(item.id)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded text-[11px] border border-emerald-200 transition-colors"
                            title="Tandai pembayaran telah lunas"
                          >
                            Lunaskan
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setRincianSelectedItem(item);
                            setIsRincianModalOpen(true);
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold rounded text-[11px] border border-emerald-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Lihat 16 Item Komponen Rincian Uang Kuliah"
                        >
                          <FileText className="w-3 h-3 text-emerald-700" />
                          <span>Rincian</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPrint('KWITANSI_UKT', item)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded text-[11px] border border-slate-200 transition-colors inline-flex items-center gap-1"
                          title="Cetak Kwitansi Pembayaran Resmi"
                        >
                          <Printer className="w-3 h-3 text-blue-600" />
                          <span>Kwitansi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPrint('SURAT_BEBAS_KEUANGAN', item)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold rounded text-[11px] border border-blue-200 transition-colors inline-flex items-center gap-1"
                          title="Cetak Surat Bebas Administrasi Keuangan (SKBK)"
                        >
                          <FileCheck className="w-3 h-3 text-blue-700" />
                          <span>SKBK</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* TAB CONTENT: RINCIAN RESMI KOMPONEN UANG KULIAH (16 ITEM - RP 6.206.500) */}
      {activeSubTab === 'RINCIAN' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img 
                  src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
                  alt="Logo Universitas Batanghari" 
                  className="w-14 h-14 object-contain bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0" 
                />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <span>Fakultas Teknik Universitas Batanghari</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-extrabold">TA 2026/2027</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                    Rincian Komponen Biaya Pendidikan &amp; Uang Kuliah Mahasiswa
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Standar tarif resmi penetapan Yayasan Pendidikan Jambi untuk mahasiswa Fakultas Teknik UNBARI sebesar <strong className="text-blue-900 font-bold">Rp 6.206.500,-</strong> yang terbagi ke dalam 16 item komponen perkuliahan, pengembangan mutu, serta kemahasiswaan.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const textLines = [
                      `RINCIAN UANG KULIAH FAKULTAS TEKNIK UNIVERSITAS BATANGHARI`,
                      `Tahun Akademik: 2026/2027`,
                      `Standar Tarif Resmi FT UNBARI`,
                      `--------------------------------------------------`,
                      ...KOMPONEN_UANG_KULIAH_RESMI.map(it => `${it.no}. ${it.namaItem.padEnd(20, ' ')} : Rp ${it.nominal.toLocaleString('id-ID')}`),
                      `--------------------------------------------------`,
                      `TOTAL TAGIHAN : Rp ${TOTAL_UANG_KULIAH_RESMI.toLocaleString('id-ID')}`,
                      `Terbilang : ${TERBILANG_UANG_KULIAH_RESMI}`,
                      `--------------------------------------------------`,
                      `Rekening Resmi Pembayaran:`,
                      `Bank BNI Cab. Jambi No. Rek: 0234-8899-01 (a.n Yayasan Pendidikan Jambi)`,
                      `Bank Mandiri No. Rek: 110-00-9988-12 (a.n Yayasan Pendidikan Jambi)`
                    ].join('\n');

                    navigator.clipboard.writeText(textLines).then(() => {
                      setRincianCopied(true);
                      setTimeout(() => setRincianCopied(false), 2000);
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
                  title="Salin Rincian ke Format Teks WhatsApp"
                >
                  {rincianCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{rincianCopied ? 'Tersalin!' : 'Salin Format Teks'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPrint('RINCIAN_UANG_KULIAH')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="Cetak Rincian ke Dokumen Resmi A4"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen Resmi A4</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-blue-900 uppercase">Total Uang Kuliah Resmi</span>
                <div className="text-xl sm:text-2xl font-black text-blue-950 font-mono mt-0.5">
                  Rp {TOTAL_UANG_KULIAH_RESMI.toLocaleString('id-ID')},-
                </div>
                <span className="text-[10px] text-blue-700 font-medium">Baku 16 Pos Biaya Pendidikan</span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-emerald-900 uppercase">Biaya Pokok (SPP + SKS)</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-950 font-mono mt-0.5">
                  Rp 3.500.000,-
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">56.4% dari total tagihan</span>
              </div>

              <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-purple-900 uppercase">Pengembangan &amp; Mutu</span>
                <div className="text-xl sm:text-2xl font-black text-purple-950 font-mono mt-0.5">
                  Rp 2.000.000,-
                </div>
                <span className="text-[10px] text-purple-700 font-medium">Gedung Kampus &amp; Akreditasi</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-amber-900 uppercase">Administrasi &amp; Mahasiswa</span>
                <div className="text-xl sm:text-2xl font-black text-amber-950 font-mono mt-0.5">
                  Rp 706.500,-
                </div>
                <span className="text-[10px] text-amber-800 font-medium">KTM, Jaket, Registrasi &amp; PBMP</span>
              </div>
            </div>

            {/* Terbilang Banner */}
            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase tracking-wide text-[11px]">Terbilang:</span>
                <span className="font-bold text-slate-900 italic font-serif text-sm">
                  "{TERBILANG_UANG_KULIAH_RESMI}"
                </span>
              </div>
              <span className="text-[11px] text-blue-900 font-bold bg-blue-100/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                Ketetapan Yayasan Pendidikan Jambi
              </span>
            </div>
          </div>

          {/* Interactive Filters & Installment Simulator Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Filter Kategori:</span>
              </span>
              {[
                { id: 'ALL', label: 'Semua Item (16)' },
                { id: 'Pokok Perkuliahan', label: 'Pokok Perkuliahan' },
                { id: 'Pengembangan Kampus', label: 'Pengembangan' },
                { id: 'Administrasi & Registrasi', label: 'Administrasi' },
                { id: 'Kemahasiswaan', label: 'Kemahasiswaan' },
                { id: 'Lainnya', label: 'Lainnya' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setRincianFilterCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    rincianFilterCategory === cat.id
                      ? 'bg-blue-800 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[11px] font-semibold text-slate-500 px-2">Skema Pembayaran:</span>
              <button
                type="button"
                onClick={() => setRincianSimulasiCicilan('lunas')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  rincianSimulasiCicilan === 'lunas' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Penuh Sekaligus (100%)
              </button>
              <button
                type="button"
                onClick={() => setRincianSimulasiCicilan('cicilan_3_tahap')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  rincianSimulasiCicilan === 'cicilan_3_tahap' ? 'bg-blue-800 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cicilan 3 Tahap
              </button>
            </div>
          </div>

          {/* Installment Scheme Cards (When Enabled) */}
          {rincianSimulasiCicilan === 'cicilan_3_tahap' && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 text-xs space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                <Calculator className="w-4 h-4 text-amber-700" />
                <span>Simulasi Skema Pembayaran Cicilan 3 Tahap FT UNBARI</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Kebijakan Dekanat FT UNBARI memberikan kemudahan dispensasi pembayaran bertahap bagi mahasiswa tanpa dikenakan bunga:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Tahap 1 (Awal Semester / Registrasi)</div>
                  <div className="text-lg font-black text-amber-950 font-mono mt-0.5">Rp 3.103.250,-</div>
                  <span className="text-[11px] text-amber-700 font-medium">50% &bull; Syarat aktif kuliah &amp; pengisian KRS</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Tahap 2 (Sebelum UTS)</div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-0.5">Rp 1.551.625,-</div>
                  <span className="text-[11px] text-slate-600 font-medium">25% &bull; Syarat cetak Kartu Ujian Tengah Semester</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Tahap 3 (Sebelum UAS)</div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-0.5">Rp 1.551.625,-</div>
                  <span className="text-[11px] text-slate-600 font-medium">25% &bull; Syarat cetak Kartu Ujian Akhir &amp; KHS</span>
                </div>
              </div>
            </div>
          )}

          {/* Complete 16-Item Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Tabel Rincian 16 Pos Komponen Uang Kuliah
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Menampilkan {rincianFilterCategory === 'ALL' ? '16' : KOMPONEN_UANG_KULIAH_RESMI.filter(it => it.kategori === rincianFilterCategory).length} item
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Item Komponen</th>
                    <th className="py-3 px-4">Kategori Pos</th>
                    <th className="py-3 px-4">Keterangan / Peruntukan</th>
                    <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                    <th className="py-3 px-4 text-center">Porsi (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {KOMPONEN_UANG_KULIAH_RESMI
                    .filter(it => rincianFilterCategory === 'ALL' || it.kategori === rincianFilterCategory)
                    .map((item) => {
                      const porsi = ((item.nominal / TOTAL_UANG_KULIAH_RESMI) * 100).toFixed(1);
                      return (
                        <tr key={item.no} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-500">
                            {item.no}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            {item.namaItem}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.kategori === 'Pokok Perkuliahan' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              item.kategori === 'Pengembangan Kampus' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                              item.kategori === 'Kemahasiswaan' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                              item.kategori === 'Administrasi & Registrasi' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {item.kategori}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                            {item.keterangan}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                            {item.nominal === 0 ? (
                              <span className="text-slate-400 font-normal">Rp. 0,- (Disubsidi)</span>
                            ) : (
                              <span>Rp. {item.nominal.toLocaleString('id-ID')},-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-500">
                            {item.nominal === 0 ? '0%' : `${porsi}%`}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-black text-slate-900">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                      Total Biaya Uang Kuliah :
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm sm:text-base text-blue-950 font-black bg-blue-100/50">
                      Rp. {TOTAL_UANG_KULIAH_RESMI.toLocaleString('id-ID')},-
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-blue-950 font-bold bg-blue-100/50">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Account Information Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <Building className="w-4 h-4 text-blue-700" />
              <span>Rekening Resmi Penerimaan Pembayaran Mahasiswa FT UNBARI</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[11px] font-semibold text-slate-500">Bank BNI (Virtual Account / Teller Cab. Jambi)</div>
                <div className="text-base font-mono font-bold text-blue-900 mt-1">0234-8899-01</div>
                <div className="text-[11px] text-slate-700 font-medium mt-0.5">a.n Yayasan Pendidikan Jambi - FT UNBARI</div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[11px] font-semibold text-slate-500">Bank Mandiri (Cabang Gatot Subroto Jambi)</div>
                <div className="text-base font-mono font-bold text-slate-900 mt-1">110-00-9988-12</div>
                <div className="text-[11px] text-slate-700 font-medium mt-0.5">a.n Yayasan Pendidikan Jambi</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: VALIDASI BEBAS KEUANGAN SYARAT UJIAN */}
      {activeSubTab === 'BEBAS_KEUANGAN' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Validasi Bebas Administrasi Keuangan untuk Ujian Proposal, Sidang TA &amp; Yudisium</div>
              <p className="mt-1 leading-relaxed text-amber-800">
                Sesuai peraturan Dekanat FT UNBARI No. 04/SK-FT/2024, seluruh mahasiswa yang mengajukan Seminar Proposal, Sidang Tugas Akhir / Skripsi, dan Yudisium wajib memperoleh <strong>Surat Keterangan Bebas Administrasi Keuangan (SKBK)</strong> yang ditandatangani oleh Wakil Dekan II (Leily Wustha Johar, ST., MT).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tagihanList.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      NIM: {item.nim}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.bebasKeuanganUjian ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.bebasKeuanganUjian ? 'BEBAS TUNGGAKAN' : 'BELUM BEBAS'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{item.namaMahasiswa}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.prodiId === 'SIPIL' ? 'S1 Teknik Sipil' :
                     item.prodiId === 'LINGKUNGAN' ? 'S1 Teknik Lingkungan' : 'D3 Teknik Listrik'} &bull; Sem {item.semester}
                  </div>

                  <div className="mt-3 bg-slate-50 p-2.5 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status Pembayaran:</span>
                      <span className="font-semibold text-slate-800">{item.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sisa Tunggakan:</span>
                      <span className="font-mono font-bold text-slate-900">Rp {item.sisaTunggakan.toLocaleString('id-ID')}</span>
                    </div>
                    {item.catatanDispensasi && (
                      <div className="text-[10px] text-amber-800 italic pt-1 border-t border-slate-200 mt-1">
                        Catatan: {item.catatanDispensasi}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleBebasKeuangan(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-1 ${
                      item.bebasKeuanganUjian 
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {item.bebasKeuanganUjian ? 'Batalkan Izin' : 'Verifikasi Bebas Keuangan'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPrint('SURAT_BEBAS_KEUANGAN', item)}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg border border-blue-200 transition-colors"
                    title="Cetak Surat Bebas Administrasi Keuangan (SKBK) ke printer default"
                  >
                    <Printer className="w-4 h-4 text-blue-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: HONORARIUM DOSEN */}
      {activeSubTab === 'HONOR' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rekapitulasi Honorarium Mengajar, Penguji &amp; Pembimbing</h3>
              <p className="text-xs text-slate-500">Periode: Oktober 2026 &bull; Fakultas Teknik Universitas Batanghari</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenPrint('REKAP_HONOR')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekap Honor (Ctrl+P)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Dosen / NIDN</th>
                  <th className="py-3 px-4">Jenis Honor &amp; Deskripsi</th>
                  <th className="py-3 px-4 text-center">Volume</th>
                  <th className="py-3 px-4 text-right">Tarif</th>
                  <th className="py-3 px-4 text-right">Total Bruto</th>
                  <th className="py-3 px-4 text-right">PPh 21 (5%)</th>
                  <th className="py-3 px-4 text-right">Total Netto</th>
                  <th className="py-3 px-4 text-center">Status Pencairan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {honorList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.namaDosen}</div>
                      <div className="text-[11px] font-mono text-slate-500">NIDN: {item.nidn} &bull; {item.namaBank}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.jenisHonor}</div>
                      <div className="text-[11px] text-slate-500">{item.deskripsi}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                      {item.volume} {item.satuan}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      Rp {item.tarifSatuan.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      Rp {item.totalBruto.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-red-600">
                      -Rp {item.potonganPph21.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-800">
                      Rp {item.totalNetto.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Sudah Ditransfer' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Siap Dicairkan' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: TREN REALISASI & PROYEKSI ANGGARAN LAB */}
      {activeSubTab === 'ANGGARAN' && (
        <div className="space-y-6">
          <PerencanaanAnggaranLabView
            selectedProdi={selectedProdi}
            anggaranList={anggaranList}
            onShowToast={onShowToast}
            onOpenPrint={handleOpenPrint}
          />

          {/* RKAF Pos Anggaran Fakultas & Prodi Detail List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Daftar Rincian Pos Anggaran Operasional (RKAF FT UNBARI)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitoring pagu plafon dan sisa alokasi dana per pos kegiatan fakultas dan program studi
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                Total {anggaranList.length} Pos Terdaftar
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {anggaranList.map((item) => (
                <div key={item.id} className="bg-slate-50/60 border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100/80 text-blue-800 rounded border border-blue-200 uppercase">
                        {item.kategori}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {item.persentaseSerapan}% Terserap
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.namaPosAnggaran}</h4>
                    <div className="text-[11px] text-slate-500 mt-1">
                      PJ: <span className="font-semibold text-slate-700">{item.penanggungJawab}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${
                          item.persentaseSerapan >= 90 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(item.persentaseSerapan, 100)}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-semibold">Pagu</span>
                        <div className="font-mono text-xs font-bold text-slate-800">
                          Rp {(item.paguAnggaran / 1000000).toFixed(1)} Jt
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-semibold">Terpakai</span>
                        <div className="font-mono text-xs font-bold text-blue-700">
                          Rp {(item.realisasiTerpakai / 1000000).toFixed(1)} Jt
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-semibold">Sisa Dana</span>
                        <div className="font-mono text-xs font-bold text-emerald-700">
                          Rp {(item.sisaAnggaran / 1000000).toFixed(1)} Jt
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keuangan Print Modal */}
      <KeuanganPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedProdi={selectedProdi}
        mode={printMode}
        uktItem={selectedUktItem}
        honorList={honorList}
      />

      {/* Rincian Komponen Uang Kuliah Modal */}
      <RincianUangKuliahModal
        isOpen={isRincianModalOpen}
        onClose={() => setIsRincianModalOpen(false)}
        uktItem={rincianSelectedItem}
        selectedProdi={selectedProdi}
        onOpenPrint={(mode, item) => {
          setIsRincianModalOpen(false);
          handleOpenPrint(mode, item);
        }}
      />

    </div>
  );
};
