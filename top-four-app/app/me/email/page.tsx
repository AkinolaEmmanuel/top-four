'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequestEmailChange } from '@/hooks/api/useAccount';
import { useAuth } from '@/context/auth-context';

export default function EmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const requestEmailChange = useRequestEmailChange();
  
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    if (!email.trim() || email === user?.email) return;
    requestEmailChange.mutate(email.trim(), {
      onSuccess: () => {
        setSuccess(true);
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to request email change');
      }
    });
  };

  return (
    <div className="flex-1 bg-[var(--surface-canvas)] flex flex-col h-full text-[var(--text-primary)]">
      <div className="h-[54px] flex items-end px-[24px] pb-[11px] border-b border-[var(--surface-border-strong)] flex-none">
        <div className="flex items-center gap-[15px]">
          <button onClick={() => router.back()} className="text-[20px] text-[var(--text-muted)] mt-[-2px]">‹</button>
          <span className="font-heading font-bold text-[14.5px]">Change Email</span>
        </div>
      </div>
      <div className="p-[24px] max-w-[400px]">
        {success ? (
          <div className="text-[var(--color-success)] text-[14px]">Verification email sent! Please check your new inbox.</div>
        ) : (
          <>
            <label className="block text-[12px] text-[var(--text-secondary)] mb-[8px]">New Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--surface-card)] border border-[var(--surface-border-strong)] rounded-[8px] h-[46px] px-[14px] text-[14px] outline-none focus:border-[var(--color-brand)]"
              placeholder="Enter new email"
            />
            {error && <div className="text-[var(--danger-text)] text-[12px] mt-[8px]">{error}</div>}
            <button 
              onClick={handleSave}
              disabled={!email.trim() || email === user?.email || requestEmailChange.isPending}
              className="mt-[24px] w-full h-[46px] rounded-[10px] bg-[var(--color-brand)] text-[var(--color-on-brand)] font-heading font-bold text-[14px] disabled:opacity-50"
            >
              {requestEmailChange.isPending ? 'Requesting...' : 'Request Change'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
