import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellRing,
  AlertTriangle,
  FileCheck,
  FileText,
  BookOpen,
  CalendarClock,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { ProgramStudiInfo } from '../types/index';
import {
  getApproachingActionItems,
  getBkdDeadlineInfo
} from '../utils/activityLogHelper';

export type NotificationUrgency = 'Semua' | 'Kritis' | 'Tinggi' | 'Normal';

export interface UnifiedNotificationItem {
  id: string;
  title: string;
  detail: string;
  source: 'EWS' | 'BAP' | 'Tata Usaha' | 'BKD' | 'Rapat' | 'Lab';
  urgency: 'Kritis' | 'Tinggi' | 'Normal';
  targetTab: string;
  timestampLabel: string;
}

interface NotificationCenterDropdownProps {
  selectedProdi: ProgramStudiInfo;
  alertCount: number;
  pendingBapCount: number;
  tuPendingCount: number;
  urgentCalibrationCount?: number;
  onNavigateTab: (tab: string) => void;
  onShowToast?: (msg: string) => void;
}

export const NotificationCenterDropdown: React.FC<NotificationCenterDropdownProps> = ({
  selectedProdi,
  alertCount,
  pendingBapCount,
  tuPendingCount,
  urgentCalibrationCount = 0,
  onNavigateTab,
  onShowToast
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState<NotificationUrgency>('Semua');
  const [pushStatus, setPushStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return window.Notification.permission;
    }
    return 'unsupported';
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const bkdDeadline = getBkdDeadlineInfo();
  const approachingActions = getApproachingActionItems(selectedProdi.id);

  const notifications: UnifiedNotificationItem[] = [];

  if (alertCount > 0) {
    notifications.push({
      id: 'notif-ews',
      title: `${alertCount} Mahasiswa Status EWS / Peringatan SP`,
      detail: `Segera lakukan intervensi Academic Recovery Plan pada Prodi ${selectedProdi.nama}.`,
      source: 'EWS',
      urgency: 'Kritis',
      targetTab: 'mahasiswa',
      timestampLabel: 'Hari ini'
    });
  }

  if (bkdDeadline.incompleteLecturers.length > 0) {
    notifications.push({
      id: 'notif-bkd-3days',
      title: `Pengingat H-${bkdDeadline.daysRemaining} Batas Unggah BKD (${bkdDeadline.deadlineLabel})`,
      detail: `${bkdDeadline.incompleteLecturers.length} dosen belum melengkapi berkas di Repository BKD (${bkdDeadline.incompleteLecturers.map(d => d.nama.split(',')[0]).join(', ')}).`,
      source: 'BKD',
      urgency: 'Kritis',
      targetTab: 'bkd',
      timestampLabel: `H-${bkdDeadline.daysRemaining}`
    });
  }

  approachingActions.forEach(item => {
    notifications.push({
      id: `notif-rapat-${item.actionItem.id}`,
      title: `Action Item Rapat (${item.daysLeft <= 0 ? 'Hari Ini' : `H-${item.daysLeft}`})`,
      detail: `${item.actionItem.tugas} · PIC: ${item.actionItem.penanggungJawab}`,
      source: 'Rapat',
      urgency: item.daysLeft <= 1 ? 'Kritis' : 'Tinggi',
      targetTab: 'dashboard',
      timestampLabel: item.actionItem.deadline
    });
  });

  if (pendingBapCount > 0) {
    notifications.push({
      id: 'notif-bap',
      title: `${pendingBapCount} Berita Acara Perkuliahan (BAP) Menunggu Validasi`,
      detail: `Verifikasi Kaprodi diperlukan agar durasi mengajar & honorarium SKS dosen tercatat sah.`,
      source: 'BAP',
      urgency: 'Tinggi',
      targetTab: 'jadwal',
      timestampLabel: 'Aktif'
    });
  }

  if (urgentCalibrationCount > 0) {
    notifications.push({
      id: 'notif-lab-cal',
      title: `${urgentCalibrationCount} Alat Laboratorium Memerlukan Kalibrasi`,
      detail: `Cek Log Audit Kalibrasi untuk menghindari keterlambatan sertifikasi standar KAN.`,
      source: 'Lab',
      urgency: 'Tinggi',
      targetTab: 'laboratorium',
      timestampLabel: 'Audit Lab'
    });
  }

  if (tuPendingCount > 0) {
    notifications.push({
      id: 'notif-tu',
      title: `${tuPendingCount} Permohonan Surat Tata Usaha Dalam Proses`,
      detail: `Tinjau antrean verifikasi persuratan akademik fakultas dan mahasiswa.`,
      source: 'Tata Usaha',
      urgency: 'Normal',
      targetTab: 'tata_usaha',
      timestampLabel: 'Antrean TU'
    });
  }

  const filtered =
    urgencyFilter === 'Semua'
      ? notifications
      : notifications.filter(n => n.urgency === urgencyFilter);

  const criticalCount = notifications.filter(n => n.urgency === 'Kritis').length;

  const handleEnableWebPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPushStatus('unsupported');
      onShowToast?.('Browser tidak mendukung Notification API; notifikasi akan tampil sebagai pengingat layar.');
      return;
    }

    try {
      const permission = await window.Notification.requestPermission();
      setPushStatus(permission);
      if (permission === 'granted') {
        new window.Notification('SiKaprodi FT UNBARI — Notifikasi Push Aktif', {
          body: `Notifikasi waktu-nyata untuk Verifikasi BAP & Surat TU Prodi ${selectedProdi.nama} telah diaktifkan.`
        });
        onShowToast?.('Web Browser Push Notification berhasil diaktifkan.');
      } else {
        onShowToast?.('Izin notifikasi browser belum diberikan. Pengingat dalam aplikasi tetap aktif.');
      }
    } catch {
      onShowToast?.('Gagal meminta izin push browser; menggunakan pengingat dalam aplikasi.');
    }
  };

  const getIcon = (source: UnifiedNotificationItem['source']) => {
    switch (source) {
      case 'EWS':
        return <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />;
      case 'BAP':
        return <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />;
      case 'Tata Usaha':
        return <FileText className="w-4 h-4 text-amber-700 shrink-0" />;
      case 'BKD':
        return <BookOpen className="w-4 h-4 text-red-600 shrink-0" />;
      case 'Rapat':
        return <CalendarClock className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'Lab':
        return <FlaskConical className="w-4 h-4 text-teal-700 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        title="Pusat Notifikasi Terpadu & Pengingat Akademik"
        className={`relative h-9 w-9 inline-flex items-center justify-center rounded-xl border transition-all shadow-2xs ${
          isOpen
            ? 'bg-emerald-800 text-white border-emerald-900'
            : notifications.length > 0
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        {criticalCount > 0 ? (
          <BellRing className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {notifications.length > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shadow-xs ${
              criticalCount > 0
                ? 'bg-red-600 text-white'
                : 'bg-emerald-700 text-white'
            }`}
          >
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[360px] sm:w-[400px] bg-white border border-emerald-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 bg-[#065f46] text-white flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold tracking-wide">Pusat Notifikasi Terpadu</h4>
              <p className="text-[11px] text-emerald-100">
                {notifications.length} pengingat aktif · {selectedProdi.singkatan}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/15 text-emerald-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Urgency Filter Strip */}
          <div className="px-3 py-2 bg-[#ecfdf5] border-b border-emerald-100 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              {(['Semua', 'Kritis', 'Tinggi', 'Normal'] as NotificationUrgency[]).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgencyFilter(level)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    urgencyFilter === level
                      ? 'bg-[#065f46] text-white shadow-2xs'
                      : 'text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleEnableWebPush}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-colors ${
                pushStatus === 'granted'
                  ? 'bg-white border-emerald-300 text-emerald-800'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {pushStatus === 'granted' ? 'Push Aktif' : 'Aktifkan Push'}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-semibold text-slate-700">
                  Tidak ada notifikasi pada tingkat urgensi {urgencyFilter}.
                </p>
              </div>
            ) : (
              filtered.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigateTab(item.targetTab);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50/60 transition-colors flex items-start gap-3"
                >
                  <div className="mt-0.5">{getIcon(item.source)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          item.urgency === 'Kritis'
                            ? 'bg-red-100 text-red-800'
                            : item.urgency === 'Tinggi'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.source} · {item.urgency}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {item.timestampLabel}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1">{item.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{item.detail}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
