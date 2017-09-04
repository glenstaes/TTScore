import { TeamMatch } from "./TeamMatch.model";

/**
 * This class represents the matches in a week of a division.
 * @property {number} divisionId - The unique identifier of the division.
 * @property {string} weekName - The name of the week.
 * @property {Array<TeamMatch>} matches - An array of the matches.
 */
export class DivisionWeekMatches {
    constructor(
        public divisionId: number,
        public weekName: string,
        public matches: Array<TeamMatch> = []
    ){}

    /**
     * Creates an object with the week names as keys and an array of matches as value.
     * @param {Array<TeamMatch>} matches - The matches to interpret
     * @returns {DivisionWeekMatchesList} An object with the matches per week.
     */
    public static fromMatchesArray(matches: Array<TeamMatch>): DivisionWeekMatchesList{
        let matchesByWeekName: DivisionWeekMatchesList = {};

        matches.forEach((match) => {
            if(typeof matchesByWeekName[match.weekName] === "undefined"){
                matchesByWeekName[match.weekName] = new DivisionWeekMatches(match.divisionId, match.weekName);
            }

            matchesByWeekName[match.weekName].matches.push(match);
        });

        return matchesByWeekName;
    }
}

export declare type DivisionWeekMatchesList = { [key: string]: DivisionWeekMatches};