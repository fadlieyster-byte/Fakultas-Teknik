import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Building2,
  FileCheck2,
  Briefcase,
  ClipboardCheck,
  BookOpen,
  Handshake,
  TrendingUp,
  TrendingDown,
  BellRing,
  X,
  FileSpreadsheet,
  Award,
  Coffee,
  Search,
  Filter,
  CalendarDays,
  Radio,
  RotateCcw
} from 'lucide-react';
import { 
  Mahasiswa, 
  Dosen, 
  JadwalKuliah, 
  RuanganLab, 
  PeringatanAkademik, 
  ProgramStudiInfo,
  JadwalSidangTA,
  JadwalKerjaPraktek,
  StatusKehadiranDosen,
  AuditSidakKehadiran,
  YudisiumRecord,
  DokumenKerjasama,
  AgendaAkademik,
  KategoriAgendaAkademik,
  RentangWaktuAgenda,
  LogPresensiDosen
} from '../types/index';
import { isJadwalSedangBerlangsung, hitungSisaWaktu } from '../utils/timeHelper';
import {
  evaluateRealtimeJadwalPresensi,
  PRESENSI_TOLERANCE_MINUTES,
  RealtimeSessionTrackingStatus
} from '../utils/realtimePresensiTracker';
import { AcademicAnalyticsChart } from './AcademicAnalyticsChart';
import { DosenPresenceChart } from './DosenPresenceChart';
import { StudentCohortStatusChart } from './StudentCohortStatusChart';
import { PIMPINAN_FAKULTAS_TEKNIK } from '../data/mockData';
import { INITIAL_KERJASAMA } from '../data/mockKerjasamaData';
import { INITIAL_AGENDA_AKADEMIK } from '../data/mockAgendaAkademikData';
import {
  CPL_DEFINITIONS_PRODI,
  INITIAL_CPL_CPMK_MATRIX_DATA
} from '../data/mockCplCpmkMatrixData';
import { buildCplCompletenessAuditReport } from '../utils/cplCompletenessAuditHelper';


interface DashboardOverviewProps {
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  jadwalList: JadwalKuliah[];
  logPresensiList?: LogPresensiDosen[];
  ruanganList: RuanganLab[];
  peringatanList: PeringatanAkademik[];
  sidangList?: JadwalSidangTA[];
  kpList?: JadwalKerjaPraktek[];
  auditSidakList?: AuditSidakKehadiran[];
  yudisiumList?: YudisiumRecord[];
  kerjasamaList?: DokumenKerjasama[];
  selectedProdi: ProgramStudiInfo;
  currentDay: string;
  currentTimeStr: string;
  isSimulated?: boolean;
  onSetSimulatedTime?: (day: string, time: string) => void;
  onResetSimulation?: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectMahasiswa: (mhs: Mahasiswa) => void;
  onVerifyBap: (jadwalId: string) => void;
  onTindakLanjutiPeringatan: (id: string) => void;
  onOpenEwsModal?: () => void;
  onOpenAuditSidakModal?: (jadwalId?: string) => void;
  onUpdateDosenStatus?: (dosenId: string, status: StatusKehadiranDosen, lokasi?: string) => void;
  onRecordRealTimePresensi?: (jadwal: JadwalKuliah) => void;
  onShowToast?: (msg: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  mahasiswaList,
  dosenList,
  jadwalList,
  logPresensiList = [],
  ruanganList,
  peringatanList,
  sidangList = [],
  kpList = [],
  auditSidakList = [],
  yudisiumList = [],
  kerjasamaList = [],
  selectedProdi,
  currentDay,
  currentTimeStr,
  isSimulated = false,
  onSetSimulatedTime,
  onResetSimulation,
  onNavigateTab,
  onSelectMahasiswa,
  onVerifyBap,
  onTindakLanjutiPeringatan,
  onOpenEwsModal,
  onOpenAuditSidakModal,
  onUpdateDosenStatus,
  onRecordRealTimePresensi,
  onShowToast
}) => {
  const [scopeFilter, setScopeFilter] = React.useState<'prodi' | 'all'>('prodi');
  const [trackingDayScope, setTrackingDayScope] = React.useState<'TODAY' | 'ALL'>('TODAY');
  const [trackingStatusFilter, setTrackingStatusFilter] = React.useState<
    'ALL' | 'OVER_15' | RealtimeSessionTrackingStatus
  >('ALL');
  const [trackingSearchQuery, setTrackingSearchQuery] = React.useState<string>('');

  // Filter datasets based on selected department or all
  const displayMhs = scopeFilter === 'prodi' 
    ? mahasiswaList.filter(m => m.prodiId === selectedProdi.id) 
    : mahasiswaList;

  const displayDosen = scopeFilter === 'prodi'
    ? dosenList.filter(d => d.prodiId === selectedProdi.id)
    : dosenList;

  const displayJadwal = scopeFilter === 'prodi'
    ? jadwalList.filter(j => j.prodiId === selectedProdi.id)
    : jadwalList;

  const displayRuangan = scopeFilter === 'prodi'
    ? ruanganList.filter(r => !r.prodiId || r.prodiId === selectedProdi.id || r.prodiId === 'UMUM')
    : ruanganList;

  const displayPeringatan = scopeFilter === 'prodi'
    ? peringatanList.filter(p => p.prodiId === selectedProdi.id)
    : peringatanList;

  const displayAuditSidak = scopeFilter === 'prodi'
    ? auditSidakList.filter(a => a.prodiId === selectedProdi.id)
    : auditSidakList;

  // Compute real-time active classes
  const activeClasses = displayJadwal.filter(j => 
    isJadwalSedangBerlangsung(j, currentDay, currentTimeStr)
  );

  // Pelacakan Real-Time Jadwal Dosen vs Data Log Presensi (Toleransi +15 Menit)
  const realtimePresensiSummary = React.useMemo(
    () =>
      evaluateRealtimeJadwalPresensi({
        jadwalList: displayJadwal,
        logPresensiList,
        dosenList: displayDosen,
        currentDay,
        currentTimeStr,
        dayFilter: trackingDayScope
      }),
    [displayJadwal, logPresensiList, displayDosen, currentDay, currentTimeStr, trackingDayScope]
  );

  const filteredRealtimeSessions = React.useMemo(() => {
    const q = trackingSearchQuery.trim().toLowerCase();
    return realtimePresensiSummary.items.filter(item => {
      const matchStatus =
        trackingStatusFilter === 'ALL'
          ? true
          : trackingStatusFilter === 'OVER_15'
          ? item.lewatBatas15Menit
          : item.status === trackingStatusFilter;
      const matchQuery =
        !q ||
        item.jadwal.kodeMK.toLowerCase().includes(q) ||
        item.jadwal.namaMK.toLowerCase().includes(q) ||
        item.jadwal.dosenNama.toLowerCase().includes(q) ||
        item.jadwal.ruanganNama.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [realtimePresensiSummary.items, trackingStatusFilter, trackingSearchQuery]);

  // KPI calculations
  const totalMahasiswa = displayMhs.length;
  const mhsBerisiko = displayMhs.filter(m => m.status === 'Berisiko' || m.peringatanSp > 0);
  const mhsTugasAkhir = displayMhs.filter(m => m.status === 'Tugas Akhir');
  const dosenMengajar = displayDosen.filter(d => d.statusRealTime === 'Sedang Mengajar').length;
  const ruanganTerpakai = displayRuangan.filter(r => r.statusSaatIni === 'Terpakai').length;

  const pendingBapList = displayJadwal.filter(j => j.bapStatus === 'Menunggu Verifikasi Kaprodi');

  // Kemitraan & Kerjasama Data
  const effectiveKerjasamaList = (kerjasamaList && kerjasamaList.length > 0) ? kerjasamaList : INITIAL_KERJASAMA;

  const displayKerjasama = scopeFilter === 'prodi'
    ? effectiveKerjasamaList.filter(k => k.prodiId === selectedProdi.id || k.prodiId === 'SEMUA_FT')
    : effectiveKerjasamaList;

  // Total Dokumen Kerjasama Aktif
  const activeKerjasamaDocs = displayKerjasama.filter(k => k.status === 'Aktif');
  const totalKerjasamaAktif = activeKerjasamaDocs.length;
  const totalKerjasamaSemua = displayKerjasama.length;

  // Realisasi IA Terlaksana & Mahasiswa Terlibat
  const totalRealisasiTerlaksana = displayKerjasama.reduce((sum, k) => {
    return sum + (k.realisasiList ? k.realisasiList.filter(r => r.statusPelaksanaan === 'Terlaksana').length : 0);
  }, 0);

  const totalMahasiswaMBKM = displayKerjasama.reduce((sum, k) => {
    return sum + (k.realisasiList ? k.realisasiList.reduce((acc, r) => acc + (r.jumlahMahasiswaTerlibat || 0), 0) : 0);
  }, 0);

  // Baseline kemitraan aktif periode sebelumnya (Tahun Akademik TS-1 / Semester sebelumnya)
  const baselinePeriodeSebelumnya: Record<string, number> = {
    'SIPIL': 5,       // 5 mitra aktif periode lalu (termasuk FT), kini 6 (+20.0%)
    'LINGKUNGAN': 4,  // 4 mitra aktif periode lalu, kini 5 (+25.0%)
    'LISTRIK_D3': 4,  // 4 mitra aktif periode lalu, kini 5 (+25.0%)
    'SEMUA_FT': 9     // 9 mitra aktif fakultas periode lalu, kini 12 (+33.3%)
  };

  const prevBase = scopeFilter === 'prodi'
    ? (baselinePeriodeSebelumnya[selectedProdi.id] || 4)
    : baselinePeriodeSebelumnya['SEMUA_FT'];

  // Persentase pertumbuhan kemitraan dibanding periode sebelumnya
  const growthRate = prevBase > 0 
    ? ((totalKerjasamaAktif - prevBase) / prevBase) * 100 
    : 0;

  // Banner peringatan naskah kerjasama mendesak
  const [showUrgentBanner, setShowUrgentBanner] = React.useState<boolean>(true);

  // Helper: Hitung selisih hari sisa masa berlaku
  const calculateDaysRemaining = (endDateStr: string): number => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr).getTime();
    if (isNaN(end)) return 0;
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  // Dokumen kerjasama yang sudah kadaluarsa atau akan berakhir dalam waktu < 3 bulan (<= 90 hari)
  const urgentKerjasamaDocs = React.useMemo(() => {
    return displayKerjasama
      .map(doc => {
        const days = calculateDaysRemaining(doc.tanggalSelesai);
        const isExpired = days <= 0 || doc.status === 'Kedaluwarsa';
        const isExpiring3Months = (days > 0 && days <= 90) || doc.status === 'Mendekati Berakhir';
        return {
          ...doc,
          daysRemaining: days,
          isExpired,
          isExpiring3Months,
          isUrgent: isExpired || isExpiring3Months
        };
      })
      .filter(d => d.isUrgent)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [displayKerjasama]);

  const expiredCount = urgentKerjasamaDocs.filter(d => d.isExpired).length;
  const expiringSoonCount = urgentKerjasamaDocs.filter(d => !d.isExpired && d.isExpiring3Months).length;

  const dashboardCplCompleteness = React.useMemo(() => {
    let matrixList = INITIAL_CPL_CPMK_MATRIX_DATA;
    try {
      const saved = localStorage.getItem('sikaprodi_v15_matriks_cpl_cpmk');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) matrixList = parsed;
      }
    } catch {}
    const scopedCourses =
      scopeFilter === 'prodi'
        ? matrixList.filter(m => m.prodiId === selectedProdi.id)
        : matrixList;
    const prodiCpls = CPL_DEFINITIONS_PRODI[selectedProdi.id] || CPL_DEFINITIONS_PRODI.SIPIL;
    return buildCplCompletenessAuditReport({ courses: scopedCourses, prodiCpls });
  }, [scopeFilter, selectedProdi.id]);

  // Pemantauan Beban Kerja Dosen (BKD) terhadap rentang standar LLDIKTI 12–16 SKS
  const [showBkdAlertBanner, setShowBkdAlertBanner] = React.useState<boolean>(true);

  const bkdOutOfRangeList = React.useMemo(() => {
    return displayDosen
      .map(dosen => {
        const scheduledClasses = jadwalList.filter(j => {
          const matchNidn = j.dosenNidn && dosen.nidn && j.dosenNidn === dosen.nidn;
          const isKoordinatorSlot = j.dosenNama.includes('(Koord.');
          const hasStudents = j.terdaftar === undefined || j.terdaftar > 0;
          return matchNidn && !isKoordinatorSlot && hasStudents;
        });
        const scheduledSks = scheduledClasses.reduce((sum, j) => sum + j.sks, 0);
        const sksKuliah = Math.max(dosen.totalSksMengajar, scheduledSks);
        const sksBimbingan = Math.round(dosen.jumlahMahasiswaBimbingan * 0.25 * 10) / 10;
        const totalBebanSks = Math.round((sksKuliah + sksBimbingan) * 10) / 10;
        const isOverload = totalBebanSks > 16;
        const isUnderload = totalBebanSks < 12;

        return {
          dosen,
          sksKuliah,
          sksBimbingan,
          totalBebanSks,
          isOverload,
          isUnderload,
          isOutOfRange: isOverload || isUnderload
        };
      })
      .filter(item => item.isOutOfRange)
      .sort((a, b) => {
        if (a.isOverload && !b.isOverload) return -1;
        if (!a.isOverload && b.isOverload) return 1;
        return b.totalBebanSks - a.totalBebanSks;
      });
  }, [displayDosen, jadwalList]);

  const bkdOverloadCount = bkdOutOfRangeList.filter(d => d.isOverload).length;
  const bkdUnderloadCount = bkdOutOfRangeList.filter(d => d.isUnderload).length;

  // Reset dismissed state when scope or prodi changes so Kaprodi sees relevant BKD warnings
  React.useEffect(() => {
    setShowBkdAlertBanner(true);
  }, [selectedProdi.id, scopeFilter]);

  // Notifikasi Toast otomatis saat Kaprodi membuka dasbor/login (Kerjasama & BKD)
  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (urgentKerjasamaDocs.length > 0 && onShowToast) {
      const timer = setTimeout(() => {
        const msg = expiredCount > 0 && expiringSoonCount > 0
          ? `⚠️ Perhatian Kaprodi: Terdapat ${expiredCount} dokumen kerjasama ${selectedProdi.singkatan} kadaluarsa & ${expiringSoonCount} akan berakhir < 3 bulan. Segera tinjau & lakukan perpanjangan (addendum).`
          : expiredCount > 0
            ? `⚠️ Perhatian Kaprodi: Terdapat ${expiredCount} dokumen kerjasama ${selectedProdi.singkatan} yang sudah kadaluarsa. Segera lakukan proses perpanjangan di modul Kerjasama.`
            : `⚠️ Perhatian Kaprodi: Terdapat ${expiringSoonCount} dokumen kerjasama ${selectedProdi.singkatan} akan berakhir dalam < 3 bulan. Segera jadwalkan perpanjangan naskah.`;
        onShowToast(msg);
      }, 700);
      timers.push(timer);
    }

    if (bkdOutOfRangeList.length > 0 && onShowToast) {
      const bkdDelay = urgentKerjasamaDocs.length > 0 ? 2800 : 850;
      const bkdTimer = setTimeout(() => {
        const scopeLabel = scopeFilter === 'prodi' ? selectedProdi.singkatan : 'FT UNBARI';
        onShowToast(
          `⚠️ Beban Kerja Dosen Tidak Sesuai (${scopeLabel}): Ditemukan ${bkdOutOfRangeList.length} dosen di luar rentang 12–16 SKS (${bkdOverloadCount} Overload >16 SKS, ${bkdUnderloadCount} Underload <12 SKS).`
        );
      }, bkdDelay);
      timers.push(bkdTimer);
    }

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [selectedProdi.id, scopeFilter, bkdOutOfRangeList.length, urgentKerjasamaDocs.length]);

  // Agenda Akademik State & Category / Time Range Filters
  const [selectedAgendaKategori, setSelectedAgendaKategori] = React.useState<KategoriAgendaAkademik | 'Semua'>('Semua');
  const [selectedAgendaRentang, setSelectedAgendaRentang] = React.useState<RentangWaktuAgenda>('mingguan');
  const [agendaSearchQuery, setAgendaSearchQuery] = React.useState<string>('');

  // Combine static academic agenda with live TA & KP sessions for a unified schedule
  const combinedAgendaList = React.useMemo<AgendaAkademik[]>(() => {
    // Convert sidang TA to agenda items if not already present
    const sidangAsAgenda: AgendaAkademik[] = (sidangList || []).map(s => ({
      id: `sidang-${s.id}`,
      judul: `Sidang ${s.tipeSidang}: ${s.namaMahasiswa} (${s.nim})`,
      kategori: s.tipeSidang.includes('Sidang') ? 'Ujian' : 'Seminar',
      tanggalMulai: s.tanggal || '2026-11-13',
      tanggalSelesai: s.tanggal || '2026-11-13',
      hari: s.hari,
      jam: `${s.jamMulai} - ${s.jamSelesai} WIB`,
      lokasi: s.ruangan,
      prodiId: s.prodiId,
      keterangan: `Judul TA: "${s.judulTA}". Penguji: ${s.penguji1}, ${s.penguji2}`,
      penanggungJawab: s.pembimbing1,
      sifat: 'Wajib',
      badgeLabel: 'Sidang Mhs'
    }));

    // Convert KP seminars to agenda items
    const kpAsAgenda: AgendaAkademik[] = (kpList || []).map(k => ({
      id: `kp-${k.id}`,
      judul: `Seminar Kerja Praktek: ${k.namaMahasiswa} (${k.nim})`,
      kategori: 'Seminar',
      tanggalMulai: k.tanggalSeminar || '2026-11-14',
      tanggalSelesai: k.tanggalSeminar || '2026-11-14',
      hari: k.hariSeminar || 'Sabtu',
      jam: k.jamSeminar || '09:00 WIB',
      lokasi: k.ruangSeminar || 'Ruang Seminar Bersama Lt. 2',
      prodiId: k.prodiId,
      keterangan: `Instansi: ${k.instansiPerusahaan} (${k.lokasiKota}). Pembimbing: ${k.dosenPembimbing}`,
      penanggungJawab: k.dosenPembimbing,
      sifat: 'Wajib',
      badgeLabel: 'Seminar KP'
    }));

    return [...INITIAL_AGENDA_AKADEMIK, ...sidangAsAgenda, ...kpAsAgenda];
  }, [sidangList, kpList]);

  // Dynamic category counts for badges in the currently selected time range
  const categoryCounts = React.useMemo(() => {
    const scoped = combinedAgendaList.filter(item => {
      if (scopeFilter === 'prodi') {
        const matchesProdi = item.prodiId === selectedProdi.id || item.prodiId === 'SEMUA_FT';
        if (!matchesProdi) return false;
      }
      if (selectedAgendaRentang === 'mingguan') {
        return item.tanggalMulai >= '2026-11-09' && item.tanggalMulai <= '2026-11-16';
      } else if (selectedAgendaRentang === 'bulanan') {
        return item.tanggalMulai.startsWith('2026-11');
      }
      return true;
    });

    return {
      Semua: scoped.length,
      Ujian: scoped.filter(i => i.kategori === 'Ujian').length,
      Seminar: scoped.filter(i => i.kategori === 'Seminar').length,
      Libur: scoped.filter(i => i.kategori === 'Libur').length,
      KegiatanProdi: scoped.filter(i => i.kategori === 'Kegiatan Prodi').length,
    };
  }, [combinedAgendaList, scopeFilter, selectedProdi.id, selectedAgendaRentang]);

  // Filter based on prodi scope, rentang waktu (mingguan/bulanan/semua), kategori, and search query
  const filteredAgendaList = React.useMemo(() => {
    return combinedAgendaList.filter(item => {
      // 1. Prodi Scope Filter
      if (scopeFilter === 'prodi') {
        const matchesProdi = item.prodiId === selectedProdi.id || item.prodiId === 'SEMUA_FT';
        if (!matchesProdi) return false;
      }

      // 2. Rentang Waktu Filter
      if (selectedAgendaRentang === 'mingguan') {
        const isWeekly = item.tanggalMulai >= '2026-11-09' && item.tanggalMulai <= '2026-11-16';
        if (!isWeekly) return false;
      } else if (selectedAgendaRentang === 'bulanan') {
        const isMonthly = item.tanggalMulai.startsWith('2026-11');
        if (!isMonthly) return false;
      }

      // 3. Category Filter
      if (selectedAgendaKategori !== 'Semua' && item.kategori !== selectedAgendaKategori) {
        return false;
      }

      // 4. Search Query
      if (agendaSearchQuery.trim()) {
        const q = agendaSearchQuery.toLowerCase();
        const matchesSearch = 
          item.judul.toLowerCase().includes(q) ||
          item.lokasi.toLowerCase().includes(q) ||
          item.keterangan.toLowerCase().includes(q) ||
          item.penanggungJawab.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    }).sort((a, b) => a.tanggalMulai.localeCompare(b.tanggalMulai));
  }, [combinedAgendaList, scopeFilter, selectedProdi.id, selectedAgendaRentang, selectedAgendaKategori, agendaSearchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Banner / Header Title Section with Academic Period */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0 hidden sm:block">
              <img 
                src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
                alt="Logo Universitas Batanghari" 
                className="w-14 h-14 object-contain bg-white rounded-xl border border-slate-200 p-1 shadow-xs" 
              />
              <img 
                src={selectedProdi.fotoKaprodi} 
                alt={selectedProdi.kaprodi} 
                className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-xs absolute -bottom-1 -right-1" 
                title={`Kaprodi: ${selectedProdi.kaprodi}`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="font-semibold text-blue-700">{selectedProdi.nama}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedProdi.fakultas}</span>
                <span aria-hidden="true">·</span>
                <span>Semester Ganjil TA 2026/2027</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                Pusat Kendali Ketua Program Studi
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Dekan FT: <strong>Fadli Eka Yandra, ST., MT</strong> · Kaprodi: <strong>{selectedProdi.kaprodi}</strong> · Pemantauan mahasiswa {selectedProdi.singkatan} dan jadwal akademik real-time.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-center">
            {/* Scope Switcher: Prodi vs Semua Fakultas */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setScopeFilter('prodi')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  scopeFilter === 'prodi' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {selectedProdi.singkatan}
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  scopeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Prodi
              </button>
            </div>

            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Akreditasi: <strong className="text-blue-700">{selectedProdi.akreditasi}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Launch Banner: Sistem Informasi Akademik (SIAKAD) */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-4 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Sistem Informasi Akademik (SIAKAD) FT UNBARI</h3>
              <span className="px-2 py-0.2 bg-yellow-400 text-blue-950 font-bold text-[10px] rounded-full">
                Gasal 2026/2027
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Kelola KRS Online Mahasiswa, KHS dengan 11 skala mutu UNBARI, Input Nilai DPNA Dosen, dan Transkrip Kumulatif.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('siakad')}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-950 hover:bg-blue-50 font-bold rounded-lg text-xs shadow-xs transition-colors shrink-0 whitespace-nowrap"
        >
          <span>Buka Portal SIAKAD</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
        </button>
      </div>

      {/* Audit Kelengkapan CPL (Status Incomplete) Callout on Dashboard */}
      {dashboardCplCompleteness.incompleteCount > 0 && (
        <div className="bg-rose-50/85 border border-rose-300 rounded-xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 border border-rose-200 rounded-lg shrink-0 mt-0.5">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  Audit Kelengkapan Pemetaan CPL ke CPMK
                </h3>
                <span className="px-2 py-0.5 rounded border text-[11px] font-mono font-bold bg-rose-100 text-rose-800 border-rose-300 tabular-nums">
                  {dashboardCplCompleteness.incompleteCount} MK Status: Incomplete
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Ditemukan {dashboardCplCompleteness.incompleteCount} dari{' '}
                {dashboardCplCompleteness.totalCourses} mata kuliah yang belum memetakan komponen CPL inti secara eksplisit ke butir CPMK dalam RPS sehingga berstatus <strong>Incomplete</strong>.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {dashboardCplCompleteness.incompleteItems.slice(0, 4).map(item => (
                  <button
                    key={item.course.id}
                    type="button"
                    onClick={() => onNavigateTab('akreditasi:audit_kelengkapan_cpl')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-rose-100/70 border border-rose-200 rounded-lg text-[11px] transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-bold text-slate-900">
                      {item.course.kodeMK}
                    </span>
                    <span className="text-slate-700 truncate max-w-[160px]">
                      {item.course.namaMK}
                    </span>
                    <span className="font-bold text-rose-700">Incomplete</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('akreditasi:audit_kelengkapan_cpl')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 self-end lg:self-center cursor-pointer"
          >
            <span>Tinjau Audit Kelengkapan CPL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Visual Alert Banner: Dokumen Kerjasama Kadaluarsa atau < 3 Bulan */}
      {urgentKerjasamaDocs.length > 0 && showUrgentBanner && (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50/60 to-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-900 rounded-xl shrink-0 mt-0.5 border border-amber-300/80">
                <AlertTriangle className="w-5 h-5 text-amber-700 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    Peringatan Naskah Kerjasama Kadaluarsa &amp; Mendekati Berakhir (&lt; 3 Bulan)
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    {urgentKerjasamaDocs.length} Dokumen Perlu Tindakan
                  </span>
                  {expiredCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white">
                      {expiredCount} Kadaluarsa
                    </span>
                  )}
                  {expiringSoonCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                      {expiringSoonCount} &le; 90 Hari
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  Berdasarkan pemantauan siklus kemitraan Prodi <strong>{selectedProdi.nama}</strong>, terdapat naskah MoU/MoA yang telah melewati masa berlaku atau akan habis dalam kurun waktu kurang dari 90 hari. Segera lakukan proses perpanjangan (Addendum) untuk menjaga kepatuhan IKU-6 &amp; akreditasi LAM-Teknik.
                </p>

                {/* Quick list of urgent partners */}
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {urgentKerjasamaDocs.slice(0, 3).map((doc) => (
                    <div 
                      key={doc.id}
                      onClick={() => onNavigateTab('kerjasama')}
                      className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-amber-100/70 border border-amber-300/80 rounded-lg text-xs transition-colors shadow-2xs"
                      title="Klik untuk membuka dokumen ini di modul Kerjasama"
                    >
                      <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-[260px]">
                        {doc.mitraNama}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                        doc.isExpired ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {doc.daysRemaining <= 0 ? 'Kadaluarsa' : `${doc.daysRemaining} Hari Lagi`}
                      </span>
                    </div>
                  ))}
                  {urgentKerjasamaDocs.length > 3 && (
                    <span className="text-[11px] font-semibold text-slate-500 self-center">
                      +{urgentKerjasamaDocs.length - 3} mitra lainnya
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => onNavigateTab('kerjasama')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                <span>Tinjau &amp; Perpanjang (Addendum)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowUrgentBanner(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-amber-100 rounded-lg transition-colors"
                title="Sembunyikan peringatan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Alert Banner: Beban Kerja Dosen Tidak Sesuai (<12 atau >16 SKS) */}
      {bkdOutOfRangeList.length > 0 && showBkdAlertBanner && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50/60 to-rose-50 border border-rose-300 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-900 rounded-xl shrink-0 mt-0.5 border border-rose-300/80">
                <BellRing className="w-5 h-5 text-rose-700 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    Beban Kerja Dosen Tidak Sesuai
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    {bkdOutOfRangeList.length} Dosen Di Luar Rentang 12–16 SKS
                  </span>
                  {bkdOverloadCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white">
                      {bkdOverloadCount} Overload (&gt; 16 SKS)
                    </span>
                  )}
                  {bkdUnderloadCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                      {bkdUnderloadCount} Underload (&lt; 12 SKS)
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  Sistem mendeteksi dosen pada lingkup{' '}
                  <strong>{scopeFilter === 'prodi' ? selectedProdi.nama : 'Seluruh Prodi FT UNBARI'}</strong> dengan total ekuivalensi SKS mengajar &amp; bimbingan TA di luar standar LLDIKTI (12–16 SKS). Segera lakukan redistribusi jadwal atau bimbingan di modul BKD Dosen.
                </p>

                <div className="flex flex-wrap gap-2 pt-1.5">
                  {bkdOutOfRangeList.slice(0, 4).map(item => (
                    <button
                      type="button"
                      key={item.dosen.id}
                      onClick={() => onNavigateTab('bkd')}
                      className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-rose-50 border border-rose-300/80 rounded-lg text-xs transition-colors shadow-2xs"
                      title="Klik untuk meninjau beban kerja di modul BKD Dosen"
                    >
                      <span className="font-semibold text-slate-900 truncate max-w-[190px] sm:max-w-[230px]">
                        {item.dosen.namaLengkap}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-mono tabular-nums text-[10px] font-bold ${
                          item.isOverload
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {item.totalBebanSks.toFixed(1)} SKS ({item.isOverload ? 'Overload' : 'Underload'})
                      </span>
                    </button>
                  ))}
                  {bkdOutOfRangeList.length > 4 && (
                    <span className="text-[11px] font-semibold text-slate-500 self-center">
                      +{bkdOutOfRangeList.length - 4} dosen lainnya
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => onNavigateTab('bkd')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                <span>Audit &amp; Redistribusi BKD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowBkdAlertBanner(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-rose-100 rounded-lg transition-colors"
                title="Sembunyikan peringatan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Mahasiswa Aktif */}
        <div 
          onClick={() => onNavigateTab('mahasiswa')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 transition-colors cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Mahasiswa {scopeFilter === 'prodi' ? selectedProdi.singkatan : 'Teknik'}</span>
            <span className="p-1.5 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalMahasiswa}</span>
            <span className="text-xs text-slate-500">terdaftar</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{mhsTugasAkhir.length} {selectedProdi.jenjang === 'D3' ? 'Proyek Akhir' : 'Skripsi'}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 2: Mahasiswa Berisiko */}
        <div 
          onClick={() => onNavigateTab('mahasiswa')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-amber-400 transition-colors cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Mahasiswa Berisiko</span>
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">{mhsBerisiko.length}</span>
            <span className="text-xs text-amber-600 font-medium">perlu tindakan</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>IPK &lt; 2.50 atau Masa Studi</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 3: Real-Time Kelas Berlangsung */}
        <div 
          onClick={() => onNavigateTab('jadwal')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-400 transition-colors cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kelas Live Saat Ini</span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">{activeClasses.length}</span>
            <span className="text-xs text-emerald-700 font-medium">kelas aktif</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{dosenMengajar} Dosen Mengajar</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 4: Okupansi Lab & Ruang Kuliah */}
        <div 
          onClick={() => onNavigateTab('laboratorium')}
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-400 transition-colors cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Okupansi Lab & Bengkel</span>
            <span className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {ruanganTerpakai}/{displayRuangan.length}
            </span>
            <span className="text-xs text-slate-500">ruang aktif</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{displayRuangan.length > 0 ? Math.round((ruanganTerpakai / displayRuangan.length) * 100) : 0}% Terpakai</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 5: Dokumen Kerjasama Aktif & Pertumbuhan Kemitraan */}
        <div 
          onClick={() => onNavigateTab('kerjasama')}
          className={`bg-white border rounded-xl p-4 transition-all cursor-pointer group shadow-xs hover:shadow-sm ${
            urgentKerjasamaDocs.length > 0
              ? 'border-amber-300 ring-2 ring-amber-200/50 hover:border-amber-400'
              : 'border-slate-200 hover:border-blue-500'
          }`}
          title="Buka Manajemen Kerjasama & Kemitraan FT UNBARI"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 truncate flex items-center gap-1.5">
              Kerjasama {scopeFilter === 'prodi' ? selectedProdi.singkatan : 'Teknik'}
              {urgentKerjasamaDocs.length > 0 && (
                <span className="relative flex h-2 w-2" title={`${urgentKerjasamaDocs.length} dokumen butuh perpanjangan`}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </span>
            <span className={`p-1.5 rounded-md transition-colors ${
              urgentKerjasamaDocs.length > 0
                ? 'bg-amber-100 text-amber-800 group-hover:bg-amber-600 group-hover:text-white'
                : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
            }`}>
              <Handshake className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {totalKerjasamaAktif}
              </span>
              <span className="text-xs text-slate-500">aktif</span>
            </div>
            
            {/* Presentase Pertumbuhan Kemitraan dibanding Periode Sebelumnya */}
            <div 
              className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                growthRate >= 0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={`Pertumbuhan kemitraan dibanding periode sebelumnya (${prevBase} mitra lalu)`}
            >
              {growthRate >= 0 ? (
                <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-600 shrink-0" />
              )}
              <span>{growthRate >= 0 ? `+${growthRate.toFixed(1)}%` : `${growthRate.toFixed(1)}%`}</span>
            </div>
          </div>

          <div className="mt-2 text-[11px] flex items-center justify-between">
            {urgentKerjasamaDocs.length > 0 ? (
              <span className="text-amber-800 font-bold truncate flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{urgentKerjasamaDocs.length} Perlu Perpanjangan</span>
              </span>
            ) : (
              <span className="text-slate-500 truncate">
                {totalRealisasiTerlaksana > 0 
                  ? `${totalRealisasiTerlaksana} IA Terlaksana` 
                  : `${totalKerjasamaSemua} Naskah Kerjasama`}
              </span>
            )}
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
          </div>
        </div>

      </div>

      {/* Pelacakan Real-Time Jadwal Dosen vs Log Presensi (Deteksi Otomatis Lewat 15 Menit) */}
      <section
        aria-label="Pelacakan Real-Time Jadwal vs Log Presensi Dosen"
        className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
      >
        <div className="p-5 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
              <Radio className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  Pelacakan Real-Time Jadwal vs Log Presensi
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums font-semibold text-slate-800">
                  {currentDay}, {currentTimeStr} WIB
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Batas Toleransi <strong className="font-mono tabular-nums">{PRESENSI_TOLERANCE_MINUTES} Menit</strong>
                </span>
                {isSimulated && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-amber-700">Mode Simulasi Waktu</span>
                  </>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                Pemantauan Kehadiran Sesi Perkuliahan Otomatis ({scopeFilter === 'prodi' ? selectedProdi.singkatan : 'Semua Prodi'})
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Membandingkan jadwal mengajar dosen terhadap log presensi masuk di sistem. Sesi otomatis ditandai <strong>Terlambat</strong> atau <strong>Belum Hadir</strong> apabila waktu saat ini melewati <strong>{PRESENSI_TOLERANCE_MINUTES} menit</strong> dari jadwal mulai.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setTrackingDayScope('TODAY')}
                className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  trackingDayScope === 'TODAY'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hari Ini ({currentDay})
              </button>
              <button
                type="button"
                onClick={() => setTrackingDayScope('ALL')}
                className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  trackingDayScope === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Hari
              </button>
            </div>

            {onSetSimulatedTime && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const testDay = currentDay === 'Minggu' ? 'Jumat' : currentDay;
                    onSetSimulatedTime(testDay, '08:25');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Simulasikan jam 08:25 WIB (+25 menit dari sesi pagi 08:00) untuk menguji deteksi otomatis >15 menit"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Uji 08:25 WIB (+25m)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const testDay = currentDay === 'Minggu' ? 'Jumat' : currentDay;
                    onSetSimulatedTime(testDay, '13:50');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Simulasikan jam 13:50 WIB (+20 menit dari sesi siang 13:30)"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Uji 13:50 WIB (+20m)</span>
                </button>
              </>
            )}

            {isSimulated && onResetSimulation && (
              <button
                type="button"
                onClick={onResetSimulation}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Waktu Live</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Column Summary Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setTrackingStatusFilter('ALL')}
            className="p-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 block">
              Total Sesi ({realtimePresensiSummary.academicDayEvaluated})
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
              {realtimePresensiSummary.totalSessions} Sesi
            </span>
            <span className="text-[10px] text-slate-500 font-mono tabular-nums">
              Kepatuhan tepat waktu: {realtimePresensiSummary.complianceRatePercent}%
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTrackingStatusFilter('HADIR_TEPAT_WAKTU')}
            className="p-4 text-left hover:bg-emerald-50/40 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-slate-500 block">Hadir Tepat Waktu</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-0.5 block">
              {realtimePresensiSummary.hadirTepatWaktuCount} Sesi
            </span>
            <span className="text-[10px] text-slate-500">
              Log presensi &le; {PRESENSI_TOLERANCE_MINUTES} mnt dari jadwal
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTrackingStatusFilter('TERLAMBAT')}
            className="p-4 text-left bg-amber-50/45 hover:bg-amber-50/80 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-amber-800 font-medium block">
              Terlambat (&gt;{PRESENSI_TOLERANCE_MINUTES} Menit)
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-amber-800 mt-0.5 block">
              {realtimePresensiSummary.terlambatCount} Sesi
            </span>
            <span className="text-[10px] text-amber-800">
              Check-in telat / belum log di ruang kelas
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTrackingStatusFilter('BELUM_HADIR')}
            className="p-4 text-left bg-rose-50/45 hover:bg-rose-50/80 transition-colors cursor-pointer"
          >
            <span className="text-[11px] text-rose-800 font-medium block">
              Belum Hadir (&gt;{PRESENSI_TOLERANCE_MINUTES} Menit)
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-0.5 block">
              {realtimePresensiSummary.belumHadirCount} Sesi
            </span>
            <span className="text-[10px] text-rose-700">
              Lewat 15 menit tanpa log presensi masuk
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: `Semua (${realtimePresensiSummary.totalSessions})` },
                { id: 'OVER_15', label: `Lewat >15m (${realtimePresensiSummary.flaggedOver15Count})` },
                { id: 'BELUM_HADIR', label: `Belum Hadir (${realtimePresensiSummary.belumHadirCount})` },
                { id: 'TERLAMBAT', label: `Terlambat (${realtimePresensiSummary.terlambatCount})` },
                { id: 'MENUNGGU_CHECKIN', label: `Toleransi ≤15m (${realtimePresensiSummary.menungguCount})` },
                { id: 'HADIR_TEPAT_WAKTU', label: `Tepat Waktu (${realtimePresensiSummary.hadirTepatWaktuCount})` }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTrackingStatusFilter(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  trackingStatusFilter === tab.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={trackingSearchQuery}
              onChange={e => setTrackingSearchQuery(e.target.value)}
              placeholder="Cari mata kuliah, ruangan, atau dosen..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Real-Time Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3 px-4 min-w-[230px]">Jadwal Perkuliahan</th>
                <th className="py-3 px-4 min-w-[190px]">Dosen Pengampu</th>
                <th className="py-3 px-4 min-w-[180px]">Log Presensi Sistem</th>
                <th className="py-3 px-4 min-w-[230px]">Status Otomatis (Batas 15 Menit)</th>
                <th className="py-3 px-4 text-right min-w-[200px]">Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRealtimeSessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-slate-500">
                    {realtimePresensiSummary.totalSessions === 0 ? (
                      <div className="space-y-2">
                        <p className="font-medium text-slate-700">
                          Tidak ada jadwal perkuliahan terdaftar untuk hari {currentDay} pada {scopeFilter === 'prodi' ? selectedProdi.nama : 'Fakultas Teknik'}.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTrackingDayScope('ALL')}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer"
                          >
                            Tampilkan Semua Hari
                          </button>
                          {onSetSimulatedTime && (
                            <button
                              type="button"
                              onClick={() => onSetSimulatedTime('Jumat', '08:25')}
                              className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer"
                            >
                              Simulasi Jumat 08:25 WIB
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      'Tidak ada sesi perkuliahan yang cocok dengan filter atau kata kunci pencarian.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredRealtimeSessions.slice(0, 12).map(item => {
                  const j = item.jadwal;
                  const statusColorClass =
                    item.status === 'BELUM_HADIR'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : item.status === 'TERLAMBAT'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : item.status === 'HADIR_TEPAT_WAKTU'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : item.status === 'MENUNGGU_CHECKIN'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <tr
                      key={j.id}
                      className={`transition-colors ${
                        item.status === 'BELUM_HADIR'
                          ? 'bg-rose-50/25 hover:bg-rose-50/50'
                          : item.status === 'TERLAMBAT'
                          ? 'bg-amber-50/25 hover:bg-amber-50/50'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                          <span className="font-bold text-blue-900">{j.kodeMK}</span>
                          <span aria-hidden="true">·</span>
                          <span>{j.hari}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums font-semibold text-slate-800">
                            {j.jamMulai}–{j.jamSelesai} WIB
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">{j.namaMK}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Kelas {j.kelas} · {j.sks} SKS · {j.ruanganNama}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{j.dosenNama}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.matchedDosen
                            ? `${item.matchedDosen.statusRealTime} · ${item.matchedDosen.lokasiTerkini}`
                            : `NIDN ${j.dosenNidn || '-'}`}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {item.hasCheckInLog && item.jamMasukAktual ? (
                          <div className="space-y-0.5">
                            <div className="font-mono tabular-nums font-bold text-slate-900">
                              Check-In: {item.jamMasukAktual} WIB
                            </div>
                            <div
                              className={`text-[11px] font-mono tabular-nums ${
                                item.selisihMenit > PRESENSI_TOLERANCE_MINUTES
                                  ? 'text-amber-700 font-bold'
                                  : 'text-emerald-700 font-semibold'
                              }`}
                            >
                              {item.selisihMenit <= 0
                                ? `${Math.abs(item.selisihMenit)} mnt lebih awal`
                                : `+${item.selisihMenit} mnt dari jadwal`}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-700">Belum ada log masuk</div>
                            <div className="text-[11px] font-mono tabular-nums text-slate-500">
                              {item.selisihMenit >= 0
                                ? `+${item.selisihMenit} mnt lewat dari ${j.jamMulai}`
                                : `Mulai ${Math.abs(item.selisihMenit)} mnt lagi`}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 space-y-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border whitespace-nowrap ${statusColorClass}`}
                        >
                          {item.status === 'HADIR_TEPAT_WAKTU' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          ) : item.lewatBatas15Menit ? (
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>
                            {item.statusLabel}
                            {item.lewatBatas15Menit && item.selisihMenit > 0
                              ? ` (+${item.selisihMenit} mnt)`
                              : ''}
                          </span>
                        </span>
                        <div className="text-[11px] text-slate-600 leading-snug">
                          {item.statusDetail}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {!item.hasCheckInLog && onRecordRealTimePresensi && item.status !== 'DITIADAKAN' && (
                            <button
                              type="button"
                              onClick={() => onRecordRealTimePresensi(j)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              title={`Catat log check-in dosen sekarang (${currentTimeStr} WIB)`}
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Catat Check-In</span>
                            </button>
                          )}

                          {item.lewatBatas15Menit && onOpenAuditSidakModal && (
                            <button
                              type="button"
                              onClick={() => onOpenAuditSidakModal(j.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              title="Lakukan audit sidak kehadiran kelas ini"
                            >
                              <ClipboardCheck className="w-3 h-3" />
                              <span>Sidak</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onNavigateTab('jadwal')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>Log &amp; BAP</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredRealtimeSessions.length > 12 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-mono tabular-nums">
              Menampilkan 12 dari {filteredRealtimeSessions.length} sesi perkuliahan
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('jadwal')}
              className="font-semibold text-blue-700 hover:underline cursor-pointer"
            >
              Lihat seluruh jadwal &amp; rekap presensi dosen →
            </button>
          </div>
        )}
      </section>

      {/* Visualisasi Recharts Distribusi Status Mahasiswa per Angkatan */}
      <StudentCohortStatusChart
        mahasiswaList={mahasiswaList}
        selectedProdi={selectedProdi}
        onNavigateTab={onNavigateTab}
        onSelectMahasiswa={onSelectMahasiswa}
      />

      {/* Visualisasi Tren IPK Mahasiswa & Tingkat Kelulusan Program Studi (Recharts) */}
      <AcademicAnalyticsChart
        selectedProdi={selectedProdi}
        mahasiswaList={displayMhs}
        yudisiumList={yudisiumList}
      />

      {/* Visualisasi Statistik Kehadiran Dosen Real-Time (Recharts Donut/Bar) */}
      <DosenPresenceChart
        dosenList={dosenList}
        selectedProdi={selectedProdi}
        currentDay={currentDay}
        currentTimeStr={currentTimeStr}
        onNavigateTab={onNavigateTab}
        onUpdateDosenStatus={onUpdateDosenStatus}
      />

      {/* Main Grid: Active Classes Live Now + Early Warning Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Real-Time Ongoing Classes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Perkuliahan & Praktikum Berlangsung ({currentDay}, {currentTimeStr} WIB)
                </h2>
                <p className="text-xs text-slate-500">
                  Status real-time workshop, lab teknik, dosen pengampu, dan kelas berjalan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onOpenAuditSidakModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAuditSidakModal()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors shrink-0"
                    title="Audit Sidak Kehadiran Mahasiswa Langsung di Ruang Kelas"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>+ Sidak Presensi</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigateTab('lms')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors whitespace-nowrap"
                  title="Buka Portal LMS & E-Learning"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Portal LMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('jadwal')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
                >
                  Semua Jadwal →
                </button>
              </div>
            </div>

            {activeClasses.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">Tidak ada jadwal perkuliahan aktif pada jam ini.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Gunakan tombol simulasi di header untuk menguji sesi kuliah pagi (08:30 WIB) atau sore.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {activeClasses.map((jadwal) => (
                  <div key={jadwal.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-blue-700">{jadwal.kodeMK}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-medium text-slate-900">{jadwal.namaMK}</span>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Kelas {jadwal.kelas} ({jadwal.sks} SKS)
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <strong className="text-slate-800">{jadwal.dosenNama}</strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {jadwal.ruanganNama}
                        </span>
                      </div>
                      {jadwal.topikPertemuan && (
                        <div className="text-[11px] text-slate-500 italic">
                          Materi: "{jadwal.topikPertemuan}"
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {jadwal.jamMulai} - {jadwal.jamSelesai}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {hitungSisaWaktu(jadwal, currentTimeStr)}
                        </span>
                      </div>
                      {onOpenAuditSidakModal && (
                        <button
                          type="button"
                          onClick={() => onOpenAuditSidakModal(jadwal.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                          title="Lakukan audit sidak presensi fisik pada sesi kelas ini"
                        >
                          <ClipboardCheck className="w-3 h-3 text-red-600" />
                          <span>Sidak Kelas Ini</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Kehadiran Mendadak (Sidak Presensi Kelas) Dashboard Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-red-100 text-red-700 rounded-lg">
                  <ClipboardCheck className="w-4 h-4 text-red-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Audit Kehadiran Mendadak (Sidak Presensi Kelas)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Spot-check kehadiran fisik mahasiswa di kelas &amp; integrasi deteksi dini EWS
                  </p>
                </div>
              </div>

              {onOpenAuditSidakModal && (
                <button
                  type="button"
                  onClick={() => onOpenAuditSidakModal()}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <span>Mulai Sidak Baru</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick KPI stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-[10px] text-slate-500 font-medium block">Sidak Terlaksana</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {displayAuditSidak.length} Sesi
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <span className="text-[10px] text-emerald-700 font-medium block">Rata-Rata Kehadiran</span>
                <span className="text-base font-bold text-emerald-800 font-mono">
                  {displayAuditSidak.length > 0 
                    ? Math.round(displayAuditSidak.reduce((acc, a) => acc + a.persentaseKehadiranSidak, 0) / displayAuditSidak.length) 
                    : 0}%
                </span>
              </div>
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-center">
                <span className="text-[10px] text-red-700 font-medium block">Alpa Terjaring</span>
                <span className="text-base font-bold text-red-800 font-mono">
                  {displayAuditSidak.reduce((acc, a) => acc + a.jumlahAlpa, 0)} Mhs
                </span>
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <span className="text-[10px] text-amber-800 font-medium block">SP Otomatis Terbit</span>
                <span className="text-base font-bold text-amber-900 font-mono">
                  {displayAuditSidak.reduce((acc, a) => acc + a.peringatanGeneratedIds.length, 0)} Surat
                </span>
              </div>
            </div>

            {/* List of Recent Spot-Checks */}
            <div className="divide-y divide-slate-100">
              {displayAuditSidak.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  Belum ada sesi sidak kehadiran tercatat untuk program studi ini.
                </p>
              ) : (
                displayAuditSidak.slice(0, 3).map((audit) => (
                  <div key={audit.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-700">{audit.kodeMK}</span>
                        <span className="font-semibold text-slate-800">{audit.namaMK}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                          Kelas {audit.kelas}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>👨‍🏫 {audit.dosenNama}</span>
                        <span>·</span>
                        <span>📍 {audit.ruanganNama}</span>
                        <span>·</span>
                        <span className="font-mono">{audit.hari}, {audit.tanggal}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        audit.persentaseKehadiranSidak >= 80 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {audit.persentaseKehadiranSidak}% Hadir ({audit.jumlahAlpa} Alpa)
                      </span>
                      {onOpenAuditSidakModal && (
                        <button
                          type="button"
                          onClick={() => onOpenAuditSidakModal(audit.jadwalId)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                        >
                          Berita Acara
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending BAP Verification by Kaprodi */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Verifikasi Berita Acara Perkuliahan (BAP) Kaprodi
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {pendingBapList.length} Menunggu Pengesahan
              </span>
            </div>

            {pendingBapList.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Semua Berita Acara Perkuliahan telah diverifikasi oleh Kaprodi {selectedProdi.singkatan}.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingBapList.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {item.namaMK} ({item.kelas}) · Pertemuan {item.pertemuanKe || 8}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Dosen: {item.dosenNama} · Peserta: {item.pesertaTotal} Mhs
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onVerifyBap(item.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shrink-0"
                    >
                      Sahkan BAP
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kalender & Agenda Akademik Terintegrasi (Kategori: Ujian, Seminar, Libur, Kegiatan Prodi) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            {/* Header: Title & Time Range Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                  <CalendarDays className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Agenda Akademik &amp; Kalender Kegiatan</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {filteredAgendaList.length} Agenda
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Tinjauan terpadu Ujian, Seminar, Libur, dan Kegiatan Prodi {scopeFilter === 'prodi' ? selectedProdi.singkatan : 'Fakultas Teknik'}
                  </p>
                </div>
              </div>

              {/* Time Range Filter Buttons: Mingguan vs Bulanan vs Semua */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedAgendaRentang('mingguan')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedAgendaRentang === 'mingguan'
                      ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tinjau agenda 7 hari ke depan (Minggu Ini)"
                >
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span>Mingguan (7 Hari)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAgendaRentang('bulanan')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedAgendaRentang === 'bulanan'
                      ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tinjau agenda bulan berjalan (November 2026)"
                >
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  <span>Bulanan (Nov 2026)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAgendaRentang('semua')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedAgendaRentang === 'semua'
                      ? 'bg-white text-blue-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tinjau seluruh agenda semester ganjil 2026/2027"
                >
                  <span>Semua Semester</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills & Search Bar Toolbar */}
            <div className="mt-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
                {/* Semua */}
                <button
                  type="button"
                  onClick={() => setSelectedAgendaKategori('Semua')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    selectedAgendaKategori === 'Semua'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>Semua Kategori</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedAgendaKategori === 'Semua' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {categoryCounts.Semua}
                  </span>
                </button>

                {/* Ujian */}
                <button
                  type="button"
                  onClick={() => setSelectedAgendaKategori('Ujian')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    selectedAgendaKategori === 'Ujian'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/70'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Ujian</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedAgendaKategori === 'Ujian' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-900 font-bold'
                  }`}>
                    {categoryCounts.Ujian}
                  </span>
                </button>

                {/* Seminar */}
                <button
                  type="button"
                  onClick={() => setSelectedAgendaKategori('Seminar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    selectedAgendaKategori === 'Seminar'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/70'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Seminar</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedAgendaKategori === 'Seminar' ? 'bg-purple-700 text-white' : 'bg-purple-200 text-purple-900 font-bold'
                  }`}>
                    {categoryCounts.Seminar}
                  </span>
                </button>

                {/* Libur */}
                <button
                  type="button"
                  onClick={() => setSelectedAgendaKategori('Libur')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    selectedAgendaKategori === 'Libur'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Libur</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedAgendaKategori === 'Libur' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900 font-bold'
                  }`}>
                    {categoryCounts.Libur}
                  </span>
                </button>

                {/* Kegiatan Prodi */}
                <button
                  type="button"
                  onClick={() => setSelectedAgendaKategori('Kegiatan Prodi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    selectedAgendaKategori === 'Kegiatan Prodi'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/70'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Kegiatan Prodi</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedAgendaKategori === 'Kegiatan Prodi' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-900 font-bold'
                  }`}>
                    {categoryCounts.KegiatanProdi}
                  </span>
                </button>
              </div>

              {/* Search Bar Input */}
              <div className="relative shrink-0 w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={agendaSearchQuery}
                  onChange={(e) => setAgendaSearchQuery(e.target.value)}
                  placeholder="Cari agenda, ruang, topik..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                />
                {agendaSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAgendaSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Event Items List */}
            <div className="mt-4 space-y-2.5">
              {filteredAgendaList.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-700">
                    Tidak ada agenda akademik ditemukan
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tidak ada agenda untuk kategori <strong className="text-slate-800 font-semibold">{selectedAgendaKategori}</strong> dalam rentang <strong className="text-slate-800 font-semibold">{selectedAgendaRentang}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAgendaKategori('Semua');
                      setSelectedAgendaRentang('semua');
                      setAgendaSearchQuery('');
                    }}
                    className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
                  >
                    Reset Filter &amp; Tampilkan Semua Agenda
                  </button>
                </div>
              ) : (
                filteredAgendaList.map((agenda) => {
                  const isUjian = agenda.kategori === 'Ujian';
                  const isSeminar = agenda.kategori === 'Seminar';
                  const isLibur = agenda.kategori === 'Libur';
                  const isProdi = agenda.kategori === 'Kegiatan Prodi';

                  return (
                    <div
                      key={agenda.id}
                      className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                        isLibur
                          ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                          : isUjian
                            ? 'bg-rose-50/30 border-rose-200/80 hover:border-rose-300'
                            : isSeminar
                              ? 'bg-purple-50/30 border-purple-200/80 hover:border-purple-300'
                              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-2xs'
                      }`}
                    >
                      {/* Left: Date Block & Title & Details */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Date Box */}
                        <div className={`p-2 rounded-xl text-center shrink-0 w-16 border ${
                          isLibur
                            ? 'bg-amber-100 border-amber-300 text-amber-950'
                            : isUjian
                              ? 'bg-rose-100 border-rose-300 text-rose-950'
                              : isSeminar
                                ? 'bg-purple-100 border-purple-300 text-purple-950'
                                : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}>
                          <div className="text-[10px] font-bold uppercase tracking-wider">
                            {agenda.hari}
                          </div>
                          <div className="text-base font-extrabold font-mono leading-none mt-0.5">
                            {agenda.tanggalMulai.split('-')[2]}
                          </div>
                          <div className="text-[9px] font-medium opacity-80 mt-0.5">
                            {agenda.tanggalMulai.split('-')[1] === '11' ? 'Nov 26' : agenda.tanggalMulai.split('-')[1] === '12' ? 'Des 26' : 'Jan 27'}
                          </div>
                        </div>

                        {/* Title, Badges, & Metadata */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {/* Category Badge */}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.2 rounded-md border ${
                              isUjian
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : isSeminar
                                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                                  : isLibur
                                    ? 'bg-amber-200 text-amber-950 border-amber-300 font-black'
                                    : 'bg-blue-100 text-blue-900 border-blue-300'
                            }`}>
                              {isUjian && <FileSpreadsheet className="w-3 h-3 text-rose-700" />}
                              {isSeminar && <Award className="w-3 h-3 text-purple-700" />}
                              {isLibur && <Coffee className="w-3 h-3 text-amber-800" />}
                              {isProdi && <Building2 className="w-3 h-3 text-blue-700" />}
                              <span>{agenda.kategori}</span>
                            </span>

                            {/* Scope Badge */}
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {agenda.prodiId === 'SIPIL' ? 'S1 Teknik Sipil' : agenda.prodiId === 'LINGKUNGAN' ? 'S1 Lingkungan' : agenda.prodiId === 'LISTRIK_D3' ? 'D3 Listrik' : 'Semua FT'}
                            </span>

                            {/* Badge Label (Hari Ini / Minggu Ini / Sidang) */}
                            {agenda.badgeLabel && (
                              <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                                agenda.badgeLabel === 'Hari Ini'
                                  ? 'bg-emerald-600 text-white animate-pulse'
                                  : agenda.badgeLabel === 'Minggu Ini'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                              }`}>
                                {agenda.badgeLabel}
                              </span>
                            )}
                          </div>

                          {/* Event Title */}
                          <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-950 transition-colors">
                            {agenda.judul}
                          </h3>

                          {/* Description */}
                          {agenda.keterangan && (
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {agenda.keterangan}
                            </p>
                          )}

                          {/* Person in Charge */}
                          {agenda.penanggungJawab && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              PJ / Pembimbing: <strong className="text-slate-700 font-semibold">{agenda.penanggungJawab}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Time, Room/Location & Action */}
                      <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-900 text-xs">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{agenda.jam}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 max-w-[200px] truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{agenda.lokasi}</span>
                        </div>
                        {agenda.id.startsWith('sidang') || agenda.id.startsWith('kp') ? (
                          <button
                            type="button"
                            onClick={() => onNavigateTab('sidang_kp')}
                            className="mt-1.5 text-[10px] font-bold text-purple-700 hover:text-purple-900 underline"
                          >
                            Buka Detail Sidang →
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer Note */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Status Kalender:</span>
                <span>Semester Ganjil 2026/2027 Aktif</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('sidang_kp')}
                  className="font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                >
                  Tabel Kesesuaian Jadwal Dosen (Irisan Waktu) →
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('sidang_kp')}
                  className="font-bold text-slate-700 hover:text-blue-900 cursor-pointer"
                >
                  Kelola Sidang TA &amp; KP ({sidangList.length + kpList.length}) →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Early Warnings, LAM-Teknik, & At-Risk Students */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* EWS Mahasiswa Kritis (DO Prevention) Action Card */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50/80 border border-red-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-600 text-white shadow-2xs">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-red-950 uppercase tracking-wide">
                    Early Warning System (EWS)
                  </h3>
                  <p className="text-[11px] text-red-700">
                    Deteksi Dini Masa Studi Kritis (Semester &ge; 10) &amp; Peringatan DO
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">
              Terdapat mahasiswa berisiko melebihi batas waktu studi maksimal PD-Dikti yang memerlukan konseling percepatan dan penerbitan Surat Peringatan (SP) Dekanat.
            </p>

            <div className="mt-3 pt-2.5 border-t border-red-200/60 flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-red-800">
                Peringatan Aktif Dekanat
              </span>
              <button
                type="button"
                onClick={onOpenEwsModal}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                <span>Audit &amp; Buat Surat SP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Akreditasi LAM-Teknik Quick Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Akreditasi LAM-Teknik &amp; OBE
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Proyeksi Skor: <strong className="text-emerald-700 font-mono">368.5 (Unggul)</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('akreditasi')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
              >
                Borang 9 Kriteria →
              </button>
            </div>
          </div>

          {/* Kartu Ringkasan Performa Kerjasama & IKU-6 Prodi */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  <Handshake className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Performa Kemitraan &amp; IKU-6 {scopeFilter === 'prodi' ? selectedProdi.singkatan : 'FT UNBARI'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kemitraan Tridharma &amp; Pertumbuhan Dokumen
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('kerjasama')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
              >
                Buka Modul →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium block">
                  Dokumen Kerjasama Aktif
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {totalKerjasamaAktif}
                  </span>
                  <span className="text-[11px] text-slate-500">/ {totalKerjasamaSemua} Naskah</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                  ✓ Valid &amp; Berbadan Hukum
                </span>
              </div>

              <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-medium block">
                  Pertumbuhan Kemitraan
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg font-bold text-emerald-700 font-mono">
                    {growthRate >= 0 ? `+${growthRate.toFixed(1)}%` : `${growthRate.toFixed(1)}%`}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block truncate">
                  vs Periode Sebelumnya ({prevBase} mitra)
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <strong>{totalRealisasiTerlaksana}</strong> Realisasi IA Terlaksana
              </span>
              <span className="flex items-center gap-1 font-mono text-slate-500">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                {totalMahasiswaMBKM} Mhs Terlibat
              </span>
            </div>

            {urgentKerjasamaDocs.length > 0 && (
              <div
                onClick={() => onNavigateTab('kerjasama')}
                className="mt-3 p-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-amber-100/80 transition-all shadow-2xs group"
                title="Klik untuk membuka modul Kerjasama dan memproses addendum/perpanjangan"
              >
                <div className="flex items-center gap-1.5 text-amber-950 font-medium text-[11px] min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                  </span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="truncate">
                    <strong className="text-amber-900">{urgentKerjasamaDocs.length} mitra</strong> kadaluarsa / &lt; 3 bln
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 underline group-hover:text-amber-950 shrink-0">
                  Perpanjang →
                </span>
              </div>
            )}
          </div>

          {/* Peringatan Dini Akademik Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-slate-900">Catatan Monitoring Harian Dosen</h2>
              </div>
              <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {displayPeringatan.filter(p => !p.sudahDitindaklanjuti).length} Terbuka
              </span>
            </div>

            <div className="space-y-3 mt-3">
              {displayPeringatan.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  Tidak ada isu peringatan akademik untuk program studi ini saat ini.
                </p>
              ) : (
                displayPeringatan.map((p) => {
                  const targetMhs = mahasiswaList.find(m => m.id === p.mahasiswaId);
                  return (
                    <div 
                      key={p.id}
                      className={`p-3 rounded-lg border text-xs transition-colors ${
                        p.sudahDitindaklanjuti 
                          ? 'bg-slate-50 border-slate-200 opacity-60' 
                          : p.level === 'Tindakan Segera' 
                            ? 'bg-red-50/50 border-red-200' 
                            : 'bg-amber-50/50 border-amber-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <span>{p.namaMahasiswa}</span>
                            <span className="font-mono text-[11px] text-slate-500">({p.nim})</span>
                          </div>
                          <span className={`inline-block text-[10px] font-medium mt-0.5 ${
                            p.level === 'Tindakan Segera' ? 'text-red-700' : 'text-amber-700'
                          }`}>
                            {p.tipe} · {p.level}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{p.tanggal}</span>
                      </div>

                      <p className="text-slate-600 mt-1.5 leading-relaxed text-[11px]">
                        {p.deskripsi}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        {targetMhs && (
                          <button
                            type="button"
                            onClick={() => onSelectMahasiswa(targetMhs)}
                            className="text-blue-700 hover:text-blue-900 font-medium text-[11px]"
                          >
                            Lihat Profil & Riwayat →
                          </button>
                        )}

                        {!p.sudahDitindaklanjuti ? (
                          <button
                            type="button"
                            onClick={() => onTindakLanjutiPeringatan(p.id)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded transition-colors"
                          >
                            Tandai Ditindaklanjuti
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Sudah Ditangani
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Dosen Presence Overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">
                Keberadaan Dosen {scopeFilter === 'prodi' ? selectedProdi.singkatan : ''}
              </h2>
              <button
                type="button"
                onClick={() => onNavigateTab('jadwal')}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Detail →
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2 text-xs">
              {displayDosen.map((d) => (
                <div key={d.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <div className="font-medium text-slate-900 truncate">{d.namaLengkap}</div>
                    <div className="text-[11px] text-slate-500 truncate">{d.lokasiTerkini}</div>
                  </div>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded font-medium ${
                    d.statusRealTime === 'Sedang Mengajar'
                      ? 'bg-emerald-100 text-emerald-800'
                      : d.statusRealTime === 'Ada di Ruang Dosen'
                        ? 'bg-blue-100 text-blue-800'
                        : d.statusRealTime === 'Bimbingan Mahasiswa'
                          ? 'bg-purple-100 text-purple-800'
                          : d.statusRealTime === 'Izin / Tugas Luar'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                  }`}>
                    {d.statusRealTime}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Dekanat Fakultas Teknik UNBARI Leadership Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Pimpinan Fakultas Teknik Universitas Batanghari (Dekanat FT UNBARI)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Periode Kepemimpinan 2024 - 2028
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dekan */}
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-700 text-white rounded uppercase tracking-wider">
                Dekan FT
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-2 leading-tight">
                {PIMPINAN_FAKULTAS_TEKNIK.dekan.nama}
              </h3>
              <div className="text-[11px] text-blue-800 font-medium mt-0.5">
                {PIMPINAN_FAKULTAS_TEKNIK.dekan.jabatan}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-blue-100 text-[10px] font-mono text-slate-500">
              NIDN: {PIMPINAN_FAKULTAS_TEKNIK.dekan.nidn}
            </div>
          </div>

          {/* Wakil Dekan I */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-white rounded uppercase tracking-wider">
                Wakil Dekan I
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-2 leading-tight">
                {PIMPINAN_FAKULTAS_TEKNIK.wakilDekan1.nama}
              </h3>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                {PIMPINAN_FAKULTAS_TEKNIK.wakilDekan1.bidang}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
              NIDN: {PIMPINAN_FAKULTAS_TEKNIK.wakilDekan1.nidn}
            </div>
          </div>

          {/* Wakil Dekan II */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-white rounded uppercase tracking-wider">
                Wakil Dekan II
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-2 leading-tight">
                {PIMPINAN_FAKULTAS_TEKNIK.wakilDekan2.nama}
              </h3>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                {PIMPINAN_FAKULTAS_TEKNIK.wakilDekan2.bidang}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
              NIDN: {PIMPINAN_FAKULTAS_TEKNIK.wakilDekan2.nidn}
            </div>
          </div>

          {/* Wakil Dekan III */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-white rounded uppercase tracking-wider">
                Wakil Dekan III
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-2 leading-tight">
                {PIMPINAN_FAKULTAS_TEKNIK.wakilDekan3.nama}
              </h3>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                {PIMPINAN_FAKULTAS_TEKNIK.wakilDekan3.bidang}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
              NIDN: {PIMPINAN_FAKULTAS_TEKNIK.wakilDekan3.nidn}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

