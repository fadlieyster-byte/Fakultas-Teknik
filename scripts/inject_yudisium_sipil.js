import fs from 'fs';

const sipilRecords = JSON.parse(fs.readFileSync('scripts/sipil_yudisium_data.json', 'utf8'));

const lingkunganRecords = [
  {
    id: 'YUD-ENV-001',
    prodiId: 'LINGKUNGAN',
    mahasiswaId: 'MHS-ENV-21001',
    nim: '2100822202005',
    nama: 'FARADILA PUTRI UTAMI',
    jenisKelamin: 'P',
    angkatan: 2021,
    jenjang: 'S1',
    programStudi: 'S1 Teknik Lingkungan',
    ipk: 3.78,
    sksLulus: 144,
    lamaStudi: '3 Tahun 11 Bulan',
    predikat: 'Dengan Pujian (Cum Laude)',
    gelarLulusan: 'S.T.',
    tanggalYudisium: '2026-08-28',
    nomorSkYudisium: '085/SK-DEK/FT-UNBARI/VIII/2026',
    nomorIjazahNasional: '010042026002105',
    nomorSeriIjazah: 'FT-UNBARI-2026-085',
    nomorTranskrip: 'TR-FT/2026/085',
    judulSkripsi: 'Efektivitas Fitoremediasi Tanaman Eceng Gondok terhadap Penurunan Logam Berat Fe dan Mn pada Air Asam Tambang Batubara di Sarolangun',
    dosenPembimbing1: 'Ir. Marhadi, ST., MT',
    dosenPembimbing2: 'Asril, ST., MT',
    statusVerifikasi: 'Disahkan Dekan',
    syaratKelengkapan: {
      bebasPustaka: true,
      bebasLab: true,
      bebasKeuangan: true,
      bebasPlagiarisme: true,
      unggahJurnalRepository: true,
      fotoIjazah: true
    },
    statusWisuda: 'Toga Diambil',
    periodeWisuda: 'Wisuda Ke-56 UNBARI (Oktober 2026)',
    ukuranToga: 'S',
    isLulusanTerbaik: true,
    catatan: 'Lulusan Terbaik S1 Teknik Lingkungan. Artikel jurnal diterima di Jurnal Sains & Teknologi Terakreditasi SINTA 3.'
  },
  {
    id: 'YUD-ENV-002',
    prodiId: 'LINGKUNGAN',
    mahasiswaId: 'MHS-ENV-21002',
    nim: '2100822202012',
    nama: 'DIMAS ARYO PRASETYO',
    jenisKelamin: 'L',
    angkatan: 2021,
    jenjang: 'S1',
    programStudi: 'S1 Teknik Lingkungan',
    ipk: 3.35,
    sksLulus: 144,
    lamaStudi: '4 Tahun 1 Bulan',
    predikat: 'Sangat Memuaskan',
    gelarLulusan: 'S.T.',
    tanggalYudisium: '2026-08-28',
    nomorSkYudisium: '085/SK-DEK/FT-UNBARI/VIII/2026',
    nomorIjazahNasional: '010042026002106',
    nomorSeriIjazah: 'FT-UNBARI-2026-086',
    nomorTranskrip: 'TR-FT/2026/086',
    judulSkripsi: 'Perencanaan Unit Pengolahan Air Limbah Domestik Komunal Berbasis Constructed Wetland di Kelurahan Tahtul Yaman Kota Jambi',
    dosenPembimbing1: 'Ir. Marhadi, ST., MT',
    dosenPembimbing2: 'Fadli Eka Yandra, ST., MT',
    statusVerifikasi: 'Disahkan Dekan',
    syaratKelengkapan: {
      bebasPustaka: true,
      bebasLab: true,
      bebasKeuangan: true,
      bebasPlagiarisme: true,
      unggahJurnalRepository: true,
      fotoIjazah: true
    },
    statusWisuda: 'Terdaftar Wisuda',
    periodeWisuda: 'Wisuda Ke-56 UNBARI (Oktober 2026)',
    ukuranToga: 'L',
    catatan: 'Berkas tuntas, undangan wisuda siap diserahkan.'
  }
];

const listrikRecords = [
  {
    id: 'YUD-LST-001',
    prodiId: 'LISTRIK_D3',
    mahasiswaId: 'MHS-LST-23001',
    nim: '230031551001',
    nama: 'REZKY ADITYA PRATAMA',
    jenisKelamin: 'L',
    angkatan: 2023,
    jenjang: 'D3',
    programStudi: 'D3 Teknik Listrik',
    ipk: 3.86,
    sksLulus: 110,
    lamaStudi: '2 Tahun 11 Bulan',
    predikat: 'Dengan Pujian (Cum Laude)',
    gelarLulusan: 'A.Md.T.',
    tanggalYudisium: '2026-08-28',
    nomorSkYudisium: '085/SK-DEK/FT-UNBARI/VIII/2026',
    nomorIjazahNasional: '010042026003011',
    nomorSeriIjazah: 'FT-UNBARI-2026-091',
    nomorTranskrip: 'TR-FT/2026/091',
    judulSkripsi: 'Rancang Bangun Modul Proteksi Arus Lebih Menggunakan PLC Mitsubishi FX-3U pada Trainer Motor Induksi 3 Fasa',
    dosenPembimbing1: 'Ir. Hendi Matalata, ST., MT, IPP',
    dosenPembimbing2: 'Leily Wustha Johar, ST., MT',
    statusVerifikasi: 'Disahkan Dekan',
    syaratKelengkapan: {
      bebasPustaka: true,
      bebasLab: true,
      bebasKeuangan: true,
      bebasPlagiarisme: true,
      unggahJurnalRepository: true,
      fotoIjazah: true
    },
    statusWisuda: 'Toga Diambil',
    periodeWisuda: 'Wisuda Ke-56 UNBARI (Oktober 2026)',
    ukuranToga: 'M',
    isLulusanTerbaik: true,
    catatan: 'Lulusan Terbaik Program Diploma III Teknik Listrik FT UNBARI.'
  },
  {
    id: 'YUD-LST-002',
    prodiId: 'LISTRIK_D3',
    mahasiswaId: 'MHS-LST-23002',
    nim: '230031551014',
    nama: 'INDAH WAHYUNI',
    jenisKelamin: 'P',
    angkatan: 2023,
    jenjang: 'D3',
    programStudi: 'D3 Teknik Listrik',
    ipk: 3.52,
    sksLulus: 110,
    lamaStudi: '3 Tahun 0 Bulan',
    predikat: 'Dengan Pujian (Cum Laude)',
    gelarLulusan: 'A.Md.T.',
    tanggalYudisium: '2026-08-28',
    nomorSkYudisium: '085/SK-DEK/FT-UNBARI/VIII/2026',
    nomorIjazahNasional: '010042026003012',
    nomorSeriIjazah: 'FT-UNBARI-2026-092',
    nomorTranskrip: 'TR-FT/2026/092',
    judulSkripsi: 'Analisis Harmonisa dan Perbaikan Faktor Daya pada Penyulang Gardu Induk Payo Selincah Jambi',
    dosenPembimbing1: 'Fadli Eka Yandra, ST., MT',
    dosenPembimbing2: 'Ir. Hendi Matalata, ST., MT, IPP',
    statusVerifikasi: 'Disahkan Dekan',
    syaratKelengkapan: {
      bebasPustaka: true,
      bebasLab: true,
      bebasKeuangan: true,
      bebasPlagiarisme: true,
      unggahJurnalRepository: true,
      fotoIjazah: true
    },
    statusWisuda: 'Terdaftar Wisuda',
    periodeWisuda: 'Wisuda Ke-56 UNBARI (Oktober 2026)',
    ukuranToga: 'S',
    catatan: 'Telah diverifikasi Dekan dan Kaprodi D3 Listrik.'
  }
];

const allRecords = [...sipilRecords, ...lingkunganRecords, ...listrikRecords];

const fileContent = `import { YudisiumRecord, PeriodeYudisium, PredikatKelulusan } from '../types/index';

export function tentukanPredikatKelulusan(ipk: number, lamaStudiBulan: number = 46): PredikatKelulusan {
  if (ipk >= 3.51 && lamaStudiBulan <= 48) {
    return 'Dengan Pujian (Cum Laude)';
  } else if (ipk >= 3.01) {
    return 'Sangat Memuaskan';
  } else {
    return 'Memuaskan';
  }
}

export const INITIAL_PERIODE_YUDISIUM: PeriodeYudisium[] = [
  {
    id: 'PER-YUD-2026-1',
    namaPeriode: 'Yudisium Sarjana & Ahli Madya Periode I TA 2026/2027',
    tahunAkademik: '2026/2027',
    semester: 'Ganjil',
    tanggalPelaksanaan: '2026-11-26',
    nomorSkDekan: '112/SK-DEK/FT-UNBARI/XI/2026',
    status: 'Pendaftaran Dibuka',
    kuotaWisuda: 60,
    keterangan: 'Pendaftaran dan verifikasi berkas yudisium dibuka hingga 15 November 2026.'
  },
  {
    id: 'PER-YUD-2025-2',
    namaPeriode: 'Yudisium Sarjana & Ahli Madya Periode II TA 2025/2026',
    tahunAkademik: '2025/2026',
    semester: 'Genap',
    tanggalPelaksanaan: '2026-08-28',
    nomorSkDekan: '085/SK-DEK/FT-UNBARI/VIII/2026',
    status: 'Selesai / Terbit SK',
    kuotaWisuda: 75,
    keterangan: 'SK Yudisium telah ditandatangani Dekan. Siap diproses untuk Wisuda Ke-56 UNBARI.'
  }
];

export const INITIAL_YUDISIUM_RECORDS: YudisiumRecord[] = ${JSON.stringify(allRecords, null, 2)};
`;

fs.writeFileSync('src/data/mockYudisiumData.ts', fileContent, 'utf8');
console.log(`Updated src/data/mockYudisiumData.ts with ${allRecords.length} records (${sipilRecords.length} Sipil, ${lingkunganRecords.length} Lingkungan, ${listrikRecords.length} Listrik).`);
