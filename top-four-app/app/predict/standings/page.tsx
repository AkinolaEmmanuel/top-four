'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StandingsPickerMobile } from '../../components/predict/StandingsPickerMobile';
import { StandingsPickerDesktop } from '../../components/predict/StandingsPickerDesktop';
import { submitCustomAnswer } from '@/lib/api/custom-questions';
import { useCatalogueCompetitions, useCompetitionSeasons, useSeasonTeams } from '@/hooks/api/useCatalogue';

function StandingsPredictionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leagueId = searchParams.get('leagueId');
  const questionId = searchParams.get('questionId');

  // Competitions & Teams from live Catalogue
  const { data: competitions = [], isLoading: isLoadingComps } = useCatalogueCompetitions();
  const [selectedCompId, setSelectedCompId] = useState<string>('');

  useEffect(() => {
    if (competitions.length > 0 && !selectedCompId) {
      const pl = competitions.find((c) => c.slug === 'premier-league') || competitions[0];
      setSelectedCompId(pl.id);
    }
  }, [competitions, selectedCompId]);

  const { data: seasons = [] } = useCompetitionSeasons(selectedCompId);
  const activeSeason = seasons.find((s) => s.selectableForNewLeague) || seasons[0];

  const { data: teams = [], isLoading: isLoadingTeams } = useSeasonTeams(activeSeason?.id);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async ({ mode, formattedAnswer }: { mode: string; formattedAnswer: any; rawData: any }) => {
    setIsSaving(true);
    try {
      if (leagueId && questionId) {
        await submitCustomAnswer(leagueId, questionId, 0, formattedAnswer);
        setSaveMessage('Standings prediction saved to league custom question!');
        setTimeout(() => router.push(`/leagues/${leagueId}/questions`), 1200);
      } else {
        setSaveMessage('Standings prediction saved in custom question format!');
        setTimeout(() => router.push('/predict'), 1200);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save prediction');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (leagueId) {
      router.push(`/leagues/${leagueId}/questions`);
    } else {
      router.back();
    }
  };

  return (
    <>
      {saveMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 p-[12px_24px] rounded-[12px] bg-[var(--color-success)] text-white font-heading font-bold text-[13px] shadow-lg animate-in fade-in slide-in-from-top-2">
          {saveMessage}
        </div>
      )}
      <div className="md:hidden h-full flex flex-col">
        <StandingsPickerMobile
          teams={teams}
          competitions={competitions}
          selectedCompId={selectedCompId}
          onSelectComp={setSelectedCompId}
          isLoadingTeams={isLoadingComps || isLoadingTeams}
          onSave={handleSave}
          onBack={handleBack}
          isSaving={isSaving}
        />
      </div>
      <div className="hidden md:flex h-full flex-col">
        <StandingsPickerDesktop
          teams={teams}
          competitions={competitions}
          selectedCompId={selectedCompId}
          onSelectComp={setSelectedCompId}
          isLoadingTeams={isLoadingComps || isLoadingTeams}
          onSave={handleSave}
          onBack={handleBack}
          isSaving={isSaving}
        />
      </div>
    </>
  );
}

export default function StandingsPredictionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 grid place-items-center bg-[var(--surface-canvas)] text-[var(--text-muted)] font-heading font-semibold">
          Loading Tournament & Squads...
        </div>
      }
    >
      <StandingsPredictionContent />
    </Suspense>
  );
}
