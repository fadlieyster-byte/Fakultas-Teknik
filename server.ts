import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface EvaluateRpsRequestBody {
  kodeMK?: string;
  namaMK?: string;
  prodiNama?: string;
  sks?: number;
  semester?: number;
  dosenPengampu?: string;
  cplContent?: string;
  cpmkContent?: string;
  subCpmkContent?: string;
  asesmenContent?: string;
  bahanKajianContent?: string;
  deskripsiMk?: string;
  metodePembelajaran?: string;
  instrumenAsesmen?: string;
  daftarCpmk?: Array<{
    kode: string;
    deskripsi: string;
    levelBloom: string;
    cplTerkait: string[];
    metodeAsesmen: string;
    bobotPersen: number;
  }>;
  cplTerkaitProdi?: Array<{
    kode: string;
    ranah: string;
    judul: string;
    level: string;
  }>;
  customRpsText?: string;
}

function clampScore(value: unknown, fallback = 70): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(1, Math.min(100, Math.round(num)));
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'sikaprodi-ft-unbari' });
  });

  app.post('/api/ai/evaluate-rps', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error:
          'GEMINI_API_KEY belum tersedia di environment server. Periksa panel Settings > Secrets untuk mengaktifkan evaluasi AI.'
      });
      return;
    }

    const body = (req.body || {}) as EvaluateRpsRequestBody;
    if (!body.kodeMK && !body.namaMK && !body.customRpsText?.trim()) {
      res.status(400).json({
        error: 'Data RPS mata kuliah atau teks RPS tidak boleh kosong.'
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const cpmkSummary = (body.daftarCpmk || [])
      .map(
        c =>
          `- ${c.kode} (${c.levelBloom || 'C3'}, Bobot ${c.bobotPersen}%, CPL: ${(
            c.cplTerkait || []
          ).join(', ') || 'Belum dipetakan'}): ${c.deskripsi} | Asesmen: ${c.metodeAsesmen}`
      )
      .join('\n');

    const cplSummary = (body.cplTerkaitProdi || [])
      .map(c => `- ${c.kode} [${c.ranah} - ${c.level}]: ${c.judul}`)
      .join('\n');

    const promptText = `
Lakukan evaluasi kelengkapan dan kualitas RPS berdasarkan standar Outcome Based Education (OBE), IKU-7 (Case Method / Team-Based Project), dan akreditasi LAM-Teknik / IABEE pada 5 komponen wajib: CPL, CPMK, Sub-CPMK, Asesmen, dan Bahan Kajian.

DATA MATA KULIAH:
- Program Studi: ${body.prodiNama || 'Fakultas Teknik UNBARI'}
- Kode & Nama MK: ${body.kodeMK || '-'} - ${body.namaMK || '-'}
- Bobot / Semester: ${body.sks ?? '-'} SKS / Semester ${body.semester ?? '-'}
- Dosen Pengampu: ${body.dosenPengampu || '-'}

1. KOMPONEN CPL & DESKRIPSI MATA KULIAH:
${body.cplContent || body.deskripsiMk || '(Belum dirinci)'}

2. KOMPONEN CPMK (CAPAIAN PEMBELAJARAN MATA KULIAH):
${body.cpmkContent || cpmkSummary || '(Belum ada rincian CPMK)'}

3. KOMPONEN SUB-CPMK & METODE PEMBELAJARAN:
${body.subCpmkContent || body.metodePembelajaran || '(Belum dirinci secara eksplisit)'}

4. KOMPONEN ASESMEN (INSTRUMEN, RUBRIK & BOBOT PENILAIAN):
${body.asesmenContent || body.instrumenAsesmen || '(Belum dirinci)'}

5. KOMPONEN BAHAN KAJIAN (MATERI POKOK & REFERENSI PUSTAKA):
${body.bahanKajianContent || '(Belum dirinci)'}

REFERENSI CPL PRODI YANG DIBEBANKAN:
${cplSummary || '(Belum ada CPL terpetakan)'}

${
  body.customRpsText?.trim()
    ? `TEKS / DOKUMEN RPS TAMBAHAN:\n${body.customRpsText.trim()}`
    : ''
}

TUGAS EVALUASI:
1. Nilai kelengkapan & ketepatan 5 komponen OBE secara objektif pada skala 1-100:
   - skorCpl: kejelasan pembebanan CPL prodi & deskripsi MK.
   - skorCpmk: kejelasan rumusan CPMK, kata kerja Bloom terukur (C3-C6/P3-P4), dan tautan ke CPL.
   - skorSubCpmk: keterincian Sub-CPMK/kemampuan akhir tiap tahap beserta metode pembelajaran aktif (Case Method/Project/Lab).
   - skorAsesmen: kelengkapan instrumen asesmen autentik, rubrik penilaian, dan total bobot genap 100%.
   - skorBahanKajian: ketepatan pokok bahasan/bahan kajian, relevansi rekayasa terkini, dan referensi pustaka/standar teknis.
   - skorTotalObe: nilai agregat menyeluruh (1-100).
2. Berikan daftar rekomendasi perbaikan konten yang konkret dalam Bahasa Indonesia, dan untuk setiap rekomendasi sertakan contoh konten perbaikan siap pakai (saranKontenPengganti) agar dosen dapat langsung menerapkannya ke dalam draft RPS.
`.trim();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptText,
        config: {
          systemInstruction:
            'Anda adalah Auditor Kurikulum Outcome Based Education (OBE) & Asesor Akreditasi Teknik (LAM-Teknik / IABEE) di Fakultas Teknik Universitas Batanghari. Nilai kelengkapan komponen CPL, CPMK, Sub-CPMK, Asesmen, dan Bahan Kajian secara ketat, objektif, dan sertakan contoh teks revisi yang langsung bisa disalin ke RPS. Kembalikan hanya JSON sesuai skema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skorTotalObe: {
                type: Type.INTEGER,
                description: 'Skor keseluruhan kelengkapan & kualitas RPS OBE (1-100).'
              },
              skorCpl: {
                type: Type.INTEGER,
                description: 'Skor kelengkapan komponen CPL & deskripsi MK (1-100).'
              },
              skorCpmk: {
                type: Type.INTEGER,
                description: 'Skor kelengkapan komponen CPMK & taksonomi Bloom (1-100).'
              },
              skorSubCpmk: {
                type: Type.INTEGER,
                description: 'Skor kelengkapan komponen Sub-CPMK & metode pembelajaran (1-100).'
              },
              skorAsesmen: {
                type: Type.INTEGER,
                description: 'Skor kelengkapan komponen Asesmen, rubrik & bobot 100% (1-100).'
              },
              skorBahanKajian: {
                type: Type.INTEGER,
                description: 'Skor kelengkapan komponen Bahan Kajian & referensi pustaka (1-100).'
              },
              predikatObe: {
                type: Type.STRING,
                description: 'Salah satu dari: Unggul OBE, Selaras OBE, Perlu Revisi, atau Kritis OBE.'
              },
              ringkasanAnalisisTeks: {
                type: Type.STRING,
                description: 'Ringkasan analisis 2-3 kalimat tentang kelengkapan CPL, CPMK, Sub-CPMK, Asesmen, dan Bahan Kajian.'
              },
              aspekKuat: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Daftar 2-3 komponen RPS yang sudah lengkap dan selaras.'
              },
              celahKesesuaian: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Daftar 2-3 celah kelengkapan komponen OBE yang perlu dilengkapi.'
              },
              rekomendasiPerbaikan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    aspek: {
                      type: Type.STRING,
                      description: 'Salah satu dari: CPL, CPMK, Sub-CPMK, Asesmen, Bahan Kajian.'
                    },
                    prioritas: { type: Type.STRING },
                    rekomendasiKonkret: { type: Type.STRING },
                    saranKontenPengganti: {
                      type: Type.STRING,
                      description: 'Contoh rumusan konten perbaikan siap pakai untuk disisipkan ke RPS pada komponen tersebut.'
                    }
                  }
                },
                description: 'Daftar 3-5 saran perbaikan konten spesifik untuk masing-masing komponen OBE.'
              }
            }
          }
        }
      });

      const rawText = (response.text || '{}').trim();
      const parsed = JSON.parse(rawText);

      const skorCpl = clampScore(parsed.skorCpl, 74);
      const skorCpmk = clampScore(parsed.skorCpmk, 74);
      const skorSubCpmk = clampScore(parsed.skorSubCpmk, 70);
      const skorAsesmen = clampScore(parsed.skorAsesmen, 72);
      const skorBahanKajian = clampScore(parsed.skorBahanKajian, 72);
      const fallbackTotal = Math.round(
        (skorCpl + skorCpmk + skorSubCpmk + skorAsesmen + skorBahanKajian) / 5
      );
      const skorTotalObe = clampScore(parsed.skorTotalObe, fallbackTotal);

      let predikatObe = String(parsed.predikatObe || '').trim();
      if (!predikatObe) {
        predikatObe =
          skorTotalObe >= 85
            ? 'Unggul OBE'
            : skorTotalObe >= 75
            ? 'Selaras OBE'
            : skorTotalObe >= 60
            ? 'Perlu Revisi'
            : 'Kritis OBE';
      }

      res.json({
        skorTotalObe,
        skorCpl,
        skorCpmk,
        skorSubCpmk,
        skorAsesmen,
        skorBahanKajian,
        predikatObe,
        ringkasanAnalisisTeks:
          parsed.ringkasanAnalisisTeks ||
          'Evaluasi kelengkapan komponen OBE (CPL, CPMK, Sub-CPMK, Asesmen, Bahan Kajian) telah selesai dipindai.',
        aspekKuat: Array.isArray(parsed.aspekKuat) ? parsed.aspekKuat : [],
        celahKesesuaian: Array.isArray(parsed.celahKesesuaian) ? parsed.celahKesesuaian : [],
        rekomendasiPerbaikan: Array.isArray(parsed.rekomendasiPerbaikan)
          ? parsed.rekomendasiPerbaikan
          : [],
        evaluatedAt: new Date().toISOString(),
        modelUsed: 'gemini-4-hydrogen'
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Gagal menghubungi layanan AI Gemini.';
      const status =
        message.includes('403') || message.includes('PERMISSION_DENIED')
          ? 403
          : message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
          ? 429
          : 502;
      res.status(status).json({
        error: `Evaluasi AI gagal: ${message}`
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIKAPRODI server listening on http://0.0.0.0:${PORT}`);
  });
}

createApp().catch(err => {
  console.error('Failed to start SIKAPRODI server:', err);
  process.exit(1);
});
