import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
  });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.patch('/users/' + user.id + '/', form);
      setMsg('Profile updated. Refresh page to see changes.');
    } catch (e) {
      setErr(JSON.stringify(e.response?.data ?? 'Failed'));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    try {
      await api.post('/change-password/', pwForm);
      setPwMsg('Password changed successfully.');
      setPwForm({ old_password: '', new_password: '' });
    } catch (e) {
      setPwErr(e.response?.data?.error || 'Failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic info */}
        <form onSubmit={saveProfile}
              className="bg-white p-6 rounded-xl shadow border border-slate-100 space-y-3">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Basic Information</h2>
          {msg && <p className="text-emerald-700 bg-emerald-50 p-2 rounded text-sm">{msg}</p>}
          {err && <p className="text-red-700 bg-red-50 p-2 rounded text-sm">{err}</p>}

          <div>
            <label className="text-xs text-slate-500">Username (read-only)</label>
            <input className="w-full border p-2 rounded bg-slate-50" disabled value={user?.username || ''} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Role (read-only)</label>
            <input className="w-full border p-2 rounded bg-slate-50 capitalize" disabled value={user?.role || ''} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="border p-2 rounded" placeholder="First name"
                   value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Last name"
                   value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <input className="w-full border p-2 rounded" type="email" placeholder="Email"
                 value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full border p-2 rounded" placeholder="Phone"
                 value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium py-2 px-4">
            Save Profile
          </button>
        </form>

        {/* Password */}
        <form onSubmit={changePassword}
              className="bg-white p-6 rounded-xl shadow border border-slate-100 space-y-3">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Change Password</h2>
          {pwMsg && <p className="text-emerald-700 bg-emerald-50 p-2 rounded text-sm">{pwMsg}</p>}
          {pwErr && <p className="text-red-700 bg-red-50 p-2 rounded text-sm">{pwErr}</p>}

          <input className="w-full border p-2 rounded" type="password" placeholder="Current password" required
                 value={pwForm.old_password}
                 onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })} />
          <input className="w-full border p-2 rounded" type="password" placeholder="New password (6+ chars)" required
                 value={pwForm.new_password}
                 onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium py-2 px-4">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
