/**
 * VULNERABLE Admin Panel - CVE-004  
 * Contains multiple authorization bypass vulnerabilities:
 * - Accessible without proper authentication
 * - Missing access controls
 * - Sensitive information exposure
 * - Admin functions available via URL manipulation
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  getSystemConfig, 
  getUserData, 
  getAdminDashboard, 
  getSensitiveData, 
  getSystemLogs,
  manageUser,
  getAdminDebugInfo 
} from '../api/admin.js';
import { getCurrentSession } from '../utils/session.ts';

interface AdminPanelProps {
  userData?: any;
  onBack: () => void;
}

export function AdminPanel({ userData, onBack }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [adminData, setAdminData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bypassMethod, setBypassMethod] = useState('');

  // CWE-285: Missing Access Control - Component loads without proper auth check
  useEffect(() => {
    console.log("Admin panel accessed with userData:", userData);
    
    // Vulnerability: Weak authorization check
    if (!userData) {
      // Try to get session from storage
      const session = getCurrentSession();
      if (session) {
        console.log("Using session data for admin access:", session);
      } else {
        // Still allow access - major vulnerability
        console.log("No authentication found, but allowing admin access anyway");
        setBypassMethod("No authentication required");
      }
    }
    
    // Load dashboard by default
    loadAdminData('dashboard');
  }, [userData]);

  const loadAdminData = async (section: string) => {
    setIsLoading(true);
    setError('');
    setActiveSection(section);

    try {
      let result;
      const token = userData?.token || 'admin_bypass_token';
      const sessionId = userData?.sessionId || 'bypass_session';

      switch (section) {
        case 'dashboard':
          result = await getAdminDashboard(token, sessionId);
          break;
        case 'users':
          result = await getUserData(token, sessionId);
          break;
        case 'config':
          result = await getSystemConfig(token, sessionId);
          break;
        case 'sensitive':
          result = await getSensitiveData(token, sessionId);
          break;
        case 'logs':
          result = await getSystemLogs(token, sessionId);
          break;
        case 'debug':
          result = { success: true, data: getAdminDebugInfo() };
          break;
        default:
          result = { success: false, message: 'Unknown section' };
      }

      if (result.success) {
        setAdminData(result);
      } else {
        setError(result.message || 'Failed to load admin data');
      }
    } catch (err) {
      setError('An error occurred while loading admin data');
      console.error('Admin data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (action: string, userInfo?: any) => {
    try {
      const token = userData?.token || 'admin_bypass_token';
      const sessionId = userData?.sessionId || 'bypass_session';
      
      const result = await manageUser(token, sessionId, action, userInfo);
      
      if (result.success) {
        console.log(`User ${action} successful:`, result);
        // Reload users data
        loadAdminData('users');
      } else {
        setError(result.message || `Failed to ${action} user`);
      }
    } catch (err) {
      setError(`Error during user ${action}`);
      console.error('User management error:', err);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="text-accent font-bold text-xl">SYSTEM DASHBOARD</div>
      
      {adminData?.dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="terminal-border bg-secondary p-4">
            <div className="text-primary font-bold mb-2">SYSTEM STATUS</div>
            <div>Total Users: {adminData.dashboard.totalUsers}</div>
            <div>Active Users: {adminData.dashboard.activeUsers}</div>
            <div>Status: <Badge className="bg-green-500">{adminData.dashboard.systemStatus}</Badge></div>
            <div>Last Backup: {adminData.dashboard.lastBackup}</div>
          </Card>

          <Card className="terminal-border bg-secondary p-4">
            <div className="text-primary font-bold mb-2">SENSITIVE METRICS</div>
            <div>Failed Logins: {adminData.dashboard.sensitiveMetrics?.failedLogins}</div>
            <div>Suspicious Activity: {adminData.dashboard.sensitiveMetrics?.suspiciousActivity}</div>
            <div>Admin Actions: {adminData.dashboard.sensitiveMetrics?.adminActions}</div>
          </Card>

          <Card className="terminal-border bg-secondary p-4 md:col-span-2">
            <div className="text-primary font-bold mb-2">RECENT ERROR LOGS</div>
            <div className="space-y-1 text-sm font-mono">
              {adminData.dashboard.errorLogs?.map((log: string, index: number) => (
                <div key={index} className="text-red-400">{log}</div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-accent font-bold text-xl">USER MANAGEMENT</div>
        <div className="space-x-2">
          <Button
            onClick={() => handleUserAction('create', { username: 'newuser', email: 'new@msug.fi', role: 'user' })}
            variant="outline"
            className="text-xs"
          >
            CREATE USER
          </Button>
        </div>
      </div>
      
      {adminData?.users && (
        <div className="space-y-4">
          {adminData.users.map((user: any) => (
            <Card key={user.id} className="terminal-border bg-secondary p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-primary font-bold">{user.username}</div>
                  <div className="text-sm">ID: {user.id} | Email: {user.email}</div>
                  <Badge variant={user.role === 'administrator' ? 'default' : 'outline'}>
                    {user.role}
                  </Badge>
                </div>
                <div className="space-x-2">
                  <Button
                    onClick={() => handleUserAction('promote', { userId: user.id })}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    PROMOTE
                  </Button>
                  <Button
                    onClick={() => handleUserAction('delete', { userId: user.id })}
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    DELETE
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSensitiveData = () => (
    <div className="space-y-6">
      <div className="text-accent font-bold text-xl">SENSITIVE DATA ACCESS</div>
      <div className="text-red-400 text-sm">⚠️ WARNING: This section contains highly sensitive information</div>
      
      {adminData?.data && (
        <div className="space-y-4">
          {adminData.data.apiKeys && (
            <Card className="terminal-border bg-red-900/20 p-4">
              <div className="text-red-400 font-bold mb-2">API KEYS</div>
              <div className="font-mono text-sm space-y-1">
                {Object.entries(adminData.data.apiKeys).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-accent">{key}:</span> {value as string}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {adminData.data.financialInfo && (
            <Card className="terminal-border bg-red-900/20 p-4">
              <div className="text-red-400 font-bold mb-2">FINANCIAL INFORMATION</div>
              <div className="font-mono text-sm space-y-1">
                {Object.entries(adminData.data.financialInfo).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-accent">{key}:</span> {value as string}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderSystemConfig = () => (
    <div className="space-y-6">
      <div className="text-accent font-bold text-xl">SYSTEM CONFIGURATION</div>
      
      {adminData?.config && (
        <Card className="terminal-border bg-secondary p-4">
          <div className="font-mono text-sm space-y-2">
            {Object.entries(adminData.config).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-accent">{key}:</span>
                <span className="text-primary">{value as string}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderSystemLogs = () => (
    <div className="space-y-6">
      <div className="text-accent font-bold text-xl">SYSTEM LOGS</div>
      
      {adminData?.logs && (
        <div className="space-y-4">
          {Object.entries(adminData.logs).map(([logType, logs]) => (
            <Card key={logType} className="terminal-border bg-secondary p-4">
              <div className="text-primary font-bold mb-2">{logType.toUpperCase()} LOGS</div>
              <div className="font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                {(logs as string[]).map((log, index) => (
                  <div key={index} className="text-muted-foreground">{log}</div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold terminal-glow text-red-400">ADMIN CONTROL PANEL</h1>
          <div className="text-sm text-muted-foreground">
            Access Level: {userData?.user?.role || 'UNKNOWN'} 
            {bypassMethod && ` (${bypassMethod})`}
          </div>
        </div>
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      {/* CWE-285: Missing authorization warning */}
      {!userData && (
        <Card className="terminal-border bg-red-900/20 p-4">
          <div className="text-red-400 font-bold">⚠️ SECURITY WARNING</div>
          <div className="text-sm text-red-300">
            Admin panel accessed without proper authentication. This is a critical security vulnerability.
          </div>
        </Card>
      )}

      {/* Navigation */}
      <Card className="terminal-border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'dashboard', label: 'DASHBOARD' },
            { key: 'users', label: 'USERS' },
            { key: 'config', label: 'CONFIG' },
            { key: 'sensitive', label: 'SENSITIVE' },
            { key: 'logs', label: 'LOGS' },
            { key: 'debug', label: 'DEBUG' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              onClick={() => loadAdminData(key)}
              variant={activeSection === key ? 'default' : 'outline'}
              size="sm"
              className={`text-xs ${activeSection === key ? 'bg-accent text-accent-foreground' : ''}`}
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Content */}
      <Card className="terminal-border bg-card p-6">
        {isLoading && (
          <div className="text-center text-accent">LOADING ADMIN DATA...</div>
        )}

        {error && (
          <div className="p-3 border border-red-500 bg-red-500/10 text-red-400 mb-4">
            ERROR: {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'users' && renderUsers()}
            {activeSection === 'config' && renderSystemConfig()}
            {activeSection === 'sensitive' && renderSensitiveData()}
            {activeSection === 'logs' && renderSystemLogs()}
            {activeSection === 'debug' && (
              <div className="space-y-4">
                <div className="text-accent font-bold text-xl">DEBUG INFORMATION</div>
                <pre className="bg-secondary p-4 rounded text-xs font-mono overflow-auto">
                  {JSON.stringify(adminData?.data, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Footer with vulnerability hints */}
      <Card className="terminal-border bg-card/50 p-4">
        <div className="text-accent font-bold mb-2">ADMIN PANEL VULNERABILITIES:</div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>• Accessible without proper authentication</div>
          <div>• No access control on sensitive functions</div>
          <div>• Exposes system configuration and secrets</div>
          <div>• User management without authorization</div>
          <div>• System logs contain sensitive information</div>
          <div>• Debug endpoint reveals internal structure</div>
        </div>
      </Card>
    </div>
  );
}