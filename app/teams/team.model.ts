import { Club } from "../clubs/club.model";
/**
 * This class represents a team.
 * @property {string} teamId - The unique identifier of the team.
 * @property {string} team - The letter of the team.
 * @property {number} divisionId - The id of the division in which the team plays.
 * @property {string} divisionName - The name of the division in which the team plays.
 * @property {number} divisionCategoryId - The id of the category of the division.
 * @property {Club} parentClub - Contains a reference to the parent club of the team.
 */
export class Team {
    public parentClub: Club;

    constructor(
        public teamId: string,
        public team: string,
        public divisionId: number,
        public divisionName: string,
        public divisionCategoryId: number
    ) { }

    /**
     * Gets a name for the division category id.
     */
    get divisionCategoryName() {
        switch (this.divisionCategoryId) {
            case 1:
                return "Heren";
            case 2:
                return "Dames";
            case 13:
                return "Jeugd";
            default:
                return "";
        }
    }

    /**
     * Prints the division category name together with the team letter and division name.
     */
    toString(){
        return `${this.divisionCategoryName} ${this.team}`
    }
}