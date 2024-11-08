export interface Coordinates {
    x: number;
    y: number;
}

export interface Place {
    id: string;
    coordinates: Coordinates;
}

export interface Activity {
    id: string;
    coordinates: Coordinates;
}

export interface Transition {
    id: string;
    coordinates: Coordinates;
}

export type Arc = PlaceToTransitionArc | TransitionToPlaceArc | DfgArc;

export interface PlaceToTransitionArc {
    start: Place;
    end: Transition;
}

export interface TransitionToPlaceArc {
    start: Transition;
    end: Place;
}

export interface DfgArc {
    start: Activity;
    end: Activity;
}
