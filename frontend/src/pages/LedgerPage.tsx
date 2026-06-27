import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function LedgerPage() {
  const [accountId, setAccountId] = useState('');
  const [ledger, setLedger] = useState<Array<{
    id: number;
    transactionType: string;
    amount: number;
    balanceAfter: number;
    maskedAccountNumber: string;
    createdAt: string;
    createdBy: string;
    reference: string;
  }>>([]);
  const [revisions, setRevisions] = useState<Array<{
    revisionNumber: number;
    balance: number;
    revisionTimestamp: string;
  }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMyAccounts().then((accounts) => {
      if (accounts.length > 0) setAccountId(String(accounts[0].id));
    });
  }, []);

  const load = async () => {
    if (!accountId) return;
    setError('');
    try {
      const [ledgerData, revisionData] = await Promise.all([
        api.getLedger(parseInt(accountId, 10)),
        api.getRevisions(parseInt(accountId, 10)),
      ]);
      setLedger(ledgerData);
      setRevisions(revisionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ledger');
    }
  };

  useEffect(() => {
    if (accountId) load();
  }, [accountId]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Log & Ledger</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="number"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="Account ID"
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
        />
        <button onClick={load} className="px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-500">
          Load
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded text-red-300">{error}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-emerald-400 mb-3">Immutable Ledger</h2>
          <div className="space-y-3">
            {ledger.map((entry) => (
              <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="font-medium">{entry.transactionType}</span>
                  <span className="text-emerald-400">${entry.amount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Balance after: ${entry.balanceAfter.toFixed(2)} | Acct: {entry.maskedAccountNumber}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {new Date(entry.createdAt).toLocaleString()} by {entry.createdBy}
                </p>
                {entry.reference && <p className="text-xs text-slate-600">Ref: {entry.reference}</p>}
              </div>
            ))}
            {ledger.length === 0 && <p className="text-slate-500 text-sm">No ledger entries</p>}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-emerald-400 mb-3">Account Revisions (Envers)</h2>
          <div className="space-y-3">
            {revisions.map((rev) => (
              <div key={rev.revisionNumber} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <p className="font-medium">Revision #{rev.revisionNumber}</p>
                <p className="text-sm text-slate-400">Balance: ${rev.balance?.toFixed(2)}</p>
                <p className="text-xs text-slate-600">{new Date(rev.revisionTimestamp).toLocaleString()}</p>
              </div>
            ))}
            {revisions.length === 0 && <p className="text-slate-500 text-sm">No revisions</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
