import { CplItemObe, LevelKontribusiCpl, MataKuliahCplMatrixRecord } from '../types/index';

export type QualityGrade = 'A' | 'B' | 'C' | 'D';
export type QualityStatus =
  | 'UNGGUL_OBE'
  | 'SELARAS_OBE'
  | 'PERLU_REVISI_METODE'
  | 'TIDAK_SELARAS';

export interface CplMethodAlignmentCheck {
  cplKode: string;
  cplJudul: string;
  ranah: string;
  level: LevelKontribusiCpl;
  isCoveredInCpmk: boolean;
  expectedMethods: string[];
  matchedMethods: string[];
  status: 'SELARAS' | 'PERLU_PENGUATAN' | 'TIDAK_SELARAS';
  reason: string;
}

export interface ObeQualityRecommendation {
  id: string;
  aspek:
    | 'Metode Pembelajaran'
    | 'Standar IKU-7 (OBE)'
    | 'Taksonomi Bloom'
    | 'Keterkaitan CPL–CPMK'
    | 'Distribusi Bobot Asesmen';
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
  targetCplKode?: string;
  tindakanRps: string;
}

export interface CourseRpsQualityResult {
  course: MataKuliahCplMatrixRecord;
  totalScore: number; // 0 - 100
  grade: QualityGrade;
  status: QualityStatus;
  statusLabel: string;
  pillarScores: {
    metodeAlignment: number; // max 40
    bloomAlignment: number; // max 25
    cpmkMappingBalance: number; // max 20
    obeDocumentation: number; // max 15
  };
  detectedMethods: string[];
  hasIku7Method: boolean;
  highestBloom: string;
  cplChecks: CplMethodAlignmentCheck[];
  alignedCplCount: number;
  misalignedCplCount: number;
  weakAlignedCplCount: number;
  recommendations: ObeQualityRecommendation[];
}

export interface ProdiRpsQualitySummary {
  totalCourses: number;
  avgQualityScore: number;
  alignedCourseRatePersen: number; // score >= 75
  iku7AdoptionRatePersen: number;
  unggulCount: number; // >= 85
  selarasCount: number; // 75 - 84.9
  revisiCount: number; // 60 - 74.9
  kritisCount: number; // < 60
  pillarAverages: {
    metodeAlignment: number;
    bloomAlignment: number;
    cpmkMappingBalance: number;
    obeDocumentation: number;
  };
  items: CourseRpsQualityResult[];
}

function extractBloomNum(levelBloom: string): number {
  const u = levelBloom.toUpperCase();
  if (u.includes('C6')) return 6;
  if (u.includes('C5') || u.includes('P4') || u.includes('A5')) return 5;
  if (u.includes('C4') || u.includes('P3') || u.includes('A4')) return 4;
  if (u.includes('C3') || u.includes('P2')) return 3;
  if (u.includes('C2')) return 2;
  return 1;
}

function detectCourseMethods(course: MataKuliahCplMatrixRecord): {
  methods: string[];
  rawCombined: string;
  hasCaseMethod: boolean;
  hasProjectOrTugasBesar: boolean;
  hasLabOrPrak: boolean;
  hasPresentationOrReport: boolean;
  hasSoftwareOrSim: boolean;
  hasWrittenExam: boolean;
} {
  const cpmkMethods = (course.cpmkList || []).map(c => c.metodeAsesmen).join(' ');
  const cpmkDesc = (course.cpmkList || []).map(c => c.deskripsi).join(' ');
  const notes = course.catatanKurikulum || '';
  const name = course.namaMK || '';
  const rawCombined = `${cpmkMethods} ${cpmkDesc} ${notes} ${name} ${course.kategori}`.toLowerCase();

  const hasCaseMethod =
    rawCombined.includes('studi kasus') ||
    rawCombined.includes('case') ||
    rawCombined.includes('problem based');
  const hasProjectOrTugasBesar =
    rawCombined.includes('tugas besar') ||
    rawCombined.includes('proyek') ||
    rawCombined.includes('project') ||
    rawCombined.includes('team-based') ||
    rawCombined.includes('perancangan') ||
    rawCombined.includes('capstone') ||
    rawCombined.includes('kerja praktek') ||
    rawCombined.includes('tugas akhir') ||
    rawCombined.includes('skripsi');
  const hasLabOrPrak =
    course.kategori === 'Studio/Praktikum' ||
    rawCombined.includes('praktikum') ||
    rawCombined.includes('responsi') ||
    rawCombined.includes('bengkel') ||
    rawCombined.includes('laboratorium') ||
    rawCombined.includes('uji ');
  const hasPresentationOrReport =
    rawCombined.includes('presentasi') ||
    rawCombined.includes('seminar') ||
    rawCombined.includes('laporan') ||
    rawCombined.includes('diskusi') ||
    rawCombined.includes('komunikasi');
  const hasSoftwareOrSim =
    rawCombined.includes('bim') ||
    rawCombined.includes('cad') ||
    rawCombined.includes('software') ||
    rawCombined.includes('aplikasi komputer') ||
    rawCombined.includes('mengg.') ||
    rawCombined.includes('plc') ||
    rawCombined.includes('scada') ||
    rawCombined.includes('gis') ||
    rawCombined.includes('simulasi') ||
    rawCombined.includes('numerik');
  const hasWrittenExam =
    rawCombined.includes('uts') ||
    rawCombined.includes('uas') ||
    rawCombined.includes('ujian tulis') ||
    rawCombined.includes('kuis');

  const methods: string[] = [];
  if (hasCaseMethod) methods.push('Case Method / Studi Kasus');
  if (hasProjectOrTugasBesar) methods.push('Project / Tugas Besar');
  if (hasLabOrPrak) methods.push('Praktikum / Studio Lab');
  if (hasSoftwareOrSim) methods.push('Simulasi / Software Rekayasa');
  if (hasPresentationOrReport) methods.push('Presentasi & Laporan Ilmiah');
  if (hasWrittenExam) methods.push('Ujian Tulis & Kuis');

  if (methods.length === 0) methods.push('Ceramah & Evaluasi Konvensional');

  return {
    methods,
    rawCombined,
    hasCaseMethod,
    hasProjectOrTugasBesar,
    hasLabOrPrak,
    hasPresentationOrReport,
    hasSoftwareOrSim,
    hasWrittenExam
  };
}

function verifyCplMethodAlignment(
  cpl: CplItemObe,
  level: LevelKontribusiCpl,
  isCoveredInCpmk: boolean,
  methodFlags: ReturnType<typeof detectCourseMethods>
): CplMethodAlignmentCheck {
  const titleLower = `${cpl.judul} ${cpl.deskripsi}`.toLowerCase();
  const ranahLower = cpl.ranah.toLowerCase();

  let expectedMethods: string[] = [];
  let matchedMethods: string[] = [];

  if (ranahLower.includes('khusus')) {
    if (titleLower.includes('software') || titleLower.includes('bim') || titleLower.includes('gis') || titleLower.includes('plc')) {
      expectedMethods = ['Simulasi / Software Rekayasa', 'Praktikum / Studio Lab', 'Project / Tugas Besar'];
      if (methodFlags.hasSoftwareOrSim) matchedMethods.push('Simulasi / Software Rekayasa');
      if (methodFlags.hasLabOrPrak) matchedMethods.push('Praktikum / Studio Lab');
      if (methodFlags.hasProjectOrTugasBesar) matchedMethods.push('Project / Tugas Besar');
    } else if (titleLower.includes('lab') || titleLower.includes('uji') || titleLower.includes('pengujian') || titleLower.includes('investigasi')) {
      expectedMethods = ['Praktikum / Studio Lab', 'Project / Tugas Besar'];
      if (methodFlags.hasLabOrPrak) matchedMethods.push('Praktikum / Studio Lab');
      if (methodFlags.hasProjectOrTugasBesar) matchedMethods.push('Project / Tugas Besar');
    } else {
      expectedMethods = ['Project / Tugas Besar', 'Case Method / Studi Kasus', 'Praktikum / Studio Lab'];
      if (methodFlags.hasProjectOrTugasBesar) matchedMethods.push('Project / Tugas Besar');
      if (methodFlags.hasCaseMethod) matchedMethods.push('Case Method / Studi Kasus');
      if (methodFlags.hasLabOrPrak) matchedMethods.push('Praktikum / Studio Lab');
    }
  } else if (ranahLower.includes('umum')) {
    if (titleLower.includes('komunikasi') || titleLower.includes('presentasi') || titleLower.includes('advokasi')) {
      expectedMethods = ['Presentasi & Laporan Ilmiah', 'Case Method / Studi Kasus'];
      if (methodFlags.hasPresentationOrReport) matchedMethods.push('Presentasi & Laporan Ilmiah');
      if (methodFlags.hasCaseMethod) matchedMethods.push('Case Method / Studi Kasus');
    } else {
      expectedMethods = ['Project / Tugas Besar', 'Presentasi & Laporan Ilmiah'];
      if (methodFlags.hasProjectOrTugasBesar) matchedMethods.push('Project / Tugas Besar');
      if (methodFlags.hasPresentationOrReport) matchedMethods.push('Presentasi & Laporan Ilmiah');
    }
  } else if (ranahLower.includes('sikap')) {
    expectedMethods = ['Case Method / Studi Kasus', 'Praktikum / Studio Lab', 'Project / Tugas Besar'];
    if (methodFlags.hasCaseMethod) matchedMethods.push('Case Method / Studi Kasus');
    if (methodFlags.hasLabOrPrak) matchedMethods.push('Praktikum / Studio Lab');
    if (methodFlags.hasProjectOrTugasBesar) matchedMethods.push('Project / Tugas Besar');
  } else {
    // Penguasaan Pengetahuan
    expectedMethods = ['Ujian Tulis & Kuis', 'Case Method / Studi Kasus'];
    if (methodFlags.hasWrittenExam) matchedMethods.push('Ujian Tulis & Kuis');
    if (methodFlags.hasCaseMethod) matchedMethods.push('Case Method / Studi Kasus');
    if (methodFlags.hasSoftwareOrSim) matchedMethods.push('Simulasi / Software Rekayasa');
  }

  let status: CplMethodAlignmentCheck['status'] = 'SELARAS';
  let reason = `Metode pembelajaran (${matchedMethods.join(', ') || 'terintegrasi'}) sesuai dengan tuntutan ranah ${cpl.ranah}.`;

  if (matchedMethods.length === 0) {
    status = level === 'Strong' ? 'TIDAK_SELARAS' : 'PERLU_PENGUATAN';
    reason = `Belum ditemukan metode ${expectedMethods.slice(0, 2).join(' / ')} pada RPS untuk memvalidasi ${cpl.kode} (${level}).`;
  } else if (!isCoveredInCpmk && level === 'Strong') {
    status = 'PERLU_PENGUATAN';
    reason = `Metode tersedia (${matchedMethods[0]}), namun ${cpl.kode} berstatus Strong belum ditautkan secara eksplisit pada CPMK RPS.`;
  } else if (matchedMethods.length === 1 && level === 'Strong' && expectedMethods.length > 1 && ranahLower.includes('khusus')) {
    // Strong Keterampilan Khusus benefits from both design/case + practice/rubric
    status = 'SELARAS';
  }

  return {
    cplKode: cpl.kode,
    cplJudul: cpl.judul,
    ranah: cpl.ranah,
    level,
    isCoveredInCpmk,
    expectedMethods,
    matchedMethods,
    status,
    reason
  };
}

/**
 * Menjalankan verifikasi keselarasan metode pembelajaran vs capaian CPL berbasis OBE
 * dan menghasilkan skor kualitas RPS visual (0-100) + rekomendasi spesifik.
 */
export function auditCoursesRpsQuality(
  courses: MataKuliahCplMatrixRecord[],
  cpls: CplItemObe[]
): ProdiRpsQualitySummary {
  const items: CourseRpsQualityResult[] = courses.map(course => {
    const methodFlags = detectCourseMethods(course);
    const hasIku7Method = methodFlags.hasCaseMethod || methodFlags.hasProjectOrTugasBesar;
    const cpmks = course.cpmkList || [];

    const mappedCpls = cpls
      .map(cpl => ({
        cpl,
        level: course.pemetaanCpl[cpl.kode] || ('None' as LevelKontribusiCpl)
      }))
      .filter(entry => entry.level === 'Strong' || entry.level === 'Medium');

    const cplChecks: CplMethodAlignmentCheck[] = mappedCpls.map(({ cpl, level }) => {
      const isCoveredInCpmk = cpmks.some(cp => cp.cplTerkait.includes(cpl.kode));
      return verifyCplMethodAlignment(cpl, level, isCoveredInCpmk, methodFlags);
    });

    const alignedCplCount = cplChecks.filter(c => c.status === 'SELARAS').length;
    const weakAlignedCplCount = cplChecks.filter(c => c.status === 'PERLU_PENGUATAN').length;
    const misalignedCplCount = cplChecks.filter(c => c.status === 'TIDAK_SELARAS').length;

    // Pilar 1: Metode Pembelajaran vs CPL (Max 40)
    let metodeAlignment = 0;
    if (cplChecks.length > 0) {
      const weightedRatio =
        (alignedCplCount * 1.0 + weakAlignedCplCount * 0.55) / cplChecks.length;
      metodeAlignment = Math.round(weightedRatio * 32);
    } else {
      metodeAlignment = 12;
    }
    if (hasIku7Method) metodeAlignment += 8;
    else if (methodFlags.hasLabOrPrak) metodeAlignment += 5;
    metodeAlignment = Math.min(40, Math.max(8, metodeAlignment));

    // Pilar 2: Taksonomi Bloom CPMK vs SKS & CPL (Max 25)
    const maxBloom = cpmks.reduce((m, c) => Math.max(m, extractBloomNum(c.levelBloom)), 2);
    const highestBloom =
      maxBloom >= 6
        ? 'C6 (Mencipta)'
        : maxBloom === 5
        ? 'C5 (Evaluasi/Merancang)'
        : maxBloom === 4
        ? 'C4 (Analisis)'
        : maxBloom === 3
        ? 'C3 (Penerapan)'
        : 'C2 (Pemahaman)';

    let bloomAlignment = 12;
    if (maxBloom >= 5) bloomAlignment = 25;
    else if (maxBloom === 4) bloomAlignment = course.sks >= 3 ? 21 : 23;
    else if (maxBloom === 3) bloomAlignment = 16;

    // Pilar 3: Ketercakupan & Bobot Asesmen CPMK (Max 20)
    const totalBobot = cpmks.reduce((s, c) => s + (c.bobotPersen || 0), 0);
    const strongCpls = mappedCpls.filter(m => m.level === 'Strong');
    const coveredStrongCount = strongCpls.filter(m =>
      cpmks.some(cp => cp.cplTerkait.includes(m.cpl.kode))
    ).length;

    let cpmkMappingBalance = 0;
    if (cpmks.length >= 3) cpmkMappingBalance += 7;
    else if (cpmks.length >= 2) cpmkMappingBalance += 4;
    if (Math.abs(totalBobot - 100) <= 1) cpmkMappingBalance += 5;
    if (strongCpls.length > 0) {
      cpmkMappingBalance += Math.round((coveredStrongCount / strongCpls.length) * 8);
    } else {
      cpmkMappingBalance += 4;
    }
    cpmkMappingBalance = Math.min(20, cpmkMappingBalance);

    // Pilar 4: Kelengkapan Dokumentasi & Variasi Instrumen OBE (Max 15)
    let obeDocumentation = 0;
    if ((course.catatanKurikulum || '').trim().length >= 20) obeDocumentation += 6;
    if (methodFlags.methods.length >= 3) obeDocumentation += 6;
    else if (methodFlags.methods.length === 2) obeDocumentation += 4;
    else obeDocumentation += 2;
    if (cpmks.every(c => c.deskripsi.trim().length >= 20)) obeDocumentation += 3;
    obeDocumentation = Math.min(15, obeDocumentation);

    const totalScore = Math.max(
      1,
      Math.min(
        100,
        metodeAlignment + bloomAlignment + cpmkMappingBalance + obeDocumentation
      )
    );

    let grade: QualityGrade = 'A';
    let status: QualityStatus = 'UNGGUL_OBE';
    let statusLabel = 'Unggul OBE';

    if (totalScore >= 85) {
      grade = 'A';
      status = 'UNGGUL_OBE';
      statusLabel = 'Unggul OBE';
    } else if (totalScore >= 75) {
      grade = 'B';
      status = 'SELARAS_OBE';
      statusLabel = 'Selaras OBE';
    } else if (totalScore >= 60) {
      grade = 'C';
      status = 'PERLU_REVISI_METODE';
      statusLabel = 'Perlu Revisi Metode';
    } else {
      grade = 'D';
      status = 'TIDAK_SELARAS';
      statusLabel = 'Tidak Selaras';
    }

    // Generate Specific OBE Improvement Recommendations
    const recommendations: ObeQualityRecommendation[] = [];

    const firstMisaligned = cplChecks.filter(c => c.status === 'TIDAK_SELARAS');
    firstMisaligned.forEach((chk, i) => {
      if (i < 2) {
        recommendations.push({
          id: `${course.id}-rec-mis-${chk.cplKode}`,
          aspek: 'Metode Pembelajaran',
          prioritas: 'Tinggi',
          targetCplKode: chk.cplKode,
          tindakanRps: `Selaraskan ${chk.cplKode} (${chk.cplJudul}) pada RPS ${course.kodeMK} dengan menambahkan metode ${chk.expectedMethods[0]} dan rubrik penilaian terukur (saat ini belum tervalidasi pada asesmen CPMK).`
        });
      }
    });

    const unmappedStrong = strongCpls.filter(
      m => !cpmks.some(cp => cp.cplTerkait.includes(m.cpl.kode))
    );
    if (unmappedStrong.length > 0) {
      const codes = unmappedStrong.map(u => u.cpl.kode).join(', ');
      recommendations.push({
        id: `${course.id}-rec-map`,
        aspek: 'Keterkaitan CPL–CPMK',
        prioritas: 'Tinggi',
        targetCplKode: unmappedStrong[0].cpl.kode,
        tindakanRps: `Butir ${codes} dipetakan sebagai Strong pada matriks kurikulum, namun belum tercantum dalam cplTerkait CPMK. Perbarui RPS ${course.kodeMK} agar setiap CPL Strong memiliki minimal 1 CPMK dan instrumen evaluasi khusus.`
      });
    }

    if (!hasIku7Method) {
      recommendations.push({
        id: `${course.id}-rec-iku7`,
        aspek: 'Standar IKU-7 (OBE)',
        prioritas: 'Tinggi',
        tindakanRps: `Integrasikan metode pembelajaran partisipatif Case Method atau Team-Based Project berbobot minimal 25–50% pada RPS ${course.namaMK} untuk memenuhi standar IKU-7 Kemendikbudristek & LAM-Teknik.`
      });
    }

    if (maxBloom < 4) {
      recommendations.push({
        id: `${course.id}-rec-bloom`,
        aspek: 'Taksonomi Bloom',
        prioritas: 'Sedang',
        tindakanRps: `Tingkatkan kata kerja operasional CPMK dari ${highestBloom} minimal ke level C4 (Menganalisis) atau C5 (Merancang/Mengevaluasi) pada RPS.`
      });
    }

    if (Math.abs(totalBobot - 100) > 1 || cpmks.length < 3) {
      recommendations.push({
        id: `${course.id}-rec-weight`,
        aspek: 'Distribusi Bobot Asesmen',
        prioritas: 'Sedang',
        tindakanRps:
          cpmks.length < 3
            ? `Lengkapi struktur RPS menjadi minimal 3 butir CPMK dengan total bobot asesmen genap 100% (saat ini ${cpmks.length} CPMK, total ${totalBobot}%).`
            : `Normalkan distribusi bobot asesmen seluruh CPMK pada RPS agar berjumlah tepat 100% (terdeteksi ${totalBobot}%).`
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        id: `${course.id}-rec-ok`,
        aspek: 'Metode Pembelajaran',
        prioritas: 'Rendah',
        tindakanRps: `Konstruksi RPS ${course.kodeMK} telah selaras penuh (Constructive Alignment) dengan seluruh CPL. Pertahankan rubrik analitik dan arsip portofolio nilai mahasiswa tiap semester.`
      });
    }

    return {
      course,
      totalScore,
      grade,
      status,
      statusLabel,
      pillarScores: {
        metodeAlignment,
        bloomAlignment,
        cpmkMappingBalance,
        obeDocumentation
      },
      detectedMethods: methodFlags.methods,
      hasIku7Method,
      highestBloom,
      cplChecks,
      alignedCplCount,
      misalignedCplCount,
      weakAlignedCplCount,
      recommendations
    };
  });

  const totalCourses = items.length;
  const avgQualityScore =
    totalCourses > 0
      ? Math.round((items.reduce((s, i) => s + i.totalScore, 0) / totalCourses) * 10) / 10
      : 0;
  const unggulCount = items.filter(i => i.totalScore >= 85).length;
  const selarasCount = items.filter(i => i.totalScore >= 75 && i.totalScore < 85).length;
  const revisiCount = items.filter(i => i.totalScore >= 60 && i.totalScore < 75).length;
  const kritisCount = items.filter(i => i.totalScore < 60).length;

  const alignedCourseRatePersen =
    totalCourses > 0
      ? Math.round(((unggulCount + selarasCount) / totalCourses) * 100)
      : 0;
  const iku7AdoptionRatePersen =
    totalCourses > 0
      ? Math.round((items.filter(i => i.hasIku7Method).length / totalCourses) * 100)
      : 0;

  const pillarAverages =
    totalCourses > 0
      ? {
          metodeAlignment:
            Math.round(
              (items.reduce((s, i) => s + i.pillarScores.metodeAlignment, 0) / totalCourses) * 10
            ) / 10,
          bloomAlignment:
            Math.round(
              (items.reduce((s, i) => s + i.pillarScores.bloomAlignment, 0) / totalCourses) * 10
            ) / 10,
          cpmkMappingBalance:
            Math.round(
              (items.reduce((s, i) => s + i.pillarScores.cpmkMappingBalance, 0) / totalCourses) *
                10
            ) / 10,
          obeDocumentation:
            Math.round(
              (items.reduce((s, i) => s + i.pillarScores.obeDocumentation, 0) / totalCourses) * 10
            ) / 10
        }
      : {
          metodeAlignment: 0,
          bloomAlignment: 0,
          cpmkMappingBalance: 0,
          obeDocumentation: 0
        };

  return {
    totalCourses,
    avgQualityScore,
    alignedCourseRatePersen,
    iku7AdoptionRatePersen,
    unggulCount,
    selarasCount,
    revisiCount,
    kritisCount,
    pillarAverages,
    items
  };
}
