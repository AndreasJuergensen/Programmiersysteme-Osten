import { Injectable } from '@angular/core';
import { Dfg } from '../classes/dfg/dfg';
import { Activities, Activity } from '../classes/dfg/activities';
import { DrawingAreaComponent } from '../components/drawing-area';
import { BehaviorSubject, last, Observable } from 'rxjs';
import { Graph, Node, Edge, StackElement } from '../classes/graph';

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

    private biggestYinNode(nodes: Node[]) {
        const nodes2: Array<number> = nodes.map((node) => node.y);
        return Math.max(...nodes2);
    }

    public calculateCoordinates(dfg: Dfg): void {
        const nodes: Array<Node> = [];
        const edges: Array<Edge> = [];

        let yCoordinate: number = 100;
        let lastX: number = 100;

        const playActivity: Activity = dfg.activities.getActivityByName('play');
        nodes.push({ id: playActivity.name, x: 100, y: 100 });
        const neighbours: Activities =
            dfg.arcs.calculateNextActivities(playActivity);

        /*
        Die Koordinaten des DFG werden mittels Tiefensuche von Graphen (DFS) die Koordinaten berechnet.
        Der Stack enthält dabei die Elemente des Graphen, die schon gefunden wurden, deren Koordinanten aber noch berechnet werden müssen.
        */
        const stack: Array<StackElement> = neighbours.activities.map(
            (neighbour) => {
                return { activity: neighbour, source_x: 100, source_y: 100 };
            },
        );

        while (stack.length > 0) {
            const stackElement: StackElement = stack.pop()!;
            if (
                nodes.find((node) => node.id === 'stop') !== undefined &&
                lastX > stackElement.source_x
            ) {
                yCoordinate = this.biggestYinNode(nodes) + 100;
            }

            if (
                nodes.find((node) => node.id === stackElement.activity.name) ===
                undefined
            ) {
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
                    ...neighbours.activities.map((neighbour) => {
                        return {
                            activity: neighbour,
                            source_x: activityAsNode.x,
                            source_y: activityAsNode.y,
                        };
                    }),
                );
                lastX = activityAsNode.x;
            }
        }

        dfg.arcs.arcs.forEach((arc) => {
            const startNode: Node = nodes.find(
                (node) => arc.getStart().name === node.id,
            )!;
            const endNode: Node = nodes.find(
                (node) => arc.getEnd().name === node.id,
            )!;

            edges.push({ source: startNode, target: endNode });
        });

        this._graph$.next({ nodes: nodes, edges: edges });
    }
}
