import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";

import { SettingsService } from "../../../settings/settings.service";
import { TeamMatch } from "../TeamMatch.model";
import { TeamMatchesService } from "../teammatches.service";
import { IndividualMatchResult, MatchPlayer } from "./MatchDetails.model";

@Component({
    templateUrl: "teams/matches/match-details/match-details.component.html"
})

/**
 * This component is used for displaying the details of a match.
 * @property {TeamMatch} match - The match
 * @property {Array<number>} matchStandingsHome - The scores of the home team during the match
 * @property {Array<number>} matchStandingsAway - The scores of the away team during the match
 * @property {boolean} isLoadingMatch - Indicator whether a match is loading
 * @property {IndividualMatchResult} currentIndividualMatchResult - The individual result that is currently selected.
 */

export class MatchDetailsComponent implements OnInit {
    _matchUniqueIndex: number;
    _divisionId: number;

    customMessage: string = "";

    match: TeamMatch;
    matchStandingsHome: Array<number>;
    matchStandingsAway: Array<number>;
    isLoadingMatch = false;
    currentIndividualResult: IndividualMatchResult;

    /**
     * Creates a new instance of the component
     * @param _teamMatchesService The service for the matches
     * @param _routerExtensions The service from NativeScript
     */
    constructor(
        private _teamMatchesService: TeamMatchesService,
        private _activatedRoute: ActivatedRoute,
        private _routerExtensions: RouterExtensions,
        private _settingsService: SettingsService
    ){
        
    }

    /**
     * Loads the match from the api.
     */
    ngOnInit(){
        this.isLoadingMatch = true;

        this._activatedRoute.params.subscribe((params) => {
            if(params["matchUniqueIndex"] != "null"){
                this._matchUniqueIndex = +params["matchUniqueIndex"];
                this._divisionId = +params["divisionId"];
    
                this._loadFromTabT().subscribe(() => {
                    this.isLoadingMatch = false;
                });
            } else {
                this.isLoadingMatch = false;
                this.customMessage = "Fout. Vernieuw de lijst met wedstrijden in het vorige scherm.";
            }
        });
    }

    /**
     * Gets the player(s) from the list of players for the provided player match index.
     * @param players The list of players
     * @param index The index of the player(s) to fetch
     */
    public getPlayer(players: MatchPlayer[], index: number | Array<number>): MatchPlayer | MatchPlayer[]{
        if(!isNaN(index as any)){
            return players[index as number - 1];
        } else {
            return (index as Array<number>).map((number) => {
                return players[number - 1];
            });
        }
    }

    /**
     * Loads the match from TabT
     */
    private _loadFromTabT(){
        return this._teamMatchesService.getMatchDetails(this._matchUniqueIndex, this._divisionId, this._settingsService.currentSeason.id).map((match) => {
            this.match = match;
            this._processMatchTotals();
        });
    }

    /**
     * Returns to the previous page.
     */
    onTapBackIcon(){
        this._routerExtensions.back();
    }

    /**
     * Gets the match score at a given point during the match.
     * @param individualMatch The individual match to return the total match score for
     */
    getMatchTotal(individualMatch: IndividualMatchResult){
        return `${this.matchStandingsHome[individualMatch.position - 1]} - ${this.matchStandingsAway[individualMatch.position - 1]}`;
    }

    /**
     * Processes the match totals that should be displayed
     */
    private _processMatchTotals(){
        this.matchStandingsAway = [];
        this.matchStandingsHome = [];
        
        this.match.details.individualMatchResults.forEach((result, index) => {
            // Start with home victory
            let homeValue = 1;
            let awayValue = 0;

            // Switch values if away wins
            if(result.homeSetCount < result.awaySetCount || result.isHomeForfeited){
                homeValue = 0;
                awayValue = 1;
            }

            this.matchStandingsHome[index] = (index === 0 ? 0 : this.matchStandingsHome[index - 1]) + homeValue;
            this.matchStandingsAway[index] = (index === 0 ? 0 : this.matchStandingsAway[index - 1]) + awayValue;
        });
    }

    /**
     * Callback for when an individual match is tapped in the list.
     * @param event Event data
     */
    onTapIndividualMatch(event){
        this.currentIndividualResult = this.match.details.individualMatchResults[event.index];
    }

    /**
     * Callback for when the refresh icon is tapped.
     */
    onTapRefreshIcon(){
        this.isLoadingMatch = true;
        this.match = undefined;
        
        this._loadFromTabT().subscribe(() => {
            this.isLoadingMatch = false;
        });
    }
}