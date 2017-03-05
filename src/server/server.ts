import { EventEmitter } from 'events';
import { applyMiddleware, createStore, Store } from 'redux';
import { Server as WebSocketServer, IServerOptions } from 'uws';
import * as logger from 'winston';

import { Action, Outpost } from '../action';
import { Client } from './client';
import { MatchAction } from './actions/match';
import { UserAction } from './actions/user';
import { matchController } from './middleware/match-controller';
import { reducers, StoreRecords } from './state/reducers';
import IdGenerator from '../id-generator';

export interface ServerConfig {
    host?: string;
    port?: number;
}

export interface ServerStore extends Store<StoreRecords> {}

let clientId = 0;
export const clients = new Map<number, Client>();

export class Server extends EventEmitter {
    private store: ServerStore;

    private wssOptions: IServerOptions;
    private wss: WebSocketServer;

    private isActive = false;

    constructor(config: ServerConfig = {}) {
        super();

        logger.configure({
            transports: [new logger.transports.Console({
                colorize: true,
                silent: false
            })]
        });

        const middleware = applyMiddleware(matchController);

        this.store = createStore<StoreRecords>(reducers, middleware) as ServerStore;
        this.initMatch();

        // TODO: look into enabling + configuring wss://
        this.wssOptions = {
            host: config.host || 'localhost',
            port: config.port || 8081,
            verifyClient: (info, cb) => this.verifyClient(info, cb)
        };
    }

    start() {
        if (this.isActive) {
            logger.warn('Server is already started');
            return;
        }

        this.wss = new WebSocketServer(this.wssOptions, () => {
            this.emit('open');
        });

        this.wss.on('connection', (socket) => {
            this.initClient((socket as any) as WebSocket);
        });

        this.wss.on('error', (error) => {
            logger.error('WebSocketServer: ' + error);
            this.stop();
        });

        this.isActive = true;
    }

    stop() {
        if (!this.isActive) {
            logger.warn('Server is already stopped');
            return;
        }

        this.isActive = false;

        this.wss.close();
        delete this.wss;

        this.emit('close');
    }

    private verifyClient(info: {}, cb: (res: boolean) => void) {
        // const ip = info.req.socket.remoteAddress;
        cb(true);
    }

    private initClient(socket: WebSocket) {
        const client = this.addClient(socket);

        socket.onclose = (ev: CloseEvent) => {
            this.removeClient(client);
        };
    }

    private addClient(socket: WebSocket) {
        // create a Client object for the socket
        const id = ++clientId;
        const client = new Client(id, socket);

        clients.set(id, client);
        logger.info('Adding client for id ' + id);

        client.source.subscribe({
            next: (a: Action<any>) => {
                a.userId = id;
                this.store.dispatch(a);
            }
        });

        // login
        this.store.dispatch(UserAction.login(id));

        // join match
        this.store.dispatch(UserAction.joinMatch({
            userId: id,
            matchId: 1
        }));

        return client;
    }

    private removeClient(client: Client) {
        clients.delete(client.id);
        logger.info('Removing client for id ' + client.id);

        // logout
        const user = this.store.getState().user.active.get(client.id);
        this.store.dispatch(UserAction.logout(user));
    }

    private initMatch() {
        const min = 0;
        const max = 8;

        IdGenerator.Init(0, max);

        const width = 5000;
        const height = 5000;

        const outposts: Outpost[] = [];
        for (let x = 100; x < width - 100; x += 120) {
            for (let y = 100; y < height - 100; y += 120) {
                if (Math.random() > 0.5) {
                    continue;
                }

                const playerId = Math.ceil(Math.random() * (max - min) + min);
                outposts.push({ id: IdGenerator.Next(), x, y, playerId });
            }
        }

        this.store.dispatch(MatchAction.newMatch({
            id: 1,
            mapInfo: { width, height },
            outposts
        }));
    }
}
