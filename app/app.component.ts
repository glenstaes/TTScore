import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { TabTImportService } from "./tabt/TabTImport.service";

@Component({
    selector: "ttscore",
    templateUrl: "app.component.html"
})
export class AppComponent {

    constructor(private _router: Router, private _tabtImportService: TabTImportService){
        if(!_tabtImportService.everythingIsImported){
            _router.navigate(["import"]);
        }
    }
}
