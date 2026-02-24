import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

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
      if (isSignup) {
        await register(fullName, email, password);
      } else {
        await login(email, password);
      }
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('return');
      navigate(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/Dashboard', { replace: true });
    } catch (err) {
      setError(err?.data?.message ?? (isSignup ? 'Could not create account' : 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Case Builder</CardTitle>
          <CardDescription>{isSignup ? 'Create your account' : 'Sign in to your account'}</CardDescription>
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
                placeholder="you@firm.com"
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
              {loading ? (isSignup ? 'Creating account…' : 'Signing in…') : (isSignup ? 'Create account' : 'Sign in')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={switchMode} className="text-slate-900 font-medium hover:underline">
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
