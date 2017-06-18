import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map'
let Sqlite = require("nativescript-sqlite");

import { TabTSeasonsImportResult } from "../tabt/TabTImport.service";
import { DatabaseService } from "../database/database.service";
import { Season } from "./Season.model";

@Injectable()
export class SeasonsService {
    /**
     * Creates a new instance of the service.
     * @param {DatabaseService} db - The database service for working with the database
     */
    constructor(private db: DatabaseService, private http: Http) {
        this._ensureTable();
    }

    /**
     * @private
     * Ensures that the seasons table exists in the database.
     */
    private _ensureTable() {
        this.db.execSQL(`CREATE TABLE IF NOT EXISTS seasons (id INTEGER PRIMARY KEY, name TEXT, isCurrent BOOLEAN)`).subscribe();
    }

    /**
     * Gets all the season entries from the database.
     */
    getAll() {
        return new Observable<Season[]>((observer) => {
            this.db.all(`SELECT * FROM seasons`).subscribe((rows) => {
                let seasons = [];
                console.dir(rows);

                rows.forEach((row) => {
                    console.dir(row);
                    seasons.push(new Season(row[0], row[1], row[2]));
                });

                observer.next(seasons);
                observer.complete();
            });
        });
    }

    /**
     * Gets a season from the database.
     * @param {number} seasonId - The id of the season to retrieve from the database.
     * @returns {Observable<Season>} The season to get from the database.
     */
    get(seasonId) {
        return new Observable<Season>((observer) => {
            this.db.all(`SELECT * FROM seasons WHERE id = ?`, [seasonId]).subscribe((rows) => {
                let seasons = [];

                rows.forEach((row) => {
                    seasons.push(new Season(row[0], row[1], row[2]));
                });

                observer.next(seasons.length ? seasons[0] : undefined);
                observer.complete();
            });
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
                if (exists) {
                    this._update(season).subscribe((saved) => {
                        observer.next(season);
                    });
                } else {
                    this._create(season).subscribe((saved) => {
                        observer.next(season);
                    });
                }
            })
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
                observer.next(typeof season === "undefined" ? false : true);
                observer.complete();
            });
        });
    }

    /**
     * Creates a new season in the database.
     * @param season - The season to create in the database.
     * @returns {Observable} True or false whether it's inserted.
     */
    private _create(season: Season) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`INSERT INTO seasons VALUES (?,?,?)`, [season.id, season.name, season.isCurrent]).subscribe((rows) => {
                observer.next(rows ? true : false);
                observer.complete();
            });
        });
    }

    /**
     * Updates a new season in the database.
     * @param season - The season to update in the database.
     * @returns {Observable} True or false whether it's inserted.
     */
    private _update(season: Season) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`UPDATE seasons SET name = ?, isCurrent = ? WHERE id = ?`, [season.name, season.isCurrent, season.id]).subscribe((rows) => {
                observer.next(rows ? true : false);
                observer.complete();
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

            jsonResponse.SeasonEntries.forEach((seasonEntry) => {
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

            this.getAllFromTabT().subscribe((seasons) => {
                seasons.forEach((season) => {
                    this.save(season).subscribe(() => {
                        importedSeasons++;
                        let nextDataResult = {
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