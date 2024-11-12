import { Activities, Activity } from './activities';
import { Arcs } from './arcs';

class Cut {
    constructor(
        private readonly a1: Activities,
        private readonly a2: Activities,
    ) {}

    basicRequirementsHaveBeenMet(activities: Activities): boolean {
        return (
            this.a1.isNotEmpty() &&
            this.a2.isNotEmpty() &&
            this.everyNonPlayOrStopActivityIsContainedByA1OrA2(activities) &&
            this.a1AndA2DoNotContainAdditionalActivities(activities) &&
            this.theIntersectionOfA1AndA2IsEmpty()
        );
    }

    private everyNonPlayOrStopActivityIsContainedByA1OrA2(
        activities: Activities,
    ): boolean {
        return activities.isTrueForEveryActivity(
            (activity) =>
                !activity.isNeitherPlayNorStop() ||
                this.a1.containsActivity(activity) ||
                this.a2.containsActivity(activity),
        );
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
        return this.a1.isTrueForEveryActivity((activity) =>
            arcs
                .calculateReachableActivitiesFromSingleActivity(activity)
                .containsAllActivities(this.a2),
        );
    }

    everyActivityInA2HasAnArcToEveryActivityInA1(arcs: Arcs): boolean {
        return this.a2.isTrueForEveryActivity((activity) =>
            arcs
                .calculateReachableActivitiesFromSingleActivity(activity)
                .containsAllActivities(this.a1),
        );
    }

    everyActivityInA1CanReachEveryActivityInA2(arcs: Arcs): boolean {
        return this.a1.isTrueForEveryActivity((activity) =>
            arcs
                .calculateTransitivelyReachableActivities(activity)
                .containsAllActivities(this.a2),
        );
    }

    everyActivityInA2CanReachEveryActivityInA1(arcs: Arcs): boolean {
        return this.a2.isTrueForEveryActivity((activity) =>
            arcs
                .calculateTransitivelyReachableActivities(activity)
                .containsAllActivities(this.a1),
        );
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
        const everyActivityCanBeReachedFromStart: boolean = arcsInX
            .calculateTransitivelyReachableActivities(playActivity)
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
        return arcs
            .calculateOutsideReachingActivities(this.a2)
            .isTrueForEveryActivity((activity) =>
                arcs
                    .calculateReachableActivitiesFromSingleActivity(activity)
                    .containsAllActivities(
                        arcs.calculateFromOutsideReachableActivities(this.a1),
                    ),
            );
    }

    everyActivityInA1StopReachesEveryActivityInA2Play(arcs: Arcs): boolean {
        return arcs
            .calculateOutsideReachingActivities(this.a1)
            .isTrueForEveryActivity((activity) =>
                arcs
                    .calculateReachableActivitiesFromSingleActivity(activity)
                    .containsAllActivities(
                        arcs.calculateFromOutsideReachableActivities(this.a2),
                    ),
            );
    }

    everyActivityInA1StopReachesStop(
        stopActivity: Activity,
        arcs: Arcs,
    ): boolean {
        return arcs
            .calculateOutsideReachingActivities(this.a1)
            .isTrueForEveryActivity((activity) =>
                arcs
                    .calculateReachableActivitiesFromSingleActivity(activity)
                    .containsActivity(stopActivity),
            );
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
