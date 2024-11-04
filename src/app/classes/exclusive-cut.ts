import { DFG } from './dfg';
import { DFGTransition, TransitionToTransitionArc } from './petri-net';

export class ExclusiveCut {
    set1: Set<DFGTransition> = new Set();
    set2: Set<DFGTransition> = new Set();
    cutArcs: TransitionToTransitionArc[];
    feedback: string = '';

    constructor(cutArcs: TransitionToTransitionArc[]) {
        this.cutArcs = cutArcs;
    }

    validateExclusiveCut(inputDFG: DFG) {
        if (this.validateExclusiveArcs() !== 'valid') {
            this.feedback = this.validateExclusiveArcs();
            return;
        }
        this.allocateTransitionsToSet(inputDFG);

        this.feedback = this.validateExclusiveness();
    }

    // validation of the simple props of an exclusive cut
    private validateExclusiveArcs(): string {
        if (this.cutArcs.length !== 2) {
            return 'An exclusive cut needs to be defined by exactly two arcs.';
        }
        if (
            this.cutArcs[0].start.name !== 'play' &&
            this.cutArcs[1].start.name !== 'play'
        ) {
            return 'One arc from exclusive cut needs to be connected to play.';
        }
        if (
            this.cutArcs[0].end.name !== 'stop' &&
            this.cutArcs[1].end.name !== 'stop'
        ) {
            return 'One arc of an exclusive cut needs to be connected to stop.';
        }
        return 'valid';
    }

    // filling set by following the arcs from first entry of the setToFill
    // need to be called with each set as parameter
    private allocateTransitionsToSet(inputDFG: DFG) {
        // allocate first Transition of the cut to set1
        const firstTransitionSet1: DFGTransition =
            this.cutArcs[0].start.name === 'play'
                ? this.cutArcs[0].end
                : this.cutArcs[1].end;
        this.set1.add(firstTransitionSet1);
        this.fillFollowingTransitions(this.set1, inputDFG);

        // allocate all remaining Transitions with incoming arc from play to set2
        inputDFG
            .getPlayFollowingTransitionsExcept(firstTransitionSet1)
            .forEach((transition) => {
                this.set2.add(transition);
            });
        this.fillFollowingTransitions(this.set2, inputDFG);
    }

    private fillFollowingTransitions(set: Set<DFGTransition>, inputDFG: DFG) {
        set.forEach((transition) => {
            inputDFG
                .getFollowingTransitions(transition)
                .forEach((followingTransition) => {
                    set.add(followingTransition);
                });
        });
    }

    // if a transition occurs in both sets, there is a connection
    // between the sets, thus the exclusive cut is not valid
    private validateExclusiveness(): string {
        for (const transition of this.set1) {
            if (this.set2.has(transition)) {
                return 'An exclusive cut must not contain any arc between the subsets of its origin-DFG.';
            }
        }
        return 'valid';
    }

    getFeedback(): string {
        return this.feedback;
    }
}
