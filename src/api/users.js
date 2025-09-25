// CVE-005: IDOR Vulnerability - User Profile endpoints without authorization
// This file contains intentionally vulnerable code for security testing

// Simulated user database - in a real app this would be a database
const users = [
  { 
    id: 1, 
    username: 'admin', 
    email: 'admin@msug.fi', 
    role: 'administrator',
    ssn: '123-45-6789',
    salary: 95000,
    address: '123 Admin Street, Finland',
    phone: '+358-40-1234567'
  },
  { 
    id: 2, 
    username: 'john_doe', 
    email: 'john@msug.fi', 
    role: 'user',
    ssn: '987-65-4321',
    salary: 65000,
    address: '456 User Avenue, Finland',
    phone: '+358-50-7654321'
  },
  { 
    id: 3, 
    username: 'jane_smith', 
    email: 'jane@msug.fi', 
    role: 'user',
    ssn: '555-12-3456',
    salary: 58000,
    address: '789 Member Road, Finland',
    phone: '+358-45-9876543'
  },
  { 
    id: 4, 
    username: 'security_officer', 
    email: 'security@msug.fi', 
    role: 'security',
    ssn: '111-22-3333',
    salary: 75000,
    address: '321 Security Blvd, Finland',
    phone: '+358-44-1122334'
  }
];

// VULNERABILITY: No authentication or authorization checks
// CWE-639: Authorization Bypass Through User-Controlled Key
// Users can access any profile by changing the ID in the URL
export function getUserProfile(userId) {
  // INSECURE: Direct object reference without ownership validation
  const user = users.find(u => u.id === parseInt(userId));
  
  if (!user) {
    return { error: 'User not found' };
  }
  
  // VULNERABILITY: Returns sensitive data without access control
  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      ssn: user.ssn,        // Sensitive PII exposed
      salary: user.salary,  // Financial data exposed
      address: user.address, // Personal info exposed
      phone: user.phone     // Contact info exposed
    }
  };
}

// VULNERABILITY: Admin function accessible via direct reference
// CWE-284: Improper Access Control
export function getUserSettings(userId) {
  const user = users.find(u => u.id === parseInt(userId));
  
  if (!user) {
    return { error: 'User not found' };
  }
  
  // INSECURE: No role-based access control
  // Any user can access admin settings by manipulating the ID
  return {
    success: true,
    settings: {
      userId: user.id,
      canModifyUsers: user.role === 'administrator',
      canViewLogs: user.role === 'administrator' || user.role === 'security',
      canDeleteData: user.role === 'administrator',
      adminPanel: user.role === 'administrator' ? '/admin/panel' : null,
      securityDashboard: user.role === 'security' ? '/security/dashboard' : null
    }
  };
}

// VULNERABILITY: User listing with no pagination or access control
export function getAllUsers() {
  // INSECURE: Exposes all user data including sensitive information
  return {
    success: true,
    users: users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      // Sensitive data should not be exposed in listings
      ssn: user.ssn,
      salary: user.salary
    }))
  };
}

// VULNERABILITY: Update user without ownership validation
export function updateUserProfile(userId, updateData) {
  const userIndex = users.findIndex(u => u.id === parseInt(userId));
  
  if (userIndex === -1) {
    return { error: 'User not found' };
  }
  
  // INSECURE: No authorization check - any user can update any profile
  users[userIndex] = { ...users[userIndex], ...updateData };
  
  return {
    success: true,
    message: 'User profile updated successfully',
    user: users[userIndex]
  };
}