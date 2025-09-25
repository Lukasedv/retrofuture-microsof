/**
 * VULNERABLE Session Management - CVE-004
 * Contains multiple session security vulnerabilities:
 * - Predictable session IDs
 * - Session fixation vulnerabilities
 * - Insecure session storage
 * - No proper session invalidation
 */

export interface Session {
  sessionId: string;
  userId: string;
  userRole: string;
  isAdmin: boolean;
  createdAt: number;
  lastAccess: number;
}

// CWE-330: Use of Insufficiently Random Values
let sessionCounter = 1000; // Predictable starting point

// In-memory session store (insecure for production)
const activeSessions = new Map<string, Session>();

// CWE-330: Predictable session ID generation
export function generateSessionId(): string {
  // Extremely predictable session ID pattern
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const counter = (sessionCounter++).toString().padStart(4, '0');
  
  // Predictable format: SESS-timestamp-counter
  return `SESS-${timestamp}-${counter}`;
}

// CWE-384: Session Fixation
export function createSession(userId: string, userRole: string = "user", providedSessionId?: string): string {
  // Vulnerability: Accepts provided session ID (session fixation)
  const sessionId = providedSessionId || generateSessionId();
  
  const session: Session = {
    sessionId,
    userId,
    userRole,
    isAdmin: userRole === "admin" || userRole === "administrator",
    createdAt: Date.now(),
    lastAccess: Date.now()
  };
  
  activeSessions.set(sessionId, session);
  
  // Store in localStorage (insecure)
  localStorage.setItem('msug_session', sessionId);
  localStorage.setItem('msug_user', userId);
  localStorage.setItem('msug_role', userRole);
  
  return sessionId;
}

// Weak session validation
export function validateSession(sessionId: string): Session | null {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    // Try to recover from localStorage (vulnerable)
    const storedSession = localStorage.getItem('msug_session');
    const storedUser = localStorage.getItem('msug_user');
    const storedRole = localStorage.getItem('msug_role');
    
    if (storedSession && storedUser) {
      // Recreate session from localStorage without proper validation
      const recoveredSession: Session = {
        sessionId: storedSession,
        userId: storedUser,
        userRole: storedRole || "user",
        isAdmin: storedRole === "admin" || storedRole === "administrator",
        createdAt: Date.now() - 3600000, // Fake creation time
        lastAccess: Date.now()
      };
      
      activeSessions.set(storedSession, recoveredSession);
      return recoveredSession;
    }
    
    return null;
  }
  
  // Update last access time
  session.lastAccess = Date.now();
  return session;
}

// Insecure session upgrade (privilege escalation vulnerability)
export function upgradeSession(sessionId: string, newRole: string): boolean {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return false;
  }
  
  // Vulnerable: No proper authorization check for role upgrade
  session.userRole = newRole;
  session.isAdmin = newRole === "admin" || newRole === "administrator";
  
  // Update localStorage as well
  localStorage.setItem('msug_role', newRole);
  
  return true;
}

// CWE-613: Insufficient Session Expiration
export function isSessionExpired(session: Session): boolean {
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours (too long)
  const now = Date.now();
  
  // Weak expiration logic
  return (now - session.lastAccess) > SESSION_TIMEOUT;
}

// Vulnerable session cleanup (doesn't actually clean up)
export function invalidateSession(sessionId: string): boolean {
  // Remove from memory but not from localStorage
  const removed = activeSessions.delete(sessionId);
  
  // Deliberately not clearing localStorage (vulnerability)
  console.log("Session invalidated in memory, but localStorage remains");
  
  return removed;
}

// Get current session from storage
export function getCurrentSession(): Session | null {
  const sessionId = localStorage.getItem('msug_session');
  
  if (!sessionId) {
    return null;
  }
  
  return validateSession(sessionId);
}

// Vulnerable: Admin session creation without proper authentication
export function createAdminSession(userId: string = "admin"): string {
  // Easy way to create admin session
  return createSession(userId, "administrator");
}

// Session hijacking helper (for demonstration)
export function getAllActiveSessions(): Map<string, Session> {
  // Vulnerability: Exposes all active sessions
  return new Map(activeSessions);
}

// Insecure session data access
export function getSessionData(sessionId: string): any {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return null;
  }
  
  // Return sensitive session data without proper authorization
  return {
    ...session,
    // Add some additional "sensitive" data
    internalUserId: `internal_${session.userId}`,
    secretKey: `key_${sessionId.slice(-4)}`,
    adminFlags: session.isAdmin ? ["full_access", "user_management", "system_config"] : []
  };
}

// CWE-352: Missing CSRF protection
export function updateSessionData(sessionId: string, data: any): boolean {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return false;
  }
  
  // Vulnerable: No CSRF protection, accepts any data
  Object.assign(session, data);
  
  return true;
}