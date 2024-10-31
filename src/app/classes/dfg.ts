import {
    DFGTransition,
    PetriNetTransition,
    TransitionToTransitionArc,
} from './petri-net';

export class DFG implements PetriNetTransition {
    // static count = 0;
    id: string;
    transitions: Map<string, DFGTransition> = new Map();
    arcs: Set<TransitionToTransitionArc> = new Set();

    constructor() {
        this.id = 'pnt';
    }

    // containsTransition(transitionToFind: DFGTransition): boolean {
    //     for (const transition of this.transitions) {
    //         if (transition.name === transitionToFind.name) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    containsArc(arc: TransitionToTransitionArc): boolean {
        for (const a of this.arcs) {
            if (a.start === arc.start && a.end === arc.end) {
                return true;
            }
        }
        return false;
    }
}
