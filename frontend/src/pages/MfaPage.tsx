import { useState } from 'react';
import { api } from '../api/client';

export default function MfaPage() {
  const [setup, setSetup] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const startSetup = async () => {
    setError('');
    try {
      const res = await api.mfaSetup();
      setSetup(res);
      setMessage('Scan the QR URL in Google Authenticator, then enter the code to enable MFA.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    }
  };

  const enableMfa = async () => {
    try {
      await api.mfaVerify(parseInt(code, 10));
      setMessage('MFA enabled successfully!');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  const disableMfa = async () => {
    try {
      await api.mfaDisable(parseInt(code, 10));
      setMessage('MFA disabled.');
      setSetup(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disable failed');
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Multi-Factor Authentication</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <button onClick={startSetup} className="w-full py-2 bg-emerald-600 rounded-lg hover:bg-emerald-500">
          Generate TOTP Secret
        </button>

        {setup && (
          <div className="text-sm space-y-2">
            <p className="text-slate-400">Secret: <code className="text-emerald-400 break-all">{setup.secret}</code></p>
            <p className="text-slate-400 break-all">QR URL: <code className="text-xs">{setup.qrCodeUrl}</code></p>
          </div>
        )}

        <input
          type="text"
          maxLength={6}
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-center text-xl tracking-widest"
        />

        <div className="flex gap-2">
          <button onClick={enableMfa} className="flex-1 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-500">
            Enable MFA
          </button>
          <button onClick={disableMfa} className="flex-1 py-2 bg-red-800 rounded-lg hover:bg-red-700">
            Disable MFA
          </button>
        </div>

        {message && <p className="text-emerald-400 text-sm">{message}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
}
