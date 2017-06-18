import { Component } from "@angular/core";
import { SeasonsService } from "../seasons/seasons.service";

@Component({
    templateUrl: "home/home.component.tmpl.html"
})
export class HomeComponent {
    test: string = "Evaluating...";

    /**
     * Creates a new instance of the component
     * @param {SeasonsService} _seasonsService - The service to work with seasons.
     */
    constructor(private _seasonsService: SeasonsService) {
        
    }

    ngOnInit(){
        this._seasonsService.getAllFromTabT().subscribe((seasons) => {
            this.test = `TabT returns ${seasons.length} seasons`;
        }, (error) => {
            console.log(error);
        });
    }
}