// CVE-005: IDOR Vulnerability - Transaction history vulnerable to IDOR
// This component demonstrates insecure financial transaction access

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getTransaction, getUserTransactions, getAllTransactions, getFinancialSummary } from '../api/transactions.js';

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  description: string;
  accountNumber: string;
  recipientName: string;
  date: string;
  status: string;
  category: string;
}

interface FinancialSummary {
  userId: number;
  totalIncome: number;
  totalExpenses: number;
  pendingAmount: number;
  transactionCount: number;
  accountNumbers: string[];
}

interface Props {
  setCurrentScreen: (screen: string) => void;
}

export default function TransactionHistory({ setCurrentScreen }: Props) {
  const [transactionId, setTransactionId] = useState('2001');
  const [userId, setUserId] = useState('1');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'user' | 'all' | 'summary'>('single');

  const loadTransaction = async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      // VULNERABILITY: Direct API call with user-controlled transaction ID
      const result = getTransaction(id);
      
      if (result.error) {
        setError(result.error);
        setTransaction(null);
      } else {
        setTransaction(result.transaction);
      }
    } catch (err) {
      setError('Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  const loadUserTransactions = async (uid: string) => {
    setLoading(true);
    setError('');
    
    try {
      // VULNERABILITY: Any user can access any other user's financial history
      const result = getUserTransactions(uid);
      
      if (result.success) {
        setUserTransactions(result.transactions);
      } else {
        setError('Failed to load user transactions');
      }
    } catch (err) {
      setError('Failed to load user transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadAllTransactions = () => {
    setLoading(true);
    
    try {
      // VULNERABILITY: Exposes all financial transactions across organization
      const result = getAllTransactions();
      
      if (result.success) {
        setAllTransactions(result.transactions);
      }
    } catch (err) {
      setError('Failed to load all transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialSummary = async (uid: string) => {
    setLoading(true);
    setError('');
    
    try {
      // VULNERABILITY: Financial summaries accessible for any user
      const result = getFinancialSummary(uid);
      
      if (result.success) {
        setFinancialSummary(result.summary);
      } else {
        setError('Failed to load financial summary');
      }
    } catch (err) {
      setError('Failed to load financial summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'single') {
      loadTransaction(transactionId);
    } else if (viewMode === 'user') {
      loadUserTransactions(userId);
    } else if (viewMode === 'all') {
      loadAllTransactions();
    } else if (viewMode === 'summary') {
      loadFinancialSummary(userId);
    }
  }, [transactionId, userId, viewMode]);

  const handleTransactionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionId(e.target.value);
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  const getUserName = (uid: number) => {
    const userNames: {[key: number]: string} = {
      1: 'admin',
      2: 'john_doe',
      3: 'jane_smith',
      4: 'security_officer'
    };
    return userNames[uid] || 'unknown';
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500' : 'bg-yellow-500';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'salary': return 'bg-blue-500';
      case 'bonus': return 'bg-green-500';
      case 'expense': return 'bg-red-500';
      case 'expense_reimbursement': return 'bg-purple-500';
      case 'vendor_payment': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('fi-FI', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">TRANSACTION_HISTORY.EXE</h1>
        <Button 
          onClick={() => setCurrentScreen('main')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="terminal-text space-y-4">
        <div className="text-accent font-bold">&gt; FINANCIAL TRANSACTION SYSTEM</div>
        <div className="text-sm text-muted-foreground">
          VULNERABILITY: Financial data accessible via ID manipulation without authorization
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={() => setViewMode('single')}
            variant={viewMode === 'single' ? 'default' : 'outline'}
            className="terminal-border"
          >
            SINGLE TRANSACTION
          </Button>
          <Button 
            onClick={() => setViewMode('user')}
            variant={viewMode === 'user' ? 'default' : 'outline'}
            className="terminal-border"
          >
            USER HISTORY
          </Button>
          <Button 
            onClick={() => setViewMode('summary')}
            variant={viewMode === 'summary' ? 'default' : 'outline'}
            className="terminal-border"
          >
            FINANCIAL SUMMARY
          </Button>
          <Button 
            onClick={() => setViewMode('all')}
            variant={viewMode === 'all' ? 'default' : 'outline'}
            className="terminal-border border-red-500 text-red-400"
          >
            ALL TRANSACTIONS
          </Button>
        </div>

        {viewMode === 'single' && (
          <div className="flex gap-4 items-center">
            <label className="text-primary">TRANSACTION_ID:</label>
            <Input 
              value={transactionId}
              onChange={handleTransactionIdChange}
              placeholder="Enter transaction ID (2001-2008)"
              className="w-48 terminal-border"
              type="number"
              min="2000"
              max="3000"
            />
            <Button 
              onClick={() => loadTransaction(transactionId)}
              className="terminal-border border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              disabled={loading}
            >
              {loading ? 'LOADING...' : 'ACCESS'}
            </Button>
          </div>
        )}

        {(viewMode === 'user' || viewMode === 'summary') && (
          <div className="flex gap-4 items-center">
            <label className="text-primary">USER_ID:</label>
            <Input 
              value={userId}
              onChange={handleUserIdChange}
              placeholder="Enter user ID (1-4)"
              className="w-32 terminal-border"
              type="number"
              min="1"
              max="10"
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => setUserId('1')}
                variant="outline"
                size="sm"
                className="terminal-border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                ADMIN (1)
              </Button>
              <Button 
                onClick={() => setUserId('2')}
                variant="outline"
                size="sm"
                className="terminal-border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                JOHN (2)
              </Button>
              <Button 
                onClick={() => setUserId('3')}
                variant="outline"
                size="sm"
                className="terminal-border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                JANE (3)
              </Button>
              <Button 
                onClick={() => setUserId('4')}
                variant="outline"
                size="sm"
                className="terminal-border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                SECURITY (4)
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Card className="terminal-border bg-red-900/20 border-red-500">
          <CardContent className="p-4">
            <div className="text-red-400">ERROR: {error}</div>
          </CardContent>
        </Card>
      )}

      {/* Single Transaction View */}
      {viewMode === 'single' && transaction && (
        <Card className="terminal-border bg-secondary">
          <CardHeader>
            <CardTitle className="text-accent">TRANSACTION #{transaction.id}</CardTitle>
            <div className="flex gap-2">
              <Badge className={getTypeColor(transaction.type)}>
                {transaction.type.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="border-primary text-primary">
                User: {getUserName(transaction.userId)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 terminal-text">
            <div><span className="text-primary">AMOUNT:</span> <span className="text-green-400 font-bold">{formatCurrency(transaction.amount)}</span></div>
            <div><span className="text-primary">DESCRIPTION:</span> {transaction.description}</div>
            <div><span className="text-primary">DATE:</span> {transaction.date}</div>
            <div><span className="text-primary">CATEGORY:</span> {transaction.category}</div>
            
            <Separator className="bg-primary/20" />
            
            <div className="border border-red-500 bg-red-900/20 p-3 rounded">
              <div className="text-red-400 font-bold">💳 SENSITIVE FINANCIAL DATA EXPOSED</div>
              <div><span className="text-red-300">ACCOUNT NUMBER:</span> {transaction.accountNumber}</div>
              <div><span className="text-red-300">RECIPIENT NAME:</span> {transaction.recipientName}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Transactions View */}
      {viewMode === 'user' && userTransactions.length > 0 && (
        <Card className="terminal-border bg-secondary">
          <CardHeader>
            <CardTitle className="text-accent">TRANSACTION HISTORY - USER #{userId}</CardTitle>
            <div className="text-sm text-red-400">⚠️ Accessing financial history for: {getUserName(parseInt(userId))}</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {userTransactions.map((tx) => (
              <div key={tx.id} className="border border-primary/20 p-3 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(tx.type)}>{tx.type}</Badge>
                    <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                  </div>
                  <span className="text-green-400 font-bold">{formatCurrency(tx.amount)}</span>
                </div>
                <div className="text-sm space-y-1">
                  <div><span className="text-primary">ID:</span> {tx.id}</div>
                  <div><span className="text-primary">Description:</span> {tx.description}</div>
                  <div><span className="text-primary">Date:</span> {tx.date}</div>
                  <div className="text-red-300"><span className="text-red-300">Account:</span> {tx.accountNumber}</div>
                  <div className="text-red-300"><span className="text-red-300">Recipient:</span> {tx.recipientName}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Financial Summary View */}
      {viewMode === 'summary' && financialSummary && (
        <Card className="terminal-border bg-secondary">
          <CardHeader>
            <CardTitle className="text-accent">FINANCIAL SUMMARY - USER #{financialSummary.userId}</CardTitle>
            <div className="text-sm text-red-400">⚠️ Complete financial overview for: {getUserName(financialSummary.userId)}</div>
          </CardHeader>
          <CardContent className="space-y-4 terminal-text">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-green-500 bg-green-900/20 p-3 rounded">
                <div className="text-green-400 font-bold">TOTAL INCOME</div>
                <div className="text-2xl text-green-300">{formatCurrency(financialSummary.totalIncome)}</div>
              </div>
              <div className="border border-red-500 bg-red-900/20 p-3 rounded">
                <div className="text-red-400 font-bold">TOTAL EXPENSES</div>
                <div className="text-2xl text-red-300">{formatCurrency(financialSummary.totalExpenses)}</div>
              </div>
            </div>
            
            <div className="border border-yellow-500 bg-yellow-900/20 p-3 rounded">
              <div className="text-yellow-400 font-bold">PENDING AMOUNT</div>
              <div className="text-xl text-yellow-300">{formatCurrency(financialSummary.pendingAmount)}</div>
            </div>
            
            <div>
              <div className="text-primary font-bold">TRANSACTION COUNT: {financialSummary.transactionCount}</div>
            </div>
            
            <Separator className="bg-primary/20" />
            
            <div className="border border-red-500 bg-red-900/20 p-3 rounded">
              <div className="text-red-400 font-bold">🏦 ASSOCIATED BANK ACCOUNTS</div>
              {financialSummary.accountNumbers.map((account, index) => (
                <div key={index} className="text-red-300">{account}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Transactions View */}
      {viewMode === 'all' && allTransactions.length > 0 && (
        <Card className="terminal-border bg-red-900/20 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-400">🚨 ALL ORGANIZATIONAL TRANSACTIONS 🚨</CardTitle>
            <div className="text-sm text-red-300">CRITICAL VULNERABILITY: Complete financial database exposed</div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {allTransactions.map((tx) => (
              <div key={tx.id} className="border border-red-500/50 p-2 rounded text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Badge className={getTypeColor(tx.type)} size="sm">{tx.type}</Badge>
                    <span className="text-primary">ID: {tx.id}</span>
                    <span>User: {getUserName(tx.userId)}</span>
                  </div>
                  <span className="text-green-400 font-bold">{formatCurrency(tx.amount)}</span>
                </div>
                <div className="text-muted-foreground">{tx.description}</div>
                <div className="text-red-300 text-xs">{tx.date}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 border border-red-500 bg-red-900/10">
        <div className="text-red-400 font-bold">SECURITY VULNERABILITY DETECTED</div>
        <div className="text-red-300 text-sm mt-2">
          This interface demonstrates Insecure Direct Object References (IDOR) in financial systems. 
          Users can access any transaction, view complete financial histories of other users, 
          and access sensitive banking information by manipulating transaction and user IDs.
        </div>
        <div className="text-red-300 text-sm mt-1">
          <strong>CVE Classification:</strong> CWE-639 (Authorization Bypass Through User-Controlled Key), CWE-284 (Improper Access Control)
        </div>
        <div className="text-red-300 text-sm mt-1">
          <strong>Impact:</strong> Complete financial privacy breach, salary disclosure, banking information exposure
        </div>
      </div>
    </div>
  );
}