// VULNERABLE: Transfer Money component without CSRF protection
// This file contains intentional security vulnerabilities for educational purposes

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  transferMoney, 
  applyForLoan, 
  closeAccount, 
  makeInvestment, 
  bulkTransfer, 
  getAccounts, 
  getTransactionHistory 
} from '@/api/transactions.js';

interface TransferMoneyProps {
  setCurrentScreen: (screen: string) => void;
}

export function TransferMoney({ setCurrentScreen }: TransferMoneyProps) {
  const [accounts, setAccounts] = useState<any>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transferData, setTransferData] = useState({
    fromAccount: 'checking',
    toAccount: '',
    amount: '',
    description: ''
  });
  const [loanData, setLoanData] = useState({
    amount: '',
    purpose: '',
    duration: '12'
  });
  const [investmentData, setInvestmentData] = useState({
    symbol: 'MSFT',
    amount: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load account data and transaction history
    setAccounts(getAccounts());
    setTransactions(getTransactionHistory());
  }, []);

  // VULNERABILITY: Money transfer without CSRF protection
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // VULNERABLE: No CSRF token in financial transaction
      console.warn('CSRF VULNERABILITY: Processing money transfer without CSRF protection');
      
      const result = await transferMoney(transferData);
      
      if (result.success) {
        setMessage(`✅ ${result.message} - New balance: €${result.newBalance}`);
        setAccounts(getAccounts()); // Refresh accounts
        setTransactions(getTransactionHistory()); // Refresh transactions
        setTransferData({
          fromAccount: 'checking',
          toAccount: '',
          amount: '',
          description: ''
        });
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage('❌ Transfer failed: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // VULNERABILITY: Loan application without CSRF validation
  const handleLoanApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // VULNERABLE: Critical financial operation without CSRF token
      console.warn('CSRF VULNERABILITY: Loan application without CSRF protection');
      
      const result = await applyForLoan(loanData);
      
      if (result.success) {
        setMessage(`✅ ${result.message} - Application ID: ${result.application.id}`);
        setLoanData({ amount: '', purpose: '', duration: '12' });
      }
    } catch (error) {
      setMessage('❌ Loan application failed: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // VULNERABILITY: Account closure without CSRF protection
  const handleAccountClosure = async (accountId: string) => {
    const confirmed = window.confirm(`Are you sure you want to close the ${accountId} account?`);
    
    if (confirmed) {
      try {
        // VULNERABLE: Critical operation without CSRF validation
        console.warn('CSRF VULNERABILITY: Account closure without CSRF protection');
        
        const result = await closeAccount(accountId);
        
        if (result.success) {
          setMessage(`✅ ${result.message}`);
          setAccounts(getAccounts());
        } else {
          setMessage(`❌ ${result.message}`);
        }
      } catch (error) {
        setMessage('❌ Account closure failed: ' + error);
      }
    }
  };

  // VULNERABILITY: Investment via GET request (should be POST)
  const handleInvestment = async () => {
    if (!investmentData.amount) {
      setMessage('❌ Please enter investment amount');
      return;
    }

    try {
      // VULNERABLE: State-changing operation via GET request
      console.warn('CSRF VULNERABILITY: Investment via GET request');
      
      const result = await makeInvestment(investmentData.symbol, investmentData.amount);
      
      if (result.success) {
        setMessage(`✅ ${result.message} - Shares: ${result.investment.shares.toFixed(2)}`);
        setAccounts(getAccounts());
        setTransactions(getTransactionHistory());
        setInvestmentData({ symbol: 'MSFT', amount: '' });
      }
    } catch (error) {
      setMessage('❌ Investment failed: ' + error);
    }
  };

  // VULNERABILITY: Bulk transfer without proper validation
  const handleBulkTransfer = async () => {
    const bulkTransfers = [
      { fromAccount: 'checking', toAccount: 'external_001', amount: '500', description: 'Bulk transfer 1' },
      { fromAccount: 'checking', toAccount: 'external_002', amount: '300', description: 'Bulk transfer 2' },
      { fromAccount: 'savings', toAccount: 'external_003', amount: '1000', description: 'Bulk transfer 3' }
    ];

    setIsLoading(true);
    
    try {
      // VULNERABLE: Multiple transfers without CSRF protection
      console.warn('CSRF VULNERABILITY: Bulk transfers without CSRF protection');
      
      const result = await bulkTransfer(bulkTransfers);
      
      if (result.success) {
        setMessage(`✅ ${result.message} - Processed ${result.results.length} transfers`);
        setAccounts(getAccounts());
        setTransactions(getTransactionHistory());
      }
    } catch (error) {
      setMessage('❌ Bulk transfer failed: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // VULNERABILITY: Create malicious form that could be embedded in other sites
  const createMaliciousTransferForm = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/transfer'; // Would be processed without CSRF check
    form.style.display = 'none';
    
    const fromInput = document.createElement('input');
    fromInput.name = 'fromAccount';
    fromInput.value = 'checking';
    
    const toInput = document.createElement('input');
    toInput.name = 'toAccount';
    toInput.value = 'attacker_account_123';
    
    const amountInput = document.createElement('input');
    amountInput.name = 'amount';
    amountInput.value = '1000';
    
    form.appendChild(fromInput);
    form.appendChild(toInput);
    form.appendChild(amountInput);
    document.body.appendChild(form);
    
    console.warn('CSRF VULNERABILITY: Malicious transfer form created');
    setMessage('⚠️ Malicious form created in DOM (check browser console)');
    
    return form;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">FINANCIAL_SYSTEM.EXE</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-red-500 border-red-500">
            CSRF VULNERABLE
          </Badge>
          <Button 
            onClick={() => setCurrentScreen('main')}
            variant="ghost" 
            className="text-muted-foreground hover:text-primary"
          >
            [ BACK ] &lt;&lt;
          </Button>
        </div>
      </div>

      {message && (
        <div className="p-3 border border-accent bg-accent/10 terminal-text">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Balances */}
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold mb-4">ACCOUNT_BALANCES.DAT</div>
          <div className="space-y-2">
            {Object.entries(accounts).map(([key, account]: [string, any]) => (
              <div key={key} className="flex justify-between items-center p-2 border border-primary">
                <div>
                  <div className="text-primary font-bold">{account.name}</div>
                  <div className="text-sm text-muted-foreground">ID: {account.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-accent font-bold">€{account.balance.toFixed(2)}</div>
                  <Button 
                    onClick={() => handleAccountClosure(key)}
                    className="text-xs border-red-500 text-red-500 hover:bg-red-500 hover:text-white mt-1"
                    variant="outline"
                    size="sm"
                  >
                    CLOSE [CSRF RISK]
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* VULNERABLE: Money Transfer Form */}
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold mb-4">MONEY_TRANSFER.EXE</div>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-primary">From Account:</label>
              <select
                value={transferData.fromAccount}
                onChange={(e) => setTransferData({...transferData, fromAccount: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
              >
                <option value="checking">Checking Account</option>
                <option value="savings">Savings Account</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-primary">To Account:</label>
              <input
                type="text"
                value={transferData.toAccount}
                onChange={(e) => setTransferData({...transferData, toAccount: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
                placeholder="Recipient account number"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary">Amount (€):</label>
              <input
                type="number"
                step="0.01"
                value={transferData.amount}
                onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary">Description:</label>
              <input
                type="text"
                value={transferData.description}
                onChange={(e) => setTransferData({...transferData, description: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
                placeholder="Transfer description"
              />
            </div>

            {/* VULNERABLE: No CSRF token in form */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full terminal-border bg-accent text-accent-foreground hover:bg-accent/80"
            >
              {isLoading ? 'PROCESSING...' : 'TRANSFER MONEY [NO CSRF PROTECTION]'}
            </Button>
          </form>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VULNERABLE: Loan Application */}
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold mb-4">LOAN_APPLICATION.EXE</div>
          <form onSubmit={handleLoanApplication} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-primary">Loan Amount (€):</label>
              <input
                type="number"
                value={loanData.amount}
                onChange={(e) => setLoanData({...loanData, amount: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
                placeholder="10000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-primary">Purpose:</label>
              <select
                value={loanData.purpose}
                onChange={(e) => setLoanData({...loanData, purpose: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
              >
                <option value="">Select purpose</option>
                <option value="home">Home Purchase</option>
                <option value="car">Car Purchase</option>
                <option value="education">Education</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-primary">Duration (months):</label>
              <select
                value={loanData.duration}
                onChange={(e) => setLoanData({...loanData, duration: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
              >
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
                <option value="60">60 months</option>
              </select>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full terminal-border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
            >
              {isLoading ? 'PROCESSING...' : 'APPLY FOR LOAN [CSRF VULNERABLE]'}
            </Button>
          </form>
        </Card>

        {/* VULNERABLE: Investment Section */}
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold mb-4">INVESTMENT.EXE</div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-primary">Stock Symbol:</label>
              <select
                value={investmentData.symbol}
                onChange={(e) => setInvestmentData({...investmentData, symbol: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
              >
                <option value="MSFT">Microsoft (MSFT)</option>
                <option value="AAPL">Apple (AAPL)</option>
                <option value="GOOGL">Google (GOOGL)</option>
                <option value="TSLA">Tesla (TSLA)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-primary">Investment Amount (€):</label>
              <input
                type="number"
                step="0.01"
                value={investmentData.amount}
                onChange={(e) => setInvestmentData({...investmentData, amount: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
                placeholder="1000.00"
              />
            </div>

            <Button 
              onClick={handleInvestment}
              className="w-full terminal-border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              INVEST NOW [GET REQUEST - CSRF RISK]
            </Button>
          </div>
        </Card>
      </div>

      {/* Dangerous Operations */}
      <Card className="terminal-border bg-red-900/20 border-red-500 p-4">
        <div className="text-red-500 font-bold mb-4">DANGEROUS_OPERATIONS.EXE</div>
        <div className="space-y-4">
          <div className="text-red-400 text-sm">
            ⚠️ These operations are highly vulnerable to CSRF attacks
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <Button 
              onClick={handleBulkTransfer}
              disabled={isLoading}
              className="terminal-border border-red-500 bg-red-500 text-white hover:bg-red-600"
            >
              {isLoading ? 'PROCESSING...' : 'BULK TRANSFER [CSRF VULNERABLE]'}
            </Button>
            
            <Button 
              onClick={createMaliciousTransferForm}
              className="terminal-border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
            >
              CREATE MALICIOUS FORM [CSRF EXPLOIT]
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="terminal-border bg-secondary p-4">
        <div className="text-accent font-bold mb-4">TRANSACTION_HISTORY.LOG</div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-muted-foreground">No transactions yet</div>
          ) : (
            transactions.map((transaction, index) => (
              <div key={index} className="p-2 border border-primary text-sm">
                <div className="flex justify-between">
                  <span className="text-primary font-bold">{transaction.type.toUpperCase()}</span>
                  <span className="text-accent">€{transaction.amount}</span>
                </div>
                <div className="text-muted-foreground text-xs">{transaction.description}</div>
                <div className="text-muted-foreground text-xs">{transaction.timestamp}</div>
                {transaction.method && (
                  <Badge variant="outline" className="text-red-500 border-red-500 text-xs">
                    {transaction.method} REQUEST
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}