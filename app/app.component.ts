import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { TabTImportService } from "./tabt/TabTImport.service";
import { SettingsService } from "./settings/settings.service";

@Component({
    selector: "ttscore",
    templateUrl: "app.component.html"
})
export class AppComponent {

    constructor(
        private _router: Router,
        private _tabtImportService: TabTImportService,
        private _settingsService: SettingsService
    ) {
        this._settingsService.loadSettings().subscribe(() => {
            if (!this._tabtImportService.everythingIsImported) {
                this._router.navigate(["import"]);
            }
        });
    }
}
