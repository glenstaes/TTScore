import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { SettingsComponent } from "./settings/settings.component";
import { MembersComponent } from "./members/members.component";
import { ImportComponent } from "./import/import.component";
import { RankingComponent } from "./rankings/ranking.component";
import { TeamMatchesComponent } from "./teams/matches/teammatches.component";
import { DivisionMatchesComponent } from "./teams/matches/divisionmatches.component";
import { FavoritesComponent } from "./teams/favorites/favorites.component";

const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", component: HomeComponent },
    { path: "members", component: MembersComponent },
    { path: "settings", component: SettingsComponent },
    { path: "import", component: ImportComponent },
    { path: "ranking", component: RankingComponent },
    { path: "teammatches", component: TeamMatchesComponent },
    { path: "divisionmatches", component: DivisionMatchesComponent },
    { path: "favorites", component: FavoritesComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }