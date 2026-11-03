import { useEffect, useState, useMemo } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { canManage } from '../roles';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';

const emptyForm = {
  lease: '', amount: '', payment_date: '', due_date: '',
  method: 'cash', status: 'pending', reference: '',
};

export default function Payments() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [leases, setLeases] = useState([]);
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
      const [p, l] = await Promise.all([api.get('/payments/'), api.get('/leases/')]);
      setItems(p.data.results ?? p.data);
      setLeases(l.data.results ?? l.data);
    } catch { setError('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let out = items;
    if (statusFilter !== 'all') out = out.filter((p) => p.status === statusFilter);
    const q = query.toLowerCase();
    if (q) {
      out = out.filter((p) => {
        const s = [p.lease_label, p.method, p.reference, p.status]
                  .filter(Boolean).join(' ').toLowerCase();
        return s.includes(q);
      });
    }
    return out;
  }, [items, query, statusFilter]);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api.post('/payments/', { ...form, lease: parseInt(form.lease) });
      setForm(emptyForm); setShowForm(false); load();
    } catch (err) { setError(JSON.stringify(err.response?.data ?? 'Failed')); }
  };

  const markPaid = async (p) => {
    try { await api.patch('/payments/' + p.id + '/', { status: 'paid' }); load(); }
    catch { alert('Update failed'); }
  };
  const del = async (id) => {
    if (!confirm('Delete this payment?')) return;
    try { await api.delete('/payments/' + id + '/'); load(); }
    catch { alert('Delete failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
        {canEdit && (
          <button onClick={() => setShowForm((s) => !s)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
            {showForm ? 'Cancel' : '+ New Payment'}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchBar value={query} onChange={setQuery} placeholder="Search payments..." /></div>
        <select className="border p-2 rounded"
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="late">Late</option>
        </select>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4 text-sm">{error}</p>}

      {showForm && canEdit && (
        <form onSubmit={submit} className="bg-white p-5 rounded-xl shadow border border-slate-100 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <select className="border p-2 rounded" required
                  value={form.lease} onChange={(e) => setForm({ ...form, lease: e.target.value })}>
            <option value="">Select lease</option>
            {leases.map((l) => (
              <option key={l.id} value={l.id}>{l.tenant_name} - {l.unit_label}</option>
            ))}
          </select>
          <input className="border p-2 rounded" type="number" step="0.01" placeholder="Amount" required
                 value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className="border p-2 rounded" type="date" required
                 value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <input className="border p-2 rounded" type="date" required
                 value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
          <select className="border p-2 rounded"
                  value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
            <option value="card">Card</option>
            <option value="mobile">Mobile Money</option>
          </select>
          <select className="border p-2 rounded"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="late">Late</option>
          </select>
          <input className="border p-2 rounded md:col-span-3" placeholder="Reference (optional)"
                 value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium py-2 md:col-span-3">
            Record Payment
          </button>
        </form>
      )}

      {loading ? <p className="text-slate-500">Loading...</p> : filtered.length === 0 ? (
        <p className="text-slate-500">{query || statusFilter !== 'all' ? 'No matches.' : 'No payments yet.'}</p>
      ) : (
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="p-3">Lease</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Due</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3">{p.lease_label}</td>
                  <td className="p-3">${p.amount}</td>
                  <td className="p-3">{p.due_date}</td>
                  <td className="p-3">{p.payment_date}</td>
                  <td className="p-3 capitalize">{p.method}</td>
                  <td className="p-3"><StatusBadge value={p.status} /></td>
                  <td className="p-3 text-right space-x-3">
                    {canEdit && p.status !== 'paid' && (
                      <button onClick={() => markPaid(p)} className="text-emerald-600 text-xs hover:underline">Mark paid</button>
                    )}
                    {canEdit && (
                      <button onClick={() => del(p.id)} className="text-red-600 text-xs hover:underline">Delete</button>
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
