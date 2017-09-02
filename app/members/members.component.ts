import { Component, ViewChild } from "@angular/core";
import { Observable } from "rxjs/Rx";

import { SeasonsService } from "../seasons/seasons.service";
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
    members: Array<ClubMember> = [];

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

            this._clubMembersService.getAllByClub(this.currentClub, responses[1]).subscribe((members) => {
                if(members.length === 0){
                    this._clubMembersService.importFromTabT(this.currentClub.uniqueIndex, responses[1].id).subscribe((importedMembers) => {
                        this.members = importedMembers;
                    });
                } else {
                    this.members = members;
                }
            });
        });
    }
}