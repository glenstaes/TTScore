import { Component, ViewChild } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";

import { ClubMember } from "../members/ClubMember.model";
import { ClubMemberService } from "../members/clubmember.service";
let appSettings = require("application-settings");

@Component({
    templateUrl: "members/member-details.component.html"
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
    resultsByRanking: Array<any> = [];

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
            this._loadFromTabT().subscribe(() => {
                this.calculateOverview();
            });
        })
    }

    /**
     * Calculates the overview of results grouped by the ranking
     */
    calculateOverview(){
        this.resultsByRanking = [];

        const resultsByRankingLocal = {};
        this.member.resultEntries.forEach((resultEntry) => {
            // Initialise a new entry if the ranking was not added yet
            if(Object.keys(resultsByRankingLocal).indexOf(resultEntry.ranking) === -1){
                resultsByRankingLocal[resultEntry.ranking] = {
                    won: 0,
                    loss: 0,
                    matches: []
                };
            }

            // Improve the won or loss number depending on the result
            if(resultEntry.resultIndicator === "V"){
                resultsByRankingLocal[resultEntry.ranking].won += 1;
            } else {
                resultsByRankingLocal[resultEntry.ranking].loss += 1;
            }

            resultsByRankingLocal[resultEntry.ranking].matches.push(resultEntry);
        });

        // Map to an array that can be shown
        const rankingKeys = Object.keys(resultsByRankingLocal).sort();
        for(let i = 0, len = rankingKeys.length; i < len; i++){
            let currentRanking = rankingKeys[i];
            let currentResults = resultsByRankingLocal[currentRanking];

            this.resultsByRanking.push({
                ranking: currentRanking,
                won: currentResults.won,
                loss: currentResults.loss,
                matches: currentResults.matches
            });
        }
    }

    /**
     * Fired when the refresh icon is tapped. Resets the members array and loads the data from the TabT api.
     */
    onTapRefreshIcon() {
        this.member = undefined;

        this.isLoading = true;
        this._loadFromTabT().subscribe(() => {
            this.isLoading = false;
            this.calculateOverview();
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
        return this._clubMembersService.getFromTabT(this.memberId).map((importedMembers) => {
            this.member = importedMembers;
            return this.member;
        });
    }
}