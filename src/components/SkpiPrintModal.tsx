import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, Award, FileText, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
import { SkpiRecord, ProgramStudiInfo } from '../types/index';
import { DEKAN_FAKULTAS_TEKNIK, WAKIL_DEKAN_1 } from '../data/mockData';
import { printDocumentElement } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';

interface SkpiPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SkpiRecord | null;
  selectedProdi: ProgramStudiInfo;
}

export const SkpiPrintModal: React.FC<SkpiPrintModalProps> = ({
  isOpen,
  onClose,
  record,
  selectedProdi
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
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const docTitle = `SKPI_${record.nim}_${record.namaMahasiswa}_FT_UNBARI`;

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
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Top Control Bar */}
        <div className="modal-top-bar flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Pratinjau Dokumen SKPI Resmi Bilingual (KKNI {record.jenjangKkni})
              </h3>
              <p className="text-[11px] text-slate-300">
                Surat Keterangan Pendamping Ijazah (Diploma Supplement) &bull; Standar Permendikbudristek RI
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
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              title="Buka dokumen di jendela baru lalu cetak"
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

        {/* Scrollable Document Area */}
        <div className="p-6 overflow-y-auto bg-slate-100/70 flex-1 flex justify-center">
          <div
            ref={printAreaRef}
            className="printable-sheet bg-white w-full max-w-[210mm] p-8 sm:p-12 shadow-md border border-slate-200 text-slate-900 text-xs sm:text-sm font-sans flex flex-col justify-between"
          >
            <div>
              {/* Kop Surat Resmi Universitas Batanghari */}
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

              {/* Title Header */}
              <div className="text-center my-4 pb-2 border-b border-slate-200">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 font-serif">
                  Surat Keterangan Pendamping Ijazah (SKPI)
                </h2>
                <h3 className="text-xs sm:text-sm italic font-serif text-slate-600">
                  Diploma Supplement
                </h3>
                <div className="text-xs font-mono font-bold text-blue-950 mt-1">
                  Nomor: {record.nomorSkpi}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Nomor Ijazah Nasional (PIN PDDikti): {record.nomorIjazahNasional}
                </div>
              </div>

              {/* BAGIAN I: IDENTITAS DIRI PEMEGANG SKPI */}
              <div className="mb-6">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wide text-slate-800 border-l-4 border-blue-700 mb-3">
                  I. INFORMASI TENTANG IDENTITAS DIRI PEMEGANG SKPI / <span className="italic font-normal">Information Identifying The Holder of The Diploma Supplement</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Nama Lengkap / <span className="italic">Full Name</span></span>
                    <span className="font-bold text-slate-900">: {record.namaMahasiswa}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Nomor Induk Mahasiswa (NIM)</span>
                    <span className="font-mono font-bold text-slate-900">: {record.nim}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Tempat, Tgl Lahir / <span className="italic">Place, DOB</span></span>
                    <span className="text-slate-800">: {record.tempatTanggalLahir}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Tahun Masuk / Lulus / <span className="italic">Year</span></span>
                    <span className="text-slate-800">: {record.tahunMasuk} / {record.tahunLulus}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Gelar Akademik / <span className="italic">Academic Title</span></span>
                    <span className="font-bold text-slate-900">: {record.gelarAkademik}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Gelar Internasional / <span className="italic">Degree Title</span></span>
                    <span className="font-semibold text-slate-800">: {record.gelarInggris}</span>
                  </div>
                </div>
              </div>

              {/* BAGIAN II: IDENTITAS INSTITUSI PENYELENGGARA */}
              <div className="mb-6">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wide text-slate-800 border-l-4 border-blue-700 mb-3">
                  II. INFORMASI TENTANG BADAN PENYELENGGARA PROGRAM / <span className="italic font-normal">Information Identifying The Awarding Institution</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Perguruan Tinggi / <span className="italic">Institution</span></span>
                    <span className="font-bold text-slate-900">: Universitas Batanghari (UNBARI)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Program Studi / <span className="italic">Major</span></span>
                    <span className="font-bold text-slate-900">: {record.programStudi} ({record.programStudiInggris})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Jenjang KKNI / <span className="italic">EQF / IQF Level</span></span>
                    <span className="font-semibold text-blue-900">: {record.jenjangKkni} (Level {record.levelKkniAngka})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Status Akreditasi / <span className="italic">Accreditation</span></span>
                    <span className="font-semibold text-slate-800">: {selectedProdi.akreditasi}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Bahasa Pengantar / <span className="italic">Instruction</span></span>
                    <span className="text-slate-800">: {record.bahasaPengantar}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-1">
                    <span className="text-slate-500">Pendidikan Lanjut / <span className="italic">Further Studies</span></span>
                    <span className="text-slate-800">: {record.jenisDanJenjangPendidikanLanjutan}</span>
                  </div>
                </div>
              </div>

              {/* BAGIAN III: CAPAIAN PEMBELAJARAN LULUSAN (CPL / LEARNING OUTCOMES) */}
              <div className="mb-6">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wide text-slate-800 border-l-4 border-blue-700 mb-3">
                  III. INFORMASI TENTANG KUALIFIKASI &amp; HASIL CAPAIAN (CPL KKNI) / <span className="italic font-normal">Information On Qualification &amp; Learning Outcomes</span>
                </div>

                <div className="space-y-3">
                  {record.cplList.map((cpl, idx) => (
                    <div key={idx} className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 text-xs">
                      <div className="font-bold text-blue-950 flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{cpl.kategori}</span>
                      </div>
                      <p className="text-slate-800 text-justify leading-relaxed mb-1">
                        {cpl.deskripsiIndo}
                      </p>
                      <p className="text-slate-600 text-justify italic text-[11px] leading-relaxed">
                        {cpl.deskripsiInggris}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* BAGIAN IV: SERTIFIKASI PROFESI, PRESTASI & PENGHARGAAN */}
              <div className="mb-6">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs uppercase tracking-wide text-slate-800 border-l-4 border-blue-700 mb-3">
                  IV. AKTIVITAS, PRESTASI &amp; PENGHARGAAN / <span className="italic font-normal">Activities, Achievements, and Professional Certifications</span>
                </div>

                {/* Sertifikasi Profesi */}
                <div className="mb-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>A. Sertifikasi Kompetensi &amp; Profesi (Professional Certifications)</span>
                  </h4>
                  {record.sertifikasiList.length === 0 ? (
                    <div className="text-slate-500 italic text-[11px]">- Tidak ada catatan sertifikasi tambahan -</div>
                  ) : (
                    <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-800">
                      {record.sertifikasiList.map(s => (
                        <li key={s.id}>
                          <strong>{s.namaSertifikatIndo}</strong> / <span className="italic">{s.namaSertifikatInggris}</span>. Penerbit: {s.penerbit}. No: <span className="font-mono">{s.nomorSertifikat}</span> ({s.tahunPerolehan}).
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Prestasi & Kompetisi */}
                <div className="mb-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>B. Prestasi Akademik &amp; Kompetisi (Student Achievements &amp; Awards)</span>
                  </h4>
                  {record.prestasiList.length === 0 ? (
                    <div className="text-slate-500 italic text-[11px]">- Tidak ada catatan prestasi tambahan -</div>
                  ) : (
                    <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-800">
                      {record.prestasiList.map(p => (
                        <li key={p.id}>
                          <strong>{p.namaPrestasiIndo}</strong> ({p.tingkat}). {p.peringkat} diselenggarakan oleh {p.penyelenggara} ({p.tahun}).
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Pengalaman Organisasi & Pengabdian */}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>C. Pengalaman Organisasi Kemahasiswaan &amp; Pengabdian (Leadership &amp; Community Service)</span>
                  </h4>
                  {record.ormawaList.length === 0 ? (
                    <div className="text-slate-500 italic text-[11px]">- Tidak ada catatan organisasi -</div>
                  ) : (
                    <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-800">
                      {record.ormawaList.map(o => (
                        <li key={o.id}>
                          {o.jabatan} pada <strong>{o.namaOrganisasiIndo}</strong> ({o.periode}) &bull; Kategori: {o.kategori}.
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Catatan Verifikasi */}
              {record.catatanVerifikasi && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-950 text-xs mb-6">
                  <strong>Catatan Verifikasi Tim SKPI:</strong> {record.catatanVerifikasi}
                </div>
              )}
            </div>

            {/* Signature & Legalization Block */}
            <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end">
              <div className="text-[10px] text-slate-500 space-y-1 max-w-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Autentikasi Dokumen Resmi FT UNBARI</span>
                </div>
                <div>Surat Keterangan Pendamping Ijazah (SKPI) ini diterbitkan secara sah dan diakui secara nasional berdasarkan Permendikbud RI No. 81 Tahun 2014 &amp; Standar PDDikti.</div>
                <div className="font-mono text-[9px] text-slate-400">UNBARI-SKPI-VERIFY-ID: {record.id}-{record.nim}</div>
              </div>

              <div className="text-center font-sans">
                <div className="text-xs text-slate-600 mb-1">
                  Jambi, {record.tanggalPenerbitan || currentDateFormatted}
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {record.penandatanganJabatan}
                </div>
                <div className="text-[11px] italic text-slate-500">
                  Dean / Vice Dean of Faculty of Engineering
                </div>
                
                {/* Official Stamp space with QR Code */}
                <div className="h-20 flex items-center justify-center py-1">
                  <QrCodeSvg
                    value={`https://unbari.ac.id/ft/verifikasi?kode=FT-UNBARI/2026/SKPI/${record.nim}`}
                    size={64}
                    title="QR Validasi SKPI PDDikti"
                  />
                </div>

                <div className="font-bold text-slate-900 underline text-xs sm:text-sm">
                  {record.penandatanganNama}
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  NIDN: {record.penandatanganNipNidn}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
