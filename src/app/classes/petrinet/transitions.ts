import { Dfg } from '../dfg/dfg';

export class Transitions {
    private idCount: number = 0;
    constructor(
        private readonly transitions: Array<PetriNetTransition> = new Array(),
    ) {}

    allTransitionsAreBaseCases(): boolean {
        for (const transition of this.transitions) {
            if (transition instanceof Dfg) {
                return false;
            }
        }
        return true;
    }

    deleteTransition(dfg: Dfg): Transitions {
        this.transitions.splice(this.transitions.indexOf(dfg), 1);
        return this;
    }

    getLastTransition(): PetriNetTransition {
        return this.transitions[this.transitions.length - 1];
    }

    addTransition(dfg: Dfg): Transitions {
        if (dfg.isBaseCase()) {
            return this.createPetrinetTransition(dfg.getBaseActivityName());
        }
        this.transitions.push(dfg);
        return this;
    }

    createPetrinetTransition(transitionName: string): Transitions {
        this.transitions.push(new Transition(transitionName, ++this.idCount));
        return this;
    }
}

export class Transition implements PetriNetTransition {
    readonly id: string;
    constructor(
        readonly name: string,
        idCount: number,
    ) {
        this.id = 't' + idCount;
    }
}

export interface PetriNetTransition {
    id: string;
    name?: string;
}
