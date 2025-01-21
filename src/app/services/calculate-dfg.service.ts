import { Injectable } from '@angular/core';
import { EventLog } from '../classes/event-log';
import { Dfg, DfgBuilder } from '../classes/dfg/dfg';

@Injectable({
    providedIn: 'root',
})
export class CalculateDfgService {
    constructor() {}

    public calculate(eventLog: EventLog): Dfg {
        const dfgBuilder: DfgBuilder = new DfgBuilder();

        dfgBuilder.addEventLog(eventLog);

        eventLog
            .getAllTraces()
            .flatMap((trace) => trace.getAllActivities())
            .map((activity) => activity.asJson())
            .forEach((name) => dfgBuilder.createActivity(name));

        eventLog.getAllTraces().forEach((trace) => {
            trace.getAllActivities().forEach((activity, i, activities) => {
                const activityName = activity.asJson();

                if (i === 0) {
                    dfgBuilder.addFromPlayArc(activityName);
                } else {
                    dfgBuilder.addArc(activities[i - 1].asJson(), activityName);
                }

                if (i === activities.length - 1) {
                    dfgBuilder.addToStopArc(activityName);
                }
            });
        });

        return dfgBuilder.build();
    }
}
