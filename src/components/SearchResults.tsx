import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  id: number
  title: string
  description: string
  url: string
  category: string
}

const mockResults: SearchResult[] = [
  {
    id: 1,
    title: "Microsoft Sentinel Documentation",
    description: "Comprehensive guide to Microsoft Sentinel SIEM solution",
    url: "https://docs.microsoft.com/azure/sentinel",
    category: "Documentation"
  },
  {
    id: 2,
    title: "Zero Trust Security Model",
    description: "Understanding Microsoft's Zero Trust approach",
    url: "https://docs.microsoft.com/security/zero-trust",
    category: "Security Framework"
  },
  {
    id: 3,
    title: "Azure AD Security Features",
    description: "Advanced authentication and authorization features",
    url: "https://docs.microsoft.com/azure/active-directory",
    category: "Identity"
  },
  {
    id: 4,
    title: "Microsoft Defender for Cloud",
    description: "Cloud security posture management and threat protection",
    url: "https://docs.microsoft.com/azure/defender-for-cloud",
    category: "Cloud Security"
  }
]

export function SearchResults({ setCurrentScreen }: { setCurrentScreen: (screen: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [results, setResults] = useState<SearchResult[]>([])

  // Get search query from URL parameters (DOM-based XSS vulnerability)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [])

  const performSearch = (query: string) => {
    if (query.trim()) {
      // Add to search history without sanitization
      setSearchHistory(prev => [query, ...prev.slice(0, 4)])
      
      // Filter results based on query
      const filtered = mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }

  const handleSearch = () => {
    performSearch(searchQuery)
    // Update URL with search query (potential for DOM-based XSS)
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set('q', searchQuery)
    window.history.pushState({}, '', newUrl.toString())
  }

  const clearSearch = () => {
    setSearchQuery('')
    setResults([])
    setSearchHistory([])
    // Clear URL parameters
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('q')
    window.history.pushState({}, '', newUrl.toString())
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">SEARCH_ENGINE.EXE</h1>
        <Button 
          onClick={() => setCurrentScreen('main')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="text-accent font-bold terminal-text">
        &gt; MSUG RESOURCE SEARCH - XSS DEMONSTRATION
      </div>

      <Card className="terminal-border bg-destructive/10 border-destructive p-4">
        <div className="text-destructive font-bold mb-2">⚠️ REFLECTED XSS VULNERABILITY</div>
        <div className="text-sm text-muted-foreground">
          This search component reflects user input without sanitization.
          Search queries are displayed directly in the DOM and can contain malicious scripts.
        </div>
      </Card>

      {/* Search input form */}
      <Card className="terminal-border bg-card p-4">
        <div className="text-accent font-bold mb-4">&gt; SEARCH_QUERY.EXE</div>
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search terms (try XSS payloads)..."
            className="terminal-border flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch}
            className="terminal-border bg-accent text-accent-foreground hover:bg-accent/80"
          >
            SEARCH
          </Button>
          <Button 
            onClick={clearSearch}
            variant="outline"
            className="terminal-border"
          >
            CLEAR
          </Button>
        </div>
      </Card>

      {/* Search query reflection - VULNERABLE to reflected XSS */}
      {searchQuery && (
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-primary font-bold mb-2">SEARCH_RESULTS.LOG</div>
          <div className="text-sm">
            {/* MAJOR REFLECTED XSS VULNERABILITY: Direct insertion of user input */}
            Showing results for: <span 
              className="text-accent font-bold"
              dangerouslySetInnerHTML={{ __html: searchQuery }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Found {results.length} matching resources
          </div>
        </Card>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id} className="terminal-border bg-secondary p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-primary font-bold">{result.title}</div>
                <Badge variant="outline" className="text-xs">
                  {result.category}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {result.description}
              </div>
              <div className="text-xs text-accent">
                {result.url}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Search history with XSS vulnerability */}
      {searchHistory.length > 0 && (
        <Card className="terminal-border bg-card p-4">
          <div className="text-accent font-bold mb-4">&gt; SEARCH_HISTORY.LOG</div>
          <div className="space-y-2">
            {searchHistory.map((query, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground w-8">#{index + 1}</div>
                {/* VULNERABLE: Search history also reflects without sanitization */}
                <div 
                  className="text-sm cursor-pointer hover:text-accent"
                  onClick={() => {
                    setSearchQuery(query)
                    performSearch(query)
                  }}
                  dangerouslySetInnerHTML={{ __html: query }}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* XSS test vectors */}
      <Card className="terminal-border bg-destructive/10 border-destructive p-4">
        <div className="text-destructive font-bold mb-4">REFLECTED_XSS_VECTORS.DAT</div>
        <div className="space-y-2 text-sm">
          <div className="text-muted-foreground">Try these reflected XSS payloads:</div>
          <div className="font-mono text-xs space-y-1">
            <div>&lt;script&gt;alert('Reflected XSS')&lt;/script&gt;</div>
            <div>&lt;img src="x" onerror="alert('Search XSS')"&gt;</div>
            <div>&lt;svg onload="confirm('Cookie: ' + document.cookie)"&gt;</div>
            <div>&lt;iframe src="javascript:alert(location.href)"&gt;</div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            You can also test by adding ?q=&lt;script&gt;alert('URL XSS')&lt;/script&gt; to the URL
          </div>
        </div>
      </Card>
    </div>
  )
}