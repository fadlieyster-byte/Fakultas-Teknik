import {
  ButirCplObe,
  CplItemObe,
  LevelKontribusiCpl,
  MataKuliahCplMatrixRecord
} from '../types/index';
import { CourseCplAuditResult } from './cplRpsAuditHelper';
import {
  OBE_ASSESSMENT_CATEGORIES,
  SmartRpsDocumentOverride
} from './smartRpsAuditHelper';

export interface CourseTargetMapEntry {
  cplKode: string;
  namaCpl: string;
  targetPersen: number;
  realisasiNilaiMhs: number;
}

export type RpsPerformanceStatus =
  | 'MELAMPAUI_TARGET'
  | 'SESUAI_TARGET'
  | 'PERHATIAN'
  | 'KESENJANGAN_KRITIS';

export type CrossScanAlignmentStatus =
  | 'SELARAS'
  | 'PERLU_PENYESUAIAN'
  | 'PRIORITAS_REVISI';

export type CanonicalAssessmentTag =
  | 'UJIAN_TERTULIS'
  | 'TUGAS_PERHITUNGAN'
  | 'CASE_METHOD'
  | 'PROYEK_TB'
  | 'PRAKTIKUM_LAB'
  | 'PRESENTASI_SEMINAR'
  | 'OBSERVASI_SIKAP';

export interface CplAssessmentCrossMatchItem {
  cplKode: string;
  cplJudul: string;
  ranah: CplItemObe['ranah'];
  levelKontribusi: LevelKontribusiCpl;
  targetCplProdiPersen: number;
  terhubungCpmk: boolean;
  cpmkPendukung: string[];
  bobotAsesmenPersen: number;
  metodeAsesmenTerkait: string[];
  instrumenIdeal: string;
  statusKeselarasanButir: 'SELARAS' | 'PARSIAL' | 'TIDAK_SELARAS';
  skorButir: number;
  catatanPemindaian: string;
}

export interface CplRpsGapItem {
  kode: string;
  judul: string;
  ranah: string;
  targetKurikulumPersen: number;
  targetRpsPersen: number;
  realisasiLapanganPersen: number;
  gapVsTargetRps: number;
  gapVsKurikulum: number;
  supportingCourseCount: number;
  strongSupportCount: number;
  statusKinerja: RpsPerformanceStatus;
  statusLabel: string;
  rekomendasiCqi: string;
}

export interface CourseCplBreakdownRadarPoint {
  cplKode: string;
  judul: string;
  targetKurikulum: number;
  targetRps: number;
  realisasiLapangan: number;
  gapVsTargetRps: number;
}

export interface CourseRpsPerformanceItem {
  course: MataKuliahCplMatrixRecord;
  targetKurikulumPersen: number;
  targetRpsPersen: number;
  realisasiCplPersen: number;
  gapPersen: number;
  statusKinerja: RpsPerformanceStatus;
  statusLabel: string;
  radarPoints: CourseCplBreakdownRadarPoint[];
  rekomendasi: string;
  // Hasil Pemindaian Silang Target CPL Prodi × Metode Asesmen RPS (Skor 1-100)
  keselarasanSkor: number;
  statusPenyesuaian: CrossScanAlignmentStatus;
  statusPenyesuaianLabel: string;
  butuhPenyesuaian: boolean;
  detectedInstrumentLabels: string[];
  totalBobotCpmkPersen: number;
  alignedCplCount: number;
  totalMappedCplCount: number;
  mismatchedCplCodes: string[];
  crossScanFindings: CplAssessmentCrossMatchItem[];
  saranPenyesuaian: string;
}

export interface RpsPerformanceAuditReport {
  avgRealisasiLapangan: number;
  avgTargetRps: number;
  avgTargetKurikulum: number;
  avgGapVsTargetRps: number;
  avgGapVsKurikulum: number;
  compliantCplCount: number;
  gapCplCount: number;
  criticalCplCount: number;
  compliantCourseCount: number;
  gapCourseCount: number;
  alignmentIndexPersen: number;
  // Ringkasan Pemindaian Silang Skor Kualitas (1-100)
  avgKeselarasanSkor: number;
  alignedAlignmentCourseCount: number;
  needsAdjustmentCourseCount: number;
  criticalAdjustmentCourseCount: number;
  cplItems: CplRpsGapItem[];
  courseItems: CourseRpsPerformanceItem[];
  weakestCpl: CplRpsGapItem | null;
  strongestCpl: CplRpsGapItem | null;
}

const CANONICAL_TAG_LABELS: Record<CanonicalAssessmentTag, string> = {
  UJIAN_TERTULIS: 'Ujian Tertulis / Kuis',
  TUGAS_PERHITUNGAN: 'Tugas Terstruktur / Hitungan',
  CASE_METHOD: 'Studi Kasus (Case Method)',
  PROYEK_TB: 'Proyek / Tugas Besar',
  PRAKTIKUM_LAB: 'Praktikum / Uji Lab / Simulasi',
  PRESENTASI_SEMINAR: 'Presentasi / Laporan Teknis',
  OBSERVASI_SIKAP: 'Observasi Etika / Rubrik K3'
};

function detectAssessmentTags(rawText: string): CanonicalAssessmentTag[] {
  const txt = rawText.toLowerCase();
  const tags = new Set<CanonicalAssessmentTag>();

  if (/\b(uts|uas|kuis|quiz|ujian|responsi|tes formatif|tes tertulis)\b/.test(txt)) {
    tags.add('UJIAN_TERTULIS');
  }
  if (/\b(tugas|latihan|perhitungan|hitungan|resume|logbook|problem set)\b/.test(txt) && !/\btugas besar\b/.test(txt)) {
    tags.add('TUGAS_PERHITUNGAN');
  }
  if (/(studi kasus|case method|kajian kasus|analisis kasus|problem based|\bpbl\b)/.test(txt)) {
    tags.add('CASE_METHOD');
  }
  if (/(proyek|project|tugas besar|team-based|rancang|perancangan|desain|gambar perencanaan|capstone|skripsi|tugas akhir)/.test(txt)) {
    tags.add('PROYEK_TB');
  }
  if (/(praktikum|prak\.|laboratorium|\blab\b|uji kinerja|pengujian|sampling|simulasi|pemodelan|software|autocad|sap2000|etabs|plaxis|\bplc\b|\bgis\b|bengkel|workshop)/.test(txt)) {
    tags.add('PRAKTIKUM_LAB');
  }
  if (/(presentasi|seminar|paparan|sidang|komunikasi|laporan teknis|karya ilmiah|artikel|makalah|poster)/.test(txt)) {
    tags.add('PRESENTASI_SEMINAR');
  }
  if (/(observasi|rubrik sikap|kedisiplinan|etika|\bk3\b|puil|smkk|kerja praktek|kkn|kolaborasi|tim|peer|partisipasi|keaktifan|afektif)/.test(txt)) {
    tags.add('OBSERVASI_SIKAP');
  }

  return Array.from(tags);
}

function getPreferredInstrumentsForCpl(cpl: CplItemObe): {
  preferredTags: CanonicalAssessmentTag[];
  instrumenIdeal: string;
} {
  const combined = `${cpl.judul} ${cpl.deskripsi}`.toLowerCase();

  if (cpl.ranah === 'Keterampilan Khusus') {
    if (/(perancangan|desain|konstruksi|instalasi|sistem)/.test(combined)) {
      return {
        preferredTags: ['PROYEK_TB', 'PRAKTIKUM_LAB', 'CASE_METHOD'],
        instrumenIdeal: 'Proyek Desain / Tugas Besar atau Praktikum Terapan'
      };
    }
    if (/(pengujian|investigasi|lab|lapangan|pengukuran|pemeliharaan|troubleshooting)/.test(combined)) {
      return {
        preferredTags: ['PRAKTIKUM_LAB', 'PROYEK_TB', 'CASE_METHOD'],
        instrumenIdeal: 'Praktikum Lab / Uji Kinerja atau Studi Kasus Lapangan'
      };
    }
    return {
      preferredTags: ['PROYEK_TB', 'CASE_METHOD', 'PRAKTIKUM_LAB'],
      instrumenIdeal: 'Tugas Besar / Case Method / Praktikum'
    };
  }

  if (cpl.ranah === 'Keterampilan Umum') {
    return {
      preferredTags: ['PRESENTASI_SEMINAR', 'PROYEK_TB', 'CASE_METHOD'],
      instrumenIdeal: 'Presentasi Teknis / Laporan Kolaboratif / Proyek Tim'
    };
  }

  if (cpl.ranah === 'Sikap') {
    return {
      preferredTags: ['OBSERVASI_SIKAP', 'CASE_METHOD', 'PRAKTIKUM_LAB', 'PROYEK_TB'],
      instrumenIdeal: 'Rubrik Observasi Etika & K3 / Kajian Kasus Lapangan'
    };
  }

  // Penguasaan Pengetahuan
  if (/(software|bim|gis|simulasi|pemodelan|plc|aplikasi komputer)/.test(combined)) {
    return {
      preferredTags: ['PRAKTIKUM_LAB', 'PROYEK_TB', 'CASE_METHOD'],
      instrumenIdeal: 'Uji Praktik Software / Simulasi Pemodelan'
    };
  }

  return {
    preferredTags: ['UJIAN_TERTULIS', 'TUGAS_PERHITUNGAN', 'CASE_METHOD', 'PRAKTIKUM_LAB'],
    instrumenIdeal: 'Tes Analitis (UTS/UAS/Kuis) & Tugas Perhitungan / Kasus'
  };
}

function classifyGapStatus(gap: number): {
  statusKinerja: RpsPerformanceStatus;
  statusLabel: string;
} {
  if (gap >= 2.0) {
    return { statusKinerja: 'MELAMPAUI_TARGET', statusLabel: 'Melampaui Target' };
  }
  if (gap >= 0) {
    return { statusKinerja: 'SESUAI_TARGET', statusLabel: 'Sesuai Target' };
  }
  if (gap >= -5.0) {
    return { statusKinerja: 'PERHATIAN', statusLabel: 'Kesenjangan Ringan' };
  }
  return { statusKinerja: 'KESENJANGAN_KRITIS', statusLabel: 'Kesenjangan Kritis' };
}

function classifyCrossScanStatus(score: number): {
  statusPenyesuaian: CrossScanAlignmentStatus;
  statusPenyesuaianLabel: string;
  butuhPenyesuaian: boolean;
} {
  if (score >= 75) {
    return {
      statusPenyesuaian: 'SELARAS',
      statusPenyesuaianLabel: 'Selaras OBE',
      butuhPenyesuaian: false
    };
  }
  if (score >= 60) {
    return {
      statusPenyesuaian: 'PERLU_PENYESUAIAN',
      statusPenyesuaianLabel: 'Perlu Penyesuaian',
      butuhPenyesuaian: true
    };
  }
  return {
    statusPenyesuaian: 'PRIORITAS_REVISI',
    statusPenyesuaianLabel: 'Prioritas Revisi',
    butuhPenyesuaian: true
  };
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

/**
 * Menghitung Audit Kinerja RPS komprehensif yang membandingkan:
 * - Target Kurikulum OBE (standar prodi / borang LAM-Teknik)
 * - Target RPS (target yang ditetapkan dalam Rencana Pembelajaran Semester & modul target MK)
 * - Realisasi Capaian CPL di Lapangan (berbasis portofolio asesmen kelas, CPMK, & nilai riil mahasiswa)
 * - Pemindaian Silang (Cross-Scan) Target CPL Prodi vs Metode Asesmen pada RPS (Skor 1-100)
 */
export function buildRpsPerformanceAuditReport(params: {
  prodiId: string;
  cplsObe: CplItemObe[];
  borangCplList: ButirCplObe[];
  courses: MataKuliahCplMatrixRecord[];
  courseAuditResults: CourseCplAuditResult[];
  courseTargets: Record<string, CourseTargetMapEntry[]>;
  rpsTargetOverrides?: Record<string, number>;
  smartRpsDocOverrides?: Record<string, SmartRpsDocumentOverride>;
}): RpsPerformanceAuditReport {
  const {
    prodiId,
    cplsObe,
    borangCplList,
    courses,
    courseAuditResults,
    courseTargets,
    rpsTargetOverrides = {},
    smartRpsDocOverrides = {}
  } = params;

  const prodiPrefix =
    prodiId === 'SIPIL' ? 'SIPIL-' : prodiId === 'LINGKUNGAN' ? 'LINGKUNGAN-' : 'LISTRIK-';

  const matchingCourseTargets = Object.entries(courseTargets)
    .filter(([key]) => key.startsWith(prodiPrefix))
    .flatMap(([, items]) => items);

  const auditByCourseId = new Map<string, CourseCplAuditResult>();
  courseAuditResults.forEach(item => auditByCourseId.set(item.course.id, item));

  // 1. Per-CPL Curriculum vs RPS Target vs Field Realization
  const cplItems: CplRpsGapItem[] = cplsObe.map((cplDef, idx) => {
    const borangMatch = borangCplList.find(b => b.kode === cplDef.kode);
    const targetKurikulumPersen = borangMatch?.targetPersen ?? cplDef.targetKetercapaianMinimal;

    // Derive RPS target: use Kaprodi override if present, otherwise aggregate from courseTargets or curriculum target + 2% RPS buffer
    const targetMatches = matchingCourseTargets.filter(t => t.cplKode === cplDef.kode);
    const defaultRpsTarget =
      targetMatches.length > 0
        ? targetMatches.reduce((s, t) => s + t.targetPersen, 0) / targetMatches.length
        : Math.min(92, targetKurikulumPersen + (idx % 3 === 0 ? 2 : 0));

    const targetRpsPersen = round1(
      rpsTargetOverrides[cplDef.kode] !== undefined
        ? rpsTargetOverrides[cplDef.kode]
        : defaultRpsTarget
    );

    // Compute field realization from course-level CPMK/CPL audit scores + direct student realization samples
    const courseScoresForCpl: number[] = [];
    let strongSupportCount = 0;

    courses.forEach(course => {
      const audit = auditByCourseId.get(course.id);
      const detail = audit?.mappedDetails.find(d => d.kode === cplDef.kode);
      if (!detail) return;
      if (detail.level === 'Strong') strongSupportCount += 1;

      // Calibrate classroom realization slightly against practical field execution difficulty
      const methodText = (course.cpmkList || []).map(c => c.metodeAsesmen.toLowerCase()).join(' ');
      const hasPracticalEvidence =
        methodText.includes('praktikum') ||
        methodText.includes('proyek') ||
        methodText.includes('tugas besar') ||
        methodText.includes('kasus');
      const fieldFactor = hasPracticalEvidence ? 2.1 : -0.8;
      courseScoresForCpl.push(Math.min(95, Math.max(55, detail.scorePercent + fieldFactor)));
    });

    const avgMatrixField =
      courseScoresForCpl.length > 0
        ? courseScoresForCpl.reduce((s, v) => s + v, 0) / courseScoresForCpl.length
        : targetKurikulumPersen - 4.5;

    const avgStudentTargetRealization =
      targetMatches.length > 0
        ? targetMatches.reduce((s, t) => s + t.realisasiNilaiMhs, 0) / targetMatches.length
        : null;

    // Combine matrix classroom execution (70%) + borang tracer/student realization (30%) so both curriculum structure and field performance drive the radar chart
    const borangRealisasi = borangMatch?.realisasiPersen ?? avgMatrixField;
    const blendedField =
      avgStudentTargetRealization !== null
        ? avgMatrixField * 0.55 + avgStudentTargetRealization * 0.3 + borangRealisasi * 0.15
        : avgMatrixField * 0.72 + borangRealisasi * 0.28;

    const realisasiLapanganPersen = round1(Math.min(96, Math.max(52, blendedField)));
    const gapVsTargetRps = round1(realisasiLapanganPersen - targetRpsPersen);
    const gapVsKurikulum = round1(realisasiLapanganPersen - targetKurikulumPersen);

    const { statusKinerja, statusLabel } = classifyGapStatus(gapVsTargetRps);

    let rekomendasiCqi = '';
    if (statusKinerja === 'KESENJANGAN_KRITIS') {
      rekomendasiCqi = `Realisasi lapangan (${realisasiLapanganPersen.toFixed(1)}%) tertinggal ${Math.abs(
        gapVsTargetRps
      ).toFixed(1)}% dari target RPS (${targetRpsPersen.toFixed(1)}%). Revisi metode pembelajaran ke Team-Based Project/Case Method & tambah bobot rubrik pada ${cplDef.kode}.`;
    } else if (statusKinerja === 'PERHATIAN') {
      rekomendasiCqi = `Terdapat selisih -${Math.abs(gapVsTargetRps).toFixed(
        1
      )}% terhadap target RPS. Perkuat asesmen formatif mingguan dan sinkronisasi soal UTS/UAS terhadap CPMK pendukung ${cplDef.kode}.`;
    } else if (statusKinerja === 'SESUAI_TARGET') {
      rekomendasiCqi = `Capaian lapangan telah memenuhi target RPS (+${gapVsTargetRps.toFixed(
        1
      )}%). Pertahankan konsistensi rubrik penilaian dan dokumentasi portofolio mahasiswa.`;
    } else {
      rekomendasiCqi = `Kinerja sangat unggul (+${gapVsTargetRps.toFixed(
        1
      )}% di atas target RPS). Jadikan RPS pendukung ${cplDef.kode} sebagai model praktik baik (best practice) prodi.`;
    }

    return {
      kode: cplDef.kode,
      judul: cplDef.judul,
      ranah: cplDef.ranah,
      targetKurikulumPersen,
      targetRpsPersen,
      realisasiLapanganPersen,
      gapVsTargetRps,
      gapVsKurikulum,
      supportingCourseCount: courseScoresForCpl.length,
      strongSupportCount,
      statusKinerja,
      statusLabel,
      rekomendasiCqi
    };
  });

  const cplMap = new Map<string, CplRpsGapItem>();
  cplItems.forEach(item => cplMap.set(item.kode, item));

  // 2. Per-Course RPS Performance Items
  const courseItems: CourseRpsPerformanceItem[] = courses.map(course => {
    const audit = auditByCourseId.get(course.id);
    const mappedDetails = audit?.mappedDetails || [];

    // Build radar breakdown across all active CPLs so any selected course forms a complete, interpretable polygon
    const radarPoints: CourseCplBreakdownRadarPoint[] = cplItems.map(prodiCpl => {
      const courseDetail = mappedDetails.find(d => d.kode === prodiCpl.kode);
      const targetKurikulum = prodiCpl.targetKurikulumPersen;
      const targetRps = prodiCpl.targetRpsPersen;

      let realisasiLapangan = prodiCpl.realisasiLapanganPersen;
      if (courseDetail) {
        const methodText = (course.cpmkList || []).map(c => c.metodeAsesmen.toLowerCase()).join(' ');
        const hasPractice =
          methodText.includes('praktikum') ||
          methodText.includes('proyek') ||
          methodText.includes('tugas besar') ||
          methodText.includes('kasus');
        realisasiLapangan = round1(
          Math.min(
            96,
            Math.max(52, courseDetail.scorePercent * 0.7 + prodiCpl.realisasiLapanganPersen * 0.3 + (hasPractice ? 1.5 : -0.5))
          )
        );
      }

      return {
        cplKode: prodiCpl.kode,
        judul: prodiCpl.judul,
        targetKurikulum,
        targetRps,
        realisasiLapangan,
        gapVsTargetRps: round1(realisasiLapangan - targetRps)
      };
    });

    const relevantPoints =
      mappedDetails.length > 0
        ? radarPoints.filter(rp => mappedDetails.some(d => d.kode === rp.cplKode))
        : radarPoints;

    const targetKurikulumPersen =
      relevantPoints.length > 0
        ? round1(
            relevantPoints.reduce((s, r) => s + r.targetKurikulum, 0) / relevantPoints.length
          )
        : 75;
    const targetRpsPersen =
      relevantPoints.length > 0
        ? round1(relevantPoints.reduce((s, r) => s + r.targetRps, 0) / relevantPoints.length)
        : 75;
    const realisasiCplPersen =
      relevantPoints.length > 0
        ? round1(
            relevantPoints.reduce((s, r) => s + r.realisasiLapangan, 0) / relevantPoints.length
          )
        : 70;

    const gapPersen = round1(realisasiCplPersen - targetRpsPersen);
    const { statusKinerja, statusLabel } = classifyGapStatus(gapPersen);

    const weakestPoint = [...relevantPoints].sort(
      (a, b) => a.gapVsTargetRps - b.gapVsTargetRps
    )[0];

    const rekomendasi =
      gapPersen < 0 && weakestPoint
        ? `Kesenjangan terbesar pada ${weakestPoint.cplKode} (${weakestPoint.gapVsTargetRps.toFixed(
            1
          )}%). Tingkatkan asesmen terstruktur & latihan studi kasus di RPS ${course.kodeMK}.`
        : `Realisasi CPL mata kuliah ${course.kodeMK} selaras dengan target RPS (+${gapPersen.toFixed(
            1
          )}%). Dokumentasikan portofolio asesmen untuk audit LAM-Teknik.`;

    // --- PEMINDAIAN SILANG: TARGET CPL PRODI × METODE ASESMEN RPS ---
    const cpmks = course.cpmkList || [];
    const totalBobotCpmkPersen = cpmks.reduce((sum, c) => sum + (Number(c.bobotPersen) || 0), 0);
    const docOverride = smartRpsDocOverrides[course.id];

    // Kumpulkan seluruh instrumen asesmen dari metodeAsesmen CPMK & dokumen override Smart RPS
    const courseInstrumentTagsSet = new Set<CanonicalAssessmentTag>();
    const rawMethodLabelsSet = new Set<string>();

    cpmks.forEach(cpmk => {
      if (cpmk.metodeAsesmen?.trim()) {
        rawMethodLabelsSet.add(cpmk.metodeAsesmen.trim());
        const tags = detectAssessmentTags(cpmk.metodeAsesmen);
        tags.forEach(t => courseInstrumentTagsSet.add(t));
      }
    });

    if (docOverride) {
      if (docOverride.customRpsText) {
        detectAssessmentTags(docOverride.customRpsText).forEach(t =>
          courseInstrumentTagsSet.add(t)
        );
      }
      (docOverride.addedAssessmentIds || []).forEach(catId => {
        const catDef = OBE_ASSESSMENT_CATEGORIES.find(c => c.id === catId);
        if (catDef) {
          rawMethodLabelsSet.add(catDef.shortLabel);
        }
        if (catId === 'KUIS' || catId === 'UTS' || catId === 'UAS') {
          courseInstrumentTagsSet.add('UJIAN_TERTULIS');
        } else if (catId === 'TUGAS') {
          courseInstrumentTagsSet.add('TUGAS_PERHITUNGAN');
        } else if (catId === 'CASE_METHOD') {
          courseInstrumentTagsSet.add('CASE_METHOD');
        } else if (catId === 'PROJECT') {
          courseInstrumentTagsSet.add('PROYEK_TB');
        } else if (catId === 'PRAKTIKUM') {
          courseInstrumentTagsSet.add('PRAKTIKUM_LAB');
        } else if (catId === 'PRESENTASI') {
          courseInstrumentTagsSet.add('PRESENTASI_SEMINAR');
        }
      });
    }

    const detectedInstrumentLabels = Array.from(courseInstrumentTagsSet).map(
      tag => CANONICAL_TAG_LABELS[tag]
    );

    // Evaluasi setiap target CPL prodi yang dipetakan pada MK (prioritaskan Strong/Medium; fallback ke Low jika kosong)
    const mappedCplsPriority = cplItems.filter(cpl => {
      const lvl = course.pemetaanCpl?.[cpl.kode];
      return lvl === 'Strong' || lvl === 'Medium';
    });
    const targetCplsToScan =
      mappedCplsPriority.length > 0
        ? mappedCplsPriority
        : cplItems.filter(cpl => (course.pemetaanCpl?.[cpl.kode] || 'None') !== 'None');

    const crossScanFindings: CplAssessmentCrossMatchItem[] = targetCplsToScan.map(prodiCpl => {
      const cplDef = cplsObe.find(c => c.kode === prodiCpl.kode) || {
        kode: prodiCpl.kode,
        ranah: (prodiCpl.ranah as CplItemObe['ranah']) || 'Penguasaan Pengetahuan',
        judul: prodiCpl.judul,
        deskripsi: prodiCpl.judul,
        targetKetercapaianMinimal: prodiCpl.targetKurikulumPersen
      };
      const levelKontribusi: LevelKontribusiCpl =
        course.pemetaanCpl?.[prodiCpl.kode] || 'Medium';

      const matchingCpmks = cpmks.filter(c =>
        (c.cplTerkait || []).includes(prodiCpl.kode)
      );
      const terhubungCpmk = matchingCpmks.length > 0;
      const cpmkPendukung = matchingCpmks.map(c => c.kode);
      const bobotAsesmenPersen = matchingCpmks.reduce(
        (sum, c) => sum + (Number(c.bobotPersen) || 0),
        0
      );

      const linkedTagsSet = new Set<CanonicalAssessmentTag>();
      const linkedMethodsSet = new Set<string>();
      matchingCpmks.forEach(c => {
        if (c.metodeAsesmen?.trim()) {
          linkedMethodsSet.add(c.metodeAsesmen.trim());
          detectAssessmentTags(c.metodeAsesmen).forEach(t =>
            linkedTagsSet.add(t)
          );
        }
      });

      // Sertakan override dokumen Smart RPS sebagai instrumen tambahan bila ada
      if (docOverride) {
        if (docOverride.customRpsText) {
          detectAssessmentTags(docOverride.customRpsText).forEach(t =>
            linkedTagsSet.add(t)
          );
        }
        (docOverride.addedAssessmentIds || []).forEach(catId => {
          if (catId === 'CASE_METHOD') linkedTagsSet.add('CASE_METHOD');
          if (catId === 'PROJECT') linkedTagsSet.add('PROYEK_TB');
          if (catId === 'PRAKTIKUM') linkedTagsSet.add('PRAKTIKUM_LAB');
          if (catId === 'PRESENTASI') linkedTagsSet.add('PRESENTASI_SEMINAR');
        });
      }

      const { preferredTags, instrumenIdeal } = getPreferredInstrumentsForCpl(cplDef);
      const linkedHasPreferred = preferredTags.some(t => linkedTagsSet.has(t));
      const courseHasPreferred = preferredTags.some(t => courseInstrumentTagsSet.has(t));

      let skorButir = 50;
      let statusKeselarasanButir: CplAssessmentCrossMatchItem['statusKeselarasanButir'] = 'PARSIAL';
      let catatanPemindaian = '';

      if (terhubungCpmk && linkedHasPreferred) {
        const weightSufficient =
          levelKontribusi !== 'Strong' || bobotAsesmenPersen >= 25;
        skorButir = weightSufficient ? 94 : 83;
        statusKeselarasanButir = 'SELARAS';
        catatanPemindaian = weightSufficient
          ? `Asesmen RPS (${Array.from(linkedMethodsSet).join(', ')}) terhubung via ${cpmkPendukung.join(', ')} dan sesuai ranah ${cplDef.ranah}.`
          : `Metode asesmen selaras (${Array.from(linkedMethodsSet).join(', ')}), namun bobot CPMK (${bobotAsesmenPersen}%) disarankan ≥25% untuk target Strong.`;
      } else if (terhubungCpmk && !linkedHasPreferred) {
        skorButir = levelKontribusi === 'Strong' ? 54 : 64;
        statusKeselarasanButir = 'PARSIAL';
        catatanPemindaian = `${prodiCpl.kode} (${cplDef.ranah}, ${levelKontribusi}) baru diukur dengan ${Array.from(linkedMethodsSet).join(', ') || 'tes tulis'}; perlu ditambah ${instrumenIdeal}.`;
      } else if (!terhubungCpmk && courseHasPreferred) {
        skorButir = levelKontribusi === 'Strong' ? 48 : 60;
        statusKeselarasanButir = 'PARSIAL';
        catatanPemindaian = `RPS memiliki instrumen relevan, tetapi ${prodiCpl.kode} (${levelKontribusi}) belum ditautkan ke CPMK mana pun di RPS.`;
      } else {
        skorButir = levelKontribusi === 'Strong' ? 28 : 42;
        statusKeselarasanButir = 'TIDAK_SELARAS';
        catatanPemindaian = `Belum ditemukan tautan CPMK maupun metode asesmen ${instrumenIdeal} untuk memenuhi target ${prodiCpl.kode} (${prodiCpl.targetRpsPersen.toFixed(0)}%).`;
      }

      return {
        cplKode: prodiCpl.kode,
        cplJudul: prodiCpl.judul,
        ranah: cplDef.ranah,
        levelKontribusi,
        targetCplProdiPersen: prodiCpl.targetRpsPersen,
        terhubungCpmk,
        cpmkPendukung,
        bobotAsesmenPersen,
        metodeAsesmenTerkait:
          linkedMethodsSet.size > 0
            ? Array.from(linkedMethodsSet)
            : Array.from(rawMethodLabelsSet).slice(0, 2),
        instrumenIdeal,
        statusKeselarasanButir,
        skorButir,
        catatanPemindaian
      };
    });

    // Hitung Skor Kualitas Keselarasan Akhir (skala bulat 1-100)
    const weightByLevel: Record<LevelKontribusiCpl, number> = {
      Strong: 1.0,
      Medium: 0.7,
      Low: 0.35,
      None: 0
    };
    const sumWeights = crossScanFindings.reduce(
      (s, f) => s + (weightByLevel[f.levelKontribusi] || 0.5),
      0
    );
    const weightedItemScore =
      sumWeights > 0
        ? crossScanFindings.reduce(
            (s, f) => s + f.skorButir * (weightByLevel[f.levelKontribusi] || 0.5),
            0
          ) / sumWeights
        : 70;

    let rawAlignmentScore = weightedItemScore;

    // Faktor cakupan tautan CPL-CPMK, kelengkapan bobot, dan variasi asesmen OBE
    const linkedCplRatio =
      crossScanFindings.length > 0
        ? crossScanFindings.filter(f => f.terhubungCpmk).length / crossScanFindings.length
        : 1;
    if (linkedCplRatio < 0.75) {
      rawAlignmentScore -= Math.round((0.75 - linkedCplRatio) * 14);
    }
    if (Math.abs(totalBobotCpmkPersen - 100) > 2) {
      rawAlignmentScore -= 8;
    }
    if (courseInstrumentTagsSet.size < 2) {
      rawAlignmentScore -= 10;
    } else if (
      courseInstrumentTagsSet.size >= 3 &&
      (['PROYEK_TB', 'CASE_METHOD', 'PRAKTIKUM_LAB', 'PRESENTASI_SEMINAR', 'OBSERVASI_SIKAP'] as CanonicalAssessmentTag[]).some(
        t => courseInstrumentTagsSet.has(t)
      )
    ) {
      rawAlignmentScore += 3;
    }
    if (gapPersen < -5) {
      rawAlignmentScore -= 3;
    } else if (gapPersen >= 1.5) {
      rawAlignmentScore += 2;
    }

    const keselarasanSkor = Math.max(1, Math.min(100, Math.round(rawAlignmentScore)));
    const {
      statusPenyesuaian,
      statusPenyesuaianLabel,
      butuhPenyesuaian
    } = classifyCrossScanStatus(keselarasanSkor);

    const alignedCplCount = crossScanFindings.filter(
      f => f.statusKeselarasanButir === 'SELARAS'
    ).length;
    const totalMappedCplCount = crossScanFindings.length;
    const mismatchedFindings = crossScanFindings.filter(
      f => f.statusKeselarasanButir !== 'SELARAS'
    );
    const mismatchedCplCodes = mismatchedFindings.map(f => f.cplKode);

    const worstFinding = [...mismatchedFindings].sort((a, b) => a.skorButir - b.skorButir)[0];
    const saranPenyesuaian = butuhPenyesuaian
      ? worstFinding
        ? `Tambahkan instrumen ${worstFinding.instrumenIdeal} pada CPMK pendukung ${mismatchedCplCodes.slice(0, 3).join(', ')} agar target CPL prodi terukur penuh.`
        : `Lengkapi pemetaan CPMK–CPL dan variasi rubrik asesmen OBE (total bobot saat ini ${totalBobotCpmkPersen}%).`
      : `Seluruh ${alignedCplCount}/${totalMappedCplCount} target CPL utama selaras dengan metode asesmen RPS (${detectedInstrumentLabels.slice(0, 3).join(', ')}).`;

    return {
      course,
      targetKurikulumPersen,
      targetRpsPersen,
      realisasiCplPersen,
      gapPersen,
      statusKinerja,
      statusLabel,
      radarPoints,
      rekomendasi,
      keselarasanSkor,
      statusPenyesuaian,
      statusPenyesuaianLabel,
      butuhPenyesuaian,
      detectedInstrumentLabels,
      totalBobotCpmkPersen,
      alignedCplCount,
      totalMappedCplCount,
      mismatchedCplCodes,
      crossScanFindings,
      saranPenyesuaian
    };
  });

  // 3. Aggregate KPIs
  const avgRealisasiLapangan =
    cplItems.length > 0
      ? round1(
          cplItems.reduce((s, i) => s + i.realisasiLapanganPersen, 0) / cplItems.length
        )
      : 0;
  const avgTargetRps =
    cplItems.length > 0
      ? round1(cplItems.reduce((s, i) => s + i.targetRpsPersen, 0) / cplItems.length)
      : 0;
  const avgTargetKurikulum =
    cplItems.length > 0
      ? round1(
          cplItems.reduce((s, i) => s + i.targetKurikulumPersen, 0) / cplItems.length
        )
      : 0;
  const avgGapVsTargetRps = round1(avgRealisasiLapangan - avgTargetRps);
  const avgGapVsKurikulum = round1(avgRealisasiLapangan - avgTargetKurikulum);

  const compliantCplCount = cplItems.filter(i => i.gapVsTargetRps >= 0).length;
  const gapCplCount = cplItems.filter(i => i.gapVsTargetRps < 0).length;
  const criticalCplCount = cplItems.filter(
    i => i.statusKinerja === 'KESENJANGAN_KRITIS'
  ).length;

  const compliantCourseCount = courseItems.filter(c => c.gapPersen >= 0).length;
  const gapCourseCount = courseItems.filter(c => c.gapPersen < 0).length;

  const alignmentIndexPersen =
    cplItems.length > 0
      ? Math.round((compliantCplCount / cplItems.length) * 100)
      : 0;

  const avgKeselarasanSkor =
    courseItems.length > 0
      ? Math.round(
          courseItems.reduce((s, c) => s + c.keselarasanSkor, 0) / courseItems.length
        )
      : 0;
  const alignedAlignmentCourseCount = courseItems.filter(
    c => c.statusPenyesuaian === 'SELARAS'
  ).length;
  const needsAdjustmentCourseCount = courseItems.filter(
    c => c.butuhPenyesuaian
  ).length;
  const criticalAdjustmentCourseCount = courseItems.filter(
    c => c.statusPenyesuaian === 'PRIORITAS_REVISI'
  ).length;

  const sortedByGap = [...cplItems].sort(
    (a, b) => a.gapVsTargetRps - b.gapVsTargetRps
  );

  return {
    avgRealisasiLapangan,
    avgTargetRps,
    avgTargetKurikulum,
    avgGapVsTargetRps,
    avgGapVsKurikulum,
    compliantCplCount,
    gapCplCount,
    criticalCplCount,
    compliantCourseCount,
    gapCourseCount,
    alignmentIndexPersen,
    avgKeselarasanSkor,
    alignedAlignmentCourseCount,
    needsAdjustmentCourseCount,
    criticalAdjustmentCourseCount,
    cplItems,
    courseItems,
    weakestCpl: sortedByGap[0] || null,
    strongestCpl: sortedByGap[sortedByGap.length - 1] || null
  };
}
