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
    private _currentPossibleCut: CutType | undefined;
    private _arcSubsets: Array<Array<DfgArc>> = [];
    private static _arcCalculationFlag: boolean = false;
    private _isCurrentPossibleCutCalculationCompleted: boolean = false;
    private _isArcSubsetsCalculationCompleted: boolean = false;

    constructor(
        private readonly _activities: Activities,
        private readonly _arcs: Arcs,
        private readonly _eventLog: EventLog,
    ) {
        this.id = 'DFG' + ++Dfg.idCount;
    }

    public static get arcCalculationFlag(): boolean {
        return this._arcCalculationFlag;
    }

    public static set arcCalculationFlag(value: boolean) {
        this._arcCalculationFlag = value;
    }

    public static toggleArcCalculationFlag(): void {
        this._arcCalculationFlag = !this._arcCalculationFlag;
        console.log(
            `Arc calculation flag toggled to: ${this._arcCalculationFlag}`,
        );
    }

    public initializePossibleCut(): void {
        this.calculatePossibleCut().then((possibleCutType) => {
            this._currentPossibleCut = possibleCutType;
            this._isCurrentPossibleCutCalculationCompleted = true;
            this.initializeArcSubsets();
        });
    }

    private initializeArcSubsets(): void {
        if (!this.getPossibleCut()) {
            this._arcSubsets = [];
            this._isArcSubsetsCalculationCompleted = true;
        } else {
            this.filterArcsByCutAndCallSubsetGeneration().then(
                (generatedSubsets) => {
                    this._arcSubsets = generatedSubsets;
                    this._isArcSubsetsCalculationCompleted = true;
                },
            );
        }
    }

    public getPossibleCut(): CutType | undefined {
        return this._currentPossibleCut;
    }

    public getArcSubsets(): Array<Array<DfgArc>> {
        return this._arcSubsets;
    }

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

    async calculatePossibleCut(): Promise<CutType | undefined> {
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
                return this.canBeCutIn(a1, a2).matchingCut!;
            }
        }

        return undefined;
    }

    async filterArcsByCutAndCallSubsetGeneration(): Promise<
        Array<Array<DfgArc>>
    > {
        const filteredArcs = this._arcs.removeArcsBy(
            this._arcs.getSelfLoopArcs(),
        );
        //ein return am Ende
        switch (this.getPossibleCut()!) {
            case CutType.ExclusiveCut:
                const filteredExclusiveArcs = filteredArcs.removeArcsBy(
                    filteredArcs.getNonStartAndStopArcs(),
                );
                return this.generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
                    filteredExclusiveArcs.getArcs(),
                );
            case CutType.SequenceCut:
                const filteredSequenceArcs = filteredArcs.removeArcsBy(
                    filteredArcs.getReverseArcs(),
                );
                return this.generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
                    filteredSequenceArcs.getArcs(),
                );
            case CutType.ParallelCut:
                const filteredParallelArcs = filteredArcs.removeArcsBy(
                    filteredArcs.getNonReversedArcs(),
                );
                return this.generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
                    filteredParallelArcs.getArcs(),
                );
            case CutType.LoopCut:
                const filteredLoopArcs = filteredArcs.removeArcsBy(
                    filteredArcs.getStartAndStopArcs(),
                );
                return this.generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
                    filteredLoopArcs.getArcs(),
                );
        }
    }

    generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
        arcs: Array<DfgArc>,
    ): Array<Array<DfgArc>> {
        const subsets: Array<Array<DfgArc>> = [];

        let cutFeasibilityResults: {
            cutIsPossible: boolean;
            matchingCut: CutType | null;
            a1: Activities;
            a2: Activities;
        }[] = [];
        const totalSubsets = 1 << arcs.length;
        const matchingCut: CutType = this.getPossibleCut()!;

        for (let i = 0; i < totalSubsets; i++) {
            const subset: Array<DfgArc> = [];

            for (let j = 0; j < arcs.length; j++) {
                if (i & (1 << j)) {
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

        return subsets;
    }

    isFeedbackCalculationCompleted(): boolean {
        return (
            this._isArcSubsetsCalculationCompleted &&
            this._isCurrentPossibleCutCalculationCompleted
        );
    }

    validateSelectedArcs(
        selectedArcs: Arcs,
        selectedCut: CutType,
    ): CategorizedArcs {
        const correctArcs: Arcs = new Arcs();
        const possiblyCorrectArcs: Arcs = new Arcs();
        const wrongArcs: Arcs = new Arcs();

        const calculatedPossibleCorrectArcs: Array<Arcs> = [];

        if (this.getArcSubsets().length === 0) {
            selectedArcs.getArcs().forEach((arc) => {
                wrongArcs.addArc(arc);
            });
            return { correctArcs, possiblyCorrectArcs, wrongArcs };
        }
        for (const arcs of this.getArcSubsets()) {
            calculatedPossibleCorrectArcs.push(new Arcs(arcs));
        }

        switch (selectedCut) {
            case CutType.ExclusiveCut:
                if (
                    this.getPossibleCut() === CutType.ExclusiveCut &&
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
                    this.getPossibleCut() === CutType.SequenceCut &&
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
                    this.getPossibleCut() === CutType.ParallelCut &&
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
                    this.getPossibleCut() === CutType.LoopCut &&
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
        if (
            this.activities.getLength() === 3 &&
            this.notContainActivityWithSelfLoopArc()
        ) {
            return true;
        }
        return false;
    }

    private notContainActivityWithSelfLoopArc(): boolean {
        if (this.arcs.containArcWithSameStartAndEnd()) {
            return false;
        }
        return true;
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
        const dfg: Dfg = new Dfg(this.activities, this.arcs, this.eventlog);
        console.log('before');

        dfg.initializePossibleCut();
        console.log('after');
        return dfg;
    }
}
