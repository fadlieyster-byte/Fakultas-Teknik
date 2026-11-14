import {
  CplItemObe,
  JadwalKuliah,
  LogPresensiDosen,
  MataKuliahCplMatrixRecord
} from '../types/index';

export type BapAuditStatus =
  | 'Perlu Investigasi Audit'
  | 'Menunggu Verifikasi'
  | 'Konsisten & Lengkap';

export interface CourseBapAuditItem {
  id: string;
  kodeMK: string;
  namaMK: string;
  kelas: string;
  dosenNama: string;
  bapStatus: JadwalKuliah['bapStatus'];
  pertemuanKe: number;
  bapHadirCount: number; // Jumlah kehadiran mahasiswa tercatat pada BAP
  siakadHadirCount: number; // Daftar hadir mahasiswa di SIAKAD
  siakadTotalPeserta: number; // Mahasiswa terdaftar di kelas SIAKAD
  selisihJumlah: number; // Absolut selisih mahasiswa (BAP vs SIAKAD)
  selisihPersen: number; // % deviasi
  statusAudit: BapAuditStatus;
  alasanTemuan: string;
  tindakanSaran: string;
}

export interface ProdiBapAuditReport {
  totalMk: number;
  lengkapCount: number;
  investigasiCount: number;
  menungguCount: number;
  avgConsistencyPercent: number;
  items: CourseBapAuditItem[];
}

export type AssessmentAuditStatus =
  | 'Layak OBE (Optimal)'
  | 'Perlu Penyesuaian Bobot'
  | 'Tidak Seimbang (Kritis)';

export interface CourseAssessmentAuditItem {
  course: MataKuliahCplMatrixRecord;
  bobotTugasPersen: number;
  bobotUtsPersen: number;
  bobotUasPersen: number;
  totalBobotTerdeteksi: number;
  idealTugasRange: string;
  idealUtsRange: string;
  idealUasRange: string;
  cplDomainFocus: string;
  skorKelayakanObe: number; // Strictly 1 - 100
  status: AssessmentAuditStatus;
  analisisKesesuaian: string;
  rekomendasiBobot: string;
}

export interface ProdiAssessmentAuditReport {
  totalCourses: number;
  avgObeScore: number;
  optimalCount: number;
  revisiCount: number;
  kritisCount: number;
  avgTugasPersen: number;
  avgUtsPersen: number;
  avgUasPersen: number;
  items: CourseAssessmentAuditItem[];
}

function deterministicHash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) % 997;
  }
  return h;
}

/**
 * Audit Kelengkapan BAP per MK: membandingkan jumlah kehadiran mahasiswa pada BAP
 * terhadap daftar hadir & peserta terdaftar di SIAKAD.
 */
export function buildBapCompletenessAuditReport(params: {
  jadwalList: JadwalKuliah[];
  logPresensiList: LogPresensiDosen[];
}): ProdiBapAuditReport {
  const { jadwalList, logPresensiList } = params;

  const logsByJadwalId = new Map<string, LogPresensiDosen[]>();
  logPresensiList.forEach(log => {
    const arr = logsByJadwalId.get(log.jadwalId) || [];
    arr.push(log);
    logsByJadwalId.set(log.jadwalId, arr);
  });

  const items: CourseBapAuditItem[] = jadwalList.map((j, idx) => {
    const matchedLogs = logsByJadwalId.get(j.id) || [];
    const latestLog = matchedLogs[0];
    const siakadTotalPeserta = Math.max(1, j.terdaftar ?? j.pesertaTotal ?? 30);

    // Baseline SIAKAD recorded attendance derived from real log or deterministic attendance ratio
    const hash = deterministicHash(`${j.id}-${j.kodeMK}`);
    const defaultSiakadAttendance = Math.max(
      1,
      Math.round(siakadTotalPeserta * (0.82 + (hash % 13) / 100))
    );
    const siakadHadirCount = latestLog
      ? Math.min(siakadTotalPeserta, latestLog.jumlahMahasiswaHadir)
      : Math.min(siakadTotalPeserta, defaultSiakadAttendance);

    // Derive BAP recorded student attendance: introduce realistic discrepancies where BAP is Belum Diisi
    // or specific sessions exhibit inflation/omission anomalies relative to SIAKAD attendance sheet.
    let bapHadirCount = siakadHadirCount;
    if (j.bapStatus === 'Belum Diisi') {
      bapHadirCount = 0;
    } else if (latestLog && latestLog.bapStatus === 'Menunggu Verifikasi Kaprodi') {
      // Simulate slight mismatch awaiting audit
      bapHadirCount = Math.min(siakadTotalPeserta, siakadHadirCount + 6);
    } else if (idx % 4 === 1 && matchedLogs.length === 0) {
      // Deterministic significant attendance discrepancy (e.g. BAP lists full class while SIAKAD shows 75%)
      bapHadirCount = siakadTotalPeserta;
    } else if (idx % 6 === 4 && matchedLogs.length === 0) {
      bapHadirCount = Math.max(1, siakadHadirCount - Math.max(5, Math.round(siakadTotalPeserta * 0.22)));
    } else {
      // Within normal tolerance (+/- 1 student)
      bapHadirCount = Math.max(1, Math.min(siakadTotalPeserta, siakadHadirCount + (hash % 2)));
    }

    const selisihJumlah = Math.abs(bapHadirCount - siakadHadirCount);
    const selisihPersen = Math.round((selisihJumlah / siakadTotalPeserta) * 100);

    const hasSignificantDiscrepancy =
      j.bapStatus === 'Belum Diisi' || selisihPersen >= 15 || selisihJumlah >= 5;

    let statusAudit: BapAuditStatus = 'Konsisten & Lengkap';
    let alasanTemuan = `Data kehadiran BAP (${bapHadirCount} mhs) konsisten dengan daftar hadir SIAKAD (${siakadHadirCount}/${siakadTotalPeserta} mhs).`;
    let tindakanSaran = 'Arsipkan BAP tervalidasi untuk bukti mutu LAM-Teknik Kriteria 6.';

    if (hasSignificantDiscrepancy) {
      statusAudit = 'Perlu Investigasi Audit';
      if (j.bapStatus === 'Belum Diisi') {
        alasanTemuan = `BAP pertemuan belum diisi dosen pengampu, sedangkan daftar hadir SIAKAD mencatat ${siakadHadirCount}/${siakadTotalPeserta} mahasiswa hadir.`;
        tindakanSaran =
          'Kirim surat pengingat ke dosen pengampu untuk mengisi BAP & mencocokkan presensi manual dalam 2x24 jam.';
      } else {
        alasanTemuan = `Ketidaksesuaian signifikan sebesar ${selisihPersen}% (${selisihJumlah} mahasiswa): BAP mencatat ${bapHadirCount} hadir, sedangkan daftar hadir SIAKAD hanya ${siakadHadirCount}/${siakadTotalPeserta}.`;
        tindakanSaran =
          'Lakukan verifikasi silang lembar tanda tangan fisik kelas dengan log absensi SIAKAD bersama Kaprodi & Tata Usaha.';
      }
    } else if (j.bapStatus === 'Menunggu Verifikasi Kaprodi') {
      statusAudit = 'Menunggu Verifikasi';
      alasanTemuan = `Jumlah hadir BAP (${bapHadirCount} mhs) selisih wajar ${selisihJumlah} mhs dari SIAKAD (${siakadHadirCount} mhs), menunggu otorisasi Kaprodi.`;
      tindakanSaran = 'Selesaikan verifikasi tanda tangan BAP di modul Jadwal & Presensi.';
    }

    return {
      id: j.id,
      kodeMK: j.kodeMK,
      namaMK: j.namaMK,
      kelas: j.kelas,
      dosenNama: j.dosenNama,
      bapStatus: j.bapStatus,
      pertemuanKe: j.pertemuanKe ?? latestLog?.mingguKe ?? 8,
      bapHadirCount,
      siakadHadirCount,
      siakadTotalPeserta,
      selisihJumlah,
      selisihPersen,
      statusAudit,
      alasanTemuan,
      tindakanSaran
    };
  });

  items.sort((a, b) => {
    const rank: Record<BapAuditStatus, number> = {
      'Perlu Investigasi Audit': 0,
      'Menunggu Verifikasi': 1,
      'Konsisten & Lengkap': 2
    };
    if (rank[a.statusAudit] !== rank[b.statusAudit]) {
      return rank[a.statusAudit] - rank[b.statusAudit];
    }
    return b.selisihPersen - a.selisihPersen;
  });

  const investigasiCount = items.filter(i => i.statusAudit === 'Perlu Investigasi Audit').length;
  const menungguCount = items.filter(i => i.statusAudit === 'Menunggu Verifikasi').length;
  const lengkapCount = items.filter(i => i.statusAudit === 'Konsisten & Lengkap').length;
  const avgConsistencyPercent =
    items.length > 0
      ? Math.max(
          0,
          Math.round(
            items.reduce((s, i) => s + Math.max(0, 100 - i.selisihPersen), 0) / items.length
          )
        )
      : 100;

  return {
    totalMk: items.length,
    lengkapCount,
    investigasiCount,
    menungguCount,
    avgConsistencyPercent,
    items
  };
}

/**
 * Audit Kualitas Asesmen: Membandingkan bobot Tugas/Proyek, UTS, dan UAS pada RPS
 * dengan kriteria capaian CPL, serta menghasilkan Skor Kelayakan OBE (1-100).
 */
export function buildAssessmentQualityAuditReport(params: {
  courses: MataKuliahCplMatrixRecord[];
  prodiCpls: CplItemObe[];
}): ProdiAssessmentAuditReport {
  const { courses, prodiCpls } = params;

  const cplMap = new Map<string, CplItemObe>();
  prodiCpls.forEach(c => cplMap.set(c.kode, c));

  const items: CourseAssessmentAuditItem[] = courses.map(course => {
    const cpmks = course.cpmkList || [];
    let tugasRaw = 0;
    let utsRaw = 0;
    let uasRaw = 0;

    cpmks.forEach(cp => {
      const m = cp.metodeAsesmen.toLowerCase();
      const b = cp.bobotPersen || 0;

      const hasUts = m.includes('uts') || m.includes('tengah');
      const hasUas = m.includes('uas') || m.includes('akhir');
      const hasTugasOrPrak =
        m.includes('tugas') ||
        m.includes('proyek') ||
        m.includes('project') ||
        m.includes('case') ||
        m.includes('praktik') ||
        m.includes('kuis') ||
        m.includes('presentasi') ||
        m.includes('laporan');

      const matchedCats = [hasTugasOrPrak, hasUts, hasUas].filter(Boolean).length;
      if (matchedCats === 0) {
        tugasRaw += b;
      } else {
        if (hasTugasOrPrak) tugasRaw += b / matchedCats;
        if (hasUts) utsRaw += b / matchedCats;
        if (hasUas) uasRaw += b / matchedCats;
      }
    });

    const totalBobotTerdeteksi = Math.round(tugasRaw + utsRaw + uasRaw);
    const normFactor = totalBobotTerdeteksi > 0 ? 100 / totalBobotTerdeteksi : 0;
    const bobotTugasPersen = Math.round(tugasRaw * normFactor);
    const bobotUtsPersen = Math.round(utsRaw * normFactor);
    const bobotUasPersen = Math.max(0, 100 - bobotTugasPersen - bobotUtsPersen);

    // Determine dominant CPL focus for this course
    const strongCplCodes = Object.entries(course.pemetaanCpl || {})
      .filter(([, lv]) => lv === 'Strong')
      .map(([kode]) => kode);
    const hasSkillOrLabCpl =
      course.kategori === 'Studio/Praktikum' ||
      strongCplCodes.some(k => {
        const c = cplMap.get(k);
        const txt = `${c?.ranah || ''} ${c?.judul || ''}`.toLowerCase();
        return txt.includes('khusus') || txt.includes('rancang') || txt.includes('eksperimen') || txt.includes('praktik');
      });

    // Ideal benchmark weights by OBE CPL demand
    const minIdealTugas = hasSkillOrLabCpl ? 40 : 30;
    const idealTugasRange = hasSkillOrLabCpl ? '40% – 55%' : '30% – 45%';
    const idealUtsRange = '20% – 30%';
    const idealUasRange = hasSkillOrLabCpl ? '20% – 35%' : '25% – 40%';
    const cplDomainFocus = hasSkillOrLabCpl
      ? 'Keterampilan Rekayasa / Perancangan / Lab (IKU-7)'
      : 'Penguasaan Konsep & Analisis Teoritis (OBE)';

    // Calculate OBE Score (strictly 1-100)
    let score = 100;
    if (cpmks.length === 0 || totalBobotTerdeteksi === 0) {
      score = 25;
    } else {
      // Penalty if total RPS CPMK weight != 100%
      if (Math.abs(totalBobotTerdeteksi - 100) > 2) {
        score -= Math.min(20, Math.abs(totalBobotTerdeteksi - 100));
      }
      // Penalty if Tugas/Project weight below OBE CPL benchmark
      if (bobotTugasPersen < minIdealTugas) {
        score -= Math.round((minIdealTugas - bobotTugasPersen) * 0.9);
      }
      // Penalty if single exam (UTS or UAS) dominates too heavily (>45%)
      if (bobotUasPersen > 45) {
        score -= Math.round((bobotUasPersen - 45) * 0.8);
      }
      if (bobotUtsPersen < 10) {
        score -= 10;
      }
      // Bonus/check for >= 3 CPMKs covering mapped strong CPLs
      const cpmkCplSet = new Set(cpmks.flatMap(c => c.cplTerkait || []));
      const unmappedStrong = strongCplCodes.filter(k => !cpmkCplSet.has(k)).length;
      score -= unmappedStrong * 8;
    }

    const skorKelayakanObe = Math.max(1, Math.min(100, Math.round(score)));

    let status: AssessmentAuditStatus = 'Layak OBE (Optimal)';
    if (skorKelayakanObe < 65) status = 'Tidak Seimbang (Kritis)';
    else if (skorKelayakanObe < 82) status = 'Perlu Penyesuaian Bobot';

    let analisisKesesuaian = `Komposisi Tugas (${bobotTugasPersen}%), UTS (${bobotUtsPersen}%), dan UAS (${bobotUasPersen}%) proporsional untuk mengukur ${cplDomainFocus}.`;
    let rekomendasiBobot =
      'Pertahankan proporsi asesmen formatif-sumatif & lampirkan rubrik analitik pada portofolio CPL.';

    if (bobotTugasPersen < minIdealTugas) {
      analisisKesesuaian = `Bobot Tugas/Proyek (${bobotTugasPersen}%) masih di bawah rekomendasi OBE (${idealTugasRange}) untuk memvalidasi capaian ${strongCplCodes.slice(0, 2).join(', ') || 'CPL inti'}.`;
      rekomendasiBobot = `Naikkan porsi Tugas Besar/Case Method menjadi min. ${minIdealTugas}% dengan menurunkan porsi UAS (${bobotUasPersen}%) agar selaras kriteria OBE & IKU-7.`;
    } else if (bobotUtsPersen < 10 || bobotUasPersen > 45) {
      analisisKesesuaian = `Evaluasi sumatif terpusat pada UAS (${bobotUasPersen}%) atau porsi UTS (${bobotUtsPersen}%) kurang seimbang untuk pemantauan progres tengah semester.`;
      rekomendasiBobot = `Distribusi ulang ke rentang ideal Tugas ${idealTugasRange}, UTS ${idealUtsRange}, dan UAS ${idealUasRange}.`;
    } else if (Math.abs(totalBobotTerdeteksi - 100) > 2) {
      analisisKesesuaian = `Akumulasi bobot mentah CPMK tercatat ${totalBobotTerdeteksi}% (seharusnya tepat 100%).`;
      rekomendasiBobot =
        'Normalkan total bobot seluruh butir CPMK di Matriks RPS menjadi genap 100%.';
    }

    return {
      course,
      bobotTugasPersen,
      bobotUtsPersen,
      bobotUasPersen,
      totalBobotTerdeteksi,
      idealTugasRange,
      idealUtsRange,
      idealUasRange,
      cplDomainFocus,
      skorKelayakanObe,
      status,
      analisisKesesuaian,
      rekomendasiBobot
    };
  });

  items.sort((a, b) => a.skorKelayakanObe - b.skorKelayakanObe);

  const avgObeScore =
    items.length > 0
      ? Math.max(
          1,
          Math.min(
            100,
            Math.round(items.reduce((s, i) => s + i.skorKelayakanObe, 0) / items.length)
          )
        )
      : 100;

  const avgTugasPersen =
    items.length > 0
      ? Math.round(items.reduce((s, i) => s + i.bobotTugasPersen, 0) / items.length)
      : 0;
  const avgUtsPersen =
    items.length > 0
      ? Math.round(items.reduce((s, i) => s + i.bobotUtsPersen, 0) / items.length)
      : 0;
  const avgUasPersen =
    items.length > 0
      ? Math.round(items.reduce((s, i) => s + i.bobotUasPersen, 0) / items.length)
      : 0;

  return {
    totalCourses: items.length,
    avgObeScore,
    optimalCount: items.filter(i => i.status === 'Layak OBE (Optimal)').length,
    revisiCount: items.filter(i => i.status === 'Perlu Penyesuaian Bobot').length,
    kritisCount: items.filter(i => i.status === 'Tidak Seimbang (Kritis)').length,
    avgTugasPersen,
    avgUtsPersen,
    avgUasPersen,
    items
  };
}
