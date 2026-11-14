import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Edit3,
  Flame,
  Grid3X3,
  Layers,
  Search,
  Sparkles,
  Wrench
} from 'lucide-react';
import {
  CplItemObe,
  CpmkItemObe,
  MataKuliahCplMatrixRecord,
  ProgramStudiInfo
} from '../types/index';
import {
  buildObeQualityHeatmapReport,
  CourseHeatmapRow,
  LowObeComponentAlert,
  ObeHeatmapBand
} from '../utils/obeQualityHeatmapHelper';

interface MatriksKualitasRpsHeatmapProps {
  selectedProdi: ProgramStudiInfo;
  prodiCourses: MataKuliahCplMatrixRecord[];
  allMatrixCourses: MataKuliahCplMatrixRecord[];
  prodiCpls: CplItemObe[];
  onMatrixUpdated: () => void;
  onOpenCplMatrixTab: () => void;
  onShowToast?: (msg: string) => void;
}

const MATRIX_STORAGE_KEY = 'sikaprodi_v15_matriks_cpl_cpmk';

function getHeatmapCellStyle(band: ObeHeatmapBand, isSelected: boolean): string {
  const ring = isSelected ? 'ring-2 ring-slate-900 ring-offset-1 z-10 relative' : '';
  switch (band) {
    case 'CRITICAL_LOW':
      return `bg-rose-600 text-white border border-rose-700 hover:bg-rose-700 ${ring}`;
    case 'WARNING_LOW':
      return `bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200/80 ${ring}`;
    case 'GOOD':
      return `bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100/80 ${ring}`;
    case 'EXCELLENT':
      return `bg-emerald-100 text-emerald-900 border border-emerald-200 hover:bg-emerald-200/70 ${ring}`;
    default:
      return 'bg-slate-50 text-slate-300 border border-slate-200/70';
  }
}

function getScoreBadgeClass(score: number): string {
  if (score < 60) return 'bg-rose-600 text-white border-rose-700';
  if (score < 70) return 'bg-rose-100 text-rose-900 border-rose-300';
  if (score < 85) return 'bg-sky-50 text-sky-900 border-sky-200';
  return 'bg-emerald-100 text-emerald-900 border-emerald-200';
}

function rebalanceCpmkWeights(cpmks: CpmkItemObe[]): CpmkItemObe[] {
  if (cpmks.length === 0) return cpmks;
  const count = cpmks.length;
  const baseWeight = Math.floor(100 / count);
  const remainder = 100 - baseWeight * count;
  return cpmks.map((c, idx) => ({
    ...c,
    bobotPersen: idx === count - 1 ? baseWeight + remainder : baseWeight
  }));
}

export const MatriksKualitasRpsHeatmap: React.FC<MatriksKualitasRpsHeatmapProps> = ({
  selectedProdi,
  prodiCourses,
  allMatrixCourses,
  prodiCpls,
  onMatrixUpdated,
  onOpenCplMatrixTab,
  onShowToast
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'BELOW_70' | 'CRITICAL_60'>('ALL');
  const [selectedCplFilter, setSelectedCplFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDrillCourseId, setActiveDrillCourseId] = useState<string>('');
  const [selectedCellKey, setSelectedCellKey] = useState<{
    courseId: string;
    cplKode: string;
  } | null>(null);
  const [notifiedAlertIds, setNotifiedAlertIds] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'BOTH' | 'COURSE_MATRIX' | 'SUB_CPMK'>('BOTH');

  const report = useMemo(
    () =>
      buildObeQualityHeatmapReport({
        courses: prodiCourses,
        prodiCpls
      }),
    [prodiCourses, prodiCpls]
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return report.rows.filter(row => {
      if (filterMode === 'BELOW_70' && row.below70ComponentCount === 0) return false;
      if (filterMode === 'CRITICAL_60') {
        const hasCritical = Object.values(row.cellsByCpl).some(
          c => c.score !== null && c.score < 60
        );
        if (!hasCritical) return false;
      }
      if (selectedCplFilter) {
        const cell = row.cellsByCpl[selectedCplFilter];
        if (!cell || cell.score === null) return false;
        if (filterMode === 'BELOW_70' && !cell.isBelow70) return false;
      }
      if (q) {
        const hit =
          row.course.kodeMK.toLowerCase().includes(q) ||
          row.course.namaMK.toLowerCase().includes(q) ||
          row.course.dosenPengampu.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [report.rows, filterMode, selectedCplFilter, searchQuery]);

  const effectiveDrillCourse: CourseHeatmapRow | null = useMemo(() => {
    if (activeDrillCourseId) {
      const found = report.rows.find(r => r.course.id === activeDrillCourseId);
      if (found) return found;
    }
    if (report.rows.length > 0) {
      return report.rows[0];
    }
    return null;
  }, [activeDrillCourseId, report.rows]);

  const activeInspectionAlert: LowObeComponentAlert | null = useMemo(() => {
    if (selectedCellKey) {
      const foundAlert = report.lowScoreAlerts.find(
        a => a.course.id === selectedCellKey.courseId && a.cplKode === selectedCellKey.cplKode
      );
      if (foundAlert) return foundAlert;

      const row = report.rows.find(r => r.course.id === selectedCellKey.courseId);
      const cell = row?.cellsByCpl[selectedCellKey.cplKode];
      const cpl = prodiCpls.find(c => c.kode === selectedCellKey.cplKode);
      if (row && cell && cell.score !== null && cpl) {
        return {
          id: `${row.course.id}-${cpl.kode}`,
          course: row.course,
          cplKode: cpl.kode,
          cplJudul: cpl.judul,
          componentPath: `${cpl.kode} → CPMK (${cell.linkedCpmkCount}) → Sub-CPMK (${cell.subCpmkCount})`,
          cpmkKode: row.course.cpmkList?.[0]?.kode || 'CPMK-1',
          subCpmkKode: 'Sub-CPMK 1.1–1.2',
          score: cell.score,
          matrixLevel: cell.matrixLevel,
          diagnosis: cell.diagnosis,
          suggestedIntervention: cell.suggestedIntervention
        };
      }
    }
    return report.lowScoreAlerts[0] || null;
  }, [selectedCellKey, report.lowScoreAlerts, report.rows, prodiCpls]);

  const applyRpsIntervention = (courseId: string, targetCplKode?: string) => {
    const updated = allMatrixCourses.map(mk => {
      if (mk.id !== courseId) return mk;

      const nextPemetaan = { ...(mk.pemetaanCpl || {}) };
      const mappedCpls = Object.entries(nextPemetaan)
        .filter(([, lv]) => lv !== 'None')
        .map(([kode]) => kode);

      if (targetCplKode && (!nextPemetaan[targetCplKode] || nextPemetaan[targetCplKode] === 'None')) {
        nextPemetaan[targetCplKode] = 'Medium';
        mappedCpls.push(targetCplKode);
      }

      const fallbackCpls =
        mappedCpls.length > 0 ? mappedCpls : prodiCpls.slice(0, 2).map(c => c.kode);

      let nextCpmks: CpmkItemObe[] =
        mk.cpmkList && mk.cpmkList.length > 0
          ? mk.cpmkList.map(c => ({ ...c, cplTerkait: [...(c.cplTerkait || [])] }))
          : [
              {
                kode: 'CPMK-1',
                deskripsi: `Mampu menganalisis konsep fundamental dan pemodelan teknik pada ${mk.namaMK} (C4).`,
                levelBloom: 'C4 - Analisis',
                cplTerkait: [...fallbackCpls],
                metodeAsesmen: 'Case Method & Kuis',
                bobotPersen: 50
              },
              {
                kode: 'CPMK-2',
                deskripsi: `Mampu merancang dan mengevaluasi solusi rekayasa berbasis standar OBE pada ${mk.namaMK} (C4).`,
                levelBloom: 'C4 - Analisis',
                cplTerkait: [...fallbackCpls],
                metodeAsesmen: 'Project-Based / Rubrik Laporan',
                bobotPersen: 50
              }
            ];

      if (targetCplKode) {
        const isLinkedAnywhere = nextCpmks.some(cp => cp.cplTerkait.includes(targetCplKode));
        if (!isLinkedAnywhere && nextCpmks.length > 0) {
          nextCpmks[0].cplTerkait.push(targetCplKode);
        }
      } else {
        // Ensure every mapped CPL on course is linked to at least one CPMK
        fallbackCpls.forEach((cplKode, idx) => {
          const isLinked = nextCpmks.some(cp => cp.cplTerkait.includes(cplKode));
          if (!isLinked && nextCpmks.length > 0) {
            nextCpmks[idx % nextCpmks.length].cplTerkait.push(cplKode);
          }
        });
      }

      // Upgrade Bloom >= C4 and authentic assessment for low-scoring nodes
      nextCpmks = nextCpmks.map((cp, idx) => {
        const bloomUpper = (cp.levelBloom || '').toUpperCase();
        const needsBloomUpgrade =
          !bloomUpper.includes('C4') &&
          !bloomUpper.includes('C5') &&
          !bloomUpper.includes('C6') &&
          !bloomUpper.includes('P3') &&
          !bloomUpper.includes('P4');
        const nextBloom = needsBloomUpgrade ? 'C4 - Analisis' : cp.levelBloom;

        const mLower = (cp.metodeAsesmen || '').toLowerCase();
        const hasAuthentic =
          mLower.includes('proyek') ||
          mLower.includes('project') ||
          mLower.includes('kasus') ||
          mLower.includes('case') ||
          mLower.includes('praktikum') ||
          mLower.includes('presentasi') ||
          mLower.includes('rubrik');
        const nextMetode = hasAuthentic
          ? cp.metodeAsesmen
          : idx % 2 === 0
          ? `${cp.metodeAsesmen ? cp.metodeAsesmen + ' + ' : ''}Case Method (Rubrik)`
          : `${cp.metodeAsesmen ? cp.metodeAsesmen + ' + ' : ''}Project-Based Learning`;

        return {
          ...cp,
          levelBloom: nextBloom,
          metodeAsesmen: nextMetode
        };
      });

      const totalBobot = nextCpmks.reduce((s, c) => s + (c.bobotPersen || 0), 0);
      if (Math.abs(totalBobot - 100) > 2 || nextCpmks.some(c => (c.bobotPersen || 0) < 15)) {
        nextCpmks = rebalanceCpmkWeights(nextCpmks);
      }

      return {
        ...mk,
        pemetaanCpl: nextPemetaan,
        cpmkList: nextCpmks
      };
    });

    try {
      localStorage.setItem(MATRIX_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    onMatrixUpdated();
    const targetMk = prodiCourses.find(c => c.id === courseId);
    onShowToast?.(
      `Intervensi RPS diterapkan pada ${targetMk?.kodeMK || courseId}${
        targetCplKode ? ` (${targetCplKode})` : ''
      }: tautan CPL–CPMK, taksonomi C4, & asesmen autentik diperbarui.`
    );
  };

  const handleNotifyLecturer = (alert: LowObeComponentAlert) => {
    setNotifiedAlertIds(prev => ({ ...prev, [alert.id]: true }));
    onShowToast?.(
      `Instruksi intervensi RPS (${alert.componentPath}, Skor ${alert.score}/100) dikirim ke ${alert.course.dosenPengampu}.`
    );
  };

  return (
    <div className="space-y-5">
      {/* Header & 4 KPI Strip */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
              <Grid3X3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Peta Panas Korelasi OBE (CPL → CPMK → Sub-CPMK)</span>
                <span aria-hidden="true">·</span>
                <span>{selectedProdi.nama}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px] font-semibold text-rose-700">
                  Ambang Intervensi &lt; 70
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Matriks Analisis Kualitas RPS &amp; Sorotan Komponen Skor &lt; 70
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                Memvisualisasikan kekuatan korelasi antara komponen CPL, CPMK, dan Sub-CPMK pada
                seluruh RPS {selectedProdi.singkatan}. Sel bernilai di bawah 70 disorot merah agar
                prodi dapat langsung melakukan intervensi perbaikan konstruksi RPS dan asesmen.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCplMatrixTab}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Buka Editor Matriks CPL–CPMK</span>
            </button>
          </div>
        </div>

        {/* 4-Cell KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-slate-50/60">
          <div className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Korelasi OBE Dipetakan
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {report.totalActiveCorrelations}
              </span>
              <span className="text-xs text-slate-500">
                sel ({report.totalCourses} MK)
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Rerata Skor Korelasi OBE
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  report.avgObeCorrelationScore >= 75
                    ? 'text-emerald-700'
                    : report.avgObeCorrelationScore >= 70
                    ? 'text-sky-700'
                    : 'text-rose-700'
                }`}
              >
                {report.avgObeCorrelationScore}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setFilterMode(prev => (prev === 'BELOW_70' ? 'ALL' : 'BELOW_70'))
            }
            className={`p-4 text-left transition-colors cursor-pointer ${
              filterMode === 'BELOW_70' ? 'bg-rose-50/90' : 'hover:bg-rose-50/50'
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 flex items-center justify-between gap-1">
              <span>Komponen Skor &lt; 70</span>
              <Flame className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-rose-700">
                {report.below70Count}
              </span>
              <span className="text-xs text-rose-700 font-medium">
                ({report.criticalBelow60Count} kritis &lt;60)
              </span>
            </div>
          </button>

          <div className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              MK Perlu Intervensi RPS
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-amber-700">
                {report.coursesNeedingInterventionCount}
              </span>
              <span className="text-xs text-slate-500">
                dari {report.totalCourses} MK
              </span>
            </div>
          </div>
        </div>

        {/* Per-CPL Hotspot Strip */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Sorotan Hotspot Korelasi per Butir CPL (Klik untuk Filter CPL)
            </span>
            {selectedCplFilter && (
              <button
                type="button"
                onClick={() => setSelectedCplFilter(null)}
                className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Reset Filter CPL ({selectedCplFilter})
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {report.cplHotspots.map(item => {
              const active = selectedCplFilter === item.cpl.kode;
              const hasIssue = item.below70Count > 0;
              return (
                <button
                  key={item.cpl.kode}
                  type="button"
                  onClick={() =>
                    setSelectedCplFilter(prev =>
                      prev === item.cpl.kode ? null : item.cpl.kode
                    )
                  }
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : hasIssue
                      ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70'
                      : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold">{item.cpl.kode}</span>
                    <span
                      className={`font-mono text-xs font-bold tabular-nums ${
                        active
                          ? 'text-white'
                          : item.avgScore < 70
                          ? 'text-rose-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {item.avgScore}
                    </span>
                  </div>
                  <div
                    className={`text-[10px] mt-1 font-medium truncate ${
                      active
                        ? 'text-slate-200'
                        : hasIssue
                        ? 'text-rose-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {hasIssue ? `${item.below70Count} sel < 70` : `${item.activeCourseCount} MK optimal`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter & Legend Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterMode === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Semua MK ({report.totalCourses})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('BELOW_70')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterMode === 'BELOW_70'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            Skor &lt; 70 Perlu Intervensi ({report.coursesNeedingInterventionCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('CRITICAL_60')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterMode === 'CRITICAL_60'
                ? 'bg-rose-800 text-white border-rose-900'
                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
            }`}
          >
            Kritis &lt; 60 ({report.criticalBelow60Count} sel)
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px]">
            {(
              [
                { id: 'BOTH', label: 'Semua Panel' },
                { id: 'COURSE_MATRIX', label: 'Peta MK × CPL' },
                { id: 'SUB_CPMK', label: 'Detail Sub-CPMK' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewMode(tab.id)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  viewMode === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-rose-600 border border-rose-700 inline-block" />
              &lt;60 Kritis
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-rose-100 border border-rose-300 inline-block" />
              60–69 Intervensi
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-sky-50 border border-sky-200 inline-block" />
              70–84 Baik
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-200 inline-block" />
              85–100 Optimal
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari MK atau dosen..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* HEATMAP GRID 1: PRODI-WIDE MK × CPL + CPMK COHERENCE + SUB-CPMK READINESS */}
      {(viewMode === 'BOTH' || viewMode === 'COURSE_MATRIX') && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Heatmap Korelasi OBE per Mata Kuliah (Skor 1–100)
              </h3>
              <p className="text-[11px] text-slate-500">
                Klik sel heatmap manapun untuk membedah jalur CPL → CPMK → Sub-CPMK dan
                menerapkan intervensi RPS pada skor di bawah 70.
              </p>
            </div>
            <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-600">
              Menampilkan {filteredRows.length} dari {report.totalCourses} MK
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-2.5 px-3 text-left font-semibold min-w-[215px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                    Mata Kuliah &amp; Pengampu
                  </th>
                  {prodiCpls.map(cpl => (
                    <th
                      key={cpl.kode}
                      className={`py-2.5 px-1.5 text-center font-mono text-[11px] font-bold min-w-[58px] ${
                        selectedCplFilter === cpl.kode ? 'bg-slate-200 text-slate-900' : ''
                      }`}
                      title={`${cpl.kode}: ${cpl.judul}`}
                    >
                      {cpl.kode}
                    </th>
                  ))}
                  <th
                    className="py-2.5 px-2 text-center font-semibold border-l border-slate-200 min-w-[74px]"
                    title="Koherensi Struktur CPMK & Bobot"
                  >
                    CPMK
                  </th>
                  <th
                    className="py-2.5 px-2 text-center font-semibold min-w-[78px]"
                    title="Kesiapan Asesmen Sub-CPMK"
                  >
                    Sub-CPMK
                  </th>
                  <th className="py-2.5 px-2.5 text-center font-semibold border-l border-slate-200 min-w-[78px]">
                    Skor OBE
                  </th>
                  <th className="py-2.5 px-3 text-right font-semibold min-w-[110px]">
                    Intervensi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={prodiCpls.length + 5}
                      className="py-8 text-center text-slate-500"
                    >
                      Tidak ada mata kuliah yang memenuhi kriteria filter heatmap.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map(row => {
                    const isActiveDrill = effectiveDrillCourse?.course.id === row.course.id;
                    return (
                      <tr
                        key={row.course.id}
                        className={
                          isActiveDrill
                            ? 'bg-blue-50/40'
                            : row.below70ComponentCount > 0
                            ? 'bg-rose-50/20 hover:bg-rose-50/40'
                            : 'hover:bg-slate-50/75'
                        }
                      >
                        <td className="py-2.5 px-3 sticky left-0 bg-white z-10 border-r border-slate-200 align-middle">
                          <button
                            type="button"
                            onClick={() => setActiveDrillCourseId(row.course.id)}
                            className="text-left w-full group cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-mono font-bold text-slate-900 group-hover:text-blue-700">
                                {row.course.kodeMK}
                              </span>
                              {row.below70ComponentCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-mono text-[10px] font-bold tabular-nums">
                                  {row.below70ComponentCount} &lt;70
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-medium text-slate-700 truncate max-w-[195px]">
                              {row.course.namaMK}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[195px]">
                              {row.course.dosenPengampu} · Smt {row.course.semester}
                            </div>
                          </button>
                        </td>

                        {prodiCpls.map(cpl => {
                          const cell = row.cellsByCpl[cpl.kode];
                          const isSelected =
                            selectedCellKey?.courseId === row.course.id &&
                            selectedCellKey?.cplKode === cpl.kode;

                          if (!cell || cell.score === null) {
                            return (
                              <td key={cpl.kode} className="p-1 text-center align-middle">
                                <div className="h-9 rounded-md bg-slate-50 border border-slate-200/50 flex items-center justify-center font-mono text-[11px] text-slate-300">
                                  —
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td key={cpl.kode} className="p-1 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDrillCourseId(row.course.id);
                                  setSelectedCellKey({
                                    courseId: row.course.id,
                                    cplKode: cpl.kode
                                  });
                                }}
                                title={`${row.course.kodeMK} × ${cpl.kode} (${cell.matrixLevel}): Skor ${cell.score}/100 — ${cell.diagnosis}`}
                                className={`w-full h-9 rounded-md font-mono text-xs font-bold tabular-nums flex flex-col items-center justify-center leading-none transition-colors cursor-pointer ${getHeatmapCellStyle(
                                  cell.band,
                                  isSelected
                                )}`}
                              >
                                <span>{cell.score}</span>
                                {cell.isBelow70 && (
                                  <span className="text-[8px] uppercase tracking-tight opacity-90 mt-0.5">
                                    ! &lt;70
                                  </span>
                                )}
                              </button>
                            </td>
                          );
                        })}

                        <td className="p-1.5 text-center align-middle border-l border-slate-200">
                          <span
                            className={`inline-block px-2 py-1 rounded border font-mono text-[11px] font-bold tabular-nums ${getScoreBadgeClass(
                              row.cpmkCoherenceScore
                            )}`}
                          >
                            {row.cpmkCoherenceScore}
                          </span>
                        </td>

                        <td className="p-1.5 text-center align-middle">
                          <span
                            className={`inline-block px-2 py-1 rounded border font-mono text-[11px] font-bold tabular-nums ${getScoreBadgeClass(
                              row.subCpmkReadinessScore
                            )}`}
                          >
                            {row.subCpmkReadinessScore}
                          </span>
                        </td>

                        <td className="p-1.5 text-center align-middle border-l border-slate-200">
                          <span
                            className={`inline-block px-2 py-1 rounded border font-mono text-xs font-bold tabular-nums ${getScoreBadgeClass(
                              row.overallObeScore
                            )}`}
                          >
                            {row.overallObeScore}
                          </span>
                        </td>

                        <td className="py-2 px-3 text-right align-middle">
                          {row.below70ComponentCount > 0 ? (
                            <button
                              type="button"
                              onClick={() => applyRpsIntervention(row.course.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Perbaiki RPS</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selaras</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SPLIT SECTION: DRILL-DOWN SUB-CPMK MATRIX + INTERVENTION INSPECTOR */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* MATRIX 2: CPL × CPMK–SubCPMK DRILL-DOWN */}
        {(viewMode === 'BOTH' || viewMode === 'SUB_CPMK') && (
          <div
            className={`${
              viewMode === 'SUB_CPMK' ? 'xl:col-span-12' : 'xl:col-span-7'
            } bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs`}
          >
            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Peta Korelasi Detail: CPL × CPMK × Sub-CPMK
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Menelusuri butir Sub-CPMK penyebab skor OBE di bawah 70 pada mata kuliah terpilih.
                  </p>
                </div>
              </div>

              {report.rows.length > 0 && (
                <select
                  value={effectiveDrillCourse?.course.id || ''}
                  onChange={e => setActiveDrillCourseId(e.target.value)}
                  className="text-xs font-semibold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-900 max-w-xs"
                >
                  {report.rows.map(r => (
                    <option key={r.course.id} value={r.course.id}>
                      {r.course.kodeMK} — {r.course.namaMK} ({r.below70ComponentCount} &lt;70)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {effectiveDrillCourse ? (
              <div className="overflow-x-auto">
                {effectiveDrillCourse.subNodes.length === 0 ? (
                  <div className="p-6 text-center space-y-3">
                    <div className="text-xs font-semibold text-rose-700">
                      RPS {effectiveDrillCourse.course.kodeMK} belum memiliki rincian butir CPMK &amp; Sub-CPMK.
                    </div>
                    <button
                      type="button"
                      onClick={() => applyRpsIntervention(effectiveDrillCourse.course.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Bangkitkan Struktur CPMK &amp; Sub-CPMK Otomatis</span>
                    </button>
                  </div>
                ) : (
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="py-2 px-3 text-left font-semibold min-w-[220px]">
                          Jalur CPMK → Sub-CPMK &amp; Asesmen
                        </th>
                        {prodiCpls.map(cpl => (
                          <th
                            key={cpl.kode}
                            className="py-2 px-1 text-center font-mono text-[10px] font-bold min-w-[46px]"
                          >
                            {cpl.kode}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {effectiveDrillCourse.subNodes.map(node => (
                        <tr key={node.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 align-top">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-bold text-indigo-700">
                                {node.cpmkKode}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="font-mono text-[11px] font-bold text-slate-900">
                                {node.subKode}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold">
                                {node.bobotPersen}%
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                              {node.judulSubCpmk}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {node.levelBloom} · {node.metodeAsesmen}
                            </div>
                          </td>

                          {prodiCpls.map(cpl => {
                            const subCell = node.cellScoresByCpl[cpl.kode];
                            if (!subCell || subCell.score === null) {
                              return (
                                <td key={cpl.kode} className="p-1 text-center align-middle">
                                  <div className="h-8 rounded bg-slate-50 text-slate-300 font-mono text-[10px] flex items-center justify-center">
                                    —
                                  </div>
                                </td>
                              );
                            }
                            return (
                              <td key={cpl.kode} className="p-1 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedCellKey({
                                      courseId: effectiveDrillCourse.course.id,
                                      cplKode: cpl.kode
                                    })
                                  }
                                  title={`${node.subKode} × ${cpl.kode}: Skor ${subCell.score}/100 — ${subCell.diagnosis}`}
                                  className={`w-full h-8 rounded font-mono text-[11px] font-bold tabular-nums flex items-center justify-center cursor-pointer ${getHeatmapCellStyle(
                                    subCell.band,
                                    selectedCellKey?.courseId === effectiveDrillCourse.course.id &&
                                      selectedCellKey?.cplKode === cpl.kode
                                  )}`}
                                >
                                  {subCell.score}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* PANEL INTERVENSI KOMPONEN SKOR < 70 */}
        <div
          className={`${
            viewMode === 'SUB_CPMK' ? 'xl:col-span-12' : 'xl:col-span-5'
          } bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-0`}
        >
          <div className="px-5 py-3.5 border-b border-slate-200 bg-rose-50/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">
                Panel Intervensi Komponen Skor &lt; 70
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-mono text-[11px] font-bold tabular-nums">
              {report.lowScoreAlerts.length} Temuan
            </span>
          </div>

          {activeInspectionAlert ? (
            <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-900">
                    {activeInspectionAlert.course.kodeMK} — {activeInspectionAlert.course.namaMK}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Pengampu: {activeInspectionAlert.course.dosenPengampu} · Jalur:{' '}
                    <span className="font-mono font-semibold text-slate-800">
                      {activeInspectionAlert.componentPath}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg border font-mono text-sm font-bold tabular-nums shrink-0 ${getScoreBadgeClass(
                    activeInspectionAlert.score
                  )}`}
                >
                  {activeInspectionAlert.score}/100
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div>
                  <span className="font-bold text-slate-800">Diagnosis Akar Masalah: </span>
                  <span className="text-slate-700">{activeInspectionAlert.diagnosis}</span>
                </div>
                <div>
                  <span className="font-bold text-indigo-800">Rencana Intervensi Prodi: </span>
                  <span className="text-slate-700">
                    {activeInspectionAlert.suggestedIntervention}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeInspectionAlert.score < 70 && (
                  <button
                    type="button"
                    onClick={() =>
                      applyRpsIntervention(
                        activeInspectionAlert.course.id,
                        activeInspectionAlert.cplKode
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Terapkan Intervensi Perbaikan RPS</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleNotifyLecturer(activeInspectionAlert)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    notifiedAlertIds[activeInspectionAlert.id]
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>
                    {notifiedAlertIds[activeInspectionAlert.id]
                      ? 'Instruksi Terkirim ke Dosen'
                      : 'Instruksikan Revisi Dosen'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 border-b border-slate-200 text-xs text-emerald-800 bg-emerald-50/50 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Seluruh komponen CPL–CPMK–SubCPMK pada {selectedProdi.nama} sudah melampaui ambang skor 70.
              </span>
            </div>
          )}

          {/* Prioritized Queue of <70 Components */}
          <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
            {report.lowScoreAlerts.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 text-center">
                Tidak ada antrean komponen OBE di bawah skor 70.
              </div>
            ) : (
              report.lowScoreAlerts.map(alert => {
                const selected =
                  selectedCellKey?.courseId === alert.course.id &&
                  selectedCellKey?.cplKode === alert.cplKode;
                return (
                  <div
                    key={alert.id}
                    className={`p-3 flex items-center justify-between gap-2 transition-colors ${
                      selected ? 'bg-rose-50/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDrillCourseId(alert.course.id);
                        setSelectedCellKey({
                          courseId: alert.course.id,
                          cplKode: alert.cplKode
                        });
                      }}
                      className="text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {alert.course.kodeMK}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-rose-700 truncate">
                          {alert.componentPath}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {alert.diagnosis}
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded border font-mono text-[11px] font-bold tabular-nums ${getScoreBadgeClass(
                          alert.score
                        )}`}
                      >
                        {alert.score}
                      </span>
                      <button
                        type="button"
                        onClick={() => applyRpsIntervention(alert.course.id, alert.cplKode)}
                        title="Terapkan perbaikan otomatis CPL-CPMK-Asesmen"
                        className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
