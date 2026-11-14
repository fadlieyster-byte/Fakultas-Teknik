import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, FileText, CheckCircle2, Award, Calendar, Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { Mahasiswa, Dosen, JadwalKuliah, ProgramStudiInfo, JadwalSidangTA, JadwalKerjaPraktek } from '../types/index';
import { printDocumentElement } from '../utils/printHelper';
import { StandardKopSurat } from './StandardKopSurat';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProdi: ProgramStudiInfo;
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  jadwalList: JadwalKuliah[];
  sidangList?: JadwalSidangTA[];
  kpList?: JadwalKerjaPraktek[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  selectedProdi,
  mahasiswaList,
  dosenList,
  jadwalList,
  sidangList = [],
  kpList = []
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Keyboard shortcut Ctrl+P
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
  }, [isOpen, selectedProdi]);

  if (!isOpen) return null;

  const mhsBerisiko = mahasiswaList.filter(m => m.status === 'Berisiko' || m.peringatanSp > 0);
  const mhsSkripsi = mahasiswaList.filter(m => m.status === 'Tugas Akhir');
  const mhsLulus = mahasiswaList.filter(m => m.status === 'Lulus');
  const mhsCuti = mahasiswaList.filter(m => m.status === 'Cuti');

  const prodiSidang = sidangList.filter(s => s.prodiId === selectedProdi.id);
  const prodiKp = kpList.filter(k => k.prodiId === selectedProdi.id);

  const handlePrint = (usePopup = false) => {
    setIsPrinting(true);
    printDocumentElement(printAreaRef.current, {
      documentTitle: `Laporan_Evaluasi_FT_UNBARI_${selectedProdi.id}`,
      usePopupFallback: usePopup,
      onAfterPrint: () => setIsPrinting(false)
    });
    setTimeout(() => setIsPrinting(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 print:hidden modal-top-bar">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pratinjau Cetak Laporan Resmi Kaprodi FT UNBARI
              </h3>
              <p className="text-[11px] text-slate-500">
                Fakultas Teknik Universitas Batanghari · Program Studi {selectedProdi.nama}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrint(false)}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg shadow-xs transition-colors"
              title="Cetak langsung ke printer default komputer Anda (Ctrl + P)"
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
              title="Buka dokumen di jendela baru lalu cetak"
            >
              <span>Jendela Baru</span>
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

        {/* Printable Official Document Area */}
        <div 
          ref={printAreaRef}
          className="printable-document printable-sheet flex-1 overflow-y-auto p-8 font-sans text-slate-900 print:p-0"
        >
          
          {/* Institutional Letterhead - Standardized Kop Surat FT UNBARI */}
          <StandardKopSurat
            prodiName={`PROGRAM STUDI ${selectedProdi.nama.toUpperCase()}`}
            subTitle={`Akreditasi: ${selectedProdi.akreditasi}`}
            showQrCode={true}
            qrBadgeText="REPORT-VERIF"
          />

          {/* Title of Report */}
          <div className="text-center my-4">
            <h1 className="text-base font-bold uppercase underline tracking-tight">
              Laporan Evaluasi Akademik Mahasiswa, Kerja Praktek & Jadwal Dosen
            </h1>
            <div className="text-xs font-medium text-slate-600 mt-1 font-mono">
              Program Studi: {selectedProdi.nama} ({selectedProdi.jenjang}) · Semester Ganjil TA 2026/2027 · Tanggal Cetak: 19 Oktober 2026
            </div>
          </div>

          {/* Section 1: Ringkasan Mahasiswa */}
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase text-slate-800 border-b pb-1 mb-2">
              I. Ringkasan Demografi & Status Akademik Mahasiswa
            </h2>
            <div className="grid grid-cols-4 gap-3 text-xs mb-4">
              <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
                <span className="text-[11px] text-slate-500 block">Total Terdaftar</span>
                <span className="text-base font-bold font-mono">{mahasiswaList.length} Mahasiswa</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
                <span className="text-[11px] text-slate-500 block">{selectedProdi.jenjang === 'D3' ? 'Tahap Proyek Akhir' : 'Tahap Skripsi / TA'}</span>
                <span className="text-base font-bold font-mono text-blue-700">{mhsSkripsi.length} Mahasiswa</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
                <span className="text-[11px] text-slate-500 block">Evaluasi Khusus (Berisiko/SP)</span>
                <span className="text-base font-bold font-mono text-red-700">{mhsBerisiko.length} Mahasiswa</span>
              </div>
              <div className="border border-slate-300 p-2.5 rounded bg-slate-50/50">
                <span className="text-[11px] text-slate-500 block">Cuti / Lulus</span>
                <span className="text-base font-bold font-mono">{mhsCuti.length} Cuti / {mhsLulus.length} Lulus</span>
              </div>
            </div>

            {/* Table of At-Risk Students */}
            <span className="text-[11px] font-semibold text-slate-700 block mb-1">
              Daftar Mahasiswa Dalam Pengawasan Khusus Kaprodi:
            </span>
            <table className="w-full text-left text-[11px] border border-slate-300 mb-6">
              <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">NIM</th>
                  <th className="p-2 border-r border-slate-300">Nama Mahasiswa</th>
                  <th className="p-2 border-r border-slate-300">Semester</th>
                  <th className="p-2 border-r border-slate-300">IPK</th>
                  <th className="p-2 border-r border-slate-300">SKS Lulus</th>
                  <th className="p-2 border-r border-slate-300">Presensi</th>
                  <th className="p-2 border-r border-slate-300">Status SP</th>
                  <th className="p-2">Catatan Tindak Lanjut Kaprodi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mhsBerisiko.map((m) => (
                  <tr key={m.id}>
                    <td className="p-2 font-mono border-r border-slate-200">{m.nim}</td>
                    <td className="p-2 font-medium border-r border-slate-200">{m.nama}</td>
                    <td className="p-2 font-mono border-r border-slate-200">Sem. {m.semester}</td>
                    <td className="p-2 font-mono font-bold text-red-700 border-r border-slate-200">{m.ipk.toFixed(2)}</td>
                    <td className="p-2 font-mono border-r border-slate-200">{m.sksLulus} SKS</td>
                    <td className="p-2 font-mono border-r border-slate-200">{m.kehadiranPersen}%</td>
                    <td className="p-2 border-r border-slate-200 font-semibold text-amber-700">SP-{m.peringatanSp}</td>
                    <td className="p-2 text-slate-600">{m.catatanAkademik || 'Wajib konseling Kaprodi.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Jadwal Kerja Praktek & Sidang TA */}
          <div className="mt-4">
            <h2 className="text-xs font-bold uppercase text-slate-800 border-b pb-1 mb-2">
              II. Rekapitulasi Kerja Praktek (KP) & Jadwal Sidang Tugas Akhir
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
              {/* KP Summary */}
              <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
                <span className="font-bold text-slate-900 block mb-2">Kerja Praktek (KP / PKL Terdaftar: {prodiKp.length}):</span>
                <div className="space-y-1.5">
                  {prodiKp.map(k => (
                    <div key={k.id} className="text-[11px] border-b border-slate-200 pb-1.5 last:border-0">
                      <div className="font-semibold text-slate-800">{k.namaMahasiswa} ({k.nim})</div>
                      <div className="text-slate-600 truncate">Proyek: {k.instansiPerusahaan} ({k.lokasiKota})</div>
                      <div className="text-[10px] text-slate-500">
                        Status: <span className="font-semibold text-blue-700">{k.status}</span> · Dosen: {k.dosenPembimbing}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidang TA Summary */}
              <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
                <span className="font-bold text-slate-900 block mb-2">Sidang Tugas Akhir Terjadwal ({prodiSidang.length}):</span>
                <div className="space-y-1.5">
                  {prodiSidang.map(s => (
                    <div key={s.id} className="text-[11px] border-b border-slate-200 pb-1.5 last:border-0">
                      <div className="font-semibold text-slate-800">{s.namaMahasiswa} ({s.nim}) - <span className="text-purple-700">{s.tipeSidang}</span></div>
                      <div className="text-slate-600 truncate">Waktu: {s.hari}, {s.tanggal} ({s.jamMulai} WIB) @ {s.ruangan}</div>
                      <div className="text-[10px] text-slate-500">
                        Status: <span className="font-semibold text-emerald-700">{s.status}</span> · Ketua Sidang: {s.ketuaSidang}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Jadwal & BKD Dosen FT UNBARI */}
          <div className="mt-4">
            <h2 className="text-xs font-bold uppercase text-slate-800 border-b pb-1 mb-2">
              III. Presensi, Beban SKS & Kepatuhan BAP Dosen FT UNBARI
            </h2>
            <table className="w-full text-left text-[11px] border border-slate-300 mb-6">
              <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">NIDN / NUPTK</th>
                  <th className="p-2 border-r border-slate-300">Nama Dosen & Keahlian</th>
                  <th className="p-2 border-r border-slate-300">Jabatan</th>
                  <th className="p-2 border-r border-slate-300 text-right">SKS Ajar</th>
                  <th className="p-2 border-r border-slate-300 text-right">Bimbingan TA</th>
                  <th className="p-2 border-r border-slate-300 text-right">Kepatuhan BAP</th>
                  <th className="p-2">Status Beban</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dosenList.map((d) => (
                  <tr key={d.id}>
                    <td className="p-2 font-mono border-r border-slate-200 text-[11px]">
                      <div>{d.nidn}</div>
                      {d.nuptk && <div className="text-slate-400 text-[10px]">{d.nuptk}</div>}
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-semibold text-slate-900">{d.namaLengkap}</div>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">{d.keahlian}{d.pendidikanTerakhir ? ` · ${d.pendidikanTerakhir}` : ''}</div>
                    </td>
                    <td className="p-2 border-r border-slate-200">{d.jabatanFungsional}</td>
                    <td className="p-2 font-mono text-right border-r border-slate-200">{d.totalSksMengajar} SKS</td>
                    <td className="p-2 font-mono text-right border-r border-slate-200">{d.jumlahMahasiswaBimbingan} Mhs</td>
                    <td className="p-2 font-mono text-right border-r border-slate-200 font-bold text-emerald-700">{d.kehadiranBapPersen}%</td>
                    <td className="p-2">
                      {d.totalSksMengajar > 16 ? (
                        <span className="text-amber-700 font-semibold">Kelebihan Beban</span>
                      ) : d.totalSksMengajar < 12 ? (
                        <span className="text-red-700 font-semibold">Kurang Beban</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Sesuai Standar</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Signature Block */}
          <div className="mt-8 pt-4 flex justify-between items-end text-xs border-t border-slate-300">
            <div className="text-center min-w-[200px]">
              <div>Mengetahui,</div>
              <div className="font-semibold text-slate-800">Dekan Fakultas Teknik UNBARI</div>
              <div className="h-16 flex items-center justify-center">
                <span className="font-serif italic text-slate-400 text-[10px]">[Tanda Tangan & Cap Dekanat]</span>
              </div>
              <div className="font-bold underline">Fadli Eka Yandra, ST., MT</div>
              <div className="font-mono text-[10px] text-slate-600">NIDN. 1004077102</div>
            </div>

            <div className="text-center min-w-[220px]">
              <div>Kota Jambi, 19 Oktober 2026</div>
              <div className="font-semibold text-slate-800">{selectedProdi.gelarKaprodi}</div>
              <div className="h-16 flex items-center justify-center">
                <span className="font-serif italic text-slate-400 text-[10px]">[Tanda Tangan Digital Terverifikasi]</span>
              </div>
              <div className="font-bold underline">{selectedProdi.kaprodi}</div>
              <div className="font-mono text-[10px] text-slate-600">NIP. {selectedProdi.nipKaprodi}</div>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-slate-400 border-t pt-2">
            Dokumen ini dicetak secara otomatis dari Sistem Informasi Kaprodi (SiKaprodi) Fakultas Teknik Universitas Batanghari (UNBARI) Jambi
          </div>

        </div>

      </div>
    </div>
  );
};
