import React from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { MahasiswaView } from './components/MahasiswaView';
import { JadwalDosenView } from './components/JadwalDosenView';
import { KerjaPraktekDanTaView } from './components/KerjaPraktekDanTaView';
import { LaboratoriumView } from './components/LaboratoriumView';
import { BkdDosenView } from './components/BkdDosenView';
import { DataDosenView } from './components/DataDosenView';
import { ExportModal } from './components/ExportModal';
import { BackupRestoreModal, BackupDataPayload } from './components/BackupRestoreModal';
import { YudisiumWisudaView } from './components/YudisiumWisudaView';
import { TataUsahaView } from './components/TataUsahaView';
import { KeuanganView } from './components/KeuanganView';
import { SkpiView } from './components/SkpiView';
import { AkreditasiView } from './components/AkreditasiView';
import { KerjasamaView } from './components/KerjasamaView';
import { GoogleWorkspaceView } from './components/GoogleWorkspaceView';
import { LmsView } from './components/LmsView';
import { SiakadView } from './components/SiakadView';
import { VerifikasiDokumenModal } from './components/VerifikasiDokumenModal';
import { MahasiswaKritisAuditModal } from './components/MahasiswaKritisAuditModal';
import { AuditKehadiranMendadakModal } from './components/AuditKehadiranMendadakModal';
import { 
  PRODI_LIST, 
  INITIAL_DOSEN, 
  INITIAL_MAHASISWA, 
  INITIAL_JADWAL, 
  INITIAL_RUANGAN, 
  INITIAL_PERINGATAN,
  INITIAL_JADWAL_SIDANG_TA,
  INITIAL_JADWAL_KP
} from './data/mockData';
import { INITIAL_YUDISIUM_RECORDS, INITIAL_PERIODE_YUDISIUM } from './data/mockYudisiumData';
import { 
  INITIAL_SURAT_TU, 
  INITIAL_AGENDA_TU, 
  INITIAL_SARPRAS_TU 
} from './data/mockTataUsahaData';
import { 
  INITIAL_TAGIHAN_UKT, 
  INITIAL_HONOR_DOSEN, 
  INITIAL_ANGGARAN_PRODI_LAB,
  KOMPONEN_UANG_KULIAH_RESMI
} from './data/mockKeuanganData';
import { INITIAL_SKPI_RECORDS } from './data/mockSkpiData';
import { INITIAL_AUDIT_SIDAK } from './data/mockAuditSidakData';
import { INITIAL_LOG_PRESENSI_DOSEN } from './data/mockPresensiDosenData';
import { INITIAL_KERJASAMA } from './data/mockKerjasamaData';
import { 
  Mahasiswa, 
  StatusMahasiswa,
  Dosen, 
  JadwalKuliah, 
  RuanganLab, 
  PeringatanAkademik, 
  ProgramStudiInfo, 
  StatusKehadiranDosen,
  JadwalSidangTA,
  JadwalKerjaPraktek,
  YudisiumRecord,
  PeriodeYudisium,
  SuratPermohonanTU,
  SuratAgendaTU,
  PeminjamanSarprasTU,
  TagihanUktMahasiswa,
  HonorariumDosenRecord,
  AnggaranProdiLab,
  SkpiRecord,
  AuditSidakKehadiran,
  LogPresensiDosen,
  DokumenKerjasama,
  AuthUser,
  KetersediaanJadwalDosen
} from './types/index';
import { CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { getHariIniIndonesia, isJadwalSedangBerlangsung } from './utils/timeHelper';
import { LoginView } from './components/LoginView';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { mapFirebaseUserToAuthUser } from './data/authUsersData';
import { INITIAL_KETERSEDIAAN_JADWAL } from './data/mockKetersediaanJadwalData';

function safeParseStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = React.useState<string>('dashboard');
  const [akreditasiTargetSubTab, setAkreditasiTargetSubTab] = React.useState<string | null>(null);

  const handleNavigateTab = React.useCallback((tab: string) => {
    if (tab.includes(':')) {
      const [mainTab, subTab] = tab.split(':');
      if (mainTab === 'akreditasi' && subTab) {
        setAkreditasiTargetSubTab(subTab);
        setCurrentTab('akreditasi');
        return;
      }
    }
    setCurrentTab(tab);
  }, []);
  
  // Department State - Defaults to S1 Teknik Sipil
  const [selectedProdi, setSelectedProdi] = React.useState<ProgramStudiInfo>(() => {
    const savedId = localStorage.getItem('sikaprodi_v13_selected_id');
    const found = PRODI_LIST.find(p => p.id === savedId);
    return found || PRODI_LIST[0];
  });

  // Persisted Datasets (using v13 keys)
  const [mahasiswaList, setMahasiswaList] = React.useState<Mahasiswa[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v13_mahasiswa');
    if (saved) {
      try {
        const parsed: Mahasiswa[] = JSON.parse(saved);
        const existingNims = new Set(parsed.map(m => m.nim));
        const missing = INITIAL_MAHASISWA.filter(m => !existingNims.has(m.nim));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem('sikaprodi_v13_mahasiswa', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch (e) {
        return INITIAL_MAHASISWA;
      }
    }
    return INITIAL_MAHASISWA;
  });

  const [dosenList, setDosenList] = React.useState<Dosen[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v15_dosen') || localStorage.getItem('sikaprodi_v14_dosen') || localStorage.getItem('sikaprodi_v13_dosen');
    if (saved) {
      try {
        const parsed: Dosen[] = JSON.parse(saved);
        // Ensure all lecturers from INITIAL_DOSEN exist
        const missing = INITIAL_DOSEN.filter(d => !parsed.some(p => p.nidn === d.nidn || p.id === d.id));
        const merged = [...parsed, ...missing];
        const updated = merged.map(d => {
          let next = d;
          if (next.namaLengkap.includes('Fadli Eka Yandra') && next.nidn !== '1004077102') {
            next = { ...next, nidn: '1004077102' };
          }
          if (next.fotoUrl && next.fotoUrl.startsWith('/src/assets/images/')) {
            next = { ...next, fotoUrl: next.fotoUrl.replace('/src/assets/images/', '/assets/images/') };
          }
          return next;
        });
        localStorage.setItem('sikaprodi_v15_dosen', JSON.stringify(updated));
        return updated;
      } catch (e) {
        return INITIAL_DOSEN;
      }
    }
    return INITIAL_DOSEN;
  });

  const [jadwalList, setJadwalList] = React.useState<JadwalKuliah[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v15_jadwal');
    if (saved) {
      try {
        const parsed: JadwalKuliah[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(j => j.kodeMK === 'UBF42101') && parsed.some(j => j.kodeMK === 'MBF43101')) {
          const existingIds = new Set(parsed.map(j => j.id));
          const missing = INITIAL_JADWAL.filter(j => !existingIds.has(j.id));
          return missing.length > 0 ? [...parsed, ...missing] : parsed;
        }
      } catch (e) {
        // fallback to INITIAL_JADWAL
      }
    }
    localStorage.setItem('sikaprodi_v15_jadwal', JSON.stringify(INITIAL_JADWAL));
    return INITIAL_JADWAL;
  });

  const [ruanganList, setRuanganList] = React.useState<RuanganLab[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v15_ruangan');
    if (saved) {
      try {
        const parsed: RuanganLab[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(r => r.id === 'FT02') && parsed.some(r => r.id === 'LAB-LIST')) {
          return parsed;
        }
      } catch (e) {}
    }
    localStorage.setItem('sikaprodi_v15_ruangan', JSON.stringify(INITIAL_RUANGAN));
    return INITIAL_RUANGAN;
  });

  const [peringatanList, setPeringatanList] = React.useState<PeringatanAkademik[]>(() =>
    safeParseStorage('sikaprodi_v13_peringatan', INITIAL_PERINGATAN)
  );

  const [sidangList, setSidangList] = React.useState<JadwalSidangTA[]>(() =>
    safeParseStorage('sikaprodi_v13_sidang', INITIAL_JADWAL_SIDANG_TA)
  );

  const [kpList, setKpList] = React.useState<JadwalKerjaPraktek[]>(() =>
    safeParseStorage('sikaprodi_v13_kp', INITIAL_JADWAL_KP)
  );

  const [yudisiumList, setYudisiumList] = React.useState<YudisiumRecord[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v13_yudisium');
    if (saved) {
      try {
        const parsed: YudisiumRecord[] = JSON.parse(saved);
        const existingNims = new Set(parsed.map(y => y.nim));
        const missing = INITIAL_YUDISIUM_RECORDS.filter(y => !existingNims.has(y.nim));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem('sikaprodi_v13_yudisium', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch (e) {
        return INITIAL_YUDISIUM_RECORDS;
      }
    }
    return INITIAL_YUDISIUM_RECORDS;
  });

  const [periodeList, setPeriodeList] = React.useState<PeriodeYudisium[]>(() =>
    safeParseStorage('sikaprodi_v13_periode', INITIAL_PERIODE_YUDISIUM)
  );

  // Tata Usaha Datasets
  const [tuSuratList, setTuSuratList] = React.useState<SuratPermohonanTU[]>(() =>
    safeParseStorage('sikaprodi_v13_tu_surat', INITIAL_SURAT_TU)
  );

  const [tuAgendaList, setTuAgendaList] = React.useState<SuratAgendaTU[]>(() =>
    safeParseStorage('sikaprodi_v13_tu_agenda', INITIAL_AGENDA_TU)
  );

  const [tuSarprasList, setTuSarprasList] = React.useState<PeminjamanSarprasTU[]>(() =>
    safeParseStorage('sikaprodi_v13_tu_sarpras', INITIAL_SARPRAS_TU)
  );

  // Modul Keuangan Datasets
  const [tagihanList, setTagihanList] = React.useState<TagihanUktMahasiswa[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v13_tagihan');
    if (saved) {
      try {
        const parsed: TagihanUktMahasiswa[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(t => t.id));
        const merged = [
          ...parsed.map(t => ({
            ...t,
            rincianKomponen: t.rincianKomponen || KOMPONEN_UANG_KULIAH_RESMI
          })),
          ...INITIAL_TAGIHAN_UKT.filter(t => !existingIds.has(t.id))
        ];
        return merged;
      } catch (e) {
        return INITIAL_TAGIHAN_UKT;
      }
    }
    return INITIAL_TAGIHAN_UKT;
  });

  const [honorList, setHonorList] = React.useState<HonorariumDosenRecord[]>(() =>
    safeParseStorage('sikaprodi_v13_honor', INITIAL_HONOR_DOSEN)
  );

  const [anggaranList, setAnggaranList] = React.useState<AnggaranProdiLab[]>(INITIAL_ANGGARAN_PRODI_LAB);

  // Modul SKPI Datasets
  const [skpiList, setSkpiList] = React.useState<SkpiRecord[]>(() =>
    safeParseStorage('sikaprodi_v13_skpi', INITIAL_SKPI_RECORDS)
  );

  // Modul Audit Sidak Kehadiran Mendadak Datasets
  const [auditSidakList, setAuditSidakList] = React.useState<AuditSidakKehadiran[]>(() =>
    safeParseStorage('sikaprodi_v13_audit_sidak', INITIAL_AUDIT_SIDAK)
  );

  // Modul Logging Presensi & Durasi Kehadiran Mingguan Dosen
  const [logPresensiList, setLogPresensiList] = React.useState<LogPresensiDosen[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v13_log_presensi');
    if (saved) {
      try {
        const parsed: LogPresensiDosen[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(l => l.id));
          const missing = INITIAL_LOG_PRESENSI_DOSEN.filter(l => !existingIds.has(l.id));
          return missing.length > 0 ? [...parsed, ...missing] : parsed;
        }
      } catch (e) {
        return INITIAL_LOG_PRESENSI_DOSEN;
      }
    }
    return INITIAL_LOG_PRESENSI_DOSEN;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('sikaprodi_v13_log_presensi', JSON.stringify(logPresensiList));
    } catch (e) {
      console.error('Failed to save logPresensiList to localStorage:', e);
    }
  }, [logPresensiList]);

  // Modul Manajemen Kerjasama & Kemitraan (MoU, MoA, IA) Datasets
  const [kerjasamaList, setKerjasamaList] = React.useState<DokumenKerjasama[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v13_kerjasama');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return INITIAL_KERJASAMA;
      }
    }
    return INITIAL_KERJASAMA;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('sikaprodi_v13_kerjasama', JSON.stringify(kerjasamaList));
    } catch (e) {
      console.error('Failed to save kerjasamaList to localStorage:', e);
    }
  }, [kerjasamaList]);

  // Ketersediaan Jadwal Dosen (Tabel Kesesuaian Jadwal Pembahas/Penguji Seminar KP & TA)
  const [ketersediaanJadwalList, setKetersediaanJadwalList] = React.useState<KetersediaanJadwalDosen[]>(() => {
    const saved = localStorage.getItem('sikaprodi_v14_ketersediaan_jadwal');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_KETERSEDIAAN_JADWAL;
      }
    }
    return INITIAL_KETERSEDIAAN_JADWAL;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('sikaprodi_v14_ketersediaan_jadwal', JSON.stringify(ketersediaanJadwalList));
    } catch (e) {
      console.error('Failed to save ketersediaanJadwalList to localStorage:', e);
    }
  }, [ketersediaanJadwalList]);

  const handleUpdateKetersediaanJadwal = (updated: KetersediaanJadwalDosen) => {
    setKetersediaanJadwalList(prev => prev.map(k => k.id === updated.id ? updated : k));
  };

  // Selected Student for Detail Modal
  const [selectedMahasiswa, setSelectedMahasiswa] = React.useState<Mahasiswa | null>(null);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);

  // Backup & Restore Modal State
  const [isBackupModalOpen, setIsBackupModalOpen] = React.useState(false);

  // Verifikasi Dokumen Modal State
  const [isVerifikasiModalOpen, setIsVerifikasiModalOpen] = React.useState(false);

  // Early Warning System (EWS) Mahasiswa Kritis Audit Modal State
  const [isEwsAuditModalOpen, setIsEwsAuditModalOpen] = React.useState(false);

  // Audit Kehadiran Mendadak (Sidak Kelas) Modal State
  const [isAuditSidakModalOpen, setIsAuditSidakModalOpen] = React.useState(false);
  const [selectedJadwalForAudit, setSelectedJadwalForAudit] = React.useState<string | null>(null);

  const handleRestoreData = (restoredData: BackupDataPayload['data']) => {
    if (restoredData.mahasiswaList) setMahasiswaList(restoredData.mahasiswaList);
    if (restoredData.dosenList) setDosenList(restoredData.dosenList);
    if (restoredData.jadwalList) setJadwalList(restoredData.jadwalList);
    if (restoredData.ruanganList) setRuanganList(restoredData.ruanganList);
    if (restoredData.peringatanList) setPeringatanList(restoredData.peringatanList);
    if (restoredData.sidangList) setSidangList(restoredData.sidangList);
    if (restoredData.kpList) setKpList(restoredData.kpList);
    if (restoredData.yudisiumList) setYudisiumList(restoredData.yudisiumList);
    if (restoredData.tuSuratList) setTuSuratList(restoredData.tuSuratList);
    if (restoredData.tuAgendaList) setTuAgendaList(restoredData.tuAgendaList);
    if (restoredData.tuSarprasList) setTuSarprasList(restoredData.tuSarprasList);
    if ((restoredData as any).kerjasamaList) setKerjasamaList((restoredData as any).kerjasamaList);
    if ((restoredData as any).tagihanList) setTagihanList((restoredData as any).tagihanList);
    if ((restoredData as any).ketersediaanJadwalList) setKetersediaanJadwalList((restoredData as any).ketersediaanJadwalList);
  };

  // In-App Confirm Dialog State (replaces window.confirm for iframe sandbox compatibility)
  const [confirmDialog, setConfirmDialog] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  // Toast notification state
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // User Authentication State
  const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('sikaprodi_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AuthUser;
        if (parsed && parsed.photoURL && parsed.photoURL.startsWith('/src/assets/images/')) {
          parsed.photoURL = parsed.photoURL.replace('/src/assets/images/', '/assets/images/');
          localStorage.setItem('sikaprodi_auth_user', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Listen to Firebase Auth state
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const mapped = mapFirebaseUserToAuthUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL
        });
        setCurrentUser(mapped);
        localStorage.setItem('sikaprodi_auth_user', JSON.stringify(mapped));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('sikaprodi_auth_user');
    setCurrentUser(null);
    showToast('Anda telah keluar dari sistem SIKAPRODI FT UNBARI.');
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.prodiId && user.prodiId !== 'SEMUA_FT') {
      const matchProdi = PRODI_LIST.find(p => p.id === user.prodiId);
      if (matchProdi) {
        setSelectedProdi(matchProdi);
      }
    }
  };

  // Global Keyboard Shortcuts for Web Version
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedMahasiswa) setSelectedMahasiswa(null);
        if (confirmDialog) setConfirmDialog(null);
        if (isExportModalOpen) setIsExportModalOpen(false);
        if (isBackupModalOpen) setIsBackupModalOpen(false);
        if (isVerifikasiModalOpen) setIsVerifikasiModalOpen(false);
        if (isEwsAuditModalOpen) setIsEwsAuditModalOpen(false);
        if (isAuditSidakModalOpen) setIsAuditSidakModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedMahasiswa, 
    confirmDialog, 
    isExportModalOpen, 
    isBackupModalOpen, 
    isVerifikasiModalOpen, 
    isEwsAuditModalOpen, 
    isAuditSidakModalOpen
  ]);

  // Real-Time & Simulation Clock
  const [isSimulated, setIsSimulated] = React.useState(false);
  const [simulatedDay, setSimulatedDay] = React.useState<string>('Senin');
  const [simulatedTime, setSimulatedTime] = React.useState<string>('09:15');

  const [liveDay, setLiveDay] = React.useState<string>(getHariIniIndonesia());
  const [liveTime, setLiveTime] = React.useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  // Live timer tick
  React.useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setLiveTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      setLiveDay(getHariIniIndonesia());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Effective day and time (Live or Simulated)
  const currentDay = isSimulated ? simulatedDay : liveDay;
  const currentTimeStr = isSimulated ? simulatedTime : liveTime;

  // Persist state updates to localStorage
  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_selected_id', selectedProdi.id);
  }, [selectedProdi]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_mahasiswa', JSON.stringify(mahasiswaList));
  }, [mahasiswaList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v15_dosen', JSON.stringify(dosenList));
  }, [dosenList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v15_jadwal', JSON.stringify(jadwalList));
  }, [jadwalList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v15_ruangan', JSON.stringify(ruanganList));
  }, [ruanganList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_peringatan', JSON.stringify(peringatanList));
  }, [peringatanList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_sidang', JSON.stringify(sidangList));
  }, [sidangList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_kp', JSON.stringify(kpList));
  }, [kpList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_yudisium', JSON.stringify(yudisiumList));
  }, [yudisiumList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_periode', JSON.stringify(periodeList));
  }, [periodeList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_tu_surat', JSON.stringify(tuSuratList));
  }, [tuSuratList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_tu_agenda', JSON.stringify(tuAgendaList));
  }, [tuAgendaList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_tu_sarpras', JSON.stringify(tuSarprasList));
  }, [tuSarprasList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_tagihan', JSON.stringify(tagihanList));
  }, [tagihanList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_honor', JSON.stringify(honorList));
  }, [honorList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_skpi', JSON.stringify(skpiList));
  }, [skpiList]);

  React.useEffect(() => {
    localStorage.setItem('sikaprodi_v13_audit_sidak', JSON.stringify(auditSidakList));
  }, [auditSidakList]);


  // Synchronize room status with active classes
  React.useEffect(() => {
    setRuanganList(prev => prev.map(r => {
      const activeClass = jadwalList.find(j => 
        j.ruanganId === r.id && isJadwalSedangBerlangsung(j, currentDay, currentTimeStr)
      );
      if (activeClass) {
        return {
          ...r,
          statusSaatIni: 'Terpakai',
          jadwalAktifSaatIni: {
            matakuliah: activeClass.namaMK,
            dosen: activeClass.dosenNama,
            kelas: activeClass.kelas,
            jam: `${activeClass.jamMulai} - ${activeClass.jamSelesai}`
          }
        };
      }
      return {
        ...r,
        statusSaatIni: 'Tersedia',
        jadwalAktifSaatIni: undefined
      };
    }));
  }, [currentDay, currentTimeStr, jadwalList]);

  // Handlers for Mahasiswa
  const handleAddMahasiswa = (mhs: Mahasiswa) => {
    setMahasiswaList(prev => [mhs, ...prev]);
    showToast(`Mahasiswa ${mhs.nama} (${mhs.nim}) berhasil ditambahkan.`);
  };

  const handleUpdateMahasiswa = (updated: Mahasiswa) => {
    setMahasiswaList(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelectedMahasiswa(updated);
    showToast(`Data akademik ${updated.nama} berhasil diperbarui.`);
  };

  const handleDeleteMahasiswa = (id: string) => {
    const target = mahasiswaList.find(m => m.id === id);
    if (!target) return;
    requestConfirm('Hapus Mahasiswa', `Yakin ingin menghapus data mahasiswa ${target.nama} (${target.nim})?`, () => {
      setMahasiswaList(prev => prev.filter(m => m.id !== id));
      showToast(`Data mahasiswa ${target.nama} telah dihapus.`);
    });
  };

  const handleImportMahasiswa = (rawText: string) => {
    if (!rawText || !rawText.trim()) {
      showToast('Teks data mahasiswa kosong.');
      return { total: 0, added: 0, updated: 0, skipped: 0 };
    }

    let parsedStudents: Partial<Mahasiswa>[] = [];
    const trimmed = rawText.trim();

    // Support JSON format if provided
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        parsedStudents = JSON.parse(trimmed);
      } catch (err) {
        // Fall back to TSV parser below
      }
    }

    // Parse TSV / raw text lines if not JSON
    if (parsedStudents.length === 0) {
      const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
      for (const line of lines) {
        let cols = line.split('\t').map(c => c.trim());
        if (cols.length < 3 && line.includes(',')) {
          cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        } else if (cols.length < 3) {
          cols = line.split(/\s{2,}/).map(c => c.trim());
        }

        if (cols.length === 0) continue;
        const nimCandidate = cols[0].replace(/\s+/g, '');
        // Must have at least a numeric NIM of 7-15 digits
        if (!/^\d{7,15}$/.test(nimCandidate)) {
          continue; // Skip header row if any
        }

        const nim = nimCandidate;
        const nama = cols[1] || `Mahasiswa ${nim}`;
        const jk: 'L' | 'P' = (cols[2] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
        const prodiRaw = cols[3] || 'S-1-TEKNIK SIPIL';
        const kelasRaw = cols[4] || 'REGULER';
        const thnAkademik = cols[5] || '';
        const statusRaw = (cols[6] || 'AKTIF').toUpperCase();
        const asalSekolah = cols[7] || '';

        let prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3' = 'SIPIL';
        let programStudi = 'S1 Teknik Sipil FT UNBARI';
        let jenjang: 'S1' | 'D3' = 'S1';
        let sksTargetLulus = 144;

        if (prodiRaw.toUpperCase().includes('LINGKUNGAN')) {
          prodiId = 'LINGKUNGAN';
          programStudi = 'S1 Teknik Lingkungan FT UNBARI';
        } else if (prodiRaw.toUpperCase().includes('LISTRIK')) {
          prodiId = 'LISTRIK_D3';
          programStudi = 'D3 Teknik Listrik FT UNBARI';
          jenjang = 'D3';
          sksTargetLulus = 110;
        }

        let angkatan = 2021;
        if (thnAkademik && /\d{4}/.test(thnAkademik)) {
          const match = thnAkademik.match(/(\d{4})/);
          if (match) angkatan = parseInt(match[1], 10);
        } else if (nim.length >= 2) {
          const prefix2 = parseInt(nim.slice(0, 2), 10);
          if (prefix2 >= 15 && prefix2 <= 35) {
            angkatan = 2000 + prefix2;
          }
        }

        let status: StatusMahasiswa = 'Aktif';
        if (statusRaw.includes('NON') || statusRaw.includes('TIDAK')) {
          status = 'Non-Aktif';
        } else if (statusRaw.includes('CUTI')) {
          status = 'Cuti';
        } else if (statusRaw.includes('PINDAH')) {
          status = 'Pindah';
        } else if (statusRaw.includes('LULUS')) {
          status = 'Lulus';
        } else if (statusRaw.includes('TA') || statusRaw.includes('SKRIPSI')) {
          status = 'Tugas Akhir';
        } else if (statusRaw.includes('BERISIKO') || statusRaw.includes('DO')) {
          status = 'Berisiko';
        }

        const diffYears = 2026 - angkatan;
        const estimatedSemester = Math.max(1, Math.min(14, diffYears * 2 + 1));
        const prodiDosens = dosenList.filter(d => d.prodiId === prodiId);
        const assignedDosenPA = prodiDosens.length > 0 
          ? prodiDosens[parsedStudents.length % prodiDosens.length].namaLengkap 
          : 'Ir. Rioni Rizki Aldiansyah, ST., MT, IPM, ASEAN Eng.';

        parsedStudents.push({
          id: `MHS-${prodiId.slice(0, 3)}-${nim}`,
          nim,
          nama: nama.toUpperCase(),
          prodiId,
          programStudi,
          jenjang,
          angkatan,
          semester: estimatedSemester,
          ipk: status === 'Aktif' ? 3.18 : status === 'Lulus' ? 3.48 : 2.30,
          sksLulus: status === 'Lulus' ? sksTargetLulus : status === 'Aktif' ? Math.min(sksTargetLulus - 4, estimatedSemester * 18) : 95,
          sksSemesterIni: status === 'Aktif' ? 18 : 0,
          sksTargetLulus,
          status,
          dosenPA: assignedDosenPA,
          email: `${nim}@mhs.unbari.ac.id`,
          nomorHp: `0812-${nim.slice(0, 4)}-${nim.slice(-4)}`,
          kehadiranPersen: status === 'Aktif' ? 88 : 0,
          konsentrasi: prodiId === 'SIPIL' ? 'Rekayasa Struktur' : prodiId === 'LINGKUNGAN' ? 'Teknik Pengolahan Air' : 'Sistem Tenaga Listrik',
          jenisKelamin: jk,
          jenisKelas: kelasRaw.toUpperCase().includes('KARYAWAN') ? 'Karyawan' : 'Reguler',
          asalSekolah,
          tahunAkademik: thnAkademik || `${angkatan}/${angkatan + 1}`,
          peringatanSp: status === 'Non-Aktif' ? 2 : 0
        });
      }
    }

    if (parsedStudents.length === 0) {
      showToast('Tidak ada baris data mahasiswa yang valid ditemukan.');
      return { total: 0, added: 0, updated: 0, skipped: 0 };
    }

    let addedCount = 0;
    let updatedCount = 0;

    setMahasiswaList(prev => {
      const existingMap = new Map<string, Mahasiswa>();
      prev.forEach(m => existingMap.set(m.nim, m));

      parsedStudents.forEach(item => {
        if (!item.nim) return;
        if (existingMap.has(item.nim)) {
          const current = existingMap.get(item.nim)!;
          existingMap.set(item.nim, {
            ...current,
            ...item,
            id: current.id, // Preserve existing ID
            nim: current.nim
          } as Mahasiswa);
          updatedCount++;
        } else {
          existingMap.set(item.nim, item as Mahasiswa);
          addedCount++;
        }
      });

      const updatedList = Array.from(existingMap.values());
      try {
        localStorage.setItem('sikaprodi_v13_mahasiswa', JSON.stringify(updatedList));
      } catch (e) {
        console.error('Failed to save imported mahasiswa to localStorage:', e);
      }
      return updatedList;
    });

    showToast(`Impor Berhasil: ${addedCount} mahasiswa baru ditambahkan, ${updatedCount} data diperbarui tanpa duplikasi NIM.`);
    return {
      total: parsedStudents.length,
      added: addedCount,
      updated: updatedCount,
      skipped: 0
    };
  };

  // Handlers for Data Dosen
  const handleAddDosen = (newDosen: Dosen) => {
    setDosenList(prev => [newDosen, ...prev]);
    showToast(`Data Dosen ${newDosen.namaLengkap} berhasil ditambahkan.`);
  };

  const handleUpdateDosen = (updated: Dosen) => {
    setDosenList(prev => prev.map(d => d.nidn === updated.nidn ? updated : d));
    showToast(`Profil Dosen ${updated.namaLengkap} berhasil diperbarui.`);
  };

  const handleDeleteDosen = (nidn: string) => {
    const target = dosenList.find(d => d.nidn === nidn);
    if (!target) return;
    requestConfirm('Hapus Data Dosen', `Yakin ingin menghapus dosen ${target.namaLengkap}?`, () => {
      setDosenList(prev => prev.filter(d => d.nidn !== nidn));
      showToast(`Data dosen ${target.namaLengkap} telah dihapus.`);
    });
  };

  // Handlers for Jadwal Kuliah
  const handleAddJadwal = (jadwal: JadwalKuliah) => {
    setJadwalList(prev => [jadwal, ...prev]);
    showToast(`Jadwal kuliah ${jadwal.namaMK} (${jadwal.hari}) berhasil ditambahkan.`);
  };

  const handleUpdateJadwal = (updated: JadwalKuliah) => {
    setJadwalList(prev => prev.map(j => j.id === updated.id ? updated : j));
    showToast(`Jadwal kuliah ${updated.namaMK} diperbarui.`);
  };

  const handleDeleteJadwal = (id: string) => {
    const target = jadwalList.find(j => j.id === id);
    if (!target) return;
    requestConfirm('Hapus Jadwal Kuliah', `Yakin ingin menghapus jadwal perkuliahan ${target.namaMK}?`, () => {
      setJadwalList(prev => prev.filter(j => j.id !== id));
      showToast(`Jadwal ${target.namaMK} telah dihapus.`);
    });
  };

  // Handlers for Sidang TA
  const handleAddSidang = (sidang: JadwalSidangTA) => {
    setSidangList(prev => [sidang, ...prev]);
    showToast(`Jadwal sidang ${sidang.namaMahasiswa} berhasil ditetapkan.`);
  };

  const handleUpdateSidang = (updated: JadwalSidangTA) => {
    setSidangList(prev => prev.map(s => s.id === updated.id ? updated : s));
    showToast(`Hasil sidang ${updated.namaMahasiswa} berhasil diperbarui.`);
  };

  const handleDeleteSidang = (id: string) => {
    const target = sidangList.find(s => s.id === id);
    if (!target) return;
    requestConfirm('Hapus Jadwal Sidang', `Yakin ingin menghapus jadwal sidang ${target.namaMahasiswa}?`, () => {
      setSidangList(prev => prev.filter(s => s.id !== id));
      showToast(`Jadwal sidang ${target.namaMahasiswa} dihapus.`);
    });
  };

  // Handlers for Kerja Praktek
  const handleAddKp = (kp: JadwalKerjaPraktek) => {
    setKpList(prev => [kp, ...prev]);
    showToast(`Data kerja praktek ${kp.namaMahasiswa} berhasil ditambahkan.`);
  };

  const handleUpdateKp = (updated: JadwalKerjaPraktek) => {
    setKpList(prev => prev.map(k => k.id === updated.id ? updated : k));
    showToast(`Data kerja praktek ${updated.namaMahasiswa} diperbarui.`);
  };

  const handleDeleteKp = (id: string) => {
    const target = kpList.find(k => k.id === id);
    if (!target) return;
    requestConfirm('Hapus Kerja Praktek', `Yakin ingin menghapus data KP ${target.namaMahasiswa}?`, () => {
      setKpList(prev => prev.filter(k => k.id !== id));
      showToast(`Data kerja praktek ${target.namaMahasiswa} dihapus.`);
    });
  };

  // Handler for Dosen presence
  const handleUpdateDosenStatus = (dosenId: string, status: StatusKehadiranDosen, lokasi?: string) => {
    setDosenList(prev => prev.map(d => {
      if (d.id === dosenId) {
        return {
          ...d,
          statusRealTime: status,
          lokasiTerkini: lokasi || (
            status === 'Ada di Ruang Dosen' ? 'Ruang Dosen Jurusan' :
            status === 'Sedang Mengajar' ? 'Di Ruang Kuliah/Lab/Bengkel' :
            status === 'Bimbingan Mahasiswa' ? 'Ruang Konseling & Tugas Akhir' :
            status === 'Izin / Tugas Luar' ? 'Penugasan Lapangan / Proyek' : 'Belum Berada di Kampus'
          )
        };
      }
      return d;
    }));
    showToast(`Status kehadiran dosen berhasil diperbarui.`);
  };

  // Handler for recording real-time lecturer session check-in from Dashboard tracker
  const handleRecordRealTimePresensi = (jadwal: JadwalKuliah) => {
    const [startH, startM] = jadwal.jamMulai.split(':').map(Number);
    const [nowH, nowM] = currentTimeStr.split(':').map(Number);
    const startTotal = (startH || 0) * 60 + (startM || 0);
    const nowTotal = (nowH || 0) * 60 + (nowM || 0);
    const delayMenit = nowTotal - startTotal;
    const isLate = delayMenit > 15;
    const targetDurasi = Math.max(50, jadwal.sks * 50);
    const actualOutTotal = nowTotal + targetDurasi;
    const outH = Math.min(23, Math.floor(actualOutTotal / 60));
    const outM = actualOutTotal % 60;
    const jamKeluarAktual = `${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}`;
    const minggu = jadwal.pertemuanKe || 8;

    const newLog: LogPresensiDosen = {
      id: `LOG-RT-${Date.now()}`,
      jadwalId: jadwal.id,
      dosenNidn: jadwal.dosenNidn,
      dosenNama: jadwal.dosenNama,
      prodiId: jadwal.prodiId,
      kodeMK: jadwal.kodeMK,
      namaMK: jadwal.namaMK,
      sks: jadwal.sks,
      kelas: jadwal.kelas,
      ruanganNama: jadwal.ruanganNama,
      tanggal: new Date().toISOString().split('T')[0],
      mingguKe: minggu,
      hari: jadwal.hari,
      jamMulaiRencana: jadwal.jamMulai,
      jamSelesaiRencana: jadwal.jamSelesai,
      jamMasukAktual: currentTimeStr,
      jamKeluarAktual,
      durasiMenit: targetDurasi,
      durasiJam: Number((targetDurasi / 60).toFixed(2)),
      durasiTargetMenit: targetDurasi,
      statusKehadiran: isLate ? 'Hadir Terlambat' : 'Hadir Tepat Waktu',
      bapStatus: jadwal.bapStatus === 'Terverifikasi' ? 'Terverifikasi' : 'Menunggu Verifikasi Kaprodi',
      materiKuliah: jadwal.topikPertemuan || 'Sesi Perkuliahan Berjalan Sesuai RPS',
      jumlahMahasiswaHadir: Math.max(1, Math.round((jadwal.pesertaTotal || 20) * 0.9)),
      jumlahMahasiswaTotal: jadwal.pesertaTotal || 20,
      catatanVerifikator: isLate
        ? `Check-in dicatat pukul ${currentTimeStr} WIB (terlambat +${delayMenit} menit dari jadwal ${jadwal.jamMulai}).`
        : `Check-in dicatat tepat waktu pukul ${currentTimeStr} WIB.`
    };

    setLogPresensiList(prev => {
      const filtered = prev.filter(l => !(l.jadwalId === jadwal.id && l.mingguKe === minggu));
      return [newLog, ...filtered];
    });

    setJadwalList(prev =>
      prev.map(j =>
        j.id === jadwal.id
          ? {
              ...j,
              statusSesi: 'Sedang Berlangsung',
              bapStatus: j.bapStatus === 'Belum Diisi' ? 'Menunggu Verifikasi Kaprodi' : j.bapStatus
            }
          : j
      )
    );

    setDosenList(prev =>
      prev.map(d =>
        d.nidn === jadwal.dosenNidn || d.namaLengkap === jadwal.dosenNama
          ? {
              ...d,
              statusRealTime: 'Sedang Mengajar',
              lokasiTerkini: jadwal.ruanganNama
            }
          : d
      )
    );

    showToast(
      isLate
        ? `Check-in ${jadwal.dosenNama} (${jadwal.kodeMK}) dicatat pukul ${currentTimeStr} WIB — Ditandai Hadir Terlambat (+${delayMenit} mnt).`
        : `Check-in ${jadwal.dosenNama} (${jadwal.kodeMK}) dicatat tepat waktu pukul ${currentTimeStr} WIB.`
    );
  };

  // Handler for BAP verification by Kaprodi (Integrated with presence log & weekly duration)
  const handleVerifyBap = (jadwalId: string, catatan?: string) => {
    setJadwalList(prev => prev.map(j => {
      if (j.id === jadwalId) {
        return { ...j, bapStatus: 'Terverifikasi' };
      }
      return j;
    }));

    const targetJadwal = jadwalList.find(j => j.id === jadwalId);
    if (targetJadwal) {
      setLogPresensiList(prev => {
        const minggu = targetJadwal.pertemuanKe || 8;
        const existingIdx = prev.findIndex(l => l.jadwalId === jadwalId && l.mingguKe === minggu);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            bapStatus: 'Terverifikasi',
            catatanVerifikator: catatan || updated[existingIdx].catatanVerifikator || 'BAP Disahkan Kaprodi',
            waktuVerifikasi: new Date().toLocaleString('id-ID')
          };
          return updated;
        } else {
          const durasiTarget = targetJadwal.sks * 50;
          const [startHour, startMin] = targetJadwal.jamMulai.split(':').map(Number);
          const endHour = Math.floor((startHour * 60 + startMin + durasiTarget) / 60);
          const endMin = (startHour * 60 + startMin + durasiTarget) % 60;
          const checkOutStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

          const newLog: LogPresensiDosen = {
            id: `LOG-BAP-${Date.now()}`,
            jadwalId: targetJadwal.id,
            dosenNidn: targetJadwal.dosenNidn,
            dosenNama: targetJadwal.dosenNama,
            prodiId: targetJadwal.prodiId,
            mingguKe: minggu,
            tanggal: new Date().toISOString().split('T')[0],
            hari: targetJadwal.hari,
            kodeMK: targetJadwal.kodeMK,
            namaMK: targetJadwal.namaMK,
            sks: targetJadwal.sks,
            kelas: targetJadwal.kelas,
            ruanganNama: targetJadwal.ruanganNama,
            jamMulaiRencana: targetJadwal.jamMulai,
            jamSelesaiRencana: targetJadwal.jamSelesai,
            jamMasukAktual: targetJadwal.jamMulai,
            jamKeluarAktual: checkOutStr,
            durasiMenit: durasiTarget,
            durasiJam: Number((durasiTarget / 60).toFixed(2)),
            durasiTargetMenit: durasiTarget,
            statusKehadiran: 'Hadir Tepat Waktu',
            bapStatus: 'Terverifikasi',
            materiKuliah: targetJadwal.topikPertemuan || 'Materi Perkuliahan RPS Terlaksana',
            jumlahMahasiswaHadir: Math.round(targetJadwal.pesertaTotal * 0.9),
            jumlahMahasiswaTotal: targetJadwal.pesertaTotal,
            catatanVerifikator: catatan || 'Disahkan oleh Kaprodi',
            waktuVerifikasi: new Date().toLocaleString('id-ID')
          };
          return [newLog, ...prev];
        }
      });
    }

    showToast(`Berita Acara Perkuliahan telah disahkan oleh Kaprodi & durasi kehadiran dosen tercatat.`);
  };

  // Handler for Peringatan Ditindaklanjuti
  const handleTindakLanjutiPeringatan = (id: string) => {
    setPeringatanList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, sudahDitindaklanjuti: true };
      }
      return p;
    }));
    showToast(`Peringatan akademik telah ditandai ditindaklanjuti.`);
  };

  // Handler for Audit Kehadiran Mendadak (Sidak Presensi Kelas)
  const handleSaveAuditSidak = (
    auditData: AuditSidakKehadiran,
    updatedStudents: Mahasiswa[],
    newWarnings: PeringatanAkademik[]
  ) => {
    setAuditSidakList(prev => [auditData, ...prev]);

    if (updatedStudents.length > 0) {
      setMahasiswaList(prev => prev.map(m => {
        const found = updatedStudents.find(u => u.nim === m.nim);
        return found ? found : m;
      }));
    }

    if (newWarnings.length > 0) {
      setPeringatanList(prev => [...newWarnings, ...prev]);
    }

    showToast(
      `Sidak kelas ${auditData.namaMK} berhasil dicatat. ` +
      (newWarnings.length > 0 
        ? `${newWarnings.length} surat peringatan presensi otomatis diterbitkan ke EWS.` 
        : 'Presensi kelas telah diperbarui.')
    );
  };

  // Yudisium & Wisuda Handlers
  const handleAddYudisium = (record: YudisiumRecord) => {
    setYudisiumList(prev => [record, ...prev]);
    setMahasiswaList(prev => prev.map(m => m.nim === record.nim ? { ...m, status: 'Lulus' } : m));
  };

  const handleUpdateYudisium = (record: YudisiumRecord) => {
    setYudisiumList(prev => prev.map(y => y.id === record.id ? record : y));
  };

  const handleDeleteYudisium = (id: string) => {
    setYudisiumList(prev => prev.filter(y => y.id !== id));
  };

  const handleAddPeriode = (periode: PeriodeYudisium) => {
    setPeriodeList(prev => [periode, ...prev]);
  };

  const handleUpdatePeriode = (periode: PeriodeYudisium) => {
    setPeriodeList(prev => prev.map(p => p.id === periode.id ? periode : p));
  };

  // Tata Usaha Handlers
  const handleAddSuratTu = (surat: SuratPermohonanTU) => {
    setTuSuratList(prev => [surat, ...prev]);
    showToast(`Permohonan ${surat.jenisSurat} (${surat.pemohonNama}) berhasil dicatat.`);
  };

  const handleUpdateSuratTu = (surat: SuratPermohonanTU) => {
    setTuSuratList(prev => prev.map(s => s.id === surat.id ? surat : s));
    showToast(`Status permohonan surat (${surat.nomorSurat || surat.jenisSurat}) diperbarui.`);
  };

  const handleDeleteSuratTu = (id: string) => {
    const target = tuSuratList.find(s => s.id === id);
    if (!target) return;
    requestConfirm('Hapus Permohonan Surat', `Yakin ingin menghapus berkas permohonan surat ${target.jenisSurat} atas nama ${target.pemohonNama}?`, () => {
      setTuSuratList(prev => prev.filter(s => s.id !== id));
      showToast('Permohonan surat berhasil dihapus.');
    });
  };

  const handleAddAgendaTu = (agenda: SuratAgendaTU) => {
    setTuAgendaList(prev => [agenda, ...prev]);
    showToast(`Buku Agenda: Surat ${agenda.tipe} No. ${agenda.nomorSuratAsli || agenda.nomorAgenda} berhasil dicatat.`);
  };

  const handleUpdateAgendaTu = (agenda: SuratAgendaTU) => {
    setTuAgendaList(prev => prev.map(a => a.id === agenda.id ? agenda : a));
    showToast(`Data agenda surat ${agenda.nomorSuratAsli || agenda.nomorAgenda} diperbarui.`);
  };

  const handleDeleteAgendaTu = (id: string) => {
    const target = tuAgendaList.find(a => a.id === id);
    if (!target) return;
    requestConfirm('Hapus Agenda Surat', `Yakin ingin menghapus catatan agenda surat ${target.nomorSuratAsli || target.nomorAgenda}?`, () => {
      setTuAgendaList(prev => prev.filter(a => a.id !== id));
      showToast('Catatan agenda surat berhasil dihapus.');
    });
  };

  const handleAddSarprasTu = (sarpras: PeminjamanSarprasTU) => {
    setTuSarprasList(prev => [sarpras, ...prev]);
    showToast(`Peminjaman ${sarpras.itemFasilitas} berhasil didaftarkan.`);
  };

  const handleUpdateSarprasTu = (sarpras: PeminjamanSarprasTU) => {
    setTuSarprasList(prev => prev.map(s => s.id === sarpras.id ? sarpras : s));
    showToast(`Status peminjaman ${sarpras.itemFasilitas} diperbarui.`);
  };

  const handleDeleteSarprasTu = (id: string) => {
    const target = tuSarprasList.find(s => s.id === id);
    if (!target) return;
    requestConfirm('Hapus Peminjaman Sarpras', `Yakin ingin membatalkan dan menghapus peminjaman ${target.itemFasilitas} oleh ${target.namaPeminjam}?`, () => {
      setTuSarprasList(prev => prev.filter(s => s.id !== id));
      showToast('Data peminjaman sarana prasarana dihapus.');
    });
  };

  // Handlers for Kerjasama & Kemitraan
  const handleAddKerjasama = (newKerjasama: DokumenKerjasama) => {
    setKerjasamaList(prev => [newKerjasama, ...prev]);
  };

  const handleUpdateKerjasama = (updated: DokumenKerjasama) => {
    setKerjasamaList(prev => prev.map(k => k.id === updated.id ? updated : k));
  };

  const handleDeleteKerjasama = (id: string) => {
    setKerjasamaList(prev => prev.filter(k => k.id !== id));
  };

  // Reset to default dataset
  const handleResetData = () => {
    requestConfirm('Reset Data Sistem', 'Reset seluruh data ke pengaturan awal (S1 Sipil, S1 Lingkungan, D3 Listrik & Tata Usaha)? Seluruh perubahan lokal akan dikembalikan ke data bawaan.', () => {
      localStorage.removeItem('sikaprodi_v13_selected_id');
      localStorage.removeItem('sikaprodi_v13_mahasiswa');
      localStorage.removeItem('sikaprodi_v13_dosen');
      localStorage.removeItem('sikaprodi_v14_dosen');
      localStorage.removeItem('sikaprodi_v15_dosen');
      localStorage.removeItem('sikaprodi_v13_jadwal');
      localStorage.removeItem('sikaprodi_v14_jadwal');
      localStorage.removeItem('sikaprodi_v15_jadwal');
      localStorage.removeItem('sikaprodi_v13_ruangan');
      localStorage.removeItem('sikaprodi_v14_ruangan');
      localStorage.removeItem('sikaprodi_v15_ruangan');
      localStorage.removeItem('sikaprodi_v14_matriks_cpl_cpmk');
      localStorage.removeItem('sikaprodi_v15_matriks_cpl_cpmk');
      localStorage.removeItem('sikaprodi_v13_peringatan');
      localStorage.removeItem('sikaprodi_v13_sidang');
      localStorage.removeItem('sikaprodi_v13_kp');
      localStorage.removeItem('sikaprodi_v13_yudisium');
      localStorage.removeItem('sikaprodi_v13_periode');
      localStorage.removeItem('sikaprodi_v13_tu_surat');
      localStorage.removeItem('sikaprodi_v13_tu_agenda');
      localStorage.removeItem('sikaprodi_v13_tu_sarpras');
      localStorage.removeItem('sikaprodi_v13_tagihan');
      localStorage.removeItem('sikaprodi_v13_honor');
      localStorage.removeItem('sikaprodi_v13_skpi');
      localStorage.removeItem('sikaprodi_v13_audit_sidak');
      localStorage.removeItem('sikaprodi_v13_log_presensi');
      localStorage.removeItem('sikaprodi_v13_kerjasama');
      localStorage.removeItem('sikaprodi_v14_ketersediaan_jadwal');
      setSelectedProdi(PRODI_LIST[0]);
      setMahasiswaList(INITIAL_MAHASISWA);
      setDosenList(INITIAL_DOSEN);
      setJadwalList(INITIAL_JADWAL);
      setRuanganList(INITIAL_RUANGAN);
      setPeringatanList(INITIAL_PERINGATAN);
      setSidangList(INITIAL_JADWAL_SIDANG_TA);
      setKpList(INITIAL_JADWAL_KP);
      setYudisiumList(INITIAL_YUDISIUM_RECORDS);
      setPeriodeList(INITIAL_PERIODE_YUDISIUM);
      setTuSuratList(INITIAL_SURAT_TU);
      setTuAgendaList(INITIAL_AGENDA_TU);
      setTuSarprasList(INITIAL_SARPRAS_TU);
      setTagihanList(INITIAL_TAGIHAN_UKT);
      setHonorList(INITIAL_HONOR_DOSEN);
      setAnggaranList(INITIAL_ANGGARAN_PRODI_LAB);
      setSkpiList(INITIAL_SKPI_RECORDS);
      setAuditSidakList(INITIAL_AUDIT_SIDAK);
      setLogPresensiList(INITIAL_LOG_PRESENSI_DOSEN);
      setKerjasamaList(INITIAL_KERJASAMA);
      setKetersediaanJadwalList(INITIAL_KETERSEDIAAN_JADWAL);
      showToast('Seluruh data berhasil di-reset ke data bawaan.');
    });
  };


  // Active counts for badges
  const activeClassCount = jadwalList.filter(j => 
    j.prodiId === selectedProdi.id && isJadwalSedangBerlangsung(j, currentDay, currentTimeStr)
  ).length;

  const alertCount = mahasiswaList.filter(m => 
    m.prodiId === selectedProdi.id && (m.status === 'Berisiko' || m.peringatanSp > 0)
  ).length;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <LoginView onLoginSuccess={handleLoginSuccess} onShowToast={showToast} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2.5 border bg-slate-900 text-white border-slate-700 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium leading-relaxed">{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedProdi={selectedProdi}
        onSelectProdi={setSelectedProdi}
        prodiList={PRODI_LIST}
        currentUser={currentUser}
        onLogout={handleLogout}
        currentTimeStr={currentTimeStr}
        currentDay={currentDay}
        isSimulated={isSimulated}
        onToggleSimulation={() => setIsSimulated(!isSimulated)}
        onSetSimulatedTime={(day, time) => {
          setIsSimulated(true);
          setSimulatedDay(day);
          setSimulatedTime(time);
        }}
        onResetSimulation={() => {
          setIsSimulated(false);
        }}
        activeClassCount={activeClassCount}
        alertCount={alertCount}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        yudisiumCount={yudisiumList.filter(y => y.prodiId === selectedProdi.id).length}
        tuPendingCount={tuSuratList.filter(s => s.status !== 'Selesai & Diterbitkan' && s.status !== 'Ditolak').length}
        onOpenVerifikasiModal={() => setIsVerifikasiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2.5 border animate-in fade-in slide-in-from-bottom-2 ${
            toastMessage.includes('Perhatian') || toastMessage.includes('Peringatan') || toastMessage.includes('⚠️') || toastMessage.includes('kadaluarsa')
              ? 'bg-amber-950 text-amber-100 border-amber-600/80 shadow-amber-950/40'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            {toastMessage.includes('Perhatian') || toastMessage.includes('Peringatan') || toastMessage.includes('⚠️') || toastMessage.includes('kadaluarsa') ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="font-medium leading-relaxed">{toastMessage}</span>
          </div>
        )}

        {/* View Switcher */}
        {currentTab === 'dashboard' && (
          <DashboardOverview
            mahasiswaList={mahasiswaList}
            dosenList={dosenList}
            jadwalList={jadwalList}
            logPresensiList={logPresensiList}
            ruanganList={ruanganList}
            peringatanList={peringatanList}
            sidangList={sidangList}
            kpList={kpList}
            auditSidakList={auditSidakList}
            yudisiumList={yudisiumList}
            kerjasamaList={kerjasamaList}
            selectedProdi={selectedProdi}
            currentDay={currentDay}
            currentTimeStr={currentTimeStr}
            isSimulated={isSimulated}
            onSetSimulatedTime={(day, time) => {
              setIsSimulated(true);
              setSimulatedDay(day);
              setSimulatedTime(time);
            }}
            onResetSimulation={() => setIsSimulated(false)}
            onNavigateTab={handleNavigateTab}
            onSelectMahasiswa={(mhs) => {
              setSelectedMahasiswa(mhs);
              setCurrentTab('mahasiswa');
            }}
            onVerifyBap={handleVerifyBap}
            onTindakLanjutiPeringatan={handleTindakLanjutiPeringatan}
            onOpenEwsModal={() => setIsEwsAuditModalOpen(true)}
            onOpenAuditSidakModal={(jadwalId?: string) => {
              setSelectedJadwalForAudit(jadwalId || null);
              setIsAuditSidakModalOpen(true);
            }}
            onUpdateDosenStatus={handleUpdateDosenStatus}
            onRecordRealTimePresensi={handleRecordRealTimePresensi}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'siakad' && (
          <SiakadView
            selectedProdi={selectedProdi}
            mahasiswaList={mahasiswaList}
            dosenList={dosenList}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'mahasiswa' && (
          <MahasiswaView
            mahasiswaList={mahasiswaList}
            dosenList={dosenList}
            selectedProdi={selectedProdi}
            onAddMahasiswa={handleAddMahasiswa}
            onUpdateMahasiswa={handleUpdateMahasiswa}
            onDeleteMahasiswa={handleDeleteMahasiswa}
            selectedMahasiswa={selectedMahasiswa}
            onSelectMahasiswa={setSelectedMahasiswa}
            onImportMahasiswa={handleImportMahasiswa}
          />
        )}

        {currentTab === 'jadwal' && (
          <JadwalDosenView
            jadwalList={jadwalList}
            dosenList={dosenList}
            ruanganList={ruanganList}
            selectedProdi={selectedProdi}
            currentDay={currentDay}
            currentTimeStr={currentTimeStr}
            onAddJadwal={handleAddJadwal}
            onUpdateJadwal={handleUpdateJadwal}
            onDeleteJadwal={handleDeleteJadwal}
            onUpdateDosenStatus={handleUpdateDosenStatus}
            onVerifyBap={handleVerifyBap}
            logPresensiList={logPresensiList}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'lms' && (
          <LmsView
            selectedProdi={selectedProdi}
            mahasiswaList={mahasiswaList}
            dosenList={dosenList}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'sidang_kp' && (
          <KerjaPraktekDanTaView
            sidangList={sidangList}
            kpList={kpList}
            mahasiswaList={mahasiswaList}
            dosenList={dosenList}
            ruanganList={ruanganList}
            selectedProdi={selectedProdi}
            onAddSidang={handleAddSidang}
            onUpdateSidang={handleUpdateSidang}
            onDeleteSidang={handleDeleteSidang}
            onAddKp={handleAddKp}
            onUpdateKp={handleUpdateKp}
            onDeleteKp={handleDeleteKp}
            ketersediaanJadwalList={ketersediaanJadwalList}
            onUpdateKetersediaanJadwal={handleUpdateKetersediaanJadwal}
            jadwalKuliahList={jadwalList}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'laboratorium' && (
          <LaboratoriumView
            ruanganList={ruanganList}
            jadwalList={jadwalList}
            selectedProdi={selectedProdi}
            currentDay={currentDay}
            currentTimeStr={currentTimeStr}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'bkd' && (
          <BkdDosenView
            dosenList={dosenList}
            jadwalList={jadwalList}
            selectedProdi={selectedProdi}
            mahasiswaList={mahasiswaList}
            sidangList={sidangList}
            kpList={kpList}
            kerjasamaList={kerjasamaList}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'dosen' && (
          <DataDosenView
            dosenList={dosenList}
            selectedProdi={selectedProdi}
            jadwalList={jadwalList}
            onAddDosen={handleAddDosen}
            onUpdateDosen={handleUpdateDosen}
            onDeleteDosen={handleDeleteDosen}
          />
        )}

        {currentTab === 'yudisium_wisuda' && (
          <YudisiumWisudaView
            yudisiumList={yudisiumList}
            periodeList={periodeList}
            mahasiswaList={mahasiswaList}
            dosenList={dosenList}
            selectedProdi={selectedProdi}
            onAddYudisium={handleAddYudisium}
            onUpdateYudisium={handleUpdateYudisium}
            onDeleteYudisium={handleDeleteYudisium}
            onAddPeriode={handleAddPeriode}
            onUpdatePeriode={handleUpdatePeriode}
            onRequestConfirm={requestConfirm}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'tata_usaha' && (
          <TataUsahaView
            suratList={tuSuratList}
            agendaList={tuAgendaList}
            sarprasList={tuSarprasList}
            mahasiswaList={mahasiswaList}
            dosenList={dosenList}
            selectedProdi={selectedProdi}
            onAddSurat={handleAddSuratTu}
            onUpdateSurat={handleUpdateSuratTu}
            onDeleteSurat={handleDeleteSuratTu}
            onAddAgenda={handleAddAgendaTu}
            onUpdateAgenda={handleUpdateAgendaTu}
            onDeleteAgenda={handleDeleteAgendaTu}
            onAddSarpras={handleAddSarprasTu}
            onUpdateSarpras={handleUpdateSarprasTu}
            onDeleteSarpras={handleDeleteSarprasTu}
            onRequestConfirm={requestConfirm}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'keuangan' && (
          <KeuanganView
            selectedProdi={selectedProdi}
            tagihanList={tagihanList}
            onUpdateTagihanList={setTagihanList}
            honorList={honorList}
            onUpdateHonorList={setHonorList}
            anggaranList={anggaranList}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'skpi' && (
          <SkpiView
            selectedProdi={selectedProdi}
            skpiList={skpiList}
            onUpdateSkpiList={setSkpiList}
          />
        )}

        {currentTab === 'akreditasi' && (
          <AkreditasiView
            selectedProdi={selectedProdi}
            mahasiswaList={mahasiswaList}
            dosenList={dosenList}
            jadwalList={jadwalList}
            logPresensiList={logPresensiList}
            requestedSubTab={akreditasiTargetSubTab}
            onConsumeRequestedSubTab={() => setAkreditasiTargetSubTab(null)}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'kerjasama' && (
          <KerjasamaView
            kerjasamaList={kerjasamaList}
            selectedProdi={selectedProdi}
            onAddKerjasama={handleAddKerjasama}
            onUpdateKerjasama={handleUpdateKerjasama}
            onDeleteKerjasama={handleDeleteKerjasama}
            onRequestConfirm={requestConfirm}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'workspace' && (
          <GoogleWorkspaceView
            selectedProdi={selectedProdi}
            mahasiswaList={mahasiswaList}
            dosenList={dosenList}
            jadwalList={jadwalList}
            onShowToast={showToast}
          />
        )}

      </main>

      {/* Export / Cetak Laporan Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedProdi={selectedProdi}
        mahasiswaList={mahasiswaList.filter(m => m.prodiId === selectedProdi.id)}
        dosenList={dosenList.filter(d => d.prodiId === selectedProdi.id)}
        jadwalList={jadwalList.filter(j => j.prodiId === selectedProdi.id)}
        sidangList={sidangList.filter(s => s.prodiId === selectedProdi.id)}
        kpList={kpList.filter(k => k.prodiId === selectedProdi.id)}
      />

      {/* Cadangan & Pemulihan Data Modal (JSON Backup & Restore) */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        selectedProdi={selectedProdi}
        mahasiswaList={mahasiswaList}
        dosenList={dosenList}
        jadwalList={jadwalList}
        ruanganList={ruanganList}
        peringatanList={peringatanList}
        sidangList={sidangList}
        kpList={kpList}
        yudisiumList={yudisiumList}
        tuSuratList={tuSuratList}
        tuAgendaList={tuAgendaList}
        tuSarprasList={tuSarprasList}
        tagihanList={tagihanList}
        ketersediaanJadwalList={ketersediaanJadwalList}
        onRestoreData={handleRestoreData}
        onRequestConfirm={requestConfirm}
        onShowToast={showToast}
      />

      {/* Verifikasi Keaslian Dokumen Modal (QR Code) */}
      <VerifikasiDokumenModal
        isOpen={isVerifikasiModalOpen}
        onClose={() => setIsVerifikasiModalOpen(false)}
      />

      {/* Early Warning System (EWS) Mahasiswa Kritis Audit Modal */}
      <MahasiswaKritisAuditModal
        isOpen={isEwsAuditModalOpen}
        onClose={() => setIsEwsAuditModalOpen(false)}
        selectedProdi={selectedProdi}
      />

      {/* Audit Kehadiran Mendadak (Sidak Presensi Kelas) Modal */}
      <AuditKehadiranMendadakModal
        isOpen={isAuditSidakModalOpen}
        onClose={() => {
          setIsAuditSidakModalOpen(false);
          setSelectedJadwalForAudit(null);
        }}
        selectedProdi={selectedProdi}
        jadwalList={jadwalList}
        mahasiswaList={mahasiswaList}
        auditSidakList={auditSidakList}
        preselectedJadwalId={selectedJadwalForAudit}
        currentDay={currentDay}
        currentTimeStr={currentTimeStr}
        onSaveAuditSidak={handleSaveAuditSidak}
      />

      {/* Footer Web Version */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-wide">YAYASAN PENDIDIKAN JAMBI</span>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-blue-700">UNIVERSITAS BATANGHARI</span>
              </div>
              <p className="text-slate-600">
                Fakultas Teknik · S1 Teknik Sipil · S1 Teknik Lingkungan · D3 Teknik Listrik
              </p>
              <p className="text-[11px] text-slate-500">
                Jl. Slamet Riyadi No. 01 Broni - Kota Jambi 36122 · Telp: (0741) 60103
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
              <a
                href="https://universitasbatanghari.ac.id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 font-medium transition-colors"
              >
                <span>Laman Resmi: universitasbatanghari.ac.id</span>
              </a>
              <a
                href="mailto:ftunbari.tpa@gmail.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 font-medium transition-colors"
              >
                <span>Surel: ftunbari.tpa@gmail.com</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SiKaprodi FT UNBARI © 2026 · Versi Web Terintegrasi Google Workspace, IABEE & LAM TEKNIK</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-700 transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data Default</span>
              </button>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-400 font-mono">A4 Ready (Margin 1 1 1 1 cm)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* In-App Confirmation Dialog (Iframe-safe, replaces window.confirm) */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{confirmDialog.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
