import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface LoginResponse {
  success: boolean
  message: string
  user?: {
    id: number
    username: string
    email: string
    role: string
  }
  query: string
  error?: string
  details?: string
}

export function VulnerableLogin({ setCurrentScreen }: { setCurrentScreen: (screen: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<LoginResponse | null>(null)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return

    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })
      
      const data: LoginResponse = await response.json()
      setResult(data)
    } catch (err) {
      setResult({
        success: false,
        message: 'Failed to connect to server',
        query: ''
      })
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">AUTH_LOGIN.EXE</h1>
        <Button 
          onClick={() => setCurrentScreen('security')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="space-y-6 terminal-text">
        <div className="text-accent font-bold">&gt; AUTHENTICATION SYSTEM</div>
        <div className="text-sm text-muted-foreground">
          ⚠️ WARNING: This login system contains intentional SQL injection vulnerabilities for security testing
        </div>
        
        <Card className="p-6 border-primary bg-secondary/50 max-w-md">
          <div className="space-y-4">
            <div>
              <label className="block text-accent font-bold mb-2">USERNAME:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter username..."
                className="w-full bg-background border border-primary text-primary px-3 py-2 terminal-border focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <div>
              <label className="block text-accent font-bold mb-2">PASSWORD:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter password..."
                className="w-full bg-background border border-primary text-primary px-3 py-2 terminal-border focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <Button 
              onClick={handleLogin} 
              disabled={isLoading}
              className="w-full terminal-border border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
            </Button>
          </div>
        </Card>

        {result && (
          <div className="space-y-4">
            <div className="p-3 border border-accent bg-accent/10">
              <div className="text-accent font-bold mb-2">SQL QUERY EXECUTED:</div>
              <code className="text-sm text-primary break-all">{result.query}</code>
            </div>

            <div className={`p-4 border ${result.success ? 'border-accent bg-accent/10' : 'border-destructive bg-destructive/10'}`}>
              <div className={`font-bold mb-2 ${result.success ? 'text-accent' : 'text-destructive'}`}>
                {result.success ? 'LOGIN SUCCESSFUL' : 'LOGIN FAILED'}
              </div>
              <div className="text-sm mb-2">{result.message}</div>
              
              {result.user && (
                <div className="mt-3 space-y-1 text-sm">
                  <div><span className="text-accent">User ID:</span> {result.user.id}</div>
                  <div><span className="text-accent">Username:</span> {result.user.username}</div>
                  <div><span className="text-accent">Email:</span> {result.user.email}</div>
                  <div><span className="text-accent">Role:</span> {result.user.role}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-accent bg-accent/10">
            <div className="text-accent font-bold mb-2">VALID CREDENTIALS:</div>
            <div className="space-y-1 text-sm font-mono">
              <div>admin / admin123</div>
              <div>jsmith / password123</div>
              <div>mwilson / welcome2023</div>
              <div>bjenkins / qwerty456</div>
            </div>
          </div>

          <div className="p-4 border border-accent bg-accent/10">
            <div className="text-accent font-bold mb-2">INJECTION EXAMPLES:</div>
            <div className="space-y-2 text-sm font-mono">
              <div>Username: <code>admin' --</code></div>
              <div>Username: <code>' OR '1'='1' --</code></div>
              <div>Username: <code>' OR 1=1 --</code></div>
              <div>Password: <code>(anything)</code></div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 border border-destructive bg-destructive/10">
          <div className="text-destructive font-bold mb-2">SECURITY NOTICE:</div>
          <div className="text-sm">
            This authentication system is intentionally vulnerable to demonstrate SQL injection attacks. 
            In production systems, always use parameterized queries and proper input validation.
          </div>
        </div>
      </div>
    </div>
  )
}