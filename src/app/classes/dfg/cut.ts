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
