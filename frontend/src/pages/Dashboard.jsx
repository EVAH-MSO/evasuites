import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    properties: 0, tenants: 0, leases: 0, payments: 0, maintenance: 0,
    revenue: 0, overdue: 0, openMaint: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const get = async (ep) => {
        try { const { data } = await api.get('/' + ep + '/'); return data.results ?? data; }
        catch { return []; }
      };
      const [props, tens, leases, pays, maint] = await Promise.all([
        get('properties'), get('tenants'), get('leases'), get('payments'), get('maintenance'),
      ]);

      // Build monthly revenue for last 6 months
      const months = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('en', { month: 'short' });
        months[key] = 0;
      }
      pays.filter((p) => p.status === 'paid').forEach((p) => {
        const d = new Date(p.payment_date);
        const key = d.toLocaleString('en', { month: 'short' });
        if (key in months) months[key] += parseFloat(p.amount || 0);
      });
      setChartData(Object.entries(months).map(([month, revenue]) => ({ month, revenue })));

      setStats({
        properties: props.length,
        tenants: tens.length,
        leases: leases.filter((l) => l.status === 'active').length,
        payments: pays.length,
        maintenance: maint.length,
        revenue: pays.filter((p) => p.status === 'paid')
                    .reduce((s, p) => s + parseFloat(p.amount || 0), 0),
        overdue: pays.filter((p) => p.status === 'late' || p.status === 'pending').length,
        openMaint: maint.filter((m) => m.status !== 'resolved').length,
      });
    };
    load();
  }, []);

  const cards = [
    { label: 'Properties', value: stats.properties, to: '/properties', color: 'bg-blue-500' },
    { label: 'Tenants', value: stats.tenants, to: '/tenants', color: 'bg-emerald-500' },
    { label: 'Active Leases', value: stats.leases, to: '/leases', color: 'bg-amber-500' },
    { label: 'Payments', value: stats.payments, to: '/payments', color: 'bg-purple-500' },
    { label: 'Open Requests', value: stats.openMaint, to: '/maintenance', color: 'bg-rose-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-1">
        Welcome back, {user?.first_name || user?.username}
      </h1>
      <p className="text-slate-500 mb-8">Here is an overview of your portfolio.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}
                className={c.color + ' text-white p-5 rounded-xl shadow hover:scale-[1.03] transition'}>
            <p className="text-sm opacity-90">{c.label}</p>
            <p className="text-3xl font-bold mt-2">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow border border-slate-100">
          <p className="text-sm text-slate-500">Total Revenue (paid)</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            ${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-slate-100">
          <p className="text-sm text-slate-500">Overdue / Pending</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-slate-100">
          <p className="text-sm text-slate-500">Unresolved Maintenance</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{stats.openMaint}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Revenue - Last 6 Months</h2>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip formatter={(v) => 'KSh ' + Number(v).toLocaleString()} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
