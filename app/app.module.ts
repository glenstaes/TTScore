import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { AppRoutingModule } from "./app.routing";
import { AppComponent } from "./app.component";

import { SeasonsService } from "./seasons/seasons.service";
import { ClubsService } from "./clubs/clubs.service";
import { ClubMemberService } from "./members/clubmember.service";
import { DatabaseService } from "./database/database.service";
import { TabTImportService } from "./tabt/TabTImport.service";

import { HomeComponent } from "./home/home.component";
import { SettingsComponent } from "./settings/settings.component";
import { ImportComponent } from "./import/import.component";
import { MembersComponent } from "./members/members.component";

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
        MembersComponent
    ],
    providers: [
        ClubsService,
        ClubMemberService,
        DatabaseService,
        SeasonsService,
        TabTImportService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
