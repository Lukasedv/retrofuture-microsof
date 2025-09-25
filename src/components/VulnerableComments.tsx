import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Comment {
  id: number
  username: string
  content: string
  timestamp: string
}

export function VulnerableComments({ setCurrentScreen }: { setCurrentScreen: (screen: string) => void }) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      username: "admin",
      content: "Welcome to the MSUG comment system! Share your security insights.",
      timestamp: "2024-01-15 10:30:00"
    },
    {
      id: 2,
      username: "security_researcher",
      content: "Great meetup last month! Looking forward to the next one.",
      timestamp: "2024-01-16 14:22:00"
    },
    {
      id: 3,
      username: "hacker123",
      content: "<script>alert('Stored XSS - Your cookies: ' + document.cookie)</script>",
      timestamp: "2024-01-17 09:15:00"
    }
  ])
  
  const [newComment, setNewComment] = useState('')
  const [username, setUsername] = useState('')

  const addComment = () => {
    if (newComment.trim() && username.trim()) {
      const comment: Comment = {
        id: Date.now(),
        username: username,
        content: newComment, // VULNERABILITY: No sanitization of user input
        timestamp: new Date().toLocaleString()
      }
      setComments([...comments, comment])
      setNewComment('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">COMMENT_SYSTEM.EXE</h1>
        <Button 
          onClick={() => setCurrentScreen('main')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="text-accent font-bold terminal-text">
        &gt; COMMUNITY DISCUSSION BOARD - XSS DEMONSTRATION
      </div>

      <Card className="terminal-border bg-secondary p-4">
        <div className="text-destructive font-bold mb-2">⚠️ SECURITY WARNING</div>
        <div className="text-sm text-muted-foreground">
          This comment system contains intentional XSS vulnerabilities for educational purposes.
          User input is not sanitized and can contain malicious scripts.
        </div>
      </Card>

      {/* Comment input form */}
      <Card className="terminal-border bg-card p-4">
        <div className="text-accent font-bold mb-4">&gt; POST_COMMENT.EXE</div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">USERNAME:</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              className="terminal-border"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">COMMENT:</label>
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment (HTML/JS allowed)..."
              className="terminal-border"
            />
          </div>
          <Button 
            onClick={addComment}
            className="terminal-border bg-accent text-accent-foreground hover:bg-accent/80"
          >
            SUBMIT_COMMENT.EXE
          </Button>
        </div>
      </Card>

      {/* Comments display with VULNERABLE dangerouslySetInnerHTML */}
      <div className="space-y-4">
        <div className="text-accent font-bold">&gt; COMMENTS.LOG</div>
        {comments.map((comment) => (
          <Card key={comment.id} className="terminal-border bg-secondary p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-primary font-bold">{comment.username}</div>
              <Badge variant="outline" className="text-xs">
                {comment.timestamp}
              </Badge>
            </div>
            {/* MAJOR XSS VULNERABILITY: Using dangerouslySetInnerHTML without sanitization */}
            <div 
              className="text-sm terminal-text"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </Card>
        ))}
      </div>

      {/* XSS Examples section */}
      <Card className="terminal-border bg-destructive/10 border-destructive p-4">
        <div className="text-destructive font-bold mb-4">XSS_TEST_VECTORS.DAT</div>
        <div className="space-y-2 text-sm">
          <div className="text-muted-foreground">Try these XSS payloads in the comment field:</div>
          <div className="font-mono text-xs space-y-1">
            <div>&lt;script&gt;alert('Basic XSS')&lt;/script&gt;</div>
            <div>&lt;img src="x" onerror="alert('Image XSS')"&gt;</div>
            <div>&lt;svg onload="alert('SVG XSS')"&gt;&lt;/svg&gt;</div>
            <div>&lt;script&gt;alert(document.cookie)&lt;/script&gt;</div>
            <div>&lt;iframe src="javascript:alert('Iframe XSS')"&gt;&lt;/iframe&gt;</div>
          </div>
        </div>
      </Card>
    </div>
  )
}