import { CplItemObe, MataKuliahCplMatrixRecord } from '../types/index';

export type CplCompletenessStatus = 'Incomplete' | 'Complete';

export interface CourseCplCompletenessItem {
  course: MataKuliahCplMatrixRecord;
  status: CplCompletenessStatus; // Explicitly 'Incomplete' or 'Complete'
  mappedCplInMatrix: string[];
  explicitCplInCpmk: string[];
  strongMediumMatrixCpls: string[];
  missingCplToCpmk: string[]; // Strong/Medium CPLs not linked to any CPMK
  allUnlinkedMatrixCpls: string[]; // Any CPL in matrix not in CPMK
  completenessPercent: number;
  issueSummary: string;
}

export interface ProdiCplComponentCoverage {
  cpl: CplItemObe;
  mappedCourseCount: number;
  cpmkExplicitCount: number;
  isCoveredByProdi: boolean;
}

export interface CplCompletenessAuditReport {
  totalCourses: number;
  completeCount: number;
  incompleteCount: number;
  completenessRatePercent: number;
  items: CourseCplCompletenessItem[];
  incompleteItems: CourseCplCompletenessItem[];
  cplComponentCoverage: ProdiCplComponentCoverage[];
  uncoveredProdiCplCount: number;
}

export function buildCplCompletenessAuditReport(params: {
  courses: MataKuliahCplMatrixRecord[];
  prodiCpls: CplItemObe[];
}): CplCompletenessAuditReport {
  const { courses, prodiCpls } = params;

  const items: CourseCplCompletenessItem[] = courses.map(course => {
    const pemetaanEntries = Object.entries(course.pemetaanCpl || {}).filter(
      ([, level]) => level === 'Strong' || level === 'Medium' || level === 'Low'
    );
    const mappedCplInMatrix = pemetaanEntries.map(([kode]) => kode);
    const strongMediumMatrixCpls = pemetaanEntries
      .filter(([, level]) => level === 'Strong' || level === 'Medium')
      .map(([kode]) => kode);

    const cpmkList = course.cpmkList || [];
    const explicitSet = new Set<string>();
    cpmkList.forEach(cp => {
      (cp.cplTerkait || []).forEach(kode => {
        if (kode && kode.trim()) explicitSet.add(kode.trim());
      });
    });
    const explicitCplInCpmk = Array.from(explicitSet);

    const missingCplToCpmk = strongMediumMatrixCpls.filter(k => !explicitSet.has(k));
    const allUnlinkedMatrixCpls = mappedCplInMatrix.filter(k => !explicitSet.has(k));

    const hasMinOneExplicitCpl = explicitCplInCpmk.length >= 1 && cpmkList.length >= 1;
    const isComplete = hasMinOneExplicitCpl && missingCplToCpmk.length === 0;
    const status: CplCompletenessStatus = isComplete ? 'Complete' : 'Incomplete';

    let completenessPercent = 100;
    if (!hasMinOneExplicitCpl) {
      completenessPercent = mappedCplInMatrix.length > 0 ? 25 : 0;
    } else if (strongMediumMatrixCpls.length > 0) {
      const covered = strongMediumMatrixCpls.length - missingCplToCpmk.length;
      completenessPercent = Math.round((covered / strongMediumMatrixCpls.length) * 100);
    }

    let issueSummary = 'Seluruh CPL inti pada matriks telah terhubung eksplisit ke CPMK RPS.';
    if (explicitCplInCpmk.length === 0 || cpmkList.length === 0) {
      issueSummary =
        'Belum ada pemetaan minimal 1 CPL secara eksplisit ke butir CPMK dalam dokumen RPS.';
    } else if (missingCplToCpmk.length > 0) {
      issueSummary = `${missingCplToCpmk.length} komponen CPL (${missingCplToCpmk.join(
        ', '
      )}) tercatat di matriks MK namun belum dipetakan eksplisit ke CPMK RPS.`;
    }

    return {
      course,
      status,
      mappedCplInMatrix,
      explicitCplInCpmk,
      strongMediumMatrixCpls,
      missingCplToCpmk,
      allUnlinkedMatrixCpls,
      completenessPercent,
      issueSummary
    };
  });

  // Sort Incomplete first so lecturers/kaprodi immediately see gaps
  items.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'Incomplete' ? -1 : 1;
    if (a.completenessPercent !== b.completenessPercent) {
      return a.completenessPercent - b.completenessPercent;
    }
    return a.course.semester - b.course.semester;
  });

  const incompleteItems = items.filter(i => i.status === 'Incomplete');
  const completeCount = items.length - incompleteItems.length;
  const completenessRatePercent =
    items.length > 0 ? Math.round((completeCount / items.length) * 100) : 100;

  // Component coverage per prodi CPL
  const cplComponentCoverage: ProdiCplComponentCoverage[] = prodiCpls.map(cpl => {
    let mappedCourseCount = 0;
    let cpmkExplicitCount = 0;

    courses.forEach(course => {
      if (course.pemetaanCpl && course.pemetaanCpl[cpl.kode]) {
        mappedCourseCount += 1;
      }
      const hasInCpmk = (course.cpmkList || []).some(cp =>
        (cp.cplTerkait || []).includes(cpl.kode)
      );
      if (hasInCpmk) {
        cpmkExplicitCount += 1;
      }
    });

    return {
      cpl,
      mappedCourseCount,
      cpmkExplicitCount,
      isCoveredByProdi: cpmkExplicitCount > 0
    };
  });

  const uncoveredProdiCplCount = cplComponentCoverage.filter(c => !c.isCoveredByProdi).length;

  return {
    totalCourses: items.length,
    completeCount,
    incompleteCount: incompleteItems.length,
    completenessRatePercent,
    items,
    incompleteItems,
    cplComponentCoverage,
    uncoveredProdiCplCount
  };
}
