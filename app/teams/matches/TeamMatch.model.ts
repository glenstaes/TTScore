/**
 * This class represents a match for a team.
 * @property {number} divisionId - The division the match is played in.
 * @property {string} matchNumber - The unique number for a match.
 * @property {string} teamId - The team id for which the match was downloaded.
 * @property {string} weekName - The name of the week the match is played.
 * @property {string} date - The date in yyyy-MM-dd format.
 * @property {string} time - The time in hh:mm:ss format.
 * @property {number} venueNumber - The number of the venue that is played in.
 * @property {string} homeClubId - The unique identifier of the home club.
 * @property {string} homeTeam - The display name of the home team.
 * @property {string} awayClubId - The unique identifier of the away club.
 * @property {string} awayTeam - The display name of the away team.
 * @property {boolean} isHomeForfeited - Whether the home team is forfeited.
 * @property {boolean} isAwayForfeited - Whether the away team is forfeited.
 * @property {string} score - The score of the match.
 */
export class TeamMatch {
    constructor(
        public divisionId: number,
        public matchNumber: string,
        public teamId: string,
        public weekName: string,
        public date: string,
        public time: string,
        public venueNumber: number,
        public homeClubId: string,
        public homeTeam: string,
        public awayClubId: string,
        public awayTeam: string,
        public isHomeForfeited: boolean,
        public isAwayForfeited: boolean,
        public score: string
    ) { }

    /** Gets the full match name (concatenation of home and away team) */
    get fullMatchName() {
        return `${this.homeTeam} - ${this.awayTeam}`;
    }

    /** If the score is available, it will be appended to the full match name */
    get fullMatchNameWithResult() {
        if (this.score !== "") {
            return `${this.fullMatchName}: ${this.score}`;
        } else {
            return this.fullMatchName
        }
    }

    /** Gets the match date in dd/MM/yyyy format */
    get matchDate() {
        const splittedDate = this.date.split("-");
        if (splittedDate[0] !== "1970")
            return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
        return "";
    }

    /** Gets the match time in hh:mm format */
    get matchTime() {
        const splittedDate = this.date.split("-");
        if (splittedDate[0] !== "1970") {
            const splittedTime = this.time.split(":");
            return `${splittedTime[0]}:${splittedTime[1]}`;
        }
        return "";
    }
}