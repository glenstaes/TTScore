import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
let Sqlite = require("nativescript-sqlite");
let appSettings = require("application-settings");

import { nextAndComplete } from "../helpers";

@Injectable()
export class DatabaseService {
    private database: any;
    readonly version = 3;
    private readonly versionQueries = [
        this._version1Query,
        this._version2Query,
        this._version3Query
    ];

    /**
     * Creates a new instance of the service
     */
    constructor() {
    }

    /**
     * Initialises the database by executing the queries based on the previous version of the database.
     * @returns {Observable<any>} An observable that is resolved when the database is created/migrated.
     */
    initDatabase() {
        return Observable.create((observer) => {
            const _executeVersionQuery = (index) => {
                const query = this.versionQueries[index];
                query.apply(this).subscribe(() => {
                    const nextIndex = parseInt(index) + 1;

                    if (nextIndex >= this.version) {
                        this.database.version(this.version);
                        nextAndComplete(observer, undefined)();
                    } else {
                        _executeVersionQuery(nextIndex);
                    }
                });
            }

            this.connect().then(() => {
                this.database.version((error, previousVersion) => {
                    let queries = this.versionQueries.slice(previousVersion, this.version);
                    if (queries.length) {
                        _executeVersionQuery(parseInt(previousVersion));
                    }
                });
            });
        });
    }

    /**
     * Queries for database
     */
    private _version1Query() {
        const forkableQueries = [
            this.execSQL("CREATE TABLE clubs (uniqueId TEXT, seasonId INTEGER, name TEXT, longName TEXT, categoryId INTEGER);"),
            this.execSQL("CREATE TABLE clubmembers (position INTEGER, uniqueIndex INTEGER, rankingIndex INTEGER, firstName TEXT, lastName TEXT, ranking TEXT, seasonId INTEGER, clubId TEXT);"),
            this.execSQL("CREATE TABLE divisionrankings (divisionId INTEGER, position INTEGER, team TEXT, gamesPlayed INTEGER, gamesWon INTEGER, gamesLost INTEGER, gamesDraw INTEGER, individualMatchesWon INTEGER, individualMatchesLost INTEGER, individualSetsWon INTEGER, individualSetsLost INTEGER, points INTEGER, teamClubId TEXT);"),
            this.execSQL("CREATE TABLE seasons (id INTEGER PRIMARY KEY, name TEXT, isCurrent BOOLEAN);"),
            this.execSQL("CREATE TABLE teams (teamId TEXT, team TEXT, divisionId INTEGER, divisonName TEXT, divisionCategoryId INTEGER, clubId TEXT, seasonId INTEGER);")
        ];

        return Observable.forkJoin(...forkableQueries);
    }

    private _version2Query(){
        const forkableQueries = [
            this.execSQL(`CREATE TABLE IF NOT EXISTS matches (divisionId TEXT, matchId TEXT, teamId TEXT, weekName TEXT, date TEXT, time TEXT, venue INTEGER, homeClubId TEXT, homeTeam TEXT, awayClubId TEXT, awayTeam TEXT, isHomeForfeited INTEGER, isAwayForfeited INTEGER, score TEXT)`)
        ];

        return Observable.forkJoin(...forkableQueries);
    }

    private _version3Query(){
        const forkableQueries = [
            this.execSQL(`ALTER TABLE matches ADD COLUMN uniqueIndex INTEGER;`)
        ];

        return Observable.forkJoin(...forkableQueries);
    }

    /**
     * Checks whether we have a connected instance of the database.
     * @returns {boolean} Whether we're connected to the database.
     */
    isConnected() {
        return typeof this.database !== "undefined";
    }

    /**
     * Connects to the database.
     * @returns {Promise} A promise that is resolved when we're connected.
     */
    connect() {
        // Connect to the database
        if (this.database)
            return Observable.create((observer) => {
                nextAndComplete(observer, undefined)();
            }).toPromise();
        else
            return (new Sqlite("ttscore.db")).then((db) => {
                this.database = db;
            });
    }

    /**
     * Executes a SQL query for inserting or updating data.
     * @param {string} query - The query to execute
     * @param {Array<any>} data - The data to put in the query
     */
    execSQL(query: string, data: Array<any> = []) {
        return new Observable<any>((observer) => {
            this.connect().then(() => {
                this.database.execSQL(query, data).then((result) => {
                    nextAndComplete(observer, result)();
                });
            });
        });
    }

    /**
     * Executes a SQL query for reading data.
     * @param {string} query - The query to execute.
     * @param {Array<any>} data - The data to put in the query.
     */
    all(query: string, data: Array<any> = []) {
        return new Observable<any>((observer) => {
            this.connect().then(() => {
                this.database.all(query, data).then((result) => {
                    nextAndComplete(observer, result)();
                });
            });
        });
    }
}