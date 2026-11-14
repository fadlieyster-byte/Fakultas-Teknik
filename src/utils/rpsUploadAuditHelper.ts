import { Dosen, MataKuliahCplMatrixRecord } from '../types/index';
import { INITIAL_DOSEN } from '../data/mockData';
import { initialLmsKelasList } from '../data/mockLmsData';

export const CURRENT_RPS_ACADEMIC_TERM = 'TA 2026/2027 Ganjil (OBE V2)';

export type RpsUploadComplianceStatus =
  | 'BELUM_UNGGAH'
  | 'PERLU_PEMBARUAN_VERSI'
  | 'SUDAH_UNGGAH_TERBARU';

export interface UploadedRpsFileRecord {
  fileName: string;
  fileSizeKb: number;
  uploadedAt: string;
  uploadedBy: string;
  academicTerm: string;
}

export interface RpsReminderDispatchRecord {
  courseId: string;
  kodeMK: string;
  namaMK: string;
  dosenNama: string;
  dosenEmail: string;
  channel: 'Sistem & Email Prodi' | 'WhatsApp & Sistem' | 'Pengingat Massal Prodi';
  sentAt: string;
  messagePreview: string;
}

export interface RpsCourseUploadAuditItem {
  course: MataKuliahCplMatrixRecord;
  status: RpsUploadComplianceStatus;
  statusLabel: string;
  isMissingLatest: boolean;
  expectedFileName: string;
  currentFileName: string | null;
  currentFileTerm: string | null;
  lastUpdatedLabel: string;
  reasonDetail: string;
  dosenNama: string;
  dosenEmail: string;
  dosenNoHp: string;
  dosenJabatan: string;
  matchedDosen?: Dosen;
  uploadedRecord?: UploadedRpsFileRecord;
  latestReminder?: RpsReminderDispatchRecord;
}

export interface LecturerPendingRpsGroup {
  dosenNama: string;
  dosenEmail: string;
  dosenNoHp: string;
  dosenJabatan: string;
  pendingCourses: RpsCourseUploadAuditItem[];
  missingCount: number;
  outdatedCount: number;
  allReminded: boolean;
  lastRemindedAt?: string;
}

export interface RpsUploadProdiAuditSummary {
  academicTerm: string;
  totalCourses: number;
  uploadedLatestCount: number;
  missingOnlyCount: number;
  outdatedCount: number;
  missingLatestCount: number;
  complianceRatePercent: number;
  remindedPendingCount: number;
  items: RpsCourseUploadAuditItem[];
  lecturerPendingGroups: LecturerPendingRpsGroup[];
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b(dr|ir|prof|st|s\.t|mt|m\.t|m\.eng|m\.si|m\.sc|m\.hum|m\.pd\.i|m\.h|ipm|ipp|asean|eng|sp)\b\.?/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

function findMatchingDosen(dosenPengampu: string, prodiId: string): Dosen | undefined {
  const normTarget = normalizeText(dosenPengampu);
  if (!normTarget) return undefined;

  const sameProdi = INITIAL_DOSEN.filter(d => d.prodiId === prodiId);
  const pool = sameProdi.length > 0 ? [...sameProdi, ...INITIAL_DOSEN] : INITIAL_DOSEN;

  return pool.find(d => {
    const normDosen = normalizeText(d.namaLengkap);
    if (!normDosen) return false;
    return (
      normDosen === normTarget ||
      normDosen.includes(normTarget.slice(0, 8)) ||
      normTarget.includes(normDosen.slice(0, 8))
    );
  });
}

function buildFallbackEmail(dosenName: string): string {
  const clean = normalizeText(dosenName);
  const slug = clean.slice(0, 14) || 'dosen.pengampu';
  return `${slug}@ft.unbari.ac.id`;
}

function normalizeCourseKey(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function computeDeterministicHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 997;
  }
  return hash;
}

export function buildRpsReminderMessage(item: RpsCourseUploadAuditItem): string {
  const statusLine =
    item.status === 'BELUM_UNGGAH'
      ? `belum memiliki berkas dokumen RPS terbaru (${CURRENT_RPS_ACADEMIC_TERM})`
      : `masih menggunakan file RPS edisi sebelumnya (${item.currentFileTerm || 'TA 2025/2026'}) dan perlu pembaruan format OBE`;

  return [
    `Yth. ${item.dosenNama},`,
    '',
    `Berdasarkan hasil pemindaian otomatis Audit Modul RPS Program Studi ${item.course.prodiId} FT UNBARI, mata kuliah berikut ${statusLine}:`,
    `- Kode / Mata Kuliah: ${item.course.kodeMK} — ${item.course.namaMK} (${item.course.sks} SKS)`,
    `- Semester Penyajian: ${item.course.semesterLabel || item.course.semester || 'Lintas'}`,
    `- Nama Berkas Sasaran: ${item.expectedFileName}`,
    '',
    `Mohon kesediaan Bapak/Ibu untuk segera mengunggah file RPS PDF terbaru (dengan pemetaan CPMK–CPL dan minimal 3 jenis asesmen OBE) melalui portal SIKAPRODI / LMS FT UNBARI guna persiapan borang akreditasi LAM-Teknik.`,
    '',
    `Hormat kami,`,
    `Ketua Program Studi & GPMF Fakultas Teknik UNBARI`
  ].join('\n');
}

export function scanCoursesRpsUploadCompliance(params: {
  courses: MataKuliahCplMatrixRecord[];
  uploadedFilesMap: Record<string, UploadedRpsFileRecord>;
  smartRpsOverridesMap?: Record<string, { fileName?: string; updatedAt: string }>;
  remindersMap: Record<string, RpsReminderDispatchRecord>;
}): RpsUploadProdiAuditSummary {
  const { courses, uploadedFilesMap, smartRpsOverridesMap = {}, remindersMap } = params;

  const items: RpsCourseUploadAuditItem[] = courses.map((course, idx) => {
    const cleanCode = course.kodeMK.replace(/[^a-zA-Z0-9-]/g, '');
    const expectedFileName = `RPS-${course.prodiId}-${cleanCode}-20261.pdf`;

    const matchedDosen = findMatchingDosen(course.dosenPengampu, course.prodiId);
    const dosenNama = matchedDosen?.namaLengkap || course.dosenPengampu;
    const dosenEmail = matchedDosen?.email || buildFallbackEmail(course.dosenPengampu);
    const dosenNoHp = matchedDosen?.noHp || '0812-7400-0000';
    const dosenJabatan = matchedDosen?.jabatanFungsional || 'Dosen Pengampu';

    const directUpload = uploadedFilesMap[course.id];
    const smartOverride = smartRpsOverridesMap[course.id];

    const normCourseName = normalizeCourseKey(course.namaMK);
    const matchedLms = initialLmsKelasList.find(
      lms =>
        lms.prodiId === course.prodiId &&
        (lms.kodeMK.toLowerCase() === course.kodeMK.toLowerCase() ||
          normalizeCourseKey(lms.namaMK).includes(normCourseName.slice(0, 12)))
    );

    let status: RpsUploadComplianceStatus = 'SUDAH_UNGGAH_TERBARU';
    let statusLabel = 'Terbaru (TA 2026/2027)';
    let currentFileName: string | null = expectedFileName;
    let currentFileTerm: string | null = CURRENT_RPS_ACADEMIC_TERM;
    let lastUpdatedLabel = '14 Okt 2026';
    let reasonDetail = 'Berkas RPS format OBE V2 TA 2026/2027 telah terverifikasi pada repositori.';

    if (directUpload) {
      status = 'SUDAH_UNGGAH_TERBARU';
      statusLabel = 'Terbaru (Baru Diunggah)';
      currentFileName = directUpload.fileName;
      currentFileTerm = directUpload.academicTerm;
      lastUpdatedLabel = new Date(directUpload.uploadedAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      reasonDetail = `Diunggah oleh ${directUpload.uploadedBy} (${directUpload.fileSizeKb} KB).`;
    } else if (smartOverride?.fileName) {
      status = 'SUDAH_UNGGAH_TERBARU';
      statusLabel = 'Terbaru (Terunggah via Scanner)';
      currentFileName = smartOverride.fileName;
      currentFileTerm = CURRENT_RPS_ACADEMIC_TERM;
      lastUpdatedLabel = new Date(smartOverride.updatedAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      reasonDetail = 'Berkas RPS baru telah dipindai dan tersimpan pada audit OBE.';
    } else {
      // Realistic repository scan evaluation when no fresh upload override exists
      const hash = computeDeterministicHash(`${course.id}-${course.kodeMK}-${idx}`);
      const isGeneralOrLegacy =
        course.dosenPengampu.toLowerCase().includes('tim pengampu') ||
        course.semester === 0 ||
        course.kategori === 'Pilihan';

      if (matchedLms?.silabusRpsUrl) {
        status = 'PERLU_PEMBARUAN_VERSI';
        statusLabel = 'Versi Lama (TA 2025/2026)';
        currentFileName = matchedLms.silabusRpsUrl.split('/').pop() || `RPS-${cleanCode}-2025.pdf`;
        currentFileTerm = matchedLms.tahunAkademik;
        lastUpdatedLabel = '08 Sep 2025';
        reasonDetail = `File LMS masih merujuk edisi ${matchedLms.tahunAkademik}; perlu unggah ulang RPS OBE 2026/2027.`;
      } else if (isGeneralOrLegacy && hash % 5 !== 0) {
        status = 'BELUM_UNGGAH';
        statusLabel = 'Belum Mengunggah RPS';
        currentFileName = null;
        currentFileTerm = null;
        lastUpdatedLabel = 'Belum ada berkas';
        reasonDetail =
          course.semester === 0
            ? 'MK kurikulum transisi/lintas belum memiliki berkas PDF RPS terbaru TA 2026/2027.'
            : course.kategori === 'Pilihan'
            ? 'MK Pilihan semester aktif belum mengunggah dokumen RPS PDF ke repositori prodi.'
            : 'MKDU / Wajib Fakultas belum melampirkan file PDF RPS terbaru dari tim pengampu.';
      } else if (hash % 10 < 2) {
        status = 'BELUM_UNGGAH';
        statusLabel = 'Belum Mengunggah RPS';
        currentFileName = null;
        currentFileTerm = null;
        lastUpdatedLabel = 'Belum ada berkas';
        reasonDetail = 'Belum ditemukan unggahan file RPS PDF untuk semester TA 2026/2027.';
      } else if (hash % 10 === 2) {
        status = 'PERLU_PEMBARUAN_VERSI';
        statusLabel = 'Versi Lama (TA 2024/2025)';
        currentFileName = `RPS-${cleanCode}-20242-Draft.pdf`;
        currentFileTerm = 'TA 2024/2025 Genap';
        lastUpdatedLabel = '18 Feb 2025';
        reasonDetail = 'Dokumen tersimpan masih draf tahun akademik lalu tanpa tanda tangan pengesahan OBE.';
      } else {
        const day = 10 + (hash % 18);
        lastUpdatedLabel = `${String(day).padStart(2, '0')} Okt 2026`;
      }
    }

    const isMissingLatest = status !== 'SUDAH_UNGGAH_TERBARU';
    const latestReminder = remindersMap[course.id];

    return {
      course,
      status,
      statusLabel,
      isMissingLatest,
      expectedFileName,
      currentFileName,
      currentFileTerm,
      lastUpdatedLabel,
      reasonDetail,
      dosenNama,
      dosenEmail,
      dosenNoHp,
      dosenJabatan,
      matchedDosen,
      uploadedRecord: directUpload,
      latestReminder
    };
  });

  const totalCourses = items.length;
  const uploadedLatestCount = items.filter(i => i.status === 'SUDAH_UNGGAH_TERBARU').length;
  const missingOnlyCount = items.filter(i => i.status === 'BELUM_UNGGAH').length;
  const outdatedCount = items.filter(i => i.status === 'PERLU_PEMBARUAN_VERSI').length;
  const missingLatestCount = missingOnlyCount + outdatedCount;
  const complianceRatePercent =
    totalCourses > 0 ? Math.round((uploadedLatestCount / totalCourses) * 100) : 0;
  const remindedPendingCount = items.filter(
    i => i.isMissingLatest && Boolean(i.latestReminder)
  ).length;

  // Group pending items by lecturer so Kaprodi can batch-remind a lecturer in 1 click
  const byLecturer = new Map<string, RpsCourseUploadAuditItem[]>();
  items
    .filter(item => item.isMissingLatest)
    .forEach(item => {
      const key = item.dosenNama.trim();
      const list = byLecturer.get(key) || [];
      list.push(item);
      byLecturer.set(key, list);
    });

  const lecturerPendingGroups: LecturerPendingRpsGroup[] = Array.from(byLecturer.entries())
    .map(([dosenNama, pendingCourses]) => {
      const first = pendingCourses[0];
      const missingCount = pendingCourses.filter(c => c.status === 'BELUM_UNGGAH').length;
      const outdatedCountPerDosen = pendingCourses.filter(
        c => c.status === 'PERLU_PEMBARUAN_VERSI'
      ).length;
      const allReminded = pendingCourses.every(c => Boolean(c.latestReminder));
      const latestSent = pendingCourses
        .map(c => c.latestReminder?.sentAt)
        .filter(Boolean)
        .sort()
        .pop();

      return {
        dosenNama,
        dosenEmail: first.dosenEmail,
        dosenNoHp: first.dosenNoHp,
        dosenJabatan: first.dosenJabatan,
        pendingCourses,
        missingCount,
        outdatedCount: outdatedCountPerDosen,
        allReminded,
        lastRemindedAt: latestSent
      };
    })
    .sort((a, b) => b.pendingCourses.length - a.pendingCourses.length);

  return {
    academicTerm: CURRENT_RPS_ACADEMIC_TERM,
    totalCourses,
    uploadedLatestCount,
    missingOnlyCount,
    outdatedCount,
    missingLatestCount,
    complianceRatePercent,
    remindedPendingCount,
    items,
    lecturerPendingGroups
  };
}
