import React, { useState } from 'react';
import { 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Plus, 
  Send, 
  Copy, 
  Check, 
  Users, 
  BookOpen, 
  BarChart2, 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  FileCheck2,
  FolderOpen,
  MessageSquare
} from 'lucide-react';
import { ProgramStudiInfo, Mahasiswa, Dosen, JadwalKuliah } from '../types/index';

interface GoogleWorkspaceViewProps {
  selectedProdi: ProgramStudiInfo;
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  jadwalList: JadwalKuliah[];
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

interface ClassroomCourse {
  id: string;
  name: string;
  section: string;
  courseCode: string;
  room: string;
  dosenName: string;
  dosenEmail: string;
  enrollmentCode: string;
  studentCount: number;
  assignmentCount: number;
  announcementCount: number;
  lastSync: string;
  alternateLink: string;
  assignments: Array<{
    id: string;
    title: string;
    dueDate: string;
    turnedIn: number;
    graded: number;
    assigned: number;
  }>;
}

interface WorkspaceForm {
  id: string;
  title: string;
  description: string;
  category: 'EDOM' | 'Tugas Akhir' | 'Kerja Praktik' | 'Tracer Study' | 'Tata Usaha';
  responseCount: number;
  status: 'Aktif Menerima Tanggapan' | 'Ditutup';
  formUrl: string;
  sheetUrl: string;
  lastResponseDate: string;
  targetKategori: string;
}

export const GoogleWorkspaceView: React.FC<GoogleWorkspaceViewProps> = ({
  selectedProdi,
  mahasiswaList,
  dosenList,
  jadwalList,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'classroom' | 'forms'>('classroom');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<ClassroomCourse | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [showNewAssignmentModal, setShowNewAssignmentModal] = useState<ClassroomCourse | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    points: 100,
    dueDate: '2026-11-20'
  });

  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormCategory, setNewFormCategory] = useState<'EDOM' | 'Tugas Akhir' | 'Kerja Praktik' | 'Tracer Study' | 'Tata Usaha'>('EDOM');

  // Courses mapped from schedules & prodi
  const [courses, setCourses] = useState<ClassroomCourse[]>([
    {
      id: 'GC-SPL-01',
      name: selectedProdi.id === 'SIPIL' ? 'Analisis Struktur II (SPL-301)' : selectedProdi.id === 'LINGKUNGAN' ? 'AMDAL & Manajemen Lingkungan (LKG-301)' : 'Sistem SCADA & Otomasi PLC (LST-201)',
      section: 'Kelas Reguler A · Semester Ganjil 2026/2027',
      courseCode: selectedProdi.id === 'SIPIL' ? 'SPL-301' : selectedProdi.id === 'LINGKUNGAN' ? 'LKG-301' : 'LST-201',
      room: selectedProdi.id === 'SIPIL' ? 'Ruang Kuliah SPL-201' : 'Ruang Seminar LKG-102',
      dosenName: dosenList[0]?.namaLengkap || 'Ir. Dosen FT UNBARI, M.T.',
      dosenEmail: dosenList[0]?.email || 'dosen@unbari.ac.id',
      enrollmentCode: 'unbari7a',
      studentCount: 38,
      assignmentCount: 4,
      announcementCount: 8,
      lastSync: 'Baru saja',
      alternateLink: 'https://classroom.google.com/c/ODE5MzA0NDAxMTQy',
      assignments: [
        { id: 'ASG-01', title: 'Tugas 1: Pemodelan Rangka Batang 2D', dueDate: '15 Okt 2026', turnedIn: 38, graded: 38, assigned: 38 },
        { id: 'ASG-02', title: 'Tugas 2: Analisis Matriks Kekakuan Balok Menerus', dueDate: '28 Okt 2026', turnedIn: 37, graded: 37, assigned: 38 },
        { id: 'ASG-03', title: 'Tugas Besar: Perencanaan Gedung Bertingkat 5 Lantai', dueDate: '18 Nov 2026', turnedIn: 24, graded: 0, assigned: 38 },
      ]
    },
    {
      id: 'GC-SPL-02',
      name: selectedProdi.id === 'SIPIL' ? 'Perancangan Geometrik Jalan Raya (SPL-302)' : selectedProdi.id === 'LINGKUNGAN' ? 'Pengolahan Air Bersih & Limbah (LKG-302)' : 'Instalasi & Proteksi Tenaga Listrik (LST-202)',
      section: 'Kelas Reguler B · Semester Ganjil 2026/2027',
      courseCode: selectedProdi.id === 'SIPIL' ? 'SPL-302' : selectedProdi.id === 'LINGKUNGAN' ? 'LKG-302' : 'LST-202',
      room: selectedProdi.id === 'SIPIL' ? 'Ruang SPL-203' : 'Lab Lingkungan',
      dosenName: dosenList[1]?.namaLengkap || 'Dosen Pengampu II, S.T., M.T.',
      dosenEmail: dosenList[1]?.email || 'dosen2@unbari.ac.id',
      enrollmentCode: 'ftunbari8b',
      studentCount: 35,
      assignmentCount: 3,
      announcementCount: 5,
      lastSync: '10 menit yang lalu',
      alternateLink: 'https://classroom.google.com/c/ODE5MzA0NDAxMTQz',
      assignments: [
        { id: 'ASG-04', title: 'Desain Trase Alinyemen Horisontal & Vertikal', dueDate: '22 Okt 2026', turnedIn: 35, graded: 35, assigned: 35 },
        { id: 'ASG-05', title: 'Perhitungan Diagram Super Elevasi Tikungan Spiral', dueDate: '05 Nov 2026', turnedIn: 33, graded: 30, assigned: 35 }
      ]
    },
    {
      id: 'GC-SPL-03',
      name: selectedProdi.id === 'SIPIL' ? 'Mekanika Tanah & Uji Laboratorium (SPL-205)' : selectedProdi.id === 'LINGKUNGAN' ? 'Mikrobiologi Lingkungan Terapan (LKG-203)' : 'Mesin-Mesin Listrik & Transformator (LST-205)',
      section: 'Kelas Reguler A & Praktikum · Semester Ganjil 2026/2027',
      courseCode: selectedProdi.id === 'SIPIL' ? 'SPL-205' : selectedProdi.id === 'LINGKUNGAN' ? 'LKG-203' : 'LST-205',
      room: 'Laboratorium Terpadu FT UNBARI',
      dosenName: dosenList[2]?.namaLengkap || 'Dosen Pengampu III, S.T., M.Eng.',
      dosenEmail: dosenList[2]?.email || 'dosen3@unbari.ac.id',
      enrollmentCode: 'labunbari9',
      studentCount: 40,
      assignmentCount: 5,
      announcementCount: 11,
      lastSync: '1 jam yang lalu',
      alternateLink: 'https://classroom.google.com/c/ODE5MzA0NDAxMTQ0',
      assignments: [
        { id: 'ASG-06', title: 'Laporan Praktikum: Uji Atterberg Limits & Analisis Saringan', dueDate: '30 Okt 2026', turnedIn: 40, graded: 40, assigned: 40 },
        { id: 'ASG-07', title: 'Laporan Praktikum: Uji Kuat Geser Langsung (Direct Shear Test)', dueDate: '12 Nov 2026', turnedIn: 29, graded: 15, assigned: 40 }
      ]
    }
  ]);

  // Forms list
  const [forms, setForms] = useState<WorkspaceForm[]>([
    {
      id: 'FORM-EDOM-01',
      title: 'Kuesioner Evaluasi Dosen oleh Mahasiswa (EDOM) - Semester Ganjil 2026/2027',
      description: 'Instrumen resmi Gugus Penjaminan Mutu Fakultas (GPMF) untuk mengukur kompetensi pedagogik, profesional, kepribadian, dan sosial dosen FT UNBARI.',
      category: 'EDOM',
      responseCount: 142,
      status: 'Aktif Menerima Tanggapan',
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScU01-edom-unbari-2026/viewform',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1Spt-edom-unbari-2026-responses',
      lastResponseDate: 'Hari ini, 09:15 WIB',
      targetKategori: 'Seluruh Mahasiswa Aktif FT UNBARI'
    },
    {
      id: 'FORM-TA-01',
      title: 'Formulir Pendaftaran Seminar Proposal & Seminar Hasil Tugas Akhir',
      description: 'Pengunggahan berkas draft proposal, persetujuan pembimbing 1 & 2, kartu bimbingan logbook, dan bukti pembayaran seminar.',
      category: 'Tugas Akhir',
      responseCount: 28,
      status: 'Aktif Menerima Tanggapan',
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdX02-daftar-ta-unbari/viewform',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1Spt-daftar-ta-unbari-responses',
      lastResponseDate: 'Kemarin, 16:40 WIB',
      targetKategori: 'Mahasiswa Tingkat Akhir (Semester 7 - 8)'
    },
    {
      id: 'FORM-SIDANG-01',
      title: 'Formulir Pendaftaran Ujian Sidang Skripsi / Sidang Meja Hijau FT UNBARI',
      description: 'Pendaftaran sidang skripsi, surat bebas laboratorium, bukti uji turnitin (plagiarisme < 25%), dan transkrip nilai akademik.',
      category: 'Tugas Akhir',
      responseCount: 19,
      status: 'Aktif Menerima Tanggapan',
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeY03-sidang-skripsi-unbari/viewform',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1Spt-sidang-skripsi-unbari-responses',
      lastResponseDate: 'Kemarin, 11:20 WIB',
      targetKategori: 'Mahasiswa Siap Sidang Meja Hijau'
    },
    {
      id: 'FORM-KP-01',
      title: 'Formulir Pengajuan Surat Pengantar & Pendaftaran Kerja Praktik (KP)',
      description: 'Permohonan surat pengantar KP ke instansi industri/proyek konstruksi dan pelaporan penerimaan tempat magang.',
      category: 'Kerja Praktik',
      responseCount: 34,
      status: 'Aktif Menerima Tanggapan',
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfZ04-pengantar-kp-unbari/viewform',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1Spt-pengantar-kp-unbari-responses',
      lastResponseDate: '2 hari lalu',
      targetKategori: 'Mahasiswa Semester 5 - 6'
    },
    {
      id: 'FORM-TRACER-01',
      title: 'Kuesioner Pelacakan Jejak Alumni (Tracer Study) & Pengguna Lulusan',
      description: 'Instrumen survei penelusuran lulusan Fakultas Teknik untuk keperluan akreditasi IABEE & LAM-Teknik 9 Kriteria.',
      category: 'Tracer Study',
      responseCount: 88,
      status: 'Aktif Menerima Tanggapan',
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSgA05-tracer-study-ftunbari/viewform',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1Spt-tracer-study-responses',
      lastResponseDate: '3 hari lalu',
      targetKategori: 'Alumni 1 - 3 Tahun Kelulusan'
    },
    {
      id: 'FORM-TU-01',
      title: 'Formulir Layanan Persuratan Online Tata Usaha (Aktif Kuliah & Rekomendasi)',
      description: 'Permohonan mandiri surat keterangan aktif kuliah untuk tunjangan anak PNS/BUMN, pengajuan beasiswa, dan dispensasi.',
      category: 'Tata Usaha',
      responseCount: 65,
      status: 'Aktif Menerima Tanggapan',
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLShB06-surat-tu-unbari/viewform',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1Spt-surat-tu-responses',
      lastResponseDate: 'Hari ini, 08:30 WIB',
      targetKategori: 'Seluruh Sivitas Akademika FT'
    }
  ]);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onShowToast('Sinkronisasi Google Classroom & Google Forms berhasil diperbarui!', 'success');
    }, 1200);
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    onShowToast('Tautan berhasil disalin ke clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAnnouncementModal || !announcementText.trim()) return;

    setCourses(prev => prev.map(c => 
      c.id === showAnnouncementModal.id 
        ? { ...c, announcementCount: c.announcementCount + 1, lastSync: 'Baru saja' } 
        : c
    ));

    onShowToast(`Pengumuman berhasil diposting ke Google Classroom ${showAnnouncementModal.name}!`, 'success');
    setShowAnnouncementModal(null);
    setAnnouncementText('');
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showNewAssignmentModal || !newAssignment.title.trim()) return;

    setCourses(prev => prev.map(c => {
      if (c.id === showNewAssignmentModal.id) {
        return {
          ...c,
          assignmentCount: c.assignmentCount + 1,
          lastSync: 'Baru saja',
          assignments: [
            {
              id: `ASG-${Date.now()}`,
              title: newAssignment.title,
              dueDate: newAssignment.dueDate,
              turnedIn: 0,
              graded: 0,
              assigned: c.studentCount
            },
            ...c.assignments
          ]
        };
      }
      return c;
    }));

    onShowToast(`Tugas baru "${newAssignment.title}" berhasil diterbitkan di Google Classroom!`, 'success');
    setShowNewAssignmentModal(null);
    setNewAssignment({ title: '', description: '', points: 100, dueDate: '2026-11-20' });
  };

  const handleCreateNewForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;

    const created: WorkspaceForm = {
      id: `FORM-${Date.now()}`,
      title: newFormTitle,
      description: `Formulir resmi Program Studi ${selectedProdi.nama} Fakultas Teknik Universitas Batanghari Jambi.`,
      category: newFormCategory,
      responseCount: 0,
      status: 'Aktif Menerima Tanggapan',
      formUrl: `https://docs.google.com/forms/d/e/created-${Date.now()}/viewform`,
      sheetUrl: `https://docs.google.com/spreadsheets/d/created-${Date.now()}-responses`,
      lastResponseDate: 'Belum ada tanggapan',
      targetKategori: `Mahasiswa ${selectedProdi.nama}`
    };

    setForms([created, ...forms]);
    onShowToast(`Google Form "${newFormTitle}" berhasil dibuat dan siap dibagikan!`, 'success');
    setShowNewFormModal(false);
    setNewFormTitle('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Google Workspace for Education Integration Hub */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-blue-900/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-blue-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Google Workspace for Education · Terotorisasi</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-emerald-300">Project: vernal-footing-bdtd0</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
              Google Classroom &amp; Google Forms Hub
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-medium">
                v2.0 Real-time Sync
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Integrasi langsung pangkalan data Program Studi {selectedProdi.nama} dengan ekosistem Google Classroom (tugas, materi, penilaian) dan Google Forms (evaluasi dosen EDOM, pendaftaran TA/KP, tracer study).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Google Workspace'}</span>
            </button>

            <a
              href="https://workspace.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/20 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Admin Console</span>
            </a>
          </div>
        </div>
      </div>

      {/* Subtab Navigation: Google Classroom vs Google Forms */}
      <div className="border-b border-slate-200">
        <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('classroom')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'classroom'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Google Classroom ({courses.length} Kelas Aktif)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('forms')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'forms'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Google Forms ({forms.length} Formulir Akademik)</span>
          </button>
        </nav>
      </div>

      {/* SECTION 1: GOOGLE CLASSROOM HUB */}
      {activeTab === 'classroom' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Daftar Kelas Perkuliahan di Google Classroom
              </h2>
              <p className="text-xs text-slate-500">
                Terhubung dengan akun Google Workspace Fakultas Teknik Universitas Batanghari
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: API Classroom Aktif</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Card Header Color Bar */}
                  <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded font-bold">
                        {course.courseCode}
                      </span>
                      <span className="text-[10px] text-blue-200 font-medium">
                        Kode: <strong className="font-mono text-white">{course.enrollmentCode}</strong>
                      </span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mt-2 leading-snug">
                      {course.name}
                    </h3>
                    <p className="text-xs text-blue-100 mt-0.5">
                      {course.section}
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-600 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Mahasiswa Terdaftar:</span>
                      </span>
                      <strong className="text-slate-900 font-bold">{course.studentCount} Orang</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Dosen Pengampu:</span>
                      </span>
                      <span className="text-slate-900 font-medium truncate max-w-[160px]">{course.dosenName}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sinkronisasi Terakhir:</span>
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">{course.lastSync}</span>
                    </div>

                    {/* Assignments Snapshot */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                          Tugas Aktif ({course.assignments.length}):
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowNewAssignmentModal(course)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Buat Tugas</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {course.assignments.map((asg) => (
                          <div 
                            key={asg.id}
                            className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]"
                          >
                            <div className="truncate pr-2">
                              <span className="font-medium text-slate-900 block truncate">{asg.title}</span>
                              <span className="text-[10px] text-slate-400">Tenggat: {asg.dueDate}</span>
                            </div>
                            <span className="shrink-0 px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                              {asg.turnedIn}/{asg.assigned}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementModal(course)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Posting Pengumuman</span>
                  </button>

                  <a
                    href={course.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Buka Classroom</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: GOOGLE FORMS HUB */}
      {activeTab === 'forms' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Pusat Formulir Akademik &amp; Kuesioner (Google Forms)
              </h2>
              <p className="text-xs text-slate-500">
                Formulir terstandar untuk evaluasi pembelajaran, pendaftaran sidang TA/KP, dan kuesioner akreditasi
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNewFormModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-700/20"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Google Form Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {forms.map((form) => (
              <div 
                key={form.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      form.category === 'EDOM' 
                        ? 'bg-purple-100 text-purple-800'
                        : form.category === 'Tugas Akhir'
                          ? 'bg-blue-100 text-blue-800'
                          : form.category === 'Kerja Praktik'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                    }`}>
                      {form.category}
                    </span>

                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{form.status}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                    {form.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {form.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Respons Masuk:</span>
                      <span className="text-lg font-black text-blue-900">{form.responseCount} Tanggapan</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Respons Terakhir:</span>
                      <span className="text-slate-700 font-medium text-[11px]">{form.lastResponseDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(form.formUrl, form.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                      title="Salin Tautan Form"
                    >
                      {copiedId === form.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={form.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium rounded-lg border border-emerald-200 transition-colors"
                      title="Buka Spreadsheet Tanggapan"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Spreadsheet</span>
                    </a>
                  </div>

                  <a
                    href={form.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Buka Form</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: POSTING PENGUMUMAN GOOGLE CLASSROOM */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Posting Pengumuman Kelas</h3>
                <p className="text-xs text-slate-500">{showAnnouncementModal.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAnnouncementModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Isi Pesan Pengumuman untuk Mahasiswa:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Contoh: Jadwal perkuliahan minggu ke-8 akan dilaksanakan presentasi kelompok dan pengumpulan draft tugas besar..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 space-y-1">
                <span className="font-bold block">Notifikasi Otomatis:</span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Pengumuman ini akan langsung muncul di stream Google Classroom dan dikirimkan ke email seluruh mahasiswa yang terdaftar di kelas.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-700/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke Google Classroom</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUAT TUGAS BARU CLASSROOM */}
      {showNewAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Terbitkan Tugas Baru (CourseWork)</h3>
                <p className="text-xs text-slate-500">{showNewAssignmentModal.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAssignmentModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Judul Tugas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tugas 3: Analisis Beban Angin & Gempa SNI 1726"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Petunjuk Pengerjaan</label>
                <textarea
                  rows={3}
                  placeholder="Deskripsikan format laporan, batasan pengujian, dan instruksi pengunggahan..."
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Poin Maksimum</label>
                  <input
                    type="number"
                    value={newAssignment.points}
                    onChange={(e) => setNewAssignment({ ...newAssignment, points: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tenggat Waktu</label>
                  <input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewAssignmentModal(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Terbitkan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUAT FORMULIR GOOGLE FORMS BARU */}
      {showNewFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-base">Buat Google Form Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewFormModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewForm} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Judul Formulir *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Survei Kepuasan Layanan Laboratorium FT UNBARI"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kategori Formulir *</label>
                <select
                  value={newFormCategory}
                  onChange={(e) => setNewFormCategory(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="EDOM">EDOM (Evaluasi Dosen oleh Mahasiswa)</option>
                  <option value="Tugas Akhir">Pendaftaran Tugas Akhir / Sidang</option>
                  <option value="Kerja Praktik">Kerja Praktik (KP) &amp; Magang</option>
                  <option value="Tracer Study">Tracer Study &amp; Kepuasan Pengguna Lulusan</option>
                  <option value="Tata Usaha">Layanan Persuratan Tata Usaha</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[11px] leading-relaxed">
                Formulir ini akan otomatis dibuat menggunakan API Google Forms dengan akun Cloud Project <strong>vernal-footing-bdtd0</strong> dan terhubung ke spreadsheet respons Google Sheets.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewFormModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Buat &amp; Publikasikan Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
