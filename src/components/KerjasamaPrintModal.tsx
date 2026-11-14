import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { DokumenKerjasama, ProgramStudiInfo } from '../types/index';
import { printDirectToDefaultPrinter } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';

interface KerjasamaPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  kerjasamaList: DokumenKerjasama[];
  selectedProdi: ProgramStudiInfo;
  selectedDoc?: DokumenKerjasama | null;
}

export const KerjasamaPrintModal: React.FC<KerjasamaPrintModalProps> = ({
  isOpen,
  onClose,
  kerjasamaList,
  selectedProdi,
  selectedDoc
}) => {
  const [isPrinting, setIsPrinting] = React.useState(false);

  if (!isOpen) return null;

  const handlePrint = (previewOnly = false) => {
    setIsPrinting(true);
    printDirectToDefaultPrinter(
      'print-kerjasama-document',
      selectedDoc 
        ? `Laporan_Kerjasama_${selectedDoc.jenisDokumen}_${selectedDoc.mitraNama.replace(/\s+/g, '_')}`
        : `Rekapitulasi_Kerjasama_FT_UNBARI_${selectedProdi.singkatan}`,
      previewOnly
    );
    setTimeout(() => setIsPrinting(false), 800);
  };

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {selectedDoc 
                ? `Pratinjau Cetak Lembar Dokumen Kerjasama (${selectedDoc.jenisDokumen})` 
                : 'Pratinjau Cetak Rekapitulasi Kerjasama Tridharma (LKPS Kriteria 6)'}
            </h3>
            <p className="text-xs text-slate-500">
              Fakultas Teknik Universitas Batanghari · Program Studi {selectedProdi.nama}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrint(false)}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Mempersiapkan Printer...' : 'Cetak Dokumen Resmi'}</span>
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

        {/* Printable Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60">
          <div
            id="print-kerjasama-document"
            className="bg-white p-8 max-w-[210mm] mx-auto shadow-sm border border-slate-300 text-slate-900"
            style={{ minHeight: '297mm' }}
          >
            
            {/* Kop Resmi Surat Fakultas Teknik UNBARI */}
            <div className="flex items-center gap-4 pb-3 mb-4 border-b-2 border-black">
              <img
                src="/assets/aistudio/logo_unbari_8fe2adcb.png"
                alt="Logo UNBARI"
                className="w-20 h-20 object-contain shrink-0"
              />
              <div className="text-center flex-1">
                <p className="text-xs font-semibold tracking-wide uppercase font-serif text-slate-800">
                  Yayasan Pendidikan Bale Batanghari
                </p>
                <h2 className="text-lg font-black tracking-tight uppercase font-serif text-slate-900 leading-tight">
                  Universitas Batanghari
                </h2>
                <h3 className="text-base font-bold uppercase font-serif text-slate-900 tracking-wide">
                  Fakultas Teknik
                </h3>
                <p className="text-[10px] text-slate-600 font-sans mt-0.5 leading-tight">
                  Program Studi: S-1 Teknik Sipil · S-1 Teknik Lingkungan · D-3 Teknik Listrik
                </p>
                <p className="text-[9px] text-slate-500 font-sans leading-tight">
                  Jl. Slamet Riyadi No. 1 Broni, Telanaipura, Kota Jambi 36122 · Telp: (0741) 60103 · Website: ft.unbari.ac.id
                </p>
              </div>
            </div>

            {selectedDoc ? (
              /* Single Document Detail Preview */
              <div>
                <div className="text-center mb-5">
                  <h4 className="font-serif font-bold text-sm uppercase tracking-wide text-slate-900">
                    Lembar Verifikasi Naskah &amp; Realisasi Kerjasama
                  </h4>
                  <p className="text-xs font-mono text-slate-700 font-semibold mt-0.5">
                    Nomor Registrasi: {selectedDoc.nomorDokumen}
                  </p>
                  <p className="text-[10px] font-sans text-slate-500">
                    Standar Akreditasi LAM-Teknik &amp; Indikator Kinerja Utama (IKU-6)
                  </p>
                </div>

                {/* Profile Box */}
                <div className="border border-slate-300 rounded p-3 mb-4 bg-slate-50/70 text-[11px] space-y-1.5 font-sans">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Jenis Dokumen:</span>
                    <span className="col-span-2 font-bold text-slate-900">{selectedDoc.jenisDokumen} (Tingkat {selectedDoc.tingkat})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Lembaga Mitra:</span>
                    <span className="col-span-2 font-bold text-blue-900">{selectedDoc.mitraNama}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Kategori Mitra:</span>
                    <span className="col-span-2 text-slate-800">{selectedDoc.kategoriMitra}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Judul Kerjasama:</span>
                    <span className="col-span-2 font-medium text-slate-900">{selectedDoc.judulKerjasama}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Periode Berlaku:</span>
                    <span className="col-span-2 font-mono text-slate-800">
                      {selectedDoc.tanggalMulai} s.d. {selectedDoc.tanggalSelesai} ({selectedDoc.status})
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Penandatangan FT:</span>
                    <span className="col-span-2 text-slate-800">{selectedDoc.pejabatPenandatanganFT}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Penandatangan Mitra:</span>
                    <span className="col-span-2 text-slate-800">{selectedDoc.pejabatPenandatanganMitra} ({selectedDoc.jabatanPenandatanganMitra})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Dosen PIC FT:</span>
                    <span className="col-span-2 font-semibold text-slate-900">{selectedDoc.picDosenFT}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Manfaat bagi Prodi:</span>
                    <span className="col-span-2 text-slate-700 italic">{selectedDoc.manfaatBagiProdi}</span>
                  </div>
                </div>

                {/* Realisasi Table */}
                <div className="mb-6">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                    Bukti Realisasi Kegiatan Kerjasama (Implementation Arrangement - IA)
                  </h5>
                  <table className="w-full border-collapse border border-slate-400 font-sans text-[10px]">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 font-bold">
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-left">Nama Kegiatan &amp; Hasil</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-20">Tanggal</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-center w-16">Mhs/Dosen</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-left w-36">Nomor Bukti IA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDoc.realisasiList && selectedDoc.realisasiList.length > 0 ? (
                        selectedDoc.realisasiList.map((rea, idx) => (
                          <tr key={rea.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">{idx + 1}</td>
                            <td className="border border-slate-400 px-2 py-1.5">
                              <span className="font-bold text-slate-900 block">{rea.namaKegiatan}</span>
                              <span className="text-slate-600 italic block mt-0.5">{rea.deskripsiHasil}</span>
                            </td>
                            <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">{rea.tanggalPelaksanaan}</td>
                            <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">
                              {rea.jumlahMahasiswaTerlibat} Mhs / {rea.jumlahDosenTerlibat} Dsn
                            </td>
                            <td className="border border-slate-400 px-2 py-1.5 font-mono text-[9px] text-blue-800">
                              {rea.nomorBuktiKegiatan}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="border border-slate-400 px-3 py-4 text-center text-slate-500 italic">
                            Belum ada catatan realisasi kegiatan (IA) untuk dokumen kerjasama ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* All Partnerships Table (Standard LKPS Format Kriteria 6) */
              <div>
                <div className="text-center mb-5">
                  <h4 className="font-serif font-bold text-sm uppercase tracking-wide text-slate-900">
                    Daftar Kerjasama Tridharma Perguruan Tinggi
                  </h4>
                  <p className="text-xs font-sans text-slate-700 font-semibold mt-0.5">
                    Tabel Kemitraan LKPS Kriteria 6 Akreditasi LAM-Teknik / IKU 6
                  </p>
                  <p className="text-[10px] font-sans text-slate-500">
                    Fakultas Teknik Universitas Batanghari · Posisi Data: {currentDateStr}
                  </p>
                </div>

                <div className="mb-6">
                  <table className="w-full border-collapse border border-slate-400 font-sans text-[9px]">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 font-bold">
                        <th className="border border-slate-400 px-1.5 py-1.5 text-center w-6">No</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-left">Lembaga Mitra &amp; No. PKS</th>
                        <th className="border border-slate-400 px-1.5 py-1.5 text-center w-16">Tingkat</th>
                        <th className="border border-slate-400 px-2 py-1.5 text-left">Judul Kerjasama &amp; Manfaat</th>
                        <th className="border border-slate-400 px-1.5 py-1.5 text-center w-20">Masa Berlaku</th>
                        <th className="border border-slate-400 px-1.5 py-1.5 text-center w-14">Bukti IA</th>
                        <th className="border border-slate-400 px-1.5 py-1.5 text-center w-14">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kerjasamaList.map((kjs, idx) => (
                        <tr key={kjs.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="border border-slate-400 px-1.5 py-1.5 text-center font-mono">{idx + 1}</td>
                          <td className="border border-slate-400 px-2 py-1.5">
                            <span className="font-bold text-slate-900 block leading-tight">{kjs.mitraNama}</span>
                            <span className="font-mono text-[8px] text-blue-900 block mt-0.5">{kjs.nomorDokumen}</span>
                            <span className="text-[8px] text-slate-500 block">{kjs.kategoriMitra}</span>
                          </td>
                          <td className="border border-slate-400 px-1.5 py-1.5 text-center">
                            <span className={`inline-block px-1 py-0.2 rounded text-[8px] font-semibold ${
                              kjs.tingkat === 'Internasional' ? 'bg-purple-100 text-purple-800' :
                              kjs.tingkat === 'Nasional' ? 'bg-blue-100 text-blue-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {kjs.tingkat}
                            </span>
                          </td>
                          <td className="border border-slate-400 px-2 py-1.5">
                            <span className="font-semibold text-slate-900 block leading-tight">{kjs.judulKerjasama}</span>
                            <span className="text-slate-600 italic block mt-0.5 leading-tight">{kjs.manfaatBagiProdi}</span>
                          </td>
                          <td className="border border-slate-400 px-1.5 py-1.5 text-center font-mono text-[8px]">
                            {kjs.tanggalMulai} <br />s.d<br /> {kjs.tanggalSelesai}
                          </td>
                          <td className="border border-slate-400 px-1.5 py-1.5 text-center font-mono font-bold text-blue-800">
                            {kjs.realisasiList ? kjs.realisasiList.length : 0} Kegiatan
                          </td>
                          <td className="border border-slate-400 px-1.5 py-1.5 text-center text-[8px] font-bold">
                            <span className={kjs.status === 'Aktif' ? 'text-emerald-700' : kjs.status === 'Mendekati Berakhir' ? 'text-amber-700' : 'text-red-700'}>
                              {kjs.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Signature & Verification Seal */}
            <div className="pt-4 border-t border-slate-300 font-sans text-[11px] mt-6">
              <div className="flex items-start justify-between">
                
                {/* Left: Security QR */}
                <div className="max-w-[280px]">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCodeSvg
                      value={`FT-UNBARI-KJS|DEKAN:1004077102|DOC:${selectedDoc ? selectedDoc.nomorDokumen : 'REKAP-KERJASAMA'}|TGL:${new Date().toISOString()}`}
                      size={54}
                      title="Validasi Kerjasama FT UNBARI"
                    />
                    <div>
                      <span className="text-[9px] font-bold text-slate-800 block">Unit Kerjasama &amp; Kemitraan</span>
                      <span className="text-[8px] font-mono text-slate-600 block">Register: FT-UNBARI/KJS-IKU6/2026</span>
                      <span className="text-[8px] text-emerald-700 font-semibold block">Dokumen Sah &amp; Terverifikasi</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-slate-500 italic leading-tight">
                    Dicetak secara elektronik melalui Sistem Informasi Kaprodi (SiKaprodi) FT UNBARI untuk keperluan akreditasi LAM-Teknik &amp; pelaporan IKU-6.
                  </p>
                </div>

                {/* Right: Signatures of Dekan & Kaprodi */}
                <div className="grid grid-cols-2 gap-6 text-center min-w-[340px]">
                  <div>
                    <p className="text-slate-600">Mengetahui,</p>
                    <p className="font-bold text-slate-900">Ketua Program Studi</p>
                    <div className="h-16 flex items-end justify-center">
                      <div className="border-b border-black w-36 pb-0.5">
                        <span className="font-bold text-[11px] text-slate-900 block">{selectedProdi.kaprodi}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIDN: {selectedProdi.nipKaprodi}</p>
                  </div>

                  <div>
                    <p className="text-slate-600">Jambi, {currentDateStr}</p>
                    <p className="font-bold text-slate-900">Dekan Fakultas Teknik</p>
                    <div className="h-16 flex items-end justify-center">
                      <div className="border-b border-black w-36 pb-0.5">
                        <span className="font-bold text-[11px] text-slate-900 block">Ir. Fadli Eka Yandra, S.T., M.T.</span>
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
