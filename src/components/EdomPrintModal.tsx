import React from 'react';
import { X, Printer, UserCheck, Award, Star, CheckCircle2 } from 'lucide-react';
import { Dosen, ProgramStudiInfo } from '../types/index';
import { printDirectToDefaultPrinter } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';

interface EdomPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  dosen: Dosen | null;
  selectedProdi: ProgramStudiInfo;
}

export const EdomPrintModal: React.FC<EdomPrintModalProps> = ({
  isOpen,
  onClose,
  dosen,
  selectedProdi
}) => {
  const [isPrinting, setIsPrinting] = React.useState(false);

  if (!isOpen || !dosen) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    printDirectToDefaultPrinter(
      'print-edom-dosen-document',
      `Rapor_EDOM_${dosen.nidn}_${dosen.namaLengkap.replace(/\s+/g, '_')}`,
      false
    );
    setTimeout(() => setIsPrinting(false), 800);
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate scores based on lecturer NIDN deterministically
  const baseScore = 3.75 + ((parseInt(dosen.nidn.slice(-2)) || 20) % 20) * 0.01;
  const scorePedagogik = (baseScore + 0.04).toFixed(2);
  const scoreProfesional = (baseScore + 0.08).toFixed(2);
  const scoreKepribadian = (baseScore + 0.02).toFixed(2);
  const scoreSosial = (baseScore - 0.02).toFixed(2);
  const scoreTotal = (
    (parseFloat(scorePedagogik) + parseFloat(scoreProfesional) + parseFloat(scoreKepribadian) + parseFloat(scoreSosial)) / 4
  ).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rapor Evaluasi Dosen oleh Mahasiswa (EDOM)
            </h3>
            <p className="text-xs text-slate-500">
              {dosen.namaLengkap} &bull; NIDN: {dosen.nidn} &bull; {selectedProdi.nama}
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
              <span>{isPrinting ? 'Mempersiapkan...' : 'Cetak Rapor EDOM (A4)'}</span>
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
            id="print-edom-dosen-document"
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
                  <p className="text-[9px] font-sans text-slate-600 italic mt-0.5">
                    Gugus Penjaminan Mutu Fakultas (GPMF) &bull; Penjaminan Mutu Pembelajaran
                  </p>
                </div>
                <div className="w-20 shrink-0 flex flex-col items-center justify-center text-center">
                  <QrCodeSvg
                    value={`https://unbari.ac.id/ft/verifikasi?kode=FT-UNBARI/2026/EDOM/${dosen.nidn}`}
                    size={60}
                    title="QR Validasi EDOM Dosen"
                  />
                  <span className="text-[7px] font-mono text-slate-500 mt-1">EDOM-VERIF</span>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-5">
              <h1 className="text-sm font-bold uppercase underline tracking-wide text-slate-900 font-serif">
                Rapor Hasil Evaluasi Dosen oleh Mahasiswa (EDOM)
              </h1>
              <p className="text-[11px] font-sans font-medium text-slate-700 mt-0.5">
                Nomor: 114/GPMF-EDOM/FT-UB/2026 &bull; Semester Ganjil TA 2025/2026
              </p>
            </div>

            {/* Profile Dosen Box */}
            <div className="border border-slate-300 p-3.5 mb-5 font-sans text-[11px] bg-slate-50 rounded space-y-1">
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Nama Dosen Pengampu</span>
                <span className="col-span-2 font-bold text-slate-900">: {dosen.namaLengkap}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Nomor Induk Dosen Nasional (NIDN)</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">: {dosen.nidn}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Jabatan Fungsional Akademik</span>
                <span className="col-span-2 font-semibold text-slate-800">: {dosen.jabatanFungsional}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Program Studi Homebase</span>
                <span className="col-span-2 text-slate-900">: {selectedProdi.nama}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Bidang Keahlian Utama</span>
                <span className="col-span-2 text-slate-800">: {dosen.keahlian}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-600 font-medium">Tingkat Kehadiran Mengajar (BAP)</span>
                <span className="col-span-2 font-mono font-bold text-emerald-800">: {dosen.kehadiranBapPersen}% Sesi Kuliah Terlaksana</span>
              </div>
            </div>

            {/* Assessment Dimensions Table */}
            <div className="mb-5">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                Hasil Penilaian 4 Dimensi Kompetensi Pengajaran (Skala 1.00 - 4.00)
              </h4>
              <table className="w-full border-collapse border border-slate-400 font-sans text-[10px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold">
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Dimensi Kompetensi Dosen</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">Indikator yang Dinilai Mahasiswa</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-20">Skor (4.00)</th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-24">Predikat Kinerja</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">1</td>
                    <td className="border border-slate-400 px-2 py-1.5 font-bold text-slate-900">Kompetensi Pedagogik</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-slate-700">
                      Kesesuaian silabus/RPS, kejelasan materi, variasi metode belajar, dan ketepatan waktu hadir.
                    </td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-bold">{scorePedagogik}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center text-emerald-800 font-semibold">Sangat Baik</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">2</td>
                    <td className="border border-slate-400 px-2 py-1.5 font-bold text-slate-900">Kompetensi Profesional</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-slate-700">
                      Penguasaan keilmuan keteknikan mutakhir, keterkaitan dengan studi kasus riil industri/lapangan.
                    </td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-bold">{scoreProfesional}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center text-emerald-800 font-semibold">Sangat Baik</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">3</td>
                    <td className="border border-slate-400 px-2 py-1.5 font-bold text-slate-900">Kompetensi Kepribadian</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-slate-700">
                      Keteladanan etika, kewibawaan akademis, transparansi dan objektivitas pemberian nilai tugas.
                    </td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-bold">{scoreKepribadian}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center text-emerald-800 font-semibold">Sangat Baik</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">4</td>
                    <td className="border border-slate-400 px-2 py-1.5 font-bold text-slate-900">Kompetensi Sosial</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-slate-700">
                      Keterbukaan komunikasi, keramahan melayani konsultasi bimbingan, dan kepedulian pada mahasiswa.
                    </td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-bold">{scoreSosial}</td>
                    <td className="border border-slate-400 px-2 py-1.5 text-center text-emerald-800 font-semibold">Sangat Baik</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td colSpan={3} className="border border-slate-400 px-2 py-2 text-right uppercase">
                      Indeks Kinerja Pembelajaran Dosen (IKPD Total):
                    </td>
                    <td className="border border-slate-400 px-2 py-2 text-center font-mono text-blue-900 text-xs font-extrabold">
                      {scoreTotal}
                    </td>
                    <td className="border border-slate-400 px-2 py-2 text-center text-emerald-900 font-bold uppercase text-[11px]">
                      SANGAT BAIK
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Student Feedback Quote Box */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded mb-6 font-sans text-[10px]">
              <span className="font-bold text-slate-700 uppercase block mb-1">
                Ringkasan Masukan Konstruktif Mahasiswa:
              </span>
              <p className="text-slate-800 italic leading-relaxed">
                "Penjelasan materi terstruktur dan mudah dipahami. Contoh-contoh perhitungan teknis sangat aplikatif sesuai standar SNI. Bimbingan tugas besar berjalan komunikatif dan tepat waktu."
              </p>
            </div>

            {/* Signatures */}
            <div className="font-sans text-[11px] pt-4 border-t border-slate-300">
              <div className="flex justify-between items-start">
                
                {/* Left: GPMF Authenticity */}
                <div className="max-w-[240px]">
                  <span className="text-[9px] font-bold text-slate-800 block">Sistem Penjaminan Mutu Pembelajaran</span>
                  <p className="text-[9px] text-slate-500 mt-1">
                    Rapor ini diterbitkan secara resmi oleh GPMF Fakultas Teknik UNBARI sebagai dokumen portofolio Beban Kerja Dosen (BKD) dan syarat usulan kenaikan jabatan fungsional.
                  </p>
                </div>

                {/* Right: Dekanat Signatures */}
                <div className="grid grid-cols-2 gap-8 text-center min-w-[340px]">
                  <div>
                    <p className="text-slate-600">Mengetahui,</p>
                    <p className="font-bold text-slate-900">Wakil Dekan I (Akademik)</p>
                    <div className="h-16 flex items-end justify-center">
                      <div className="border-b border-black w-36 pb-0.5">
                        <span className="font-bold text-[11px] text-slate-900 block">Hadrah, ST., MT</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIDN: 1022067301</p>
                  </div>

                  <div>
                    <p className="text-slate-600">Jambi, {currentDateFormatted}</p>
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
