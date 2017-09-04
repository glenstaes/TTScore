import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Rx";

import { DatabaseService } from "../../database/database.service";
import { Team } from "../team.model";
import { TeamsService } from "../teams.service";
import { Club } from "../../clubs/club.model";
import { ClubsService } from "../../clubs/clubs.service";

@Injectable()
/**
 * 
 */
export class FavoritesService {
    /**
     * Creates a new instance of the service.
     * @param {DatabaseService} db - The database service for working with the database
     */
    constructor(
        private db: DatabaseService, 
        private http: Http, 
        private _teamsService: TeamsService,
        private _clubsService: ClubsService
    ) {
        this._ensureTable();
    }

    /**
     * @private
     * Ensures that the teams table exists in the database.
     */
    private _ensureTable() {
        this.db.execSQL(`CREATE TABLE IF NOT EXISTS teamfavorites (seasonId INTEGER, clubId TEXT, teamId TEXT)`).subscribe();
    }
    /**
     * Gets a favorite team from the database.
     * @param {Team} team - The team to get the favorite for from the database
     * @returns {Observable<Team>} The team to get from the database.
     */
    get(team: Team) {
        if(typeof(team) === "undefined")
            return Observable.empty();

        return new Observable<Team>((observer) => {
            this.db.all(`SELECT * FROM teamfavorites WHERE teamId = ?`, [team.teamId]).subscribe((rows) => {
                this._processTeamFavoritesFromDatabase(rows).subscribe((favorites) => {
                    observer.next(favorites.length ? favorites[0] : undefined);
                    observer.complete();
                });
            });
        });
    }

    /**
     * Gets all the teams that have been set as favorite.
     * @returns {Observable<Array<Team>>} The teams that have been set as a favorite.
     */
    getAll(){
        return new Observable<Array<Team>>((observer) => {
            this.db.all(`SELECT * FROM teamfavorites`).subscribe((rows) => {
                this._processTeamFavoritesFromDatabase(rows).subscribe((favorites) => {
                    observer.next(favorites);
                    observer.complete();
                });
            });
        });
    }

    /**
     * Removes a team as favorite.
     * @param team - The team to remove as favorite
     */
    delete(team: Team){
        return new Observable<boolean>((observer) => {
            this.db.all(`DELETE FROM teamfavorites WHERE teamId = ?`, [team.teamId]).subscribe((rows) => {
                observer.next(rows ? true : false);
                observer.complete();
            });
        });
    }

    /**
     * Removes all favorites.
     */
    deleteAll(){
        return new Observable<boolean>((observer) => {
            this.db.all(`DELETE FROM teamfavorites`).subscribe((rows) => {
                observer.next(rows ? true : false);
                observer.complete();
            });
        });
    }

    /**
     * Checks whether a team favorite exists.
     * @param {Team} team - The team to check whether it exists.
     * @returns {Observable<boolean>} True or false in an observable whether the team exists.
     */
    exists(team: Team): Observable<boolean> {
        return new Observable<boolean>((observer) => {
            this.get(team).subscribe((team) => {
                observer.next(typeof team !== "undefined");
                observer.complete();
            });
        });
    }

    /**
     * Creates a new team favorite in the database.
     * @param {Team} team - The team to create the favorite for in the database.
     * @param {string} clubId - The unique identifier of the club.
     * @param {number} seasonId - The unique identifier of the season.
     * @returns {Observable} True or false whether it's inserted.
     */
    add(team: Team, clubId: string, seasonId: number) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`INSERT INTO teamfavorites VALUES (?,?,?)`, [
                seasonId, clubId, team.teamId
            ]).subscribe((rows) => {
                observer.next(rows ? true : false);
                observer.complete();
            });
        });
    }

    /**
     * @private
     * Process the rows from the database into Team instances.
     * @param rows - The rows that were returned by the query.
     * @returns {Array<Team>} An array of Team instances.
     */
    private _processTeamFavoritesFromDatabase(rows): Observable<Array<Team>> {
        if(rows.length === 0){
            return Observable.of([]);
        }

        return Observable.create((observer) => {
            let teamLoadObservables: Array<Observable<[Team, Club]>> = [];

            // Get the observable for each fetch of the row
            rows.forEach((row) => {
                teamLoadObservables.push(Observable.forkJoin(
                    this._teamsService.get(row[2]),
                    this._clubsService.get(row[1], row[0])
                ));
            });

            // The results parameter will contain all resolved forkjoin with team and club instances.
            Observable.forkJoin(...teamLoadObservables).subscribe((results) => {
                let teams = [];

                results.forEach((result) => {
                    const team = result[0];
                    team.parentClub = result[1];
                    teams.push(team);
                });

                observer.next(teams);
                observer.complete();
            });
        });
    }
}