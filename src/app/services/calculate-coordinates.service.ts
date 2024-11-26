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

        do {
            runAgain = false;
            nodes.forEach((element) => {
                if (
                    this.pruefeUeberschneidungNodeAufNode(element, nodes) ||
                    this.pruefeUeberschneidungNodeAufEdge(element, edges)
                ) {
                    //neue Koordinaten setzen
                    element.y += 100;
                    runAgain = true;
                }
            });
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

        return ueberschneidendesElement !== undefined;
    }

    private pruefeUeberschneidungNodeAufEdge(
        element: Node,
        edges: Array<Edge>,
    ): boolean {
        for (const edge of edges) {
            //Überprüfung, ob Node die Start- oder Ziel-Node des Arc ist
            if (
                edge.source.id === element.id ||
                edge.target.id === element.id
            ) {
                continue;
            }

            //Überprüfung, ob die Node auf der Geraden liegt, die durch die Arc gebildet wird, soz. Überprüfung auf Abstand 0
            if (edge.source.y === element.y && edge.target.y === element.y) {
                //Überprüfung, ob die Node zwischen dem Start- und End-Punkt der Arc liegt und somit, ob die Node auf der Arc liegt
                if (element.x < edge.target.x && element.x > edge.source.x) {
                    //es muss verschoben werden, da die Node auf dem Arc liegt
                    return true;
                } else {
                    //es muss nicht verschoben werden, da Node nicht auf Arc liegt
                    continue;
                }
            }

            let abstand = this.abstandBerechnen(edge, element);

            // if (abstand < 15) {
            if (abstand < 15 && abstand > 0) {
                //der Abstand ist zu klein, deshalb müssen wir verschieben
                return true;
            }
        }

        return false;
    }

    private abstandBerechnen(edge: Edge, node: Node): number {
        let koeffizienten = this.berechneNormalform(edge);

        let a = koeffizienten[0];
        let b = koeffizienten[1];
        let c = koeffizienten[2];

        return (
            Math.abs(a * node.x + b * node.y + c) /
            Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
        );
    }

    //Die Normalform einer Geraden lautet ax + by + c = 0
    //Die Methode gibt hierbei die Werte für a, b und c in der Form [a,b,c] zurück
    private berechneNormalform(edge: Edge): [number, number, number] {
        //a
        let steigung =
            (edge.target.y - edge.source.y) / (edge.target.x - edge.source.x);

        //c
        let schnittpunktMitYAchse = edge.source.y - steigung * edge.source.x;

        return [steigung, -1, schnittpunktMitYAchse];
    }
}
