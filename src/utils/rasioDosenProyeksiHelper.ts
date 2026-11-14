import { Dosen, Mahasiswa, ProgramStudiInfo } from '../types/index';

export type RasioStatusTier = 'IDEAL' | 'WASPADA' | 'KRITIS';

export interface AngkatanRasioItem {
  angkatan: number;
  labelAngkatan: string;
  semesterBerjalan: number;
  totalTerdaftar: number;
  mahasiswaAktif: number;
  aktifReguler: number;
  tugasAkhir: number;
  berisiko: number;
  cutiAtauNonAktif: number;
  lulus: number;
  proporsiAktifPersen: number;
  rasioPerDosen: number; // mahasiswaAktif / effectiveDtps
  kebutuhanDosenFte: number; // mahasiswaAktif / targetRatio
  statusKontribusi: 'Tinggi' | 'Moderat' | 'Rendah';
}

export interface TahunProyeksiDosenItem {
  tahun: number;
  label: string;
  isBaseline: boolean;
  proyeksiIntakeBaru: number;
  estimasiLulusKeluar: number;
  proyeksiMahasiswaAktif: number;
  dtpsTersediaEfektif: number;
  kapasitasIdealMahasiswa: number; // dtpsTersediaEfektif * targetRatio
  rasioProyeksi: number; // proyeksiMahasiswaAktif / dtpsTersediaEfektif
  kebutuhanTotalDtps: number; // Math.ceil(proyeksiMahasiswaAktif / targetRatio)
  kebutuhanTambahDosen: number; // Math.max(0, kebutuhanTotalDtps - dtpsTersediaEfektif)
  statusRasio: RasioStatusTier;
  statusLabel: string;
}

export interface KeahlianGapItem {
  bidangKeahlian: string;
  jumlahDtpsSaatIni: number;
  prioritasRekrutmen: 'Prioritas Tinggi' | 'Stabil' | 'Perlu Penguatan';
}

export interface ProyeksiRasioDosenParams {
  prodi: ProgramStudiInfo;
  mahasiswaList: Mahasiswa[];
  dosenList: Dosen[];
  targetRasioMax?: number; // e.g. 20 for 1:20 (LAM-Teknik Unggul Teknik)
  pertumbuhanIntakePersen?: number; // -10 .. +30
  estimasiKelulusanPersen?: number; // % of senior cohorts graduating each year (60..95)
  dosenPensiunAtauStudiS3?: number; // 0 .. 4
  rencanaRekrutmenDosen?: number; // 0 .. 10
  includeDosenLintasMku?: boolean; // default false -> strict DTPS homebase
  basisDataMahasiswa?: 'AUTO' | 'DATABASE' | 'PDDIKTI_SCALE';
}

export interface ProyeksiRasioDosenReport {
  prodiId: ProgramStudiInfo['id'];
  prodiNama: string;
  jenjang: 'S1' | 'D3';
  targetRasioMax: number;
  effectiveDataBasis: 'DATABASE' | 'PDDIKTI_SCALE';
  rawMahasiswaAktifDatabase: number;
  totalMahasiswaDatabase: number;
  totalMahasiswaAktif: number;
  totalDtpsHomebase: number;
  totalDosenLintasMku: number;
  dosenEfektifDipakai: number;
  rasioAktual: number; // e.g. 25.8 -> "1 : 25.8"
  rasioStatus: RasioStatusTier;
  rasioStatusLabel: string;
  kebutuhanDosenSaatIni: number;
  defisitDosenSaatIni: number;
  angkatanItems: AngkatanRasioItem[];
  dominantAngkatan: AngkatanRasioItem | null;
  proyeksiTahunan: TahunProyeksiDosenItem[]; // 2026 baseline + 2027..2030
  tahunPemicuDefisit: number | null;
  puncakKebutuhanTambahDosen: number;
  puncakMahasiswaProyeksi: number;
  rasioAkhirProyeksi2030: number;
  estimasiSkorK4Skala4: number;
  rekomendasiStrategis: Array<{
    prioritas: 'Tinggi' | 'Sedang' | 'Pertahankan';
    judul: string;
    detail: string;
    targetWaktu: string;
  }>;
  keahlianDistribution: KeahlianGapItem[];
}

const REFERENCE_CURRENT_YEAR = 2026;

const NON_ENGINEERING_MKU_KEYWORDS = [
  'dosen tamu',
  'agama',
  'pancasila',
  'hukum',
  'humaniora',
  'bahasa',
  'sosial',
  'kewarganegaraan'
];

export function isDosenTetapProdiHomebase(dosen: Dosen): boolean {
  // Core homebase DTPS codes from institutional registry
  if (
    /^DOS-SPL-(0[1-9]|1[0-2])$/.test(dosen.id) ||
    /^DOS-LKG-0[1-8]$/.test(dosen.id) ||
    /^DOS-LST-0[1-5]$/.test(dosen.id)
  ) {
    return true;
  }

  // Known cross-prodi / MKU / guest lecturer IDs in schedule datasets
  if (/^DOS-LKG-(09|1[0-7])$/.test(dosen.id) || /^DOS-LST-(0[6-9]|10)$/.test(dosen.id)) {
    return false;
  }

  // Any newly added lecturer by user in DataDosenView is treated as DTPS unless labeled MKU/Tamu
  const combined = `${dosen.namaLengkap} ${dosen.keahlian} ${dosen.pendidikanTerakhir || ''}`.toLowerCase();
  return !NON_ENGINEERING_MKU_KEYWORDS.some(kw => combined.includes(kw));
}

export function isMahasiswaAktifStatus(status: Mahasiswa['status']): boolean {
  return status === 'Aktif' || status === 'Tugas Akhir' || status === 'Berisiko';
}

function classifyRasioTier(rasio: number, targetRasioMax: number, jenjang: 'S1' | 'D3'): RasioStatusTier {
  const warningCeiling = Math.max(targetRasioMax, jenjang === 'D3' ? 25 : 28);
  if (rasio <= targetRasioMax) return 'IDEAL';
  if (rasio <= warningCeiling) return 'WASPADA';
  return 'KRITIS';
}

function getRasioStatusLabel(tier: RasioStatusTier, rasio: number, targetRasioMax: number): string {
  if (tier === 'IDEAL') {
    return `Memenuhi Standar (≤ 1:${targetRasioMax})`;
  }
  if (tier === 'WASPADA') {
    return `Mendekati Batas (1:${rasio.toFixed(1)})`;
  }
  return `Overload Rasio (> Batas Aman)`;
}

export function buildRasioDosenProyeksiReport(
  params: ProyeksiRasioDosenParams
): ProyeksiRasioDosenReport {
  const {
    prodi,
    mahasiswaList,
    dosenList,
    targetRasioMax = 20,
    pertumbuhanIntakePersen = 8,
    estimasiKelulusanPersen = 82,
    dosenPensiunAtauStudiS3 = 1,
    rencanaRekrutmenDosen = 0,
    includeDosenLintasMku = false,
    basisDataMahasiswa = 'AUTO'
  } = params;

  const prodiMhs = mahasiswaList.filter(m => m.prodiId === prodi.id);
  const prodiDosenAll = dosenList.filter(d => d.prodiId === prodi.id);
  const dtpsList = prodiDosenAll.filter(isDosenTetapProdiHomebase);
  const lintasMkuList = prodiDosenAll.filter(d => !isDosenTetapProdiHomebase(d));

  const totalDtpsHomebase = dtpsList.length > 0 ? dtpsList.length : prodi.totalDosen;
  const totalDosenLintasMku = lintasMkuList.length;
  const dosenEfektifDipakai = Math.max(
    1,
    includeDosenLintasMku ? totalDtpsHomebase + totalDosenLintasMku : totalDtpsHomebase
  );

  // Group mahasiswa by angkatan
  const angkatanMap = new Map<number, Mahasiswa[]>();
  prodiMhs.forEach(m => {
    const list = angkatanMap.get(m.angkatan) || [];
    list.push(m);
    angkatanMap.set(m.angkatan, list);
  });

  const sortedAngkatanKeys = Array.from(angkatanMap.keys()).sort((a, b) => a - b);

  const rawMahasiswaAktifDatabase = prodiMhs.filter(m => isMahasiswaAktifStatus(m.status)).length;
  const totalMahasiswaDatabase = prodiMhs.length;

  const usePddiktiScale =
    basisDataMahasiswa === 'PDDIKTI_SCALE' ||
    (basisDataMahasiswa === 'AUTO' &&
      rawMahasiswaAktifDatabase > 0 &&
      rawMahasiswaAktifDatabase < prodi.totalMahasiswa * 0.45);

  const effectiveDataBasis: 'DATABASE' | 'PDDIKTI_SCALE' = usePddiktiScale
    ? 'PDDIKTI_SCALE'
    : 'DATABASE';

  const activeScaleFactor =
    usePddiktiScale && rawMahasiswaAktifDatabase > 0
      ? prodi.totalMahasiswa / rawMahasiswaAktifDatabase
      : 1;

  const totalMahasiswaAktif = usePddiktiScale
    ? prodi.totalMahasiswa
    : rawMahasiswaAktifDatabase;

  const rawItems = sortedAngkatanKeys.map(angkatan => {
    const rows = angkatanMap.get(angkatan) || [];
    const rawAktifReg = rows.filter(r => r.status === 'Aktif').length;
    const rawTa = rows.filter(r => r.status === 'Tugas Akhir').length;
    const rawRisiko = rows.filter(r => r.status === 'Berisiko').length;
    const rawAktifTotal = rawAktifReg + rawTa + rawRisiko;

    const aktifReguler = usePddiktiScale
      ? Math.round(rawAktifReg * activeScaleFactor)
      : rawAktifReg;
    const tugasAkhir = usePddiktiScale
      ? Math.round(rawTa * activeScaleFactor)
      : rawTa;
    const berisiko = usePddiktiScale
      ? Math.round(rawRisiko * activeScaleFactor)
      : rawRisiko;
    const mahasiswaAktif = aktifReguler + tugasAkhir + berisiko;

    return {
      angkatan,
      rows,
      rawAktifTotal,
      aktifReguler,
      tugasAkhir,
      berisiko,
      mahasiswaAktif
    };
  });

  // Reconcile rounding remainder into newest active cohort if scaled
  if (usePddiktiScale && rawItems.length > 0) {
    const scaledSum = rawItems.reduce((s, r) => s + r.mahasiswaAktif, 0);
    const diff = totalMahasiswaAktif - scaledSum;
    const targetIdx = rawItems.length - 1;
    if (diff !== 0 && rawItems[targetIdx]) {
      rawItems[targetIdx].aktifReguler = Math.max(0, rawItems[targetIdx].aktifReguler + diff);
      rawItems[targetIdx].mahasiswaAktif =
        rawItems[targetIdx].aktifReguler +
        rawItems[targetIdx].tugasAkhir +
        rawItems[targetIdx].berisiko;
    }
  }

  const angkatanItems: AngkatanRasioItem[] = rawItems.map(entry => {
    const { angkatan, rows, aktifReguler, tugasAkhir, berisiko, mahasiswaAktif } = entry;
    const lulus = rows.filter(r => r.status === 'Lulus').length;
    const cutiAtauNonAktif = rows.filter(
      r => r.status === 'Non-Aktif' || r.status === 'Cuti' || r.status === 'Pindah'
    ).length;

    const tahunStudi = Math.max(1, REFERENCE_CURRENT_YEAR - angkatan + 1);
    const semesterBerjalan = Math.min(prodi.jenjang === 'D3' ? 6 : 14, tahunStudi * 2 - 1);
    const rasioPerDosen = Math.round((mahasiswaAktif / dosenEfektifDipakai) * 10) / 10;
    const kebutuhanDosenFte = Math.round((mahasiswaAktif / targetRasioMax) * 10) / 10;
    const proporsiAktifPersen =
      totalMahasiswaAktif > 0
        ? Math.round((mahasiswaAktif / totalMahasiswaAktif) * 1000) / 10
        : 0;

    let statusKontribusi: AngkatanRasioItem['statusKontribusi'] = 'Rendah';
    if (proporsiAktifPersen >= 20 || rasioPerDosen >= 4) {
      statusKontribusi = 'Tinggi';
    } else if (proporsiAktifPersen >= 10 || rasioPerDosen >= 2) {
      statusKontribusi = 'Moderat';
    }

    return {
      angkatan,
      labelAngkatan: `Angkatan ${angkatan}`,
      semesterBerjalan,
      totalTerdaftar: Math.max(rows.length, mahasiswaAktif + lulus + cutiAtauNonAktif),
      mahasiswaAktif,
      aktifReguler,
      tugasAkhir,
      berisiko,
      cutiAtauNonAktif,
      lulus,
      proporsiAktifPersen,
      rasioPerDosen,
      kebutuhanDosenFte,
      statusKontribusi
    };
  });

  const activeCohorts = angkatanItems.filter(a => a.mahasiswaAktif > 0);
  const dominantAngkatan =
    activeCohorts.length > 0
      ? [...activeCohorts].sort((a, b) => b.mahasiswaAktif - a.mahasiswaAktif)[0]
      : null;

  const rasioAktual = Math.round((totalMahasiswaAktif / dosenEfektifDipakai) * 10) / 10;
  const rasioStatus = classifyRasioTier(rasioAktual, targetRasioMax, prodi.jenjang);
  const rasioStatusLabel = getRasioStatusLabel(rasioStatus, rasioAktual, targetRasioMax);
  const kebutuhanDosenSaatIni = Math.ceil(totalMahasiswaAktif / targetRasioMax);
  const defisitDosenSaatIni = Math.max(0, kebutuhanDosenSaatIni - dosenEfektifDipakai);

  // Determine recent intake baseline from last 3 cohorts (2024-2026) with active students
  const recentIntakeCohorts = angkatanItems.filter(a => a.angkatan >= 2024 && a.angkatan <= 2026);
  const avgRecentIntake =
    recentIntakeCohorts.length > 0
      ? Math.round(
          recentIntakeCohorts.reduce((acc, item) => acc + Math.max(item.mahasiswaAktif, 0), 0) /
            recentIntakeCohorts.length
        )
      : prodi.jenjang === 'D3'
      ? 12
      : 35;

  // Cohort simulation map (yearOfEntry -> active count) for 2026..2030 projection
  const cohortState = new Map<number, number>();
  angkatanItems.forEach(item => {
    if (item.mahasiswaAktif > 0) {
      cohortState.set(item.angkatan, item.mahasiswaAktif);
    }
  });

  const gradDurationYears = prodi.jenjang === 'D3' ? 3 : 4;
  const gradRate = Math.max(0.4, Math.min(0.98, estimasiKelulusanPersen / 100));
  const intakeGrowthFactor = 1 + pertumbuhanIntakePersen / 100;

  const proyeksiTahunan: TahunProyeksiDosenItem[] = [
    {
      tahun: REFERENCE_CURRENT_YEAR,
      label: `${REFERENCE_CURRENT_YEAR} (Aktual)`,
      isBaseline: true,
      proyeksiIntakeBaru:
        angkatanItems.find(a => a.angkatan === REFERENCE_CURRENT_YEAR)?.mahasiswaAktif ||
        avgRecentIntake,
      estimasiLulusKeluar: angkatanItems.reduce((sum, a) => sum + a.lulus, 0),
      proyeksiMahasiswaAktif: totalMahasiswaAktif,
      dtpsTersediaEfektif: dosenEfektifDipakai,
      kapasitasIdealMahasiswa: dosenEfektifDipakai * targetRasioMax,
      rasioProyeksi: rasioAktual,
      kebutuhanTotalDtps: kebutuhanDosenSaatIni,
      kebutuhanTambahDosen: defisitDosenSaatIni,
      statusRasio: rasioStatus,
      statusLabel: rasioStatusLabel
    }
  ];

  let prevIntake = Math.max(
    6,
    angkatanItems.find(a => a.angkatan === REFERENCE_CURRENT_YEAR)?.mahasiswaAktif || avgRecentIntake
  );

  for (let offset = 1; offset <= 4; offset++) {
    const year = REFERENCE_CURRENT_YEAR + offset;
    const nextIntake = Math.max(4, Math.round(prevIntake * intakeGrowthFactor));
    prevIntake = nextIntake;

    let graduatingOut = 0;

    // Step existing cohorts forward by 1 academic year
    const updatedCohorts = new Map<number, number>();
    cohortState.forEach((count, entryYear) => {
      if (count <= 0) return;
      const studyYear = year - entryYear;
      if (studyYear < gradDurationYears) {
        // 96% retention on early/mid years
        const retained = Math.round(count * 0.96);
        updatedCohorts.set(entryYear, retained);
      } else if (studyYear === gradDurationYears) {
        // On-time graduation wave
        const graduated = Math.round(count * gradRate);
        graduatingOut += graduated;
        const remaining = Math.max(0, count - graduated);
        if (remaining > 0) updatedCohorts.set(entryYear, remaining);
      } else if (studyYear === gradDurationYears + 1) {
        // Second-wave graduation (semester 9-10 / 7-8)
        const graduated = Math.round(count * 0.78);
        graduatingOut += graduated;
        const remaining = Math.max(0, count - graduated);
        if (remaining > 0) updatedCohorts.set(entryYear, remaining);
      } else {
        // Senior tail exits/graduates
        graduatingOut += count;
      }
    });

    updatedCohorts.set(year, nextIntake);
    cohortState.clear();
    updatedCohorts.forEach((v, k) => cohortState.set(k, v));

    const projectedActive = Array.from(cohortState.values()).reduce((sum, n) => sum + n, 0);

    // Phase lecturer attrition (pensiun/studi lanjut S3) & phased recruitment across 2027-2030
    const phasedAttrition = Math.round((dosenPensiunAtauStudiS3 * offset) / 4);
    const phasedRecruitment = Math.round((rencanaRekrutmenDosen * offset) / 4);
    const dtpsEffectiveYear = Math.max(1, dosenEfektifDipakai - phasedAttrition + phasedRecruitment);

    const rasioYear = Math.round((projectedActive / dtpsEffectiveYear) * 10) / 10;
    const neededTotalYear = Math.ceil(projectedActive / targetRasioMax);
    const additionalNeededYear = Math.max(0, neededTotalYear - dtpsEffectiveYear);
    const tierYear = classifyRasioTier(rasioYear, targetRasioMax, prodi.jenjang);

    proyeksiTahunan.push({
      tahun: year,
      label: `${year}*`,
      isBaseline: false,
      proyeksiIntakeBaru: nextIntake,
      estimasiLulusKeluar: graduatingOut,
      proyeksiMahasiswaAktif: projectedActive,
      dtpsTersediaEfektif: dtpsEffectiveYear,
      kapasitasIdealMahasiswa: dtpsEffectiveYear * targetRasioMax,
      rasioProyeksi: rasioYear,
      kebutuhanTotalDtps: neededTotalYear,
      kebutuhanTambahDosen: additionalNeededYear,
      statusRasio: tierYear,
      statusLabel: getRasioStatusLabel(tierYear, rasioYear, targetRasioMax)
    });
  }

  const firstDeficitYearItem = proyeksiTahunan.find(p => p.kebutuhanTambahDosen > 0) || null;
  const puncakKebutuhanTambahDosen = Math.max(
    ...proyeksiTahunan.map(p => p.kebutuhanTambahDosen),
    0
  );
  const puncakMahasiswaProyeksi = Math.max(
    ...proyeksiTahunan.map(p => p.proyeksiMahasiswaAktif),
    totalMahasiswaAktif
  );
  const lastProjection = proyeksiTahunan[proyeksiTahunan.length - 1];
  const rasioAkhirProyeksi2030 = lastProjection ? lastProjection.rasioProyeksi : rasioAktual;

  // Estimate LAM-Teknik Criterion 4 (SDM) Score out of 4.00 based on ratio compliance
  let estimasiSkorK4Skala4 = 3.85;
  if (rasioAkhirProyeksi2030 > 32) {
    estimasiSkorK4Skala4 = 2.85;
  } else if (rasioAkhirProyeksi2030 > targetRasioMax + 6) {
    estimasiSkorK4Skala4 = 3.25;
  } else if (rasioAkhirProyeksi2030 > targetRasioMax) {
    estimasiSkorK4Skala4 = 3.55;
  } else if (rasioAkhirProyeksi2030 <= 18) {
    estimasiSkorK4Skala4 = 3.92;
  }

  // Group keahlian across DTPS
  const keahlianCount = new Map<string, number>();
  dtpsList.forEach(d => {
    const key = d.keahlian || 'Umum Keteknikan';
    keahlianCount.set(key, (keahlianCount.get(key) || 0) + 1);
  });

  const keahlianDistribution: KeahlianGapItem[] = Array.from(keahlianCount.entries())
    .map(([bidangKeahlian, jumlahDtpsSaatIni]) => ({
      bidangKeahlian,
      jumlahDtpsSaatIni,
      prioritasRekrutmen:
        jumlahDtpsSaatIni <= 1
          ? ('Prioritas Tinggi' as const)
          : jumlahDtpsSaatIni === 2
          ? ('Perlu Penguatan' as const)
          : ('Stabil' as const)
    }))
    .sort((a, b) => a.jumlahDtpsSaatIni - b.jumlahDtpsSaatIni);

  // Strategic recommendations
  const rekomendasiStrategis: ProyeksiRasioDosenReport['rekomendasiStrategis'] = [];

  if (defisitDosenSaatIni > 0) {
    rekomendasiStrategis.push({
      prioritas: 'Tinggi',
      judul: `Rekrutmen Segera ${defisitDosenSaatIni} Dosen Tetap Prodi (DTPS) Baru`,
      detail: `Rasio saat ini 1:${rasioAktual.toFixed(1)} (${totalMahasiswaAktif} mahasiswa aktif berbanding ${dosenEfektifDipakai} dosen) telah melampaui ambang target 1:${targetRasioMax}. Penambahan ${defisitDosenSaatIni} DTPS segera mengembalikan rasio ke zona ideal Kriteria 4 LAM-Teknik.`,
      targetWaktu: 'Semester Ganjil 2026/2027'
    });
  }

  if (puncakKebutuhanTambahDosen > defisitDosenSaatIni) {
    const netAddFuture = puncakKebutuhanTambahDosen - defisitDosenSaatIni;
    rekomendasiStrategis.push({
      prioritas: 'Tinggi',
      judul: `Roadmap Penambahan ${puncakKebutuhanTambahDosen} DTPS Bertahap (Hingga 2030)`,
      detail: `Dengan asumsi pertumbuhan intake +${pertumbuhanIntakePersen}%/tahun serta antisipasi ${dosenPensiunAtauStudiS3} dosen pensiun/tugas belajar S3, total mahasiswa aktif diproyeksikan mencapai ${puncakMahasiswaProyeksi} mahasiswa sehingga memerlukan tambahan total ${puncakKebutuhanTambahDosen} DTPS (+${netAddFuture} di atas kebutuhan awal).`,
      targetWaktu: firstDeficitYearItem ? `Mulai ${firstDeficitYearItem.tahun}` : '2027 – 2030'
    });
  } else {
    rekomendasiStrategis.push({
      prioritas: 'Pertahankan',
      judul: `Kapasitas Rasio DTPS Aman Hingga Proyeksi 2030 (1:${rasioAkhirProyeksi2030.toFixed(1)})`,
      detail: `Dengan jumlah DTPS aktif (${dosenEfektifDipakai} dosen) dan skenario rekrutmen (+${rencanaRekrutmenDosen}), daya tampung ideal mencapai ${lastProjection?.kapasitasIdealMahasiswa || 0} mahasiswa dibandingkan proyeksi ${lastProjection?.proyeksiMahasiswaAktif || 0} mahasiswa pada 2030.`,
      targetWaktu: 'Monitoring Tahunan'
    });
  }

  if (dominantAngkatan) {
    rekomendasiStrategis.push({
      prioritas: 'Sedang',
      judul: `Optimalisasi Bimbingan Akademik & TA pada ${dominantAngkatan.labelAngkatan}`,
      detail: `${dominantAngkatan.labelAngkatan} (Semester ${dominantAngkatan.semesterBerjalan}) menyumbang beban terbesar yaitu ${dominantAngkatan.mahasiswaAktif} mahasiswa aktif (${dominantAngkatan.proporsiAktifPersen}% total prodi, ekuivalen rasio ${dominantAngkatan.rasioPerDosen.toFixed(1)} mhs/dosen). Prioritaskan pemerataan Dosen PA dan pembimbing skripsi.`,
      targetWaktu: 'Semester Berjalan'
    });
  }

  const thinKeahlian = keahlianDistribution.filter(k => k.jumlahDtpsSaatIni <= 1);
  if (thinKeahlian.length > 0) {
    rekomendasiStrategis.push({
      prioritas: 'Sedang',
      judul: 'Formasi Spesialisasi Keahlian Calon DTPS Baru',
      detail: `Bidang keahlian dengan cakupan dosen minimal saat ini meliputi ${thinKeahlian
        .slice(0, 3)
        .map(k => k.bidangKeahlian)
        .join(', ')}. Prioritaskan rekrutmen dosen berijazah S2/S3 linear pada rumpun keahlian tersebut.`,
      targetWaktu: 'Rekrutmen Tahun Akademik Berikutnya'
    });
  }

  return {
    prodiId: prodi.id,
    prodiNama: prodi.nama,
    jenjang: prodi.jenjang,
    targetRasioMax,
    effectiveDataBasis,
    rawMahasiswaAktifDatabase,
    totalMahasiswaDatabase,
    totalMahasiswaAktif,
    totalDtpsHomebase,
    totalDosenLintasMku,
    dosenEfektifDipakai,
    rasioAktual,
    rasioStatus,
    rasioStatusLabel,
    kebutuhanDosenSaatIni,
    defisitDosenSaatIni,
    angkatanItems,
    dominantAngkatan,
    proyeksiTahunan,
    tahunPemicuDefisit: firstDeficitYearItem ? firstDeficitYearItem.tahun : null,
    puncakKebutuhanTambahDosen,
    puncakMahasiswaProyeksi,
    rasioAkhirProyeksi2030,
    estimasiSkorK4Skala4,
    rekomendasiStrategis,
    keahlianDistribution
  };
}
