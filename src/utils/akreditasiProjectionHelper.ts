import { BorangAkreditasiProdi, ProgramStudiInfo } from '../types/index';
import { CplGapComparisonRow } from './akreditasiPdfExport';

export const SCORE_THRESHOLD_BAIK_SEKALI = 301;
export const SCORE_THRESHOLD_UNGGUL = 361;
export const SCORE_THRESHOLD_BAIK = 201;

export type PeringkatAkreditasi = 'Unggul' | 'Baik Sekali' | 'Baik' | 'Perlu Pembinaan';

export interface GraduationYearTrend {
  tahunAkademik: string;
  tahunSingkat: string;
  jumlahLulusan: number;
  lulusTepatWaktuPersen: number;
  ipkRataRata: number;
  masaTungguBulan: number;
  serapanKerjaPersen: number;
}

export interface SyaratUnggulCheckItem {
  id: string;
  indikator: string;
  nilaiAktual: string;
  ambangUnggul: string;
  terpenuhi: boolean;
  catatan: string;
}

export interface ProjectionTimelinePoint {
  periode: string;
  tipe: 'Historis' | 'Aktual' | 'Proyeksi';
  skorProyeksi: number;
  indeksCpl: number;
  ktwPersen: number;
  batasUnggul: number;
  batasBaikSekali: number;
}

export interface ProjectionScenarioAdjustments {
  deltaCplPersen: number; // -5 .. +10
  deltaKtwPersen: number; // -5 .. +10
  deltaAuditRpsPersen: number; // 0 .. +15
}

export interface AccreditationProjectionResult {
  prodiId: ProgramStudiInfo['id'];
  peringkatSaatIni: string;
  targetPeringkat: string;
  graduationTrends3Years: GraduationYearTrend[];
  // Summary stats from CPL + 3-yr graduation
  avgCplRealization: number;
  cplTargetComplianceRatio: number;
  rpsAuditPassRate: number;
  latestKtwPersen: number;
  avgKtw3Years: number;
  ktwSlopePerYear: number;
  latestIpkRata: number;
  ipkSlopePerYear: number;
  latestMasaTungguBulan: number;
  graduatesGrowthPercent: number;
  // Scores (0 - 400)
  skorDasarBorang: number;
  skorK6Proyeksi: number;
  skorK9Proyeksi: number;
  skorAktualTerintegrasi: number;
  skorProyeksiAkhir: number;
  peringkatAktualEstimasi: PeringkatAkreditasi;
  peringkatProyeksi: PeringkatAkreditasi;
  // Track evaluations
  baikSekaliTrack: {
    onTrack: boolean;
    marginDariAmbang: number;
    statusLabel: string;
    ringkasan: string;
  };
  unggulTrack: {
    onTrack: boolean;
    approaching: boolean;
    marginDariAmbang: number;
    statusLabel: 'Berada di Jalur Unggul' | 'Mendekati Batas Unggul' | 'Perlu Akselerasi menuju Unggul';
    ringkasan: string;
    syaratUnggulChecklist: SyaratUnggulCheckItem[];
    jumlahSyaratTerpenuhi: number;
  };
  timelineSeries: ProjectionTimelinePoint[];
  strategicRecommendations: Array<{
    prioritas: 'Tinggi' | 'Sedang' | 'Pertahankan';
    fokus: string;
    dampakEstimasi: string;
    aksi: string;
  }>;
}

/**
 * Data historis kelulusan 3 tahun akademik terakhir per Program Studi
 * disinkronkan dengan data Yudisium & Grafik KTW Akademik FT UNBARI.
 */
export const THREE_YEAR_GRADUATION_TRENDS: Record<string, GraduationYearTrend[]> = {
  SIPIL: [
    {
      tahunAkademik: '2023/2024',
      tahunSingkat: '2023/24',
      jumlahLulusan: 41,
      lulusTepatWaktuPersen: 79.4,
      ipkRataRata: 3.24,
      masaTungguBulan: 4.1,
      serapanKerjaPersen: 78.5
    },
    {
      tahunAkademik: '2024/2025',
      tahunSingkat: '2024/25',
      jumlahLulusan: 44,
      lulusTepatWaktuPersen: 81.8,
      ipkRataRata: 3.31,
      masaTungguBulan: 3.7,
      serapanKerjaPersen: 82.0
    },
    {
      tahunAkademik: '2025/2026',
      tahunSingkat: '2025/26',
      jumlahLulusan: 49,
      lulusTepatWaktuPersen: 83.5,
      ipkRataRata: 3.38,
      masaTungguBulan: 3.4,
      serapanKerjaPersen: 85.4
    }
  ],
  LINGKUNGAN: [
    {
      tahunAkademik: '2023/2024',
      tahunSingkat: '2023/24',
      jumlahLulusan: 28,
      lulusTepatWaktuPersen: 81.5,
      ipkRataRata: 3.21,
      masaTungguBulan: 4.2,
      serapanKerjaPersen: 77.0
    },
    {
      tahunAkademik: '2024/2025',
      tahunSingkat: '2024/25',
      jumlahLulusan: 30,
      lulusTepatWaktuPersen: 84.0,
      ipkRataRata: 3.26,
      masaTungguBulan: 3.9,
      serapanKerjaPersen: 80.5
    },
    {
      tahunAkademik: '2025/2026',
      tahunSingkat: '2025/26',
      jumlahLulusan: 32,
      lulusTepatWaktuPersen: 86.2,
      ipkRataRata: 3.32,
      masaTungguBulan: 3.6,
      serapanKerjaPersen: 83.2
    }
  ],
  LISTRIK_D3: [
    {
      tahunAkademik: '2023/2024',
      tahunSingkat: '2023/24',
      jumlahLulusan: 24,
      lulusTepatWaktuPersen: 84.0,
      ipkRataRata: 3.16,
      masaTungguBulan: 3.3,
      serapanKerjaPersen: 81.0
    },
    {
      tahunAkademik: '2024/2025',
      tahunSingkat: '2024/25',
      jumlahLulusan: 25,
      lulusTepatWaktuPersen: 86.4,
      ipkRataRata: 3.20,
      masaTungguBulan: 3.0,
      serapanKerjaPersen: 83.5
    },
    {
      tahunAkademik: '2025/2026',
      tahunSingkat: '2025/26',
      jumlahLulusan: 26,
      lulusTepatWaktuPersen: 88.1,
      ipkRataRata: 3.24,
      masaTungguBulan: 2.8,
      serapanKerjaPersen: 86.0
    }
  ]
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function classifyScore(score: number): PeringkatAkreditasi {
  if (score >= SCORE_THRESHOLD_UNGGUL) return 'Unggul';
  if (score >= SCORE_THRESHOLD_BAIK_SEKALI) return 'Baik Sekali';
  if (score >= SCORE_THRESHOLD_BAIK) return 'Baik';
  return 'Perlu Pembinaan';
}

function linearSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY);
    den += (i - meanX) * (i - meanX);
  }
  return den === 0 ? 0 : num / den;
}

export function computeAccreditationProjection(params: {
  prodi: ProgramStudiInfo;
  borang: BorangAkreditasiProdi;
  gapRows: CplGapComparisonRow[];
  avgCourseCplPercent: number;
  rpsAuditPassRate: number;
  scenarios?: ProjectionScenarioAdjustments;
}): AccreditationProjectionResult {
  const {
    prodi,
    borang,
    gapRows,
    avgCourseCplPercent,
    rpsAuditPassRate,
    scenarios = { deltaCplPersen: 0, deltaKtwPersen: 0, deltaAuditRpsPersen: 0 }
  } = params;

  const trends = THREE_YEAR_GRADUATION_TRENDS[prodi.id] || THREE_YEAR_GRADUATION_TRENDS.SIPIL;
  const firstYear = trends[0];
  const latestYear = trends[trends.length - 1];

  const avgCplFromGap =
    gapRows.length > 0
      ? gapRows.reduce((s, r) => s + r.capaianSaatIni, 0) / gapRows.length
      : avgCourseCplPercent;

  // Blend CPL borang realization and MK matrix readiness
  const baseCplScore = Math.round((avgCplFromGap * 0.7 + avgCourseCplPercent * 0.3) * 10) / 10;
  const effectiveCplScore = clamp(baseCplScore + scenarios.deltaCplPersen, 50, 98);
  const cplTargetComplianceRatio =
    gapRows.length > 0
      ? Math.round((gapRows.filter(r => r.gap >= 0).length / gapRows.length) * 100)
      : 100;

  const effectiveAuditPassRate = clamp(rpsAuditPassRate + scenarios.deltaAuditRpsPersen, 0, 100);

  // 3-year graduation trend metrics
  const ktwValues = trends.map(t => t.lulusTepatWaktuPersen);
  const ipkValues = trends.map(t => t.ipkRataRata);
  const avgKtw3Years = Math.round((ktwValues.reduce((s, v) => s + v, 0) / trends.length) * 10) / 10;
  const ktwSlopePerYear = Math.round(linearSlope(ktwValues) * 100) / 100;
  const ipkSlopePerYear = Math.round(linearSlope(ipkValues) * 1000) / 1000;
  const effectiveLatestKtw = clamp(latestYear.lulusTepatWaktuPersen + scenarios.deltaKtwPersen, 40, 99);
  const graduatesGrowthPercent =
    firstYear.jumlahLulusan > 0
      ? Math.round(((latestYear.jumlahLulusan - firstYear.jumlahLulusan) / firstYear.jumlahLulusan) * 1000) / 10
      : 0;

  // Compute baseline 9 criteria score (0 - 400 scale)
  const totalBobot = borang.kriteriaList.reduce((s, k) => s + k.bobotPersen, 0) || 100;
  const skorDasarBorang =
    Math.round(
      borang.kriteriaList.reduce((s, k) => s + (k.skorSkala4 * k.bobotPersen) / totalBobot, 0) * 100 * 10
    ) / 10;

  const k6Base = borang.kriteriaList.find(k => k.id === 'K6');
  const k9Base = borang.kriteriaList.find(k => k.id === 'K9');

  // Dynamic K6 (Kurikulum & Pendidikan OBE, bobot 25%) influenced by live CPL + RPS Audit pass rate
  const cplNormalized = clamp((effectiveCplScore - 65) / 25, 0, 1); // 65%..90% -> 0..1
  const auditNormalized = clamp(effectiveAuditPassRate / 100, 0, 1);
  const computedK6Scale4 = clamp(
    3.25 + cplNormalized * 0.52 + auditNormalized * 0.16,
    2.5,
    3.98
  );
  const skorK6Proyeksi = Math.round(((k6Base?.skorSkala4 ?? 3.65) * 0.45 + computedK6Scale4 * 0.55) * 100) / 100;

  // Dynamic K9 (Luaran & Capaian Tridharma, bobot 10%) influenced by 3-year graduation trend
  const ktwNormalized = clamp((effectiveLatestKtw - 65) / 25, 0, 1);
  const ipkNormalized = clamp((latestYear.ipkRataRata - 2.8) / 0.75, 0, 1);
  const waitNormalized = clamp((6.0 - latestYear.masaTungguBulan) / 3.5, 0, 1);
  const computedK9Scale4 = clamp(
    3.15 + ktwNormalized * 0.36 + ipkNormalized * 0.25 + waitNormalized * 0.18,
    2.4,
    3.98
  );
  const skorK9Proyeksi = Math.round(((k9Base?.skorSkala4 ?? 3.60) * 0.4 + computedK9Scale4 * 0.6) * 100) / 100;

  // Compute current integrated score replacing K6 and K9 with live CPL/graduation-linked scores
  const skorAktualTerintegrasiRaw = borang.kriteriaList.reduce((sum, k) => {
    const scoreToUse =
      k.id === 'K6' ? skorK6Proyeksi : k.id === 'K9' ? skorK9Proyeksi : k.skorSkala4;
    return sum + (scoreToUse * k.bobotPersen) / totalBobot;
  }, 0) * 100;

  const skorAktualTerintegrasi = Math.round(skorAktualTerintegrasiRaw * 10) / 10;

  // 2-Year Forward Momentum toward Re-Accreditation (from 3-year KTW/IPK slope + scenarios)
  const ktwMomentumPoints = clamp(ktwSlopePerYear * 1.45, -4, 5.5);
  const ipkMomentumPoints = clamp(ipkSlopePerYear * 42, -3, 3.5);
  const cplReadinessBonus =
    (effectiveCplScore >= 80 ? 1.8 : effectiveCplScore >= 75 ? 0.6 : -1.5) +
    (effectiveAuditPassRate >= 85 ? 1.4 : effectiveAuditPassRate >= 70 ? 0.4 : -1.2);
  const scenarioDeltaBoost =
    scenarios.deltaCplPersen * 0.55 +
    scenarios.deltaKtwPersen * 0.45 +
    scenarios.deltaAuditRpsPersen * 0.25;

  const skorProyeksiAkhir =
    Math.round(
      clamp(
        skorAktualTerintegrasi +
          (ktwMomentumPoints + ipkMomentumPoints + cplReadinessBonus) * 0.65 +
          scenarioDeltaBoost * 0.35,
        200,
        396
      ) * 10
    ) / 10;

  const peringkatAktualEstimasi = classifyScore(skorAktualTerintegrasi);
  const peringkatProyeksi = classifyScore(skorProyeksiAkhir);

  // Evaluate Baik Sekali preservation track (>= 301)
  const marginBaikSekali = Math.round((skorProyeksiAkhir - SCORE_THRESHOLD_BAIK_SEKALI) * 10) / 10;
  const onTrackBaikSekali = skorProyeksiAkhir >= SCORE_THRESHOLD_BAIK_SEKALI;

  // Syarat Perlu Unggul checklist
  const syaratUnggulChecklist: SyaratUnggulCheckItem[] = [
    {
      id: 'skor-total',
      indikator: 'Proyeksi Skor Total 9 Kriteria',
      nilaiAktual: `${skorProyeksiAkhir.toFixed(1)} / 400`,
      ambangUnggul: '≥ 361.0',
      terpenuhi: skorProyeksiAkhir >= SCORE_THRESHOLD_UNGGUL,
      catatan:
        skorProyeksiAkhir >= SCORE_THRESHOLD_UNGGUL
          ? `Surplus +${(skorProyeksiAkhir - SCORE_THRESHOLD_UNGGUL).toFixed(1)} poin di atas batas Unggul.`
          : `Selisih -${(SCORE_THRESHOLD_UNGGUL - skorProyeksiAkhir).toFixed(1)} poin menuju ambang Unggul.`
    },
    {
      id: 'cpl-obe',
      indikator: 'Rata-rata Ketercapaian CPL (Kurikulum OBE)',
      nilaiAktual: `${effectiveCplScore.toFixed(1)}%`,
      ambangUnggul: '≥ 78.0%',
      terpenuhi: effectiveCplScore >= 78.0,
      catatan: `${cplTargetComplianceRatio}% butir CPL memenuhi target minimum program studi.`
    },
    {
      id: 'audit-rps',
      indikator: 'Kepatuhan Mata Kuliah Audit CPL ≥ 70%',
      nilaiAktual: `${Math.round(effectiveAuditPassRate)}% MK Lulus`,
      ambangUnggul: '≥ 75% MK',
      terpenuhi: effectiveAuditPassRate >= 75,
      catatan:
        effectiveAuditPassRate >= 75
          ? 'Sebaran pemetaan Strong/Medium pada RPS mata kuliah sudah memadai.'
          : 'Revisi RPS pada MK bertanda <70% diperlukan agar portofolio K6 dinilai 4.0.'
    },
    {
      id: 'ktw-3th',
      indikator: 'Kelulusan Tepat Waktu (KTW) 3 Tahun',
      nilaiAktual: `${effectiveLatestKtw.toFixed(1)}% (${ktwSlopePerYear >= 0 ? '+' : ''}${ktwSlopePerYear.toFixed(1)}%/thn)`,
      ambangUnggul: '≥ 75.0% (Tren Naik)',
      terpenuhi: effectiveLatestKtw >= 75.0 && ktwSlopePerYear >= 0,
      catatan: `Rata-rata 3 tahun terakhir ${avgKtw3Years.toFixed(1)}% dengan tren ${ktwSlopePerYear >= 0 ? 'positif' : 'menurun'}.`
    },
    {
      id: 'ipk-lulusan',
      indikator: 'IPK Lulusan & Masa Tunggu Kerja',
      nilaiAktual: `IPK ${latestYear.ipkRataRata.toFixed(2)} · ${latestYear.masaTungguBulan.toFixed(1)} bln`,
      ambangUnggul: 'IPK ≥ 3.25 · ≤ 4.0 bln',
      terpenuhi: latestYear.ipkRataRata >= 3.25 && latestYear.masaTungguBulan <= 4.0,
      catatan: `Serapan lulusan mencapai ${latestYear.serapanKerjaPersen.toFixed(1)}% sesuai bidang keteknikan.`
    }
  ];

  const jumlahSyaratTerpenuhi = syaratUnggulChecklist.filter(s => s.terpenuhi).length;
  const marginUnggul = Math.round((skorProyeksiAkhir - SCORE_THRESHOLD_UNGGUL) * 10) / 10;

  let unggulStatusLabel: AccreditationProjectionResult['unggulTrack']['statusLabel'] =
    'Perlu Akselerasi menuju Unggul';
  let onTrackUnggul = false;
  let approachingUnggul = false;

  if (skorProyeksiAkhir >= SCORE_THRESHOLD_UNGGUL && jumlahSyaratTerpenuhi >= 4) {
    unggulStatusLabel = 'Berada di Jalur Unggul';
    onTrackUnggul = true;
  } else if (skorProyeksiAkhir >= 354.0 || (skorProyeksiAkhir >= SCORE_THRESHOLD_UNGGUL && jumlahSyaratTerpenuhi >= 3)) {
    unggulStatusLabel = 'Mendekati Batas Unggul';
    approachingUnggul = true;
    onTrackUnggul = skorProyeksiAkhir >= SCORE_THRESHOLD_UNGGUL;
  }

  const baikSekaliRingkasan = onTrackBaikSekali
    ? `${prodi.nama} berada pada jalur aman untuk mempertahankan peringkat Baik Sekali dengan margin +${marginBaikSekali.toFixed(1)} poin di atas ambang 301.0.`
    : `Skor proyeksi saat ini di bawah ambang Baik Sekali (301.0); perlu intervensi segera pada CPL dan kelulusan tepat waktu.`;

  const unggulRingkasan =
    unggulStatusLabel === 'Berada di Jalur Unggul'
      ? `Dengan skor proyeksi ${skorProyeksiAkhir.toFixed(1)} (+${marginUnggul.toFixed(1)} poin di atas 361.0) dan tren KTW +${ktwSlopePerYear.toFixed(1)}%/thn, prodi berada di jalur kuat untuk meraih status Unggul.`
      : unggulStatusLabel === 'Mendekati Batas Unggul'
      ? `Skor proyeksi ${skorProyeksiAkhir.toFixed(1)} berada sangat dekat dengan ambang Unggul (361.0). Penguatan ${skorProyeksiAkhir < 361 ? `+${(361 - skorProyeksiAkhir).toFixed(1)} poin` : 'syarat perlu'} melalui audit RPS dan akselerasi yudisium akan mengunci peringkat Unggul.`
      : `Peringkat Baik Sekali aman (+${marginBaikSekali.toFixed(1)} poin), namun untuk naik ke Unggul dibutuhkan tambahan +${Math.abs(marginUnggul).toFixed(1)} poin melalui peningkatan capaian CPL OBE, publikasi/penelitian K7, dan penguatan SDM/IPK lulusan.`;

  // Build 5-period projection timeline series (3 historical years + 2 projected years)
  const timelineSeries: ProjectionTimelinePoint[] = [
    {
      periode: trends[0].tahunSingkat,
      tipe: 'Historis',
      skorProyeksi: Math.round((skorAktualTerintegrasi - 9.2 + (scenarios.deltaCplPersen * 0.05)) * 10) / 10,
      indeksCpl: Math.round((effectiveCplScore - 4.2) * 10) / 10,
      ktwPersen: trends[0].lulusTepatWaktuPersen,
      batasUnggul: SCORE_THRESHOLD_UNGGUL,
      batasBaikSekali: SCORE_THRESHOLD_BAIK_SEKALI
    },
    {
      periode: trends[1].tahunSingkat,
      tipe: 'Historis',
      skorProyeksi: Math.round((skorAktualTerintegrasi - 4.6) * 10) / 10,
      indeksCpl: Math.round((effectiveCplScore - 2.1) * 10) / 10,
      ktwPersen: trends[1].lulusTepatWaktuPersen,
      batasUnggul: SCORE_THRESHOLD_UNGGUL,
      batasBaikSekali: SCORE_THRESHOLD_BAIK_SEKALI
    },
    {
      periode: `${trends[2].tahunSingkat} (Aktual)`,
      tipe: 'Aktual',
      skorProyeksi: skorAktualTerintegrasi,
      indeksCpl: effectiveCplScore,
      ktwPersen: effectiveLatestKtw,
      batasUnggul: SCORE_THRESHOLD_UNGGUL,
      batasBaikSekali: SCORE_THRESHOLD_BAIK_SEKALI
    },
    {
      periode: '2026/27 (Est.)',
      tipe: 'Proyeksi',
      skorProyeksi: Math.round(((skorAktualTerintegrasi + skorProyeksiAkhir) / 2) * 10) / 10,
      indeksCpl: Math.min(96, Math.round((effectiveCplScore + 1.4) * 10) / 10),
      ktwPersen: clamp(Math.round((effectiveLatestKtw + Math.max(0.6, ktwSlopePerYear)) * 10) / 10, 40, 99),
      batasUnggul: SCORE_THRESHOLD_UNGGUL,
      batasBaikSekali: SCORE_THRESHOLD_BAIK_SEKALI
    },
    {
      periode: '2027/28 (Re-Akred)',
      tipe: 'Proyeksi',
      skorProyeksi: skorProyeksiAkhir,
      indeksCpl: Math.min(98, Math.round((effectiveCplScore + 2.6) * 10) / 10),
      ktwPersen: clamp(Math.round((effectiveLatestKtw + Math.max(1.2, ktwSlopePerYear * 2)) * 10) / 10, 40, 99),
      batasUnggul: SCORE_THRESHOLD_UNGGUL,
      batasBaikSekali: SCORE_THRESHOLD_BAIK_SEKALI
    }
  ];

  // Actionable strategic recommendations
  const lowestCriteria = [...borang.kriteriaList].sort((a, b) => a.skorSkala4 - b.skorSkala4).slice(0, 2);
  const strategicRecommendations: AccreditationProjectionResult['strategicRecommendations'] = [];

  if (effectiveAuditPassRate < 85) {
    strategicRecommendations.push({
      prioritas: effectiveAuditPassRate < 70 ? 'Tinggi' : 'Sedang',
      fokus: 'Revisi RPS & Penguatan Kontribusi CPL (Kriteria 6 — Bobot 25%)',
      dampakEstimasi: '+2.5 s.d. +4.8 poin skor total',
      aksi: `Tuntaskan audit RPS mata kuliah dengan skor CPL <70% dan naikkan asesmen berbasis Case Method / Project-Based Learning agar kelulusan audit mencapai ≥85%.`
    });
  }

  if (latestYear.ipkRataRata < 3.25 || latestYear.masaTungguBulan > 3.5) {
    strategicRecommendations.push({
      prioritas: 'Tinggi',
      fokus: 'Akselerasi Yudisium, IPK & Tracer Study (Kriteria 9 — Bobot 10%)',
      dampakEstimasi: '+1.8 s.d. +3.2 poin skor total',
      aksi: `Pertahankan tren KTW (${effectiveLatestKtw.toFixed(1)}%), dorong percepatan sidang Tugas Akhir mahasiswa semester ≥8 melalui EWS, dan lengkapi sertifikasi pendamping ijazah (SKPI).`
    });
  }

  lowestCriteria.forEach(k => {
    strategicRecommendations.push({
      prioritas: k.skorSkala4 < 3.6 ? 'Tinggi' : 'Sedang',
      fokus: `${k.id}: ${k.nama.split(':')[1]?.trim() || k.nama} (Bobot ${k.bobotPersen}%)`,
      dampakEstimasi: `+${((4.0 - k.skorSkala4) * k.bobotPersen * 0.55).toFixed(1)} poin potensial`,
      aksi: k.rekomendasiPerbaikan
    });
  });

  if (onTrackUnggul) {
    strategicRecommendations.push({
      prioritas: 'Pertahankan',
      fokus: 'Konsistensi Tren KTW 3 Tahun & Portofolio OBE',
      dampakEstimasi: `Menjaga margin +${marginUnggul.toFixed(1)} poin di atas Unggul`,
      aksi: `Lakukan audit internal GPMF tiap akhir semester untuk memastikan seluruh dokumen LKPS/LED terarsip lengkap (${borang.kriteriaList.reduce((s, k) => s + k.dokumenTersedia, 0)}/${borang.kriteriaList.reduce((s, k) => s + k.dokumenDibutuhkan, 0)} berkas).`
    });
  }

  return {
    prodiId: prodi.id,
    peringkatSaatIni: borang.peringkatSaatIni,
    targetPeringkat: borang.targetPeringkat,
    graduationTrends3Years: trends,
    avgCplRealization: effectiveCplScore,
    cplTargetComplianceRatio,
    rpsAuditPassRate: Math.round(effectiveAuditPassRate),
    latestKtwPersen: effectiveLatestKtw,
    avgKtw3Years,
    ktwSlopePerYear,
    latestIpkRata: latestYear.ipkRataRata,
    ipkSlopePerYear,
    latestMasaTungguBulan: latestYear.masaTungguBulan,
    graduatesGrowthPercent,
    skorDasarBorang,
    skorK6Proyeksi,
    skorK9Proyeksi,
    skorAktualTerintegrasi,
    skorProyeksiAkhir,
    peringkatAktualEstimasi,
    peringkatProyeksi,
    baikSekaliTrack: {
      onTrack: onTrackBaikSekali,
      marginDariAmbang: marginBaikSekali,
      statusLabel: onTrackBaikSekali ? 'Jalur Aman Baik Sekali' : 'Perlu Penguatan Dasar',
      ringkasan: baikSekaliRingkasan
    },
    unggulTrack: {
      onTrack: onTrackUnggul,
      approaching: approachingUnggul,
      marginDariAmbang: marginUnggul,
      statusLabel: unggulStatusLabel,
      ringkasan: unggulRingkasan,
      syaratUnggulChecklist,
      jumlahSyaratTerpenuhi
    },
    timelineSeries,
    strategicRecommendations
  };
}
