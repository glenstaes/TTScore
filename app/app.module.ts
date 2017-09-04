import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { AppRoutingModule } from "./app.routing";
import { AppComponent } from "./app.component";

import { SeasonsService } from "./seasons/seasons.service";
import { ClubsService } from "./clubs/clubs.service";
import { ClubMemberService } from "./members/clubmember.service";
import { TeamsService } from "./teams/teams.service";
import { TeamMatchesService } from "./teams/matches/teammatches.service";
import { FavoritesService } from "./teams/favorites/favorites.service";
import { DatabaseService } from "./database/database.service";
import { TabTImportService } from "./tabt/TabTImport.service";
import { DivisionRankingService } from "./rankings/DivisionRanking.service";

import { HomeComponent } from "./home/home.component";
import { SettingsComponent } from "./settings/settings.component";
import { ImportComponent } from "./import/import.component";
import { MembersComponent } from "./members/members.component";
import { RankingComponent } from "./rankings/ranking.component";
import { TeamMatchesComponent } from "./teams/matches/teammatches.component";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptHttpModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        SettingsComponent,
        ImportComponent,
        MembersComponent,
        RankingComponent,
        TeamMatchesComponent
    ],
    providers: [
        ClubsService,
        ClubMemberService,
        TeamsService,
        TeamMatchesService,
        FavoritesService,
        DatabaseService,
        SeasonsService,
        TabTImportService,
        DivisionRankingService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
