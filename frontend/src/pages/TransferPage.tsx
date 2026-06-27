import { useEffect, useState } from 'react';
import { api } from '../api/client';

function generateIdempotencyKey() {
  return crypto.randomUUID();
}

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Array<{ id: number; balance: number }>>([]);
  const [form, setForm] = useState({ fromAccountId: '', toAccountId: '', amount: '', totpCode: '' });
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey());
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getMyAccounts().then((data) => setAccounts(data));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const res = await api.transfer(
        {
          fromAccountId: parseInt(form.fromAccountId, 10),
          toAccountId: parseInt(form.toAccountId, 10),
          amount: parseFloat(form.amount),
          totpCode: form.totpCode || undefined,
        },
        idempotencyKey
      );
      setResult(
        `${res.message}\nPayment: ${res.paymentStatus} — ${res.paymentMessage}\nNotification: ${res.notificationStatus}`
      );
      setIdempotencyKey(generateIdempotencyKey());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resubmitSameKey = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.transfer(
        {
          fromAccountId: parseInt(form.fromAccountId, 10),
          toAccountId: parseInt(form.toAccountId, 10),
          amount: parseFloat(form.amount),
        },
        idempotencyKey
      );
      setResult(`Duplicate key handled: ${res.message} (Payment: ${res.paymentStatus})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resubmit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Fund Transfer</h1>

      <form onSubmit={submit} className="space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div>
          <label className="text-sm text-slate-400">From Account</label>
          <select
            value={form.fromAccountId}
            onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
            required
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.id} — ${a.balance.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-400">To Account ID</label>
          <input
            type="number"
            value={form.toAccountId}
            onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">Amount</label>
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
            required
          />
          <p className="text-xs text-slate-500 mt-1">Transfers ≥ $500 require TOTP if MFA is enabled</p>
        </div>

        <div>
          <label className="text-sm text-slate-400">TOTP Code (high-value transfers)</label>
          <input
            type="text"
            maxLength={6}
            value={form.totpCode}
            onChange={(e) => setForm({ ...form, totpCode: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
            placeholder="Optional"
          />
        </div>

        <div className="text-xs text-slate-500 break-all">
          Idempotency-Key: <span className="text-emerald-400">{idempotencyKey}</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50"
        >
          {submitting ? 'Processing...' : 'Transfer Funds'}
        </button>

        <button
          type="button"
          onClick={resubmitSameKey}
          disabled={submitting}
          className="w-full py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700"
        >
          Test Duplicate (same Idempotency-Key)
        </button>
      </form>

      {error && <div className="mt-4 p-3 bg-red-900/40 border border-red-800 rounded text-red-300">{error}</div>}
      {result && (
        <div className="mt-4 p-4 bg-emerald-900/30 border border-emerald-800 rounded text-emerald-200 whitespace-pre-line">
          {result}
        </div>
      )}
    </div>
  );
}
