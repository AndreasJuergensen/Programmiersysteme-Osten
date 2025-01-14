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
    private _allPossibleCuts: Array<[boolean, CutType]> = [];

    //lookup table for arc subsets
    // private arcSubsetsLookup: Array<Array<DfgArc>> = [];
    // private arcSubsetsInitialized: boolean = false;
    private arcSubsets2: Array<Array<DfgArc>> = [];

    // A promise that resolves when the arcSubsetsLookup is initialized
    // private arcSubsetsInitializedPromise: Promise<void>;
    // private resolveArcSubsetsInitialized!: () => void;

    constructor(
        private readonly _activities: Activities,
        private readonly _arcs: Arcs,
        private readonly _eventLog: EventLog,
    ) {
        this.id = 'DFG' + ++Dfg.idCount;

        this.initializeAllPossibleCuts();
        // console.log(this.getAllPossibleCuts());

        // this.arcSubsetsInitializedPromise = new Promise((resolve) => {
        //     this.resolveArcSubsetsInitialized = resolve;
        // });

        // this.initializeArcSubsets();
        // this.generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
        //     this._arcs.getArcs(),
        // );
        this.initializeArcSubsets();
    }

    // Methode wird beim Erstellen des Objekts aufgerufen
    private initializeAllPossibleCuts(): void {
        this._allPossibleCuts = this.calculateAllPossibleCuts();
    }

    private initializeArcSubsets(): void {
        this.arcSubsets2 =
            this.generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
                this._arcs.getArcs(),
            );
    }

    // Getter für den Zugriff auf die gespeicherten Ergebnisse
    public getAllPossibleCuts(): Array<[boolean, CutType]> {
        return this._allPossibleCuts;
    }

    public getArcSubsets(): Array<Array<DfgArc>> {
        return this.arcSubsets2;
    }

    // private async initializeArcSubsets(): Promise<void> {
    //     const allArcs = this._arcs.getArcs();
    //     this.arcSubsetsLookup = generateAllSubsets(allArcs);
    //     this.arcSubsetsInitialized = true;

    //     this.resolveArcSubsetsInitialized();
    //     // console.log('ready');
    //     // console.log(this._arcs);
    //     // console.log(this.arcSubsetsLookup);
    // }

    // async waitForArcsSubsetsinitialization(): Promise<void> {
    //     if (!this.arcSubsetsInitialized) {
    //         await this.arcSubsetsInitializedPromise;
    //     }
    // }

    canBeCutBy(
        selectedArcs: Arcs,
        cutType: CutType,
    ): {
        cutIsPossible: boolean;
        matchingCut: CutType | null;
        a1: Activities;
        a2: Activities;
    }[] {
        const results = [];
        let partitionsCount = 0;
        const partitions: Activities[] = this.calculatePartitions(selectedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];
        const selectedCut = this.canBeCutIn(a1, a2);
        results[partitionsCount++] = selectedCut;
        if (!selectedCut.cutIsPossible || selectedCut.matchingCut !== cutType) {
            return results;
        }
        for (const arc of selectedArcs.getArcs()) {
            const reducedArcs: Arcs = selectedArcs.removeArcsBy(
                new Arcs([arc]),
            );
            const partitions: Activities[] =
                this.calculatePartitions(reducedArcs);
            const reducedA1: Activities = partitions[0];
            const reducedA2: Activities = partitions[1];
            results[partitionsCount++] = this.canBeCutIn(reducedA1, reducedA2);
        }
        return results;
    }

    canBeCutIn(
        a1: Activities,
        a2: Activities,
    ): {
        cutIsPossible: boolean;
        matchingCut: CutType | null;
        a1: Activities;
        a2: Activities;
    } {
        if (new ExclusiveCut(a1, a2).isPossible(this.activities, this.arcs)) {
            return {
                cutIsPossible: true,
                matchingCut: CutType.ExclusiveCut,
                a1,
                a2,
            };
        }
        if (new SequenceCut(a1, a2).isPossible(this.activities, this.arcs)) {
            return {
                cutIsPossible: true,
                matchingCut: CutType.SequenceCut,
                a1,
                a2,
            };
        }
        if (new ParallelCut(a1, a2).isPossible(this.activities, this.arcs)) {
            return {
                cutIsPossible: true,
                matchingCut: CutType.ParallelCut,
                a1,
                a2,
            };
        }
        if (new LoopCut(a1, a2).isPossible(this.activities, this.arcs)) {
            return {
                cutIsPossible: true,
                matchingCut: CutType.LoopCut,
                a1,
                a2,
            };
        }

        return { cutIsPossible: false, matchingCut: null, a1, a2 };
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
            if (this.canBeCutIn(sub1, sub2).cutIsPossible) {
                return true;
            }
        }
        return false;
    }

    calculateAllPossibleCuts(): Array<[boolean, CutType]> {
        let cuts: Array<[boolean, CutType]> = new Array<[boolean, CutType]>();
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

            if (this.canBeCutIn(a1, a2).cutIsPossible) {
                cuts.push([
                    this.canBeCutIn(a1, a2).cutIsPossible,
                    this.canBeCutIn(a1, a2).matchingCut!,
                ]);
            }
        }
        return cuts;
    }

    generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
        arcs: Array<DfgArc>,
    ): Array<Array<DfgArc>> {
        const matchingCut: CutType = this.getAllPossibleCuts()[0][1];
        const subsets: Array<Array<DfgArc>> = [];
        const totalSubsets = 1 << arcs.length;
        let cutFeasibilityResults: {
            cutIsPossible: boolean;
            matchingCut: CutType | null;
            a1: Activities;
            a2: Activities;
        }[] = [];

        for (let i = 0; i < totalSubsets; i++) {
            const subset: Array<DfgArc> = [];
            for (let j = 0; j < arcs.length; j++) {
                if (i & (1 << j)) {
                    // Check if jth element is in the current subset
                    subset.push(arcs[j]);
                }
            }
            cutFeasibilityResults = this.canBeCutBy(
                new Arcs(subset),
                matchingCut,
            );
            if (
                cutFeasibilityResults.filter(
                    (cut) =>
                        cut.cutIsPossible === true &&
                        cut.matchingCut === matchingCut,
                ).length === 1
            ) {
                subsets.push(subset);
            }
        }
        console.log('subsets');

        console.log(subsets);

        return subsets;
    }
    /*
    async calculateAllPossibleCorrectArcsToCreatePartitions(
        selectedCut: CutType,
    ): Promise<Array<Arcs>> {
        await this.waitForArcsSubsetsinitialization();

        const possiblyCorrectArcs: Array<Arcs> = new Array<Arcs>();

        const allArcs = this._arcs.getArcs();

        // const allCombinations = generateAllSubsets(allArcs);
        const allCombinations = this.arcSubsetsLookup;

        //Alternative
        // for (const cut of this.getAllPossibleCuts()) {
        //     if (cut[0] === true && cut[1] === CutType.ExclusiveCut) {
        //         for (const arcSubset of allCombinations) {
        //             let selectedArcsToTest: Arcs = new Arcs();
        //             arcSubset.forEach((arc) => selectedArcsToTest.addArc(arc));
        //             if (arcSubset.length < allArcs.length) {
        //                 let a1: Activities =
        //                     this.calculatePartitions(selectedArcsToTest)[0];

        //                 let a2: Activities =
        //                     this.calculatePartitions(selectedArcsToTest)[1];
        //             }
        //         }
        //     }
        // }

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
                            this.canBeCutIn(a1, a2).cutIsPossible === true &&
                            this.canBeCutIn(a1, a2).matchingCut ===
                                CutType.ExclusiveCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }

                        break;
                    case CutType.SequenceCut:
                        if (
                            this.canBeCutIn(a1, a2).cutIsPossible === true &&
                            this.canBeCutIn(a1, a2).matchingCut ===
                                CutType.SequenceCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }

                        break;
                    case CutType.ParallelCut:
                        if (
                            this.canBeCutIn(a1, a2).cutIsPossible === true &&
                            this.canBeCutIn(a1, a2).matchingCut ===
                                CutType.ParallelCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }

                        break;
                    case CutType.LoopCut:
                        if (
                            this.canBeCutIn(a1, a2).cutIsPossible === true &&
                            this.canBeCutIn(a1, a2).matchingCut ===
                                CutType.LoopCut
                        ) {
                            possiblyCorrectArcs.push(selectedArcsToTest);
                        }

                        break;
                }
            }
        }
        // console.log('Correct Arcs:');

        // console.log(possiblyCorrectArcs);

        return possiblyCorrectArcs;
    }
    */

    async validateSelectedArcs(
        selectedArcs: Arcs,
        selectedCut: CutType,
    ): Promise<CategorizedArcs> {
        const correctArcs: Arcs = new Arcs();
        const possiblyCorrectArcs: Arcs = new Arcs();
        const wrongArcs: Arcs = new Arcs();

        // const calculatedPossibleCorrectArcs: Array<Arcs> =
        //     await this.calculateAllPossibleCorrectArcsToCreatePartitions(
        //         selectedCut,
        //     );
        const calculatedPossibleCorrectArcs: Array<Arcs> = [];

        for (const arcs of this.getArcSubsets()) {
            calculatedPossibleCorrectArcs.push(new Arcs(arcs));
        }

        switch (selectedCut) {
            case CutType.ExclusiveCut:
                if (
                    this.getAllPossibleCuts().some(
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
                    this.getAllPossibleCuts().some(
                        (cut) =>
                            cut[0] === true && cut[1] === CutType.SequenceCut,
                    ) &&
                    selectedArcs.getArcs().length < this._arcs.getArcs().length
                ) {
                    selectedArcs.getArcs().forEach((arc) => {
                        let arcCount = calculatedPossibleCorrectArcs.filter(
                            (arcs) => arcs.containsArc(arc),
                        ).length;
                        console.log(arc);

                        console.log(arcCount);
                        console.log(calculatedPossibleCorrectArcs.length);

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
                    this.getAllPossibleCuts().some(
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
                    this.getAllPossibleCuts().some(
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
        return { correctArcs, possiblyCorrectArcs, wrongArcs };
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
