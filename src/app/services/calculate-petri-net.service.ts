import { Injectable } from '@angular/core';
import {
    Edge,
    Graph,
    Node,
    PlaceNode,
    PetriNetStackElement,
    BoxNode,
    TransitionNode,
    InvisibleTransitionNode,
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
type Path = { path: string[]; length: number };

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
        const nodes: Array<Node> = this.generateNodes(petriNet);

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
    private generateNodes(petriNet: PetriNet): Array<Node> {
        const nodes: Array<Node> = new Array<Node>();

        const gapX = environment.drawingGrid.gapX;
        const gapY = environment.drawingGrid.gapY;

        let yCoordinate: number = 100;

        if (petriNet.places.isEmpty) {
            return nodes;
        }

        const inputPlace: Place = petriNet.places.input;
        nodes.push(new PlaceNode(inputPlace.id, 100, 100));

        const allPathsWithLength = this.calculatePaths(petriNet).sort(
            (p1, p2) => p2.length - p1.length,
        );

        allPathsWithLength.forEach((pathWithLength, index) => {
            let additionalXOffset: number = 0;
            let xOfLastModeledNode: number = 100;
            yCoordinate += index * gapY;

            let i = 0;
            let j = 1;
            for (let p of pathWithLength.path) {
                let workItem: Place | PetriNetTransition;

                const place: Place | undefined = this.getPlaceById(petriNet, p);
                const petrinetTransition: PetriNetTransition | undefined =
                    this.getPetrinetTransitionById(petriNet, p);

                if (place) {
                    workItem = place;
                } else {
                    workItem = petrinetTransition!;
                }

                const stackElement: PetriNetStackElement = {
                    node: workItem,
                    source_x: xOfLastModeledNode,
                    source_y: 100 + index * gapY,
                    additionalXOffset: additionalXOffset,
                };

                if (
                    this.InsertNewLevel(nodes, stackElement, xOfLastModeledNode)
                ) {
                    yCoordinate = this.biggestYCoodinateOfNodes(nodes) + gapY;
                }

                if (this.IsNodeAlreadyModeled(nodes, stackElement)) {
                    j++;
                    continue;
                }

                const generatedNode: Node = this.createNodeFromStackElement(
                    stackElement,
                    gapX,
                    yCoordinate,
                );

                if (j > 1) {
                    const indexOfCurrentElement =
                        pathWithLength.path.indexOf(p);

                    const previousNode = nodes.find(
                        (n) =>
                            n.id ===
                            pathWithLength.path[indexOfCurrentElement - 1],
                    );

                    if (previousNode) {
                        const previousNodeIsOnLowerLevel =
                            previousNode.y < yCoordinate;
                        const previousNodeIsMoreRight =
                            previousNode.x > generatedNode.x;
                        if (
                            previousNodeIsOnLowerLevel &&
                            previousNodeIsMoreRight
                        ) {
                            generatedNode.x = previousNode.x;
                        }
                    }
                }

                nodes.push(generatedNode);

                xOfLastModeledNode = generatedNode.getXOffset();
                if (generatedNode instanceof BoxNode) {
                    additionalXOffset = (generatedNode as BoxNode).width / 2;
                } else {
                    additionalXOffset = 0;
                }

                i++;
                j++;
            }

            i = 0;
        });

        return nodes;
    }

    private getPlaceById(
        petriNet: PetriNet,
        placeId: string,
    ): Place | undefined {
        try {
            return petriNet.places.getPlaceByID(placeId);
        } catch (error) {
            return undefined;
        }
    }

    private getPetrinetTransitionById(
        petriNet: PetriNet,
        transitionId: string,
    ): PetriNetTransition | undefined {
        try {
            return petriNet.transitions.getTransitionByID(transitionId);
        } catch (error) {
            return undefined;
        }
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
                dfg.eventLog.toString(),
            );
        }

        if (stackElement.node instanceof Transition) {
            const transition = stackElement.node as Transition;
            if (transition.name === '') {
                return new InvisibleTransitionNode(
                    transition.id,
                    stackElement.source_x +
                        gapX +
                        stackElement.additionalXOffset,
                    yCoordinate,
                    transition.name,
                );
            }
            return new TransitionNode(
                transition.id,
                stackElement.source_x + gapX + stackElement.additionalXOffset,
                yCoordinate,
                transition.name,
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
            const nodesReversed = nodes.reverse();
            for (const node of nodesReversed) {
                const haveNodeOverlap = this.checkNodeOverlap(node, nodes);
                if (haveNodeOverlap) {
                    node.addYOffset(gapY);
                    nodeWasMoved = true;
                    continue;
                }

                const haveEdgeOverlap = this.checkEdgeOverlap(node, edges);
                if (haveEdgeOverlap) {
                    node.addYOffset(gapY);
                    nodeWasMoved = true;
                }
            }
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
                const isOutside = (node as BoxNode).isNodeOutsideOfBox(n);
                if (!isOutside) {
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

    private calculatePaths(petriNet: PetriNet): Path[] {
        type NeighbourWithLength = { nodeId: string; length: number };
        type InnerGraph = { [key: string]: NeighbourWithLength[] };
        type StackElement = {
            nodeId: string;
            path: NeighbourWithLength[];
            visitCount: { [key: string]: number };
        };
        let innerGraph: InnerGraph = {};

        petriNet.places.getAllPlaces().forEach((place) => {
            if (place.id === 'output') {
                return;
            }

            const neighboursWithLength: NeighbourWithLength[] = [];
            petriNet.arcs.getNextTransitions(place).forEach((pnt) => {
                if (pnt instanceof Dfg) {
                    const longestPathLength = (pnt as Dfg).longestPath;
                    neighboursWithLength.push({
                        nodeId: pnt.id,
                        length: longestPathLength,
                    });
                } else {
                    neighboursWithLength.push({ nodeId: pnt.id, length: 1 });
                }
            });
            innerGraph[place.id] = neighboursWithLength;
        });

        petriNet.transitions.getAllTransitions().forEach((pnt) => {
            const neighboursWithLength: NeighbourWithLength[] = petriNet.arcs
                .getNextPlaces(pnt)
                .map((place) => {
                    return { nodeId: place.id, length: 1 };
                });
            innerGraph[pnt.id] = neighboursWithLength;
        });

        const allPaths: Array<Path> = [];

        const stack: StackElement[] = [
            {
                nodeId: 'input',
                path: [{ nodeId: 'input', length: 1 }],
                visitCount: { ['input']: 1 },
            },
        ];

        while (stack.length > 0) {
            const stackElement: StackElement = stack.pop()!;

            if (stackElement.nodeId === 'output') {
                const length = stackElement.path
                    .map((e) => e.length)
                    .reduce((a, b) => a + b);

                const path = stackElement.path.map((e) => e.nodeId);
                allPaths.push({ path: [...path], length: length });
                continue;
            }

            innerGraph[stackElement.nodeId].forEach((neighbourWithLength) => {
                const visits =
                    stackElement.visitCount[neighbourWithLength.nodeId] || 0;

                if (visits < 2) {
                    const newVisitCount = {
                        ...stackElement.visitCount,
                        [neighbourWithLength.nodeId]: visits + 1,
                    };

                    const pathElement: NeighbourWithLength = {
                        nodeId: neighbourWithLength.nodeId,
                        length: neighbourWithLength.length,
                    };

                    stack.push({
                        nodeId: neighbourWithLength.nodeId,
                        path: [...stackElement.path, pathElement],
                        visitCount: newVisitCount,
                    });
                }
            });
        }

        allPaths.forEach((p) => p.path.shift());
        return allPaths;
    }
}
