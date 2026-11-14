import { AuthUser } from '../types/index';

export interface PredefinedAccount {
  user: AuthUser;
  defaultPassword: string;
  badgeColor: string;
  description: string;
}

export const PREDEFINED_ACCOUNTS: PredefinedAccount[] = [
  {
    user: {
      id: 'usr_dekan_01',
      email: 'fadlieyster@gmail.com',
      displayName: 'Ir. Fadli Eka Yandra, S.T., M.T.',
      role: 'dekan',
      roleLabel: 'Dekan FT UNBARI',
      nidn: '1004077102',
      prodiId: 'SEMUA_FT',
      prodiNama: 'Fakultas Teknik (Seluruh Prodi)',
      photoURL: '/assets/images/dosen_listrik_fadli_1792394515355.jpg',
      jabatan: 'Dekan Fakultas Teknik Universitas Batanghari Jambi',
      authProvider: 'credential'
    },
    defaultPassword: 'dekanunbari',
    badgeColor: 'bg-red-700 text-white',
    description: 'Akses Penuh Dekanat, Supervisi Seluruh Program Studi, Pengesahan Yudisium & Anggaran'
  },
  {
    user: {
      id: 'usr_kaprodi_sipil_01',
      email: 'kaprodi.sipil@unbari.ac.id',
      displayName: 'Ir. Rioni Rizki Aldiansyah, ST., MT, IPM, ASEAN Eng.',
      role: 'kaprodi',
      roleLabel: 'Kaprodi S1 Teknik Sipil',
      nidn: '1013069302',
      prodiId: 'SIPIL',
      prodiNama: 'S1 Teknik Sipil',
      photoURL: '/assets/images/kaprodi_sipil_rioni_1792380477710.jpg',
      jabatan: 'Ketua Program Studi S1 Teknik Sipil',
      authProvider: 'credential'
    },
    defaultPassword: 'sipilunbari',
    badgeColor: 'bg-blue-700 text-white',
    description: 'Akses Manajemen S1 Teknik Sipil, Verifikasi KRS/BAP, Monitoring Kritis Mahasiswa & IKU-6'
  },
  {
    user: {
      id: 'usr_kaprodi_lingkungan_01',
      email: 'kaprodi.lingkungan@unbari.ac.id',
      displayName: 'Ir. Marhadi, ST., MT',
      role: 'kaprodi',
      roleLabel: 'Kaprodi S1 Teknik Lingkungan',
      nidn: '1008038002',
      prodiId: 'LINGKUNGAN',
      prodiNama: 'S1 Teknik Lingkungan',
      photoURL: '/assets/images/kaprodi_lingkungan_marhadi_1792382473674.jpg',
      jabatan: 'Ketua Program Studi S1 Teknik Lingkungan',
      authProvider: 'credential'
    },
    defaultPassword: 'lingkunganunbari',
    badgeColor: 'bg-emerald-700 text-white',
    description: 'Akses Manajemen S1 Teknik Lingkungan, Audit Sidak Perkuliahan, Lab & Kerjasama'
  },
  {
    user: {
      id: 'usr_kaprodi_listrik_01',
      email: 'kaprodi.listrik@unbari.ac.id',
      displayName: 'Ir. Hendi Matalata, ST., MT, IPP',
      role: 'kaprodi',
      roleLabel: 'Kaprodi D3 Teknik Listrik',
      nidn: '1006058002',
      prodiId: 'LISTRIK_D3',
      prodiNama: 'D3 Teknik Listrik (Vokasi)',
      photoURL: '/assets/images/kaprodi_listrik_hendi_1792382936472.jpg',
      jabatan: 'Ketua Program Studi D3 Teknik Listrik',
      authProvider: 'credential'
    },
    defaultPassword: 'listrikunbari',
    badgeColor: 'bg-amber-600 text-white',
    description: 'Akses Manajemen Vokasi D3 Teknik Listrik, Laboratorium Bengkel & Kerja Praktek'
  },
  {
    user: {
      id: 'usr_staff_tu_01',
      email: 'tu.teknik@unbari.ac.id',
      displayName: 'Budi Santoso, S.Kom.',
      role: 'staff',
      roleLabel: 'Tata Usaha & Kemahasiswaan',
      nip: '198504122012011005',
      prodiId: 'SEMUA_FT',
      prodiNama: 'Sekretariat Dekanat FT',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      jabatan: 'Staf Administrasi Akademik & Sarana Prasarana',
      authProvider: 'credential'
    },
    defaultPassword: 'staffunbari',
    badgeColor: 'bg-slate-700 text-white',
    description: 'Pelayanan Surat Masuk/Keluar, Peminjaman Ruang Kuliah, Sarpras & Verifikasi Berkas'
  }
];

export function findUserByCredentials(identifier: string, password: string): AuthUser | null {
  const cleanId = identifier.trim().toLowerCase();
  const found = PREDEFINED_ACCOUNTS.find(acc => {
    const emailMatch = acc.user.email.toLowerCase() === cleanId;
    const nidnMatch = acc.user.nidn === cleanId;
    const nipMatch = acc.user.nip === cleanId;
    return (emailMatch || nidnMatch || nipMatch) && acc.defaultPassword === password;
  });

  return found ? found.user : null;
}

export function mapFirebaseUserToAuthUser(fbUser: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): AuthUser {
  const emailLower = (fbUser.email || '').toLowerCase();
  
  // Check if it's Dekan Ir. Fadli Eka Yandra
  if (emailLower === 'fadlieyster@gmail.com' || emailLower.includes('fadli') || emailLower.includes('dekan')) {
    return {
      id: fbUser.uid,
      email: fbUser.email || 'fadlieyster@gmail.com',
      displayName: 'Ir. Fadli Eka Yandra, S.T., M.T.',
      role: 'dekan',
      roleLabel: 'Dekan FT UNBARI',
      nidn: '1004077102',
      prodiId: 'SEMUA_FT',
      prodiNama: 'Fakultas Teknik (Seluruh Prodi)',
      photoURL: fbUser.photoURL || '/assets/images/dosen_listrik_fadli_1792394515355.jpg',
      jabatan: 'Dekan Fakultas Teknik Universitas Batanghari Jambi',
      authProvider: 'firebase_google'
    };
  }

  // Check if it corresponds to one of the Kaprodi accounts
  if (emailLower.includes('sipil') || emailLower.includes('rioni')) {
    return {
      id: fbUser.uid,
      email: fbUser.email || 'kaprodi.sipil@unbari.ac.id',
      displayName: 'Ir. Rioni Rizki Aldiansyah, ST., MT, IPM, ASEAN Eng.',
      role: 'kaprodi',
      roleLabel: 'Kaprodi S1 Teknik Sipil',
      nidn: '1013069302',
      prodiId: 'SIPIL',
      prodiNama: 'S1 Teknik Sipil',
      photoURL: fbUser.photoURL || '/assets/images/kaprodi_sipil_rioni_1792380477710.jpg',
      jabatan: 'Ketua Program Studi S1 Teknik Sipil',
      authProvider: 'firebase_google'
    };
  }

  if (emailLower.includes('lingkungan') || emailLower.includes('marhadi')) {
    return {
      id: fbUser.uid,
      email: fbUser.email || 'kaprodi.lingkungan@unbari.ac.id',
      displayName: 'Ir. Marhadi, ST., MT',
      role: 'kaprodi',
      roleLabel: 'Kaprodi S1 Teknik Lingkungan',
      nidn: '1008038002',
      prodiId: 'LINGKUNGAN',
      prodiNama: 'S1 Teknik Lingkungan',
      photoURL: fbUser.photoURL || '/assets/images/kaprodi_lingkungan_marhadi_1792382473674.jpg',
      jabatan: 'Ketua Program Studi S1 Teknik Lingkungan',
      authProvider: 'firebase_google'
    };
  }

  if (emailLower.includes('listrik') || emailLower.includes('hendi')) {
    return {
      id: fbUser.uid,
      email: fbUser.email || 'kaprodi.listrik@unbari.ac.id',
      displayName: 'Ir. Hendi Matalata, ST., MT, IPP',
      role: 'kaprodi',
      roleLabel: 'Kaprodi D3 Teknik Listrik',
      nidn: '1006058002',
      prodiId: 'LISTRIK_D3',
      prodiNama: 'D3 Teknik Listrik (Vokasi)',
      photoURL: fbUser.photoURL || '/assets/images/kaprodi_listrik_hendi_1792382936472.jpg',
      jabatan: 'Ketua Program Studi D3 Teknik Listrik',
      authProvider: 'firebase_google'
    };
  }

  // Default authenticated user
  return {
    id: fbUser.uid,
    email: fbUser.email || 'user@unbari.ac.id',
    displayName: fbUser.displayName || 'Sivitas Akademika FT UNBARI',
    role: 'dosen',
    roleLabel: 'Dosen / Sivitas Akademika',
    prodiId: 'SIPIL',
    prodiNama: 'Fakultas Teknik UNBARI',
    photoURL: fbUser.photoURL || undefined,
    jabatan: 'Dosen Pengajar FT UNBARI',
    authProvider: 'firebase_google'
  };
}
