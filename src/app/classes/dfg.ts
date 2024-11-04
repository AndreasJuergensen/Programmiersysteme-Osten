import { endWith } from 'rxjs';
import {
    DFGTransition,
    PetriNetTransition,
} from './petri-net';

export interface DfgJson {
    transitions: TransitionJson[];
    arcs: ArcJson[];
}
export interface TransitionJson {
    id: string;
    name: string;
}
export interface ArcJson {
    start: string;
    end: string;
}
export class DFG implements PetriNetTransition {
    id: string;
    private transitions: Transitions = new Transitions();
    private arcs: Arcs = new Arcs();

    constructor(id: string) {
        this.id = id;
    }

    addPlayToStopArc(): void {
        this.arcs.addArc(new TransitionToTransitionArc(
            this.transitions.playTransition,
            this.transitions.stopTransition,
        ));
    }

    addFromPlayArc(activityName: string): void {
        this.arcs.addArc(
            new TransitionToTransitionArc(
                this.transitions.playTransition,
                this.transitions.getTransitionByName(activityName),
            ),
        );
    }

    addToStopArc(activityName: string): void {
        this.arcs.addArc(
            new TransitionToTransitionArc(
                this.transitions.getTransitionByName(activityName),
                this.transitions.stopTransition,
            ),
        );
    }

    addArc(startActivityName: string, endActivityName: string): void {
        this.arcs.addArc(
            new TransitionToTransitionArc(
                this.transitions.getTransitionByName(startActivityName),
                this.transitions.getTransitionByName(endActivityName),
            ),
        );
    }

    createTransition(name: string): void {
        this.transitions.createTransition(name);
    }

    asJson(): DfgJson {
        return {
            transitions: this.transitions.asJson(),
            arcs: this.arcs.asJson(),
        };
    }
}

export class Arcs {
    private arcs: Set<TransitionToTransitionArc> = new Set();

    addArc(arc: TransitionToTransitionArc): void {
        if (!this.containsArc(arc)) {
            this.arcs.add(arc);
        }
    }

    private containsArc(arc: TransitionToTransitionArc): boolean {
        for (const a of this.arcs) {
            if (a.start === arc.start && a.end === arc.end) {
                return true;
            }
        }
        return false;
    }

    asJson(): ArcJson[] {
        return Array.from(this.arcs.values()).map((arc) => arc.asJson());
    }
}

export class Transitions {
    readonly playTransition: DFGTransition = {
        id: 'play',
        name: 'play',
    };
    readonly stopTransition: DFGTransition = {
        id: 'stop',
        name: 'stop',
    };

    private readonly transitions: Map<string, DFGTransition> = new Map();
    private count: number = 0;

    constructor() {
        this.transitions
            .set(this.playTransition.name, this.playTransition)
            .set(this.stopTransition.name, this.stopTransition);
    }

    /**
     * Postcondition: getTransitionByName(transition.name) return this transition
     */
    addTransition(transition: DFGTransition): void {
        this.transitions.set(transition.name, transition);
    }

    /**
     * Postcondition: getTransitionByName(name) returns a transition with the given name
     */
    createTransition(name: string): void {
        if (this.transitions.has(name)) {
            return;
        }
        this.transitions.set(name, {
            id: 'dfgt' + ++this.count,
            name: name,
        });
    }

    /**
     * Precondition: Transition with given name must have been created or added or name must be "play" or "stop"
     */
    getTransitionByName(name: string): DFGTransition {
        if (!this.transitions.has(name)) {
            throw new Error('Transition not found');
        }
        return this.transitions.get(name)!;
    }

    asJson(): TransitionJson[] {
        return Array.from(this.transitions.values());
    }
}

export class TransitionToTransitionArc {
    start: DFGTransition;
    end: DFGTransition;

    constructor(start: DFGTransition, end: DFGTransition) {
        this.start = start;
        this.end = end;
    }

    asJson(): ArcJson {
        return {
            start: this.start.id,
            end: this.end.id
        }
    }
}