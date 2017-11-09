/**
 * This class represents an entry in the results of a club member.
 * @property {string} date - The play date
 * @property {number} uniqueIndex - The unique index of the opponent
 * @property {string} firstName - The first name of the opponent
 * @property {string} lastName - The last name of the opponent
 * @property {string} ranking - The ranking of the opponent
 * @property {string} resultIndicator - The indication of the result: V for Victory and D for Defeat
 * @property {number} setsFor - The amount of sets the player won.
 * @property {number} setsAgainst - The amount of sets the player lost.
 */
export class ClubMemberResultEntry {
    constructor(
        public date: string,
        public uniqueIndex: number,
        public firstName: string,
        public lastName: string,
        public ranking: string,
        public resultIndicator: string,
        public setsFor: number = -1,
        public setsAgainst: number = -1
    ) {
        if(typeof setsFor === "undefined"){
            this.setsFor = -1;
        }

        if(typeof setsAgainst === "undefined"){
            this.setsAgainst = -1;
        }
    }

    /**
     * Gets the full result for the result entry. If there's no result available, an empty string is returned.
     */
    get result(){
        if(this.setsFor !== -1 && this.setsAgainst !== -1){
            // This ugly hack is needed because in some cases, the API returns the sets for and sets agains in the wrong order.
            // setsAgainst needs to come first if
            // - The result is a victory and sets against is higher e.g. output should be 3-0 if sets against is 3
            // - The result is a defeat and sets for is higher e.g. output should be 0-3 if sets for is 3
            if((this.resultIndicator === "V" && this.setsAgainst > this.setsFor) || (this.resultIndicator === "D" && this.setsFor > this.setsAgainst)){
                return `${this.setsAgainst}-${this.setsFor}`;
            }
            return `${this.setsFor}-${this.setsAgainst}`;
        }
        return "";
    }
}