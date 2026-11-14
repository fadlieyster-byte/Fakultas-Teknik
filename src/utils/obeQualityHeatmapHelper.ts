import {
  CplItemObe,
  CpmkItemObe,
  LevelKontribusiCpl,
  MataKuliahCplMatrixRecord
} from '../types/index';

export type ObeHeatmapBand = 'EXCELLENT' | 'GOOD' | 'WARNING_LOW' | 'CRITICAL_LOW' | 'NONE';

export interface SubCpmkCorrelationNode {
  id: string;
  subKode: string; // e.g. "Sub-CPMK 1.1"
  judulSubCpmk: string;
  cpmkKode: string;
  cpmkDeskripsi: string;
  levelBloom: string;
  metodeAsesmen: string;
  bobotPersen: number;
  linkedCpls: string[];
  cellScoresByCpl: Record<
    string,
    {
      cplKode: string;
      matrixLevel: LevelKontribusiCpl;
      isLinkedInCpmk: boolean;
      score: number | null; // null if neither mapped on MK nor linked in CPMK
      band: ObeHeatmapBand;
      isBelow70: boolean;
      diagnosis: string;
      suggestedIntervention: string;
    }
  >;
}

export interface CourseMatrixCellSummary {
  cplKode: string;
  matrixLevel: LevelKontribusiCpl;
  linkedCpmkCount: number;
  subCpmkCount: number;
  score: number | null;
  band: ObeHeatmapBand;
  isBelow70: boolean;
  diagnosis: string;
  suggestedIntervention: string;
}

export interface CourseHeatmapRow {
  course: MataKuliahCplMatrixRecord;
  cellsByCpl: Record<string, CourseMatrixCellSummary>;
  cpmkCoherenceScore: number;
  subCpmkReadinessScore: number;
  overallObeScore: number;
  below70ComponentCount: number;
  subNodes: SubCpmkCorrelationNode[];
}

export interface LowObeComponentAlert {
  id: string;
  course: MataKuliahCplMatrixRecord;
  cplKode: string;
  cplJudul: string;
  componentPath: string; // e.g. "CPL-03 → CPMK-2 → Sub-CPMK 2.1"
  cpmkKode: string;
  subCpmkKode: string;
  score: number; // < 70
  matrixLevel: LevelKontribusiCpl;
  diagnosis: string;
  suggestedIntervention: string;
}

export interface ObeQualityHeatmapReport {
  totalCourses: number;
  totalActiveCorrelations: number;
  below70Count: number;
  criticalBelow60Count: number;
  avgObeCorrelationScore: number;
  coursesNeedingInterventionCount: number;
  cplHotspots: Array<{
    cpl: CplItemObe;
    avgScore: number;
    below70Count: number;
    activeCourseCount: number;
  }>;
  rows: CourseHeatmapRow[];
  lowScoreAlerts: LowObeComponentAlert[];
}

function clampScore(v: number): number {
  return Math.max(1, Math.min(100, Math.round(v)));
}

function getBand(score: number | null): ObeHeatmapBand {
  if (score === null) return 'NONE';
  if (score >= 85) return 'EXCELLENT';
  if (score >= 70) return 'GOOD';
  if (score >= 55) return 'WARNING_LOW';
  return 'CRITICAL_LOW';
}

function extractBloomLevel(levelBloom: string): number {
  const u = (levelBloom || '').toUpperCase();
  if (u.includes('C6')) return 6;
  if (u.includes('C5') || u.includes('P4') || u.includes('A5')) return 5;
  if (u.includes('C4') || u.includes('P3') || u.includes('A4')) return 4;
  if (u.includes('C3') || u.includes('P2')) return 3;
  if (u.includes('C2')) return 2;
  return 1;
}

function hasAuthenticAssessment(metode: string): boolean {
  const m = (metode || '').toLowerCase();
  return (
    m.includes('proyek') ||
    m.includes('project') ||
    m.includes('tugas besar') ||
    m.includes('kasus') ||
    m.includes('case') ||
    m.includes('praktikum') ||
    m.includes('responsi') ||
    m.includes('presentasi') ||
    m.includes('laporan') ||
    m.includes('rubrik') ||
    m.includes('simulasi')
  );
}

function deriveSubCpmkMilestones(
  course: MataKuliahCplMatrixRecord,
  cpmk: CpmkItemObe,
  cpmkIdx: number
): Array<{ subKode: string; judul: string; stageWeightFactor: number; requiresHighBloom: boolean }> {
  const baseIdx = cpmkIdx + 1;
  const descClean = (cpmk.deskripsi || '').trim();
  const shortTopic =
    descClean.length > 52 ? `${descClean.slice(0, 52).trim()}...` : descClean || course.namaMK;

  return [
    {
      subKode: `Sub-CPMK ${baseIdx}.1`,
      judul: `Penguasaan Konsep & Formulasi: ${shortTopic}`,
      stageWeightFactor: 0.96,
      requiresHighBloom: false
    },
    {
      subKode: `Sub-CPMK ${baseIdx}.2`,
      judul: `Aplikasi Analisis / Asesmen Terukur (${cpmk.metodeAsesmen || 'Evaluasi'})`,
      stageWeightFactor: 0.9,
      requiresHighBloom: true
    }
  ];
}

function computeCellCorrelationScore(params: {
  course: MataKuliahCplMatrixRecord;
  cpl: CplItemObe;
  matrixLevel: LevelKontribusiCpl;
  cpmk: CpmkItemObe | null;
  isLinkedInCpmk: boolean;
  totalCourseBobot: number;
  cpmkCount: number;
  requiresHighBloom: boolean;
}): { score: number; diagnosis: string; suggestedIntervention: string } {
  const {
    course,
    cpl,
    matrixLevel,
    cpmk,
    isLinkedInCpmk,
    totalCourseBobot,
    cpmkCount,
    requiresHighBloom
  } = params;

  const bloomNum = cpmk ? extractBloomLevel(cpmk.levelBloom) : 2;
  const authentic = cpmk ? hasAuthenticAssessment(cpmk.metodeAsesmen) : false;
  const ranahKhususOrUmum =
    cpl.ranah === 'Keterampilan Khusus' || cpl.ranah === 'Keterampilan Umum';

  let score = 48;
  const issues: string[] = [];

  if (isLinkedInCpmk && cpmk) {
    score += 24;
  } else {
    issues.push(`${cpl.kode} (${matrixLevel}) di matriks MK belum ditautkan eksplisit ke CPMK`);
  }

  if (cpmk) {
    if (bloomNum >= 4) {
      score += 12;
    } else if (bloomNum === 3) {
      score += requiresHighBloom && ranahKhususOrUmum ? 3 : 8;
      if (requiresHighBloom && ranahKhususOrUmum) {
        issues.push(`Level Bloom CPMK masih ${cpmk.levelBloom} untuk ranah ${cpl.ranah}`);
      }
    } else {
      issues.push(`Taksonomi Bloom rendah (${cpmk.levelBloom || 'C2'})`);
    }

    if (authentic) {
      score += 10;
    } else {
      score += 2;
      if (matrixLevel === 'Strong' || ranahKhususOrUmum) {
        issues.push('Sub-CPMK belum menggunakan asesmen autentik (Case/Project/Praktikum)');
      }
    }

    if (cpmk.bobotPersen >= 15 && Math.abs(totalCourseBobot - 100) <= 5 && cpmkCount >= 2) {
      score += 6;
    } else {
      issues.push('Distribusi bobot/jumlah CPMK belum proporsional');
    }
  } else {
    issues.push('Dokumen RPS belum merinci butir CPMK dan Sub-CPMK');
  }

  if (matrixLevel === 'Strong' && !isLinkedInCpmk) {
    score = Math.min(score, 54);
  } else if (matrixLevel === 'Medium' && !isLinkedInCpmk) {
    score = Math.min(score, 63);
  }

  if (requiresHighBloom && !authentic && ranahKhususOrUmum && bloomNum < 4) {
    score = Math.min(score, 66);
  }

  const finalScore = clampScore(score);
  const diagnosis =
    issues.length > 0
      ? issues.join('; ') + '.'
      : `Korelasi ${cpl.kode} → ${cpmk?.kode || 'CPMK'} → Sub-CPMK tervalidasi dengan ${
          cpmk?.metodeAsesmen || 'asesmen terukur'
        } (${cpmk?.levelBloom || 'C4'}).`;

  const suggestedIntervention =
    !isLinkedInCpmk || !cpmk
      ? `Tautkan ${cpl.kode} (${cpl.judul}) ke butir CPMK & Sub-CPMK pada RPS ${course.kodeMK} dan tambahkan metode Case Method/Tugas Terukur minimal bobot 20%.`
      : issues.length > 0
      ? `Tingkatkan level Bloom ${cpmk.kode} ke minimal C4–Analisis dan lengkapi Sub-CPMK dengan rubrik Case Study / Proyek pada RPS ${course.kodeMK}.`
      : `Pertahankan konstruksi korelasi OBE dan dokumentasi rubrik penilaian pada portofolio MK ${course.kodeMK}.`;

  return { score: finalScore, diagnosis, suggestedIntervention };
}

export function buildObeQualityHeatmapReport(params: {
  courses: MataKuliahCplMatrixRecord[];
  prodiCpls: CplItemObe[];
}): ObeQualityHeatmapReport {
  const { courses, prodiCpls } = params;
  const lowScoreAlerts: LowObeComponentAlert[] = [];

  const rows: CourseHeatmapRow[] = courses.map(course => {
    const cpmks = course.cpmkList || [];
    const totalCourseBobot = cpmks.reduce((s, c) => s + (c.bobotPersen || 0), 0);

    // 1. Build Sub-CPMK correlation nodes
    const subNodes: SubCpmkCorrelationNode[] = [];
    cpmks.forEach((cpmk, idx) => {
      const milestones = deriveSubCpmkMilestones(course, cpmk, idx);
      milestones.forEach(ms => {
        const cellScoresByCpl: SubCpmkCorrelationNode['cellScoresByCpl'] = {};
        prodiCpls.forEach(cpl => {
          const matrixLevel = course.pemetaanCpl[cpl.kode] || 'None';
          const isLinkedInCpmk = (cpmk.cplTerkait || []).includes(cpl.kode);

          if (matrixLevel === 'None' && !isLinkedInCpmk) {
            cellScoresByCpl[cpl.kode] = {
              cplKode: cpl.kode,
              matrixLevel: 'None',
              isLinkedInCpmk: false,
              score: null,
              band: 'NONE',
              isBelow70: false,
              diagnosis: 'Tidak dibebankan pada MK ini.',
              suggestedIntervention: '-'
            };
            return;
          }

          const evaluated = computeCellCorrelationScore({
            course,
            cpl,
            matrixLevel,
            cpmk,
            isLinkedInCpmk,
            totalCourseBobot,
            cpmkCount: cpmks.length,
            requiresHighBloom: ms.requiresHighBloom
          });

          const adjustedScore = clampScore(evaluated.score * ms.stageWeightFactor);
          const band = getBand(adjustedScore);

          cellScoresByCpl[cpl.kode] = {
            cplKode: cpl.kode,
            matrixLevel,
            isLinkedInCpmk,
            score: adjustedScore,
            band,
            isBelow70: adjustedScore < 70,
            diagnosis: evaluated.diagnosis,
            suggestedIntervention: evaluated.suggestedIntervention
          };
        });

        subNodes.push({
          id: `${course.id}-${cpmk.kode}-${ms.subKode}`,
          subKode: ms.subKode,
          judulSubCpmk: ms.judul,
          cpmkKode: cpmk.kode,
          cpmkDeskripsi: cpmk.deskripsi,
          levelBloom: cpmk.levelBloom,
          metodeAsesmen: cpmk.metodeAsesmen,
          bobotPersen: Math.round((cpmk.bobotPersen || 0) / milestones.length),
          linkedCpls: cpmk.cplTerkait || [],
          cellScoresByCpl
        });
      });
    });

    // 2. Aggregate per-course CPL matrix cells
    const cellsByCpl: Record<string, CourseMatrixCellSummary> = {};
    let below70ComponentCount = 0;
    const activeScores: number[] = [];

    prodiCpls.forEach(cpl => {
      const matrixLevel = course.pemetaanCpl[cpl.kode] || 'None';
      const linkedCpmks = cpmks.filter(cp => (cp.cplTerkait || []).includes(cpl.kode));

      if (matrixLevel === 'None' && linkedCpmks.length === 0) {
        cellsByCpl[cpl.kode] = {
          cplKode: cpl.kode,
          matrixLevel: 'None',
          linkedCpmkCount: 0,
          subCpmkCount: 0,
          score: null,
          band: 'NONE',
          isBelow70: false,
          diagnosis: 'CPL tidak dibebankan pada mata kuliah ini.',
          suggestedIntervention: '-'
        };
        return;
      }

      let finalCellScore: number;
      let diagnosis = '';
      let suggestedIntervention = '';

      if (linkedCpmks.length === 0 || subNodes.length === 0) {
        const res = computeCellCorrelationScore({
          course,
          cpl,
          matrixLevel,
          cpmk: cpmks[0] ?? null,
          isLinkedInCpmk: false,
          totalCourseBobot,
          cpmkCount: cpmks.length,
          requiresHighBloom: true
        });
        finalCellScore = res.score;
        diagnosis = res.diagnosis;
        suggestedIntervention = res.suggestedIntervention;
      } else {
        const matchingSubCells = subNodes
          .filter(sn => sn.linkedCpls.includes(cpl.kode))
          .map(sn => sn.cellScoresByCpl[cpl.kode])
          .filter(c => c && c.score !== null);

        const avg =
          matchingSubCells.reduce((s, c) => s + (c.score ?? 0), 0) /
          Math.max(1, matchingSubCells.length);
        finalCellScore = clampScore(avg);
        const worstSub = [...matchingSubCells].sort(
          (a, b) => (a.score ?? 100) - (b.score ?? 100)
        )[0];
        diagnosis = worstSub?.diagnosis || 'Korelasi terukur.';
        suggestedIntervention = worstSub?.suggestedIntervention || '-';
      }

      const band = getBand(finalCellScore);
      const isBelow70 = finalCellScore < 70;
      if (isBelow70) {
        below70ComponentCount += 1;
        const targetCpmk = linkedCpmks[0]?.kode || 'CPMK-1 (Belum Tertaut)';
        const targetSub = linkedCpmks[0]
          ? `Sub-CPMK ${cpmks.findIndex(c => c.kode === linkedCpmks[0].kode) + 1}.2`
          : 'Sub-CPMK 1.2';

        lowScoreAlerts.push({
          id: `${course.id}-${cpl.kode}`,
          course,
          cplKode: cpl.kode,
          cplJudul: cpl.judul,
          componentPath: `${cpl.kode} → ${targetCpmk} → ${targetSub}`,
          cpmkKode: targetCpmk,
          subCpmkKode: targetSub,
          score: finalCellScore,
          matrixLevel,
          diagnosis,
          suggestedIntervention
        });
      }

      activeScores.push(finalCellScore);

      cellsByCpl[cpl.kode] = {
        cplKode: cpl.kode,
        matrixLevel,
        linkedCpmkCount: linkedCpmks.length,
        subCpmkCount: linkedCpmks.length * 2,
        score: finalCellScore,
        band,
        isBelow70,
        diagnosis,
        suggestedIntervention
      };
    });

    const cpmkCoherenceScore = clampScore(
      (cpmks.length >= 3 ? 45 : cpmks.length * 14) +
        (Math.abs(totalCourseBobot - 100) <= 2 && cpmks.length > 0 ? 30 : 12) +
        (cpmks.some(c => extractBloomLevel(c.levelBloom) >= 4) ? 25 : 10)
    );

    const subCpmkReadinessScore = clampScore(
      subNodes.length > 0
        ? (subNodes.filter(s => hasAuthenticAssessment(s.metodeAsesmen)).length /
            subNodes.length) *
            55 +
            40
        : 35
    );

    const overallObeScore = clampScore(
      activeScores.length > 0
        ? activeScores.reduce((s, v) => s + v, 0) / activeScores.length
        : (cpmkCoherenceScore + subCpmkReadinessScore) / 2
    );

    return {
      course,
      cellsByCpl,
      cpmkCoherenceScore,
      subCpmkReadinessScore,
      overallObeScore,
      below70ComponentCount,
      subNodes
    };
  });

  // Sort courses with most <70 hotspots first
  rows.sort((a, b) => {
    if (b.below70ComponentCount !== a.below70ComponentCount) {
      return b.below70ComponentCount - a.below70ComponentCount;
    }
    return a.overallObeScore - b.overallObeScore;
  });

  lowScoreAlerts.sort((a, b) => a.score - b.score);

  const allActiveScores: number[] = [];
  rows.forEach(r => {
    Object.values(r.cellsByCpl).forEach(cell => {
      if (cell.score !== null) allActiveScores.push(cell.score);
    });
  });

  const cplHotspots = prodiCpls.map(cpl => {
    const activeCells = rows
      .map(r => r.cellsByCpl[cpl.kode])
      .filter(c => c && c.score !== null);
    const avgScore =
      activeCells.length > 0
        ? Math.round(
            (activeCells.reduce((s, c) => s + (c.score ?? 0), 0) / activeCells.length) *
              10
          ) / 10
        : 0;
    const below70 = activeCells.filter(c => c.isBelow70).length;
    return {
      cpl,
      avgScore,
      below70Count: below70,
      activeCourseCount: activeCells.length
    };
  });

  return {
    totalCourses: rows.length,
    totalActiveCorrelations: allActiveScores.length,
    below70Count: lowScoreAlerts.length,
    criticalBelow60Count: lowScoreAlerts.filter(a => a.score < 60).length,
    avgObeCorrelationScore:
      allActiveScores.length > 0
        ? Math.round(
            (allActiveScores.reduce((s, v) => s + v, 0) / allActiveScores.length) * 10
          ) / 10
        : 0,
    coursesNeedingInterventionCount: rows.filter(r => r.below70ComponentCount > 0).length,
    cplHotspots,
    rows,
    lowScoreAlerts
  };
}
