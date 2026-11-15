import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Printer, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  FileText, 
  Video, 
  FolderGit2, 
  Sparkles, 
  MessageSquare, 
  GraduationCap, 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  BarChart2, 
  Edit3, 
  Trash2, 
  Send, 
  Paperclip, 
  Award,
  Layers,
  ChevronRight,
  HelpCircle,
  Upload,
  ClipboardCheck,
  X
} from 'lucide-react';
import { 
  LmsKelasKuliah, 
  LmsPertemuan, 
  LmsTugas, 
  LmsNilaiMahasiswa, 
  ProgramStudiInfo, 
  Mahasiswa, 
  Dosen 
} from '../types';
import { initialLmsKelasList } from '../data/mockLmsData';
import { LmsPrintModal } from './LmsPrintModal';
import { StandardKopSurat } from './StandardKopSurat';
import { printDocumentElement } from '../utils/printHelper';
import { logKaprodiActivity } from '../utils/activityLogHelper';
import { hitungSkalaNilai, SKALA_NILAI_UNBARI, formatRentangNilai } from '../utils/gradeScaleHelper';

interface LmsViewProps {
  selectedProdi: ProgramStudiInfo;
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const LmsView: React.FC<LmsViewProps> = ({
  selectedProdi,
  mahasiswaList,
  dosenList,
  onShowToast
}) => {
  // State
  const [kelasList, setKelasList] = useState<LmsKelasKuliah[]>(() => {
    const saved = localStorage.getItem('unbari_lms_kelas_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached LMS data', e);
      }
    }
    return initialLmsKelasList;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pertemuan' | 'tugas' | 'nilai' | 'diskusi' | 'peserta'>('pertemuan');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals for CRUD
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [editingGradeStudent, setEditingGradeStudent] = useState<LmsNilaiMahasiswa | null>(null);
  const [showSkalaNilaiModal, setShowSkalaNilaiModal] = useState(false);

  // Centralized E-Learning Terintegrasi & Ekspor Kepatuhan LMS states
  const [isQuickUploadOpen, setIsQuickUploadOpen] = useState(false);
  const [uploadKelasId, setUploadKelasId] = useState<string>('');
  const [uploadJenis, setUploadJenis] = useState<'materi' | 'kuis' | 'tugas'>('materi');
  const [uploadPertemuanKe, setUploadPertemuanKe] = useState<number>(1);
  const [uploadJudul, setUploadJudul] = useState<string>('');
  const [uploadTipeFile, setUploadTipeFile] = useState<'PDF' | 'PPTX' | 'Video' | 'Link'>('PDF');
  const [uploadFileMeta, setUploadFileMeta] = useState<{ name: string; size: string } | null>(null);
  const [uploadCatatan, setUploadCatatan] = useState<string>('');
  const [uploadBobot, setUploadBobot] = useState<number>(10);
  const [uploadDeadline, setUploadDeadline] = useState<string>('2025-11-28 23:59 WIB');
  const [isCompliancePdfModalOpen, setIsCompliancePdfModalOpen] = useState(false);
  const compliancePrintRef = React.useRef<HTMLDivElement>(null);

  // Discussion state
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [newCommentText, setNewCommentText] = useState<{ [threadId: string]: string }>({});

  // Form states for new class
  const [newKodeMK, setNewKodeMK] = useState('');
  const [newNamaMK, setNewNamaMK] = useState('');
  const [newSks, setNewSks] = useState<number>(3);
  const [newSemester, setNewSemester] = useState<number>(5);
  const [newKelas, setNewKelas] = useState('Kelas A');
  const [newDosenNama, setNewDosenNama] = useState('');
  const [newRuangan, setNewRuangan] = useState('Ruang Kuliah R.301');
  const [newHari, setNewHari] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Senin');
  const [newJamMulai, setNewJamMulai] = useState('08:00');
  const [newJamSelesai, setNewJamSelesai] = useState('10:30');

  // Form states for new task
  const [newTaskJudul, setNewTaskJudul] = useState('');
  const [newTaskTipe, setNewTaskTipe] = useState<LmsTugas['tipe']>('Tugas Mandiri');
  const [newTaskCpmk, setNewTaskCpmk] = useState('CPMK-1 (CPL IABEE Kriteria 3)');
  const [newTaskBobot, setNewTaskBobot] = useState<number>(10);
  const [newTaskDeadline, setNewTaskDeadline] = useState('2025-11-20 23:59 WIB');
  const [newTaskDeskripsi, setNewTaskDeskripsi] = useState('');

  // Form states for new meeting
  const [newPertemuanKe, setNewPertemuanKe] = useState<number>(11);
  const [newPertemuanTanggal, setNewPertemuanTanggal] = useState('2025-11-17');
  const [newPertemuanTopik, setNewPertemuanTopik] = useState('');
  const [newPertemuanSubtopik, setNewPertemuanSubtopik] = useState('');
  const [newPertemuanCpmk, setNewPertemuanCpmk] = useState('CPMK-3 (CPL IABEE 3.c)');
  const [newPertemuanMetode, setNewPertemuanMetode] = useState<'Tatap Muka' | 'Daring (Google Meet)' | 'Hybrid' | 'Praktikum Lab'>('Tatap Muka');

  // Filtered classes by selected program studi
  const currentProdiKelas = useMemo(() => {
    return kelasList.filter(k => k.prodiId === selectedProdi.id);
  }, [kelasList, selectedProdi.id]);

  // Filtered by search and semester
  const filteredKelas = useMemo(() => {
    return currentProdiKelas.filter(k => {
      const matchSearch = 
        k.namaMK.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.kodeMK.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.dosenNama.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchSemester = semesterFilter === 'all' || k.semester.toString() === semesterFilter;
      return matchSearch && matchSemester;
    });
  }, [currentProdiKelas, searchQuery, semesterFilter]);

  // Selected class detail
  const activeKelas = useMemo(() => {
    return kelasList.find(k => k.id === selectedKelasId) || null;
  }, [kelasList, selectedKelasId]);

  // Save to localStorage
  const saveKelasList = (updated: LmsKelasKuliah[]) => {
    setKelasList(updated);
    localStorage.setItem('unbari_lms_kelas_list', JSON.stringify(updated));
  };

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
    if (onShowToast) onShowToast(`Kode Google Classroom "${code}" disalin ke clipboard!`, 'success');
  };

  // Add new class handler
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKodeMK || !newNamaMK || !newDosenNama) {
      if (onShowToast) onShowToast('Harap lengkapi kode mata kuliah, nama, dan dosen pengampu.', 'error');
      return;
    }

    const newId = `lms-${selectedProdi.id.toLowerCase()}-${Date.now()}`;
    const newClassObj: LmsKelasKuliah = {
      id: newId,
      prodiId: selectedProdi.id,
      kodeMK: newKodeMK,
      namaMK: newNamaMK,
      sks: newSks,
      semester: newSemester,
      tahunAkademik: '2025/2026 Ganjil',
      kelas: newKelas,
      hari: newHari,
      jamMulai: newJamMulai,
      jamSelesai: newJamSelesai,
      ruanganNama: newRuangan,
      dosenNidn: '00' + Math.floor(10000000 + Math.random() * 90000000),
      dosenNama: newDosenNama,
      dosenEmail: `${newDosenNama.toLowerCase().replace(/[^a-z]/g, '')}@universitasbatanghari.ac.id`,
      deskripsiMK: `Mata kuliah kurikulum OBE Program Studi ${selectedProdi.nama} FT UNBARI.`,
      googleClassroomCode: `ftu-${newKodeMK.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      totalPertemuanTarget: 16,
      pertemuanSelesaiCount: 0,
      pesertaCount: 25,
      pertemuanList: [
        {
          id: `p-${newId}-1`,
          pertemuanKe: 1,
          tanggal: new Date().toISOString().split('T')[0],
          topik: 'Kontrak Perkuliahan & Silabus RPS',
          subTopik: 'Pengantar Capaian Pembelajaran Lulusan (CPL) dan CPMK',
          cpmkTarget: 'CPMK-1 (CPL IABEE Kriteria 3.a)',
          metode: 'Tatap Muka',
          status: 'Terjadwal',
          materiList: [],
          kehadiranHadir: 0,
          kehadiranSakit: 0,
          kehadiranIzin: 0,
          kehadiranAlpa: 0,
          totalMahasiswa: 25
        }
      ],
      tugasList: [],
      nilaiList: [],
      diskusiList: [
        {
          id: `d-${newId}-1`,
          judul: `Selamat Datang di Perkuliahan ${newNamaMK}`,
          pengirimNama: newDosenNama,
          pengirimRole: 'Dosen',
          waktu: new Date().toLocaleString('id-ID'),
          isi: 'Silakan unduh dokumen RPS dan bergabung ke Google Classroom untuk koordinasi materi dan tugas perkuliahan.',
          isPinned: true,
          komentarList: []
        }
      ]
    };

    const updated = [newClassObj, ...kelasList];
    saveKelasList(updated);
    setIsNewClassModalOpen(false);
    setSelectedKelasId(newId);
    if (onShowToast) onShowToast(`Kelas ${newNamaMK} berhasil dibuat!`, 'success');

    // Reset fields
    setNewKodeMK('');
    setNewNamaMK('');
    setNewDosenNama('');
  };

  // Add new meeting handler
  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKelas || !newPertemuanTopik) return;

    const newMeetingObj: LmsPertemuan = {
      id: `p-${activeKelas.id}-${Date.now()}`,
      pertemuanKe: newPertemuanKe,
      tanggal: newPertemuanTanggal,
      topik: newPertemuanTopik,
      subTopik: newPertemuanSubtopik,
      cpmkTarget: newPertemuanCpmk,
      metode: newPertemuanMetode,
      status: 'Terjadwal',
      materiList: [],
      kehadiranHadir: 0,
      kehadiranSakit: 0,
      kehadiranIzin: 0,
      kehadiranAlpa: 0,
      totalMahasiswa: activeKelas.pesertaCount || 25
    };

    const updatedMeetings = [...activeKelas.pertemuanList, newMeetingObj].sort((a, b) => a.pertemuanKe - b.pertemuanKe);
    const updatedClass: LmsKelasKuliah = {
      ...activeKelas,
      pertemuanList: updatedMeetings
    };

    const updatedAll = kelasList.map(k => k.id === activeKelas.id ? updatedClass : k);
    saveKelasList(updatedAll);
    setIsNewMeetingModalOpen(false);
    setNewPertemuanTopik('');
    setNewPertemuanSubtopik('');
    if (onShowToast) onShowToast(`Pertemuan ke-${newPertemuanKe} berhasil ditambahkan!`, 'success');
  };

  // Add new task handler
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKelas || !newTaskJudul) return;

    const newTaskObj: LmsTugas = {
      id: `t-${activeKelas.id}-${Date.now()}`,
      judul: newTaskJudul,
      tipe: newTaskTipe,
      pertemuanKe: 5,
      cpmk: newTaskCpmk,
      bobotPersen: newTaskBobot,
      deadline: newTaskDeadline,
      deskripsi: newTaskDeskripsi || 'Silakan unggah laporan dalam format PDF melalui portal LMS.',
      pengumpulanList: []
    };

    const updatedClass: LmsKelasKuliah = {
      ...activeKelas,
      tugasList: [newTaskObj, ...activeKelas.tugasList]
    };

    const updatedAll = kelasList.map(k => k.id === activeKelas.id ? updatedClass : k);
    saveKelasList(updatedAll);
    setIsNewTaskModalOpen(false);
    setNewTaskJudul('');
    setNewTaskDeskripsi('');
    if (onShowToast) onShowToast(`Tugas "${newTaskJudul}" berhasil dibuat!`, 'success');
  };

  // Add discussion thread
  const handleAddDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKelas || !newDiscussionTitle || !newDiscussionContent) return;

    const newThread = {
      id: `d-${Date.now()}`,
      judul: newDiscussionTitle,
      pengirimNama: 'Ketua Program Studi (' + selectedProdi.nama + ')',
      pengirimRole: 'Dosen' as const,
      waktu: new Date().toLocaleString('id-ID'),
      isi: newDiscussionContent,
      isPinned: false,
      komentarList: []
    };

    const updatedClass: LmsKelasKuliah = {
      ...activeKelas,
      diskusiList: [newThread, ...activeKelas.diskusiList]
    };

    const updatedAll = kelasList.map(k => k.id === activeKelas.id ? updatedClass : k);
    saveKelasList(updatedAll);
    setNewDiscussionTitle('');
    setNewDiscussionContent('');
    if (onShowToast) onShowToast('Topik diskusi berhasil dikirim!', 'success');
  };

  // Add comment to discussion
  const handleAddComment = (threadId: string) => {
    const text = newCommentText[threadId];
    if (!activeKelas || !text || text.trim() === '') return;

    const updatedDiscussions = activeKelas.diskusiList.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          komentarList: [
            ...t.komentarList,
            {
              id: `c-${Date.now()}`,
              pengirimNama: 'Ketua Program Studi',
              pengirimRole: 'Dosen' as const,
              waktu: new Date().toLocaleString('id-ID'),
              pesan: text
            }
          ]
        };
      }
      return t;
    });

    const updatedClass: LmsKelasKuliah = {
      ...activeKelas,
      diskusiList: updatedDiscussions
    };

    const updatedAll = kelasList.map(k => k.id === activeKelas.id ? updatedClass : k);
    saveKelasList(updatedAll);
    setNewCommentText(prev => ({ ...prev, [threadId]: '' }));
    if (onShowToast) onShowToast('Balasan diskusi terkirim!', 'success');
  };

  // Update grade for a student
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKelas || !editingGradeStudent) return;

    // Recalculate final score: Tugas 20%, Kuis 10%, Praktikum 15%, UTS 25%, UAS 30%
    const finalScore = Number(
      (
        editingGradeStudent.tugas * 0.2 +
        editingGradeStudent.kuis * 0.1 +
        editingGradeStudent.praktikum * 0.15 +
        editingGradeStudent.uts * 0.25 +
        editingGradeStudent.uas * 0.3
      ).toFixed(1)
    );

    const skala = hitungSkalaNilai(finalScore);
    const isLulus = skala.huruf !== 'D' && skala.huruf !== 'E';

    const updatedStudent: LmsNilaiMahasiswa = {
      ...editingGradeStudent,
      nilaiAkhir: finalScore,
      hurufMutu: skala.huruf,
      angkaMutu: skala.bobot,
      statusKelulusan: skala.statusKelulusan === 'Lulus Bersyarat' ? 'Perbaikan / Remedial' : isLulus ? 'Lulus' : 'Tidak Lulus'
    };

    const updatedNilaiList = activeKelas.nilaiList.map(n => 
      n.mahasiswaNim === editingGradeStudent.mahasiswaNim ? updatedStudent : n
    );

    const updatedClass: LmsKelasKuliah = {
      ...activeKelas,
      nilaiList: updatedNilaiList
    };

    const updatedAll = kelasList.map(k => k.id === activeKelas.id ? updatedClass : k);
    saveKelasList(updatedAll);
    setEditingGradeStudent(null);
    if (onShowToast) onShowToast(`Nilai mahasiswa ${editingGradeStudent.mahasiswaNama} berhasil disimpan!`, 'success');
  };

  // Overall Statistics for current Prodi
  const totalClasses = currentProdiKelas.length;
  const totalCompletedMeetings = currentProdiKelas.reduce((acc, k) => acc + k.pertemuanSelesaiCount, 0);
  const totalTasks = currentProdiKelas.reduce((acc, k) => acc + k.tugasList.length, 0);
  const totalStudentsEnrolled = currentProdiKelas.reduce((acc, k) => acc + k.pesertaCount, 0);

  // Recap Kepatuhan LMS per Mata Kuliah (AMI)
  const lmsComplianceRows = useMemo(() => {
    return currentProdiKelas.map((k, idx) => {
      const jumlahMateri = k.pertemuanList.reduce(
        (acc, p) => acc + (p.materiList ? p.materiList.length : 0),
        0
      );
      const jumlahKuis = k.tugasList.filter(t => t.tipe === 'Quiz Online').length;
      const jumlahTugas = k.tugasList.filter(t => t.tipe !== 'Quiz Online').length;
      const rpsPct = k.totalPertemuanTarget > 0
        ? Math.min(100, Math.round((k.pertemuanSelesaiCount / k.totalPertemuanTarget) * 100))
        : 0;
      const skorMateri = Math.min(100, Math.round((jumlahMateri / Math.max(1, k.pertemuanSelesaiCount)) * 100));
      const skorKepatuhan = Math.min(100, Math.round(rpsPct * 0.5 + skorMateri * 0.3 + (jumlahKuis + jumlahTugas > 0 ? 20 : 5)));
      return {
        no: idx + 1,
        id: k.id,
        kodeMK: k.kodeMK,
        namaMK: k.namaMK,
        kelas: k.kelas,
        sks: k.sks,
        dosenNama: k.dosenNama,
        pertemuanSelesai: k.pertemuanSelesaiCount,
        totalTarget: k.totalPertemuanTarget,
        jumlahMateri,
        jumlahKuis,
        jumlahTugas,
        skorKepatuhan,
        statusAmi: skorKepatuhan >= 75 ? 'Patuh Standar AMI' : 'Perlu Kelengkapan'
      };
    });
  }, [currentProdiKelas]);

  const handleOpenQuickUpload = () => {
    setUploadKelasId(activeKelas?.id || currentProdiKelas[0]?.id || '');
    setIsQuickUploadOpen(true);
  };

  const handleQuickUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = uploadKelasId || activeKelas?.id || currentProdiKelas[0]?.id;
    const targetClass = kelasList.find(k => k.id === targetId);
    if (!targetClass || !uploadJudul.trim()) return;

    let updatedClass: LmsKelasKuliah = targetClass;
    if (uploadJenis === 'materi') {
      const targetMeetingExists = targetClass.pertemuanList.some(
        p => p.pertemuanKe === uploadPertemuanKe
      );
      const newMateri = {
        id: `mat-${Date.now()}`,
        judul: uploadJudul.trim(),
        tipe: uploadTipeFile,
        fileUrl: '#uploaded-lms-file',
        fileSize: uploadFileMeta?.size || '1.2 MB'
      };

      const nextPertemuanList = targetMeetingExists
        ? targetClass.pertemuanList.map(p =>
            p.pertemuanKe === uploadPertemuanKe
              ? { ...p, materiList: [...(p.materiList || []), newMateri] }
              : p
          )
        : [
            ...targetClass.pertemuanList,
            {
              id: `p-${targetClass.id}-${Date.now()}`,
              pertemuanKe: uploadPertemuanKe,
              tanggal: new Date().toISOString().slice(0, 10),
              topik: uploadJudul.trim(),
              subTopik: uploadCatatan || 'Unggahan E-Learning Terintegrasi',
              cpmkTarget: 'CPMK Terkait RPS OBE',
              metode: 'Tatap Muka' as const,
              status: 'Terjadwal' as const,
              materiList: [newMateri],
              kehadiranHadir: 0,
              kehadiranSakit: 0,
              kehadiranIzin: 0,
              kehadiranAlpa: 0,
              totalMahasiswa: targetClass.pesertaCount || 25
            }
          ].sort((a, b) => a.pertemuanKe - b.pertemuanKe);

      updatedClass = {
        ...targetClass,
        pertemuanList: nextPertemuanList
      };
    } else {
      const newTask: LmsTugas = {
        id: `t-quick-${Date.now()}`,
        judul: uploadJudul.trim(),
        tipe: uploadJenis === 'kuis' ? 'Quiz Online' : 'Tugas Mandiri',
        pertemuanKe: uploadPertemuanKe,
        cpmk: 'CPMK-OBE Terintegrasi',
        bobotPersen: uploadBobot,
        deadline: uploadDeadline,
        deskripsi:
          uploadCatatan ||
          `Evaluasi ${uploadJenis === 'kuis' ? 'Kuis Online' : 'Tugas Terstruktur'} diunggah melalui E-Learning Terintegrasi.`,
        pengumpulanList: []
      };
      updatedClass = {
        ...targetClass,
        tugasList: [newTask, ...targetClass.tugasList]
      };
    }

    const updatedAll = kelasList.map(k => (k.id === targetClass.id ? updatedClass : k));
    saveKelasList(updatedAll);
    setUploadJudul('');
    setUploadCatatan('');
    setUploadFileMeta(null);
    setIsQuickUploadOpen(false);

    logKaprodiActivity({
      category: 'EXPORT_DOKUMEN',
      actionTitle: `E-Learning Terintegrasi: Unggah ${uploadJenis.toUpperCase()} (${targetClass.kodeMK})`,
      detail: `"${uploadJudul.trim()}" ditambahkan ke kelas ${targetClass.namaMK} (Pertemuan ${uploadPertemuanKe}).`,
      actor: `Dosen/Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id
    });

    if (onShowToast) {
      onShowToast(
        `${uploadJenis === 'materi' ? 'Materi Perkuliahan' : uploadJenis === 'kuis' ? 'Kuis' : 'Tugas'} "${uploadJudul.trim()}" berhasil dipublikasikan ke ${targetClass.namaMK}!`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                E-Learning & LMS Terpadu
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-500">
                Fakultas Teknik Universitas Batanghari
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-sky-700" />
              <span>LMS Perkuliahan ({selectedProdi.nama})</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Sistem Manajemen Pembelajaran Daring & Luring, Kontrak Kuliah, 16 Pertemuan RPS, Evaluasi Capaian CPMK OBE, dan Rekapitulasi Nilai Akhir (DPNA).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenQuickUpload}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>E-Learning: Upload Materi/Kuis/Tugas</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCompliancePdfModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Ekspor Laporan Kepatuhan LMS (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewClassModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buka Kelas Baru</span>
            </button>

            {activeKelas && (
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen A4 (DPNA / Jurnal)</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Kelas Perkuliahan</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{totalClasses} Kelas</span>
            <span className="text-[10px] text-slate-500">Semester Ganjil 2025/2026</span>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70">
            <span className="text-[11px] font-semibold text-emerald-700 block">Pertemuan Selesai</span>
            <span className="text-xl font-black text-emerald-900 mt-0.5 block">{totalCompletedMeetings} Sesi</span>
            <span className="text-[10px] text-emerald-700 font-medium">Terselenggara sesuai RPS</span>
          </div>
          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200/70">
            <span className="text-[11px] font-semibold text-sky-700 block">Tugas & Evaluasi CPMK</span>
            <span className="text-xl font-black text-sky-900 mt-0.5 block">{totalTasks} Evaluasi</span>
            <span className="text-[10px] text-sky-700 font-medium">Mandiri, Quiz, Capstone</span>
          </div>
          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/70">
            <span className="text-[11px] font-semibold text-indigo-700 block">Total Mahasiswa Terdaftar</span>
            <span className="text-xl font-black text-indigo-900 mt-0.5 block">{totalStudentsEnrolled} Mahasiswa</span>
            <span className="text-[10px] text-indigo-700 font-medium">Sinkron dengan Google Classroom</span>
          </div>
        </div>
      </div>

      {/* Main Content: If a class is selected, show Class Workspace. Otherwise show Course Catalog */}
      {activeKelas ? (
        /* ========================================================================= */
        /* CLASS WORKSPACE (DETAIL KELAS TERPILIH) */
        /* ========================================================================= */
        <div className="space-y-5">
          {/* Back button and Class Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedKelasId(null)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0"
                  title="Kembali ke Daftar Kelas"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                      {activeKelas.kodeMK}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                      {activeKelas.kelas} · {activeKelas.sks} SKS
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      Semester {activeKelas.semester}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {activeKelas.namaMK}
                  </h2>
                  <p className="text-xs text-slate-600 max-w-3xl">
                    {activeKelas.deskripsiMK}
                  </p>
                </div>
              </div>

              {/* Action buttons & Integration Links */}
              <div className="flex flex-wrap items-center gap-2">
                {activeKelas.googleClassroomCode && (
                  <button
                    type="button"
                    onClick={() => handleCopyCode(activeKelas.googleClassroomCode!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    {copiedCode === activeKelas.googleClassroomCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>Class Code: <code className="font-mono text-blue-700">{activeKelas.googleClassroomCode}</code></span>
                  </button>
                )}

                {activeKelas.googleMeetLink && (
                  <a
                    href={activeKelas.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Google Meet</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak A4 (DPNA & Jurnal)</span>
                </button>
              </div>
            </div>

            {/* Lecturer and Meeting Time Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {activeKelas.dosenNama.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{activeKelas.dosenNama}</p>
                  <p className="text-[11px] text-slate-500">NIDN: {activeKelas.dosenNidn} · {activeKelas.dosenEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeKelas.hari}, {activeKelas.jamMulai} - {activeKelas.jamSelesai} WIB</span>
                </span>
                <span className="text-slate-300">·</span>
                <span>{activeKelas.ruanganNama}</span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-slate-700">{activeKelas.pesertaCount} Mahasiswa</span>
              </div>
            </div>
          </div>

          {/* Subtabs Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('pertemuan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pertemuan'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Sesi 16 Pertemuan (RPS)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'pertemuan' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {activeKelas.pertemuanList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tugas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tugas'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Tugas & Evaluasi</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'tugas' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {activeKelas.tugasList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('nilai')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'nilai'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Buku Nilai (DPNA OBE)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'nilai' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {activeKelas.nilaiList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diskusi')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'diskusi'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Forum Diskusi</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'diskusi' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {activeKelas.diskusiList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('peserta')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'peserta'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Presensi Mahasiswa</span>
            </button>
          </div>

          {/* TAB 1: Sesi 16 Pertemuan */}
          {activeTab === 'pertemuan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Agenda Silabus RPS & Pertemuan Mingguan</h3>
                  <p className="text-xs text-slate-500">Standar 16 Sesi Perkuliahan OBE dengan materi perkuliahan, CPMK IABEE, dan presensi.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Sesi Pertemuan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {activeKelas.pertemuanList.map((p) => {
                  const persen = p.totalMahasiswa > 0 ? Math.round((p.kehadiranHadir / p.totalMahasiswa) * 100) : 0;
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                            p.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'Sedang Berlangsung'
                              ? 'bg-blue-100 text-blue-800 animate-pulse'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            P{p.pertemuanKe}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{p.topik}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'Selesai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{p.subTopik}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.tanggal}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {p.metode}
                          </span>
                        </div>
                      </div>

                      {/* CPMK & Target Indicators */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-medium text-slate-700">{p.cpmkTarget}</span>
                        </div>

                        {p.status === 'Selesai' && (
                          <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
                            <span>Presensi: <b>{p.kehadiranHadir}</b> Hadir</span>
                            <span className="text-slate-300">|</span>
                            <span>{persen}% Tingkat Kehadiran</span>
                          </div>
                        )}
                      </div>

                      {/* Materials List */}
                      {p.materiList && p.materiList.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                          {p.materiList.map((m) => (
                            <a
                              key={m.id}
                              href={m.fileUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs transition-colors"
                            >
                              <Paperclip className="w-3 h-3 text-slate-400" />
                              <span className="font-medium">{m.judul}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({m.tipe} · {m.fileSize})</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {p.catatanDosen && (
                        <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-blue-900">
                          <span className="font-bold">Jurnal Pengajaran Dosen: </span>
                          <span>{p.catatanDosen}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Tugas & Evaluasi */}
          {activeTab === 'tugas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Penugasan Mahasiswa, Kuis & Proyek Capstone</h3>
                  <p className="text-xs text-slate-500">Evaluasi terukur sesuai matriks CPMK dan CPL IABEE.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Tugas Baru</span>
                </button>
              </div>

              {activeKelas.tugasList.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-medium text-slate-700">Belum ada tugas atau evaluasi pada kelas ini.</p>
                  <button
                    type="button"
                    onClick={() => setIsNewTaskModalOpen(true)}
                    className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    Buat Tugas Pertama
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {activeKelas.tugasList.map((t) => (
                    <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:border-blue-300 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {t.tipe}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium font-mono">
                              Bobot: {t.bobotPersen}%
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                              {t.cpmk}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{t.judul}</h4>
                          <p className="text-xs text-slate-600">{t.deskripsi}</p>
                        </div>

                        <div className="text-right sm:shrink-0 text-xs">
                          <span className="text-slate-400 block text-[11px]">Batas Waktu Pengumpulan</span>
                          <span className="font-mono font-bold text-red-600 block">{t.deadline}</span>
                        </div>
                      </div>

                      {/* Submissions Section */}
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                          <span>Status Pengumpulan Mahasiswa ({t.pengumpulanList.length} terkumpul)</span>
                          <span className="text-blue-700 font-medium">
                            Rata-rata: {
                              t.pengumpulanList.length > 0
                                ? (t.pengumpulanList.reduce((acc, s) => acc + (s.nilai || 0), 0) / t.pengumpulanList.length).toFixed(1)
                                : '0'
                            } / 100
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {t.pengumpulanList.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-500">{sub.mahasiswaNim}</span>
                                <span className="font-medium text-slate-800">{sub.mahasiswaNama}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({sub.tanggalKumpul})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {sub.feedback && <span className="text-[11px] text-slate-500 italic hidden md:inline">"{sub.feedback}"</span>}
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                                  Nilai: {sub.nilai}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Buku Nilai & DPNA */}
          {activeTab === 'nilai' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Buku Nilai Akhir & Rekap Capaian Mutu (DPNA)</h3>
                  <p className="text-xs text-slate-500">
                    Formula Penilaian: Kehadiran (10%), Tugas (20%), Kuis (10%), Praktikum (15%), UTS (20%), UAS (25%).
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowSkalaNilaiModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors border border-slate-300"
                    title="Lihat standar rentang nilai 80.00-100 (A) sampai <=49.99 (E) UNBARI"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Skala Nilai UNBARI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-2xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak DPNA Resmi (Standar A4)</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-8 text-center">No</th>
                        <th className="p-3 w-28">NIM</th>
                        <th className="p-3">Nama Mahasiswa</th>
                        <th className="p-3 w-16 text-center">Hadir</th>
                        <th className="p-3 w-16 text-center">Tugas</th>
                        <th className="p-3 w-16 text-center">Kuis</th>
                        <th className="p-3 w-16 text-center">Prak</th>
                        <th className="p-3 w-16 text-center">UTS</th>
                        <th className="p-3 w-16 text-center">UAS</th>
                        <th className="p-3 w-20 text-center bg-blue-50/50">Akhir</th>
                        <th className="p-3 w-14 text-center bg-blue-50/50">Huruf</th>
                        <th className="p-3 w-20 text-center">Status</th>
                        <th className="p-3 w-16 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activeKelas.nilaiList.map((m, idx) => (
                        <tr key={m.mahasiswaNim} className="hover:bg-slate-50/80">
                          <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-mono font-medium text-slate-800">{m.mahasiswaNim}</td>
                          <td className="p-3 font-semibold text-slate-900">{m.mahasiswaNama}</td>
                          <td className="p-3 text-center font-mono">{m.kehadiranPersen}%</td>
                          <td className="p-3 text-center font-mono">{m.tugas}</td>
                          <td className="p-3 text-center font-mono">{m.kuis}</td>
                          <td className="p-3 text-center font-mono">{m.praktikum}</td>
                          <td className="p-3 text-center font-mono">{m.uts}</td>
                          <td className="p-3 text-center font-mono">{m.uas}</td>
                          <td className="p-3 text-center font-mono font-bold text-blue-900 bg-blue-50/30">
                            {m.nilaiAkhir.toFixed(1)}
                          </td>
                          <td className="p-3 text-center font-black text-slate-900 bg-blue-50/30">
                            {m.hurufMutu}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.statusKelulusan === 'Lulus'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {m.statusKelulusan}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => setEditingGradeStudent(m)}
                              className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Edit Nilai Komponen"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Forum Diskusi */}
          {activeTab === 'diskusi' && (
            <div className="space-y-5">
              {/* Post New Thread Form */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-700" />
                  <span>Mulai Topik Diskusi / Pengumuman Baru</span>
                </h4>
                <form onSubmit={handleAddDiscussion} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Judul Pengumuman atau Topik Bahasan..."
                      value={newDiscussionTitle}
                      onChange={(e) => setNewDiscussionTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Tuliskan isi pengumuman, panduan materi, atau instruksi diskusi teknis..."
                      rows={3}
                      value={newDiscussionContent}
                      onChange={(e) => setNewDiscussionContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Pengumuman</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Discussion Threads */}
              <div className="space-y-4">
                {activeKelas.diskusiList.map((thread) => (
                  <div key={thread.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {thread.isPinned && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Dipin Dosen
                            </span>
                          )}
                          <span className="font-bold text-sm text-slate-900">{thread.judul}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Diposting oleh <span className="font-medium text-slate-700">{thread.pengirimNama}</span> ({thread.pengirimRole}) · {thread.waktu}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                      {thread.isi}
                    </p>

                    {/* Replies */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 block">
                        Balasan Komentar ({thread.komentarList.length})
                      </span>

                      {thread.komentarList.map((c) => (
                        <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{c.pengirimNama} <span className="text-[10px] text-slate-400 font-normal">({c.pengirimRole})</span></span>
                            <span className="text-[10px] text-slate-400 font-mono">{c.waktu}</span>
                          </div>
                          <p className="text-slate-600">{c.pesan}</p>
                        </div>
                      ))}

                      {/* Reply Box */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Tulis balasan tanggapan..."
                          value={newCommentText[thread.id] || ''}
                          onChange={(e) => setNewCommentText(prev => ({ ...prev, [thread.id]: e.target.value }))}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddComment(thread.id);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(thread.id)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Balas
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Presensi Mahasiswa & Peserta */}
          {activeTab === 'peserta' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Rekapitulasi Kehadiran & Status Mahasiswa</h3>
                  <p className="text-xs text-slate-500">Peringatan otomatis diterbitkan jika kehadiran &lt; 75% (syarat mengikuti Ujian Akhir Semester).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {activeKelas.nilaiList.map((m) => {
                  const isWarning = m.kehadiranPersen < 75;
                  return (
                    <div
                      key={m.mahasiswaNim}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isWarning
                          ? 'bg-amber-50/50 border-amber-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{m.mahasiswaNama}</p>
                          <p className="text-[11px] font-mono text-slate-500">NIM: {m.mahasiswaNim} · Angkatan {m.angkatan}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isWarning ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.kehadiranPersen}% Hadir
                        </span>
                      </div>

                      {isWarning && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-800 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Peringatan Presensi: Terancam gugur UAS</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* COURSE CATALOG & CLASS LIST VIEW */
        /* ========================================================================= */
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari kode MK, nama mata kuliah, atau dosen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Semester:</span>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-none"
              >
                <option value="all">Semua Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
          </div>

          {/* Classes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKelas.map((k) => {
              const progressPersen = Math.round((k.pertemuanSelesaiCount / k.totalPertemuanTarget) * 100);
              return (
                <div
                  key={k.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                          {k.kodeMK}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          {k.kelas}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                        {k.sks} SKS
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {k.namaMK}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {k.deskripsiMK}
                      </p>
                    </div>

                    {/* Lecturer Info */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                      <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{k.dosenNama}</span>
                    </div>

                    {/* Schedule & Room */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{k.hari}, {k.jamMulai}-{k.jamSelesai} WIB ({k.ruanganNama})</span>
                    </div>

                    {/* Progress RPS Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-medium text-slate-500">
                        <span>Progress Perkuliahan (RPS)</span>
                        <span className="font-mono font-bold text-slate-700">{k.pertemuanSelesaiCount} / {k.totalPertemuanTarget} Sesi</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progressPersen}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{k.pesertaCount} Mhs</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>{k.tugasList.length} Tugas</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKelasId(k.id);
                        setActiveTab('pertemuan');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Buka Kelas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Buka Kelas Perkuliahan Baru */}
      {/* ========================================================================= */}
      {isNewClassModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Buka Kelas Perkuliahan Baru</h3>
              <button
                type="button"
                onClick={() => setIsNewClassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode MK *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: TS-302"
                    value={newKodeMK}
                    onChange={(e) => setNewKodeMK(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kelas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Kelas A / B"
                    value={newKelas}
                    onChange={(e) => setNewKelas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Mata Kuliah *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dinamika Struktur & Rekayasa Gempa"
                  value={newNamaMK}
                  onChange={(e) => setNewNamaMK(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bobot SKS</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newSks}
                    onChange={(e) => setNewSks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dosen Pengampu *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap & Gelar Dosen"
                  value={newDosenNama}
                  onChange={(e) => setNewDosenNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hari</label>
                  <select
                    value={newHari}
                    onChange={(e) => setNewHari(e.target.value as any)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mulai</label>
                  <input
                    type="text"
                    value={newJamMulai}
                    onChange={(e) => setNewJamMulai(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Selesai</label>
                  <input
                    type="text"
                    value={newJamSelesai}
                    onChange={(e) => setNewJamSelesai(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs text-center"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ruangan</label>
                <input
                  type="text"
                  value={newRuangan}
                  onChange={(e) => setNewRuangan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewClassModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Buat Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Tambah Sesi Pertemuan */}
      {/* ========================================================================= */}
      {isNewMeetingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tambah Sesi Pertemuan RPS</h3>
              <button
                type="button"
                onClick={() => setIsNewMeetingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMeeting} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pertemuan Ke</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={newPertemuanKe}
                    onChange={(e) => setNewPertemuanKe(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={newPertemuanTanggal}
                    onChange={(e) => setNewPertemuanTanggal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Topik Utama Bahasan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Analisis Beban Angin & Gempa Gedung Bertingkat"
                  value={newPertemuanTopik}
                  onChange={(e) => setNewPertemuanTopik(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sub-Pokok Bahasan</label>
                <textarea
                  placeholder="Rincian sub-topik materi ajar..."
                  rows={2}
                  value={newPertemuanSubtopik}
                  onChange={(e) => setNewPertemuanSubtopik(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target CPMK (OBE)</label>
                  <input
                    type="text"
                    value={newPertemuanCpmk}
                    onChange={(e) => setNewPertemuanCpmk(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Metode Sesi</label>
                  <select
                    value={newPertemuanMetode}
                    onChange={(e) => setNewPertemuanMetode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Tatap Muka">Tatap Muka</option>
                    <option value="Daring (Google Meet)">Daring (Google Meet)</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Praktikum Lab">Praktikum Lab</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Buat Tugas Baru */}
      {/* ========================================================================= */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Buat Tugas / Evaluasi Baru</h3>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Tugas / Evaluasi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tugas Perancangan Balok Tulangan Rangkap"
                  value={newTaskJudul}
                  onChange={(e) => setNewTaskJudul(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipe Evaluasi</label>
                  <select
                    value={newTaskTipe}
                    onChange={(e) => setNewTaskTipe(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Tugas Mandiri">Tugas Mandiri</option>
                    <option value="Tugas Kelompok">Tugas Kelompok</option>
                    <option value="Quiz Online">Quiz Online</option>
                    <option value="Praktikum Lab">Praktikum Lab</option>
                    <option value="Proyek Rekayasa / Capstone">Proyek Rekayasa / Capstone</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bobot Penilaian (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newTaskBobot}
                    onChange={(e) => setNewTaskBobot(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target CPMK</label>
                  <input
                    type="text"
                    value={newTaskCpmk}
                    onChange={(e) => setNewTaskCpmk(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Batas Waktu (Deadline)</label>
                  <input
                    type="text"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Petunjuk Pengerjaan</label>
                <textarea
                  rows={3}
                  placeholder="Instruksi pengerjaan format file laporan tugas..."
                  value={newTaskDeskripsi}
                  onChange={(e) => setNewTaskDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Terbitkan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Edit Nilai Mahasiswa */}
      {/* ========================================================================= */}
      {editingGradeStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Input / Edit Nilai Komponen</h3>
                <p className="text-xs text-slate-500">{editingGradeStudent.mahasiswaNama} ({editingGradeStudent.mahasiswaNim})</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingGradeStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tugas (20%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={editingGradeStudent.tugas}
                    onChange={(e) => setEditingGradeStudent({ ...editingGradeStudent, tugas: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kuis (10%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={editingGradeStudent.kuis}
                    onChange={(e) => setEditingGradeStudent({ ...editingGradeStudent, kuis: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Praktikum (15%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={editingGradeStudent.praktikum}
                    onChange={(e) => setEditingGradeStudent({ ...editingGradeStudent, praktikum: Number(e.target.value) })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">UTS (25%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={editingGradeStudent.uts}
                    onChange={(e) => setEditingGradeStudent({ ...editingGradeStudent, uts: Number(e.target.value) })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">UAS (30%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={editingGradeStudent.uas}
                    onChange={(e) => setEditingGradeStudent({ ...editingGradeStudent, uas: Number(e.target.value) })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 font-mono font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Presensi Kehadiran (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editingGradeStudent.kehadiranPersen}
                  onChange={(e) => setEditingGradeStudent({ ...editingGradeStudent, kehadiranPersen: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              {/* Live Grade Preview based on UNBARI Scale */}
              {(() => {
                const liveFinalScore = Number((
                  editingGradeStudent.tugas * 0.2 +
                  editingGradeStudent.kuis * 0.1 +
                  editingGradeStudent.praktikum * 0.15 +
                  editingGradeStudent.uts * 0.25 +
                  editingGradeStudent.uas * 0.3
                ).toFixed(1));
                const liveSkala = hitungSkalaNilai(liveFinalScore);
                return (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold text-xs">Simulasi Nilai Akhir:</span>
                      <span className="font-mono font-black text-blue-950 text-base">{liveFinalScore.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Skala Mutu UNBARI:</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="px-2 py-0.5 rounded bg-blue-700 text-white font-black text-xs">
                          {liveSkala.huruf}
                        </span>
                        <span className="text-slate-700 text-[11px]">
                          (Bobot {liveSkala.bobot.toFixed(2)})
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          liveSkala.statusKelulusan === 'Lulus'
                            ? 'bg-emerald-100 text-emerald-800'
                            : liveSkala.statusKelulusan === 'Lulus Bersyarat'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {liveSkala.statusKelulusan}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGradeStudent(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Kalkulasi & Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Pedoman Resmi Skala Nilai Huruf Mutu & Bobot UNBARI */}
      {/* ========================================================================= */}
      {showSkalaNilaiModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                  <Award className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Standar Skala Penilaian Akademik UNBARI
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fakultas Teknik Universitas Batanghari (SK Dekan & Pedoman Akademik)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSkalaNilaiModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-36">Rentang Nilai Angka</th>
                    <th className="p-2.5 text-center w-24">Huruf Mutu</th>
                    <th className="p-2.5 text-center w-24">Bobot (SKS)</th>
                    <th className="p-2.5">Predikat Capaian</th>
                    <th className="p-2.5 text-center w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SKALA_NILAI_UNBARI.map((item) => (
                    <tr 
                      key={item.huruf} 
                      className={`hover:bg-slate-50 ${
                        item.huruf === 'A' ? 'bg-emerald-50/30' : item.huruf === 'E' ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="p-2.5 text-center font-mono font-bold text-slate-800">
                        {formatRentangNilai(item)}
                      </td>
                      <td className="p-2.5 text-center font-black text-blue-900 text-sm">
                        {item.huruf}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                        {item.bobot.toFixed(2)}
                      </td>
                      <td className="p-2.5 font-medium text-slate-800">
                        {item.predikat}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.statusKelulusan === 'Lulus'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.statusKelulusan === 'Lulus Bersyarat'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {item.statusKelulusan}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Ketentuan Evaluasi & Kelulusan:</p>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                <li>Mahasiswa berhak lulus mata kuliah apabila memperoleh nilai minimal <strong>C (60,00 - 64,99 / Bobot 2.00)</strong>.</li>
                <li>Nilai <strong>C- (57,50 - 59,99)</strong> dan <strong>D+ (55,00 - 57,49)</strong> merupakan kategori lulus bersyarat dengan rekomendasi remedial.</li>
                <li>Nilai <strong>D</strong> dan <strong>E (&lt;= 49,99)</strong> dinyatakan tidak lulus dan wajib mengulang mata kuliah bersangkutan pada semester berikutnya.</li>
              </ul>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSkalaNilaiModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Tutup Pedoman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: E-Learning Terintegrasi (Upload Materi / Kuis / Tugas Terpusat) */}
      {/* ========================================================================= */}
      {isQuickUploadOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  E-Learning Terintegrasi — Publikasi Materi, Kuis &amp; Tugas
                </h3>
                <p className="text-xs text-slate-500">
                  Unggah langsung bahan ajar, kuis daring, atau tugas mahasiswa ke kelas LMS aktif.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickUploadOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Kelas Perkuliahan *</label>
                <select
                  value={uploadKelasId}
                  onChange={e => setUploadKelasId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  {currentProdiKelas.map(k => (
                    <option key={k.id} value={k.id}>
                      {k.kodeMK} — {k.namaMK} ({k.kelas} · {k.dosenNama})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Konten</label>
                  <select
                    value={uploadJenis}
                    onChange={e => setUploadJenis(e.target.value as 'materi' | 'kuis' | 'tugas')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="materi">Materi Perkuliahan</option>
                    <option value="kuis">Kuis Interaktif</option>
                    <option value="tugas">Tugas Mahasiswa</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pertemuan Ke-</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={uploadPertemuanKe}
                    onChange={e => setUploadPertemuanKe(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Konten *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    uploadJenis === 'materi'
                      ? 'cth: Modul 5 Analisis Struktur Rangka Batang'
                      : uploadJenis === 'kuis'
                      ? 'cth: Kuis Evaluasi CPMK-2 (15 Soal Pilihan Ganda)'
                      : 'cth: Tugas Studi Kasus Lapangan & Laporan PDF'
                  }
                  value={uploadJudul}
                  onChange={e => setUploadJudul(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {uploadJenis === 'materi' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Format Berkas</label>
                    <select
                      value={uploadTipeFile}
                      onChange={e => setUploadTipeFile(e.target.value as 'PDF' | 'PPTX' | 'Video' | 'Link')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="PDF">Dokumen PDF</option>
                      <option value="PPTX">Slide Presentasi (PPTX)</option>
                      <option value="Video">Rekaman Video</option>
                      <option value="Link">Tautan Eksternal</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pilih File Lokal</label>
                    <input
                      type="file"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setUploadFileMeta({
                            name: f.name,
                            size: `${Math.max(10, Math.round(f.size / 1024))} KB`
                          });
                          if (!uploadJudul) setUploadJudul(f.name);
                        }
                      }}
                      className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-800 file:font-bold"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Bobot Nilai (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={uploadBobot}
                      onChange={e => setUploadBobot(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Batas Pengumpulan</label>
                    <input
                      type="text"
                      value={uploadDeadline}
                      onChange={e => setUploadDeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Instruksi / Ringkasan</label>
                <textarea
                  rows={2}
                  value={uploadCatatan}
                  onChange={e => setUploadCatatan(e.target.value)}
                  placeholder="Catatan tambahan atau tautan referensi perkuliahan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickUploadOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publikasikan ke LMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Ekspor Laporan Kepatuhan LMS (Audit Mutu Internal / AMI PDF) */}
      {/* ========================================================================= */}
      {isCompliancePdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-emerald-300 uppercase">
                  Dokumen Bukti Pendukung Audit Mutu Internal (AMI) FT UNBARI
                </div>
                <h3 className="text-base font-bold mt-0.5">
                  Ekspor Laporan Kepatuhan LMS — {selectedProdi.nama}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCompliancePdfModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100">
              <div
                ref={compliancePrintRef}
                className="bg-white p-8 shadow-sm border border-slate-200 mx-auto max-w-[210mm] text-slate-900 font-serif"
              >
                <StandardKopSurat
                  prodiName={`PROGRAM STUDI ${selectedProdi.nama.toUpperCase()} (${selectedProdi.jenjang})`}
                  subTitle="REKAPITULASI KEPATUHAN PEMBELAJARAN LMS — BUKTI PENDUKUNG AUDIT MUTU INTERNAL (AMI)"
                  showQrCode={true}
                  qrCodeUrl={`https://ft.unbari.ac.id/verify/LMS-AMI-${selectedProdi.id}-${new Date().toISOString().slice(0, 10)}`}
                  qrBadgeText="AMI LMS"
                />

                <div className="text-center mb-5">
                  <h4 className="text-sm font-bold uppercase tracking-wide underline">
                    LAPORAN KEPATUHAN PENGISIAN MATERI, KUIS &amp; TUGAS LMS PER MATA KULIAH
                  </h4>
                  <p className="text-xs font-sans text-slate-700 mt-1">
                    Tahun Akademik 2025/2026 Ganjil · Total Kelas Diaudit: <b>{lmsComplianceRows.length} Mata Kuliah</b>
                  </p>
                </div>

                <table className="w-full border-collapse border border-slate-800 text-[11px] font-sans mb-6">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-800 px-2 py-2 text-center w-8">No</th>
                      <th className="border border-slate-800 px-2 py-2 text-left">Kode &amp; Mata Kuliah</th>
                      <th className="border border-slate-800 px-2 py-2 text-left">Dosen Pengampu</th>
                      <th className="border border-slate-800 px-2 py-2 text-center">Sesi RPS</th>
                      <th className="border border-slate-800 px-2 py-2 text-center">Materi</th>
                      <th className="border border-slate-800 px-2 py-2 text-center">Kuis</th>
                      <th className="border border-slate-800 px-2 py-2 text-center">Tugas</th>
                      <th className="border border-slate-800 px-2 py-2 text-right">Skor AMI</th>
                      <th className="border border-slate-800 px-2 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lmsComplianceRows.map(row => (
                      <tr key={row.id}>
                        <td className="border border-slate-800 px-2 py-1.5 text-center">{row.no}</td>
                        <td className="border border-slate-800 px-2 py-1.5">
                          <div className="font-bold">{row.kodeMK} ({row.kelas})</div>
                          <div>{row.namaMK}</div>
                        </td>
                        <td className="border border-slate-800 px-2 py-1.5">{row.dosenNama}</td>
                        <td className="border border-slate-800 px-2 py-1.5 text-center font-mono">
                          {row.pertemuanSelesai}/{row.totalTarget}
                        </td>
                        <td className="border border-slate-800 px-2 py-1.5 text-center font-mono font-bold">
                          {row.jumlahMateri} File
                        </td>
                        <td className="border border-slate-800 px-2 py-1.5 text-center font-mono font-bold">
                          {row.jumlahKuis}
                        </td>
                        <td className="border border-slate-800 px-2 py-1.5 text-center font-mono font-bold">
                          {row.jumlahTugas}
                        </td>
                        <td className="border border-slate-800 px-2 py-1.5 text-right font-mono font-bold">
                          {row.skorKepatuhan}%
                        </td>
                        <td className="border border-slate-800 px-2 py-1.5 text-center font-bold">
                          {row.statusAmi}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="grid grid-cols-2 gap-6 text-xs font-sans pt-3">
                  <div>
                    <p className="font-bold">Ringkasan Evaluasi Audit Mutu Internal (AMI):</p>
                    <p className="text-[11px] text-slate-700 mt-1">
                      Jumlah MK Patuh Standar (&ge;75%):{' '}
                      <b>{lmsComplianceRows.filter(r => r.skorKepatuhan >= 75).length} dari {lmsComplianceRows.length} MK</b>.
                      Total Materi Terunggah: <b>{lmsComplianceRows.reduce((s, r) => s + r.jumlahMateri, 0)} dokumen</b>,
                      Kuis: <b>{lmsComplianceRows.reduce((s, r) => s + r.jumlahKuis, 0)}</b>,
                      Tugas: <b>{lmsComplianceRows.reduce((s, r) => s + r.jumlahTugas, 0)}</b>.
                    </p>
                  </div>
                  <div className="text-right">
                    <p>Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold mt-1">Ketua Program Studi {selectedProdi.singkatan}</p>
                    <div className="h-14" />
                    <p className="font-bold underline">{selectedProdi.kaprodi}</p>
                    <p className="text-[11px] font-mono">NIDN/NUPTK: {selectedProdi.nipKaprodi}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCompliancePdfModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  logKaprodiActivity({
                    category: 'EXPORT_DOKUMEN',
                    actionTitle: `Ekspor Laporan Kepatuhan LMS (${selectedProdi.singkatan})`,
                    detail: `Mengunduh rekapitulasi PDF kepatuhan materi, kuis & tugas ${lmsComplianceRows.length} mata kuliah untuk bukti AMI.`,
                    actor: `Kaprodi ${selectedProdi.singkatan}`,
                    prodiId: selectedProdi.id
                  });
                  printDocumentElement(compliancePrintRef.current, {
                    documentTitle: `Laporan_Kepatuhan_LMS_AMI_${selectedProdi.singkatan}`
                  });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Unduh / Cetak PDF Kepatuhan LMS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Cetak Dokumen A4 Resmi (DPNA / Jurnal) */}
      {/* ========================================================================= */}
      {isPrintModalOpen && activeKelas && (
        <LmsPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          kelas={activeKelas}
          selectedProdi={selectedProdi}
        />
      )}
    </div>
  );
};
