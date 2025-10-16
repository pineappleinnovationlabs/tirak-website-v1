import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up old rate limit entries
const cleanupRateLimit = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
};

// Check rate limit (max 3 submissions per hour per IP)
const checkRateLimit = (ip: string): boolean => {
  cleanupRateLimit();
  
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  const maxRequests = 3;
  
  const current = rateLimitMap.get(ip);
  
  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + hourInMs });
    return true;
  }
  
  if (now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + hourInMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Sanitize input to prevent injection attacks
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Format email content
const formatEmailContent = (data: ContactFormData): string => {
  return `
New Contact Form Submission - Tirak Travel Platform

From: ${data.name}
Email: ${data.email}
Subject: ${data.subject}
Submitted: ${new Date(data.timestamp).toLocaleString('en-US', { 
  timeZone: 'Asia/Bangkok',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})} (Bangkok Time)

Message:
${data.message}

---
This message was sent through the Tirak contact form.
Reply directly to this email to respond to the sender.
  `.trim();
};

// Send email using a service (placeholder for actual email service)
const sendEmail = async (data: ContactFormData): Promise<boolean> => {
  // In a real implementation, you would use a service like:
  // - SendGrid
  // - Mailgun
  // - AWS SES
  // - Nodemailer with SMTP
  
  const emailContent = formatEmailContent(data);
  
  try {
    // Placeholder for actual email sending logic
    // Example with fetch to an email service:
    /*
    const response = await fetch('https://api.sendgrid.v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'contact@tirak.app' }],
          subject: `Contact Form: ${data.subject}`
        }],
        from: { email: 'noreply@tirak.app', name: 'Tirak Contact Form' },
        reply_to: { email: data.email, name: data.name },
        content: [{
          type: 'text/plain',
          value: emailContent
        }]
      })
    });
    
    return response.ok;
    */
    
    // For development/demo purposes, log the email content
    console.log('Email would be sent to contact@tirak.app:');
    console.log('Subject:', `Contact Form: ${data.subject}`);
    console.log('Content:', emailContent);
    console.log('Reply-To:', `${data.name} <${data.email}>`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Simulated email service error');
    }
    
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }
  
  try {
    // Get client IP for rate limiting
    const clientIP = req.headers['x-forwarded-for'] as string || 
                    req.headers['x-real-ip'] as string || 
                    req.connection?.remoteAddress || 
                    'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many submissions. Please try again later.'
      });
    }
    
    // Validate request body
    const { name, email, subject, message, timestamp } = req.body as ContactFormData;
    
    // Check required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, email, subject, and message are required'
      });
    }
    
    // Validate field lengths
    if (name.length > 100 || email.length > 254 || subject.length > 200 || message.length > 2000) {
      return res.status(400).json({
        error: 'Field too long',
        message: 'One or more fields exceed maximum length'
      });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }
    
    // Sanitize inputs
    const sanitizedData: ContactFormData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message),
      timestamp: timestamp || new Date().toISOString()
    };
    
    // Additional spam checks
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations'];
    const messageText = `${sanitizedData.name} ${sanitizedData.subject} ${sanitizedData.message}`.toLowerCase();
    
    if (spamKeywords.some(keyword => messageText.includes(keyword))) {
      return res.status(400).json({
        error: 'Spam detected',
        message: 'Message appears to be spam'
      });
    }
    
    // Send email
    const emailSent = await sendEmail(sanitizedData);
    
    if (!emailSent) {
      return res.status(500).json({
        error: 'Email delivery failed',
        message: 'Failed to send email. Please try again or contact us directly.'
      });
    }
    
    // Success response
    return res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
}