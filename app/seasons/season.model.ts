
export class Season {
    
    /**
     * Creates a new instance of a season.
     * @param {number} id - The id of the season.
     * @param {string} name - The name of the season.
     * @param {boolean} isCurrent - Whether the season is the current season.
     */
    constructor(public id: number, public name: string, public isCurrent: boolean){}

    /**
     * Overrides the default toString function to output the season name instead of [object Object]
     */
    toString(){
        return this.name;
    }
}