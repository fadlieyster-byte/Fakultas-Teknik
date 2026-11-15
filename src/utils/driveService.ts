import { User, UserCredential } from 'firebase/auth';
import {
  clearWorkspaceSession,
  createGoogleDriveFolder,
  deleteGoogleDriveFile,
  downloadGoogleDriveFile,
  ensureSikaprodiDriveFolders,
  fetchGoogleDriveFileBlob,
  getGoogleDriveStorageQuota,
  getStoredWorkspaceSessionHint,
  getWorkspaceSession,
  GoogleDriveFileDto,
  hydrateWorkspaceSessionFromResult,
  initWorkspaceAuth,
  isWorkspaceTokenExpiringSoon,
  listGoogleDriveFiles,
  OAuthTokenVerificationResult,
  refreshGoogleWorkspaceSession,
  renameGoogleDriveFile,
  signInGoogleWorkspace,
  SikaprodiDriveFolderTree,
  subscribeWorkspaceSession,
  uploadFileToGoogleDrive,
  verifyGoogleOAuthToken,
  WorkspaceAuthSession,
  WorkspaceSessionHint
} from './googleWorkspaceService';

export type {
  GoogleDriveFileDto,
  OAuthTokenVerificationResult,
  SikaprodiDriveFolderTree,
  WorkspaceAuthSession,
  WorkspaceSessionHint
};

export type KaprodiDriveCategory = 'BKD' | 'AKREDITASI' | 'AKADEMIK';

export interface DriveUploadPayload {
  file: Blob | File | string;
  fileName: string;
  mimeType?: string;
  description?: string;
  accessToken?: string;
}

export interface DriveFolderSnapshot {
  folders: SikaprodiDriveFolderTree;
  files: GoogleDriveFileDto[];
}

export interface DriveFolderQuotaSummary {
  folderName: string;
  folderId: string;
  fileCount: number;
  folderUsedBytes: number;
  folderQuotaBytes: number;
  accountLimitBytes: number | null;
  accountUsageBytes: number | null;
  usagePercent: number;
  hasAccountQuota: boolean;
}

// Default departmental BKD archive allocation target (2 GB) when Google Workspace account has no fixed limit
const DEFAULT_BKD_FOLDER_QUOTA_BYTES = 2 * 1024 * 1024 * 1024;

// Per-session in-memory folder cache (cleared automatically on OAuth sign-out)
let cachedFolderTree: SikaprodiDriveFolderTree | null = null;
let cachedTokenOwner: string | null = null;

subscribeWorkspaceSession(session => {
  if (!session) {
    cachedFolderTree = null;
    cachedTokenOwner = null;
  } else if (cachedTokenOwner && cachedTokenOwner !== session.userEmail) {
    cachedFolderTree = null;
    cachedTokenOwner = session.userEmail;
  }
});

function requireAccessToken(explicitToken?: string): string {
  const token = explicitToken || getWorkspaceSession()?.accessToken;
  if (!token) {
    throw new Error(
      'Sesi Google Drive belum terhubung atau token OAuth 2.0 telah kedaluwarsa. Silakan autentikasi ulang dengan Google.'
    );
  }
  return token;
}

/**
 * Subscribes to Firebase auth state and reports whether a valid in-memory
 * Google Drive OAuth 2.0 token is active or re-consent is required.
 */
export function initDriveAuth(
  onAuthSuccess?: (user: User, session: WorkspaceAuthSession) => void,
  onAuthRequired?: () => void
): () => void {
  return initWorkspaceAuth(onAuthSuccess, onAuthRequired);
}

/**
 * Hydrates the in-memory OAuth 2.0 session directly from an initial
 * Firebase Google SSO `signInWithPopup` result (e.g. LoginView SSO).
 */
export function hydrateDriveAuthFromFirebaseResult(
  result: UserCredential
): WorkspaceAuthSession | null {
  const session = hydrateWorkspaceSessionFromResult(result);
  if (session) {
    cachedTokenOwner = session.userEmail;
    cachedFolderTree = null;
  }
  return session;
}

/**
 * Authenticates Kaprodi via Google OAuth 2.0 (Firebase signInWithPopup with Drive + Workspace scopes)
 * and stores the resulting OAuth access token strictly in memory.
 */
export async function authenticateDriveWithOAuth(
  loginHint?: string
): Promise<WorkspaceAuthSession> {
  const session = await signInGoogleWorkspace(loginHint);
  cachedTokenOwner = session.userEmail;
  cachedFolderTree = null;
  return session;
}

export async function refreshDriveAuthToken(
  loginHint?: string
): Promise<WorkspaceAuthSession> {
  const session = await refreshGoogleWorkspaceSession(loginHint);
  cachedTokenOwner = session.userEmail;
  return session;
}

export async function verifyDriveAuthToken(
  explicitToken?: string
): Promise<OAuthTokenVerificationResult> {
  return verifyGoogleOAuthToken(explicitToken);
}

export function getDriveAuthSession(): WorkspaceAuthSession | null {
  return getWorkspaceSession();
}

export function getDriveSessionHint(): WorkspaceSessionHint | null {
  return getStoredWorkspaceSessionHint();
}

export function getDriveAccessToken(): string | null {
  return getWorkspaceSession()?.accessToken ?? null;
}

export function isDriveTokenExpiringSoon(
  session?: WorkspaceAuthSession | null
): boolean {
  return isWorkspaceTokenExpiringSoon(session);
}

export function isDriveAuthenticated(): boolean {
  return Boolean(getWorkspaceSession()?.accessToken);
}

export function subscribeDriveAuthSession(
  listener: (session: WorkspaceAuthSession | null) => void
): () => void {
  return subscribeWorkspaceSession(listener);
}

export function signOutDriveSession(preserveHint = false): void {
  cachedFolderTree = null;
  cachedTokenOwner = null;
  clearWorkspaceSession(preserveHint);
}

/**
 * Ensures the canonical SIKAPRODI FT UNBARI Drive folder hierarchy exists:
 * - SIKAPRODI FT UNBARI / Dokumentasi Akademik
 * - SIKAPRODI FT UNBARI / Bukti BKD Dosen
 * - SIKAPRODI FT UNBARI / Audit Mutu & Akreditasi
 */
export async function getOrCreateKaprodiFolders(
  explicitToken?: string,
  forceRefresh = false
): Promise<SikaprodiDriveFolderTree> {
  const token = requireAccessToken(explicitToken);
  if (!forceRefresh && cachedFolderTree) {
    return cachedFolderTree;
  }
  const tree = await ensureSikaprodiDriveFolders(token);
  cachedFolderTree = tree;
  cachedTokenOwner = getWorkspaceSession()?.userEmail ?? null;
  return tree;
}

export async function listDriveFiles(options: {
  folderId?: string;
  query?: string;
  onlyFolders?: boolean;
  pageSize?: number;
  accessToken?: string;
} = {}): Promise<GoogleDriveFileDto[]> {
  const token = requireAccessToken(options.accessToken);
  return listGoogleDriveFiles(token, {
    folderId: options.folderId,
    query: options.query,
    onlyFolders: options.onlyFolders,
    pageSize: options.pageSize
  });
}

/**
 * Fetches files from the "Bukti BKD Dosen" folder on Google Drive.
 */
export async function fetchBkdDriveFiles(
  query?: string,
  accessToken?: string
): Promise<DriveFolderSnapshot> {
  const token = requireAccessToken(accessToken);
  const folders = await getOrCreateKaprodiFolders(token);
  const files = await listGoogleDriveFiles(token, {
    folderId: folders.bkdId,
    query: query?.trim() || undefined,
    pageSize: 100
  });
  return { folders, files };
}

export function formatStorageBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function computeBkdFolderQuotaSummary(
  folderId: string,
  files: GoogleDriveFileDto[],
  accountQuota?: { limit?: string; usage?: string; usageInDrive?: string } | null
): DriveFolderQuotaSummary {
  const nonFolderFiles = files.filter(
    f => f.mimeType !== 'application/vnd.google-apps.folder'
  );
  const folderUsedBytes = nonFolderFiles.reduce((sum, f) => {
    const parsed = Number(f.size || 0);
    return sum + (Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
  }, 0);

  const accountLimitBytes =
    accountQuota?.limit && Number(accountQuota.limit) > 0 ? Number(accountQuota.limit) : null;
  const rawAccountUsage = accountQuota?.usageInDrive || accountQuota?.usage;
  const accountUsageBytes =
    rawAccountUsage && Number(rawAccountUsage) >= 0 ? Number(rawAccountUsage) : null;

  const folderQuotaBytes = accountLimitBytes
    ? Math.min(accountLimitBytes, DEFAULT_BKD_FOLDER_QUOTA_BYTES)
    : DEFAULT_BKD_FOLDER_QUOTA_BYTES;

  const usagePercent =
    folderQuotaBytes > 0
      ? Math.min(100, Number(((folderUsedBytes / folderQuotaBytes) * 100).toFixed(2)))
      : 0;

  return {
    folderName: 'Bukti BKD Dosen',
    folderId,
    fileCount: nonFolderFiles.length,
    folderUsedBytes,
    folderQuotaBytes,
    accountLimitBytes,
    accountUsageBytes,
    usagePercent,
    hasAccountQuota: accountLimitBytes !== null || accountUsageBytes !== null
  };
}

/**
 * Fetches both the files inside "Bukti BKD Dosen" and the connected Google Drive account quota.
 */
export async function fetchBkdDriveStorageQuota(
  accessToken?: string
): Promise<{ snapshot: DriveFolderSnapshot; quota: DriveFolderQuotaSummary }> {
  const token = requireAccessToken(accessToken);
  const [snapshot, accountQuota] = await Promise.all([
    fetchBkdDriveFiles(undefined, token),
    getGoogleDriveStorageQuota(token)
  ]);
  const quota = computeBkdFolderQuotaSummary(snapshot.folders.bkdId, snapshot.files, accountQuota);
  return { snapshot, quota };
}

/**
 * Fetches files from the "Audit Mutu & Akreditasi" folder on Google Drive.
 */
export async function fetchAccreditationDriveFiles(
  query?: string,
  accessToken?: string
): Promise<DriveFolderSnapshot> {
  const token = requireAccessToken(accessToken);
  const folders = await getOrCreateKaprodiFolders(token);
  const files = await listGoogleDriveFiles(token, {
    folderId: folders.akreditasiId,
    query: query?.trim() || undefined,
    pageSize: 60
  });
  return { folders, files };
}

/**
 * Fetches files from the "Dokumentasi Akademik" folder on Google Drive.
 */
export async function fetchAcademicDocDriveFiles(
  query?: string,
  accessToken?: string
): Promise<DriveFolderSnapshot> {
  const token = requireAccessToken(accessToken);
  const folders = await getOrCreateKaprodiFolders(token);
  const files = await listGoogleDriveFiles(token, {
    folderId: folders.akademikId,
    query: query?.trim() || undefined,
    pageSize: 60
  });
  return { folders, files };
}

async function uploadToCategoryFolder(
  category: KaprodiDriveCategory,
  payload: DriveUploadPayload
): Promise<GoogleDriveFileDto> {
  const token = requireAccessToken(payload.accessToken);
  const folders = await getOrCreateKaprodiFolders(token);
  const parentFolderId =
    category === 'BKD'
      ? folders.bkdId
      : category === 'AKREDITASI'
      ? folders.akreditasiId
      : folders.akademikId;

  const fallbackMime =
    payload.mimeType ||
    (payload.file instanceof File && payload.file.type ? payload.file.type : 'application/octet-stream');

  return uploadFileToGoogleDrive(token, {
    fileName: payload.fileName,
    mimeType: fallbackMime,
    content: payload.file,
    description: payload.description,
    parentFolderId
  });
}

/**
 * Uploads a BKD evidence file directly into the "Bukti BKD Dosen" folder on Google Drive.
 */
export async function uploadToBkdDriveFolder(
  payload: DriveUploadPayload
): Promise<GoogleDriveFileDto> {
  return uploadToCategoryFolder('BKD', payload);
}

/**
 * Uploads an accreditation file/dossier directly into "Audit Mutu & Akreditasi" on Google Drive.
 */
export async function uploadToAccreditationDriveFolder(
  payload: DriveUploadPayload
): Promise<GoogleDriveFileDto> {
  return uploadToCategoryFolder('AKREDITASI', payload);
}

/**
 * Uploads an academic document directly into "Dokumentasi Akademik" on Google Drive.
 */
export async function uploadToAcademicDocDriveFolder(
  payload: DriveUploadPayload
): Promise<GoogleDriveFileDto> {
  return uploadToCategoryFolder('AKADEMIK', payload);
}

export async function createDriveFolder(
  name: string,
  parentId?: string,
  description?: string,
  accessToken?: string
): Promise<GoogleDriveFileDto> {
  const token = requireAccessToken(accessToken);
  return createGoogleDriveFolder(token, name, parentId, description);
}

export async function renameDriveFile(
  fileId: string,
  newName: string,
  accessToken?: string
): Promise<GoogleDriveFileDto> {
  const token = requireAccessToken(accessToken);
  return renameGoogleDriveFile(token, fileId, newName);
}

export async function deleteDriveFile(
  fileId: string,
  accessToken?: string
): Promise<void> {
  const token = requireAccessToken(accessToken);
  return deleteGoogleDriveFile(token, fileId);
}

export async function downloadDriveFile(
  file: GoogleDriveFileDto,
  accessToken?: string
): Promise<void> {
  const token = requireAccessToken(accessToken);
  return downloadGoogleDriveFile(token, file);
}

export async function fetchDriveFileBlob(
  file: Pick<GoogleDriveFileDto, 'id' | 'name' | 'mimeType'>,
  accessToken?: string
): Promise<{ blob: Blob; effectiveMimeType: string; downloadName: string }> {
  const token = requireAccessToken(accessToken);
  return fetchGoogleDriveFileBlob(token, file);
}
