import { Injectable } from '@angular/core';
import { EventLog } from '../classes/event-log';
import { DFGTransition, TransitionToTransitionArc } from '../classes/petri-net';
import { DFG } from '../classes/dfg';

@Injectable({
    providedIn: 'root',
})
export class CalculateDfgService {
    constructor() {}

    public calculate(eventLog: EventLog): DFG {
        const playTransition: DFGTransition = { id: 'play', name: 'play' };
        const stopTransition: DFGTransition = { id: 'stop', name: 'stop' };

        const dfg: DFG = new DFG();
        // dfg.transitions.set(playTransition);
        dfg.transitions.set(playTransition.name, playTransition);

        if (eventLog.traces.length === 0) {
            const playToStop: TransitionToTransitionArc = {
                start: playTransition,
                end: stopTransition,
            };
            dfg.arcs.add(playToStop);
        }

        // iterate over all traces and their activities
        let count: number = 0;
        eventLog.traces.forEach((trace) => {
            trace.activities.forEach((activity, i, activities) => {
                let dfgt: DFGTransition | undefined = dfg.transitions.get(activity.name);
                if (dfgt === undefined) {
                    dfgt = {
                        id: 'dfgt' + ++count,
                        name: activity.name,
                    };
                }

                // check DFG for occurence of dfgt representing current activity
                if (!dfg.transitions.has(dfgt.name)) {
                    dfg.transitions.set(dfgt.name, dfgt);
                }

                // add arc from play to dfgt if not existing yet
                if (i === 0) {
                    const playToDfgt: TransitionToTransitionArc = {
                        start: playTransition,
                        end: dfgt,
                    };
                    if (!dfg.containsArc(playToDfgt)) {
                        dfg.arcs.add(playToDfgt);
                    }

                    // add arc from prev dfgt to current dfgt if not existing yet
                } else {
                    const prevTrans: DFGTransition | undefined =
                        dfg.transitions.get(activities[i - 1].name);
                    // or use non-null assertion for get-method
                    if (prevTrans !== undefined) {
                        const tta: TransitionToTransitionArc = {
                            start: prevTrans,
                            end: dfgt,
                        };
                        if (!dfg.containsArc(tta)) {
                            dfg.arcs.add(tta);
                        }
                    }
                }

                // add arc from current dfgt to stop if not existing yet
                if (i === activities.length - 1) {
                    const dfgtToStop: TransitionToTransitionArc = {
                        start: dfgt,
                        end: stopTransition,
                    };
                    if (!dfg.containsArc(dfgtToStop)) {
                        dfg.arcs.add(dfgtToStop);
                    }
                }
            });
        });
        dfg.transitions.set(stopTransition.name, stopTransition);
        return dfg;
    }
}
