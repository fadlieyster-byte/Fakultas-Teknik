import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RefreshCw, 
  Filter, 
  Edit3, 
  Users, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  FileSpreadsheet,
  Download,
  BarChart3
} from 'lucide-react';
import { 
  KetersediaanJadwalDosen, 
  HariKuliah, 
  StatusKetersediaanSlot, 
  ProgramStudiInfo, 
  Dosen, 
  JadwalKuliah 
} from '../types/index';
import { DAFTAR_HARI, cariIrisanWaktuDosen, IrisanSlot } from '../data/mockKetersediaanJadwalData';
import { KesesuaianJadwalPrintModal } from './KesesuaianJadwalPrintModal';
import { BebanMengajarDosenChart } from './BebanMengajarDosenChart';

interface TabelKesesuaianJadwalViewProps {
  ketersediaanList: KetersediaanJadwalDosen[];
  onUpdateKetersediaan: (updated: KetersediaanJadwalDosen) => void;
  selectedProdi: ProgramStudiInfo;
  dosenList: Dosen[];
  jadwalKuliahList?: JadwalKuliah[];
  onShowToast?: (msg: string) => void;
  onApplyIrisanToSidang?: (irisan: { hari: HariKuliah; jamMulai: string; jamSelesai: string; dosenIds: string[] }) => void;
}

export const TabelKesesuaianJadwalView: React.FC<TabelKesesuaianJadwalViewProps> = ({
  ketersediaanList,
  onUpdateKetersediaan,
  selectedProdi,
  dosenList,
  jadwalKuliahList = [],
  onShowToast,
  onApplyIrisanToSidang
}) => {
  const [prodiFilter, setProdiFilter] = useState<'current' | 'all' | 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showBebanChart, setShowBebanChart] = useState<boolean>(true);

  // Quick Cell Editor Modal / Popover State
  const [editingCell, setEditingCell] = useState<{
    dosen: KetersediaanJadwalDosen;
    hari: HariKuliah;
  } | null>(null);

  const [editStatus, setEditStatus] = useState<StatusKetersediaanSlot>('bersedia_penuh');
  const [editJam, setEditJam] = useState('09.00 – 12.00');
  const [editKeterangan, setEditKeterangan] = useState('');

  // Irisan Matcher State (Pencari Irisan Bebas Bentrok)
  const [selectedDosenIds, setSelectedDosenIds] = useState<string[]>([]);
  const [showMatcherPanel, setShowMatcherPanel] = useState(true);

  // Filter list
  const filteredList = useMemo(() => {
    return ketersediaanList.filter(d => {
      // Prodi Filter
      if (prodiFilter === 'current') {
        if (d.prodiId !== selectedProdi.id) return false;
      } else if (prodiFilter !== 'all') {
        if (d.prodiId !== prodiFilter) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = d.namaDosen.toLowerCase().includes(q);
        const matchNidn = d.nidn.includes(q);
        const matchCatatan = (d.catatanKhusus || '').toLowerCase().includes(q);
        if (!matchNama && !matchNidn && !matchCatatan) return false;
      }

      return true;
    });
  }, [ketersediaanList, prodiFilter, selectedProdi.id, searchQuery]);

  // Open Edit Cell Dialog
  const handleOpenEditCell = (dosen: KetersediaanJadwalDosen, hari: HariKuliah) => {
    const hariKey = hari.toLowerCase() as 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
    const currentSlot = dosen[hariKey];
    setEditingCell({ dosen, hari });
    setEditStatus(currentSlot.status);
    setEditJam(currentSlot.jam || '09.00 – 12.00');
    setEditKeterangan(currentSlot.keterangan || '');
  };

  // Save Edit Cell
  const handleSaveEditCell = () => {
    if (!editingCell) return;
    const { dosen, hari } = editingCell;
    const hariKey = hari.toLowerCase() as 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';

    const updatedDosen: KetersediaanJadwalDosen = {
      ...dosen,
      [hariKey]: {
        status: editStatus,
        jam: editStatus === 'jam_khusus' ? editJam : undefined,
        keterangan: editKeterangan.trim() ? editKeterangan.trim() : undefined
      },
      terakhirDiperbarui: new Date().toISOString().split('T')[0]
    };

    onUpdateKetersediaan(updatedDosen);
    setEditingCell(null);
    if (onShowToast) {
      onShowToast(`Ketersediaan ${dosen.namaDosen} pada hari ${hari} berhasil diperbarui.`);
    }
  };

  // Toggle quick status (Click directly to cycle: Bersedia Penuh -> Jam Khusus -> Tidak Bersedia)
  const handleQuickCycleCell = (e: React.MouseEvent, dosen: KetersediaanJadwalDosen, hari: HariKuliah) => {
    if (e.shiftKey || e.altKey) {
      // Direct quick editor on Shift+Click
      handleOpenEditCell(dosen, hari);
      return;
    }

    const hariKey = hari.toLowerCase() as 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
    const current = dosen[hariKey];
    let nextStatus: StatusKetersediaanSlot = 'bersedia_penuh';
    let nextJam: string | undefined = undefined;

    if (current.status === 'bersedia_penuh') {
      nextStatus = 'jam_khusus';
      nextJam = '09.00 – 12.00';
    } else if (current.status === 'jam_khusus') {
      nextStatus = 'tidak_bersedia';
    } else {
      nextStatus = 'bersedia_penuh';
    }

    const updated: KetersediaanJadwalDosen = {
      ...dosen,
      [hariKey]: {
        status: nextStatus,
        jam: nextJam,
        keterangan: current.keterangan
      },
      terakhirDiperbarui: new Date().toISOString().split('T')[0]
    };

    onUpdateKetersediaan(updated);
  };

  // Synchronize teaching conflicts from jadwalKuliahList
  const handleSyncWithTeachingSchedule = () => {
    let changeCount = 0;
    ketersediaanList.forEach(d => {
      // Find classes taught by this lecturer
      const classes = jadwalKuliahList.filter(j => j.dosenNidn === d.nidn || j.dosenNama.includes(d.namaDosen));
      if (classes.length > 0) {
        let updated = { ...d };
        DAFTAR_HARI.forEach(hari => {
          const classOnDay = classes.find(c => c.hari === hari);
          if (classOnDay) {
            const hariKey = hari.toLowerCase() as 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
            updated[hariKey] = {
              status: 'jam_khusus',
              jam: classOnDay.jamMulai <= '10:00' ? '13.30 – 16.00' : '08.30 – 11.30',
              keterangan: `Mengajar ${classOnDay.namaMK} (${classOnDay.jamMulai} - ${classOnDay.jamSelesai})`
            };
            changeCount++;
          }
        });
        onUpdateKetersediaan(updated);
      }
    });

    if (onShowToast) {
      onShowToast(`Sinkronisasi selesai! ${changeCount} slot disesuaikan dengan jadwal mengajar dosen.`);
    }
  };

  // Selected Dosen for Irisan Matching
  const selectedDosenForMatcher = useMemo(() => {
    return ketersediaanList.filter(d => selectedDosenIds.includes(d.id));
  }, [ketersediaanList, selectedDosenIds]);

  const irisanHasil: IrisanSlot[] = useMemo(() => {
    return cariIrisanWaktuDosen(selectedDosenForMatcher);
  }, [selectedDosenForMatcher]);

  const toggleSelectDosenForMatcher = (id: string) => {
    setSelectedDosenIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card: Template Header from WhatsApp Image */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img 
              src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
              alt="Logo Universitas Batanghari" 
              className="w-14 h-14 object-contain bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0" 
            />
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <span>Fakultas Teknik Universitas Batanghari</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-black">UNBARI</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Tabel Kesesuaian Jadwal Dosen Pembahas/Penguji Seminar KP dan TA
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-900 text-white shadow-2xs">
                  <Calendar className="w-3 h-3" />
                  <span>Periode : Senin – Sabtu</span>
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedProdi.nama} &bull; Semester Ganjil TA 2026/2027
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowBebanChart(!showBebanChart)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                showBebanChart 
                  ? 'bg-blue-800 text-white border-blue-900 shadow-xs' 
                  : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{showBebanChart ? 'Tutup Grafik Beban' : 'Bagan Beban Mengajar'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncWithTeachingSchedule}
              title="Sinkronkan ketersediaan dengan jadwal mengajar dosen otomatis"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sinkron Jadwal Kuliah</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMatcherPanel(!showMatcherPanel)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                showMatcherPanel 
                  ? 'bg-purple-700 text-white border-purple-800' 
                  : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pencari Irisan Jadwal ({selectedDosenIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Unduh / Cetak Dokumen A4</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Filter Prodi:</span>
            </span>
            <button
              type="button"
              onClick={() => setProdiFilter('current')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                prodiFilter === 'current'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {selectedProdi.singkatan}
            </button>
            <button
              type="button"
              onClick={() => setProdiFilter('SIPIL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                prodiFilter === 'SIPIL'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              S1 Sipil
            </button>
            <button
              type="button"
              onClick={() => setProdiFilter('LINGKUNGAN')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                prodiFilter === 'LINGKUNGAN'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              S1 Lingkungan
            </button>
            <button
              type="button"
              onClick={() => setProdiFilter('LISTRIK_D3')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                prodiFilter === 'LISTRIK_D3'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              D3 Listrik
            </button>
            <button
              type="button"
              onClick={() => setProdiFilter('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                prodiFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Dosen FT
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Dosen, NIDN, atau Keahlian..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Visualisasi Distribusi Beban Mengajar Dosen (Overload / Ideal / Underload) */}
      {showBebanChart && (
        <BebanMengajarDosenChart
          dosenList={dosenList}
          selectedProdi={selectedProdi}
          jadwalKuliahList={jadwalKuliahList}
          ketersediaanList={ketersediaanList}
          prodiFilter={prodiFilter}
        />
      )}

      {/* Irisan Waktu / Smart Matcher Drawer Panel */}
      {showMatcherPanel && (
        <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-blue-50/90 border border-purple-200/80 rounded-2xl p-5 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-purple-200/60">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-purple-600 text-white rounded-xl shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-purple-950">
                  Pencocokan Otomatis Irisan Waktu (Bebas Bentrok Seminar/Sidang)
                </h2>
                <p className="text-[11px] text-purple-800">
                  Pilih 2 hingga 4 dosen penguji/pembimbing untuk menghitung jadwal sidang tanpa benturan mengajar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-900 font-semibold">
                Dosen Dipilih: <strong className="font-mono text-purple-950">{selectedDosenIds.length}</strong>
              </span>
              {selectedDosenIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedDosenIds([])}
                  className="text-[11px] text-purple-700 hover:text-purple-950 underline font-semibold"
                >
                  Reset Pilihan
                </button>
              )}
            </div>
          </div>

          {/* Quick Lecturer Selector Pills */}
          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Klik nama dosen untuk memasukkan ke dalam irisan sidang:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {filteredList.map(d => {
                const isSelected = selectedDosenIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleSelectDosenForMatcher(d.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-700 text-white border-purple-800 shadow-2xs font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-slate-400'}`} />
                    <span className="truncate max-w-[200px]">{d.namaDosen}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matching Result Display */}
          <div className="mt-4 pt-3 border-t border-purple-200/60">
            {selectedDosenIds.length < 2 ? (
              <p className="text-xs text-purple-800/80 italic flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
                <span>Pilih minimal 2 dosen (misal: Pembimbing 1 dan Penguji 1) untuk melihat irisan waktu kosong bersama.</span>
              </p>
            ) : irisanHasil.length === 0 ? (
              <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Tidak ditemukan irisan waktu yang sama bebas bentrok untuk dewan penguji terpilih. Silakan sesuaikan salah satu jadwal dosen.</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Ditemukan {irisanHasil.length} Irisan Waktu Tersedia Bersama:</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {irisanHasil.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-purple-200 rounded-xl shadow-2xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                          <span className="text-blue-700">{slot.hari}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="font-mono text-emerald-700">{slot.jamMulai} - {slot.jamSelesai} WIB</span>
                        </div>
                        <span className="text-[10px] text-purple-800 font-medium block truncate">
                          {slot.keterangan}
                        </span>
                      </div>

                      {onApplyIrisanToSidang && (
                        <button
                          type="button"
                          onClick={() => onApplyIrisanToSidang({
                            hari: slot.hari,
                            jamMulai: slot.jamMulai,
                            jamSelesai: slot.jamSelesai,
                            dosenIds: selectedDosenIds
                          })}
                          className="px-2 py-1 text-[10px] font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-md transition-colors shrink-0"
                          title="Terapkan jadwal ini ke form penetapan sidang"
                        >
                          Pakai Jadwal →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Table: Exact Reproduction of the Image Design */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            {/* Deep Blue Table Header matching Image */}
            <thead>
              <tr className="bg-[#003876] text-white divide-x divide-blue-800 text-center font-bold text-xs">
                <th className="py-3 px-3 w-12 tracking-wide">No.</th>
                <th className="py-3 px-4 w-64 text-left tracking-wide">Nama Dosen</th>
                {DAFTAR_HARI.map(hari => (
                  <th key={hari} className="py-2.5 px-3 w-36">
                    <div className="text-xs font-black">{hari}</div>
                    <div className="text-[10px] font-normal text-blue-200 mt-0.5">Tersedia (Jam)</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ada data dosen yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map((dosen, index) => (
                  <tr 
                    key={dosen.id} 
                    className="hover:bg-blue-50/40 transition-colors divide-x divide-slate-200"
                  >
                    {/* No. */}
                    <td className="py-3 px-2 text-center font-bold text-slate-700 bg-slate-50/50">
                      {index + 1}.
                    </td>

                    {/* Nama Dosen */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">
                            {dosen.namaDosen}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-mono">
                              NIDN: {dosen.nidn}
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-semibold">
                              {dosen.prodiId}
                            </span>
                          </div>
                        </div>

                        {/* Quick Selection checkbox for Irisan Matcher */}
                        <button
                          type="button"
                          onClick={() => toggleSelectDosenForMatcher(dosen.id)}
                          title="Pilih dosen ini untuk analisis irisan waktu sidang"
                          className={`w-5 h-5 rounded flex items-center justify-center border text-[10px] font-bold transition-colors ${
                            selectedDosenIds.includes(dosen.id)
                              ? 'bg-purple-600 text-white border-purple-700'
                              : 'bg-white border-slate-300 text-slate-400 hover:border-purple-400'
                          }`}
                        >
                          {selectedDosenIds.includes(dosen.id) ? '✓' : '+'}
                        </button>
                      </div>
                    </td>

                    {/* Days Columns: Senin to Sabtu */}
                    {DAFTAR_HARI.map(hari => {
                      const hariKey = hari.toLowerCase() as 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
                      const slot = dosen[hariKey];
                      const isBersediaPenuh = slot.status === 'bersedia_penuh';
                      const isTidakBersedia = slot.status === 'tidak_bersedia';
                      const isJamKhusus = slot.status === 'jam_khusus';

                      return (
                        <td 
                          key={hari} 
                          className="py-2.5 px-2 text-center cursor-pointer select-none group relative hover:bg-blue-100/50 transition-colors"
                          onClick={(e) => handleQuickCycleCell(e, dosen, hari)}
                          onDoubleClick={() => handleOpenEditCell(dosen, hari)}
                          title="Klik untuk mengubah status ketersediaan. Dobel-klik untuk atur jam spesifik."
                        >
                          <div className="flex flex-col items-center justify-center min-h-[32px]">
                            {isBersediaPenuh && (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs shadow-2xs">
                                ✓
                              </div>
                            )}

                            {isTidakBersedia && (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs shadow-2xs">
                                ✕
                              </div>
                            )}

                            {isJamKhusus && (
                              <div className="text-[11px] font-bold text-slate-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md shadow-2xs font-mono">
                                {slot.jam || '09.00 – 12.00'}
                              </div>
                            )}

                            {slot.keterangan && (
                              <span className="text-[9px] text-slate-500 truncate max-w-[120px] mt-0.5" title={slot.keterangan}>
                                {slot.keterangan}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Information Boxes: Exactly matching the template in the WhatsApp Image */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Box 1: Keterangan Pengisian (5 cols) */}
        <div className="md:col-span-5 bg-blue-50/80 border border-blue-200 rounded-2xl p-4 shadow-2xs">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-900 text-white text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
            Keterangan Pengisian:
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0 shadow-2xs">
                ✓
              </span>
              <span className="font-semibold text-slate-800">
                = Bersedia / tersedia penuh
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[11px] shrink-0 shadow-2xs">
                ✕
              </span>
              <span className="font-semibold text-slate-800">
                = Tidak tersedia
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="font-bold font-mono text-blue-900 bg-blue-100 px-1.5 py-0.2 rounded text-[11px] shrink-0 border border-blue-200">
                Jam
              </span>
              <div className="text-slate-800 leading-snug">
                <span className="font-semibold">= Tersedia pada jam tertentu</span>
                <span className="text-slate-500 block text-[11px]">(misal : 09.00 – 12.00)</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-blue-200/60 text-[10px] text-blue-900 font-medium">
            💡 Tips: Klik sekali pada sel tabel untuk mengubah status dengan cepat, atau klik dobel untuk mengedit jam kustom.
          </div>
        </div>

        {/* Box 2: Catatan (7 cols) */}
        <div className="md:col-span-7 bg-blue-50/80 border border-blue-200 rounded-2xl p-4 shadow-2xs">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-900 text-white text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
            Catatan:
          </div>

          <ul className="space-y-2 text-xs text-slate-800 leading-relaxed list-disc list-inside">
            <li>
              <strong>Dosen mengisi ketersediaan waktu</strong> dari Senin sampai Sabtu pada awal setiap periode sidang.
            </li>
            <li>
              <strong>Jadwal seminar KP/TA disusun berdasarkan irisan waktu</strong> ketersediaan dosen pembahas dan penguji.
            </li>
            <li>
              <strong>Menghindari benturan</strong> dengan jadwal mengajar reguler, kegiatan akademik lain, praktikum lab, dan penugasan resmi fakultas.
            </li>
          </ul>

          <div className="mt-3 pt-2.5 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-slate-600">
            <span>Dekanat Fakultas Teknik UNBARI &bull; Biro Penjaminan Mutu</span>
            <span className="font-mono text-blue-900 font-bold">Dokumen Resmi FT UNBARI</span>
          </div>
        </div>

      </div>

      {/* Cell Editor Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <Edit3 className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Atur Ketersediaan Jadwal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Dosen Penguji / Pembahas:</span>
                <div className="font-bold text-slate-900 text-sm">{editingCell.dosen.namaDosen}</div>
                <div className="text-slate-500 font-mono text-[11px]">NIDN: {editingCell.dosen.nidn} &bull; Hari: <strong>{editingCell.hari}</strong></div>
              </div>

              {/* Status Radio options */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">Pilih Status Ketersediaan:</label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    editStatus === 'bersedia_penuh' ? 'bg-emerald-50 border-emerald-500 font-bold' : 'hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="status_ketersediaan"
                      checked={editStatus === 'bersedia_penuh'}
                      onChange={() => setEditStatus('bersedia_penuh')}
                      className="text-emerald-600"
                    />
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs">
                      ✓
                    </span>
                    <span>Bersedia / Tersedia Penuh (Sepanjang Hari)</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    editStatus === 'jam_khusus' ? 'bg-blue-50 border-blue-500 font-bold' : 'hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="status_ketersediaan"
                      checked={editStatus === 'jam_khusus'}
                      onChange={() => setEditStatus('jam_khusus')}
                      className="text-blue-600"
                    />
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100 px-1 rounded">
                      Jam
                    </span>
                    <span>Tersedia pada Jam Tertentu</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    editStatus === 'tidak_bersedia' ? 'bg-red-50 border-red-500 font-bold' : 'hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="status_ketersediaan"
                      checked={editStatus === 'tidak_bersedia'}
                      onChange={() => setEditStatus('tidak_bersedia')}
                      className="text-red-600"
                    />
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white font-bold text-xs">
                      ✕
                    </span>
                    <span>Tidak Tersedia (Ada Jadwal Lain / Bentrok)</span>
                  </label>
                </div>
              </div>

              {/* Specific Hours Input when Jam Khusus selected */}
              {editStatus === 'jam_khusus' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <label className="block font-bold text-blue-950 text-xs">
                    Tentukan Rentang Jam Tersedia:
                  </label>
                  <input
                    type="text"
                    value={editJam}
                    onChange={(e) => setEditJam(e.target.value)}
                    placeholder="Contoh: 09.00 – 12.00"
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] text-slate-500 self-center mr-1">Preset:</span>
                    <button
                      type="button"
                      onClick={() => setEditJam('08.30 – 11.30')}
                      className="px-2 py-0.5 bg-white hover:bg-blue-100 rounded border border-blue-200 text-[10px] font-mono"
                    >
                      08.30 – 11.30
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditJam('09.00 – 12.00')}
                      className="px-2 py-0.5 bg-white hover:bg-blue-100 rounded border border-blue-200 text-[10px] font-mono"
                    >
                      09.00 – 12.00
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditJam('13.30 – 16.00')}
                      className="px-2 py-0.5 bg-white hover:bg-blue-100 rounded border border-blue-200 text-[10px] font-mono"
                    >
                      13.30 – 16.00
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditJam('14.00 – 17.00')}
                      className="px-2 py-0.5 bg-white hover:bg-blue-100 rounded border border-blue-200 text-[10px] font-mono"
                    >
                      14.00 – 17.00
                    </button>
                  </div>
                </div>
              )}

              {/* Optional Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional):
                </label>
                <input
                  type="text"
                  value={editKeterangan}
                  onChange={(e) => setEditKeterangan(e.target.value)}
                  placeholder="Contoh: Ada jadwal mengajar pagi, bersedia siang"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCell(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditCell}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
              >
                Simpan Ketersediaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Modal (A4 Ready) */}
      {showPrintModal && (
        <KesesuaianJadwalPrintModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          ketersediaanList={filteredList}
          selectedProdi={selectedProdi}
          dosenList={dosenList}
        />
      )}

    </div>
  );
};
