import { Component, ViewChild } from "@angular/core";
import { Observable } from "rxjs/Rx";

import { Team } from "../../teams/team.model";
import { TeamsService } from "../../teams/teams.service";
import { CURRENT_SELECTED_TEAM_KEY, CURRENT_SELECTED_CLUB_KEY } from "../../settings/appsettingskeys";
import { TeamMatch } from "./TeamMatch.model";
import { DivisionWeekMatches, DivisionWeekMatchesList } from "./DivisionWeekMatches.model";
import { TeamMatchesService } from "./teammatches.service";

let appSettings = require("application-settings");

@Component({
    templateUrl: "teams/matches/divisionmatches.component.html",
    styles: [`
        .textright{
            text-align: right;
        }
    `]
})

/**
 * This component is the page for displaying a list of matches for a division
 */

export class DivisionMatchesComponent {
    currentTeam: Team;
    currentWeek = "01";
    matches: Array<TeamMatch> = [];
    weekNames = ["01", "02", "03"];

    /**
     * Creates a new instance of the component
     * @param {TeamsService} _teamsService - The service to work with teams.
     * @param {TeamMatchesService} _matchesService - The service to work with team matches.
     */
    constructor(
        private _teamsService: TeamsService,
        private _matchesService: TeamMatchesService
    ) {

    }

    /**
     * Tries to get the currently selected items.
     */
    ngOnInit() {
        this._teamsService.get(appSettings.getString(CURRENT_SELECTED_TEAM_KEY)).subscribe((team) => {
            this.currentTeam = team;

            // When the team is retrieved, we can start to retrieve the matches
            this._matchesService.getAllByDivision(this.currentTeam.divisionId).subscribe((matches) => {
                if (matches.length === 0) {
                    this._loadFromTabT();
                } else {
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
        this._loadFromTabT();
    }

    /**
     * @private
     * Loads the data from the TabT api and displays the data.
     */
    private _loadFromTabT() {
        // Sending a third parameter makes sure the matches for the division are loaded
        this._matchesService.importFromTabT(appSettings.getString(CURRENT_SELECTED_CLUB_KEY), this.currentTeam, this.currentTeam.divisionId).subscribe((matches) => {
            this.matches = matches;
        });
    }
}