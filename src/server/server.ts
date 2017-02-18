import { EventEmitter } from 'events';
import { createStore, Store } from 'redux';
import { Server as WebSocketServer, IServerOptions } from 'uws';
import * as winston from 'winston';
import { LoggerInstance } from 'winston';

import { Action, Outpost } from '../action';
import { Client } from './client';
import Constants from '../constants';
import { MatchAction } from './actions/match';
import { reducers, StoreRecords } from './state/reducers';

export interface ServerConfig {
    host?: string;
    port?: number;
}

export class Server extends EventEmitter {
    private logger: LoggerInstance;

    private store: Store<StoreRecords>;

    private wssOptions: IServerOptions;
    private wss: WebSocketServer;

    private isActive = false;
    private clients = new Map<number, Client>();

    constructor(config: ServerConfig = {}) {
        super();

        this.logger = new winston.Logger({
            transports: [new winston.transports.Console({
                colorize: true,
                silent: false
            })]
        });

        this.store = createStore<StoreRecords>(reducers);
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
            this.logger.warn('Server is already started');
            return;
        }

        this.wss = new WebSocketServer(this.wssOptions, () => {
            this.emit('open');
        });

        this.wss.on('connection', (socket) => {
            this.initSocket((socket as any) as WebSocket);
        });

        this.wss.on('error', (error) => {
            this.logger.error('WebSocketServer: ' + error);
            this.stop();
        });

        this.isActive = true;
    }

    stop() {
        if (!this.isActive) {
            this.logger.warn('Server is already stopped');
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

    private initSocket(socket: WebSocket) {
        const client = this.addClient(socket);

        socket.onerror = (ev: ErrorEvent) => {
            this.logger.warn('Socket error ' + ev + ' for id ' + client.id);
        };

        socket.onclose = (ev: CloseEvent) => {
            this.removeClient(client);
        };

        socket.onmessage = (ev: MessageEvent) => {
            this.handleMessage(ev.data, client);
        };

        this.sendMatchState(client);
    }

    private closeSocket(socket: WebSocket, code?: number, reason?: string) {
        this.logger.warn('Closing socket with code ' + code + ' and reason: ' + reason);
        socket.close(code, reason);
    }

    private addClient(socket: WebSocket) {
        // create a client object for the socket
        const id = Constants.generateId();
        const client = new Client(id, socket);

        this.clients.set(id, client);
        this.logger.info('Adding client for id ' + id);

        return client;
    }

    private removeClient(client: Client) {
        this.clients.delete(client.id);
        this.logger.info('Removing client for id ' + client.id);
    }

    private handleMessage(payload: string, client: Client) {
        this.logger.info(payload);

        let message: string;
        try {
            message = JSON.parse(payload);
        } catch (e) {
            this.logger.warn('Error parsing JSON message data from id ' + client.id + ' : ' + e);
            this.closeSocket(client.socket);
            return;
        }

        // this.clients.forEach((c: Client) => {
        //     if (c.id !== client.id) {
        //         this.sendMessage(message, c);
        //     }
        // });
    }

    private sendAction(action: Action<any>, client: Client) {
        // is the socket in the middle of closing (i.e. has removeClient been called yet)
        if (client.socket.readyState === 2) {
            return;
        }

        let payload;
        try {
            payload = JSON.stringify(action);
        } catch (e) {
            this.logger.error('Failed to stringify action ' + action + ' to be sent to id ' + client.id + ': ' + e);
            return;
        }

        client.socket.send(payload);
    }

    private initMatch() {
        const min = 0;
        const max = 8;

        const width = 5000;
        const height = 5000;

        let id = 1;
        const outposts: Outpost[] = [];
        for (let x = 100; x < width - 100; x += 120) {
            for (let y = 100; y < height - 100; y += 120) {
                if (Math.random() > 0.5) {
                    continue;
                }

                let color = 0;
                switch (Math.ceil(Math.random() * (max - min) + min)) {
                    case 1:
                        color = Constants.COLORS.LAVENDER;
                        break;
                    case 2:
                        color = Constants.COLORS.LIGHT_BLUE;
                        break;
                    case 3:
                        color = Constants.COLORS.LIME_GREEN;
                        break;
                    case 4:
                        color = Constants.COLORS.ORANGE;
                        break;
                    case 5:
                        color = Constants.COLORS.RADICAL_RED;
                        break;
                    case 6:
                        color = Constants.COLORS.SEAFOAM_GREEN;
                        break;
                    case 7:
                        color = Constants.COLORS.TAN;
                        break;
                    case 8:
                        color = Constants.COLORS.WHITE;
                        break;
                    default:
                        break;
                }

                outposts.push({ id: id++, x, y, color });
            }
        }

        this.store.dispatch(MatchAction.new({
            mapInfo: { width, height },
            outposts
        }));
    }

    private sendMatchState(client: Client) {
        const game = this.store.getState().match.games.first();
        const action = MatchAction.state(game);

        this.sendAction(action, client);
    }
}
