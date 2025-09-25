// CVE-005: IDOR Vulnerability - Document access without ownership checks
// This file contains intentionally vulnerable code for security testing

// Simulated document database with predictable IDs
const documents = [
  {
    id: 1001,
    title: 'MSUG Security Audit Report 2024',
    content: 'CONFIDENTIAL: This document contains sensitive security findings including:\n- 15 critical vulnerabilities found in Azure tenant\n- Privileged access review results\n- Incident response procedures\n- Security team contact information: security@msug.fi\n- Emergency contact: +358-40-SECURITY',
    ownerId: 1, // admin
    type: 'confidential',
    createdAt: '2024-01-15'
  },
  {
    id: 1002,
    title: 'Personal Performance Review - John Doe',
    content: 'Performance review for John Doe (ID: 2)\n- Overall rating: Exceeds expectations\n- Salary recommendation: Increase to €70,000\n- Promotion to Senior Security Analyst recommended\n- Areas for improvement: PowerShell scripting\n- Manager feedback: Excellent work on incident response',
    ownerId: 2, // john_doe
    type: 'hr',
    createdAt: '2024-02-01'
  },
  {
    id: 1003,
    title: 'Financial Records - Q1 2024',
    content: 'MSUG Finland Financial Summary Q1 2024:\n- Total revenue: €150,000\n- Operating expenses: €120,000\n- Employee salaries breakdown:\n  * Admin: €95,000/year\n  * Security Officer: €75,000/year\n  * John Doe: €65,000/year\n  * Jane Smith: €58,000/year\n- Bank account details: FI21 1234 5600 0007 85',
    ownerId: 1, // admin
    type: 'financial',
    createdAt: '2024-03-31'
  },
  {
    id: 1004,
    title: 'Meeting Notes - Security Team',
    content: 'Internal Security Team Meeting - March 15, 2024\n- Discussed new threat intelligence feeds\n- Azure Sentinel configuration updates needed\n- Incident #2024-001: Phishing attack blocked\n- Next meeting: March 22, 2024\n- Attendees: Admin, Security Officer\n- Action items: Review firewall rules, update security policies',
    ownerId: 4, // security_officer
    type: 'internal',
    createdAt: '2024-03-15'
  },
  {
    id: 1005,
    title: 'Customer Data Export - January 2024',
    content: 'PERSONAL DATA - GDPR RESTRICTED\n- Member list with email addresses\n- Event attendance records\n- Payment information\n- Contact preferences\n- This file contains PII of 450+ MSUG members\n- Access restricted to data protection officer only\n- Retention period: 7 years from last activity',
    ownerId: 1, // admin
    type: 'personal_data',
    createdAt: '2024-01-31'
  }
];

// VULNERABILITY: Direct object reference without ownership validation
// CWE-639: Authorization Bypass Through User-Controlled Key
export function getDocument(documentId) {
  // INSECURE: No authentication or authorization checks
  const doc = documents.find(d => d.id === parseInt(documentId));
  
  if (!doc) {
    return { error: 'Document not found' };
  }
  
  // VULNERABILITY: Returns sensitive documents regardless of ownership
  return {
    success: true,
    document: {
      id: doc.id,
      title: doc.title,
      content: doc.content,  // Sensitive content exposed
      ownerId: doc.ownerId,
      type: doc.type,
      createdAt: doc.createdAt
    }
  };
}

// VULNERABILITY: List all documents with predictable IDs
export function getAllDocuments() {
  // INSECURE: Exposes document metadata including ownership info
  return {
    success: true,
    documents: documents.map(doc => ({
      id: doc.id,           // Predictable sequential IDs
      title: doc.title,
      ownerId: doc.ownerId, // Reveals ownership info
      type: doc.type,       // Reveals document sensitivity
      createdAt: doc.createdAt
    }))
  };
}

// VULNERABILITY: Get documents by user without proper authorization
export function getDocumentsByUser(userId) {
  // INSECURE: Any user can see documents belonging to any other user
  const userDocs = documents.filter(d => d.ownerId === parseInt(userId));
  
  return {
    success: true,
    documents: userDocs.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content, // Full content exposed
      type: doc.type,
      createdAt: doc.createdAt
    }))
  };
}

// VULNERABILITY: Delete document without ownership validation
export function deleteDocument(documentId) {
  const docIndex = documents.findIndex(d => d.id === parseInt(documentId));
  
  if (docIndex === -1) {
    return { error: 'Document not found' };
  }
  
  // INSECURE: Any user can delete any document
  const deletedDoc = documents.splice(docIndex, 1)[0];
  
  return {
    success: true,
    message: 'Document deleted successfully',
    deletedDocument: {
      id: deletedDoc.id,
      title: deletedDoc.title,
      ownerId: deletedDoc.ownerId
    }
  };
}

// VULNERABILITY: Update document without ownership validation
export function updateDocument(documentId, updateData) {
  const docIndex = documents.findIndex(d => d.id === parseInt(documentId));
  
  if (docIndex === -1) {
    return { error: 'Document not found' };
  }
  
  // INSECURE: No authorization check - any user can modify any document
  documents[docIndex] = { ...documents[docIndex], ...updateData };
  
  return {
    success: true,
    message: 'Document updated successfully',
    document: documents[docIndex]
  };
}