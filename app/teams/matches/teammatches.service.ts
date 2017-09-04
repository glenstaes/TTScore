import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Rx";

import { DatabaseService } from "../../database/database.service";
import { Season } from "../../seasons/Season.model";
import { Club } from "../../clubs/club.model";
import { Team } from "../team.model";
import { TeamMatch } from "./TeamMatch.model";

@Injectable()
/**
 * 
 */
export class TeamMatchesService {
    /**
     * Creates a new instance of the service.
     * @param {DatabaseService} db - The database service for working with the database
     */
    constructor(private db: DatabaseService, private http: Http) {
        this._ensureTable();
    }

    /**
     * @private
     * Ensures that the teams table exists in the database.
     */
    private _ensureTable() {
        this.db.execSQL(`CREATE TABLE IF NOT EXISTS matches (divisionId TEXT, matchId TEXT, teamId TEXT, weekName TEXT, date TEXT, time TEXT, venue INTEGER, homeClubId TEXT, homeTeam TEXT, awayClubId TEXT, awayTeam TEXT, isHomeForfeited INTEGER, isAwayForfeited INTEGER, score TEXT)`).subscribe();
    }
    /**
     * Gets a match from the database.
     * @param {string} matchId - The id of the match to retrieve from the database.
     * @param {number} divisionId - The id of the division the match is played in.
     * @param {string} teamId - The id of the team
     * @returns {Observable<TeamMatch>} The match to get from the database.
     */
    get(matchId: string, divisionId: number, teamId: string) {
        return new Observable<Team>((observer) => {
            if (typeof matchId === "undefined" || matchId === null) {
                observer.next(undefined);
                observer.complete();
            } else {
                this.db.all(`SELECT * FROM matches WHERE matchId = ? AND divisionId = ? AND teamId = ?`, [matchId, divisionId, teamId]).subscribe((rows) => {
                    const matches = this._processTeamMatchesFromDatabase(rows);

                    observer.next(matches.length ? matches[0] : undefined);
                    observer.complete();
                });
            }
        });
    }

    /**
     * Saves the passed team match to the database. If an id exists, an update is executed, otherwise a new match is created.
     * @param {TeamMatch} match - The match to save.
     * @returns {Observable<TeamMatch>} An observable that is resolved with the inserted/updated club team.
     */
    save(match: TeamMatch): Observable<TeamMatch> {
        return new Observable((observer) => {
            this.exists(match).subscribe((exists) => {
                if (exists) {
                    this._update(match).subscribe((saved) => {
                        observer.next(match);
                    });
                } else {
                    this._create(match).subscribe((saved) => {
                        observer.next(match);
                    });
                }
            })
        });
    }

    /**
     * Checks whether a match already exists.
     * @param {TeamMatch} match - The match to check whether it exists.
     * @returns {Observable<boolean>} True or false in an observable whether the match exists.
     */
    exists(match: TeamMatch): Observable<boolean> {
        return new Observable((observer) => {
            this.get(match.matchNumber, match.divisionId, match.teamId).subscribe((team) => {
                observer.next(typeof team === "undefined" ? false : true);
                observer.complete();
            });
        });
    }

    /**
     * Creates a new match in the database.
     * @param {TeamMatch} match - The match to create in the database.
     * @returns {Observable} True or false whether it's inserted.
     */
    private _create(match: TeamMatch) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`INSERT INTO matches VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                match.divisionId,
                match.matchNumber,
                match.teamId,
                match.weekName,
                match.date,
                match.time,
                match.venueNumber,
                match.homeClubId,
                match.homeTeam,
                match.awayClubId,
                match.awayTeam,
                match.isHomeForfeited,
                match.isAwayForfeited,
                match.score
            ]).subscribe((rows) => {
                observer.next(rows ? true : false);
                observer.complete();
            });
        });
    }

    /**
     * Updates a match in the database.
     * @param {TeamMatch} match - The match to update in the database.
     * @returns {Observable<boolean>} True or false whether it's updated.
     */
    private _update(match: TeamMatch) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`UPDATE matches 
                                SET weekName = ?, date = ?, time = ?, venue = ?, homeClubId = ?, homeTeam = ?, awayClubId = ?, awayTeam = ?, isHomeForfeited = ?, isAwayForfeited = ?, score = ?
                                WHERE matchId = ? AND divisionId = ?`,
                [
                    match.weekName,
                    match.date,
                    match.time,
                    match.venueNumber,
                    match.homeClubId,
                    match.homeTeam,
                    match.awayClubId,
                    match.awayTeam,
                    match.isHomeForfeited,
                    match.isAwayForfeited,
                    match.score,
                    match.matchNumber,
                    match.divisionId
                ]).subscribe((rows) => {
                    observer.next(rows ? true : false);
                    observer.complete();
                });
        });
    }

    /**
     * Gets all the match entries for a team.
     * @param {string} clubId - The id of the club the teams belong to.
     * @returns {Observable<Array<TeamMatch>>} An observable with an array of TeamMatch instances.
     */
    getAllByTeam(team: Team) {
        return new Observable<Array<TeamMatch>>((observer) => {
            this.db.all(`SELECT * FROM matches WHERE teamId = ? ORDER BY weekName`, [team.teamId]).subscribe((rows) => {
                observer.next(this._processTeamMatchesFromDatabase(rows));
                observer.complete();
            });
        });
    }

    /**
     * Gets all the match entries for a division.
     * @param {number} divisionId - The id of the division to get the matches for.
     */
    getAllByDivision(divisionId: number) {
        return new Observable<Array<TeamMatch>>((observer) => {
            this.db.all(`SELECT * FROM matches WHERE divisionId = ? AND teamId = "" ORDER BY weekName`, [divisionId]).subscribe((rows) => {
                observer.next(this._processTeamMatchesFromDatabase(rows));
                observer.complete();
            });
        });
    }

    /**
     * @private
     * Process the rows from the database into TeamMatch instances.
     * @param rows - The rows that were returned by the query.
     * @returns {Array<TeamMatch>} An array of Team instances.
     */
    private _processTeamMatchesFromDatabase(rows) {
        let matches = [];

        rows.forEach((row) => {
            matches.push(new TeamMatch(
                row[0],
                row[1],
                row[2],
                row[3],
                row[4],
                row[5],
                row[6],
                row[7],
                row[8],
                row[9],
                row[10],
                row[11],
                row[12],
                row[13]
            ));
        });

        return matches;
    }

    /**
     * Gets all the matches for a team from the TabT database.
     * @param {string} clubId - The unique identifier of the club the team belongs to.
     * @param {number} divisionId - The division identifier the team plays in.
     * @param {string} teamLetter - The letter of the team.
     * @returns {Observable<Array<TeamMatch>>} An array with team objects for a club in TabT.
     */
    getAllFromTabT(clubId: string, team: Team, divisionId: number): Observable<Array<TeamMatch>> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("action", "GetMatches");

        // Get for a specific team, otherwise for the entire division
        if (typeof divisionId === "undefined") {
            params.set("Club", clubId);
            params.set("Team", team.team);
            params.set("DivisionId", team.divisionId.toString());
        } else {
            params.set("DivisionId", divisionId.toString());
        }

        let requestOptions = new RequestOptions({
            search: params
        });

        return this.http.get("http://junosolutions.be/ttscore.php", requestOptions).map((response) => {
            let jsonResponse = <TabTTeamMatchesResponse>response.json();
            let teams = [];

            jsonResponse.TeamMatchesEntries.forEach((matchEntry) => {
                teams.push(new TeamMatch(
                    divisionId || team.divisionId,
                    matchEntry.MatchId,
                    typeof divisionId !== "undefined" ? "" : team.teamId,
                    matchEntry.WeekName,
                    matchEntry.Date,
                    matchEntry.Time,
                    matchEntry.Venue,
                    matchEntry.HomeClub,
                    matchEntry.HomeTeam,
                    matchEntry.AwayClub,
                    matchEntry.AwayTeam,
                    matchEntry.IsHomeForfeited,
                    matchEntry.IsAwayForfeited,
                    matchEntry.Score
                ));
            });

            return teams;
        });
    }

    /**
     * Imports the data from the TabT api.
     * @param {string} clubId - The unique identifier of the club the team belongs to.
     * @param {Team} team - The team to get the matches for.
     * @param {number} divisionId - The division id to get the matches for.
     * @returns {Observable<Array<TeamMatch>>} The result data for the import.
     */
    importFromTabT(clubId: string, team: Team, divisionId: number): Observable<Array<TeamMatch>> {
        return new Observable<Array<TeamMatch>>((observer) => {
            this.getAllFromTabT(clubId, team, divisionId).subscribe((matches) => {
                matches.forEach((match) => {
                    this.save(match).subscribe(() => {
                        observer.next(matches);
                        observer.complete();
                    });
                });
            });
        });
    }
}

interface TabTTeamMatchesResponse {
    MatchCount: number;
    TeamMatchesEntries: Array<TabTTeamMatch>;
}

interface TabTTeamMatch {
    MatchId: string;
    WeekName: string;
    Date: string;
    Time: string;
    Venue: number;
    HomeClub: string;
    HomeTeam: string;
    AwayClub: string;
    AwayTeam: string;
    NextWeekName: string;
    PreviousWeekName: string;
    IsHomeForfeited: boolean;
    IsAwayForfeited: boolean;
    Score: string;
}