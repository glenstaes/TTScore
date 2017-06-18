
export class Season {
    
    /**
     * Creates a new instance of a season.
     * @param id - The id of the season.
     * @param name - The name of the season.
     * @param isCurrent - Whether the season is the current season.
     */
    constructor(public id: number, public name: string, public isCurrent: boolean){}

    /**
     * Overrides the default toString function to output the season name instead of [object Object]
     */
    toString(){
        return this.name;
    }
}