import { INgxHcServer } from './ngx-hc-server';

export interface INgxHcConfig {
    defaultFrequency: number;
    maxFrequency: number;
    servers: INgxHcServer[];
    debug: boolean;
}
