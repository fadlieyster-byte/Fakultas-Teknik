import { CplItemObe, LevelKontribusiCpl, MataKuliahCplMatrixRecord } from '../types/index';
import { initialLmsKelasList } from '../data/mockLmsData';

export type AssessmentCategoryId =
  | 'KUIS'
  | 'TUGAS'
  | 'UTS'
  | 'UAS'
  | 'CASE_METHOD'
  | 'PROJECT'
  | 'PRAKTIKUM'
  | 'PRESENTASI';

export interface AssessmentCategoryDef {
  id: AssessmentCategoryId;
  label: string;
  shortLabel: string;
  obeAuthentic: boolean;
  supportedDomains: Array<'Sikap' | 'Penguasaan Pengetahuan' | 'Keterampilan Umum' | 'Keterampilan Khusus'>;
  sampleSnippet: string;
}

export const OBE_ASSESSMENT_CATEGORIES: AssessmentCategoryDef[] = [
  {
    id: 'KUIS',
    label: 'Kuis / Tes Formatif',
    shortLabel: 'Kuis',
    obeAuthentic: false,
    supportedDomains: ['Penguasaan Pengetahuan'],
    sampleSnippet: 'Kuis Formatif Evaluasi Konsep'
  },
  {
    id: 'TUGAS',
    label: 'Tugas Mandiri / Terstruktur',
    shortLabel: 'Tugas',
    obeAuthentic: false,
    supportedDomains: ['Penguasaan Pengetahuan', 'Keterampilan Khusus', 'Keterampilan Umum'],
    sampleSnippet: 'Tugas Terstruktur & Rubrik Perhitungan'
  },
  {
    id: 'UTS',
    label: 'Ujian Tengah Semester (UTS)',
    shortLabel: 'UTS',
    obeAuthentic: false,
    supportedDomains: ['Penguasaan Pengetahuan'],
    sampleSnippet: 'UTS Evaluasi Tengah Semester'
  },
  {
    id: 'UAS',
    label: 'Ujian Akhir Semester (UAS)',
    shortLabel: 'UAS',
    obeAuthentic: false,
    supportedDomains: ['Penguasaan Pengetahuan'],
    sampleSnippet: 'UAS Ujian Komprehensif'
  },
  {
    id: 'CASE_METHOD',
    label: 'Studi Kasus (Case Method)',
    shortLabel: 'Studi Kasus',
    obeAuthentic: true,
    supportedDomains: ['Sikap', 'Penguasaan Pengetahuan', 'Keterampilan Umum', 'Keterampilan Khusus'],
    sampleSnippet: 'Studi Kasus / Case Method Lapangan'
  },
  {
    id: 'PROJECT',
    label: 'Proyek / Tugas Besar (Team-Based)',
    shortLabel: 'Proyek / TB',
    obeAuthentic: true,
    supportedDomains: ['Sikap', 'Penguasaan Pengetahuan', 'Keterampilan Umum', 'Keterampilan Khusus'],
    sampleSnippet: 'Tugas Besar & Team-Based Project'
  },
  {
    id: 'PRAKTIKUM',
    label: 'Praktikum / Uji Kinerja & Simulasi',
    shortLabel: 'Praktikum / Lab',
    obeAuthentic: true,
    supportedDomains: ['Sikap', 'Penguasaan Pengetahuan', 'Keterampilan Khusus'],
    sampleSnippet: 'Praktikum Lab / Uji Kinerja & Logbook'
  },
  {
    id: 'PRESENTASI',
    label: 'Presentasi / Seminar & Laporan',
    shortLabel: 'Presentasi / Lap',
    obeAuthentic: true,
    supportedDomains: ['Sikap', 'Keterampilan Umum', 'Keterampilan Khusus'],
    sampleSnippet: 'Presentasi Teknis & Laporan Ilmiah'
  }
];

export interface DetectedAssessmentDetail {
  category: AssessmentCategoryDef;
  matchedKeywords: string[];
  linkedCplCodes: string[];
  supportedCplCodes: string[];
  supportsMappedCpl: boolean;
  estimatedWeightPercent: number;
  sourceClause: string;
}

export interface SmartRpsDocumentOverride {
  fileName?: string;
  customRpsText: string;
  addedAssessmentIds?: AssessmentCategoryId[];
  updatedAt: string;
}

export type SmartRpsValidationStatus =
  | 'MEMENUHI_MIN_3_OBE'
  | 'PERLU_PENGUATAN_CPL'
  | 'TIDAK_MEMENUHI';

export interface SmartRpsCourseAuditResult {
  course: MataKuliahCplMatrixRecord;
  documentCode: string;
  documentSourceType: 'LMS Terhubung' | 'Dokumen Unggahan Auditor' | 'Repositori Kurikulum OBE';
  documentUrl?: string;
  scannedRawText: string;
  detectedAssessments: DetectedAssessmentDetail[];
  cplSupportingAssessments: DetectedAssessmentDetail[];
  totalDetectedCount: number;
  cplSupportingCount: number;
  mappedStrongMediumCpls: Array<{
    cpl: CplItemObe;
    level: LevelKontribusiCpl;
    isSupportedByAssessment: boolean;
    supportingAssessmentLabels: string[];
  }>;
  coveredCplCount: number;
  totalMappedCplCount: number;
  totalCpmkWeightPercent: number;
  hasAuthenticObeAssessment: boolean;
  validationStatus: SmartRpsValidationStatus;
  validationLabel: string;
  missingAssessmentSuggestions: Array<{
    category: AssessmentCategoryDef;
    reason: string;
    recommendedWeightPercent: number;
  }>;
  customOverride?: SmartRpsDocumentOverride;
}

export interface SmartRpsProdiAuditSummary {
  totalCourses: number;
  compliantCount: number;
  needsStrengtheningCount: number;
  nonCompliantCount: number;
  complianceRatePercent: number;
  avgAssessmentTypesPerCourse: number;
  avgCplSupportingPerCourse: number;
  categoryFrequency: Array<{
    id: AssessmentCategoryId;
    label: string;
    shortLabel: string;
    courseCount: number;
    obeAuthentic: boolean;
  }>;
  semesterBreakdown: Array<{
    semesterGroup: string;
    memenuhi: number;
    perluPenguatan: number;
    tidakMemenuhi: number;
  }>;
  items: SmartRpsCourseAuditResult[];
}

function matchAssessmentCategoriesFromText(rawText: string): Array<{
  category: AssessmentCategoryDef;
  matchedKeywords: string[];
}> {
  const lower = rawText.toLowerCase();
  const matched: Array<{ category: AssessmentCategoryDef; matchedKeywords: string[] }> = [];

  const check = (id: AssessmentCategoryId, patterns: string[]) => {
    const hits = patterns.filter(p => lower.includes(p));
    if (hits.length > 0) {
      const cat = OBE_ASSESSMENT_CATEGORIES.find(c => c.id === id);
      if (cat) matched.push({ category: cat, matchedKeywords: hits });
    }
  };

  check('KUIS', ['kuis', 'quiz', 'tes formatif', 'evaluasi formatif']);

  // Match structured assignments without falsely counting "tugas besar" or "tugas akhir" as plain "tugas"
  const strippedForPlainTugas = lower
    .replace(/tugas besar/g, '')
    .replace(/tugas akhir/g, '');
  const tugasPatterns = [
    'tugas terstruktur',
    'tugas mandiri',
    'tugas latihan',
    'tugas perhitungan',
    'tugas proyeksi',
    'tugas gambar',
    'tugas desain',
    'tugas esai',
    'makalah',
    'rubrik perhitungan'
  ];
  const plainTugasHits = tugasPatterns.filter(p => strippedForPlainTugas.includes(p));
  if (
    plainTugasHits.length > 0 ||
    (/\btugas\b/.test(strippedForPlainTugas) && !strippedForPlainTugas.includes('tugas besar'))
  ) {
    const cat = OBE_ASSESSMENT_CATEGORIES.find(c => c.id === 'TUGAS')!;
    matched.push({
      category: cat,
      matchedKeywords: plainTugasHits.length > 0 ? plainTugasHits : ['tugas']
    });
  }

  check('UTS', ['uts', 'ujian tengah semester']);
  check('UAS', ['uas', 'ujian akhir semester', 'ujian tulis']);
  check('CASE_METHOD', ['studi kasus', 'kajian kasus', 'case method', 'case study', 'problem based', 'kasus ']);
  check('PROJECT', [
    'tugas besar',
    'team-based project',
    'project',
    'proyek',
    'detail engineering design',
    'prototype',
    'prototipe',
    'perancangan alat',
    'desain bioreaktor',
    'desain sekat kanal',
    'gambar perencanaan',
    'audit kualitas daya'
  ]);
  check('PRAKTIKUM', [
    'praktikum',
    'responsi',
    'uji kinerja',
    'uji praktik',
    'uji fungsi',
    'bengkel',
    'simulasi',
    'observasi',
    'logbook'
  ]);
  check('PRESENTASI', [
    'presentasi',
    'seminar',
    'laporan ilmiah',
    'laporan kajian',
    'laporan logbook',
    'sidang',
    'diskusi'
  ]);

  return matched;
}

function buildSynthesizedRpsDocumentText(
  course: MataKuliahCplMatrixRecord,
  cpls: CplItemObe[],
  lmsRefUrl?: string
): string {
  const mappedNames = cpls
    .filter(c => course.pemetaanCpl[c.kode] === 'Strong' || course.pemetaanCpl[c.kode] === 'Medium')
    .map(c => `${c.kode} (${c.judul} - ${course.pemetaanCpl[c.kode]})`)
    .join('; ');

  const cpmkLines = (course.cpmkList || [])
    .map(
      cp =>
        `- ${cp.kode} [${cp.levelBloom}, Bobot ${cp.bobotPersen}%]: ${cp.deskripsi} | Instrumen Asesmen: ${cp.metodeAsesmen} | CPL Terkait: ${cp.cplTerkait.join(', ') || '-'}`
    )
    .join('\n');

  return [
    `DOKUMEN RENCANA PEMBELAJARAN SEMESTER (RPS) OBE — FT UNBARI`,
    `Mata Kuliah: ${course.kodeMK} - ${course.namaMK} (${course.sks} SKS, Sem ${course.semesterLabel || course.semester})`,
    `Dosen Pengampu: ${course.dosenPengampu}`,
    lmsRefUrl ? `Repositori LMS PDF: ${lmsRefUrl}` : `Arsip RPS Prodi: RPS-${course.prodiId}-${course.kodeMK}.pdf`,
    `CPL Dibebankan (Strong/Medium): ${mappedNames || 'Belum dipetakan'}`,
    `Rencana Asesmen & CPMK:`,
    cpmkLines || '- Belum ada rincian CPMK & metode asesmen pada RPS.',
    course.catatanKurikulum ? `Catatan Silabus: ${course.catatanKurikulum}` : ''
  ]
    .filter(Boolean)
    .join('\n');
}

function normalizeCourseName(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Smart RPS Audit:
 * Memindai setiap dokumen RPS mata kuliah, mengekstrak seluruh jenis asesmen,
 * dan memvalidasi apakah metode penilaian mencakup minimal 3 jenis asesmen
 * yang benar-benar mendukung capaian CPL sesuai standar OBE.
 */
export function runSmartRpsAudit(
  courses: MataKuliahCplMatrixRecord[],
  cpls: CplItemObe[],
  customOverrides: Record<string, SmartRpsDocumentOverride> = {}
): SmartRpsProdiAuditSummary {
  const cplByCode = new Map<string, CplItemObe>();
  cpls.forEach(c => cplByCode.set(c.kode, c));

  const items: SmartRpsCourseAuditResult[] = courses.map(course => {
    const override = customOverrides[course.id];
    const normName = normalizeCourseName(course.namaMK);
    const matchedLms = initialLmsKelasList.find(
      lms =>
        lms.prodiId === course.prodiId &&
        (lms.kodeMK.toLowerCase() === course.kodeMK.toLowerCase() ||
          normalizeCourseName(lms.namaMK).includes(normName.slice(0, 12)))
    );

    const addedSnippets = (override?.addedAssessmentIds || [])
      .map(id => OBE_ASSESSMENT_CATEGORIES.find(c => c.id === id)?.sampleSnippet)
      .filter(Boolean) as string[];

    const baseSynthesized = buildSynthesizedRpsDocumentText(
      course,
      cpls,
      matchedLms?.silabusRpsUrl
    );
    const scannedRawText = override?.customRpsText?.trim()
      ? [override.customRpsText.trim(), addedSnippets.length > 0 ? `Tambahan Asesmen OBE: ${addedSnippets.join(', ')}` : '']
          .filter(Boolean)
          .join('\n')
      : [baseSynthesized, addedSnippets.length > 0 ? `Tambahan Asesmen OBE: ${addedSnippets.join(', ')}` : '']
          .filter(Boolean)
          .join('\n');

    const documentCode =
      override?.fileName?.trim() ||
      (matchedLms?.silabusRpsUrl
        ? matchedLms.silabusRpsUrl.split('/').pop() || `RPS-${course.kodeMK}.pdf`
        : `RPS-${course.prodiId}-${course.kodeMK.replace(/\*/g, '')}.pdf`);

    const documentSourceType: SmartRpsCourseAuditResult['documentSourceType'] = override?.customRpsText
      ? 'Dokumen Unggahan Auditor'
      : matchedLms?.silabusRpsUrl
      ? 'LMS Terhubung'
      : 'Repositori Kurikulum OBE';

    const mappedStrongMedium = cpls
      .map(cpl => ({
        cpl,
        level: course.pemetaanCpl[cpl.kode] || ('None' as LevelKontribusiCpl)
      }))
      .filter(entry => entry.level === 'Strong' || entry.level === 'Medium');

    const mappedCodeSet = new Set(mappedStrongMedium.map(m => m.cpl.kode));

    // Scan CPMKs line-by-line + additional uploaded RPS assessment text
    const categoryMap = new Map<
      AssessmentCategoryId,
      {
        category: AssessmentCategoryDef;
        matchedKeywords: Set<string>;
        linkedCpls: Set<string>;
        weightSum: number;
        sources: string[];
      }
    >();

    const registerDetection = (
      cat: AssessmentCategoryDef,
      keywords: string[],
      linkedCplCodes: string[],
      weight: number,
      source: string
    ) => {
      const existing = categoryMap.get(cat.id);
      if (existing) {
        keywords.forEach(k => existing.matchedKeywords.add(k));
        linkedCplCodes.forEach(c => existing.linkedCpls.add(c));
        existing.weightSum += weight;
        if (!existing.sources.includes(source)) existing.sources.push(source);
      } else {
        categoryMap.set(cat.id, {
          category: cat,
          matchedKeywords: new Set(keywords),
          linkedCpls: new Set(linkedCplCodes),
          weightSum: weight,
          sources: [source]
        });
      }
    };

    const hasCustomTextOverride =
      Boolean(override?.customRpsText?.trim()) &&
      override!.customRpsText.trim() !== baseSynthesized.trim();

    if (hasCustomTextOverride) {
      const lines = override!.customRpsText.split(/\r?\n/);
      const defaultMappedCpls = mappedStrongMedium.map(m => m.cpl.kode);

      lines.forEach((line, lineIdx) => {
        const cleanLine = line.trim();
        if (!cleanLine) return;
        // Skip header metadata lines so course title keywords don't falsely trigger assessments
        if (
          cleanLine.startsWith('DOKUMEN RENCANA PEMBELAJARAN') ||
          cleanLine.startsWith('Mata Kuliah:') ||
          cleanLine.startsWith('Dosen Pengampu:') ||
          cleanLine.startsWith('Repositori LMS') ||
          cleanLine.startsWith('Arsip RPS Prodi:') ||
          cleanLine.startsWith('CPL Dibebankan')
        ) {
          return;
        }

        const hits = matchAssessmentCategoriesFromText(cleanLine);
        if (hits.length === 0) return;

        const cplCodesInLine = (cleanLine.match(/CPL-\d{2}/gi) || [])
          .map(code => code.toUpperCase())
          .filter(code => mappedCodeSet.has(code));
        const bobotMatch = cleanLine.match(/(\d{1,3})\s*%/);
        const lineWeight = bobotMatch ? parseInt(bobotMatch[1], 10) : 20;
        const shareWeight = Math.round(lineWeight / hits.length);
        const linkedCpls = cplCodesInLine.length > 0 ? cplCodesInLine : defaultMappedCpls;

        hits.forEach(h => {
          registerDetection(
            h.category,
            h.matchedKeywords,
            linkedCpls,
            shareWeight,
            `Baris RPS #${lineIdx + 1}: ${cleanLine.slice(0, 64)}`
          );
        });
      });
    } else {
      (course.cpmkList || []).forEach(cp => {
        const hits = matchAssessmentCategoriesFromText(cp.metodeAsesmen);
        const validCpls = cp.cplTerkait.filter(code => mappedCodeSet.has(code));
        const shareWeight = hits.length > 0 ? Math.round((cp.bobotPersen || 0) / hits.length) : 0;

        hits.forEach(h => {
          registerDetection(
            h.category,
            h.matchedKeywords,
            validCpls,
            shareWeight,
            `${cp.kode}: ${cp.metodeAsesmen}`
          );
        });
      });
    }

    if (addedSnippets.length > 0) {
      const addedHits = matchAssessmentCategoriesFromText(addedSnippets.join(', '));
      const fallbackLinked = mappedStrongMedium.map(m => m.cpl.kode);
      addedHits.forEach(h => {
        if (!categoryMap.has(h.category.id)) {
          registerDetection(
            h.category,
            h.matchedKeywords,
            fallbackLinked,
            20,
            'Pembaruan Asesmen OBE'
          );
        }
      });
    }

    // Evaluate each detected assessment against OBE CPL domain alignment
    const detectedAssessments: DetectedAssessmentDetail[] = Array.from(categoryMap.values()).map(
      entry => {
        const linkedArray = Array.from(entry.linkedCpls);
        const supportedCplCodes = linkedArray.filter(code => {
          const cplDef = cplByCode.get(code);
          if (!cplDef) return false;
          return entry.category.supportedDomains.includes(cplDef.ranah);
        });

        // For non-mapped text overrides, allow domain fit with Strong/Medium CPLs if explicitly linked
        const supportsMappedCpl = supportedCplCodes.length > 0;

        return {
          category: entry.category,
          matchedKeywords: Array.from(entry.matchedKeywords),
          linkedCplCodes: linkedArray,
          supportedCplCodes,
          supportsMappedCpl,
          estimatedWeightPercent: Math.min(100, entry.weightSum),
          sourceClause: entry.sources.join(' | ')
        };
      }
    );

    const cplSupportingAssessments = detectedAssessments.filter(d => d.supportsMappedCpl);
    const totalDetectedCount = detectedAssessments.length;
    const cplSupportingCount = cplSupportingAssessments.length;

    const mappedStrongMediumCpls = mappedStrongMedium.map(({ cpl, level }) => {
      const supporting = cplSupportingAssessments.filter(a =>
        a.supportedCplCodes.includes(cpl.kode)
      );
      return {
        cpl,
        level,
        isSupportedByAssessment: supporting.length > 0,
        supportingAssessmentLabels: supporting.map(s => s.category.shortLabel)
      };
    });

    const coveredCplCount = mappedStrongMediumCpls.filter(c => c.isSupportedByAssessment).length;
    const totalMappedCplCount = mappedStrongMediumCpls.length;
    const totalCpmkWeightPercent = (course.cpmkList || []).reduce(
      (sum, cp) => sum + (cp.bobotPersen || 0),
      0
    );
    const hasAuthenticObeAssessment = cplSupportingAssessments.some(
      a => a.category.obeAuthentic
    );
    const uncoveredStrongCount = mappedStrongMediumCpls.filter(
      c => c.level === 'Strong' && !c.isSupportedByAssessment
    ).length;

    let validationStatus: SmartRpsValidationStatus = 'MEMENUHI_MIN_3_OBE';
    let validationLabel = 'Memenuhi (≥ 3 Asesmen OBE)';

    if (totalDetectedCount < 3 || cplSupportingCount < 2) {
      validationStatus = 'TIDAK_MEMENUHI';
      validationLabel =
        totalDetectedCount < 3
          ? `Gagal (${totalDetectedCount}/3 Jenis Asesmen)`
          : `Gagal (${cplSupportingCount}/3 Dukung CPL)`;
    } else if (
      cplSupportingCount < 3 ||
      uncoveredStrongCount > 0 ||
      !hasAuthenticObeAssessment
    ) {
      validationStatus = 'PERLU_PENGUATAN_CPL';
      validationLabel =
        cplSupportingCount < 3
          ? `Penguatan (${cplSupportingCount}/3 Dukung CPL)`
          : !hasAuthenticObeAssessment
          ? 'Perlu Asesmen Autentik OBE'
          : `${uncoveredStrongCount} CPL Strong Belum Terukur`;
    }

    // Build concrete suggestions for missing / strengthening assessment types
    const detectedIds = new Set(detectedAssessments.map(d => d.category.id));
    const missingAssessmentSuggestions: SmartRpsCourseAuditResult['missingAssessmentSuggestions'] =
      [];

    if (!detectedIds.has('CASE_METHOD')) {
      const caseCat = OBE_ASSESSMENT_CATEGORIES.find(c => c.id === 'CASE_METHOD')!;
      missingAssessmentSuggestions.push({
        category: caseCat,
        reason:
          'Memenuhi standar IKU-7 & mendukung penguasaan ranah Sikap, Keterampilan Khusus, dan Analisis C4 secara sekaligus.',
        recommendedWeightPercent: 25
      });
    }
    if (!detectedIds.has('PROJECT')) {
      const projCat = OBE_ASSESSMENT_CATEGORIES.find(c => c.id === 'PROJECT')!;
      missingAssessmentSuggestions.push({
        category: projCat,
        reason:
          'Mengukur capaian perancangan/Team-Based Project (C5/P4) untuk CPL Keterampilan Khusus & Kerjasama Tim.',
        recommendedWeightPercent: 30
      });
    }
    if (!detectedIds.has('PRESENTASI') && mappedStrongMediumCpls.some(c => c.cpl.ranah === 'Keterampilan Umum' && !c.isSupportedByAssessment)) {
      const presCat = OBE_ASSESSMENT_CATEGORIES.find(c => c.id === 'PRESENTASI')!;
      missingAssessmentSuggestions.push({
        category: presCat,
        reason:
          'Diperlukan untuk memvalidasi CPL ranah Keterampilan Umum (komunikasi ilmiah & presentasi proyek).',
        recommendedWeightPercent: 15
      });
    }
    if (!detectedIds.has('KUIS')) {
      const kuisCat = OBE_ASSESSMENT_CATEGORIES.find(c => c.id === 'KUIS')!;
      missingAssessmentSuggestions.push({
        category: kuisCat,
        reason:
          'Menambah variasi asesmen formatif berkala untuk memantau penguasaan pengetahuan sejak minggu awal.',
        recommendedWeightPercent: 15
      });
    }
    if (!detectedIds.has('TUGAS')) {
      const tugasCat = OBE_ASSESSMENT_CATEGORIES.find(c => c.id === 'TUGAS')!;
      missingAssessmentSuggestions.push({
        category: tugasCat,
        reason:
          'Melengkapi portofolio latihan analitis dan tugas terstruktur dengan rubrik penilaian CPL.',
        recommendedWeightPercent: 20
      });
    }

    return {
      course,
      documentCode,
      documentSourceType,
      documentUrl: matchedLms?.silabusRpsUrl,
      scannedRawText,
      detectedAssessments,
      cplSupportingAssessments,
      totalDetectedCount,
      cplSupportingCount,
      mappedStrongMediumCpls,
      coveredCplCount,
      totalMappedCplCount,
      totalCpmkWeightPercent,
      hasAuthenticObeAssessment,
      validationStatus,
      validationLabel,
      missingAssessmentSuggestions: missingAssessmentSuggestions.slice(0, 4),
      customOverride: override
    };
  });

  const totalCourses = items.length;
  const compliantCount = items.filter(
    i => i.validationStatus === 'MEMENUHI_MIN_3_OBE'
  ).length;
  const needsStrengtheningCount = items.filter(
    i => i.validationStatus === 'PERLU_PENGUATAN_CPL'
  ).length;
  const nonCompliantCount = items.filter(
    i => i.validationStatus === 'TIDAK_MEMENUHI'
  ).length;

  const complianceRatePercent =
    totalCourses > 0 ? Math.round((compliantCount / totalCourses) * 100) : 0;
  const avgAssessmentTypesPerCourse =
    totalCourses > 0
      ? Math.round(
          (items.reduce((s, i) => s + i.totalDetectedCount, 0) / totalCourses) * 10
        ) / 10
      : 0;
  const avgCplSupportingPerCourse =
    totalCourses > 0
      ? Math.round(
          (items.reduce((s, i) => s + i.cplSupportingCount, 0) / totalCourses) * 10
        ) / 10
      : 0;

  const categoryFrequency = OBE_ASSESSMENT_CATEGORIES.map(cat => ({
    id: cat.id,
    label: cat.label,
    shortLabel: cat.shortLabel,
    obeAuthentic: cat.obeAuthentic,
    courseCount: items.filter(i =>
      i.detectedAssessments.some(d => d.category.id === cat.id)
    ).length
  }));

  const semGroups = ['Sem 1–2', 'Sem 3–4', 'Sem 5–6', 'Sem 7–8', 'Lainnya/B/K'];
  const getGroup = (sem: number) => {
    if (sem === 1 || sem === 2) return 'Sem 1–2';
    if (sem === 3 || sem === 4) return 'Sem 3–4';
    if (sem === 5 || sem === 6) return 'Sem 5–6';
    if (sem === 7 || sem === 8) return 'Sem 7–8';
    return 'Lainnya/B/K';
  };

  const semesterBreakdown = semGroups
    .map(group => {
      const groupItems = items.filter(i => getGroup(i.course.semester) === group);
      return {
        semesterGroup: group,
        memenuhi: groupItems.filter(i => i.validationStatus === 'MEMENUHI_MIN_3_OBE').length,
        perluPenguatan: groupItems.filter(i => i.validationStatus === 'PERLU_PENGUATAN_CPL').length,
        tidakMemenuhi: groupItems.filter(i => i.validationStatus === 'TIDAK_MEMENUHI').length
      };
    })
    .filter(b => b.memenuhi + b.perluPenguatan + b.tidakMemenuhi > 0);

  return {
    totalCourses,
    compliantCount,
    needsStrengtheningCount,
    nonCompliantCount,
    complianceRatePercent,
    avgAssessmentTypesPerCourse,
    avgCplSupportingPerCourse,
    categoryFrequency,
    semesterBreakdown,
    items
  };
}
