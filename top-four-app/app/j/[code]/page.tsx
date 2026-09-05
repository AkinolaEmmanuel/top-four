'use client';

import { useParams } from 'next/navigation';
import { InviteLanding } from '@/app/components/invite/InviteLanding';

export default function InviteCodeLinkPage() {
  const params = useParams() as { code: string };
  return <InviteLanding credential={{ joinCode: params.code }} returnPath={`/j/${params.code}`} />;
}
