import React from 'react';
import { X, Printer } from 'lucide-react';
import { BorangAkreditasiProdi, ProgramStudiInfo } from '../types/index';
import { printDirectToDefaultPrinter } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';

interface AkreditasiPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  borangData: BorangAkreditasiProdi;
  selectedProdi: ProgramStudiInfo;
}

export const AkreditasiPrintModal: React.FC<AkreditasiPrintModalProps> = ({
  isOpen,
  onClose,
  borangData,
  selectedProdi
}) => {
  const [isPrinting, setIsPrinting] = React.useState(false);
  const printableRef = React.useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = (previewOnly = false) => {
    setIsPrinting(true);
    printDirectToDefaultPrinter(
      'print-borang-akreditasi-document',
      `Borang_Akreditasi_LAM-Teknik_${borangData.namaProdi.replace(/\s+/g, '_')}`,
      previewOnly
    );
    setTimeout(() => setIsPrinting(false), 800);
  };

  const totalDokTersedia = borangData.kriteriaList.reduce((acc, k) => acc + k.dokumenTersedia, 0);
  const totalDokDibutuhkan = borangData.kriteriaList.reduce((acc, k) => acc + k.dokumenDibutuhkan, 0);
  const persenDokumen = Math.round((totalDokTersedia / totalDokDibutuhkan) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pratinjau Cetak Laporan Kesiapan Akreditasi LAM-Teknik
            </h3>
            <p className="text-xs text-slate-500">
              Program Studi {borangData.namaProdi} · Fakultas Teknik Universitas Batanghari
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrint(false)}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Mempersiapkan Printer...' : 'Cetak Dokumen Akreditasi'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          <div
            id="print-borang-akreditasi-document"
            ref={printableRef}
            className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-8 shadow-md border border-slate-300 text-xs font-serif leading-relaxed"
          >
            {/* Kop Surat Resmi FT UNBARI */}
            <div className="border-b-4 border-double border-slate-900 pb-3 mb-6">
              <div className="flex items-center justify-between gap-4">
                <img
                  src="/assets/aistudio/logo_unbari_8fe2adcb.png"
                  alt="Logo UNBARI"
                  className="w-20 h-20 object-contain shrink-0"
                />
                <div className="text-center flex-1 font-serif">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-slate-900">YAYASAN PENDIDIKAN JAMBI</h4>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">UNIVERSITAS BATANGHARI</h2>
                  <h3 className="text-sm font-extrabold text-blue-900 uppercase">FAKULTAS TEKNIK</h3>
                  <p className="text-[10px] text-slate-700 mt-1 leading-snug">
                    Jl. Slamet Riyadi No. 01 Broni - Kota Jambi 36122, Telp: (0741) 60103
                  </p>
                  <p className="text-[10px] text-slate-700 font-medium leading-snug">
                    Laman Resmi: <span className="text-blue-900 underline">https://universitasbatanghari.ac.id</span> · Surel: <span className="font-mono">ftunbari.tpa@gmail.com</span>
                  </p>
                  <p className="text-[9px] font-sans text-slate-600 italic mt-0.5">
                    Penjaminan Mutu &amp; Akreditasi LAM TEKNIK / BAN-PT
                  </p>
                </div>
                <div className="w-20 shrink-0 flex flex-col items-center justify-center text-center">
                  <QrCodeSvg
                    value="https://unbari.ac.id/ft/verifikasi?kode=FT-UNBARI/2026/BORANG-LAM/01"
                    size={64}
                    title="QR Validasi Borang Akreditasi"
                  />
                  <span className="text-[7px] font-mono text-slate-500 mt-1">VERIF-GPMF</span>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-5">
              <h1 className="text-sm font-bold uppercase underline tracking-wide text-slate-900">
                Laporan Evaluasi Diri (LED) &amp; Kesiapan Borang 9 Kriteria LAM-Teknik
              </h1>
              <p className="text-[11px] font-sans font-medium text-slate-700 mt-0.5">
                Nomor Register Mutu: 001/GPMF-LAMTEK/FT-UB/2026
              </p>
              <p className="text-[10px] font-sans text-slate-600">
                Tahun Evaluasi: 2025/2026 · Siklus Penjaminan Mutu Internal (SPMI FT UNBARI)
              </p>
            </div>

            {/* Profile Summary Box */}
            <div className="border border-slate-300 p-3 mb-5 font-sans text-[11px] bg-slate-50 rounded">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                <div>
                  <span className="text-slate-500">Program Studi:</span>{' '}
                  <span className="font-bold text-slate-900">{borangData.namaProdi} ({borangData.jenjang})</span>
                </div>
                <div>
                  <span className="text-slate-500">Peringkat Saat Ini:</span>{' '}
                  <span className="font-semibold text-slate-900">{borangData.peringkatSaatIni}</span>
                </div>
                <div>
                  <span className="text-slate-500">Target Re-Akreditasi:</span>{' '}
                  <span className="font-bold text-blue-800">{borangData.targetPeringkat}</span>
                </div>
                <div>
                  <span className="text-slate-500">Proyeksi Skor Total:</span>{' '}
                  <span className="font-bold font-mono text-emerald-800">{borangData.skorTotalProyeksi} / 400.00 ({borangData.predikatProyeksi})</span>
                </div>
                <div>
                  <span className="text-slate-500">Kelengkapan Dokumen Bukti:</span>{' '}
                  <span className="font-bold font-mono">{totalDokTersedia} dari {totalDokDibutuhkan} Berkas ({persenDokumen}%)</span>
                </div>
                <div>
                  <span className="text-slate-500">Masa Berlaku s.d:</span>{' '}
                  <span className="font-medium text-slate-800">{borangData.tanggalKadaluarsa}</span>
                </div>
              </div>
            </div>

            {/* 9 Criteria Table */}
            <div className="mb-5">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                A. Rekapitulasi Capaian 9 Kriteria Standar LAM-Teknik
              </h4>
              <table className="w-full border-collapse border border-slate-400 font-sans text-[10px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold">
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Kriteria Evaluasi</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-14">Bobot</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-16">Skor (4.0)</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-20">Dokumen</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Status Kesiapan</th>
                  </tr>
                </thead>
                <tbody>
                  {borangData.kriteriaList.map((k, idx) => (
                    <tr key={k.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono">{k.nomor}</td>
                      <td className="border border-slate-400 px-2 py-1 font-semibold text-slate-900">{k.nama}</td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono">{k.bobotPersen}%</td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-bold">{k.skorSkala4.toFixed(2)}</td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono">{k.dokumenTersedia}/{k.dokumenDibutuhkan}</td>
                      <td className="border border-slate-400 px-2 py-1">
                        <span className="font-medium text-slate-800">{k.status}</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-200 font-bold text-slate-900">
                    <td colSpan={2} className="border border-slate-400 px-2 py-1.5 text-right uppercase">Rata-Rata Terbobot / Proyeksi Hasil:</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">100%</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono text-blue-900 font-extrabold">
                      {(borangData.kriteriaList.reduce((acc, k) => acc + (k.skorSkala4 * k.bobotPersen) / 100, 0)).toFixed(2)}
                    </td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">{totalDokTersedia}/{totalDokDibutuhkan}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-emerald-900 uppercase">{borangData.predikatProyeksi} (Skor {borangData.skorTotalProyeksi})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* OBE CPL Table */}
            <div className="mb-6">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                B. Ketercapaian Capaian Pembelajaran Lulusan (CPL-OBE)
              </h4>
              <table className="w-full border-collapse border border-slate-400 font-sans text-[10px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold">
                    <th className="border border-slate-400 px-2 py-1 text-center w-14">Kode</th>
                    <th className="border border-slate-400 px-2 py-1 text-left w-28">Ranah</th>
                    <th className="border border-slate-400 px-2 py-1 text-left">Deskripsi Kompetensi Lulusan</th>
                    <th className="border border-slate-400 px-2 py-1 text-center w-14">Target</th>
                    <th className="border border-slate-400 px-2 py-1 text-center w-16">Realisasi</th>
                    <th className="border border-slate-400 px-2 py-1 text-center w-16">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {borangData.cplList.map((cpl, idx) => (
                    <tr key={cpl.kode} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-bold">{cpl.kode}</td>
                      <td className="border border-slate-400 px-2 py-1 font-medium">{cpl.ranah}</td>
                      <td className="border border-slate-400 px-2 py-1 text-slate-700">{cpl.deskripsi}</td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono">{cpl.targetPersen}%</td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-bold text-emerald-800">{cpl.realisasiPersen}%</td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-semibold text-slate-800">{cpl.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Validation & Signatures */}
            <div className="font-sans text-[11px] pt-4 border-t border-slate-300">
              <div className="flex justify-between items-start">
                
                {/* Left: Verification QR & GPMF Note */}
                <div className="max-w-[260px] space-y-2">
                  <div className="flex items-center gap-3 border border-slate-300 p-2 rounded bg-slate-50">
                    <QrCodeSvg
                      value="https://unbari.ac.id/ft/verifikasi?kode=FT-UNBARI/2026/BORANG-LAM/01"
                      size={60}
                      title="Validasi Borang Mutu"
                    />
                    <div>
                      <span className="text-[9px] font-bold text-slate-800 block">Sistem Penjaminan Mutu</span>
                      <span className="text-[8px] font-mono text-slate-600 block">Kode: FT-UNBARI/2026/BORANG-LAM/01</span>
                      <span className="text-[8px] text-emerald-700 font-semibold block">Dokumen Sah &amp; Terverifikasi</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 italic">
                    Dicetak secara elektronik melalui SiKaprodi FT UNBARI untuk keperluan audit internal dan re-akreditasi LAM-Teknik.
                  </p>
                </div>

                {/* Right: Signatures of Dekan & Kaprodi */}
                <div className="grid grid-cols-2 gap-8 text-center min-w-[340px]">
                  <div>
                    <p className="text-slate-600">Mengetahui,</p>
                    <p className="font-bold text-slate-900">Ketua Program Studi</p>
                    <div className="h-16 flex items-end justify-center">
                      <div className="border-b border-black w-36 pb-0.5">
                        <span className="font-bold text-[11px] text-slate-900 block">{selectedProdi.kaprodi}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIDN: {selectedProdi.nipKaprodi}</p>
                  </div>

                  <div>
                    <p className="text-slate-600">Jambi, 28 Oktober 2026</p>
                    <p className="font-bold text-slate-900">Dekan Fakultas Teknik</p>
                    <div className="h-16 flex items-end justify-center">
                      <div className="border-b border-black w-36 pb-0.5">
                        <span className="font-bold text-[11px] text-slate-900 block">Fadli Eka Yandra, ST., MT</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIDN: 1004077102</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
