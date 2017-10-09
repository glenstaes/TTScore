/**
 * This class represents an entry in the results of a club member.
 * @property {string} date - The play date
 * @property {number} uniqueIndex - The unique index of the opponent
 * @property {string} firstName - The first name of the opponent
 * @property {string} lastName - The last name of the opponent
 * @property {string} ranking - The ranking of the opponent
 * @property {string} resultIndicator - The indication of the result: V for Victory and D for Defeat
 */
export class ClubMemberResultEntry {
    constructor(
        public date: string,
        public uniqueIndex: number,
        public firstName: string,
        public lastName: string,
        public ranking: string,
        public resultIndicator: string) { }
}