import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Award, 
  ChevronRight,
  Building,
  Filter,
  X,
  Edit2,
  Trash2,
  UserCheck2,
  Printer,
  CalendarCheck2
} from 'lucide-react';
import { KpSeminarPrintModal } from './KpSeminarPrintModal';
import { TaSidangPrintModal } from './TaSidangPrintModal';
import { TabelKesesuaianJadwalView } from './TabelKesesuaianJadwalView';
import { INITIAL_KETERSEDIAAN_JADWAL } from '../data/mockKetersediaanJadwalData';
import { hitungSkalaNilai } from '../utils/gradeScaleHelper';
import { 
  JadwalSidangTA, 
  JadwalKerjaPraktek, 
  Mahasiswa, 
  Dosen, 
  ProgramStudiInfo, 
  HariKuliah,
  RuanganLab,
  KetersediaanJadwalDosen,
  JadwalKuliah
} from '../types/index';

interface KerjaPraktekDanTaViewProps {
  sidangList: JadwalSidangTA[];
  kpList: JadwalKerjaPraktek[];
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  ruanganList: RuanganLab[];
  selectedProdi: ProgramStudiInfo;
  onAddSidang: (sidang: JadwalSidangTA) => void;
  onUpdateSidang: (sidang: JadwalSidangTA) => void;
  onDeleteSidang: (id: string) => void;
  onAddKp: (kp: JadwalKerjaPraktek) => void;
  onUpdateKp: (kp: JadwalKerjaPraktek) => void;
  onDeleteKp: (id: string) => void;
  ketersediaanJadwalList?: KetersediaanJadwalDosen[];
  onUpdateKetersediaanJadwal?: (updated: KetersediaanJadwalDosen) => void;
  jadwalKuliahList?: JadwalKuliah[];
  onShowToast?: (msg: string) => void;
}

export const KerjaPraktekDanTaView: React.FC<KerjaPraktekDanTaViewProps> = ({
  sidangList,
  kpList,
  mahasiswaList,
  dosenList,
  ruanganList,
  selectedProdi,
  onAddSidang,
  onUpdateSidang,
  onDeleteSidang,
  onAddKp,
  onUpdateKp,
  onDeleteKp,
  ketersediaanJadwalList,
  onUpdateKetersediaanJadwal,
  jadwalKuliahList = [],
  onShowToast
}) => {
  const [activeTab, setActiveTab] = React.useState<'ta' | 'kp' | 'kesesuaian_jadwal'>('ta');
  const [scopeFilter, setScopeFilter] = React.useState<string>('current');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [filterTipeSidang, setFilterTipeSidang] = React.useState<string>('all');
  const [filterStatusSidang, setFilterStatusSidang] = React.useState<string>('all');
  
  // Modals
  const [showAddSidangModal, setShowAddSidangModal] = React.useState(false);
  const [showAddKpModal, setShowAddKpModal] = React.useState(false);
  const [selectedSidangForGrade, setSelectedSidangForGrade] = React.useState<JadwalSidangTA | null>(null);
  const [selectedKpForPrint, setSelectedKpForPrint] = React.useState<JadwalKerjaPraktek | null>(null);
  const [selectedSidangForPrint, setSelectedSidangForPrint] = React.useState<{ sidang: JadwalSidangTA; tab: 'nilai' | 'berita_acara' | 'lembar_revisi' } | null>(null);

  // Available students in current prodi
  const eligibleMhsTA = mahasiswaList.filter(m => m.prodiId === selectedProdi.id);
  const prodiDosen = dosenList.filter(d => d.prodiId === selectedProdi.id);

  // Ketersediaan Jadwal Dosen State
  const [internalKetersediaanList, setInternalKetersediaanList] = React.useState<KetersediaanJadwalDosen[]>(() => {
    return ketersediaanJadwalList || INITIAL_KETERSEDIAAN_JADWAL;
  });

  const effectiveKetersediaanList = ketersediaanJadwalList || internalKetersediaanList;

  const handleUpdateKetersediaan = (updated: KetersediaanJadwalDosen) => {
    if (onUpdateKetersediaanJadwal) {
      onUpdateKetersediaanJadwal(updated);
    } else {
      setInternalKetersediaanList(prev => prev.map(k => k.id === updated.id ? updated : k));
    }
  };

  const handleApplyIrisanToSidang = (irisan: { hari: HariKuliah; jamMulai: string; jamSelesai: string; dosenIds: string[] }) => {
    const matchedDosen = effectiveKetersediaanList
      .filter(k => irisan.dosenIds.includes(k.id))
      .map(k => k.namaDosen);

    setNewSidang(prev => ({
      ...prev,
      hari: irisan.hari,
      jamMulai: irisan.jamMulai,
      jamSelesai: irisan.jamSelesai,
      pembimbing1: matchedDosen[0] || prev.pembimbing1,
      penguji1: matchedDosen[1] || prev.penguji1,
      penguji2: matchedDosen[2] || prev.penguji2
    }));

    setActiveTab('ta');
    setShowAddSidangModal(true);
    if (onShowToast) {
      onShowToast(`Irisan jadwal ${irisan.hari} (${irisan.jamMulai} - ${irisan.jamSelesai}) diterapkan ke form sidang!`);
    }
  };

  // New Sidang TA Form State
  const [newSidang, setNewSidang] = React.useState({
    prodiId: selectedProdi.id,
    nim: eligibleMhsTA[0]?.nim || '',
    namaMahasiswa: eligibleMhsTA[0]?.nama || '',
    jenjang: selectedProdi.jenjang,
    tipeSidang: (selectedProdi.jenjang === 'D3' ? 'Sidang Proyek Akhir' : 'Seminar Hasil') as any,
    judulTA: eligibleMhsTA[0]?.judulTA || 'Perencanaan Struktur & Analisis Rekayasa',
    tanggal: '2026-10-22',
    hari: 'Kamis' as HariKuliah,
    jamMulai: '09:00',
    jamSelesai: '11:00',
    ruangan: selectedProdi.id === 'SIPIL' ? 'Ruang Sidang Jurusan Sipil (SPL-302)' : selectedProdi.id === 'LINGKUNGAN' ? 'Ruang Seminar Lingkungan (LKG-203)' : 'Ruang Sidang Vokasi Listrik (LST-203)',
    pembimbing1: prodiDosen[0]?.namaLengkap || dosenList[0]?.namaLengkap || '',
    pembimbing2: prodiDosen[1]?.namaLengkap || '',
    penguji1: prodiDosen[2]?.namaLengkap || dosenList[1]?.namaLengkap || '',
    penguji2: prodiDosen[3]?.namaLengkap || dosenList[2]?.namaLengkap || '',
    ketuaSidang: selectedProdi.kaprodi,
    status: 'Terjadwal' as const,
    catatanRevisi: ''
  });

  // New KP Form State
  const [newKp, setNewKp] = React.useState({
    prodiId: selectedProdi.id,
    nim: eligibleMhsTA[0]?.nim || '',
    namaMahasiswa: eligibleMhsTA[0]?.nama || '',
    instansiPerusahaan: '',
    lokasiKota: '',
    posisiProyek: '',
    periodeMulai: '1 Juli 2026',
    periodeSelesai: '31 Agustus 2026',
    dosenPembimbing: prodiDosen[0]?.namaLengkap || dosenList[0]?.namaLengkap || '',
    pembimbingLapangan: '',
    status: 'Sedang Berjalan di Lapangan' as const,
    tanggalSeminar: '2026-10-23',
    hariSeminar: 'Jumat' as HariKuliah,
    jamSeminar: '09:00 - 10:30 WIB',
    ruangSeminar: 'Ruang Seminar Jurusan',
    dosenPengujiKP: selectedProdi.kaprodi
  });

  // Keep state updated when selectedProdi changes
  React.useEffect(() => {
    setNewSidang(prev => ({
      ...prev,
      prodiId: selectedProdi.id,
      jenjang: selectedProdi.jenjang,
      ketuaSidang: selectedProdi.kaprodi,
      pembimbing1: prodiDosen[0]?.namaLengkap || dosenList[0]?.namaLengkap || '',
      penguji1: prodiDosen[1]?.namaLengkap || dosenList[1]?.namaLengkap || '',
      penguji2: prodiDosen[2]?.namaLengkap || dosenList[2]?.namaLengkap || '',
      ruangan: selectedProdi.id === 'SIPIL' ? 'Ruang Sidang Jurusan Sipil (SPL-302)' : selectedProdi.id === 'LINGKUNGAN' ? 'Ruang Seminar Lingkungan (LKG-203)' : 'Ruang Sidang Vokasi Listrik (LST-203)'
    }));

    setNewKp(prev => ({
      ...prev,
      prodiId: selectedProdi.id,
      dosenPembimbing: prodiDosen[0]?.namaLengkap || dosenList[0]?.namaLengkap || '',
      dosenPengujiKP: selectedProdi.kaprodi
    }));
  }, [selectedProdi]);

  // Filtered Sidang TA
  const filteredSidang = sidangList.filter((s) => {
    const matchProdi = 
      scopeFilter === 'all' 
        ? true 
        : scopeFilter === 'current' 
          ? s.prodiId === selectedProdi.id 
          : s.prodiId === scopeFilter;

    const matchTipe = filterTipeSidang === 'all' || s.tipeSidang === filterTipeSidang;
    const matchStatus = filterStatusSidang === 'all' || s.status === filterStatusSidang;
    const matchSearch = 
      s.namaMahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nim.includes(searchQuery) ||
      s.judulTA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ketuaSidang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pembimbing1.toLowerCase().includes(searchQuery.toLowerCase());

    return matchProdi && matchTipe && matchStatus && matchSearch;
  });

  // Filtered KP
  const filteredKp = kpList.filter((kp) => {
    const matchProdi = 
      scopeFilter === 'all' 
        ? true 
        : scopeFilter === 'current' 
          ? kp.prodiId === selectedProdi.id 
          : kp.prodiId === scopeFilter;

    const matchSearch = 
      kp.namaMahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kp.nim.includes(searchQuery) ||
      kp.instansiPerusahaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kp.lokasiKota.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kp.dosenPembimbing.toLowerCase().includes(searchQuery.toLowerCase());

    return matchProdi && matchSearch;
  });

  const handleCreateSidang = (e: React.FormEvent) => {
    e.preventDefault();
    const created: JadwalSidangTA = {
      id: `SDG-${Date.now().toString().slice(-4)}`,
      prodiId: newSidang.prodiId,
      nim: newSidang.nim,
      namaMahasiswa: newSidang.namaMahasiswa,
      jenjang: newSidang.jenjang,
      tipeSidang: newSidang.tipeSidang,
      judulTA: newSidang.judulTA,
      tanggal: newSidang.tanggal,
      hari: newSidang.hari,
      jamMulai: newSidang.jamMulai,
      jamSelesai: newSidang.jamSelesai,
      ruangan: newSidang.ruangan,
      pembimbing1: newSidang.pembimbing1,
      pembimbing2: newSidang.pembimbing2,
      penguji1: newSidang.penguji1,
      penguji2: newSidang.penguji2,
      ketuaSidang: newSidang.ketuaSidang,
      status: newSidang.status,
      catatanRevisi: newSidang.catatanRevisi
    };
    onAddSidang(created);
    setShowAddSidangModal(false);
  };

  const handleCreateKp = (e: React.FormEvent) => {
    e.preventDefault();
    const created: JadwalKerjaPraktek = {
      id: `KP-${Date.now().toString().slice(-4)}`,
      prodiId: newKp.prodiId,
      nim: newKp.nim,
      namaMahasiswa: newKp.namaMahasiswa,
      instansiPerusahaan: newKp.instansiPerusahaan,
      lokasiKota: newKp.lokasiKota,
      posisiProyek: newKp.posisiProyek,
      periodeMulai: newKp.periodeMulai,
      periodeSelesai: newKp.periodeSelesai,
      dosenPembimbing: newKp.dosenPembimbing,
      pembimbingLapangan: newKp.pembimbingLapangan,
      status: newKp.status,
      tanggalSeminar: newKp.tanggalSeminar,
      hariSeminar: newKp.hariSeminar,
      jamSeminar: newKp.jamSeminar,
      ruangSeminar: newKp.ruangSeminar,
      dosenPengujiKP: newKp.dosenPengujiKP,
      nilaiHuruf: 'Belum Dinilai'
    };
    onAddKp(created);
    setShowAddKpModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{selectedProdi.nama}</span>
              <span aria-hidden="true">·</span>
              <span>Jalur Kelulusan & Pengalaman Lapangan</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Jadwal Kerja Praktek & Sidang Tugas Akhir
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Pengorganisasian dewan penguji sidang proposal/hasil/skripsi dan monitoring seminar magang industri.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="text-xs font-medium border border-blue-200 rounded-lg px-2.5 py-1.5 bg-blue-50/60 text-blue-900"
            >
              <option value="current">{selectedProdi.singkatan}</option>
              <option value="all">Semua Program Studi</option>
              <option value="SIPIL">S1 Teknik Sipil</option>
              <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
              <option value="LISTRIK_D3">D3 Teknik Listrik</option>
            </select>

            {activeTab !== 'kesesuaian_jadwal' && (
              <button
                type="button"
                onClick={() => activeTab === 'ta' ? setShowAddSidangModal(true) : setShowAddKpModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{activeTab === 'ta' ? '+ Jadwalkan Sidang TA' : '+ Registrasi KP / Seminar'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Toggle: TA vs KP vs Kesesuaian Jadwal */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('ta')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ta'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Sidang & Seminar Tugas Akhir ({filteredSidang.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kp')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'kp'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Kerja Praktek & Magang ({filteredKp.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kesesuaian_jadwal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'kesesuaian_jadwal'
                ? 'bg-[#003876] text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-200/80 bg-slate-50/60'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Tabel Kesesuaian Jadwal Dosen (KP & TA)</span>
            <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold ${
              activeTab === 'kesesuaian_jadwal' ? 'bg-blue-900 text-blue-100' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Template Resmi
            </span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR (For TA and KP tabs) */}
      {activeTab !== 'kesesuaian_jadwal' && (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'ta' ? "Cari Mahasiswa, NIM, Judul TA, Dewan Penguji..." : "Cari Mahasiswa, Instansi Perusahaan, Kota..."}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>

          {activeTab === 'ta' && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterTipeSidang}
                onChange={(e) => setFilterTipeSidang(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700"
              >
                <option value="all">Semua Tipe Sidang</option>
                <option value="Seminar Proposal">Seminar Proposal</option>
                <option value="Seminar Hasil">Seminar Hasil</option>
                <option value="Sidang Meja Hijau / Skripsi">Sidang Meja Hijau / Skripsi</option>
                <option value="Sidang Proyek Akhir">Sidang Proyek Akhir (D3)</option>
              </select>

              <select
                value={filterStatusSidang}
                onChange={(e) => setFilterStatusSidang(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="Terjadwal">Terjadwal</option>
                <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                <option value="Lulus Dengan Revisi">Lulus Dengan Revisi</option>
                <option value="Lulus Tanpa Revisi">Lulus Tanpa Revisi</option>
                <option value="Mengulang">Mengulang</option>
              </select>
            </div>
          )}
        </div>
      </div>
      )}

      {/* VIEW CONTENT: TUGAS AKHIR */}
      {activeTab === 'ta' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Jadwal & Ruang</th>
                  <th className="py-3 px-4">Mahasiswa & Judul TA</th>
                  <th className="py-3 px-3">Tahap Sidang</th>
                  <th className="py-3 px-4">Dewan Penguji (Dosen)</th>
                  <th className="py-3 px-3 text-center">Status Sidang</th>
                  <th className="py-3 px-3 text-right">Nilai</th>
                  <th className="py-3 px-4 text-center">Aksi Kaprodi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSidang.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium text-slate-700">Tidak ada jadwal sidang yang sesuai kriteria.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Gunakan tombol "+ Jadwalkan Sidang TA" untuk mengagendakan sidang baru.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSidang.map((sidang) => (
                    <tr key={sidang.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Schedule & Room */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{sidang.hari}, {sidang.tanggal}</div>
                        <div className="font-mono text-[11px] text-blue-700 font-medium mt-0.5">
                          {sidang.jamMulai} - {sidang.jamSelesai} WIB
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">{sidang.ruangan}</span>
                        </div>
                      </td>

                      {/* Mahasiswa & Title */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900">{sidang.namaMahasiswa}</div>
                        <div className="font-mono text-[11px] text-slate-500">NIM: {sidang.nim}</div>
                        <p className="text-[11px] text-slate-700 mt-1 line-clamp-2 italic leading-relaxed">
                          "{sidang.judulTA}"
                        </p>
                      </td>

                      {/* Tipe Sidang */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          sidang.tipeSidang.includes('Meja Hijau') || sidang.tipeSidang.includes('Akhir')
                            ? 'bg-blue-100 text-blue-800'
                            : sidang.tipeSidang === 'Seminar Hasil'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sidang.tipeSidang}
                        </span>
                      </td>

                      {/* Dewan Penguji */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-700 space-y-0.5">
                        <div>
                          <span className="text-slate-400">Ketua:</span> <strong className="text-slate-900">{sidang.ketuaSidang}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Pembimbing:</span> {sidang.pembimbing1}
                        </div>
                        <div className="text-slate-600">
                          <span className="text-slate-400">Penguji:</span> {sidang.penguji1}, {sidang.penguji2}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded ${
                          sidang.status === 'Lulus Tanpa Revisi' || sidang.status === 'Lulus Dengan Revisi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sidang.status === 'Sedang Berlangsung'
                              ? 'bg-amber-100 text-amber-800 animate-pulse font-bold'
                              : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sidang.status}
                        </span>
                      </td>

                      {/* Nilai */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums">
                        {sidang.nilaiAkhir ? (
                          <span className="text-blue-700">{sidang.nilaiAkhir}</span>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-normal">-</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSidangForGrade(sidang)}
                            className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          >
                            BAP & Nilai
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSidangForPrint({ sidang, tab: 'nilai' })}
                            title="Cetak Formulir Nilai Ujian (A4)"
                            className="p-1 text-slate-600 hover:text-blue-700 rounded hover:bg-blue-50 transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSidangForPrint({ sidang, tab: 'berita_acara' })}
                            title="Cetak Berita Acara Sidang (A4)"
                            className="p-1 text-slate-600 hover:text-emerald-700 rounded hover:bg-emerald-50 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSidang(sidang.id)}
                            title="Hapus Jadwal Sidang"
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW CONTENT: KERJA PRAKTEK (KP / PKL) */}
      {activeTab === 'kp' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mahasiswa & NIM</th>
                  <th className="py-3 px-4">Instansi & Lokasi Proyek</th>
                  <th className="py-3 px-4">Posisi & Durasi</th>
                  <th className="py-3 px-4">Pembimbing Akademik & Lapangan</th>
                  <th className="py-3 px-3">Status Pelaksanaan</th>
                  <th className="py-3 px-4">Jadwal Seminar KP</th>
                  <th className="py-3 px-3 text-center">Nilai</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKp.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium text-slate-700">Tidak ada data kerja praktek yang cocok.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Gunakan tombol "+ Registrasi KP / Seminar" untuk menambahkan.</p>
                    </td>
                  </tr>
                ) : (
                  filteredKp.map((kp) => (
                    <tr key={kp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Mahasiswa */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{kp.namaMahasiswa}</div>
                        <div className="font-mono text-[11px] text-slate-500">NIM: {kp.nim}</div>
                      </td>

                      {/* Perusahaan */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{kp.instansiPerusahaan}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{kp.lokasiKota}</div>
                      </td>

                      {/* Posisi & Periode */}
                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="font-medium text-slate-800">{kp.posisiProyek}</div>
                        <div className="font-mono text-slate-500 mt-0.5">{kp.periodeMulai} - {kp.periodeSelesai}</div>
                      </td>

                      {/* Pembimbing */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-700 space-y-0.5">
                        <div>
                          <span className="text-slate-400">Dosen:</span> <strong className="text-slate-800">{kp.dosenPembimbing}</strong>
                        </div>
                        <div className="text-slate-600">
                          <span className="text-slate-400">Lapangan:</span> {kp.pembimbingLapangan}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          kp.status === 'Selesai & Dinilai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : kp.status === 'Menunggu Seminar KP'
                              ? 'bg-blue-100 text-blue-800 font-bold'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {kp.status}
                        </span>
                      </td>

                      {/* Seminar KP Schedule */}
                      <td className="py-3.5 px-4 text-[11px]">
                        {kp.tanggalSeminar ? (
                          <div>
                            <div className="font-semibold text-slate-900">{kp.hariSeminar}, {kp.tanggalSeminar}</div>
                            <div className="font-mono text-blue-700">{kp.jamSeminar}</div>
                            <div className="text-slate-500">{kp.ruangSeminar}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum dijadwalkan</span>
                        )}
                      </td>

                      {/* Nilai */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold">
                        {kp.nilaiHuruf && kp.nilaiHuruf !== 'Belum Dinilai' ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {kp.nilaiHuruf}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal text-[11px]">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedKpForPrint(kp)}
                            title="Cetak Berita Acara Seminar KP Resmi (A4)"
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                          >
                            <Printer className="w-3 h-3 text-blue-600" />
                            <span>Cetak BA</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteKp(kp.id)}
                            title="Hapus Data KP"
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW CONTENT: TABEL KESESUAIAN JADWAL DOSEN PEMBAHAS/PENGUJI SEMINAR KP DAN TA */}
      {activeTab === 'kesesuaian_jadwal' && (
        <TabelKesesuaianJadwalView
          ketersediaanList={effectiveKetersediaanList}
          onUpdateKetersediaan={handleUpdateKetersediaan}
          selectedProdi={selectedProdi}
          dosenList={dosenList}
          jadwalKuliahList={jadwalKuliahList}
          onShowToast={onShowToast}
          onApplyIrisanToSidang={handleApplyIrisanToSidang}
        />
      )}

      {/* MODAL: INPUT NILAI & BAP SIDANG TA */}
      {selectedSidangForGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Penetapan Hasil Sidang & Nilai Akhir</h3>
                <p className="text-xs text-slate-500">{selectedSidangForGrade.namaMahasiswa} ({selectedSidangForGrade.nim})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSidangForGrade(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 mt-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-[11px] text-slate-400 block">Judul Naskah:</span>
                <p className="font-semibold text-slate-900 italic">"{selectedSidangForGrade.judulTA}"</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Status Keputusan Dewan Penguji</label>
                  <select
                    value={selectedSidangForGrade.status}
                    onChange={(e) => setSelectedSidangForGrade({ ...selectedSidangForGrade, status: e.target.value as any })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                    <option value="Lulus Tanpa Revisi">Lulus Tanpa Revisi</option>
                    <option value="Lulus Dengan Revisi">Lulus Dengan Revisi</option>
                    <option value="Mengulang">Mengulang Sidang</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-medium">Nilai Rata-rata Sidang (0 - 100)</label>
                    {(() => {
                      const skala = hitungSkalaNilai(selectedSidangForGrade.nilaiAkhir || 85);
                      return (
                        <span className="text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          Grade {skala.huruf} ({skala.bobot.toFixed(2)}) · {skala.statusKelulusan}
                        </span>
                      );
                    })()}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={selectedSidangForGrade.nilaiAkhir || 85}
                    onChange={(e) => setSelectedSidangForGrade({ ...selectedSidangForGrade, nilaiAkhir: Number(e.target.value) })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Catatan Perbaikan / Revisi Naskah</label>
                <textarea
                  rows={3}
                  value={selectedSidangForGrade.catatanRevisi || ''}
                  onChange={(e) => setSelectedSidangForGrade({ ...selectedSidangForGrade, catatanRevisi: e.target.value })}
                  placeholder="Catatan dari penguji untuk mahasiswa..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSidangForPrint({ sidang: selectedSidangForGrade, tab: 'nilai' });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen A4</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSidangForGrade(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSidang(selectedSidangForGrade);
                      setSelectedSidangForGrade(null);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                  >
                    Simpan Keputusan Sidang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH JADWAL SIDANG TA */}
      {showAddSidangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Jadwalkan Sidang / Seminar Tugas Akhir</h3>
                <p className="text-xs text-slate-500">{selectedProdi.nama}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSidangModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSidang} className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Pilih Mahasiswa *</label>
                  <select
                    value={newSidang.nim}
                    onChange={(e) => {
                      const selected = eligibleMhsTA.find(m => m.nim === e.target.value);
                      if (selected) {
                        setNewSidang({
                          ...newSidang,
                          nim: selected.nim,
                          namaMahasiswa: selected.nama,
                          judulTA: selected.judulTA || newSidang.judulTA
                        });
                      }
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {eligibleMhsTA.map(m => (
                      <option key={m.id} value={m.nim}>{m.nama} ({m.nim})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tipe Sidang</label>
                  <select
                    value={newSidang.tipeSidang}
                    onChange={(e) => setNewSidang({ ...newSidang, tipeSidang: e.target.value as any })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Seminar Proposal">Seminar Proposal (Sempro)</option>
                    <option value="Seminar Hasil">Seminar Hasil Penelitian (Semhas)</option>
                    {selectedProdi.jenjang === 'D3' ? (
                      <option value="Sidang Proyek Akhir">Sidang Proyek Akhir Terapan</option>
                    ) : (
                      <option value="Sidang Meja Hijau / Skripsi">Sidang Meja Hijau / Skripsi S1</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Judul Tugas Akhir *</label>
                <textarea
                  rows={2}
                  required
                  value={newSidang.judulTA}
                  onChange={(e) => setNewSidang({ ...newSidang, judulTA: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Hari</label>
                  <select
                    value={newSidang.hari}
                    onChange={(e) => setNewSidang({ ...newSidang, hari: e.target.value as HariKuliah })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={newSidang.tanggal}
                    onChange={(e) => setNewSidang({ ...newSidang, tanggal: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mulai</label>
                  <input
                    type="time"
                    value={newSidang.jamMulai}
                    onChange={(e) => setNewSidang({ ...newSidang, jamMulai: e.target.value })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Selesai</label>
                  <input
                    type="time"
                    value={newSidang.jamSelesai}
                    onChange={(e) => setNewSidang({ ...newSidang, jamSelesai: e.target.value })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Ruang Sidang</label>
                <input
                  type="text"
                  value={newSidang.ruangan}
                  onChange={(e) => setNewSidang({ ...newSidang, ruangan: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              {/* Susunan Dewan Penguji */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[11px] font-bold text-slate-800 block">Susunan Dewan Penguji Sidang</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Ketua Sidang:</span>
                    <select
                      value={newSidang.ketuaSidang}
                      onChange={(e) => setNewSidang({ ...newSidang, ketuaSidang: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                    >
                      {prodiDosen.map(d => (
                        <option key={d.id} value={d.namaLengkap}>{d.namaLengkap}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500">Dosen Pembimbing 1:</span>
                    <select
                      value={newSidang.pembimbing1}
                      onChange={(e) => setNewSidang({ ...newSidang, pembimbing1: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                    >
                      {prodiDosen.map(d => (
                        <option key={d.id} value={d.namaLengkap}>{d.namaLengkap}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500">Dosen Penguji Utama 1:</span>
                    <select
                      value={newSidang.penguji1}
                      onChange={(e) => setNewSidang({ ...newSidang, penguji1: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                    >
                      {prodiDosen.map(d => (
                        <option key={d.id} value={d.namaLengkap}>{d.namaLengkap}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500">Dosen Penguji Utama 2:</span>
                    <select
                      value={newSidang.penguji2}
                      onChange={(e) => setNewSidang({ ...newSidang, penguji2: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                    >
                      {prodiDosen.map(d => (
                        <option key={d.id} value={d.namaLengkap}>{d.namaLengkap}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSidangModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Tetapkan Jadwal Sidang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH KP / SEMINAR KP */}
      {showAddKpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Registrasi Kerja Praktek & Jadwal Seminar</h3>
                <p className="text-xs text-slate-500">{selectedProdi.nama}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddKpModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKp} className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Pilih Mahasiswa *</label>
                  <select
                    value={newKp.nim}
                    onChange={(e) => {
                      const selected = eligibleMhsTA.find(m => m.nim === e.target.value);
                      if (selected) {
                        setNewKp({
                          ...newKp,
                          nim: selected.nim,
                          namaMahasiswa: selected.nama
                        });
                      }
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {eligibleMhsTA.map(m => (
                      <option key={m.id} value={m.nim}>{m.nama} ({m.nim})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Status Pelaksanaan</label>
                  <select
                    value={newKp.status}
                    onChange={(e) => setNewKp({ ...newKp, status: e.target.value as any })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Sedang Berjalan di Lapangan">Sedang Berjalan di Lapangan</option>
                    <option value="Penyusunan Laporan">Penyusunan Laporan</option>
                    <option value="Menunggu Seminar KP">Menunggu Seminar KP</option>
                    <option value="Selesai & Dinilai">Selesai & Dinilai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Instansi / Perusahaan *</label>
                  <input
                    type="text"
                    required
                    placeholder="PT Wijaya Karya / PT PLN / DLH"
                    value={newKp.instansiPerusahaan}
                    onChange={(e) => setNewKp({ ...newKp, instansiPerusahaan: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Lokasi Kota *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jakarta Timur / Semarang"
                    value={newKp.lokasiKota}
                    onChange={(e) => setNewKp({ ...newKp, lokasiKota: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Posisi / Objek Proyek Kerja</label>
                <input
                  type="text"
                  placeholder="Pengawas Struktur / Uji Trafo / Analisa IPAL"
                  value={newKp.posisiProyek}
                  onChange={(e) => setNewKp({ ...newKp, posisiProyek: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Dosen Pembimbing KP</label>
                  <select
                    value={newKp.dosenPembimbing}
                    onChange={(e) => setNewKp({ ...newKp, dosenPembimbing: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {prodiDosen.map(d => (
                      <option key={d.id} value={d.namaLengkap}>{d.namaLengkap}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Pembimbing Lapangan (Industri)</label>
                  <input
                    type="text"
                    placeholder="Nama Site Manager / Mentor"
                    value={newKp.pembimbingLapangan}
                    onChange={(e) => setNewKp({ ...newKp, pembimbingLapangan: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              {/* Seminar KP schedule */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[11px] font-bold text-slate-800 block">Jadwal Seminar Laporan Kerja Praktek</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Tanggal:</span>
                    <input
                      type="date"
                      value={newKp.tanggalSeminar}
                      onChange={(e) => setNewKp({ ...newKp, tanggalSeminar: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Jam:</span>
                    <input
                      type="text"
                      value={newKp.jamSeminar}
                      onChange={(e) => setNewKp({ ...newKp, jamSeminar: e.target.value })}
                      className="w-full font-mono text-xs border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Ruangan:</span>
                    <input
                      type="text"
                      value={newKp.ruangSeminar}
                      onChange={(e) => setNewKp({ ...newKp, ruangSeminar: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddKpModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Simpan Data KP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Berita Acara Seminar KP */}
      <KpSeminarPrintModal
        isOpen={!!selectedKpForPrint}
        onClose={() => setSelectedKpForPrint(null)}
        kpItem={selectedKpForPrint}
        selectedProdi={selectedProdi}
      />

      {/* Modal Cetak Formulir Nilai & Berita Acara Sidang / Seminar TA (Standar A4) */}
      <TaSidangPrintModal
        isOpen={!!selectedSidangForPrint}
        onClose={() => setSelectedSidangForPrint(null)}
        sidang={selectedSidangForPrint?.sidang || null}
        selectedProdi={selectedProdi}
        initialTab={selectedSidangForPrint?.tab || 'nilai'}
      />

    </div>
  );
};
