import { Activities, Activity } from './dfg/activities';
import { ExclusiveCut, LoopCut, ParallelCut, SequenceCut } from './dfg/cut';

export class EventLog {
    private readonly traces: Trace[];

    constructor(traces: Trace[] = []) {
        this.traces = traces;
    }

    addTrace(trace: Trace): void {
        if (!trace.isEmpty()) {
            this.traces.push(trace);
        }
    }

    getAllTraces(): Trace[] {
        return this.traces;
    }

    splitByExclusiveCut(a1: Activities): EventLog[] {
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

    splitBySequenceCut(a2: Activities): EventLog[] {
        const e1: EventLog = new EventLog();
        const e2: EventLog = new EventLog();
        for (const trace of this.traces) {
            let firstSequence: Trace = new Trace();
            for (const [index, activity] of trace
                .getAllActivities()
                .entries()) {
                if (a2.containsActivity(activity)) {
                    e2.addTrace(
                        new Trace(trace.getAllActivities().slice(index)),
                    );
                    break;
                }
                firstSequence.addActivity(activity);
            }
            e1.addTrace(firstSequence);
        }
        return [e1, e2];
    }

    splitByParallelCut(a1: Activities): EventLog[] {
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

    splitByLoopCut(a1: Activities, a2: Activities): EventLog[] {
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

    indexIsBeginOfLoopTrace(partition: Activities, index: number): boolean {
        return partition.containsActivity(this.activities[index]);
    }

    isEmpty(): boolean {
        return this.activities.length === 0;
    }
}
