import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.trim()) nav('/join/' + joinCode.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-indigo-600 text-3xl">🏠</span> EvaSuites
          </Link>
          <div className="flex gap-4 items-center">
            {user ? (
              <Link to={user.role === 'tenant' ? '/portal' : '/dashboard'} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 font-semibold px-4 py-2 hover:text-slate-900 transition">Sign In</Link>
                <Link to="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition shadow-sm">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-indigo-100">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            The #1 Property Manager in Kenya
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            Manage your rentals <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">without the stress.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            EvaSuites replaces your paper rent books. Track single rooms, bedsitters, and apartments. Give tenants their own portal to pay rent and request repairs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 text-center">
              Create Free Landlord Account
            </Link>
          </div>
          <p className="text-sm text-slate-500 mt-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            No credit card required. Free forever for your first 10 units.
          </p>
        </div>

        {/* TENANT JOIN BOX */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl transform rotate-2 scale-105 opacity-20"></div>
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-2xl relative">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Are you a Tenant?</h2>
            <p className="text-slate-600 mb-8 text-lg">Enter your Landlord's username to access your rent portal and request repairs.</p>
            
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Landlord Username</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-300 p-4 rounded-xl text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                  placeholder="e.g. johnkamau" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
              </div>
              <button className="bg-slate-900 text-white w-full py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition">
                Find My House →
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-4 text-center">Don't have an account? Click the button above, and your landlord will approve you.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">How EvaSuites Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">From messy notebooks to a professional digital estate in less than 5 minutes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-6">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Create your Estate</h3>
              <p className="text-slate-600">Register as a Landlord and add your property name. Use our bulk tool to instantly generate 10, 50, or 100 houses at once.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-6">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Add your Tenants</h3>
              <p className="text-slate-600">Assign a house to a tenant, set their rent amount in KSh, and set their move-in date. The system handles the contracts.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-6">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Collect Rent Easily</h3>
              <p className="text-slate-600">Record payments as they come in via M-Pesa or Bank. Tenants can also log in to their portal to see their balance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl mb-4 text-indigo-400">🔍</div>
              <h3 className="text-lg font-bold mb-2">Smart Search</h3>
              <p className="text-slate-400 text-sm">Instantly search for tenants by name, phone number, or national ID.</p>
            </div>
            <div>
              <div className="text-3xl mb-4 text-emerald-400">📊</div>
              <h3 className="text-lg font-bold mb-2">Revenue Dashboard</h3>
              <p className="text-slate-400 text-sm">See exactly how much rent has been collected this month, and who is late.</p>
            </div>
            <div>
              <div className="text-3xl mb-4 text-amber-400">🛠️</div>
              <h3 className="text-lg font-bold mb-2">Maintenance Logs</h3>
              <p className="text-slate-400 text-sm">Tenants report leaks and broken doors. You track the status until it's fixed.</p>
            </div>
            <div>
              <div className="text-3xl mb-4 text-purple-400">🔒</div>
              <h3 className="text-lg font-bold mb-2">Secure Accounts</h3>
              <p className="text-slate-400 text-sm">Bank-level JWT security. Your tenants only see their own house and payments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Is it really free?</h3>
              <p className="text-slate-600">Yes. For small landlords managing under 10 units, EvaSuites is completely free. You only pay a small fee if you manage multiple large apartment blocks.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Can I record M-Pesa payments?</h3>
              <p className="text-slate-600">Absolutely. When you record a payment, you can select "Mobile Money" (M-Pesa) as the method, along with Cash, Bank Transfer, or Card.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Do my tenants need to download an app?</h3>
              <p className="text-slate-600">No. Just send them your unique Landlord Username link. They can log in from any web browser on their phone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200 text-center">
        <p className="text-2xl font-extrabold text-slate-900 mb-2">🏠 EvaSuites</p>
        <p className="text-slate-500 text-sm mb-6">Property Management, Simplified.</p>
        <p className="text-slate-400 text-xs">© 2026 EvaSuites. All rights reserved.</p>
      </footer>
    </div>
  );
}
