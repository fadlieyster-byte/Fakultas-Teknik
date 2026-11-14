import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Plus, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  FileCheck2, 
  Trash2, 
  Edit2, 
  Search,
  Users,
  ShieldCheck,
  Building,
  RotateCcw
} from 'lucide-react';
import { JadwalKuliah, Dosen, RuanganLab, StatusKehadiranDosen, HariKuliah, ProgramStudiInfo, LogPresensiDosen } from '../types/index';
import { isJadwalSedangBerlangsung, hitungSisaWaktu, cekBentrokJadwal } from '../utils/timeHelper';
import { BapVerificationModal } from './BapVerificationModal';
import { PresensiDosenRekapView } from './PresensiDosenRekapView';

interface JadwalDosenViewProps {
  jadwalList: JadwalKuliah[];
  dosenList: Dosen[];
  ruanganList: RuanganLab[];
  selectedProdi: ProgramStudiInfo;
  currentDay: string;
  currentTimeStr: string;
  onAddJadwal: (jadwal: JadwalKuliah) => void;
  onUpdateJadwal: (jadwal: JadwalKuliah) => void;
  onDeleteJadwal: (id: string) => void;
  onUpdateDosenStatus: (dosenId: string, status: StatusKehadiranDosen, lokasi?: string) => void;
  onVerifyBap: (jadwalId: string, catatan?: string) => void;
  logPresensiList?: LogPresensiDosen[];
  onShowToast?: (msg: string) => void;
}

export const JadwalDosenView: React.FC<JadwalDosenViewProps> = ({
  jadwalList,
  dosenList,
  ruanganList,
  selectedProdi,
  currentDay,
  currentTimeStr,
  onAddJadwal,
  onUpdateJadwal,
  onDeleteJadwal,
  onUpdateDosenStatus,
  onVerifyBap,
  logPresensiList = [],
  onShowToast = () => {}
}) => {
  const [subTab, setSubTab] = React.useState<'jadwal_harian' | 'rekap_presensi'>('jadwal_harian');
  const [selectedDay, setSelectedDay] = React.useState<string>(currentDay);
  const [filterProdiScope, setFilterProdiScope] = React.useState<string>('current');
  const [filterDosenNidn, setFilterDosenNidn] = React.useState<string>('all');
  const [filterRuanganId, setFilterRuanganId] = React.useState<string>('all');
  const [filterJenisKelas, setFilterJenisKelas] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [showAddModal, setShowAddModal] = React.useState<boolean>(false);
  const [selectedBapJadwal, setSelectedBapJadwal] = React.useState<JadwalKuliah | null>(null);

  // Available lecturers & rooms for selectedProdi
  const prodiDosenList = dosenList.filter(d => d.prodiId === selectedProdi.id);
  const prodiRuanganList = ruanganList.filter(r => !r.prodiId || r.prodiId === selectedProdi.id || r.prodiId === 'UMUM');

  // Add Schedule Form State
  const [newJadwal, setNewJadwal] = React.useState({
    prodiId: selectedProdi.id,
    programStudi: selectedProdi.nama,
    kodeMK: '',
    namaMK: '',
    sks: 3,
    kelas: selectedProdi.id === 'SIPIL' ? 'SPL-3A' : selectedProdi.id === 'LINGKUNGAN' ? 'A' : '3-EL-3A',
    hari: 'Senin' as HariKuliah,
    jamMulai: '08:00',
    jamSelesai: '10:30',
    ruanganId: prodiRuanganList[0]?.id || ruanganList[0]?.id || '',
    dosenNidn: prodiDosenList[0]?.nidn || dosenList[0]?.nidn || '',
    pesertaTotal: 30,
    topikPertemuan: 'Materi RPS Pertemuan Reguler',
    pertemuanKe: 8
  });

  React.useEffect(() => {
    setNewJadwal(prev => ({
      ...prev,
      prodiId: selectedProdi.id,
      programStudi: selectedProdi.nama,
      kelas: selectedProdi.id === 'SIPIL' ? 'SPL-3A' : selectedProdi.id === 'LINGKUNGAN' ? 'A' : '3-EL-3A',
      dosenNidn: prodiDosenList[0]?.nidn || dosenList[0]?.nidn || '',
      ruanganId: prodiRuanganList[0]?.id || ruanganList[0]?.id || ''
    }));
  }, [selectedProdi]);

  const [conflictError, setConflictError] = React.useState<string | null>(null);

  const hariOptions: HariKuliah[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Filtered Schedules
  const filteredJadwal = jadwalList.filter((j) => {
    const matchProdi = 
      filterProdiScope === 'all' 
        ? true 
        : filterProdiScope === 'current' 
          ? j.prodiId === selectedProdi.id 
          : j.prodiId === filterProdiScope;

    const matchDay = selectedDay === 'all' || j.hari === selectedDay;
    const matchDosen = filterDosenNidn === 'all' || j.dosenNidn === filterDosenNidn;
    const matchRuang = filterRuanganId === 'all' || j.ruanganId === filterRuanganId;
    const matchJenis = 
      filterJenisKelas === 'all'
        ? true
        : filterJenisKelas === 'REG'
          ? (j.jenisKelas === 'REG' || j.jenisKelas === 'Reguler' || !j.jenisKelas)
          : (j.jenisKelas === 'KAR' || j.jenisKelas === 'Karyawan');
    const matchSearch = 
      j.namaMK.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.kodeMK.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.dosenNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.ruanganNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.kelas && j.kelas.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchProdi && matchDay && matchDosen && matchRuang && matchJenis && matchSearch;
  });

  // Calculate stats for current selection
  const liveCount = filteredJadwal.filter(j => 
    isJadwalSedangBerlangsung(j, currentDay, currentTimeStr)
  ).length;

  // Dosen list to display in cards
  const displayDosenCards = filterProdiScope === 'all' 
    ? dosenList 
    : dosenList.filter(d => d.prodiId === selectedProdi.id);

  const handleCreateJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    // Check conflict
    const conflict = cekBentrokJadwal(jadwalList, {
      hari: newJadwal.hari,
      jamMulai: newJadwal.jamMulai,
      jamSelesai: newJadwal.jamSelesai,
      dosenNidn: newJadwal.dosenNidn,
      ruanganId: newJadwal.ruanganId
    });

    if (conflict.isBentrok) {
      setConflictError(conflict.pesan || 'Terjadi bentrok jadwal.');
      return;
    }

    const selectedDosen = dosenList.find(d => d.nidn === newJadwal.dosenNidn);
    const selectedRuang = ruanganList.find(r => r.id === newJadwal.ruanganId);

    const created: JadwalKuliah = {
      id: `JAD-${Date.now().toString().slice(-4)}`,
      prodiId: newJadwal.prodiId as any,
      kodeMK: newJadwal.kodeMK,
      namaMK: newJadwal.namaMK,
      sks: newJadwal.sks,
      kelas: newJadwal.kelas,
      hari: newJadwal.hari,
      jamMulai: newJadwal.jamMulai,
      jamSelesai: newJadwal.jamSelesai,
      ruanganId: newJadwal.ruanganId,
      ruanganNama: selectedRuang ? `${selectedRuang.nama} (${selectedRuang.kode})` : newJadwal.ruanganId,
      dosenNidn: newJadwal.dosenNidn,
      dosenNama: selectedDosen?.namaLengkap || 'Dosen Pengampu',
      pesertaTotal: newJadwal.pesertaTotal,
      programStudi: newJadwal.programStudi,
      statusSesi: 'Belum Mulai',
      bapStatus: 'Belum Diisi',
      topikPertemuan: newJadwal.topikPertemuan,
      pertemuanKe: newJadwal.pertemuanKe
    };

    onAddJadwal(created);
    setShowAddModal(false);
    setNewJadwal({
      prodiId: selectedProdi.id,
      programStudi: selectedProdi.nama,
      kodeMK: '',
      namaMK: '',
      sks: 3,
      kelas: selectedProdi.id === 'SIPIL' ? 'SPL-3A' : selectedProdi.id === 'LINGKUNGAN' ? 'LKG-3A' : '3-EL-3A',
      hari: 'Senin',
      jamMulai: '08:00',
      jamSelesai: '10:30',
      ruanganId: prodiRuanganList[0]?.id || ruanganList[0]?.id || '',
      dosenNidn: prodiDosenList[0]?.nidn || dosenList[0]?.nidn || '',
      pesertaTotal: 30,
      topikPertemuan: 'Materi RPS Pertemuan Reguler',
      pertemuanKe: 8
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setSubTab('jadwal_harian')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              subTab === 'jadwal_harian'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Jadwal Perkuliahan & BAP Sesi</span>
            {liveCount > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {liveCount} Aktif
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('rekap_presensi')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              subTab === 'rekap_presensi'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Rekapitulasi Presensi & Durasi Mingguan Dosen</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              BAP Terintegrasi
            </span>
          </button>
        </div>
        <div className="text-right text-[11px] text-slate-500 hidden sm:block">
          Standar SN-Dikti: 1 SKS = 50 menit tatap muka/minggu
        </div>
      </div>

      {subTab === 'rekap_presensi' ? (
        <PresensiDosenRekapView
          dosenList={dosenList}
          selectedProdi={selectedProdi}
          logPresensiList={logPresensiList}
          jadwalList={jadwalList}
          onVerifyBap={onVerifyBap}
          onShowToast={onShowToast}
        />
      ) : (
        <>
          {/* Real-Time Lecturer Presence Quick Monitor */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Status Presensi & Keberadaan Dosen Real-Time ({selectedProdi.singkatan})
            </h2>
            <p className="text-xs text-slate-500">
              Kaprodi dapat memantau lokasi fisik, presensi kelas, dan status tugas dosen program studi saat ini.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
            {displayDosenCards.filter(d => d.statusRealTime === 'Sedang Mengajar').length} Dosen Sedang Mengajar
          </span>
        </div>

        {/* Lecturer Grid Horizontal Scroller / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {displayDosenCards.map((dosen) => (
            <div 
              key={dosen.id}
              className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-xs text-slate-900 leading-snug line-clamp-1">
                    {dosen.namaLengkap}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  NIDN: {dosen.nidn}
                </div>

                <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1 line-clamp-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{dosen.lokasiTerkini}</span>
                </div>
              </div>

              {/* Status Selector Dropdown */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">Status:</span>
                <select
                  value={dosen.statusRealTime}
                  onChange={(e) => onUpdateDosenStatus(dosen.id, e.target.value as StatusKehadiranDosen)}
                  className={`text-[11px] font-medium rounded px-2 py-0.5 border cursor-pointer ${
                    dosen.statusRealTime === 'Sedang Mengajar'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : dosen.statusRealTime === 'Ada di Ruang Dosen'
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : dosen.statusRealTime === 'Bimbingan Mahasiswa'
                          ? 'bg-purple-50 border-purple-300 text-purple-800'
                          : dosen.statusRealTime === 'Izin / Tugas Luar'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-slate-50 border-slate-300 text-slate-700'
                  }`}
                >
                  <option value="Sedang Mengajar">Sedang Mengajar</option>
                  <option value="Ada di Ruang Dosen">Di Ruang Dosen</option>
                  <option value="Bimbingan Mahasiswa">Bimbingan Mhs</option>
                  <option value="Izin / Tugas Luar">Izin / Dinas Luar</option>
                  <option value="Belum Hadir">Belum Hadir</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Controls & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        
        {/* Day Selector Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedDay === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Hari
            </button>
            {hariOptions.map((h) => {
              const isToday = h === currentDay;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => setSelectedDay(h)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                    selectedDay === h
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{h}</span>
                  {isToday && (
                    <span className="text-[10px] text-emerald-600 font-bold">●</span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Jadwal / Kuliah Pengganti</span>
          </button>
        </div>

        {/* Filter Dropdowns & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          
          {/* Scope Prodi */}
          <div>
            <select
              value={filterProdiScope}
              onChange={(e) => setFilterProdiScope(e.target.value)}
              className="w-full text-xs font-medium border border-blue-200 rounded-lg p-2 bg-blue-50/60 text-blue-900"
            >
              <option value="current">Jadwal: {selectedProdi.singkatan}</option>
              <option value="all">Semua Program Studi</option>
              <option value="SIPIL">S1 Teknik Sipil</option>
              <option value="LINGKUNGAN">S1 Teknik Lingkungan (67 Kelas)</option>
              <option value="LISTRIK_D3">D3 Teknik Listrik</option>
            </select>
          </div>

          {/* Jenis Kelas Filter (REG / KAR) */}
          <div>
            <select
              value={filterJenisKelas}
              onChange={(e) => setFilterJenisKelas(e.target.value)}
              className="w-full text-xs font-semibold border border-indigo-200 rounded-lg p-2 bg-indigo-50/60 text-indigo-900"
            >
              <option value="all">Semua Jenis Kelas</option>
              <option value="REG">Kelas Reguler (REG)</option>
              <option value="KAR">Kelas Karyawan (KAR)</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari matakuliah, kode, dosen..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>

          {/* Dosen Filter */}
          <div>
            <select
              value={filterDosenNidn}
              onChange={(e) => setFilterDosenNidn(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-700"
            >
              <option value="all">Semua Dosen Pengampu</option>
              {dosenList.map((d) => (
                <option key={d.nidn} value={d.nidn}>{d.namaLengkap}</option>
              ))}
            </select>
          </div>

          {/* Ruangan Filter */}
          <div>
            <select
              value={filterRuanganId}
              onChange={(e) => setFilterRuanganId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-700"
            >
              <option value="all">Semua Ruang & Lab</option>
              {ruanganList.map((r) => (
                <option key={r.id} value={r.id}>{r.nama} ({r.kode})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status context strip */}
        <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Menampilkan <strong className="text-slate-900 font-mono">{filteredJadwal.length}</strong> jadwal kelas
              {selectedDay !== 'all' ? ` hari ${selectedDay}` : ''}
            </span>
            <span className="text-slate-300">|</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              {filteredJadwal.filter(j => j.jenisKelas === 'REG' || j.jenisKelas === 'Reguler' || !j.jenisKelas).length} Reguler (REG)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {filteredJadwal.filter(j => j.jenisKelas === 'KAR' || j.jenisKelas === 'Karyawan').length} Karyawan (KAR)
            </span>
            {selectedProdi.id === 'LINGKUNGAN' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Resmi S1 Teknik Lingkungan FT UNBARI
              </span>
            )}
          </div>
          {liveCount > 0 && (
            <span className="text-emerald-700 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ● {liveCount} sesi kelas sedang berlangsung saat ini
            </span>
          )}
        </div>
      </div>

      {/* Main Schedule Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Hari & Jam</th>
                <th className="py-3 px-4">Mata Kuliah & Kelas</th>
                <th className="py-3 px-3">Program Studi</th>
                <th className="py-3 px-4">Dosen Pengampu</th>
                <th className="py-3 px-4">Ruang / Lab</th>
                <th className="py-3 px-3 text-center">Status Sesi Real-Time</th>
                <th className="py-3 px-3">BAP Pertemuan</th>
                <th className="py-3 px-4 text-center">Aksi Kaprodi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJadwal.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">Tidak ada jadwal kuliah yang cocok.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Coba pilih hari lain atau reset filter Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredJadwal.map((jadwal) => {
                  const isLive = isJadwalSedangBerlangsung(jadwal, currentDay, currentTimeStr);
                  return (
                    <tr 
                      key={jadwal.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isLive ? 'bg-emerald-50/20' : ''}`}
                    >
                      {/* Day & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{jadwal.hari}</div>
                        <div className="font-mono text-[11px] text-slate-600 font-medium">
                          {jadwal.jamMulai} - {jadwal.jamSelesai}
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px] font-semibold">{jadwal.kodeMK}</span>
                          <span>·</span>
                          <span className="line-clamp-1">{jadwal.namaMK}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                          <span className="font-semibold text-slate-800">Kelas {jadwal.kelas}</span>
                          {jadwal.jenisKelas && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              jadwal.jenisKelas === 'REG' || jadwal.jenisKelas === 'Reguler'
                                ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}>
                              {jadwal.jenisKelas === 'REG' ? 'REGULER' : 'KARYAWAN'}
                            </span>
                          )}
                          <span>·</span>
                          <span className="font-mono font-medium">{jadwal.sks} SKS</span>
                          <span>·</span>
                          <span className={`font-mono inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] border ${
                            (jadwal.terdaftar ?? jadwal.pesertaTotal) === 0
                              ? 'bg-slate-50 text-slate-400 border-slate-200'
                              : (jadwal.terdaftar ?? jadwal.pesertaTotal) >= (jadwal.kuota ?? 30)
                                ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                          }`}>
                            <Users className="w-3 h-3 text-slate-400" />
                            {jadwal.terdaftar !== undefined 
                              ? `${jadwal.terdaftar} / ${jadwal.kuota ?? 30} Terdaftar` 
                              : `${jadwal.pesertaTotal} Mahasiswa`}
                          </span>
                        </div>
                      </td>

                      {/* Program Studi */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {jadwal.programStudi}
                        </span>
                      </td>

                      {/* Lecturer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{jadwal.dosenNama}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          NIDN: {jadwal.dosenNidn}
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{jadwal.ruanganNama}</span>
                        </div>
                      </td>

                      {/* Live Session Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isLive ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded">
                              ● Sedang Berlangsung
                            </span>
                            <span className="text-[10px] text-emerald-700 font-mono mt-0.5">
                              {hitungSisaWaktu(jadwal, currentTimeStr)}
                            </span>
                          </div>
                        ) : (
                          <select
                            value={jadwal.statusSesi}
                            onChange={(e) => onUpdateJadwal({ ...jadwal, statusSesi: e.target.value as any })}
                            className="text-[11px] border border-slate-200 rounded px-2 py-0.5 bg-slate-50 text-slate-700"
                          >
                            <option value="Belum Mulai">Belum Mulai</option>
                            <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Ditiadakan">Ditiadakan</option>
                            <option value="Diganti">Diganti</option>
                          </select>
                        )}
                      </td>

                      {/* BAP Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          jadwal.bapStatus === 'Terverifikasi'
                            ? 'bg-emerald-100 text-emerald-800'
                            : jadwal.bapStatus === 'Menunggu Verifikasi Kaprodi'
                              ? 'bg-blue-100 text-blue-800 font-bold'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {jadwal.bapStatus}
                        </span>
                      </td>

                      {/* Kaprodi Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBapJadwal(jadwal)}
                            className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          >
                            BAP & Presensi
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteJadwal(jadwal.id)}
                            title="Hapus Jadwal"
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
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

      {/* BAP Verification Modal */}
      {selectedBapJadwal && (
        <BapVerificationModal
          jadwal={selectedBapJadwal}
          onClose={() => setSelectedBapJadwal(null)}
          onApprove={(id, catatan) => onVerifyBap(id, catatan)}
        />
      )}

      {/* Add Schedule Modal with Clash Detection */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tambah Jadwal Perkuliahan / Kelas Pengganti</h3>
                <p className="text-xs text-slate-500">{newJadwal.programStudi}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {conflictError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Peringatan Bentrok Jadwal!</strong>
                  <span>{conflictError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateJadwal} className="space-y-3 mt-4 text-xs">
              
              <div>
                <label className="block text-slate-700 font-medium mb-1">Program Studi</label>
                <select
                  value={newJadwal.prodiId}
                  onChange={(e) => {
                    const pid = e.target.value as 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
                    const target = [
                      { id: 'SIPIL', nama: 'S1 Teknik Sipil' },
                      { id: 'LINGKUNGAN', nama: 'S1 Teknik Lingkungan' },
                      { id: 'LISTRIK_D3', nama: 'D3 Teknik Listrik' }
                    ].find(p => p.id === pid)!;

                    setNewJadwal({
                      ...newJadwal,
                      prodiId: pid,
                      programStudi: target.nama
                    });
                  }}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="SIPIL">S1 Teknik Sipil</option>
                  <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
                  <option value="LISTRIK_D3">D3 Teknik Listrik</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Kode MK *</label>
                  <input
                    type="text"
                    required
                    value={newJadwal.kodeMK}
                    onChange={(e) => setNewJadwal({ ...newJadwal, kodeMK: e.target.value })}
                    placeholder={newJadwal.prodiId === 'SIPIL' ? 'TSP-3101' : newJadwal.prodiId === 'LINGKUNGAN' ? 'TLK-2101' : 'TEL-2101'}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nama Mata Kuliah *</label>
                  <input
                    type="text"
                    required
                    value={newJadwal.namaMK}
                    onChange={(e) => setNewJadwal({ ...newJadwal, namaMK: e.target.value })}
                    placeholder="Contoh: Analisis Struktur Beton / AMDAL"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Beban SKS</label>
                  <input
                    type="number"
                    value={newJadwal.sks}
                    onChange={(e) => setNewJadwal({ ...newJadwal, sks: Number(e.target.value) })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Kelas</label>
                  <input
                    type="text"
                    value={newJadwal.kelas}
                    onChange={(e) => setNewJadwal({ ...newJadwal, kelas: e.target.value })}
                    placeholder="SPL-3A"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Total Mhs</label>
                  <input
                    type="number"
                    value={newJadwal.pesertaTotal}
                    onChange={(e) => setNewJadwal({ ...newJadwal, pesertaTotal: Number(e.target.value) })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Hari Kuliah</label>
                  <select
                    value={newJadwal.hari}
                    onChange={(e) => setNewJadwal({ ...newJadwal, hari: e.target.value as HariKuliah })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {hariOptions.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={newJadwal.jamMulai}
                    onChange={(e) => setNewJadwal({ ...newJadwal, jamMulai: e.target.value })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={newJadwal.jamSelesai}
                    onChange={(e) => setNewJadwal({ ...newJadwal, jamSelesai: e.target.value })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Dosen Pengampu</label>
                  <select
                    value={newJadwal.dosenNidn}
                    onChange={(e) => setNewJadwal({ ...newJadwal, dosenNidn: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {dosenList.filter(d => d.prodiId === newJadwal.prodiId).map((d) => (
                      <option key={d.nidn} value={d.nidn}>{d.namaLengkap}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ruangan / Lab</label>
                  <select
                    value={newJadwal.ruanganId}
                    onChange={(e) => setNewJadwal({ ...newJadwal, ruanganId: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {ruanganList.map((r) => (
                      <option key={r.id} value={r.id}>{r.nama} ({r.kode})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Topik Silabus Pertemuan</label>
                <input
                  type="text"
                  value={newJadwal.topikPertemuan}
                  onChange={(e) => setNewJadwal({ ...newJadwal, topikPertemuan: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Simpan & Verifikasi Bentrok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}

    </div>
  );
};
