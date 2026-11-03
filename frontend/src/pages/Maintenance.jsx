import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { canManage } from '../roles';

const emptyForm = {
  unit: '', tenant: '', title: '', description: '',
  priority: 'medium', status: 'open',
};

export default function Maintenance() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const canEdit = canManage(user);

  const load = async () => {
    try {
      setLoading(true);
      const [m, u, t] = await Promise.all([
        api.get('/maintenance/'), api.get('/units/'), api.get('/tenants/'),
      ]);
      setItems(m.data.results ?? m.data);
      setUnits(u.data.results ?? u.data);
      setTenants(t.data.results ?? t.data);
    } catch { setError('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/maintenance/', {
        ...form,
        unit: parseInt(form.unit),
        tenant: parseInt(form.tenant),
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(JSON.stringify(err.response?.data ?? 'Failed'));
    }
  };

  const setStatus = async (m, status) => {
    try { await api.patch('/maintenance/' + m.id + '/', { status }); load(); }
    catch { alert('Update failed'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this request?')) return;
    try { await api.delete('/maintenance/' + id + '/'); load(); }
    catch { alert('Delete failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Maintenance</h1>
        {canEdit && (
          <button onClick={() => setShowForm((s) => !s)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
            {showForm ? 'Cancel' : '+ New Request'}
          </button>
        )}
      </div>

      {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4 text-sm">{error}</p>}

      {showForm && canEdit && (
        <form onSubmit={submit} className="bg-white p-5 rounded-xl shadow border border-slate-100 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <select className="border p-2 rounded" required
                  value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            <option value="">Select unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>Unit {u.unit_number} (id {u.id})</option>
            ))}
          </select>
          <select className="border p-2 rounded" required
                  value={form.tenant} onChange={(e) => setForm({ ...form, tenant: e.target.value })}>
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.user?.username}</option>
            ))}
          </select>
          <select className="border p-2 rounded"
                  value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input className="border p-2 rounded md:col-span-3" placeholder="Title" required
                 value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="border p-2 rounded md:col-span-3" rows={3} placeholder="Description" required
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium py-2 md:col-span-3">
            Submit Request
          </button>
        </form>
      )}

      {loading ? <p className="text-slate-500">Loading...</p> : items.length === 0 ? (
        <p className="text-slate-500">No maintenance requests yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="bg-white p-4 rounded-xl shadow border border-slate-100">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{m.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded capitalize bg-slate-100">{m.priority}</span>
                  </div>
                  <p className="text-sm text-slate-600">{m.description}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {m.tenant_name} | {m.unit_label} | {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-xs px-2 py-1 rounded capitalize bg-slate-100">
                    {m.status.replace('_', ' ')}
                  </span>
                  {canEdit && (
                    <div className="mt-2 space-x-2 text-xs">
                      {m.status === 'open' && (
                        <button onClick={() => setStatus(m, 'in_progress')} className="text-blue-600 hover:underline">Start</button>
                      )}
                      {m.status !== 'resolved' && (
                        <button onClick={() => setStatus(m, 'resolved')} className="text-emerald-600 hover:underline">Resolve</button>
                      )}
                      <button onClick={() => del(m.id)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
