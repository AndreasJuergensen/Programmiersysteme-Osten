import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
    ActivityNode,
    BoxNode,
    Graph,
    PlaceNode,
    TransitionNode,
} from 'src/app/classes/graph';
import { CalculatePetriNetService } from 'src/app/services/calculate-petri-net.service';
import {
    Activity,
    Arc,
    Box,
    BoxToPlaceArc,
    DfgArc,
    Place,
    PlaceToBoxArc,
    PlaceToTransitionArc,
    Transition,
    TransitionToPlaceArc,
} from './models';

@Component({
    selector: 'app-drawing-area',
    templateUrl: './drawing-area.component.html',
    styleUrl: './drawing-area.component.css',
})
export class DrawingAreaComponent implements OnInit, OnDestroy {
    private _sub: Subscription | undefined;

    private _activities: Array<Activity> = new Array<Activity>();
    private _boxes: Array<Box> = new Array<Box>();
    private _transitions: Array<Transition> = new Array<Transition>();
    private _places: Array<Place> = new Array<Place>();
    private _arcs: Array<Arc> = new Array<Arc>();
    private _boxArcs: Array<Arc> = new Array<Arc>();

    public showEventLogs: boolean = false;

    constructor(private calculatePetriNetService: CalculatePetriNetService) {}

    get activities(): Array<Activity> {
        return this._activities;
    }

    get boxes(): Array<Box> {
        return this._boxes;
    }

    get transitions(): Array<Transition> {
        return this._transitions;
    }

    get places(): Array<Place> {
        return this._places;
    }

    get arcs(): Array<Arc> {
        return this._arcs;
    }

    get boxArcs(): Array<Arc> {
        return this._boxArcs;
    }

    ngOnInit(): void {
        this._sub = this.calculatePetriNetService.graph$.subscribe(
            (graph: Graph) => {
                const places: Array<Place> = new Array<Place>();
                const activities: Array<Activity> = new Array<Activity>();
                const transitions: Array<Transition> = new Array<Transition>();
                const boxes: Array<Box> = new Array<Box>();

                graph.nodes.forEach((node) => {
                    if (node instanceof ActivityNode) {
                        activities.push(new Activity(node as ActivityNode));
                    }

                    if (node instanceof PlaceNode) {
                        places.push(new Place(node as PlaceNode));
                    }

                    if (node instanceof TransitionNode) {
                        transitions.push(
                            new Transition(node as TransitionNode),
                        );
                    }

                    if (node instanceof BoxNode) {
                        boxes.push(new Box(node as BoxNode));
                    }
                });

                const arcs: Array<Arc> = new Array<Arc>();
                const boxArcs: Array<Arc> = new Array<Arc>();

                graph.edges.forEach((edge) => {
                    if (edge.source instanceof ActivityNode) {
                        const startActivity = activities.find(
                            (activity) =>
                                activity.id === edge.source.id &&
                                activity.x === edge.source.x &&
                                activity.y === edge.source.y,
                        )!;

                        const endActivity = activities.find(
                            (activity) =>
                                activity.id === edge.target.id &&
                                activity.x === edge.target.x &&
                                activity.y === edge.target.y,
                        )!;

                        boxArcs.push(new DfgArc(startActivity, endActivity));
                    }

                    if (edge.source instanceof TransitionNode) {
                        const startTransition = transitions.find(
                            (transition) => transition.id === edge.source.id,
                        )!;

                        const endPlace = places.find(
                            (place) => place.id === edge.target.id,
                        )!;

                        arcs.push(
                            new TransitionToPlaceArc(startTransition, endPlace),
                        );
                    }

                    if (edge.source instanceof BoxNode) {
                        const startBox = boxes.find(
                            (box) => box.id === edge.source.id,
                        )!;

                        const endPlace = places.find(
                            (place) => place.id === edge.target.id,
                        )!;

                        arcs.push(new BoxToPlaceArc(startBox, endPlace));
                    }

                    if (edge.source instanceof PlaceNode) {
                        const startPlace = places.find(
                            (place) => place.id === edge.source.id,
                        )!;

                        if (edge.target instanceof TransitionNode) {
                            const endTransition = transitions.find(
                                (transition) =>
                                    transition.id === edge.target.id,
                            )!;

                            arcs.push(
                                new PlaceToTransitionArc(
                                    startPlace,
                                    endTransition,
                                ),
                            );
                        }

                        if (edge.target instanceof BoxNode) {
                            const endBox = boxes.find(
                                (box) => box.id === edge.target.id,
                            )!;

                            arcs.push(new PlaceToBoxArc(startPlace, endBox));
                        }
                    }
                });

                this._boxes = boxes;
                this._activities = activities;
                this._transitions = transitions;
                this._places = places;
                this._arcs = arcs;
                this._boxArcs = boxArcs;
            },
        );
    }

    ngOnDestroy(): void {
        this._sub?.unsubscribe();
    }
}
