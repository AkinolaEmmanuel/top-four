import type { Metadata } from 'next';
import { TermsScreen } from '../components/legal/TermsScreen';

export const metadata: Metadata = {
  title: 'Terms of service — TopFour',
  description: 'The rules for using TopFour: a free football prediction game with no entry fees, no stakes and no prizes.',
};

export default function TermsPage() {
  return <TermsScreen />;
}
