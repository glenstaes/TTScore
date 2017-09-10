import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Rx";

import { DatabaseService } from "../database/database.service";
import { Season } from "../seasons/Season.model";
import { Club } from "../clubs/club.model";
import { Team } from "./team.model";

@Injectable()
/**
 * 
 */
export class TeamsService {
    /**
     * Creates a new instance of the service.
     * @param {DatabaseService} db - The database service for working with the database
     */
    constructor(private db: DatabaseService, private http: Http) {
    }

    /**
     * Gets a team from the database.
     * @param {string} teamId - The id of the team to retrieve from the database.
     * @returns {Observable<Team>} The team to get from the database.
     */
    get(teamId: string) {
        return new Observable<Team>((observer) => {
            if (typeof teamId === "undefined" || teamId === null) {
                observer.next(undefined);
                observer.complete();
            } else {
                this.db.all(`SELECT * FROM teams WHERE teamId = ?`, [teamId]).subscribe((rows) => {
                    const teams = this._processClubTeamsFromDatabase(rows);

                    observer.next(teams.length ? teams[0] : undefined);
                    observer.complete();
                });
            }
        });
    }

    /**
     * Saves the passed club team to the database. If an id exists, an update is executed, otherwise a new member is created.
     * @param {Team} team - The team to save.
     * @param {string} clubId - The id of the club the team belongs to.
     * @param {number} seasonId - The id of the season the club is playing in.
     * @returns {Observable<Team>} An observable that is resolved with the inserted/updated club team.
     */
    save(team: Team, clubId: string, seasonId: number): Observable<Team> {
        return new Observable((observer) => {
            this.exists(team).subscribe((exists) => {
                if (exists) {
                    this._update(team).subscribe((saved) => {
                        observer.next(team);
                    });
                } else {
                    this._create(team, clubId, seasonId).subscribe((saved) => {
                        observer.next(team);
                    });
                }
            })
        });
    }

    /**
     * Checks whether a club team already exists.
     * @param {Team} team - The club team to check whether exists.
     * @returns {Observable<boolean>} True or false in an observable whether the club exists.
     */
    exists(team: Team): Observable<boolean> {
        return new Observable((observer) => {
            this.get(team.teamId).subscribe((team) => {
                observer.next(typeof team === "undefined" ? false : true);
                observer.complete();
            });
        });
    }

    /**
     * Creates a new club team in the database.
     * @param {Team} team - The club team to create in the database.
     * @param {string} clubId - The id of the club the team belongs to.
     * @param {number} seasonId - The id of the season the club is playing in.
     * @returns {Observable} True or false whether it's inserted.
     */
    private _create(team: Team, clubId: string, seasonId: number) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`INSERT INTO teams VALUES (?,?,?,?,?,?,?)`, [team.teamId, team.team, team.divisionId, team.divisionName, team.divisionCategoryId, clubId, seasonId]).subscribe((rows) => {
                observer.next(rows ? true : false);
                observer.complete();
            });
        });
    }

    /**
     * Updates a club team in the database.
     * @param {Team} team - The team to update in the database.
     * @returns {Observable} True or false whether it's updated.
     */
    private _update(team: Team) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`UPDATE teams SET team = ?, divisionId = ?, divisionName = ?, divisionCategoryId = ? WHERE teamId = ?`,
                [team.team, team.divisionId, team.divisionName, team.divisionCategoryId, team.teamId]).subscribe((rows) => {
                    observer.next(rows ? true : false);
                    observer.complete();
                });
        });
    }

    /**
     * Gets all the club team entries from the database.
     * @param {string} clubId - The id of the club the teams belong to.
     * @param {number} seasonId - The id of the season the club is playing in.
     * @returns {Observable<Array<Team>>} An observable with an array of Team instances.
     */
    getAllByClub(club: Club, season: Season) {
        if(typeof club === "undefined" || club === null || typeof season === "undefined" || season === null){
            return Observable.of([]);
        }

        return new Observable<Array<Team>>((observer) => {
            this.db.all(`SELECT * FROM teams WHERE clubId = ? AND seasonId = ?`, [club.uniqueIndex, season.id]).subscribe((rows) => {
                observer.next(this._processClubTeamsFromDatabase(rows));
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
    private _processClubTeamsFromDatabase(rows) {
        let teams = [];

        rows.forEach((row) => {
            teams.push(new Team(row[0], row[1], row[2], row[3], row[4]));
        });

        return teams;
    }

    /**
     * Gets all the club teams from the TabT database.
     * @param {string} clubId - The unique identifier of the club to get the teams from.
     * @param {number} seasonId - The id of the season to retrieve the teams from.
     * @returns {Observable<Team[]>} An array with team objects for a club in TabT.
     */
    getAllFromTabT(clubId: string, seasonId): Observable<Team[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("action", "GetClubTeams");
        params.set("Season", seasonId);
        params.set("Club", clubId);

        let requestOptions = new RequestOptions({
            search: params
        });

        return this.http.get("http://junosolutions.be/ttscore.php", requestOptions).map((response) => {
            let jsonResponse = <TabTClubTeamsResponse>response.json();
            let teams = [];

            jsonResponse.TeamEntries.forEach((teamEntry) => {
                teams.push(new Team(
                    teamEntry.TeamId,
                    teamEntry.Team,
                    teamEntry.DivisionId,
                    teamEntry.DivisionName,
                    teamEntry.DivisionCategory
                ));
            });

            return teams;
        });
    }

    /**
     * Imports the data from the TabT api.
     * @param {string} clubId - The id of the club the teams belong to.
     * @param {number} seasonId - The id of the season the club is playing in.
     * @returns {Observable<Array<Team>>} The result data for the import.
     */
    importFromTabT(clubId: string, seasonId: number): Observable<Array<Team>> {
        return new Observable<Array<Team>>((observer) => {
            this.getAllFromTabT(clubId, seasonId).subscribe((teams) => {
                if(teams.length === 0){
                    observer.next(teams);
                    observer.complete();
                } else {
                    teams.forEach((team) => {
                        this.save(team, clubId, seasonId).subscribe(() => {
                            observer.next(teams);
                            observer.complete();
                        });
                    });
                }
            });
        });
    }
}

interface TabTClubTeamsResponse {
    TeamCount: number;
    TeamEntries: Array<TabTClubTeam>;
}

interface TabTClubTeam {
    TeamId: string;
    Team: string;
    DivisionId: number;
    DivisionName: string;
    DivisionCategory: number;
    MatchType: number;
}