import { Component, OnInit, NgZone } from "@angular/core";
import { Observable } from "rxjs/Observable";

import { SeasonsService } from "../seasons/seasons.service";
import { Season } from "../seasons/season.model";
import { ClubsService } from "../clubs/clubs.service";
import { Club } from "../clubs/club.model";
import { Team } from "../teams/team.model";
import { TeamsService } from "../teams/teams.service";
import { FavoritesService } from "../teams/favorites/favorites.service";
import { SettingsService } from "../settings/settings.service";


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
    isLoadingTeams: boolean = false;

    // List datasources
    allTeams: Array<Team> = [];
    selectedTeamIndex = 0;

    // Messages
    players = "Club:";
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
        private _favoritesService: FavoritesService,
        private _ngZone: NgZone,
        private _settingsService: SettingsService
    ) {
        
    }

    /**
     * Tries to get the currently selected club, season and team.
     */
    ngOnInit() {
        if (this._settingsService.settingsAreLoaded) {
            // First, load the items that are configured.
            this._processSettings();
        } else {
            this._settingsService.loadSettings().subscribe(() => {
                this._processSettings();
            });
        }
    }

    private _processSettings() {
        this.currentClub = this._settingsService.currentClub;
        this.currentSeason = this._settingsService.currentSeason;
        this.currentTeam = this._settingsService.currentTeam;

        // Check if the team is a favorite team
        this._checkTeamIsFavorite();

        // Load the teams for the club
        if (typeof this.currentClub !== "undefined" && this.currentClub !== null) {
            this.isLoadingTeams = true;

            this._teamsService.getAllByClub(this.currentClub, this.currentSeason).subscribe((teams) => {
                if (teams.length === 0) {
                    // Import if still not found
                    this._ngZone.runOutsideAngular(() => {
                        this._teamsService.importFromTabT(this.currentClub.uniqueIndex, this.currentSeason.id).subscribe((importedTeams) => {
                            this._ngZone.run(() => {
                                this.isLoadingTeams = false;
                                this.allTeams = importedTeams;
                                if (this.allTeams.length === 0) {
                                    this.onChangeTeam({ value: 0 });
                                } else {
                                    this._reselectCurrentTeam();
                                }
                            });
                        });
                    });
                } else {
                    this.isLoadingTeams = false;
                    this.allTeams = teams;
                    this._reselectCurrentTeam();
                }
            });
        }
    }

    private _reselectCurrentTeam() {
        // Reselect the current team
        const filteredTeams = this.currentTeam ? this.allTeams.filter((team) => {
            return team.teamId === this.currentTeam.teamId;
        }) : [];

        if (filteredTeams.length) {
            this.selectedTeamIndex = this.allTeams.indexOf(filteredTeams[0]);
        } else {
            this.selectedTeamIndex = 0;
            this.onChangeTeam({ value: 0 });
        }
    }

    /**
     * This callback is fired when the selection of a team changes in the UI
     * @param {$event} event - The event data
     */
    onChangeTeam(event) {
        this.currentTeam = this.allTeams[event.value];
        this._settingsService.currentTeam = this.currentTeam;

        this._checkTeamIsFavorite();
    }

    /**
     * Checks if the current team is a favorite team. Sets the boolean property after checking.
     */
    private _checkTeamIsFavorite() {
        this._favoritesService.exists(this.currentTeam).subscribe((exists) => {
            this.currentTeamIsFavorite = exists;
        });
    }

    /**
     * Callback for when the button to add a team as favorite is tapped. Adds the team as favorite.
     */
    onTapAddAsFavorite() {
        this._favoritesService.add(this.currentTeam, this.currentClub.uniqueIndex, this.currentSeason.id).subscribe((isAdded) => {
            this.currentTeamIsFavorite = isAdded;
        });
    }

    /**
     * Callback for when the button to remove a team as favorite is tapped. Removes the team as favorite.
     */
    onTapRemoveAsFavorite() {
        this._favoritesService.delete(this.currentTeam).subscribe((isRemoved) => {
            this.currentTeamIsFavorite = !isRemoved;
        });
    }
}