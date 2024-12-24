import { CutType } from 'src/app/components/cut-execution/cut-execution.component';
import { EventLog } from '../event-log';
import { PetriNetTransition } from '../petrinet/petri-net-transitions';
import { Activities, Activity } from './activities';
import { ArcJson, Arcs, DfgArc } from './arcs';
import { ExclusiveCut, LoopCut, ParallelCut, SequenceCut } from './cut';

export interface DfgJson {
    activities: string[];
    arcs: ArcJson[];
}
export class Dfg implements PetriNetTransition {
    private static idCount: number = 0;
    public id: string;
    constructor(
        private readonly _activities: Activities,
        private readonly _arcs: Arcs,
        private readonly _eventLog: EventLog,
    ) {
        this.id = 'dfg' + ++Dfg.idCount;
    }

    canBeCutIn(
        a1: Activities,
        a2: Activities,
    ): { result: boolean; matchingcut: CutType | null } {
        if (new ExclusiveCut(a1, a2).isPossible(this.activities, this.arcs)) {
            return { result: true, matchingcut: CutType.ExclusiveCut };
        }
        if (new SequenceCut(a1, a2).isPossible(this.activities, this.arcs)) {
            return { result: true, matchingcut: CutType.SequenceCut };
        }
        if (new ParallelCut(a1, a2).isPossible(this.activities, this.arcs)) {
            return { result: true, matchingcut: CutType.ParallelCut };
        }
        if (new LoopCut(a1, a2).isPossible(this.activities, this.arcs)) {
            return { result: true, matchingcut: CutType.LoopCut };
        }

        return { result: false, matchingcut: null };
    }

    /* 
    cuttedArcs are the arcs that are choosen by user for cut, the return
    partitions contain activities from this DFG divided into two partitions,
    each one without play and stop and without any assurance for completeness
    */
    calculatePartitions(cuttedArcs: Arcs): Activities[] {
        const a1: Activities =
            this.arcs.calculateActivityPartitionByActivitiesReachableFromPlay(
                cuttedArcs,
                this.activities.playActivity,
            );
        const remainingActivities: Activities =
            this.activities.getActivitiesNotContainedIn(a1);
        a1.removePlayAndStop();
        if (remainingActivities.isEmpty()) {
            return [a1, new Activities()];
        }
        const a2: Activities = this.arcs
            .calculateActivityPartitionByActivitiesConnectedTo(
                cuttedArcs,
                remainingActivities.getFirstActivity(),
            )
            .removePlayAndStop();
        return [a1, a2];
    }

    isBaseCase(): boolean {
        if (this.activities.getLength() === 3) {
            return true;
        }
        return false;
    }

    getBaseActivityName(): string {
        return this.activities.getBaseActivity().asJson();
    }

    /* 
    return the DfgArc by start and end name with same obj-ref as in this Dfg,
    thus same behavior as the arc is clicked in petrinet
    */
    getArc(start: string, end: string): DfgArc {
        return this.arcs.getArcByStartNameAndEndName(start, end)!;
    }

    get activities(): Activities {
        return this._activities;
    }

    get arcs(): Arcs {
        return this._arcs;
    }

    get eventLog(): EventLog {
        return this._eventLog;
    }

    asJson(): DfgJson {
        return {
            activities: this._activities.asJson(),
            arcs: this._arcs.asJson(),
        };
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
        return new Dfg(this.activities, this.arcs, this.eventlog);
    }
}
