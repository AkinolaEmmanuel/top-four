import { apiFetch } from './fetcher';

export interface SettlementJob {
  id: string;
  age: string;
  old?: boolean;
  fixture: string;
  market: string;
  reason: string;
  affected: number;
}

export interface OperatorStats {
  settlement: SettlementJob[];
  late: SettlementJob[];
  provider: SettlementJob[];
  jobs: SettlementJob[];
  notifications: SettlementJob[];
}

// Mocking operator stats since backend isn't ready
export async function fetchOperatorStats(): Promise<OperatorStats> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    settlement: [
      { id: "1", age: "3d 4h", old: true, fixture: "Real Madrid v Milan", market: "Arsenal lineup", reason: "Teamsheet incomplete", affected: 128 },
      { id: "2", age: "2d 11h", fixture: "Bayern v PSG", market: "Anytime goalscorer", reason: "Own goal ambiguity", affected: 92 },
      { id: "3", age: "1d 8h", fixture: "Man Utd v Newcastle", market: "Player to be carded", reason: "Card after final whistle", affected: 44 },
    ],
    late: [
      { id: "4", age: "6h", fixture: "Arsenal v Chelsea", market: "Exact score", reason: "Goal awarded on appeal", affected: 128 },
      { id: "5", age: "3h", fixture: "Bayern v PSG", market: "Match result", reason: "Result amended by source", affected: 92 },
    ],
    provider: [
      { id: "6", age: "5d 1h", old: true, fixture: "Real Madrid v Milan", market: "Lineups", reason: "Feed returned no teamsheet", affected: 128 },
    ],
    jobs: [
      { id: "7", age: "14h", fixture: "Liverpool v Spurs", market: "Settlement job", reason: "Retries exhausted", affected: 128 },
    ],
    notifications: []
  };
}

export async function resolveSettlementJob(jobId: string, action: string): Promise<void> {
  // Mock resolving
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Resolved job ${jobId} with action ${action}`);
}
