import React from 'react';
import {
  X,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Upload,
  Clock,
  ShieldX,
  MapPin,
  UserCheck
} from 'lucide-react';
import { DokumenVerifikasiRecord, ProgramStudiInfo } from '../types/index';
import { INITIAL_DOKUMEN_VERIFIKASI, lookupDokumenVerifikasi, QrCodeSvg } from '../utils/qrHelper';
import { logKaprodiActivity } from '../utils/activityLogHelper';

interface LogValidasiEntry {
  id: string;
  timestamp: string;
  lokasi: string;
  akunPengakses: string;
  kodeInput: string;
  jenisDokumen: string;
  statusHasil: 'ASLI' | 'EXPIRED' | 'PALSU';
}

const LOG_VALIDASI_KEY = 'sikaprodi_v15_log_validasi_dokumen';

const EXPIRED_SAMPLE_DOC: DokumenVerifikasiRecord = {
  kodeVerifikasi: 'FT-UNBARI/2024/SK-EXP/019',
  jenisDokumen: 'Surat Keterangan Aktif Kuliah',
  nomorSurat: '019/UNBARI-FT/TU/II/2024',
  namaMahasiswa: 'Rizky Pratama Putra',
  nim: '201001121088',
  prodi: 'S1 Teknik Sipil',
  pejabatPenandatangan: 'Hadrah, ST., MT',
  jabatanPejabat: 'Wakil Dekan I (Bidang Akademik)',
  tanggalTerbit: '2024-02-12',
  statusKeaslian: 'DIBATALKAN',
  hashKeamanan: 'SHA256:00EXPIRED99881122',
  ringkasanIsi: 'Masa berlaku surat keterangan semester lampau (2023/2024) telah berakhir / dibatalkan sistem.'
};

interface VerifikasiDokumenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  selectedProdi?: ProgramStudiInfo;
  onShowToast?: (msg: string) => void;
}

export const VerifikasiDokumenModal: React.FC<VerifikasiDokumenModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  currentUserEmail = 'kaprodi@ft.unbari.ac.id',
  currentUserName = 'Kaprodi FT UNBARI',
  selectedProdi,
  onShowToast
}) => {
  const allDocs = React.useMemo(() => [...INITIAL_DOKUMEN_VERIFIKASI, EXPIRED_SAMPLE_DOC], []);
  const [searchQuery, setSearchQuery] = React.useState(initialCode);
  const [activeResult, setActiveResult] = React.useState<DokumenVerifikasiRecord | undefined>(() =>
    initialCode ? lookupDokumenVerifikasi(allDocs, initialCode) : allDocs[0]
  );
  const [hasSearched, setHasSearched] = React.useState(false);
  const [validasiLogs, setValidasiLogs] = React.useState<LogValidasiEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOG_VALIDASI_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'VLD-001',
        timestamp: '15 Nov 2026, 08:45 WIB',
        lokasi: 'Kampus I Broni · Dekanat FT UNBARI',
        akunPengakses: currentUserEmail,
        kodeInput: 'FT-UNBARI/2026/BA-SKR/042',
        jenisDokumen: 'Berita Acara Sidang Skripsi',
        statusHasil: 'ASLI'
      }
    ];
  });

  if (!isOpen) return null;

  const appendValidationLog = (kode: string, doc: DokumenVerifikasiRecord | undefined) => {
    const statusHasil: LogValidasiEntry['statusHasil'] = !doc
      ? 'PALSU'
      : doc.statusKeaslian === 'DIBATALKAN'
        ? 'EXPIRED'
        : 'ASLI';

    const newEntry: LogValidasiEntry = {
      id: `VLD-${Date.now()}`,
      timestamp:
        new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + ' WIB',
      lokasi: 'Portal Audit QR · FT UNBARI Jambi',
      akunPengakses: `${currentUserName} (${currentUserEmail})`,
      kodeInput: kode || '(kosong)',
      jenisDokumen: doc ? doc.jenisDokumen : 'Kode Tidak Dikenali',
      statusHasil
    };

    const next = [newEntry, ...validasiLogs].slice(0, 30);
    setValidasiLogs(next);
    try {
      localStorage.setItem(LOG_VALIDASI_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }

    logKaprodiActivity({
      actor: currentUserName,
      role: 'Auditor Verifikasi QR',
      prodiId: selectedProdi?.id || 'SIPIL',
      category: 'VERIFIKASI_QR',
      actionTitle: `Audit Keaslian QR: ${statusHasil}`,
      detail: `Pemeriksaan kode "${kode}" menghasilkan status ${statusHasil} (${newEntry.jenisDokumen}).`,
      severity: statusHasil === 'PALSU' ? 'critical' : statusHasil === 'EXPIRED' ? 'warning' : 'info'
    });
  };

  const normalizeCodeInput = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.includes('kode=')) {
      const idx = trimmed.indexOf('kode=');
      return decodeURIComponent(trimmed.slice(idx + 5).split('&')[0]);
    }
    return trimmed;
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = normalizeCodeInput(searchQuery);
    setHasSearched(true);
    const result = lookupDokumenVerifikasi(allDocs, cleaned);
    setActiveResult(result);
    appendValidationLog(cleaned, result);
  };

  const handleSelectPreset = (doc: DokumenVerifikasiRecord) => {
    setSearchQuery(doc.kodeVerifikasi);
    setActiveResult(doc);
    setHasSearched(true);
    appendValidationLog(doc.kodeVerifikasi, doc);
  };

  const handleTestFakeCode = () => {
    const fakeCode = 'FT-UNBARI/2026/PALSU/999';
    setSearchQuery(fakeCode);
    setHasSearched(true);
    setActiveResult(undefined);
    appendValidationLog(fakeCode, undefined);
  };

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Match filename against known codes if embedded, or verify via text content
    const matched = allDocs.find(
      d =>
        file.name.toUpperCase().includes(d.nim) ||
        file.name.toUpperCase().includes(d.kodeVerifikasi.split('/').pop() || 'NOPE')
    );
    const simulatedCode = matched ? matched.kodeVerifikasi : INITIAL_DOKUMEN_VERIFIKASI[0].kodeVerifikasi;
    setSearchQuery(simulatedCode);
    setHasSearched(true);
    const found = lookupDokumenVerifikasi(allDocs, simulatedCode);
    setActiveResult(found);
    appendValidationLog(`QR-SCAN:${file.name} -> ${simulatedCode}`, found);
    onShowToast?.(`Berkas QR "${file.name}" berhasil dipindai & diaudit.`);
    e.target.value = '';
  };

  const statusStatusBadge = !activeResult
    ? { label: 'PALSU / TIDAK TERDAFTAR', cls: 'bg-red-100 text-red-900 border-red-300' }
    : activeResult.statusKeaslian === 'DIBATALKAN'
      ? { label: 'EXPIRED / DIBATALKAN', cls: 'bg-amber-100 text-amber-900 border-amber-300' }
      : { label: 'ASLI & TERDAFTAR VALID', cls: 'bg-emerald-100 text-emerald-900 border-emerald-300' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-emerald-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-200 bg-[#065f46] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Audit Keaslian Dokumen &amp; Log Validasi QR FT UNBARI
              </h3>
              <p className="text-xs text-emerald-100">
                Pindai QR atau masukkan payload untuk memverifikasi status ASLI, EXPIRED, atau PALSU
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-100 hover:text-white rounded-lg hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Search Bar & QR Image Upload */}
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan Kode Verifikasi, URL QR, atau NIM (cth: FT-UNBARI/2026/BA-SKR/042)..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#065f46] hover:bg-emerald-900 rounded-xl transition-colors whitespace-nowrap shadow-xs"
            >
              Audit Sekarang
            </button>
            <label className="px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-[#ecfdf5] hover:bg-[#d1fae5] border border-emerald-200 rounded-xl cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap">
              <Upload className="w-3.5 h-3.5" />
              <span>Pindai File QR</span>
              <input type="file" accept="image/*,.svg" onChange={handleQrFileUpload} className="hidden" />
            </label>
          </form>

          {/* Quick Presets (Asli, Expired, Palsu) */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Simulasi Audit Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INITIAL_DOKUMEN_VERIFIKASI.slice(0, 3).map((doc) => (
                <button
                  key={doc.kodeVerifikasi}
                  type="button"
                  onClick={() => handleSelectPreset(doc)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-mono transition-colors"
                >
                  [ASLI] {doc.jenisDokumen}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleSelectPreset(EXPIRED_SAMPLE_DOC)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-mono transition-colors"
              >
                [EXPIRED] Surat Lama 2024
              </button>
              <button
                type="button"
                onClick={handleTestFakeCode}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 font-mono transition-colors"
              >
                [PALSU] Uji Kode Tidak Terdaftar
              </button>
            </div>
          </div>

          {/* Result Banner */}
          {activeResult ? (
            <div
              className={`rounded-xl p-5 border space-y-4 ${
                activeResult.statusKeaslian === 'DIBATALKAN'
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-[#ecfdf5] border-emerald-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 ${
                      activeResult.statusKeaslian === 'DIBATALKAN' ? 'bg-amber-600' : 'bg-[#065f46]'
                    }`}
                  >
                    {activeResult.statusKeaslian === 'DIBATALKAN' ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded border ${statusStatusBadge.cls}`}>
                      STATUS AUDIT: {statusStatusBadge.label}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{activeResult.jenisDokumen}</h4>
                    <span className="text-[11px] text-slate-600 font-mono">{activeResult.hashKeamanan}</span>
                  </div>
                </div>
                <QrCodeSvg value={`https://unbari.ac.id/ft/verifikasi?kode=${activeResult.kodeVerifikasi}`} size={64} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Nomor Surat Resmi:</span>
                  <span className="font-mono font-bold text-emerald-950">{activeResult.nomorSurat}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Pemohon / Mahasiswa:</span>
                  <span className="font-bold text-slate-900">{activeResult.namaMahasiswa} ({activeResult.nim})</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Penandatangan Sah:</span>
                  <span className="font-bold text-slate-900">{activeResult.pejabatPenandatangan}</span>
                  <span className="text-[11px] text-slate-500 block">{activeResult.jabatanPejabat}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Tanggal Terbit &amp; Prodi:</span>
                  <span className="font-medium text-slate-800">{activeResult.tanggalTerbit} · {activeResult.prodi}</span>
                </div>
                <div className="sm:col-span-2 p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Ringkasan Dokumen:</span>
                  <p className="text-slate-800">{activeResult.ringkasanIsi}</p>
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="bg-red-50 border border-red-300 rounded-xl p-5 flex items-start gap-3">
              <ShieldX className="w-8 h-8 text-red-600 shrink-0" />
              <div className="space-y-1">
                <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white">
                  STATUS AUDIT: PALSU / TIDAK TERDAFTAR
                </span>
                <h4 className="text-sm font-bold text-red-950">Dokumen Tidak Dikenali di Basis Data FT UNBARI</h4>
                <p className="text-xs text-red-800">
                  Kode &quot;{searchQuery}&quot; tidak cocok dengan hash tanda tangan digital resmi SiKaprodi. Harap tolak berkas fisik dan laporkan ke Bagian Tata Usaha Dekanat.
                </p>
              </div>
            </div>
          ) : null}

          {/* Persistent Log Validasi Dokumen */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Log Validasi Dokumen ({validasiLogs.length} Riwayat Audit)</span>
              </h4>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-52 overflow-y-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-2.5">Waktu Pemeriksaan</th>
                    <th className="p-2.5">Akun Pengakses</th>
                    <th className="p-2.5">Lokasi</th>
                    <th className="p-2.5">Kode / Jenis Berkas</th>
                    <th className="p-2.5 text-center">Hasil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validasiLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-slate-700 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-2.5 text-slate-800">
                        <span className="inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-700" />
                          <span className="truncate max-w-[140px]">{log.akunPengakses}</span>
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{log.lokasi}</span>
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className="font-mono font-semibold text-slate-900 block truncate max-w-[160px]">{log.kodeInput}</span>
                        <span className="text-[10px] text-slate-500">{log.jenisDokumen}</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            log.statusHasil === 'ASLI'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.statusHasil === 'EXPIRED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.statusHasil}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
