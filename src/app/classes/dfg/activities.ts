export class Activities {
    readonly playActivity: Activity = new Activity('play');
    readonly stopActivity: Activity = new Activity('stop');

    constructor(private readonly activities: Array<Activity> = new Array()) {}

    addPlayAndStop(): Activities {
        this.activities.push(this.playActivity);
        this.activities.push(this.stopActivity);
        return this;
    }

    removePlayAndStop(): Activities {
        return new Activities(
            this.activities.filter((activity) => activity.isNeitherPlayNorStop),
        );
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

    private containsActivityWithName(name: string): boolean {
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

    isNotEmpty(): boolean {
        for (const activity of this.activities) {
            if (activity.isNeitherPlayNorStop()) {
                return true;
            }
        }
        return false;
    }

    /* 
    return partition containing all activities from this activities,
    that are not contained in method-parameter otherPartition, 
    play- and stop-activity are not part of the return partition
     */
    calculateActivityPartitionBy(otherPartition: Activities): Activities {
        return new Activities(
            this.activities.filter(
                (activity) => !otherPartition.containsActivity(activity),
            ),
        ).removePlayAndStop();
    }

    asJson(): string[] {
        return this.activities.map((a) => a.asJson());
    }
}

export class Activity {
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    equals(other: Activity): boolean {
        return this.name === other.name;
    }

    isPlay(): boolean {
        return this.name === 'play';
    }

    isNeitherPlayNorStop(): boolean {
        return !this.isPlay() && this.name !== 'stop';
    }

    asJson(): string {
        return this.name;
    }
}
