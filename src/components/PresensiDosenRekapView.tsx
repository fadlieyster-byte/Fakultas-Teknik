import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  ChevronRight, 
  UserCheck, 
  Building2, 
  FileCheck2, 
  ArrowUpRight, 
  BookOpen, 
  Sliders, 
  X,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  Dosen, 
  ProgramStudiInfo, 
  LogPresensiDosen, 
  RekapMingguanDosen,
  JadwalKuliah 
} from '../types/index';
import { hitungRekapitulasiMingguanDosen } from '../data/mockPresensiDosenData';

interface PresensiDosenRekapViewProps {
  dosenList: Dosen[];
  selectedProdi: ProgramStudiInfo;
  logPresensiList: LogPresensiDosen[];
  jadwalList?: JadwalKuliah[];
  onVerifyBap?: (jadwalId: string, catatan?: string) => void;
  onShowToast: (msg: string) => void;
}

export const PresensiDosenRekapView: React.FC<PresensiDosenRekapViewProps> = ({
  dosenList,
  selectedProdi,
  logPresensiList,
  jadwalList = [],
  onVerifyBap,
  onShowToast
}) => {
  const [selectedMinggu, setSelectedMinggu] = useState<number>(8); // Default to current week 8
  const [prodiScope, setProdiScope] = useState<'current' | 'all'>('current');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterKepatuhan, setFilterKepatuhan] = useState<string>('all');
  const [selectedDosenDetail, setSelectedDosenDetail] = useState<RekapMingguanDosen | null>(null);

  // Compute weekly recapitulation table
  const rekapList = useMemo(() => {
    return hitungRekapitulasiMingguanDosen(
      logPresensiList,
      dosenList,
      selectedMinggu,
      prodiScope,
      selectedProdi.id
    );
  }, [logPresensiList, dosenList, selectedMinggu, prodiScope, selectedProdi.id]);

  // Filtered rows based on search and status
  const filteredRekap = useMemo(() => {
    return rekapList.filter(item => {
      const matchSearch = 
        item.dosenNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dosenNidn.includes(searchQuery) ||
        item.jabatanFungsional.toLowerCase().includes(searchQuery.toLowerCase());

      const matchKepatuhan = filterKepatuhan === 'all' || item.statusKepatuhan === filterKepatuhan;

      return matchSearch && matchKepatuhan;
    });
  }, [rekapList, searchQuery, filterKepatuhan]);

  // Overall KPI statistics for the selected week
  const kpiStats = useMemo(() => {
    const totalDosen = rekapList.length;
    const totalJamRealisasi = rekapList.reduce((acc, r) => acc + r.realisasiDurasiJam, 0);
    const totalTargetMenit = rekapList.reduce((acc, r) => acc + r.targetDurasiMenit, 0);
    const totalRealisasiMenit = rekapList.reduce((acc, r) => acc + r.realisasiDurasiMenit, 0);
    const totalBapTerverifikasi = rekapList.reduce((acc, r) => acc + r.jumlahBapTerverifikasi, 0);
    const dosenSangatBaik = rekapList.filter(r => r.statusKepatuhan === 'Sangat Baik' || r.statusKepatuhan === 'Memenuhi Standar BKD').length;

    const rataRataKepatuhan = totalTargetMenit > 0 
      ? Math.round((totalRealisasiMenit / totalTargetMenit) * 100) 
      : 100;

    return {
      totalDosen,
      totalJamRealisasi: totalJamRealisasi.toFixed(1),
      totalBapTerverifikasi,
      dosenSangatBaik,
      rataRataKepatuhan: Math.min(100, rataRataKepatuhan)
    };
  }, [rekapList]);

  // Export to CSV helper
  const handleExportCsv = () => {
    const headers = [
      'No',
      'NIDN',
      'Nama Dosen',
      'Program Studi',
      'Jabatan Fungsional',
      'Total SKS',
      'Minggu Ke',
      'Target Durasi (Menit)',
      'Realisasi Durasi (Menit)',
      'Realisasi Durasi (Jam)',
      'Persen Kehadiran (%)',
      'BAP Terverifikasi',
      'Status Kepatuhan BKD'
    ];

    const rows = filteredRekap.map((r, idx) => [
      idx + 1,
      r.dosenNidn,
      `"${r.dosenNama}"`,
      r.prodiId,
      r.jabatanFungsional,
      r.totalSksMengajar,
      r.mingguKe,
      r.targetDurasiMenit,
      r.realisasiDurasiMenit,
      r.realisasiDurasiJam,
      `${r.persenKehadiran}%`,
      r.jumlahBapTerverifikasi,
      r.statusKepatuhan
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Presensi_Dosen_Minggu_${selectedMinggu}_${selectedProdi.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Rekapitulasi Presensi Dosen Minggu ke-${selectedMinggu} berhasil diunduh.`);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Rekapitulasi Presensi &amp; Durasi Mengajar Dosen Mingguan
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  {prodiScope === 'current' ? selectedProdi.nama : 'Semua Prodi FT'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Pemantauan integrasi log presensi tatap muka, validasi Berita Acara Perkuliahan (BAP), dan evaluasi kepatuhan beban SKS/BKD per minggu.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Switcher */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setProdiScope('current')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  prodiScope === 'current'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Prodi {selectedProdi.singkatan}
              </button>
              <button
                type="button"
                onClick={() => setProdiScope('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  prodiScope === 'all'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Prodi FT
              </button>
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-xs transition-colors"
              title="Unduh rekapitulasi presensi mingguan format Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export Rekap (.csv)</span>
            </button>
          </div>
        </div>

        {/* Week Selector Bar (Minggu Ke-1 s/d Minggu Ke-16) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Pilih Minggu:
            </span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(m => {
              const isSelected = selectedMinggu === m;
              const isCurrentSemesterWeek = m <= 8;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMinggu(m)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-700 text-white font-bold shadow-xs'
                      : isCurrentSemesterWeek
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  M-{m} {m === 8 && <span className="text-[10px] text-amber-300 font-sans ml-0.5">●</span>}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Status: <span className="text-emerald-700 font-bold">Minggu ke-{selectedMinggu} Terbuka</span> (Sesi UTS / Regular RPS)
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Dosen Terjadwal */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Dosen Pengampu Aktif</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            {kpiStats.totalDosen} <span className="text-xs font-normal text-slate-400">Dosen</span>
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            Minggu Ke-{selectedMinggu} TA 2026/2027
          </div>
        </div>

        {/* Total Durasi Jam Mengajar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Durasi Tatap Muka</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-2">
            {kpiStats.totalJamRealisasi} <span className="text-xs font-normal text-slate-400">Jam Mengajar</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tervalidasi BAP Presensi</span>
          </div>
        </div>

        {/* Tingkat Kepatuhan Durasi */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kepatuhan Beban SKS/BKD</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono mt-2">
            {kpiStats.rataRataKepatuhan}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {kpiStats.dosenSangatBaik} dari {kpiStats.totalDosen} dosen memenuhi standar
          </div>
        </div>

        {/* BAP Terverifikasi */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">BAP Disahkan Kaprodi</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono mt-2">
            {kpiStats.totalBapTerverifikasi} <span className="text-xs font-normal text-slate-400">Kelas</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Dokumen Berita Acara Sah
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Dosen, NIDN, Jabatan Fungsional..."
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

          {/* Filter Status Kepatuhan */}
          <div className="flex items-center gap-2">
            <select
              value={filterKepatuhan}
              onChange={(e) => setFilterKepatuhan(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium"
            >
              <option value="all">Semua Status Kepatuhan</option>
              <option value="Sangat Baik">Status: Sangat Baik (100%+)</option>
              <option value="Memenuhi Standar BKD">Status: Memenuhi Standar BKD</option>
              <option value="Perlu Perhatian">Status: Perlu Perhatian</option>
              <option value="Kurang Jam Mengajar">Status: Kurang Jam Mengajar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Recapitulation Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4">Nama Dosen &amp; NIDN</th>
                <th className="py-3 px-3">Program Studi</th>
                <th className="py-3 px-3">Jabatan</th>
                <th className="py-3 px-3 text-center">Beban SKS</th>
                <th className="py-3 px-3 text-right">Target Durasi</th>
                <th className="py-3 px-3 text-right">Realisasi Durasi</th>
                <th className="py-3 px-3 text-center">BAP Presensi</th>
                <th className="py-3 px-3">Status Kepatuhan BKD</th>
                <th className="py-3 px-4 text-center">Aksi &amp; Log Sesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRekap.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada data rekapitulasi presensi yang sesuai kriteria.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Silakan sesuaikan pilihan minggu atau kata kunci pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredRekap.map((r, idx) => {
                  const isComplete = r.statusKepatuhan === 'Sangat Baik' || r.statusKepatuhan === 'Memenuhi Standar BKD';
                  return (
                    <tr key={r.dosenNidn} className="hover:bg-slate-50/80 transition-colors">
                      {/* Row No */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-400 text-xs">
                        {idx + 1}
                      </td>

                      {/* Dosen Name & NIDN */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {r.dosenNama}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                          NIDN: <strong className="text-slate-700">{r.dosenNidn}</strong>
                        </div>
                      </td>

                      {/* Prodi */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          r.prodiId === 'SIPIL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : r.prodiId === 'LINGKUNGAN'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {r.prodiId === 'SIPIL' ? 'Teknik Sipil' : r.prodiId === 'LINGKUNGAN' ? 'Teknik Lingkungan' : 'D3 Teknik Listrik'}
                        </span>
                      </td>

                      {/* Jabatan Fungsional */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {r.jabatanFungsional}
                      </td>

                      {/* Total SKS */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                        {r.totalSksMengajar} <span className="text-[10px] text-slate-400 font-normal">SKS</span>
                      </td>

                      {/* Target Durasi */}
                      <td className="py-3 px-3 text-right font-mono text-slate-500 whitespace-nowrap">
                        <div>{r.targetDurasiMenit} mnt</div>
                        <div className="text-[10px] text-slate-400">({(r.targetDurasiMenit / 60).toFixed(1)} jam)</div>
                      </td>

                      {/* Realisasi Durasi */}
                      <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <div className={r.realisasiDurasiMenit >= r.targetDurasiMenit * 0.9 ? 'text-emerald-700 font-extrabold' : 'text-amber-700'}>
                          {r.realisasiDurasiMenit} mnt
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {r.realisasiDurasiJam} jam tatap muka
                        </div>
                      </td>

                      {/* BAP Presensi Counts */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                            {r.jumlahBapTerverifikasi} BAP Sah
                          </span>
                        </div>
                      </td>

                      {/* Status Kepatuhan */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          r.statusKepatuhan === 'Sangat Baik'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : r.statusKepatuhan === 'Memenuhi Standar BKD'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : r.statusKepatuhan === 'Perlu Perhatian'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}>
                          {isComplete ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{r.statusKepatuhan}</span>
                        </span>
                      </td>

                      {/* Aksi: Detail Log Sesi */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedDosenDetail(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Rincian Log ({r.logs.length})</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Drawer Detail Log Aktivitas Presensi Dosen */}
      {selectedDosenDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-blue-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Log Sesi Presensi &amp; BAP: {selectedDosenDetail.dosenNama}
                  </h3>
                  <p className="text-xs text-slate-500">
                    NIDN: {selectedDosenDetail.dosenNidn} · Minggu ke-{selectedDosenDetail.mingguKe} · Total {selectedDosenDetail.logs.length} Sesi Perkuliahan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDosenDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Beban Mengajar:</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {selectedDosenDetail.totalSksMengajar} SKS
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 block text-[11px]">Target Durasi:</span>
                  <span className="text-base font-bold text-slate-700 font-mono">
                    {selectedDosenDetail.targetDurasiMenit} Menit
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <span className="text-emerald-700 block text-[11px]">Realisasi Kehadiran:</span>
                  <span className="text-base font-bold text-emerald-800 font-mono">
                    {selectedDosenDetail.realisasiDurasiMenit} Menit ({selectedDosenDetail.realisasiDurasiJam} Jam)
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                  <span className="text-blue-700 block text-[11px]">BAP Terverifikasi:</span>
                  <span className="text-base font-bold text-blue-900 font-mono">
                    {selectedDosenDetail.jumlahBapTerverifikasi} / {selectedDosenDetail.logs.length} Kelas
                  </span>
                </div>
              </div>

              {/* Sesi List */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  Rincian Aktivitas Presensi Kelas &amp; BAP Dosen:
                </h4>

                {selectedDosenDetail.logs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                    Belum ada catatan log aktivitas presensi pada minggu ini.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedDosenDetail.logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors space-y-2 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
                          <div>
                            <span className="font-mono text-blue-700 font-bold mr-2">{log.kodeMK}</span>
                            <span className="font-bold text-slate-900">{log.namaMK} ({log.kelas})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {log.bapStatus}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                              {log.statusKehadiran}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                          <div>
                            <span className="text-slate-400 block">Jadwal Kuliah:</span>
                            <span className="font-medium text-slate-800">{log.hari}, {log.jamMulaiRencana} - {log.jamSelesaiRencana}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Presensi Aktual:</span>
                            <span className="font-mono font-bold text-emerald-700">
                              {log.jamMasukAktual} - {log.jamKeluarAktual} ({log.durasiMenit} mnt)
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Ruangan:</span>
                            <span className="font-medium text-slate-800">{log.ruanganNama}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Kehadiran Mahasiswa:</span>
                            <span className="font-bold text-slate-800">
                              {log.jumlahMahasiswaHadir} / {log.jumlahMahasiswaTotal} Mahasiswa
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-500 font-semibold block mb-0.5">Topik / Materi BAP Terverifikasi:</span>
                          <p className="italic text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            "{log.materiKuliah}"
                          </p>
                          {log.catatanVerifikator && (
                            <p className="text-[10px] text-blue-700 mt-1">
                              ✓ Catatan Kaprodi: {log.catatanVerifikator} ({log.waktuVerifikasi})
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedDosenDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
