import { Component, AfterViewInit } from "@angular/core";

import { TabTImportService } from "../tabt/TabTImport.service";

@Component({
    templateUrl: "import/import.component.tmpl.html"
})
export class ImportComponent implements AfterViewInit {
    message: string;

    /**
     * Creates a new instance of the component.
     * @param _tabtImportService - A reference to the TabT import service.
     */
    constructor(private _tabtImportService: TabTImportService){
        this.message = "Seizoenen importeren... ";
    }

    ngAfterViewInit(){
        this._tabtImportService.importAll().subscribe((importAllResult) => {
            this.message = `Seizoenen importeren ... (${importAllResult.seasons.imported} van ${importAllResult.seasons.total})`;
        });
    }
}