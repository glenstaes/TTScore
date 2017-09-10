import { Component, ViewChild } from "@angular/core";
import { Observable } from "rxjs/Rx";

import { SeasonsService } from "../seasons/seasons.service";
import { Season } from "../seasons/season.model";
import { Club } from "../clubs/club.model";
import { ClubsService } from "../clubs/clubs.service";
import { ClubMember } from "../members/ClubMember.model";
import { ClubMemberService } from "../members/clubmember.service";
import { CURRENT_SELECTED_CLUB_KEY, CURRENT_SELECTED_SEASON_KEY } from "../settings/appsettingskeys";
let appSettings = require("application-settings");

@Component({
    templateUrl: "members/members.component.html"
})

/**
 * This component is the page for displaying members of a club.
 * @property {Club} currentClub - The currently configured club.
 * @property {Array<ClubMember>} members - The members of the club.
 */

export class MembersComponent {
    currentClub: Club;
    currentSeason: Season;
    members: Array<ClubMember> = [];
    isLoadingMembers: boolean = false;

    /**
     * Creates a new instance of the component
     * @param {SeasonsService} _seasonsService - The service to work with seasons.
     */
    constructor(
        private _seasonsService: SeasonsService,
        private _clubsService: ClubsService,
        private _clubMembersService: ClubMemberService
    ) {

    }

    /**
     * Tries to get the currently selected club.
     */
    ngOnInit() {
        Observable.forkJoin(
            this._clubsService.get(appSettings.getString(CURRENT_SELECTED_CLUB_KEY), appSettings.getNumber(CURRENT_SELECTED_SEASON_KEY)),
            this._seasonsService.get(appSettings.getNumber(CURRENT_SELECTED_SEASON_KEY))
        ).subscribe((responses) => {
            this.currentClub = responses[0];
            this.currentSeason = responses[1];

            this.isLoadingMembers = true;
            this._clubMembersService.getAllByClub(this.currentClub, this.currentSeason).subscribe((members) => {
                if(members.length === 0){
                    this._loadFromTabT().subscribe(() => {
                        this.isLoadingMembers = false;
                    });
                } else {
                    this.isLoadingMembers = false;
                    this.members = members;
                }
            });
        });
    }

    /**
     * Fired when the refresh icon is tapped. Resets the members array and loads the data from the TabT api.
     */
    onTapRefreshIcon() {
        this.members = [];

        this.isLoadingMembers = true;
        this._loadFromTabT().subscribe(() => {
            this.isLoadingMembers = false;
        });
    }

    /**
     * @private
     * Loads the data from the TabT api and displays the data.
     */
    private _loadFromTabT() {
        const observable = this._clubMembersService.importFromTabT(this.currentClub.uniqueIndex, this.currentSeason.id)
        
        observable.subscribe((importedMembers) => {
            this.members = importedMembers;
        });

        return observable;
    }
}