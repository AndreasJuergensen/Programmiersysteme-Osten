import { BehaviorSubject } from "rxjs";

class Cut {
    constructor(
        private readonly a1: Activities,
        private readonly a2: Activities,
    ) {}

    basicRequirementsHaveBeenMet(activities: Activities): boolean {
        return (
            this.a1.isNotEmpty() &&
            this.a2.isNotEmpty() &&
            this.everyActivityIsContainedByA1OrA2OrIsPlayOrStop(activities) &&
            this.a1AndA2DoNotContainAdditionalActivities(activities) &&
            this.theIntersectionOfA1AndA2IsEmpty()
        );
    }

    private everyActivityIsContainedByA1OrA2OrIsPlayOrStop(
        activities: Activities,
    ): boolean {
        const union: Activities = new Activities()
            .addPlayAndStop()
            .addAll(this.a1)
            .addAll(this.a2);
        return union.containsAllActivities(activities);
    }

    private a1AndA2DoNotContainAdditionalActivities(
        activities: Activities,
    ): boolean {
        return (
            activities.containsAllActivities(this.a1) &&
            activities.containsAllActivities(this.a2)
        );
    }

    private theIntersectionOfA1AndA2IsEmpty(): boolean {
        return (
            !this.a1.containsAnyActivityOf(this.a2) &&
            !this.a2.containsAnyActivityOf(this.a1)
        );
    }

    noArcFromA1ToA2Exists(arcs: Arcs): boolean {
        return !arcs
            .calculateReachableActivities(this.a1)
            .containsAnyActivityOf(this.a2);
    }

    noArcFromA2ToA1Exists(arcs: Arcs): boolean {
        return !arcs
            .calculateReachableActivities(this.a2)
            .containsAnyActivityOf(this.a1);
    }

    everyActivityInA1HasAnArcToEveryActivityInA2(arcs: Arcs): boolean {
        for (const activities of this.a1.split()) {
            const hasAnArcToEveryActivityInA2: boolean = arcs
                .calculateReachableActivities(activities)
                .containsAllActivities(this.a2);
            if (!hasAnArcToEveryActivityInA2) {
                return false;
            }
        }
        return true;
    }

    everyActivityInA2HasAnArcToEveryActivityInA1(arcs: Arcs): boolean {
        for (const activities of this.a2.split()) {
            const hasAnArcToEveryActivityInA1: boolean = arcs
                .calculateReachableActivities(activities)
                .containsAllActivities(this.a1);
            if (!hasAnArcToEveryActivityInA1) {
                return false;
            }
        }
        return true;
    }

    everyActivityInA1CanReachEveryActivityInA2(arcs: Arcs): boolean {
        for (const activites of this.a1.split()) {
            const canReachEveryActivityInA2: boolean = arcs
                .calculateTransitivelyReachableActivities(activites)
                .containsAllActivities(this.a2);
            if (!canReachEveryActivityInA2) {
                return false;
            }
        }
        return true;
    }

    everyActivityInA2CanReachEveryActivityInA1(arcs: Arcs): boolean {
        for (const activites of this.a2.split()) {
            const canReachEveryActivityInA1: boolean = arcs
                .calculateTransitivelyReachableActivities(activites)
                .containsAllActivities(this.a1);
            if (!canReachEveryActivityInA1) {
                return false;
            }
        }
        return true;
    }

    everyActivityInA1CanBePassedThroughOnlyUsingActivitiesInA1(
        playActivity: Activity,
        stopActivity: Activity,
        arcs: Arcs,
    ): boolean {
        return this.everyActivityInXCanBePassedThroughOnlyUsingActivitiesInX(
            playActivity,
            stopActivity,
            arcs,
            new Activities().addPlayAndStop().addAll(this.a1),
        );
    }

    everyActivityInA2CanBePassedThroughOnlyUsingActivitiesInA2(
        playActivity: Activity,
        stopActivity: Activity,
        arcs: Arcs,
    ): boolean {
        return this.everyActivityInXCanBePassedThroughOnlyUsingActivitiesInX(
            playActivity,
            stopActivity,
            arcs,
            new Activities().addPlayAndStop().addAll(this.a2),
        );
    }

    private everyActivityInXCanBePassedThroughOnlyUsingActivitiesInX(
        playActivity: Activity,
        stopActivity: Activity,
        arcs: Arcs,
        x: Activities,
    ): boolean {
        const arcsInX: Arcs = arcs.filterArcsCompletelyIn(x);
        if (arcsInX.isEmpty()) {
            return false;
        }
        const everyActivityCanBeReachedFromStart: boolean = arcsInX
            .calculateTransitivelyReachableActivities(
                new Activities([playActivity]),
            )
            .containsAllActivities(x);
        const stopCanBeReachedFromEveryActivity: boolean = arcsInX
            .calculateTransitivelyReachingActivities(stopActivity)
            .containsAllActivities(x);
        return (
            everyActivityCanBeReachedFromStart &&
            stopCanBeReachedFromEveryActivity
        );
    }

    everyActivityReachableFromPlayIsInA1(
        playActivity: Activity,
        arcs: Arcs,
    ): boolean {
        return this.a1.containsAllActivities(
            arcs.calculateReachableActivitiesFromSingleActivity(playActivity),
        );
    }

    everyActivityReachingStopIsInA1(
        stopActivity: Activity,
        arcs: Arcs,
    ): boolean {
        return this.a1.containsAllActivities(
            arcs.calculateReachingActivitiesFromSingleActivity(stopActivity),
        );
    }

    everyActivityInA1PlayIsReachableFromPlay(
        playActivity: Activity,
        arcs: Arcs,
    ): boolean {
        return arcs
            .calculateReachableActivitiesFromSingleActivity(playActivity)
            .containsAllActivities(
                arcs.calculateFromOutsideReachableActivities(this.a1),
            );
    }

    everyActivityInA2StopReachesEveryActivityInA1Play(arcs: Arcs): boolean {
        const a2Stop: Activities = arcs.calculateOutsideReachingActivities(
            this.a2,
        );
        const a1Play: Activities = arcs.calculateFromOutsideReachableActivities(
            this.a1,
        );
        for (const activities of a2Stop.split()) {
            const canReachEveryActivityInA1Play: boolean = arcs
                .calculateReachableActivities(activities)
                .containsAllActivities(a1Play);
            if (!canReachEveryActivityInA1Play) {
                return false;
            }
        }
        return true;
    }

    everyActivityInA1StopReachesEveryActivityInA2Play(arcs: Arcs): boolean {
        const a1Stop: Activities = arcs.calculateOutsideReachingActivities(
            this.a1,
        );
        const a2Play: Activities = arcs.calculateFromOutsideReachableActivities(
            this.a2,
        );
        for (const activities of a1Stop.split()) {
            const canReachEveryActivityInA2Play: boolean = arcs
                .calculateReachableActivities(activities)
                .containsAllActivities(a2Play);
            if (!canReachEveryActivityInA2Play) {
                return false;
            }
        }
        return true;
    }

    everyActivityInA1StopReachesStop(
        stopActivity: Activity,
        arcs: Arcs,
    ): boolean {
        const a1Stop: Activities = arcs.calculateOutsideReachingActivities(
            this.a1,
        );
        for (const activities of a1Stop.split()) {
            const canReachStop: boolean = arcs
                .calculateReachableActivities(activities)
                .containsActivity(stopActivity);
            if (!canReachStop) {
                return false;
            }
        }
        return true;
    }
}

export class ExclusiveCut {
    private readonly cut: Cut;

    constructor(
        private readonly a1: Activities,
        private readonly a2: Activities,
    ) {
        this.cut = new Cut(a1, a2);
    }

    isPossible(activities: Activities, arcs: Arcs): boolean {
        return (
            this.cut.basicRequirementsHaveBeenMet(activities) &&
            this.cut.noArcFromA1ToA2Exists(arcs) &&
            this.cut.noArcFromA2ToA1Exists(arcs)
        );
    }
}

export class SequenceCut {
    private readonly cut: Cut;

    constructor(
        private readonly a1: Activities,
        private readonly a2: Activities,
    ) {
        this.cut = new Cut(a1, a2);
    }

    isPossible(activities: Activities, arcs: Arcs): boolean {
        return (
            this.cut.basicRequirementsHaveBeenMet(activities) &&
            this.cut.noArcFromA2ToA1Exists(arcs) &&
            this.cut.everyActivityInA1CanReachEveryActivityInA2(arcs)
        );
    }
}

export class ParallelCut {
    private readonly cut: Cut;

    constructor(
        private readonly a1: Activities,
        private readonly a2: Activities,
    ) {
        this.cut = new Cut(a1, a2);
    }

    isPossible(activities: Activities, arcs: Arcs): boolean {
        return (
            this.cut.basicRequirementsHaveBeenMet(activities) &&
            this.cut.everyActivityInA1HasAnArcToEveryActivityInA2(arcs) &&
            this.cut.everyActivityInA2HasAnArcToEveryActivityInA1(arcs) &&
            this.cut.everyActivityInA1CanBePassedThroughOnlyUsingActivitiesInA1(
                activities.playActivity,
                activities.stopActivity,
                arcs,
            ) &&
            this.cut.everyActivityInA2CanBePassedThroughOnlyUsingActivitiesInA2(
                activities.playActivity,
                activities.stopActivity,
                arcs,
            )
        );
    }
}

export class LoopCut {
    private readonly cut: Cut;

    constructor(
        private readonly a1: Activities,
        private readonly a2: Activities,
    ) {
        this.cut = new Cut(a1, a2);
    }

    isPossible(activities: Activities, arcs: Arcs): boolean {
        return (
            this.cut.basicRequirementsHaveBeenMet(activities) &&
            this.cut.everyActivityReachableFromPlayIsInA1(
                activities.playActivity,
                arcs,
            ) &&
            this.cut.everyActivityReachingStopIsInA1(
                activities.stopActivity,
                arcs,
            ) &&
            this.cut.everyActivityInA1PlayIsReachableFromPlay(
                activities.playActivity,
                arcs,
            ) &&
            this.cut.everyActivityInA2StopReachesEveryActivityInA1Play(arcs) &&
            this.cut.everyActivityInA1StopReachesStop(
                activities.stopActivity,
                arcs,
            ) &&
            this.cut.everyActivityInA1StopReachesEveryActivityInA2Play(arcs)
        );
    }
}


interface PetriNetTransition {
    id: string;
    name?: string;
}

interface DfgJson {
    activities: string[];
    arcs: ArcJson[];
}
class Dfg implements PetriNetTransition {
    private static idCount: number = 0;
    public id: string;
    private _currentPossibleCut: CutType | undefined;
    private _arcSubsets: Array<Array<DfgArc>> = [];
    private _isArcFeedbackCalculationCompleted: boolean = false;

    private _arcFeedbackCalculationState$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);

    constructor(
        private readonly _activities: Activities,
        private readonly _arcs: Arcs,
        private readonly _eventLog: EventLog,
    ) {
        this.id = 'DFG' + ++Dfg.idCount;
    }

    set arcFeedbackCalculationState(value: boolean) {
        this._isArcFeedbackCalculationCompleted = value;
        this._arcFeedbackCalculationState$.next(value);
    }

    get arcFeedbackCalculationState(): boolean {
        return this._isArcFeedbackCalculationCompleted;
    }

    get arcFeedbackCalculationState$() {
        return this._arcFeedbackCalculationState$.asObservable();
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

    set currentPossibleCut(cut: CutType | undefined) {
        this._currentPossibleCut = cut;
    }

    set arcSubsets(subsets: Array<Array<DfgArc>>) {
        this._arcSubsets = subsets;
    }

    get isFeedbackCalculationCompleted(): boolean {
        return this._isArcFeedbackCalculationCompleted;
    }

    set isFeedbackCalculationCompleted(value: boolean) {
        this._isArcFeedbackCalculationCompleted = value;
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

class Arcs {
    constructor(private readonly arcs: Array<DfgArc> = new Array()) {}

    filterArcsCompletelyIn(activities: Activities): Arcs {
        const completelyIn: Arcs = new Arcs();
        for (const arc of this.arcs) {
            if (
                arc.startIsIncludedIn(activities) &&
                arc.endIsIncludedIn(activities)
            ) {
                completelyIn.addArc(arc);
            }
        }
        return completelyIn;
    }

    calculateReachableActivitiesFromSingleActivity(
        startActivity: Activity,
    ): Activities {
        return this.calculateReachableActivities(
            new Activities([startActivity]),
        );
    }

    calculateNextActivities(startActivity: Activity): Activities {
        return Array.from(this.arcs.values())
            .filter((arc) => arc.getStart().name == startActivity.name)
            .reduce(
                (prev, curr) => prev.addActivity(curr.getEnd()),
                new Activities(),
            );
    }

    calculateReachableActivities(startActivities: Activities): Activities {
        const reachableActivities: Activities = new Activities();
        for (const arc of this.arcs) {
            if (arc.startIsIncludedIn(startActivities)) {
                reachableActivities.addActivity(arc.getEnd());
            }
        }
        return reachableActivities;
    }

    calculateReachingActivitiesFromSingleActivity(
        endActivity: Activity,
    ): Activities {
        return this.calculateReachingActivities(new Activities([endActivity]));
    }

    calculateReachingActivities(endActivities: Activities): Activities {
        const reachingActivities: Activities = new Activities();
        for (const arc of this.arcs) {
            if (arc.endIsIncludedIn(endActivities)) {
                reachingActivities.addActivity(arc.getStart());
            }
        }
        return reachingActivities;
    }

    calculateTransitivelyReachableActivities(
        startActivities: Activities,
    ): Activities {
        const reachableActivities: Activities = new Activities().addAll(
            startActivities,
        );
        let prevReachableActivities: Activities;
        do {
            prevReachableActivities = new Activities().addAll(
                reachableActivities,
            );
            reachableActivities.addAll(
                this.calculateReachableActivities(reachableActivities),
            );
        } while (
            !prevReachableActivities.containsAllActivities(reachableActivities)
        );
        return reachableActivities;
    }

    calculateTransitivelyReachingActivities(endActivity: Activity): Activities {
        const reachingActivities: Activities = new Activities().addActivity(
            endActivity,
        );
        let prevReachingActivities: Activities;
        do {
            prevReachingActivities = new Activities().addAll(
                reachingActivities,
            );
            reachingActivities.addAll(
                this.calculateReachingActivities(reachingActivities),
            );
        } while (
            !prevReachingActivities.containsAllActivities(reachingActivities)
        );
        return reachingActivities;
    }

    calculateFromOutsideReachableActivities(
        activities: Activities,
    ): Activities {
        const fromOutsideReachableActivities: Activities = new Activities();
        for (const arc of this.arcs) {
            if (
                arc.endIsIncludedIn(activities) &&
                !arc.startIsIncludedIn(activities)
            ) {
                fromOutsideReachableActivities.addActivity(arc.getEnd());
            }
        }
        return fromOutsideReachableActivities;
    }

    calculateOutsideReachingActivities(activities: Activities): Activities {
        const outsideReachingActivites: Activities = new Activities();
        for (const arc of this.arcs) {
            if (
                arc.startIsIncludedIn(activities) &&
                !arc.endIsIncludedIn(activities)
            ) {
                outsideReachingActivites.addActivity(arc.getStart());
            }
        }
        return outsideReachingActivites;
    }

    /* 
    return partition containing all activities that are connected to play-activity
     */
    calculateActivityPartitionByActivitiesReachableFromPlay(
        cuttedArcs: Arcs,
        play: Activity,
    ): Activities {
        const notCuttedArcs: Arcs = this.removeArcsBy(cuttedArcs);
        const partition: Activities =
            notCuttedArcs.calculateTransitivelyReachableActivities(
                new Activities([play]),
            );
        return partition.getReachingActivities(notCuttedArcs);
    }

    /* 
    return partition containing all activities that are connected to given activity
     */
    calculateActivityPartitionByActivitiesConnectedTo(
        cuttedArcs: Arcs,
        activity: Activity,
    ): Activities {
        const notCuttedArcs: Arcs = this.removeArcsBy(cuttedArcs);
        const partition: Activities =
            notCuttedArcs.calculateTransitivelyReachingActivities(activity);
        const reachableActivities: Activities =
            notCuttedArcs.calculateTransitivelyReachableActivities(partition);
        return partition.addAll(reachableActivities);
    }
    /* 
    return all arcs from this Arcs, except that ones contained in arcs
     */
    removeArcsBy(arcs: Arcs): Arcs {
        return new Arcs(this.arcs.filter((arc) => !arcs.containsArc(arc)));
    }

    addArc(arc: DfgArc): Arcs {
        if (!this.containsArc(arc)) {
            this.arcs.push(arc);
        }
        return this;
    }

    getArcs(): Array<DfgArc> {
        return this.arcs;
    }

    isEmpty(): boolean {
        return this.arcs.length === 0;
    }

    containsArc(arc: DfgArc): boolean {
        for (const a of this.arcs) {
            if (a.equals(arc)) {
                return true;
            }
        }
        return false;
    }

    getReverseArcs(): Arcs {
        const reverseArcs: Arcs = new Arcs();
        const foundReverses: Set<string> = new Set(); // Use a Set to track found pairs

        for (const arc of this.arcs) {
            const start = arc.getStart();
            const end = arc.getEnd();
            const arcKey = `${start.toString()}-${end.toString()}`; // Create a unique key for the arc

            // Skip if we already processed this arc as part of a reversed pair
            if (foundReverses.has(arcKey)) {
                continue;
            }

            for (const otherArc of this.arcs) {
                if (arc === otherArc) continue; // Skip comparing the arc to itself
                const otherStart = otherArc.getStart();
                const otherEnd = otherArc.getEnd();

                if (start.equals(otherEnd) && end.equals(otherStart)) {
                    reverseArcs.addArc(arc);
                    reverseArcs.addArc(otherArc); // Add both arcs to the result
                    const reverseKey = `${otherStart.toString()}-${otherEnd.toString()}`;
                    foundReverses.add(arcKey); // Mark both directions as found
                    foundReverses.add(reverseKey);
                    break; // Once a match is found for the current arc, no need to check further
                }
            }
        }

        return reverseArcs;
    }

    getNonReversedArcs(): Arcs {
        const nonReversedArcs: Arcs = new Arcs();
        const reversedArcs: Set<string> = new Set();
        const arcsToCheck: DfgArc[] = this.arcs.filter(
            (arc) => !arc.getStart().isPlay() && !arc.getEnd().isStop(),
        );

        // First, identify all reversed arcs (as in the previous solution)
        for (const arc of arcsToCheck) {
            const start = arc.getStart();
            const end = arc.getEnd();
            const arcKey = `${start.toString()}-${end.toString()}`;

            for (const otherArc of arcsToCheck) {
                if (arc === otherArc) continue;

                const otherStart = otherArc.getStart();
                const otherEnd = otherArc.getEnd();

                if (start.equals(otherEnd) && end.equals(otherStart)) {
                    const reverseKey = `${otherStart.toString()}-${otherEnd.toString()}`;
                    reversedArcs.add(arcKey);
                    reversedArcs.add(reverseKey);
                    break;
                }
            }
        }

        // Now, add arcs that are NOT in the reversedArcs set
        for (const arc of arcsToCheck) {
            const start = arc.getStart();
            const end = arc.getEnd();
            const arcKey = `${start.toString()}-${end.toString()}`;

            if (!reversedArcs.has(arcKey)) {
                nonReversedArcs.addArc(arc);
            }
        }

        return nonReversedArcs;
    }

    containArcWithSameStartAndEnd(): boolean {
        for (const arc of this.arcs) {
            if (arc.getStart() === arc.getEnd()) {
                return true;
            }
        }
        return false;
    }

    getSelfLoopArcs(): Arcs {
        const selfLoops: Arcs = new Arcs();

        for (const arc of this.arcs) {
            if (arc.getStart() === arc.getEnd()) {
                selfLoops.addArc(arc);
            }
        }

        return selfLoops;
    }

    getStartAndStopArcs(): Arcs {
        const startAndStopArcs: Arcs = new Arcs();
        for (const arc of this.arcs) {
            if (arc.startsAtPlay() || arc.endsAtStop()) {
                startAndStopArcs.addArc(arc);
            }
        }

        return startAndStopArcs;
    }

    getNonStartAndStopArcs(): Arcs {
        const nonStartAndStopArcs: Arcs = new Arcs();
        for (const arc of this.arcs) {
            if (!arc.startsAtPlay() && !arc.endsAtStop()) {
                nonStartAndStopArcs.addArc(arc);
            }
        }

        return nonStartAndStopArcs;
    }

    getArcByStartNameAndEndName(
        start: string,
        end: string,
    ): DfgArc | undefined {
        for (const arc of this.arcs) {
            if (
                arc.getStart().asJson() === start &&
                arc.getEnd().asJson() === end
            ) {
                return arc;
            }
        }
        return undefined;
        // throw new Error('Arc not found');
    }

    asJson(): ArcJson[] {
        return this.arcs.map((arc) => arc.asJson());
    }
}

interface ArcJson {
    start: string;
    end: string;
}

interface CategorizedArcs {
    correctArcs: Arcs;
    possiblyCorrectArcs: Arcs;
    wrongArcs: Arcs;
}

class DfgArc {
    private start: Activity;
    private end: Activity;

    constructor(start: Activity, end: Activity) {
        this.start = start;
        this.end = end;
    }

    startsAtPlay(): boolean {
        return this.start.isPlay();
    }

    endsAtStop(): boolean {
        return this.end.isStop();
    }

    getStart(): Activity {
        return this.start;
    }

    getEnd(): Activity {
        return this.end;
    }

    startIsIncludedIn(activities: Activities): boolean {
        return activities.containsActivity(this.start);
    }

    endIsIncludedIn(activities: Activities): boolean {
        return activities.containsActivity(this.end);
    }

    equals(other: DfgArc): boolean {
        return this.start.equals(other.start) && this.end.equals(other.end);
    }

    asJson(): ArcJson {
        return {
            start: this.start.asJson(),
            end: this.end.asJson(),
        };
    }
}

class Activities {
    readonly playActivity: Activity = new Activity('play');
    readonly stopActivity: Activity = new Activity('stop');

    constructor(private readonly activities: Array<Activity> = new Array()) {}

    addPlayAndStop(): Activities {
        this.activities.push(this.playActivity);
        this.activities.push(this.stopActivity);
        return this;
    }

    removePlayAndStop(): Activities {
        let count: number = 0;
        while (count < this.activities.length) {
            if (this.activities[count].isPlayOrStop()) {
                this.activities.splice(count, 1);
            } else {
                count++;
            }
        }
        return this;
    }

    split(): Activities[] {
        const splitted: Activities[] = [];
        for (const activity of this.activities) {
            splitted.push(new Activities([activity]));
        }
        return splitted;
    }

    /**
     * Postcondition: getActivityByName(activity.name) returns the given activity
     */
    addActivity(activity: Activity): Activities {
        if (!this.containsActivity(activity)) {
            this.activities.push(activity);
        }
        return this;
    }

    /**
     * Postcondition: getActivityByName(activity.name) returns the the activity for every activity included in the given activities
     */
    addAll(activities: Activities): Activities {
        for (const activity of activities.activities) {
            this.addActivity(activity);
        }
        return this;
    }

    /**
     * Postcondition: getActivityByName(name) returns an activity with the given name
     */
    createActivity(name: string): Activities {
        this.addActivity(new Activity(name));
        return this;
    }

    containsActivityWithName(name: string): boolean {
        return this.containsActivity(new Activity(name));
    }

    containsAllActivities(activities: Activities): boolean {
        for (const activity of activities.activities) {
            if (!this.containsActivity(activity)) {
                return false;
            }
        }
        return true;
    }

    containsActivity(activity: Activity): boolean {
        for (const a of this.activities) {
            if (a.equals(activity)) {
                return true;
            }
        }
        return false;
    }

    containsAnyActivityOf(activities: Activities): boolean {
        for (const activity of activities.activities) {
            if (
                activity.isNeitherPlayNorStop() &&
                this.containsActivity(activity)
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Precondition: Activity with given name must have been created or name must be "play" or "stop"
     */
    getActivityByName(name: string): Activity {
        if (!this.containsActivityWithName(name)) {
            throw new Error('Activity not found');
        }
        return this.activities.find((a) => a.equals(new Activity(name)))!;
    }

    getActivityByIndex(index: number): Activity {
        return this.activities[index];
    }

    getAllActivites(): Array<Activity> {
        return this.activities;
    }

    /**
     * return all activities from this activities, that are not contained
     * within the given partition
     */
    getActivitiesNotContainedIn(partition: Activities): Activities {
        const remainingActivities: Activities = new Activities();
        for (const acitivity of this.activities) {
            if (!partition.containsActivity(acitivity))
                remainingActivities.addActivity(acitivity);
        }
        return remainingActivities;
    }

    /**
     * return all reaching activities from every activity
     */
    getReachingActivities(arcs: Arcs): Activities {
        const reachingActivities: Activities = new Activities();
        for (const activity of this.activities) {
            reachingActivities.addAll(
                arcs.calculateTransitivelyReachingActivities(activity),
            );
        }
        return reachingActivities;
    }

    getFirstActivity(): Activity {
        return this.activities[0];
    }

    getBaseActivity(): Activity {
        return this.activities[this.activities.length - 1];
    }

    getLength(): number {
        return this.activities.length;
    }

    isNotEmpty(): boolean {
        for (const activity of this.activities) {
            if (activity.isNeitherPlayNorStop()) {
                return true;
            }
        }
        return false;
    }

    isEmpty(): boolean {
        for (const activity of this.activities) {
            if (activity.isNeitherPlayNorStop()) {
                return false;
            }
        }
        return true;
    }

    asJson(): string[] {
        return this.activities.map((a) => a.asJson());
    }
}

class Activity {
    private readonly _name: string;

    constructor(name: string) {
        this._name = name;
    }

    toString(): string {
        return this._name;
    }

    get name(): string {
        return this._name;
    }

    equals(other: Activity): boolean {
        return this._name === other._name;
    }

    isPlay(): boolean {
        return this._name === 'play';
    }

    isStop(): boolean {
        return this.name === 'stop';
    }

    isNeitherPlayNorStop(): boolean {
        return !this.isPlay() && !this.isStop();
    }

    isPlayOrStop(): boolean {
        return this.isPlay() || this.isStop();
    }

    asJson(): string {
        return this._name;
    }
}

enum CutType {
    ExclusiveCut = 'ExclusiveCut',
    SequenceCut = 'SequenceCut',
    ParallelCut = 'ParallelCut',
    LoopCut = 'LoopCut',
}

class EventLog {
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

class Trace {
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

addEventListener('message', ({ data }: { data: DfgData }) => {
    const activities: Activities = new Activities(
        data._activities.activities.map(
            (activity) => new Activity(activity._name),
        ),
    );
    const arcs: Arcs = new Arcs(
        data._arcs.arcs.map(
            (arc) =>
                new DfgArc(
                    new Activity(arc.start._name),
                    new Activity(arc.end._name),
                ),
        ),
    );
    const eventLog: EventLog = new EventLog();
    const dfg: Dfg = new Dfg(activities, arcs, eventLog);
    const possibleCut = calculatePossibleCut(dfg);
    const response: ReturnData = {
        currentPossibleCut: possibleCut,
        arcSubsets: calculateArcSubsets(dfg, possibleCut),
    };
    postMessage(response);
});

interface ReturnData {
    currentPossibleCut: CutType | undefined;
    arcSubsets: Array<Array<DfgArc>>;
}

interface DfgData {
    _activities: { activities: { _name: string }[] };
    _arcs: { arcs: { end: { _name: string }; start: { _name: string } }[] };
    _eventLog: any;
}

function calculatePossibleCut(dfg: Dfg): CutType | undefined {
    const allActivities: Activities = new Activities()
        .addAll(dfg.activities)
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
        if (dfg.canBeCutIn(a1, a2).cutIsPossible) {
            return dfg.canBeCutIn(a1, a2).matchingCut!;
        }
    }
    return undefined;
}

function calculateArcSubsets(
    dfg: Dfg,
    possibleCut: CutType | undefined,
): Array<Array<DfgArc>> {
    if (!possibleCut) {
        return [];
    }
    return filterArcsByCutAndCallSubsetGeneration(dfg, possibleCut);
}

function filterArcsByCutAndCallSubsetGeneration(
    dfg: Dfg,
    possibleCut: CutType,
): Array<Array<DfgArc>> {
    var filteredArcs = dfg.arcs.removeArcsBy(dfg.arcs.getSelfLoopArcs());
    switch (possibleCut) {
        case CutType.ExclusiveCut:
            filteredArcs = filteredArcs.removeArcsBy(
                filteredArcs.getNonStartAndStopArcs(),
            );
            break;
        case CutType.SequenceCut:
            filteredArcs = filteredArcs.removeArcsBy(
                filteredArcs.getReverseArcs(),
            );
            break;
        case CutType.ParallelCut:
            filteredArcs = filteredArcs.removeArcsBy(
                filteredArcs.getNonReversedArcs(),
            );
            break;
        case CutType.LoopCut:
            filteredArcs = filteredArcs.removeArcsBy(
                filteredArcs.getStartAndStopArcs(),
            );
            break;
    }
    return generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
        filteredArcs.getArcs(),
        possibleCut,
        dfg,
    );
}

function generateAllArcSubsetsAndCheckForPossibleCorrectArcs(
    arcs: Array<DfgArc>,
    matchingCut: CutType,
    dfg: Dfg,
): Array<Array<DfgArc>> {
    const subsets: Array<Array<DfgArc>> = [];

    let cutFeasibilityResults: {
        cutIsPossible: boolean;
        matchingCut: CutType | null;
        a1: Activities;
        a2: Activities;
    }[] = [];
    const totalSubsets = 1 << arcs.length;

    for (let i = 0; i < totalSubsets; i++) {
        const subset: Array<DfgArc> = [];

        for (let j = 0; j < arcs.length; j++) {
            if (i & (1 << j)) {
                subset.push(arcs[j]);
            }
        }
        cutFeasibilityResults = dfg.canBeCutBy(new Arcs(subset), matchingCut);
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
