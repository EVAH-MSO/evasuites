import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { canManage } from '../roles';

const emptyProperty = { name: '', address: '', city: '', property_type: 'apartment' };

export default function Properties() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState(emptyProperty);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  
  const [bulkForm, setBulkForm] = useState({
    prefix: 'House', start: 1, end: 10, unit_type: 'Bedsitter', bedrooms: 1, rent_amount: ''
  });
  
  const canEdit = canManage(user);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/properties/');
      setItems(data.results ?? data);
    } catch { setError('Failed to load properties'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submitProperty = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api.post('/properties/', form);
      setForm(emptyProperty); setShowForm(false); load();
    } catch (err) { setError(JSON.stringify(err.response?.data ?? 'Failed')); }
  };

  const delProperty = async (id) => {
    if (!confirm('Delete this property and ALL its units?')) return;
    try { await api.delete('/properties/' + id + '/'); load(); }
    catch { alert('Delete failed'); }
  };

  const handleBulkAdd = async (propertyId) => {
    if (!bulkForm.rent_amount) { alert('Please enter a rent amount'); return; }
    try {
      await api.post('/units/bulk_create/', { ...bulkForm, property: propertyId });
      alert(`Successfully created ${bulkForm.prefix} ${bulkForm.start} to ${bulkForm.end}!`);
      setBulkForm({ prefix: 'House', start: 1, end: 10, unit_type: 'Bedsitter', bedrooms: 1, rent_amount: '' });
      load();
    } catch (err) { alert(JSON.stringify(err.response?.data ?? 'Failed')); }
  };

  // NEW: Edit individual unit price
  const editUnitPrice = async (unit) => {
    const newRent = prompt(`Enter new rent (KSh) for ${unit.unit_number}:`, unit.rent_amount);
    if (newRent && !isNaN(newRent)) {
      try {
        await api.patch('/units/' + unit.id + '/', { rent_amount: newRent });
        load();
      } catch { alert('Failed to update price'); }
    }
  };

  const delUnit = async (id) => {
    if (!confirm('Delete this unit?')) return;
    try { await api.delete('/units/' + id + '/'); load(); }
    catch { alert('Delete failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Properties & Units</h1>
          <p className="text-sm text-slate-500">Manage your buildings and generate houses in bulk.</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm((s) => !s)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow transition">
            {showForm ? 'Cancel' : '+ New Property'}
          </button>
        )}
      </div>

      {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4 text-sm">{error}</p>}

      {showForm && canEdit && (
        <form onSubmit={submitProperty} className="bg-white p-6 rounded-xl shadow border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <input className="border p-2 rounded-lg" placeholder="Property Name (e.g. Eva Heights)" required
                 value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border p-2 rounded-lg" placeholder="Address" required
                 value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="border p-2 rounded-lg" placeholder="City" required
                 value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <select className="border p-2 rounded-lg" value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
            <option value="apartment">Apartment Building</option>
            <option value="house">Gated Community / Houses</option>
            <option value="commercial">Commercial</option>
          </select>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium py-2 md:col-span-4 transition">
            Save Property
          </button>
        </form>
      )}

      {loading ? <p className="text-slate-500">Loading...</p> : items.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-100 border-dashed">
          <p className="text-slate-500 text-lg">No properties yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((p) => {
            const unitCount = p.units?.length ?? 0;
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                <div className="p-5 flex justify-between items-center bg-white hover:bg-slate-50 transition">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">{p.name}</h3>
                    <p className="text-sm text-slate-500">{p.address}, {p.city} • <span className="capitalize">{p.property_type}</span></p>
                    <p className="text-xs font-medium text-indigo-600 mt-1">{unitCount} Units</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setExpanded(isOpen ? null : p.id)}
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-medium transition">
                      {isOpen ? 'Close Units' : 'Manage Units'}
                    </button>
                    {canEdit && (
                      <button onClick={() => delProperty(p.id)} className="text-red-500 hover:text-red-700 text-sm p-2">
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-200 bg-slate-50 p-6">
                    {canEdit && (
                      <div className="bg-white border border-indigo-100 p-5 rounded-xl shadow-sm mb-6">
                        <h4 className="font-semibold text-indigo-900 mb-2">Bulk Add Units</h4>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Prefix</label>
                            <input className="w-full border p-2 rounded-lg text-sm" value={bulkForm.prefix}
                                   onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Start No.</label>
                            <input className="w-full border p-2 rounded-lg text-sm" type="number" value={bulkForm.start}
                                   onChange={(e) => setBulkForm({ ...bulkForm, start: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">End No.</label>
                            <input className="w-full border p-2 rounded-lg text-sm" type="number" value={bulkForm.end}
                                   onChange={(e) => setBulkForm({ ...bulkForm, end: e.target.value })} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs text-slate-500 mb-1 block">Room Type</label>
                            <select className="w-full border p-2 rounded-lg text-sm" value={bulkForm.unit_type}
                                    onChange={(e) => {
                                      const type = e.target.value;
                                      let beds = 0;
                                      if (type === 'Bedsitter') beds = 1;
                                      else if (type === '1 Bedroom') beds = 1;
                                      else if (type === '2 Bedroom') beds = 2;
                                      setBulkForm({ ...bulkForm, unit_type: type, bedrooms: beds });
                                    }}>
                              <option value="Single Room">Single Room</option>
                              <option value="Bedsitter">Bedsitter / Studio</option>
                              <option value="1 Bedroom">1 Bedroom</option>
                              <option value="2 Bedroom">2 Bedrooms</option>
                              <option value="3 Bedroom">3 Bedrooms</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Rent (KSh)</label>
                            <input className="w-full border p-2 rounded-lg text-sm" type="number" placeholder="e.g. 5000" value={bulkForm.rent_amount}
                                   onChange={(e) => setBulkForm({ ...bulkForm, rent_amount: e.target.value })} />
                          </div>
                          <button onClick={() => handleBulkAdd(p.id)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg text-sm font-medium transition w-full md:col-span-6">
                            Generate {bulkForm.end - bulkForm.start + 1} Units
                          </button>
                        </div>
                      </div>
                    )}

                    {unitCount === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-4">No units yet. Use the Bulk Add form above.</p>
                    ) : (
                      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100 text-slate-600 text-left">
                            <tr>
                              <th className="p-3">House / Unit</th>
                              <th className="p-3">Type</th>
                              <th className="p-3">Rent</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.units.map((u) => (
                              <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="p-3 font-medium text-slate-800">{u.unit_number}</td>
                                <td className="p-3 text-slate-600">{u.unit_type}</td>
                                <td className="p-3 text-slate-600 font-semibold">KSh {u.rent_amount}</td>
                                <td className="p-3">
                                  <span className={'text-xs px-2 py-1 rounded-full font-medium capitalize ' +
                                    (u.status === 'available' ? 'bg-emerald-100 text-emerald-700'
                                     : u.status === 'occupied' ? 'bg-blue-100 text-blue-700'
                                     : 'bg-amber-100 text-amber-700')}>
                                    {u.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right space-x-3">
                                  {canEdit && (
                                    <>
                                      <button onClick={() => editUnitPrice(u)} className="text-indigo-600 text-xs hover:underline">
                                        Edit Price
                                      </button>
                                      <button onClick={() => delUnit(u.id)} className="text-red-500 text-xs hover:underline">
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
