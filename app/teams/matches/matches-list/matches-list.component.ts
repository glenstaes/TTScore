import { Component, Input, Output, EventEmitter } from "@angular/core";
import { TeamMatch } from "../TeamMatch.model";

@Component({
    selector: "matches-list",
    templateUrl: "teams/matches/matches-list/matches-list.component.html"
})
export class MatchesListComponent {
    @Input()
    matches: Array<TeamMatch>;

    @Output()
    matchTap: EventEmitter<TeamMatch> = new EventEmitter<TeamMatch>();

    onItemTap(event){
        this.matchTap.emit(this.matches[event.index]);
    }

    ngOnDestroy(){
        this.matchTap.complete();
    }
}