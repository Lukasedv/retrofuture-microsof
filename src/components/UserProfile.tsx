// CVE-005: IDOR Vulnerability - User Profile component with ID manipulation
// This component demonstrates insecure direct object references

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getUserProfile, getUserSettings } from '../api/users.js';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  ssn: string;
  salary: number;
  address: string;
  phone: string;
}

interface UserSettings {
  userId: number;
  canModifyUsers: boolean;
  canViewLogs: boolean;
  canDeleteData: boolean;
  adminPanel: string | null;
  securityDashboard: string | null;
}

interface Props {
  setCurrentScreen: (screen: string) => void;
}

export default function UserProfile({ setCurrentScreen }: Props) {
  const [userId, setUserId] = useState('1');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUserData = async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      // VULNERABILITY: Direct API call with user-controlled ID
      const profileResult = getUserProfile(id);
      const settingsResult = getUserSettings(id);
      
      if (profileResult.error) {
        setError(profileResult.error);
        setUserProfile(null);
        setUserSettings(null);
      } else {
        setUserProfile(profileResult.user);
        setUserSettings(settingsResult.settings);
      }
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData(userId);
  }, [userId]);

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUserId = e.target.value;
    setUserId(newUserId);
  };

  const loadQuickProfile = (id: string) => {
    setUserId(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">USER_PROFILE.EXE</h1>
        <Button 
          onClick={() => setCurrentScreen('main')}
          variant="ghost" 
          className="text-muted-foreground hover:text-primary"
        >
          [ BACK ] &lt;&lt;
        </Button>
      </div>

      <div className="terminal-text space-y-4">
        <div className="text-accent font-bold">&gt; ACCESS USER PROFILE</div>
        <div className="text-sm text-muted-foreground">
          VULNERABILITY: Direct object reference without authorization checks
        </div>
        
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
          <Button 
            onClick={() => loadUserData(userId)}
            className="terminal-border border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            disabled={loading}
          >
            {loading ? 'LOADING...' : 'ACCESS'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => loadQuickProfile('1')}
            variant="outline"
            size="sm"
            className="terminal-border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            ADMIN (ID:1)
          </Button>
          <Button 
            onClick={() => loadQuickProfile('2')}
            variant="outline"
            size="sm"
            className="terminal-border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            USER (ID:2)
          </Button>
          <Button 
            onClick={() => loadQuickProfile('3')}
            variant="outline"
            size="sm"
            className="terminal-border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            JANE (ID:3)
          </Button>
          <Button 
            onClick={() => loadQuickProfile('4')}
            variant="outline"
            size="sm"
            className="terminal-border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            SECURITY (ID:4)
          </Button>
        </div>
      </div>

      {error && (
        <Card className="terminal-border bg-red-900/20 border-red-500">
          <CardContent className="p-4">
            <div className="text-red-400">ERROR: {error}</div>
          </CardContent>
        </Card>
      )}

      {userProfile && (
        <div className="space-y-4">
          <Card className="terminal-border bg-secondary">
            <CardHeader>
              <CardTitle className="text-accent">PROFILE DATA - USER #{userProfile.id}</CardTitle>
              <Badge className={`w-fit ${
                userProfile.role === 'administrator' ? 'bg-red-500' : 
                userProfile.role === 'security' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}>
                {userProfile.role.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 terminal-text">
              <div><span className="text-primary">USERNAME:</span> {userProfile.username}</div>
              <div><span className="text-primary">EMAIL:</span> {userProfile.email}</div>
              <div><span className="text-primary">ROLE:</span> {userProfile.role}</div>
              
              {/* VULNERABILITY: Sensitive PII exposed */}
              <div className="border-t border-accent pt-3 mt-3">
                <div className="text-red-400 font-bold">⚠️ SENSITIVE DATA EXPOSED ⚠️</div>
                <div><span className="text-red-300">SSN:</span> {userProfile.ssn}</div>
                <div><span className="text-red-300">ANNUAL SALARY:</span> €{userProfile.salary.toLocaleString()}</div>
                <div><span className="text-red-300">HOME ADDRESS:</span> {userProfile.address}</div>
                <div><span className="text-red-300">PHONE:</span> {userProfile.phone}</div>
              </div>
            </CardContent>
          </Card>

          {userSettings && (
            <Card className="terminal-border bg-secondary">
              <CardHeader>
                <CardTitle className="text-accent">USER PERMISSIONS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 terminal-text">
                <div>
                  <span className="text-primary">CAN MODIFY USERS:</span> 
                  <Badge className={userSettings.canModifyUsers ? "bg-green-500 ml-2" : "bg-red-500 ml-2"}>
                    {userSettings.canModifyUsers ? 'YES' : 'NO'}
                  </Badge>
                </div>
                <div>
                  <span className="text-primary">CAN VIEW LOGS:</span> 
                  <Badge className={userSettings.canViewLogs ? "bg-green-500 ml-2" : "bg-red-500 ml-2"}>
                    {userSettings.canViewLogs ? 'YES' : 'NO'}
                  </Badge>
                </div>
                <div>
                  <span className="text-primary">CAN DELETE DATA:</span> 
                  <Badge className={userSettings.canDeleteData ? "bg-green-500 ml-2" : "bg-red-500 ml-2"}>
                    {userSettings.canDeleteData ? 'YES' : 'NO'}
                  </Badge>
                </div>
                
                {userSettings.adminPanel && (
                  <div className="border-t border-red-500 pt-3">
                    <div className="text-red-400 font-bold">🔐 ADMIN ACCESS DISCOVERED</div>
                    <div><span className="text-red-300">ADMIN PANEL:</span> {userSettings.adminPanel}</div>
                  </div>
                )}
                
                {userSettings.securityDashboard && (
                  <div className="border-t border-yellow-500 pt-3">
                    <div className="text-yellow-400 font-bold">🛡️ SECURITY ACCESS DISCOVERED</div>
                    <div><span className="text-yellow-300">SECURITY DASHBOARD:</span> {userSettings.securityDashboard}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="mt-8 p-4 border border-red-500 bg-red-900/10">
        <div className="text-red-400 font-bold">SECURITY VULNERABILITY DETECTED</div>
        <div className="text-red-300 text-sm mt-2">
          This interface demonstrates Insecure Direct Object References (IDOR). 
          Any user can access any other user's profile data including sensitive PII, 
          salary information, and administrative privileges by simply changing the user ID.
        </div>
        <div className="text-red-300 text-sm mt-1">
          <strong>CVE Classification:</strong> CWE-639 (Authorization Bypass Through User-Controlled Key)
        </div>
      </div>
    </div>
  );
}