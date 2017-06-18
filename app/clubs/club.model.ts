import { ClubVenue } from "./clubvenue.model";

export class Club {
    constructor(
        public uniqueIndex: string,
        public name: string,
        public longName: string,
        public category: ClubCategory,
        public venues: ClubVenue[]
    ){}
}

export class ClubCategory {
    constructor(
        public id: number,
        public name: string
    ){}
}