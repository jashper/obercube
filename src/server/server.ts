import { EventEmitter } from 'events';
import { Server as WebSocketServer, IServerOptions } from 'uws';
import * as winston from 'winston';
import { LoggerInstance } from 'winston';

import { Client } from './client';

export interface ServerConfig {
    host?: string;
    port?: number;
}

let nextId = 1;

export class Server extends EventEmitter {
    private logger: LoggerInstance;

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

        // TODO: look into enabling + configuring wss://
        this.wssOptions = {
            host: config.host || 'localhost',
            port: config.port || 8080,
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

    verifyClient(info: {}, cb: (res: boolean) => void) {
        // const ip = info.req.socket.remoteAddress;
        cb(true);
    }

    initSocket(socket: WebSocket) {
        const client = this.addClient(socket);

        socket.onerror = (ev: ErrorEvent) => {
            this.logger.warn('Socket error ' + ev + ' for id ' + client.id);
        };

        socket.onclose = (ev: CloseEvent) => {
            this.removeClient(client);
        };

        socket.onmessage = (ev: MessageEvent) => {
            // this.handleMessage(ev.data, client);
        };
    }

    closeSocket(socket: WebSocket, code: number, reason: string) {
        this.logger.warn('Closing socket with code ' + code + ' and reason: ' + reason);
        socket.close(code, reason);
    }

    addClient(socket: WebSocket) {
        // create a client object for the socket
        const id = nextId++;
        const client = new Client(id, socket);

        this.clients.set(id, client);
        this.logger.info('Adding client for id ' + id);

        return client;
    }

    removeClient(client: Client) {
        this.clients.delete(client.id);
        this.logger.info('Removing client for id ' + client.id);
    }

    // handleMessage(text: string, client: Client) {
    //     let message;
    //     try {
    //         message = JSON.parse(data);
    //     } catch (e) {
    //         this._logger.warn('Error parsing JSON message data from ip ' + client.ip + ' : ' + e);
    //         this._closeSocket(client.socket, closeCode.INVALID_MESSAGE_DATA.value);
    //         return;
    //     }

    //     if (!message.hasOwnProperty('type')) {
    //         this._logger.warn('Type field missing for message from ip ' + client.ip);
    //         this._closeSocket(client.socket, closeCode.ABSENT_FIELD.value, 'type');
    //         return;
    //     }
    // }

    // _sendMessage(message, client) {
    //     // is the socket in the middle of closing (i.e. has _removeClient been called yet)
    //     if (client.socket.readyState === 2) {
    //         return;
    //     }

    //     if (!message.hasOwnProperty('type')) {
    //         this._logger.error('Type field missing for message ' + message +
    //         ' to be sent to ip ' + client.ip);
    //         return;
    //     }

    //     let data;
    //     try {
    //         data = JSON.stringify(message);
    //     } catch (e) {
    //         this._logger.error('Failed to stringify message ' + message +
    //         ' to be sent to ip ' + client.ip + ': ' + e);
    //         return;
    //     }

    //     client.socket.send(data, (error) => {
    //         if (error) {
    //         // TODO: is this._closeSocket() ever necessary, or is the socket always already closed?
    //         this._logger.warn('Failed to send message to ip ' + client.ip + ' : ' + error);
    //         return;
    //         }
    //     });
    // }
}
