import React from 'react';
import { X, CheckCircle, FileCheck2, UserCheck, Calendar, BookOpen } from 'lucide-react';
import { JadwalKuliah } from '../types/index';

interface BapVerificationModalProps {
  jadwal: JadwalKuliah | null;
  onClose: () => void;
  onApprove: (id: string, catatan: string) => void;
}

export const BapVerificationModal: React.FC<BapVerificationModalProps> = ({
  jadwal,
  onClose,
  onApprove
}) => {
  if (!jadwal) return null;

  const [catatanKaprodi, setCatatanKaprodi] = React.useState('Materi dan presensi telah sesuai dengan silabus & Rencana Pembelajaran Semester (RPS).');
  const [kehadiranDosenOnTime, setKehadiranDosenOnTime] = React.useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApprove(jadwal.id, catatanKaprodi);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">
              Verifikasi Berita Acara Perkuliahan (BAP)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-blue-700 font-semibold">{jadwal.kodeMK}</span>
              <span className="font-mono text-slate-500">Pertemuan Ke-{jadwal.pertemuanKe || 8}</span>
            </div>
            <div className="font-bold text-sm text-slate-900">{jadwal.namaMK} ({jadwal.kelas})</div>
            <div className="text-slate-600">
              Dosen Pengampu: <strong className="text-slate-900">{jadwal.dosenNama}</strong>
            </div>
            <div className="text-slate-500 flex items-center gap-2 text-[11px]">
              <span>Hari {jadwal.hari}, {jadwal.jamMulai} - {jadwal.jamSelesai}</span>
              <span>·</span>
              <span>Ruangan: {jadwal.ruanganNama}</span>
              <span>·</span>
              <span>Peserta: {jadwal.pesertaTotal} Mahasiswa</span>
            </div>
          </div>

          <div className="p-3 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block mb-1">Materi / Topik Perkuliahan (Diisi Dosen):</span>
            <p className="font-medium text-slate-800 italic">
              "{jadwal.topikPertemuan || 'Materi RPS Pertemuan Reguler'}"
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Catatan Pengesahan Ketua Program Studi
            </label>
            <textarea
              rows={3}
              value={catatanKaprodi}
              onChange={(e) => setCatatanKaprodi(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="confirmOnTime"
              checked={kehadiranDosenOnTime}
              onChange={(e) => setKehadiranDosenOnTime(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="confirmOnTime" className="text-slate-700 text-xs">
              Konfirmasi dosen hadir tepat waktu dan memenuhi beban durasi SKS.
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Sahkan BAP Ini</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
