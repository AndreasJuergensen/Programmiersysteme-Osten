import { Injectable } from '@angular/core';
import { Dfg } from '../classes/dfg/dfg';
import { Activities, Activity } from '../classes/dfg/activities';
import { DrawingAreaComponent } from '../components/drawing-area';
import { BehaviorSubject, last, Observable } from 'rxjs';

export interface Graph {
    nodes: Node[];
    edges: Edge[];
}

export interface Node {
    id: string;
    x: number;
    y: number;
}

interface Edge {
    source: Node;
    target: Node;
}

interface StackElement {
    activity: Activity;
    source_x: number;
    source_y: number;
}

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
        //const map: Map<String, Array<Number>> = new Map();
        //const graphStack = this.createGraphStack(dfg);
        const nodes: Array<Node> = [];
        let yCoordinate: number = 100;

        const playActivity: Activity = dfg.activities.getActivityByName('play');
        nodes.push({ id: playActivity.name, x: 100, y: 100 });
        const neighbours: Activities =
            dfg.arcs.calculateNextActivities(playActivity);

        const stack: Array<StackElement> = neighbours.activities.map(
            (neighbour) => {
                return { activity: neighbour, source_x: 100, source_y: 100 };
            },
        );

        let lastX: number = 100;

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

        const edges: Array<Edge> = [];

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
        console.log(dfg.arcs);
        console.log(edges);
        console.log(nodes);

        // console.log(graphStack);

        // let lastX = 10;
        // let lastY = 10;
        // let stack = [];

        // graphStack.forEach((neighbour, activity) => {
        //     if (activity == 'play') {
        //         map.set(activity, [lastX, lastY]);
        //         let neighbourSize = neighbour.length;
        //         lastX = lastX + 10;
        //         //queue.push(neighbour);

        //         neighbour.forEach((neighbour1, index) => {
        //             map.set(neighbour1.name, [
        //                 lastX,
        //                 lastY + lastY * (index / neighbourSize),
        //             ]);
        //         });
        //     }

        //     // while (queue.length != 0) {

        //     // }
        //     // } else if (activity != 'stop') {
        //     //     console.log(activity);
        //     //     console.log('letzes X: ' + lastX);
        //     //     if (!map.has(activity)) {
        //     //         map.set(activity, [lastX, lastY]);
        //     //         let neighbourSize = neighbour.length;
        //     //         lastX = lastX + 10;

        //     //         neighbour.forEach((neighbour1, index) => {
        //     //             map.set(neighbour1.name, [
        //     //                 lastX,
        //     //                 lastY + lastY * (index / neighbourSize),
        //     //             ]);
        //     //         });
        //     //     }
        //     //     lastX = lastX + 10;
        //     // }

        //     lastX = lastX + 10;

        // lastX = newX
        // });

        // return map;
    }

    public createGraphStack(dfg: Dfg): Map<String, Array<Activity>> {
        const graphStack = new Map<String, Array<Activity>>();

        dfg.activities.activities.forEach((act) => {
            graphStack.set(act.name, []);

            const neighbours: Activities =
                dfg.arcs.calculateNextActivities(act);

            neighbours.activities.forEach((act2) => {
                graphStack.get(act.name)?.push(act2);
            });
        });

        return graphStack;
    }
}
