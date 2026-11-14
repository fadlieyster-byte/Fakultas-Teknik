import React, { useState, useRef } from 'react';
import { Printer, Download, X, QrCode, BookOpen, CheckCircle, Award } from 'lucide-react';
import { LmsKelasKuliah, ProgramStudiInfo } from '../types';
import { StandardKopSurat } from './StandardKopSurat';
import { printDocumentElement } from '../utils/printHelper';

interface LmsPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  kelas: LmsKelasKuliah;
  selectedProdi: ProgramStudiInfo;
}

export const LmsPrintModal: React.FC<LmsPrintModalProps> = ({
  isOpen,
  onClose,
  kelas,
  selectedProdi
}) => {
  const [docType, setDocType] = useState<'dpna' | 'jurnal'>('dpna');
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (printContentRef.current) {
      const docLabel = docType === 'dpna' ? 'DPNA' : 'Jurnal Perkuliahan 16 Sesi';
      printDocumentElement(printContentRef.current, {
        documentTitle: `${docLabel} - ${kelas.kodeMK} ${kelas.namaMK} (${kelas.kelas})`
      });
    } else {
      window.print();
    }
  };

  // Stats for DPNA with full 11-grade UNBARI scale
  const totalPeserta = kelas.nilaiList.length || 1;
  const countA = kelas.nilaiList.filter(n => n.hurufMutu === 'A').length;
  const countAMinus = kelas.nilaiList.filter(n => n.hurufMutu === 'A-').length;
  const countBPlus = kelas.nilaiList.filter(n => n.hurufMutu === 'B+').length;
  const countB = kelas.nilaiList.filter(n => n.hurufMutu === 'B').length;
  const countBMinus = kelas.nilaiList.filter(n => n.hurufMutu === 'B-').length;
  const countCPlus = kelas.nilaiList.filter(n => n.hurufMutu === 'C+').length;
  const countC = kelas.nilaiList.filter(n => n.hurufMutu === 'C').length;
  const countCMinus = kelas.nilaiList.filter(n => n.hurufMutu === 'C-').length;
  const countDPlus = kelas.nilaiList.filter(n => n.hurufMutu === 'D+').length;
  const countD = kelas.nilaiList.filter(n => n.hurufMutu === 'D').length;
  const countE = kelas.nilaiList.filter(n => n.hurufMutu === 'E').length;
  const countLulus = kelas.nilaiList.filter(n => n.statusKelulusan === 'Lulus').length;
  const persentaseLulus = Math.round((countLulus / totalPeserta) * 100);

  const qrValidationUrl = `https://universitasbatanghari.ac.id/verifikasi/lms/${docType}/${kelas.id}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Toolbar - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pratinjau Cetak Dokumen LMS (Standar A4)
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{kelas.kodeMK} - {kelas.namaMK} ({kelas.kelas})</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700">Margin 1 1 1 1 cm</span>
              </p>
            </div>
          </div>

          {/* Doc Type Selector */}
          <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setDocType('dpna')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                docType === 'dpna'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              DPNA (Daftar Nilai Akhir)
            </button>
            <button
              type="button"
              onClick={() => setDocType('jurnal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                docType === 'jurnal'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jurnal & Agenda Kuliah (16 Sesi)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 dimensions: 210mm x 297mm) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 print:bg-white print:p-0">
          <div
            ref={printContentRef}
            className="mx-auto bg-white p-8 sm:p-10 shadow-lg border border-slate-200 max-w-[210mm] min-h-[297mm] text-slate-900 font-serif print:shadow-none print:border-none print:max-w-none print:p-0 print:m-0"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Standard Kop Surat Resmi */}
            <StandardKopSurat
              prodiName={selectedProdi.nama}
              showQrCode={true}
              qrCodeUrl={qrValidationUrl}
            />

            {docType === 'dpna' ? (
              /* DOKUMEN 1: DAFTAR PESERTA DAN NILAI AKHIR (DPNA) */
              <div className="space-y-4 font-sans text-xs">
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-serif">
                    DAFTAR PESERTA DAN NILAI AKHIR (DPNA)
                  </h3>
                  <p className="text-[11px] text-slate-600 font-sans">
                    SEMESTER GANJIL TAHUN AKADEMIK {kelas.tahunAkademik}
                  </p>
                </div>

                {/* Course Metadata Box */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 p-3 bg-slate-50 border border-slate-300 rounded-lg text-[11px]">
                  <div>
                    <span className="text-slate-500 w-32 inline-block">Program Studi</span>
                    <span className="font-semibold text-slate-900">: {selectedProdi.nama} ({selectedProdi.jenjang})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 w-32 inline-block">Mata Kuliah</span>
                    <span className="font-semibold text-slate-900">: {kelas.kodeMK} - {kelas.namaMK}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 w-32 inline-block">Bobot SKS / Kelas</span>
                    <span className="font-semibold text-slate-900">: {kelas.sks} SKS / {kelas.kelas}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 w-32 inline-block">Dosen Pengampu</span>
                    <span className="font-semibold text-slate-900">: {kelas.dosenNama}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 w-32 inline-block">Jadwal & Ruang</span>
                    <span className="font-semibold text-slate-900">: {kelas.hari}, {kelas.jamMulai}-{kelas.jamSelesai} WIB ({kelas.ruanganNama})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 w-32 inline-block">Standar Capaian</span>
                    <span className="font-semibold text-slate-900">: Kurikulum OBE - IABEE / LAM TEKNIK</span>
                  </div>
                </div>

                {/* Table Nilai Mahasiswa */}
                <table className="w-full border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-center font-bold">
                      <th className="border border-slate-300 p-1.5 w-7">No</th>
                      <th className="border border-slate-300 p-1.5 w-20">NIM</th>
                      <th className="border border-slate-300 p-1.5 text-left">Nama Mahasiswa</th>
                      <th className="border border-slate-300 p-1.5 w-12">Hadir (10%)</th>
                      <th className="border border-slate-300 p-1.5 w-12">Tugas (20%)</th>
                      <th className="border border-slate-300 p-1.5 w-12">Kuis (10%)</th>
                      <th className="border border-slate-300 p-1.5 w-12">Praktikum (15%)</th>
                      <th className="border border-slate-300 p-1.5 w-12">UTS (20%)</th>
                      <th className="border border-slate-300 p-1.5 w-12">UAS (25%)</th>
                      <th className="border border-slate-300 p-1.5 w-14 bg-blue-50/50">Nilai Akhir</th>
                      <th className="border border-slate-300 p-1.5 w-10 bg-blue-50/50">Huruf</th>
                      <th className="border border-slate-300 p-1.5 w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kelas.nilaiList.map((n, idx) => (
                      <tr key={n.mahasiswaNim} className="hover:bg-slate-50 text-slate-800">
                        <td className="border border-slate-300 p-1.5 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono font-medium">{n.mahasiswaNim}</td>
                        <td className="border border-slate-300 p-1.5 font-medium">{n.mahasiswaNama}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono">{n.kehadiranPersen}%</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono">{n.tugas}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono">{n.kuis}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono">{n.praktikum}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono">{n.uts}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono">{n.uas}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono font-bold bg-blue-50/40 text-blue-900">
                          {n.nilaiAkhir.toFixed(1)}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 bg-blue-50/40">
                          {n.hurufMutu}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-semibold">
                          <span className={n.statusKelulusan === 'Lulus' ? 'text-emerald-700' : 'text-red-700'}>
                            {n.statusKelulusan}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Grade Distribution & Signatures */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50/50 space-y-1.5 text-[9.5px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 uppercase text-[10px]">Distribusi Huruf Mutu UNBARI:</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                        {persentaseLulus}% Lulus
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-1 text-center font-mono">
                      <div className="p-1 bg-white border border-slate-200 rounded">A: <b>{countA}</b></div>
                      <div className="p-1 bg-white border border-slate-200 rounded">A-: <b>{countAMinus}</b></div>
                      <div className="p-1 bg-white border border-slate-200 rounded">B+: <b>{countBPlus}</b></div>
                      <div className="p-1 bg-white border border-slate-200 rounded">B: <b>{countB}</b></div>
                      <div className="p-1 bg-white border border-slate-200 rounded">B-: <b>{countBMinus}</b></div>
                      <div className="p-1 bg-white border border-slate-200 rounded">C+: <b>{countCPlus}</b></div>
                      <div className="p-1 bg-white border border-slate-200 rounded">C: <b>{countC}</b></div>
                      <div className="p-1 bg-white border border-slate-200 rounded">C-: <b>{countCMinus}</b></div>
                      <div className="p-1 bg-white border border-slate-200 rounded">D+: <b>{countDPlus}</b></div>
                      <div className="p-1 bg-white border border-slate-200 rounded">D: <b>{countD}</b></div>
                      <div className="p-1 bg-white border border-slate-200 rounded text-red-700">E: <b>{countE}</b></div>
                      <div className="p-1 bg-blue-50 border border-blue-200 rounded text-blue-900 font-bold">
                        {kelas.nilaiList.length} Mhs
                      </div>
                    </div>
                    <p className="text-[8.5px] text-slate-600 leading-tight">
                      <strong>Pedoman Skala:</strong> A (80,00-100) · A- (77,50-79,99) · B+ (75,00-77,49) · B (70,00-74,99) · B- (67,50-69,99) · C+ (65,00-67,49) · C (60,00-64,99) · C- (57,50-59,99) · D+ (55,00-57,49) · D (50,00-54,99) · E (&lt;= 49,99).
                    </p>
                  </div>

                  <div className="flex justify-between text-[11px] font-sans">
                    <div className="text-center w-40">
                      <p className="text-slate-600">Mengetahui,</p>
                      <p className="font-semibold text-slate-800">Ketua Program Studi</p>
                      <div className="h-16 flex items-end justify-center">
                        <div className="border-b border-slate-800 w-36 pb-1">
                          <p className="font-bold text-[10px] text-slate-900">{selectedProdi.kaprodi}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-600">NIP/NIDN: {selectedProdi.nipKaprodi}</p>
                    </div>

                    <div className="text-center w-40">
                      <p className="text-slate-600">Kota Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-semibold text-slate-800">Dosen Pengampu MK</p>
                      <div className="h-16 flex items-end justify-center">
                        <div className="border-b border-slate-800 w-36 pb-1">
                          <p className="font-bold text-[10px] text-slate-900">{kelas.dosenNama}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-600">NIDN: {kelas.dosenNidn}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* DOKUMEN 2: JURNAL & AGENDA PERKULIAHAN 16 PERTEMUAN */
              <div className="space-y-4 font-sans text-xs">
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-serif">
                    JURNAL PERKULIAHAN & PRESENSI KELAS (16 SESI RPS)
                  </h3>
                  <p className="text-[11px] text-slate-600 font-sans">
                    FAKULTAS TEKNIK UNIVERSITAS BATANGHARI · SEMESTER GANJIL {kelas.tahunAkademik}
                  </p>
                </div>

                {/* Course Metadata Box */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 p-3 bg-slate-50 border border-slate-300 rounded-lg text-[11px]">
                  <div>
                    <span className="text-slate-500 w-32 inline-block">Program Studi</span>
                    <span className="font-semibold text-slate-900">: {selectedProdi.nama} ({selectedProdi.jenjang})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 w-32 inline-block">Mata Kuliah</span>
                    <span className="font-semibold text-slate-900">: {kelas.kodeMK} - {kelas.namaMK} ({kelas.sks} SKS)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 w-32 inline-block">Dosen Pengampu</span>
                    <span className="font-semibold text-slate-900">: {kelas.dosenNama} (NIDN: {kelas.dosenNidn})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 w-32 inline-block">Ruangan / Kelas</span>
                    <span className="font-semibold text-slate-900">: {kelas.ruanganNama} / {kelas.kelas}</span>
                  </div>
                </div>

                {/* Table Sesi 16 Pertemuan */}
                <table className="w-full border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-center font-bold">
                      <th className="border border-slate-300 p-1.5 w-8">P.Ke</th>
                      <th className="border border-slate-300 p-1.5 w-20">Tanggal</th>
                      <th className="border border-slate-300 p-1.5 text-left">Topik Bahasan & Pokok Materi RPS</th>
                      <th className="border border-slate-300 p-1.5 w-28">CPMK Target</th>
                      <th className="border border-slate-300 p-1.5 w-16">Metode</th>
                      <th className="border border-slate-300 p-1.5 w-14">Kehadiran</th>
                      <th className="border border-slate-300 p-1.5 w-14">Status</th>
                      <th className="border border-slate-300 p-1.5 w-14">Paraf Dosen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kelas.pertemuanList.map((p) => {
                      const persen = p.totalMahasiswa > 0 ? Math.round((p.kehadiranHadir / p.totalMahasiswa) * 100) : 0;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 text-slate-800">
                          <td className="border border-slate-300 p-1.5 text-center font-bold">{p.pertemuanKe}</td>
                          <td className="border border-slate-300 p-1.5 text-center font-mono">{p.tanggal}</td>
                          <td className="border border-slate-300 p-1.5">
                            <span className="font-semibold text-slate-900">{p.topik}</span>
                            {p.subTopik && <p className="text-[9px] text-slate-500">{p.subTopik}</p>}
                          </td>
                          <td className="border border-slate-300 p-1.5 text-slate-600 text-[9px]">{p.cpmkTarget}</td>
                          <td className="border border-slate-300 p-1.5 text-center text-[9px]">{p.metode}</td>
                          <td className="border border-slate-300 p-1.5 text-center font-mono">
                            {p.status === 'Selesai' ? `${p.kehadiranHadir}/${p.totalMahasiswa} (${persen}%)` : '-'}
                          </td>
                          <td className="border border-slate-300 p-1.5 text-center">
                            <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${
                              p.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="border border-slate-300 p-1.5 text-center">
                            {p.status === 'Selesai' ? (
                              <span className="font-serif italic text-blue-800 text-[10px]">Ttd. Valid</span>
                            ) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="flex justify-between text-[11px] font-sans pt-4">
                  <div className="text-center w-44">
                    <p className="text-slate-600">Mengetahui & Memverifikasi,</p>
                    <p className="font-semibold text-slate-800">Ketua Program Studi</p>
                    <div className="h-16 flex items-end justify-center">
                      <div className="border-b border-slate-800 w-40 pb-1">
                        <p className="font-bold text-[10px] text-slate-900">{selectedProdi.kaprodi}</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-600">NIP/NIDN: {selectedProdi.nipKaprodi}</p>
                  </div>

                  <div className="text-center w-44">
                    <p className="text-slate-600">Kota Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-semibold text-slate-800">Dosen Pengampu Mata Kuliah</p>
                    <div className="h-16 flex items-end justify-center">
                      <div className="border-b border-slate-800 w-40 pb-1">
                        <p className="font-bold text-[10px] text-slate-900">{kelas.dosenNama}</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-600">NIDN: {kelas.dosenNidn}</p>
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
