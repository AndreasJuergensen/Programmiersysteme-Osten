import { Injectable } from '@angular/core';
import {
    DFGTransition,
    PetriNet,
    TransitionToTransitionArc,
} from '../classes/petri-net';
import { DFG } from '../classes/dfg';
import { ExclusiveCut } from '../classes/exclusive-cut';

@Injectable({
    providedIn: 'root',
})
export class InductiveMinerService {
    constructor() {}

    // übergabe pn? damit neu erzegte DFGs den ursprünglichen DFG ersetzen können ohne diese zurückgeben zu müssen
    public mine(
        // petriNet: PetriNet,
        inputDFG: DFG,
        cutArcs: TransitionToTransitionArc[],
    ): ExclusiveCut | string {
        const exclusiveCut = new ExclusiveCut(cutArcs);
        exclusiveCut.validateExclusiveCut(inputDFG);
        if (exclusiveCut.getFeedback() === 'valid') {
            return exclusiveCut;
        }
        return exclusiveCut.getFeedback();
    }
}
