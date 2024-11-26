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

        this.nacharbeitKoordinaten(nodes, edges);

        this._graph$.next({ nodes: nodes, edges: edges });
    }

    public nacharbeitKoordinaten(nodes: Array<Node>, edges: Array<Edge>) {
        let runAgain: boolean;
        let index: number = 1;

        do {
            runAgain = false;
            nodes.forEach((element) => {
                console.log('########## start #############');
                console.log('Node: ' + element.id);
                // console.log('############ anfang #############');
                // console.log(
                //     this.pruefeUeberschneidungNodeAufNode(element, nodes),
                // );
                // console.log(
                //     this.pruefeUeberschneidungNodeAufEdge(element, edges),
                // );
                // console.log('########### ende ##############');

                if (
                    this.pruefeUeberschneidungNodeAufNode(element, nodes) ||
                    this.pruefeUeberschneidungNodeAufEdge(element, edges)
                ) {
                    //neue Koordinaten setzen
                    element.y += 100;
                    runAgain = true;
                }
                console.log('########## ende #############');
            });

            // console.log('Run again: ' + runAgain);
            // console.log(index + '. Durchlauf');
            // index += 1;
        } while (runAgain);
    }

    private pruefeUeberschneidungNodeAufNode(
        element: Node,
        nodes: Array<Node>,
    ): boolean {
        let ueberschneidendesElement: Node | undefined = nodes.find((node) => {
            node.x === element.x &&
                node.y === element.y &&
                node.id !== element.id;
        });

        // console.log('ueberschneidendesElement');
        // console.log(ueberschneidendesElement);

        return ueberschneidendesElement !== undefined;
    }

    private pruefeUeberschneidungNodeAufEdge(
        element: Node,
        edges: Array<Edge>,
    ): boolean {
        for (const edge of edges) {
            if (
                edge.source.id === element.id ||
                edge.target.id === element.id
            ) {
                break;
            }

            let lambda = this.lambdaBerechnen(element, edge);
            let lotpunkt = this.lotpunktBerechnen(lambda, edge);
            let abstand = this.abstandZwischenZweiPunktenBerechnen(
                lotpunkt,
                element,
            );
            console.log(
                'Vergleich mit Edge ' +
                    edge.source.id +
                    '<->' +
                    edge.target.id +
                    `([${edge.source.x}, ${edge.source.y}] - [${edge.target.x}, ${edge.target.y}])`,
            );
            console.log(`Node: (${element.x},${element.y})`);
            console.log('Abstand: ' + abstand);

            if (abstand < 15) {
                return true;
            }
        }

        return false;
    }

    private lambdaBerechnen(node: Node, edge: Edge): number {
        return (
            (-1 *
                (edge.target.x * (edge.source.x - node.x) +
                    edge.target.y * (edge.source.y - node.y))) /
            (Math.pow(edge.target.x, 2) + Math.pow(edge.target.y, 2))
        );
    }

    private lotpunktBerechnen(lambda: number, edge: Edge): [number, number] {
        return [
            edge.source.x + lambda * edge.target.x,
            edge.source.y + lambda * edge.target.y,
        ];
    }

    private abstandZwischenZweiPunktenBerechnen(
        lotpunkt: [number, number],
        node: Node,
    ): number {
        return Math.sqrt(
            Math.pow(node.x - lotpunkt[0], 2) +
                Math.pow(node.y - lotpunkt[1], 2),
        );
    }
}
