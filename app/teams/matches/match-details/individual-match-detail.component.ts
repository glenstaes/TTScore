import { Component, Input } from "@angular/core";
import { MatchPlayer, IndividualMatchResult } from "./MatchDetails.model";

@Component({
    selector: "individual-match-result",
    templateUrl: "teams/matches/match-details/individual-match-detail.component.html"
})

/**
 * This component is used for displaying the result of an individual match.
 * @property {MatchPlayer} homePlayer - The home player
 * @property {MatchPlayer} awayPlayer - The away player
 * @property {IndividualMatchResult} result - The result
 * @property {boolean} collapseScores - Whether the set scores should be collapsed
 */

export class IndividualMatchDetailComponent {
    @Input()
    homePlayer: MatchPlayer;

    @Input()
    awayPlayer: MatchPlayer;

    @Input()
    result: IndividualMatchResult;

    @Input()
    collapseScores: boolean;

    /**
     * Interprets the scores in the match and returns them in a 11-5, 6-11, 10-12, ... form.
     */
    getMatchScores(){
        return this.result.scores.map((score) => {
            let oppositeScore = 11;
            const absoluteScore = Math.abs(score);
            
            // When the absolute score is greater than 10, the score of the opponent should be 2 points higher, otherwise it's 11.
            if(absoluteScore >= 10){
                oppositeScore = absoluteScore + 2;
            }

            // If score is negative, the away player won.
            // If score is positive, the home player won.
            if(score > 0){
                return `${oppositeScore}-${absoluteScore}`;
            } else {
                return `${absoluteScore}-${oppositeScore}`;
            }
        }).join(", ");
    }
}