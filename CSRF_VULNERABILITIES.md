# CSRF Vulnerabilities Summary

This document lists all intentional CSRF vulnerabilities implemented in this application for educational and testing purposes.

## 🚨 Security Warning
**This application contains intentional security vulnerabilities and should NEVER be deployed to production environments.**

## Implemented CSRF Vulnerabilities (CWE-352)

### 1. Form-Based CSRF Attacks

#### User Settings Form (`src/components/UserSettings.tsx`)
- **Vulnerability**: POST form submission without CSRF token validation
- **Location**: Line 51-67, `handleSettingsUpdate` function
- **Impact**: Attackers can change user profile settings, email, security level, and notification preferences
- **Detection Pattern**: Form submission without `csrf_token` hidden field

#### Money Transfer Form (`src/components/TransferMoney.tsx`)
- **Vulnerability**: Financial transfer form without CSRF protection
- **Location**: Line 65-94, `handleTransfer` function  
- **Impact**: Unauthorized money transfers from user accounts
- **Detection Pattern**: Critical financial operation without CSRF validation

#### Loan Application Form (`src/components/TransferMoney.tsx`)
- **Vulnerability**: Loan application without CSRF token
- **Location**: Line 96-120, `handleLoanApplication` function
- **Impact**: Fraudulent loan applications on behalf of users
- **Detection Pattern**: High-value financial operation lacking CSRF protection

### 2. State-Changing GET Requests

#### Password Change via GET (`src/api/settings.js`)
- **Vulnerability**: Password modification through GET request
- **Location**: Line 32-44, `changePassword` function
- **Impact**: Account takeover through malicious links
- **Detection Pattern**: State-changing operation using HTTP GET method

#### Investment via GET Request (`src/api/transactions.js`)
- **Vulnerability**: Stock purchases through GET requests
- **Location**: Line 84-114, `makeInvestment` function
- **Impact**: Unauthorized stock purchases and financial losses
- **Detection Pattern**: Financial transaction using GET instead of POST

### 3. Administrative Functions Without CSRF Protection

#### Admin Settings Update (`src/api/settings.js`)
- **Vulnerability**: Administrative controls without CSRF validation
- **Location**: Line 47-63, `updateAdminSettings` function
- **Impact**: Attackers can enable maintenance mode, debug mode, disable security
- **Detection Pattern**: Administrative functions lacking proper request validation

#### Account Deletion (`src/api/settings.js`)
- **Vulnerability**: Critical account deletion without CSRF token
- **Location**: Line 66-76, `deleteUserAccount` function
- **Impact**: Unauthorized account termination
- **Detection Pattern**: Destructive operation without cross-site request protection

### 4. Weak CSRF Implementation (`src/utils/csrf.ts`)

#### Predictable Token Generation
- **Vulnerability**: CSRF tokens generated using predictable patterns
- **Location**: Line 5-16, `generateWeakCSRFToken` function
- **Detection Pattern**: Timestamp-based token generation

#### Bypassable Validation
- **Vulnerability**: CSRF validation that always returns true
- **Location**: Line 19-32, `validateCSRFToken` function
- **Detection Pattern**: Security validation that can be circumvented

#### Insecure Storage
- **Vulnerability**: CSRF tokens stored in localStorage (XSS vulnerable)
- **Location**: Line 36-40, `storeCSRFToken` function
- **Detection Pattern**: Security tokens stored in client-side accessible storage

### 5. Bulk Operations Without Protection

#### Mass Transfer Function (`src/api/transactions.js`)
- **Vulnerability**: Multiple financial transfers without CSRF validation
- **Location**: Line 117-131, `bulkTransfer` function
- **Impact**: Large-scale unauthorized fund transfers
- **Detection Pattern**: Batch operations without proper security checks

### 6. Hidden Form Creation (CSRF Exploit Demonstration)

#### Malicious Form Generation (`src/components/UserSettings.tsx`)
- **Vulnerability**: Creates hidden forms that could be embedded in malicious sites
- **Location**: Line 109-129, `createHiddenCSRFForm` function
- **Impact**: Demonstrates how CSRF attacks could be executed
- **Detection Pattern**: Programmatic form creation without CSRF protection

#### Transfer Form Exploit (`src/components/TransferMoney.tsx`)
- **Vulnerability**: Creates hidden transfer forms for external exploitation
- **Location**: Line 160-185, `createMaliciousTransferForm` function
- **Impact**: Shows potential for external site to trigger transfers
- **Detection Pattern**: Dynamic form creation with hardcoded malicious data

## Static Analysis Detection Patterns

### Expected Security Alerts
1. **CWE-352**: Cross-Site Request Forgery (CSRF)
2. **Missing CSRF token validation warnings** 
3. **Unsafe state-changing GET requests**
4. **Cross-origin request vulnerabilities**
5. **Insecure token storage patterns**
6. **Administrative functions without proper validation**
7. **Financial operations lacking security controls**

### Code Patterns That Should Trigger Alerts
- Form submissions without `csrf_token` hidden fields
- POST/PUT/DELETE endpoints without CSRF middleware
- GET requests that modify application state
- Administrative functions without authorization checks
- Financial operations without dual approval/validation
- Client-side storage of security tokens
- Hardcoded or predictable security tokens

## Remediation Notes

To fix these vulnerabilities in a real application:

1. **Implement proper CSRF tokens**: Use cryptographically secure, unpredictable tokens
2. **Validate all state-changing requests**: Check CSRF tokens on all POST/PUT/DELETE operations
3. **Use proper HTTP methods**: Never use GET for state-changing operations
4. **Secure token storage**: Store CSRF tokens in secure, httpOnly cookies
5. **Implement SameSite cookie attributes**: Prevent cross-site cookie transmission
6. **Add referrer/origin validation**: Verify request sources
7. **Implement double-submit cookie pattern**: Additional CSRF protection layer
8. **Use framework CSRF protection**: Leverage built-in security features

## Testing the Vulnerabilities

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5000`
3. Click on "USER_SETTINGS.CFG [CSRF VULNERABLE]" or "BANKING.EXE [CSRF VULNERABLE]"
4. Submit forms and observe console warnings about CSRF vulnerabilities
5. Check browser developer tools for security warnings and error messages

**Total CSRF vulnerability mentions in codebase: 144**

This comprehensive implementation ensures that static analysis security tools will detect multiple categories of CSRF vulnerabilities for educational and testing purposes.