import { Place } from './places';
import { PetriNetTransition } from './petri-net-transitions';

export class PetriNetArcs {
    private readonly arcs: Array<PlaceToTransitionArc | TransitionToPlaceArc> =
        new Array();
    constructor() {}

    redirectArcStart(
        currentStart: PetriNetTransition,
        newStart: PetriNetTransition,
    ): PetriNetArcs {
        for (const arc of this.arcs.values()) {
            if (arc.start === currentStart) {
                arc.start = newStart;
            }
        }
        return this;
    }

    redirectArcEnd(
        currentEnd: PetriNetTransition,
        newEnd: PetriNetTransition,
    ): PetriNetArcs {
        for (const arc of this.arcs.values()) {
            if (arc.end === currentEnd) {
                arc.end = newEnd;
            }
        }
        return this;
    }

    addPlaceToTransitionArc(
        startPlace: Place,
        endTransition: PetriNetTransition,
    ): PetriNetArcs {
        this.arcs.push({ start: startPlace, end: endTransition });
        return this;
    }

    addTransitionToPlaceArc(
        startTransition: PetriNetTransition,
        endPlace: Place,
    ): PetriNetArcs {
        this.arcs.push({ start: startTransition, end: endPlace });
        return this;
    }

    getNextTransition(place: Place): PetriNetTransition {
        for (const arc of this.arcs) {
            if (arc.start === place) {
                return arc.end;
            }
        }
        throw new Error('This place is not reaching a transition');
    }

    getPrevTransition(place: Place): PetriNetTransition {
        for (const arc of this.arcs) {
            if (arc.end === place) {
                return arc.start;
            }
        }
        throw new Error('This place is not reached by a transition');
    }

    getNextPlace(transition: PetriNetTransition): Place {
        for (const arc of this.arcs) {
            if (arc.start === transition) {
                return arc.end;
            }
        }
        throw new Error('This transition is not reaching a place');
    }

    getPrevPlace(transition: PetriNetTransition): Place {
        for (const arc of this.arcs) {
            if (arc.end === transition) {
                return arc.start;
            }
        }
        throw new Error('This transition is not reached by a place');
    }
}

export interface PlaceToTransitionArc {
    start: Place;
    end: PetriNetTransition;
}

export interface TransitionToPlaceArc {
    start: PetriNetTransition;
    end: Place;
}
