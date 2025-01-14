import { Activities, Activity } from './dfg/activities';

export class EventLog {
    private _hasOptionalSequence: boolean = false;
    constructor(private readonly _traces: Trace[] = []) {}

    toString(): string {
        return this._traces.map((trace) => trace.toString()).join(' +\n');
    }

    get traces(): Trace[] {
        return this._traces;
    }

    addTrace(trace: Trace): void {
        if (!trace.isEmpty()) {
            this.traces.push(trace);
        }
    }

    getAllTraces(): Trace[] {
        return this.traces;
    }

    splitByExclusiveCut(a1: Activities): [EventLog, EventLog] {
        const e1: EventLog = new EventLog();
        const e2: EventLog = new EventLog();
        for (const trace of this.traces) {
            if (a1.containsActivity(trace.getAllActivities()[0])) {
                e1.addTrace(trace);
                continue;
            }
            e2.addTrace(trace);
        }
        return [e1, e2];
    }

    splitBySequenceCut(a2: Activities): [EventLog, EventLog] {
        const e1: EventLog = new EventLog();
        const e2: EventLog = new EventLog();
        for (const trace of this.traces) {
            let firstSequence: Trace = new Trace();
            let secondSequence: Trace = new Trace();
            for (const [index, activity] of trace.activities.entries()) {
                if (a2.containsActivity(activity)) {
                    secondSequence.addAllActivities(
                        trace.activities.slice(index),
                    );
                    break;
                }
                firstSequence.addActivity(activity);
            }
            e1.addTrace(firstSequence);
            e2.addTrace(secondSequence);
            if (firstSequence.isEmpty()) {
                e1._hasOptionalSequence = true;
                continue;
            }
            if (secondSequence.isEmpty()) {
                e2._hasOptionalSequence = true;
                continue;
            }
        }
        return [e1, e2];
    }

    splitByParallelCut(a1: Activities): [EventLog, EventLog] {
        const e1: EventLog = new EventLog();
        const e2: EventLog = new EventLog();
        for (const trace of this.traces) {
            let parallelTrace1: Trace = new Trace();
            let parallelTrace2: Trace = new Trace();
            for (const activity of trace.getAllActivities()) {
                if (a1.containsActivity(activity)) {
                    parallelTrace1.addActivity(activity);
                } else {
                    parallelTrace2.addActivity(activity);
                }
            }
            e1.addTrace(parallelTrace1);
            e2.addTrace(parallelTrace2);
        }
        return [e1, e2];
    }

    splitByLoopCut(a1: Activities, a2: Activities): [EventLog, EventLog] {
        const e1: EventLog = new EventLog();
        const e2: EventLog = new EventLog();
        for (const trace of this.traces) {
            let loopTrace1: Trace = new Trace();
            let loopTrace2: Trace = new Trace();
            for (const [index, activity] of trace
                .getAllActivities()
                .entries()) {
                if (a1.containsActivity(activity)) {
                    loopTrace1.addActivity(activity);
                    if (
                        index > 0 &&
                        trace.indexIsBeginOfLoopTrace(a2, index - 1)
                    ) {
                        e2.addTrace(loopTrace2);
                        loopTrace2 = new Trace();
                    }
                } else {
                    loopTrace2.addActivity(activity);
                    if (trace.indexIsBeginOfLoopTrace(a1, index - 1)) {
                        e1.addTrace(loopTrace1);
                        loopTrace1 = new Trace();
                    }
                }
            }
            e1.addTrace(loopTrace1);
            e2.addTrace(loopTrace2);
        }
        return [e1, e2];
    }

    splitByActivityOncePerTrace(activity: Activity): [EventLog, EventLog] {
        const partition: Activities = new Activities([activity]);
        return this.splitByParallelCut(partition);
    }

    splitByFlowerFallThrough(): EventLog[] {
        const eventLogs: EventLog[] = [];
        for (const trace of this.traces) {
            for (const activity of trace.activities) {
                const eventLog: EventLog = new EventLog([
                    new Trace([activity]),
                ]);
                const eventLogExistsAlready: boolean = eventLogs.some((log) =>
                    log.equals(eventLog),
                );
                if (!eventLogExistsAlready) {
                    eventLogs.push(eventLog);
                }
            }
        }
        return eventLogs;
    }

    activityOncePerTraceIsPossibleBy(activity: Activity): boolean {
        for (const trace of this.traces) {
            if (!trace.containsActivityOnce(activity)) {
                return false;
            }
        }
        return true;
    }

    private equals(other: EventLog): boolean {
        if (this.traces.length !== other.traces.length) {
            return false;
        }
        for (let i = 0; i < this.traces.length; i++) {
            if (!this.traces[i].equals(other.traces[i])) {
                return false;
            }
        }
        return true;
    }

    get hasOptionalSequence(): boolean {
        return this._hasOptionalSequence;
    }
}

export class Trace {
    constructor(private readonly _activities: Activity[] = []) {}

    toString(): string {
        return this._activities
            .map((activity) => activity.toString())
            .join(' ');
    }

    addActivity(activity: Activity): void {
        this.activities.push(activity);
    }

    addAllActivities(activities: Activity[]) {
        for (const act of activities) {
            this.addActivity(act);
        }
    }

    getAllActivities(): Activity[] {
        return this.activities;
    }

    indexIsBeginOfLoopTrace(partition: Activities, index: number): boolean {
        return partition.containsActivity(this.activities[index]);
    }

    containsActivityOnce(searchActivity: Activity): boolean {
        let activityOccursOnce: boolean = false;
        for (const activity of this.activities) {
            if (activity.equals(searchActivity)) {
                if (activityOccursOnce) {
                    return false;
                }
                activityOccursOnce = true;
            }
        }
        return activityOccursOnce;
    }

    equals(other: Trace): boolean {
        if (this.activities.length !== other.activities.length) {
            return false;
        }
        for (let i = 0; i < this.activities.length; i++) {
            if (!this.activities[i].equals(other.activities[i])) {
                return false;
            }
        }
        return true;
    }

    isEmpty(): boolean {
        return this.activities.length === 0;
    }

    get activities(): Activity[] {
        return this._activities;
    }
}
