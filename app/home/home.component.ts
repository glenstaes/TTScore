import { Component } from "@angular/core";
import { SeasonsService } from "../seasons/seasons.service";

@Component({
    templateUrl: "home/home.component.tmpl.html"
})
export class HomeComponent {
    /**
     * Creates a new instance of the component
     * @param {SeasonsService} _seasonsService - The service to work with seasons.
     */
    constructor(private _seasonsService: SeasonsService) {
        
    }
}