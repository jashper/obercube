import * as FastPriorityQueue from 'fastpriorityqueue';
import 'rxjs/add/observable/timer';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { Action } from './action';

export interface GameTickEvent {
    trigger: number;
    interval: number; // 0 if one-time event; in milliseconds
    action: (tick: number) => Action<any>;
}

export class GameTickEngine {
    getTick() {
        return this.tick;
    }

    private tick: number;
    private queue = new FastPriorityQueue((a: GameTickEvent, b: GameTickEvent) => a.trigger < b.trigger);

    private timer: Subscription;

    get src(): Observable<Action<any>> {
        return this.publisher.asObservable();
    }
    private publisher = new Subject<Action<any>>();

    start(period: number, tick: number = 0) {
        this.tick = tick;

        this.timer = Observable.timer(0, period).subscribe(() => {
            this.tick++;
            this.process();
        });
    }

    stop() {
        this.timer.unsubscribe();
        this.publisher.complete();
    }

    sync(tick: number) {
        this.tick = tick;
        this.process();
    }

    queueEvent(e: GameTickEvent) {
        this.queue.add(e);
    }

    private process() {
        while (this.queue.peek() && this.queue.peek().trigger <= this.tick) {
            const event = this.queue.poll() as GameTickEvent;

            const action = event.action(this.tick);
            this.publisher.next(action);

            if (event.interval > 0) {
                event.trigger += event.interval;
                this.queueEvent(event);
            }
        }
    }
}
