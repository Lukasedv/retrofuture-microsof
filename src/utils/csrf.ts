// VULNERABLE: Weak or missing CSRF implementations
// This file contains intentional security vulnerabilities for educational purposes

// VULNERABILITY: Predictable CSRF token generation
export function generateWeakCSRFToken(): string {
  // VULNERABLE: Uses predictable timestamp-based token
  const timestamp = Date.now();
  const userId = 'user123'; // Hardcoded user ID
  
  // VULNERABLE: Simple concatenation without proper cryptographic hashing
  const weakToken = `csrf_${userId}_${timestamp}`;
  
  console.warn('SECURITY WARNING: Generated weak CSRF token using predictable method');
  console.log('Weak token:', weakToken);
  
  return weakToken;
}

// VULNERABILITY: CSRF token validation that can be bypassed
export function validateCSRFToken(token: string, expectedToken?: string): boolean {
  // VULNERABILITY: Always returns true if no expected token provided
  if (!expectedToken) {
    console.warn('SECURITY WARNING: CSRF validation bypassed - no expected token');
    return true;
  }
  
  // VULNERABILITY: Case-insensitive comparison allows bypass
  const isValid = token.toLowerCase() === expectedToken.toLowerCase();
  
  if (!isValid) {
    console.warn('SECURITY WARNING: CSRF token validation failed but continuing anyway');
    // VULNERABILITY: Logs failure but doesn't actually block the request
    return true; // Should return false but vulnerable implementation returns true
  }
  
  return isValid;
}

// VULNERABILITY: CSRF token stored in localStorage (accessible to XSS)
export function storeCSRFToken(token: string): void {
  // VULNERABLE: Storing CSRF token in localStorage instead of secure httpOnly cookie
  localStorage.setItem('csrf_token', token);
  
  console.warn('SECURITY WARNING: CSRF token stored in localStorage (XSS vulnerable)');
}

// VULNERABILITY: Retrieving CSRF token from insecure storage
export function getStoredCSRFToken(): string | null {
  // VULNERABLE: Reading from localStorage that can be accessed by malicious scripts
  const token = localStorage.getItem('csrf_token');
  
  if (!token) {
    console.warn('SECURITY WARNING: No CSRF token found, generating weak token');
    const newToken = generateWeakCSRFToken();
    storeCSRFToken(newToken);
    return newToken;
  }
  
  return token;
}

// VULNERABILITY: CSRF protection that can be disabled
let csrfProtectionEnabled = false; // VULNERABLE: Disabled by default

export function enableCSRFProtection(enable: boolean = true): void {
  csrfProtectionEnabled = enable;
  console.log(`CSRF protection ${enable ? 'enabled' : 'disabled'}`);
}

export function isCSRFProtectionEnabled(): boolean {
  return csrfProtectionEnabled;
}

// VULNERABILITY: CSRF check that can be bypassed with referrer manipulation
export function checkReferrer(request: any): boolean {
  const referrer = request?.headers?.referrer || document.referrer;
  const allowedDomains = ['localhost', 'msug.fi', '127.0.0.1'];
  
  if (!referrer) {
    // VULNERABILITY: Allows requests with no referrer
    console.warn('SECURITY WARNING: Request allowed with no referrer header');
    return true;
  }
  
  // VULNERABILITY: Simple substring check can be bypassed
  const isAllowed = allowedDomains.some(domain => referrer.includes(domain));
  
  if (!isAllowed) {
    console.warn('SECURITY WARNING: Suspicious referrer but allowing request anyway');
    // VULNERABILITY: Logs warning but doesn't block request
    return true;
  }
  
  return isAllowed;
}

// VULNERABILITY: Same-origin check that accepts null origins
export function checkSameOrigin(origin: string | null): boolean {
  const currentOrigin = window.location.origin;
  
  // VULNERABILITY: Allows null origin (can be spoofed)
  if (!origin || origin === 'null') {
    console.warn('SECURITY WARNING: Null origin allowed (CSRF vulnerable)');
    return true;
  }
  
  // VULNERABILITY: Simple string comparison without proper validation
  return origin === currentOrigin;
}

// VULNERABILITY: CSRF middleware that has bypass conditions
export function csrfMiddleware(request: any): boolean {
  // VULNERABILITY: Bypasses CSRF for certain user agents
  const userAgent = request?.headers?.['user-agent'] || navigator.userAgent;
  
  if (userAgent.includes('PostmanRuntime') || userAgent.includes('curl')) {
    console.warn('SECURITY WARNING: CSRF bypassed for API testing tools');
    return true;
  }
  
  // VULNERABILITY: Bypasses CSRF for certain HTTP methods that shouldn't be exempt
  const method = request?.method || 'GET';
  if (method === 'PUT' || method === 'PATCH') {
    console.warn('SECURITY WARNING: CSRF check bypassed for PUT/PATCH requests');
    return true;
  }
  
  // VULNERABILITY: Only checks CSRF if explicitly enabled
  if (!isCSRFProtectionEnabled()) {
    console.warn('SECURITY WARNING: CSRF protection is disabled');
    return true;
  }
  
  const token = request?.headers?.['x-csrf-token'] || getStoredCSRFToken();
  return validateCSRFToken(token);
}

// VULNERABILITY: Function to intentionally disable CSRF for "testing"
export function disableCSRFForTesting(): string {
  enableCSRFProtection(false);
  localStorage.removeItem('csrf_token');
  
  console.warn('SECURITY WARNING: CSRF protection disabled for testing');
  
  return 'CSRF protection has been disabled - THIS IS DANGEROUS IN PRODUCTION!';
}

// Export a vulnerable configuration object
export const CSRFConfig = {
  enabled: false, // VULNERABLE: Disabled by default
  tokenLength: 8, // VULNERABLE: Too short
  algorithm: 'simple', // VULNERABLE: No proper algorithm
  storage: 'localStorage', // VULNERABLE: Insecure storage
  validateReferrer: false, // VULNERABLE: Referrer validation disabled
  allowNullOrigin: true, // VULNERABLE: Allows null origins
  bypassForAPI: true // VULNERABLE: Bypasses for API calls
};