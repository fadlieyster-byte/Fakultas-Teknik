import React from 'react';
import { X, Printer, Building, UserCheck, ShieldCheck } from 'lucide-react';
import { JadwalKerjaPraktek, ProgramStudiInfo } from '../types/index';
import { printDirectToDefaultPrinter } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';

interface KpSeminarPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpItem: JadwalKerjaPraktek | null;
  selectedProdi: ProgramStudiInfo;
}

export const KpSeminarPrintModal: React.FC<KpSeminarPrintModalProps> = ({
  isOpen,
  onClose,
  kpItem,
  selectedProdi
}) => {
  const [isPrinting, setIsPrinting] = React.useState(false);

  if (!isOpen || !kpItem) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    printDirectToDefaultPrinter(
      'print-ba-kp-document',
      `Berita_Acara_Seminar_KP_${kpItem.nim}_${kpItem.namaMahasiswa.replace(/\s+/g, '_')}`,
      false
    );
    setTimeout(() => setIsPrinting(false), 800);
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const nilaiAngka = kpItem.nilaiHuruf === 'A' ? 88.5 
    : kpItem.nilaiHuruf === 'A-' ? 78.5 
    : kpItem.nilaiHuruf === 'B+' ? 76.0 
    : kpItem.nilaiHuruf === 'B' ? 72.5 
    : kpItem.nilaiHuruf === 'B-' ? 68.5 
    : kpItem.nilaiHuruf === 'C+' ? 66.0 
    : kpItem.nilaiHuruf === 'C' ? 62.5 
    : kpItem.nilaiHuruf === 'C-' ? 58.5 
    : kpItem.nilaiHuruf === 'D+' ? 56.0 
    : kpItem.nilaiHuruf === 'D' ? 52.0 
    : 45.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pratinjau Cetak Berita Acara Seminar Kerja Praktik (KP)
            </h3>
            <p className="text-xs text-slate-500">
              {kpItem.namaMahasiswa} ({kpItem.nim}) &bull; Mitra: {kpItem.instansiPerusahaan}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Mempersiapkan Printer...' : 'Cetak Dokumen Resmi (A4)'}</span>
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
            id="print-ba-kp-document"
            className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-10 shadow-md border border-slate-300 text-xs font-serif leading-relaxed"
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
                </div>
                <div className="w-20 shrink-0 flex flex-col items-center justify-center text-center">
                  <QrCodeSvg
                    value={`https://unbari.ac.id/ft/verifikasi?kode=FT-UNBARI/2026/BA-KP/${kpItem.nim}`}
                    size={60}
                    title="QR Validasi Berita Acara KP"
                  />
                  <span className="text-[7px] font-mono text-slate-500 mt-1">KP-VERIF</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-5">
              <h1 className="text-sm font-bold uppercase underline tracking-wide text-slate-900 font-serif">
                Berita Acara Seminar Hasil Kerja Praktik (KP)
              </h1>
              <p className="text-[11px] font-sans font-medium text-slate-700 mt-0.5">
                Nomor: 029/BA-KP/FT-UB/X/2026
              </p>
            </div>

            {/* Intro text */}
            <div className="font-serif text-justify text-xs space-y-3 mb-4">
              <p>
                Pada hari ini, <strong>{kpItem.hariSeminar || 'Rabu'}</strong> tanggal <strong>{kpItem.tanggalSeminar ? new Date(kpItem.tanggalSeminar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : currentDateFormatted}</strong> bertempat di <strong>{kpItem.ruangSeminar || 'Ruang Sidang Jurusan Teknik Sipil'}</strong> Fakultas Teknik Universitas Batanghari Jambi, telah dilaksanakan Seminar Hasil Kerja Praktik (KP) bagi mahasiswa:
              </p>
            </div>

            {/* Student & Project Details Box */}
            <div className="border border-slate-300 p-3.5 mb-5 font-sans text-[11px] bg-slate-50 rounded space-y-1.5">
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Nama Mahasiswa</span>
                <span className="col-span-2 font-bold text-slate-900">: {kpItem.namaMahasiswa}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Nomor Induk Mahasiswa (NIM)</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">: {kpItem.nim}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Program Studi / Jenjang</span>
                <span className="col-span-2 text-slate-900">: {selectedProdi.nama} ({selectedProdi.jenjang})</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Instansi / Perusahaan Mitra</span>
                <span className="col-span-2 font-bold text-blue-900">: {kpItem.instansiPerusahaan} ({kpItem.lokasiKota})</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Posisi / Objek Proyek</span>
                <span className="col-span-2 font-medium text-slate-800">: {kpItem.posisiProyek}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Periode Pelaksanaan</span>
                <span className="col-span-2 font-mono text-slate-700">: {kpItem.periodeMulai} s.d {kpItem.periodeSelesai}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Pembimbing Lapangan Mitra</span>
                <span className="col-span-2 text-slate-900">: {kpItem.pembimbingLapangan}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Dosen Pembimbing KP</span>
                <span className="col-span-2 font-bold text-slate-900">: {kpItem.dosenPembimbing}</span>
              </div>
            </div>

            {/* Assessment Component Table */}
            <div className="mb-5">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                Rekapitulasi Penilaian Kinerja &amp; Seminar Hasil KP
              </h4>
              <table className="w-full border-collapse border border-slate-400 font-sans text-[10px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold">
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Komponen Penilaian</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Penilai</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-14">Bobot</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-16">Nilai (0-100)</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-16">Terbobot</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono">1</td>
                    <td className="border border-slate-400 px-2 py-1 font-medium">Kinerja &amp; Kedisiplinan di Proyek Lapangan</td>
                    <td className="border border-slate-400 px-2 py-1 text-slate-700">Pembimbing Lapangan Perusahaan</td>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono">50%</td>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono font-bold">90.0</td>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono">45.0</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono">2</td>
                    <td className="border border-slate-400 px-2 py-1 font-medium">Bimbingan &amp; Mutu Naskah Laporan KP</td>
                    <td className="border border-slate-400 px-2 py-1 text-slate-700">Dosen Pembimbing Fakultas</td>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono">30%</td>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono font-bold">86.0</td>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono">25.8</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono">3</td>
                    <td className="border border-slate-400 px-2 py-1 font-medium">Penguasaan Materi &amp; Presentasi Seminar</td>
                    <td className="border border-slate-400 px-2 py-1 text-slate-700">Dosen Penguji Seminar</td>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono">20%</td>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono font-bold">88.5</td>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono">17.7</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td colSpan={3} className="border border-slate-400 px-2 py-1.5 text-right uppercase">Nilai Akhir Kumulatif:</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">100%</td>
                    <td colSpan={2} className="border border-slate-400 px-2 py-1.5 text-center font-mono font-bold text-blue-900 text-xs">
                      {nilaiAngka.toFixed(1)} / Grade {kpItem.nilaiHuruf || 'A'} (LULUS)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Closing statement */}
            <p className="font-serif text-justify text-xs mb-6">
              Berdasarkan hasil penilaian di atas, mahasiswa tersebut dinyatakan telah menyelesaikan seluruh rangkaian mata kuliah Kerja Praktik (KP) berbobot 3 (tiga) SKS dengan predikat <strong>LULUS ({kpItem.nilaiHuruf || 'A'})</strong>.
            </p>

            {/* Signatures 4 boxes */}
            <div className="font-sans text-[10px] pt-4 border-t border-slate-300">
              <div className="grid grid-cols-2 gap-y-8 gap-x-12 text-center">
                
                {/* Dosen Pembimbing */}
                <div>
                  <p className="text-slate-600">Dosen Pembimbing KP,</p>
                  <div className="h-16 flex items-end justify-center">
                    <div className="border-b border-black w-40 pb-0.5">
                      <span className="font-bold text-slate-900 block">{kpItem.dosenPembimbing}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 mt-0.5">Dosen Tetap FT UNBARI</p>
                </div>

                {/* Pembimbing Lapangan Mitra */}
                <div>
                  <p className="text-slate-600">Pembimbing Lapangan (Mitra Industri),</p>
                  <div className="h-16 flex items-end justify-center">
                    <div className="border-b border-black w-40 pb-0.5">
                      <span className="font-bold text-slate-900 block">{kpItem.pembimbingLapangan}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 mt-0.5">{kpItem.instansiPerusahaan}</p>
                </div>

                {/* Kaprodi */}
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-900">Ketua Program Studi {selectedProdi.singkatan},</p>
                  <div className="h-16 flex items-end justify-center">
                    <div className="border-b border-black w-40 pb-0.5">
                      <span className="font-bold text-slate-900 block">{selectedProdi.kaprodi}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 mt-0.5 font-mono">NIDN: {selectedProdi.nipKaprodi}</p>
                </div>

                {/* Dekan */}
                <div>
                  <p className="text-slate-600">Mengesahkan,</p>
                  <p className="font-bold text-slate-900">Dekan Fakultas Teknik UNBARI,</p>
                  <div className="h-16 flex items-end justify-center">
                    <div className="border-b border-black w-40 pb-0.5">
                      <span className="font-bold text-slate-900 block">Fadli Eka Yandra, ST., MT</span>
                    </div>
                  </div>
                  <p className="text-slate-600 mt-0.5 font-mono">NIDN: 1004077102</p>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
