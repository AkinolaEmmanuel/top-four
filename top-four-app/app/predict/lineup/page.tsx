'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineupPickerMobile } from '../../components/predict/LineupPickerMobile';
import { LineupPickerDesktop } from '../../components/predict/LineupPickerDesktop';

export default function LineupPredictionPage() {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  // In a real app, use a resize listener to toggle isDesktop, or let CSS handle it.
  // For MVP, we'll assume mobile first.
  
  const handleSave = (picks: any) => {
    alert("Lineup saved! " + JSON.stringify(picks));
    router.push('/predict');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <div className="md:hidden h-full flex flex-col">
        <LineupPickerMobile onSave={handleSave} onBack={handleBack} />
      </div>
      <div className="hidden md:flex h-full flex-col">
        <LineupPickerDesktop onSave={handleSave} onBack={handleBack} />
      </div>
    </>
  );
}
