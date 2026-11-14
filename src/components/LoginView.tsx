import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  Building2, 
  Sparkles,
  UserCheck,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { AuthUser } from '../types/index';
import { PREDEFINED_ACCOUNTS, PredefinedAccount, findUserByCredentials, mapFirebaseUserToAuthUser } from '../data/authUsersData';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  onShowToast?: (msg: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onShowToast }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Quick Preset Selection
  const handleSelectPreset = (acc: PredefinedAccount) => {
    setIdentifier(acc.user.nidn || acc.user.nip || acc.user.email);
    setPassword(acc.defaultPassword);
    setErrorMessage(null);

    // Auto-login for high UX fluidity
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (rememberMe) {
        localStorage.setItem('sikaprodi_auth_user', JSON.stringify(acc.user));
      }
      onLoginSuccess(acc.user);
      if (onShowToast) {
        onShowToast(`Selamat datang, ${acc.user.displayName} (${acc.user.roleLabel})`);
      }
    }, 400);
  };

  // Form Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan NIDN, NIP, atau Email Institusi.');
      return;
    }
    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user = findUserByCredentials(identifier, password);
      if (user) {
        if (rememberMe) {
          localStorage.setItem('sikaprodi_auth_user', JSON.stringify(user));
        }
        onLoginSuccess(user);
        if (onShowToast) {
          onShowToast(`Berhasil masuk sebagai ${user.displayName}`);
        }
      } else {
        setErrorMessage('NIDN / Email atau kata sandi tidak cocok. Silakan coba kembali atau gunakan Akun Resmi Cepat di bawah.');
      }
    }, 500);
  };

  // Google Login via Firebase
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const mappedUser = mapFirebaseUserToAuthUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL
      });

      if (rememberMe) {
        localStorage.setItem('sikaprodi_auth_user', JSON.stringify(mappedUser));
      }
      onLoginSuccess(mappedUser);
      if (onShowToast) {
        onShowToast(`Berhasil masuk dengan Akun Google: ${mappedUser.displayName}`);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      // If popup closed by user or network error
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Jendela login Google ditutup sebelum autentikasi selesai.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage('Domain ini belum diizinkan di Firebase Console Auth. Anda dapat masuk langsung menggunakan NIDN / Akun Cepat di bawah.');
      } else {
        setErrorMessage(err.message || 'Gagal login via Google. Silakan gunakan login NIDN / Akun Cepat.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Gradients & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Navigation Bar */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
              alt="Logo Universitas Batanghari" 
              className="w-10 h-10 object-contain drop-shadow-md" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">SiKaprodi</span>
                <span className="text-[10px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded">FT UNBARI</span>
              </div>
              <p className="text-[11px] text-slate-400">Fakultas Teknik Universitas Batanghari Jambi</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Portal Resmi Manajemen Akademik &amp; Dekanat</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Brand Hero & Academic Context (5 Cols) */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Sistem Terintegrasi LAM-Teknik &amp; OBE</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Portal Masuk <br />
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  Pimpinan &amp; Dosen
                </span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Kelola kurikulum OBE, verifikasi KRS/KHS, pemantauan masa studi mahasiswa (EWS), BAP perkuliahan, hingga akreditasi 9 Kriteria dalam satu sistem terpusat.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Supervisi 3 Program Studi Teknik</h2>
                  <p className="text-[11px] text-slate-400">S1 Teknik Sipil, S1 Teknik Lingkungan, &amp; D3 Teknik Listrik</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Otentikasi Berlapis &amp; Akun Dekanat</h2>
                  <p className="text-[11px] text-slate-400">Masuk aman menggunakan Single Sign-On (SSO) Google atau NIDN Resmi</p>
                </div>
              </div>
            </div>

            {/* Dekan Quote / Signature */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-800/40 border border-blue-900/40 text-xs text-slate-300 flex items-center gap-3">
              <img 
                src="/assets/images/dosen_listrik_fadli_1792394515355.jpg" 
                alt="Dekan FT UNBARI" 
                className="w-10 h-10 rounded-full object-cover border border-blue-400/50 shrink-0" 
              />
              <div className="min-w-0">
                <div className="font-bold text-white text-xs truncate">Ir. Fadli Eka Yandra, S.T., M.T.</div>
                <div className="text-[10px] text-blue-300">Dekan Fakultas Teknik Universitas Batanghari</div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card & Quick Presets (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
            
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Masuk ke Sistem</h2>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan Akun Google terdaftar atau masukkan NIDN dan kata sandi Anda.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* 1. Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-xs text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Akun Google (SSO)'}</span>
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-slate-800 px-3 text-slate-400 font-semibold">
                  Atau NIDN / NIP / Email Institusi
                </span>
              </div>
            </div>

            {/* 2. Standard Credential Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  NIDN / NIP / Email UNBARI
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: 1004077102 atau fadlieyster@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 bg-slate-900"
                  />
                  <span>Ingat Saya di Perangkat Ini</span>
                </label>
                <span className="text-[11px] text-blue-400 hover:underline cursor-pointer" onClick={() => onShowToast && onShowToast('Silakan hubungi Bagian Tata Usaha FT untuk reset sandi resmi.')}>
                  Lupa sandi?
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-md hover:shadow-blue-500/20 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* 3. Quick Account Presets */}
            <div className="mt-6 pt-5 border-t border-slate-700/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Akses Cepat Sivitas Akademika (1-Klik Masuk)
                </span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Akun Resmi Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PREDEFINED_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.user.id}
                    type="button"
                    onClick={() => handleSelectPreset(acc)}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 hover:border-blue-500/60 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
                  >
                    <img 
                      src={acc.user.photoURL} 
                      alt={acc.user.displayName} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-600 shrink-0 group-hover:border-blue-400" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                          {acc.user.displayName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${acc.badgeColor}`}>
                          {acc.user.roleLabel}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          NIDN: {acc.user.nidn || acc.user.nip}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-4 text-center text-xs text-slate-500 bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Fakultas Teknik Universitas Batanghari Jambi. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>SIAKAD &bull; LMS &bull; EWS &bull; LAM-TEKNIK</span>
            <span className="font-mono text-emerald-400">v14.0 Stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
