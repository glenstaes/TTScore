import { Injectable } from "@angular/core";
import { Http, RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Rx";

import { DatabaseService } from "../database/database.service";
import { Season } from "../seasons/Season.model";
import { Club } from "../clubs/club.model";
import { ClubMember } from "./ClubMember.model";
import { ClubMemberResultEntry } from "./ClubMemberResultEntry";

@Injectable()
/**
 * 
 */
export class ClubMemberService {
    /**
     * Creates a new instance of the service.
     * @param {DatabaseService} db - The database service for working with the database
     */
    constructor(private db: DatabaseService, private http: Http) {

    }
    
    /**
     * Gets a member from the database.
     * @param {number} memberId - The id of the member to retrieve from the database.
     * @param {number} seasonId - The id of the season to retrieve the member from.
     * @returns {Observable<ClubMember>} The member to get from the database.
     */
    get(memberId: number, seasonId: number) {
        return new Observable<ClubMember>((observer) => {
            this.db.all(`SELECT * FROM clubmembers WHERE uniqueIndex = ? AND seasonId = ?`, [memberId, seasonId]).subscribe((rows) => {
                const members = this._processClubMembersFromDatabase(rows);

                observer.next(members.length ? members[0] : undefined);
                observer.complete();
            });
        });
    }

    /**
     * Saves the passed club member to the database. If an id exists, an update is executed, otherwise a new member is created.
     * @param {ClubMember} member - The club member to save.
     * @param {string} clubId - The unique identifier of the club the member belongs to.
     * @param {number} seasonId - The unique identifier of the season the member belongs to.
     * @returns {Observable<ClubMember>} An observable that is resolved with the inserted/updated club member.
     */
    save(member: ClubMember, clubId: string, seasonId: number): Observable<ClubMember> {
        return new Observable((observer) => {
            this.exists(member, seasonId).subscribe((exists) => {
                if (exists) {
                    this._update(member, clubId, seasonId).subscribe((saved) => {
                        observer.next(member);
                    });
                } else {
                    this._create(member, clubId, seasonId).subscribe((saved) => {
                        observer.next(member);
                    });
                }
            })
        });
    }

    /**
     * Checks whether a club member already exists.
     * @param {ClubMember} member - The club member to check whether exists.
     * @param {number} seasonId - The season to look into.
     * @returns {Observable<boolean>} True or false in an observable whether the club exists.
     */
    exists(member: ClubMember, seasonId: number): Observable<boolean> {
        return new Observable((observer) => {
            this.get(member.uniqueIndex, seasonId).subscribe((member) => {
                observer.next(typeof member === "undefined" ? false : true);
                observer.complete();
            });
        });
    }

    /**
     * Creates a new club member in the database.
     * @param {ClubMember} member - The club member to create in the database.
     * @param {string} clubId - The unique identifier of the club the member belongs to.
     * @param {number} seasonId - The unique identifier of the season the member belongs to.
     * @returns {Observable} True or false whether it's inserted.
     */
    private _create(member: ClubMember, clubId, seasonId) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`INSERT INTO clubmembers VALUES (?,?,?,?,?,?,?,?)`, [member.position, member.uniqueIndex, member.rankingIndex, member.firstName, member.lastName, member.ranking, seasonId, clubId]).subscribe((rows) => {
                observer.next(rows ? true : false);
                observer.complete();
            });
        });
    }

    /**
     * Updates a club member in the database.
     * @param {ClubMember} member - The member to update in the database.
     * @param {string} clubId - The unique identifier of the club the member belongs to.
     * @param {number} seasonId - The unique identifier of the season the member belongs to.
     * @returns {Observable} True or false whether it's updated.
     */
    private _update(member: ClubMember, clubId: string, seasonId: number) {
        return new Observable<boolean>((observer) => {
            this.db.execSQL(`UPDATE clubmembers SET position = ?, rankingIndex = ?, firstName = ?, lastName = ?, ranking = ?, clubId = ? WHERE seasonId = ? AND uniqueIndex = ?`,
                [member.position, member.rankingIndex, member.firstName, member.lastName, member.ranking, clubId, seasonId, member.uniqueIndex]).subscribe((rows) => {
                    observer.next(rows ? true : false);
                    observer.complete();
                });
        });
    }

    /**
     * Gets all the club member entries from the database.
     * @returns {Observable<Array<ClubMember>>} An observable with an array of ClubMember instances.
     */
    getAllByClub(club: Club, season: Season) {
        return new Observable<Array<ClubMember>>((observer) => {
            this.db.all(`SELECT * FROM clubmembers WHERE clubId = ? AND seasonId = ?`, [club.uniqueIndex, season.id]).subscribe((rows) => {
                observer.next(this._processClubMembersFromDatabase(rows));
                observer.complete();
            });
        });
    }

    /**
     * @private
     * Process the rows from the database into ClubMember instances.
     * @param rows - The rows that were returned by the query.
     * @returns {Array<ClubMember>} An array of Club instances.
     */
    private _processClubMembersFromDatabase(rows) {
        let members = [];

        rows.forEach((row) => {
            members.push(new ClubMember(row[0], row[1], row[2], row[3], row[4], row[5]));
        });

        return members;
    }

    /**
     * Gets the information for a single member in the current season
     * @param {any} uniqueIndex - The unique index of the member
     */
    getFromTabT(uniqueIndex): Observable<ClubMember>{
        let params: URLSearchParams = new URLSearchParams();
        params.set("action", "GetMembers");
        params.set("UniqueIndex", uniqueIndex);
        params.set("WithResults", "true");

        let requestOptions = new RequestOptions({
            search: params
        });

        return this.http.get("http://junosolutions.be/ttscore.php", requestOptions).map((response) => {
            let jsonResponse = <TabTClubMembersResponse>response.json();
            let members = [];

            jsonResponse.MemberEntries.forEach((memberEntry: TabTClubMember) => {
                members.push(ClubMember.createFromApi(memberEntry));
            });

            return members.length ? members[0] : undefined;
        });
    }

    /**
     * Gets all the club members from the TabT database.
     * @param {string} clubId - The unique identifier of the club to get the members from.
     * @param {number} seasonId - The id of the season to retrieve the clubs from.
     * @returns {Observable<ClubMember[]>} An array with club objects for each club entry in TabT.
     */
    getAllFromTabT(clubId: string, seasonId): Observable<ClubMember[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set("action", "GetMembers");
        params.set("Season", seasonId);
        params.set("Club", clubId);

        let requestOptions = new RequestOptions({
            search: params
        });

        return this.http.get("http://junosolutions.be/ttscore.php", requestOptions).map((response) => {
            let jsonResponse = <TabTClubMembersResponse>response.json();
            let members = [];

            jsonResponse.MemberEntries.forEach((memberEntry: TabTClubMember) => {
                members.push(ClubMember.createFromApi(memberEntry));
            });

            return members;
        });
    }

    /**
     * Imports the data from the TabT api.
     * @returns {Observable<Array<ClubMember>>} The result data for the import.
     */
    importFromTabT(clubId: string, seasonId: number): Observable<Array<ClubMember>> {
        return new Observable<Array<ClubMember>>((observer) => {
            this.getAllFromTabT(clubId, seasonId).subscribe((members) => {
                members.forEach((member) => {
                    this.save(member, clubId, seasonId).subscribe(() => {
                        observer.next(members);
                        observer.complete();
                    });
                });
            });
        });
    }
}

interface TabTClubMembersResponse {
    MemberCount: number;
    MemberEntries: Array<TabTClubMember>;
}

export interface TabTClubMemberResultEntryResponse{
    Date?: string;
    UniqueIndex: number;
    FirstName: string;
    LastName: string;
    Ranking: string;
    Result: string;
    SetFor: number;
    SetAgainst: number;
}

export interface TabTClubMember {
    Position: number;
    UniqueIndex: number;
    RankingIndex: number;
    FirstName: string;
    LastName: string;
    Ranking: string;
    ResultCount?: number;
    ResultEntries?: Array<TabTClubMemberResultEntryResponse>;
}