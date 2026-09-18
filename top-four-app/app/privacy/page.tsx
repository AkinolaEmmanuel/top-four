import type { Metadata } from 'next';
import { PrivacyScreen } from '../components/legal/PrivacyScreen';

export const metadata: Metadata = {
  title: 'Privacy policy — TopFour',
  description: 'What TopFour collects about you, why, who else sees it, and what you can ask us to do about it.',
};

export default function PrivacyPage() {
  return <PrivacyScreen />;
}
