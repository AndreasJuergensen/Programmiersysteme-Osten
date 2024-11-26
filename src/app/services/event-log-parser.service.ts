import { Injectable } from '@angular/core';
import { EventLog, Trace } from '../classes/event-log';
import { Activity } from '../classes/dfg/activities';

@Injectable({
    providedIn: 'root',
})
export class EventLogParserService {
    constructor() {}

    public parse(eventLog: string): EventLog {
        if (eventLog.length === 0) {
            return new EventLog();
        }

        const traces = eventLog
            .split('+')
            .map((trace) => this.parseTrace(trace));

        return new EventLog(traces);
    }

    private parseTrace(trace: string): Trace {
        const activities = trace
            .trim()
            .split(' ')
            .map((activity) => this.parseActivity(activity));

        return new Trace(activities);
    }

    private parseActivity(activity: string): Activity {
        return new Activity(activity);
    }
}
