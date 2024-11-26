import { EventLog } from '../event-log';
import { PetriNetTransition } from '../petri-net';
import { Activities, Activity } from './activities';
import { ArcJson, Arcs, DfgArc } from './arcs';
import { ExclusiveCut, LoopCut, ParallelCut, SequenceCut } from './cut';

export interface DfgJson {
    activities: string[];
    arcs: ArcJson[];
}
export class Dfg implements PetriNetTransition {
    constructor(
        public id: string,
        private readonly activities: Activities,
        private readonly arcs: Arcs,
        private eventLog: EventLog,
    ) {}

    get activities(): Activities {
        return this._activities;
    }

    get arcs(): Arcs {
        return this._arcs;
    }

    canBeCutIn(a1: Activities, a2: Activities): boolean {
        return (
            new ExclusiveCut(a1, a2).isPossible(this.activities, this.arcs) ||
            new SequenceCut(a1, a2).isPossible(this.activities, this.arcs) ||
            new ParallelCut(a1, a2).isPossible(this.activities, this.arcs) ||
            new LoopCut(a1, a2).isPossible(this.activities, this.arcs)
        );
    }

    asJson(): DfgJson {
        return {
            activities: this._activities.asJson(),
            arcs: this._arcs.asJson(),
        };
    }

    getEventLog(): EventLog {
        return this.eventLog;
    }
}

export class DfgBuilder {
    private readonly activities: Activities = new Activities().addPlayAndStop();
    private readonly arcs: Arcs = new Arcs();
    private eventlog: EventLog = new EventLog();

    addPlayToStopArc(): void {
        this.arcs.addArc(
            new DfgArc(
                this.activities.playActivity,
                this.activities.stopActivity,
            ),
        );
    }

    addFromPlayArc(activityName: string): DfgBuilder {
        this.arcs.addArc(
            new DfgArc(
                this.activities.playActivity,
                this.activities.getActivityByName(activityName),
            ),
        );
        return this;
    }

    addToStopArc(activityName: string): DfgBuilder {
        this.arcs.addArc(
            new DfgArc(
                this.activities.getActivityByName(activityName),
                this.activities.stopActivity,
            ),
        );
        return this;
    }

    addArc(startActivityName: string, endActivityName: string): DfgBuilder {
        this.arcs.addArc(
            new DfgArc(
                this.activities.getActivityByName(startActivityName),
                this.activities.getActivityByName(endActivityName),
            ),
        );
        return this;
    }

    createActivity(name: string): DfgBuilder {
        this.activities.addActivity(new Activity(name));
        return this;
    }

    addEventLog(inputEventLog: EventLog): DfgBuilder {
        this.eventlog = inputEventLog;
        return this;
    }

    build(): Dfg {
        return new Dfg('', this.activities, this.arcs, this.eventlog);
    }
}
