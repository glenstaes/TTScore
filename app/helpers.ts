import { Observer } from "rxjs/Rx";

/**
 * Sends data for the last time through the observer and completes the observer afterwards.
 * @param observer The observer to send data for and complete
 * @param observerNextData The data to send through the observer
 */
export function nextAndComplete(observer: Observer<any>, observerNextData: any) {
    return (subscribeReturnData: any = null) => {
        observer.next(observerNextData);
        observer.complete();
    }
}

/**
 * Gets the monday date of the current week.
 * @param d The current day
 */
export function getMonday(d: Date) {
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

/**
 * Gets the sunday date of the current week.
 * @param d The current day
 */
export function getSunday(d: Date) {
    var day = d.getDay(),
        diff = d.getDate() - day + 7;
    return new Date(d.setDate(diff));
}