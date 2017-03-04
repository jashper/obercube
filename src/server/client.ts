import * as logger from 'winston';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscriber } from 'rxjs/Subscriber';

import { Action } from '../action';

export class Client {
    get source(): Observable<Action<any>> {
        return this.publisher.asObservable();
    }

    // !IMPORTANT! - any subscriptions made with this Subscriber must be disposed
    // when the Client's socket closes (i.e. when the player logs out) -- otherwise
    // memory leaks will occur
    get sink(): Subscriber<Action<any>> {
        return this.subscriber;
    }

    private publisher = new Subject<Action<any>>();
    private subscriber = new Subscriber<Action<any>>({
        next: this.sendAction.bind(this)
    });

    constructor(readonly id: number, readonly socket: WebSocket) {
        socket.onmessage = (ev: MessageEvent) => {
            this.handleMessage(ev.data);
        };

        socket.onerror = (ev: ErrorEvent) => {
            logger.warn('Socket error ' + ev + ' for id ' + this.id);
        };

        // TODO: ensure that onclose is additionally triggered after onerror;
        // otherwise onerror needs to complete the publisher as well
        socket.onclose = (ev: CloseEvent) => {
            this.publisher.complete();
        };
    }

    disconnect(code?: number, reason?: string) {
        logger.warn('Closing socket with code ' + code + ' and reason: ' + reason);
        this.socket.close(code, reason);
    }

    private handleMessage(message: string) {
        let action: Action<any>;
        try {
            action = JSON.parse(message);
        } catch (e) {
            logger.warn('Error parsing JSON message data from id ' + this.id + ' : ' + e);
            this.disconnect();
            return;
        }

        // TODO: assert the existence of type + payload properties -> otherwise throw

        this.publisher.next(action);
    }

    private sendAction(action: Action<any>) {
        // is the socket in the middle of closing or already closed
        if (this.socket.readyState >= 2) {
            return;
        }

        let payload;
        try {
            payload = JSON.stringify(action);
        } catch (e) {
            logger.error('Failed to stringify action ' + action + ' to be sent to id ' + this.id + ': ' + e);
            return;
        }

        this.socket.send(payload);
    }
}
