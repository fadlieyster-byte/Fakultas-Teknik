import fs from 'fs';

const cohort2020Students = [
  { no: 18, nama: "MARYATUL KIBTIYAH", nim: "2000822201019", jk: "P", ipk: 3.52, predikat: "Sangat Memuaskan" },
  { no: 19, nama: "ANGGA RIFANI ALAZHAR", nim: "2000822201023", jk: "L", ipk: 3.29, predikat: "Memuaskan" },
  { no: 20, nama: "DWI SUCI NOVITA SARI", nim: "2000822201024", jk: "P", ipk: 3.43, predikat: "Memuaskan" },
  { no: 21, nama: "ULTIA WAHYUNI", nim: "2000822201025", jk: "P", ipk: 2.95, predikat: "Memuaskan" },
  { no: 22, nama: "ELVITA TIFFANY", nim: "2000822201033", jk: "P", ipk: 3.27, predikat: "Memuaskan" },
  { no: 23, nama: "M. DIMAS ARDHANI ALMUNAWAR", nim: "2000822201045", jk: "L", ipk: 3.42, predikat: "Memuaskan" },
  { no: 24, nama: "AFMURI FAHRIAL", nim: "2000822201055", jk: "L", ipk: 3.09, predikat: "Sangat Memuaskan" },
  { no: 25, nama: "DONA ALDINI FITRI", nim: "2000822201063", jk: "P", ipk: 3.20, predikat: "Sangat Memuaskan" },
  { no: 26, nama: "VARUF IQBAL", nim: "2000822201066", jk: "L", ipk: 3.16, predikat: "Memuaskan" },
  { no: 27, nama: "ASLAMIA PARDEDE", nim: "2000822201071", jk: "P", ipk: 3.40, predikat: "Memuaskan" },
  { no: 28, nama: "MUHAMMAD BAGUS SULAIMAN", nim: "2000822201083", jk: "L", ipk: 3.59, predikat: "Memuaskan" },
  { no: 29, nama: "M YUDI RUKIA SAHPUTRA", nim: "2000822201084", jk: "L", ipk: 3.24, predikat: "Memuaskan" },
  { no: 30, nama: "JERY PRATAMA PUTRA", nim: "2000822201091", jk: "L", ipk: 3.08, predikat: "Memuaskan" },
  { no: 31, nama: "KEMAS M HANDA RESDA", nim: "2000822201104", jk: "L", ipk: 3.30, predikat: "Memuaskan" }
];

const dosens = [
  'Ir. Rioni Rizki Aldiansyah, ST., MT, IPM, ASEAN Eng.',
  'Annisaa Dwiretnani, S.T., M.T.',
  'Ir. Moh. Nur Ridwan, M.T.',
  'Ir. Hendra Saputra, ST., MT',
  'Ir. Ahmad Ridwan, ST., MT',
  'Dr. Ir. H. Sudirman, MT'
];

const students = cohort2020Students.map((s, idx) => {
  const nimSuffix = s.nim.slice(-4);
  return {
    id: `MHS-SPL-20${nimSuffix}`,
    nim: s.nim,
    nama: s.nama,
    prodiId: 'SIPIL',
    programStudi: 'S1 Teknik Sipil FT UNBARI',
    jenjang: 'S1',
    angkatan: 2020,
    semester: 12,
    ipk: s.ipk,
    sksLulus: 144,
    sksSemesterIni: 0,
    sksTargetLulus: 144,
    status: 'Lulus',
    dosenPA: dosens[idx % dosens.length],
    email: `${s.nim}@mhs.unbari.ac.id`,
    nomorHp: `0812-2000-${nimSuffix}`,
    kehadiranPersen: 95,
    konsentrasi: idx % 2 === 0 ? 'Rekayasa Struktur' : 'Manajemen Konstruksi',
    jenisKelamin: s.jk,
    jenisKelas: 'Reguler',
    asalSekolah: 'SMA/SMK Provinsi Jambi',
    tahunAkademik: '2020/2021',
    progressTA: 'Lulus Yudisium',
    peringatanSp: 0
  };
});

const tsCode = `import { Mahasiswa } from '../types/index';

export const SIPIL_COHORT_2020: Mahasiswa[] = ${JSON.stringify(students, null, 2)};
`;

fs.writeFileSync('src/data/sipilCohort2020.ts', tsCode, 'utf8');
console.log(`Generated src/data/sipilCohort2020.ts with ${students.length} students.`);
