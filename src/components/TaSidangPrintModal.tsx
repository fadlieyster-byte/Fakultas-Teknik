import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Award, 
  CheckCircle2, 
  ClipboardCheck, 
  Download, 
  Calendar, 
  User, 
  Layers,
  Sparkles
} from 'lucide-react';
import { JadwalSidangTA, ProgramStudiInfo } from '../types/index';
import { StandardKopSurat } from './StandardKopSurat';
import { printDocumentElement } from '../utils/printHelper';
import { hitungSkalaNilai } from '../utils/gradeScaleHelper';

interface TaSidangPrintModalProps {
  sidang: JadwalSidangTA | null;
  selectedProdi: ProgramStudiInfo;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'nilai' | 'berita_acara' | 'lembar_revisi';
}

export const TaSidangPrintModal: React.FC<TaSidangPrintModalProps> = ({
  sidang,
  selectedProdi,
  isOpen,
  onClose,
  initialTab = 'nilai'
}) => {
  const [activeTab, setActiveTab] = useState<'nilai' | 'berita_acara' | 'lembar_revisi'>(initialTab);
  const [selectedExaminerRole, setSelectedExaminerRole] = useState<'penguji1' | 'penguji2' | 'pembimbing1' | 'pembimbing2'>('penguji1');
  
  // Scoring rubric state (customizable before printing)
  const [scores, setScores] = useState({
    formatPenulisan: 85,     // Bobot 15%
    penguasaanMateri: 84,    // Bobot 25%
    presentasi: 86,          // Bobot 20%
    tanyaJawab: 82,          // Bobot 25%
    capaianHasil: 88          // Bobot 15%
  });

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sidang) return null;

  // Calculate weighted average
  const finalScoreNumber = Math.round(
    (scores.formatPenulisan * 0.15) +
    (scores.penguasaanMateri * 0.25) +
    (scores.presentasi * 0.20) +
    (scores.tanyaJawab * 0.25) +
    (scores.capaianHasil * 0.15)
  );

  const getGradeLetter = (score: number) => {
    const s = hitungSkalaNilai(score);
    return {
      grade: s.huruf,
      status: s.statusKelulusan === 'Lulus'
        ? `LULUS (${s.predikat.toUpperCase()})`
        : s.statusKelulusan === 'Lulus Bersyarat'
          ? 'LULUS DENGAN SYARAT / REVISI'
          : 'TIDAK LULUS (UJIAN ULANG)',
      gpa: s.bobot
    };
  };

  const gradeInfo = getGradeLetter(finalScoreNumber);

  const examinerName = {
    penguji1: { role: 'Dosen Penguji Utama (Penguji I)', name: sidang.penguji1 || 'Dosen Penguji I, S.T., M.T.' },
    penguji2: { role: 'Dosen Penguji Pendamping (Penguji II)', name: sidang.penguji2 || 'Dosen Penguji II, S.T., M.Eng.' },
    pembimbing1: { role: 'Dosen Pembimbing Utama (Pembimbing I)', name: sidang.pembimbing1 || 'Dosen Pembimbing I, S.T., M.T.' },
    pembimbing2: { role: 'Dosen Pembimbing Pendamping (Pembimbing II)', name: sidang.pembimbing2 || 'Dosen Pembimbing II, S.T., M.T.' }
  }[selectedExaminerRole];

  const handlePrint = () => {
    if (printAreaRef.current) {
      const docLabel = activeTab === 'nilai' 
        ? `Formulir Nilai ${sidang.tipeSidang}` 
        : activeTab === 'berita_acara' 
        ? `Berita Acara Sidang ${sidang.tipeSidang}` 
        : `Lembar Revisi Sidang ${sidang.tipeSidang}`;
      printDocumentElement(printAreaRef.current, {
        documentTitle: `${docLabel} - ${sidang.namaMahasiswa} (${sidang.nim})`
      });
    } else {
      window.print();
    }
  };

  const formattedDate = new Date(sidang.tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col my-auto max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header Modal - Hidden when printing */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-t-2xl no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                Dokumen Sidang &amp; Seminar Tugas Akhir (A4)
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  Standard A4 UNBARI
                </span>
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{sidang.namaMahasiswa} ({sidang.nim}) · {sidang.tipeSidang}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700">Margin 1 1 1 1 cm</span>
              </p>
            </div>
          </div>

          {/* Navigation Subtabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('nilai')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'nilai' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                1. Formulir Nilai
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('berita_acara')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'berita_acara' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                2. Berita Acara Sidang
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lembar_revisi')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'lembar_revisi' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                3. Lembar Revisi
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-700/20"
            >
              <Printer className="w-4 h-4" />
              Cetak A4 (Ctrl+P)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Control toolbar when in Formulir Nilai tab (Hidden in print) */}
        {activeTab === 'nilai' && (
          <div className="px-6 py-3 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-950">Pilih Dewan Penguji:</span>
              <select
                value={selectedExaminerRole}
                onChange={(e) => setSelectedExaminerRole(e.target.value as any)}
                className="bg-white border border-blue-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="penguji1">Penguji I: {sidang.penguji1 || 'Penguji Utama'}</option>
                {sidang.penguji2 && <option value="penguji2">Penguji II: {sidang.penguji2}</option>}
                <option value="pembimbing1">Pembimbing I: {sidang.pembimbing1 || 'Pembimbing Utama'}</option>
                {sidang.pembimbing2 && <option value="pembimbing2">Pembimbing II: {sidang.pembimbing2}</option>}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span>Nilai Akhir:</span>
                <span className="font-bold text-slate-900 text-sm">{finalScoreNumber}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-xs">
                  {gradeInfo.grade} ({gradeInfo.status})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Printable Document Paper (Simulated A4 Paper) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/60 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div 
            ref={printAreaRef}
            className="printable-sheet printable-document bg-white border border-slate-300 shadow-xl w-full max-w-[794px] min-h-[1123px] p-8 sm:p-12 text-slate-900 font-serif leading-relaxed text-xs print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:min-h-0"
          >
            {/* Standardized Kop Surat FT UNBARI */}
            <StandardKopSurat 
              prodiName={`PROGRAM STUDI ${selectedProdi.nama.toUpperCase()}`}
              showQrCode={true}
              qrCodeUrl={`https://universitasbatanghari.ac.id/verifikasi/sidang/${sidang.id}`}
              qrBadgeText="VERIFIKASI-TA"
            />

            {/* TAB 1: FORMULIR NILAI SIDANG & SEMINAR TUGAS AKHIR */}
            {activeTab === 'nilai' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-5">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider underline text-slate-950 font-sans">
                    FORMULIR PENILAIAN {sidang.tipeSidang.toUpperCase()}
                  </h2>
                  <p className="text-[11px] font-mono text-slate-600 font-sans">
                    TAHUN AKADEMIK 2026/2027 · SEMESTER GANJIL
                  </p>
                </div>

                {/* Identitas Mahasiswa & Sidang Box */}
                <div className="border border-slate-300 rounded p-3 text-[11px] font-sans bg-slate-50/50 space-y-1.5 leading-snug">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Nama Mahasiswa</span>
                    <span className="col-span-9 font-bold text-slate-900">: {sidang.namaMahasiswa}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">NIM</span>
                    <span className="col-span-9 font-mono font-bold text-slate-900">: {sidang.nim}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Program Studi</span>
                    <span className="col-span-9 text-slate-900">: {selectedProdi.nama} ({selectedProdi.jenjang})</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Judul Tugas Akhir</span>
                    <span className="col-span-9 font-semibold text-slate-950 italic">: &ldquo;{sidang.judulTA}&rdquo;</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Hari / Tanggal / Jam</span>
                    <span className="col-span-9 text-slate-900">: {sidang.hari}, {formattedDate} ({sidang.jamMulai} - {sidang.jamSelesai} WIB)</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Ruang Ujian</span>
                    <span className="col-span-9 text-slate-900">: {sidang.ruangan}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 pt-1 border-t border-slate-200">
                    <span className="col-span-3 text-blue-950 font-bold">Penguji / Pembimbing</span>
                    <span className="col-span-9 font-bold text-blue-950">: {examinerName.name} ({examinerName.role})</span>
                  </div>
                </div>

                {/* Rubrik Penilaian Standar A4 */}
                <div className="font-sans">
                  <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                    A. Komponen &amp; Bobot Penilaian Ujian
                  </h4>
                  <table className="w-full border-collapse border border-slate-400 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900">
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-10">No.</th>
                        <th className="border border-slate-400 px-3 py-1.5 text-left">Komponen Penilaian</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-16">Bobot (%)</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-24">Nilai (0-100)</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-24">Terbobot</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-medium">1</td>
                        <td className="border border-slate-400 px-3 py-1.5">
                          <span className="font-semibold text-slate-900">Format &amp; Sistematika Penulisan:</span>
                          <p className="text-[10px] text-slate-600">
                            Kerapihan tata tulis, kesesuaian pedoman penulisan TA FT UNBARI, ketepatan sitasi dan daftar pustaka.
                          </p>
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">15%</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            value={scores.formatPenulisan}
                            onChange={(e) => setScores({...scores, formatPenulisan: Number(e.target.value)})}
                            className="w-16 text-center font-bold border border-slate-300 rounded px-1 py-0.5 focus:outline-blue-500 print:border-none"
                          />
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold text-slate-800">
                          {(scores.formatPenulisan * 0.15).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-medium">2</td>
                        <td className="border border-slate-400 px-3 py-1.5">
                          <span className="font-semibold text-slate-900">Metodologi &amp; Penguasaan Teori Rekayasa:</span>
                          <p className="text-[10px] text-slate-600">
                            Kedalaman pemahaman teori keilmuan, ketepatan formulasi matematis, metode pengujian/simulasi.
                          </p>
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">25%</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            value={scores.penguasaanMateri}
                            onChange={(e) => setScores({...scores, penguasaanMateri: Number(e.target.value)})}
                            className="w-16 text-center font-bold border border-slate-300 rounded px-1 py-0.5 focus:outline-blue-500 print:border-none"
                          />
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold text-slate-800">
                          {(scores.penguasaanMateri * 0.25).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-medium">3</td>
                        <td className="border border-slate-400 px-3 py-1.5">
                          <span className="font-semibold text-slate-900">Penyajian Lisan &amp; Kualitas Presentasi:</span>
                          <p className="text-[10px] text-slate-600">
                            Artikulasi penyampaian, kejelasan slide presentasi, efektivitas waktu, dan penguasaan panggung.
                          </p>
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">20%</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            value={scores.presentasi}
                            onChange={(e) => setScores({...scores, presentasi: Number(e.target.value)})}
                            className="w-16 text-center font-bold border border-slate-300 rounded px-1 py-0.5 focus:outline-blue-500 print:border-none"
                          />
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold text-slate-800">
                          {(scores.presentasi * 0.20).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-medium">4</td>
                        <td className="border border-slate-400 px-3 py-1.5">
                          <span className="font-semibold text-slate-900">Tanya Jawab &amp; Argumentasi Ilmiah:</span>
                          <p className="text-[10px] text-slate-600">
                            Kemampuan mempertahankan argumen, respons atas kritik dewan penguji, ketepatan rujukan data.
                          </p>
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">25%</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            value={scores.tanyaJawab}
                            onChange={(e) => setScores({...scores, tanyaJawab: Number(e.target.value)})}
                            className="w-16 text-center font-bold border border-slate-300 rounded px-1 py-0.5 focus:outline-blue-500 print:border-none"
                          />
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold text-slate-800">
                          {(scores.tanyaJawab * 0.25).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-medium">5</td>
                        <td className="border border-slate-400 px-3 py-1.5">
                          <span className="font-semibold text-slate-900">Luaran Produk / Prototipe / Capaian Desain:</span>
                          <p className="text-[10px] text-slate-600">
                            Kelayakan prototipe/gambar teknik, kesimpulan yang valid, ketercapaian target luaran penelitian.
                          </p>
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">15%</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            value={scores.capaianHasil}
                            onChange={(e) => setScores({...scores, capaianHasil: Number(e.target.value)})}
                            className="w-16 text-center font-bold border border-slate-300 rounded px-1 py-0.5 focus:outline-blue-500 print:border-none"
                          />
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-semibold text-slate-800">
                          {(scores.capaianHasil * 0.15).toFixed(2)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={2} className="border border-slate-400 px-3 py-2 text-right uppercase">
                          Total Nilai Akhir (Angka)
                        </td>
                        <td className="border border-slate-400 px-2 py-2 text-center">100%</td>
                        <td colSpan={2} className="border border-slate-400 px-3 py-2 text-center text-sm font-black text-blue-950">
                          {finalScoreNumber} / 100
                        </td>
                      </tr>
                      <tr className="bg-blue-50/50 font-bold">
                        <td colSpan={2} className="border border-slate-400 px-3 py-2 text-right uppercase">
                          Konversi Huruf Mutu &amp; Status
                        </td>
                        <td colSpan={3} className="border border-slate-400 px-3 py-2 text-center">
                          <span className="text-sm font-extrabold text-blue-900 mr-2">Grade: {gradeInfo.grade}</span>
                          <span className="text-xs uppercase text-slate-700">({gradeInfo.status})</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Catatan Khusus Penguji */}
                <div className="font-sans border border-slate-300 p-3 rounded">
                  <h4 className="text-xs font-bold uppercase text-slate-900 mb-1">
                    B. Catatan Singkat Penguji:
                  </h4>
                  <div className="h-14 border border-dashed border-slate-300 rounded p-2 text-[10px] text-slate-700">
                    {sidang.catatanRevisi || 'Mahasiswa menguasai materi penelitian dengan baik. Revisi minor pada bab analisis data dan penyesuaian sitasi standar IEEE/Harvard dalam tempo maksimal 14 hari.'}
                  </div>
                </div>

                {/* Tanda Tangan Resmi Penguji */}
                <div className="font-sans pt-5 flex justify-between items-end gap-6 text-center text-xs break-inside-avoid">
                  <div className="w-48 text-left text-[10px] text-slate-500 border border-slate-200 rounded-md p-2.5 bg-slate-50/70">
                    <p className="font-semibold text-slate-700 mb-0.5">Rentang Nilai UNBARI:</p>
                    <p>&ge; 85 : A (4.00)</p>
                    <p>75 - 84 : B+ (3.30)</p>
                    <p>70 - 74 : B (3.00)</p>
                    <p>&lt; 55 : E (Tidak Lulus)</p>
                  </div>

                  <div className="w-64 flex flex-col items-center">
                    <div className="min-h-[2.75rem] flex flex-col justify-start">
                      <p className="text-[11px] text-slate-800">Jambi, {formattedDate}</p>
                      <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                        {examinerName.role}
                      </p>
                    </div>
                    <div className="h-16 w-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">[ Tanda Tangan Resmi ]</span>
                    </div>
                    <div className="w-full border-t border-slate-400 pt-1">
                      <p className="font-bold text-slate-950 uppercase text-[11px]">
                        {examinerName.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600">
                        NIDN. {sidang.id ? `00${Math.abs(sidang.id.split('').reduce((a,b)=>a+b.charCodeAt(0),0)) % 9000000 + 1000000}` : '0012057801'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BERITA ACARA SIDANG & SEMINAR TUGAS AKHIR */}
            {activeTab === 'berita_acara' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-4">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider underline text-slate-950 font-sans">
                    BERITA ACARA {sidang.tipeSidang.toUpperCase()}
                  </h2>
                  <p className="text-[11px] font-mono text-slate-700 font-sans">
                    Nomor: {sidang.id.replace('SIDANG-', 'BA-TA/FT-UB/2026/')}/X
                  </p>
                </div>

                <div className="font-serif text-justify text-xs leading-relaxed space-y-3">
                  <p>
                    Pada hari ini, <strong>{sidang.hari}</strong> tanggal <strong>{formattedDate}</strong> bertempat di <strong>{sidang.ruangan}</strong> Fakultas Teknik Universitas Batanghari Jambi, telah diselenggarakan Ujian <strong>{sidang.tipeSidang}</strong> Program Studi <strong>{selectedProdi.nama} ({selectedProdi.jenjang})</strong> terhadap mahasiswa:
                  </p>
                </div>

                {/* Identitas Mahasiswa Box */}
                <div className="border border-slate-300 rounded p-3 text-[11px] font-sans bg-slate-50/50 space-y-1">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Nama Mahasiswa</span>
                    <span className="col-span-9 font-bold text-slate-900">: {sidang.namaMahasiswa}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">NIM</span>
                    <span className="col-span-9 font-mono font-bold text-slate-900">: {sidang.nim}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Program Studi</span>
                    <span className="col-span-9 text-slate-900">: {selectedProdi.nama}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Judul Tugas Akhir</span>
                    <span className="col-span-9 font-semibold text-slate-950 italic">: &ldquo;{sidang.judulTA}&rdquo;</span>
                  </div>
                </div>

                {/* Tabel Nilai Tim Dewan Penguji */}
                <div className="font-sans">
                  <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                    Rekapitulasi Penilaian Dewan Penguji
                  </h4>
                  <table className="w-full border-collapse border border-slate-400 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900">
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                        <th className="border border-slate-400 px-3 py-1.5 text-left">Nama Dewan Penguji</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-36">Kedudukan</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-20">Nilai Angka</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-28">Tanda Tangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">1</td>
                        <td className="border border-slate-400 px-3 py-1.5 font-semibold text-slate-900">
                          {sidang.ketuaSidang || selectedProdi.kaprodi}
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center text-slate-700">Ketua Sidang</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">84.50</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center text-[10px] text-slate-500 italic">Tervalidasi</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">2</td>
                        <td className="border border-slate-400 px-3 py-1.5 font-semibold text-slate-900">
                          {sidang.pembimbing1 || 'Dosen Pembimbing I'}
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center text-slate-700">Pembimbing I</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">86.00</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center text-[10px] text-slate-500 italic">Tervalidasi</td>
                      </tr>
                      {sidang.pembimbing2 && (
                        <tr>
                          <td className="border border-slate-400 px-2 py-1.5 text-center">3</td>
                          <td className="border border-slate-400 px-3 py-1.5 font-semibold text-slate-900">
                            {sidang.pembimbing2}
                          </td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center text-slate-700">Pembimbing II</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">85.00</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center text-[10px] text-slate-500 italic">Tervalidasi</td>
                        </tr>
                      )}
                      <tr>
                        <td className="border border-slate-400 px-2 py-1.5 text-center">{sidang.pembimbing2 ? 4 : 3}</td>
                        <td className="border border-slate-400 px-3 py-1.5 font-semibold text-slate-900">
                          {sidang.penguji1 || 'Dosen Penguji I'}
                        </td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center text-slate-700">Penguji I</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">83.50</td>
                        <td className="border border-slate-400 px-2 py-1.5 text-center text-[10px] text-slate-500 italic">Tervalidasi</td>
                      </tr>
                      {sidang.penguji2 && (
                        <tr>
                          <td className="border border-slate-400 px-2 py-1.5 text-center">{sidang.pembimbing2 ? 5 : 4}</td>
                          <td className="border border-slate-400 px-3 py-1.5 font-semibold text-slate-900">
                            {sidang.penguji2}
                          </td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center text-slate-700">Penguji II</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-bold">84.00</td>
                          <td className="border border-slate-400 px-2 py-1.5 text-center text-[10px] text-slate-500 italic">Tervalidasi</td>
                        </tr>
                      )}
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={3} className="border border-slate-400 px-3 py-2 text-right uppercase">
                          Nilai Rata-Rata Akhir Sidang
                        </td>
                        <td className="border border-slate-400 px-2 py-2 text-center text-sm font-black text-blue-950">
                          {finalScoreNumber || 84.6}
                        </td>
                        <td className="border border-slate-400 px-2 py-2 text-center text-xs font-black text-emerald-800">
                          {gradeInfo.grade} (LULUS)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Keputusan Rapat Sidang */}
                <div className="font-serif text-justify text-xs leading-relaxed space-y-2 border border-slate-300 p-3 rounded">
                  <p>
                    Berdasarkan musyawarah Tim Dewan Penguji, mahasiswa yang bersangkutan dinyatakan:
                  </p>
                  <div className="flex items-center gap-6 font-sans text-xs font-bold pl-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                      <span>LULUS DENGAN PERBAIKAN (REVISI)</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-400">
                      <input type="checkbox" disabled className="w-4 h-4 rounded" />
                      <span>LULUS TANPA REVISI</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-400">
                      <input type="checkbox" disabled className="w-4 h-4 rounded" />
                      <span>TIDAK LULUS</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-600 font-sans">
                    Batas waktu penyelesaian revisi adalah <strong>14 (empat belas) hari kalender</strong> sejak berita acara ini ditandatangani. Jika melampaui batas waktu, maka nilai dapat ditinjau ulang oleh Program Studi.
                  </p>
                </div>

                {/* Tanda Tangan Pengesahan Dewan Penguji */}
                <div className="font-sans pt-6 grid grid-cols-2 gap-10 text-center text-xs break-inside-avoid">
                  <div className="flex flex-col items-center">
                    <div className="min-h-[2.75rem] flex flex-col justify-start">
                      <p className="text-[11px] text-slate-700">Mengetahui,</p>
                      <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                        Ketua Program Studi {selectedProdi.singkatan}
                      </p>
                    </div>
                    <div className="h-16 w-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">[ Tanda Tangan &amp; Cap ]</span>
                    </div>
                    <div className="w-56 border-t border-slate-400 pt-1">
                      <p className="font-bold text-slate-950 uppercase text-[11px]">
                        {selectedProdi.kaprodi}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600">
                        NIDN. {selectedProdi.nipKaprodi}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="min-h-[2.75rem] flex flex-col justify-start">
                      <p className="text-[11px] text-slate-700">Jambi, {formattedDate}</p>
                      <p className="text-[11px] font-bold text-slate-900 mt-0.5">Ketua Sidang Ujian</p>
                    </div>
                    <div className="h-16 w-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">[ Tanda Tangan ]</span>
                    </div>
                    <div className="w-56 border-t border-slate-400 pt-1">
                      <p className="font-bold text-slate-950 uppercase text-[11px]">
                        {sidang.ketuaSidang || selectedProdi.kaprodi}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600">
                        NIDN. {selectedProdi.nipKaprodi}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LEMBAR CATATAN PERBAIKAN & REVISI SIDANG */}
            {activeTab === 'lembar_revisi' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-4">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider underline text-slate-950 font-sans">
                    LEMBAR CATATAN REVISI &amp; PERBAIKAN {sidang.tipeSidang.toUpperCase()}
                  </h2>
                  <p className="text-[11px] font-mono text-slate-600 font-sans">
                    FAKULTAS TEKNIK UNIVERSITAS BATANGHARI JAMBI
                  </p>
                </div>

                {/* Identitas Mahasiswa Box */}
                <div className="border border-slate-300 rounded p-3 text-[11px] font-sans bg-slate-50/50 space-y-1">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Nama Mahasiswa</span>
                    <span className="col-span-9 font-bold text-slate-900">: {sidang.namaMahasiswa}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">NIM</span>
                    <span className="col-span-9 font-mono font-bold text-slate-900">: {sidang.nim}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Program Studi</span>
                    <span className="col-span-9 text-slate-900">: {selectedProdi.nama} ({selectedProdi.jenjang})</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-600 font-medium">Judul Tugas Akhir</span>
                    <span className="col-span-9 font-semibold text-slate-950 italic">: &ldquo;{sidang.judulTA}&rdquo;</span>
                  </div>
                </div>

                {/* Tabel Perbaikan Revisi */}
                <div className="font-sans">
                  <table className="w-full border-collapse border border-slate-400 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900">
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                        <th className="border border-slate-400 px-3 py-1.5 text-left w-44">Nama Dosen Penguji</th>
                        <th className="border border-slate-400 px-3 py-1.5 text-left">Uraian Butir Perbaikan / Revisi</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-20">Status</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-24">Paraf Penguji</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-400 px-2 py-2 text-center font-medium">1</td>
                        <td className="border border-slate-400 px-3 py-2 font-semibold text-slate-900">
                          {sidang.penguji1 || 'Dosen Penguji I'}
                          <p className="text-[9px] text-slate-500 font-normal">Penguji I</p>
                        </td>
                        <td className="border border-slate-400 px-3 py-2 text-slate-800">
                          Perbaiki rumusan masalah pada Bab 1 sesuai ruang lingkup pengujian laboratorium. Tambahkan analisis sensitivitas beban pada Bab 4.
                        </td>
                        <td className="border border-slate-400 px-2 py-2 text-center text-emerald-700 font-bold text-[10px]">
                          Selesai Direvisi
                        </td>
                        <td className="border border-slate-400 px-2 py-2 text-center text-[10px] text-slate-400 italic">
                          [ Paraf ]
                        </td>
                      </tr>
                      {sidang.penguji2 && (
                        <tr>
                          <td className="border border-slate-400 px-2 py-2 text-center font-medium">2</td>
                          <td className="border border-slate-400 px-3 py-2 font-semibold text-slate-900">
                            {sidang.penguji2}
                            <p className="text-[9px] text-slate-500 font-normal">Penguji II</p>
                          </td>
                          <td className="border border-slate-400 px-3 py-2 text-slate-800">
                            Lengkapi referensi jurnal internasional terkini (maksimal 5 tahun terakhir) minimal 5 rujukan pada Daftar Pustaka.
                          </td>
                          <td className="border border-slate-400 px-2 py-2 text-center text-emerald-700 font-bold text-[10px]">
                            Selesai Direvisi
                          </td>
                          <td className="border border-slate-400 px-2 py-2 text-center text-[10px] text-slate-400 italic">
                            [ Paraf ]
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="border border-slate-400 px-2 py-2 text-center font-medium">{sidang.penguji2 ? 3 : 2}</td>
                        <td className="border border-slate-400 px-3 py-2 font-semibold text-slate-900">
                          {sidang.pembimbing1 || 'Dosen Pembimbing I'}
                          <p className="text-[9px] text-slate-500 font-normal">Pembimbing I</p>
                        </td>
                        <td className="border border-slate-400 px-3 py-2 text-slate-800">
                          Format penulisan abstrak bahasa Inggris dan lampiran data mentah hasil pengujian harus disesuaikan dengan format template FT UNBARI.
                        </td>
                        <td className="border border-slate-400 px-2 py-2 text-center text-emerald-700 font-bold text-[10px]">
                          Selesai Direvisi
                        </td>
                        <td className="border border-slate-400 px-2 py-2 text-center text-[10px] text-slate-400 italic">
                          [ Paraf ]
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="font-serif text-[11px] leading-relaxed p-3 bg-slate-50 border border-slate-300 rounded">
                  <p>
                    Dengan ini Dosen Penguji dan Pembimbing menyatakan bahwa mahasiswa bersangkutan telah <strong>menyelesaikan seluruh revisi dan perbaikan</strong> sesuai saran dalam sidang ujian, dan berhak melakukan penjilidan naskah final serta pendaftaran Yudisium.
                  </p>
                </div>

                {/* Tanda Tangan Pengesahan Akhir */}
                <div className="font-sans pt-6 grid grid-cols-2 gap-10 text-center text-xs break-inside-avoid">
                  <div className="flex flex-col items-center">
                    <div className="min-h-[2.75rem] flex flex-col justify-start">
                      <p className="text-[11px] text-slate-800">Menyetujui,</p>
                      <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                        Dosen Pembimbing Utama
                      </p>
                    </div>
                    <div className="h-16 w-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">[ Tanda Tangan ]</span>
                    </div>
                    <div className="w-56 border-t border-slate-400 pt-1">
                      <p className="font-bold text-slate-950 uppercase text-[11px]">
                        {sidang.pembimbing1 || 'Dosen Pembimbing I, S.T., M.T.'}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600">Dosen Pembimbing TA</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="min-h-[2.75rem] flex flex-col justify-start">
                      <p className="text-[11px] text-slate-800">Jambi, {formattedDate}</p>
                      <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                        Ketua Program Studi {selectedProdi.singkatan}
                      </p>
                    </div>
                    <div className="h-16 w-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">[ Tanda Tangan &amp; Cap ]</span>
                    </div>
                    <div className="w-56 border-t border-slate-400 pt-1">
                      <p className="font-bold text-slate-950 uppercase text-[11px]">
                        {selectedProdi.kaprodi}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600">
                        NIDN. {selectedProdi.nipKaprodi}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
