import { Observer } from "rxjs/Rx";

/**
 * Sends data for the last time through the observer and completes the observer afterwards.
 * @param observer The observer to send data for and complete
 * @param observerNextData The data to send through the observer
 */
export function nextAndComplete(observer: Observer<any>, observerNextData: any){
    return (subscribeReturnData: any = null) => {
        observer.next(observerNextData);
        observer.complete();
    }
}