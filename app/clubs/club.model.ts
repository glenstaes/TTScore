import { ClubVenue } from "./clubvenue.model";
import { Season } from "../seasons/season.model";

export class Club {
    public parentSeason: Season;

    constructor(
        public uniqueIndex: string,
        public name: string,
        public longName: string,
        public category: ClubCategory,
        public venues: ClubVenue[],
        public seasonId: number
    ){}

    toString(){
        return `${this.uniqueIndex} - ${this.longName}`;
    }
}

export class ClubCategory {
    constructor(
        public id: number,
        public name: string
    ){}
}