import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  History,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { ProgramStudiInfo } from '../types/index';
import { StandardKopSurat } from './StandardKopSurat';
import { printDocumentElement } from '../utils/printHelper';
import {
  getActivityLogs,
  getApproachingActionItems,
  getNotulensiRapatList,
  KaprodiActivityCategory,
  KaprodiActivityLogEntry,
  logKaprodiActivity,
  NotulensiRapatRecord,
  RapatActionItem,
  saveNotulensiRapatList
} from '../utils/activityLogHelper';

interface DashboardMeetingsActivitySectionProps {
  selectedProdi: ProgramStudiInfo;
  scopeFilter: 'prodi' | 'all';
  onShowToast?: (msg: string) => void;
}

const CATEGORY_LABELS: Record<'ALL' | KaprodiActivityCategory, string> = {
  ALL: 'Semua Aktivitas',
  VALIDASI_BAP: 'Validasi BAP',
  PERUBAHAN_IKU: 'Perubahan Target IKU',
  PENGHAPUSAN_DATA: 'Penghapusan Data',
  VERIFIKASI_QR: 'Verifikasi QR',
  SYNC_WORKSPACE: 'Sync Google Workspace',
  EXPORT_DOKUMEN: 'Ekspor Dokumen PDF/Excel',
  NOTULENSI_RAPAT: 'Notulensi Rapat'
};

export const DashboardMeetingsActivitySection: React.FC<DashboardMeetingsActivitySectionProps> = ({
  selectedProdi,
  scopeFilter,
  onShowToast
}) => {
  const [notulensiList, setNotulensiList] = useState<NotulensiRapatRecord[]>(() =>
    getNotulensiRapatList()
  );
  const [activityLogs, setActivityLogs] = useState<KaprodiActivityLogEntry[]>(() =>
    getActivityLogs()
  );
  const [selectedRapat, setSelectedRapat] = useState<NotulensiRapatRecord | null>(null);
  const [showAddRapatModal, setShowAddRapatModal] = useState<boolean>(false);

  // Activity log filters
  const [logCategoryFilter, setLogCategoryFilter] = useState<'ALL' | KaprodiActivityCategory>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');

  // Form state for new meeting
  const [newJudul, setNewJudul] = useState<string>('');
  const [newTanggal, setNewTanggal] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newWaktu, setNewWaktu] = useState<string>('09:00 - 11:00 WIB');
  const [newTempat, setNewTempat] = useState<string>('Ruang Rapat Dekanat Lt. 2 FT UNBARI');
  const [newKeputusanText, setNewKeputusanText] = useState<string>('');
  const [newActionTugas, setNewActionTugas] = useState<string>('');
  const [newActionPic, setNewActionPic] = useState<string>('Tim GPMF & Dosen Pengampu');
  const [newActionDeadline, setNewActionDeadline] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });

  const beritaAcaraPdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLogsUpdate = () => setActivityLogs(getActivityLogs());
    const handleNotulensiUpdate = () => setNotulensiList(getNotulensiRapatList());
    window.addEventListener('sikaprodi:activity-log-updated', handleLogsUpdate);
    window.addEventListener('sikaprodi:notulensi-updated', handleNotulensiUpdate);
    return () => {
      window.removeEventListener('sikaprodi:activity-log-updated', handleLogsUpdate);
      window.removeEventListener('sikaprodi:notulensi-updated', handleNotulensiUpdate);
    };
  }, []);

  const scopedNotulensi = useMemo(() => {
    if (scopeFilter === 'all') return notulensiList;
    return notulensiList.filter(r => r.prodiId === selectedProdi.id || r.prodiId === 'SEMUA_FT');
  }, [notulensiList, scopeFilter, selectedProdi.id]);

  const approachingAlerts = useMemo(() => {
    return getApproachingActionItems(scopeFilter === 'prodi' ? selectedProdi.id : undefined);
  }, [notulensiList, scopeFilter, selectedProdi.id]);

  const filteredLogs = useMemo(() => {
    const q = logSearchQuery.trim().toLowerCase();
    return activityLogs.filter(entry => {
      const matchScope =
        scopeFilter === 'all' || entry.prodiId === selectedProdi.id || entry.prodiId === 'SEMUA_FT';
      const matchCat = logCategoryFilter === 'ALL' || entry.category === logCategoryFilter;
      const matchQ =
        !q ||
        entry.actionTitle.toLowerCase().includes(q) ||
        entry.detail.toLowerCase().includes(q) ||
        entry.actor.toLowerCase().includes(q);
      return matchScope && matchCat && matchQ;
    });
  }, [activityLogs, scopeFilter, selectedProdi.id, logCategoryFilter, logSearchQuery]);

  const handleToggleActionItemStatus = (rapatId: string, itemId: string) => {
    let toggledTitle = '';
    let nextStatus: RapatActionItem['status'] = 'Selesai';

    const updated = notulensiList.map(r => {
      if (r.id !== rapatId) return r;
      return {
        ...r,
        actionItems: r.actionItems.map(item => {
          if (item.id !== itemId) return item;
          toggledTitle = item.tugas;
          nextStatus =
            item.status === 'Belum Selesai'
              ? 'Dalam Proses'
              : item.status === 'Dalam Proses'
              ? 'Selesai'
              : 'Belum Selesai';
          return { ...item, status: nextStatus };
        })
      };
    });

    setNotulensiList(updated);
    saveNotulensiRapatList(updated);
    if (selectedRapat?.id === rapatId) {
      setSelectedRapat(updated.find(r => r.id === rapatId) || null);
    }

    logKaprodiActivity({
      actor: selectedProdi.kaprodi,
      role: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      category: 'NOTULENSI_RAPAT',
      actionTitle: `Pembaruan Status Action Item Rapat (${nextStatus})`,
      detail: `Mengubah status tugas "${toggledTitle}" menjadi ${nextStatus}.`,
      severity: 'info'
    });
    onShowToast?.(`Status tindak lanjut diperbarui menjadi "${nextStatus}".`);
  };

  const handleAddNotulensi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudul.trim()) {
      onShowToast?.('Judul rapat wajib diisi.');
      return;
    }

    const keputusanArr = newKeputusanText
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);

    const newRecord: NotulensiRapatRecord = {
      id: `RPT-${Date.now()}`,
      nomorNotulen: `0${notulensiList.length + 15}/NOT-JUR/FT-UB/XI/2026`,
      judulRapat: newJudul.trim(),
      tanggalRapat: newTanggal,
      waktu: newWaktu,
      tempat: newTempat,
      prodiId: selectedProdi.id,
      pimpinanRapat: `${selectedProdi.kaprodi} (Kaprodi ${selectedProdi.singkatan})`,
      pesertaHadir: [
        `${selectedProdi.kaprodi} (Kaprodi ${selectedProdi.singkatan})`,
        'Fadli Eka Yandra, ST., MT (Dekan FT UNBARI)',
        'Tim Gugus Kendali Mutu Prodi'
      ],
      ringkasanKeputusan:
        keputusanArr.length > 0
          ? keputusanArr
          : ['Evaluasi pelaksanaan perkuliahan berjalan dan pencapaian IKU semester berjalan.'],
      actionItems: newActionTugas.trim()
        ? [
            {
              id: `AI-${Date.now()}`,
              tugas: newActionTugas.trim(),
              penanggungJawab: newActionPic.trim() || 'Kaprodi',
              deadline: newActionDeadline,
              status: 'Belum Selesai'
            }
          ]
        : []
    };

    const next = [newRecord, ...notulensiList];
    setNotulensiList(next);
    saveNotulensiRapatList(next);
    setShowAddRapatModal(false);
    setNewJudul('');
    setNewKeputusanText('');
    setNewActionTugas('');

    logKaprodiActivity({
      actor: selectedProdi.kaprodi,
      role: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      category: 'NOTULENSI_RAPAT',
      actionTitle: `Pencatatan Notulensi Rapat Jurusan (${newRecord.nomorNotulen})`,
      detail: `Menambahkan notulensi rapat "${newRecord.judulRapat}" beserta ${newRecord.actionItems.length} action item.`,
      severity: 'info'
    });
    onShowToast?.(`Notulensi rapat "${newRecord.judulRapat}" berhasil disimpan.`);
  };

  const handleDeleteRapat = (rapat: NotulensiRapatRecord) => {
    const next = notulensiList.filter(r => r.id !== rapat.id);
    setNotulensiList(next);
    saveNotulensiRapatList(next);
    logKaprodiActivity({
      actor: selectedProdi.kaprodi,
      role: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      category: 'PENGHAPUSAN_DATA',
      actionTitle: `Penghapusan Arsip Notulensi (${rapat.nomorNotulen})`,
      detail: `Menghapus entri notulensi rapat "${rapat.judulRapat}" dari arsip jurusan.`,
      severity: 'critical'
    });
    onShowToast?.('Notulensi rapat dihapus & tercatat di Log Aktivitas Kaprodi.');
  };

  const handlePrintBeritaAcara = () => {
    if (!beritaAcaraPdfRef.current || !selectedRapat) return;
    printDocumentElement(beritaAcaraPdfRef.current, {
      documentTitle: `Berita_Acara_Rapat_${selectedRapat.nomorNotulen.replace(/\//g, '-')}`,
      orientation: 'portrait'
    });
    logKaprodiActivity({
      actor: selectedProdi.kaprodi,
      role: `Kaprodi ${selectedProdi.singkatan}`,
      prodiId: selectedProdi.id,
      category: 'EXPORT_DOKUMEN',
      actionTitle: `Ekspor PDF Berita Acara Rapat (${selectedRapat.nomorNotulen})`,
      detail: `Mencetak dokumen resmi Berita Acara Rapat "${selectedRapat.judulRapat}".`,
      severity: 'info'
    });
  };

  const handleExportLogsCsv = () => {
    const headers = ['Timestamp', 'Aktor', 'Jabatan', 'Prodi', 'Kategori', 'Tindakan', 'Detail'];
    const lines = filteredLogs.map(l =>
      [l.timestamp, l.actor, l.role, l.prodiId, l.category, l.actionTitle, l.detail]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Log_Aktivitas_Kaprodi_${selectedProdi.singkatan}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast?.('Log Aktivitas Kaprodi berhasil diunduh sebagai CSV.');
  };

  return (
    <section className="space-y-6">
      {/* 1. Sistem Pengingat Otomatis Action Items Rapat Mendekati Tenggat (Prompt #8) */}
      {approachingAlerts.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Pengingat Otomatis Action Items Rapat Mendekati Tenggat Waktu (&le; 3 Hari)
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                    {approachingAlerts.length} Tindak Lanjut Mendesak
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  Sistem mendeteksi butir keputusan rapat jurusan yang mendekati batas penyelesaian. Pastikan penanggung jawab menuntaskan tugas tepat waktu.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {approachingAlerts.map(alert => (
                    <div
                      key={alert.actionItem.id}
                      className="bg-white border border-amber-200 rounded-xl p-3 flex items-start justify-between gap-2.5 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              alert.daysLeft <= 0
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {alert.daysLeft < 0
                              ? `Terlambat ${Math.abs(alert.daysLeft)} Hari`
                              : alert.daysLeft === 0
                              ? 'Jatuh Tempo Hari Ini'
                              : `H-${alert.daysLeft} (${alert.actionItem.deadline})`}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {alert.actionItem.penanggungJawab}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">{alert.actionItem.tugas}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[300px]">
                          Dari: {alert.judulRapat}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleActionItemStatus(alert.rapatId, alert.actionItem.id)}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white text-[10px] font-bold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{alert.actionItem.status === 'Belum Selesai' ? 'Proses' : 'Selesaikan'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Notulensi Rapat Jurusan + Log Aktivitas Kaprodi */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Panel 2: Notulensi Rapat Jurusan (7 cols) */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#065f46] border border-emerald-200 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Notulensi Rapat Jurusan &amp; Pelacakan Action Items
                </h2>
                <p className="text-xs text-slate-500">
                  Dokumentasi keputusan strategis rapat prodi, daftar hadir &amp; ekspor Berita Acara Resmi ber-Kop Surat.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddRapatModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#065f46] hover:bg-emerald-900 text-white text-xs font-bold shadow-xs shrink-0 self-start cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Notulensi Rapat</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {scopedNotulensi.map(rapat => (
              <div key={rapat.id} className="bg-[#fafaf5] border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800">
                        {rapat.nomorNotulen}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {rapat.tanggalRapat} · {rapat.waktu}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">
                      {rapat.judulRapat}
                    </h3>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Pimpinan: <strong>{rapat.pimpinanRapat}</strong> · Lokasi: {rapat.tempat} ·{' '}
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" /> {rapat.pesertaHadir.length} Peserta
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedRapat(rapat)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-[#ecfdf5] text-[#065f46] text-[11px] font-bold cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Berita Acara PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRapat(rapat)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-700 cursor-pointer"
                      title="Hapus Notulensi (Tercatat di Audit Log)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Decisions */}
                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Ringkasan Keputusan Rapat:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                    {rapat.ringkasanKeputusan.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                {rapat.actionItems.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Tindak Lanjut (Action Items):
                    </div>
                    {rapat.actionItems.map(item => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{item.tugas}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            PIC: {item.penanggungJawab} · Tenggat: {item.deadline}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleActionItemStatus(rapat.id, item.id)}
                          className={`shrink-0 px-2.5 py-1 rounded border text-[10px] font-bold cursor-pointer ${
                            item.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : item.status === 'Dalam Proses'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}
                        >
                          {item.status}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Log Aktivitas Kaprodi (Prompt #7, 5 cols) */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Log Aktivitas Kaprodi (Audit Trail)
                </h2>
                <p className="text-xs text-slate-500">
                  Pencatatan otomatis validasi BAP, perubahan target IKU, ekspor &amp; penghapusan data.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportLogsCsv}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shrink-0 cursor-pointer"
              title="Unduh Log Aktivitas sebagai CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={logSearchQuery}
                onChange={e => setLogSearchQuery(e.target.value)}
                placeholder="Cari aktor atau tindakan..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#fafaf5] border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <select
              value={logCategoryFilter}
              onChange={e => setLogCategoryFilter(e.target.value as 'ALL' | KaprodiActivityCategory)}
              className="px-2.5 py-1.5 bg-[#fafaf5] border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              aria-label="Filter Kategori Log Aktivitas"
            >
              {(Object.keys(CATEGORY_LABELS) as Array<'ALL' | KaprodiActivityCategory>).map(cat => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 flex-1">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Belum ada entri log untuk filter yang dipilih.
              </div>
            ) : (
              filteredLogs.map(entry => (
                <div
                  key={entry.id}
                  className={`rounded-xl border p-3 text-xs space-y-1 ${
                    entry.severity === 'critical'
                      ? 'bg-rose-50/70 border-rose-200'
                      : entry.severity === 'warning'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-[#fafaf5] border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-800">
                      {entry.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{entry.timestamp}</span>
                  </div>
                  <div className="font-bold text-slate-900">{entry.actionTitle}</div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">{entry.detail}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <ShieldCheck className="w-3 h-3 text-[#065f46]" />
                      {entry.actor} ({entry.role})
                    </span>
                    <span className="font-mono font-bold">{entry.prodiId}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Notulensi Modal */}
      {showAddRapatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-3.5 bg-[#065f46] text-white flex items-center justify-between">
              <h4 className="text-sm font-bold">Catat Notulensi Rapat Jurusan Baru</h4>
              <button type="button" onClick={() => setShowAddRapatModal(false)} className="p-1 hover:bg-emerald-800 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddNotulensi} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Agenda Rapat</label>
                <input
                  type="text"
                  required
                  value={newJudul}
                  onChange={e => setNewJudul(e.target.value)}
                  placeholder="Contoh: Rapat Evaluasi Perkuliahan Minggu Ke-8 & Kesiapan UTS"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={newTanggal}
                    onChange={e => setNewTanggal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Waktu</label>
                  <input
                    type="text"
                    value={newWaktu}
                    onChange={e => setNewWaktu(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tempat / Ruang Rapat</label>
                <input
                  type="text"
                  value={newTempat}
                  onChange={e => setNewTempat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Keputusan Rapat (1 per baris)</label>
                <textarea
                  rows={3}
                  value={newKeputusanText}
                  onChange={e => setNewKeputusanText(e.target.value)}
                  placeholder="Masukkan butir keputusan rapat..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="bg-[#fafaf5] border border-emerald-200 rounded-xl p-3 space-y-2">
                <div className="font-bold text-[#065f46]">Tambah Action Item (Tindak Lanjut)</div>
                <input
                  type="text"
                  value={newActionTugas}
                  onChange={e => setNewActionTugas(e.target.value)}
                  placeholder="Tugas tindak lanjut yang dipantau tenggatnya..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newActionPic}
                    onChange={e => setNewActionPic(e.target.value)}
                    placeholder="Penanggung Jawab"
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="date"
                    value={newActionDeadline}
                    onChange={e => setNewActionDeadline(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRapatModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#065f46] text-white font-bold cursor-pointer"
                >
                  Simpan Notulensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Berita Acara Rapat Official PDF Preview Modal */}
      {selectedRapat && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-[#065f46] text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Pratinjau Berita Acara Rapat Jurusan (PDF)</h4>
                <p className="text-[11px] text-emerald-100">Nomor: {selectedRapat.nomorNotulen}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintBeritaAcara}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#065f46] rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRapat(null)}
                  className="p-1.5 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100">
              <div ref={beritaAcaraPdfRef} className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs space-y-5 text-slate-900">
                <StandardKopSurat
                  prodiName={selectedProdi.nama}
                  subTitle={`Berita Acara & Notulensi Rapat Jurusan — ${selectedRapat.nomorNotulen}`}
                  showQrCode={true}
                  qrCodeUrl={`https://sikaprodi.ft.unbari.ac.id/verify/rapat/${selectedRapat.id}`}
                  qrBadgeText="SAH RAPAT"
                />

                <div className="text-center space-y-0.5">
                  <h2 className="text-base font-bold uppercase underline">BERITA ACARA RAPAT JURUSAN</h2>
                  <p className="text-xs font-mono text-slate-600">Nomor: {selectedRapat.nomorNotulen}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 border border-slate-300 rounded-lg p-3">
                  <div><strong>Agenda Rapat:</strong> {selectedRapat.judulRapat}</div>
                  <div><strong>Pimpinan Rapat:</strong> {selectedRapat.pimpinanRapat}</div>
                  <div><strong>Tanggal &amp; Jam:</strong> {selectedRapat.tanggalRapat} · {selectedRapat.waktu}</div>
                  <div><strong>Lokasi Rapat:</strong> {selectedRapat.tempat}</div>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase text-slate-800 mb-1">1. Peserta Rapat Hadir</h5>
                  <ol className="list-decimal pl-5 text-xs space-y-0.5">
                    {selectedRapat.pesertaHadir.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase text-slate-800 mb-1">2. Ringkasan Keputusan Rapat</h5>
                  <ol className="list-decimal pl-5 text-xs space-y-1">
                    {selectedRapat.ringkasanKeputusan.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase text-slate-800 mb-1.5">3. Matriks Tindak Lanjut (Action Items)</h5>
                  <table className="w-full text-left border-collapse text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="py-1.5 px-2.5 border-r border-slate-300">Tugas Tindak Lanjut</th>
                        <th className="py-1.5 px-2.5 border-r border-slate-300">Penanggung Jawab</th>
                        <th className="py-1.5 px-2.5 text-center border-r border-slate-300">Tenggat</th>
                        <th className="py-1.5 px-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedRapat.actionItems.map(ai => (
                        <tr key={ai.id}>
                          <td className="py-1.5 px-2.5 border-r border-slate-200">{ai.tugas}</td>
                          <td className="py-1.5 px-2.5 border-r border-slate-200">{ai.penanggungJawab}</td>
                          <td className="py-1.5 px-2.5 text-center font-mono border-r border-slate-200">{ai.deadline}</td>
                          <td className="py-1.5 px-2.5 text-center font-bold">{ai.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 flex justify-end text-xs">
                  <div className="text-right space-y-10">
                    <div>
                      <p>Jambi, {selectedRapat.tanggalRapat}</p>
                      <p className="font-bold">Pimpinan Rapat / Ketua Program Studi</p>
                    </div>
                    <div>
                      <p className="font-bold underline">{selectedProdi.kaprodi}</p>
                      <p className="font-mono text-[11px] text-slate-600">NIP. {selectedProdi.nipKaprodi}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
