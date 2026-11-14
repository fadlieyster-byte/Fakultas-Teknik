import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
  ReferenceLine,
  ComposedChart,
  Line
} from 'recharts';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Layers,
  FlaskConical,
  Wrench,
  ShieldAlert,
  FileText,
  Printer,
  Calculator,
  RefreshCw,
  Filter,
  Sliders,
  Sparkles,
  Building,
  Info,
  Check,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  AnggaranProdiLab, 
  ProgramStudiInfo, 
  ProyeksiKebutuhanLab 
} from '../types/index';
import { 
  TREN_REALISASI_ANGGARAN_PRODI, 
  INITIAL_PROYEKSI_KEBUTUHAN_LAB 
} from '../data/mockKeuanganData';
import { WAKIL_DEKAN_2, DEKAN_FAKULTAS_TEKNIK } from '../data/mockData';

interface PerencanaanAnggaranLabViewProps {
  selectedProdi: ProgramStudiInfo;
  anggaranList: AnggaranProdiLab[];
  onShowToast?: (msg: string) => void;
  onOpenPrint?: (mode: any) => void;
}

export const PerencanaanAnggaranLabView: React.FC<PerencanaanAnggaranLabViewProps> = ({
  selectedProdi,
  anggaranList,
  onShowToast,
  onOpenPrint
}) => {
  // Filter prodi for the view: 'ALL', 'SIPIL', 'LINGKUNGAN', 'LISTRIK_D3'
  const [prodiFilter, setProdiFilter] = useState<'ALL' | 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3'>('ALL');
  
  // Chart visual modes
  const [chartMode, setChartMode] = useState<'nominal' | 'persentase'>('nominal');
  const [labChartPerspective, setLabChartPerspective] = useState<'perbandingan' | 'rincian_komponen'>('perbandingan');

  // Interactive projection state per lab
  const [proyeksiList, setProyeksiList] = useState<ProyeksiKebutuhanLab[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v14_proyeksi_lab');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return INITIAL_PROYEKSI_KEBUTUHAN_LAB;
      }
    }
    return INITIAL_PROYEKSI_KEBUTUHAN_LAB;
  });

  // Selected lab for detail inspection or inline adjustment
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  // Sync with localStorage
  const handleUpdateProyeksi = (updatedList: ProyeksiKebutuhanLab[]) => {
    setProyeksiList(updatedList);
    try {
      localStorage.setItem('sikaprodi_v14_proyeksi_lab', JSON.stringify(updatedList));
    } catch {
      // ignore
    }
  };

  // Adjust a single lab's projected need
  const handleAdjustLabAmount = (labId: string, newNominal: number) => {
    const safeNominal = Math.max(0, newNominal);
    const updated = proyeksiList.map(item => {
      if (item.id === labId) {
        // proportionally adjust components
        const ratio = item.proyeksiKebutuhan > 0 ? safeNominal / item.proyeksiKebutuhan : 1;
        return {
          ...item,
          proyeksiKebutuhan: safeNominal,
          rincianKebutuhan: {
            bahanHabisPakai: Math.round(item.rincianKebutuhan.bahanHabisPakai * ratio),
            kalibrasiPemeliharaan: Math.round(item.rincianKebutuhan.kalibrasiPemeliharaan * ratio),
            k3DanPenggantianAlat: Math.round(item.rincianKebutuhan.k3DanPenggantianAlat * ratio),
            lisensiSoftware: Math.round(item.rincianKebutuhan.lisensiSoftware * ratio)
          }
        };
      }
      return item;
    });
    handleUpdateProyeksi(updated);
  };

  // Presets simulation handlers
  const handleApplyPreset = (preset: 'defisit_riil' | 'rasionalisasi_aman' | 'darurat_ujian' | 'reset') => {
    if (preset === 'reset') {
      handleUpdateProyeksi(INITIAL_PROYEKSI_KEBUTUHAN_LAB);
      if (onShowToast) onShowToast('Proyeksi kebutuhan dana operasional lab dikembalikan ke data awal.');
      return;
    }

    if (preset === 'rasionalisasi_aman') {
      // Set all projections comfortably below ceiling (e.g. 85% of available ceiling)
      const adjusted = proyeksiList.map(p => {
        const safePlafon = Math.round(p.sisaPlafonTersedia * 0.85);
        return {
          ...p,
          proyeksiKebutuhan: safePlafon,
          rincianKebutuhan: {
            bahanHabisPakai: Math.round(safePlafon * 0.5),
            kalibrasiPemeliharaan: Math.round(safePlafon * 0.3),
            k3DanPenggantianAlat: Math.round(safePlafon * 0.1),
            lisensiSoftware: Math.round(safePlafon * 0.1)
          }
        };
      });
      handleUpdateProyeksi(adjusted);
      if (onShowToast) onShowToast('Simulasi Rasionalisasi Diterapkan: Seluruh kebutuhan lab berada di bawah sisa plafon anggaran.');
    } else if (preset === 'defisit_riil') {
      // Standard realistic scenario with moderate deficit
      handleUpdateProyeksi(INITIAL_PROYEKSI_KEBUTUHAN_LAB);
      if (onShowToast) onShowToast('Simulasi Kebutuhan Riil Diterapkan: Terdapat defisit anggaran pada beberapa pos lab.');
    } else if (preset === 'darurat_ujian') {
      // Heavy deficit scenario (peak semester exams & research thesis)
      const inflated = proyeksiList.map(p => {
        const highNeeds = Math.round(p.sisaPlafonTersedia * 1.35);
        return {
          ...p,
          proyeksiKebutuhan: highNeeds,
          rincianKebutuhan: {
            bahanHabisPakai: Math.round(highNeeds * 0.55),
            kalibrasiPemeliharaan: Math.round(highNeeds * 0.25),
            k3DanPenggantianAlat: Math.round(highNeeds * 0.1),
            lisensiSoftware: Math.round(highNeeds * 0.1)
          }
        };
      });
      handleUpdateProyeksi(inflated);
      if (onShowToast) onShowToast('Simulasi Lonjakan Kebutuhan Praktikum Diterapkan: Defisit kritis terdeteksi!');
    }
  };

  // Filtered projections
  const filteredProyeksi = useMemo(() => {
    return proyeksiList.filter(p => {
      if (prodiFilter === 'ALL') return true;
      return p.prodiId === prodiFilter;
    });
  }, [proyeksiList, prodiFilter]);

  // Filtered Anggaran Pos for reference
  const labAnggaranItems = useMemo(() => {
    return anggaranList.filter(a => a.kategori === 'Praktikum & Laboratorium');
  }, [anggaranList]);

  // =========================================================================
  // LOGIC-BASED ALERT CALCULATIONS
  // Membandingkan akumulasi proyeksi kebutuhan lab vs sisa plafon anggaran lab
  // =========================================================================
  const {
    totalSisaPlafon,
    totalProyeksiKebutuhan,
    selisihAnggaran,
    isDefisit,
    persentaseDefisit,
    labsWithDefisit,
    totalPaguLab,
    totalRealisasiLab
  } = useMemo(() => {
    const totalPlaf = filteredProyeksi.reduce((acc, curr) => acc + curr.sisaPlafonTersedia, 0);
    const totalProy = filteredProyeksi.reduce((acc, curr) => acc + curr.proyeksiKebutuhan, 0);
    const selisih = totalPlaf - totalProy;
    const defisit = totalProy > totalPlaf;
    const persen = totalPlaf > 0 ? Math.abs((selisih / totalPlaf) * 100) : 0;
    const defisitLabs = filteredProyeksi.filter(p => p.proyeksiKebutuhan > p.sisaPlafonTersedia);

    // Sum of lab anggaran from current list
    const filteredAnggaran = prodiFilter === 'ALL' 
      ? labAnggaranItems 
      : labAnggaranItems.filter(a => a.prodiId === prodiFilter);
    const pagu = filteredAnggaran.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
    const realisasi = filteredAnggaran.reduce((acc, curr) => acc + curr.realisasiTerpakai, 0);

    return {
      totalSisaPlafon: totalPlaf,
      totalProyeksiKebutuhan: totalProy,
      selisihAnggaran: selisih,
      isDefisit: defisit,
      persentaseDefisit: persen,
      labsWithDefisit: defisitLabs,
      totalPaguLab: pagu,
      totalRealisasiLab: realisasi
    };
  }, [filteredProyeksi, labAnggaranItems, prodiFilter]);

  // Data for Chart 1: Multi-Year Budget Realization Trend per Program Studi
  const chartDataTrenProdi = useMemo(() => {
    return TREN_REALISASI_ANGGARAN_PRODI.map(item => {
      if (prodiFilter === 'SIPIL') {
        return {
          tahun: item.tahun,
          label: item.labelTahun,
          Pagu: item.sipilPagu / 1000000,
          Realisasi: item.sipilRealisasi / 1000000,
          Sisa: (item.sipilPagu - item.sipilRealisasi) / 1000000,
          Serapan: Math.round((item.sipilRealisasi / item.sipilPagu) * 100)
        };
      }
      if (prodiFilter === 'LINGKUNGAN') {
        return {
          tahun: item.tahun,
          label: item.labelTahun,
          Pagu: item.lingkunganPagu / 1000000,
          Realisasi: item.lingkunganRealisasi / 1000000,
          Sisa: (item.lingkunganPagu - item.lingkunganRealisasi) / 1000000,
          Serapan: Math.round((item.lingkunganRealisasi / item.lingkunganPagu) * 100)
        };
      }
      if (prodiFilter === 'LISTRIK_D3') {
        return {
          tahun: item.tahun,
          label: item.labelTahun,
          Pagu: item.listrikPagu / 1000000,
          Realisasi: item.listrikRealisasi / 1000000,
          Sisa: (item.listrikPagu - item.listrikRealisasi) / 1000000,
          Serapan: Math.round((item.listrikRealisasi / item.listrikPagu) * 100)
        };
      }
      // ALL
      return {
        tahun: item.tahun,
        label: item.labelTahun,
        Sipil: item.sipilRealisasi / 1000000,
        Lingkungan: item.lingkunganRealisasi / 1000000,
        Listrik: item.listrikRealisasi / 1000000,
        Umum: item.umumRealisasi / 1000000,
        TotalPagu: item.totalPagu / 1000000,
        TotalRealisasi: item.totalRealisasi / 1000000,
        Serapan: item.persenTotal
      };
    });
  }, [prodiFilter]);

  // Data for Chart 2: Lab Budget Ceiling vs Projected Needs
  const chartDataLabComparison = useMemo(() => {
    return filteredProyeksi.map(p => {
      const defisitNominal = p.proyeksiKebutuhan - p.sisaPlafonTersedia;
      return {
        id: p.id,
        namaSingkat: p.namaLab.split('(')[0].replace('Lab ', '').replace('Studio ', '').trim(),
        namaLengkap: p.namaLab,
        prodi: p.prodiId,
        SisaPlafon: p.sisaPlafonTersedia / 1000000,
        ProyeksiKebutuhan: p.proyeksiKebutuhan / 1000000,
        Selisih: defisitNominal / 1000000,
        IsDefisit: defisitNominal > 0,
        // Components breakdown in millions
        BHP: p.rincianKebutuhan.bahanHabisPakai / 1000000,
        Kalibrasi: p.rincianKebutuhan.kalibrasiPemeliharaan / 1000000,
        K3: p.rincianKebutuhan.k3DanPenggantianAlat / 1000000,
        Software: p.rincianKebutuhan.lisensiSoftware / 1000000
      };
    });
  }, [filteredProyeksi]);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* ===================================================================== */}
      {/* LOGIC-BASED ALERT BANNER: MELAMPAUI SISA PLAFON ANGGARAN SEMESTER    */}
      {/* ===================================================================== */}
      {isDefisit ? (
        <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border-2 border-red-300 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-xs shrink-0 animate-pulse mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white shadow-2xs">
                    Peringatan Kritis Keuangan
                  </span>
                  <span className="text-xs font-bold text-red-950">
                    Defisit Plafon Anggaran Lab Terdeteksi!
                  </span>
                  <span className="text-xs font-mono font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    Potensi Defisit: -Rp {Math.abs(selisihAnggaran).toLocaleString('id-ID')} ({persentaseDefisit.toFixed(1)}% Melampaui Plafon)
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-red-950 mt-1">
                  Akumulasi Proyeksi Kebutuhan Dana Lab Melampaui Sisa Plafon Anggaran Tersedia!
                </h3>

                <p className="text-xs sm:text-sm text-red-900 mt-1 leading-relaxed max-w-3xl">
                  Berdasarkan kalkulasi semester berjalan, akumulasi proyeksi kebutuhan dana operasional laboratorium{' '}
                  <span className="font-extrabold font-mono underline">
                    {prodiFilter === 'ALL' ? 'Fakultas Teknik' : prodiFilter}
                  </span>{' '}
                  sebesar <strong className="font-mono">Rp {totalProyeksiKebutuhan.toLocaleString('id-ID')}</strong> telah melampaui sisa plafon anggaran yang tersedia sebesar <strong className="font-mono">Rp {totalSisaPlafon.toLocaleString('id-ID')}</strong>. Terdapat {labsWithDefisit.length} laboratorium dengan proyeksi belanja melebihi pagu sisa.
                </p>

                {/* Micro badges of deficit labs */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] text-red-800 font-bold">Laboratorium Mengalami Defisit:</span>
                  {labsWithDefisit.map(lab => (
                    <span 
                      key={lab.id} 
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white text-red-800 border border-red-200 px-2 py-0.5 rounded-lg shadow-2xs"
                    >
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      <span>{lab.namaLab.split('(')[0].trim()}:</span>
                      <strong className="font-mono text-red-700">
                        -Rp {(lab.proyeksiKebutuhan - lab.sisaPlafonTersedia).toLocaleString('id-ID')}
                      </strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons for Kaprodi */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => handleApplyPreset('rasionalisasi_aman')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Sesuaikan otomatis proyeksi agar berada di bawah sisa plafon anggaran"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Rasionalisasi Efisiensi (Aman)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onShowToast) {
                    onShowToast(`Rekomendasi Revisi RKAF FT UNBARI diteruskan ke Wadek II (${WAKIL_DEKAN_2.nama}).`);
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 text-red-800 border border-red-300 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-red-600" />
                <span>Usulkan Revisi RKAF ke Wadek II</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SAFE STATUS BANNER */
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Status Plafon Aman
                </span>
                <span className="text-xs font-bold text-emerald-950">
                  Proyeksi Kebutuhan Lab Berada Dalam Batas Plafon Anggaran
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-0.5">
                Akumulasi proyeksi kebutuhan dana operasional lab (<strong className="font-mono">Rp {totalProyeksiKebutuhan.toLocaleString('id-ID')}</strong>) masih dalam batas sisa plafon anggaran (<strong className="font-mono">Rp {totalSisaPlafon.toLocaleString('id-ID')}</strong>) dengan sisa surplus buffer aman sebesar <strong className="font-mono text-emerald-700">Rp {selisihAnggaran.toLocaleString('id-ID')}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleApplyPreset('defisit_riil')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Cek Simulasi Defisit Riil</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CONTROL & KPI HEADER STRIP                                            */}
      {/* ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wide">
              <FlaskConical className="w-4 h-4 text-blue-700" />
              <span>Perencanaan Anggaran Tahunan &amp; Operasional Laboratorium FT UNBARI</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Analisis Realisasi Anggaran &amp; Proyeksi Belanja Laboratorium
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Pemantauan serapan pagu anggaran per program studi, simulasi kebutuhan dana bahan habis pakai praktikum, kalibrasi instrumen, dan penyesuaian plafon operasional laboratorium teknik.
            </p>
          </div>

          {/* Filter Prodi Selector & Preset Simulations */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
                <Filter className="w-3 h-3 text-blue-600" />
                <span>Prodi:</span>
              </span>
              {(['ALL', 'SIPIL', 'LINGKUNGAN', 'LISTRIK_D3'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProdiFilter(p)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    prodiFilter === p
                      ? 'bg-blue-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {p === 'ALL' ? 'Semua FT' : p === 'SIPIL' ? 'S1 Sipil' : p === 'LINGKUNGAN' ? 'S1 Lingkungan' : 'D3 Listrik'}
                </button>
              ))}
            </div>

            {/* Simulation Presets Dropdown/Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleApplyPreset('darurat_ujian')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Simulasi lonjakan praktikum semester akhir & pengujian skripsi"
              >
                <Sparkles className="w-3 h-3 text-rose-600" />
                <span>Simulasi Lonjakan Lab</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('reset')}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer"
                title="Reset proyeksi ke data bawaan"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Sisa Plafon Lab Tersedia</span>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
              Rp {(totalSisaPlafon / 1000000).toFixed(2)} Jt
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Plafond Sisa Semester Gasal TA 2026/2027
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Akumulasi Proyeksi Kebutuhan</span>
            <div className="text-xl font-black text-blue-900 font-mono mt-0.5">
              Rp {(totalProyeksiKebutuhan / 1000000).toFixed(2)} Jt
            </div>
            <span className="text-[10px] text-blue-700 font-medium block mt-0.5">
              Total Rencana Belanja {filteredProyeksi.length} Laboratorium
            </span>
          </div>

          <div className={`border rounded-xl p-3.5 ${
            isDefisit ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <span className="text-[11px] font-semibold uppercase block" style={{ color: isDefisit ? '#991b1b' : '#065f46' }}>
              {isDefisit ? 'Potensi Defisit Plafon' : 'Surplus Buffer Aman'}
            </span>
            <div className="text-xl font-black font-mono mt-0.5" style={{ color: isDefisit ? '#b91c1c' : '#047857' }}>
              {isDefisit ? '-' : '+'}Rp {(Math.abs(selisihAnggaran) / 1000000).toFixed(2)} Jt
            </div>
            <span className="text-[10px] font-bold block mt-0.5" style={{ color: isDefisit ? '#ef4444' : '#10b981' }}>
              {isDefisit ? `⚠️ Melebihi plafon sebesar ${persentaseDefisit.toFixed(1)}%` : `✓ Tersisa margin aman ${persentaseDefisit.toFixed(1)}%`}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Serapan Anggaran Lab</span>
            <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
              {totalPaguLab > 0 ? ((totalRealisasiLab / totalPaguLab) * 100).toFixed(1) : '80.5'}%
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Realisasi Rp {(totalRealisasiLab / 1000000).toFixed(1)} Jt dari Pagu Rp {(totalPaguLab / 1000000).toFixed(1)} Jt
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2 CHARTS ROW: TREN REALISASI PRODI & PERBANDINGAN PLAFON VS PROYEKSI  */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: TREN REALISASI ANGGARAN PER PROGRAM STUDI (MULTI-TAHUN) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-800 shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Tren Realisasi Anggaran per Program Studi
                </h3>
                <p className="text-[11px] text-slate-500">
                  Perbandingan multi-tahun TA 2024/2025, TA 2025/2026, dan TA 2026/2027 (Juta Rupiah)
                </p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-center">
              <button
                type="button"
                onClick={() => setChartMode('nominal')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  chartMode === 'nominal' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nominal (Jt)
              </button>
              <button
                type="button"
                onClick={() => setChartMode('persentase')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  chartMode === 'persentase' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                % Serapan
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {chartMode === 'nominal' ? (
                prodiFilter === 'ALL' ? (
                  <BarChart data={chartDataTrenProdi} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" Jt" />
                    <RechartsTooltip
                      formatter={(val: any, name?: any) => [`Rp ${Number(val).toFixed(1)} Juta`, String(name ?? '')]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="Sipil" fill="#2563eb" radius={[4, 4, 0, 0]} name="S1 Sipil" />
                    <Bar dataKey="Lingkungan" fill="#059669" radius={[4, 4, 0, 0]} name="S1 Lingkungan" />
                    <Bar dataKey="Listrik" fill="#d97706" radius={[4, 4, 0, 0]} name="D3 Listrik" />
                    <Bar dataKey="Umum" fill="#64748b" radius={[4, 4, 0, 0]} name="Dekanat/Umum" />
                  </BarChart>
                ) : (
                  <BarChart data={chartDataTrenProdi} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" Jt" />
                    <RechartsTooltip
                      formatter={(val: any, name?: any) => [`Rp ${Number(val).toFixed(1)} Juta`, String(name ?? '')]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="Pagu" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Pagu Anggaran" />
                    <Bar dataKey="Realisasi" fill="#2563eb" radius={[4, 4, 0, 0]} name="Realisasi Terpakai" />
                    <Bar dataKey="Sisa" fill="#10b981" radius={[4, 4, 0, 0]} name="Sisa Anggaran" />
                  </BarChart>
                )
              ) : (
                <ComposedChart data={chartDataTrenProdi} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <RechartsTooltip
                    formatter={(val: any) => [`${val}%`, 'Persentase Serapan']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <ReferenceLine y={80} label="Target Minimal (80%)" stroke="#f59e0b" strokeDasharray="3 3" />
                  <Bar dataKey="Serapan" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Serapan Anggaran (%)">
                    {chartDataTrenProdi.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Serapan >= 85 ? '#10b981' : entry.Serapan >= 75 ? '#3b82f6' : '#f59e0b'} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="Serapan" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 5 }} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Evaluasi Serapan Anggaran:</strong> Rata-rata serapan anggaran prodi FT UNBARI semester berjalan mencapai 78.0%. D3 Teknik Listrik mencatatkan serapan tertinggi (85.6%) didorong intensitas praktikum bengkel.
            </span>
          </div>
        </div>

        {/* CHART 2: SISA PLAFON VS PROYEKSI KEBUTUHAN DANA OPERASIONAL LAB */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-800 shrink-0 mt-0.5">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Sisa Plafon vs Proyeksi Kebutuhan Dana Lab
                </h3>
                <p className="text-[11px] text-slate-500">
                  Perbandingan nominal per lab &amp; visualisasi defisit operasional (Juta Rupiah)
                </p>
              </div>
            </div>

            {/* Toggle perspective */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-center">
              <button
                type="button"
                onClick={() => setLabChartPerspective('perbandingan')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  labChartPerspective === 'perbandingan' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Plafon vs Kebutuhan
              </button>
              <button
                type="button"
                onClick={() => setLabChartPerspective('rincian_komponen')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  labChartPerspective === 'rincian_komponen' ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pos Belanja Lab
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              {labChartPerspective === 'perbandingan' ? (
                <BarChart data={chartDataLabComparison} margin={{ top: 15, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="namaSingkat" 
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} 
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" Jt" />
                  <RechartsTooltip
                    formatter={(val: any, name?: any, item?: any) => {
                      const nameStr = String(name ?? '');
                      if (nameStr === 'Proyeksi Kebutuhan') {
                        const isDef = item?.payload?.IsDefisit;
                        return [
                          `Rp ${Number(val).toFixed(2)} Jt ${isDef ? '⚠️ (Defisit)' : '✓ (Aman)'}`,
                          nameStr
                        ];
                      }
                      return [`Rp ${Number(val).toFixed(2)} Jt`, nameStr];
                    }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                  <Bar dataKey="SisaPlafon" fill="#10b981" radius={[4, 4, 0, 0]} name="Sisa Plafon Anggaran" />
                  <Bar dataKey="ProyeksiKebutuhan" name="Proyeksi Kebutuhan" radius={[4, 4, 0, 0]}>
                    {chartDataLabComparison.map((entry, index) => (
                      <Cell key={`lab-cell-${index}`} fill={entry.IsDefisit ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart data={chartDataLabComparison} margin={{ top: 15, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="namaSingkat" 
                    tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} 
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" Jt" />
                  <RechartsTooltip
                    formatter={(val: any, name?: any) => [`Rp ${Number(val).toFixed(2)} Jt`, String(name ?? '')]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                  <Bar dataKey="BHP" stackId="a" fill="#3b82f6" name="Bahan Habis Pakai (BHP)" />
                  <Bar dataKey="Kalibrasi" stackId="a" fill="#8b5cf6" name="Kalibrasi & Servis" />
                  <Bar dataKey="K3" stackId="a" fill="#f59e0b" name="K3 & Penggantian Alat" />
                  <Bar dataKey="Software" stackId="a" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Lisensi Software" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-emerald-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Plafon Tersedia</span>
              </span>
              <span className="flex items-center gap-1 font-semibold text-blue-800">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <span>Proyeksi Aman</span>
              </span>
              <span className="flex items-center gap-1 font-semibold text-red-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse"></span>
                <span>Melampaui Plafon (Defisit)</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Warna merah menandai defisit plafon
            </span>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* INTERACTIVE TABLE: DAFTAR PROYEKSI OPERASIONAL LAB & ADJUSTMENT       */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-700 text-white rounded-xl shadow-xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Simulasi &amp; Rincian Proyeksi Belanja Operasional Laboratorium FT
              </h3>
              <p className="text-xs text-slate-500">
                Kaprodi dapat menyesuaikan estimasi dana belanja per laboratorium secara langsung untuk perencanaan anggaran
              </p>
            </div>
          </div>

          {/* Quick Print Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenPrint) {
                onOpenPrint('REKAP_HONOR'); // or print dialog
              } else {
                window.print();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rencana Anggaran Lab</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-10 text-center">No</th>
                <th className="py-3 px-4">Nama Laboratorium &amp; Prodi</th>
                <th className="py-3 px-4">Kepala Lab / PIC</th>
                <th className="py-3 px-4 text-right">Sisa Plafon (Rp)</th>
                <th className="py-3 px-4 text-right">Proyeksi Kebutuhan (Rp)</th>
                <th className="py-3 px-4 text-right">Selisih Plafon</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Penyesuaian Dana (Kaprodi)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProyeksi.map((lab, idx) => {
                const selisih = lab.sisaPlafonTersedia - lab.proyeksiKebutuhan;
                const labDefisit = selisih < 0;

                return (
                  <tr key={lab.id} className={`hover:bg-slate-50/80 transition-colors ${labDefisit ? 'bg-red-50/20' : ''}`}>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{lab.namaLab}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          lab.prodiId === 'SIPIL' ? 'bg-blue-100 text-blue-800' :
                          lab.prodiId === 'LINGKUNGAN' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {lab.prodiId}
                        </span>
                        <span className="text-[11px] text-slate-500">{lab.catatanKebutuhan}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {lab.kepalaLab}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                      Rp {lab.sisaPlafonTersedia.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-900">
                      Rp {lab.proyeksiKebutuhan.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={labDefisit ? 'text-red-600 font-black' : 'text-emerald-700'}>
                        {labDefisit ? '-' : '+'}Rp {Math.abs(selisih).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        labDefisit ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {labDefisit ? <AlertTriangle className="w-3 h-3 text-red-600" /> : <Check className="w-3 h-3 text-emerald-600" />}
                        <span>{labDefisit ? 'Plafon Terlampaui' : 'Aman (Surplus)'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {/* Step controls or quick adjustment */}
                      <button
                        type="button"
                        onClick={() => handleAdjustLabAmount(lab.id, lab.proyeksiKebutuhan - 500000)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px] border border-slate-200 transition-colors cursor-pointer"
                        title="Kurangi estimasi belanja Rp 500.000"
                      >
                        -500 Rb
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustLabAmount(lab.id, lab.proyeksiKebutuhan + 500000)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px] border border-slate-200 transition-colors cursor-pointer"
                        title="Tambah estimasi belanja Rp 500.000"
                      >
                        +500 Rb
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustLabAmount(lab.id, lab.sisaPlafonTersedia)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                        title="Kunci proyeksi pas sesuai sisa plafon"
                      >
                        Paskan Plafon
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-black text-slate-900">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                  Total Akumulasi {filteredProyeksi.length} Laboratorium :
                </td>
                <td className="py-3 px-4 text-right font-mono text-xs sm:text-sm text-slate-800">
                  Rp {totalSisaPlafon.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-xs sm:text-sm text-blue-900">
                  Rp {totalProyeksiKebutuhan.toLocaleString('id-ID')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-xs sm:text-sm font-black">
                  <span className={isDefisit ? 'text-red-700' : 'text-emerald-800'}>
                    {isDefisit ? '-' : '+'}Rp {Math.abs(selisihAnggaran).toLocaleString('id-ID')}
                  </span>
                </td>
                <td colSpan={2} className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                    isDefisit ? 'bg-red-600 text-white shadow-2xs' : 'bg-emerald-700 text-white shadow-2xs'
                  }`}>
                    {isDefisit ? '⚠️ DEFISIT ANGGARAN LAB' : '✓ SURPLUS AMAN'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* STRATEGIC KAPRODI ADVISORY & REKOMENDASI PERENCANAAN ANGGARAN         */}
      {/* ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
          <Building className="w-4 h-4 text-blue-700" />
          <span>Panduan Tindakan Strategis Kaprodi &amp; Dekanat FT UNBARI</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1 text-xs">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">1</span>
              <span>Pergeseran Pos Anggaran Internal</span>
            </div>
            <p className="text-blue-900 text-[11px] leading-relaxed">
              Jika terjadi defisit pada pos praktikum lab, Kaprodi dapat mengusulkan pergeseran dana dari sisa pos operasional program studi yang belum terserap maksimal (Sisa Sipil Ops: Rp 6.8 Jt).
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">2</span>
              <span>Revisi RKAF Dekanat (Wadek II)</span>
            </div>
            <p className="text-amber-900 text-[11px] leading-relaxed">
              Pengajuan alokasi dana talangan praktikum semester akhir melalui mekanisme peninjauan RKAF Semester Genap ke Wakil Dekan II (Leily Wustha Johar, ST., MT).
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">3</span>
              <span>Efisiensi Belanja BHP Lab</span>
            </div>
            <p className="text-emerald-900 text-[11px] leading-relaxed">
              Pemanfaatan pengadaan bersama (bulk buying) reagen kimia dan bahan uji beton dengan laboratorium mitra industri di Provinsi Jambi untuk menekan beban biaya operasional.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
