import { Injectable } from '@angular/core';
import { Activity, EventLog, Trace } from '../classes/event-log';

@Injectable({
    providedIn: 'root',
})
export class EventLogParserService {
    constructor() {}

    public parse(eventLog: string): EventLog {
        if (eventLog.length === 0) {
            return { traces: [] };
        }
        return {
            traces: eventLog
                .split('+')
                .map((trace) => this.parseTrace(trace)),
        };
    }

    private parseTrace(trace: string): Trace {
        return {
            activities: trace
                .trim()
                .split(' ')
                .map((activity) => this.parseActivity(activity)),
        };
    }

    private parseActivity(activity: string): Activity {
        return { name: activity };
    }
}
