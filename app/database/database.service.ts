import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
let Sqlite = require("nativescript-sqlite");

@Injectable()
export class DatabaseService {
    private database: any;

    /**
     * Creates a new instance of the service
     */
    constructor() { }

    /**
     * Checks whether we have a connected instance of the database.
     * @returns {boolean} Whether we're connected to the database.
     */
    isConnected() {
        return typeof this.database !== "undefined";
    }

    /**
     * Connects to the database.
     * @returns {Promise} A promise that is resolved when we're connected.
     */
    connect() {
        // Connect to the database
        return (new Sqlite("ttscore.db")).then((db) => {
            this.database = db;
        });
    }

    /**
     * Executes a SQL query for inserting or updating data.
     * @param {string} query - The query to execute
     * @param {Array<any>} data - The data to put in the query
     */
    execSQL(query: string, data: Array<any> = []) {
        return new Observable<any>((observer) => {
            this.connect().then(() => {
                this.database.execSQL(query, data).then((result) => {
                    observer.next(result);
                    observer.complete();
                });
            });
        });
    }

    /**
     * Executes a SQL query for reading data.
     * @param {string} query - The query to execute.
     * @param {Array<any>} data - The data to put in the query.
     */
    all(query: string, data: Array<any> = []){
        return new Observable<any>((observer) => {
            this.connect().then(() => {
                this.database.execSQL(query, data).then((result) => {
                    observer.next(result);
                    observer.complete();
                });
            });
        });
    }
}