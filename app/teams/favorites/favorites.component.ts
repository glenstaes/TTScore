import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
let appSettings = require("application-settings");

import { FavoritesService } from "./favorites.service";
import { Team } from "../team.model";
import { CURRENT_SELECTED_SEASON_KEY, CURRENT_SELECTED_CLUB_KEY, CURRENT_SELECTED_TEAM_KEY } from "../../settings/appsettingskeys";

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
        private _router: Router
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
        appSettings.setString(CURRENT_SELECTED_CLUB_KEY, favorite.parentClub.uniqueIndex);
        appSettings.setNumber(CURRENT_SELECTED_SEASON_KEY, favorite.parentClub.seasonId);
        appSettings.setString(CURRENT_SELECTED_TEAM_KEY, favorite.teamId);

        this._router.navigate(["home"]);
    }
}