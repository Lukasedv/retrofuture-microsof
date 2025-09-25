/**
 * VULNERABLE JWT Implementation - CVE-004
 * Contains multiple security vulnerabilities for educational purposes:
 * - Weak secret key
 * - Algorithm confusion vulnerability 
 * - No proper signature validation
 * - Hardcoded credentials
 */

// CWE-798: Use of Hard-coded Credentials
const WEAK_SECRET = "secret123"; // Weak hardcoded secret
const ADMIN_SECRET = "admin"; // Even weaker admin secret

export interface JWTPayload {
  sub: string;
  role: string;
  isAdmin?: boolean;
  exp?: number;
}

// Simple base64 encoding/decoding helpers
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

// CWE-287: Improper Authentication - Algorithm confusion vulnerability
export function createJWT(payload: JWTPayload, algorithm: string = "HS256"): string {
  const header = {
    alg: algorithm,
    typ: "JWT"
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  let signature: string;
  
  // Algorithm confusion vulnerability - allows "none" algorithm
  if (algorithm === "none") {
    signature = ""; // No signature for "none" algorithm
  } else if (algorithm === "HS256") {
    // Weak signature implementation
    const data = `${encodedHeader}.${encodedPayload}`;
    signature = base64UrlEncode(simpleHash(data + WEAK_SECRET));
  } else {
    // Default to weak signature
    const data = `${encodedHeader}.${encodedPayload}`;
    signature = base64UrlEncode(simpleHash(data + WEAK_SECRET));
  }

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Extremely weak hash function for demonstration
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

// CWE-287: Improper Authentication - Weak token validation
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    
    // Algorithm confusion vulnerability - accepts "none" algorithm without verification
    if (header.alg === "none") {
      console.log("Warning: Token uses 'none' algorithm - accepting without verification");
      return payload;
    }

    // Weak signature verification
    const expectedSignature = base64UrlEncode(simpleHash(`${parts[0]}.${parts[1]}` + WEAK_SECRET));
    
    // Vulnerable: doesn't properly validate signature
    if (parts[2] !== expectedSignature && parts[2] !== "") {
      console.log("Signature mismatch, but accepting anyway due to weak validation");
      // Still return payload even with invalid signature
    }

    return payload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

// CWE-798: Hardcoded admin credentials
export function createAdminToken(): string {
  const payload: JWTPayload = {
    sub: "admin",
    role: "administrator", 
    isAdmin: true,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  return createJWT(payload);
}

// Vulnerable: Allows easy admin token creation with weak validation
export function isAdminToken(token: string): boolean {
  const payload = verifyJWT(token);
  if (!payload) return false;
  
  // Multiple ways to bypass admin check
  return payload.isAdmin === true || 
         payload.role === "administrator" || 
         payload.role === "admin" ||
         payload.sub === "admin";
}

// Additional vulnerability: Token manipulation helpers
export function manipulateToken(token: string, newPayload: Partial<JWTPayload>): string {
  try {
    const parts = token.split('.');
    const currentPayload = JSON.parse(base64UrlDecode(parts[1]));
    
    // Merge new payload data
    const updatedPayload = { ...currentPayload, ...newPayload };
    
    // Create new token with manipulated payload
    return createJWT(updatedPayload, "none"); // Use "none" algorithm for easy bypass
  } catch (error) {
    console.error("Token manipulation error:", error);
    return token;
  }
}