export class Activities {
    readonly playActivity: Activity = new Activity('play');
    readonly stopActivity: Activity = new Activity('stop');

    private activities: Array<Activity> = [];

    constructor() {}

    addPlayAndStop(): Activities {
        this.activities.push(this.playActivity);
        this.activities.push(this.stopActivity);
        return this;
    }

    isTrueForEveryActivity(
        predicate: (activity: Activity) => boolean,
    ): boolean {
        return this.activities
            .map((activity) => predicate(activity))
            .reduce((prev, curr) => prev && curr, true);
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
        activities.activities.forEach((activity) => this.addActivity(activity));
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
        return activities.isTrueForEveryActivity((activity) =>
            this.containsActivity(activity),
        );
    }

    containsActivity(activity: Activity): boolean {
        return this.activities.find((a) => a.equals(activity)) !== undefined;
    }

    containsAnyActivityOf(activities: Activities): boolean {
        return (
            activities.activities
                .filter((activity) => activity.isNeitherPlayNorStop())
                .find((activity) => {
                    return this.containsActivity(activity);
                }) !== undefined
        );
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
        return (
            this.activities.filter((activity) =>
                activity.isNeitherPlayNorStop(),
            ).length > 0
        );
    }

    asJson(): string[] {
        return Array.from(this.activities.values()).map((a) => a.asJson());
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
