import type { Metadata } from 'next';
import { HowToPlayScreen } from '../components/how-to-play/HowToPlayScreen';

export const metadata: Metadata = {
  title: 'How to play — TopFour',
  description: 'Create a league, predict every fixture, and let the table settle the argument. Here\'s exactly how TopFour works.',
};

export default function HowToPlayPage() {
  return <HowToPlayScreen />;
}
