import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, DollarSign, FileText } from 'lucide-react';
import { TagihanUktMahasiswa, ProgramStudiInfo, HonorariumDosenRecord } from '../types/index';
import { WAKIL_DEKAN_2, DEKAN_FAKULTAS_TEKNIK } from '../data/mockData';
import { printDocumentElement } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';
import { KOMPONEN_UANG_KULIAH_RESMI, TOTAL_UANG_KULIAH_RESMI, TERBILANG_UANG_KULIAH_RESMI } from '../data/mockKeuanganData';

interface KeuanganPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProdi: ProgramStudiInfo;
  mode: 'KWITANSI_UKT' | 'SURAT_BEBAS_KEUANGAN' | 'REKAP_HONOR' | 'RINCIAN_UANG_KULIAH';
  uktItem?: TagihanUktMahasiswa | null;
  honorList?: HonorariumDosenRecord[];
}

export const KeuanganPrintModal: React.FC<KeuanganPrintModalProps> = ({
  isOpen,
  onClose,
  selectedProdi,
  mode,
  uktItem,
  honorList = []
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

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
  }, [isOpen, mode, uktItem]);

  if (!isOpen) return null;

  const docTitle = mode === 'KWITANSI_UKT' && uktItem
    ? `Kwitansi_UKT_${uktItem.nim}_${uktItem.namaMahasiswa}`
    : mode === 'SURAT_BEBAS_KEUANGAN' && uktItem
      ? `Surat_Bebas_Keuangan_${uktItem.nim}_FT_UNBARI`
      : mode === 'RINCIAN_UANG_KULIAH'
        ? `Rincian_Uang_Kuliah_${uktItem ? uktItem.nim : 'Resmi_FT_UNBARI'}`
        : `Rekap_Honorarium_Dosen_FT_UNBARI`;

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="modal-top-bar flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {mode === 'KWITANSI_UKT' ? 'Pratinjau Cetak Kwitansi Pembayaran UKT/SPP' :
                 mode === 'SURAT_BEBAS_KEUANGAN' ? 'Pratinjau Surat Bebas Administrasi Keuangan (Syarat Ujian/Wisuda)' :
                 mode === 'RINCIAN_UANG_KULIAH' ? 'Pratinjau Rincian Resmi Komponen Uang Kuliah Mahasiswa FT UNBARI' :
                 'Pratinjau Rekapitulasi Honorarium Dosen FT UNBARI'}
              </h3>
              <p className="text-[11px] text-slate-300">
                Fakultas Teknik Universitas Batanghari Jambi &bull; Ketetapan Resmi Biaya Pendidikan Yayasan Pendidikan Jambi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrint(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="Cetak langsung menggunakan printer default komputer Anda (Ctrl + P)"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Memproses Cetak...' : 'Cetak ke Printer Default (Ctrl+P)'}</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrint(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              title="Buka pratinjau di jendela browser terpisah lalu cetak"
            >
              <span>Jendela Baru</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="p-6 overflow-y-auto bg-slate-100/70 flex-1 flex justify-center">
          <div
            ref={printAreaRef}
            className="printable-sheet bg-white w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 shadow-md border border-slate-200 text-slate-900 text-xs sm:text-sm font-sans flex flex-col justify-between"
          >
            <div>
              {/* Kop Surat Resmi UNBARI */}
              <div className="flex items-center gap-4 pb-4 border-b-4 border-double border-slate-900 mb-6">
                <img 
                  src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
                  alt="Logo Universitas Batanghari" 
                  className="w-20 h-20 object-contain shrink-0" 
                />
                <div className="flex-1 text-center font-serif">
                  <div className="text-xs uppercase tracking-wider text-slate-900 font-sans font-bold">
                    YAYASAN PENDIDIKAN JAMBI
                  </div>
                  <div className="text-base sm:text-lg font-black tracking-tight text-blue-950 uppercase">
                    UNIVERSITAS BATANGHARI
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
                    FAKULTAS TEKNIK
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-700 font-sans mt-1 leading-snug">
                    Jl. Slamet Riyadi No. 01 Broni - Kota Jambi 36122, Telp: (0741) 60103<br />
                    Laman Resmi: <span className="text-blue-900 underline font-medium">https://universitasbatanghari.ac.id</span> · Surel: <span className="font-mono">ftunbari.tpa@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* DOKUMEN 1: SURAT KETERANGAN BEBAS ADMINISTRASI KEUANGAN (SKBK) */}
              {mode === 'SURAT_BEBAS_KEUANGAN' && uktItem && (
                <div>
                  <div className="text-center my-4">
                    <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide underline text-slate-900 font-serif">
                      Surat Keterangan Bebas Administrasi Keuangan
                    </h4>
                    <span className="text-xs text-slate-600 font-mono">
                      Nomor: {uktItem.id}/SKBK/FT-UNBARI/{new Date().getFullYear()}
                    </span>
                  </div>

                  <p className="text-slate-800 text-justify leading-relaxed mb-4">
                    Wakil Dekan II Bidang Administrasi Umum, Kepegawaian, dan Keuangan Fakultas Teknik Universitas Batanghari Jambi, dengan ini menerangkan bahwa:
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 space-y-2 text-xs sm:text-sm">
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Nama Mahasiswa</span>
                      <span className="col-span-2 font-bold text-slate-900">: {uktItem.namaMahasiswa}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Nomor Induk Mahasiswa (NIM)</span>
                      <span className="col-span-2 font-mono font-bold text-slate-900">: {uktItem.nim}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Program Studi / Jenjang</span>
                      <span className="col-span-2 font-semibold text-slate-800">: {selectedProdi.nama} ({selectedProdi.jenjang})</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Angkatan / Semester</span>
                      <span className="col-span-2 text-slate-800">: {uktItem.angkatan} / Semester {uktItem.semester}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Tahun Akademik</span>
                      <span className="col-span-2 text-slate-800">: {uktItem.tahunAkademik}</span>
                    </div>
                  </div>

                  <p className="text-slate-800 text-justify leading-relaxed mb-4">
                    Telah menyelesaikan dan dinyatakan <strong>BEBAS DARI SEGALA TUNGGAKAN BIAYA PENDIDIKAN (SPP / UKT, Biaya Praktikum Laboratorium, dan Biaya Ujian)</strong> hingga semester berjalan pada Fakultas Teknik Universitas Batanghari.
                  </p>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 text-xs font-medium mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Surat Keterangan ini SAH dan berlaku sebagai syarat administrasi pendaftaran <strong>Seminar Proposal, Sidang Tugas Akhir / Skripsi, dan Yudisium Sarjana / Ahli Madya</strong>.</span>
                  </div>

                  <p className="text-slate-800 text-justify leading-relaxed">
                    Demikian surat keterangan ini diberikan kepada yang bersangkutan untuk dapat dipergunakan sebagaimana mestinya.
                  </p>
                </div>
              )}

              {/* DOKUMEN 2: KWITANSI PEMBAYARAN UKT */}
              {mode === 'KWITANSI_UKT' && uktItem && (
                <div>
                  <div className="text-center my-4">
                    <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide underline text-slate-900 font-serif">
                      Tanda Bukti Pembayaran Biaya Pendidikan (Kwitansi)
                    </h4>
                    <span className="text-xs text-slate-600 font-mono">
                      No. Bukti: KWT-{uktItem.id}-{new Date().getFullYear()}
                    </span>
                  </div>

                  <div className="border border-slate-300 rounded-lg p-5 mb-6 space-y-3">
                    <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Telah Terima Dari</span>
                      <span className="col-span-2 font-bold text-slate-900">: {uktItem.namaMahasiswa} ({uktItem.nim})</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Program Studi</span>
                      <span className="col-span-2 text-slate-800">: {selectedProdi.nama}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Untuk Pembayaran</span>
                      <span className="col-span-2 text-slate-800">: Uang Kuliah Tunggal (UKT) / SPP Semester {uktItem.semester} Tahun Akademik {uktItem.tahunAkademik}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Jumlah Tagihan</span>
                      <span className="col-span-2 font-mono font-semibold text-slate-800">: Rp {uktItem.nominalTagihan.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100 pb-2 bg-emerald-50/50 p-2 rounded">
                      <span className="text-emerald-900 font-bold">Jumlah Terbayar</span>
                      <span className="col-span-2 font-mono font-bold text-emerald-800 text-sm">: Rp {uktItem.nominalTerbayar.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Sisa Tunggakan</span>
                      <span className="col-span-2 font-mono font-semibold text-slate-800">: Rp {uktItem.sisaTunggakan.toLocaleString('id-ID')} ({uktItem.status})</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500 font-medium">Kanal / Bank Pembayaran</span>
                      <span className="col-span-2 text-slate-800">: {uktItem.metodePembayaran || 'Bank BNI'} (Reff: {uktItem.nomorTransaksiBank || 'TRX-VERIFIED'})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DOKUMEN 4: RINCIAN RESMI KOMPONEN UANG KULIAH MAHASISWA */}
              {mode === 'RINCIAN_UANG_KULIAH' && (
                <div>
                  <div className="text-center my-3">
                    <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide underline text-slate-900 font-serif">
                      Rincian Biaya Pendidikan &amp; Uang Kuliah Mahasiswa
                    </h4>
                    <span className="text-xs text-slate-600 font-mono">
                      Nomor: {uktItem ? `INV-${uktItem.id}` : 'SK-TARIF-01'}/FT-UNBARI/{new Date().getFullYear()}
                    </span>
                  </div>

                  {uktItem ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3 text-xs grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500">Nama Mahasiswa:</span>
                        <span className="font-bold text-slate-900 ml-1">{uktItem.namaMahasiswa}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">NIM / Angkatan:</span>
                        <span className="font-mono font-bold text-slate-900 ml-1">{uktItem.nim} (Th {uktItem.angkatan})</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Program Studi:</span>
                        <span className="font-semibold text-slate-800 ml-1">{selectedProdi.nama} ({selectedProdi.jenjang})</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Semester / TA:</span>
                        <span className="text-slate-800 ml-1">Semester {uktItem.semester} &bull; {uktItem.tahunAkademik}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 mb-3">
                      <strong>Standar Tarif Biaya Pendidikan Fakultas Teknik UNBARI:</strong> Ketetapan resmi komponen rincian uang kuliah untuk seluruh mahasiswa aktif program Sarjana (S1) dan Diploma Tiga (D3) Fakultas Teknik Universitas Batanghari.
                    </div>
                  )}

                  {/* 16-Item Official Tuition Components Table */}
                  <table className="w-full text-xs border border-slate-300 mt-2 mb-3">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
                        <th className="py-1.5 px-2.5 border-r border-slate-300 w-10 text-center">No</th>
                        <th className="py-1.5 px-3 border-r border-slate-300 text-left">Item</th>
                        <th className="py-1.5 px-3 border-r border-slate-300 text-left">Peruntukan / Keterangan</th>
                        <th className="py-1.5 px-3 text-right w-36">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px] sm:text-xs">
                      {KOMPONEN_UANG_KULIAH_RESMI.map((item) => (
                        <tr key={item.no} className="hover:bg-slate-50">
                          <td className="py-1 px-2.5 border-r border-slate-200 text-center font-mono text-slate-500">{item.no}</td>
                          <td className="py-1 px-3 border-r border-slate-200 font-bold text-slate-900">{item.namaItem}</td>
                          <td className="py-1 px-3 border-r border-slate-200 text-slate-600 text-[10px] sm:text-[11px]">{item.keterangan}</td>
                          <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                            {item.nominal === 0 ? 'Rp. 0,-' : `Rp. ${item.nominal.toLocaleString('id-ID')},-`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 border-t-2 border-slate-900 font-black text-slate-900">
                        <td colSpan={3} className="py-2 px-3 text-right uppercase tracking-wider text-xs">
                          Total:
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-xs sm:text-sm text-blue-950 bg-blue-50/70 border-l border-slate-300">
                          Rp. {TOTAL_UANG_KULIAH_RESMI.toLocaleString('id-ID')},-
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Terbilang block */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-3 flex items-start gap-1.5">
                    <span className="font-semibold text-slate-500 shrink-0">Terbilang:</span>
                    <span className="font-bold text-slate-900 italic font-serif">"{TERBILANG_UANG_KULIAH_RESMI}"</span>
                  </div>

                  {uktItem && (
                    <div className="grid grid-cols-2 gap-3 p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs mb-3">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Realisasi Pembayaran Terverifikasi:</span>
                        <strong className="text-emerald-800 font-mono text-xs sm:text-sm">Rp {uktItem.nominalTerbayar.toLocaleString('id-ID')}</strong>
                        <span className="text-[10px] text-slate-600 block">{uktItem.metodePembayaran || 'Bank BNI'} (Reff: {uktItem.nomorTransaksiBank || 'TRX-VERIFIED'})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Sisa Tunggakan:</span>
                        <strong className={`font-mono text-xs sm:text-sm ${uktItem.sisaTunggakan > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                          Rp {uktItem.sisaTunggakan.toLocaleString('id-ID')} ({uktItem.status})
                        </strong>
                        <span className="text-[10px] text-slate-600 block">
                          {uktItem.bebasKeuanganUjian ? '✓ Syarat Ujian & Wisuda Sah (Bebas Keuangan)' : '⚠️ Menunggu Pelunasan Administrasi'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Catatan Resmi */}
                  <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 space-y-0.5">
                    <div className="font-bold text-slate-800">Ketentuan &amp; Tata Cara Pembayaran:</div>
                    <div>1. Rekening resmi penerimaan: <strong>Bank BNI Cab. Jambi No. Rek: 0234-8899-01</strong> atau <strong>Bank Mandiri No. Rek: 110-00-9988-12</strong> a.n Yayasan Pendidikan Jambi.</div>
                    <div>2. Biaya yang telah disetorkan tidak dapat ditarik kembali kecuali atas persetujuan tertulis Rektorat/Dekanat FT UNBARI.</div>
                  </div>
                </div>
              )}

              {/* DOKUMEN 3: REKAP HONORARIUM DOSEN */}
              {mode === 'REKAP_HONOR' && (
                <div>
                  <div className="text-center my-4">
                    <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide underline text-slate-900 font-serif">
                      Daftar Rekapitulasi Honorarium Dosen &amp; Penguji
                    </h4>
                    <span className="text-xs text-slate-600">
                      Fakultas Teknik Universitas Batanghari &bull; Periode: Oktober 2026
                    </span>
                  </div>

                  <table className="w-full text-[11px] border border-slate-300 mt-4 mb-6">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-left">
                        <th className="p-2 border-r border-slate-300">No</th>
                        <th className="p-2 border-r border-slate-300">Nama Dosen / NIDN</th>
                        <th className="p-2 border-r border-slate-300">Jenis Honor &amp; Deskripsi</th>
                        <th className="p-2 border-r border-slate-300 text-right">Volume</th>
                        <th className="p-2 border-r border-slate-300 text-right">Bruto</th>
                        <th className="p-2 border-r border-slate-300 text-right">PPh 21 (5%)</th>
                        <th className="p-2 text-right">Netto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {honorList.map((item, idx) => (
                        <tr key={item.id} className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-200">
                            <div className="font-bold text-slate-900">{item.namaDosen}</div>
                            <div className="text-[10px] text-slate-500 font-mono">NIDN: {item.nidn}</div>
                          </td>
                          <td className="p-2 border-r border-slate-200">
                            <div className="font-semibold text-slate-800">{item.jenisHonor}</div>
                            <div className="text-[10px] text-slate-500">{item.deskripsi}</div>
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            {item.volume} {item.satuan}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            Rp {item.totalBruto.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono text-red-600">
                            -Rp {item.potonganPph21.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-800">
                            Rp {item.totalNetto.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                        <td colSpan={4} className="p-2 text-right">Total:</td>
                        <td className="p-2 text-right font-mono">
                          Rp {honorList.reduce((acc, h) => acc + h.totalBruto, 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-2 text-right font-mono text-red-600">
                          -Rp {honorList.reduce((acc, h) => acc + h.potonganPph21, 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-2 text-right font-mono text-emerald-800">
                          Rp {honorList.reduce((acc, h) => acc + h.totalNetto, 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Signature Block (Standard UNBARI Format with WD II) */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end">
              <div className="text-[10px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sistem Informasi Keuangan FT UNBARI</span>
                </div>
                <div>Dokumen Sah dicetak secara elektronik &bull; {currentDateFormatted}</div>
                <div className="font-mono text-[9px]">KODE-VERIFIKASI: KEU-FT-UNBARI-{Date.now().toString(36).toUpperCase()}</div>
              </div>

              <div className="text-center font-sans">
                <div className="text-xs text-slate-600 mb-1">
                  Jambi, {currentDateFormatted}
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {mode === 'SURAT_BEBAS_KEUANGAN' || mode === 'KWITANSI_UKT' || mode === 'RINCIAN_UANG_KULIAH'
                    ? 'Wakil Dekan II Bidang Umum & Keuangan'
                    : 'Dekan Fakultas Teknik UNBARI'}
                </div>
                
                {/* Space for stamp/signature with QR Code */}
                <div className="h-20 flex items-center justify-center py-1">
                  <QrCodeSvg
                    value={`https://unbari.ac.id/ft/verifikasi?kode=FT-UNBARI/2026/KEU/${uktItem?.nim || 'RINCIAN-UKT'}`}
                    size={64}
                    title="QR Validasi Keuangan FT UNBARI"
                  />
                </div>

                <div className="font-bold text-slate-900 underline text-xs sm:text-sm">
                  {mode === 'SURAT_BEBAS_KEUANGAN' || mode === 'KWITANSI_UKT' || mode === 'RINCIAN_UANG_KULIAH'
                    ? WAKIL_DEKAN_2.nama 
                    : DEKAN_FAKULTAS_TEKNIK.nama}
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  NIDN: {mode === 'SURAT_BEBAS_KEUANGAN' || mode === 'KWITANSI_UKT' || mode === 'RINCIAN_UANG_KULIAH'
                    ? WAKIL_DEKAN_2.nidn 
                    : DEKAN_FAKULTAS_TEKNIK.nidn}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
