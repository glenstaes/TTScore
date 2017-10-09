import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
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
import { SettingsService } from "./settings/settings.service";

import { HomeComponent } from "./home/home.component";
import { SettingsComponent } from "./settings/settings.component";
import { ImportComponent } from "./import/import.component";
import { MembersComponent } from "./members/members.component";
import { MemberDetailsComponent } from "./members/member-details.component";
import { RankingComponent } from "./rankings/ranking.component";
import { TeamMatchesComponent } from "./teams/matches/teammatches.component";
import { DivisionMatchesComponent } from "./teams/matches/divisionmatches.component";
import { FavoritesComponent } from "./teams/favorites/favorites.component";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        AppRoutingModule,
        NativeScriptHttpModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        SettingsComponent,
        ImportComponent,
        MembersComponent,
        MemberDetailsComponent,
        RankingComponent,
        TeamMatchesComponent,
        DivisionMatchesComponent,
        FavoritesComponent
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
        DivisionRankingService,
        SettingsService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
