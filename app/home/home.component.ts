import { Component, OnInit } from "@angular/core";
import { SeasonsService } from "../seasons/seasons.service";
import { Season } from "../seasons/season.model";
import { ClubsService } from "../clubs/clubs.service";
import { Club } from "../clubs/club.model";
import { Team } from "../teams/team.model";
import { TeamsService } from "../teams/teams.service";
import { FavoritesService } from "../teams/favorites/favorites.service";
import { CURRENT_SELECTED_CLUB_KEY, CURRENT_SELECTED_SEASON_KEY, CURRENT_SELECTED_TEAM_KEY } from "../settings/appsettingskeys";
import { Observable } from "rxjs/Observable";
let appSettings = require("application-settings");

@Component({
    templateUrl: "home/home.component.tmpl.html",
    styles: [
        `
        .addToFavorites{
            margin-top: 5dp;
            background-image: url("res://star_off");
            background-position: left;
            background-repeat: no-repeat;
            background-size: contain;
        }

        .removeFromFavorites{
            margin-top: 5dp;
            background-image: url("res://star_on");
            background-position: left;
            background-repeat: no-repeat;
            background-size: contain;
        }
        `
    ]
})
export class HomeComponent implements OnInit {
    currentClub: Club;
    currentSeason: Season;
    currentTeam: Team;
    currentTeamIsFavorite: boolean = false;

    // List datasources
    allTeams: Array<Team> = [];
    selectedTeamIndex = 0;

    // Messages
    players = "Spelers:";
    selectTeam = "Kies een team:";
    teamActions = "Acties voor dit team:";
    noClubLabel = "Selecteer een favoriete club in de instellingen";
    noTeamsLabel = "Er zijn (nog) geen teams gevonden voor deze club";

    /**
     * Creates a new instance of the component
     * @param {SeasonsService} _seasonsService - The service to work with seasons.
     */
    constructor(
        private _seasonsService: SeasonsService, 
        private _clubsService: ClubsService,
        private _teamsService: TeamsService,
        private _favoritesService: FavoritesService
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

            // Check if the team is a favorite team
            this._checkTeamIsFavorite();

            // Load the teams for the club
            this._teamsService.getAllByClub(this.currentClub, this.currentSeason).subscribe((teams) => {
                if(teams.length === 0){
                    // Import if still not found
                    this._teamsService.importFromTabT(this.currentClub.uniqueIndex, this.currentSeason.id).subscribe((importedTeams) => {
                        this.allTeams = importedTeams;
                        if(this.allTeams.length === 0){
                            this.onChangeTeam({ value: 0 });
                        }
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

        this._checkTeamIsFavorite();
    }

    /**
     * Checks if the current team is a favorite team. Sets the boolean property after checking.
     */
    private _checkTeamIsFavorite(){
        this._favoritesService.exists(this.currentTeam).subscribe((exists) => {
            this.currentTeamIsFavorite = exists;
        });
    }

    /**
     * Callback for when the button to add a team as favorite is tapped. Adds the team as favorite.
     */
    onTapAddAsFavorite(){
        this._favoritesService.add(this.currentTeam, this.currentClub.uniqueIndex, this.currentSeason.id).subscribe((isAdded) => {
            this.currentTeamIsFavorite = isAdded;
        });
    }

    /**
     * Callback for when the button to remove a team as favorite is tapped. Removes the team as favorite.
     */
    onTapRemoveAsFavorite(){
        this._favoritesService.delete(this.currentTeam).subscribe((isRemoved) => {
            this.currentTeamIsFavorite = !isRemoved;
        });
    }
}