import React, { useState } from 'react';
import { 
  GraduationCap, 
  Award, 
  Search, 
  Filter, 
  UserPlus, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  X, 
  Shirt, 
  BookOpen, 
  Calendar, 
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Trash2,
  Edit3,
  Sliders
} from 'lucide-react';
import { 
  YudisiumRecord, 
  PeriodeYudisium, 
  ProgramStudiInfo, 
  Mahasiswa, 
  Dosen,
  PredikatKelulusan,
  StatusVerifikasiYudisium,
  StatusWisuda,
  UkuranToga
} from '../types/index';
import { YudisiumDetailModal } from './YudisiumDetailModal';
import { YudisiumPrintModal, YudisiumDocType } from './YudisiumPrintModal';
import { SkNumberBuilderModal } from './SkNumberBuilderModal';
import { getRomanMonth } from '../utils/skNumberHelper';
import { exportYudisiumToCsv } from '../utils/exportHelper';
import { tentukanPredikatKelulusan } from '../data/mockYudisiumData';
import { DEKAN_FAKULTAS_TEKNIK } from '../data/mockData';
import { STAFF_TU_FAKULTAS } from '../data/mockTataUsahaData';

interface YudisiumWisudaViewProps {
  yudisiumList: YudisiumRecord[];
  periodeList: PeriodeYudisium[];
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  selectedProdi: ProgramStudiInfo;
  onAddYudisium: (record: YudisiumRecord) => void;
  onUpdateYudisium: (record: YudisiumRecord) => void;
  onDeleteYudisium: (id: string) => void;
  onAddPeriode: (periode: PeriodeYudisium) => void;
  onUpdatePeriode?: (periode: PeriodeYudisium) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onShowToast: (msg: string) => void;
}

export const YudisiumWisudaView: React.FC<YudisiumWisudaViewProps> = ({
  yudisiumList,
  periodeList,
  mahasiswaList,
  dosenList,
  selectedProdi,
  onAddYudisium,
  onUpdateYudisium,
  onDeleteYudisium,
  onAddPeriode,
  onUpdatePeriode,
  onRequestConfirm,
  onShowToast
}) => {
  // Navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'peserta' | 'wisuda_toga' | 'periode_pin'>('peserta');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState<'current' | 'all' | 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3'>('current');
  const [filterVerifikasi, setFilterVerifikasi] = useState<string>('all');
  const [filterPredikat, setFilterPredikat] = useState<string>('all');
  const [filterStatusWisuda, setFilterStatusWisuda] = useState<string>('all');

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<YudisiumRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<YudisiumDocType>('SKL');
  const [showAddModal, setShowAddModal] = useState(false);

  // SK Number Builder Modal state
  const [selectedPeriodeForSk, setSelectedPeriodeForSk] = useState<PeriodeYudisium | null>(null);
  const [showStandaloneSkBuilder, setShowStandaloneSkBuilder] = useState(false);
  const [standaloneSkNumber, setStandaloneSkNumber] = useState('085/SK-DEK/FT-UNBARI/VIII/2026');

  // New Registration State
  const [newReg, setNewReg] = useState<{
    mahasiswaId: string;
    nim: string;
    nama: string;
    jenisKelamin: 'L' | 'P';
    ipk: number;
    sksLulus: number;
    lamaStudi: string;
    judulSkripsi: string;
    dosenPembimbing1: string;
    dosenPembimbing2: string;
    ukuranToga: UkuranToga;
    periodeWisuda: string;
  }>({
    mahasiswaId: '',
    nim: '',
    nama: '',
    jenisKelamin: 'L',
    ipk: 3.50,
    sksLulus: selectedProdi.sksKelulusan,
    lamaStudi: '4 Tahun 0 Bulan',
    judulSkripsi: '',
    dosenPembimbing1: dosenList[0]?.namaLengkap || '',
    dosenPembimbing2: dosenList[1]?.namaLengkap || '',
    ukuranToga: 'L',
    periodeWisuda: 'Wisuda Ke-56 UNBARI (Oktober 2026)'
  });

  // Filtered List
  const filteredRecords = yudisiumList.filter((r) => {
    const matchProdi = 
      filterProdi === 'all'
        ? true
        : filterProdi === 'current'
          ? r.prodiId === selectedProdi.id
          : r.prodiId === filterProdi;

    const matchSearch = 
      r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nim.includes(searchQuery) ||
      r.judulSkripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.nomorIjazahNasional && r.nomorIjazahNasional.includes(searchQuery)) ||
      (r.nomorSkYudisium && r.nomorSkYudisium.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchVerifikasi = filterVerifikasi === 'all' || r.statusVerifikasi === filterVerifikasi;
    const matchPredikat = filterPredikat === 'all' || r.predikat === filterPredikat;
    const matchWisuda = filterStatusWisuda === 'all' || r.statusWisuda === filterStatusWisuda;

    return matchProdi && matchSearch && matchVerifikasi && matchPredikat && matchWisuda;
  });

  // KPI Metrics Calculation
  const prodiYudisium = yudisiumList.filter(r => r.prodiId === selectedProdi.id);
  const totalLulusan = prodiYudisium.length;
  const cumLaudeCount = prodiYudisium.filter(r => r.predikat.includes('Cum Laude')).length;
  const avgIpk = prodiYudisium.length > 0 
    ? (prodiYudisium.reduce((acc, r) => acc + r.ipk, 0) / prodiYudisium.length).toFixed(2) 
    : '0.00';
  const disahkanCount = prodiYudisium.filter(r => r.statusVerifikasi === 'Disahkan Dekan').length;
  const togaDiambilCount = prodiYudisium.filter(r => r.statusWisuda === 'Toga Diambil').length;
  const bestGraduate = prodiYudisium.find(r => r.isLulusanTerbaik) || prodiYudisium.slice().sort((a, b) => b.ipk - a.ipk)[0];

  // Distribution of Toga sizes
  const togaCounts: Record<UkuranToga, number> = {
    S: prodiYudisium.filter(r => r.ukuranToga === 'S').length,
    M: prodiYudisium.filter(r => r.ukuranToga === 'M').length,
    L: prodiYudisium.filter(r => r.ukuranToga === 'L').length,
    XL: prodiYudisium.filter(r => r.ukuranToga === 'XL').length,
    XXL: prodiYudisium.filter(r => r.ukuranToga === 'XXL').length
  };

  const handleSelectStudentForReg = (studentNim: string) => {
    const student = mahasiswaList.find(m => m.nim === studentNim);
    if (!student) return;
    setNewReg(prev => ({
      ...prev,
      mahasiswaId: student.id,
      nim: student.nim,
      nama: student.nama,
      jenisKelamin: student.jenisKelamin || 'L',
      ipk: student.ipk,
      sksLulus: student.sksLulus,
      judulSkripsi: student.judulTA || 'Perencanaan Struktur Bangunan Tahan Gempa di Wilayah Provinsi Jambi'
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReg.nim || !newReg.nama) {
      onShowToast('Harap lengkapi NIM dan Nama calon yudisium.');
      return;
    }

    const autoPredikat = tentukanPredikatKelulusan(newReg.ipk);
    const newRecord: YudisiumRecord = {
      id: `YUD-${Date.now().toString().slice(-4)}`,
      prodiId: selectedProdi.id,
      mahasiswaId: newReg.mahasiswaId || `MHS-${Date.now().toString().slice(-4)}`,
      nim: newReg.nim,
      nama: newReg.nama,
      jenisKelamin: newReg.jenisKelamin,
      angkatan: 2021,
      jenjang: selectedProdi.jenjang,
      programStudi: selectedProdi.nama,
      ipk: newReg.ipk,
      sksLulus: newReg.sksLulus,
      lamaStudi: newReg.lamaStudi,
      predikat: autoPredikat,
      gelarLulusan: selectedProdi.jenjang === 'S1' ? 'S.T.' : 'A.Md.T.',
      tanggalYudisium: new Date().toISOString().slice(0, 10),
      nomorSkYudisium: periodeList.find(p => p.namaPeriode === newReg.periodeWisuda)?.nomorSkDekan || `085/SK-DEK/FT-UNBARI/${getRomanMonth(new Date())}/${new Date().getFullYear()}`,
      nomorIjazahNasional: `01004${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`,
      nomorSeriIjazah: `FT-UNBARI-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      nomorTranskrip: `TR-FT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      judulSkripsi: newReg.judulSkripsi,
      dosenPembimbing1: newReg.dosenPembimbing1,
      dosenPembimbing2: newReg.dosenPembimbing2,
      statusVerifikasi: 'Menunggu Verifikasi',
      syaratKelengkapan: {
        bebasPustaka: true,
        bebasLab: true,
        bebasKeuangan: false,
        bebasPlagiarisme: true,
        unggahJurnalRepository: false,
        fotoIjazah: true
      },
      statusWisuda: 'Belum Terdaftar',
      periodeWisuda: newReg.periodeWisuda,
      ukuranToga: newReg.ukuranToga
    };

    onAddYudisium(newRecord);
    setShowAddModal(false);
    onShowToast(`Pendaftaran yudisium untuk ${newRecord.nama} berhasil ditambahkan!`);
  };

  const handleSaveSkForPeriode = (newSkNumber: string, applyToAllGraduates: boolean) => {
    if (!selectedPeriodeForSk) return;
    const updatedPeriode: PeriodeYudisium = {
      ...selectedPeriodeForSk,
      nomorSkDekan: newSkNumber
    };
    if (onUpdatePeriode) {
      onUpdatePeriode(updatedPeriode);
    }
    
    if (applyToAllGraduates) {
      const affectedRecords = yudisiumList.filter(
        (r) => r.periodeWisuda === selectedPeriodeForSk.namaPeriode
      );
      affectedRecords.forEach((rec) => {
        onUpdateYudisium({
          ...rec,
          nomorSkYudisium: newSkNumber
        });
      });
      onShowToast(`Nomor SK Dekan untuk ${selectedPeriodeForSk.namaPeriode} diperbarui & diterapkan ke ${affectedRecords.length} calon wisudawan.`);
    } else {
      onShowToast(`Nomor SK Dekan untuk ${selectedPeriodeForSk.namaPeriode} berhasil diperbarui: ${newSkNumber}`);
    }
  };

  const handleOpenPrintSkl = (record: YudisiumRecord) => {
    setSelectedRecord(record);
    setPrintDocType('SKL');
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintBeritaAcara = () => {
    setPrintDocType('BERITA_ACARA');
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintSkDekan = () => {
    setPrintDocType('SK_DEKAN');
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintBebasTanggungan = (record: YudisiumRecord) => {
    setSelectedRecord(record);
    setPrintDocType('BEBAS_TANGGUNGAN');
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintDaftarWisuda = () => {
    setPrintDocType('DAFTAR_WISUDA');
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintTandaTerimaToga = (record: YudisiumRecord) => {
    setSelectedRecord(record);
    setPrintDocType('TANDA_TERIMA_TOGA');
    setIsPrintModalOpen(true);
  };

  const handleExportCsv = () => {
    exportYudisiumToCsv(filteredRecords, selectedProdi.nama);
    onShowToast(`Data yudisium ${filteredRecords.length} calon wisudawan berhasil diekspor ke CSV.`);
  };

  const handleQuickApproveDekan = (r: YudisiumRecord) => {
    const defaultSk = periodeList.find(p => p.namaPeriode === r.periodeWisuda)?.nomorSkDekan || `085/SK-DEK/FT-UNBARI/${getRomanMonth(new Date())}/${new Date().getFullYear()}`;
    onRequestConfirm(
      'Pengesahan Kelulusan oleh Dekan FT UNBARI',
      `Sahkan kelulusan ${r.nama} (NIM: ${r.nim}) dengan predikat ${r.predikat} dan terbitkan penomoran SK Dekan?`,
      () => {
        const updated: YudisiumRecord = {
          ...r,
          statusVerifikasi: 'Disahkan Dekan',
          nomorSkYudisium: r.nomorSkYudisium || defaultSk,
          nomorIjazahNasional: r.nomorIjazahNasional || `01004${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`,
          nomorSeriIjazah: r.nomorSeriIjazah || `FT-UNBARI-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
        };
        onUpdateYudisium(updated);
        onShowToast(`Kelulusan ${r.nama} telah resmi disahkan Dekan Fakultas Teknik!`);
      }
    );
  };

  const handleDeleteRecord = (id: string, nama: string) => {
    onRequestConfirm(
      'Hapus Data Peserta Yudisium',
      `Apakah Anda yakin ingin menghapus data yudisium ${nama}? Data ini dapat didaftarkan kembali jika diperlukan.`,
      () => {
        onDeleteYudisium(id);
        onShowToast(`Data yudisium ${nama} berhasil dihapus.`);
      }
    );
  };

  return (
    <div className="space-y-6">

      {/* TOP DEKAN & KAPRODI HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
              <span>Modul Pengelolaan Yudisium & Wisuda FT UNBARI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Penetapan Kelulusan & Registrasi Wisuda
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              Otorisasi penetapan yudisium oleh Dekan Fakultas Teknik ({DEKAN_FAKULTAS_TEKNIK.nama}), verifikasi syarat bebas beban perpustakaan & lab, penerbitan PIN Ijazah Nasional, dan distribusi atribut wisuda Universitas Batanghari.
            </p>
          </div>

          {/* Quick Action Buttons for Dean / Head of Dept */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenPrintBeritaAcara}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 rounded-xl shadow-xs transition-colors"
              title="Cetak Berita Acara Rapat Penetapan Kelulusan Yudisium"
            >
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>Berita Acara</span>
            </button>
            <button
              type="button"
              onClick={handleOpenPrintSkDekan}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-950 bg-white hover:bg-indigo-50 rounded-xl shadow-xs transition-colors"
              title="Cetak Surat Keputusan (SK) Dekan Penetapan Kelulusan & Gelar"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
              <span>SK Dekan Yudisium</span>
            </button>
            <button
              type="button"
              onClick={handleOpenPrintDaftarWisuda}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors"
              title="Cetak Buku Rekapitulasi Nominasi Wisudawan FT UNBARI"
            >
              <Award className="w-3.5 h-3.5 text-yellow-300" />
              <span>Buku Wisuda</span>
            </button>
          </div>
        </div>

        {/* Spotlight: Lulusan Terbaik Banner */}
        {bestGraduate && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white/5 p-3 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-amber-300 font-bold">Lulusan Terbaik Program Studi:</span>{' '}
                <strong className="text-white uppercase">{bestGraduate.nama}</strong> ({bestGraduate.nim}) · IPK <strong className="font-mono text-amber-300">{bestGraduate.ipk.toFixed(2)}</strong> ({bestGraduate.predikat})
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenPrintSkl(bestGraduate)}
              className="text-blue-200 hover:text-white underline text-[11px] font-semibold flex items-center gap-1 self-end sm:self-center"
            >
              <span>Cetak SKL Lulusan Terbaik</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Calon Sarjana / Ahli Madya</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {totalLulusan} <span className="text-xs font-normal text-slate-400">Mahasiswa</span>
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>{selectedProdi.singkatan}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Predikat Cum Laude</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-2">
            {cumLaudeCount} <span className="text-xs font-normal text-slate-400">Orang</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            IPK &gt; 3.50 &amp; Masa Studi &le; 4 Thn
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rata-rata IPK Lulusan</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-2">
            {avgIpk} <span className="text-xs font-normal text-slate-400">/ 4.00</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Standar Akreditasi Baik Sekali
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Disahkan Dekan FT</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono mt-2">
            {disahkanCount} <span className="text-xs font-normal text-slate-400">/ {totalLulusan}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {togaDiambilCount} Toga Wisuda Telah Diserahkan
          </div>
        </div>
      </div>

      {/* LOKET PELAYANAN AKADEMIK & IJAZAH STAFF CALLOUT */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="text-slate-800 font-semibold">
              Loket Pelayanan Akademik &amp; Ijazah FT UNBARI: <strong className="text-blue-900 font-bold">{STAFF_TU_FAKULTAS.stafPelayananAkademikDanIjazah}</strong>
            </div>
            <p className="text-[11px] text-slate-500">
              Verifikator berkas syarat yudisium, pencetakan Surat Keterangan Lulus (SKL), pendaftaran wisuda, serah terima toga, dan legalisir transkrip/ijazah.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-200 text-blue-800 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Loket Aktif · Ruang TU Lt. 1</span>
          </span>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs gap-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('peserta')}
          className={`py-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'peserta'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-blue-700" />
          <span>Peserta Yudisium &amp; Kelulusan ({filteredRecords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('wisuda_toga')}
          className={`py-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'wisuda_toga'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shirt className="w-4 h-4 text-indigo-700" />
          <span>Pengelolaan Wisuda &amp; Distribusi Toga</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('periode_pin')}
          className={`py-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeSubTab === 'periode_pin'
              ? 'border-blue-700 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span>Periode Yudisium &amp; PIN Ijazah Nasional</span>
        </button>
      </div>

      {/* TAB 1: DAFTAR PESERTA YUDISIUM */}
      {activeSubTab === 'peserta' && (
        <div className="space-y-4">

          {/* Search, Filter & Actions Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari NIM, Nama Lulusan, Judul Skripsi, No PIN Dikti..."
                  className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                  title="Ekspor CSV untuk pelaporan Feeder PDDIKTI PIN & Ijazah"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Export CSV PDDIKTI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftarkan Calon Yudisium</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <select
                value={filterProdi}
                onChange={(e) => setFilterProdi(e.target.value as any)}
                className="font-medium border border-blue-200 rounded-lg px-2.5 py-1.5 bg-blue-50/60 text-blue-900"
              >
                <option value="current">Prodi Aktif: {selectedProdi.singkatan}</option>
                <option value="all">Semua Prodi (Sipil, Lingkungan, Listrik D3)</option>
                <option value="SIPIL">S1 Teknik Sipil</option>
                <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
                <option value="LISTRIK_D3">D3 Teknik Listrik</option>
              </select>

              <select
                value={filterVerifikasi}
                onChange={(e) => setFilterVerifikasi(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
              >
                <option value="all">Semua Status Validasi</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Berkas Lengkap">Berkas Lengkap</option>
                <option value="Disahkan Dekan">Disahkan Dekan</option>
              </select>

              <select
                value={filterPredikat}
                onChange={(e) => setFilterPredikat(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
              >
                <option value="all">Semua Predikat Kelulusan</option>
                <option value="Dengan Pujian (Cum Laude)">Dengan Pujian (Cum Laude)</option>
                <option value="Sangat Memuaskan">Sangat Memuaskan</option>
                <option value="Memuaskan">Memuaskan</option>
              </select>

              <select
                value={filterStatusWisuda}
                onChange={(e) => setFilterStatusWisuda(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
              >
                <option value="all">Semua Status Wisuda</option>
                <option value="Belum Terdaftar">Belum Terdaftar</option>
                <option value="Terdaftar Wisuda">Terdaftar Wisuda</option>
                <option value="Toga Diambil">Toga Diambil</option>
                <option value="Selesai Wisuda">Selesai Wisuda</option>
              </select>

              {(filterVerifikasi !== 'all' || filterPredikat !== 'all' || filterStatusWisuda !== 'all' || searchQuery || filterProdi !== 'current') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterVerifikasi('all');
                    setFilterPredikat('all');
                    setFilterStatusWisuda('all');
                    setFilterProdi('current');
                    setSearchQuery('');
                  }}
                  className="text-red-600 hover:text-red-800 ml-1 font-medium underline text-[11px]"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Table of Candidates */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-4">NIM &amp; Calon Lulusan</th>
                    <th className="py-3 px-3">Program Studi</th>
                    <th className="py-3 px-3 text-right">IPK / SKS</th>
                    <th className="py-3 px-3">Predikat Kelulusan</th>
                    <th className="py-3 px-3 text-center">Bebas Beban</th>
                    <th className="py-3 px-3">Status Dekan</th>
                    <th className="py-3 px-3">PIN Ijazah Dikti</th>
                    <th className="py-3 px-4 text-center">Aksi Dekan &amp; Kaprodi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">Tidak ada peserta yudisium yang sesuai filter.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Gunakan tombol "Daftarkan Calon Yudisium" untuk menambahkan peserta baru.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, idx) => {
                      const allSyarat = Object.values(r.syaratKelengkapan).every(v => v === true);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Row Number */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-500 text-xs">
                            {idx + 1}
                          </td>

                          {/* NIM & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900">{r.nama}</span>
                              <span className={`text-[10px] font-bold px-1 rounded font-mono ${r.jenisKelamin === 'L' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-pink-50 text-pink-700 border border-pink-200'}`}>
                                {r.jenisKelamin}
                              </span>
                              {r.isLulusanTerbaik && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                  <Award className="w-2.5 h-2.5 text-amber-600" />
                                  Terbaik
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{r.nim}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-600 font-sans">{r.lamaStudi}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 italic truncate max-w-xs mt-0.5" title={r.judulSkripsi}>
                              "{r.judulSkripsi}"
                            </div>
                          </td>

                          {/* Program Studi */}
                          <td className="py-3 px-3">
                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {r.programStudi}
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Gelar: {r.gelarLulusan}
                            </div>
                          </td>

                          {/* IPK / SKS */}
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            <div className="text-sm text-slate-900">{r.ipk.toFixed(2)}</div>
                            <div className="text-[10px] font-normal text-slate-400">{r.sksLulus} SKS</div>
                          </td>

                          {/* Predikat */}
                          <td className="py-3 px-3">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                              r.predikat.includes('Cum Laude')
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : r.predikat === 'Sangat Memuaskan'
                                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}>
                              {r.predikat}
                            </span>
                          </td>

                          {/* Bebas Beban Checklist Summary */}
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center gap-1 text-[11px]">
                              {allSyarat ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Lengkap (6/6)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  Belum Lengkap
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status Dekan */}
                          <td className="py-3 px-3">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                              r.statusVerifikasi === 'Disahkan Dekan'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : r.statusVerifikasi === 'Berkas Lengkap'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {r.statusVerifikasi}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(r.tanggalYudisium).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>

                          {/* PIN Ijazah Dikti */}
                          <td className="py-3 px-3 font-mono text-[11px]">
                            {r.nomorIjazahNasional ? (
                              <div className="text-emerald-800 font-bold">
                                {r.nomorIjazahNasional}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">Menunggu SK</span>
                            )}
                            <div className="text-[10px] text-slate-500">
                              {r.nomorSeriIjazah || '-'}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => { setSelectedRecord(r); setIsDetailModalOpen(true); }}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                              >
                                Verifikasi
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenPrintSkl(r)}
                                title="Cetak Surat Keterangan Lulus (SKL) Resmi"
                                className="p-1 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenPrintBebasTanggungan(r)}
                                title="Cetak Surat Keterangan Bebas Tanggungan & Syarat Yudisium"
                                className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                              </button>

                              {r.statusVerifikasi !== 'Disahkan Dekan' && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickApproveDekan(r)}
                                  title="Sahkan Kelulusan (Dekan FT)"
                                  className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteRecord(r.id, r.nama)}
                                title="Hapus Data Peserta Yudisium"
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PUSAT REKAP WISUDA & DISTRIBUSI TOGA */}
      {activeSubTab === 'wisuda_toga' && (
        <div className="space-y-6">

          {/* Size Distribution Cards for Vendor & Faculty */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-blue-700" />
                  Rekapitulasi Kebutuhan Ukuran Baju Toga Wisudawan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribusi data ukuran untuk pemesanan vendor konveksi dan persiapan panitia wisuda FT UNBARI
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenPrintDaftarWisuda}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-blue-700" />
                <span>Cetak Rekap Atribut Wisuda</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(['S', 'M', 'L', 'XL', 'XXL'] as UkuranToga[]).map((sz) => (
                <div key={sz} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-xs font-bold text-slate-500">Ukuran {sz}</span>
                  <div className="text-2xl font-black text-blue-950 font-mono mt-1">
                    {togaCounts[sz]}
                  </div>
                  <span className="text-[10px] text-slate-400">Pcs Jubah Toga</span>
                </div>
              ))}
            </div>
          </div>

          {/* Atribut Checklist Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Serah Terima Atribut Wisuda &amp; Undangan Orang Tua
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">NIM &amp; Wisudawan</th>
                    <th className="py-2.5 px-3">Program Studi</th>
                    <th className="py-2.5 px-3 text-center">Ukuran Toga</th>
                    <th className="py-2.5 px-3">Periode Wisuda</th>
                    <th className="py-2.5 px-3">Status Pengambilan</th>
                    <th className="py-2.5 px-3 text-center">Tandai Ambil Toga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prodiYudisium.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {r.nama}
                        <div className="text-[10px] font-mono text-slate-500">{r.nim}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{r.programStudi}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-800">
                        {r.ukuranToga}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{r.periodeWisuda}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          r.statusWisuda === 'Toga Diambil'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.statusWisuda === 'Terdaftar Wisuda'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.statusWisuda}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const newStatus: StatusWisuda = r.statusWisuda === 'Toga Diambil' ? 'Terdaftar Wisuda' : 'Toga Diambil';
                              onUpdateYudisium({ ...r, statusWisuda: newStatus });
                              onShowToast(`Status toga ${r.nama} diubah menjadi: ${newStatus}`);
                            }}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                              r.statusWisuda === 'Toga Diambil'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {r.statusWisuda === 'Toga Diambil' ? '✓ Sudah Ambil' : 'Serahkan Toga'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenPrintTandaTerimaToga(r)}
                            title="Cetak Formulir Tanda Terima Toga & Undangan Wisuda"
                            className="p-1 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: PERIODE YUDISIUM & PIN IJAZAH */}
      {activeSubTab === 'periode_pin' && (
        <div className="space-y-6">

          {/* BANNER STANDAR FORMAT PENOMORAN SK UNBARI */}
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-2xl p-5 border border-blue-800 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400 text-blue-950 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Standar Format Isian Penomoran SK Fakultas Teknik UNBARI</span>
                      <span className="text-[10px] bg-blue-800 text-yellow-300 border border-blue-700 px-2 py-0.5 rounded-full font-mono">
                        Resmi
                      </span>
                    </h3>
                    <p className="text-[11px] text-blue-200">
                      Format penomoran Surat Keputusan Dekan terstruktur 6 segmen institusional
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] pt-1">
                  <span className="bg-blue-600/90 text-blue-100 px-2 py-0.5 rounded font-bold" title="Nomor Urut 3 Digit">
                    085 (No. Urut)
                  </span>
                  <span className="text-slate-400 font-sans">/</span>
                  <span className="bg-indigo-600/90 text-indigo-100 px-2 py-0.5 rounded font-bold" title="Klasifikasi SK">
                    SK-DEK | SK-YUD
                  </span>
                  <span className="text-slate-400 font-sans">/</span>
                  <span className="bg-emerald-600/90 text-emerald-100 px-2 py-0.5 rounded font-bold" title="Lembaga Fakultas">
                    FT-UNBARI
                  </span>
                  <span className="text-slate-400 font-sans">/</span>
                  <span className="bg-amber-600/90 text-amber-100 px-2 py-0.5 rounded font-bold" title="Kode Prodi (Opsional)">
                    [TS / TL / TL-D3]
                  </span>
                  <span className="text-slate-400 font-sans">/</span>
                  <span className="bg-rose-600/90 text-rose-100 px-2 py-0.5 rounded font-bold" title="Bulan Romawi">
                    [Bulan Romawi: I-XII]
                  </span>
                  <span className="text-slate-400 font-sans">/</span>
                  <span className="bg-cyan-600/90 text-cyan-100 px-2 py-0.5 rounded font-bold" title="Tahun Anggaran">
                    2026
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowStandaloneSkBuilder(true)}
                  className="px-4 py-2 text-xs font-bold text-blue-950 bg-yellow-400 hover:bg-yellow-300 rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Sliders className="w-4 h-4 text-blue-950" />
                  <span>Buka Generator &amp; Isian Format SK</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Periode Cards */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  Jadwal &amp; Gelombang Pelaksanaan Yudisium FT UNBARI
                </h3>
              </div>

              <div className="space-y-3">
                {periodeList.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{p.namaPeriode}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            p.status === 'Selesai / Terbit SK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {p.keterangan}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedPeriodeForSk(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shrink-0 shadow-2xs"
                        title="Atur penomoran SK Dekan dan terapkan ke calon wisudawan"
                      >
                        <Sliders className="w-3.5 h-3.5 text-blue-700" />
                        <span>Atur Format SK Dekan</span>
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Tanggal Yudisium:</span>
                        <div className="font-semibold text-slate-800 mt-0.5">
                          {new Date(p.tanggalPelaksanaan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Nomor SK Dekan:</span>
                        <div className="font-mono font-bold text-blue-900 mt-0.5 truncate bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100 inline-block">
                          {p.nomorSkDekan}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Estimasi Kuota:</span>
                        <div className="font-semibold text-slate-800 mt-0.5">
                          {p.kuotaWisuda} Calon Wisudawan
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PIN & SIVIL Information Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Standar Penomoran Ijazah Nasional (PIN)</span>
              </div>

              <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                <p>
                  Sesuai Permendikbudristek No. 6 Tahun 2022, setiap lulusan Fakultas Teknik Universitas Batanghari wajib memiliki <strong>Penomoran Ijazah Nasional (PIN)</strong> yang terdaftar di PDDikti.
                </p>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 font-mono text-[11px]">
                  <div className="text-blue-900 font-bold">Struktur PIN Dikti UNBARI:</div>
                  <div className="text-slate-700">01004 · 2026 · XXXXXXX</div>
                  <div className="text-[10px] text-slate-400 font-sans">Kode PT (01004) + Tahun Lulus + Nomor Urut PIN</div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Keabsahan ijazah lulusan dapat dicek oleh instansi/perusahaan melalui portal resmi:
                </p>
                <a
                  href="https://ijazah.kemdikbud.go.id"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-bold hover:underline"
                >
                  <span>Portal SIVIL Kemendikbudristek</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODAL PENDAFTARAN CALON YUDISIUM BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-yellow-300" />
                <h3 className="text-sm font-bold">Pendaftaran Calon Peserta Yudisium Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Quick Select from existing students */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                <label className="block font-bold text-blue-950">
                  Pilih Cepat dari Mahasiswa Tingkat Akhir ({selectedProdi.singkatan}):
                </label>
                <select
                  onChange={(e) => handleSelectStudentForReg(e.target.value)}
                  className="w-full text-xs border border-blue-300 rounded-lg p-2 bg-white font-medium"
                >
                  <option value="">-- Pilih Mahasiswa Tingkat Akhir (Semester 7+) --</option>
                  {mahasiswaList
                    .filter(m => m.prodiId === selectedProdi.id && m.semester >= 7)
                    .map(m => (
                      <option key={m.id} value={m.nim}>
                        {m.nim} - {m.nama} (IPK: {m.ipk.toFixed(2)}, Sem: {m.semester})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIM Mahasiswa *</label>
                  <input
                    type="text"
                    required
                    value={newReg.nim}
                    onChange={(e) => setNewReg({ ...newReg, nim: e.target.value })}
                    placeholder="Contoh: 2100822201025"
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Mahasiswa *</label>
                  <input
                    type="text"
                    required
                    value={newReg.nama}
                    onChange={(e) => setNewReg({ ...newReg, nama: e.target.value })}
                    placeholder="Nama sesuai KTP / Ijazah Terakhir"
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={newReg.jenisKelamin}
                    onChange={(e) => setNewReg({ ...newReg, jenisKelamin: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IPK Akhir Kelulusan</label>
                  <input
                    type="number"
                    step="0.01"
                    min="2.00"
                    max="4.00"
                    value={newReg.ipk}
                    onChange={(e) => setNewReg({ ...newReg, ipk: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKS Lulus</label>
                  <input
                    type="number"
                    value={newReg.sksLulus}
                    onChange={(e) => setNewReg({ ...newReg, sksLulus: parseInt(e.target.value) || selectedProdi.sksKelulusan })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ukuran Toga Wisuda</label>
                  <select
                    value={newReg.ukuranToga}
                    onChange={(e) => setNewReg({ ...newReg, ukuranToga: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold font-mono"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-slate-700 mb-1">Judul Tugas Akhir / Skripsi</label>
                <textarea
                  rows={2}
                  required
                  value={newReg.judulSkripsi}
                  onChange={(e) => setNewReg({ ...newReg, judulSkripsi: e.target.value })}
                  placeholder="Judul skripsi lengkap yang telah disahkan saat sidang meja hijau"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosen Pembimbing I</label>
                  <input
                    type="text"
                    value={newReg.dosenPembimbing1}
                    onChange={(e) => setNewReg({ ...newReg, dosenPembimbing1: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosen Pembimbing II</label>
                  <input
                    type="text"
                    value={newReg.dosenPembimbing2}
                    onChange={(e) => setNewReg({ ...newReg, dosenPembimbing2: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Simpan Pendaftaran Yudisium
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAIL & VERIFIKASI MODAL */}
      <YudisiumDetailModal
        isOpen={isDetailModalOpen}
        record={selectedRecord}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateRecord={onUpdateYudisium}
        onPrintSkl={(r, docType = 'SKL') => {
          setSelectedRecord(r);
          setPrintDocType(docType);
          setIsPrintModalOpen(true);
        }}
        onShowToast={onShowToast}
      />

      {/* OFFICIAL DOCUMENT PRINT MODAL */}
      <YudisiumPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={selectedRecord}
        allRecords={filteredRecords}
        selectedProdi={selectedProdi}
        documentType={printDocType}
        onSetDocumentType={setPrintDocType}
      />

      {/* SK NUMBER BUILDER MODAL (PERIODE YUDISIUM) */}
      {selectedPeriodeForSk && (
        <SkNumberBuilderModal
          isOpen={Boolean(selectedPeriodeForSk)}
          onClose={() => setSelectedPeriodeForSk(null)}
          currentSkNumber={selectedPeriodeForSk.nomorSkDekan}
          periodeName={selectedPeriodeForSk.namaPeriode}
          tanggalYudisium={selectedPeriodeForSk.tanggalPelaksanaan}
          totalPeserta={yudisiumList.filter(r => r.periodeWisuda === selectedPeriodeForSk.namaPeriode).length}
          onSave={handleSaveSkForPeriode}
        />
      )}

      {/* STANDALONE SK NUMBER BUILDER MODAL */}
      {showStandaloneSkBuilder && (
        <SkNumberBuilderModal
          isOpen={showStandaloneSkBuilder}
          onClose={() => setShowStandaloneSkBuilder(false)}
          currentSkNumber={standaloneSkNumber}
          periodeName="Fakultas Teknik UNBARI"
          totalPeserta={0}
          onSave={(val) => {
            setStandaloneSkNumber(val);
            onShowToast(`Format Nomor SK Dekan disimpan: ${val}`);
          }}
        />
      )}

    </div>
  );
};
