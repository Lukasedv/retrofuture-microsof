// VULNERABLE: Settings API without CSRF protection
// This file contains intentional security vulnerabilities for educational purposes

// Mock user data storage (in real app this would be a database)
let userData = {
  username: 'msug_admin',
  email: 'admin@msug.fi',
  role: 'administrator',
  notifications: true,
  twoFactorEnabled: false,
  securityLevel: 'high'
};

// VULNERABILITY: No CSRF token validation
// This endpoint accepts POST requests without verifying CSRF tokens
export async function updateUserSettings(formData) {
  // VULNERABLE: Direct form processing without CSRF validation
  // Malicious sites can send requests to change user settings
  
  console.log('Processing settings update without CSRF validation...');
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // VULNERABLE: Accepts any data without origin verification
  Object.keys(formData).forEach(key => {
    if (userData.hasOwnProperty(key)) {
      userData[key] = formData[key];
    }
  });
  
  // Log the vulnerability for demonstration
  console.warn('SECURITY WARNING: Settings updated without CSRF protection!');
  console.log('Updated user data:', userData);
  
  return {
    success: true,
    message: 'Settings updated successfully',
    data: userData
  };
}

// VULNERABILITY: GET request that changes state
// This violates RESTful principles and creates CSRF risk
export async function changePassword(newPassword) {
  console.log('CSRF VULNERABILITY: Password change via GET request');
  
  // In a real app, this would update the database
  userData.lastPasswordChange = new Date().toISOString();
  
  console.warn('SECURITY WARNING: Password changed via GET request (CSRF vulnerable)');
  
  return {
    success: true,
    message: 'Password changed via vulnerable GET request'
  };
}

// VULNERABILITY: Administrative function without proper CSRF protection  
export async function updateAdminSettings(adminData) {
  console.log('Processing admin settings without CSRF validation...');
  
  // VULNERABLE: No verification of admin privileges or CSRF token
  const adminSettings = {
    maintenanceMode: adminData.maintenanceMode || false,
    debugMode: adminData.debugMode || false,
    allowRegistration: adminData.allowRegistration || true,
    securityAlerts: adminData.securityAlerts || true
  };
  
  console.warn('SECURITY WARNING: Admin settings changed without CSRF protection!');
  console.log('Admin settings updated:', adminSettings);
  
  return {
    success: true,
    message: 'Admin settings updated without CSRF validation',
    settings: adminSettings
  };
}

// VULNERABILITY: Delete operation without CSRF protection
export async function deleteUserAccount() {
  console.log('CSRF VULNERABILITY: Account deletion without protection');
  
  // VULNERABLE: Critical operation without CSRF verification
  userData.deleted = true;
  userData.deletedAt = new Date().toISOString();
  
  console.warn('SECURITY WARNING: Account deleted without CSRF protection!');
  
  return {
    success: true,
    message: 'Account deleted via CSRF vulnerable endpoint'
  };
}

export function getUserData() {
  return userData;
}