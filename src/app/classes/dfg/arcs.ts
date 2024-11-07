import { Activities, Activity } from './activities';

export class Arcs {
    constructor(private readonly arcs: Array<DfgArc> = new Array()) {}

    filterArcsCompletelyIn(activities: Activities): Arcs {
        return new Arcs(
            this.arcs.filter(
                (arc) =>
                    arc.startIsIncludedIn(activities) &&
                    arc.endIsIncludedIn(activities),
            ),
        );
    }

    calculateReachableActivitiesFromSingleActivity(
        startActivity: Activity,
    ): Activities {
        return this.calculateReachableActivities(
            new Activities([startActivity]),
        );
    }

    calculateReachableActivities(startActivities: Activities): Activities {
        return Array.from(this.arcs.values())
            .filter((arc) => arc.startIsIncludedIn(startActivities))
            .map((arc) => arc.getEnd())
            .map((endActivity) => new Activities([endActivity]))
            .reduce(
                (prev, curr) => new Activities().addAll(prev).addAll(curr),
                new Activities(),
            );
    }

    calculateReachingActivitiesFromSingleActivity(
        endActivity: Activity,
    ): Activities {
        return this.calculateReachingActivities(
            new Activities([endActivity]),
        );
    }

    calculateReachingActivities(endActivities: Activities): Activities {
        return Array.from(this.arcs.values())
            .filter((arc) => arc.endIsIncludedIn(endActivities))
            .map((arc) => arc.getStart())
            .map((endActivity) => new Activities([endActivity]))
            .reduce(
                (prev, curr) => new Activities().addAll(prev).addAll(curr),
                new Activities(),
            );
    }

    calculateTransitivelyReachableActivities(
        startActivity: Activity,
    ): Activities {
        const reachableActivities: Activities = new Activities().addActivity(
            startActivity,
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
        return new Activities(
            this.arcs
                .filter((arc) => arc.endIsIncludedIn(activities))
                .filter((arc) => !arc.startIsIncludedIn(activities))
                .map((arc) => arc.getEnd()),
        );
    }

    calculateOutsideReachingActivities(activities: Activities): Activities {
        return new Activities(
            this.arcs
                .filter((arc) => arc.startIsIncludedIn(activities))
                .filter((arc) => !arc.endIsIncludedIn(activities))
                .map((arc) => arc.getStart()),
        );
    }

    addArc(arc: DfgArc): Arcs {
        if (!this.containsArc(arc)) {
            this.arcs.push(arc);
        }
        return this;
    }

    private containsArc(arc: DfgArc): boolean {
        for (const a of this.arcs) {
            if (a.equals(arc)) {
                return true;
            }
        }
        return false;
    }

    asJson(): ArcJson[] {
        return Array.from(this.arcs.values()).map((arc) => arc.asJson());
    }
}

export interface ArcJson {
    start: string;
    end: string;
}
export class DfgArc {
    private start: Activity;
    private end: Activity;

    constructor(start: Activity, end: Activity) {
        this.start = start;
        this.end = end;
    }

    startsAtPlay(): boolean {
        return this.start.isPlay();
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
