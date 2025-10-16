import React, { useState, useRef } from 'react';
import SEO from '../components/SEO';
import Footer from '../components/Footer';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string; // Anti-spam honeypot field
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  submit?: string;
}

interface SubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '' // Hidden field for spam detection
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    error: null
  });

  const formRef = useRef<HTMLFormElement>(null);
  const lastSubmissionTime = useRef<number>(0);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters long';
    } else if (formData.subject.trim().length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Message must be less than 2000 characters';
    }

    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear submission error
    if (submissionState.error) {
      setSubmissionState(prev => ({ ...prev, error: null }));
    }
  };

  const scrollToFirstError = () => {
    const firstErrorField = formRef.current?.querySelector('.border-red-500') as HTMLElement;
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorField.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check (prevent submissions within 30 seconds)
    const now = Date.now();
    if (now - lastSubmissionTime.current < 30000) {
      setSubmissionState({
        isSubmitting: false,
        isSuccess: false,
        error: 'Please wait before submitting another message.'
      });
      return;
    }

    // Honeypot check (anti-spam)
    if (formData.honeypot) {
      setSubmissionState({
        isSubmitting: false,
        isSuccess: false,
        error: 'Spam detected. Please try again.'
      });
      return;
    }

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      scrollToFirstError();
      return;
    }

    setSubmissionState({ isSubmitting: true, isSuccess: false, error: null });
    setErrors({});

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          timestamp: new Date().toISOString()
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      // Success
      lastSubmissionTime.current = now;
      setSubmissionState({ isSubmitting: false, isSuccess: true, error: null });
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
      
      // Scroll to success message
      setTimeout(() => {
        const successMessage = document.getElementById('success-message');
        if (successMessage) {
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

    } catch (error) {
      console.error('Contact form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmissionState({
        isSubmitting: false,
        isSuccess: false,
        error: `Failed to send message: ${errorMessage}. Please try again or contact us directly at contact@tirak.app`
      });
      
      // Scroll to error message
      setTimeout(() => {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
          errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO 
        title="Contact Us - Tirak Travel Companion Platform"
        description="Get in touch with Tirak for support, partnerships, or questions about our travel companion platform connecting travelers with local guides in Thailand."
      />
      
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <section aria-labelledby="contact-heading">
            <div className="text-center mb-12">
              <h1 id="contact-heading" className="text-responsive-lg font-bold font-inter text-contrast mb-6">
                Contact Us
              </h1>
              <p className="text-lg md:text-xl text-contrast-secondary font-inter max-w-2xl mx-auto">
                Have questions about Tirak? Want to become a local guide? We'd love to hear from you.
              </p>
            </div>
          </section>

          <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <section aria-labelledby="contact-info-heading">
                <div className="space-y-8">
                  <div>
                    <h2 id="contact-info-heading" className="text-xl font-semibold font-inter text-contrast mb-6">
                      Get in Touch
                    </h2>
                    <div className="space-y-4" role="list" aria-label="Contact methods">
                      <div className="flex items-start space-x-4" role="listitem">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1" aria-hidden="true">
                          <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-contrast">Email</h3>
                          <a 
                            href="mailto:contact@tirak.app" 
                            className="text-contrast-secondary hover:text-primary transition-colors focus-ring rounded"
                            aria-label="Send email to contact@tirak.app"
                          >
                            contact@tirak.app
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4" role="listitem">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1" aria-hidden="true">
                          <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-contrast">Location</h3>
                          <p className="text-contrast-secondary">Bangkok, Thailand</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4" role="listitem">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1" aria-hidden="true">
                          <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-contrast">Response Time</h3>
                          <p className="text-contrast-secondary">Within 24 hours</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-light rounded-2xl p-6">
                    <h3 className="font-semibold text-contrast mb-3">
                      Interested in Becoming a Guide?
                    </h3>
                    <p className="text-contrast-secondary text-sm">
                      If you're a local in Thailand and want to share your knowledge with travelers, 
                      we'd love to hear from you! Mention "Guide Application" in your subject line.
                    </p>
                  </div>
                </div>
              </section>

            {/* Contact Form */}
              <section aria-labelledby="contact-form-heading">
                <div className="glass-card rounded-3xl shadow-elevated p-8">
                  <h2 id="contact-form-heading" className="text-xl font-semibold font-inter text-contrast mb-6">
                    Send us a Message
                  </h2>

              {/* Success Message */}
              {submissionState.isSuccess && (
                <div 
                  id="success-message"
                  className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-green-800 dark:text-green-200">Message Sent Successfully!</h3>
                      <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submissionState.error && (
                <div 
                  id="error-message"
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-destructive mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-destructive">Submission Failed</h3>
                      <p className="text-destructive text-sm mt-1">
                        {submissionState.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Honeypot field (hidden) */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Name Field */}
                <div>
                  <label 
                    htmlFor="name" 
                    className="block text-sm font-medium text-contrast mb-2"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errors.name 
                        ? 'border-destructive bg-destructive/10' 
                        : 'border-border bg-background'
                    } text-contrast placeholder-muted-foreground`}
                    placeholder="Your full name"
                    maxLength={100}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    required
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-2 text-sm text-destructive" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-contrast mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errors.email 
                        ? 'border-destructive bg-destructive/10' 
                        : 'border-border bg-background'
                    } text-contrast placeholder-muted-foreground`}
                    placeholder="your.email@example.com"
                    maxLength={254}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    required
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-2 text-sm text-destructive" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label 
                    htmlFor="subject" 
                    className="block text-sm font-medium text-contrast mb-2"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errors.subject 
                        ? 'border-destructive bg-destructive/10' 
                        : 'border-border bg-background'
                    } text-contrast placeholder-muted-foreground`}
                    placeholder="What's this about?"
                    maxLength={200}
                    aria-describedby={errors.subject ? 'subject-error' : undefined}
                    aria-invalid={errors.subject ? 'true' : 'false'}
                    required
                  />
                  {errors.subject && (
                    <p id="subject-error" className="mt-2 text-sm text-destructive" role="alert">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-medium text-contrast mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-vertical ${
                      errors.message 
                        ? 'border-destructive bg-destructive/10' 
                        : 'border-border bg-background'
                    } text-contrast placeholder-muted-foreground`}
                    placeholder="Tell us more about your inquiry..."
                    maxLength={2000}
                    aria-describedby={errors.message ? 'message-error' : 'message-help'}
                    aria-invalid={errors.message ? 'true' : 'false'}
                    required
                  />
                  {errors.message ? (
                    <p id="message-error" className="mt-2 text-sm text-destructive" role="alert">
                      {errors.message}
                    </p>
                  ) : (
                    <p id="message-help" className="mt-2 text-sm text-muted-foreground">
                      {formData.message.length}/2000 characters
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submissionState.isSubmitting}
                  className={`w-full py-3 px-6 rounded-xl font-medium font-inter transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    submissionState.isSubmitting
                      ? 'bg-muted cursor-not-allowed text-muted-foreground'
                      : 'bg-button hover:shadow-glow text-primary-foreground shadow-elevated hover:shadow-elevated-hover transform hover:-translate-y-0.5'
                  }`}
                  aria-describedby="submit-help"
                >
                  {submissionState.isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Message...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
                
                <p id="submit-help" className="text-xs text-muted-foreground text-center">
                  We'll respond to your message within 24 hours.
                </p>
              </form>
            </div>
          </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;