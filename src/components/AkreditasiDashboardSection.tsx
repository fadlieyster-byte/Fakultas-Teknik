import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileCheck2,
  TrendingUp,
  Printer,
  Download,
  Award,
  CheckCircle2,
  CloudUpload,
  ExternalLink,
  HardDrive,
  RefreshCw,
  Upload,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import {
  BorangAkreditasiProdi,
  CplItemObe,
  Dosen,
  MataKuliahCplMatrixRecord,
  ProgramStudiInfo
} from '../types/index';
import { StandardKopSurat } from './StandardKopSurat';
import { printDocumentElement } from '../utils/printHelper';
import { logKaprodiActivity } from '../utils/activityLogHelper';
import {
  downloadDriveFile,
  fetchAccreditationDriveFiles,
  GoogleDriveFileDto,
  uploadToAccreditationDriveFolder
} from '../utils/driveService';
import { useDriveAuth } from '../hooks/useDriveAuth';
import { WorkspaceMutationConfirmDialog } from './GoogleWorkspaceSignInCard';

interface AkreditasiDashboardSectionProps {
  selectedProdi: ProgramStudiInfo;
  borang: BorangAkreditasiProdi;
  matrixCourses: MataKuliahCplMatrixRecord[];
  activeCpls: CplItemObe[];
  dosenList: Dosen[];
  onShowToast?: (msg: string) => void;
}

export const AkreditasiDashboardSection: React.FC<AkreditasiDashboardSectionProps> = ({
  selectedProdi,
  borang,
  matrixCourses,
  activeCpls,
  dosenList,
  onShowToast
}) => {
  const [showBorangPdfModal, setShowBorangPdfModal] = useState(false);
  const [selectedKriteriaEvidence, setSelectedKriteriaEvidence] = useState<string | null>(null);
  const borangPrintRef = useRef<HTMLDivElement>(null);

  // Google Drive Accreditation Folder Integration (via useDriveAuth hook + driveService)
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
    onSessionExpiredOrCleared: () => setDriveFiles([])
  });
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFileDto[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [selectedDriveLocalFile, setSelectedDriveLocalFile] = useState<File | null>(null);
  const [selectedDriveKriteriaTag, setSelectedDriveKriteriaTag] = useState<string>(
    borang.kriteriaList[0]?.id || 'K1'
  );
  const driveFileInputRef = useRef<HTMLInputElement>(null);
  const [driveConfirmState, setDriveConfirmState] = useState<{
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const loadAccreditationDriveFolder = async (accessToken?: string) => {
    const token = accessToken || driveSession?.accessToken;
    if (!token) return;
    setIsLoadingDriveFiles(true);
    try {
      const snapshot = await fetchAccreditationDriveFiles(undefined, token);
      setDriveFiles(snapshot.files);
    } catch (err) {
      onShowToast?.(
        err instanceof Error ? err.message : 'Gagal memuat folder Akreditasi dari Google Drive.'
      );
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  useEffect(() => {
    if (driveSession?.accessToken && validateDriveSession()) {
      void loadAccreditationDriveFolder(driveSession.accessToken);
    } else {
      setDriveFiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveSession?.accessToken]);

  const handleAuthenticateDrive = async () => {
    try {
      const sess = await signInDrive();
      if (sess) {
        onShowToast?.(`Google Drive Akreditasi terhubung (${sess.userEmail}).`);
        await loadAccreditationDriveFolder(sess.accessToken);
      }
    } catch (err) {
      onShowToast?.(
        err instanceof Error ? err.message : 'Autentikasi OAuth Google Drive dibatalkan atau gagal.'
      );
    }
  };

  const handleRefreshDriveAuthSession = async () => {
    try {
      const sess = await refreshDriveSession();
      if (sess) {
        onShowToast?.(`Token OAuth Google Drive Akreditasi diperbarui (${sess.userEmail}).`);
        await loadAccreditationDriveFolder(sess.accessToken);
      }
    } catch (err) {
      onShowToast?.(
        err instanceof Error ? err.message : 'Gagal memperbarui token OAuth Google Drive.'
      );
    }
  };

  // Tren Kelulusan 3 Tahun (IPK Rata-rata & Masa Studi per Prodi)
  const graduationTrendData = useMemo(() => {
    const baseIpk =
      selectedProdi.id === 'SIPIL' ? 3.28 : selectedProdi.id === 'LINGKUNGAN' ? 3.34 : 3.31;
    const baseMasa =
      selectedProdi.id === 'LISTRIK_D3' ? 3.2 : 4.35;
    return [
      {
        tahun: 'TA 2023/2024',
        ipkRataRata: Number(baseIpk.toFixed(2)),
        masaStudiTahun: Number(baseMasa.toFixed(2)),
        kelulusanTepatWaktu: selectedProdi.id === 'LISTRIK_D3' ? 84 : 74
      },
      {
        tahun: 'TA 2024/2025',
        ipkRataRata: Number((baseIpk + 0.08).toFixed(2)),
        masaStudiTahun: Number((baseMasa - 0.14).toFixed(2)),
        kelulusanTepatWaktu: selectedProdi.id === 'LISTRIK_D3' ? 88 : 79
      },
      {
        tahun: 'TA 2025/2026',
        ipkRataRata: Number((baseIpk + 0.15).toFixed(2)),
        masaStudiTahun: Number((baseMasa - 0.25).toFixed(2)),
        kelulusanTepatWaktu: selectedProdi.id === 'LISTRIK_D3' ? 91 : 84
      }
    ];
  }, [selectedProdi.id]);

  // Tren 3 Tahun 8 IKU Universitas (Target vs Capaian)
  const iku3YearTrendData = useMemo(() => {
    return [
      {
        tahun: '2024',
        IKU1: 72, IKU2: 24, IKU3: 28, IKU4: 18, IKU5: 42, IKU6: 54, IKU7: 68, IKU8: 45, targetAvg: 55
      },
      {
        tahun: '2025',
        IKU1: 78, IKU2: 31, IKU3: 33, IKU4: 24, IKU5: 50, IKU6: 66, IKU7: 76, IKU8: 58, targetAvg: 62
      },
      {
        tahun: '2026',
        IKU1: 84, IKU2: 38, IKU3: 39, IKU4: 30, IKU5: 59, IKU6: 75, IKU7: 83, IKU8: 68, targetAvg: 68
      }
    ];
  }, []);

  const scopedDosen = useMemo(
    () => dosenList.filter(d => d.prodiId === selectedProdi.id),
    [dosenList, selectedProdi.id]
  );

  const handleDownloadEvidenceDossier = (kriteriaId: string, namaKriteria: string) => {
    const kObj = borang.kriteriaList.find(k => k.id === kriteriaId);
    const content = [
      `DOSSIER BUKTI FISIK AKREDITASI LAM-TEKNIK — ${selectedProdi.nama.toUpperCase()}`,
      `Fakultas Teknik Universitas Batanghari (UNBARI)`,
      `Kriteria: ${kriteriaId} — ${namaKriteria}`,
      `Skor Kesiapan Kriteria: ${kObj?.skorSkala4 ?? 0} / 4.00 (${kObj?.dokumenTersedia ?? 0} dari ${kObj?.dokumenDibutuhkan ?? 0} dokumen)`,
      `Penanggung Jawab: ${selectedProdi.kaprodi}`,
      `Tanggal Verifikasi: ${new Date().toLocaleDateString('id-ID')}`,
      '',
      'DAFTAR BUKTI FISIK TERVERIFIKASI:',
      ...(kObj?.indikatorKunci || [
        '1. SK Dekan & Dokumen Kebijakan Mutu Prodi',
        '2. Rekapitulasi Evaluasi Ketercapaian CPL & Audit RPS OBE',
        '3. Berita Acara Audit Mutu Internal (AMI) GPMF FT UNBARI'
      ]).map((doc: string) => `- [TERVERIFIKASI] ${doc}`)
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dossier_Bukti_${kriteriaId}_${selectedProdi.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSelectedKriteriaEvidence(kriteriaId);
    logKaprodiActivity({
      category: 'EXPORT_DOKUMEN',
      actionTitle: `Unduh Dossier Bukti Akreditasi (${kriteriaId})`,
      detail: `Dossier bukti fisik ${namaKriteria} untuk ${selectedProdi.singkatan} diunduh.`,
      actor: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id
    });

    if (onShowToast) {
      onShowToast(`Dossier bukti fisik terverifikasi untuk ${kriteriaId} (${namaKriteria}) berhasil diunduh.`);
    }
  };

  const buildDossierText = (kriteriaId: string, namaKriteria: string): string => {
    const kObj = borang.kriteriaList.find(k => k.id === kriteriaId);
    return [
      `DOSSIER BUKTI FISIK AKREDITASI LAM-TEKNIK — ${selectedProdi.nama.toUpperCase()}`,
      `Fakultas Teknik Universitas Batanghari (UNBARI)`,
      `Kriteria: ${kriteriaId} — ${namaKriteria}`,
      `Skor Kesiapan Kriteria: ${kObj?.skorSkala4 ?? 0} / 4.00 (${kObj?.dokumenTersedia ?? 0} dari ${kObj?.dokumenDibutuhkan ?? 0} dokumen)`,
      `Penanggung Jawab: ${selectedProdi.kaprodi}`,
      `Tanggal Verifikasi: ${new Date().toLocaleDateString('id-ID')}`,
      '',
      'DAFTAR BUKTI FISIK TERVERIFIKASI:',
      ...(kObj?.indikatorKunci || [
        '1. SK Dekan & Dokumen Kebijakan Mutu Prodi',
        '2. Rekapitulasi Evaluasi Ketercapaian CPL & Audit RPS OBE',
        '3. Berita Acara Audit Mutu Internal (AMI) GPMF FT UNBARI'
      ]).map((doc: string) => `- [TERVERIFIKASI] ${doc}`)
    ].join('\n');
  };

  const handleRequestUploadDossierToDrive = (kriteriaId: string, namaKriteria: string) => {
    if (!driveSession) {
      onShowToast?.('Hubungkan akun Google Drive melalui OAuth terlebih dahulu.');
      return;
    }
    const fileName = `Dossier_Akreditasi_${kriteriaId}_${selectedProdi.id}.txt`;
    setDriveConfirmState({
      title: `Unggah Dossier ${kriteriaId} ke Google Drive`,
      description: `Berkas "${fileName}" (${namaKriteria}) akan diunggah ke folder "SIKAPRODI FT UNBARI / Audit Mutu & Akreditasi" pada akun Google ${driveSession.userEmail}.`,
      actionLabel: 'Unggah ke Google Drive',
      onConfirm: async () => {
        setDriveConfirmState(null);
        setIsUploadingToDrive(true);
        try {
          const uploaded = await uploadToAccreditationDriveFolder({
            file: buildDossierText(kriteriaId, namaKriteria),
            fileName,
            mimeType: 'text/plain',
            description: `Dossier Bukti Akreditasi ${kriteriaId} (${namaKriteria}) - ${selectedProdi.nama}`,
            accessToken: driveSession.accessToken
          });
          setDriveFiles(prev => [uploaded, ...prev]);
          setSelectedKriteriaEvidence(kriteriaId);
          logKaprodiActivity({
            category: 'SYNC_WORKSPACE',
            actionTitle: `Unggah Dossier Akreditasi ke Google Drive (${kriteriaId})`,
            detail: `Dossier "${uploaded.name}" diunggah ke folder Audit Mutu & Akreditasi (${selectedProdi.singkatan}).`,
            actor: `Kaprodi ${selectedProdi.singkatan}`,
            prodiId: selectedProdi.id
          });
          onShowToast?.(`Dossier "${uploaded.name}" berhasil diunggah ke folder Akreditasi Google Drive.`);
        } catch (err) {
          onShowToast?.(
            err instanceof Error ? err.message : 'Gagal mengunggah dossier ke Google Drive.'
          );
        } finally {
          setIsUploadingToDrive(false);
        }
      }
    });
  };

  const handleRequestUploadLocalAccreditationFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveSession || !selectedDriveLocalFile) return;
    const localFile = selectedDriveLocalFile;
    setDriveConfirmState({
      title: 'Unggah Berkas Akreditasi ke Google Drive',
      description: `Berkas "${localFile.name}" akan diunggah ke folder "SIKAPRODI FT UNBARI / Audit Mutu & Akreditasi" (Tag: ${selectedDriveKriteriaTag}) pada akun ${driveSession.userEmail}.`,
      actionLabel: 'Unggah Berkas Akreditasi',
      onConfirm: async () => {
        setDriveConfirmState(null);
        setIsUploadingToDrive(true);
        try {
          const uploaded = await uploadToAccreditationDriveFolder({
            file: localFile,
            fileName: localFile.name,
            mimeType: localFile.type || 'application/octet-stream',
            description: `Bukti Akreditasi ${selectedDriveKriteriaTag} - ${selectedProdi.nama}`,
            accessToken: driveSession.accessToken
          });
          setDriveFiles(prev => [uploaded, ...prev]);
          setSelectedDriveLocalFile(null);
          if (driveFileInputRef.current) driveFileInputRef.current.value = '';
          logKaprodiActivity({
            category: 'SYNC_WORKSPACE',
            actionTitle: `Unggah Berkas Akreditasi Drive (${selectedDriveKriteriaTag})`,
            detail: `Berkas "${uploaded.name}" diunggah ke folder Audit Mutu & Akreditasi.`,
            actor: `Kaprodi ${selectedProdi.singkatan}`,
            prodiId: selectedProdi.id
          });
          onShowToast?.(`Berkas "${uploaded.name}" berhasil diunggah ke folder Akreditasi Google Drive.`);
        } catch (err) {
          onShowToast?.(
            err instanceof Error ? err.message : 'Gagal mengunggah berkas akreditasi ke Google Drive.'
          );
        } finally {
          setIsUploadingToDrive(false);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Akreditasi Dashboard, Tren Kelulusan &amp; Generator Dokumen Borang Otomatis
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Pantau progres 9 Kriteria LAM-Teknik, unduh dossier bukti fisik terverifikasi, evaluasi tren IPK/Masa Studi &amp; 8 IKU 3 tahun, serta kompilasi Borang PDF otomatis.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowBorangPdfModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Generate Dokumen Akreditasi Otomatis (PDF)</span>
        </button>
      </div>

      {/* 9 Kriteria LAM-Teknik Visual Progress Bars & Verified Evidence Dossiers */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Progres Kelengkapan 9 Kriteria LAM-Teknik &amp; Unduhan Dossier Bukti Fisik
            </h3>
            <p className="text-xs text-slate-500">
              Persentase kesiapan dokumen terverifikasi per kriteria untuk borang {selectedProdi.nama}.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            {borang.kriteriaList.length} Kriteria Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {borang.kriteriaList.map(k => {
            const pct =
              k.dokumenDibutuhkan > 0
                ? Math.min(100, Math.round((k.dokumenTersedia / k.dokumenDibutuhkan) * 100))
                : 0;
            const downloaded = selectedKriteriaEvidence === k.id;
            return (
              <div
                key={k.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono font-bold">
                      {k.id}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 tabular-nums">
                      Skor {k.skorSkala4.toFixed(2)} / 4.00
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1.5">{k.nama}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    PJ: Tim GPMF &amp; {selectedProdi.kaprodi}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-600">
                      Berkas: {k.dokumenTersedia}/{k.dokumenDibutuhkan}
                    </span>
                    <span className="font-bold text-slate-900">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 85 ? 'bg-emerald-600' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => handleDownloadEvidenceDossier(k.id, k.nama)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      {downloaded ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Unduh Dossier Bukti Terverifikasi</span>
                    </button>
                    {driveSession && (
                      <button
                        type="button"
                        disabled={isUploadingToDrive}
                        onClick={() => handleRequestUploadDossierToDrive(k.id, k.nama)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ecfdf5] hover:bg-emerald-100 border border-emerald-200 text-[#065f46] text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Arsipkan ke Folder Akreditasi Drive</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Drive Accreditation Folder Integration Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-[#ecfdf5] text-[#065f46] border border-emerald-200 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Brankas Google Drive — Folder Audit Mutu &amp; Akreditasi ({selectedProdi.singkatan})
              </h3>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                <span>
                  {driveSession
                    ? `Terhubung via OAuth (${driveSession.userEmail}) · Ambil atau unggah berkas bukti borang LAM-Teknik langsung ke Google Drive.`
                    : needsDriveRefresh
                    ? `Sesi Google (${sessionHint?.userEmail || 'aktif'}) menunggu pembaruan token OAuth untuk mengakses folder Audit Mutu & Akreditasi.`
                    : 'Masuk dengan Google OAuth untuk mengakses dan mengunggah berkas ke folder Audit Mutu & Akreditasi prodi.'}
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
              </p>
            </div>
          </div>

          {driveSession ? (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void loadAccreditationDriveFolder(driveSession.accessToken)}
                disabled={isLoadingDriveFiles}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-[#ecfdf5] hover:bg-emerald-100 text-[#065f46] text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDriveFiles ? 'animate-spin' : ''}`} />
                <span>{isLoadingDriveFiles ? 'Memuat Drive...' : 'Ambil Berkas Akreditasi'}</span>
              </button>
              <button
                type="button"
                onClick={handleRefreshDriveAuthSession}
                disabled={isAuthenticatingDrive}
                title="Perpanjang masa berlaku token OAuth 2.0 Google Drive"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer disabled:opacity-60 ${
                  isDriveExpiringSoon
                    ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuthenticatingDrive ? 'animate-spin' : ''}`} />
                <span>{isAuthenticatingDrive ? 'Memperbarui...' : 'Perpanjang Token'}</span>
              </button>
            </div>
          ) : needsDriveRefresh ? (
            <button
              type="button"
              onClick={handleRefreshDriveAuthSession}
              disabled={isAuthenticatingDrive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold cursor-pointer disabled:opacity-60 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuthenticatingDrive ? 'animate-spin' : ''}`} />
              <span>{isAuthenticatingDrive ? 'Memperbarui Token...' : 'Perbarui Token OAuth'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAuthenticateDrive}
              disabled={isAuthenticatingDrive}
              className="gsi-material-button inline-flex items-center gap-2 bg-white hover:bg-[#f8faff] text-[#1f1f1f] border border-[#747775] rounded-[4px] h-9 px-3.5 text-[13px] font-medium cursor-pointer disabled:opacity-60 shrink-0"
            >
              <span>{isAuthenticatingDrive ? 'Menghubungkan Drive...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>

        {driveSession && (
          <div className="space-y-4">
            <form
              onSubmit={handleRequestUploadLocalAccreditationFile}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-xl bg-[#fafaf5] border border-emerald-200 text-xs"
            >
              <div className="md:col-span-3">
                <label className="font-semibold text-slate-700 block mb-1">Tag Kriteria Borang</label>
                <select
                  value={selectedDriveKriteriaTag}
                  onChange={e => setSelectedDriveKriteriaTag(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  {borang.kriteriaList.map(kr => (
                    <option key={kr.id} value={kr.id}>
                      {kr.id} — {kr.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-6">
                <label className="font-semibold text-slate-700 block mb-1">
                  Pilih Berkas Bukti Fisik Akreditasi (PDF / DOCX / XLSX)
                </label>
                <input
                  ref={driveFileInputRef}
                  type="file"
                  onChange={e => setSelectedDriveLocalFile(e.target.files?.[0] || null)}
                  className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1.5 file:px-2.5 file:rounded file:border-0 file:bg-emerald-100 file:text-emerald-900 file:font-bold"
                />
              </div>
              <div className="md:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={!selectedDriveLocalFile || isUploadingToDrive}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingToDrive ? 'Mengunggah...' : 'Unggah ke Folder Akreditasi'}</span>
                </button>
              </div>
            </form>

            {driveFiles.length === 0 ? (
              <div className="py-5 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                {isLoadingDriveFiles
                  ? 'Mengambil daftar berkas dari folder Audit Mutu & Akreditasi...'
                  : 'Belum ada berkas di folder Audit Mutu & Akreditasi Google Drive. Gunakan tombol upload di atas atau arsipkan dossier kriteria.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {driveFiles.slice(0, 8).map(file => (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 text-xs hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{file.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {file.description || 'Berkas Audit Mutu & Akreditasi FT UNBARI'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => void downloadDriveFile(file, driveSession.accessToken)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh</span>
                      </button>
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-[#ecfdf5] hover:bg-emerald-100 text-[#065f46] font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Drive</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dual LineCharts: Tren Kelulusan (IPK & Masa Studi) + Tren 3 Tahun IKU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analisis Tren Kelulusan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-start gap-2.5 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Analisis Tren Kelulusan 3 Tahun (IPK Rata-rata &amp; Masa Studi)
              </h3>
              <p className="text-xs text-slate-500">
                Memantau kenaikan kualitas IPK lulusan vs percepatan rata-rata masa studi ({selectedProdi.singkatan}).
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={graduationTrendData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis yAxisId="left" domain={[2.8, 4.0]} tick={{ fontSize: 11, fill: '#065f46' }} />
                <YAxis yAxisId="right" orientation="right" domain={[2.5, 5.0]} tick={{ fontSize: 11, fill: '#0284c7' }} />
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
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ipkRataRata"
                  name="IPK Rata-rata Lulusan"
                  stroke="#065f46"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="masaStudiTahun"
                  name="Masa Studi Rata-rata (Tahun)"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analisis Tren 3 Tahun IKU (8 Kategori) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-start gap-2.5 border-b border-slate-100 pb-3">
            <FileCheck2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Analisis Tren 3 Tahun 8 IKU Universitas (Target vs Realisasi)
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan tren historis 8 Indikator Kinerja Utama sebagai dasar evaluasi eksekutif akreditasi.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={iku3YearTrendData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${v}%`} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="targetAvg" name="Garis Target (%)" stroke="#0f172a" strokeDasharray="4 4" strokeWidth={2} />
                <Line type="monotone" dataKey="IKU1" name="IKU-1 Kerja Layak" stroke="#059669" strokeWidth={2} />
                <Line type="monotone" dataKey="IKU2" name="IKU-2 MBKM" stroke="#0284c7" strokeWidth={2} />
                <Line type="monotone" dataKey="IKU6" name="IKU-6 Mitra" stroke="#7c3aed" strokeWidth={2} />
                <Line type="monotone" dataKey="IKU7" name="IKU-7 Kelas PBL" stroke="#d97706" strokeWidth={2} />
                <Line type="monotone" dataKey="IKU8" name="IKU-8 Akreditasi" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* MODAL GENERATE DOKUMEN AKREDITASI OTOMATIS (UNIFIED BORANG PDF: IKU + MATRIKS CPL/CPMK + BKD) */}
      {showBorangPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-emerald-200 uppercase">
                  Kompilasi Otomatis Dokumen Borang Akreditasi (IKU + CPL/CPMK + BKD Dosen)
                </div>
                <h3 className="text-base font-bold mt-0.5">
                  Draf Dokumen Akreditasi Terpadu — {selectedProdi.nama}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBorangPdfModal(false)}
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100">
              <div
                ref={borangPrintRef}
                className="bg-white p-8 shadow-sm border border-slate-200 mx-auto max-w-[210mm] text-slate-900 font-serif space-y-5"
              >
                <StandardKopSurat
                  prodiName={`PROGRAM STUDI ${selectedProdi.nama.toUpperCase()} (${selectedProdi.jenjang})`}
                  subTitle="DOKUMEN KOMPILASI BORANG AKREDITASI OTOMATIS (LED & LKPS TERINTEGRASI)"
                  showQrCode={true}
                  qrCodeUrl={`https://ft.unbari.ac.id/verify/BORANG-${selectedProdi.id}-${new Date().getFullYear()}`}
                  qrBadgeText="BORANG FT"
                />

                <div className="text-center">
                  <h4 className="text-sm font-bold uppercase tracking-wide underline">
                    RINGKASAN KOMPILASI CAPAIAN IKU, MATRIKS CPL/CPMK &amp; RIWAYAT BKD DOSEN
                  </h4>
                  <p className="text-xs font-sans text-slate-600 mt-1">
                    Peringkat Saat Ini: <b>{borang.peringkatSaatIni}</b> · Target Re-Akreditasi: <b>{borang.targetPeringkat}</b>
                  </p>
                </div>

                {/* Section 1: Ringkasan IKU & Tren Kelulusan */}
                <div className="font-sans text-xs space-y-2">
                  <h5 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                    I. Rekapitulasi Capaian IKU &amp; Tren Kelulusan 3 Tahun
                  </h5>
                  <table className="w-full border-collapse border border-slate-800 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-800 px-2 py-1.5 text-left">Tahun Akademik</th>
                        <th className="border border-slate-800 px-2 py-1.5 text-right">IPK Rata-rata</th>
                        <th className="border border-slate-800 px-2 py-1.5 text-right">Masa Studi (Thn)</th>
                        <th className="border border-slate-800 px-2 py-1.5 text-right">Ketepatan Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {graduationTrendData.map(g => (
                        <tr key={g.tahun}>
                          <td className="border border-slate-800 px-2 py-1.5 font-bold">{g.tahun}</td>
                          <td className="border border-slate-800 px-2 py-1.5 text-right font-mono">{g.ipkRataRata.toFixed(2)}</td>
                          <td className="border border-slate-800 px-2 py-1.5 text-right font-mono">{g.masaStudiTahun}</td>
                          <td className="border border-slate-800 px-2 py-1.5 text-right font-mono">{g.kelulusanTepatWaktu}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Ringkasan Matriks CPL & CPMK */}
                <div className="font-sans text-xs space-y-2">
                  <h5 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                    II. Ringkasan Pemetaan Kurikulum OBE ({activeCpls.length} Butir CPL · {matrixCourses.length} Mata Kuliah)
                  </h5>
                  <table className="w-full border-collapse border border-slate-800 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-800 px-2 py-1.5 text-left">Kode CPL</th>
                        <th className="border border-slate-800 px-2 py-1.5 text-left">Ranah &amp; Kompetensi</th>
                        <th className="border border-slate-800 px-2 py-1.5 text-center">MK Strong (S)</th>
                        <th className="border border-slate-800 px-2 py-1.5 text-right">Target Minimal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCpls.slice(0, 8).map(cpl => {
                        const strongCnt = matrixCourses.filter(m => m.pemetaanCpl[cpl.kode] === 'Strong').length;
                        return (
                          <tr key={cpl.kode}>
                            <td className="border border-slate-800 px-2 py-1.5 font-mono font-bold">{cpl.kode}</td>
                            <td className="border border-slate-800 px-2 py-1.5">{cpl.judul} ({cpl.ranah})</td>
                            <td className="border border-slate-800 px-2 py-1.5 text-center font-mono">{strongCnt} MK</td>
                            <td className="border border-slate-800 px-2 py-1.5 text-right font-mono">{cpl.targetKetercapaianMinimal}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Section 3: Ringkasan Riwayat BKD Dosen */}
                <div className="font-sans text-xs space-y-2">
                  <h5 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                    III. Ringkasan Beban Kerja Dosen (DTPS {selectedProdi.singkatan} · {scopedDosen.length} Dosen Tetap)
                  </h5>
                  <table className="w-full border-collapse border border-slate-800 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-800 px-2 py-1.5 text-left">Nama Dosen &amp; NIDN</th>
                        <th className="border border-slate-800 px-2 py-1.5 text-left">Jabatan Fungsional</th>
                        <th className="border border-slate-800 px-2 py-1.5 text-right">SKS Mengajar</th>
                        <th className="border border-slate-800 px-2 py-1.5 text-right">Mhs Bimbingan TA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scopedDosen.map(d => (
                        <tr key={d.id}>
                          <td className="border border-slate-800 px-2 py-1.5">
                            <span className="font-bold">{d.namaLengkap}</span> · <span className="font-mono">{d.nidn}</span>
                          </td>
                          <td className="border border-slate-800 px-2 py-1.5">{d.jabatanFungsional}</td>
                          <td className="border border-slate-800 px-2 py-1.5 text-right font-mono">{d.totalSksMengajar} SKS</td>
                          <td className="border border-slate-800 px-2 py-1.5 text-right font-mono">{d.jumlahMahasiswaBimbingan} Mhs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end text-xs font-sans pt-4">
                  <div className="text-right">
                    <p>Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold mt-1">Ketua Program Studi {selectedProdi.singkatan}</p>
                    <div className="h-14" />
                    <p className="font-bold underline">{selectedProdi.kaprodi}</p>
                    <p className="text-[11px] font-mono">NIDN/NUPTK: {selectedProdi.nipKaprodi}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBorangPdfModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  logKaprodiActivity({
                    category: 'EXPORT_DOKUMEN',
                    actionTitle: `Generate Dokumen Akreditasi Otomatis (${selectedProdi.singkatan})`,
                    detail: `Mencetak dokumen Borang PDF terintegrasi (IKU, Matriks CPL/CPMK, dan BKD Dosen).`,
                    actor: `Kaprodi ${selectedProdi.singkatan}`,
                    prodiId: selectedProdi.id
                  });
                  printDocumentElement(borangPrintRef.current, {
                    documentTitle: `Dokumen_Akreditasi_Otomatis_${selectedProdi.singkatan}`
                  });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan Dokumen Akreditasi PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <WorkspaceMutationConfirmDialog
        isOpen={Boolean(driveConfirmState)}
        title={driveConfirmState?.title || ''}
        description={driveConfirmState?.description || ''}
        actionLabel={driveConfirmState?.actionLabel || 'Unggah ke Google Drive'}
        onConfirm={() => driveConfirmState?.onConfirm()}
        onCancel={() => setDriveConfirmState(null)}
      />
    </div>
  );
};
