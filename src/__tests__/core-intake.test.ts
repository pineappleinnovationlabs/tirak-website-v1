/**
 * Core intake client tests — run with: npm test
 *
 * Covers:
 * - Environment configuration & URL normalization
 * - submitApplication (intake, validation, idempotency, retry, envelope parsing)
 * - checkStatus (bearer capability, stage matrix, blockers, strict rejection of malformed)
 * - submitEvidence (multipart, kind, data.evidenceId envelope parsing)
 * - submitInterest (waitlist, stable idempotency, data.interestId envelope parsing)
 * - Session receipt & capability privacy (no bearer/PII in URLs or logs)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  submitApplication,
  submitInterest,
  submitEvidence,
  checkStatus,
  getIdempotencyKey,
  rotateIdempotencyKey,
  startNewDraft,
  _resetIdempotencyKeys,
  clearReceipt,
  saveReceipt,
  loadReceipt,
  validateApplicationPayload,
  DEFAULT_WEEKDAY_SCHEDULE,
  loadSavedApplicationAttempt,
  retrySavedApplicationAttempt,
  getApplicationAttemptRecovery,
  discardApplicationAttempt,
  startNewInterestAttempt,
} from '../lib/core-intake';
import type {
  ApplicationPayload,
  InterestPayload,
  ApplicationSchedule,
} from '../lib/core-intake';

// ---------------------------------------------------------------------------
// Mock in-memory localStorage for Node test environment
// ---------------------------------------------------------------------------

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

const mockStorage = new LocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
});

// ---------------------------------------------------------------------------
// Mock import.meta.env.VITE_CORE_API_URL
// ---------------------------------------------------------------------------

vi.stubEnv('VITE_CORE_API_URL', 'https://test-api.example.com/api');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetch(response: unknown, status = 200): ReturnType<typeof vi.fn> {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(typeof response === 'string' ? response : JSON.stringify(response)),
  });
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

function mockFetchReject(error: Error): ReturnType<typeof vi.fn> {
  const fn = vi.fn().mockRejectedValue(error);
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

const validSchedule: ApplicationSchedule = {
  timeZone: 'Asia/Bangkok',
  days: [
    { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isAvailable: false },
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isAvailable: false },
  ],
};

const validPayload: ApplicationPayload = {
  businessName: 'Thai Taste Adventures',
  contactName: 'Somchai Prasert',
  email: 'somchai@example.com',
  phone: '+66 81 234 5678',
  location: 'Bangkok, Thailand',
  bio: 'Certified local food guide with 8 years experience.',
  categories: [{ name: 'Food & Drink', memberCount: 1 }],
  mode: 'tirak',
  brochureUrls: ['https://example.com/brochure.pdf'],
  applicationData: {
    firstName: 'Somchai',
    lastName: 'Prasert',
    bio: 'Certified local food guide with 8 years experience.',
    location: 'Bangkok, Thailand',
    languages: ['en', 'th'],
    interests: ['Street Food', 'History', 'Temples'],
    serviceDrafts: [
      {
        title: 'Old Town Street Food Tour',
        description: 'Guided evening walk through authentic food stalls.',
        price: 1500,
        currency: 'THB',
        durationMinutes: 180,
      },
    ],
    schedule: validSchedule,
  },
};

const validInterest: InterestPayload = {
  email: 'traveler@example.com',
  name: 'Test Traveler',
  source: 'tirak_prelaunch',
};

const validApiResponse = {
  success: true,
  data: {
    applicationId: 'app-abc-123',
    statusToken: 'a'.repeat(96),
    status: 'pending',
  },
};

const validStatusResponse = {
  success: true,
  data: {
    applicationId: 'app-abc-123',
    status: 'approved',
    accountStatus: 'provisioned',
    profileStatus: 'verification_pending',
    publicationStatus: 'inactive',
    expiresAt: '2026-11-05T00:00:00.000Z',
    blockers: ['profile_setup_pending'],
    evidence: [{ evidenceId: 'ev-999', kind: 'id_front' }],
  },
};

const validEvidenceResponse = {
  success: true,
  data: {
    evidenceId: 'ev-id-front-001',
    kind: 'id_front',
  },
};

const validInterestResponse = {
  success: true,
  data: {
    interestId: 'interest-ref-456',
  },
};

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockStorage.clear();
  _resetIdempotencyKeys();
  clearReceipt();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Config & Base URL
// ---------------------------------------------------------------------------

describe('config', () => {
  it('throws explicit error when VITE_CORE_API_URL is missing', async () => {
    vi.stubEnv('VITE_CORE_API_URL', '');
    _resetIdempotencyKeys();
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toContain('service is currently unavailable');
      expect(result.retryable).toBe(false);
    }
  });

  it('handles trailing slash on base URL properly', async () => {
    vi.stubEnv('VITE_CORE_API_URL', 'https://test-api.example.com/api/');
    _resetIdempotencyKeys();
    const fn = mockFetch(validApiResponse, 200);
    await submitApplication(validPayload);
    expect(fn.mock.calls[0][0]).toBe('https://test-api.example.com/api/supplier-onboarding');
  });
});

// ---------------------------------------------------------------------------
// submitApplication — Happy path & payload structure
// ---------------------------------------------------------------------------

describe('submitApplication', () => {
  it('succeeds with valid server response envelope', async () => {
    mockFetch(validApiResponse, 200);
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(true);
    if (result.ok === true) {
      expect(result.data.applicationId).toBe('app-abc-123');
      expect(result.data.statusToken).toBe('a'.repeat(96));
      expect(result.data.status).toBe('pending');
    }
  });

  it('sends Idempotency-Key header with valid UUID', async () => {
    const fn = mockFetch(validApiResponse, 200);
    await submitApplication(validPayload);
    const headers = fn.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBeTruthy();
    expect(headers['Idempotency-Key']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('sends POST to /supplier-onboarding with canonical individual data', async () => {
    const fn = mockFetch(validApiResponse, 200);
    await submitApplication(validPayload);
    expect(fn.mock.calls[0][0]).toBe('https://test-api.example.com/api/supplier-onboarding');
    expect(fn.mock.calls[0][1]?.method).toBe('POST');
    const sentBody = JSON.parse(fn.mock.calls[0][1]?.body as string);
    expect(sentBody.mode).toBe('tirak');
    expect(sentBody.applicationData.serviceDrafts[0].currency).toBe('THB');
    expect(sentBody.applicationData.schedule.timeZone).toBe('Asia/Bangkok');
  });
});

// ---------------------------------------------------------------------------
// Client-side payload validation (pre-POST)
// ---------------------------------------------------------------------------

describe('validateApplicationPayload', () => {
  it('passes valid canonical payload', () => {
    const validation = validateApplicationPayload(validPayload);
    expect(validation.valid).toBe(true);
  });

  it('rejects forbidden URI schemes in bio or names', () => {
    const badPayload: ApplicationPayload = {
      ...validPayload,
      bio: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    };
    const validation = validateApplicationPayload(badPayload);
    expect(validation.valid).toBe(false);
    if (validation.valid === false) {
      expect(validation.error).toContain('Data URIs');
    }
  });

  it('rejects multiple continuous spans on the same weekday', () => {
    const badSchedule: ApplicationSchedule = {
      timeZone: 'Asia/Bangkok',
      days: [
        { dayOfWeek: 0, startTime: '09:00', endTime: '12:00', isAvailable: true },
        { dayOfWeek: 0, startTime: '13:00', endTime: '17:00', isAvailable: true }, // duplicate day 0
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
      ],
    };
    const badPayload: ApplicationPayload = {
      ...validPayload,
      applicationData: {
        ...validPayload.applicationData,
        schedule: badSchedule,
      },
    };
    const validation = validateApplicationPayload(badPayload);
    expect(validation.valid).toBe(false);
    if (validation.valid === false) {
      expect(validation.error).toContain('Multiple intervals');
    }
  });

  it.each([15, 29, 1440, 30.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects unbookable service duration %s', (durationMinutes) => {
    const payload: ApplicationPayload = { ...validPayload, applicationData: { ...validPayload.applicationData, serviceDrafts: [{ title: 'Guide walk', price: 500, currency: 'THB', durationMinutes }] } };
    expect(validateApplicationPayload(payload).valid).toBe(false);
  });

  it.each([30, 90, 1439])('accepts same-day integer duration %s', (durationMinutes) => {
    const payload: ApplicationPayload = { ...validPayload, applicationData: { ...validPayload.applicationData, serviceDrafts: [{ title: 'Guide walk', price: 500, currency: 'THB', durationMinutes }] } };
    expect(validateApplicationPayload(payload).valid).toBe(true);
  });

  it('rejects service drafts with invalid duration or currency', () => {
    const badPayload: ApplicationPayload = {
      ...validPayload,
      applicationData: {
        ...validPayload.applicationData,
        serviceDrafts: [
          {
            title: 'Too short tour',
            price: 500,
            currency: 'THB',
            durationMinutes: 5, // below 30 mins
          },
        ],
      },
    };
    const validation = validateApplicationPayload(badPayload);
    expect(validation.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// submitApplication failures and retries
// ---------------------------------------------------------------------------

describe('submitApplication failures', () => {
  it('returns retryable=true on 500 server error', async () => {
    mockFetch({ success: false, message: 'Internal Server Error' }, 500);
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.retryable).toBe(true);
      expect(result.error).toContain('Internal Server Error');
    }
  });

  it('returns retryable=true on 429 rate limit', async () => {
    mockFetch({ success: false, message: 'Too Many Requests' }, 429);
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.retryable).toBe(true);
    }
  });

  it('returns retryable=false on 400 client error', async () => {
    mockFetch({ success: false, message: 'Validation failed' }, 400);
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.retryable).toBe(false);
    }
  });

  it('returns retryable=true on network failure', async () => {
    mockFetchReject(new Error('Network disconnected'));
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.retryable).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Idempotency key management
// ---------------------------------------------------------------------------

describe('idempotency key', () => {
  it('returns the same key across multiple calls and retries', async () => {
    const key1 = getIdempotencyKey('application');
    const key2 = getIdempotencyKey('application');
    expect(key1).toBe(key2);
  });

  it('preserves key after transport failure', async () => {
    const keyBefore = getIdempotencyKey('application');
    mockFetchReject(new Error('Failed'));
    await submitApplication(validPayload);
    const keyAfter = getIdempotencyKey('application');
    expect(keyAfter).toBe(keyBefore);
  });

  it('uses different keys for application and interest forms', () => {
    const appKey = getIdempotencyKey('application');
    const interestKey = getIdempotencyKey('interest');
    expect(appKey).not.toBe(interestKey);
  });

  it('rotates key on startNewDraft', () => {
    const key1 = getIdempotencyKey('application');
    startNewDraft();
    const key2 = getIdempotencyKey('application');
    expect(key2).not.toBe(key1);
  });

  it('persists immutable application attempt snapshot before POST and retries that same snapshot', async () => {
    mockFetchReject(new Error('Network disconnected'));
    const failed = await submitApplication(validPayload);
    expect(failed.ok).toBe(false);

    const saved = loadSavedApplicationAttempt();
    expect(saved?.snapshot).toEqual(validPayload);

    const changedPayload: ApplicationPayload = {
      ...validPayload,
      bio: 'Updated bio after ambiguous failure',
    };

    const mismatch = await submitApplication(changedPayload);
    expect(mismatch.ok).toBe(false);
    if (mismatch.ok === false) {
      expect(mismatch.code).toBe('payload_mismatch');
      expect(mismatch.retryable).toBe(false);
    }

    const retryFetch = mockFetch(validApiResponse, 200);
    const retried = await retrySavedApplicationAttempt();
    expect(retried.ok).toBe(true);
    const sentBody = JSON.parse(retryFetch.mock.calls[0][1]?.body as string);
    expect(sentBody.bio).toBe(validPayload.bio);
  });

  it('rotates application attempt only on deliberate discard', async () => {
    mockFetchReject(new Error('Network disconnected'));
    await submitApplication(validPayload);

    const recoveryBefore = getApplicationAttemptRecovery(validPayload);
    expect(recoveryBefore.state).toBe('retry_saved');

    const keyBefore = getIdempotencyKey('application');
    discardApplicationAttempt();
    const keyAfter = getIdempotencyKey('application');

    expect(keyAfter).not.toBe(keyBefore);
    expect(getApplicationAttemptRecovery(validPayload).state).toBe('none');
  });
});

// ---------------------------------------------------------------------------
// Strict envelope validation
// ---------------------------------------------------------------------------

describe('strict envelope parsing', () => {
  it.each([undefined, '', '   '])('rejects an unusable recovery token: %s', async (statusToken) => {
    mockFetch({ success: true, data: { applicationId: 'app-1', status: 'pending', statusToken } }, 200);
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(false);
  });
  it('returns error when success is false', async () => {
    mockFetch({ success: false, error: 'Database constraint failed' }, 200);
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(false);
  });

  it('returns error when response is missing data envelope', async () => {
    mockFetch({ success: true }, 200);
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toContain('data envelope');
    }
  });

  it('returns error when response is missing data.applicationId', async () => {
    mockFetch({ success: true, data: { statusToken: 'tok' } }, 200);
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toContain('applicationId');
    }
  });

  it('returns error for non-JSON response body', async () => {
    const fn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('<html><body>502 Bad Gateway</body></html>'),
    });
    globalThis.fetch = fn as unknown as typeof fetch;
    const result = await submitApplication(validPayload);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toContain('non-JSON');
    }
  });
});

// ---------------------------------------------------------------------------
// checkStatus
// ---------------------------------------------------------------------------

describe('checkStatus', () => {
  it.each([
    [{evidenceId:'evidence-1',kind:'invalid'}],
    [{evidenceId:' ',kind:'id_front'}],
    [{evidenceId:'evidence-1'}],
    'not-an-array',
  ])('rejects malformed evidence instead of reporting an empty successful state: %j', async (evidence) => {
    mockFetch({success:true,data:{applicationId:'app-1',status:'pending',evidence}},200);
    const result = await checkStatus('app-1','private-capability');
    expect(result.ok).toBe(false);
  });
  it('returns structured status with stages and blockers', async () => {
    mockFetch(validStatusResponse, 200);
    const result = await checkStatus('app-abc-123', 'tok-xyz');
    expect(result.ok).toBe(true);
    if (result.ok === true) {
      expect(result.data.status).toBe('approved');
      expect(result.data.accountStatus).toBe('provisioned');
      expect(result.data.profileStatus).toBe('verification_pending');
      expect(result.data.publicationStatus).toBe('inactive');
      expect(result.data.evidence?.[0].evidenceId).toBe('ev-999');
    }
  });

  it('sends Bearer token in Authorization header and not in URL', async () => {
    const fn = mockFetch(validStatusResponse, 200);
    await checkStatus('app-abc-123', 'tok-secret-abc');
    const calledUrl = fn.mock.calls[0][0] as string;
    const headers = fn.mock.calls[0][1]?.headers as Record<string, string>;

    expect(headers['Authorization']).toBe('Bearer tok-secret-abc');
    expect(calledUrl).not.toContain('tok-secret-abc');
    expect(calledUrl).toContain('/supplier-onboarding/app-abc-123/status');
  });

  it('encodes applicationId path segment safely', async () => {
    const fn = mockFetch(validStatusResponse, 200);
    await checkStatus('app/special#1', 'tok-123');
    const calledUrl = fn.mock.calls[0][0] as string;
    expect(calledUrl).toContain(encodeURIComponent('app/special#1'));
  });

  it('rejects old legacy format { stage: "pending" } missing success:true envelope', async () => {
    mockFetch({ stage: 'pending' }, 200);
    const result = await checkStatus('app-123', 'tok-123');
    expect(result.ok).toBe(false);
  });

  it('returns error on 404 denial', async () => {
    mockFetch({ success: false, error: 'Application not found.' }, 404);
    const result = await checkStatus('bad-app', 'bad-tok');
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// submitEvidence
// ---------------------------------------------------------------------------

describe('submitEvidence', () => {
  it('submits multipart file and returns data.evidenceId', async () => {
    const fn = mockFetch(validEvidenceResponse, 200);
    const testFile = new File(['fake-image-bytes'], 'id-card.jpg', { type: 'image/jpeg' });
    const result = await submitEvidence('app-abc', 'tok-abc', testFile, 'id_front');

    expect(result.ok).toBe(true);
    if (result.ok === true) {
      expect(result.data.evidenceId).toBe('ev-id-front-001');
      expect(result.data.kind).toBe('id_front');
    }
    expect(fn.mock.calls[0][0]).toContain('/supplier-onboarding/app-abc/evidence');
    expect(fn.mock.calls[0][1]?.headers['Authorization']).toBe('Bearer tok-abc');
  });

  it('rejects malformed response missing evidenceId', async () => {
    mockFetch({ success: true, data: {} }, 200);
    const testFile = new File(['fake-image-bytes'], 'id-card.jpg', { type: 'image/jpeg' });
    const result = await submitEvidence('app-abc', 'tok-abc', testFile, 'id_front');

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toContain('evidenceId');
    }
  });

  it('rejects malformed non-JSON body as failure (never ok:true)', async () => {
    const fn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('<html>Error</html>'),
    });
    globalThis.fetch = fn as unknown as typeof fetch;
    const testFile = new File(['fake-image-bytes'], 'id-card.jpg', { type: 'image/jpeg' });
    const result = await submitEvidence('app-abc', 'tok-abc', testFile, 'id_front');

    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// submitInterest
// ---------------------------------------------------------------------------

describe('submitInterest', () => {
  it('succeeds with valid { success: true, data: { interestId } } response', async () => {
    mockFetch(validInterestResponse, 200);
    const result = await submitInterest(validInterest);
    expect(result.ok).toBe(true);
    if (result.ok === true) {
      expect(result.data.interestId).toBe('interest-ref-456');
    }
  });

  it('sends POST to /interest with Idempotency-Key header', async () => {
    const fn = mockFetch(validInterestResponse, 200);
    await submitInterest(validInterest);
    expect(fn.mock.calls[0][0]).toBe('https://test-api.example.com/api/interest');
    expect(fn.mock.calls[0][1]?.method).toBe('POST');
    const headers = fn.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBeTruthy();
  });

  it('rejects legacy top-level reference format missing envelope', async () => {
    mockFetch({ reference: 'ref-legacy-123' }, 200);
    const result = await submitInterest(validInterest);
    expect(result.ok).toBe(false);
  });

  it('returns retryable=true on 503 error', async () => {
    mockFetch({ success: false, error: 'Service Unavailable' }, 503);
    const result = await submitInterest(validInterest);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.retryable).toBe(true);
    }
  });

  it('allows a second distinct signup in the same browser after a successful first signup', async () => {
    const firstFetch = mockFetch(validInterestResponse, 200);
    const first = await submitInterest(validInterest);
    expect(first.ok).toBe(true);

    const firstSentKey = (firstFetch.mock.calls[0][1]?.headers as Record<string, string>)['Idempotency-Key'];
    const secondResponse = { success: true, data: { interestId: 'interest-ref-789' } };
    const fn = mockFetch(secondResponse, 200);
    const second = await submitInterest({
      ...validInterest,
      email: 'traveler-two@example.com',
    });

    expect(second.ok).toBe(true);
    const sentKey = (fn.mock.calls[0][1]?.headers as Record<string, string>)['Idempotency-Key'];
    expect(sentKey).not.toBe(firstSentKey);
  });

  it('keeps the original interest attempt across ambiguous failure and blocks changed payload until explicit rotation', async () => {
    mockFetchReject(new Error('Gateway dropped connection'));
    const failed = await submitInterest(validInterest);
    expect(failed.ok).toBe(false);

    const mismatch = await submitInterest({
      ...validInterest,
      email: 'updated@example.com',
    });
    expect(mismatch.ok).toBe(false);
    if (mismatch.ok === false) {
      expect(mismatch.code).toBe('payload_mismatch');
    }

    startNewInterestAttempt();
    const fn = mockFetch({ success: true, data: { interestId: 'interest-ref-999' } }, 200);
    const rotated = await submitInterest({
      ...validInterest,
      email: 'updated@example.com',
    });
    expect(rotated.ok).toBe(true);
    const sentBody = JSON.parse(fn.mock.calls[0][1]?.body as string);
    expect(sentBody.email).toBe('updated@example.com');
  });
});

describe('abortable transport', () => {
  it('returns request_aborted when caller aborts application submit', async () => {
    const controller = new AbortController();
    const fn = vi.fn().mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          controller.signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true }
          );
        })
    );
    globalThis.fetch = fn as unknown as typeof fetch;

    const pending = submitApplication(validPayload, { signal: controller.signal });
    controller.abort();

    const result = await pending;
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.code).toBe('request_aborted');
    }
  });

  it('aborts status and evidence requests when caller signal aborts', async () => {
    const statusController = new AbortController();
    const statusFetch = vi.fn().mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal as AbortSignal;
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true }
          );
        })
    );
    globalThis.fetch = statusFetch as unknown as typeof fetch;

    const statusPending = checkStatus('app-abc-123', 'tok-xyz', { signal: statusController.signal });
    statusController.abort();
    const statusResult = await statusPending;
    expect(statusResult.ok).toBe(false);
    if (statusResult.ok === false) {
      expect(statusResult.code).toBe('request_aborted');
    }

    const evidenceController = new AbortController();
    const evidenceFetch = vi.fn().mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal as AbortSignal;
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true }
          );
        })
    );
    globalThis.fetch = evidenceFetch as unknown as typeof fetch;

    const testFile = new File(['fake-image-bytes'], 'id-card.jpg', { type: 'image/jpeg' });
    const evidencePending = submitEvidence('app-abc', 'tok-abc', testFile, 'id_front', {
      signal: evidenceController.signal,
    });
    evidenceController.abort();
    const evidenceResult = await evidencePending;
    expect(evidenceResult.ok).toBe(false);
    if (evidenceResult.ok === false) {
      expect(evidenceResult.code).toBe('request_aborted');
    }
  });
});

// ---------------------------------------------------------------------------
// Receipt & Capability Privacy
// ---------------------------------------------------------------------------

describe('receipt and capability privacy', () => {
  it('receipt stores only applicationId, statusToken, status, savedAt — no raw PII', () => {
    saveReceipt({
      applicationId: 'app-123',
      statusToken: 'tok-secret-xyz',
      status: 'pending',
      savedAt: '2026-10-05T12:00:00.000Z',
    });
    const loaded = loadReceipt();
    expect(loaded).toBeTruthy();
    expect(loaded?.applicationId).toBe('app-123');
    expect(loaded?.statusToken).toBe('tok-secret-xyz');

    const json = JSON.stringify(loaded);
    expect(json).not.toContain('email');
    expect(json).not.toContain('phone');
    expect(json).not.toContain('Somchai');
  });

  it('clearReceipt removes stored receipt', () => {
    saveReceipt({
      applicationId: 'app-999',
      statusToken: 'tok-999',
      status: 'pending',
      savedAt: '2026-10-05T12:00:00.000Z',
    });
    clearReceipt();
    expect(loadReceipt()).toBeNull();
  });
});
