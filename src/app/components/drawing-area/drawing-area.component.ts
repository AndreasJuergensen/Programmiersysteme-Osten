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
import { PetriNetManagementService } from 'src/app/services/petri-net-management.service';

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
    private _sub4: Subscription | undefined;
    private _sub5: Subscription | undefined;

    private _graph: Graph | undefined;

    private _activities: Array<Activity> = new Array<Activity>();
    private _boxes: Array<Box> = new Array<Box>();
    private _transitions: Array<Transition> = new Array<Transition>();
    private _places: Array<Place> = new Array<Place>();
    private _arcs: Array<Arc> = new Array<Arc>();
    private _boxArcs: Array<Arc> = new Array<Arc>();

    // ------------------- Activities -------------------
    private _originalPositionOfActivities: Array<Activity> =
        new Array<Activity>();
    private _lastPositionOfActivities: Array<Activity> = new Array<Activity>();
    private _allMovedActivities = new Array<
        [activityId: string, dfgId: string]
    >();

    // ------------------- Places -------------------
    private _originalPositionOfPlaces: Array<Place> = new Array<Place>();
    private _lastPositionOfPlaces: Array<Place> = new Array<Place>();
    private _allMovedPlaces = new Array<[placeId: string]>();

    // ------------------- Transitions  -------------------
    private _originalPositionOfTransitions: Array<Transition> =
        new Array<Transition>();
    private _lastPositionOfTransitions: Array<Transition> =
        new Array<Transition>();
    private _allMovedTransitions = new Array<[transitionId: string]>();

    // ------------------- Boxes -------------------
    private _originalPositionOfBoxes: Array<Box> = new Array<Box>();
    private _lastPositionOfBoxes: Array<Box> = new Array<Box>();
    private _allMovedBoxes = new Array<[boxId: string]>();

    public showEventLogs: boolean = false;
    public isEmpty: boolean = true;

    constructor(
        private calculatePetriNetService: CalculatePetriNetService,
        private positionForActivitiesService: PositionForActivitiesService,
        private readonly contextMenuService: ContextMenuService,
        applicationStateService: ApplicationStateService,
        petriNetManagementService: PetriNetManagementService,
    ) {
        applicationStateService.showEventLogs$.subscribe((showEventLogs) => {
            this.showEventLogs = showEventLogs;
        });
        petriNetManagementService.petriNet$.subscribe((petriNet) => {
            this.isEmpty = petriNet.isEmpty();
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

                this._originalPositionOfPlaces = _.cloneDeep(places);
                this._lastPositionOfPlaces = _.cloneDeep(places);

                this._originalPositionOfTransitions = _.cloneDeep(transitions);
                this._lastPositionOfTransitions = _.cloneDeep(transitions);

                this._originalPositionOfBoxes = _.cloneDeep(boxes);
                this._lastPositionOfBoxes = _.cloneDeep(boxes);

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

        //Für Activities
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
                        this.updateActivityPosition(
                            movedActivity,
                            activityId,
                            dfgId,
                            xTranslate,
                            yTranslate,
                        );
                    }
                },
            );

        //Für BoxArcs
        this._sub3 =
            this.positionForActivitiesService.updateBoxArcCoordinates$.subscribe(
                (activity) => {
                    const activityId = activity[0];
                    const dfgId = activity[1];
                    const newX = activity[2];
                    const newY = activity[3];

                    //Aktualisiert Liste mit allen bewegten Activities
                    this.updateAllMovedActivities(activityId, dfgId);
                    this.updateLastPositionOfActivity(
                        activityId,
                        dfgId,
                        newX,
                        newY,
                    );
                },
            );

        //Für Petri-Netz-Elemente (Transition, Place)
        this._sub4 =
            this.positionForActivitiesService.movingElementInGraph$.subscribe(
                (element) => {
                    //neue Position des Elements
                    const elementId = element[0];
                    const elementType = element[1];
                    const xTranslate = element[2];
                    const yTranslate = element[3];

                    if (elementType === 'place') {
                        //Suche nach dem Place innerhalb des Graphen
                        const movedPlace = this._places.find(
                            (place) => place.id === elementId,
                        );

                        if (movedPlace) {
                            this.updatePlacePosition(
                                movedPlace,
                                elementId,
                                xTranslate,
                                yTranslate,
                            );
                        }
                    }

                    if (elementType === 'transition') {
                        //Suche nach der Transition innerhalb des Graphen
                        const movedTransition = this._transitions.find(
                            (transition) => transition.id === elementId,
                        );

                        if (movedTransition) {
                            this.updateTransitionPosition(
                                movedTransition,
                                elementId,
                                xTranslate,
                                yTranslate,
                            );
                        }
                    }

                    if (elementType === 'box') {
                        //Suche nach der Box innerhalb des Graphen
                        const movedBox = this._boxes.find(
                            (box) => box.id === elementId,
                        );

                        if (movedBox) {
                            this.updateBoxPosition(
                                movedBox,
                                elementId,
                                xTranslate,
                                yTranslate,
                            );

                            this.updateDFGElementsPosition(
                                elementId,
                                xTranslate,
                                yTranslate,
                            );
                        }
                    }
                },
            );

        this._sub5 =
            this.positionForActivitiesService.updateEndPositionOfElement$.subscribe(
                (element) => {
                    const elementId: string = element[0];
                    const elementType: string = element[1];
                    const newX: number = element[2];
                    const newY: number = element[3];
                    const xTranslate: number = element[4];
                    const yTranslate: number = element[5];

                    if (elementType === 'place') {
                        //Aktualisiert Liste mit allen bewegten Places
                        this.updateAllMovedPlaces(elementId);
                        this.updateLastPositionOfElement(
                            elementId,
                            'place',
                            newX,
                            newY,
                        );
                    }

                    if (elementType === 'transition') {
                        //Aktualisiert Liste mit allen bewegten Places
                        this.updateAllMovedTransitions(elementId);
                        this.updateLastPositionOfElement(
                            elementId,
                            'transition',
                            newX,
                            newY,
                        );
                    }

                    if (elementType === 'box') {
                        this.updateAllMovedBoxes(elementId);
                        this.updateLastPositionOfElement(
                            elementId,
                            'box',
                            newX,
                            newY,
                        );
                        this.updateLastPositionOfDFGElements(
                            elementId,
                            xTranslate,
                            yTranslate,
                        );
                    }
                },
            );
    }

    updateActivityPosition(
        movedActivity: Activity,
        activityId: string,
        dfgId: string,
        xTranslate: number,
        yTranslate: number,
    ) {
        if (
            this._allMovedActivities.filter(
                (activity) =>
                    activity[0] === movedActivity.id &&
                    activity[1] === movedActivity.dfgId,
            ).length === 0
        ) {
            const originalX = this._originalPositionOfActivities.find(
                (activity) =>
                    activity.id === activityId && activity.dfgId === dfgId,
            )!.x;

            const originalY = this._originalPositionOfActivities.find(
                (activity) =>
                    activity.id === activityId && activity.dfgId === dfgId,
            )!.y;

            movedActivity.x = originalX + xTranslate;
            movedActivity.y = originalY + yTranslate;
            this.updateDfgArcs();
        } else {
            const lastX = this._lastPositionOfActivities.find(
                (activity) =>
                    activity.id === activityId && activity.dfgId === dfgId,
            )!.x;

            const lastY = this._lastPositionOfActivities.find(
                (activity) =>
                    activity.id === activityId && activity.dfgId === dfgId,
            )!.y;

            movedActivity.x = lastX + xTranslate;
            movedActivity.y = lastY + yTranslate;
            this.updateDfgArcs();
        }
    }

    updatePlacePosition(
        movedPlace: Place,
        elementId: string,
        xTranslate: number,
        yTranslate: number,
    ) {
        //Wenn Element noch nicht bewegt wurde
        if (
            this._allMovedPlaces.filter((place) => place[0] === movedPlace.id)
                .length === 0
        ) {
            const originalX = this._originalPositionOfPlaces.find(
                (place) => place.id === elementId,
            )!.x;

            const originalY = this._originalPositionOfPlaces.find(
                (place) => place.id === elementId,
            )!.y;

            //Setzt neue Koordinaten des Place im Graphen
            movedPlace.x = originalX + xTranslate;
            movedPlace.y = originalY + yTranslate;
            //Aktualisiert zugehörige Arcs
            this.updateArcs();
        }
        //Wenn Element schon einmal bewegt wurde
        else {
            const lastX = this._lastPositionOfPlaces.find(
                (place) => place.id === elementId,
            )!.x;

            const lastY = this._lastPositionOfPlaces.find(
                (place) => place.id === elementId,
            )!.y;

            //Setzt neue Koordinaten des Place im Graphen
            movedPlace.x = lastX + xTranslate;
            movedPlace.y = lastY + yTranslate;
            //Aktualisiert zugehörige Arcs
            this.updateArcs();
        }
    }

    updateTransitionPosition(
        movedTransition: Transition,
        elementId: string,
        xTranslate: number,
        yTranslate: number,
    ) {
        //Wenn Element noch nicht bewegt wurde
        if (
            this._allMovedTransitions.filter(
                (transition) => transition[0] === movedTransition.id,
            ).length === 0
        ) {
            const originalX = this._originalPositionOfTransitions.find(
                (transition) => transition.id === elementId,
            )!.x;

            const originalY = this._originalPositionOfTransitions.find(
                (transition) => transition.id === elementId,
            )!.y;

            //Setzt neue Koordinaten der Transition im Graphen
            movedTransition.x = originalX + xTranslate;
            movedTransition.y = originalY + yTranslate;
            //Aktualisiert zugehörige Arcs
            this.updateArcs();
        }
        //Wenn Element schon mal bewegt wurde
        else {
            const lastX = this._lastPositionOfTransitions.find(
                (transition) => transition.id === elementId,
            )!.x;

            const lastY = this._lastPositionOfTransitions.find(
                (transition) => transition.id === elementId,
            )!.y;

            //Setzt neue Koordinaten der Transition im Graphen
            movedTransition.x = lastX + xTranslate;
            movedTransition.y = lastY + yTranslate;
            //Aktualisiert zugehörige Arcs
            this.updateArcs();
        }
    }

    updateBoxPosition(
        movedBox: Box,
        elementId: string,
        xTranslate: number,
        yTranslate: number,
    ) {
        //Wenn Element noch nicht bewegt wurde
        if (
            this._allMovedBoxes.filter((box) => box[0] === movedBox.id)
                .length === 0
        ) {
            const originalX = this._originalPositionOfBoxes.find(
                (box) => box.id === elementId,
            )!.x;

            const originalY = this._originalPositionOfBoxes.find(
                (box) => box.id === elementId,
            )!.y;

            //Setzt neue Koordinaten der Transition im Graphen
            movedBox.x = originalX + xTranslate;
            movedBox.y = originalY + yTranslate;
            //Aktualisiert zugehörige Arcs
            this.updateArcs();
        }
        //Wenn Element schon mal bewegt wurde
        else {
            const lastX = this._lastPositionOfBoxes.find(
                (box) => box.id === elementId,
            )!.x;

            const lastY = this._lastPositionOfBoxes.find(
                (box) => box.id === elementId,
            )!.y;

            //Setzt neue Koordinaten der Transition im Graphen
            movedBox.x = lastX + xTranslate;
            movedBox.y = lastY + yTranslate;
            //Aktualisiert zugehörige Arcs
            this.updateArcs();
        }
    }

    updateDFGElementsPosition(
        boxId: string,
        xTranslate: number,
        yTranslate: number,
    ) {
        const activitiesToMove = this._activities.filter(
            (activity) => activity.dfgId === boxId,
        );

        const arcsToMove = this._boxArcs.filter(
            (boxArc) => (boxArc.start as Activity).dfgId === boxId,
        );

        activitiesToMove.forEach((activity) => {
            this.updateActivityPosition(
                activity,
                activity.id,
                activity.dfgId,
                xTranslate,
                yTranslate,
            );
            this.updateAllMovedActivities(activity.id, activity.dfgId);
        });
    }

    updateAllMovedActivities(activityID: string, dfgId: string) {
        const activityEntry = this._allMovedActivities.filter(
            (activity) => activity[0] === activityID && activity[1] === dfgId,
        );

        if (activityEntry.length === 0) {
            this._allMovedActivities.push([activityID, dfgId]);
        }
    }

    updateAllMovedPlaces(placeID: string) {
        const placeEntry = this._allMovedPlaces.filter(
            (place) => place[0] === placeID,
        );

        if (placeEntry.length === 0) {
            this._allMovedPlaces.push([placeID]);
        }
    }

    updateAllMovedTransitions(transitionId: string) {
        const transitionEntry = this._allMovedTransitions.filter(
            (transition) => transition[0] === transitionId,
        );

        if (transitionEntry.length === 0) {
            this._allMovedTransitions.push([transitionId]);
        }
    }

    updateAllMovedBoxes(boxId: string) {
        const boxEntry = this._allMovedBoxes.filter((box) => box[0] === boxId);

        if (boxEntry.length === 0) {
            this._allMovedBoxes.push([boxId]);
        }
    }

    updateLastPositionOfActivity(
        activityId: string,
        dfgId: string,
        newX: number,
        newY: number,
    ) {
        const entryCurrentActivity = this._lastPositionOfActivities.find(
            (activity) =>
                activity.id === activityId && activity.dfgId === dfgId,
        );

        //Aktualisiert letzte Position der Activity
        if (entryCurrentActivity) {
            entryCurrentActivity.x = newX;
            entryCurrentActivity.y = newY;
        }
    }

    updateLastPositionOfActivityWhenMovingBox(
        activityId: string,
        dfgId: string,
        xTranslate: number,
        yTranslate: number,
    ) {
        const entryCurrentActivity = this._lastPositionOfActivities.find(
            (activity) =>
                activity.id === activityId && activity.dfgId === dfgId,
        );

        //Aktualisiert letzte Position der Activity
        if (entryCurrentActivity) {
            entryCurrentActivity.x = entryCurrentActivity.x + xTranslate;
            entryCurrentActivity.y = entryCurrentActivity.y + yTranslate;
        }
    }

    updateLastPositionOfElement(
        elementId: string,
        elementType: string,
        newX: number,
        newY: number,
    ) {
        if (elementType === 'place') {
            const entryCurrentPlace = this._lastPositionOfPlaces.find(
                (place) => place.id === elementId,
            );

            //Aktualisiert letzte Position des Places
            if (entryCurrentPlace) {
                entryCurrentPlace.x = newX;
                entryCurrentPlace.y = newY;
            }
        }

        if (elementType === 'transition') {
            const entryCurrentTransition = this._lastPositionOfTransitions.find(
                (transition) => transition.id === elementId,
            );

            //Aktualisiert letzte Position des Places
            if (entryCurrentTransition) {
                entryCurrentTransition.x = newX;
                entryCurrentTransition.y = newY;
            }
        }

        if (elementType === 'box') {
            const entryCurrentBox = this._lastPositionOfBoxes.find(
                (box) => box.id === elementId,
            );

            //Aktualisiert letzte Position der Box
            if (entryCurrentBox) {
                entryCurrentBox.x = newX;
                entryCurrentBox.y = newY;
            }

            this.positionForActivitiesService.passBoxObjects(this.boxes);
        }
    }

    updateLastPositionOfDFGElements(
        boxId: string,
        xTranslate: number,
        yTranslate: number,
    ) {
        const activitiesToMove = this._activities.filter(
            (activity) => activity.dfgId === boxId,
        );

        const arcsToMove = this._boxArcs.filter(
            (boxArc) => (boxArc.start as Activity).dfgId === boxId,
        );

        activitiesToMove.forEach((activity) => {
            this.updateLastPositionOfActivityWhenMovingBox(
                activity.id,
                activity.dfgId,
                xTranslate,
                yTranslate,
            );
        });
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
        this.contextMenuService.showAt(event.clientX, event.clientY);
    }

    onMenuClose() {
        this.contextMenuService.hide();
    }
}
