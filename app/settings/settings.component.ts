import { Component, OnInit } from "@angular/core";
import { ListPicker } from "ui/list-picker";
let appSettings = require("application-settings");

import { Season } from "../seasons/season.model";
import { SeasonsService } from "../seasons/seasons.service";
import { CURRENT_SELECTED_SEASON_KEY, CURRENT_SELECTED_CLUB_KEY } from "./appsettingskeys";
import { Club } from "../clubs/club.model";
import { ClubsService } from "../clubs/clubs.service";

@Component({
    templateUrl: "settings/settings.component.tmpl.html"
})

/**
 * This component is used for setting the settings of the application.
 * @property {number} seasonIndex - The season index that is currently selected.
 * @property {number} clubIndex - The club index that is currently selected.
 * @property {Club[]} allClubs - All the clubs in the current season from the database.
 * @property {Season[]} allSeasons - All the seasons from the database.
 */

export class SettingsComponent implements OnInit {
    public seasonIndex: number;
    public clubIndex: number;
    public allClubs: Club[];
    public allSeasons: Season[];

    /**
     * Creates a new intance of the component
     * @param {SeasonsService} _seasonsService - A reference to the seasons service
     * @param {ClubsService} _clubsService - A reference to the clubs service
     */
    constructor(private _seasonsService: SeasonsService, private _clubsService: ClubsService) { }

    /**
     * Hook automatically called by Angular. Gets the data from the database and the app settings.
     */
    ngOnInit() {
        // Get the settings
        this.seasonIndex = appSettings.getNumber(CURRENT_SELECTED_SEASON_KEY) - 1 || 0;
        this.clubIndex = this._findClubIndexInCurrentSeason();

        this._loadSeasons();
        this._loadClubs();
    }

    /**
     * Loads the seasons from the database.
     */
    private _loadSeasons() {
        // Get the necessary data
        this._seasonsService.getAll().subscribe((seasons) => {
            this.allSeasons = seasons;
        });
    }

    /**
     * Callback for when the season picker changes.
     * @param {$event} event - The Angular event data.
     */
    onChangeSeason(event) {
        let seasonPicker = <ListPicker>event.object;
        this.seasonIndex = seasonPicker.selectedIndex;

        appSettings.setNumber(CURRENT_SELECTED_SEASON_KEY, this.seasonIndex + 1);

        this._loadClubs();
    }

    /**
     * Loads the clubs for the selected season from the database.
     */
    private _loadClubs() {
        // Load the clubs for the selected season
        this._clubsService.getAllBySeason(this.seasonIndex + 1).subscribe((clubs) => {
            this.allClubs = clubs || [];
            this.clubIndex = this._findClubIndexInCurrentSeason();
        });
    }

    /**
     * Looks for the currently selected club in the list of clubs. This function is very usefull when changing seasons!
     * @returns {number} The index of the club in the list of clubs.
     */
    private _findClubIndexInCurrentSeason(){
        let storedKey = appSettings.getString(CURRENT_SELECTED_CLUB_KEY);

        let filteredClubs = (this.allClubs || []).filter((club) => {
            return club.uniqueIndex === storedKey;
        });

        return filteredClubs.length ? this.allClubs.indexOf(filteredClubs[0]) : 0;
    }

    /**
     * Callback for when the club picker changes.
     * @param {$event} event - The Angular event data
     */
    onChangeClub(event) {
        let clubPicker = <ListPicker>event.object;
        this.clubIndex = clubPicker.selectedIndex;

        appSettings.setString(CURRENT_SELECTED_CLUB_KEY, this.allClubs[this.clubIndex].uniqueIndex);
    }

    /**
     * Imports the clubs for the currently selected season
     */
    importClubs() {
        this._clubsService.importFromTabT(this.seasonIndex + 1).subscribe((clubsImportResult) => {
            if (clubsImportResult.completed) {
                this.allClubs = clubsImportResult.clubs;
            }
        });
    }
}