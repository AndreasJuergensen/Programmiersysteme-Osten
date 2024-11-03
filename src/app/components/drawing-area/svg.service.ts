import { Injectable } from '@angular/core';
import { Diagram, Element } from './models';
import { Edge, Graph, Vertex } from 'src/app/classes/graph';

@Injectable({
    providedIn: 'root',
})
export class SvgService {
    constructor() {}

    public createSvgElements(diagram: Diagram): Array<SVGElement> {
        const result: Array<SVGElement> = new Array<SVGAElement>();

        diagram.elements.forEach((e) => {
            const newElement = this.createSvgForElement(e);
            result.push(newElement);
        });

        return result;
    }

    private createSvgForElement(element: Element): SVGElement {
        const svg: SVGElement = this.createSvgElement('circle');

        svg.setAttribute('cx', `${element.x}`);
        svg.setAttribute('cy', `${element.y}`);
        svg.setAttribute('r', '25');
        svg.setAttribute('fill', 'black');

        element.registerSvg(svg);

        return svg;
    }

    private createSvgElement(name: string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }

    //-------
    public createSvgElements2(graph: Graph): Array<SVGElement> {
        const svgElements: Array<SVGElement> = new Array<SVGElement>();

        // Vertices
        graph.vertices.forEach((v) => {
            const svgElement = this.createSvgElementForVertex(v);
            svgElements.push(svgElement);
        });

        // Edges
        graph.edges.forEach((e) => {
            const svgElement = this.createSvgElementForEdge(e);
            svgElements.push(svgElement);
        });

        return svgElements;
    }

    private createSvgElementForVertex(vertex: Vertex): SVGElement {
        const svgVertex: SVGElement = this.createSvgElement('circle');
        svgVertex.setAttribute('cx', `${vertex.x}`);
        svgVertex.setAttribute('cy', `${vertex.y}`);
        svgVertex.setAttribute('r', '25');
        svgVertex.setAttribute('fill', 'black');
        vertex.registerSvg(svgVertex);

        // const svgIdentifier: SVGElement = this.createSvgElement('text');
        // svgIdentifier.setAttribute('x', `${vertex.x}`);
        // svgIdentifier.setAttribute('y', `${vertex.y}`);
        // svgIdentifier.setAttribute('fill', 'black');

        return svgVertex;
    }

    private createSvgElementForEdge(edge: Edge): SVGElement {
        const svgEdge: SVGElement = this.createSvgElement('line');
        svgEdge.setAttribute('x1', `${edge.start.x}`);
        svgEdge.setAttribute('y1', `${edge.start.y}`);
        svgEdge.setAttribute('x2', `${edge.end.x}`);
        svgEdge.setAttribute('y2', `${edge.end.y}`);
        svgEdge.setAttribute('stroke', 'black');
        edge.registerSvg(svgEdge);

        return svgEdge;
    }
}
