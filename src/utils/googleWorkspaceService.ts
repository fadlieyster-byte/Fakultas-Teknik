import {
  GoogleAuthProvider,
  signInWithPopup,
  reauthenticateWithPopup,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import {
  auth,
  createDriveWorkspaceProvider,
  GOOGLE_WORKSPACE_OAUTH_SCOPES
} from '../firebase';
import { JadwalKuliah } from '../types/index';

export const WORKSPACE_SCOPES = GOOGLE_WORKSPACE_OAUTH_SCOPES;

export const OFFICIAL_CLASSROOM_ADMIN_EMAIL = 'ftunbari.tpa@gmail.com';

// Standard Google OAuth 2.0 implicit/popup access tokens expire in 3600s; refresh UI prompt at 55 min
const OAUTH_TOKEN_TTL_MS = 55 * 60 * 1000;
const OAUTH_REFRESH_BUFFER_MS = 5 * 60 * 1000;
// Non-sensitive connection metadata key (stores email & timestamp ONLY, NEVER access tokens)
const SESSION_HINT_STORAGE_KEY = 'sikaprodi_drive_oauth_hint';

export interface WorkspaceSessionHint {
  userEmail: string;
  displayName: string;
  grantedAt: string;
  scopes: readonly string[];
}

export interface WorkspaceAuthSession {
  accessToken: string;
  userEmail: string;
  displayName: string;
  grantedAt: string;
  expiresAt?: number;
  scopes?: readonly string[];
}

export interface OAuthTokenVerificationResult {
  valid: boolean;
  expiresInSec: number;
  scopes: string[];
  hasDriveScope: boolean;
}

// In-memory ONLY OAuth access token cache (never stored in localStorage/sessionStorage)
let memorySession: WorkspaceAuthSession | null = null;
let isSigningIn = false;
let inFlightRefreshPromise: Promise<WorkspaceAuthSession> | null = null;
const sessionListeners = new Set<(session: WorkspaceAuthSession | null) => void>();

function saveNonSecretSessionHint(session: WorkspaceAuthSession): void {
  try {
    const hint: WorkspaceSessionHint = {
      userEmail: session.userEmail,
      displayName: session.displayName,
      grantedAt: session.grantedAt,
      scopes: session.scopes || WORKSPACE_SCOPES
    };
    sessionStorage.setItem(SESSION_HINT_STORAGE_KEY, JSON.stringify(hint));
  } catch {
    // ignore storage restriction
  }
}

function clearNonSecretSessionHint(): void {
  try {
    sessionStorage.removeItem(SESSION_HINT_STORAGE_KEY);
  } catch {
    // ignore storage restriction
  }
}

export function getStoredWorkspaceSessionHint(): WorkspaceSessionHint | null {
  try {
    const raw = sessionStorage.getItem(SESSION_HINT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WorkspaceSessionHint>;
    if (parsed && typeof parsed.userEmail === 'string' && parsed.userEmail) {
      return {
        userEmail: parsed.userEmail,
        displayName: parsed.displayName || parsed.userEmail,
        grantedAt: parsed.grantedAt || '—',
        scopes: Array.isArray(parsed.scopes) ? parsed.scopes : WORKSPACE_SCOPES
      };
    }
    return null;
  } catch {
    return null;
  }
}

function notifySessionListeners() {
  sessionListeners.forEach(cb => {
    try {
      cb(memorySession);
    } catch {
      // ignore listener errors
    }
  });
}

// Clear in-memory token whenever Firebase auth signs out (or session resets)
onAuthStateChanged(auth, user => {
  if (!user && memorySession && !isSigningIn) {
    memorySession = null;
    clearNonSecretSessionHint();
    notifySessionListeners();
  }
});

export function getWorkspaceSession(): WorkspaceAuthSession | null {
  if (memorySession?.expiresAt && Date.now() > memorySession.expiresAt) {
    memorySession = null;
    notifySessionListeners();
    return null;
  }
  return memorySession;
}

export function isWorkspaceTokenExpiringSoon(
  session: WorkspaceAuthSession | null = getWorkspaceSession()
): boolean {
  if (!session?.expiresAt) return false;
  return session.expiresAt - Date.now() <= OAUTH_REFRESH_BUFFER_MS;
}

export function subscribeWorkspaceSession(
  listener: (session: WorkspaceAuthSession | null) => void
): () => void {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

export function clearWorkspaceSession(preserveHint = false): void {
  memorySession = null;
  if (!preserveHint) {
    clearNonSecretSessionHint();
  }
  notifySessionListeners();
}

export function initWorkspaceAuth(
  onAuthSuccess?: (user: User, session: WorkspaceAuthSession) => void,
  onAuthRequired?: () => void
): () => void {
  return onAuthStateChanged(auth, user => {
    const activeSession = getWorkspaceSession();
    if (user && activeSession?.accessToken) {
      onAuthSuccess?.(user, activeSession);
    } else if (!isSigningIn) {
      if (!user && memorySession) {
        memorySession = null;
        clearNonSecretSessionHint();
        notifySessionListeners();
      }
      onAuthRequired?.();
    }
  });
}

export function hydrateWorkspaceSessionFromResult(
  result: UserCredential
): WorkspaceAuthSession | null {
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;
  if (!accessToken) {
    return null;
  }

  memorySession = {
    accessToken,
    userEmail: result.user.email || OFFICIAL_CLASSROOM_ADMIN_EMAIL,
    displayName: result.user.displayName || 'Admin FT UNBARI',
    grantedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    expiresAt: Date.now() + OAUTH_TOKEN_TTL_MS,
    scopes: WORKSPACE_SCOPES
  };
  saveNonSecretSessionHint(memorySession);
  notifySessionListeners();
  return memorySession;
}

/**
 * Verifies the active OAuth 2.0 access token against Google's tokeninfo endpoint
 * and updates the in-memory session's exact TTL if valid.
 */
export async function verifyGoogleOAuthToken(
  explicitToken?: string
): Promise<OAuthTokenVerificationResult> {
  const token = explicitToken || getWorkspaceSession()?.accessToken;
  if (!token) {
    return { valid: false, expiresInSec: 0, scopes: [], hasDriveScope: false };
  }

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ access_token: token })
    });

    if (!res.ok) {
      if (res.status === 400 || res.status === 401) {
        clearWorkspaceSession(true);
      }
      return { valid: false, expiresInSec: 0, scopes: [], hasDriveScope: false };
    }

    const info = (await res.json()) as { expires_in?: string; scope?: string };
    const expiresInSec = Math.max(0, Number(info.expires_in || 0));
    const scopes = info.scope ? info.scope.split(/\s+/).filter(Boolean) : [];
    const hasDriveScope = scopes.some(
      s => s === 'https://www.googleapis.com/auth/drive.file' || s === 'https://www.googleapis.com/auth/drive'
    );

    if (expiresInSec <= 0) {
      clearWorkspaceSession(true);
      return { valid: false, expiresInSec: 0, scopes, hasDriveScope };
    }

    if (memorySession && memorySession.accessToken === token) {
      memorySession = {
        ...memorySession,
        expiresAt: Date.now() + expiresInSec * 1000,
        scopes: scopes.length > 0 ? scopes : memorySession.scopes
      };
      notifySessionListeners();
    }

    return { valid: true, expiresInSec, scopes, hasDriveScope };
  } catch {
    // Fallback to local TTL validation if tokeninfo network check is unavailable
    const active = getWorkspaceSession();
    const remainingSec = active?.expiresAt
      ? Math.max(0, Math.floor((active.expiresAt - Date.now()) / 1000))
      : 3000;
    return {
      valid: Boolean(active?.accessToken && remainingSec > 0),
      expiresInSec: remainingSec,
      scopes: [...(active?.scopes || WORKSPACE_SCOPES)],
      hasDriveScope: true
    };
  }
}

export async function signInGoogleWorkspace(loginHint?: string): Promise<WorkspaceAuthSession> {
  isSigningIn = true;
  try {
    const provider = createDriveWorkspaceProvider(loginHint, 'consent');
    const result = await signInWithPopup(auth, provider);
    const session = hydrateWorkspaceSessionFromResult(result);
    if (!session) {
      throw new Error('Token akses OAuth 2.0 Google Workspace tidak diterima dari popup.');
    }
    return session;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Refreshes the in-memory OAuth 2.0 access token using single-flight locking and
 * `reauthenticateWithPopup` (when an active Firebase user exists) or `signInWithPopup`.
 */
export async function refreshGoogleWorkspaceSession(
  loginHint?: string
): Promise<WorkspaceAuthSession> {
  if (inFlightRefreshPromise) {
    return inFlightRefreshPromise;
  }

  inFlightRefreshPromise = (async () => {
    isSigningIn = true;
    try {
      const resolvedHint =
        loginHint ||
        memorySession?.userEmail ||
        getStoredWorkspaceSessionHint()?.userEmail ||
        auth.currentUser?.email ||
        undefined;
      const provider = createDriveWorkspaceProvider(resolvedHint, 'refresh');

      let result: UserCredential;
      if (auth.currentUser) {
        try {
          result = await reauthenticateWithPopup(auth.currentUser, provider);
        } catch {
          result = await signInWithPopup(auth, provider);
        }
      } else {
        result = await signInWithPopup(auth, provider);
      }

      const session = hydrateWorkspaceSessionFromResult(result);
      if (!session) {
        throw new Error('Token OAuth 2.0 baru tidak diterima saat pembaruan sesi Google Drive.');
      }
      return session;
    } finally {
      isSigningIn = false;
      inFlightRefreshPromise = null;
    }
  })();

  return inFlightRefreshPromise;
}

export async function signOutGoogleWorkspace(): Promise<void> {
  clearWorkspaceSession(false);
  try {
    await auth.signOut();
  } catch {
    // ignore Firebase signOut errors
  }
}

async function fetchGoogleJson<T>(
  url: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message || detail;
    } catch {
      // ignore json parse failure
    }
    if (res.status === 401) {
      clearWorkspaceSession(true);
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Otorisasi Google API ditolak (${res.status}): ${detail}. Silakan hubungkan ulang akun Google Workspace.`);
    }
    throw new Error(`Permintaan Google API gagal (${res.status}): ${detail}`);
  }

  return (await res.json()) as T;
}

// ==================== CLASSROOM API ====================

export interface GoogleClassroomCourseDto {
  id: string;
  name: string;
  section?: string;
  room?: string;
  enrollmentCode?: string;
  courseState?: string;
  alternateLink?: string;
}

export async function listGoogleClassroomCourses(accessToken: string): Promise<GoogleClassroomCourseDto[]> {
  const data = await fetchGoogleJson<{ courses?: GoogleClassroomCourseDto[] }>(
    'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=30',
    accessToken
  );
  return data.courses || [];
}

export async function createGoogleClassroomCourse(
  accessToken: string,
  payload: { name: string; section: string; room: string; descriptionHeading: string }
): Promise<GoogleClassroomCourseDto> {
  return fetchGoogleJson<GoogleClassroomCourseDto>(
    'https://classroom.googleapis.com/v1/courses',
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        section: payload.section,
        room: payload.room,
        descriptionHeading: payload.descriptionHeading,
        ownerId: 'me',
        courseState: 'ACTIVE'
      })
    }
  );
}

export async function postGoogleClassroomAnnouncement(
  accessToken: string,
  courseId: string,
  text: string
): Promise<{ id: string; text: string; alternateLink?: string }> {
  return fetchGoogleJson(
    `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/announcements`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        text,
        state: 'PUBLISHED'
      })
    }
  );
}

export async function createGoogleClassroomCourseWork(
  accessToken: string,
  courseId: string,
  payload: { title: string; description: string; maxPoints: number; dueDate: string }
): Promise<{ id: string; title: string; alternateLink?: string }> {
  const [y, m, d] = payload.dueDate.split('-').map(Number);
  const dueDateObj = y && m && d ? { year: y, month: m, day: d } : undefined;
  return fetchGoogleJson(
    `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWork`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        workType: 'ASSIGNMENT',
        state: 'PUBLISHED',
        maxPoints: payload.maxPoints,
        ...(dueDateObj
          ? {
              dueDate: dueDateObj,
              dueTime: { hours: 16, minutes: 59 } // 23:59 WIB (UTC+7)
            }
          : {})
      })
    }
  );
}

export async function inviteStudentToGoogleClassroom(
  accessToken: string,
  courseId: string,
  studentEmail: string
): Promise<{ id: string; userId: string; role: string }> {
  return fetchGoogleJson('https://classroom.googleapis.com/v1/invitations', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      userId: studentEmail,
      courseId,
      role: 'STUDENT'
    })
  });
}

// ==================== GOOGLE CALENDAR API ====================

const HARI_TO_OFFSET: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 0
};

function getNextDateForHari(hari: string): string {
  const targetDay = HARI_TO_OFFSET[hari] ?? 1;
  const now = new Date();
  const diff = (targetDay - now.getDay() + 7) % 7 || 7;
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  const yyyy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function syncJadwalToGoogleCalendar(
  accessToken: string,
  jadwalItems: JadwalKuliah[],
  prodiName: string
): Promise<{ createdCount: number; links: string[] }> {
  let createdCount = 0;
  const links: string[] = [];

  for (const j of jadwalItems) {
    const dateStr = getNextDateForHari(j.hari);
    const startTime = `${dateStr}T${j.jamMulai.padStart(5, '0')}:00+07:00`;
    const endTime = `${dateStr}T${j.jamSelesai.padStart(5, '0')}:00+07:00`;

    const created = await fetchGoogleJson<{ id: string; htmlLink?: string }>(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          summary: `[SiKaprodi FT UNBARI] ${j.kodeMK} - ${j.namaMK} (${j.kelas})`,
          location: `${j.ruanganNama}, Fakultas Teknik UNBARI Jambi`,
          description: `Program Studi: ${prodiName}\nDosen Pengampu: ${j.dosenNama} (NIDN: ${j.dosenNidn})\nSKS: ${j.sks} SKS · Peserta: ${j.pesertaTotal} Mahasiswa`,
          start: { dateTime: startTime, timeZone: 'Asia/Jakarta' },
          end: { dateTime: endTime, timeZone: 'Asia/Jakarta' },
          recurrence: ['RRULE:FREQ=WEEKLY;COUNT=14'],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 30 },
              { method: 'email', minutes: 60 }
            ]
          }
        })
      }
    );
    createdCount += 1;
    if (created.htmlLink) links.push(created.htmlLink);
  }

  return { createdCount, links };
}

// ==================== GOOGLE DRIVE API (Academic Docs & BKD File Management) ====================

export interface GoogleDriveFileDto {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  parents?: string[];
  description?: string;
}

export interface SikaprodiDriveFolderTree {
  rootId: string;
  akademikId: string;
  bkdId: string;
  akreditasiId: string;
}

export interface DriveStorageQuotaDto {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

export async function getGoogleDriveStorageQuota(
  accessToken: string
): Promise<DriveStorageQuotaDto | null> {
  try {
    const data = await fetchGoogleJson<{ storageQuota?: DriveStorageQuotaDto }>(
      'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
      accessToken
    );
    return data.storageQuota || null;
  } catch {
    return null;
  }
}

export async function listGoogleDriveFiles(
  accessToken: string,
  options: { folderId?: string; query?: string; onlyFolders?: boolean; pageSize?: number } = {}
): Promise<GoogleDriveFileDto[]> {
  const clauses: string[] = ['trashed = false'];
  if (options.onlyFolders) {
    clauses.push("mimeType = 'application/vnd.google-apps.folder'");
  }
  if (options.folderId) {
    clauses.push(`'${options.folderId.replace(/'/g, "\\'")}' in parents`);
  }
  if (options.query?.trim()) {
    const escaped = options.query.trim().replace(/'/g, "\\'");
    clauses.push(`(name contains '${escaped}' or description contains '${escaped}')`);
  }

  const params = new URLSearchParams({
    q: clauses.join(' and '),
    pageSize: String(options.pageSize ?? 50),
    orderBy: 'folder,modifiedTime desc',
    fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,parents,description)'
  });

  const data = await fetchGoogleJson<{ files?: GoogleDriveFileDto[] }>(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
    accessToken
  );
  return data.files || [];
}

export async function createGoogleDriveFolder(
  accessToken: string,
  name: string,
  parentId?: string,
  description?: string
): Promise<GoogleDriveFileDto> {
  return fetchGoogleJson<GoogleDriveFileDto>(
    'https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,modifiedTime,webViewLink,parents,description',
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId ? { parents: [parentId] } : {}),
        ...(description ? { description } : {})
      })
    }
  );
}

async function findOrCreateFolder(
  accessToken: string,
  name: string,
  parentId?: string,
  description?: string
): Promise<GoogleDriveFileDto> {
  const existing = await listGoogleDriveFiles(accessToken, {
    folderId: parentId,
    onlyFolders: true
  });
  const match = existing.find(f => f.name.toLowerCase() === name.toLowerCase());
  if (match) return match;
  return createGoogleDriveFolder(accessToken, name, parentId, description);
}

export async function ensureSikaprodiDriveFolders(
  accessToken: string
): Promise<SikaprodiDriveFolderTree> {
  const root = await findOrCreateFolder(
    accessToken,
    'SIKAPRODI FT UNBARI',
    undefined,
    'Arsip Dokumentasi Akademik & Bukti BKD Fakultas Teknik Universitas Batanghari'
  );
  const [akademik, bkd, akreditasi] = await Promise.all([
    findOrCreateFolder(
      accessToken,
      'Dokumentasi Akademik',
      root.id,
      'SK Mengajar, RPS OBE, BAP Perkuliahan, dan Notulensi Rapat Prodi'
    ),
    findOrCreateFolder(
      accessToken,
      'Bukti BKD Dosen',
      root.id,
      'Arsip Bukti Kinerja Dosen, Pengabdian Masyarakat, dan Bimbingan TA'
    ),
    findOrCreateFolder(
      accessToken,
      'Audit Mutu & Akreditasi',
      root.id,
      'Dossier Akreditasi LAM-Teknik, Laporan IKU, dan Audit Mutu Internal'
    )
  ]);

  return {
    rootId: root.id,
    akademikId: akademik.id,
    bkdId: bkd.id,
    akreditasiId: akreditasi.id
  };
}

export async function uploadFileToGoogleDrive(
  accessToken: string,
  params: {
    fileName: string;
    mimeType: string;
    content: Blob | string;
    description?: string;
    parentFolderId?: string;
  }
): Promise<GoogleDriveFileDto> {
  const metadata: Record<string, unknown> = {
    name: params.fileName,
    description: params.description || 'Repository Berkas Akademik & BKD FT UNBARI',
    mimeType: params.mimeType
  };
  if (params.parentFolderId) {
    metadata.parents = [params.parentFolderId];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  const fileBlob =
    typeof params.content === 'string'
      ? new Blob([params.content], { type: params.mimeType })
      : params.content;
  form.append('file', fileBlob, params.fileName);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,parents,description',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: form
    }
  );

  if (!res.ok) {
    if (res.status === 401) {
      clearWorkspaceSession(true);
    }
    const errText = await res.text();
    throw new Error(`Gagal unggah berkas ke Google Drive (${res.status}): ${errText}`);
  }

  return (await res.json()) as GoogleDriveFileDto;
}

export async function renameGoogleDriveFile(
  accessToken: string,
  fileId: string,
  newName: string
): Promise<GoogleDriveFileDto> {
  return fetchGoogleJson<GoogleDriveFileDto>(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,parents,description`,
    accessToken,
    {
      method: 'PATCH',
      body: JSON.stringify({ name: newName.trim() })
    }
  );
}

export async function deleteGoogleDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  if (!res.ok && res.status !== 204) {
    if (res.status === 401) {
      clearWorkspaceSession(true);
    }
    const errText = await res.text();
    throw new Error(`Gagal menghapus berkas di Google Drive (${res.status}): ${errText}`);
  }
}

export async function fetchGoogleDriveFileBlob(
  accessToken: string,
  file: Pick<GoogleDriveFileDto, 'id' | 'name' | 'mimeType'>
): Promise<{ blob: Blob; effectiveMimeType: string; downloadName: string }> {
  const mime = file.mimeType || 'application/pdf';
  const isGoogleDoc = mime.startsWith('application/vnd.google-apps.');
  const url = isGoogleDoc
    ? `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}/export?mimeType=application/pdf`
    : `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearWorkspaceSession(true);
    }
    throw new Error(`Gagal memuat "${file.name}" dari Google Drive (${res.status}).`);
  }

  const blob = await res.blob();
  const effectiveMimeType = isGoogleDoc ? 'application/pdf' : blob.type || mime;
  const downloadName = isGoogleDoc && !file.name.endsWith('.pdf') ? `${file.name}.pdf` : file.name;
  return { blob, effectiveMimeType, downloadName };
}

export async function downloadGoogleDriveFile(
  accessToken: string,
  file: GoogleDriveFileDto
): Promise<void> {
  const { blob, downloadName } = await fetchGoogleDriveFileBlob(accessToken, file);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

// ==================== GOOGLE FORMS API (Survey Feedback) ====================

export interface GoogleFormLiveSummary {
  formId: string;
  title: string;
  responderUri?: string;
  responseCount: number;
  latestSubmitTime?: string;
}

export async function fetchGoogleFormLiveSummary(
  accessToken: string,
  formId: string
): Promise<GoogleFormLiveSummary> {
  const cleanId = formId.trim();
  const formMeta = await fetchGoogleJson<{
    formId: string;
    info?: { title?: string };
    responderUri?: string;
  }>(`https://forms.googleapis.com/v1/forms/${encodeURIComponent(cleanId)}`, accessToken);

  const responsesData = await fetchGoogleJson<{
    responses?: Array<{ responseId: string; lastSubmittedTime?: string }>;
  }>(
    `https://forms.googleapis.com/v1/forms/${encodeURIComponent(cleanId)}/responses`,
    accessToken
  );

  const list = responsesData.responses || [];
  return {
    formId: formMeta.formId || cleanId,
    title: formMeta.info?.title || 'Formulir Google Workspace',
    responderUri: formMeta.responderUri,
    responseCount: list.length,
    latestSubmitTime: list[0]?.lastSubmittedTime
  };
}

// ==================== GOOGLE SHEETS API (Tracer Study) ====================

export interface GoogleSheetTracerSummary {
  spreadsheetId: string;
  title: string;
  rowCount: number;
  rows: string[][];
}

export async function fetchTracerStudyFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  range = 'A1:G50'
): Promise<GoogleSheetTracerSummary> {
  const cleanId = spreadsheetId.trim();
  const meta = await fetchGoogleJson<{ properties?: { title?: string } }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(cleanId)}?fields=properties.title`,
    accessToken
  );

  const valuesRes = await fetchGoogleJson<{ values?: string[][] }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(cleanId)}/values/${encodeURIComponent(range)}`,
    accessToken
  );

  const rows = valuesRes.values || [];
  return {
    spreadsheetId: cleanId,
    title: meta.properties?.title || 'Google Sheets Tracer Study',
    rowCount: Math.max(0, rows.length - 1),
    rows
  };
}

// ==================== GMAIL API (Monthly EWS & Automated IKU Report) ====================

function encodeBase64UrlUtf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach(b => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendEmailViaGmailApi(
  accessToken: string,
  params: {
    to: string[];
    subject: string;
    bodyText: string;
  }
): Promise<{ id: string; threadId?: string }> {
  const rawMime = [
    `To: ${params.to.join(', ')}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    params.bodyText
  ].join('\r\n');

  return fetchGoogleJson<{ id: string; threadId?: string }>(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        raw: encodeBase64UrlUtf8(rawMime)
      })
    }
  );
}
