import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const STAFF_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/properties', label: 'Properties' },
  { to: '/tenants', label: 'Tenants' },
  { to: '/leases', label: 'Leases' },
  { to: '/payments', label: 'Payments' },
  { to: '/maintenance', label: 'Maintenance' },
  { to: '/profile', label: 'My Profile' },
];

const TENANT_LINKS = [
  { to: '/portal', label: 'Dashboard' },
  { to: '/profile', label: 'My Profile' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const handleLogout = () => { logout(); nav('/login'); };

  const isTenant = user?.role === 'tenant' && !user?.is_superuser;
  const links = isTenant ? TENANT_LINKS : STAFF_LINKS;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-slate-100 p-6 flex flex-col">
        <Link to={isTenant ? '/portal' : '/dashboard'} className="text-2xl font-bold mb-8 block">
          🏠 EvaSuites
        </Link>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
                  className={'block px-3 py-2 rounded transition ' +
                    (pathname === l.to ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800')}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-slate-700 pt-4">
          <p className="text-sm text-slate-400 mb-2">
            {user?.username}
            <span className="text-xs text-indigo-300 ml-1">({user?.role})</span>
          </p>
          <button onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-sm">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
