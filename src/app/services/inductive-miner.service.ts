import { Injectable } from '@angular/core';
import {
    DFGTransition,
    PetriNet,
    TransitionToTransitionArc,
} from '../classes/petri-net';
import { DFG } from '../classes/dfg';

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
    ): string {
        const set1: Set<DFGTransition> = new Set();
        const set2: Set<DFGTransition> = new Set();
        if (this.exclusiveCut(set1, set2, inputDFG, cutArcs)) {
            return 'excellent!';
        }
        return 'try again please!';
    }

    // check if input mention a valid xor cut
    private exclusiveCut(
        set1: Set<DFGTransition>,
        set2: Set<DFGTransition>,
        inputDFG: DFG,
        cutArcs: TransitionToTransitionArc[],
    ): boolean {
        if (!this.validateExclusiveArcs(cutArcs)) {
            return false;
        }
        // allocate first Transition of the cut to set1
        const firstTransitionSet1: DFGTransition =
            cutArcs[0].start.name === 'play' ? cutArcs[0].end : cutArcs[1].end;
        set1.add(firstTransitionSet1);
        this.allocateTransitionsToSet(inputDFG, set1);

        // allocate all remaining Transitions with incoming arc from play to set2
        inputDFG.getArcs().forEach((arc) => {
            if (arc.start.name === 'play' && arc.end !== firstTransitionSet1) {
                set2.add(arc.end);
            }
        });
        this.allocateTransitionsToSet(inputDFG, set2);

        return this.validateExclusiveness(set1, set2);
    }

    // validation of the simple props of an exclusive cut
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

    // filling set by following the arcs from first entry of the setToFill
    // need to be called with each set as parameter
    private allocateTransitionsToSet(
        inputDFG: DFG,
        setToFill: Set<DFGTransition>,
    ) {
        setToFill.forEach((transition) => {
            inputDFG.getArcs().forEach((arc) => {
                if (
                    arc.start.name !== 'play' &&
                    arc.end.name !== 'stop' &&
                    arc.start === transition
                ) {
                    setToFill.add(arc.end);
                }
            });
        });
    }

    // if a transition occurs in both sets, there is a connection
    // between the sets, thus the exclusive cut is not valid
    private validateExclusiveness(
        set1: Set<DFGTransition>,
        set2: Set<DFGTransition>,
    ): boolean {
        for (const transition of set1) {
            if (set2.has(transition)) {
                return false;
            }
        }
        return true;
    }
}
