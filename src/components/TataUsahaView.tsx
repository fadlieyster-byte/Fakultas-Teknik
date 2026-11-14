import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  ShieldCheck, 
  X, 
  Calendar, 
  User, 
  Phone, 
  ArrowRight,
  Inbox,
  SendHorizontal,
  Layers,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  Award,
  Copy,
  Check,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { 
  SuratPermohonanTU, 
  SuratAgendaTU, 
  PeminjamanSarprasTU, 
  ProgramStudiInfo, 
  Mahasiswa, 
  Dosen,
  JenisSuratTU,
  StatusSuratTU,
  TipeSuratAgenda,
  StatusPeminjamanSarpras
} from '../types/index';
import { SuratTuPrintModal } from './SuratTuPrintModal';
import { STAFF_TU_FAKULTAS } from '../data/mockTataUsahaData';
import { DEKAN_FAKULTAS_TEKNIK } from '../data/mockData';
import {
  JenisSkDokumenTU,
  SK_DOKUMEN_CONFIGS,
  generateAutoSkForDocType,
  getRomanMonth,
  buildSkNumber,
  ROMAN_MONTHS,
  PRODI_UNIT_OPTIONS,
  SkParts
} from '../utils/skNumberHelper';

interface TataUsahaViewProps {
  suratList: SuratPermohonanTU[];
  agendaList: SuratAgendaTU[];
  sarprasList: PeminjamanSarprasTU[];
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  selectedProdi: ProgramStudiInfo;
  onAddSurat: (surat: SuratPermohonanTU) => void;
  onUpdateSurat: (surat: SuratPermohonanTU) => void;
  onDeleteSurat: (id: string) => void;
  onAddAgenda: (agenda: SuratAgendaTU) => void;
  onUpdateAgenda: (agenda: SuratAgendaTU) => void;
  onDeleteAgenda?: (id: string) => void;
  onAddSarpras: (sarpras: PeminjamanSarprasTU) => void;
  onUpdateSarpras: (sarpras: PeminjamanSarprasTU) => void;
  onDeleteSarpras?: (id: string) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onShowToast: (msg: string) => void;
}

export const TataUsahaView: React.FC<TataUsahaViewProps> = ({
  suratList,
  agendaList,
  sarprasList,
  mahasiswaList,
  dosenList,
  selectedProdi,
  onAddSurat,
  onUpdateSurat,
  onDeleteSurat,
  onAddAgenda,
  onUpdateAgenda,
  onDeleteAgenda,
  onAddSarpras,
  onUpdateSarpras,
  onDeleteSarpras,
  onRequestConfirm,
  onShowToast
}) => {
  // Sub-tab state
  const [activeTab, setActiveTab] = useState<'surat' | 'agenda' | 'sarpras' | 'kontak'>('surat');

  // Search & Filter state for Surat
  const [searchSurat, setSearchSurat] = useState('');
  const [filterJenisSurat, setFilterJenisSurat] = useState<string>('all');
  const [filterStatusSurat, setFilterStatusSurat] = useState<string>('all');
  const [filterProdiSurat, setFilterProdiSurat] = useState<string>('current');

  // Search & Filter state for Agenda
  const [searchAgenda, setSearchAgenda] = useState('');
  const [filterTipeAgenda, setFilterTipeAgenda] = useState<string>('all');

  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedSuratForPrint, setSelectedSuratForPrint] = useState<SuratPermohonanTU | null>(null);
  const [selectedAgendaForPrint, setSelectedAgendaForPrint] = useState<SuratAgendaTU | null>(null);
  const [printMode, setPrintMode] = useState<'SURAT_MAHASISWA' | 'DISPOSISI_DEKAN'>('SURAT_MAHASISWA');

  // Add Surat Modal State
  const [showAddSuratModal, setShowAddSuratModal] = useState(false);
  const [newSuratForm, setNewSuratForm] = useState<{
    jenisSurat: JenisSuratTU;
    pemohonNama: string;
    pemohonNimNidn: string;
    keperluan: string;
    tujuanInstansi: string;
    namaOrangTua: string;
    pekerjaanOrangTua: string;
    instansiOrangTua: string;
    semester: number;
    judulPenelitian: string;
  }>({
    jenisSurat: 'Surat Keterangan Aktif Kuliah',
    pemohonNama: '',
    pemohonNimNidn: '',
    keperluan: 'Pengurusan Tunjangan Gaji Orang Tua / Beasiswa',
    tujuanInstansi: '',
    namaOrangTua: '',
    pekerjaanOrangTua: '',
    instansiOrangTua: '',
    semester: 3,
    judulPenelitian: ''
  });

  // Mode modal: 'SURAT' untuk surat permohonan biasa, 'SK_DEKAN' untuk penerbitan SK Dekan resmi otomatis
  const [suratModalMode, setSuratModalMode] = useState<'SURAT' | 'SK_DEKAN'>('SURAT');
  const [skDocType, setSkDocType] = useState<JenisSkDokumenTU>('SK Mengajar');
  const [skSubType, setSkSubType] = useState<'TA' | 'KP'>('TA');
  const [skSeqNumber, setSkSeqNumber] = useState('065');
  const [skProdiCode, setSkProdiCode] = useState<string>(
    selectedProdi.singkatan === 'Sipil' ? 'TS' : selectedProdi.singkatan === 'Lingkungan' ? 'TL' : 'TL-D3'
  );
  const [skDate, setSkDate] = useState(new Date().toISOString().slice(0, 10));
  const [skDosen1, setSkDosen1] = useState(dosenList[0]?.namaLengkap || 'Ir. Fadli Eka Yandra, ST., MT');
  const [skDosen2, setSkDosen2] = useState(dosenList[1]?.namaLengkap || 'Ahmad Ridwan, ST., MT');
  const [skMataKuliah, setSkMataKuliah] = useState('Mekanika Tanah & Rekayasa Pondasi');
  const [skSks, setSkSks] = useState(3);
  const [skJumlahPeserta, setSkJumlahPeserta] = useState(14);
  const [skPredikat, setSkPredikat] = useState('Dengan Pujian (Cum Laude)');
  const [skJudulBimbingan, setSkJudulBimbingan] = useState('');
  const [skManualMode, setSkManualMode] = useState(false);
  const [skManualNumber, setSkManualNumber] = useState('');
  const [copiedSkNotice, setCopiedSkNotice] = useState(false);

  // Automated SK generator computation
  const autoSkInfo = generateAutoSkForDocType(skDocType, {
    prodiCode: skProdiCode,
    date: skDate,
    sequence: skSeqNumber,
    subType: skSubType
  });

  const activeSkNumber = skManualMode && skManualNumber ? skManualNumber : autoSkInfo.nomorSk;

  const handleOpenTerbitkanSk = (type: JenisSkDokumenTU = 'SK Mengajar') => {
    setSuratModalMode('SK_DEKAN');
    setSkDocType(type);
    if (type === 'SK Mengajar') {
      setSkSeqNumber('065');
      setNewSuratForm(prev => ({
        ...prev,
        jenisSurat: 'Surat Keputusan (SK) Mengajar'
      }));
    } else if (type === 'SK Bimbingan') {
      setSkSeqNumber('042');
      setNewSuratForm(prev => ({
        ...prev,
        jenisSurat: 'Surat Keputusan (SK) Bimbingan'
      }));
    } else {
      setSkSeqNumber('112');
      setNewSuratForm(prev => ({
        ...prev,
        jenisSurat: 'Surat Keputusan (SK) Yudisium'
      }));
    }
    setShowAddSuratModal(true);
  };

  // Quick auto-populate for Agenda Surat Keluar (SK)
  const handleAutoPopulateSkAgenda = (type: JenisSkDokumenTU) => {
    const gen = generateAutoSkForDocType(type, {
      prodiCode: skProdiCode,
      date: new Date(),
      sequence: type === 'SK Mengajar' ? '065' : type === 'SK Bimbingan' ? '042' : '112'
    });
    setNewAgendaForm(prev => ({
      ...prev,
      tipe: 'Keluar',
      nomorSuratAsli: gen.nomorSk,
      perihal: gen.perihal,
      kategori: 'Akademik & Akreditasi',
      pengirimAtauTujuan: 'Dosen & Mahasiswa Fakultas Teknik UNBARI'
    }));
    onShowToast(`Nomor SK otomatis terisi: ${gen.nomorSk}`);
  };

  // Add Agenda Modal State
  const [showAddAgendaModal, setShowAddAgendaModal] = useState(false);
  const [newAgendaForm, setNewAgendaForm] = useState<{
    tipe: TipeSuratAgenda;
    nomorSuratAsli: string;
    pengirimAtauTujuan: string;
    perihal: string;
    kategori: 'Rektorat / Yayasan' | 'LLDIKTI / Kemendikbud' | 'Instansi Mitra / Industri' | 'Kemahasiswaan' | 'Akademik & Akreditasi';
    disposisiTujuan: string;
    disposisiInstruksi: string;
  }>({
    tipe: 'Masuk',
    nomorSuratAsli: '',
    pengirimAtauTujuan: '',
    perihal: '',
    kategori: 'Rektorat / Yayasan',
    disposisiTujuan: 'Wakil Dekan I',
    disposisiInstruksi: 'Tindaklanjuti segera'
  });

  // Add Sarpras Modal State
  const [showAddSarprasModal, setShowAddSarprasModal] = useState(false);
  const [newSarprasForm, setNewSarprasForm] = useState<{
    namaPeminjam: string;
    nimNidn: string;
    kontakHp: string;
    unitOrmawa: string;
    itemFasilitas: string;
    tanggalKegiatan: string;
    waktuMulai: string;
    waktuSelesai: string;
    keperluanAcara: string;
  }>({
    namaPeminjam: '',
    nimNidn: '',
    kontakHp: '',
    unitOrmawa: 'Himpunan Mahasiswa Sipil (HMS UNBARI)',
    itemFasilitas: 'Ruang Rapat Dekanat FT UNBARI',
    tanggalKegiatan: new Date().toISOString().slice(0, 10),
    waktuMulai: '09:00',
    waktuSelesai: '12:00',
    keperluanAcara: 'Rapat Kerja Pengurus Ormawa Fakultas Teknik'
  });

  // Filtered Surat
  const filteredSurat = suratList.filter((s) => {
    const matchProdi = 
      filterProdiSurat === 'all' 
        ? true 
        : filterProdiSurat === 'current' 
          ? s.prodiId === selectedProdi.id 
          : s.prodiId === filterProdiSurat;

    const matchSearch = 
      s.pemohonNama.toLowerCase().includes(searchSurat.toLowerCase()) ||
      s.pemohonNimNidn.includes(searchSurat) ||
      s.nomorSurat.toLowerCase().includes(searchSurat.toLowerCase()) ||
      s.keperluan.toLowerCase().includes(searchSurat.toLowerCase());

    const matchJenis = filterJenisSurat === 'all' || s.jenisSurat === filterJenisSurat;
    const matchStatus = filterStatusSurat === 'all' || s.status === filterStatusSurat;

    return matchProdi && matchSearch && matchJenis && matchStatus;
  });

  // Filtered Agenda
  const filteredAgenda = agendaList.filter((a) => {
    const matchTipe = filterTipeAgenda === 'all' || a.tipe === filterTipeAgenda;
    const matchSearch = 
      a.nomorAgenda.toLowerCase().includes(searchAgenda.toLowerCase()) ||
      a.nomorSuratAsli.toLowerCase().includes(searchAgenda.toLowerCase()) ||
      a.pengirimAtauTujuan.toLowerCase().includes(searchAgenda.toLowerCase()) ||
      a.perihal.toLowerCase().includes(searchAgenda.toLowerCase());

    return matchTipe && matchSearch;
  });

  // KPI Metrics
  const pendingSuratCount = suratList.filter(s => s.status === 'Diajukan' || s.status === 'Diproses TU' || s.status === 'Menunggu TTD Dekan').length;
  const completedSuratCount = suratList.filter(s => s.status === 'Selesai & Diterbitkan').length;
  const activeIncomingAgenda = agendaList.filter(a => a.tipe === 'Masuk' && a.status !== 'Selesai').length;
  const activeBookingsCount = sarprasList.filter(s => s.status === 'Disetujui KTU' || s.status === 'Sedang Digunakan').length;

  const handleSelectStudentForSurat = (studentNim: string) => {
    const student = mahasiswaList.find(m => m.nim === studentNim);
    if (!student) return;
    setNewSuratForm(prev => ({
      ...prev,
      pemohonNama: student.nama,
      pemohonNimNidn: student.nim,
      semester: student.semester,
      judulPenelitian: student.judulTA || ''
    }));
  };

  const handleAddSuratSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Jalur 1: Penerbitan Surat Keputusan (SK) Dekan Otomatis
    if (suratModalMode === 'SK_DEKAN' || newSuratForm.jenisSurat.startsWith('Surat Keputusan')) {
      const year = new Date(skDate).getFullYear() || new Date().getFullYear();
      let jenisSurat: JenisSuratTU = 'Surat Keputusan (SK) Mengajar';
      let pemohonNama = '';
      let pemohonNimNidn = '';
      let pemohonKategori: 'Dosen' | 'Mahasiswa' = 'Dosen';
      let keperluan = autoSkInfo.perihal;

      if (skDocType === 'SK Mengajar') {
        jenisSurat = 'Surat Keputusan (SK) Mengajar';
        pemohonNama = skDosen1 || dosenList[0]?.namaLengkap || 'Ir. Fadli Eka Yandra, ST., MT';
        pemohonNimNidn = dosenList.find(d => d.namaLengkap === pemohonNama)?.nidn || '0012088501';
        pemohonKategori = 'Dosen';
        keperluan = `Penetapan Beban Mengajar Dosen Semester Gasal/Genap - MK: ${skMataKuliah} (${skSks} SKS)`;
      } else if (skDocType === 'SK Bimbingan') {
        jenisSurat = 'Surat Keputusan (SK) Bimbingan';
        pemohonNama = newSuratForm.pemohonNama || 'Mahasiswa Bimbingan FT';
        pemohonNimNidn = newSuratForm.pemohonNimNidn || '2022010041';
        pemohonKategori = 'Mahasiswa';
        keperluan = skSubType === 'TA' 
          ? `Penetapan Dosen Pembimbing Skripsi/TA: ${skDosen1 || 'Dosen Pembimbing'} - Judul: "${skJudulBimbingan || newSuratForm.judulPenelitian || 'Tugas Akhir'}"`
          : `Penugasan Dosen Pembimbing Kerja Praktik Lapangan: ${skDosen1 || 'Dosen Pembimbing'}`;
      } else {
        jenisSurat = 'Surat Keputusan (SK) Yudisium';
        pemohonNama = `Peserta Rapat Yudisium Dekanat FT (${skJumlahPeserta} Lulusan)`;
        pemohonNimNidn = `YUD-FT-${year}`;
        pemohonKategori = 'Mahasiswa';
        keperluan = `Penetapan Kelulusan Yudisium dan Gelar Akademik Mahasiswa (${skJumlahPeserta} Calon Wisudawan)`;
      }

      const targetProdiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3' = 
        skProdiCode === 'TL' ? 'LINGKUNGAN' : skProdiCode === 'TL-D3' ? 'LISTRIK_D3' : 'SIPIL';

      const targetProdiNama = 
        skProdiCode === 'TL' ? 'S1 Teknik Lingkungan' : skProdiCode === 'TL-D3' ? 'D3 Teknik Listrik' : 'S1 Teknik Sipil';

      const newSurat: SuratPermohonanTU = {
        id: `SK-DEK-${Date.now().toString().slice(-4)}`,
        nomorSurat: activeSkNumber,
        jenisSurat,
        pemohonNama,
        pemohonNimNidn,
        pemohonKategori,
        prodiId: targetProdiId,
        programStudi: targetProdiNama,
        keperluan,
        tujuanInstansi: 'Dekanat & Civitas Academica FT UNBARI',
        tanggalPengajuan: skDate,
        tanggalSelesai: skDate,
        status: 'Selesai & Diterbitkan',
        catatanTU: `Surat Keputusan resmi diterbitkan dengan nomor ${activeSkNumber} dan ditandatangani Dekan.`,
        dataTambahan: {
          semester: newSuratForm.semester,
          tahunAkademik: `${year}/${year + 1}`,
          isSkDekan: true,
          kodeKlasifikasiSk: autoSkInfo.kodeKlasifikasi,
          jenisSkDokumen: skDocType,
          dosenPembimbing1: skDosen1,
          dosenPembimbing2: skDosen2,
          mataKuliah: skMataKuliah,
          sks: skSks,
          jumlahPeserta: skJumlahPeserta,
          predikatKelulusan: skPredikat,
          judulPenelitian: skJudulBimbingan || newSuratForm.judulPenelitian
        }
      };

      onAddSurat(newSurat);
      setShowAddSuratModal(false);
      onShowToast(`Surat Keputusan (${jenisSurat}) nomor ${activeSkNumber} berhasil diterbitkan!`);
      return;
    }

    // Jalur 2: Surat Permohonan Layanan Mahasiswa / Dosen Standar
    if (!newSuratForm.pemohonNama || !newSuratForm.pemohonNimNidn) {
      onShowToast('Harap lengkapi nama dan NIM pemohon.');
      return;
    }

    const year = new Date().getFullYear();
    const nextSeq = 148 + Math.floor(Math.random() * 800);
    const code = newSuratForm.jenisSurat.includes('Aktif') ? 'KM' : newSuratForm.jenisSurat.includes('KP') ? 'KP' : newSuratForm.jenisSurat.includes('Penelitian') ? 'TA' : 'ST';
    const nomorSurat = `${nextSeq}/UNBARI-FT/TU/${code}/${year}`;

    const newSurat: SuratPermohonanTU = {
      id: `SRT-TU-${Date.now().toString().slice(-4)}`,
      nomorSurat,
      jenisSurat: newSuratForm.jenisSurat,
      pemohonNama: newSuratForm.pemohonNama,
      pemohonNimNidn: newSuratForm.pemohonNimNidn,
      pemohonKategori: 'Mahasiswa',
      prodiId: selectedProdi.id,
      programStudi: selectedProdi.nama,
      keperluan: newSuratForm.keperluan,
      tujuanInstansi: newSuratForm.tujuanInstansi || undefined,
      tanggalPengajuan: new Date().toISOString().slice(0, 10),
      status: 'Diajukan',
      catatanTU: 'Permohonan baru masuk antrean pelayanan loket TU.',
      dataTambahan: {
        semester: newSuratForm.semester,
        tahunAkademik: '2026/2027',
        namaOrangTua: newSuratForm.namaOrangTua || undefined,
        pekerjaanOrangTua: newSuratForm.pekerjaanOrangTua || undefined,
        instansiOrangTua: newSuratForm.instansiOrangTua || undefined,
        judulPenelitian: newSuratForm.judulPenelitian || undefined
      }
    };

    onAddSurat(newSurat);
    setShowAddSuratModal(false);
    onShowToast(`Permohonan ${newSurat.jenisSurat} untuk ${newSurat.pemohonNama} berhasil diajukan!`);
  };

  const handleAddAgendaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgendaForm.nomorSuratAsli || !newAgendaForm.perihal) {
      onShowToast('Harap lengkapi nomor surat dan perihal agenda.');
      return;
    }

    const year = new Date().getFullYear();
    const seq = 187 + Math.floor(Math.random() * 400);
    const prefix = newAgendaForm.tipe === 'Masuk' ? 'M' : 'K';
    const nomorAgenda = `AGD/${prefix}/${year}/${seq}`;

    const newAgenda: SuratAgendaTU = {
      id: `AGD-${Date.now().toString().slice(-4)}`,
      tipe: newAgendaForm.tipe,
      nomorAgenda,
      nomorSuratAsli: newAgendaForm.nomorSuratAsli,
      tanggalSurat: new Date().toISOString().slice(0, 10),
      tanggalDiterima: new Date().toISOString().slice(0, 10),
      pengirimAtauTujuan: newAgendaForm.pengirimAtauTujuan,
      perihal: newAgendaForm.perihal,
      kategori: newAgendaForm.kategori,
      disposisiDekan: newAgendaForm.tipe === 'Masuk' ? {
        tujuanDisposisi: newAgendaForm.disposisiTujuan,
        instruksi: newAgendaForm.disposisiInstruksi,
        catatan: 'Segera koordinasikan teknis tindak lanjut bersama jajaran Dekanat/Prodi.',
        tanggalDisposisi: new Date().toISOString().slice(0, 10)
      } : undefined,
      status: newAgendaForm.tipe === 'Masuk' ? 'Didisposisikan' : 'Selesai'
    };

    onAddAgenda(newAgenda);
    setShowAddAgendaModal(false);
    onShowToast(`Surat ${newAgenda.tipe} nomor ${newAgenda.nomorAgenda} berhasil dicatatkan di buku agenda.`);
  };

  const handleAddSarprasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSarprasForm.namaPeminjam || !newSarprasForm.itemFasilitas) {
      onShowToast('Harap lengkapi nama peminjam dan fasilitas.');
      return;
    }

    const newSarpras: PeminjamanSarprasTU = {
      id: `SAR-${Date.now().toString().slice(-4)}`,
      namaPeminjam: newSarprasForm.namaPeminjam,
      nimNidn: newSarprasForm.nimNidn,
      kontakHp: newSarprasForm.kontakHp,
      unitOrmawa: newSarprasForm.unitOrmawa,
      itemFasilitas: newSarprasForm.itemFasilitas,
      tanggalKegiatan: newSarprasForm.tanggalKegiatan,
      waktuMulai: newSarprasForm.waktuMulai,
      waktuSelesai: newSarprasForm.waktuSelesai,
      keperluanAcara: newSarprasForm.keperluanAcara,
      status: 'Menunggu Persetujuan',
      catatanKTU: 'Pengajuan telah diterima loket TU dan menunggu persetujuan KTU.'
    };

    onAddSarpras(newSarpras);
    setShowAddSarprasModal(false);
    onShowToast(`Peminjaman fasilitas ${newSarpras.itemFasilitas} berhasil diajukan.`);
  };

  const handlePrintSurat = (s: SuratPermohonanTU) => {
    setSelectedSuratForPrint(s);
    setPrintMode('SURAT_MAHASISWA');
    setIsPrintModalOpen(true);
  };

  const handlePrintDisposisi = (a: SuratAgendaTU) => {
    setSelectedAgendaForPrint(a);
    setPrintMode('DISPOSISI_DEKAN');
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">

      {/* TOP HEADER BANNER TATA USAHA */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img 
              src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
              alt="Logo Universitas Batanghari" 
              className="w-14 h-14 object-contain bg-white/10 rounded-xl p-1.5 border border-white/20 shrink-0 hidden sm:block" 
            />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Bagian Tata Usaha &amp; Kesekretariatan Fakultas Teknik UNBARI</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Pusat Pelayanan Administrasi &amp; Persuratan
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Layanan permohonan surat keterangan aktif kuliah, surat pengantar kerja praktik, surat izin penelitian skripsi, buku agenda surat masuk/keluar, disposisi Dekan ({DEKAN_FAKULTAS_TEKNIK.nama}), dan peminjaman fasilitas dekanat.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSuratModalMode('SURAT');
                setShowAddSuratModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>Surat Permohonan</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenTerbitkanSk('SK Mengajar')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-950 bg-yellow-400 hover:bg-yellow-300 rounded-xl shadow-xs transition-colors hover:scale-[1.02]"
              title="Terbitkan Surat Keputusan (SK) Dekan FT UNBARI dengan Penomoran Otomatis"
            >
              <Award className="w-4 h-4 text-blue-950" />
              <span>Terbitkan SK Dekan (Otomatis)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddAgendaModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 rounded-xl shadow-xs transition-colors"
            >
              <Inbox className="w-4 h-4 text-blue-200" />
              <span>Catat Agenda Surat</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Antrean Surat Diproses</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono mt-2">
            {pendingSuratCount} <span className="text-xs font-normal text-slate-400">Berkas</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Menunggu TTD Dekan &amp; Stempel
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Surat Selesai Diterbitkan</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-2">
            {completedSuratCount} <span className="text-xs font-normal text-slate-400">Dokumen</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            SKMA, Pengantar KP, &amp; Izin Riset
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Agenda Surat Masuk</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono mt-2">
            {activeIncomingAgenda} <span className="text-xs font-normal text-slate-400">Surat</span>
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            Disposisi Dekan &amp; Instansi Luar
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Peminjaman Sarana/Ruang</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono mt-2">
            {activeBookingsCount} <span className="text-xs font-normal text-slate-400">Jadwal</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ruang Rapat Dekanat &amp; Aula Gedung E
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION TOOLBAR */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-1.5 rounded-xl shadow-xs overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('surat')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'surat'
              ? 'bg-blue-900 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'surat' ? 'text-white' : 'text-blue-700'}`} />
          <span>Layanan Persuratan &amp; SK</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeTab === 'surat' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {filteredSurat.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('agenda')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'agenda'
              ? 'bg-blue-900 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox className={`w-4 h-4 ${activeTab === 'agenda' ? 'text-white' : 'text-blue-700'}`} />
          <span>Buku Agenda Surat</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeTab === 'agenda' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {filteredAgenda.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sarpras')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'sarpras'
              ? 'bg-blue-900 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeTab === 'sarpras' ? 'text-white' : 'text-indigo-700'}`} />
          <span>Peminjaman Sarpras</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeTab === 'sarpras' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {sarprasList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kontak')}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'kontak'
              ? 'bg-blue-900 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeTab === 'kontak' ? 'text-white' : 'text-slate-600'}`} />
          <span>Struktur &amp; Loket TU</span>
        </button>
      </div>

      {/* TAB 1: LAYANAN PERSURATAN MAHASISWA & DOSEN & SK DEKAN */}
      {activeTab === 'surat' && (
        <div className="space-y-4">
          
          {/* Polished Filter & Action Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchSurat}
                  onChange={(e) => setSearchSurat(e.target.value)}
                  placeholder="Cari NIM/NIDN, Nama, Nomor Surat/SK, atau Keperluan..."
                  className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
                {searchSurat && (
                  <button
                    type="button"
                    onClick={() => setSearchSurat('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSuratModalMode('SURAT');
                    setShowAddSuratModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-600" />
                  <span>Permohonan Surat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenTerbitkanSk('SK Mengajar')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                  title="Penerbitan Surat Keputusan Dekan dengan Penomoran Otomatis"
                >
                  <Award className="w-3.5 h-3.5 text-blue-950" />
                  <span>Terbitkan SK Dekan (Otomatis)</span>
                </button>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-slate-400" />
                Filter:
              </span>

              <select
                value={filterProdiSurat}
                onChange={(e) => setFilterProdiSurat(e.target.value)}
                className="font-medium border border-blue-200 rounded-lg px-2.5 py-1.5 bg-blue-50/70 text-blue-950 focus:ring-1 focus:ring-blue-500"
              >
                <option value="current">Prodi Aktif: {selectedProdi.singkatan}</option>
                <option value="all">Semua Program Studi</option>
                <option value="SIPIL">S1 Teknik Sipil</option>
                <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
                <option value="LISTRIK_D3">D3 Teknik Listrik</option>
              </select>

              <select
                value={filterJenisSurat}
                onChange={(e) => setFilterJenisSurat(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Semua Jenis Dokumen / SK</option>
                <optgroup label="Surat Keputusan (SK) Dekan">
                  <option value="Surat Keputusan (SK) Mengajar">SK Mengajar (SK-BKD)</option>
                  <option value="Surat Keputusan (SK) Bimbingan">SK Bimbingan TA/KP (SK-TA)</option>
                  <option value="Surat Keputusan (SK) Yudisium">SK Yudisium (SK-YUD)</option>
                </optgroup>
                <optgroup label="Surat Keterangan &amp; Pengantar TU">
                  <option value="Surat Keterangan Aktif Kuliah">Surat Keterangan Aktif Kuliah</option>
                  <option value="Surat Pengantar Kerja Praktik (KP)">Surat Pengantar Kerja Praktik (KP)</option>
                  <option value="Surat Izin Penelitian / Data TA">Surat Izin Penelitian / Data TA</option>
                  <option value="Surat Rekomendasi Beasiswa">Surat Rekomendasi Beasiswa</option>
                  <option value="Surat Tugas Dosen">Surat Tugas Dosen</option>
                </optgroup>
              </select>

              <select
                value={filterStatusSurat}
                onChange={(e) => setFilterStatusSurat(e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Semua Status Pelayanan</option>
                <option value="Diajukan">Diajukan Mahasiswa</option>
                <option value="Diproses TU">Diproses Staf TU</option>
                <option value="Menunggu TTD Dekan">Menunggu TTD Dekan</option>
                <option value="Selesai & Diterbitkan">Selesai &amp; Diterbitkan</option>
                <option value="Ditolak">Ditolak</option>
              </select>

              {(filterJenisSurat !== 'all' || filterStatusSurat !== 'all' || filterProdiSurat !== 'current' || searchSurat) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterJenisSurat('all');
                    setFilterStatusSurat('all');
                    setFilterProdiSurat('current');
                    setSearchSurat('');
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          </div>

          {/* Surat Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No. Surat &amp; Tanggal</th>
                    <th className="py-3 px-3">Pemohon</th>
                    <th className="py-3 px-3">Jenis Surat</th>
                    <th className="py-3 px-3">Keperluan / Instansi Tujuan</th>
                    <th className="py-3 px-3">Status Pelayanan</th>
                    <th className="py-3 px-4 text-center">Aksi Petugas TU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSurat.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">Tidak ada permohonan surat yang cocok.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Gunakan tombol "Buat Surat Permohonan" untuk input berkas baru.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSurat.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* No Surat & Tanggal */}
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-blue-900">{s.nomorSurat}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{new Date(s.tanggalPengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </td>

                        {/* Pemohon */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 uppercase">{s.pemohonNama}</div>
                          <div className="font-mono text-[11px] text-slate-500">{s.pemohonNimNidn} · {s.programStudi}</div>
                        </td>

                        {/* Jenis Surat */}
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                            {s.jenisSurat}
                          </span>
                        </td>

                        {/* Keperluan */}
                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium max-w-xs">{s.keperluan}</div>
                          {s.tujuanInstansi && (
                            <div className="text-[11px] font-semibold text-blue-800 mt-0.5">
                              Tujuan: {s.tujuanInstansi}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                            s.status === 'Selesai & Diterbitkan'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : s.status === 'Menunggu TTD Dekan'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : s.status === 'Diproses TU'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : s.status === 'Ditolak'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {s.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            
                            {/* Update Status Dropdown Shortcut */}
                            <select
                              value={s.status}
                              onChange={(e) => {
                                const newStat = e.target.value as StatusSuratTU;
                                onUpdateSurat({ ...s, status: newStat });
                                onShowToast(`Status surat ${s.pemohonNama} diubah: ${newStat}`);
                              }}
                              className="text-[10px] border border-slate-300 rounded px-1.5 py-1 bg-white font-semibold"
                            >
                              <option value="Diajukan">Diajukan</option>
                              <option value="Diproses TU">Proses TU</option>
                              <option value="Menunggu TTD Dekan">TTD Dekan</option>
                              <option value="Selesai & Diterbitkan">Selesai</option>
                              <option value="Ditolak">Tolak</option>
                            </select>

                            {/* Print Official Letter */}
                            <button
                              type="button"
                              onClick={() => handlePrintSurat(s)}
                              title="Cetak Surat Resmi Kop FT UNBARI"
                              className="p-1.5 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onRequestConfirm(
                                  'Hapus Permohonan Surat',
                                  `Hapus permohonan surat ${s.jenisSurat} untuk ${s.pemohonNama}?`,
                                  () => {
                                    onDeleteSurat(s.id);
                                    onShowToast('Permohonan surat berhasil dihapus.');
                                  }
                                );
                              }}
                              title="Hapus Permohonan"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

        </div>
      )}

      {/* TAB 2: BUKU AGENDA SURAT MASUK & KELUAR */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchAgenda}
                  onChange={(e) => setSearchAgenda(e.target.value)}
                  placeholder="Cari Nomor Agenda, Nomor Asli, Pengirim, atau Perihal..."
                  className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
                {searchAgenda && (
                  <button
                    type="button"
                    onClick={() => setSearchAgenda('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tipe Agenda Segmented Switcher & Action Button */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFilterTipeAgenda('all')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      filterTipeAgenda === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTipeAgenda('Masuk')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      filterTipeAgenda === 'Masuk'
                        ? 'bg-blue-900 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Surat Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTipeAgenda('Keluar')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      filterTipeAgenda === 'Keluar'
                        ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Surat Keluar / SK
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddAgendaModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catat Agenda Baru</span>
                </button>
              </div>
            </div>

            {/* Officer Information Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Staff Persuratan, Agenda &amp; Arsip: <strong className="text-slate-900">{STAFF_TU_FAKULTAS.stafPersuratanAgendaArsip}</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 sm:mt-0">
                Penyelia: {STAFF_TU_FAKULTAS.kepalaTU} (Kabag TU)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAgenda.map((a) => (
              <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        a.tipe === 'Masuk' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        Surat {a.tipe}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {a.nomorAgenda}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {a.kategori}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 pt-1 leading-snug">
                      {a.perihal}
                    </h4>

                    <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                      <span>{a.tipe === 'Masuk' ? 'Pengirim:' : 'Tujuan:'} <strong>{a.pengirimAtauTujuan}</strong></span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-[11px]">No. Asli: {a.nomorSuratAsli}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">Tgl: {new Date(a.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    {a.disposisiDekan && (
                      <button
                        type="button"
                        onClick={() => handlePrintDisposisi(a)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-700" />
                        <span>Lembar Disposisi Dekan</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Disposisi Dekan Note if present */}
                {a.disposisiDekan && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 bg-blue-50/50 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-blue-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-700" />
                        <span>Disposisi Dekan FT UNBARI ({DEKAN_FAKULTAS_TEKNIK.nama}):</span>
                      </div>
                      <span className="text-[10px] font-mono text-blue-700">
                        {new Date(a.disposisiDekan.tanggalDisposisi).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="text-blue-900">
                      Diteruskan: <strong>{a.disposisiDekan.tujuanDisposisi}</strong> · Instruksi: <strong className="underline">{a.disposisiDekan.instruksi}</strong>
                    </div>
                    <div className="text-slate-700 italic text-[11px]">
                      "{a.disposisiDekan.catatan}"
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: PEMINJAMAN SARANA & RUANG DEKANAT */}
      {activeTab === 'sarpras' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jadwal &amp; Peminjaman Fasilitas Dekanat FT UNBARI</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan izin pemakaian Ruang Rapat Dekanat, Aula Gedung E, Ruang Seminar E-202, dan perangkat multimedia.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSarprasModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajukan Peminjaman</span>
            </button>
          </div>

          {/* Verification Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 bg-blue-50/60 border border-blue-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                Otorisasi &amp; Verifikasi Fasilitas: <strong className="text-blue-950">{STAFF_TU_FAKULTAS.kepalaTU}</strong> ({STAFF_TU_FAKULTAS.jabatanKepalaTU})
              </span>
            </div>
            <span className="text-[11px] text-blue-700 font-medium mt-1 sm:mt-0">
              Fakultas Teknik UNBARI
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sarprasList.map((s) => (
              <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900">{s.itemFasilitas}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                      s.status === 'Disetujui KTU'
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.status === 'Sedang Digunakan'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {s.keperluanAcara}
                  </p>

                  <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                    <div>Peminjam: <strong className="text-slate-800">{s.namaPeminjam}</strong> ({s.unitOrmawa})</div>
                    <div>Waktu: <strong className="font-mono text-slate-800">{new Date(s.tanggalKegiatan).toLocaleDateString('id-ID')} · {s.waktuMulai} - {s.waktuSelesai} WIB</strong></div>
                    <div>Kontak: <span className="font-mono">{s.kontakHp}</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Verifikasi KTU: {STAFF_TU_FAKULTAS.kepalaTU}</span>
                  <select
                    value={s.status}
                    onChange={(e) => {
                      const newStat = e.target.value as StatusPeminjamanSarpras;
                      onUpdateSarpras({ ...s, status: newStat });
                      onShowToast(`Status peminjaman diubah: ${newStat}`);
                    }}
                    className="text-[10px] font-bold border border-slate-300 rounded px-2 py-1 bg-white"
                  >
                    <option value="Menunggu Persetujuan">Menunggu</option>
                    <option value="Disetujui KTU">Disetujui KTU</option>
                    <option value="Sedang Digunakan">Digunakan</option>
                    <option value="Dikembalikan & Selesai">Selesai</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INFORMASI LOKET & STRUKTUR TU FT */}
      {activeTab === 'kontak' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <img 
              src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
              alt="Logo UNBARI" 
              className="w-11 h-11 object-contain shrink-0" 
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Struktur Organisasi Bagian Tata Usaha Fakultas Teknik UNBARI
              </h3>
              <p className="text-xs text-slate-500">
                Gedung Dekanat Fakultas Teknik Lantai 1 · Kampus I Universitas Batanghari Broni Jambi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Kepala Bagian Tata Usaha</span>
              <div className="text-sm font-bold text-slate-900">{STAFF_TU_FAKULTAS.kepalaTU}</div>
              <p className="text-[11px] text-slate-500 pt-1">
                Bertanggung jawab atas pengelolaan administrasi umum, koordinasi persuratan, kepegawaian, fasilitas sarpras, dan operasional tata usaha Fakultas Teknik UNBARI.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Staff Pelayanan Akademik &amp; Ijazah</span>
              <div className="text-sm font-bold text-slate-900">{STAFF_TU_FAKULTAS.stafPelayananAkademikDanIjazah}</div>
              <p className="text-[11px] text-slate-500 pt-1">
                Melayani pengurusan SKMA, transkrip nilai, pendaftaran sidang yudisium, verifikasi berkas kelulusan, penyerahan toga wisuda, dan legalisir ijazah.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Staff Persuratan, Agenda &amp; Arsip</span>
              <div className="text-sm font-bold text-slate-900">{STAFF_TU_FAKULTAS.stafPersuratanAgendaArsip || STAFF_TU_FAKULTAS.petugasPersuratan}</div>
              <p className="text-[11px] text-slate-500 pt-1">
                Melayani pencatatan surat masuk &amp; keluar, buku agenda disposisi Dekan, pengarsipan berkas dinas, surat pengantar Kerja Praktik (KP), dan surat izin penelitian skripsi.
              </p>
            </div>
          </div>

          {/* Loket Service Hours */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-blue-900">Jam Operasional Pelayanan Loket Tata Usaha</h4>
              <p className="text-blue-800 leading-relaxed">
                Senin – Kamis: 08.00 – 16.00 WIB (Istirahat 12.00 – 13.00 WIB) · Jumat: 08.00 – 16.30 WIB (Istirahat 11.30 – 13.30 WIB).<br />
                Permohonan surat mahasiswa diproses maksimal 1x24 jam kerja setelah ditandatangani Dekan Fakultas Teknik.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERMOHONAN SURAT & PENERBITAN SK DEKAN */}
      {showAddSuratModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-300 flex items-center justify-center border border-yellow-400/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {suratModalMode === 'SK_DEKAN' 
                      ? 'Penerbitan Surat Keputusan (SK) Dekan FT UNBARI' 
                      : 'Formulir Permohonan Surat Pelayanan Tata Usaha'}
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    {suratModalMode === 'SK_DEKAN'
                      ? 'Sistem Penomoran SK Otomatis dengan Kode Klasifikasi Terstandar'
                      : 'Pelayanan administrasi persuratan mahasiswa & dosen Fakultas Teknik'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSuratModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="flex p-1 bg-slate-200/80 rounded-xl max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSuratModalMode('SURAT');
                    setNewSuratForm(prev => ({
                      ...prev,
                      jenisSurat: 'Surat Keterangan Aktif Kuliah'
                    }));
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    suratModalMode === 'SURAT'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Permohonan Pelayanan
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenTerbitkanSk(skDocType)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    suratModalMode === 'SK_DEKAN'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  ★ Terbitkan SK Dekan
                </button>
              </div>
            </div>

            <form onSubmit={handleAddSuratSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
              
              {/* ======================================================== */}
              {/* MODE 1: PENERBITAN SURAT KEPUTUSAN (SK) DEKAN OTOMATIS */}
              {/* ======================================================== */}
              {suratModalMode === 'SK_DEKAN' && (
                <div className="space-y-4">
                  
                  {/* Step 1: Pilih Jenis Dokumen SK */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      1. Pilih Klasifikasi Dokumen SK Dekan *
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      
                      {/* SK Mengajar */}
                      <button
                        type="button"
                        onClick={() => {
                          setSkDocType('SK Mengajar');
                          setSkSeqNumber('065');
                          setNewSuratForm(prev => ({
                            ...prev,
                            jenisSurat: 'Surat Keputusan (SK) Mengajar'
                          }));
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          skDocType === 'SK Mengajar'
                            ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            skDocType === 'SK Mengajar' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            SK-BKD
                          </span>
                          {skDocType === 'SK Mengajar' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <div className="font-bold text-slate-900 text-xs">SK Mengajar</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                          Beban Kinerja Dosen &amp; Penugasan Mata Kuliah
                        </div>
                      </button>

                      {/* SK Bimbingan */}
                      <button
                        type="button"
                        onClick={() => {
                          setSkDocType('SK Bimbingan');
                          setSkSeqNumber('088');
                          setNewSuratForm(prev => ({
                            ...prev,
                            jenisSurat: 'Surat Keputusan (SK) Bimbingan'
                          }));
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          skDocType === 'SK Bimbingan'
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            skDocType === 'SK Bimbingan' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {skSubType === 'KP' ? 'SK-KP' : 'SK-TA'}
                          </span>
                          {skDocType === 'SK Bimbingan' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="font-bold text-slate-900 text-xs">SK Bimbingan</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                          Dosen Pembimbing Skripsi (TA) &amp; Kerja Praktik
                        </div>
                      </button>

                      {/* SK Yudisium */}
                      <button
                        type="button"
                        onClick={() => {
                          setSkDocType('SK Yudisium');
                          setSkSeqNumber('112');
                          setNewSuratForm(prev => ({
                            ...prev,
                            jenisSurat: 'Surat Keputusan (SK) Yudisium'
                          }));
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          skDocType === 'SK Yudisium'
                            ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-2 ring-purple-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            skDocType === 'SK Yudisium' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            SK-YUD
                          </span>
                          {skDocType === 'SK Yudisium' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <div className="font-bold text-slate-900 text-xs">SK Yudisium</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                          Kelulusan Mahasiswa &amp; Gelar Sarjana Teknik
                        </div>
                      </button>

                    </div>
                  </div>

                  {/* Sub-Type Selector for SK Bimbingan */}
                  {skDocType === 'SK Bimbingan' && (
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-emerald-950 text-xs">Jenis Bimbingan:</span>
                        <p className="text-[11px] text-emerald-700">Tentukan kode klasifikasi tugas akhir atau kerja praktik</p>
                      </div>
                      <div className="flex bg-white rounded-lg p-0.5 border border-emerald-300">
                        <button
                          type="button"
                          onClick={() => setSkSubType('TA')}
                          className={`px-3 py-1 text-xs rounded-md font-bold transition-all ${
                            skSubType === 'TA' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-50'
                          }`}
                        >
                          Skripsi / Tugas Akhir (SK-TA)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSkSubType('KP')}
                          className={`px-3 py-1 text-xs rounded-md font-bold transition-all ${
                            skSubType === 'KP' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-50'
                          }`}
                        >
                          Kerja Praktik (SK-KP)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Live SK Number Generator & Segment Visualizer */}
                  <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-xl p-4 text-white shadow-md border border-blue-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-bold">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Sistem Penomoran SK Otomatis (Standar UNBARI FT)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(activeSkNumber);
                          setCopiedSkNotice(true);
                          setTimeout(() => setCopiedSkNotice(false), 2000);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white rounded-md flex items-center gap-1 transition-colors"
                      >
                        {copiedSkNotice ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Nomor</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Prominent Number Display */}
                    <div className="bg-black/40 rounded-lg p-3 border border-white/10 flex items-center justify-center font-mono text-base font-bold text-center tracking-wider text-yellow-300 select-all">
                      {activeSkNumber}
                    </div>

                    {/* Segment Breakdown Badges */}
                    <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                        No: <strong>{skSeqNumber}</strong>
                      </span>
                      <span className="text-white/40">/</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30">
                        Klasifikasi: <strong>{autoSkInfo.kodeKlasifikasi}</strong>
                      </span>
                      <span className="text-white/40">/</span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                        Fakultas: <strong>FT-UNBARI</strong>
                      </span>
                      <span className="text-white/40">/</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                        Prodi: <strong>{skProdiCode}</strong>
                      </span>
                      <span className="text-white/40">/</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">
                        Bulan: <strong>{autoSkInfo.bulanRomawi}</strong>
                      </span>
                      <span className="text-white/40">/</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                        Tahun: <strong>{autoSkInfo.tahun}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Step 3: Parameter Kontrol Penomoran SK */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Nomor Urut SK *</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          required
                          value={skSeqNumber}
                          onChange={(e) => setSkSeqNumber(e.target.value)}
                          placeholder="065"
                          className="w-full border border-slate-300 rounded-lg p-1.5 font-mono font-bold bg-white text-center"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const num = parseInt(skSeqNumber.replace(/\D/g, '') || '0', 10);
                            setSkSeqNumber(String(num + 1).padStart(3, '0'));
                          }}
                          title="Nomor Urut Berikutnya (+1)"
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs"
                        >
                          +1
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Program Studi *</label>
                      <select
                        value={skProdiCode}
                        onChange={(e) => setSkProdiCode(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-1.5 bg-white font-bold"
                      >
                        <option value="TS">Teknik Sipil (TS)</option>
                        <option value="TL">Teknik Lingkungan (TL)</option>
                        <option value="TL-D3">D3 Teknik Lingkungan (TL-D3)</option>
                        <option value="FAKULTAS">Fakultas / Dekanat (FT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Tanggal SK *</label>
                      <input
                        type="date"
                        required
                        value={skDate}
                        onChange={(e) => setSkDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-1.5 bg-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Manual Override Checkbox */}
                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 text-[11px]">
                      <input
                        type="checkbox"
                        checked={skManualMode}
                        onChange={(e) => {
                          setSkManualMode(e.target.checked);
                          if (e.target.checked && !skManualNumber) {
                            setSkManualNumber(autoSkInfo.nomorSk);
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>Gunakan edit nomor SK manual (jika ada penomoran khusus/revisi)</span>
                    </label>
                  </div>

                  {skManualMode && (
                    <div>
                      <input
                        type="text"
                        value={skManualNumber}
                        onChange={(e) => setSkManualNumber(e.target.value)}
                        placeholder="Contoh: 065/SK-BKD/FT-UNBARI/TS/XI/2026"
                        className="w-full border border-amber-300 bg-amber-50 rounded-lg p-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                  )}

                  {/* Step 4: Detail Isi SK Berdasarkan Jenis */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                    <div className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span>Rincian &amp; Diktum Keputusan Dekan</span>
                      <span className="text-[11px] text-slate-400 font-normal">Tercetak langsung di lembar SK</span>
                    </div>

                    {/* SPESIFIK SK MENGAJAR */}
                    {skDocType === 'SK Mengajar' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Dosen Pengampu / Penerima SK *</label>
                            <select
                              value={skDosen1}
                              onChange={(e) => setSkDosen1(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg p-2 bg-white font-semibold"
                            >
                              {dosenList.map(d => (
                                <option key={d.id} value={d.namaLengkap}>
                                  {d.namaLengkap} ({d.jabatanFungsional || 'Dosen Tetap'})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Mata Kuliah Diampu *</label>
                            <input
                              type="text"
                              required
                              value={skMataKuliah}
                              onChange={(e) => setSkMataKuliah(e.target.value)}
                              placeholder="Mekanika Fluida & Hidrolika"
                              className="w-full border border-slate-300 rounded-lg p-2"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Bobot SKS *</label>
                            <input
                              type="number"
                              min={1}
                              max={6}
                              value={skSks}
                              onChange={(e) => setSkSks(parseInt(e.target.value) || 3)}
                              className="w-full border border-slate-300 rounded-lg p-2"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                            <select
                              value={newSuratForm.semester}
                              onChange={(e) => setNewSuratForm(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                              className="w-full border border-slate-300 rounded-lg p-2"
                            >
                              <option value={1}>Semester I (Ganjil)</option>
                              <option value={2}>Semester II (Genap)</option>
                              <option value={3}>Semester III (Ganjil)</option>
                              <option value={4}>Semester IV (Genap)</option>
                              <option value={5}>Semester V (Ganjil)</option>
                              <option value={6}>Semester VI (Genap)</option>
                              <option value={7}>Semester VII (Ganjil)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Tahun Akademik</label>
                            <input
                              type="text"
                              defaultValue="2026/2027 Ganjil"
                              className="w-full border border-slate-300 rounded-lg p-2"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SPESIFIK SK BIMBINGAN */}
                    {skDocType === 'SK Bimbingan' && (
                      <div className="space-y-3">
                        <div className="p-2.5 bg-blue-50/80 rounded-lg border border-blue-200">
                          <label className="block font-bold text-blue-950 mb-1">
                            Pilih Mahasiswa Yang Dibimbing:
                          </label>
                          <select
                            onChange={(e) => {
                              const found = mahasiswaList.find(m => m.nim === e.target.value);
                              if (found) {
                                setNewSuratForm(prev => ({
                                  ...prev,
                                  pemohonNimNidn: found.nim,
                                  pemohonNama: found.nama,
                                  semester: found.semester
                                }));
                                if (found.judulTA) {
                                  setSkJudulBimbingan(found.judulTA);
                                }
                              }
                            }}
                            className="w-full text-xs border border-blue-300 rounded-lg p-2 bg-white"
                          >
                            <option value="">-- Pilih Mahasiswa ({selectedProdi.singkatan}) --</option>
                            {mahasiswaList.map(m => (
                              <option key={m.id} value={m.nim}>
                                {m.nim} - {m.nama} (Sem: {m.semester})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Nama Mahasiswa *</label>
                            <input
                              type="text"
                              required
                              value={newSuratForm.pemohonNama}
                              onChange={(e) => setNewSuratForm(prev => ({ ...prev, pemohonNama: e.target.value }))}
                              placeholder="Nama Mahasiswa"
                              className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">NIM Mahasiswa *</label>
                            <input
                              type="text"
                              required
                              value={newSuratForm.pemohonNimNidn}
                              onChange={(e) => setNewSuratForm(prev => ({ ...prev, pemohonNimNidn: e.target.value }))}
                              placeholder="21010041"
                              className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              {skSubType === 'KP' ? 'Dosen Pembimbing KP *' : 'Dosen Pembimbing Utama (I) *'}
                            </label>
                            <select
                              value={skDosen1}
                              onChange={(e) => setSkDosen1(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg p-2 bg-white font-semibold"
                            >
                              {dosenList.map(d => (
                                <option key={d.id} value={d.namaLengkap}>{d.namaLengkap}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              {skSubType === 'KP' ? 'Pembimbing Lapangan / Mitra' : 'Dosen Pembimbing Pendamping (II) *'}
                            </label>
                            {skSubType === 'KP' ? (
                              <input
                                type="text"
                                value={skDosen2}
                                onChange={(e) => setSkDosen2(e.target.value)}
                                placeholder="Misal: Ir. Hendra Saputra (PT Hutama Karya)"
                                className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                              />
                            ) : (
                              <select
                                value={skDosen2}
                                onChange={(e) => setSkDosen2(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2 bg-white font-semibold"
                              >
                                {dosenList.map(d => (
                                  <option key={d.id} value={d.namaLengkap}>{d.namaLengkap}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            {skSubType === 'KP' ? 'Tempat & Instansi Kerja Praktik' : 'Judul Tugas Akhir / Skripsi'}
                          </label>
                          <textarea
                            rows={2}
                            value={skJudulBimbingan}
                            onChange={(e) => setSkJudulBimbingan(e.target.value)}
                            placeholder={skSubType === 'KP' 
                              ? 'Proyek Pembangunan Jembatan Batanghari II - PT Hutama Karya' 
                              : 'Analisis Stabilitas Lereng Menggunakan Metode Elemen Hingga Pada Ruas Jalan Nasional'}
                            className="w-full border border-slate-300 rounded-lg p-2"
                          />
                        </div>
                      </div>
                    )}

                    {/* SPESIFIK SK YUDISIUM */}
                    {skDocType === 'SK Yudisium' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Tingkat Penetapan SK *</label>
                            <select
                              value={skProdiCode === 'FAKULTAS' ? 'FAKULTAS' : 'PRODI'}
                              onChange={(e) => {
                                if (e.target.value === 'FAKULTAS') {
                                  setSkProdiCode('FAKULTAS');
                                } else {
                                  setSkProdiCode(selectedProdi.singkatan === 'Sipil' ? 'TS' : selectedProdi.singkatan === 'Lingkungan' ? 'TL' : 'TL-D3');
                                }
                              }}
                              className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                            >
                              <option value="PRODI">Kelulusan Prodi ({selectedProdi.singkatan}) - Kode SK-YUD</option>
                              <option value="FAKULTAS">Kelulusan Bersama Fakultas Teknik - Kode SK-DEK</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Jumlah Mahasiswa Lulus *</label>
                            <input
                              type="number"
                              min={1}
                              value={skJumlahPeserta}
                              onChange={(e) => setSkJumlahPeserta(parseInt(e.target.value) || 1)}
                              className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Predikat Kelulusan Utama</label>
                            <select
                              value={skPredikat}
                              onChange={(e) => setSkPredikat(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                            >
                              <option value="Dengan Pujian (Cum Laude)">Dengan Pujian (Cum Laude)</option>
                              <option value="Sangat Memuaskan">Sangat Memuaskan</option>
                              <option value="Memuaskan">Memuaskan</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Gelar Akademik Yang Diberikan</label>
                            <input
                              type="text"
                              readOnly
                              value={selectedProdi.jenjang === 'S1' ? 'Sarjana Teknik (S.T.)' : 'Ahli Madya Teknik (A.Md.T.)'}
                              className="w-full border border-slate-200 bg-slate-50 text-slate-700 rounded-lg p-2 font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Dasar Berita Acara Rapat Yudisium</label>
                          <input
                            type="text"
                            defaultValue={`BA Yudisium FT-UNBARI Periode Ganjil 2026`}
                            className="w-full border border-slate-300 rounded-lg p-2"
                          />
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* MODE 2: FORMULIR PERMOHONAN SURAT PELAYANAN MAHASISWA   */}
              {/* ======================================================== */}
              {suratModalMode === 'SURAT' && (
                <div className="space-y-4">
                  {/* Quick Select Student */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                    <label className="block font-bold text-blue-950">
                      Pilih Cepat dari Mahasiswa Terdaftar ({selectedProdi.singkatan}):
                    </label>
                    <select
                      onChange={(e) => handleSelectStudentForSurat(e.target.value)}
                      className="w-full text-xs border border-blue-300 rounded-lg p-2 bg-white"
                    >
                      <option value="">-- Pilih Mahasiswa --</option>
                      {mahasiswaList.slice(0, 50).map(m => (
                        <option key={m.id} value={m.nim}>
                          {m.nim} - {m.nama} (Sem: {m.semester})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Surat Yang Dimohonkan *</label>
                    <select
                      value={newSuratForm.jenisSurat}
                      onChange={(e) => setNewSuratForm({ ...newSuratForm, jenisSurat: e.target.value as any })}
                      className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                    >
                      <option value="Surat Keterangan Aktif Kuliah">Surat Keterangan Aktif Kuliah (SKMA)</option>
                      <option value="Surat Pengantar Kerja Praktik (KP)">Surat Pengantar Kerja Praktik (KP)</option>
                      <option value="Surat Izin Penelitian / Data TA">Surat Izin Penelitian / Pengambilan Data Skripsi</option>
                      <option value="Surat Rekomendasi Beasiswa">Surat Rekomendasi Beasiswa</option>
                      <option value="Surat Tugas Dosen">Surat Tugas Dosen</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">NIM / NIDN Pemohon *</label>
                      <input
                        type="text"
                        required
                        value={newSuratForm.pemohonNimNidn}
                        onChange={(e) => setNewSuratForm({ ...newSuratForm, pemohonNimNidn: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Pemohon *</label>
                      <input
                        type="text"
                        required
                        value={newSuratForm.pemohonNama}
                        onChange={(e) => setNewSuratForm({ ...newSuratForm, pemohonNama: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Keperluan Pembuatan Surat *</label>
                    <input
                      type="text"
                      required
                      value={newSuratForm.keperluan}
                      onChange={(e) => setNewSuratForm({ ...newSuratForm, keperluan: e.target.value })}
                      placeholder="Contoh: Pengurusan Tunjangan Gaji Orang Tua / Beasiswa Pemda"
                      className="w-full border border-slate-300 rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Instansi / Perusahaan Tujuan (Jika ada)</label>
                    <input
                      type="text"
                      value={newSuratForm.tujuanInstansi}
                      onChange={(e) => setNewSuratForm({ ...newSuratForm, tujuanInstansi: e.target.value })}
                      placeholder="Contoh: PT Hutama Karya (Persero) / Dinas PUPR Provinsi Jambi"
                      className="w-full border border-slate-300 rounded-lg p-2"
                    />
                  </div>

                  {/* Data Tambahan untuk SKMA */}
                  {newSuratForm.jenisSurat === 'Surat Keterangan Aktif Kuliah' && (
                    <div className="p-3 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
                      <span className="font-bold text-slate-800">Data Orang Tua (Untuk Tunjangan Gaji):</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 mb-1">Nama Orang Tua</label>
                          <input
                            type="text"
                            value={newSuratForm.namaOrangTua}
                            onChange={(e) => setNewSuratForm({ ...newSuratForm, namaOrangTua: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg p-1.5 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1">Pekerjaan / Instansi Orang Tua</label>
                          <input
                            type="text"
                            value={newSuratForm.instansiOrangTua}
                            onChange={(e) => setNewSuratForm({ ...newSuratForm, instansiOrangTua: e.target.value })}
                            placeholder="Contoh: PNS Badan Kepegawaian Daerah"
                            className="w-full border border-slate-300 rounded-lg p-1.5 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Tambahan untuk Penelitian */}
                  {newSuratForm.jenisSurat === 'Surat Izin Penelitian / Data TA' && (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Judul Penelitian Skripsi</label>
                      <textarea
                        rows={2}
                        value={newSuratForm.judulPenelitian}
                        onChange={(e) => setNewSuratForm({ ...newSuratForm, judulPenelitian: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg p-2"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  {suratModalMode === 'SK_DEKAN' ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Status otomatis disetujui Dekan &amp; siap cetak A4
                    </span>
                  ) : (
                    <span>Diproses Tata Usaha Fakultas Teknik UNBARI</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSuratModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-all ${
                      suratModalMode === 'SK_DEKAN'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-blue-700 hover:bg-blue-800'
                    }`}
                  >
                    {suratModalMode === 'SK_DEKAN' ? (
                      <>
                        <Award className="w-4 h-4 text-yellow-200" />
                        <span>Terbitkan SK Dekan Sekarang</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Ajukan Surat Permohonan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL CATAT AGENDA BARU */}
      {showAddAgendaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-yellow-300" />
                <h3 className="text-sm font-bold">Catat Agenda Surat Masuk / Keluar</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAgendaModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAgendaSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Agenda *</label>
                  <select
                    value={newAgendaForm.tipe}
                    onChange={(e) => setNewAgendaForm({ ...newAgendaForm, tipe: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="Masuk">Surat Masuk</option>
                    <option value="Keluar">Surat Keluar / SK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Surat</label>
                  <select
                    value={newAgendaForm.kategori}
                    onChange={(e) => setNewAgendaForm({ ...newAgendaForm, kategori: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="Rektorat / Yayasan">Rektorat / Yayasan</option>
                    <option value="LLDIKTI / Kemendikbud">LLDIKTI / Kemendikbud</option>
                    <option value="Instansi Mitra / Industri">Instansi Mitra / Industri</option>
                    <option value="Kemahasiswaan">Kemahasiswaan</option>
                    <option value="Akademik & Akreditasi">Akademik &amp; Akreditasi</option>
                  </select>
                </div>
              </div>

              {/* Quick SK Generator for Surat Keluar */}
              {newAgendaForm.tipe === 'Keluar' && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-700" />
                      Template Cepat Penomoran SK Dekan Otomatis:
                    </span>
                    <span className="text-[10px] text-blue-700 font-semibold">1-Klik Isi</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutoPopulateSkAgenda('SK Mengajar')}
                      className="px-2 py-1.5 bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-lg font-bold text-[11px] text-center transition-colors shadow-xs"
                    >
                      SK Mengajar
                      <span className="block text-[9px] font-normal text-blue-600">Kode SK-BKD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoPopulateSkAgenda('SK Bimbingan')}
                      className="px-2 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-[11px] text-center transition-colors shadow-xs"
                    >
                      SK Bimbingan
                      <span className="block text-[9px] font-normal text-emerald-600">Kode SK-TA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoPopulateSkAgenda('SK Yudisium')}
                      className="px-2 py-1.5 bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-lg font-bold text-[11px] text-center transition-colors shadow-xs"
                    >
                      SK Yudisium
                      <span className="block text-[9px] font-normal text-purple-600">Kode SK-YUD</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Surat Asli / SK *</label>
                <input
                  type="text"
                  required
                  value={newAgendaForm.nomorSuratAsli}
                  onChange={(e) => setNewAgendaForm({ ...newAgendaForm, nomorSuratAsli: e.target.value })}
                  placeholder="Contoh: 065/SK-BKD/FT-UNBARI/TS/XI/2026"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {newAgendaForm.tipe === 'Masuk' ? 'Instansi Pengirim *' : 'Tujuan Surat / Penerima SK *'}
                </label>
                <input
                  type="text"
                  required
                  value={newAgendaForm.pengirimAtauTujuan}
                  onChange={(e) => setNewAgendaForm({ ...newAgendaForm, pengirimAtauTujuan: e.target.value })}
                  placeholder="Contoh: Program Studi Teknik Sipil FT UNBARI"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Perihal Isi Surat / SK *</label>
                <textarea
                  rows={2}
                  required
                  value={newAgendaForm.perihal}
                  onChange={(e) => setNewAgendaForm({ ...newAgendaForm, perihal: e.target.value })}
                  placeholder="Ringkasan maksud isi surat..."
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              {newAgendaForm.tipe === 'Masuk' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <span className="font-bold text-blue-950">Disposisi Awal Dekan:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-blue-900 mb-0.5">Diteruskan Kepada:</label>
                      <input
                        type="text"
                        value={newAgendaForm.disposisiTujuan}
                        onChange={(e) => setNewAgendaForm({ ...newAgendaForm, disposisiTujuan: e.target.value })}
                        className="w-full border border-blue-300 rounded p-1.5 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-blue-900 mb-0.5">Instruksi Dekan:</label>
                      <input
                        type="text"
                        value={newAgendaForm.disposisiInstruksi}
                        onChange={(e) => setNewAgendaForm({ ...newAgendaForm, disposisiInstruksi: e.target.value })}
                        className="w-full border border-blue-300 rounded p-1.5 bg-white text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAgendaModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Simpan ke Buku Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PEMINJAMAN SARPRAS BARU */}
      {showAddSarprasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="bg-indigo-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-300" />
                <h3 className="text-sm font-bold">Pengajuan Peminjaman Sarana/Ruang Dekanat</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSarprasModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSarprasSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fasilitas / Ruangan Yang Dipinjam *</label>
                <select
                  value={newSarprasForm.itemFasilitas}
                  onChange={(e) => setNewSarprasForm({ ...newSarprasForm, itemFasilitas: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                >
                  <option value="Ruang Rapat Dekanat FT UNBARI">Ruang Rapat Dekanat FT UNBARI (Kapasitas 25 Orang)</option>
                  <option value="Aula Gedung E Fakultas Teknik">Aula Gedung E Fakultas Teknik (Kapasitas 150 Orang)</option>
                  <option value="Ruang Seminar E-202 & LCD Proyektor">Ruang Seminar E-202 &amp; LCD Proyektor</option>
                  <option value="Sound System Portable & 2 Mic Wireless">Sound System Portable &amp; 2 Mic Wireless</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pemohon / Penanggung Jawab *</label>
                  <input
                    type="text"
                    required
                    value={newSarprasForm.namaPeminjam}
                    onChange={(e) => setNewSarprasForm({ ...newSarprasForm, namaPeminjam: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIM / NIDN</label>
                  <input
                    type="text"
                    value={newSarprasForm.nimNidn}
                    onChange={(e) => setNewSarprasForm({ ...newSarprasForm, nimNidn: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit / Ormawa</label>
                  <input
                    type="text"
                    value={newSarprasForm.unitOrmawa}
                    onChange={(e) => setNewSarprasForm({ ...newSarprasForm, unitOrmawa: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={newSarprasForm.kontakHp}
                    onChange={(e) => setNewSarprasForm({ ...newSarprasForm, kontakHp: e.target.value })}
                    placeholder="0812-XXXX-XXXX"
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Acara</label>
                  <input
                    type="date"
                    value={newSarprasForm.tanggalKegiatan}
                    onChange={(e) => setNewSarprasForm({ ...newSarprasForm, tanggalKegiatan: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={newSarprasForm.waktuMulai}
                    onChange={(e) => setNewSarprasForm({ ...newSarprasForm, waktuMulai: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={newSarprasForm.waktuSelesai}
                    onChange={(e) => setNewSarprasForm({ ...newSarprasForm, waktuSelesai: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keperluan Acara *</label>
                <textarea
                  rows={2}
                  required
                  value={newSarprasForm.keperluanAcara}
                  onChange={(e) => setNewSarprasForm({ ...newSarprasForm, keperluanAcara: e.target.value })}
                  placeholder="Rapat / Pelatihan / Seminar Ormawa..."
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSarprasModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs"
                >
                  Ajukan Peminjaman
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL SURAT & DISPOSISI */}
      <SuratTuPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        surat={selectedSuratForPrint}
        agenda={selectedAgendaForPrint}
        selectedProdi={selectedProdi}
        mode={printMode}
      />

    </div>
  );
};
