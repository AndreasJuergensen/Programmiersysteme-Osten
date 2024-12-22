import { Injectable } from '@angular/core';
import {
    Edge,
    Graph,
    Node,
    PlaceNode,
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
import {
    PlaceToTransitionArc,
    TransitionToPlaceArc,
} from '../classes/petrinet/petri-net-arcs';
import { PetriNetManagementService } from './petri-net-management.service';

type GraphWithBoxDimension = [Graph, number, number, Dfg];

@Injectable({
    providedIn: 'root',
})
export class CalculatePetriNetService {
    constructor(
        private petriNetManagementService: PetriNetManagementService,
        private calculateCoodinatesService: CalculateCoordinatesService,
    ) {
        this.petriNetManagementService.petriNet$.subscribe((petriNet) =>
            this.calculatePetriNet(petriNet),
        );
    }

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
    public calculatePetriNet(petriNet: PetriNet): Graph {
        const dfgs: Array<Dfg> = new Array<Dfg>();

        //Schritt 1: Suche DFGs
        petriNet.transitions.transitions.forEach((value, key) => {
            if (value instanceof Dfg) {
                dfgs.push(value);
            }
        });

        //Schritt 2: Berechne Graphen der DFGs und deren Größe
        dfgs.map((dfg) => {
            const dfgAsGraph =
                this.calculateCoodinatesService.calculateCoordinates(dfg);

            const sizeOfGraph = dfgAsGraph.getSize();

            this._dfgGraphsAndBoxes.set(dfg.id, [
                dfgAsGraph,
                sizeOfGraph[0],
                sizeOfGraph[1],
                dfg,
            ]);
        });

        //Schritt 3:
        const nodes: Array<Node> = this.generateNodes(
            petriNet,
            this._dfgGraphsAndBoxes,
        );

        const arcs: Array<PlaceToTransitionArc | TransitionToPlaceArc> =
            petriNet.arcs.arcs;
        const edges: Array<Edge> = this.generateEdges(nodes, arcs);

        this.movePossibleOutsideBoxesIntoDrawingArea(nodes);

        this.recalculateCoordinatesForOverlap(nodes, edges);

        // Recalculate dfg graph nodes
        this.recalculateDfgCoordinates(nodes, edges).forEach((graph) => {
            nodes.push(...graph.nodes);
            edges.push(...graph.edges);
        });

        const graph = new Graph(nodes, edges);
        this._graph$.next(graph);
        return graph;
    }

    private movePossibleOutsideBoxesIntoDrawingArea(nodes: Array<Node>): void {
        let smallestY: number = 0;
        let upperY: number = 0;

        for (const node of nodes) {
            if (node instanceof BoxNode) {
                const stroke = environment.drawingElements.boxes.strokeWidth;
                const height = (node as BoxNode).height;

                upperY = node.y - (height + stroke) / 2;
            }

            if (node instanceof PlaceNode) {
                const stroke = environment.drawingElements.places.strokeWidth;
                const radius = environment.drawingElements.places.radius;

                upperY = node.y - radius - stroke / 2;
            }

            if (node instanceof TransitionNode) {
                const stroke =
                    environment.drawingElements.transitions.strokeWidth;
                const height = environment.drawingElements.transitions.height;

                upperY = node.y - (height + stroke) / 2;
            }

            if (upperY < smallestY) {
                smallestY = upperY;
            }
        }

        if (smallestY < 0) {
            const offset = Math.abs(smallestY) + 50;
            nodes.forEach((node) => node.addYOffset(offset));
        }
    }

    private recalculateDfgCoordinates(
        nodes: Array<Node>,
        edges: Array<Edge>,
    ): Array<Graph> {
        const boxNodes: Array<BoxNode> = new Array<BoxNode>();

        nodes.forEach((node) => {
            if (node instanceof BoxNode) {
                boxNodes.push(node as BoxNode);
            }
        });

        const graphs: Array<Graph> = new Array<Graph>();

        boxNodes.forEach((node) => {
            const dfg = this._dfgGraphsAndBoxes.get(node.id)?.[3]!;

            const x = node.x - node.width / 2 + 50;
            const y = node.y - node.height / 2 + 50;

            const dfgGraph =
                this.calculateCoodinatesService.calculateCoordinates(dfg, x, y);

            graphs.push(dfgGraph);
        });

        return graphs;
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

        const inputPlace: Place = petriNet.places.input;
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
                    additionalXOffset: 0,
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

            // Each stackelement needs the information about the kind of node
            // If we have a box, we have to add and extra gapX or gapY
            // information because a box is bigger

            let additionalXOffset: number = 0;
            if (generatedNode instanceof BoxNode) {
                additionalXOffset = (generatedNode as BoxNode).width / 2;
            }

            stack.push(
                ...neighbours.map((neighbour) => {
                    return {
                        node: neighbour,
                        source_x: generatedNode.x,
                        source_y: generatedNode.y,
                        additionalXOffset: additionalXOffset,
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
                stackElement.source_x +
                graphWithBoxDimension[1] / 2 +
                gapX +
                stackElement.additionalXOffset;
            const y: number = yCoordinate; // + graphWithBoxDimension[2] / 2;
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
                stackElement.source_x + gapX + stackElement.additionalXOffset,
                yCoordinate,
            );
        }

        const place = stackElement.node as Place;
        return new PlaceNode(
            place.id,
            stackElement.source_x + gapX + stackElement.additionalXOffset,
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

    /**
     *
     * @param arcs
     * @returns
     */
    private generateEdges(
        nodes: Array<Node>,
        arcs: Array<PlaceToTransitionArc | TransitionToPlaceArc>,
    ): Array<Edge> {
        const edges: Array<Edge> = new Array<Edge>();

        arcs.forEach((arc) => {
            const startNode: Node = nodes.find(
                (node) => node.id === arc.start.id,
            )!;
            const endNode: Node = nodes.find((node) => node.id === arc.end.id)!;

            edges.push(new Edge(startNode, endNode));
        });

        return edges;
    }

    private recalculateCoordinatesForOverlap(
        nodes: Array<Node>,
        edges: Array<Edge>,
    ) {
        const gapY = environment.drawingGrid.gapY;

        let nodeWasMoved: boolean;

        do {
            nodeWasMoved = false;
            nodes.forEach((node) => {
                if (this.checkNodeOverlap(node, nodes)) {
                    node.addYOffset(gapY);
                    nodeWasMoved = true;
                }

                if (this.checkEdgeOverlap(node, edges)) {
                    nodeWasMoved = false;
                }
            });
        } while (nodeWasMoved);
    }

    /**
     * Returns true if node overlaps an other node.
     * @param {Node} node - The node for which the check is performed
     * @param {Array<Node>} nodes - Array of all nodes to check node against
     * @returns {boolean} Returns true if node overlaps an other node
     */
    private checkNodeOverlap(node: Node, nodes: Array<Node>): boolean {
        for (const n of nodes) {
            if (node.isNodeOverlapped(n)) {
                return true;
            }

            if (node instanceof BoxNode) {
                if (!(node as BoxNode).isNodeOutsideOfBox(n)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Returns true if edge overlaps a node. This is measured by distance between edge and node.
     * @param {Node} node - The node for which the check is perfomed
     * @param {Array<Edge>} edges - Array of all edges to check the distance against
     * @returns {boolean} Returns true if node must be moved
     */
    private checkEdgeOverlap(node: Node, edges: Array<Edge>): boolean {
        if (node instanceof BoxNode) {
            console.log(node.id);
            for (const edge of edges) {
                if (edge.isNodeStartOrEndNode(node)) {
                    continue;
                }

                if (edge.intersectsBox(node as BoxNode)) {
                    const gapY = environment.drawingGrid.gapY;

                    if (edge.source instanceof BoxNode) {
                        edge.source.addYOffset(gapY);
                    }

                    if (edge.target instanceof BoxNode) {
                        edge.target.addYOffset(gapY);
                    }

                    continue;
                }
            }

            return false;
        }

        for (const edge of edges) {
            if (edge.isNodeStartOrEndNode(node)) {
                continue;
            }

            if (edge.isNodeOnSameHorizontalLevel(node)) {
                if (edge.isNodeOnEdgeAndOnSameHorizontalLevel(node)) {
                    return true;
                } else {
                    continue;
                }
            }

            let distance = edge.distanceToNode(node);
            const width = environment.drawingElements.activities.width;
            const height = environment.drawingElements.activities.height;
            const lengthDiagonal = Math.sqrt(
                Math.pow(width / 2, 2) + Math.pow(height / 2, 2),
            );
            if (0 < distance && distance < Math.ceil(lengthDiagonal)) {
                return true;
            }
        }

        return false;
    }
}
