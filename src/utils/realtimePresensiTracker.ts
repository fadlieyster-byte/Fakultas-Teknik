import { Dosen, JadwalKuliah, LogPresensiDosen } from '../types/index';
import { timeStringToMinutes } from './timeHelper';

export const PRESENSI_TOLERANCE_MINUTES = 15;

export type RealtimeSessionTrackingStatus =
  | 'TERLAMBAT'
  | 'BELUM_HADIR'
  | 'MENUNGGU_CHECKIN'
  | 'HADIR_TEPAT_WAKTU'
  | 'TERJADWAL'
  | 'DITIADAKAN';

export interface RealtimeTrackedSession {
  jadwal: JadwalKuliah;
  matchedLog?: LogPresensiDosen;
  matchedDosen?: Dosen;
  status: RealtimeSessionTrackingStatus;
  statusLabel: string;
  statusDetail: string;
  selisihMenit: number;
  lewatBatas15Menit: boolean;
  jamMasukAktual: string | null;
  hasCheckInLog: boolean;
}

export interface RealtimePresensiSummary {
  academicDayEvaluated: string;
  currentTimeStr: string;
  totalSessions: number;
  terlambatCount: number;
  belumHadirCount: number;
  flaggedOver15Count: number;
  hadirTepatWaktuCount: number;
  menungguCount: number;
  terjadwalCount: number;
  ditiadakanCount: number;
  complianceRatePercent: number;
  items: RealtimeTrackedSession[];
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b(dr|ir|prof|st|s\.t|mt|m\.t|m\.eng|m\.si|m\.sc|m\.hum|m\.pd\.i|m\.h|ipm|ipp|asean|eng|sp)\b\.?/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

function findMatchingLog(
  jadwal: JadwalKuliah,
  logs: LogPresensiDosen[]
): LogPresensiDosen | undefined {
  const candidates = logs.filter(log => {
    if (log.jadwalId && log.jadwalId === jadwal.id) return true;
    if (log.prodiId !== jadwal.prodiId) return false;

    const sameCourseAndTime =
      (log.kodeMK.toLowerCase() === jadwal.kodeMK.toLowerCase() ||
        normalizeName(log.namaMK) === normalizeName(jadwal.namaMK)) &&
      log.hari === jadwal.hari &&
      Math.abs(timeStringToMinutes(log.jamMulaiRencana) - timeStringToMinutes(jadwal.jamMulai)) <= 15;

    if (sameCourseAndTime) return true;

    const sameDosenAndSlot =
      log.dosenNidn &&
      jadwal.dosenNidn &&
      log.dosenNidn === jadwal.dosenNidn &&
      log.hari === jadwal.hari &&
      Math.abs(timeStringToMinutes(log.jamMulaiRencana) - timeStringToMinutes(jadwal.jamMulai)) <= 15;

    return Boolean(sameDosenAndSlot);
  });

  if (candidates.length === 0) return undefined;

  return [...candidates].sort((a, b) => {
    if ((b.mingguKe || 0) !== (a.mingguKe || 0)) {
      return (b.mingguKe || 0) - (a.mingguKe || 0);
    }
    return (b.tanggal || '').localeCompare(a.tanggal || '');
  })[0];
}

function findMatchingDosen(jadwal: JadwalKuliah, dosenList: Dosen[]): Dosen | undefined {
  if (jadwal.dosenNidn) {
    const byNidn = dosenList.find(d => d.nidn === jadwal.dosenNidn);
    if (byNidn) return byNidn;
  }
  const targetNorm = normalizeName(jadwal.dosenNama);
  if (!targetNorm) return undefined;
  return dosenList.find(d => {
    const norm = normalizeName(d.namaLengkap);
    return norm === targetNorm || norm.includes(targetNorm.slice(0, 8)) || targetNorm.includes(norm.slice(0, 8));
  });
}

export function evaluateRealtimeJadwalPresensi(params: {
  jadwalList: JadwalKuliah[];
  logPresensiList: LogPresensiDosen[];
  dosenList: Dosen[];
  currentDay: string;
  currentTimeStr: string;
  dayFilter?: 'TODAY' | 'ALL';
}): RealtimePresensiSummary {
  const {
    jadwalList,
    logPresensiList,
    dosenList,
    currentDay,
    currentTimeStr,
    dayFilter = 'TODAY'
  } = params;

  const nowMin = timeStringToMinutes(currentTimeStr);

  const scopedJadwal = jadwalList.filter(j => {
    const isEmptySlot = j.terdaftar === 0 && j.pesertaTotal === 0;
    if (isEmptySlot) return false;
    if (dayFilter === 'TODAY') {
      return j.hari === currentDay;
    }
    return true;
  });

  const items: RealtimeTrackedSession[] = scopedJadwal.map(jadwal => {
    const matchedLog = findMatchingLog(jadwal, logPresensiList);
    const matchedDosen = findMatchingDosen(jadwal, dosenList);
    const startMin = timeStringToMinutes(jadwal.jamMulai);
    const endMin = timeStringToMinutes(jadwal.jamSelesai);
    const elapsedFromStart = nowMin - startMin;

    // 1. Ditiadakan
    if (jadwal.statusSesi === 'Ditiadakan' || matchedLog?.statusKehadiran === 'Ditiadakan') {
      return {
        jadwal,
        matchedLog,
        matchedDosen,
        status: 'DITIADAKAN',
        statusLabel: 'Ditiadakan',
        statusDetail: 'Sesi perkuliahan ditandai ditiadakan pada jadwal akademik.',
        selisihMenit: 0,
        lewatBatas15Menit: false,
        jamMasukAktual: matchedLog?.jamMasukAktual || null,
        hasCheckInLog: Boolean(matchedLog)
      };
    }

    // 2. Log presensi ditemukan — bandingkan jamMasukAktual vs jamMulai jadwal
    if (matchedLog && matchedLog.jamMasukAktual) {
      const actualMin = timeStringToMinutes(matchedLog.jamMasukAktual);
      const delayMenit = actualMin - startMin;

      if (delayMenit > PRESENSI_TOLERANCE_MINUTES || matchedLog.statusKehadiran === 'Hadir Terlambat') {
        const displayDelay = Math.max(PRESENSI_TOLERANCE_MINUTES + 1, delayMenit);
        return {
          jadwal,
          matchedLog,
          matchedDosen,
          status: 'TERLAMBAT',
          statusLabel: 'Terlambat',
          statusDetail: `Log presensi masuk pukul ${matchedLog.jamMasukAktual} WIB (+${displayDelay} menit melewati batas ${PRESENSI_TOLERANCE_MINUTES} menit dari jadwal ${jadwal.jamMulai} WIB).`,
          selisihMenit: displayDelay,
          lewatBatas15Menit: true,
          jamMasukAktual: matchedLog.jamMasukAktual,
          hasCheckInLog: true
        };
      }

      const earlyOrLateText =
        delayMenit <= 0
          ? `${Math.abs(delayMenit)} mnt lebih awal`
          : `+${delayMenit} mnt (dalam toleransi)`;

      return {
        jadwal,
        matchedLog,
        matchedDosen,
        status: 'HADIR_TEPAT_WAKTU',
        statusLabel: 'Hadir Tepat Waktu',
        statusDetail: `Log presensi tercatat pukul ${matchedLog.jamMasukAktual} WIB (${earlyOrLateText}).`,
        selisihMenit: delayMenit,
        lewatBatas15Menit: false,
        jamMasukAktual: matchedLog.jamMasukAktual,
        hasCheckInLog: true
      };
    }

    // 3. Belum ada log presensi — cek waktu saat ini terhadap jadwal mulai (+15 menit)
    if (elapsedFromStart < 0) {
      return {
        jadwal,
        matchedDosen,
        status: 'TERJADWAL',
        statusLabel: 'Belum Mulai',
        statusDetail: `Terjadwal mulai pukul ${jadwal.jamMulai} WIB (${Math.abs(elapsedFromStart)} menit lagi).`,
        selisihMenit: elapsedFromStart,
        lewatBatas15Menit: false,
        jamMasukAktual: null,
        hasCheckInLog: false
      };
    }

    if (elapsedFromStart <= PRESENSI_TOLERANCE_MINUTES) {
      const sisaToleransi = PRESENSI_TOLERANCE_MINUTES - elapsedFromStart;
      return {
        jadwal,
        matchedDosen,
        status: 'MENUNGGU_CHECKIN',
        statusLabel: 'Menunggu Check-In',
        statusDetail: `Berjalan +${elapsedFromStart} mnt dari jadwal (${jadwal.jamMulai} WIB) · Sisa toleransi ${sisaToleransi} mnt sebelum ditandai otomatis.`,
        selisihMenit: elapsedFromStart,
        lewatBatas15Menit: false,
        jamMasukAktual: null,
        hasCheckInLog: false
      };
    }

    // elapsedFromStart > 15 menit dan tidak ada log presensi
    const isDosenTerdeteksiAktif =
      matchedDosen &&
      (matchedDosen.statusRealTime === 'Sedang Mengajar' ||
        matchedDosen.statusRealTime === 'Ada di Ruang Dosen' ||
        matchedDosen.statusRealTime === 'Bimbingan Mahasiswa') &&
      nowMin < endMin;

    if (isDosenTerdeteksiAktif) {
      return {
        jadwal,
        matchedDosen,
        status: 'TERLAMBAT',
        statusLabel: 'Terlambat',
        statusDetail: `Waktu saat ini (${currentTimeStr} WIB) lewat +${elapsedFromStart} mnt dari jadwal mulai (${jadwal.jamMulai}). Dosen berstatus "${matchedDosen.statusRealTime}", namun log presensi kelas belum masuk.`,
        selisihMenit: elapsedFromStart,
        lewatBatas15Menit: true,
        jamMasukAktual: null,
        hasCheckInLog: false
      };
    }

    const sessionEndedWithoutLog = nowMin >= endMin;
    return {
      jadwal,
      matchedDosen,
      status: 'BELUM_HADIR',
      statusLabel: 'Belum Hadir',
      statusDetail: sessionEndedWithoutLog
        ? `Sesi ${jadwal.jamMulai}–${jadwal.jamSelesai} WIB telah lewat (+${elapsedFromStart} mnt dari jadwal mulai) tanpa data log presensi dosen.`
        : `Waktu saat ini (${currentTimeStr} WIB) lewat +${elapsedFromStart} mnt dari jadwal mulai (${jadwal.jamMulai} WIB) · Belum ada log presensi dosen.`,
      selisihMenit: elapsedFromStart,
      lewatBatas15Menit: true,
      jamMasukAktual: null,
      hasCheckInLog: false
    };
  });

  // Sort: BELUM_HADIR -> TERLAMBAT -> MENUNGGU_CHECKIN -> HADIR_TEPAT_WAKTU -> TERJADWAL -> DITIADAKAN
  const rank: Record<RealtimeSessionTrackingStatus, number> = {
    BELUM_HADIR: 0,
    TERLAMBAT: 1,
    MENUNGGU_CHECKIN: 2,
    HADIR_TEPAT_WAKTU: 3,
    TERJADWAL: 4,
    DITIADAKAN: 5
  };

  items.sort((a, b) => {
    const rDiff = rank[a.status] - rank[b.status];
    if (rDiff !== 0) return rDiff;
    return timeStringToMinutes(a.jadwal.jamMulai) - timeStringToMinutes(b.jadwal.jamMulai);
  });

  const terlambatCount = items.filter(i => i.status === 'TERLAMBAT').length;
  const belumHadirCount = items.filter(i => i.status === 'BELUM_HADIR').length;
  const menungguCount = items.filter(i => i.status === 'MENUNGGU_CHECKIN').length;
  const hadirTepatWaktuCount = items.filter(i => i.status === 'HADIR_TEPAT_WAKTU').length;
  const terjadwalCount = items.filter(i => i.status === 'TERJADWAL').length;
  const ditiadakanCount = items.filter(i => i.status === 'DITIADAKAN').length;
  const flaggedOver15Count = terlambatCount + belumHadirCount;
  const startedCount = items.filter(
    i => i.status !== 'TERJADWAL' && i.status !== 'DITIADAKAN'
  ).length;
  const complianceRatePercent =
    startedCount > 0 ? Math.round((hadirTepatWaktuCount / startedCount) * 100) : 100;

  return {
    academicDayEvaluated: dayFilter === 'TODAY' ? currentDay : 'Semua Hari (Senin–Sabtu)',
    currentTimeStr,
    totalSessions: items.length,
    terlambatCount,
    belumHadirCount,
    flaggedOver15Count,
    hadirTepatWaktuCount,
    menungguCount,
    terjadwalCount,
    ditiadakanCount,
    complianceRatePercent,
    items
  };
}
