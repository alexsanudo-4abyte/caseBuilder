import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard,
  FileText,
  Users,
  Brain,
  Shield,
  DollarSign,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Scale,
  Sparkles,
  AlertTriangle,
  FolderOpen,
  Activity,
  Target
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', password: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setProfileForm({ full_name: userData.full_name, password: '' });
      } catch (e) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    try {
      const updates = { full_name: profileForm.full_name };
      if (profileForm.password) updates.password = profileForm.password;
      const updated = await base44.auth.updateProfile(updates);
      setUser(updated);
      setProfileForm({ full_name: updated.full_name, password: '' });
      setProfileOpen(false);
    } catch (err) {
      setProfileError(err?.data?.message ?? 'Failed to save changes');
    } finally {
      setProfileSaving(false);
    }
  };

  const navigation = [
    { name: 'Command Center', page: 'Dashboard', icon: LayoutDashboard },
    { name: 'Cases', page: 'Cases', icon: FolderOpen },
    { name: 'Intake Hub', page: 'IntakeHub', icon: Users },
    { name: 'Medical Intel', page: 'MedicalIntel', icon: Activity },
    { name: 'Fraud Monitor', page: 'FraudMonitor', icon: Shield },
    { name: 'AI Predictions', page: 'Predictions', icon: Brain },
    { name: 'Financials', page: 'Financials', icon: DollarSign },
    { name: 'Analytics', page: 'Analytics', icon: BarChart3 },
    { name: 'Campaigns', page: 'Campaigns', icon: Target },
    { name: 'Communications', page: 'Communications', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <>
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --apex-primary: #0f172a;
          --apex-accent: #3b82f6;
          --apex-accent-light: #60a5fa;
          --apex-success: #10b981;
          --apex-warning: #f59e0b;
          --apex-danger: #ef4444;
          --apex-surface: #ffffff;
          --apex-muted: #64748b;
        }
      `}</style>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">CASE BUILDER</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Legal Intelligence</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* AI Status */}
          <div className="px-4 py-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">APEX AI Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-400">Active & Learning</span>
              </div>
            </div>
          </div>

          {/* Settings link */}
          <div className="px-3 py-3 border-t border-slate-800">
            <Link
              to={createPageUrl('Settings')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <Settings className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              
              {/* Search */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search cases, claimants, documents..." 
                    className="w-80 pl-10 bg-slate-50 border-slate-200 focus:border-blue-500"
                  />
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] text-slate-500">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-slate-900">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-slate-500">{user?.role || 'Attorney'}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    Edit profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(createPageUrl('Settings'))}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>
    </div>

    {/* Profile edit dialog */}
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleProfileSave} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              value={profileForm.full_name}
              onChange={(e) => setProfileForm(f => ({ ...f, full_name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user?.email ?? ''} disabled className="bg-slate-50" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-password">New password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></Label>
            <Input
              id="profile-password"
              type="password"
              placeholder="••••••••"
              value={profileForm.password}
              onChange={(e) => setProfileForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>
          {profileError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{profileError}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setProfileOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={profileSaving}>
              {profileSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}