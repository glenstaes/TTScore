import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
let appSettings = require("application-settings");

import { FavoritesService } from "./favorites.service";
import { Team } from "../team.model";
import { SettingsService } from "../../settings/settings.service";

@Component({
    templateUrl: "teams/favorites/favorites.component.html"
})

/**
 * This component displays a list of favorites and allows to navigate to them.
 */

export class FavoritesComponent implements OnInit {
    favorites: Array<Team> = [];

    // Messages
    noFavorites = "Je hebt geen favorieten.";
    deleteAll = "Alle favorieten verwijderen";

    constructor(
        private _favoritesService: FavoritesService,
        private _router: Router,
        private _settingsService: SettingsService
    ){}

    ngOnInit(){
        this._favoritesService.getAll().subscribe((teams) => {
            this.favorites = teams;
        });
    }

    onTapDeleteAll(){
        this._favoritesService.deleteAll().subscribe(() => {
            this.favorites = [];
        });
    }

    onTapFavoriteItem(eventData){
        let favorite = this.favorites[eventData.index];
        this._settingsService.currentClub = favorite.parentClub;
        this._settingsService.currentSeason = favorite.parentClub.parentSeason;
        this._settingsService.currentTeam = favorite;

        this._router.navigate(["home"]);
    }
}