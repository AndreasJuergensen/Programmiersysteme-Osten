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
        this.id = 'DFG' + ++Dfg.idCount;
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

    calculateAllPossibleCuts(): Array<
        [boolean, CutType, Arcs, Arcs, Activities, Activities]
    > {
        let cuts: Array<
            [boolean, CutType, Arcs, Arcs, Activities, Activities]
        > = new Array<[boolean, CutType, Arcs, Arcs, Activities, Activities]>();
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
            // const a1Key = a1
            //     .getAllActivites()
            //     .map((act) => act.name)
            //     .sort()
            //     .join(',');
            // const a2Key = a2
            //     .getAllActivites()
            //     .map((act) => act.name)
            //     .sort()
            //     .join(',');
            // const combinationKey = [a1Key, a2Key].sort().join('|');

            // Check if this combination has already been tested
            // if (testedCombinations.has(combinationKey)) {
            //     continue;
            // }

            // testedCombinations.add(combinationKey);

            //hier sind theoretisch nur die Arcs die komplett in den Partitionen liegen drin
            //d.h. alle anderen Arcs müssten geschnitten worden sein
            //und oder sind fromPlay oder toStop Arcs
            const arcsForA1 = this._arcs.filterArcsCompletelyIn(a1);
            const arcsForA2 = this._arcs.filterArcsCompletelyIn(a2);
            // console.log('Durchlauf:' + mask);
            // console.log('a1: ' + a1.asJson());
            // console.log('a2: ' + a2.asJson());

            if (this.canBeCutIn(a1, a2).result) {
                cuts.push([
                    this.canBeCutIn(a1, a2).result,
                    this.canBeCutIn(a1, a2).matchingcut!,
                    arcsForA1,
                    arcsForA2,
                    a1,
                    a2,
                ]);
                // console.log('Durchlauf: ' + mask + ' erfolgreich');
                // console.log('a1: ' + a1.asJson());
                // console.log('a2: ' + a2.asJson());
            }
        }
        return cuts;
    }

    getCorrectArcsBasedOnSelectedArcs(
        selectedArcs: Arcs,
        selectedCut: CutType,
    ): Arcs {
        const correctArcs = new Arcs();

        switch (selectedCut) {
            case CutType.ExclusiveCut:
                if (
                    this.calculateAllPossibleCuts().some(
                        (cut) =>
                            cut[0] === true && cut[1] === CutType.ExclusiveCut,
                    )
                ) {
                    const selectedPlayArcs = selectedArcs
                        .getArcs()
                        .filter((arc) => arc.startsAtPlay());
                    const selectedStopArcs = selectedArcs
                        .getArcs()
                        .filter((arc) => arc.endsAtStop());

                    for (const cut of this.calculateAllPossibleCuts()) {
                        // gerader Schnitt bzw. play und stop Kanten gehören zu z.B. A1
                        const selectedPlayArcsEndingInA1 =
                            selectedPlayArcs.filter((arc) =>
                                arc.endIsIncludedIn(cut[4]),
                            );
                        const selectedStopArcsStartingInA1 =
                            selectedStopArcs.filter((arc) =>
                                arc.startIsIncludedIn(cut[4]),
                            );
                        const selectedPlayArcsEndingInA2 =
                            selectedPlayArcs.filter((arc) =>
                                arc.endIsIncludedIn(cut[5]),
                            );
                        const selectedStopArcsStartingInA2 =
                            selectedStopArcs.filter((arc) =>
                                arc.startIsIncludedIn(cut[5]),
                            );

                        if (
                            selectedPlayArcsEndingInA1 &&
                            selectedStopArcsStartingInA1 &&
                            selectedPlayArcsEndingInA2.length == 0 &&
                            selectedStopArcsStartingInA2.length == 0
                        ) {
                            selectedPlayArcsEndingInA1.forEach((arc) => {
                                correctArcs.addArc(arc);
                            });
                            selectedStopArcsStartingInA1.forEach((arc) => {
                                correctArcs.addArc(arc);
                            });
                        }
                        //diagonaler Schnitt z.B. playKante zu A1 und stopKante aus A2
                        else if (
                            selectedPlayArcsEndingInA1 &&
                            selectedStopArcsStartingInA2 &&
                            selectedPlayArcsEndingInA2.length == 0 &&
                            selectedStopArcsStartingInA1.length == 0
                        ) {
                            selectedPlayArcsEndingInA1.forEach((arc) => {
                                correctArcs.addArc(arc);
                            });
                            selectedStopArcsStartingInA2.forEach((arc) => {
                                correctArcs.addArc(arc);
                            });
                        } else {
                            //korrekte Play Kanten die zu einer Partition führen aktiv lassen
                            if (correctArcs.getArcs().length == 0) {
                                selectedPlayArcs.forEach((arc) => {
                                    if (arc.endIsIncludedIn(cut[4])) {
                                        correctArcs.addArc(arc);
                                    }
                                });
                            }
                        }
                    }
                }
                break;
            case CutType.SequenceCut:
                if (
                    this.calculateAllPossibleCuts().some(
                        (cut) =>
                            cut[0] === true && cut[1] === CutType.SequenceCut,
                    )
                ) {
                    for (const cut of this.calculateAllPossibleCuts()) {
                        if (
                            correctArcs.isEmpty() &&
                            selectedArcs.getArcs().length <
                                this._arcs.getArcs().length
                        ) {
                            selectedArcs.getArcs().forEach((arc) => {
                                if (
                                    !arc.startsAtPlay() &&
                                    !arc.endsAtStop() &&
                                    !cut[2].containsArc(arc) &&
                                    !cut[3].containsArc(arc)
                                ) {
                                    correctArcs.addArc(arc);
                                }
                            });
                        }
                    }
                }
                break;
            case CutType.ParallelCut:
                if (
                    this.calculateAllPossibleCuts().some(
                        (cut) =>
                            cut[0] === true && cut[1] === CutType.ParallelCut,
                    )
                ) {
                    for (const cut of this.calculateAllPossibleCuts()) {
                        if (
                            correctArcs.isEmpty() &&
                            selectedArcs.getArcs().length <
                                this._arcs.getArcs().length
                        ) {
                            selectedArcs.getArcs().forEach((arc) => {
                                if (
                                    !cut[2].containsArc(arc) &&
                                    !cut[3].containsArc(arc)
                                ) {
                                    correctArcs.addArc(arc);
                                }
                            });
                        }
                    }
                }
                break;
            case CutType.LoopCut:
                if (
                    this.calculateAllPossibleCuts().some(
                        (cut) => cut[0] === true && cut[1] === CutType.LoopCut,
                    )
                ) {
                    for (const cut of this.calculateAllPossibleCuts()) {
                        if (
                            correctArcs.isEmpty() &&
                            selectedArcs.getArcs().length <
                                this._arcs.getArcs().length
                        ) {
                            selectedArcs.getArcs().forEach((arc) => {
                                if (
                                    !arc.startsAtPlay() &&
                                    !arc.endsAtStop() &&
                                    !cut[2].containsArc(arc) &&
                                    !cut[3].containsArc(arc)
                                ) {
                                    correctArcs.addArc(arc);
                                }
                            });
                        }
                    }
                }
                break;
        }
        return correctArcs;
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

    static resetIdCount(): void {
        this.idCount = 0;
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
