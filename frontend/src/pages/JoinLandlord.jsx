import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function JoinLandlord() {
  const { landlordUsername } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', phone: '', password: '', confirm: ''
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (form.password !== form.confirm) { setErr('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/register/', {
        ...form,
        role: 'tenant',
        landlord_username: landlordUsername
      });
      nav('/login?registered=1');
    } catch (e) {
      setErr(JSON.stringify(e.response?.data ?? 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-3">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Join {landlordUsername}'s Estate</h1>
          <p className="text-slate-500 text-sm mt-1">Create your tenant account to manage your rent and requests.</p>
        </div>
        
        {err && <p className="text-red-700 bg-red-50 border border-red-200 p-2 rounded text-sm">{err}</p>}

        <div className="grid grid-cols-2 gap-2">
          <input className="border p-2 rounded-lg" placeholder="First name" required
                 value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
          <input className="border p-2 rounded-lg" placeholder="Last name"
                 value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
        </div>
        <input className="w-full border p-2 rounded-lg" placeholder="Username" required
               value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        <input className="w-full border p-2 rounded-lg" type="email" placeholder="Email" required
               value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border p-2 rounded-lg" placeholder="Phone" 
               value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <input className="w-full border p-2 rounded-lg" type="password" placeholder="Password" required
               value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <input className="w-full border p-2 rounded-lg" type="password" placeholder="Confirm Password" required
               value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />

        <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg font-medium disabled:opacity-50">
          {loading ? 'Joining...' : 'Create Tenant Account'}
        </button>
        <p className="text-center text-sm text-slate-600 mt-4">
          Already have an account? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
