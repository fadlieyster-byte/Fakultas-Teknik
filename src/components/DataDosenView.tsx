import React, { useState, useMemo, useRef } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Award, 
  BookOpen, 
  GraduationCap, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  X
} from 'lucide-react';
import { Dosen, ProgramStudiInfo, JadwalKuliah, StatusKehadiranDosen } from '../types/index';
import { StandardKopSurat } from './StandardKopSurat';
import { printDocumentElement } from '../utils/printHelper';

interface DataDosenViewProps {
  dosenList: Dosen[];
  selectedProdi: ProgramStudiInfo;
  jadwalList?: JadwalKuliah[];
  onAddDosen: (dosen: Dosen) => void;
  onUpdateDosen: (dosen: Dosen) => void;
  onDeleteDosen: (nidn: string) => void;
}

export const DataDosenView: React.FC<DataDosenViewProps> = ({
  dosenList,
  selectedProdi,
  jadwalList = [],
  onAddDosen,
  onUpdateDosen,
  onDeleteDosen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [prodiFilter, setProdiFilter] = useState<string>('all');
  const [jabatanFilter, setJabatanFilter] = useState<string>('all');
  const [bebanFilter, setBebanFilter] = useState<string>('all'); // all, underload, ideal, overload
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDosen, setEditingDosen] = useState<Dosen | null>(null);
  const [deletingDosen, setDeletingDosen] = useState<Dosen | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const printDosenRef = useRef<HTMLDivElement>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState<Partial<Dosen>>({
    nidn: '',
    nuptk: '',
    namaLengkap: '',
    gelar: 'S.T., M.T.',
    prodiId: selectedProdi.id,
    programStudi: selectedProdi.nama,
    jabatanFungsional: 'Lektor',
    golongan: 'Penata (III/c)',
    pendidikanTerakhir: 'S2 Magister Teknik',
    email: '',
    noHp: '',
    keahlian: '',
    statusRealTime: 'Ada di Ruang Dosen',
    lokasiTerkini: 'Ruang Dosen Fakultas Teknik',
    totalSksMengajar: 12,
    jumlahMahasiswaBimbingan: 4,
    kehadiranBapPersen: 95
  });

  // Filtered Dosen List
  const filteredDosen = useMemo(() => {
    return dosenList.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        d.namaLengkap.toLowerCase().includes(q) ||
        d.nidn.toLowerCase().includes(q) ||
        (d.nuptk && d.nuptk.toLowerCase().includes(q)) ||
        d.keahlian.toLowerCase().includes(q) ||
        d.jabatanFungsional.toLowerCase().includes(q) ||
        (d.programStudi && d.programStudi.toLowerCase().includes(q));

      const matchesProdi = prodiFilter === 'all' || d.prodiId === prodiFilter;
      const matchesJabatan = jabatanFilter === 'all' || d.jabatanFungsional === jabatanFilter;

      let matchesBeban = true;
      if (bebanFilter === 'underload') matchesBeban = d.totalSksMengajar < 12;
      else if (bebanFilter === 'ideal') matchesBeban = d.totalSksMengajar >= 12 && d.totalSksMengajar <= 16;
      else if (bebanFilter === 'overload') matchesBeban = d.totalSksMengajar > 16;

      return matchesSearch && matchesProdi && matchesJabatan && matchesBeban;
    });
  }, [dosenList, searchQuery, prodiFilter, jabatanFilter, bebanFilter]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const total = dosenList.length;
    const prodiSipil = dosenList.filter(d => d.prodiId === 'SIPIL').length;
    const prodiLingkungan = dosenList.filter(d => d.prodiId === 'LINGKUNGAN').length;
    const prodiListrik = dosenList.filter(d => d.prodiId === 'LISTRIK_D3').length;

    const totalSks = dosenList.reduce((acc, d) => acc + (d.totalSksMengajar || 0), 0);
    const avgSks = total > 0 ? (totalSks / total).toFixed(1) : '0';

    const s3Count = dosenList.filter(d => (d.pendidikanTerakhir || '').includes('S3') || (d.gelar || '').includes('Dr')).length;
    const s2Count = total - s3Count;
    const lektorKepala = dosenList.filter(d => d.jabatanFungsional === 'Lektor Kepala' || d.jabatanFungsional === 'Guru Besar').length;

    return { total, prodiSipil, prodiLingkungan, prodiListrik, avgSks, s3Count, s2Count, lektorKepala };
  }, [dosenList]);

  // Open modal for add
  const handleOpenAdd = () => {
    setFormData({
      nidn: '',
      nuptk: '',
      namaLengkap: '',
      gelar: 'S.T., M.T.',
      prodiId: selectedProdi.id,
      programStudi: selectedProdi.nama,
      jabatanFungsional: 'Lektor',
      golongan: 'Penata (III/c)',
      pendidikanTerakhir: 'S2 Magister Teknik',
      email: '',
      noHp: '',
      keahlian: '',
      statusRealTime: 'Ada di Ruang Dosen',
      lokasiTerkini: 'Ruang Dosen Fakultas Teknik',
      totalSksMengajar: 12,
      jumlahMahasiswaBimbingan: 4,
      kehadiranBapPersen: 95
    });
    setIsAddModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (dosen: Dosen) => {
    setEditingDosen(dosen);
    setFormData({ ...dosen });
  };

  // Submit Add
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nidn || !formData.namaLengkap) return;

    const newDosen: Dosen = {
      id: `DOSEN-${Date.now()}`,
      nidn: formData.nidn,
      nuptk: formData.nuptk || formData.nidn,
      namaLengkap: formData.namaLengkap,
      gelar: formData.gelar || 'S.T., M.T.',
      prodiId: (formData.prodiId as any) || selectedProdi.id,
      programStudi: formData.prodiId === 'SIPIL' ? 'S1 Teknik Sipil' : formData.prodiId === 'LINGKUNGAN' ? 'S1 Teknik Lingkungan' : 'D3 Teknik Listrik',
      jabatanFungsional: (formData.jabatanFungsional as any) || 'Asisten Ahli',
      golongan: formData.golongan || 'Penata Muda (III/a)',
      pendidikanTerakhir: formData.pendidikanTerakhir || 'S2 Magister Teknik',
      email: formData.email || `${formData.nidn}@unbari.ac.id`,
      noHp: formData.noHp || '081234567890',
      keahlian: formData.keahlian || 'Rekayasa Teknik',
      statusRealTime: (formData.statusRealTime as StatusKehadiranDosen) || 'Ada di Ruang Dosen',
      lokasiTerkini: formData.lokasiTerkini || 'Kampus I UNBARI',
      totalSksMengajar: Number(formData.totalSksMengajar) || 12,
      jumlahMahasiswaBimbingan: Number(formData.jumlahMahasiswaBimbingan) || 2,
      kehadiranBapPersen: Number(formData.kehadiranBapPersen) || 100
    };

    onAddDosen(newDosen);
    setIsAddModalOpen(false);
  };

  // Submit Edit
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDosen || !formData.namaLengkap) return;

    const updated: Dosen = {
      ...editingDosen,
      ...formData,
      programStudi: formData.prodiId === 'SIPIL' ? 'S1 Teknik Sipil' : formData.prodiId === 'LINGKUNGAN' ? 'S1 Teknik Lingkungan' : 'D3 Teknik Listrik',
      totalSksMengajar: Number(formData.totalSksMengajar) || 0,
      jumlahMahasiswaBimbingan: Number(formData.jumlahMahasiswaBimbingan) || 0,
      kehadiranBapPersen: Number(formData.kehadiranBapPersen) || 100
    } as Dosen;

    onUpdateDosen(updated);
    setEditingDosen(null);
  };

  // Submit Delete
  const handleConfirmDelete = () => {
    if (deletingDosen) {
      onDeleteDosen(deletingDosen.nidn);
      setDeletingDosen(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Title & Action */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-700/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pangkalan Data Dosen Fakultas Teknik
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {dosenList.length} Dosen
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Profil kualifikasi akademik, bidang keahlian rekayasa, dan evaluasi beban kerja mengajar (SKS) dosen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Rekap Dosen (A4)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all shadow-md shadow-blue-700/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dosen Baru</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Tenaga Pengajar</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total} <span className="text-xs font-normal text-slate-500">Orang</span></div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600">
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">Sipil: {stats.prodiSipil}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">Lingk: {stats.prodiLingkungan}</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">Listrik: {stats.prodiListrik}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Rata-rata Beban Mengajar</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.avgSks} <span className="text-xs font-normal text-slate-500">SKS / Semester</span></div>
          <p className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Sesuai standar BKD Dikti (12-16 SKS)</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Kualifikasi Doktor (S3)</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.s3Count} <span className="text-xs font-normal text-slate-500">Doktor ({Math.round((stats.s3Count/stats.total)*100 || 0)}%)</span></div>
          <p className="text-[11px] text-slate-500 mt-2">
            Magister (S2): {stats.s2Count} Dosen aktif
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Jabatan Fungsional Senior</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.lektorKepala} <span className="text-xs font-normal text-slate-500">Lektor Kepala / GB</span></div>
          <p className="text-[11px] text-slate-500 mt-2">
            Pilar pembimbing riset &amp; akreditasi LAM-Teknik
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Dosen (Nama, NIDN, Keahlian, Jabatan, Program Studi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Prodi Filter */}
          <select
            value={prodiFilter}
            onChange={(e) => setProdiFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Program Studi</option>
            <option value="SIPIL">S1 Teknik Sipil</option>
            <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
            <option value="LISTRIK_D3">D3 Teknik Listrik</option>
          </select>

          {/* Jabatan Fungsional Filter */}
          <select
            value={jabatanFilter}
            onChange={(e) => setJabatanFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Jabatan</option>
            <option value="Asisten Ahli">Asisten Ahli</option>
            <option value="Lektor">Lektor</option>
            <option value="Lektor Kepala">Lektor Kepala</option>
            <option value="Guru Besar">Guru Besar</option>
          </select>

          {/* Beban SKS Filter */}
          <select
            value={bebanFilter}
            onChange={(e) => setBebanFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Semua Beban SKS</option>
            <option value="underload">&lt; 12 SKS (Di Bawah Beban)</option>
            <option value="ideal">12 - 16 SKS (Beban Ideal BKD)</option>
            <option value="overload">&gt; 16 SKS (Kelebihan Beban)</option>
          </select>
        </div>
      </div>

      {/* Faculty Cards Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDosen.map((dosen) => {
          const isIdeal = dosen.totalSksMengajar >= 12 && dosen.totalSksMengajar <= 16;
          const isOverload = dosen.totalSksMengajar > 16;
          
          return (
            <div 
              key={dosen.nidn} 
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header & Profile */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                      {dosen.namaLengkap.split(' ').filter(n => !n.includes('.') && n.length > 1)[0]?.charAt(0) || 'D'}
                      {dosen.namaLengkap.split(' ').filter(n => !n.includes('.') && n.length > 1)[1]?.charAt(0) || ''}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                        {dosen.namaLengkap}{dosen.gelar ? `, ${dosen.gelar}` : ''}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 font-mono">
                        <span>NIDN: {dosen.nidn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prodi Badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    dosen.prodiId === 'SIPIL' 
                      ? 'bg-blue-100 text-blue-800' 
                      : dosen.prodiId === 'LINGKUNGAN' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                  }`}>
                    {dosen.prodiId === 'SIPIL' ? 'Teknik Sipil' : dosen.prodiId === 'LINGKUNGAN' ? 'Teknik Lingkungan' : 'Teknik Listrik'}
                  </span>
                </div>

                {/* Jabatan & Pendidikan */}
                <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-slate-100 my-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jabatan Fungsional:</span>
                    <span className="font-semibold text-slate-800">{dosen.jabatanFungsional}</span>
                    <span className="text-[10px] text-slate-500 block">{dosen.golongan || 'Penata (III/c)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pendidikan:</span>
                    <span className="font-semibold text-slate-800 truncate block">{dosen.pendidikanTerakhir || 'S2 Magister Teknik'}</span>
                    <span className="text-[10px] text-emerald-700 font-medium">BAP: {dosen.kehadiranBapPersen}%</span>
                  </div>
                </div>

                {/* Keahlian Tags */}
                <div className="space-y-1 mb-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Bidang Keahlian:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dosen.keahlian.split(',').map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Beban Mengajar (SKS) Progress Bar */}
                <div className="space-y-1.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Beban Mengajar:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900">{dosen.totalSksMengajar} SKS</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isIdeal 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isOverload 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isIdeal ? 'Ideal' : isOverload ? 'Overload' : 'Kurang'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar vs 16 SKS max ideal */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isIdeal ? 'bg-emerald-500' : isOverload ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min((dosen.totalSksMengajar / 16) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Bimbingan TA/KP: <strong>{dosen.jumlahMahasiswaBimbingan} Mhs</strong></span>
                    <span>Status: <strong className="text-slate-800">{dosen.statusRealTime}</strong></span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  {dosen.email && (
                    <a href={`mailto:${dosen.email}`} title={dosen.email} className="hover:text-blue-700">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {dosen.noHp && (
                    <a href={`tel:${dosen.noHp}`} title={dosen.noHp} className="hover:text-blue-700">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(dosen)}
                    className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors font-medium text-xs shadow-2xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingDosen(dosen)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Hapus Data Dosen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDosen.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Tidak Ada Dosen Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ada data dosen yang sesuai dengan kata kunci pencarian atau kombinasi filter saat ini.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setProdiFilter('all'); setJabatanFilter('all'); setBebanFilter('all'); }}
            className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* MODAL 1: TAMBAH DOSEN BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tambah Profil Dosen Baru</h3>
                  <p className="text-xs text-slate-500">Pangkalan Data Dosen Fakultas Teknik UNBARI</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">NIDN (Nomor Induk Dosen Nasional) *</label>
                  <input
                    type="text"
                    required
                    placeholder="0012057801"
                    value={formData.nidn || ''}
                    onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">NUPTK / NIP</label>
                  <input
                    type="text"
                    placeholder="198205122008121002"
                    value={formData.nuptk || ''}
                    onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8">
                  <label className="block text-slate-700 font-bold mb-1">Nama Lengkap Dosen *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ir. H. Fachruddin"
                    value={formData.namaLengkap || ''}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-slate-700 font-bold mb-1">Gelar Akademik</label>
                  <input
                    type="text"
                    placeholder="S.T., M.T."
                    value={formData.gelar || ''}
                    onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Program Studi *</label>
                  <select
                    value={formData.prodiId}
                    onChange={(e) => setFormData({ ...formData, prodiId: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="SIPIL">S1 Teknik Sipil</option>
                    <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
                    <option value="LISTRIK_D3">D3 Teknik Listrik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jabatan Fungsional</label>
                  <select
                    value={formData.jabatanFungsional}
                    onChange={(e) => setFormData({ ...formData, jabatanFungsional: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Asisten Ahli">Asisten Ahli</option>
                    <option value="Lektor">Lektor</option>
                    <option value="Lektor Kepala">Lektor Kepala</option>
                    <option value="Guru Besar">Guru Besar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bidang Keahlian / Kepakaran Rekayasa (Pisahkan dengan koma) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Geoteknik, Mekanika Tanah, Perancangan Pondasi Gedung"
                  value={formData.keahlian || ''}
                  onChange={(e) => setFormData({ ...formData, keahlian: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Beban Mengajar (SKS)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.totalSksMengajar || 12}
                    onChange={(e) => setFormData({ ...formData, totalSksMengajar: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mahasiswa Bimbingan</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.jumlahMahasiswaBimbingan || 4}
                    onChange={(e) => setFormData({ ...formData, jumlahMahasiswaBimbingan: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={formData.pendidikanTerakhir || 'S2 Magister Teknik'}
                    onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Surel / Email Resmi</label>
                  <input
                    type="email"
                    placeholder="nama.dosen@unbari.ac.id"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={formData.noHp || ''}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Simpan Data Dosen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PROFIL DOSEN */}
      {editingDosen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Edit Data &amp; Beban Dosen</h3>
                  <p className="text-xs text-slate-500">NIDN: {editingDosen.nidn} · {editingDosen.namaLengkap}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingDosen(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8">
                  <label className="block text-slate-700 font-bold mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaLengkap || ''}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-slate-700 font-bold mb-1">Gelar Akademik</label>
                  <input
                    type="text"
                    value={formData.gelar || ''}
                    onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Program Studi</label>
                  <select
                    value={formData.prodiId}
                    onChange={(e) => setFormData({ ...formData, prodiId: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="SIPIL">S1 Teknik Sipil</option>
                    <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
                    <option value="LISTRIK_D3">D3 Teknik Listrik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Jabatan Fungsional</label>
                  <select
                    value={formData.jabatanFungsional}
                    onChange={(e) => setFormData({ ...formData, jabatanFungsional: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Asisten Ahli">Asisten Ahli</option>
                    <option value="Lektor">Lektor</option>
                    <option value="Lektor Kepala">Lektor Kepala</option>
                    <option value="Guru Besar">Guru Besar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bidang Keahlian / Kepakaran Rekayasa</label>
                <input
                  type="text"
                  required
                  value={formData.keahlian || ''}
                  onChange={(e) => setFormData({ ...formData, keahlian: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Beban Mengajar (SKS)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.totalSksMengajar || 0}
                    onChange={(e) => setFormData({ ...formData, totalSksMengajar: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mahasiswa Bimbingan</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={formData.jumlahMahasiswaBimbingan || 0}
                    onChange={(e) => setFormData({ ...formData, jumlahMahasiswaBimbingan: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={formData.pendidikanTerakhir || ''}
                    onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Surel / Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formData.noHp || ''}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingDosen(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS DOSEN */}
      {deletingDosen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Data Dosen?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus data dosen <strong>{deletingDosen.namaLengkap}</strong> (NIDN: {deletingDosen.nidn}) dari pangkalan data Fakultas Teknik? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingDosen(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CETAK REKAPITULASI DOSEN (STANDAR A4) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-auto p-6 sm:p-8 flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-base">Pratinjau Dokumen Rekap Dosen (A4)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (printDosenRef.current) {
                      printDocumentElement(printDosenRef.current, {
                        documentTitle: `Rekapitulasi Data Dosen - ${selectedProdi.nama}`
                      });
                    } else {
                      window.print();
                    }
                  }}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  Cetak A4 (Ctrl+P)
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Simulated A4 Paper */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
              <div 
                ref={printDosenRef}
                className="printable-sheet bg-white border border-slate-300 w-full max-w-[794px] min-h-[1123px] p-8 sm:p-12 text-slate-900 font-serif leading-relaxed text-xs print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none"
              >
                
                {/* Standardized Kop Surat */}
                <StandardKopSurat 
                  showQrCode={true}
                  qrCodeUrl="https://universitasbatanghari.ac.id/ft/verifikasi/data-dosen"
                  qrBadgeText="DOSEN-VERIF"
                />

                <div className="text-center my-4 font-sans">
                  <h2 className="text-sm sm:text-base font-bold uppercase underline tracking-wider text-slate-950">
                    REKAPITULASI DATA DOSEN, KEAHLIAN &amp; BEBAN MENGAJAR
                  </h2>
                  <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                    SEMESTER GANJIL TAHUN AKADEMIK 2026/2027 · FAKULTAS TEKNIK
                  </p>
                </div>

                <table className="w-full border-collapse border border-slate-400 text-[10px] font-sans my-4">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold">
                      <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                      <th className="border border-slate-400 px-2.5 py-1.5 text-left">Nama Dosen &amp; Gelar</th>
                      <th className="border border-slate-400 px-2 py-1.5 text-center w-24">NIDN</th>
                      <th className="border border-slate-400 px-2 py-1.5 text-center w-28">Program Studi</th>
                      <th className="border border-slate-400 px-2 py-1.5 text-center w-24">Jabatan</th>
                      <th className="border border-slate-400 px-2.5 py-1.5 text-left">Bidang Keahlian</th>
                      <th className="border border-slate-400 px-2 py-1.5 text-center w-16">Beban SKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDosen.map((d, index) => (
                      <tr key={d.nidn}>
                        <td className="border border-slate-400 px-2 py-1 text-center font-medium">{index + 1}</td>
                        <td className="border border-slate-400 px-2.5 py-1 font-bold text-slate-900">
                          {d.namaLengkap}{d.gelar ? `, ${d.gelar}` : ''}
                        </td>
                        <td className="border border-slate-400 px-2 py-1 text-center font-mono">{d.nidn}</td>
                        <td className="border border-slate-400 px-2 py-1 text-center font-medium">
                          {d.prodiId === 'SIPIL' ? 'Teknik Sipil' : d.prodiId === 'LINGKUNGAN' ? 'Teknik Lingkungan' : 'Teknik Listrik'}
                        </td>
                        <td className="border border-slate-400 px-2 py-1 text-center">{d.jabatanFungsional}</td>
                        <td className="border border-slate-400 px-2.5 py-1 text-slate-700">{d.keahlian}</td>
                        <td className="border border-slate-400 px-2 py-1 text-center font-bold text-blue-950">{d.totalSksMengajar} SKS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Tanda Tangan Dekan */}
                <div className="font-sans pt-6 flex justify-end text-center text-xs">
                  <div className="w-64 space-y-1">
                    <p className="text-[11px] text-slate-800">Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-[11px] font-bold text-slate-900">Dekan Fakultas Teknik</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">[ Tanda Tangan &amp; Cap Fakultas ]</span>
                    </div>
                    <p className="font-bold underline text-slate-950 uppercase text-[11px]">
                      Dr. Ir. H. Fachruddin, M.T.
                    </p>
                    <p className="text-[10px] font-mono text-slate-600">NIP/NIDN: 196808121994031003</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
