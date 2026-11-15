import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { fetchDriveFileBlob } from '../utils/driveService';

// Configure pdf.js worker directly from installed pdfjs-dist bundle
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface DrivePdfPreviewTarget {
  namaFile: string;
  driveFileId?: string;
  mimeType?: string;
  driveLink?: string;
  dosenNama?: string;
  kategori?: string;
  tanggalUnggah?: string;
  ukuran?: string;
}

interface DrivePdfPreviewModalProps {
  isOpen: boolean;
  file: DrivePdfPreviewTarget | null;
  accessToken: string | null;
  onClose: () => void;
  onRequestSignIn?: () => void;
}

export const DrivePdfPreviewModal: React.FC<DrivePdfPreviewModalProps> = ({
  isOpen,
  file,
  accessToken,
  onClose,
  onRequestSignIn
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [effectiveMime, setEffectiveMime] = useState<string>('application/pdf');
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('dokumen.pdf');
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // react-pdf state
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.05);

  useEffect(() => {
    if (!isOpen || !file) {
      return;
    }

    let revoked = false;
    let createdUrl: string | null = null;

    setNumPages(0);
    setPageNumber(1);
    setScale(1.05);
    setTextPreview(null);
    setLoadError(null);
    setObjectUrl(null);
    setDownloadName(file.namaFile);

    if (!file.driveFileId || !accessToken) {
      return;
    }

    const loadFromDrive = async () => {
      setIsLoadingBlob(true);
      try {
        const res = await fetchDriveFileBlob(
          {
            id: file.driveFileId!,
            name: file.namaFile,
            mimeType: file.mimeType || 'application/pdf'
          },
          accessToken
        );

        if (revoked) return;

        setEffectiveMime(res.effectiveMimeType);
        setDownloadName(res.downloadName);

        const isText =
          res.effectiveMimeType.startsWith('text/') ||
          res.effectiveMimeType === 'application/json';
        if (isText) {
          const txt = await res.blob.text();
          if (!revoked) setTextPreview(txt);
        }

        createdUrl = URL.createObjectURL(res.blob);
        if (!revoked) {
          setObjectUrl(createdUrl);
        } else {
          URL.revokeObjectURL(createdUrl);
        }
      } catch (err) {
        if (!revoked) {
          setLoadError(
            err instanceof Error
              ? err.message
              : 'Gagal memuat pratinjau dokumen dari Google Drive.'
          );
        }
      } finally {
        if (!revoked) {
          setIsLoadingBlob(false);
        }
      }
    };

    void loadFromDrive();

    return () => {
      revoked = true;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, file, accessToken]);

  if (!isOpen || !file) return null;

  const isPdfFile =
    effectiveMime.includes('pdf') ||
    file.namaFile.toLowerCase().endsWith('.pdf') ||
    (file.mimeType || '').startsWith('application/vnd.google-apps.');

  const isImageFile = effectiveMime.startsWith('image/');

  const handleLocalDownload = () => {
    if (!objectUrl) return;
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-5xl rounded-2xl border border-emerald-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#065f46] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-white/15 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">{file.namaFile}</h3>
              <p className="text-[11px] text-emerald-100 truncate">
                {file.dosenNama ? `${file.dosenNama} · ` : ''}
                {file.kategori ? `${file.kategori} · ` : ''}
                {file.driveFileId
                  ? 'Pratinjau Dokumen Google Drive (Bukti BKD Dosen)'
                  : 'Arsip Lokal Repository BKD'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {objectUrl && (
              <button
                type="button"
                onClick={handleLocalDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            )}
            {file.driveLink && (
              <a
                href={file.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#065f46] hover:bg-emerald-50 text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di Drive</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau"
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/15 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Toolbar (Zoom & Page Controls when PDF loaded) */}
        {objectUrl && isPdfFile && !textPreview && (
          <div className="px-4 py-2 bg-[#fafaf5] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-semibold text-slate-700 px-2 tabular-nums">
                Halaman {pageNumber} / {numPages || '—'}
              </span>
              <button
                type="button"
                disabled={numPages > 0 && pageNumber >= numPages}
                onClick={() => setPageNumber(p => (numPages ? Math.min(numPages, p + 1) : p + 1))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 cursor-pointer"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setScale(s => Math.max(0.6, Number((s - 0.15).toFixed(2))))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-slate-800 w-14 text-center tabular-nums">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScale(s => Math.min(2.2, Number((s + 0.15).toFixed(2))))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Viewer Canvas */}
        <div className="flex-1 overflow-auto bg-slate-200/80 p-4 sm:p-6 flex justify-center items-start min-h-[420px]">
          {!file.driveFileId ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full text-center space-y-3 my-auto shadow-xs">
              <div className="w-11 h-11 mx-auto rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Berkas Tersimpan Lokal (Belum Diunggah ke Google Drive)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dokumen <strong>{file.namaFile}</strong> ({file.ukuran || '—'}) merupakan arsip lokal awal di Repository BKD. Unggah berkas BKD saat akun Google Drive terhubung agar pratinjau PDF streaming langsung tersedia di dalam modal ini.
              </p>
            </div>
          ) : !accessToken ? (
            <div className="bg-white border border-emerald-200 rounded-2xl p-6 max-w-md w-full text-center space-y-4 my-auto shadow-xs">
              <div className="w-11 h-11 mx-auto rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#065f46] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  Otorisasi Google Drive Diperlukan
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Masuk dengan Google OAuth untuk memuat streaming PDF terautentikasi untuk berkas{' '}
                  <strong>{file.namaFile}</strong> tanpa meninggalkan portal SIKAPRODI.
                </p>
              </div>
              {onRequestSignIn && (
                <button
                  type="button"
                  onClick={onRequestSignIn}
                  className="gsi-material-button inline-flex items-center gap-2 bg-white hover:bg-[#f8faff] text-[#1f1f1f] border border-[#747775] rounded-[4px] h-9 px-4 text-[13px] font-medium cursor-pointer"
                >
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          ) : isLoadingBlob ? (
            <div className="bg-white border border-slate-200 rounded-2xl px-6 py-8 flex flex-col items-center gap-3 my-auto shadow-xs">
              <Loader2 className="w-7 h-7 text-[#065f46] animate-spin" />
              <div className="text-xs font-semibold text-slate-700">
                Mengambil dokumen PDF dari Google Drive...
              </div>
            </div>
          ) : loadError ? (
            <div className="bg-white border border-rose-200 rounded-2xl p-6 max-w-md w-full text-center space-y-3 my-auto shadow-xs">
              <AlertTriangle className="w-7 h-7 text-rose-600 mx-auto" />
              <h4 className="text-sm font-bold text-rose-950">Gagal Memuat Pratinjau Drive</h4>
              <p className="text-xs text-rose-800 leading-relaxed">{loadError}</p>
            </div>
          ) : textPreview !== null ? (
            <pre className="bg-white border border-slate-200 rounded-xl p-5 text-xs font-mono text-slate-800 whitespace-pre-wrap max-w-3xl w-full shadow-xs leading-relaxed">
              {textPreview}
            </pre>
          ) : objectUrl && isImageFile ? (
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <img
                src={objectUrl}
                alt={file.namaFile}
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
          ) : objectUrl && isPdfFile ? (
            <div className="bg-white shadow-lg border border-slate-300 rounded-lg overflow-hidden">
              <Document
                file={objectUrl}
                onLoadSuccess={({ numPages: total }) => {
                  setNumPages(total);
                  setPageNumber(1);
                }}
                loading={
                  <div className="p-10 flex items-center gap-2 text-xs text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin text-[#065f46]" />
                    <span>Merender halaman PDF...</span>
                  </div>
                }
                error={
                  <div className="p-8 text-center text-xs text-rose-700 max-w-sm space-y-2">
                    <AlertTriangle className="w-6 h-6 mx-auto text-rose-600" />
                    <p>
                      Format berkas tidak dapat dirender sebagai PDF. Gunakan tombol Unduh atau Buka di Drive di atas.
                    </p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full text-center space-y-3 my-auto shadow-xs">
              <FileText className="w-7 h-7 text-[#065f46] mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Format Non-PDF Terdeteksi</h4>
              <p className="text-xs text-slate-600">
                Berkas <strong>{file.namaFile}</strong> bertipe <code>{effectiveMime}</code>. Klik tombol Unduh atau Buka di Drive di kanan atas untuk melihat isinya.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
