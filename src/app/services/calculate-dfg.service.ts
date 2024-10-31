import { Injectable } from '@angular/core';
import { EventLog } from '../classes/event-log';
import { DFG } from '../classes/dfg';

@Injectable({
    providedIn: 'root',
})
export class CalculateDfgService {
    constructor() {}

    public calculate(eventLog: EventLog): DFG {
        const dfg: DFG = new DFG('pnt1');

        if (eventLog.traces.length === 0) {
            dfg.addPlayToStopArc();
        }

        eventLog.traces.forEach((trace) => {
            trace.activities.forEach((activity, i, activities) => {
                if (i === 0) {
                    dfg.addFromPlayArc(activity.name);
                } else {
                    dfg.addArc(activities[i - 1].name, activity.name);
                }

                if (i === activities.length - 1) {
                    dfg.addToStopArc(activity.name);
                }
            });
        });

        return dfg;
    }
}
