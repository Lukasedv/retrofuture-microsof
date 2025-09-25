import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { VulnerableComments } from '@/components/VulnerableComments'
import { SearchResults } from '@/components/SearchResults'
import { UserProfile } from '@/components/UserProfile'

function App() {
  const [isBooted, setIsBooted] = useState(false)
  const [currentScreen, setCurrentScreen] = useKV('msug-current-screen', 'main')
  const [bootStep, setBootStep] = useState(0)

  const bootMessages = [
    'SYSTEM INITIALIZING...',
    'CONNECTING TO SECURE CHANNEL...',
    'CONNECTION ESTABLISHED',
    'ACCESS LEVEL: AUTHORIZED',
    'SECURITY CLEARANCE: VERIFIED',
    'WELCOME TO MSUG #10'
  ]

  useEffect(() => {
    if (!isBooted) {
      const timer = setInterval(() => {
        setBootStep(prev => {
          if (prev >= bootMessages.length - 1) {
            clearInterval(timer)
            setTimeout(() => setIsBooted(true), 1000)
            return prev
          }
          return prev + 1
        })
      }, 600)
      return () => clearInterval(timer)
    }
  }, [isBooted])

  if (!isBooted) {
    return (
      <div className="min-h-screen bg-background p-4 scanlines">
        <Card className="terminal-border bg-card min-h-[600px] p-6">
          <div className="mb-4 flex justify-between items-center text-sm">
            <span className="terminal-glow">MSUG FINLAND SECURE TERMINAL - SCREEN 1/4</span>
            <Badge variant="outline" className="terminal-glow bg-accent text-accent-foreground border-accent">
              SECURE CONNECTION ACTIVE
            </Badge>
          </div>
          
          <div className="mt-20 space-y-4">
            {bootMessages.slice(0, bootStep + 1).map((message, index) => (
              <div 
                key={index} 
                className={`terminal-text ${index === bootStep ? 'terminal-glow' : 'text-muted-foreground'}`}
              >
                {index < bootStep && '✓ '}{message}
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return <MainTerminal currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
}

function MainTerminal({ currentScreen, setCurrentScreen }: { 
  currentScreen: string | undefined, 
  setCurrentScreen: (screen: string) => void 
}) {
  return (
    <div className="min-h-screen bg-background p-4 scanlines">
      <Card className="terminal-border bg-card min-h-[600px] p-6">
        <div className="mb-4 flex justify-between items-center text-sm">
          <span className="terminal-glow">MSUG FINLAND SECURE TERMINAL - SCREEN 1/4</span>
          <Badge variant="outline" className="terminal-glow bg-accent text-accent-foreground border-accent">
            SECURE CONNECTION ACTIVE
          </Badge>
        </div>

        {(currentScreen === 'main' || !currentScreen) && <MainScreen setCurrentScreen={setCurrentScreen} />}
        {currentScreen === 'about' && <AboutScreen setCurrentScreen={setCurrentScreen} />}
        {currentScreen === 'events' && <EventsScreen setCurrentScreen={setCurrentScreen} />}
        {currentScreen === 'resources' && <ResourcesScreen setCurrentScreen={setCurrentScreen} />}
        {currentScreen === 'comments' && <VulnerableComments setCurrentScreen={setCurrentScreen} />}
        {currentScreen === 'search' && <SearchResults setCurrentScreen={setCurrentScreen} />}
        {currentScreen === 'profile' && <UserProfile setCurrentScreen={setCurrentScreen} />}
      </Card>
    </div>
  )
}

function MainScreen({ setCurrentScreen }: { setCurrentScreen: (screen: string) => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center my-12">
        <div className="border-2 border-accent p-8 mx-auto max-w-2xl">
          <div className="text-6xl font-bold terminal-glow text-accent mb-4 tracking-wider">
            MSUG
          </div>
          <div className="text-accent text-lg mb-2">Microsoft Security User Group</div>
          <div className="text-accent text-lg mb-6">Finland</div>
          <Badge className="bg-accent text-accent-foreground px-4 py-1">
            📡 WELCOME TO MSUG #10! 📡
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        <div className="terminal-text">
          <div className="text-muted-foreground">SYSTEM INITIALIZING...</div>
          <div className="text-muted-foreground">CONNECTING TO SECURE CHANNEL...</div>
          <div className="text-primary font-bold">CONNECTION ESTABLISHED</div>
        </div>

        <div className="terminal-text space-y-2">
          <div>Welcome to MSUG #10 - the retro vibes edition!</div>
          <div>A friendly and inclusive community for cybersecurity professionals working with Microsoft</div>
          <div>technologies.</div>
        </div>

        <div className="space-y-2">
          <div className="text-accent font-bold">ACCESS LEVEL: AUTHORIZED</div>
          <div className="text-primary">SECURITY CLEARANCE: VERIFIED</div>
        </div>
      </div>

      <div className="mt-12">
        <Button 
          onClick={() => setCurrentScreen('about')}
          className="terminal-border bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-2"
        >
          [ WHAT IS MSUG? ] &gt;&gt;
        </Button>
      </div>

      <Separator className="bg-primary my-8" />

      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={() => setCurrentScreen('events')}
          variant="outline" 
          className="terminal-border border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          EVENTS.EXE
        </Button>
        <Button 
          onClick={() => setCurrentScreen('resources')}
          variant="outline" 
          className="terminal-border border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          RESOURCES.DAT
        </Button>
      </div>

      <Separator className="bg-destructive my-8" />

      {/* XSS Demonstration Section */}
      <div className="space-y-4">
        <div className="text-destructive font-bold terminal-text">
          ⚠️ XSS VULNERABILITY DEMONSTRATIONS
        </div>
        <div className="text-sm text-muted-foreground">
          The following components contain intentional XSS vulnerabilities for educational purposes:
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => setCurrentScreen('comments')}
            variant="outline" 
            className="terminal-border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            COMMENTS.XSS
          </Button>
          <Button 
            onClick={() => setCurrentScreen('search')}
            variant="outline" 
            className="terminal-border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            SEARCH.XSS
          </Button>
          <Button 
            onClick={() => setCurrentScreen('profile')}
            variant="outline" 
            className="terminal-border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            PROFILE.XSS
          </Button>
        </div>
      </div>
    </div>
  )
}

function AboutScreen({ setCurrentScreen }: { setCurrentScreen: (screen: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">ABOUT_MSUG.TXT</h1>
        <Button 
          onClick={() => setCurrentScreen('main')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="space-y-4 terminal-text">
        <div className="text-accent font-bold">&gt; MISSION STATEMENT</div>
        <div>Microsoft Security User Group Finland (MSUG) is a community-driven organization dedicated to advancing cybersecurity knowledge and best practices within the Microsoft ecosystem.</div>

        <div className="text-accent font-bold mt-6">&gt; WHAT WE DO</div>
        <div>• Regular meetups featuring industry experts and Microsoft MVPs</div>
        <div>• Hands-on workshops and technical deep-dives</div>
        <div>• Networking opportunities for security professionals</div>
        <div>• Knowledge sharing on latest Microsoft security technologies</div>

        <div className="text-accent font-bold mt-6">&gt; WHO CAN JOIN</div>
        <div>Our community welcomes:</div>
        <div>• IT Security professionals</div>
        <div>• System administrators</div>
        <div>• Developers working with Microsoft technologies</div>
        <div>• Students and cybersecurity enthusiasts</div>
        <div>• Anyone interested in Microsoft security solutions</div>

        <div className="text-accent font-bold mt-6">&gt; COMMUNITY VALUES</div>
        <div>✓ Inclusive and welcoming environment</div>
        <div>✓ Knowledge sharing and collaboration</div>
        <div>✓ Continuous learning and professional development</div>
        <div>✓ Ethical cybersecurity practices</div>
      </div>

      <div className="mt-8 p-4 border border-primary bg-secondary">
        <div className="text-primary font-bold">CONTACT_INFO.DAT</div>
        <div>Email: info@msug.fi</div>
        <div>LinkedIn: Microsoft Security User Group Finland</div>
        <div>Location: Helsinki, Finland</div>
      </div>
    </div>
  )
}

function EventsScreen({ setCurrentScreen }: { setCurrentScreen: (screen: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">EVENTS.LOG</h1>
        <Button 
          onClick={() => setCurrentScreen('main')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="space-y-6 terminal-text">
        <div className="text-accent font-bold">&gt; UPCOMING EVENTS</div>
        
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold">EVENT_001.DAT</div>
          <div className="text-lg font-bold">Microsoft Sentinel Deep Dive</div>
          <div className="text-muted-foreground">DATE: 2024-02-15 18:00:00 UTC+2</div>
          <div className="text-muted-foreground">LOCATION: Helsinki Tech Hub</div>
          <div className="mt-2">Join us for an in-depth exploration of Microsoft Sentinel's advanced threat detection capabilities.</div>
          <Badge className="mt-2 bg-accent text-accent-foreground">REGISTRATION OPEN</Badge>
        </Card>

        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold">EVENT_002.DAT</div>
          <div className="text-lg font-bold">Zero Trust Architecture Workshop</div>
          <div className="text-muted-foreground">DATE: 2024-03-12 18:00:00 UTC+2</div>
          <div className="text-muted-foreground">LOCATION: Online Event</div>
          <div className="mt-2">Hands-on workshop implementing Zero Trust principles using Microsoft 365 security stack.</div>
          <Badge className="mt-2 bg-muted text-muted-foreground">COMING SOON</Badge>
        </Card>

        <div className="text-accent font-bold mt-8">&gt; PAST EVENTS</div>
        
        <div className="space-y-2">
          <div>✓ Azure AD Security Best Practices - January 2024</div>
          <div>✓ Microsoft Defender for Cloud Workshop - December 2023</div>
          <div>✓ Incident Response with Microsoft Tools - November 2023</div>
          <div>✓ Threat Hunting in Microsoft 365 - October 2023</div>
        </div>

        <div className="mt-8 p-4 border border-accent bg-accent/10">
          <div className="text-accent font-bold">EVENT_REGISTRATION.EXE</div>
          <div>To register for upcoming events, contact us at events@msug.fi</div>
          <div>Follow our LinkedIn page for the latest updates and announcements.</div>
        </div>
      </div>
    </div>
  )
}

function ResourcesScreen({ setCurrentScreen }: { setCurrentScreen: (screen: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">RESOURCES.DB</h1>
        <Button 
          onClick={() => setCurrentScreen('main')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="space-y-6 terminal-text">
        <div className="text-accent font-bold">&gt; MICROSOFT SECURITY TOOLS</div>
        <div className="grid gap-4">
          <div className="border border-primary p-3">
            <div className="text-primary font-bold">Microsoft Sentinel</div>
            <div className="text-sm">Cloud-native SIEM and SOAR solution</div>
            <div className="text-muted-foreground text-xs">docs.microsoft.com/azure/sentinel</div>
          </div>
          <div className="border border-primary p-3">
            <div className="text-primary font-bold">Microsoft Defender for Cloud</div>
            <div className="text-sm">Cloud security posture management</div>
            <div className="text-muted-foreground text-xs">docs.microsoft.com/azure/defender-for-cloud</div>
          </div>
          <div className="border border-primary p-3">
            <div className="text-primary font-bold">Microsoft 365 Defender</div>
            <div className="text-sm">Integrated threat protection suite</div>
            <div className="text-muted-foreground text-xs">docs.microsoft.com/microsoft-365/security</div>
          </div>
        </div>

        <div className="text-accent font-bold mt-8">&gt; LEARNING RESOURCES</div>
        <div className="space-y-2">
          <div>• Microsoft Learn Security Fundamentals</div>
          <div>• Azure Security Engineer Certification Path</div>
          <div>• Microsoft Security Community</div>
          <div>• MSUG Finland Presentation Archive</div>
          <div>• Cybersecurity Best Practices Documentation</div>
        </div>

        <div className="text-accent font-bold mt-8">&gt; USEFUL LINKS</div>
        <div className="space-y-2">
          <div>→ Microsoft Security Blog</div>
          <div>→ Azure Security Center</div>
          <div>→ Microsoft Security Response Center</div>
          <div>→ Azure Architecture Center - Security</div>
          <div>→ Microsoft Security Development Lifecycle</div>
        </div>

        <div className="mt-8 p-4 border border-accent bg-accent/10">
          <div className="text-accent font-bold">CONTRIBUTE.EXE</div>
          <div>Have a useful resource to share? Contact us to add it to our database!</div>
          <div>We're always looking for community-contributed content and tools.</div>
        </div>
      </div>
    </div>
  )
}

export default App