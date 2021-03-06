import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map'
let Sqlite = require("nativescript-sqlite");

import { TabTSeasonsImportResult } from "../tabt/TabTImport.service";
import { DatabaseService } from "../database/database.service";
import { Season } from "./Season.model";
import { nextAndComplete } from "../helpers";

@Injectable()

/**
 * Use this service for working with seasons.
 * @private {Array<Season>} allSeasons - A cached array of season instances.
 */

export class SeasonsService {
    private allSeasons: Array<Season>;

    /**
     * Creates a new instance of the service.
     * @param {DatabaseService} db - The database service for working with the database
     */
    constructor(private db: DatabaseService, private http: Http) {

    }

    /**
     * Gets all the season entries from the database.
     * @returns {Observable<Season[]>} An observable that will contain the seasons from the database.
     */
    getAll() {
        return new Observable<Season[]>((observer) => {
            if (typeof this.allSeasons === "undefined") {
                this.db.all(`SELECT * FROM seasons`).subscribe((rows) => {
                    let seasons = [];

                    rows.forEach((row) => {
                        seasons.push(new Season(row[0], row[1], row[2]));
                    });

                    // Cache the result
                    this.allSeasons = seasons;

                    nextAndComplete(observer, seasons)();
                });
            } else {
                nextAndComplete(observer, this.allSeasons)();
            }
        });
    }

    /**
     * Gets a season from the database.
     * @param {number} seasonId - The id of the season to retrieve from the database.
     * @returns {Observable<Season>} The season to get from the database.
     */
    get(seasonId) {
        return new Observable<Season>((observer) => {
            if (typeof seasonId === "undefined" || seasonId === null) {
                nextAndComplete(observer, undefined)();
            } else {
                this.db.all(`SELECT * FROM seasons WHERE id = ?`, [seasonId]).subscribe((rows) => {
                    let seasons = [];

                    rows.forEach((row) => {
                        seasons.push(new Season(row[0], row[1], row[2]));
                    });

                    nextAndComplete(observer, seasons.length ? seasons[0] : undefined)();
                });
            }
        });
    }

    /**
     * Saves the passed season to the database. If an id exists, an update is executed, otherwise a new season is created.
     * @param {Season} season - The season to save.
     * @returns {Observable<Season>} An observable  that is resolved with the inserted/updated season.
     */
    save(season: Season): Observable<Season> {
        return new Observable((observer) => {
            this.exists(season).subscribe((exists) => {
                (exists ? this._update(season) : this._create(season)).subscribe(nextAndComplete(observer, season));
            });
        });
    }

    /**
     * Checks whether a season already exists.
     * @param {Season} season - The season to check whether exists.
     * @returns {Observable<boolean>} True or false in an observable whether the season exists.
     */
    exists(season: Season): Observable<boolean> {
        return new Observable((observer) => {
            this.get(season.id).subscribe((season) => {
                nextAndComplete(observer, typeof season === "undefined" ? false : true)();
            });
        });
    }

    /**
     * Creates a new season in the database.
     * @param {Season} season - The season to create in the database.
     * @returns {Observable<boolean>} True or false whether it's inserted.
     */
    private _create(season: Season) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`INSERT INTO seasons VALUES (?,?,?)`, [season.id, season.name, season.isCurrent]).subscribe((rows) => {
                nextAndComplete(observer, rows ? true : false)();
            });
        });
    }

    /**
     * Updates a new season in the database.
     * @param season - The season to update in the database.
     * @returns {Observable<boolean>} True or false whether it's inserted.
     */
    private _update(season: Season) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`UPDATE seasons SET name = ?, isCurrent = ? WHERE id = ?`, [season.name, season.isCurrent, season.id]).subscribe((rows) => {
                nextAndComplete(observer, rows ? true : false)();
            });
        });
    }

    /**
     * Gets all the seasons from the TabT database.
     * @returns {Observable<Season[]>} An array with season objects for each season entry in TabT.
     */
    getAllFromTabT(): Observable<Season[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("action", "GetSeasons");

        let requestOptions = new RequestOptions({
            search: params
        });

        return this.http.get("http://junosolutions.be/ttscore.php", requestOptions).map((response) => {
            let jsonResponse = <TabTSeasonsResponse>response.json();
            let seasons = [];

            jsonResponse.SeasonEntries.forEach((seasonEntry: TabTSeasonEntry) => {
                seasons.push(new Season(seasonEntry.Season, seasonEntry.Name, seasonEntry.IsCurrent));
            });

            return seasons;
        });
    }

    /**
     * Imports the data from the TabT api.
     * @returns {TabTSeasonsImportResult} The result data for the import.
     */
    importFromTabT(): Observable<TabTSeasonsImportResult> {
        return new Observable<TabTSeasonsImportResult>((observer) => {
            let importedSeasons = 0;

            // Get all seasons from the TabT service
            this.getAllFromTabT().subscribe((seasons) => {
                seasons.forEach((season) => {
                    // Save each season in the local database
                    this.save(season).subscribe(() => {
                        importedSeasons++;

                        const nextDataResult = {
                            imported: importedSeasons,
                            total: seasons.length,
                            seasons: seasons,
                            completed: importedSeasons === seasons.length
                        }

                        observer.next(nextDataResult);

                        if (nextDataResult.completed) {
                            observer.complete();
                        }
                    });
                });
            });
        });
    }
}

/**
 * This interface can be used for intellisense on season entries from the TabT API.
 */
export interface TabTSeasonEntry {
    Season: number;
    Name: string;
    IsCurrent: boolean;
}

/**
 * This interface can be used for intellisense on the TabT GetSeasons response.
 */
export interface TabTSeasonsResponse {
    CurrentSeason: number;
    CurrentSeasonName: string;
    SeasonEntries: Array<TabTSeasonEntry>;
}