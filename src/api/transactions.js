// VULNERABLE: Financial transactions API without CSRF protection
// This file contains intentional security vulnerabilities for educational purposes

// Mock account data (in real app this would be a secure database)
let accounts = {
  checking: {
    id: 'acc_001',
    name: 'MSUG Checking',
    balance: 10000.00,
    currency: 'EUR'
  },
  savings: {
    id: 'acc_002', 
    name: 'MSUG Savings',
    balance: 25000.00,
    currency: 'EUR'
  }
};

let transactionHistory = [];

// VULNERABILITY: Money transfer without CSRF protection
// Attackers can initiate transfers from malicious sites
export async function transferMoney(transferData) {
  console.log('CSRF VULNERABILITY: Processing money transfer without CSRF validation');
  
  const { fromAccount, toAccount, amount, description } = transferData;
  
  // VULNERABLE: No CSRF token validation
  // Malicious sites can send requests to transfer money
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // VULNERABLE: Direct processing without origin verification
  if (accounts[fromAccount] && parseFloat(amount) > 0) {
    const transferAmount = parseFloat(amount);
    
    if (accounts[fromAccount].balance >= transferAmount) {
      // Process the transfer
      accounts[fromAccount].balance -= transferAmount;
      
      // Add to transaction history
      const transaction = {
        id: `txn_${Date.now()}`,
        type: 'transfer',
        fromAccount,
        toAccount: toAccount || 'external',
        amount: transferAmount,
        description: description || 'CSRF vulnerable transfer',
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      transactionHistory.push(transaction);
      
      console.warn('SECURITY WARNING: Money transferred without CSRF protection!');
      console.log('Transfer completed:', transaction);
      
      return {
        success: true,
        message: `Successfully transferred €${transferAmount}`,
        transaction,
        newBalance: accounts[fromAccount].balance
      };
    } else {
      return {
        success: false,
        message: 'Insufficient funds',
        balance: accounts[fromAccount].balance
      };
    }
  }
  
  return {
    success: false,
    message: 'Invalid account or amount'
  };
}

// VULNERABILITY: Loan application without CSRF protection
export async function applyForLoan(loanData) {
  console.log('CSRF VULNERABILITY: Loan application without CSRF validation');
  
  const { amount, purpose, duration } = loanData;
  
  // VULNERABLE: No CSRF verification for financial application
  const application = {
    id: `loan_${Date.now()}`,
    amount: parseFloat(amount),
    purpose: purpose || 'Unknown purpose',
    duration: duration || '12 months',
    status: 'pending',
    appliedAt: new Date().toISOString(),
    interestRate: 5.5
  };
  
  console.warn('SECURITY WARNING: Loan application submitted without CSRF protection!');
  console.log('Loan application:', application);
  
  return {
    success: true,
    message: 'Loan application submitted via CSRF vulnerable endpoint',
    application
  };
}

// VULNERABILITY: Account closure without CSRF protection  
export async function closeAccount(accountId) {
  console.log('CSRF VULNERABILITY: Account closure without protection');
  
  // VULNERABLE: Critical financial operation without CSRF token
  if (accounts[accountId]) {
    accounts[accountId].status = 'closed';
    accounts[accountId].closedAt = new Date().toISOString();
    
    console.warn('SECURITY WARNING: Account closed without CSRF protection!');
    
    return {
      success: true,
      message: `Account ${accountId} closed via CSRF vulnerable endpoint`
    };
  }
  
  return {
    success: false,
    message: 'Account not found'
  };
}

// VULNERABILITY: Investment transaction via GET request
// GET requests should not change state, but this one does
export async function makeInvestment(symbol, amount) {
  console.log('CSRF VULNERABILITY: Investment via GET request');
  
  // VULNERABLE: State-changing GET request
  const investment = {
    id: `inv_${Date.now()}`,
    symbol: symbol || 'MSFT',
    amount: parseFloat(amount),
    price: 350.00, // Mock price
    shares: parseFloat(amount) / 350.00,
    timestamp: new Date().toISOString()
  };
  
  // Deduct from checking account
  if (accounts.checking.balance >= investment.amount) {
    accounts.checking.balance -= investment.amount;
    
    transactionHistory.push({
      id: `txn_${Date.now()}`,
      type: 'investment',
      amount: investment.amount,
      description: `Investment in ${investment.symbol}`,
      timestamp: new Date().toISOString(),
      method: 'GET' // Vulnerability indicator
    });
  }
  
  console.warn('SECURITY WARNING: Investment made via GET request (CSRF vulnerable)');
  
  return {
    success: true,
    message: 'Investment executed via vulnerable GET request',
    investment
  };
}

// VULNERABILITY: Bulk transfer without proper validation
export async function bulkTransfer(transfers) {
  console.log('CSRF VULNERABILITY: Bulk transfers without CSRF validation');
  
  const results = [];
  
  // VULNERABLE: Process multiple transfers without CSRF protection
  for (const transfer of transfers) {
    const result = await transferMoney(transfer);
    results.push(result);
  }
  
  console.warn('SECURITY WARNING: Bulk transfers processed without CSRF protection!');
  
  return {
    success: true,
    message: 'Bulk transfers completed via CSRF vulnerable endpoint',
    results
  };
}

export function getAccounts() {
  return accounts;
}

export function getTransactionHistory() {
  return transactionHistory;
}