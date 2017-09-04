/**
 * This class represents an entry for a division ranking.
 * @property {number} position - The position in the ranking.
 * @property {string} teamName - The name of the team.
 * @property {number} gamesPlayed - The amount of games played by the team.
 * @property {number} gamesWon - The amount of games won by the team.
 * @property {number} gamesLost - The amount of games lost by the team.
 * @property {number} gamesDraw - The amount of games drawn by the team.
 * @property {number} individualMatchesWon - The amount of matches won by the players in the team.
 * @property {number} individualMatchesLost - The amount of matches lost by the players in the team.
 * @property {number} individualSetsWon - The amount of sets won by the players in the team.
 * @property {number} individualSetsLost - The amount of sets lost by the players in the team.
 * @property {number} points - The amount of points for the team.
 * @property {string} teamClubId - The unique identifier of the club the team belongs to.
 */
export class DivisionRanking {
    constructor(
        public position: number,
        public teamName: string,
        public gamesPlayed: number,
        public gamesWon: number,
        public gamesLost: number,
        public gamesDraw: number,
        public individualMatchesWon: number,
        public individualMatchesLost: number,
        public individualSetsWon: number,
        public individuelSetsLost: number,
        public points: number,
        public teamClubId: string
    ){}
}