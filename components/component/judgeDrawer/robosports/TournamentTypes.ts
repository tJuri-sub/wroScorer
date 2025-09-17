export interface TournamentBracket {
  id: string;
  tournamentId: string;
  roundNumber: number;
  bracketType: 'winner' | 'loser';
  matchNumber: number;
  team1Id: string | null;
  team2Id: string | null;
  team1Name: string;
  team2Name: string;
  winnerId: string | null;
  winnerName: string;
  status: 'pending' | 'ready' | 'in-progress' | 'completed';
  nextMatchId?: string;
  nextLoserMatchId?: string;
  gameId?: string;
  createdAt: string;
}

export interface Tournament {
  id: string;
  eventId: string;
  name: string;
  type: 'single-elimination' | 'double-elimination';
  status: 'setup' | 'in-progress' | 'completed';
  teams: string[];
  brackets: TournamentBracket[];
  currentRound: number;
  championId?: string;
  runnerUpId?: string;
  createdAt: string;
  completedAt?: string;
}