import React from 'react';
import { X, AlertTriangle, Printer, Phone, Calendar, UserCheck, ShieldAlert, CheckCircle2, Mail, ClipboardCheck } from 'lucide-react';
import { MahasiswaKritisWarning, ProgramStudiInfo } from '../types/index';
import { INITIAL_MAHASISWA_KRITIS } from '../data/mockAkreditasiData';
import { printDirectToDefaultPrinter } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';
import { getWorkspaceSession, sendEmailViaGmailApi } from '../utils/googleWorkspaceService';
import { logKaprodiActivity } from '../utils/activityLogHelper';

interface MahasiswaKritisAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProdi: ProgramStudiInfo;
  onShowToast?: (msg: string) => void;
}

export const MahasiswaKritisAuditModal: React.FC<MahasiswaKritisAuditModalProps> = ({
  isOpen,
  onClose,
  selectedProdi,
  onShowToast
}) => {
  const [selectedStudent, setSelectedStudent] = React.useState<MahasiswaKritisWarning>(INITIAL_MAHASISWA_KRITIS[0]);
  const [isPrintMode, setIsPrintMode] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = React.useState(false);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [lastMonthlyEmailSent, setLastMonthlyEmailSent] = React.useState<string | null>(null);

  if (!isOpen) return null;

  // Filter students based on selected Prodi or include all
  const filteredStudents = INITIAL_MAHASISWA_KRITIS.filter(
    s => s.prodiId === selectedProdi.id
  ).length > 0
    ? INITIAL_MAHASISWA_KRITIS.filter(s => s.prodiId === selectedProdi.id)
    : INITIAL_MAHASISWA_KRITIS;

  const currentStudent = selectedStudent || filteredStudents[0];

  const handlePrintSuratPeringatan = () => {
    setIsPrinting(true);
    printDirectToDefaultPrinter(
      'print-surat-peringatan-ews-document',
      `Surat_Peringatan_Studi_${currentStudent.nim}_${currentStudent.nama.replace(/\s+/g, '_')}`,
      false
    );
    setTimeout(() => setIsPrinting(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-red-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-950">
                Early Warning System (EWS) · Audit Mahasiswa Kritis DO
              </h3>
              <p className="text-xs text-red-700">
                Pemantauan masa studi kritis, batas SKS, dan penerbitan Surat Peringatan Resmi Dekanat
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrintMode(!isPrintMode)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {isPrintMode ? 'Kembali ke Audit' : 'Format Surat Resmi (A4)'}
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

        {/* Modal Body */}
        {!isPrintMode ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Context Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">
                  Regulasi Batas Waktu Studi Mahasiswa (Permendikbud &amp; Statuta UNBARI):
                </span>
                <p className="leading-relaxed">
                  Batas maksimum masa studi untuk jenjang Sarjana (S1) adalah 14 semester (7 tahun) dan Diploma Tiga (D3) adalah 10 semester (5 tahun). Mahasiswa yang telah menempuh semester &ge; 10 dengan sisa SKS &gt; 20 wajib mendapatkan bimbingan intensif dan evaluasi tertulis dari Wakil Dekan I Bidang Akademik.
                </p>
              </div>
            </div>

            {/* Students Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Daftar Mahasiswa Dalam Radar Peringatan Dini ({filteredStudents.length} Mahasiswa)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-3">NIM &amp; Nama</th>
                      <th className="p-3">Prodi</th>
                      <th className="p-3 text-center">Semester</th>
                      <th className="p-3 text-center">IPK</th>
                      <th className="p-3 text-center">SKS Lulus / Sisa</th>
                      <th className="p-3">Status Peringatan</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((mhs) => {
                      const isSelected = currentStudent.id === mhs.id;
                      return (
                        <tr 
                          key={mhs.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-red-50/50' : ''
                          }`}
                        >
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{mhs.nama}</span>
                            <span className="font-mono text-[11px] text-slate-500">{mhs.nim}</span>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">{mhs.programStudi}</td>
                          <td className="p-3 text-center font-mono font-bold text-red-700">
                            Sem {mhs.semester}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-800">
                            {mhs.ipk.toFixed(2)}
                          </td>
                          <td className="p-3 text-center font-mono">
                            <span className="text-emerald-700 font-bold">{mhs.sksLulus}</span>
                            <span className="text-slate-400"> / </span>
                            <span className="text-red-600 font-bold">-{mhs.sksTertinggal}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 block text-center">
                              {mhs.suratSpTerbit}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudent(mhs);
                                setIsPrintMode(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                            >
                              Buat Surat SP
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Student Detail Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-red-700 uppercase">
                    Kasus Studi Terpilih:
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {currentStudent.nama} ({currentStudent.nim}) · {currentStudent.programStudi}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Dosen Pembimbing Akademik: <span className="font-semibold text-slate-900">{currentStudent.dosenPA}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrintMode(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Surat Peringatan Resmi</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Indikator Masalah Kritis:
                  </span>
                  <p className="text-slate-800 font-medium">
                    {currentStudent.kategoriMasalah}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Rencana Intervensi Akademik:
                  </span>
                  <p className="text-slate-800 leading-relaxed">
                    {currentStudent.rencanaAksi}
                  </p>
                </div>
              </div>

              {/* Automated Academic Recovery Plan & Monthly Automated EWS Email Notification */}
              <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                    <h5 className="text-xs font-bold text-emerald-950">
                      Automated Academic Recovery Plan ({currentStudent.nama})
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Jadwal EWS Email Bulanan: Tgl 5 Tiap Bulan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#ecfdf5] border border-emerald-100">
                    <span className="font-bold text-emerald-900 block">1. Konsultasi Wajib Dosen PA</span>
                    <p className="text-slate-700 mt-0.5">
                      Tatap muka wajib dengan <strong>{currentStudent.dosenPA}</strong> maksimal pekan ini untuk penandatanganan Pakta Percepatan SKS.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#ecfdf5] border border-emerald-100">
                    <span className="font-bold text-emerald-900 block">2. Target SKS &amp; Remedial</span>
                    <p className="text-slate-700 mt-0.5">
                      Wajib menuntaskan <strong>{Math.min(24, currentStudent.sksTertinggal)} SKS</strong> tersisa termasuk maksimal 9 SKS pada Semester Pendek (Antara).
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#ecfdf5] border border-emerald-100">
                    <span className="font-bold text-emerald-900 block">3. Evaluasi Progres Mingguan</span>
                    <p className="text-slate-700 mt-0.5">
                      Logbook progres Tugas Akhir &amp; kehadiran kuliah (&ge;85%) dilaporkan ke Kaprodi setiap Jumat.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-600">
                    {lastMonthlyEmailSent
                      ? `Notifikasi EWS bulanan terakhir dikirim pada ${lastMonthlyEmailSent}.`
                      : `Kirim ringkasan EWS bulanan & Recovery Plan ke Dosen PA (${currentStudent.dosenPA}) dan mahasiswa terkait.`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEmailConfirm(true)}
                    disabled={isSendingEmail}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#065f46] hover:bg-emerald-900 text-white font-bold rounded-lg transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isSendingEmail ? 'Mengirim Email EWS...' : 'Kirim Ringkasan EWS Bulanan (Gmail)'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Printable Document View (A4 Official Format) */
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex flex-col items-center">
            
            <div className="w-full max-w-[210mm] flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setIsPrintMode(false)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                ← Kembali ke Daftar Audit
              </button>
              <button
                type="button"
                onClick={handlePrintSuratPeringatan}
                disabled={isPrinting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>{isPrinting ? 'Mempersiapkan...' : 'Cetak Surat Peringatan (A4)'}</span>
              </button>
            </div>

            <div
              id="print-surat-peringatan-ews-document"
              className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-10 shadow-md border border-slate-300 text-xs font-serif leading-relaxed"
            >
              {/* Kop Surat Resmi */}
              <div className="border-b-4 border-double border-slate-900 pb-3 mb-6">
                <div className="flex items-center justify-between gap-4">
                  <img
                    src="/assets/aistudio/logo_unbari_8fe2adcb.png"
                    alt="Logo UNBARI"
                    className="w-20 h-20 object-contain shrink-0"
                  />
                  <div className="text-center flex-1 font-serif">
                    <h4 className="text-xs font-bold tracking-wider uppercase text-slate-900">YAYASAN PENDIDIKAN JAMBI</h4>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">UNIVERSITAS BATANGHARI</h2>
                    <h3 className="text-sm font-extrabold text-blue-900 uppercase">FAKULTAS TEKNIK</h3>
                    <p className="text-[10px] text-slate-700 mt-1 leading-snug">
                      Jl. Slamet Riyadi No. 01 Broni - Kota Jambi 36122, Telp: (0741) 60103
                    </p>
                    <p className="text-[10px] text-slate-700 font-medium leading-snug">
                      Laman Resmi: <span className="text-blue-900 underline">https://universitasbatanghari.ac.id</span> · Surel: <span className="font-mono">ftunbari.tpa@gmail.com</span>
                    </p>
                  </div>
                  <div className="w-20 shrink-0 flex flex-col items-center justify-center text-center">
                    <QrCodeSvg
                      value={`https://unbari.ac.id/ft/verifikasi?kode=FT-UNBARI/2026/EWS-SP/003`}
                      size={60}
                      title="Validasi Surat Peringatan"
                    />
                    <span className="text-[7px] font-mono text-slate-500 mt-1">EWS-VERIF</span>
                  </div>
                </div>
              </div>

              {/* Letter Header */}
              <div className="font-sans text-[11px] mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <table className="text-[11px]">
                      <tbody>
                        <tr>
                          <td className="pr-2 font-semibold">Nomor</td>
                          <td className="pr-2">:</td>
                          <td className="font-mono">003/EWS-FT/UNBARI/X/2026</td>
                        </tr>
                        <tr>
                          <td className="pr-2 font-semibold">Lampiran</td>
                          <td className="pr-2">:</td>
                          <td>1 (Satu) Lembar Rekap Transkrip</td>
                        </tr>
                        <tr>
                          <td className="pr-2 font-semibold">Perihal</td>
                          <td className="pr-2">:</td>
                          <td className="font-bold text-red-900">
                            SURAT PERINGATAN EVALUASI MASA STUDI ({currentStudent.suratSpTerbit})
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-right">
                    <p>Jambi, 25 Oktober 2026</p>
                    <p className="mt-2 text-slate-700">Kepada Yth:</p>
                    <p className="font-bold text-slate-900">Sdr/i. {currentStudent.nama}</p>
                    <p className="font-mono text-slate-700">NIM: {currentStudent.nim}</p>
                    <p className="text-slate-700">dan Orang Tua / Wali Mahasiswa</p>
                    <p className="text-slate-700">di Tempat</p>
                  </div>
                </div>
              </div>

              {/* Letter Content */}
              <div className="space-y-4 font-serif text-justify text-xs leading-relaxed text-slate-900">
                <p>Dengan hormat,</p>
                <p>
                  Sehubungan dengan hasil evaluasi akademik berkala Semester Ganjil Tahun Akademik 2025/2026 oleh Tim Gugus Penjaminan Mutu dan Pengelola Program Studi di lingkungan Fakultas Teknik Universitas Batanghari, dengan ini kami sampaikan data perkembangan akademik Saudara sebagai berikut:
                </p>

                {/* Academic Data Table */}
                <div className="font-sans text-[11px] border border-slate-300 p-3 bg-slate-50 rounded my-3">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="py-1 w-44 font-semibold text-slate-600">Nama Mahasiswa</td>
                        <td className="py-1 w-4">:</td>
                        <td className="py-1 font-bold text-slate-900">{currentStudent.nama}</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-slate-600">Nomor Induk Mahasiswa (NIM)</td>
                        <td className="py-1">:</td>
                        <td className="py-1 font-mono font-bold">{currentStudent.nim}</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-slate-600">Program Studi / Jenjang</td>
                        <td className="py-1">:</td>
                        <td className="py-1">{currentStudent.programStudi}</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-slate-600">Semester Aktif Ditempuh</td>
                        <td className="py-1">:</td>
                        <td className="py-1 font-bold text-red-800 font-mono">Semester {currentStudent.semester} (Kritis Masa Studi)</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-slate-600">Indeks Prestasi Kumulatif (IPK)</td>
                        <td className="py-1">:</td>
                        <td className="py-1 font-mono font-bold">{currentStudent.ipk.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-slate-600">Kredit SKS Lulus / Sisa Kurang</td>
                        <td className="py-1">:</td>
                        <td className="py-1 font-mono">{currentStudent.sksLulus} SKS Lulus (Kurang {currentStudent.sksTertinggal} SKS untuk Lulus)</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold text-slate-600">Dosen Pembimbing Akademik</td>
                        <td className="py-1">:</td>
                        <td className="py-1 font-bold">{currentStudent.dosenPA}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  Berdasarkan Statuta dan Pedoman Akademik Universitas Batanghari Jambi, masa studi Saudara telah mendekati batas akhir maksimal studi. Apabila Saudara tidak menyelesaikan kewajiban akademik (termasuk Seminar Proposal, Bimbingan Skripsi, dan Sidang Meja Hijau), maka sistem PD-Dikti secara otomatis akan menetapkan status <strong>Putus Studi / Drop Out (DO)</strong>.
                </p>

                <p>
                  Oleh karena itu, Saudara <strong>DIWAJIBKAN</strong> hadir bersama Orang Tua/Wali pada:
                </p>

                <div className="font-sans text-[11px] pl-6 border-l-2 border-red-700 py-1 my-2">
                  <p><strong>Hari / Tanggal</strong> : Senin, 03 November 2026</p>
                  <p><strong>Waktu</strong> : 10:00 WIB s.d Selesai</p>
                  <p><strong>Tempat</strong> : Ruang Wakil Dekan I (Gedung Fakultas Teknik UNBARI)</p>
                  <p><strong>Agenda</strong> : Konseling Percepatan Kelulusan &amp; Penandatanganan Pakta Integritas Studi</p>
                </div>

                <p>
                  Demikian surat peringatan ini kami sampaikan untuk menjadi perhatian serius Saudara. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
                </p>
              </div>

              {/* Signatures */}
              <div className="font-sans text-[11px] pt-8 mt-6 border-t border-slate-300">
                <div className="flex justify-between items-start">
                  
                  <div className="max-w-[240px]">
                    <p className="text-slate-500 text-[10px]">Tembusan disampaikan kepada Yth:</p>
                    <ol className="text-[9px] text-slate-600 list-decimal pl-4 mt-1 space-y-0.5">
                      <li>Rektor Universitas Batanghari Jambi;</li>
                      <li>Dekan Fakultas Teknik (Fadli Eka Yandra, ST., MT);</li>
                      <li>Ketua Program Studi {currentStudent.programStudi};</li>
                      <li>Dosen Pembimbing Akademik;</li>
                      <li>Arsip Tata Usaha / BAAK.</li>
                    </ol>
                  </div>

                  <div className="text-center min-w-[220px]">
                    <p className="text-slate-600">Jambi, 25 Oktober 2026</p>
                    <p className="font-bold text-slate-900">Wakil Dekan I (Bidang Akademik),</p>
                    <div className="h-20 flex items-end justify-center">
                      <div className="border-b border-black w-44 pb-0.5">
                        <span className="font-bold text-[11px] text-slate-900 block">Hadrah, ST., MT</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-mono">NIDN: 1022067301</p>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Sistem Informasi Early Warning Dekanat FT UNBARI</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

        {/* Confirmation Dialog before sending Monthly EWS Email via Gmail API */}
        {showEmailConfirm && (
          <div className="fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-2xl max-w-md w-full p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Konfirmasi Pengiriman Email EWS Bulanan</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Sistem akan mengirimkan rekap {filteredStudents.length} mahasiswa berisiko &amp; Automated Academic Recovery Plan Prodi {selectedProdi.nama} ke Dosen PA terkait dan mahasiswa melalui Gmail API / aplikasi email.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmailConfirm(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowEmailConfirm(false);
                    setIsSendingEmail(true);
                    const subject = `[SiKaprodi EWS Bulanan] Peringatan Masa Studi & Recovery Plan - ${selectedProdi.nama}`;
                    const bodyText = filteredStudents
                      .map(
                        (s, idx) =>
                          `${idx + 1}. ${s.nama} (${s.nim}) | Sem ${s.semester} | IPK ${s.ipk.toFixed(2)} | Sisa ${s.sksTertinggal} SKS | PA: ${s.dosenPA} | Rencana: ${s.rencanaAksi}`
                      )
                      .join('\n');
                    const session = getWorkspaceSession();
                    try {
                      if (session?.accessToken) {
                        await sendEmailViaGmailApi(session.accessToken, {
                          to: ['ftunbari.tpa@gmail.com'],
                          subject,
                          bodyText: `Ringkasan EWS Bulanan Prodi ${selectedProdi.nama}:\n\n${bodyText}`
                        });
                        onShowToast?.(`Ringkasan EWS bulanan berhasil dikirim via Gmail API (${session.userEmail}).`);
                      } else {
                        const mailtoUrl = `mailto:ftunbari.tpa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
                        window.location.href = mailtoUrl;
                        onShowToast?.('Draft Ringkasan EWS bulanan dibuka di aplikasi email (hubungkan OAuth Workspace untuk kirim langsung via Gmail API).');
                      }
                      const sentAt = new Date().toLocaleString('id-ID');
                      setLastMonthlyEmailSent(sentAt);
                      logKaprodiActivity({
                        actor: selectedProdi.kaprodi,
                        role: 'Kaprodi',
                        prodiId: selectedProdi.id,
                        category: 'SYNC_WORKSPACE',
                        actionTitle: 'Pengiriman Ringkasan EWS Bulanan ke Dosen PA',
                        detail: `Mengirim notifikasi EWS & Automated Recovery Plan untuk ${filteredStudents.length} mahasiswa kritis.`,
                        severity: 'warning'
                      });
                    } catch (err: any) {
                      onShowToast?.(err?.message || 'Gagal mengirim email EWS melalui Gmail API.');
                    } finally {
                      setIsSendingEmail(false);
                    }
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#065f46] hover:bg-emerald-900 rounded-lg shadow-xs"
                >
                  Kirim Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
