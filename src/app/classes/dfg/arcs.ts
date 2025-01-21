import { Activities, Activity } from './activities';

export class Arcs {
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

export interface ArcJson {
    start: string;
    end: string;
}

export interface CategorizedArcs {
    correctArcs: Arcs;
    possiblyCorrectArcs: Arcs;
    wrongArcs: Arcs;
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
