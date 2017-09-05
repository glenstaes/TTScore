import { Injectable } from "@angular/core";
let appSettings = require("application-settings");
import { Observable } from "rxjs/Rx";

import { CURRENT_SELECTED_CLUB_KEY, CURRENT_SELECTED_SEASON_KEY, CURRENT_SELECTED_TEAM_KEY } from "./appsettingskeys";
import { Team } from "../teams/team.model";
import { TeamsService } from "../teams/teams.service";
import { Season } from "../seasons/season.model";
import { SeasonsService } from "../seasons/seasons.service";
import { Club } from "../clubs/club.model";
import { ClubsService } from "../clubs/clubs.service";

@Injectable()

/**
 * This service is used for managing the settings of the application.
 */

export class SettingsService {
    private _currentTeam: Team;
    private _currentSeason: Season;
    private _currentClub: Club;
    private _settingsLoaded = false;

    constructor(
        private _teamsService: TeamsService,
        private _clubsService: ClubsService,
        private _seasonsService: SeasonsService
    ){}

    /**
     * Loads the settings into the private variables of the service.
     */
    loadSettings(){
        return Observable.create((observer) => {
            Observable.forkJoin(
                this._teamsService.get(appSettings.getString(CURRENT_SELECTED_TEAM_KEY)),
                this._clubsService.get(appSettings.getString(CURRENT_SELECTED_CLUB_KEY), appSettings.getNumber(CURRENT_SELECTED_SEASON_KEY)),
                this._seasonsService.get(appSettings.getNumber(CURRENT_SELECTED_SEASON_KEY))
            ).subscribe((results) => {
                this._currentTeam = results[0];
                this._currentClub = results[1];
                this._currentSeason = results[2];
                this._settingsLoaded = true;
                observer.next();
                observer.complete();
            });
        });
    }

    /** The currently set team */
    get currentTeam(){ return this._currentTeam; }
    set currentTeam(team: Team){
        appSettings.setString(CURRENT_SELECTED_TEAM_KEY, team ? team.teamId : ""); 
        this._currentTeam = team;
    }

    /** The currently set club */
    get currentClub(){ return this._currentClub; }
    set currentClub(club: Club){ 
        appSettings.setString(CURRENT_SELECTED_CLUB_KEY, club ? club.uniqueIndex : "");
        this._currentClub = club;
    }

    /** The currently set season */
    get currentSeason(){ return this._currentSeason; }
    set currentSeason(season: Season){ 
        appSettings.setNumber(CURRENT_SELECTED_SEASON_KEY, season ? season.id : 1); 
        this._currentSeason = season;
    }

    /** The property that determines whether all settings are loaded. */
    get settingsAreLoaded(){ return this._settingsLoaded; }
}