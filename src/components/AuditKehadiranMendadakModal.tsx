import React, { useState, useMemo } from 'react';
import { 
  X, 
  ClipboardCheck, 
  AlertTriangle, 
  Printer, 
  CheckCircle2, 
  UserX, 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  Search, 
  ShieldAlert, 
  FileText, 
  History, 
  Sparkles,
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';
import { 
  AuditSidakKehadiran, 
  DetailPresensiSidakMhs, 
  StatusPresensiSidak, 
  JadwalKuliah, 
  Mahasiswa, 
  PeringatanAkademik, 
  ProgramStudiInfo 
} from '../types/index';
import { printDirectToDefaultPrinter } from '../utils/printHelper';
import { QrCodeSvg } from '../utils/qrHelper';

interface AuditKehadiranMendadakModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProdi: ProgramStudiInfo;
  jadwalList: JadwalKuliah[];
  mahasiswaList: Mahasiswa[];
  auditSidakList: AuditSidakKehadiran[];
  preselectedJadwalId?: string | null;
  currentDay: string;
  currentTimeStr: string;
  onSaveAuditSidak: (
    auditData: AuditSidakKehadiran,
    updatedStudents: Mahasiswa[],
    newWarnings: PeringatanAkademik[]
  ) => void;
}

export const AuditKehadiranMendadakModal: React.FC<AuditKehadiranMendadakModalProps> = ({
  isOpen,
  onClose,
  selectedProdi,
  jadwalList,
  mahasiswaList,
  auditSidakList,
  preselectedJadwalId,
  currentDay,
  currentTimeStr,
  onSaveAuditSidak
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'print'>('form');
  const [selectedJadwalId, setSelectedJadwalId] = useState<string>('');
  const [auditorNama, setAuditorNama] = useState<string>(selectedProdi.kaprodi);
  const [auditorJabatan, setAuditorJabatan] = useState<string>(`Ketua Program Studi ${selectedProdi.nama}`);
  const [statusKesesuaianDosen, setStatusKesesuaianDosen] = useState<'Tepat Waktu' | 'Terlambat (<15 mnt)' | 'Digantikan Asisten' | 'Dosen Tidak Hadir'>('Tepat Waktu');
  const [catatanAudit, setCatatanAudit] = useState<string>('Perkuliahan berlangsung kondusif. Evaluasi presensi fisik mahasiswa dilaksanakan langsung di ruang kelas.');
  const [rekomendasiTindakLanjut, setRekomendasiTindakLanjut] = useState<string>('Mahasiswa dengan akumulasi presensi < 75% diberikan surat peringatan dan pemanggilan pembinaan oleh Dosen PA.');
  const [searchStudentTerm, setSearchStudentTerm] = useState<string>('');
  
  // Student roll call state map: [nim] -> DetailPresensiSidakMhs
  const [rollCallState, setRollCallState] = useState<Record<string, {
    status: StatusPresensiSidak;
    catatan: string;
  }>>({});

  // Active audit record being viewed/printed
  const [selectedAuditForPrint, setSelectedAuditForPrint] = useState<AuditSidakKehadiran | null>(null);

  // Filter available classes by selected prodi
  const availableJadwal = useMemo(() => {
    const list = jadwalList.filter(j => j.prodiId === selectedProdi.id);
    return list.length > 0 ? list : jadwalList;
  }, [jadwalList, selectedProdi.id]);

  // Set initial selected jadwal
  React.useEffect(() => {
    if (preselectedJadwalId && availableJadwal.some(j => j.id === preselectedJadwalId)) {
      setSelectedJadwalId(preselectedJadwalId);
    } else if (availableJadwal.length > 0 && !selectedJadwalId) {
      setSelectedJadwalId(availableJadwal[0].id);
    }
  }, [preselectedJadwalId, availableJadwal, selectedJadwalId]);

  // Keep auditor updated when prodi changes
  React.useEffect(() => {
    setAuditorNama(selectedProdi.kaprodi);
    setAuditorJabatan(`Ketua Program Studi ${selectedProdi.nama}`);
  }, [selectedProdi]);

  const selectedJadwal = useMemo(() => {
    return availableJadwal.find(j => j.id === selectedJadwalId) || availableJadwal[0] || null;
  }, [availableJadwal, selectedJadwalId]);

  // Get relevant students for this class/prodi
  const classStudents = useMemo(() => {
    if (!selectedJadwal) return [];
    // Prioritize students in the same prodi and match active statuses
    const filtered = mahasiswaList.filter(m => 
      m.prodiId === selectedJadwal.prodiId && 
      (m.status === 'Aktif' || m.status === 'Berisiko' || m.status === 'Tugas Akhir')
    );
    // Take a realistic cohort of 14 - 24 students
    const count = Math.min(Math.max(selectedJadwal.pesertaTotal || 16, 12), 24);
    return filtered.slice(0, count);
  }, [mahasiswaList, selectedJadwal]);

  // Reset or initialize roll-call state when class changes
  React.useEffect(() => {
    if (!selectedJadwal || classStudents.length === 0) return;
    const initialMap: Record<string, { status: StatusPresensiSidak; catatan: string }> = {};
    classStudents.forEach(mhs => {
      // If student already had low attendance (<70%), simulate past trend or keep normal
      initialMap[mhs.nim] = {
        status: mhs.kehadiranPersen < 68 ? 'Alpa' : 'Hadir',
        catatan: mhs.kehadiranPersen < 68 ? 'Riwayat sering absen' : ''
      };
    });
    setRollCallState(initialMap);
  }, [selectedJadwal, classStudents]);

  if (!isOpen) return null;

  // Roll call actions
  const handleSetStudentStatus = (nim: string, status: StatusPresensiSidak) => {
    setRollCallState(prev => ({
      ...prev,
      [nim]: {
        ...prev[nim],
        status
      }
    }));
  };

  const handleSetStudentNote = (nim: string, catatan: string) => {
    setRollCallState(prev => ({
      ...prev,
      [nim]: {
        ...prev[nim],
        catatan
      }
    }));
  };

  const handleMarkAllHadir = () => {
    const updated: Record<string, { status: StatusPresensiSidak; catatan: string }> = {};
    classStudents.forEach(mhs => {
      updated[mhs.nim] = {
        status: 'Hadir',
        catatan: ''
      };
    });
    setRollCallState(updated);
  };

  // Calculations for current roll call
  const stats = (() => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;

    classStudents.forEach(mhs => {
      const st = rollCallState[mhs.nim]?.status || 'Hadir';
      if (st === 'Hadir') hadir++;
      else if (st === 'Izin') izin++;
      else if (st === 'Sakit') sakit++;
      else if (st === 'Alpa') alpa++;
    });

    const total = classStudents.length || 1;
    const persen = Math.round((hadir / total) * 100);

    return { total: classStudents.length, hadir, izin, sakit, alpa, persen };
  })();

  // Filtered students for table search
  const displayedStudents = classStudents.filter(m => 
    m.nama.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
    m.nim.includes(searchStudentTerm)
  );

  // Compute final attendance and potential warnings
  const auditAnalysis = useMemo(() => {
    const items: Array<{
      mhs: Mahasiswa;
      status: StatusPresensiSidak;
      catatan: string;
      kehadiranAwal: number;
      kehadiranAkhir: number;
      willGenerateWarning: boolean;
      warningLevel: 'Perhatian' | 'Kritis' | 'Tindakan Segera';
    }> = [];

    classStudents.forEach(mhs => {
      const st = rollCallState[mhs.nim]?.status || 'Hadir';
      const catatan = rollCallState[mhs.nim]?.catatan || '';
      const awal = mhs.kehadiranPersen;
      
      // Calculate updated attendance percentage
      let akhir = awal;
      if (st === 'Alpa') {
        akhir = Math.max(20, awal - 6);
      } else if (st === 'Sakit' || st === 'Izin') {
        akhir = Math.max(30, awal - 2);
      } else if (st === 'Hadir' && awal < 100) {
        akhir = Math.min(100, awal + 1);
      }

      // Early Warning System triggers:
      // - Alpa spot check
      // - Attendance drops below 75% (Syarat mutlak ikut UAS di FT UNBARI)
      // - Already at-risk / critical
      const willGenerate = st === 'Alpa' || akhir < 75;
      let level: 'Perhatian' | 'Kritis' | 'Tindakan Segera' = 'Perhatian';
      if (akhir < 65 || (st === 'Alpa' && akhir < 70)) {
        level = 'Tindakan Segera';
      } else if (akhir < 75 || st === 'Alpa') {
        level = 'Kritis';
      }

      items.push({
        mhs,
        status: st,
        catatan,
        kehadiranAwal: awal,
        kehadiranAkhir: akhir,
        willGenerateWarning: willGenerate,
        warningLevel: level
      });
    });

    return items;
  }, [classStudents, rollCallState]);

  const warningsCount = auditAnalysis.filter(i => i.willGenerateWarning).length;

  // Handle Save Audit
  const handleSaveAudit = () => {
    if (!selectedJadwal) return;

    const auditId = `SDK-${Date.now()}`;
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const romanMonth = romanMonths[today.getMonth()];
    const baNumber = `BA-SIDAK/FT-UNBARI/${today.getFullYear()}/${romanMonth}/${String(auditSidakList.length + 1).padStart(3, '0')}`;

    const newWarnings: PeringatanAkademik[] = [];
    const updatedStudentsList: Mahasiswa[] = [];

    const detailPresensi: DetailPresensiSidakMhs[] = auditAnalysis.map(item => {
      const { mhs, status, catatan, kehadiranAwal, kehadiranAkhir, willGenerateWarning, warningLevel } = item;
      
      let warnId = '';
      if (willGenerateWarning) {
        warnId = `WRN-SDK-${mhs.nim}-${Date.now().toString().slice(-4)}`;
        newWarnings.push({
          id: warnId,
          prodiId: selectedJadwal.prodiId,
          mahasiswaId: mhs.id,
          nim: mhs.nim,
          namaMahasiswa: mhs.nama,
          tipe: 'Presensi Rendah',
          level: warningLevel,
          tanggal: `${today.getDate()} ${today.toLocaleString('id-ID', { month: 'short' })} ${today.getFullYear()}`,
          deskripsi: `Terjaring Sidak Kehadiran Mendadak [${selectedJadwal.kodeMK} ${selectedJadwal.namaMK}, Ruang ${selectedJadwal.ruanganNama}]: Berstatus ${status}. Presensi akhir ${kehadiranAkhir}% (ambang batas kelayakan UAS FT UNBARI min. 75%). ${catatan ? `Catatan: ${catatan}.` : ''} Segera lakukan bimbingan khusus PA.`,
          sudahDitindaklanjuti: false
        });
      }

      // Update student record
      const updatedMhs: Mahasiswa = {
        ...mhs,
        kehadiranPersen: kehadiranAkhir,
        status: kehadiranAkhir < 65 ? 'Berisiko' : mhs.status,
        peringatanSp: willGenerateWarning && warningLevel === 'Tindakan Segera' ? Math.max(mhs.peringatanSp, 1) : mhs.peringatanSp,
        catatanAkademik: status === 'Alpa' 
          ? `[Sidak ${dateStr}]: Terjaring Alpa di kelas ${selectedJadwal.namaMK}. Kehadiran ${kehadiranAkhir}%.`
          : mhs.catatanAkademik
      };
      updatedStudentsList.push(updatedMhs);

      return {
        nim: mhs.nim,
        nama: mhs.nama,
        statusPresensi: status,
        kehadiranAwalPersen: kehadiranAwal,
        kehadiranAkhirPersen: kehadiranAkhir,
        catatan: catatan || (status === 'Alpa' ? 'Alpa saat pemeriksaan langsung di kelas' : undefined),
        isPeringatanDiterbitkan: willGenerateWarning
      };
    });

    const newAuditRecord: AuditSidakKehadiran = {
      id: auditId,
      nomorBeritaAcara: baNumber,
      tanggal: dateStr,
      jam: `${currentTimeStr} WIB`,
      hari: (currentDay as any) || 'Senin',
      prodiId: selectedJadwal.prodiId,
      jadwalId: selectedJadwal.id,
      kodeMK: selectedJadwal.kodeMK,
      namaMK: selectedJadwal.namaMK,
      kelas: selectedJadwal.kelas,
      ruanganNama: selectedJadwal.ruanganNama,
      dosenNama: selectedJadwal.dosenNama,
      dosenNidn: selectedJadwal.dosenNidn,
      auditorNama: auditorNama || selectedProdi.kaprodi,
      auditorJabatan: auditorJabatan || `Ketua Program Studi ${selectedProdi.nama}`,
      totalMahasiswaKelas: stats.total,
      jumlahHadir: stats.hadir,
      jumlahIzin: stats.izin,
      jumlahSakit: stats.sakit,
      jumlahAlpa: stats.alpa,
      persentaseKehadiranSidak: stats.persen,
      statusKesesuaianDosen,
      catatanAudit,
      rekomendasiTindakLanjut,
      detailPresensi,
      peringatanGeneratedIds: newWarnings.map(w => w.id)
    };

    onSaveAuditSidak(newAuditRecord, updatedStudentsList, newWarnings);
    setSelectedAuditForPrint(newAuditRecord);
    setActiveTab('print');
  };

  const handlePrintBeritaAcara = () => {
    printDirectToDefaultPrinter(
      'print-berita-acara-sidak',
      `Berita_Acara_Sidak_FT_UNBARI_${selectedAuditForPrint?.nomorBeritaAcara.replace(/\//g, '_') || 'Kelas'}`,
      false
    );
  };

  const auditToPrint = selectedAuditForPrint || auditSidakList[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-200 shadow-inner">
              <ClipboardCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Gugus Mutu &amp; Kaprodi FT UNBARI
                </span>
                <span className="text-xs text-blue-200 font-medium">·</span>
                <span className="text-xs text-blue-200">{selectedProdi.nama}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                Audit Kehadiran Mendadak (Sidak Presensi Kelas)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="hidden sm:flex items-center bg-white/10 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'form' 
                    ? 'bg-white text-blue-950 font-bold shadow-xs' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Formulir Sidak
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'history' 
                    ? 'bg-white text-blue-950 font-bold shadow-xs' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Riwayat Sidak ({auditSidakList.length})
              </button>
              {auditToPrint && (
                <button
                  type="button"
                  onClick={() => setActiveTab('print')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === 'print' 
                      ? 'bg-white text-blue-950 font-bold shadow-xs' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Berita Acara (Cetak)
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher for Mobile */}
        <div className="sm:hidden flex items-center justify-around border-b border-slate-200 bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-1.5 text-center rounded-lg font-medium ${
              activeTab === 'form' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Formulir
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-center rounded-lg font-medium ${
              activeTab === 'history' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Riwayat ({auditSidakList.length})
          </button>
          {auditToPrint && (
            <button
              type="button"
              onClick={() => setActiveTab('print')}
              className={`flex-1 py-1.5 text-center rounded-lg font-medium ${
                activeTab === 'print' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Berita Acara
            </button>
          )}
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* ======================================================== */}
          {/* TAB 1: FORMULIR PELAKSANAAN SIDAK BARU                   */}
          {/* ======================================================== */}
          {activeTab === 'form' && (
            <div className="space-y-6">
              
              {/* Guidance Notice Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3 shadow-2xs">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-blue-950">
                    Prosedur Operasional Standar (SOP) Sidak Kehadiran FT UNBARI
                  </div>
                  <p className="text-blue-800 leading-relaxed">
                    Sidak dilakukan sewaktu-waktu di ruang kuliah/laboratorium oleh Gugus Kendali Mutu atau Kaprodi. Mahasiswa yang terjaring <strong>Alpa</strong> atau memiliki kehadiran akhir <strong>&lt; 75%</strong> akan secara otomatis terintegrasi ke <strong>Modul Early Warning System (EWS)</strong> untuk diterbitkan Surat Peringatan (SP) resmi Dekanat.
                  </p>
                </div>
              </div>

              {/* Step 1: Session & Auditor Selection */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">1</span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Identitas Perkuliahan &amp; Verifikasi Dosen Pengampu
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Hari ini: {currentDay}, {currentTimeStr} WIB
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Select Jadwal */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pilih Sesi Kelas yang Disidak <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedJadwalId}
                      onChange={(e) => setSelectedJadwalId(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {availableJadwal.map((j) => (
                        <option key={j.id} value={j.id}>
                          [{j.hari} {j.jamMulai}-{j.jamSelesai}] {j.kodeMK} - {j.namaMK} (Kelas {j.kelas}) - {j.ruanganNama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lecturer Punctuality / Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kesesuaian &amp; Kedisiplinan Dosen di Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={statusKesesuaianDosen}
                      onChange={(e) => setStatusKesesuaianDosen(e.target.value as any)}
                      className={`w-full text-xs font-semibold border rounded-lg p-2.5 transition-colors ${
                        statusKesesuaianDosen === 'Tepat Waktu' 
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900' 
                          : statusKesesuaianDosen === 'Terlambat (<15 mnt)' 
                            ? 'border-amber-300 bg-amber-50/50 text-amber-900' 
                            : 'border-red-300 bg-red-50/50 text-red-900'
                      }`}
                    >
                      <option value="Tepat Waktu">✅ Tepat Waktu (Sesuai Jadwal)</option>
                      <option value="Terlambat (<15 mnt)">⚠️ Terlambat (&lt; 15 Menit)</option>
                      <option value="Digantikan Asisten">ℹ️ Digantikan Asisten Dosen / Dosen Pengganti</option>
                      <option value="Dosen Tidak Hadir">❌ Dosen Tidak Hadir / Kelas Kosong</option>
                    </select>
                  </div>

                  {/* Auditor Details */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Petugas Sidak (Auditor)
                    </label>
                    <input
                      type="text"
                      value={auditorNama}
                      onChange={(e) => setAuditorNama(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="Nama Lengkap & Gelar Auditor"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jabatan / Tim Pengawas
                    </label>
                    <input
                      type="text"
                      value={auditorJabatan}
                      onChange={(e) => setAuditorJabatan(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Gugus Kendali Mutu FT UNBARI / Kaprodi"
                    />
                  </div>

                </div>

                {/* Selected Class Highlight Box */}
                {selectedJadwal && (
                  <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        {selectedJadwal.kodeMK}
                      </span>
                      <span className="font-semibold text-slate-900">{selectedJadwal.namaMK}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">Kelas {selectedJadwal.kelas} ({selectedJadwal.sks} SKS)</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        👨‍🏫 {selectedJadwal.dosenNama}
                      </span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {selectedJadwal.ruanganNama}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {selectedJadwal.jamMulai} - {selectedJadwal.jamSelesai} WIB
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Live Roll Call & Presensi Sheet */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">2</span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Pemeriksaan Fisik &amp; Presensi Mahasiswa di Ruangan
                      </h3>
                      <p className="text-xs text-slate-500">
                        Verifikasi nama mahasiswa satu per satu di hadapan dosen pengampu
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={handleMarkAllHadir}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tandai Semua Hadir (100%)</span>
                    </button>
                  </div>
                </div>

                {/* Live Stats Overview Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] text-slate-500 font-medium block">Total Terdaftar</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">{stats.total}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] text-emerald-700 font-medium block">Hadir Fisik</span>
                    <span className="text-lg font-bold text-emerald-800 font-mono">{stats.hadir}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] text-blue-700 font-medium block">Izin Resmi</span>
                    <span className="text-lg font-bold text-blue-800 font-mono">{stats.izin}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] text-amber-700 font-medium block">Sakit</span>
                    <span className="text-lg font-bold text-amber-800 font-mono">{stats.sakit}</span>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] text-red-700 font-medium block">Alpa (Bolos)</span>
                    <span className="text-lg font-bold text-red-800 font-mono">{stats.alpa}</span>
                  </div>
                  <div className={`rounded-lg p-2.5 text-center border ${
                    stats.persen >= 75 ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}>
                    <span className="text-[10px] font-medium block">Tingkat Hadir</span>
                    <span className="text-lg font-bold font-mono">{stats.persen}%</span>
                  </div>
                </div>

                {/* Filter and search bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchStudentTerm}
                    onChange={(e) => setSearchStudentTerm(e.target.value)}
                    placeholder="Cari NIM atau Nama Mahasiswa dalam kelas ini..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Students Roll Call Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3">Mahasiswa</th>
                        <th className="py-2.5 px-3 text-center">Kehadiran Kumulatif</th>
                        <th className="py-2.5 px-3 text-center">Presensi Sidak</th>
                        <th className="py-2.5 px-3">Status EWS &amp; Catatan Khusus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedStudents.map((mhs, idx) => {
                        const currentStatus = rollCallState[mhs.nim]?.status || 'Hadir';
                        const currentNote = rollCallState[mhs.nim]?.catatan || '';
                        
                        // Recalculate impact
                        let akhir = mhs.kehadiranPersen;
                        if (currentStatus === 'Alpa') akhir = Math.max(20, mhs.kehadiranPersen - 6);
                        else if (currentStatus === 'Sakit' || currentStatus === 'Izin') akhir = Math.max(30, mhs.kehadiranPersen - 2);

                        const isWarningTriggered = currentStatus === 'Alpa' || akhir < 75;

                        return (
                          <tr 
                            key={mhs.nim}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              currentStatus === 'Alpa' ? 'bg-red-50/40' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                              {idx + 1}
                            </td>
                            
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900">{mhs.nama}</div>
                              <div className="font-mono text-[11px] text-slate-500">{mhs.nim}</div>
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1 font-mono">
                                <span className={`font-semibold ${
                                  mhs.kehadiranPersen < 75 ? 'text-red-600' : 'text-slate-700'
                                }`}>
                                  {mhs.kehadiranPersen}%
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-300" />
                                <span className={`font-bold px-1.5 py-0.5 rounded ${
                                  akhir < 75 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {akhir}%
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Min. UAS: 75%
                              </span>
                            </td>

                            {/* Status Buttons */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(mhs.nim, 'Hadir')}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                    currentStatus === 'Hadir'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                  }`}
                                >
                                  Hadir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(mhs.nim, 'Izin')}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                    currentStatus === 'Izin'
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                                  }`}
                                >
                                  Izin
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(mhs.nim, 'Sakit')}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                    currentStatus === 'Sakit'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                  }`}
                                >
                                  Sakit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetStudentStatus(mhs.nim, 'Alpa')}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                    currentStatus === 'Alpa'
                                      ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-300'
                                      : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                                  }`}
                                >
                                  Alpa
                                </button>
                              </div>
                            </td>

                            {/* EWS Tag & Notes */}
                            <td className="py-2.5 px-3">
                              <div className="space-y-1">
                                {isWarningTriggered && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                    <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                    <span>
                                      {akhir < 65 
                                        ? 'Peringatan Kritis DO (<65%)' 
                                        : currentStatus === 'Alpa' 
                                          ? 'Peringatan Alpa Sidak' 
                                          : 'Peringatan Syarat UAS (<75%)'}
                                    </span>
                                  </div>
                                )}
                                <input
                                  type="text"
                                  value={currentNote}
                                  onChange={(e) => handleSetStudentNote(mhs.nim, e.target.value)}
                                  placeholder="Catatan verifikasi (e.g. tanpa keterangan, telat 30 mnt)..."
                                  className="w-full text-[11px] border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 bg-white"
                                />
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Step 3: Audit Findings & Follow-up Actions */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">3</span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Catatan Temuan Auditor &amp; Rekomendasi Tindak Lanjut
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan Temuan Sidak di Ruang Kelas
                    </label>
                    <textarea
                      rows={3}
                      value={catatanAudit}
                      onChange={(e) => setCatatanAudit(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                      placeholder="Catatan suasana perkuliahan, ketepatan materi, kelengkapan sarana..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rekomendasi Tindak Lanjut Akademik
                    </label>
                    <textarea
                      rows={3}
                      value={rekomendasiTindakLanjut}
                      onChange={(e) => setRekomendasiTindakLanjut(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                      placeholder="Instruksi untuk Dosen PA, mahasiswa yang tidak hadir, atau Dekanat..."
                    />
                  </div>
                </div>

                {/* Early Warning Integration Callout */}
                <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-600 text-white rounded-lg shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-red-950 uppercase tracking-wide">
                        Integrasi Otomatis ke Modul Peringatan Akademik &amp; EWS
                      </div>
                      <p className="text-xs text-red-800 mt-0.5">
                        Menyimpan sidak ini akan <strong>menerbitkan {warningsCount} Surat Peringatan (SP)</strong> bagi mahasiswa yang terjaring Alpa atau presensi kumulatifnya turun di bawah 75%.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAudit}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-[1.01]"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Simpan &amp; Terbitkan Peringatan EWS</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: RIWAYAT AUDIT SIDAK TERDAHULU                      */}
          {/* ======================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Log Riwayat Sidak Kehadiran Mahasiswa FT UNBARI
                  </h3>
                  <p className="text-xs text-slate-500">
                    Daftar inspeksi mendadak ruang kelas, rekapitulasi presensi, dan surat peringatan yang diterbitkan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  + Mulai Sidak Baru
                </button>
              </div>

              {auditSidakList.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                  <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-700">Belum ada riwayat audit sidak tersimpan.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Silakan gunakan tab "Formulir Sidak" untuk mencatat inspeksi kehadiran kelas pertama.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditSidakList.map((audit) => (
                    <div 
                      key={audit.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {audit.nomorBeritaAcara}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-600 font-medium">
                            {audit.hari}, {audit.tanggal} ({audit.jam})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            audit.persentaseKehadiranSidak >= 80 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            Kehadiran Sidak: {audit.persentaseKehadiranSidak}%
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {audit.statusKesesuaianDosen}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        <div className="sm:col-span-5 space-y-1">
                          <div className="font-bold text-slate-900">
                            {audit.kodeMK} · {audit.namaMK} (Kelas {audit.kelas})
                          </div>
                          <div className="text-slate-600 flex items-center gap-2">
                            <span>👨‍🏫 {audit.dosenNama}</span>
                            <span>·</span>
                            <span>📍 {audit.ruanganNama}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Auditor: <strong>{audit.auditorNama}</strong> ({audit.auditorJabatan})
                          </div>
                        </div>

                        <div className="sm:col-span-4 flex items-center justify-around bg-slate-50 rounded-lg p-2 font-mono text-center">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Total</span>
                            <span className="font-bold text-slate-800">{audit.totalMahasiswaKelas}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-600 block">Hadir</span>
                            <span className="font-bold text-emerald-700">{audit.jumlahHadir}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-blue-600 block">Izin/Skt</span>
                            <span className="font-bold text-blue-700">{audit.jumlahIzin + audit.jumlahSakit}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-red-600 block">Alpa</span>
                            <span className="font-bold text-red-700">{audit.jumlahAlpa}</span>
                          </div>
                        </div>

                        <div className="sm:col-span-3 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                          {audit.peringatanGeneratedIds.length > 0 && (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              🚨 {audit.peringatanGeneratedIds.length} SP Diterbitkan
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAuditForPrint(audit);
                              setActiveTab('print');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Buka Berita Acara</span>
                          </button>
                        </div>
                      </div>

                      {audit.catatanAudit && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50/70 p-2 rounded">
                          Temuan: "{audit.catatanAudit}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: FORMAT CETAK RESMI BERITA ACARA (A4)               */}
          {/* ======================================================== */}
          {activeTab === 'print' && auditToPrint && (
            <div className="space-y-4">
              
              {/* Action Toolbar */}
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Pratinjau Berita Acara:
                  </span>
                  <span className="font-mono text-xs text-blue-700 font-semibold">
                    {auditToPrint.nomorBeritaAcara}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    ← Kembali ke Form
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintBeritaAcara}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak ke Printer Default</span>
                  </button>
                </div>
              </div>

              {/* Printable Document Sheet (A4 Styled) */}
              <div 
                id="print-berita-acara-sidak"
                className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-md max-w-3xl mx-auto text-slate-900 font-serif leading-normal"
              >
                
                {/* Kop Surat Resmi FT UNBARI */}
                <div className="flex items-center gap-4 border-b-4 border-double border-slate-900 pb-4 mb-6">
                  <img 
                    src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
                    alt="Logo Universitas Batanghari" 
                    className="w-20 h-20 object-contain shrink-0" 
                  />
                  <div className="text-center flex-1 font-sans">
                    <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      YAYASAN PENDIDIKAN JAMBI
                    </h4>
                    <h2 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                      UNIVERSITAS BATANGHARI
                    </h2>
                    <h3 className="text-sm font-extrabold text-blue-900 uppercase">
                      FAKULTAS TEKNIK · GUGUS KENDALI MUTU
                    </h3>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Program Studi: S-1 Teknik Sipil (Akreditasi B) · S-1 Teknik Lingkungan (Akreditasi B) · D-3 Teknik Listrik (Baik)
                    </p>
                    <p className="text-[10px] text-slate-700 mt-1 leading-snug">
                      Jl. Slamet Riyadi No. 01 Broni - Kota Jambi 36122, Telp: (0741) 60103
                    </p>
                    <p className="text-[10px] text-slate-700 font-medium leading-snug">
                      Laman Resmi: <span className="text-blue-900 underline">https://universitasbatanghari.ac.id</span> · Surel: <span className="font-mono">ftunbari.tpa@gmail.com</span>
                    </p>
                  </div>
                </div>

                {/* Judul Berita Acara */}
                <div className="text-center mb-6 font-sans">
                  <h1 className="text-base font-bold uppercase underline decoration-2 underline-offset-4 tracking-wide text-slate-950">
                    Berita Acara Audit Kehadiran Mendadak (Sidak Ruang Kelas)
                  </h1>
                  <p className="text-xs font-mono font-medium text-slate-700 mt-1">
                    Nomor: {auditToPrint.nomorBeritaAcara}
                  </p>
                </div>

                {/* Paragraph Opening */}
                <div className="text-xs text-justify space-y-3 font-sans text-slate-800 leading-relaxed">
                  <p>
                    Pada hari ini, <strong>{auditToPrint.hari}</strong>, tanggal <strong>{auditToPrint.tanggal}</strong>, pukul <strong>{auditToPrint.jam}</strong>, telah dilaksanakan inspeksi dan audit kehadiran fisik mahasiswa secara mendadak (Spot-Check) oleh Tim Gugus Kendali Mutu / Pimpinan Program Studi Fakultas Teknik Universitas Batanghari pada perkuliahan semester ganjil Tahun Akademik 2026/2027 dengan rincian sebagai berikut:
                  </p>

                  {/* Details Grid */}
                  <table className="w-full text-xs font-sans border-collapse my-3">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold w-44 text-slate-700">Mata Kuliah / SKS</td>
                        <td className="py-1 px-2 text-slate-900">: <strong>{auditToPrint.namaMK}</strong> ({auditToPrint.kodeMK})</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold text-slate-700">Kelas / Semester</td>
                        <td className="py-1 px-2 text-slate-900">: Kelas {auditToPrint.kelas}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold text-slate-700">Ruangan Perkuliahan</td>
                        <td className="py-1 px-2 text-slate-900">: {auditToPrint.ruanganNama}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold text-slate-700">Dosen Pengampu</td>
                        <td className="py-1 px-2 text-slate-900">: <strong>{auditToPrint.dosenNama}</strong> (Status: {auditToPrint.statusKesesuaianDosen})</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold text-slate-700">Petugas Sidak (Auditor)</td>
                        <td className="py-1 px-2 text-slate-900">: <strong>{auditToPrint.auditorNama}</strong> ({auditToPrint.auditorJabatan})</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Rekapitulasi Presensi */}
                  <p className="font-semibold text-slate-900 pt-2">
                    I. Rekapitulasi Kehadiran Fisik Mahasiswa:
                  </p>

                  <div className="grid grid-cols-5 gap-2 text-center font-mono my-2 border border-slate-300 rounded p-2 bg-slate-50 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-sans">Total Peserta</span>
                      <strong>{auditToPrint.totalMahasiswaKelas} Mhs</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 block font-sans">Hadir Fisik</span>
                      <strong className="text-emerald-700">{auditToPrint.jumlahHadir} ({auditToPrint.persentaseKehadiranSidak}%)</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-700 block font-sans">Izin</span>
                      <strong className="text-blue-700">{auditToPrint.jumlahIzin}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-700 block font-sans">Sakit</span>
                      <strong className="text-amber-700">{auditToPrint.jumlahSakit}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-red-700 block font-sans">Alpa</span>
                      <strong className="text-red-700">{auditToPrint.jumlahAlpa}</strong>
                    </div>
                  </div>

                  {/* Rincian Mahasiswa Terjaring Alpa / Peringatan */}
                  <p className="font-semibold text-slate-900 pt-2">
                    II. Rincian Mahasiswa Terjaring Alpa / Kehadiran Kumulatif Rendah (&lt; 75%):
                  </p>

                  {auditToPrint.detailPresensi.filter(d => d.statusPresensi !== 'Hadir' || d.kehadiranAkhirPersen < 75).length === 0 ? (
                    <p className="text-slate-500 italic py-1">
                      Seluruh mahasiswa hadir di ruangan kelas (Tingkat kehadiran 100%, nihil Alpa).
                    </p>
                  ) : (
                    <table className="w-full text-xs font-sans border border-slate-300 border-collapse my-2">
                      <thead className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-800">
                        <tr>
                          <th className="border border-slate-300 py-1.5 px-2 text-center w-8">No</th>
                          <th className="border border-slate-300 py-1.5 px-2">NIM</th>
                          <th className="border border-slate-300 py-1.5 px-2">Nama Mahasiswa</th>
                          <th className="border border-slate-300 py-1.5 px-2 text-center">Status</th>
                          <th className="border border-slate-300 py-1.5 px-2 text-center">Kehadiran</th>
                          <th className="border border-slate-300 py-1.5 px-2">Tindakan EWS Dekanat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditToPrint.detailPresensi
                          .filter(d => d.statusPresensi !== 'Hadir' || d.kehadiranAkhirPersen < 75)
                          .map((item, idx) => (
                            <tr key={item.nim} className="border-b border-slate-200">
                              <td className="border border-slate-300 py-1 px-2 text-center font-mono">{idx + 1}</td>
                              <td className="border border-slate-300 py-1 px-2 font-mono font-semibold">{item.nim}</td>
                              <td className="border border-slate-300 py-1 px-2 font-medium">{item.nama}</td>
                              <td className="border border-slate-300 py-1 px-2 text-center font-bold">
                                <span className={item.statusPresensi === 'Alpa' ? 'text-red-700' : 'text-slate-700'}>
                                  {item.statusPresensi}
                                </span>
                              </td>
                              <td className="border border-slate-300 py-1 px-2 text-center font-mono font-semibold">
                                {item.kehadiranAkhirPersen}%
                              </td>
                              <td className="border border-slate-300 py-1 px-2 text-[10px] text-red-700 font-medium">
                                {item.isPeringatanDiterbitkan 
                                  ? 'Diterbitkan Surat Peringatan (SP) & Pemanggilan PA' 
                                  : 'Evaluasi Presensi'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {/* Catatan Auditor */}
                  <div className="pt-2 space-y-1">
                    <p className="font-semibold text-slate-900">III. Catatan Pengawasan &amp; Rekomendasi:</p>
                    <p className="italic bg-slate-50 p-2 border border-slate-200 rounded text-slate-700 text-[11px]">
                      "{auditToPrint.catatanAudit}"
                    </p>
                    <p className="text-[11px] text-slate-700 mt-1">
                      <strong>Rekomendasi:</strong> {auditToPrint.rekomendasiTindakLanjut}
                    </p>
                  </div>

                  <p className="pt-2">
                    Demikian Berita Acara Audit Kehadiran Mendadak ini dibuat dengan sebenar-benarnya untuk digunakan sebagaimana mestinya dalam rangka penegakan mutu akademik di Fakultas Teknik Universitas Batanghari.
                  </p>

                </div>

                {/* Tanda Tangan & QR Verification */}
                <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center font-sans text-xs">
                  
                  {/* Dosen Pengampu */}
                  <div>
                    <p className="text-slate-600 mb-14">
                      Dosen Pengampu Mata Kuliah,
                    </p>
                    <p className="font-bold underline text-slate-900">
                      {auditToPrint.dosenNama}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      NIDN: {auditToPrint.dosenNidn || '1023058401'}
                    </p>
                  </div>

                  {/* QR Verification Center */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-1 border border-slate-300 bg-white rounded shadow-2xs">
                      <QrCodeSvg 
                        value={`https://ft.unbari.ac.id/verifikasi/sidak/${auditToPrint.nomorBeritaAcara.replace(/\//g, '-')}`}
                        size={64}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                      Validasi Dokumen Digital FT
                    </span>
                  </div>

                  {/* Auditor / Kaprodi */}
                  <div>
                    <p className="text-slate-600 mb-14">
                      Petugas Sidak / Kaprodi,
                    </p>
                    <p className="font-bold underline text-slate-900">
                      {auditToPrint.auditorNama}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {auditToPrint.auditorJabatan}
                    </p>
                  </div>

                </div>

                {/* Knowing Dekanat */}
                <div className="mt-6 text-center font-sans text-xs">
                  <p className="text-slate-600 mb-12">
                    Mengetahui,<br />
                    Dekan Fakultas Teknik Universitas Batanghari,
                  </p>
                  <p className="font-bold underline text-slate-900">
                    Fadli Eka Yandra, ST., MT
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">
                    NIDN: 1004077102
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>Sistem Audit Mutu Akademik · Fakultas Teknik UNBARI Jambi</span>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
