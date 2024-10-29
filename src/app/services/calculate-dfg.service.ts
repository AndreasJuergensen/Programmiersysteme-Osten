import { Injectable } from '@angular/core';
import { EventLog } from '../classes/event-log';
import {
    DFG,
    DFGTransition,
    TransitionToTransitionArc,
} from '../classes/petri-net';

@Injectable({
    providedIn: 'root',
})
export class CalculateDfgService {
    constructor() {}

    public calculate(eventLog: EventLog): DFG {
        const playTransition: DFGTransition = { id: 'play', name: 'play' };
        const stopTransition: DFGTransition = { id: 'stop', name: 'stop' };

        const dfg: DFG = {
            id: 'pnt1',
            transitions: [playTransition],
            arcs: [],
        };

        if (eventLog.traces.length === 0) {
            const playToStopArc: TransitionToTransitionArc = {
                start: playTransition,
                end: stopTransition,
            };
            dfg.arcs = [playToStopArc];
        }

        eventLog.traces.forEach((trace) => {
            trace.activities.forEach((activity, i, activities) => {
                const dfgt: DFGTransition = {
                    id: 'dfgt' + (i + 1),
                    name: activity.name,
                };

                dfg.transitions.push(dfgt);

                if (i === 0) {
                    const playToDfgt: TransitionToTransitionArc = {
                        start: playTransition,
                        end: dfgt,
                    };
                    dfg.arcs.push(playToDfgt);
                } else {
                }

                if (activities.length - 1 === i) {
                    const dfgtToStop: TransitionToTransitionArc = {
                        start: dfgt,
                        end: stopTransition,
                    };
                    dfg.arcs.push(dfgtToStop);
                }
            });
        });
        dfg.transitions.push(stopTransition);
        return dfg;
    }
}
