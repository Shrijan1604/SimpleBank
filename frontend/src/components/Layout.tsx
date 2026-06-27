import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-emerald-400">Enterprise Banking</span>
          <div className="flex gap-4 text-sm">
            <Link to="/" className="hover:text-emerald-400">Dashboard</Link>
            <Link to="/transfer" className="hover:text-emerald-400">Transfer</Link>
            <Link to="/ledger" className="hover:text-emerald-400">Ledger</Link>
            <Link to="/mfa" className="hover:text-emerald-400">MFA</Link>
            <Link to="/admin" className="hover:text-emerald-400">Admin</Link>
            <button onClick={logout} className="text-red-400 hover:text-red-300">Logout</button>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
