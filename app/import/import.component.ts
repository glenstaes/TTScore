import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Observer } from "rxjs/Rx";

import { TabTImportService } from "../tabt/TabTImport.service";
import { CURRENT_SELECTED_SEASON_KEY } from "../settings/appsettingskeys";
import { SettingsService } from "../settings/settings.service";
let appSettings = require("application-settings");

@Component({
    templateUrl: "import/import.component.tmpl.html"
})

/**
 * This component is used for importing data from the TabT api when the application runs for the first time.
 * @private {Observable<any>} importListViewItems - An observable of items to display in the list view.
 * @property {boolean} importReady - Indicates whether the importation process is finished.
 */

export class ImportComponent {
    private importListViewItems: Observable<any>;
    importReady = false;

    /**
     * Creates a new instance of the component.
     * @param _tabtImportService - A reference to the TabT import service.
     */
    constructor(
        private _tabtImportService: TabTImportService, 
        private _settingsService: SettingsService, 
        private _router: Router
    ) {
    }

    /**
     * This hook is called by Angular when the component is being initialised. Starts the importation process.
     */
    ngOnInit() {
        let observer: Observer<any>;

        // Make a new observable so the async pipe can be used in the template
        this.importListViewItems = new Observable((o) => {
            observer = o;
        });

        // Start the importation process
        this._tabtImportService.importAll().subscribe((importAllResult) => {
            // Send the next results to the observable
            observer.next([{
                label: "Seizoenen",
                importResult: importAllResult.seasons
            }, {
                label: "Clubs",
                importResult: importAllResult.clubs
            }]);

            // When all data is loaded, finish the observable
            if(importAllResult.clubs.completed && importAllResult.seasons.completed){
                this.importReady = true;
                
                // Set the current season as the default season in the application
                const filteredCurrentSeason = importAllResult.seasons.seasons.filter((season) => {
                    return season.isCurrent;
                });
                if(filteredCurrentSeason.length){
                    this._settingsService.currentSeason = filteredCurrentSeason[0];
                }

                observer.complete();

                // Navigate to the home page after import
                this._router.navigate(["home"]);
            }
        });
    }
}