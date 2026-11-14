import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Award, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  SlidersHorizontal,
  GraduationCap,
  Shirt,
  ClipboardCheck,
  Check,
  Building,
  UserCheck,
  Layers
} from 'lucide-react';
import { YudisiumRecord, ProgramStudiInfo } from '../types/index';
import { DEKAN_FAKULTAS_TEKNIK } from '../data/mockData';
import { printDocumentElement } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';
import { StandardKopSurat } from './StandardKopSurat';

export type YudisiumDocType = 
  | 'SKL' 
  | 'BERITA_ACARA' 
  | 'SK_DEKAN' 
  | 'BEBAS_TANGGUNGAN' 
  | 'DAFTAR_WISUDA' 
  | 'TANDA_TERIMA_TOGA';

interface YudisiumPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: YudisiumRecord | null;
  allRecords: YudisiumRecord[];
  selectedProdi: ProgramStudiInfo;
  documentType: YudisiumDocType;
  onSetDocumentType: (type: YudisiumDocType) => void;
}

export const YudisiumPrintModal: React.FC<YudisiumPrintModalProps> = ({
  isOpen,
  onClose,
  record,
  allRecords,
  selectedProdi,
  documentType,
  onSetDocumentType
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkOpacity, setWatermarkOpacity] = useState<'soft' | 'medium' | 'strong'>('medium');

  const prodiRecords = allRecords.filter(r => r.prodiId === selectedProdi.id);

  // Active record state for per-student documents
  const [activeRecord, setActiveRecord] = useState<YudisiumRecord | null>(record);

  useEffect(() => {
    if (record) {
      setActiveRecord(record);
    } else if (prodiRecords.length > 0 && !activeRecord) {
      setActiveRecord(prodiRecords[0]);
    }
  }, [record, prodiRecords]);

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
  }, [isOpen, activeRecord, documentType]);

  if (!isOpen) return null;

  const currentActive = activeRecord || prodiRecords[0] || null;

  const docTitle = documentType === 'SKL' && currentActive
    ? `SKL_${currentActive.nim}_${currentActive.nama}_FT_UNBARI`
    : documentType === 'BERITA_ACARA'
      ? `Berita_Acara_Yudisium_FT_UNBARI_${selectedProdi.id}`
      : documentType === 'SK_DEKAN'
        ? `SK_Dekan_Yudisium_FT_UNBARI_${selectedProdi.id}`
        : documentType === 'BEBAS_TANGGUNGAN' && currentActive
          ? `Bebas_Tanggungan_Yudisium_${currentActive.nim}_${currentActive.nama}`
          : documentType === 'TANDA_TERIMA_TOGA' && currentActive
            ? `Tanda_Terima_Toga_${currentActive.nim}_${currentActive.nama}`
            : `Daftar_Wisudawan_FT_UNBARI_${selectedProdi.id}`;

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

  const isIndividualDoc = documentType === 'SKL' || documentType === 'BEBAS_TANGGUNGAN' || documentType === 'TANDA_TERIMA_TOGA';

  // Statistics for Wisuda
  const totalWisudawan = prodiRecords.length;
  const totalLaki = prodiRecords.filter(r => r.jenisKelamin === 'L').length;
  const totalPerempuan = prodiRecords.filter(r => r.jenisKelamin === 'P').length;
  const totalCumLaude = prodiRecords.filter(r => r.predikat === 'Dengan Pujian (Cum Laude)').length;
  const avgIpk = prodiRecords.length > 0 
    ? (prodiRecords.reduce((acc, r) => acc + r.ipk, 0) / prodiRecords.length).toFixed(2) 
    : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 modal-top-bar">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Pratinjau &amp; Cetak Berkas Yudisium &amp; Wisuda FT UNBARI
              </h3>
              <p className="text-[11px] text-slate-400">
                Standar Format Resmi Fakultas Teknik Universitas Batanghari Jambi (Kertas A4)
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
              <span>{isPrinting ? 'Mempersiapkan...' : 'Cetak Dokumen (Ctrl+P)'}</span>
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

        {/* Document Switcher Strip */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-2.5 gap-2 shrink-0 text-xs font-semibold print:hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <button
              type="button"
              onClick={() => onSetDocumentType('SKL')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                documentType === 'SKL'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. Surat Keterangan Lulus (SKL)
            </button>

            <button
              type="button"
              onClick={() => onSetDocumentType('BERITA_ACARA')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                documentType === 'BERITA_ACARA'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              2. Berita Acara Yudisium
            </button>

            <button
              type="button"
              onClick={() => onSetDocumentType('SK_DEKAN')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                documentType === 'SK_DEKAN'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              3. SK Dekan Penetapan Yudisium
            </button>

            <button
              type="button"
              onClick={() => onSetDocumentType('BEBAS_TANGGUNGAN')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                documentType === 'BEBAS_TANGGUNGAN'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              4. Bebas Tanggungan &amp; Syarat
            </button>

            <button
              type="button"
              onClick={() => onSetDocumentType('DAFTAR_WISUDA')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                documentType === 'DAFTAR_WISUDA'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              5. Daftar Nominasi Wisuda
            </button>

            <button
              type="button"
              onClick={() => onSetDocumentType('TANDA_TERIMA_TOGA')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                documentType === 'TANDA_TERIMA_TOGA'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              6. Tanda Terima Toga &amp; Undangan
            </button>
          </div>

          {/* Watermark Control for SKL */}
          {documentType === 'SKL' && (
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs shrink-0 shadow-2xs">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Watermark UNBARI:</span>
              </span>
              <button
                type="button"
                onClick={() => setShowWatermark(!showWatermark)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  showWatermark
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title="Aktifkan atau nonaktifkan watermark lambang UNBARI di latar belakang SKL"
              >
                {showWatermark ? 'Aktif' : 'Mati'}
              </button>
              {showWatermark && (
                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                  <span className="text-[10px] text-slate-500 font-mono">Kepekatan:</span>
                  {(['soft', 'medium', 'strong'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWatermarkOpacity(mode)}
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        watermarkOpacity === mode
                          ? 'bg-blue-100 text-blue-800 font-bold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {mode === 'soft' ? 'Halus' : mode === 'medium' ? 'Standar' : 'Tegas'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Student Switcher Bar for individual documents */}
        {isIndividualDoc && prodiRecords.length > 0 && (
          <div className="flex items-center justify-between px-6 py-2 bg-blue-50/80 border-b border-blue-100 text-xs shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-blue-950 font-bold">Pilih Mahasiswa Lulusan:</span>
              <select
                value={currentActive?.id || ''}
                onChange={(e) => {
                  const found = allRecords.find(r => r.id === e.target.value);
                  if (found) setActiveRecord(found);
                }}
                className="bg-white border border-blue-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {prodiRecords.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nim} - {r.nama} ({r.ipk.toFixed(2)} / {r.predikat})
                  </option>
                ))}
              </select>
            </div>
            {currentActive && (
              <span className="text-[11px] text-blue-800 font-mono">
                PIN Dikti: <strong>{currentActive.nomorIjazahNasional || '-'}</strong>
              </span>
            )}
          </div>
        )}

        {/* Document Printable Paper Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div 
            ref={printAreaRef}
            className="printable-document printable-sheet bg-white border border-slate-300 shadow-lg p-8 sm:p-12 w-full max-w-[780px] text-slate-900 font-serif leading-relaxed text-sm print:p-0 print:border-none print:shadow-none relative"
          >
            
            {/* OFFICIAL LETTERHEAD (KOP SURAT STANDAR UNBARI) */}
            <StandardKopSurat
              prodiName={
                isIndividualDoc && currentActive
                  ? `PROGRAM STUDI ${currentActive.programStudi.toUpperCase()}`
                  : `FAKULTAS TEKNIK - ${selectedProdi.nama.toUpperCase()}`
              }
              subTitle={
                documentType === 'SKL'
                  ? 'SURAT KETERANGAN LULUS (SKL)'
                  : documentType === 'BERITA_ACARA'
                    ? 'RAPAT YUDISIUM KELULUSAN'
                    : documentType === 'SK_DEKAN'
                      ? 'KEPUTUSAN DEKAN FAKULTAS TEKNIK'
                      : documentType === 'BEBAS_TANGGUNGAN'
                        ? 'SURAT KETERANGAN BEBAS TANGGUNGAN'
                        : documentType === 'TANDA_TERIMA_TOGA'
                          ? 'TANDA TERIMA ATRIBUT WISUDA'
                          : 'RAPAT SENAT TERBUKA WISUDA'
              }
            />

            {/* ========================================================================= */}
            {/* DOKUMEN 1: SURAT KETERANGAN LULUS (SKL) */}
            {/* ========================================================================= */}
            {documentType === 'SKL' && (
              <div className="relative">
                {/* Official Watermark Logo Universitas Batanghari */}
                {showWatermark && (
                  <div 
                    className="watermark-unbari absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden" 
                    aria-label="Watermark Lambang Universitas Batanghari"
                  >
                    <img 
                      src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
                      alt="Watermark Lambang UNBARI" 
                      className={`w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 object-contain pointer-events-none select-none filter grayscale-[10%] transition-opacity duration-200 ${
                        watermarkOpacity === 'soft'
                          ? 'opacity-[0.06] print:opacity-[0.07]'
                          : watermarkOpacity === 'strong'
                            ? 'opacity-[0.16] print:opacity-[0.18]'
                            : 'opacity-[0.09] print:opacity-[0.11]'
                      }`}
                    />
                  </div>
                )}

                {currentActive ? (
                  <div className="space-y-4 relative z-10">
                    <div className="text-center space-y-1 mb-6">
                      <h3 className="text-base font-bold tracking-wider underline uppercase text-slate-950 font-sans">
                        Surat Keterangan Lulus (SKL)
                      </h3>
                      <p className="text-xs font-mono text-slate-600 font-sans">
                        Nomor: 094/SKL/FT-UNBARI/{new Date().getFullYear()}
                      </p>
                    </div>

                    <p className="text-justify font-sans text-xs sm:text-sm">
                      Dekan Fakultas Teknik Universitas Batanghari Jambi, dengan ini menerangkan dengan sebenarnya bahwa:
                    </p>

                    <table className="w-full text-xs sm:text-sm font-sans my-4 border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 w-48 text-slate-600 font-medium">Nama Mahasiswa</td>
                          <td className="py-1.5 w-4">:</td>
                          <td className="py-1.5 font-bold uppercase text-slate-950">{currentActive.nama}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Nomor Induk Mahasiswa (NIM)</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-mono font-bold">{currentActive.nim}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Program Studi / Jenjang</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-semibold">{currentActive.programStudi} ({currentActive.jenjang})</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Gelar Akademik Kelulusan</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-bold text-slate-900">
                            {currentActive.jenjang === 'S1' ? 'Sarjana Teknik (S.T.)' : 'Ahli Madya Teknik (A.Md.T.)'}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Indeks Prestasi Kumulatif (IPK)</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-mono font-bold text-slate-950">{currentActive.ipk.toFixed(2)} (Skala 4.00)</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Total Beban SKS Lulus</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-mono font-bold">{currentActive.sksLulus} SKS</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Predikat Kelulusan</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-bold text-blue-900">{currentActive.predikat}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Nomor SK Yudisium Dekan</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-mono">{currentActive.nomorSkYudisium || '085/SK-DEK/FT-UNBARI/VIII/2026'}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Nomor Ijazah Nasional (PIN)</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-mono text-emerald-800 font-bold">{currentActive.nomorIjazahNasional || '010042026001281'}</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1.5 text-slate-600 font-medium">Lama Masa Studi</td>
                          <td className="py-1.5">:</td>
                          <td className="py-1.5 font-medium">{currentActive.lamaStudi || '4 Tahun 0 Bulan'}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-slate-600 font-medium align-top">Judul Tugas Akhir / Skripsi</td>
                          <td className="py-1.5 align-top">:</td>
                          <td className="py-1.5 font-serif italic text-xs leading-relaxed text-slate-800">
                            "{currentActive.judulSkripsi}"
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <p className="text-justify font-sans text-xs sm:text-sm mt-4">
                      Telah dinyatakan <strong>LULUS</strong> pada Rapat Yudisium Fakultas Teknik Universitas Batanghari pada tanggal <strong>{new Date(currentActive.tanggalYudisium).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                    </p>

                    <p className="text-justify font-sans text-xs sm:text-sm">
                      Surat Keterangan Lulus ini berlaku sah sebagai bukti kelulusan yang dapat dipergunakan untuk melamar pekerjaan, administrasi kepegawaian, atau melanjutkan studi sampai dengan Ijazah dan Transkrip Asli diterbitkan.
                    </p>

                    {/* Signature block */}
                    <div className="mt-8 pt-4 flex justify-between items-end font-sans text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-20 border border-dashed border-slate-300 rounded flex items-center justify-center text-[9px] text-slate-400">
                          Foto 3x4
                        </div>
                        <div className="flex flex-col items-center">
                          <QrCodeSvg
                            value={`https://unbari.ac.id/ft/verifikasi?kode=FT-UNBARI/2026/YUD/${currentActive.nim}`}
                            size={64}
                            title="Verifikasi Keaslian SKL"
                          />
                          <span className="text-[7px] font-mono text-slate-500 mt-0.5">PIN: {currentActive.nomorIjazahNasional || currentActive.nim}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div>Kota Jambi, {currentDateFormatted}</div>
                        <div className="font-semibold mt-1">Dekan Fakultas Teknik UNBARI,</div>
                        <div className="h-16 flex items-center justify-end">
                          <span className="text-[10px] text-blue-800 italic font-mono bg-blue-50 px-2 py-0.5 border border-blue-200 rounded">
                            Telah Ditandatangani Secara Digital (Dekan FT)
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
                ) : (
                  <div className="text-center py-12 text-slate-500 font-sans text-xs">
                    Pilih salah satu mahasiswa dari daftar yudisium untuk mencetak SKL perorangan.
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOKUMEN 2: BERITA ACARA RAPAT YUDISIUM DEKAN */}
            {/* ========================================================================= */}
            {documentType === 'BERITA_ACARA' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                <div className="text-center space-y-1 mb-6">
                  <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-950 underline">
                    Berita Acara Rapat Penetapan Kelulusan (Yudisium)
                  </h3>
                  <p className="text-xs font-mono text-slate-600">
                    Nomor: 085/BA-YUD/FT-UNBARI/VIII/2026
                  </p>
                </div>

                <p className="text-justify leading-relaxed">
                  Pada hari ini, tanggal <strong>28 Agustus 2026</strong>, bertempat di Ruang Sidang Dekanat Fakultas Teknik Universitas Batanghari, telah dilaksanakan Rapat Yudisium Penetapan Kelulusan Program Sarjana dan Ahli Madya Periode Semester Genap Tahun Akademik 2025/2026 yang dipimpin langsung oleh Dekan Fakultas Teknik dan dihadiri oleh para Wakil Dekan serta Ketua Program Studi di lingkungan Fakultas Teknik.
                </p>

                <p>
                  Berdasarkan evaluasi capaian kurikulum, kelengkapan berkas bebas tanggungan, dan uji integritas akademik, dengan ini memutuskan mahasiswa berikut dinyatakan <strong>LULUS</strong>:
                </p>

                <table className="w-full text-[11px] my-3 border border-slate-300 border-collapse">
                  <thead className="bg-slate-100 font-bold text-slate-800">
                    <tr className="border-b border-slate-300">
                      <th className="p-2 text-center w-8">No</th>
                      <th className="p-2 text-left">NIM</th>
                      <th className="p-2 text-left">Nama Lulusan</th>
                      <th className="p-2 text-left">Prodi</th>
                      <th className="p-2 text-center">IPK</th>
                      <th className="p-2 text-center">SKS</th>
                      <th className="p-2 text-left">Predikat Kelulusan</th>
                      <th className="p-2 text-left">PIN Dikti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {prodiRecords.map((r, i) => (
                      <tr key={r.id}>
                        <td className="p-2 text-center">{i + 1}</td>
                        <td className="p-2 font-mono font-bold">{r.nim}</td>
                        <td className="p-2 font-semibold uppercase">{r.nama}</td>
                        <td className="p-2">{r.programStudi}</td>
                        <td className="p-2 text-center font-mono font-bold">{r.ipk.toFixed(2)}</td>
                        <td className="p-2 text-center font-mono">{r.sksLulus}</td>
                        <td className="p-2 font-medium">{r.predikat}</td>
                        <td className="p-2 font-mono text-[10px]">{r.nomorIjazahNasional || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Dual Signatures: Dekan & Kaprodi */}
                <div className="mt-8 pt-4 grid grid-cols-2 gap-10 text-center text-xs font-sans break-inside-avoid">
                  <div className="flex flex-col items-center">
                    <div className="min-h-[2.75rem]">
                      <div className="text-slate-600">Mengetahui,</div>
                      <div className="font-bold mt-0.5">Ketua Program Studi {selectedProdi.singkatan},</div>
                    </div>
                    <div className="h-16 w-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-500 italic font-mono bg-slate-50 px-2 py-0.5 border border-slate-200 rounded">
                        Tanda Tangan Kaprodi
                      </span>
                    </div>
                    <div className="w-56 border-t border-slate-400 pt-1">
                      <div className="font-bold uppercase">{selectedProdi.kaprodi}</div>
                      <div className="font-mono text-[10px] text-slate-500">NIP/NIDN. {selectedProdi.nipKaprodi}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="min-h-[2.75rem]">
                      <div className="text-slate-600">Kota Jambi, {currentDateFormatted}</div>
                      <div className="font-bold mt-0.5">Dekan Fakultas Teknik UNBARI,</div>
                    </div>
                    <div className="h-16 w-full flex items-center justify-center">
                      <span className="text-[10px] text-blue-800 italic font-mono bg-blue-50 px-2 py-0.5 border border-blue-200 rounded">
                        Pengesahan Resmi Dekan
                      </span>
                    </div>
                    <div className="w-56 border-t border-slate-400 pt-1">
                      <div className="font-bold uppercase">{DEKAN_FAKULTAS_TEKNIK.nama}</div>
                      <div className="font-mono text-[10px] text-slate-500">NIDN. {DEKAN_FAKULTAS_TEKNIK.nidn}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOKUMEN 3: SURAT KEPUTUSAN (SK) DEKAN PENETAPAN YUDISIUM */}
            {/* ========================================================================= */}
            {documentType === 'SK_DEKAN' && (
              <div className="space-y-4 font-sans text-xs leading-relaxed">
                <div className="text-center space-y-1 mb-4">
                  <h3 className="text-sm font-bold tracking-wider uppercase text-slate-950 font-serif">
                    SURAT KEPUTUSAN DEKAN FAKULTAS TEKNIK UNIVERSITAS BATANGHARI
                  </h3>
                  <p className="text-xs font-mono font-bold text-slate-800">
                    NOMOR : {currentActive.nomorSkYudisium || '085/SK-DEK/FT-UNBARI/VIII/2026'}
                  </p>
                  <p className="text-[11px] font-bold uppercase text-slate-700 tracking-wide mt-1">
                    TENTANG<br />
                    PENETAPAN KELULUSAN (YUDISIUM) DAN PEMBERIAN GELAR AKADEMIK SARJANA TEKNIK (S.T.) DAN AHLI MADYA TEKNIK (A.Md.T.) PERIODE TAHUN AKADEMIK 2025/2026
                  </p>
                </div>

                <div className="space-y-2 text-justify">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="font-bold text-slate-900">MENIMBANG :</span>
                    <div className="space-y-1">
                      <p>a. Bahwa mahasiswa Fakultas Teknik Universitas Batanghari yang namanya tercantum dalam keputusan ini telah menyelesaikan seluruh kurikulum beban studi dan tugas akhir;</p>
                      <p>b. Bahwa berdasarkan evaluasi akademik dan Berita Acara Rapat Yudisium Dekanat, mahasiswa bersangkutan memenuhi syarat untuk dinyatakan lulus;</p>
                      <p>c. Bahwa berdasarkan pertimbangan huruf a dan b di atas, perlu menetapkan Surat Keputusan Dekan.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] gap-2 pt-1">
                    <span className="font-bold text-slate-900">MENGINGAT :</span>
                    <div className="space-y-1">
                      <p>1. Undang-Undang Republik Indonesia Nomor 12 Tahun 2012 tentang Pendidikan Tinggi;</p>
                      <p>2. Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 53 Tahun 2023 tentang Penjaminan Mutu Pendidikan Tinggi;</p>
                      <p>3. Statuta Universitas Batanghari Jambi dan Pedoman Akademik Fakultas Teknik.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] gap-2 pt-1">
                    <span className="font-bold text-slate-900">MEMPERHATIKAN :</span>
                    <p>Hasil Rapat Dekanat bersama para Ketua Program Studi Fakultas Teknik Universitas Batanghari pada tanggal 28 Agustus 2026.</p>
                  </div>

                  <div className="text-center font-bold text-slate-950 py-1 uppercase tracking-wider">
                    MEMUTUSKAN :
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                      <span className="font-bold">KESATU :</span>
                      <p>Menetapkan mahasiswa yang namanya tercantum dalam Lampiran Surat Keputusan ini dinyatakan <strong>LULUS (YUDISIUM)</strong> dari Fakultas Teknik Universitas Batanghari.</p>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                      <span className="font-bold">KEDUA :</span>
                      <p>Memberikan hak untuk menggunakan gelar akademik <strong>Sarjana Teknik (S.T.)</strong> bagi lulusan Program S1 dan <strong>Ahli Madya Teknik (A.Md.T.)</strong> bagi lulusan Program D3.</p>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                      <span className="font-bold">KETIGA :</span>
                      <p>Keputusan ini berlaku sejak tanggal ditetapkan, dan apabila terdapat kekeliruan di kemudian hari akan diadakan perbaikan sebagaimana mestinya.</p>
                    </div>
                  </div>
                </div>

                {/* Table of Graduates in Decree */}
                <div className="pt-2">
                  <span className="font-bold text-[11px] block mb-1">LAMPIRAN SK DEKAN : DAFTAR LULUSAN YUDISIUM FT UNBARI</span>
                  <table className="w-full text-[10px] border border-slate-300 border-collapse">
                    <thead className="bg-slate-100 font-bold">
                      <tr>
                        <th className="p-1.5 border border-slate-300 text-center w-7">No</th>
                        <th className="p-1.5 border border-slate-300 text-left">NIM</th>
                        <th className="p-1.5 border border-slate-300 text-left">Nama Lengkap</th>
                        <th className="p-1.5 border border-slate-300 text-left">Program Studi</th>
                        <th className="p-1.5 border border-slate-300 text-center">IPK</th>
                        <th className="p-1.5 border border-slate-300 text-left">Gelar Akademik</th>
                        <th className="p-1.5 border border-slate-300 text-left">PIN Dikti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prodiRecords.map((r, i) => (
                        <tr key={r.id}>
                          <td className="p-1.5 border border-slate-300 text-center">{i + 1}</td>
                          <td className="p-1.5 border border-slate-300 font-mono font-bold">{r.nim}</td>
                          <td className="p-1.5 border border-slate-300 uppercase font-semibold">{r.nama}</td>
                          <td className="p-1.5 border border-slate-300">{r.programStudi}</td>
                          <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">{r.ipk.toFixed(2)}</td>
                          <td className="p-1.5 border border-slate-300 font-bold">{r.jenjang === 'S1' ? 'S.T.' : 'A.Md.T.'}</td>
                          <td className="p-1.5 border border-slate-300 font-mono text-[9px]">{r.nomorIjazahNasional || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Decree Signatures & CC */}
                <div className="pt-4 flex justify-between items-end text-xs">
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-700">Tembusan disampaikan kepada Yth:</p>
                    <p>1. Rektor Universitas Batanghari (sebagai laporan)</p>
                    <p>2. Kepala Biro Administrasi Akademik &amp; Kemahasiswaan (BAAK)</p>
                    <p>3. Kepala Biro Keuangan UNBARI</p>
                    <p>4. Arsip Dekanat Fakultas Teknik</p>
                  </div>

                  <div className="text-right">
                    <div>Ditetapkan di : Kota Jambi</div>
                    <div>Pada tanggal : 28 Agustus 2026</div>
                    <div className="font-bold mt-1">Dekan Fakultas Teknik UNBARI,</div>
                    <div className="h-14"></div>
                    <div className="font-bold underline text-sm uppercase text-slate-950">
                      {DEKAN_FAKULTAS_TEKNIK.nama}
                    </div>
                    <div className="font-mono text-[10px] text-slate-600">
                      NIDN. {DEKAN_FAKULTAS_TEKNIK.nidn}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOKUMEN 4: SURAT BEBAS TANGGUNGAN & SYARAT YUDISIUM */}
            {/* ========================================================================= */}
            {documentType === 'BEBAS_TANGGUNGAN' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                <div className="text-center space-y-1 mb-6">
                  <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-950 underline">
                    Surat Keterangan Bebas Tanggungan &amp; Persyaratan Yudisium
                  </h3>
                  <p className="text-xs font-mono text-slate-600">
                    Nomor: 112/SBT-YUD/FT-UNBARI/{new Date().getFullYear()}
                  </p>
                </div>

                {currentActive ? (
                  <div className="space-y-4">
                    <p className="text-justify leading-relaxed">
                      Ketua Program Studi {currentActive.programStudi} Fakultas Teknik Universitas Batanghari menerangkan bahwa mahasiswa berikut:
                    </p>

                    <div className="grid grid-cols-[160px_10px_1fr] gap-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                      <span className="font-medium text-slate-600">Nama Mahasiswa</span>
                      <span>:</span>
                      <span className="font-bold uppercase text-slate-950">{currentActive.nama}</span>

                      <span className="font-medium text-slate-600">NIM</span>
                      <span>:</span>
                      <span className="font-mono font-bold text-slate-900">{currentActive.nim}</span>

                      <span className="font-medium text-slate-600">Program Studi / Jenjang</span>
                      <span>:</span>
                      <span>{currentActive.programStudi} ({currentActive.jenjang})</span>

                      <span className="font-medium text-slate-600">Judul Skripsi / Tugas Akhir</span>
                      <span>:</span>
                      <span className="font-serif italic text-slate-800">"{currentActive.judulSkripsi}"</span>

                      <span className="font-medium text-slate-600">Dosen Pembimbing</span>
                      <span>:</span>
                      <span>1. {currentActive.dosenPembimbing1} {currentActive.dosenPembimbing2 ? `· 2. ${currentActive.dosenPembimbing2}` : ''}</span>
                    </div>

                    <p className="font-semibold text-slate-900 mt-2">
                      Telah menyelesaikan dan diverifikasi bebas dari seluruh tanggungan berikut:
                    </p>

                    {/* Table of 6 Pos Bebas Tanggungan */}
                    <table className="w-full border border-slate-300 border-collapse text-xs">
                      <thead className="bg-slate-100 font-bold text-slate-800">
                        <tr>
                          <th className="p-2 border border-slate-300 text-center w-8">No</th>
                          <th className="p-2 border border-slate-300 text-left">Pos Administrasi &amp; Fasilitas</th>
                          <th className="p-2 border border-slate-300 text-left">Keterangan / Bukti</th>
                          <th className="p-2 border border-slate-300 text-center w-32">Status Verifikasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border border-slate-300 text-center">1</td>
                          <td className="p-2 border border-slate-300 font-semibold">Perpustakaan Pusat UNBARI</td>
                          <td className="p-2 border border-slate-300">Bebas pinjaman pustaka &amp; penyerahan hardcover + CD naskah</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800 bg-emerald-50/40">
                            {currentActive.syaratKelengkapan.bebasPustaka ? '✓ BEBAS PUSTAKA' : 'BELUM BEBAS'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-slate-300 text-center">2</td>
                          <td className="p-2 border border-slate-300 font-semibold">Laboratorium Fakultas Teknik</td>
                          <td className="p-2 border border-slate-300">Bebas peminjaman alat, komponen, dan bahan praktikum</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800 bg-emerald-50/40">
                            {currentActive.syaratKelengkapan.bebasLab ? '✓ BEBAS LAB' : 'BELUM BEBAS'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-slate-300 text-center">3</td>
                          <td className="p-2 border border-slate-300 font-semibold">Keuangan &amp; SPP Kuliah</td>
                          <td className="p-2 border border-slate-300">Lunas SPP sampai semester akhir &amp; biaya yudisium/wisuda</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800 bg-emerald-50/40">
                            {currentActive.syaratKelengkapan.bebasKeuangan ? '✓ LUNAS KEUANGAN' : 'BELUM LUNAS'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-slate-300 text-center">4</td>
                          <td className="p-2 border border-slate-300 font-semibold">Uji Plagiarisme Skripsi (Turnitin)</td>
                          <td className="p-2 border border-slate-300">Similarity Index &lt; 20% memenuhi standar integritas karya ilmiah</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800 bg-emerald-50/40">
                            {currentActive.syaratKelengkapan.bebasPlagiarisme ? '✓ LOLOS TURNITIN' : 'BELUM UJI'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-slate-300 text-center">5</td>
                          <td className="p-2 border border-slate-300 font-semibold">Repository Jurnal Mahasiswa</td>
                          <td className="p-2 border border-slate-300">Naskah publikasi ilmiah terunggah pada E-Journal UNBARI</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800 bg-emerald-50/40">
                            {currentActive.syaratKelengkapan.unggahJurnalRepository ? '✓ TERUNGGAH' : 'BELUM UNGGAH'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-slate-300 text-center">6</td>
                          <td className="p-2 border border-slate-300 font-semibold">Pasfoto Resmi Ijazah &amp; Transkrip</td>
                          <td className="p-2 border border-slate-300">Foto 3x4 &amp; 4x6 latar belakang biru berjas almamater resmi</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800 bg-emerald-50/40">
                            {currentActive.syaratKelengkapan.fotoIjazah ? '✓ FOTO DITERIMA' : 'BELUM DITERIMA'}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <p className="text-justify text-xs pt-1">
                      Demikian Surat Keterangan Bebas Tanggungan ini diterbitkan untuk dipergunakan sebagai persyaratan kelayakan mengikuti Rapat Yudisium Penetapan Kelulusan dan Upacara Wisuda Sarjana/Diploma Universitas Batanghari Jambi.
                    </p>

                    <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-center text-xs">
                      <div>
                        <div className="text-slate-600">Petugas Verifikasi Tata Usaha,</div>
                        <div className="font-bold mt-1">Staf Administrasi FT UNBARI</div>
                        <div className="h-14 flex items-center justify-center">
                          <span className="text-[10px] text-slate-500 italic font-mono bg-slate-50 px-2 py-0.5 border border-slate-200 rounded">
                            Telah Diverifikasi Valid
                          </span>
                        </div>
                        <div className="font-bold underline uppercase">Rian Firmansyah, S.Kom.</div>
                        <div className="font-mono text-[10px] text-slate-500">NIP. 198904122015041002</div>
                      </div>

                      <div>
                        <div className="text-slate-600">Kota Jambi, {currentDateFormatted}</div>
                        <div className="font-bold mt-1">Ketua Program Studi {selectedProdi.singkatan},</div>
                        <div className="h-14 flex items-center justify-center">
                          <span className="text-[10px] text-blue-800 italic font-mono bg-blue-50 px-2 py-0.5 border border-blue-200 rounded">
                            Pengesahan Kelayakan
                          </span>
                        </div>
                        <div className="font-bold underline uppercase">{selectedProdi.kaprodi}</div>
                        <div className="font-mono text-[10px] text-slate-500">NIP/NIDN. {selectedProdi.nipKaprodi}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Pilih salah satu mahasiswa dari daftar untuk melihat surat bebas tanggungan.
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOKUMEN 5: DAFTAR NOMINASI CALON WISUDAWAN (BUKU WISUDA) */}
            {/* ========================================================================= */}
            {documentType === 'DAFTAR_WISUDA' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                <div className="text-center space-y-1 mb-6">
                  <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-950 underline">
                    Daftar Nominasi Calon Wisudawan Fakultas Teknik
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">
                    Wisuda Ke-56 Universitas Batanghari Jambi · Tahun 2026
                  </p>
                </div>

                {/* Recap Highlights Box */}
                <div className="grid grid-cols-4 gap-2 text-center p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Wisudawan</span>
                    <strong className="text-blue-950 font-mono text-base">{totalWisudawan}</strong> Orang
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Laki-laki / Perempuan</span>
                    <strong className="text-blue-950 font-mono text-base">{totalLaki} / {totalPerempuan}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Rata-rata IPK</span>
                    <strong className="text-blue-950 font-mono text-base">{avgIpk}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Predikat Cum Laude</span>
                    <strong className="text-amber-800 font-mono text-base">{totalCumLaude}</strong> Wisudawan
                  </div>
                </div>

                <table className="w-full text-[10.5px] my-3 border border-slate-300 border-collapse">
                  <thead className="bg-slate-100 font-bold text-slate-800">
                    <tr className="border-b border-slate-300">
                      <th className="p-2 text-center w-8">No</th>
                      <th className="p-2 text-left">NIM</th>
                      <th className="p-2 text-left">Nama Wisudawan</th>
                      <th className="p-2 text-center">JK</th>
                      <th className="p-2 text-center">IPK</th>
                      <th className="p-2 text-left">Predikat</th>
                      <th className="p-2 text-center">Uk. Toga</th>
                      <th className="p-2 text-left">Status Toga</th>
                      <th className="p-2 text-center">Lulusan Terbaik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {prodiRecords.map((r, i) => (
                      <tr key={r.id}>
                        <td className="p-2 text-center">{i + 1}</td>
                        <td className="p-2 font-mono font-bold">{r.nim}</td>
                        <td className="p-2 font-semibold uppercase">{r.nama}</td>
                        <td className="p-2 text-center">{r.jenisKelamin}</td>
                        <td className="p-2 text-center font-mono font-bold">{r.ipk.toFixed(2)}</td>
                        <td className="p-2">{r.predikat}</td>
                        <td className="p-2 text-center font-bold font-mono text-blue-800">{r.ukuranToga}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            r.statusWisuda === 'Toga Diambil'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.statusWisuda}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          {r.isLulusanTerbaik ? (
                            <span className="text-amber-600 font-bold text-xs flex items-center justify-center gap-1">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              Ya
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer validation */}
                <div className="mt-8 pt-4 text-right text-xs font-sans">
                  <div>Kota Jambi, {currentDateFormatted}</div>
                  <div className="font-semibold mt-1">Dekan Fakultas Teknik UNBARI,</div>
                  <div className="h-14"></div>
                  <div className="font-bold underline uppercase">{DEKAN_FAKULTAS_TEKNIK.nama}</div>
                  <div className="font-mono text-[10px] text-slate-500">NIDN. {DEKAN_FAKULTAS_TEKNIK.nidn}</div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* DOKUMEN 6: TANDA TERIMA PENGAMBILAN TOGA & UNDANGAN WISUDA */}
            {/* ========================================================================= */}
            {documentType === 'TANDA_TERIMA_TOGA' && (
              <div className="space-y-4 font-sans text-xs sm:text-sm">
                <div className="text-center space-y-1 mb-6">
                  <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-950 underline">
                    Tanda Terima Pengambilan Atribut Toga &amp; Undangan Wisuda
                  </h3>
                  <p className="text-xs font-mono text-slate-600">
                    Nomor: TT-TOGA/FT-UNBARI/{new Date().getFullYear()}/{currentActive?.nim || '210101001'}
                  </p>
                </div>

                {currentActive ? (
                  <div className="space-y-4">
                    <p className="text-justify leading-relaxed">
                      Telah diserahkan paket perlengkapan toga wisudawan dan undangan resmi Upacara Wisuda Ke-56 Universitas Batanghari Jambi kepada:
                    </p>

                    <div className="grid grid-cols-[160px_10px_1fr] gap-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                      <span className="font-medium text-slate-600">Nama Wisudawan</span>
                      <span>:</span>
                      <span className="font-bold uppercase text-slate-950">{currentActive.nama}</span>

                      <span className="font-medium text-slate-600">Nomor Induk Mahasiswa</span>
                      <span>:</span>
                      <span className="font-mono font-bold text-slate-900">{currentActive.nim}</span>

                      <span className="font-medium text-slate-600">Program Studi / Jenjang</span>
                      <span>:</span>
                      <span>{currentActive.programStudi} ({currentActive.jenjang})</span>

                      <span className="font-medium text-slate-600">Ukuran Jubah Toga</span>
                      <span>:</span>
                      <span className="font-mono font-black text-blue-900">Ukuran {currentActive.ukuranToga}</span>

                      <span className="font-medium text-slate-600">Periode Wisuda</span>
                      <span>:</span>
                      <span className="font-semibold text-slate-900">{currentActive.periodeWisuda || 'Wisuda Ke-56 UNBARI (Oktober 2026)'}</span>

                      <span className="font-medium text-slate-600">Status Pengambilan</span>
                      <span>:</span>
                      <span className="font-bold text-emerald-800">
                        {currentActive.statusWisuda === 'Toga Diambil' ? 'SUDAH DISERAHKAN LENGKAP' : 'TERDAFTAR - MENUNGGU SERAH TERIMA'}
                      </span>
                    </div>

                    <div className="space-y-2 mt-4">
                      <p className="font-bold text-slate-900">Rincian Paket Atribut yang Diserahkan:</p>
                      <table className="w-full border border-slate-300 border-collapse text-xs">
                        <thead className="bg-slate-100 font-bold text-slate-800">
                          <tr>
                            <th className="p-2 border border-slate-300 text-center w-8">No</th>
                            <th className="p-2 border border-slate-300 text-left">Nama Barang / Atribut</th>
                            <th className="p-2 border border-slate-300 text-center w-24">Jumlah</th>
                            <th className="p-2 border border-slate-300 text-center w-28">Kondisi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border border-slate-300 text-center">1</td>
                            <td className="p-2 border border-slate-300 font-medium">Baju / Jubah Toga Wisuda (Ukuran: {currentActive.ukuranToga})</td>
                            <td className="p-2 border border-slate-300 text-center font-mono">1 Stel</td>
                            <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800">Lengkap &amp; Baik</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-slate-300 text-center">2</td>
                            <td className="p-2 border border-slate-300 font-medium">Topi Toga Segi Lima (Kuncir Kuning-Biru FT UNBARI)</td>
                            <td className="p-2 border border-slate-300 text-center font-mono">1 Pcs</td>
                            <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800">Lengkap &amp; Baik</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-slate-300 text-center">3</td>
                            <td className="p-2 border border-slate-300 font-medium">Samir Gordon Lambang Universitas Batanghari</td>
                            <td className="p-2 border border-slate-300 text-center font-mono">1 Pcs</td>
                            <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800">Lengkap &amp; Baik</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-slate-300 text-center">4</td>
                            <td className="p-2 border border-slate-300 font-medium">Map Ijazah &amp; Selongsong / Tabung Ijazah UNBARI</td>
                            <td className="p-2 border border-slate-300 text-center font-mono">1 Set</td>
                            <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800">Lengkap &amp; Baik</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-slate-300 text-center">5</td>
                            <td className="p-2 border border-slate-300 font-medium">Undangan Resmi Orang Tua / Pendamping Wisudawan</td>
                            <td className="p-2 border border-slate-300 text-center font-mono">2 Lembar</td>
                            <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800">Lengkap &amp; Baik</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-slate-300 text-center">6</td>
                            <td className="p-2 border border-slate-300 font-medium">Buku Panduan Tata Tertib &amp; Denah Kursi Gladi Bersih</td>
                            <td className="p-2 border border-slate-300 text-center font-mono">1 Buku</td>
                            <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800">Lengkap &amp; Baik</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-[11px] text-slate-600 italic">
                      Catatan: Wisudawan wajib membawa tanda terima ini saat mengikuti Gladi Bersih Wisuda di Gedung Balairung Universitas Batanghari. Jubah toga menjadi hak milik wisudawan.
                    </p>

                    <div className="mt-8 pt-4 grid grid-cols-3 gap-6 items-end text-xs break-inside-avoid">
                      <div className="flex flex-col items-center text-center">
                        <div className="min-h-[2.75rem]">
                          <div className="text-slate-600">Diterima oleh,</div>
                          <div className="font-semibold text-slate-800 mt-0.5">Wisudawan Penerima</div>
                        </div>
                        <div className="h-16 w-full flex items-center justify-center">
                          <span className="text-[10px] text-slate-400 italic">Tanda Tangan Mahasiswa</span>
                        </div>
                        <div className="w-full max-w-[180px] border-t border-slate-400 pt-1">
                          <div className="font-bold uppercase">{currentActive.nama}</div>
                          <div className="font-mono text-[10px] text-slate-500">NIM. {currentActive.nim}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center pb-2">
                        <QrCodeSvg
                          value={`https://unbari.ac.id/ft/verifikasi/toga/${currentActive.nim}`}
                          size={58}
                          title="Validasi Toga"
                        />
                        <span className="text-[7px] font-mono text-slate-500 mt-0.5">VERIFIKASI TOGA</span>
                      </div>

                      <div className="flex flex-col items-center text-center">
                        <div className="min-h-[2.75rem]">
                          <div>Kota Jambi, {currentDateFormatted}</div>
                          <div className="font-semibold text-slate-800 mt-0.5">Petugas Perlengkapan TU</div>
                        </div>
                        <div className="h-16 w-full flex items-center justify-center">
                          <span className="text-[10px] text-blue-800 italic font-mono bg-blue-50 px-2 py-0.5 border border-blue-200 rounded">
                            Diserahkan Resmi (TU FT)
                          </span>
                        </div>
                        <div className="w-full max-w-[180px] border-t border-slate-400 pt-1">
                          <div className="font-bold uppercase">Bambang Irawan, S.T.</div>
                          <div className="font-mono text-[10px] text-slate-500">NIP. 198409162010121003</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Pilih salah satu mahasiswa dari daftar untuk melihat tanda terima toga.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 modal-bottom-bar">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Format berkas resmi standar cetak A4 Universitas Batanghari (Margin 1cm presisi)</span>
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
              <span>{isPrinting ? 'Mempersiapkan Cetak...' : 'Cetak Dokumen Sekarang'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
