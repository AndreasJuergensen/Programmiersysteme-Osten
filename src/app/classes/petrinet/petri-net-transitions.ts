import { Dfg } from '../dfg/dfg';

export interface PetriNetTransition {
    id: string;
}

export class Transition implements PetriNetTransition {
    readonly id: string;
    constructor(
        private readonly name: string,
        idCount: number,
    ) {
        this.id = 't' + idCount;
    }
}

export class PetriNetTransitions {
    private readonly transitions: Array<PetriNetTransition> = new Array();
    private idCount: number = 0;
    constructor() {}

    addDFG(dfg: Dfg): PetriNetTransitions {
        if (dfg.isBaseCase()) {
            return this.createTransition(dfg.getBaseActivityName());
        }
        this.transitions.push(dfg);
        return this;
    }

    createTransition(transitionName: string): PetriNetTransitions {
        this.transitions.push(new Transition(transitionName, ++this.idCount));
        return this;
    }

    deleteDFG(dfg: Dfg): PetriNetTransitions {
        this.transitions.splice(this.transitions.indexOf(dfg), 1);
        return this;
    }

    getLastTransition(): PetriNetTransition {
        return this.transitions[this.transitions.length - 1];
    }

    getTransitionByID(transitionID: string): PetriNetTransition {
        for (const transition of this.transitions) {
            if (transition.id === transitionID) {
                return transition;
            }
        }
        throw new Error('Transition not found');
    }
}
