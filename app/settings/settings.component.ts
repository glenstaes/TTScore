import { Component, OnInit } from "@angular/core";
import { ListPicker } from "ui/list-picker";
let appSettings = require("application-settings");

import { Season } from "../seasons/season.model";
import { SeasonsService } from "../seasons/seasons.service";
import { CURRENT_SELECTED_SEASON_KEY } from "./appsettingskeys";

@Component({
    templateUrl: "settings/settings.component.tmpl.html"
})

/**
 * This component is used for setting the settings of the application.
 * @property {number} season - The season id that is currently selected.
 * @property {Season[]} allSeasons - All the seasons from the database.
 */

export class SettingsComponent implements OnInit{
    public season: number;
    public allSeasons: Season[];

    /**
     * Creates a new intance of the component
     * @param {SeasonsService} _seasonsService - A reference to the seasons service
     */
    constructor(private _seasonsService: SeasonsService){}

    /**
     * Hook automatically called by Angular. Gets the data from the database and the app settings.
     */
    ngOnInit(){
        // Get the settings
        this.season = appSettings.getNumber(CURRENT_SELECTED_SEASON_KEY) || 0;

        this._loadSeasons();
    }

    /**
     * Loads the seasons from the database.
     */
    private _loadSeasons(){
        // Get the necessary data
        this._seasonsService.getAll().subscribe((seasons) => {
           this.allSeasons = seasons
        });
    }

    /**
     * Callback for when the season picker changes.
     * @param {$event} event - The Angular event data.
     */
    onChangeSeason(event){
        let seasonPicker = <ListPicker>event.object;
        this.season = seasonPicker.selectedIndex;
        appSettings.setNumber(CURRENT_SELECTED_SEASON_KEY, this.season);
    }
}