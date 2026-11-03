import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function Portal() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [leases, setLeases] = useState([]); // Changed to array for multiple houses
  const [payments, setPayments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state for maintenance
  const [showForm, setShowForm] = useState(false);
  const [reqForm, setReqForm] = useState({ unit: '', title: '', description: '', priority: 'medium' });
  const [reqMsg, setReqMsg] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [tRes, lRes, pRes, mRes] = await Promise.all([
        api.get('/tenants/'), api.get('/leases/'),
        api.get('/payments/'), api.get('/maintenance/'),
      ]);
      const tenants = tRes.data.results ?? tRes.data;
      const allLeases = lRes.data.results ?? lRes.data;
      const pays = pRes.data.results ?? pRes.data;
      const reqs = mRes.data.results ?? mRes.data;

      const mine = tenants.find((t) => t.user?.id === user.id) || tenants[0] || null;
      setTenant(mine);
      
      if (mine) {
        // Get ALL leases for this tenant
        const myLeases = allLeases.filter((l) => l.tenant === mine.id);
        setLeases(myLeases);
        setPayments(pays.filter((p) => myLeases.some((l) => l.id === p.lease)));
        setRequests(reqs.filter((r) => r.tenant === mine.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!tenant || !reqForm.unit) return;
    setReqMsg('');
    try {
      await api.post('/maintenance/', {
        unit: parseInt(reqForm.unit),
        tenant: tenant.id,
        title: reqForm.title,
        description: reqForm.description,
        priority: reqForm.priority,
      });
      setReqForm({ unit: '', title: '', description: '', priority: 'medium' });
      setShowForm(false);
      setReqMsg('Request submitted ✓');
      await load();
    } catch (err) {
      setReqMsg('Failed to submit request.');
    }
  };

  if (loading) return <p className="p-8 text-slate-500">Loading your portal…</p>;
  if (!tenant) return (
    <div className="p-8">
      <p className="text-slate-600">No tenant profile linked to this account.</p>
    </div>
  );

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-1">Welcome, {user?.first_name || user?.username}!</h1>
      <p className="text-slate-500 mb-8">Your tenant portal</p>

      {reqMsg && <p className="text-emerald-700 bg-emerald-50 p-3 rounded-lg mb-4 text-sm">{reqMsg}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">My Properties & Leases</h2>
          {leases.length === 0 ? (
            <p className="text-slate-500 text-sm">No active leases.</p>
          ) : (
            <div className="space-y-4">
              {leases.map(lease => (
                <div key={lease.id} className="border border-slate-100 p-4 rounded-lg bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-800 text-lg">{lease.unit_label}</p>
                    <StatusBadge value={lease.status} />
                  </div>
                  <div className="text-sm space-y-1 text-slate-600">
                    <p><span className="text-slate-400">Period:</span> {lease.start_date} to {lease.end_date || 'Open-ended'}</p>
                    <p><span className="text-slate-400">Rent:</span> <span className="font-semibold text-slate-800">KSh {lease.monthly_rent}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Payment Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Total paid</span>
              <span className="font-bold text-emerald-600">KSh {totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pending Payments</span>
              <span className="font-bold text-amber-600">{pendingCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-slate-100 mb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">My Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-slate-500 text-sm">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-left border-b border-slate-100">
              <tr><th className="pb-2">Due Date</th><th className="pb-2">Paid Date</th><th className="pb-2">Amount</th><th className="pb-2">Status</th></tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="py-3">{p.due_date}</td>
                  <td className="py-3">{p.payment_date || '—'}</td>
                  <td className="py-3 font-medium">KSh {p.amount}</td>
                  <td className="py-3"><StatusBadge value={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-700">Maintenance Requests</h2>
          <button onClick={() => setShowForm((s) => !s)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm transition">
            {showForm ? 'Cancel' : '+ New Request'}
          </button>
        </div>

        {showForm && leases.length > 0 && (
          <form onSubmit={submitRequest} className="space-y-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Which house is this for?</label>
              <select className="w-full border p-2 rounded" required
                      value={reqForm.unit} onChange={(e) => setReqForm({ ...reqForm, unit: e.target.value })}>
                <option value="">Select a house</option>
                {leases.map(l => (
                  <option key={l.id} value={l.unit}>{l.unit_label}</option>
                ))}
              </select>
            </div>
            <input className="w-full border p-2 rounded" placeholder="Title (e.g. Leaking sink)" required
                   value={reqForm.title} onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })} />
            <textarea className="w-full border p-2 rounded" rows={3} placeholder="Describe the issue..." required
                      value={reqForm.description} onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })} />
            <select className="border p-2 rounded"
                    value={reqForm.priority} onChange={(e) => setReqForm({ ...reqForm, priority: e.target.value })}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm w-full md:w-auto">
              Submit Request
            </button>
          </form>
        )}

        {requests.length === 0 ? (
          <p className="text-slate-500 text-sm">No maintenance requests yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="border border-slate-100 p-4 rounded-lg">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{r.title}</h3>
                      <StatusBadge value={r.priority} />
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{r.description}</p>
                    <p className="text-xs text-slate-400">House: {r.unit_label}</p>
                  </div>
                  <StatusBadge value={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
