import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  department: string
  salary?: number
  social_security?: string
  phone?: string
  address?: string
  hire_date?: string
}

interface SearchResponse {
  success: boolean
  employees: Employee[]
  query: string
  error?: string
  details?: string
}

export function EmployeeSearch({ setCurrentScreen }: { setCurrentScreen: (screen: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`http://localhost:3001/api/employees/search?name=${encodeURIComponent(searchTerm)}`)
      const data: SearchResponse = await response.json()
      
      if (data.success) {
        setResults(data.employees)
        setQuery(data.query)
      } else {
        setError(data.error || 'Search failed')
        setQuery(data.query || '')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">EMPLOYEE_SEARCH.EXE</h1>
        <Button 
          onClick={() => setCurrentScreen('security')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="space-y-4 terminal-text">
        <div className="text-accent font-bold">&gt; EMPLOYEE DATABASE SEARCH</div>
        <div className="text-sm text-muted-foreground">
          ⚠️ WARNING: This search functionality contains intentional SQL injection vulnerabilities for security testing
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter employee name..."
            className="flex-1 bg-background border border-primary text-primary px-3 py-2 terminal-border focus:ring-2 focus:ring-accent"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="terminal-border border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            {isLoading ? 'SEARCHING...' : 'SEARCH'}
          </Button>
        </div>

        {query && (
          <div className="mt-4 p-3 border border-accent bg-accent/10">
            <div className="text-accent font-bold mb-2">SQL QUERY EXECUTED:</div>
            <code className="text-sm text-primary">{query}</code>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 border border-destructive bg-destructive/10">
            <div className="text-destructive font-bold">ERROR:</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6">
            <div className="text-accent font-bold mb-4">&gt; SEARCH RESULTS ({results.length} found)</div>
            <div className="space-y-3">
              {results.map((employee) => (
                <Card key={employee.id} className="p-4 border-primary bg-secondary/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-accent">ID:</span> {employee.id}</div>
                    <div><span className="text-accent">Name:</span> {employee.first_name} {employee.last_name}</div>
                    <div><span className="text-accent">Email:</span> {employee.email}</div>
                    <div><span className="text-accent">Department:</span> {employee.department}</div>
                    {employee.salary && (
                      <div><span className="text-accent">Salary:</span> €{employee.salary}</div>
                    )}
                    {employee.social_security && (
                      <div><span className="text-destructive">SSN:</span> {employee.social_security}</div>
                    )}
                    {employee.phone && (
                      <div><span className="text-accent">Phone:</span> {employee.phone}</div>
                    )}
                    {employee.address && (
                      <div><span className="text-accent">Address:</span> {employee.address}</div>
                    )}
                    {employee.hire_date && (
                      <div><span className="text-accent">Hire Date:</span> {employee.hire_date}</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 border border-accent bg-accent/10">
          <div className="text-accent font-bold mb-2">VULNERABILITY EXAMPLES:</div>
          <div className="space-y-2 text-sm font-mono">
            <div>• Basic injection: <code>Smith' OR '1'='1</code></div>
            <div>• Union injection: <code>Smith' UNION SELECT id,username,password,email,role,created_at,created_at,created_at,created_at FROM users --</code></div>
            <div>• Comment injection: <code>Smith' --</code></div>
          </div>
        </div>
      </div>
    </div>
  )
}