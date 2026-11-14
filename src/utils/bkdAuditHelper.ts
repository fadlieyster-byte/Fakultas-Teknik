import { BkdLldiktiDosenMetric } from '../components/BkdLldiktiPdfModal';

export const BKD_MIN_SKS = 12;
export const BKD_MAX_SKS = 16;

export type BkdAuditViolationType = 'BEBAN_BERLEBIH' | 'BEBAN_KURANG' | 'SESUAI_ATURAN';

export interface BkdAuditItem {
  metric: BkdLldiktiDosenMetric;
  scheduledSks: number;
  profilKuliahSks: number;
  sksBimbinganApplied: number;
  bebanJadwalRiilSks: number;
  bebanAuditSks: number;
  selisihJadwalVsProfil: number;
  hasScheduleMismatch: boolean;
  isUnscheduled: boolean;
  isScheduleGapUnder12: boolean;
  violationType: BkdAuditViolationType;
  selisihDariAturanSks: number; // +N if >16, -N if <12, 0 if 12-16
  statusKepatuhanLabel: string;
  statusKepatuhanKode: 'MS' | 'TMS-LB' | 'TMS-KB';
  rekomendasiAudit: string;
}

export interface BkdRedistributionSuggestion {
  fromDosenName: string;
  fromDosenId: string;
  surplusSks: number;
  toDosenName: string;
  toDosenId: string;
  deficitSks: number;
  suggestedTransferSks: number;
  candidateCourseLabel?: string;
}

export interface BkdAuditSummary {
  totalDosen: number;
  compliantCount: number;
  overloadCount: number;
  underloadCount: number;
  violationCount: number;
  scheduleMismatchCount: number;
  complianceRatePersen: number;
  totalSurplusSks: number;
  totalDeficitSks: number;
  avgBebanRiilSks: number;
  redistributionSuggestions: BkdRedistributionSuggestion[];
}

const round1 = (val: number): number => Math.round(val * 10) / 10;

export function buildBkdAuditReport(
  metrics: BkdLldiktiDosenMetric[],
  calculationMode: 'bkd_total' | 'tatap_muka'
): { items: BkdAuditItem[]; summary: BkdAuditSummary } {
  const items: BkdAuditItem[] = metrics.map(metric => {
    const { dosen, scheduledClasses, scheduledSks, sksBimbingan, totalBebanSks } = metric;
    const profilKuliahSks = dosen.totalSksMengajar || 0;
    const sksBimbinganApplied = calculationMode === 'bkd_total' ? sksBimbingan : 0;
    const bebanJadwalRiilSks = round1(scheduledSks + sksBimbinganApplied);
    const bebanAuditSks = totalBebanSks;

    const selisihJadwalVsProfil = round1(scheduledSks - profilKuliahSks);
    const isUnscheduled = scheduledClasses.length === 0;
    const hasScheduleMismatch =
      !isUnscheduled && Math.abs(selisihJadwalVsProfil) >= 2;
    const isScheduleGapUnder12 =
      !isUnscheduled && bebanJadwalRiilSks < BKD_MIN_SKS && bebanAuditSks >= BKD_MIN_SKS;

    let violationType: BkdAuditViolationType = 'SESUAI_ATURAN';
    let selisihDariAturanSks = 0;
    let statusKepatuhanLabel = 'Memenuhi Aturan (12–16 SKS)';
    let statusKepatuhanKode: 'MS' | 'TMS-LB' | 'TMS-KB' = 'MS';

    if (bebanAuditSks > BKD_MAX_SKS) {
      violationType = 'BEBAN_BERLEBIH';
      selisihDariAturanSks = round1(bebanAuditSks - BKD_MAX_SKS);
      statusKepatuhanLabel = `TMS — Beban Berlebih (+${selisihDariAturanSks} SKS)`;
      statusKepatuhanKode = 'TMS-LB';
    } else if (bebanAuditSks < BKD_MIN_SKS) {
      violationType = 'BEBAN_KURANG';
      selisihDariAturanSks = -round1(BKD_MIN_SKS - bebanAuditSks);
      statusKepatuhanLabel = `TMS — Beban Kurang (-${Math.abs(selisihDariAturanSks)} SKS)`;
      statusKepatuhanKode = 'TMS-KB';
    }

    let rekomendasiAudit = '';
    if (violationType === 'BEBAN_BERLEBIH') {
      rekomendasiAudit = `Kurangi ${selisihDariAturanSks} SKS melalui skema team-teaching atau alihkan 1 kelas ke dosen berbeban <12 SKS agar mematuhi batas maks 16 SKS.`;
    } else if (violationType === 'BEBAN_KURANG') {
      const needSks = Math.abs(selisihDariAturanSks);
      rekomendasiAudit = `Tambahkan minimal ${needSks} SKS melalui penugasan kelas paralel/team-teaching, pembimbingan TA, atau ekuivalensi Penelitian/PkM BKD agar mencapai min 12 SKS.`;
    } else if (isScheduleGapUnder12) {
      rekomendasiAudit = `Total profil memenuhi 12–16 SKS, namun jadwal kuliah riil baru ${bebanJadwalRiilSks} SKS. Sinkronkan plot kelas di SIAKAD sebelum pelaporan SISTER.`;
    } else if (hasScheduleMismatch) {
      rekomendasiAudit = `Terdapat selisih ${selisihJadwalVsProfil > 0 ? `+${selisihJadwalVsProfil}` : selisihJadwalVsProfil} SKS antara jadwal riil (${scheduledSks} SKS) dan master profil (${profilKuliahSks} SKS). Perbarui data profil dosen.`;
    } else if (isUnscheduled) {
      rekomendasiAudit = `Beban sesuai aturan (12–16 SKS), namun belum terplot di jadwal reguler semester aktif. Pastikan SK mengajar/ekuivalensi BKD terlampir.`;
    } else {
      rekomendasiAudit = `Beban kerja riil seimbang dalam koridor 12–16 SKS PO BKD LLDIKTI & SN-Dikti. Pertahankan konsistensi presensi BAP.`;
    }

    return {
      metric,
      scheduledSks,
      profilKuliahSks,
      sksBimbinganApplied,
      bebanJadwalRiilSks,
      bebanAuditSks,
      selisihJadwalVsProfil,
      hasScheduleMismatch,
      isUnscheduled,
      isScheduleGapUnder12,
      violationType,
      selisihDariAturanSks,
      statusKepatuhanLabel,
      statusKepatuhanKode,
      rekomendasiAudit
    };
  });

  const overloadItems = items
    .filter(i => i.violationType === 'BEBAN_BERLEBIH')
    .sort((a, b) => b.bebanAuditSks - a.bebanAuditSks);
  const underloadItems = items
    .filter(i => i.violationType === 'BEBAN_KURANG')
    .sort((a, b) => a.bebanAuditSks - b.bebanAuditSks);
  const compliantItems = items.filter(i => i.violationType === 'SESUAI_ATURAN');

  const totalDosen = items.length;
  const compliantCount = compliantItems.length;
  const overloadCount = overloadItems.length;
  const underloadCount = underloadItems.length;
  const violationCount = overloadCount + underloadCount;
  const scheduleMismatchCount = items.filter(
    i => i.hasScheduleMismatch || i.isScheduleGapUnder12
  ).length;

  const complianceRatePersen =
    totalDosen > 0 ? Math.round((compliantCount / totalDosen) * 100) : 100;

  const totalSurplusSks = round1(
    overloadItems.reduce((sum, i) => sum + i.selisihDariAturanSks, 0)
  );
  const totalDeficitSks = round1(
    underloadItems.reduce((sum, i) => sum + Math.abs(i.selisihDariAturanSks), 0)
  );
  const avgBebanRiilSks =
    totalDosen > 0
      ? round1(items.reduce((sum, i) => sum + i.bebanJadwalRiilSks, 0) / totalDosen)
      : 0;

  // Build actionable pairing suggestions between overloaded and underloaded lecturers
  const redistributionSuggestions: BkdRedistributionSuggestion[] = [];
  if (overloadItems.length > 0 && underloadItems.length > 0) {
    const maxPairs = Math.min(overloadItems.length, underloadItems.length);
    for (let idx = 0; idx < maxPairs; idx++) {
      const ov = overloadItems[idx];
      const un = underloadItems[idx];
      const surplus = ov.selisihDariAturanSks;
      const deficit = Math.abs(un.selisihDariAturanSks);
      const candidateCls = ov.metric.scheduledClasses[0];
      redistributionSuggestions.push({
        fromDosenName: ov.metric.dosen.namaLengkap,
        fromDosenId: ov.metric.dosen.id,
        surplusSks: surplus,
        toDosenName: un.metric.dosen.namaLengkap,
        toDosenId: un.metric.dosen.id,
        deficitSks: deficit,
        suggestedTransferSks: Math.min(Math.max(2, Math.ceil(surplus)), Math.ceil(deficit) + 1),
        candidateCourseLabel: candidateCls
          ? `${candidateCls.kodeMK} ${candidateCls.namaMK} (${candidateCls.sks} SKS)`
          : undefined
      });
    }
  }

  return {
    items,
    summary: {
      totalDosen,
      compliantCount,
      overloadCount,
      underloadCount,
      violationCount,
      scheduleMismatchCount,
      complianceRatePersen,
      totalSurplusSks,
      totalDeficitSks,
      avgBebanRiilSks,
      redistributionSuggestions
    }
  };
}
