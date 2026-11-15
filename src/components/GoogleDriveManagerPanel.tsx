import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CloudUpload,
  Download,
  ExternalLink,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderPlus,
  HardDrive,
  Image as ImageIcon,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Upload
} from 'lucide-react';
import { Dosen, ProgramStudiInfo } from '../types/index';
import {
  createDriveFolder,
  deleteDriveFile,
  downloadDriveFile,
  fetchAcademicDocDriveFiles,
  fetchAccreditationDriveFiles,
  fetchBkdDriveFiles,
  getOrCreateKaprodiFolders,
  GoogleDriveFileDto,
  listDriveFiles,
  renameDriveFile,
  SikaprodiDriveFolderTree,
  uploadToAcademicDocDriveFolder,
  uploadToAccreditationDriveFolder,
  uploadToBkdDriveFolder,
  WorkspaceAuthSession
} from '../utils/driveService';
import { WorkspaceMutationConfirmDialog } from './GoogleWorkspaceSignInCard';
import { logKaprodiActivity } from '../utils/activityLogHelper';

interface GoogleDriveManagerPanelProps {
  session: WorkspaceAuthSession | null;
  isSigningIn: boolean;
  onSignIn: () => void;
  selectedProdi: ProgramStudiInfo;
  dosenList: Dosen[];
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

type DriveCategoryFilter = 'ALL' | 'AKADEMIK' | 'BKD' | 'AKREDITASI';

const BKD_REPO_STORAGE_KEY = 'sikaprodi_v15_bkd_repo_files';

function formatBytes(sizeStr?: string): string {
  if (!sizeStr) return '—';
  const bytes = Number(sizeStr);
  if (isNaN(bytes) || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDriveDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderFileIcon(mimeType: string) {
  if (mimeType === 'application/vnd.google-apps.folder') {
    return <Folder className="w-4 h-4 text-amber-600 shrink-0" />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />;
  }
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="w-4 h-4 text-sky-700 shrink-0" />;
  }
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) {
    return <FileText className="w-4 h-4 text-rose-700 shrink-0" />;
  }
  return <File className="w-4 h-4 text-slate-600 shrink-0" />;
}

export const GoogleDriveManagerPanel: React.FC<GoogleDriveManagerPanelProps> = ({
  session,
  isSigningIn,
  onSignIn,
  selectedProdi,
  dosenList,
  onShowToast
}) => {
  const [files, setFiles] = useState<GoogleDriveFileDto[]>([]);
  const [folderTree, setFolderTree] = useState<SikaprodiDriveFolderTree | null>(null);
  const [activeFolderFilter, setActiveFolderFilter] = useState<DriveCategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Upload form states
  const [uploadCategory, setUploadCategory] = useState<'AKADEMIK' | 'BKD' | 'AKREDITASI'>('BKD');
  const [uploadDosenId, setUploadDosenId] = useState<string>(dosenList[0]?.id || '');
  const [uploadBkdKategori, setUploadBkdKategori] = useState<
    'SK Mengajar' | 'RPS' | 'BAP Perkuliahan' | 'Laporan Pengabdian' | 'Bukti Bimbingan' | 'Karya Ilmiah'
  >('BAP Perkuliahan');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [selectedLocalFile, setSelectedLocalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New folder modal / inline state
  const [newFolderName, setNewFolderName] = useState<string>('');

  // Inline rename state
  const [renamingFile, setRenamingFile] = useState<GoogleDriveFileDto | null>(null);
  const [renameDraft, setRenameDraft] = useState<string>('');

  // Mandatory confirmation dialog state for mutating/destructive Drive API actions
  const [confirmState, setConfirmState] = useState<{
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const loadDriveFiles = useCallback(
    async (explicitFilter?: DriveCategoryFilter, explicitTree?: SikaprodiDriveFolderTree | null) => {
      if (!session?.accessToken) return;
      const filterToUse = explicitFilter ?? activeFolderFilter;
      const queryText = searchQuery.trim() || undefined;
      setIsLoadingFiles(true);
      try {
        if (filterToUse === 'BKD') {
          const snap = await fetchBkdDriveFiles(queryText, session.accessToken);
          setFolderTree(snap.folders);
          setFiles(snap.files);
        } else if (filterToUse === 'AKREDITASI') {
          const snap = await fetchAccreditationDriveFiles(queryText, session.accessToken);
          setFolderTree(snap.folders);
          setFiles(snap.files);
        } else if (filterToUse === 'AKADEMIK') {
          const snap = await fetchAcademicDocDriveFiles(queryText, session.accessToken);
          setFolderTree(snap.folders);
          setFiles(snap.files);
        } else {
          const targetFolderId = explicitTree ? undefined : undefined;
          const list = await listDriveFiles({
            folderId: targetFolderId,
            query: queryText,
            pageSize: 60,
            accessToken: session.accessToken
          });
          setFiles(list);
        }
      } catch (err) {
        onShowToast(
          err instanceof Error ? err.message : 'Gagal memuat daftar berkas Google Drive.',
          'error'
        );
      } finally {
        setIsLoadingFiles(false);
      }
    },
    [session?.accessToken, activeFolderFilter, searchQuery, onShowToast]
  );

  const resolveFolderIdForFilter = (
    filter: DriveCategoryFilter,
    tree: SikaprodiDriveFolderTree | null
  ): string | undefined => {
    if (!tree || filter === 'ALL') return undefined;
    if (filter === 'AKADEMIK') return tree.akademikId;
    if (filter === 'BKD') return tree.bkdId;
    return tree.akreditasiId;
  };

  useEffect(() => {
    if (!session?.accessToken) {
      setFiles([]);
      setFolderTree(null);
      return;
    }
    loadDriveFiles(activeFolderFilter, folderTree);
  }, [session?.accessToken, activeFolderFilter, loadDriveFiles]);

  const handleInitFolders = () => {
    if (!session?.accessToken) return;
    setConfirmState({
      title: 'Inisialisasi Struktur Folder SIKAPRODI FT UNBARI di Google Drive',
      description:
        'Akan membuat folder induk "SIKAPRODI FT UNBARI" beserta sub-folder "Dokumentasi Akademik", "Bukti BKD Dosen", dan "Audit Mutu & Akreditasi" jika belum ada di Google Drive Anda.',
      actionLabel: 'Siapkan Struktur Folder',
      onConfirm: async () => {
        setConfirmState(null);
        setIsLoadingFiles(true);
        try {
          const tree = await getOrCreateKaprodiFolders(session.accessToken, true);
          setFolderTree(tree);
          logKaprodiActivity({
            actor: session.displayName,
            role: 'Admin Google Workspace',
            prodiId: selectedProdi.id,
            category: 'SYNC_WORKSPACE',
            actionTitle: 'Inisialisasi Folder Google Drive FT UNBARI',
            detail: 'Struktur folder Dokumentasi Akademik, Bukti BKD Dosen & Audit Akreditasi disiapkan di Google Drive.',
            severity: 'info'
          });
          onShowToast('Struktur folder SIKAPRODI FT UNBARI siap di Google Drive!', 'success');
          await loadDriveFiles(activeFolderFilter, tree);
        } catch (err) {
          onShowToast(
            err instanceof Error ? err.message : 'Gagal menyiapkan struktur folder Google Drive.',
            'error'
          );
        } finally {
          setIsLoadingFiles(false);
        }
      }
    });
  };

  const handleCreateCustomFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || !newFolderName.trim()) return;
    const targetName = newFolderName.trim();
    const parentId = resolveFolderIdForFilter(activeFolderFilter, folderTree) || folderTree?.rootId;

    setConfirmState({
      title: `Buat Folder Baru "${targetName}" di Google Drive`,
      description: `Folder baru akan dibuat di Google Drive akun ${session.userEmail}.`,
      actionLabel: 'Buat Folder',
      onConfirm: async () => {
        setConfirmState(null);
        try {
          await createDriveFolder(
            targetName,
            parentId,
            `Folder arsip ${selectedProdi.nama}`,
            session.accessToken
          );
          setNewFolderName('');
          logKaprodiActivity({
            actor: session.displayName,
            role: 'Admin Google Workspace',
            prodiId: selectedProdi.id,
            category: 'SYNC_WORKSPACE',
            actionTitle: `Buat Folder Drive "${targetName}"`,
            detail: `Membuat folder arsip "${targetName}" pada Google Drive FT UNBARI.`,
            severity: 'info'
          });
          onShowToast(`Folder "${targetName}" berhasil dibuat di Google Drive.`, 'success');
          await loadDriveFiles(activeFolderFilter, folderTree);
        } catch (err) {
          onShowToast(
            err instanceof Error ? err.message : 'Gagal membuat folder di Google Drive.',
            'error'
          );
        }
      }
    });
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || !selectedLocalFile) {
      onShowToast('Pilih berkas lokal terlebih dahulu sebelum mengunggah.', 'info');
      return;
    }

    const fileObj = selectedLocalFile;
    const categoryLabel =
      uploadCategory === 'BKD'
        ? 'Bukti BKD Dosen'
        : uploadCategory === 'AKADEMIK'
        ? 'Dokumentasi Akademik'
        : 'Audit Mutu & Akreditasi';
    const targetDosen = dosenList.find(d => d.id === uploadDosenId) || dosenList[0];

    setConfirmState({
      title: `Konfirmasi Unggah Berkas ke Google Drive (${categoryLabel})`,
      description: `Berkas "${fileObj.name}" (${formatBytes(
        String(fileObj.size)
      )}) akan diunggah ke folder ${categoryLabel} pada akun Google Drive ${session.userEmail}.`,
      actionLabel: 'Unggah ke Google Drive',
      onConfirm: async () => {
        setConfirmState(null);
        setIsUploading(true);
        try {
          const activeTree = await getOrCreateKaprodiFolders(session.accessToken);
          setFolderTree(activeTree);

          const desc =
            uploadDescription.trim() ||
            (uploadCategory === 'BKD' && targetDosen
              ? `Bukti BKD (${uploadBkdKategori}) - ${targetDosen.namaLengkap} (${selectedProdi.singkatan})`
              : `${categoryLabel} - Prodi ${selectedProdi.nama}`);

          const uploadArgs = {
            file: fileObj,
            fileName: fileObj.name,
            mimeType: fileObj.type || 'application/octet-stream',
            description: desc,
            accessToken: session.accessToken
          };

          const uploaded =
            uploadCategory === 'BKD'
              ? await uploadToBkdDriveFolder(uploadArgs)
              : uploadCategory === 'AKREDITASI'
              ? await uploadToAccreditationDriveFolder(uploadArgs)
              : await uploadToAcademicDocDriveFolder(uploadArgs);

          // Mirror BKD evidence uploads into Repository Berkas Dosen so BKD module reflects it immediately
          if (uploadCategory === 'BKD' && targetDosen) {
            try {
              const savedRaw = localStorage.getItem(BKD_REPO_STORAGE_KEY);
              const existing = savedRaw ? JSON.parse(savedRaw) : [];
              const mirrored = {
                id: `bkd-drive-${uploaded.id}`,
                dosenId: targetDosen.id,
                dosenNama: targetDosen.namaLengkap,
                nidn: targetDosen.nidn,
                kategori: uploadBkdKategori,
                namaFile: uploaded.name,
                tanggalUnggah: new Date().toISOString().slice(0, 10),
                semester: '2026/2027 Ganjil',
                ukuran: formatBytes(String(fileObj.size)),
                driveLink: uploaded.webViewLink,
                driveFileId: uploaded.id
              };
              const nextRepo = Array.isArray(existing) ? [mirrored, ...existing] : [mirrored];
              localStorage.setItem(BKD_REPO_STORAGE_KEY, JSON.stringify(nextRepo));
            } catch {
              // ignore storage sync fallback
            }
          }

          logKaprodiActivity({
            actor: session.displayName,
            role: 'Admin Google Workspace',
            prodiId: selectedProdi.id,
            category: 'SYNC_WORKSPACE',
            actionTitle: `Unggah Drive (${categoryLabel}): ${uploaded.name}`,
            detail: `${desc} berhasil diunggah ke Google Drive.`,
            severity: 'info'
          });

          setSelectedLocalFile(null);
          setUploadDescription('');
          if (fileInputRef.current) fileInputRef.current.value = '';

          onShowToast(`Berkas "${uploaded.name}" berhasil diunggah ke Google Drive!`, 'success');
          await loadDriveFiles(activeFolderFilter, activeTree);
        } catch (err) {
          onShowToast(
            err instanceof Error ? err.message : 'Gagal mengunggah berkas ke Google Drive.',
            'error'
          );
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  const handleConfirmRename = (file: GoogleDriveFileDto) => {
    if (!session?.accessToken || !renameDraft.trim() || renameDraft.trim() === file.name) {
      setRenamingFile(null);
      return;
    }
    const nextName = renameDraft.trim();
    setConfirmState({
      title: `Ubah Nama Berkas di Google Drive?`,
      description: `Berkas "${file.name}" akan diubah namanya menjadi "${nextName}" di Google Drive.`,
      actionLabel: 'Simpan Nama Baru',
      onConfirm: async () => {
        setConfirmState(null);
        try {
          await renameDriveFile(file.id, nextName, session.accessToken);
          setRenamingFile(null);
          logKaprodiActivity({
            actor: session.displayName,
            role: 'Admin Google Workspace',
            prodiId: selectedProdi.id,
            category: 'SYNC_WORKSPACE',
            actionTitle: `Ubah Nama Berkas Drive`,
            detail: `Mengubah nama "${file.name}" menjadi "${nextName}" di Google Drive.`,
            severity: 'info'
          });
          onShowToast(`Nama berkas diperbarui menjadi "${nextName}".`, 'success');
          await loadDriveFiles(activeFolderFilter, folderTree);
        } catch (err) {
          onShowToast(
            err instanceof Error ? err.message : 'Gagal mengubah nama berkas Google Drive.',
            'error'
          );
        }
      }
    });
  };

  const handleConfirmDelete = (file: GoogleDriveFileDto) => {
    if (!session?.accessToken) return;
    setConfirmState({
      title: `Hapus Berkas dari Google Drive?`,
      description: `Anda akan menghapus "${file.name}" secara permanen dari Google Drive (${session.userEmail}). Tindakan ini tidak dapat dibatalkan.`,
      actionLabel: 'Hapus Permanen',
      onConfirm: async () => {
        setConfirmState(null);
        try {
          await deleteDriveFile(file.id, session.accessToken);
          setFiles(prev => prev.filter(f => f.id !== file.id));
          logKaprodiActivity({
            actor: session.displayName,
            role: 'Admin Google Workspace',
            prodiId: selectedProdi.id,
            category: 'PENGHAPUSAN_DATA',
            actionTitle: `Hapus Berkas Google Drive: ${file.name}`,
            detail: `Menghapus berkas "${file.name}" (ID: ${file.id}) dari Google Drive FT UNBARI.`,
            severity: 'critical'
          });
          onShowToast(`Berkas "${file.name}" berhasil dihapus dari Google Drive.`, 'success');
        } catch (err) {
          onShowToast(
            err instanceof Error ? err.message : 'Gagal menghapus berkas Google Drive.',
            'error'
          );
        }
      }
    });
  };

  const handleDownloadFile = async (file: GoogleDriveFileDto) => {
    if (!session?.accessToken) return;
    try {
      await downloadDriveFile(file, session.accessToken);
      onShowToast(`Mengunduh "${file.name}" dari Google Drive.`, 'info');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'Gagal mengunduh berkas dari Google Drive.',
        'error'
      );
    }
  };

  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        (f.description || '').toLowerCase().includes(q)
    );
  }, [files, searchQuery]);

  // Auth gate when user has not signed in with Google yet
  if (!session) {
    return (
      <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ecfdf5] border border-emerald-200 text-[#065f46] flex items-center justify-center">
          <HardDrive className="w-7 h-7" />
        </div>
        <div className="max-w-lg mx-auto space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            Manajemen Berkas Google Drive — Dokumentasi Akademik &amp; Bukti BKD
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Masuk dengan akun Google Anda untuk mengakses folder arsip resmi Fakultas Teknik UNBARI, mengunggah bukti BKD dosen, mengelola dokumentasi akademik &amp; akreditasi, serta mengunduh atau mengatur ulang berkas langsung dari Google Drive.
          </p>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onSignIn}
            disabled={isSigningIn}
            className="gsi-material-button inline-flex items-center gap-2.5 bg-white hover:bg-[#f8faff] text-[#1f1f1f] border border-[#747775] rounded-[4px] h-10 px-4 text-[14px] font-medium shadow-2xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>{isSigningIn ? 'Menghubungkan Google Drive...' : 'Sign in with Google'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls & Folder Setup */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#065f46] text-white flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Google Drive File Manager — Dokumentasi Akademik &amp; Bukti BKD
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#ecfdf5] text-[#065f46] border border-emerald-200 text-[10px] font-bold">
                  Terhubung: {session.userEmail}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Unggah langsung bukti BKD dosen &amp; dokumentasi akademik ke Google Drive, atur struktur folder, ubah nama, atau unduh kembali kapan saja.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleInitFolders}
              disabled={isLoadingFiles}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-[#ecfdf5] hover:bg-emerald-100 text-[#065f46] text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{folderTree ? 'Folder FT UNBARI Siap' : 'Siapkan Folder FT UNBARI'}</span>
            </button>
            <button
              type="button"
              onClick={() => loadDriveFiles(activeFolderFilter, folderTree)}
              disabled={isLoadingFiles}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              <span>Muat Ulang Drive</span>
            </button>
          </div>
        </div>

        {/* Upload Bar for Academic Documentation & BKD Evidence */}
        <form
          onSubmit={handleUploadFile}
          className="bg-[#fafaf5] border border-emerald-200 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#065f46]">
            <CloudUpload className="w-4 h-4" />
            <span>Unggah Berkas Baru Langsung ke Google Drive</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <div className="md:col-span-3">
              <label className="font-semibold text-slate-700 block mb-1">Folder Tujuan Drive</label>
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value as 'AKADEMIK' | 'BKD' | 'AKREDITASI')}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
              >
                <option value="BKD">Bukti BKD Dosen</option>
                <option value="AKADEMIK">Dokumentasi Akademik</option>
                <option value="AKREDITASI">Audit Mutu &amp; Akreditasi</option>
              </select>
            </div>

            {uploadCategory === 'BKD' ? (
              <>
                <div className="md:col-span-3">
                  <label className="font-semibold text-slate-700 block mb-1">Dosen Pemilik BKD</label>
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
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Bukti BKD</label>
                  <select
                    value={uploadBkdKategori}
                    onChange={e =>
                      setUploadBkdKategori(
                        e.target.value as
                          | 'SK Mengajar'
                          | 'RPS'
                          | 'BAP Perkuliahan'
                          | 'Laporan Pengabdian'
                          | 'Bukti Bimbingan'
                          | 'Karya Ilmiah'
                      )
                    }
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="BAP Perkuliahan">BAP Perkuliahan</option>
                    <option value="SK Mengajar">SK Mengajar</option>
                    <option value="RPS">RPS OBE</option>
                    <option value="Laporan Pengabdian">Laporan Pengabdian</option>
                    <option value="Bukti Bimbingan">Bukti Bimbingan TA</option>
                    <option value="Karya Ilmiah">Karya Ilmiah</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="md:col-span-5">
                <label className="font-semibold text-slate-700 block mb-1">Keterangan / Deskripsi Dokumen</label>
                <input
                  type="text"
                  value={uploadDescription}
                  onChange={e => setUploadDescription(e.target.value)}
                  placeholder={`Contoh: SK Pembimbing TA Semester Ganjil ${selectedProdi.singkatan}`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Pilih File Lokal</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={e => setSelectedLocalFile(e.target.files?.[0] || null)}
                className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1.5 file:px-2 file:rounded file:border-0 file:bg-emerald-100 file:text-emerald-900 file:font-bold"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isUploading || !selectedLocalFile}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Mengunggah...' : 'Unggah ke Drive'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Folder Tabs + Search + Create Folder */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            {(
              [
                { id: 'ALL', label: 'Semua Berkas' },
                { id: 'BKD', label: 'Bukti BKD Dosen' },
                { id: 'AKADEMIK', label: 'Dokumentasi Akademik' },
                { id: 'AKREDITASI', label: 'Audit Mutu & Akreditasi' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFolderFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeFolderFilter === tab.id
                    ? 'bg-white text-[#065f46] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleCreateCustomFolder} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Nama folder baru..."
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs w-40 bg-white"
              />
              <button
                type="submit"
                disabled={!newFolderName.trim()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-50"
              >
                <FolderPlus className="w-3.5 h-3.5 text-[#065f46]" />
                <span>Buat</span>
              </button>
            </form>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari berkas Drive..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs w-48 bg-white"
              />
            </div>
          </div>
        </div>

        {/* File Management Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fafaf5] text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-bold">Nama Berkas / Folder</th>
                <th className="py-2.5 px-3 font-bold">Deskripsi</th>
                <th className="py-2.5 px-3 font-bold text-center">Ukuran</th>
                <th className="py-2.5 px-3 font-bold">Terakhir Diubah</th>
                <th className="py-2.5 px-3 font-bold text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingFiles ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Memuat daftar berkas dari Google Drive...
                  </td>
                </tr>
              ) : filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Belum ada berkas ditemukan pada tampilan ini. Unggah dokumen baru atau klik "Siapkan Folder FT UNBARI".
                  </td>
                </tr>
              ) : (
                filteredFiles.map(file => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                  const isEditing = renamingFile?.id === file.id;
                  return (
                    <tr key={file.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={renameDraft}
                              onChange={e => setRenameDraft(e.target.value)}
                              className="px-2 py-1 border border-emerald-400 rounded text-xs w-56"
                            />
                            <button
                              type="button"
                              onClick={() => handleConfirmRename(file)}
                              className="px-2 py-1 bg-[#065f46] text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setRenamingFile(null)}
                              className="px-2 py-1 border border-slate-300 rounded text-[10px] text-slate-600 cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {renderFileIcon(file.mimeType)}
                            <span className="font-semibold text-slate-900">{file.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                        {file.description || (isFolder ? 'Folder Google Drive' : 'Dokumen SIKAPRODI FT UNBARI')}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600 tabular-nums">
                        {isFolder ? 'Folder' : formatBytes(file.size)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {formatDriveDate(file.modifiedTime)}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {!isFolder && (
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(file)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                              title="Unduh Berkas"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-emerald-200 bg-[#ecfdf5] hover:bg-emerald-100 text-[#065f46]"
                              title="Buka di Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingFile(file);
                              setRenameDraft(file.name);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-800 cursor-pointer"
                            title="Ubah Nama Berkas"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(file)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 cursor-pointer"
                            title="Hapus Berkas dari Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Confirmation Dialog for ALL mutating/destructive Google Drive operations */}
      <WorkspaceMutationConfirmDialog
        isOpen={Boolean(confirmState)}
        title={confirmState?.title || ''}
        description={confirmState?.description || ''}
        actionLabel={confirmState?.actionLabel || 'Lanjutkan'}
        onConfirm={() => confirmState?.onConfirm()}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
};
