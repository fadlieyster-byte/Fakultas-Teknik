import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileText,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Upload,
  Wand2
} from 'lucide-react';
import { CplItemObe, MataKuliahCplMatrixRecord, ProgramStudiInfo } from '../types/index';
import {
  AiRpsEvaluationResult,
  AiRpsImprovementRecommendation,
  buildDefaultRpsDraftForCourse,
  buildDraftSignature,
  buildRpsPreScanEvaluation,
  evaluateRpsWithAi,
  mapAspectToDraftField,
  RpsDraftPayload
} from '../utils/aiRpsEvaluatorHelper';

interface AiRpsEvaluatorPanelProps {
  selectedProdi: ProgramStudiInfo;
  courses: MataKuliahCplMatrixRecord[];
  prodiCpls: CplItemObe[];
  onShowToast?: (msg: string) => void;
}

const AI_RPS_CACHE_KEY = 'sikaprodi_v16_ai_rps_obe5_evaluations';

function getScoreToneClass(score: number): string {
  if (score >= 85) return 'text-emerald-700';
  if (score >= 75) return 'text-blue-700';
  if (score >= 60) return 'text-amber-700';
  return 'text-rose-700';
}

function getBarBgClass(score: number): string {
  if (score >= 85) return 'bg-emerald-600';
  if (score >= 75) return 'bg-blue-600';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-rose-600';
}

function getFieldBadgeClass(score: number): string {
  if (score >= 85) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (score >= 75) return 'bg-blue-50 text-blue-800 border-blue-200';
  if (score >= 60) return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-rose-50 text-rose-800 border-rose-200';
}

export const AiRpsEvaluatorPanel: React.FC<AiRpsEvaluatorPanelProps> = ({
  selectedProdi,
  courses,
  prodiCpls,
  onShowToast
}) => {
  const [aiCache, setAiCache] = useState<Record<string, AiRpsEvaluationResult>>(() => {
    try {
      const saved = localStorage.getItem(AI_RPS_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id ?? '');
  const [filterMode, setFilterMode] = useState<
    'ALL' | 'AI_DONE' | 'NEEDS_REVISION' | 'UNGGUL'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draftsByCourseId, setDraftsByCourseId] = useState<Record<string, RpsDraftPayload>>({});
  const [autoAiEnabled, setAutoAiEnabled] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(AI_RPS_CACHE_KEY, JSON.stringify(aiCache));
    } catch {}
  }, [aiCache]);

  const resolvedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) ?? courses[0] ?? null;
  }, [courses, selectedCourseId]);

  const evaluatedItems = useMemo(() => {
    return courses.map(course => {
      const draft =
        draftsByCourseId[course.id] ?? buildDefaultRpsDraftForCourse(course, prodiCpls);
      const signature = buildDraftSignature(draft);
      const cachedAi = aiCache[course.id];
      const useCachedAi = cachedAi && cachedAi.draftSignature === signature;
      const evaluation = useCachedAi
        ? cachedAi
        : buildRpsPreScanEvaluation(course, prodiCpls, draft);
      return { course, draft, evaluation };
    });
  }, [courses, prodiCpls, draftsByCourseId, aiCache]);

  const filteredCourseEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return evaluatedItems.filter(({ course, evaluation }) => {
      const matchFilter =
        filterMode === 'ALL'
          ? true
          : filterMode === 'AI_DONE'
          ? evaluation.source === 'AI_GEMINI'
          : filterMode === 'NEEDS_REVISION'
          ? evaluation.skorTotalObe < 75
          : evaluation.skorTotalObe >= 85;
      const matchSearch =
        !q ||
        course.kodeMK.toLowerCase().includes(q) ||
        course.namaMK.toLowerCase().includes(q) ||
        course.dosenPengampu.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [evaluatedItems, filterMode, searchQuery]);

  const summary = useMemo(() => {
    const total = evaluatedItems.length;
    const aiEvaluatedCount = evaluatedItems.filter(
      e => e.evaluation.source === 'AI_GEMINI'
    ).length;
    const avgOf = (pick: (ev: AiRpsEvaluationResult) => number) =>
      total > 0
        ? Math.round(
            (evaluatedItems.reduce((s, e) => s + pick(e.evaluation), 0) / total) * 10
          ) / 10
        : 0;
    const avgScore = avgOf(ev => ev.skorTotalObe);
    const avgCpl = Math.round(avgOf(ev => ev.skorCpl));
    const avgCpmk = Math.round(avgOf(ev => ev.skorCpmk));
    const avgSubCpmk = Math.round(avgOf(ev => ev.skorSubCpmk));
    const avgAsesmen = Math.round(avgOf(ev => ev.skorAsesmen));
    const avgBahanKajian = Math.round(avgOf(ev => ev.skorBahanKajian));
    const needsRevisionCount = evaluatedItems.filter(
      e => e.evaluation.skorTotalObe < 75
    ).length;
    return {
      total,
      aiEvaluatedCount,
      avgScore,
      avgCpl,
      avgCpmk,
      avgSubCpmk,
      avgAsesmen,
      avgBahanKajian,
      needsRevisionCount
    };
  }, [evaluatedItems]);

  const activeEntry = useMemo(() => {
    if (!resolvedCourse) return null;
    return evaluatedItems.find(e => e.course.id === resolvedCourse.id) ?? null;
  }, [evaluatedItems, resolvedCourse]);

  // Auto-AI real-time debounced analysis when user enables live AI scan
  useEffect(() => {
    if (!autoAiEnabled || !activeEntry) return;
    const draftSig = buildDraftSignature(activeEntry.draft);
    if (
      aiCache[activeEntry.course.id]?.draftSignature === draftSig &&
      aiCache[activeEntry.course.id]?.source === 'AI_GEMINI'
    ) {
      return;
    }

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    const targetCourse = activeEntry.course;
    const targetDraft = activeEntry.draft;

    debounceTimerRef.current = window.setTimeout(async () => {
      setIsEvaluating(true);
      setEvalError(null);
      try {
        const result = await evaluateRpsWithAi({
          course: targetCourse,
          prodiNama: selectedProdi.nama,
          prodiCpls,
          draft: targetDraft
        });
        setAiCache(prev => ({ ...prev, [targetCourse.id]: result }));
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Gagal menjalankan analisis AI real-time.';
        setEvalError(msg);
      } finally {
        setIsEvaluating(false);
      }
    }, 1300);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [autoAiEnabled, activeEntry, selectedProdi.nama, prodiCpls, aiCache]);

  const updateActiveDraft = (patch: Partial<RpsDraftPayload>) => {
    if (!resolvedCourse) return;
    const current =
      draftsByCourseId[resolvedCourse.id] ??
      buildDefaultRpsDraftForCourse(resolvedCourse, prodiCpls);
    setDraftsByCourseId(prev => ({
      ...prev,
      [resolvedCourse.id]: { ...current, ...patch }
    }));
  };

  const handleApplySuggestionToDraft = (rec: AiRpsImprovementRecommendation) => {
    if (!activeEntry || !rec.saranKontenPengganti?.trim()) return;
    const targetKey = rec.targetField || mapAspectToDraftField(rec.aspek);
    updateActiveDraft({ [targetKey]: rec.saranKontenPengganti.trim() });
    onShowToast?.(
      `Saran konten untuk komponen ${rec.aspek} diterapkan langsung ke draft RPS ${activeEntry.course.kodeMK}. Skor diperbarui real-time.`
    );
  };

  const handleApplyAllSuggestions = () => {
    if (!activeEntry) return;
    const patch: Partial<RpsDraftPayload> = {};
    let appliedCount = 0;
    activeEntry.evaluation.rekomendasiPerbaikan.forEach(rec => {
      if (rec.saranKontenPengganti?.trim()) {
        const targetKey = rec.targetField || mapAspectToDraftField(rec.aspek);
        patch[targetKey] = rec.saranKontenPengganti.trim();
        appliedCount += 1;
      }
    });
    if (appliedCount === 0) return;
    updateActiveDraft(patch);
    onShowToast?.(
      `${appliedCount} saran perbaikan konten OBE diterapkan ke draft RPS ${activeEntry.course.kodeMK}.`
    );
  };

  const handleUploadRpsTextFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !resolvedCourse) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      updateActiveDraft({ customRpsText: content.slice(0, 8000) });
      onShowToast?.(`Teks dokumen "${file.name}" dimuat dan dipindai secara real-time.`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleEvaluateSingleWithAi = async () => {
    if (!activeEntry) return;
    setEvalError(null);
    setIsEvaluating(true);
    try {
      const result = await evaluateRpsWithAi({
        course: activeEntry.course,
        prodiNama: selectedProdi.nama,
        prodiCpls,
        draft: activeEntry.draft
      });
      setAiCache(prev => ({ ...prev, [activeEntry.course.id]: result }));
      onShowToast?.(
        `Evaluasi AI selesai untuk ${activeEntry.course.kodeMK}: Skor OBE ${result.skorTotalObe}/100 (${result.predikatObe}).`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal menjalankan evaluasi AI RPS.';
      setEvalError(message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEvaluateBatchWithAi = async () => {
    const targets = evaluatedItems
      .filter(e => e.evaluation.source !== 'AI_GEMINI')
      .slice(0, 3);
    const listToRun = targets.length > 0 ? targets : evaluatedItems.slice(0, 3);
    if (listToRun.length === 0) return;

    setEvalError(null);
    setIsEvaluating(true);
    let successCount = 0;

    try {
      for (let i = 0; i < listToRun.length; i++) {
        const entry = listToRun[i];
        setBatchProgress(
          `Mengevaluasi ${i + 1}/${listToRun.length}: ${entry.course.kodeMK}...`
        );
        const result = await evaluateRpsWithAi({
          course: entry.course,
          prodiNama: selectedProdi.nama,
          prodiCpls,
          draft: entry.draft
        });
        setAiCache(prev => ({ ...prev, [entry.course.id]: result }));
        successCount += 1;
      }
      onShowToast?.(
        `Pemindaian AI batch selesai untuk ${successCount} mata kuliah di ${selectedProdi.singkatan}.`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal menyelesaikan pemindaian batch AI RPS.';
      setEvalError(message);
    } finally {
      setBatchProgress(null);
      setIsEvaluating(false);
    }
  };

  const handleCopyRecommendations = () => {
    if (!activeEntry) return;
    const { course, evaluation } = activeEntry;
    const lines = [
      `HASIL EVALUASI AI RPS EVALUATOR (OBE) — ${course.kodeMK} ${course.namaMK}`,
      `Program Studi: ${selectedProdi.nama} | Dosen Pengampu: ${course.dosenPengampu}`,
      `Skor Kelengkapan OBE Total: ${evaluation.skorTotalObe}/100 (${evaluation.predikatObe})`,
      `- CPL: ${evaluation.skorCpl}/100`,
      `- CPMK: ${evaluation.skorCpmk}/100`,
      `- Sub-CPMK: ${evaluation.skorSubCpmk}/100`,
      `- Asesmen: ${evaluation.skorAsesmen}/100`,
      `- Bahan Kajian: ${evaluation.skorBahanKajian}/100`,
      ``,
      `Ringkasan Analisis:`,
      evaluation.ringkasanAnalisisTeks,
      ``,
      `Saran Perbaikan Konten:`
    ];
    evaluation.rekomendasiPerbaikan.forEach((rec, i) => {
      lines.push(
        `${i + 1}. [${rec.aspek} · Prioritas ${rec.prioritas}] ${rec.rekomendasiKonkret}`
      );
      if (rec.saranKontenPengganti) {
        lines.push(`   Saran Konten: ${rec.saranKontenPengganti.replace(/\n/g, ' | ')}`);
      }
    });
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
    onShowToast?.(`Hasil evaluasi & saran konten RPS ${course.kodeMK} disalin ke clipboard.`);
  };

  const componentBreakdown = activeEntry
    ? [
        {
          key: 'CPL' as const,
          label: '1. CPL & Deskripsi MK',
          score: activeEntry.evaluation.skorCpl,
          field: 'cplContent' as const,
          rows: 2,
          placeholder: 'Tuliskan deskripsi MK & kode CPL prodi yang dibebankan...'
        },
        {
          key: 'CPMK' as const,
          label: '2. CPMK & Taksonomi Bloom',
          score: activeEntry.evaluation.skorCpmk,
          field: 'cpmkContent' as const,
          rows: 3,
          placeholder: 'CPMK-1 (C4) [CPL-01]: Mampu menganalisis...'
        },
        {
          key: 'Sub-CPMK' as const,
          label: '3. Sub-CPMK & Metode Aktif',
          score: activeEntry.evaluation.skorSubCpmk,
          field: 'subCpmkContent' as const,
          rows: 3,
          placeholder: 'Sub-CPMK 1.1 (Mg 1-3): Indikator & metode Case Method / Project...'
        },
        {
          key: 'Asesmen' as const,
          label: '4. Asesmen, Rubrik & Bobot (100%)',
          score: activeEntry.evaluation.skorAsesmen,
          field: 'asesmenContent' as const,
          rows: 2,
          placeholder: 'CPMK-1 (30%): Case Method; CPMK-2 (35%): Proyek; UAS (35%)...'
        },
        {
          key: 'Bahan Kajian' as const,
          label: '5. Bahan Kajian & Referensi Pustaka',
          score: activeEntry.evaluation.skorBahanKajian,
          field: 'bahanKajianContent' as const,
          rows: 2,
          placeholder: 'Pokok bahasan mingguan dan standar/pustaka referensi mutakhir...'
        }
      ]
    : [];

  return (
    <div className="space-y-5">
      {/* 1. 4-CELL SINGLE-ELEVATION SUMMARY STRIP */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                AI RPS Evaluator — Audit Kelengkapan 5 Komponen OBE Real-Time
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Memindai dokumen RPS {selectedProdi.nama} dan menghitung skor 1–100 secara
                otomatis berdasarkan kelengkapan{' '}
                <span className="font-semibold text-slate-800">
                  CPL, CPMK, Sub-CPMK, Asesmen, dan Bahan Kajian
                </span>
                , lengkap dengan saran perbaikan konten siap pakai secara real-time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAutoAiEnabled(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                autoAiEnabled
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>
                {autoAiEnabled ? 'Auto-AI Real-Time: Aktif' : 'Auto-AI Real-Time: Mati'}
              </span>
            </button>

            <button
              type="button"
              disabled={isEvaluating || courses.length === 0}
              onClick={handleEvaluateBatchWithAi}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 border border-indigo-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{batchProgress || 'Pindai AI (3 MK Prioritas)'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
          <div className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Skor Kelengkapan OBE Prodi
            </span>
            <span
              className={`text-2xl font-bold font-mono tabular-nums mt-1 block ${getScoreToneClass(
                summary.avgScore
              )}`}
            >
              {summary.avgScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              {summary.total} MK dipindai · {summary.aiEvaluatedCount} diaudit AI
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Rerata CPL &amp; CPMK
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {summary.avgCpl} · {summary.avgCpmk}
            </span>
            <span className="text-[11px] text-slate-500">
              CPL ({summary.avgCpl}/100) · CPMK ({summary.avgCpmk}/100)
            </span>
          </div>

          <div className="p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Sub-CPMK · Asesmen · Bahan Kajian
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
              {summary.avgSubCpmk} · {summary.avgAsesmen} · {summary.avgBahanKajian}
            </span>
            <span className="text-[11px] text-slate-500">
              Skor rata-rata per komponen operasional
            </span>
          </div>

          <button
            type="button"
            onClick={() => setFilterMode('NEEDS_REVISION')}
            className="p-4 text-left hover:bg-amber-50/60 transition-colors cursor-pointer"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block">
              MK Perlu Kelengkapan (&lt; 75)
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1 block">
              {summary.needsRevisionCount}
            </span>
            <span className="text-[11px] text-amber-800 font-medium">
              Klik untuk menyaring MK prioritas
            </span>
          </button>
        </div>
      </div>

      {evalError && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex items-start justify-between gap-3 text-xs text-rose-900"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Kendala Pemanggilan AI Evaluator</div>
              <div className="mt-0.5">{evalError}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEvalError(null)}
            className="px-2 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 rounded cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. TWO-PANE WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE: COURSE SCANNER LIST */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-200 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kode MK, nama MK, atau dosen..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              {(
                [
                  { id: 'ALL', label: `Semua (${summary.total})` },
                  { id: 'NEEDS_REVISION', label: `Skor <75 (${summary.needsRevisionCount})` },
                  { id: 'AI_DONE', label: `AI (${summary.aiEvaluatedCount})` },
                  { id: 'UNGGUL', label: 'Unggul ≥85' }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-2 py-1 rounded-md font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filterMode === tab.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[780px] overflow-y-auto">
            {filteredCourseEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Tidak ada mata kuliah yang cocok dengan filter pencarian.
              </div>
            ) : (
              filteredCourseEntries.map(({ course, evaluation }) => {
                const isSelected = resolvedCourse?.id === course.id;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start justify-between gap-2.5 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/75' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono font-bold text-slate-500">
                        {course.kodeMK} · Sem {course.semester} · {course.sks} SKS
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                        {course.namaMK}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {course.dosenPengampu}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-sm font-bold font-mono tabular-nums ${getScoreToneClass(
                          evaluation.skorTotalObe
                        )}`}
                      >
                        {evaluation.skorTotalObe}
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                      <div
                        className={`text-[10px] font-semibold mt-0.5 ${
                          evaluation.source === 'AI_GEMINI'
                            ? 'text-indigo-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {evaluation.source === 'AI_GEMINI' ? 'AI Verified' : 'Live Scan'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: REAL-TIME 5-COMPONENT EDITOR + SCORE + LIVE SUGGESTIONS */}
        <div className="lg:col-span-8 space-y-4">
          {!activeEntry ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500">
              Pilih mata kuliah dari daftar sebelah kiri untuk memindai kelengkapan 5 komponen OBE.
            </div>
          ) : (
            <>
              {/* LIVE SCORE HEADER + 5 COMPONENT BARS */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                      <span className={getScoreToneClass(activeEntry.evaluation.skorTotalObe)}>
                        {activeEntry.evaluation.skorTotalObe}
                      </span>
                      <span className="text-sm font-normal text-slate-400">/100</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {activeEntry.course.kodeMK} — {activeEntry.course.namaMK} (
                        {activeEntry.evaluation.predikatObe})
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Pengampu: {activeEntry.course.dosenPengampu} ·{' '}
                        {activeEntry.evaluation.source === 'AI_GEMINI'
                          ? `Audit AI Gemini${
                              activeEntry.evaluation.evaluatedAt
                                ? ` · ${new Date(
                                    activeEntry.evaluation.evaluatedAt
                                  ).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}`
                                : ''
                            }`
                          : 'Pemindai Kelengkapan Real-Time (otomatis memperbarui skor saat mengetik)'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer whitespace-nowrap shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Muat RPS (.txt)</span>
                      <input
                        type="file"
                        accept=".txt,.md,.csv"
                        onChange={handleUploadRpsTextFile}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={isEvaluating}
                      onClick={handleEvaluateSingleWithAi}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {isEvaluating ? 'Menganalisis AI...' : 'Audit Mendalam dengan AI'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 5 OBE COMPONENT SCORE METERS */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  {[
                    { label: 'CPL', score: activeEntry.evaluation.skorCpl },
                    { label: 'CPMK', score: activeEntry.evaluation.skorCpmk },
                    { label: 'Sub-CPMK', score: activeEntry.evaluation.skorSubCpmk },
                    { label: 'Asesmen', score: activeEntry.evaluation.skorAsesmen },
                    { label: 'Bahan Kajian', score: activeEntry.evaluation.skorBahanKajian }
                  ].map(comp => (
                    <div key={comp.label} className="p-2.5 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-slate-700 truncate">
                          {comp.label}
                        </span>
                        <span
                          className={`font-mono font-bold tabular-nums ${getScoreToneClass(
                            comp.score
                          )}`}
                        >
                          {comp.score}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${getBarBgClass(
                            comp.score
                          )}`}
                          style={{ width: `${comp.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* TEXTUAL ANALYSIS SUMMARY */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Ringkasan Audit Kelengkapan RPS (OBE)</span>
                  </div>
                  <p>{activeEntry.evaluation.ringkasanAnalisisTeks}</p>
                </div>
              </div>

              {/* 5-COMPONENT INTERACTIVE REAL-TIME RPS DRAFT EDITOR */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Editor Konten 5 Komponen OBE (Penilaian Skor Real-Time)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Ubah konten di bawah atau terapkan saran perbaikan AI untuk melihat kenaikan
                      skor 1–100 secara seketika.
                    </p>
                  </div>
                  {draftsByCourseId[activeEntry.course.id] && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraftsByCourseId(prev => {
                          const next = { ...prev };
                          delete next[activeEntry.course.id];
                          return next;
                        });
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Konten Awal</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {componentBreakdown.map(item => (
                    <div
                      key={item.key}
                      className={item.key === 'Bahan Kajian' ? 'md:col-span-2' : ''}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="font-semibold text-slate-800">{item.label}</label>
                        <span
                          className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-bold tabular-nums ${getFieldBadgeClass(
                            item.score
                          )}`}
                        >
                          Skor {item.score}/100
                        </span>
                      </div>
                      <textarea
                        rows={item.rows}
                        value={activeEntry.draft[item.field]}
                        placeholder={item.placeholder}
                        onChange={e => updateActiveDraft({ [item.field]: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Teks Lengkap / Lampiran Rencana Mingguan RPS (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={activeEntry.draft.customRpsText}
                      onChange={e => updateActiveDraft({ customRpsText: e.target.value })}
                      placeholder="Tempel salinan dokumen RPS lengkap atau pustaka tambahan untuk dipindai..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {/* REAL-TIME CONTENT IMPROVEMENT SUGGESTIONS + APPLY ACTIONS */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-indigo-700" />
                    <span>Saran Perbaikan Konten Real-Time ({activeEntry.evaluation.rekomendasiPerbaikan.length} Butir)</span>
                  </h5>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleApplyAllSuggestions}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Terapkan Semua Saran</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyRecommendations}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Laporan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onShowToast?.(
                          `Hasil evaluasi AI RPS & saran perbaikan (${activeEntry.evaluation.skorTotalObe}/100) dikirim ke ${activeEntry.course.dosenPengampu}.`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim ke Pengampu</span>
                    </button>
                  </div>
                </div>

                {/* STRENGTHS & GAPS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 border border-emerald-200 bg-emerald-50/40 rounded-lg space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Komponen Sudah Lengkap</span>
                    </div>
                    <ul className="space-y-1 text-emerald-950 list-disc pl-4">
                      {activeEntry.evaluation.aspekKuat.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 border border-amber-200 bg-amber-50/40 rounded-lg space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Celah Kelengkapan OBE</span>
                    </div>
                    {activeEntry.evaluation.celahKesesuaian.length === 0 ? (
                      <p className="text-emerald-800">
                        Kelima komponen wajib OBE (CPL, CPMK, Sub-CPMK, Asesmen, Bahan Kajian)
                        sudah terpenuhi dengan baik.
                      </p>
                    ) : (
                      <ul className="space-y-1 text-amber-950 list-disc pl-4">
                        {activeEntry.evaluation.celahKesesuaian.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* ACTIONABLE RECOMMENDATIONS WITH 1-CLICK APPLY */}
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {activeEntry.evaluation.rekomendasiPerbaikan.map((rec, idx) => (
                    <div key={idx} className="p-3.5 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-mono text-[11px] font-bold">
                            {rec.aspek}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              rec.prioritas.toLowerCase().includes('tinggi')
                                ? 'text-rose-700'
                                : rec.prioritas.toLowerCase().includes('sedang')
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            Prioritas {rec.prioritas}
                          </span>
                        </div>

                        {rec.saranKontenPengganti && (
                          <button
                            type="button"
                            onClick={() => handleApplySuggestionToDraft(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Terapkan Saran ke {rec.aspek}</span>
                          </button>
                        )}
                      </div>

                      <p className="text-slate-700 leading-relaxed">{rec.rekomendasiKonkret}</p>

                      {rec.saranKontenPengganti && (
                        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 whitespace-pre-line leading-relaxed">
                          {rec.saranKontenPengganti}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
