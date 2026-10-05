/**
 * Core Supplier Onboarding & Interest API client.
 *
 * Architecture: direct `VITE_CORE_API_URL` (includes /api) → Worker.
 * - No live fallback when VITE_CORE_API_URL is absent — throws at call time.
 * - Strict envelope validation on all responses ({ success: true, data: ... }).
 * - Preserves Idempotency-Key and payload draft across retries; explicit rotation on new application.
 * - Private capabilities (statusToken) held in memory/localStorage, never logged or put in URLs.
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export function getApiBase(): string {
  const base = import.meta.env.VITE_CORE_API_URL;
  if (!base || typeof base !== 'string' || base.trim().length === 0) {
    throw new Error(
      'The application service is currently unavailable. Please try again later.'
    );
  }
  return base.trim().replace(/\/+$/, '');
}

// ---------------------------------------------------------------------------
// Types — Canonical Individual Guide Application
// ---------------------------------------------------------------------------

export type ApplicationStage = 'pending' | 'approved' | 'rejected';
export type EvidenceKind = 'id_front' | 'id_back' | 'selfie' | 'portfolio';

export interface ServiceDraft {
  title: string;
  description?: string;
  price: number; // THB 0..1,000,000
  currency: 'THB';
  durationMinutes: number; // 30..1439
}

export interface ScheduleDay {
  dayOfWeek: number; // 0..6 (0 = Sunday, 6 = Saturday)
  startTime: string; // HH:mm format, e.g. "09:00"
  endTime: string;   // HH:mm format, e.g. "17:00"
  isAvailable: boolean;
}

export interface ApplicationSchedule {
  timeZone: 'Asia/Bangkok';
  days: ScheduleDay[]; // Exactly 7 days (0..6)
}

export interface CanonicalApplicationData {
  firstName: string;
  lastName: string;
  bio?: string;
  location: string;
  languages: string[];
  interests: string[];
  serviceDrafts: ServiceDraft[];
  schedule: ApplicationSchedule;
}

export interface ApplicationPayload {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  bio?: string;
  categories: Array<{ name: string; memberCount: 1 }>;
  brochureUrls: string[];
  mode: 'tirak';
  applicationData: CanonicalApplicationData;
}

export interface ApplicationResult {
  applicationId: string;
  statusToken: string;
  status: ApplicationStage;
  statusNote?: string;
}

export interface InterestPayload {
  email: string;
  name?: string;
  source: string;
}

export interface InterestResult {
  interestId: string;
}

export interface EvidenceItem {
  evidenceId: string;
  kind: EvidenceKind;
  uploadedAt?: string;
}

export interface EvidenceResult {
  evidenceId: string;
  kind: EvidenceKind;
}

export interface StatusResult {
  applicationId: string;
  status: ApplicationStage;
  accountStatus?: string;
  profileStatus?: string;
  publicationStatus?: string;
  submittedAt?: string;
  reviewedAt?: string;
  expiresAt: string | null;
  blockers?: string[] | {
    account?: string;
    profile?: string;
    publication?: string;
    evidence?: string;
  };
  evidence?: EvidenceItem[];
  paymentStatus?: string;
  invitationDelivery?: { status: string };
}

export type OnboardingResult =
  | { ok: true; data: ApplicationResult }
  | { ok: false; error: string; retryable: boolean; code?: SubmissionErrorCode };

export type InterestApiResult =
  | { ok: true; data: InterestResult }
  | { ok: false; error: string; retryable: boolean; code?: SubmissionErrorCode };

export type EvidenceApiResult =
  | { ok: true; data: EvidenceResult }
  | { ok: false; error: string; retryable: boolean; code?: SubmissionErrorCode };

export type StatusApiResult =
  | { ok: true; data: StatusResult }
  | { ok: false; error: string; retryable: boolean; code?: SubmissionErrorCode };

export type SubmissionErrorCode =
  | 'service_unavailable'
  | 'validation'
  | 'payload_mismatch'
  | 'idempotency_conflict'
  | 'request_aborted'
  | 'timeout_unknown'
  | 'transport_unknown'
  | 'no_saved_attempt';

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface SavedAttemptInfo<T> {
  key: string;
  createdAt: string;
  snapshot: T;
  lastFailureAt?: string;
  lastFailureCode?: SubmissionErrorCode;
  lastFailureMessage?: string;
}

// ---------------------------------------------------------------------------
// Constants & Validation Bounds
// ---------------------------------------------------------------------------

export const VALID_LANGUAGES = [
  'en', 'th', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'ru', 'ar', 'pt', 'it',
] as const;

export const DEFAULT_WEEKDAY_SCHEDULE: ScheduleDay[] = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isAvailable: false }, // Sunday
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: false }, // Monday
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: false }, // Tuesday
  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: false }, // Wednesday
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: false }, // Thursday
  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: false }, // Friday
  { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isAvailable: false }, // Saturday
];

export const VALID_EVIDENCE_KINDS: ReadonlySet<string> = new Set<EvidenceKind>(['id_front', 'id_back', 'selfie', 'portfolio']);

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const FORBIDDEN_URI_RE = /^(file|data|javascript|vbscript):/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_TIMEOUT_MS = 15_000;
const ATTEMPT_KEY_PREFIX = 'tirak_attempt_';

type AttemptFormType = 'application' | 'interest';

interface PersistedAttempt<T> {
  key: string;
  snapshot: T;
  createdAt: string;
  lastFailureAt?: string;
  lastFailureCode?: SubmissionErrorCode;
  lastFailureMessage?: string;
}

export type ApplicationAttemptRecovery =
  | { state: 'none' }
  | { state: 'retry_saved'; attempt: { key: string; createdAt: string } }
  | { state: 'payload_changed'; attempt: { key: string; createdAt: string } };

interface RequestControllerHandle {
  signal: AbortSignal;
  abort: () => void;
  dispose: () => void;
}

// ---------------------------------------------------------------------------
// Idempotency Keys — Reused on retries, rotated on explicit new draft
// ---------------------------------------------------------------------------

const IDEMPOTENCY_KEYS: Record<string, string> = {};
const STORAGE_KEY_PREFIX = 'tirak_idem_';

function safeLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

export function getIdempotencyKey(formType: string): string {
  if (IDEMPOTENCY_KEYS[formType]) return IDEMPOTENCY_KEYS[formType];
  const storage = safeLocalStorage();
  const storageKey = `${STORAGE_KEY_PREFIX}${formType}`;
  if (storage) {
    try {
      const existing = storage.getItem(storageKey);
      if (existing && UUID_RE.test(existing)) {
        IDEMPOTENCY_KEYS[formType] = existing;
        return existing;
      }
    } catch {
      // ignore
    }
  }

  const key = crypto.randomUUID();
  IDEMPOTENCY_KEYS[formType] = key;
  if (storage) {
    try {
      storage.setItem(storageKey, key);
    } catch {
      // ignore
    }
  }
  return key;
}

export function rotateIdempotencyKey(formType: string): string {
  const newKey = crypto.randomUUID();
  IDEMPOTENCY_KEYS[formType] = newKey;
  const storage = safeLocalStorage();
  if (storage) {
    try {
      storage.setItem(`${STORAGE_KEY_PREFIX}${formType}`, newKey);
    } catch {
      // ignore
    }
  }
  return newKey;
}

function clearIdempotencyKey(formType: string): void {
  delete IDEMPOTENCY_KEYS[formType];
  const storage = safeLocalStorage();
  if (storage) {
    try {
      storage.removeItem(`${STORAGE_KEY_PREFIX}${formType}`);
    } catch {
      // ignore
    }
  }
}

function cloneSnapshot<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function snapshotsMatch<T>(left: T, right: T): boolean {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

function getAttemptStorageKey(formType: AttemptFormType): string {
  return `${ATTEMPT_KEY_PREFIX}${formType}`;
}

function loadAttempt<T>(formType: AttemptFormType): PersistedAttempt<T> | null {
  const storage = safeLocalStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(getAttemptStorageKey(formType));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAttempt<T>;
    if (
      !parsed ||
      typeof parsed.key !== 'string' ||
      !UUID_RE.test(parsed.key) ||
      typeof parsed.createdAt !== 'string' ||
      !('snapshot' in parsed)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveAttempt<T>(formType: AttemptFormType, attempt: PersistedAttempt<T>): void {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(getAttemptStorageKey(formType), JSON.stringify(attempt));
  } catch {
    // ignore
  }
}

function clearAttempt(formType: AttemptFormType): void {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.removeItem(getAttemptStorageKey(formType));
  } catch {
    // ignore
  }
}

function markAttemptFailure<T>(
  formType: AttemptFormType,
  attempt: PersistedAttempt<T>,
  code: SubmissionErrorCode,
  message: string
): void {
  saveAttempt(formType, {
    ...attempt,
    lastFailureAt: new Date().toISOString(),
    lastFailureCode: code,
    lastFailureMessage: message,
  });
}

function finalizeSuccessfulAttempt(formType: AttemptFormType): void {
  clearAttempt(formType);
  if (formType === 'interest') {
    clearIdempotencyKey(formType);
  }
}

function prepareAttempt<T>(
  formType: AttemptFormType,
  payload: T
):
  | { ok: true; attempt: PersistedAttempt<T>; payload: T }
  | {
      ok: false;
      attempt: PersistedAttempt<T>;
      error: string;
      code: 'payload_mismatch';
    } {
  const existing = loadAttempt<T>(formType);
  if (existing) {
    if (snapshotsMatch(existing.snapshot, payload)) {
      return { ok: true, attempt: existing, payload: cloneSnapshot(existing.snapshot) };
    }

    return {
      ok: false,
      attempt: existing,
      code: 'payload_mismatch',
      error:
        formType === 'application'
          ? 'This browser already has an earlier application attempt with the same recovery key. Retry that saved submission or explicitly start a new attempt for your current edits.'
          : 'This browser already has an earlier interest signup attempt pending confirmation. Retry the saved signup or explicitly start a new signup for the updated details.',
    };
  }

  const key = getIdempotencyKey(formType);
  const attempt: PersistedAttempt<T> = {
    key,
    snapshot: cloneSnapshot(payload),
    createdAt: new Date().toISOString(),
  };
  saveAttempt(formType, attempt);
  return { ok: true, attempt, payload: cloneSnapshot(attempt.snapshot) };
}

function createRequestController(options: RequestOptions = {}): RequestControllerHandle {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const abortFromExternal = () => {
    if (!controller.signal.aborted) {
      controller.abort(options.signal?.reason);
    }
  };

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort(options.signal.reason);
    } else {
      options.signal.addEventListener('abort', abortFromExternal, { once: true });
    }
  }

  timeoutId = setTimeout(() => {
    if (!controller.signal.aborted) {
      controller.abort(new DOMException('Timed out', 'AbortError'));
    }
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  const dispose = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    options.signal?.removeEventListener('abort', abortFromExternal);
  };

  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    dispose,
  };
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

export function getApplicationAttemptRecovery(payload: ApplicationPayload): ApplicationAttemptRecovery {
  const attempt = loadAttempt<ApplicationPayload>('application');
  if (!attempt) {
    return { state: 'none' };
  }

  if (snapshotsMatch(attempt.snapshot, payload)) {
    return {
      state: 'retry_saved',
      attempt: { key: attempt.key, createdAt: attempt.createdAt },
    };
  }

  return {
    state: 'payload_changed',
    attempt: { key: attempt.key, createdAt: attempt.createdAt },
  };
}

export function loadSavedApplicationAttempt(): SavedAttemptInfo<ApplicationPayload> | null {
  const attempt = loadAttempt<ApplicationPayload>('application');
  if (!attempt) return null;
  return {
    key: attempt.key,
    createdAt: attempt.createdAt,
    snapshot: cloneSnapshot(attempt.snapshot),
    lastFailureAt: attempt.lastFailureAt,
    lastFailureCode: attempt.lastFailureCode,
    lastFailureMessage: attempt.lastFailureMessage,
  };
}

export function startNewInterestAttempt(): void {
  clearAttempt('interest');
  rotateIdempotencyKey('interest');
}

export async function retrySavedApplicationAttempt(
  options: RequestOptions = {}
): Promise<OnboardingResult> {
  const attempt = loadAttempt<ApplicationPayload>('application');
  if (!attempt) {
    return {
      ok: false,
      error: 'No saved application attempt is available to retry.',
      retryable: false,
      code: 'no_saved_attempt',
    };
  }

  return submitApplication(cloneSnapshot(attempt.snapshot), options);
}

export function discardApplicationAttempt(options: { clearDraft?: boolean; clearReceipt?: boolean } = {}): void {
  clearAttempt('application');
  rotateIdempotencyKey('application');
  if (options.clearReceipt) {
    clearReceipt();
  }
  if (options.clearDraft) {
    clearDraftPayload();
  }
}

// ---------------------------------------------------------------------------
// Session Receipts — Private statusToken held safely
// ---------------------------------------------------------------------------

const RECEIPT_KEY = 'tirak_application_receipt';
const DRAFT_KEY = 'tirak_application_draft';

export interface ApplicationReceipt {
  applicationId: string;
  statusToken: string;
  status: ApplicationStage;
  savedAt: string;
  evidence?: EvidenceItem[];
}

export function saveReceipt(receipt: ApplicationReceipt): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(RECEIPT_KEY, JSON.stringify(receipt));
  } catch {
    // ignore
  }
}

export function loadReceipt(): ApplicationReceipt | null {
  const storage = safeLocalStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(RECEIPT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ApplicationReceipt;
    if (
      parsed &&
      typeof parsed.applicationId === 'string' &&
      parsed.applicationId.trim().length > 0 &&
      typeof parsed.statusToken === 'string' &&
      parsed.statusToken.trim().length > 0
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearReceipt(): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(RECEIPT_KEY);
  } catch {
    // ignore
  }
}

export function saveDraftPayload(payload: ApplicationPayload): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function loadDraftPayload(): ApplicationPayload | null {
  const storage = safeLocalStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApplicationPayload;
  } catch {
    return null;
  }
}

export function clearDraftPayload(): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function startNewDraft(): void {
  discardApplicationAttempt({ clearDraft: true, clearReceipt: true });
}

// ---------------------------------------------------------------------------
// Client-side Validation (Pre-POST)
// ---------------------------------------------------------------------------

export function validateApplicationPayload(payload: ApplicationPayload): { valid: true } | { valid: false; error: string } {
  if (!payload.businessName || payload.businessName.trim().length < 2) {
    return { valid: false, error: 'Business name must be at least 2 characters.' };
  }
  if (!payload.contactName || payload.contactName.trim().length < 2) {
    return { valid: false, error: 'Contact name must be at least 2 characters.' };
  }
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    return { valid: false, error: 'A valid email address is required.' };
  }
  if (!payload.phone || payload.phone.trim().length < 8) {
    return { valid: false, error: 'Phone number must be at least 8 characters.' };
  }
  if (!payload.location || payload.location.trim().length < 2) {
    return { valid: false, error: 'Location is required.' };
  }
  if (!Array.isArray(payload.categories) || payload.categories.length === 0) {
    return { valid: false, error: 'At least one guide category is required.' };
  }

  const appData = payload.applicationData;
  if (!appData || typeof appData !== 'object') {
    return { valid: false, error: 'Structured individual application data is required.' };
  }

  if (!appData.firstName || appData.firstName.trim().length === 0) {
    return { valid: false, error: 'First name is required.' };
  }
  if (!appData.lastName || appData.lastName.trim().length === 0) {
    return { valid: false, error: 'Last name is required.' };
  }

  // Check forbidden URIs
  for (const str of [payload.bio, appData.bio, appData.firstName, appData.lastName, appData.location]) {
    if (typeof str === 'string' && FORBIDDEN_URI_RE.test(str.trim())) {
      return { valid: false, error: 'Data URIs and local file schemes are not permitted in text fields.' };
    }
  }

  // Service drafts validation (inactive draft services)
  if (appData.serviceDrafts) {
    if (!Array.isArray(appData.serviceDrafts)) {
      return { valid: false, error: 'serviceDrafts must be an array.' };
    }
    if (appData.serviceDrafts.length > 10) {
      return { valid: false, error: 'A maximum of 10 service drafts is allowed.' };
    }
    for (let i = 0; i < appData.serviceDrafts.length; i++) {
      const draft = appData.serviceDrafts[i];
      if (!draft.title || draft.title.trim().length === 0) {
        return { valid: false, error: `Service draft #${i + 1} requires a title.` };
      }
      if (typeof draft.price !== 'number' || draft.price < 0 || draft.price > 1_000_000) {
        return { valid: false, error: `Service draft #${i + 1} price must be between 0 and 1,000,000 THB.` };
      }
      if (draft.currency !== 'THB') {
        return { valid: false, error: `Service draft #${i + 1} currency must be THB.` };
      }
      if (!Number.isInteger(draft.durationMinutes) || draft.durationMinutes < 30 || draft.durationMinutes > 1439) {
        return { valid: false, error: `Service draft #${i + 1} duration must be an integer between 30 and 1439 minutes.` };
      }
    }
  }

  // Schedule validation: strict one continuous span / week validation
  if (appData.schedule) {
    if (appData.schedule.timeZone !== 'Asia/Bangkok') {
      return { valid: false, error: 'Schedule timeZone must be Asia/Bangkok.' };
    }
    if (!Array.isArray(appData.schedule.days) || appData.schedule.days.length !== 7) {
      return { valid: false, error: 'Schedule must include exactly 7 days (Sunday through Saturday).' };
    }

    const seenDays = new Set<number>();
    for (const day of appData.schedule.days) {
      if (typeof day.dayOfWeek !== 'number' || day.dayOfWeek < 0 || day.dayOfWeek > 6) {
        return { valid: false, error: 'Each schedule dayOfWeek must be an integer between 0 and 6.' };
      }
      if (seenDays.has(day.dayOfWeek)) {
        return { valid: false, error: `Multiple intervals defined for day ${day.dayOfWeek}. Only one continuous span per weekday is supported.` };
      }
      seenDays.add(day.dayOfWeek);

      if (!TIME_RE.test(day.startTime) || !TIME_RE.test(day.endTime)) {
        return { valid: false, error: 'Schedule times must be in HH:mm 24-hour format.' };
      }
      if (day.isAvailable && day.startTime >= day.endTime) {
        return { valid: false, error: `Available schedule start time (${day.startTime}) must be earlier than end time (${day.endTime}).` };
      }
    }
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Strict Envelope Parsers
// ---------------------------------------------------------------------------

async function safeParseJson(res: Response): Promise<{ ok: true; json: Record<string, unknown> } | { ok: false; error: string }> {
  let text = '';
  try {
    text = await res.text();
  } catch {
    return { ok: false, error: `Could not read response body (status ${res.status}).` };
  }
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { ok: false, error: `Invalid response format (status ${res.status}).` };
    }
    return { ok: true, json: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, error: `Malformed non-JSON response (status ${res.status}).` };
  }
}

function parseApplicationEnvelope(json: Record<string, unknown>): ApplicationResult {
  if (json.success !== true) {
    const msg = typeof json.message === 'string' ? json.message : typeof json.error === 'string' ? json.error : 'Submission rejected by server.';
    throw new Error(msg);
  }
  const data = json.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== 'object') {
    throw new Error('Malformed response: missing data envelope.');
  }
  if (typeof data.applicationId !== 'string' || data.applicationId.trim().length === 0) {
    throw new Error('Malformed response: missing valid applicationId.');
  }
  if (typeof data.statusToken !== 'string' || data.statusToken.trim().length === 0) {
    throw new Error('The server did not return a recoverable application receipt. Retry this submission.');
  }
  const statusToken = data.statusToken.trim();
  const rawStatus = typeof data.status === 'string' ? data.status.trim() : 'pending';
  const status: ApplicationStage = ['approved', 'rejected'].includes(rawStatus) ? (rawStatus as ApplicationStage) : 'pending';
  const statusNote = typeof data.statusNote === 'string' ? data.statusNote : undefined;

  return {
    applicationId: data.applicationId.trim(),
    statusToken,
    status,
    statusNote,
  };
}

function parseStatusEnvelope(json: Record<string, unknown>): StatusResult {
  if (json.success !== true) {
    const msg = typeof json.message === 'string' ? json.message : typeof json.error === 'string' ? json.error : 'Status check failed.';
    throw new Error(msg);
  }
  const data = json.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== 'object') {
    throw new Error('Malformed response: missing data envelope.');
  }
  if (typeof data.applicationId !== 'string' || data.applicationId.trim().length === 0) {
    throw new Error('Malformed response: missing applicationId.');
  }
  if (typeof data.status !== 'string' || !['pending', 'approved', 'rejected'].includes(data.status)) {
    throw new Error('Malformed response: missing or invalid status value.');
  }

  let evidenceItems: EvidenceItem[] | undefined;
  if (data.evidence !== undefined && !Array.isArray(data.evidence)) {
    throw new Error('Malformed response: evidence must be an array.');
  }
  if (Array.isArray(data.evidence)) {
    evidenceItems = data.evidence.map((ev: unknown) => {
      if (!ev || typeof ev !== 'object') {
        throw new Error('Malformed response: invalid evidence reference.');
      }
      const ref = ev as Record<string, unknown>;
      if (typeof ref.evidenceId !== 'string' || !ref.evidenceId.trim()
        || typeof ref.kind !== 'string' || !VALID_EVIDENCE_KINDS.has(ref.kind)) {
        throw new Error('Malformed response: invalid evidence reference.');
      }
      return {
        evidenceId: ref.evidenceId,
        kind: ref.kind as EvidenceKind,
        uploadedAt: typeof ref.uploadedAt === 'string' ? ref.uploadedAt : undefined,
      };
    });
  }

  return {
    applicationId: data.applicationId,
    status: data.status as ApplicationStage,
    accountStatus: typeof data.accountStatus === 'string' ? data.accountStatus : undefined,
    profileStatus: typeof data.profileStatus === 'string' ? data.profileStatus : undefined,
    publicationStatus: typeof data.publicationStatus === 'string' ? data.publicationStatus : undefined,
    submittedAt: typeof data.submittedAt === 'string' ? data.submittedAt : undefined,
    reviewedAt: typeof data.reviewedAt === 'string' ? data.reviewedAt : undefined,
    expiresAt: typeof data.expiresAt === 'string' ? data.expiresAt : null,
    blockers: data.blockers as StatusResult['blockers'],
    evidence: evidenceItems,
    paymentStatus: typeof data.paymentStatus === 'string' ? data.paymentStatus : undefined,
    invitationDelivery: (() => {
      const inv = data.invitationDelivery;
      if (typeof inv === 'object' && inv !== null && typeof (inv as Record<string, unknown>).status === 'string') {
        return { status: (inv as Record<string, unknown>).status as string };
      }
      return undefined;
    })(),
  };
}

function parseEvidenceEnvelope(json: Record<string, unknown>): EvidenceResult {
  if (json.success !== true) {
    const msg = typeof json.message === 'string' ? json.message : typeof json.error === 'string' ? json.error : 'Evidence upload rejected.';
    throw new Error(msg);
  }
  const data = json.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== 'object') {
    throw new Error('Malformed response: missing evidence data envelope.');
  }
  if (typeof data.evidenceId !== 'string' || data.evidenceId.trim().length === 0) {
    throw new Error('Malformed response: missing evidenceId.');
  }
  if (typeof data.kind !== 'string' || !VALID_EVIDENCE_KINDS.has(data.kind)) {
    throw new Error('Malformed response: missing or invalid evidence kind.');
  }

  return {
    evidenceId: data.evidenceId.trim(),
    kind: data.kind as EvidenceKind,
  };
}

function parseInterestEnvelope(json: Record<string, unknown>): InterestResult {
  if (json.success !== true) {
    const msg = typeof json.message === 'string' ? json.message : typeof json.error === 'string' ? json.error : 'Interest signup rejected.';
    throw new Error(msg);
  }
  const data = json.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== 'object') {
    throw new Error('Malformed response: missing interest data envelope.');
  }
  if (typeof data.interestId !== 'string' || data.interestId.trim().length === 0) {
    throw new Error('Malformed response: missing interestId.');
  }

  return {
    interestId: data.interestId.trim(),
  };
}

// ---------------------------------------------------------------------------
// Network Operations
// ---------------------------------------------------------------------------

/**
 * Submit individual guide application.
 * Retains stable Idempotency-Key across retries; sends canonical payload.
 */
export async function submitApplication(
  payload: ApplicationPayload,
  options: RequestOptions = {}
): Promise<OnboardingResult> {
  let base: string;
  try {
    base = getApiBase();
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      retryable: false,
      code: 'service_unavailable',
    };
  }

  const validation = validateApplicationPayload(payload);
  if (validation.valid === false) {
    return { ok: false, error: validation.error, retryable: false, code: 'validation' };
  }

  const prepared = prepareAttempt('application', payload);
  if (prepared.ok === false) {
    return {
      ok: false,
      error: prepared.error,
      retryable: false,
      code: prepared.code,
    };
  }

  const { attempt } = prepared;
  const request = createRequestController(options);

  try {
    const res = await fetch(`${base}/supplier-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': attempt.key,
      },
      body: JSON.stringify(attempt.snapshot),
      signal: request.signal,
    });

    const parseResult = await safeParseJson(res);
    if (parseResult.ok === false) {
      const retryable = res.status >= 500 || res.status === 429;
      const code: SubmissionErrorCode = retryable ? 'transport_unknown' : 'validation';
      markAttemptFailure('application', attempt, code, parseResult.error);
      return { ok: false, error: parseResult.error, retryable, code };
    }

    if (!res.ok) {
      const retryable = res.status >= 500 || res.status === 429;
      const serverMsg =
        typeof parseResult.json.message === 'string'
          ? parseResult.json.message
          : typeof parseResult.json.error === 'string'
          ? parseResult.json.error
          : `Server returned error (${res.status})`;
      const code: SubmissionErrorCode =
        res.status === 409
          ? 'idempotency_conflict'
          : retryable
          ? 'transport_unknown'
          : 'validation';
      markAttemptFailure('application', attempt, code, serverMsg);
      return { ok: false, error: serverMsg, retryable, code };
    }

    const data = parseApplicationEnvelope(parseResult.json);
    finalizeSuccessfulAttempt('application');
    return { ok: true, data };
  } catch (err: unknown) {
    if (isAbortError(err)) {
      const code: SubmissionErrorCode = options.signal?.aborted ? 'request_aborted' : 'timeout_unknown';
      const message =
        code === 'request_aborted'
          ? 'Submission cancelled before completion.'
          : 'Submission timed out before Tirak could confirm the result. Retry the same saved attempt and do not edit the form unless you deliberately start a new application.';
      markAttemptFailure('application', attempt, code, message);
      return {
        ok: false,
        error: message,
        retryable: code !== 'request_aborted',
        code,
      };
    }

    const message = err instanceof Error ? err.message : String(err);
    markAttemptFailure('application', attempt, 'transport_unknown', message);
    return { ok: false, error: message, retryable: true, code: 'transport_unknown' };
  } finally {
    request.dispose();
  }
}

/**
 * Check application status by private status token.
 * GET /supplier-onboarding/:id/status  (Bearer: statusToken)
 */
export async function checkStatus(
  applicationId: string,
  statusToken: string,
  options: RequestOptions = {}
): Promise<StatusApiResult> {
  let base: string;
  try {
    base = getApiBase();
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      retryable: false,
      code: 'service_unavailable',
    };
  }

  if (!applicationId || applicationId.trim().length === 0) {
    return { ok: false, error: 'Application ID is required.', retryable: false, code: 'validation' };
  }
  if (!statusToken || statusToken.trim().length === 0) {
    return { ok: false, error: 'Status token capability is required.', retryable: false, code: 'validation' };
  }

  const request = createRequestController(options);

  try {
    const res = await fetch(
      `${base}/supplier-onboarding/${encodeURIComponent(applicationId.trim())}/status`,
      {
        headers: { Authorization: `Bearer ${statusToken.trim()}` },
        signal: request.signal,
      }
    );

    const parseResult = await safeParseJson(res);
    if (parseResult.ok === false) {
      const retryable = res.status >= 500 || res.status === 429;
      return { ok: false, error: parseResult.error, retryable, code: retryable ? 'transport_unknown' : 'validation' };
    }

    if (!res.ok) {
      const retryable = res.status >= 500 || res.status === 429;
      const errorMsg =
        typeof parseResult.json.message === 'string'
          ? parseResult.json.message
          : typeof parseResult.json.error === 'string'
          ? parseResult.json.error
          : `Status check failed (${res.status})`;
      return { ok: false, error: errorMsg, retryable, code: retryable ? 'transport_unknown' : 'validation' };
    }

    const data = parseStatusEnvelope(parseResult.json);
    return { ok: true, data };
  } catch (err: unknown) {
    if (isAbortError(err)) {
      const code: SubmissionErrorCode = options.signal?.aborted ? 'request_aborted' : 'timeout_unknown';
      const message = code === 'request_aborted' ? 'Status check cancelled.' : 'Status check timed out.';
      return { ok: false, error: message, retryable: code !== 'request_aborted', code };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message, retryable: true, code: 'transport_unknown' };
  } finally {
    request.dispose();
  }
}

/**
 * Submit private identity verification evidence.
 * POST /supplier-onboarding/:id/evidence (multipart/form-data)
 */
export async function submitEvidence(
  applicationId: string,
  statusToken: string,
  file: File,
  kind: EvidenceKind,
  options: RequestOptions = {}
): Promise<EvidenceApiResult> {
  let base: string;
  try {
    base = getApiBase();
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      retryable: false,
      code: 'service_unavailable',
    };
  }

  if (!applicationId || !statusToken) {
    return {
      ok: false,
      error: 'Valid application reference and status capability required.',
      retryable: false,
      code: 'validation',
    };
  }

  const form = new FormData();
  form.append('file', file);
  form.append('kind', kind);

  const request = createRequestController({ ...options, timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS * 2 });

  try {
    const res = await fetch(
      `${base}/supplier-onboarding/${encodeURIComponent(applicationId.trim())}/evidence`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${statusToken.trim()}` },
        body: form,
        signal: request.signal,
      }
    );

    const parseResult = await safeParseJson(res);
    if (parseResult.ok === false) {
      const retryable = res.status >= 500 || res.status === 429;
      return { ok: false, error: parseResult.error, retryable, code: retryable ? 'transport_unknown' : 'validation' };
    }

    if (!res.ok) {
      const retryable = res.status >= 500 || res.status === 429;
      const errorMsg =
        typeof parseResult.json.message === 'string'
          ? parseResult.json.message
          : typeof parseResult.json.error === 'string'
          ? parseResult.json.error
          : `Evidence upload failed (${res.status})`;
      return { ok: false, error: errorMsg, retryable, code: retryable ? 'transport_unknown' : 'validation' };
    }

    const data = parseEvidenceEnvelope(parseResult.json);
    return { ok: true, data };
  } catch (err: unknown) {
    if (isAbortError(err)) {
      const code: SubmissionErrorCode = options.signal?.aborted ? 'request_aborted' : 'timeout_unknown';
      const message = code === 'request_aborted' ? 'Evidence upload cancelled.' : 'Evidence upload timed out.';
      return { ok: false, error: message, retryable: code !== 'request_aborted', code };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message, retryable: true, code: 'transport_unknown' };
  } finally {
    request.dispose();
  }
}

/**
 * Submit waitlist interest signup.
 * POST /interest
 */
export async function submitInterest(
  payload: InterestPayload,
  options: RequestOptions = {}
): Promise<InterestApiResult> {
  let base: string;
  try {
    base = getApiBase();
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      retryable: false,
      code: 'service_unavailable',
    };
  }

  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    return { ok: false, error: 'A valid email address is required.', retryable: false, code: 'validation' };
  }

  const normalizedPayload: InterestPayload = {
    email: payload.email.trim().toLowerCase(),
    name: payload.name ? payload.name.trim() : undefined,
    source: payload.source || 'tirak_prelaunch',
  };

  const prepared = prepareAttempt('interest', normalizedPayload);
  if (prepared.ok === false) {
    return {
      ok: false,
      error: prepared.error,
      retryable: false,
      code: prepared.code,
    };
  }

  const { attempt } = prepared;
  const request = createRequestController(options);

  try {
    const res = await fetch(`${base}/interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': attempt.key,
      },
      body: JSON.stringify(attempt.snapshot),
      signal: request.signal,
    });

    const parseResult = await safeParseJson(res);
    if (parseResult.ok === false) {
      const retryable = res.status >= 500 || res.status === 429;
      const code: SubmissionErrorCode = retryable ? 'transport_unknown' : 'validation';
      markAttemptFailure('interest', attempt, code, parseResult.error);
      return { ok: false, error: parseResult.error, retryable, code };
    }

    if (!res.ok) {
      const retryable = res.status >= 500 || res.status === 429;
      const errorMsg =
        typeof parseResult.json.message === 'string'
          ? parseResult.json.message
          : typeof parseResult.json.error === 'string'
          ? parseResult.json.error
          : `Interest signup failed (${res.status})`;
      const code: SubmissionErrorCode =
        res.status === 409
          ? 'idempotency_conflict'
          : retryable
          ? 'transport_unknown'
          : 'validation';
      markAttemptFailure('interest', attempt, code, errorMsg);
      return { ok: false, error: errorMsg, retryable, code };
    }

    const data = parseInterestEnvelope(parseResult.json);
    finalizeSuccessfulAttempt('interest');
    return { ok: true, data };
  } catch (err: unknown) {
    if (isAbortError(err)) {
      const code: SubmissionErrorCode = options.signal?.aborted ? 'request_aborted' : 'timeout_unknown';
      const message =
        code === 'request_aborted'
          ? 'Interest signup cancelled.'
          : 'Interest signup timed out before Tirak could confirm the result. Retry the same saved signup before changing the form.';
      markAttemptFailure('interest', attempt, code, message);
      return {
        ok: false,
        error: message,
        retryable: code !== 'request_aborted',
        code,
      };
    }
    const message = err instanceof Error ? err.message : String(err);
    markAttemptFailure('interest', attempt, 'transport_unknown', message);
    return { ok: false, error: message, retryable: true, code: 'transport_unknown' };
  } finally {
    request.dispose();
  }
}

// ---------------------------------------------------------------------------
// Test reset hook
// ---------------------------------------------------------------------------

export function _resetIdempotencyKeys(): void {
  for (const k of Object.keys(IDEMPOTENCY_KEYS)) {
    delete IDEMPOTENCY_KEYS[k];
  }
}
