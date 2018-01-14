import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { SettingsComponent } from "./settings/settings.component";
import { MembersComponent } from "./members/members.component";
import { MemberDetailsComponent } from "./members/member-details.component";
import { ImportComponent } from "./import/import.component";
import { RankingComponent } from "./rankings/ranking.component";
import { TeamMatchesComponent } from "./teams/matches/teammatches.component";
import { DivisionMatchesComponent } from "./teams/matches/divisionmatches.component";
import { MatchDetailsComponent } from "./teams/matches/match-details/match-details.component";
import { FavoritesComponent } from "./teams/favorites/favorites.component";
import { ClubMatchesComponent } from "./teams/matches/clubmatches.component";

const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", component: HomeComponent },
    { path: "members", component: MembersComponent },
    { path: "member-details/:uniqueIndex", component: MemberDetailsComponent },
    { path: "settings", component: SettingsComponent },
    { path: "import", component: ImportComponent },
    { path: "ranking", component: RankingComponent },
    { path: "teammatches", component: TeamMatchesComponent },
    { path: "divisionmatches", component: DivisionMatchesComponent },
    { path: "clubmatches", component: ClubMatchesComponent },
    { path: "match-details/:divisionId/:matchUniqueIndex", component: MatchDetailsComponent },
    { path: "favorites", component: FavoritesComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }