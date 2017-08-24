import { Injectable } from "@angular/core";
let appSettings = require("application-settings");
import { Observable } from "rxjs/Observable";

import { TABT_SEASONS_IMPORTED, TABT_CLUBS_IMPORTED } from "../settings/appsettingskeys";
import { SeasonsService } from "../seasons/seasons.service";
import { Season } from "../seasons/season.model";
import { ClubsService } from "../clubs/clubs.service";
import { Club } from "../clubs/club.model";

/**
 * Use this interface for returning the result of an import process.
 */
export interface TabTImportResult {
    imported: number;
    total: number;
    completed: boolean;
}

export interface TabTAllImportsResult {
    seasons?: TabTSeasonsImportResult;
    clubs?: TabTClubsImportResult;
}

/**
 * This interface can be used for importing data from the TabT api.
 */
export interface TabTSeasonsImportResult extends TabTImportResult {
    seasons?: Season[]
}

/**
 * This interface can be used for importing data from the TabT api.
 */
export interface TabTClubsImportResult extends TabTImportResult {
    clubs?: Club[]
}

@Injectable()
export class TabTImportService {
    private isSeasonsImported = false;
    private isClubsImported = false;

    /**
     * Creates a new instance of the service.
     */
    constructor(private _seasonsService: SeasonsService, private _clubsService: ClubsService) {
        this.isSeasonsImported = appSettings.getBoolean(TABT_SEASONS_IMPORTED) || false;
        this.isClubsImported = appSettings.getBoolean(TABT_CLUBS_IMPORTED) || false;
    }

    /**
     * Chekcs whether all data is imported.
     * @returns {boolean} Whether everything is imported.
     */
    get everythingIsImported() {
        return this.isSeasonsImported && this.isClubsImported && false;
    }

    /**
     * Imports all the necessary data
     */
    importAll() {
        return new Observable<TabTAllImportsResult>((observer) => {
            let allImportsResult: TabTAllImportsResult = {
                seasons: { seasons: [], completed: false, imported: 0, total: -1 },
                clubs: { clubs: [], completed: false, imported: 0, total: -1 }
            }

            // Start the import process
            this._seasonsService.importFromTabT().subscribe((seasonsImportResult) => {
                allImportsResult.seasons = seasonsImportResult;

                // When all seasons are imported, load the clubs for the current season
                if (allImportsResult.seasons.completed) {
                    appSettings.setBoolean(TABT_SEASONS_IMPORTED, true);

                    // When all seasons are loaded, load the clubs for the current season
                    const currentSeasons = allImportsResult.seasons.seasons.filter((season) => {
                        return season.isCurrent;
                    });

                    // Trigger the importation of the clubs
                    this._clubsService.importFromTabT(currentSeasons[0].id).subscribe((clubsImportResult) => {
                        allImportsResult.clubs = clubsImportResult;

                        observer.next(allImportsResult);

                        if (allImportsResult.clubs.completed) {
                            appSettings.setBoolean(TABT_CLUBS_IMPORTED, true);
                            observer.complete();
                        }
                    });
                }

                observer.next(allImportsResult);
            });
        });
    }
}