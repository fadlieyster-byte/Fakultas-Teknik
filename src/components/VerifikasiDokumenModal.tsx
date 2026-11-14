import React from 'react';
import { X, Search, ShieldCheck, CheckCircle2, AlertTriangle, FileText, QrCode } from 'lucide-react';
import { DokumenVerifikasiRecord } from '../types/index';
import { INITIAL_DOKUMEN_VERIFIKASI, lookupDokumenVerifikasi, QrCodeSvg } from '../utils/qrHelper';

interface VerifikasiDokumenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const VerifikasiDokumenModal: React.FC<VerifikasiDokumenModalProps> = ({
  isOpen,
  onClose,
  initialCode = ''
}) => {
  const [searchQuery, setSearchQuery] = React.useState(initialCode);
  const [activeResult, setActiveResult] = React.useState<DokumenVerifikasiRecord | undefined>(() => {
    return initialCode ? lookupDokumenVerifikasi(INITIAL_DOKUMEN_VERIFIKASI, initialCode) : INITIAL_DOKUMEN_VERIFIKASI[0];
  });
  const [hasSearched, setHasSearched] = React.useState(false);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasSearched(true);
    const result = lookupDokumenVerifikasi(INITIAL_DOKUMEN_VERIFIKASI, searchQuery);
    setActiveResult(result);
  };

  const handleSelectPreset = (doc: DokumenVerifikasiRecord) => {
    setSearchQuery(doc.kodeVerifikasi);
    setActiveResult(doc);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pusat Verifikasi Dokumen Resmi FT UNBARI
              </h3>
              <p className="text-xs text-slate-500">
                Cek keaslian Berita Acara Skripsi, Rekomendasi Yudisium, SKPI, dan Surat TU
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan Kode Verifikasi (cth: FT-UNBARI/2026/BA-SKR/042) atau NIM / No Surat..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              Verifikasi
            </button>
          </form>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Contoh Berkas Resmi untuk Pengujian Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INITIAL_DOKUMEN_VERIFIKASI.slice(0, 4).map((doc) => (
                <button
                  key={doc.kodeVerifikasi}
                  type="button"
                  onClick={() => handleSelectPreset(doc)}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 text-slate-700 font-mono transition-colors"
                >
                  {doc.jenisDokumen} ({doc.nim})
                </button>
              ))}
            </div>
          </div>

          {/* Verification Result Card */}
          {activeResult ? (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-4">
              
              {/* Badge & Authenticity Indicator */}
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-emerald-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide block">
                      Dokumen Asli &amp; Terdaftar Resmi
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Sistem Informasi Akademik Fakultas Teknik Universitas Batanghari
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-emerald-900 block font-bold">
                    STATUS VALID
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {activeResult.hashKeamanan}
                  </span>
                </div>
              </div>

              {/* Data Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Jenis Dokumen:</span>
                  <span className="font-bold text-slate-900">{activeResult.jenisDokumen}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">Nomor Surat Resmi:</span>
                  <span className="font-mono font-bold text-blue-900">{activeResult.nomorSurat}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">Nama Mahasiswa / Pemohon:</span>
                  <span className="font-semibold text-slate-900">{activeResult.namaMahasiswa}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">NIM / Register:</span>
                  <span className="font-mono font-bold text-slate-900">{activeResult.nim}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">Program Studi:</span>
                  <span className="text-slate-800">{activeResult.prodi}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">Tanggal Penerbitan:</span>
                  <span className="font-medium text-slate-800">{activeResult.tanggalTerbit}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-[11px] text-slate-500 block">Pejabat Pengesah:</span>
                  <span className="font-bold text-slate-900">{activeResult.pejabatPenandatangan}</span>{' '}
                  <span className="text-slate-500 text-[11px]">({activeResult.jabatanPejabat})</span>
                </div>

                <div className="sm:col-span-2 p-3 bg-white/80 rounded-lg border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Ringkasan Berkas Sah:
                  </span>
                  <p className="text-slate-800 leading-relaxed font-sans text-xs">
                    {activeResult.ringkasanIsi}
                  </p>
                </div>
              </div>

              {/* Footer Code & Visual Stamp */}
              <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500 border-t border-emerald-200/60 font-mono">
                <span>Kode: {activeResult.kodeVerifikasi}</span>
                <span>Terverifikasi Otentik · Dekanat FT UNBARI</span>
              </div>

            </div>
          ) : hasSearched ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
              <h4 className="text-sm font-bold text-red-950">Dokumen Tidak Ditemukan atau Tidak Valid</h4>
              <p className="text-xs text-red-700 max-w-md mx-auto">
                Kode verifikasi &quot;{searchQuery}&quot; tidak terdaftar dalam basis data arsip resmi Fakultas Teknik Universitas Batanghari. Pastikan nomor surat dan kode QR dimasukkan dengan benar.
              </p>
            </div>
          ) : null}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
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
