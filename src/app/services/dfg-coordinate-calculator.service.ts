import { Injectable } from '@angular/core';
import { DFG } from '../classes/dfg';
import { Edge, Graph, Vertex } from '../classes/graph';
import { DFGTransition, TransitionToTransitionArc } from '../classes/petri-net';

@Injectable({
    providedIn: 'root',
})
export class DfgCoordinateCalculatorService {
    constructor() {}

    public calculate(dfg: DFG): Graph {
        const graph = new Graph();

        const arcsFromPlay: Set<TransitionToTransitionArc> =
            new Set<TransitionToTransitionArc>();

        const arcsToStop: Set<TransitionToTransitionArc> =
            new Set<TransitionToTransitionArc>();

        dfg.arcs.forEach((arc) => {
            if (arc.start.id === 'play') {
                arcsFromPlay.add(arc);
            }

            if (arc.end.id === 'stop') {
                arcsToStop.add(arc);
            }
        });

        // Easy graph drawing...
        // For each transition which is directly connected to 'play' we add 100px offeset for y-axis
        // We use 'yOffset' from the follow for each for offset calculation
        let xOffset = 0;
        let yOffset = 0;
        arcsFromPlay.forEach((arc) => {
            xOffset = 1;
            yOffset++;
            let nextArc: TransitionToTransitionArc | undefined = arc;
            let nextArc2: TransitionToTransitionArc | undefined;

            do {
                const v1: Vertex = graph.getAndAddVertex(
                    this.createVertex(
                        nextArc.start,
                        xOffset * 100,
                        yOffset * 100,
                    ),
                );
                xOffset++;

                const v2: Vertex = graph.getAndAddVertex(
                    this.createVertex(
                        nextArc.end,
                        xOffset * 100,
                        yOffset * 100,
                    ),
                );
                xOffset++;

                const e1: Edge = graph.getAndAddEdge(this.createEdge(v1, v2));

                nextArc2 = this.getNextArc(dfg.arcs, nextArc);
                if (nextArc2 !== undefined) {
                    nextArc = nextArc2;
                }
            } while (nextArc2 !== undefined);
        });

        return graph;
    }

    private createVertex(
        transition: DFGTransition,
        x: number,
        y: number,
    ): Vertex {
        return new Vertex(transition.id, transition.name, x, y);
    }

    private createEdge(startVertex: Vertex, stopVertex: Vertex): Edge {
        return new Edge(
            `${startVertex.id}:${stopVertex.id}`,
            startVertex,
            stopVertex,
        );
    }

    private getNextArc(
        arcs: Set<TransitionToTransitionArc>,
        currentArc: TransitionToTransitionArc,
    ): TransitionToTransitionArc | undefined {
        let retVal: TransitionToTransitionArc | undefined;

        arcs.forEach((arc) => {
            if (currentArc.end.id === arc.start.id) {
                retVal = arc;
            }
        });

        return retVal;
    }

    private getToEndArc(
        currentEndId: string,
        toEndArcs: Set<TransitionToTransitionArc>,
    ): TransitionToTransitionArc | undefined {
        toEndArcs.forEach((arc) => {
            if (arc.start.id === currentEndId) {
                return arc;
            }

            return undefined;
        });

        return undefined;
    }
}
