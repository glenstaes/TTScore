import { Component, OnInit } from "@angular/core";
import { SeasonsService } from "../seasons/seasons.service";
import { ClubsService } from "../clubs/clubs.service";
import { Club } from "../clubs/club.model";
import { CURRENT_SELECTED_CLUB_KEY, CURRENT_SELECTED_SEASON_KEY } from "../settings/appsettingskeys";
import { Observable } from "rxjs/Observable";
let appSettings = require("application-settings");

@Component({
    templateUrl: "home/home.component.tmpl.html"
})
export class HomeComponent implements OnInit {
    currentClub: Club;

    /**
     * Creates a new instance of the component
     * @param {SeasonsService} _seasonsService - The service to work with seasons.
     */
    constructor(
        private _seasonsService: SeasonsService, 
        private _clubsService: ClubsService
    ) {

    }

    /**
     * Tries to get the currently selected club.
     */
    ngOnInit() {
        Observable.forkJoin(
            this._clubsService.get(appSettings.getString(CURRENT_SELECTED_CLUB_KEY), appSettings.getNumber(CURRENT_SELECTED_SEASON_KEY)),
            this._seasonsService.get(appSettings.getNumber(CURRENT_SELECTED_SEASON_KEY))
        ).subscribe((responses) => {
            this.currentClub = responses[0];
        });
    }
}