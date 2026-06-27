import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

interface Account {
  id: number;
  accountHolderName: string;
  balance: number;
  maskedAccountNumber: string;
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyAccounts();
      setAccounts(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const createAccount = async () => {
    try {
      await api.createAccount({ accountHolderName: 'My Account', balance: 1000 });
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Account Summary</h1>
        <div className="flex gap-2">
          <button
            onClick={loadAccounts}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={createAccount} className="px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-500">
            New Account
          </button>
        </div>
      </div>

      {lastRefresh && (
        <p className="text-xs text-slate-500 mb-4">Last refreshed: {lastRefresh.toLocaleTimeString()}</p>
      )}
      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded text-red-300">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <div key={account.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm">{account.accountHolderName}</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">
              ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-slate-500 text-sm mt-2">Acct: {account.maskedAccountNumber || '****'}</p>
            <p className="text-slate-600 text-xs mt-1">ID: {account.id}</p>
          </div>
        ))}
      </div>

      {accounts.length === 0 && !loading && (
        <p className="text-slate-500 text-center py-12">No accounts yet. Create one to get started.</p>
      )}
    </div>
  );
}
