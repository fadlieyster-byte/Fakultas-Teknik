import fs from 'fs';

const rawLingkungan = [
  { no: 1, nama: "MOH. ALFIAN NUR", nim: "1900825201001", jk: "L", ipk: 2.99, predikat: "Memuaskan" },
  { no: 2, nama: "ROBBY LIAN SAPUTRA JAYA", nim: "1900825201003", jk: "L", ipk: 2.98, predikat: "Memuaskan" },
  { no: 3, nama: "ERLIM APRIANSYAH", nim: "1900825201004", jk: "L", ipk: 2.91, predikat: "Memuaskan" },
  { no: 4, nama: "Ambo Acok", nim: "1900825201021", jk: "L", ipk: 2.88, predikat: "Memuaskan" },
  { no: 5, nama: "AHMAD DANI", nim: "1900825201040", jk: "L", ipk: 3.05, predikat: "Memuaskan" },
  { no: 6, nama: "M. GHALY ABRAR", nim: "1900825201046", jk: "P", ipk: 3.13, predikat: "Sangat Memuaskan" },
  { no: 7, nama: "RACHMAT WIJAYA", nim: "2000825201017", jk: "L", ipk: 3.17, predikat: "Memuaskan" },
  { no: 8, nama: "Gatot Prio Anggoro", nim: "2000825201023", jk: "L", ipk: 3.29, predikat: "Memuaskan" },
  { no: 9, nama: "MUHAMAD BINTANG RAMADHAN", nim: "2000825201039", jk: "L", ipk: 3.10, predikat: "Memuaskan" },
  { no: 10, nama: "SABILA INTAN ARIMBI", nim: "2100825201003", jk: "P", ipk: 3.45, predikat: "Sangat Memuaskan" },
  { no: 11, nama: "MARCHELLO TEGUH PRAKOSO", nim: "2100825201012", jk: "L", ipk: 3.03, predikat: "Sangat Memuaskan" },
  { no: 12, nama: "SYAHRUL FEBRIANSYAH PUTRA", nim: "2100825201014", jk: "L", ipk: 3.27, predikat: "Sangat Memuaskan" },
  { no: 13, nama: "ARIF SUWITO", nim: "2100825201032", jk: "L", ipk: 3.21, predikat: "Sangat Memuaskan" },
  { no: 14, nama: "DESTIARA ADAWIYYAH", nim: "2100825201037", jk: "P", ipk: 3.61, predikat: "Sangat Memuaskan" },
  { no: 15, nama: "MUHAMMAD REZA", nim: "2200825201001", jk: "L", ipk: 3.70, predikat: "Sangat Memuaskan" },
  { no: 16, nama: "JESSY MUTIA", nim: "2200825201002", jk: "P", ipk: 3.42, predikat: "Sangat Memuaskan" },
  { no: 17, nama: "RIYADH AL PRATAMA", nim: "2200825201004", jk: "L", ipk: 3.24, predikat: "Sangat Memuaskan" },
  { no: 18, nama: "DIAN RETNO DWI AGUSTIYAH", nim: "2200825201005", jk: "P", ipk: 3.28, predikat: "Sangat Memuaskan" },
  { no: 19, nama: "NABILA CHAIRUNNISA", nim: "2200825201006", jk: "P", ipk: 3.26, predikat: "Sangat Memuaskan" },
  { no: 20, nama: "DONA EFRIANTI", nim: "2200825201008", jk: "P", ipk: 3.24, predikat: "Sangat Memuaskan" },
  { no: 21, nama: "KEVIN ADITYAWAN", nim: "2200825201013", jk: "L", ipk: 3.13, predikat: "Memuaskan" },
  { no: 22, nama: "FADHILAH SALSABILAH", nim: "2200825201018", jk: "P", ipk: 3.50, predikat: "Sangat Memuaskan" },
  { no: 23, nama: "MAHARANI", nim: "2200825201019", jk: "P", ipk: 3.28, predikat: "Memuaskan" },
  { no: 24, nama: "MUHAMMAD ALFIN ZIKRY", nim: "2200825201020", jk: "L", ipk: 3.11, predikat: "Sangat Memuaskan" },
  { no: 25, nama: "MAILOLA ZILPITA", nim: "2200825201022", jk: "P", ipk: 3.13, predikat: "Sangat Memuaskan" },
  { no: 26, nama: "LILI LESTARI", nim: "2200825201026", jk: "P", ipk: 3.21, predikat: "Sangat Memuaskan" },
  { no: 27, nama: "M. GHIM NASTIAR RIPAR", nim: "2200825201027", jk: "L", ipk: 3.18, predikat: "Sangat Memuaskan" },
  { no: 28, nama: "KARINDA", nim: "2300825201026", jk: "P", ipk: 3.64, predikat: "Sangat Memuaskan" },
  { no: 29, nama: "WAHYU ISRA SUSSENDRA", nim: "2300825201029", jk: "L", ipk: 3.22, predikat: "Sangat Memuaskan" }
];

const envTopics = [
  "Efektivitas Fitoremediasi Tanaman Eceng Gondok terhadap Penurunan Logam Berat Fe dan Mn Air Asam Tambang Batubara",
  "Perencanaan Unit Pengolahan Air Limbah Domestik Komunal Berbasis Constructed Wetland di Kelurahan Tahtul Yaman",
  "Analisis Sebaran Spasial Kualitas Udara Ambien Partikulat PM2.5 di Koridor Transportasi Kota Jambi",
  "Kajian Karakteristik dan Daur Ulang Sampah Plastik Rumah Tangga pada TPA Talang Gulo Kota Jambi",
  "Evaluasi Efisiensi IPAL Industri Kelapa Sawit PT. Bahari Guna dalam Mereduksi Parameter BOD, COD, dan TSS",
  "Perencanaan Sistem Penyaluran Air Buangan Terpusat (Sewerage System) Kawasan Pasar Kota Jambi",
  "Kajian Daya Tampung Beban Pencemaran Sungai Batanghari Menggunakan Pemodelan Kualitas Air QUAL2Kw",
  "Uji Kinerja Koagulan Biji Kelor (Moringa oleifera) dalam Pengolahan Air Keruh Gambut Sungai Batanghari",
  "Analisis Risiko Kesehatan Lingkungan (ARKL) Paparan Gas NO2 dan SO2 pada Pedagang Kaki Lima di Simpang Kawat",
  "Perencanaan Tempat Pengolahan Sampah Reuse-Reduce-Recycle (TPS 3R) di Wilayah Muaro Jambi"
];

const envDosens1 = [
  "Ir. Marhadi, ST., MT",
  "Hadrah, ST., MT",
  "Asril, ST., MT",
  "Ade Lisantoni, ST., MT"
];

const envDosens2 = [
  "Hadrah, ST., MT",
  "Ir. Marhadi, ST., MT",
  "Fadli Eka Yandra, ST., MT",
  "Asril, ST., MT"
];

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const lingkunganYudisiumRecords = rawLingkungan.map((item, idx) => {
  const ang = parseInt(item.nim.slice(0, 2), 10) + 2000;
  const noStr = String(item.no).padStart(3, '0');
  const serialNo = String(200 + item.no);

  let predikatClean = 'Memuaskan';
  if (item.predikat.toLowerCase().includes('pujian')) {
    predikatClean = 'Dengan Pujian (Cum Laude)';
  } else if (item.predikat.toLowerCase().includes('sangat')) {
    predikatClean = 'Sangat Memuaskan';
  }

  let lamaStudi = '4 Tahun 0 Bulan';
  if (ang === 2019) lamaStudi = '5 Tahun 0 Bulan';
  else if (ang === 2020) lamaStudi = '4 Tahun 6 Bulan';
  else if (ang === 2021) lamaStudi = '3 Tahun 10 Bulan';
  else if (ang === 2022) lamaStudi = '3 Tahun 6 Bulan';
  else if (ang === 2023) lamaStudi = '3 Tahun 0 Bulan (Akselerasi)';

  const judulSkripsi = envTopics[idx % envTopics.length];
  const d1 = envDosens1[idx % envDosens1.length];
  const d2 = envDosens2[idx % envDosens2.length];
  const ukuranToga = sizes[idx % sizes.length];

  return {
    id: `YUD-ENV-${noStr}`,
    prodiId: 'LINGKUNGAN',
    mahasiswaId: `MHS-ENV-${item.nim.slice(-5)}`,
    nim: item.nim,
    nama: item.nama,
    jenisKelamin: item.jk,
    angkatan: ang,
    jenjang: 'S1',
    programStudi: 'S1 Teknik Lingkungan',
    ipk: item.ipk,
    sksLulus: 144,
    lamaStudi,
    predikat: predikatClean,
    gelarLulusan: 'S.T.',
    tanggalYudisium: '2026-08-28',
    nomorSkYudisium: '085/SK-DEK/FT-UNBARI/VIII/2026',
    nomorIjazahNasional: `010042026002${serialNo}`,
    nomorSeriIjazah: `FT-UNBARI-2026-${serialNo}`,
    nomorTranskrip: `TR-FT/2026/${serialNo}`,
    judulSkripsi,
    dosenPembimbing1: d1,
    dosenPembimbing2: d2,
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
    ukuranToga,
    isLulusanTerbaik: item.ipk >= 3.61,
    catatan: `Peserta resmi Yudisium S1 Teknik Lingkungan Periode TA 2025/2026 (No. Urut ${item.no}).`
  };
});

// Load current mock yudisium file
const existingSipil = JSON.parse(fs.readFileSync('scripts/sipil_yudisium_data.json', 'utf8'));

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

const allCombined = [...existingSipil, ...lingkunganYudisiumRecords, ...listrikRecords];

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
    kuotaWisuda: 100,
    keterangan: 'SK Yudisium telah ditandatangani Dekan. Siap diproses untuk Wisuda Ke-56 UNBARI.'
  }
];

export const INITIAL_YUDISIUM_RECORDS: YudisiumRecord[] = ${JSON.stringify(allCombined, null, 2)};
`;

fs.writeFileSync('src/data/mockYudisiumData.ts', fileContent, 'utf8');
fs.writeFileSync('scripts/lingkungan_yudisium_data.json', JSON.stringify(lingkunganYudisiumRecords, null, 2), 'utf8');
console.log(`Updated src/data/mockYudisiumData.ts with ${allCombined.length} total records (${existingSipil.length} Sipil, ${lingkunganYudisiumRecords.length} Lingkungan, ${listrikRecords.length} Listrik).`);
