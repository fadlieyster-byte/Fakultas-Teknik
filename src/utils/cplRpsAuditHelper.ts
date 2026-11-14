import { CplItemObe, LevelKontribusiCpl, MataKuliahCplMatrixRecord } from '../types/index';

export const MIN_CPL_COURSE_STANDARD_PERCENT = 70;

export interface CourseCplScoreDetail {
  kode: string;
  judul: string;
  ranah: string;
  level: LevelKontribusiCpl;
  scorePercent: number;
  isBelowMinimum: boolean;
  deficitFrom70: number;
}

export interface RpsImprovementSuggestion {
  kategori: 'Pemetaan CPL' | 'Taksonomi Bloom' | 'Metode Asesmen' | 'Fokus RPS';
  prioritas: 'Tinggi' | 'Sedang';
  rekomendasi: string;
}

export interface CourseCplAuditResult {
  course: MataKuliahCplMatrixRecord;
  mappedDetails: CourseCplScoreDetail[];
  belowMinimumCpls: CourseCplScoreDetail[];
  strongCount: number;
  mediumCount: number;
  lowCount: number;
  avgContributionPercent: number;
  deficitPercent: number;
  auditStatus: 'KRITIS_BAWAH_70' | 'PENGUATAN_BUTIR_70' | 'MEMENUHI_STANDAR';
  statusLabel: string;
  highestBloomLabel: string;
  suggestions: RpsImprovementSuggestion[];
}

function getLevelBasePercent(level: LevelKontribusiCpl): number {
  if (level === 'Strong') return 77.5;
  if (level === 'Medium') return 68.5;
  if (level === 'Low') return 61.5;
  return 0;
}

function extractBloomRank(levelBloom: string): number {
  const upper = levelBloom.toUpperCase();
  if (upper.includes('C6')) return 6;
  if (upper.includes('C5') || upper.includes('P4') || upper.includes('A5')) return 5;
  if (upper.includes('C4') || upper.includes('P3') || upper.includes('A4')) return 4;
  if (upper.includes('C3') || upper.includes('P2')) return 3;
  if (upper.includes('C2')) return 2;
  return 1;
}

/**
 * Menjalankan audit otomatis seluruh mata kuliah terhadap ambang batas minimum
 * kontribusi CPL sebesar 70%, menandai mata kuliah/butir di bawah standar,
 * dan menghasilkan saran perbaikan RPS berbasis data CPMK & pemetaan CPL.
 */
export function auditCoursesCplContribution(
  courses: MataKuliahCplMatrixRecord[],
  cpls: CplItemObe[]
): CourseCplAuditResult[] {
  return courses.map(course => {
    const cpmkCount = course.cpmkList?.length || 0;
    const maxBloomRank = (course.cpmkList || []).reduce(
      (max, cp) => Math.max(max, extractBloomRank(cp.levelBloom)),
      2
    );
    const highestBloomLabel =
      maxBloomRank >= 6
        ? 'C6 (Mencipta)'
        : maxBloomRank === 5
        ? 'C5 (Evaluasi/Desain)'
        : maxBloomRank === 4
        ? 'C4 (Analisis)'
        : maxBloomRank === 3
        ? 'C3 (Penerapan)'
        : 'C2 (Pemahaman)';

    const bloomBonus =
      Math.min(2.4, cpmkCount * 0.55) +
      (course.sks >= 3 ? 0.7 : 0.2) +
      (maxBloomRank >= 4 ? 0.6 : 0);

    const mappedDetails: CourseCplScoreDetail[] = [];

    cpls.forEach(cpl => {
      const level = course.pemetaanCpl[cpl.kode] || 'None';
      if (level === 'None') return;

      const cpmkSupportCount = (course.cpmkList || []).filter(cp =>
        cp.cplTerkait.includes(cpl.kode)
      ).length;
      const supportBonus = Math.min(1.5, cpmkSupportCount * 0.6);

      const rawScore = getLevelBasePercent(level) + bloomBonus + supportBonus;
      const scorePercent = Math.min(96, Math.round(rawScore * 10) / 10);
      const isBelowMinimum = scorePercent < MIN_CPL_COURSE_STANDARD_PERCENT;
      const deficitFrom70 = isBelowMinimum
        ? Math.round((MIN_CPL_COURSE_STANDARD_PERCENT - scorePercent) * 10) / 10
        : 0;

      mappedDetails.push({
        kode: cpl.kode,
        judul: cpl.judul,
        ranah: cpl.ranah,
        level,
        scorePercent,
        isBelowMinimum,
        deficitFrom70
      });
    });

    const strongCount = mappedDetails.filter(d => d.level === 'Strong').length;
    const mediumCount = mappedDetails.filter(d => d.level === 'Medium').length;
    const lowCount = mappedDetails.filter(d => d.level === 'Low').length;
    const belowMinimumCpls = mappedDetails.filter(d => d.isBelowMinimum);

    const avgContributionPercent =
      mappedDetails.length > 0
        ? Math.round(
            (mappedDetails.reduce((s, d) => s + d.scorePercent, 0) / mappedDetails.length) * 10
          ) / 10
        : 0;

    const deficitPercent =
      avgContributionPercent < MIN_CPL_COURSE_STANDARD_PERCENT
        ? Math.round((MIN_CPL_COURSE_STANDARD_PERCENT - avgContributionPercent) * 10) / 10
        : 0;

    let auditStatus: CourseCplAuditResult['auditStatus'] = 'MEMENUHI_STANDAR';
    let statusLabel = 'Memenuhi (≥ 70%)';

    if (avgContributionPercent < MIN_CPL_COURSE_STANDARD_PERCENT || strongCount === 0) {
      auditStatus = 'KRITIS_BAWAH_70';
      statusLabel =
        avgContributionPercent < MIN_CPL_COURSE_STANDARD_PERCENT
          ? `Di Bawah 70% (${avgContributionPercent.toFixed(1)}%)`
          : 'Tanpa Kontribusi Strong';
    } else if (belowMinimumCpls.length > 0) {
      auditStatus = 'PENGUATAN_BUTIR_70';
      statusLabel = `${belowMinimumCpls.length} Butir CPL < 70%`;
    }

    // Build deterministic, course-specific RPS improvement recommendations
    const suggestions: RpsImprovementSuggestion[] = [];

    if (mappedDetails.length === 0) {
      suggestions.push({
        kategori: 'Pemetaan CPL',
        prioritas: 'Tinggi',
        rekomendasi:
          `Petakan minimal 2–3 CPL inti Program Studi pada RPS ${course.namaMK} dan selaraskan setiap CPMK dengan indikator ketercapaian minimal 70%.`
      });
    } else if (belowMinimumCpls.length > 0) {
      const targetCodes = belowMinimumCpls
        .slice(0, 3)
        .map(b => `${b.kode} (${b.scorePercent.toFixed(1)}%)`)
        .join(', ');
      suggestions.push({
        kategori: 'Pemetaan CPL',
        prioritas: auditStatus === 'KRITIS_BAWAH_70' ? 'Tinggi' : 'Sedang',
        rekomendasi:
          `Tingkatkan kontribusi ${targetCodes} pada RPS dengan menambahkan modul tugas terstruktur dan rubrik penilaian khusus di minggu ke-9 s.d. ke-14 agar melampaui standar ≥70%.`
      });
    }

    if (strongCount === 0) {
      suggestions.push({
        kategori: 'Fokus RPS',
        prioritas: 'Tinggi',
        rekomendasi:
          `Mata kuliah belum memiliki kontribusi CPL berstatus Strong (S). Tetapkan minimal 1 CPL utama dengan bobot asesmen ≥40% pada Rencana Tugas Mahasiswa (RTM) di RPS.`
      });
    } else if (lowCount >= 3 && avgContributionPercent < 72) {
      suggestions.push({
        kategori: 'Fokus RPS',
        prioritas: 'Sedang',
        rekomendasi:
          `Terdapat ${lowCount} butir CPL bertaraf Low (<70%) yang mengencerkan rata-rata kontribusi MK. Konsolidasikan RPS ke 2–3 CPL paling relevan atau tingkatkan kedalaman materi butir terkait.`
      });
    }

    if (maxBloomRank < 4) {
      suggestions.push({
        kategori: 'Taksonomi Bloom',
        prioritas: 'Tinggi',
        rekomendasi:
          `Level kognitif CPMK tertinggi masih ${highestBloomLabel}. Revisi kata kerja operasional di RPS minimal ke C4 (Menganalisis) / C5 (Merancang/Mengevaluasi) beserta soal studi kasus terapan.`
      });
    }

    const combinedAssessments = (course.cpmkList || [])
      .map(c => c.metodeAsesmen.toLowerCase())
      .join(' ');
    const hasActiveCaseOrProject =
      combinedAssessments.includes('kasus') ||
      combinedAssessments.includes('proyek') ||
      combinedAssessments.includes('praktikum') ||
      combinedAssessments.includes('tugas besar') ||
      combinedAssessments.includes('presentasi');

    if (!hasActiveCaseOrProject || cpmkCount < 3) {
      suggestions.push({
        kategori: 'Metode Asesmen',
        prioritas: 'Sedang',
        rekomendasi:
          cpmkCount < 3
            ? `Pecah capaian mata kuliah menjadi minimal 3 butir CPMK terukur dalam RPS dengan integrasi Case Method atau Team-Based Project berbobot minimal 25–30%.`
            : `Tambahkan instrumen asesmen berbasis Case Method / Proyek Kelompok beserta rubrik analitik pada RPS guna mendongkrak ketercapaian kompetensi di atas 70%.`
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        kategori: 'Pemetaan CPL',
        prioritas: 'Sedang',
        rekomendasi:
          `Pertahankan struktur RPS saat ini dan lakukan sinkronisasi portofolio asesmen CPMK setiap akhir semester untuk menjaga konsistensi capaian ≥70%.`
      });
    }

    return {
      course,
      mappedDetails,
      belowMinimumCpls,
      strongCount,
      mediumCount,
      lowCount,
      avgContributionPercent,
      deficitPercent,
      auditStatus,
      statusLabel,
      highestBloomLabel,
      suggestions
    };
  });
}
