// CVE-005: IDOR Vulnerability - Financial transaction system vulnerable to IDOR
// This file contains intentionally vulnerable code for security testing

// Simulated transaction database with predictable IDs
const transactions = [
  {
    id: 2001,
    userId: 1, // admin
    type: 'salary',
    amount: 7916.67, // Monthly salary
    description: 'Monthly salary payment - Administrator',
    accountNumber: 'FI21 1234 5600 0007 85',
    recipientName: 'Admin User',
    date: '2024-03-01',
    status: 'completed',
    category: 'payroll'
  },
  {
    id: 2002,
    userId: 2, // john_doe
    type: 'salary',
    amount: 5416.67, // Monthly salary
    description: 'Monthly salary payment - Security Analyst',
    accountNumber: 'FI45 6789 1200 0034 56',
    recipientName: 'John Doe',
    date: '2024-03-01',
    status: 'completed',
    category: 'payroll'
  },
  {
    id: 2003,
    userId: 1, // admin
    type: 'expense',
    amount: 2500.00,
    description: 'Azure Security Center - Enterprise subscription',
    accountNumber: 'FI21 1234 5600 0007 85',
    recipientName: 'Microsoft Corporation',
    date: '2024-03-05',
    status: 'completed',
    category: 'software'
  },
  {
    id: 2004,
    userId: 3, // jane_smith
    type: 'salary',
    amount: 4833.33, // Monthly salary
    description: 'Monthly salary payment - Junior Analyst',
    accountNumber: 'FI67 8901 2300 0045 67',
    recipientName: 'Jane Smith',
    date: '2024-03-01',
    status: 'completed',
    category: 'payroll'
  },
  {
    id: 2005,
    userId: 4, // security_officer
    type: 'salary',
    amount: 6250.00, // Monthly salary
    description: 'Monthly salary payment - Security Officer',
    accountNumber: 'FI89 0123 4500 0056 78',
    recipientName: 'Security Officer',
    date: '2024-03-01',
    status: 'completed',
    category: 'payroll'
  },
  {
    id: 2006,
    userId: 1, // admin
    type: 'bonus',
    amount: 5000.00,
    description: 'Q1 2024 Performance bonus',
    accountNumber: 'FI21 1234 5600 0007 85',
    recipientName: 'Admin User',
    date: '2024-03-31',
    status: 'pending',
    category: 'bonus'
  },
  {
    id: 2007,
    userId: 2, // john_doe
    type: 'expense_reimbursement',
    amount: 450.00,
    description: 'Conference attendance - InfoSec Europe 2024',
    accountNumber: 'FI45 6789 1200 0034 56',
    recipientName: 'John Doe',
    date: '2024-02-15',
    status: 'completed',
    category: 'training'
  },
  {
    id: 2008,
    userId: 1, // admin
    type: 'vendor_payment',
    amount: 15000.00,
    description: 'Security consulting services - Q1 2024',
    accountNumber: 'FI12 3456 7800 0089 01',
    recipientName: 'SecureConsult Oy',
    date: '2024-03-20',
    status: 'completed',
    category: 'consulting'
  }
];

// VULNERABILITY: Direct access to financial transactions without authorization
// CWE-639: Authorization Bypass Through User-Controlled Key
export function getTransaction(transactionId) {
  // INSECURE: No authentication or authorization checks
  const transaction = transactions.find(t => t.id === parseInt(transactionId));
  
  if (!transaction) {
    return { error: 'Transaction not found' };
  }
  
  // VULNERABILITY: Returns sensitive financial data without access control
  return {
    success: true,
    transaction: {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,         // Financial amount exposed
      description: transaction.description,
      accountNumber: transaction.accountNumber, // Bank account exposed
      recipientName: transaction.recipientName, // Personal info exposed
      date: transaction.date,
      status: transaction.status,
      category: transaction.category
    }
  };
}

// VULNERABILITY: Get user transactions without ownership validation
export function getUserTransactions(userId) {
  // INSECURE: Any user can access any other user's financial history
  const userTransactions = transactions.filter(t => t.userId === parseInt(userId));
  
  return {
    success: true,
    transactions: userTransactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,         // Salary and financial data exposed
      description: transaction.description,
      accountNumber: transaction.accountNumber, // Bank account details exposed
      recipientName: transaction.recipientName,
      date: transaction.date,
      status: transaction.status,
      category: transaction.category
    }))
  };
}

// VULNERABILITY: List all transactions with no access control
export function getAllTransactions() {
  // INSECURE: Exposes all financial data across the organization
  return {
    success: true,
    transactions: transactions.map(transaction => ({
      id: transaction.id,           // Predictable sequential IDs
      userId: transaction.userId,   // Reveals which user owns transaction
      type: transaction.type,
      amount: transaction.amount,   // All financial amounts visible
      description: transaction.description,
      date: transaction.date,
      status: transaction.status,
      category: transaction.category
    }))
  };
}

// VULNERABILITY: Financial summary without proper authorization
export function getFinancialSummary(userId) {
  const userTransactions = transactions.filter(t => t.userId === parseInt(userId));
  
  // INSECURE: Calculates and returns financial summaries for any user
  const summary = {
    userId: parseInt(userId),
    totalIncome: 0,
    totalExpenses: 0,
    pendingAmount: 0,
    transactionCount: userTransactions.length,
    accountNumbers: [] // Collects all bank accounts
  };
  
  userTransactions.forEach(transaction => {
    if (transaction.type === 'salary' || transaction.type === 'bonus' || transaction.type === 'expense_reimbursement') {
      summary.totalIncome += transaction.amount;
    } else {
      summary.totalExpenses += transaction.amount;
    }
    
    if (transaction.status === 'pending') {
      summary.pendingAmount += transaction.amount;
    }
    
    // VULNERABILITY: Collects sensitive account information
    if (!summary.accountNumbers.includes(transaction.accountNumber)) {
      summary.accountNumbers.push(transaction.accountNumber);
    }
  });
  
  return {
    success: true,
    summary: summary
  };
}

// VULNERABILITY: Modify transaction without ownership validation
export function updateTransaction(transactionId, updateData) {
  const transactionIndex = transactions.findIndex(t => t.id === parseInt(transactionId));
  
  if (transactionIndex === -1) {
    return { error: 'Transaction not found' };
  }
  
  // INSECURE: No authorization check - any user can modify any transaction
  transactions[transactionIndex] = { ...transactions[transactionIndex], ...updateData };
  
  return {
    success: true,
    message: 'Transaction updated successfully',
    transaction: transactions[transactionIndex]
  };
}

// VULNERABILITY: Create new transaction without proper validation
export function createTransaction(transactionData) {
  // INSECURE: No validation of user authorization to create transactions
  const newTransaction = {
    id: Math.max(...transactions.map(t => t.id)) + 1, // Predictable ID generation
    ...transactionData,
    date: new Date().toISOString().split('T')[0],
    status: 'pending'
  };
  
  transactions.push(newTransaction);
  
  return {
    success: true,
    message: 'Transaction created successfully',
    transaction: newTransaction
  };
}