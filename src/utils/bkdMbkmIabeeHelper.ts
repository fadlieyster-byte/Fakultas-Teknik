import {
  DokumenKerjasama,
  Dosen,
  JadwalKerjaPraktek,
  JadwalKuliah
} from '../types/index';

export type JenisKegiatanMbkm = 'MAGANG' | 'STUDI_INDEPENDEN';

export type StatusBebanIabee =
  | 'MELEBIHI_BATAS_IABEE'
  | 'MENDEKATI_BATAS_IABEE'
  | 'SESUAI_STANDAR_IABEE'
  | 'DI_BAWAH_STANDAR';

export interface MbkmConversionConfig {
  jamPerSksBkd: number; // Standar BKD: 45 jam/semester = 1 SKS
  sksPerMahasiswaMagang: number;
  sksPerMahasiswaStudiIndependen: number;
  sksBonusKoordinatorMitra: number;
  maxIabeeSks: number;
  minStandardSks: number;
  includeBimbinganTaRutin: boolean;
}

export const DEFAULT_MBKM_CONVERSION_CONFIG: MbkmConversionConfig = {
  jamPerSksBkd: 45,
  sksPerMahasiswaMagang: 0.5,
  sksPerMahasiswaStudiIndependen: 0.35,
  sksBonusKoordinatorMitra: 0.5,
  maxIabeeSks: 16,
  minStandardSks: 12,
  includeBimbinganTaRutin: true
};

export interface MbkmDosenActivity {
  id: string;
  dosenId: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  jenis: JenisKegiatanMbkm;
  namaProgram: string;
  mitraInstansi: string;
  jumlahMahasiswa: number;
  jamBimbingan: number; // Total jam bimbingan magang/studi independen per semester
  jamOverride?: number; // Opsional jika input jam bimbingan manual
  sksEkivalenMahasiswa: number;
  sksKonversiDosen: number;
  sumberData: 'KERJASAMA_MBKM' | 'KP_TERKONVERSI' | 'MSIB_PMM' | 'SIMULASI_USER';
  nomorBukti?: string;
  isKoordinatorMitra?: boolean;
  canReassign?: boolean;
}

export interface MbkmRedistributionTransfer {
  activityId: string;
  fromDosenId: string;
  toDosenId: string;
  appliedAt: string;
}

export interface DosenMbkmIabeeMetric {
  dosen: Dosen;
  sksMengajarRutin: number;
  scheduledSks: number;
  sksBimbinganTaRutin: number;
  jumlahMahasiswaMagang: number;
  jumlahMahasiswaStudiIndependen: number;
  jamBimbinganMagang: number;
  jamBimbinganStudiIndependen: number;
  totalJamBimbinganMbkm: number;
  sksMbkmMagang: number;
  sksMbkmStudiIndependen: number;
  sksKoordinatorMbkm: number;
  totalSksMbkm: number;
  totalMengajarPlusMbkm: number;
  totalBebanKerjaIabee: number;
  selisihDariBatasIabee: number; // positive = excess above maxIabeeSks
  persentaseTerhadapBatasIabee: number;
  sisaKapasitasSks: number;
  statusIabee: StatusBebanIabee;
  activities: MbkmDosenActivity[];
  catatanAuditIabee: string;
}

export interface MbkmRedistributionProposal {
  id: string;
  activity: MbkmDosenActivity;
  fromDosen: Dosen;
  toDosen: Dosen;
  sksDipindahkan: number;
  fromBeforeSks: number;
  fromAfterSks: number;
  toBeforeSks: number;
  toAfterSks: number;
  isApplied: boolean;
  reason: string;
}

export interface BkdMbkmIabeeReport {
  config: MbkmConversionConfig;
  metrics: DosenMbkmIabeeMetric[];
  overloadedDosen: DosenMbkmIabeeMetric[];
  nearLimitDosen: DosenMbkmIabeeMetric[];
  compliantDosen: DosenMbkmIabeeMetric[];
  underloadDosen: DosenMbkmIabeeMetric[];
  proposals: MbkmRedistributionProposal[];
  summary: {
    totalDosen: number;
    totalMahasiswaMagang: number;
    totalMahasiswaStudiIndependen: number;
    totalJamBimbinganSeluruhDosen: number;
    totalSksMbkmSeluruhDosen: number;
    avgSksMbkmPerDosen: number;
    avgTotalBebanIabee: number;
    overloadCount: number;
    nearLimitCount: number;
    compliantCount: number;
    underloadCount: number;
    persenKepatuhanIabee: number;
  };
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

function normalizeDosenName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(prof|dr|ir|h|hj|st|s\.t|mt|m\.t|msc|m\.sc|meng|m\.eng|msi|m\.si|skom|s\.kom|ipm|ipp|asean eng)\b/g, '')
    .replace(/[.,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchDosenByName(dosenList: Dosen[], rawName: string, preferredProdi?: string): Dosen | undefined {
  const normTarget = normalizeDosenName(rawName);
  if (!normTarget) return undefined;

  const exact = dosenList.find(d => {
    const normD = normalizeDosenName(d.namaLengkap);
    return normD === normTarget || normD.includes(normTarget) || normTarget.includes(normD);
  });
  if (exact) return exact;

  const tokens = normTarget.split(' ').filter(t => t.length >= 4);
  if (tokens.length === 0) return undefined;

  return dosenList.find(d => {
    if (preferredProdi && preferredProdi !== 'SEMUA_FT' && d.prodiId !== preferredProdi) {
      return false;
    }
    const normD = normalizeDosenName(d.namaLengkap);
    return tokens.some(tok => normD.includes(tok));
  });
}

// Baseline structured MBKM cohort assignments linked to FT UNBARI lecturers & partnerships
interface SeedMbkmProgram {
  id: string;
  dosenId: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  jenis: JenisKegiatanMbkm;
  namaProgram: string;
  mitraInstansi: string;
  jumlahMahasiswa: number;
  sksEkivalenMahasiswa: number;
  sumberData: 'KERJASAMA_MBKM' | 'MSIB_PMM';
  nomorBukti: string;
  isKoordinatorMitra?: boolean;
}

const SEED_MBKM_ACTIVITIES: SeedMbkmProgram[] = [
  // S1 TEKNIK SIPIL
  {
    id: 'MBKM-SPL-01',
    dosenId: 'DOS-SPL-10', // Ir. Suhendra, M.T. (16 SKS rutin + TA + MBKM -> overload detection)
    prodiId: 'SIPIL',
    jenis: 'MAGANG',
    namaProgram: 'MSIB Magang Konstruksi Jembatan & Struktur Overpass JTTS',
    mitraInstansi: 'PT Hutama Karya (Persero) Ruas Betung–Jambi',
    jumlahMahasiswa: 4,
    sksEkivalenMahasiswa: 20,
    sumberData: 'KERJASAMA_MBKM',
    nomorBukti: 'CERT-HK/MSIB/FT-UNBARI/2026-01',
    isKoordinatorMitra: false
  },
  {
    id: 'MBKM-SPL-02',
    dosenId: 'DOS-SPL-07', // Ir. Muhammad Asmuni Jatoeb, M.T. (15 SKS rutin + TA + MBKM -> overload)
    prodiId: 'SIPIL',
    jenis: 'STUDI_INDEPENDEN',
    namaProgram: 'Studi Independen Manajemen Transportasi & BIM Jalan Raya',
    mitraInstansi: 'Balai Jasa Konstruksi Wilayah II / Mitra MSIB BIM',
    jumlahMahasiswa: 4,
    sksEkivalenMahasiswa: 20,
    sumberData: 'MSIB_PMM',
    nomorBukti: 'SI-BIM/SIPIL/2026/02'
  },
  {
    id: 'MBKM-SPL-03',
    dosenId: 'DOS-SPL-12', // Ir. Azwarman, MT (14 SKS rutin)
    prodiId: 'SIPIL',
    jenis: 'MAGANG',
    namaProgram: 'Magang Terkonversi Pengendalian Banjir & Hidrologi DAS Batanghari',
    mitraInstansi: 'Balai Wilayah Sungai (BWS) Sumatera VI Jambi',
    jumlahMahasiswa: 3,
    sksEkivalenMahasiswa: 20,
    sumberData: 'KERJASAMA_MBKM',
    nomorBukti: 'IA-BWS/MBKM/SIPIL/2026/03',
    isKoordinatorMitra: true
  },
  {
    id: 'MBKM-SPL-04',
    dosenId: 'DOS-SPL-01', // Ir. Rioni Rizki Aldiansyah (12 SKS rutin)
    prodiId: 'SIPIL',
    jenis: 'STUDI_INDEPENDEN',
    namaProgram: 'Pertukaran Mahasiswa Merdeka (PMM) Rekayasa Gempa & Material Tropis',
    mitraInstansi: 'Fakultas Teknik Universitas Sriwijaya (UNSRI)',
    jumlahMahasiswa: 5,
    sksEkivalenMahasiswa: 18,
    sumberData: 'KERJASAMA_MBKM',
    nomorBukti: 'PMM-UNSRI-UNBARI/2026/01'
  },
  {
    id: 'MBKM-SPL-05',
    dosenId: 'DOS-SPL-08', // Ria Zulfiati, S.T., M.T. (14 SKS rutin)
    prodiId: 'SIPIL',
    jenis: 'STUDI_INDEPENDEN',
    namaProgram: 'Studi Independen Bersertifikat Tekla Structures & SAP2000 Modeling',
    mitraInstansi: 'DPD INKINDO & Kampus Merdeka Dikti',
    jumlahMahasiswa: 3,
    sksEkivalenMahasiswa: 20,
    sumberData: 'MSIB_PMM',
    nomorBukti: 'SI-STR/INKINDO/2026/04'
  },

  // S1 TEKNIK LINGKUNGAN
  {
    id: 'MBKM-LKG-01',
    dosenId: 'DOS-LKG-05', // Monik Kasman, S.T., M.Sc. (16 SKS rutin + TA + MBKM -> overload)
    prodiId: 'LINGKUNGAN',
    jenis: 'MAGANG',
    namaProgram: 'Magang Industri Pengolahan Air Limbah B3 & IPAL Sawit Terpadu',
    mitraInstansi: 'Perumda Tirta Mayang & PTPN IV PalmCo Jambi',
    jumlahMahasiswa: 4,
    sksEkivalenMahasiswa: 20,
    sumberData: 'KERJASAMA_MBKM',
    nomorBukti: 'IA-PDAM/MBKM-LKG/2026/01',
    isKoordinatorMitra: true
  },
  {
    id: 'MBKM-LKG-02',
    dosenId: 'DOS-LKG-03', // Peppy Herawati, S.T., M.T. (15 SKS rutin + TA + MBKM -> overload)
    prodiId: 'LINGKUNGAN',
    jenis: 'STUDI_INDEPENDEN',
    namaProgram: 'Studi Independen ESG, Carbon Accounting & Pemantauan Kualitas Udara',
    mitraInstansi: 'PT PetroChina International Jabung Ltd. & Mitra MSIB',
    jumlahMahasiswa: 4,
    sksEkivalenMahasiswa: 20,
    sumberData: 'MSIB_PMM',
    nomorBukti: 'SI-ESG/LKG/2026/02'
  },
  {
    id: 'MBKM-LKG-03',
    dosenId: 'DOS-LKG-01', // Ir. Marhadi, ST., MT (14 SKS rutin)
    prodiId: 'LINGKUNGAN',
    jenis: 'MAGANG',
    namaProgram: 'Magang Bersertifikat Pengendalian Pencemaran DAS & Audit AMDAL',
    mitraInstansi: 'Dinas Lingkungan Hidup (DLH) Provinsi Jambi',
    jumlahMahasiswa: 3,
    sksEkivalenMahasiswa: 20,
    sumberData: 'KERJASAMA_MBKM',
    nomorBukti: 'IA-DLH/MBKM-LKG/2026/03'
  },
  {
    id: 'MBKM-LKG-04',
    dosenId: 'DOS-LKG-02', // Asih Suzana, S.T., M.T. (14 SKS rutin)
    prodiId: 'LINGKUNGAN',
    jenis: 'STUDI_INDEPENDEN',
    namaProgram: 'Pertukaran Mahasiswa Merdeka (PMM) Urban Drainage & Sanitasi Tropis',
    mitraInstansi: 'Konsorsium FT UNSRI & AIT Network',
    jumlahMahasiswa: 3,
    sksEkivalenMahasiswa: 18,
    sumberData: 'MSIB_PMM',
    nomorBukti: 'PMM-LKG/2026/04'
  },

  // D3 TEKNIK LISTRIK
  {
    id: 'MBKM-LST-01',
    dosenId: 'DOS-LST-02', // Fadli Eka Yandra, ST., MT (16 SKS rutin + TA + MBKM -> overload)
    prodiId: 'LISTRIK_D3',
    jenis: 'MAGANG',
    namaProgram: 'Magang Vokasi Terstruktur Proteksi Gardu Induk 150 kV & SUTM',
    mitraInstansi: 'PT PLN (Persero) UP3 Jambi - GI Aur Duri',
    jumlahMahasiswa: 4,
    sksEkivalenMahasiswa: 20,
    sumberData: 'KERJASAMA_MBKM',
    nomorBukti: 'IA-PLN/MBKM-LST/2026/01',
    isKoordinatorMitra: true
  },
  {
    id: 'MBKM-LST-02',
    dosenId: 'DOS-LST-03', // Leily Wustha Johar, ST., MT (15 SKS rutin + TA + MBKM -> overload)
    prodiId: 'LISTRIK_D3',
    jenis: 'STUDI_INDEPENDEN',
    namaProgram: 'Studi Independen Otomasi Industri PLC SCADA & Smart Grid Vokasi',
    mitraInstansi: 'PTPN IV Regional 4 & Mitra MSIB Otomasi',
    jumlahMahasiswa: 4,
    sksEkivalenMahasiswa: 20,
    sumberData: 'MSIB_PMM',
    nomorBukti: 'SI-PLC/LST/2026/02'
  },
  {
    id: 'MBKM-LST-03',
    dosenId: 'DOS-LST-01', // Ir. Hendi Matalata, ST., MT, IPP (14 SKS rutin)
    prodiId: 'LISTRIK_D3',
    jenis: 'MAGANG',
    namaProgram: 'Magang Sertifikasi Kompetensi Ketenagalistrikan (SKTTK) & Panel Daya',
    mitraInstansi: 'DPD AKLI Jambi & PT PLN UP3 Jambi',
    jumlahMahasiswa: 3,
    sksEkivalenMahasiswa: 20,
    sumberData: 'KERJASAMA_MBKM',
    nomorBukti: 'IA-AKLI/MBKM-LST/2026/03'
  }
];

function computeActivityHoursAndSks(
  jenis: JenisKegiatanMbkm,
  jumlahMahasiswa: number,
  isKoordinatorMitra: boolean,
  config: MbkmConversionConfig,
  jamOverride?: number
): { jamBimbingan: number; sksKonversiDosen: number } {
  const jamPerSks = Math.max(20, config.jamPerSksBkd || 45);
  if (typeof jamOverride === 'number' && jamOverride > 0) {
    const bonusHours = isKoordinatorMitra
      ? round1(config.sksBonusKoordinatorMitra * jamPerSks)
      : 0;
    const totalHours = round1(jamOverride + bonusHours);
    return {
      jamBimbingan: totalHours,
      sksKonversiDosen: round2(totalHours / jamPerSks)
    };
  }
  const rate =
    jenis === 'MAGANG'
      ? config.sksPerMahasiswaMagang
      : config.sksPerMahasiswaStudiIndependen;
  const baseSks = jumlahMahasiswa * rate;
  const bonusSks = isKoordinatorMitra ? config.sksBonusKoordinatorMitra : 0;
  const baseHours = round1((baseSks + bonusSks) * jamPerSks);
  return {
    jamBimbingan: baseHours,
    sksKonversiDosen: round2(baseHours / jamPerSks)
  };
}

export function buildBkdMbkmIabeeReport(params: {
  dosenList: Dosen[];
  jadwalList: JadwalKuliah[];
  kpList?: JadwalKerjaPraktek[];
  kerjasamaList?: DokumenKerjasama[];
  customActivities?: MbkmDosenActivity[];
  transfers?: MbkmRedistributionTransfer[];
  config?: Partial<MbkmConversionConfig>;
}): BkdMbkmIabeeReport {
  const {
    dosenList,
    jadwalList,
    kpList = [],
    kerjasamaList = [],
    customActivities = [],
    transfers = [],
    config: partialConfig
  } = params;

  const config: MbkmConversionConfig = {
    ...DEFAULT_MBKM_CONVERSION_CONFIG,
    ...partialConfig
  };

  const dosenIds = new Set(dosenList.map(d => d.id));
  const rawActivities: MbkmDosenActivity[] = [];

  // 1. Seeded structured MBKM cohorts (Magang & Studi Independen) for lecturers in scope
  SEED_MBKM_ACTIVITIES.forEach(seed => {
    if (!dosenIds.has(seed.dosenId)) return;
    const conv = computeActivityHoursAndSks(
      seed.jenis,
      seed.jumlahMahasiswa,
      Boolean(seed.isKoordinatorMitra),
      config
    );
    rawActivities.push({
      id: seed.id,
      dosenId: seed.dosenId,
      prodiId: seed.prodiId,
      jenis: seed.jenis,
      namaProgram: seed.namaProgram,
      mitraInstansi: seed.mitraInstansi,
      jumlahMahasiswa: seed.jumlahMahasiswa,
      jamBimbingan: conv.jamBimbingan,
      sksEkivalenMahasiswa: seed.sksEkivalenMahasiswa,
      sksKonversiDosen: conv.sksKonversiDosen,
      sumberData: seed.sumberData,
      nomorBukti: seed.nomorBukti,
      isKoordinatorMitra: seed.isKoordinatorMitra,
      canReassign: true
    });
  });

  // 2. Integrate active KP/Magang records from kpList when matched to lecturers in scope
  kpList.forEach(kp => {
    const matched = matchDosenByName(dosenList, kp.dosenPembimbing, kp.prodiId);
    if (!matched) return;
    const isActiveOrPending = kp.status !== 'Selesai & Dinilai';
    if (!isActiveOrPending) return;

    const conv = computeActivityHoursAndSks('MAGANG', 1, false, config);
    rawActivities.push({
      id: `KP-MBKM-${kp.id}`,
      dosenId: matched.id,
      prodiId: kp.prodiId,
      jenis: 'MAGANG',
      namaProgram: `Pendampingan Lapangan Magang/KP Terkonversi: ${kp.namaMahasiswa} (${kp.nim})`,
      mitraInstansi: kp.instansiPerusahaan,
      jumlahMahasiswa: 1,
      jamBimbingan: conv.jamBimbingan,
      sksEkivalenMahasiswa: 6,
      sksKonversiDosen: conv.sksKonversiDosen,
      sumberData: 'KP_TERKONVERSI',
      nomorBukti: kp.id,
      canReassign: true
    });
  });

  // 3. Dynamically detect extra Kerjasama MBKM items whose PIC matches a scoped lecturer
  kerjasamaList.forEach(kjs => {
    if (kjs.status === 'Kedaluwarsa') return;
    const mbkmRealizations = kjs.realisasiList.filter(
      r => r.bidang === 'Pendidikan & MBKM' && r.statusPelaksanaan === 'Sedang Berjalan'
    );
    if (mbkmRealizations.length === 0) return;

    const matched = matchDosenByName(dosenList, kjs.picDosenFT, kjs.prodiId);
    if (!matched) return;

    mbkmRealizations.forEach(real => {
      const isSI =
        real.namaKegiatan.toLowerCase().includes('studi independen') ||
        real.namaKegiatan.toLowerCase().includes('pertukaran') ||
        real.namaKegiatan.toLowerCase().includes('pmm');
      const jenis: JenisKegiatanMbkm = isSI ? 'STUDI_INDEPENDEN' : 'MAGANG';
      const studentSlots = Math.max(1, Math.min(6, Math.round(real.jumlahMahasiswaTerlibat / 2)));
      const conv = computeActivityHoursAndSks(jenis, studentSlots, true, config);

      rawActivities.push({
        id: `KJS-MBKM-${real.id}`,
        dosenId: matched.id,
        prodiId: matched.prodiId,
        jenis,
        namaProgram: real.namaKegiatan,
        mitraInstansi: kjs.mitraNama,
        jumlahMahasiswa: studentSlots,
        jamBimbingan: conv.jamBimbingan,
        sksEkivalenMahasiswa: 20,
        sksKonversiDosen: conv.sksKonversiDosen,
        sumberData: 'KERJASAMA_MBKM',
        nomorBukti: real.nomorBuktiKegiatan,
        isKoordinatorMitra: true,
        canReassign: true
      });
    });
  });

  // 4. Add user-simulated MBKM assignments
  customActivities.forEach(act => {
    if (!dosenIds.has(act.dosenId)) return;
    const conv = computeActivityHoursAndSks(
      act.jenis,
      act.jumlahMahasiswa,
      Boolean(act.isKoordinatorMitra),
      config,
      act.jamOverride
    );
    rawActivities.push({
      ...act,
      jamBimbingan: conv.jamBimbingan,
      sksKonversiDosen: conv.sksKonversiDosen,
      canReassign: true
    });
  });

  // 5. Apply simulated transfers/redistributions
  const transferMap = new Map<string, string>();
  transfers.forEach(t => {
    if (dosenIds.has(t.toDosenId)) {
      transferMap.set(t.activityId, t.toDosenId);
    }
  });

  const effectiveActivities = rawActivities.map(act => {
    const targetDosenId = transferMap.get(act.id);
    if (!targetDosenId) return act;
    return {
      ...act,
      dosenId: targetDosenId
    };
  });

  // 6. Compute integrated IABEE workload metrics per lecturer
  const metrics: DosenMbkmIabeeMetric[] = dosenList.map(dosen => {
    const scheduledClasses = jadwalList.filter(j => {
      const matchNidn = j.dosenNidn && dosen.nidn && j.dosenNidn === dosen.nidn;
      const isKoordinatorSlot = j.dosenNama.includes('(Koord.');
      const hasStudents = j.terdaftar === undefined || j.terdaftar > 0;
      return matchNidn && !isKoordinatorSlot && hasStudents;
    });

    const scheduledSks = scheduledClasses.reduce((sum, j) => sum + j.sks, 0);
    const sksMengajarRutin = round1(Math.max(dosen.totalSksMengajar, scheduledSks));
    const sksBimbinganTaRutin = round1(dosen.jumlahMahasiswaBimbingan * 0.25);

    const dosenActivities = effectiveActivities.filter(a => a.dosenId === dosen.id);
    const magangActs = dosenActivities.filter(a => a.jenis === 'MAGANG');
    const siActs = dosenActivities.filter(a => a.jenis === 'STUDI_INDEPENDEN');

    const jumlahMahasiswaMagang = magangActs.reduce((s, a) => s + a.jumlahMahasiswa, 0);
    const jumlahMahasiswaStudiIndependen = siActs.reduce((s, a) => s + a.jumlahMahasiswa, 0);

    const jamPerSks = Math.max(20, config.jamPerSksBkd || 45);
    const jamBimbinganMagang = round1(
      magangActs.reduce((s, a) => {
        const koordinatorBonusHours = a.isKoordinatorMitra
          ? config.sksBonusKoordinatorMitra * jamPerSks
          : 0;
        return s + Math.max(0, a.jamBimbingan - koordinatorBonusHours);
      }, 0)
    );
    const jamBimbinganStudiIndependen = round1(
      siActs.reduce((s, a) => {
        const koordinatorBonusHours = a.isKoordinatorMitra
          ? config.sksBonusKoordinatorMitra * jamPerSks
          : 0;
        return s + Math.max(0, a.jamBimbingan - koordinatorBonusHours);
      }, 0)
    );
    const totalJamBimbinganMbkm = round1(
      dosenActivities.reduce((s, a) => s + a.jamBimbingan, 0)
    );

    const sksMbkmMagang = round2(jamBimbinganMagang / jamPerSks);
    const sksMbkmStudiIndependen = round2(jamBimbinganStudiIndependen / jamPerSks);
    const sksKoordinatorMbkm = round2(
      dosenActivities.some(a => a.isKoordinatorMitra) ? config.sksBonusKoordinatorMitra : 0
    );

    const totalSksMbkm = round2(sksMbkmMagang + sksMbkmStudiIndependen + sksKoordinatorMbkm);
    const totalMengajarPlusMbkm = round1(sksMengajarRutin + totalSksMbkm);
    const totalBebanKerjaIabee = round1(
      sksMengajarRutin +
        (config.includeBimbinganTaRutin ? sksBimbinganTaRutin : 0) +
        totalSksMbkm
    );

    const selisihDariBatasIabee = round1(totalBebanKerjaIabee - config.maxIabeeSks);
    const persentaseTerhadapBatasIabee =
      config.maxIabeeSks > 0
        ? round1((totalBebanKerjaIabee / config.maxIabeeSks) * 100)
        : 0;
    const sisaKapasitasSks = round1(Math.max(0, config.maxIabeeSks - totalBebanKerjaIabee));

    let statusIabee: StatusBebanIabee = 'SESUAI_STANDAR_IABEE';
    if (totalBebanKerjaIabee > config.maxIabeeSks) {
      statusIabee = 'MELEBIHI_BATAS_IABEE';
    } else if (totalBebanKerjaIabee >= config.maxIabeeSks - 1.5) {
      statusIabee = 'MENDEKATI_BATAS_IABEE';
    } else if (totalBebanKerjaIabee < config.minStandardSks) {
      statusIabee = 'DI_BAWAH_STANDAR';
    }

    let catatanAuditIabee =
      'Beban mengajar rutin terintegrasi konversi jam bimbingan MBKM memenuhi rentang standar (12–16 SKS).';
    if (statusIabee === 'MELEBIHI_BATAS_IABEE') {
      catatanAuditIabee = `Terdeteksi melampaui batas maksimal ${config.maxIabeeSks} SKS sebesar +${selisihDariBatasIabee} SKS akibat akumulasi ${totalJamBimbinganMbkm} jam bimbingan (${totalSksMbkm} SKS konversi MBKM).`;
    } else if (statusIabee === 'MENDEKATI_BATAS_IABEE') {
      catatanAuditIabee = `Mendekati ambang maksimal ${config.maxIabeeSks} SKS (tersisa ${sisaKapasitasSks} SKS sebelum overload). Hindari penugasan bimbingan MBKM tambahan.`;
    } else if (statusIabee === 'DI_BAWAH_STANDAR') {
      catatanAuditIabee = `Masih di bawah standar minimal 12 SKS. Berpotensi menerima alokasi bimbingan Magang / Studi Independen MBKM.`;
    }

    return {
      dosen,
      sksMengajarRutin,
      scheduledSks,
      sksBimbinganTaRutin,
      jumlahMahasiswaMagang,
      jumlahMahasiswaStudiIndependen,
      jamBimbinganMagang,
      jamBimbinganStudiIndependen,
      totalJamBimbinganMbkm,
      sksMbkmMagang,
      sksMbkmStudiIndependen,
      sksKoordinatorMbkm,
      totalSksMbkm,
      totalMengajarPlusMbkm,
      totalBebanKerjaIabee,
      selisihDariBatasIabee,
      persentaseTerhadapBatasIabee,
      sisaKapasitasSks,
      statusIabee,
      activities: dosenActivities,
      catatanAuditIabee
    };
  });

  // Sort by highest total IABEE workload first
  metrics.sort((a, b) => b.totalBebanKerjaIabee - a.totalBebanKerjaIabee);

  const overloadedDosen = metrics.filter(m => m.statusIabee === 'MELEBIHI_BATAS_IABEE');
  const nearLimitDosen = metrics.filter(m => m.statusIabee === 'MENDEKATI_BATAS_IABEE');
  const compliantDosen = metrics.filter(m => m.statusIabee === 'SESUAI_STANDAR_IABEE');
  const underloadDosen = metrics.filter(m => m.statusIabee === 'DI_BAWAH_STANDAR');

  // 7. Build redistribution proposals for overloaded lecturers with MBKM activities
  const proposals: MbkmRedistributionProposal[] = [];
  const appliedIds = new Set(transfers.map(t => t.activityId));

  // Track projected load per lecturer when proposing transfers
  const projectedSksMap = new Map<string, number>();
  metrics.forEach(m => projectedSksMap.set(m.dosen.id, m.totalBebanKerjaIabee));

  overloadedDosen.forEach(overMetric => {
    const movableActs = [...overMetric.activities]
      .filter(a => a.canReassign)
      .sort((a, b) => b.sksKonversiDosen - a.sksKonversiDosen);

    movableActs.forEach(act => {
      const currentFromSks = projectedSksMap.get(overMetric.dosen.id) ?? overMetric.totalBebanKerjaIabee;
      if (currentFromSks <= config.maxIabeeSks) return;

      // Find best receiver in same prodi with enough spare SKS capacity
      const candidates = metrics
        .filter(
          c =>
            c.dosen.id !== overMetric.dosen.id &&
            c.dosen.prodiId === overMetric.dosen.prodiId &&
            (projectedSksMap.get(c.dosen.id) ?? c.totalBebanKerjaIabee) + act.sksKonversiDosen <=
              config.maxIabeeSks
        )
        .sort(
          (a, b) =>
            (projectedSksMap.get(a.dosen.id) ?? a.totalBebanKerjaIabee) -
            (projectedSksMap.get(b.dosen.id) ?? b.totalBebanKerjaIabee)
        );

      const receiver = candidates[0];
      if (!receiver) return;

      const toBeforeSks = round1(projectedSksMap.get(receiver.dosen.id) ?? receiver.totalBebanKerjaIabee);
      const fromAfterSks = round1(currentFromSks - act.sksKonversiDosen);
      const toAfterSks = round1(toBeforeSks + act.sksKonversiDosen);

      projectedSksMap.set(overMetric.dosen.id, fromAfterSks);
      projectedSksMap.set(receiver.dosen.id, toAfterSks);

      proposals.push({
        id: `PROP-${act.id}`,
        activity: act,
        fromDosen: overMetric.dosen,
        toDosen: receiver.dosen,
        sksDipindahkan: act.sksKonversiDosen,
        fromBeforeSks: round1(currentFromSks),
        fromAfterSks,
        toBeforeSks,
        toAfterSks,
        isApplied: appliedIds.has(act.id),
        reason: `Menurunkan beban ${overMetric.dosen.namaLengkap} dari ${round1(currentFromSks)} SKS → ${fromAfterSks} SKS agar memenuhi batas maksimal IABEE (${config.maxIabeeSks} SKS).`
      });
    });
  });

  // Also preserve already-applied transfers so user can toggle/undo them cleanly
  transfers.forEach(tr => {
    const propId = `PROP-${tr.activityId}`;
    if (proposals.some(p => p.id === propId)) return;
    const act = effectiveActivities.find(a => a.id === tr.activityId);
    const fromDosen = dosenList.find(d => d.id === tr.fromDosenId);
    const toDosen = dosenList.find(d => d.id === tr.toDosenId);
    if (!act || !fromDosen || !toDosen) return;

    const fromMetric = metrics.find(m => m.dosen.id === fromDosen.id);
    const toMetric = metrics.find(m => m.dosen.id === toDosen.id);

    proposals.push({
      id: propId,
      activity: act,
      fromDosen,
      toDosen,
      sksDipindahkan: act.sksKonversiDosen,
      fromBeforeSks: round1((fromMetric?.totalBebanKerjaIabee ?? 0) + act.sksKonversiDosen),
      fromAfterSks: round1(fromMetric?.totalBebanKerjaIabee ?? 0),
      toBeforeSks: round1((toMetric?.totalBebanKerjaIabee ?? 0) - act.sksKonversiDosen),
      toAfterSks: round1(toMetric?.totalBebanKerjaIabee ?? 0),
      isApplied: true,
      reason: `Penugasan DPL MBKM telah disimulasikan dialihkan ke ${toDosen.namaLengkap}.`
    });
  });

  const totalDosen = metrics.length;
  const totalMahasiswaMagang = metrics.reduce((s, m) => s + m.jumlahMahasiswaMagang, 0);
  const totalMahasiswaStudiIndependen = metrics.reduce(
    (s, m) => s + m.jumlahMahasiswaStudiIndependen,
    0
  );
  const totalJamBimbinganSeluruhDosen = round1(
    metrics.reduce((s, m) => s + m.totalJamBimbinganMbkm, 0)
  );
  const totalSksMbkmSeluruhDosen = round1(
    metrics.reduce((s, m) => s + m.totalSksMbkm, 0)
  );
  const avgSksMbkmPerDosen =
    totalDosen > 0 ? round2(totalSksMbkmSeluruhDosen / totalDosen) : 0;
  const avgTotalBebanIabee =
    totalDosen > 0
      ? round1(metrics.reduce((s, m) => s + m.totalBebanKerjaIabee, 0) / totalDosen)
      : 0;
  const compliantCount = compliantDosen.length + nearLimitDosen.length;
  const persenKepatuhanIabee =
    totalDosen > 0 ? round1((compliantCount / totalDosen) * 100) : 100;

  return {
    config,
    metrics,
    overloadedDosen,
    nearLimitDosen,
    compliantDosen,
    underloadDosen,
    proposals,
    summary: {
      totalDosen,
      totalMahasiswaMagang,
      totalMahasiswaStudiIndependen,
      totalJamBimbinganSeluruhDosen,
      totalSksMbkmSeluruhDosen,
      avgSksMbkmPerDosen,
      avgTotalBebanIabee,
      overloadCount: overloadedDosen.length,
      nearLimitCount: nearLimitDosen.length,
      compliantCount,
      underloadCount: underloadDosen.length,
      persenKepatuhanIabee
    }
  };
}
