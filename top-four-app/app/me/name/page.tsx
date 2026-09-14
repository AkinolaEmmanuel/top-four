'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUpdateDisplayName } from '@/hooks/api/useAccount';
import { useAuth } from '@/context/auth-context';

export default function NamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const updateName = useUpdateDisplayName();
  
  const [name, setName] = useState(user?.displayName || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    updateName.mutate(name.trim(), {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => router.push('/me'), 1200);
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to update name');
      }
    });
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
          <span className="text-[13px] font-heading font-semibold text-[var(--text-primary)]">Change Display Name</span>
        </div>

        {/* Card Form Container */}
        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[18px] p-[28px_24px] md:p-[32px] shadow-[var(--elev-2)]">
          <h1 className="font-heading font-bold text-[20px] tracking-[-0.3px]">Display Name</h1>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-[4px]">
            This name will be shown on leaderboards, fixture rivals tables, and member rosters.
          </p>

          <div className="mt-[24px] space-y-[18px]">
            <div>
              <label className="block text-[12px] font-heading font-semibold text-[var(--text-secondary)] mb-[6px]">
                New Display Name
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--surface-canvas)] border border-[var(--surface-border-strong)] rounded-[10px] h-[46px] px-[14px] text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--color-brand)] focus:shadow-[0_0_0_1px_var(--color-brand)] transition-all"
                placeholder="Your display name"
                autoFocus
              />
              <span className="block text-[11px] text-[var(--text-muted)] mt-[6px]">
                Between 1 and 100 characters.
              </span>
            </div>

            {error && (
              <div className="p-[10px_14px] rounded-[8px] bg-[rgba(239,68,68,0.1)] border border-[var(--color-danger)] text-[var(--danger-text)] text-[12.5px]">
                {error}
              </div>
            )}

            {success && (
              <div className="p-[10px_14px] rounded-[8px] bg-[rgba(34,197,94,0.1)] border border-[var(--color-success)] text-[var(--success-text)] text-[12.5px]">
                Display name updated! Redirecting...
              </div>
            )}

            <div className="flex items-center gap-[12px] pt-[8px]">
              <button 
                onClick={handleSave}
                disabled={!name.trim() || updateName.isPending}
                className="h-[46px] px-[24px] rounded-[11px] bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90 text-white font-heading font-bold text-[13.5px] shadow-[var(--elev-glow)] disabled:opacity-50 transition-all cursor-pointer"
              >
                {updateName.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => router.push('/me')}
                className="h-[46px] px-[20px] rounded-[11px] border border-[var(--surface-border-strong)] hover:bg-[var(--surface-subtle)] text-[13px] font-heading font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
