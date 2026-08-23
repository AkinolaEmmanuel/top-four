'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StandingsPickerMobile } from '../../components/predict/StandingsPickerMobile';
import { StandingsPickerDesktop } from '../../components/predict/StandingsPickerDesktop';

export default function StandingsPredictionPage() {
  const router = useRouter();

  const handleSave = (standings: string[]) => {
    alert("Standings saved! " + JSON.stringify(standings));
    router.push('/predict');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <div className="md:hidden h-full flex flex-col">
        <StandingsPickerMobile onSave={handleSave} onBack={handleBack} />
      </div>
      <div className="hidden md:flex h-full flex-col">
        <StandingsPickerDesktop onSave={handleSave} onBack={handleBack} />
      </div>
    </>
  );
}
