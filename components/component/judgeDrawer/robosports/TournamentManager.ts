import { Tournament, TournamentBracket } from './TournamentTypes';

export class TournamentManager {
  
  static generateSingleEliminationBracket(teams: string[], teamNames: { [key: string]: string }): TournamentBracket[] {
    const brackets: TournamentBracket[] = [];
    const numTeams = teams.length;
    const totalRounds = Math.ceil(Math.log2(numTeams));
    const paddedSize = Math.pow(2, totalRounds);
    const paddedTeams = [...teams];
    
    // Pad with BYE if needed
    while (paddedTeams.length < paddedSize) {
      paddedTeams.push('BYE');
    }
    
    let matchId = 1;
    
    // Generate first round
    for (let i = 0; i < paddedTeams.length; i += 2) {
      const team1Id = paddedTeams[i] !== 'BYE' ? paddedTeams[i] : null;
      const team2Id = paddedTeams[i + 1] !== 'BYE' ? paddedTeams[i + 1] : null;
      
      // Auto-advance if there's a BYE
      let status: 'pending' | 'ready' | 'completed' = 'ready';
      let winnerId: string | null = null;
      let winnerName = '';
      
      if (!team1Id && team2Id) {
        status = 'completed';
        winnerId = team2Id;
        winnerName = teamNames[team2Id] || '';
      } else if (team1Id && !team2Id) {
        status = 'completed';
        winnerId = team1Id;
        winnerName = teamNames[team1Id] || '';
      }
      
      brackets.push({
        id: `match-${matchId}`,
        tournamentId: '',
        roundNumber: 1,
        bracketType: 'winner',
        matchNumber: matchId,
        team1Id,
        team2Id,
        team1Name: team1Id ? teamNames[team1Id] || '' : 'BYE',
        team2Name: team2Id ? teamNames[team2Id] || '' : 'BYE',
        winnerId,
        winnerName,
        status,
        createdAt: new Date().toISOString()
      });
      
      matchId++;
    }
    
    // Generate subsequent rounds
    let currentRoundSize = paddedTeams.length / 2;
    for (let round = 2; round <= totalRounds; round++) {
      currentRoundSize = currentRoundSize / 2;
      
      for (let i = 0; i < currentRoundSize; i++) {
        brackets.push({
          id: `match-${matchId}`,
          tournamentId: '',
          roundNumber: round,
          bracketType: 'winner',
          matchNumber: matchId,
          team1Id: null,
          team2Id: null,
          team1Name: 'TBD',
          team2Name: 'TBD',
          winnerId: null,
          winnerName: '',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        
        matchId++;
      }
    }
    
    this.setupSingleEliminationConnections(brackets);
    return brackets;
  }
  
  private static setupSingleEliminationConnections(brackets: TournamentBracket[]) {
    const roundGroups: { [key: number]: TournamentBracket[] } = {};
    
    brackets.forEach(bracket => {
      if (!roundGroups[bracket.roundNumber]) {
        roundGroups[bracket.roundNumber] = [];
      }
      roundGroups[bracket.roundNumber].push(bracket);
    });
    
    Object.keys(roundGroups).forEach(roundStr => {
      const round = parseInt(roundStr);
      const currentRoundMatches = roundGroups[round];
      const nextRoundMatches = roundGroups[round + 1] || [];
      
      currentRoundMatches.forEach((match, index) => {
        const nextMatchIndex = Math.floor(index / 2);
        if (nextRoundMatches[nextMatchIndex]) {
          match.nextMatchId = nextRoundMatches[nextMatchIndex].id;
        }
      });
    });
  }
  
  static updateBracketAfterGame(
    brackets: TournamentBracket[], 
    gameResult: any, 
    tournamentType: 'single-elimination' | 'double-elimination'
  ): TournamentBracket[] {
    const updatedBrackets = [...brackets];
    const currentMatch = updatedBrackets.find(b => b.gameId === gameResult.gameId);
    
    if (!currentMatch) return updatedBrackets;
    
    currentMatch.winnerId = gameResult.winnerId;
    currentMatch.winnerName = gameResult.winnerName;
    currentMatch.status = 'completed';
    
    return this.advanceSingleElimination(updatedBrackets, currentMatch);
  }
  
  private static advanceSingleElimination(brackets: TournamentBracket[], completedMatch: TournamentBracket): TournamentBracket[] {
    if (!completedMatch.nextMatchId || !completedMatch.winnerId) return brackets;
    
    const nextMatch = brackets.find(b => b.id === completedMatch.nextMatchId);
    if (!nextMatch) return brackets;
    
    if (!nextMatch.team1Id) {
      nextMatch.team1Id = completedMatch.winnerId;
      nextMatch.team1Name = completedMatch.winnerName;
    } else if (!nextMatch.team2Id) {
      nextMatch.team2Id = completedMatch.winnerId;
      nextMatch.team2Name = completedMatch.winnerName;
    }
    
    if (nextMatch.team1Id && nextMatch.team2Id) {
      nextMatch.status = 'ready';
    }
    
    return brackets;
  }
  
  static getReadyMatches(brackets: TournamentBracket[]): TournamentBracket[] {
    return brackets.filter(bracket => 
      bracket.status === 'ready' && 
      bracket.team1Id && 
      bracket.team2Id &&
      bracket.team1Id !== 'BYE' && 
      bracket.team2Id !== 'BYE'
    );
  }
  
  static isTournamentComplete(brackets: TournamentBracket[]): boolean {
    const finalMatch = brackets.find(b => 
      b.bracketType === 'winner' && 
      !b.nextMatchId && 
      b.status === 'completed'
    );
    return !!finalMatch;
  }
  
  static getTournamentChampion(brackets: TournamentBracket[]): string | null {
    const finalMatch = brackets.find(b => 
      b.bracketType === 'winner' && 
      !b.nextMatchId && 
      b.status === 'completed'
    );
    return finalMatch?.winnerId || null;
  }
}