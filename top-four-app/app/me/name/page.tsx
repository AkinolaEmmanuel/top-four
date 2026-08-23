'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateDisplayName } from '@/hooks/api/useAccount';
import { useAuth } from '@/context/auth-context';

export default function NamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const updateName = useUpdateDisplayName();
  
  const [name, setName] = useState(user?.displayName || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    updateName.mutate(name.trim(), {
      onSuccess: () => {
        router.push('/me');
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to update name');
      }
    });
  };

  return (
    <div className="flex-1 bg-[var(--surface-canvas)] flex flex-col h-full text-[var(--text-primary)]">
      <div className="h-[54px] flex items-end px-[24px] pb-[11px] border-b border-[var(--surface-border-strong)] flex-none">
        <div className="flex items-center gap-[15px]">
          <button onClick={() => router.back()} className="text-[20px] text-[var(--text-muted)] mt-[-2px]">‹</button>
          <span className="font-heading font-bold text-[14.5px]">Change Name</span>
        </div>
      </div>
      <div className="p-[24px] max-w-[400px]">
        <label className="block text-[12px] text-[var(--text-secondary)] mb-[8px]">Display Name</label>
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[var(--surface-card)] border border-[var(--surface-border-strong)] rounded-[8px] h-[46px] px-[14px] text-[14px] outline-none focus:border-[var(--color-brand)]"
          placeholder="Your name"
        />
        {error && <div className="text-[var(--danger-text)] text-[12px] mt-[8px]">{error}</div>}
        <button 
          onClick={handleSave}
          disabled={!name.trim() || updateName.isPending}
          className="mt-[24px] w-full h-[46px] rounded-[10px] bg-[var(--color-brand)] text-[var(--color-on-brand)] font-heading font-bold text-[14px] disabled:opacity-50"
        >
          {updateName.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
