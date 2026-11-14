import React from 'react';
import { 
  X, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Award, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Save, 
  Printer,
  BookOpen
} from 'lucide-react';
import { Mahasiswa, StatusMahasiswa } from '../types/index';
import { StandardKopSurat } from './StandardKopSurat';
import { printDocumentElement } from '../utils/printHelper';

interface MahasiswaDetailModalProps {
  mahasiswa: Mahasiswa | null;
  onClose: () => void;
  onUpdateMahasiswa: (updated: Mahasiswa) => void;
  dosenList: { namaLengkap: string }[];
}

export const MahasiswaDetailModal: React.FC<MahasiswaDetailModalProps> = ({
  mahasiswa,
  onClose,
  onUpdateMahasiswa,
  dosenList
}) => {
  if (!mahasiswa) return null;

  const [formData, setFormData] = React.useState<Mahasiswa>({ ...mahasiswa });
  const [showSaveAlert, setShowSaveAlert] = React.useState(false);
  const [activeSubTab, setActiveSubTab] = React.useState<'profil' | 'skripsi' | 'rekomendasi'>('profil');

  React.useEffect(() => {
    setFormData({ ...mahasiswa });
  }, [mahasiswa]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMahasiswa(formData);
    setShowSaveAlert(true);
    setTimeout(() => setShowSaveAlert(false), 2500);
  };

  const printRekamRef = React.useRef<HTMLDivElement>(null);

  const printRekamAkademik = () => {
    if (printRekamRef.current) {
      printDocumentElement(printRekamRef.current, {
        documentTitle: `Rekam Akademik - ${formData.nama} (${formData.nim})`
      });
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{formData.nama}</h2>
                <span className="font-mono text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  NIM: {formData.nim}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {formData.programStudi} · Angkatan {formData.angkatan} · Semester {formData.semester}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Inside Modal */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-white text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSubTab('profil')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeSubTab === 'profil'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Ringkasan Akademik
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('skripsi')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeSubTab === 'skripsi'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Progress Tugas Akhir / Skripsi
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('rekomendasi')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeSubTab === 'rekomendasi'
                ? 'border-blue-600 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Tindakan & Catatan Kaprodi
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {showSaveAlert && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Perubahan data mahasiswa dan catatan Kaprodi berhasil disimpan.</span>
            </div>
          )}

          {activeSubTab === 'profil' && (
            <div className="space-y-5">
              {/* Masa Studi Warning Banner */}
              {formData.semester >= 8 && formData.status !== 'Lulus' && (
                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  formData.semester >= 12
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${formData.semester >= 12 ? 'text-rose-600' : 'text-amber-600'}`} />
                  <div>
                    <h4 className="font-bold text-xs">
                      {formData.semester >= 12 ? 'PERINGATAN KRITIS: Mendekati Batas Maksimal Masa Studi (DO Guard)' : 'Perhatian Masa Studi Mahasiswa (Semester 8+)'}
                    </h4>
                    <p className="text-[11px] mt-0.5 leading-relaxed">
                      Mahasiswa saat ini berada di Semester {formData.semester} (Angkatan {formData.angkatan}). Sesuai ketentuan akademik Fakultas Teknik UNBARI, mahasiswa disarankan segera menyelesaikan seluruh sisa SKS ({formData.sksLulus}/{formData.sksTargetLulus || 144}) dan konsultasi intensif bersama Dosen PA ({formData.dosenPA}).
                    </p>
                  </div>
                </div>
              )}

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500">IPK Kumulatif</span>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${formData.ipk < 2.50 ? 'text-amber-700' : 'text-slate-900'}`}>
                    {formData.ipk.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400">Skala 4.00</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500">SKS Lulus</span>
                  <div className="text-xl font-bold font-mono mt-0.5 text-slate-900">
                    {formData.sksLulus} <span className="text-xs font-normal text-slate-500">/ {formData.sksTargetLulus || (formData.jenjang === 'D3' ? 110 : 144)} SKS</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Syarat Lulus {formData.jenjang || 'S1'}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500">Kehadiran Kuliah</span>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${formData.kehadiranPersen < 75 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {formData.kehadiranPersen}%
                  </div>
                  <span className="text-[10px] text-slate-400">Batas Minimal: 75%</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500">Status Akademik</span>
                  <div className="mt-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      formData.status === 'Berisiko'
                        ? 'bg-amber-100 text-amber-800'
                        : formData.status === 'Tugas Akhir'
                          ? 'bg-blue-100 text-blue-800'
                          : formData.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                    }`}>
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Profile Grid */}
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="text-slate-500">Dosen Pembimbing Akademik (PA)</span>
                  <span className="col-span-2 font-medium text-slate-900">{formData.dosenPA}</span>
                </div>
                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="text-slate-500">Bidang Minat / Konsentrasi</span>
                  <span className="col-span-2 font-medium text-slate-900">{formData.konsentrasi}</span>
                </div>
                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="text-slate-500">Email Kampus</span>
                  <span className="col-span-2 font-mono text-slate-800">{formData.email}</span>
                </div>
                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="text-slate-500">Kontak WhatsApp / No. HP</span>
                  <span className="col-span-2 font-mono text-slate-800">{formData.nomorHp}</span>
                </div>
                {formData.jenisKelamin && (
                  <div className="p-3 grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Jenis Kelamin</span>
                    <span className="col-span-2 font-medium text-slate-900">
                      {formData.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                    </span>
                  </div>
                )}
                {formData.jenisKelas && (
                  <div className="p-3 grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Program / Kelas</span>
                    <span className="col-span-2 font-medium text-slate-900">
                      Kelas {formData.jenisKelas} ({formData.tahunAkademik || '2026/2027'})
                    </span>
                  </div>
                )}
                {formData.asalSekolah && (
                  <div className="p-3 grid grid-cols-3 gap-2">
                    <span className="text-slate-500">Asal Sekolah</span>
                    <span className="col-span-2 font-medium text-blue-800">{formData.asalSekolah}</span>
                  </div>
                )}
                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="text-slate-500">SKS Diambil Semester Ini</span>
                  <span className="col-span-2 font-mono font-medium text-slate-900">{formData.sksSemesterIni} SKS</span>
                </div>
              </div>

              {formData.peringatanSp > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      Surat Peringatan Akademik Aktif: SP-{formData.peringatanSp}
                    </h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Mahasiswa ini memiliki peringatan akademik resmi dari Program Studi terkait batas masa studi atau IPK kumulatif. Diperlukan konseling berkala bersama Dosen PA.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'skripsi' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-medium text-slate-500">Judul Tugas Akhir / Skripsi Terdaftar</span>
                <p className="text-sm font-semibold text-slate-900 mt-1 leading-relaxed">
                  {formData.judulTA || 'Belum mengajukan judul skripsi atau belum memasuki tahap tugas akhir.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500 block mb-1">Dosen Pembimbing Skripsi</span>
                  <select
                    value={formData.dosenPembimbingTA || ''}
                    onChange={(e) => setFormData({ ...formData, dosenPembimbingTA: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-md p-1.5 bg-white"
                  >
                    <option value="">-- Belum Ditentukan --</option>
                    {dosenList.map((d, idx) => (
                      <option key={idx} value={d.namaLengkap}>{d.namaLengkap}</option>
                    ))}
                  </select>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg">
                  <span className="text-[11px] text-slate-500 block mb-1">Tahap Milestone Progres</span>
                  <select
                    value={formData.progressTA || 'Belum Mengambil'}
                    onChange={(e) => setFormData({ ...formData, progressTA: e.target.value as any })}
                    className="w-full text-xs border border-slate-300 rounded-md p-1.5 bg-white"
                  >
                    <option value="Belum Mengambil">Belum Mengambil</option>
                    <option value="Pengajuan Proposal">Pengajuan Proposal</option>
                    <option value="Bimbingan Bab 1-3">Bimbingan Bab 1-3</option>
                    <option value="Seminar Hasil">Seminar Hasil</option>
                    <option value="Sidang Meja Hijau">Sidang Meja Hijau / Komprehensif</option>
                    <option value="Lulus Yudisium">Lulus Yudisium</option>
                  </select>
                </div>
              </div>

              {/* Visual Milestone Track */}
              <div className="p-4 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-700 block mb-3">Jalur Kelulusan Tugas Akhir</span>
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  {['Proposal', 'Bimbingan', 'Semhas', 'Sidang', 'Yudisium'].map((step, idx) => {
                    const currentIdx = formData.progressTA === 'Pengajuan Proposal' ? 0 
                      : formData.progressTA === 'Bimbingan Bab 1-3' ? 1 
                      : formData.progressTA === 'Seminar Hasil' ? 2 
                      : formData.progressTA === 'Sidang Meja Hijau' ? 3 
                      : formData.progressTA === 'Lulus Yudisium' ? 4 : -1;
                    const isDone = currentIdx >= idx;
                    return (
                      <div key={idx} className="flex-1 text-center">
                        <div className={`h-1.5 rounded-full mb-1.5 ${isDone ? 'bg-blue-600' : 'bg-slate-200'}`} />
                        <span className={`block truncate ${isDone ? 'font-semibold text-blue-700' : 'text-slate-400'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'rekomendasi' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Status Mahasiswa</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusMahasiswa })}
                    className="w-full text-xs border border-slate-300 rounded-md p-2 bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Berisiko">Berisiko (Evaluasi Studi)</option>
                    <option value="Tugas Akhir">Tugas Akhir</option>
                    <option value="Cuti">Cuti Akademik</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                    <option value="Pindah">Pindah Program Studi / Kampus</option>
                    <option value="Lulus">Lulus (Alumni)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tingkat Peringatan Akademik (SP)</label>
                  <select
                    value={formData.peringatanSp}
                    onChange={(e) => setFormData({ ...formData, peringatanSp: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded-md p-2 bg-white"
                  >
                    <option value={0}>Tidak Ada (Aman)</option>
                    <option value={1}>SP 1 (Peringatan Ringan / Kehadiran)</option>
                    <option value={2}>SP 2 (Peringatan Kritis / Masa Studi)</option>
                    <option value={3}>SP 3 (Peringatan Terakhir / Ancaman DO)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Catatan Konseling / Instruksi Kaprodi ke Dosen PA
                </label>
                <textarea
                  rows={4}
                  value={formData.catatanAkademik || ''}
                  onChange={(e) => setFormData({ ...formData, catatanAkademik: e.target.value })}
                  placeholder="Tuliskan arahan Kaprodi untuk mahasiswa ini, misal: Target seminar proposal bulan depan, pembatasan cuti, atau rekomendasi matakuliah perbaikan."
                  className="w-full text-xs border border-slate-300 rounded-md p-2.5 bg-white text-slate-800 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-slate-700">
                <span className="font-semibold block text-blue-900 mb-1">Wewenang Ketua Program Studi</span>
                <p className="text-[11px] leading-relaxed">
                  Catatan ini akan tersinkronisasi ke laporan evaluasi semester dan dapat dirujuk saat rapat yudisium kelulusan mahasiswa.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={printRekamAkademik}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 bg-white rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rekam Studi</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>

        {/* Dedicated Hidden Printable A4 Sheet for Rekam Akademik Mahasiswa */}
        <div className="hidden">
          <div
            ref={printRekamRef}
            className="printable-sheet bg-white p-8 text-slate-900 font-serif text-xs leading-relaxed"
          >
            <StandardKopSurat
              prodiName={`PROGRAM STUDI ${formData.programStudi ? formData.programStudi.toUpperCase() : 'FAKULTAS TEKNIK'}`}
              showQrCode={true}
              qrCodeUrl={`https://universitasbatanghari.ac.id/verifikasi/mahasiswa/${formData.nim}`}
              qrBadgeText="STUDI-VERIF"
            />

            <div className="text-center my-4 font-sans">
              <h2 className="text-sm font-bold uppercase tracking-wider underline text-slate-900">
                LEMBAR REKAM DATA AKADEMIK MAHASISWA
              </h2>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                FAKULTAS TEKNIK UNIVERSITAS BATANGHARI · TAHUN AKADEMIK 2026/2027
              </p>
            </div>

            {/* Identitas Mahasiswa */}
            <div className="border border-slate-300 rounded p-3 mb-4 font-sans text-[11px] bg-slate-50/50 space-y-1.5">
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-3 text-slate-600 font-medium">Nama Mahasiswa</span>
                <span className="col-span-9 font-bold text-slate-900">: {formData.nama}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-3 text-slate-600 font-medium">Nomor Induk Mahasiswa (NIM)</span>
                <span className="col-span-9 font-mono font-bold text-slate-900">: {formData.nim}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-3 text-slate-600 font-medium">Program Studi / Jenjang</span>
                <span className="col-span-9 text-slate-900">: {formData.programStudi} ({formData.jenjang})</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-3 text-slate-600 font-medium">Angkatan / Semester</span>
                <span className="col-span-9 text-slate-900">: {formData.angkatan} / Semester {formData.semester}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-3 text-slate-600 font-medium">Dosen Pembimbing Akademik (PA)</span>
                <span className="col-span-9 font-semibold text-slate-900">: {formData.dosenPA}</span>
              </div>
            </div>

            {/* Capaian Akademik Table */}
            <div className="mb-4 font-sans">
              <h4 className="text-xs font-bold uppercase text-slate-900 mb-1.5">I. Ringkasan Capaian Akademik</h4>
              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold text-center">
                    <th className="border border-slate-300 p-2">Indeks Prestasi Kumulatif (IPK)</th>
                    <th className="border border-slate-300 p-2">SKS Lulus</th>
                    <th className="border border-slate-300 p-2">SKS Semester Ini</th>
                    <th className="border border-slate-300 p-2">Tingkat Kehadiran</th>
                    <th className="border border-slate-300 p-2">Status Mahasiswa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center font-mono">
                    <td className="border border-slate-300 p-2 font-bold text-blue-900 text-sm">{formData.ipk.toFixed(2)}</td>
                    <td className="border border-slate-300 p-2">{formData.sksLulus} / {formData.sksTargetLulus} SKS</td>
                    <td className="border border-slate-300 p-2">{formData.sksSemesterIni} SKS</td>
                    <td className="border border-slate-300 p-2">{formData.kehadiranPersen}%</td>
                    <td className="border border-slate-300 p-2 font-sans font-bold">
                      <span className={formData.status === 'Aktif' ? 'text-emerald-700' : 'text-amber-700'}>
                        {formData.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Progress Skripsi */}
            <div className="mb-4 font-sans">
              <h4 className="text-xs font-bold uppercase text-slate-900 mb-1.5">II. Status Tugas Akhir / Skripsi</h4>
              <div className="border border-slate-300 rounded p-3 text-[11px] space-y-1">
                <p><b>Judul TA:</b> {formData.judulTA || 'Belum mengajukan judul skripsi/TA'}</p>
                <p><b>Dosen Pembimbing:</b> {formData.dosenPembimbingTA || '-'}</p>
                <p><b>Tahapan Progres:</b> {formData.progressTA || 'Belum Mengambil'}</p>
              </div>
            </div>

            {/* Catatan Kaprodi */}
            <div className="mb-6 font-sans">
              <h4 className="text-xs font-bold uppercase text-slate-900 mb-1.5">III. Catatan Evaluasi & Rekomendasi Kaprodi</h4>
              <div className="border border-slate-300 rounded p-3 text-[11px] min-h-[50px] bg-slate-50/30">
                <p>{formData.catatanAkademik || 'Mahasiswa berstatus akademik baik dan direkomendasikan melanjutkan beban studi rencana.'}</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4 font-sans text-[11px] pt-4">
              <div className="text-center">
                <p className="text-slate-600">Dosen Pembimbing Akademik (PA)</p>
                <div className="h-16 flex items-end justify-center">
                  <div className="border-b border-slate-800 w-44 pb-1">
                    <p className="font-bold text-slate-900">{formData.dosenPA}</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-600">Kota Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-slate-600">Ketua Program Studi,</p>
                <div className="h-14 flex items-end justify-center">
                  <div className="border-b border-slate-800 w-44 pb-1">
                    <p className="font-bold text-slate-900">Dr. Ir. H. Fakhrurrazi, M.T.</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500">NIP: 197804122005011002</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
