import { Component, ViewChild, OnInit } from "@angular/core";
import { ListPicker } from "ui/list-picker";
import { TextField } from "ui/text-field";

import { Season } from "../seasons/season.model";
import { SeasonsService } from "../seasons/seasons.service";
import { SettingsService } from "./settings.service";
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
    public filteredClubs: Club[];
    public allSeasons: Season[];
    public searchClubText: string = "";
    public isLoadingClubs: boolean = false;
    public isLoadingSeasons: boolean = false;

    /**
     * Creates a new intance of the component
     * @param {SeasonsService} _seasonsService - A reference to the seasons service
     * @param {ClubsService} _clubsService - A reference to the clubs service
     */
    constructor(
        private _seasonsService: SeasonsService,
        private _clubsService: ClubsService,
        private _settingsService: SettingsService
    ) { }

    /**
     * Hook automatically called by Angular. Gets the data from the database and the app settings.
     */
    ngOnInit() {
        // Get the settings
        this.seasonIndex = this._settingsService.currentSeason ? this._settingsService.currentSeason.id - 1 : 0;
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

        this._settingsService.currentSeason = this.allSeasons[this.seasonIndex];

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
    private _findClubIndexInCurrentSeason() {
        let filteredClubs = this._settingsService.currentClub ? (this.allClubs || []).filter((club) => {
            return club.uniqueIndex === this._settingsService.currentClub.uniqueIndex;
        }) : [];

        return filteredClubs.length ? this.allClubs.indexOf(filteredClubs[0]) : 0;
    }

    /**
     * Callback for when the club picker changes.
     * @param {$event} event - The Angular event data
     */
    onChangeClub(event) {
        let clubPicker = <ListPicker>event.object;
        this.clubIndex = clubPicker.selectedIndex;

        this._settingsService.currentClub = this.allClubs[this.clubIndex];
    }

    /**
     * Imports the clubs for the currently selected season
     */
    importClubs() {
        this.isLoadingClubs = true;
        this._clubsService.importFromTabT(this.seasonIndex + 1).subscribe((clubsImportResult) => {
            if (clubsImportResult.completed) {
                this.allClubs = clubsImportResult.clubs;
                this.isLoadingClubs = false;
            }
        });
    }

    /**
     * Fired when the user taps a club in the list. Sets this club as the configured club and resets the search.
     * @param {any} eventData - The event data
     * @param {TextField} searchClubField - A reference to the text field where the search value was typed
     */
    onTapClub(eventData, searchClubField) {
        let club = this.filteredClubs[eventData.index];
        this.searchClubText = "";
        searchClubField.dismissSoftInput();

        this._settingsService.currentClub = club;
        this.clubIndex = this._findClubIndexInCurrentSeason();
    }

    /**
     * Fired when a user types in the search club textbox.
     * @param {any} eventData - The event data
     */
    onTextChangeSearchClub(eventData) {
        const textField = <TextField>eventData.object;

        this.filteredClubs = this.allClubs.filter((club) => {
            return club.toString().toLowerCase().indexOf(textField.text.toLowerCase()) > -1;
        });
    }

    /**
     * Fired when the refresh icon is tapped. Resets the seasons array and loads the data from the TabT api.
     */
    refreshSeasons() {
        this.allSeasons = [];

        this.isLoadingSeasons = true;
        this._loadFromTabT().subscribe(() => {
            this.isLoadingSeasons = false;
        });
    }

    /**
     * @private
     * Loads the data from the TabT api and displays the data.
     */
    private _loadFromTabT() {
        const observable = this._seasonsService.importFromTabT();

        observable.subscribe((importedSeasons) => {
            if (importedSeasons.completed) {
                this.allSeasons = importedSeasons.seasons;
            }
        });

        return observable;
    }
}