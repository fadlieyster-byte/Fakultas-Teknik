import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ArrowRight,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  DatabaseZap,
  Download,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Wallet
} from 'lucide-react';
import {
  Dosen,
  DpnaRecord,
  JadwalKerjaPraktek,
  JadwalKuliah,
  JadwalSidangTA,
  KalenderAkademikEvent,
  KhsRecord,
  KrsRecord,
  LogPresensiDosen,
  Mahasiswa,
  PeringatanAkademik,
  ProgramStudiInfo,
  RuanganLab,
  SkpiRecord,
  TagihanUktMahasiswa,
  YudisiumRecord
} from '../types/index';
import {
  DAFTAR_PERIODE_SEMESTER,
  INITIAL_DPNA_RECORDS,
  INITIAL_KALENDER_AKADEMIK,
  INITIAL_KHS_RECORDS,
  INITIAL_KRS_RECORDS
} from '../data/mockSiakadData';
import { logKaprodiActivity } from '../utils/activityLogHelper';

const STORAGE_KEY_KRS = 'siakad_unbari_krs_v2';
const STORAGE_KEY_KHS = 'siakad_unbari_khs_v2';
const STORAGE_KEY_DPNA = 'siakad_unbari_dpna_v2';
const STORAGE_KEY_KALENDER = 'sikaprodi_terpadu_kalender_v1';
const STORAGE_KEY_PDDIKTI_LOG = 'sikaprodi_terpadu_pddikti_log_v1';

type SubModuleTab = 'integrasi_360' | 'rekonsiliasi' | 'kalender' | 'pddikti';

interface PddiktiSyncAuditEntry {
  id: string;
  waktu: string;
  prodi: string;
  totalEntitas: number;
  siapKirim: number;
  catatan: string;
}

interface SistemTerpaduAkademikViewProps {
  selectedProdi: ProgramStudiInfo;
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  jadwalList: JadwalKuliah[];
  ruanganList: RuanganLab[];
  tagihanList: TagihanUktMahasiswa[];
  sidangList: JadwalSidangTA[];
  kpList: JadwalKerjaPraktek[];
  yudisiumList: YudisiumRecord[];
  skpiList: SkpiRecord[];
  logPresensiList: LogPresensiDosen[];
  peringatanList: PeringatanAkademik[];
  onNavigateTab: (tab: string) => void;
  onShowToast: (msg: string) => void;
}

function safeLoadArray<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export const SistemTerpaduAkademikView: React.FC<SistemTerpaduAkademikViewProps> = ({
  selectedProdi,
  mahasiswaList,
  dosenList,
  jadwalList,
  ruanganList,
  tagihanList,
  sidangList,
  kpList,
  yudisiumList,
  skpiList,
  logPresensiList,
  peringatanList,
  onNavigateTab,
  onShowToast
}) => {
  const [subTab, setSubTab] = useState<SubModuleTab>('integrasi_360');
  const [scopeMode, setScopeMode] = useState<'prodi' | 'fakultas'>('prodi');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [readinessFilter, setReadinessFilter] = useState<'all' | 'siap' | 'kendala'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Live SIAKAD storage mirrors
  const [krsRecords, setKrsRecords] = useState<KrsRecord[]>(() =>
    safeLoadArray<KrsRecord>(STORAGE_KEY_KRS, INITIAL_KRS_RECORDS)
  );
  const [khsRecords] = useState<KhsRecord[]>(() =>
    safeLoadArray<KhsRecord>(STORAGE_KEY_KHS, INITIAL_KHS_RECORDS)
  );
  const [dpnaRecords] = useState<DpnaRecord[]>(() =>
    safeLoadArray<DpnaRecord>(STORAGE_KEY_DPNA, INITIAL_DPNA_RECORDS)
  );

  // Academic Calendar state
  const [kalenderEvents, setKalenderEvents] = useState<KalenderAkademikEvent[]>(() =>
    safeLoadArray<KalenderAkademikEvent>(STORAGE_KEY_KALENDER, INITIAL_KALENDER_AKADEMIK)
  );
  const [kalenderCategoryFilter, setKalenderCategoryFilter] = useState<string>('Semua');
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStart, setNewEventStart] = useState('2026-11-20');
  const [newEventEnd, setNewEventEnd] = useState('2026-11-25');
  const [newEventCategory, setNewEventCategory] =
    useState<KalenderAkademikEvent['kategori']>('Perkuliahan');

  // PDDIKTI Feeder sync log
  const [isSyncingPddikti, setIsSyncingPddikti] = useState(false);
  const [pddiktiLogs, setPddiktiLogs] = useState<PddiktiSyncAuditEntry[]>(() =>
    safeLoadArray<PddiktiSyncAuditEntry>(STORAGE_KEY_PDDIKTI_LOG, [])
  );

  const scopedStudents = useMemo(
    () =>
      scopeMode === 'prodi'
        ? mahasiswaList.filter(m => m.prodiId === selectedProdi.id)
        : mahasiswaList,
    [mahasiswaList, scopeMode, selectedProdi.id]
  );

  const scopedDosen = useMemo(
    () =>
      scopeMode === 'prodi'
        ? dosenList.filter(d => d.prodiId === selectedProdi.id)
        : dosenList,
    [dosenList, scopeMode, selectedProdi.id]
  );

  const scopedJadwal = useMemo(
    () =>
      scopeMode === 'prodi'
        ? jadwalList.filter(j => j.prodiId === selectedProdi.id)
        : jadwalList,
    [jadwalList, scopeMode, selectedProdi.id]
  );

  // Build unified 360-degree records combining SIAKAD, Keuangan, Presensi, KP/TA, Yudisium, and SKPI
  const unifiedRecords = useMemo(() => {
    return scopedStudents.map(m => {
      const tagihan = tagihanList.find(t => t.nim === m.nim);
      const krs = krsRecords.find(k => k.nim === m.nim);
      const khs = khsRecords.find(k => k.nim === m.nim);
      const kp = kpList.find(item => item.nim === m.nim);
      const sidang = sidangList.find(item => item.nim === m.nim);
      const yudisium = yudisiumList.find(item => item.nim === m.nim);
      const skpi = skpiList.find(item => item.nim === m.nim);
      const alerts = peringatanList.filter(p => p.nim === m.nim);

      const uktLunas =
        !tagihan ||
        tagihan.status === 'Lunas' ||
        tagihan.status === 'Dispensasi' ||
        tagihan.bebasKeuanganUjian ||
        tagihan.sisaTunggakan <= 0;

      const krsDisetujui =
        krs?.statusPersetujuan === 'Disetujui DPA' ||
        m.status === 'Lulus' ||
        m.sksSemesterIni > 0;

      const kehadiranMemenuhi = m.kehadiranPersen >= 75;

      const blockers: string[] = [];
      if (!uktLunas) {
        blockers.push(`Tunggakan UKT Rp ${((tagihan?.sisaTunggakan || 0) / 1000).toFixed(0)} rb`);
      }
      if (!kehadiranMemenuhi) {
        blockers.push(`Presensi ${m.kehadiranPersen}% (<75%)`);
      }
      if (m.peringatanSp > 0) {
        blockers.push(`Peringatan SP-${m.peringatanSp}`);
      }
      if (krs && krs.statusPersetujuan !== 'Disetujui DPA') {
        blockers.push(`KRS ${krs.statusPersetujuan}`);
      }

      const readinessStatus: 'Siap Penuh' | 'Perlu Tindak Lanjut' =
        blockers.length === 0 ? 'Siap Penuh' : 'Perlu Tindak Lanjut';

      const taStage = yudisium
        ? `Yudisium (${yudisium.statusVerifikasi})`
        : sidang
        ? `${sidang.tipeSidang} (${sidang.status})`
        : m.progressTA && m.progressTA !== 'Belum Mengambil'
        ? m.progressTA
        : kp
        ? `KP: ${kp.status}`
        : 'Perkuliahan Reguler';

      return {
        mahasiswa: m,
        tagihan,
        krs,
        khs,
        kp,
        sidang,
        yudisium,
        skpi,
        alerts,
        uktLunas,
        krsDisetujui,
        kehadiranMemenuhi,
        blockers,
        readinessStatus,
        taStage
      };
    });
  }, [
    scopedStudents,
    tagihanList,
    krsRecords,
    khsRecords,
    kpList,
    sidangList,
    yudisiumList,
    skpiList,
    peringatanList
  ]);

  const filteredUnified = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return unifiedRecords.filter(r => {
      if (statusFilter !== 'Semua' && r.mahasiswa.status !== statusFilter) return false;
      if (readinessFilter === 'siap' && r.readinessStatus !== 'Siap Penuh') return false;
      if (readinessFilter === 'kendala' && r.readinessStatus !== 'Perlu Tindak Lanjut') return false;
      if (!q) return true;
      return (
        r.mahasiswa.nim.toLowerCase().includes(q) ||
        r.mahasiswa.nama.toLowerCase().includes(q) ||
        r.mahasiswa.dosenPA.toLowerCase().includes(q) ||
        r.taStage.toLowerCase().includes(q)
      );
    });
  }, [unifiedRecords, searchQuery, statusFilter, readinessFilter]);

  const activeInspectorRecord = useMemo(() => {
    if (selectedStudentId) {
      const found = unifiedRecords.find(r => r.mahasiswa.id === selectedStudentId);
      if (found) return found;
    }
    return filteredUnified[0] || unifiedRecords[0] || null;
  }, [selectedStudentId, unifiedRecords, filteredUnified]);

  // Summary metrics
  const metrics = useMemo(() => {
    const totalMhs = unifiedRecords.length;
    const siapPenuh = unifiedRecords.filter(r => r.readinessStatus === 'Siap Penuh').length;
    const kendalaUkt = unifiedRecords.filter(r => !r.uktLunas).length;
    const kendalaPresensi = unifiedRecords.filter(r => !r.kehadiranMemenuhi).length;
    const krsPendingCount = unifiedRecords.filter(
      r => r.krs && r.krs.statusPersetujuan !== 'Disetujui DPA'
    ).length;
    const rataIpk =
      totalMhs > 0
        ? (unifiedRecords.reduce((s, r) => s + r.mahasiswa.ipk, 0) / totalMhs).toFixed(2)
        : '0.00';
    return {
      totalMhs,
      siapPenuh,
      kendalaUkt,
      kendalaPresensi,
      krsPendingCount,
      rataIpk
    };
  }, [unifiedRecords]);

  // PDDIKTI Feeder Readiness Audit
  const pddiktiAuditRows = useMemo(() => {
    const prodiFilter = (pid?: string) => scopeMode === 'fakultas' || pid === selectedProdi.id;
    const mhsValid = scopedStudents.filter(m => m.nim && m.nama && m.ipk >= 0).length;
    const dosenValid = scopedDosen.filter(d => d.nidn || d.nuptk).length;
    const kelasValid = scopedJadwal.filter(j => j.kodeMK && j.dosenNidn).length;
    const scopedKrs = krsRecords.filter(k => prodiFilter(k.prodiId));
    const krsApproved = scopedKrs.filter(k => k.statusPersetujuan === 'Disetujui DPA').length;
    const scopedDpna = dpnaRecords.filter(d => prodiFilter(d.prodiId));
    const dpnaLocked = scopedDpna.filter(d => d.isLocked).length;
    const scopedYudisium = yudisiumList.filter(y => prodiFilter(y.prodiId));
    const yudisiumPinValid = scopedYudisium.filter(y => Boolean(y.nomorIjazahNasional)).length;

    return [
      {
        kode: 'MHS',
        entitas: 'Profil & Status Akademik Mahasiswa',
        sumber: 'Master Mahasiswa + SIAKAD',
        total: scopedStudents.length,
        valid: mhsValid,
        catatan: 'NIM, angkatan, status aktif/cuti/lulus & dosen PA'
      },
      {
        kode: 'DSN',
        entitas: 'Penugasan Dosen Tetap & NIDN/NUPTK',
        sumber: 'Data Dosen + BKD',
        total: scopedDosen.length,
        valid: dosenValid,
        catatan: 'NIDN/NUPTK aktif dan beban SKS mengajar'
      },
      {
        kode: 'KLS',
        entitas: 'Kelas Perkuliahan & Ruang Kuliah',
        sumber: 'Jadwal & Presensi + Lab',
        total: scopedJadwal.length,
        valid: kelasValid,
        catatan: `${ruanganList.length} ruangan terdaftar, dosen pengampu terikat`
      },
      {
        kode: 'AKM',
        entitas: 'Aktivitas Kuliah Mahasiswa (KRS)',
        sumber: 'SIAKAD KRS + Keuangan UKT',
        total: scopedKrs.length,
        valid: krsApproved,
        catatan: 'KRS berstatus Disetujui DPA siap pelaporan AKM'
      },
      {
        kode: 'NLI',
        entitas: 'Nilai Perkuliahan & KHS (DPNA)',
        sumber: 'DPNA + KHS SIAKAD',
        total: scopedDpna.length,
        valid: dpnaLocked,
        catatan: 'Berita acara nilai terkunci oleh dosen pengampu'
      },
      {
        kode: 'LLSN',
        entitas: 'Lulusan, Yudisium & PIN Ijazah',
        sumber: 'Yudisium + SKPI',
        total: scopedYudisium.length,
        valid: yudisiumPinValid,
        catatan: 'SK Yudisium dan Penomoran Ijazah Nasional (PIN)'
      }
    ];
  }, [
    scopeMode,
    selectedProdi.id,
    scopedStudents,
    scopedDosen,
    scopedJadwal,
    ruanganList.length,
    krsRecords,
    dpnaRecords,
    yudisiumList
  ]);

  const handleBulkApproveEligibleKrs = () => {
    const eligibleNims = new Set(
      unifiedRecords
        .filter(r => r.uktLunas && r.krs && r.krs.statusPersetujuan !== 'Disetujui DPA')
        .map(r => r.mahasiswa.nim)
    );

    if (eligibleNims.size === 0) {
      onShowToast('Seluruh KRS mahasiswa yang telah melunasi UKT sudah berstatus Disetujui DPA.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const updated = krsRecords.map(k =>
      eligibleNims.has(k.nim)
        ? {
            ...k,
            statusPersetujuan: 'Disetujui DPA' as const,
            tanggalPersetujuan: today,
            catatanDpa: 'Disetujui otomatis melalui Rekonsiliasi Terpadu Akademik–Keuangan'
          }
        : k
    );

    setKrsRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY_KRS, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }

    logKaprodiActivity({
      category: 'SYNC_WORKSPACE',
      actionTitle: `Validasi Massal ${eligibleNims.size} KRS Terpadu`,
      detail: `Menyetujui ${eligibleNims.size} KRS mahasiswa dengan status UKT Lunas pada ${selectedProdi.singkatan}.`,
      actor: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id
    });

    onShowToast(`${eligibleNims.size} KRS mahasiswa lunas UKT berhasil disetujui dan disinkronkan.`);
  };

  const handleAddCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const newEvt: KalenderAkademikEvent = {
      id: `CAL-${Date.now()}`,
      tanggalMulai: newEventStart,
      tanggalSelesai: newEventEnd || newEventStart,
      kegiatan: newEventTitle.trim(),
      kategori: newEventCategory,
      status: 'Akan Datang'
    };
    const next = [newEvt, ...kalenderEvents];
    setKalenderEvents(next);
    try {
      localStorage.setItem(STORAGE_KEY_KALENDER, JSON.stringify(next));
    } catch {
      // ignore
    }
    setNewEventTitle('');
    setShowAddEventForm(false);
    onShowToast(`Agenda kalender akademik "${newEvt.kegiatan}" ditambahkan.`);
  };

  const handleCycleCalendarStatus = (id: string) => {
    const order: KalenderAkademikEvent['status'][] = [
      'Akan Datang',
      'Sedang Berlangsung',
      'Selesai'
    ];
    const next = kalenderEvents.map(ev => {
      if (ev.id !== id) return ev;
      const idx = order.indexOf(ev.status);
      return { ...ev, status: order[(idx + 1) % order.length] };
    });
    setKalenderEvents(next);
    try {
      localStorage.setItem(STORAGE_KEY_KALENDER, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleRunPddiktiSync = () => {
    setIsSyncingPddikti(true);
    window.setTimeout(() => {
      const totalEntitas = pddiktiAuditRows.reduce((s, r) => s + r.total, 0);
      const siapKirim = pddiktiAuditRows.reduce((s, r) => s + r.valid, 0);
      const entry: PddiktiSyncAuditEntry = {
        id: `PDDIKTI-${Date.now()}`,
        waktu: new Date().toLocaleString('id-ID'),
        prodi: scopeMode === 'prodi' ? selectedProdi.nama : 'Seluruh Fakultas Teknik',
        totalEntitas,
        siapKirim,
        catatan: `${siapKirim} dari ${totalEntitas} rekaman tervalidasi siap kirim ke Neo Feeder`
      };
      const nextLogs = [entry, ...pddiktiLogs].slice(0, 8);
      setPddiktiLogs(nextLogs);
      try {
        localStorage.setItem(STORAGE_KEY_PDDIKTI_LOG, JSON.stringify(nextLogs));
      } catch {
        // ignore
      }
      setIsSyncingPddikti(false);
      logKaprodiActivity({
        category: 'SYNC_WORKSPACE',
        actionTitle: 'Validasi Sinkronisasi PDDIKTI Feeder',
        detail: entry.catatan,
        actor: `Kaprodi ${selectedProdi.singkatan}`,
        prodiId: selectedProdi.id
      });
      onShowToast(`Validasi PDDIKTI selesai: ${siapKirim}/${totalEntitas} rekaman siap kirim.`);
    }, 350);
  };

  const handleExportPddiktiCsv = () => {
    const headers = [
      'NIM',
      'Nama Mahasiswa',
      'Program Studi',
      'Angkatan',
      'Semester',
      'Status Akademik',
      'IPK',
      'SKS Lulus',
      'SKS Semester Ini',
      'Status UKT',
      'Status KRS'
    ];
    const rows = unifiedRecords.map(r => [
      r.mahasiswa.nim,
      `"${r.mahasiswa.nama.replace(/"/g, '""')}"`,
      `"${r.mahasiswa.programStudi}"`,
      r.mahasiswa.angkatan,
      r.mahasiswa.semester,
      r.mahasiswa.status,
      r.mahasiswa.ipk.toFixed(2),
      r.mahasiswa.sksLulus,
      r.mahasiswa.sksSemesterIni,
      r.tagihan?.status || 'Lunas',
      r.krs?.statusPersetujuan || (r.krsDisetujui ? 'Disetujui DPA' : 'Belum Mengisi')
    ]);
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map(cols => cols.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PDDIKTI_AKM_${scopeMode === 'prodi' ? selectedProdi.id : 'FT_UNBARI'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Berkas CSV PDDIKTI AKM berhasil diunduh.');
  };

  const handleExportExcelTerpadu = () => {
    const wb = XLSX.utils.book_new();

    const sheetMahasiswa = unifiedRecords.map(r => ({
      NIM: r.mahasiswa.nim,
      Nama: r.mahasiswa.nama,
      Prodi: r.mahasiswa.programStudi,
      Angkatan: r.mahasiswa.angkatan,
      Semester: r.mahasiswa.semester,
      Status: r.mahasiswa.status,
      IPK: r.mahasiswa.ipk,
      SKS_Lulus: r.mahasiswa.sksLulus,
      Presensi_Persen: r.mahasiswa.kehadiranPersen,
      Status_UKT: r.tagihan?.status || 'Lunas',
      Status_KRS: r.krs?.statusPersetujuan || (r.krsDisetujui ? 'Disetujui DPA' : 'Belum'),
      Tahap_TA_KP: r.taStage,
      Kesiapan: r.readinessStatus
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(sheetMahasiswa),
      '1_Mahasiswa_Terpadu'
    );

    const sheetRekonsiliasi = unifiedRecords.map(r => ({
      NIM: r.mahasiswa.nim,
      Nama: r.mahasiswa.nama,
      Tagihan_UKT: r.tagihan?.nominalTagihan || 0,
      Terbayar: r.tagihan?.nominalTerbayar || 0,
      Tunggakan: r.tagihan?.sisaTunggakan || 0,
      Status_KRS: r.krs?.statusPersetujuan || 'Belum Mengisi',
      Kehadiran_Persen: r.mahasiswa.kehadiranPersen,
      Kendala_Terdeteksi: r.blockers.length > 0 ? r.blockers.join('; ') : 'Tidak ada'
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(sheetRekonsiliasi),
      '2_Rekonsiliasi_UKT_KRS'
    );

    const sheetKalender = kalenderEvents.map(k => ({
      Tanggal_Mulai: k.tanggalMulai,
      Tanggal_Selesai: k.tanggalSelesai,
      Kegiatan: k.kegiatan,
      Kategori: k.kategori,
      Status: k.status
    }));
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(sheetKalender),
      '3_Kalender_Akademik'
    );

    const sheetPddikti = pddiktiAuditRows.map(p => ({
      Kode: p.kode,
      Entitas: p.entitas,
      Sumber_Modul: p.sumber,
      Total_Rekaman: p.total,
      Siap_Kirim: p.valid,
      Persentase_Siap: p.total > 0 ? `${Math.round((p.valid / p.total) * 100)}%` : '100%',
      Catatan: p.catatan
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetPddikti), '4_Audit_PDDIKTI');

    const fileName = `Buku_Induk_Terpadu_Akademik_${
      scopeMode === 'prodi' ? selectedProdi.singkatan.replace(/\s+/g, '_') : 'FT_UNBARI'
    }.xlsx`;
    XLSX.writeFile(wb, fileName);

    logKaprodiActivity({
      category: 'EXPORT_DOKUMEN',
      actionTitle: 'Ekspor Buku Induk Terpadu Akademik (.xlsx)',
      detail: `Mengunduh rekapitulasi terintegrasi 4 lembar kerja (${unifiedRecords.length} mahasiswa).`,
      actor: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id
    });
    onShowToast(`Buku Induk Terpadu Akademik (${fileName}) berhasil diunduh.`);
  };

  const filteredKalender = useMemo(() => {
    if (kalenderCategoryFilter === 'Semua') return kalenderEvents;
    return kalenderEvents.filter(e => e.kategori === kalenderCategoryFilter);
  }, [kalenderEvents, kalenderCategoryFilter]);

  return (
    <div className="space-y-6">
      {/* Top Command Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-emerald-800">
              Fakultas Teknik Universitas Batanghari · Pusat Integrasi Data Akademik
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight text-balance">
              Sistem Informasi Terpadu Akademik ({scopeMode === 'prodi' ? selectedProdi.nama : 'Seluruh Fakultas Teknik'})
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Penyatuan data lintas modul secara langsung: Registrasi UKT, KRS &amp; Dosen PA, Presensi Kuliah, KHS/IPK, Tugas Akhir, Yudisium/SKPI, serta kesiapan pelaporan PDDIKTI Feeder.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setScopeMode('prodi')}
                className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  scopeMode === 'prodi'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Prodi {selectedProdi.singkatan}
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('fakultas')}
                className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  scopeMode === 'fakultas'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Seluruh Fakultas
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportExcelTerpadu}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Ekspor Buku Induk (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-5 pt-5 border-t border-slate-100">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Total Mahasiswa</div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {metrics.totalMhs}
            </div>
            <div className="text-[11px] text-slate-500">Terdaftar di SIAKAD</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Kesiapan Akademik Penuh</div>
            <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
              {metrics.siapPenuh} / {metrics.totalMhs}
            </div>
            <div className="text-[11px] text-slate-500">Tanpa kendala UKT/SP</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Rata-rata IPK</div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {metrics.rataIpk}
            </div>
            <div className="text-[11px] text-slate-500">Skala 4.00 kumulatif</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Tunggakan UKT</div>
            <div
              className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                metrics.kendalaUkt > 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {metrics.kendalaUkt}
            </div>
            <div className="text-[11px] text-slate-500">Menghambat validasi ujian</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Presensi &lt; 75%</div>
            <div
              className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                metrics.kendalaPresensi > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              {metrics.kendalaPresensi}
            </div>
            <div className="text-[11px] text-slate-500">Butuh pembinaan DPA</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Kelas &amp; Log Presensi</div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {scopedJadwal.length} / {logPresensiList.length}
            </div>
            <div className="text-[11px] text-slate-500">Jadwal aktif · Berita acara</div>
          </div>
        </div>
      </section>

      {/* Sub-module Navigation Bar */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setSubTab('integrasi_360')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            subTab === 'integrasi_360'
              ? 'bg-[#065f46] text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span>Buku Induk 360° Mahasiswa</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('rekonsiliasi')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            subTab === 'rekonsiliasi'
              ? 'bg-[#065f46] text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 shrink-0" />
          <span>Rekonsiliasi UKT · KRS · Ujian</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('kalender')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            subTab === 'kalender'
              ? 'bg-[#065f46] text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Kalender &amp; Siklus Semester</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('pddikti')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
            subTab === 'pddikti'
              ? 'bg-[#065f46] text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <DatabaseZap className="w-3.5 h-3.5 shrink-0" />
          <span>Pelaporan PDDIKTI Feeder</span>
        </button>
      </div>

      {/* SUB-TAB 1: BUKU INDUK 360 MAHASISWA */}
      {subTab === 'integrasi_360' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left: Unified Student Academic Table */}
          <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari NIM, nama mahasiswa, atau dosen PA..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="inline-flex items-center gap-1.5 text-slate-600">
                  <Filter className="w-3.5 h-3.5" />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-xs"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Berisiko">Berisiko</option>
                    <option value="Tugas Akhir">Tugas Akhir</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>

                <select
                  value={readinessFilter}
                  onChange={e => setReadinessFilter(e.target.value as 'all' | 'siap' | 'kendala')}
                  className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-xs"
                >
                  <option value="all">Semua Kesiapan</option>
                  <option value="siap">Siap Penuh</option>
                  <option value="kendala">Perlu Tindak Lanjut</option>
                </select>
              </div>
            </div>

            {filteredUnified.length === 0 ? (
              <div className="p-10 text-center space-y-2 text-xs text-slate-500">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-semibold text-slate-700">
                  Tidak ada data mahasiswa yang cocok dengan filter aktif
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('Semua');
                    setReadinessFilter('all');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <th className="py-2.5 px-4 font-semibold">Mahasiswa &amp; NIM</th>
                      <th className="py-2.5 px-3 font-semibold text-right font-mono">Sem · IPK</th>
                      <th className="py-2.5 px-3 font-semibold text-right font-mono">SKS · Hadir</th>
                      <th className="py-2.5 px-3 font-semibold">UKT &amp; KRS</th>
                      <th className="py-2.5 px-3 font-semibold">Tahap Studi</th>
                      <th className="py-2.5 px-4 font-semibold">Kesiapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUnified.slice(0, 30).map(row => {
                      const isSelected = activeInspectorRecord?.mahasiswa.id === row.mahasiswa.id;
                      return (
                        <tr
                          key={row.mahasiswa.id}
                          onClick={() => setSelectedStudentId(row.mahasiswa.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#ecfdf5]/80' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-900">{row.mahasiswa.nama}</div>
                            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                              {row.mahasiswa.nim} · {row.mahasiswa.programStudi}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            <div className="font-semibold text-slate-900">
                              {row.mahasiswa.ipk.toFixed(2)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Sem {row.mahasiswa.semester}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            <div className="text-slate-800">
                              {row.mahasiswa.sksLulus}/{row.mahasiswa.sksTargetLulus}
                            </div>
                            <div
                              className={`text-[11px] ${
                                row.kehadiranMemenuhi ? 'text-slate-500' : 'text-rose-700 font-semibold'
                              }`}
                            >
                              {row.mahasiswa.kehadiranPersen}% hadir
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-[11px]">
                            <div
                              className={
                                row.uktLunas ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'
                              }
                            >
                              {row.tagihan?.status || 'Lunas'}
                            </div>
                            <div className="text-slate-500">
                              {row.krs?.statusPersetujuan || (row.krsDisetujui ? 'KRS Disetujui' : 'Draft KRS')}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-700 max-w-[160px] truncate">
                            {row.taStage}
                          </td>
                          <td className="py-2.5 px-4">
                            {row.readinessStatus === 'Siap Penuh' ? (
                              <span className="text-[11px] font-semibold text-emerald-700">
                                Siap Penuh
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-amber-700">
                                {row.blockers[0] || 'Perlu Tinjauan'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: 6-Stage Integrated Student Pipeline Inspector */}
          <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            {activeInspectorRecord ? (
              <>
                <div className="pb-3 border-b border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Alur Terintegrasi Mahasiswa · {activeInspectorRecord.mahasiswa.programStudi}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    {activeInspectorRecord.mahasiswa.nama}
                  </h2>
                  <div className="text-xs text-slate-600 font-mono tabular-nums mt-0.5">
                    NIM {activeInspectorRecord.mahasiswa.nim} · Angkatan{' '}
                    {activeInspectorRecord.mahasiswa.angkatan} · DPA{' '}
                    {activeInspectorRecord.mahasiswa.dosenPA}
                  </div>
                </div>

                {/* 6 Stages */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-800">1. Keuangan &amp; Her-Registrasi</div>
                      <div className="text-[11px] text-slate-500">
                        {activeInspectorRecord.tagihan
                          ? `Status: ${activeInspectorRecord.tagihan.status} · Tunggakan Rp ${activeInspectorRecord.tagihan.sisaTunggakan.toLocaleString('id-ID')}`
                          : 'Terdaftar aktif tanpa tunggakan UKT'}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold shrink-0 ${
                        activeInspectorRecord.uktLunas ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {activeInspectorRecord.uktLunas ? 'Terpenuhi' : 'Tertunda'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-800">2. Kontrak KRS &amp; Dosen PA</div>
                      <div className="text-[11px] text-slate-500">
                        {activeInspectorRecord.krs
                          ? `${activeInspectorRecord.krs.totalSks}/${activeInspectorRecord.krs.maxSksBeban} SKS · ${activeInspectorRecord.krs.statusPersetujuan}`
                          : `Beban semester ini ${activeInspectorRecord.mahasiswa.sksSemesterIni} SKS`}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold shrink-0 ${
                        activeInspectorRecord.krsDisetujui ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {activeInspectorRecord.krsDisetujui ? 'Disetujui' : 'Perlu Validasi'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-800">3. Kehadiran Kuliah &amp; Presensi</div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        Kehadiran {activeInspectorRecord.mahasiswa.kehadiranPersen}% · SP-
                        {activeInspectorRecord.mahasiswa.peringatanSp}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold shrink-0 ${
                        activeInspectorRecord.kehadiranMemenuhi ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {activeInspectorRecord.kehadiranMemenuhi ? 'Layak UAS' : 'Di Bawah 75%'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-800">4. Capaian Nilai (KHS &amp; IPK)</div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        IPK {activeInspectorRecord.mahasiswa.ipk.toFixed(2)} · Lulus{' '}
                        {activeInspectorRecord.mahasiswa.sksLulus}/
                        {activeInspectorRecord.mahasiswa.sksTargetLulus} SKS
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 shrink-0">
                      {activeInspectorRecord.khs ? 'KHS Tersedia' : 'Sinkron SIAKAD'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="font-semibold text-slate-800">5. Kerja Praktek &amp; Tugas Akhir</div>
                      <div className="text-[11px] text-slate-500">
                        {activeInspectorRecord.sidang?.judulTA ||
                          activeInspectorRecord.mahasiswa.judulTA ||
                          activeInspectorRecord.taStage}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 shrink-0">
                      {activeInspectorRecord.sidang?.status || activeInspectorRecord.kp?.status || '—'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-800">6. Yudisium, Ijazah &amp; SKPI</div>
                      <div className="text-[11px] text-slate-500">
                        {activeInspectorRecord.yudisium
                          ? `PIN ${activeInspectorRecord.yudisium.nomorIjazahNasional} · ${activeInspectorRecord.yudisium.predikat}`
                          : activeInspectorRecord.skpi
                          ? `SKPI ${activeInspectorRecord.skpi.nomorSkpi}`
                          : 'Belum masuk tahap yudisium'}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 shrink-0">
                      {activeInspectorRecord.yudisium?.statusVerifikasi ||
                        activeInspectorRecord.skpi?.status ||
                        'Aktif Studi'}
                    </span>
                  </div>
                </div>

                {/* Quick Cross-Module Navigation Actions */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('siakad')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer"
                  >
                    <BookOpenCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Buka SIAKAD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('keuangan')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Cek UKT / SPP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('sidang_kp')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                    <span>KP &amp; Tugas Akhir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('yudisium_wisuda')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Yudisium &amp; SKPI</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-xs text-slate-500">
                Pilih satu mahasiswa pada tabel untuk meninjau alur terintegrasinya.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: REKONSILIASI UKT - KRS - PRESENSI */}
      {subTab === 'rekonsiliasi' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Rekonsiliasi Terpadu Akademik–Keuangan &amp; Kelayakan Ujian
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Validasi silang antara pelunasan UKT/SPP, persetujuan KRS oleh Dosen PA, dan batas minimal kehadiran kuliah 75%.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBulkApproveEligibleKrs}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Validasi KRS Lunas UKT ({metrics.krsPendingCount} Menunggu)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-4 font-semibold">Mahasiswa</th>
                  <th className="py-2.5 px-3 font-semibold text-right font-mono">Tunggakan UKT</th>
                  <th className="py-2.5 px-3 font-semibold">Status Pembayaran</th>
                  <th className="py-2.5 px-3 font-semibold">Status KRS</th>
                  <th className="py-2.5 px-3 font-semibold text-right font-mono">Kehadiran</th>
                  <th className="py-2.5 px-4 font-semibold">Keputusan Kelayakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unifiedRecords.slice(0, 35).map(r => (
                  <tr key={r.mahasiswa.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{r.mahasiswa.nama}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {r.mahasiswa.nim} · Sem {r.mahasiswa.semester}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      Rp {(r.tagihan?.sisaTunggakan || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          r.uktLunas ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {r.tagihan?.status || 'Lunas'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-700">
                        {r.krs?.statusPersetujuan || (r.krsDisetujui ? 'Disetujui DPA' : 'Draft')}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono tabular-nums font-semibold ${
                        r.kehadiranMemenuhi ? 'text-slate-800' : 'text-rose-700'
                      }`}
                    >
                      {r.mahasiswa.kehadiranPersen}%
                    </td>
                    <td className="py-2.5 px-4">
                      {r.blockers.length === 0 ? (
                        <span className="text-emerald-700 font-semibold">
                          Layak Kuliah &amp; Ujian
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">
                          {r.blockers.join(' · ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: KALENDER & SIKLUS SEMESTER TERPADU */}
      {subTab === 'kalender' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DAFTAR_PERIODE_SEMESTER.map(per => (
              <div key={per.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-emerald-800">{per.tahunAkademik}</span>
                  <span className={per.isAktif ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                    {per.isAktif ? 'Periode Aktif' : 'Terjadwal'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{per.nama}</h3>
                <div className="text-[11px] text-slate-600 font-mono">
                  {per.periodeBulan} · Maks. {per.maxSksDefault} SKS
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">{per.deskripsi}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {['Semua', 'Registrasi & KRS', 'Perkuliahan', 'Ujian (UTS/UAS)', 'Wisuda & Libur'].map(
                  cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setKalenderCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap cursor-pointer ${
                        kalenderCategoryFilter === cat
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowAddEventForm(prev => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Agenda Akademik</span>
              </button>
            </div>

            {showAddEventForm && (
              <form
                onSubmit={handleAddCalendarEvent}
                className="p-4 bg-[#fafaf5] border-b border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs"
              >
                <div className="sm:col-span-5">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kegiatan</label>
                  <input
                    type="text"
                    required
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    placeholder="cth: Batas Akhir Unggah Nilai DPNA Dosen"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newEventCategory}
                    onChange={e =>
                      setNewEventCategory(e.target.value as KalenderAkademikEvent['kategori'])
                    }
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Registrasi & KRS">Registrasi &amp; KRS</option>
                    <option value="Perkuliahan">Perkuliahan</option>
                    <option value="Ujian (UTS/UAS)">Ujian (UTS/UAS)</option>
                    <option value="Nilai & KHS">Nilai &amp; KHS</option>
                    <option value="Wisuda & Libur">Wisuda &amp; Libur</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Mulai</label>
                  <input
                    type="date"
                    value={newEventStart}
                    onChange={e => setNewEventStart(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Selesai</label>
                  <input
                    type="date"
                    value={newEventEnd}
                    onChange={e => setNewEventEnd(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 rounded-lg bg-[#065f46] text-white font-semibold cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-4 font-semibold font-mono">Rentang Tanggal</th>
                    <th className="py-2.5 px-3 font-semibold">Kegiatan Akademik</th>
                    <th className="py-2.5 px-3 font-semibold">Kategori</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status (Klik Ubah)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKalender.map(ev => (
                    <tr key={ev.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {ev.tanggalMulai} s.d. {ev.tanggalSelesai}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{ev.kegiatan}</td>
                      <td className="py-2.5 px-3 text-slate-600">{ev.kategori}</td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleCycleCalendarStatus(ev.id)}
                          className={`text-xs font-semibold cursor-pointer hover:underline ${
                            ev.status === 'Selesai'
                              ? 'text-emerald-700'
                              : ev.status === 'Sedang Berlangsung'
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {ev.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PELAPORAN PDDIKTI FEEDER */}
      {subTab === 'pddikti' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Audit Kesiapan &amp; Sinkronisasi PDDIKTI Neo Feeder
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pemetaan kelengkapan data mahasiswa, dosen, kelas kuliah, AKM/KRS, nilai DPNA, dan PIN lulusan sebelum pelaporan resmi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportPddiktiCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh CSV PDDIKTI</span>
                </button>
                <button
                  type="button"
                  onClick={handleRunPddiktiSync}
                  disabled={isSyncingPddikti}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white text-xs font-semibold whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPddikti ? 'animate-spin' : ''}`} />
                  <span>
                    {isSyncingPddikti ? 'Memvalidasi...' : 'Validasi & Sinkronisasi Feeder'}
                  </span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-4 font-semibold font-mono">Kode</th>
                    <th className="py-2.5 px-3 font-semibold">Entitas Pelaporan PDDIKTI</th>
                    <th className="py-2.5 px-3 font-semibold">Sumber Data Portal</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-mono">Valid / Total</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-mono">Kesiapan</th>
                    <th className="py-2.5 px-4 font-semibold">Keterangan Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pddiktiAuditRows.map(row => {
                    const pct = row.total > 0 ? Math.round((row.valid / row.total) * 100) : 100;
                    return (
                      <tr key={row.kode} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{row.kode}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{row.entitas}</td>
                        <td className="py-3 px-3 text-slate-600">{row.sumber}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900">
                          {row.valid} / {row.total}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-mono tabular-nums font-bold ${
                            pct === 100
                              ? 'text-emerald-700'
                              : pct >= 70
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {pct}%
                        </td>
                        <td className="py-3 px-4 text-slate-600">{row.catatan}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {pddiktiLogs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat Validasi &amp; Ekspor Neo Feeder
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigateTab('siakad')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                >
                  <span>Kelola DPNA &amp; KRS di SIAKAD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {pddiktiLogs.map(log => (
                  <div
                    key={log.id}
                    className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                  >
                    <div className="font-medium text-slate-800">
                      {log.prodi} · {log.catatan}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {log.waktu}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
