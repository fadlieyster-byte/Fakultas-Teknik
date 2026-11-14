import { JadwalKuliah } from '../types';

export const HARI_INDONESIA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

export function getHariIniIndonesia(): 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu' {
  const dayIndex = new Date().getDay();
  return HARI_INDONESIA[dayIndex];
}

export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function isJadwalSedangBerlangsung(
  jadwal: JadwalKuliah,
  targetHari: string,
  currentTimeStr: string
): boolean {
  if (jadwal.hari !== targetHari) return false;
  if (jadwal.statusSesi === 'Ditiadakan') return false;

  const currentMin = timeStringToMinutes(currentTimeStr);
  const startMin = timeStringToMinutes(jadwal.jamMulai);
  const endMin = timeStringToMinutes(jadwal.jamSelesai);

  return currentMin >= startMin && currentMin < endMin;
}

export function hitungSisaWaktu(jadwal: JadwalKuliah, currentTimeStr: string): string {
  const currentMin = timeStringToMinutes(currentTimeStr);
  const endMin = timeStringToMinutes(jadwal.jamSelesai);
  const diff = endMin - currentMin;

  if (diff <= 0) return 'Selesai';
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0) {
    return `${hours} jam ${mins} mnt lagi`;
  }
  return `${mins} menit lagi`;
}

export function cekBentrokJadwal(
  daftarJadwal: JadwalKuliah[],
  jadwalBaru: {
    id?: string;
    hari: string;
    jamMulai: string;
    jamSelesai: string;
    dosenNidn: string;
    ruanganId: string;
  }
): { isBentrok: boolean; pesan?: string } {
  const startNew = timeStringToMinutes(jadwalBaru.jamMulai);
  const endNew = timeStringToMinutes(jadwalBaru.jamSelesai);

  if (startNew >= endNew) {
    return { isBentrok: true, pesan: 'Jam selesai harus lebih besar dari jam mulai.' };
  }

  for (const j of daftarJadwal) {
    if (jadwalBaru.id && j.id === jadwalBaru.id) continue;
    if (j.hari !== jadwalBaru.hari) continue;
    if (j.statusSesi === 'Ditiadakan') continue;

    const startExisting = timeStringToMinutes(j.jamMulai);
    const endExisting = timeStringToMinutes(j.jamSelesai);

    // Overlap condition
    const overlap = Math.max(startNew, startExisting) < Math.min(endNew, endExisting);

    if (overlap) {
      if (j.ruanganId === jadwalBaru.ruanganId) {
        return {
          isBentrok: true,
          pesan: `Bentrok Ruangan: Ruangan ${j.ruanganNama} sudah digunakan oleh mata kuliah "${j.namaMK}" (${j.jamMulai} - ${j.jamSelesai})`
        };
      }

      if (j.dosenNidn === jadwalBaru.dosenNidn) {
        return {
          isBentrok: true,
          pesan: `Bentrok Dosen: Dosen ${j.dosenNama} sudah memiliki jadwal mengajar "${j.namaMK}" pada jam ${j.jamMulai} - ${j.jamSelesai}`
        };
      }
    }
  }

  return { isBentrok: false };
}
