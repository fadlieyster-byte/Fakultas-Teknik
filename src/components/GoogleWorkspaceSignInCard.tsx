import React from 'react';
import { CheckCircle2, LogOut, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import {
  WorkspaceAuthSession,
  WorkspaceSessionHint,
  OFFICIAL_CLASSROOM_ADMIN_EMAIL
} from '../utils/googleWorkspaceService';

interface GoogleWorkspaceSignInCardProps {
  session: WorkspaceAuthSession | null;
  sessionHint?: WorkspaceSessionHint | null;
  needsRefresh?: boolean;
  isExpiringSoon?: boolean;
  tokenRemainingMinutes?: number | null;
  isSigningIn: boolean;
  onSignIn: () => void;
  onRefreshToken?: () => void;
  onSignOut: () => void;
}

export const GoogleWorkspaceSignInCard: React.FC<GoogleWorkspaceSignInCardProps> = ({
  session,
  sessionHint,
  needsRefresh = false,
  isExpiringSoon = false,
  tokenRemainingMinutes = null,
  isSigningIn,
  onSignIn,
  onRefreshToken,
  onSignOut
}) => {
  return (
    <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          session ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {session ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Otorisasi Google Workspace API (Classroom, Drive, Calendar, Forms, Sheets &amp; Gmail)
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              session
                ? isExpiringSoon
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {session
                ? `Terhubung: ${session.userEmail}${
                    tokenRemainingMinutes !== null ? ` (~${tokenRemainingMinutes} mnt)` : ''
                  }`
                : needsRefresh && sessionHint
                ? `Sesi Terjeda (${sessionHint.userEmail}) — Perlu Perbarui Token`
                : 'Belum Terhubung (Mode Pratinjau)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
            Akun resmi pengelola kelas FT UNBARI: <strong className="font-mono text-emerald-900">{OFFICIAL_CLASSROOM_ADMIN_EMAIL}</strong>.
            {session
              ? ` Token sesi OAuth 2.0 aktif (disimpan di memori) sejak pukul ${session.grantedAt} WIB.`
              : needsRefresh && sessionHint
              ? ` Klik "Perbarui Token OAuth" untuk mengaktifkan ulang akses Google Drive & Workspace akun ${sessionHint.userEmail}.`
              : ' Hubungkan akun Google Workspace Anda untuk menjalankan sinkronisasi Classroom, Calendar, Drive, Forms, Sheets, dan pengiriman email Gmail secara langsung.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {session ? (
          <>
            {onRefreshToken && (
              <button
                type="button"
                onClick={onRefreshToken}
                disabled={isSigningIn}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-[#ecfdf5] hover:bg-emerald-100 text-xs font-bold text-[#065f46] transition-colors cursor-pointer disabled:opacity-60"
                title="Perbarui masa berlaku token OAuth 2.0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSigningIn ? 'animate-spin' : ''}`} />
                <span>{isExpiringSoon ? 'Perpanjang Token' : 'Refresh Token'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Putuskan Sesi OAuth</span>
            </button>
          </>
        ) : needsRefresh && onRefreshToken ? (
          <button
            type="button"
            onClick={onRefreshToken}
            disabled={isSigningIn}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#065f46] hover:bg-emerald-900 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSigningIn ? 'animate-spin' : ''}`} />
            <span>{isSigningIn ? 'Memperbarui Token...' : 'Perbarui Token OAuth'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            disabled={isSigningIn}
            className="gsi-material-button inline-flex items-center gap-2.5 bg-white hover:bg-[#f8faff] text-[#1f1f1f] border border-[#747775] rounded-[4px] h-10 px-3.5 text-[14px] font-medium shadow-2xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>{isSigningIn ? 'Menghubungkan Google...' : 'Sign in with Google'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface WorkspaceMutationConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const WorkspaceMutationConfirmDialog: React.FC<WorkspaceMutationConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  actionLabel,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-2xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#065f46] hover:bg-emerald-900 rounded-lg shadow-xs"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
