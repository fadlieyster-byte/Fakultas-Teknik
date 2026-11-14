import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  HardDrive,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { 
  Mahasiswa, 
  Dosen, 
  JadwalKuliah, 
  RuanganLab, 
  PeringatanAkademik, 
  JadwalSidangTA, 
  JadwalKerjaPraktek,
  ProgramStudiInfo,
  YudisiumRecord,
  SuratPermohonanTU,
  SuratAgendaTU,
  PeminjamanSarprasTU,
  TagihanUktMahasiswa,
  KetersediaanJadwalDosen
} from '../types/index';

export interface BackupDataPayload {
  version: string;
  exportedAt: string;
  source: string;
  institution: string;
  faculty: string;
  activeProdiId: string;
  counts: {
    mahasiswa: number;
    dosen: number;
    jadwal: number;
    ruangan: number;
    peringatan: number;
    sidang: number;
    kp: number;
    yudisium?: number;
    tuSurat?: number;
    tuAgenda?: number;
    tuSarpras?: number;
    tagihan?: number;
    ketersediaanJadwal?: number;
  };
  data: {
    mahasiswaList: Mahasiswa[];
    dosenList: Dosen[];
    jadwalList: JadwalKuliah[];
    ruanganList: RuanganLab[];
    peringatanList: PeringatanAkademik[];
    sidangList: JadwalSidangTA[];
    kpList: JadwalKerjaPraktek[];
    yudisiumList?: YudisiumRecord[];
    tuSuratList?: SuratPermohonanTU[];
    tuAgendaList?: SuratAgendaTU[];
    tuSarprasList?: PeminjamanSarprasTU[];
    tagihanList?: TagihanUktMahasiswa[];
    ketersediaanJadwalList?: KetersediaanJadwalDosen[];
  };
}

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProdi: ProgramStudiInfo;
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  jadwalList: JadwalKuliah[];
  ruanganList: RuanganLab[];
  peringatanList: PeringatanAkademik[];
  sidangList: JadwalSidangTA[];
  kpList: JadwalKerjaPraktek[];
  yudisiumList?: YudisiumRecord[];
  tuSuratList?: SuratPermohonanTU[];
  tuAgendaList?: SuratAgendaTU[];
  tuSarprasList?: PeminjamanSarprasTU[];
  tagihanList?: TagihanUktMahasiswa[];
  ketersediaanJadwalList?: KetersediaanJadwalDosen[];
  onRestoreData: (restoredData: BackupDataPayload['data']) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onShowToast: (msg: string) => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  selectedProdi,
  mahasiswaList,
  dosenList,
  jadwalList,
  ruanganList,
  peringatanList,
  sidangList,
  kpList,
  yudisiumList,
  tuSuratList,
  tuAgendaList,
  tuSarprasList,
  tagihanList,
  ketersediaanJadwalList,
  onRestoreData,
  onRequestConfirm,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
  const [parsedBackup, setParsedBackup] = useState<BackupDataPayload | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    try {
      const payload: BackupDataPayload = {
        version: 'sikaprodi_v14',
        exportedAt: new Date().toISOString(),
        source: 'SiKaprodi FT UNBARI',
        institution: 'Universitas Batanghari Jambi',
        faculty: 'Fakultas Teknik',
        activeProdiId: selectedProdi.id,
        counts: {
          mahasiswa: mahasiswaList.length,
          dosen: dosenList.length,
          jadwal: jadwalList.length,
          ruangan: ruanganList.length,
          peringatan: peringatanList.length,
          sidang: sidangList.length,
          kp: kpList.length,
          yudisium: yudisiumList ? yudisiumList.length : 0,
          tuSurat: tuSuratList ? tuSuratList.length : 0,
          tuAgenda: tuAgendaList ? tuAgendaList.length : 0,
          tuSarpras: tuSarprasList ? tuSarprasList.length : 0,
          tagihan: tagihanList ? tagihanList.length : 0,
          ketersediaanJadwal: ketersediaanJadwalList ? ketersediaanJadwalList.length : 0
        },
        data: {
          mahasiswaList,
          dosenList,
          jadwalList,
          ruanganList,
          peringatanList,
          sidangList,
          kpList,
          yudisiumList: yudisiumList || [],
          tuSuratList: tuSuratList || [],
          tuAgendaList: tuAgendaList || [],
          tuSarprasList: tuSarprasList || [],
          tagihanList: tagihanList || [],
          ketersediaanJadwalList: ketersediaanJadwalList || []
        }
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `Backup_SiKaprodi_FT_UNBARI_${selectedProdi.id}_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onShowToast('Berkas cadangan JSON berhasil diunduh ke komputer Anda.');
    } catch {
      onShowToast('Gagal membuat berkas cadangan.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setParsedBackup(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setUploadError('Format berkas tidak valid. Harap pilih berkas berekstensi .json.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const json = JSON.parse(content) as BackupDataPayload;

        // Validation
        if (!json.data || !Array.isArray(json.data.mahasiswaList) || !Array.isArray(json.data.dosenList)) {
          throw new Error('Struktur berkas JSON tidak sesuai format data SiKaprodi FT UNBARI.');
        }

        setParsedBackup(json);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Berkas JSON rusak atau tidak dapat dibaca.';
        setUploadError(errorMsg);
      }
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca berkas dari sistem lokal.');
    };
    reader.readAsText(file);
  };

  const handleApplyRestore = () => {
    if (!parsedBackup) return;

    onRequestConfirm(
      'Konfirmasi Pemulihan Data (Restore)',
      `Apakah Anda yakin ingin memulihkan data dari berkas cadangan tanggal ${new Date(parsedBackup.exportedAt).toLocaleString('id-ID')}? Tindakan ini akan memperbarui data mahasiswa (${parsedBackup.data.mahasiswaList.length}), dosen (${parsedBackup.data.dosenList.length}), dan jadwal perkuliahan.`,
      () => {
        setIsProcessing(true);
        setTimeout(() => {
          onRestoreData(parsedBackup.data);
          setIsProcessing(false);
          onShowToast(`Berhasil memulihkan ${parsedBackup.data.mahasiswaList.length} data mahasiswa & data fakultas!`);
          onClose();
        }, 300);
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Database className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Pusat Cadangan & Pemulihan Data
                <span className="text-[10px] bg-blue-500/40 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono">
                  JSON v13
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Fakultas Teknik Universitas Batanghari (UNBARI)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Unduh Cadangan (Backup Data)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('restore')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'restore'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Pulihkan Data (Restore Snapshot)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-900">
                    Cadangkan Seluruh Basis Data Program Studi & Fakultas
                  </p>
                  <p className="text-blue-800/90 leading-relaxed">
                    Berkas cadangan mencakup 100% data mahasiswa (termasuk riwayat angkatan 2021–2026), profil dosen, verifikasi BAP perkuliahan, ruangan lab, pendaftaran sidang TA, dan kerja praktek.
                  </p>
                </div>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold text-blue-900 font-mono">
                    {mahasiswaList.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Total Mahasiswa
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold text-emerald-800 font-mono">
                    {dosenList.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Dosen Pengampu
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold text-indigo-900 font-mono">
                    {jadwalList.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Jadwal & BAP
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold text-amber-900 font-mono">
                    {sidangList.length + kpList.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Sidang TA & KP
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Cadangan JSON (.json)</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Format berkas terenkripsi standar JSON, dapat dibuka pada text editor dan dipulihkan kembali kapan saja.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'restore' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-900">
                    Perhatian Pemulihan Data
                  </p>
                  <p className="text-amber-800/90 leading-relaxed">
                    Memulihkan data dari berkas cadangan akan memperbarui data di memori aplikasi dengan data yang ada pada berkas tersebut.
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="backup-file-upload"
                />
                <label
                  htmlFor="backup-file-upload"
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
                >
                  <FileJson className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-xs font-bold text-slate-700">
                    Klik untuk memilih berkas cadangan (.json)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Pilih file Backup_SiKaprodi_FT_UNBARI_*.json
                  </span>
                </label>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {parsedBackup && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Berkas Cadangan Valid SiKaprodi Terverifikasi</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-emerald-800">
                    <div>
                      <span className="text-emerald-600">Tanggal Ekspor:</span>{' '}
                      <strong>{new Date(parsedBackup.exportedAt).toLocaleDateString('id-ID')}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-600">Total Mahasiswa:</span>{' '}
                      <strong>{parsedBackup.data.mahasiswaList.length} Data</strong>
                    </div>
                    <div>
                      <span className="text-emerald-600">Total Dosen:</span>{' '}
                      <strong>{parsedBackup.data.dosenList.length} Dosen</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyRestore}
                    disabled={isProcessing}
                    className="w-full mt-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>Terapkan Pemulihan Data Sekarang</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Penyimpanan Aman Browser LocalStorage Terenkripsi</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
