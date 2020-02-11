import { INgxHcBeat } from './ngx-hc-beat';

export interface INgxHcEndpoint {
    id: number;
    url: string;
    method: string;
    healthy: string | boolean | number;
    type: 'database' | 'api';
    data?: any;
    beat?: INgxHcBeat;
}
