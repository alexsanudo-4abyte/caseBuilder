import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Bell,
  Shield,
  Brain,
  Palette,
  Database,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  Mail,
  Building
} from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    fraudAlerts: true,
    caseUpdates: true,
    weeklyReports: true,
    aiAutoAnalysis: true,
    aiSuggestions: true,
    darkMode: false,
    compactView: false,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-600" />
          Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your account and platform preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Settings
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={user?.full_name || ''} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled className="bg-slate-50" />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input value={user?.role || 'user'} disabled className="bg-slate-50 capitalize" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input placeholder="(555) 123-4567" />
                  </div>
                </div>
                <div>
                  <Label>Firm Name</Label>
                  <Input placeholder="Law Firm LLC" />
                </div>
                <div>
                  <Label>Office Address</Label>
                  <Input placeholder="123 Main St, Suite 100, City, State 12345" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-slate-50 rounded-xl">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <p className="font-semibold text-slate-900">{user?.full_name || 'User'}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <Badge className="mt-2 bg-emerald-100 text-emerald-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plan</span>
                    <span className="font-medium">Enterprise</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Member Since</span>
                    <span className="font-medium">Jan 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Login</span>
                    <span className="font-medium">Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Notifications
                </h3>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700">Case Updates</p>
                      <p className="text-sm text-slate-500">Receive updates when case status changes</p>
                    </div>
                    <Switch 
                      checked={settings.caseUpdates} 
                      onCheckedChange={(v) => setSettings({...settings, caseUpdates: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700">Fraud Alerts</p>
                      <p className="text-sm text-slate-500">Immediate alerts for fraud detection</p>
                    </div>
                    <Switch 
                      checked={settings.fraudAlerts} 
                      onCheckedChange={(v) => setSettings({...settings, fraudAlerts: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700">Weekly Reports</p>
                      <p className="text-sm text-slate-500">Portfolio summary every Monday</p>
                    </div>
                    <Switch 
                      checked={settings.weeklyReports} 
                      onCheckedChange={(v) => setSettings({...settings, weeklyReports: v})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Push Notifications
                </h3>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-700">Browser Notifications</p>
                      <p className="text-sm text-slate-500">Real-time alerts in your browser</p>
                    </div>
                    <Switch 
                      checked={settings.pushNotifications} 
                      onCheckedChange={(v) => setSettings({...settings, pushNotifications: v})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings Tab */}
        <TabsContent value="ai">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Customize how APEX AI works for your firm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">APEX AI Engine</p>
                    <p className="text-sm text-slate-500">Version 1.0 • Last updated: Today</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Automatic Case Analysis</p>
                    <p className="text-sm text-slate-500">Run AI analysis on new intakes automatically</p>
                  </div>
                  <Switch 
                    checked={settings.aiAutoAnalysis} 
                    onCheckedChange={(v) => setSettings({...settings, aiAutoAnalysis: v})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">AI Suggestions</p>
                    <p className="text-sm text-slate-500">Show AI-powered recommendations in dashboard</p>
                  </div>
                  <Switch 
                    checked={settings.aiSuggestions} 
                    onCheckedChange={(v) => setSettings({...settings, aiSuggestions: v})}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-medium text-slate-900 mb-2">AI Model Performance</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">94%</p>
                    <p className="text-xs text-slate-500">Fraud Detection Accuracy</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">87%</p>
                    <p className="text-xs text-slate-500">Settlement Prediction</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">91%</p>
                    <p className="text-xs text-slate-500">Case Qualification</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Account Security</p>
                    <p className="text-sm text-slate-500">Your account is protected</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">Secure</Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Password</p>
                    <p className="text-sm text-slate-500">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Active Sessions</p>
                    <p className="text-sm text-slate-500">2 devices currently logged in</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-32">
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}