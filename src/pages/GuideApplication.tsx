import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import {
  submitApplication,
  checkStatus,
  submitEvidence,
  saveReceipt,
  loadReceipt,
  clearReceipt,
  startNewDraft,
  saveDraftPayload,
  loadDraftPayload,
  loadSavedApplicationAttempt,
  getApplicationAttemptRecovery,
  retrySavedApplicationAttempt,
  discardApplicationAttempt,
  VALID_LANGUAGES,
  DEFAULT_WEEKDAY_SCHEDULE,
} from '@/lib/core-intake';
import type {
  ApplicationPayload,
  ApplicationReceipt,
  EvidenceKind,
  EvidenceItem,
  StatusResult,
  ServiceDraft,
  ScheduleDay,
} from '@/lib/core-intake';

// ---------------------------------------------------------------------------
// Category & Language options
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS = [
  'Food & Drink',
  'Culture & History',
  'Adventure & Outdoors',
  'Wellness & Spa',
  'Nightlife',
  'Nature & Wildlife',
  'Photography',
  'Shopping',
  'Transport',
] as const;

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  th: 'Thai',
  zh: 'Chinese (Mandarin)',
  ja: 'Japanese',
  ko: 'Korean',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  ru: 'Russian',
  ar: 'Arabic',
  pt: 'Portuguese',
  it: 'Italian',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type FormStep = 'form' | 'submitting' | 'receipt';
type RecoveryNotice = {
  tone: 'warning' | 'destructive';
  title: string;
  description: string;
};

export default function GuideApplication() {
  const { toast } = useToast();

  // Basic info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [interestsInput, setInterestsInput] = useState('');
  const [brochureUrlsInput, setBrochureUrlsInput] = useState('');

  // Service Draft (Initial Draft)
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState<number | ''>('');
  const [serviceDuration, setServiceDuration] = useState<number | ''>('');

  // Weekly Schedule (7 days explicit, Asia/Bangkok)
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>(DEFAULT_WEEKDAY_SCHEDULE);

  // Status & Navigation
  const [step, setStep] = useState<FormStep>('form');
  const [receipt, setReceipt] = useState<ApplicationReceipt | null>(null);
  const receiptRef = useRef(receipt);
  receiptRef.current = receipt;
  const [statusDetails, setStatusDetails] = useState<StatusResult | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [recoveryNotice, setRecoveryNotice] = useState<RecoveryNotice | null>(null);

  // Evidence upload
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceKind, setEvidenceKind] = useState<EvidenceKind>('id_front');
  const [evidenceUploading, setEvidenceUploading] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);

  const mountedRef = useRef(true);
  const receiptGenerationRef = useRef(0);
  const submitAbortRef = useRef<AbortController | null>(null);
  const statusAbortRef = useRef<AbortController | null>(null);
  const evidenceAbortRef = useRef<AbortController | null>(null);

  const resetFormFields = useCallback(() => {
    setFirstName('');
    setLastName('');
    setBusinessName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setBio('');
    setSelectedCategories([]);
    setSelectedLanguages([]);
    setInterestsInput('');
    setBrochureUrlsInput('');
    setServiceTitle('');
    setServiceDesc('');
    setServicePrice('');
    setServiceDuration('');
    setScheduleDays(DEFAULT_WEEKDAY_SCHEDULE);
  }, []);

  const hydrateForm = useCallback((payload: ApplicationPayload) => {
    setBusinessName(payload.businessName || '');
    setContactName(payload.contactName || '');
    setEmail(payload.email || '');
    setPhone(payload.phone || '');
    setLocation(payload.location || '');
    setBio(payload.bio || '');
    setSelectedCategories(payload.categories?.map((c) => c.name) || []);
    setBrochureUrlsInput(payload.brochureUrls?.join(', ') || '');

    if (payload.applicationData) {
      setFirstName(payload.applicationData.firstName || '');
      setLastName(payload.applicationData.lastName || '');
      setSelectedLanguages(payload.applicationData.languages || []);
      setInterestsInput(payload.applicationData.interests?.join(', ') || '');

      const first = payload.applicationData.serviceDrafts?.[0];
      setServiceTitle(first?.title || '');
      setServiceDesc(first?.description || '');
      setServicePrice(first?.price ?? '');
      setServiceDuration(first?.durationMinutes ?? '');

      if (payload.applicationData.schedule?.days?.length === 7) {
        setScheduleDays(payload.applicationData.schedule.days);
      } else {
        setScheduleDays(DEFAULT_WEEKDAY_SCHEDULE);
      }
    }
  }, []);

  const invalidateReceiptContext = useCallback(() => {
    receiptGenerationRef.current += 1;
    statusAbortRef.current?.abort();
    evidenceAbortRef.current?.abort();
  }, []);

  // Load existing receipt or draft on mount
  useEffect(() => {
    mountedRef.current = true;
    const existingReceipt = loadReceipt();
    if (existingReceipt) {
      setReceipt(existingReceipt);
      if (existingReceipt.evidence) {
        setEvidenceList(existingReceipt.evidence);
      }
      setStep('receipt');
    } else {
      const draft = loadDraftPayload();
      if (draft) {
        hydrateForm(draft);
      } else {
        const savedAttempt = loadSavedApplicationAttempt();
        if (savedAttempt) {
          hydrateForm(savedAttempt.snapshot);
        }
      }
    }

    return () => {
      mountedRef.current = false;
      submitAbortRef.current?.abort();
      statusAbortRef.current?.abort();
      evidenceAbortRef.current?.abort();
    };
  }, [hydrateForm]);

  // Poll / Refresh status when on receipt view
  const refreshStatus = useCallback(async () => {
    const currentReceipt = receiptRef.current;
    if (!currentReceipt) return;

    statusAbortRef.current?.abort();
    const controller = new AbortController();
    statusAbortRef.current = controller;
    const generation = receiptGenerationRef.current;

    setStatusLoading(true);
    setStatusError(null);

    const result = await checkStatus(currentReceipt.applicationId, currentReceipt.statusToken, {
      signal: controller.signal,
    });

    if (statusAbortRef.current === controller) {
      statusAbortRef.current = null;
    }

    if (
      controller.signal.aborted ||
      !mountedRef.current ||
      generation !== receiptGenerationRef.current ||
      receiptRef.current?.applicationId !== currentReceipt.applicationId
    ) {
      if (mountedRef.current && generation === receiptGenerationRef.current) {
        setStatusLoading(false);
      }
      return;
    }

    setStatusLoading(false);
    if (result.ok === true) {
      setStatusDetails(result.data);
      if (result.data.evidence) {
        setEvidenceList(result.data.evidence);
      }
      const updatedReceipt: ApplicationReceipt = {
        ...receiptRef.current,
        status: result.data.status,
        evidence: result.data.evidence || receiptRef.current.evidence,
      };
      setReceipt(updatedReceipt);
      saveReceipt(updatedReceipt);
    } else if (result.code !== 'request_aborted') {
      setStatusError(result.error);
    }

  }, []);

  const applicationId = receipt?.applicationId;
  useEffect(() => {
    if (step === 'receipt' && applicationId) {
      refreshStatus();
    }
  }, [step, applicationId, refreshStatus]);

  // Toggles
  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const toggleLanguage = useCallback((lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }, []);

  const updateScheduleDay = useCallback((index: number, updates: Partial<ScheduleDay>) => {
    setScheduleDays((prev) =>
      prev.map((day, idx) => (idx === index ? { ...day, ...updates } : day))
    );
  }, []);

  // Construct payload
  const currentPayload: ApplicationPayload = useMemo(() => {
    const serviceDrafts: ServiceDraft[] = serviceTitle.trim()
      ? [
          {
            title: serviceTitle.trim(),
            description: serviceDesc.trim() || undefined,
            price: Number(servicePrice) || 0,
            currency: 'THB',
            durationMinutes: Number(serviceDuration),
          },
        ]
      : [];

    const interests = interestsInput
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const brochureUrls = brochureUrlsInput
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && /^https?:\/\//i.test(u));

    return {
      businessName: businessName.trim() || `${firstName.trim()} ${lastName.trim()}`,
      contactName: contactName.trim() || `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      bio: bio.trim() || undefined,
      categories: selectedCategories.map((name) => ({ name, memberCount: 1 })),
      brochureUrls,
      mode: 'tirak',
      applicationData: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim() || undefined,
        location: location.trim(),
        languages: selectedLanguages,
        interests,
        serviceDrafts,
        schedule: {
          timeZone: 'Asia/Bangkok',
          days: scheduleDays,
        },
      },
    };
  }, [
    firstName,
    lastName,
    businessName,
    contactName,
    email,
    phone,
    location,
    bio,
    selectedCategories,
    selectedLanguages,
    interestsInput,
    brochureUrlsInput,
    serviceTitle,
    serviceDesc,
    servicePrice,
    serviceDuration,
    scheduleDays,
  ]);

  const attemptRecovery = useMemo(() => getApplicationAttemptRecovery(currentPayload), [currentPayload]);

  // Autosave draft
  useEffect(() => {
    if (step === 'form' && (firstName || email || businessName)) {
      saveDraftPayload(currentPayload);
    }
  }, [currentPayload, step, firstName, email, businessName]);

  useEffect(() => {
    if (step !== 'form') return;

    if (attemptRecovery.state === 'retry_saved') {
      setRecoveryNotice({
        tone: 'warning',
        title: 'Saved application attempt ready to retry',
        description:
          'A previous submission from this browser may have reached Tirak even though the receipt was not confirmed here. Retry the same saved attempt before changing details.',
      });
      return;
    }

    if (attemptRecovery.state === 'payload_changed') {
      setRecoveryNotice({
        tone: 'destructive',
        title: 'Current edits differ from the saved attempt',
        description:
          'The browser is holding an earlier submission attempt with a different payload. Retrying will resend the original snapshot. Starting a new attempt may create a second application if the earlier request was already accepted.',
      });
      return;
    }

    setRecoveryNotice(null);
  }, [attemptRecovery, step]);

  const runApplicationSubmit = useCallback(
    async (mode: 'current' | 'saved') => {
      submitAbortRef.current?.abort();
      const controller = new AbortController();
      submitAbortRef.current = controller;

      setSubmissionError(null);
      setRecoveryNotice(null);
      setStep('submitting');

      const result =
        mode === 'saved'
          ? await retrySavedApplicationAttempt({ signal: controller.signal })
          : await submitApplication(currentPayload, { signal: controller.signal });

      if (controller.signal.aborted || !mountedRef.current) {
        return;
      }

      if (submitAbortRef.current === controller) {
        submitAbortRef.current = null;
      }

      if (result.ok === true) {
        invalidateReceiptContext();
        const newReceipt: ApplicationReceipt = {
          applicationId: result.data.applicationId,
          statusToken: result.data.statusToken,
          status: result.data.status || 'pending',
          savedAt: new Date().toISOString(),
        };
        setReceipt(newReceipt);
        saveReceipt(newReceipt);
        setStatusDetails(null);
        setStatusError(null);
        setStep('receipt');
        toast({
          title: 'Application Received',
          description: 'Your guide application reference has been registered.',
        });
        return;
      }

      setStep('form');
      setSubmissionError(result.error);
      if (result.code === 'payload_mismatch' || result.code === 'idempotency_conflict') {
        setRecoveryNotice({
          tone: 'destructive',
          title: 'Saved attempt and current form do not match',
          description:
            'Retry the saved submission exactly as it was first sent, or explicitly start a new attempt for the current edits after acknowledging that the earlier request may already exist.',
        });
      } else if (result.code === 'timeout_unknown' || result.code === 'transport_unknown') {
        setRecoveryNotice({
          tone: 'warning',
          title: 'Submission outcome is not confirmed yet',
          description:
            'Do not keep resubmitting edited data with the same browser attempt. Retry the saved submission first, or deliberately start a new attempt if you want a separate application.',
        });
      }

      toast({
        variant: result.code === 'payload_mismatch' || result.code === 'idempotency_conflict' ? 'destructive' : 'destructive',
        title: 'Submission Failed',
        description: result.error,
      });
    },
    [currentPayload, invalidateReceiptContext, toast]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await runApplicationSubmit('current');
  };

  const handleEvidenceUpload = async () => {
    if (!receipt || !evidenceFile) return;

    evidenceAbortRef.current?.abort();
    const controller = new AbortController();
    evidenceAbortRef.current = controller;
    const generation = receiptGenerationRef.current;
    const targetApplicationId = receipt.applicationId;

    setEvidenceUploading(true);
    setEvidenceError(null);

    const result = await submitEvidence(
      receipt.applicationId,
      receipt.statusToken,
      evidenceFile,
      evidenceKind,
      { signal: controller.signal }
    );

    if (evidenceAbortRef.current === controller) {
      evidenceAbortRef.current = null;
    }

    if (
      controller.signal.aborted ||
      !mountedRef.current ||
      generation !== receiptGenerationRef.current ||
      receiptRef.current?.applicationId !== targetApplicationId
    ) {
      if (mountedRef.current && generation === receiptGenerationRef.current) {
        setEvidenceUploading(false);
      }
      return;
    }

    setEvidenceUploading(false);

    if (result.ok === true) {
      setEvidenceFile(null);
      const newEvidenceItem: EvidenceItem = {
        evidenceId: result.data.evidenceId,
        kind: result.data.kind,
        uploadedAt: new Date().toISOString(),
      };
      const updatedList = [...evidenceList, newEvidenceItem];
      setEvidenceList(updatedList);

      const updatedReceipt: ApplicationReceipt = {
        ...receipt,
        evidence: updatedList,
      };
      setReceipt(updatedReceipt);
      saveReceipt(updatedReceipt);

      toast({
        title: 'Document Uploaded',
        description: `${evidenceKind.replace('_', ' ').toUpperCase()} document saved securely.`,
      });
      refreshStatus();
    } else if (result.code !== 'request_aborted') {
      setEvidenceError(result.error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: result.error,
      });
    }
  };

  const handleRetrySavedAttempt = async () => {
    await runApplicationSubmit('saved');
  };

  const handleStartNewAttemptKeepingEdits = () => {
    if (
      !window.confirm(
        'Start a new application attempt with your current edits? A previous request from this browser may already have been accepted and could still be reviewed separately.'
      )
    ) {
      return;
    }

    submitAbortRef.current?.abort();
    invalidateReceiptContext();
    discardApplicationAttempt({ clearDraft: false, clearReceipt: true });
    saveDraftPayload(currentPayload);
    clearReceipt();
    setReceipt(null);
    setStatusDetails(null);
    setStatusError(null);
    setSubmissionError(null);
    setRecoveryNotice({
      tone: 'warning',
      title: 'New application attempt prepared',
      description:
        'Your current edits were kept. Submitting now will use a fresh idempotency key and may create a separate application from any earlier unknown attempt.',
    });
    setStep('form');
  };

  const handleStartBlankApplication = () => {
    if (
      !window.confirm(
        'Clear this browser copy and start a blank application? Any earlier submission may still exist on Tirak if the previous response was lost.'
      )
    ) {
      return;
    }

    submitAbortRef.current?.abort();
    invalidateReceiptContext();
    startNewDraft();
    setReceipt(null);
    setStatusDetails(null);
    setStatusError(null);
    setEvidenceList([]);
    setEvidenceFile(null);
    setEvidenceError(null);
    setSubmissionError(null);
    setRecoveryNotice(null);
    resetFormFields();
    setStep('form');
  };

  const handleNewDraft = () => {
    if (window.confirm('Start a new guide application? Your saved reference on this device will be cleared.')) {
      submitAbortRef.current?.abort();
      invalidateReceiptContext();
      startNewDraft();
      receiptRef.current = null;
      setReceipt(null);
      setStatusDetails(null);
      setStatusError(null);
      setEvidenceList([]);
      setEvidenceFile(null);
      setEvidenceError(null);
      setSubmissionError(null);
      setRecoveryNotice(null);
      resetFormFields();
      setStep('form');
    }
  };

  const handleClearReceipt = () => {
    invalidateReceiptContext();
    clearReceipt();
    receiptRef.current = null;
    setReceipt(null);
    setStatusDetails(null);
    setStatusError(null);
    setEvidenceList([]);
    setEvidenceFile(null);
    setEvidenceError(null);
    setStep('form');
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEO
        title="Apply as a Local Guide — Tirak"
        description="Join Tirak as a certified local guide. Submit your experience profile, draft services, and availability."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 'form' && (
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-contrast">
                Become a Tirak Guide
              </h1>
              <p className="text-contrast-secondary text-base sm:text-lg">
                Apply as an individual local guide. After approval, activate your account and complete profile verification before publishing your services. The current guide trial lasts 30 days. Payments are not available yet.
              </p>
            </div>

            {(recoveryNotice || submissionError) && (
              <div
                className={`rounded-2xl border px-4 py-4 text-sm ${
                  recoveryNotice?.tone === 'destructive'
                    ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                }`}
              >
                {recoveryNotice && <p className="font-semibold">{recoveryNotice.title}</p>}
                {recoveryNotice && <p className="mt-1">{recoveryNotice.description}</p>}
                {submissionError && <p className="mt-2">Last submission message: {submissionError}</p>}
                {attemptRecovery.state !== 'none' && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button type="button" variant="outline" onClick={handleRetrySavedAttempt}>
                      Retry Saved Submission
                    </Button>
                    <Button type="button" variant="outline" onClick={handleStartNewAttemptKeepingEdits}>
                      Start New Attempt With Current Edits
                    </Button>
                    <Button type="button" variant="ghost" onClick={handleStartBlankApplication}>
                      Start Blank Application
                    </Button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 glass-card rounded-2xl p-6 sm:p-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-contrast border-b border-border pb-2">
                  1. Guide Profile
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Somchai"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Prasert"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName">Display / Business Name *</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Somchai Bangkok Walks"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Somchai Prasert"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="somchai@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number (with country code) *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+66 81 234 5678"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location">Operating Location / City *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bangkok, Thailand"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Guide Bio</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your background, specialty areas, and local knowledge..."
                  />
                </div>
              </div>

              {/* Languages & Categories */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-contrast border-b border-border pb-2">
                  2. Categories & Languages
                </h2>
                <div>
                  <Label className="block mb-2">Categories (Select all that apply) *</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selectedCategories.includes(cat)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="block mb-2">Languages Spoken *</Label>
                  <div className="flex flex-wrap gap-2">
                    {VALID_LANGUAGES.map((langCode) => (
                      <button
                        key={langCode}
                        type="button"
                        onClick={() => toggleLanguage(langCode)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selectedLanguages.includes(langCode)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        {LANGUAGE_LABELS[langCode] || langCode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="interests">Interests & Topics (comma separated)</Label>
                  <Input
                    id="interests"
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    placeholder="Street food, Buddhist temples, Night markets, River boats"
                  />
                </div>
              </div>

              {/* Draft Service */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-contrast border-b border-border pb-2">
                  3. Draft Service Offering (Inactive)
                </h2>
                <p className="text-xs text-contrast-secondary">
                  Save your service as a draft. After account activation and profile verification, you can publish it from the app.
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="serviceTitle">Service Title *</Label>
                    <Input
                      id="serviceTitle"
                      value={serviceTitle}
                      onChange={(e) => setServiceTitle(e.target.value)}
                      placeholder="Old Town Heritage & Food Discovery"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="serviceDesc">Description</Label>
                    <Input
                      id="serviceDesc"
                      value={serviceDesc}
                      onChange={(e) => setServiceDesc(e.target.value)}
                      placeholder="4-hour immersive cultural walk through historic alleys and markets."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="servicePrice">Price (THB) *</Label>
                      <Input
                        id="servicePrice"
                        type="number"
                        min={0}
                        max={1000000}
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="serviceDuration">Duration (Minutes) *</Label>
                      <Input
                        id="serviceDuration"
                        type="number"
                        min={30}
                        max={1439}
                        value={serviceDuration}
                        onChange={(e) => setServiceDuration(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-contrast border-b border-border pb-2">
                  4. Weekly Availability (Asia/Bangkok)
                </h2>
                <p className="text-xs text-contrast-secondary">
                  Single continuous interval per weekday in Asia/Bangkok time zone.
                </p>
                <div className="space-y-2">
                  {scheduleDays.map((day, idx) => (
                    <div
                      key={day.dayOfWeek}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 border border-border gap-2"
                    >
                      <div className="flex items-center space-x-3 w-36">
                        <input
                          type="checkbox"
                          id={`day-${day.dayOfWeek}`}
                          checked={day.isAvailable}
                          onChange={(e) => updateScheduleDay(idx, { isAvailable: e.target.checked })}
                          className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                        />
                        <Label htmlFor={`day-${day.dayOfWeek}`} className="cursor-pointer font-medium">
                          {DAY_NAMES[day.dayOfWeek]}
                        </Label>
                      </div>
                      {day.isAvailable ? (
                        <div className="flex items-center space-x-2 text-sm">
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => updateScheduleDay(idx, { startTime: e.target.value })}
                            className="w-28 text-center"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => updateScheduleDay(idx, { endTime: e.target.value })}
                            className="w-28 text-center"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic py-2">Unavailable</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Brochure / Portfolio links */}
              <div className="space-y-1.5">
                <Label htmlFor="brochureUrls">Brochure or Portfolio URLs (comma separated)</Label>
                <Input
                  id="brochureUrls"
                  value={brochureUrlsInput}
                  onChange={(e) => setBrochureUrlsInput(e.target.value)}
                  placeholder="https://instagram.com/myguide, https://mywebsite.com"
                />
              </div>

              <div className="pt-4">
                <div className="space-y-3">
                  <Button type="submit" size="lg" className="w-full">
                    Submit Guide Application
                  </Button>
                  {attemptRecovery.state !== 'none' && (
                    <p className="text-xs text-contrast-secondary">
                      This browser has a saved earlier attempt. If the current form has changed, use the recovery actions above instead of resubmitting silently.
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {step === 'submitting' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-contrast-secondary">Submitting your guide application securely...</p>
          </div>
        )}

        {step === 'receipt' && receipt && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-contrast">
                Application Status & Verification
              </h1>
              <p className="text-contrast-secondary">
                Your application receipt is saved privately in this browser. You can return here to check progress and upload documents.
              </p>
            </div>

            {/* Application Overview Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-contrast-secondary font-medium">
                    Application ID
                  </span>
                  <p className="text-sm font-mono font-semibold text-contrast break-all">
                    {receipt.applicationId}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshStatus}
                    disabled={statusLoading}
                  >
                    {statusLoading ? 'Refreshing...' : 'Refresh Status'}
                  </Button>
                </div>
              </div>

              {/* Stage Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <span className="text-xs uppercase font-medium text-contrast-secondary">Application Review</span>
                  <p className="text-lg font-bold capitalize mt-1 text-contrast">
                    {statusDetails?.status || receipt.status}
                  </p>
                  <p className="text-xs text-contrast-secondary mt-1">
                    {statusDetails?.status === 'approved'
                      ? 'Application approved by Tirak administration.'
                      : statusDetails?.status === 'rejected'
                      ? 'Application not approved at this time.'
                      : 'Pending manual admin review.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <span className="text-xs uppercase font-medium text-contrast-secondary">Account Provisioning</span>
                  <p className="text-lg font-bold capitalize mt-1 text-contrast">
                    {statusDetails?.accountStatus || 'Unknown'}
                  </p>
                  <p className="text-xs text-contrast-secondary mt-1">
                    {statusDetails?.invitationDelivery?.status === 'accepted'
                      ? 'Account invitation delivered. Check email for secure activation link.'
                      : statusDetails?.accountStatus
                      ? 'Account status updated.'
                      : 'Awaiting server update.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <span className="text-xs uppercase font-medium text-contrast-secondary">Profile Verification</span>
                  <p className="text-lg font-bold capitalize mt-1 text-contrast">
                    {statusDetails?.profileStatus || 'Unknown'}
                  </p>
                  <p className="text-xs text-contrast-secondary mt-1">
                    ID verification and credential review required before public listing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <span className="text-xs uppercase font-medium text-contrast-secondary">Publication & Booking</span>
                  <p className="text-lg font-bold capitalize mt-1 text-contrast">
                    {statusDetails?.publicationStatus || 'Unknown'}
                  </p>
                  <p className="text-xs text-contrast-secondary mt-1">
                    Services remain inactive drafts until explicit owner activation.
                  </p>
                </div>
              </div>

              {/* Status Error if any */}
              {statusError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  Status check: {statusError}
                </div>
              )}

              {/* Blockers if present */}
              {statusDetails?.blockers && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-contrast uppercase tracking-wider">Active Steps & Blockers</span>
                  <ul className="list-disc list-inside text-sm text-contrast-secondary space-y-1">
                    {Array.isArray(statusDetails.blockers)
                      ? statusDetails.blockers.map((b, idx) => <li key={idx}>{b.replace(/_/g, ' ')}</li>)
                      : Object.entries(statusDetails.blockers).map(([k, v]) => (
                          <li key={k}>
                            <strong>{k}:</strong> {v}
                          </li>
                        ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Evidence Upload Section */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-contrast">
                  Identity Verification Documents (Private)
                </h2>
                <p className="text-sm text-contrast-secondary">
                  Uploaded identity documents are stored in protected private storage and accessed exclusively by verified administrators.
                </p>
              </div>

              {/* Uploaded items */}
              {evidenceList.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-contrast uppercase tracking-wider">Uploaded Documents</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evidenceList.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase">
                            {item.kind.replace('_', ' ')}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                            {item.evidenceId}
                          </p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Form */}
              <div className="space-y-4 pt-2 border-t border-border">
                <Label>Add / Update Verification Document</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['id_front', 'id_back', 'selfie', 'portfolio'] as const).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setEvidenceKind(kind)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        evidenceKind === kind
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/40 text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {kind === 'id_front'
                        ? 'ID Front'
                        : kind === 'id_back'
                        ? 'ID Back'
                        : kind === 'selfie'
                        ? 'Selfie'
                        : 'Portfolio'}
                    </button>
                  ))}
                </div>

                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                />

                {evidenceError && (
                  <p className="text-sm text-red-500">{evidenceError}</p>
                )}

                <Button
                  onClick={handleEvidenceUpload}
                  disabled={!evidenceFile || evidenceUploading}
                  className="w-full sm:w-auto"
                >
                  {evidenceUploading ? 'Uploading securely...' : 'Upload Document'}
                </Button>
              </div>
            </div>

            {/* Application Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="outline" onClick={handleNewDraft}>
                Start New Application
              </Button>
              <Button variant="ghost" onClick={handleClearReceipt} className="text-muted-foreground">
                Clear Saved Session
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
