import { transition } from '@angular/animations';
import {
    DFGTransition,
    PetriNetTransition,
    TransitionToTransitionArc,
} from './petri-net';

export class DFG implements PetriNetTransition {
    id: string;
    private transitions: Map<string, DFGTransition> = new Map();
    private arcs: Set<TransitionToTransitionArc> = new Set();
    private count: number = 0;
    private readonly playTransition: DFGTransition = {
        id: 'play',
        name: 'play',
    };
    private readonly stopTransition: DFGTransition = {
        id: 'stop',
        name: 'stop',
    };

    constructor(id: string) {
        this.id = id;
        this.transitions
            .set(this.playTransition.name, this.playTransition)
            .set(this.stopTransition.name, this.stopTransition);
    }

    addPlayToStopArc(): void {
        const playToStop: TransitionToTransitionArc = {
            start: this.playTransition,
            end: this.stopTransition,
        };
        this.addArcIntern(playToStop);
    }

    addFromPlayArc(activityName: string): void {
        const dfgt: DFGTransition = this.getOrCreateTransition(activityName);
        const playToDfgt: TransitionToTransitionArc = {
            start: this.playTransition,
            end: dfgt,
        };
        this.addArcIntern(playToDfgt);
    }

    addToStopArc(activityName: string): void {
        const dfgt: DFGTransition = this.getOrCreateTransition(activityName);
        const dfgtToStop: TransitionToTransitionArc = {
            start: dfgt,
            end: this.stopTransition,
        };
        this.addArcIntern(dfgtToStop);
    }

    addArc(startActivityName: string, endActivityName: string): void {
        const tta: TransitionToTransitionArc = {
            start: this.getOrCreateTransition(startActivityName),
            end: this.getOrCreateTransition(endActivityName),
        };
        this.addArcIntern(tta);
    }

    private addArcIntern(arc: TransitionToTransitionArc): void {
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

    getOrCreateTransition(name: string): DFGTransition {
        let dfgt: DFGTransition | undefined = this.transitions.get(name);
        if (dfgt === undefined) {
            dfgt = {
                id: 'dfgt' + ++this.count,
                name: name,
            };
            this.transitions.set(dfgt.name, dfgt);
        }

        return dfgt;
    }

    // retrieve all transitions that can be reached by arcs from given transition
    getFollowingTransitions(transition: DFGTransition): Set<DFGTransition> {
        const followingTransitions: Set<DFGTransition> = new Set();
        this.arcs.forEach((arc) => {
            if (
                arc.start.name !== 'play' &&
                arc.end.name !== 'stop' &&
                arc.start === transition
            ) {
                followingTransitions.add(arc.end);
            }
        });
        return followingTransitions;
    }

    // retrieve all transtions following the play-transition except the given one
    getPlayFollowingTransitionsExcept(
        exceptTransition: DFGTransition,
    ): Set<DFGTransition> {
        const followingTransitions: Set<DFGTransition> = new Set();
        this.arcs.forEach((arc) => {
            if (arc.start.name === 'play' && arc.end !== exceptTransition) {
                followingTransitions.add(arc.end);
            }
        });
        return followingTransitions;
    }

    // called by automatic test only
    // retrieve arc from dfg
    getArcByStartEndName(start: string, end: string) {
        for (const arc of this.arcs) {
            if (start === arc.start.name && end === arc.end.name) {
                return arc;
            }
        }
        return undefined;
    }
}
