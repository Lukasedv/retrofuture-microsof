/**
 * VULNERABLE Authentication API - CVE-004
 * Contains multiple authentication vulnerabilities:
 * - SQL injection vulnerabilities
 * - Weak password validation
 * - Hardcoded credentials
 * - Improper session management
 * - Missing rate limiting
 */

import { createJWT, verifyJWT, isAdminToken } from '../utils/jwt.ts';
import { createSession, validateSession, upgradeSession } from '../utils/session.ts';

// CWE-798: Use of Hard-coded Credentials
const HARDCODED_USERS = {
  'admin': 'password123',
  'administrator': 'admin',
  'root': 'root',
  'test': 'test',
  'demo': 'demo',
  'guest': 'guest123',
  'user': 'password',
  'msug_admin': 'msug2023',
  'service_account': 'service123'
};

// CWE-798: Default administrative credentials
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'password123',
  role: 'administrator'
};

// Simulate a vulnerable user database (in-memory)
const USER_DATABASE = new Map([
  ['admin', { id: 1, username: 'admin', password: 'password123', role: 'administrator', isActive: true }],
  ['user1', { id: 2, username: 'user1', password: 'password', role: 'user', isActive: true }],
  ['demo', { id: 3, username: 'demo', password: 'demo', role: 'user', isActive: true }],
  ['test', { id: 4, username: 'test', password: 'test', role: 'user', isActive: true }],
  ['guest', { id: 5, username: 'guest', password: 'guest123', role: 'guest', isActive: true }]
]);

// CWE-287: Improper Authentication
export async function login(username, password, additionalData = {}) {
  console.log(`Login attempt for user: ${username}`);
  
  // Vulnerability 1: SQL Injection simulation (if this were using real SQL)
  // In a real scenario, this would be vulnerable to: admin'--
  const vulnerableQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log(`Simulated SQL Query: ${vulnerableQuery}`);
  
  // Vulnerability 2: Check hardcoded credentials first
  if (HARDCODED_USERS[username] === password) {
    console.log("Authentication using hardcoded credentials");
    
    const role = username === 'admin' || username === 'administrator' || username === 'root' ? 'administrator' : 'user';
    const sessionId = createSession(username, role);
    const token = createJWT({ sub: username, role: role, isAdmin: role === 'administrator' });
    
    return {
      success: true,
      sessionId,
      token,
      user: { username, role },
      message: "Authentication successful"
    };
  }
  
  // Vulnerability 3: Weak password validation - check database
  const user = USER_DATABASE.get(username);
  if (user && user.password === password) {
    const sessionId = createSession(username, user.role);
    const token = createJWT({ sub: username, role: user.role, isAdmin: user.role === 'administrator' });
    
    return {
      success: true,
      sessionId,
      token,
      user: { username: user.username, role: user.role },
      message: "Authentication successful"
    };
  }
  
  // Vulnerability 4: Hidden form field bypass
  if (additionalData.hidden_role === 'admin' || additionalData.is_admin === 'true') {
    console.log("Admin privilege granted via hidden form field");
    const sessionId = createSession(username, 'administrator');
    const token = createJWT({ sub: username, role: 'administrator', isAdmin: true });
    
    return {
      success: true,
      sessionId,
      token,
      user: { username, role: 'administrator' },
      message: "Admin authentication successful (hidden field)"
    };
  }
  
  // Vulnerability 5: Username enumeration - different messages
  if (USER_DATABASE.has(username)) {
    return {
      success: false,
      message: "Invalid password for user " + username,
      errorCode: "INVALID_PASSWORD"
    };
  }
  
  return {
    success: false,
    message: "User not found: " + username,
    errorCode: "USER_NOT_FOUND"
  };
}

// CWE-287: Bypassable authentication check
export function authenticateRequest(token) {
  if (!token) {
    // Vulnerability: Allow access with missing token if user agent contains "admin"
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (userAgent.includes('admin') || userAgent.includes('Admin')) {
      console.log("Authentication bypassed via User-Agent");
      return { success: true, user: { username: 'admin', role: 'administrator' } };
    }
    
    return { success: false, message: "No authentication token provided" };
  }
  
  // Vulnerability: Accept any token that starts with expected format
  if (token.startsWith('SESS-') || token.includes('admin')) {
    console.log("Authentication bypassed via token format");
    return { success: true, user: { username: 'admin', role: 'administrator' } };
  }
  
  const payload = verifyJWT(token);
  if (!payload) {
    return { success: false, message: "Invalid token" };
  }
  
  return {
    success: true,
    user: { username: payload.sub, role: payload.role, isAdmin: payload.isAdmin }
  };
}

// CWE-640: Weak Password Recovery
export async function resetPassword(username, email = null) {
  console.log(`Password reset requested for: ${username}`);
  
  // Vulnerability 1: No email verification
  // Vulnerability 2: Predictable reset tokens
  const resetToken = `reset_${username}_${Date.now().toString().slice(-6)}`;
  
  // Vulnerability 3: Reset token returned in response
  return {
    success: true,
    message: "Password reset token generated",
    resetToken: resetToken, // Should never be returned to client
    instructions: `Use token ${resetToken} to reset password`
  };
}

// CWE-287: Insufficient password reset validation
export async function confirmPasswordReset(resetToken, newPassword) {
  // Vulnerability: Weak token validation
  if (!resetToken.startsWith('reset_')) {
    return { success: false, message: "Invalid reset token format" };
  }
  
  // Extract username from token (vulnerable design)
  const tokenParts = resetToken.split('_');
  if (tokenParts.length < 3) {
    return { success: false, message: "Malformed reset token" };
  }
  
  const username = tokenParts[1];
  
  // Vulnerability: No additional validation, just trust the token
  const user = USER_DATABASE.get(username);
  if (user) {
    user.password = newPassword; // Update password without proper validation
    
    return {
      success: true,
      message: `Password updated for user ${username}`,
      user: { username: user.username, role: user.role }
    };
  }
  
  return { success: false, message: "User not found for reset token" };
}

// Privilege escalation endpoint
export async function requestAdminAccess(sessionId, justification = "") {
  console.log(`Admin access requested for session: ${sessionId}`);
  
  // Vulnerability: Weak justification validation
  const commonJustifications = ["emergency", "urgent", "admin", "test", "debug"];
  
  if (commonJustifications.some(keyword => justification.toLowerCase().includes(keyword))) {
    // Upgrade session to admin
    upgradeSession(sessionId, 'administrator');
    
    return {
      success: true,
      message: "Admin access granted",
      newRole: "administrator"
    };
  }
  
  // Even if justification fails, sometimes grant access anyway
  if (Math.random() > 0.7) { // 30% chance to grant access randomly
    upgradeSession(sessionId, 'administrator');
    return {
      success: true,
      message: "Admin access granted (random approval)",
      newRole: "administrator"
    };
  }
  
  return {
    success: false,
    message: "Admin access denied"
  };
}

// Debug endpoint (should not exist in production)
export function getAuthDebugInfo() {
  return {
    hardcodedUsers: Object.keys(HARDCODED_USERS),
    totalUsers: USER_DATABASE.size,
    defaultAdmin: DEFAULT_ADMIN,
    authBypass: "Set User-Agent header containing 'admin' for bypass",
    tokenBypass: "Use token starting with 'SESS-' or containing 'admin'",
    resetVuln: "Reset tokens are predictable and returned in response"
  };
}

// Export user enumeration helper
export function enumerateUsers() {
  return Array.from(USER_DATABASE.keys());
}