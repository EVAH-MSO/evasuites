import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm: '',
    first_name: '', last_name: '', phone: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (form.password !== form.confirm) {
      setErr('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setErr('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        role: 'landlord', // <-- NEW LANDLORDS SIGN UP HERE
      });
      nav('/login?registered=1');
    } catch (e) {
      let msg = 'Registration failed';
      if (e.response && e.response.data) {
        const data = e.response.data;
        if (typeof data === 'object') {
          const first = Object.entries(data)[0];
          if (first) msg = first[0] + ': ' + (Array.isArray(first[1]) ? first[1][0] : first[1]);
        } else if (typeof data === 'string') {
          msg = data;
        }
      } else if (e.message) {
        msg = e.message; // This will show "Network Error" if CORS fails
      }
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-200 p-6">
      <form onSubmit={submit}
            className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-3">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">🏠 EvaSuites</h1>
          <p className="text-slate-500 mt-1">Create your landlord account</p>
        </div>

        {err && <p className="text-red-700 bg-red-50 border border-red-200 p-2 rounded text-sm">{err}</p>}

        <div className="grid grid-cols-2 gap-2">
          <input className="border p-2 rounded-lg" placeholder="First name" required
                 value={form.first_name} onChange={set('first_name')} />
          <input className="border p-2 rounded-lg" placeholder="Last name"
                 value={form.last_name} onChange={set('last_name')} />
        </div>
        <input className="w-full border p-2 rounded-lg" placeholder="Username" required
               value={form.username} onChange={set('username')} />
        <input className="w-full border p-2 rounded-lg" type="email" placeholder="Email" required
               value={form.email} onChange={set('email')} />
        <input className="w-full border p-2 rounded-lg" placeholder="Phone"
               value={form.phone} onChange={set('phone')} />
        <div className="relative">
          <input className="w-full border p-2 pr-12 rounded-lg"
                 type={showPw ? 'text' : 'password'} placeholder="Password (min 6)" required
                 value={form.password} onChange={set('password')} />
          <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-indigo-600">
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>
        <input className="w-full border p-2 rounded-lg" type="password" placeholder="Confirm password" required
               value={form.confirm} onChange={set('confirm')} />

        <button disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg font-medium disabled:opacity-50">
          {loading ? 'Creating…' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
