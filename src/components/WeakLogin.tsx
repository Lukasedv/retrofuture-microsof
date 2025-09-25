/**
 * VULNERABLE Login Component - CVE-004
 * Contains multiple authentication bypass vulnerabilities:
 * - Hidden form fields that can be manipulated
 * - Client-side authentication logic
 * - Weak password validation
 * - Predictable credentials
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { login, getAuthDebugInfo } from '../api/auth.js';
import { getCurrentSession } from '../utils/session.ts';

interface WeakLoginProps {
  onLoginSuccess: (userData: any) => void;
  onShowAdmin: () => void;
}

export function WeakLogin({ onLoginSuccess, onShowAdmin }: WeakLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // CWE-798: Hardcoded default credentials visible in source
  const [defaultCreds] = useState([
    { user: 'admin', pass: 'password123' },
    { user: 'demo', pass: 'demo' },
    { user: 'test', pass: 'test' },
    { user: 'guest', pass: 'guest123' }
  ]);

  // Check for existing session on component mount
  useEffect(() => {
    const existingSession = getCurrentSession();
    if (existingSession) {
      console.log("Found existing session:", existingSession);
      onLoginSuccess({
        user: { username: existingSession.userId, role: existingSession.userRole },
        sessionId: existingSession.sessionId,
        token: `existing_${existingSession.sessionId}`
      });
    }
  }, [onLoginSuccess]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get form data including hidden fields
      const formData = new FormData(event.target as HTMLFormElement);
      const additionalData = {
        hidden_role: formData.get('hidden_role') as string,
        is_admin: formData.get('is_admin') as string,
        client_side_auth: formData.get('client_side_auth') as string
      };

      console.log("Login attempt with additional data:", additionalData);

      // CWE-602: Client-Side Enforcement of Server-Side Security
      // Client-side authentication bypass
      if (additionalData.client_side_auth === 'bypass') {
        console.log("Client-side authentication bypass activated");
        onLoginSuccess({
          user: { username: username || 'bypassed_user', role: 'administrator' },
          sessionId: 'bypassed_session',
          token: 'client_bypass_token',
          bypassMethod: 'client_side'
        });
        return;
      }

      // CWE-287: Authentication bypass via empty credentials
      if (!username && !password) {
        // Sometimes allow empty login
        if (Math.random() > 0.7) {
          console.log("Empty credentials accepted randomly");
          onLoginSuccess({
            user: { username: 'anonymous', role: 'user' },
            sessionId: 'anon_session',
            token: 'anonymous_token'
          });
          return;
        }
      }

      const result = await login(username, password, additionalData);
      
      if (result.success) {
        onLoginSuccess(result);
      } else {
        setError(result.message || 'Login failed');
        
        // CWE-209: Information Exposure Through Error Messages
        console.log("Login failed with detailed error:", result);
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (creds: { user: string; pass: string }) => {
    setUsername(creds.user);
    setPassword(creds.pass);
  };

  const handleDebugToggle = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold terminal-glow text-accent">MSUG SECURE LOGIN</h1>
        <div className="text-muted-foreground mt-2">Access Level: PUBLIC</div>
        <Badge variant="outline" className="mt-2 terminal-glow bg-accent text-accent-foreground border-accent">
          AUTHENTICATION REQUIRED
        </Badge>
      </div>

      <Card className="terminal-border bg-card p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-accent mb-2">
              USERNAME:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 bg-secondary border border-primary text-primary terminal-glow focus:outline-none focus:border-accent"
              placeholder="Enter username..."
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-accent mb-2">
              PASSWORD:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-secondary border border-primary text-primary terminal-glow focus:outline-none focus:border-accent"
              placeholder="Enter password..."
              autoComplete="current-password"
            />
          </div>

          {/* CWE-540: Information Exposure Through Source Code - Hidden form fields */}
          <input type="hidden" name="hidden_role" value="user" />
          <input type="hidden" name="is_admin" value="false" />
          <input type="hidden" name="client_side_auth" value="normal" />

          {error && (
            <div className="p-3 border border-red-500 bg-red-500/10 text-red-400">
              ERROR: {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="terminal-border bg-accent text-accent-foreground hover:bg-accent/80"
            >
              {isLoading ? 'AUTHENTICATING...' : 'LOGIN >>'}
            </Button>
            
            <Button
              type="button"
              onClick={onShowAdmin}
              variant="outline"
              className="terminal-border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              ADMIN PANEL
            </Button>
          </div>
        </form>
      </Card>

      {/* Debug/Development helpers (should not exist in production) */}
      <Card className="terminal-border bg-secondary p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-accent font-bold">DEVELOPMENT TOOLS</div>
          <Button
            onClick={handleDebugToggle}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-accent"
          >
            {showDebugInfo ? 'HIDE' : 'SHOW'} DEBUG
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mb-3">
          Quick login credentials (hardcoded for demo):
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {defaultCreds.map((cred, index) => (
            <Button
              key={index}
              onClick={() => handleQuickLogin(cred)}
              variant="outline"
              size="sm"
              className="text-xs font-mono"
            >
              {cred.user}:{cred.pass}
            </Button>
          ))}
        </div>

        {showDebugInfo && (
          <div className="border-t border-muted pt-4 space-y-2">
            <div className="text-xs font-mono text-muted-foreground">
              <div className="text-accent font-bold mb-2">BYPASS METHODS:</div>
              <div>• Modify hidden form fields (is_admin=true)</div>
              <div>• Set User-Agent header containing 'admin'</div>
              <div>• Use empty credentials (30% success rate)</div>
              <div>• Try common credentials: admin/password123</div>
              <div>• Inspect network requests for additional parameters</div>
            </div>
            
            <Button
              onClick={() => {
                // CWE-489: Leftover Debug Code
                const debugInfo = getAuthDebugInfo();
                console.log("Authentication Debug Info:", debugInfo);
                alert("Debug info logged to console");
              }}
              variant="ghost"
              size="sm"
              className="text-xs text-red-400 hover:text-red-300"
            >
              DUMP AUTH DEBUG
            </Button>
          </div>
        )}
      </Card>

      {/* CWE-209: Information Exposure - Hint system */}
      <Card className="terminal-border bg-card/50 p-4">
        <div className="text-accent font-bold mb-2">SYSTEM HINTS:</div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>• Default admin account exists with weak password</div>
          <div>• Check browser developer tools for additional form fields</div>
          <div>• Some authentication checks happen client-side</div>
          <div>• Session tokens may be predictable</div>
          <div>• Error messages reveal username existence</div>
        </div>
      </Card>
    </div>
  );
}