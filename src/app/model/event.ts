export interface Event {
    id: number;
    name: string;
    country: string;
    stage: string;
    watchLinks: WatchLink[];
    dateTimeCet: string;        // "2023-10-27T21:00:00"
    endDateTimeCet: string;     // "2023-10-27T23:00:00"
    past: boolean;
    live: boolean;
}

export type BackendEvent = Omit<Event, 'past' | 'live'>;

export interface WatchLink {
    link: string;
    channel: string;
    comment?: string;
    live: 0 | 1;
    replayable: 0 | 1;
    castable: 0 | 1;
    geoblocked: 0 | 1;
    accountRequired: 0 | 1;
}