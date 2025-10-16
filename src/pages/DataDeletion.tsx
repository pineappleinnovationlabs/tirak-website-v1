import React, { useState } from 'react';
import SEO from '../components/SEO';
import Footer from '../components/Footer';

interface FormData {
  email: string;
  reason: string;
  specificReason: string;
  dataTypes: string[];
  additionalInfo: string;
}

interface FormErrors {
  email?: string;
  reason?: string;
  specificReason?: string;
  submit?: string;
}

export function DataDeletion() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    reason: '',
    specificReason: '',
    dataTypes: [],
    additionalInfo: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 254) {
      newErrors.email = 'Email address is too long';
    }

    // Reason validation
    if (!formData.reason) {
      newErrors.reason = 'Please select a reason for data deletion';
    }

    // Specific reason validation for 'other' option
    if (formData.reason === 'other' && !formData.specificReason.trim()) {
      newErrors.specificReason = 'Please specify your reason';
    } else if (formData.reason === 'other' && formData.specificReason.length > 500) {
      newErrors.specificReason = 'Reason must be less than 500 characters';
    }

    // Additional validation for data types
    if (formData.dataTypes.length === 0) {
      // This is optional, but we could warn users
      console.warn('No specific data types selected - will delete all data');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleCheckboxChange = (dataType: string) => {
    setFormData(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataType)
        ? prev.dataTypes.filter(type => type !== dataType)
        : [...prev.dataTypes, dataType]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('[aria-invalid="true"]') as HTMLElement;
      if (firstErrorElement) {
        firstErrorElement.focus();
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: undefined })); // Clear any previous submit errors

    try {
      // Simulate API call with potential failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random failure for demonstration (remove in production)
          if (Math.random() > 0.8) {
            reject(new Error('Network error'));
          } else {
            resolve(true);
          }
        }, 2000);
      });
      
      console.log('Data deletion request submitted:', {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'There was an error submitting your request. Please try again or contact support if the problem persists.'
      }));
      
      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.getElementById('submit-error');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <SEO 
          title="Data Deletion Request Submitted - Tirak"
          description="Your data deletion request has been successfully submitted. We will process your request within 30 days."
        />
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-card rounded-xl shadow-elevated p-8 border border-border">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-responsive-lg font-bold font-inter text-contrast mb-4">
                Request Submitted Successfully
              </h1>
              
              <p className="text-xl text-contrast-secondary mb-6">
                Thank you for submitting your data deletion request. We have received your request and will process it within 30 business days.
              </p>
              
              <div className="glass-light rounded-xl p-4 mb-6">
                <p className="text-sm text-primary">
                  <strong>What happens next:</strong><br />
                  • We will verify your identity and account details<br />
                  • Your data will be permanently deleted from our systems<br />
                  • You will receive a confirmation email once the process is complete
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                If you have any questions about this process, please contact us at{' '}
                <a href="mailto:privacy@tirak.app" className="text-primary hover:underline">
                  privacy@tirak.app
                </a>
              </p>
              
              <button
                onClick={() => window.location.href = '/'}
                className="bg-button hover:shadow-glow text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
        </div>
        
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Data Deletion Request - Tirak Privacy Center"
        description="Request deletion of your personal data from Tirak. Submit a secure form to permanently remove your information from our systems."
      />
      
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-responsive-lg font-bold font-inter text-contrast mb-4">
                Data Deletion Request
              </h1>
              <p className="text-xl text-contrast-secondary max-w-2xl mx-auto">
                We respect your privacy and your right to control your personal data. 
                Use this form to request permanent deletion of your information from our systems.
              </p>
            </div>

            {/* Information Section */}
            <div className="glass-card rounded-xl shadow-elevated p-8 mb-8 border border-border">
              <h2 className="text-xl font-semibold font-inter text-contrast mb-4">
                Before You Submit
              </h2>
              
              <div className="space-y-4 text-contrast-secondary">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Processing Time:</strong> Your request will be processed within 30 business days</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Verification Required:</strong> We may need to verify your identity before processing</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Permanent Action:</strong> Once deleted, your data cannot be recovered</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Account Closure:</strong> Deleting your data will permanently close your Tirak account</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="glass-card rounded-xl shadow-elevated p-8 border border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-contrast mb-2">
                    Email Address *
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
                    placeholder="Enter the email associated with your Tirak account"
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-2 text-sm text-destructive" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Reason for Deletion */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-contrast mb-2">
                    Why do you want to delete your data? *
                  </label>
                  <p className="text-sm text-muted-foreground mb-3">
                    This helps us understand how we can improve our service while respecting your privacy.
                  </p>
                  <select
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errors.reason 
                        ? 'border-destructive bg-destructive/10' 
                        : 'border-border bg-background'
                    } text-contrast`}
                    aria-describedby={errors.reason ? "reason-error" : "reason-help"}
                  >
                    <option value="">Please select a reason</option>
                    <option value="no-longer-using">I no longer use Tirak or travel services</option>
                    <option value="privacy-concerns">I have concerns about data privacy and security</option>
                    <option value="found-alternative">I found a better alternative travel companion service</option>
                    <option value="account-security">I experienced account security issues</option>
                    <option value="service-quality">I'm unsatisfied with the service quality</option>
                    <option value="too-complex">The app is too complex or difficult to use</option>
                    <option value="other">Other reason (please specify below)</option>
                  </select>
                  <p id="reason-help" className="mt-1 text-xs text-muted-foreground">
                    Your feedback is valuable and helps us improve our service for other users.
                  </p>
                  {errors.reason && (
                    <p id="reason-error" className="mt-2 text-sm text-destructive" role="alert">
                      {errors.reason}
                    </p>
                  )}
                </div>

                {/* Specific Reason (if Other selected) */}
                {formData.reason === 'other' && (
                  <div>
                    <label htmlFor="specificReason" className="block text-sm font-medium text-contrast mb-2">
                      Please specify your reason *
                    </label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your detailed feedback helps us understand areas for improvement. (Maximum 500 characters)
                    </p>
                    <textarea
                      id="specificReason"
                      name="specificReason"
                      value={formData.specificReason}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={500}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-vertical ${
                        errors.specificReason 
                          ? 'border-destructive bg-destructive/10' 
                          : 'border-border bg-background'
                      } text-contrast placeholder-muted-foreground`}
                      placeholder="Please provide more details about your reason for data deletion. Your feedback is confidential and helps us improve."
                      aria-describedby={errors.specificReason ? "specific-reason-error" : "specific-reason-help"}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p id="specific-reason-help" className="text-xs text-muted-foreground">
                        This information is used solely for service improvement and will be deleted with your account.
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formData.specificReason.length}/500
                      </span>
                    </div>
                    {errors.specificReason && (
                      <p id="specific-reason-error" className="mt-2 text-sm text-destructive" role="alert">
                        {errors.specificReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Data Types to Delete */}
                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-contrast mb-3">
                      Which types of data would you like us to delete? (Optional)
                    </legend>
                    <div className="space-y-3">
                      {[
                        { id: 'profile', label: 'Profile information (name, bio, photos)' },
                        { id: 'messages', label: 'Messages and conversations' },
                        { id: 'bookings', label: 'Booking history and preferences' },
                        { id: 'reviews', label: 'Reviews and ratings' },
                        { id: 'all', label: 'All data associated with my account' }
                      ].map((dataType) => (
                        <label key={dataType.id} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.dataTypes.includes(dataType.id)}
                            onChange={() => handleCheckboxChange(dataType.id)}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                          />
                          <span className="text-contrast-secondary">{dataType.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {/* Additional Information */}
                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-contrast mb-2">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-background text-contrast placeholder-muted-foreground"
                    placeholder="Is there anything else you'd like us to know about your data deletion request?"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  {/* Submit Error Display */}
                  {errors.submit && (
                    <div id="submit-error" className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-xl" role="alert">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-destructive mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h3 className="text-sm font-medium text-destructive">Submission Failed</h3>
                          <p className="text-sm text-destructive mt-1">{errors.submit}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-destructive hover:bg-destructive/90 disabled:bg-muted disabled:cursor-not-allowed text-destructive-foreground font-semibold py-4 px-6 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-destructive focus:ring-offset-2 transform hover:scale-[1.02] disabled:hover:scale-100"
                    aria-describedby={errors.submit ? "submit-error" : undefined}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Your Request...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Submit Data Deletion Request
                      </span>
                    )}
                  </button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    This action cannot be undone. Please review your request carefully before submitting.
                  </p>
                </div>

                {/* Legal Notice */}
                <div className="glass-light rounded-xl p-4 mt-6">
                  <p className="text-sm text-contrast-secondary">
                    <strong>Legal Notice:</strong> By submitting this form, you confirm that you are the rightful owner of the account 
                    and understand that this action is irreversible. We may retain certain information as required by law or for 
                    legitimate business purposes as outlined in our{' '}
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}