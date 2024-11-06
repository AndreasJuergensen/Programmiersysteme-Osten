import { Injectable } from '@angular/core';
import { DFGTransition, TransitionToTransitionArc } from '../classes/petri-net';
import { DFG } from '../classes/dfg';
import { ExclusiveCut } from '../classes/exclusive-cut';
import { EventLog } from '../classes/event-log';
import { Cut } from '../classes/cut';

@Injectable({
    providedIn: 'root',
})
export class InductiveMinerService {
    constructor() {}

    public mine(
        inputEventLog: EventLog,
        inputDFG: DFG,
        cutArcs: TransitionToTransitionArc[],
    ): Cut | string {
        let cut: Cut;
        if (this.validateExclusiveArcs(cutArcs)) {
            cut = new ExclusiveCut(cutArcs);
            const sets: Set<DFGTransition>[] = cut.validate(inputDFG);
            if (cut.feedback === 'valid') {
                cut.partitionEventLog(inputEventLog, sets);
                cut.calculatePartDFGs();
                return cut;
            } else {
                // not sure if this is a return case
                return cut.feedback;
            }
        }
        // if (this.validateSequenceArcs(cutArcs)){
        // }
        // if (this.validateParallelArcs(cutArcs)) {
        // }

        // Fall-Through

        return 'No cut detected, please try again.';
    }

    private validateExclusiveArcs(
        cutArcs: TransitionToTransitionArc[],
    ): boolean {
        if (
            cutArcs.length !== 2 ||
            (cutArcs[0].start.name !== 'play' &&
                cutArcs[1].start.name !== 'play') ||
            (cutArcs[0].end.name !== 'stop' && cutArcs[1].end.name !== 'stop')
        ) {
            return false;
        }
        return true;
    }
}
