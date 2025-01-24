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
import { ContextMenuService } from 'src/app/services/context-menu.service';
import { PositionForActivitiesService } from 'src/app/services/position-for-activities.service';
import _ from 'lodash';
import { ApplicationStateService } from 'src/app/services/application-state.service';

@Component({
    selector: 'app-drawing-area',
    templateUrl: './drawing-area.component.html',
    styleUrl: './drawing-area.component.css',
})
export class DrawingAreaComponent implements OnInit, OnDestroy {
    @ViewChild('svgElement') svgElement!: ElementRef<SVGSVGElement>;

    private _sub: Subscription | undefined;
    private observer!: MutationObserver;
    private _sub2: Subscription | undefined;
    private _sub3: Subscription | undefined;

    private _graph: Graph | undefined;

    private _activities: Array<Activity> = new Array<Activity>();
    private _boxes: Array<Box> = new Array<Box>();
    private _transitions: Array<Transition> = new Array<Transition>();
    private _places: Array<Place> = new Array<Place>();
    private _arcs: Array<Arc> = new Array<Arc>();
    private _boxArcs: Array<Arc> = new Array<Arc>();

    private _originalPositionOfActivities: Array<Activity> =
        new Array<Activity>();
    private _lastPositionOfActivities: Array<Activity> = new Array<Activity>();
    private _activityMoved = new Array<[activityId: string, dfgId: string]>();

    public showEventLogs: boolean = false;

    constructor(
        private calculatePetriNetService: CalculatePetriNetService,
        private positionForActivitiesService: PositionForActivitiesService,
        private readonly contextMenuService: ContextMenuService,
        applicationStateService: ApplicationStateService,
    ) {
        applicationStateService.showEventLogs$.subscribe((showEventLogs) => {
            this.showEventLogs = showEventLogs;
        });
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

                this._originalPositionOfActivities = _.cloneDeep(activities);
                this._lastPositionOfActivities = _.cloneDeep(activities);

                this.positionForActivitiesService.passBoxObjects(boxes);
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

        this._sub2 =
            this.positionForActivitiesService.movingActivityInGraph$.subscribe(
                (activity) => {
                    const activityId = activity[0];
                    const dfgId = activity[1];
                    const xTranslate = activity[2];
                    const yTranslate = activity[3];

                    const movedActivity = this._activities.find(
                        (activity) =>
                            activity.id === activityId &&
                            activity.dfgId === dfgId,
                    );

                    if (movedActivity) {
                        if (
                            this._activityMoved.filter(
                                (activity) =>
                                    activity[0] === movedActivity.id &&
                                    activity[1] === movedActivity.dfgId,
                            ).length === 0
                        ) {
                            const originalX =
                                this._originalPositionOfActivities.find(
                                    (activity) =>
                                        activity.id === activityId &&
                                        activity.dfgId === dfgId,
                                )!.x;

                            const originalY =
                                this._originalPositionOfActivities.find(
                                    (activity) =>
                                        activity.id === activityId &&
                                        activity.dfgId === dfgId,
                                )!.y;

                            movedActivity.x = originalX + xTranslate;
                            movedActivity.y = originalY + yTranslate;
                            this.updateDfgArcs();
                        } else {
                            const lastX = this._lastPositionOfActivities.find(
                                (activity) =>
                                    activity.id === activityId &&
                                    activity.dfgId === dfgId,
                            )!.x;

                            const lastY = this._lastPositionOfActivities.find(
                                (activity) =>
                                    activity.id === activityId &&
                                    activity.dfgId === dfgId,
                            )!.y;

                            movedActivity.x = lastX + xTranslate;
                            movedActivity.y = lastY + yTranslate;
                            this.updateDfgArcs();
                        }
                    }
                },
            );

        this._sub3 =
            this.positionForActivitiesService.updateArcCoordinates$.subscribe(
                (activity) => {
                    this.updateActivtyMoved(activity[0], activity[1]);
                    const entryCurrentActivity =
                        this._lastPositionOfActivities.find(
                            (activity2) =>
                                activity2.id === activity[0] &&
                                activity2.dfgId === activity[1],
                        );
                    if (entryCurrentActivity) {
                        entryCurrentActivity.x = activity[2];
                        entryCurrentActivity.y = activity[3];
                    }
                },
            );
    }

    updateActivtyMoved(activityID: string, dfgId: string) {
        const activityEntry = this._activityMoved.filter(
            (activity) => activity[0] === activityID && activity[1] === dfgId,
        );

        if (activityEntry.length === 0) {
            this._activityMoved.push([activityID, dfgId]);
        }
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

    mouseDown(): void {
        const svg: SVGSVGElement = document.getElementsByTagName(
            'svg',
        )[0] as SVGSVGElement;

        if (svg) {
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
        this.contextMenuService.showAt(event.clientX + 4, event.clientY + 4);
    }

    onMenuClose() {
        this.contextMenuService.hide();
    }
}
