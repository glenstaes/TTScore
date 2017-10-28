export class MatchDetails {
    constructor(
        public detailsCreated: boolean,
        public homeCaptain: number,
        public awayCaptain: number,
        public referee: number,
        public homePlayers: MatchTeamPlayers,
        public awayPlayers: MatchTeamPlayers,
        public individualMatchResults: Array<IndividualMatchResult>,
        public matchSystem: number,
        public homeScore: number,
        public awayScore: number
    ){}
}

export class MatchTeamPlayers {
    constructor(
        public playerCount: number,
        public doubleTeamCount: number,
        public players: Array<MatchPlayer>
    ){}
}

export class MatchPlayer {
    constructor(
        public position: number,
        public uniqueIndex: number,
        public firstName: string,
        public lastName: string,
        public ranking: string,
        public victoryCount: number
    ){}
}

export class IndividualMatchResult {
    private _splittedSetResults: Array<ISetScore>;
    private _scores: string;
    
    public get scores(): Array<ISetScore>{
        return this._splittedSetResults;
    }

    constructor(
        public position: number,
        public homePlayerMatchIndex: number,
        public homePlayerUniqueIndex: number,
        public isHomeForfeited: boolean,
        public awayPlayerMatchIndex: number,
        public awayPlayerUniqueIndex: number,
        public isAwayForfeited: boolean,
        public homeSetCount: number,
        public awaySetCount: number,
        scores: string
    ){
        this._setScores(scores);
    }

    private _setScores(value: string){
        this._splittedSetResults = (value || "").split(",").map((setResult) => {
            const score = setResult.substring(setResult.indexOf("|") + 1);
            const scoreNumber = Math.abs(parseInt(score));

            return {
                score: scoreNumber,
                isHomeWin: score.indexOf("-") === -1
            }
        });
    }
}

export interface ISetScore {
    score: number;
    isHomeWin: boolean;
}