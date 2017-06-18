import { Injectable } from "@angular/core";
let appSettings = require("application-settings");
import { Observable } from "rxjs/Observable";

import { TABT_SEASONS_IMPORTED } from "../settings/appsettingskeys";
import { SeasonsService } from "../seasons/seasons.service";
import { Season } from "../seasons/season.model";

/**
 * Use this interface for returning the result of an import process.
 */
export interface TabTImportResult {
    imported: number;
    total: number;
    completed: boolean;
}

export interface TabTAllImportsResult {
    seasons: TabTSeasonsImportResult;
}

/**
 * This interface can be used for importing data from the TabT api.
 */
export interface TabTSeasonsImportResult extends TabTImportResult {
    seasons: Season[]
}

@Injectable()
export class TabTImportService {
    private isSeasonsImported = false;

    /**
     * Creates a new instance of the service.
     */
    constructor(private _seasonsService: SeasonsService){
        this.isSeasonsImported = appSettings.getBoolean(TABT_SEASONS_IMPORTED) || false;
    }

    /**
     * Chekcs whether all data is imported.
     * @returns {boolean} Whether everything is imported.
     */
    get everythingIsImported(){
        return this.isSeasonsImported;
    }

    /**
     * Imports all the necessary data
     */
    importAll(){
        return new Observable<TabTAllImportsResult>((observer) => {
            this._seasonsService.importFromTabT().subscribe((seasonsImportResult) => {
                console.dir(seasonsImportResult);
                let allImportsResult: TabTAllImportsResult = {
                    seasons: seasonsImportResult
                }

                observer.next(allImportsResult);

                if(allImportsResult.seasons.completed){
                    appSettings.setBoolean(TABT_SEASONS_IMPORTED, true);
                    observer.complete();
                }
            });
        });
    }
}