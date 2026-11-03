import { useEffect, useState, useMemo } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { canManage } from '../roles';
import SearchBar from '../components/SearchBar';

const emptyForm = {
  username: '', email: '', password: '', first_name: '', last_name: '',
  phone: '', national_id: '', emergency_contact: '', date_of_birth: '',
  selectedProperty: '', unit_id: '', lease_start: '', lease_end: '', rent_amount: ''
};

export default function Tenants() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [properties, setProperties] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const canEdit = canManage(user);

  const load = async () => {
    try {
      setLoading(true);
      const [tRes, pRes, uRes] = await Promise.all([
        api.get('/tenants/'), api.get('/properties/'), api.get('/units/')
      ]);
      setItems(tRes.data.results ?? tRes.data);
      setProperties(pRes.data.results ?? pRes.data);
      setAllUnits(uRes.data.results ?? uRes.data);
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Filter units based on selected property (only show "available" ones)
  const availableUnits = useMemo(() => {
    if (!form.selectedProperty) return [];
    return allUnits.filter(u => u.property.toString() === form.selectedProperty && u.status === 'available');
  }, [allUnits, form.selectedProperty]);

  // When a unit is selected, auto-fill the rent amount
  const handleUnitChange = (unitId) => {
    const unit = allUnits.find(u => u.id.toString() === unitId);
    setForm({ ...form, unit_id: unitId, rent_amount: unit ? unit.rent_amount : '' });
  };

  const filteredTenants = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return items;
    return items.filter((t) => {
      const s = [t.user?.username, t.user?.first_name, t.user?.last_name, t.user?.email, t.user?.phone].filter(Boolean).join(' ').toLowerCase();
      return s.includes(q);
    });
  }, [items, query]);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (form.unit_id && !form.lease_start) {
      setError('Please provide a Move-In Date for the lease.');
      return;
    }
    try {
      // Clean up empty strings to prevent Date format errors
      const payload = {
        ...form,
        role: 'tenant',
        date_of_birth: form.date_of_birth || null,
        lease_start: form.lease_start || null,
        lease_end: form.lease_end || null,
        rent_amount: form.rent_amount || null,
        unit_id: form.unit_id || null,
      };
      delete payload.selectedProperty; // This is just for the UI dropdown

      await api.post('/register/', payload);
      setForm(emptyForm); setShowForm(false); load();
    } catch (err) { 
      setError(JSON.stringify(err.response?.data ?? 'Failed to create tenant')); 
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this tenant? This will also remove their lease.')) return;
    try { await api.delete('/tenants/' + id + '/'); load(); }
    catch { alert('Delete failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tenants</h1>
          <p className="text-sm text-slate-500">Add people and assign them to a specific house.</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm((s) => !s)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow transition">
            {showForm ? 'Cancel' : '+ Add Tenant'}
          </button>
        )}
      </div>

      <div className="mb-6 max-w-md">
        <SearchBar value={query} onChange={setQuery} placeholder="Search tenants..." />
      </div>

      {error && <p className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg mb-6 text-sm">{error}</p>}

      {showForm && canEdit && (
        <div className="bg-white p-6 rounded-xl shadow border border-slate-200 mb-8 animate-fade-in">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-semibold text-slate-800">Create New Tenant</h2>
            <p className="text-sm text-slate-500 mt-1">Fields marked with <span className="text-red-500 font-bold">*</span> are required.</p>
          </div>
          
          <form onSubmit={submit} className="space-y-6">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                <input className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" required
                       value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name <span className="text-slate-400 font-normal text-xs">(Optional)</span></label>
                <input className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                       value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
            </div>

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
                <input className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" required
                       value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" type="email" required
                       value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password <span className="text-red-500">*</span></label>
                <input className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none" type="password" required minLength={6}
                       value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone <span className="text-slate-400 font-normal text-xs">(Optional)</span></label>
                <input className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                       value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            {/* ASSIGN TO HOUSE */}
            <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
              <h3 className="text-sm font-semibold text-indigo-900 mb-4">Assign to Property & House</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-indigo-900 mb-1">1. Select Property</label>
                  <select className="w-full border border-indigo-200 p-2 rounded-lg text-sm" 
                          value={form.selectedProperty} onChange={(e) => setForm({ ...form, selectedProperty: e.target.value, unit_id: '', rent_amount: '' })}>
                    <option value="">-- Choose Property --</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-indigo-900 mb-1">2. Select House</label>
                  <select className="w-full border border-indigo-200 p-2 rounded-lg text-sm" 
                          value={form.unit_id} onChange={(e) => handleUnitChange(e.target.value)} disabled={!form.selectedProperty}>
                    <option value="">-- Choose House --</option>
                    {availableUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.unit_number} ({u.unit_type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-indigo-900 mb-1">Rent (KSh)</label>
                  <input className="w-full border border-indigo-200 p-2 rounded-lg text-sm bg-indigo-100" readOnly
                         value={form.rent_amount} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-indigo-900 mb-1">Move-In Date</label>
                  <input className="w-full border border-indigo-200 p-2 rounded-lg text-sm" type="date"
                         value={form.lease_start} onChange={(e) => setForm({ ...form, lease_start: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-900 mb-1">Move-Out Date <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input className="w-full border border-indigo-200 p-2 rounded-lg text-sm" type="date"
                         value={form.lease_end} onChange={(e) => setForm({ ...form, lease_end: e.target.value })} />
                  <p className="text-[10px] text-indigo-600 mt-1">Leave blank if tenant is month-to-month.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 px-4 py-2 mr-2 font-medium">Cancel</button>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium py-2.5 px-6 shadow transition">Create Tenant Account</button>
            </div>
          </form>
        </div>
      )}

      {/* Tenants Table */}
      {loading ? <p className="text-slate-500">Loading...</p> : filteredTenants.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-100 border-dashed">
          <p className="text-slate-500 text-lg">{query ? 'No tenants match your search.' : 'No tenants yet.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Contact Info</th>
                <th className="p-4 font-medium">Profile Details</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{t.user?.first_name} {t.user?.last_name}</p>
                    <p className="text-xs text-slate-500">@{t.user?.username}</p>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    <p>{t.user?.email}</p>
                    <p>{t.user?.phone || 'No phone'}</p>
                  </td>
                  <td className="p-4 text-slate-600 text-xs">
                    <p><span className="font-semibold text-slate-400">ID:</span> {t.national_id || '—'}</p>
                    <p><span className="font-semibold text-slate-400">DOB:</span> {t.date_of_birth || '—'}</p>
                    <p><span className="font-semibold text-slate-400">Emergency:</span> {t.emergency_contact || '—'}</p>
                  </td>
                  <td className="p-4 text-right">
                    {canEdit && (
                      <button onClick={() => del(t.id)} className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 bg-red-50 rounded transition">
                        Delete
                      </button>
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
