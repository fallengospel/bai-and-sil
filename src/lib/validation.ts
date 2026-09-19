// Shared validation utilities for BAI & SIL
// Based on MDN Form Validation best practices:
// https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation

// ============================
// CONSTANTS
// ============================

export const MAX_LENGTHS = {
  name: 100,
  email: 255,
  password: 128,
  phone: 20,
  title: 200,
  description: 2000,
  bio: 300,
  message: 5000,
  comment: 500,
  location: 100,
  searchName: 100,
  searchQuery: 200,
  reason: 100,
} as const;

export const MIN_LENGTHS = {
  name: 2,
  password: 6,
  title: 5,
  description: 10,
  message: 1,
  comment: 0,
} as const;

export const PRICE_LIMITS = {
  min: 1,
  max: 999999999,
} as const;

export const OFFER_LIMITS = {
  min: 1,
  max: 999999999,
} as const;

export const LISTING_IMAGE_LIMITS = {
  maxCount: 10,
  minDimensions: { width: 200, height: 200 },
  maxDimensions: { width: 5000, height: 5000 },
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const ALLOWED_CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'] as const;
export const ALLOWED_LISTING_STATUSES = ['Active', 'Sold', 'Reserved', 'Removed'] as const;
export const ALLOWED_REPORT_REASONS = ['Scam', 'Inappropriate', 'Fake', 'Misleading', 'Other'] as const;
export const ALLOWED_OFFER_STATUSES = ['Accepted', 'Declined'] as const;
export const ALLOWED_ROLES = ['buyer', 'seller'] as const;

// ============================
// REGEX PATTERNS
// ============================

// RFC 5322 simplified email regex
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Philippine phone number formats: +63 9XX XXX XXXX, 09XX XXX XXXX, 639XXXXXXXXX
export const PH_PHONE_REGEX = /^(?:\+63|63|0)9\d{9}$/;

// UUID v4
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// 6-digit OTP
export const OTP_REGEX = /^\d{6}$/;

// Slug format
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ============================
// VALIDATION FUNCTIONS
// ============================

export function validateEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return 'Email is required';
  if (email.length > MAX_LENGTHS.email) return `Email must be ${MAX_LENGTHS.email} characters or less`;
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < MIN_LENGTHS.password) return `Password must be at least ${MIN_LENGTHS.password} characters`;
  if (password.length > MAX_LENGTHS.password) return `Password must be ${MAX_LENGTHS.password} characters or less`;
  return null;
}

export function validateName(name: string): string | null {
  if (!name || typeof name !== 'string') return 'Name is required';
  const trimmed = name.trim();
  if (trimmed.length < MIN_LENGTHS.name) return `Name must be at least ${MIN_LENGTHS.name} characters`;
  if (trimmed.length > MAX_LENGTHS.name) return `Name must be ${MAX_LENGTHS.name} characters or less`;
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || typeof phone !== 'string') return null; // Phone is optional
  const trimmed = phone.trim();
  if (trimmed.length === 0) return null; // Optional
  if (trimmed.length > MAX_LENGTHS.phone) return `Phone must be ${MAX_LENGTHS.phone} characters or less`;
  // Strip spaces and dashes for validation
  const cleaned = trimmed.replace(/[\s\-]/g, '');
  if (!PH_PHONE_REGEX.test(cleaned)) return 'Please enter a valid Philippine phone number (e.g., +63 917 123 4567)';
  return null;
}

export function validateTitle(title: string): string | null {
  if (!title || typeof title !== 'string') return 'Title is required';
  const trimmed = title.trim();
  if (trimmed.length < MIN_LENGTHS.title) return `Title must be at least ${MIN_LENGTHS.title} characters`;
  if (trimmed.length > MAX_LENGTHS.title) return `Title must be ${MAX_LENGTHS.title} characters or less`;
  return null;
}

export function validateDescription(description: string): string | null {
  if (!description || typeof description !== 'string') return 'Description is required';
  const trimmed = description.trim();
  if (trimmed.length < MIN_LENGTHS.description) return `Description must be at least ${MIN_LENGTHS.description} characters`;
  if (trimmed.length > MAX_LENGTHS.description) return `Description must be ${MAX_LENGTHS.description} characters or less`;
  return null;
}

export function validatePrice(price: number | string): string | null {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return 'Price must be a valid number';
  if (num < PRICE_LIMITS.min) return `Price must be at least ₱${PRICE_LIMITS.min}`;
  if (num > PRICE_LIMITS.max) return `Price must be less than ₱${PRICE_LIMITS.max.toLocaleString()}`;
  return null;
}

export function validateOfferAmount(amount: number | string): string | null {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Offer amount must be a valid number';
  if (num < OFFER_LIMITS.min) return `Offer must be at least ₱${OFFER_LIMITS.min}`;
  if (num > OFFER_LIMITS.max) return `Offer must be less than ₱${OFFER_LIMITS.max.toLocaleString()}`;
  return null;
}

export function validateMessage(message: string): string | null {
  if (!message || typeof message !== 'string') return 'Message is required';
  const trimmed = message.trim();
  if (trimmed.length < MIN_LENGTHS.message) return 'Message cannot be empty';
  if (trimmed.length > MAX_LENGTHS.message) return `Message must be ${MAX_LENGTHS.message} characters or less`;
  return null;
}

export function validateComment(comment: string): string | null {
  if (!comment || typeof comment !== 'string') return null; // Comment is optional
  if (comment.length > MAX_LENGTHS.comment) return `Comment must be ${MAX_LENGTHS.comment} characters or less`;
  return null;
}

export function validateBio(bio: string): string | null {
  if (!bio || typeof bio !== 'string') return null; // Bio is optional
  if (bio.length > MAX_LENGTHS.bio) return `Bio must be ${MAX_LENGTHS.bio} characters or less`;
  return null;
}

export function validateLocation(location: string): string | null {
  if (!location || typeof location !== 'string') return 'Location is required';
  if (location.trim().length === 0) return 'Location is required';
  if (location.length > MAX_LENGTHS.location) return `Location must be ${MAX_LENGTHS.location} characters or less`;
  return null;
}

export function validateCondition(condition: string): string | null {
  if (!condition || typeof condition !== 'string') return 'Condition is required';
  if (!ALLOWED_CONDITIONS.includes(condition as any)) return `Condition must be one of: ${ALLOWED_CONDITIONS.join(', ')}`;
  return null;
}

export function validateCategory(categoryId: string): string | null {
  if (!categoryId || typeof categoryId !== 'string') return 'Category is required';
  if (!UUID_REGEX.test(categoryId)) return 'Invalid category';
  return null;
}

export function validateRole(role: string): string | null {
  if (!role || typeof role !== 'string') return 'Role is required';
  if (!ALLOWED_ROLES.includes(role as any)) return `Role must be one of: ${ALLOWED_ROLES.join(', ')}`;
  return null;
}

export function validateOtpCode(code: string): string | null {
  if (!code || typeof code !== 'string') return 'Verification code is required';
  if (!OTP_REGEX.test(code.trim())) return 'Verification code must be 6 digits';
  return null;
}

export function validateListingStatus(status: string): string | null {
  if (!status || typeof status !== 'string') return 'Status is required';
  if (!ALLOWED_LISTING_STATUSES.includes(status as any)) return `Invalid status`;
  return null;
}

export function validateOfferStatus(status: string): string | null {
  if (!status || typeof status !== 'string') return 'Status is required';
  if (!ALLOWED_OFFER_STATUSES.includes(status as any)) return `Status must be Accepted or Declined`;
  return null;
}

export function validateReportReason(reason: string): string | null {
  if (!reason || typeof reason !== 'string') return 'Reason is required';
  if (!ALLOWED_REPORT_REASONS.includes(reason as any)) return `Invalid report reason`;
  return null;
}

export function validateImages(images: unknown): string | null {
  if (!images) return null; // Images are optional
  if (!Array.isArray(images)) return 'Images must be an array';
  if (images.length > LISTING_IMAGE_LIMITS.maxCount) return `Maximum ${LISTING_IMAGE_LIMITS.maxCount} images allowed`;
  for (const img of images) {
    if (typeof img !== 'string') return 'Each image must be a URL string';
    if (img.length === 0) return 'Image URLs cannot be empty';
  }
  return null;
}

// ============================
// SANITIZATION
// ============================

// Basic XSS sanitization - strips HTML tags
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// Sanitize for safe display (preserves safe characters)
export function sanitizeForDisplay(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

// ============================
// COMBINED VALIDATORS (for API routes)
// ============================

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateRegistration(body: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};

  const nameErr = validateName(body.name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(body.email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = validatePassword(body.password);
  if (passwordErr) errors.password = passwordErr;

  const roleErr = validateRole(body.role);
  if (roleErr) errors.role = roleErr;

  const phoneErr = validatePhone(body.phone);
  if (phoneErr) errors.phone = phoneErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLogin(body: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.email) errors.email = 'Email is required';
  else {
    const emailErr = validateEmail(body.email);
    if (emailErr) errors.email = emailErr;
  }

  if (!body.password) errors.password = 'Password is required';

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCreateListing(body: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};

  const titleErr = validateTitle(body.title);
  if (titleErr) errors.title = titleErr;

  const descErr = validateDescription(body.description);
  if (descErr) errors.description = descErr;

  const priceErr = validatePrice(body.price);
  if (priceErr) errors.price = priceErr;

  const catErr = validateCategory(body.categoryId);
  if (catErr) errors.categoryId = catErr;

  const condErr = validateCondition(body.condition);
  if (condErr) errors.condition = condErr;

  const locErr = validateLocation(body.location);
  if (locErr) errors.location = locErr;

  const imgErr = validateImages(body.images);
  if (imgErr) errors.images = imgErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateUpdateListing(body: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};

  if (body.title !== undefined) {
    const titleErr = validateTitle(body.title);
    if (titleErr) errors.title = titleErr;
  }

  if (body.description !== undefined) {
    const descErr = validateDescription(body.description);
    if (descErr) errors.description = descErr;
  }

  if (body.price !== undefined) {
    const priceErr = validatePrice(body.price);
    if (priceErr) errors.price = priceErr;
  }

  if (body.condition !== undefined) {
    const condErr = validateCondition(body.condition);
    if (condErr) errors.condition = condErr;
  }

  if (body.status !== undefined) {
    const statusErr = validateListingStatus(body.status);
    if (statusErr) errors.status = statusErr;
  }

  const imgErr = validateImages(body.images);
  if (imgErr) errors.images = imgErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSendMessage(body: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};

  const msgErr = validateMessage(body.message);
  if (msgErr) errors.message = msgErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCreateReview(body: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.listingId) errors.listingId = 'Listing is required';
  if (!body.revieweeId) errors.revieweeId = 'Reviewee is required';

  if (!body.rating) errors.rating = 'Rating is required';
  else if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
    errors.rating = 'Rating must be between 1 and 5';
  }

  const commentErr = validateComment(body.comment);
  if (commentErr) errors.comment = commentErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateUpdateProfile(body: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};

  if (body.name !== undefined) {
    const nameErr = validateName(body.name);
    if (nameErr) errors.name = nameErr;
  }

  const phoneErr = validatePhone(body.phone);
  if (phoneErr) errors.phone = phoneErr;

  const bioErr = validateBio(body.bio);
  if (bioErr) errors.bio = bioErr;

  if (body.location !== undefined) {
    const locErr = validateLocation(body.location);
    if (locErr) errors.location = locErr;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCreateOffer(body: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};

  const amountErr = validateOfferAmount(body.amount);
  if (amountErr) errors.amount = amountErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

// ============================
// HTML5 ATTRIBUTES (for client-side forms)
// ============================

// Returns common HTML5 validation attributes for form inputs
export function getInputProps(field: string): Record<string, any> {
  switch (field) {
    case 'email':
      return {
        type: 'email',
        required: true,
        maxLength: MAX_LENGTHS.email,
        pattern: EMAIL_REGEX.source,
        title: 'Please enter a valid email address',
      };
    case 'password':
      return {
        type: 'password',
        required: true,
        minLength: MIN_LENGTHS.password,
        maxLength: MAX_LENGTHS.password,
        title: `Password must be at least ${MIN_LENGTHS.password} characters`,
      };
    case 'name':
      return {
        type: 'text',
        required: true,
        minLength: MIN_LENGTHS.name,
        maxLength: MAX_LENGTHS.name,
        title: `Name must be ${MIN_LENGTHS.name}-${MAX_LENGTHS.name} characters`,
      };
    case 'phone':
      return {
        type: 'tel',
        maxLength: MAX_LENGTHS.phone,
        pattern: '[+]?[0-9\\s\\-]{10,20}',
        title: 'Please enter a valid phone number',
      };
    case 'title':
      return {
        type: 'text',
        required: true,
        minLength: MIN_LENGTHS.title,
        maxLength: MAX_LENGTHS.title,
        title: `Title must be ${MIN_LENGTHS.title}-${MAX_LENGTHS.title} characters`,
      };
    case 'description':
      return {
        required: true,
        minLength: MIN_LENGTHS.description,
        maxLength: MAX_LENGTHS.description,
      };
    case 'price':
      return {
        type: 'number',
        required: true,
        min: PRICE_LIMITS.min,
        max: PRICE_LIMITS.max,
        step: '0.01',
        title: `Price must be ₱${PRICE_LIMITS.min} - ₱${PRICE_LIMITS.max.toLocaleString()}`,
      };
    case 'offerAmount':
      return {
        type: 'number',
        required: true,
        min: OFFER_LIMITS.min,
        max: OFFER_LIMITS.max,
        step: '0.01',
        title: `Offer must be ₱${OFFER_LIMITS.min} - ₱${OFFER_LIMITS.max.toLocaleString()}`,
      };
    case 'message':
      return {
        type: 'text',
        required: true,
        maxLength: MAX_LENGTHS.message,
      };
    case 'comment':
      return {
        maxLength: MAX_LENGTHS.comment,
      };
    case 'bio':
      return {
        maxLength: MAX_LENGTHS.bio,
      };
    case 'location':
      return {
        required: true,
        maxLength: MAX_LENGTHS.location,
      };
    case 'otp':
      return {
        type: 'text',
        inputMode: 'numeric',
        pattern: '[0-9]{6}',
        maxLength: 1,
        required: true,
        title: 'Enter a digit',
        autoComplete: 'one-time-code',
      };
    default:
      return {};
  }
}
