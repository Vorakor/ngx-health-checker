import { INgxHcLostConnection } from './ngx-hc-lost-connection';
import { INgxHcServer } from './ngx-hc-server';

export interface INgxHcConfig {
    defaultFrequency: number;
    maxFrequency: number;
    servers: INgxHcServer[];
    debug: boolean;
    databaseDisconnect?: INgxHcLostConnection;
    apiDisconnect?: INgxHcLostConnection;
    networkDisconnect?: INgxHcLostConnection;
}
