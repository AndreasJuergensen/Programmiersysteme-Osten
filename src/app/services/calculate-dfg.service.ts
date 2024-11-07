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

        if (eventLog.traces.length === 0) {
            dfgBuilder.addPlayToStopArc();
            return dfgBuilder.build();
        }

        eventLog.traces
            .flatMap((trace) => trace.activities)
            .map((activity) => activity.name)
            .forEach((name) => dfgBuilder.createActivity(name));

        eventLog.traces.forEach((trace) => {
            trace.activities.forEach((activity, i, activities) => {
                if (i === 0) {
                    dfgBuilder.addFromPlayArc(activity.name);
                } else {
                    dfgBuilder.addArc(activities[i - 1].name, activity.name);
                }

                if (i === activities.length - 1) {
                    dfgBuilder.addToStopArc(activity.name);
                }
            });
        });

        return dfgBuilder.build();
    }
}
