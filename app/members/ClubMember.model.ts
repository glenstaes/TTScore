import { ClubMemberResultEntry } from "./ClubMemberResultEntry";
import { TabTClubMember } from "./clubmember.service";

/**
 * This class represents the member of a club
 * @property {number} position - The position on the member list.
 * @property {number} uniqueIndex - The unique identifier of the member.
 * @property {number} rankingIndex - The ranking index of the member.
 * @property {string} firstName - The first name of the member.
 * @property {string} lastName - The last name of the member.
 * @property {string} ranking - The ranking of the member.
 * @property {Array<ClubMemberResultEntry>} resultEntries - The entries of the player results.
 */
export class ClubMember {
    constructor(
        public position: number,
        public uniqueIndex: number,
        public rankingIndex: number,
        public firstName: string,
        public lastName: string,
        public ranking: string,
        public resultEntries: Array<ClubMemberResultEntry> = []
    ){ }

    /**
     * Prints out the concatenated first name and last name of the member.
     */
    toString(){
        return `${this.firstName} ${this.lastName}`
    }

    /**
     * Creates a new instance based on the entry returned by the API.
     * @param memberEntry A member entry returned by the API
     */
    static createFromApi(memberEntry: TabTClubMember): ClubMember {
        return new ClubMember(
            memberEntry.Position,
            memberEntry.UniqueIndex,
            memberEntry.RankingIndex,
            memberEntry.FirstName,
            memberEntry.LastName,
            memberEntry.Ranking,
            (memberEntry.ResultEntries || []).map((resultEntry) => {
                return ClubMemberResultEntry.createFromApi(resultEntry);
            })
        );
    }
}