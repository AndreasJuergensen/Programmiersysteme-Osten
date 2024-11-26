import { Injectable } from '@angular/core';
import { Dfg } from '../classes/dfg/dfg';
import { Activities, Activity } from '../classes/dfg/activities';
import { BehaviorSubject, Observable } from 'rxjs';
import { Graph, Node, Edge, StackElement } from '../classes/graph';
import { DfgArc } from '../classes/dfg/arcs';

@Injectable({
    providedIn: 'root',
})
export class CalculateCoordinatesService {
    constructor() {}

    private readonly _graph$: BehaviorSubject<Graph> =
        new BehaviorSubject<Graph>({ nodes: [], edges: [] });

    get graph$(): Observable<Graph> {
        return this._graph$.asObservable();
    }

    public calculateCoordinates(dfg: Dfg): void {
        // Stage 1
        const nodes: Array<Node> = this.generateNodes(dfg);
        const dfgArcs: Array<DfgArc> = dfg.arcs.getArcs();
        const edges: Array<Edge> = this.generateEdges(nodes, dfgArcs);

        // Stage 2
        this.recalculateCoordinatesForOverlaps(nodes, edges);

        // Publish calculated graph
        this._graph$.next({ nodes: nodes, edges: edges });
    }

    /**
     * Calculate coordinates of nodes with DFS
     * @param {Dfg} dfg - Dfg for which nodes are calculated
     * @returns {Array<Node>} Return an array of generated nodes
     */
    private generateNodes(dfg: Dfg): Array<Node> {
        const nodes: Array<Node> = new Array<Node>();

        let yCoordinate: number = 100;
        let xOfLastModeledNode: number = 100;

        const playActivity: Activity = dfg.activities.getActivityByName('play');
        nodes.push({ id: playActivity.name, x: 100, y: 100 });
        const neighbours: Activities =
            dfg.arcs.calculateNextActivities(playActivity);

        // Put all neighbours of start activity into stack with the coordinates
        // of the start activity.
        const stack: Array<StackElement> = neighbours
            .getAllActivites()
            .map((neighbour) => {
                return { activity: neighbour, source_x: 100, source_y: 100 };
            });

        while (stack.length > 0) {
            const stackElement: StackElement = stack.pop()!;
            if (this.InsertNewLevel(nodes, stackElement, xOfLastModeledNode)) {
                yCoordinate = this.biggestYCoodinateOfNodes(nodes) + 100;
            }

            if (this.IsNodeAlreadyModeled(nodes, stackElement)) {
                continue;
            }

            const activityAsNode = {
                id: stackElement.activity.name,
                x: stackElement.source_x + 100,
                y: yCoordinate,
            };
            nodes.push(activityAsNode);

            const neighbours: Activities = dfg.arcs.calculateNextActivities(
                stackElement.activity,
            );

            stack.push(
                ...neighbours.getAllActivites().map((neighbour) => {
                    return {
                        activity: neighbour,
                        source_x: activityAsNode.x,
                        source_y: activityAsNode.y,
                    };
                }),
            );
            xOfLastModeledNode = activityAsNode.x;
        }

        return nodes;
    }

    /**
     *
     * @param {Array<Node>} nodes - Already calculated nodes
     * @param {StackElement} stackElement - Current node from stack
     * @param {number} xOfLastModeledNode - X-Value of last modeled node
     * @returns {boolean} Return true if we have to insert a new level
     */
    private InsertNewLevel(
        nodes: Array<Node>,
        stackElement: StackElement,
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
     * @param {StackElement} stackElement - StackElement which is tested
     * @returns {boolean} Returns true if node is already modeled
     */
    private IsNodeAlreadyModeled(
        nodes: Array<Node>,
        stackElement: StackElement,
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

            edges.push({ source: startNode, target: endNode });
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
        let nodeWasMoved: boolean;

        do {
            nodeWasMoved = false;
            nodes.forEach((node) => {
                if (
                    this.checkNodeOverlap(node, nodes) ||
                    this.checkEdgeOverlap(node, edges)
                ) {
                    node.y += 100;
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
            if (n.x === node.x && n.y === node.y && n.id !== node.id) {
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
            if (this.NodeBelongsToEdge(edge, node)) {
                continue;
            }

            if (this.IsEdgeAndNodeOnSameHorizontalLevel(edge, node)) {
                if (this.IsNodeOnEdgeOnSameHorizontalLevel(edge, node)) {
                    return true;
                } else {
                    continue;
                }
            }

            let distance = this.calculateDistanceBetweenNodeAndEdge(edge, node);
            if (0 < distance && distance < 15) {
                return true;
            }
        }

        return false;
    }

    /**
     *
     * @param {Edge} edge - The edge for which the check is performed
     * @param {Node} node - The node which is tested
     * @returns {boolean} True if node is start or target
     */
    private NodeBelongsToEdge(edge: Edge, node: Node): boolean {
        return edge.source.id === node.id || edge.target.id === node.id;
    }

    /**
     *
     * @param {Edge} edge - The edge for which the check is performed
     * @param {Node} node - The node which is tested
     * @returns {boolean} True if on same horizontal level
     */
    private IsEdgeAndNodeOnSameHorizontalLevel(
        edge: Edge,
        node: Node,
    ): boolean {
        return edge.source.y === node.y && edge.target.y === node.y;
    }

    /**
     *
     * @param {Edge} edge - The edge for which the check is performed
     * @param {Node} node - The node which is tested
     * @returns {boolean} True if node is on edge
     */
    private IsNodeOnEdgeOnSameHorizontalLevel(edge: Edge, node: Node): boolean {
        return node.x < edge.target.x && node.x > edge.source.x;
    }

    /**
     *
     * @param {Edge} edge - The edge for which the distance is calculated
     * @param {Node} node - The node for which the distance is calculated
     * @returns {number} The distance between the given edge and node
     */
    private calculateDistanceBetweenNodeAndEdge(
        edge: Edge,
        node: Node,
    ): number {
        let coefficients =
            this.calculateCanoncialLinearEquationCoefficients(edge);

        let a = coefficients[0];
        let b = coefficients[1];
        let c = coefficients[2];

        return (
            Math.abs(a * node.x + b * node.y + c) /
            Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
        );
    }

    /**
     * Calculates the coefficients of the canonical linear equation ax + by + c = 0.
     * @param {Edge} edge - The edge to calculate the coefficients for
     * @returns {[number, number, number]} Tuple of coefficients
     */
    private calculateCanoncialLinearEquationCoefficients(
        edge: Edge,
    ): [number, number, number] {
        let gradient =
            (edge.target.y - edge.source.y) / (edge.target.x - edge.source.x);

        let yAxisPoint = edge.source.y - gradient * edge.source.x;

        return [gradient, -1, yAxisPoint];
    }
}
