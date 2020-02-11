import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { distinctUntilChanged, first, flatMap, map, shareReplay, switchMap } from 'rxjs/operators';

import { IModalState, INgxHcBeat, INgxHcConfig } from './interfaces';

@Injectable({
    providedIn: 'root',
})
export class NgxHealthCheckerService implements OnDestroy {
    // The lost prefix means that it will trigger the lostConnection modal
    private lostDatabase = new BehaviorSubject<boolean>(false);
    lostDatabase$ = this.lostDatabase.asObservable();

    private lostAPI = new BehaviorSubject<boolean>(false);
    lostAPI$ = this.lostAPI.asObservable();

    private lostNetwork = new BehaviorSubject<boolean>(false);
    lostNetwork$ = this.lostNetwork.asObservable();

    // The backend prefix will trigger the backend errors modal
    // private backendErrors = new BehaviorSubject<IBackendError[]>([]);
    // backendErrors$ = this.backendErrors.asObservable();

    private heartbeatFrequency = new BehaviorSubject<number>(null);
    heartbeatFrequency$ = this.heartbeatFrequency.asObservable();
    heartbeatInterval$ = this.heartbeatFrequency$.pipe(switchMap(freq => interval(freq)));

    private modalState = new BehaviorSubject<IModalState>({ status: false, disconnectType: 'api' });
    modalState$ = this.modalState.asObservable();

    private initialized = new BehaviorSubject<boolean>(null);
    initialized$ = this.initialized.asObservable();

    beats: INgxHcBeat[];
    configuration: INgxHcConfig;

    constructor(private http: HttpClient) {}

    initializeHealthChecker(config: INgxHcConfig) {
        this.configuration = config;
        this.initialized.next(true);
        this.setHeartbeatFrequency(this.configuration.defaultFrequency);
        this.configuration.servers.forEach(server => {
            server.endpoints.forEach(endpoint => {
                this.startHeartbeat(server.id, endpoint.id);
            });
        });
    }

    setHeartbeatFrequency(ms: number) {
        if (this.configuration.debug) {
            console.log('Setting heartbeat frequency to ' + ms + ' milliseconds');
        }
        this.heartbeatFrequency.next(Math.round(ms) * 1000);
    }

    heartbeat(serverId: number, endpointId: number) {
        return this.heartbeatFrequency$.pipe(
            distinctUntilChanged(),
            shareReplay({ refCount: true, bufferSize: 1 }),
            first(),
            switchMap(freq => {
                const server = this.configuration.servers.find(ser => ser.id === serverId);
                const endpoint = server.endpoints.find(end => end.id === endpointId);
                if (endpoint.method.toLowerCase() === 'get') {
                    return this.http
                        .get(
                            `${this.trimTrailingUrl(server.url)}/${this.trimLeadingUrl(
                                endpoint.url,
                            )}`,
                        )
                        .pipe(
                            first(),
                            map(beat => ({
                                heartbeat: JSON.parse(JSON.stringify(beat)),
                                frequency: freq,
                            })),
                        );
                } else if (endpoint.method.toLowerCase() === 'post') {
                    return this.http
                        .post(
                            `${this.trimTrailingUrl(server.url)}/${this.trimLeadingUrl(
                                endpoint.url,
                            )}`,
                            endpoint.data,
                        )
                        .pipe(
                            first(),
                            map(beat => ({
                                heartbeat: JSON.parse(JSON.stringify(beat)),
                                frequency: freq,
                            })),
                        );
                } else if (endpoint.method.toLowerCase() === 'put') {
                    return this.http
                        .put(
                            `${this.trimTrailingUrl(server.url)}/${this.trimLeadingUrl(
                                endpoint.url,
                            )}`,
                            endpoint.data,
                        )
                        .pipe(
                            first(),
                            map(beat => ({
                                heartbeat: JSON.parse(JSON.stringify(beat)),
                                frequency: freq,
                            })),
                        );
                }
            }),
        );
    }

    resetHeartbeat(frequency: number, serverId: number, endpointId: number) {
        this.stopHeartbeat(serverId, endpointId);
        if (frequency / 1000 === this.configuration.defaultFrequency) {
            this.setHeartbeatFrequency(3);
        } else {
            if ((frequency / 1000) * 1.5 > this.configuration.maxFrequency) {
                this.setHeartbeatFrequency(this.configuration.maxFrequency);
            } else {
                this.setHeartbeatFrequency((frequency / 1000) * 1.5);
            }
        }
        this.startHeartbeat(serverId, endpointId);
    }

    startHeartbeat(serverId: number, endpointId: number) {
        if (this.configuration.debug) {
            console.log('Starting heartbeat...');
        }
        const server = this.configuration.servers.find(ser => ser.id === serverId);
        const endpoint = server.endpoints.find(end => end.id === endpointId);
        const beat = this.beats.find(b => b.beatId === endpoint.beat.beatId);
        beat.sub = this.heartbeatFrequency$
            .pipe(
                distinctUntilChanged(),
                shareReplay({ refCount: true, bufferSize: 1 }),
                switchMap(freq => interval(freq)),
                flatMap(() => this.heartbeat(serverId, endpointId)),
            )
            .subscribe(hb => {
                if (window.onoffline) {
                    if (!this.modalState.value.status) {
                        this.modalState.next({ status: true, disconnectType: 'network' });
                        this.toggleLostNetwork(true);
                    }
                    this.resetHeartbeat(hb.frequency, serverId, endpointId);
                } else {
                    if (hb.heartbeat !== endpoint.healthy) {
                        if (!this.modalState.value.status) {
                            this.modalState.next({ status: true, disconnectType: endpoint.type });
                            endpoint.type === 'api'
                                ? this.toggleLostAPI(true)
                                : this.toggleLostDatabase(true);
                        }
                        this.resetHeartbeat(hb.frequency, serverId, endpointId);
                    } else {
                        if (this.modalState.value.status) {
                            this.modalState.next({
                                status: false,
                                disconnectType: this.modalState.value.disconnectType,
                            });
                            this.connectionRestored(serverId, endpointId);
                        }
                    }
                }
            });
    }

    connectionRestored(serverId: number, endpointId: number) {
        this.stopHeartbeat(serverId, endpointId, true);
        this.setHeartbeatFrequency(this.configuration.defaultFrequency);
        this.startHeartbeat(serverId, endpointId);
    }

    toggleLostDatabase(toggle: boolean) {
        this.lostDatabase.next(toggle);
        if (toggle) {
            this.lostAPI.next(!toggle);
            this.lostNetwork.next(!toggle);
        }
    }

    toggleLostAPI(toggle: boolean) {
        this.lostAPI.next(toggle);
        if (toggle) {
            this.lostDatabase.next(!toggle);
            this.lostNetwork.next(!toggle);
        }
    }

    toggleLostNetwork(toggle: boolean) {
        this.lostNetwork.next(toggle);
        if (toggle) {
            this.lostDatabase.next(!toggle);
            this.lostAPI.next(!toggle);
        }
    }

    trimTrailingUrl(url: string) {
        if (url.endsWith('/')) {
            url = url.substring(0, -1);
        }
        return url;
    }

    trimLeadingUrl(url: string) {
        if (url.startsWith('/')) {
            url = url.substring(1);
        }
        return url;
    }

    validateHttpResults(results) {
        let valid = false;
        if (typeof results === 'boolean') {
            valid = true;
        } else if (typeof results === 'string') {
            valid = true;
        } else if (typeof results === 'number') {
            valid = true;
        }
        return { valid, type: typeof results };
    }

    stopHeartbeat(serverId: number, endpointId: number, decommission = false) {
        if (this.configuration.debug) {
            console.log('Stopping heartbeat...');
        }
        if (decommission) {
            this.toggleLostDatabase(false);
            this.toggleLostAPI(false);
            this.toggleLostNetwork(false);
        }
        const server = this.configuration.servers.find(ser => ser.id === serverId);
        const endpoint = server.endpoints.find(end => end.id === endpointId);
        const beat = this.beats.find(b => b.beatId === endpoint.beat.beatId);
        if (beat) {
            beat.sub.unsubscribe();
        }
    }

    ngOnDestroy() {
        this.beats.forEach(beat => beat.sub.unsubscribe());
    }
}
