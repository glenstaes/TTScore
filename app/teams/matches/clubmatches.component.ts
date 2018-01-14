import { Component, ViewChild } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { RouterExtensions } from "nativescript-angular/router";

import { TeamMatch } from "./TeamMatch.model";
import { TeamMatchesService } from "./teammatches.service";
import { Club } from "../../clubs/club.model";
import { SettingsService } from "../../settings/settings.service";

let appSettings = require("application-settings");

@Component({
    templateUrl: "teams/matches/clubmatches.component.html",
    styles: [`
        .textright{
            text-align: right;
        }
    `]
})

/**
 * This component is the page for displaying a list of matches for a club
 */

export class ClubMatchesComponent {
    currentClub: Club;
    isLoadingMatches: boolean = false;
    tabSelectedIndex = 1;

    dayOfThisWeek: Date;
    dayOfLastWeek: Date;
    dayOfNextWeek: Date;

    matchesLastWeek: Array<TeamMatch> = [];
    matchesThisWeek: Array<TeamMatch> = [];
    matchesNextWeek: Array<TeamMatch> = [];

    /**
     * Creates a new instance of the component
     * @param {ClubsService} _clubsService - The service to work with teams.
     * @param {TeamMatchesService} _matchesService - The service to work with team matches.
     */
    constructor(
        private _settingsService: SettingsService,
        private _matchesService: TeamMatchesService,
        private _routerExtensions: RouterExtensions
    ) {
        this.dayOfThisWeek = new Date();
        this.dayOfLastWeek = new Date();
        this.dayOfNextWeek = new Date();

        // Add 7 days to get a date in the next week
        this.dayOfNextWeek.setDate(this.dayOfNextWeek.getDate() + 7);

        // Subtract 7 days to get a date in the last week
        this.dayOfLastWeek.setDate(this.dayOfLastWeek.getDate() - 7);
    }

    /**
     * Tries to get the currently selected items.
     */
    ngOnInit() {
        this.currentClub = this._settingsService.currentClub;

        // When the club is retrieved, we can start to retrieve the matches
        this.isLoadingMatches = true;
        this._loadFromTabT();
    }

    /**
     * Fired when the refresh icon is tapped. Resets the ranking entries array and loads the data from the TabT api.
     */
    onTapRefreshIcon() {
        this.matchesLastWeek = [];
        this.matchesThisWeek = [];
        this.matchesNextWeek = [];
        
        this._loadFromTabT();
    }

    /**
     * Callback for when a match in the list is tapped. Navigates to the match details.
     */
    onTapMatch(match: TeamMatch) {
        // const match = this.matches[event.index];
        // this._routerExtensions.navigate(["/match-details/" + this.currentTeam.divisionId + "/" + match.uniqueIndex]);
    }

    /**
     * @private
     * Loads the data from the TabT api and displays the data.
     */
    private _loadFromTabT() {
        const observables = [];
        observables.push(this._matchesService.getClubMatchesInWeek(this.currentClub.uniqueIndex, this.dayOfLastWeek));
        observables.push(this._matchesService.getClubMatchesInWeek(this.currentClub.uniqueIndex, this.dayOfThisWeek));
        observables.push(this._matchesService.getClubMatchesInWeek(this.currentClub.uniqueIndex, this.dayOfNextWeek));

        const forkJoin = Observable.forkJoin(...observables);

        this.isLoadingMatches = true;
        forkJoin.finally(() => {
            this.isLoadingMatches = false;  
        }).subscribe((matches: Array<Array<TeamMatch>>) => {
            this.matchesLastWeek = matches[0];
            this.matchesThisWeek = matches[1];
            this.matchesNextWeek = matches[2];
        });

        return forkJoin;
    }
}