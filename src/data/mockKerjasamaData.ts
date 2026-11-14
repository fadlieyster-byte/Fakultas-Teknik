import { DokumenKerjasama } from '../types/index';

export const INITIAL_KERJASAMA: DokumenKerjasama[] = [
  // ==========================================
  // S1 TEKNIK SIPIL
  // ==========================================
  {
    id: 'KJS-SPL-001',
    nomorDokumen: '018/FT-UNBARI/MoA/SIPIL/II/2023',
    nomorDokumenMitra: 'HK.02.03/BWS-VI/248/2023',
    judulKerjasama: 'Kerjasama Tri Dharma, Praktik Kerja Mandiri (KP), dan Pengendalian Banjir DAS Batanghari',
    jenisDokumen: 'MoA',
    tingkat: 'Nasional',
    mitraNama: 'Balai Wilayah Sungai (BWS) Sumatera VI Jambi - Ditjen SDA Kementerian PUPR',
    kategoriMitra: 'Instansi Pemerintah / Kementerian',
    prodiId: 'SIPIL',
    bidangKerjasama: [
      'Pendidikan & MBKM',
      'Penelitian Bersama',
      'Uji Laboratorium & Fasilitas',
      'Dosen Praktisi & Kuliah Pakar'
    ],
    tanggalMulai: '2023-02-15',
    tanggalSelesai: '2026-02-14',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Dr. Ir. Gatot Supriyadi, M.Eng.',
    jabatanPenandatanganMitra: 'Kepala Balai Wilayah Sungai Sumatera VI Jambi',
    picDosenFT: 'Ahmad Syarif, S.T., M.T. (Dosen KBK Sumber Daya Air)',
    kontakMitra: 'Subbag Kepegawaian & Kerjasama BWS VI (0741-62844 / bws6@pu.go.id)',
    manfaatBagiProdi: 'Penyediaan kuota magang mandiri 15 mhs/semester, akses data hidrologi DAS Batanghari, serta sertifikasi keahlian teknis SDA.',
    targetIku6: true,
    keterangan: 'MoA aktif diperbarui dari MoU Rektorat No. 04/UNBARI/MoU/2022.',
    realisasiList: [
      {
        id: 'REA-SPL-01-A',
        namaKegiatan: 'Magang Kerja Praktek (KP) Preservasi Tanggul Sungai Batanghari Seksi Danau Teluk',
        tanggalPelaksanaan: '2024-07-10',
        bidang: 'Pendidikan & MBKM',
        jumlahMahasiswaTerlibat: 8,
        jumlahDosenTerlibat: 2,
        deskripsiHasil: 'Mahasiswa berhasil menyelesaikan analisis stabilitas dinding penahan tanah dan laporan evaluasi debit puncak.',
        nomorBuktiKegiatan: 'IA-BWS/KP/SIPIL/2024/09',
        statusPelaksanaan: 'Terlaksana'
      },
      {
        id: 'REA-SPL-01-B',
        namaKegiatan: 'Kuliah Pakar: Manajemen Aliran Sedimen dan Rekayasa Normalisasi Muara Sungai Tropis',
        tanggalPelaksanaan: '2024-10-18',
        bidang: 'Dosen Praktisi & Kuliah Pakar',
        jumlahMahasiswaTerlibat: 75,
        jumlahDosenTerlibat: 6,
        deskripsiHasil: 'Kuliah umum stadium generale di Aula FT UNBARI menghadirkan narasumber utama Pejabat Pembuat Komitmen (PPK) BWS VI.',
        nomorBuktiKegiatan: 'BAP-KULPAKAR/FT/X/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-SPL-002',
    nomorDokumen: '045/FT-UNBARI/MoA/SIPIL/VIII/2023',
    nomorDokumenMitra: 'BPJN-IV/PKS/104/VIII/2023',
    judulKerjasama: 'Kemitraan Pengujian Material Aspal Beton dan Pendampingan Proyek Strategis Jalan Tol Trans Sumatera (JTTS)',
    jenisDokumen: 'MoA',
    tingkat: 'Nasional',
    mitraNama: 'Balai Pelaksanaan Jalan Nasional (BPJN) Wilayah IV Jambi - Ditjen Bina Marga',
    kategoriMitra: 'Instansi Pemerintah / Kementerian',
    prodiId: 'SIPIL',
    bidangKerjasama: [
      'Uji Laboratorium & Fasilitas',
      'Pendidikan & MBKM',
      'Penelitian Bersama'
    ],
    tanggalMulai: '2023-08-01',
    tanggalSelesai: '2026-07-31',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Ibnu Kurniawan, S.T., M.Sc.',
    jabatanPenandatanganMitra: 'Kepala BPJN Wilayah IV Jambi',
    picDosenFT: 'Bambang Irawan, S.T., M.T. (Kepala Lab Mekanika Tanah & Aspal)',
    kontakMitra: 'Seksi Preservasi & Pengujian BPJN Jambi (0741-755102)',
    manfaatBagiProdi: 'Pendapatan jasa kepakaran uji Marshall & CBR tanah timbunan ruas Tol Betung-Tempino-Jambi di Lab FT UNBARI.',
    targetIku6: true,
    keterangan: 'Melibatkan mahasiswa akhir dalam sampling kepadatan timbunan jalan tol.',
    realisasiList: [
      {
        id: 'REA-SPL-02-A',
        namaKegiatan: 'Uji Karakteristik Marshall Test Campuran Asphalt Concrete-Wearing Course (AC-WC) Proyek Seksi Tempino',
        tanggalPelaksanaan: '2024-05-14',
        bidang: 'Uji Laboratorium & Fasilitas',
        jumlahMahasiswaTerlibat: 6,
        jumlahDosenTerlibat: 3,
        deskripsiHasil: 'Sertifikat hasil uji dikeluarkan oleh Kepala Lab Sipil FT UNBARI untuk persetujuan mix design kontraktor.',
        nomorBuktiKegiatan: 'LAB-SPL/TEST-ACWC/084/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-SPL-003',
    nomorDokumen: '089/FT-UNBARI/MoA/SIPIL/XI/2023',
    nomorDokumenMitra: 'HK-INF/DIR-PKS/2023/118',
    judulKerjasama: 'Program Magang Kerja Bersertifikat Industri (PMMB/MSIB) dan Rekrutmen Talenta Konstruksi Jalan Tol',
    jenisDokumen: 'MoA',
    tingkat: 'Nasional',
    mitraNama: 'PT Hutama Karya (Persero) - Divisi Sipil & Infrastruktur Jalan Tol',
    kategoriMitra: 'BUMN / BUMD',
    prodiId: 'SIPIL',
    bidangKerjasama: [
      'Pendidikan & MBKM',
      'Penyaluran Lulusan & Karir',
      'Dosen Praktisi & Kuliah Pakar'
    ],
    tanggalMulai: '2023-11-20',
    tanggalSelesai: '2025-11-19',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Agung Fajarwanto, S.T., M.B.A.',
    jabatanPenandatanganMitra: 'Project Director PT Hutama Karya Ruas Jambi',
    picDosenFT: 'Riki Chandra, S.T., M.T. (Koordinator MBKM Sipil)',
    kontakMitra: 'HC & Kemitraan HK Ruas Betung-Jambi (sdm.toll@hutamakarya.com)',
    manfaatBagiProdi: 'Penyaluran magang industri berhonorarium 6 bulan penuh (konversi 20 SKS) dan *fast-track* seleksi Project Control Officer.',
    targetIku6: true,
    keterangan: 'Prioritas pemagangan mahasiswa semester 7 dan 8 berstatus aktif.',
    realisasiList: [
      {
        id: 'REA-SPL-03-A',
        namaKegiatan: 'Magang Industri Bersertifikat Batch 1: Pengawasan Mutu Struktur Jembatan Overpass Tol Tempino',
        tanggalPelaksanaan: '2024-02-01',
        bidang: 'Pendidikan & MBKM',
        jumlahMahasiswaTerlibat: 10,
        jumlahDosenTerlibat: 2,
        deskripsiHasil: '10 Mahasiswa berhasil menuntaskan magang 6 bulan dengan nilai rata-rata 3.85 (A) dan sertifikat kompetensi industri.',
        nomorBuktiKegiatan: 'CERT-HK/MSIB/FT-UNBARI/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-SPL-004',
    nomorDokumen: '003/FT-UNBARI/MoU/UTM/I/2022',
    nomorDokumenMitra: 'UTM-FKA/MOU/2022/019',
    judulKerjasama: 'International Academic Collaboration, Joint Research in Tropical Soil Mechanics, and Visiting Lecturer',
    jenisDokumen: 'MoU',
    tingkat: 'Internasional',
    mitraNama: 'School of Civil Engineering, Universiti Teknologi Malaysia (UTM) - Skudai Johor Bahru',
    kategoriMitra: 'Perguruan Tinggi',
    prodiId: 'SIPIL',
    bidangKerjasama: [
      'Penelitian Bersama',
      'Pendidikan & MBKM',
      'Dosen Praktisi & Kuliah Pakar'
    ],
    tanggalMulai: '2022-01-10',
    tanggalSelesai: '2025-01-09',
    status: 'Mendekati Berakhir',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Prof. Dr. Ir. Khairul Anuar Kassim',
    jabatanPenandatanganMitra: 'Dean of Civil Engineering UTM Malaysia',
    picDosenFT: 'Dr. Hendra Gunawan, S.T., M.T.',
    kontakMitra: 'International Relations Office UTM (iro@utm.my)',
    manfaatBagiProdi: 'Peningkatan reputasi akreditasi internasional IABEE, 2 publikasi joint-research di jurnal bereputasi Scopus Q2.',
    targetIku6: true,
    keterangan: 'Masa berlaku tersisa < 60 hari. Sedang dalam proses penyusunan draf addendum perpanjangan 3 tahun ke depan (2025-2028).',
    realisasiList: [
      {
        id: 'REA-SPL-04-A',
        namaKegiatan: 'Joint Publication: Soil Stabilization of Peat Subgrade Using Rice Husk Ash and Cement Admixture',
        tanggalPelaksanaan: '2023-11-12',
        bidang: 'Penelitian Bersama',
        jumlahMahasiswaTerlibat: 2,
        jumlahDosenTerlibat: 2,
        deskripsiHasil: 'Diterbitkan pada Malaysian Journal of Civil Engineering terindeks Scopus.',
        nomorBuktiKegiatan: 'PUBLIKASI-UTM-UNBARI-2023-01',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-SPL-005',
    nomorDokumen: '031/FT-UNBARI/MoA/INKINDO/V/2023',
    nomorDokumenMitra: '012/DPD-INKINDO-JMB/PKS/2023',
    judulKerjasama: 'Penguatan Sertifikasi SKK Tenaga Ahli Jasa Konstruksi dan Pelatihan Estimasi Biaya Rencana Anggaran Biaya (RAB)',
    jenisDokumen: 'MoA',
    tingkat: 'Lokal/Wilayah',
    mitraNama: 'DPD INKINDO Provinsi Jambi (Ikatan Nasional Konsultan Indonesia)',
    kategoriMitra: 'Asosiasi Profesi',
    prodiId: 'SIPIL',
    bidangKerjasama: [
      'Sertifikasi Kompetensi',
      'Dosen Praktisi & Kuliah Pakar',
      'Penyaluran Lulusan & Karir'
    ],
    tanggalMulai: '2023-05-10',
    tanggalSelesai: '2026-05-09',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Ir. M. Ridwan, M.M., IAP',
    jabatanPenandatanganMitra: 'Ketua DPD INKINDO Provinsi Jambi',
    picDosenFT: 'Kaprodi S1 Teknik Sipil',
    kontakMitra: 'Sekretariat INKINDO Jambi (0741-667822)',
    manfaatBagiProdi: 'Bimbingan teknis SKK Konstruksi Jenjang 6 (Ahli Muda) untuk mahasiswa calon lulusan/yudisium.',
    targetIku6: false,
    keterangan: 'Kegiatan diselenggarakan berkala setiap menjelang periode yudisium.',
    realisasiList: [
      {
        id: 'REA-SPL-05-A',
        namaKegiatan: 'Bimtek dan Pelatihan Software Pemodelan Struktur Tekla & SAP2000 Bersertifikasi Asosiasi',
        tanggalPelaksanaan: '2024-09-05',
        bidang: 'Sertifikasi Kompetensi',
        jumlahMahasiswaTerlibat: 42,
        jumlahDosenTerlibat: 4,
        deskripsiHasil: '42 peserta memperoleh sertifikat keahlian estimasi kuantitas dan gambar kerja.',
        nomorBuktiKegiatan: 'SK-INKINDO/BIMTEK-FT/IX/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },

  // ==========================================
  // S1 TEKNIK LINGKUNGAN
  // ==========================================
  {
    id: 'KJS-LKG-001',
    nomorDokumen: '022/FT-UNBARI/MoA/TLK/III/2023',
    nomorDokumenMitra: '660.1/104/DLH-1/2023',
    judulKerjasama: 'Kemitraan Pemantauan Baku Mutu Air Sungai Batanghari, Audit IPAL Industri Sawit, dan AMDAL Terpadu',
    jenisDokumen: 'MoA',
    tingkat: 'Lokal/Wilayah',
    mitraNama: 'Dinas Lingkungan Hidup (DLH) Provinsi Jambi',
    kategoriMitra: 'Instansi Pemerintah / Kementerian',
    prodiId: 'LINGKUNGAN',
    bidangKerjasama: [
      'Penelitian Bersama',
      'Uji Laboratorium & Fasilitas',
      'Pendidikan & MBKM',
      'Pengabdian Masyarakat (PkM)'
    ],
    tanggalMulai: '2023-03-20',
    tanggalSelesai: '2026-03-19',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Dr. Hj. Sri Argunaini, S.Pi., M.Si.',
    jabatanPenandatanganMitra: 'Kepala Dinas Lingkungan Hidup Provinsi Jambi',
    picDosenFT: 'Nurul Hidayah, S.T., M.Si. (Dosen Pencemaran Air & Udara)',
    kontakMitra: 'Bidang Pengendalian Pencemaran DLH Jambi (0741-61099)',
    manfaatBagiProdi: 'Penggunaan data Indeks Kualitas Air (IKA) Provinsi Jambi untuk riset tugas akhir mahasiswa, praktikum sampling lapangan.',
    targetIku6: true,
    keterangan: 'Mendukung pemenuhan kriteria akreditasi LAM Teknik instrumen C.6.',
    realisasiList: [
      {
        id: 'REA-LKG-01-A',
        namaKegiatan: 'Survei dan Pengambilan Sampel Titik Pantau Air Sungai Batanghari Sepanjang Muara Jambi',
        tanggalPelaksanaan: '2024-04-22',
        bidang: 'Penelitian Bersama',
        jumlahMahasiswaTerlibat: 14,
        jumlahDosenTerlibat: 3,
        deskripsiHasil: 'Laporan uji parameter BOD, COD, TSS, dan E-Coli di Lab Lingkungan FT UNBARI untuk dokumen evaluasi Pemprov.',
        nomorBuktiKegiatan: 'IA-DLH/IKA-BTH/IV/2024',
        statusPelaksanaan: 'Terlaksana'
      },
      {
        id: 'REA-LKG-01-B',
        namaKegiatan: 'Sosialisasi Pengelolaan Sampah Rumah Tangga dan Pembuatan Eco-Enzyme di Desa Tangkit Baru',
        tanggalPelaksanaan: '2024-08-14',
        bidang: 'Pengabdian Masyarakat (PkM)',
        jumlahMahasiswaTerlibat: 20,
        jumlahDosenTerlibat: 4,
        deskripsiHasil: 'Pelatihan pembuatan komposter anaerobik untuk 40 warga kelompok tani nanas.',
        nomorBuktiKegiatan: 'PKM-LKG/DESA-TANGKIT/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-LKG-002',
    nomorDokumen: '056/FT-UNBARI/MoA/TLK/IX/2023',
    nomorDokumenMitra: 'DIR-TM/PKS-AIR/2023/089',
    judulKerjasama: 'Kajian Optimalisasi Koagulasi Flokulasi IPA Aur Duri dan Magang Industri Pengolahan Air Minum',
    jenisDokumen: 'MoA',
    tingkat: 'Lokal/Wilayah',
    mitraNama: 'Perumda Air Minum (PDAM) Tirta Mayang Kota Jambi',
    kategoriMitra: 'BUMN / BUMD',
    prodiId: 'LINGKUNGAN',
    bidangKerjasama: [
      'Pendidikan & MBKM',
      'Penelitian Bersama',
      'Uji Laboratorium & Fasilitas'
    ],
    tanggalMulai: '2023-09-15',
    tanggalSelesai: '2025-09-14',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Dwike Riantara, S.E., M.Si. Ak. CA.',
    jabatanPenandatanganMitra: 'Direktur Utama Perumda Air Minum Tirta Mayang',
    picDosenFT: 'Ria Anggraini, S.T., M.Eng.',
    kontakMitra: 'Divisi Litbang & Transmisi PDAM Tirta Mayang (0741-22031)',
    manfaatBagiProdi: 'Penelitian bersama Jar Test dosis optimum Poly Aluminium Chloride (PAC) saat musim banjir Sungai Batanghari.',
    targetIku6: true,
    keterangan: 'Realisasi magang operasional instalasi pengolahan air (IPA) tiap semester ganjil.',
    realisasiList: [
      {
        id: 'REA-LKG-02-A',
        namaKegiatan: 'Magang Industri Pengolahan Air IPA Benteng & IPA Aur Duri Selama 1 Semester',
        tanggalPelaksanaan: '2024-03-01',
        bidang: 'Pendidikan & MBKM',
        jumlahMahasiswaTerlibat: 8,
        jumlahDosenTerlibat: 2,
        deskripsiHasil: 'Mahasiswa menyusun evaluasi hidrolis unit sedimentasi dan backwash saringan pasir cepat.',
        nomorBuktiKegiatan: 'IA-PDAM/MAGANG-IPA/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-LKG-003',
    nomorDokumen: '077/FT-UNBARI/MoA/TLK/X/2023',
    nomorDokumenMitra: 'PC-JAB/CSR-ENV/2023/412',
    judulKerjasama: 'Program Pengelolaan Lingkungan Pesisir, Reduksi Emisi Gas Buang Suar, dan Konservasi Mangrove',
    jenisDokumen: 'MoA',
    tingkat: 'Nasional',
    mitraNama: 'PT PetroChina International Jabung Ltd. - Wilayah Kerja Geragai & Betara',
    kategoriMitra: 'Dunia Usaha & Industri (DUDI)',
    prodiId: 'LINGKUNGAN',
    bidangKerjasama: [
      'Pengabdian Masyarakat (PkM)',
      'Penelitian Bersama',
      'Pendidikan & MBKM'
    ],
    tanggalMulai: '2023-10-05',
    tanggalSelesai: '2026-10-04',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Rudy Hermawan, S.T.',
    jabatanPenandatanganMitra: 'Field Manager PetroChina Jabung Block',
    picDosenFT: 'Fahmi Ridho, S.T., M.Si.',
    kontakMitra: 'CSR & Environmental Protection Dept (csr.jabung@petrochina.co.id)',
    manfaatBagiProdi: 'Dukungan dana riset PkM mangrove pesisir Rp 65.000.000,- dan penyerapan magang HSE mahasiswa tingkat akhir.',
    targetIku6: true,
    keterangan: 'Mitra industri multinasional sektor hulu migas di Provinsi Jambi.',
    realisasiList: [
      {
        id: 'REA-LKG-03-A',
        namaKegiatan: 'Penanaman 3.000 Bibit Mangrove Rhizophora dan Pengukuran Cadangan Karbon Biru',
        tanggalPelaksanaan: '2024-06-08',
        bidang: 'Pengabdian Masyarakat (PkM)',
        jumlahMahasiswaTerlibat: 25,
        jumlahDosenTerlibat: 5,
        deskripsiHasil: 'Peringatan Hari Lingkungan Hidup Sedunia di Pesisir Mendahara Ilir, Kabupaten Tanjung Jabung Timur.',
        nomorBuktiKegiatan: 'BERKAS-CSR-PETRO/MANGROVE/VI/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-LKG-004',
    nomorDokumen: '005/FT-UNBARI/MoU/AIT/II/2022',
    nomorDokumenMitra: 'AIT-EEM/MOU-SEA/2022/03',
    judulKerjasama: 'International Research Network on Tropical Wetland Drainage and Water Quality Modeling',
    jenisDokumen: 'MoU',
    tingkat: 'Internasional',
    mitraNama: 'Asian Institute of Technology (AIT) - Department of Energy, Environment & Climate Change (Thailand)',
    kategoriMitra: 'Perguruan Tinggi',
    prodiId: 'LINGKUNGAN',
    bidangKerjasama: [
      'Penelitian Bersama',
      'Dosen Praktisi & Kuliah Pakar'
    ],
    tanggalMulai: '2022-02-18',
    tanggalSelesai: '2025-02-17',
    status: 'Mendekati Berakhir',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Prof. C. Visvanathan, Ph.D.',
    jabatanPenandatanganMitra: 'Dean of School of Environment, Resources and Development AIT',
    picDosenFT: 'Dr. Ratna Sari, S.T., M.T.',
    kontakMitra: 'SERD Secretariat AIT Bangkok (+66 2 524 5440)',
    manfaatBagiProdi: 'Transfer knowledge teknologi pengolahan air limbah terdesentralisasi (DEWATS) dan peluang beasiswa S2/S3 luar negeri.',
    targetIku6: true,
    keterangan: 'Masa berlaku tersisa ~3 bulan. Rekomendasi pimpinan: perpanjang dengan fokus adaptasi perubahan iklim DAS gambut.',
    realisasiList: [
      {
        id: 'REA-LKG-04-A',
        namaKegiatan: 'International Web-Seminar: Climate Resilient Urban Drainage in Tropical Coastal Cities',
        tanggalPelaksanaan: '2023-10-25',
        bidang: 'Dosen Praktisi & Kuliah Pakar',
        jumlahMahasiswaTerlibat: 110,
        jumlahDosenTerlibat: 8,
        deskripsiHasil: 'Keynote lecture bersama pakar AIT Bangkok diikuti oleh sivitas akademika Universitas Batanghari.',
        nomorBuktiKegiatan: 'SERTIF-WEBINAR-AIT/2023',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },

  // ==========================================
  // D3 TEKNIK LISTRIK
  // ==========================================
  {
    id: 'KJS-LST-001',
    nomorDokumen: '028/FT-UNBARI/MoA/LISTRIK/IV/2023',
    nomorDokumenMitra: '0412.PKS/DAN.02.01/UP3-JMB/2023',
    judulKerjasama: 'Kemitraan Sistem Proteksi Gardu Induk, Dosen Praktisi Kelistrikan, dan Magang Industri Tenaga Listrik',
    jenisDokumen: 'MoA',
    tingkat: 'Nasional',
    mitraNama: 'PT PLN (Persero) Unit Pelaksana Pelayanan Pelanggan (UP3) Jambi',
    kategoriMitra: 'BUMN / BUMD',
    prodiId: 'LISTRIK_D3',
    bidangKerjasama: [
      'Pendidikan & MBKM',
      'Dosen Praktisi & Kuliah Pakar',
      'Penyaluran Lulusan & Karir',
      'Sertifikasi Kompetensi'
    ],
    tanggalMulai: '2023-04-12',
    tanggalSelesai: '2026-04-11',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Ediwan, S.T., M.M.',
    jabatanPenandatanganMitra: 'Manager PT PLN (Persero) UP3 Jambi',
    picDosenFT: 'Dedi Setiawan, S.T., M.T. (Kaprodi D3 Teknik Listrik)',
    kontakMitra: 'Bagian SDM & Humas PT PLN UP3 Jambi (0741-23114)',
    manfaatBagiProdi: 'Dosen praktisi mengajar mata kuliah Sistem Proteksi & Gardu Induk, fasilitas praktik lapangan di Gardu Induk Aur Duri & Muara Bulian.',
    targetIku6: true,
    keterangan: 'Pilar utama pemenuhan link-and-match pendidikan vokasi teknik elektro.',
    realisasiList: [
      {
        id: 'REA-LST-01-A',
        namaKegiatan: 'Program Praktik Industri Terstruktur: Pemeliharaan Pemutus Tenaga (PMT) dan Relai Proteksi Gardu Induk 150 kV',
        tanggalPelaksanaan: '2024-06-20',
        bidang: 'Pendidikan & MBKM',
        jumlahMahasiswaTerlibat: 12,
        jumlahDosenTerlibat: 3,
        deskripsiHasil: 'Mahasiswa D3 Teknik Listrik menyelesaikan modul praktik kerja lapangan 400 jam kerja dengan sertifikat kompetensi PLN.',
        nomorBuktiKegiatan: 'IA-PLN/PKL-LISTRIK/2024/06',
        statusPelaksanaan: 'Terlaksana'
      },
      {
        id: 'REA-LST-01-B',
        namaKegiatan: 'Dosen Praktisi: K3 Ketenagalistrikan & Standar Operasional Pemeliharaan Saluran Udara Tegangan Menengah (SUTM)',
        tanggalPelaksanaan: '2024-09-28',
        bidang: 'Dosen Praktisi & Kuliah Pakar',
        jumlahMahasiswaTerlibat: 38,
        jumlahDosenTerlibat: 4,
        deskripsiHasil: 'Kuliah praktisi oleh Team Leader K3 PLN UP3 Jambi di Laboratorium Mesin Listrik FT UNBARI.',
        nomorBuktiKegiatan: 'BAP-PRAKTISI/PLN-FT/IX/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-LST-002',
    nomorDokumen: '062/FT-UNBARI/MoA/LISTRIK/X/2023',
    nomorDokumenMitra: 'PTPN4-REG4/PKS-ENG/2023/15',
    judulKerjasama: 'Kajian Audit Efisiensi Energi Listrik Boiler-Turbin dan Pemeliharaan Motor Listrik Pabrik Kelapa Sawit (PKS)',
    jenisDokumen: 'MoA',
    tingkat: 'Lokal/Wilayah',
    mitraNama: 'PT Perkebunan Nusantara IV Regional 4 (Eks PTPN VI Jambi)',
    kategoriMitra: 'BUMN / BUMD',
    prodiId: 'LISTRIK_D3',
    bidangKerjasama: [
      'Pendidikan & MBKM',
      'Penelitian Bersama',
      'Uji Laboratorium & Fasilitas'
    ],
    tanggalMulai: '2023-10-10',
    tanggalSelesai: '2026-10-09',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Ir. Ospin Sembiring',
    jabatanPenandatanganMitra: 'Kepala Bagian Teknik & Pengolahan PTPN IV Reg. 4',
    picDosenFT: 'Junaidi, S.T., M.T.',
    kontakMitra: 'Sekretariat PTPN IV Regional 4 Paal Merah Jambi (0741-572450)',
    manfaatBagiProdi: 'Objek penelitian tugas akhir mahasiswa vokasi sistem otomasi kendali motor listrik PLC di Pabrik Sawit Bunut & Tanjung Lebar.',
    targetIku6: true,
    keterangan: 'Kemitraan strategis industri agro-kelapa sawit terbesar di Jambi.',
    realisasiList: [
      {
        id: 'REA-LST-02-A',
        namaKegiatan: 'Audit Energi Listrik dan Pengukuran Harmonisa Beban Non-Linier di PKS Bunut Muaro Jambi',
        tanggalPelaksanaan: '2024-07-25',
        bidang: 'Penelitian Bersama',
        jumlahMahasiswaTerlibat: 6,
        jumlahDosenTerlibat: 2,
        deskripsiHasil: 'Rekomendasi pemasangan active harmonic filter untuk menghemat konsumsi energi generator biomassa cangkang.',
        nomorBuktiKegiatan: 'LAP-AUDIT-PTPN/FT/VII/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-LST-003',
    nomorDokumen: '015/FT-UNBARI/MoA/AKLI/III/2023',
    nomorDokumenMitra: '007/DPD-AKLI-JMB/KJS/2023',
    judulKerjasama: 'Uji Kompetensi Ketenagalistrikan (SKTTK) Ditjen Ketenagalistrikan ESDM dan Sertifikasi Installer Listrik',
    jenisDokumen: 'MoA',
    tingkat: 'Lokal/Wilayah',
    mitraNama: 'DPD AKLI Provinsi Jambi (Asosiasi Kontraktor Listrik & Mekanikal Indonesia)',
    kategoriMitra: 'Asosiasi Profesi',
    prodiId: 'LISTRIK_D3',
    bidangKerjasama: [
      'Sertifikasi Kompetensi',
      'Penyaluran Lulusan & Karir',
      'Dosen Praktisi & Kuliah Pakar'
    ],
    tanggalMulai: '2023-03-01',
    tanggalSelesai: '2026-02-28',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'H. Sudirman, S.E., M.M.',
    jabatanPenandatanganMitra: 'Ketua DPD AKLI Provinsi Jambi',
    picDosenFT: 'Dedi Setiawan, S.T., M.T.',
    kontakMitra: 'Gedung AKLI Jambi (0741-60221)',
    manfaatBagiProdi: 'Fasilitasi uji sertifikasi kompetensi tenaga teknik ketenagalistrikan (SKTTK) bersubsidi bagi lulusan program diploma.',
    targetIku6: false,
    keterangan: 'Pemberian Surat Keterangan Pendamping Ijazah (SKPI) resmi bidang kelistrikan.',
    realisasiList: [
      {
        id: 'REA-LST-03-A',
        namaKegiatan: 'Uji Kompetensi Pelaksana Pembangunan dan Pemasangan Pemanfaatan Tenaga Listrik Tegangan Rendah',
        tanggalPelaksanaan: '2024-08-30',
        bidang: 'Sertifikasi Kompetensi',
        jumlahMahasiswaTerlibat: 22,
        jumlahDosenTerlibat: 3,
        deskripsiHasil: '22 Lulusan D3 dinyatakan Kompeten oleh Lembaga Sertifikasi Kompetensi (LSK) AKLI.',
        nomorBuktiKegiatan: 'SKTTK-AKLI/D3-EL/2024/08',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },

  // ==========================================
  // SELURUH FAKULTAS TEKNIK (LINTAS PRODI)
  // ==========================================
  {
    id: 'KJS-FT-001',
    nomorDokumen: '002/FT-UNBARI/MoA/BJKW2/I/2023',
    nomorDokumenMitra: 'HK.02.01/BJKW-II/012/2023',
    judulKerjasama: 'Program Fasilitasi Uji Sertifikasi Tenaga Kerja Konstruksi (TKK) dan Pelatihan BIM Tingkat Dasar',
    jenisDokumen: 'MoA',
    tingkat: 'Nasional',
    mitraNama: 'Balai Jasa Konstruksi Wilayah (BJKW) II Palembang - Ditjen Bina Konstruksi Kementerian PUPR',
    kategoriMitra: 'Instansi Pemerintah / Kementerian',
    prodiId: 'SEMUA_FT',
    bidangKerjasama: [
      'Sertifikasi Kompetensi',
      'Pendidikan & MBKM',
      'Dosen Praktisi & Kuliah Pakar'
    ],
    tanggalMulai: '2023-01-16',
    tanggalSelesai: '2026-01-15',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Nanda Chesa Pratama, S.T., M.T.',
    jabatanPenandatanganMitra: 'Kepala Balai Jasa Konstruksi Wilayah II Palembang',
    picDosenFT: 'Bambang Irawan, S.T., M.T.',
    kontakMitra: 'Seksi Pelatihan & Uji Kompetensi BJKW II (bjkw2.pupr@pu.go.id)',
    manfaatBagiProdi: 'Sertifikasi Tenaga Ahli Muda K3 Konstruksi & Pelatihan BIM 3D gratis bersertifikat Kementerian PUPR bagi calon insinyur.',
    targetIku6: true,
    keterangan: 'Mencakup mahasiswa Teknik Sipil, Teknik Lingkungan, dan D3 Teknik Listrik.',
    realisasiList: [
      {
        id: 'REA-FT-01-A',
        namaKegiatan: 'Pelatihan dan Uji Sertifikasi Jabatan Kerja Ahli Muda K3 Konstruksi Jenjang 7 Mahasiswa Tingkat Akhir',
        tanggalPelaksanaan: '2024-05-20',
        bidang: 'Sertifikasi Kompetensi',
        jumlahMahasiswaTerlibat: 60,
        jumlahDosenTerlibat: 6,
        deskripsiHasil: '60 Peserta dinyatakan lulus asesmen BNSP/LPJK dan berhak menyandang SKK Ahli Muda K3 Konstruksi.',
        nomorBuktiKegiatan: 'SERTIF-BJKW2/K3-FT-UNBARI/V/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-FT-002',
    nomorDokumen: '071/FT-UNBARI/MoA/PEMKOT/XI/2023',
    nomorDokumenMitra: '100.3.7/642/Bappeda-Kota/2023',
    judulKerjasama: 'Kajian Teknis Tata Ruang, Masterplan Drainase Perkotaan, dan Konsultasi Kebijakan Infrastruktur Kota Jambi',
    jenisDokumen: 'MoA',
    tingkat: 'Lokal/Wilayah',
    mitraNama: 'Pemerintah Kota Jambi (Bappeda & Dinas PUPR Kota Jambi)',
    kategoriMitra: 'Instansi Pemerintah / Kementerian',
    prodiId: 'SEMUA_FT',
    bidangKerjasama: [
      'Penelitian Bersama',
      'Pengabdian Masyarakat (PkM)',
      'Pendidikan & MBKM'
    ],
    tanggalMulai: '2023-11-01',
    tanggalSelesai: '2026-10-31',
    status: 'Aktif',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Dr. H. Harmen Rusdi, S.T., M.Si.',
    jabatanPenandatanganMitra: 'Kepala Bappeda Kota Jambi',
    picDosenFT: 'Ir. Fadli Eka Yandra, S.T., M.T.',
    kontakMitra: 'Bidang Infrastruktur & Kewilayahan Bappeda Kota Jambi (0741-445012)',
    manfaatBagiProdi: 'Pelibatan dosen FT UNBARI sebagai tim ahli penyusun Revisi RTRW Kota Jambi dan Masterplan Mitigasi Genangan Air.',
    targetIku6: true,
    keterangan: 'Fasilitasi penelitian kolaboratif dosen dan mahasiswa.',
    realisasiList: [
      {
        id: 'REA-FT-02-A',
        namaKegiatan: 'FGD dan Paparan Hasil Kajian Audit Titik Genangan Air dan Kapasitas Saluran Primer Danau Sipin',
        tanggalPelaksanaan: '2024-04-16',
        bidang: 'Pengabdian Masyarakat (PkM)',
        jumlahMahasiswaTerlibat: 15,
        jumlahDosenTerlibat: 5,
        deskripsiHasil: 'Rekomendasi teknis normalisasi saluran drainase diserahkan kepada Walikota Jambi.',
        nomorBuktiKegiatan: 'FGD-BAPPEDA/DRAINASE/2024/04',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  },
  {
    id: 'KJS-FT-003',
    nomorDokumen: '098/FT-UNBARI/MoU/UNSRI/XII/2021',
    nomorDokumenMitra: 'UNSRI-FT/MOU/2021/440',
    judulKerjasama: 'Konsorsium Riset Bersama Rekayasa Material Tropis dan Pertukaran Mahasiswa Merdeka (PMM)',
    jenisDokumen: 'MoU',
    tingkat: 'Nasional',
    mitraNama: 'Fakultas Teknik Universitas Sriwijaya (UNSRI) Palembang',
    kategoriMitra: 'Perguruan Tinggi',
    prodiId: 'SEMUA_FT',
    bidangKerjasama: [
      'Pendidikan & MBKM',
      'Penelitian Bersama',
      'Dosen Praktisi & Kuliah Pakar'
    ],
    tanggalMulai: '2021-12-05',
    tanggalSelesai: '2024-12-04',
    status: 'Mendekati Berakhir',
    pejabatPenandatanganFT: 'Ir. Fadli Eka Yandra, S.T., M.T. (Dekan FT UNBARI)',
    pejabatPenandatanganMitra: 'Prof. Dr. Ir. Joni Arliansyah, M.T.',
    jabatanPenandatanganMitra: 'Dekan Fakultas Teknik Universitas Sriwijaya',
    picDosenFT: 'Wakil Dekan I FT UNBARI',
    kontakMitra: 'Bagian Kerjasama FT UNSRI (ft@unsri.ac.id)',
    manfaatBagiProdi: 'Pertukaran mahasiswa antar PT se-Sumatera dan penggunaan bersama fasilitas Scanning Electron Microscopy (SEM).',
    targetIku6: true,
    keterangan: 'Masa berlaku tersisa ~25 hari. Tahap persiapan penandatanganan perpanjangan MoU 5 tahun (2024-2029).',
    realisasiList: [
      {
        id: 'REA-FT-03-A',
        namaKegiatan: 'Pertukaran Mahasiswa Merdeka (PMM) Semester Genap 2023/2024 Mata Kuliah Rekayasa Gempa',
        tanggalPelaksanaan: '2024-02-15',
        bidang: 'Pendidikan & MBKM',
        jumlahMahasiswaTerlibat: 18,
        jumlahDosenTerlibat: 2,
        deskripsiHasil: '18 Mahasiswa FT UNBARI mengambil kredit matakuliah pilihan di Kampus Bukit Besar UNSRI.',
        nomorBuktiKegiatan: 'PMM-UNSRI-UNBARI/GENAP/2024',
        statusPelaksanaan: 'Terlaksana'
      }
    ]
  }
];
