import { Component, OnInit } from "@angular/core";
import { FavoritesService } from "./favorites.service";
import { Team } from "../team.model";

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

    constructor(
        private _favoritesService: FavoritesService
    ){}

    ngOnInit(){
        this._favoritesService.getAll().subscribe((teams) => {
            this.favorites = teams;
        });
    }
}