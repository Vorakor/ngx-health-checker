import { INgxHcEndpoint } from './ngx-hc-endpoint';

export interface INgxHcServer {
    id: number;
    url: string;
    endpoints: INgxHcEndpoint[];
}
