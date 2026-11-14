import { CplItemObe, MataKuliahCplMatrixRecord } from '../types/index';

export type ObeComponentKey = 'CPL' | 'CPMK' | 'Sub-CPMK' | 'Asesmen' | 'Bahan Kajian';

export interface AiRpsImprovementRecommendation {
  aspek: ObeComponentKey | string;
  targetField?: keyof RpsDraftPayload;
  prioritas: string;
  rekomendasiKonkret: string;
  saranKontenPengganti?: string;
}

export interface AiRpsEvaluationResult {
  courseId: string;
  draftSignature?: string;
  source: 'AI_GEMINI' | 'LIVE_SCAN';
  skorTotalObe: number; // 1 - 100
  skorCpl: number; // 1 - 100
  skorCpmk: number; // 1 - 100
  skorSubCpmk: number; // 1 - 100
  skorAsesmen: number; // 1 - 100
  skorBahanKajian: number; // 1 - 100
  predikatObe: string;
  ringkasanAnalisisTeks: string;
  aspekKuat: string[];
  celahKesesuaian: string[];
  rekomendasiPerbaikan: AiRpsImprovementRecommendation[];
  evaluatedAt?: string;
  modelUsed?: string;
}

export interface RpsDraftPayload {
  cplContent: string;
  cpmkContent: string;
  subCpmkContent: string;
  asesmenContent: string;
  bahanKajianContent: string;
  customRpsText: string;
}

function clamp100(val: number): number {
  return Math.max(1, Math.min(100, Math.round(val)));
}

export function buildDraftSignature(draft: RpsDraftPayload): string {
  return [
    draft.cplContent.trim(),
    draft.cpmkContent.trim(),
    draft.subCpmkContent.trim(),
    draft.asesmenContent.trim(),
    draft.bahanKajianContent.trim(),
    draft.customRpsText.trim()
  ].join('||');
}

export function mapAspectToDraftField(aspek: string): keyof RpsDraftPayload {
  const a = (aspek || '').toLowerCase();
  if (a.includes('sub-cpmk') || a.includes('sub cpmk') || a.includes('metode')) {
    return 'subCpmkContent';
  }
  if (a.includes('cpmk')) {
    return 'cpmkContent';
  }
  if (a.includes('asesmen') || a.includes('nilai') || a.includes('rubrik') || a.includes('bobot')) {
    return 'asesmenContent';
  }
  if (
    a.includes('bahan') ||
    a.includes('kajian') ||
    a.includes('materi') ||
    a.includes('pustaka') ||
    a.includes('referensi')
  ) {
    return 'bahanKajianContent';
  }
  return 'cplContent';
}

export function buildDefaultRpsDraftForCourse(
  course: MataKuliahCplMatrixRecord,
  prodiCpls: CplItemObe[]
): RpsDraftPayload {
  const cpmks = course.cpmkList || [];
  const explicitLinkedCodes = new Set<string>();
  cpmks.forEach(cp => (cp.cplTerkait || []).forEach(k => explicitLinkedCodes.add(k)));

  const linkedCplObjects = prodiCpls.filter(c => explicitLinkedCodes.has(c.kode));
  const cplLines =
    linkedCplObjects.length > 0
      ? linkedCplObjects
          .map(c => `${c.kode} [${course.pemetaanCpl[c.kode] || 'Terkait'}]: ${c.judul}`)
          .join('; ')
      : 'Belum ada kode CPL tertaut secara eksplisit pada RPS.';

  const deskripsiBase =
    course.catatanKurikulum?.trim() ||
    `Mata kuliah ${course.namaMK} (${course.sks} SKS, Semester ${course.semester}).`;

  const cplContent = `${deskripsiBase}\nCPL pada RPS: ${cplLines}`;

  const cpmkContent =
    cpmks.length > 0
      ? cpmks
          .map(
            c =>
              `${c.kode} (${c.levelBloom || 'C3'}) [CPL: ${
                (c.cplTerkait || []).join(', ') || 'Belum tertaut'
              }]: ${c.deskripsi}`
          )
          .join('\n')
      : '';

  const hasAnyActiveMethod = cpmks.some(c =>
    /case|kasus|proyek|project|tugas besar|praktikum|simulasi/i.test(c.metodeAsesmen || '')
  );

  const subCpmkLines = cpmks
    .map((c, idx) => {
      const num = idx + 1;
      const isCaseOrProject =
        /case|kasus|proyek|project|tugas besar|praktikum|simulasi/i.test(
          c.metodeAsesmen || ''
        );
      return isCaseOrProject
        ? `Sub-CPMK ${num}.1 (Mg ${num * 2 - 1}-${num * 2}): Mahasiswa mampu merumuskan dan menganalisis model ${course.namaMK} melalui ${c.metodeAsesmen}.`
        : '';
    })
    .filter(Boolean);

  const subCpmkContent =
    subCpmkLines.length > 0
      ? subCpmkLines.join('\n')
      : cpmks.length > 0
      ? `Kegiatan pembelajaran terpusat pada ceramah tatap muka untuk ${cpmks.length} kompetensi dasar.`
      : '';

  const asesmenContent =
    cpmks.length > 0
      ? cpmks
          .map(
            c =>
              `${c.kode} (${c.bobotPersen || 0}%): ${c.metodeAsesmen || 'Evaluasi tertulis'}`
          )
          .join('\n')
      : 'UTS 40%, UAS 60% (instrumen autentik belum dirinci).';

  const domainRef =
    course.prodiId === 'SIPIL'
      ? 'SNI 2847:2019 / SNI 1726:2019 & Modul Perancangan Teknik Sipil (2024)'
      : course.prodiId === 'LINGKUNGAN'
      ? 'PP No. 22/2021 Baku Mutu Lingkungan & Standar IPAL Industri (2023)'
      : 'PUIL 2020, IEEE Std 141, & Modul Sistem Tenaga / Otomasi Industri (2024)';

  const bahanKajianContent =
    cpmks.length >= 3 && hasAnyActiveMethod
      ? `Pokok Bahasan: Fundamental ${course.namaMK}, Pemodelan & Analisis Rekayasa, Studi Kasus Aplikasi Lapangan.\nReferensi Utama: ${domainRef}.`
      : `Pengenalan teori dasar ${course.namaMK} tanpa daftar modul mingguan dan standar acuan terbaru.`;

  return {
    cplContent,
    cpmkContent,
    subCpmkContent,
    asesmenContent,
    bahanKajianContent,
    customRpsText: ''
  };
}

export function buildRpsPreScanEvaluation(
  course: MataKuliahCplMatrixRecord,
  prodiCpls: CplItemObe[],
  draft?: RpsDraftPayload
): AiRpsEvaluationResult {
  const effectiveDraft = draft ?? buildDefaultRpsDraftForCourse(course, prodiCpls);
  const cpmks = course.cpmkList || [];
  const mappedCodes = Object.entries(course.pemetaanCpl || {})
    .filter(([, lvl]) => lvl === 'Strong' || lvl === 'Medium')
    .map(([k]) => k);

  const extraText = effectiveDraft.customRpsText.trim();

  // 1. Evaluasi Kelengkapan CPL (1-100)
  const cplFullText = `${effectiveDraft.cplContent} ${extraText}`.trim();
  const detectedCplInText = prodiCpls
    .map(c => c.kode)
    .filter(kode => cplFullText.toUpperCase().includes(kode.toUpperCase()));
  const cplTextLen = effectiveDraft.cplContent.trim().length;
  let skorCpl = 20;
  if (cplTextLen >= 90) skorCpl += 26;
  else if (cplTextLen >= 45) skorCpl += 16;
  else if (cplTextLen > 0) skorCpl += 6;

  if (detectedCplInText.length >= 2) skorCpl += 32;
  else if (detectedCplInText.length === 1) skorCpl += 16;

  const missingCplCoverage = mappedCodes.filter(
    code => !detectedCplInText.includes(code)
  );
  if (missingCplCoverage.length === 0 && detectedCplInText.length > 0) skorCpl += 22;
  else if (mappedCodes.length > 0) {
    skorCpl += Math.round(
      ((mappedCodes.length - missingCplCoverage.length) / mappedCodes.length) * 18
    );
  }
  skorCpl = clamp100(skorCpl);

  // 2. Evaluasi Kelengkapan CPMK (1-100)
  const cpmkText = `${effectiveDraft.cpmkContent} ${extraText}`.trim();
  const cpmkMatches = cpmkText.match(/CPMK[-\s]?\d+/gi) || [];
  const uniqueCpmkCount = new Set(cpmkMatches.map(m => m.toUpperCase().replace(/\s+/g, '-')))
    .size;
  const hasHighBloom = /C4|C5|C6|P3|P4|A4|A5|menganalisis|merancang|mengevaluasi/i.test(
    cpmkText
  );
  const hasCplTagInCpmk = /CPL[-\s]?\d+/i.test(effectiveDraft.cpmkContent);

  let skorCpmk = 18;
  if (uniqueCpmkCount >= 3) skorCpmk += 38;
  else if (uniqueCpmkCount === 2) skorCpmk += 24;
  else if (uniqueCpmkCount === 1) skorCpmk += 14;
  else if (effectiveDraft.cpmkContent.trim().length >= 30) skorCpmk += 10;

  if (hasHighBloom) skorCpmk += 24;
  else if (/C3|menerapkan|menghitung/i.test(cpmkText)) skorCpmk += 12;

  if (hasCplTagInCpmk) skorCpmk += 20;
  skorCpmk = clamp100(skorCpmk);

  // 3. Evaluasi Kelengkapan Sub-CPMK (1-100)
  const subText = `${effectiveDraft.subCpmkContent} ${extraText}`.trim();
  const subMatches = subText.match(/Sub[-\s]?CPMK[\s-]?\d+(\.\d+)?/gi) || [];
  const hasWeeklyStage = /minggu|mg\s*\d+|pertemuan\s*\d+|tahap|indikator/i.test(subText);
  const hasActiveMethod = /case\s*method|studi\s*kasus|project|proyek|tugas\s*besar|praktikum|simulasi|problem\s*based/i.test(
    subText
  );

  let skorSubCpmk = 14;
  if (subMatches.length >= 3) skorSubCpmk += 36;
  else if (subMatches.length >= 1) skorSubCpmk += 20;
  else if (effectiveDraft.subCpmkContent.trim().length >= 60) skorSubCpmk += 10;

  if (hasWeeklyStage) skorSubCpmk += 22;
  if (hasActiveMethod) skorSubCpmk += 28;
  skorSubCpmk = clamp100(skorSubCpmk);

  // 4. Evaluasi Kelengkapan Asesmen (1-100)
  const asesmenText = `${effectiveDraft.asesmenContent} ${extraText}`.trim();
  const percentMatches = [...asesmenText.matchAll(/(\d{1,3})\s*%/g)].map(m =>
    Number(m[1])
  );
  const sumPercents = percentMatches.reduce((a, b) => a + b, 0);
  const hasAuthenticInstrument = /rubrik|proyek|project|tugas\s*besar|case|kasus|praktikum|observasi|portofolio/i.test(
    asesmenText
  );
  const hasSumative = /uts|uas|ujian/i.test(asesmenText);

  let skorAsesmen = 16;
  if (percentMatches.length >= 2 && Math.abs(sumPercents - 100) <= 2) {
    skorAsesmen += 34;
  } else if (percentMatches.length >= 1) {
    skorAsesmen += 14;
  }
  if (hasAuthenticInstrument) skorAsesmen += 32;
  if (hasSumative) skorAsesmen += 12;
  if (/CPMK[-\s]?\d+/i.test(effectiveDraft.asesmenContent)) skorAsesmen += 6;
  skorAsesmen = clamp100(skorAsesmen);

  // 5. Evaluasi Kelengkapan Bahan Kajian (1-100)
  const bkText = `${effectiveDraft.bahanKajianContent} ${extraText}`.trim();
  const hasTopicStructure = /pokok\s*bahasan|bahan\s*kajian|materi\s*pembelajaran|1\.|2\.|3\./i.test(
    bkText
  );
  const hasReferenceStandard = /sni|puil|ieee|astm|iso|pp\s*no|jurnal|metcalf|ed\.|\b20\d{2}\b|et\s*al/i.test(
    bkText
  );
  const bkLen = effectiveDraft.bahanKajianContent.trim().length;

  let skorBahanKajian = 16;
  if (bkLen >= 90) skorBahanKajian += 32;
  else if (bkLen >= 45) skorBahanKajian += 18;
  else if (bkLen > 0) skorBahanKajian += 8;

  if (hasTopicStructure) skorBahanKajian += 24;
  if (hasReferenceStandard) skorBahanKajian += 28;
  skorBahanKajian = clamp100(skorBahanKajian);

  const skorTotalObe = clamp100(
    (skorCpl + skorCpmk + skorSubCpmk + skorAsesmen + skorBahanKajian) / 5
  );

  const predikatObe =
    skorTotalObe >= 85
      ? 'Unggul OBE'
      : skorTotalObe >= 75
      ? 'Selaras OBE'
      : skorTotalObe >= 60
      ? 'Perlu Revisi'
      : 'Kritis OBE';

  const aspekKuat: string[] = [];
  if (skorCpl >= 78) aspekKuat.push(`Komponen CPL terpetakan eksplisit (${skorCpl}/100).`);
  if (skorCpmk >= 78)
    aspekKuat.push(`Rumusan CPMK & taksonomi Bloom terukur (${skorCpmk}/100).`);
  if (skorSubCpmk >= 78)
    aspekKuat.push(`Sub-CPMK & metode pembelajaran aktif terinci (${skorSubCpmk}/100).`);
  if (skorAsesmen >= 78)
    aspekKuat.push(`Instrumen & bobot asesmen OBE lengkap 100% (${skorAsesmen}/100).`);
  if (skorBahanKajian >= 78)
    aspekKuat.push(`Bahan kajian & standar pustaka mutakhir (${skorBahanKajian}/100).`);
  if (aspekKuat.length === 0) {
    aspekKuat.push(`Identitas mata kuliah ${course.kodeMK} (${course.sks} SKS) siap diaudit.`);
  }

  const celahKesesuaian: string[] = [];
  const rekomendasiPerbaikan: AiRpsImprovementRecommendation[] = [];

  const targetCplsList =
    mappedCodes.length > 0
      ? mappedCodes
      : prodiCpls.slice(0, 2).map(c => c.kode);
  const cplSuggestedText = prodiCpls
    .filter(c => targetCplsList.includes(c.kode))
    .map(c => `${c.kode} [${course.pemetaanCpl[c.kode] || 'Medium'}]: ${c.judul}`)
    .join('; ');

  if (skorCpl < 82) {
    celahKesesuaian.push(
      `Komponen CPL (${skorCpl}/100): pemetaan kode CPL atau deskripsi relevansi MK belum eksplisit.`
    );
    rekomendasiPerbaikan.push({
      aspek: 'CPL',
      targetField: 'cplContent',
      prioritas: skorCpl < 65 ? 'Tinggi' : 'Sedang',
      rekomendasiKonkret: `Cantumkan seluruh kode CPL prodi (${targetCplsList.join(', ')}) beserta deskripsi kontribusi keilmuan mata kuliah ${course.namaMK}.`,
      saranKontenPengganti: `Mata kuliah ${course.namaMK} (${course.sks} SKS, Semester ${course.semester}) membekali mahasiswa penguasaan analisis, perancangan solusi rekayasa, dan aplikasi profesional sesuai kurikulum OBE.\nCPL Dibebankan: ${cplSuggestedText || 'CPL-01; CPL-02'}.`
    });
  }

  if (skorCpmk < 82) {
    const primaryCpl = targetCplsList[0] || 'CPL-01';
    const secondaryCpl = targetCplsList[1] || primaryCpl;
    celahKesesuaian.push(
      `Komponen CPMK (${skorCpmk}/100): jumlah butir CPMK, kata kerja Bloom C4–C5, atau tautan CPL masih kurang.`
    );
    rekomendasiPerbaikan.push({
      aspek: 'CPMK',
      targetField: 'cpmkContent',
      prioritas: skorCpmk < 65 ? 'Tinggi' : 'Sedang',
      rekomendasiKonkret:
        'Sertakan minimal 3 butir CPMK dengan kata kerja operasional Bloom C4–C5 yang ditautkan langsung ke kode CPL.',
      saranKontenPengganti: [
        `CPMK-1 (C3 - Penerapan) [CPL: ${primaryCpl}]: Mampu menerapkan prinsip fundamental dan formulasi matematis pada ${course.namaMK}.`,
        `CPMK-2 (C4 - Analisis) [CPL: ${secondaryCpl}]: Mampu menganalisis permasalahan teknik dan mengevaluasi parameter desain secara terukur.`,
        `CPMK-3 (C5 - Evaluasi/Perancangan) [CPL: ${targetCplsList.join(', ')}]: Mampu merancang solusi proyek rekayasa serta menyusun laporan teknis sesuai standar profesi.`
      ].join('\n')
    });
  }

  if (skorSubCpmk < 82) {
    celahKesesuaian.push(
      `Komponen Sub-CPMK (${skorSubCpmk}/100): tahapan kemampuan mingguan & metode Case Method / Project-Based belum terinci.`
    );
    rekomendasiPerbaikan.push({
      aspek: 'Sub-CPMK',
      targetField: 'subCpmkContent',
      prioritas: skorSubCpmk < 65 ? 'Tinggi' : 'Sedang',
      rekomendasiKonkret:
        'Jabarkan Sub-CPMK per tahapan minggu kuliah beserta indikator terukur dan metode aktif (Case Method / Project-Based Learning).',
      saranKontenPengganti: [
        `Sub-CPMK 1.1 (Mg 1-4): Indikator ketepatan formulasi model dasar ${course.namaMK} melalui diskusi terbimbing.`,
        `Sub-CPMK 2.1 (Mg 5-9): Indikator ketajaman analisis studi kasus industri menggunakan Case Method dan simulasi.`,
        `Sub-CPMK 3.1 (Mg 10-15): Indikator penyelesaian rancangan proyek tim (Project-Based Learning) dan presentasi evaluasi teknis.`
      ].join('\n')
    });
  }

  if (skorAsesmen < 82) {
    celahKesesuaian.push(
      `Komponen Asesmen (${skorAsesmen}/100): bobot belum genap 100% atau belum memadukan rubrik autentik Case/Project.`
    );
    rekomendasiPerbaikan.push({
      aspek: 'Asesmen',
      targetField: 'asesmenContent',
      prioritas: skorAsesmen < 65 ? 'Tinggi' : 'Sedang',
      rekomendasiKonkret:
        'Tetapkan instrumen asesmen autentik (Rubrik Case Method/Proyek + UTS/UAS) dengan distribusi bobot terukur berjumlah tepat 100%.',
      saranKontenPengganti: [
        `CPMK-1 (25%): Kuis & Latihan Analitik + UTS (Tes Tertulis Terstruktur).`,
        `CPMK-2 (35%): Case Method / Praktikum Lapangan (Rubrik Penilaian Analitik & Observasi).`,
        `CPMK-3 (40%): Project-Based Tugas Besar & UAS (Rubrik Produk Rancangan & Presentasi).`
      ].join('\n')
    });
  }

  if (skorBahanKajian < 82) {
    const stdRef =
      course.prodiId === 'SIPIL'
        ? 'SNI 2847:2019, SNI 1726:2019, & Modul Desain Struktur FT UNBARI (2024)'
        : course.prodiId === 'LINGKUNGAN'
        ? 'PP No. 22/2021, Standard Methods APHA, & Metcalf & Eddy (5th Ed.)'
        : 'PUIL 2020, IEEE Std 141, & Modul Sistem Kendali PLC/SCADA (2024)';
    celahKesesuaian.push(
      `Komponen Bahan Kajian (${skorBahanKajian}/100): pokok bahasan mingguan dan referensi standar teknik terkini masih minim.`
    );
    rekomendasiPerbaikan.push({
      aspek: 'Bahan Kajian',
      targetField: 'bahanKajianContent',
      prioritas: 'Sedang',
      rekomendasiKonkret:
        'Lengkapi daftar bahan kajian inti, integrasi studi kasus lapangan, dan pustaka/standar teknis terbaru (5 tahun terakhir).',
      saranKontenPengganti: `Pokok Bahasan & Bahan Kajian:\n1. Teori & Prinsip Dasar ${course.namaMK}\n2. Pemodelan Numerik & Analisis Studi Kasus Teknik\n3. Perancangan Terintegrasi & Standar K3/Mutu\nReferensi & Pustaka Utama: ${stdRef}.`
    });
  }

  if (rekomendasiPerbaikan.length === 0) {
    rekomendasiPerbaikan.push({
      aspek: 'Asesmen',
      targetField: 'asesmenContent',
      prioritas: 'Rendah',
      rekomendasiKonkret:
        'Kelima komponen OBE (CPL, CPMK, Sub-CPMK, Asesmen, Bahan Kajian) telah lengkap dan selaras; pertahankan rubrik portofolio akhir semester.',
      saranKontenPengganti: effectiveDraft.asesmenContent
    });
  }

  return {
    courseId: course.id,
    draftSignature: buildDraftSignature(effectiveDraft),
    source: 'LIVE_SCAN',
    skorTotalObe,
    skorCpl,
    skorCpmk,
    skorSubCpmk,
    skorAsesmen,
    skorBahanKajian,
    predikatObe,
    ringkasanAnalisisTeks: `Pemindaian real-time pada 5 komponen OBE menghasilkan skor kelengkapan ${skorTotalObe}/100 (${predikatObe}) — CPL ${skorCpl}, CPMK ${skorCpmk}, Sub-CPMK ${skorSubCpmk}, Asesmen ${skorAsesmen}, dan Bahan Kajian ${skorBahanKajian}.`,
    aspekKuat,
    celahKesesuaian,
    rekomendasiPerbaikan
  };
}

export async function evaluateRpsWithAi(params: {
  course: MataKuliahCplMatrixRecord;
  prodiNama: string;
  prodiCpls: CplItemObe[];
  draft: RpsDraftPayload;
}): Promise<AiRpsEvaluationResult> {
  const { course, prodiNama, prodiCpls, draft } = params;

  const cplTerkaitProdi = prodiCpls
    .filter(c => course.pemetaanCpl[c.kode] && course.pemetaanCpl[c.kode] !== 'None')
    .map(c => ({
      kode: c.kode,
      ranah: c.ranah,
      judul: c.judul,
      level: course.pemetaanCpl[c.kode]
    }));

  const response = await fetch('/api/ai/evaluate-rps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kodeMK: course.kodeMK,
      namaMK: course.namaMK,
      prodiNama,
      sks: course.sks,
      semester: course.semester,
      dosenPengampu: course.dosenPengampu,
      cplContent: draft.cplContent,
      cpmkContent: draft.cpmkContent,
      subCpmkContent: draft.subCpmkContent,
      asesmenContent: draft.asesmenContent,
      bahanKajianContent: draft.bahanKajianContent,
      deskripsiMk: draft.cplContent,
      metodePembelajaran: draft.subCpmkContent,
      instrumenAsesmen: draft.asesmenContent,
      daftarCpmk: course.cpmkList || [],
      cplTerkaitProdi,
      customRpsText: draft.customRpsText
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data?.error || `Server mengembalikan error HTTP ${response.status} saat mengevaluasi RPS.`
    );
  }

  const rawRecs = Array.isArray(data.rekomendasiPerbaikan) ? data.rekomendasiPerbaikan : [];
  const mappedRecs: AiRpsImprovementRecommendation[] = rawRecs.map((rec: any) => ({
    aspek: String(rec?.aspek || 'CPL'),
    targetField: mapAspectToDraftField(String(rec?.aspek || 'CPL')),
    prioritas: String(rec?.prioritas || 'Sedang'),
    rekomendasiKonkret: String(rec?.rekomendasiKonkret || ''),
    saranKontenPengganti: rec?.saranKontenPengganti
      ? String(rec.saranKontenPengganti)
      : undefined
  }));

  return {
    courseId: course.id,
    draftSignature: buildDraftSignature(draft),
    source: 'AI_GEMINI',
    skorTotalObe: clamp100(data.skorTotalObe),
    skorCpl: clamp100(data.skorCpl ?? data.skorTotalObe),
    skorCpmk: clamp100(data.skorCpmk ?? data.skorTotalObe),
    skorSubCpmk: clamp100(data.skorSubCpmk ?? data.skorTotalObe),
    skorAsesmen: clamp100(data.skorAsesmen ?? data.skorTotalObe),
    skorBahanKajian: clamp100(data.skorBahanKajian ?? data.skorTotalObe),
    predikatObe: data.predikatObe || 'Selaras OBE',
    ringkasanAnalisisTeks: data.ringkasanAnalisisTeks || '',
    aspekKuat: Array.isArray(data.aspekKuat) ? data.aspekKuat : [],
    celahKesesuaian: Array.isArray(data.celahKesesuaian) ? data.celahKesesuaian : [],
    rekomendasiPerbaikan: mappedRecs,
    evaluatedAt: data.evaluatedAt,
    modelUsed: data.modelUsed
  };
}
