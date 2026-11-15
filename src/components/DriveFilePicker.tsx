import React, { useState } from 'react';
import { FolderSearch, Loader2 } from 'lucide-react';

export interface PickedDriveDocument {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  sizeBytes?: number;
  lastEditedUtc?: number;
  iconUrl?: string;
}

interface DriveFilePickerProps {
  accessToken: string | null;
  needsRefresh?: boolean;
  isAuthenticating?: boolean;
  bkdFolderId?: string | null;
  multiSelect?: boolean;
  disabled?: boolean;
  label?: string;
  title?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  onFilesPicked: (files: PickedDriveDocument[]) => void;
  onRequestSignIn: () => Promise<string | null | void>;
  onRequestRefresh?: () => Promise<string | null | void>;
  onError?: (message: string) => void;
}

interface GooglePickerDoc {
  id: string;
  name?: string;
  mimeType?: string;
  url?: string;
  sizeBytes?: number;
  lastEditedUtc?: number;
  iconUrl?: string;
}

interface GooglePickerResponse {
  action: string;
  docs?: GooglePickerDoc[];
}

interface GooglePickerBuilderInstance {
  addView: (view: unknown) => GooglePickerBuilderInstance;
  enableFeature: (feature: unknown) => GooglePickerBuilderInstance;
  setOAuthToken: (token: string) => GooglePickerBuilderInstance;
  setOrigin: (origin: string) => GooglePickerBuilderInstance;
  setTitle: (title: string) => GooglePickerBuilderInstance;
  setLocale: (locale: string) => GooglePickerBuilderInstance;
  setCallback: (cb: (data: GooglePickerResponse) => void) => GooglePickerBuilderInstance;
  build: () => { setVisible: (visible: boolean) => void };
}

interface GoogleDocsViewInstance {
  setIncludeFolders: (include: boolean) => GoogleDocsViewInstance;
  setSelectFolderEnabled: (enabled: boolean) => GoogleDocsViewInstance;
  setParent: (folderId: string) => GoogleDocsViewInstance;
  setMimeTypes: (mimeTypes: string) => GoogleDocsViewInstance;
}

interface GoogleNamespace {
  picker?: {
    Action: {
      PICKED: string;
      CANCEL: string;
    };
    ViewId: {
      DOCS: string;
      PDFS: string;
      RECENTLY_PICKED: string;
    };
    Feature: {
      MULTISELECT_ENABLED: string;
      NAV_HIDDEN: string;
    };
    PickerBuilder: new () => GooglePickerBuilderInstance;
    DocsView: new (viewId?: string) => GoogleDocsViewInstance;
  };
}

interface GapiNamespace {
  load: (
    libraries: string,
    options: {
      callback: () => void;
      onerror?: () => void;
      timeout?: number;
      ontimeout?: () => void;
    }
  ) => void;
}

declare global {
  interface Window {
    gapi?: GapiNamespace;
    google?: GoogleNamespace;
  }
}

const GAPI_SCRIPT_SRC = 'https://apis.google.com/js/api.js';
let pickerLoaderPromise: Promise<void> | null = null;

function ensureGooglePickerLoaded(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Picker hanya tersedia di browser.'));
  }

  if (window.google?.picker?.PickerBuilder) {
    return Promise.resolve();
  }

  if (pickerLoaderPromise) {
    return pickerLoaderPromise;
  }

  pickerLoaderPromise = new Promise<void>((resolve, reject) => {
    const loadPickerModule = () => {
      if (!window.gapi?.load) {
        pickerLoaderPromise = null;
        reject(new Error('Library Google API (gapi) gagal diinisialisasi.'));
        return;
      }
      window.gapi.load('picker', {
        callback: () => {
          if (window.google?.picker?.PickerBuilder) {
            resolve();
          } else {
            pickerLoaderPromise = null;
            reject(new Error('Modul Google Drive Picker tidak tersedia setelah pemuatan.'));
          }
        },
        onerror: () => {
          pickerLoaderPromise = null;
          reject(new Error('Gagal memuat modul Google Drive Picker.'));
        },
        timeout: 15000,
        ontimeout: () => {
          pickerLoaderPromise = null;
          reject(new Error('Waktu muat modul Google Drive Picker habis.'));
        }
      });
    };

    if (window.gapi?.load) {
      loadPickerModule();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GAPI_SCRIPT_SRC}"]`
    );

    if (existingScript) {
      existingScript.addEventListener('load', loadPickerModule, { once: true });
      existingScript.addEventListener(
        'error',
        () => {
          pickerLoaderPromise = null;
          reject(new Error('Gagal mengunduh skrip Google API (apis.google.com).'));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = GAPI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = loadPickerModule;
    script.onerror = () => {
      pickerLoaderPromise = null;
      reject(new Error('Gagal mengunduh skrip Google Drive Picker (apis.google.com).'));
    };
    document.head.appendChild(script);
  });

  return pickerLoaderPromise;
}

function resolvePickerOrigin(): string {
  if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
    return window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1];
  }
  return window.location.origin;
}

export const DriveFilePicker: React.FC<DriveFilePickerProps> = ({
  accessToken,
  needsRefresh = false,
  isAuthenticating = false,
  bkdFolderId = null,
  multiSelect = true,
  disabled = false,
  label = 'Pilih Dokumen dari Google Drive',
  title = 'Pilih Dokumen Bukti BKD — Google Drive',
  variant = 'primary',
  className = '',
  onFilesPicked,
  onRequestSignIn,
  onRequestRefresh,
  onError
}) => {
  const [isOpeningPicker, setIsOpeningPicker] = useState(false);

  const openPickerWithToken = async (token: string) => {
    await ensureGooglePickerLoaded();
    const pickerApi = window.google?.picker;
    if (!pickerApi) {
      throw new Error('Google Drive Picker API belum siap.');
    }

    const pickerOrigin = resolvePickerOrigin();
    const builder = new pickerApi.PickerBuilder()
      .setOAuthToken(token)
      .setOrigin(pickerOrigin)
      .setTitle(title)
      .setLocale('id')
      .setCallback((data: GooglePickerResponse) => {
        if (data.action === pickerApi.Action.PICKED && Array.isArray(data.docs)) {
          const mapped: PickedDriveDocument[] = data.docs.map(doc => ({
            id: doc.id,
            name: doc.name || `Dokumen_${doc.id}.pdf`,
            mimeType: doc.mimeType || 'application/pdf',
            url: doc.url || `https://drive.google.com/file/d/${doc.id}/view`,
            sizeBytes: typeof doc.sizeBytes === 'number' ? doc.sizeBytes : undefined,
            lastEditedUtc:
              typeof doc.lastEditedUtc === 'number' ? doc.lastEditedUtc : undefined,
            iconUrl: doc.iconUrl
          }));
          if (mapped.length > 0) {
            onFilesPicked(mapped);
          }
        }
      });

    if (bkdFolderId) {
      const bkdFolderView = new pickerApi.DocsView(pickerApi.ViewId.DOCS)
        .setParent(bkdFolderId)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false);
      builder.addView(bkdFolderView);
    }

    const allDocsView = new pickerApi.DocsView(pickerApi.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);
    builder.addView(allDocsView);

    const pdfView = new pickerApi.DocsView(pickerApi.ViewId.PDFS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);
    builder.addView(pdfView);

    if (multiSelect) {
      builder.enableFeature(pickerApi.Feature.MULTISELECT_ENABLED);
    }

    const picker = builder.build();
    picker.setVisible(true);
  };

  const handleOpenPicker = async () => {
    if (disabled || isOpeningPicker || isAuthenticating) return;
    setIsOpeningPicker(true);
    try {
      let token = accessToken;
      if (!token) {
        const resultToken =
          needsRefresh && onRequestRefresh
            ? await onRequestRefresh()
            : await onRequestSignIn();
        if (typeof resultToken === 'string' && resultToken) {
          token = resultToken;
        }
      }

      if (!token) {
        return;
      }

      await openPickerWithToken(token);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal membuka Google Drive Picker. Pastikan pop-up dan akses Drive diizinkan.';
      onError?.(msg);
    } finally {
      setIsOpeningPicker(false);
    }
  };

  const isBusy = isOpeningPicker || isAuthenticating;
  const styleClasses =
    variant === 'primary'
      ? 'bg-[#065f46] hover:bg-emerald-900 text-white border border-emerald-800 shadow-xs'
      : 'bg-white hover:bg-[#ecfdf5] text-[#065f46] border border-emerald-300';

  return (
    <button
      type="button"
      onClick={() => void handleOpenPicker()}
      disabled={disabled || isBusy}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-55 ${styleClasses} ${className}`}
    >
      {isBusy ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <FolderSearch className="w-4 h-4 shrink-0" />
      )}
      <span>
        {isAuthenticating
          ? 'Menghubungkan Google Drive...'
          : isOpeningPicker
          ? 'Membuka Drive Picker...'
          : label}
      </span>
    </button>
  );
};
