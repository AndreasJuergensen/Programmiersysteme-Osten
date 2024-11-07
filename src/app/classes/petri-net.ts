export interface PetriNet {
    places: Set<Place>;
    transitions: Map<string, PetriNetTransition>;
    arcs: Set<PlaceToTransitionArc | TransitionToPlaceArc>;
}

export interface Place {
    id: string;
}

export interface PetriNetTransition {
    id: string;
    name?: string;
}

export interface PlaceToTransitionArc {
    start: Place;
    end: PetriNetTransition;
}

export interface TransitionToPlaceArc {
    start: PetriNetTransition;
    end: Place;
}
