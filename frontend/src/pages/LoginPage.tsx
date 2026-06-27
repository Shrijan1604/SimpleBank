import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, completeMfa, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mfaStep, setMfaStep] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [totp, setTotp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mfaStep) {
        await completeMfa(parseInt(totp, 10));
        navigate('/');
        return;
      }
      if (mode === 'register') {
        await register(form.name, form.email, form.password);
        navigate('/');
      } else {
        const result = await login(form.email, form.password);
        if (result.mfaRequired) {
          setMfaStep(true);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-emerald-400 mb-2">
          {mfaStep ? 'MFA Verification' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          {mfaStep ? 'Enter the 6-digit code from your authenticator app' : 'Secure enterprise banking portal'}
        </p>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded text-red-300 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mfaStep ? (
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-center text-2xl tracking-widest"
              required
            />
          ) : (
            <>
              {mode === 'register' && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                required
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mfaStep ? 'Verify' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        {!mfaStep && (
          <p className="mt-4 text-center text-sm text-slate-400">
            {mode === 'login' ? (
              <>No account? <button onClick={() => setMode('register')} className="text-emerald-400">Register</button></>
            ) : (
              <>Have an account? <button onClick={() => setMode('login')} className="text-emerald-400">Login</button></>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
