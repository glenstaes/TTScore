import { Component, OnInit } from "@angular/core";
import { SeasonsService } from "../seasons/seasons.service";
import { Season } from "../seasons/season.model";
import { ClubsService } from "../clubs/clubs.service";
import { Club } from "../clubs/club.model";
import { Team } from "../teams/team.model";
import { TeamsService } from "../teams/teams.service";
import { CURRENT_SELECTED_CLUB_KEY, CURRENT_SELECTED_SEASON_KEY, CURRENT_SELECTED_TEAM_KEY } from "../settings/appsettingskeys";
import { Observable } from "rxjs/Observable";
let appSettings = require("application-settings");

@Component({
    templateUrl: "home/home.component.tmpl.html"
})
export class HomeComponent implements OnInit {
    currentClub: Club;
    currentSeason: Season;
    currentTeam: Team;

    // List datasources
    allTeams: Array<Team> = [];
    selectedTeamIndex = 0;

    // Messages
    noClubLabel = "Selecteer een favoriete club in de instellingen";
    noTeamsLabel = "Er zijn (nog) geen teams gevonden voor deze club";

    /**
     * Creates a new instance of the component
     * @param {SeasonsService} _seasonsService - The service to work with seasons.
     */
    constructor(
        private _seasonsService: SeasonsService, 
        private _clubsService: ClubsService,
        private _teamsService: TeamsService
    ) {

    }

    /**
     * Tries to get the currently selected club, season and team.
     */
    ngOnInit() {
        // First, load the items that are configured.
        Observable.forkJoin(
            this._clubsService.get(appSettings.getString(CURRENT_SELECTED_CLUB_KEY), appSettings.getNumber(CURRENT_SELECTED_SEASON_KEY)),
            this._seasonsService.get(appSettings.getNumber(CURRENT_SELECTED_SEASON_KEY)),
            this._teamsService.get(appSettings.getString(CURRENT_SELECTED_TEAM_KEY))
        ).subscribe((responses) => {
            this.currentClub = responses[0];
            this.currentSeason = responses[1];
            this.currentTeam = responses[2];

            // Load the teams for the club
            this._teamsService.getAllByClub(this.currentClub, this.currentSeason).subscribe((teams) => {
                if(teams.length === 0){
                    // Import if still not found
                    this._teamsService.importFromTabT(this.currentClub.uniqueIndex, this.currentSeason.id).subscribe((importedTeams) => {
                        this.allTeams = importedTeams;
                    });
                } else {
                    this.allTeams = teams;
                }

                // Reselect the current team
                const filteredTeams = this.allTeams.filter((team) => {
                    return team.teamId === this.currentTeam.teamId;
                });
                if(filteredTeams.length){
                    this.selectedTeamIndex = this.allTeams.indexOf(filteredTeams[0]);
                } else {
                    this.selectedTeamIndex = 0;
                }
            });
        });
    }

    /**
     * This callback is fired when the selection of a team changes in the UI
     * @param {$event} event - The event data
     */
    onChangeTeam(event){
        this.currentTeam = this.allTeams[event.value];
        appSettings.setString(CURRENT_SELECTED_TEAM_KEY, this.currentTeam.teamId);
    }
}