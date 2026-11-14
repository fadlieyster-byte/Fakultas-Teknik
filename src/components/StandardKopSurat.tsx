import React from 'react';
import { QrCodeSvg } from '../utils/qrHelper';

interface StandardKopSuratProps {
  prodiName?: string;
  subTitle?: string;
  showQrCode?: boolean;
  qrCodeUrl?: string;
  qrCodeTitle?: string;
  qrBadgeText?: string;
  className?: string;
}

export const StandardKopSurat: React.FC<StandardKopSuratProps> = ({
  prodiName,
  subTitle,
  showQrCode = false,
  qrCodeUrl,
  qrCodeTitle = 'Validasi Dokumen Digital',
  qrBadgeText = 'VERIFIKASI',
  className = ''
}) => {
  return (
    <div className={`standard-kop-surat mb-6 text-center relative font-sans ${className}`} data-kop-surat="true">
      <div className="flex items-center justify-between gap-4">
        {/* Logo Universitas Batanghari */}
        <div className="w-20 sm:w-24 shrink-0 flex items-center justify-center">
          <img
            src="/assets/aistudio/logo_unbari_8fe2adcb.png"
            alt="Logo Universitas Batanghari"
            className="w-18 h-18 sm:w-22 sm:h-22 object-contain"
          />
        </div>

        {/* Text Kop Surat Resmi Standar Universitas Batanghari (KOP_UNBARI Sample) */}
        <div className="text-center flex-1">
          <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-900 leading-tight">
            YAYASAN PENDIDIKAN JAMBI
          </h4>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-950 tracking-tight leading-tight mt-0.5">
            Universitas Batanghari
          </h2>
          <h3 className="text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-wide leading-tight mt-0.5">
            FAKULTAS TEKNIK
          </h3>
          {prodiName && (
            <p className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-tight mt-0.5">
              {prodiName}
            </p>
          )}
          {subTitle && (
            <p className="text-[10px] font-medium text-slate-700 italic">
              {subTitle}
            </p>
          )}
          <p className="text-[10px] sm:text-[11px] text-slate-800 font-normal mt-1 leading-snug">
            Website : <a href="https://universitasbatanghari.ac.id" target="_blank" rel="noopener noreferrer" className="text-[#0284c7] hover:underline font-medium">www.universitasbatanghari.ac.id</a>
            <span className="mx-2 text-slate-400">·</span>
            email : <a href="mailto:ftunbari.tpa@gmail.com" className="text-[#0284c7] hover:underline font-medium font-mono">ftunbari.tpa@gmail.com</a>
          </p>
          <p className="text-[9.5px] sm:text-[10.5px] text-slate-800 font-normal mt-0.5 leading-snug">
            Jln. Slamet Riyadi Broni Jambi No. 1 Telp. 0741-60103, 60673, 668073 Fax. 0741-60673 Kode Pos 36122
          </p>
        </div>

        {/* Optional Right-side QR Code / Verification Stamp */}
        {showQrCode ? (
          <div className="w-20 sm:w-24 shrink-0 flex flex-col items-center justify-center text-center">
            {qrCodeUrl ? (
              <QrCodeSvg
                value={qrCodeUrl}
                size={56}
                title={qrCodeTitle}
              />
            ) : (
              <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-500 font-mono text-center p-1">
                QR RESMI
              </div>
            )}
            <span className="text-[7.5px] font-mono font-bold text-slate-600 mt-0.5 uppercase tracking-wider">
              {qrBadgeText}
            </span>
          </div>
        ) : (
          <div className="w-20 sm:w-24 shrink-0 opacity-0 pointer-events-none" aria-hidden="true" />
        )}
      </div>

      {/* Official UNBARI Double Divider Line: Thick Top Bar + Thin Bottom Bar */}
      <div className="w-full mt-3 print:mt-2.5" aria-hidden="true">
        <div className="h-[3.5px] bg-slate-950 w-full" />
        <div className="h-[1px] bg-slate-950 w-full mt-[1.5px]" />
      </div>
    </div>
  );
};
