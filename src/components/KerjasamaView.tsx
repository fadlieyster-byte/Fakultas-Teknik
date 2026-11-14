import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Handshake, 
  Globe, 
  ShieldCheck, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Users, 
  GraduationCap, 
  Layers, 
  BookOpen, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Award,
  Briefcase,
  X,
  FileCheck2,
  Download,
  ChevronDown,
  RefreshCw,
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  DokumenKerjasama, 
  RealisasiKegiatanKerjasama, 
  ProgramStudiInfo, 
  JenisDokumenKerjasama, 
  TingkatKerjasama, 
  KategoriMitraKerjasama, 
  StatusKerjasama, 
  BidangKerjasama 
} from '../types/index';
import { KerjasamaPrintModal } from './KerjasamaPrintModal';

interface KerjasamaViewProps {
  kerjasamaList: DokumenKerjasama[];
  selectedProdi: ProgramStudiInfo;
  onAddKerjasama: (kerjasama: DokumenKerjasama) => void;
  onUpdateKerjasama: (kerjasama: DokumenKerjasama) => void;
  onDeleteKerjasama: (id: string) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onShowToast: (msg: string) => void;
}

export const KerjasamaView: React.FC<KerjasamaViewProps> = ({
  kerjasamaList,
  selectedProdi,
  onAddKerjasama,
  onUpdateKerjasama,
  onDeleteKerjasama,
  onRequestConfirm,
  onShowToast
}) => {
  // Navigation Tabs: Added 'dashboard' as primary monitoring tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dokumen' | 'realisasi' | 'iku6'>('dashboard');
  
  // Filters
  const [filterProdi, setFilterProdi] = useState<string>('current');
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterTingkat, setFilterTingkat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filter for Dashboard 6-Month Expiry Window
  const [expiryRangeFilter, setExpiryRangeFilter] = useState<'all_6m' | 'urgent_30d' | 'medium_90d' | 'normal_180d'>('all_6m');

  // Modals & Dropdowns
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<DokumenKerjasama | null>(null);
  const [selectedDetailDoc, setSelectedDetailDoc] = useState<DokumenKerjasama | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'riwayat' | 'legalitas'>('riwayat');
  const [detailActivityFilter, setDetailActivityFilter] = useState<'all' | 'Terlaksana' | 'Sedang Berjalan' | 'Terjadwal'>('all');
  const [detailSearchQuery, setDetailSearchQuery] = useState<string>('');
  const [showAddRealisasiModal, setShowAddRealisasiModal] = useState<DokumenKerjasama | null>(null);
  const [perpanjangDoc, setPerpanjangDoc] = useState<DokumenKerjasama | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [docToPrint, setDocToPrint] = useState<DokumenKerjasama | null>(null);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState<boolean>(false);

  // Form State for Add / Edit Kerjasama
  const [formData, setFormData] = useState<Partial<DokumenKerjasama>>({
    nomorDokumen: '',
    nomorDokumenMitra: '',
    judulKerjasama: '',
    jenisDokumen: 'MoA',
    tingkat: 'Nasional',
    mitraNama: '',
    kategoriMitra: 'Dunia Usaha & Industri (DUDI)',
    prodiId: selectedProdi.id,
    bidangKerjasama: ['Pendidikan & MBKM', 'Penelitian Bersama'],
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: '',
    jabatanPenandatanganMitra: 'Pimpinan / Direktur',
    picDosenFT: selectedProdi.kaprodi,
    kontakMitra: '',
    manfaatBagiProdi: '',
    targetIku6: true,
    keterangan: ''
  });

  // Form State for Realisasi Kegiatan
  const [realisasiForm, setRealisasiForm] = useState<Partial<RealisasiKegiatanKerjasama>>({
    namaKegiatan: '',
    tanggalPelaksanaan: new Date().toISOString().split('T')[0],
    bidang: 'Pendidikan & MBKM',
    jumlahMahasiswaTerlibat: 10,
    jumlahDosenTerlibat: 2,
    deskripsiHasil: '',
    nomorBuktiKegiatan: '',
    statusPelaksanaan: 'Terlaksana'
  });

  // Form State for Perpanjangan / Addendum
  const [perpanjangForm, setPerpanjangForm] = useState({
    nomorAddendum: '',
    durasiTahun: 3,
    tanggalSelesaiBaru: '',
    catatanAddendum: 'Perpanjangan masa berlaku kerjasama Tridharma, magang MBKM, dan dosen praktisi.'
  });

  // Helper: Calculate Days Remaining to Expiry
  const calculateDaysRemaining = (endDateStr: string): number => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr).getTime();
    if (isNaN(end)) return 0;
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  // Filtered List based on Search & Selectors
  const filteredList = useMemo(() => {
    return kerjasamaList.filter(item => {
      const matchProdi = 
        filterProdi === 'all' 
          ? true 
          : filterProdi === 'current' 
            ? (item.prodiId === selectedProdi.id || item.prodiId === 'SEMUA_FT')
            : item.prodiId === filterProdi || item.prodiId === 'SEMUA_FT';

      const matchJenis = filterJenis === 'all' || item.jenisDokumen === filterJenis;
      const matchTingkat = filterTingkat === 'all' || item.tingkat === filterTingkat;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !query ||
        item.mitraNama.toLowerCase().includes(query) ||
        item.nomorDokumen.toLowerCase().includes(query) ||
        (item.nomorDokumenMitra && item.nomorDokumenMitra.toLowerCase().includes(query)) ||
        item.judulKerjasama.toLowerCase().includes(query) ||
        item.picDosenFT.toLowerCase().includes(query);

      return matchProdi && matchJenis && matchTingkat && matchStatus && matchSearch;
    });
  }, [kerjasamaList, filterProdi, selectedProdi.id, filterJenis, filterTingkat, filterStatus, searchQuery]);

  // Expiring within 6 months dataset (180 days)
  const expiringList = useMemo(() => {
    const scopeList = kerjasamaList.filter(item => 
      filterProdi === 'all' 
        ? true 
        : filterProdi === 'current' 
          ? (item.prodiId === selectedProdi.id || item.prodiId === 'SEMUA_FT')
          : item.prodiId === filterProdi || item.prodiId === 'SEMUA_FT'
    );

    return scopeList
      .map(doc => {
        const daysRemaining = calculateDaysRemaining(doc.tanggalSelesai);
        return { ...doc, daysRemaining };
      })
      .filter(doc => {
        // Expired, near expiry (< 180 days), or flagged as Mendekati Berakhir
        const isExpiring6M = doc.daysRemaining <= 180 || doc.status === 'Mendekati Berakhir' || doc.status === 'Kedaluwarsa';
        if (!isExpiring6M) return false;

        if (expiryRangeFilter === 'urgent_30d') return doc.daysRemaining <= 30;
        if (expiryRangeFilter === 'medium_90d') return doc.daysRemaining > 30 && doc.daysRemaining <= 90;
        if (expiryRangeFilter === 'normal_180d') return doc.daysRemaining > 90 && doc.daysRemaining <= 180;
        return true;
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [kerjasamaList, filterProdi, selectedProdi.id, expiryRangeFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const relevant = kerjasamaList.filter(k => 
      filterProdi === 'all' 
        ? true 
        : filterProdi === 'current' 
          ? (k.prodiId === selectedProdi.id || k.prodiId === 'SEMUA_FT')
          : (k.prodiId === filterProdi || k.prodiId === 'SEMUA_FT')
    );

    const total = relevant.length;
    const aktif = relevant.filter(k => k.status === 'Aktif').length;
    const warning = relevant.filter(k => {
      const days = calculateDaysRemaining(k.tanggalSelesai);
      return days <= 180 || k.status === 'Mendekati Berakhir' || k.status === 'Kedaluwarsa';
    }).length;
    const urgent30d = relevant.filter(k => calculateDaysRemaining(k.tanggalSelesai) <= 30).length;
    const internasional = relevant.filter(k => k.tingkat === 'Internasional').length;
    const nasional = relevant.filter(k => k.tingkat === 'Nasional').length;
    const lokal = relevant.filter(k => k.tingkat === 'Lokal/Wilayah').length;
    const iku6Count = relevant.filter(k => k.targetIku6 && k.status === 'Aktif').length;

    const totalRealisasi = relevant.reduce((sum, k) => sum + (k.realisasiList ? k.realisasiList.length : 0), 0);
    const totalMahasiswaTerlibat = relevant.reduce((sum, k) => {
      if (!k.realisasiList) return sum;
      return sum + k.realisasiList.reduce((acc, r) => acc + (r.jumlahMahasiswaTerlibat || 0), 0);
    }, 0);

    const countMoU = relevant.filter(k => k.jenisDokumen === 'MoU').length;
    const countMoA = relevant.filter(k => k.jenisDokumen === 'MoA').length;
    const countIA = relevant.filter(k => k.jenisDokumen === 'IA').length;

    return {
      total,
      aktif,
      warning,
      urgent30d,
      internasional,
      nasional,
      lokal,
      iku6Count,
      totalRealisasi,
      totalMahasiswaTerlibat,
      countMoU,
      countMoA,
      countIA
    };
  }, [kerjasamaList, filterProdi, selectedProdi.id]);

  // Recharts Chart Data: Bar Chart by Category (MoU, MoA, IA) and Status Keaktifan
  const chartDataByJenis = useMemo(() => {
    const scopeList = kerjasamaList.filter(k => 
      filterProdi === 'all' 
        ? true 
        : filterProdi === 'current' 
          ? (k.prodiId === selectedProdi.id || k.prodiId === 'SEMUA_FT')
          : (k.prodiId === filterProdi || k.prodiId === 'SEMUA_FT')
    );

    const categories: JenisDokumenKerjasama[] = ['MoU', 'MoA', 'IA'];

    return categories.map(cat => {
      const items = scopeList.filter(k => k.jenisDokumen === cat);
      const aktifCount = items.filter(k => k.status === 'Aktif').length;
      const warningCount = items.filter(k => k.status === 'Mendekati Berakhir').length;
      const expiredCount = items.filter(k => k.status === 'Kedaluwarsa' || k.status === 'Dalam Penjajakan').length;

      return {
        kategori: cat,
        label: cat === 'MoU' ? 'MoU (Nota Kesepahaman)' : cat === 'MoA' ? 'MoA (Perjanjian Kerjasama)' : 'IA (Pelaksanaan)',
        'Aktif': aktifCount,
        'Mendekati Berakhir (<6 Bln)': warningCount,
        'Kedaluwarsa/Penjajakan': expiredCount,
        total: items.length
      };
    });
  }, [kerjasamaList, filterProdi, selectedProdi.id]);

  // Recharts Chart Data: Distribution by Study Program & Mitra Sector
  const chartDataByProdi = useMemo(() => {
    const prodiDefs = [
      { id: 'SIPIL', nama: 'S1 Sipil' },
      { id: 'LINGKUNGAN', nama: 'S1 Lingkungan' },
      { id: 'LISTRIK_D3', nama: 'D3 Listrik' },
      { id: 'SEMUA_FT', nama: 'Fakultas Teknik' }
    ];

    return prodiDefs.map(p => {
      const items = kerjasamaList.filter(k => k.prodiId === p.id);
      return {
        nama: p.nama,
        'Pemerintah / BUMN': items.filter(k => k.kategoriMitra === 'Instansi Pemerintah / Kementerian' || k.kategoriMitra === 'BUMN / BUMD').length,
        'DUDI & Industri': items.filter(k => k.kategoriMitra === 'Dunia Usaha & Industri (DUDI)').length,
        'Perguruan Tinggi & Asosiasi': items.filter(k => k.kategoriMitra === 'Perguruan Tinggi' || k.kategoriMitra === 'Asosiasi Profesi').length,
        total: items.length
      };
    });
  }, [kerjasamaList]);

  // Handle Open Create Modal
  const handleOpenCreate = () => {
    setEditingDoc(null);
    setFormData({
      nomorDokumen: `0${Math.floor(Math.random() * 80) + 10}/FT-UNBARI/MoA/${selectedProdi.id}/XI/2024`,
      nomorDokumenMitra: '',
      judulKerjasama: '',
      jenisDokumen: 'MoA',
      tingkat: 'Nasional',
      mitraNama: '',
      kategoriMitra: 'Dunia Usaha & Industri (DUDI)',
      prodiId: selectedProdi.id,
      bidangKerjasama: ['Pendidikan & MBKM', 'Penelitian Bersama'],
      tanggalMulai: new Date().toISOString().split('T')[0],
      tanggalSelesai: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Aktif',
      pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
      pejabatPenandatanganMitra: '',
      jabatanPenandatanganMitra: 'Direktur / Kepala Balai',
      picDosenFT: selectedProdi.kaprodi,
      kontakMitra: '',
      manfaatBagiProdi: 'Penyediaan magang bersertifikat dan praktisi mengajar.',
      targetIku6: true,
      keterangan: 'Dokumen kerjasama aktif tingkat Fakultas Teknik.',
      realisasiList: []
    });
    setShowAddModal(true);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (doc: DokumenKerjasama) => {
    setEditingDoc(doc);
    setFormData({ ...doc });
    setShowAddModal(true);
  };

  // Handle Open Perpanjangan Modal
  const handleOpenPerpanjang = (doc: DokumenKerjasama) => {
    setPerpanjangDoc(doc);
    const currentEnd = new Date(doc.tanggalSelesai);
    const newEnd = new Date(currentEnd.setFullYear(currentEnd.getFullYear() + 3)).toISOString().split('T')[0];
    setPerpanjangForm({
      nomorAddendum: `${doc.nomorDokumen}.ADD-1`,
      durasiTahun: 3,
      tanggalSelesaiBaru: newEnd,
      catatanAddendum: `Perpanjangan masa berlaku kerjasama dengan ${doc.mitraNama} selama 3 tahun ke depan.`
    });
  };

  // Handle Submit Perpanjangan
  const handleSubmitPerpanjang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perpanjangDoc) return;

    const updatedDoc: DokumenKerjasama = {
      ...perpanjangDoc,
      status: 'Aktif',
      tanggalSelesai: perpanjangForm.tanggalSelesaiBaru,
      nomorDokumen: perpanjangForm.nomorAddendum || perpanjangDoc.nomorDokumen,
      keterangan: `${perpanjangDoc.keterangan || ''} [Addendum Diperpanjang s.d ${perpanjangForm.tanggalSelesaiBaru}: ${perpanjangForm.catatanAddendum}]`
    };

    onUpdateKerjasama(updatedDoc);
    setPerpanjangDoc(null);
    onShowToast(`Masa berlaku kerjasama dengan ${perpanjangDoc.mitraNama} berhasil diperpanjang hingga ${perpanjangForm.tanggalSelesaiBaru}!`);
  };

  // Handle Save (Create or Update)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomorDokumen || !formData.mitraNama || !formData.judulKerjasama) {
      onShowToast('Nomor dokumen, nama mitra, dan judul kerjasama wajib diisi.');
      return;
    }

    if (editingDoc) {
      const updated: DokumenKerjasama = {
        ...editingDoc,
        ...formData as DokumenKerjasama,
        realisasiList: editingDoc.realisasiList || []
      };
      onUpdateKerjasama(updated);
      onShowToast(`Dokumen kerjasama ${updated.nomorDokumen} berhasil diperbarui.`);
    } else {
      const created: DokumenKerjasama = {
        ...formData as DokumenKerjasama,
        id: `KJS-${Date.now().toString().slice(-6)}`,
        realisasiList: []
      };
      onAddKerjasama(created);
      onShowToast(`Kerjasama baru dengan ${created.mitraNama} berhasil didaftarkan.`);
    }

    setShowAddModal(false);
    setEditingDoc(null);
  };

  // Handle Add Realisasi Kegiatan
  const handleSaveRealisasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddRealisasiModal || !realisasiForm.namaKegiatan) {
      onShowToast('Nama kegiatan realisasi wajib diisi.');
      return;
    }

    const newRea: RealisasiKegiatanKerjasama = {
      id: `REA-${Date.now().toString().slice(-6)}`,
      namaKegiatan: realisasiForm.namaKegiatan || '',
      tanggalPelaksanaan: realisasiForm.tanggalPelaksanaan || new Date().toISOString().split('T')[0],
      bidang: realisasiForm.bidang as BidangKerjasama || 'Pendidikan & MBKM',
      jumlahMahasiswaTerlibat: Number(realisasiForm.jumlahMahasiswaTerlibat) || 0,
      jumlahDosenTerlibat: Number(realisasiForm.jumlahDosenTerlibat) || 0,
      deskripsiHasil: realisasiForm.deskripsiHasil || '',
      nomorBuktiKegiatan: realisasiForm.nomorBuktiKegiatan || `IA-FT/${showAddRealisasiModal.jenisDokumen}/${Date.now().toString().slice(-4)}`,
      statusPelaksanaan: (realisasiForm.statusPelaksanaan as any) || 'Terlaksana'
    };

    const updatedDoc: DokumenKerjasama = {
      ...showAddRealisasiModal,
      realisasiList: [newRea, ...(showAddRealisasiModal.realisasiList || [])]
    };

    onUpdateKerjasama(updatedDoc);
    if (selectedDetailDoc && selectedDetailDoc.id === updatedDoc.id) {
      setSelectedDetailDoc(updatedDoc);
    }
    setShowAddRealisasiModal(null);
    onShowToast(`Bukti kegiatan realisasi (IA) berhasil ditambahkan ke ${showAddRealisasiModal.mitraNama}.`);
  };

  // Handle Delete Realisasi Kegiatan
  const handleDeleteRealisasi = (doc: DokumenKerjasama, realisasiId: string) => {
    onRequestConfirm(
      'Hapus Bukti Aktivitas Kerjasama',
      'Apakah Anda yakin ingin menghapus catatan aktivitas kegiatan (IA) ini dari riwayat dokumen mitra?',
      () => {
        const updatedDoc: DokumenKerjasama = {
          ...doc,
          realisasiList: (doc.realisasiList || []).filter(r => r.id !== realisasiId)
        };
        onUpdateKerjasama(updatedDoc);
        if (selectedDetailDoc && selectedDetailDoc.id === updatedDoc.id) {
          setSelectedDetailDoc(updatedDoc);
        }
        onShowToast('Aktivitas kerjasama berhasil dihapus dari riwayat.');
      }
    );
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nomor Dokumen',
      'Lembaga Mitra',
      'Kategori Mitra',
      'Jenis Dokumen',
      'Tingkat Kerjasama',
      'Program Studi',
      'Judul Kerjasama',
      'Tanggal Mulai',
      'Tanggal Selesai',
      'Status Kerjasama',
      'Relevan IKU-6',
      'Dosen PIC FT',
      'Jumlah Kegiatan IA',
      'Manfaat bagi Prodi'
    ];

    const rows = filteredList.map((doc, idx) => [
      idx + 1,
      `"${doc.nomorDokumen}"`,
      `"${doc.mitraNama.replace(/"/g, '""')}"`,
      `"${doc.kategoriMitra}"`,
      doc.jenisDokumen,
      doc.tingkat,
      doc.prodiId === 'SEMUA_FT' ? 'Semua FT' : doc.prodiId,
      `"${doc.judulKerjasama.replace(/"/g, '""')}"`,
      doc.tanggalMulai,
      doc.tanggalSelesai,
      doc.status,
      doc.targetIku6 ? 'Ya' : 'Tidak',
      `"${doc.picDosenFT}"`,
      doc.realisasiList ? doc.realisasiList.length : 0,
      `"${doc.manfaatBagiProdi.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Kerjasama_FT_UNBARI_${selectedProdi.singkatan}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast(`Laporan kerjasama (${filteredList.length} naskah) berhasil diunduh dalam format CSV LKPS Kriteria 6.`);
  };

  const bidangOptions: BidangKerjasama[] = [
    'Pendidikan & MBKM',
    'Penelitian Bersama',
    'Pengabdian Masyarakat (PkM)',
    'Dosen Praktisi & Kuliah Pakar',
    'Uji Laboratorium & Fasilitas',
    'Penyaluran Lulusan & Karir',
    'Sertifikasi Kompetensi'
  ];

  return (
    <div className="space-y-6">

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Manajemen Kerjasama &amp; Kemitraan (MoU, MoA, IA)
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Kriteria 6 &amp; IKU 6 Dikti
                </span>
                {stats.urgent30d > 0 && (
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{stats.urgent30d} Kritis (&lt;30 Hari)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan naskah nota kesepahaman, perjanjian kerjasama, dan pemantauan masa kadaluarsa untuk perpanjangan berkala.
              </p>
            </div>
          </div>

          {/* Action Toolbar with "Unduh Laporan Kerjasama" Dropdown Button */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* The Dedicated 'Unduh Laporan Kerjasama' Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                title="Unduh rekapitulasi data dokumen MoU, MoA, dan IA untuk pelaporan akreditasi"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Laporan Kerjasama</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-blue-200" />
              </button>

              {showDownloadDropdown && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Format Pelaporan Akreditasi
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDownloadDropdown(false);
                      handleExportCSV();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">Unduh Format CSV (LKPS)</span>
                      <span className="text-[10px] text-slate-500 block">Tabel Standar Kriteria 6 LAM-Teknik</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDownloadDropdown(false);
                      setDocToPrint(null);
                      setIsPrintModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-800 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2.5 transition-colors border-t border-slate-100"
                  >
                    <Printer className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">Cetak / Simpan PDF Resmi</span>
                      <span className="text-[10px] text-slate-500 block">Kop FT UNBARI &amp; Tanda Tangan Dekan</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Naskah Kerjasama</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
          
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-slate-500 block">Total Dokumen</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">{stats.total}</div>
            <span className="text-[10px] text-slate-500">MoU ({stats.countMoU}), MoA ({stats.countMoA})</span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3">
            <span className="text-[11px] font-medium text-emerald-700 block">Status Aktif</span>
            <div className="text-lg font-black text-emerald-800 mt-0.5">{stats.aktif}</div>
            <span className="text-[10px] text-emerald-600">Berlaku sah</span>
          </div>

          <div 
            onClick={() => setActiveTab('dashboard')}
            className="bg-amber-50/80 border border-amber-300 rounded-lg p-3 cursor-pointer hover:bg-amber-100/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-900 block">Kadaluarsa &lt; 6 Bln</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-lg font-black text-amber-900 mt-0.5">{stats.warning}</div>
            <span className="text-[10px] text-amber-800 font-medium">Klik untuk monitoring &rarr;</span>
          </div>

          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3">
            <span className="text-[11px] font-medium text-blue-700 block">Kemitraan IKU-6</span>
            <div className="text-lg font-black text-blue-900 mt-0.5">{stats.iku6Count}</div>
            <span className="text-[10px] text-blue-600">Mitra bereputasi DUDI</span>
          </div>

          <div className="bg-purple-50/60 border border-purple-200 rounded-lg p-3">
            <span className="text-[11px] font-medium text-purple-700 block">Internasional &amp; Nas.</span>
            <div className="text-lg font-black text-purple-900 mt-0.5">{stats.internasional + stats.nasional}</div>
            <span className="text-[10px] text-purple-600">{stats.internasional} Internasional (UTM/AIT)</span>
          </div>

          <div className="bg-sky-50/60 border border-sky-200 rounded-lg p-3">
            <span className="text-[11px] font-medium text-sky-700 block">Bukti Kegiatan (IA)</span>
            <div className="text-lg font-black text-sky-900 mt-0.5">{stats.totalRealisasi}</div>
            <span className="text-[10px] text-sky-700 font-medium">{stats.totalMahasiswaTerlibat} Mhs Terlibat</span>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          
          {/* Subtab Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Dashboard &amp; Kadaluarsa (&lt;6 Bulan)</span>
              {stats.warning > 0 && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {stats.warning} Segera
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dokumen')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'dokumen'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Daftar Dokumen MoU / MoA / IA</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {filteredList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('realisasi')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'realisasi'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-blue-700" />
              <span>Matriks Kegiatan &amp; IA</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {stats.totalRealisasi} Bukti
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('iku6')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'iku6'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-purple-700" />
              <span>Peta Kemitraan &amp; IKU 6 Dikti</span>
            </button>
          </div>

          {/* Scope Prodi Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Lingkup:</span>
            <select
              value={filterProdi}
              onChange={(e) => setFilterProdi(e.target.value)}
              className="text-xs font-semibold border border-emerald-300 rounded-lg px-2.5 py-1.5 bg-emerald-50 text-emerald-900"
            >
              <option value="current">{selectedProdi.singkatan} &amp; Fakultas</option>
              <option value="all">Seluruh FT UNBARI</option>
              <option value="SIPIL">S1 Teknik Sipil</option>
              <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
              <option value="LISTRIK_D3">D3 Teknik Listrik</option>
              <option value="SEMUA_FT">Fakultas Teknik (Lintas Prodi)</option>
            </select>
          </div>
        </div>

        {/* Global Prominent Search Bar & Dropdown Filters (Accessible for both tabs) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          
          {/* Prominent Search Bar with Clear Button */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mitra / institusi, nomor dokumen (MoU/MoA), PIC, atau topik..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown Filter Jenis Dokumen (MoU, MoA, IA) */}
          <div className="sm:col-span-3">
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full text-xs font-medium border border-blue-300 rounded-lg p-2 bg-blue-50/50 text-blue-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Semua Jenis Dokumen (MoU, MoA, IA)</option>
              <option value="MoU">MoU (Nota Kesepahaman / Universitas &amp; Fakultas)</option>
              <option value="MoA">MoA (Perjanjian Kerjasama / Program Studi)</option>
              <option value="IA">IA (Implementation Arrangement / Bukti Kegiatan)</option>
            </select>
          </div>

          {/* Filter Tingkat Wilayah */}
          <div className="sm:col-span-2">
            <select
              value={filterTingkat}
              onChange={(e) => setFilterTingkat(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-700"
            >
              <option value="all">Semua Tingkat</option>
              <option value="Internasional">Internasional</option>
              <option value="Nasional">Nasional</option>
              <option value="Lokal/Wilayah">Lokal / Jambi</option>
            </select>
          </div>

          {/* Filter Status Masa Berlaku */}
          <div className="sm:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Mendekati Berakhir">Mendekati Berakhir (&lt;6 Bln)</option>
              <option value="Kedaluwarsa">Kedaluwarsa</option>
              <option value="Dalam Penjajakan">Dalam Penjajakan</option>
            </select>
          </div>

        </div>

        {/* Quick Pill Filter Selector for Fast Filtering */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Filter Cepat Jenis:</span>
          <button
            type="button"
            onClick={() => setFilterJenis('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              filterJenis === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setFilterJenis('MoU')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              filterJenis === 'MoU'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            MoU ({stats.countMoU})
          </button>
          <button
            type="button"
            onClick={() => setFilterJenis('MoA')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              filterJenis === 'MoA'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            MoA ({stats.countMoA})
          </button>
          <button
            type="button"
            onClick={() => setFilterJenis('IA')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              filterJenis === 'IA'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            IA ({stats.countIA})
          </button>

          {searchQuery && (
            <span className="ml-auto text-[11px] text-slate-500">
              Ditemukan <strong className="text-slate-900 font-bold">{filteredList.length}</strong> dokumen
            </span>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* TAB 1: DASHBOARD KERJASAMA & MONITORING KADALUARSA 6 BULAN */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">

          {/* Recharts Data Visualization Component */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Chart 1: Bar Chart by Category (MoU, MoA, IA) and Status Keaktifan */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-emerald-700" />
                    <span>Jumlah Kerjasama Berdasarkan Kategori &amp; Status</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Distribusi dokumen MoU, MoA, dan IA menurut keaktifan masa berlaku
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                  {stats.total} Dokumen
                </span>
              </div>

              <div className="h-64 mt-4 text-xs">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={chartDataByJenis} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="kategori" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="Aktif" fill="#059669" radius={[4, 4, 0, 0]} name="Aktif" />
                    <Bar dataKey="Mendekati Berakhir (<6 Bln)" fill="#d97706" radius={[4, 4, 0, 0]} name="Kadaluarsa <6 Bln" />
                    <Bar dataKey="Kedaluwarsa/Penjajakan" fill="#dc2626" radius={[4, 4, 0, 0]} name="Kedaluwarsa / Penjajakan" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Distribution by Study Program & Mitra Sector */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>Distribusi Mitra per Program Studi &amp; Sektor</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    S1 Sipil, S1 Lingkungan, D3 Listrik, dan Kerjasama Lintas Fakultas
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold">
                  Sektor Mitra
                </span>
              </div>

              <div className="h-64 mt-4 text-xs">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={chartDataByProdi} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="nama" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="Pemerintah / BUMN" fill="#0284c7" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="DUDI & Industri" fill="#ea580c" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Perguruan Tinggi & Asosiasi" fill="#7c3aed" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Monitoring Dokumen Kerjasama Segera Kadaluarsa dalam 6 Bulan ke Depan */}
          <div className="bg-white border border-amber-300 rounded-xl overflow-hidden shadow-xs">
            
            {/* Header Alert Section */}
            <div className="p-5 bg-linear-to-r from-amber-50 to-orange-50/60 border-b border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        Monitoring Dokumen Kerjasama Kadaluarsa (&lt; 6 Bulan ke Depan)
                      </h3>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                        {expiringList.length} Perlu Tindak Lanjut
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Daftar naskah MoU, MoA, dan IA yang masa berlakunya akan berakhir dalam kurun waktu 180 hari agar Ketua Program Studi dan Dekanat dapat segera menyusun draf perpanjangan (Addendum).
                    </p>
                  </div>
                </div>

                {/* Filter Expiry Range Switcher */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-amber-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setExpiryRangeFilter('all_6m')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      expiryRangeFilter === 'all_6m'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua (&lt;6 Bln)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryRangeFilter('urgent_30d')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      expiryRangeFilter === 'urgent_30d'
                        ? 'bg-red-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    &lt; 30 Hari (Kritis)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryRangeFilter('medium_90d')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      expiryRangeFilter === 'medium_90d'
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    30-90 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryRangeFilter('normal_180d')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      expiryRangeFilter === 'normal_180d'
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    90-180 Hari
                  </button>
                </div>
              </div>
            </div>

            {/* Expiring List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Lembaga Mitra &amp; Nomor Naskah</th>
                    <th className="py-3 px-4">Jenis &amp; Prodi</th>
                    <th className="py-3 px-4">Tanggal Kadaluarsa</th>
                    <th className="py-3 px-4 text-center">Sisa Waktu</th>
                    <th className="py-3 px-4">Dosen PIC FT</th>
                    <th className="py-3 px-4 text-center">Tindakan Kaprodi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {expiringList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                        <p className="font-semibold text-sm text-slate-800">
                          Tidak ada dokumen kerjasama yang kadaluarsa pada kategori ini
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Seluruh naskah kerjasama FT UNBARI dalam masa aktif dan terpantau dengan baik.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    expiringList.map((doc, idx) => {
                      const isUrgent = doc.daysRemaining <= 30;
                      const isMedium = doc.daysRemaining > 30 && doc.daysRemaining <= 90;

                      return (
                        <tr 
                          key={doc.id}
                          className={`hover:bg-amber-50/40 transition-colors ${
                            isUrgent ? 'bg-red-50/40' : isMedium ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                            {idx + 1}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 leading-tight">
                              {doc.mitraNama}
                            </div>
                            <div className="font-mono text-[11px] text-blue-700 mt-0.5">
                              {doc.nomorDokumen}
                            </div>
                            <div className="text-[11px] text-slate-600 italic line-clamp-1 mt-0.5">
                              {doc.judulKerjasama}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono text-xs font-bold text-slate-800">
                                {doc.jenisDokumen} ({doc.tingkat})
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded w-fit">
                                {doc.prodiId === 'SEMUA_FT' ? 'Semua FT' : doc.prodiId}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono text-xs font-bold text-slate-900">
                              {doc.tanggalSelesai}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Mulai: {doc.tanggalMulai}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {doc.daysRemaining <= 0 ? (
                              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                                Sudah Kadaluarsa
                              </span>
                            ) : isUrgent ? (
                              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300 animate-pulse">
                                {doc.daysRemaining} Hari Tersisa (Kritis)
                              </span>
                            ) : isMedium ? (
                              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {doc.daysRemaining} Hari Tersisa
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200">
                                {doc.daysRemaining} Hari (~{Math.round(doc.daysRemaining / 30)} Bln)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                            <div className="font-medium">{doc.picDosenFT}</div>
                            <div className="text-[10px] text-slate-500">{doc.kategoriMitra}</div>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenPerpanjang(doc)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
                                title="Buat Addendum & Perpanjang Masa Berlaku Kerjasama"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Perpanjang (Addendum)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedDetailDoc(doc)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                                title="Lihat Rincian Dokumen & Bukti IA"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
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

            {/* Footer summary & recommended actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  SOP Dekanat FT UNBARI: Draf Addendum Kerjasama diajukan minimal <strong>60 hari</strong> sebelum masa berlaku berakhir.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dokumen')}
                className="text-blue-700 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Kelola Seluruh {stats.total} Dokumen di Tab Tabel</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DAFTAR DOKUMEN MOU / MOA / IA LENGKAP */}
      {/* ========================================================= */}
      {activeTab === 'dokumen' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Lembaga Mitra &amp; Nomor Naskah</th>
                  <th className="py-3 px-4">Tingkat &amp; Jenis</th>
                  <th className="py-3 px-4">Judul &amp; Bidang Kerjasama</th>
                  <th className="py-3 px-4">Periode Masa Berlaku</th>
                  <th className="py-3 px-4 text-center">Bukti IA</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <Handshake className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium text-sm">Tidak ada dokumen kerjasama yang sesuai filter atau pencarian</p>
                      <p className="text-xs text-slate-400 mt-1">Ubah kata kunci pencarian atau daftarkan naskah kerjasama baru.</p>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((doc, idx) => {
                    const days = calculateDaysRemaining(doc.tanggalSelesai);
                    const isWarning = days <= 180 || doc.status === 'Mendekati Berakhir';

                    return (
                      <tr 
                        key={doc.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isWarning ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 leading-tight">
                            {doc.mitraNama}
                          </div>
                          <div className="font-mono text-[11px] text-blue-700 mt-0.5">
                            {doc.nomorDokumen}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.2 rounded font-medium">{doc.kategoriMitra}</span>
                            <span>·</span>
                            <span>PIC: {doc.picDosenFT}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                              doc.tingkat === 'Internasional' ? 'bg-purple-100 text-purple-800' :
                              doc.tingkat === 'Nasional' ? 'bg-blue-100 text-blue-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {doc.tingkat}
                            </span>
                            <span className="font-mono text-xs font-semibold text-slate-700">
                              {doc.jenisDokumen}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 line-clamp-2 leading-tight">
                            {doc.judulKerjasama}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {doc.bidangKerjasama.slice(0, 2).map((b, i) => (
                              <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                {b}
                              </span>
                            ))}
                            {doc.bidangKerjasama.length > 2 && (
                              <span className="text-[9px] text-slate-400">+{doc.bidangKerjasama.length - 2} bidang</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-[11px] text-slate-800">
                            {doc.tanggalMulai}
                          </div>
                          <div className="text-[10px] text-slate-500">s.d.</div>
                          <div className="font-mono text-[11px] font-semibold text-slate-900">
                            {doc.tanggalSelesai}
                          </div>
                          {days <= 180 && days > 0 && (
                            <span className="text-[9px] font-bold text-amber-700 block mt-0.5">
                              {days} Hari Lagi
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailDoc(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>{doc.realisasiList ? doc.realisasiList.length : 0} IA</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            doc.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' :
                            doc.status === 'Mendekati Berakhir' ? 'bg-amber-100 text-amber-800' :
                            doc.status === 'Kedaluwarsa' ? 'bg-red-100 text-red-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {doc.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailDoc(doc)}
                              title="Lihat Rincian & Kegiatan IA"
                              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPerpanjang(doc)}
                              title="Perpanjang Masa Berlaku (Addendum)"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDocToPrint(doc);
                                setIsPrintModalOpen(true);
                              }}
                              title="Cetak Naskah Kerjasama"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(doc)}
                              title="Ubah Data Kerjasama"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onRequestConfirm(
                                  'Hapus Dokumen Kerjasama',
                                  `Apakah Anda yakin ingin menghapus arsip kerjasama dengan "${doc.mitraNama}" (${doc.nomorDokumen})?`,
                                  () => {
                                    onDeleteKerjasama(doc.id);
                                    onShowToast(`Dokumen kerjasama ${doc.nomorDokumen} berhasil dihapus.`);
                                  }
                                );
                              }}
                              title="Hapus Kerjasama"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
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
      )}

      {/* ========================================================= */}
      {/* TAB 3: MATRIKS REALISASI KEGIATAN & IA */}
      {/* ========================================================= */}
      {activeTab === 'realisasi' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 space-y-1">
              <strong className="block font-semibold">Implementation Arrangement (IA) &amp; Bukti Nyata Kerjasama</strong>
              <p>
                Sesuai standar LAM-Teknik &amp; BAN-PT, setiap dokumen MoU dan MoA wajib memiliki bukti pelaksanaan kegiatan nyata (IA) yang melibatkan mahasiswa dan dosen dalam kurun waktu masa berlakunya.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                        {doc.jenisDokumen} · {doc.nomorDokumen}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 leading-snug">
                        {doc.mitraNama}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{doc.judulKerjasama}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddRealisasiModal(doc);
                        setRealisasiForm({
                          namaKegiatan: '',
                          tanggalPelaksanaan: new Date().toISOString().split('T')[0],
                          bidang: doc.bidangKerjasama[0] || 'Pendidikan & MBKM',
                          jumlahMahasiswaTerlibat: 10,
                          jumlahDosenTerlibat: 2,
                          deskripsiHasil: '',
                          nomorBuktiKegiatan: `IA-${doc.prodiId}/${Date.now().toString().slice(-4)}`,
                          statusPelaksanaan: 'Terlaksana'
                        });
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg shrink-0 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Bukti IA</span>
                    </button>
                  </div>

                  {/* List of Realizations */}
                  <div className="space-y-2 mt-3">
                    {doc.realisasiList && doc.realisasiList.length > 0 ? (
                      doc.realisasiList.map((rea) => (
                        <div key={rea.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900">{rea.namaKegiatan}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                              {rea.statusPelaksanaan}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] italic">{rea.deskripsiHasil}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                            <span>Tgl: {rea.tanggalPelaksanaan}</span>
                            <span>{rea.jumlahMahasiswaTerlibat} Mhs / {rea.jumlahDosenTerlibat} Dosen</span>
                            <span className="text-blue-700">{rea.nomorBuktiKegiatan}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-slate-50/60 rounded-lg border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">Belum ada catatan realisasi kegiatan (IA).</p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddRealisasiModal(doc);
                            setRealisasiForm({
                              namaKegiatan: '',
                              tanggalPelaksanaan: new Date().toISOString().split('T')[0],
                              bidang: doc.bidangKerjasama[0] || 'Pendidikan & MBKM',
                              jumlahMahasiswaTerlibat: 10,
                              jumlahDosenTerlibat: 2,
                              deskripsiHasil: '',
                              nomorBuktiKegiatan: `IA-${doc.prodiId}/${Date.now().toString().slice(-4)}`,
                              statusPelaksanaan: 'Terlaksana'
                            });
                          }}
                          className="text-[11px] text-blue-700 font-semibold hover:underline mt-1 inline-block"
                        >
                          Catat Bukti Kegiatan Pertama
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Masa Berlaku: {doc.tanggalSelesai}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailDoc(doc)}
                    className="text-blue-700 font-semibold hover:underline"
                  >
                    Rincian Lengkap &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PETA KEMITRAAN & IKU 6 DIKTI */}
      {/* ========================================================= */}
      {activeTab === 'iku6' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-700" />
              <span>Indikator Kinerja Utama (IKU) 6: Program Studi Bekerjasama dengan Mitra Bereputasi</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4">
                <span className="text-xs font-semibold text-purple-800 block">Total Mitra DUDI &amp; BUMN</span>
                <div className="text-2xl font-black text-purple-950 mt-1">
                  {filteredList.filter(k => k.targetIku6 && (k.kategoriMitra === 'Dunia Usaha & Industri (DUDI)' || k.kategoriMitra === 'BUMN / BUMD')).length}
                </div>
                <p className="text-[11px] text-purple-700 mt-1">
                  Mitra industri dan korporasi terakreditasi nasional untuk magang MBKM dan riset terapan.
                </p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                <span className="text-xs font-semibold text-blue-800 block">Kemitraan Perguruan Tinggi QS/Internasional</span>
                <div className="text-2xl font-black text-blue-950 mt-1">
                  {filteredList.filter(k => k.kategoriMitra === 'Perguruan Tinggi' && k.tingkat === 'Internasional').length}
                </div>
                <p className="text-[11px] text-blue-700 mt-1">
                  Universiti Teknologi Malaysia (UTM) &amp; Asian Institute of Technology (AIT) Thailand.
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                <span className="text-xs font-semibold text-emerald-800 block">Kemitraan Instansi Pemerintah &amp; Kementerian</span>
                <div className="text-2xl font-black text-emerald-950 mt-1">
                  {filteredList.filter(k => k.kategoriMitra === 'Instansi Pemerintah / Kementerian').length}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  BWS Sumatera VI, Ditjen Bina Marga BPJN IV, BJKW II Palembang, DLH Provinsi Jambi, dan Pemkot Jambi.
                </p>
              </div>
            </div>

            {/* Rekap Distribusi Kategori Mitra */}
            <div className="mt-6 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                Distribusi Naskah Kerjasama Berdasarkan Kategori Lembaga Mitra
              </h4>
              <div className="space-y-3 text-xs">
                {[
                  { label: 'Instansi Pemerintah / Kementerian', count: filteredList.filter(k => k.kategoriMitra === 'Instansi Pemerintah / Kementerian').length, color: 'bg-emerald-600' },
                  { label: 'BUMN / BUMD', count: filteredList.filter(k => k.kategoriMitra === 'BUMN / BUMD').length, color: 'bg-blue-600' },
                  { label: 'Dunia Usaha & Industri (DUDI)', count: filteredList.filter(k => k.kategoriMitra === 'Dunia Usaha & Industri (DUDI)').length, color: 'bg-amber-600' },
                  { label: 'Perguruan Tinggi Luar & Dalam Negeri', count: filteredList.filter(k => k.kategoriMitra === 'Perguruan Tinggi').length, color: 'bg-purple-600' },
                  { label: 'Asosiasi Profesi (INKINDO, AKLI, LPJK)', count: filteredList.filter(k => k.kategoriMitra === 'Asosiasi Profesi').length, color: 'bg-indigo-600' }
                ].map((item, idx) => {
                  const percent = filteredList.length > 0 ? Math.round((item.count / filteredList.length) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-medium text-slate-700">
                        <span>{item.label}</span>
                        <span className="font-mono font-bold text-slate-900">{item.count} Dokumen ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: PERPANJANG MASA BERLAKU KERJASAMA (ADDENDUM) */}
      {/* ========================================================= */}
      {perpanjangDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Perpanjangan Naskah Kerjasama (Addendum)</h3>
              </div>
              <button
                type="button"
                onClick={() => setPerpanjangDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPerpanjang} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Dokumen Eksisting</span>
                <div className="font-bold text-slate-900 text-sm">{perpanjangDoc.mitraNama}</div>
                <div className="font-mono text-slate-700">{perpanjangDoc.nomorDokumen}</div>
                <div className="text-slate-600">
                  Masa berlaku saat ini berakhir pada: <strong className="font-mono text-red-700">{perpanjangDoc.tanggalSelesai}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nomor Registrasi Naskah Addendum / Perpanjangan *</label>
                <input
                  type="text"
                  required
                  value={perpanjangForm.nomorAddendum}
                  onChange={(e) => setPerpanjangForm({ ...perpanjangForm, nomorAddendum: e.target.value })}
                  placeholder="Contoh: 018.A/FT-UNBARI/Addendum/2025"
                  className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Pilihan Durasi Perpanjangan</label>
                  <select
                    value={perpanjangForm.durasiTahun}
                    onChange={(e) => {
                      const years = Number(e.target.value);
                      const baseDate = new Date(perpanjangDoc.tanggalSelesai);
                      const newDate = new Date(baseDate.setFullYear(baseDate.getFullYear() + years)).toISOString().split('T')[0];
                      setPerpanjangForm({
                        ...perpanjangForm,
                        durasiTahun: years,
                        tanggalSelesaiBaru: newDate
                      });
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-semibold"
                  >
                    <option value={1}>+ 1 Tahun</option>
                    <option value={2}>+ 2 Tahun</option>
                    <option value={3}>+ 3 Tahun (Rekomendasi Standar)</option>
                    <option value={5}>+ 5 Tahun</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tanggal Berakhir Baru *</label>
                  <input
                    type="date"
                    required
                    value={perpanjangForm.tanggalSelesaiBaru}
                    onChange={(e) => setPerpanjangForm({ ...perpanjangForm, tanggalSelesaiBaru: e.target.value })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Catatan Kesepakatan / Ruang Lingkup Tambahan</label>
                <textarea
                  rows={2}
                  value={perpanjangForm.catatanAddendum}
                  onChange={(e) => setPerpanjangForm({ ...perpanjangForm, catatanAddendum: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPerpanjangDoc(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Simpan Perpanjangan &amp; Aktifkan</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: TAMBAH / UBAH NASKAH KERJASAMA */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingDoc ? 'Ubah Dokumen Kerjasama' : 'Tambah Naskah Kerjasama Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fakultas Teknik Universitas Batanghari
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 mt-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nomor Registrasi FT UNBARI *</label>
                  <input
                    type="text"
                    required
                    value={formData.nomorDokumen}
                    onChange={(e) => setFormData({ ...formData, nomorDokumen: e.target.value })}
                    placeholder="024/FT-UNBARI/MoA/SIPIL/2024"
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nomor Naskah Mitra</label>
                  <input
                    type="text"
                    value={formData.nomorDokumenMitra}
                    onChange={(e) => setFormData({ ...formData, nomorDokumenMitra: e.target.value })}
                    placeholder="Nomor naskah dari lembaga mitra"
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nama Lembaga Mitra *</label>
                <input
                  type="text"
                  required
                  value={formData.mitraNama}
                  onChange={(e) => setFormData({ ...formData, mitraNama: e.target.value })}
                  placeholder="Contoh: Balai Wilayah Sungai Sumatera VI Jambi"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Jenis Dokumen</label>
                  <select
                    value={formData.jenisDokumen}
                    onChange={(e) => setFormData({ ...formData, jenisDokumen: e.target.value as JenisDokumenKerjasama })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-semibold"
                  >
                    <option value="MoA">MoA (Perjanjian Kerjasama)</option>
                    <option value="MoU">MoU (Nota Kesepahaman)</option>
                    <option value="IA">IA (Implementation Arrangement)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tingkat Wilayah</label>
                  <select
                    value={formData.tingkat}
                    onChange={(e) => setFormData({ ...formData, tingkat: e.target.value as TingkatKerjasama })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Nasional">Nasional</option>
                    <option value="Lokal/Wilayah">Lokal/Wilayah Jambi</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Kategori Mitra</label>
                  <select
                    value={formData.kategoriMitra}
                    onChange={(e) => setFormData({ ...formData, kategoriMitra: e.target.value as KategoriMitraKerjasama })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Instansi Pemerintah / Kementerian">Pemerintah / Kementerian</option>
                    <option value="BUMN / BUMD">BUMN / BUMD</option>
                    <option value="Dunia Usaha & Industri (DUDI)">Dunia Usaha &amp; Industri (DUDI)</option>
                    <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                    <option value="Asosiasi Profesi">Asosiasi Profesi</option>
                    <option value="LSM / Komunitas">LSM / Komunitas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Program Studi Terkait</label>
                  <select
                    value={formData.prodiId}
                    onChange={(e) => setFormData({ ...formData, prodiId: e.target.value as any })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-semibold text-blue-900"
                  >
                    <option value="SIPIL">S1 Teknik Sipil</option>
                    <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
                    <option value="LISTRIK_D3">D3 Teknik Listrik</option>
                    <option value="SEMUA_FT">Fakultas Teknik (Seluruh Prodi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Status Keberlakuan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusKerjasama })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Mendekati Berakhir">Mendekati Berakhir (&lt; 6 Bulan)</option>
                    <option value="Kedaluwarsa">Kedaluwarsa</option>
                    <option value="Dalam Penjajakan">Dalam Penjajakan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Judul / Perihal Kerjasama *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.judulKerjasama}
                  onChange={(e) => setFormData({ ...formData, judulKerjasama: e.target.value })}
                  placeholder="Contoh: Kerjasama Tri Dharma Perguruan Tinggi, Magang Industri Bersertifikat, dan Pengujian Sampel Laboratorium..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              {/* Bidang Kerjasama Multi-select Buttons */}
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">Bidang Ruang Lingkup Tridharma</label>
                <div className="flex flex-wrap gap-1.5">
                  {bidangOptions.map((opt) => {
                    const isSelected = formData.bidangKerjasama?.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const current = formData.bidangKerjasama || [];
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              bidangKerjasama: current.filter(b => b !== opt)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              bidangKerjasama: [...current, opt]
                            });
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tanggal Mulai Berlaku</label>
                  <input
                    type="date"
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tanggal Berakhir (Masa Berlaku)</label>
                  <input
                    type="date"
                    value={formData.tanggalSelesai}
                    onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Penandatangan dari Mitra</label>
                  <input
                    type="text"
                    value={formData.pejabatPenandatanganMitra}
                    onChange={(e) => setFormData({ ...formData, pejabatPenandatanganMitra: e.target.value })}
                    placeholder="Nama pimpinan / direktur mitra"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Dosen PIC FT UNBARI</label>
                  <input
                    type="text"
                    value={formData.picDosenFT}
                    onChange={(e) => setFormData({ ...formData, picDosenFT: e.target.value })}
                    placeholder="Nama dosen koordinator kerjasama"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Manfaat Konkret bagi Program Studi</label>
                <input
                  type="text"
                  value={formData.manfaatBagiProdi}
                  onChange={(e) => setFormData({ ...formData, manfaatBagiProdi: e.target.value })}
                  placeholder="Contoh: Kuota magang 10 mhs/semester dan akses praktisi mengajar"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="targetIku6"
                  checked={formData.targetIku6}
                  onChange={(e) => setFormData({ ...formData, targetIku6: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="targetIku6" className="text-slate-800 text-xs font-medium cursor-pointer">
                  Kemitraan ini memenuhi kriteria Indikator Kinerja Utama (IKU-6 Dikti)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  {editingDoc ? 'Simpan Perubahan' : 'Daftarkan Kerjasama'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: TAMBAH BUKTI REALISASI KEGIATAN (IA) */}
      {/* ========================================================= */}
      {showAddRealisasiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tambah Bukti Realisasi Kegiatan (IA)</h3>
                <p className="text-xs text-slate-500">Mitra: {showAddRealisasiModal.mitraNama}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRealisasiModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRealisasi} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nama / Bentuk Kegiatan Realisasi *</label>
                <input
                  type="text"
                  required
                  value={realisasiForm.namaKegiatan}
                  onChange={(e) => setRealisasiForm({ ...realisasiForm, namaKegiatan: e.target.value })}
                  placeholder="Contoh: Magang Industri 6 Bulan di Proyek Bendungan Batanghari"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Bidang Kerjasama</label>
                  <select
                    value={realisasiForm.bidang}
                    onChange={(e) => setRealisasiForm({ ...realisasiForm, bidang: e.target.value as any })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {bidangOptions.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={realisasiForm.tanggalPelaksanaan}
                    onChange={(e) => setRealisasiForm({ ...realisasiForm, tanggalPelaksanaan: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Jumlah Mahasiswa Terlibat</label>
                  <input
                    type="number"
                    min={0}
                    value={realisasiForm.jumlahMahasiswaTerlibat}
                    onChange={(e) => setRealisasiForm({ ...realisasiForm, jumlahMahasiswaTerlibat: Number(e.target.value) })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Jumlah Dosen Terlibat</label>
                  <input
                    type="number"
                    min={0}
                    value={realisasiForm.jumlahDosenTerlibat}
                    onChange={(e) => setRealisasiForm({ ...realisasiForm, jumlahDosenTerlibat: Number(e.target.value) })}
                    className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nomor Bukti IA / Surat Tugas</label>
                <input
                  type="text"
                  value={realisasiForm.nomorBuktiKegiatan}
                  onChange={(e) => setRealisasiForm({ ...realisasiForm, nomorBuktiKegiatan: e.target.value })}
                  placeholder="Contoh: IA-FT/SIPIL/2024/09 atau ST/082/FT/2024"
                  className="w-full font-mono text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Deskripsi Hasil &amp; Output Kegiatan</label>
                <textarea
                  rows={2}
                  value={realisasiForm.deskripsiHasil}
                  onChange={(e) => setRealisasiForm({ ...realisasiForm, deskripsiHasil: e.target.value })}
                  placeholder="Hasil nyata yang dicapai (laporan KP, sertifikat, publikasi, dll)..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRealisasiModal(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Simpan Bukti Realisasi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: DETAIL KERJASAMA & RIWAYAT AKTIVITAS LENGKAP */}
      {/* ========================================================= */}
      {selectedDetailDoc && (() => {
        const activities = (selectedDetailDoc.realisasiList || []).filter(rea => {
          const matchesFilter = detailActivityFilter === 'all' || rea.statusPelaksanaan === detailActivityFilter;
          const q = detailSearchQuery.toLowerCase().trim();
          const matchesSearch = !q || 
            rea.namaKegiatan.toLowerCase().includes(q) ||
            rea.bidang.toLowerCase().includes(q) ||
            rea.nomorBuktiKegiatan.toLowerCase().includes(q) ||
            rea.deskripsiHasil.toLowerCase().includes(q);
          return matchesFilter && matchesSearch;
        });

        const allRealisasi = selectedDetailDoc.realisasiList || [];
        const totalTerlaksana = allRealisasi.filter(r => r.statusPelaksanaan === 'Terlaksana').length;
        const totalBerjalan = allRealisasi.filter(r => r.statusPelaksanaan === 'Sedang Berjalan').length;
        const totalTerjadwal = allRealisasi.filter(r => r.statusPelaksanaan === 'Terjadwal').length;
        const totalMahasiswa = allRealisasi.reduce((acc, r) => acc + (r.jumlahMahasiswaTerlibat || 0), 0);
        const totalDosen = allRealisasi.reduce((acc, r) => acc + (r.jumlahDosenTerlibat || 0), 0);
        
        const daysLeft = calculateDaysRemaining(selectedDetailDoc.tanggalSelesai);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full my-auto flex flex-col max-h-[92vh] overflow-hidden">
              
              {/* MODAL HEADER */}
              <div className="p-5 md:p-6 border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-blue-50/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        selectedDetailDoc.jenisDokumen === 'MoU' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                        selectedDetailDoc.jenisDokumen === 'MoA' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {selectedDetailDoc.jenisDokumen}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {selectedDetailDoc.tingkat}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        selectedDetailDoc.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        selectedDetailDoc.status === 'Mendekati Berakhir' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {selectedDetailDoc.status}
                      </span>
                      {selectedDetailDoc.targetIku6 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                          <Award className="w-3 h-3 text-purple-600" />
                          <span>Relevan IKU-6</span>
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {selectedDetailDoc.prodiId === 'SEMUA_FT' ? 'Fakultas Teknik (Semua Prodi)' : `Prodi ${selectedDetailDoc.prodiId}`}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                      {selectedDetailDoc.mitraNama}
                    </h2>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {selectedDetailDoc.judulKerjasama}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                        <FileText className="w-3 h-3 text-slate-400" />
                        No. UNBARI: <strong className="text-slate-700">{selectedDetailDoc.nomorDokumen}</strong>
                      </span>
                      {selectedDetailDoc.nomorDokumenMitra && (
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                          No. Mitra: <strong className="text-slate-700">{selectedDetailDoc.nomorDokumenMitra}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDetailDoc(null);
                      setDetailSearchQuery('');
                      setDetailActivityFilter('all');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Tutup Modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* HIGHLIGHT STATS CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/80">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Aktivitas Terlaksana
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-bold text-emerald-600">{totalTerlaksana}</span>
                      <span className="text-xs text-slate-500">/ {allRealisasi.length} IA</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {totalBerjalan > 0 ? `${totalBerjalan} sedang berjalan` : 'Realisasi tridharma'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Mahasiswa Terlibat
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-xl font-bold text-slate-900">{totalMahasiswa}</span>
                      <span className="text-xs text-slate-500">Mhs</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">MBKM &amp; Magang FT</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Dosen FT Terlibat
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span className="text-xl font-bold text-slate-900">{totalDosen}</span>
                      <span className="text-xs text-slate-500">Dosen</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">PIC: {selectedDetailDoc.picDosenFT.split(',')[0]}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Masa Berlaku
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={`text-base font-bold font-mono ${
                        daysLeft < 0 ? 'text-red-600' :
                        daysLeft <= 90 ? 'text-amber-600' :
                        'text-slate-800'
                      }`}>
                        {daysLeft < 0 ? 'Kadaluarsa' : `${daysLeft} Hari Lagi`}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      s.d {selectedDetailDoc.tanggalSelesai}
                    </span>
                  </div>
                </div>

                {/* SUBTAB SELECTOR */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDetailModalTab('riwayat')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      detailModalTab === 'riwayat'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Riwayat Aktivitas &amp; Bukti IA</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      detailModalTab === 'riwayat' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {allRealisasi.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailModalTab('legalitas')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      detailModalTab === 'legalitas'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Legalitas &amp; Naskah Kerjasama</span>
                  </button>
                </div>
              </div>

              {/* MODAL BODY (SCROLLABLE) */}
              <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
                {detailModalTab === 'riwayat' ? (
                  <div className="space-y-4">
                    
                    {/* FILTER & ADD ACTION TOOLBAR */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                          <Filter className="w-3 h-3 text-slate-400" /> Filter:
                        </span>
                        <button
                          type="button"
                          onClick={() => setDetailActivityFilter('all')}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                            detailActivityFilter === 'all'
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Semua ({allRealisasi.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailActivityFilter('Terlaksana')}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                            detailActivityFilter === 'Terlaksana'
                              ? 'bg-emerald-700 text-white'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          Terlaksana ({totalTerlaksana})
                        </button>
                        {totalBerjalan > 0 && (
                          <button
                            type="button"
                            onClick={() => setDetailActivityFilter('Sedang Berjalan')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                              detailActivityFilter === 'Sedang Berjalan'
                                ? 'bg-sky-700 text-white'
                                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                            }`}
                          >
                            Berjalan ({totalBerjalan})
                          </button>
                        )}
                        {totalTerjadwal > 0 && (
                          <button
                            type="button"
                            onClick={() => setDetailActivityFilter('Terjadwal')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                              detailActivityFilter === 'Terjadwal'
                                ? 'bg-purple-700 text-white'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                            }`}
                          >
                            Terjadwal ({totalTerjadwal})
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:w-48">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={detailSearchQuery}
                            onChange={(e) => setDetailSearchQuery(e.target.value)}
                            placeholder="Cari aktivitas..."
                            className="w-full pl-8 pr-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowAddRealisasiModal(selectedDetailDoc);
                            setRealisasiForm({
                              namaKegiatan: '',
                              tanggalPelaksanaan: new Date().toISOString().split('T')[0],
                              bidang: selectedDetailDoc.bidangKerjasama[0] || 'Pendidikan & MBKM',
                              jumlahMahasiswaTerlibat: 10,
                              jumlahDosenTerlibat: 2,
                              deskripsiHasil: '',
                              nomorBuktiKegiatan: `IA-${selectedDetailDoc.prodiId}/${Date.now().toString().slice(-4)}`,
                              statusPelaksanaan: 'Terlaksana'
                            });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Catat Aktivitas (IA)</span>
                        </button>
                      </div>
                    </div>

                    {/* ACTIVITY LIST CARDS */}
                    {activities.length > 0 ? (
                      <div className="space-y-3">
                        {activities.map((rea, idx) => (
                          <div 
                            key={rea.id} 
                            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[10px] text-slate-400 font-bold">
                                    #{idx + 1}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    rea.statusPelaksanaan === 'Terlaksana' 
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                    rea.statusPelaksanaan === 'Sedang Berjalan' 
                                      ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                                      'bg-purple-100 text-purple-800 border border-purple-200'
                                  }`}>
                                    {rea.statusPelaksanaan === 'Terlaksana' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                    {rea.statusPelaksanaan === 'Sedang Berjalan' && <Clock className="w-3 h-3 text-sky-600" />}
                                    {rea.statusPelaksanaan === 'Terjadwal' && <Calendar className="w-3 h-3 text-purple-600" />}
                                    <span>{rea.statusPelaksanaan}</span>
                                  </span>

                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    {rea.bidang}
                                  </span>

                                  <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    {rea.nomorBuktiKegiatan}
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-slate-900 pt-0.5">
                                  {rea.namaKegiatan}
                                </h4>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRealisasi(selectedDetailDoc, rea.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Hapus Catatan Aktivitas"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* OUTPUT & PARTICIPANTS DETAILS */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs">
                              <div className="md:col-span-2 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" /> Luaran / Hasil Nyata Kegiatan:
                                </span>
                                <p className="text-slate-800 leading-relaxed font-normal">
                                  {rea.deskripsiHasil || 'Belum ada catatan luaran kegiatan.'}
                                </p>
                              </div>

                              <div className="space-y-1.5 md:border-l md:border-slate-200 md:pl-3">
                                <div>
                                  <span className="text-[10px] text-slate-500 block">Waktu Pelaksanaan:</span>
                                  <span className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" /> {rea.tanggalPelaksanaan}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 pt-1">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded">
                                    <Users className="w-3 h-3 text-blue-600" />
                                    {rea.jumlahMahasiswaTerlibat} Mahasiswa
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-100/60 px-2 py-0.5 rounded">
                                    <GraduationCap className="w-3 h-3 text-purple-600" />
                                    {rea.jumlahDosenTerlibat} Dosen
                                  </span>
                                </div>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 bg-white border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="max-w-md mx-auto space-y-1">
                          <h4 className="text-sm font-bold text-slate-800">
                            {detailSearchQuery || detailActivityFilter !== 'all' 
                              ? 'Tidak ada aktivitas yang cocok dengan filter' 
                              : 'Belum Ada Riwayat Aktivitas Kerjasama (IA)'}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {detailSearchQuery || detailActivityFilter !== 'all'
                              ? 'Coba ubah kata kunci pencarian atau reset filter status kegiatan di atas.'
                              : 'Untuk memenuhi standar akreditasi LAM-Teknik dan IKU-6, setiap dokumen MoU dan MoA wajib ditindaklanjuti dengan Implementation Arrangement (IA) dan bukti kegiatan nyata.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddRealisasiModal(selectedDetailDoc);
                            setRealisasiForm({
                              namaKegiatan: '',
                              tanggalPelaksanaan: new Date().toISOString().split('T')[0],
                              bidang: selectedDetailDoc.bidangKerjasama[0] || 'Pendidikan & MBKM',
                              jumlahMahasiswaTerlibat: 10,
                              jumlahDosenTerlibat: 2,
                              deskripsiHasil: '',
                              nomorBuktiKegiatan: `IA-${selectedDetailDoc.prodiId}/${Date.now().toString().slice(-4)}`,
                              statusPelaksanaan: 'Terlaksana'
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Catat Bukti Aktivitas Baru Sekarang</span>
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  /* LEGALITAS & NASKAH KERJASAMA */
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Judul Naskah Kerjasama
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                          {selectedDetailDoc.judulKerjasama}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                        <div className="space-y-1">
                          <span className="text-slate-500 block font-medium">Lembaga Mitra Kerjasama:</span>
                          <span className="font-bold text-slate-900 text-sm block">{selectedDetailDoc.mitraNama}</span>
                          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {selectedDetailDoc.kategoriMitra}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-500 block font-medium">Periode Masa Berlaku:</span>
                          <span className="font-mono font-bold text-slate-800 block">
                            {selectedDetailDoc.tanggalMulai} s.d {selectedDetailDoc.tanggalSelesai}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Durasi: {daysLeft < 0 ? 'Telah berakhir' : `${Math.floor(daysLeft / 30)} bulan (${daysLeft} hari tersisa)`}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-500 block font-medium">Pejabat Penandatangan Fakultas Teknik:</span>
                          <span className="font-semibold text-slate-900 block">{selectedDetailDoc.pejabatPenandatanganFT}</span>
                          <span className="text-[10px] text-slate-500">Fakultas Teknik Universitas Batanghari (UNBARI)</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-500 block font-medium">Pejabat Penandatangan Pihak Mitra:</span>
                          <span className="font-semibold text-slate-900 block">{selectedDetailDoc.pejabatPenandatanganMitra}</span>
                          <span className="text-[11px] text-slate-600 block">{selectedDetailDoc.jabatanPenandatanganMitra}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-500 block font-medium">Dosen Penanggung Jawab (PIC FT):</span>
                          <span className="font-bold text-blue-900 block">{selectedDetailDoc.picDosenFT}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-500 block font-medium">Kontak &amp; Korespondensi Mitra:</span>
                          <span className="text-slate-800 block">{selectedDetailDoc.kontakMitra || 'Kantor Perwakilan Wilayah Jambi'}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 space-y-1.5">
                        <span className="text-slate-500 block font-medium">Bidang Kerjasama yang Disepakati:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDetailDoc.bidangKerjasama.map((b, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              ✓ {b}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 space-y-1">
                        <span className="text-slate-500 block font-medium">Manfaat bagi Program Studi &amp; Mahasiswa FT:</span>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed italic">
                          "{selectedDetailDoc.manfaatBagiProdi}"
                        </div>
                      </div>

                      {selectedDetailDoc.keterangan && (
                        <div className="pt-2 text-slate-600 text-[11px]">
                          <strong>Catatan Tambahan:</strong> {selectedDetailDoc.keterangan}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 md:px-6 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setDocToPrint(selectedDetailDoc);
                      setIsPrintModalOpen(true);
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <Printer className="w-4 h-4 text-blue-700" />
                    <span>Cetak Lembar Dokumen &amp; Rekap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenPerpanjang(selectedDetailDoc);
                      setSelectedDetailDoc(null);
                    }}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                    <span>Perpanjang (Addendum)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenEdit(selectedDetailDoc);
                      setSelectedDetailDoc(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah Naskah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDetailDoc(null);
                      setDetailSearchQuery('');
                      setDetailActivityFilter('all');
                    }}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Print Document Modal */}
      <KerjasamaPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setDocToPrint(null);
        }}
        kerjasamaList={filteredList}
        selectedProdi={selectedProdi}
        selectedDoc={docToPrint}
      />

    </div>
  );
};
