export type KaprodiActivityCategory =
  | 'VALIDASI_BAP'
  | 'PERUBAHAN_IKU'
  | 'PENGHAPUSAN_DATA'
  | 'VERIFIKASI_QR'
  | 'SYNC_WORKSPACE'
  | 'EXPORT_DOKUMEN'
  | 'NOTULENSI_RAPAT';

export interface KaprodiActivityLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  prodiId: string;
  category: KaprodiActivityCategory;
  actionTitle: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface RapatActionItem {
  id: string;
  tugas: string;
  penanggungJawab: string;
  deadline: string; // YYYY-MM-DD
  status: 'Belum Selesai' | 'Dalam Proses' | 'Selesai';
}

export interface NotulensiRapatRecord {
  id: string;
  nomorNotulen: string;
  judulRapat: string;
  tanggalRapat: string; // YYYY-MM-DD
  waktu: string;
  tempat: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3' | 'SEMUA_FT';
  pimpinanRapat: string;
  pesertaHadir: string[];
  ringkasanKeputusan: string[];
  actionItems: RapatActionItem[];
}

const ACTIVITY_LOG_STORAGE_KEY = 'sikaprodi_v15_activity_logs';
const NOTULENSI_STORAGE_KEY = 'sikaprodi_v15_notulensi_rapat';

const INITIAL_ACTIVITY_LOGS: KaprodiActivityLogEntry[] = [
  {
    id: 'ACT-001',
    timestamp: '15 Nov 2026, 09:12 WIB',
    actor: 'Ir. Rioni Rizki Aldiansyah, ST., MT',
    role: 'Kaprodi Teknik Sipil',
    prodiId: 'SIPIL',
    category: 'VALIDASI_BAP',
    actionTitle: 'Validasi BAP Pertemuan ke-8',
    detail: 'Mengesahkan Berita Acara Perkuliahan Mekanika Fluida & Hidrolika (SPL-204) beserta verifikasi presensi 34 mahasiswa.',
    severity: 'info'
  },
  {
    id: 'ACT-002',
    timestamp: '14 Nov 2026, 15:40 WIB',
    actor: 'Dr. Ir. Sri Wahyuni, MT',
    role: 'Kaprodi Teknik Lingkungan',
    prodiId: 'LINGKUNGAN',
    category: 'PERUBAHAN_IKU',
    actionTitle: 'Pembaruan Target Tahunan IKU-6',
    detail: 'Menaikkan target kemitraan Prodi Teknik Lingkungan dari 65% menjadi 72% sesuai kontrak kinerja Dekanat 2026.',
    severity: 'warning'
  },
  {
    id: 'ACT-003',
    timestamp: '13 Nov 2026, 11:05 WIB',
    actor: 'Fadli Eka Yandra, ST., MT',
    role: 'Dekan FT UNBARI',
    prodiId: 'LISTRIK_D3',
    category: 'PENGHAPUSAN_DATA',
    actionTitle: 'Penghapusan Slot Jadwal Ganda',
    detail: 'Menghapus duplikasi jadwal Praktikum PLC Kelas B akibat bentrok penggunaan Bengkel Otomasi.',
    severity: 'critical'
  },
  {
    id: 'ACT-004',
    timestamp: '12 Nov 2026, 14:20 WIB',
    actor: 'GPMF Fakultas Teknik',
    role: 'Auditor Mutu Internal',
    prodiId: 'SIPIL',
    category: 'EXPORT_DOKUMEN',
    actionTitle: 'Ekspor Laporan Capaian IKU & Borang LAM-Teknik',
    detail: 'Mengunduh berkas PDF Laporan Capaian 8 IKU Universitas ber-Kop Surat resmi FT UNBARI.',
    severity: 'info'
  }
];

function formatFutureDate(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const INITIAL_NOTULENSI_RAPAT: NotulensiRapatRecord[] = [
  {
    id: 'RPT-2026-11-01',
    nomorNotulen: '014/NOT-JUR/FT-UB/XI/2026',
    judulRapat: 'Rapat Koordinasi Persiapan Audit Mutu Internal (AMI) & Penuntasan BKD Dosen',
    tanggalRapat: '2026-11-12',
    waktu: '09:30 - 11:30 WIB',
    tempat: 'Ruang Rapat Dekanat Lt. 2 FT UNBARI',
    prodiId: 'SEMUA_FT',
    pimpinanRapat: 'Fadli Eka Yandra, ST., MT (Dekan FT UNBARI)',
    pesertaHadir: [
      'Fadli Eka Yandra, ST., MT (Dekan)',
      'Hadrah, ST., MT (Wakil Dekan I)',
      'Ir. Rioni Rizki Aldiansyah, ST., MT (Kaprodi Sipil)',
      'Dr. Ir. Sri Wahyuni, MT (Kaprodi Lingkungan)',
      'Bambang Prasetyo, ST., MT (Kaprodi D3 Listrik)',
      'Sekretaris Gugus Penjaminan Mutu Fakultas'
    ],
    ringkasanKeputusan: [
      'Seluruh dosen wajib mengunggah berkas BKD dan sertifikat pengabdian ke Repository Drive paling lambat 3 hari ke depan.',
      'Matriks pemetaan CPL-CPMK IABEE dan LAM-Teknik diselaraskan untuk borang akreditasi Kriteria 6.',
      'Mahasiswa semester 10+ dengan indikasi EWS wajib dijadwalkan bimbingan percepatan oleh Dosen PA.'
    ],
    actionItems: [
      {
        id: 'AI-01',
        tugas: 'Finalisasi Pengumpulan Berkas BKD & Bukti BAP Tersignature 100%',
        penanggungJawab: 'Kaprodi & Koordinator BKD Prodi',
        deadline: formatFutureDate(2),
        status: 'Dalam Proses'
      },
      {
        id: 'AI-02',
        tugas: 'Jadwalkan Kalibrasi Spektrofotometer & UTM 2000 kN ke Vendor KAN',
        penanggungJawab: 'Kepala Laboratorium Terpadu',
        deadline: formatFutureDate(1),
        status: 'Belum Selesai'
      },
      {
        id: 'AI-03',
        tugas: 'Distribusi Surat Peringatan (SP) EWS & Recovery Plan ke Dosen PA',
        penanggungJawab: 'Wakil Dekan I & Kaprodi',
        deadline: formatFutureDate(6),
        status: 'Dalam Proses'
      }
    ]
  },
  {
    id: 'RPT-2026-10-02',
    nomorNotulen: '011/NOT-JUR/FT-UB/X/2026',
    judulRapat: 'Evaluasi Kurikulum OBE & Capaian Tracer Study Lulusan 2025/2026',
    tanggalRapat: '2026-10-28',
    waktu: '13:30 - 15:00 WIB',
    tempat: 'Aula Teknik Sipil UNBARI',
    prodiId: 'SIPIL',
    pimpinanRapat: 'Ir. Rioni Rizki Aldiansyah, ST., MT',
    pesertaHadir: [
      'Ir. Rioni Rizki Aldiansyah, ST., MT',
      'Ir. Ahmad Ridwan, ST., MT',
      'Ir. Yulianto, ST., MT',
      'Perwakilan Alumni & DUDI Jasa Konstruksi Jambi'
    ],
    ringkasanKeputusan: [
      'Penambahan porsi praktikum BIM Revit & Civil 3D berdasarkan masukan Tracer Study DUDI.',
      'Integrasi mata kuliah proyek rekayasa lintas semester pada Kurikulum 2026.'
    ],
    actionItems: [
      {
        id: 'AI-04',
        tugas: 'Perbarui RPS Mata Kuliah Studio Perancangan BIM & Geoteknik',
        penanggungJawab: 'Tim Kurikulum Prodi Sipil',
        deadline: formatFutureDate(10),
        status: 'Selesai'
      }
    ]
  }
];

export function getActivityLogs(): KaprodiActivityLogEntry[] {
  try {
    const saved = localStorage.getItem(ACTIVITY_LOG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return INITIAL_ACTIVITY_LOGS;
}

export function logKaprodiActivity(params: {
  actor?: string;
  role?: string;
  prodiId: string;
  category: KaprodiActivityCategory;
  actionTitle: string;
  detail: string;
  severity?: 'info' | 'warning' | 'critical';
}): KaprodiActivityLogEntry {
  const entry: KaprodiActivityLogEntry = {
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB',
    actor: params.actor || 'Kaprodi FT UNBARI',
    role: params.role || 'Ketua Program Studi',
    prodiId: params.prodiId,
    category: params.category,
    actionTitle: params.actionTitle,
    detail: params.detail,
    severity: params.severity || 'info'
  };

  const current = getActivityLogs();
  const next = [entry, ...current].slice(0, 100);
  try {
    localStorage.setItem(ACTIVITY_LOG_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('sikaprodi:activity-log-updated'));
  } catch {
    // ignore
  }
  return entry;
}

export function getNotulensiRapatList(): NotulensiRapatRecord[] {
  try {
    const saved = localStorage.getItem(NOTULENSI_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_NOTULENSI_RAPAT;
}

export function saveNotulensiRapatList(records: NotulensiRapatRecord[]): void {
  try {
    localStorage.setItem(NOTULENSI_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('sikaprodi:notulensi-updated'));
  } catch {
    // ignore
  }
}

export interface ApproachingActionItemAlert {
  rapatId: string;
  judulRapat: string;
  actionItem: RapatActionItem;
  daysLeft: number;
}

export function getApproachingActionItems(prodiId?: string): ApproachingActionItemAlert[] {
  const list = getNotulensiRapatList().filter(
    r => !prodiId || r.prodiId === 'SEMUA_FT' || r.prodiId === prodiId
  );
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const alerts: ApproachingActionItemAlert[] = [];

  list.forEach(rapat => {
    rapat.actionItems.forEach(item => {
      if (item.status === 'Selesai') return;
      const due = new Date(`${item.deadline}T00:00:00`).getTime();
      if (isNaN(due)) return;
      const daysLeft = Math.ceil((due - todayMidnight) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3) {
        alerts.push({
          rapatId: rapat.id,
          judulRapat: rapat.judulRapat,
          actionItem: item,
          daysLeft
        });
      }
    });
  });

  return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
}

export function getBkdDeadlineInfo(): {
  daysRemaining: number;
  deadlineLabel: string;
  incompleteLecturers: Array<{ nama: string; missingDocs: string }>;
} {
  const target = new Date();
  target.setDate(target.getDate() + 3);
  const deadlineLabel = target.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let uploadedCount = 0;
  try {
    const saved = localStorage.getItem('sikaprodi_v15_bkd_repo_files');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) uploadedCount = parsed.length;
    }
  } catch {
    // ignore
  }

  const baseIncomplete = [
    { nama: 'Ir. Ahmad Ridwan, ST., MT', missingDocs: 'SK Pembimbing TA & Sertifikat Pengabdian Masyarakat' },
    { nama: 'Ir. Yulianto, ST., MT', missingDocs: 'Berita Acara Perkuliahan (BAP) Pertemuan 7–8' }
  ];

  return {
    daysRemaining: 3,
    deadlineLabel,
    incompleteLecturers: uploadedCount >= 6 ? [] : baseIncomplete
  };
}
