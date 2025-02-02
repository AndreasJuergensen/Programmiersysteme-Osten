import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
    ActivityNode,
    BoxNode,
    Graph,
    InvisibleTransitionNode,
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
    PlaceToInvisibleTransitionArc,
    PlaceToTransitionArc,
    Transition,
    TransitionToPlaceArc,
} from './models';
import { PetriNetManagementService } from 'src/app/services/petri-net-management.service';
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { ApplicationStateService } from 'src/app/services/application-state.service';
import { DragAndDropService } from 'src/app/services/drag-and-drop.service';

@Component({
    selector: 'app-drawing-area',
    templateUrl: './drawing-area.component.html',
    styleUrl: './drawing-area.component.css',
})
export class DrawingAreaComponent implements OnInit, OnDestroy {
    @ViewChild('svgElement') svgElement!: ElementRef<SVGSVGElement>;

    private _sub: Subscription | undefined;
    private observer!: MutationObserver;

    private _graph: Graph | undefined;

    private _activities: Array<Activity> = new Array<Activity>();
    private _boxes: Array<Box> = new Array<Box>();
    private _transitions: Array<Transition> = new Array<Transition>();
    private _places: Array<Place> = new Array<Place>();
    private _arcs: Array<Arc> = new Array<Arc>();
    private _boxArcs: Array<Arc> = new Array<Arc>();

    public showEventLogs: boolean = false;
    public isEmpty: boolean = true;
    public showArcFeedback: boolean = false;

    constructor(
        private calculatePetriNetService: CalculatePetriNetService,
        private readonly contextMenuService: ContextMenuService,
        applicationStateService: ApplicationStateService,
        petriNetManagementService: PetriNetManagementService,
        private _dragAndDopService: DragAndDropService,
    ) {
        applicationStateService.showEventLogs$.subscribe((showEventLogs) => {
            this.showEventLogs = showEventLogs;
        });
        petriNetManagementService.petriNet$.subscribe((petriNet) => {
            this.isEmpty = petriNet.isEmpty();
        });
        applicationStateService.showArcFeedback$.subscribe(
            (showArcFeedback) => {
                this.showArcFeedback = showArcFeedback;
            },
        );
    }

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
                this._graph = graph;
                const places: Array<Place> = new Array<Place>();
                const activities: Array<Activity> = new Array<Activity>();
                const transitions: Array<Transition> = new Array<Transition>();
                const boxes: Array<Box> = new Array<Box>();

                this._graph.nodes.forEach((node) => {
                    if (node instanceof ActivityNode) {
                        activities.push(new Activity(node as ActivityNode));
                    }

                    if (node instanceof PlaceNode) {
                        places.push(new Place(node as PlaceNode));
                    }

                    if (node instanceof TransitionNode) {
                        if (node instanceof InvisibleTransitionNode) {
                            transitions.push(
                                new Transition(node as InvisibleTransitionNode),
                            );
                        } else {
                            transitions.push(
                                new Transition(node as TransitionNode),
                            );
                        }
                    }

                    if (node instanceof BoxNode) {
                        boxes.push(new Box(node as BoxNode));
                    }
                });

                const arcs: Array<Arc> = new Array<Arc>();
                const boxArcs: Array<Arc> = new Array<Arc>();

                this._graph.edges.forEach((edge) => {
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
                            if (
                                edge.target instanceof InvisibleTransitionNode
                            ) {
                                arcs.push(
                                    new PlaceToInvisibleTransitionArc(
                                        startPlace,
                                        endTransition,
                                    ),
                                );
                            } else {
                                arcs.push(
                                    new PlaceToTransitionArc(
                                        startPlace,
                                        endTransition,
                                    ),
                                );
                            }
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

                this._dragAndDopService.passBoxObjects(boxes);
                this._dragAndDopService.clearAll();
            },
        );

        this.observer = new MutationObserver((mutations) => {
            this.recalculateSVGSize();
        });

        const container = document.getElementById('svg');
        if (container) {
            this.observer.observe(container, {
                childList: true,
                subtree: false,
                attributes: false,
            });
        }
    }

    updatePosition(
        element: Place | Transition | Box,
        pos: { x: number; y: number; xtl: number; ytl: number },
    ) {
        if (element instanceof Place) {
            const place = this.places.find((p) => p.id === element.id);

            if (place) {
                (place.x = pos.x), (place.y = pos.y);
            }

            this.updateArcs();
        }

        if (element instanceof Transition) {
            const transition = this.transitions.find(
                (t) => t.id === element.id,
            );

            if (transition) {
                (transition.x = pos.x), (transition.y = pos.y);
            }

            this.updateArcs();
        }

        if (element instanceof Box) {
            const box = this.boxes.find((b) => b.id === element.id);

            if (box) {
                (box.x = pos.x), (box.y = pos.y);
            }
            this._dragAndDopService.passBoxObjects(this.boxes);
            this.updateArcs();
        }

        if (element instanceof Activity) {
            const activity = this.activities.find(
                (a) => a.id === element.id && a.dfgId === element.dfgId,
            );

            if (activity) {
                (activity.x = pos.x), (activity.y = pos.y);
            }

            this.updateDfgArcs();
        }
    }

    updateDfgArcs(): void {
        const boxArcs: Array<Arc> = new Array<Arc>();

        this._graph?.edges.forEach((edge) => {
            if (edge.source instanceof ActivityNode) {
                const startActivity = this._activities.find(
                    (activity) =>
                        activity.id === edge.source.id &&
                        activity.x === edge.source.x &&
                        activity.y === edge.source.y,
                )!;

                const endActivity = this._activities.find(
                    (activity) =>
                        activity.id === edge.target.id &&
                        activity.x === edge.target.x &&
                        activity.y === edge.target.y,
                )!;

                boxArcs.push(new DfgArc(startActivity, endActivity));
            }
        });

        this._boxArcs = boxArcs;
    }

    updateArcs(): void {
        const arcs: Array<Arc> = new Array<Arc>();

        this._graph?.edges.forEach((edge) => {
            if (edge.source instanceof TransitionNode) {
                const startTransition = this._transitions.find(
                    (transition) => transition.id === edge.source.id,
                )!;

                const endPlace = this._places.find(
                    (place) => place.id === edge.target.id,
                )!;

                arcs.push(new TransitionToPlaceArc(startTransition, endPlace));
            }

            if (edge.source instanceof BoxNode) {
                const startBox = this._boxes.find(
                    (box) => box.id === edge.source.id,
                )!;

                const endPlace = this._places.find(
                    (place) => place.id === edge.target.id,
                )!;

                arcs.push(new BoxToPlaceArc(startBox, endPlace));
            }

            if (edge.source instanceof PlaceNode) {
                const startPlace = this._places.find(
                    (place) => place.id === edge.source.id,
                )!;

                if (edge.target instanceof TransitionNode) {
                    const endTransition = this._transitions.find(
                        (transition) => transition.id === edge.target.id,
                    )!;
                    if (edge.target instanceof InvisibleTransitionNode) {
                        arcs.push(
                            new PlaceToInvisibleTransitionArc(
                                startPlace,
                                endTransition,
                            ),
                        );
                    } else {
                        arcs.push(
                            new PlaceToTransitionArc(startPlace, endTransition),
                        );
                    }
                }

                if (edge.target instanceof BoxNode) {
                    const endBox = this._boxes.find(
                        (box) => box.id === edge.target.id,
                    )!;

                    arcs.push(new PlaceToBoxArc(startPlace, endBox));
                }
            }
        });

        this._arcs = arcs;
    }

    ngOnDestroy(): void {
        this._sub?.unsubscribe();
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private recalculateSVGSize() {
        if (this.svgElement) {
            const svg = this.svgElement.nativeElement;
            const boundingBox = svg.getBBox();
            svg.setAttribute(
                'width',
                (boundingBox.width + boundingBox.x).toString(),
            );
            svg.setAttribute(
                'height',
                (boundingBox.height + boundingBox.y).toString(),
            );
        }
    }

    mouseDown(event: MouseEvent): void {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        const target = event.target as SVGElement;

        if (svg && event.target instanceof SVGSVGElement) {
            svg.classList.add('mouseDown');
        }
    }

    mouseUp(): void {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (svg) {
            svg.classList.remove('mouseDown');
        }
    }

    onContextMenu(event: MouseEvent) {
        event.preventDefault();
        this.contextMenuService.showAt(event.clientX, event.clientY);
    }

    onMenuClose() {
        this.contextMenuService.hide();
    }
}
