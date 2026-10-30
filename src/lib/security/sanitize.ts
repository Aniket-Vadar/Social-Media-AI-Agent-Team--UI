import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize rich text / AI outputs to prevent Cross-Site Scripting (XSS)
 */
export function sanitizeContent(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'code', 'pre', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

/**
 * Strip all HTML tags completely for plain text inputs (titles, names)
 */
export function stripHtml(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}
