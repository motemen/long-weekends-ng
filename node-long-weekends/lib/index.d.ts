import 'isomorphic-fetch';
export interface FetchOptions {
    key: any;
    calendarId: string;
}
export interface CalendarEvent {
    start: {
        date: string;
    };
    summary: string;
}
export declare function fetchHolidayEvents(options: FetchOptions): Promise<CalendarEvent[]>;
export interface LongWeekendsResult {
    active: boolean;
    items: LongWeekend[];
    potentialItem?: LongWeekend;
}
export interface LongWeekend {
    daysAhead: number;
    holidays: Holiday[];
}
export interface Holiday {
    name: string;
    date: Date;
}
export interface Options {
    baseDate?: Date;
}
export declare function longWeekends(holidays: CalendarEvent[], options?: Options): LongWeekendsResult;
