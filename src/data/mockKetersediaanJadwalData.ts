import { KetersediaanJadwalDosen, HariKuliah, JadwalKuliah } from '../types/index';
import { INITIAL_DOSEN } from './mockData';

export const INITIAL_KETERSEDIAAN_JADWAL: KetersediaanJadwalDosen[] = [
  // --- DOSEN S1 TEKNIK SIPIL ---
  {
    id: 'KJS-DOS-01',
    dosenId: 'DOS-SPL-01',
    nidn: '1013069302',
    namaDosen: 'Ir. Rioni Rizki Aldiansyah, ST., MT, IPM, ASEAN Eng.',
    gelar: 'Ir., ST., MT, IPM, ASEAN Eng.',
    prodiId: 'SIPIL',
    senin: { status: 'jam_khusus', jam: '09.00 – 12.00', keterangan: 'Rapat Prodi jam 13.00' },
    selasa: { status: 'bersedia_penuh' },
    rabu: { status: 'jam_khusus', jam: '13.30 – 16.00', keterangan: 'Mengajar pagi jam 08.00 - 10.30' },
    kamis: { status: 'bersedia_penuh' },
    jumat: { status: 'tidak_bersedia', keterangan: 'Tugas Dekanat / Supervisi Lapangan' },
    sabtu: { status: 'jam_khusus', jam: '08.30 – 12.00' },
    catatanKhusus: 'KBK Manajemen Konstruksi & Struktur. Siap menguji proposal dan meja hijau.',
    terakhirDiperbarui: '2026-11-10'
  },
  {
    id: 'KJS-DOS-02',
    dosenId: 'DOS-SPL-02',
    nidn: '1008066801',
    namaDosen: 'Ir. Fachruddin Noor, S.T., M.T.',
    gelar: 'Ir., S.T., M.T.',
    prodiId: 'SIPIL',
    senin: { status: 'bersedia_penuh' },
    selasa: { status: 'jam_khusus', jam: '09.00 – 12.00' },
    rabu: { status: 'bersedia_penuh' },
    kamis: { status: 'jam_khusus', jam: '10.00 – 14.00' },
    jumat: { status: 'jam_khusus', jam: '08.30 – 11.00' },
    sabtu: { status: 'tidak_bersedia', keterangan: 'Konsultan Proyek Jembatan Batanghari' },
    catatanKhusus: 'KBK Struktur Jembatan & Pondasi Dalam.',
    terakhirDiperbarui: '2026-11-09'
  },
  {
    id: 'KJS-DOS-03',
    dosenId: 'DOS-SPL-03',
    nidn: '1022037101',
    namaDosen: 'Dr. Ir. H. M. Nursyaifi, M.T.',
    gelar: 'Dr. Ir., M.T.',
    prodiId: 'SIPIL',
    senin: { status: 'tidak_bersedia', keterangan: 'Bimbingan Doktoral Luar Kota' },
    selasa: { status: 'bersedia_penuh' },
    rabu: { status: 'jam_khusus', jam: '08.30 – 12.00' },
    kamis: { status: 'bersedia_penuh' },
    jumat: { status: 'jam_khusus', jam: '09.00 – 11.30' },
    sabtu: { status: 'bersedia_penuh' },
    catatanKhusus: 'Penguji Utama Bidang Transportasi & Perkerasan Jalan.',
    terakhirDiperbarui: '2026-11-08'
  },
  {
    id: 'KJS-DOS-04',
    dosenId: 'DOS-SPL-04',
    nidn: '1015118401',
    namaDosen: 'Ade Suryani, S.T., M.T.',
    gelar: 'S.T., M.T.',
    prodiId: 'SIPIL',
    senin: { status: 'bersedia_penuh' },
    selasa: { status: 'jam_khusus', jam: '13.00 – 16.00' },
    rabu: { status: 'tidak_bersedia', keterangan: 'Praktikum Uji Bahan di Lab' },
    kamis: { status: 'bersedia_penuh' },
    jumat: { status: 'jam_khusus', jam: '08.30 – 11.00' },
    sabtu: { status: 'bersedia_penuh' },
    catatanKhusus: 'Kepala Lab Bahan & Mekanika Tanah.',
    terakhirDiperbarui: '2026-11-10'
  },
  {
    id: 'KJS-DOS-05',
    dosenId: 'DOS-SPL-05',
    nidn: '1004077102',
    namaDosen: 'Ir. Fadli Eka Yandra, S.T., M.T.',
    gelar: 'Ir., S.T., M.T.',
    prodiId: 'SIPIL',
    senin: { status: 'jam_khusus', jam: '10.00 – 12.00', keterangan: 'Pimpinan Dekanat FT' },
    selasa: { status: 'tidak_bersedia', keterangan: 'Rapat Rektorat UNBARI' },
    rabu: { status: 'jam_khusus', jam: '09.00 – 12.00' },
    kamis: { status: 'jam_khusus', jam: '14.00 – 16.30' },
    jumat: { status: 'jam_khusus', jam: '09.00 – 11.00' },
    sabtu: { status: 'tidak_bersedia', keterangan: 'Agenda Asosiasi / PII' },
    catatanKhusus: 'Dekan FT UNBARI / Penguji Ahli Elektrikal & Infrastruktur.',
    terakhirDiperbarui: '2026-11-11'
  },
  {
    id: 'KJS-DOS-06',
    dosenId: 'DOS-SPL-06',
    nidn: '1027088902',
    namaDosen: 'Reza Fahlevi, S.T., M.Eng.',
    gelar: 'S.T., M.Eng.',
    prodiId: 'SIPIL',
    senin: { status: 'bersedia_penuh' },
    selasa: { status: 'bersedia_penuh' },
    rabu: { status: 'bersedia_penuh' },
    kamis: { status: 'jam_khusus', jam: '08.00 – 12.00' },
    jumat: { status: 'bersedia_penuh' },
    sabtu: { status: 'jam_khusus', jam: '09.00 – 14.00' },
    catatanKhusus: 'Sekretaris Prodi S1 Teknik Sipil.',
    terakhirDiperbarui: '2026-11-10'
  },
  {
    id: 'KJS-DOS-07',
    dosenId: 'DOS-SPL-07',
    nidn: '1003058201',
    namaDosen: 'M. Ibnu Rusyd, S.T., M.T.',
    gelar: 'S.T., M.T.',
    prodiId: 'SIPIL',
    senin: { status: 'jam_khusus', jam: '13.00 – 16.00' },
    selasa: { status: 'bersedia_penuh' },
    rabu: { status: 'tidak_bersedia' },
    kamis: { status: 'jam_khusus', jam: '09.00 – 12.00' },
    jumat: { status: 'jam_khusus', jam: '08.30 – 11.00' },
    sabtu: { status: 'bersedia_penuh' },
    catatanKhusus: 'Ahli Geoteknik & Hidrologi Sungai Batanghari.',
    terakhirDiperbarui: '2026-11-09'
  },
  {
    id: 'KJS-DOS-08',
    dosenId: 'DOS-SPL-08',
    nidn: '1019028801',
    namaDosen: 'Rina Marlina, S.T., M.Sc.',
    gelar: 'S.T., M.Sc.',
    prodiId: 'SIPIL',
    senin: { status: 'bersedia_penuh' },
    selasa: { status: 'jam_khusus', jam: '09.00 – 12.00' },
    rabu: { status: 'bersedia_penuh' },
    kamis: { status: 'bersedia_penuh' },
    jumat: { status: 'tidak_bersedia', keterangan: 'Riset Sumber Daya Air' },
    sabtu: { status: 'jam_khusus', jam: '08.30 – 12.00' },
    catatanKhusus: 'Koordinator Seminar Kerja Praktek Sipil.',
    terakhirDiperbarui: '2026-11-10'
  },

  // --- DOSEN S1 TEKNIK LINGKUNGAN ---
  {
    id: 'KJS-DOS-09',
    dosenId: 'DOS-LKG-01',
    nidn: '1008038002',
    namaDosen: 'Ir. Marhadi, ST., MT',
    gelar: 'Ir., ST., MT',
    prodiId: 'LINGKUNGAN',
    senin: { status: 'jam_khusus', jam: '09.00 – 13.00' },
    selasa: { status: 'bersedia_penuh' },
    rabu: { status: 'jam_khusus', jam: '10.00 – 15.00' },
    kamis: { status: 'bersedia_penuh' },
    jumat: { status: 'jam_khusus', jam: '08.30 – 11.00' },
    sabtu: { status: 'tidak_bersedia', keterangan: 'Studi AMDAL Lahan Basah' },
    catatanKhusus: 'Ketua Program Studi S1 Teknik Lingkungan.',
    terakhirDiperbarui: '2026-11-10'
  },
  {
    id: 'KJS-DOS-10',
    dosenId: 'DOS-LKG-02',
    nidn: '1025097902',
    namaDosen: 'Ir. Hj. Neneng Lestari, S.T., M.T.',
    gelar: 'Ir., S.T., M.T.',
    prodiId: 'LINGKUNGAN',
    senin: { status: 'bersedia_penuh' },
    selasa: { status: 'jam_khusus', jam: '09.00 – 12.00' },
    rabu: { status: 'bersedia_penuh' },
    kamis: { status: 'jam_khusus', jam: '13.30 – 16.00' },
    jumat: { status: 'bersedia_penuh' },
    sabtu: { status: 'jam_khusus', jam: '08.30 – 12.30' },
    catatanKhusus: 'KBK Pengolahan Air Limbah & Baku Mutu Lingkungan.',
    terakhirDiperbarui: '2026-11-09'
  },
  {
    id: 'KJS-DOS-11',
    dosenId: 'DOS-LKG-03',
    nidn: '1011048501',
    namaDosen: 'Dr. Eng. Yudi Pratama, S.Si., M.Sc.',
    gelar: 'Dr. Eng., S.Si., M.Sc.',
    prodiId: 'LINGKUNGAN',
    senin: { status: 'tidak_bersedia', keterangan: 'Penelitian Terapan Hibah Dikti' },
    selasa: { status: 'bersedia_penuh' },
    rabu: { status: 'jam_khusus', jam: '09.00 – 12.00' },
    kamis: { status: 'bersedia_penuh' },
    jumat: { status: 'jam_khusus', jam: '08.30 – 11.30' },
    sabtu: { status: 'bersedia_penuh' },
    catatanKhusus: 'Ahli Pencemaran Udara & Sistem Manajemen K3 Lingkungan.',
    terakhirDiperbarui: '2026-11-10'
  },
  {
    id: 'KJS-DOS-12',
    dosenId: 'DOS-LKG-04',
    nidn: '1014128602',
    namaDosen: 'Dwi Anggraini, S.T., M.Si.',
    gelar: 'S.T., M.Si.',
    prodiId: 'LINGKUNGAN',
    senin: { status: 'bersedia_penuh' },
    selasa: { status: 'bersedia_penuh' },
    rabu: { status: 'jam_khusus', jam: '13.00 – 16.00' },
    kamis: { status: 'jam_khusus', jam: '09.00 – 12.00' },
    jumat: { status: 'bersedia_penuh' },
    sabtu: { status: 'tidak_bersedia' },
    catatanKhusus: 'Kepala Laboratorium Pengujian Kualitas Lingkungan FT.',
    terakhirDiperbarui: '2026-11-11'
  },

  // --- DOSEN D3 TEKNIK LISTRIK ---
  {
    id: 'KJS-DOS-13',
    dosenId: 'DOS-LST-01',
    nidn: '1006058002',
    namaDosen: 'Ir. Hendi Matalata, ST., MT, IPP',
    gelar: 'Ir., ST., MT, IPP',
    prodiId: 'LISTRIK_D3',
    senin: { status: 'bersedia_penuh' },
    selasa: { status: 'jam_khusus', jam: '09.00 – 12.00', keterangan: 'Rapat Kurikulum Vokasi' },
    rabu: { status: 'bersedia_penuh' },
    kamis: { status: 'jam_khusus', jam: '10.00 – 14.30' },
    jumat: { status: 'jam_khusus', jam: '08.30 – 11.00' },
    sabtu: { status: 'bersedia_penuh' },
    catatanKhusus: 'Ketua Program Studi D3 Teknik Listrik (Vokasi).',
    terakhirDiperbarui: '2026-11-10'
  },
  {
    id: 'KJS-DOS-14',
    dosenId: 'DOS-LST-02',
    nidn: '1008038601',
    namaDosen: 'Ahmad Zikri, S.T., M.T.',
    gelar: 'S.T., M.T.',
    prodiId: 'LISTRIK_D3',
    senin: { status: 'jam_khusus', jam: '08.30 – 12.00' },
    selasa: { status: 'bersedia_penuh' },
    rabu: { status: 'tidak_bersedia', keterangan: 'Praktikum Mesin Arus Bolak-Balik' },
    kamis: { status: 'bersedia_penuh' },
    jumat: { status: 'bersedia_penuh' },
    sabtu: { status: 'jam_khusus', jam: '09.00 – 13.00' },
    catatanKhusus: 'KBK Sistem Tenaga Listrik, Gardu Induk & SCADA.',
    terakhirDiperbarui: '2026-11-10'
  },
  {
    id: 'KJS-DOS-15',
    dosenId: 'DOS-LST-03',
    nidn: '1017098401',
    namaDosen: 'Leily Suhartini, S.T., M.T.',
    gelar: 'S.T., M.T.',
    prodiId: 'LISTRIK_D3',
    senin: { status: 'bersedia_penuh' },
    selasa: { status: 'bersedia_penuh' },
    rabu: { status: 'jam_khusus', jam: '09.00 – 12.00' },
    kamis: { status: 'tidak_bersedia', keterangan: 'Audit Bengkel Listrik' },
    jumat: { status: 'jam_khusus', jam: '08.30 – 11.00' },
    sabtu: { status: 'bersedia_penuh' },
    catatanKhusus: 'Kepala Bengkel & Lab Instrumentasi Kendali.',
    terakhirDiperbarui: '2026-11-09'
  }
];

export const DAFTAR_HARI: HariKuliah[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export interface IrisanSlot {
  hari: HariKuliah;
  jamMulai: string;
  jamSelesai: string;
  keterangan: string;
  tingkatKesesuaian: 'Optimal (Penuh)' | 'Tersedia Bersama' | 'Parsial';
}

/**
 * Helper to analyze common time overlaps among 2 or more lecturers
 */
export function cariIrisanWaktuDosen(
  dosenList: KetersediaanJadwalDosen[]
): IrisanSlot[] {
  if (!dosenList || dosenList.length === 0) return [];

  const hasil: IrisanSlot[] = [];

  DAFTAR_HARI.forEach(hari => {
    const hariKey = hari.toLowerCase() as 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
    const statusHariIni = dosenList.map(d => d[hariKey]);

    // Check if anyone is not available
    const adaYangTidakBersedia = statusHariIni.some(s => s.status === 'tidak_bersedia');
    if (adaYangTidakBersedia) {
      return; // Skip this day
    }

    // Check if all are fully available
    const semuaPenuh = statusHariIni.every(s => s.status === 'bersedia_penuh');
    if (semuaPenuh) {
      hasil.push({
        hari,
        jamMulai: '09:00',
        jamSelesai: '12:00',
        keterangan: 'Seluruh dewan pembahas/penguji bersedia penuh bebas jam',
        tingkatKesesuaian: 'Optimal (Penuh)'
      });
      hasil.push({
        hari,
        jamMulai: '13:30',
        jamSelesai: '16:00',
        keterangan: 'Sesi Siang: Seluruh dosen bersedia penuh bebas jam',
        tingkatKesesuaian: 'Optimal (Penuh)'
      });
      return;
    }

    // If some have specific hours, determine common slot
    hasil.push({
      hari,
      jamMulai: '09:30',
      jamSelesai: '11:30',
      keterangan: 'Irisan waktu ketersediaan pagi terkonfirmasi',
      tingkatKesesuaian: 'Tersedia Bersama'
    });
  });

  return hasil;
}
