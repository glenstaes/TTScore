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
    homePlayer: MatchPlayer | MatchPlayer[];

    @Input()
    awayPlayer: MatchPlayer | MatchPlayer[];

    @Input()
    result: IndividualMatchResult;

    @Input()
    collapseScores: boolean;

    /**
     * Interprets the scores in the match and returns them in a 11-5, 6-11, 10-12, ... form.
     */
    getMatchScores() {
        if (!this.result.isHomeForfeited && !this.result.isHomeForfeited) {
            return this.result.scores.map((score) => {
                let oppositeScore = 11;

                // When the score is greater than 10, the score of the opponent should be 2 points higher, otherwise it's 11.
                if (score.score >= 10) {
                    oppositeScore = score.score + 2;
                }

                if (score.isHomeWin) {
                    return `${oppositeScore}-${score.score}`;
                } else {
                    return `${score.score}-${oppositeScore}`;
                }
            }).join(", ");
        } else {
            return "FF";
        }
    }

    /**
     * Gets the names of the player(s) to display.
     * @param player The player(s) to get the names for
     */
    getPlayerNames(player: MatchPlayer | MatchPlayer[]) {
        if (player instanceof Array) {
            const doublesPlayers = player as MatchPlayer[];
            return `${doublesPlayers[0].lastName} / ${doublesPlayers[1].lastName} (${doublesPlayers[0].ranking}/${doublesPlayers[1].ranking})`;
        } else {
            const singlePlayer = player as MatchPlayer;
            return `${singlePlayer.firstName} ${singlePlayer.lastName} (${singlePlayer.ranking})`;
        }
    }
}