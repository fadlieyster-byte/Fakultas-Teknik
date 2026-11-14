import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, FileText, CheckCircle2, ShieldCheck, Download, Loader2 } from 'lucide-react';
import { SuratPermohonanTU, SuratAgendaTU, ProgramStudiInfo } from '../types/index';
import { DEKAN_FAKULTAS_TEKNIK } from '../data/mockData';
import { STAFF_TU_FAKULTAS } from '../data/mockTataUsahaData';
import { printDocumentElement } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';

interface SuratTuPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratPermohonanTU | null;
  agenda: SuratAgendaTU | null;
  selectedProdi: ProgramStudiInfo;
  mode: 'SURAT_MAHASISWA' | 'DISPOSISI_DEKAN';
}

export const SuratTuPrintModal: React.FC<SuratTuPrintModalProps> = ({
  isOpen,
  onClose,
  surat,
  agenda,
  selectedProdi,
  mode
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Keyboard shortcut Ctrl+P while modal is active
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, surat, agenda, mode]);

  if (!isOpen) return null;

  const docTitle = mode === 'SURAT_MAHASISWA' && surat
    ? `${surat.jenisSurat} - ${surat.pemohonNama} (${surat.nomorSurat})`
    : `Disposisi Dekan FT UNBARI - ${agenda?.nomorAgenda || 'Surat'}`;

  const handlePrint = (usePopup = false) => {
    setIsPrinting(true);
    printDocumentElement(printAreaRef.current, {
      documentTitle: docTitle,
      usePopupFallback: usePopup,
      onAfterPrint: () => setIsPrinting(false)
    });
    setTimeout(() => setIsPrinting(false), 1200);
  };


  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 modal-top-bar">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Pratinjau &amp; Cetak Surat Resmi Tata Usaha FT UNBARI
              </h3>
              <p className="text-[11px] text-slate-400">
                Format Persuratan Resmi Yayasan Pendidikan Jambi - Universitas Batanghari
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrint(false)}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors"
              title="Cetak langsung menggunakan printer default komputer Anda (Ctrl + P)"
            >
              {isPrinting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
              <span>{isPrinting ? 'Mempersiapkan...' : 'Cetak ke Printer Default (Ctrl+P)'}</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrint(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              title="Buka dokumen di jendela baru lalu cetak"
            >
              <span>Jendela Baru</span>
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

        {/* Printable Document Paper */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div 
            ref={printAreaRef}
            className="printable-document printable-sheet bg-white border border-slate-300 shadow-lg p-8 sm:p-12 w-full max-w-[780px] text-slate-900 font-serif leading-relaxed text-sm print:p-0 print:border-none print:shadow-none"
          >
            {/* OFFICIAL LETTERHEAD (KOP SURAT FAKULTAS TEKNIK) */}
            <div className="border-b-4 border-double border-slate-900 pb-3 mb-6 text-center relative font-sans">
              <div className="flex items-center justify-center gap-4">
                <img 
                  src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
                  alt="Logo Universitas Batanghari" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0" 
                />
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 leading-tight">
                    YAYASAN PENDIDIKAN JAMBI
                  </h4>
                  <h2 className="text-base sm:text-lg font-black uppercase text-blue-950 tracking-wide leading-tight mt-0.5">
                    UNIVERSITAS BATANGHARI
                  </h2>
                  <h3 className="text-sm sm:text-base font-extrabold uppercase text-slate-900 leading-tight mt-0.5">
                    FAKULTAS TEKNIK
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-700 font-normal mt-1 leading-snug">
                    Jl. Slamet Riyadi No. 01 Broni - Kota Jambi 36122, Telp: (0741) 60103
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-700 font-medium leading-snug">
                    Laman Resmi: <span className="text-blue-900 underline">https://universitasbatanghari.ac.id</span> · Surel: <span className="font-mono">ftunbari.tpa@gmail.com</span>
                  </p>
                </div>
              </div>
            </div>

            {/* MODE 1: SURAT KETERANGAN MAHASISWA AKTIF / SURAT PENGANTAR / SURAT KEPUTUSAN */}
            {mode === 'SURAT_MAHASISWA' && surat && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                
                {/* Kondisi Khusus: Surat Keputusan (SK) Dekan */}
                {surat.jenisSurat.startsWith('Surat Keputusan') || surat.dataTambahan?.isSkDekan ? (
                  <div className="space-y-3">
                    <div className="text-center space-y-1 mb-5">
                      <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-950 font-serif">
                        SURAT KEPUTUSAN DEKAN FAKULTAS TEKNIK UNIVERSITAS BATANGHARI
                      </h3>
                      <p className="text-xs font-mono font-bold text-slate-900">
                        NOMOR : {surat.nomorSurat}
                      </p>
                      <div className="pt-1">
                        <p className="text-[11px] font-bold uppercase text-slate-800 tracking-wide leading-snug">
                          TENTANG<br />
                          {surat.keperluan}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-justify text-xs sm:text-sm leading-relaxed">
                      <div className="grid grid-cols-[90px_1fr] gap-2">
                        <span className="font-bold text-slate-900">MENIMBANG :</span>
                        <div className="space-y-1">
                          <p>a. Bahwa untuk kelancaran pelaksanaan tridharma perguruan tinggi dan tertib administrasi akademik pada Fakultas Teknik Universitas Batanghari, dipandang perlu menerbitkan Surat Keputusan;</p>
                          <p>b. Bahwa pejabat/dosen/mahasiswa yang namanya tercantum dalam keputusan ini dipandang cakap dan memenuhi syarat untuk melaksanakan tugas yang diamanahkan;</p>
                          <p>c. Bahwa berdasarkan pertimbangan huruf a dan b di atas, perlu menetapkan Keputusan Dekan Fakultas Teknik Universitas Batanghari.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-[90px_1fr] gap-2 pt-1">
                        <span className="font-bold text-slate-900">MENGINGAT :</span>
                        <div className="space-y-1">
                          <p>1. Undang-Undang Republik Indonesia Nomor 12 Tahun 2012 tentang Pendidikan Tinggi;</p>
                          <p>2. Statuta Universitas Batanghari Jambi;</p>
                          <p>3. Peraturan Akademik Fakultas Teknik Universitas Batanghari Tahun 2025/2026.</p>
                        </div>
                      </div>

                      <div className="text-center font-bold text-slate-950 pt-2 tracking-wider">
                        MEMUTUSKAN
                      </div>

                      <div className="grid grid-cols-[90px_1fr] gap-2 pt-1">
                        <span className="font-bold text-slate-900">MENETAPKAN :</span>
                        <div className="space-y-2">
                          <p>
                            <strong>KESATU : </strong>
                            {surat.jenisSurat.includes('Mengajar') ? (
                              <span>Menugaskan Saudara/i <strong>{surat.pemohonNama}</strong> (NIDN: {surat.pemohonNimNidn}) sebagai Dosen Pengampu mata kuliah <strong>{surat.dataTambahan?.mataKuliah || 'Mata Kuliah Terkait'}</strong> ({surat.dataTambahan?.sks || 3} SKS) pada Program Studi {surat.programStudi} Semester {surat.dataTambahan?.semester || 3} Tahun Akademik {surat.dataTambahan?.tahunAkademik || '2026/2027'}.</span>
                            ) : surat.jenisSurat.includes('Bimbingan') ? (
                              <span>Menetapkan Dosen Pembimbing untuk mahasiswa <strong>{surat.pemohonNama}</strong> (NIM: {surat.pemohonNimNidn}) Program Studi {surat.programStudi} dengan Dosen Pembimbing: <strong>{surat.dataTambahan?.dosenPembimbing1 || 'Dosen Pembimbing'}</strong> {surat.dataTambahan?.dosenPembimbing2 ? `dan ${surat.dataTambahan.dosenPembimbing2}` : ''} dengan perihal/judul: <em>"{surat.dataTambahan?.judulPenelitian || surat.keperluan}"</em>.</span>
                            ) : (
                              <span>Menetapkan kelulusan Rapat Yudisium Dekanat bagi mahasiswa Fakultas Teknik Universitas Batanghari sejumlah <strong>{surat.dataTambahan?.jumlahPeserta || 14} Lulusan</strong> dan pemberian gelar akademik Sarjana Teknik (S.T.) / Ahli Madya Teknik (A.Md.T.) periode berjalan.</span>
                            )}
                          </p>
                          <p>
                            <strong>KEDUA : </strong>
                            Kepada yang bersangkutan diberikan wewenang dan kewajiban melaksanakan tugas tridharma dan evaluasi akademik dengan penuh tanggung jawab sesuai ketentuan yang berlaku.
                          </p>
                          <p>
                            <strong>KETIGA : </strong>
                            Keputusan ini mulai berlaku sejak tanggal ditetapkan, dengan ketentuan apabila di kemudian hari terdapat kekeliruan dalam penetapan ini akan diadakan perbaikan sebagaimana mestinya.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Judul Surat Keterangan Umum */}
                    <div className="text-center space-y-1 mb-6">
                      <h3 className="text-sm sm:text-base font-bold tracking-wider underline uppercase text-slate-950">
                        {surat.jenisSurat}
                      </h3>
                      <p className="text-xs font-mono text-slate-600">
                        Nomor: {surat.nomorSurat}
                      </p>
                    </div>

                    <p className="text-justify leading-relaxed">
                      Dekan Fakultas Teknik Universitas Batanghari Jambi, dengan ini menerangkan dengan sebenarnya bahwa:
                    </p>

                    {/* Identity Table */}
                    <table className="w-full text-xs sm:text-sm my-3 border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 w-48 text-slate-600 font-medium">Nama Lengkap</td>
                          <td className="py-1.5 w-4">:</td>
                          <td className="py-1.5 font-bold uppercase text-slate-950">{surat.pemohonNama}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">NIM / NIDN</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-mono font-bold">{surat.pemohonNimNidn}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Program Studi / Jenjang</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-semibold">{surat.programStudi} ({selectedProdi.jenjang})</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Semester / Tahun Akademik</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-medium">Semester {surat.dataTambahan?.semester || 'Berjalan'} / TA {surat.dataTambahan?.tahunAkademik || '2026/2027'}</td>
                        </tr>
                        {surat.dataTambahan?.namaOrangTua && (
                          <>
                            <tr className="border-b border-slate-100">
                              <td className="py-1.5 text-slate-600 font-medium">Nama Orang Tua / Wali</td>
                              <td className="py-1.5">:</td>
                              <td className="py-1.5 font-medium">{surat.dataTambahan.namaOrangTua}</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                              <td className="py-1.5 text-slate-600 font-medium">Pekerjaan / Instansi Orang Tua</td>
                              <td className="py-1.5">:</td>
                              <td className="py-1.5 font-medium">{surat.dataTambahan.pekerjaanOrangTua || '-'} ({surat.dataTambahan.instansiOrangTua || '-'})</td>
                            </tr>
                          </>
                        )}
                        {surat.tujuanInstansi && (
                          <tr className="border-b border-slate-100">
                            <td className="py-1.5 text-slate-600 font-medium">Tujuan Instansi / Perusahaan</td>
                            <td className="py-1.5">:</td>
                            <td className="py-1.5 font-bold text-blue-900">{surat.tujuanInstansi}</td>
                          </tr>
                        )}
                        {surat.dataTambahan?.judulPenelitian && (
                          <tr className="border-b border-slate-100">
                            <td className="py-1.5 text-slate-600 font-medium align-top">Judul Penelitian Skripsi</td>
                            <td className="py-1.5 align-top">:</td>
                            <td className="py-1.5 font-serif italic text-xs leading-relaxed text-slate-800">
                              "{surat.dataTambahan.judulPenelitian}"
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    <p className="text-justify leading-relaxed">
                      Adalah benar mahasiswa aktif terdaftar pada Fakultas Teknik Universitas Batanghari Jambi pada Tahun Akademik 2026/2027, serta berkelakuan baik dan tidak sedang menjalani sanksi akademik.
                    </p>

                    <p className="text-justify leading-relaxed">
                      Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan: <strong>{surat.keperluan}</strong>.
                    </p>

                    <p className="text-justify leading-relaxed">
                      Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
                    </p>
                  </>
                )}

                {/* Signature Box */}
                <div className="mt-8 pt-4 flex justify-between items-end text-xs font-sans">
                  <div className="flex items-center gap-3">
                    <QrCodeSvg
                      value={`https://unbari.ac.id/ft/verifikasi?kode=FT-UNBARI/2026/SK-AKT/${surat.id || '104'}`}
                      size={60}
                      title="Verifikasi Surat TU"
                    />
                    <div className="text-[10px] text-slate-500">
                      <span className="font-bold text-slate-800 block">Verifikasi Keaslian Surat</span>
                      <span className="font-mono block text-[9px] text-blue-800">{surat.nomorSurat}</span>
                      <span>Petugas TU: {STAFF_TU_FAKULTAS.petugasPersuratan}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div>Kota Jambi, {currentDateFormatted}</div>
                    <div className="font-semibold mt-1">Dekan Fakultas Teknik UNBARI,</div>
                    <div className="h-16 flex items-center justify-end">
                      <span className="text-[10px] text-blue-800 italic font-mono bg-blue-50 px-2 py-0.5 border border-blue-200 rounded">
                        Tanda Tangan Digital Resmi (Dekan FT)
                      </span>
                    </div>
                    <div className="font-bold underline text-sm uppercase text-slate-950">
                      {DEKAN_FAKULTAS_TEKNIK.nama}
                    </div>
                    <div className="font-mono text-[11px] text-slate-600">
                      NIDN. {DEKAN_FAKULTAS_TEKNIK.nidn}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* MODE 2: LEMBAR DISPOSISI SURAT DEKAN FT UNBARI */}
            {mode === 'DISPOSISI_DEKAN' && agenda && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                
                <div className="text-center space-y-1 mb-6 border-b-2 border-slate-800 pb-3">
                  <h3 className="text-base font-bold tracking-wider uppercase text-slate-950">
                    Lembar Disposisi Dekan Fakultas Teknik
                  </h3>
                  <p className="text-xs font-mono text-slate-600">
                    Buku Agenda Persuratan Dekanat UNBARI
                  </p>
                </div>

                {/* Surat Metadata Grid */}
                <div className="border border-slate-300 rounded-lg p-3 text-xs grid grid-cols-2 gap-3 bg-slate-50">
                  <div>
                    <span className="text-slate-500 text-[10px]">Nomor Agenda Dekanat:</span>
                    <div className="font-mono font-bold text-blue-900 mt-0.5">{agenda.nomorAgenda}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Tanggal Diterima TU:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {new Date(agenda.tanggalDiterima).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Nomor Surat Pengirim:</span>
                    <div className="font-mono font-semibold text-slate-800 mt-0.5">{agenda.nomorSuratAsli}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Tanggal Surat Pengirim:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {new Date(agenda.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px]">Asal Instansi Pengirim:</span>
                    <div className="font-bold text-slate-900 mt-0.5">{agenda.pengirimAtauTujuan}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px]">Perihal / Ringkasan Isi Surat:</span>
                    <div className="font-semibold text-blue-950 mt-0.5 leading-relaxed">{agenda.perihal}</div>
                  </div>
                </div>

                {/* Disposisi Target Checklist Box */}
                <div className="border-2 border-slate-800 rounded-lg p-4 space-y-3 mt-4">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
                    Diteruskan Kepada Yth:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={agenda.disposisiDekan?.tujuanDisposisi.includes('Wakil Dekan')} readOnly className="w-3.5 h-3.5" />
                      <span>Wakil Dekan I / II</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={agenda.disposisiDekan?.tujuanDisposisi.includes('Sipil')} readOnly className="w-3.5 h-3.5" />
                      <span>Kaprodi S1 Teknik Sipil</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={agenda.disposisiDekan?.tujuanDisposisi.includes('Lingkungan')} readOnly className="w-3.5 h-3.5" />
                      <span>Kaprodi S1 Teknik Lingkungan</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={agenda.disposisiDekan?.tujuanDisposisi.includes('Listrik')} readOnly className="w-3.5 h-3.5" />
                      <span>Kaprodi D3 Teknik Listrik</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={agenda.disposisiDekan?.tujuanDisposisi.includes('TU')} readOnly className="w-3.5 h-3.5" />
                      <span>Kepala Bagian Tata Usaha</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={agenda.disposisiDekan?.tujuanDisposisi.includes('Mutu') || agenda.disposisiDekan?.tujuanDisposisi.includes('TPMF')} readOnly className="w-3.5 h-3.5" />
                      <span>Tim Penjaminan Mutu (TPMF)</span>
                    </label>
                  </div>
                </div>

                {/* Instruksi & Catatan Dekan */}
                <div className="border-2 border-blue-900 rounded-lg p-4 space-y-3 bg-blue-50/40">
                  <div className="font-bold text-blue-950 text-xs uppercase tracking-wider border-b border-blue-200 pb-1">
                    Instruksi &amp; Petunjuk Dekan:
                  </div>
                  <div className="text-xs font-semibold text-blue-900">
                    Instruksi: <span className="font-bold underline">{agenda.disposisiDekan?.instruksi || 'Tindaklanjuti segera'}</span>
                  </div>
                  <div className="p-3 bg-white border border-blue-200 rounded text-xs text-slate-800 italic leading-relaxed">
                    "{agenda.disposisiDekan?.catatan || 'Segera dipelajari dan lakukan koordinasi teknis bersama jajaran pimpinan prodi.'}"
                  </div>
                </div>

                {/* Dekan Signature Block */}
                <div className="mt-8 pt-4 text-right text-xs font-sans">
                  <div>Kota Jambi, {agenda.disposisiDekan?.tanggalDisposisi ? new Date(agenda.disposisiDekan.tanggalDisposisi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : currentDateFormatted}</div>
                  <div className="font-semibold mt-1">Dekan Fakultas Teknik UNBARI,</div>
                  <div className="h-14 flex items-center justify-end">
                    <span className="text-[10px] text-blue-800 italic font-mono bg-blue-50 px-2 py-0.5 border border-blue-200 rounded">
                      Disahkan &amp; Ditandatangani Dekan
                    </span>
                  </div>
                  <div className="font-bold underline text-sm uppercase text-slate-950">
                    {DEKAN_FAKULTAS_TEKNIK.nama}
                  </div>
                  <div className="font-mono text-[11px] text-slate-600">
                    NIDN. {DEKAN_FAKULTAS_TEKNIK.nidn}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 modal-bottom-bar">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dokumen persuratan resmi siap dicetak langsung (Ctrl+P atau Cetak PDF)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => handlePrint(false)}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-xl shadow-xs transition-colors"
            >
              {isPrinting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>{isPrinting ? 'Mempersiapkan Cetak...' : 'Cetak Surat Resmi'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
