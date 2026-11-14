import React, { useMemo, useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Mail,
  Search,
  Send,
  Upload,
  AlertTriangle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { MataKuliahCplMatrixRecord, ProgramStudiInfo } from '../types/index';
import { PRODI_LIST } from '../data/mockData';
import {
  CURRENT_RPS_ACADEMIC_TERM,
  RpsCourseUploadAuditItem,
  RpsReminderDispatchRecord,
  RpsUploadProdiAuditSummary,
  UploadedRpsFileRecord,
  buildRpsReminderMessage,
  scanCoursesRpsUploadCompliance
} from '../utils/rpsUploadAuditHelper';

interface RpsUploadProdiProgressViewProps {
  selectedProdi: ProgramStudiInfo;
  allMatrixCourses: MataKuliahCplMatrixRecord[];
  uploadedRpsFilesMap: Record<string, UploadedRpsFileRecord>;
  smartRpsOverridesMap: Record<string, { fileName?: string; updatedAt: string }>;
  rpsRemindersMap: Record<string, RpsReminderDispatchRecord>;
  onDispatchReminders: (
    items: RpsCourseUploadAuditItem[],
    channel: RpsReminderDispatchRecord['channel'],
    toastMessage: string
  ) => void;
  onUploadLatestRps: (courseId: string, file: File) => void;
  onOpenDetailedAudit?: () => void;
}

interface LecturerUploadProgressRow {
  dosenNama: string;
  dosenEmail: string;
  dosenNoHp: string;
  dosenJabatan: string;
  totalCourses: number;
  uploadedCount: number;
  pendingItems: RpsCourseUploadAuditItem[];
  allCourses: RpsCourseUploadAuditItem[];
  pctUploaded: number;
  allPendingReminded: boolean;
  lastRemindedAt?: string;
}

interface ProdiProgressBundle {
  prodi: ProgramStudiInfo;
  summary: RpsUploadProdiAuditSummary;
  pctOutdated: number;
  pctMissingOnly: number;
  lecturerRows: LecturerUploadProgressRow[];
}

function getProgressTone(pct: number) {
  if (pct >= 85) {
    return {
      fillClass: 'bg-emerald-600',
      textClass: 'text-emerald-700',
      borderActiveClass: 'border-emerald-300 bg-emerald-50/30',
      statusLabel: 'Memenuhi Target (≥85%)',
      Icon: CheckCircle2
    };
  }
  if (pct >= 60) {
    return {
      fillClass: 'bg-amber-500',
      textClass: 'text-amber-700',
      borderActiveClass: 'border-amber-300 bg-amber-50/30',
      statusLabel: 'Perlu Percepatan (60–84%)',
      Icon: AlertTriangle
    };
  }
  return {
    fillClass: 'bg-rose-600',
    textClass: 'text-rose-700',
    borderActiveClass: 'border-rose-300 bg-rose-50/30',
    statusLabel: 'Di Bawah Target (<60%)',
    Icon: AlertCircle
  };
}

export const RpsUploadProdiProgressView: React.FC<RpsUploadProdiProgressViewProps> = ({
  selectedProdi,
  allMatrixCourses,
  uploadedRpsFilesMap,
  smartRpsOverridesMap,
  rpsRemindersMap,
  onDispatchReminders,
  onUploadLatestRps,
  onOpenDetailedAudit
}) => {
  const [focusedProdiId, setFocusedProdiId] = useState<ProgramStudiInfo['id']>(selectedProdi.id);
  const [barClickBehavior, setBarClickBehavior] = useState<'inspect_and_remind' | 'instant_send'>(
    'inspect_and_remind'
  );
  const [reminderChannel, setReminderChannel] = useState<RpsReminderDispatchRecord['channel']>(
    'Sistem & Email Prodi'
  );
  const [lecturerFilter, setLecturerFilter] = useState<'PENDING' | 'ALL' | 'COMPLETE'>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDosenKey, setExpandedDosenKey] = useState<string | null>(null);

  React.useEffect(() => {
    setFocusedProdiId(selectedProdi.id);
    setExpandedDosenKey(null);
  }, [selectedProdi.id]);

  const prodiBundles: ProdiProgressBundle[] = useMemo(() => {
    return PRODI_LIST.map(prodi => {
      const courses = allMatrixCourses.filter(c => c.prodiId === prodi.id);
      const summary = scanCoursesRpsUploadCompliance({
        courses,
        uploadedFilesMap: uploadedRpsFilesMap,
        smartRpsOverridesMap,
        remindersMap: rpsRemindersMap
      });

      const pctOutdated =
        summary.totalCourses > 0
          ? Math.round((summary.outdatedCount / summary.totalCourses) * 100)
          : 0;
      const pctMissingOnly = Math.max(
        0,
        100 - summary.complianceRatePercent - pctOutdated
      );

      // Group ALL courses by lecturer to build per-lecturer clickable progress bars
      const byLecturer = new Map<string, RpsCourseUploadAuditItem[]>();
      summary.items.forEach(item => {
        const key = item.dosenNama.trim();
        const existing = byLecturer.get(key) || [];
        existing.push(item);
        byLecturer.set(key, existing);
      });

      const lecturerRows: LecturerUploadProgressRow[] = Array.from(byLecturer.entries())
        .map(([dosenNama, list]) => {
          const first = list[0];
          const pendingItems = list.filter(i => i.isMissingLatest);
          const uploadedCount = list.length - pendingItems.length;
          const pctUploaded =
            list.length > 0 ? Math.round((uploadedCount / list.length) * 100) : 100;
          const allPendingReminded =
            pendingItems.length > 0 && pendingItems.every(i => Boolean(i.latestReminder));
          const lastRemindedAt = pendingItems
            .map(i => i.latestReminder?.sentAt)
            .filter(Boolean)
            .sort()
            .pop();

          return {
            dosenNama,
            dosenEmail: first.dosenEmail,
            dosenNoHp: first.dosenNoHp,
            dosenJabatan: first.dosenJabatan,
            totalCourses: list.length,
            uploadedCount,
            pendingItems,
            allCourses: list,
            pctUploaded,
            allPendingReminded,
            lastRemindedAt
          };
        })
        .sort(
          (a, b) =>
            b.pendingItems.length - a.pendingItems.length ||
            a.pctUploaded - b.pctUploaded ||
            a.dosenNama.localeCompare(b.dosenNama)
        );

      return {
        prodi,
        summary,
        pctOutdated,
        pctMissingOnly,
        lecturerRows
      };
    });
  }, [allMatrixCourses, uploadedRpsFilesMap, smartRpsOverridesMap, rpsRemindersMap]);

  const facultyTotals = useMemo(() => {
    const totalCourses = prodiBundles.reduce((s, b) => s + b.summary.totalCourses, 0);
    const totalUploaded = prodiBundles.reduce((s, b) => s + b.summary.uploadedLatestCount, 0);
    const totalMissing = prodiBundles.reduce((s, b) => s + b.summary.missingLatestCount, 0);
    const totalOutdated = prodiBundles.reduce((s, b) => s + b.summary.outdatedCount, 0);
    const totalReminded = prodiBundles.reduce((s, b) => s + b.summary.remindedPendingCount, 0);
    const allPendingItems = prodiBundles.flatMap(b =>
      b.summary.items.filter(i => i.isMissingLatest)
    );
    const pctFaculty = totalCourses > 0 ? Math.round((totalUploaded / totalCourses) * 100) : 0;

    return {
      totalCourses,
      totalUploaded,
      totalMissing,
      totalOutdated,
      totalReminded,
      allPendingItems,
      pctFaculty
    };
  }, [prodiBundles]);

  const activeBundle = useMemo(
    () => prodiBundles.find(b => b.prodi.id === focusedProdiId) || prodiBundles[0],
    [prodiBundles, focusedProdiId]
  );

  const filteredLecturerRows = useMemo(() => {
    if (!activeBundle) return [];
    const q = searchQuery.trim().toLowerCase();
    return activeBundle.lecturerRows.filter(row => {
      const matchTab =
        lecturerFilter === 'PENDING'
          ? row.pendingItems.length > 0
          : lecturerFilter === 'COMPLETE'
          ? row.pendingItems.length === 0
          : true;
      const matchSearch =
        !q ||
        row.dosenNama.toLowerCase().includes(q) ||
        row.dosenEmail.toLowerCase().includes(q) ||
        row.allCourses.some(
          c =>
            c.course.kodeMK.toLowerCase().includes(q) ||
            c.course.namaMK.toLowerCase().includes(q)
        );
      return matchTab && matchSearch;
    });
  }, [activeBundle, lecturerFilter, searchQuery]);

  const handleSendProdiReminder = (bundle: ProdiProgressBundle) => {
    const pendingItems = bundle.summary.items.filter(i => i.isMissingLatest);
    if (pendingItems.length === 0) {
      onDispatchReminders(
        [],
        reminderChannel,
        `Seluruh ${bundle.summary.totalCourses} mata kuliah ${bundle.prodi.nama} sudah mengunggah RPS terbaru.`
      );
      return;
    }

    onDispatchReminders(
      pendingItems,
      reminderChannel,
      `Pengingat unggah RPS (${pendingItems.length} MK) berhasil dikirim ke ${bundle.summary.lecturerPendingGroups.length} dosen pengampu ${bundle.prodi.singkatan} via ${reminderChannel}.`
    );
  };

  const handleProdiProgressBarClick = (bundle: ProdiProgressBundle) => {
    setFocusedProdiId(bundle.prodi.id);
    setExpandedDosenKey(null);
    if (barClickBehavior === 'instant_send') {
      handleSendProdiReminder(bundle);
    }
  };

  const handleLecturerBarClick = (row: LecturerUploadProgressRow) => {
    if (row.pendingItems.length === 0) {
      setExpandedDosenKey(prev => (prev === row.dosenNama ? null : row.dosenNama));
      return;
    }

    onDispatchReminders(
      row.pendingItems,
      reminderChannel,
      `Pengingat unggah RPS untuk ${row.pendingItems.length} MK dikirim kepada ${row.dosenNama} (${row.dosenEmail}) via ${reminderChannel}.`
    );
    setExpandedDosenKey(row.dosenNama);
  };

  const handleSendFacultyAllReminders = () => {
    if (facultyTotals.allPendingItems.length === 0) return;
    onDispatchReminders(
      facultyTotals.allPendingItems,
      reminderChannel,
      `Pengingat massal lintas prodi berhasil dikirim untuk ${facultyTotals.allPendingItems.length} mata kuliah FT UNBARI via ${reminderChannel}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Strip & Action Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Progres Unggah RPS Terbaru per Program Studi
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Fakultas Teknik UNBARI</span>
              <span aria-hidden="true">·</span>
              <span>Target {CURRENT_RPS_ACADEMIC_TERM}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {facultyTotals.totalUploaded} / {facultyTotals.totalCourses} MK Terunggah ({facultyTotals.pctFaculty}%)
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode on Bar Click */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setBarClickBehavior('inspect_and_remind')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  barClickBehavior === 'inspect_and_remind'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Klik Bar: Pilih &amp; Tinjau Dosen
              </button>
              <button
                type="button"
                onClick={() => setBarClickBehavior('instant_send')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  barClickBehavior === 'instant_send'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Klik Bar: Kirim Pengingat 1-Klik
              </button>
            </div>

            <select
              value={reminderChannel}
              onChange={e =>
                setReminderChannel(e.target.value as RpsReminderDispatchRecord['channel'])
              }
              aria-label="Pilih kanal pengingat dosen pengampu"
              className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 cursor-pointer"
            >
              <option value="Sistem & Email Prodi">Kanal: Sistem &amp; Email Prodi</option>
              <option value="WhatsApp & Sistem">Kanal: WhatsApp &amp; Sistem</option>
            </select>

            <button
              type="button"
              onClick={handleSendFacultyAllReminders}
              disabled={facultyTotals.totalMissing === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ingatkan Semua Prodi ({facultyTotals.totalMissing} MK)</span>
            </button>
          </div>
        </div>

        {/* Hairline 4-KPI Faculty Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <div className="p-4">
            <div className="text-[11px] font-medium text-slate-500">
              Capaian Unggah RPS Fakultas
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {facultyTotals.pctFaculty}%
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                ({facultyTotals.totalUploaded}/{facultyTotals.totalCourses} MK)
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Target kesiapan akreditasi ≥85%
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-medium text-slate-500">
              Sudah Unggah Edisi Terbaru
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {facultyTotals.totalUploaded} MK
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Format OBE V2 terverifikasi
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-medium text-slate-500">
              Belum Lengkap / Perlu Pembaruan
            </div>
            <div className="mt-1 text-2xl font-bold text-rose-700 font-mono tabular-nums">
              {facultyTotals.totalMissing} MK
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
              {facultyTotals.totalMissing - facultyTotals.totalOutdated} kosong · {facultyTotals.totalOutdated} versi lama
            </div>
          </div>

          <div className="p-4">
            <div className="text-[11px] font-medium text-slate-500">
              Pengingat Dosen Terkirim
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-700 font-mono tabular-nums">
                {facultyTotals.totalReminded}
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                / {facultyTotals.totalMissing} MK tertunda
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Via {reminderChannel}
            </div>
          </div>
        </div>
      </div>

      {/* Per-Prodi Dynamic Clickable Progress Bars */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Perbandingan Progres Unggah RPS per Program Studi (Klik Bar untuk Aksi Pengingat)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {barClickBehavior === 'instant_send'
                ? 'Mode aktif: Mengklik progress bar prodi langsung mengirimkan pengingat ke seluruh dosen pengampu prodi tersebut.'
                : 'Mode aktif: Klik progress bar prodi untuk menampilkan daftar dosen pengampu dan mengirim pengingat spesifik.'}
            </p>
          </div>
          {onOpenDetailedAudit && (
            <button
              type="button"
              onClick={onOpenDetailedAudit}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center"
            >
              Buka Tabel Audit Dokumen MK →
            </button>
          )}
        </div>

        <div className="space-y-4">
          {prodiBundles.map(bundle => {
            const { prodi, summary, pctOutdated } = bundle;
            const tone = getProgressTone(summary.complianceRatePercent);
            const ToneIcon = tone.Icon;
            const isFocused = activeBundle?.prodi.id === prodi.id;
            const allPendingReminded =
              summary.missingLatestCount > 0 &&
              summary.remindedPendingCount === summary.missingLatestCount;

            return (
              <div
                key={prodi.id}
                className={`p-4 rounded-xl border transition-colors ${
                  isFocused
                    ? 'border-blue-400 bg-blue-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{prodi.nama}</span>
                      <span className="text-xs text-slate-400" aria-hidden="true">·</span>
                      <span className="text-xs text-slate-600">{prodi.akreditasi}</span>
                      <span className="text-xs text-slate-400" aria-hidden="true">·</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${tone.textClass}`}>
                        <ToneIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{tone.statusLabel}</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono tabular-nums">
                      <span>
                        Terunggah terbaru: <strong className="text-slate-900">{summary.uploadedLatestCount}</strong> / {summary.totalCourses} MK
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Belum unggah: {summary.missingOnlyCount} MK</span>
                      <span aria-hidden="true">·</span>
                      <span>Versi lama: {summary.outdatedCount} MK</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Pengingat terkirim: {summary.remindedPendingCount}/{summary.missingLatestCount} MK ({summary.lecturerPendingGroups.length} dosen)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className={`text-xl font-bold font-mono tabular-nums ${tone.textClass}`}>
                        {summary.complianceRatePercent}%
                      </div>
                      <div className="text-[11px] font-mono tabular-nums text-slate-500">
                        {summary.missingLatestCount} MK tersisa
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendProdiReminder(bundle)}
                      disabled={summary.missingLatestCount === 0}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        summary.missingLatestCount === 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                          : allPendingReminded
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {summary.missingLatestCount === 0 ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>100% Lengkap</span>
                        </>
                      ) : allPendingReminded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terkirim ({summary.lecturerPendingGroups.length} Dosen)</span>
                        </>
                      ) : (
                        <>
                          <BellRing className="w-3.5 h-3.5" />
                          <span>Kirim Pengingat ({summary.lecturerPendingGroups.length} Dosen)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Clickable Dynamic Progress Bar */}
                <button
                  type="button"
                  onClick={() => handleProdiProgressBarClick(bundle)}
                  aria-label={`Progress unggah RPS ${prodi.nama}: ${summary.complianceRatePercent}% (${summary.uploadedLatestCount} dari ${summary.totalCourses} mata kuliah). Klik untuk ${barClickBehavior === 'instant_send' ? 'mengirim pengingat ke dosen pengampu' : 'meninjau dan mengirim pengingat dosen pengampu'}.`}
                  className="w-full text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
                >
                  <div className="w-full h-7 bg-slate-100 border border-slate-200 group-hover:border-blue-400 rounded-lg overflow-hidden flex transition-colors relative">
                    {/* Uploaded Latest Segment */}
                    <div
                      className={`h-full ${tone.fillClass} transition-all duration-300 flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max(summary.complianceRatePercent, 0)}%` }}
                    >
                      {summary.complianceRatePercent >= 14 && (
                        <span className="text-[11px] font-mono font-bold text-white tabular-nums whitespace-nowrap">
                          {summary.uploadedLatestCount} MK ({summary.complianceRatePercent}%)
                        </span>
                      )}
                    </div>

                    {/* Outdated Version Segment */}
                    {pctOutdated > 0 && (
                      <div
                        className="h-full bg-amber-200 transition-all duration-300 flex items-center justify-center overflow-hidden"
                        style={{ width: `${pctOutdated}%` }}
                        title={`${summary.outdatedCount} MK masih versi tahun akademik sebelumnya`}
                      >
                        {pctOutdated >= 10 && (
                          <span className="text-[10px] font-mono font-semibold text-amber-900 tabular-nums whitespace-nowrap px-1">
                            {summary.outdatedCount} Lama
                          </span>
                        )}
                      </div>
                    )}

                    {/* Remaining Missing Hint on Track */}
                    {summary.missingOnlyCount > 0 && (
                      <div className="flex-1 h-full flex items-center justify-between px-2.5 text-[11px] text-slate-600 group-hover:text-blue-800 transition-colors overflow-hidden">
                        <span className="font-mono tabular-nums truncate">
                          {summary.missingOnlyCount} MK belum unggah
                        </span>
                        <span className="font-semibold whitespace-nowrap shrink-0 hidden sm:inline">
                          {barClickBehavior === 'instant_send'
                            ? 'Klik bar untuk kirim pengingat →'
                            : isFocused
                            ? 'Daftar dosen aktif di bawah ↓'
                            : 'Klik bar untuk kirim pengingat dosen →'}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Focused Prodi Lecturer Reminder Progress List */}
      {activeBundle && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Rincian Pengampu &amp; Progress Bar per Dosen</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-slate-800">{activeBundle.prodi.nama}</span>
                <span aria-hidden="true">·</span>
                <span>Klik progress bar dosen untuk langsung mengirim pengingat RPS</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Daftar Dosen Pengampu — {activeBundle.prodi.singkatan} ({filteredLecturerRows.length} Dosen)
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                {([
                  {
                    id: 'PENDING',
                    label: `Perlu Pengingat (${activeBundle.lecturerRows.filter(r => r.pendingItems.length > 0).length})`
                  },
                  {
                    id: 'ALL',
                    label: `Semua (${activeBundle.lecturerRows.length})`
                  },
                  {
                    id: 'COMPLETE',
                    label: `100% Lengkap (${activeBundle.lecturerRows.filter(r => r.pendingItems.length === 0).length})`
                  }
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLecturerFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      lecturerFilter === tab.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama dosen atau kode MK..."
                  aria-label="Cari dosen pengampu pada daftar progres RPS"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {filteredLecturerRows.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-900">
                Tidak Ada Dosen yang Cocok pada Filter Ini
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Semua dosen pengampu pada kategori ini telah melengkapi RPS terbaru atau coba ubah filter pencarian.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredLecturerRows.map(row => {
                const rowTone = getProgressTone(row.pctUploaded);
                const isExpanded = expandedDosenKey === row.dosenNama;

                return (
                  <div key={row.dosenNama} className="p-4 sm:px-5 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {row.dosenNama}
                            </span>
                            <span className="text-xs text-slate-400 mx-1.5" aria-hidden="true">·</span>
                            <span className="text-xs text-slate-500">{row.dosenJabatan}</span>
                            <span className="text-xs text-slate-400 mx-1.5" aria-hidden="true">·</span>
                            <span className="text-xs text-slate-500">{row.dosenEmail}</span>
                          </div>

                          <div className="text-xs font-mono tabular-nums text-slate-700 shrink-0">
                            <strong>{row.uploadedCount}</strong> / {row.totalCourses} MK Terbaru (
                            <span className={`font-bold ${rowTone.textClass}`}>{row.pctUploaded}%</span>)
                          </div>
                        </div>

                        {/* Clickable Lecturer Progress Bar */}
                        <button
                          type="button"
                          onClick={() => handleLecturerBarClick(row)}
                          className="w-full text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
                          title={
                            row.pendingItems.length > 0
                              ? `Klik progress bar untuk mengirim pengingat ${row.pendingItems.length} MK ke ${row.dosenNama}`
                              : `Klik untuk melihat daftar ${row.totalCourses} MK milik ${row.dosenNama}`
                          }
                        >
                          <div className="w-full h-4 bg-slate-100 border border-slate-200 group-hover:border-blue-400 rounded-md overflow-hidden flex transition-colors">
                            <div
                              className={`h-full ${rowTone.fillClass} transition-all duration-300`}
                              style={{ width: `${row.pctUploaded}%` }}
                            />
                            {row.pendingItems.length > 0 && (
                              <div className="flex-1 flex items-center justify-between px-2 text-[10px] text-slate-600 group-hover:text-blue-800 overflow-hidden">
                                <span className="font-mono tabular-nums truncate">
                                  {row.pendingItems.length} MK belum terbaru
                                </span>
                                <span className="font-semibold whitespace-nowrap shrink-0">
                                  Klik untuk kirim pengingat →
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {row.pendingItems.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleLecturerBarClick(row)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              row.allPendingReminded
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                            }`}
                          >
                            {reminderChannel === 'WhatsApp & Sistem' ? (
                              <MessageSquare className="w-3.5 h-3.5" />
                            ) : (
                              <Mail className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {row.allPendingReminded
                                ? `Terkirim (${row.lastRemindedAt || 'Baru saja'})`
                                : `Kirim Pengingat (${row.pendingItems.length} MK)`}
                            </span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 px-2.5 py-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Lengkap 100%</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDosenKey(prev => (prev === row.dosenNama ? null : row.dosenNama))
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Tutup MK' : `Rincian (${row.totalCourses} MK)`}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Courses Table for this Lecturer */}
                    {isExpanded && (
                      <div className="pt-2 overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                              <th className="py-2 px-3">Mata Kuliah</th>
                              <th className="py-2 px-3">Status Berkas RPS</th>
                              <th className="py-2 px-3">Status Pengingat</th>
                              <th className="py-2 px-3 text-right">Aksi Cepat</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {row.allCourses.map(item => (
                              <tr key={item.course.id} className="hover:bg-slate-50/70">
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-slate-900">
                                    <span className="font-mono">{item.course.kodeMK}</span> — {item.course.namaMK}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                                    Sem {item.course.semesterLabel || item.course.semester || '-'} · {item.course.sks} SKS · Target: {item.expectedFileName}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`font-semibold ${
                                      item.status === 'SUDAH_UNGGAH_TERBARU'
                                        ? 'text-emerald-700'
                                        : item.status === 'PERLU_PEMBARUAN_VERSI'
                                        ? 'text-amber-700'
                                        : 'text-rose-700'
                                    }`}
                                  >
                                    {item.statusLabel}
                                  </span>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    {item.currentFileName || 'Belum ada berkas'}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600">
                                  {item.latestReminder ? (
                                    <span className="font-semibold text-emerald-700">
                                      Terkirim · {item.latestReminder.sentAt}
                                    </span>
                                  ) : item.isMissingLatest ? (
                                    <span className="text-slate-500">Belum dikirim</span>
                                  ) : (
                                    <span className="text-slate-400">Tidak perlu</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <div className="inline-flex items-center gap-1.5">
                                    {item.isMissingLatest && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onDispatchReminders(
                                            [item],
                                            reminderChannel,
                                            `Pengingat RPS ${item.course.kodeMK} (${item.course.namaMK}) dikirim ke ${item.dosenNama}.`
                                          )
                                        }
                                        title={buildRpsReminderMessage(item)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                                      >
                                        <Send className="w-3 h-3" />
                                        <span>Ingatkan MK</span>
                                      </button>
                                    )}
                                    <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md whitespace-nowrap shrink-0 cursor-pointer">
                                      <Upload className="w-3 h-3" />
                                      <span>Unggah PDF</span>
                                      <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt,.md"
                                        className="hidden"
                                        onChange={e => {
                                          const f = e.target.files?.[0];
                                          if (f) onUploadLatestRps(item.course.id, f);
                                          e.target.value = '';
                                        }}
                                      />
                                    </label>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
