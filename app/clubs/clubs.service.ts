import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map'
let Sqlite = require("nativescript-sqlite");

import { TabTClubsImportResult } from "../tabt/TabTImport.service";
import { DatabaseService } from "../database/database.service";
import { Club, ClubCategory } from "./club.model";
import { ClubVenue } from "./clubvenue.model";
import { Season } from "../seasons/season.model";
import { SeasonsService } from "../seasons/seasons.service";
import { nextAndComplete } from "../helpers";

@Injectable()
export class ClubsService {
    /**
     * Creates a new instance of the service.
     * @param {DatabaseService} db - The database service for working with the database
     */
    constructor(private db: DatabaseService, private http: Http, private _seasonsService: SeasonsService) {

    }

    /**
     * Gets all the club entries from the database.
     * @returns {Observable<Array<Club>>} An observable with an array of Club instances.
     */
    getAll() {
        return new Observable<Club[]>((observer) => {
            this.db.all(`SELECT * FROM clubs ORDER BY uniqueId`).subscribe((rows) => {
                this._processClubsFromDatabase(rows).subscribe((clubs) => {
                    nextAndComplete(observer, clubs)();
                });
            });
        });
    }

    /**
     * Gets the clubs for a specific season.
     * @param {number} seasonId - The unique identifier of the season.
     * @returns {Observable<Array<Club>>} An observable with an array of Club instances.
     */
    getAllBySeason(seasonId) {
        return new Observable<Club[]>((observer) => {
            this.db.all(`SELECT * FROM clubs WHERE seasonId = ? ORDER BY uniqueId`, [seasonId]).subscribe((rows) => {
                this._processClubsFromDatabase(rows).subscribe((clubs) => {
                    nextAndComplete(observer, clubs)();
                });
            });
        });
    }

    /**
     * @private
     * Process the rows from the database into Club instances.
     * @param rows - The rows that were returned by the query.
     * @returns {Array<Club>} An array of Club instances.
     */
    private _processClubsFromDatabase(rows) {
        return Observable.create((observer) => {
            if (rows.length === 0) {
                nextAndComplete(observer, [])();
            } else {
                let clubs = [];
                let loadDependenciesObservables: Array<Observable<Season>> = [];

                rows.forEach((row) => {
                    loadDependenciesObservables.push(this._seasonsService.get(row[1]));

                    // TODO(glenstaes): Fetch the category and the venues
                    clubs.push(new Club(row[0], row[2], row[3], null, null, row[1]));
                });

                Observable.forkJoin(...loadDependenciesObservables).subscribe((seasons) => {
                    clubs.forEach((club: Club, index) => {
                        club.parentSeason = seasons[index];
                    });

                    nextAndComplete(observer, clubs)();
                });
            }
        });
    }

    /**
     * Gets a club from the database.
     * @param {number} clubId - The id of the club to retrieve from the database.
     * @returns {Observable<Club>} The club to get from the database.
     */
    get(clubId, seasonId) {
        return new Observable<Club>((observer) => {
            if (typeof clubId === "undefined" || clubId === null || typeof seasonId === "undefined" || seasonId === null) {
                observer.next(undefined);
                observer.complete();
            } else {
                this.db.all(`SELECT * FROM clubs WHERE uniqueId = ? AND seasonId = ?`, [clubId, seasonId]).subscribe((rows) => {
                    this._processClubsFromDatabase(rows).subscribe((clubs) => {
                        nextAndComplete(observer, clubs.length ? clubs[0] : undefined)();
                    });
                });
            }
        });
    }

    /**
     * Saves the passed club to the database. If an id exists, an update is executed, otherwise a new club is created.
     * @param {Club} club - The club to save.
     * @returns {Observable<Club>} An observable  that is resolved with the inserted/updated club.
     */
    save(club: Club): Observable<Club> {
        return new Observable((observer) => {
            this.exists(club).subscribe((exists) => {
                (exists ?  this._update(club) : this._create(club)).subscribe(nextAndComplete(observer, club));
            });
        });
    }

    /**
     * Checks whether a club already exists.
     * @param {Club} club - The club to check whether exists.
     * @returns {Observable<boolean>} True or false in an observable whether the club exists.
     */
    exists(club: Club): Observable<boolean> {
        return new Observable((observer) => {
            this.get(club.uniqueIndex, club.seasonId).subscribe((club) => {
                nextAndComplete(observer, typeof club === "undefined" ? false : true)();
            });
        });
    }

    /**
     * Creates a new club in the database.
     * @param {Club} club - The club to create in the database.
     * @returns {Observable} True or false whether it's inserted.
     */
    private _create(club: Club) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`INSERT INTO clubs VALUES (?,?,?,?,?)`, [club.uniqueIndex, club.seasonId, club.name, club.longName, club.category.id]).subscribe((rows) => {
                nextAndComplete(observer, rows ? true : false)();
            });
        });
    }

    /**
     * Updates a new club in the database.
     * @param club - The club to update in the database.
     * @returns {Observable} True or false whether it's inserted.
     */
    private _update(club: Club) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`UPDATE clubs SET name = ?, longName = ?, categoryId = ? WHERE uniqueId = ?`, [club.name, club.longName, club.category.id, club.uniqueIndex]).subscribe((rows) => {
                nextAndComplete(observer, rows ? true : false)();
            });
        });
    }

    /**
     * Gets all the clubs from the TabT database.
     * @param {number} seasonId - The id of the season to retrieve the clubs from.
     * @returns {Observable<Club[]>} An array with club objects for each club entry in TabT.
     */
    getAllFromTabT(seasonId): Observable<Club[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("action", "GetClubs");
        params.set("Season", seasonId);

        let requestOptions = new RequestOptions({
            search: params
        });

        return this.http.get("http://junosolutions.be/ttscore.php", requestOptions).map((response) => {
            let jsonResponse = <TabTClubsResponse>response.json();
            let clubs = [];

            jsonResponse.forEach((clubEntry) => {
                let venues = [];

                (clubEntry.VenueEntries || []).forEach((venueEntry) => {
                    venues.push(new ClubVenue(venueEntry.Id, venueEntry.ClubVenue, venueEntry.Name, venueEntry.Street, venueEntry.Town, venueEntry.Phone, venueEntry.Comment));
                });

                clubs.push(new Club(clubEntry.UniqueIndex, clubEntry.Name, clubEntry.LongName, new ClubCategory(clubEntry.Category, clubEntry.CategoryName), venues, seasonId));
            });

            return clubs;
        });
    }

    /**
     * Imports the data from the TabT api.
     * @returns {TabTClubsImportResult} The result data for the import.
     */
    importFromTabT(seasonId: number): Observable<TabTClubsImportResult> {
        return new Observable<TabTClubsImportResult>((observer) => {
            let importedClubs = 0;

            this.getAllFromTabT(seasonId).subscribe((clubs) => {
                clubs.forEach((club) => {
                    this.save(club).subscribe(() => {
                        importedClubs++;
                        let nextDataResult = {
                            imported: importedClubs,
                            total: clubs.length,
                            clubs: clubs,
                            completed: importedClubs === clubs.length
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
 * This interface can be used for intellisense on club entries from the TabT API.
 */
export interface TabTClubEntry {
    UniqueIndex: string;
    Name: string;
    LongName: string;
    Category: number;
    CategoryName: string;
    VenueCount: number;
    VenueEntries: TabTClubVenueEntry[];
}

/**
 * This interface can be used for intellisense on a club venue entry from the TabT API.
 */
export interface TabTClubVenueEntry {
    Id: number;
    ClubVenue: number;
    Name: string;
    Street: string;
    Town: string;
    Phone: string;
    Comment: string;
}

/**
 * This interface can be used for intellisense on the TabT GetClubs response.
 */
export declare type TabTClubsResponse = TabTClubEntry[];