import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Sliders, 
  Calendar, 
  Layers, 
  UserCheck, 
  FileSpreadsheet, 
  Award,
  ChevronRight,
  ShieldCheck,
  Building,
  ArrowRight,
  Zap,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';
import { 
  ProgramStudiInfo, 
  Mahasiswa, 
  Dosen, 
  KrsRecord, 
  KrsItem, 
  KhsRecord, 
  DpnaRecord, 
  MataKuliahKurikulum, 
  TranskripNilaiRecord, 
  KalenderAkademikEvent,
  TipeSemester,
  PeriodeSemesterInfo
} from '../types/index';
import { 
  MATA_KULIAH_KURIKULUM, 
  INITIAL_KRS_RECORDS, 
  INITIAL_KHS_RECORDS, 
  INITIAL_DPNA_RECORDS, 
  INITIAL_TRANSKRIP_SAMPLE, 
  INITIAL_KALENDER_AKADEMIK, 
  DAFTAR_PERIODE_SEMESTER,
  hitungBatasSks 
} from '../data/mockSiakadData';
import { SKALA_NILAI_UNBARI, hitungSkalaNilai } from '../utils/gradeScaleHelper';
import { SiakadPrintModal, SiakadPrintType } from './SiakadPrintModal';

interface SiakadViewProps {
  selectedProdi: ProgramStudiInfo;
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  onShowToast: (message: string) => void;
}

export const SiakadView: React.FC<SiakadViewProps> = ({
  selectedProdi,
  mahasiswaList,
  dosenList,
  onShowToast
}) => {
  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'krs' | 'khs' | 'transkrip' | 'input_nilai' | 'dpa' | 'kurikulum'>('krs');

  // Selected Active Semester Type (Ganjil | Genap | Pendek)
  const [selectedSemesterType, setSelectedSemesterType] = useState<TipeSemester>('Ganjil');

  // Current Active Semester Object
  const currentPeriodeInfo = DAFTAR_PERIODE_SEMESTER.find(p => p.tipe === selectedSemesterType) || DAFTAR_PERIODE_SEMESTER[0];

  // Safe localStorage parser helper
  const safeParseArray = <T,>(key: string, fallback: T[]): T[] => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  // Datasets state (synced with mock data and localStorage)
  const [krsRecords, setKrsRecords] = useState<KrsRecord[]>(() =>
    safeParseArray<KrsRecord>('siakad_unbari_krs_v2', INITIAL_KRS_RECORDS)
  );

  const [khsRecords, setKhsRecords] = useState<KhsRecord[]>(() =>
    safeParseArray<KhsRecord>('siakad_unbari_khs_v2', INITIAL_KHS_RECORDS)
  );

  const [dpnaRecords, setDpnaRecords] = useState<DpnaRecord[]>(() =>
    safeParseArray<DpnaRecord>('siakad_unbari_dpna_v2', INITIAL_DPNA_RECORDS)
  );

  // Selected Student for KRS / KHS view
  const prodiStudents = React.useMemo(
    () => mahasiswaList.filter(m => m.prodiId === selectedProdi.id),
    [mahasiswaList, selectedProdi.id]
  );
  const [selectedNim, setSelectedNim] = useState<string>(
    prodiStudents[0]?.nim || mahasiswaList[0]?.nim || '21010041'
  );

  React.useEffect(() => {
    if (prodiStudents.length > 0 && !prodiStudents.some(m => m.nim === selectedNim)) {
      setSelectedNim(prodiStudents[0].nim);
    }
  }, [selectedProdi.id, prodiStudents, selectedNim]);

  // Selected Student Object (guarded against empty list)
  const currentStudent: Mahasiswa =
    mahasiswaList.find(m => m.nim === selectedNim) ||
    prodiStudents[0] ||
    mahasiswaList[0] || {
      id: 'fallback-mhs',
      nim: selectedNim || '21010041',
      nama: 'Mahasiswa Prodi',
      prodiId: selectedProdi.id,
      programStudi: selectedProdi.nama,
      jenjang: selectedProdi.jenjang,
      angkatan: 2024,
      semester: 5,
      ipk: 3.25,
      sksLulus: 84,
      sksSemesterIni: 20,
      sksTargetLulus: selectedProdi.jenjang === 'D3' ? 110 : 144,
      status: 'Aktif',
      dosenPA: selectedProdi.kaprodi,
      email: 'mahasiswa@ft.unbari.ac.id',
      nomorHp: '081200000000',
      kehadiranPersen: 90,
      konsentrasi: 'Umum',
      peringatanSp: 0
    };

  // Active KRS for current student and selected semester type
  const matchingKrs = krsRecords.find(k => k.nim === selectedNim && (k.tipeSemester || 'Ganjil') === selectedSemesterType);
  
  const currentKrs = matchingKrs || {
    id: `KRS-${selectedNim}-${selectedSemesterType}`,
    nim: currentStudent.nim,
    namaMahasiswa: currentStudent.nama,
    prodiId: selectedProdi.id,
    programStudi: selectedProdi.nama,
    semesterAkademik: currentPeriodeInfo.nama,
    tipeSemester: selectedSemesterType,
    semesterMhs: selectedSemesterType === 'Genap' ? currentStudent.semester + 1 : currentStudent.semester,
    ipsLalu: currentStudent.ipk > 0 ? Number((currentStudent.ipk - 0.1).toFixed(2)) : 3.25,
    maxSksBeban: hitungBatasSks(currentStudent.ipk > 0 ? currentStudent.ipk - 0.1 : 3.25, selectedSemesterType),
    totalSks: 0,
    statusPersetujuan: 'Draft' as const,
    dosenPA: currentStudent.dosenPA || selectedProdi.kaprodi,
    items: []
  };

  // Active KHS for current student and selected semester
  const matchingKhs = khsRecords.find(k => k.nim === selectedNim && (k.tipeSemester || 'Ganjil') === selectedSemesterType);
  const currentKhs = matchingKhs || khsRecords.find(k => k.nim === selectedNim) || INITIAL_KHS_RECORDS[0];

  // Selected DPNA Course for Lecturers
  const [selectedDpnaId, setSelectedDpnaId] = useState<string>(INITIAL_DPNA_RECORDS[0]?.id || '');
  const currentDpna = dpnaRecords.find(d => d.id === selectedDpnaId) || dpnaRecords[0];

  // Print Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<SiakadPrintType>('KRS');

  // Modal Tambah Mata Kuliah ke KRS
  const [showAddMkModal, setShowAddMkModal] = useState(false);
  const [searchMkQuery, setSearchMkQuery] = useState('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<number>(0);
  const [isRemedialOption, setIsRemedialOption] = useState<boolean>(selectedSemesterType === 'Pendek');
  const [nilaiAsalInput, setNilaiAsalInput] = useState<string>('C');

  // Filter & Pencarian Kurikulum Tab
  const [kurikulumSemesterFilter, setKurikulumSemesterFilter] = useState<number>(0);
  const [kurikulumSearch, setKurikulumSearch] = useState<string>('');
  const [kurikulumTypeFilter, setKurikulumTypeFilter] = useState<'all' | 'Ganjil' | 'Genap'>('all');

  // Filter Mata Kuliah Kurikulum untuk Prodi Aktif
  const prodiKurikulum = MATA_KULIAH_KURIKULUM.filter(m => m.prodiId === selectedProdi.id);

  // Helper untuk menyimpan KRS
  const saveKrs = (updated: KrsRecord) => {
    const existingIdx = krsRecords.findIndex(k => k.nim === updated.nim && (k.tipeSemester || 'Ganjil') === (updated.tipeSemester || 'Ganjil'));
    let nextList: KrsRecord[];
    if (existingIdx >= 0) {
      nextList = [...krsRecords];
      nextList[existingIdx] = updated;
    } else {
      nextList = [...krsRecords, updated];
    }
    setKrsRecords(nextList);
    localStorage.setItem('siakad_unbari_krs_v2', JSON.stringify(nextList));
  };

  // Handler: Tambah MK ke KRS
  const handleAddMkToKrs = (mk: MataKuliahKurikulum) => {
    // Cek apakah MK sudah diambil di semester ini
    if (currentKrs.items.some(i => i.kodeMK === mk.kodeMK)) {
      onShowToast(`Mata kuliah ${mk.namaMK} sudah ada di dalam KRS ${currentPeriodeInfo.nama}.`);
      return;
    }

    // Cek batas SKS
    const maxAllowed = currentKrs.maxSksBeban;
    if (currentKrs.totalSks + mk.sks > maxAllowed) {
      onShowToast(`Gagal: Total SKS melebihi batas beban ${selectedSemesterType === 'Pendek' ? 'Semester Pendek (maks. 9 SKS)' : `${maxAllowed} SKS`}.`);
      return;
    }

    const newItem: KrsItem = {
      id: `ITEM-${Date.now()}`,
      kodeMK: mk.kodeMK,
      namaMK: selectedSemesterType === 'Pendek' && isRemedialOption ? `${mk.namaMK} (SP Remedial)` : mk.namaMK,
      sks: mk.sks,
      kelas: selectedSemesterType === 'Pendek' ? 'SP' : 'A',
      hari: selectedSemesterType === 'Pendek' ? 'Senin' : 'Rabu',
      jamMulai: '08:00',
      jamSelesai: '10:30',
      ruangan: `R. Kuliah ${selectedProdi.singkatan}-${selectedSemesterType === 'Pendek' ? 'SP' : '1'}`,
      dosen: mk.dosenPengampu,
      isUlangRemedial: selectedSemesterType === 'Pendek' && isRemedialOption,
      nilaiAsalSebelumnya: selectedSemesterType === 'Pendek' && isRemedialOption ? nilaiAsalInput : undefined
    };

    const updated: KrsRecord = {
      ...currentKrs,
      tipeSemester: selectedSemesterType,
      semesterAkademik: currentPeriodeInfo.nama,
      totalSks: currentKrs.totalSks + mk.sks,
      items: [...currentKrs.items, newItem]
    };

    saveKrs(updated);
    onShowToast(`Mata kuliah ${mk.namaMK} (${mk.sks} SKS) berhasil ditambahkan ke KRS ${currentPeriodeInfo.nama}.`);
    setShowAddMkModal(false);
  };

  // Handler: Hapus MK dari KRS
  const handleRemoveMkFromKrs = (itemId: string, namaMK: string, sks: number) => {
    const updated: KrsRecord = {
      ...currentKrs,
      totalSks: Math.max(0, currentKrs.totalSks - sks),
      items: currentKrs.items.filter(i => i.id !== itemId)
    };
    saveKrs(updated);
    onShowToast(`Mata kuliah ${namaMK} dihapus dari KRS.`);
  };

  // Handler: Ajukan KRS ke DPA
  const handleAjukanKrs = () => {
    if (currentKrs.items.length === 0) {
      onShowToast('KRS belum memiliki mata kuliah terpilih.');
      return;
    }
    const updated: KrsRecord = {
      ...currentKrs,
      statusPersetujuan: 'Diajukan',
      tanggalPengajuan: new Date().toISOString().slice(0, 10)
    };
    saveKrs(updated);
    onShowToast(`KRS ${currentPeriodeInfo.nama} berhasil diajukan kepada DPA.`);
  };

  // Handler: Persetujuan DPA
  const handleApproveKrsByDpa = (nim: string, tipe: TipeSemester) => {
    const targetKrs = krsRecords.find(k => k.nim === nim && (k.tipeSemester || 'Ganjil') === tipe) || currentKrs;
    const updated: KrsRecord = {
      ...targetKrs,
      statusPersetujuan: 'Disetujui DPA',
      tanggalPersetujuan: new Date().toISOString().slice(0, 10),
      catatanDpa: `KRS ${targetKrs.semesterAkademik} telah diverifikasi dan disetujui DPA. Silakan cetak lembar KRS resmi.`
    };
    saveKrs(updated);
    onShowToast(`KRS (${targetKrs.semesterAkademik}) mahasiswa NIM: ${nim} resmi disetujui oleh DPA.`);
  };

  // Handler: Update Nilai Komponen DPNA Dosen
  const handleUpdateScore = (
    nim: string, 
    field: 'kehadiran' | 'tugas' | 'uts' | 'uas', 
    val: number
  ) => {
    const scoreVal = Math.min(100, Math.max(0, val));
    const nextPeserta = currentDpna.peserta.map(p => {
      if (p.nim !== nim) return p;
      const updatedP = { ...p, [field]: scoreVal };
      // Rumus Komponen Nilai UNBARI: Hadir 10%, Tugas 20%, UTS 30%, UAS 40%
      const nilaiAkhir = Number(
        (
          updatedP.kehadiran * 0.10 + 
          updatedP.tugas * 0.20 + 
          updatedP.uts * 0.30 + 
          updatedP.uas * 0.40
        ).toFixed(2)
      );
      const skala = hitungSkalaNilai(nilaiAkhir);
      return {
        ...updatedP,
        nilaiAkhir,
        hurufMutu: skala.huruf,
        bobot: skala.bobot
      };
    });

    const updatedDpna = { ...currentDpna, peserta: nextPeserta };
    const nextList = dpnaRecords.map(d => d.id === currentDpna.id ? updatedDpna : d);
    setDpnaRecords(nextList);
    localStorage.setItem('siakad_unbari_dpna_v2', JSON.stringify(nextList));
  };

  // Handler: Buka Modal Cetak
  const handleOpenPrint = (t: SiakadPrintType) => {
    setPrintType(t);
    setPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">

      {/* TOP INSTITUTIONAL BANNER SIAKAD */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 transform skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
              <span>SIAKAD FT UNBARI · Sistem Informasi Akademik Terpadu</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Portal Akademik Mahasiswa &amp; Dosen ({selectedProdi.nama})
            </h1>
            
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              Mendukung registrasi akademik penuh untuk <strong>Semester Ganjil</strong>, <strong>Semester Genap</strong>, dan <strong>Semester Pendek (Antara)</strong> dengan penegakan batas beban SKS dan skala 11 huruf mutu UNBARI.
            </p>
          </div>

          {/* Quick Print Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenPrint('KRS')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-950 bg-white hover:bg-blue-50 rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-blue-700" />
              <span>Cetak KRS ({selectedSemesterType})</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenPrint('KHS')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-950 bg-white hover:bg-indigo-50 rounded-xl shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-700" />
              <span>Cetak KHS ({selectedSemesterType})</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenPrint('TRANSKRIP')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-yellow-300" />
              <span>Transkrip A4</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SEMESTER PICKER STRIP: GANJIL, GENAP, DAN PENDEK        */}
        {/* ======================================================== */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
              Pilih Periode Semester:
            </span>
          </div>

          <div className="flex p-1 bg-black/40 backdrop-blur-xs rounded-xl border border-white/10 gap-1.5 text-xs">
            {/* 1. SEMESTER GANJIL */}
            <button
              type="button"
              onClick={() => setSelectedSemesterType('Ganjil')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                selectedSemesterType === 'Ganjil'
                  ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-400'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${selectedSemesterType === 'Ganjil' ? 'bg-yellow-300 animate-pulse' : 'bg-blue-400'}`} />
              <span>Semester Ganjil</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">Reguler</span>
            </button>

            {/* 2. SEMESTER GENAP */}
            <button
              type="button"
              onClick={() => setSelectedSemesterType('Genap')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                selectedSemesterType === 'Genap'
                  ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400'
                  : 'text-emerald-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${selectedSemesterType === 'Genap' ? 'bg-yellow-300 animate-pulse' : 'bg-emerald-400'}`} />
              <span>Semester Genap</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">Reguler</span>
            </button>

            {/* 3. SEMESTER PENDEK / ANTARA */}
            <button
              type="button"
              onClick={() => setSelectedSemesterType('Pendek')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                selectedSemesterType === 'Pendek'
                  ? 'bg-amber-600 text-white shadow-xs ring-1 ring-amber-400'
                  : 'text-amber-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Semester Pendek</span>
              <span className="text-[10px] bg-yellow-400 text-slate-950 font-black px-1.5 py-0.2 rounded font-mono">Max 9 SKS</span>
            </button>
          </div>
        </div>

        {/* Detail Periode Semester Yang Aktif */}
        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              selectedSemesterType === 'Pendek' ? 'bg-amber-400 text-slate-950' : 'bg-blue-400 text-slate-950'
            }`}>
              {currentPeriodeInfo.nama}
            </span>
            <span className="text-blue-200 text-[11px]">
              Jadwal: <strong>{currentPeriodeInfo.periodeBulan}</strong> · Batas Maksimal SKS: <strong>{currentPeriodeInfo.maxSksDefault} SKS</strong>
            </span>
          </div>
          <span className="text-blue-300/80 text-[11px] italic">
            {currentPeriodeInfo.deskripsi}
          </span>
        </div>

      </div>

      {/* NOTIFIKASI KHUSUS JIKA SEMESTER PENDEK DIPILIH */}
      {selectedSemesterType === 'Pendek' && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl text-amber-950 shadow-xs flex items-start gap-3 text-xs animate-in fade-in">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <span>Ketentuan Pelaksanaan Semester Pendek (Antara) FT UNBARI</span>
              <span className="px-2 py-0.2 bg-amber-200 text-amber-900 rounded font-mono text-[10px] font-bold">SN-Dikti</span>
            </h4>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              • <strong>Batas Beban:</strong> Maksimal <strong>9 SKS</strong> (atau maksimal 3 mata kuliah).<br />
              • <strong>Tujuan:</strong> Perbaikan nilai mata kuliah yang pernah ditempuh (remedial grade C, C-, D, E) untuk menaikkan IPK, atau percepatan studi (akselerasi).<br />
              • <strong>Sistem Perkuliahan:</strong> Kuliah intensif dipadatkan selama 4 s.d. 6 minggu dengan 16 kali pertemuan termasuk UTS dan UAS. Nilai baru otomatis menggantikan nilai lama pada KHS dan transkrip kumulatif.
            </p>
          </div>
        </div>
      )}

      {/* STUDENT SELECTOR STRIP (Quick Role Switcher) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Mahasiswa Terpilih ({selectedProdi.singkatan}):</span>
            <strong className="text-slate-900 font-bold text-xs">{currentStudent.nama} ({currentStudent.nim})</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-600 font-medium hidden sm:inline">Ganti Mahasiswa:</label>
          <select
            value={selectedNim}
            onChange={(e) => setSelectedNim(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-medium text-xs max-w-xs"
          >
            {prodiStudents.slice(0, 40).map(m => (
              <option key={m.id} value={m.nim}>
                {m.nim} - {m.nama} (Sem: {m.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex border-b border-slate-200 bg-white px-3 sm:px-4 rounded-xl shadow-xs gap-1 sm:gap-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('krs')}
          className={`py-3.5 px-2.5 sm:px-3 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'krs'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-700" />
          <span>KRS {selectedSemesterType}</span>
          {currentKrs.items.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
              selectedSemesterType === 'Pendek' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-blue-100 text-blue-900 font-bold'
            }`}>
              {currentKrs.totalSks} SKS
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('khs')}
          className={`py-3.5 px-2.5 sm:px-3 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'khs'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-700" />
          <span>KHS &amp; Evaluasi ({selectedSemesterType})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transkrip')}
          className={`py-3.5 px-2.5 sm:px-3 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'transkrip'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-purple-700" />
          <span>Transkrip Kumulatif</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('input_nilai')}
          className={`py-3.5 px-2.5 sm:px-3 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'input_nilai'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-700" />
          <span>Input DPNA Dosen ({selectedSemesterType})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dpa')}
          className={`py-3.5 px-2.5 sm:px-3 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'dpa'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-700" />
          <span>Verifikasi DPA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kurikulum')}
          className={`py-3.5 px-2.5 sm:px-3 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'kurikulum'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-700" />
          <span>Distribusi Kurikulum &amp; Kalender</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: KRS ONLINE MAHASISWA                             */}
      {/* ======================================================== */}
      {activeTab === 'krs' && (
        <div className="space-y-4">
          
          {/* Status & Beban SKS Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="border-r border-slate-100 pr-3">
              <span className="text-slate-500 block text-[11px]">Dosen Pembimbing Akademik (DPA):</span>
              <strong className="text-slate-900 font-bold block mt-0.5">{currentKrs.dosenPA}</strong>
              <span className="text-slate-400 text-[10px]">Fakultas Teknik UNBARI</span>
            </div>

            <div className="border-r border-slate-100 pr-3">
              <span className="text-slate-500 block text-[11px]">
                {selectedSemesterType === 'Pendek' ? 'Ketentuan Beban SKS:' : 'IPS Semester Lalu:'}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <strong className="text-slate-900 font-mono text-base font-bold">
                  {selectedSemesterType === 'Pendek' ? 'Semester Antara' : currentKrs.ipsLalu.toFixed(2)}
                </strong>
                <span className="text-slate-500 text-[10px]">
                  Beban Max: <strong className={selectedSemesterType === 'Pendek' ? 'text-amber-800 font-bold' : 'text-blue-900 font-bold'}>
                    {currentKrs.maxSksBeban} SKS
                  </strong>
                </span>
              </div>
            </div>

            <div className="border-r border-slate-100 pr-3">
              <span className="text-slate-500 block text-[11px]">Total SKS Terpilih:</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <strong className={`font-mono text-base font-bold ${
                  currentKrs.totalSks > currentKrs.maxSksBeban ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {currentKrs.totalSks} SKS
                </strong>
                <span className="text-slate-400 text-[10px]">dari max {currentKrs.maxSksBeban} SKS</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Status Persetujuan:</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] mt-1 ${
                  currentKrs.statusPersetujuan === 'Disetujui DPA'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : currentKrs.statusPersetujuan === 'Diajukan'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentKrs.statusPersetujuan === 'Disetujui DPA' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  {currentKrs.statusPersetujuan === 'Diajukan' && <Clock className="w-3 h-3 text-amber-600" />}
                  <span>{currentKrs.statusPersetujuan}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {currentKrs.statusPersetujuan === 'Draft' && (
                  <button
                    type="button"
                    onClick={handleAjukanKrs}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
                  >
                    Ajukan ke DPA
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenPrint('KRS')}
                  className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg"
                  title="Cetak Lembar KRS"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>
                Mata Kuliah Diambil · {currentPeriodeInfo.nama} ({currentKrs.items.length} MK)
              </span>
            </h3>

            <button
              type="button"
              onClick={() => {
                setIsRemedialOption(selectedSemesterType === 'Pendek');
                setShowAddMkModal(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg font-bold shadow-xs transition-colors ${
                selectedSemesterType === 'Pendek' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{selectedSemesterType === 'Pendek' ? '+ Ambil MK Semester Pendek' : '+ Tambah Mata Kuliah'}</span>
            </button>
          </div>

          {/* Table KRS Items */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {currentKrs.items.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">Belum ada mata kuliah yang diambil untuk {currentPeriodeInfo.nama}.</p>
                <p className="text-slate-400 text-[11px]">Klik "Tambah Mata Kuliah" untuk memilih dari kurikulum program studi.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5 text-center w-8">No</th>
                    <th className="px-3 py-2.5 w-20">Kode</th>
                    <th className="px-3 py-2.5">Nama Mata Kuliah</th>
                    <th className="px-3 py-2.5 text-center w-14">SKS</th>
                    <th className="px-3 py-2.5 text-center w-14">Kelas</th>
                    <th className="px-3 py-2.5">Jadwal &amp; Ruangan</th>
                    <th className="px-3 py-2.5">Dosen Pengampu</th>
                    {selectedSemesterType === 'Pendek' && (
                      <th className="px-3 py-2.5 text-center w-28">Keterangan SP</th>
                    )}
                    <th className="px-3 py-2.5 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentKrs.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{item.kodeMK}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">
                        {item.namaMK}
                        {item.isUlangRemedial && (
                          <span className="ml-2 px-1.5 py-0.2 bg-amber-100 text-amber-900 font-bold text-[9px] rounded">
                            Perbaikan Nilai (Lama: {item.nilaiAsalSebelumnya || 'D'})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-blue-900">{item.sks}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">
                          {item.kelas}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        <span className="block font-medium">{item.hari}, {item.jamMulai} - {item.jamSelesai}</span>
                        <span className="text-[10px] text-slate-400">{item.ruangan}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 font-medium">{item.dosen}</td>
                      {selectedSemesterType === 'Pendek' && (
                        <td className="px-3 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.isUlangRemedial ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.isUlangRemedial ? 'Remedial' : 'Akselerasi'}
                          </span>
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMkFromKrs(item.id, item.namaMK, item.sks)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus Mata Kuliah"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-950">
                    <td colSpan={3} className="px-4 py-3 text-right">TOTAL SKS TERPILIH:</td>
                    <td className="px-3 py-3 text-center text-sm font-mono text-blue-950">{currentKrs.totalSks} SKS</td>
                    <td colSpan={selectedSemesterType === 'Pendek' ? 5 : 4} className="px-3 py-3 text-slate-500 font-normal text-[11px]">
                      Sisa kuota SKS {selectedSemesterType === 'Pendek' ? 'Semester Pendek (maks. 9 SKS)' : 'semester ini'}:{' '}
                      <strong className="text-slate-800">{currentKrs.maxSksBeban - currentKrs.totalSks} SKS</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: KHS (KARTU HASIL STUDI)                           */}
      {/* ======================================================== */}
      {activeTab === 'khs' && (
        <div className="space-y-4">
          
          {/* Ringkasan Prestasi KHS Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Periode KHS Ditampilkan</span>
              <strong className="text-slate-900 font-bold text-sm">{currentKhs.semesterAkademik}</strong>
              <span className="text-slate-400 text-[10px] block">Semester {currentKhs.semester}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">SKS Semester / Kumulatif</span>
              <strong className="text-slate-900 font-mono text-sm">{currentKhs.sksSemester} / {currentKhs.sksKumulatif} SKS</strong>
              <span className="text-slate-400 text-[10px] block">Target Kelulusan: {selectedProdi.sksKelulusan} SKS</span>
            </div>

            <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
              <span className="text-blue-900 block text-[11px] font-bold">IPS (Indeks Prestasi Semester)</span>
              <strong className="text-blue-950 font-mono text-base font-black">{currentKhs.ips.toFixed(2)}</strong>
              <span className="text-emerald-700 text-[10px] font-semibold block">Skala Maksimal: 4.00</span>
            </div>

            <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-200 flex items-center justify-between">
              <div>
                <span className="text-indigo-900 block text-[11px] font-bold">IPK Kumulatif Terkini</span>
                <strong className="text-indigo-950 font-mono text-base font-black">{currentKhs.ipk.toFixed(2)}</strong>
                <span className="text-indigo-700 text-[10px] font-semibold block">
                  {currentKhs.ipk >= 3.50 ? 'Cum Laude' : 'Sangat Memuaskan'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenPrint('KHS')}
                className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak KHS</span>
              </button>
            </div>
          </div>

          {/* Table Nilai KHS */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-slate-800">
              <span>Hasil Studi: {currentKhs.semesterAkademik}</span>
              <span className="text-[11px] text-slate-500 font-normal">Standar 11 Skala Nilai Huruf Mutu UNBARI</span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-center w-8">No</th>
                  <th className="px-3 py-2 w-20">Kode</th>
                  <th className="px-3 py-2">Mata Kuliah</th>
                  <th className="px-3 py-2 text-center w-14">SKS</th>
                  <th className="px-3 py-2 text-center w-16">Hadir</th>
                  <th className="px-3 py-2 text-center w-16">Tugas</th>
                  <th className="px-3 py-2 text-center w-16">UTS</th>
                  <th className="px-3 py-2 text-center w-16">UAS</th>
                  <th className="px-3 py-2 text-center w-20">Nilai Akhir</th>
                  <th className="px-3 py-2 text-center w-14">Grade</th>
                  <th className="px-3 py-2 text-center w-14">Bobot</th>
                  <th className="px-3 py-2 text-center w-16">Mutu (KxM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentKhs.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2 font-mono font-bold text-slate-900">{item.kodeMK}</td>
                    <td className="px-3 py-2 font-semibold text-slate-900">
                      {item.namaMK}
                      {item.isPerbaikanNilai && (
                        <span className="ml-2 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded">
                          Nilai Diperbaiki dari {item.nilaiSebelumnya}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center font-mono font-bold">{item.sks}</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-600">{item.kehadiran}%</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-600">{item.tugas}</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-600">{item.uts}</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-600">{item.uas}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-slate-900">{item.nilaiAkhir.toFixed(1)}</td>
                    <td className="px-3 py-2 text-center font-bold text-blue-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                        {item.hurufMutu}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-slate-700">{item.bobot.toFixed(2)}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-emerald-800">{item.mutu.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TRANSKRIP AKADEMIK KUMULATIF                      */}
      {/* ======================================================== */}
      {activeTab === 'transkrip' && (
        <div className="space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Transkrip Nilai Akademik Kumulatif</h3>
              <p className="text-slate-500 text-[11px]">
                Rekapitulasi seluruh mata kuliah yang telah diselesaikan sejak Semester 1 hingga Semester 8 (termasuk nilai hasil Semester Pendek).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenPrint('TRANSKRIP')}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Transkrip Resmi A4</span>
              </button>
            </div>
          </div>

          {/* Table Transkrip */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 text-center w-8">No</th>
                  <th className="px-3 py-2.5 w-20">Kode</th>
                  <th className="px-3 py-2.5">Nama Mata Kuliah</th>
                  <th className="px-3 py-2.5 text-center w-14">Sem</th>
                  <th className="px-3 py-2.5 text-center w-14">SKS</th>
                  <th className="px-3 py-2.5 text-center w-14">Grade</th>
                  <th className="px-3 py-2.5 text-center w-14">Bobot</th>
                  <th className="px-3 py-2.5 text-center w-16">Mutu (KxM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_TRANSKRIP_SAMPLE.items.map((item) => (
                  <tr key={item.no} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2 text-center font-mono text-slate-400">{item.no}</td>
                    <td className="px-3 py-2 font-mono font-bold text-slate-900">{item.kodeMK}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{item.namaMK}</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-500">{item.semesterTempuh}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold">{item.sks}</td>
                    <td className="px-3 py-2 text-center font-bold text-blue-900">{item.hurufMutu}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.bobot.toFixed(2)}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-slate-900">{item.mutu.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: INPUT NILAI DOSEN & DPNA                          */}
      {/* ======================================================== */}
      {activeTab === 'input_nilai' && (
        <div className="space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Pilih Kelas &amp; Mata Kuliah ({selectedSemesterType}):</span>
                <select
                  value={selectedDpnaId}
                  onChange={(e) => setSelectedDpnaId(e.target.value)}
                  className="font-bold text-slate-900 border border-slate-300 rounded-lg p-1.5 bg-white"
                >
                  {dpnaRecords.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.kodeMK} - {d.namaMK} (Kelas {d.kelas}) · {d.semesterAkademik}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenPrint('DPNA')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak DPNA A4</span>
              </button>
            </div>
          </div>

          {/* Table Input Nilai Mahasiswa */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <span>Daftar Peserta: {currentDpna.namaMK} ({currentDpna.peserta.length} Mahasiswa)</span>
                <span className="text-[11px] font-normal text-slate-500">Bobot: Hadir (10%) · Tugas (20%) · UTS (30%) · UAS (40%)</span>
              </div>
              <span className="text-emerald-700 font-semibold text-[11px]">Kalkulasi 11 Skala Otomatis</span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-center">
                <tr>
                  <th className="px-3 py-2.5 w-8">No</th>
                  <th className="px-3 py-2.5 w-24">NIM</th>
                  <th className="px-3 py-2.5 text-left">Nama Mahasiswa</th>
                  <th className="px-3 py-2.5 w-20">Kehadiran (10%)</th>
                  <th className="px-3 py-2.5 w-20">Tugas (20%)</th>
                  <th className="px-3 py-2.5 w-20">UTS (30%)</th>
                  <th className="px-3 py-2.5 w-20">UAS (40%)</th>
                  <th className="px-3 py-2.5 w-24">Nilai Akhir</th>
                  <th className="px-3 py-2.5 w-16">Grade</th>
                  <th className="px-3 py-2.5 w-16">Bobot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center">
                {currentDpna.peserta.map((p, idx) => (
                  <tr key={p.nim} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-3 py-2 font-mono font-bold text-slate-900">{p.nim}</td>
                    <td className="px-3 py-2 text-left font-semibold text-slate-900">{p.nama}</td>
                    
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={p.kehadiran}
                        onChange={(e) => handleUpdateScore(p.nim, 'kehadiran', Number(e.target.value))}
                        className="w-16 border border-slate-300 rounded p-1 text-center font-mono font-medium"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={p.tugas}
                        onChange={(e) => handleUpdateScore(p.nim, 'tugas', Number(e.target.value))}
                        className="w-16 border border-slate-300 rounded p-1 text-center font-mono font-medium"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={p.uts}
                        onChange={(e) => handleUpdateScore(p.nim, 'uts', Number(e.target.value))}
                        className="w-16 border border-slate-300 rounded p-1 text-center font-mono font-medium"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={p.uas}
                        onChange={(e) => handleUpdateScore(p.nim, 'uas', Number(e.target.value))}
                        className="w-16 border border-slate-300 rounded p-1 text-center font-mono font-medium"
                      />
                    </td>

                    <td className="px-3 py-2 font-mono font-black text-slate-950 text-sm">
                      {p.nilaiAkhir.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-bold text-blue-900">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                        {p.hurufMutu}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-700 font-bold">
                      {p.bobot.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: VERIFIKASI & PERSETUJUAN DPA                      */}
      {/* ======================================================== */}
      {activeTab === 'dpa' && (
        <div className="space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-slate-900">Portal Dosen Pembimbing Akademik (DPA) · {currentPeriodeInfo.nama}</h3>
              <p className="text-slate-500 text-[11px]">Tinjau dan setujui Kartu Rencana Studi (KRS) mahasiswa bimbingan akademik Anda.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 font-semibold text-[11px]">
              DPA: {selectedProdi.kaprodi}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {krsRecords
              .filter(k => (k.tipeSemester || 'Ganjil') === selectedSemesterType)
              .map((krs) => (
                <div key={krs.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{krs.namaMahasiswa}</h4>
                      <span className="font-mono text-slate-500">{krs.nim} · Semester {krs.semesterMhs} ({krs.tipeSemester || 'Ganjil'})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      krs.statusPersetujuan === 'Disetujui DPA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : krs.statusPersetujuan === 'Diajukan'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {krs.statusPersetujuan}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Mata Kuliah Terpilih:</span>
                      <strong className="text-slate-900">{krs.items.length} MK ({krs.totalSks} SKS)</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Batas Maksimal SKS:</span>
                      <strong className="text-blue-900">{krs.maxSksBeban} SKS</strong>
                    </div>
                  </div>

                  {krs.catatanDpa && (
                    <p className="text-[11px] text-slate-600 italic">
                      "{krs.catatanDpa}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Diajukan: {krs.tanggalPengajuan || '-'}</span>
                    {krs.statusPersetujuan !== 'Disetujui DPA' ? (
                      <button
                        type="button"
                        onClick={() => handleApproveKrsByDpa(krs.nim, krs.tipeSemester || 'Ganjil')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui KRS Sekarang</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sudah Disetujui</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: KURIKULUM & KALENDER AKADEMIK                     */}
      {/* ======================================================== */}
      {activeTab === 'kurikulum' && (
        <div className="space-y-6">
          
          {/* Kalender Akademik Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-700" />
              <span>Kalender Akademik Universitas Batanghari (Ganjil, Genap &amp; Pendek)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {INITIAL_KALENDER_AKADEMIK.map((ev) => (
                <div key={ev.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      ev.status === 'Sedang Berlangsung' 
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : ev.status === 'Selesai'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ev.status}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">{ev.kategori}</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">{ev.kegiatan}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {ev.tanggalMulai} s.d {ev.tanggalSelesai}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribusi Kurikulum Mata Kuliah Berdasarkan Semester Ganjil, Genap & Pendek */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-cyan-700" />
                  <span>Struktur Kurikulum Resmi {selectedProdi.nama} FT UNBARI</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kurikulum OBE &amp; Berbasis Kompetensi (KBK) mencakup 8 Semester, Semester Pendek/Antara, dan Pilihan/Konsentrasi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-lg text-xs font-bold">
                  {prodiKurikulum.length} Total Mata Kuliah
                </span>
                <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-bold">
                  {selectedProdi.sksKelulusan} SKS Kelulusan
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={kurikulumSearch}
                    onChange={(e) => setKurikulumSearch(e.target.value)}
                    placeholder="Cari kode MK (UBP41..., MKK41..., BPM41...), nama mata kuliah, atau dosen..."
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  {kurikulumSearch && (
                    <button
                      type="button"
                      onClick={() => setKurikulumSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Ganjil / Genap Switch */}
                <div className="flex items-center gap-1 bg-white p-1 border border-slate-300 rounded-lg self-start">
                  <button
                    type="button"
                    onClick={() => setKurikulumTypeFilter('all')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      kurikulumTypeFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua Tipe
                  </button>
                  <button
                    type="button"
                    onClick={() => setKurikulumTypeFilter('Ganjil')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      kurikulumTypeFilter === 'Ganjil' ? 'bg-blue-700 text-white' : 'text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    Ganjil (Gasal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKurikulumTypeFilter('Genap')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      kurikulumTypeFilter === 'Genap' ? 'bg-emerald-700 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Genap
                  </button>
                </div>
              </div>

              {/* Semester Pills (1 to 8) */}
              <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium mr-1">Semester:</span>
                <button
                  type="button"
                  onClick={() => setKurikulumSemesterFilter(0)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                    kurikulumSemesterFilter === 0 ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Semua ({prodiKurikulum.length})
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                  const countInSem = prodiKurikulum.filter(m => m.semester === sem).length;
                  const isGanjilSem = sem % 2 === 1;
                  return (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => setKurikulumSemesterFilter(sem)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                        kurikulumSemesterFilter === sem
                          ? isGanjilSem
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Sem {sem} ({countInSem})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List Mata Kuliah */}
            {(() => {
              const filteredKurikulum = prodiKurikulum.filter(mk => {
                if (kurikulumSemesterFilter > 0 && mk.semester !== kurikulumSemesterFilter) return false;
                if (kurikulumTypeFilter === 'Ganjil' && mk.semester % 2 !== 1) return false;
                if (kurikulumTypeFilter === 'Genap' && mk.semester % 2 !== 0) return false;
                if (kurikulumSearch.trim()) {
                  const q = kurikulumSearch.toLowerCase();
                  return (
                    mk.kodeMK.toLowerCase().includes(q) ||
                    mk.namaMK.toLowerCase().includes(q) ||
                    (mk.dosenPengampu && mk.dosenPengampu.toLowerCase().includes(q)) ||
                    (mk.jenis && mk.jenis.toLowerCase().includes(q))
                  );
                }
                return true;
              });

              const totalFilteredSks = filteredKurikulum.reduce((sum, m) => sum + m.sks, 0);

              if (filteredKurikulum.length === 0) {
                return (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 font-bold">Tidak ada mata kuliah yang cocok dengan filter atau kata kunci.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setKurikulumSearch('');
                        setKurikulumSemesterFilter(0);
                        setKurikulumTypeFilter('all');
                      }}
                      className="mt-2 text-blue-700 font-bold hover:underline text-xs"
                    >
                      Reset Filter Kurikulum
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Menampilkan <strong>{filteredKurikulum.length}</strong> mata kuliah
                      {kurikulumSemesterFilter > 0 && ` pada Semester ${kurikulumSemesterFilter}`}
                      {kurikulumTypeFilter !== 'all' && ` (${kurikulumTypeFilter})`}
                    </span>
                    <span>Total Beban: <strong className="text-blue-900 font-mono text-xs">{totalFilteredSks} SKS</strong></span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredKurikulum.map((mk) => {
                      const isGanjil = mk.semester % 2 === 1;
                      return (
                        <div key={mk.id} className="border border-slate-200 rounded-xl p-3.5 bg-white hover:border-blue-400 hover:shadow-xs transition-all space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-bold text-blue-900 text-xs bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                  {mk.kodeMK}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  isGanjil ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  Semester {mk.semester} ({isGanjil ? 'Ganjil' : 'Genap'})
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  mk.jenis === 'Wajib Program Studi'
                                    ? 'bg-purple-100 text-purple-800'
                                    : mk.jenis === 'Wajib Fakultas'
                                    ? 'bg-amber-100 text-amber-800'
                                    : mk.jenis === 'Pilihan / MBKM'
                                    ? 'bg-teal-100 text-teal-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {mk.jenis}
                                </span>
                              </div>
                              <h4 className="text-slate-900 font-bold text-xs mt-1.5 leading-snug">{mk.namaMK}</h4>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 font-bold font-mono text-xs block">
                                {mk.sks} SKS
                              </span>
                              {(mk.sksTeori > 0 || mk.sksPraktikum > 0) && (
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {mk.sksTeori}T / {mk.sksPraktikum}P
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {mk.deskripsi}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                            <span className="truncate max-w-[220px]">
                              Dosen: <strong className="text-slate-700">{mk.dosenPengampu || 'Tim Dosen FT UNBARI'}</strong>
                            </span>
                            {mk.prasyarat && mk.prasyarat.length > 0 ? (
                              <span className="text-amber-700 font-medium">
                                Prasyarat: {mk.prasyarat.join(', ')}
                              </span>
                            ) : (
                              <span className="text-slate-400">Tanpa Prasyarat</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* MODAL TAMBAH MATA KULIAH KE KRS */}
      {showAddMkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[88vh]">
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-300" />
                <div>
                  <h3 className="text-sm font-bold">
                    Pilih Mata Kuliah {currentPeriodeInfo.nama} ({selectedProdi.singkatan})
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    Batas beban semester: <strong>{currentKrs.maxSksBeban} SKS</strong> · Sisa kuota: <strong>{currentKrs.maxSksBeban - currentKrs.totalSks} SKS</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMkModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Khusus Semester Pendek: Pengaturan Remedial vs Akselerasi */}
            {selectedSemesterType === 'Pendek' && (
              <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 shrink-0 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">Opsi Pengambilan Semester Pendek:</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={isRemedialOption}
                        onChange={() => setIsRemedialOption(true)}
                        className="text-amber-600"
                      />
                      <span className="font-semibold text-amber-900">Perbaikan Nilai (Remedial)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isRemedialOption}
                        onChange={() => setIsRemedialOption(false)}
                        className="text-amber-600"
                      />
                      <span className="font-semibold text-amber-900">Akselerasi (MK Baru)</span>
                    </label>
                  </div>
                </div>

                {isRemedialOption && (
                  <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                    <span className="text-amber-900 text-[11px]">Nilai Asal Yang Ingin Diperbaiki:</span>
                    <select
                      value={nilaiAsalInput}
                      onChange={(e) => setNilaiAsalInput(e.target.value)}
                      className="border border-amber-300 rounded px-2 py-0.5 bg-white font-bold text-amber-950"
                    >
                      <option value="D">Nilai D (1.00) - Kurang</option>
                      <option value="D+">Nilai D+ (1.50) - Kurang Bersyarat</option>
                      <option value="C-">Nilai C- (1.75) - Kurang Cukup</option>
                      <option value="C">Nilai C (2.00) - Cukup</option>
                      <option value="E">Nilai E (0.00) - Gagal</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0 flex gap-3 text-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchMkQuery}
                  onChange={(e) => setSearchMkQuery(e.target.value)}
                  placeholder="Cari Kode atau Nama Mata Kuliah..."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <select
                value={selectedSemesterFilter}
                onChange={(e) => setSelectedSemesterFilter(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
              >
                <option value={0}>Semua Semester (1–8)</option>
                <option value={1}>Semester Ganjil (1, 3, 5, 7)</option>
                <option value={2}>Semester Genap (2, 4, 6, 8)</option>
              </select>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto text-xs flex-1">
              {prodiKurikulum
                .filter(mk => {
                  const matchSearch = mk.namaMK.toLowerCase().includes(searchMkQuery.toLowerCase()) || 
                                      mk.kodeMK.toLowerCase().includes(searchMkQuery.toLowerCase());
                  let matchSem = true;
                  if (selectedSemesterFilter === 1) {
                    matchSem = mk.semester % 2 === 1;
                  } else if (selectedSemesterFilter === 2) {
                    matchSem = mk.semester % 2 === 0;
                  }
                  return matchSearch && matchSem;
                })
                .map(mk => {
                  const alreadyTaken = currentKrs.items.some(i => i.kodeMK === mk.kodeMK);
                  const willExceed = currentKrs.totalSks + mk.sks > currentKrs.maxSksBeban;

                  return (
                    <div 
                      key={mk.id}
                      className="p-3 border border-slate-200 rounded-xl hover:border-blue-300 flex items-center justify-between gap-3 bg-white"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-900">{mk.kodeMK}</span>
                          <span className="font-bold text-slate-900">{mk.namaMK}</span>
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] text-slate-600 font-mono">
                            Sem: {mk.semester} ({mk.semester % 2 === 1 ? 'Ganjil' : 'Genap'})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {mk.sks} SKS · Dosen: {mk.dosenPengampu}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={alreadyTaken || willExceed}
                        onClick={() => handleAddMkToKrs(mk)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors ${
                          alreadyTaken
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : willExceed
                            ? 'bg-rose-50 text-rose-500 border border-rose-200 cursor-not-allowed'
                            : selectedSemesterType === 'Pendek'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                            : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                        }`}
                      >
                        {alreadyTaken ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Sudah Diambil</span>
                          </>
                        ) : willExceed ? (
                          <span>Melebihi SKS</span>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ambil ({mk.sks} SKS)</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* PRINT MODAL SIAKAD */}
      <SiakadPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        type={printType}
        selectedProdi={selectedProdi}
        krsData={currentKrs}
        khsData={currentKhs}
        transkripData={INITIAL_TRANSKRIP_SAMPLE}
        dpnaData={currentDpna}
        onShowToast={onShowToast}
      />

    </div>
  );
};
