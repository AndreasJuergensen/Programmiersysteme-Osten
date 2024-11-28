import { Activity } from './dfg/activities';

export class EventLog {
    private readonly traces: Trace[];

    constructor(traces: Trace[] = []) {
        this.traces = traces;
    }

    addTrace(trace: Trace): void {
        this.traces.push(trace);
    }

    getAllTraces(): Trace[] {
        return this.traces;
    }
}

export class Trace {
    private readonly activities: Activity[];

    constructor(activities: Activity[] = []) {
        this.activities = activities;
    }

    addActivity(activity: Activity): void {
        this.activities.push(activity);
    }

    getAllActivities(): Activity[] {
        return this.activities;
    }
}
