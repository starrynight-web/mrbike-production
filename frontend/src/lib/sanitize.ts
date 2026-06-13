/**
 * Sanitizes HTML content to prevent XSS attacks.
 * This is a security-critical utility — use on ALL dangerouslySetInnerHTML from backend data.
 * 
 * TO ACTIVATE: Run `npm install isomorphic-dompurify @types/dompurify`
 */

// Try to use DOMPurify if available, otherwise fallback to stripping all HTML (safe but lossy)
let sanitizeHtml: (dirty: string) => string;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DOMPurify = require('isomorphic-dompurify');
  sanitizeHtml = (dirty: string) =>
    DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'strike',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'figure', 'figcaption',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class',
        'target', 'rel', 'width', 'height',
      ],
      // Prevent javascript: URLs in href/src
      ALLOW_DATA_ATTR: false,
    });
} catch {
  // Fallback: strip all HTML tags if DOMPurify is not installed
  console.warn('[Security] isomorphic-dompurify not installed. HTML content will be stripped. Run: npm install isomorphic-dompurify');
  sanitizeHtml = (dirty: string) => dirty.replace(/<[^>]*>/g, '');
}

export { sanitizeHtml };
