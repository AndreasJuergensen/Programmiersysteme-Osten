import { Injectable } from '@angular/core';
import { Dfg } from '../classes/dfg/dfg';
import { Activity } from '../classes/dfg/activities';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    Graph,
    Node,
    Edge,
    DfgStackElement,
    ActivityNode,
} from '../classes/graph';
import { DfgArc } from '../classes/dfg/arcs';
import { environment } from 'src/environments/environment';

type Path = string[];

@Injectable({
    providedIn: 'root',
})
export class CalculateCoordinatesService {
    constructor() {}

    private readonly _graph$: BehaviorSubject<Graph> =
        new BehaviorSubject<Graph>(new Graph([], []));

    get graph$(): Observable<Graph> {
        return this._graph$.asObservable();
    }

    public calculateCoordinates(
        dfg: Dfg,
        initialXCoordinate: number = 100,
        initialYCoordinate: number = 100,
    ): Graph {
        // Stage 1
        const nodes: Array<Node> = this.generateNodes(
            dfg,
            initialXCoordinate,
            initialYCoordinate,
        );
        const dfgArcs: Array<DfgArc> = dfg.arcs.getArcs();
        const edges: Array<Edge> = this.generateEdges(nodes, dfgArcs);

        // Stage 2
        this.recalculateCoordinatesForOverlaps(nodes, edges);

        return new Graph(nodes, edges);
    }

    /**
     * Calculate coordinates of nodes with DFS
     * @param {Dfg} dfg - Dfg for which nodes are calculated
     * @returns {Array<Node>} Return an array of generated nodes
     */
    private generateNodes(
        dfg: Dfg,
        initialXCoordinate: number,
        initialYCoordinate: number,
    ): Array<Node> {
        const nodes: Array<Node> = new Array<Node>();

        const gapX = environment.drawingGrid.gapX;
        const gapY = environment.drawingGrid.gapY;

        let yCoordinate: number = initialYCoordinate;
        let xOfLastModeledNode: number = initialXCoordinate;

        const playActivity: Activity = dfg.activities.getActivityByName('play');
        nodes.push(
            new ActivityNode(
                playActivity.name,
                initialXCoordinate,
                initialYCoordinate,
            ),
        );

        const paths = this.calculatePaths(dfg).sort(
            (p1, p2) => p2.length - p1.length,
        );

        paths.forEach((path, index) => {
            yCoordinate += index * gapY;

            let i = 1;
            for (let a of path) {
                const activity = dfg.activities.getActivityByName(a);

                const stackElement = {
                    activity: activity,
                    source_x: initialXCoordinate,
                    source_y: initialYCoordinate,
                };

                if (
                    this.InsertNewLevel(nodes, stackElement, xOfLastModeledNode)
                ) {
                    yCoordinate = this.biggestYCoodinateOfNodes(nodes) + gapY;
                }

                if (this.IsNodeAlreadyModeled(nodes, stackElement)) {
                    continue;
                }

                const activityAsNode = new ActivityNode(
                    stackElement.activity.name,
                    stackElement.source_x + i * gapX,
                    yCoordinate,
                );
                nodes.push(activityAsNode);

                xOfLastModeledNode = activityAsNode.x;

                i++;
            }

            i = 1;
        });

        return nodes;
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
        stackElement: DfgStackElement,
        xOfLastModeledNode: number,
    ): boolean {
        return (
            nodes.find((node) => node.id === 'stop') !== undefined &&
            xOfLastModeledNode > stackElement.source_x
        );
    }

    /**
     *
     * @param {Array<Node>} nodes - Already calculated nodes
     * @param {DfgStackElement} stackElement - StackElement which is tested
     * @returns {boolean} Returns true if node is already modeled
     */
    private IsNodeAlreadyModeled(
        nodes: Array<Node>,
        stackElement: DfgStackElement,
    ): boolean {
        return (
            nodes.find((node) => node.id === stackElement.activity.name) !==
            undefined
        );
    }

    /**
     * Return the biggest y-coordinate of an array of nodes.
     * @param {Array<Node>} nodes - Nodes with coordinates
     * @returns {number} The maximum y-coordinate
     */
    private biggestYCoodinateOfNodes(nodes: Array<Node>): number {
        return Math.max(...nodes.map((node) => node.y));
    }

    /**
     *
     * @param {Array<Node>} nodes - Nodes with calculated coordinates
     * @param {Array<DfgArc} dfgArcs - Arcs for which edges have to be generated
     * @returns {Array<Edge>} Returns array of generated edges by arcs
     */
    private generateEdges(
        nodes: Array<Node>,
        dfgArcs: Array<DfgArc>,
    ): Array<Edge> {
        const edges: Array<Edge> = new Array<Edge>();
        dfgArcs.forEach((arc) => {
            const startNode: Node = nodes.find(
                (node) => arc.getStart().name === node.id,
            )!;
            const endNode: Node = nodes.find(
                (node) => arc.getEnd().name === node.id,
            )!;

            edges.push(new Edge(startNode, endNode));
        });

        return edges;
    }

    /**
     * Moves nodes on y-axis if an overlap between node and node or node and edge exists.
     * @param {Array<Node>} nodes Array of all nodes with calculated coordinates
     * @param {Array<Edge>} edges Array of all edges
     */
    public recalculateCoordinatesForOverlaps(
        nodes: Array<Node>,
        edges: Array<Edge>,
    ) {
        const gapY = environment.drawingGrid.gapY;

        let nodeWasMoved: boolean;

        do {
            nodeWasMoved = false;
            nodes.reverse().forEach((node) => {
                if (
                    this.checkNodeOverlap(node, nodes) ||
                    this.checkEdgeOverlap(node, edges)
                ) {
                    node.addYOffset(gapY);
                    nodeWasMoved = true;
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

    private calculatePaths(dfg: Dfg): Path[] {
        type InnerGraph = { [key: string]: string[] };
        let innerGraph: InnerGraph = {};
        dfg.activities.getAllActivites().forEach((a) => {
            if (a.name === 'stop') {
                return;
            }

            const nextActiviites = dfg.arcs.calculateNextActivities(a);
            const neighbours: string[] = nextActiviites
                .getAllActivites()
                .map((nextActivity) => nextActivity.name);
            innerGraph[a.name] = neighbours;
        });

        const allPaths: Path[] = [];

        const stack: {
            node: string;
            path: string[];
            visitCount: { [key: string]: number };
        }[] = [{ node: 'play', path: ['play'], visitCount: { ['play']: 1 } }];

        while (stack.length > 0) {
            const { node, path, visitCount } = stack.pop()!;

            // Wenn der Zielknoten erreicht ist, speichern wir den aktuellen Pfad
            if (node === 'stop') {
                allPaths.push([...path]);
            } else {
                // Besuche alle Nachbarn des aktuellen Knotens
                for (const neighbor of innerGraph[node]) {
                    const visits = visitCount[neighbor] || 0;

                    // Erlaube den Besuch eines Knotens maximal zweimal
                    if (visits < 2) {
                        const newVisitCount = {
                            ...visitCount,
                            [neighbor]: visits + 1,
                        };
                        stack.push({
                            node: neighbor,
                            path: [...path, neighbor],
                            visitCount: newVisitCount,
                        });
                    }
                }
            }
        }

        allPaths.forEach((p) => {
            p.shift();
        });
        return allPaths;
    }
}
