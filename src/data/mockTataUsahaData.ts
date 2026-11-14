import { SuratPermohonanTU, SuratAgendaTU, PeminjamanSarprasTU } from '../types/index';

export const STAFF_TU_FAKULTAS = {
  kepalaTU: 'Ir. Asmuni Jatoeb, MT',
  jabatanKepalaTU: 'Kepala Bagian Tata Usaha Fakultas Teknik UNBARI',
  petugasAkademik: 'Siti Rohani',
  stafPelayananAkademikDanIjazah: 'Siti Rohani',
  jabatanStafPelayananAkademikDanIjazah: 'Staf Pelayanan Akademik & Ijazah Fakultas Teknik UNBARI',
  petugasPersuratan: 'Khanti Wahyuni, A.Md',
  stafPersuratanAgendaArsip: 'Khanti Wahyuni, A.Md',
  jabatanStafPersuratanAgendaArsip: 'Staf Persuratan, Agenda dan Arsip Fakultas Teknik UNBARI',
  teleponTU: '(0741) 60103 Ext. 104',
  emailTU: 'ftunbari.tpa@gmail.com'
};

export const INITIAL_SURAT_TU: SuratPermohonanTU[] = [
  {
    id: 'SRT-TU-2026-001',
    nomorSurat: '142/UNBARI-FT/TU/KM/2026',
    jenisSurat: 'Surat Keterangan Aktif Kuliah',
    pemohonNama: 'CHAVA DEANANTA',
    pemohonNimNidn: '2500822201002',
    pemohonKategori: 'Mahasiswa',
    prodiId: 'SIPIL',
    programStudi: 'S1 Teknik Sipil',
    keperluan: 'Pengurusan Tunjangan Gaji Orang Tua (PNS Badan Kepegawaian Daerah Prov. Jambi)',
    tanggalPengajuan: '2026-10-24',
    tanggalSelesai: '2026-10-25',
    status: 'Selesai & Diterbitkan',
    catatanTU: 'Dokumen telah ditandatangani Dekan secara digital dan stempel resmi TU terbit.',
    dataTambahan: {
      semester: 3,
      tahunAkademik: '2026/2027',
      namaOrangTua: 'Drs. Hendri Irawan, M.Si.',
      pekerjaanOrangTua: 'PNS Pemprov Jambi',
      instansiOrangTua: 'Badan Kepegawaian Daerah Provinsi Jambi'
    }
  },
  {
    id: 'SRT-TU-2026-002',
    nomorSurat: '143/UNBARI-FT/TU/KP/2026',
    jenisSurat: 'Surat Pengantar Kerja Praktik (KP)',
    pemohonNama: 'WINDI RAHMANIA IMANDA',
    pemohonNimNidn: '2500822201003',
    pemohonKategori: 'Mahasiswa',
    prodiId: 'SIPIL',
    programStudi: 'S1 Teknik Sipil',
    keperluan: 'Pengajuan Kerja Praktik (KP) / Magang Lapangan Proyek Konstruksi',
    tujuanInstansi: 'PT Hutama Karya (Persero) - Project Tol Betung-Jambi Seksi 3',
    tanggalPengajuan: '2026-10-26',
    tanggalSelesai: '2026-10-27',
    status: 'Selesai & Diterbitkan',
    catatanTU: 'Surat pengantar telah dikirimkan ke Divisi SDM PT Hutama Karya (Persero).',
    dataTambahan: {
      semester: 5,
      tahunAkademik: '2026/2027',
      anggota: ['WINDI RAHMANIA IMANDA', 'MUTSIROTUN NAHLA']
    }
  },
  {
    id: 'SRT-TU-2026-003',
    nomorSurat: '144/UNBARI-FT/TU/TA/2026',
    jenisSurat: 'Surat Izin Penelitian / Data TA',
    pemohonNama: 'M.HAYKAL JANUARIZKI',
    pemohonNimNidn: '2100822201002',
    pemohonKategori: 'Mahasiswa',
    prodiId: 'SIPIL',
    programStudi: 'S1 Teknik Sipil',
    keperluan: 'Permohonan Data Pengujian Tanah & Core Drill untuk Skripsi',
    tujuanInstansi: 'Balai Pelaksanaan Jalan Nasional (BPJN) Jambi - Kementerian PUPR',
    tanggalPengajuan: '2026-10-27',
    status: 'Menunggu TTD Dekan',
    catatanTU: 'Berkas proposal telah divalidasi Kaprodi. Menunggu tanda tangan Dekan: Fadli Eka Yandra, ST., MT.',
    dataTambahan: {
      semester: 9,
      tahunAkademik: '2026/2027',
      judulPenelitian: 'Analisis Stabilitas Lereng dan Perkuatan Sheet Pile pada Ruas Tol Betung-Tempino-Jambi Seksi 3',
      lokasiPenelitian: 'Wilayah Kerja BPJN Jambi dan Ruas Tol Baleno'
    }
  },
  {
    id: 'SRT-TU-2026-004',
    nomorSurat: '145/UNBARI-FT/TU/KM/2026',
    jenisSurat: 'Surat Rekomendasi Beasiswa',
    pemohonNama: 'FARADILA PUTRI UTAMI',
    pemohonNimNidn: '2100822202005',
    pemohonKategori: 'Mahasiswa',
    prodiId: 'LINGKUNGAN',
    programStudi: 'S1 Teknik Lingkungan',
    keperluan: 'Pengajuan Beasiswa Dumisake Pendidikan Pemerintah Provinsi Jambi',
    tujuanInstansi: 'Biro Kesra Setda Provinsi Jambi',
    tanggalPengajuan: '2026-10-28',
    status: 'Diproses TU',
    catatanTU: 'Verifikasi transkrip IPK 3.78 dan syarat SKTM sedang diverifikasi staf TU.',
    dataTambahan: {
      semester: 7,
      tahunAkademik: '2026/2027'
    }
  },
  {
    id: 'SRT-TU-2026-005',
    nomorSurat: '146/UNBARI-FT/TU/ST/2026',
    jenisSurat: 'Surat Tugas Dosen',
    pemohonNama: 'Ir. Azwarman, MT',
    pemohonNimNidn: '1005116701',
    pemohonKategori: 'Dosen',
    prodiId: 'SIPIL',
    programStudi: 'S1 Teknik Sipil',
    keperluan: 'Narasumber Ahli Bidang Sumber Daya Air pada FGD Masterplan Drainase Perkotaan',
    tujuanInstansi: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) Kota Jambi',
    tanggalPengajuan: '2026-10-28',
    status: 'Selesai & Diterbitkan',
    catatanTU: 'Surat Tugas resmi telah disahkan Dekan Fadli Eka Yandra, ST., MT.',
    dataTambahan: {
      tahunAkademik: '2026/2027'
    }
  },
  {
    id: 'SRT-TU-2026-006',
    nomorSurat: '147/UNBARI-FT/TU/KP/2026',
    jenisSurat: 'Surat Pengantar Kerja Praktik (KP)',
    pemohonNama: 'REZKY ADITYA PRATAMA',
    pemohonNimNidn: '230031551001',
    pemohonKategori: 'Mahasiswa',
    prodiId: 'LISTRIK_D3',
    programStudi: 'D3 Teknik Listrik',
    keperluan: 'Kerja Praktik Pemeliharaan Panel Listrik Industri & Trafo Daya',
    tujuanInstansi: 'PT PLN (Persero) UP3 Jambi - Gardu Induk Payo Selincah',
    tanggalPengajuan: '2026-10-29',
    status: 'Diajukan',
    catatanTU: 'Menunggu kelengkapan tanda tangan persetujuan Kaprodi D3 Teknik Listrik.',
    dataTambahan: {
      semester: 5,
      tahunAkademik: '2026/2027'
    }
  }
];

export const INITIAL_AGENDA_TU: SuratAgendaTU[] = [
  {
    id: 'AGD-IN-001',
    tipe: 'Masuk',
    nomorAgenda: 'AGD/M/2026/184',
    nomorSuratAsli: '421/UNBARI/REK/X/2026',
    tanggalSurat: '2026-10-20',
    tanggalDiterima: '2026-10-21',
    pengirimAtauTujuan: 'Rektorat Universitas Batanghari (Biro Administrasi Akademik)',
    perihal: 'Jadwal Pelaksanaan Rapat Koordinasi Wisuda Ke-56 dan Batas Akhir Penyerahan Data Lulusan',
    kategori: 'Rektorat / Yayasan',
    disposisiDekan: {
      tujuanDisposisi: 'Wakil Dekan I & Seluruh Kaprodi (Sipil, Lingkungan, Listrik)',
      instruksi: 'Tindaklanjuti segera penetapan yudisium dan verifikasi PIN Dikti lulusan.',
      catatan: 'Pastikan seluruh lulusan telah bebas tanggungan perpustakaan dan laboratorium.',
      tanggalDisposisi: '2026-10-22'
    },
    status: 'Dalam Proses'
  },
  {
    id: 'AGD-IN-002',
    tipe: 'Masuk',
    nomorAgenda: 'AGD/M/2026/185',
    nomorSuratAsli: '600/128/PUPR-CK/2026',
    tanggalSurat: '2026-10-23',
    tanggalDiterima: '2026-10-24',
    pengirimAtauTujuan: 'Dinas PUPR Provinsi Jambi - Bidang Cipta Karya',
    perihal: 'Undangan Rapat Evaluasi Teknis Sistem Penyediaan Air Minum (SPAM) Regional',
    kategori: 'Instansi Mitra / Industri',
    disposisiDekan: {
      tujuanDisposisi: 'Kaprodi S1 Teknik Lingkungan (Ir. Marhadi, ST., MT)',
      instruksi: 'Hadir mewakili Dekan dan berikan masukan telaah teknis lingkungan.',
      catatan: 'Siapkan laporan hasil rapat untuk arsip Fakultas.',
      tanggalDisposisi: '2026-10-25'
    },
    status: 'Selesai'
  },
  {
    id: 'AGD-IN-003',
    tipe: 'Masuk',
    nomorAgenda: 'AGD/M/2026/186',
    nomorSuratAsli: '0812/LL10/AK/2026',
    tanggalSurat: '2026-10-25',
    tanggalDiterima: '2026-10-26',
    pengirimAtauTujuan: 'LLDIKTI Wilayah X (Sumbar, Riau, Jambi, Kepri)',
    perihal: 'Pemutakhiran Data Dosen Tetap, Beban BKD, dan Kesiapan Akreditasi LAM TEKNIK',
    kategori: 'LLDIKTI / Kemendikbud',
    disposisiDekan: {
      tujuanDisposisi: 'Tim Penjaminan Mutu Fakultas (TPMF) & Kabag TU',
      instruksi: 'Cek kesesuaian BKD Dosen pengampu semester ganjil pada sistem SiKaprodi.',
      catatan: 'Koordinasikan dengan Dekan sebelum batas akhir unggah 10 November 2026.',
      tanggalDisposisi: '2026-10-27'
    },
    status: 'Didisposisikan'
  },
  {
    id: 'AGD-OUT-001',
    tipe: 'Keluar',
    nomorAgenda: 'AGD/K/2026/092',
    nomorSuratAsli: '088/UNBARI-FT/DEK/X/2026',
    tanggalSurat: '2026-10-26',
    tanggalDiterima: '2026-10-26',
    pengirimAtauTujuan: 'Yayasan Pendidikan Jambi (YPJ)',
    perihal: 'Permohonan Pengadaan Alat Uji Kuat Tekan Beton Digital Laboratorium Teknik Sipil',
    kategori: 'Rektorat / Yayasan',
    status: 'Selesai'
  },
  {
    id: 'AGD-OUT-002',
    tipe: 'Keluar',
    nomorAgenda: 'AGD/K/2026/093',
    nomorSuratAsli: '089/UNBARI-FT/DEK/X/2026',
    tanggalSurat: '2026-10-28',
    tanggalDiterima: '2026-10-28',
    pengirimAtauTujuan: 'PT Hutama Karya (Persero) - Tol Betung-Jambi',
    perihal: 'Surat Ucapan Terima Kasih dan Kerjasama Magang Bersertifikat Industri Mahasiswa FT',
    kategori: 'Instansi Mitra / Industri',
    status: 'Selesai'
  }
];

export const INITIAL_SARPRAS_TU: PeminjamanSarprasTU[] = [
  {
    id: 'SAR-2026-01',
    namaPeminjam: 'Gilang Ramadhan',
    nimNidn: '231011551078',
    kontakHp: '0812-7489-1122',
    unitOrmawa: 'Himpunan Mahasiswa Sipil (HMS UNBARI)',
    itemFasilitas: 'Ruang Rapat Dekanat FT UNBARI',
    tanggalKegiatan: '2026-11-02',
    waktuMulai: '09:00',
    waktuSelesai: '12:30',
    keperluanAcara: 'Rapat Kerja Tahunan Kepengurusan HMS dan Koordinasi Lomba Rancang Jembatan Nasional',
    status: 'Disetujui KTU',
    catatanKTU: 'Kunci ruang dapat diambil di pos TU pada hari H jam 08:30 WIB. Jaga kebersihan ruang.'
  },
  {
    id: 'SAR-2026-02',
    namaPeminjam: 'M. Alvin Pratama',
    nimNidn: '2200822201015',
    kontakHp: '0853-6621-9988',
    unitOrmawa: 'BEM Fakultas Teknik UNBARI',
    itemFasilitas: 'Aula Gedung E Fakultas Teknik',
    tanggalKegiatan: '2026-11-08',
    waktuMulai: '08:00',
    waktuSelesai: '16:00',
    keperluanAcara: 'Seminar Nasional Keteknikan "Inovasi Infrastruktur Berkelanjutan di Era Digital"',
    status: 'Disetujui KTU',
    catatanKTU: 'Izin Dekan telah terbit. Fasilitas sound system dan 2 unit mic wireless disiapkan laboran.'
  },
  {
    id: 'SAR-2026-03',
    namaPeminjam: 'Annisaa Dwiretnani, S.T., M.T.',
    nimNidn: '1015088901',
    kontakHp: '0813-6677-2211',
    unitOrmawa: 'Laboratorium Struktur FT UNBARI',
    itemFasilitas: 'Ruang Seminar E-202 & LCD Proyektor',
    tanggalKegiatan: '2026-11-04',
    waktuMulai: '13:30',
    waktuSelesai: '16:00',
    keperluanAcara: 'Pelatihan Software SAP2000 dan AutoCAD bagi Asisten Laboratorium',
    status: 'Sedang Digunakan',
    catatanKTU: 'Telah diverifikasi Kepala Bagian Tata Usaha.'
  }
];
