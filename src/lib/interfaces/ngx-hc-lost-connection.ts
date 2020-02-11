import { Observable } from 'rxjs';

export interface INgxHcLostConnection {
    title: string;
    message: string;
    nextUpdate$: Observable<number>;
    closeable?: boolean;
}
