import { Injectable } from "@angular/core";
let Sqlite = require("nativescript-sqlite");

@Injectable()
export class DatabaseService {
    private database: any;

    /**
     * Creates a new instance of the service
     */
    constructor(){}

    /**
     * Checks whether we have a connected instance of the database.
     * @returns {boolean} Whether we're connected to the database.
     */
    isConnected(){
        return typeof this.database !== "undefined";
    }

    /**
     * Connects to the database.
     * @returns {Promise} A promise that is resolved when we're connected.
     */
    connect(){
        // Connect to the database
        return (new Sqlite("ttscore.db")).then((db) => {
            this.database = db;
        });
    }
}