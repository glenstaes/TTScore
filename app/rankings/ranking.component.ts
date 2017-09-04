import { Component, ViewChild } from "@angular/core";
import { Observable } from "rxjs/Rx";

import { DivisionRanking } from "./DivisionRanking.model";
import { DivisionRankingService } from "./DivisionRanking.service";
import { Team } from "../teams/team.model";
import { TeamsService } from "../teams/teams.service";
import { CURRENT_SELECTED_TEAM_KEY } from "../settings/appsettingskeys";
let appSettings = require("application-settings");

@Component({
    templateUrl: "rankings/ranking.component.html"
})

/**
 * This component is the page for displaying a division ranking.
 */

export class RankingComponent {
    currentTeam: Team;
    rankingEntries: Array<DivisionRanking> = [];
    activePosition: number = 0;

    /**
     * Creates a new instance of the component
     * @param {SeasonsService} _seasonsService - The service to work with seasons.
     */
    constructor(
        private _teamsService: TeamsService,
        private _rankingsService: DivisionRankingService
    ) {

    }

    /**
     * Tries to get the currently selected items.
     */
    ngOnInit() {
        this._teamsService.get(appSettings.getString(CURRENT_SELECTED_TEAM_KEY)).subscribe((team) => {
            this.currentTeam = team;

            // When the team is retrieved, we can start to retrieve the ranking entries
            this._rankingsService.getAllByDivision(this.currentTeam.divisionId).subscribe((rankingEntries) => {
                if (rankingEntries.length === 0) {
                    this._loadFromTabT();
                } else {
                    this.rankingEntries = rankingEntries;
                }
            });
        });
    }

    /**
     * Sets an item as the currently selected item.
     * @param {any} eventData - The event data of the tap event
     */
    onTapRankingItem(eventData) {
        this.activePosition = eventData.index + 1;
    }

    /**
     * Fired when the refresh icon is tapped. Resets the ranking entries array and loads the data from the TabT api.
     */
    onTapRefreshIcon() {
        this.rankingEntries = [];
        this._loadFromTabT();
    }

    /**
     * @private
     * Loads the data from the TabT api and displays the data.
     */
    private _loadFromTabT() {
        this._rankingsService.importFromTabT(this.currentTeam.divisionId).subscribe((importedRankingEntries) => {
            this.rankingEntries = importedRankingEntries;
        });
    }
}