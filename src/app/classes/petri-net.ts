export interface PetriNet {
    places: Array<Place>;
    transitions: Array<PetriNetTransition>;
    arcs: Array<PlaceToTransitionArc | TransitionToPlaceArc>;
}

export interface DFG extends PetriNetTransition {
    transitions: Array<DFGTransition>;
    arcs: Array<TransitionToTransitionArc>;
}

export interface Place {
    id: string;
}

export interface PetriNetTransition {
    id: string;
    name?: string;
}

export interface DFGTransition {
    id: string;
    name: string;
}

export interface PlaceToTransitionArc {
    start: Place;
    end: PetriNetTransition;
}

export interface TransitionToPlaceArc {
    start: PetriNetTransition;
    end: Place;
}

export interface TransitionToTransitionArc {
    start: DFGTransition;
    end: DFGTransition;
}
