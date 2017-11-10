import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Rx";

import { DatabaseService } from "../database/database.service";
import { Season } from "../seasons/Season.model";
import { DivisionRanking } from "./DivisionRanking.model";
import { nextAndComplete } from "../helpers";

@Injectable()

/**
 * Use this service for retrieving and storing division rankings.
 */

export class DivisionRankingService {
    /**
     * Creates a new instance of the service.
     * @param {DatabaseService} db - The database service for working with the database
     */
    constructor(private db: DatabaseService, private http: Http) {

    }

    /**
     * Gets a division ranking entry from the database.
     * @param {number} divisionId - The id of the division to retrieve the entries for.
     * @param {number} position - The position in the ranking.
     * @returns {Observable<Array<DivisionRanking>>} An array of ranking entries.
     */
    get(divisionId: number, position: number) {
        return new Observable<DivisionRanking>((observer) => {
            this.db.all(`SELECT * FROM divisionrankings WHERE divisionId = ? AND position = ?`, [divisionId, position]).subscribe((rows) => {
                const rankings = this._processDivisionRankingsFromDatabase(rows);
                nextAndComplete(observer, rankings.length ? rankings[0] : undefined)();
            });
        });
    }

    /**
     * Saves a ranking entry for a division.
     * @param {DivisionRanking} rankingEntry - The ranking entry to save.
     * @param {number} divisionId - The unique identifier of the division.
     * @returns {Observable<DivisionRanking>} An observable that is resolved with the inserted/updated ranking entry.
     */
    save(rankingEntry: DivisionRanking, divisionId: number): Observable<DivisionRanking> {
        return new Observable((observer) => {
            this.exists(rankingEntry, divisionId).subscribe((exists) => {
                (exists ? this._update(rankingEntry, divisionId) : this._create(rankingEntry, divisionId)).subscribe(nextAndComplete(observer, rankingEntry));
            });
        });
    }

    /**
     * Checks whether a ranking entry already exists.
     * @param {DivisionRanking} rankingEntry - The ranking entry to save.
     * @param {number} divisionId - The unique identifier of the division.
     * @returns {Observable<boolean>} True or false in an observable whether the club exists.
     */
    exists(rankingEntry: DivisionRanking, divisionId: number): Observable<boolean> {
        return new Observable((observer) => {
            this.get(divisionId, rankingEntry.position).subscribe((member) => {
                nextAndComplete(observer, typeof member === "undefined" ? false : true)();
            });
        });
    }

    /**
     * Creates a new ranking entry in the database.
     * @param {DivisionRanking} rankingEntry - The ranking entry to save.
     * @param {number} divisionId - The unique identifier of the division.
     * @returns {Observable<boolean>} True or false whether it's inserted.
     */
    private _create(rankingEntry: DivisionRanking, divisionId: number) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`INSERT INTO divisionrankings VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                divisionId,
                rankingEntry.position,
                rankingEntry.teamName,
                rankingEntry.gamesPlayed,
                rankingEntry.gamesWon,
                rankingEntry.gamesLost,
                rankingEntry.gamesDraw,
                rankingEntry.individualMatchesWon,
                rankingEntry.individualMatchesLost,
                rankingEntry.individualSetsWon,
                rankingEntry.individuelSetsLost,
                rankingEntry.points,
                rankingEntry.teamClubId
            ]).subscribe((rows) => {
                nextAndComplete(observer, rows ? true : false)();
            });
        });
    }

    /**
     * Updates a ranking entry in the database.
     * @param {DivisionRanking} rankingEntry - The ranking entry to save.
     * @param {number} divisionId - The unique identifier of the division.
     * @returns {Observable<boolean>} True or false whether it's updated.
     */
    private _update(rankingEntry: DivisionRanking, divisionId: number) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(
                `UPDATE divisionrankings 
                    SET team = ?, gamesPlayed = ?, gamesWon = ?, gamesLost = ?, gamesDraw = ?, individualMatchesWon = ?, individualMatchesLost = ?, individualSetsWon = ?, individualSetsLost = ?, points = ?, teamClubId = ?
                    WHERE divisionId = ? AND position = ?`,
                [
                    rankingEntry.teamName,
                    rankingEntry.gamesPlayed,
                    rankingEntry.gamesWon,
                    rankingEntry.gamesLost,
                    rankingEntry.gamesDraw,
                    rankingEntry.individualMatchesWon,
                    rankingEntry.individualMatchesLost,
                    rankingEntry.individualSetsWon,
                    rankingEntry.individuelSetsLost,
                    rankingEntry.points,
                    rankingEntry.teamClubId,
                    divisionId,
                    rankingEntry.position
                ]).subscribe((rows) => {
                    nextAndComplete(observer, rows ? true : false)();
                });
        });
    }

    /**
     * Gets all the club member entries from the database.
     * @param {number} divisionId - The unique identifier of the division.
     * @returns {Observable<Array<DivisionRanking>>} An observable with an array of DivisionRanking instances.
     */
    getAllByDivision(divisionId: number) {
        return new Observable<Array<DivisionRanking>>((observer) => {
            this.db.all(`SELECT * FROM divisionrankings WHERE divisionId = ? ORDER BY position`, [divisionId]).subscribe((rows) => {
                nextAndComplete(observer, this._processDivisionRankingsFromDatabase(rows))();
            });
        });
    }

    /**
     * @private
     * Process the rows from the database into DivisionRanking instances.
     * @param rows - The rows that were returned by the query.
     * @returns {Array<DivisionRanking>} An array of Club instances.
     */
    private _processDivisionRankingsFromDatabase(rows) {
        let members = [];

        rows.forEach((row) => {
            members.push(new DivisionRanking(row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12]));
        });

        return members;
    }

    /**
     * Gets all the division ranking entries from the TabT database for a division.
     * @param {number} divisionId - The unique identifier of the division.
     * @returns {Observable<DivisionRanking[]>} An array with club objects for each club entry in TabT.
     */
    getAllFromTabT(divisionId: number): Observable<DivisionRanking[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("action", "GetDivisionRanking");
        params.set("DivisionId", divisionId.toString());

        let requestOptions = new RequestOptions({
            search: params
        });

        return this.http.get("http://junosolutions.be/ttscore.php", requestOptions).map((response) => {
            let jsonResponse = <TabTDivisionRankingsResponse>response.json();
            let members = [];

            jsonResponse.RankingEntries.forEach((rankingEntry) => {
                members.push(new DivisionRanking(
                    rankingEntry.Position,
                    rankingEntry.Team,
                    rankingEntry.GamesPlayed,
                    rankingEntry.GamesWon,
                    rankingEntry.GamesLost,
                    rankingEntry.GamesDraw,
                    rankingEntry.IndividualMatchesWon,
                    rankingEntry.IndividualMatchesLost,
                    rankingEntry.IndividualSetsWon,
                    rankingEntry.IndividualSetsLost,
                    rankingEntry.Points,
                    rankingEntry.TeamClub
                ));
            });

            return members;
        });
    }

    /**
     * Imports the data from the TabT api.
     * @param {number} divisionId - The unique identifier of the division.
     * @returns {Observable<Array<DivisionRanking>>} The result data for the import.
     */
    importFromTabT(divisionId: number): Observable<Array<DivisionRanking>> {
        return new Observable<Array<DivisionRanking>>((observer) => {
            this.getAllFromTabT(divisionId).subscribe((rankingEntries) => {
                rankingEntries.forEach((rankingEntry) => {
                    this.save(rankingEntry, divisionId).subscribe(nextAndComplete(observer, rankingEntries));
                });
            });
        });
    }
}

interface TabTDivisionRankingsResponse {
    DivisionName: string;
    RankingEntries: Array<TabTDivisionRankingEntry>;
}

interface TabTDivisionRankingEntry {
    Position: number;
    Team: string;
    GamesPlayed: number;
    GamesWon: number;
    GamesLost: number;
    GamesDraw: number;
    IndividualMatchesWon: number;
    IndividualMatchesLost: number;
    IndividualSetsWon: number;
    IndividualSetsLost: number;
    Points: number;
    TeamClub: string;
}