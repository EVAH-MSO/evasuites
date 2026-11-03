import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('last_username');
    if (saved) setUsername(saved);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const me = await login(username.trim(), password);
      if (remember) localStorage.setItem('last_username', username.trim());
      else localStorage.removeItem('last_username');
      const isTenant = me.role === 'tenant' && !me.is_superuser;
      nav(isTenant ? '/portal' : '/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white flex-col justify-between p-12">
        <Link to="/" className="text-4xl font-bold">🏠 EvaSuites</Link>
        <div className="space-y-4">
          <p className="text-2xl font-light leading-relaxed">
            Manage properties, tenants, leases, payments, and maintenance — all in one place.
          </p>
          <ul className="text-indigo-200 space-y-2 text-sm">
            <li>✓ Track every unit and lease</li>
            <li>✓ Record and monitor rent payments</li>
            <li>✓ Handle maintenance requests</li>
            <li>✓ Real-time revenue analytics</li>
          </ul>
        </div>
        <p className="text-xs text-indigo-300">© 2026 EvaSuites</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-100 p-6">
        <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4">
          <div className="text-center mb-2 lg:hidden">
            <Link to="/" className="text-3xl font-bold text-slate-800">🏠 EvaSuites</Link>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Sign In</h2>
            <p className="text-sm text-slate-500 mt-1">Welcome back. Please enter your details.</p>
          </div>

          {error && (
            <p className="text-red-700 bg-red-50 border border-red-200 p-2 rounded text-sm">{error}</p>
          )}

          <div>
            <label className="block text-sm text-slate-600 mb-1">Username</label>
            <input className="w-full border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                   value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'}
                     className="w-full border border-slate-300 p-2 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                     value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-indigo-600">
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
          </div>

          <button disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg font-medium disabled:opacity-50 transition">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-slate-600">
            No account?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">Create one</Link>
          </p>
          <p className="text-center text-xs text-slate-400">
            <Link to="/" className="hover:underline">← Back to home</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
