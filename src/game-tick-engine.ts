import * as FastPriorityQueue from 'fastpriorityqueue';
import { Observable, Subject, Subscription, timer } from 'rxjs';

import { Action } from './action';

export interface GameTickEvent {
    trigger: number;
    interval: number; // 0 if one-time event; in milliseconds
    action: (tick: number) => Action<any>;
}

export class GameTickEngine {
    get tick() {
        return this.prevTick;
    }

    private prevTick: number;
    private queue = new FastPriorityQueue((a: GameTickEvent, b: GameTickEvent) => a.trigger < b.trigger);

    private timer: Subscription;

    get src(): Observable<Action<any>> {
        return this.publisher.asObservable();
    }
    private publisher = new Subject<Action<any>>();

    start(tick: number, period?: number) {
        this.prevTick = tick;

        if (period) {
            this.timer = timer(0, period).subscribe(() => this.increment());
        }
    }

    stop() {
        this.timer.unsubscribe();
        this.publisher.complete();
    }

    increment() {
        this.prevTick++;
        this.process();
    }

    sync(tick: number) {
        this.prevTick = tick;
        this.process();
    }

    queueEvent(e: GameTickEvent) {
        this.queue.add(e);
    }

    private process() {
        while (this.queue.peek() && this.queue.peek().trigger <= this.prevTick) {
            const event = this.queue.poll() as GameTickEvent;

            const action = event.action(this.prevTick);
            this.publisher.next(action);

            if (event.interval > 0) {
                event.trigger += event.interval;
                this.queueEvent(event);
            }
        }
    }
}
