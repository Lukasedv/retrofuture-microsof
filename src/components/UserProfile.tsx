import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface UserProfile {
  username: string
  bio: string
  role: string
  expertise: string[]
  website: string
  avatar: string
}

export function UserProfile({ setCurrentScreen }: { setCurrentScreen: (screen: string) => void }) {
  const [profile, setProfile] = useState<UserProfile>({
    username: 'security_expert',
    bio: 'Microsoft Security specialist with 10+ years experience',
    role: 'Senior Security Engineer',
    expertise: ['Azure Security', 'Threat Detection', 'Incident Response'],
    website: 'https://securityblog.example.com',
    avatar: '🛡️'
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<UserProfile>(profile)

  // DOM-based XSS: Process URL fragment for profile customization
  useEffect(() => {
    const processUrlFragment = () => {
      const fragment = window.location.hash.substring(1)
      if (fragment) {
        try {
          // VULNERABILITY: Parsing URL fragment without validation
          const params = new URLSearchParams(fragment)
          const customBio = params.get('bio')
          const customRole = params.get('role')
          const customWebsite = params.get('website')
          
          if (customBio) {
            setProfile(prev => ({ ...prev, bio: decodeURIComponent(customBio) }))
          }
          if (customRole) {
            setProfile(prev => ({ ...prev, role: decodeURIComponent(customRole) }))
          }
          if (customWebsite) {
            setProfile(prev => ({ ...prev, website: decodeURIComponent(customWebsite) }))
          }
        } catch (e) {
          console.error('Error processing URL fragment:', e)
        }
      }
    }

    processUrlFragment()
    
    // Listen for hash changes (DOM-based XSS vector)
    window.addEventListener('hashchange', processUrlFragment)
    return () => window.removeEventListener('hashchange', processUrlFragment)
  }, [])

  const updateProfile = () => {
    setProfile(editForm)
    setIsEditing(false)
    
    // Update URL fragment with profile data (potential XSS source)
    const params = new URLSearchParams()
    params.set('bio', editForm.bio)
    params.set('role', editForm.role)
    params.set('website', editForm.website)
    window.location.hash = params.toString()
  }

  const resetProfile = () => {
    const defaultProfile: UserProfile = {
      username: 'security_expert',
      bio: 'Microsoft Security specialist with 10+ years experience',
      role: 'Senior Security Engineer',
      expertise: ['Azure Security', 'Threat Detection', 'Incident Response'],
      website: 'https://securityblog.example.com',
      avatar: '🛡️'
    }
    setProfile(defaultProfile)
    setEditForm(defaultProfile)
    window.location.hash = ''
  }

  // Unsafe function to render website link (DOM-based XSS)
  const renderWebsiteLink = (url: string) => {
    // VULNERABILITY: Creating DOM elements with user input
    const linkElement = document.createElement('div')
    linkElement.innerHTML = `<a href="${url}" target="_blank" class="text-accent hover:underline">${url}</a>`
    return linkElement.innerHTML
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">USER_PROFILE.DAT</h1>
        <Button 
          onClick={() => setCurrentScreen('main')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="text-accent font-bold terminal-text">
        &gt; MSUG MEMBER PROFILE - DOM XSS DEMONSTRATION
      </div>

      <Card className="terminal-border bg-destructive/10 border-destructive p-4">
        <div className="text-destructive font-bold mb-2">⚠️ DOM-BASED XSS VULNERABILITY</div>
        <div className="text-sm text-muted-foreground">
          This profile component processes URL fragments and user input without sanitization.
          Profile data can be manipulated through URL hash parameters.
        </div>
      </Card>

      {/* Profile display */}
      <Card className="terminal-border bg-card p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-6xl">{profile.avatar}</div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-accent mb-2">{profile.username}</div>
            <Badge className="bg-primary text-primary-foreground mb-4">
              {profile.role}
            </Badge>
            
            {/* VULNERABLE: Bio rendered with dangerouslySetInnerHTML */}
            <div 
              className="text-sm text-muted-foreground mb-4"
              dangerouslySetInnerHTML={{ __html: profile.bio }}
            />
            
            <div className="mb-4">
              <div className="text-accent font-bold mb-2">EXPERTISE:</div>
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* VULNERABLE: Website link created with innerHTML */}
            <div className="mb-4">
              <div className="text-accent font-bold mb-2">WEBSITE:</div>
              <div 
                dangerouslySetInnerHTML={{ __html: renderWebsiteLink(profile.website) }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            className="terminal-border bg-accent text-accent-foreground hover:bg-accent/80"
          >
            {isEditing ? 'CANCEL_EDIT.EXE' : 'EDIT_PROFILE.EXE'}
          </Button>
          <Button 
            onClick={resetProfile}
            variant="outline"
            className="terminal-border"
          >
            RESET_PROFILE.EXE
          </Button>
        </div>
      </Card>

      {/* Profile editing form */}
      {isEditing && (
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold mb-4">&gt; PROFILE_EDITOR.EXE</div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">BIO (HTML allowed):</label>
              <Input
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Enter your bio with HTML..."
                className="terminal-border"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">ROLE:</label>
              <Input
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Enter your role..."
                className="terminal-border"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">WEBSITE URL:</label>
              <Input
                value={editForm.website}
                onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                placeholder="Enter your website URL..."
                className="terminal-border"
              />
            </div>
            <Button 
              onClick={updateProfile}
              className="terminal-border bg-primary text-primary-foreground hover:bg-primary/80"
            >
              SAVE_PROFILE.EXE
            </Button>
          </div>
        </Card>
      )}

      {/* DOM-based XSS test vectors */}
      <Card className="terminal-border bg-destructive/10 border-destructive p-4">
        <div className="text-destructive font-bold mb-4">DOM_XSS_VECTORS.DAT</div>
        <div className="space-y-2 text-sm">
          <div className="text-muted-foreground">Try these DOM-based XSS payloads in URL hash:</div>
          <div className="font-mono text-xs space-y-1">
            <div>#{`bio=<script>alert('DOM XSS')</script>`}</div>
            <div>#{`bio=<img src="x" onerror="alert('Profile XSS')">`}</div>
            <div>#{`role=<svg onload="alert(document.domain)">`}</div>
            <div>#{`website=javascript:alert('Website XSS')`}</div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Add these to the current URL after # to test DOM-based XSS
          </div>
        </div>
      </Card>

      {/* Profile sharing with XSS risk */}
      <Card className="terminal-border bg-card p-4">
        <div className="text-accent font-bold mb-4">&gt; SHARE_PROFILE.EXE</div>
        <div className="text-sm text-muted-foreground mb-2">
          Share your profile with custom parameters:
        </div>
        <div className="font-mono text-xs p-2 bg-secondary rounded border">
          {window.location.origin + window.location.pathname}#bio={encodeURIComponent(profile.bio)}&role={encodeURIComponent(profile.role)}&website={encodeURIComponent(profile.website)}
        </div>
        <div className="text-xs text-destructive mt-2">
          ⚠️ Warning: This URL contains unvalidated user input that could execute scripts
        </div>
      </Card>
    </div>
  )
}