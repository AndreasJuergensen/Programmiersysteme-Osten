import { Injectable } from '@angular/core';
import { Edge, Graph, Node, PlaceNode } from '../classes/graph';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    PetriNet,
    PetriNetTransition,
    Place,
    PlaceToTransitionArc,
    TransitionToPlaceArc,
} from '../classes/petri-net';
import { Dfg } from '../classes/dfg/dfg';
import { CalculateCoordinatesService } from './calculate-coordinates.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CalculatePetriNetService {
    constructor(
        private calculateCoodinatesService: CalculateCoordinatesService,
    ) {}

    private readonly _graph$: BehaviorSubject<Graph> =
        new BehaviorSubject<Graph>(new Graph([], []));

    get graph$(): Observable<Graph> {
        return this._graph$.asObservable();
    }

    /**
     *
     * @param petriNet
     * @returns
     */
    private calculatePetriNet(petriNet: PetriNet): Graph {
        const dfgs: Array<Dfg> = new Array<Dfg>();

        //Schritt 1: Suche DFGs
        petriNet.transitions.forEach((value, key) => {
            if (value instanceof Dfg) {
                dfgs.push(value);
            }
        });

        //Schritt 2: Berechne Graphen der DFGs
        const dfgsAsGraphs: Array<Graph> = dfgs.map((dfg) =>
            this.calculateCoodinatesService.calculateCoordinates(dfg),
        );

        //Schritt 3: Berechne Größe der DFGs
        const sizeOfGraphsOfDFGs: Array<[Graph, [number, number]]> =
            dfgsAsGraphs.map((dfgAsGraph) => [
                dfgAsGraph,
                dfgAsGraph.getSize(),
            ]);

        //Schritt 4:
        const nodes: Array<Node> = this.generateNodes(
            petriNet,
            sizeOfGraphsOfDFGs,
        );
        const places: Array<Place> = this.generatePlaces(petriNet.places);
        const edges: Array<Edge> = this.generateEdges(petriNet.arcs);

        this.recalculateCoordinatesForOverlap(nodes, places, edges);

        return new Graph([], []);
    }

    /**
     * In dieser Methode werden die Transitions des Petri-Netzes berechnet
     * Allerdings nicht mit den DFGs, sondern mit der Boxen, in denen später die DFGs modelliert werden
     * @param transitions
     * @returns
     */
    private generateNodes(
        petriNet: PetriNet,
        sizeOfGraphsOfDFGs: Array<[Graph, [number, number]]>,
    ): Array<Node> {
        const nodes: Array<Node> = new Array<Node>();

        const gapX = environment.drawingGrid.gapX;
        const gapY = environment.drawingGrid.gapY;

        let yCoordinate: number = 100;
        let xOfLastModeledNode: number = 100;

        const inputPlace: Place = petriNet.getPlaceById('input')!;
        nodes.push(new PlaceNode('input', 100, 100));
        // const neighbours: Activities =
        //     dfg.arcs.calculateNextActivities(playActivity);

        // // Put all neighbours of start activity into stack with the coordinates
        // // of the start activity.
        // const stack: Array<StackElement> = neighbours
        //     .getAllActivites()
        //     .map((neighbour) => {
        //         return {
        //             activity: neighbour,
        //             source_x: 100,
        //             source_y: 100,
        //         };
        //     });

        // while (stack.length > 0) {
        //     const stackElement: StackElement = stack.pop()!;
        //     if (this.InsertNewLevel(nodes, stackElement, xOfLastModeledNode)) {
        //         yCoordinate = this.biggestYCoodinateOfNodes(nodes) + gapY;
        //     }

        //     if (this.IsNodeAlreadyModeled(nodes, stackElement)) {
        //         continue;
        //     }

        //     const activityAsNode = {
        //         id: stackElement.activity.name,
        //         x: stackElement.source_x + gapX,
        //         y: yCoordinate,
        //     };
        //     nodes.push(activityAsNode);

        //     const neighbours: Activities = dfg.arcs.calculateNextActivities(
        //         stackElement.activity,
        //     );

        //     stack.push(
        //         ...neighbours.getAllActivites().map((neighbour) => {
        //             return {
        //                 activity: neighbour,
        //                 source_x: activityAsNode.x,
        //                 source_y: activityAsNode.y,
        //             };
        //         }),
        //     );
        //     xOfLastModeledNode = activityAsNode.x;
        // }

        // return nodes;
        return [];
    }

    /**
     *
     * @param places
     * @returns
     */
    private generatePlaces(places: Set<Place>): Array<Place> {
        return [];
    }

    /**
     *
     * @param arcs
     * @returns
     */
    private generateEdges(
        arcs: Set<PlaceToTransitionArc | TransitionToPlaceArc>,
    ): Array<Edge> {
        return [];
    }

    private recalculateCoordinatesForOverlap(
        transitions: Array<Node>,
        places: Array<Place>,
        edges: Array<Edge>,
    ) {}

    private calculateSizeOfDFG(dfg: Dfg): [number, number] {
        return [0, 0];
    }
}
