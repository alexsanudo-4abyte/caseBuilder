import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Scale, Building2, User } from 'lucide-react';

export default function Login() {
  const { login, register, registerClaimant } = useAuth();
  const navigate = useNavigate();

  const [userType, setUserType] = useState(null); // 'firm' | 'claimant'
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (isSignup) {
        user = userType === 'claimant'
          ? await registerClaimant(fullName, email, password)
          : await register(fullName, email, password);
      } else {
        user = await login(email, password);
      }
      const role = user?.role;
      if (role === 'claimant') {
        navigate('/ClaimantPortal', { replace: true });
      } else {
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('return');
        navigate(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/Dashboard', { replace: true });
      }
    } catch (err) {
      setError(err?.data?.message ?? (isSignup ? 'Could not create account' : 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  // Step 1: choose user type
  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Case Builder</h1>
            <p className="text-slate-500 mt-1">Who are you signing in as?</p>
          </div>
          <button
            onClick={() => setUserType('firm')}
            className="w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all text-left"
          >
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Law Firm</p>
              <p className="text-sm text-slate-500">Attorneys, paralegals, and case managers</p>
            </div>
          </button>
          <button
            onClick={() => setUserType('claimant')}
            className="w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all text-left"
          >
            <div className="p-3 bg-emerald-50 rounded-lg">
              <User className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Claimant</p>
              <p className="text-sm text-slate-500">Submit or check the status of your claim</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-2">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Case Builder</CardTitle>
          <CardDescription>
            {userType === 'claimant' ? 'Claimant Portal — ' : 'Law Firm — '}
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={userType === 'claimant' ? 'you@example.com' : 'you@firm.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={!isSignup}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? (isSignup ? 'Creating account…' : 'Signing in…')
                : (isSignup ? 'Create account' : 'Sign in')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }}
              className="text-slate-900 font-medium hover:underline"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
          <p className="mt-2 text-center text-sm text-slate-400">
            <button onClick={() => { setUserType(null); setError(''); }} className="hover:underline">
              ← Back
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
