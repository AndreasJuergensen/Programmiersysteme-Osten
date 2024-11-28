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
    return all arcs from this Arcs, except that ones contained in cuttedArcs
     */
    private removeArcsBy(cuttedArcs: Arcs): Arcs {
        return new Arcs(
            this.arcs.filter((arc) => !cuttedArcs.containsArc(arc)),
        );
    }

    addArc(arc: DfgArc): Arcs {
        if (!this.containsArc(arc)) {
            this.arcs.push(arc);
        }
        return this;
    }

    isEmpty(): boolean {
        return this.arcs.length === 0;
    }

    private containsArc(arc: DfgArc): boolean {
        for (const a of this.arcs) {
            if (a.equals(arc)) {
                return true;
            }
        }
        return false;
    }

    getArcByStartNameAndEndName(start: string, end: string): DfgArc {
        for (const arc of this.arcs) {
            if (
                arc.getStart().asJson() === start &&
                arc.getEnd().asJson() === end
            ) {
                return arc;
            }
        }
        throw new Error('Arc not found');
    }

    asJson(): ArcJson[] {
        return this.arcs.map((arc) => arc.asJson());
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
