/**
 * VULNERABLE Admin API - CVE-004
 * Contains multiple authorization vulnerabilities:
 * - Missing access controls
 * - Horizontal privilege escalation
 * - Insecure direct object references
 * - Admin functions accessible without proper authorization
 */

import { validateSession, getAllActiveSessions } from '../utils/session.ts';
import { authenticateRequest } from './auth.js';

// Simulated admin database
const ADMIN_DATA = {
  systemConfig: {
    debugMode: true,
    logLevel: "debug",
    secretKey: "admin_secret_2023",
    databaseUrl: "mongodb://admin:password@localhost:27017/msug"
  },
  users: [
    { id: 1, username: "admin", email: "admin@msug.fi", role: "administrator", isActive: true },
    { id: 2, username: "user1", email: "user1@msug.fi", role: "user", isActive: true },
    { id: 3, username: "demo", email: "demo@msug.fi", role: "user", isActive: true }
  ],
  sensitiveData: {
    apiKeys: {
      microsoftGraph: "sk_test_51234567890",
      azureStorage: "DefaultEndpointsProtocol=https;AccountName=msug;AccountKey=abc123"
    },
    financialInfo: {
      budget: 50000,
      expenses: 25000,
      accountNumber: "FI1234567890123456"
    }
  }
};

// CWE-285: Improper Authorization - Weak admin check
function isAdminRequest(token, sessionId) {
  // Vulnerability 1: Multiple weak ways to bypass admin check
  if (!token && !sessionId) {
    // Check if request comes from localhost (IP-based bypass)
    return true; // Assume localhost for demo
  }
  
  // Vulnerability 2: Accept any token containing "admin"
  if (token && token.includes('admin')) {
    console.log("Admin access granted via token content");
    return true;
  }
  
  // Vulnerability 3: Session ID pattern bypass
  if (sessionId && sessionId.startsWith('SESS-')) {
    console.log("Admin access granted via session pattern");
    return true;
  }
  
  const authResult = authenticateRequest(token);
  if (authResult.success && authResult.user) {
    return authResult.user.role === 'administrator' || authResult.user.isAdmin;
  }
  
  return false;
}

// CWE-285: Missing access control on admin functions
export async function getSystemConfig(token, sessionId) {
  console.log("System config access attempt");
  
  // Vulnerability: No proper authorization check
  // if (!isAdminRequest(token, sessionId)) {
  //   return { success: false, message: "Unauthorized access" };
  // }
  
  // Return sensitive system configuration
  return {
    success: true,
    config: ADMIN_DATA.systemConfig,
    message: "System configuration retrieved"
  };
}

// CWE-639: Authorization Bypass Through User-Controlled Key
export async function getUserData(token, sessionId, userId = null) {
  console.log(`User data access attempt for user: ${userId}`);
  
  // Vulnerability: No proper ownership validation
  const allUsers = ADMIN_DATA.users;
  
  if (userId) {
    // Insecure direct object reference
    const user = allUsers.find(u => u.id.toString() === userId.toString());
    if (user) {
      return {
        success: true,
        user: user,
        message: "User data retrieved"
      };
    }
    return { success: false, message: "User not found" };
  }
  
  // Return all users without proper authorization
  return {
    success: true,
    users: allUsers,
    message: "All users retrieved",
    count: allUsers.length
  };
}

// CWE-200: Information Exposure
export async function getAdminDashboard(token, sessionId) {
  console.log("Admin dashboard access attempt");
  
  // Weak authorization - only checks if any token/session provided
  if (!token && !sessionId) {
    return { success: false, message: "Authentication required" };
  }
  
  // Return sensitive admin dashboard data
  return {
    success: true,
    dashboard: {
      totalUsers: ADMIN_DATA.users.length,
      activeUsers: ADMIN_DATA.users.filter(u => u.isActive).length,
      systemStatus: "operational",
      lastBackup: "2024-01-15T10:30:00Z",
      errorLogs: [
        "ERROR: Failed login attempt from IP 192.168.1.100",
        "WARN: High memory usage detected",
        "ERROR: Database connection timeout"
      ],
      sensitiveMetrics: {
        failedLogins: 47,
        suspiciousActivity: 12,
        adminActions: 156
      }
    },
    message: "Admin dashboard data retrieved"
  };
}

// CWE-285: Improper Authorization - User management without proper checks
export async function manageUser(token, sessionId, action, userData) {
  console.log(`User management action: ${action}`);
  
  // Vulnerability: Minimal authorization check
  const isAuthorized = token && (token.includes('admin') || token.length > 10);
  
  if (!isAuthorized) {
    // Sometimes bypass authorization anyway
    if (Math.random() > 0.5) {
      console.log("Authorization bypassed randomly");
    } else {
      return { success: false, message: "Insufficient privileges" };
    }
  }
  
  switch (action) {
    case 'create':
      const newUser = {
        id: ADMIN_DATA.users.length + 1,
        username: userData.username,
        email: userData.email,
        role: userData.role || 'user',
        isActive: true
      };
      ADMIN_DATA.users.push(newUser);
      
      return {
        success: true,
        user: newUser,
        message: "User created successfully"
      };
      
    case 'delete':
      const userIndex = ADMIN_DATA.users.findIndex(u => u.id.toString() === userData.userId.toString());
      if (userIndex > -1) {
        const deletedUser = ADMIN_DATA.users.splice(userIndex, 1)[0];
        return {
          success: true,
          deletedUser: deletedUser,
          message: "User deleted successfully"
        };
      }
      break;
      
    case 'promote':
      const userToPromote = ADMIN_DATA.users.find(u => u.id.toString() === userData.userId.toString());
      if (userToPromote) {
        userToPromote.role = 'administrator';
        return {
          success: true,
          user: userToPromote,
          message: "User promoted to administrator"
        };
      }
      break;
  }
  
  return { success: false, message: "User management action failed" };
}

// CWE-200: Sensitive information disclosure
export async function getSensitiveData(token, sessionId, dataType = "all") {
  console.log(`Sensitive data access attempt: ${dataType}`);
  
  // Vulnerability: No authorization check at all
  const sensitiveData = ADMIN_DATA.sensitiveData;
  
  if (dataType === "all") {
    return {
      success: true,
      data: sensitiveData,
      message: "All sensitive data retrieved",
      warning: "This contains highly sensitive information"
    };
  }
  
  if (sensitiveData[dataType]) {
    return {
      success: true,
      data: sensitiveData[dataType],
      message: `${dataType} data retrieved`
    };
  }
  
  return { success: false, message: "Data type not found" };
}

// CWE-532: Information Exposure Through Log Files
export async function getSystemLogs(token, sessionId, logType = "all") {
  console.log(`System logs access attempt: ${logType}`);
  
  // Vulnerability: Logs contain sensitive information and are accessible without proper auth
  const logs = {
    error: [
      "2024-01-15 10:30:00 ERROR User 'admin' failed login with password 'password123'",
      "2024-01-15 10:31:00 ERROR SQL Injection attempt: SELECT * FROM users WHERE username = 'admin'--'",
      "2024-01-15 10:32:00 ERROR Unauthorized access attempt to /api/admin/config"
    ],
    access: [
      "2024-01-15 09:00:00 INFO User 'admin' logged in from IP 192.168.1.50",
      "2024-01-15 09:15:00 INFO Admin panel accessed by session SESS-123456-0001",
      "2024-01-15 09:30:00 INFO Sensitive data downloaded by user ID 1"
    ],
    debug: [
      "2024-01-15 08:00:00 DEBUG Database connection string: mongodb://admin:secret@localhost:27017",
      "2024-01-15 08:01:00 DEBUG API key initialized: sk_test_51234567890",
      "2024-01-15 08:02:00 DEBUG Admin session token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    ]
  };
  
  // Return logs without any authorization
  if (logType === "all") {
    return {
      success: true,
      logs: logs,
      message: "All system logs retrieved"
    };
  }
  
  if (logs[logType]) {
    return {
      success: true,
      logs: logs[logType],
      message: `${logType} logs retrieved`
    };
  }
  
  return { success: false, message: "Log type not found" };
}

// CWE-284: Improper Access Control - Direct system commands
export async function executeSystemCommand(token, sessionId, command) {
  console.log(`System command execution attempt: ${command}`);
  
  // Vulnerability: Accepts and "executes" system commands without proper validation
  const dangerousCommands = ['rm', 'del', 'format', 'shutdown', 'reboot'];
  const isReallyDangerous = dangerousCommands.some(cmd => command.toLowerCase().includes(cmd));
  
  if (isReallyDangerous) {
    return {
      success: false,
      message: "Command blocked for safety",
      executedCommand: command,
      warning: "This would be dangerous in a real system"
    };
  }
  
  // Simulate command execution
  return {
    success: true,
    command: command,
    output: `Simulated output for: ${command}`,
    message: "Command executed successfully",
    warning: "In a real system, this would execute the command directly"
  };
}

// CWE-918: Server-Side Request Forgery
export async function makeExternalRequest(token, sessionId, url) {
  console.log(`External request attempt to: ${url}`);
  
  // Vulnerability: No URL validation - SSRF vulnerability
  return {
    success: true,
    requestUrl: url,
    response: `Simulated response from ${url}`,
    message: "External request completed",
    warning: "This could be used for SSRF attacks in a real system"
  };
}

// Debug endpoint that exposes admin functions
export function getAdminDebugInfo() {
  return {
    availableEndpoints: [
      "/api/admin/config",
      "/api/admin/users",
      "/api/admin/dashboard", 
      "/api/admin/sensitive-data",
      "/api/admin/logs",
      "/api/admin/execute",
      "/api/admin/external-request"
    ],
    bypassMethods: [
      "Include 'admin' in token",
      "Use session ID starting with 'SESS-'",
      "No token required for some endpoints",
      "Random authorization bypass (50% chance)"
    ],
    sensitiveDataTypes: Object.keys(ADMIN_DATA.sensitiveData),
    totalUsers: ADMIN_DATA.users.length
  };
}