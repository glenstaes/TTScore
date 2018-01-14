import { Component, ViewChild } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { RouterExtensions } from "nativescript-angular/router";

import { Team } from "../../teams/team.model";
import { TeamsService } from "../../teams/teams.service";
import { CURRENT_SELECTED_TEAM_KEY, CURRENT_SELECTED_CLUB_KEY } from "../../settings/appsettingskeys";
import { TeamMatch } from "./TeamMatch.model";
import { TeamMatchesService } from "./teammatches.service";

let appSettings = require("application-settings");

@Component({
    templateUrl: "teams/matches/teammatches.component.html",
    styles: [`
        .textright{
            text-align: right;
        }
    `]
})

/**
 * This component is the page for displaying a list of matches for a team
 */

export class TeamMatchesComponent {
    currentTeam: Team;
    matches: Array<TeamMatch> = [];
    isLoadingMatches: boolean = false;

    /**
     * Creates a new instance of the component
     * @param {TeamsService} _teamsService - The service to work with teams.
     * @param {TeamMatchesService} _matchesService - The service to work with team matches.
     */
    constructor(
        private _teamsService: TeamsService,
        private _matchesService: TeamMatchesService,
        private _routerExtensions: RouterExtensions
    ) {

    }

    /**
     * Tries to get the currently selected items.
     */
    ngOnInit() {
        this._teamsService.get(appSettings.getString(CURRENT_SELECTED_TEAM_KEY)).subscribe((team) => {
            this.currentTeam = team;

            // When the team is retrieved, we can start to retrieve the matches
            this.isLoadingMatches = true;
            this._matchesService.getAllByTeam(this.currentTeam).subscribe((matches) => {
                if (matches.length === 0) {
                    this._loadFromTabT().subscribe(() => {
                        this.isLoadingMatches = false;
                    });
                } else {
                    this.isLoadingMatches = false;
                    this.matches = matches;
                }
            });
        });
    }
    /**
     * Fired when the refresh icon is tapped. Resets the ranking entries array and loads the data from the TabT api.
     */
    onTapRefreshIcon() {
        this.matches = [];
        this.isLoadingMatches = true;
        this._loadFromTabT().subscribe(() => {
            this.isLoadingMatches = false;
        });
    }

    /**
     * Callback for when a match in the list is tapped. Navigates to the match details.
     */
    onTapMatch(match){
        this._routerExtensions.navigate(["/match-details/" + this.currentTeam.divisionId + "/" + match.uniqueIndex]);
    }

    /**
     * @private
     * Loads the data from the TabT api and displays the data.
     */
    private _loadFromTabT() {
        // undefined as third parameter makes sure that only team matches are retrieved
        const observable = this._matchesService.importFromTabT(appSettings.getString(CURRENT_SELECTED_CLUB_KEY), this.currentTeam, undefined);
        
        observable.subscribe((matches) => {
            this.matches = matches;
        });

        return observable;
    }
}