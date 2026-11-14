export type StatusMahasiswa = 'Aktif' | 'Berisiko' | 'Cuti' | 'Tugas Akhir' | 'Lulus' | 'Non-Aktif' | 'Pindah';

export type UserRole = 'dekan' | 'kaprodi' | 'dosen' | 'staff' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  roleLabel: string;
  nidn?: string;
  nip?: string;
  prodiId?: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3' | 'SEMUA_FT';
  prodiNama?: string;
  photoURL?: string;
  jabatan: string;
  authProvider: 'firebase_google' | 'credential' | 'demo';
}

export type KategoriAgendaAkademik = 'Ujian' | 'Seminar' | 'Libur' | 'Kegiatan Prodi';
export type RentangWaktuAgenda = 'mingguan' | 'bulanan' | 'semua';

export interface AgendaAkademik {
  id: string;
  judul: string;
  kategori: KategoriAgendaAkademik;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  hari: string;
  jam: string;
  lokasi: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3' | 'SEMUA_FT';
  keterangan: string;
  penanggungJawab: string;
  sifat: 'Wajib' | 'Pilihan' | 'Fakultas' | 'Nasional';
  badgeLabel?: string;
}

export type StatusKehadiranDosen = 
  | 'Sedang Mengajar' 
  | 'Ada di Ruang Dosen' 
  | 'Bimbingan Mahasiswa' 
  | 'Izin / Tugas Luar' 
  | 'Belum Hadir';

export type StatusKetersediaanSlot = 'bersedia_penuh' | 'tidak_bersedia' | 'jam_khusus';

export interface HariKetersediaan {
  status: StatusKetersediaanSlot;
  jam?: string; // e.g. "09.00 – 12.00"
  keterangan?: string; // e.g. "Ada jadwal mengajar 08.00 - 10.30"
}

export interface KetersediaanJadwalDosen {
  id: string;
  dosenId: string;
  nidn: string;
  namaDosen: string;
  gelar: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  senin: HariKetersediaan;
  selasa: HariKetersediaan;
  rabu: HariKetersediaan;
  kamis: HariKetersediaan;
  jumat: HariKetersediaan;
  sabtu: HariKetersediaan;
  catatanKhusus?: string;
  terakhirDiperbarui?: string;
}

export type HariKuliah = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  programStudi: string;
  jenjang: 'S1' | 'D3';
  angkatan: number;
  semester: number;
  ipk: number;
  sksLulus: number;
  sksSemesterIni: number;
  sksTargetLulus: number; // 144 SKS untuk S1, 110 SKS untuk D3
  status: StatusMahasiswa;
  dosenPA: string; // NIDN / Nama Dosen PA
  email: string;
  nomorHp: string;
  kehadiranPersen: number;
  konsentrasi: string;
  jenisKelamin?: 'L' | 'P';
  jenisKelas?: 'Reguler' | 'Karyawan';
  asalSekolah?: string;
  tahunAkademik?: string;
  judulTA?: string;
  dosenPembimbingTA?: string;
  progressTA?: 'Belum Mengambil' | 'Pengajuan Proposal' | 'Bimbingan Bab 1-3' | 'Seminar Hasil' | 'Sidang Meja Hijau' | 'Lulus Yudisium';
  catatanAkademik?: string;
  peringatanSp: number; // 0: None, 1: SP1, 2: SP2, 3: SP3/Warning DO
}

export interface Dosen {
  id: string;
  nidn: string;
  nuptk?: string;
  namaLengkap: string;
  gelar: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  programStudi?: string;
  jabatanFungsional: 'Asisten Ahli' | 'Lektor' | 'Lektor Kepala' | 'Guru Besar';
  golongan?: string;
  pendidikanTerakhir?: string;
  email: string;
  noHp: string;
  keahlian: string;
  statusRealTime: StatusKehadiranDosen;
  lokasiTerkini: string;
  totalSksMengajar: number;
  jumlahMahasiswaBimbingan: number;
  kehadiranBapPersen: number;
  fotoUrl?: string;
}

export interface JadwalKuliah {
  id: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  kodeMK: string;
  namaMK: string;
  sks: number;
  kelas: string;
  hari: HariKuliah;
  jamMulai: string; // "08:00"
  jamSelesai: string; // "10:30"
  ruanganId: string;
  ruanganNama: string;
  dosenNidn: string;
  dosenNama: string;
  pesertaTotal: number;
  programStudi: string;
  statusSesi: 'Belum Mulai' | 'Sedang Berlangsung' | 'Selesai' | 'Ditiadakan' | 'Diganti';
  bapStatus: 'Belum Diisi' | 'Menunggu Verifikasi Kaprodi' | 'Terverifikasi';
  topikPertemuan?: string;
  pertemuanKe?: number;
  jenisKelas?: 'REG' | 'KAR' | 'Reguler' | 'Karyawan';
  kuota?: number;
  terdaftar?: number;
}

export interface LogPresensiDosen {
  id: string;
  dosenId?: string;
  dosenNidn: string;
  dosenNama: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  jadwalId: string;
  kodeMK: string;
  namaMK: string;
  sks: number;
  kelas: string;
  ruanganNama: string;
  tanggal: string; // YYYY-MM-DD
  mingguKe: number; // 1 - 16
  hari: HariKuliah;
  jamMulaiRencana: string; // e.g. "08:00"
  jamSelesaiRencana: string; // e.g. "09:40"
  jamMasukAktual: string; // e.g. "07:56"
  jamKeluarAktual: string; // e.g. "09:41"
  durasiMenit: number; // e.g. 105 menit
  durasiJam: number; // e.g. 1.75 jam
  durasiTargetMenit: number; // e.g. 100 menit (sks * 50)
  statusKehadiran: 'Hadir Tepat Waktu' | 'Hadir Terlambat' | 'Diganti / Kuliah Pengganti' | 'Ditiadakan';
  bapStatus: 'Terverifikasi' | 'Menunggu Verifikasi Kaprodi' | 'Belum Diisi';
  materiKuliah: string;
  jumlahMahasiswaHadir: number;
  jumlahMahasiswaTotal: number;
  catatanVerifikator?: string;
  waktuVerifikasi?: string;
}

export interface RekapMingguanDosen {
  dosenNidn: string;
  dosenNama: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  jabatanFungsional: string;
  totalSksMengajar: number;
  mingguKe: number;
  targetDurasiMenit: number; // totalSksMengajar * 50
  realisasiDurasiMenit: number;
  realisasiDurasiJam: number;
  persenKehadiran: number;
  jumlahKelasTerjadwal: number;
  jumlahKelasTerlaksana: number;
  jumlahBapTerverifikasi: number;
  statusKepatuhan: 'Sangat Baik' | 'Memenuhi Standar BKD' | 'Perlu Perhatian' | 'Kurang Jam Mengajar';
  logs: LogPresensiDosen[];
}

export interface JadwalSidangTA {
  id: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  nim: string;
  namaMahasiswa: string;
  jenjang: 'S1' | 'D3';
  tipeSidang: 'Seminar Proposal' | 'Seminar Hasil' | 'Sidang Meja Hijau / Skripsi' | 'Sidang Proyek Akhir';
  judulTA: string;
  tanggal: string; // "2026-10-21"
  hari: HariKuliah;
  jamMulai: string; // "09:00"
  jamSelesai: string; // "11:00"
  ruangan: string;
  pembimbing1: string;
  pembimbing2?: string;
  penguji1: string;
  penguji2: string;
  ketuaSidang: string;
  status: 'Terjadwal' | 'Sedang Berlangsung' | 'Lulus Tanpa Revisi' | 'Lulus Dengan Revisi' | 'Mengulang';
  nilaiAkhir?: number; // 0 - 100
  catatanRevisi?: string;
}

export interface JadwalKerjaPraktek {
  id: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  nim: string;
  namaMahasiswa: string;
  instansiPerusahaan: string;
  lokasiKota: string;
  posisiProyek: string;
  periodeMulai: string;
  periodeSelesai: string;
  dosenPembimbing: string;
  pembimbingLapangan: string;
  status: 'Sedang Berjalan di Lapangan' | 'Penyusunan Laporan' | 'Menunggu Seminar KP' | 'Selesai & Dinilai';
  tanggalSeminar?: string;
  hariSeminar?: HariKuliah;
  jamSeminar?: string;
  ruangSeminar?: string;
  dosenPengujiKP?: string;
  nilaiHuruf?: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E' | 'Belum Dinilai';
  catatanKaprodi?: string;
}

export interface RuanganLab {
  id: string;
  kode: string;
  nama: string;
  prodiId?: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3' | 'UMUM';
  tipe: 'Laboratorium' | 'Ruang Teori' | 'Studio' | 'Workshop' | 'Auditorium';
  gedung: string;
  lantai: number;
  kapasitas: number;
  fasilitas: string[];
  statusSaatIni: 'Terpakai' | 'Tersedia' | 'Maintenance';
  jadwalAktifSaatIni?: {
    matakuliah: string;
    dosen: string;
    kelas: string;
    jam: string;
  };
}

export interface PeringatanAkademik {
  id: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  mahasiswaId: string;
  nim: string;
  namaMahasiswa: string;
  tipe: 'IPK Rendah' | 'SKS Kurang' | 'Masa Studi Kritis' | 'Presensi Rendah' | 'BAP Terlambat';
  deskripsi: string;
  level: 'Perhatian' | 'Kritis' | 'Tindakan Segera';
  tanggal: string;
  sudahDitindaklanjuti: boolean;
}

export interface ProgramStudiInfo {
  id: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  nama: string;
  singkatan: string;
  jenjang: 'S1' | 'D3';
  fakultas: string;
  akreditasi: string;
  kaprodi: string;
  gelarKaprodi: string;
  nipKaprodi: string;
  fotoKaprodi: string;
  totalMahasiswa: number;
  totalDosen: number;
  sksKelulusan: number;
}

export type PredikatKelulusan = 'Dengan Pujian (Cum Laude)' | 'Sangat Memuaskan' | 'Memuaskan';
export type StatusVerifikasiYudisium = 'Menunggu Verifikasi' | 'Berkas Lengkap' | 'Disahkan Dekan';
export type StatusWisuda = 'Belum Terdaftar' | 'Terdaftar Wisuda' | 'Toga Diambil' | 'Selesai Wisuda';
export type UkuranToga = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface SyaratKelengkapanYudisium {
  bebasPustaka: boolean;
  bebasLab: boolean;
  bebasKeuangan: boolean;
  bebasPlagiarisme: boolean; // Turnitin < 20%
  unggahJurnalRepository: boolean;
  fotoIjazah: boolean;
}

export interface YudisiumRecord {
  id: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  mahasiswaId: string;
  nim: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  angkatan: number;
  jenjang: 'S1' | 'D3';
  programStudi: string;
  ipk: number;
  sksLulus: number;
  lamaStudi: string; // misal "3 Tahun 10 Bulan"
  predikat: PredikatKelulusan;
  gelarLulusan: string; // 'S.T.' | 'A.Md.T.'
  tanggalYudisium: string; // YYYY-MM-DD
  nomorSkYudisium: string;
  nomorIjazahNasional: string; // PIN PDDikti
  nomorSeriIjazah: string;
  nomorTranskrip: string;
  judulSkripsi: string;
  dosenPembimbing1: string;
  dosenPembimbing2?: string;
  statusVerifikasi: StatusVerifikasiYudisium;
  syaratKelengkapan: SyaratKelengkapanYudisium;
  statusWisuda: StatusWisuda;
  periodeWisuda: string;
  ukuranToga: UkuranToga;
  catatan?: string;
  isLulusanTerbaik?: boolean;
}

export interface PeriodeYudisium {
  id: string;
  namaPeriode: string;
  tahunAkademik: string;
  semester: 'Ganjil' | 'Genap';
  tanggalPelaksanaan: string;
  nomorSkDekan: string;
  status: 'Pendaftaran Dibuka' | 'Sidang Yudisium' | 'Selesai / Terbit SK';
  kuotaWisuda: number;
  keterangan: string;
}

// ==========================================
// TATA USAHA (TU) & ADMINISTRASI FAKULTAS
// ==========================================
export type JenisSuratTU = 
  | 'Surat Keterangan Aktif Kuliah' 
  | 'Surat Pengantar Kerja Praktik (KP)' 
  | 'Surat Izin Penelitian / Data TA' 
  | 'Surat Pengantar Cuti Akademik' 
  | 'Surat Rekomendasi Beasiswa' 
  | 'Surat Tugas Dosen'
  | 'Surat Keputusan (SK) Mengajar'
  | 'Surat Keputusan (SK) Bimbingan'
  | 'Surat Keputusan (SK) Yudisium';

export type StatusSuratTU = 
  | 'Diajukan' 
  | 'Diproses TU' 
  | 'Menunggu TTD Dekan' 
  | 'Selesai & Diterbitkan' 
  | 'Ditolak';

export interface SuratPermohonanTU {
  id: string;
  nomorSurat: string;
  jenisSurat: JenisSuratTU;
  pemohonNama: string;
  pemohonNimNidn: string;
  pemohonKategori: 'Mahasiswa' | 'Dosen';
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  programStudi: string;
  keperluan: string;
  tujuanInstansi?: string;
  tanggalPengajuan: string;
  tanggalSelesai?: string;
  status: StatusSuratTU;
  catatanTU?: string;
  dataTambahan?: {
    semester?: number;
    tahunAkademik?: string;
    namaOrangTua?: string;
    pekerjaanOrangTua?: string;
    instansiOrangTua?: string;
    lokasiPenelitian?: string;
    judulPenelitian?: string;
    anggota?: string[];
    // SK specific metadata
    isSkDekan?: boolean;
    kodeKlasifikasiSk?: string;
    jenisSkDokumen?: 'SK Mengajar' | 'SK Bimbingan' | 'SK Yudisium';
    dosenPembimbing1?: string;
    dosenPembimbing2?: string;
    mataKuliah?: string;
    sks?: number;
    jumlahPeserta?: number;
    predikatKelulusan?: string;
  };
}

export type TipeSuratAgenda = 'Masuk' | 'Keluar';
export type KategoriSuratAgenda = 
  | 'Rektorat / Yayasan' 
  | 'LLDIKTI / Kemendikbud' 
  | 'Instansi Mitra / Industri' 
  | 'Kemahasiswaan' 
  | 'Akademik & Akreditasi';

export interface SuratAgendaTU {
  id: string;
  tipe: TipeSuratAgenda;
  nomorAgenda: string;
  nomorSuratAsli: string;
  tanggalSurat: string;
  tanggalDiterima: string;
  pengirimAtauTujuan: string;
  perihal: string;
  kategori: KategoriSuratAgenda;
  disposisiDekan?: {
    tujuanDisposisi: string; // e.g. "Wakil Dekan I", "Kaprodi Teknik Sipil", "Kabag TU"
    instruksi: string; // e.g. "Tindaklanjuti segera", "Hadir mewakili Dekan", "Pelajari & beri telaah"
    catatan: string;
    tanggalDisposisi: string;
  };
  status: 'Baru' | 'Didisposisikan' | 'Dalam Proses' | 'Selesai';
}

export type StatusPeminjamanSarpras = 
  | 'Menunggu Persetujuan' 
  | 'Disetujui KTU' 
  | 'Sedang Digunakan' 
  | 'Dikembalikan & Selesai' 
  | 'Ditolak';

export interface PeminjamanSarprasTU {
  id: string;
  namaPeminjam: string;
  nimNidn: string;
  kontakHp: string;
  unitOrmawa: string; // e.g. "Himpunan Mahasiswa Sipil (HMS)", "BEM FT UNBARI", "Dosen"
  itemFasilitas: string; // e.g. "Ruang Rapat Dekanat", "Aula Gedung E", "Proyektor & Sound System"
  tanggalKegiatan: string;
  waktuMulai: string;
  waktuSelesai: string;
  keperluanAcara: string;
  status: StatusPeminjamanSarpras;
  catatanKTU?: string;
}

// ==========================================
// PIMPINAN FAKULTAS TEKNIK UNBARI
// ==========================================
export interface PimpinanFakultasAnggota {
  nama: string;
  gelar: string;
  jabatan: string;
  bidang: string;
  nidn: string;
  nuptk?: string;
  email: string;
  noHp?: string;
  fotoUrl?: string;
}

export interface PimpinanFakultasTeknik {
  dekan: PimpinanFakultasAnggota;
  wakilDekan1: PimpinanFakultasAnggota;
  wakilDekan2: PimpinanFakultasAnggota;
  wakilDekan3: PimpinanFakultasAnggota;
}

// ==========================================
// MODUL KEUANGAN FAKULTAS TEKNIK UNBARI
// ==========================================
export type StatusPembayaranUkt = 'Lunas' | 'Cicilan' | 'Dispensasi' | 'Menunggak';
export type MetodePembayaran = 'Bank BNI' | 'Bank Mandiri' | 'Bank Nagari / BPD' | 'Kasir Rektorat UNBARI' | 'Virtual Account';

export interface ItemKomponenUangKuliah {
  no: number;
  namaItem: string;
  nominal: number;
  keterangan: string;
  kategori: 'Pokok Perkuliahan' | 'Pengembangan Kampus' | 'Administrasi & Registrasi' | 'Kemahasiswaan' | 'Lainnya';
  isWajib: boolean;
}

export interface TagihanUktMahasiswa {
  id: string;
  nim: string;
  namaMahasiswa: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  angkatan: number;
  semester: number;
  tahunAkademik: string; // e.g. "2025/2026 Ganjil"
  nominalTagihan: number; // e.g. 3750000 or 6206500
  nominalTerbayar: number;
  sisaTunggakan: number;
  status: StatusPembayaranUkt;
  tanggalBayarTerakhir?: string;
  nomorTransaksiBank?: string;
  metodePembayaran?: MetodePembayaran;
  bebasKeuanganUjian: boolean; // Syarat sempro/sidang TA/yudisium
  catatanDispensasi?: string;
  rincianKomponen?: ItemKomponenUangKuliah[];
}

export type JenisHonorDosen = 
  | 'Honor Mengajar SKS' 
  | 'Honor Penguji Sidang TA' 
  | 'Honor Penguji Seminar Proposal' 
  | 'Honor Pembimbing Utama Skripsi' 
  | 'Honor Pembimbing Pendamping';

export type StatusPencairanHonor = 'Siap Dicairkan' | 'Dalam Proses Bagian Keuangan' | 'Sudah Ditransfer';

export interface HonorariumDosenRecord {
  id: string;
  nidn: string;
  namaDosen: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  jenisHonor: JenisHonorDosen;
  deskripsi: string; // e.g. "Penguji Sidang Skripsi - 4 Mahasiswa Prodi Sipil"
  volume: number; // e.g. 4
  satuan: string; // "Mahasiswa" / "SKS"
  tarifSatuan: number; // e.g. 200000
  totalBruto: number;
  potonganPph21: number; // 5%
  totalNetto: number;
  status: StatusPencairanHonor;
  periodeBulan: string; // "Oktober 2026"
  tanggalPencairan?: string;
  nomorRekening: string;
  namaBank: string;
}

export interface AnggaranProdiLab {
  id: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3' | 'UMUM';
  namaPosAnggaran: string;
  kategori: 'Praktikum & Laboratorium' | 'Operasional Prodi' | 'Akreditasi & Kurikulum' | 'Kegiatan Mahasiswa';
  paguAnggaran: number;
  realisasiTerpakai: number;
  sisaAnggaran: number;
  persentaseSerapan: number;
  penanggungJawab: string;
}

export interface ProyeksiKebutuhanLab {
  id: string;
  labId: string;
  namaLab: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3' | 'UMUM';
  kepalaLab: string;
  sisaPlafonTersedia: number;
  proyeksiKebutuhan: number;
  rincianKebutuhan: {
    bahanHabisPakai: number;
    kalibrasiPemeliharaan: number;
    k3DanPenggantianAlat: number;
    lisensiSoftware: number;
  };
  catatanKebutuhan: string;
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
}

export interface TrenRealisasiAnggaranProdi {
  tahun: string;
  sipilPagu: number;
  sipilRealisasi: number;
  lingkunganPagu: number;
  lingkunganRealisasi: number;
  listrikPagu: number;
  listrikRealisasi: number;
  umumPagu: number;
  umumRealisasi: number;
  totalPagu: number;
  totalRealisasi: number;
  persenTotal: number;
}

// ==========================================
// MODUL SKPI (SURAT KETERANGAN PENDAMPING IJAZAH)
// Standar Permendikbud / KKNI Level 6 (S1) & Level 5 (D3)
// ==========================================
export type StatusSkpi = 'Draft' | 'Diajukan Mahasiswa' | 'Verifikasi Kaprodi' | 'Disahkan Dekan' | 'Diterbitkan';

export interface CapaianPembelajaranSkpi {
  kategori: 'Kemampuan Kerja' | 'Penguasaan Pengetahuan' | 'Sikap Khusus & Manajerial';
  deskripsiIndo: string;
  deskripsiInggris: string;
}

export interface SertifikasiKompetensiSkpi {
  id: string;
  namaSertifikatIndo: string;
  namaSertifikatInggris: string;
  penerbit: string; // e.g. "LPJK - Lembaga Pengembangan Jasa Konstruksi", "BNSP", "Autodesk"
  nomorSertifikat: string;
  tahunPerolehan: number;
  masaBerlaku?: string;
}

export interface PrestasiMahasiswaSkpi {
  id: string;
  namaPrestasiIndo: string;
  namaPrestasiInggris: string;
  tingkat: 'Lokal / Kampus' | 'Provinsi' | 'Nasional' | 'Internasional';
  peringkat: string; // e.g. "Juara I", "Finalis", "Awardee"
  penyelenggara: string;
  tahun: number;
}

export interface AktivitasOrmawaSkpi {
  id: string;
  namaOrganisasiIndo: string;
  namaOrganisasiInggris: string;
  jabatan: string; // e.g. "Ketua Divisi Riset & Teknologi", "Sekretaris Umum"
  periode: string; // e.g. "2023 - 2024"
  kategori: 'Organisasi Kampus' | 'Kepanitiaan' | 'Pengabdian Masyarakat / Relawan';
}

export interface SkpiRecord {
  id: string;
  nomorSkpi: string; // e.g. "SKPI/FT-UNBARI/2026/089"
  nomorIjazahNasional: string; // PIN PDDikti
  nim: string;
  namaMahasiswa: string;
  tempatTanggalLahir: string;
  tahunMasuk: number;
  tahunLulus: number;
  gelarAkademik: string; // "Sarjana Teknik (S.T.)" / "Ahli Madya Teknik (A.Md.T.)"
  gelarInggris: string; // "Bachelor of Engineering (B.Eng.)" / "Associate Expert in Engineering (A.Md.T.)"
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  programStudi: string;
  programStudiInggris: string;
  jenjangKkni: 'Level 6 (Sarjana)' | 'Level 5 (Diploma III)';
  levelKkniAngka: 6 | 5;
  persyaratanPenerimaan: string;
  persyaratanPenerimaanInggris: string;
  bahasaPengantar: string;
  sistemPenilaian: string;
  jenisDanJenjangPendidikanLanjutan: string;
  cplList: CapaianPembelajaranSkpi[];
  sertifikasiList: SertifikasiKompetensiSkpi[];
  prestasiList: PrestasiMahasiswaSkpi[];
  ormawaList: AktivitasOrmawaSkpi[];
  status: StatusSkpi;
  tanggalPenerbitan: string;
  penandatanganNama: string;
  penandatanganJabatan: string;
  penandatanganNipNidn: string;
  catatanVerifikasi?: string;
}
// ==========================================
// MODUL AKREDITASI LAM-TEKNIK & KURIKULUM OBE
// Standar 9 Kriteria Lembaga Akreditasi Mandiri Program Studi Keteknikan
// ==========================================
export type KriteriaAkreditasiId = 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6' | 'K7' | 'K8' | 'K9';
export type StatusAkreditasiKriteria = 'Memenuhi Unggul' | 'Baik Sekali' | 'Baik' | 'Perlu Pemenuhan';

export interface ButirCplObe {
  kode: string; // e.g. "CPL-01"
  ranah: 'Sikap & Tata Nilai' | 'Penguasaan Pengetahuan' | 'Keterampilan Khusus' | 'Keterampilan Umum';
  deskripsi: string;
  targetPersen: number; // e.g. 75
  realisasiPersen: number; // e.g. 84.2
  status: 'Tercapai' | 'Mendekati Target' | 'Perlu Penguatan';
  mataKuliahPendukung: string[];
}

export interface KriteriaAkreditasiRecord {
  id: KriteriaAkreditasiId;
  nomor: number;
  nama: string;
  deskripsi: string;
  bobotPersen: number;
  skorSkala4: number; // 0 - 4.00
  status: StatusAkreditasiKriteria;
  dokumenTersedia: number;
  dokumenDibutuhkan: number;
  catatanAsesorInternal: string;
  rekomendasiPerbaikan: string;
  indikatorKunci: string[];
}

export interface BorangAkreditasiProdi {
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  namaProdi: string;
  jenjang: 'S1' | 'D3';
  peringkatSaatIni: string;
  targetPeringkat: string;
  skorTotalProyeksi: number; // skala 400 (e.g. 368.5)
  predikatProyeksi: 'Unggul' | 'Baik Sekali' | 'Baik';
  tanggalKadaluarsa: string;
  kriteriaList: KriteriaAkreditasiRecord[];
  cplList: ButirCplObe[];
}

// ==========================================
// VERIFIKASI DOKUMEN DIGITAL (QR CODE)
// ==========================================
export type StatusKeaslianDokumen = 'TERDAFTAR_VALID' | 'DIBATALKAN' | 'TIDAK_DITEMUKAN';

export interface DokumenVerifikasiRecord {
  kodeVerifikasi: string; // e.g. "FT-UNBARI/2026/BA-SKR/042"
  jenisDokumen: 
    | 'Berita Acara Sidang Skripsi' 
    | 'Surat Keterangan Aktif Kuliah' 
    | 'Rekomendasi Kelayakan Yudisium' 
    | 'SKPI Resmi FT UNBARI' 
    | 'Surat Peringatan Evaluasi Studi' 
    | 'Kuitansi Dispensasi Pembayaran'
    | 'Laporan Borang Akreditasi LAM-Teknik';
  nomorSurat: string;
  namaMahasiswa: string;
  nim: string;
  prodi: string;
  pejabatPenandatangan: string;
  jabatanPejabat: string;
  tanggalTerbit: string;
  statusKeaslian: StatusKeaslianDokumen;
  hashKeamanan: string;
  ringkasanIsi: string;
}

// ==========================================
// EARLY WARNING SYSTEM (EWS) MAHASISWA KRITIS
// ==========================================
export interface MahasiswaKritisWarning {
  id: string;
  nim: string;
  nama: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  programStudi: string;
  semester: number;
  ipk: number;
  sksLulus: number;
  sksTertinggal: number;
  tingkatRisiko: 'Kritis (Risiko DO)' | 'Waspada' | 'Perhatian';
  kategoriMasalah: string;
  dosenPA: string;
  suratSpTerbit: 'Belum Ada' | 'SP 1' | 'SP 2' | 'Peringatan Terakhir DO';
  rencanaAksi: string;
}

// ==========================================
// AUDIT KEHADIRAN MENDADAK (SIDAK KELAS)
// ==========================================
export type StatusPresensiSidak = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface DetailPresensiSidakMhs {
  nim: string;
  nama: string;
  statusPresensi: StatusPresensiSidak;
  kehadiranAwalPersen: number;
  kehadiranAkhirPersen: number;
  catatan?: string;
  isPeringatanDiterbitkan?: boolean;
}

export interface AuditSidakKehadiran {
  id: string;
  nomorBeritaAcara: string; // e.g. "BA-SIDAK/FT-UNBARI/2026/XI/001"
  tanggal: string; // "2026-11-04"
  jam: string; // "09:30 WIB"
  hari: HariKuliah;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  jadwalId: string;
  kodeMK: string;
  namaMK: string;
  kelas: string;
  ruanganNama: string;
  dosenNama: string;
  dosenNidn?: string;
  auditorNama: string;
  auditorJabatan: string; // e.g. "Gugus Kendali Mutu FT UNBARI" / "Kaprodi"
  totalMahasiswaKelas: number;
  jumlahHadir: number;
  jumlahIzin: number;
  jumlahSakit: number;
  jumlahAlpa: number;
  persentaseKehadiranSidak: number;
  statusKesesuaianDosen: 'Tepat Waktu' | 'Terlambat (<15 mnt)' | 'Digantikan Asisten' | 'Dosen Tidak Hadir';
  catatanAudit: string;
  rekomendasiTindakLanjut: string;
  detailPresensi: DetailPresensiSidakMhs[];
  peringatanGeneratedIds: string[];
}

// ==========================================
// LMS (Learning Management System) Interfaces
// ==========================================

export interface LmsMateriKuliah {
  id: string;
  judul: string;
  tipe: 'PDF' | 'PPTX' | 'Video' | 'Link' | 'GoogleDrive';
  fileUrl?: string;
  fileSize?: string;
  keterangan?: string;
}

export interface LmsPertemuan {
  id: string;
  pertemuanKe: number;
  tanggal: string;
  topik: string;
  subTopik: string;
  cpmkTarget: string; // e.g. "CPMK-1, CPMK-2 (IABEE Criteria 3.a)"
  metode: 'Tatap Muka' | 'Daring (Google Meet)' | 'Hybrid' | 'Praktikum Lab';
  status: 'Selesai' | 'Sedang Berlangsung' | 'Terjadwal' | 'Ditiadakan';
  materiList: LmsMateriKuliah[];
  kehadiranHadir: number;
  kehadiranSakit: number;
  kehadiranIzin: number;
  kehadiranAlpa: number;
  totalMahasiswa: number;
  catatanDosen?: string;
}

export interface LmsTugasPengumpulan {
  id: string;
  mahasiswaNim: string;
  mahasiswaNama: string;
  tanggalKumpul: string;
  fileUrl?: string;
  status: 'Sudah Mengumpulkan' | 'Terlambat' | 'Belum Mengumpulkan';
  nilai?: number; // 0 - 100
  feedback?: string;
}

export interface LmsTugas {
  id: string;
  judul: string;
  tipe: 'Tugas Mandiri' | 'Tugas Kelompok' | 'Quiz Online' | 'Praktikum Lab' | 'Proyek Rekayasa / Capstone';
  pertemuanKe: number;
  cpmk: string;
  bobotPersen: number; // e.g. 10%
  deadline: string;
  deskripsi: string;
  lampiranUrl?: string;
  pengumpulanList: LmsTugasPengumpulan[];
}

export interface LmsNilaiMahasiswa {
  mahasiswaNim: string;
  mahasiswaNama: string;
  angkatan: number;
  tugas: number; // 20%
  kuis: number; // 10%
  praktikum: number; // 15%
  uts: number; // 25%
  uas: number; // 30%
  nilaiAkhir: number; // calculated 0-100
  hurufMutu: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E';
  angkaMutu: number; // 4.0, 3.75, 3.5, 3.0, 2.75, 2.5, 2.0, 1.75, 1.5, 1.0, 0.0
  statusKelulusan: 'Lulus' | 'Tidak Lulus' | 'Perbaikan / Remedial';
  kehadiranPersen: number;
}

export interface LmsDiskusiKomentar {
  id: string;
  pengirimNama: string;
  pengirimRole: 'Dosen' | 'Mahasiswa' | 'Asisten';
  waktu: string;
  pesan: string;
}

export interface LmsDiskusiThread {
  id: string;
  judul: string;
  pengirimNama: string;
  pengirimRole: 'Dosen' | 'Mahasiswa' | 'Asisten';
  waktu: string;
  isi: string;
  isPinned?: boolean;
  komentarList: LmsDiskusiKomentar[];
}

export interface LmsKelasKuliah {
  id: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  kodeMK: string;
  namaMK: string;
  sks: number;
  semester: number;
  tahunAkademik: string; // "2025/2026 Ganjil"
  kelas: string; // "A", "B", "Karyawan"
  hari: HariKuliah;
  jamMulai: string;
  jamSelesai: string;
  ruanganNama: string;
  dosenNidn: string;
  dosenNama: string;
  dosenEmail: string;
  deskripsiMK: string;
  silabusRpsUrl?: string;
  googleClassroomCode?: string;
  googleClassroomId?: string;
  googleMeetLink?: string;
  totalPertemuanTarget: number; // 16
  pertemuanSelesaiCount: number;
  pesertaCount: number;
  pertemuanList: LmsPertemuan[];
  tugasList: LmsTugas[];
  nilaiList: LmsNilaiMahasiswa[];
  diskusiList: LmsDiskusiThread[];
}

// ==========================================
// SISTEM INFORMASI AKADEMIK (SIAKAD) TYPES
// ==========================================

export type TipeSemester = 'Ganjil' | 'Genap' | 'Pendek';

export interface PeriodeSemesterInfo {
  id: string;
  nama: string;
  tipe: TipeSemester;
  tahunAkademik: string;
  isAktif: boolean;
  maxSksDefault: number;
  periodeBulan: string;
  deskripsi: string;
}

export interface MataKuliahKurikulum {
  id: string;
  kodeMK: string;
  namaMK: string;
  sks: number;
  sksTeori: number;
  sksPraktikum: number;
  semester: number;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  jenis: 'Wajib Universitas' | 'Wajib Fakultas' | 'Wajib Program Studi' | 'Pilihan / MBKM';
  prasyarat: string[]; // Kode MK prasyarat
  dosenPengampu: string;
  deskripsi: string;
}

export interface KrsItem {
  id: string;
  kodeMK: string;
  namaMK: string;
  sks: number;
  kelas: string;
  hari: HariKuliah;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string;
  dosen: string;
  isUlangRemedial?: boolean; // Untuk Semester Pendek
  nilaiAsalSebelumnya?: string; // e.g. "D" atau "C-"
}

export interface KrsRecord {
  id: string;
  nim: string;
  namaMahasiswa: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  programStudi: string;
  semesterAkademik: string; // e.g. "2026/2027 Ganjil"
  tipeSemester?: TipeSemester; // 'Ganjil' | 'Genap' | 'Pendek'
  semesterMhs: number;
  ipsLalu: number;
  maxSksBeban: number;
  totalSks: number;
  statusPersetujuan: 'Draft' | 'Diajukan' | 'Disetujui DPA' | 'Perlu Revisi';
  tanggalPengajuan?: string;
  tanggalPersetujuan?: string;
  dosenPA: string;
  catatanDpa?: string;
  items: KrsItem[];
}

export interface KhsItem {
  id: string;
  kodeMK: string;
  namaMK: string;
  sks: number;
  kehadiran: number; // 0-100
  tugas: number;     // 0-100
  uts: number;       // 0-100
  uas: number;       // 0-100
  nilaiAkhir: number;// 0-100
  hurufMutu: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E';
  bobot: number;     // 0.00 - 4.00
  mutu: number;      // sks * bobot
  statusLulus: 'Lulus' | 'Lulus Bersyarat' | 'Tidak Lulus';
  isPerbaikanNilai?: boolean; // Khusus Semester Pendek
  nilaiSebelumnya?: string;
}

export interface KhsRecord {
  id: string;
  nim: string;
  namaMahasiswa: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  programStudi: string;
  semester: number;
  semesterAkademik: string; // e.g. "2025/2026 Genap"
  tipeSemester?: TipeSemester;
  sksSemester: number;
  sksKumulatif: number;
  ips: number;
  ipk: number;
  dosenPA: string;
  items: KhsItem[];
}

export interface DpnaPeserta {
  nim: string;
  nama: string;
  kehadiran: number;
  tugas: number;
  uts: number;
  uas: number;
  nilaiAkhir: number;
  hurufMutu: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E';
  bobot: number;
}

export interface DpnaRecord {
  id: string;
  kodeMK: string;
  namaMK: string;
  sks: number;
  kelas: string;
  semesterAkademik: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  dosenPengampu: string;
  nidnPengampu: string;
  tanggalSubmit: string;
  isLocked: boolean;
  peserta: DpnaPeserta[];
}

export interface TranskripNilaiItem {
  no: number;
  kodeMK: string;
  namaMK: string;
  sks: number;
  hurufMutu: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E';
  bobot: number;
  mutu: number;
  semesterTempuh: number;
}

export interface TranskripNilaiRecord {
  nim: string;
  nama: string;
  tempatTanggalLahir: string;
  programStudi: string;
  jenjang: 'S1' | 'D3';
  nomorTranskrip: string;
  tanggalLulus?: string;
  totalSksLulus: number;
  totalMutu: number;
  ipk: number;
  predikat: string;
  judulSkripsi?: string;
  items: TranskripNilaiItem[];
}

export interface KalenderAkademikEvent {
  id: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  kegiatan: string;
  kategori: 'Registrasi & KRS' | 'Perkuliahan' | 'Ujian (UTS/UAS)' | 'Nilai & KHS' | 'Wisuda & Libur';
  status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';
}

// ==========================================
// MANAJEMEN KERJASAMA & KEMITRAAN FT UNBARI
// ==========================================
export type JenisDokumenKerjasama = 'MoU' | 'MoA' | 'IA';
export type TingkatKerjasama = 'Internasional' | 'Nasional' | 'Lokal/Wilayah';
export type KategoriMitraKerjasama = 
  | 'Instansi Pemerintah / Kementerian'
  | 'BUMN / BUMD'
  | 'Dunia Usaha & Industri (DUDI)'
  | 'Perguruan Tinggi'
  | 'Asosiasi Profesi'
  | 'LSM / Komunitas';

export type StatusKerjasama = 'Aktif' | 'Mendekati Berakhir' | 'Kedaluwarsa' | 'Dalam Penjajakan';

export type BidangKerjasama = 
  | 'Pendidikan & MBKM'
  | 'Penelitian Bersama'
  | 'Pengabdian Masyarakat (PkM)'
  | 'Dosen Praktisi & Kuliah Pakar'
  | 'Uji Laboratorium & Fasilitas'
  | 'Penyaluran Lulusan & Karir'
  | 'Sertifikasi Kompetensi';

export interface RealisasiKegiatanKerjasama {
  id: string;
  namaKegiatan: string;
  tanggalPelaksanaan: string; // YYYY-MM-DD
  bidang: BidangKerjasama;
  jumlahMahasiswaTerlibat: number;
  jumlahDosenTerlibat: number;
  deskripsiHasil: string;
  nomorBuktiKegiatan: string; // e.g. "BAP-MBKM/SIPIL/2024/01"
  statusPelaksanaan: 'Terlaksana' | 'Sedang Berjalan' | 'Terjadwal';
}

export interface DokumenKerjasama {
  id: string;
  nomorDokumen: string; // e.g. "042/FT-UNBARI/MoA/X/2024"
  nomorDokumenMitra?: string;
  judulKerjasama: string;
  jenisDokumen: JenisDokumenKerjasama;
  tingkat: TingkatKerjasama;
  mitraNama: string;
  kategoriMitra: KategoriMitraKerjasama;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3' | 'SEMUA_FT';
  bidangKerjasama: BidangKerjasama[];
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  status: StatusKerjasama;
  pejabatPenandatanganFT: string;
  pejabatPenandatanganMitra: string;
  jabatanPenandatanganMitra: string;
  picDosenFT: string;
  kontakMitra?: string;
  manfaatBagiProdi: string;
  targetIku6: boolean;
  keterangan?: string;
  realisasiList: RealisasiKegiatanKerjasama[];
}

export type LevelKontribusiCpl = 'Strong' | 'Medium' | 'Low' | 'None';

export interface CplItemObe {
  kode: string; // e.g. "CPL-01"
  ranah: 'Sikap' | 'Penguasaan Pengetahuan' | 'Keterampilan Umum' | 'Keterampilan Khusus';
  judul: string;
  deskripsi: string;
  targetKetercapaianMinimal: number; // e.g. 75
}

export interface CpmkItemObe {
  kode: string; // e.g. "CPMK-1"
  deskripsi: string;
  levelBloom: string; // e.g. "C4 - Analisis"
  cplTerkait: string[]; // e.g. ["CPL-01", "CPL-02"]
  metodeAsesmen: string; // e.g. "Tugas Besar & Ujian Tulis"
  bobotPersen: number; // e.g. 30
}

export interface MataKuliahCplMatrixRecord {
  id: string;
  kodeMK: string;
  namaMK: string;
  sks: number;
  semester: number;
  semesterLabel?: string; // e.g. "01", "03", "B", "K", "Pilihan"
  kelompokKurikulum?: 'Wajib' | 'Pilihan';
  kategori: 'Wajib Prodi' | 'Wajib Fakultas' | 'Pilihan' | 'Studio/Praktikum' | 'Tugas Akhir';
  dosenPengampu: string;
  prodiId: 'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3';
  cpmkList: CpmkItemObe[];
  pemetaanCpl: Record<string, LevelKontribusiCpl>;
  catatanKurikulum?: string;
}
