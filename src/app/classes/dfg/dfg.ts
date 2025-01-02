import { CutType } from 'src/app/components/cut-execution/cut-execution.component';
import { EventLog } from '../event-log';
import { PetriNetTransition } from '../petrinet/petri-net-transitions';
import { Activities, Activity } from './activities';
import { ArcJson, Arcs, DfgArc } from './arcs';
import { ExclusiveCut, LoopCut, ParallelCut, SequenceCut } from './cut';
import { Arc } from 'src/app/components/drawing-area';

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

    calculateAllPossibleCuts(): Array<[boolean, CutType]> {
        let cuts: Array<[boolean, CutType]> = new Array<[boolean, CutType]>();
        const allActivities: Activities = new Activities()
            .addAll(this.activities)
            .removePlayAndStop();
        const testedCombinations = new Set<string>();

        for (let mask = 1; mask < 1 << allActivities.getLength(); mask++) {
            const a1: Activities = new Activities();
            const a2: Activities = new Activities();
            for (let i = 0; i < allActivities.getLength(); i++) {
                const activity: Activity = allActivities.getActivityByIndex(i);
                if ((mask & (1 << i)) !== 0) {
                    a1.addActivity(activity);
                } else {
                    a2.addActivity(activity);
                }
            }

            // Sort activities to create a unique key for the combination
            const a1Key = a1
                .getAllActivites()
                .map((act) => act.name)
                .sort()
                .join(',');
            const a2Key = a2
                .getAllActivites()
                .map((act) => act.name)
                .sort()
                .join(',');
            const combinationKey = [a1Key, a2Key].sort().join('|');

            // Check if this combination has already been tested
            if (testedCombinations.has(combinationKey)) {
                continue;
            }

            testedCombinations.add(combinationKey);

            // console.log('Durchlauf:' + mask);
            // console.log('a1: ' + a1.asJson());
            // console.log('a2: ' + a2.asJson());

            if (this.canBeCutIn(a1, a2).result) {
                cuts.push([
                    this.canBeCutIn(a1, a2).result,
                    this.canBeCutIn(a1, a2).matchingcut!,
                ]);
                // console.log('Durchlauf: ' + mask + ' erfolgreich');
                // console.log('a1: ' + a1.asJson());
                // console.log('a2: ' + a2.asJson());
            }
        }
        return cuts;
    }

    /*
    calculateAllPossibleCutsDependingOnSelectedCutAndSelectedArcs(
        selectedArcs: Arcs,
        selectedCut: CutType,
    ): void {
        let cutCombinationToTest: Arcs;

        for (const arc of selectedArcs.getArcs()) {
        }

        selectedArcs.getArcs().forEach((arc) => {
            // let newArc: DfgArc = arc;
            let allArcsWithoutSelectedArcsExceptArcToTest: Arcs = this.arcs;
            allArcsWithoutSelectedArcsExceptArcToTest.removeArcsBy(
                selectedArcs,
            );
            allArcsWithoutSelectedArcsExceptArcToTest.addArc(arc);

            // let arcsToTest: Arcs = allArcsWithoutSelectedArcsExceptArcToTest;
            switch (selectedCut) {
                case CutType.ExclusiveCut:
                    let arcsToTest: Arcs = new Arcs();
                    let playArcs: DfgArc[] = this.arcs
                        .getArcs()
                        .filter((arc) => arc.getStart().isPlay());
                    let stopArcs: DfgArc[] = this.arcs
                        .getArcs()
                        .filter((arc) => arc.getEnd().isStop());
                    if (playArcs.length >= 2 && stopArcs.length >= 2) {
                        //all selected arcs are wrong
                        // if(this.arcs.calculateTransitivelyReachableActivities(playArcs.))
                    } else {
                        // all selected arcs are wrong
                    }
                    selectedArcs
                        .getArcs()
                        .filter((arc) => arc.getStart().isPlay())
                        .filter((arc) => arc.getEnd().isStop());

                    allArcsWithoutSelectedArcsExceptArcToTest
                        .getArcs()
                        .forEach((arc) => {
                            arcsToTest.addArc(arc);

                            
                            hier zuerst den ersten Arc aus selectedArcs testen
                            dann den nacheinander jeden aus allArcsWithoutSelectedArcsExceptArcToTest
                            
                        });

                    break;
                case CutType.SequenceCut:
                    break;
                case CutType.ParallelCut:
                    break;
                case CutType.LoopCut:
                    break;
            }
        });
    }
*/

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

    canBeCutByAnyPartitions(): boolean {
        const copy: Activities = new Activities()
            .addAll(this.activities)
            .removePlayAndStop();
        for (let mask = 1; mask < 1 << copy.getLength(); mask++) {
            const sub1: Activities = new Activities();
            const sub2: Activities = new Activities();
            for (let i = 0; i < copy.getLength(); i++) {
                const activity: Activity = copy.getActivityByIndex(i);
                if ((mask & (1 << i)) !== 0) {
                    sub1.addActivity(activity);
                } else {
                    sub2.addActivity(activity);
                }
            }
            if (this.canBeCutIn(sub1, sub2).result) {
                return true;
            }
        }
        return false;
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
        return this.arcs.getArcByStartNameAndEndName(start, end);
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
