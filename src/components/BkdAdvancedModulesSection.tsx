import React, { useMemo, useRef, useState } from 'react';
import {
  Calculator,
  FolderOpen,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  ClipboardCheck,
  Printer,
  Send,
  SearchCheck,
  CloudUpload,
  Eye,
  HardDrive,
  Plus,
  RefreshCw,
  Trash2,
  X
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
  ReferenceLine
} from 'recharts';
import { Dosen, JadwalKuliah, ProgramStudiInfo } from '../types/index';
import { StandardKopSurat } from './StandardKopSurat';
import { QrCodeSvg } from '../utils/qrHelper';
import { printDocumentElement } from '../utils/printHelper';
import { logKaprodiActivity } from '../utils/activityLogHelper';
import {
  computeBkdFolderQuotaSummary,
  deleteDriveFile,
  DriveFolderQuotaSummary,
  fetchBkdDriveStorageQuota,
  formatStorageBytes,
  GoogleDriveFileDto,
  uploadToBkdDriveFolder
} from '../utils/driveService';
import { useDriveAuth } from '../hooks/useDriveAuth';
import { WorkspaceMutationConfirmDialog } from './GoogleWorkspaceSignInCard';
import { DrivePdfPreviewModal, DrivePdfPreviewTarget } from './DrivePdfPreviewModal';
import { DriveFilePicker, PickedDriveDocument } from './DriveFilePicker';

export interface BkdRepoFileItem {
  id: string;
  dosenId: string;
  dosenNama: string;
  nidn: string;
  kategori: 'SK Mengajar' | 'RPS' | 'BAP Perkuliahan' | 'Laporan Pengabdian' | 'Bukti Bimbingan' | 'Karya Ilmiah';
  namaFile: string;
  tanggalUnggah: string;
  semester: string;
  ukuran: string;
  driveLink?: string;
  driveFileId?: string;
  mimeType?: string;
  source?: 'DRIVE_PICKER' | 'DRIVE_UPLOAD' | 'LOCAL';
  statusPlagiarisme?: {
    skorPersen: number;
    status: 'AMAN' | 'PERINGATAN';
    catatan: string;
    checkedAt: string;
  };
}

const STORAGE_KEY_BKD_REPO = 'sikaprodi_v15_bkd_repo_files';

interface BkdAdvancedModulesSectionProps {
  dosenList: Dosen[];
  jadwalList: JadwalKuliah[];
  selectedProdi: ProgramStudiInfo;
  prodiLabel: string;
  onShowToast?: (msg: string) => void;
}

const SIMULATED_MK_OPTIONS = [
  { kode: 'FT-SIM-101', nama: 'Metodologi Riset Rekayasa', sks: 2 },
  { kode: 'FT-SIM-102', nama: 'Rekayasa Infrastruktur Berkelanjutan', sks: 3 },
  { kode: 'FT-SIM-103', nama: 'Praktikum Komputasi & Pemodelan Teknik', sks: 2 },
  { kode: 'FT-SIM-104', nama: 'Manajemen Proyek Konstruksi & K3', sks: 3 },
  { kode: 'FT-SIM-105', nama: 'Kapita Selekta Energi & Lingkungan', sks: 2 }
];

export const BkdAdvancedModulesSection: React.FC<BkdAdvancedModulesSectionProps> = ({
  dosenList,
  jadwalList,
  selectedProdi,
  prodiLabel,
  onShowToast
}) => {
  const [subPanel, setSubPanel] = useState<
    'analisis_kalkulator' | 'repository_bap' | 'proyeksi_audit'
  >('analisis_kalkulator');

  // Seed repository files per lecturer cleanly so 2 lecturers show incomplete docs for WA reminder workflow
  const [repoFiles, setRepoFiles] = useState<BkdRepoFileItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BKD_REPO);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    const seed: BkdRepoFileItem[] = [];
    dosenList.forEach((d, idx) => {
      seed.push({
        id: `bkd-seed-sk-${d.id}`,
        dosenId: d.id,
        dosenNama: d.namaLengkap,
        nidn: d.nidn,
        kategori: 'SK Mengajar',
        namaFile: `SK_Dekan_Mengajar_Ganjil_${d.nidn}.pdf`,
        tanggalUnggah: '2025-09-02',
        semester: '2025/2026 Ganjil',
        ukuran: '420 KB'
      });
      if (idx % 3 !== 2) {
        seed.push({
          id: `bkd-seed-rps-${d.id}`,
          dosenId: d.id,
          dosenNama: d.namaLengkap,
          nidn: d.nidn,
          kategori: 'RPS',
          namaFile: `Paket_RPS_OBE_${d.nidn}.pdf`,
          tanggalUnggah: '2025-09-10',
          semester: '2025/2026 Ganjil',
          ukuran: '1.4 MB'
        });
      }
      if (idx % 2 === 0) {
        seed.push({
          id: `bkd-seed-abdimas-${d.id}`,
          dosenId: d.id,
          dosenNama: d.namaLengkap,
          nidn: d.nidn,
          kategori: 'Laporan Pengabdian',
          namaFile: `Laporan_PKM_Masyarakat_${d.nidn}.pdf`,
          tanggalUnggah: '2025-11-01',
          semester: '2025/2026 Ganjil',
          ukuran: '2.1 MB'
        });
      }
    });
    return seed;
  });

  const saveRepoFiles = (next: BkdRepoFileItem[]) => {
    setRepoFiles(next);
    try {
      localStorage.setItem(STORAGE_KEY_BKD_REPO, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Interactive SKS Calculator State
  const [calcDosenId, setCalcDosenId] = useState<string>(dosenList[0]?.id || '');
  const [addedSimMkCodes, setAddedSimMkCodes] = useState<string[]>([]);
  const [extraAbdimasSks, setExtraAbdimasSks] = useState<number>(0);

  // Repository Upload Form State
  const [uploadDosenId, setUploadDosenId] = useState<string>(dosenList[0]?.id || '');
  const [uploadKategori, setUploadKategori] =
    useState<BkdRepoFileItem['kategori']>('Laporan Pengabdian');
  const [uploadNamaFile, setUploadNamaFile] = useState<string>('');
  const [pendingRawFile, setPendingRawFile] = useState<File | null>(null);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [driveConfirmOpen, setDriveConfirmOpen] = useState(false);
  const [pendingDeleteDriveItem, setPendingDeleteDriveItem] = useState<BkdRepoFileItem | null>(null);
  const {
    session: driveSession,
    sessionHint,
    needsRefresh: needsDriveRefresh,
    isExpiringSoon: isDriveExpiringSoon,
    tokenRemainingMinutes: driveTokenRemainingMinutes,
    isAuthenticating: isAuthenticatingDrive,
    signIn: signInDrive,
    refreshSession: refreshDriveSession,
    validateSession: validateDriveSession
  } = useDriveAuth({
    onSessionExpiredOrCleared: () => {
      setBkdDriveFiles([]);
      setBkdQuota(null);
    }
  });
  const [bkdDriveFiles, setBkdDriveFiles] = useState<GoogleDriveFileDto[]>([]);
  const [bkdQuota, setBkdQuota] = useState<DriveFolderQuotaSummary | null>(null);
  const [isFetchingBkdDrive, setIsFetchingBkdDrive] = useState(false);
  const [pdfPreviewTarget, setPdfPreviewTarget] = useState<DrivePdfPreviewTarget | null>(null);
  const [lastPickedDocs, setLastPickedDocs] = useState<PickedDriveDocument[]>([]);

  const loadBkdFolderAndQuota = React.useCallback(async (accessToken: string) => {
    setIsFetchingBkdDrive(true);
    try {
      const { snapshot, quota } = await fetchBkdDriveStorageQuota(accessToken);
      setBkdDriveFiles(snapshot.files);
      setBkdQuota(quota);
      return quota;
    } finally {
      setIsFetchingBkdDrive(false);
    }
  }, []);

  React.useEffect(() => {
    if (driveSession?.accessToken && validateDriveSession()) {
      void loadBkdFolderAndQuota(driveSession.accessToken).catch(() => {
        // silent background sync error
      });
    } else {
      setBkdDriveFiles([]);
      setBkdQuota(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveSession?.accessToken]);

  const handleAuthenticateDrive = async (): Promise<string | null> => {
    try {
      const sess = await signInDrive();
      if (!sess) return null;
      onShowToast?.(`Google Drive terhubung sebagai ${sess.userEmail}.`);
      void loadBkdFolderAndQuota(sess.accessToken).catch(() => {});
      return sess.accessToken;
    } catch (err) {
      onShowToast?.(
        err instanceof Error ? err.message : 'Gagal menghubungkan OAuth Google Drive.'
      );
      return null;
    }
  };

  const handleRefreshDriveAuthSession = async (): Promise<string | null> => {
    try {
      const sess = await refreshDriveSession();
      if (!sess) return null;
      onShowToast?.(`Token OAuth Google Drive diperbarui untuk ${sess.userEmail}.`);
      void loadBkdFolderAndQuota(sess.accessToken).catch(() => {});
      return sess.accessToken;
    } catch (err) {
      onShowToast?.(
        err instanceof Error ? err.message : 'Gagal memperbarui token OAuth Google Drive.'
      );
      return null;
    }
  };

  const handleAttachPickedDriveFiles = (pickedDocs: PickedDriveDocument[]) => {
    const targetDosen = dosenList.find(d => d.id === uploadDosenId) || dosenList[0];
    if (!targetDosen || pickedDocs.length === 0) return;

    const nowDate = new Date().toISOString().slice(0, 10);
    const attachedItems: BkdRepoFileItem[] = pickedDocs.map((doc, idx) => ({
      id: `bkd-picker-${doc.id}-${Date.now()}-${idx}`,
      dosenId: targetDosen.id,
      dosenNama: targetDosen.namaLengkap,
      nidn: targetDosen.nidn,
      kategori: uploadKategori,
      namaFile: doc.name,
      tanggalUnggah: doc.lastEditedUtc
        ? new Date(doc.lastEditedUtc).toISOString().slice(0, 10)
        : nowDate,
      semester: '2025/2026 Ganjil',
      ukuran: doc.sizeBytes ? formatStorageBytes(doc.sizeBytes) : 'Google Drive',
      driveLink: doc.url,
      driveFileId: doc.id,
      mimeType: doc.mimeType,
      source: 'DRIVE_PICKER'
    }));

    const pickedIds = new Set(pickedDocs.map(d => d.id));
    const remainingExisting = repoFiles.filter(
      existing =>
        !(
          existing.dosenId === targetDosen.id &&
          existing.driveFileId &&
          pickedIds.has(existing.driveFileId)
        )
    );

    saveRepoFiles([...attachedItems, ...remainingExisting]);
    setLastPickedDocs(pickedDocs);

    logKaprodiActivity({
      category: 'SYNC_WORKSPACE',
      actionTitle: `Lampirkan ${pickedDocs.length} Berkas BKD via Google Drive Picker`,
      detail: `${pickedDocs.map(d => d.name).join(', ')} (${uploadKategori}) untuk ${targetDosen.namaLengkap}.`,
      actor: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id
    });

    onShowToast?.(
      `${pickedDocs.length} dokumen Google Drive berhasil dilampirkan ke ${targetDosen.namaLengkap} (${uploadKategori}).`
    );
  };

  const handleRefreshBkdDriveFiles = async () => {
    if (!driveSession || !validateDriveSession()) return;
    try {
      const quota = await loadBkdFolderAndQuota(driveSession.accessToken);
      onShowToast?.(
        `Kuota folder Bukti BKD Dosen diperbarui: ${quota.fileCount} berkas (${formatStorageBytes(quota.folderUsedBytes)}).`
      );
    } catch (err) {
      onShowToast?.(
        err instanceof Error ? err.message : 'Gagal memperbarui kuota folder Google Drive.'
      );
    }
  };

  // Auto BAP PDF Generator State
  const [bapDosenId, setBapDosenId] = useState<string>(dosenList[0]?.id || '');
  const [bapPertemuanKe, setBapPertemuanKe] = useState<number>(8);
  const [bapTopik, setBapTopik] = useState<string>(
    'Evaluasi Tengah Semester & Review Capaian CPMK Perkuliahan'
  );
  const [bapTtdNama, setBapTtdNama] = useState<string>(selectedProdi.kaprodi);
  const [bapSignatureSigned, setBapSignatureSigned] = useState<boolean>(true);
  const [isBapModalOpen, setIsBapModalOpen] = useState(false);
  const bapPrintRef = useRef<HTMLDivElement>(null);

  // 1. Auto-calculate Mengajar + Bimbingan TA/KP + Pengabdian Masyarakat per Lecturer (Enforce 12-16 SKS)
  const workloadBreakdown = useMemo(() => {
    return dosenList.map((d, idx) => {
      const sksMengajar = Number(d.totalSksMengajar || 0);
      const sksBimbingan = Number((d.jumlahMahasiswaBimbingan * 0.25).toFixed(1));
      const sksPengabdian = Number((1.0 + (idx % 3) * 0.5).toFixed(1));
      const totalSks = Number((sksMengajar + sksBimbingan + sksPengabdian).toFixed(1));
      const status: 'IDEAL' | 'OVERLOAD' | 'UNDERLOAD' =
        totalSks > 16 ? 'OVERLOAD' : totalSks < 12 ? 'UNDERLOAD' : 'IDEAL';
      return {
        dosen: d,
        namaSingkat: d.namaLengkap
          .split(',')[0]
          .replace(/(Dr\.|Prof\.|Ir\.|H\.|Hj\.)\s*/g, '')
          .trim(),
        sksMengajar,
        sksBimbingan,
        sksPengabdian,
        totalSks,
        status
      };
    });
  }, [dosenList]);

  // 2. Kalkulator Beban SKS state
  const activeCalcDosen = useMemo(
    () =>
      workloadBreakdown.find(w => w.dosen.id === calcDosenId) ||
      workloadBreakdown[0] ||
      null,
    [workloadBreakdown, calcDosenId]
  );

  const simulatedExtraMkSks = useMemo(() => {
    return SIMULATED_MK_OPTIONS.filter(m => addedSimMkCodes.includes(m.kode)).reduce(
      (s, m) => s + m.sks,
      0
    );
  }, [addedSimMkCodes]);

  const simulatedTotalSks = activeCalcDosen
    ? Number((activeCalcDosen.totalSks + simulatedExtraMkSks + extraAbdimasSks).toFixed(1))
    : 0;
  const simulatedBarPercent = Math.min(100, Math.round((simulatedTotalSks / 22) * 100));

  const toggleSimulatedMk = (kode: string) => {
    setAddedSimMkCodes(prev =>
      prev.includes(kode) ? prev.filter(c => c !== kode) : [...prev, kode]
    );
  };

  // 3. Repository Upload (local & optional Google Drive)
  const executeSaveRepoFile = async (useGoogleDrive: boolean) => {
    const targetDosen = dosenList.find(d => d.id === uploadDosenId) || dosenList[0];
    if (!targetDosen) return;

    const finalName =
      pendingRawFile?.name ||
      uploadNamaFile.trim() ||
      `${uploadKategori.replace(/\s+/g, '_')}_${targetDosen.nidn}_${new Date().toISOString().slice(0, 10)}.pdf`;
    const fileSizeLabel = pendingRawFile
      ? `${Math.max(12, Math.round(pendingRawFile.size / 1024))} KB`
      : '640 KB';

    let driveLink: string | undefined;
    let driveFileId: string | undefined;
    if (useGoogleDrive && driveSession && validateDriveSession()) {
      setIsUploadingDrive(true);
      try {
        const blobOrFile =
          pendingRawFile ||
          new Blob(
            [
              `Dokumen BKD SIKAPRODI FT UNBARI\nDosen: ${targetDosen.namaLengkap}\nNIDN: ${targetDosen.nidn}\nKategori: ${uploadKategori}\nTanggal: ${new Date().toISOString()}`
            ],
            { type: 'text/plain' }
          );
        const uploaded = await uploadToBkdDriveFolder({
          file: blobOrFile,
          fileName: finalName,
          mimeType: pendingRawFile?.type || 'application/pdf',
          description: `BKD ${uploadKategori} - ${targetDosen.namaLengkap} (${selectedProdi.singkatan})`,
          accessToken: driveSession.accessToken
        });
        driveLink = uploaded.webViewLink;
        driveFileId = uploaded.id;
        setBkdDriveFiles(prev => {
          const next = [uploaded, ...prev];
          setBkdQuota(q =>
            computeBkdFolderQuotaSummary(
              q?.folderId || 'bkd-folder',
              next,
              q?.hasAccountQuota
                ? {
                    limit: q.accountLimitBytes ? String(q.accountLimitBytes) : undefined,
                    usageInDrive: q.accountUsageBytes ? String(q.accountUsageBytes) : undefined
                  }
                : null
            )
          );
          return next;
        });
      } catch (err) {
        if (onShowToast) {
          onShowToast(
            `Google Drive Upload fallback ke penyimpanan lokal: ${
              err instanceof Error ? err.message : 'Periksa koneksi Google'
            }`
          );
        }
      } finally {
        setIsUploadingDrive(false);
      }
    }

    const newItem: BkdRepoFileItem = {
      id: `bkd-file-${Date.now()}`,
      dosenId: targetDosen.id,
      dosenNama: targetDosen.namaLengkap,
      nidn: targetDosen.nidn,
      kategori: uploadKategori,
      namaFile: finalName,
      tanggalUnggah: new Date().toISOString().slice(0, 10),
      semester: '2025/2026 Ganjil',
      ukuran: fileSizeLabel,
      driveLink,
      driveFileId
    };

    saveRepoFiles([newItem, ...repoFiles]);
    setUploadNamaFile('');
    setPendingRawFile(null);

    logKaprodiActivity({
      category: driveLink ? 'SYNC_WORKSPACE' : 'EXPORT_DOKUMEN',
      actionTitle: `Unggah Berkas BKD (${uploadKategori})`,
      detail: `${finalName} untuk ${targetDosen.namaLengkap}${driveLink ? ' (Tersinkron Google Drive)' : ''}.`,
      actor: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id
    });

    if (onShowToast) {
      onShowToast(
        driveLink
          ? `Berkas "${finalName}" berhasil diunggah ke Google Drive & Repository BKD.`
          : `Berkas "${finalName}" tersimpan ke Repository Berkas Dosen.`
      );
    }
  };

  // Plagiarism scan for BKD documents
  const handleRunPlagiarismScan = (fileId: string) => {
    const target = repoFiles.find(f => f.id === fileId);
    if (!target) return;

    const hash = target.namaFile
      .split('')
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const skor = Number(((hash % 18) + 4.2).toFixed(1));
    const isWarn = skor >= 15;

    const updated = repoFiles.map(f =>
      f.id === fileId
        ? {
            ...f,
            statusPlagiarisme: {
              skorPersen: skor,
              status: (isWarn ? 'PERINGATAN' : 'AMAN') as 'AMAN' | 'PERINGATAN',
              catatan: isWarn
                ? `Indeks kemiripan ${skor}% mendekati ambang batas 15–20%. Periksa kutipan & lampiran RPS/PKM.`
                : `Lolos uji kesamaan naskah (${skor}% < ambang batas 15%). Layak divalidasi Kaprodi.`,
              checkedAt: new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          }
        : f
    );
    saveRepoFiles(updated);

    if (onShowToast) {
      onShowToast(
        `Cek Plagiarisme "${target.namaFile}": Skor Kemiripan ${skor}% (${
          isWarn ? 'Perlu Review' : 'Aman'
        }).`
      );
    }
  };

  const executeDeleteRepoFile = async (target: BkdRepoFileItem, alsoDeleteFromDrive: boolean) => {
    if (alsoDeleteFromDrive && target.driveFileId && driveSession && validateDriveSession()) {
      try {
        await deleteDriveFile(target.driveFileId, driveSession.accessToken);
        setBkdDriveFiles(prev => {
          const next = prev.filter(f => f.id !== target.driveFileId);
          setBkdQuota(q =>
            computeBkdFolderQuotaSummary(
              q?.folderId || 'bkd-folder',
              next,
              q?.hasAccountQuota
                ? {
                    limit: q.accountLimitBytes ? String(q.accountLimitBytes) : undefined,
                    usageInDrive: q.accountUsageBytes ? String(q.accountUsageBytes) : undefined
                  }
                : null
            )
          );
          return next;
        });
      } catch (err) {
        onShowToast?.(
          err instanceof Error ? err.message : 'Berkas lokal dihapus, namun gagal menghapus salinan Google Drive.'
        );
      }
    }
    saveRepoFiles(repoFiles.filter(f => f.id !== target.id));
    logKaprodiActivity({
      category: 'PENGHAPUSAN_DATA',
      actionTitle: `Hapus Berkas BKD: ${target.namaFile}`,
      detail: `Berkas ${target.kategori} milik ${target.dosenNama} dihapus dari Repository BKD${
        alsoDeleteFromDrive && target.driveFileId ? ' & Google Drive' : ''
      }.`,
      actor: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      severity: 'critical'
    });
  };

  const handleDeleteRepoFile = (fileId: string) => {
    const target = repoFiles.find(f => f.id === fileId);
    if (!target) return;
    if (
      target.driveFileId &&
      target.source !== 'DRIVE_PICKER' &&
      driveSession &&
      validateDriveSession()
    ) {
      setPendingDeleteDriveItem(target);
      return;
    }
    void executeDeleteRepoFile(target, false);
  };

  // 4. Auto-generated BAP PDF & Auto-save into Repository
  const selectedBapDosen = useMemo(
    () => dosenList.find(d => d.id === bapDosenId) || dosenList[0] || null,
    [dosenList, bapDosenId]
  );

  const selectedBapJadwal = useMemo(() => {
    if (!selectedBapDosen) return null;
    return (
      jadwalList.find(j => j.dosenNidn === selectedBapDosen.nidn) || jadwalList[0] || null
    );
  }, [jadwalList, selectedBapDosen]);

  const handleSaveAndPrintBapPdf = () => {
    if (!selectedBapDosen) return;
    const mkKode = selectedBapJadwal?.kodeMK || 'FT-MK';
    const mkNama = selectedBapJadwal?.namaMK || 'Perkuliahan Reguler Prodi';
    const fileName = `BAP_P${bapPertemuanKe}_${mkKode}_${selectedBapDosen.nidn}.pdf`;

    const bapFile: BkdRepoFileItem = {
      id: `bkd-bap-${Date.now()}`,
      dosenId: selectedBapDosen.id,
      dosenNama: selectedBapDosen.namaLengkap,
      nidn: selectedBapDosen.nidn,
      kategori: 'BAP Perkuliahan',
      namaFile: fileName,
      tanggalUnggah: new Date().toISOString().slice(0, 10),
      semester: '2025/2026 Ganjil',
      ukuran: '310 KB'
    };

    saveRepoFiles([bapFile, ...repoFiles]);
    logKaprodiActivity({
      category: 'VALIDASI_BAP',
      actionTitle: `Cetak & Arsip Otomatis BAP Pertemuan ${bapPertemuanKe}`,
      detail: `BAP ${mkNama} (${selectedBapDosen.namaLengkap}) ditandatangani digital oleh ${bapTtdNama} dan diarsipkan ke Repository Berkas Dosen.`,
      actor: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id
    });

    printDocumentElement(bapPrintRef.current, {
      documentTitle: `BAP_${mkKode}_P${bapPertemuanKe}_${selectedBapDosen.namaLengkap}`
    });

    if (onShowToast) {
      onShowToast(
        `PDF BAP berhasil dicetak & otomatis disimpan ke Repository Berkas Dosen (${fileName}).`
      );
    }
  };

  // 5. Next Semester Workload Projection (historical growth + planned MK)
  const projectionRows = useMemo(() => {
    return workloadBreakdown.map((w, idx) => {
      const pertumbuhanKelas = idx % 2 === 0 ? 2 : -1;
      const proyeksiKuliah = Math.max(8, Number((w.sksMengajar + pertumbuhanKelas).toFixed(1)));
      const proyeksiTotal = Number(
        (proyeksiKuliah + w.sksBimbingan + w.sksPengabdian).toFixed(1)
      );
      const statusProyeksi =
        proyeksiTotal > 16 ? 'Risiko Overload (>16)' : proyeksiTotal < 12 ? 'Kurang (<12)' : 'Seimbang (12–16)';
      return {
        ...w,
        proyeksiKuliah,
        proyeksiTotal,
        delta: Number((proyeksiTotal - w.totalSks).toFixed(1)),
        statusProyeksi
      };
    });
  }, [workloadBreakdown]);

  // 6 & 7. Audit Periodik (3 bulan) + Audit Kelengkapan Berkas + Kirim Reminder WA
  const completenessAuditRows = useMemo(() => {
    const requiredCategories: BkdRepoFileItem['kategori'][] = [
      'SK Mengajar',
      'RPS',
      'Laporan Pengabdian'
    ];
    return dosenList.map((d, idx) => {
      const files = repoFiles.filter(f => f.dosenId === d.id);
      const presentCats = new Set(files.map(f => f.kategori));
      const missing = requiredCategories.filter(cat => !presentCats.has(cat));
      const realisasi3Bulan = Math.min(100, 82 + ((idx * 5) % 18));
      const targetIkuTriwulan = 90;
      const phoneDigits = `62812740${String(11000 + idx * 137).slice(-5)}`;
      const waText = encodeURIComponent(
        `Assalamualaikum Wr. Wb. Yth. ${d.namaLengkap}, mohon kesediaan Bapak/Ibu melengkapi berkas BKD (${missing.join(', ')}) di portal SIKAPRODI FT UNBARI sebelum batas pelaporan LLDIKTI. Terima kasih. — Kaprodi ${selectedProdi.singkatan}`
      );
      return {
        dosen: d,
        uploadedCount: files.length,
        missing,
        isComplete: missing.length === 0,
        realisasi3Bulan,
        targetIkuTriwulan,
        waUrl: `https://wa.me/${phoneDigits}?text=${waText}`
      };
    });
  }, [dosenList, repoFiles, selectedProdi.singkatan]);

  return (
    <div className="space-y-5">
      {/* Sub-navigation Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Analisis Beban Terpadu, Kalkulator SKS, Repository &amp; Audit Kelengkapan BKD
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cakupan: {prodiLabel} · Standar Pemantauan Beban 12–16 SKS (Mengajar + Bimbingan TA/KP + Pengabdian Masyarakat)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setSubPanel('analisis_kalkulator')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
              subPanel === 'analisis_kalkulator'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analisis &amp; Kalkulator SKS
          </button>
          <button
            type="button"
            onClick={() => setSubPanel('repository_bap')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
              subPanel === 'repository_bap'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Repository, Plagiarisme &amp; BAP PDF
          </button>
          <button
            type="button"
            onClick={() => setSubPanel('proyeksi_audit')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
              subPanel === 'proyeksi_audit'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Proyeksi &amp; Audit Kelengkapan (WA)
          </button>
        </div>
      </div>

      {/* PANEL 1: ANALISIS BEBAN KERJA + KALKULATOR SKS INTERAKTIF */}
      {subPanel === 'analisis_kalkulator' && (
        <div className="space-y-5">
          {/* Stacked BarChart: Mengajar + Bimbingan TA/KP + Pengabdian */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Analisis Beban Kerja Dosen (Mengajar + Bimbingan TA/KP + Pengabdian Masyarakat)
                </h3>
                <p className="text-xs text-slate-500">
                  Komposisi beban tri-dharma per semester dengan batas regulasi minimal 12 SKS dan maksimal 16 SKS.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Ambang: 12–16 SKS/Smstr
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={workloadBreakdown} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="namaSingkat" tick={{ fontSize: 10, fill: '#475569' }} interval={0} />
                  <YAxis domain={[0, 22]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '0.75rem',
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={16} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Maks 16 SKS', fill: '#dc2626', fontSize: 10 }} />
                  <ReferenceLine y={12} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Min 12 SKS', fill: '#059669', fontSize: 10 }} />
                  <Bar dataKey="sksMengajar" stackId="a" name="Mengajar (SKS)" fill="#065f46" />
                  <Bar dataKey="sksBimbingan" stackId="a" name="Bimbingan TA/KP" fill="#0284c7" />
                  <Bar dataKey="sksPengabdian" stackId="a" name="Pengabdian Masyarakat" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive SKS Calculator */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Kalkulator Simulasi Penambahan Beban SKS Dosen
                  </h3>
                  <p className="text-xs text-slate-500">
                    Simulasikan penambahan mata kuliah &amp; pengabdian per dosen untuk mendeteksi potensi overload &gt;16 SKS sebelum pengesahan SK Mengajar.
                  </p>
                </div>
              </div>

              <select
                value={calcDosenId}
                onChange={e => setCalcDosenId(e.target.value)}
                className="text-xs font-semibold border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-800"
              >
                {workloadBreakdown.map(w => (
                  <option key={w.dosen.id} value={w.dosen.id}>
                    {w.dosen.namaLengkap} (Dasar: {w.totalSks} SKS)
                  </option>
                ))}
              </select>
            </div>

            {activeCalcDosen && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-3">
                  <div className="text-xs font-bold text-slate-700">
                    Pilih Mata Kuliah Tambahan untuk Simulasi:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SIMULATED_MK_OPTIONS.map(mk => {
                      const checked = addedSimMkCodes.includes(mk.kode);
                      return (
                        <button
                          key={mk.kode}
                          type="button"
                          onClick={() => toggleSimulatedMk(mk.kode)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            checked
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                              : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="font-mono">{mk.kode}</span>
                            <span className="font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200">
                              +{mk.sks} SKS
                            </span>
                          </div>
                          <div className="text-xs font-medium mt-1">{mk.nama}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <span className="font-semibold text-slate-700">
                      Tambahan SKS Pengabdian / Tim Peneliti:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExtraAbdimasSks(s => Math.max(0, Number((s - 0.5).toFixed(1))))}
                        className="px-2.5 py-1 rounded bg-white border border-slate-300 font-bold cursor-pointer"
                      >
                        -0.5
                      </button>
                      <span className="font-mono font-bold w-14 text-center">{extraAbdimasSks} SKS</span>
                      <button
                        type="button"
                        onClick={() => setExtraAbdimasSks(s => Math.min(6, Number((s + 0.5).toFixed(1))))}
                        className="px-2.5 py-1 rounded bg-white border border-slate-300 font-bold cursor-pointer"
                      >
                        +0.5
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Total Beban Terproyeksi</span>
                      <span
                        className={`text-2xl font-black font-mono tabular-nums ${
                          simulatedTotalSks > 16
                            ? 'text-rose-700'
                            : simulatedTotalSks < 12
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {simulatedTotalSks} SKS
                      </span>
                    </div>

                    {/* Smooth Transition Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            simulatedTotalSks > 16
                              ? 'bg-rose-600'
                              : simulatedTotalSks < 12
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${simulatedBarPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>0 SKS</span>
                        <span className="text-emerald-700 font-bold">12–16 SKS (Ideal)</span>
                        <span>22 SKS</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">Beban Dasar</span>
                        <strong className="font-mono text-slate-900">{activeCalcDosen.totalSks}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">Simulasi MK</span>
                        <strong className="font-mono text-blue-700">+{simulatedExtraMkSks}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">Abdimas</span>
                        <strong className="font-mono text-amber-700">+{extraAbdimasSks}</strong>
                      </div>
                    </div>
                  </div>

                  {simulatedTotalSks > 16 ? (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>OVERLOAD ALERT (&gt;16 SKS):</strong> Kelebihan{' '}
                        <span className="font-mono font-bold">
                          +{(simulatedTotalSks - 16).toFixed(1)} SKS
                        </span>{' '}
                        melampaui batas maksimal LLDIKTI. Alihkan mata kuliah simulasi ke dosen lain yang masih di bawah 14 SKS.
                      </div>
                    </div>
                  ) : simulatedTotalSks < 12 ? (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Beban Kurang (&lt;12 SKS):</strong> Masih perlu tambahan minimal{' '}
                        <span className="font-mono font-bold">
                          {(12 - simulatedTotalSks).toFixed(1)} SKS
                        </span>{' '}
                        untuk memenuhi syarat klaim BKD.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Komposisi Optimal:</strong> Beban berada dalam rentang standar PO BKD 12–16 SKS/semester.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANEL 2: REPOSITORY BERKAS DOSEN, GOOGLE DRIVE UPLOAD, CEK PLAGIARISME & AUTO BAP PDF */}
      {subPanel === 'repository_bap' && (
        <div className="space-y-5">
          {/* Upload + Plagiarism & Drive Repo */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Repository Berkas Dosen &amp; Uji Plagiarisme Dokumen BKD
                  </h3>
                  <p className="text-xs text-slate-500">
                    Arsipkan dokumen BKD per dosen ke Google Drive atau repositori lokal, lalu jalankan pemindaian plagiarisme sebelum validasi Kaprodi.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBapModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Generate BAP Perkuliahan PDF</span>
              </button>
            </div>

            {/* Upload & Google Drive Picker Attachment Bar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-3">
                  <label className="font-semibold text-slate-700 block mb-1">Dosen Pemilik Berkas</label>
                  <select
                    value={uploadDosenId}
                    onChange={e => setUploadDosenId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {dosenList.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.namaLengkap}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Kategori Berkas</label>
                  <select
                    value={uploadKategori}
                    onChange={e => setUploadKategori(e.target.value as BkdRepoFileItem['kategori'])}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="SK Mengajar">SK Mengajar</option>
                    <option value="RPS">RPS</option>
                    <option value="BAP Perkuliahan">BAP Perkuliahan</option>
                    <option value="Laporan Pengabdian">Laporan Pengabdian</option>
                    <option value="Bukti Bimbingan">Bukti Bimbingan</option>
                    <option value="Karya Ilmiah">Karya Ilmiah</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="font-semibold text-slate-700 block mb-1">Nama File Manual (Lokal)</label>
                  <input
                    type="text"
                    value={uploadNamaFile}
                    onChange={e => setUploadNamaFile(e.target.value)}
                    placeholder="cth: Artikel_PKM_Teknik_2025.pdf"
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Unggah File Lokal</label>
                  <input
                    type="file"
                    onChange={e => {
                      const f = e.target.files?.[0] || null;
                      setPendingRawFile(f);
                      if (f && !uploadNamaFile) setUploadNamaFile(f.name);
                    }}
                    className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1.5 file:px-2 file:rounded file:border-0 file:bg-emerald-100 file:text-emerald-800 file:font-bold"
                  />
                </div>
                <div className="md:col-span-2 flex items-end gap-1.5">
                  <button
                    type="button"
                    disabled={isUploadingDrive}
                    onClick={() => {
                      if (driveSession) {
                        setDriveConfirmOpen(true);
                      } else {
                        executeSaveRepoFile(false);
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {driveSession ? (
                      <CloudUpload className="w-4 h-4" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{isUploadingDrive ? 'Mengunggah...' : 'Simpan Berkas'}</span>
                  </button>
                </div>
              </div>

              {/* Streamlined Google Drive Picker Attachment Row */}
              <div className="pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="text-[11px] text-slate-600">
                  <span className="font-bold text-[#065f46]">Lampirkan Langsung via Google Drive Picker:</span>{' '}
                  Pilih satu atau beberapa dokumen dari Google Drive untuk langsung ditautkan ke{' '}
                  <strong className="text-slate-800">
                    {dosenList.find(d => d.id === uploadDosenId)?.namaLengkap || 'Dosen'}
                  </strong>{' '}
                  ({uploadKategori}).
                </div>
                <DriveFilePicker
                  accessToken={driveSession?.accessToken ?? null}
                  needsRefresh={needsDriveRefresh}
                  isAuthenticating={isAuthenticatingDrive}
                  bkdFolderId={bkdQuota?.folderId ?? null}
                  label="Pilih Dokumen via Google Drive Picker"
                  onFilesPicked={handleAttachPickedDriveFiles}
                  onRequestSignIn={handleAuthenticateDrive}
                  onRequestRefresh={handleRefreshDriveAuthSession}
                  onError={msg => onShowToast?.(msg)}
                  className="shrink-0"
                />
              </div>

              {lastPickedDocs.length > 0 && (
                <div className="p-2.5 rounded-lg bg-[#ecfdf5] border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#065f46]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="font-bold">
                      {lastPickedDocs.length} dokumen baru dilampirkan dari Google Drive Picker:
                    </span>
                    {lastPickedDocs.slice(0, 3).map(doc => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() =>
                          setPdfPreviewTarget({
                            namaFile: doc.name,
                            driveFileId: doc.id,
                            mimeType: doc.mimeType,
                            driveLink: doc.url,
                            dosenNama:
                              dosenList.find(d => d.id === uploadDosenId)?.namaLengkap || undefined,
                            kategori: uploadKategori
                          })
                        }
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-emerald-300 hover:bg-emerald-50 text-[#065f46] font-semibold cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span className="max-w-[180px] truncate">{doc.name}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setLastPickedDocs([])}
                    className="p-1 rounded text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                    aria-label="Tutup notifikasi lampiran picker"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Direct OAuth + Folder Bukti BKD Dosen Sync & Storage Quota Visual Indicator */}
            <div className="p-4 rounded-xl bg-[#fafaf5] border border-emerald-200 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-[#ecfdf5] text-[#065f46] border border-emerald-200 shrink-0">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[#065f46]">
                      Koneksi Google Drive &amp; Pemantauan Folder Bukti BKD Dosen
                    </div>
                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-1.5">
                      <span>
                        {driveSession
                          ? `Terhubung OAuth (${driveSession.userEmail}) · ${bkdDriveFiles.length} berkas di folder Bukti BKD Dosen.`
                          : needsDriveRefresh
                          ? `Sesi Google (${sessionHint?.userEmail || 'aktif'}) menunggu pembaruan token OAuth untuk membuka Google Drive Picker.`
                          : 'Hubungkan akun Google Drive via OAuth untuk melampirkan dokumen via Picker dan memantau kuota penyimpanan cloud.'}
                      </span>
                      {driveSession && driveTokenRemainingMinutes !== null && (
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                            isDriveExpiringSoon
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-[#065f46] border-emerald-200'
                          }`}
                        >
                          TTL ~{driveTokenRemainingMinutes} mnt
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {driveSession ? (
                    <>
                      <DriveFilePicker
                        accessToken={driveSession.accessToken}
                        needsRefresh={needsDriveRefresh}
                        isAuthenticating={isAuthenticatingDrive}
                        bkdFolderId={bkdQuota?.folderId ?? null}
                        variant="secondary"
                        label="Buka Google Drive Picker"
                        onFilesPicked={handleAttachPickedDriveFiles}
                        onRequestSignIn={handleAuthenticateDrive}
                        onRequestRefresh={handleRefreshDriveAuthSession}
                        onError={msg => onShowToast?.(msg)}
                      />
                      <button
                        type="button"
                        onClick={handleRefreshBkdDriveFiles}
                        disabled={isFetchingBkdDrive}
                        className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${isFetchingBkdDrive ? 'animate-spin' : ''}`}
                        />
                        <span>{isFetchingBkdDrive ? 'Memuat...' : 'Segarkan Kuota'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRefreshDriveAuthSession}
                        disabled={isAuthenticatingDrive}
                        title="Perpanjang masa berlaku token OAuth 2.0 Google Drive"
                        className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border font-bold cursor-pointer disabled:opacity-50 ${
                          isDriveExpiringSoon
                            ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${isAuthenticatingDrive ? 'animate-spin' : ''}`}
                        />
                        <span>{isAuthenticatingDrive ? 'Memperbarui...' : 'Perpanjang Token'}</span>
                      </button>
                    </>
                  ) : needsDriveRefresh ? (
                    <button
                      type="button"
                      onClick={handleRefreshDriveAuthSession}
                      disabled={isAuthenticatingDrive}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isAuthenticatingDrive ? 'animate-spin' : ''}`}
                      />
                      <span>{isAuthenticatingDrive ? 'Memperbarui Token...' : 'Perbarui Token OAuth'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAuthenticateDrive}
                      disabled={isAuthenticatingDrive}
                      className="gsi-material-button inline-flex items-center gap-2 bg-white hover:bg-[#f8faff] text-[#1f1f1f] border border-[#747775] rounded-[4px] h-9 px-3.5 text-[13px] font-medium cursor-pointer disabled:opacity-60"
                    >
                      <span>{isAuthenticatingDrive ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Storage Quota Visual Indicator */}
              {(() => {
                const usedBytes = bkdQuota?.folderUsedBytes ?? 0;
                const quotaBytes = bkdQuota?.folderQuotaBytes ?? 2 * 1024 * 1024 * 1024;
                const pct = bkdQuota?.usagePercent ?? 0;
                const barWidth =
                  !driveSession
                    ? 0
                    : usedBytes > 0
                    ? Math.max(2, Math.min(100, pct))
                    : 0;
                const barTone =
                  pct >= 90
                    ? 'bg-rose-600'
                    : pct >= 70
                    ? 'bg-amber-500'
                    : 'bg-[#065f46]';
                const statusText =
                  !driveSession
                    ? 'Menunggu Koneksi Drive'
                    : pct >= 90
                    ? 'Kritis — Segera Arsipkan'
                    : pct >= 70
                    ? 'Perlu Pemantauan'
                    : 'Kapasitas Optimal';

                return (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span>Penggunaan Ruang Folder BKD Google Drive</span>
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                            !driveSession
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : pct >= 90
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : pct >= 70
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-[#ecfdf5] text-[#065f46] border-emerald-200'
                          }`}
                        >
                          {statusText}
                        </span>
                      </div>

                      <div className="font-mono text-slate-700 tabular-nums">
                        {driveSession ? (
                          <>
                            <strong className="text-[#065f46]">
                              {formatStorageBytes(usedBytes)}
                            </strong>{' '}
                            / {formatStorageBytes(quotaBytes)} ({pct.toFixed(1)}%)
                          </>
                        ) : (
                          <span className="text-slate-500">
                            {repoFiles.length} berkas tersimpan lokal · Hubungkan Drive untuk kuota cloud
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/70">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${barTone}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                      <span>
                        Folder: SIKAPRODI FT UNBARI / Bukti BKD Dosen (
                        {driveSession ? `${bkdQuota?.fileCount ?? bkdDriveFiles.length} berkas` : 'Offline'})
                      </span>
                      {driveSession && bkdQuota?.hasAccountQuota && (
                        <span>
                          Total Akun Drive:{' '}
                          {bkdQuota.accountUsageBytes !== null
                            ? formatStorageBytes(bkdQuota.accountUsageBytes)
                            : '—'}
                          {bkdQuota.accountLimitBytes !== null
                            ? ` / ${formatStorageBytes(bkdQuota.accountLimitBytes)}`
                            : ' (Workspace Unlimited)'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Repo Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Dokumen &amp; Pemilik</th>
                    <th className="py-3 px-3 font-semibold">Kategori</th>
                    <th className="py-3 px-3 font-semibold font-mono">Tgl / Ukuran</th>
                    <th className="py-3 px-3 font-semibold">Hasil Cek Plagiarisme</th>
                    <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {repoFiles.map(file => (
                    <tr key={file.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{file.namaFile}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span>
                            {file.dosenNama} · <span className="font-mono">{file.nidn}</span>
                          </span>
                          {file.source === 'DRIVE_PICKER' && (
                            <span className="px-1.5 py-0.5 rounded bg-[#ecfdf5] text-[#065f46] border border-emerald-200 text-[10px] font-bold">
                              Drive Picker
                            </span>
                          )}
                          {file.driveLink && (
                            <a
                              href={file.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 underline font-semibold"
                            >
                              Buka Google Drive
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-semibold">
                          {file.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {file.tanggalUnggah} · {file.ukuran}
                      </td>
                      <td className="py-3 px-3">
                        {file.statusPlagiarisme ? (
                          <div className="space-y-0.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                file.statusPlagiarisme.status === 'AMAN'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              Kemiripan {file.statusPlagiarisme.skorPersen}% ({file.statusPlagiarisme.status})
                            </span>
                            <div className="text-[10px] text-slate-500 max-w-xs">
                              {file.statusPlagiarisme.catatan}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Belum dipindai</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const matchedDrive = bkdDriveFiles.find(d => d.name === file.namaFile);
                              setPdfPreviewTarget({
                                namaFile: file.namaFile,
                                driveFileId: file.driveFileId || matchedDrive?.id,
                                mimeType: file.mimeType || matchedDrive?.mimeType || 'application/pdf',
                                driveLink: file.driveLink || matchedDrive?.webViewLink,
                                dosenNama: file.dosenNama,
                                kategori: file.kategori,
                                tanggalUnggah: file.tanggalUnggah,
                                ukuran: file.ukuran
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ecfdf5] hover:bg-emerald-100 text-[#065f46] border border-emerald-200 text-[11px] font-bold cursor-pointer"
                            title="Pratinjau Dokumen PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Pratinjau</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRunPlagiarismScan(file.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold cursor-pointer"
                          >
                            <SearchCheck className="w-3.5 h-3.5" />
                            <span>Cek Plagiarisme</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRepoFile(file.id)}
                            aria-label="Hapus berkas"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 3: PROYEKSI SEMESTER DEPAN, AUDIT PERIODIK 3 BULAN & KELENGKAPAN + WA REMINDER */}
      {subPanel === 'proyeksi_audit' && (
        <div className="space-y-5">
          {/* Proyeksi Beban Semester Depan */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start gap-2.5">
              <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Proyeksi Beban Mengajar Semester Depan (Berbasis Historis Pendaftaran &amp; Kurikulum)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Estimasi distribusi SKS dosen untuk semester mendatang berdasarkan proyeksi kelas baru &amp; kapasitas angkatan aktif.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Nama Dosen</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Saat Ini</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Proyeksi Kuliah</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Total Proyeksi</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Selisih</th>
                    <th className="py-3 px-4 font-semibold">Status Kesiapan Semester Depan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectionRows.map(row => (
                    <tr key={row.dosen.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.dosen.namaLengkap}</td>
                      <td className="py-3 px-3 text-right font-mono">{row.totalSks} SKS</td>
                      <td className="py-3 px-3 text-right font-mono">{row.proyeksiKuliah} SKS</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {row.proyeksiTotal} SKS
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {row.delta > 0 ? `+${row.delta}` : row.delta}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[11px] font-bold ${
                            row.proyeksiTotal > 16
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : row.proyeksiTotal < 12
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {row.statusProyeksi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Periodik 3 Bulan & Audit Kelengkapan Berkas + Kirim Reminder WA */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start gap-2.5">
              <ClipboardCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Audit Periodik BKD (Triwulan 3-Bulan) &amp; Kelengkapan Berkas + Reminder WhatsApp
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ringkasan realisasi log pengajaran 3 bulan terhadap target IKU triwulanan (90%) serta daftar dosen yang belum melengkapi dokumen minimal BKD.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Dosen</th>
                    <th className="py-3 px-3 font-semibold text-right font-mono">Log 3-Bulan vs IKU (90%)</th>
                    <th className="py-3 px-3 font-semibold text-center font-mono">Berkas Terunggah</th>
                    <th className="py-3 px-3 font-semibold">Dokumen Belum Lengkap</th>
                    <th className="py-3 px-4 font-semibold text-right">Tindakan Reminder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completenessAuditRows.map(item => (
                    <tr
                      key={item.dosen.id}
                      className={item.isComplete ? 'hover:bg-slate-50/80' : 'bg-amber-50/35 hover:bg-amber-50/60'}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.dosen.namaLengkap}</div>
                        <div className="text-[11px] font-mono text-slate-500">NIDN: {item.dosen.nidn}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span
                          className={
                            item.realisasi3Bulan >= item.targetIkuTriwulan
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }
                        >
                          {item.realisasi3Bulan}% / {item.targetIkuTriwulan}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {item.uploadedCount} File
                      </td>
                      <td className="py-3 px-3">
                        {item.isComplete ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Lengkap
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {item.missing.map(m => (
                              <span
                                key={m}
                                className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold"
                              >
                                Kurang: {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.isComplete ? (
                          <span className="text-[11px] text-slate-400">Tidak perlu pengingat</span>
                        ) : (
                          <a
                            href={item.waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              logKaprodiActivity({
                                category: 'VALIDASI_BAP',
                                actionTitle: `Kirim Reminder WA BKD ke ${item.dosen.namaLengkap}`,
                                detail: `Pengingat melengkapi berkas (${item.missing.join(', ')}) via WhatsApp.`,
                                actor: `Kaprodi ${selectedProdi.singkatan}`,
                                prodiId: selectedProdi.id,
                                severity: 'warning'
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Kirim Reminder WA</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AUTO-GENERATED BAP PDF */}
      {isBapModalOpen && selectedBapDosen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-slate-300 uppercase">
                  Auto-Generated Berita Acara Perkuliahan (BAP) &amp; Tanda Tangan Digital
                </div>
                <h3 className="text-base font-bold mt-0.5">
                  Pratinjau PDF BAP — {selectedBapDosen.namaLengkap}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBapModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dosen Pengampu</label>
                <select
                  value={bapDosenId}
                  onChange={e => setBapDosenId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  {dosenList.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.namaLengkap}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pertemuan Ke-</label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={bapPertemuanKe}
                  onChange={e => setBapPertemuanKe(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Topik / Materi BAP</label>
                <input
                  type="text"
                  value={bapTopik}
                  onChange={e => setBapTopik(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Penandatangan Digital</label>
                <input
                  type="text"
                  value={bapTtdNama}
                  onChange={e => setBapTtdNama(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100">
              <div
                ref={bapPrintRef}
                className="bg-white p-8 shadow-sm border border-slate-200 mx-auto max-w-[210mm] text-slate-900 font-serif"
              >
                <StandardKopSurat
                  prodiName={`PROGRAM STUDI ${selectedProdi.nama.toUpperCase()} (${selectedProdi.jenjang})`}
                  subTitle="BERITA ACARA PERKULIAHAN (BAP) & VERIFIKASI BKD RESMI"
                  showQrCode={true}
                  qrCodeUrl={`https://ft.unbari.ac.id/verify/BAP-${selectedBapDosen.nidn}-P${bapPertemuanKe}`}
                  qrBadgeText="BAP DIGITAL"
                />

                <div className="text-center mb-5">
                  <h4 className="text-sm font-bold uppercase tracking-wide underline">
                    BERITA ACARA PELAKSANAAN PERKULIAHAN
                  </h4>
                  <p className="text-xs font-sans mt-1">
                    Nomor Dokumen: BAP/{selectedProdi.id}/{new Date().getFullYear()}/P-{bapPertemuanKe}
                  </p>
                </div>

                <table className="w-full border-collapse border border-slate-800 text-xs font-sans mb-6">
                  <tbody>
                    <tr>
                      <td className="border border-slate-800 px-3 py-2 font-bold w-1/3 bg-slate-50">
                        Mata Kuliah / Kode
                      </td>
                      <td className="border border-slate-800 px-3 py-2">
                        {selectedBapJadwal
                          ? `${selectedBapJadwal.kodeMK} — ${selectedBapJadwal.namaMK} (${selectedBapJadwal.kelas})`
                          : 'Perkuliahan Wajib Program Studi'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 px-3 py-2 font-bold bg-slate-50">
                        Dosen Pengampu / NIDN
                      </td>
                      <td className="border border-slate-800 px-3 py-2">
                        {selectedBapDosen.namaLengkap} (NIDN: {selectedBapDosen.nidn})
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 px-3 py-2 font-bold bg-slate-50">
                        Pertemuan &amp; Waktu
                      </td>
                      <td className="border border-slate-800 px-3 py-2">
                        Pertemuan ke-{bapPertemuanKe} · {selectedBapJadwal?.hari || 'Senin'},{' '}
                        {selectedBapJadwal?.jamMulai || '08:00'}–{selectedBapJadwal?.jamSelesai || '10:30'} WIB (
                        {selectedBapJadwal?.ruanganNama || 'Ruang Kuliah FT'})
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 px-3 py-2 font-bold bg-slate-50">
                        Pokok Bahasan / RPS
                      </td>
                      <td className="border border-slate-800 px-3 py-2">{bapTopik}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-800 px-3 py-2 font-bold bg-slate-50">
                        Status Validasi Kaprodi
                      </td>
                      <td className="border border-slate-800 px-3 py-2 font-bold text-emerald-800">
                        {bapSignatureSigned
                          ? `Terverifikasi & Ditandatangani Secara Digital (${bapTtdNama})`
                          : 'Menunggu Tanda Tangan'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex items-end justify-between text-xs font-sans pt-4">
                  <div className="flex items-center gap-3">
                    <QrCodeSvg
                      value={`BAP-SAH|${selectedBapDosen.nidn}|P${bapPertemuanKe}|${bapTtdNama}`}
                      size={68}
                    />
                    <div className="text-[10px] text-slate-600 max-w-xs">
                      Dokumen ini dilengkapi segel tanda tangan digital otentik SIKAPRODI FT UNBARI dan otomatis diarsipkan pada Repository Berkas Dosen.
                    </div>
                  </div>
                  <div className="text-right">
                    <p>
                      Jambi,{' '}
                      {new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="font-bold mt-1">Ketua Program Studi {selectedProdi.singkatan}</p>
                    <div className="h-12 flex items-center justify-end italic text-emerald-800 font-semibold">
                      [Signed Digitally by {bapTtdNama}]
                    </div>
                    <p className="font-bold underline">{selectedProdi.kaprodi}</p>
                    <p className="text-[11px] font-mono">NIDN/NUPTK: {selectedProdi.nipKaprodi}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bapSignatureSigned}
                  onChange={e => setBapSignatureSigned(e.target.checked)}
                />
                <span>Bubuhkan Tanda Tangan Digital &amp; Segel QR</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBapModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPrintBapPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Simpan ke Repository &amp; Cetak PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Google Drive Upload */}
      <WorkspaceMutationConfirmDialog
        isOpen={driveConfirmOpen}
        title="Konfirmasi Unggah Berkas BKD ke Google Drive"
        description={`Dokumen kategori "${uploadKategori}" akan diunggah ke folder "SIKAPRODI FT UNBARI / Bukti BKD Dosen" pada akun Google Drive ${
          driveSession?.userEmail || 'terhubung'
        } dan dicatat ke Repository Berkas Dosen.`}
        actionLabel="Unggah ke Google Drive"
        onCancel={() => {
          setDriveConfirmOpen(false);
          executeSaveRepoFile(false);
        }}
        onConfirm={() => {
          setDriveConfirmOpen(false);
          executeSaveRepoFile(true);
        }}
      />

      <WorkspaceMutationConfirmDialog
        isOpen={Boolean(pendingDeleteDriveItem)}
        title="Hapus Berkas BKD Terhubung Google Drive?"
        description={`Berkas "${pendingDeleteDriveItem?.namaFile || ''}" tersimpan di Google Drive. Apakah Anda ingin menghapusnya dari Repository BKD sekaligus menghapus file di Google Drive?`}
        actionLabel="Hapus Lokal & Google Drive"
        onCancel={() => setPendingDeleteDriveItem(null)}
        onConfirm={() => {
          const item = pendingDeleteDriveItem;
          setPendingDeleteDriveItem(null);
          if (item) void executeDeleteRepoFile(item, true);
        }}
      />

      {/* Embedded PDF Viewer Modal for Google Drive BKD Evidence */}
      <DrivePdfPreviewModal
        isOpen={Boolean(pdfPreviewTarget)}
        file={pdfPreviewTarget}
        accessToken={driveSession?.accessToken ?? null}
        onClose={() => setPdfPreviewTarget(null)}
        onRequestSignIn={() => void handleAuthenticateDrive()}
      />
    </div>
  );
};
