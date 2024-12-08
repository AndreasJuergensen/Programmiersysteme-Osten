import { Injectable } from '@angular/core';
import {
    Edge,
    Graph,
    Node,
    PlaceNode,
    DfgStackElement,
    PetriNetStackElement,
    BoxNode,
    TransitionNode,
} from '../classes/graph';
import { BehaviorSubject, Observable } from 'rxjs';
import { Dfg } from '../classes/dfg/dfg';
import { CalculateCoordinatesService } from './calculate-coordinates.service';
import { environment } from 'src/environments/environment';
import { PetriNet } from '../classes/petrinet/petri-net';
import { Place } from '../classes/petrinet/places';
import {
    PetriNetTransition,
    Transition,
} from '../classes/petrinet/petri-net-transitions';

type GraphWithBoxDimension = [Graph, number, number];

@Injectable({
    providedIn: 'root',
})
export class CalculatePetriNetService {
    constructor(
        private calculateCoodinatesService: CalculateCoordinatesService,
    ) {}

    private _dfgGraphsAndBoxes: Map<string, GraphWithBoxDimension> = new Map<
        string,
        GraphWithBoxDimension
    >();

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
        petriNet
            .getAllTransitions()
            .getAllTransitions()
            .forEach((value, key) => {
                if (value instanceof Dfg) {
                    dfgs.push(value);
                }
            });

        // //Schritt 2: Berechne Graphen der DFGs
        // const dfgsAsGraphs: Array<Graph> = dfgs.map((dfg) =>
        //     this.calculateCoodinatesService.calculateCoordinates(dfg),
        // );

        // //Schritt 3: Berechne Größe der DFGs
        // const sizeOfGraphsOfDFGs: Array<[Graph, [number, number]]> =
        //     dfgsAsGraphs.map((dfgAsGraph) => [
        //         dfgAsGraph,
        //         dfgAsGraph.getSize(),
        //     ]);

        //Schritt 2: Berechne Graphen der DFGs und deren Größe
        dfgs.map((dfg) => {
            const dfgAsGraph =
                this.calculateCoodinatesService.calculateCoordinates(dfg);

            const sizeOfGraph = dfgAsGraph.getSize();

            this._dfgGraphsAndBoxes.set(dfg.id, [
                dfgAsGraph,
                sizeOfGraph[0],
                sizeOfGraph[1],
            ]);
        });

        //Schritt 3:
        const nodes: Array<Node> = this.generateNodes(
            petriNet,
            this._dfgGraphsAndBoxes,
        );

        // const edges: Array<Edge> = this.generateEdges(petriNet.arcs);

        // this.recalculateCoordinatesForOverlap(nodes, places, edges);
        const graph = new Graph(nodes, []);
        this._graph$.next(graph);
        return graph;
    }

    /**
     * In dieser Methode werden die Transitions des Petri-Netzes berechnet
     * Allerdings nicht mit den DFGs, sondern mit der Boxen, in denen später die DFGs modelliert werden
     * @param transitions
     * @returns
     */
    private generateNodes(
        petriNet: PetriNet,
        sizeOfGraphsOfDFGs: Map<string, GraphWithBoxDimension>,
    ): Array<Node> {
        const nodes: Array<Node> = new Array<Node>();

        const gapX = environment.drawingGrid.gapX;
        const gapY = environment.drawingGrid.gapY;

        let yCoordinate: number = 100;
        let xOfLastModeledNode: number = 100;

        const inputPlace: Place = petriNet.places.getPlaceByID('input');
        nodes.push(new PlaceNode('input', 100, 100));

        const neighbours: Array<PetriNetTransition> =
            petriNet.arcs.getNextTransitions(inputPlace);

        // Put all neighbours of start activity into stack with the coordinates
        // of the start activity.
        const stack: Array<PetriNetStackElement> = neighbours.map(
            (neighbour) => {
                return {
                    node: neighbour,
                    source_x: 100,
                    source_y: 100,
                };
            },
        );

        while (stack.length > 0) {
            const stackElement: PetriNetStackElement = stack.pop()!;
            if (this.InsertNewLevel(nodes, stackElement, xOfLastModeledNode)) {
                yCoordinate = this.biggestYCoodinateOfNodes(nodes) + gapY;
            }

            if (this.IsNodeAlreadyModeled(nodes, stackElement)) {
                continue;
            }

            const generatedNode: Node = this.createNodeFromStackElement(
                stackElement,
                gapX,
                yCoordinate,
            );
            nodes.push(generatedNode);

            const neighbours: Array<Place | PetriNetTransition> =
                this.getNeighbours(stackElement, petriNet);

            stack.push(
                ...neighbours.map((neighbour) => {
                    return {
                        node: neighbour,
                        source_x: generatedNode.x,
                        source_y: generatedNode.y,
                    };
                }),
            );

            xOfLastModeledNode = generatedNode.getXOffset();
        }

        return nodes;
    }

    private getNeighbours(
        stackElement: PetriNetStackElement,
        petriNet: PetriNet,
    ): Array<Place | PetriNetTransition> {
        if (
            stackElement.node instanceof Dfg ||
            stackElement.node instanceof Transition
        ) {
            return petriNet.arcs.getNextPlaces(stackElement.node);
        }

        return petriNet.arcs.getNextTransitions(stackElement.node);
    }

    private createNodeFromStackElement(
        stackElement: PetriNetStackElement,
        gapX: number,
        yCoordinate: number,
    ): Node {
        if (stackElement.node instanceof Dfg) {
            const dfg = stackElement.node as Dfg;
            const graphWithBoxDimension: GraphWithBoxDimension =
                this._dfgGraphsAndBoxes.get(dfg.id)!;

            const x: number =
                stackElement.source_x + graphWithBoxDimension[1] / 2 + gapX;
            const y: number = yCoordinate + graphWithBoxDimension[2] / 2;
            return new BoxNode(
                dfg.id,
                x,
                y,
                graphWithBoxDimension[1],
                graphWithBoxDimension[2],
            );
        }

        if (stackElement.node instanceof Transition) {
            const transition = stackElement.node as Transition;
            return new TransitionNode(
                transition.id,
                stackElement.source_x + gapX,
                yCoordinate,
            );
        }

        const place = stackElement.node as Place;
        return new PlaceNode(
            place.id,
            stackElement.source_x + gapX,
            yCoordinate,
        );
    }

    /**
     *
     * @param {Array<Node>} nodes - Already calculated nodes
     * @param {DfgStackElement} stackElement - Current node from stack
     * @param {number} xOfLastModeledNode - X-Value of last modeled node
     * @returns {boolean} Return true if we have to insert a new level
     */
    private InsertNewLevel(
        nodes: Array<Node>,
        stackElement: PetriNetStackElement,
        xOfLastModeledNode: number,
    ): boolean {
        return (
            nodes.find((node) => node.id === 'output') !== undefined &&
            xOfLastModeledNode > stackElement.source_x
        );
    }

    /**
     * Return the biggest y-coordinate of an array of nodes.
     * @param {Array<Node>} nodes - Nodes with coordinates
     * @returns {number} The maximum y-coordinate
     */
    private biggestYCoodinateOfNodes(nodes: Array<Node>): number {
        const nodeYs: Array<number> = new Array<number>();

        for (const node of nodes) {
            if (node instanceof BoxNode) {
                const boxNode = node as BoxNode;
                nodeYs.push(boxNode.y + boxNode.height / 2);
                continue;
            }

            nodeYs.push(node.y);
        }

        return Math.max(...nodeYs);
    }

    /**
     *
     * @param {Array<Node>} nodes - Already calculated nodes
     * @param {DfgStackElement} stackElement - StackElement which is tested
     * @returns {boolean} Returns true if node is already modeled
     */
    private IsNodeAlreadyModeled(
        nodes: Array<Node>,
        stackElement: PetriNetStackElement,
    ): boolean {
        return (
            nodes.find((node) => node.id === stackElement.node.id) !== undefined
        );
    }

    // /**
    //  *
    //  * @param places
    //  * @returns
    //  */
    // private generatePlaceNodes(places: Array<Place>): Array<PlaceNode> {
    //     return [];
    // }

    // /**
    //  *
    //  * @param arcs
    //  * @returns
    //  */
    // private generateEdges(
    //     arcs: Array<PetriNetArcs>,
    // ): Array<Edge> {
    //     return [];
    // }

    private recalculateCoordinatesForOverlap(
        transitions: Array<Node>,
        places: Array<Place>,
        edges: Array<Edge>,
    ) {}
}
