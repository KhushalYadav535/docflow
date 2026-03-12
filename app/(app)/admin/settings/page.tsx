'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, HardDrive, Mail, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    storageLimit: '1000',
    maxUploadSize: '100',
    adminEmail: 'admin@company.com',
    maintenanceMode: 'off',
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-2">Configure system-wide settings and preferences</p>
        </div>

        {/* Storage Settings */}
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <HardDrive className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Storage Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storage" className="text-foreground">Total Storage Limit (GB)</Label>
              <Input
                id="storage"
                type="number"
                value={settings.storageLimit}
                onChange={(e) => handleSettingChange('storageLimit', e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUpload" className="text-foreground">Max File Upload Size (MB)</Label>
              <Input
                id="maxUpload"
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => handleSettingChange('maxUploadSize', e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-sm text-foreground font-medium">Current Usage</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden mr-3">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: '64%' }}
                  />
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">640 GB / 1000 GB</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Email Settings */}
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Email Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-foreground">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Email Notifications</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <label className="text-sm text-foreground">Send upload notifications</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <label className="text-sm text-foreground">Send user activity alerts</label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">System Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance" className="text-foreground">Maintenance Mode</Label>
              <Select value={settings.maintenanceMode} onValueChange={(val) => handleSettingChange('maintenanceMode', val)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="off" className="text-foreground">Off</SelectItem>
                  <SelectItem value="on" className="text-foreground">On</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Security Options</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <label className="text-sm text-foreground">Require 2FA for admins</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <label className="text-sm text-foreground">Enable file encryption</label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button and Notification */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSave}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
          {saved && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              Settings saved successfully!
            </div>
          )}
        </div>
      </div>
    );
}
