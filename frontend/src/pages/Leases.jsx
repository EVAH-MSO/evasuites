import { useEffect, useState, useMemo } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { canManage } from '../roles';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';

const emptyForm = {
  tenant: '', unit: '', start_date: '', end_date: '',
  monthly_rent: '', deposit: '', status: 'active',
};

export default function Leases() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const canEdit = canManage(user);

  const load = async () => {
    try {
      setLoading(true);
      const [l, t, u] = await Promise.all([
        api.get('/leases/'), api.get('/tenants/'), api.get('/units/'),
      ]);
      setItems(l.data.results ?? l.data);
      setTenants(t.data.results ?? t.data);
      setUnits(u.data.results ?? u.data);
    } catch { setError('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let out = items;
    if (statusFilter !== 'all') out = out.filter((l) => l.status === statusFilter);
    const q = query.toLowerCase();
    if (q) {
      out = out.filter((l) => {
        const s = [l.tenant_name, l.unit_label, l.status].join(' ').toLowerCase();
        return s.includes(q);
      });
    }
    return out;
  }, [items, query, statusFilter]);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api.post('/leases/', { ...form, tenant: parseInt(form.tenant), unit: parseInt(form.unit) });
      setForm(emptyForm); setShowForm(false); load();
    } catch (err) { setError(JSON.stringify(err.response?.data ?? 'Failed')); }
  };

  const del = async (id) => {
    if (!confirm('Delete this lease?')) return;
    try { await api.delete('/leases/' + id + '/'); load(); }
    catch { alert('Delete failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Leases</h1>
        {canEdit && (
          <button onClick={() => setShowForm((s) => !s)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
            {showForm ? 'Cancel' : '+ New Lease'}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchBar value={query} onChange={setQuery} placeholder="Search leases..." /></div>
        <select className="border p-2 rounded"
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4 text-sm">{error}</p>}

      {showForm && canEdit && (
        <form onSubmit={submit} className="bg-white p-5 rounded-xl shadow border border-slate-100 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <select className="border p-2 rounded" required
                  value={form.tenant} onChange={(e) => setForm({ ...form, tenant: e.target.value })}>
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.user?.username}</option>
            ))}
          </select>
          <select className="border p-2 rounded" required
                  value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            <option value="">Select unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>Unit {u.unit_number} (id {u.id})</option>
            ))}
          </select>
          <input className="border p-2 rounded" type="number" step="0.01" placeholder="Monthly rent" required
                 value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} />
          <input className="border p-2 rounded" type="date" required
                 value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <input className="border p-2 rounded" type="date" placeholder="Optional"
                 value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <input className="border p-2 rounded" type="number" step="0.01" placeholder="Deposit"
                 value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} />
          <select className="border p-2 rounded"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium py-2 md:col-span-3">
            Create Lease
          </button>
        </form>
      )}

      {loading ? <p className="text-slate-500">Loading...</p> : filtered.length === 0 ? (
        <p className="text-slate-500">{query || statusFilter !== 'all' ? 'No matches.' : 'No leases yet.'}</p>
      ) : (
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="p-3">Tenant</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Start</th>
                <th className="p-3">End</th>
                <th className="p-3">Rent</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3">{l.tenant_name}</td>
                  <td className="p-3">{l.unit_label}</td>
                  <td className="p-3">{l.start_date}</td>
                  <td className="p-3">{l.end_date ? l.end_date : <span className="text-slate-400 italic">Open-ended</span>}</td>
                  <td className="p-3">${l.monthly_rent}</td>
                  <td className="p-3"><StatusBadge value={l.status} /></td>
                  <td className="p-3 text-right">
                    {canEdit && (
                      <button onClick={() => del(l.id)} className="text-red-600 text-xs hover:underline">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
