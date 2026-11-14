export type HurufMutu = 
  | 'A' 
  | 'A-' 
  | 'B+' 
  | 'B' 
  | 'B-' 
  | 'C+' 
  | 'C' 
  | 'C-' 
  | 'D+' 
  | 'D' 
  | 'E';

export interface SkalaNilaiItem {
  huruf: HurufMutu;
  min: number;
  max: number;
  bobot: number;
  predikat: string;
  statusKelulusan: 'Lulus' | 'Lulus Bersyarat' | 'Tidak Lulus';
  keterangan: string;
}

/**
 * Standar Skala Penilaian Huruf Mutu & Bobot Akademik Universitas Batanghari (UNBARI)
 * Sesuai pedoman akademik Fakultas Teknik:
 * 80,00 - 100   : A  (4.00)
 * 77,50 - 79,99 : A- (3.75)
 * 75,00 - 77,49 : B+ (3.50)
 * 70,00 - 74,99 : B  (3.00)
 * 67,50 - 69,99 : B- (2.75)
 * 65,00 - 67,49 : C+ (2.50)
 * 60,00 - 64,99 : C  (2.00)
 * 57,50 - 59,99 : C- (1.75)
 * 55,00 - 57,49 : D+ (1.50)
 * 50,00 - 54,99 : D  (1.00)
 * <= 49,99      : E  (0.00)
 */
export const SKALA_NILAI_UNBARI: SkalaNilaiItem[] = [
  { huruf: 'A',  min: 80.00, max: 100.00, bobot: 4.00, predikat: 'Sangat Baik (Istimewa)', statusKelulusan: 'Lulus', keterangan: 'Lulus dengan kompetensi sangat tinggi' },
  { huruf: 'A-', min: 77.50, max: 79.99,  bobot: 3.75, predikat: 'Hampir Istimewa', statusKelulusan: 'Lulus', keterangan: 'Lulus dengan keunggulan akademik' },
  { huruf: 'B+', min: 75.00, max: 77.49,  bobot: 3.50, predikat: 'Sangat Memuaskan', statusKelulusan: 'Lulus', keterangan: 'Lulus dengan capaian sangat memuaskan' },
  { huruf: 'B',  min: 70.00, max: 74.99,  bobot: 3.00, predikat: 'Baik / Memuaskan', statusKelulusan: 'Lulus', keterangan: 'Lulus dengan capaian baik' },
  { huruf: 'B-', min: 67.50, max: 69.99,  bobot: 2.75, predikat: 'Cukup Baik', statusKelulusan: 'Lulus', keterangan: 'Lulus dengan capaian cukup baik' },
  { huruf: 'C+', min: 65.00, max: 67.49,  bobot: 2.50, predikat: 'Lebih dari Cukup', statusKelulusan: 'Lulus', keterangan: 'Lulus memenuhi standar kelulusan' },
  { huruf: 'C',  min: 60.00, max: 64.99,  bobot: 2.00, predikat: 'Cukup', statusKelulusan: 'Lulus', keterangan: 'Batas minimal kelulusan mata kuliah' },
  { huruf: 'C-', min: 57.50, max: 59.99,  bobot: 1.75, predikat: 'Kurang Cukup', statusKelulusan: 'Lulus Bersyarat', keterangan: 'Lulus bersyarat (remedial/perbaikan)' },
  { huruf: 'D+', min: 55.00, max: 57.49,  bobot: 1.50, predikat: 'Kurang', statusKelulusan: 'Lulus Bersyarat', keterangan: 'Kurang memadai (wajib perbaikan)' },
  { huruf: 'D',  min: 50.00, max: 54.99,  bobot: 1.00, predikat: 'Sangat Kurang', statusKelulusan: 'Tidak Lulus', keterangan: 'Tidak memenuhi syarat kelulusan' },
  { huruf: 'E',  min: 0.00,  max: 49.99,  bobot: 0.00, predikat: 'Gagal', statusKelulusan: 'Tidak Lulus', keterangan: 'Tidak lulus (harus mengulang mata kuliah)' },
];

/**
 * Konversi nilai angka (0 - 100) ke format skala huruf mutu UNBARI
 */
export function hitungSkalaNilai(score: number): SkalaNilaiItem {
  const rounded = Number((Math.round(score * 100) / 100).toFixed(2));
  if (rounded >= 80.00) return SKALA_NILAI_UNBARI[0];
  if (rounded >= 77.50) return SKALA_NILAI_UNBARI[1];
  if (rounded >= 75.00) return SKALA_NILAI_UNBARI[2];
  if (rounded >= 70.00) return SKALA_NILAI_UNBARI[3];
  if (rounded >= 67.50) return SKALA_NILAI_UNBARI[4];
  if (rounded >= 65.00) return SKALA_NILAI_UNBARI[5];
  if (rounded >= 60.00) return SKALA_NILAI_UNBARI[6];
  if (rounded >= 57.50) return SKALA_NILAI_UNBARI[7];
  if (rounded >= 55.00) return SKALA_NILAI_UNBARI[8];
  if (rounded >= 50.00) return SKALA_NILAI_UNBARI[9];
  return SKALA_NILAI_UNBARI[10];
}

/**
 * Helper untuk format label baris skala nilai
 */
export function formatRentangNilai(item: SkalaNilaiItem): string {
  if (item.huruf === 'E') {
    return '<= 49,99';
  }
  return `${item.min.toFixed(2).replace('.', ',')} - ${item.max.toFixed(2).replace('.', ',')}`;
}
