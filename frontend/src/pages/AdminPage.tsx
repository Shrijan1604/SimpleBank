import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminPage() {
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getResilienceStatus()
      .then((res) => setSimulateFailure(res.simulateFailure))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async () => {
    const next = !simulateFailure;
    const res = await api.setResilienceStatus(next);
    setSimulateFailure(res.simulateFailure);
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Resilience Controls</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400 text-sm mb-4">
          Toggle to simulate external payment gateway and notification service failures.
          Transfers will use Resilience4j circuit breaker fallbacks instead of crashing.
        </p>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={toggle}
            disabled={loading}
            className="w-5 h-5 accent-emerald-500"
          />
          <span className="font-medium">
            {simulateFailure ? 'Simulating failures (fallback active)' : 'Services operating normally'}
          </span>
        </label>

        {simulateFailure && (
          <div className="mt-4 p-3 bg-amber-900/30 border border-amber-800 rounded text-amber-200 text-sm">
            Payment gateway and notification services will return FALLBACK responses on transfers.
          </div>
        )}
      </div>
    </div>
  );
}
