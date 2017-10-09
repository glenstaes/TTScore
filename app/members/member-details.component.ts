import { Component, ViewChild } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";

import { ClubMember } from "../members/ClubMember.model";
import { ClubMemberService } from "../members/clubmember.service";
let appSettings = require("application-settings");

@Component({
    templateUrl: "members/member-details.component.html",
    styles: [`
        .victory{
            background-color: #ceffd9;
        }

        .defeat {
            background-color: #ffcece;
        }
    `]
})

/**
 * This component is the page for displaying members of a club.
 * @property {Club} currentClub - The currently configured club.
 * @property {Array<ClubMember>} members - The members of the club.
 */

export class MemberDetailsComponent {
    member: ClubMember = undefined;
    memberId: number;
    isLoading: boolean = false;

    /**
     * Creates a new instance of the component
     */
    constructor(
        private _clubMembersService: ClubMemberService,
        private _activatedRoute: ActivatedRoute,
        private _routerExtensions: RouterExtensions
    ) {

    }

    /**
     * Tries to get the currently selected club.
     */
    ngOnInit() {
        this._activatedRoute.params.subscribe((params) => {
            this.memberId = +params["uniqueIndex"];
            this._loadFromTabT();
        })
    }

    /**
     * Fired when the refresh icon is tapped. Resets the members array and loads the data from the TabT api.
     */
    onTapRefreshIcon() {
        this.member = undefined;

        this.isLoading = true;
        this._loadFromTabT().subscribe(() => {
            this.isLoading = false;
        });
    }

    /**
     * Returns to the previous page.
     */
    onTapBackIcon(){
        this._routerExtensions.back();
    }

    /**
     * @private
     * Loads the data from the TabT api and displays the data.
     */
    private _loadFromTabT() {
        const observable = this._clubMembersService.getFromTabT(this.memberId);
        
        observable.subscribe((importedMembers) => {
            this.member = importedMembers;
        });

        return observable;
    }
}