import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  GraduationCap 
} from 'lucide-react';
import { StandardKopSurat } from './StandardKopSurat';
import { printDocumentElement } from '../utils/printHelper';
import { 
  KrsRecord, 
  KhsRecord, 
  DpnaRecord, 
  TranskripNilaiRecord, 
  ProgramStudiInfo 
} from '../types/index';
import { DEKAN_FAKULTAS_TEKNIK, WAKIL_DEKAN_1 } from '../data/mockData';
import { SKALA_NILAI_UNBARI } from '../utils/gradeScaleHelper';

export type SiakadPrintType = 'KRS' | 'KHS' | 'TRANSKRIP' | 'DPNA';

interface SiakadPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: SiakadPrintType;
  selectedProdi: ProgramStudiInfo;
  krsData?: KrsRecord | null;
  khsData?: KhsRecord | null;
  transkripData?: TranskripNilaiRecord | null;
  dpnaData?: DpnaRecord | null;
  onShowToast?: (message: string) => void;
}

export const SiakadPrintModal: React.FC<SiakadPrintModalProps> = ({
  isOpen,
  onClose,
  type,
  selectedProdi,
  krsData,
  khsData,
  transkripData,
  dpnaData,
  onShowToast
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    let docTitle = 'Dokumen Akademik FT UNBARI';
    if (type === 'KRS' && krsData) {
      docTitle = `KRS_${krsData.nim}_${krsData.namaMahasiswa}`;
    } else if (type === 'KHS' && khsData) {
      docTitle = `KHS_${khsData.nim}_Sem${khsData.semester}_${khsData.namaMahasiswa}`;
    } else if (type === 'TRANSKRIP' && transkripData) {
      docTitle = `Transkrip_Akademik_${transkripData.nim}_${transkripData.nama}`;
    } else if (type === 'DPNA' && dpnaData) {
      docTitle = `DPNA_${dpnaData.kodeMK}_${dpnaData.kelas}_${selectedProdi.singkatan}`;
    }

    printDocumentElement(printRef.current, {
      documentTitle: docTitle,
      onAfterPrint: () => {
        if (onShowToast) {
          onShowToast('Dokumen akademik SIAKAD berhasil dikirim ke printer.');
        }
      }
    });
  };

  const getModalTitle = () => {
    switch (type) {
      case 'KRS': return 'Pratinjau Cetak Kartu Rencana Studi (KRS) - A4';
      case 'KHS': return 'Pratinjau Cetak Kartu Hasil Studi (KHS) - A4';
      case 'TRANSKRIP': return 'Pratinjau Cetak Transkrip Akademik Kumulatif - A4';
      case 'DPNA': return 'Pratinjau Cetak Daftar Peserta & Nilai Akhir (DPNA) - A4';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header Toolbar */}
        <div className="bg-blue-900 text-white px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-300 flex items-center justify-center border border-yellow-400/30">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{getModalTitle()}</h3>
              <p className="text-[11px] text-blue-200">
                Format Standar Resmi Fakultas Teknik Universitas Batanghari (Margin 1cm 1cm 1cm 1cm)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen (A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Printable Sheet Container */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/70 flex-1 flex justify-center">
          <div 
            ref={printRef}
            className="printable-sheet bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 text-slate-900 w-full max-w-[210mm] relative font-serif text-[11pt] leading-normal"
            style={{ minHeight: '297mm' }}
          >
            {/* Watermark Logo UNBARI */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] z-0">
              <img 
                src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
                alt="Watermark UNBARI" 
                className="w-[380px] h-[380px] object-contain"
              />
            </div>

            <div className="relative z-10">
              {/* Standard Kop Surat UNBARI */}
              <StandardKopSurat 
                prodiName={`PROGRAM STUDI ${selectedProdi.nama.toUpperCase()}`}
                subTitle="Sistem Informasi Akademik (SIAKAD) Terpadu"
              />

              {/* ======================================================== */}
              {/* 1. DOKUMEN KRS (KARTU RENCANA STUDI)                     */}
              {/* ======================================================== */}
              {type === 'KRS' && krsData && (
                <div className="space-y-4">
                  <div className="text-center border-b-2 border-slate-900 pb-2 mb-4">
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
                      KARTU RENCANA STUDI (KRS)
                    </h2>
                    <p className="text-xs font-semibold text-slate-700">
                      Tahun Akademik: {krsData.semesterAkademik}
                    </p>
                  </div>

                  {/* Biodata Mahasiswa */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs border border-slate-300 p-3 rounded bg-slate-50/50 mb-4">
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">NIM</span>
                      <span className="font-mono font-bold text-slate-950">: {krsData.nim}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Program Studi</span>
                      <span className="font-medium text-slate-900">: {krsData.programStudi}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Nama Mahasiswa</span>
                      <span className="font-bold text-slate-950 uppercase">: {krsData.namaMahasiswa}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Semester / Jenjang</span>
                      <span className="font-medium text-slate-900">: Semester {krsData.semesterMhs} ({selectedProdi.jenjang})</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Dosen Pembimbing (PA)</span>
                      <span className="font-medium text-slate-900">: {krsData.dosenPA}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Beban Max / Terambil</span>
                      <span className="font-bold text-blue-900">: {krsData.maxSksBeban} SKS / {krsData.totalSks} SKS</span>
                    </div>
                  </div>

                  {/* Tabel Mata Kuliah */}
                  <table className="w-full text-xs border-collapse border border-slate-400 mb-4">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold">
                        <th className="border border-slate-400 px-2 py-2 text-center w-8">No</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-16">Kode</th>
                        <th className="border border-slate-400 px-2 py-2 text-left">Mata Kuliah</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-12">SKS</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-12">Kelas</th>
                        <th className="border border-slate-400 px-2 py-2 text-left w-36">Jadwal & Ruang</th>
                        <th className="border border-slate-400 px-2 py-2 text-left">Dosen Pengampu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {krsData.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="border border-slate-400 px-2 py-1.5 text-center">{idx + 1}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-semibold">{item.kodeMK}</td>
                          <td className="border border-slate-400 px-2 py-1.5 font-medium">
                            {item.namaMK}
                            {item.isUlangRemedial && (
                              <span className="block text-[9.5px] text-amber-800 font-sans italic font-bold">
                                * Perbaikan Nilai SP (Nilai Asal: {item.nilaiAsalSebelumnya || 'D'})
                              </span>
                            )}
                          </td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">{item.sks}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center">{item.kelas}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-[10px]">
                            {item.hari}, {item.jamMulai}-{item.jamSelesai} ({item.ruangan})
                          </td>
                          <td className="border border-slate-400 px-2 py-1.5 text-[10.5px]">{item.dosen}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold text-slate-950">
                        <td colSpan={3} className="border border-slate-400 px-3 py-2 text-right">TOTAL SKS YANG DIRENCANAKAN:</td>
                        <td className="border border-slate-400 px-2 py-2 text-center text-sm font-mono">{krsData.totalSks}</td>
                        <td colSpan={3} className="border border-slate-400 px-2 py-2 text-[10px] text-slate-600">
                          Status: <strong className="text-emerald-700">{krsData.statusPersetujuan}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Catatan Akademik DPA */}
                  {krsData.catatanDpa && (
                    <div className="p-2.5 border border-dashed border-slate-300 rounded text-[10.5px] text-slate-700 bg-slate-50/70 mb-4">
                      <strong>Catatan Dosen Pembimbing Akademik (DPA):</strong> {krsData.catatanDpa}
                    </div>
                  )}

                  {/* Tanda Tangan */}
                  <div className="grid grid-cols-3 gap-6 pt-6 text-xs text-center break-inside-avoid">
                    <div className="flex flex-col items-center">
                      <div className="min-h-[2.75rem]">
                        <p className="text-slate-600 mb-0.5">Mengetahui,</p>
                        <p className="font-bold text-slate-900">Ketua Program Studi</p>
                      </div>
                      <div className="h-16 w-full" />
                      <div className="w-full max-w-[180px] border-t border-slate-400 pt-1">
                        <p className="font-bold text-slate-950">{selectedProdi.kaprodi}</p>
                        <p className="text-[10px] text-slate-600 font-mono">NIDN. {selectedProdi.nipKaprodi}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="min-h-[2.75rem]">
                        <p className="text-slate-600 mb-0.5">Disetujui oleh,</p>
                        <p className="font-bold text-slate-900">Dosen Pembimbing Akademik</p>
                      </div>
                      <div className="h-16 w-full" />
                      <div className="w-full max-w-[180px] border-t border-slate-400 pt-1">
                        <p className="font-bold text-slate-950">{krsData.dosenPA}</p>
                        <p className="text-[10px] text-slate-600 font-mono">DPA Fakultas Teknik</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="min-h-[2.75rem]">
                        <p className="text-slate-600 mb-0.5">Jambi, {krsData.tanggalPengajuan || '28 Agustus 2026'}</p>
                        <p className="font-bold text-slate-900">Mahasiswa Bersangkutan</p>
                      </div>
                      <div className="h-16 w-full" />
                      <div className="w-full max-w-[180px] border-t border-slate-400 pt-1">
                        <p className="font-bold text-slate-950">{krsData.namaMahasiswa}</p>
                        <p className="text-[10px] text-slate-600 font-mono">NIM. {krsData.nim}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 2. DOKUMEN KHS (KARTU HASIL STUDI)                     */}
              {/* ======================================================== */}
              {type === 'KHS' && khsData && (
                <div className="space-y-4">
                  <div className="text-center border-b-2 border-slate-900 pb-2 mb-4">
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
                      KARTU HASIL STUDI (KHS)
                    </h2>
                    <p className="text-xs font-semibold text-slate-700">
                      Semester {khsData.semester} · Tahun Akademik: {khsData.semesterAkademik}
                    </p>
                  </div>

                  {/* Biodata Mahasiswa */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs border border-slate-300 p-3 rounded bg-slate-50/50 mb-4">
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">NIM</span>
                      <span className="font-mono font-bold text-slate-950">: {khsData.nim}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Program Studi</span>
                      <span className="font-medium text-slate-900">: {khsData.programStudi}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Nama Mahasiswa</span>
                      <span className="font-bold text-slate-950 uppercase">: {khsData.namaMahasiswa}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Jenjang Studi</span>
                      <span className="font-medium text-slate-900">: {selectedProdi.jenjang} ({selectedProdi.fakultas})</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Dosen Pembimbing (PA)</span>
                      <span className="font-medium text-slate-900">: {khsData.dosenPA}</span>
                    </div>
                  </div>

                  {/* Tabel Nilai */}
                  <table className="w-full text-xs border-collapse border border-slate-400 mb-4">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold">
                        <th className="border border-slate-400 px-2 py-2 text-center w-8">No</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-16">Kode</th>
                        <th className="border border-slate-400 px-2 py-2 text-left">Mata Kuliah</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-12">SKS</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-12">Nilai</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-12">Grade</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-12">Bobot</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-14">Mutu (KxM)</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-16">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {khsData.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="border border-slate-400 px-2 py-1.5 text-center">{idx + 1}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-semibold">{item.kodeMK}</td>
                          <td className="border border-slate-400 px-2 py-1.5 font-medium">
                            {item.namaMK}
                            {item.isPerbaikanNilai && (
                              <span className="block text-[9.5px] text-emerald-800 font-sans italic font-bold">
                                * Nilai Diperbaiki dari {item.nilaiSebelumnya}
                              </span>
                            )}
                          </td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">{item.sks}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">{item.nilaiAkhir.toFixed(1)}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-bold text-blue-900">{item.hurufMutu}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">{item.bobot.toFixed(2)}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-mono font-bold">{item.mutu.toFixed(2)}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center text-[10px] text-emerald-800 font-semibold">{item.statusLulus}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold text-slate-950">
                        <td colSpan={3} className="border border-slate-400 px-3 py-2 text-right">TOTAL:</td>
                        <td className="border border-slate-400 px-2 py-2 text-center text-sm font-mono">{khsData.sksSemester}</td>
                        <td colSpan={3} className="border border-slate-400"></td>
                        <td className="border border-slate-400 px-2 py-2 text-center text-sm font-mono">
                          {khsData.items.reduce((acc, curr) => acc + curr.mutu, 0).toFixed(2)}
                        </td>
                        <td className="border border-slate-400"></td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Ringkasan Prestasi Akademik */}
                  <div className="grid grid-cols-4 gap-3 border border-slate-300 p-3 rounded bg-blue-50/50 text-center text-xs mb-4">
                    <div>
                      <span className="block text-slate-600 text-[10px]">SKS Semester Ini</span>
                      <strong className="text-base font-mono text-slate-900">{khsData.sksSemester}</strong>
                    </div>
                    <div>
                      <span className="block text-slate-600 text-[10px]">SKS Kumulatif</span>
                      <strong className="text-base font-mono text-slate-900">{khsData.sksKumulatif}</strong>
                    </div>
                    <div>
                      <span className="block text-blue-800 text-[10px] font-bold">IPS (Indeks Prestasi Semester)</span>
                      <strong className="text-base font-mono text-blue-950 font-black">{khsData.ips.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="block text-indigo-800 text-[10px] font-bold">IPK (Indeks Prestasi Kumulatif)</span>
                      <strong className="text-base font-mono text-indigo-950 font-black">{khsData.ipk.toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Tabel Skala Nilai UNBARI Resmi */}
                  <div className="p-2 border border-slate-300 rounded text-[9px] text-slate-600 bg-white mb-4">
                    <strong className="text-slate-800 block mb-1">Pedoman Skala Nilai Huruf Mutu Universitas Batanghari:</strong>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      {SKALA_NILAI_UNBARI.map((skala) => (
                        <span key={skala.huruf} className="inline-block px-1 bg-slate-50 rounded border border-slate-200">
                          <strong>{skala.huruf}</strong> ({skala.bobot.toFixed(2)}): {skala.huruf === 'E' ? '<=49.99' : `${skala.min}-${skala.max}`}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tanda Tangan */}
                  <div className="grid grid-cols-2 gap-10 pt-6 text-xs text-center break-inside-avoid">
                    <div className="flex flex-col items-center">
                      <div className="min-h-[2.75rem]">
                        <p className="text-slate-600 mb-0.5">Mengetahui,</p>
                        <p className="font-bold text-slate-900">Ketua Program Studi</p>
                      </div>
                      <div className="h-16 w-full" />
                      <div className="w-56 border-t border-slate-400 pt-1">
                        <p className="font-bold text-slate-950">{selectedProdi.kaprodi}</p>
                        <p className="text-[10px] text-slate-600 font-mono">NIDN. {selectedProdi.nipKaprodi}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="min-h-[2.75rem]">
                        <p className="text-slate-600 mb-0.5">Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="font-bold text-slate-900">Dosen Pembimbing Akademik</p>
                      </div>
                      <div className="h-16 w-full" />
                      <div className="w-56 border-t border-slate-400 pt-1">
                        <p className="font-bold text-slate-950">{khsData.dosenPA}</p>
                        <p className="text-[10px] text-slate-600 font-mono">DPA Fakultas Teknik</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 3. DOKUMEN TRANSKRIP AKADEMIK KUMULATIF                  */}
              {/* ======================================================== */}
              {type === 'TRANSKRIP' && transkripData && (
                <div className="space-y-4">
                  <div className="text-center border-b-2 border-slate-900 pb-2 mb-4">
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
                      TRANSKRIP AKADEMIK SEMENTARA
                    </h2>
                    <p className="text-xs font-semibold text-slate-700">
                      Nomor: {transkripData.nomorTranskrip}
                    </p>
                  </div>

                  {/* Biodata Lulusan */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs border border-slate-300 p-3 rounded bg-slate-50/50 mb-4">
                    <div className="flex">
                      <span className="w-36 font-bold text-slate-700">NIM</span>
                      <span className="font-mono font-bold text-slate-950">: {transkripData.nim}</span>
                    </div>
                    <div className="flex">
                      <span className="w-36 font-bold text-slate-700">Fakultas</span>
                      <span className="font-medium text-slate-900">: Fakultas Teknik</span>
                    </div>
                    <div className="flex">
                      <span className="w-36 font-bold text-slate-700">Nama Lengkap</span>
                      <span className="font-bold text-slate-950 uppercase">: {transkripData.nama}</span>
                    </div>
                    <div className="flex">
                      <span className="w-36 font-bold text-slate-700">Program Studi</span>
                      <span className="font-medium text-slate-900">: {transkripData.programStudi}</span>
                    </div>
                    <div className="flex">
                      <span className="w-36 font-bold text-slate-700">Tempat, Tgl Lahir</span>
                      <span className="font-medium text-slate-900">: {transkripData.tempatTanggalLahir}</span>
                    </div>
                    <div className="flex">
                      <span className="w-36 font-bold text-slate-700">Jenjang Pendidikan</span>
                      <span className="font-medium text-slate-900">: Strata Satu ({transkripData.jenjang})</span>
                    </div>
                  </div>

                  {/* Tabel Mata Kuliah Transkrip */}
                  <table className="w-full text-xs border-collapse border border-slate-400 mb-4">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold">
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-16">Kode</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-left">Nama Mata Kuliah</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-10">Sem</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-12">SKS</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-12">Nilai</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-12">Bobot</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-14">Mutu (KxM)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transkripData.items.map((item) => (
                        <tr key={item.no} className="hover:bg-slate-50">
                          <td className="border border-slate-400 px-2 py-1 text-center">{item.no}</td>
                          <td className="border border-slate-400 px-2 py-1 text-center font-mono font-semibold">{item.kodeMK}</td>
                          <td className="border border-slate-400 px-2 py-1">{item.namaMK}</td>
                          <td className="border border-slate-400 px-2 py-1 text-center font-mono">{item.semesterTempuh}</td>
                          <td className="border border-slate-400 px-2 py-1 text-center font-bold">{item.sks}</td>
                          <td className="border border-slate-400 px-2 py-1 text-center font-bold text-blue-900">{item.hurufMutu}</td>
                          <td className="border border-slate-400 px-2 py-1 text-center font-mono">{item.bobot.toFixed(2)}</td>
                          <td className="border border-slate-400 px-2 py-1 text-center font-mono font-bold">{item.mutu.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Ringkasan Kelulusan & Skripsi */}
                  <div className="border border-slate-300 p-3 rounded bg-slate-50/70 text-xs space-y-1.5 mb-4">
                    <div className="grid grid-cols-3 gap-2 text-center font-bold">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="block text-slate-500 text-[10px]">Total SKS Lulus</span>
                        <span className="text-sm font-mono text-slate-900">{transkripData.totalSksLulus} SKS</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="block text-slate-500 text-[10px]">Indeks Prestasi Kumulatif (IPK)</span>
                        <span className="text-sm font-mono text-blue-950 font-black">{transkripData.ipk.toFixed(2)}</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="block text-slate-500 text-[10px]">Predikat Kelulusan</span>
                        <span className="text-sm text-emerald-800">{transkripData.predikat}</span>
                      </div>
                    </div>
                    {transkripData.judulSkripsi && (
                      <div className="pt-2 text-[11px] text-slate-800">
                        <strong>Judul Tugas Akhir / Skripsi:</strong> <em>"{transkripData.judulSkripsi}"</em>
                      </div>
                    )}
                  </div>

                  {/* Tanda Tangan Dekan */}
                  <div className="flex justify-end pt-6 text-xs text-center break-inside-avoid">
                    <div className="w-64 flex flex-col items-center">
                      <div className="min-h-[3.25rem]">
                        <p className="text-slate-600 mb-0.5">Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="font-bold text-slate-900">Dekan Fakultas Teknik</p>
                        <p className="text-[10px] text-slate-500">Universitas Batanghari</p>
                      </div>
                      <div className="h-16 w-full" />
                      <div className="w-full border-t border-slate-400 pt-1">
                        <p className="font-bold text-slate-950">{DEKAN_FAKULTAS_TEKNIK.nama}</p>
                        <p className="text-[10px] text-slate-600 font-mono">NIDN. {DEKAN_FAKULTAS_TEKNIK.nidn}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 4. DOKUMEN DPNA (DAFTAR PESERTA & NILAI AKHIR)          */}
              {/* ======================================================== */}
              {type === 'DPNA' && dpnaData && (
                <div className="space-y-4">
                  <div className="text-center border-b-2 border-slate-900 pb-2 mb-4">
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
                      DAFTAR PESERTA &amp; NILAI AKHIR (DPNA)
                    </h2>
                    <p className="text-xs font-semibold text-slate-700">
                      Tahun Akademik: {dpnaData.semesterAkademik}
                    </p>
                  </div>

                  {/* Header Mata Kuliah */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs border border-slate-300 p-3 rounded bg-slate-50/50 mb-4">
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Mata Kuliah</span>
                      <span className="font-bold text-slate-950">: {dpnaData.namaMK} ({dpnaData.kodeMK})</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Program Studi</span>
                      <span className="font-medium text-slate-900">: {selectedProdi.nama}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Bobot SKS / Kelas</span>
                      <span className="font-medium text-slate-900">: {dpnaData.sks} SKS / Kelas {dpnaData.kelas}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-bold text-slate-700">Dosen Pengampu</span>
                      <span className="font-medium text-slate-900">: {dpnaData.dosenPengampu}</span>
                    </div>
                  </div>

                  {/* Tabel Peserta & Nilai */}
                  <table className="w-full text-xs border-collapse border border-slate-400 mb-4">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                        <th className="border border-slate-400 px-2 py-2 w-8">No</th>
                        <th className="border border-slate-400 px-2 py-2 w-24">NIM</th>
                        <th className="border border-slate-400 px-2 py-2 text-left">Nama Mahasiswa</th>
                        <th className="border border-slate-400 px-2 py-2 w-14">Hadir (10%)</th>
                        <th className="border border-slate-400 px-2 py-2 w-14">Tugas (20%)</th>
                        <th className="border border-slate-400 px-2 py-2 w-14">UTS (30%)</th>
                        <th className="border border-slate-400 px-2 py-2 w-14">UAS (40%)</th>
                        <th className="border border-slate-400 px-2 py-2 w-16">Nilai Akhir</th>
                        <th className="border border-slate-400 px-2 py-2 w-14">Huruf</th>
                        <th className="border border-slate-400 px-2 py-2 w-14">Bobot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dpnaData.peserta.map((p, idx) => (
                        <tr key={p.nim} className="hover:bg-slate-50 text-center">
                          <td className="border border-slate-400 px-2 py-1.5">{idx + 1}</td>
                          <td className="border border-slate-400 px-2 py-1.5 font-mono font-semibold">{p.nim}</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-left font-medium">{p.nama}</td>
                          <td className="border border-slate-400 px-2 py-1.5 font-mono">{p.kehadiran}</td>
                          <td className="border border-slate-400 px-2 py-1.5 font-mono">{p.tugas}</td>
                          <td className="border border-slate-400 px-2 py-1.5 font-mono">{p.uts}</td>
                          <td className="border border-slate-400 px-2 py-1.5 font-mono">{p.uas}</td>
                          <td className="border border-slate-400 px-2 py-1.5 font-mono font-bold text-slate-900">{p.nilaiAkhir.toFixed(1)}</td>
                          <td className="border border-slate-400 px-2 py-1.5 font-bold text-blue-900">{p.hurufMutu}</td>
                          <td className="border border-slate-400 px-2 py-1.5 font-mono">{p.bobot.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Tanda Tangan */}
                  <div className="grid grid-cols-2 gap-10 pt-6 text-xs text-center break-inside-avoid">
                    <div className="flex flex-col items-center">
                      <div className="min-h-[2.75rem]">
                        <p className="text-slate-600 mb-0.5">Mengetahui,</p>
                        <p className="font-bold text-slate-900">Ketua Program Studi</p>
                      </div>
                      <div className="h-16 w-full" />
                      <div className="w-56 border-t border-slate-400 pt-1">
                        <p className="font-bold text-slate-950">{selectedProdi.kaprodi}</p>
                        <p className="text-[10px] text-slate-600 font-mono">NIDN. {selectedProdi.nipKaprodi}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="min-h-[2.75rem]">
                        <p className="text-slate-600 mb-0.5">Jambi, {dpnaData.tanggalSubmit || new Date().toLocaleDateString('id-ID')}</p>
                        <p className="font-bold text-slate-900">Dosen Pengampu Mata Kuliah</p>
                      </div>
                      <div className="h-16 w-full" />
                      <div className="w-56 border-t border-slate-400 pt-1">
                        <p className="font-bold text-slate-950">{dpnaData.dosenPengampu}</p>
                        <p className="text-[10px] text-slate-600 font-mono">NIDN. {dpnaData.nidnPengampu || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Format cetak otomatis menyesuaikan ukuran kertas A4 potrait.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
