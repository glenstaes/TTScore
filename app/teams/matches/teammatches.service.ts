import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Rx";

import { DatabaseService } from "../../database/database.service";
import { Season } from "../../seasons/Season.model";
import { Club } from "../../clubs/club.model";
import { Team } from "../team.model";
import { TeamMatch } from "./TeamMatch.model";
import { MatchDetails, MatchTeamPlayers, MatchPlayer, IndividualMatchResult } from "./match-details/MatchDetails.model";
import { nextAndComplete, getMonday, getSunday } from "../../helpers";

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
                nextAndComplete(observer, undefined)();
            } else {
                this.db.all(`SELECT * FROM matches WHERE matchId = ? AND divisionId = ? AND teamId = ?`, [matchId, divisionId, teamId]).subscribe((rows) => {
                    const matches = this._processTeamMatchesFromDatabase(rows);
                    nextAndComplete(observer, matches.length ? matches[0] : undefined)();
                });
            }
        });
    }

    /**
     * Gets the details of a match from the TabT database.
     * @param matchId The unique identifier of the match
     * @param divisionId The unique identifier of the division the match belongs to
     * @param seasonId The season the match belongs to
     */
    getMatchDetails(matchId: number, divisionId: number, seasonId: number): Observable<TeamMatch>{
        let params: URLSearchParams = new URLSearchParams();
        params.set("action", "GetMatches");
        params.set("MatchUniqueId", matchId.toString());
        params.set("WithDetails", true.toString());
        params.set("Season", seasonId.toString());

        let requestOptions = new RequestOptions({
            search: params
        });

        return this.http.get("http://junosolutions.be/ttscore.php", requestOptions).map((response) => {
            let jsonResponse = <TabTTeamMatchesResponse>response.json();
            let matches = [];

            jsonResponse.TeamMatchesEntries.forEach((matchEntry) => {
                const match = new TeamMatch(
                    matchEntry.MatchUniqueId,
                    divisionId,
                    matchEntry.MatchId,
                    "",
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
                );

                match.details = new MatchDetails(
                    matchEntry.MatchDetails.DetailsCreated,
                    matchEntry.MatchDetails.HomeCaptain,
                    matchEntry.MatchDetails.AwayCaptain,
                    matchEntry.MatchDetails.Referee,
                    new MatchTeamPlayers(matchEntry.MatchDetails.HomePlayers.PlayersCount, matchEntry.MatchDetails.HomePlayers.DoubleTeamCount, matchEntry.MatchDetails.HomePlayers.Players.map((player) => {
                        return new MatchPlayer(player.Position, player.UniqueIndex, player.FirstName, player.LastName, player.Ranking, player.VictoryCount);
                    })),
                    new MatchTeamPlayers(matchEntry.MatchDetails.AwayPlayers.PlayersCount, matchEntry.MatchDetails.AwayPlayers.DoubleTeamCount, matchEntry.MatchDetails.AwayPlayers.Players.map((player) => {
                        return new MatchPlayer(player.Position, player.UniqueIndex, player.FirstName, player.LastName, player.Ranking, player.VictoryCount);
                    })),
                    matchEntry.MatchDetails.IndividualMatchResults.map((result) => {
                        return new IndividualMatchResult(
                            result.Position, 
                            result.HomePlayerMatchIndex, 
                            result.HomePlayerUniqueIndex,
                            result.IsHomeForfeited || false,
                            result.AwayPlayerMatchIndex, 
                            result.AwayPlayerUniqueIndex, 
                            result.IsAwayForfeited || false,
                            result.HomeSetCount, 
                            result.AwaySetCount, 
                            result.Scores);
                    }),
                    matchEntry.MatchDetails.MatchSystem,
                    matchEntry.MatchDetails.HomeScore,
                    matchEntry.MatchDetails.AwayScore
                );

                matches.push(match);
            });

            return matches.length ? matches[0] : undefined;
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
                (exists ? this._update(match) : this._create(match)).subscribe(nextAndComplete(observer, match));
            });
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
                nextAndComplete(observer, typeof team === "undefined" ? false : true)();
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
            this.db.execSQL(`INSERT INTO matches VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
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
                match.score,
                match.uniqueIndex
            ]).subscribe((rows) => {
                nextAndComplete(observer, rows ? true : false)();
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
                                SET uniqueIndex = ?, weekName = ?, date = ?, time = ?, venue = ?, homeClubId = ?, homeTeam = ?, awayClubId = ?, awayTeam = ?, isHomeForfeited = ?, isAwayForfeited = ?, score = ?
                                WHERE matchId = ? AND divisionId = ?`,
                [
                    match.uniqueIndex,
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
                    nextAndComplete(observer, rows ? true : false)();
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
                nextAndComplete(observer, this._processTeamMatchesFromDatabase(rows))();
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
                nextAndComplete(observer, this._processTeamMatchesFromDatabase(rows))();
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
                row[14],
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
     * Gets the matches for a club in a specific week.
     * @param clubId The unique identifier of the club
     * @param dayOfWeek A day of the week to fetch the matches for. Can be any day in that week.
     */
    getClubMatchesInWeek(clubId: string, dayOfWeek: Date){
        const monday = getMonday(dayOfWeek);
        const sunday = getSunday(dayOfWeek);
        
        let params: URLSearchParams = new URLSearchParams();
        params.set("action", "GetMatches");
        params.set("Club", clubId);
        params.set("YearDateFrom", `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`);
        params.set("YearDateTo", `${sunday.getFullYear()}-${sunday.getMonth() + 1}-${sunday.getDate()}`);

        let requestOptions = new RequestOptions({
            search: params
        });

        return this.http.get("http://junosolutions.be/ttscore.php", requestOptions).map((response) => {
            let jsonResponse = <TabTTeamMatchesResponse>(response.json() || { TeamMatchesEntries: [] });
            let matches = [];

            jsonResponse.TeamMatchesEntries.forEach((matchEntry) => {
                matches.push(new TeamMatch(
                    matchEntry.MatchUniqueId,
                    null,
                    matchEntry.MatchId,
                    "",
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

            return matches;
        });
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
                    matchEntry.MatchUniqueId,
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
                    this.save(match).subscribe(nextAndComplete(observer, matches));
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
    MatchUniqueId: number;
    MatchDetails?: TabTMatchDetails;
}

interface TabTMatchDetails{
    DetailsCreated: boolean;
    HomeCaptain: number;
    AwayCaptain: number;
    Referee: number;
    HomePlayers: TabTMatchPlayers;
    AwayPlayers: TabTMatchPlayers;
    IndividualMatchResults: Array<TabTIndividualMatchResult>;
    MatchSystem: number;
    HomeScore: number;
    AwayScore: number;
}

interface TabTMatchPlayers {
    PlayersCount: number;
    DoubleTeamCount: number;
    Players: Array<TabTMatchPlayer>
}

interface TabTMatchPlayer {
    Position: number;
    UniqueIndex: number;
    FirstName: string;
    LastName: string;
    Ranking: string;
    VictoryCount: number;
}

interface TabTIndividualMatchResult{
    Position: number;
    HomePlayerMatchIndex: number;
    HomePlayerUniqueIndex: number;
    IsHomeForfeited: boolean;
    AwayPlayerMatchIndex: number;
    AwayPlayerUniqueIndex: number;
    IsAwayForfeited: boolean;
    HomeSetCount: number;
    AwaySetCount: number;
    Scores: string;
}