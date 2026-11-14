import { SkpiRecord, CapaianPembelajaranSkpi } from '../types/index';
import { DEKAN_FAKULTAS_TEKNIK, WAKIL_DEKAN_1 } from './mockData';

export const CPL_STANDARD_SIPIL: CapaianPembelajaranSkpi[] = [
  {
    kategori: 'Kemampuan Kerja',
    deskripsiIndo: 'Mampu merancang, menganalisis, dan mengevaluasi sistem infrastruktur teknik sipil (struktur gedung, keairan, geoteknik, dan transportasi) dengan mempertimbangkan standar keselamatan kerja, keandalan teknis, dan kelestarian lingkungan sesuai SNI dan standar internasional.',
    deskripsiInggris: 'Able to design, analyze, and evaluate civil engineering infrastructure systems (building structures, water resources, geotechnics, and transportation) considering occupational safety, technical reliability, and environmental sustainability in compliance with Indonesian National Standards (SNI) and international codes.'
  },
  {
    kategori: 'Kemampuan Kerja',
    deskripsiIndo: 'Mampu mengoperasikan perangkat lunak komputasi rekayasa sipil modern (BIM Revit, AutoCAD Civil 3D, SAP2000, ETABS, Plaxis, dan HEC-RAS) dalam proses perancangan dan manajemen konstruksi.',
    deskripsiInggris: 'Able to operate modern civil engineering software (BIM Revit, AutoCAD Civil 3D, SAP2000, ETABS, Plaxis, and HEC-RAS) in structural analysis, design, and construction project management.'
  },
  {
    kategori: 'Penguasaan Pengetahuan',
    deskripsiIndo: 'Menguasai konsep teoritis sains rekayasa dasar, mekanika teknik lanjutan, mekanika tanah, hidrolika, serta prinsip-prinsip manajemen biaya, waktu, dan mutu pelaksanaan konstruksi.',
    deskripsiInggris: 'Master the theoretical foundations of engineering science, advanced engineering mechanics, soil mechanics, hydraulics, as well as principles of project cost, time, and quality management.'
  },
  {
    kategori: 'Sikap Khusus & Manajerial',
    deskripsiIndo: 'Menjunjung tinggi etika profesi insinyur, integritas ilmiah, kepemimpinan kerja tim multidisiplin, dan komitmen terhadap keselamatan konstruksi (K3 Konstruksi) berwawasan pembangunan berkelanjutan di Provinsi Jambi dan tingkat nasional.',
    deskripsiInggris: 'Uphold professional engineering ethics, scientific integrity, multidisciplinary teamwork leadership, and dedication to construction safety (K3) oriented towards sustainable development in Jambi Province and nationwide.'
  }
];

export const CPL_STANDARD_LINGKUNGAN: CapaianPembelajaranSkpi[] = [
  {
    kategori: 'Kemampuan Kerja',
    deskripsiIndo: 'Mampu merancang instalasi pengolahan air minum (IPA), instalasi pengolahan air limbah domestik dan industri (IPAL), sistem pengelolaan persampahan padat, serta pengendalian pencemaran udara.',
    deskripsiInggris: 'Able to design drinking water treatment plants, domestic and industrial wastewater treatment plants, solid waste management systems, and air pollution control systems.'
  },
  {
    kategori: 'Kemampuan Kerja',
    deskripsiIndo: 'Mampu menyusun dokumen telaah kelayakan lingkungan, Analisis Mengenai Dampak Lingkungan (AMDAL), UKL-UPL, serta audit sistem manajemen lingkungan ISO 14001.',
    deskripsiInggris: 'Able to formulate environmental impact assessment documents (EIA/AMDAL), environmental management plans (UKL-UPL), and conduct ISO 14001 environmental management audits.'
  },
  {
    kategori: 'Penguasaan Pengetahuan',
    deskripsiIndo: 'Menguasai prinsip kimia lingkungan, mikrobiologi air dan limbah, toksikologi lingkungan, bioremediasi, serta regulasi dan baku mutu lingkungan hidup.',
    deskripsiInggris: 'Master the principles of environmental chemistry, water and wastewater microbiology, environmental toxicology, bioremediation, and environmental standards regulations.'
  },
  {
    kategori: 'Sikap Khusus & Manajerial',
    deskripsiIndo: 'Berkomitmen pada pelestarian daya dukung lingkungan dan keselamatan ekosistem lahan basah serta kawasan perkebunan dan pertambangan di Sumatera.',
    deskripsiInggris: 'Committed to preserving environmental carrying capacity and the ecological safety of wetlands, plantations, and mining sectors across Sumatra.'
  }
];

export const CPL_STANDARD_LISTRIK: CapaianPembelajaranSkpi[] = [
  {
    kategori: 'Kemampuan Kerja',
    deskripsiIndo: 'Mampu melaksanakan perakitan, instalasi, pengujian, perawatan, dan troubleshooting panel distribusi tenaga listrik tegangan rendah dan menengah serta motor-motor listrik industri.',
    deskripsiInggris: 'Able to execute assembly, installation, testing, maintenance, and troubleshooting of low/medium voltage power distribution panels and industrial electric motors.'
  },
  {
    kategori: 'Kemampuan Kerja',
    deskripsiIndo: 'Mampu memprogram dan mengintegrasikan kontrol logika terprogram (PLC), inverter drive, sensor industri, dan sistem SCADA.',
    deskripsiInggris: 'Able to program and integrate Programmable Logic Controllers (PLC), variable frequency drives, industrial sensors, and supervisory SCADA systems.'
  },
  {
    kategori: 'Penguasaan Pengetahuan',
    deskripsiIndo: 'Menguasai konsep dasar elektronika daya, sistem proteksi kelistrikan, standar PUIL (Persyaratan Umum Instalasi Listrik), dan efisiensi energi kelistrikan.',
    deskripsiInggris: 'Master the core concepts of power electronics, electrical protection systems, Indonesian Electrical Installation Regulations (PUIL), and energy efficiency.'
  },
  {
    kategori: 'Sikap Khusus & Manajerial',
    deskripsiIndo: 'Mematuhi standar Keselamatan dan Kesehatan Kerja (K3 Listrik), bekerja disiplin, bertanggung jawab, dan memiliki kesiapan kerja vokasional tinggi.',
    deskripsiInggris: 'Strictly comply with Electrical Occupational Safety & Health (K3) standards, show high discipline, responsibility, and vocational workplace readiness.'
  }
];

export const INITIAL_SKPI_RECORDS: SkpiRecord[] = [
  {
    id: 'SKPI-2026-001',
    nomorSkpi: 'SKPI/FT-UNBARI/2026/00142',
    nomorIjazahNasional: '100412026001098',
    nim: '2100822201001',
    namaMahasiswa: 'Ahmad Fauzi',
    tempatTanggalLahir: 'Jambi, 14 Mei 2003',
    tahunMasuk: 2021,
    tahunLulus: 2026,
    gelarAkademik: 'Sarjana Teknik (S.T.)',
    gelarInggris: 'Bachelor of Engineering (B.Eng.)',
    prodiId: 'SIPIL',
    programStudi: 'Teknik Sipil',
    programStudiInggris: 'Civil Engineering',
    jenjangKkni: 'Level 6 (Sarjana)',
    levelKkniAngka: 6,
    persyaratanPenerimaan: 'Lulus Sekolah Menengah Atas (SMA/MA IPA) atau Sekolah Menengah Kejuruan (SMK) Teknik serumpun dan lulus seleksi masuk UNBARI.',
    persyaratanPenerimaanInggris: 'Graduated from Senior High School (Natural Science stream) or Vocational High School (Technical) and passed UNBARI Entrance Examination.',
    bahasaPengantar: 'Bahasa Indonesia (dengan istilah dan referensi teknis bilingual)',
    sistemPenilaian: 'Skala 0.00 - 4.00 (A = 4.0, B+ = 3.5, B = 3.0, C+ = 2.5, C = 2.0, D = 1.0, E = 0.0). IPK Kelulusan Minimal 2.00.',
    jenisDanJenjangPendidikanLanjutan: 'Program Pendidikan Profesi Insinyur (PPI) / Program Magister (S2) Teknik Sipil (KKNI Level 7 & 8).',
    cplList: CPL_STANDARD_SIPIL,
    sertifikasiList: [
      {
        id: 'CERT-01',
        namaSertifikatIndo: 'Sertifikat Kompetensi Kerja (SKK) Ahli Muda K3 Konstruksi Jenjang 6',
        namaSertifikatInggris: 'Occupational Health and Safety (K3) Construction Specialist Certificate Level 6',
        penerbit: 'Lembaga Pengembangan Jasa Konstruksi (LPJK) & BNSP',
        nomorSertifikat: 'LPJK-K3-JMB-2025-09881',
        tahunPerolehan: 2025,
        masaBerlaku: '2025 - 2030'
      },
      {
        id: 'CERT-02',
        namaSertifikatIndo: 'Sertifikasi Keahlian Pemodelan Struktur BIM Revit Architecture & Structure',
        namaSertifikatInggris: 'Certified Structural Modeling Specialist - Autodesk Revit BIM',
        penerbit: 'Autodesk Certified Training Center Indonesia',
        nomorSertifikat: 'AC-RVT-ID-2024-55412',
        tahunPerolehan: 2024,
        masaBerlaku: 'Seumur Hidup'
      }
    ],
    prestasiList: [
      {
        id: 'PRES-01',
        namaPrestasiIndo: 'Juara II Kompetisi Jembatan Balsa Tingkat Perguruan Tinggi Nasional (Civil Expo Sumatera)',
        namaPrestasiInggris: '2nd Place National Balsa Bridge Building Competition (Civil Expo Sumatra)',
        tingkat: 'Nasional',
        peringkat: 'Juara II',
        penyelenggara: 'Forum Komunikasi Mahasiswa Teknik Sipil Indonesia (FKMTSI)',
        tahun: 2024
      },
      {
        id: 'PRES-02',
        namaPrestasiIndo: 'Program Magang Mahasiswa Bersertifikat (PMMB) di Balai Pelaksanaan Jalan Nasional (BPJN) IV Jambi',
        namaPrestasiInggris: 'Certified Student Internship Program at National Road Implementation Agency (BPJN) IV Jambi',
        tingkat: 'Provinsi',
        peringkat: 'Lulus dengan Nilai Sangat Baik (A)',
        penyelenggara: 'Kementerian PUPR RI',
        tahun: 2025
      }
    ],
    ormawaList: [
      {
        id: 'ORM-01',
        namaOrganisasiIndo: 'Himpunan Mahasiswa Sipil (HMS) FT UNBARI',
        namaOrganisasiInggris: 'Civil Engineering Student Association FT UNBARI',
        jabatan: 'Ketua Divisi Penelitian dan Pengembangan Rekayasa',
        periode: '2023 - 2024',
        kategori: 'Organisasi Kampus'
      },
      {
        id: 'ORM-02',
        namaOrganisasiIndo: 'Bakti Inovasi Desa FT UNBARI di Muaro Jambi',
        namaOrganisasiInggris: 'Community Service: Rural Water Sanitation Development in Muaro Jambi',
        jabatan: 'Koordinator Lapangan Perancangan Sanitasi & Jembatan Desa',
        periode: '2024',
        kategori: 'Pengabdian Masyarakat / Relawan'
      }
    ],
    status: 'Disahkan Dekan',
    tanggalPenerbitan: '2026-10-25',
    penandatanganNama: DEKAN_FAKULTAS_TEKNIK.nama,
    penandatanganJabatan: DEKAN_FAKULTAS_TEKNIK.jabatan,
    penandatanganNipNidn: DEKAN_FAKULTAS_TEKNIK.nidn,
    catatanVerifikasi: 'Berkas portofolio prestasi dan sertifikat LPJK telah diverifikasi sah oleh Tim Pengelola SKPI FT UNBARI.'
  },
  {
    id: 'SKPI-2026-002',
    nomorSkpi: 'SKPI/FT-UNBARI/2026/00143',
    nomorIjazahNasional: '100412026002045',
    nim: '2100822202003',
    namaMahasiswa: 'Nabila Putri Salma',
    tempatTanggalLahir: 'Muara Bulian, 22 Agustus 2003',
    tahunMasuk: 2021,
    tahunLulus: 2026,
    gelarAkademik: 'Sarjana Teknik (S.T.)',
    gelarInggris: 'Bachelor of Engineering (B.Eng.)',
    prodiId: 'LINGKUNGAN',
    programStudi: 'Teknik Lingkungan',
    programStudiInggris: 'Environmental Engineering',
    jenjangKkni: 'Level 6 (Sarjana)',
    levelKkniAngka: 6,
    persyaratanPenerimaan: 'Lulus Sekolah Menengah Atas (SMA/MA IPA) atau SMK Kimia/Lingkungan dan lulus seleksi masuk UNBARI.',
    persyaratanPenerimaanInggris: 'Graduated from Senior High School (Science Stream) or Vocational School and passed UNBARI Entrance Examination.',
    bahasaPengantar: 'Bahasa Indonesia (dengan istilah dan referensi teknis bilingual)',
    sistemPenilaian: 'Skala 0.00 - 4.00. IPK Kelulusan Minimal 2.00.',
    jenisDanJenjangPendidikanLanjutan: 'Program Magister (S2) Teknik Lingkungan / Ilmu Pengelolaan Sumber Daya Alam (KKNI Level 8).',
    cplList: CPL_STANDARD_LINGKUNGAN,
    sertifikasiList: [
      {
        id: 'CERT-LKG-01',
        namaSertifikatIndo: 'Sertifikasi Kompetensi Penyusun AMDAL (Analisis Mengenai Dampak Lingkungan) Tingkat Dasar',
        namaSertifikatInggris: 'Certified Environmental Impact Assessment (EIA) Preparer Certificate',
        penerbit: 'Lembaga Sertifikasi Profesi (LSP) Lingkungan Hidup & Kehutanan RI',
        nomorSertifikat: 'LSP-LH-2025-0189',
        tahunPerolehan: 2025,
        masaBerlaku: '2025 - 2028'
      }
    ],
    prestasiList: [
      {
        id: 'PRES-LKG-01',
        namaPrestasiIndo: 'Juara I Lomba Karya Tulis Ilmiah Lingkungan Nasional (Inovasi Pengolahan Limbah Cair Kelapa Sawit)',
        namaPrestasiInggris: '1st Place National Environmental Scientific Paper Competition (Palm Oil Wastewater Treatment Innovation)',
        tingkat: 'Nasional',
        peringkat: 'Juara I',
        penyelenggara: 'Kementerian Lingkungan Hidup dan Kehutanan (KLHK)',
        tahun: 2024
      }
    ],
    ormawaList: [
      {
        id: 'ORM-LKG-01',
        namaOrganisasiIndo: 'Himpunan Mahasiswa Teknik Lingkungan (HMTL) FT UNBARI',
        namaOrganisasiInggris: 'Environmental Engineering Student Association FT UNBARI',
        jabatan: 'Sekretaris Umum',
        periode: '2023 - 2024',
        kategori: 'Organisasi Kampus'
      }
    ],
    status: 'Disahkan Dekan',
    tanggalPenerbitan: '2026-10-25',
    penandatanganNama: WAKIL_DEKAN_1.nama,
    penandatanganJabatan: `${WAKIL_DEKAN_1.jabatan} (a.n. Dekan FT UNBARI)`,
    penandatanganNipNidn: WAKIL_DEKAN_1.nidn,
    catatanVerifikasi: 'Diverifikasi oleh Wadek I Hadrah, ST., MT bidang Akademik.'
  },
  {
    id: 'SKPI-2026-003',
    nomorSkpi: 'SKPI/FT-UNBARI/2026/00144',
    nomorIjazahNasional: '100412026003012',
    nim: '2200822301004',
    namaMahasiswa: 'M. Teguh Pratama',
    tempatTanggalLahir: 'Sarolangun, 08 Maret 2004',
    tahunMasuk: 2022,
    tahunLulus: 2026,
    gelarAkademik: 'Ahli Madya Teknik (A.Md.T.)',
    gelarInggris: 'Associate Expert in Engineering (A.Md.T.)',
    prodiId: 'LISTRIK_D3',
    programStudi: 'D3 Teknik Listrik',
    programStudiInggris: 'Electrical Engineering (Diploma III)',
    jenjangKkni: 'Level 5 (Diploma III)',
    levelKkniAngka: 5,
    persyaratanPenerimaan: 'Lulus SMA/MA IPA atau SMK Ketenagalistrikan/Elektronika dan lulus seleksi masuk UNBARI.',
    persyaratanPenerimaanInggris: 'Graduated from Senior High School or Vocational School (Electrical) and passed entrance exam.',
    bahasaPengantar: 'Bahasa Indonesia (dengan standar simbol kelistrikan IEC/PUIL)',
    sistemPenilaian: 'Skala 0.00 - 4.00. IPK Minimal 2.00.',
    jenisDanJenjangPendidikanLanjutan: 'Program Sarjana Terapan (D4) / S1 Teknik Elektro Alih Jenjang (KKNI Level 6).',
    cplList: CPL_STANDARD_LISTRIK,
    sertifikasiList: [
      {
        id: 'CERT-LST-01',
        namaSertifikatIndo: 'Sertifikat Kompetensi Teknisi Madya Instalasi & Pemanfaatan Tenaga Listrik',
        namaSertifikatInggris: 'Associate Certified Electrical Installation & Utilization Technician',
        penerbit: 'Badan Nasional Sertifikasi Profesi (BNSP) & Ditjen Ketenagalistrikan ESDM',
        nomorSertifikat: 'BNSP-LISTRIK-2025-09941',
        tahunPerolehan: 2025,
        masaBerlaku: '2025 - 2028'
      }
    ],
    prestasiList: [
      {
        id: 'PRES-LST-01',
        namaPrestasiIndo: 'Finalis Lomba PLC & Otomasi Industri Vokasi Wilayah Sumatera Bagian Selatan',
        namaPrestasiInggris: 'Finalist Industrial PLC Automation Vocational Competition Southern Sumatra',
        tingkat: 'Provinsi',
        peringkat: 'Finalis Harapan I',
        penyelenggara: 'Politeknik Negeri Sriwijaya',
        tahun: 2024
      }
    ],
    ormawaList: [
      {
        id: 'ORM-LST-01',
        namaOrganisasiIndo: 'Himpunan Mahasiswa Teknik Listrik (HMTL-D3) FT UNBARI',
        namaOrganisasiInggris: 'Electrical Engineering Student Club FT UNBARI',
        jabatan: 'Koordinator Bengkel & Peralatan',
        periode: '2024 - 2025',
        kategori: 'Organisasi Kampus'
      }
    ],
    status: 'Disahkan Dekan',
    tanggalPenerbitan: '2026-10-25',
    penandatanganNama: DEKAN_FAKULTAS_TEKNIK.nama,
    penandatanganJabatan: DEKAN_FAKULTAS_TEKNIK.jabatan,
    penandatanganNipNidn: DEKAN_FAKULTAS_TEKNIK.nidn,
    catatanVerifikasi: 'Portofolio Uji Kompetensi Ketenagalistrikan dinyatakan Valid.'
  }
];
