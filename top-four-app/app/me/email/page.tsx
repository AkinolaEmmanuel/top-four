'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequestEmailChange } from '@/hooks/api/useAccount';
import { useAuth } from '@/context/auth-context';

export default function EmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const requestEmailChange = useRequestEmailChange();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setError('');
    if (!email.trim() || email === user?.email) return;

    requestEmailChange.mutate(
      { currentPassword: currentPassword.trim() || undefined, newEmail: email.trim() } as any,
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (err: any) => {
          setError(err.message || 'Failed to request email change');
        }
      }
    );
  };

  return (
    <div className="flex-1 bg-[var(--surface-canvas)] flex flex-col min-h-0 text-[var(--text-primary)] font-['Sora',sans-serif] overflow-y-auto">
      <div className="max-w-[700px] w-full mx-auto p-[24px_20px] md:p-[40px_32px] flex flex-col gap-[24px]">
        {/* Header / Breadcrumbs */}
        <div className="flex items-center gap-[12px] pb-[16px] border-b border-[var(--surface-border)]">
          <Link href="/me" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-[6px] transition-colors">
            <span>‹</span> Account Settings
          </Link>
          <span className="text-[var(--surface-border-strong)]">/</span>
          <span className="text-[13px] font-heading font-semibold text-[var(--text-primary)]">Change Email</span>
        </div>

        {/* Card Form Container */}
        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[18px] p-[28px_24px] md:p-[32px] shadow-[var(--elev-2)]">
          <h1 className="font-heading font-bold text-[20px] tracking-[-0.3px]">Email Address</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-[4px]">
            A confirmation link will be sent to your new address. It must be confirmed within 24 hours.
          </p>

          <div className="mt-[24px] space-y-[18px]">
            <div>
              <label className="block text-[12px] font-heading font-semibold text-[var(--text-secondary)] mb-[6px]">
                Current Password (for verification)
              </label>
              <input 
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] rounded-[10px] h-[46px] px-[14px] text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--color-brand)] focus:shadow-[0_0_0_1px_var(--color-brand)] transition-all"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-[12px] font-heading font-semibold text-[var(--text-secondary)] mb-[6px]">
                New Email Address
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] rounded-[10px] h-[46px] px-[14px] text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--color-brand)] focus:shadow-[0_0_0_1px_var(--color-brand)] transition-all"
                placeholder="new-address@example.com"
              />
            </div>

            {error && (
              <div className="p-[10px_14px] rounded-[8px] bg-[rgba(239,68,68,0.1)] border border-[var(--color-danger)] text-[var(--danger-text)] text-[12.5px]">
                {error}
              </div>
            )}

            {success ? (
              <div className="p-[14px] rounded-[10px] bg-[rgba(34,197,94,0.1)] border border-[var(--color-success)] text-[var(--success-text)] text-[13px] leading-[1.5]">
                Verification email sent! Please check your new inbox to complete the change.
              </div>
            ) : (
              <div className="flex items-center gap-[12px] pt-[8px]">
                <button 
                  onClick={handleSave}
                  disabled={!email.trim() || email === user?.email || requestEmailChange.isPending}
                  className="h-[46px] px-[24px] rounded-[11px] bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white font-heading font-bold text-[13.5px] shadow-[var(--elev-glow)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {requestEmailChange.isPending ? 'Requesting...' : 'Request Change'}
                </button>
                <button 
                  onClick={() => router.push('/me')}
                  className="h-[46px] px-[20px] rounded-[11px] border border-[var(--surface-border-strong)] hover:bg-[var(--surface-subtle)] text-[13px] font-heading font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
