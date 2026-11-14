import React from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  GraduationCap, 
  FileSpreadsheet, 
  Trash2, 
  Edit3,
  SlidersHorizontal,
  X,
  Download,
  Clock,
  ShieldAlert,
  UploadCloud
} from 'lucide-react';
import { Mahasiswa, StatusMahasiswa, Dosen, ProgramStudiInfo } from '../types/index';
import { MahasiswaDetailModal } from './MahasiswaDetailModal';
import { exportMahasiswaToPddiktiCsv } from '../utils/exportHelper';

interface MahasiswaViewProps {
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  selectedProdi: ProgramStudiInfo;
  onAddMahasiswa: (mhs: Mahasiswa) => void;
  onUpdateMahasiswa: (mhs: Mahasiswa) => void;
  onDeleteMahasiswa: (id: string) => void;
  selectedMahasiswa: Mahasiswa | null;
  onSelectMahasiswa: (mhs: Mahasiswa | null) => void;
  onImportMahasiswa?: (rawText: string) => { total: number; added: number; updated: number; skipped: number } | void;
}

export const MahasiswaView: React.FC<MahasiswaViewProps> = ({
  mahasiswaList,
  dosenList,
  selectedProdi,
  onAddMahasiswa,
  onUpdateMahasiswa,
  onDeleteMahasiswa,
  selectedMahasiswa,
  onSelectMahasiswa,
  onImportMahasiswa
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [importRawText, setImportRawText] = React.useState('');
  const [filterProdi, setFilterProdi] = React.useState<string>('current');
  const [filterAngkatan, setFilterAngkatan] = React.useState<string>('all');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Filter available lecturers for the current prodi
  const prodiDosenList = dosenList.filter(d => d.prodiId === selectedProdi.id);

  // New Student Form state
  const [newMhs, setNewMhs] = React.useState({
    nim: '',
    nama: '',
    programStudi: selectedProdi.nama,
    prodiId: selectedProdi.id,
    jenjang: selectedProdi.jenjang,
    angkatan: 2024,
    semester: 1,
    ipk: 3.50,
    sksLulus: 20,
    sksSemesterIni: 20,
    sksTargetLulus: selectedProdi.sksKelulusan,
    status: 'Aktif' as StatusMahasiswa,
    dosenPA: prodiDosenList[0]?.namaLengkap || dosenList[0]?.namaLengkap || '',
    email: '',
    nomorHp: '',
    kehadiranPersen: 100,
    konsentrasi: selectedProdi.id === 'SIPIL' ? 'Struktur Beton' : selectedProdi.id === 'LINGKUNGAN' ? 'Pengolahan Air Buangan' : 'Instalasi Tenaga Listrik'
  });

  // Keep new student form synced with selectedProdi when modal opens
  React.useEffect(() => {
    setNewMhs(prev => ({
      ...prev,
      programStudi: selectedProdi.nama,
      prodiId: selectedProdi.id,
      jenjang: selectedProdi.jenjang,
      sksTargetLulus: selectedProdi.sksKelulusan,
      dosenPA: prodiDosenList[0]?.namaLengkap || dosenList[0]?.namaLengkap || '',
      konsentrasi: selectedProdi.id === 'SIPIL' ? 'Struktur Beton' : selectedProdi.id === 'LINGKUNGAN' ? 'Pengolahan Air Buangan' : 'Instalasi Tenaga Listrik'
    }));
  }, [selectedProdi]);

  // Filtered List
  const filteredList = mahasiswaList.filter((m) => {
    const matchProdi = 
      filterProdi === 'all' 
        ? true 
        : filterProdi === 'current' 
          ? m.prodiId === selectedProdi.id 
          : m.prodiId === filterProdi;

    const matchSearch = 
      m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nim.includes(searchQuery) ||
      m.dosenPA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.konsentrasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.asalSekolah && m.asalSekolah.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.jenisKelas && m.jenisKelas.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchAngkatan = filterAngkatan === 'all' || m.angkatan.toString() === filterAngkatan;
    const matchStatus = 
      filterStatus === 'all' 
        ? true 
        : filterStatus === 'Kritis_Masa_Studi'
          ? m.semester >= 8 && m.status !== 'Lulus'
          : m.status === filterStatus;

    return matchProdi && matchSearch && matchAngkatan && matchStatus;
  });

  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(50);

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterProdi, filterStatus, filterAngkatan, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = pageSize === -1 
    ? filteredList 
    : filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const uniqueAngkatan = Array.from(new Set(mahasiswaList.map(m => m.angkatan))).sort((a, b) => b - a);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMhs.nim || !newMhs.nama) return;

    const id = `MHS-${Date.now().toString().slice(-4)}`;
    onAddMahasiswa({
      ...newMhs,
      id,
      peringatanSp: 0
    });

    setShowAddModal(false);
    setNewMhs({
      nim: '',
      nama: '',
      programStudi: selectedProdi.nama,
      prodiId: selectedProdi.id,
      jenjang: selectedProdi.jenjang,
      angkatan: 2024,
      semester: 1,
      ipk: 3.50,
      sksLulus: 20,
      sksSemesterIni: 20,
      sksTargetLulus: selectedProdi.sksKelulusan,
      status: 'Aktif',
      dosenPA: prodiDosenList[0]?.namaLengkap || dosenList[0]?.namaLengkap || '',
      email: '',
      nomorHp: '',
      kehadiranPersen: 100,
      konsentrasi: selectedProdi.id === 'SIPIL' ? 'Struktur Beton' : selectedProdi.id === 'LINGKUNGAN' ? 'Pengolahan Air Buangan' : 'Instalasi Tenaga Listrik'
    });
  };

  // Summary Metrics
  const avgIpk = (filteredList.reduce((acc, m) => acc + m.ipk, 0) / (filteredList.length || 1)).toFixed(2);
  const berisikoCount = filteredList.filter(m => m.status === 'Berisiko' || m.peringatanSp > 0).length;
  const kritisCount = filteredList.filter(m => m.semester >= 8 && m.status !== 'Lulus').length;

  const handleExportCsv = () => {
    const label = filterStatus !== 'all' ? filterStatus : filterAngkatan !== 'all' ? `Angkatan_${filterAngkatan}` : 'Semua';
    exportMahasiswaToPddiktiCsv(filteredList, selectedProdi.nama, label);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Action & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari NIM, Nama, Dosen PA, atau Konsentrasi..."
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

          {/* Filters & Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filter Prodi Scope */}
            <select
              value={filterProdi}
              onChange={(e) => setFilterProdi(e.target.value)}
              className="text-xs font-medium border border-blue-200 rounded-lg px-2.5 py-2 bg-blue-50/60 text-blue-900"
            >
              <option value="current">Prodi Aktif: {selectedProdi.singkatan}</option>
              <option value="all">Semua Program Studi (Sipil, Lingkungan, D3 Listrik)</option>
              <option value="SIPIL">S1 Teknik Sipil</option>
              <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
              <option value="LISTRIK_D3">D3 Teknik Listrik</option>
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium"
            >
              <option value="all">Semua Status Mahasiswa</option>
              <option value="Aktif">Status: Aktif</option>
              <option value="Kritis_Masa_Studi">⚠️ Masa Studi Kritis (Sem 8+)</option>
              <option value="Berisiko">Status: Berisiko (Evaluasi)</option>
              <option value="Tugas Akhir">Status: Tugas Akhir / Skripsi</option>
              <option value="Cuti">Status: Cuti Akademik</option>
              <option value="Non-Aktif">Status: Non-Aktif</option>
              <option value="Pindah">Status: Pindah</option>
              <option value="Lulus">Status: Lulus</option>
            </select>

            {/* Filter Angkatan */}
            <select
              value={filterAngkatan}
              onChange={(e) => setFilterAngkatan(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700"
            >
              <option value="all">Semua Angkatan</option>
              {uniqueAngkatan.map(ang => (
                <option key={ang} value={ang.toString()}>Angkatan {ang}</option>
              ))}
            </select>

            {/* Export PDDIKTI / Excel Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              title="Unduh berkas CSV format Feeder PDDIKTI (kompatibel Excel)"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export PDDIKTI (.csv)</span>
            </button>

            {/* Import Bulk / TSV / Excel Button */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              title="Impor daftar mahasiswa secara massal (format teks baris, TSV, atau Excel)"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>Impor Data Massal</span>
            </button>

            {/* Add Student Button */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Mahasiswa</span>
            </button>
          </div>

        </div>

        {/* Quick Filter Strip for Kaprodi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500 flex-wrap">
            <span>Ditemukan: <strong className="text-slate-900 font-mono">{filteredList.length}</strong> mahasiswa</span>
            <span aria-hidden="true">·</span>
            <span>Rata-rata IPK: <strong className="text-slate-900 font-mono">{avgIpk}</strong></span>
            {berisikoCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700 font-medium">
                  {berisikoCount} Mahasiswa Berisiko/SP
                </span>
              </>
            )}
            {kritisCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-rose-700 font-medium">
                  {kritisCount} Mahasiswa Sem 8+
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            <span className="text-slate-400">Filter Cepat:</span>
            <button
              type="button"
              onClick={() => { setFilterStatus('Kritis_Masa_Studi'); setFilterAngkatan('all'); }}
              className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${filterStatus === 'Kritis_Masa_Studi' ? 'bg-rose-100 text-rose-800 font-bold border border-rose-300' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              <span>Masa Studi Kritis (Sem 8+)</span>
              {kritisCount > 0 && (
                <span className="px-1 py-0.1 bg-rose-200 text-rose-900 rounded font-mono font-bold text-[10px]">
                  {kritisCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setFilterStatus('Berisiko'); setFilterAngkatan('all'); }}
              className={`px-2 py-0.5 rounded transition-colors ${filterStatus === 'Berisiko' ? 'bg-amber-100 text-amber-800 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Perlu Evaluasi
            </button>
            <button
              type="button"
              onClick={() => { setFilterStatus('Tugas Akhir'); setFilterAngkatan('all'); }}
              className={`px-2 py-0.5 rounded transition-colors ${filterStatus === 'Tugas Akhir' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {selectedProdi.jenjang === 'D3' ? 'Proyek Akhir' : 'Skripsi'}
            </button>
            {(filterStatus !== 'all' || filterAngkatan !== 'all' || filterProdi !== 'current' || searchQuery) && (
              <button
                type="button"
                onClick={() => { setFilterStatus('all'); setFilterAngkatan('all'); setFilterProdi('current'); setSearchQuery(''); }}
                className="text-red-600 hover:text-red-800 ml-1 font-medium underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NIM & Mahasiswa</th>
                <th className="py-3 px-3">Program Studi</th>
                <th className="py-3 px-3">Angkatan / Sem</th>
                <th className="py-3 px-3 text-right">IPK</th>
                <th className="py-3 px-3 text-right">SKS Lulus</th>
                <th className="py-3 px-3 text-right">Presensi</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Dosen PA</th>
                <th className="py-3 px-4 text-center">Aksi Kaprodi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">Tidak ada mahasiswa yang cocok dengan filter saat ini.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau status.</p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((m) => {
                  const isWarning = m.status === 'Berisiko' || m.peringatanSp > 0 || m.ipk < 2.50;
                  return (
                    <tr 
                      key={m.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${isWarning ? 'bg-amber-50/20' : ''}`}
                    >
                      {/* NIM & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900">{m.nama}</span>
                          {m.jenisKelamin && (
                            <span className={`text-[10px] font-bold px-1 rounded font-mono ${m.jenisKelamin === 'L' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-pink-50 text-pink-700 border border-pink-200'}`}>
                              {m.jenisKelamin}
                            </span>
                          )}
                          {m.jenisKelas === 'Karyawan' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              Karyawan
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span>{m.nim}</span>
                          {m.asalSekolah ? (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-600 font-sans">{m.asalSekolah}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-600 font-sans">{m.konsentrasi}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Program Studi */}
                      <td className="py-3 px-3">
                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {m.programStudi}
                        </span>
                      </td>

                      {/* Angkatan & Semester */}
                      <td className="py-3 px-3 font-mono text-slate-700">
                        <div>Angk. {m.angkatan}</div>
                        <div className="text-[11px] text-slate-500">Sem. {m.semester}</div>
                        {m.semester >= 8 && m.status !== 'Lulus' && (
                          <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded font-sans ${
                            m.semester >= 12 
                              ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {m.semester >= 12 ? '⚠️ DO Guard' : '⚠️ Sem 8+'}
                          </span>
                        )}
                      </td>

                      {/* IPK Kumulatif */}
                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                        <span className={m.ipk < 2.50 ? 'text-amber-700' : 'text-slate-900'}>
                          {m.ipk.toFixed(2)}
                        </span>
                      </td>

                      {/* SKS Lulus */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        {m.sksLulus} <span className="text-[11px] text-slate-400">/ {m.sksTargetLulus || (m.jenjang === 'D3' ? 110 : 144)}</span>
                      </td>

                      {/* Presensi Kehadiran */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <span className={`font-semibold ${m.kehadiranPersen < 75 ? 'text-red-700' : 'text-emerald-700'}`}>
                          {m.kehadiranPersen}%
                        </span>
                      </td>

                      {/* Status Mahasiswa */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-block w-fit text-[11px] font-semibold px-2 py-0.5 rounded ${
                            m.status === 'Berisiko'
                              ? 'bg-amber-100 text-amber-800'
                              : m.status === 'Tugas Akhir'
                                ? 'bg-blue-100 text-blue-800'
                                : m.status === 'Aktif'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.status === 'Non-Aktif'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : m.status === 'Cuti'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.status}
                          </span>
                          {m.peringatanSp > 0 && (
                            <span className="text-[10px] font-bold text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> SP-{m.peringatanSp}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Dosen PA */}
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {m.dosenPA}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectMahasiswa(m)}
                            className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          >
                            Detail & Bimbingan
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMahasiswa(m.id)}
                            title="Hapus Data Mahasiswa"
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
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

        {/* Pagination Bar */}
        {filteredList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/70 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span>Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-slate-300 rounded px-2 py-1 bg-white text-xs font-medium"
              >
                <option value={25}>25 per halaman</option>
                <option value={50}>50 per halaman</option>
                <option value={100}>100 per halaman</option>
                <option value={-1}>Semua ({filteredList.length})</option>
              </select>
              <span className="text-slate-500">
                · Menampilkan {pageSize === -1 ? `1 - ${filteredList.length}` : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, filteredList.length)}`} dari <strong className="text-slate-900 font-mono">{filteredList.length}</strong> mahasiswa
              </span>
            </div>

            {pageSize !== -1 && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <span className="px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 bg-slate-100 rounded border border-slate-200">
                  Hal {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail / Action Modal */}
      {selectedMahasiswa && (
        <MahasiswaDetailModal
          mahasiswa={selectedMahasiswa}
          onClose={() => onSelectMahasiswa(null)}
          onUpdateMahasiswa={onUpdateMahasiswa}
          dosenList={dosenList}
        />
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pendaftaran Data Mahasiswa Baru</h3>
                <p className="text-xs text-slate-500">{newMhs.programStudi} ({newMhs.jenjang})</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 mt-4 text-xs">
              
              <div>
                <label className="block text-slate-700 font-medium mb-1">Program Studi</label>
                <select
                  value={newMhs.prodiId}
                  onChange={(e) => {
                    const pid = e.target.value as 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
                    const targetProdi = [
                      { id: 'SIPIL', nama: 'S1 Teknik Sipil', jenjang: 'S1' as const, sks: 144 },
                      { id: 'LINGKUNGAN', nama: 'S1 Teknik Lingkungan', jenjang: 'S1' as const, sks: 144 },
                      { id: 'LISTRIK_D3', nama: 'D3 Teknik Listrik', jenjang: 'D3' as const, sks: 110 }
                    ].find(p => p.id === pid)!;

                    setNewMhs({
                      ...newMhs,
                      prodiId: pid,
                      programStudi: targetProdi.nama,
                      jenjang: targetProdi.jenjang,
                      sksTargetLulus: targetProdi.sks
                    });
                  }}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="SIPIL">S1 Teknik Sipil</option>
                  <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
                  <option value="LISTRIK_D3">D3 Teknik Listrik (Vokasi)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nomor Induk (NIM) *</label>
                  <input
                    type="text"
                    required
                    value={newMhs.nim}
                    onChange={(e) => setNewMhs({ ...newMhs, nim: e.target.value })}
                    placeholder={newMhs.jenjang === 'D3' ? '2400311099' : '2410111099'}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={newMhs.nama}
                    onChange={(e) => setNewMhs({ ...newMhs, nama: e.target.value })}
                    placeholder="Nama mahasiswa..."
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Angkatan</label>
                  <input
                    type="number"
                    value={newMhs.angkatan}
                    onChange={(e) => setNewMhs({ ...newMhs, angkatan: Number(e.target.value) })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Semester</label>
                  <input
                    type="number"
                    value={newMhs.semester}
                    onChange={(e) => setNewMhs({ ...newMhs, semester: Number(e.target.value) })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">IPK Awal</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMhs.ipk}
                    onChange={(e) => setNewMhs({ ...newMhs, ipk: Number(e.target.value) })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Dosen PA</label>
                  <select
                    value={newMhs.dosenPA}
                    onChange={(e) => setNewMhs({ ...newMhs, dosenPA: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {dosenList.filter(d => d.prodiId === newMhs.prodiId).map((d) => (
                      <option key={d.id} value={d.namaLengkap}>{d.namaLengkap}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Bidang Minat / Konsentrasi</label>
                  <input
                    type="text"
                    value={newMhs.konsentrasi}
                    onChange={(e) => setNewMhs({ ...newMhs, konsentrasi: e.target.value })}
                    placeholder="Contoh: Geoteknik, Air Bersih, Panel Daya"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Email Mahasiswa</label>
                  <input
                    type="email"
                    value={newMhs.email}
                    onChange={(e) => setNewMhs({ ...newMhs, email: e.target.value })}
                    placeholder="nama@mhs.ft.ac.id"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={newMhs.nomorHp}
                    onChange={(e) => setNewMhs({ ...newMhs, nomorHp: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
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
                  Simpan Mahasiswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Mahasiswa Massal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Impor Data Mahasiswa Massal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dukungan parsing otomatis format teks TSV (tab-separated), Excel/SIAKAD, atau JSON tanpa duplikasi NIM.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Info banner & format guide */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-blue-900">
                <div className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Format Kolom yang Didukung (Dipisahkan Tab atau Spasi):
                </div>
                <code className="block bg-white p-2 rounded-lg border border-blue-200 text-[11px] font-mono text-slate-800 overflow-x-auto">
                  NIM &emsp; NAMA &emsp; JK (L/P) &emsp; PRODI &emsp; KELAS &emsp; ANGKATAN &emsp; STATUS &emsp; ASAL SEKOLAH
                </code>
                <p className="text-[11px] text-blue-800">
                  Data yang diimpor akan dicocokkan berdasarkan NIM. Jika NIM sudah ada, data profil akan diperbarui dan tidak akan dibuat dobel.
                </p>
              </div>

              {/* Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Tempelkan Baris Data Mahasiswa (TSV / Teks):
                  </label>
                  {importRawText.trim() && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Terdeteksi {importRawText.trim().split(/\r?\n/).filter(l => l.trim().length > 0).length} baris
                    </span>
                  )}
                </div>
                <textarea
                  value={importRawText}
                  onChange={(e) => setImportRawText(e.target.value)}
                  placeholder={`Contoh data:\n2100822201001\tTEGUH ARPRAYOGA\tL\tS-1-TEKNIK SIPIL\tREGULER\t2021/2022\tNON AKTIF\tSMA NEGERI 10 MERANGIN\n2100822201002\tM.HAYKAL JANUARIZKI\tL\tS-1-TEKNIK SIPIL\tREGULER\t2021/2022\tAKTIF\tSMA 2 KERINCI\n...`}
                  rows={10}
                  className="w-full font-mono text-[11px] border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed resize-y"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setImportRawText('')}
                className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                Kosongkan
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!importRawText.trim()}
                  onClick={() => {
                    if (onImportMahasiswa) {
                      onImportMahasiswa(importRawText);
                      setImportRawText('');
                      setShowImportModal(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Proses Impor (Tanpa Duplikasi NIM)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
