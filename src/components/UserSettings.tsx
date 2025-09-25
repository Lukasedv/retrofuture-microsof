// VULNERABLE: User Settings component without CSRF protection
// This file contains intentional security vulnerabilities for educational purposes

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { updateUserSettings, changePassword, updateAdminSettings, deleteUserAccount, getUserData } from '@/api/settings.js';
import { getStoredCSRFToken, generateWeakCSRFToken } from '@/utils/csrf';

interface UserSettingsProps {
  setCurrentScreen: (screen: string) => void;
}

export function UserSettings({ setCurrentScreen }: UserSettingsProps) {
  const [userData, setUserData] = useState<any>({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    notifications: false,
    twoFactorEnabled: false,
    securityLevel: 'medium'
  });
  const [adminData, setAdminData] = useState({
    maintenanceMode: false,
    debugMode: false,
    allowRegistration: true,
    securityAlerts: true
  });
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load current user data
    const currentData = getUserData();
    setUserData(currentData);
    setFormData({
      username: currentData.username || '',
      email: currentData.email || '',
      notifications: currentData.notifications || false,
      twoFactorEnabled: currentData.twoFactorEnabled || false,
      securityLevel: currentData.securityLevel || 'medium'
    });
  }, []);

  // VULNERABILITY: Form submission without CSRF token validation
  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // VULNERABLE: No CSRF token included in request
      console.warn('CSRF VULNERABILITY: Submitting form without CSRF protection');
      
      const result = await updateUserSettings(formData);
      
      if (result.success) {
        setMessage('✅ Settings updated successfully via CSRF vulnerable endpoint');
        setUserData(result.data);
      } else {
        setMessage('❌ Failed to update settings');
      }
    } catch (error) {
      setMessage('❌ Error updating settings: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // VULNERABILITY: Password change via GET request (should be POST)
  const handlePasswordChange = async () => {
    if (!newPassword) {
      setMessage('❌ Please enter a new password');
      return;
    }

    try {
      // VULNERABLE: Password change via GET request - CSRF risk
      console.warn('CSRF VULNERABILITY: Changing password via GET request');
      
      const result = await changePassword(newPassword);
      
      if (result.success) {
        setMessage('✅ Password changed via vulnerable GET request');
        setNewPassword('');
      }
    } catch (error) {
      setMessage('❌ Error changing password: ' + error);
    }
  };

  // VULNERABILITY: Admin functions without proper CSRF validation
  const handleAdminUpdate = async () => {
    setIsLoading(true);
    
    try {
      // VULNERABLE: Critical admin function without CSRF protection
      console.warn('CSRF VULNERABILITY: Admin settings update without CSRF token');
      
      const result = await updateAdminSettings(adminData);
      
      if (result.success) {
        setMessage('✅ Admin settings updated without CSRF protection');
      }
    } catch (error) {
      setMessage('❌ Error updating admin settings: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // VULNERABILITY: Account deletion without CSRF protection
  const handleAccountDeletion = async () => {
    // VULNERABLE: No confirmation dialog or CSRF token for critical operation
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (confirmed) {
      try {
        console.warn('CSRF VULNERABILITY: Account deletion without CSRF protection');
        
        const result = await deleteUserAccount();
        
        if (result.success) {
          setMessage('⚠️ Account deleted via CSRF vulnerable endpoint');
        }
      } catch (error) {
        setMessage('❌ Error deleting account: ' + error);
      }
    }
  };

  // VULNERABILITY: Creates a hidden form that could be exploited
  const createHiddenCSRFForm = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/settings/update'; // Vulnerable endpoint
    form.style.display = 'none';
    
    // VULNERABLE: No CSRF token in hidden form
    const usernameInput = document.createElement('input');
    usernameInput.name = 'username';
    usernameInput.value = 'hacked_user';
    
    const emailInput = document.createElement('input');
    emailInput.name = 'email';
    emailInput.value = 'hacker@evil.com';
    
    form.appendChild(usernameInput);
    form.appendChild(emailInput);
    document.body.appendChild(form);
    
    console.warn('CSRF VULNERABILITY: Hidden form created without CSRF protection');
    return form;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold terminal-glow text-accent">USER_SETTINGS.CFG</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-red-500 border-red-500">
            CSRF VULNERABLE
          </Badge>
          <Button 
            onClick={() => setCurrentScreen('main')}
            variant="ghost" 
            className="text-muted-foreground hover:text-primary"
          >
            [ BACK ] &lt;&lt;
          </Button>
        </div>
      </div>

      {message && (
        <div className="p-3 border border-accent bg-accent/10 terminal-text">
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* VULNERABLE: User Settings Form without CSRF protection */}
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold mb-4">PROFILE_UPDATE.EXE</div>
          <form onSubmit={handleSettingsUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-primary">Username:</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-primary">Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary">Security Level:</label>
              <select
                value={formData.securityLevel}
                onChange={(e) => setFormData({...formData, securityLevel: e.target.value})}
                className="w-full p-2 bg-background border border-primary text-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
                  className="accent-primary"
                />
                <span className="text-primary">Enable Notifications</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.twoFactorEnabled}
                  onChange={(e) => setFormData({...formData, twoFactorEnabled: e.target.checked})}
                  className="accent-primary"
                />
                <span className="text-primary">Two-Factor Authentication</span>
              </label>
            </div>

            {/* VULNERABLE: No CSRF token in form */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="terminal-border bg-accent text-accent-foreground hover:bg-accent/80"
            >
              {isLoading ? 'UPDATING...' : 'UPDATE SETTINGS [CSRF VULNERABLE]'}
            </Button>
          </form>
        </Card>

        {/* VULNERABLE: Password change via GET request */}
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold mb-4">PASSWORD_CHANGE.EXE</div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-primary">New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 bg-background border border-primary text-primary"
                placeholder="Enter new password"
              />
            </div>
            
            <Button 
              onClick={handlePasswordChange}
              className="terminal-border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              CHANGE PASSWORD [GET REQUEST - CSRF RISK]
            </Button>
          </div>
        </Card>

        {/* VULNERABLE: Admin panel without CSRF protection */}
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold mb-4">ADMIN_PANEL.EXE</div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={adminData.maintenanceMode}
                  onChange={(e) => setAdminData({...adminData, maintenanceMode: e.target.checked})}
                  className="accent-primary"
                />
                <span className="text-primary">Maintenance Mode</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={adminData.debugMode}
                  onChange={(e) => setAdminData({...adminData, debugMode: e.target.checked})}
                  className="accent-primary"
                />
                <span className="text-primary">Debug Mode</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={adminData.allowRegistration}
                  onChange={(e) => setAdminData({...adminData, allowRegistration: e.target.checked})}
                  className="accent-primary"
                />
                <span className="text-primary">Allow Registration</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={adminData.securityAlerts}
                  onChange={(e) => setAdminData({...adminData, securityAlerts: e.target.checked})}
                  className="accent-primary"
                />
                <span className="text-primary">Security Alerts</span>
              </label>
            </div>
            
            <Button 
              onClick={handleAdminUpdate}
              disabled={isLoading}
              className="terminal-border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              UPDATE ADMIN SETTINGS [NO CSRF PROTECTION]
            </Button>
          </div>
        </Card>

        {/* VULNERABLE: Dangerous operations */}
        <Card className="terminal-border bg-red-900/20 border-red-500 p-4">
          <div className="text-red-500 font-bold mb-4">DANGER_ZONE.EXE</div>
          <div className="space-y-4">
            <div className="text-red-400 text-sm">
              ⚠️ These operations are vulnerable to CSRF attacks
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleAccountDeletion}
                className="terminal-border border-red-500 bg-red-500 text-white hover:bg-red-600"
              >
                DELETE ACCOUNT [CSRF VULNERABLE]
              </Button>
              
              <Button 
                onClick={createHiddenCSRFForm}
                className="terminal-border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              >
                CREATE HIDDEN FORM [CSRF EXPLOIT]
              </Button>
            </div>
          </div>
        </Card>

        {/* Display current user data */}
        <Card className="terminal-border bg-secondary p-4">
          <div className="text-accent font-bold mb-4">CURRENT_USER_DATA.JSON</div>
          <pre className="text-sm text-primary font-mono">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}