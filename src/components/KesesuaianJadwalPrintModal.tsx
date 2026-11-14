import React, { useState } from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { KetersediaanJadwalDosen, ProgramStudiInfo, Dosen } from '../types/index';
import { printDirectToDefaultPrinter } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';
import { DAFTAR_HARI } from '../data/mockKetersediaanJadwalData';

interface KesesuaianJadwalPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  ketersediaanList: KetersediaanJadwalDosen[];
  selectedProdi: ProgramStudiInfo;
  dosenList: Dosen[];
}

export const KesesuaianJadwalPrintModal: React.FC<KesesuaianJadwalPrintModalProps> = ({
  isOpen,
  onClose,
  ketersediaanList,
  selectedProdi,
  dosenList
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    printDirectToDefaultPrinter(
      'print-tabel-kesesuaian-jadwal',
      `Tabel_Kesesuaian_Jadwal_Dosen_${selectedProdi.id}_UNBARI`,
      false
    );
    setTimeout(() => setIsPrinting(false), 800);
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pratinjau Cetak Tabel Kesesuaian Jadwal Dosen (A4)
              </h3>
              <p className="text-[11px] text-slate-500">
                Format standar Fakultas Teknik Universitas Batanghari untuk penjadwalan Seminar KP &amp; Sidang TA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? 'Mencetak...' : 'Cetak / Unduh PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Printable Document Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div 
            id="print-tabel-kesesuaian-jadwal"
            className="bg-white p-8 w-[210mm] min-h-[297mm] shadow-lg text-slate-900 font-sans print:shadow-none print:w-full print:p-0"
          >
            {/* Standard Official Kop Surat UNBARI */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-5">
              <div className="flex items-center gap-4">
                <img 
                  src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
                  alt="Logo UNBARI" 
                  className="w-16 h-16 object-contain" 
                />
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
                    Yayasan Pendidikan Batanghari Jambi
                  </h4>
                  <h2 className="text-base font-black uppercase tracking-tight text-slate-950">
                    Universitas Batanghari Jambi
                  </h2>
                  <h3 className="text-xs font-black uppercase text-blue-900 tracking-wide">
                    Fakultas Teknik &bull; {selectedProdi.nama}
                  </h3>
                  <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                    Jl. Slamet Ryadi, Broni, Telanaipura, Kota Jambi, Jambi 36122 &bull; Telp: (0741) 60103 &bull; Laman: ft.unbari.ac.id
                  </p>
                </div>
              </div>
              <div className="text-right border-l-2 border-blue-900 pl-3">
                <span className="text-[9px] font-bold uppercase text-slate-500 block">Formulir Mutu</span>
                <span className="text-xs font-mono font-black text-blue-900">FM-FT-AKD-08</span>
                <span className="text-[8.5px] text-slate-400 block mt-0.5">Rev: 02 / 2026</span>
              </div>
            </div>

            {/* Title from WhatsApp Image */}
            <div className="text-center mb-5">
              <h1 className="text-sm font-black uppercase tracking-wide text-slate-900">
                Tabel Kesesuaian Jadwal Dosen Pembahas/Penguji Seminar KP dan TA
              </h1>
              <div className="inline-block mt-1 px-3 py-0.5 bg-[#003876] text-white text-[10px] font-bold rounded-full">
                Periode : Senin – Sabtu &bull; Semester Ganjil TA 2026/2027
              </div>
            </div>

            {/* The Table reproducing the image */}
            <table className="w-full border-collapse border border-slate-900 text-[10px] mb-4">
              <thead>
                <tr className="bg-[#003876] text-white text-center font-bold">
                  <th className="border border-slate-900 py-2 px-1 w-8">No.</th>
                  <th className="border border-slate-900 py-2 px-2 w-48 text-left">Nama Dosen</th>
                  {DAFTAR_HARI.map(hari => (
                    <th key={hari} className="border border-slate-900 py-1.5 px-1.5 w-24">
                      <div className="font-bold text-[10px]">{hari}</div>
                      <div className="font-normal text-[8px] text-blue-200">Tersedia (Jam)</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ketersediaanList.map((dosen, idx) => (
                  <tr key={dosen.id} className="text-center">
                    <td className="border border-slate-900 py-1.5 px-1 font-bold text-slate-800">
                      {idx + 1}.
                    </td>
                    <td className="border border-slate-900 py-1.5 px-2 text-left">
                      <div className="font-bold text-slate-950 text-[10px] leading-tight">
                        {dosen.namaDosen}
                      </div>
                      <div className="text-[8.5px] text-slate-500 font-mono">
                        NIDN: {dosen.nidn}
                      </div>
                    </td>
                    {DAFTAR_HARI.map(hari => {
                      const hariKey = hari.toLowerCase() as 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
                      const slot = dosen[hariKey];
                      return (
                        <td key={hari} className="border border-slate-900 py-1.5 px-1 align-middle">
                          {slot.status === 'bersedia_penuh' && (
                            <span className="font-black text-emerald-800 text-sm">✓</span>
                          )}
                          {slot.status === 'tidak_bersedia' && (
                            <span className="font-black text-red-700 text-xs">✕</span>
                          )}
                          {slot.status === 'jam_khusus' && (
                            <div className="font-bold text-[9px] text-slate-900 leading-tight">
                              {slot.jam}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bottom Boxes: Keterangan Pengisian & Catatan matching image */}
            <div className="grid grid-cols-12 gap-3 text-[9px] mb-6">
              
              {/* Box 1: Keterangan Pengisian */}
              <div className="col-span-5 border border-slate-900 rounded-lg p-2.5 bg-slate-50">
                <div className="inline-block px-2 py-0.5 bg-[#003876] text-white text-[8.5px] font-black rounded mb-2">
                  Keterangan Pengisian:
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-emerald-800 text-xs">✓</span>
                    <span>= Bersedia / tersedia penuh</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-red-700 text-xs">✕</span>
                    <span>= Tidak tersedia</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-bold">Jam</span>
                    <span>= Tersedia pada jam tertentu (misal : 09.00 – 12.00)</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Catatan */}
              <div className="col-span-7 border border-slate-900 rounded-lg p-2.5 bg-slate-50">
                <div className="inline-block px-2 py-0.5 bg-[#003876] text-white text-[8.5px] font-black rounded mb-2">
                  Catatan:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-800 leading-relaxed">
                  <li>Dosen mengisi ketersediaan waktu dari Senin sampai Sabtu.</li>
                  <li>Jadwal seminar KP/TA disusun berdasarkan irisan waktu ketersediaan dosen pembahas dan penguji.</li>
                  <li>Menghindari benturan dengan jadwal mengajar, kegiatan akademik lain, dan penugasan fakultas.</li>
                </ul>
              </div>

            </div>

            {/* Signatures & Formal Validation */}
            <div className="pt-2 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-[10px]">
              <div>
                <p className="text-slate-500 mb-0.5">Mengetahui,</p>
                <p className="font-bold text-slate-900">Dekan Fakultas Teknik UNBARI</p>
                <div className="my-2 flex justify-center">
                  <QrCodeSvg 
                    value={`VALIDASI-FT-UNBARI:DEKAN:1004077102:TABEL-JADWAL-KP-TA:${selectedProdi.id}`} 
                    size={52} 
                  />
                </div>
                <p className="font-bold text-slate-950 underline leading-none">
                  Ir. Fadli Eka Yandra, S.T., M.T.
                </p>
                <p className="text-[9px] text-slate-600 font-mono mt-0.5">NIDN: 1004077102</p>
              </div>

              <div>
                <p className="text-slate-500 mb-0.5">Kota Jambi, {currentDateFormatted}</p>
                <p className="font-bold text-slate-900">Ketua Program Studi {selectedProdi.singkatan}</p>
                <div className="my-2 flex justify-center">
                  <QrCodeSvg 
                    value={`VALIDASI-FT-UNBARI:KAPRODI:${selectedProdi.nipKaprodi}:TABEL-JADWAL-KP-TA:${selectedProdi.id}`} 
                    size={52} 
                  />
                </div>
                <p className="font-bold text-slate-950 underline leading-none">
                  {selectedProdi.kaprodi}
                </p>
                <p className="text-[9px] text-slate-600 font-mono mt-0.5">NIP/NIDN: {selectedProdi.nipKaprodi}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
