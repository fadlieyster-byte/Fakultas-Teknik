import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  Copy, 
  Check, 
  Layers, 
  Calculator, 
  HelpCircle,
  Building,
  GraduationCap,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  TagihanUktMahasiswa, 
  ProgramStudiInfo, 
  ItemKomponenUangKuliah 
} from '../types/index';
import { 
  KOMPONEN_UANG_KULIAH_RESMI, 
  TOTAL_UANG_KULIAH_RESMI, 
  TERBILANG_UANG_KULIAH_RESMI 
} from '../data/mockKeuanganData';

interface RincianUangKuliahModalProps {
  isOpen: boolean;
  onClose: () => void;
  uktItem?: TagihanUktMahasiswa | null;
  selectedProdi: ProgramStudiInfo;
  onOpenPrint: (mode: 'RINCIAN_UANG_KULIAH', item?: TagihanUktMahasiswa) => void;
}

export const RincianUangKuliahModal: React.FC<RincianUangKuliahModalProps> = ({
  isOpen,
  onClose,
  uktItem,
  selectedProdi,
  onOpenPrint
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [installmentMode, setInstallmentMode] = useState<'lunas' | 'cicilan_3_tahap'>('lunas');

  if (!isOpen) return null;

  const items = KOMPONEN_UANG_KULIAH_RESMI;

  const filteredItems = filterCategory === 'ALL' 
    ? items 
    : items.filter(it => it.kategori === filterCategory);

  // Copy textual breakdown for WhatsApp/Email
  const handleCopyText = () => {
    const textLines = [
      `RINCIAN UANG KULIAH FAKULTAS TEKNIK UNIVERSITAS BATANGHARI`,
      `Tahun Akademik: 2026/2027`,
      uktItem ? `Nama: ${uktItem.namaMahasiswa} | NIM: ${uktItem.nim} | Prodi: ${selectedProdi.nama}` : `Standar Tarif Resmi FT UNBARI`,
      `--------------------------------------------------`,
      ...items.map(it => `${it.no}. ${it.namaItem.padEnd(20, ' ')} : Rp ${it.nominal.toLocaleString('id-ID')}`),
      `--------------------------------------------------`,
      `TOTAL TAGIHAN : Rp ${TOTAL_UANG_KULIAH_RESMI.toLocaleString('id-ID')}`,
      `Terbilang : ${TERBILANG_UANG_KULIAH_RESMI}`,
      `--------------------------------------------------`,
      `Rekening Resmi Pembayaran:`,
      `Bank BNI Cab. Jambi No. Rek: 0234-8899-01 (a.n Yayasan Pendidikan Jambi)`,
      `Bank Mandiri No. Rek: 110-00-9988-12 (a.n Yayasan Pendidikan Jambi)`
    ].join('\n');

    navigator.clipboard.writeText(textLines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
              alt="Logo UNBARI" 
              className="w-10 h-10 object-contain bg-white/10 p-1 rounded-lg border border-white/20 shrink-0" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Rincian Resmi Komponen Uang Kuliah Mahasiswa
                </h3>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  FT UNBARI
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Ketetapan Tarif Biaya Pendidikan Yayasan Pendidikan Jambi &bull; TA 2026/2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/20 transition-all cursor-pointer"
              title="Salin Rincian ke Format Teks WhatsApp / Surat"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPrint('RINCIAN_UANG_KULIAH', uktItem || undefined)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Cetak Rincian ke Dokumen Resmi A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen A4</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          
          {/* Student Context Card (if opened for a specific student) */}
          {uktItem && (
            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                  {uktItem.nim.slice(-3)}
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Tagihan untuk Mahasiswa:</div>
                  <div className="text-sm font-black text-slate-900">{uktItem.namaMahasiswa}</div>
                  <div className="text-xs text-slate-600 font-mono">
                    NIM: {uktItem.nim} &bull; {selectedProdi.nama} &bull; Semester {uktItem.semester} ({uktItem.tahunAkademik})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Status Pembayaran</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    uktItem.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' :
                    uktItem.status === 'Cicilan' ? 'bg-blue-100 text-blue-800' :
                    uktItem.status === 'Dispensasi' ? 'bg-purple-100 text-purple-800' :
                    'bg-amber-100 text-amber-900'
                  }`}>
                    {uktItem.status}
                  </span>
                </div>
                <div className="text-right pl-3 border-l border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Terbayar / Sisa</div>
                  <div className="text-xs font-mono font-bold text-slate-900">
                    Rp {uktItem.nominalTerbayar.toLocaleString('id-ID')} / <span className="text-red-600">Rp {uktItem.sisaTunggakan.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Uang Kuliah Resmi</span>
              <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono mt-0.5">
                Rp {TOTAL_UANG_KULIAH_RESMI.toLocaleString('id-ID')},-
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">16 Komponen Biaya Baku FT UNBARI</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Komponen Pokok (SPP + SKS)</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-0.5">
                Rp 3.500.000,-
              </div>
              <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">56.4% dari total biaya pendidikan</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Pengembangan &amp; Mutu</span>
              <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono mt-0.5">
                Rp 2.000.000,-
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Pembangunan Kampus + Mutu Akademik</span>
            </div>
          </div>

          {/* Terbilang Banner */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-900 shrink-0">Terbilang :</span>
              <span className="font-bold text-slate-900 italic font-serif text-sm">
                "{TERBILANG_UANG_KULIAH_RESMI}"
              </span>
            </div>
            <span className="hidden sm:inline-flex text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-semibold">
              Ketetapan Yayasan
            </span>
          </div>

          {/* Category Filter Pills & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold mr-1">Kategori:</span>
              {[
                { id: 'ALL', label: 'Semua (16)' },
                { id: 'Pokok Perkuliahan', label: 'Pokok Perkuliahan' },
                { id: 'Pengembangan Kampus', label: 'Pengembangan' },
                { id: 'Administrasi & Registrasi', label: 'Administrasi' },
                { id: 'Kemahasiswaan', label: 'Kemahasiswaan' },
                { id: 'Lainnya', label: 'Lainnya' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterCategory === cat.id
                      ? 'bg-blue-800 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Installment Scheme Toggle */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setInstallmentMode('lunas')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  installmentMode === 'lunas' ? 'bg-blue-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                100% Penuh
              </button>
              <button
                type="button"
                onClick={() => setInstallmentMode('cicilan_3_tahap')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  installmentMode === 'cicilan_3_tahap' ? 'bg-blue-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Skema Cicilan 3x
              </button>
            </div>
          </div>

          {/* Installment Scheme Details (When Active) */}
          {installmentMode === 'cicilan_3_tahap' && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <Calculator className="w-4 h-4 text-amber-700" />
                <span>Simulasi Skema Pembayaran Cicilan 3 Tahap FT UNBARI</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Berdasarkan SK Dekan FT UNBARI, mahasiswa dapat mengajukan permohonan pembayaran bertahap dengan jadwal pelunasan sebagai berikut:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Tahap 1 (Awal Registrasi KRS)</div>
                  <div className="text-base font-black text-amber-900 font-mono mt-0.5">Rp 3.103.250,-</div>
                  <span className="text-[10px] text-amber-700">50% &bull; Syarat aktif kuliah &amp; KRS Siakad</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Tahap 2 (Sebelum UTS)</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-0.5">Rp 1.551.625,-</div>
                  <span className="text-[10px] text-slate-600">25% &bull; Syarat cetak Kartu Ujian UTS</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Tahap 3 (Sebelum UAS)</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-0.5">Rp 1.551.625,-</div>
                  <span className="text-[10px] text-slate-600">25% &bull; Syarat cetak KHS &amp; Ujian UAS</span>
                </div>
              </div>
            </div>
          )}

          {/* Main 16-Item Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3.5 w-12 text-center">No</th>
                    <th className="py-2.5 px-4">Item Komponen</th>
                    <th className="py-2.5 px-4">Kategori</th>
                    <th className="py-2.5 px-4">Keterangan / Peruntukan</th>
                    <th className="py-2.5 px-4 text-right">Nominal (Rp)</th>
                    <th className="py-2.5 px-3 text-center">Porsi (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const porsiPersen = ((item.nominal / TOTAL_UANG_KULIAH_RESMI) * 100).toFixed(1);
                    return (
                      <tr key={item.no} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2 px-3.5 text-center font-mono text-slate-500 font-semibold">
                          {item.no}
                        </td>
                        <td className="py-2 px-4 font-bold text-slate-900">
                          {item.namaItem}
                        </td>
                        <td className="py-2 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            item.kategori === 'Pokok Perkuliahan' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            item.kategori === 'Pengembangan Kampus' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                            item.kategori === 'Kemahasiswaan' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                            item.kategori === 'Administrasi & Registrasi' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.kategori}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-600 text-[11px]">
                          {item.keterangan}
                        </td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                          {item.nominal === 0 ? (
                            <span className="text-slate-400 font-normal">Rp. 0,- (Subsidi)</span>
                          ) : (
                            <span>Rp. {item.nominal.toLocaleString('id-ID')},-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-500">
                          {item.nominal === 0 ? '0%' : `${porsiPersen}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-black text-slate-900">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                      Total Biaya Uang Kuliah :
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-blue-950 font-black bg-blue-100/50">
                      Rp. {TOTAL_UANG_KULIAH_RESMI.toLocaleString('id-ID')},-
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-xs text-blue-950 font-bold bg-blue-100/50">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Account Information Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
              <Building className="w-4 h-4 text-blue-700" />
              <span>Rekening Resmi Penerimaan Pembayaran Mahasiswa FT UNBARI</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-semibold text-slate-500">Bank BNI (Virtual Account / Teller)</div>
                <div className="text-sm font-mono font-bold text-blue-900 mt-0.5">0234-8899-01</div>
                <div className="text-[11px] text-slate-700 font-medium">a.n Yayasan Pendidikan Jambi - FT UNBARI</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-semibold text-slate-500">Bank Mandiri (Cabang Gatot Subroto Jambi)</div>
                <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">110-00-9988-12</div>
                <div className="text-[11px] text-slate-700 font-medium">a.n Yayasan Pendidikan Jambi</div>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Setelah melakukan transfer pembayaran, mahasiswa menyerahkan slip setoran atau mengirimkan bukti transfer ke Bagian Tata Usaha Keuangan Dekanat FT UNBARI untuk verifikasi aktivasi KRS online dan penerbitan Surat Bebas Administrasi Keuangan (SKBK).
              </span>
            </div>
          </div>

        </div>

        {/* Footer Controls */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Ketetapan Fakultas Teknik &bull; Terakhir Diperbarui Semester Gasal TA 2026/2027
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => onOpenPrint('RINCIAN_UANG_KULIAH', uktItem || undefined)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Slip Rincian A4</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
