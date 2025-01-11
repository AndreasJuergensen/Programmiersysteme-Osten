import { CutType } from 'src/app/components/cut-execution/cut-execution.component';
import { EventLog } from '../event-log';
import { PetriNetTransition } from '../petrinet/petri-net-transitions';
import { Activities, Activity } from './activities';
import { ArcJson, Arcs, CategorizedArcs, DfgArc } from './arcs';
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
        this.id = 'DFG' + ++Dfg.idCount;
    }

    // canBeCutIn(
    //     a1: Activities,
    //     a2: Activities,
    // ): { result: boolean; matchingcut: CutType | null } {
    //     if (new ExclusiveCut(a1, a2).isPossible(this.activities, this.arcs)) {
    //         return { result: true, matchingcut: CutType.ExclusiveCut };
    //     }
    //     if (new SequenceCut(a1, a2).isPossible(this.activities, this.arcs)) {
    //         return { result: true, matchingcut: CutType.SequenceCut };
    //     }
    //     if (new ParallelCut(a1, a2).isPossible(this.activities, this.arcs)) {
    //         return { result: true, matchingcut: CutType.ParallelCut };
    //     }
    //     if (new LoopCut(a1, a2).isPossible(this.activities, this.arcs)) {
    //         return { result: true, matchingcut: CutType.LoopCut };
    //     }

    //     return { result: false, matchingcut: null };
    // }

    canBeCutIn(
        a1: Activities,
        a2: Activities,
    ): { result: boolean; matchingcut: CutType | null } {
        const cutChecks = [
            { type: CutType.ExclusiveCut, cut: new ExclusiveCut(a1, a2) },
            { type: CutType.SequenceCut, cut: new SequenceCut(a1, a2) },
            { type: CutType.ParallelCut, cut: new ParallelCut(a1, a2) },
            { type: CutType.LoopCut, cut: new LoopCut(a1, a2) },
        ];

        for (const { type, cut } of cutChecks) {
            if (cut.isPossible(this.activities, this.arcs)) {
                return { result: true, matchingcut: type };
            }
        }
        return { result: false, matchingcut: null };
    }

    calculateAllPossibleCuts(): Array<
        [boolean, CutType, Activities, Activities]
    > {
        let cuts: Array<[boolean, CutType, Activities, Activities]> = new Array<
            [boolean, CutType, Activities, Activities]
        >();
        const allActivities: Activities = new Activities()
            .addAll(this.activities)
            .removePlayAndStop();

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

            // const arcsForA1 = this._arcs.filterArcsCompletelyIn(a1);
            // const arcsForA2 = this._arcs.filterArcsCompletelyIn(a2);

            if (this.canBeCutIn(a1, a2).result) {
                cuts.push([
                    this.canBeCutIn(a1, a2).result,
                    this.canBeCutIn(a1, a2).matchingcut!,
                    a1,
                    a2,
                ]);
            }
        }
        return cuts;
    }

    // calculateAllPossibleCuts(): Array<
    //     [boolean, CutType, Arcs, Arcs, Activities, Activities]
    // > {
    //     let cuts: Array<
    //         [boolean, CutType, Arcs, Arcs, Activities, Activities]
    //     > = new Array<[boolean, CutType, Arcs, Arcs, Activities, Activities]>();
    //     const allActivities: Activities = new Activities()
    //         .addAll(this.activities)
    //         .removePlayAndStop();

    //     for (let mask = 1; mask < 1 << allActivities.getLength(); mask++) {
    //         const a1: Activities = new Activities();
    //         const a2: Activities = new Activities();
    //         for (let i = 0; i < allActivities.getLength(); i++) {
    //             const activity: Activity = allActivities.getActivityByIndex(i);
    //             if ((mask & (1 << i)) !== 0) {
    //                 a1.addActivity(activity);
    //             } else {
    //                 a2.addActivity(activity);
    //             }
    //         }

    //         const arcsForA1 = this._arcs.filterArcsCompletelyIn(a1);
    //         const arcsForA2 = this._arcs.filterArcsCompletelyIn(a2);

    //         if (this.canBeCutIn(a1, a2).result) {
    //             cuts.push([
    //                 this.canBeCutIn(a1, a2).result,
    //                 this.canBeCutIn(a1, a2).matchingcut!,
    //                 arcsForA1,
    //                 arcsForA2,
    //                 a1,
    //                 a2,
    //             ]);
    //         }
    //     }
    //     return cuts;
    // }
    //     for (let mask = 1; mask < 1 << this._arcs.getLength(); mask++) {
    //         const a1: Activities = new Activities();
    //         const a2: Activities = new Activities();
    //         for (let i = 0; i < this._arcs.getLength(); i++) {
    //             const arc: DfgArc = this._arcs.getArcs().
    calculateAllPossibleCorrectArcsToCreatePartitions(
        selectedCut: CutType,
    ): Array<Arcs> {
        const possiblyCorrectArcs: Array<Arcs> = new Array<Arcs>();
        const allArcs = this._arcs.getArcs();
        console.log('Arcs:');

        console.log(allArcs);

        // const allCombinations = this.generateAllArcSubsets(allArcs);
        const allCombinations = generateAllSubsets(allArcs);
        console.log('combinations:');

        console.log(allCombinations);

        for (const arcSubset of allCombinations) {
            let selectedArcsToTest: Arcs = new Arcs();
            arcSubset.forEach((arc) => selectedArcsToTest.addArc(arc));
            if (arcSubset.length < allArcs.length) {
                let a1: Activities =
                    this.calculatePartitions(selectedArcsToTest)[0];

                let a2: Activities =
                    this.calculatePartitions(selectedArcsToTest)[1];

                switch (selectedCut) {
                    case CutType.ExclusiveCut:
                        if (
                            this.canBeCutIn(a1, a2).result === true &&
                            this.canBeCutIn(a1, a2).matchingcut ===
                                CutType.ExclusiveCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }

                        break;
                    case CutType.SequenceCut:
                        if (
                            this.canBeCutIn(a1, a2).result === true &&
                            this.canBeCutIn(a1, a2).matchingcut ===
                                CutType.SequenceCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }

                        break;
                    case CutType.ParallelCut:
                        if (
                            this.canBeCutIn(a1, a2).result === true &&
                            this.canBeCutIn(a1, a2).matchingcut ===
                                CutType.ParallelCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }

                        break;
                    case CutType.LoopCut:
                        if (
                            this.canBeCutIn(a1, a2).result === true &&
                            this.canBeCutIn(a1, a2).matchingcut ===
                                CutType.LoopCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }

                        break;
                }
            }
        }
        /*
        allCombinations.forEach((arcSubset) => {
            let selectedArcsToTest: Arcs = new Arcs();
            arcSubset.forEach((arc) => selectedArcsToTest.addArc(arc));
            if (arcSubset.length < allArcs.length) {
                let a1: Activities =
                    this.calculatePartitions(selectedArcsToTest)[0];

                let a2: Activities =
                    this.calculatePartitions(selectedArcsToTest)[1];

                switch (selectedCut) {
                    case CutType.ExclusiveCut:
                        if (
                            this.canBeCutIn(a1, a2).result === true &&
                            this.canBeCutIn(a1, a2).matchingcut ===
                                CutType.ExclusiveCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }
                        // this.calculateAllPossibleCuts().forEach((cut) => {
                        //     if (
                        //         cut[0] === true &&
                        //         cut[1] === CutType.ExclusiveCut &&
                        //         a1.containsAllActivities(cut[2]) &&
                        //         a2.containsAllActivities(cut[3])
                        //     ) {
                        //         possiblyCorrectArcs.push(selectedArcsToTest);
                        //     }
                        // });
                        break;
                    case CutType.SequenceCut:
                        if (
                            this.canBeCutIn(a1, a2).result === true &&
                            this.canBeCutIn(a1, a2).matchingcut ===
                                CutType.SequenceCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }
                        // this.calculateAllPossibleCuts().forEach((cut) => {
                        //     if (
                        //         cut[0] === true &&
                        //         cut[1] === CutType.SequenceCut &&
                        //         a1.containsAllActivities(cut[2]) &&
                        //         a2.containsAllActivities(cut[3])
                        //     ) {
                        //         possiblyCorrectArcs.push(selectedArcsToTest);
                        //     }
                        // });
                        break;
                    case CutType.ParallelCut:
                        if (
                            this.canBeCutIn(a1, a2).result === true &&
                            this.canBeCutIn(a1, a2).matchingcut ===
                                CutType.ParallelCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }
                        // this.calculateAllPossibleCuts().forEach((cut) => {
                        //     if (
                        //         cut[0] === true &&
                        //         cut[1] === CutType.ParallelCut &&
                        //         a1.containsAllActivities(cut[2]) &&
                        //         a2.containsAllActivities(cut[3])
                        //     ) {
                        //         possiblyCorrectArcs.push(selectedArcsToTest);
                        //     }
                        // });
                        break;
                    case CutType.LoopCut:
                        if (
                            this.canBeCutIn(a1, a2).result === true &&
                            this.canBeCutIn(a1, a2).matchingcut ===
                                CutType.LoopCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }
                        // this.calculateAllPossibleCuts().forEach((cut) => {
                        //     if (
                        //         cut[0] === true &&
                        //         cut[1] === CutType.LoopCut &&
                        //         a1.containsAllActivities(cut[2]) &&
                        //         a2.containsAllActivities(cut[3])
                        //     ) {
                        //         possiblyCorrectArcs.push(selectedArcsToTest);
                        //     }
                        // });
                        break;
                }
            }
        });
        */
        console.log('Correct Arcs:');

        console.log(possiblyCorrectArcs);

        return possiblyCorrectArcs;
    }

    private generateAllArcSubsets(arcs: Array<DfgArc>): Array<Array<DfgArc>> {
        const subsets: Array<Array<DfgArc>> = [];
        const totalSubsets = 1 << arcs.length;

        for (let i = 0; i < totalSubsets; i++) {
            const subset: Array<DfgArc> = [];
            for (let j = 0; j < arcs.length; j++) {
                if (i & (1 << j)) {
                    // Check if jth element is in the current subset
                    subset.push(arcs[j]);
                }
            }
            subsets.push(subset);

            // console.log(subset);
        }

        return subsets;
    }

    validateSelectedArcs(
        selectedArcs: Arcs,
        selectedCut: CutType,
    ): CategorizedArcs {
        const correctArcs: Arcs = new Arcs();
        const possiblyCorrectArcs: Arcs = new Arcs();
        const wrongArcs: Arcs = new Arcs();

        const calculatedPossibleCorrectArcs: Array<Arcs> =
            this.calculateAllPossibleCorrectArcsToCreatePartitions(selectedCut);

        switch (selectedCut) {
            case CutType.ExclusiveCut:
                if (
                    this.calculateAllPossibleCuts().some(
                        (cut) =>
                            cut[0] === true && cut[1] === CutType.ExclusiveCut,
                    ) &&
                    selectedArcs.getArcs().length < this._arcs.getArcs().length
                ) {
                    selectedArcs.getArcs().forEach((arc) => {
                        let arcCount = calculatedPossibleCorrectArcs.filter(
                            (arcs) => arcs.containsArc(arc),
                        ).length;

                        if (arcCount === 0) {
                            wrongArcs.addArc(arc);
                        } else if (
                            arcCount < calculatedPossibleCorrectArcs.length
                        ) {
                            possiblyCorrectArcs.addArc(arc);
                        } else {
                            correctArcs.addArc(arc);
                        }
                    });
                } else {
                    selectedArcs.getArcs().forEach((arc) => {
                        wrongArcs.addArc(arc);
                    });
                }
                break;
            case CutType.SequenceCut:
                if (
                    this.calculateAllPossibleCuts().some(
                        (cut) =>
                            cut[0] === true && cut[1] === CutType.SequenceCut,
                    ) &&
                    selectedArcs.getArcs().length < this._arcs.getArcs().length
                ) {
                    selectedArcs.getArcs().forEach((arc) => {
                        let arcCount = calculatedPossibleCorrectArcs.filter(
                            (arcs) => arcs.containsArc(arc),
                        ).length;

                        if (arcCount === 0) {
                            wrongArcs.addArc(arc);
                        } else if (
                            arcCount < calculatedPossibleCorrectArcs.length
                        ) {
                            possiblyCorrectArcs.addArc(arc);
                        } else {
                            correctArcs.addArc(arc);
                        }
                    });
                } else {
                    selectedArcs.getArcs().forEach((arc) => {
                        wrongArcs.addArc(arc);
                    });
                }
                break;
            case CutType.ParallelCut:
                if (
                    this.calculateAllPossibleCuts().some(
                        (cut) =>
                            cut[0] === true && cut[1] === CutType.ParallelCut,
                    ) &&
                    selectedArcs.getArcs().length < this._arcs.getArcs().length
                ) {
                    selectedArcs.getArcs().forEach((arc) => {
                        let arcCount = calculatedPossibleCorrectArcs.filter(
                            (arcs) => arcs.containsArc(arc),
                        ).length;

                        if (arcCount === 0) {
                            wrongArcs.addArc(arc);
                        } else if (
                            arcCount < calculatedPossibleCorrectArcs.length
                        ) {
                            possiblyCorrectArcs.addArc(arc);
                        } else {
                            correctArcs.addArc(arc);
                        }
                    });
                } else {
                    selectedArcs.getArcs().forEach((arc) => {
                        wrongArcs.addArc(arc);
                    });
                }
                break;
            case CutType.LoopCut:
                if (
                    this.calculateAllPossibleCuts().some(
                        (cut) => cut[0] === true && cut[1] === CutType.LoopCut,
                    ) &&
                    selectedArcs.getArcs().length < this._arcs.getArcs().length
                ) {
                    selectedArcs.getArcs().forEach((arc) => {
                        let arcCount = calculatedPossibleCorrectArcs.filter(
                            (arcs) => arcs.containsArc(arc),
                        ).length;

                        if (arcCount === 0) {
                            wrongArcs.addArc(arc);
                        } else if (
                            arcCount < calculatedPossibleCorrectArcs.length
                        ) {
                            possiblyCorrectArcs.addArc(arc);
                        } else {
                            correctArcs.addArc(arc);
                        }
                    });
                } else {
                    selectedArcs.getArcs().forEach((arc) => {
                        wrongArcs.addArc(arc);
                    });
                }
                break;
        }
        // console.log(correctArcs);
        // console.log(possiblyCorrectArcs);
        // console.log(wrongArcs);

        return { correctArcs, possiblyCorrectArcs, wrongArcs };
    }

    // getCorrectArcsBasedOnSelectedArcs(
    //     selectedArcs: Arcs,
    //     selectedCut: CutType,
    // ): Arcs {
    //     const correctArcs = new Arcs();

    //     // if no cut is possible, returned arcs is empty
    //     switch (selectedCut) {
    //         case CutType.ExclusiveCut:
    //             if (
    //                 this.calculateAllPossibleCuts().some(
    //                     (cut) =>
    //                         cut[0] === true && cut[1] === CutType.ExclusiveCut,
    //                 )
    //             ) {
    //                 const selectedPlayArcs = selectedArcs
    //                     .getArcs()
    //                     .filter((arc) => arc.startsAtPlay());
    //                 const selectedStopArcs = selectedArcs
    //                     .getArcs()
    //                     .filter((arc) => arc.endsAtStop());

    //                 for (const cut of this.calculateAllPossibleCuts()) {
    //                     // straight cut or play and stop arcs belong to e.g. A1
    //                     const selectedPlayArcsEndingInA1 =
    //                         selectedPlayArcs.filter((arc) =>
    //                             arc.endIsIncludedIn(cut[4]),
    //                         );
    //                     const selectedStopArcsStartingInA1 =
    //                         selectedStopArcs.filter((arc) =>
    //                             arc.startIsIncludedIn(cut[4]),
    //                         );
    //                     const selectedPlayArcsEndingInA2 =
    //                         selectedPlayArcs.filter((arc) =>
    //                             arc.endIsIncludedIn(cut[5]),
    //                         );
    //                     const selectedStopArcsStartingInA2 =
    //                         selectedStopArcs.filter((arc) =>
    //                             arc.startIsIncludedIn(cut[5]),
    //                         );

    //                     if (
    //                         selectedPlayArcsEndingInA1 &&
    //                         selectedStopArcsStartingInA1 &&
    //                         selectedPlayArcsEndingInA2.length == 0 &&
    //                         selectedStopArcsStartingInA2.length == 0
    //                     ) {
    //                         selectedPlayArcsEndingInA1.forEach((arc) => {
    //                             correctArcs.addArc(arc);
    //                         });
    //                         selectedStopArcsStartingInA1.forEach((arc) => {
    //                             correctArcs.addArc(arc);
    //                         });
    //                     }
    //                     // diagonal cut e.g. playArc to A1 and stopArc from A2
    //                     else if (
    //                         selectedPlayArcsEndingInA1 &&
    //                         selectedStopArcsStartingInA2 &&
    //                         selectedPlayArcsEndingInA2.length == 0 &&
    //                         selectedStopArcsStartingInA1.length == 0
    //                     ) {
    //                         selectedPlayArcsEndingInA1.forEach((arc) => {
    //                             correctArcs.addArc(arc);
    //                         });
    //                         selectedStopArcsStartingInA2.forEach((arc) => {
    //                             correctArcs.addArc(arc);
    //                         });
    //                     } else {
    //                         // keep correct play arcs leading to one of the two partitions active
    //                         if (correctArcs.getArcs().length == 0) {
    //                             selectedPlayArcs.forEach((arc) => {
    //                                 if (arc.endIsIncludedIn(cut[4])) {
    //                                     correctArcs.addArc(arc);
    //                                 }
    //                             });
    //                         }
    //                     }
    //                 }
    //             }
    //             break;
    //         case CutType.SequenceCut:
    //             if (
    //                 this.calculateAllPossibleCuts().some(
    //                     (cut) =>
    //                         cut[0] === true && cut[1] === CutType.SequenceCut,
    //                 )
    //             ) {
    //                 for (const cut of this.calculateAllPossibleCuts()) {
    //                     if (
    //                         correctArcs.isEmpty() &&
    //                         selectedArcs.getArcs().length <
    //                             this._arcs.getArcs().length
    //                     ) {
    //                         selectedArcs.getArcs().forEach((arc) => {
    //                             if (
    //                                 !arc.startsAtPlay() &&
    //                                 !arc.endsAtStop() &&
    //                                 !cut[2].containsArc(arc) &&
    //                                 !cut[3].containsArc(arc)
    //                             ) {
    //                                 correctArcs.addArc(arc);
    //                             }
    //                         });
    //                     }
    //                 }
    //             }
    //             break;
    //         case CutType.ParallelCut:
    //             if (
    //                 this.calculateAllPossibleCuts().some(
    //                     (cut) =>
    //                         cut[0] === true && cut[1] === CutType.ParallelCut,
    //                 )
    //             ) {
    //                 for (const cut of this.calculateAllPossibleCuts()) {
    //                     if (
    //                         correctArcs.isEmpty() &&
    //                         selectedArcs.getArcs().length <
    //                             this._arcs.getArcs().length
    //                     ) {
    //                         selectedArcs.getArcs().forEach((arc) => {
    //                             if (
    //                                 !cut[2].containsArc(arc) &&
    //                                 !cut[3].containsArc(arc)
    //                             ) {
    //                                 correctArcs.addArc(arc);
    //                             }
    //                         });
    //                     }
    //                 }
    //             }
    //             break;
    //         case CutType.LoopCut:
    //             if (
    //                 this.calculateAllPossibleCuts().some(
    //                     (cut) => cut[0] === true && cut[1] === CutType.LoopCut,
    //                 )
    //             ) {
    //                 for (const cut of this.calculateAllPossibleCuts()) {
    //                     if (
    //                         correctArcs.isEmpty() &&
    //                         selectedArcs.getArcs().length <
    //                             this._arcs.getArcs().length
    //                     ) {
    //                         selectedArcs.getArcs().forEach((arc) => {
    //                             if (
    //                                 !arc.startsAtPlay() &&
    //                                 !arc.endsAtStop() &&
    //                                 !cut[2].containsArc(arc) &&
    //                                 !cut[3].containsArc(arc)
    //                             ) {
    //                                 correctArcs.addArc(arc);
    //                             }
    //                         });
    //                     }
    //                 }
    //             }
    //             break;
    //     }
    //     return correctArcs;
    // }

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

function generateAllSubsets(arcs: Array<DfgArc>): Array<Array<DfgArc>> {
    const subsets: Array<Array<DfgArc>> = [];
    const totalSubsets = 1 << arcs.length;

    for (let i = 0; i < totalSubsets; i++) {
        const subset: Array<DfgArc> = [];
        for (let j = 0; j < arcs.length; j++) {
            if (i & (1 << j)) {
                // Check if jth element is in the current subset
                subset.push(arcs[j]);
            }
        }
        subsets.push(subset);

        // console.log(subset);
    }

    return subsets;
}
